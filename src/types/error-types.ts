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
import { defaultLogger, getLoggerFromOptions, type Logger, type LoggingConfig } from "./logging";
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
      context,
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
 * Provides standardized error handling patterns with configurable logging
 */
export class TypeSafeErrorHandler {
  /**
   * Handle type validation errors with proper logging and user feedback
   * 
   * @param error The type validation error to handle
   * @param context Context string for the error (default: "validation")
   * @param logger Optional logger instance (default: defaultLogger)
   */
  static handleValidationError(
    error: TypeValidationError,
    context: string = "validation",
    logger: Logger = defaultLogger,
  ): TypedResult<never, string> {
    const userMessage = `${context}: ${error.message}`;

    // Log detailed error information for debugging
    logger.error("Type validation error:", {
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
   * 
   * @param error The schema validation error to handle
   * @param context Context string for the error (default: "schema-validation")
   * @param logger Optional logger instance (default: defaultLogger)
   */
  static handleSchemaError(
    error: SchemaValidationError,
    context: string = "schema-validation",
    logger: Logger = defaultLogger,
  ): TypedResult<never, string> {
    const userMessage = `${context}: Schema '${error.schemaName}' validation failed. Issues with: ${error.failedProperties.join(", ")}`;

    logger.error("Schema validation error:", {
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

  /**
   * Handle validation error using logger from options
   * 
   * Delegates to the existing handleValidationError method while using the logger
   * configuration from the provided options object. This method provides consistent
   * error handling that respects the logging configuration used throughout the operation.
   * 
   * @param error The type validation error to handle
   * @param context Context string for the error (default: "validation")
   * @param options Options object that may contain logging configuration
   * @returns TypedResult with error message for user feedback
   * 
   * @example
   * ```typescript
   * // Basic usage with options
   * const options: BaseExportOptions = {
   *   includePaces: true,
   *   logging: { level: 'debug', backend: 'console' }
   * };
   * 
   * const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
   *   error,
   *   "export-validation",
   *   options
   * );
   * 
   * // Without logging config - uses default logger
   * const result2 = TypeSafeErrorHandler.handleValidationErrorWithOptions(
   *   error,
   *   "validation",
   *   { customField: "value" }
   * );
   * 
   * // No options - uses default logger
   * const result3 = TypeSafeErrorHandler.handleValidationErrorWithOptions(error);
   * ```
   */
  static handleValidationErrorWithOptions(
    error: TypeValidationError,
    context: string = "validation",
    options?: { logging?: LoggingConfig }
  ): TypedResult<never, string> {
    const logger = getLoggerFromOptions(options);
    return this.handleValidationError(error, context, logger);
  }

  /**
   * Handle schema error using logger from options
   * 
   * Delegates to the existing handleSchemaError method while using the logger
   * configuration from the provided options object. This ensures that schema
   * validation errors are logged using the same configuration as the rest of the operation.
   * 
   * @param error The schema validation error to handle
   * @param context Context string for the error (default: "schema-validation")
   * @param options Options object that may contain logging configuration
   * @returns TypedResult with error message for user feedback
   * 
   * @example
   * ```typescript
   * // With export options containing logging config
   * const exportOptions: BaseExportOptions = {
   *   includePaces: true,
   *   logging: { level: 'info', backend: 'console' }
   * };
   * 
   * const result = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
   *   schemaError,
   *   "export-schema-validation",
   *   exportOptions
   * );
   * 
   * // With custom options
   * const customOptions = {
   *   customField: "value",
   *   logging: { level: 'warn', backend: 'console' }
   * };
   * 
   * const result2 = TypeSafeErrorHandler.handleSchemaErrorWithOptions(
   *   schemaError,
   *   "custom-validation",
   *   customOptions
   * );
   * ```
   */
  static handleSchemaErrorWithOptions(
    error: SchemaValidationError,
    context: string = "schema-validation",
    options?: { logging?: LoggingConfig }
  ): TypedResult<never, string> {
    const logger = getLoggerFromOptions(options);
    return this.handleSchemaError(error, context, logger);
  }

  /**
   * Handle any error with options-based logging
   * 
   * Provides general error handling for operations that may throw various types of errors,
   * using the logger configuration from the provided options object. This method catches
   * and handles TypeValidationError, SchemaValidationError, and generic Error instances
   * with consistent logging behavior.
   * 
   * @template T The return type of the operation
   * @param operation Function to execute that may throw errors
   * @param context Context string for error reporting (default: "operation")
   * @param options Options object that may contain logging configuration
   * @returns TypedResult with success data or error message
   * 
   * @example
   * ```typescript
   * // Export operation with logging configuration
   * const exportOptions: BaseExportOptions = {
   *   includePaces: true,
   *   logging: { level: 'debug', backend: 'console' }
   * };
   * 
   * const result = TypeSafeErrorHandler.handleErrorWithOptions(
   *   () => exportPlan(plan, exportOptions),
   *   "pdf-export",
   *   exportOptions
   * );
   * 
   * // Database operation with custom logging
   * const dbOptions = {
   *   timeout: 5000,
   *   logging: { level: 'error', backend: 'console' }
   * };
   * 
   * const dbResult = TypeSafeErrorHandler.handleErrorWithOptions(
   *   () => database.save(data),
   *   "database-save",
   *   dbOptions
   * );
   * 
   * // No options - uses default logger
   * const simpleResult = TypeSafeErrorHandler.handleErrorWithOptions(
   *   () => riskyOperation(),
   *   "simple-operation"
   * );
   * ```
   */
  static handleErrorWithOptions<T>(
    operation: () => T,
    context: string = "operation",
    options?: { logging?: LoggingConfig }
  ): TypedResult<T, string> {
    try {
      const result = operation();
      return TypedResultUtils.success(result);
    } catch (error) {
      if (error instanceof TypeValidationError) {
        return this.handleValidationErrorWithOptions(error, context, options);
      }
      if (error instanceof SchemaValidationError) {
        return this.handleSchemaErrorWithOptions(error, context, options);
      }
      
      const logger = getLoggerFromOptions(options);
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`${context}: ${message}`);
      return TypedResultUtils.error(`${context}: ${message}`);
    }
  }
}
