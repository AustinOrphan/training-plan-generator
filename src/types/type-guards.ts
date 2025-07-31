/**
 * Runtime Type Guards and Validation System
 * 
 * This module provides runtime type checking with TypeScript type narrowing.
 * It replaces unsafe type assertions and provides type-safe validation functions
 * that can be used throughout the application for runtime type safety.
 * 
 * @fileoverview Runtime type guards for type-safe validation and narrowing
 */

import type {
  TrainingPlan,
  TrainingPlanConfig,
  AdvancedPlanConfig,
  PlannedWorkout,
  CompletedWorkout,
  ProgressData,
  FitnessAssessment,
  TrainingPreferences,
  EnvironmentalFactors,
  TargetRace,
  RecoveryMetrics,
  RunData,
  TrainingBlock,
  ExportFormat,
  TrainingMethodology
} from '../types';
import type { TypeGuard, TypedResult } from './base-types';
import { TypeValidationError } from './base-types';

/**
 * Validation guard interface for runtime type checking with validation context
 * Extends basic TypeGuard with validation-specific functionality
 * 
 * @template T The type being validated
 */
export interface ValidationGuard<T> extends TypeGuard<T> {
  /** Validate with detailed error context */
  validateWithContext: (value: unknown, context?: string) => TypedResult<T, TypeValidationError>;
  /** Check if value is valid without throwing */
  isValid: (value: unknown) => boolean;
  /** Get validation errors without throwing */
  getValidationErrors: (value: unknown) => string[];
}

/**
 * Schema guard interface for structural validation
 * Validates object structure and property types
 * 
 * @template T The type being validated
 */
export interface SchemaGuard<T> extends ValidationGuard<T> {
  /** Required properties that must be present */
  requiredProperties: (keyof T)[];
  /** Optional properties that may be present */
  optionalProperties?: (keyof T)[];
  /** Property-specific validators */
  propertyValidators?: Partial<Record<keyof T, (value: unknown) => boolean>>;
}

/**
 * Primitive type guards for basic types
 */
export const primitiveGuards = {
  isString: (value: unknown): value is string => typeof value === 'string',
  isNumber: (value: unknown): value is number => typeof value === 'number' && !isNaN(value),
  isBoolean: (value: unknown): value is boolean => typeof value === 'boolean',
  isDate: (value: unknown): value is Date => value instanceof Date && !isNaN(value.getTime()),
  isArray: <T>(value: unknown, elementGuard?: (item: unknown) => item is T): value is T[] => {
    if (!Array.isArray(value)) return false;
    if (!elementGuard) return true;
    return value.every(elementGuard);
  },
  isObject: (value: unknown): value is Record<string, unknown> => 
    typeof value === 'object' && value !== null && !Array.isArray(value),
  isNonEmptyString: (value: unknown): value is string => 
    typeof value === 'string' && value.trim().length > 0,
  isPositiveNumber: (value: unknown): value is number => 
    typeof value === 'number' && !isNaN(value) && value > 0,
  isNonNegativeNumber: (value: unknown): value is number => 
    typeof value === 'number' && !isNaN(value) && value >= 0
} as const;

/**
 * Create a validation guard from a type guard
 * Adds validation context and error handling to basic type guards
 */
export function createValidationGuard<T>(
  typeGuard: (value: unknown) => value is T,
  typeName: string,
  getValidationErrors?: (value: unknown) => string[]
): ValidationGuard<T> {
  return {
    check: typeGuard,
    name: typeName,
    validateWithContext: (value: unknown, context?: string): TypedResult<T, TypeValidationError> => {
      if (typeGuard(value)) {
        return { success: true, data: value };
      }
      
      const errors = getValidationErrors ? getValidationErrors(value) : [`Expected ${typeName}`];
      const errorMessage = errors.join('; ');
      const validationError = new TypeValidationError(
        errorMessage,
        typeName,
        value,
        context
      );
      
      return { success: false, error: validationError };
    },
    isValid: (value: unknown): boolean => typeGuard(value),
    getValidationErrors: getValidationErrors || ((value: unknown) => 
      typeGuard(value) ? [] : [`Expected ${typeName}, got ${typeof value}`]
    )
  };
}

/**
 * Create a schema guard for object validation
 * Validates object structure and property types
 */
export function createSchemaGuard<T extends object>(
  typeName: string,
  requiredProperties: (keyof T)[],
  optionalProperties: (keyof T)[] = [],
  propertyValidators: Partial<Record<keyof T, (value: unknown) => boolean>> = {}
): SchemaGuard<T> {
  const typeGuard = (value: unknown): value is T => {
    if (!primitiveGuards.isObject(value)) return false;
    
    // Check required properties
    for (const prop of requiredProperties) {
      if (!(prop in value)) return false;
      
      // Apply property-specific validator if available
      const validator = propertyValidators[prop];
      if (validator && !validator((value as any)[prop])) return false;
    }
    
    // Check optional properties if present
    for (const prop of optionalProperties) {
      if (prop in value) {
        const validator = propertyValidators[prop];
        if (validator && !validator((value as any)[prop])) return false;
      }
    }
    
    return true;
  };
  
  const getValidationErrors = (value: unknown): string[] => {
    const errors: string[] = [];
    
    if (!primitiveGuards.isObject(value)) {
      errors.push(`Expected object, got ${typeof value}`);
      return errors;
    }
    
    // Check required properties
    for (const prop of requiredProperties) {
      if (!(prop in value)) {
        errors.push(`Missing required property: ${String(prop)}`);
      } else {
        const validator = propertyValidators[prop];
        if (validator && !validator((value as any)[prop])) {
          errors.push(`Invalid value for property: ${String(prop)}`);
        }
      }
    }
    
    // Check optional properties
    for (const prop of optionalProperties) {
      if (prop in value) {
        const validator = propertyValidators[prop];
        if (validator && !validator((value as any)[prop])) {
          errors.push(`Invalid value for optional property: ${String(prop)}`);
        }
      }
    }
    
    return errors;
  };
  
  return {
    check: typeGuard,
    name: typeName,
    requiredProperties,
    optionalProperties,
    propertyValidators,
    validateWithContext: (value: unknown, context?: string): TypedResult<T, TypeValidationError> => {
      if (typeGuard(value)) {
        return { success: true, data: value };
      }
      
      const errors = getValidationErrors(value);
      const errorMessage = errors.join('; ');
      const validationError = new TypeValidationError(
        errorMessage,
        typeName,
        value,
        context
      );
      
      return { success: false, error: validationError };
    },
    isValid: typeGuard,
    getValidationErrors
  };
}

/**
 * Type guard for FitnessAssessment objects
 */
export const isFitnessAssessment = createSchemaGuard<FitnessAssessment>(
  'FitnessAssessment',
  ['vdot', 'criticalSpeed', 'lactateThreshold', 'runningEconomy', 'weeklyMileage', 'longestRecentRun', 'trainingAge', 'injuryHistory', 'recoveryRate'],
  [],
  {
    vdot: primitiveGuards.isPositiveNumber,
    criticalSpeed: primitiveGuards.isPositiveNumber,
    lactateThreshold: primitiveGuards.isPositiveNumber,
    runningEconomy: primitiveGuards.isPositiveNumber,
    weeklyMileage: primitiveGuards.isNonNegativeNumber,
    longestRecentRun: primitiveGuards.isNonNegativeNumber,
    trainingAge: primitiveGuards.isNonNegativeNumber,
    injuryHistory: (value: unknown) => primitiveGuards.isArray(value, primitiveGuards.isString),
    recoveryRate: (value: unknown) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100
  }
);

/**
 * Type guard for TrainingPreferences objects
 */
export const isTrainingPreferences = createSchemaGuard<TrainingPreferences>(
  'TrainingPreferences',
  ['availableDays', 'preferredIntensity', 'crossTraining', 'strengthTraining', 'timeConstraints'],
  [],
  {
    availableDays: (value: unknown) => primitiveGuards.isArray(value, primitiveGuards.isNumber),
    preferredIntensity: (value: unknown) => typeof value === 'string' && ['low', 'moderate', 'high'].includes(value),
    crossTraining: primitiveGuards.isBoolean,
    strengthTraining: primitiveGuards.isBoolean,
    timeConstraints: (value: unknown) => {
      if (!primitiveGuards.isObject(value)) return false;
      return Object.values(value).every(primitiveGuards.isNumber);
    }
  }
);

/**
 * Type guard for EnvironmentalFactors objects
 */
export const isEnvironmentalFactors = createSchemaGuard<EnvironmentalFactors>(
  'EnvironmentalFactors',
  ['altitude', 'typicalTemperature', 'humidity', 'terrain'],
  [],
  {
    altitude: primitiveGuards.isNumber,
    typicalTemperature: primitiveGuards.isNumber,
    humidity: (value: unknown) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100,
    terrain: (value: unknown) => typeof value === 'string' && ['flat', 'hilly', 'mixed', 'mountainous'].includes(value)
  }
);

/**
 * Type guard for TrainingPlanConfig objects
 */
export const isTrainingPlanConfig = createSchemaGuard<TrainingPlanConfig>(
  'TrainingPlanConfig',
  ['name', 'goal', 'startDate', 'targetDate', 'currentFitness', 'preferences', 'environment'],
  ['description'],
  {
    name: primitiveGuards.isNonEmptyString,
    description: primitiveGuards.isString,
    goal: primitiveGuards.isNonEmptyString,
    startDate: primitiveGuards.isDate,
    targetDate: primitiveGuards.isDate,
    currentFitness: (value: unknown) => isFitnessAssessment.check(value),
    preferences: (value: unknown) => isTrainingPreferences.check(value),
    environment: (value: unknown) => isEnvironmentalFactors.check(value)
  }
);

/**
 * Type guard for TargetRace objects
 */
export const isTargetRace = createSchemaGuard<TargetRace>(
  'TargetRace',
  ['distance', 'date', 'goalTime', 'priority', 'location', 'terrain', 'conditions'],
  [],
  {
    distance: primitiveGuards.isNonEmptyString,
    date: primitiveGuards.isDate,
    goalTime: (value: unknown) => {
      if (!primitiveGuards.isObject(value)) return false;
      const time = value as Record<string, unknown>;
      return primitiveGuards.isNonNegativeNumber(time.hours) &&
             primitiveGuards.isNonNegativeNumber(time.minutes) &&
             primitiveGuards.isNonNegativeNumber(time.seconds);
    },
    priority: (value: unknown) => typeof value === 'string' && ['A', 'B', 'C'].includes(value),
    location: primitiveGuards.isString,
    terrain: (value: unknown) => typeof value === 'string' && ['road', 'trail', 'track', 'mixed'].includes(value),
    conditions: (value: unknown) => isEnvironmentalFactors.check(value)
  }
);

/**
 * Type guard for AdvancedPlanConfig objects
 */
export const isAdvancedPlanConfig = createSchemaGuard<AdvancedPlanConfig>(
  'AdvancedPlanConfig',
  ['name', 'goal', 'startDate', 'targetDate', 'currentFitness', 'preferences', 'environment', 'methodology', 'intensityDistribution', 'periodization', 'targetRaces'],
  ['description', 'seasonGoals', 'adaptationEnabled', 'recoveryMonitoring', 'progressTracking', 'exportFormats', 'platformIntegrations', 'multiRaceConfig', 'adaptationSettings'],
  {
    ...isTrainingPlanConfig.propertyValidators,
    methodology: (value: unknown): value is TrainingMethodology => 
      typeof value === 'string' && ['daniels', 'lydiard', 'pfitzinger', 'hanson', 'custom'].includes(value),
    intensityDistribution: (value: unknown) => {
      if (!primitiveGuards.isObject(value)) return false;
      const dist = value as Record<string, unknown>;
      return primitiveGuards.isNumber(dist.easy) && 
             primitiveGuards.isNumber(dist.moderate) && 
             primitiveGuards.isNumber(dist.hard);
    },
    periodization: (value: unknown) => typeof value === 'string' && ['linear', 'block', 'undulating'].includes(value),
    targetRaces: (value: unknown) => primitiveGuards.isArray(value, (item: unknown) => isTargetRace.check(item)),
    adaptationEnabled: primitiveGuards.isBoolean,
    recoveryMonitoring: primitiveGuards.isBoolean,
    progressTracking: primitiveGuards.isBoolean,
    exportFormats: (value: unknown) => primitiveGuards.isArray(value, (item): item is ExportFormat => 
      typeof item === 'string' && ['pdf', 'ical', 'csv', 'json'].includes(item))
  }
);

/**
 * Type guard for PlannedWorkout objects
 */
export const isPlannedWorkout = createSchemaGuard<PlannedWorkout>(
  'PlannedWorkout',
  ['id', 'date', 'type', 'name', 'targetMetrics', 'workout'],
  ['description'],
  {
    id: primitiveGuards.isNonEmptyString,
    date: primitiveGuards.isDate,
    type: primitiveGuards.isNonEmptyString,
    name: primitiveGuards.isNonEmptyString,
    description: primitiveGuards.isString,
    targetMetrics: (value: unknown) => {
      if (!primitiveGuards.isObject(value)) return false;
      const metrics = value as Record<string, unknown>;
      return primitiveGuards.isPositiveNumber(metrics.duration) &&
             primitiveGuards.isPositiveNumber(metrics.distance) &&
             primitiveGuards.isPositiveNumber(metrics.intensity);
    },
    workout: primitiveGuards.isObject
  }
);

/**
 * Type guard for CompletedWorkout objects
 */
export const isCompletedWorkout = createSchemaGuard<CompletedWorkout>(
  'CompletedWorkout',
  ['plannedWorkout', 'actualDuration', 'actualDistance', 'actualPace', 'avgHeartRate', 'maxHeartRate', 'completionRate', 'adherence', 'difficultyRating'],
  [],
  {
    plannedWorkout: (value: unknown) => isPlannedWorkout.check(value),
    actualDuration: primitiveGuards.isPositiveNumber,
    actualDistance: primitiveGuards.isPositiveNumber,
    actualPace: primitiveGuards.isPositiveNumber,
    avgHeartRate: primitiveGuards.isPositiveNumber,
    maxHeartRate: primitiveGuards.isPositiveNumber,
    completionRate: (value: unknown) => primitiveGuards.isNumber(value) && value >= 0 && value <= 1,
    adherence: (value: unknown) => typeof value === 'string' && ['none', 'partial', 'complete'].includes(value),
    difficultyRating: (value: unknown) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10
  }
);

/**
 * Type guard for RecoveryMetrics objects
 */
export const isRecoveryMetrics = createSchemaGuard<RecoveryMetrics>(
  'RecoveryMetrics',
  ['recoveryScore', 'sleepQuality', 'sleepDuration', 'stressLevel', 'muscleSoreness', 'energyLevel', 'motivation'],
  [],
  {
    recoveryScore: (value: unknown) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100,
    sleepQuality: (value: unknown) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100,
    sleepDuration: primitiveGuards.isPositiveNumber,
    stressLevel: (value: unknown) => primitiveGuards.isNumber(value) && value >= 0 && value <= 100,
    muscleSoreness: (value: unknown) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10,
    energyLevel: (value: unknown) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10,
    motivation: (value: unknown) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10
  }
);

/**
 * Type guard for ProgressData objects
 */
export const isProgressData = createSchemaGuard<ProgressData>(
  'ProgressData',
  ['date', 'perceivedExertion', 'heartRateData', 'performanceMetrics'],
  ['completedWorkouts', 'notes'],
  {
    date: primitiveGuards.isDate,
    perceivedExertion: (value: unknown) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10,
    heartRateData: (value: unknown) => {
      if (!primitiveGuards.isObject(value)) return false;
      const hrData = value as Record<string, unknown>;
      return primitiveGuards.isPositiveNumber(hrData.resting) &&
             primitiveGuards.isPositiveNumber(hrData.average) &&
             primitiveGuards.isPositiveNumber(hrData.maximum);
    },
    performanceMetrics: (value: unknown) => {
      if (!primitiveGuards.isObject(value)) return false;
      const metrics = value as Record<string, unknown>;
      return primitiveGuards.isPositiveNumber(metrics.vo2max) &&
             primitiveGuards.isPositiveNumber(metrics.lactateThreshold) &&
             primitiveGuards.isPositiveNumber(metrics.runningEconomy);
    },
    completedWorkouts: (value: unknown) => primitiveGuards.isArray(value, (item: unknown) => isCompletedWorkout.check(item)),
    notes: primitiveGuards.isString
  }
);

/**
 * Type guard for RunData objects
 */
export const isRunData = createSchemaGuard<RunData>(
  'RunData',
  ['date', 'distance', 'duration', 'avgPace', 'avgHeartRate', 'maxHeartRate', 'elevation', 'effortLevel', 'notes', 'temperature', 'isRace'],
  [],
  {
    date: primitiveGuards.isDate,
    distance: primitiveGuards.isPositiveNumber,
    duration: primitiveGuards.isPositiveNumber,
    avgPace: primitiveGuards.isPositiveNumber,
    avgHeartRate: primitiveGuards.isPositiveNumber,
    maxHeartRate: primitiveGuards.isPositiveNumber,
    elevation: primitiveGuards.isNumber,
    effortLevel: (value: unknown) => primitiveGuards.isNumber(value) && value >= 1 && value <= 10,
    notes: primitiveGuards.isString,
    temperature: primitiveGuards.isNumber,
    isRace: primitiveGuards.isBoolean
  }
);

/**
 * Type guard for TrainingBlock objects
 */
export const isTrainingBlock = createSchemaGuard<TrainingBlock>(
  'TrainingBlock',
  ['id', 'phase', 'startDate', 'endDate', 'weeks', 'focusAreas', 'microcycles'],
  [],
  {
    id: primitiveGuards.isNonEmptyString,
    phase: (value: unknown) => typeof value === 'string' && ['base', 'build', 'peak', 'taper', 'recovery'].includes(value),
    startDate: primitiveGuards.isDate,
    endDate: primitiveGuards.isDate,
    weeks: primitiveGuards.isPositiveNumber,
    focusAreas: (value: unknown) => primitiveGuards.isArray(value, primitiveGuards.isString),
    microcycles: primitiveGuards.isArray
  }
);

/**
 * Type guard for TrainingPlan objects
 */
export const isTrainingPlan = createSchemaGuard<TrainingPlan>(
  'TrainingPlan',
  ['config', 'blocks', 'summary', 'workouts'],
  ['id'],
  {
    id: primitiveGuards.isString,
    config: (value: unknown) => isTrainingPlanConfig.check(value),
    blocks: (value: unknown) => primitiveGuards.isArray(value, (item: unknown) => isTrainingBlock.check(item)),
    summary: primitiveGuards.isObject,
    workouts: (value: unknown) => primitiveGuards.isArray(value, (item: unknown) => isPlannedWorkout.check(item))
  }
);

/**
 * Utility functions for runtime validation
 */
export const validationUtils = {
  /**
   * Safely validate and cast unknown value to specific type
   */
  safeCast: <T>(value: unknown, guard: ValidationGuard<T>, context?: string): TypedResult<T, TypeValidationError> => {
    return guard.validateWithContext(value, context);
  },

  /**
   * Assert that value is of specific type, throw if not
   */
  assertType: <T>(value: unknown, guard: ValidationGuard<T>, context?: string): asserts value is T => {
    const result = guard.validateWithContext(value, context);
    if (!result.success) {
      throw (result as { success: false; error: TypeValidationError }).error;
    }
  },

  /**
   * Check if value matches type without throwing
   */
  isType: <T>(value: unknown, guard: ValidationGuard<T>): value is T => {
    return guard.isValid(value);
  },

  /**
   * Get validation errors for a value
   */
  getErrors: <T>(value: unknown, guard: ValidationGuard<T>): string[] => {
    return guard.getValidationErrors(value);
  },

  /**
   * Validate array of values with element type guard
   */
  validateArray: <T>(values: unknown[], elementGuard: ValidationGuard<T>, context?: string): TypedResult<T[], TypeValidationError> => {
    if (!Array.isArray(values)) {
      return {
        success: false,
        error: new TypeValidationError('Expected array', 'Array', values, context)
      };
    }

    const validatedItems: T[] = [];
    for (let i = 0; i < values.length; i++) {
      const result = elementGuard.validateWithContext(values[i], `${context}[${i}]`);
      if (!result.success) {
        return result as TypedResult<T[], TypeValidationError>;
      }
      validatedItems.push(result.data);
    }

    return { success: true, data: validatedItems };
  }
} as const;

/**
 * Export all validation guards for easy access
 */
export const validationGuards = {
  isFitnessAssessment,
  isTrainingPreferences,
  isEnvironmentalFactors,
  isTrainingPlanConfig,
  isAdvancedPlanConfig,
  isTargetRace,
  isPlannedWorkout,
  isCompletedWorkout,
  isRecoveryMetrics,
  isProgressData,
  isRunData,
  isTrainingBlock,
  isTrainingPlan
} as const;