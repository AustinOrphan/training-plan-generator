import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'lib'],
    
    // Environment setup
    environment: 'node',
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'lib/',
        'src/**/*.d.ts',
        'src/__tests__/**/*.ts',
        'vitest.config.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Performance settings
    testTimeout: 10000, // 10 seconds for complex plan generation
    hookTimeout: 5000,
    
    // Reporter configuration
    reporter: ['verbose'],
    
    // Global test setup
    globals: true,
    
    // Watch mode settings
    watch: false,
    
    // Retry configuration for flaky tests
    retry: 1,
    
    // Pool configuration for better performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    }
  }
});