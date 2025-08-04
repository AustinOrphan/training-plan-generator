/**
 * Unit Tests for LoggableOptions Interface
 * 
 * Tests interface compatibility, type inference, generic parameter behavior,
 * and TypeScript compilation/type safety for the LoggableOptions interface.
 * This ensures the interface properly extends TypedOptions while adding
 * optional logging configuration capabilities.
 */

import { describe, it, expect, vi } from 'vitest';
import type { LoggableOptions, TypedOptions } from '../types/base-types';
import type { LoggingConfig, Logger } from '../types/logging';
import { getLoggerFromOptions, withLogging, LOGGING_PRESETS } from '../types/logging';

describe('LoggableOptions Interface', () => {
  describe('Interface Compatibility', () => {
    it('should extend TypedOptions interface', () => {
      // LoggableOptions should be assignable to TypedOptions
      const loggableOptions: LoggableOptions = {
        customField: 'value',
        logging: { level: 'debug', backend: 'console' },
      };

      // Should be assignable to TypedOptions
      const typedOptions: TypedOptions = loggableOptions;
      expect(typedOptions).toBeDefined();
      expect(typedOptions.customField).toBe('value');
    });

    it('should work without logging configuration (backward compatibility)', () => {
      // LoggableOptions should work without logging property
      const options: LoggableOptions = {
        customField: 'value',
        anotherField: 123,
      };

      expect(options.customField).toBe('value');
      expect(options.anotherField).toBe(123);
      expect(options.logging).toBeUndefined();
    });

    it('should work with only logging configuration', () => {
      // LoggableOptions should work with just logging property
      const options: LoggableOptions = {
        logging: { level: 'warn', backend: 'console' },
      };

      expect(options.logging).toBeDefined();
      expect(options.logging?.level).toBe('warn');
      expect(options.logging?.backend).toBe('console');
    });

    it('should allow arbitrary properties like TypedOptions', () => {
      // Should allow any string key with unknown value
      const options: LoggableOptions = {
        stringField: 'text',
        numberField: 42,
        booleanField: true,
        objectField: { nested: 'value' },
        arrayField: [1, 2, 3],
        logging: { level: 'info', backend: 'silent' },
      };

      expect(options.stringField).toBe('text');
      expect(options.numberField).toBe(42);
      expect(options.booleanField).toBe(true);
      expect(options.objectField).toEqual({ nested: 'value' });
      expect(options.arrayField).toEqual([1, 2, 3]);
    });
  });

  describe('Generic Parameter Behavior', () => {
    it('should support generic type constraints', () => {
      // Test with specific custom fields type
      interface CustomFields {
        apiKey: string;
        timeout: number;
      }

      const options: LoggableOptions<CustomFields> = {
        apiKey: 'secret-key',
        timeout: 5000,
        logging: { level: 'debug', backend: 'console' },
      };

      expect(options.apiKey).toBe('secret-key');
      expect(options.timeout).toBe(5000);
      expect(options.logging?.level).toBe('debug');
    });

    it('should default to Record<string, unknown> when no generic provided', () => {
      // Default generic behavior
      const options: LoggableOptions = {
        dynamicField: 'any value',
        anotherField: { complex: 'object' },
        logging: { level: 'error', backend: 'silent' },
      };

      expect(options.dynamicField).toBe('any value');
      expect(options.anotherField).toEqual({ complex: 'object' });
    });

    it('should maintain type safety with generic constraints', () => {
      // Test that TypeScript would catch type errors at compile time
      interface StrictFields {
        readonly id: number;
        name: string;
      }

      const options: LoggableOptions<StrictFields> = {
        id: 123,
        name: 'Test Name',
        logging: { level: 'warn', backend: 'console' },
      };

      // These should maintain their types
      expect(typeof options.id).toBe('number');
      expect(typeof options.name).toBe('string');
      expect(options.id).toBe(123);
      expect(options.name).toBe('Test Name');
    });

    it('should support complex generic types', () => {
      // Test with union types and optional properties
      interface ComplexFields {
        mode: 'development' | 'production' | 'testing';
        features?: string[];
        config?: {
          enabled: boolean;
          settings: Record<string, unknown>;
        };
      }

      const options: LoggableOptions<ComplexFields> = {
        mode: 'development',
        features: ['feature1', 'feature2'],
        config: {
          enabled: true,
          settings: { key: 'value' },
        },
        logging: { level: 'debug', backend: 'console' },
      };

      expect(options.mode).toBe('development');
      expect(options.features).toEqual(['feature1', 'feature2']);
      expect(options.config?.enabled).toBe(true);
      expect(options.config?.settings.key).toBe('value');
    });
  });

  describe('Import Syntax for Logging Configuration', () => {
    it('should use import() syntax to avoid circular dependencies', () => {
      // This test verifies that the interface definition uses import() syntax
      // We can't directly test the syntax, but we can test that it works correctly
      
      const options: LoggableOptions = {
        logging: { level: 'info', backend: 'console' },
      };

      // The logging property should be compatible with LoggingConfig
      const config: LoggingConfig = options.logging!;
      expect(config.level).toBe('info');
      expect(config.backend).toBe('console');
    });

    it('should work with all valid LoggingConfig values', () => {
      // Test all valid log levels
      const logLevels: Array<LoggingConfig['level']> = ['debug', 'info', 'warn', 'error', 'silent'];
      
      logLevels.forEach(level => {
        const options: LoggableOptions = {
          logging: { level, backend: 'console' },
        };
        
        expect(options.logging?.level).toBe(level);
      });
    });

    it('should work with all valid backend types', () => {
      // Test all valid backends
      const backends: Array<LoggingConfig['backend']> = ['console', 'silent', 'custom'];
      
      backends.forEach(backend => {
        const config: LoggingConfig = { level: 'debug', backend };
        if (backend === 'custom') {
          config.customLogger = {
            error: vi.fn(),
            warn: vi.fn(),
            info: vi.fn(),
            debug: vi.fn(),
          };
        }

        const options: LoggableOptions = {
          logging: config,
        };
        
        expect(options.logging?.backend).toBe(backend);
      });
    });

    it('should support custom logger in logging configuration', () => {
      const customLogger: Logger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
      };

      const options: LoggableOptions = {
        logging: {
          level: 'debug',
          backend: 'custom',
          customLogger,
        },
      };

      expect(options.logging?.customLogger).toBe(customLogger);
      expect(options.logging?.backend).toBe('custom');
    });
  });

  describe('TypeScript Compilation and Type Safety', () => {
    it('should maintain type inference with utility functions', () => {
      // Test that getLoggerFromOptions works with LoggableOptions
      const options: LoggableOptions = {
        customField: 'value',
        logging: { level: 'debug', backend: 'console' },
      };

      const logger = getLoggerFromOptions(options);
      expect(logger).toBeDefined();
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should work with withLogging utility function', () => {
      // Test that withLogging preserves type information
      const baseOptions: TypedOptions<{ apiKey: string }> = {
        apiKey: 'secret',
        timeout: 1000,
      };

      const loggableOptions = withLogging(baseOptions, { level: 'warn', backend: 'console' });
      
      // Should maintain original properties
      expect(loggableOptions.apiKey).toBe('secret');
      expect(loggableOptions.timeout).toBe(1000);
      
      // Should add logging configuration
      expect(loggableOptions.logging).toBeDefined();
      expect(loggableOptions.logging?.level).toBe('warn');
      expect(loggableOptions.logging?.backend).toBe('console');
    });

    it('should work with logging presets', () => {
      // Test that LoggableOptions works with predefined presets
      const developmentOptions: LoggableOptions = {
        feature: 'test',
        logging: LOGGING_PRESETS.development,
      };

      const productionOptions: LoggableOptions = {
        feature: 'test',
        logging: LOGGING_PRESETS.production,
      };

      const testingOptions: LoggableOptions = {
        feature: 'test',
        logging: LOGGING_PRESETS.testing,
      };

      const debugOptions: LoggableOptions = {
        feature: 'test',
        logging: LOGGING_PRESETS.debug,
      };

      expect(developmentOptions.logging?.level).toBe('debug');
      expect(productionOptions.logging?.level).toBe('silent');
      expect(testingOptions.logging?.level).toBe('silent');
      expect(debugOptions.logging?.level).toBe('debug');
    });

    it('should support optional chaining for logging property', () => {
      // Test that optional chaining works correctly
      const optionsWithLogging: LoggableOptions = {
        logging: { level: 'info', backend: 'console' },
      };

      const optionsWithoutLogging: LoggableOptions = {
        customField: 'value',
      };

      // With logging
      expect(optionsWithLogging.logging?.level).toBe('info');
      expect(optionsWithLogging.logging?.backend).toBe('console');

      // Without logging
      expect(optionsWithoutLogging.logging?.level).toBeUndefined();
      expect(optionsWithoutLogging.logging?.backend).toBeUndefined();
    });

    it('should be assignable in interface inheritance chains', () => {
      // Test that LoggableOptions can be extended by other interfaces
      interface ExtendedOptions extends LoggableOptions<{ apiKey: string }> {
        timeout: number;
        retries: number;
      }

      const extendedOptions: ExtendedOptions = {
        apiKey: 'secret',
        timeout: 5000,
        retries: 3,
        logging: { level: 'debug', backend: 'console' },
      };

      // Should have all properties
      expect(extendedOptions.apiKey).toBe('secret');
      expect(extendedOptions.timeout).toBe(5000);
      expect(extendedOptions.retries).toBe(3);
      expect(extendedOptions.logging?.level).toBe('debug');

      // Should be assignable to LoggableOptions
      const loggableOptions: LoggableOptions<{ apiKey: string }> = extendedOptions;
      expect(loggableOptions.apiKey).toBe('secret');
      expect(loggableOptions.logging?.level).toBe('debug');
    });

    it('should handle null and undefined logging configuration', () => {
      // Test edge cases with null/undefined
      const optionsWithUndefined: LoggableOptions = {
        customField: 'value',
        logging: undefined,
      };

      const optionsWithNull: LoggableOptions = {
        customField: 'value',
        logging: null as any, // Type assertion for test purposes
      };

      // getLoggerFromOptions should handle these gracefully
      const loggerFromUndefined = getLoggerFromOptions(optionsWithUndefined);
      const loggerFromNull = getLoggerFromOptions(optionsWithNull);

      expect(loggerFromUndefined).toBeDefined();
      expect(loggerFromNull).toBeDefined();
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should work in function parameter positions', () => {
      // Function that accepts LoggableOptions
      function processOptions(options: LoggableOptions<{ data: string }>): string {
        const logger = getLoggerFromOptions(options);
        logger.info('Processing options', { data: options.data });
        return options.data;
      }

      const result = processOptions({
        data: 'test-data',
        logging: { level: 'info', backend: 'silent' }, // Silent for test
      });

      expect(result).toBe('test-data');
    });

    it('should work in class property positions', () => {
      // Class that uses LoggableOptions as property type
      class ConfigurableService {
        constructor(public options: LoggableOptions<{ endpoint: string }>) {}

        getLogger(): Logger {
          return getLoggerFromOptions(this.options);
        }

        getEndpoint(): string {
          return this.options.endpoint;
        }
      }

      const service = new ConfigurableService({
        endpoint: 'https://api.example.com',
        logging: { level: 'warn', backend: 'console' },
      });

      expect(service.getEndpoint()).toBe('https://api.example.com');
      expect(service.getLogger()).toBeDefined();
    });

    it('should work with object destructuring', () => {
      // Test destructuring patterns
      const options: LoggableOptions<{ apiKey: string; timeout: number }> = {
        apiKey: 'secret',
        timeout: 5000,
        extraProperty: 'value',
        logging: { level: 'debug', backend: 'console' },
      };

      const { apiKey, timeout, logging, ...rest } = options;

      expect(apiKey).toBe('secret');
      expect(timeout).toBe(5000);
      expect(logging?.level).toBe('debug');
      expect(rest.extraProperty).toBe('value');
    });

    it('should work with spread operators', () => {
      // Test spread operator compatibility
      const baseOptions: LoggableOptions = {
        feature: 'base',
        logging: { level: 'info', backend: 'console' },
      };

      const extendedOptions: LoggableOptions = {
        ...baseOptions,
        additionalFeature: 'extended',
        logging: { level: 'debug', backend: 'console' }, // Override logging
      };

      expect(extendedOptions.feature).toBe('base');
      expect(extendedOptions.additionalFeature).toBe('extended');
      expect(extendedOptions.logging?.level).toBe('debug'); // Should be overridden
    });
  });
});