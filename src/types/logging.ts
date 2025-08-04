/**
 * Configurable Logging System
 * 
 * Lightweight logging abstraction that eliminates the need for ESLint disable
 * directives while maintaining full debugging capabilities. Supports multiple
 * backends and configurable log levels for different environments.
 * 
 * @fileoverview Type-safe logging utilities with zero-overhead silent mode
 */

/* global console */

/**
 * Log levels in order of severity
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * Available logging backends
 */
export type LogBackend = 'console' | 'silent' | 'custom';

/**
 * Core logging interface
 * All loggers must implement this interface for consistency
 */
export interface Logger {
  /** Log error messages with optional context */
  error(message: string, context?: Record<string, unknown>): void;
  /** Log warning messages with optional context */
  warn(message: string, context?: Record<string, unknown>): void;
  /** Log informational messages with optional context */
  info(message: string, context?: Record<string, unknown>): void;
  /** Log debug messages with optional context */
  debug(message: string, context?: Record<string, unknown>): void;
}

/**
 * Logging configuration options
 */
export interface LoggingConfig {
  /** Minimum log level to output (messages below this level are ignored) */
  level: LogLevel;
  /** Backend implementation to use */
  backend: LogBackend;
  /** Custom logger implementation (required when backend is 'custom') */
  customLogger?: Logger;
}

/**
 * Default logging configuration
 * Console logging with error level for development debugging
 */
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  level: 'error',
  backend: 'console',
};

/**
 * Silent logging configuration
 * No output - useful for production or testing environments
 */
export const SILENT_LOGGING_CONFIG: LoggingConfig = {
  level: 'silent',
  backend: 'silent',
};

/**
 * Development logging configuration
 * Full console output for debugging
 */
export const DEVELOPMENT_LOGGING_CONFIG: LoggingConfig = {
  level: 'debug',
  backend: 'console',
};

/**
 * Log level priorities for filtering
 * Higher numbers = higher priority
 */
const LOG_LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

/**
 * Determine if a message should be logged based on configuration
 */
function shouldLog(messageLevel: LogLevel, configLevel: LogLevel): boolean {
  return LOG_LEVEL_PRIORITIES[messageLevel] >= LOG_LEVEL_PRIORITIES[configLevel];
}

/**
 * Console-based logger implementation
 * Maps directly to console.* methods
 */
class ConsoleLogger implements Logger {
  constructor(private config: LoggingConfig) {}

  error(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('error', this.config.level)) {
      if (context) {
        console.error(message, context);
      } else {
        console.error(message);
      }
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('warn', this.config.level)) {
      if (context) {
        console.warn(message, context);
      } else {
        console.warn(message);
      }
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('info', this.config.level)) {
      if (context) {
        console.info(message, context);
      } else {
        console.info(message);
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('debug', this.config.level)) {
      if (context) {
        console.debug(message, context);
      } else {
        console.debug(message);
      }
    }
  }
}

/**
 * Silent logger implementation
 * All methods are no-ops for zero runtime overhead
 */
class SilentLogger implements Logger {
  error(): void {
    // No-op
  }

  warn(): void {
    // No-op
  }

  info(): void {
    // No-op
  }

  debug(): void {
    // No-op
  }
}

/**
 * Create a logger instance based on configuration
 * 
 * @param config Logging configuration options
 * @returns Configured logger instance
 * 
 * @example
 * ```typescript
 * // Console logging (development)
 * const logger = createLogger({ level: 'debug', backend: 'console' });
 * logger.error('Validation failed', { field: 'name', expected: 'string' });
 * 
 * // Silent logging (production)
 * const logger = createLogger({ level: 'silent', backend: 'silent' });
 * logger.error('This will not output anything');
 * 
 * // Custom logging
 * const customLogger = createLogger({
 *   level: 'error',
 *   backend: 'custom',
 *   customLogger: myWinstonLogger
 * });
 * ```
 */
export function createLogger(config: LoggingConfig = DEFAULT_LOGGING_CONFIG): Logger {
  switch (config.backend) {
    case 'console':
      return new ConsoleLogger(config);
    case 'silent':
      return new SilentLogger();
    case 'custom':
      if (!config.customLogger) {
        throw new Error('Custom logger required when backend is "custom"');
      }
      return config.customLogger;
    default:
      throw new Error(`Unknown logging backend: ${config.backend}`);
  }
}

/**
 * Default logger instance for global use
 * Uses console backend with error level - maintains current behavior
 */
export const defaultLogger = createLogger(DEFAULT_LOGGING_CONFIG);

/**
 * Silent logger instance for testing/production use
 * All logging calls become no-ops
 */
export const silentLogger = createLogger(SILENT_LOGGING_CONFIG);

/**
 * Development logger instance for debugging
 * Full console output at all levels
 */
export const developmentLogger = createLogger(DEVELOPMENT_LOGGING_CONFIG);

/**
 * Validate logging configuration
 * Ensures configuration is valid before creating logger
 */
export function validateLoggingConfig(config: LoggingConfig): string[] {
  const errors: string[] = [];

  // Validate log level
  if (!(config.level in LOG_LEVEL_PRIORITIES)) {
    errors.push(`Invalid log level: ${config.level}`);
  }

  // Validate backend
  if (!['console', 'silent', 'custom'].includes(config.backend)) {
    errors.push(`Invalid backend: ${config.backend}`);
  }

  // Validate custom logger requirement
  if (config.backend === 'custom' && !config.customLogger) {
    errors.push('Custom logger is required when backend is "custom"');
  }

  // Validate custom logger interface
  if (config.customLogger) {
    const required = ['error', 'warn', 'info', 'debug'];
    const missing = required.filter(method => 
      typeof (config.customLogger as any)?.[method] !== 'function'
    );
    if (missing.length > 0) {
      errors.push(`Custom logger missing methods: ${missing.join(', ')}`);
    }
  }

  return errors;
}

/**
 * Type guard to check if an object implements the Logger interface
 */
export function isLogger(obj: unknown): obj is Logger {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const logger = obj as any;
  return (
    typeof logger.error === 'function' &&
    typeof logger.warn === 'function' &&
    typeof logger.info === 'function' &&
    typeof logger.debug === 'function'
  );
}

/**
 * Extract logger from options object or return default logger
 * 
 * Provides graceful fallback handling for various scenarios:
 * - Null/undefined options → defaultLogger
 * - Options without logging config → defaultLogger  
 * - Invalid logging config → defaultLogger (with warning)
 * - Logger creation failure → defaultLogger (with warning)
 * 
 * @param options Options object that may contain logging configuration
 * @returns Logger instance (either configured or default)
 * 
 * @example
 * ```typescript
 * // Basic usage - returns defaultLogger
 * const logger1 = getLoggerFromOptions();
 * const logger2 = getLoggerFromOptions({});
 * const logger3 = getLoggerFromOptions({ logging: undefined });
 * 
 * // With logging configuration - returns configured logger
 * const logger4 = getLoggerFromOptions({
 *   logging: { level: 'debug', backend: 'console' }
 * });
 * 
 * // Export options with logging
 * const exportOptions: BaseExportOptions = {
 *   includePaces: true,
 *   logging: { level: 'info', backend: 'console' }
 * };
 * const logger5 = getLoggerFromOptions(exportOptions);
 * ```
 */
export function getLoggerFromOptions(options?: { logging?: LoggingConfig }): Logger {
  try {
    // Handle null/undefined options or missing logging config
    if (!options?.logging) {
      return defaultLogger;
    }
    
    // Validate logging configuration
    const validationErrors = validateLoggingConfig(options.logging);
    if (validationErrors.length > 0) {
      console.warn('Invalid logging config, using default logger:', validationErrors);
      return defaultLogger;
    }
    
    // Create and return configured logger
    return createLogger(options.logging);
  } catch (error) {
    console.warn('Failed to create logger from options, using default logger:', error);
    return defaultLogger;
  }
}

/**
 * Create options with logging configuration while preserving generic type information
 * 
 * This utility function adds logging configuration to an existing options object
 * while maintaining full TypeScript type safety and generic type constraints.
 * 
 * @template T Generic type constraint for custom fields
 * @param options Base options object to extend with logging
 * @param logging Logging configuration to add
 * @returns New options object with logging configuration added
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const baseOptions = { customField: "value", timeout: 5000 };
 * const optionsWithLogging = withLogging(baseOptions, {
 *   level: 'debug',
 *   backend: 'console'
 * });
 * // Type: LoggableOptions<{ customField: string; timeout: number }>
 * 
 * // With export options
 * const exportOptions = { includePaces: true };
 * const exportWithLogging = withLogging(exportOptions, LOGGING_PRESETS.development);
 * 
 * // Using with preset configurations
 * const debugOptions = withLogging({ apiKey: "secret" }, LOGGING_PRESETS.debug);
 * ```
 */
export function withLogging<T extends Record<string, unknown>>(
  options: import('./base-types').TypedOptions<T>, 
  logging: LoggingConfig
): import('./base-types').LoggableOptions<T> {
  return { ...options, logging };
}

/**
 * Common logging configurations for different environments
 * 
 * Provides pre-configured logging setups for typical use cases, making it easy
 * to apply consistent logging behavior across different environments and scenarios.
 * These presets are tree-shakable for bundle optimization.
 * 
 * @example Environment-Specific Configurations
 * ```typescript
 * // Development - full console output for debugging
 * const devOptions = withLogging(options, LOGGING_PRESETS.development);
 * 
 * // Production - silent logging for performance
 * const prodOptions = withLogging(options, LOGGING_PRESETS.production);
 * 
 * // Testing - silent logging to avoid test output pollution
 * const testOptions = withLogging(options, LOGGING_PRESETS.testing);
 * 
 * // Debug - verbose console output for troubleshooting
 * const debugOptions = withLogging(options, LOGGING_PRESETS.debug);
 * ```
 * 
 * @example Migration from Manual Console Statements
 * ```typescript
 * // Before: Direct console usage scattered throughout code
 * function processData(data: unknown) {
 *   console.log('Processing data...'); // No configuration
 *   try {
 *     // ... processing logic
 *   } catch (error) {
 *     console.error('Processing failed:', error); // Always outputs
 *   }
 * }
 * 
 * // After: Configurable logging through options
 * function processData(data: unknown, options?: LoggableOptions) {
 *   const logger = getLoggerFromOptions(options);
 *   logger.info('Processing data...'); // Respects configuration
 *   
 *   try {
 *     // ... processing logic
 *   } catch (error) {
 *     logger.error('Processing failed:', { error: error.message }); // Configurable
 *   }
 * }
 * 
 * // Usage with different environments
 * processData(data, withLogging({}, LOGGING_PRESETS.development)); // Logs everything
 * processData(data, withLogging({}, LOGGING_PRESETS.production));  // Silent
 * processData(data); // Uses default logging behavior
 * ```
 * 
 * @example Migration from ESLint Disable Comments
 * ```typescript
 * // Before: ESLint disable comments required
 * function validateInput(input: unknown) {
 *   if (!input) {
 *     // eslint-disable-next-line no-console
 *     console.warn('Input validation warning'); // ESLint violation
 *     return false;
 *   }
 *   return true;
 * }
 * 
 * // After: Clean logging without ESLint issues
 * function validateInput(input: unknown, options?: LoggableOptions) {
 *   const logger = getLoggerFromOptions(options);
 *   
 *   if (!input) {
 *     logger.warn('Input validation warning'); // No ESLint violation
 *     return false;
 *   }
 *   return true;
 * }
 * 
 * // Environment-specific usage
 * const isValid = validateInput(data, {
 *   logging: process.env.NODE_ENV === 'development' 
 *     ? LOGGING_PRESETS.development 
 *     : LOGGING_PRESETS.production
 * });
 * ```
 */
export const LOGGING_PRESETS = {
  /** Full console output with debug level - ideal for development environments */
  development: DEVELOPMENT_LOGGING_CONFIG,
  /** Silent logging - ideal for production environments */
  production: SILENT_LOGGING_CONFIG,
  /** Silent logging - ideal for testing environments to avoid output pollution */
  testing: SILENT_LOGGING_CONFIG,
  /** Verbose console output - ideal for troubleshooting specific issues */
  debug: { level: 'debug' as const, backend: 'console' as const },
} as const;

/**
 * Migration Guide: From Manual Error Handling to Options-Based Logging
 * 
 * This guide demonstrates how to migrate existing error handling patterns to use
 * the new configurable logging system. The migration is backward compatible and
 * can be done incrementally.
 * 
 * ## Key Migration Patterns
 * 
 * ### Pattern 1: Manual Console Error Statements
 * 
 * ```typescript
 * // Before: Manual error handling with direct console usage
 * function exportTrainingPlan(plan: TrainingPlan, format: ExportFormat) {
 *   try {
 *     const result = generateExport(plan, format);
 *     return result;
 *   } catch (error) {
 *     console.error('Export failed:', error.message); // Always logs
 *     throw error;
 *   }
 * }
 * 
 * // After: Options-based configurable logging
 * function exportTrainingPlan(
 *   plan: TrainingPlan, 
 *   format: ExportFormat,
 *   options?: BaseExportOptions
 * ) {
 *   const logger = getLoggerFromOptions(options);
 *   
 *   try {
 *     const result = generateExport(plan, format);
 *     logger.info('Export completed successfully', { format });
 *     return result;
 *   } catch (error) {
 *     logger.error('Export failed', { format, error: error.message }); // Configurable
 *     throw error;
 *   }
 * }
 * 
 * // Usage examples:
 * // Development: Full logging
 * exportTrainingPlan(plan, 'pdf', { logging: LOGGING_PRESETS.development });
 * 
 * // Production: Silent logging  
 * exportTrainingPlan(plan, 'pdf', { logging: LOGGING_PRESETS.production });
 * 
 * // Backward compatible: No logging config (uses default)
 * exportTrainingPlan(plan, 'pdf');
 * ```
 * 
 * ### Pattern 2: TypeSafeErrorHandler Integration
 * 
 * ```typescript
 * // Before: Direct error handler usage with manual logging
 * function validateExportConfig(config: ExportConfig) {
 *   try {
 *     // Validation logic...
 *     return { success: true, data: config };
 *   } catch (error) {
 *     console.error('Validation failed:', error); // Manual logging
 *     
 *     if (error instanceof TypeValidationError) {
 *       return TypeSafeErrorHandler.handleValidationError(error, 'config-validation');
 *     }
 *     
 *     throw error;
 *   }
 * }
 * 
 * // After: Options-aware error handling with automatic logging
 * function validateExportConfig(config: ExportConfig, options?: LoggableOptions) {
 *   try {
 *     // Validation logic...
 *     return { success: true, data: config };
 *   } catch (error) {
 *     if (error instanceof TypeValidationError) {
 *       // Error handler automatically uses logging config from options
 *       return TypeSafeErrorHandler.handleValidationErrorWithOptions(
 *         error, 
 *         'config-validation',
 *         options // Logging configuration applied automatically
 *       );
 *     }
 *     
 *     // General error handling with options-based logging
 *     return TypeSafeErrorHandler.handleErrorWithOptions(
 *       () => { throw error; },
 *       'config-validation',
 *       options
 *     );
 *   }
 * }
 * 
 * // Usage with different logging configurations:
 * const devResult = validateExportConfig(config, { 
 *   logging: LOGGING_PRESETS.development 
 * });
 * const prodResult = validateExportConfig(config, { 
 *   logging: LOGGING_PRESETS.production 
 * });
 * ```
 * 
 * ### Pattern 3: Function Parameter Evolution
 * 
 * ```typescript
 * // Before: Fixed logger parameter
 * function processWorkouts(workouts: Workout[], logger?: Logger) {
 *   const actualLogger = logger || defaultLogger;
 *   actualLogger.info('Processing workouts...');
 *   // ... processing logic
 * }
 * 
 * // After: Options-based approach (more flexible)
 * function processWorkouts(workouts: Workout[], options?: LoggableOptions) {
 *   const logger = getLoggerFromOptions(options);
 *   logger.info('Processing workouts...', { count: workouts.length });
 *   // ... processing logic
 *   
 *   // Can also access other options if needed
 *   if (options?.customField) {
 *     logger.debug('Custom processing enabled', { customField: options.customField });
 *   }
 * }
 * 
 * // Migration is backward compatible:
 * processWorkouts(workouts); // Uses default logging
 * processWorkouts(workouts, { logging: LOGGING_PRESETS.debug }); // Configurable
 * ```
 * 
 * ### Pattern 4: Environment-Specific Configuration
 * 
 * ```typescript
 * // Before: Environment checks scattered throughout code
 * function generateReport(data: ReportData) {
 *   if (process.env.NODE_ENV === 'development') {
 *     console.log('Generating report with data:', data);
 *   }
 *   
 *   try {
 *     const report = createReport(data);
 *     
 *     if (process.env.NODE_ENV === 'development') {
 *       console.log('Report generated successfully');
 *     }
 *     
 *     return report;
 *   } catch (error) {
 *     if (process.env.NODE_ENV !== 'test') {
 *       console.error('Report generation failed:', error);
 *     }
 *     throw error;
 *   }
 * }
 * 
 * // After: Centralized environment configuration
 * function generateReport(data: ReportData, options?: LoggableOptions) {
 *   const logger = getLoggerFromOptions(options);
 *   
 *   logger.debug('Generating report with data', { dataKeys: Object.keys(data) });
 *   
 *   try {
 *     const report = createReport(data);
 *     logger.info('Report generated successfully');
 *     return report;
 *   } catch (error) {
 *     logger.error('Report generation failed', { error: error.message });
 *     throw error;
 *   }
 * }
 * 
 * // Environment configuration at application level:
 * const getEnvironmentLogging = () => {
 *   switch (process.env.NODE_ENV) {
 *     case 'development': return LOGGING_PRESETS.development;
 *     case 'production': return LOGGING_PRESETS.production;
 *     case 'test': return LOGGING_PRESETS.testing;
 *     default: return LOGGING_PRESETS.development;
 *   }
 * };
 * 
 * // Usage:
 * const report = generateReport(data, { logging: getEnvironmentLogging() });
 * ```
 * 
 * ## Migration Checklist
 * 
 * ### Phase 1: Identify Current Patterns
 * - [ ] Find all direct `console.*` usage in your codebase
 * - [ ] Locate ESLint disable comments for console statements
 * - [ ] Identify functions that accept Logger parameters
 * - [ ] Find environment-specific logging code (`if (NODE_ENV...)`)
 * 
 * ### Phase 2: Update Function Signatures (Backward Compatible)
 * - [ ] Add optional `options?: LoggableOptions` parameters
 * - [ ] Keep existing Logger parameters for compatibility
 * - [ ] Update JSDoc to document new logging capabilities
 * 
 * ### Phase 3: Replace Direct Console Usage
 * - [ ] Replace `console.*` calls with `getLoggerFromOptions(options)`
 * - [ ] Remove ESLint disable comments
 * - [ ] Add structured logging with context objects
 * 
 * ### Phase 4: Integrate Error Handlers
 * - [ ] Replace direct TypeSafeErrorHandler calls with `*WithOptions` variants
 * - [ ] Update error handling to pass options through call chain
 * - [ ] Test error logging in different environments
 * 
 * ### Phase 5: Environment Configuration
 * - [ ] Set up centralized environment logging configuration
 * - [ ] Replace scattered environment checks with preset usage
 * - [ ] Test logging behavior across all environments
 * 
 * ### Phase 6: Cleanup (Optional)
 * - [ ] Remove deprecated Logger parameters once options are adopted
 * - [ ] Consolidate logging configuration logic
 * - [ ] Update documentation and examples
 */