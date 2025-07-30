/**
 * Methodology-Specific Type Definitions
 * 
 * Provides comprehensive type definitions for methodology-specific configurations
 * and dynamic properties that were previously accessed with 'as any'.
 * 
 * @fileoverview Type definitions for methodology system
 */

import type { TrainingMethodology } from '../types';

/**
 * Extended configuration with methodology-specific properties
 * Addresses the dynamic property access patterns in methodology-conflict-resolver.ts
 */
export interface MethodologyConfig {
  /** Intensity distribution configuration */
  intensity?: {
    /** Percentage of easy intensity training */
    easy: number;
    /** Percentage of moderate intensity training */
    moderate?: number;
    /** Percentage of hard intensity training */
    hard: number;
  };

  /** Volume configuration */
  volume?: {
    /** Weekly training hours */
    weeklyHours: number;
    /** Volume progression rate as a decimal (e.g., 0.1 for 10%) */
    progressionRate: number;
    /** Maximum weekly hours */
    maxWeeklyHours?: number;
  };

  /** Recovery configuration */
  recovery?: {
    /** Recovery emphasis score (0-1) */
    emphasis: number;
    /** Recovery days per week */
    daysPerWeek?: number;
    /** Recovery week frequency */
    weekFrequency?: number;
  };
}

/**
 * Type guard for checking if a config has intensity distribution
 * Uses proper type narrowing instead of 'as any' casting
 */
export function hasIntensityConfig(config: unknown): config is { intensity: MethodologyConfig['intensity'] } {
  return typeof config === 'object' && 
         config !== null && 
         'intensity' in config &&
         typeof (config as Record<string, unknown>).intensity === 'object' &&
         (config as Record<string, unknown>).intensity !== null;
}

/**
 * Type guard for checking if a config has volume configuration
 * Uses proper type narrowing instead of 'as any' casting
 */
export function hasVolumeConfig(config: unknown): config is { volume: MethodologyConfig['volume'] } {
  return typeof config === 'object' && 
         config !== null && 
         'volume' in config &&
         typeof (config as Record<string, unknown>).volume === 'object' &&
         (config as Record<string, unknown>).volume !== null;
}

/**
 * Type guard for checking if a config has recovery configuration
 * Uses proper type narrowing instead of 'as any' casting
 */
export function hasRecoveryConfig(config: unknown): config is { recovery: MethodologyConfig['recovery'] } {
  return typeof config === 'object' && 
         config !== null && 
         'recovery' in config &&
         typeof (config as Record<string, unknown>).recovery === 'object' &&
         (config as Record<string, unknown>).recovery !== null;
}

/**
 * Safely access intensity configuration
 */
export function getIntensityConfig(config: unknown): MethodologyConfig['intensity'] | undefined {
  if (hasIntensityConfig(config)) {
    return config.intensity;
  }
  return undefined;
}

/**
 * Safely access volume configuration
 */
export function getVolumeConfig(config: unknown): MethodologyConfig['volume'] | undefined {
  if (hasVolumeConfig(config)) {
    return config.volume;
  }
  return undefined;
}

/**
 * Safely access recovery configuration
 */
export function getRecoveryConfig(config: unknown): MethodologyConfig['recovery'] | undefined {
  if (hasRecoveryConfig(config)) {
    return config.recovery;
  }
  return undefined;
}

/**
 * Extended training plan generator interface for accessing private methods
 * Used for test scenarios where private method access is needed
 */
export interface TestableTrainingPlanGenerator {
  generateMicrocycles(block: any): any[];
  calculatePaces(vdot: number): any;
  assignWorkouts(microcycle: any, phase: string): void;
}

/**
 * Type guard for checking if generator has testable methods
 * Uses proper type narrowing instead of 'as any' casting
 */
export function isTestableGenerator(generator: unknown): generator is TestableTrainingPlanGenerator {
  return typeof generator === 'object' && 
         generator !== null &&
         'generateMicrocycles' in generator &&
         typeof (generator as Record<string, unknown>).generateMicrocycles === 'function';
}

/**
 * Score record type for philosophy comparator
 */
export type MethodologyScores = Record<TrainingMethodology, Record<string, number>>;

/**
 * Create an empty methodology scores object
 */
export function createEmptyScores(): MethodologyScores {
  return {
    daniels: {},
    lydiard: {},
    pfitzinger: {}
  };
}

/**
 * Severity type with proper union
 */
export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical';

/**
 * Helper to get the highest severity from an array
 */
export function getHighestSeverity(severities: RiskSeverity[]): RiskSeverity {
  if (severities.includes('critical')) return 'critical';
  if (severities.includes('high')) return 'high';
  if (severities.includes('moderate')) return 'moderate';
  return 'low';
}

/**
 * Type-safe severity comparison
 */
export function compareSeverity(a: RiskSeverity, b: RiskSeverity): number {
  const severityOrder: Record<RiskSeverity, number> = {
    low: 0,
    moderate: 1,
    high: 2,
    critical: 3
  };
  return severityOrder[a] - severityOrder[b];
}