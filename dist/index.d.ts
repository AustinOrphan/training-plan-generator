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

interface TrainingPlanConfig {
    name: string;
    description?: string;
    goal: TrainingGoal;
    targetDate?: Date;
    startDate: Date;
    endDate?: Date;
    currentFitness?: FitnessAssessment;
    preferences?: TrainingPreferences;
    environment?: EnvironmentalFactors;
}
type TrainingGoal = 'FIRST_5K' | 'IMPROVE_5K' | 'FIRST_10K' | 'HALF_MARATHON' | 'MARATHON' | 'ULTRA' | 'GENERAL_FITNESS';
interface FitnessAssessment {
    vdot?: number;
    criticalSpeed?: number;
    lactateThreshold?: number;
    runningEconomy?: number;
    weeklyMileage: number;
    longestRecentRun: number;
    trainingAge?: number;
    injuryHistory?: string[];
    recoveryRate?: number;
}
interface TrainingPreferences {
    availableDays: number[];
    preferredIntensity: 'low' | 'moderate' | 'high';
    crossTraining: boolean;
    strengthTraining: boolean;
    timeConstraints?: Record<number, number>;
}
interface EnvironmentalFactors {
    altitude?: number;
    typicalTemperature?: number;
    humidity?: number;
    terrain: 'flat' | 'hilly' | 'mixed' | 'trail';
}
interface TrainingPlan {
    id?: string;
    config: TrainingPlanConfig;
    blocks: TrainingBlock[];
    summary: PlanSummary;
    workouts: PlannedWorkout[];
}
interface TrainingBlock {
    id: string;
    phase: TrainingPhase;
    startDate: Date;
    endDate: Date;
    weeks: number;
    focusAreas: string[];
    microcycles: WeeklyMicrocycle[];
}
type TrainingPhase = 'base' | 'build' | 'peak' | 'taper' | 'recovery';
interface WeeklyMicrocycle {
    weekNumber: number;
    pattern: string;
    workouts: PlannedWorkout[];
    totalLoad: number;
    totalDistance: number;
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

export { ADAPTATION_TIMELINE, ENVIRONMENTAL_FACTORS, type EnvironmentalFactors, type FitnessAssessment, type FitnessMetrics, INTENSITY_MODELS, type IntensityDistribution, LOAD_THRESHOLDS, PHASE_DURATION, PROGRESSION_RATES, type PhaseSummary, type PlanSummary, type PlannedWorkout, RACE_DISTANCES, RECOVERY_MULTIPLIERS, type RunAnalysis, type RunData, TRAINING_ZONES, type TrainingBlock, type TrainingGoal, type TrainingLoad, type TrainingPhase, type TrainingPlan, type TrainingPlanConfig, TrainingPlanGenerator, type TrainingPreferences, type TrainingZone, WORKOUT_DURATIONS, WORKOUT_TEMPLATES, type WeeklyMicrocycle, type WeeklyPatterns, type Workout, type WorkoutMetrics, type WorkoutSegment, type WorkoutType, analyzeWeeklyPatterns, calculateCriticalSpeed, calculateFitnessMetrics, calculateInjuryRisk, calculateLactateThreshold, calculatePersonalizedZones, calculateRecoveryScore, calculateTSS, calculateTrainingLoad, calculateTrainingPaces, calculateVDOT, createCustomWorkout, estimateRunningEconomy, getZoneByIntensity };
