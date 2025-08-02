/**
 * Export Validation Types with Runtime Type Guards
 *
 * This module provides type-safe validation functions and runtime type guards for export operations.
 * It replaces generic validation patterns with strongly typed alternatives that provide compile-time
 * type checking and runtime type narrowing.
 *
 * @fileoverview Export validation types and runtime type guards for type-safe export operations
 */

import type {
  TypeGuard,
  TypedResult,
  TypedSchema,
  SchemaValidationError,
} from "./base-types";
import { TypeValidationError } from "./base-types";
import type {
  BaseExportOptions,
  PDFOptions,
  iCalOptions,
  CSVOptions,
  JSONOptions,
} from "./export-types";
import type {
  TrainingPlan,
  ExportFormat,
  PlannedWorkout,
  TrainingBlock,
} from "../types";

/**
 * Enhanced validation result with type narrowing capabilities
 * Provides structured validation results with type-safe error handling
 *
 * @template T The type being validated
 * @example
 * ```typescript
 * const result: TypedValidationResult<PDFOptions> = validatePDFOptions(options);
 * if (result.isValid && result.validatedValue) {
 *   // TypeScript knows validatedValue is PDFOptions
 *   console.log(result.validatedValue.pageSize);
 * }
 * ```
 */
export interface TypedValidationResult<T> {
  /** Whether validation passed successfully */
  isValid: boolean;
  /** The validated and type-narrowed value (only present if isValid is true) */
  validatedValue?: T;
  /** Array of validation error messages */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
  /** Validation context metadata */
  context?: {
    /** Validator name for debugging */
    validatorName: string;
    /** Validation timestamp */
    timestamp: Date;
    /** Properties that were validated */
    validatedProperties: (keyof T)[];
    /** Schema version used for validation */
    schemaVersion?: string;
  };
}

/**
 * Export format validator interface with generic type constraints
 * Provides strongly typed validation for specific export formats
 *
 * @template TOptions The export options type for this format
 * @template TPlan The training plan type (allows for format-specific plan constraints)
 * @example
 * ```typescript
 * const pdfValidator: ExportFormatValidator<PDFOptions, TrainingPlan> = {
 *   format: 'pdf',
 *   validateOptions: (options) => validatePDFOptionsWithGuards(options),
 *   validatePlan: (plan) => validateTrainingPlanForPDF(plan),
 *   validateCompatibility: (plan, options) => checkPDFCompatibility(plan, options)
 * };
 * ```
 */
export interface ExportFormatValidator<
  TOptions = BaseExportOptions,
  TPlan extends TrainingPlan = TrainingPlan,
> {
  /** The export format this validator handles */
  format: ExportFormat;

  /** Validate export options with type narrowing */
  validateOptions(options: unknown): TypedValidationResult<TOptions>;

  /** Validate training plan for export compatibility */
  validatePlan(plan: unknown): TypedValidationResult<TPlan>;

  /** Validate compatibility between plan and options */
  validateCompatibility(
    plan: TPlan,
    options: TOptions,
  ): TypedValidationResult<{
    plan: TPlan;
    options: TOptions;
    compatible: boolean;
  }>;

  /** Get typed schema for the export format */
  getSchema(): TypedSchema<TOptions>;

  /** Optional custom validation rules */
  customValidators?: Array<{
    name: string;
    validator: (
      plan: TPlan,
      options: TOptions,
    ) => TypedValidationResult<boolean>;
    required: boolean;
  }>;
}

/**
 * Runtime type guard for base export options
 * Provides type narrowing for export option validation
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is BaseExportOptions
 * @example
 * ```typescript
 * if (isBaseExportOptions(userInput)) {
 *   // TypeScript knows userInput is BaseExportOptions
 *   console.log(userInput.includePaces);
 * }
 * ```
 */
export function isBaseExportOptions(
  value: unknown,
): value is BaseExportOptions {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check optional boolean properties
  const booleanProps = [
    "includePaces",
    "includeHeartRates",
    "includePower",
    "includePhilosophyPrinciples",
    "includeResearchCitations",
    "includeCoachBiography",
    "includeMethodologyComparison",
    "includeTrainingZoneExplanations",
    "includeWorkoutRationale",
  ];

  for (const prop of booleanProps) {
    if (
      prop in obj &&
      typeof obj[prop] !== "boolean" &&
      obj[prop] !== undefined
    ) {
      return false;
    }
  }

  // Check string properties
  if (
    "timeZone" in obj &&
    typeof obj.timeZone !== "string" &&
    obj.timeZone !== undefined
  ) {
    return false;
  }
  if (
    "language" in obj &&
    typeof obj.language !== "string" &&
    obj.language !== undefined
  ) {
    return false;
  }

  // Check enum properties
  if (
    "units" in obj &&
    obj.units !== undefined &&
    !["metric", "imperial"].includes(obj.units as string)
  ) {
    return false;
  }
  if (
    "detailLevel" in obj &&
    obj.detailLevel !== undefined &&
    !["basic", "standard", "comprehensive"].includes(obj.detailLevel as string)
  ) {
    return false;
  }

  return true;
}

/**
 * Runtime type guard for PDF export options
 * Provides type narrowing for PDF-specific options
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is PDFOptions
 */
export function isPDFOptions(value: unknown): value is PDFOptions {
  if (!isBaseExportOptions(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check PDF-specific properties
  if (
    "pageSize" in obj &&
    obj.pageSize !== undefined &&
    !["A4", "letter", "legal", "A3"].includes(obj.pageSize as string)
  ) {
    return false;
  }

  if (
    "orientation" in obj &&
    obj.orientation !== undefined &&
    !["portrait", "landscape"].includes(obj.orientation as string)
  ) {
    return false;
  }

  if ("margins" in obj && obj.margins !== undefined) {
    const margins = obj.margins;
    if (typeof margins !== "object" || margins === null) {
      return false;
    }
    const marginObj = margins as Record<string, unknown>;
    const marginProps = ["top", "right", "bottom", "left"];
    for (const prop of marginProps) {
      if (prop in marginObj && typeof marginObj[prop] !== "number") {
        return false;
      }
    }
  }

  if (
    "includeImages" in obj &&
    typeof obj.includeImages !== "boolean" &&
    obj.includeImages !== undefined
  ) {
    return false;
  }

  return true;
}

/**
 * Runtime type guard for iCal export options
 * Provides type narrowing for calendar-specific options
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is iCalOptions
 */
export function isiCalOptions(value: unknown): value is iCalOptions {
  if (!isBaseExportOptions(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check iCal-specific properties
  if (
    "calendarName" in obj &&
    typeof obj.calendarName !== "string" &&
    obj.calendarName !== undefined
  ) {
    return false;
  }

  if ("organizer" in obj && obj.organizer !== undefined) {
    const organizer = obj.organizer;
    if (typeof organizer !== "object" || organizer === null) {
      return false;
    }
    const orgObj = organizer as Record<string, unknown>;
    if ("name" in orgObj && typeof orgObj.name !== "string") {
      return false;
    }
    if ("email" in orgObj && typeof orgObj.email !== "string") {
      return false;
    }
  }

  if (
    "reminderMinutes" in obj &&
    typeof obj.reminderMinutes !== "number" &&
    obj.reminderMinutes !== undefined
  ) {
    return false;
  }

  if (
    "includeLocation" in obj &&
    typeof obj.includeLocation !== "boolean" &&
    obj.includeLocation !== undefined
  ) {
    return false;
  }

  return true;
}

/**
 * Runtime type guard for CSV export options
 * Provides type narrowing for CSV-specific options
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is CSVOptions
 */
export function isCSVOptions(value: unknown): value is CSVOptions {
  if (!isBaseExportOptions(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check CSV-specific properties
  if (
    "delimiter" in obj &&
    typeof obj.delimiter !== "string" &&
    obj.delimiter !== undefined
  ) {
    return false;
  }

  if (
    "includeHeaders" in obj &&
    typeof obj.includeHeaders !== "boolean" &&
    obj.includeHeaders !== undefined
  ) {
    return false;
  }

  if (
    "dateFormat" in obj &&
    typeof obj.dateFormat !== "string" &&
    obj.dateFormat !== undefined
  ) {
    return false;
  }

  if (
    "encoding" in obj &&
    obj.encoding !== undefined &&
    !["utf-8", "utf-16", "ascii"].includes(obj.encoding as string)
  ) {
    return false;
  }

  return true;
}

/**
 * Runtime type guard for JSON export options
 * Provides type narrowing for JSON-specific options
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is JSONOptions
 */
export function isJSONOptions(value: unknown): value is JSONOptions {
  if (!isBaseExportOptions(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check JSON-specific properties
  if (
    "indent" in obj &&
    typeof obj.indent !== "number" &&
    obj.indent !== undefined
  ) {
    return false;
  }

  if (
    "includeSchema" in obj &&
    typeof obj.includeSchema !== "boolean" &&
    obj.includeSchema !== undefined
  ) {
    return false;
  }

  if (
    "prettify" in obj &&
    typeof obj.prettify !== "boolean" &&
    obj.prettify !== undefined
  ) {
    return false;
  }

  if (
    "compression" in obj &&
    obj.compression !== undefined &&
    !["none", "gzip", "deflate"].includes(obj.compression as string)
  ) {
    return false;
  }

  return true;
}

/**
 * Runtime type guard for training plans
 * Validates training plan structure for export compatibility
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is a valid TrainingPlan
 */
export function isValidTrainingPlan(value: unknown): value is TrainingPlan {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check required properties
  if (
    !("config" in obj) ||
    typeof obj.config !== "object" ||
    obj.config === null
  ) {
    return false;
  }

  if (!("workouts" in obj) || !Array.isArray(obj.workouts)) {
    return false;
  }

  if (!("blocks" in obj) || !Array.isArray(obj.blocks)) {
    return false;
  }

  if (
    !("summary" in obj) ||
    typeof obj.summary !== "object" ||
    obj.summary === null
  ) {
    return false;
  }

  // Validate workouts array
  for (const workout of obj.workouts as unknown[]) {
    if (!isValidPlannedWorkout(workout)) {
      return false;
    }
  }

  return true;
}

/**
 * Runtime type guard for planned workouts
 * Validates individual workout structure
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is a valid PlannedWorkout
 */
export function isValidPlannedWorkout(value: unknown): value is PlannedWorkout {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check required properties
  const requiredStringProps = ["id", "name", "type"];
  for (const prop of requiredStringProps) {
    if (!(prop in obj) || typeof obj[prop] !== "string") {
      return false;
    }
  }

  if (!("date" in obj) || !(obj.date instanceof Date)) {
    return false;
  }

  if (
    !("targetMetrics" in obj) ||
    typeof obj.targetMetrics !== "object" ||
    obj.targetMetrics === null
  ) {
    return false;
  }

  if (
    !("workout" in obj) ||
    typeof obj.workout !== "object" ||
    obj.workout === null
  ) {
    return false;
  }

  return true;
}

/**
 * Creates a typed plan guard that delegates to the base training plan validator
 * This function provides type-safe delegation while maintaining generic type safety
 *
 * @template TPlan The specific training plan type to validate (must extend TrainingPlan)
 * @returns Type guard function that validates against TPlan
 * @example
 * ```typescript
 * const planGuard = createTypedPlanGuard<CustomTrainingPlan>();
 * if (planGuard(unknownValue)) {
 *   // TypeScript knows unknownValue is CustomTrainingPlan
 * }
 * ```
 */
function createTypedPlanGuard<TPlan extends TrainingPlan = TrainingPlan>(): (
  value: unknown,
) => value is TPlan {
  // We delegate to the base validator and use a controlled type assertion
  // This is safe because:
  // 1. We validate the runtime structure using isValidTrainingPlan
  // 2. TPlan must extend TrainingPlan (enforced by generic constraint)
  // 3. At runtime, any valid TrainingPlan satisfies the TPlan contract
  return (value: unknown): value is TPlan => {
    return isValidTrainingPlan(value);
  };
}

/**
 * Comprehensive export validator factory
 * Creates type-safe validators for different export formats
 *
 * @template TOptions The export options type
 * @template TPlan The training plan type
 * @param format The export format
 * @param optionsGuard Type guard for options validation
 * @param planGuard Type guard for plan validation
 * @returns Configured export format validator
 */
export function createExportValidator<
  TOptions = BaseExportOptions,
  TPlan extends TrainingPlan = TrainingPlan,
>(
  format: ExportFormat,
  optionsGuard: (value: unknown) => value is TOptions,
  planGuard: (value: unknown) => value is TPlan = createTypedPlanGuard<TPlan>(),
): ExportFormatValidator<TOptions, TPlan> {
  return {
    format,

    validateOptions(options: unknown): TypedValidationResult<TOptions> {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!optionsGuard(options)) {
        errors.push(`Invalid ${format} export options`);
        return {
          isValid: false,
          errors,
          warnings,
          context: {
            validatorName: `${format}OptionsValidator`,
            timestamp: new Date(),
            validatedProperties: [],
          },
        };
      }

      // Additional validation can be added here
      return {
        isValid: true,
        validatedValue: options,
        errors,
        warnings,
        context: {
          validatorName: `${format}OptionsValidator`,
          timestamp: new Date(),
          validatedProperties: Object.keys(
            options as Record<string, unknown>,
          ) as (keyof TOptions)[],
        },
      };
    },

    validatePlan(plan: unknown): TypedValidationResult<TPlan> {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!planGuard(plan)) {
        errors.push(`Invalid training plan for ${format} export`);
        return {
          isValid: false,
          errors,
          warnings,
          context: {
            validatorName: `${format}PlanValidator`,
            timestamp: new Date(),
            validatedProperties: [],
          },
        };
      }

      return {
        isValid: true,
        validatedValue: plan,
        errors,
        warnings,
        context: {
          validatorName: `${format}PlanValidator`,
          timestamp: new Date(),
          validatedProperties: Object.keys(plan) as (keyof TPlan)[],
        },
      };
    },

    validateCompatibility(
      plan: TPlan,
      options: TOptions,
    ): TypedValidationResult<{
      plan: TPlan;
      options: TOptions;
      compatible: boolean;
    }> {
      const errors: string[] = [];
      const warnings: string[] = [];
      let compatible = true;

      // Format-specific compatibility checks can be added here
      // For now, we assume compatibility if both plan and options are valid

      return {
        isValid: compatible,
        validatedValue: { plan, options, compatible },
        errors,
        warnings,
        context: {
          validatorName: `${format}CompatibilityValidator`,
          timestamp: new Date(),
          validatedProperties: ["plan", "options", "compatible"],
        },
      };
    },

    getSchema(): TypedSchema<TOptions> {
      return {
        validate: (data: unknown) => {
          if (optionsGuard(data)) {
            return { success: true, data };
          } else {
            return {
              success: false,
              error: new TypeValidationError(
                `Invalid ${format} export options`,
                "VALIDATION_ERROR",
                data,
              ),
            };
          }
        },
        properties: {}, // This would be populated with actual property names in a real implementation
        required: [],
        name: `${format}ExportOptionsSchema`,
      };
    },
  };
}

/**
 * Pre-configured validators for all supported export formats
 */
export const EXPORT_VALIDATORS = {
  pdf: createExportValidator("pdf" as ExportFormat, isPDFOptions),
  ical: createExportValidator("ical" as ExportFormat, isiCalOptions),
  csv: createExportValidator("csv" as ExportFormat, isCSVOptions),
  json: createExportValidator("json" as ExportFormat, isJSONOptions),
} as const;

/**
 * Master export validation function
 * Validates any export format with proper type narrowing
 *
 * @param format The export format
 * @param plan The training plan to export
 * @param options The export options
 * @returns Type-safe validation result
 * @example
 * ```typescript
 * const result = validateExport('pdf', trainingPlan, pdfOptions);
 * if (result.isValid && result.validatedValue) {
 *   // TypeScript knows the types are validated
 *   const { plan, options } = result.validatedValue;
 *   // Proceed with export
 * }
 * ```
 */
export function validateExport<TOptions = BaseExportOptions>(
  format: ExportFormat,
  plan: unknown,
  options: unknown,
): TypedValidationResult<{ plan: TrainingPlan; options: TOptions }> {
  const validator = EXPORT_VALIDATORS[format as keyof typeof EXPORT_VALIDATORS];
  if (!validator) {
    return {
      isValid: false,
      errors: [`Unsupported export format: ${format}`],
      warnings: [],
      context: {
        validatorName: "masterExportValidator",
        timestamp: new Date(),
        validatedProperties: [],
      },
    };
  }

  const planValidation = validator.validatePlan(plan);
  const optionsValidation = validator.validateOptions(options);

  if (!planValidation.isValid || !optionsValidation.isValid) {
    return {
      isValid: false,
      errors: [...planValidation.errors, ...optionsValidation.errors],
      warnings: [...planValidation.warnings, ...optionsValidation.warnings],
      context: {
        validatorName: "masterExportValidator",
        timestamp: new Date(),
        validatedProperties: [],
      },
    };
  }

  return {
    isValid: true,
    validatedValue: {
      plan: planValidation.validatedValue!,
      options: optionsValidation.validatedValue! as TOptions,
    },
    errors: [],
    warnings: [...planValidation.warnings, ...optionsValidation.warnings],
    context: {
      validatorName: "masterExportValidator",
      timestamp: new Date(),
      validatedProperties: ["plan", "options"],
    },
  };
}

/**
 * Type guard factory for creating custom export validators
 * Enables creation of format-specific validators with proper type safety
 *
 * @template T The type to validate
 * @param name The validator name for debugging
 * @param validator The validation function
 * @returns TypeGuard interface for the validator
 */
export function createExportTypeGuard<T>(
  name: string,
  validator: (value: unknown) => value is T,
): TypeGuard<T> {
  return {
    check: validator,
    name,
  };
}

/**
 * Utility type for extracting validated types from validation results
 * Enables type-safe access to validated values
 */
export type ValidatedType<T> =
  T extends TypedValidationResult<infer U> ? U : never;

/**
 * Utility type for creating validation result types
 * Simplifies creation of validation result types for specific domains
 */
export type ExportValidationResult<T> = TypedValidationResult<T>;
