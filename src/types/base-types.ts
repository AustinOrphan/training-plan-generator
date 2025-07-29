/**
 * Base Type Definition Module
 * 
 * Foundational type utilities for improved type safety across the training plan generator.
 * This module provides core type utilities that eliminate 'any' usage and enable
 * compile-time type checking throughout the codebase.
 * 
 * @fileoverview Core type utilities for type-safe development
 */

/**
 * Generic schema definition for type-safe data structures
 * Replaces 'any' usage in schema definitions across formatters and validators
 * 
 * @template T The type that this schema validates
 * @example
 * ```typescript
 * const pdfSchema: TypedSchema<PDFOptions> = {
 *   validate: (data: unknown): data is PDFOptions => typeof data === 'object',
 *   properties: ['pageSize', 'margins', 'customFields']
 * };
 * ```
 */
export interface TypedSchema<T> {
  /** Function to validate if unknown data matches the schema type */
  validate: (data: unknown) => data is T;
  /** Array of property names that should be present in the type */
  properties: (keyof T)[];
  /** Optional schema metadata for documentation */
  metadata?: {
    version: string;
    description: string;
    examples?: T[];
  };
}

/**
 * Generic result wrapper for operations that may succeed or fail
 * Provides type-safe error handling without throwing exceptions
 * 
 * @template TData The success data type
 * @template TError The error type (defaults to Error)
 * @example
 * ```typescript
 * function parseConfig(input: unknown): TypedResult<TrainingPlanConfig, ValidationError> {
 *   if (isValidConfig(input)) {
 *     return { success: true, data: input };
 *   }
 *   return { success: false, error: new ValidationError('Invalid config') };
 * }
 * ```
 */
export type TypedResult<TData, TError = Error> = 
  | { success: true; data: TData }
  | { success: false; error: TError };

/**
 * Base interface for configuration options across different modules
 * Provides common structure for all option interfaces in the system
 * 
 * @template TCustomFields Type for custom fields (constrained to Record<string, unknown>)
 * @example
 * ```typescript
 * interface PDFOptions extends TypedOptions<{ watermark?: string }> {
 *   pageSize: 'A4' | 'letter';
 *   margins: number;
 * }
 * ```
 */
export interface TypedOptions<TCustomFields extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique identifier for this options configuration */
  id?: string;
  /** Human-readable name for this configuration */
  name?: string;
  /** Additional metadata for the options */
  metadata?: {
    version: string;
    createdAt: Date;
    updatedAt?: Date;
  };
  /** Type-safe custom fields with generic constraints */
  customFields?: TCustomFields;
}

/**
 * Generic constraint for objects that can be validated
 * Ensures all validatable objects have required identification and validation properties
 */
export interface Validatable {
  /** Unique identifier for validation tracking */
  id: string;
  /** Timestamp when this object was created */
  createdAt: Date;
  /** Optional validation metadata */
  validationMeta?: {
    schemaVersion: string;
    validatedAt: Date;
    validationErrors?: string[];
  };
}

/**
 * Utility type for making selected properties of T required
 * More specific than TypeScript's built-in Required<T> utility
 * 
 * @template T The base type
 * @template K The keys to make required
 * @example
 * ```typescript
 * type PartialConfig = Partial<TrainingPlanConfig>;
 * type ConfigWithRequiredName = RequireProperties<PartialConfig, 'name' | 'goal'>;
 * ```
 */
export type RequireProperties<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type for making selected properties of T optional
 * Inverse of RequireProperties for flexible configuration building
 * 
 * @template T The base type
 * @template K The keys to make optional
 * @example
 * ```typescript
 * type FlexibleConfig = OptionalProperties<TrainingPlanConfig, 'description' | 'targetDate'>;
 * ```
 */
export type OptionalProperties<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for creating a deep readonly version of T
 * Prevents accidental mutations of complex nested objects
 * 
 * @template T The type to make deeply readonly
 * @example
 * ```typescript
 * const immutablePlan: DeepReadonly<TrainingPlan> = generatePlan(config);
 * // immutablePlan.workouts[0].date = new Date(); // TypeScript error
 * ```
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : readonly T[P];
};

/**
 * Utility type for extracting the element type from an array type
 * Enables type-safe array operations without losing type information
 * 
 * @template T The array type
 * @example
 * ```typescript
 * type WorkoutArray = PlannedWorkout[];
 * type SingleWorkout = ArrayElement<WorkoutArray>; // PlannedWorkout
 * ```
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Utility type for creating a union of all property names of T that are of type U
 * Useful for type-safe property selection and filtering
 * 
 * @template T The object type to examine
 * @template U The property value type to match
 * @example
 * ```typescript
 * type StringProperties = PropertiesOfType<TrainingPlanConfig, string>; // 'name' | 'description'
 * type DateProperties = PropertiesOfType<TrainingPlanConfig, Date>; // 'startDate' | 'endDate' | 'targetDate'
 * ```
 */
export type PropertiesOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Utility type for creating a version of T with only properties of type U
 * Combines PropertiesOfType with Pick for filtered object types
 * 
 * @template T The object type to filter
 * @template U The property value type to include
 * @example
 * ```typescript
 * type StringOnlyConfig = FilterPropertiesByType<TrainingPlanConfig, string>;
 * // Result: { name: string; description?: string; }
 * ```
 */
export type FilterPropertiesByType<T, U> = Pick<T, PropertiesOfType<T, U>>;

/**
 * Utility type for creating branded/nominal types
 * Prevents accidental mixing of values that are the same primitive type but semantically different
 * 
 * @template T The underlying type
 * @template TBrand The brand identifier
 * @example
 * ```typescript
 * type UserId = Brand<string, 'UserId'>;
 * type WorkoutId = Brand<string, 'WorkoutId'>;
 * 
 * const userId: UserId = 'user123' as UserId;
 * const workoutId: WorkoutId = 'workout456' as WorkoutId;
 * // userId = workoutId; // TypeScript error - brands prevent mixing
 * ```
 */
export type Brand<T, TBrand extends string> = T & { readonly __brand: TBrand };

/**
 * Utility type for creating discriminated unions with a common discriminant property
 * Ensures type-safe handling of union types with proper type narrowing
 * 
 * @template TDiscriminant The discriminant property name
 * @template TDiscriminantValue The discriminant value type
 * @template TData The associated data type
 * @example
 * ```typescript
 * type SuccessResult = Discriminated<'status', 'success', { data: TrainingPlan }>;
 * type ErrorResult = Discriminated<'status', 'error', { message: string }>;
 * type Result = SuccessResult | ErrorResult;
 * ```
 */
export type Discriminated<
  TDiscriminant extends string,
  TDiscriminantValue extends string | number | symbol,
  TData extends Record<string, unknown>
> = TData & Record<TDiscriminant, TDiscriminantValue>;

/**
 * Type guard utility interface for runtime type checking
 * Provides structure for creating type-safe type guards throughout the application
 * 
 * @template T The type being guarded
 * @example
 * ```typescript
 * const isTrainingPlan: TypeGuard<TrainingPlan> = {
 *   check: (value: unknown): value is TrainingPlan => {
 *     return typeof value === 'object' && value !== null && 'config' in value;
 *   },
 *   name: 'TrainingPlan'
 * };
 * ```
 */
export interface TypeGuard<T> {
  /** The type guard function that performs runtime checking */
  check: (value: unknown) => value is T;
  /** Human-readable name for error messages and debugging */
  name: string;
  /** Optional additional validation rules */
  additionalChecks?: Array<(value: T) => boolean>;
}

/**
 * Collection utility type for type-safe array and object operations
 * Provides structure for operations that work with collections of typed data
 * 
 * @template T The element type in the collection
 * @example
 * ```typescript
 * const workoutCollection: TypedCollection<PlannedWorkout> = {
 *   items: workouts,
 *   count: workouts.length,
 *   metadata: { type: 'PlannedWorkout', indexed: true }
 * };
 * ```
 */
export interface TypedCollection<T> {
  /** The items in the collection */
  items: T[];
  /** Count of items (for validation and performance) */
  count: number;
  /** Collection metadata */
  metadata: {
    /** Type name for runtime identification */
    type: string;
    /** Whether the collection is indexed for fast lookups */
    indexed?: boolean;
    /** Creation timestamp */
    createdAt?: Date;
    /** Last modification timestamp */
    updatedAt?: Date;
  };
}

/**
 * Generic factory interface for creating typed objects
 * Provides consistent pattern for object creation throughout the application
 * 
 * @template T The type being created
 * @template TOptions The options type for creation
 * @example
 * ```typescript
 * class WorkoutFactory implements TypedFactory<PlannedWorkout, WorkoutCreationOptions> {
 *   create(options: WorkoutCreationOptions): PlannedWorkout {
 *     // Implementation
 *   }
 *   
 *   validate(instance: PlannedWorkout): boolean {
 *     // Validation logic
 *   }
 * }
 * ```
 */
export interface TypedFactory<T, TOptions extends Record<string, unknown> = Record<string, unknown>> {
  /** Create a new instance of T using the provided options */
  create(options: TOptions): T;
  /** Validate that an instance conforms to the expected type structure */
  validate(instance: T): boolean;
  /** Optional type name for debugging and error messages */
  readonly typeName?: string;
}

/**
 * Enum-like object type that maintains type safety while allowing iteration
 * Alternative to TypeScript enums that provides better type inference
 * 
 * @template T The union type representing enum values
 * @example
 * ```typescript
 * const TrainingPhases = {
 *   BASE: 'base',
 *   BUILD: 'build',
 *   PEAK: 'peak',
 *   TAPER: 'taper',
 *   RECOVERY: 'recovery'
 * } as const;
 * 
 * type TrainingPhaseEnum = TypedEnum<typeof TrainingPhases>;
 * // Enables: Object.values(TrainingPhases).includes(someValue)
 * ```
 */
export type TypedEnum<T extends Record<string, string | number>> = {
  readonly [K in keyof T]: T[K];
};

/**
 * Utility for creating const assertions with better type inference
 * Helps create immutable objects with precise literal types
 * 
 * @template T The type to make immutable
 * @example
 * ```typescript
 * const config = asConst({
 *   version: '1.0.0',
 *   features: ['adaptation', 'export']
 * });
 * // config.version has type '1.0.0', not string
 * ```
 */
export function asConst<T extends Record<string, unknown> | readonly unknown[]>(value: T): T {
  return value;
}

/**
 * Type-safe object key extraction utility
 * Ensures keys are valid property names of the target type
 * 
 * @template T The object type
 * @param obj The object to extract keys from
 * @returns Array of valid keys
 * @example
 * ```typescript
 * const config: TrainingPlanConfig = getConfig();
 * const keys = getTypedKeys(config); // (keyof TrainingPlanConfig)[]
 * ```
 */
export function getTypedKeys<T extends Record<string, unknown>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Type-safe object property access with default values
 * Prevents runtime errors when accessing potentially undefined properties
 * 
 * @template T The object type
 * @template K The property key type
 * @param obj The object to access
 * @param key The property key
 * @param defaultValue The default value if property is undefined
 * @returns The property value or default
 * @example
 * ```typescript
 * const description = getTypedProperty(config, 'description', 'Default description');
 * // Type-safe access with fallback
 * ```
 */
export function getTypedProperty<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  key: K,
  defaultValue: NonNullable<T[K]>
): NonNullable<T[K]> {
  return obj[key] ?? defaultValue;
}

/**
 * Error types for type validation failures
 * Provides structured error information for type safety violations
 */
export class TypeValidationError extends Error {
  constructor(
    message: string,
    public readonly expectedType: string,
    public readonly actualValue: unknown,
    public readonly validationContext?: string
  ) {
    super(message);
    this.name = 'TypeValidationError';
  }
}

/**
 * Error for schema validation failures
 * Specialized error for schema-related validation issues
 */
export class SchemaValidationError extends TypeValidationError {
  constructor(
    message: string,
    public readonly schemaName: string,
    public readonly failedProperties: string[],
    actualValue: unknown
  ) {
    super(message, schemaName, actualValue, 'schema-validation');
    this.name = 'SchemaValidationError';
  }
}