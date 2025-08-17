import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@/components': resolve(__dirname, './components'),
      '@/styles': resolve(__dirname, './styles'),
      '@/services': resolve(__dirname, './components/services')
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
          utils: ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    },
    // Ensure compatibility with Windows file systems
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false
  },
  server: {
    port: 3000,
    host: true, // Listen on all addresses for Windows compatibility
    open: false, // Don't auto-open browser on Windows
    cors: true
  },
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  // Optimize dependencies for faster cold starts on Windows
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'lucide-react',
      'date-fns',
      'recharts',
      'lru-cache'
    ],
    exclude: []
  },
  // Windows-friendly environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production')
  }
});