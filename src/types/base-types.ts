/**
 * Base Types for Runtime Type Validation
 *
 * This module defines the core types and classes used for runtime type checking
 * and validation throughout the application.
 */

/**
 * Type guard function that validates data at runtime
 */
export interface TypeGuard<T> {
  check: (data: unknown) => data is T;
  name: string;
}

/**
 * Schema definition for structured data validation
 */
export interface TypedSchema<T> {
  validate: (data: unknown) => TypedResult<T, TypeValidationError>;
  properties: Record<string, unknown>;
  required: string[];
  name: string;
}

/**
 * Type-safe collection with metadata
 */
export interface TypedCollection<T> {
  items: T[];
  count: number;
  metadata: {
    type: string;
    indexed: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Extract element type from array
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Generic options type for type-safe configurations
 */
export interface TypedOptions<
  TCustomFields extends Record<string, unknown> = Record<string, unknown>,
> {
  [key: string]: unknown;
}

/**
 * Generic options type with optional logging configuration
 * 
 * Extends TypedOptions to include logging capabilities for any system that uses
 * type-safe configuration objects. The logging property is optional, ensuring
 * complete backward compatibility with existing code.
 * 
 * This interface enables system-wide logging configuration by allowing any options
 * object to include logging settings. Systems can extract loggers using utility
 * functions and apply consistent logging behavior across operations.
 * 
 * @template TCustomFields Type-constrained custom fields for configuration extensions
 * 
 * @example Basic Usage with Logging Configuration
 * ```typescript
 * import { LoggableOptions, getLoggerFromOptions } from './base-types';
 * 
 * const options: LoggableOptions = {
 *   customField: "value",
 *   logging: { level: 'debug', backend: 'console' }
 * };
 * 
 * // Extract logger from options
 * const logger = getLoggerFromOptions(options);
 * logger.debug('Processing with configured logger');
 * ```
 * 
 * @example Using Logging Presets for Different Environments
 * ```typescript
 * import { LoggableOptions, withLogging, LOGGING_PRESETS } from './logging';
 * 
 * // Development environment - full debug output
 * const devOptions = withLogging(
 *   { apiTimeout: 5000 }, 
 *   LOGGING_PRESETS.development
 * );
 * 
 * // Production environment - silent logging
 * const prodOptions = withLogging(
 *   { apiTimeout: 5000 }, 
 *   LOGGING_PRESETS.production
 * );
 * 
 * // Custom debug configuration
 * const debugOptions: LoggableOptions = {
 *   apiTimeout: 5000,
 *   logging: { level: 'debug', backend: 'console' }
 * };
 * ```
 * 
 * @example Extending for Specific Option Types
 * ```typescript
 * interface MyApiOptions extends LoggableOptions<{ retryCount: number }> {
 *   timeout: number;
 *   endpoint: string;
 * }
 * 
 * const apiOptions: MyApiOptions = {
 *   timeout: 5000,
 *   endpoint: 'https://api.example.com',
 *   retryCount: 3,
 *   logging: { level: 'info', backend: 'console' }
 * };
 * 
 * // Type-safe access to both standard and custom fields
 * const logger = getLoggerFromOptions(apiOptions);
 * logger.info(`Connecting to ${apiOptions.endpoint} with ${apiOptions.retryCount} retries`);
 * ```
 * 
 * @example Error Handling with Logging Configuration
 * ```typescript
 * import { TypeSafeErrorHandler } from './error-types';
 * 
 * const options: LoggableOptions = {
 *   operationId: 'data-export',
 *   logging: { level: 'error', backend: 'console' }
 * };
 * 
 * // Error handlers automatically use logging configuration from options
 * const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
 *   validationError,
 *   'user-input-validation',
 *   options
 * );
 * ```
 * 
 * @see {@link getLoggerFromOptions} For extracting loggers from options
 * @see {@link withLogging} For adding logging configuration to existing options
 * @see {@link LOGGING_PRESETS} For common environment-specific configurations
 * @see {@link TypeSafeErrorHandler} For error handling with logging configuration
 */
export interface LoggableOptions<
  TCustomFields extends Record<string, unknown> = Record<string, unknown>,
> extends TypedOptions<TCustomFields> {
  /** 
   * Optional logging configuration for this operation
   * 
   * When provided, systems should use this configuration to create loggers
   * for the duration of the operation. When omitted, systems should use
   * their default logging behavior.
   * 
   * @see {@link import('./logging').LoggingConfig} for configuration options
   */
  logging?: import('./logging').LoggingConfig;
}

/**
 * Result type for type-safe operations
 */
export type TypedResult<T, E = TypeValidationError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Type validation error for runtime type checking failures
 */
export class TypeValidationError extends Error {
  constructor(
    message: string,
    public readonly expectedType: string,
    public readonly actualValue: unknown,
    public readonly validationContext?: string,
  ) {
    super(message);
    this.name = "TypeValidationError";
  }

  /**
   * Create an error for a missing required field
   */
  static missingField(field: string): TypeValidationError {
    return new TypeValidationError(
      `Missing required field: ${field}`,
      "required",
      undefined,
      field,
    );
  }

  /**
   * Create an error for an incorrect type
   */
  static incorrectType(
    field: string,
    expected: string,
    actual: unknown,
  ): TypeValidationError {
    return new TypeValidationError(
      `Field '${field}' expected ${expected}, got ${typeof actual}`,
      expected,
      actual,
      field,
    );
  }

  /**
   * Create an error for an invalid value
   */
  static invalidValue(
    field: string,
    value: unknown,
    constraint: string,
  ): TypeValidationError {
    return new TypeValidationError(
      `Field '${field}' has invalid value: ${constraint}`,
      constraint,
      value,
      field,
    );
  }
}

/**
 * Schema validation error for object structure validation failures
 */
export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public readonly schemaName: string,
    public readonly failedProperties: string[],
    public readonly actualValue: unknown,
    public readonly validationContext?: string,
  ) {
    super(message);
    this.name = "SchemaValidationError";
  }
}

/**
 * Success result factory
 */
export function createSuccessResult<T, E = TypeValidationError>(
  data: T,
): TypedResult<T, E> {
  return {
    success: true,
    data,
  };
}

/**
 * Error result factory
 */
export function createErrorResult<T, E = TypeValidationError>(
  error: E,
): TypedResult<T, E> {
  return {
    success: false,
    error,
  };
}
