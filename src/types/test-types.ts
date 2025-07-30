/**
 * Test-Specific Type Definitions
 * 
 * This module provides type-safe interfaces and utilities specifically for testing.
 * Eliminates 'as any' usage in test files and provides type-safe test expectations.
 * 
 * @fileoverview Test assertion types and mock utilities for type-safe testing
 */

import { TypedResult, TypeGuard, TypedSchema } from './base-types.js';

/**
 * Generic mock generator interface for type-safe test data creation
 * Provides structured approach to creating mock data with full type safety
 * 
 * @template T The type being mocked
 * @example
 * ```typescript
 * const workoutMockGenerator: MockGenerator<PlannedWorkout> = {
 *   generate: (overrides) => ({ ...defaultWorkout, ...overrides }),
 *   generateMany: (count, overrides) => Array(count).fill(null).map(() => generate(overrides)),
 *   validate: (instance) => isValidWorkout(instance),
 *   schema: workoutSchema
 * };
 * ```
 */
export interface MockGenerator<T> {
  /** Generate a single mock instance with optional property overrides */
  generate(overrides?: Partial<T>): T;
  
  /** Generate multiple mock instances with consistent or varied overrides */
  generateMany(count: number, overrides?: Partial<T> | ((index: number) => Partial<T>)): T[];
  
  /** Validate that a generated instance conforms to expected structure */
  validate(instance: T): boolean;
  
  /** Schema definition for the type being generated */
  schema: TypedSchema<T>;
  
  /** Optional metadata about the generator */
  metadata?: {
    /** Type name for debugging and error messages */
    typeName: string;
    /** Version of the generator for compatibility tracking */
    version: string;
    /** Description of what this generator creates */
    description?: string;
    /** Example usage patterns */
    examples?: Array<{
      description: string;
      code: string;
      result: Partial<T>;
    }>;
  };
}

/**
 * Test configuration type for flexible test parameter overrides
 * Allows partial specification of test data with proper type constraints
 * 
 * @template T The base configuration type
 * @template TRequired Keys that must be provided in test config
 * @example
 * ```typescript
 * type WorkoutTestConfig = TestConfig<PlannedWorkout, 'id' | 'date'>;
 * 
 * const testConfig: WorkoutTestConfig = {
 *   id: 'test-workout-1',
 *   date: new Date(),
 *   // Other properties are optional
 *   duration: 45
 * };
 * ```
 */
export type TestConfig<T, TRequired extends keyof T = never> = 
  T extends object ? (
    TRequired extends never 
      ? Partial<T>
      : Partial<T> & Required<Pick<T, TRequired>>
  ) : never;

/**
 * Mock data factory registry for type-safe mock creation
 * Central registry for all mock generators in the test suite
 * 
 * @example
 * ```typescript
 * const registry = new MockFactoryRegistry();
 * registry.register('PlannedWorkout', workoutGenerator);
 * registry.register('TrainingPlan', planGenerator);
 * 
 * const workout = registry.create('PlannedWorkout', { duration: 60 });
 * ```
 */
export interface MockFactoryRegistry {
  /** Register a mock generator for a specific type */
  register<T>(typeName: string, generator: MockGenerator<T>): void;
  
  /** Create a mock instance using a registered generator */
  create<T>(typeName: string, overrides?: Partial<T>): T;
  
  /** Check if a generator is registered for a type */
  hasGenerator(typeName: string): boolean;
  
  /** Get all registered type names */
  getRegisteredTypes(): string[];
}

/**
 * Generic test assertion interface for type-safe test expectations
 * Replaces 'as any' type assertions in test files with proper type checking
 * 
 * @template T The type being asserted
 * @example
 * ```typescript
 * const assertion: TestAssertion<TrainingPlan> = {
 *   value: testPlan,
 *   expectedType: 'TrainingPlan',
 *   assert: (plan): plan is TrainingPlan => plan.config !== undefined
 * };
 * 
 * if (assertion.assert(assertion.value)) {
 *   // TypeScript knows this is TrainingPlan
 *   expect(assertion.value.config.name).toBe('Test Plan');
 * }
 * ```
 */
export interface TestAssertion<T> {
  /** The value being asserted */
  value: unknown;
  /** Human-readable type name for error messages */
  expectedType: string;
  /** Type guard function for runtime validation */
  assert: (value: unknown) => value is T;
  /** Optional validation context for debugging */
  context?: string;
  /** Optional additional checks for complex assertions */
  additionalChecks?: Array<(value: T) => boolean>;
}

/**
 * Test expectation wrapper for complex object comparisons
 * Provides type-safe expectations without losing type information
 * 
 * @template T The type being tested
 * @example
 * ```typescript
 * const expectation: TypedExpectation<ExportResult> = {
 *   actual: exportResult,
 *   expected: {
 *     content: expect.any(Buffer),
 *     filename: 'plan.pdf',
 *     mimeType: 'application/pdf'
 *   },
 *   matchType: 'partial'
 * };
 * ```
 */
export interface TypedExpectation<T> {
  /** The actual value received */
  actual: T;
  /** The expected value or matcher pattern */
  expected: Partial<T> | T;
  /** Type of matching to perform */
  matchType: 'exact' | 'partial' | 'deep' | 'shape';
  /** Custom comparison function for complex types */
  customMatcher?: (actual: T, expected: Partial<T> | T) => boolean;
  /** Optional message for assertion failures */
  message?: string;
}

/**
 * Mock configuration interface for type-safe mock data generation
 * Replaces generic mock functions with type-constrained alternatives
 * 
 * @template T The type being mocked
 * @template TOverrides Specific properties that can be overridden
 * @example
 * ```typescript
 * const mockConfig: MockConfig<TrainingPlanConfig, 'name' | 'goal'> = {
 *   baseValue: createDefaultConfig(),
 *   overrides: { name: 'Custom Plan', goal: 'marathon' },
 *   generateDefaults: true
 * };
 * ```
 */
export interface MockConfig<T, TOverrides extends keyof T = keyof T> {
  /** Base value to start with (can be partial) */
  baseValue?: Partial<T>;
  /** Specific property overrides */
  overrides?: Pick<T, TOverrides>;
  /** Whether to generate default values for missing properties */
  generateDefaults?: boolean;
  /** Factory function for generating default values */
  defaultFactory?: () => T;
  /** Seed for deterministic mock generation */
  seed?: string | number;
}

/**
 * Test data generator interface for creating type-safe test scenarios
 * Provides consistent structure for test data creation across test files
 * 
 * @template T The type being generated
 * @example
 * ```typescript
 * const workoutGenerator: TestDataGenerator<PlannedWorkout> = {
 *   generate: (options) => createPlannedWorkout(options),
 *   generateMany: (count, template) => Array(count).fill(null).map(() => generate(template)),
 *   variants: {
 *     easy: { intensity: 'easy', duration: 60 },
 *     hard: { intensity: 'hard', duration: 45 }
 *   }
 * };
 * ```
 */
export interface TestDataGenerator<T> {
  /** Generate a single instance */
  generate: (options?: Partial<T>) => T;
  /** Generate multiple instances */
  generateMany: (count: number, template?: Partial<T>) => T[];
  /** Pre-defined variants for common test scenarios */
  variants?: Record<string, Partial<T>>;
  /** Validation function to ensure generated data is valid */
  validate?: (instance: T) => boolean;
  /** Type name for debugging */
  typeName?: string;
}

/**
 * Test scenario configuration for complex integration tests
 * Structures test scenarios with proper type safety and documentation
 * 
 * @template TInput The input type for the scenario
 * @template TOutput The expected output type
 * @example
 * ```typescript
 * const exportScenario: TestScenario<TrainingPlan, ExportResult> = {
 *   name: 'PDF Export Test',
 *   description: 'Tests PDF export with complex plan data',
 *   input: testPlan,
 *   expectedOutput: {
 *     content: expect.any(Buffer),
 *     filename: expect.stringMatching(/\.pdf$/),
 *     mimeType: 'application/pdf'
 *   },
 *   setup: async () => { ... },
 *   teardown: async () => { ... }
 * };
 * ```
 */
export interface TestScenario<TInput, TOutput> {
  /** Human-readable scenario name */
  name: string;
  /** Detailed description of what this scenario tests */
  description: string;
  /** Input data for the test */
  input: TInput;
  /** Expected output (can use jest matchers) */
  expectedOutput: TOutput | Partial<TOutput>;
  /** Optional setup function */
  setup?: () => Promise<void> | void;
  /** Optional teardown function */
  teardown?: () => Promise<void> | void;
  /** Tags for test categorization */
  tags?: string[];
  /** Whether this test should be skipped */
  skip?: boolean;
  /** Timeout override for long-running tests */
  timeout?: number;
}

/**
 * Performance test expectation interface for type-safe performance assertions
 * Provides structure for performance testing with proper type constraints
 * 
 * @example
 * ```typescript
 * const perfExpectation: PerformanceExpectation = {
 *   operation: 'generatePlan',
 *   maxDuration: 2000,
 *   maxMemoryMB: 50,
 *   minThroughput: 10,
 *   measurementUnit: 'milliseconds'
 * };
 * ```
 */
export interface PerformanceExpectation {
  /** Name of the operation being measured */
  operation: string;
  /** Maximum allowed duration */
  maxDuration?: number;
  /** Maximum allowed memory usage in MB */
  maxMemoryMB?: number;
  /** Minimum required throughput (operations per second) */
  minThroughput?: number;
  /** Unit of measurement for duration */
  measurementUnit: 'milliseconds' | 'seconds' | 'microseconds';
  /** Number of iterations for average calculation */
  iterations?: number;
  /** Warmup iterations before measurement */
  warmupIterations?: number;
}

/**
 * Test validation result for structured test outcome reporting
 * Provides type-safe result reporting for complex test validations
 * 
 * @template T The type that was validated
 * @example
 * ```typescript
 * const result: TestValidationResult<ExportResult> = {
 *   isValid: true,
 *   validatedValue: exportResult,
 *   errors: [],
 *   warnings: ['Large file size detected'],
 *   metadata: { validationTime: 15, checkedProperties: ['content', 'filename'] }
 * };
 * ```
 */
export interface TestValidationResult<T> {
  /** Whether validation passed */
  isValid: boolean;
  /** The validated value (if validation passed) */
  validatedValue?: T;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings?: string[];
  /** Additional validation metadata */
  metadata?: {
    /** Validation execution time in milliseconds */
    validationTime?: number;
    /** Properties that were checked */
    checkedProperties?: (keyof T)[];
    /** Validation rule name */
    ruleName?: string;
  };
}

/**
 * Async test assertion interface for testing promise-based operations
 * Provides type-safe async test patterns with proper error handling
 * 
 * @template T The resolved type of the promise
 * @template E The error type (defaults to Error)
 * @example
 * ```typescript
 * const asyncAssertion: AsyncTestAssertion<TrainingPlan, ValidationError> = {
 *   operation: () => generatePlanAsync(config),
 *   expectedResult: 'success',
 *   timeout: 5000,
 *   successValidator: (plan) => plan.workouts.length > 0,
 *   errorValidator: (error) => error instanceof ValidationError
 * };
 * ```
 */
export interface AsyncTestAssertion<T, E = Error> {
  /** The async operation to test */
  operation: () => Promise<T>;
  /** Expected result type */
  expectedResult: 'success' | 'error' | 'timeout';
  /** Maximum time to wait for completion */
  timeout?: number;
  /** Validator for successful results */
  successValidator?: (result: T) => boolean;
  /** Validator for error results */
  errorValidator?: (error: E) => boolean;
  /** Custom retry logic for flaky tests */
  retryOptions?: {
    maxRetries: number;
    retryDelay: number;
    retryCondition?: (error: unknown) => boolean;
  };
}

/**
 * Collection test utilities for array and object validation
 * Provides type-safe utilities for testing collections and arrays
 * 
 * @template T The element type in the collection
 * @example
 * ```typescript
 * const collectionTest: CollectionTestUtil<PlannedWorkout> = {
 *   items: workouts,
 *   expectedLength: { min: 1, max: 100 },
 *   itemValidator: (workout) => workout.date instanceof Date,
 *   sortValidator: (a, b) => a.date <= b.date,
 *   uniquenessKey: 'id'
 * };
 * ```
 */
export interface CollectionTestUtil<T> {
  /** The collection items to test */
  items: T[];
  /** Expected length constraints */
  expectedLength?: {
    min?: number;
    max?: number;
    exact?: number;
  };
  /** Validator for individual items */
  itemValidator?: (item: T, index: number) => boolean;
  /** Validator for collection sorting */
  sortValidator?: (a: T, b: T) => boolean;
  /** Key to check for uniqueness across items */
  uniquenessKey?: keyof T;
  /** Custom collection-level validators */
  collectionValidators?: Array<(items: T[]) => boolean>;
}

/**
 * Type-safe test utilities combining base types with test-specific functionality
 */
export type TestResult<T, E = Error> = TypedResult<T, E>;
export type TestTypeGuard<T> = TypeGuard<T>;

/**
 * Helper function to create type-safe test assertions
 * Eliminates the need for 'as any' in test files
 * 
 * @template T The type being asserted
 * @param value The value to assert
 * @param typeGuard The type guard function
 * @param expectedType Human-readable type name
 * @returns Type-safe test assertion
 * @example
 * ```typescript
 * const assertion = createTestAssertion(
 *   result,
 *   (val): val is ExportResult => typeof val === 'object' && 'content' in val,
 *   'ExportResult'
 * );
 * 
 * if (assertion.assert(assertion.value)) {
 *   // TypeScript knows this is ExportResult
 *   expect(assertion.value.content).toBeDefined();
 * }
 * ```
 */
export function createTestAssertion<T>(
  value: unknown,
  typeGuard: (val: unknown) => val is T,
  expectedType: string,
  context?: string
): TestAssertion<T> {
  return {
    value,
    expectedType,
    assert: typeGuard,
    context
  };
}

/**
 * Helper function to create type-safe mock configurations
 * Provides structured approach to mock data generation
 * 
 * @template T The type being mocked
 * @template TOverrides Keys that can be overridden (defaults to all keys)
 * @param baseValue Optional base value to start with
 * @param overrides Optional property overrides
 * @returns Mock configuration
 * @example
 * ```typescript
 * const mockConfig = createMockConfig<TrainingPlanConfig>({
 *   name: 'Base Plan'
 * }, {
 *   goal: 'marathon',
 *   duration: 16
 * });
 * ```
 */
export function createMockConfig<T, TOverrides extends keyof T = keyof T>(
  baseValue?: Partial<T>,
  overrides?: Pick<T, TOverrides>
): MockConfig<T, TOverrides> {
  return {
    baseValue,
    overrides,
    generateDefaults: true
  };
}

/**
 * Helper function to validate test results with proper type narrowing
 * Combines validation with type assertion for safe test operations
 * 
 * @template T The expected result type
 * @param result The result to validate
 * @param validator The validation function
 * @returns Type-safe validation result
 * @example
 * ```typescript
 * const validation = validateTestResult(
 *   exportResult,
 *   (result): result is ExportResult => 
 *     result.content !== undefined && result.filename !== undefined
 * );
 * 
 * if (validation.isValid && validation.validatedValue) {
 *   // TypeScript knows validatedValue is ExportResult
 *   expect(validation.validatedValue.filename).toMatch(/\.(pdf|ics|csv|json)$/);
 * }
 * ```
 */
export function validateTestResult<T>(
  result: unknown,
  validator: (val: unknown) => val is T,
  errorMessage?: string
): TestValidationResult<T> {
  const isValid = validator(result);
  
  return {
    isValid,
    validatedValue: isValid ? result : undefined,
    errors: isValid ? [] : [errorMessage || 'Validation failed'],
    warnings: [],
    metadata: {
      validationTime: Date.now(),
      ruleName: validator.name || 'anonymous'
    }
  };
}

/**
 * Utility type for extracting test-relevant properties from complex types
 * Helps create focused test interfaces that only include testable properties
 * 
 * @template T The source type
 * @example
 * ```typescript
 * type TestableConfig = TestableProperties<TrainingPlanConfig>;
 * // Only includes properties that can be meaningfully tested
 * ```
 */
export type TestableProperties<T> = Omit<T, 'createdAt' | 'updatedAt' | 'id'>;

/**
 * Utility type for creating test doubles (mocks, stubs, spies)
 * Provides structure for different types of test doubles with proper typing
 * 
 * @template T The interface being doubled
 * @example
 * ```typescript
 * const mockFormatter: TestDouble<PDFFormatter> = {
 *   type: 'mock',
 *   implementation: {
 *     format: vi.fn().mockResolvedValue(mockExportResult),
 *     getOptionsSchema: vi.fn().mockReturnValue(mockSchema)
 *   },
 *   verifications: ['format', 'getOptionsSchema']
 * };
 * ```
 */
export interface TestDouble<T> {
  /** Type of test double */
  type: 'mock' | 'stub' | 'spy' | 'fake';
  /** The implementation (can be partial for mocks) */
  implementation: Partial<T>;
  /** Methods that should be verified in tests */
  verifications?: (keyof T)[];
  /** Setup function for the test double */
  setup?: () => void;
  /** Reset function to clean up between tests */
  reset?: () => void;
}

/**
 * Mock lifecycle manager for managing mock creation, setup, and cleanup
 * Provides structured approach to managing mock instances throughout test execution
 * 
 * @template T The type being mocked
 * @example
 * ```typescript
 * const lifecycleManager: MockLifecycleManager<DatabaseService> = {
 *   create: (config) => new MockDatabase(config),
 *   setup: (mock) => mock.connect(),
 *   teardown: (mock) => mock.disconnect(),
 *   reset: (mock) => mock.clearData()
 * };
 * ```
 */
export interface MockLifecycleManager<T> {
  /** Create a new mock instance */
  create(config?: Partial<T>): T;
  /** Setup function called before each test */
  setup?(instance: T): Promise<void> | void;
  /** Teardown function called after each test */
  teardown?(instance: T): Promise<void> | void;
  /** Reset function called between test runs */
  reset?(instance: T): Promise<void> | void;
  /** Validation function to ensure mock is properly configured */
  validate?(instance: T): boolean;
}

/**
 * Test data comparator for deep equality and similarity testing
 * Provides type-safe comparison utilities for complex test assertions
 * 
 * @template T The type being compared
 * @example
 * ```typescript
 * const comparator: TestDataComparator<TrainingPlan> = {
 *   isEqual: (a, b) => deepEqual(a, b),
 *   isSimilar: (a, b, threshold) => similarity(a, b) > threshold,
 *   getDifferences: (a, b) => findDifferences(a, b),
 *   getSignature: (obj) => generateSignature(obj)
 * };
 * ```
 */
export interface TestDataComparator<T> {
  /** Check if two instances are exactly equal */
  isEqual(a: T, b: T): boolean;
  /** Check if two instances are similar within a threshold */
  isSimilar(a: T, b: T, threshold?: number): boolean;
  /** Get detailed differences between two instances */
  getDifferences(a: T, b: T): Array<{
    path: string;
    expected: unknown;
    actual: unknown;
    type: 'missing' | 'extra' | 'different';
  }>;
  /** Get a signature/hash for an instance for quick comparison */
  getSignature(obj: T): string;
  /** Custom comparison function for specific properties */
  customComparators?: Record<keyof T, (a: T[keyof T], b: T[keyof T]) => boolean>;
}

/**
 * Typed mock configuration with enhanced type safety
 * Extends basic mock configuration with additional type constraints and validation
 * 
 * @template T The type being mocked
 * @template TRequired Keys that must be provided
 * @example
 * ```typescript
 * const config: TypedMockConfig<TrainingPlanConfig, 'name' | 'goal'> = {
 *   name: 'Test Plan',
 *   goal: 'marathon',
 *   partialMode: false,
 *   strictValidation: true,
 *   metadata: {
 *     testCase: 'integration-test',
 *     createdBy: 'test-suite'
 *   }
 * };
 * ```
 */
export type TypedMockConfig<T, TRequired extends keyof T = never> = TestConfig<T, TRequired> & {
  /** Whether this is a partial mock (some properties may be undefined) */
  partialMode?: boolean;
  /** Whether to apply strict type validation */
  strictValidation?: boolean;
  /** Mock-specific metadata */
  metadata?: {
    /** Test case this configuration belongs to */
    testCase?: string;
    /** Who or what created this mock */
    createdBy?: string;
    /** Mock creation timestamp */
    createdAt?: Date;
    /** Tags for categorizing mocks */
    tags?: string[];
  };
}