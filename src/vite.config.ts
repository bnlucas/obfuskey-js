import { defineConfig } from 'vite';

export default defineConfig({
  // Your existing Vite build configurations
  // ...
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.js'],
    // ... other Vitest specific options
  },
});
