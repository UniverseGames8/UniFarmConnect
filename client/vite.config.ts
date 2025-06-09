import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
      "@modules": path.resolve(__dirname, './src/modules'),
      "@core": path.resolve(__dirname, './src/core'),
      "@shared": path.resolve(__dirname, './src/shared'),
      "@pages": path.resolve(__dirname, './src/pages')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          utils: ['date-fns', 'zod', 'zustand']
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true
  },
  optimizeDeps: {
    include: ['@types/node']
  },
  define: {
    // 'process.env': process.env // Удалено ради безопасности
  }
});
