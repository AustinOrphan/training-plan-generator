/**
 * Test-Specific Type Extensions
 * 
 * Provides extended interfaces for test scenarios that need additional properties
 * for backward compatibility or test-specific functionality. These extensions
 * replace 'as any' usage in test files with proper type definitions.
 * 
 * @fileoverview Type extensions for test scenarios
 */

import type { 
  ProgressData, 
  CompletedWorkout, 
  RecoveryMetrics, 
  TrainingPlan,
  PlannedWorkout
} from '../types';
import type { TestAssertion } from './test-types';

/**
 * Extended ProgressData for test scenarios with backward compatibility fields
 * Includes fields that some legacy tests might expect
 */
export interface ExtendedProgressData extends ProgressData {
  /** Fitness improvement measurement for test scenarios */
  fitnessChange?: number;
  /** Progress trend for test validation */
  trend?: 'improving' | 'declining' | 'stable';
  /** Additional test metadata */
  testMetadata?: {
    generatedBy?: string;
    testScenario?: string;
    expectedOutcome?: string;
  };
}

/**
 * Extended CompletedWorkout for test scenarios with additional fields
 * Supports test cases that need extra properties for validation
 */
export interface ExtendedCompletedWorkout extends CompletedWorkout {
  /** Legacy workout ID field for backward compatibility */
  workoutId?: string;
  /** Test-specific validation markers */
  testMarkers?: {
    isValidationTest?: boolean;
    expectedFailure?: boolean;
    customAssertions?: string[];
  };
}

/**
 * Extended RecoveryMetrics for test scenarios
 * Includes additional health metrics for comprehensive testing
 */
export interface ExtendedRecoveryMetrics extends RecoveryMetrics {
  /** Injury status for health tracking tests */
  injuryStatus?: 'healthy' | 'minor' | 'moderate' | 'severe';
  /** Resting heart rate for fitness tests */
  restingHR?: number;
  /** Extended health metrics for advanced test scenarios */
  healthMetrics?: {
    hydrationLevel?: number;
    stressLevel?: number;
    motivationLevel?: number;
  };
}

/**
 * Extended TrainingPlan for test scenarios with validation helpers
 */
export interface ExtendedTrainingPlan extends TrainingPlan {
  /** Test-specific validation flags */
  validationFlags?: {
    skipDateValidation?: boolean;
    allowInvalidWorkouts?: boolean;
    bypassMethodologyChecks?: boolean;
  };
  /** Test metadata for tracking */
  testContext?: {
    generatorVersion?: string;
    testType?: 'unit' | 'integration' | 'performance';
    expectedErrors?: string[];
  };
}

/**
 * Invalid test data types for negative testing scenarios
 * Used when testing error handling and validation
 */
export type InvalidTestData = {
  /** Invalid date values for date validation tests */
  invalidDate: string | number | null | undefined;
  /** Invalid enum values for enum validation tests */
  invalidEnum: string;
  /** Invalid object structures for schema tests */
  invalidObject: Record<string, unknown>;
  /** Invalid array data for array validation tests */
  invalidArray: unknown;
};

/**
 * Test assertion helper for invalid data scenarios
 * Provides type-safe way to test with intentionally invalid data
 */
export interface InvalidDataAssertion<T> extends TestAssertion<T> {
  /** The invalid data being tested */
  invalidData: InvalidTestData[keyof InvalidTestData];
  /** Expected error type or message */
  expectedError: string | RegExp | Error;
  /** Whether the test should expect validation to fail */
  shouldFail: boolean;
}

/**
 * Create extended progress data for tests
 * Safely extends ProgressData with test-specific fields
 */
export function createExtendedProgressData(
  base: ProgressData,
  extensions?: Partial<ExtendedProgressData>
): ExtendedProgressData {
  return {
    ...base,
    ...extensions
  };
}

/**
 * Create extended completed workout for tests
 * Safely extends CompletedWorkout with test-specific fields
 */
export function createExtendedCompletedWorkout(
  base: CompletedWorkout,
  extensions?: Partial<ExtendedCompletedWorkout>
): ExtendedCompletedWorkout {
  return {
    ...base,
    ...extensions
  };
}

/**
 * Create extended recovery metrics for tests
 * Safely extends RecoveryMetrics with test-specific fields
 */
export function createExtendedRecoveryMetrics(
  base: RecoveryMetrics,
  extensions?: Partial<ExtendedRecoveryMetrics>
): ExtendedRecoveryMetrics {
  return {
    ...base,
    ...extensions
  };
}

/**
 * Create test assertion for invalid data scenarios
 * Provides type-safe way to test error conditions
 */
export function createInvalidDataAssertion<T>(
  invalidData: InvalidTestData[keyof InvalidTestData],
  expectedError: string | RegExp | Error,
  expectedType: string
): InvalidDataAssertion<T> {
  return {
    value: invalidData,
    expectedType,
    assert: (value: unknown): value is T => false, // Always fails for invalid data
    invalidData,
    expectedError,
    shouldFail: true,
    context: 'invalid-data-test'
  };
}

/**
 * Type guard for checking if data is extended progress data
 */
export function isExtendedProgressData(data: unknown): data is ExtendedProgressData {
  return typeof data === 'object' && 
         data !== null && 
         'date' in data &&
         ('fitnessChange' in data || 'trend' in data || !('fitnessChange' in data));
}

/**
 * Type guard for checking if data is extended completed workout
 */
export function isExtendedCompletedWorkout(data: unknown): data is ExtendedCompletedWorkout {
  return typeof data === 'object' && 
         data !== null && 
         'completionRate' in data &&
         ('workoutId' in data || 'date' in data || !('workoutId' in data));
}

/**
 * Type guard for checking if data is extended recovery metrics
 */
export function isExtendedRecoveryMetrics(data: unknown): data is ExtendedRecoveryMetrics {
  return typeof data === 'object' && 
         data !== null && 
         'recoveryScore' in data &&
         ('injuryStatus' in data || 'restingHR' in data || !('injuryStatus' in data));
}

/**
 * Utility to safely cast test data with proper type checking
 * Replaces 'as any' with type-safe casting for test scenarios
 */
export function safeTestCast<T extends Record<string, unknown>, E extends Record<string, unknown>>(
  base: T,
  extensions: E,
  validator?: (result: T & E) => boolean
): T & E {
  const result = { ...base, ...extensions };
  
  if (validator && !validator(result)) {
    throw new Error(`Safe test cast validation failed for type ${typeof base}`);
  }
  
  return result;
}

/**
 * Test-specific workout factory with proper typing
 * Replaces any-typed workout creation in tests
 */
export interface TestWorkoutFactory {
  createWithInvalidDate(base: PlannedWorkout, invalidDate: InvalidTestData['invalidDate']): PlannedWorkout & { date: any };
  createWithInvalidProperties(base: PlannedWorkout, invalidProps: Record<string, unknown>): PlannedWorkout & Record<string, unknown>;
  createWithExtensions(base: PlannedWorkout, extensions: Record<string, unknown>): PlannedWorkout & Record<string, unknown>;
}

/**
 * Implementation of test workout factory
 */
export const testWorkoutFactory: TestWorkoutFactory = {
  createWithInvalidDate(base: PlannedWorkout, invalidDate: InvalidTestData['invalidDate']) {
    return { ...base, date: invalidDate };
  },
  
  createWithInvalidProperties(base: PlannedWorkout, invalidProps: Record<string, unknown>) {
    return { ...base, ...invalidProps };
  },
  
  createWithExtensions(base: PlannedWorkout, extensions: Record<string, unknown>) {
    return { ...base, ...extensions };
  }
};

/**
 * Test options factory for creating invalid configurations
 * Replaces 'as any' usage when testing invalid configurations
 */
export interface TestOptionsFactory {
  createInvalidOptions<T extends Record<string, unknown>>(
    base: T,
    invalidFields: Record<string, InvalidTestData[keyof InvalidTestData]>
  ): T & Record<string, unknown>;
}

/**
 * Implementation of test options factory
 */
export const testOptionsFactory: TestOptionsFactory = {
  createInvalidOptions<T extends Record<string, unknown>>(
    base: T,
    invalidFields: Record<string, InvalidTestData[keyof InvalidTestData]>
  ): T & Record<string, unknown> {
    return { ...base, ...invalidFields };
  }
};