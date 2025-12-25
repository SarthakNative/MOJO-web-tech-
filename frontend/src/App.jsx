import { useEffect, useState } from "react";
import api from "./api";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  X, 
  Instagram, 
  Users, 
  UserPlus, 
  Image as ImageIcon,
  Video,
  LogOut,
  Globe,
  Verified
} from "lucide-react";

function App() {
  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("");
  const [activeTab, setActiveTab] = useState("grid");

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/instagram`;
  };

  const handleLogout = async() => {
    await api.post('/auth/logout');
    setProfile(null);
    setFeed([]);
    setSelectedPost(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/instagram/profile");
        const feedRes = await api.get("/instagram/feed");
        
        setProfile(profileRes.data);
        console.log("Profile Response:", profileRes.data);
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
      
      // Refresh comments
      const res = await api.get(`/instagram/comments/${selectedPost.id}`);
      setComments(res.data.data || []);
    } catch {
      setReplyStatus("Reply failed ❌");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-white border-t-purple-500 border-r-pink-500 border-b-orange-400 border-l-transparent animate-spin"></div>
          <Instagram className="absolute inset-0 m-auto w-12 h-12 text-purple-600" />
        </div>
        <p className="mt-6 text-gray-600 font-medium">Loading your Instagram magic...</p>
        <div className="mt-4 flex gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="relative max-w-md w-full">
          {/* Animated background elements */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="flex flex-col items-center">
              {/* Logo */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full blur-lg opacity-60"></div>
                <Instagram className="relative w-16 h-16 text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text" />
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-2">
                Instagram Connect
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Connect your Instagram account to view your profile, posts, and engage with your community
              </p>

              <button
                onClick={handleLogin}
                className="group relative w-full max-w-xs overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-[2px] transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/25"
              >
                <div className="relative rounded-2xl bg-white px-8 py-4 transition-all duration-300 group-hover:bg-transparent cursor-pointer">
                  <span className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent font-semibold text-lg group-hover:text-white cursor-pointer">
                    Login with Instagram
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </button>

              <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>View Profile</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span>Browse Feed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Engage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-lg blur"></div>
                <Instagram className="relative w-8 h-8 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Instagram
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{profile.followers_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  <span className="font-medium">{profile.follows_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <span className="font-medium">{profile.media_count}</span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 transition-all duration-300 group cursor-pointer"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform"/>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200/50 p-8 shadow-lg">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-400/5 to-yellow-500/5 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full p-1 -inset-1 animate-spin-slow">
                <div className="w-full h-full bg-white rounded-full"></div>
              </div>
              <img
                src={profile.profile_picture_url}
                alt={profile.name}
                className="relative w-40 h-40 rounded-full border-4 border-white object-cover shadow-xl"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  {profile.account_type === "MEDIA_CREATOR" && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border border-purple-200">
                      <Verified className="w-4 h-4" />
                      <span className="text-sm font-medium">Creator</span>
                    </span>
                  )}
                </div>
                <span className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-medium">
                  @{profile.username}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.media_count}</div>
                  <div className="text-gray-600 text-sm">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.followers_count.toLocaleString()}</div>
                  <div className="text-gray-600 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profile.follows_count.toLocaleString()}</div>
                  <div className="text-gray-600 text-sm">Following</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">User ID: {profile.user_id}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700">
                  <span className="text-sm font-medium">ID: {profile.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Tabs */}
        <div className="mt-8 flex justify-center gap-2">
          {["grid", "recent", "popular"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {feed.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
            <p className="text-gray-500">Start creating content on Instagram to see it here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
              >
                {/* Media */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {item.media_type === "VIDEO" ? (
                    <>
                      <video
                        src={item.media_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        Video
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.media_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Action Buttons */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <button
                      onClick={() => openComments(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-300 cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5 text-gray-800" />
                      <span className="font-medium text-gray-800">Comments</span>
                    </button>
                  </div>
                </div>

                {/* Post Info */}
                <div className="p-4">
                  {item.caption && (
                    <p className="text-gray-700 line-clamp-2 mb-3">
                      {item.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {/* <span>{item.like_count || 0}</span> */}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {/* <span>{item.comments_count || 0}</span> */}
                      </div>
                    </div>
                    <span className="text-xs">
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                    <img
                      src={profile.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full rounded-full border-2 border-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Comments</h3>
                    <p className="text-sm text-gray-500">@{profile.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPost(null);
                    setReplyText("");
                    setReplyStatus("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 cursor-pointer" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No comments yet</h4>
                  <p className="text-gray-500">Comments are restricted in development mode</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="group relative p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-0.5">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                              {c.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{c.username}</span>
                            <span className="text-xs text-gray-500">
                              {c.timestamp ? new Date(c.timestamp).toLocaleDateString() : 'Just now'}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4">{c.text}</p>
                          
                          {/* Reply Input */}
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <input
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
                                onKeyPress={(e) => e.key === 'Enter' && sendReply(c.id)}
                              />
                              <Send className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            <button
                              onClick={() => sendReply(c.id)}
                              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Message */}
            {replyStatus && (
              <div className={`mx-6 mb-6 p-4 rounded-xl ${
                replyStatus.includes("successfully")
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                  : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    replyStatus.includes("successfully")
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {replyStatus.includes("successfully") ? "✓" : "✗"}
                  </div>
                  <span className="font-medium">{replyStatus}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>Connected as @{profile.username} • Instagram API Integration • {profile.account_type}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;