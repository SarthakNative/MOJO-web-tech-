import { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("");
  
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/instagram`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/instagram/profile");
        const feedRes = await api.get("/instagram/feed");

        setProfile(profileRes.data);
        setFeed(feedRes.data.data || []);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openComments = async (post) => {
    setSelectedPost(post);
    setComments([]);
    setReplyStatus("");

    try {
      const res = await api.get(`/instagram/comments/${post.id}`);
      setComments(res.data.data || []);
    } catch {
      setComments([]);
    }
  };

  const sendReply = async (commentId) => {
    if (!replyText) return;

    try {
      await api.post(`/instagram/comment/${commentId}/reply`, {
        message: replyText,
      });
      setReplyStatus("Reply sent successfully ✅");
      setReplyText("");
    } catch {
      setReplyStatus("Reply failed ❌");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-[360px] text-center">
          <h1 className="text-2xl font-bold mb-2">Instagram Assignment</h1>
          <p className="text-gray-500 mb-6">
            Login with Instagram to view your profile & feed
          </p>

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold cursor-pointer"
          >
            Login with Instagram
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-6">
          <img
            src={profile.profile_picture_url}
            alt="Profile"
            className="w-24 h-24 rounded-full border"
          />
          <div>
            <h2 className="text-xl font-semibold text-black">{profile.name}</h2>
            <p className="text-gray-500">{profile.media_count} posts</p>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-3 gap-1 sm:gap-3">
        {feed.map((item) => (
          <button
            key={item.id}
            onClick={() => openComments(item)}
            className="relative bg-black"
          >
            {item.media_type === "VIDEO" ? (
              <video
                src={item.media_url}
                className="w-full h-full object-cover"
                muted
              />
            ) : (
              <img
                src={item.media_url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </button>
        ))}
      </div>

      {/* Comments Panel */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-4">
            <h3 className="font-semibold mb-2">Comments</h3>

            {comments.length === 0 && (
              <p className="text-sm text-gray-500 mb-3">
                Comments are restricted in development mode.
              </p>
            )}

            {comments.map((c) => (
              <div key={c.id} className="mb-3">
                <p className="text-sm">
                  <span className="font-medium">{c.username}</span>:{" "}
                  {c.text}
                </p>

                <div className="flex gap-2 mt-1">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Reply..."
                    className="border rounded px-2 py-1 text-sm flex-1"
                  />
                  <button
                    onClick={() => sendReply(c.id)}
                    className="text-sm text-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            ))}

            {replyStatus && (
              <p className="text-xs text-green-600 mt-2">
                {replyStatus}
              </p>
            )}

            <button
              onClick={() => setSelectedPost(null)}
              className="mt-4 text-sm text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
