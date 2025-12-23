import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global setup
    globals: true,
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/dist/**',
        '**/build/**',
        '**/.{git,cache,output,temp}/**',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        '**/postcss.config.js',
        '**/tailwind.config.ts',
        '**/eslint.config.js',
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
    },
    
    // Test file patterns
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    
    // Test timeout
    testTimeout: 10000,
    
    // Hooks timeout
    hookTimeout: 10000,
    
    // Reporters
    reporters: ['verbose'],
    
    // Parallel execution
    pool: 'threads',
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
