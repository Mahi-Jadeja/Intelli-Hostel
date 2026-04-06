import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    
    // ✅ KEY OPTIMIZATIONS
    css: false,                      // Don't process Tailwind in tests
    pool: 'forks',                 // Use threads instead of forks (less memory)
    poolOptions: {
    forks: {
      singleFork: true,
  },
},
    
    
    // ✅ Increase timeout
    testTimeout: 15000,              // 15 seconds
    hookTimeout: 15000,
    
    // ✅ Tell Vitest to ignore heavy dependencies in tests
    deps: {
      inline: [
        /react-hot-toast/,           // Mock this instead of loading real module
      ],
    },
  },
});