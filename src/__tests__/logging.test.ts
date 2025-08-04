/**
 * Tests for the configurable logging system
 * Validates logger creation, backends, configuration handling, and utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLogger,
  defaultLogger,
  silentLogger,
  developmentLogger,
  validateLoggingConfig,
  isLogger,
  getLoggerFromOptions,
  withLogging,
  LOGGING_PRESETS,
  DEFAULT_LOGGING_CONFIG,
  SILENT_LOGGING_CONFIG,
  DEVELOPMENT_LOGGING_CONFIG,
  type Logger,
  type LoggingConfig,
} from '../types/logging';
import type { TypedOptions, LoggableOptions } from '../types/base-types';

describe('Logging System', () => {
  // Mock console methods
  const mockConsole = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };

  beforeEach(() => {
    // Replace console methods with mocks
    global.console = mockConsole as any;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Logger Creation', () => {
    it('should create console logger with default config', () => {
      const logger = createLogger();
      expect(logger).toBeDefined();
      
      logger.error('test error');
      expect(mockConsole.error).toHaveBeenCalledWith('test error');
    });

    it('should create console logger with explicit config', () => {
      const config: LoggingConfig = { level: 'debug', backend: 'console' };
      const logger = createLogger(config);
      
      logger.debug('test debug');
      expect(mockConsole.debug).toHaveBeenCalledWith('test debug');
    });

    it('should create silent logger', () => {
      const config: LoggingConfig = { level: 'debug', backend: 'silent' };
      const logger = createLogger(config);
      
      logger.error('test error');
      logger.warn('test warn');
      logger.info('test info');
      logger.debug('test debug');
      
      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should create custom logger', () => {
      const customLogger: Logger = {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
      };

      const config: LoggingConfig = {
        level: 'debug',
        backend: 'custom',
        customLogger,
      };

      const logger = createLogger(config);
      expect(logger).toBe(customLogger);
    });

    it('should throw error for custom backend without logger', () => {
      const config: LoggingConfig = { level: 'debug', backend: 'custom' };
      
      expect(() => createLogger(config)).toThrow(
        'Custom logger required when backend is "custom"'
      );
    });

    it('should throw error for unknown backend', () => {
      const config: LoggingConfig = { level: 'debug', backend: 'unknown' as any };
      
      expect(() => createLogger(config)).toThrow(
        'Unknown logging backend: unknown'
      );
    });
  });

  describe('Console Logger Behavior', () => {
    it('should respect log levels - error level', () => {
      const config: LoggingConfig = { level: 'error', backend: 'console' };
      const logger = createLogger(config);
      
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalledWith('error message');
    });

    it('should respect log levels - warn level', () => {
      const config: LoggingConfig = { level: 'warn', backend: 'console' };
      const logger = createLogger(config);
      
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalledWith('warn message');
      expect(mockConsole.error).toHaveBeenCalledWith('error message');
    });

    it('should respect log levels - debug level', () => {
      const config: LoggingConfig = { level: 'debug', backend: 'console' };
      const logger = createLogger(config);
      
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      expect(mockConsole.debug).toHaveBeenCalledWith('debug message');
      expect(mockConsole.info).toHaveBeenCalledWith('info message');
      expect(mockConsole.warn).toHaveBeenCalledWith('warn message');
      expect(mockConsole.error).toHaveBeenCalledWith('error message');
    });

    it('should handle context objects', () => {
      const logger = createLogger({ level: 'debug', backend: 'console' });
      const context = { userId: 123, action: 'login' };
      
      logger.error('Login failed', context);
      expect(mockConsole.error).toHaveBeenCalledWith('Login failed', context);
    });

    it('should handle messages without context', () => {
      const logger = createLogger({ level: 'debug', backend: 'console' });
      
      logger.error('Simple error');
      expect(mockConsole.error).toHaveBeenCalledWith('Simple error');
    });

    it('should respect silent level (no output)', () => {
      const config: LoggingConfig = { level: 'silent', backend: 'console' };
      const logger = createLogger(config);
      
      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');
      logger.debug('debug message');
      
      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });
  });

  describe('Silent Logger Behavior', () => {
    it('should not call any console methods', () => {
      const logger = silentLogger;
      
      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');
      logger.debug('debug message');
      
      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should handle context objects gracefully', () => {
      const logger = silentLogger;
      const context = { test: 'data' };
      
      // Should not throw errors
      expect(() => {
        logger.error('message', context);
        logger.warn('message', context);
        logger.info('message', context);
        logger.debug('message', context);
      }).not.toThrow();
    });
  });

  describe('Predefined Logger Instances', () => {
    it('should have defaultLogger with error level and console backend', () => {
      defaultLogger.error('test error');
      defaultLogger.warn('test warn');
      
      expect(mockConsole.error).toHaveBeenCalledWith('test error');
      expect(mockConsole.warn).not.toHaveBeenCalled(); // Below error level
    });

    it('should have developmentLogger with debug level and console backend', () => {
      developmentLogger.debug('test debug');
      developmentLogger.info('test info');
      developmentLogger.warn('test warn');
      developmentLogger.error('test error');
      
      expect(mockConsole.debug).toHaveBeenCalledWith('test debug');
      expect(mockConsole.info).toHaveBeenCalledWith('test info');
      expect(mockConsole.warn).toHaveBeenCalledWith('test warn');
      expect(mockConsole.error).toHaveBeenCalledWith('test error');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate valid configurations', () => {
      const validConfigs: LoggingConfig[] = [
        { level: 'debug', backend: 'console' },
        { level: 'error', backend: 'silent' },
        { level: 'warn', backend: 'custom', customLogger: mockCustomLogger() },
      ];

      validConfigs.forEach(config => {
        const errors = validateLoggingConfig(config);
        expect(errors).toEqual([]);
      });
    });

    it('should detect invalid log levels', () => {
      const config = { level: 'invalid' as any, backend: 'console' as const };
      const errors = validateLoggingConfig(config);
      
      expect(errors).toContain('Invalid log level: invalid');
    });

    it('should detect invalid backends', () => {
      const config = { level: 'debug' as const, backend: 'invalid' as any };
      const errors = validateLoggingConfig(config);
      
      expect(errors).toContain('Invalid backend: invalid');
    });

    it('should detect missing custom logger', () => {
      const config = { level: 'debug' as const, backend: 'custom' as const };
      const errors = validateLoggingConfig(config);
      
      expect(errors).toContain('Custom logger is required when backend is "custom"');
    });

    it('should validate custom logger interface', () => {
      const incompleteLogger = { error: vi.fn() }; // Missing other methods
      const config: LoggingConfig = {
        level: 'debug',
        backend: 'custom',
        customLogger: incompleteLogger as any,
      };
      
      const errors = validateLoggingConfig(config);
      expect(errors).toContain('Custom logger missing methods: warn, info, debug');
    });
  });

  describe('Type Guards and Utilities', () => {
    it('should identify valid loggers', () => {
      const validLogger = mockCustomLogger();
      expect(isLogger(validLogger)).toBe(true);
      
      const consoleLogger = createLogger();
      expect(isLogger(consoleLogger)).toBe(true);
    });

    it('should reject invalid logger objects', () => {
      expect(isLogger(null)).toBe(false);
      expect(isLogger(undefined)).toBe(false);
      expect(isLogger({})).toBe(false);
      expect(isLogger({ error: vi.fn() })).toBe(false); // Missing methods
      expect(isLogger({ error: 'not a function' })).toBe(false);
    });
  });

  describe('Configuration Constants', () => {
    it('should have correct default configuration', () => {
      expect(DEFAULT_LOGGING_CONFIG).toEqual({
        level: 'error',
        backend: 'console',
      });
    });

    it('should have correct silent configuration', () => {
      expect(SILENT_LOGGING_CONFIG).toEqual({
        level: 'silent',
        backend: 'silent',
      });
    });

    it('should have correct development configuration', () => {
      expect(DEVELOPMENT_LOGGING_CONFIG).toEqual({
        level: 'debug',
        backend: 'console',
      });
    });
  });

  describe('Integration with Error Handling', () => {
    it('should work as drop-in replacement for console', () => {
      const logger = createLogger({ level: 'debug', backend: 'console' });
      
      // Simulate the exact usage pattern from error-types.ts
      const errorContext = {
        message: 'Type validation failed',
        expectedType: 'string',
        actualValue: 123,
        context: 'user.name',
        stack: 'Error stack trace...',
      };
      
      logger.error('Type validation error:', errorContext);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Type validation error:',
        errorContext
      );
    });

    it('should maintain silent behavior for production use', () => {
      const logger = createLogger({ level: 'silent', backend: 'silent' });
      
      // Same error context as above
      const errorContext = {
        message: 'Schema validation failed',
        schemaName: 'UserSchema',
        failedProperties: ['name', 'email'],
        actualValue: { id: 123 },
        context: 'user-validation',
      };
      
      logger.error('Schema validation error:', errorContext);
      
      // Should not output anything
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    describe('getLoggerFromOptions', () => {
      it('should return defaultLogger when options is undefined', () => {
        const logger = getLoggerFromOptions();
        expect(logger).toBe(defaultLogger);
      });

      it('should return defaultLogger when options is null', () => {
        const logger = getLoggerFromOptions(null as any);
        expect(logger).toBe(defaultLogger);
      });

      it('should return defaultLogger when options is empty object', () => {
        const logger = getLoggerFromOptions({});
        expect(logger).toBe(defaultLogger);
      });

      it('should return defaultLogger when logging property is undefined', () => {
        const options = { logging: undefined };
        const logger = getLoggerFromOptions(options);
        expect(logger).toBe(defaultLogger);
      });

      it('should return defaultLogger when logging property is null', () => {
        const options = { logging: null as any };
        const logger = getLoggerFromOptions(options);
        expect(logger).toBe(defaultLogger);
      });

      it('should create console logger from valid logging config', () => {
        const options = {
          logging: { level: 'debug' as const, backend: 'console' as const }
        };
        const logger = getLoggerFromOptions(options);
        
        // Test that it's a working console logger
        logger.debug('test message');
        expect(mockConsole.debug).toHaveBeenCalledWith('test message');
      });

      it('should create silent logger from valid silent config', () => {
        const options = {
          logging: { level: 'debug' as const, backend: 'silent' as const }
        };
        const logger = getLoggerFromOptions(options);
        
        // Test that it's a working silent logger
        logger.error('test error');
        logger.debug('test debug');
        expect(mockConsole.error).not.toHaveBeenCalled();
        expect(mockConsole.debug).not.toHaveBeenCalled();
      });

      it('should create custom logger from valid custom config', () => {
        const customLogger = mockCustomLogger();
        const options = {
          logging: { 
            level: 'debug' as const, 
            backend: 'custom' as const,
            customLogger
          }
        };
        const logger = getLoggerFromOptions(options);
        
        expect(logger).toBe(customLogger);
      });

      it('should return defaultLogger and warn for invalid logging config', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const options = {
          logging: { level: 'invalid' as any, backend: 'console' as const }
        };
        const logger = getLoggerFromOptions(options);
        
        expect(logger).toBe(defaultLogger);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Invalid logging config, using default logger:', 
          ['Invalid log level: invalid']
        );
        
        consoleSpy.mockRestore();
      });

      it('should return defaultLogger and warn for invalid config during validation', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Custom backend without customLogger should fail during validation
        const options = {
          logging: { level: 'debug' as const, backend: 'custom' as const }
        };
        const logger = getLoggerFromOptions(options);
        
        expect(logger).toBe(defaultLogger);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Invalid logging config, using default logger:', 
          ['Custom logger is required when backend is "custom"']
        );
        
        consoleSpy.mockRestore();
      });


      it('should handle complex options objects with additional properties', () => {
        const options: LoggableOptions<{ apiKey: string; timeout: number }> = {
          apiKey: 'secret-key',
          timeout: 5000,
          customProperty: 'value',
          logging: { level: 'info' as const, backend: 'console' as const }
        };
        
        const logger = getLoggerFromOptions(options);
        
        logger.info('test info message');
        expect(mockConsole.info).toHaveBeenCalledWith('test info message');
      });

      it('should work with BaseExportOptions-like structures', () => {
        const exportOptions = {
          includePaces: true,
          format: 'pdf',
          filename: 'test.pdf',
          logging: { level: 'warn' as const, backend: 'console' as const }
        };
        
        const logger = getLoggerFromOptions(exportOptions);
        
        logger.warn('export warning');
        logger.info('export info'); // Should not log due to warn level
        
        expect(mockConsole.warn).toHaveBeenCalledWith('export warning');
        expect(mockConsole.info).not.toHaveBeenCalled();
      });
    });

    describe('withLogging', () => {
      it('should add logging configuration to empty options', () => {
        const baseOptions: TypedOptions = {};
        const loggingConfig: LoggingConfig = { level: 'debug', backend: 'console' };
        
        const result = withLogging(baseOptions, loggingConfig);
        
        expect(result).toEqual({
          logging: loggingConfig
        });
      });

      it('should add logging configuration to options with existing properties', () => {
        const baseOptions: TypedOptions<{ apiKey: string; timeout: number }> = {
          apiKey: 'secret',
          timeout: 5000
        };
        const loggingConfig: LoggingConfig = { level: 'info', backend: 'console' };
        
        const result = withLogging(baseOptions, loggingConfig);
        
        expect(result).toEqual({
          apiKey: 'secret',
          timeout: 5000,
          logging: loggingConfig
        });
      });

      it('should preserve generic type information', () => {
        const baseOptions = { customField: 'value', numericField: 42 };
        const loggingConfig: LoggingConfig = { level: 'error', backend: 'silent' };
        
        const result = withLogging(baseOptions, loggingConfig);
        
        // TypeScript should infer this as LoggableOptions<{ customField: string; numericField: number }>
        expect(result.customField).toBe('value');
        expect(result.numericField).toBe(42);
        expect(result.logging).toBe(loggingConfig);
      });

      it('should override existing logging configuration', () => {
        const baseOptions: LoggableOptions = {
          existingField: true,
          logging: { level: 'debug', backend: 'console' }
        };
        const newLoggingConfig: LoggingConfig = { level: 'error', backend: 'silent' };
        
        const result = withLogging(baseOptions, newLoggingConfig);
        
        expect(result).toEqual({
          existingField: true,
          logging: newLoggingConfig
        });
      });

      it('should work with LOGGING_PRESETS', () => {
        const baseOptions = { feature: 'export', enabled: true };
        
        const result = withLogging(baseOptions, LOGGING_PRESETS.development);
        
        expect(result).toEqual({
          feature: 'export',
          enabled: true,
          logging: DEVELOPMENT_LOGGING_CONFIG
        });
      });

      it('should create shallow copy of options object', () => {
        const baseOptions = { nested: { value: 'test' }, array: [1, 2, 3] };
        const loggingConfig: LoggingConfig = { level: 'debug', backend: 'console' };
        
        const result = withLogging(baseOptions, loggingConfig);
        
        // Should be different object
        expect(result).not.toBe(baseOptions);
        
        // But nested objects should be same reference (shallow copy)
        expect(result.nested).toBe(baseOptions.nested);
        expect(result.array).toBe(baseOptions.array);
        
        // Should have logging added
        expect(result.logging).toBe(loggingConfig);
      });

      it('should preserve all object properties', () => {
        const complexOptions = {
          stringProp: 'string',
          numberProp: 123,
          booleanProp: true,
          arrayProp: ['a', 'b', 'c'],
          objectProp: { nested: true },
          functionProp: () => 'test',
          symbolProp: Symbol('test'),
          [Symbol.for('symbol-key')]: 'symbol-value'
        };
        const loggingConfig: LoggingConfig = { level: 'info', backend: 'console' };
        
        const result = withLogging(complexOptions, loggingConfig);
        
        // All original properties should be preserved
        expect(result.stringProp).toBe('string');
        expect(result.numberProp).toBe(123);
        expect(result.booleanProp).toBe(true);
        expect(result.arrayProp).toEqual(['a', 'b', 'c']);
        expect(result.objectProp).toEqual({ nested: true });
        expect(result.functionProp()).toBe('test');
        expect(result.symbolProp).toBe(complexOptions.symbolProp);
        expect(result[Symbol.for('symbol-key')]).toBe('symbol-value');
        
        // Logging should be added
        expect(result.logging).toBe(loggingConfig);
      });
    });

    describe('LOGGING_PRESETS', () => {
      it('should have development preset with debug level and console backend', () => {
        expect(LOGGING_PRESETS.development).toEqual({
          level: 'debug',
          backend: 'console'
        });
        expect(LOGGING_PRESETS.development).toBe(DEVELOPMENT_LOGGING_CONFIG);
      });

      it('should have production preset with silent level and silent backend', () => {
        expect(LOGGING_PRESETS.production).toEqual({
          level: 'silent',
          backend: 'silent'
        });
        expect(LOGGING_PRESETS.production).toBe(SILENT_LOGGING_CONFIG);
      });

      it('should have testing preset with silent level and silent backend', () => {
        expect(LOGGING_PRESETS.testing).toEqual({
          level: 'silent',
          backend: 'silent'
        });
        expect(LOGGING_PRESETS.testing).toBe(SILENT_LOGGING_CONFIG);
      });

      it('should have debug preset with debug level and console backend', () => {
        expect(LOGGING_PRESETS.debug).toEqual({
          level: 'debug',
          backend: 'console'
        });
      });

      it('should create working loggers from all presets', () => {
        // Test development preset
        const devLogger = createLogger(LOGGING_PRESETS.development);
        devLogger.debug('dev debug');
        expect(mockConsole.debug).toHaveBeenCalledWith('dev debug');
        
        vi.clearAllMocks();
        
        // Test production preset
        const prodLogger = createLogger(LOGGING_PRESETS.production);
        prodLogger.error('prod error');
        expect(mockConsole.error).not.toHaveBeenCalled();
        
        // Test testing preset
        const testLogger = createLogger(LOGGING_PRESETS.testing);
        testLogger.warn('test warn');
        expect(mockConsole.warn).not.toHaveBeenCalled();
        
        vi.clearAllMocks();
        
        // Test debug preset
        const debugLogger = createLogger(LOGGING_PRESETS.debug);
        debugLogger.info('debug info');
        expect(mockConsole.info).toHaveBeenCalledWith('debug info');
      });

      it('should work with withLogging utility', () => {
        const options = { feature: 'test' };
        
        const devOptions = withLogging(options, LOGGING_PRESETS.development);
        const prodOptions = withLogging(options, LOGGING_PRESETS.production);
        const testOptions = withLogging(options, LOGGING_PRESETS.testing);
        const debugOptions = withLogging(options, LOGGING_PRESETS.debug);
        
        expect(devOptions.logging).toBe(LOGGING_PRESETS.development);
        expect(prodOptions.logging).toBe(LOGGING_PRESETS.production);
        expect(testOptions.logging).toBe(LOGGING_PRESETS.testing);
        expect(debugOptions.logging).toBe(LOGGING_PRESETS.debug);
      });

      it('should work with getLoggerFromOptions utility', () => {
        const devOptions = { logging: LOGGING_PRESETS.development };
        const prodOptions = { logging: LOGGING_PRESETS.production };
        
        const devLogger = getLoggerFromOptions(devOptions);
        const prodLogger = getLoggerFromOptions(prodOptions);
        
        // Test dev logger works
        devLogger.warn('dev warning');
        expect(mockConsole.warn).toHaveBeenCalledWith('dev warning');
        
        vi.clearAllMocks();
        
        // Test prod logger is silent
        prodLogger.error('prod error');
        expect(mockConsole.error).not.toHaveBeenCalled();
      });

      it('should be tree-shakable (const assertion)', () => {
        // Verify const assertion exists by checking the type
        const presets: typeof LOGGING_PRESETS = LOGGING_PRESETS;
        
        // Should be able to access specific presets
        expect(presets.development).toBeDefined();
        expect(presets.production).toBeDefined();
        expect(presets.testing).toBeDefined();
        expect(presets.debug).toBeDefined();
      });
    });

    describe('Error Handling and Edge Cases', () => {
      it('should handle options with invalid logging config gracefully', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        const invalidOptions = {
          customField: 'value',
          logging: {
            level: 'invalid-level' as any,
            backend: 'invalid-backend' as any
          }
        };
        
        const logger = getLoggerFromOptions(invalidOptions);
        
        expect(logger).toBe(defaultLogger);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Invalid logging config, using default logger:',
          expect.arrayContaining([
            'Invalid log level: invalid-level',
            'Invalid backend: invalid-backend'
          ])
        );
        
        consoleSpy.mockRestore();
      });

      it('should handle malformed options objects', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        
        // Object with weird properties
        const weirdOptions = {
          logging: {
            level: 'debug' as const,
            backend: 'custom' as const,
            customLogger: 'not-a-logger' as any
          }
        };
        
        const logger = getLoggerFromOptions(weirdOptions);
        
        expect(logger).toBe(defaultLogger);
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });

      it('should preserve null and undefined values in withLogging', () => {
        const optionsWithNulls = {
          nullValue: null,
          undefinedValue: undefined,
          normalValue: 'test'
        };
        const loggingConfig: LoggingConfig = { level: 'debug', backend: 'console' };
        
        const result = withLogging(optionsWithNulls, loggingConfig);
        
        expect(result.nullValue).toBe(null);
        expect(result.undefinedValue).toBe(undefined);
        expect(result.normalValue).toBe('test');
        expect(result.logging).toBe(loggingConfig);
      });

      it('should handle circular references in options (shallow copy)', () => {
        const circularOptions: any = { value: 'test' };
        circularOptions.self = circularOptions;
        
        const loggingConfig: LoggingConfig = { level: 'debug', backend: 'console' };
        
        // Should not throw with circular reference
        expect(() => {
          const result = withLogging(circularOptions, loggingConfig);
          expect(result.value).toBe('test');
          expect(result.self).toBe(circularOptions); // Same reference (shallow copy)
          expect(result.logging).toBe(loggingConfig);
        }).not.toThrow();
      });

      it('should handle frozen/sealed objects in withLogging', () => {
        const frozenOptions = Object.freeze({ value: 'frozen' });
        const sealedOptions = Object.seal({ value: 'sealed' });
        const loggingConfig: LoggingConfig = { level: 'debug', backend: 'console' };
        
        // Should work with frozen objects
        const frozenResult = withLogging(frozenOptions, loggingConfig);
        expect(frozenResult.value).toBe('frozen');
        expect(frozenResult.logging).toBe(loggingConfig);
        
        // Should work with sealed objects
        const sealedResult = withLogging(sealedOptions, loggingConfig);
        expect(sealedResult.value).toBe('sealed');
        expect(sealedResult.logging).toBe(loggingConfig);
      });
    });

    describe('Integration with Other Systems', () => {
      it('should work seamlessly with BaseExportOptions pattern', () => {
        // Simulate BaseExportOptions structure
        interface MockExportOptions extends LoggableOptions {
          includePaces?: boolean;
          filename?: string;
          format?: string;
        }
        
        const exportOptions: MockExportOptions = {
          includePaces: true,
          filename: 'test.pdf',
          format: 'pdf',
          logging: { level: 'info', backend: 'console' }
        };
        
        const logger = getLoggerFromOptions(exportOptions);
        logger.info('Export starting', { filename: exportOptions.filename });
        
        expect(mockConsole.info).toHaveBeenCalledWith(
          'Export starting', 
          { filename: 'test.pdf' }
        );
      });

      it('should support mixed usage scenarios', () => {
        // Some operations with logging, some without
        const operationA = { type: 'A' };
        const operationB = withLogging({ type: 'B' }, LOGGING_PRESETS.debug);
        const operationC = { type: 'C', logging: { level: 'warn' as const, backend: 'console' as const } };
        
        const loggerA = getLoggerFromOptions(operationA);
        const loggerB = getLoggerFromOptions(operationB);
        const loggerC = getLoggerFromOptions(operationC);
        
        // A should use default (error level)
        loggerA.warn('A warning');
        expect(mockConsole.warn).not.toHaveBeenCalled();
        
        // B should use debug level
        loggerB.debug('B debug');
        expect(mockConsole.debug).toHaveBeenCalledWith('B debug');
        
        vi.clearAllMocks();
        
        // C should use warn level
        loggerC.info('C info');
        loggerC.warn('C warning');
        expect(mockConsole.info).not.toHaveBeenCalled();
        expect(mockConsole.warn).toHaveBeenCalledWith('C warning');
      });

      it('should validate configurations are valid before creating loggers', () => {
        const validOptions = withLogging({}, LOGGING_PRESETS.development);
        const validationErrors = validateLoggingConfig(validOptions.logging!);
        
        expect(validationErrors).toEqual([]);
        
        const logger = getLoggerFromOptions(validOptions);
        logger.debug('Should work');
        expect(mockConsole.debug).toHaveBeenCalledWith('Should work');
      });
    });
  });
});

// Helper function to create mock custom logger
function mockCustomLogger(): Logger {
  return {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
}