import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Proxy configuration for API requests
    // During development:
    // - Frontend runs at http://localhost:5173
    // - Backend runs at http://localhost:3000
    // Browsers block requests between different domains/ports for security
    // This proxy setting forwards all "/api/*" requests from frontend to backend:
    // Example: fetch("/api/papers") from frontend → http://localhost:3000/api/papers on backend
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
})
