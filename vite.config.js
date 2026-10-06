import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths work seamlessly on GitHub Pages
  server: {
    port: 5173,
    open: false
  }
});
