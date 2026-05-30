import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Viteの設定。
// ReactとTailwind CSSを有効にする。
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
