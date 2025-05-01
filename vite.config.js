// vite.config.js
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [glsl()],
  server: {
    // This allows access from network devices (like your phone)
    host: "0.0.0.0",
    // Specify a port (e.g., 3000), you can change this number
    port: 3000,
    // Ensures the port is strictly enforced
    strictPort: true,
    // Optional: keeps the server running even if there are errors
    watch: {
      usePolling: true,
    },
  },

});
