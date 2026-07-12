import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // `dist/` is reserved for the library build (`bun run build`, see package.json) — the demo app
  // (this Vite config) builds into its own directory so the two don't clobber each other.
  build: {
    outDir: "demo-dist",
  },
});
