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
