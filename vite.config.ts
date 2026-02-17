import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@domain': resolve(__dirname, './src/domain'),
      '@application': resolve(__dirname, './src/application'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@presentation': resolve(__dirname, './src/presentation'),
      '@config': resolve(__dirname, './src/config'),
      '@tests': resolve(__dirname, './src/tests'),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    allowedHosts: ['b0d4-2804-2c9c-17-2de0-686b-fd04-6924-420b.ngrok-free.app'],
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ['pixi.js'],
          gsap: ['gsap'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['pixi.js', 'gsap'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
    },
  },
});
