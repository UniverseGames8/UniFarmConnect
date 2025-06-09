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
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          utils: ['date-fns', 'zod', 'zustand'],
          charts: ['recharts', 'd3'],
          animations: ['framer-motion', 'react-spring']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: process.env.VITE_WS_URL || 'ws://localhost:3000',
        ws: true
      }
    }
  },
  optimizeDeps: {
    include: ['@types/node']
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
