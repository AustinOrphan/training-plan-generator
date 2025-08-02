/**
 * Error Handling Types for Type Validation Failures
 *
 * Comprehensive error handling system for type validation failures throughout
 * the training plan generator. Provides structured error types, factory functions,
 * and consistent error messaging for type safety violations.
 *
 * @fileoverview Type-safe error handling utilities
 */

import {
  TypeValidationError,
  SchemaValidationError,
  TypedResult,
} from "./base-types";
import type { ValidationError, ValidationWarning } from "../validation";

/**
 * Enhanced validation error that includes type information
 * Extends the existing ValidationError interface with type-specific data
 */
export interface TypedValidationError extends ValidationError {
  /** The expected type that was not matched */
  expectedType: string;
  /** The actual value that failed validation */
  actualValue: unknown;
  /** Additional type context for debugging */
  typeContext?: {
    /** Path to the property that failed (e.g., 'config.preferences.timeConstraints') */
    propertyPath: string;
    /** Available type alternatives for this field */
    availableTypes?: string[];
    /** Validation rule that was violated */
    violatedRule?: string;
  };
}

/**
 * Type-specific validation warning with type information
 * Extends ValidationWarning with type safety context
 */
export interface TypedValidationWarning extends ValidationWarning {
  /** The type that caused the warning */
  warningType: string;
  /** Suggested type improvements */
  typeRecommendation?: string;
  /** Performance impact of the type issue */
  performanceImpact?: "none" | "low" | "medium" | "high";
}

/**
 * Comprehensive validation result that includes both regular and type-specific errors
 * Extends the existing ValidationResult with type safety information
 */
export interface TypedValidationResult {
  /** Whether the validation passed without errors */
  isValid: boolean;
  /** Regular validation errors */
  errors: ValidationError[];
  /** Type-specific validation errors */
  typeErrors: TypedValidationError[];
  /** Regular validation warnings */
  warnings: ValidationWarning[];
  /** Type-specific validation warnings */
  typeWarnings: TypedValidationWarning[];
  /** Summary of type issues found */
  typeSummary: {
    totalTypeErrors: number;
    totalTypeWarnings: number;
    affectedProperties: string[];
    severityLevel: "none" | "low" | "medium" | "high";
  };
}

/**
 * Error factory for creating consistent type validation errors
 * Provides standardized error creation with proper typing and context
 */
export class TypeValidationErrorFactory {
  /**
   * Create a type mismatch error
   * Used when a value doesn't match its expected type
   */
  static createTypeMismatchError(
    field: string,
    expectedType: string,
    actualValue: unknown,
    context?: string,
  ): TypeValidationError {
    const actualType = actualValue === null ? "null" : typeof actualValue;
    const message = `Type mismatch in field '${field}': expected ${expectedType}, got ${actualType}`;

    return new TypeValidationError(message, expectedType, actualValue, context);
  }

  /**
   * Create a schema validation error
   * Used when an object doesn't conform to its schema
   */
  static createSchemaError(
    schemaName: string,
    failedProperties: string[],
    actualValue: unknown,
    context?: string,
  ): SchemaValidationError {
    const message = `Schema validation failed for '${schemaName}': missing or invalid properties [${failedProperties.join(", ")}]`;

    return new SchemaValidationError(
      message,
      schemaName,
      failedProperties,
      actualValue,
    );
  }

  /**
   * Create a generic type validation error
   * Used for complex type validation scenarios
   */
  static createGenericTypeError(
    message: string,
    expectedType: string,
    actualValue: unknown,
    context?: string,
  ): TypeValidationError {
    return new TypeValidationError(message, expectedType, actualValue, context);
  }

  /**
   * Create a typed validation error from existing ValidationError
   * Converts regular validation errors to type-aware ones
   */
  static fromValidationError(
    validationError: ValidationError,
    expectedType: string,
    actualValue: unknown,
  ): TypedValidationError {
    return {
      ...validationError,
      expectedType,
      actualValue,
      typeContext: {
        propertyPath: validationError.field,
        violatedRule: "type-conversion",
      },
    };
  }
}

/**
 * Result builder for creating comprehensive typed validation results
 * Provides fluent interface for building validation results with type information
 */
export class TypedValidationResultBuilder {
  private errors: ValidationError[] = [];
  private typeErrors: TypedValidationError[] = [];
  private warnings: ValidationWarning[] = [];
  private typeWarnings: TypedValidationWarning[] = [];

  /**
   * Add a regular validation error
   */
  addError(field: string, message: string, context?: unknown): this {
    this.errors.push({ field, message, severity: "error", context });
    return this;
  }

  /**
   * Add a type-specific validation error
   */
  addTypeError(
    field: string,
    message: string,
    expectedType: string,
    actualValue: unknown,
    context?: unknown,
  ): this {
    this.typeErrors.push({
      field,
      message,
      severity: "error",
      context,
      expectedType,
      actualValue,
      typeContext: {
        propertyPath: field,
      },
    });
    return this;
  }

  /**
   * Add a regular validation warning
   */
  addWarning(field: string, message: string, context?: unknown): this {
    this.warnings.push({ field, message, severity: "warning", context });
    return this;
  }

  /**
   * Add a type-specific validation warning
   */
  addTypeWarning(
    field: string,
    message: string,
    warningType: string,
    recommendation?: string,
    context?: unknown,
  ): this {
    this.typeWarnings.push({
      field,
      message,
      severity: "warning",
      context,
      warningType,
      typeRecommendation: recommendation,
    });
    return this;
  }

  /**
   * Build the final validation result
   */
  build(): TypedValidationResult {
    const totalTypeErrors = this.typeErrors.length;
    const totalTypeWarnings = this.typeWarnings.length;
    const affectedProperties = [
      ...new Set([
        ...this.typeErrors.map((e) => e.field),
        ...this.typeWarnings.map((w) => w.field),
      ]),
    ];

    // Determine severity level based on error counts
    let severityLevel: "none" | "low" | "medium" | "high" = "none";
    if (totalTypeErrors > 10 || totalTypeWarnings > 20) {
      severityLevel = "high";
    } else if (totalTypeErrors > 5 || totalTypeWarnings > 10) {
      severityLevel = "medium";
    } else if (totalTypeErrors > 0 || totalTypeWarnings > 5) {
      severityLevel = "low";
    }

    return {
      isValid: this.errors.length === 0 && this.typeErrors.length === 0,
      errors: [...this.errors],
      typeErrors: [...this.typeErrors],
      warnings: [...this.warnings],
      typeWarnings: [...this.typeWarnings],
      typeSummary: {
        totalTypeErrors,
        totalTypeWarnings,
        affectedProperties,
        severityLevel,
      },
    };
  }

  /**
   * Reset the builder for reuse
   */
  reset(): this {
    this.errors = [];
    this.typeErrors = [];
    this.warnings = [];
    this.typeWarnings = [];
    return this;
  }
}

/**
 * Utility functions for working with typed results
 * Provides helper functions for common result handling patterns
 */
export class TypedResultUtils {
  /**
   * Check if a TypedResult is successful
   */
  static isSuccess<T, E>(
    result: TypedResult<T, E>,
  ): result is { success: true; data: T } {
    return result.success === true;
  }

  /**
   * Check if a TypedResult is an error
   */
  static isError<T, E>(
    result: TypedResult<T, E>,
  ): result is { success: false; error: E } {
    return result.success === false;
  }

  /**
   * Extract data from a successful result, or throw if error
   */
  static unwrap<T, E>(result: TypedResult<T, E>): T {
    if (this.isSuccess(result)) {
      return result.data;
    }
    if (result.error instanceof Error) {
      throw result.error;
    }
    throw new Error(`Operation failed: ${String(result.error)}`);
  }

  /**
   * Extract data from a successful result, or return default if error
   */
  static unwrapOr<T, E>(result: TypedResult<T, E>, defaultValue: T): T {
    return this.isSuccess(result) ? result.data : defaultValue;
  }

  /**
   * Transform the data in a successful result
   */
  static map<T, U, E>(
    result: TypedResult<T, E>,
    fn: (data: T) => U,
  ): TypedResult<U, E> {
    return this.isSuccess(result)
      ? { success: true, data: fn(result.data) }
      : result;
  }

  /**
   * Transform the error in a failed result
   */
  static mapError<T, E, F>(
    result: TypedResult<T, E>,
    fn: (error: E) => F,
  ): TypedResult<T, F> {
    return this.isError(result)
      ? { success: false, error: fn(result.error) }
      : result;
  }

  /**
   * Chain multiple operations that return TypedResult
   */
  static chain<T, U, E>(
    result: TypedResult<T, E>,
    fn: (data: T) => TypedResult<U, E>,
  ): TypedResult<U, E> {
    return this.isSuccess(result) ? fn(result.data) : result;
  }

  /**
   * Create a successful result
   */
  static success<T>(data: T): TypedResult<T, never> {
    return { success: true, data };
  }

  /**
   * Create an error result
   */
  static error<E>(error: E): TypedResult<never, E> {
    return { success: false, error };
  }
}

/**
 * Error aggregator for collecting multiple validation errors
 * Useful for batch validation operations
 */
export class ValidationErrorAggregator {
  private errors: TypeValidationError[] = [];
  private schemaErrors: SchemaValidationError[] = [];

  /**
   * Add a type validation error
   */
  addError(error: TypeValidationError): this {
    this.errors.push(error);
    return this;
  }

  /**
   * Add a schema validation error
   */
  addSchemaError(error: SchemaValidationError): this {
    this.schemaErrors.push(error);
    return this;
  }

  /**
   * Add multiple errors at once
   */
  addErrors(errors: (TypeValidationError | SchemaValidationError)[]): this {
    errors.forEach((error) => {
      if (error instanceof SchemaValidationError) {
        this.addSchemaError(error);
      } else {
        this.addError(error);
      }
    });
    return this;
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0 || this.schemaErrors.length > 0;
  }

  /**
   * Get all errors
   */
  getAllErrors(): (TypeValidationError | SchemaValidationError)[] {
    return [...this.errors, ...this.schemaErrors];
  }

  /**
   * Create a TypedResult based on accumulated errors
   */
  toResult<T>(
    data?: T,
  ): TypedResult<T, (TypeValidationError | SchemaValidationError)[]> {
    if (this.hasErrors()) {
      return { success: false, error: this.getAllErrors() };
    }
    if (data !== undefined) {
      return { success: true, data };
    }
    throw new Error("Cannot create successful result without data");
  }

  /**
   * Clear all accumulated errors
   */
  clear(): this {
    this.errors = [];
    this.schemaErrors = [];
    return this;
  }

  /**
   * Get error summary for reporting
   */
  getSummary(): {
    totalErrors: number;
    typeErrors: number;
    schemaErrors: number;
    affectedFields: string[];
  } {
    const allErrors = this.getAllErrors();
    const affectedFields = [
      ...new Set(allErrors.map((e) => e.validationContext || "unknown")),
    ];

    return {
      totalErrors: allErrors.length,
      typeErrors: this.errors.length,
      schemaErrors: this.schemaErrors.length,
      affectedFields,
    };
  }
}

/**
 * Type-safe error handler for common error scenarios
 * Provides standardized error handling patterns
 */
export class TypeSafeErrorHandler {
  /**
   * Handle type validation errors with proper logging and user feedback
   */
  static handleValidationError(
    error: TypeValidationError,
    context: string = "validation",
  ): TypedResult<never, string> {
    const userMessage = `${context}: ${error.message}`;

    // Log detailed error information for debugging
    // eslint-disable-next-line no-console
    console.error("Type validation error:", {
      message: error.message,
      expectedType: error.expectedType,
      actualValue: error.actualValue,
      context: error.validationContext,
      stack: error.stack,
    });

    return TypedResultUtils.error(userMessage);
  }

  /**
   * Handle schema validation errors with detailed feedback
   */
  static handleSchemaError(
    error: SchemaValidationError,
    context: string = "schema-validation",
  ): TypedResult<never, string> {
    const userMessage = `${context}: Schema '${error.schemaName}' validation failed. Issues with: ${error.failedProperties.join(", ")}`;

    // eslint-disable-next-line no-console
    console.error("Schema validation error:", {
      schemaName: error.schemaName,
      failedProperties: error.failedProperties,
      actualValue: error.actualValue,
      context: error.validationContext,
    });

    return TypedResultUtils.error(userMessage);
  }

  /**
   * Convert any error to a typed result with consistent handling
   */
  static safelyHandle<T>(
    operation: () => T,
    context: string = "operation",
  ): TypedResult<T, string> {
    try {
      const result = operation();
      return TypedResultUtils.success(result);
    } catch (error) {
      if (error instanceof TypeValidationError) {
        return this.handleValidationError(error, context);
      }
      if (error instanceof SchemaValidationError) {
        return this.handleSchemaError(error, context);
      }

      const message = error instanceof Error ? error.message : String(error);
      return TypedResultUtils.error(`${context}: ${message}`);
    }
  }
}
