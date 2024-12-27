import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import compress from 'vite-plugin-compression';

export default defineConfig({
  base: '/workiva_technical_project/',
  plugins: [
    react(),
    compress({
      algorithm: 'brotliCompress',
      filter: /\.(js|mjs|json|css|html|wasm)$/i,
      threshold: 1024,
      deleteOriginalAssets: false,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          duckdb: ['@duckdb/duckdb-wasm'],
          vendor: [
            'react',
            'react-dom',
            'echarts',
            'echarts-for-react'
          ],
          ui: [
            '@radix-ui/react-accessible-icon',
            '@radix-ui/react-slot',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ]
        }
      }
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    }
  },
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm']
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});