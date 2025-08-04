/**
 * Tests for options-aware error handlers
 * Validates that error handling methods respect logging configuration from options objects
 * and fall back to default logger when options are not provided
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  TypeSafeErrorHandler,
  TypeValidationErrorFactory,
} from '../types/error-types';
import {
  TypeValidationError,
  SchemaValidationError,
} from '../types/base-types';
import {
  createLogger,
  defaultLogger,
  getLoggerFromOptions,
  LOGGING_PRESETS,
  type Logger,
  type LoggingConfig,
} from '../types/logging';
import type { LoggableOptions } from '../types/base-types';

describe('Options-Aware Error Handlers', () => {
  // Mock console methods
  const mockConsole = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };

  // Mock custom logger for testing
  const mockCustomLogger: Logger = {
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

  // Helper function to create test TypeValidationError
  function createTestValidationError(): TypeValidationError {
    return TypeValidationErrorFactory.createTypeMismatchError(
      'testField',
      'string',
      123,
      'test-context'
    );
  }

  // Helper function to create test SchemaValidationError
  function createTestSchemaError(): SchemaValidationError {
    return TypeValidationErrorFactory.createSchemaError(
      'TestSchema',
      ['name', 'email'],
      { id: 123 },
      'test-schema-context'
    );
  }

  describe('handleValidationErrorWithOptions', () => {
    it('should use console logger from options with debug level', () => {
      const error = createTestValidationError();
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'test-validation',
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('test-validation: Type mismatch in field \'testField\'');
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Type validation error:',
        expect.objectContaining({
          message: expect.stringContaining('Type mismatch in field \'testField\''),
          expectedType: 'string',
          actualValue: 123,
          context: 'test-context',
        })
      );
    });

    it('should use console logger from options with error level', () => {
      const error = createTestValidationError();
      const options: LoggableOptions = {
        customField: 'value',
        logging: { level: 'error', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'validation-test',
        options
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Type validation error:',
        expect.objectContaining({
          expectedType: 'string',
          actualValue: 123
        })
      );
    });

    it('should use silent logger from options (no console output)', () => {
      const error = createTestValidationError();
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'silent' }
      };

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'silent-validation',
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('silent-validation: Type mismatch');
      // Silent logger should not call console methods
      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should use custom logger from options', () => {
      const error = createTestValidationError();
      const options: LoggableOptions = {
        logging: {
          level: 'debug',
          backend: 'custom',
          customLogger: mockCustomLogger
        }
      };

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'custom-validation',
        options
      );

      expect(result.success).toBe(false);
      expect(mockCustomLogger.error).toHaveBeenCalledWith(
        'Type validation error:',
        expect.objectContaining({
          message: expect.stringContaining('Type mismatch in field \'testField\''),
          expectedType: 'string',
          actualValue: 123
        })
      );
      // Console should not be called when using custom logger
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should fall back to default logger when options not provided', () => {
      const error = createTestValidationError();

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(error);

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation: Type mismatch');
      // Default logger uses error level and console backend
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Type validation error:',
        expect.objectContaining({
          expectedType: 'string',
          actualValue: 123
        })
      );
    });

    it('should fall back to default logger when options is null', () => {
      const error = createTestValidationError();

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'null-options',
        null as any
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should fall back to default logger when options is empty object', () => {
      const error = createTestValidationError();

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'empty-options',
        {}
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should fall back to default logger when logging property is undefined', () => {
      const error = createTestValidationError();
      const options = { customField: 'value', logging: undefined };

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'undefined-logging',
        options
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should use default context when not provided', () => {
      const error = createTestValidationError();
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        undefined,
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation: Type mismatch');
    });

    it('should work with BaseExportOptions-like structures', () => {
      const error = createTestValidationError();
      const exportOptions = {
        includePaces: true,
        filename: 'test.pdf',
        format: 'pdf',
        logging: { level: 'info' as const, backend: 'console' as const }
      };

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'export-validation',
        exportOptions
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should handle complex options with additional properties', () => {
      const error = createTestValidationError();
      const complexOptions: LoggableOptions<{ apiKey: string; timeout: number }> = {
        apiKey: 'secret-key',
        timeout: 5000,
        customProperty: 'value',
        logging: { level: 'warn', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'complex-validation',
        complexOptions
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should handle invalid logging configuration gracefully', () => {
      const error = createTestValidationError();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const options = {
        logging: { level: 'invalid' as any, backend: 'console' as const }
      };

      const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'invalid-config',
        options
      );

      expect(result.success).toBe(false);
      // Should fall back to default logger and warn about invalid config
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid logging config, using default logger:',
        expect.arrayContaining(['Invalid log level: invalid'])
      );
      
      consoleSpy.mockRestore();
    });

    it('should work with LOGGING_PRESETS', () => {
      const error = createTestValidationError();
      
      // Test with development preset
      const devOptions = { logging: LOGGING_PRESETS.development };
      const devResult = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'dev-validation',
        devOptions
      );
      
      expect(devResult.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
      
      vi.clearAllMocks();
      
      // Test with production preset (silent)
      const prodOptions = { logging: LOGGING_PRESETS.production };
      const prodResult = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'prod-validation',
        prodOptions
      );
      
      expect(prodResult.success).toBe(false);
      expect(mockConsole.error).not.toHaveBeenCalled(); // Silent
    });
  });

  describe('handleSchemaErrorWithOptions', () => {
    it('should use console logger from options with debug level', () => {
      const error = createTestSchemaError();
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'test-schema-validation',
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('test-schema-validation: Schema \'TestSchema\' validation failed');
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Schema validation error:',
        expect.objectContaining({
          schemaName: 'TestSchema',
          failedProperties: ['name', 'email'],
          actualValue: { id: 123 },
          context: 'test-schema-context'
        })
      );
    });

    it('should use console logger from options with error level', () => {
      const error = createTestSchemaError();
      const options: LoggableOptions = {
        someField: 'value',
        logging: { level: 'error', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'schema-validation-test',
        options
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Schema validation error:',
        expect.objectContaining({
          schemaName: 'TestSchema',
          failedProperties: ['name', 'email']
        })
      );
    });

    it('should use silent logger from options (no console output)', () => {
      const error = createTestSchemaError();
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'silent' }
      };

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'silent-schema-validation',
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('silent-schema-validation: Schema \'TestSchema\' validation failed');
      // Silent logger should not call console methods
      expect(mockConsole.error).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should use custom logger from options', () => {
      const error = createTestSchemaError();
      const options: LoggableOptions = {
        logging: {
          level: 'debug',
          backend: 'custom',
          customLogger: mockCustomLogger
        }
      };

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'custom-schema-validation',
        options
      );

      expect(result.success).toBe(false);
      expect(mockCustomLogger.error).toHaveBeenCalledWith(
        'Schema validation error:',
        expect.objectContaining({
          schemaName: 'TestSchema',
          failedProperties: ['name', 'email'],
          actualValue: { id: 123 }
        })
      );
      // Console should not be called when using custom logger
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should fall back to default logger when options not provided', () => {
      const error = createTestSchemaError();

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(error);

      expect(result.success).toBe(false);
      expect(result.error).toContain('schema-validation: Schema \'TestSchema\' validation failed');
      // Default logger uses error level and console backend
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Schema validation error:',
        expect.objectContaining({
          schemaName: 'TestSchema',
          failedProperties: ['name', 'email']
        })
      );
    });

    it('should fall back to default logger when options is null', () => {
      const error = createTestSchemaError();

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'null-options',
        null as any
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should fall back to default logger when options is empty object', () => {
      const error = createTestSchemaError();

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'empty-options',
        {}
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should fall back to default logger when logging property is undefined', () => {
      const error = createTestSchemaError();
      const options = { customField: 'value', logging: undefined };

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'undefined-logging',
        options
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should use default context when not provided', () => {
      const error = createTestSchemaError();
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        undefined,
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('schema-validation: Schema \'TestSchema\' validation failed');
    });

    it('should work with complex export options', () => {
      const error = createTestSchemaError();
      const exportOptions = {
        includePaces: true,
        filename: 'training-plan.pdf',
        format: 'pdf',
        customMetadata: { author: 'Test' },
        logging: { level: 'warn' as const, backend: 'console' as const }
      };

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'export-schema-validation',
        exportOptions
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should handle invalid logging configuration gracefully', () => {
      const error = createTestSchemaError();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const options = {
        logging: { level: 'debug' as const, backend: 'custom' as const }
        // Missing customLogger for custom backend
      };

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'invalid-schema-config',
        options
      );

      expect(result.success).toBe(false);
      // Should fall back to default logger and warn about invalid config
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid logging config, using default logger:',
        expect.arrayContaining(['Custom logger is required when backend is "custom"'])
      );
      
      consoleSpy.mockRestore();
    });

    it('should work with LOGGING_PRESETS', () => {
      const error = createTestSchemaError();
      
      // Test with debug preset
      const debugOptions = { logging: LOGGING_PRESETS.debug };
      const debugResult = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'debug-schema-validation',
        debugOptions
      );
      
      expect(debugResult.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
      
      vi.clearAllMocks();
      
      // Test with testing preset (silent)
      const testingOptions = { logging: LOGGING_PRESETS.testing };
      const testingResult = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'testing-schema-validation',
        testingOptions
      );
      
      expect(testingResult.success).toBe(false);
      expect(mockConsole.error).not.toHaveBeenCalled(); // Silent
    });
  });

  describe('handleErrorWithOptions', () => {
    it('should handle successful operations', () => {
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => 'success-value',
        'test-operation',
        options
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('success-value');
      // No error logging for successful operations
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should handle TypeValidationError with console logger from options', () => {
      const error = createTestValidationError();
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        'validation-operation',
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation-operation: Type mismatch in field \'testField\'');
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Type validation error:',
        expect.objectContaining({
          expectedType: 'string',
          actualValue: 123
        })
      );
    });

    it('should handle SchemaValidationError with silent logger from options', () => {
      const error = createTestSchemaError();
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'silent' }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        'schema-operation',
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('schema-operation: Schema \'TestSchema\' validation failed');
      // Silent logger should not call console methods
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should handle generic Error with custom logger from options', () => {
      const error = new Error('Generic error message');
      const options: LoggableOptions = {
        logging: {
          level: 'debug',
          backend: 'custom',
          customLogger: mockCustomLogger
        }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        'generic-operation',
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('generic-operation: Generic error message');
      expect(mockCustomLogger.error).toHaveBeenCalledWith('generic-operation: Generic error message');
      // Console should not be called when using custom logger
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should handle non-Error thrown values with logger from options', () => {
      const options: LoggableOptions = {
        logging: { level: 'info', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw 'string error'; },
        'string-error-operation',
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('string-error-operation: string error');
      expect(mockConsole.error).toHaveBeenCalledWith('string-error-operation: string error');
    });

    it('should handle numeric thrown values with logger from options', () => {
      const options: LoggableOptions = {
        logging: { level: 'error', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw 404; },
        'numeric-error-operation',
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('numeric-error-operation: 404');
      expect(mockConsole.error).toHaveBeenCalledWith('numeric-error-operation: 404');
    });

    it('should fall back to default logger when options not provided', () => {
      const error = new Error('Test error');

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        'no-options-operation'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('no-options-operation: Test error');
      // Default logger uses error level and console backend  
      expect(mockConsole.error).toHaveBeenCalledWith('no-options-operation: Test error');
    });

    it('should fall back to default logger when options is null', () => {
      const error = new Error('Null options error');

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        'null-options-operation',
        null as any
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalledWith('null-options-operation: Null options error');
    });

    it('should fall back to default logger when options is empty object', () => {
      const error = new Error('Empty options error');

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        'empty-options-operation',
        {}
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalledWith('empty-options-operation: Empty options error');
    });

    it('should fall back to default logger when logging property is undefined', () => {
      const error = new Error('Undefined logging error');
      const options = { customField: 'value', logging: undefined };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        'undefined-logging-operation',
        options
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalledWith('undefined-logging-operation: Undefined logging error');
    });

    it('should use default context when not provided', () => {
      const error = new Error('Default context error');
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        undefined,
        options
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('operation: Default context error');
      expect(mockConsole.error).toHaveBeenCalledWith('operation: Default context error');
    });

    it('should work with complex operations and export-like options', () => {
      const exportOptions = {
        includePaces: true,
        filename: 'complex-plan.pdf',
        format: 'pdf',
        metadata: { version: '1.0' },
        logging: { level: 'warn' as const, backend: 'console' as const }
      };

      // Simulate complex operation that might fail
      const complexOperation = () => {
        const data = { plan: 'training-plan', workouts: [] };
        if (data.workouts.length === 0) {
          throw new Error('No workouts found in plan');
        }
        return data;
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        complexOperation,
        'complex-export-operation',
        exportOptions
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('complex-export-operation: No workouts found in plan');
      expect(mockConsole.error).toHaveBeenCalledWith('complex-export-operation: No workouts found in plan');
    });

    it('should handle invalid logging configuration gracefully', () => {
      const error = new Error('Invalid config error');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const options = {
        logging: { level: 'invalid' as any, backend: 'invalid' as any }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        'invalid-config-operation',
        options
      );

      expect(result.success).toBe(false);
      // Should fall back to default logger and warn about invalid config
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid logging config, using default logger:',
        expect.arrayContaining([
          'Invalid log level: invalid',
          'Invalid backend: invalid'
        ])
      );
      
      consoleSpy.mockRestore();
    });

    it('should work with all LOGGING_PRESETS', () => {
      const error = new Error('Preset test error');
      
      // Test each preset
      const presets = [
        { name: 'development', preset: LOGGING_PRESETS.development, shouldLog: true },
        { name: 'production', preset: LOGGING_PRESETS.production, shouldLog: false },
        { name: 'testing', preset: LOGGING_PRESETS.testing, shouldLog: false },
        { name: 'debug', preset: LOGGING_PRESETS.debug, shouldLog: true },
      ];

      presets.forEach(({ name, preset, shouldLog }) => {
        vi.clearAllMocks();
        
        const options = { logging: preset };
        const result = TypeSafeErrorHandler.handleErrorWithOptions(
          () => { throw error; },
          `${name}-preset-operation`,
          options
        );
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(`${name}-preset-operation: Preset test error`);
        
        if (shouldLog) {
          expect(mockConsole.error).toHaveBeenCalledWith(`${name}-preset-operation: Preset test error`);
        } else {
          expect(mockConsole.error).not.toHaveBeenCalled();
        }
      });
    });

    it('should preserve return types correctly', () => {
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      // Test with different return types
      const stringResult = TypeSafeErrorHandler.handleErrorWithOptions(
        () => 'test-string',
        'string-operation',
        options
      );
      expect(stringResult.success).toBe(true);
      expect(stringResult.data).toBe('test-string');

      const numberResult = TypeSafeErrorHandler.handleErrorWithOptions(
        () => 42,
        'number-operation',
        options
      );
      expect(numberResult.success).toBe(true);
      expect(numberResult.data).toBe(42);

      const objectResult = TypeSafeErrorHandler.handleErrorWithOptions(
        () => ({ id: 1, name: 'test' }),
        'object-operation',
        options
      );
      expect(objectResult.success).toBe(true);
      expect(objectResult.data).toEqual({ id: 1, name: 'test' });

      const arrayResult = TypeSafeErrorHandler.handleErrorWithOptions(
        () => [1, 2, 3],
        'array-operation',
        options
      );
      expect(arrayResult.success).toBe(true);
      expect(arrayResult.data).toEqual([1, 2, 3]);
    });
  });

  describe('Integration with Existing Error Handler Methods', () => {
    it('should maintain backward compatibility with existing handleValidationError', () => {
      const error = createTestValidationError();
      
      // Test that existing method still works
      const existingResult = TypeSafeErrorHandler.handleValidationError(
        error,
        'existing-validation',
        defaultLogger
      );
      
      // Test that new method with no options produces same result
      const newResult = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'existing-validation'
      );
      
      expect(existingResult.success).toBe(newResult.success);
      expect(existingResult.error).toBe(newResult.error);
    });

    it('should maintain backward compatibility with existing handleSchemaError', () => {
      const error = createTestSchemaError();
      
      // Test that existing method still works
      const existingResult = TypeSafeErrorHandler.handleSchemaError(
        error,
        'existing-schema-validation',
        defaultLogger
      );
      
      // Test that new method with no options produces same result
      const newResult = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'existing-schema-validation'
      );
      
      expect(existingResult.success).toBe(newResult.success);
      expect(existingResult.error).toBe(newResult.error);
    });

    it('should work seamlessly with getLoggerFromOptions utility', () => {
      const error = createTestValidationError();
      const options: LoggableOptions = {
        customField: 'test',
        logging: { level: 'info', backend: 'console' }
      };
      
      // Direct usage of getLoggerFromOptions
      const logger = getLoggerFromOptions(options);
      const directResult = TypeSafeErrorHandler.handleValidationError(
        error,
        'direct-usage',
        logger
      );
      
      // Usage through handleValidationErrorWithOptions
      const optionsResult = TypeSafeErrorHandler.handleValidationErrorWithOptions(
        error,
        'direct-usage',
        options
      );
      
      expect(directResult.success).toBe(optionsResult.success);
      expect(directResult.error).toBe(optionsResult.error);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle options with circular references gracefully', () => {
      const error = createTestValidationError();
      const circularOptions: any = {
        logging: { level: 'debug', backend: 'console' }
      };
      circularOptions.self = circularOptions;

      // Should not throw with circular reference
      expect(() => {
        const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
          error,
          'circular-options',
          circularOptions
        );
        expect(result.success).toBe(false);
      }).not.toThrow();
    });

    it('should handle options with symbol properties', () => {
      const error = createTestSchemaError();
      const symbolKey = Symbol('test-symbol');
      const options = {
        [symbolKey]: 'symbol-value',
        normalField: 'normal-value',
        logging: { level: 'warn' as const, backend: 'console' as const }
      };

      const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
        error,
        'symbol-options',
        options
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should handle deeply nested logging configuration', () => {
      const error = new Error('Deep config error');
      const deepOptions = {
        level1: {
          level2: {
            value: 'deep'
          }
        },
        logging: {
          level: 'debug' as const,
          backend: 'console' as const
        }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => { throw error; },
        'deep-config-operation',
        deepOptions
      );

      expect(result.success).toBe(false);
      expect(mockConsole.error).toHaveBeenCalledWith('deep-config-operation: Deep config error');
    });

    it('should handle operations that return undefined', () => {
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => undefined,
        'undefined-operation',
        options
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(undefined);
    });

    it('should handle operations that return null', () => {
      const options: LoggableOptions = {
        logging: { level: 'debug', backend: 'console' }
      };

      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => null,
        'null-operation',
        options
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });
  });
});