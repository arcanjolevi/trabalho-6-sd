import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import crypto from "crypto";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      crypto: "crypto",
    },
  },
});
