interface TrainingZone {
    name: string;
    rpe: number;
    heartRateRange?: {
        min: number;
        max: number;
    };
    paceRange?: {
        min: number;
        max: number;
    };
    powerRange?: {
        min: number;
        max: number;
    };
    description: string;
    purpose: string;
}
/**
 * Standard training zones based on physiological markers
 */
declare const TRAINING_ZONES: Record<string, TrainingZone>;
/**
 * Calculate personalized training zones based on fitness metrics
 */
declare function calculatePersonalizedZones(maxHR: number, thresholdPace: number, // min/km
vdot?: number): Record<string, TrainingZone>;
/**
 * Get zone for a given intensity percentage
 */
declare function getZoneByIntensity(intensity: number): TrainingZone;
/**
 * Calculate training pace from VDOT
 */
declare function calculateTrainingPaces(vdot: number): Record<string, number>;

/**
 * Core Type Definitions for Training Plan Generator
 *
 * This module contains the fundamental type definitions used throughout the training plan
 * generator system. These types define the structure of training plans, workouts, fitness
 * assessments, and all related data structures.
 *
 * @fileoverview Core domain types and interfaces for the training plan generator
 * @since 1.0.0
 */

/**
 * Configuration for generating a training plan
 *
 * The core configuration object that defines all aspects of a training plan,
 * including goal, timeline, current fitness level, preferences, and environmental factors.
 * This serves as the primary input for the training plan generation process.
 *
 * @interface TrainingPlanConfig
 * @example
 * ```typescript
 * const config: TrainingPlanConfig = {
 *   name: "Marathon Training Plan",
 *   description: "16-week marathon preparation for sub-3:30 goal",
 *   goal: 'MARATHON',
 *   startDate: new Date('2024-01-01'),
 *   targetDate: new Date('2024-04-21'), // Boston Marathon
 *   currentFitness: {
 *     weeklyMileage: 30,
 *     longestRecentRun: 16,
 *     vdot: 45
 *   },
 *   preferences: {
 *     availableDays: [1, 2, 3, 4, 6], // Mon-Thu, Sat
 *     preferredIntensity: 'moderate',
 *     crossTraining: true,
 *     strengthTraining: false
 *   }
 * };
 * ```
 */
interface TrainingPlanConfig {
    /** Human-readable name for the training plan */
    name: string;
    /** Optional detailed description of the plan's purpose and approach */
    description?: string;
    /** Primary training goal that determines plan structure and focus */
    goal: TrainingGoal;
    /** Target race or goal achievement date (optional for open-ended plans) */
    targetDate?: Date;
    /** Plan start date - used for periodization and scheduling */
    startDate: Date;
    /** Plan end date (auto-calculated if targetDate provided) */
    endDate?: Date;
    /** Current fitness assessment to customize plan difficulty and progression */
    currentFitness?: FitnessAssessment;
    /** Training preferences and constraints */
    preferences?: TrainingPreferences;
    /** Environmental factors that affect training adaptation */
    environment?: EnvironmentalFactors;
}
/**
 * Available training goals that determine plan structure and focus
 *
 * Training goals define the primary objective and target distance for a training plan.
 * Each goal influences workout types, training phases, and periodization approach.
 *
 * @example
 * ```typescript
 * // First-time race goals
 * const beginnerGoal: TrainingGoal = 'FIRST_5K'; // Conservative progression
 * const noviceMarathon: TrainingGoal = 'MARATHON'; // Standard marathon training
 *
 * // Improvement-focused goals
 * const speedGoal: TrainingGoal = 'IMPROVE_5K'; // Higher intensity focus
 * const fitnessGoal: TrainingGoal = 'GENERAL_FITNESS'; // Flexible approach
 *
 * // Distance-specific goals
 * const middleDistance: TrainingGoal = 'HALF_MARATHON'; // 13.1 mile focus
 * const ultraEndurance: TrainingGoal = 'ULTRA'; // 50K+ preparation
 * ```
 */
type TrainingGoal = 
/** First 5K race - beginner-friendly with gradual progression */
"FIRST_5K"
/** Improve existing 5K time - higher intensity and speed work */
 | "IMPROVE_5K"
/** First 10K race - intermediate distance introduction */
 | "FIRST_10K"
/** Half marathon training - endurance base with tempo work */
 | "HALF_MARATHON"
/** Marathon training - full 26.2 mile preparation */
 | "MARATHON"
/** Ultra marathon training - 50K+ distance preparation */
 | "ULTRA"
/** General fitness - flexible approach without specific race goal */
 | "GENERAL_FITNESS";
/**
 * Current fitness assessment for training plan personalization
 *
 * Comprehensive evaluation of an athlete's current fitness level, training history,
 * and physiological metrics. Used to customize training intensity, progression rates,
 * and injury prevention strategies.
 *
 * @interface FitnessAssessment
 * @example
 * ```typescript
 * const assessment: FitnessAssessment = {
 *   // Core fitness metrics
 *   vdot: 45, // Daniels VDOT score from recent race
 *   weeklyMileage: 30, // Current weekly distance
 *   longestRecentRun: 16, // Longest run in last 4 weeks
 *
 *   // Advanced metrics (optional)
 *   criticalSpeed: 15.2, // km/h sustainable pace
 *   lactateThreshold: 14.8, // km/h threshold pace
 *   runningEconomy: 220, // ml/kg/km oxygen cost
 *
 *   // Training background
 *   trainingAge: 3, // Years of consistent training
 *   recoveryRate: 75, // HRV-based recovery score
 *   injuryHistory: ['IT band syndrome', 'plantar fasciitis']
 * };
 * ```
 */
interface FitnessAssessment {
    /** VDOT score from recent race performance or time trial */
    vdot?: number;
    /** Critical speed in km/h - sustainable aerobic pace */
    criticalSpeed?: number;
    /** Lactate threshold pace in km/h */
    lactateThreshold?: number;
    /** Running economy in ml/kg/km - oxygen cost of running */
    runningEconomy?: number;
    /** Current weekly mileage in kilometers per week */
    weeklyMileage: number;
    /** Longest single run completed in recent weeks (km) */
    longestRecentRun: number;
    /** Years of consistent training experience */
    trainingAge?: number;
    /** Previous injuries to consider in plan design */
    injuryHistory?: string[];
    /** Recovery rate score 0-100 based on HRV trends or subjective assessment */
    recoveryRate?: number;
    /** Overall fitness score combining multiple metrics */
    overallScore: number;
    /** Recent race results for VDOT and fitness calculations */
    recentRaces?: RecentRace[];
}
/**
 * Recent race performance data for fitness assessment
 */
interface RecentRace {
    /** Race distance */
    distance: RaceDistance;
    /** Race date */
    date: Date;
    /** Finish time in seconds */
    timeInSeconds: number;
    /** Terrain type */
    terrain?: "road" | "trail" | "track" | "mixed";
    /** Weather conditions */
    conditions?: string;
}
/**
 * Training preferences and constraints for plan customization
 *
 * Defines athlete preferences, scheduling constraints, and training modalities
 * to ensure the plan fits their lifestyle and goals.
 *
 * @interface TrainingPreferences
 * @example
 * ```typescript
 * const preferences: TrainingPreferences = {
 *   // Schedule constraints
 *   availableDays: [1, 2, 3, 4, 6], // Monday through Thursday, Saturday
 *   timeConstraints: {
 *     1: 60, // Monday: 60 minutes available
 *     2: 45, // Tuesday: 45 minutes available
 *     3: 90, // Wednesday: 90 minutes available
 *     4: 60, // Thursday: 60 minutes available
 *     6: 120 // Saturday: 120 minutes available
 *   },
 *
 *   // Training preferences
 *   preferredIntensity: 'moderate', // Balanced approach
 *   crossTraining: true, // Include cycling, swimming
 *   strengthTraining: false // Focus on running only
 * };
 * ```
 */
interface TrainingPreferences {
    /** Days of week available for training (0 = Sunday, 6 = Saturday) */
    availableDays: number[];
    /** Preferred intensity level for training progression */
    preferredIntensity: "low" | "moderate" | "high";
    /** Whether to include cross-training activities (cycling, swimming, etc.) */
    crossTraining: boolean;
    /** Whether to include strength training sessions */
    strengthTraining: boolean;
    /** Time constraints per day of week (day number to available minutes) */
    timeConstraints?: Record<number, number>;
}
/**
 * Environmental factors affecting training adaptation and performance
 *
 * Environmental conditions impact training stress, adaptation rates, and safety considerations.
 * These factors influence pace targets, hydration needs, and workout modifications.
 *
 * @interface EnvironmentalFactors
 * @example
 * ```typescript
 * const environment: EnvironmentalFactors = {
 *   // Location-specific factors
 *   altitude: 1200, // Denver altitude in meters
 *   typicalTemperature: 25, // Average training temperature (°C)
 *   humidity: 45, // Typical humidity percentage
 *
 *   // Training surface characteristics
 *   terrain: 'hilly' // Impacts pace targets and effort levels
 * };
 *
 * // Sea level environment
 * const seaLevel: EnvironmentalFactors = {
 *   terrain: 'flat' // Faster pace targets, less elevation stress
 * };
 *
 * // Trail running environment
 * const trailEnvironment: EnvironmentalFactors = {
 *   terrain: 'trail', // Time-based vs pace-based workouts
 *   altitude: 800,
 *   typicalTemperature: 18
 * };
 * ```
 */
interface EnvironmentalFactors {
    /** Training altitude in meters above sea level (affects VO2 and pace targets) */
    altitude?: number;
    /** Typical training temperature in Celsius (affects hydration and effort) */
    typicalTemperature?: number;
    /** Typical humidity percentage during training (affects heat stress) */
    humidity?: number;
    /** Primary terrain type for training (influences pace targets and workout types) */
    terrain: "flat" | "hilly" | "mixed" | "trail";
}
/**
 * Complete training plan with all workouts, phases, and metadata
 *
 * The primary output of the training plan generator, containing all scheduled workouts,
 * training blocks, and summary information for a complete training program.
 *
 * @interface TrainingPlan
 * @example
 * ```typescript
 * const trainingPlan: TrainingPlan = {
 *   id: 'plan-marathon-2024',
 *   config: planConfig, // Original configuration used
 *
 *   // Training phases and structure
 *   blocks: [
 *     {
 *       id: 'base-phase',
 *       phase: 'base',
 *       weeks: 8,
 *       focusAreas: ['aerobic development', 'base building']
 *     }
 *     // Additional blocks...
 *   ],
 *
 *   // All workouts in chronological order
 *   workouts: [
 *     {
 *       id: 'workout-1',
 *       date: new Date('2024-01-01'),
 *       type: 'easy',
 *       name: 'Easy Run',
 *       description: 'Comfortable aerobic pace'
 *     }
 *     // Additional workouts...
 *   ],
 *
 *   // Plan overview and metrics
 *   summary: {
 *     totalWeeks: 16,
 *     totalWorkouts: 96,
 *     totalDistance: 800, // km
 *     peakWeeklyDistance: 80 // km
 *   }
 * };
 * ```
 */
interface TrainingPlan {
    /** Unique identifier for the training plan */
    id?: string;
    /** Original configuration used to generate this plan */
    config: TrainingPlanConfig;
    /** Training blocks/phases that structure the plan progression */
    blocks: TrainingBlock[];
    /** Summary statistics and overview of the plan */
    summary: PlanSummary;
    /** All planned workouts in chronological order */
    workouts: PlannedWorkout[];
}
/**
 * Training block representing a phase of the overall training plan
 *
 * Training blocks group related weeks together with a common focus and progression.
 * Each block has specific training objectives and contains multiple weekly microcycles.
 *
 * @interface TrainingBlock
 * @example
 * ```typescript
 * const baseBlock: TrainingBlock = {
 *   id: 'base-building-phase',
 *   phase: 'base',
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-02-25'),
 *   weeks: 8,
 *
 *   // Phase-specific objectives
 *   focusAreas: [
 *     'aerobic base building',
 *     'injury prevention',
 *     'consistent mileage'
 *   ],
 *
 *   // Weekly progressions within the block
 *   microcycles: [
 *     {
 *       weekNumber: 1,
 *       pattern: 'Easy-Easy-Easy-Rest-Easy-Long-Rest',
 *       totalLoad: 250,
 *       totalDistance: 40
 *     }
 *     // Additional weeks...
 *   ]
 * };
 * ```
 */
interface TrainingBlock {
    /** Unique identifier for the training block */
    id: string;
    /** Training phase type that determines focus and intensity */
    phase: TrainingPhase;
    /** Start date of the training block */
    startDate: Date;
    /** End date of the training block */
    endDate: Date;
    /** Number of weeks in this block */
    weeks: number;
    /** Primary training objectives and focus areas for this block */
    focusAreas: string[];
    /** Weekly training patterns within this block */
    microcycles: WeeklyMicrocycle[];
}
/**
 * Training phases that define the periodization structure
 *
 * Each phase has distinct characteristics and training focuses that progress
 * toward peak performance on race day.
 *
 * @example
 * ```typescript
 * // Typical marathon periodization sequence
 * const phases: TrainingPhase[] = ['base', 'build', 'peak', 'taper'];
 *
 * // Base phase characteristics
 * const basePhase: TrainingPhase = 'base'; // Aerobic foundation, high volume/low intensity
 *
 * // Build phase characteristics
 * const buildPhase: TrainingPhase = 'build'; // Lactate threshold work, tempo runs
 *
 * // Peak phase characteristics
 * const peakPhase: TrainingPhase = 'peak'; // VO2max intervals, race pace work
 *
 * // Taper phase characteristics
 * const taperPhase: TrainingPhase = 'taper'; // Volume reduction, intensity maintenance
 *
 * // Recovery phase characteristics
 * const recoveryPhase: TrainingPhase = 'recovery'; // Post-race recovery and rebuilding
 * ```
 */
type TrainingPhase = 
/** Base building phase - aerobic foundation with high volume, low intensity */
"base"
/** Build phase - lactate threshold development with tempo and threshold work */
 | "build"
/** Peak phase - VO2max and neuromuscular power with intervals and race pace */
 | "peak"
/** Taper phase - volume reduction while maintaining intensity for race preparation */
 | "taper"
/** Recovery phase - active recovery and regeneration after racing */
 | "recovery";
/**
 * Weekly training microcycle with workout pattern and load metrics
 *
 * Represents a single week of training with specific workout sequencing,
 * load management, and recovery optimization.
 *
 * @interface WeeklyMicrocycle
 * @example
 * ```typescript
 * const buildWeek: WeeklyMicrocycle = {
 *   weekNumber: 12,
 *
 *   // Training pattern for the week
 *   pattern: 'Easy-Tempo-Easy-Intervals-Rest-Long-Recovery',
 *
 *   // All workouts for this week
 *   workouts: [
 *     { id: 'w1', type: 'easy', duration: 45 },
 *     { id: 'w2', type: 'tempo', duration: 60 },
 *     { id: 'w3', type: 'easy', duration: 30 },
 *     { id: 'w4', type: 'vo2max', duration: 50 },
 *     { id: 'w5', type: 'recovery', duration: 90 }
 *   ],
 *
 *   // Week metrics
 *   totalLoad: 320, // Training Stress Score
 *   totalDistance: 65, // Kilometers
 *   recoveryRatio: 0.35 // 35% recovery/easy running
 * };
 * ```
 */
interface WeeklyMicrocycle {
    /** Week number within the overall training plan */
    weekNumber: number;
    /** Training pattern description showing workout sequence */
    pattern: string;
    /** All scheduled workouts for this week */
    workouts: PlannedWorkout[];
    /** Total training load (Training Stress Score) for the week */
    totalLoad: number;
    /** Total distance/volume for the week in kilometers */
    totalDistance: number;
    /** Ratio of recovery/easy training to total training (0-1) */
    recoveryRatio: number;
}
interface PlannedWorkout {
    id: string;
    date: Date;
    type: WorkoutType;
    name: string;
    description: string;
    workout: Workout;
    targetMetrics: WorkoutMetrics;
}
interface Workout {
    type: WorkoutType;
    primaryZone: TrainingZone;
    segments: WorkoutSegment[];
    adaptationTarget: string;
    estimatedTSS: number;
    recoveryTime: number;
}
interface WorkoutSegment {
    duration: number;
    distance?: number;
    intensity: number;
    zone: TrainingZone;
    description: string;
    cadenceTarget?: number;
    heartRateTarget?: {
        min: number;
        max: number;
    };
    paceTarget?: {
        min: number;
        max: number;
        effortBased?: boolean;
        perceivedEffort?: number;
    };
}
interface WorkoutMetrics {
    duration: number;
    distance?: number;
    tss: number;
    load: number;
    intensity: number;
}
type WorkoutType = "recovery" | "easy" | "steady" | "tempo" | "threshold" | "vo2max" | "speed" | "hill_repeats" | "fartlek" | "progression" | "long_run" | "race_pace" | "time_trial" | "cross_training" | "strength";
interface PlanSummary {
    totalWeeks: number;
    totalWorkouts: number;
    totalDistance: number;
    totalTime: number;
    peakWeeklyDistance: number;
    averageWeeklyDistance: number;
    keyWorkouts: number;
    recoveryDays: number;
    phases: PhaseSummary[];
}
interface PhaseSummary {
    phase: TrainingPhase;
    weeks: number;
    focus: string[];
    volumeProgression: number[];
    intensityDistribution: IntensityDistribution;
}
interface IntensityDistribution {
    easy: number;
    moderate: number;
    hard: number;
    veryHard: number;
}
interface IntensityDistributionViolation {
    type: "insufficient_easy" | "excessive_hard";
    phase: TrainingPhase | "overall";
    actual: number;
    target: number;
    difference: number;
    severity: "low" | "medium" | "high" | "critical";
}
interface IntensityDistributionReport {
    overall: IntensityDistribution;
    target: IntensityDistribution;
    phases: Record<string, IntensityDistribution>;
    violations: IntensityDistributionViolation[];
    recommendations: string[];
    compliance: number;
    methodology: string;
}
interface RunData {
    date: Date;
    distance: number;
    duration: number;
    avgPace?: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    elevation?: number;
    effortLevel?: number;
    notes?: string;
    temperature?: number;
    isRace?: boolean;
}
interface RunAnalysis {
    recentRuns: RunData[];
    weeklyPatterns: WeeklyPatterns;
    fitness: FitnessMetrics;
}
interface WeeklyPatterns {
    avgWeeklyMileage: number;
    maxWeeklyMileage: number;
    avgRunsPerWeek: number;
    consistencyScore: number;
    optimalDays: number[];
    typicalLongRunDay: number;
}
interface FitnessMetrics {
    vdot: number;
    criticalSpeed: number;
    runningEconomy: number;
    lactateThreshold: number;
    trainingLoad: TrainingLoad;
    injuryRisk: number;
    recoveryScore: number;
}
interface TrainingLoad {
    acute: number;
    chronic: number;
    ratio: number;
    trend: "increasing" | "stable" | "decreasing";
    recommendation: string;
}
type TrainingMethodology = "daniels" | "lydiard" | "pfitzinger" | "hudson" | "custom";
type ExportFormat = "pdf" | "ical" | "csv" | "json";
type RaceDistance = "5k" | "10k" | "15k" | "half-marathon" | "marathon" | "50k" | "50-mile" | "100k" | "100-mile" | "ultra";
interface TargetRace {
    distance: RaceDistance;
    date: Date;
    goalTime: {
        hours: number;
        minutes: number;
        seconds: number;
    };
    priority: "A" | "B" | "C";
    location: string;
    terrain: "road" | "trail" | "track" | "mixed";
    conditions: EnvironmentalFactors;
}
interface AdvancedPlanConfig extends TrainingPlanConfig {
    methodology: TrainingMethodology;
    intensityDistribution: IntensityDistribution;
    periodization: "linear" | "block" | "undulating" | "reverse";
    targetRaces: TargetRace[];
    seasonGoals?: string[];
    adaptationEnabled?: boolean;
    recoveryMonitoring?: boolean;
    progressTracking?: boolean;
    exportFormats?: ExportFormat[];
    platformIntegrations?: string[];
    intensity?: {
        easy?: number;
        moderate?: number;
        hard?: number;
    };
    volume?: {
        weeklyHours?: number;
        progressionRate?: number;
        weeklyMinutes?: number;
    };
    recovery?: {
        emphasis?: number;
        restDays?: number;
        hoursAfterLT?: number;
    };
    experience?: "beginner" | "intermediate" | "advanced";
    multiRaceConfig?: {
        primaryRace: string;
        secondaryRaces: string[];
        peakingStrategy: "single" | "double" | "multiple";
    };
    adaptationSettings?: {
        sensitivity: "low" | "medium" | "high";
        autoAdjust: boolean;
        thresholds: {
            fatigue: number;
            improvement: number;
        };
    };
}
interface ProgressData {
    date: Date;
    adherenceRate: number;
    completedWorkouts: CompletedWorkout[];
    totalWorkouts: number;
    performanceTrend: "improving" | "maintaining" | "declining";
    volumeProgress: {
        weeklyAverage: number;
        trend: "increasing" | "stable" | "decreasing";
    };
    intensityDistribution: {
        easy: number;
        moderate: number;
        hard: number;
        veryHard: number;
    };
    currentFitness: {
        vdot: number;
        weeklyMileage: number;
        longestRecentRun: number;
        trainingAge: number;
    };
    lastUpdateDate: Date;
    consistencyScore?: number;
    overreachingRisk?: number;
    recoveryTrend?: "improving" | "stable" | "declining";
    perceivedExertion?: number;
    heartRateData?: {
        resting: number;
        average: number;
        maximum: number;
    };
    performanceMetrics?: {
        vo2max: number;
        lactateThreshold: number;
        runningEconomy: number;
    };
    notes?: string;
}
interface CompletedWorkout {
    plannedWorkout: PlannedWorkout;
    actualDuration: number;
    actualDistance: number;
    actualPace: number;
    avgHeartRate: number;
    maxHeartRate: number;
    completionRate: number;
    adherence: "none" | "partial" | "complete";
    difficultyRating: number;
    date: Date;
    perceivedEffort?: number;
    notes?: string;
    workoutId?: string;
}
interface RecoveryMetrics {
    recoveryScore: number;
    sleepQuality: number;
    sleepDuration: number;
    stressLevel: number;
    muscleSoreness: number;
    energyLevel: number;
    motivation: number;
    hrv?: number;
    restingHR?: number;
    notes?: string;
    date?: Date;
}
/**
 * Runner attributes for methodology customization and profiling
 * Defines the key characteristics that influence training approach selection
 */
type RunnerAttribute = "speed" | "endurance" | "consistency" | "mental_toughness" | "recovery" | "injury_resistance" | "hill_running" | "heat_tolerance" | "cold_tolerance";
declare class TypeValidationError$1 extends Error {
    expectedType: string;
    actualValue: unknown;
    constructor(message: string, expectedType: string, actualValue: unknown);
}
type TypedResult$1<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};

/**
 * Configurable Logging System
 *
 * Lightweight logging abstraction that eliminates the need for ESLint disable
 * directives while maintaining full debugging capabilities. Supports multiple
 * backends and configurable log levels for different environments.
 *
 * @fileoverview Type-safe logging utilities with zero-overhead silent mode
 */
/**
 * Log levels in order of severity
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
/**
 * Available logging backends
 */
type LogBackend = 'console' | 'silent' | 'custom';
/**
 * Core logging interface
 * All loggers must implement this interface for consistency
 */
interface Logger {
    /** Log error messages with optional context */
    error(message: string, context?: Record<string, unknown>): void;
    /** Log warning messages with optional context */
    warn(message: string, context?: Record<string, unknown>): void;
    /** Log informational messages with optional context */
    info(message: string, context?: Record<string, unknown>): void;
    /** Log debug messages with optional context */
    debug(message: string, context?: Record<string, unknown>): void;
}
/**
 * Logging configuration options
 */
interface LoggingConfig {
    /** Minimum log level to output (messages below this level are ignored) */
    level: LogLevel;
    /** Backend implementation to use */
    backend: LogBackend;
    /** Custom logger implementation (required when backend is 'custom') */
    customLogger?: Logger;
}
/**
 * Default logging configuration
 * Console logging with error level for development debugging
 */
declare const DEFAULT_LOGGING_CONFIG: LoggingConfig;
/**
 * Silent logging configuration
 * No output - useful for production or testing environments
 */
declare const SILENT_LOGGING_CONFIG: LoggingConfig;
/**
 * Development logging configuration
 * Full console output for debugging
 */
declare const DEVELOPMENT_LOGGING_CONFIG: LoggingConfig;
/**
 * Create a logger instance based on configuration
 *
 * @param config Logging configuration options
 * @returns Configured logger instance
 *
 * @example
 * ```typescript
 * // Console logging (development)
 * const logger = createLogger({ level: 'debug', backend: 'console' });
 * logger.error('Validation failed', { field: 'name', expected: 'string' });
 *
 * // Silent logging (production)
 * const logger = createLogger({ level: 'silent', backend: 'silent' });
 * logger.error('This will not output anything');
 *
 * // Custom logging
 * const customLogger = createLogger({
 *   level: 'error',
 *   backend: 'custom',
 *   customLogger: myWinstonLogger
 * });
 * ```
 */
declare function createLogger(config?: LoggingConfig): Logger;
/**
 * Default logger instance for global use
 * Uses console backend with error level - maintains current behavior
 */
declare const defaultLogger: Logger;
/**
 * Silent logger instance for testing/production use
 * All logging calls become no-ops
 */
declare const silentLogger: Logger;
/**
 * Development logger instance for debugging
 * Full console output at all levels
 */
declare const developmentLogger: Logger;
/**
 * Validate logging configuration
 * Ensures configuration is valid before creating logger
 */
declare function validateLoggingConfig(config: LoggingConfig): string[];
/**
 * Type guard to check if an object implements the Logger interface
 */
declare function isLogger(obj: unknown): obj is Logger;
/**
 * Extract logger from options object or return default logger
 *
 * Provides graceful fallback handling for various scenarios:
 * - Null/undefined options → defaultLogger
 * - Options without logging config → defaultLogger
 * - Invalid logging config → defaultLogger (with warning)
 * - Logger creation failure → defaultLogger (with warning)
 *
 * @param options Options object that may contain logging configuration
 * @returns Logger instance (either configured or default)
 *
 * @example
 * ```typescript
 * // Basic usage - returns defaultLogger
 * const logger1 = getLoggerFromOptions();
 * const logger2 = getLoggerFromOptions({});
 * const logger3 = getLoggerFromOptions({ logging: undefined });
 *
 * // With logging configuration - returns configured logger
 * const logger4 = getLoggerFromOptions({
 *   logging: { level: 'debug', backend: 'console' }
 * });
 *
 * // Export options with logging
 * const exportOptions: BaseExportOptions = {
 *   includePaces: true,
 *   logging: { level: 'info', backend: 'console' }
 * };
 * const logger5 = getLoggerFromOptions(exportOptions);
 * ```
 */
declare function getLoggerFromOptions(options?: {
    logging?: LoggingConfig;
}): Logger;
/**
 * Create options with logging configuration while preserving generic type information
 *
 * This utility function adds logging configuration to an existing options object
 * while maintaining full TypeScript type safety and generic type constraints.
 *
 * @template T Generic type constraint for custom fields
 * @param options Base options object to extend with logging
 * @param logging Logging configuration to add
 * @returns New options object with logging configuration added
 *
 * @example
 * ```typescript
 * // Basic usage
 * const baseOptions = { customField: "value", timeout: 5000 };
 * const optionsWithLogging = withLogging(baseOptions, {
 *   level: 'debug',
 *   backend: 'console'
 * });
 * // Type: LoggableOptions<{ customField: string; timeout: number }>
 *
 * // With export options
 * const exportOptions = { includePaces: true };
 * const exportWithLogging = withLogging(exportOptions, LOGGING_PRESETS.development);
 *
 * // Using with preset configurations
 * const debugOptions = withLogging({ apiKey: "secret" }, LOGGING_PRESETS.debug);
 * ```
 */
declare function withLogging<T extends Record<string, unknown>>(options: TypedOptions<T>, logging: LoggingConfig): LoggableOptions<T>;
/**
 * Common logging configurations for different environments
 *
 * Provides pre-configured logging setups for typical use cases, making it easy
 * to apply consistent logging behavior across different environments and scenarios.
 * These presets are tree-shakable for bundle optimization.
 *
 * @example Environment-Specific Configurations
 * ```typescript
 * // Development - full console output for debugging
 * const devOptions = withLogging(options, LOGGING_PRESETS.development);
 *
 * // Production - silent logging for performance
 * const prodOptions = withLogging(options, LOGGING_PRESETS.production);
 *
 * // Testing - silent logging to avoid test output pollution
 * const testOptions = withLogging(options, LOGGING_PRESETS.testing);
 *
 * // Debug - verbose console output for troubleshooting
 * const debugOptions = withLogging(options, LOGGING_PRESETS.debug);
 * ```
 *
 * @example Migration from Manual Console Statements
 * ```typescript
 * // Before: Direct console usage scattered throughout code
 * function processData(data: unknown) {
 *   console.log('Processing data...'); // No configuration
 *   try {
 *     // ... processing logic
 *   } catch (error) {
 *     console.error('Processing failed:', error); // Always outputs
 *   }
 * }
 *
 * // After: Configurable logging through options
 * function processData(data: unknown, options?: LoggableOptions) {
 *   const logger = getLoggerFromOptions(options);
 *   logger.info('Processing data...'); // Respects configuration
 *
 *   try {
 *     // ... processing logic
 *   } catch (error) {
 *     logger.error('Processing failed:', { error: error.message }); // Configurable
 *   }
 * }
 *
 * // Usage with different environments
 * processData(data, withLogging({}, LOGGING_PRESETS.development)); // Logs everything
 * processData(data, withLogging({}, LOGGING_PRESETS.production));  // Silent
 * processData(data); // Uses default logging behavior
 * ```
 *
 * @example Migration from ESLint Disable Comments
 * ```typescript
 * // Before: ESLint disable comments required
 * function validateInput(input: unknown) {
 *   if (!input) {
 *     // eslint-disable-next-line no-console
 *     console.warn('Input validation warning'); // ESLint violation
 *     return false;
 *   }
 *   return true;
 * }
 *
 * // After: Clean logging without ESLint issues
 * function validateInput(input: unknown, options?: LoggableOptions) {
 *   const logger = getLoggerFromOptions(options);
 *
 *   if (!input) {
 *     logger.warn('Input validation warning'); // No ESLint violation
 *     return false;
 *   }
 *   return true;
 * }
 *
 * // Environment-specific usage
 * const isValid = validateInput(data, {
 *   logging: process.env.NODE_ENV === 'development'
 *     ? LOGGING_PRESETS.development
 *     : LOGGING_PRESETS.production
 * });
 * ```
 */
declare const LOGGING_PRESETS: {
    /** Full console output with debug level - ideal for development environments */
    readonly development: LoggingConfig;
    /** Silent logging - ideal for production environments */
    readonly production: LoggingConfig;
    /** Silent logging - ideal for testing environments to avoid output pollution */
    readonly testing: LoggingConfig;
    /** Verbose console output - ideal for troubleshooting specific issues */
    readonly debug: {
        readonly level: "debug";
        readonly backend: "console";
    };
};

/**
 * Base Types for Runtime Type Validation
 *
 * This module defines the core types and classes used for runtime type checking
 * and validation throughout the application.
 */
/**
 * Type guard function that validates data at runtime
 */
interface TypeGuard<T> {
    check: (data: unknown) => data is T;
    name: string;
}
/**
 * Schema definition for structured data validation
 */
interface TypedSchema<T> {
    validate: (data: unknown) => TypedResult<T, TypeValidationError>;
    properties: Record<string, unknown>;
    required: string[];
    name: string;
}
/**
 * Type-safe collection with metadata
 */
interface TypedCollection<T> {
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
 * Generic options type for type-safe configurations
 */
interface TypedOptions<TCustomFields extends Record<string, unknown> = Record<string, unknown>> {
    [key: string]: unknown;
}
/**
 * Generic options type with optional logging configuration
 *
 * Extends TypedOptions to include logging capabilities for any system that uses
 * type-safe configuration objects. The logging property is optional, ensuring
 * complete backward compatibility with existing code.
 *
 * This interface enables system-wide logging configuration by allowing any options
 * object to include logging settings. Systems can extract loggers using utility
 * functions and apply consistent logging behavior across operations.
 *
 * @template TCustomFields Type-constrained custom fields for configuration extensions
 *
 * @example Basic Usage with Logging Configuration
 * ```typescript
 * import { LoggableOptions, getLoggerFromOptions } from './base-types';
 *
 * const options: LoggableOptions = {
 *   customField: "value",
 *   logging: { level: 'debug', backend: 'console' }
 * };
 *
 * // Extract logger from options
 * const logger = getLoggerFromOptions(options);
 * logger.debug('Processing with configured logger');
 * ```
 *
 * @example Using Logging Presets for Different Environments
 * ```typescript
 * import { LoggableOptions, withLogging, LOGGING_PRESETS } from './logging';
 *
 * // Development environment - full debug output
 * const devOptions = withLogging(
 *   { apiTimeout: 5000 },
 *   LOGGING_PRESETS.development
 * );
 *
 * // Production environment - silent logging
 * const prodOptions = withLogging(
 *   { apiTimeout: 5000 },
 *   LOGGING_PRESETS.production
 * );
 *
 * // Custom debug configuration
 * const debugOptions: LoggableOptions = {
 *   apiTimeout: 5000,
 *   logging: { level: 'debug', backend: 'console' }
 * };
 * ```
 *
 * @example Extending for Specific Option Types
 * ```typescript
 * interface MyApiOptions extends LoggableOptions<{ retryCount: number }> {
 *   timeout: number;
 *   endpoint: string;
 * }
 *
 * const apiOptions: MyApiOptions = {
 *   timeout: 5000,
 *   endpoint: 'https://api.example.com',
 *   retryCount: 3,
 *   logging: { level: 'info', backend: 'console' }
 * };
 *
 * // Type-safe access to both standard and custom fields
 * const logger = getLoggerFromOptions(apiOptions);
 * logger.info(`Connecting to ${apiOptions.endpoint} with ${apiOptions.retryCount} retries`);
 * ```
 *
 * @example Error Handling with Logging Configuration
 * ```typescript
 * import { TypeSafeErrorHandler } from './error-types';
 *
 * const options: LoggableOptions = {
 *   operationId: 'data-export',
 *   logging: { level: 'error', backend: 'console' }
 * };
 *
 * // Error handlers automatically use logging configuration from options
 * const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
 *   validationError,
 *   'user-input-validation',
 *   options
 * );
 * ```
 *
 * @see {@link getLoggerFromOptions} For extracting loggers from options
 * @see {@link withLogging} For adding logging configuration to existing options
 * @see {@link LOGGING_PRESETS} For common environment-specific configurations
 * @see {@link TypeSafeErrorHandler} For error handling with logging configuration
 */
interface LoggableOptions<TCustomFields extends Record<string, unknown> = Record<string, unknown>> extends TypedOptions<TCustomFields> {
    /**
     * Optional logging configuration for this operation
     *
     * When provided, systems should use this configuration to create loggers
     * for the duration of the operation. When omitted, systems should use
     * their default logging behavior.
     *
     * @see {@link import('./logging').LoggingConfig} for configuration options
     */
    logging?: LoggingConfig;
}
/**
 * Result type for type-safe operations
 */
type TypedResult<T, E = TypeValidationError> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
/**
 * Type validation error for runtime type checking failures
 */
declare class TypeValidationError extends Error {
    readonly expectedType: string;
    readonly actualValue: unknown;
    readonly validationContext?: string | undefined;
    constructor(message: string, expectedType: string, actualValue: unknown, validationContext?: string | undefined);
    /**
     * Create an error for a missing required field
     */
    static missingField(field: string): TypeValidationError;
    /**
     * Create an error for an incorrect type
     */
    static incorrectType(field: string, expected: string, actual: unknown): TypeValidationError;
    /**
     * Create an error for an invalid value
     */
    static invalidValue(field: string, value: unknown, constraint: string): TypeValidationError;
}
/**
 * Schema validation error for object structure validation failures
 */
declare class SchemaValidationError extends Error {
    readonly schemaName: string;
    readonly failedProperties: string[];
    readonly actualValue: unknown;
    readonly validationContext?: string | undefined;
    constructor(message: string, schemaName: string, failedProperties: string[], actualValue: unknown, validationContext?: string | undefined);
}

/**
 * Physiological adaptations timeline (in days)
 * Based on sports science research
 */
declare const ADAPTATION_TIMELINE: {
    readonly neuromuscular: 7;
    readonly anaerobic: 14;
    readonly aerobic_power: 21;
    readonly aerobic_capacity: 28;
    readonly mitochondrial: 42;
    readonly capillarization: 56;
};
/**
 * Training phase duration recommendations
 */
declare const PHASE_DURATION: {
    readonly base: {
        readonly min: 4;
        readonly max: 12;
        readonly optimal: 8;
    };
    readonly build: {
        readonly min: 3;
        readonly max: 8;
        readonly optimal: 6;
    };
    readonly peak: {
        readonly min: 2;
        readonly max: 4;
        readonly optimal: 3;
    };
    readonly taper: {
        readonly min: 1;
        readonly max: 3;
        readonly optimal: 2;
    };
    readonly recovery: {
        readonly min: 1;
        readonly max: 2;
        readonly optimal: 1;
    };
};
/**
 * Training intensity distribution models
 */
declare const INTENSITY_MODELS: {
    readonly polarized: {
        readonly easy: 80;
        readonly moderate: 5;
        readonly hard: 15;
    };
    readonly pyramidal: {
        readonly easy: 70;
        readonly moderate: 20;
        readonly hard: 10;
    };
    readonly threshold: {
        readonly easy: 60;
        readonly moderate: 30;
        readonly hard: 10;
    };
};
/**
 * Safe training progression rates
 */
declare const PROGRESSION_RATES: {
    readonly beginner: 0.05;
    readonly intermediate: 0.08;
    readonly advanced: 0.1;
    readonly maxSingleWeek: 0.2;
};
/**
 * Recovery time multipliers based on workout intensity
 */
declare const RECOVERY_MULTIPLIERS: {
    readonly recovery: 0.5;
    readonly easy: 1;
    readonly steady: 1.5;
    readonly tempo: 2;
    readonly threshold: 3;
    readonly vo2max: 4;
    readonly speed: 3.5;
    readonly race: 5;
};
/**
 * Training load thresholds
 */
declare const LOAD_THRESHOLDS: {
    readonly acute_chronic_ratio: {
        readonly veryLow: 0.8;
        readonly low: 1;
        readonly optimal: 1.25;
        readonly high: 1.5;
        readonly veryHigh: 2;
    };
    readonly weekly_tss: {
        readonly recovery: 300;
        readonly maintenance: 500;
        readonly productive: 700;
        readonly overreaching: 900;
        readonly risky: 1200;
    };
};
/**
 * Standard workout durations (minutes)
 */
declare const WORKOUT_DURATIONS: {
    readonly recovery: {
        readonly min: 20;
        readonly max: 40;
        readonly typical: 30;
    };
    readonly easy: {
        readonly min: 30;
        readonly max: 90;
        readonly typical: 60;
    };
    readonly steady: {
        readonly min: 40;
        readonly max: 80;
        readonly typical: 60;
    };
    readonly tempo: {
        readonly min: 20;
        readonly max: 60;
        readonly typical: 40;
    };
    readonly threshold: {
        readonly min: 20;
        readonly max: 40;
        readonly typical: 30;
    };
    readonly intervals: {
        readonly min: 30;
        readonly max: 60;
        readonly typical: 45;
    };
    readonly long_run: {
        readonly min: 60;
        readonly max: 180;
        readonly typical: 120;
    };
};
/**
 * Race distance constants (km)
 */
declare const RACE_DISTANCES: {
    readonly "5K": 5;
    readonly "10K": 10;
    readonly HALF_MARATHON: 21.0975;
    readonly MARATHON: 42.195;
    readonly "50K": 50;
    readonly "50_MILE": 80.4672;
    readonly "100K": 100;
    readonly "100_MILE": 160.9344;
};
/**
 * Environmental adjustment factors
 */
declare const ENVIRONMENTAL_FACTORS: {
    readonly altitude: {
        readonly seaLevel: 1;
        readonly moderate: 0.98;
        readonly high: 0.94;
        readonly veryHigh: 0.88;
    };
    readonly temperature: {
        readonly cold: 0.98;
        readonly cool: 1;
        readonly warm: 0.97;
        readonly hot: 0.92;
    };
    readonly humidity: {
        readonly low: 1;
        readonly moderate: 0.98;
        readonly high: 0.95;
    };
};
/**
 * Training methodology configurations
 */
declare const TRAINING_METHODOLOGIES: {
    readonly daniels: {
        readonly name: "Jack Daniels";
        readonly intensityDistribution: {
            readonly easy: 80;
            readonly moderate: 10;
            readonly hard: 10;
            readonly veryHard: 0;
        };
        readonly workoutPriorities: readonly ["tempo", "vo2max", "threshold", "easy", "long_run"];
        readonly recoveryEmphasis: 0.7;
        readonly phaseTransitions: {
            readonly base: {
                readonly duration: 8;
                readonly focus: "aerobic";
            };
            readonly build: {
                readonly duration: 6;
                readonly focus: "threshold";
            };
            readonly peak: {
                readonly duration: 3;
                readonly focus: "vo2max";
            };
            readonly taper: {
                readonly duration: 2;
                readonly focus: "maintenance";
            };
        };
    };
    readonly lydiard: {
        readonly name: "Arthur Lydiard";
        readonly intensityDistribution: {
            readonly easy: 85;
            readonly moderate: 10;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly workoutPriorities: readonly ["easy", "steady", "long_run", "hill_repeats", "tempo"];
        readonly recoveryEmphasis: 0.9;
        readonly phaseTransitions: {
            readonly base: {
                readonly duration: 12;
                readonly focus: "aerobic";
            };
            readonly build: {
                readonly duration: 4;
                readonly focus: "hills";
            };
            readonly peak: {
                readonly duration: 4;
                readonly focus: "speed";
            };
            readonly taper: {
                readonly duration: 2;
                readonly focus: "maintenance";
            };
        };
    };
    readonly pfitzinger: {
        readonly name: "Pete Pfitzinger";
        readonly intensityDistribution: {
            readonly easy: 75;
            readonly moderate: 15;
            readonly hard: 10;
            readonly veryHard: 0;
        };
        readonly workoutPriorities: readonly ["threshold", "long_run", "tempo", "vo2max", "easy"];
        readonly recoveryEmphasis: 0.8;
        readonly phaseTransitions: {
            readonly base: {
                readonly duration: 6;
                readonly focus: "aerobic";
            };
            readonly build: {
                readonly duration: 8;
                readonly focus: "threshold";
            };
            readonly peak: {
                readonly duration: 3;
                readonly focus: "race_pace";
            };
            readonly taper: {
                readonly duration: 2;
                readonly focus: "maintenance";
            };
        };
    };
    readonly hudson: {
        readonly name: "Brad Hudson";
        readonly intensityDistribution: {
            readonly easy: 70;
            readonly moderate: 20;
            readonly hard: 10;
            readonly veryHard: 0;
        };
        readonly workoutPriorities: readonly ["tempo", "fartlek", "long_run", "vo2max", "easy"];
        readonly recoveryEmphasis: 0.75;
        readonly phaseTransitions: {
            readonly base: {
                readonly duration: 8;
                readonly focus: "aerobic";
            };
            readonly build: {
                readonly duration: 6;
                readonly focus: "tempo";
            };
            readonly peak: {
                readonly duration: 4;
                readonly focus: "race_pace";
            };
            readonly taper: {
                readonly duration: 2;
                readonly focus: "maintenance";
            };
        };
    };
    readonly custom: {
        readonly name: "Custom";
        readonly intensityDistribution: {
            readonly easy: 75;
            readonly moderate: 15;
            readonly hard: 10;
            readonly veryHard: 0;
        };
        readonly workoutPriorities: readonly ["easy", "tempo", "long_run", "vo2max", "threshold"];
        readonly recoveryEmphasis: 0.8;
        readonly phaseTransitions: {
            readonly base: {
                readonly duration: 8;
                readonly focus: "aerobic";
            };
            readonly build: {
                readonly duration: 6;
                readonly focus: "threshold";
            };
            readonly peak: {
                readonly duration: 3;
                readonly focus: "vo2max";
            };
            readonly taper: {
                readonly duration: 2;
                readonly focus: "maintenance";
            };
        };
    };
};
/**
 * Workout emphasis multipliers for different methodologies
 */
declare const WORKOUT_EMPHASIS: {
    readonly daniels: {
        readonly recovery: 1;
        readonly easy: 1.2;
        readonly steady: 1.1;
        readonly tempo: 1.5;
        readonly threshold: 1.4;
        readonly vo2max: 1.3;
        readonly speed: 1.1;
        readonly hill_repeats: 1.2;
        readonly fartlek: 1.2;
        readonly progression: 1.2;
        readonly long_run: 1.2;
        readonly race_pace: 1.3;
        readonly time_trial: 1.1;
        readonly cross_training: 0.8;
        readonly strength: 0.9;
    };
    readonly lydiard: {
        readonly recovery: 1;
        readonly easy: 1.5;
        readonly steady: 1.3;
        readonly tempo: 1.1;
        readonly threshold: 1;
        readonly vo2max: 0.8;
        readonly speed: 0.9;
        readonly hill_repeats: 1.3;
        readonly fartlek: 1;
        readonly progression: 1.2;
        readonly long_run: 1.4;
        readonly race_pace: 1;
        readonly time_trial: 0.9;
        readonly cross_training: 0.7;
        readonly strength: 0.8;
    };
    readonly pfitzinger: {
        readonly recovery: 1;
        readonly easy: 1.3;
        readonly steady: 1.2;
        readonly tempo: 1.2;
        readonly threshold: 1.5;
        readonly vo2max: 1.1;
        readonly speed: 1;
        readonly hill_repeats: 1.1;
        readonly fartlek: 1;
        readonly progression: 1.2;
        readonly long_run: 1.3;
        readonly race_pace: 1.4;
        readonly time_trial: 1.2;
        readonly cross_training: 0.8;
        readonly strength: 0.9;
    };
    readonly hudson: {
        readonly recovery: 1;
        readonly easy: 1.2;
        readonly steady: 1.1;
        readonly tempo: 1.4;
        readonly threshold: 1.2;
        readonly vo2max: 1.1;
        readonly speed: 1;
        readonly hill_repeats: 1.1;
        readonly fartlek: 1.3;
        readonly progression: 1.2;
        readonly long_run: 1.2;
        readonly race_pace: 1.2;
        readonly time_trial: 1.1;
        readonly cross_training: 0.9;
        readonly strength: 1;
    };
    readonly custom: {
        readonly recovery: 1;
        readonly easy: 1.2;
        readonly steady: 1.1;
        readonly tempo: 1.2;
        readonly threshold: 1.2;
        readonly vo2max: 1.1;
        readonly speed: 1;
        readonly hill_repeats: 1.1;
        readonly fartlek: 1.2;
        readonly progression: 1.1;
        readonly long_run: 1.2;
        readonly race_pace: 1.2;
        readonly time_trial: 1.1;
        readonly cross_training: 0.8;
        readonly strength: 0.9;
    };
};
/**
 * Methodology-specific intensity distributions by training phase
 * Each methodology has different emphasis on easy vs. hard training across phases
 */
declare const METHODOLOGY_INTENSITY_DISTRIBUTIONS: {
    readonly daniels: {
        readonly base: {
            readonly easy: 85;
            readonly moderate: 10;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly build: {
            readonly easy: 80;
            readonly moderate: 15;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly peak: {
            readonly easy: 75;
            readonly moderate: 15;
            readonly hard: 10;
            readonly veryHard: 0;
        };
        readonly taper: {
            readonly easy: 80;
            readonly moderate: 15;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly recovery: {
            readonly easy: 95;
            readonly moderate: 5;
            readonly hard: 0;
            readonly veryHard: 0;
        };
    };
    readonly lydiard: {
        readonly base: {
            readonly easy: 90;
            readonly moderate: 8;
            readonly hard: 2;
            readonly veryHard: 0;
        };
        readonly build: {
            readonly easy: 85;
            readonly moderate: 12;
            readonly hard: 3;
            readonly veryHard: 0;
        };
        readonly peak: {
            readonly easy: 80;
            readonly moderate: 15;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly taper: {
            readonly easy: 85;
            readonly moderate: 12;
            readonly hard: 3;
            readonly veryHard: 0;
        };
        readonly recovery: {
            readonly easy: 100;
            readonly moderate: 0;
            readonly hard: 0;
            readonly veryHard: 0;
        };
    };
    readonly pfitzinger: {
        readonly base: {
            readonly easy: 75;
            readonly moderate: 20;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly build: {
            readonly easy: 70;
            readonly moderate: 25;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly peak: {
            readonly easy: 70;
            readonly moderate: 20;
            readonly hard: 10;
            readonly veryHard: 0;
        };
        readonly taper: {
            readonly easy: 75;
            readonly moderate: 20;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly recovery: {
            readonly easy: 90;
            readonly moderate: 10;
            readonly hard: 0;
            readonly veryHard: 0;
        };
    };
    readonly hudson: {
        readonly base: {
            readonly easy: 80;
            readonly moderate: 15;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly build: {
            readonly easy: 75;
            readonly moderate: 20;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly peak: {
            readonly easy: 70;
            readonly moderate: 20;
            readonly hard: 10;
            readonly veryHard: 0;
        };
        readonly taper: {
            readonly easy: 80;
            readonly moderate: 15;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly recovery: {
            readonly easy: 90;
            readonly moderate: 10;
            readonly hard: 0;
            readonly veryHard: 0;
        };
    };
    readonly custom: {
        readonly base: {
            readonly easy: 80;
            readonly moderate: 15;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly build: {
            readonly easy: 75;
            readonly moderate: 20;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly peak: {
            readonly easy: 70;
            readonly moderate: 20;
            readonly hard: 10;
            readonly veryHard: 0;
        };
        readonly taper: {
            readonly easy: 80;
            readonly moderate: 15;
            readonly hard: 5;
            readonly veryHard: 0;
        };
        readonly recovery: {
            readonly easy: 90;
            readonly moderate: 10;
            readonly hard: 0;
            readonly veryHard: 0;
        };
    };
};
/**
 * Phase-specific targets for each methodology
 */
declare const METHODOLOGY_PHASE_TARGETS: {
    readonly daniels: {
        readonly base: readonly ["aerobic_capacity", "mitochondrial"];
        readonly build: readonly ["lactate_threshold", "aerobic_power"];
        readonly peak: readonly ["vo2max", "neuromuscular"];
        readonly taper: readonly ["maintenance", "freshness"];
    };
    readonly lydiard: {
        readonly base: readonly ["aerobic_capacity", "capillarization"];
        readonly build: readonly ["hill_strength", "aerobic_power"];
        readonly peak: readonly ["speed", "neuromuscular"];
        readonly taper: readonly ["maintenance", "freshness"];
    };
    readonly pfitzinger: {
        readonly base: readonly ["aerobic_capacity", "mitochondrial"];
        readonly build: readonly ["lactate_threshold", "marathon_pace"];
        readonly peak: readonly ["race_pace", "aerobic_power"];
        readonly taper: readonly ["maintenance", "race_readiness"];
    };
    readonly hudson: {
        readonly base: readonly ["aerobic_capacity", "mitochondrial"];
        readonly build: readonly ["tempo_endurance", "lactate_buffering"];
        readonly peak: readonly ["race_pace", "neuromuscular"];
        readonly taper: readonly ["maintenance", "freshness"];
    };
    readonly custom: {
        readonly base: readonly ["aerobic_capacity", "mitochondrial"];
        readonly build: readonly ["lactate_threshold", "aerobic_power"];
        readonly peak: readonly ["vo2max", "race_pace"];
        readonly taper: readonly ["maintenance", "freshness"];
    };
};

/**
 * Core interface for training philosophies
 * Defines how different coaching methodologies customize training plans
 */
interface TrainingPhilosophy {
    readonly name: string;
    readonly methodology: TrainingMethodology;
    readonly intensityDistribution: IntensityDistribution;
    readonly workoutPriorities: WorkoutType[];
    readonly recoveryEmphasis: number;
    /**
     * Enhance a base training plan with philosophy-specific customizations
     */
    enhancePlan(basePlan: TrainingPlan): TrainingPlan;
    /**
     * Customize a workout template according to the philosophy
     */
    customizeWorkout(template: Workout, phase: TrainingPhase, weekNumber: number): Workout;
    /**
     * Select appropriate workout template for the given parameters
     */
    selectWorkout(type: WorkoutType, phase: TrainingPhase, weekInPhase: number): string;
    /**
     * Get phase-specific intensity distribution
     */
    getPhaseIntensityDistribution(phase: TrainingPhase): IntensityDistribution;
    /**
     * Calculate workout emphasis multiplier for this philosophy
     */
    getWorkoutEmphasis(type: WorkoutType): number;
}
/**
 * Abstract base class implementing common philosophy behaviors
 */
declare abstract class BaseTrainingPhilosophy implements TrainingPhilosophy {
    readonly methodology: TrainingMethodology;
    readonly name: string;
    protected readonly config: (typeof TRAINING_METHODOLOGIES)[TrainingMethodology];
    constructor(methodology: TrainingMethodology, name: string);
    get intensityDistribution(): IntensityDistribution;
    get workoutPriorities(): WorkoutType[];
    get recoveryEmphasis(): number;
    /**
     * Default plan enhancement - can be overridden by specific philosophies
     */
    enhancePlan(basePlan: TrainingPlan): TrainingPlan;
    /**
     * Enhance a training block with philosophy-specific customizations
     */
    protected enhanceBlock(block: TrainingBlock): TrainingBlock;
    /**
     * Default workout customization - adjusts intensity based on phase and philosophy
     */
    customizeWorkout(template: Workout, phase: TrainingPhase, weekNumber: number): Workout;
    /**
     * Select workout template based on philosophy priorities
     */
    selectWorkout(type: WorkoutType, phase: TrainingPhase, weekInPhase: number): string;
    /**
     * Get phase-specific intensity distribution
     */
    getPhaseIntensityDistribution(phase: TrainingPhase): IntensityDistribution;
    /**
     * Get workout emphasis multiplier
     */
    getWorkoutEmphasis(type: WorkoutType): number;
    /**
     * Adjust intensity based on philosophy and phase
     */
    protected adjustIntensity(baseIntensity: number, phase: TrainingPhase, emphasis: number): number;
    /**
     * Select preferred template based on philosophy
     */
    protected selectPreferredTemplate(templates: string[], phase: TrainingPhase, weekInPhase: number): string;
}
/**
 * Factory for creating training philosophy instances
 */
declare class PhilosophyFactory {
    private static philosophyCache;
    /**
     * Create a training philosophy instance
     */
    static create(methodology: TrainingMethodology): TrainingPhilosophy;
    /**
     * Get list of available methodologies
     */
    static getAvailableMethodologies(): TrainingMethodology[];
    /**
     * Clear the philosophy cache (useful for testing)
     */
    static clearCache(): void;
}
/**
 * Utility functions for working with philosophies
 */
declare const PhilosophyUtils: {
    /**
     * Compare two philosophies by their characteristics
     */
    comparePhilosophies(methodology1: TrainingMethodology, methodology2: TrainingMethodology): {
        intensityDifference: number;
        recoveryDifference: number;
        workoutPriorityOverlap: number;
    };
    /**
     * Get philosophy recommendations based on athlete characteristics
     */
    recommendPhilosophy(characteristics: {
        experience: "beginner" | "intermediate" | "advanced";
        injuryHistory: boolean;
        timeAvailable: "limited" | "moderate" | "extensive";
        goals: "general_fitness" | "race_performance" | "competitive";
    }): TrainingMethodology[];
};

/**
 * Methodology-Aware Export Enhancement System
 *
 * Enhances the existing export system with methodology-specific formatting,
 * philosophy principles documentation, and research citations.
 */

/**
 * Enhanced export metadata with methodology information
 */
interface MethodologyExportMetadata extends ExportMetadata {
    methodology?: TrainingMethodology;
    philosophyName?: string;
    intensityDistribution?: {
        easy: number;
        moderate: number;
        hard: number;
    };
    keyPrinciples?: string[];
    researchCitations?: ResearchCitation[];
    philosophyDescription?: string;
    coachBackground?: string;
}
/**
 * Research citation information
 */
interface ResearchCitation {
    title: string;
    authors: string[];
    journal?: string;
    year: number;
    doi?: string;
    url?: string;
    summary: string;
}
/**
 * Philosophy principles documentation
 */
interface PhilosophyPrinciples {
    corePhilosophy: string;
    keyPrinciples: string[];
    intensityApproach: string;
    recoveryPhilosophy: string;
    periodizationStrategy: string;
    strengthsWeaknesses: {
        strengths: string[];
        considerations: string[];
    };
    idealFor: string[];
    typicalResults: string[];
}
/**
 * Enhanced export result with methodology information
 */
interface MethodologyExportResult extends ExportResult {
    metadata: MethodologyExportMetadata;
    philosophyData?: PhilosophyPrinciples;
    citations?: ResearchCitation[];
}

/**
 * Export Type Definitions
 *
 * Format-specific interfaces for PDF, iCal, CSV, and JSON export options.
 * This module provides type-safe alternatives to the generic FormatOptions
 * interface, enabling format-specific properties and better type checking.
 *
 * @fileoverview Export format type definitions for type-safe export operations
 */

/**
 * Base interface for all export format options
 *
 * Provides common properties shared across all export formats while extending
 * LoggableOptions to enable optional logging configuration for all export operations.
 * This design ensures consistent logging behavior across all export formats
 * (PDF, iCal, CSV, JSON) while maintaining complete backward compatibility.
 *
 * **Key Benefits:**
 * - **Unified Logging**: All export formats automatically inherit logging capabilities
 * - **Format-Agnostic**: Same logging configuration works across PDF, iCal, CSV, and JSON
 * - **Zero Breaking Changes**: Existing export code continues to work unchanged
 * - **Environment-Aware**: Easy to configure different logging for dev/production
 *
 * @template TCustomFields Type-constrained custom fields for format extensions
 *
 * @example Basic Export Without Logging (Backward Compatible)
 * ```typescript
 * // Existing code continues to work unchanged
 * const options: BaseExportOptions = {
 *   includePaces: true,
 *   units: 'metric'
 * };
 *
 * const exporter = new MultiFormatExporter();
 * const result = await exporter.exportPlan(trainingPlan, 'pdf', options);
 * ```
 *
 * @example Enhanced Export with Logging Configuration
 * ```typescript
 * import { LOGGING_PRESETS } from '../types/logging';
 *
 * // Environment-specific logging
 * const devOptions: BaseExportOptions = {
 *   includePaces: true,
 *   units: 'metric',
 *   logging: LOGGING_PRESETS.development // Full debug output
 * };
 *
 * const prodOptions: BaseExportOptions = {
 *   includePaces: true,
 *   units: 'metric',
 *   logging: LOGGING_PRESETS.production // Silent logging
 * };
 *
 * // Custom logging configuration
 * const customOptions: BaseExportOptions = {
 *   includePaces: true,
 *   units: 'metric',
 *   logging: { level: 'info', backend: 'console' }
 * };
 * ```
 *
 * @example Format-Specific Options with Logging
 * ```typescript
 * // PDF export with logging
 * const pdfOptions: PDFOptions = {
 *   pageSize: 'A4',
 *   orientation: 'portrait',
 *   margins: { top: 20, right: 20, bottom: 20, left: 20 },
 *   includeCharts: true,
 *   logging: { level: 'debug', backend: 'console' }
 * };
 *
 * // iCal export with logging
 * const icalOptions: iCalOptions = {
 *   calendarName: 'Training Schedule',
 *   defaultEventDuration: 60,
 *   includeAlarms: true,
 *   logging: { level: 'info', backend: 'console' }
 * };
 *
 * // All format-specific options inherit logging capability
 * const csvOptions: CSVOptions = {
 *   delimiter: ',',
 *   includeHeaders: true,
 *   dateFormat: 'ISO',
 *   logging: LOGGING_PRESETS.development
 * };
 * ```
 *
 * @example Migration from Manual Error Handling
 * ```typescript
 * // Before: Manual console.error statements
 * function exportTrainingPlan(plan: TrainingPlan, format: ExportFormat) {
 *   try {
 *     // ... export logic
 *     console.error('Export failed:', error); // Manual logging
 *   } catch (error) {
 *     console.error('Export failed:', error);
 *   }
 * }
 *
 * // After: Configurable logging through options
 * function exportTrainingPlan(
 *   plan: TrainingPlan,
 *   format: ExportFormat,
 *   options: BaseExportOptions
 * ) {
 *   const logger = getLoggerFromOptions(options);
 *
 *   try {
 *     // Export operations automatically use configured logger
 *     const result = TypeSafeErrorHandler.handleErrorWithOptions(
 *       () => performExport(plan, format, options),
 *       'export-operation',
 *       options
 *     );
 *     return result;
 *   } catch (error) {
 *     // Logger configuration from options applied automatically
 *     logger.error('Export failed', { format, error: error.message });
 *     throw error;
 *   }
 * }
 * ```
 *
 * @example Error Handling Integration
 * ```typescript
 * import { TypeSafeErrorHandler } from '../types/error-types';
 *
 * const exportOptions: BaseExportOptions = {
 *   includePaces: true,
 *   logging: { level: 'error', backend: 'console' }
 * };
 *
 * // Error handlers automatically use logging configuration from options
 * const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
 *   validationError,
 *   'export-validation',
 *   exportOptions // Logging config used automatically
 * );
 *
 * if (!result.success) {
 *   // Error already logged according to options.logging configuration
 *   return { error: result.error };
 * }
 * ```
 *
 * @see {@link LoggableOptions} For the base logging capability interface
 * @see {@link getLoggerFromOptions} For extracting loggers from export options
 * @see {@link LOGGING_PRESETS} For common environment-specific logging configurations
 * @see {@link TypeSafeErrorHandler} For error handling with automatic logging configuration
 */
interface BaseExportOptions<TCustomFields extends Record<string, unknown> = Record<string, unknown>> extends LoggableOptions<TCustomFields> {
    /** Include workout pace information in export */
    includePaces?: boolean;
    /** Include heart rate zone information */
    includeHeartRates?: boolean;
    /** Include power zone information */
    includePower?: boolean;
    /** Target timezone for date/time formatting */
    timeZone?: string;
    /** Unit system for measurements */
    units?: "metric" | "imperial";
    /** Language for text content */
    language?: string;
    /** Detail level for exported content */
    detailLevel?: "basic" | "standard" | "comprehensive";
    /** Include training philosophy principles */
    includePhilosophyPrinciples?: boolean;
    /** Include research citations and references */
    includeResearchCitations?: boolean;
    /** Include coach biography information */
    includeCoachBiography?: boolean;
    /** Include methodology comparison charts */
    includeMethodologyComparison?: boolean;
    /** Include training zone explanations */
    includeTrainingZoneExplanations?: boolean;
    /** Include workout rationale and reasoning */
    includeWorkoutRationale?: boolean;
    /** Enable enhanced methodology-aware export features */
    enhancedExport?: boolean;
}
/**
 * PDF export format options
 * Provides PDF-specific configuration for layout, styling, and content organization
 */
interface PDFOptions extends BaseExportOptions<{
    /** Custom watermark text for PDF pages */
    watermark?: string;
    /** PDF metadata for document properties */
    pdfMetadata?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string[];
    };
}> {
    /** Page size for PDF output */
    pageSize: "A4" | "letter" | "legal" | "A3";
    /** Page orientation */
    orientation: "portrait" | "landscape";
    /** Page margins in millimeters */
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    /** Include visual charts and graphs */
    includeCharts?: boolean;
    /** Chart types to include */
    chartTypes?: Array<"weeklyVolume" | "intensityDistribution" | "periodization" | "trainingLoad">;
    /** Color scheme for charts */
    colorScheme?: "default" | "monochrome" | "highContrast" | "custom";
    /** Custom color palette (when colorScheme is 'custom') */
    customColors?: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
    };
    /** Font settings */
    fonts?: {
        body: string;
        heading: string;
        code: string;
        size: number;
    };
    /** Include table of contents */
    includeTableOfContents?: boolean;
    /** Include page numbers */
    includePageNumbers?: boolean;
    /** Header/footer configuration */
    headerFooter?: {
        includeHeader: boolean;
        includeFooter: boolean;
        headerText?: string;
        footerText?: string;
    };
    /** PDF security settings */
    security?: {
        ownerPassword?: string;
        userPassword?: string;
        permissions?: {
            printing: boolean;
            modifying: boolean;
            copying: boolean;
            annotating: boolean;
        };
    };
}
/**
 * iCalendar export format options
 * Provides iCal-specific configuration for calendar integration and event formatting
 */
interface iCalOptions extends BaseExportOptions<{
    /** Custom event categories for calendar organization */
    eventCategories?: string[];
    /** Calendar color coding system */
    colorCoding?: Record<string, string>;
}> {
    /** Calendar name for the exported calendar */
    calendarName: string;
    /** Calendar description */
    calendarDescription?: string;
    /** Event duration for workouts without specific duration */
    defaultEventDuration: number;
    /** Include location information in events */
    includeLocation?: boolean;
    /** Default location for workouts */
    defaultLocation?: string;
    /** Include alarm/reminder settings */
    includeAlarms?: boolean;
    /** Alarm settings */
    alarmSettings?: {
        /** Minutes before event to trigger alarm */
        minutesBefore: number;
        /** Alarm action type */
        action: "DISPLAY" | "EMAIL" | "AUDIO";
        /** Custom alarm description */
        description?: string;
    };
    /** Include workout notes as event descriptions */
    includeWorkoutNotes?: boolean;
    /** Timezone identifier for calendar events */
    calendarTimezone?: string;
    /** Include training stress score in event titles */
    includeTSSInTitle?: boolean;
    /** Event title format template */
    eventTitleFormat?: string;
    /** Include recurring event rules for repeated workouts */
    includeRecurrence?: boolean;
    /** Organizer information */
    organizer?: {
        name: string;
        email: string;
    };
    /** Attendee list for shared calendars */
    attendees?: Array<{
        name: string;
        email: string;
        role: "REQ-PARTICIPANT" | "OPT-PARTICIPANT" | "NON-PARTICIPANT";
    }>;
}
/**
 * CSV export format options
 * Provides CSV-specific configuration for data formatting and column organization
 */
interface CSVOptions extends BaseExportOptions<{
    /** Custom column mappings for non-standard fields */
    columnMappings?: Record<string, string>;
    /** Data transformation functions for custom formatting */
    dataTransformers?: Record<string, (value: unknown) => string>;
}> {
    /** CSV delimiter character */
    delimiter: "," | ";" | "\t" | "|";
    /** Quote character for text fields */
    quoteChar: '"' | "'";
    /** Include header row with column names */
    includeHeaders: boolean;
    /** Columns to include in export */
    columns?: Array<"date" | "workoutType" | "duration" | "distance" | "pace" | "heartRate" | "power" | "tss" | "description" | "phase" | "week" | "methodology" | "workoutRationale">;
    /** Custom column order */
    columnOrder?: string[];
    /** Date format for date columns */
    dateFormat: "ISO" | "US" | "EU" | "custom";
    /** Custom date format string (when dateFormat is 'custom') */
    customDateFormat?: string;
    /** Number format for numeric values */
    numberFormat?: {
        decimalPlaces: number;
        thousandsSeparator: "," | "." | " " | "";
        decimalSeparator: "." | ",";
    };
    /** Text encoding for file output */
    encoding: "utf-8" | "utf-16" | "iso-8859-1" | "windows-1252";
    /** Include row numbers */
    includeRowNumbers?: boolean;
    /** Include summary statistics row */
    includeSummary?: boolean;
    /** Group workouts by week */
    groupByWeek?: boolean;
    /** Include empty rows between groups */
    includeGroupSeparators?: boolean;
}
/**
 * JSON export format options
 * Provides JSON-specific configuration for data structure and formatting
 */
interface JSONOptions extends BaseExportOptions<{
    /** Custom schema validation rules */
    schemaValidation?: {
        strict: boolean;
        additionalProperties: boolean;
        required: string[];
    };
    /** Data transformation hooks */
    transformHooks?: {
        preExport?: (data: unknown) => unknown;
        postExport?: (json: string) => string;
    };
}> {
    /** JSON formatting style */
    formatting: "compact" | "pretty" | "minified";
    /** Indentation for pretty formatting */
    indentation?: number | string;
    /** Include schema reference in output */
    includeSchema?: boolean;
    /** Schema version identifier */
    schemaVersion?: string;
    /** Include metadata in output */
    includeMetadata: boolean;
    /** Metadata fields to include */
    metadataFields?: Array<"exportDate" | "generatorVersion" | "planStatistics" | "methodologyInfo" | "validationResults">;
    /** Date serialization format */
    dateFormat: "iso" | "timestamp" | "custom" | "epoch";
    /** Custom date serialization function */
    customDateSerializer?: (date: Date) => string | number;
    /** Include type information for complex objects */
    includeTypeHints?: boolean;
    /** Array format preference */
    arrayFormat: "nested" | "flat" | "indexed";
    /** Null value handling */
    nullHandling: "include" | "omit" | "emptyString";
    /** Include validation checksums */
    includeChecksums?: boolean;
    /** Compression settings */
    compression?: {
        enabled: boolean;
        algorithm: "gzip" | "deflate" | "brotli";
        level?: number;
    };
    /** Include source code references for debugging */
    includeDebugInfo?: boolean;
    /** Custom JSON serializer for specific types */
    customSerializers?: Record<string, (value: unknown) => unknown>;
}
/**
 * Export format option type map
 * Maps export format types to their corresponding option interfaces
 * Enables type-safe format-specific option handling
 */
interface ExportFormatOptionsMap {
    pdf: PDFOptions;
    ical: iCalOptions;
    csv: CSVOptions;
    json: JSONOptions;
}
/**
 * Utility type for getting options type by format
 * Enables dynamic typing based on export format
 *
 * @template T The export format type
 * @example
 * ```typescript
 * function getDefaultOptions<T extends ExportFormat>(format: T): OptionsForFormat<T> {
 *   // Returns the appropriate options type for the format
 * }
 * ```
 */
type OptionsForFormat<T extends ExportFormat> = T extends keyof ExportFormatOptionsMap ? ExportFormatOptionsMap[T] : BaseExportOptions;
/**
 * Union type of all format-specific option types
 * Useful for functions that accept any format options
 */
type AnyExportOptions = PDFOptions | iCalOptions | CSVOptions | JSONOptions;
/**
 * Type guard to check if options match a specific format
 * Provides runtime type checking for format-specific options
 *
 * @param options The options to check
 * @param format The expected format
 * @returns Type predicate indicating if options match the format
 * @example
 * ```typescript
 * if (isOptionsForFormat(options, 'pdf')) {
 *   // options is now typed as PDFOptions
 *   console.log(options.pageSize);
 * }
 * ```
 */
declare function isOptionsForFormat<T extends ExportFormat>(options: unknown, format: T): options is OptionsForFormat<T>;
/**
 * Default option values for each export format
 * Provides sensible defaults to reduce configuration overhead
 */
declare const DEFAULT_EXPORT_OPTIONS: Record<ExportFormat, Partial<AnyExportOptions>>;
/**
 * Factory function to create format-specific options with defaults
 * Merges user-provided options with sensible defaults
 *
 * @template T The export format type
 * @param format The export format
 * @param userOptions User-provided options (optional)
 * @returns Merged options with defaults applied
 * @example
 * ```typescript
 * const pdfOptions = createExportOptions('pdf', { pageSize: 'letter' });
 * // Result includes default margins, colors, etc. with custom page size
 * ```
 */
declare function createExportOptions<T extends ExportFormat>(format: T, userOptions?: Partial<OptionsForFormat<T>>): OptionsForFormat<T>;
/**
 * Validation functions for format-specific options
 * Provides runtime validation for each export format's options
 */
declare const EXPORT_OPTION_VALIDATORS: {
    readonly pdf: (options: PDFOptions) => string[];
    readonly ical: (options: iCalOptions) => string[];
    readonly csv: (options: CSVOptions) => string[];
    readonly json: (options: JSONOptions) => string[];
};
/**
 * Validate export options for a specific format
 * Provides runtime validation with detailed error messages
 *
 * @param format The export format
 * @param options The options to validate
 * @returns Array of validation error messages (empty if valid)
 * @example
 * ```typescript
 * const errors = validateExportOptions('pdf', pdfOptions);
 * if (errors.length > 0) {
 *   throw new Error(`Invalid PDF options: ${errors.join(', ')}`);
 * }
 * ```
 */
declare function validateExportOptions<T extends ExportFormat>(format: T, options: OptionsForFormat<T>): string[];

/**
 * Export Validation Types with Runtime Type Guards
 *
 * This module provides type-safe validation functions and runtime type guards for export operations.
 * It replaces generic validation patterns with strongly typed alternatives that provide compile-time
 * type checking and runtime type narrowing.
 *
 * @fileoverview Export validation types and runtime type guards for type-safe export operations
 */

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
interface TypedValidationResult$1<T> {
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
interface ExportFormatValidator<TOptions = BaseExportOptions, TPlan extends TrainingPlan = TrainingPlan> {
    /** The export format this validator handles */
    format: ExportFormat;
    /** Validate export options with type narrowing */
    validateOptions(options: unknown): TypedValidationResult$1<TOptions>;
    /** Validate training plan for export compatibility */
    validatePlan(plan: unknown): TypedValidationResult$1<TPlan>;
    /** Validate compatibility between plan and options */
    validateCompatibility(plan: TPlan, options: TOptions): TypedValidationResult$1<{
        plan: TPlan;
        options: TOptions;
        compatible: boolean;
    }>;
    /** Get typed schema for the export format */
    getSchema(): TypedSchema<TOptions>;
    /** Optional custom validation rules */
    customValidators?: Array<{
        name: string;
        validator: (plan: TPlan, options: TOptions) => TypedValidationResult$1<boolean>;
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
declare function isBaseExportOptions(value: unknown): value is BaseExportOptions;
/**
 * Runtime type guard for PDF export options
 * Provides type narrowing for PDF-specific options
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is PDFOptions
 */
declare function isPDFOptions(value: unknown): value is PDFOptions;
/**
 * Runtime type guard for iCal export options
 * Provides type narrowing for calendar-specific options
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is iCalOptions
 */
declare function isiCalOptions(value: unknown): value is iCalOptions;
/**
 * Runtime type guard for CSV export options
 * Provides type narrowing for CSV-specific options
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is CSVOptions
 */
declare function isCSVOptions(value: unknown): value is CSVOptions;
/**
 * Runtime type guard for JSON export options
 * Provides type narrowing for JSON-specific options
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is JSONOptions
 */
declare function isJSONOptions(value: unknown): value is JSONOptions;
/**
 * Runtime type guard for training plans
 * Validates training plan structure for export compatibility
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is a valid TrainingPlan
 */
declare function isValidTrainingPlan(value: unknown): value is TrainingPlan;
/**
 * Runtime type guard for planned workouts
 * Validates individual workout structure
 *
 * @param value The value to check
 * @returns Type predicate indicating if value is a valid PlannedWorkout
 */
declare function isValidPlannedWorkout(value: unknown): value is PlannedWorkout;
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
declare function createExportValidator<TOptions = BaseExportOptions, TPlan extends TrainingPlan = TrainingPlan>(format: ExportFormat, optionsGuard: (value: unknown) => value is TOptions, planGuard?: (value: unknown) => value is TPlan): ExportFormatValidator<TOptions, TPlan>;
/**
 * Pre-configured validators for all supported export formats
 */
declare const EXPORT_VALIDATORS: {
    readonly pdf: ExportFormatValidator<PDFOptions, TrainingPlan>;
    readonly ical: ExportFormatValidator<iCalOptions, TrainingPlan>;
    readonly csv: ExportFormatValidator<CSVOptions, TrainingPlan>;
    readonly json: ExportFormatValidator<JSONOptions, TrainingPlan>;
};
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
declare function validateExport<TOptions = BaseExportOptions>(format: ExportFormat, plan: unknown, options: unknown): TypedValidationResult$1<{
    plan: TrainingPlan;
    options: TOptions;
}>;
/**
 * Type guard factory for creating custom export validators
 * Enables creation of format-specific validators with proper type safety
 *
 * @template T The type to validate
 * @param name The validator name for debugging
 * @param validator The validation function
 * @returns TypeGuard interface for the validator
 */
declare function createExportTypeGuard<T>(name: string, validator: (value: unknown) => value is T): TypeGuard<T>;
/**
 * Utility type for extracting validated types from validation results
 * Enables type-safe access to validated values
 */
type ValidatedType<T> = T extends TypedValidationResult$1<infer U> ? U : never;
/**
 * Utility type for creating validation result types
 * Simplifies creation of validation result types for specific domains
 */
type ExportValidationResult<T> = TypedValidationResult$1<T>;

/**
 * Export result containing formatted data and metadata
 */
interface ExportResult {
    content: string | Buffer;
    filename: string;
    mimeType: string;
    size: number;
    metadata: ExportMetadata;
}
/**
 * Metadata about the exported plan
 */
interface ExportMetadata {
    planName: string;
    exportDate: Date;
    format: ExportFormat;
    totalWorkouts: number;
    planDuration: number;
    fileSize: number;
    checksum?: string;
    version: string;
}
/**
 * Base formatter interface for all export formats
 * @template TOptions The specific options type for this formatter
 */
interface Formatter<TOptions extends BaseExportOptions = BaseExportOptions> {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    /**
     * Format the training plan to the specific format
     */
    formatPlan(plan: TrainingPlan, options?: TOptions): Promise<ExportResult>;
    /**
     * Validate the plan can be exported in this format
     */
    validatePlan(plan: TrainingPlan): ValidationResult$1;
    /**
     * Get format-specific options schema with proper typing
     */
    getOptionsSchema(): TypedSchema<TOptions>;
}
/**
 * Validation result for export compatibility
 * @deprecated Use TypedValidationResult from export-validation-types for better type safety
 */
interface ValidationResult$1 {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * Enhanced validation result with type safety - preferred for new code
 */
type EnhancedValidationResult<T = any> = TypedValidationResult$1<T>;
/**
 * Format-specific options
 * @deprecated Use specific format interfaces (PDFOptions, CSVOptions, etc.) instead
 * @template TCustomFields Type-safe custom fields constraint
 */
interface FormatOptions<TCustomFields extends Record<string, unknown> = Record<string, unknown>> extends BaseExportOptions<TCustomFields> {
}
/**
 * Chart data for visualization exports
 */
interface ChartData {
    weeklyVolume: {
        week: number;
        distance: number;
    }[];
    intensityDistribution: {
        zone: string;
        percentage: number;
    }[];
    periodization: {
        phase: string;
        weeks: number;
        focus: string[];
    }[];
    trainingLoad: {
        date: string;
        tss: number;
    }[];
}
/**
 * Export manager interface with type-safe operations
 */
interface ExportManager {
    /**
     * Export plan in specified format with type-safe options
     */
    exportPlan(plan: TrainingPlan, format: ExportFormat, options?: BaseExportOptions): Promise<ExportResult>;
    /**
     * Export plan in multiple formats
     */
    exportMultiFormat(plan: TrainingPlan, formats: ExportFormat[], options?: BaseExportOptions): Promise<ExportResult[]>;
    /**
     * Get available formats
     */
    getAvailableFormats(): ExportFormat[];
    /**
     * Register a new formatter with type safety
     */
    registerFormatter<TOptions extends BaseExportOptions>(formatter: Formatter<TOptions>): void;
    /**
     * Validate plan for export compatibility
     */
    validateForExport(plan: TrainingPlan, format: ExportFormat): ValidationResult$1;
}
/**
 * Multi-format exporter implementation with type safety
 */
declare class MultiFormatExporter implements ExportManager {
    private formatters;
    constructor();
    /**
     * Export plan in specified format with type-safe options
     */
    exportPlan(plan: TrainingPlan, format: ExportFormat, options?: BaseExportOptions): Promise<ExportResult>;
    /**
     * Export plan in multiple formats with type-safe options
     */
    exportMultiFormat(plan: TrainingPlan, formats: ExportFormat[], options?: BaseExportOptions): Promise<ExportResult[]>;
    /**
     * Get available formats
     */
    getAvailableFormats(): ExportFormat[];
    /**
     * Register a new formatter with type safety
     */
    registerFormatter<TOptions extends BaseExportOptions>(formatter: Formatter<TOptions>): void;
    /**
     * Validate plan for export compatibility
     */
    validateForExport(plan: TrainingPlan, format: ExportFormat): ValidationResult$1;
    /**
     * Initialize default formatters
     */
    private initializeDefaultFormatters;
    /**
     * Export plan with methodology awareness
     */
    exportPlanWithMethodology(plan: TrainingPlan, format: ExportFormat, options?: FormatOptions): Promise<ExportResult | MethodologyExportResult>;
    /**
     * Export using methodology-aware formatters
     */
    private exportWithMethodologyAwareFormatter;
    /**
     * Enhance standard export with methodology information
     */
    private enhanceStandardExport;
}
/**
 * Base formatter class with common functionality and type safety
 * @template TOptions The specific options type for this formatter
 */
declare abstract class BaseFormatter<TOptions extends BaseExportOptions = BaseExportOptions> implements Formatter<TOptions> {
    abstract format: ExportFormat;
    abstract mimeType: string;
    abstract fileExtension: string;
    abstract formatPlan(plan: TrainingPlan, options?: TOptions): Promise<ExportResult>;
    /**
     * Default validation - can be overridden by specific formatters
     */
    validatePlan(plan: TrainingPlan): ValidationResult$1;
    /**
     * Get format-specific options schema with proper typing
     */
    getOptionsSchema(): TypedSchema<TOptions>;
    /**
     * Generate base metadata
     */
    protected generateMetadata(plan: TrainingPlan, content: string | Buffer): ExportMetadata;
    /**
     * Generate chart data for visualization
     */
    protected generateChartData(plan: TrainingPlan): ChartData;
    private generateWeeklyVolumeData;
    private generateIntensityData;
    private generatePeriodizationData;
    private generateTrainingLoadData;
    private getWorkoutZone;
    /**
     * Calculate pace from zone and fitness metrics
     */
    protected calculatePace(zone: TrainingZone, thresholdPace: number): {
        min: string;
        max: string;
    };
    private formatPace;
}
/**
 * JSON formatter for structured data export
 */
declare class JSONFormatter extends BaseFormatter<JSONOptions> {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult>;
}
/**
 * CSV formatter for spreadsheet compatibility
 */
declare class CSVFormatter extends BaseFormatter<CSVOptions> {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult>;
    private generateSimpleCSV;
    private generateComprehensiveCSV;
    private generatePlanOverviewSection;
    private generateWorkoutScheduleSection;
    private generateWeeklySummarySection;
    private generateTrainingLoadSection;
    private generateProgressTrackingSection;
    private generatePhaseAnalysisSection;
    private generateWeeklyMetrics;
}
/**
 * iCal formatter for calendar integration
 */
declare class iCalFormatter extends BaseFormatter<iCalOptions> {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult>;
    private generateCalendarHeader;
    private generateTimezoneDefinition;
    private generateWorkoutEvent;
    private calculateWorkoutStartTime;
    private generateWorkoutDescription;
    private generateWorkoutLocation;
    private generateWorkoutAlarms;
    private generatePlanOverviewEvent;
    private getWorkoutPriority;
    private formatICalDate;
    private formatICalDateLocal;
    private sanitizeText;
    /**
     * Fold lines to comply with RFC 5545 (75 character limit)
     */
    private foldLine;
    /**
     * Fold all lines in iCal content for RFC 5545 compliance
     */
    private foldContent;
    /**
     * Enhanced validation for iCal format
     */
    validatePlan(plan: TrainingPlan): ValidationResult$1;
}
/**
 * PDF formatter for printable plans
 */
declare class PDFFormatter extends BaseFormatter<PDFOptions> {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult>;
    private generateComprehensiveHTMLContent;
    private getEnhancedCSS;
    private generatePlanHeader;
    private generatePlanOverview;
    private generateTrainingZoneChart;
    private generatePeriodizationChart;
    private generateWeeklyScheduleDetailed;
    private generateWorkoutLibrary;
    private generateProgressTracking;
    private generateFooter;
    private getDetailedWorkoutDescription;
}
/**
 * TrainingPeaks formatter with TSS and workout codes
 */
declare class TrainingPeaksFormatter extends BaseFormatter<BaseExportOptions> {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    formatPlan(plan: TrainingPlan, options?: BaseExportOptions): Promise<ExportResult>;
    private generateTrainingPeaksFormat;
    private formatTrainingPeaksWorkout;
    private generateWorkoutCode;
    private generateTrainingPeaksDescription;
    private generateWorkoutStructure;
    private calculateSegmentPace;
    private calculateSegmentHR;
    private formatTrainingPeaksPace;
    private mapToTrainingPeaksType;
    private generateWorkoutTags;
    private getWorkoutPriority;
    private getRequiredEquipment;
    private calculatePlanDifficulty;
    private estimateWeeklyHours;
    private generateTrainingPeaksAnnotations;
}
/**
 * Strava formatter with activity descriptions and segments
 */
declare class StravaFormatter extends BaseFormatter {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult>;
    private generateStravaFormat;
    private generateStravaDescription;
    private formatStravaActivity;
    private generateStravaActivityName;
    private generateStravaActivityDescription;
    private mapToStravaWorkoutType;
    private estimateAverageHR;
    private estimateMaxHR;
    private calculateAverageSpeed;
    private calculateMaxSpeed;
    private generateSegmentEfforts;
    private generateKilometerSplits;
    private getSplitPaceZone;
    private generateStravaTags;
    private generateStravaSegments;
    private generateStravaGoals;
}
/**
 * Garmin formatter with structured workout files
 */
declare class GarminFormatter extends BaseFormatter {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult>;
    private generateGarminFormat;
    private formatGarminWorkout;
    private generateGarminSegments;
    private getGarminSegmentType;
    private getGarminTargetType;
    private calculatePaceTarget;
    private calculateSegmentTargetLow;
    private calculateSegmentTargetHigh;
    private calculateRestDuration;
    private mapToGarminIntensity;
    private mapToPrimaryBenefit;
    private mapToSecondaryBenefit;
    private getGarminEquipment;
    private generateGarminInstructions;
    private calculateWorkoutDifficulty;
    private calculateGarminDifficulty;
    private generateGarminSchedule;
    private calculateGarminStartTime;
    private getGarminPriority;
    private formatGarminPhase;
    private generateGarminSettings;
}
/**
 * Enhanced JSON formatter for API integration
 */
declare class EnhancedJSONFormatter extends BaseFormatter {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult>;
    private generateEnhancedJSON;
    private formatAPIWorkout;
    private formatWorkoutStructure;
    private generateAPIInstructions;
    private generateAPITags;
    private calculateAPIDifficulty;
    private calculateAverageWeeklyDistance;
    private calculatePeakWeeklyDistance;
    private calculateIntensityDistribution;
    private generateWeeklyData;
    private exportTrainingZones;
    private generateAnalytics;
    private calculateWorkoutTypeDistribution;
    private calculateDurationDistribution;
    private calculateWorkoutDifficulty;
    private getRequiredEquipment;
}
/**
 * TCX formatter for Garmin/training device compatibility
 */
declare class TCXFormatter extends BaseFormatter {
    format: ExportFormat;
    mimeType: string;
    fileExtension: string;
    formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult>;
    private generateWorkoutXML;
}

/**
 * Factory function to create export manager
 */
declare function createExportManager(): ExportManager;
/**
 * Utility functions for export operations
 */
declare const ExportUtils: {
    /**
     * Generate filename with timestamp
     */
    generateFilename(baseName: string, format: ExportFormat): string;
    /**
     * Get file extension for format
     */
    getFileExtension(format: ExportFormat): string;
    /**
     * Get MIME type for format
     */
    getMimeType(format: ExportFormat): string;
};

/**
 * Validation Pipeline
 *
 * Ensures data consistency and integrity throughout the training plan
 * generation, adaptation, and export workflow.
 */

interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
interface ValidationError {
    field: string;
    message: string;
    severity: "error";
    context?: unknown;
}
interface ValidationWarning {
    field: string;
    message: string;
    severity: "warning";
    context?: unknown;
}

/**
 * Error Handling Types for Type Validation Failures
 *
 * Comprehensive error handling system for type validation failures throughout
 * the training plan generator. Provides structured error types, factory functions,
 * and consistent error messaging for type safety violations.
 *
 * @fileoverview Type-safe error handling utilities
 */

/**
 * Enhanced validation error that includes type information
 * Extends the existing ValidationError interface with type-specific data
 */
interface TypedValidationError extends ValidationError {
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
interface TypedValidationWarning extends ValidationWarning {
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
interface TypedValidationResult {
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
declare class TypeValidationErrorFactory {
    /**
     * Create a type mismatch error
     * Used when a value doesn't match its expected type
     */
    static createTypeMismatchError(field: string, expectedType: string, actualValue: unknown, context?: string): TypeValidationError;
    /**
     * Create a schema validation error
     * Used when an object doesn't conform to its schema
     */
    static createSchemaError(schemaName: string, failedProperties: string[], actualValue: unknown, context?: string): SchemaValidationError;
    /**
     * Create a generic type validation error
     * Used for complex type validation scenarios
     */
    static createGenericTypeError(message: string, expectedType: string, actualValue: unknown, context?: string): TypeValidationError;
    /**
     * Create a typed validation error from existing ValidationError
     * Converts regular validation errors to type-aware ones
     */
    static fromValidationError(validationError: ValidationError, expectedType: string, actualValue: unknown): TypedValidationError;
}
/**
 * Result builder for creating comprehensive typed validation results
 * Provides fluent interface for building validation results with type information
 */
declare class TypedValidationResultBuilder {
    private errors;
    private typeErrors;
    private warnings;
    private typeWarnings;
    /**
     * Add a regular validation error
     */
    addError(field: string, message: string, context?: unknown): this;
    /**
     * Add a type-specific validation error
     */
    addTypeError(field: string, message: string, expectedType: string, actualValue: unknown, context?: unknown): this;
    /**
     * Add a regular validation warning
     */
    addWarning(field: string, message: string, context?: unknown): this;
    /**
     * Add a type-specific validation warning
     */
    addTypeWarning(field: string, message: string, warningType: string, recommendation?: string, context?: unknown): this;
    /**
     * Build the final validation result
     */
    build(): TypedValidationResult;
    /**
     * Reset the builder for reuse
     */
    reset(): this;
}
/**
 * Utility functions for working with typed results
 * Provides helper functions for common result handling patterns
 */
declare class TypedResultUtils {
    /**
     * Check if a TypedResult is successful
     */
    static isSuccess<T, E>(result: TypedResult<T, E>): result is {
        success: true;
        data: T;
    };
    /**
     * Check if a TypedResult is an error
     */
    static isError<T, E>(result: TypedResult<T, E>): result is {
        success: false;
        error: E;
    };
    /**
     * Extract data from a successful result, or throw if error
     */
    static unwrap<T, E>(result: TypedResult<T, E>): T;
    /**
     * Extract data from a successful result, or return default if error
     */
    static unwrapOr<T, E>(result: TypedResult<T, E>, defaultValue: T): T;
    /**
     * Transform the data in a successful result
     */
    static map<T, U, E>(result: TypedResult<T, E>, fn: (data: T) => U): TypedResult<U, E>;
    /**
     * Transform the error in a failed result
     */
    static mapError<T, E, F>(result: TypedResult<T, E>, fn: (error: E) => F): TypedResult<T, F>;
    /**
     * Chain multiple operations that return TypedResult
     */
    static chain<T, U, E>(result: TypedResult<T, E>, fn: (data: T) => TypedResult<U, E>): TypedResult<U, E>;
    /**
     * Create a successful result
     */
    static success<T>(data: T): TypedResult<T, never>;
    /**
     * Create an error result
     */
    static error<E>(error: E): TypedResult<never, E>;
}
/**
 * Error aggregator for collecting multiple validation errors
 * Useful for batch validation operations
 */
declare class ValidationErrorAggregator {
    private errors;
    private schemaErrors;
    /**
     * Add a type validation error
     */
    addError(error: TypeValidationError): this;
    /**
     * Add a schema validation error
     */
    addSchemaError(error: SchemaValidationError): this;
    /**
     * Add multiple errors at once
     */
    addErrors(errors: (TypeValidationError | SchemaValidationError)[]): this;
    /**
     * Check if there are any errors
     */
    hasErrors(): boolean;
    /**
     * Get all errors
     */
    getAllErrors(): (TypeValidationError | SchemaValidationError)[];
    /**
     * Create a TypedResult based on accumulated errors
     */
    toResult<T>(data?: T): TypedResult<T, (TypeValidationError | SchemaValidationError)[]>;
    /**
     * Clear all accumulated errors
     */
    clear(): this;
    /**
     * Get error summary for reporting
     */
    getSummary(): {
        totalErrors: number;
        typeErrors: number;
        schemaErrors: number;
        affectedFields: string[];
    };
}
/**
 * Type-safe error handler for common error scenarios
 * Provides standardized error handling patterns with configurable logging
 */
declare class TypeSafeErrorHandler {
    /**
     * Handle type validation errors with proper logging and user feedback
     *
     * @param error The type validation error to handle
     * @param context Context string for the error (default: "validation")
     * @param logger Optional logger instance (default: defaultLogger)
     */
    static handleValidationError(error: TypeValidationError, context?: string, logger?: Logger): TypedResult<never, string>;
    /**
     * Handle schema validation errors with detailed feedback
     *
     * @param error The schema validation error to handle
     * @param context Context string for the error (default: "schema-validation")
     * @param logger Optional logger instance (default: defaultLogger)
     */
    static handleSchemaError(error: SchemaValidationError, context?: string, logger?: Logger): TypedResult<never, string>;
    /**
     * Convert any error to a typed result with consistent handling
     */
    static safelyHandle<T>(operation: () => T, context?: string): TypedResult<T, string>;
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
    static handleValidationErrorWithOptions(error: TypeValidationError, context?: string, options?: {
        logging?: LoggingConfig;
    }): TypedResult<never, string>;
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
    static handleSchemaErrorWithOptions(error: SchemaValidationError, context?: string, options?: {
        logging?: LoggingConfig;
    }): TypedResult<never, string>;
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
    static handleErrorWithOptions<T>(operation: () => T, context?: string, options?: {
        logging?: LoggingConfig;
    }): TypedResult<T, string>;
}

/**
 * Methodology-Specific Type Definitions
 *
 * Provides comprehensive type definitions for methodology-specific configurations
 * and dynamic properties that were previously accessed with 'as any'.
 *
 * @fileoverview Type definitions for methodology system
 */

/**
 * Extended configuration with methodology-specific properties
 * Addresses the dynamic property access patterns in methodology-conflict-resolver.ts
 */
interface MethodologyConfig {
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
declare function hasIntensityConfig(config: unknown): config is {
    intensity: MethodologyConfig["intensity"];
};
/**
 * Type guard for checking if a config has volume configuration
 * Uses proper type narrowing instead of 'as any' casting
 */
declare function hasVolumeConfig(config: unknown): config is {
    volume: MethodologyConfig["volume"];
};
/**
 * Type guard for checking if a config has recovery configuration
 * Uses proper type narrowing instead of 'as any' casting
 */
declare function hasRecoveryConfig(config: unknown): config is {
    recovery: MethodologyConfig["recovery"];
};
/**
 * Safely access intensity configuration
 */
declare function getIntensityConfig(config: unknown): MethodologyConfig["intensity"] | undefined;
/**
 * Safely access volume configuration
 */
declare function getVolumeConfig(config: unknown): MethodologyConfig["volume"] | undefined;
/**
 * Safely access recovery configuration
 */
declare function getRecoveryConfig(config: unknown): MethodologyConfig["recovery"] | undefined;
/**
 * Extended training plan generator interface for accessing private methods
 * Used for test scenarios where private method access is needed
 */
interface TestableTrainingPlanGenerator {
    generateMicrocycles(block: any): any[];
    calculatePaces(vdot: number): any;
    assignWorkouts(microcycle: any, phase: string): void;
}
/**
 * Type guard for checking if generator has testable methods
 * Uses proper type narrowing instead of 'as any' casting
 */
declare function isTestableGenerator(generator: unknown): generator is TestableTrainingPlanGenerator;
/**
 * Score record type for philosophy comparator
 */
type MethodologyScores = Record<TrainingMethodology, Record<string, number>>;
/**
 * Create an empty methodology scores object
 */
declare function createEmptyScores(): MethodologyScores;
/**
 * Severity type with proper union
 */
type RiskSeverity = "low" | "moderate" | "high" | "critical";
/**
 * Helper to get the highest severity from an array
 */
declare function getHighestSeverity(severities: RiskSeverity[]): RiskSeverity;
/**
 * Type-safe severity comparison
 */
declare function compareSeverity(a: RiskSeverity, b: RiskSeverity): number;

/**
 * Methodology Cache Type Definitions
 *
 * This module provides type-safe caching interfaces for training methodologies,
 * leveraging the existing LRUCache pattern while adding generic type parameters
 * and proper constraints for methodology-specific data.
 *
 * @fileoverview Type definitions for methodology caching system with generic constraints
 */

/**
 * Generic cache entry interface with typed value and metadata
 * Extends the existing cache entry pattern with proper type constraints
 *
 * @template T The type of the cached value
 * @example
 * ```typescript
 * const entry: MethodologyCacheEntry<TrainingPhilosophy> = {
 *   value: philosophyInstance,
 *   timestamp: Date.now(),
 *   hash: 'methodology-hash',
 *   metadata: {
 *     methodology: 'daniels',
 *     featureLevel: 'advanced',
 *     version: '1.0.0'
 *   }
 * };
 * ```
 */
interface MethodologyCacheEntry<T> {
    /** The cached value with proper typing */
    value: T;
    /** Timestamp when the entry was created */
    timestamp: number;
    /** Hash string for cache key validation */
    hash: string;
    /** Optional metadata about the cached entry */
    metadata?: {
        /** The methodology this entry represents */
        methodology?: TrainingMethodology;
        /** Feature level of the cached content */
        featureLevel?: FeatureLevel$1;
        /** Version of the cached data */
        version?: string;
        /** Size of the cached data in bytes */
        size?: number;
        /** Number of times this entry has been accessed */
        accessCount?: number;
        /** Last access timestamp */
        lastAccessed?: number;
    };
}
/**
 * Feature level enumeration for progressive methodology loading
 * Defines different levels of methodology features that can be cached separately
 */
type FeatureLevel$1 = "basic" | "standard" | "advanced" | "expert";
/**
 * Generic methodology cache interface with type parameters
 * Leverages the existing LRUCache pattern while adding methodology-specific typing
 *
 * @template T The type of values stored in the cache (constrained to TrainingPhilosophy or its subtypes)
 * @example
 * ```typescript
 * const cache: MethodologyCache<DanielsPhilosophy> = new LRUMethodologyCache(100, 600000);
 *
 * cache.set('daniels-advanced', philosophy, 'hash-123', {
 *   methodology: 'daniels',
 *   featureLevel: 'advanced'
 * });
 * ```
 */
interface MethodologyCache<T extends TrainingPhilosophy = TrainingPhilosophy> {
    /** Get a cached value by key with proper type safety */
    get(key: string): T | undefined;
    /** Set a cached value with typed constraints */
    set(key: string, value: T, hash: string, metadata?: MethodologyCacheEntry<T>["metadata"]): void;
    /** Check if a key exists in the cache */
    has(key: string): boolean;
    /** Delete a specific cache entry */
    delete(key: string): boolean;
    /** Clear all cache entries */
    clear(): void;
    /** Get current cache size */
    size(): number;
    /** Get all cache keys */
    keys(): string[];
    /** Get cache entries matching a filter predicate */
    getEntriesWhere(predicate: (entry: MethodologyCacheEntry<T>) => boolean): MethodologyCacheEntry<T>[];
    /** Get cache statistics */
    getStats(): MethodologyCacheStats;
}
/**
 * Cache statistics interface for monitoring and optimization
 * Provides insights into cache performance and usage patterns
 */
interface MethodologyCacheStats {
    /** Total number of cached entries */
    totalEntries: number;
    /** Total memory usage in bytes */
    memoryUsage: number;
    /** Cache hit rate (0-1) */
    hitRate: number;
    /** Cache miss rate (0-1) */
    missRate: number;
    /** Average access time in milliseconds */
    avgAccessTime: number;
    /** Most frequently accessed entries */
    topEntries: Array<{
        key: string;
        accessCount: number;
        methodology?: TrainingMethodology;
    }>;
    /** Oldest entries that might be candidates for eviction */
    oldestEntries: Array<{
        key: string;
        age: number;
        lastAccessed: number;
    }>;
}
/**
 * Methodology-specific cache configuration
 * Extends basic cache configuration with methodology-specific options
 */
interface MethodologyCacheConfig {
    /** Maximum number of entries in the cache */
    maxSize: number;
    /** Maximum age of entries in milliseconds */
    maxAgeMs: number;
    /** Whether to automatically cleanup expired entries */
    autoCleanup: boolean;
    /** Cleanup interval in milliseconds */
    cleanupIntervalMs?: number;
    /** Memory limit in bytes */
    memoryLimitBytes?: number;
    /** Whether to persist cache to disk */
    persistToDisk?: boolean;
    /** Cache persistence file path */
    persistencePath?: string;
}
/**
 * Typed cache manager for coordinating multiple methodology caches
 * Provides centralized management of different cache instances
 *
 * @template T The base type constraint for all managed caches
 */
interface MethodologyCacheManager<T extends TrainingPhilosophy = TrainingPhilosophy> {
    /** Create a new cache for a specific methodology */
    createCache<K extends T>(methodology: TrainingMethodology, config?: MethodologyCacheConfig): MethodologyCache<K>;
    /** Get an existing cache by methodology */
    getCache<K extends T>(methodology: TrainingMethodology): MethodologyCache<K> | undefined;
    /** Check if a cache exists for a methodology */
    hasCache(methodology: TrainingMethodology): boolean;
    /** Remove a cache for a methodology */
    removeCache(methodology: TrainingMethodology): boolean;
    /** Clear all caches */
    clearAllCaches(): void;
    /** Get aggregated statistics across all caches */
    getAggregatedStats(): MethodologyCacheStats;
    /** Get individual cache statistics */
    getCacheStats(methodology: TrainingMethodology): MethodologyCacheStats | undefined;
    /** Optimize all caches (cleanup, defragment, etc.) */
    optimizeAll(): Promise<void>;
}
/**
 * Methodology-specific cache implementation constraints
 * Defines type constraints for different methodology cache implementations
 */
type MethodologyConstraints = {
    /** Daniels methodology cache constraints */
    daniels: TrainingPhilosophy & {
        calculateVDOTPaces: (vdot: number) => Record<string, number>;
        getWorkoutTypes: () => string[];
    };
    /** Lydiard methodology cache constraints */
    lydiard: TrainingPhilosophy & {
        calculateAerobicPaces: (fitness: number) => Record<string, number>;
        getPhaseStructure: () => Record<string, unknown>;
    };
    /** Pfitzinger methodology cache constraints */
    pfitzinger: TrainingPhilosophy & {
        calculateLactatePaces: (threshold: number) => Record<string, number>;
        getTrainingBlocks: () => Record<string, unknown>;
    };
    /** Hudson methodology cache constraints */
    hudson: TrainingPhilosophy & {
        calculateAdaptationZones: (fitness: number) => Record<string, number>;
        getProgressionModel: () => Record<string, unknown>;
    };
    /** Custom methodology with flexible constraints */
    custom: TrainingPhilosophy & Record<string, unknown>;
};
/**
 * Methodology cache factory interface for creating typed cache instances
 * Provides factory methods for creating methodology-specific caches
 */
interface MethodologyCacheFactory {
    /** Create a cache for a specific methodology with proper typing */
    createMethodologyCache<M extends keyof MethodologyConstraints>(methodology: M, config?: MethodologyCacheConfig): MethodologyCache<MethodologyConstraints[M]>;
    /** Create a generic cache with custom type constraints */
    createGenericCache<T extends TrainingPhilosophy>(config?: MethodologyCacheConfig): MethodologyCache<T>;
    /** Get default configuration for a methodology */
    getDefaultConfig(methodology: TrainingMethodology): MethodologyCacheConfig;
    /** Create a cache manager for coordinating multiple caches */
    createCacheManager<T extends TrainingPhilosophy>(): MethodologyCacheManager<T>;
}

/**
 * Type definitions for methodology loader system
 * Provides type safety for dynamic methodology imports and progressive loading
 */

/**
 * Progressive enhancement levels for methodologies
 */
type FeatureLevel = "basic" | "standard" | "advanced" | "expert";
/**
 * Environmental constraints for training adaptation
 */
interface EnvironmentalConstraints {
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
interface MethodologyLoader<T extends TrainingPhilosophy = TrainingPhilosophy> {
    /**
     * Load methodology with specified feature level
     */
    loadMethodology(methodology: TrainingMethodology, targetLevel?: FeatureLevel): Promise<T>;
    /**
     * Check if methodology is loaded at sufficient level
     */
    isMethodologyLoaded(methodology: TrainingMethodology, requiredLevel: FeatureLevel): boolean;
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
interface MethodologyLoadingOptions<T extends TrainingPhilosophy = TrainingPhilosophy> {
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
        maxLoadTime: number;
        maxMemoryUsage: number;
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
interface DanielsMethodologyOptions extends MethodologyLoadingOptions {
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
interface LydiardMethodologyOptions extends MethodologyLoadingOptions {
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
interface PfitzingerMethodologyOptions extends MethodologyLoadingOptions {
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
interface HudsonMethodologyOptions extends MethodologyLoadingOptions {
    adaptiveTraining?: {
        enableAutoAdjustment: boolean;
        recoveryThreshold: number;
    };
    strengthIntegration?: {
        includeStrengthWork: boolean;
        strengthPhases: string[];
    };
}
interface CustomMethodologyOptions extends MethodologyLoadingOptions {
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
type MethodologyOptionsMap = {
    daniels: DanielsMethodologyOptions;
    lydiard: LydiardMethodologyOptions;
    pfitzinger: PfitzingerMethodologyOptions;
    hudson: HudsonMethodologyOptions;
    custom: CustomMethodologyOptions;
};
/**
 * Enhanced methodology loader with type constraints
 */
interface TypedMethodologyLoader extends MethodologyLoader {
    /**
     * Load methodology with typed options
     */
    loadMethodologyWithOptions<M extends TrainingMethodology>(methodology: M, options: MethodologyOptionsMap[M]): Promise<TrainingPhilosophy>;
    /**
     * Load methodology with environmental adaptations
     */
    loadWithEnvironmentalAdaptation(methodology: TrainingMethodology, constraints: EnvironmentalConstraints, options?: MethodologyLoadingOptions): Promise<TrainingPhilosophy>;
    /**
     * Load methodology with performance optimization
     */
    loadWithPerformanceOptimization(methodology: TrainingMethodology, config: AdvancedPlanConfig, options?: MethodologyLoadingOptions): Promise<TrainingPhilosophy>;
}
/**
 * Dynamic import result for methodology modules
 */
interface MethodologyImportResult<T extends TrainingPhilosophy = TrainingPhilosophy> {
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
    features: Record<FeatureLevel, {
        components: string[];
        dependencies: string[];
        loadTime: number;
    }>;
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
type MethodologyImportFunction<T extends TrainingPhilosophy = TrainingPhilosophy> = (methodology: TrainingMethodology) => Promise<MethodologyImportResult<T>>;
/**
 * Feature enhancement function type
 */
type FeatureEnhancementFunction<T extends TrainingPhilosophy = TrainingPhilosophy> = (philosophy: T, features: string[]) => Promise<T>;
/**
 * Environmental adaptation function type
 */
type EnvironmentalAdaptationFunction = (constraints: EnvironmentalConstraints) => {
    paceAdjustments: Record<string, number>;
    workoutModifications: string[];
    recoveryModifications: string[];
};
/**
 * Performance optimization function type
 */
type PerformanceOptimizationFunction = (config: AdvancedPlanConfig) => {
    optimizedSettings: Partial<AdvancedPlanConfig>;
    performanceMetrics: Record<string, number>;
    recommendations: string[];
};
/**
 * Progressive loading strategy
 */
interface ProgressiveLoadingStrategy {
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
interface PerformanceMonitoringDecorator {
    /**
     * Monitor synchronous operations
     */
    <TArgs extends readonly unknown[], TReturn>(operation: string, fn: (...args: TArgs) => TReturn): (...args: TArgs) => TReturn;
}
/**
 * Type-safe async performance monitoring decorator
 */
interface AsyncPerformanceMonitoringDecorator {
    /**
     * Monitor asynchronous operations
     */
    <TArgs extends readonly unknown[], TReturn>(operation: string, fn: (...args: TArgs) => Promise<TReturn>): (...args: TArgs) => Promise<TReturn>;
}
/**
 * Methodology feature set with strict typing
 */
interface TypedMethodologyFeatureSet {
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
interface TypedPerformanceMetrics {
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
interface TypedLazyLoadingConfig {
    readonly preloadCore: boolean;
    readonly enableProgressiveEnhancement: boolean;
    readonly maxMemoryUsage: number;
    readonly performanceThresholds: {
        readonly planGeneration: number;
        readonly workoutSelection: number;
        readonly comparison: number;
    };
    readonly featureLevelDefaults: Record<"beginner" | "intermediate" | "advanced" | "expert", FeatureLevel>;
    readonly memoryOptimization: {
        readonly enableAutoCleanup: boolean;
        readonly cleanupThreshold: number;
        readonly retentionPolicy: "lru" | "priority" | "time-based";
    };
}

/**
 * Typed Array Utilities for Collection Operations
 *
 * Provides type-safe array transformation functions and collection utilities
 * that preserve type information while leveraging native TypeScript array methods.
 * These utilities ensure type safety throughout array operations and provide
 * enhanced collection handling capabilities.
 *
 * @fileoverview Type-safe array and collection utilities
 */

/**
 * Result type for batch collection operations
 * Provides structured results for operations that process multiple items
 *
 * @template T The element type in the collection
 * @template E The error type for failed operations
 */
interface CollectionResult<T, E = Error> {
    /** Successfully processed items */
    successes: T[];
    /** Failed items with their associated errors */
    failures: Array<{
        item: unknown;
        error: E;
    }>;
    /** Summary statistics */
    summary: {
        /** Total number of items processed */
        total: number;
        /** Number of successful operations */
        successCount: number;
        /** Number of failed operations */
        failureCount: number;
        /** Success rate as a percentage (0-100) */
        successRate: number;
    };
}
/**
 * Configuration options for array transformation operations
 * Provides fine-grained control over how array operations are performed
 */
interface ArrayTransformOptions {
    /** Whether to continue processing after encountering errors */
    continueOnError?: boolean;
    /** Maximum number of concurrent operations (for async operations) */
    maxConcurrency?: number;
    /** Whether to preserve original array order in results */
    preserveOrder?: boolean;
    /** Custom error handler for transformation failures */
    errorHandler?: (error: unknown, item: unknown, index: number) => void;
}
/**
 * Type-safe array wrapper that provides enhanced array operations
 * Preserves type information and adds validation capabilities
 *
 * @template T The element type
 */
declare class TypedArray<T> {
    private readonly _items;
    private readonly _metadata;
    constructor(items: T[], elementType?: string);
    /**
     * Get the underlying array (defensive copy)
     */
    get items(): readonly T[];
    /**
     * Get the length of the array
     */
    get length(): number;
    /**
     * Get array metadata
     */
    get metadata(): {
        elementType: string;
        created: Date;
        frozen: boolean;
    };
    /**
     * Type-safe map operation that preserves element type information
     *
     * @template U The mapped element type
     * @param fn Transformation function
     * @param targetType Optional type name for the resulting array
     * @returns New TypedArray with transformed elements
     */
    map<U>(fn: (item: T, index: number, array: readonly T[]) => U, targetType?: string): TypedArray<U>;
    /**
     * Type-safe filter operation that maintains element type
     *
     * @param predicate Filtering predicate function
     * @returns New TypedArray with filtered elements
     */
    filter(predicate: (item: T, index: number, array: readonly T[]) => boolean): TypedArray<T>;
    /**
     * Type-safe reduce operation with proper type inference
     *
     * @template U The accumulator type
     * @param fn Reducer function
     * @param initialValue Initial accumulator value
     * @returns Reduced value
     */
    reduce<U>(fn: (acc: U, item: T, index: number, array: readonly T[]) => U, initialValue: U): U;
    /**
     * Type-safe forEach operation for side effects
     *
     * @param fn Function to execute for each element
     */
    forEach(fn: (item: T, index: number, array: readonly T[]) => void): void;
    /**
     * Type-safe find operation
     *
     * @param predicate Search predicate
     * @returns Found element or undefined
     */
    find(predicate: (item: T, index: number, array: readonly T[]) => boolean): T | undefined;
    /**
     * Type-safe some operation
     *
     * @param predicate Test predicate
     * @returns Whether any element matches the predicate
     */
    some(predicate: (item: T, index: number, array: readonly T[]) => boolean): boolean;
    /**
     * Type-safe every operation
     *
     * @param predicate Test predicate
     * @returns Whether all elements match the predicate
     */
    every(predicate: (item: T, index: number, array: readonly T[]) => boolean): boolean;
    /**
     * Safe array access with bounds checking
     *
     * @param index Array index
     * @returns Element at index or undefined if out of bounds
     */
    at(index: number): T | undefined;
    /**
     * Type-safe slice operation
     *
     * @param start Start index
     * @param end End index
     * @returns New TypedArray with sliced elements
     */
    slice(start?: number, end?: number): TypedArray<T>;
    /**
     * Convert to plain JavaScript array
     *
     * @returns Plain array copy
     */
    toArray(): T[];
    /**
     * Convert to TypedCollection
     *
     * @returns TypedCollection representation
     */
    toCollection(): TypedCollection<T>;
    /**
     * Create a TypedArray from a regular array
     *
     * @template T The element type
     * @param items Source array
     * @param elementType Type name for metadata
     * @returns New TypedArray instance
     */
    static from<T>(items: T[], elementType?: string): TypedArray<T>;
    /**
     * Create an empty TypedArray
     *
     * @template T The element type
     * @param elementType Type name for metadata
     * @returns Empty TypedArray instance
     */
    static empty<T>(elementType?: string): TypedArray<T>;
}
/**
 * Utility functions for type-safe array operations
 * Provides standalone functions that work with regular arrays while preserving type safety
 */
declare class ArrayUtils {
    /**
     * Type-safe map with error handling
     * Maps over an array and collects both successes and failures
     *
     * @template T Input element type
     * @template U Output element type
     * @param items Input array
     * @param fn Transformation function
     * @param options Transformation options
     * @returns CollectionResult with successes and failures
     */
    static safeMap<T, U>(items: T[], fn: (item: T, index: number) => U, options?: ArrayTransformOptions): CollectionResult<U, Error>;
    /**
     * Type-safe filter with error handling
     * Filters an array and tracks any predicate errors
     *
     * @template T Element type
     * @param items Input array
     * @param predicate Filter predicate
     * @param options Filter options
     * @returns CollectionResult with filtered items and errors
     */
    static safeFilter<T>(items: T[], predicate: (item: T, index: number) => boolean, options?: ArrayTransformOptions): CollectionResult<T, Error>;
    /**
     * Partition an array into chunks of specified size
     * Maintains type safety while chunking arrays
     *
     * @template T Element type
     * @param items Input array
     * @param chunkSize Size of each chunk
     * @returns Array of chunks
     */
    static chunk<T>(items: T[], chunkSize: number): T[][];
    /**
     * Group array elements by a key function
     * Creates a Map with type-safe grouping
     *
     * @template T Element type
     * @template K Key type
     * @param items Input array
     * @param keyFn Function to extract grouping key
     * @returns Map of grouped elements
     */
    static groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]>;
    /**
     * Remove duplicate elements from an array
     * Uses a key function for complex deduplication logic
     *
     * @template T Element type
     * @template K Key type for deduplication
     * @param items Input array
     * @param keyFn Function to extract comparison key
     * @returns Deduplicated array
     */
    static uniqueBy<T, K>(items: T[], keyFn: (item: T) => K): T[];
    /**
     * Flatten nested arrays while preserving type safety
     *
     * @template T Element type
     * @param items Array of arrays
     * @returns Flattened array
     */
    static flatten<T>(items: T[][]): T[];
    /**
     * Type-safe array intersection
     * Finds elements that exist in all provided arrays
     *
     * @template T Element type
     * @param arrays Arrays to intersect
     * @param keyFn Function to extract comparison key
     * @returns Array of intersecting elements
     */
    static intersection<T, K>(arrays: T[][], keyFn: (item: T) => K): T[];
    /**
     * Type-safe array union
     * Combines arrays while removing duplicates
     *
     * @template T Element type
     * @template K Key type for deduplication
     * @param arrays Arrays to unite
     * @param keyFn Function to extract comparison key
     * @returns Union array without duplicates
     */
    static union<T, K>(arrays: T[][], keyFn: (item: T) => K): T[];
    /**
     * Check if an array is properly typed (not containing any)
     * Runtime validation for array type safety
     *
     * @param items Array to check
     * @param typeName Expected type name for error messages
     * @returns TypedResult indicating if array is properly typed
     */
    static validateTypedArray<T>(items: unknown[], typeName: string): TypedResult<T[], TypeValidationError>;
}
/**
 * Higher-order functions for array transformations
 * Provides functional programming utilities with type safety
 */
declare class FunctionalArrayUtils {
    /**
     * Create a type-safe compose function for array transformations
     *
     * @template T Input type
     * @template U Intermediate type
     * @template V Output type
     * @param fn1 First transformation function
     * @param fn2 Second transformation function
     * @returns Composed transformation function
     */
    static compose<T, U, V>(fn1: (items: T[]) => U[], fn2: (items: U[]) => V[]): (items: T[]) => V[];
    /**
     * Create a curried map function
     *
     * @template T Input element type
     * @template U Output element type
     * @param fn Transformation function
     * @returns Curried map function
     */
    static map<T, U>(fn: (item: T, index: number) => U): (items: T[]) => U[];
    /**
     * Create a curried filter function
     *
     * @template T Element type
     * @param predicate Filter predicate
     * @returns Curried filter function
     */
    static filter<T>(predicate: (item: T, index: number) => boolean): (items: T[]) => T[];
    /**
     * Create a pipeline of array transformations
     *
     * @template T Input type
     * @param transformations Array of transformation functions
     * @returns Single transformation function that applies all transformations
     */
    static pipeline<T>(...transformations: Array<(items: T[]) => T[]>): (items: T[]) => T[];
}
/**
 * Type-safe collection builders for common patterns
 * Provides builder patterns for creating typed collections
 */
declare class CollectionBuilder<T> {
    private items;
    private readonly elementType;
    constructor(elementType?: string);
    /**
     * Add a single item to the collection
     */
    add(item: T): this;
    /**
     * Add multiple items to the collection
     */
    addAll(items: T[]): this;
    /**
     * Add an item conditionally
     */
    addIf(condition: boolean, item: T): this;
    /**
     * Transform and add items
     */
    addMapped<U>(sourceItems: U[], mapFn: (item: U) => T): this;
    /**
     * Clear all items
     */
    clear(): this;
    /**
     * Build the final TypedArray
     */
    build(): TypedArray<T>;
    /**
     * Build as TypedCollection
     */
    buildCollection(): TypedCollection<T>;
    /**
     * Build as plain array
     */
    buildArray(): T[];
    /**
     * Create a new builder
     */
    static create<T>(elementType?: string): CollectionBuilder<T>;
}
/**
 * Type-safe array assertion utilities
 * Provides runtime type checking for arrays with proper error handling
 */
declare class ArrayTypeAssertions {
    /**
     * Assert that an array contains only elements of a specific type
     *
     * @template T Expected element type
     * @param items Array to validate
     * @param typeGuard Type guard function
     * @param typeName Type name for error messages
     * @returns TypedResult with validated array or error
     */
    static assertElementType<T>(items: unknown[], typeGuard: (item: unknown) => item is T, typeName: string): TypedResult<T[], TypeValidationError>;
    /**
     * Assert minimum array length
     *
     * @template T Element type
     * @param items Array to validate
     * @param minLength Minimum required length
     * @returns TypedResult with validated array or error
     */
    static assertMinLength<T>(items: T[], minLength: number): TypedResult<T[], TypeValidationError>;
    /**
     * Assert maximum array length
     *
     * @template T Element type
     * @param items Array to validate
     * @param maxLength Maximum allowed length
     * @returns TypedResult with validated array or error
     */
    static assertMaxLength<T>(items: T[], maxLength: number): TypedResult<T[], TypeValidationError>;
}

/**
 * Runtime Type Guards and Validation System
 *
 * This module provides runtime type checking with TypeScript type narrowing.
 * It replaces unsafe type assertions and provides type-safe validation functions
 * that can be used throughout the application for runtime type safety.
 *
 * @fileoverview Runtime type guards for type-safe validation and narrowing
 */

/**
 * Validation guard interface for runtime type checking with validation context
 * Extends basic TypeGuard with validation-specific functionality
 *
 * @template T The type being validated
 */
interface ValidationGuard<T> extends TypeGuard<T> {
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
interface SchemaGuard<T> extends ValidationGuard<T> {
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
declare const primitiveGuards: {
    readonly isString: (value: unknown) => value is string;
    readonly isNumber: (value: unknown) => value is number;
    readonly isBoolean: (value: unknown) => value is boolean;
    readonly isDate: (value: unknown) => value is Date;
    readonly isArray: <T>(value: unknown, elementGuard?: (item: unknown) => item is T) => value is T[];
    readonly isObject: (value: unknown) => value is Record<string, unknown>;
    readonly isNonEmptyString: (value: unknown) => value is string;
    readonly isPositiveNumber: (value: unknown) => value is number;
    readonly isNonNegativeNumber: (value: unknown) => value is number;
};
/**
 * Create a validation guard from a type guard
 * Adds validation context and error handling to basic type guards
 */
declare function createValidationGuard<T>(typeGuard: (value: unknown) => value is T, typeName: string, getValidationErrors?: (value: unknown) => string[]): ValidationGuard<T>;
/**
 * Create a schema guard for object validation
 * Validates object structure and property types
 */
declare function createSchemaGuard<T extends object>(typeName: string, requiredProperties: (keyof T)[], optionalProperties?: (keyof T)[], propertyValidators?: Partial<Record<keyof T, (value: unknown) => boolean>>): SchemaGuard<T>;
/**
 * Type guard for FitnessAssessment objects
 */
declare const isFitnessAssessment: SchemaGuard<FitnessAssessment>;
/**
 * Type guard for TrainingPreferences objects
 */
declare const isTrainingPreferences: SchemaGuard<TrainingPreferences>;
/**
 * Type guard for EnvironmentalFactors objects
 */
declare const isEnvironmentalFactors: SchemaGuard<EnvironmentalFactors>;
/**
 * Type guard for TrainingPlanConfig objects
 */
declare const isTrainingPlanConfig: SchemaGuard<TrainingPlanConfig>;
/**
 * Type guard for TargetRace objects
 */
declare const isTargetRace: SchemaGuard<TargetRace>;
/**
 * Type guard for AdvancedPlanConfig objects
 */
declare const isAdvancedPlanConfig: SchemaGuard<AdvancedPlanConfig>;
/**
 * Type guard for PlannedWorkout objects
 */
declare const isPlannedWorkout: SchemaGuard<PlannedWorkout>;
/**
 * Type guard for CompletedWorkout objects
 */
declare const isCompletedWorkout: SchemaGuard<CompletedWorkout>;
/**
 * Type guard for RecoveryMetrics objects
 */
declare const isRecoveryMetrics: SchemaGuard<RecoveryMetrics>;
/**
 * Type guard for ProgressData objects
 */
declare const isProgressData: SchemaGuard<ProgressData>;
/**
 * Type guard for RunData objects
 */
declare const isRunData: SchemaGuard<RunData>;
/**
 * Type guard for TrainingBlock objects
 */
declare const isTrainingBlock: SchemaGuard<TrainingBlock>;
/**
 * Type guard for TrainingPlan objects
 */
declare const isTrainingPlan: SchemaGuard<TrainingPlan>;
/**
 * Utility functions for runtime validation
 */
declare const validationUtils: {
    /**
     * Safely validate and cast unknown value to specific type
     */
    readonly safeCast: <T>(value: unknown, guard: ValidationGuard<T>, context?: string) => TypedResult<T, TypeValidationError>;
    /**
     * Assert that value is of specific type, throw if not
     */
    readonly assertType: <T>(value: unknown, guard: ValidationGuard<T>, context?: string) => asserts value is T;
    /**
     * Check if value matches type without throwing
     */
    readonly isType: <T>(value: unknown, guard: ValidationGuard<T>) => value is T;
    /**
     * Get validation errors for a value
     */
    readonly getErrors: <T>(value: unknown, guard: ValidationGuard<T>) => string[];
    /**
     * Validate array of values with element type guard
     */
    readonly validateArray: <T>(values: unknown[], elementGuard: ValidationGuard<T>, context?: string) => TypedResult<T[], TypeValidationError>;
};
/**
 * Export all validation guards for easy access
 */
declare const validationGuards: {
    readonly isFitnessAssessment: SchemaGuard<FitnessAssessment>;
    readonly isTrainingPreferences: SchemaGuard<TrainingPreferences>;
    readonly isEnvironmentalFactors: SchemaGuard<EnvironmentalFactors>;
    readonly isTrainingPlanConfig: SchemaGuard<TrainingPlanConfig>;
    readonly isAdvancedPlanConfig: SchemaGuard<AdvancedPlanConfig>;
    readonly isTargetRace: SchemaGuard<TargetRace>;
    readonly isPlannedWorkout: SchemaGuard<PlannedWorkout>;
    readonly isCompletedWorkout: SchemaGuard<CompletedWorkout>;
    readonly isRecoveryMetrics: SchemaGuard<RecoveryMetrics>;
    readonly isProgressData: SchemaGuard<ProgressData>;
    readonly isRunData: SchemaGuard<RunData>;
    readonly isTrainingBlock: SchemaGuard<TrainingBlock>;
    readonly isTrainingPlan: SchemaGuard<TrainingPlan>;
};

/**
 * Test-Specific Type Definitions
 *
 * This module provides type-safe interfaces and utilities specifically for testing.
 * Eliminates 'as any' usage in test files and provides type-safe test expectations.
 *
 * @fileoverview Test assertion types and mock utilities for type-safe testing
 */

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
interface MockGenerator<T> {
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
type TestConfig<T, TRequired extends keyof T = never> = T extends object ? TRequired extends never ? Partial<T> : Partial<T> & Required<Pick<T, TRequired>> : never;
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
interface MockFactoryRegistry {
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
interface TestAssertion<T> {
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
interface TypedExpectation<T> {
    /** The actual value received */
    actual: T;
    /** The expected value or matcher pattern */
    expected: Partial<T> | T;
    /** Type of matching to perform */
    matchType: "exact" | "partial" | "deep" | "shape";
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
interface MockConfig<T, TOverrides extends keyof T = keyof T> {
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
interface TestDataGenerator<T> {
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
interface TestScenario<TInput, TOutput> {
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
interface PerformanceExpectation {
    /** Name of the operation being measured */
    operation: string;
    /** Maximum allowed duration */
    maxDuration?: number;
    /** Maximum allowed memory usage in MB */
    maxMemoryMB?: number;
    /** Minimum required throughput (operations per second) */
    minThroughput?: number;
    /** Unit of measurement for duration */
    measurementUnit: "milliseconds" | "seconds" | "microseconds";
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
interface TestValidationResult<T> {
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
interface AsyncTestAssertion<T, E = Error> {
    /** The async operation to test */
    operation: () => Promise<T>;
    /** Expected result type */
    expectedResult: "success" | "error" | "timeout";
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
interface CollectionTestUtil<T> {
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
type TestResult<T, E = Error> = TypedResult<T, E>;
type TestTypeGuard<T> = TypeGuard<T>;
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
declare function createTestAssertion<T>(value: unknown, typeGuard: (val: unknown) => val is T, expectedType: string, context?: string): TestAssertion<T>;
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
declare function createMockConfig<T, TOverrides extends keyof T = keyof T>(baseValue?: Partial<T>, overrides?: Pick<T, TOverrides>): MockConfig<T, TOverrides>;
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
declare function validateTestResult<T>(result: unknown, validator: (val: unknown) => val is T, errorMessage?: string): TestValidationResult<T>;
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
type TestableProperties<T> = Omit<T, "createdAt" | "updatedAt" | "id">;
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
interface TestDouble<T> {
    /** Type of test double */
    type: "mock" | "stub" | "spy" | "fake";
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
interface MockLifecycleManager<T> {
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
interface TestDataComparator<T> {
    /** Check if two instances are exactly equal */
    isEqual(a: T, b: T): boolean;
    /** Check if two instances are similar within a threshold */
    isSimilar(a: T, b: T, threshold?: number): boolean;
    /** Get detailed differences between two instances */
    getDifferences(a: T, b: T): Array<{
        path: string;
        expected: unknown;
        actual: unknown;
        type: "missing" | "extra" | "different";
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
type TypedMockConfig<T, TRequired extends keyof T = never> = TestConfig<T, TRequired> & {
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
};

/**
 * Test-Specific Type Extensions
 *
 * Provides extended interfaces for test scenarios that need additional properties
 * for backward compatibility or test-specific functionality. These extensions
 * replace 'as any' usage in test files with proper type definitions.
 *
 * @fileoverview Type extensions for test scenarios
 */

/**
 * Extended ProgressData for test scenarios with backward compatibility fields
 * Includes fields that some legacy tests might expect
 */
interface ExtendedProgressData extends ProgressData {
    /** Fitness improvement measurement for test scenarios */
    fitnessChange?: number;
    /** Progress trend for test validation */
    trend?: "improving" | "declining" | "stable";
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
interface ExtendedCompletedWorkout extends CompletedWorkout {
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
interface ExtendedRecoveryMetrics extends RecoveryMetrics {
    /** Injury status for health tracking tests */
    injuryStatus?: "healthy" | "minor" | "moderate" | "severe";
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
interface ExtendedTrainingPlan extends TrainingPlan {
    /** Test-specific validation flags */
    validationFlags?: {
        skipDateValidation?: boolean;
        allowInvalidWorkouts?: boolean;
        bypassMethodologyChecks?: boolean;
    };
    /** Test metadata for tracking */
    testContext?: {
        generatorVersion?: string;
        testType?: "unit" | "integration" | "performance";
        expectedErrors?: string[];
    };
}
/**
 * Invalid test data types for negative testing scenarios
 * Used when testing error handling and validation
 */
type InvalidTestData = {
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
interface InvalidDataAssertion<T> extends TestAssertion<T> {
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
declare function createExtendedProgressData(base: ProgressData, extensions?: Partial<ExtendedProgressData>): ExtendedProgressData;
/**
 * Create extended completed workout for tests
 * Safely extends CompletedWorkout with test-specific fields
 */
declare function createExtendedCompletedWorkout(base: CompletedWorkout, extensions?: Partial<ExtendedCompletedWorkout>): ExtendedCompletedWorkout;
/**
 * Create extended recovery metrics for tests
 * Safely extends RecoveryMetrics with test-specific fields
 */
declare function createExtendedRecoveryMetrics(base: RecoveryMetrics, extensions?: Partial<ExtendedRecoveryMetrics>): ExtendedRecoveryMetrics;
/**
 * Create test assertion for invalid data scenarios
 * Provides type-safe way to test error conditions
 */
declare function createInvalidDataAssertion<T>(invalidData: InvalidTestData[keyof InvalidTestData], expectedError: string | RegExp | Error, expectedType: string): InvalidDataAssertion<T>;
/**
 * Type guard for checking if data is extended progress data
 */
declare function isExtendedProgressData(data: unknown): data is ExtendedProgressData;
/**
 * Type guard for checking if data is extended completed workout
 */
declare function isExtendedCompletedWorkout(data: unknown): data is ExtendedCompletedWorkout;
/**
 * Type guard for checking if data is extended recovery metrics
 */
declare function isExtendedRecoveryMetrics(data: unknown): data is ExtendedRecoveryMetrics;
/**
 * Utility to safely cast test data with proper type checking
 * Replaces 'as any' with type-safe casting for test scenarios
 */
declare function safeTestCast<T extends Record<string, unknown>, E extends Record<string, unknown>>(base: T, extensions: E, validator?: (result: T & E) => boolean): T & E;
/**
 * Test-specific workout factory with proper typing
 * Replaces any-typed workout creation in tests
 */
interface TestWorkoutFactory {
    createWithInvalidDate(base: PlannedWorkout, invalidDate: InvalidTestData["invalidDate"]): PlannedWorkout & {
        date: any;
    };
    createWithInvalidProperties(base: PlannedWorkout, invalidProps: Record<string, unknown>): PlannedWorkout & Record<string, unknown>;
    createWithExtensions(base: PlannedWorkout, extensions: Record<string, unknown>): PlannedWorkout & Record<string, unknown>;
}
/**
 * Implementation of test workout factory
 */
declare const testWorkoutFactory: TestWorkoutFactory;
/**
 * Test options factory for creating invalid configurations
 * Replaces 'as any' usage when testing invalid configurations
 */
interface TestOptionsFactory {
    createInvalidOptions<T extends Record<string, unknown>>(base: T, invalidFields: Record<string, InvalidTestData[keyof InvalidTestData]>): T & Record<string, unknown>;
}
/**
 * Implementation of test options factory
 */
declare const testOptionsFactory: TestOptionsFactory;

/**
 * Calculate VDOT (VO2max estimate) from race performances
 * Based on Jack Daniels' Running Formula
 */
declare function calculateVDOT(runs: RunData[]): number;
/**
 * Calculate Critical Speed using 2-parameter hyperbolic model
 * Jones & Vanhatalo (2017)
 */
declare function calculateCriticalSpeed(runs: RunData[]): number;
/**
 * Estimate running economy from pace and heart rate data
 * Lower values indicate better economy
 */
declare function estimateRunningEconomy(runs: RunData[]): number;
/**
 * Calculate lactate threshold pace from VDOT
 */
declare function calculateLactateThreshold(vdot: number): number;
/**
 * Calculate Training Stress Score for a single run
 */
declare function calculateTSS(run: RunData, thresholdPace: number): number;
/**
 * Calculate training load metrics using EWMA
 */
declare function calculateTrainingLoad(runs: RunData[], thresholdPace: number): TrainingLoad;
/**
 * Calculate injury risk score based on multiple factors
 */
declare function calculateInjuryRisk(trainingLoad: TrainingLoad, weeklyMileageIncrease: number, recoveryScore: number): number;
/**
 * Calculate recovery score based on HRV trends and recent training
 */
declare function calculateRecoveryScore(runs: RunData[], restingHR?: number, hrv?: number): number;
/**
 * Analyze weekly training patterns
 */
declare function analyzeWeeklyPatterns(runs: RunData[]): WeeklyPatterns;
/**
 * Calculate fitness metrics from run data
 */
declare function calculateFitnessMetrics(runs: RunData[]): FitnessMetrics;

declare class TrainingPlanGenerator {
    private config;
    private fitness;
    constructor(config: TrainingPlanConfig);
    /**
     * Generate a complete training plan
     */
    generatePlan(): TrainingPlan;
    /**
     * Analyze recent runs and generate a plan
     */
    static fromRunHistory(runs: RunData[], goal: TrainingPlanConfig["goal"], targetDate: Date): TrainingPlan;
    /**
     * Create training blocks based on goal and timeline
     */
    private createTrainingBlocks;
    /**
     * Determine phase distribution based on total weeks and goal
     */
    private getPhaseDistribution;
    /**
     * Get focus areas for each training phase
     */
    private getFocusAreas;
    /**
     * Generate weekly microcycles for a training block
     */
    protected generateMicrocycles(block: TrainingBlock): WeeklyMicrocycle[];
    /**
     * Calculate progression factor for volume
     */
    private calculateProgressionFactor;
    /**
     * Generate weekly workout pattern
     */
    private generateWeeklyPattern;
    /**
     * Generate workouts for a week
     */
    private generateWeeklyWorkouts;
    /**
     * Generate a single workout (for advanced-generator extension)
     */
    protected generateWorkout(date: Date, type: WorkoutType, phase: TrainingPhase, weekNumber: number): PlannedWorkout;
    /**
     * Select appropriate workout based on type string
     */
    private selectWorkout;
    /**
     * Calculate workout distance based on time and remaining volume
     */
    private calculateWorkoutDistance;
    /**
     * Generate all workouts from blocks
     */
    private generateAllWorkouts;
    /**
     * Create plan summary
     */
    private createPlanSummary;
    /**
     * Calculate intensity distribution for workouts
     */
    private calculateIntensityDistribution;
    /**
     * Calculate recovery ratio for a set of workouts
     */
    private calculateRecoveryRatio;
    /**
     * Generate workout name
     */
    private generateWorkoutName;
    /**
     * Generate workout description
     */
    private generateWorkoutDescription;
    /**
     * Calculate overall fitness score from available metrics
     */
    private calculateOverallScore;
    /**
     * Create default fitness assessment
     */
    private createDefaultFitness;
    /**
     * Assess fitness from run history
     */
    static assessFitnessFromRuns(runs: RunData[]): FitnessAssessment;
}

/**
 * Predefined workout templates based on scientific training principles
 */
declare const WORKOUT_TEMPLATES: Record<string, Workout>;
/**
 * Generate a custom workout based on parameters
 */
declare function createCustomWorkout(type: WorkoutType, duration: number, primaryIntensity: number, segments?: WorkoutSegment[]): Workout;

/**
 * Calculation Cache and Optimization Utilities
 *
 * Provides caching and optimization for expensive calculations used across
 * different training philosophies and plan generation components.
 */

/**
 * Simple LRU cache implementation for calculation results
 */
declare class LRUCache$1<T> {
    private cache;
    private maxSize;
    private maxAge;
    constructor(maxSize?: number, maxAgeMs?: number);
    get(key: string): T | undefined;
    set(key: string, value: T, hash: string): void;
    clear(): void;
    size(): number;
}
/**
 * Cached VDOT calculation with performance optimization
 */
declare function calculateVDOTCached(runs: RunData[]): number;
/**
 * Cached critical speed calculation
 */
declare function calculateCriticalSpeedCached(runs: RunData[]): number;
/**
 * Cached fitness metrics calculation
 */
declare function calculateFitnessMetricsCached(runs: RunData[]): FitnessMetrics;
/**
 * Cached training paces calculation for methodologies
 */
declare function calculateTrainingPacesCached(vdot: number, methodology: string, calculator: (vdot: number) => Record<string, number>): Record<string, number>;
/**
 * Optimized batch calculation for multiple runners or scenarios
 */
declare function batchCalculateVDOT(runDataSets: RunData[][]): number[];
/**
 * Performance monitoring utilities
 */
declare class CalculationProfiler {
    private static metrics;
    static profile<T>(operation: string, fn: () => T): T;
    static profileAsync<T>(operation: string, fn: () => Promise<T>): Promise<T>;
    static getMetrics(): Record<string, {
        calls: number;
        totalTime: number;
        avgTime: number;
    }>;
    static reset(): void;
    static getSlowOperations(threshold?: number): Array<{
        operation: string;
        avgTime: number;
    }>;
}
/**
 * Memory usage monitoring
 */
declare class MemoryMonitor {
    private static snapshots;
    static snapshot(operation: string): void;
    static getMemoryIncrease(fromOperation: string, toOperation: string): number;
    static getCurrentMemoryUsage(): {
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
    static clearSnapshots(): void;
}
/**
 * Cache management utilities
 */
declare class CacheManager {
    static clearAllCaches(): void;
    static getCacheStats(): Record<string, number>;
    static getCacheHitRatio(): Record<string, number>;
}
/**
 * Optimization recommendations based on usage patterns
 */
declare class OptimizationAnalyzer {
    static analyzePerformance(): {
        recommendations: string[];
        slowOperations: Array<{
            operation: string;
            avgTime: number;
        }>;
        memoryUsage: {
            current: number;
            recommended: number;
        };
    };
}
declare const cacheInstances: {
    vdotCache: LRUCache$1<number>;
    criticalSpeedCache: LRUCache$1<number>;
    fitnessMetricsCache: LRUCache$1<FitnessMetrics>;
    trainingPacesCache: LRUCache$1<Record<string, number>>;
};

/**
 * Advanced training plan generator with philosophy support
 * Extends the base TrainingPlanGenerator with methodology-specific customizations
 */
declare class AdvancedTrainingPlanGenerator extends TrainingPlanGenerator {
    private advancedConfig;
    private philosophy;
    constructor(config: AdvancedPlanConfig);
    /**
     * Generate an advanced training plan with philosophy integration
     */
    generateAdvancedPlan(): TrainingPlan;
    /**
     * Override base workout selection to integrate philosophy
     */
    protected selectWorkoutTemplate(type: WorkoutType, phase: TrainingPhase, weekInPhase: number): string;
    /**
     * Override workout generation to apply philosophy customizations
     */
    protected generateWorkout(date: Date, type: WorkoutType, phase: TrainingPhase, weekNumber: number): PlannedWorkout;
    /**
     * Apply additional advanced features based on configuration
     */
    private applyAdvancedFeatures;
    /**
     * Apply custom intensity distribution to the plan
     */
    private applyCustomIntensityDistribution;
    /**
     * Apply specific periodization type to the plan
     */
    private applyPeriodizationType;
    /**
     * Add recovery monitoring features to workouts
     */
    private addRecoveryMonitoring;
    /**
     * Add progress tracking features to the plan
     */
    private addProgressTracking;
    /**
     * Redistribute workouts based on intensity targets
     */
    private redistributeWorkouts;
    /**
     * Apply linear periodization pattern
     */
    private applyLinearPeriodization;
    /**
     * Apply block periodization pattern
     */
    private applyBlockPeriodization;
    /**
     * Apply undulating periodization pattern
     */
    private applyUndulatingPeriodization;
    /**
     * Apply reverse periodization pattern
     */
    private applyReversePeriodization;
    /**
     * Create a fitness assessment workout
     */
    private createFitnessAssessment;
    /**
     * Helper to get appropriate zone for workout type
     */
    private getZoneForType;
    /**
     * Apply multi-race planning to create a season-long plan
     */
    private applyMultiRacePlanning;
    /**
     * Sort races by priority and date for optimal planning
     */
    private sortRacesByPriority;
    /**
     * Create training blocks for multiple races
     */
    private createMultiRaceBlocks;
    /**
     * Create preparation blocks for a specific race
     */
    private createRacePreparationBlocks;
    /**
     * Calculate phase distribution for race preparation
     */
    private calculateRacePhaseDistribution;
    /**
     * Get race-specific focus areas
     */
    private getRaceFocusAreas;
    /**
     * Calculate transition period between races
     */
    private calculateTransitionPeriod;
    /**
     * Get recovery weeks needed after a race
     */
    private getRecoveryWeeks;
    /**
     * Get minimal preparation weeks for a race
     */
    private getMinimalPreparationWeeks;
    /**
     * Create transition block between races
     */
    private createTransitionBlock;
    /**
     * Integrate race blocks with existing plan structure
     */
    private integrateRaceBlocks;
    /**
     * Add race-specific elements to the plan
     */
    private addRaceSpecificElements;
    /**
     * Estimate race duration in minutes
     */
    private estimateRaceDuration;
    /**
     * Get race distance in kilometers
     */
    private getRaceDistanceKm;
    /**
     * Estimate race TSS
     */
    private estimateRaceTSS;
    /**
     * Create race tune-up workout
     */
    private createRaceTuneUpWorkout;
    /**
     * Get appropriate tune-up distance for race
     */
    private getTuneUpDistance;
    /**
     * Create advanced plan from run history with methodology
     */
    static fromRunHistoryAdvanced(runs: RunData[], config: Partial<AdvancedPlanConfig>): TrainingPlan;
    /**
     * Get methodology-specific configuration
     */
    getMethodologyConfig(): (typeof TRAINING_METHODOLOGIES)[TrainingMethodology];
    /**
     * Get current philosophy instance
     */
    getPhilosophy(): TrainingPhilosophy;
}

/**
 * Interface for training plan adaptation engines
 */
/**
 * Plan modification types for different adaptation strategies
 */
type ModificationType = "reduce_volume" | "reduce_intensity" | "add_recovery" | "substitute_workout" | "delay_progression" | "injury_protocol";
interface AdaptationEngine {
    /**
     * Analyze workout completion and performance data
     */
    analyzeProgress(completedWorkouts: CompletedWorkout[], plannedWorkouts: PlannedWorkout[]): ProgressData;
    /**
     * Suggest modifications based on progress and recovery
     */
    suggestModifications(plan: TrainingPlan, progress: ProgressData, recovery?: RecoveryMetrics): PlanModification[];
    /**
     * Apply modifications to the training plan
     */
    applyModifications(plan: TrainingPlan, modifications: PlanModification[]): TrainingPlan;
    /**
     * Check if adaptation is needed based on current metrics
     */
    needsAdaptation(progress: ProgressData, recovery?: RecoveryMetrics): boolean;
}
/**
 * Represents a suggested modification to the training plan
 */
interface PlanModification {
    type: ModificationType;
    reason: string;
    priority: "high" | "medium" | "low";
    workoutIds?: string[];
    suggestedChanges: {
        volumeReduction?: number;
        intensityReduction?: number;
        substituteWorkoutType?: WorkoutType;
        additionalRecoveryDays?: number;
        delayDays?: number;
    };
}
/**
 * Smart adaptation engine implementing scientific training principles
 */
declare class SmartAdaptationEngine implements AdaptationEngine {
    private readonly SAFE_ACWR_LOWER;
    private readonly SAFE_ACWR_UPPER;
    private readonly HIGH_RISK_ACWR;
    private readonly MIN_RECOVERY_SCORE;
    private readonly HIGH_FATIGUE_THRESHOLD;
    private readonly OVERREACHING_TSS_THRESHOLD;
    private readonly CHRONIC_FATIGUE_DAYS;
    /**
     * Analyze workout completion and performance data
     */
    analyzeProgress(completedWorkouts: CompletedWorkout[], plannedWorkouts: PlannedWorkout[]): ProgressData;
    /**
     * Suggest modifications based on progress and recovery
     */
    suggestModifications(plan: TrainingPlan, progress: ProgressData, recovery?: RecoveryMetrics): PlanModification[];
    /**
     * Apply modifications to the training plan
     */
    applyModifications(plan: TrainingPlan, modifications: PlanModification[]): TrainingPlan;
    /**
     * Check if adaptation is needed based on current metrics
     */
    needsAdaptation(progress: ProgressData, recovery?: RecoveryMetrics): boolean;
    /**
     * Calculate adherence rate
     */
    private calculateAdherence;
    /**
     * Analyze performance trend from completed workouts
     */
    private analyzePerformanceTrend;
    /**
     * Calculate average pace adjusted for effort level
     */
    private calculateAverageRelativePace;
    /**
     * Analyze volume progression
     */
    private analyzeVolumeProgress;
    /**
     * Analyze intensity distribution
     */
    private analyzeIntensityDistribution;
    /**
     * Convert completed workouts to run data for calculations
     */
    private convertToRunData;
    /**
     * Enhanced recovery score assessment using multiple data points
     */
    assessRecoveryStatus(completedWorkouts: CompletedWorkout[], recovery?: RecoveryMetrics): {
        score: number;
        status: "recovered" | "adequate" | "fatigued" | "overreached";
        recommendations: string[];
    };
    /**
     * Detect fatigue patterns and adjust workout intensity
     */
    detectFatigueAndAdjust(completedWorkouts: CompletedWorkout[], upcomingWorkouts: PlannedWorkout[], recovery?: RecoveryMetrics): {
        fatigueLevel: "low" | "moderate" | "high" | "severe";
        adjustedWorkouts: PlannedWorkout[];
        warnings: string[];
    };
    /**
     * Create overreaching risk assessment using acute:chronic ratios
     */
    assessOverreachingRisk(completedWorkouts: CompletedWorkout[], plannedWorkouts: PlannedWorkout[]): {
        riskLevel: "low" | "moderate" | "high" | "critical";
        acuteChronicRatio: number;
        weeklyLoadIncrease: number;
        projectedRisk: number;
        mitigationStrategies: string[];
    };
    /**
     * Calculate acute fatigue score
     */
    private calculateAcuteFatigue;
    /**
     * Detect chronic fatigue patterns
     */
    private detectChronicFatigue;
    /**
     * Detect TSS overload patterns
     */
    private detectTSSOverload;
    /**
     * Estimate TSS for a completed workout
     */
    private estimateWorkoutTSS;
    /**
     * Adjust workouts based on fatigue level
     */
    private adjustWorkoutsForFatigue;
    /**
     * Generate recovery recommendations
     */
    private generateRecoveryRecommendations;
    /**
     * Project future injury risk
     */
    private projectFutureRisk;
    /**
     * Generate mitigation strategies for injury risk
     */
    private generateMitigationStrategies;
    /**
     * Calculate overall recovery score from metrics
     */
    private calculateOverallRecovery;
    /**
     * Apply volume reduction to workouts
     */
    private applyVolumeReduction;
    /**
     * Apply intensity reduction to workouts
     */
    private applyIntensityReduction;
    /**
     * Add recovery days to the plan
     */
    private addRecoveryDays;
    /**
     * Substitute workouts based on modification
     */
    private substituteWorkouts;
    /**
     * Delay progression by shifting workouts
     */
    private delayProgression;
    /**
     * Apply injury or illness protocol
     */
    private applyInjuryProtocol;
    /**
     * Create intelligent workout substitutions based on fatigue and goals
     */
    createSmartSubstitutions(originalWorkout: PlannedWorkout, reason: "fatigue" | "injury" | "illness" | "time_constraint" | "weather"): PlannedWorkout;
    /**
     * Select appropriate workout template based on type and duration
     */
    private selectAppropriateTemplate;
    /**
     * Create recovery protocol for injury or illness
     */
    createRecoveryProtocol(condition: "injury" | "illness", severity: "mild" | "moderate" | "severe", affectedArea?: string): {
        phases: RecoveryPhase[];
        guidelines: string[];
        returnCriteria: string[];
    };
    /**
     * Generate recovery guidelines
     */
    private generateRecoveryGuidelines;
    /**
     * Generate return-to-running criteria
     */
    private generateReturnCriteria;
    /**
     * Apply progressive overload adjustments
     */
    applyProgressiveOverload(plan: TrainingPlan, currentFitness: any, progressRate: "conservative" | "moderate" | "aggressive"): TrainingPlan;
    /**
     * Group workouts by week
     */
    private groupWorkoutsByWeek;
    /**
     * Get workout name for type
     */
    private getWorkoutName;
}
/**
 * Recovery phase definition
 */
interface RecoveryPhase {
    name: string;
    duration: number;
    workouts: WorkoutType[];
    volumePercent: number;
    intensityLimit: number;
    focus: string;
}
/**
 * Factory function to create adaptation engine
 */
declare function createAdaptationEngine(): AdaptationEngine;

/**
 * Lazy Loading and Optimization System for Methodologies
 *
 * Provides on-demand methodology loading, progressive feature enhancement,
 * and performance monitoring to meet strict performance requirements.
 */
interface PerformanceMetrics {
    loadTime: number;
    memoryUsage: number;
    cacheHits: number;
    cacheMisses: number;
}
interface MethodologyFeatureSet {
    features: string[];
    level: "basic" | "intermediate" | "advanced";
    capabilities: Record<string, boolean>;
}

/**
 * Lazy methodology loader with progressive enhancement
 */
declare class LazyMethodologyLoader implements TypedMethodologyLoader {
    private static instance;
    private config;
    private loadedMethodologies;
    private philosophyInstances;
    private performanceMetrics;
    private loadingPromises;
    private constructor();
    static getInstance(config?: Partial<TypedLazyLoadingConfig>): LazyMethodologyLoader;
    /**
     * Load methodology with specified feature level
     */
    loadMethodology(methodology: TrainingMethodology, targetLevel?: FeatureLevel): Promise<TrainingPhilosophy>;
    /**
     * Perform the actual lazy loading with performance monitoring
     */
    private performLazyLoad;
    /**
     * Load methodology with progressive feature enhancement
     */
    private loadMethodologyProgressively;
    /**
     * Apply feature set to philosophy instance
     */
    private applyFeatureSet;
    /**
     * Enhance philosophy with specific features
     */
    private enhancePhilosophyWithFeatures;
    /**
     * Create advanced workout generator for methodology
     */
    private createAdvancedWorkoutGenerator;
    /**
     * Create environmental adapter for methodology
     */
    private createEnvironmentalAdapter;
    /**
     * Create performance optimizer for methodology
     */
    private createPerformanceOptimizer;
    /**
     * Check if current feature level is sufficient for target
     */
    private isLevelSufficient;
    /**
     * Check memory and performance constraints
     */
    private checkConstraints;
    /**
     * Validate performance against configured thresholds
     */
    private validatePerformance;
    /**
     * Preload core methodologies for faster access
     */
    private preloadCoreMethodologies;
    /**
     * Get performance metrics for loaded methodologies
     */
    getPerformanceMetrics(): Record<string, PerformanceMetrics>;
    /**
     * Get loading status for methodologies
     */
    getLoadingStatus(): Record<TrainingMethodology, FeatureLevel | null>;
    /**
     * Check if methodology is loaded at sufficient level
     */
    isMethodologyLoaded(methodology: TrainingMethodology, requiredLevel: FeatureLevel): boolean;
    /**
     * Load methodology with typed options
     */
    loadMethodologyWithOptions<M extends TrainingMethodology>(methodology: M, options: MethodologyLoadingOptions): Promise<TrainingPhilosophy>;
    /**
     * Load methodology with environmental adaptations
     */
    loadWithEnvironmentalAdaptation(methodology: TrainingMethodology, constraints: EnvironmentalConstraints, options?: MethodologyLoadingOptions): Promise<TrainingPhilosophy>;
    /**
     * Load methodology with performance optimization
     */
    loadWithPerformanceOptimization(methodology: TrainingMethodology, config: AdvancedPlanConfig, options?: MethodologyLoadingOptions): Promise<TrainingPhilosophy>;
    /**
     * Clear loaded methodologies to free memory
     */
    clearMethodology(methodology: TrainingMethodology): void;
    /**
     * Get memory usage summary
     */
    getMemoryUsage(): {
        total: number;
        byMethodology: Record<string, number>;
        recommendation: string;
    };
    /**
     * Optimize performance by adjusting feature levels
     */
    optimizePerformance(): Promise<void>;
}
/**
 * Performance monitoring decorator for methodology operations
 */
declare const withPerformanceMonitoring: PerformanceMonitoringDecorator;
/**
 * Async performance monitoring decorator
 */
declare const withAsyncPerformanceMonitoring: AsyncPerformanceMonitoringDecorator;
/**
 * Progressive enhancement manager
 */
declare class ProgressiveEnhancementManager {
    private static loader;
    /**
     * Get appropriate feature level based on user experience and requirements
     */
    static getRecommendedFeatureLevel(userExperience: "beginner" | "intermediate" | "advanced" | "expert", performanceRequirements: "basic" | "standard" | "high"): FeatureLevel;
    /**
     * Load methodology with automatic level selection
     */
    static loadWithAutoLevel(methodology: TrainingMethodology, userExperience?: "beginner" | "intermediate" | "advanced" | "expert", performanceRequirements?: "basic" | "standard" | "high"): Promise<TrainingPhilosophy>;
    /**
     * Monitor and adjust feature levels based on usage patterns
     */
    static adaptToUsage(): Promise<void>;
    /**
     * Get enhancement recommendations
     */
    static getEnhancementRecommendations(): string[];
}
declare const methodologyLoader: LazyMethodologyLoader;

/**
 * Methodology-Aware Adaptation Engine
 *
 * Extends the existing SmartAdaptationEngine with methodology-specific adaptation patterns,
 * philosophy-based modifications, and individual response tracking per methodology.
 */

/**
 * Methodology-specific adaptation pattern
 */
interface MethodologyAdaptationPattern {
    id: string;
    methodology: TrainingMethodology;
    name: string;
    trigger: AdaptationTrigger$1;
    response: MethodologyAdaptationResponse;
    philosophyAlignment: number;
    frequency: number;
    successRate: number;
    lastApplied?: Date;
}
/**
 * Methodology-specific adaptation trigger
 */
interface AdaptationTrigger$1 {
    type: "performance_decline" | "fatigue_buildup" | "recovery_issue" | "adherence_drop" | "plateau" | "overreaching";
    conditions: TriggerCondition[];
    minimumDuration: number;
    philosophyContext: string;
}
/**
 * Trigger condition for adaptation
 */
interface TriggerCondition {
    metric: string;
    operator: "greater_than" | "less_than" | "equals" | "between";
    value: number | [number, number];
    confidence: number;
}
/**
 * Methodology-specific adaptation response
 */
interface MethodologyAdaptationResponse {
    modifications: MethodologyPlanModification[];
    rationale: string;
    expectedDuration: number;
    monitoringPeriod: number;
    rollbackCriteria: TriggerCondition[];
    philosophyJustification: string;
}
/**
 * Enhanced plan modification with methodology context
 */
interface MethodologyPlanModification extends PlanModification {
    methodologySpecific: boolean;
    philosophyPrinciple: string;
    alternativeOptions?: PlanModification[];
    confidence: number;
}
/**
 * Adaptation response tracking
 */
interface AdaptationResponse$1 {
    appliedDate: Date;
    modification: MethodologyPlanModification;
    outcomeMetrics: {
        performanceChange: number;
        adherenceChange: number;
        recoveryChange: number;
        satisfactionChange: number;
    };
    effectiveness: number;
    notes: string;
}
/**
 * Methodology-aware adaptation engine that extends SmartAdaptationEngine
 */
declare class MethodologyAdaptationEngine extends SmartAdaptationEngine {
    private adaptationPatterns;
    private responseProfiles;
    private philosophies;
    constructor();
    /**
     * Analyze progress with methodology-specific context
     */
    analyzeProgressWithMethodology(completedWorkouts: CompletedWorkout[], plannedWorkouts: PlannedWorkout[], plan: TrainingPlan): ProgressData & {
        methodologyInsights: MethodologyInsights;
    };
    /**
     * Suggest methodology-aware modifications
     */
    suggestMethodologyAwareModifications(plan: TrainingPlan, progress: ProgressData & {
        methodologyInsights?: MethodologyInsights;
    }, recovery?: RecoveryMetrics): MethodologyPlanModification[];
    /**
     * Update individual response profile based on modification outcomes
     */
    updateResponseProfile(athleteId: string, methodology: TrainingMethodology, modification: MethodologyPlanModification, outcome: AdaptationResponse$1["outcomeMetrics"]): void;
    /**
     * Generate methodology-specific insights
     */
    private generateMethodologyInsights;
    /**
     * Initialize methodology-specific adaptation patterns
     */
    private initializeMethodologyPatterns;
    /**
     * Calculate philosophy alignment based on completed workouts
     */
    private calculatePhilosophyAlignment;
    /**
     * Calculate actual intensity distribution from completed workouts
     */
    private calculateActualIntensityDistribution;
    /**
     * Generate adaptation recommendations based on methodology
     */
    private generateAdaptationRecommendations;
    /**
     * Additional helper methods...
     */
    private detectVdotDecline;
    private calculateThresholdPercentage;
    private calculateMethodologyKeyMetrics;
    private calculateMethodologyCompliance;
    private calculateIntensityBalance;
    private calculatePaceConsistency;
    private calculateAerobicVolume;
    private calculateTimeBasedCompliance;
    private calculateThresholdProgression;
    private calculateMediumLongFrequency;
    private calculateAdaptationRate;
    private calculateIndividualResponse;
    private getPhilosophy;
    private analyzeTriggeredPatterns;
    private generateMethodologyModifications;
    private convertToMethodologyModification;
    private prioritizeModifications;
    private createNewResponseProfile;
    private calculateResponseEffectiveness;
    private updateEffectivenessTrends;
    private updateModificationPreferences;
    private getResponseProfileStatus;
}
/**
 * Extended methodology insights
 */
interface MethodologyInsights {
    methodology: TrainingMethodology;
    philosophyAlignment: number;
    adaptationRecommendations: string[];
    responseProfileStatus: string;
    keyMetrics?: Record<string, number>;
    complianceScore?: number;
}
/**
 * Utility functions for methodology adaptation
 */
declare const MethodologyAdaptationUtils: {
    /**
     * Create methodology adaptation engine instance
     */
    createEngine: () => MethodologyAdaptationEngine;
    /**
     * Analyze methodology-specific adaptation needs
     */
    analyzeAdaptationNeeds: (plan: TrainingPlan, completedWorkouts: CompletedWorkout[], methodology: TrainingMethodology) => MethodologyInsights;
    /**
     * Get methodology-specific modification suggestions
     */
    getModificationSuggestions: (plan: TrainingPlan, progress: ProgressData, methodology: TrainingMethodology) => MethodologyPlanModification[];
};

interface UserProfile {
    age?: number;
    gender?: "male" | "female" | "other";
    experience: RunnerExperience$1;
    currentFitness: FitnessAssessment;
    trainingPreferences: TrainingPreferences;
    environmentalFactors?: EnvironmentalFactors;
    primaryGoal: TrainingGoal;
    targetRaces?: TargetRace[];
    motivations: RunnerMotivation[];
    injuryHistory?: string[];
    timeAvailability: number;
    strengthsAndWeaknesses?: StrengthsWeaknesses;
    preferredApproach?: TrainingApproach;
    previousMethodologies?: TrainingMethodology[];
}
type RunnerExperience$1 = "beginner" | "novice" | "intermediate" | "advanced" | "expert";
type RunnerMotivation = "finish_first_race" | "improve_times" | "qualify_boston" | "stay_healthy" | "lose_weight" | "social_aspect" | "compete" | "mental_health" | "longevity";
interface StrengthsWeaknesses {
    strengths: RunnerAttribute[];
    weaknesses: RunnerAttribute[];
}
type TrainingApproach = "scientific" | "intuitive" | "structured" | "flexible";
interface RecommendationResult {
    primaryRecommendation: MethodologyRecommendation;
    alternativeOptions: MethodologyRecommendation[];
    rationale: RecommendationRationale;
    transitionPlan?: TransitionPlan;
    warnings?: string[];
}
interface MethodologyRecommendation {
    methodology: TrainingMethodology;
    compatibilityScore: number;
    strengths: string[];
    considerations: string[];
    expectedOutcomes: string[];
    timeToAdapt: number;
}
interface RecommendationRationale {
    primaryFactors: string[];
    scoringBreakdown: Record<string, number>;
    userProfileMatch: string[];
    methodologyAdvantages: string[];
}
interface TransitionPlan {
    fromMethodology?: TrainingMethodology;
    toMethodology: TrainingMethodology;
    transitionWeeks: number;
    keyChanges: string[];
    adaptationFocus: string[];
    gradualAdjustments: WeeklyAdjustment[];
}
interface WeeklyAdjustment {
    week: number;
    focus: string;
    changes: string[];
    targetMetrics: Record<string, number>;
}
interface RecommendationQuiz {
    questions: QuizQuestion[];
    scoringLogic: (answers: QuizAnswer[]) => UserProfile;
}
interface QuizQuestion {
    id: string;
    question: string;
    type: "single" | "multiple" | "scale" | "text";
    options?: QuizOption[];
    validation?: (answer: any) => boolean;
}
interface QuizOption {
    value: string;
    label: string;
    score?: Record<string, number>;
}
interface QuizAnswer {
    questionId: string;
    answer: any;
}
/**
 * MethodologyRecommendationEngine provides sophisticated user profile-based
 * training methodology recommendations with detailed rationale and transition support
 */
declare class MethodologyRecommendationEngine {
    private comparator;
    private scoringWeights;
    constructor();
    /**
     * Initialize scoring weights for different recommendation factors
     */
    private initializeScoringWeights;
    /**
     * Get methodology recommendation based on user profile
     */
    recommendMethodology(userProfile: UserProfile): RecommendationResult;
    /**
     * Score all methodologies against user profile
     */
    private scoreMethodologies;
    /**
     * Calculate individual scoring components
     */
    private calculateMethodologyScores;
    /**
     * Score experience match (0-100)
     */
    private scoreExperienceMatch;
    /**
     * Score goal alignment (0-100)
     */
    private scoreGoalAlignment;
    /**
     * Score time availability (0-100)
     */
    private scoreTimeAvailability;
    /**
     * Score injury history compatibility (0-100)
     */
    private scoreInjuryHistory;
    /**
     * Score training approach preference (0-100)
     */
    private scoreTrainingApproach;
    /**
     * Score environmental factors (0-100)
     */
    private scoreEnvironmentalFactors;
    /**
     * Score strengths and weaknesses match (0-100)
     */
    private scoreStrengthsWeaknesses;
    /**
     * Calculate total weighted score
     */
    private calculateTotalScore;
    /**
     * Identify methodology strengths for user
     */
    private identifyMethodologyStrengths;
    /**
     * Identify considerations for user
     */
    private identifyConsiderations;
    /**
     * Predict expected outcomes
     */
    private predictOutcomes;
    /**
     * Estimate adaptation time
     */
    private estimateAdaptationTime;
    /**
     * Generate detailed rationale
     */
    private generateRationale;
    /**
     * Explain scoring factor
     */
    private explainFactor;
    /**
     * Generate profile match explanation
     */
    private generateProfileMatchExplanation;
    /**
     * Create transition plan between methodologies
     */
    private createTransitionPlan;
    /**
     * Calculate transition weeks needed
     */
    private calculateTransitionWeeks;
    /**
     * Identify key changes in transition
     */
    private identifyKeyChanges;
    /**
     * Get adaptation focus areas
     */
    private getAdaptationFocus;
    /**
     * Create weekly adjustment plan
     */
    private createWeeklyAdjustments;
    /**
     * Get focus for specific week in transition
     */
    private getWeeklyFocus;
    /**
     * Get specific changes for week
     */
    private getWeeklyChanges;
    /**
     * Get weekly target metrics
     */
    private getWeeklyTargets;
    /**
     * Generate warnings for recommendation
     */
    private generateWarnings;
    /**
     * Create recommendation quiz
     */
    createRecommendationQuiz(): RecommendationQuiz;
    /**
     * Score quiz answers to create user profile
     */
    private scoreQuizAnswers;
}

interface MethodologyConfiguration {
    methodology: TrainingMethodology;
    baseConfig: MethodologyBaseConfig;
    adaptationPatterns: AdaptationPattern[];
    customizations: CustomizationSettings;
    performanceOptimizations: PerformanceOptimization[];
    constraints: CustomizationConstraints;
    lastUpdated: Date;
}
interface MethodologyBaseConfig {
    intensityDistribution: {
        easy: number;
        moderate: number;
        hard: number;
    };
    volumeProgression: {
        weeklyIncrease: number;
        stepBackFrequency: number;
        stepBackReduction: number;
    };
    workoutEmphasis: Record<WorkoutType, number>;
    periodizationModel: {
        phaseDurations: Record<TrainingPhase, number>;
        phaseTransitions: "sharp" | "gradual" | "overlap";
    };
    recoveryProtocol: {
        easyDayMinimum: number;
        recoveryDayFrequency: number;
        completeRestDays: number;
    };
}
interface AdaptationPattern {
    id: string;
    name: string;
    trigger: AdaptationTrigger;
    response: AdaptationResponse;
    frequency: number;
    effectiveness: number;
    lastApplied?: Date;
}
interface AdaptationTrigger {
    type: "performance" | "fatigue" | "injury_risk" | "plateau" | "environmental";
    conditions: {
        metric: string;
        operator: "greater" | "less" | "equal" | "between";
        value: number | [number, number];
        duration?: number;
    }[];
}
interface AdaptationResponse {
    modifications: CustomizationModification[];
    priority: "immediate" | "next_week" | "next_phase";
    duration: number;
    monitoringPeriod: number;
}
interface CustomizationModification {
    type: "volume" | "intensity" | "workout_type" | "recovery" | "phase_adjustment";
    target: string;
    adjustment: number | string;
    rationale: string;
}
interface CustomizationSettings {
    allowIntensityAdjustments: boolean;
    allowVolumeAdjustments: boolean;
    allowWorkoutSubstitutions: boolean;
    preferredWorkoutTypes: WorkoutType[];
    avoidWorkoutTypes: WorkoutType[];
    aggressiveness: "conservative" | "moderate" | "aggressive";
    adaptationSpeed: "slow" | "normal" | "fast";
    injuryPrevention: "minimal" | "standard" | "maximum";
    altitudeAdjustment: boolean;
    heatAdaptation: boolean;
    coldAdaptation: boolean;
    terrainSpecific: boolean;
}
interface PerformanceOptimization {
    id: string;
    name: string;
    targetMetric: "vdot" | "threshold" | "endurance" | "speed" | "recovery";
    currentValue: number;
    targetValue: number;
    strategy: OptimizationStrategy;
    progress: number;
    estimatedWeeks: number;
}
interface OptimizationStrategy {
    methodologyTweaks: MethodologyTweak[];
    workoutProgressions: WorkoutProgression[];
    recoveryEnhancements: RecoveryEnhancement[];
    nutritionGuidelines?: string[];
    supplementation?: string[];
}
interface MethodologyTweak {
    parameter: string;
    fromValue: number;
    toValue: number;
    timeline: number;
    rationale: string;
}
interface WorkoutProgression {
    workoutType: WorkoutType;
    currentVolume: number;
    targetVolume: number;
    currentIntensity: number;
    targetIntensity: number;
    progressionRate: number;
}
interface RecoveryEnhancement {
    type: "sleep" | "nutrition" | "active_recovery" | "massage" | "cold_therapy";
    frequency: string;
    duration: string;
    expectedBenefit: string;
}
interface CustomizationConstraints {
    maxWeeklyHours: number;
    maxWeeklyMiles: number;
    maxIntensityPercentage: number;
    minRecoveryDays: number;
    blackoutDates: Date[];
    medicalRestrictions: string[];
}
interface CustomizationAnalysis {
    currentState: MethodologyState;
    recommendations: CustomizationRecommendation[];
    warnings: string[];
    projectedOutcomes: ProjectedOutcome[];
}
interface MethodologyState {
    adherenceToPhilosophy: number;
    customizationLevel: "minimal" | "moderate" | "extensive";
    effectivenessScore: number;
    injuryRiskLevel: "low" | "medium" | "high";
    adaptationSuccess: number;
}
interface CustomizationRecommendation {
    id: string;
    category: "performance" | "injury_prevention" | "plateau_breaking" | "environmental";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    implementation: string[];
    timeToEffect: number;
}
interface ProjectedOutcome {
    metric: string;
    currentValue: number;
    projectedValue: number;
    confidence: number;
    timeframe: number;
    assumptions: string[];
}
/**
 * MethodologyCustomizationEngine provides advanced configuration and optimization
 * capabilities for training methodologies based on individual response patterns
 */
declare class MethodologyCustomizationEngine {
    private adaptationEngine;
    private philosophyComparator;
    private recommendationEngine;
    private configurations;
    private adaptationHistory;
    constructor();
    /**
     * Initialize or update methodology configuration for a user
     */
    initializeConfiguration(userId: string, methodology: TrainingMethodology, userProfile: UserProfile, customSettings?: Partial<CustomizationSettings>): MethodologyConfiguration;
    /**
     * Track individual adaptation patterns
     */
    trackAdaptationPattern(userId: string, completedWorkouts: CompletedWorkout[], plannedWorkouts: PlannedWorkout[], modifications: PlanModification[]): void;
    /**
     * Optimize performance based on individual response
     */
    optimizePerformance(userId: string, plan: TrainingPlan, completedWorkouts: CompletedWorkout[], targetMetrics: string[]): PerformanceOptimization[];
    /**
     * Apply environmental adaptations
     */
    applyEnvironmentalAdaptations(userId: string, plan: TrainingPlan, environmentalFactors: EnvironmentalFactors): PlanModification[];
    /**
     * Resolve conflicts between methodology principles and individual needs
     */
    resolveMethodologyConflicts(userId: string, conflicts: MethodologyConflict[]): CustomizationModification[];
    /**
     * Unlock advanced features based on experience
     */
    unlockAdvancedFeatures(userId: string, experience: RunnerExperience, completedWeeks: number): AdvancedFeature[];
    /**
     * Apply injury prevention modifications
     */
    applyInjuryPrevention(userId: string, plan: TrainingPlan, injuryHistory: string[], currentRiskFactors: RiskFactor[]): PlanModification[];
    /**
     * Suggest breakthrough strategies for plateaus
     */
    suggestBreakthroughStrategies(userId: string, plateauMetric: string, plateauDuration: number): BreakthroughStrategy[];
    /**
     * Analyze current customization state
     */
    analyzeCustomization(userId: string, plan: TrainingPlan, completedWorkouts: CompletedWorkout[]): CustomizationAnalysis;
    /**
     * Get configuration for user
     */
    getConfiguration(userId: string): MethodologyConfiguration | undefined;
    /**
     * Get adaptation history for user
     */
    getAdaptationHistory(userId: string): AdaptationPattern[];
    private createBaseConfig;
    private calculateWeeklyIncrease;
    private calculatePhaseDurations;
    private initializeAdaptationPatterns;
    private createCustomizationSettings;
    private createPerformanceOptimizations;
    private createVDOTOptimizationStrategy;
    private createConstraints;
    private identifyPatterns;
    private mergePatterns;
    private selectEffectivePatterns;
    private calculateCurrentMetrics;
    private createOptimization;
    private createThresholdOptimization;
    private createEnduranceOptimization;
    private createVDOTOptimization;
    private createAltitudeAdjustments;
    private createHeatAdjustments;
    private createColdAdjustments;
    private createTerrainAdjustments;
    private createConflictResolution;
    private createDoubleThresholdProtocol;
    private createSuperCompensationProtocol;
    private createRaceSimulationProtocol;
    private createInjuryPreventionMods;
    private createRiskMitigationMods;
    private createDanielsBreakthroughs;
    private createLydiardBreakthroughs;
    private createPfitzingerBreakthroughs;
    private createGeneralBreakthroughs;
    private assessMethodologyState;
    private calculatePhilosophyAdherence;
    private determineCustomizationLevel;
    private calculateEffectiveness;
    private assessInjuryRisk;
    private calculateAdaptationSuccess;
    private generateCustomizationRecommendations;
    private identifyCustomizationWarnings;
    private projectOutcomes;
    private calculateProjectionConfidence;
}
interface MethodologyConflict {
    area: string;
    description: string;
    severity: "high" | "medium" | "low";
}
interface RunnerExperience {
    level: "beginner" | "novice" | "intermediate" | "advanced" | "expert";
    years: number;
    racesCompleted: number;
}
interface AdvancedFeature {
    id: string;
    name: string;
    description: string;
    requirements: string;
    implementation: string[];
}
interface RiskFactor {
    type: string;
    severity: "high" | "medium" | "low";
    description: string;
}
interface BreakthroughStrategy {
    id: string;
    name: string;
    description: string;
    protocol: string[];
    expectedImprovement: string;
    duration: number;
    intensity: "low" | "moderate" | "high";
    successProbability: number;
}

interface PhilosophyDimension {
    name: string;
    description: string;
    scale: number;
    weight: number;
}
interface MethodologyComparison {
    methodology1: TrainingMethodology;
    methodology2: TrainingMethodology;
    similarities: string[];
    differences: string[];
    compatibilityScore: number;
    transitionDifficulty: "easy" | "moderate" | "difficult";
    recommendedFor: string[];
    researchSupport: {
        methodology1: number;
        methodology2: number;
    };
}

/**
 * Workout selection criteria for methodology-specific decisions
 */
interface WorkoutSelectionCriteria {
    workoutType: WorkoutType;
    phase: TrainingPhase;
    weekNumber: number;
    dayOfWeek: number;
    previousWorkouts?: PlannedWorkout[];
    environmentalFactors?: EnvironmentalFactors;
    timeConstraints?: number;
    equipment?: string[];
    fitness?: FitnessAssessment;
    preferences?: TrainingPreferences;
}
/**
 * Workout selection result with rationale
 */
interface WorkoutSelectionResult {
    workout: Workout;
    templateName: string;
    rationale: string;
    alternativeOptions?: string[];
    warnings?: string[];
    methodologyCompliance: number;
}
/**
 * Context-aware workout selection based on methodology principles
 * Requirement 4.1: Implement MethodologyWorkoutSelector class with selection rules
 * Requirement 4.2: Add context-aware selection (fitness, environment, equipment)
 */
declare class MethodologyWorkoutSelector {
    private philosophy;
    private methodology;
    constructor(methodology: TrainingMethodology);
    /**
     * Select the most appropriate workout based on methodology and context
     * Requirement 4.1: Create methodology-specific workout selector
     * Requirement 4.4: Choose based on methodology-specific selection criteria
     */
    selectWorkout(criteria: WorkoutSelectionCriteria): WorkoutSelectionResult;
    /**
     * Create custom workout following methodology guidelines
     * Requirement 4.3: When workout templates are insufficient, create custom workouts
     */
    private createMethodologySpecificWorkout;
    /**
     * Create Daniels-specific workout with VDOT-based pacing
     */
    private createDanielsWorkout;
    /**
     * Create Lydiard-specific workout with aerobic emphasis
     */
    private createLydiardWorkout;
    /**
     * Create Pfitzinger-specific workout with LT emphasis
     */
    private createPfitsingerWorkout;
    /**
     * Apply modifications based on environmental and other constraints
     * Requirement 4.2: Add context-aware selection
     * Requirement 4.7: Substitute workouts while maintaining methodology integrity
     */
    private applyContextModifications;
    /**
     * Validate workout against methodology principles
     * Requirement 4.4: Methodology-specific selection criteria
     */
    private validateMethodologyCompliance;
    /**
     * Get alternative workout options
     */
    private getAlternativeOptions;
    /**
     * Check for conflicts with user preferences
     * Requirement 4.8: Provide warnings and methodology-compliant alternatives
     */
    private checkPreferenceConflicts;
    /**
     * Adjust workout duration to fit time constraints
     */
    private adjustWorkoutDuration;
    /**
     * Calculate average intensity across segments
     */
    private calculateAverageIntensity;
    /**
     * Calculate Training Stress Score
     */
    private calculateTSS;
    /**
     * Get methodology-specific intensity for workout type
     */
    private getMethodologyIntensity;
    /**
     * Get methodology-specific duration for workout type
     */
    private getMethodologyDuration;
    /**
     * Get training zone from intensity
     */
    private getZoneFromIntensity;
    /**
     * Get recovery time based on workout
     */
    private getRecoveryTime;
    /**
     * Get methodology-specific adaptation targets
     */
    private getDanielsAdaptationTarget;
    private getLydiardAdaptationTarget;
    private getPfitsingerAdaptationTarget;
    /**
     * Automatically advance workout difficulty based on progression
     * Requirement 4.5: Automatically advance workout difficulty following methodology patterns
     */
    getProgressedWorkout(previousWorkout: PlannedWorkout, weeksSinceStart: number, performanceData?: {
        completionRate: number;
        difficultyRating: number;
    }): WorkoutSelectionResult;
    /**
     * Apply methodology-specific progression patterns
     */
    private applyMethodologyProgression;
    /**
     * Get training phase from week number
     */
    private getPhaseFromWeek;
    /**
     * Select recovery workout based on methodology preferences
     * Requirement 4.6: Select appropriate active recovery or rest
     */
    selectRecoveryWorkout(previousWorkouts: PlannedWorkout[], recoveryNeeded: number): WorkoutSelectionResult;
}

/**
 * Methodology-Specific Caching System
 *
 * Provides high-performance caching for methodology-specific calculations,
 * workout selections, and philosophy comparisons to meet performance requirements.
 */

interface CacheEntry<T> {
    value: T;
    timestamp: number;
    hash: string;
}
/**
 * Base LRU cache implementation
 */
declare class LRUCache<T> {
    protected cache: Map<string, CacheEntry<T>>;
    protected maxSize: number;
    protected maxAge: number;
    constructor(maxSize?: number, maxAgeMs?: number);
    get(key: string): T | undefined;
    set(key: string, value: T, hash: string): void;
    clear(): void;
    size(): number;
}
/**
 * Enhanced LRU cache with hit/miss tracking for performance analysis
 */
declare class MetricsLRUCache<T> extends LRUCache<T> {
    private hits;
    private misses;
    constructor(maxSize: number, maxAgeMs: number);
    get(key: string): T | undefined;
    getHitRatio(): number;
    resetMetrics(): void;
    getMetrics(): {
        hits: number;
        misses: number;
        hitRatio: number;
    };
}
/**
 * Cached methodology pace calculations
 */
declare function calculateMethodologyPacesCached(methodology: TrainingMethodology, vdot: number, phase: TrainingPhase, weekNumber: number, calculator: () => Record<string, number>): Record<string, number>;
/**
 * Cached workout selection
 */
declare function selectWorkoutCached(methodology: TrainingMethodology, phase: TrainingPhase, weekNumber: number, dayOfWeek: number, fitness: FitnessAssessment, selector: () => WorkoutSelectionResult): WorkoutSelectionResult;
/**
 * Cached philosophy comparison
 */
declare function comparePhilosophiesCached(methodology1: TrainingMethodology, methodology2: TrainingMethodology, dimensions: PhilosophyDimension[] | undefined, comparator: () => MethodologyComparison): MethodologyComparison;
/**
 * Cached methodology configuration
 */
declare function getMethodologyConfigCached<T>(methodology: TrainingMethodology, configType: string, generator: () => T): T;
/**
 * Cached plan generation for preview/draft plans
 */
declare function generatePlanCached(config: AdvancedPlanConfig, generator: () => TrainingPlan): TrainingPlan;
/**
 * Batch workout selection with caching
 */
declare function batchSelectWorkoutsCached(requests: Array<{
    methodology: TrainingMethodology;
    phase: TrainingPhase;
    weekNumber: number;
    dayOfWeek: number;
    fitness: FitnessAssessment;
}>, selector: (request: any) => WorkoutSelectionResult): WorkoutSelectionResult[];
/**
 * Cache warming utilities
 */
declare class MethodologyCacheWarmer {
    /**
     * Pre-warm pace calculation caches for common scenarios
     */
    static warmPaceCalculations(methodologies: TrainingMethodology[], vdotRange: {
        min: number;
        max: number;
        step: number;
    }, calculator: (methodology: TrainingMethodology, vdot: number) => Record<string, number>): Promise<void>;
    /**
     * Pre-warm philosophy comparison cache
     */
    static warmPhilosophyComparisons(comparator: (m1: TrainingMethodology, m2: TrainingMethodology) => MethodologyComparison): Promise<void>;
}
declare const methodologyCacheInstances: {
    paceCalculationCache: MetricsLRUCache<Record<string, number>>;
    workoutSelectionCache: MetricsLRUCache<WorkoutSelectionResult>;
    philosophyComparisonCache: MetricsLRUCache<MethodologyComparison>;
    methodologyConfigCache: MetricsLRUCache<any>;
    planGenerationCache: MetricsLRUCache<TrainingPlan>;
};

/**
 * Workout progression parameters
 */
interface ProgressionParameters {
    currentWeek: number;
    totalWeeks: number;
    phase: TrainingPhase;
    methodology: TrainingMethodology;
    fitnessLevel: FitnessAssessment;
    completedWorkouts?: CompletedWorkout[];
    previousWorkout?: Workout;
}
/**
 * Progression rule for specific workout types
 */
interface ProgressionRule {
    workoutType: WorkoutType;
    methodology: TrainingMethodology;
    progressionType: "linear" | "exponential" | "stepped" | "plateau";
    parameters: {
        baseIncrease: number;
        maxIncrease: number;
        plateauThreshold?: number;
        stepSize?: number;
    };
    phaseModifiers: Record<TrainingPhase, number>;
}
/**
 * Substitution rule for workout replacement
 */
interface SubstitutionRule {
    originalType: WorkoutType;
    substitutions: Array<{
        type: WorkoutType;
        priority: number;
        conditions: {
            phase?: TrainingPhase[];
            methodology?: TrainingMethodology[];
            recoveryState?: "low" | "medium" | "high";
            minFitnessLevel?: number;
        };
        intensityAdjustment?: number;
    }>;
}
/**
 * Recovery-based workout recommendation
 */
interface RecoveryRecommendation {
    recommendedIntensity: number;
    recommendedDuration: number;
    workoutTypes: WorkoutType[];
    rationale: string;
    restrictions: string[];
}
/**
 * Comprehensive workout progression and substitution system
 * Requirement 4.5: Automatic workout difficulty progression
 * Requirement 4.6: Recovery-based workout selection
 * Requirement 4.7: Methodology-appropriate substitution matrices
 */
declare class WorkoutProgressionSystem {
    private workoutSelector;
    private customGenerator;
    private progressionRules;
    private substitutionRules;
    constructor(methodology: TrainingMethodology);
    /**
     * Progress a workout based on training history and methodology
     * Requirement 4.5: Automatic workout difficulty progression following methodology patterns
     */
    progressWorkout(baseWorkout: Workout, parameters: ProgressionParameters): Workout;
    /**
     * Substitute a workout based on constraints and recovery state
     * Requirement 4.7: Substitute workouts while maintaining methodology integrity
     */
    substituteWorkout(originalWorkout: Workout, parameters: ProgressionParameters, recoveryState: "low" | "medium" | "high", constraints?: {
        availableTime?: number;
        equipment?: string[];
        weather?: string;
    }): {
        workout: Workout;
        rationale: string;
    };
    /**
     * Generate recovery-based workout recommendations
     * Requirement 4.6: Select appropriate active recovery or rest based on methodology preferences
     */
    getRecoveryRecommendation(recoveryState: "low" | "medium" | "high", methodology: TrainingMethodology, phase: TrainingPhase, trainingLoad: TrainingLoad): RecoveryRecommendation;
    /**
     * Initialize methodology-specific progression rules
     */
    private initializeProgressionRules;
    /**
     * Initialize methodology-specific substitution rules
     */
    private initializeSubstitutionRules;
    /**
     * Calculate progression multiplier based on rule and parameters
     */
    private calculateProgressionMultiplier;
    /**
     * Progress workout duration with methodology-specific rules
     */
    private progressDuration;
    /**
     * Progress workout intensity with phase-specific constraints
     */
    private progressIntensity;
    /**
     * Get fitness-based progression modifier
     */
    private getFitnessProgressionModifier;
    /**
     * Calculate a fitness score from the FitnessAssessment
     */
    private calculateFitnessScore;
    /**
     * Calculate TSS for progressed workout segments
     */
    private calculateProgressedTSS;
    /**
     * Calculate recovery time for progressed workout
     */
    private calculateProgressedRecoveryTime;
    /**
     * Update workout description to reflect progression
     */
    private updateProgressionDescription;
    /**
     * Adjust workout intensity by percentage
     */
    private adjustWorkoutIntensity;
    /**
     * Build rationale for workout substitution
     */
    private buildSubstitutionRationale;
    /**
     * Get methodology-specific recovery preferences
     */
    private getMethodologyRecoveryPreferences;
    /**
     * Get recovery philosophy for methodology
     */
    private getRecoveryPhilosophy;
    /**
     * Get phase-appropriate workout types for methodology
     */
    private getPhaseAppropriateWorkouts;
    /**
     * Get appropriate workout template key for workout type
     */
    private getWorkoutTemplateKey;
}

/**
 * Custom workout generation parameters
 */
interface CustomWorkoutParameters {
    type: WorkoutType;
    phase: TrainingPhase;
    methodology: TrainingMethodology;
    targetDuration?: number;
    targetIntensity?: number;
    fitnessLevel?: FitnessAssessment;
    environmentalFactors?: EnvironmentalFactors;
    equipment?: string[];
    constraints?: WorkoutConstraints;
    preferences?: TrainingPreferences;
}
/**
 * Workout generation constraints
 */
interface WorkoutConstraints {
    maxDuration?: number;
    minDuration?: number;
    maxIntensity?: number;
    minIntensity?: number;
    availableTime?: number;
    terrainLimitations?: string[];
    weatherRestrictions?: string[];
}
/**
 * Generated workout result with metadata
 */
interface GeneratedWorkout {
    workout: Workout;
    rationale: string;
    methodologyCompliance: number;
    constraints: string[];
    alternatives?: Workout[];
}
/**
 * Advanced custom workout generator that creates methodology-specific workouts
 * based on complex requirements and constraints
 * Requirement 4.3: When workout templates are insufficient, create custom workouts
 * Requirement 4.7: Substitute workouts while maintaining methodology integrity
 * Requirement 4.8: Provide warnings and methodology-compliant alternatives
 */
declare class CustomWorkoutGenerator {
    private philosophy;
    private methodology;
    constructor(methodology: TrainingMethodology);
    /**
     * Generate a custom workout based on complex requirements
     * Requirement 4.3: Create custom workouts following methodology guidelines
     */
    generateWorkout(parameters: CustomWorkoutParameters): GeneratedWorkout;
    /**
     * Generate workout segments following methodology principles
     * Requirement 4.3: Methodology-specific workout creation rules
     */
    private generateMethodologySegments;
    /**
     * Generate Daniels-specific segments with precise pacing
     */
    private generateDanielsSegments;
    /**
     * Generate Lydiard-specific segments with aerobic emphasis
     */
    private generateLydiardSegments;
    /**
     * Generate Pfitzinger-specific segments with LT emphasis
     */
    private generatePfitsingerSegments;
    /**
     * Generate default segments when no specific methodology pattern applies
     */
    private generateDefaultSegments;
    /**
     * Apply environmental modifications to workout segments
     * Requirement 4.7: Environmental and equipment constraint handling
     */
    private applyEnvironmentalModifications;
    /**
     * Create workout from generated segments
     */
    private createWorkoutFromSegments;
    /**
     * Calculate methodology compliance score
     */
    private calculateMethodologyCompliance;
    /**
     * Generate alternative workouts if compliance is low
     * Requirement 4.8: Provide methodology-compliant alternatives
     */
    private generateAlternatives;
    /**
     * Get alternative workout types for substitution
     */
    private getAlternativeTypes;
    /**
     * Build rationale for workout generation
     */
    private buildRationale;
    /**
     * Collect constraint warnings
     */
    private collectConstraintWarnings;
    /**
     * Apply duration constraints
     */
    private applyDurationConstraints;
    /**
     * Apply intensity constraints
     */
    private applyIntensityConstraints;
    /**
     * Get default duration for workout type and phase
     */
    private getDefaultDuration;
    /**
     * Get default intensity for workout type and phase
     */
    private getDefaultIntensity;
    /**
     * Get zone for intensity level
     */
    private getZoneForIntensity;
    /**
     * Get pace name for intensity
     */
    private getPaceName;
    /**
     * Get adaptation target for workout type
     */
    private getAdaptationTarget;
    /**
     * Calculate TSS for workout segments
     */
    private calculateTSS;
    /**
     * Calculate recovery time needed
     */
    private calculateRecoveryTime;
}

export { ADAPTATION_TIMELINE, type AdaptationEngine, type AdvancedPlanConfig, AdvancedTrainingPlanGenerator, type AnyExportOptions, type ArrayTransformOptions, ArrayTypeAssertions, ArrayUtils, type AsyncPerformanceMonitoringDecorator, type AsyncTestAssertion, type BaseExportOptions, BaseTrainingPhilosophy, CSVFormatter, type CSVOptions, CacheManager, CalculationProfiler, type ChartData, CollectionBuilder, type CollectionResult, type CollectionTestUtil, type CompletedWorkout, type ValidationResult as CoreValidationResult, type CustomMethodologyOptions, CustomWorkoutGenerator, type CustomWorkoutParameters, DEFAULT_EXPORT_OPTIONS, DEFAULT_LOGGING_CONFIG, DEVELOPMENT_LOGGING_CONFIG, type DanielsMethodologyOptions, ENVIRONMENTAL_FACTORS, EXPORT_OPTION_VALIDATORS, EXPORT_VALIDATORS, EnhancedJSONFormatter, type EnhancedValidationResult, type EnvironmentalAdaptationFunction, type EnvironmentalConstraints, type EnvironmentalFactors, type ExportFormat, type ExportFormatOptionsMap, type ExportFormatValidator, type ExportManager, type ExportMetadata, type ExportResult, ExportUtils, type ExportValidationResult, type ExtendedCompletedWorkout, type ExtendedProgressData, type ExtendedRecoveryMetrics, type ExtendedTrainingPlan, type FeatureEnhancementFunction, type FeatureLevel, type FitnessAssessment, type FitnessMetrics, type FormatOptions, type Formatter, FunctionalArrayUtils, GarminFormatter, type GeneratedWorkout, type HudsonMethodologyOptions, INTENSITY_MODELS, type IntensityDistribution, type IntensityDistributionReport, type IntensityDistributionViolation, type InvalidDataAssertion, type InvalidTestData, JSONFormatter, type JSONOptions, LOAD_THRESHOLDS, LOGGING_PRESETS, LazyMethodologyLoader, type LogBackend, type LogLevel, type Logger, type LoggingConfig, type LydiardMethodologyOptions, METHODOLOGY_INTENSITY_DISTRIBUTIONS, METHODOLOGY_PHASE_TARGETS, MemoryMonitor, MethodologyAdaptationEngine, type MethodologyAdaptationPattern, type MethodologyAdaptationResponse, MethodologyAdaptationUtils, type MethodologyCache, type MethodologyCacheConfig, type MethodologyCacheEntry, type MethodologyCacheFactory, type MethodologyCacheManager, type MethodologyCacheStats, MethodologyCacheWarmer, type MethodologyConfig, MethodologyCustomizationEngine, type MethodologyFeatureSet, type MethodologyImportFunction, type MethodologyImportResult, type MethodologyLoader, type MethodologyLoadingOptions, type MethodologyOptionsMap, type MethodologyRecommendation, MethodologyRecommendationEngine, type MethodologyScores, MethodologyWorkoutSelector, type MockConfig, type MockFactoryRegistry, type MockGenerator, type MockLifecycleManager, type ModificationType, MultiFormatExporter, OptimizationAnalyzer, type OptionsForFormat, PDFFormatter, type PDFOptions, PHASE_DURATION, PROGRESSION_RATES, type PerformanceExpectation, type PerformanceMetrics, type PerformanceMonitoringDecorator, type PerformanceOptimizationFunction, type PfitzingerMethodologyOptions, type PhaseSummary, PhilosophyFactory, PhilosophyUtils, type PlanModification, type PlanSummary, type PlannedWorkout, type ProgressData, type ProgressionParameters, type ProgressionRule, ProgressiveEnhancementManager, type ProgressiveLoadingStrategy, type QuizAnswer, type QuizOption, type QuizQuestion, RACE_DISTANCES, RECOVERY_MULTIPLIERS, type RaceDistance, type RecentRace, type RecommendationQuiz, type RecommendationRationale, type RecommendationResult, type RecoveryMetrics, type RecoveryPhase, type RecoveryRecommendation, type RiskSeverity, type RunAnalysis, type RunData, type RunnerAttribute, type RunnerExperience$1 as RunnerExperience, type RunnerMotivation, SILENT_LOGGING_CONFIG, type SchemaGuard, SmartAdaptationEngine, StravaFormatter, type StrengthsWeaknesses, type SubstitutionRule, TCXFormatter, TRAINING_METHODOLOGIES, TRAINING_ZONES, type TargetRace, type TestAssertion, type TestConfig, type TestDataComparator, type TestDataGenerator, type TestDouble, type TestOptionsFactory, type TestResult, type TestScenario, type TestTypeGuard, type TestValidationResult, type TestWorkoutFactory, type TestableProperties, type TestableTrainingPlanGenerator, type TrainingApproach, type TrainingBlock, type TrainingGoal, type TrainingLoad, type TrainingMethodology, TrainingPeaksFormatter, type TrainingPhase, type TrainingPhilosophy, type TrainingPlan, type TrainingPlanConfig, TrainingPlanGenerator, type TrainingPreferences, type TrainingZone, type TransitionPlan, type TypeGuard, TypeSafeErrorHandler, TypeValidationError$1 as TypeValidationError, TypeValidationErrorFactory, TypedArray, type TypedCollection, type TypedExpectation, type TypedLazyLoadingConfig, type TypedMethodologyFeatureSet, type TypedMethodologyLoader, type TypedMockConfig, type TypedPerformanceMetrics, type TypedResult$1 as TypedResult, TypedResultUtils, type TypedSchema, type TypedValidationError, type TypedValidationResult, TypedValidationResultBuilder, type TypedValidationWarning, type UserProfile, type ValidatedType, ValidationErrorAggregator, type ValidationGuard, type ValidationResult$1 as ValidationResult, WORKOUT_DURATIONS, WORKOUT_EMPHASIS, WORKOUT_TEMPLATES, type WeeklyAdjustment, type WeeklyMicrocycle, type WeeklyPatterns, type Workout, type WorkoutConstraints, type WorkoutMetrics, WorkoutProgressionSystem, type WorkoutSegment, type WorkoutSelectionCriteria, type WorkoutSelectionResult, type WorkoutType, analyzeWeeklyPatterns, batchCalculateVDOT, batchSelectWorkoutsCached, cacheInstances, calculateCriticalSpeed, calculateCriticalSpeedCached, calculateFitnessMetrics, calculateFitnessMetricsCached, calculateInjuryRisk, calculateLactateThreshold, calculateMethodologyPacesCached, calculatePersonalizedZones, calculateRecoveryScore, calculateTSS, calculateTrainingLoad, calculateTrainingPaces, calculateTrainingPacesCached, calculateVDOT, calculateVDOTCached, comparePhilosophiesCached, compareSeverity, createAdaptationEngine, createCustomWorkout, createEmptyScores, createExportManager, createExportOptions, createExportTypeGuard, createExportValidator, createExtendedCompletedWorkout, createExtendedProgressData, createExtendedRecoveryMetrics, createInvalidDataAssertion, createLogger, createMockConfig, createSchemaGuard, createTestAssertion, createValidationGuard, defaultLogger, developmentLogger, estimateRunningEconomy, generatePlanCached, getHighestSeverity, getIntensityConfig, getLoggerFromOptions, getMethodologyConfigCached, getRecoveryConfig, getVolumeConfig, getZoneByIntensity, hasIntensityConfig, hasRecoveryConfig, hasVolumeConfig, iCalFormatter, type iCalOptions, isAdvancedPlanConfig, isBaseExportOptions, isCSVOptions, isCompletedWorkout, isEnvironmentalFactors, isExtendedCompletedWorkout, isExtendedProgressData, isExtendedRecoveryMetrics, isFitnessAssessment, isJSONOptions, isLogger, isOptionsForFormat, isPDFOptions, isPlannedWorkout, isProgressData, isRecoveryMetrics, isRunData, isTargetRace, isTestableGenerator, isTrainingBlock, isTrainingPlan, isTrainingPlanConfig, isTrainingPreferences, isValidPlannedWorkout, isValidTrainingPlan, isiCalOptions, methodologyCacheInstances, methodologyLoader, primitiveGuards, safeTestCast, selectWorkoutCached, silentLogger, testOptionsFactory, testWorkoutFactory, validateExport, validateExportOptions, validateLoggingConfig, validateTestResult, validationGuards, validationUtils, withAsyncPerformanceMonitoring, withLogging, withPerformanceMonitoring };
