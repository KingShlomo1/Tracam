import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      workbox: {
        // Don't precache the heavy TensorFlow chunk — animal detection needs
        // the network anyway, so keep the offline install lean.
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
        globIgnores: ["**/tfjs-*.js"],
      },
      manifest: {
        name: "Tracam — travel camera",
        short_name: "Tracam",
        description:
          "A soft little travel camera that pins your photos to a map.",
        theme_color: "#f76c6c",
        background_color: "#fff8f8",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep all TensorFlow code in a single, predictably named chunk so
          // the service worker can skip precaching it.
          if (id.includes("@tensorflow") || id.includes("coco-ssd")) {
            return "tfjs";
          }
        },
      },
    },
  },
  server: {
    host: true,
  },
});
