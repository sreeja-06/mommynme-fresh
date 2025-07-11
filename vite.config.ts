// https://vitejs.dev/config/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.PNG", "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.svg", "**/*.gif"],
});
