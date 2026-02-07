import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    sourcemap: true,
    reportCompressedSize: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and core dependencies
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
          
          // UI libraries
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/cmdk')) return 'vendor-ui';
          
          // Date utilities
          if (id.includes('node_modules/date-fns')) return 'vendor-date';
          
          // Charts
          if (id.includes('node_modules/recharts')) return 'vendor-charts';
          
          // DnD
          if (id.includes('node_modules/@dnd-kit')) return 'vendor-dnd';
          
          // Markdown
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark')) return 'vendor-markdown';
          
          // Icons
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
          
          // Form handling
          if (id.includes('node_modules/react-hook-form')) return 'vendor-forms';
          
          // Notifications
          if (id.includes('node_modules/sonner')) return 'vendor-notifications';
          
          // Utility libraries
          if (id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge') || id.includes('node_modules/class-variance-authority')) return 'vendor-utils';
          
          // Monaco Editor (heavy)
          if (id.includes('node_modules/@monaco-editor')) return 'vendor-monaco';
          
          // Tldraw (very heavy)
          if (id.includes('node_modules/tldraw')) return 'vendor-tldraw';
          
          // Heavy components
          if (id.includes('src/components/Analytics')) return 'analytics';
          if (id.includes('src/components/Achievements')) return 'achievements';
          
          // Other node_modules
          if (id.includes('node_modules')) return 'vendor-other';
        }
      }
    }
  },
  server: {
    proxy: {
      // External API proxies (for development) - must come before general /api rule
      '/api/potd': {
        target: 'https://leetcode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/potd/, '/graphql'),
      },
      '/api/cf': {
        target: 'https://codeforces.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cf/, '/api'),
      },
      '/api/leetcode': {
        target: 'https://leetcode.com/graphql',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/leetcode/, ''),
      },
      // Backend API proxy - must come after specific external API rules
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
