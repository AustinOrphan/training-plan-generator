/**
 * Type definitions for methodology loader system
 * Provides type safety for dynamic methodology imports and progressive loading
 */

import {
  TrainingMethodology,
  TrainingPhase,
  FitnessAssessment,
  AdvancedPlanConfig,
} from "../types";
import { TrainingPhilosophy } from "../philosophies";

/**
 * Progressive enhancement levels for methodologies
 */
export type FeatureLevel = "basic" | "standard" | "advanced" | "expert";

/**
 * Environmental constraints for training adaptation
 */
export interface EnvironmentalConstraints {
  temperature?: {
    min: number;
    max: number;
    unit: "celsius" | "fahrenheit";
  };
  altitude?: {
    meters: number;
    acclimatizationDays?: number;
  };
  humidity?: {
    percentage: number;
    adjustmentFactor?: number;
  };
  airQuality?: {
    aqi: number;
    restrictions: string[];
  };
  weather?: {
    conditions: "clear" | "rain" | "snow" | "wind" | "storm";
    windSpeed?: number;
    precipitation?: number;
  };
}

/**
 * Base type for methodology loader operations
 */
export interface MethodologyLoader<
  T extends TrainingPhilosophy = TrainingPhilosophy,
> {
  /**
   * Load methodology with specified feature level
   */
  loadMethodology(
    methodology: TrainingMethodology,
    targetLevel?: FeatureLevel,
  ): Promise<T>;

  /**
   * Check if methodology is loaded at sufficient level
   */
  isMethodologyLoaded(
    methodology: TrainingMethodology,
    requiredLevel: FeatureLevel,
  ): boolean;

  /**
   * Get current loading status for methodologies
   */
  getLoadingStatus(): Record<TrainingMethodology, FeatureLevel | null>;

  /**
   * Clear loaded methodology to free memory
   */
  clearMethodology(methodology: TrainingMethodology): void;
}

/**
 * Methodology-specific options for dynamic loading
 */
export interface MethodologyLoadingOptions<
  T extends TrainingPhilosophy = TrainingPhilosophy,
> {
  /**
   * Target feature level for loading
   */
  featureLevel: FeatureLevel;

  /**
   * Custom configuration for methodology
   */
  config?: Partial<AdvancedPlanConfig>;

  /**
   * Performance constraints
   */
  constraints?: {
    maxLoadTime: number; // milliseconds
    maxMemoryUsage: number; // MB
  };

  /**
   * Progressive loading options
   */
  progressive?: {
    enablePreloading: boolean;
    preloadFeatures: string[];
  };

  /**
   * Type guard for ensuring correct philosophy type
   */
  typeGuard?: (philosophy: TrainingPhilosophy) => philosophy is T;
}

/**
 * Methodology-specific option types
 */
export interface DanielsMethodologyOptions extends MethodologyLoadingOptions {
  vdotCalculation?: {
    useAdjustedVDOT: boolean;
    altitudeAdjustment?: number;
    temperatureAdjustment?: number;
  };
  paceCalculation?: {
    enableCustomZones: boolean;
    customZoneThresholds?: Record<string, number>;
  };
}

export interface LydiardMethodologyOptions extends MethodologyLoadingOptions {
  aerobicBase?: {
    emphasisPercentage: number;
    buildupWeeks: number;
  };
  hillTraining?: {
    includeHillPhase: boolean;
    hillGradient?: number;
    repetitions?: number;
  };
}

export interface PfitzingerMethodologyOptions
  extends MethodologyLoadingOptions {
  lactateThreshold?: {
    testingProtocol: "field" | "lab" | "estimate";
    customThreshold?: number;
  };
  mediumLongRuns?: {
    enableCustomPattern: boolean;
    customSegments?: Array<{
      distance: number;
      pace: string;
      recovery?: number;
    }>;
  };
}

export interface HudsonMethodologyOptions extends MethodologyLoadingOptions {
  adaptiveTraining?: {
    enableAutoAdjustment: boolean;
    recoveryThreshold: number;
  };
  strengthIntegration?: {
    includeStrengthWork: boolean;
    strengthPhases: string[];
  };
}

export interface CustomMethodologyOptions extends MethodologyLoadingOptions {
  customRules?: {
    intensityDistribution: Record<string, number>;
    workoutPriorities: string[];
    recoveryRules: string[];
  };
  validation?: {
    strictValidation: boolean;
    customValidators: Array<(philosophy: TrainingPhilosophy) => boolean>;
  };
}

/**
 * Methodology options type map
 */
export type MethodologyOptionsMap = {
  daniels: DanielsMethodologyOptions;
  lydiard: LydiardMethodologyOptions;
  pfitzinger: PfitzingerMethodologyOptions;
  hudson: HudsonMethodologyOptions;
  custom: CustomMethodologyOptions;
};

/**
 * Enhanced methodology loader with type constraints
 */
export interface TypedMethodologyLoader extends MethodologyLoader {
  /**
   * Load methodology with typed options
   */
  loadMethodologyWithOptions<M extends TrainingMethodology>(
    methodology: M,
    options: MethodologyOptionsMap[M],
  ): Promise<TrainingPhilosophy>;

  /**
   * Load methodology with environmental adaptations
   */
  loadWithEnvironmentalAdaptation(
    methodology: TrainingMethodology,
    constraints: EnvironmentalConstraints,
    options?: MethodologyLoadingOptions,
  ): Promise<TrainingPhilosophy>;

  /**
   * Load methodology with performance optimization
   */
  loadWithPerformanceOptimization(
    methodology: TrainingMethodology,
    config: AdvancedPlanConfig,
    options?: MethodologyLoadingOptions,
  ): Promise<TrainingPhilosophy>;
}

/**
 * Dynamic import result for methodology modules
 */
export interface MethodologyImportResult<
  T extends TrainingPhilosophy = TrainingPhilosophy,
> {
  /**
   * Philosophy class constructor
   */
  PhilosophyClass: new (config?: any) => T;

  /**
   * Module metadata
   */
  metadata: {
    name: string;
    version: string;
    supportedFeatures: string[];
    memoryFootprint: number;
  };

  /**
   * Feature definitions for progressive loading
   */
  features: Record<
    FeatureLevel,
    {
      components: string[];
      dependencies: string[];
      loadTime: number;
    }
  >;

  /**
   * Validation functions
   */
  validators?: {
    configValidator: (config: any) => boolean;
    philosophyValidator: (philosophy: T) => boolean;
  };
}

/**
 * Dynamic import function type
 */
export type MethodologyImportFunction<
  T extends TrainingPhilosophy = TrainingPhilosophy,
> = (methodology: TrainingMethodology) => Promise<MethodologyImportResult<T>>;

/**
 * Feature enhancement function type
 */
export type FeatureEnhancementFunction<
  T extends TrainingPhilosophy = TrainingPhilosophy,
> = (philosophy: T, features: string[]) => Promise<T>;

/**
 * Environmental adaptation function type
 */
export type EnvironmentalAdaptationFunction = (
  constraints: EnvironmentalConstraints,
) => {
  paceAdjustments: Record<string, number>;
  workoutModifications: string[];
  recoveryModifications: string[];
};

/**
 * Performance optimization function type
 */
export type PerformanceOptimizationFunction = (config: AdvancedPlanConfig) => {
  optimizedSettings: Partial<AdvancedPlanConfig>;
  performanceMetrics: Record<string, number>;
  recommendations: string[];
};

/**
 * Progressive loading strategy
 */
export interface ProgressiveLoadingStrategy {
  /**
   * Determine loading order for features
   */
  getLoadingOrder(targetLevel: FeatureLevel): string[];

  /**
   * Check if feature can be loaded based on dependencies
   */
  canLoadFeature(feature: string, loadedFeatures: string[]): boolean;

  /**
   * Get memory impact of loading feature
   */
  getFeatureMemoryImpact(feature: string): number;

  /**
   * Get loading time estimate for feature
   */
  getFeatureLoadTime(feature: string): number;
}

/**
 * Type-safe performance monitoring decorator
 */
export interface PerformanceMonitoringDecorator {
  /**
   * Monitor synchronous operations
   */
  <TArgs extends readonly unknown[], TReturn>(
    operation: string,
    fn: (...args: TArgs) => TReturn,
  ): (...args: TArgs) => TReturn;
}

/**
 * Type-safe async performance monitoring decorator
 */
export interface AsyncPerformanceMonitoringDecorator {
  /**
   * Monitor asynchronous operations
   */
  <TArgs extends readonly unknown[], TReturn>(
    operation: string,
    fn: (...args: TArgs) => Promise<TReturn>,
  ): (...args: TArgs) => Promise<TReturn>;
}

/**
 * Methodology feature set with strict typing
 */
export interface TypedMethodologyFeatureSet {
  readonly level: FeatureLevel;
  readonly features: readonly string[];
  readonly memoryImpact: number;
  readonly loadTime: number;
  readonly dependencies: readonly string[];
  readonly compatibleWith: readonly FeatureLevel[];
}

/**
 * Performance metrics with type constraints
 */
export interface TypedPerformanceMetrics {
  readonly loadTime: number;
  readonly memoryUsage: number;
  readonly planGenerationTime: number;
  readonly workoutSelectionTime: number;
  readonly comparisonTime: number;
  readonly cacheHitRatio: number;
  readonly timestamp: Date;
  readonly featureLevel: FeatureLevel;
}

/**
 * Lazy loading configuration with type safety
 */
export interface TypedLazyLoadingConfig {
  readonly preloadCore: boolean;
  readonly enableProgressiveEnhancement: boolean;
  readonly maxMemoryUsage: number;
  readonly performanceThresholds: {
    readonly planGeneration: number;
    readonly workoutSelection: number;
    readonly comparison: number;
  };
  readonly featureLevelDefaults: Record<
    "beginner" | "intermediate" | "advanced" | "expert",
    FeatureLevel
  >;
  readonly memoryOptimization: {
    readonly enableAutoCleanup: boolean;
    readonly cleanupThreshold: number;
    readonly retentionPolicy: "lru" | "priority" | "time-based";
  };
}
