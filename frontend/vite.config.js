import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Detect environment
  const isLocalDev = mode === 'development' && 
                    !process.env.VERCEL && 
                    !process.env.NETLIFY &&
                    !process.env.RENDER
  
  const getServerConfig = () => {
    const baseConfig = {
      port: parseInt(env.PORT) || 3000,
      host: true, // Listen on all addresses
    }
    
    // Only add HTTPS for local development
    if (isLocalDev) {
      const certsExist = fs.existsSync('../certs/localhost-key.pem') && 
                        fs.existsSync('../certs/localhost.pem')
      
      if (certsExist && env.VITE_ENABLE_HTTPS !== 'false') {
        return {
          ...baseConfig,
          https: {
            key: fs.readFileSync('../certs/localhost-key.pem'),
            cert: fs.readFileSync('../certs/localhost.pem'),
          }
        }
      }
    }
    
    return baseConfig
  }
  
  return {
    plugins: [react(), tailwindcss()],
    server: getServerConfig(),
    preview: {
      port: parseInt(env.PORT) || 3000,
      host: true,
    },
    define: {
      // Make env variables available in client code
      'import.meta.env.VITE_APP_MODE': JSON.stringify(mode),
    }
  }
})