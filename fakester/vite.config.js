import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow LAN
    allowedHosts: ["wedgier-lore-accordingly.ngrok-free.dev"],
  },
});
