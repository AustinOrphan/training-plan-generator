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
'FIRST_5K'
/** Improve existing 5K time - higher intensity and speed work */
 | 'IMPROVE_5K'
/** First 10K race - intermediate distance introduction */
 | 'FIRST_10K'
/** Half marathon training - endurance base with tempo work */
 | 'HALF_MARATHON'
/** Marathon training - full 26.2 mile preparation */
 | 'MARATHON'
/** Ultra marathon training - 50K+ distance preparation */
 | 'ULTRA'
/** General fitness - flexible approach without specific race goal */
 | 'GENERAL_FITNESS';
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
    preferredIntensity: 'low' | 'moderate' | 'high';
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
    terrain: 'flat' | 'hilly' | 'mixed' | 'trail';
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
'base'
/** Build phase - lactate threshold development with tempo and threshold work */
 | 'build'
/** Peak phase - VO2max and neuromuscular power with intervals and race pace */
 | 'peak'
/** Taper phase - volume reduction while maintaining intensity for race preparation */
 | 'taper'
/** Recovery phase - active recovery and regeneration after racing */
 | 'recovery';
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
type WorkoutType = 'recovery' | 'easy' | 'steady' | 'tempo' | 'threshold' | 'vo2max' | 'speed' | 'hill_repeats' | 'fartlek' | 'progression' | 'long_run' | 'race_pace' | 'time_trial' | 'cross_training' | 'strength';
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
    trend: 'increasing' | 'stable' | 'decreasing';
    recommendation: string;
}
type TrainingMethodology = 'daniels' | 'lydiard' | 'pfitzinger' | 'hanson' | 'custom';
type ExportFormat = 'pdf' | 'ical' | 'csv' | 'json';
type RaceDistance = '5k' | '10k' | 'half-marathon' | 'marathon' | 'ultra';
interface TargetRace {
    distance: RaceDistance;
    date: Date;
    goalTime: {
        hours: number;
        minutes: number;
        seconds: number;
    };
    priority: 'A' | 'B' | 'C';
    location: string;
    terrain: 'road' | 'trail' | 'track' | 'mixed';
    conditions: EnvironmentalFactors;
}
interface AdvancedPlanConfig extends TrainingPlanConfig {
    methodology: TrainingMethodology;
    intensityDistribution: IntensityDistribution;
    periodization: 'linear' | 'block' | 'undulating';
    targetRaces: TargetRace[];
    seasonGoals?: string[];
    adaptationEnabled?: boolean;
    recoveryMonitoring?: boolean;
    progressTracking?: boolean;
    exportFormats?: ExportFormat[];
    platformIntegrations?: string[];
    multiRaceConfig?: {
        primaryRace: string;
        secondaryRaces: string[];
        peakingStrategy: 'single' | 'double' | 'multiple';
    };
    adaptationSettings?: {
        sensitivity: 'low' | 'medium' | 'high';
        autoAdjust: boolean;
        thresholds: {
            fatigue: number;
            improvement: number;
        };
    };
}
interface ProgressData {
    date: Date;
    perceivedExertion: number;
    heartRateData: {
        resting: number;
        average: number;
        maximum: number;
    };
    performanceMetrics: {
        vo2max: number;
        lactateThreshold: number;
        runningEconomy: number;
    };
    completedWorkouts?: CompletedWorkout[];
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
    adherence: 'none' | 'partial' | 'complete';
    difficultyRating: number;
}
interface RecoveryMetrics {
    recoveryScore: number;
    sleepQuality: number;
    sleepDuration: number;
    stressLevel: number;
    muscleSoreness: number;
    energyLevel: number;
    motivation: number;
}

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
    static fromRunHistory(runs: RunData[], goal: TrainingPlanConfig['goal'], targetDate: Date): TrainingPlan;
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
     * Create default fitness assessment
     */
    private createDefaultFitness;
    /**
     * Assess fitness from run history
     */
    private static assessFitnessFromRuns;
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
    readonly '5K': 5;
    readonly '10K': 10;
    readonly HALF_MARATHON: 21.0975;
    readonly MARATHON: 42.195;
    readonly '50K': 50;
    readonly '50_MILE': 80.4672;
    readonly '100K': 100;
    readonly '100_MILE': 160.9344;
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
        };
        readonly workoutPriorities: readonly ["easy", "long_run", "hill_repeats", "tempo", "speed"];
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
        readonly tempo: 1.5;
        readonly threshold: 1.4;
        readonly vo2max: 1.3;
        readonly speed: 1.1;
        readonly long_run: 1.2;
    };
    readonly lydiard: {
        readonly recovery: 1;
        readonly easy: 1.5;
        readonly tempo: 1.1;
        readonly threshold: 1;
        readonly vo2max: 0.8;
        readonly speed: 0.9;
        readonly long_run: 1.4;
        readonly hill_repeats: 1.3;
    };
    readonly pfitzinger: {
        readonly recovery: 1;
        readonly easy: 1.3;
        readonly tempo: 1.2;
        readonly threshold: 1.5;
        readonly vo2max: 1.1;
        readonly speed: 1;
        readonly long_run: 1.3;
    };
    readonly hudson: {
        readonly recovery: 1;
        readonly easy: 1.2;
        readonly tempo: 1.4;
        readonly threshold: 1.2;
        readonly vo2max: 1.1;
        readonly speed: 1;
        readonly long_run: 1.2;
        readonly fartlek: 1.3;
    };
    readonly custom: {
        readonly recovery: 1;
        readonly easy: 1.2;
        readonly tempo: 1.2;
        readonly threshold: 1.2;
        readonly vo2max: 1.1;
        readonly speed: 1;
        readonly long_run: 1.2;
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

export { ADAPTATION_TIMELINE, type AdvancedPlanConfig, type CompletedWorkout, ENVIRONMENTAL_FACTORS, type EnvironmentalFactors, type ExportFormat, type FitnessAssessment, type FitnessMetrics, INTENSITY_MODELS, type IntensityDistribution, LOAD_THRESHOLDS, METHODOLOGY_PHASE_TARGETS, PHASE_DURATION, PROGRESSION_RATES, type PhaseSummary, type PlanSummary, type PlannedWorkout, type ProgressData, RACE_DISTANCES, RECOVERY_MULTIPLIERS, type RaceDistance, type RecoveryMetrics, type RunAnalysis, type RunData, TRAINING_METHODOLOGIES, TRAINING_ZONES, type TargetRace, type TrainingBlock, type TrainingGoal, type TrainingLoad, type TrainingMethodology, type TrainingPhase, type TrainingPlan, type TrainingPlanConfig, TrainingPlanGenerator, type TrainingPreferences, type TrainingZone, WORKOUT_DURATIONS, WORKOUT_EMPHASIS, WORKOUT_TEMPLATES, type WeeklyMicrocycle, type WeeklyPatterns, type Workout, type WorkoutMetrics, type WorkoutSegment, type WorkoutType, analyzeWeeklyPatterns, calculateCriticalSpeed, calculateFitnessMetrics, calculateInjuryRisk, calculateLactateThreshold, calculatePersonalizedZones, calculateRecoveryScore, calculateTSS, calculateTrainingLoad, calculateTrainingPaces, calculateVDOT, createCustomWorkout, estimateRunningEconomy, getZoneByIntensity };
