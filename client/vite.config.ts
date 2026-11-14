import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // three.js and the R3F stack are large and only needed once the
        // viewer mounts — keep them out of the entry chunk.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/three|@react-three/.test(id)) return "three";
            if (/framer-motion/.test(id)) return "motion";
            if (/react-router/.test(id)) return "router";
          }
        },
      },
    },
  },
  // The Express image installs server dependencies only. Bundle the React
  // tree into the SSR entry so it does not require client packages at runtime.
  ssr: {
    noExternal: true,
  },
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://localhost:3000", changeOrigin: true } },
  },
});
