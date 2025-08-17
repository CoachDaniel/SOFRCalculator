import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
  server: {
    port: 5173,
    host: true, // Allow access from network
    open: true, // Auto-open browser
  },
  build: {
    target: 'esnext', // Use latest JS features supported by Node 24.4.1
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@radix-ui/react-select', '@radix-ui/react-dialog'],
          charts: ['recharts']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'recharts',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ]
  },
  esbuild: {
    target: 'esnext' // Use latest ESBuild target for Node 24.4.1
  }
})