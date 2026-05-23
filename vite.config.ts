import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/FiC/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              const normalizedId = id.replace(/\\/g, '/');

              if (normalizedId.includes('/components/PixelSprites.tsx')) {
                return 'fic-sprites';
              }
              if (normalizedId.includes('/node_modules/react') || normalizedId.includes('/node_modules/react-dom')) {
                return 'vendor-react';
              }
              if (normalizedId.includes('/node_modules/lucide-react')) {
                return 'vendor-icons';
              }
            }
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
