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
  (data: unknown): data is T;
}

/**
 * Result type for type-safe operations
 */
export interface TypedResult<T> {
  success: boolean;
  data: T;
  error: TypeValidationError;
}

/**
 * Type validation error for runtime type checking failures
 */
export class TypeValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly expectedType?: string,
    public readonly actualValue?: unknown
  ) {
    super(message);
    this.name = 'TypeValidationError';
  }

  /**
   * Create an error for a missing required field
   */
  static missingField(field: string): TypeValidationError {
    return new TypeValidationError(
      `Missing required field: ${field}`,
      field,
      'required',
      undefined
    );
  }

  /**
   * Create an error for an incorrect type
   */
  static incorrectType(field: string, expected: string, actual: unknown): TypeValidationError {
    return new TypeValidationError(
      `Field '${field}' expected ${expected}, got ${typeof actual}`,
      field,
      expected,
      actual
    );
  }

  /**
   * Create an error for an invalid value
   */
  static invalidValue(field: string, value: unknown, constraint: string): TypeValidationError {
    return new TypeValidationError(
      `Field '${field}' has invalid value: ${constraint}`,
      field,
      constraint,
      value
    );
  }
}

/**
 * Success result factory
 */
export function createSuccessResult<T>(data: T): TypedResult<T> {
  return {
    success: true,
    data,
    error: null as any // Will not be accessed when success is true
  };
}

/**
 * Error result factory
 */
export function createErrorResult<T>(error: TypeValidationError): TypedResult<T> {
  return {
    success: false,
    data: null as any, // Will not be accessed when success is false
    error
  };
}