import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    open: true,
  },
  define: {
    __APP_NAME__: JSON.stringify("litlabstudio"),
  },
});
