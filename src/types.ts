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

import { TrainingZone } from './zones';

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
export interface TrainingPlanConfig {
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
export type TrainingGoal =
  /** First 5K race - beginner-friendly with gradual progression */
  | 'FIRST_5K'
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
export interface FitnessAssessment {
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
export interface TrainingPreferences {
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
export interface EnvironmentalFactors {
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
export interface TrainingPlan {
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
export interface TrainingBlock {
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
export type TrainingPhase = 
  /** Base building phase - aerobic foundation with high volume, low intensity */
  | 'base' 
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
export interface WeeklyMicrocycle {
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

export interface PlannedWorkout {
  id: string;
  date: Date;
  type: WorkoutType;
  name: string;
  description: string;
  workout: Workout;
  targetMetrics: WorkoutMetrics;
}

export interface Workout {
  type: WorkoutType;
  primaryZone: TrainingZone;
  segments: WorkoutSegment[];
  adaptationTarget: string;
  estimatedTSS: number;
  recoveryTime: number; // hours
}

export interface WorkoutSegment {
  duration: number; // minutes
  distance?: number; // km
  intensity: number; // percentage of max
  zone: TrainingZone;
  description: string;
  cadenceTarget?: number;
  heartRateTarget?: { min: number; max: number };
  paceTarget?: { 
    min: number; 
    max: number; // min/km
    effortBased?: boolean; // For Lydiard methodology - use effort over rigid pace
    perceivedEffort?: number; // 1-10 scale for effort-based training
  };
}

export interface WorkoutMetrics {
  duration: number;
  distance?: number;
  tss: number;
  load: number;
  intensity: number;
}

export type WorkoutType =
  | 'recovery'
  | 'easy'
  | 'steady'
  | 'tempo'
  | 'threshold'
  | 'vo2max'
  | 'speed'
  | 'hill_repeats'
  | 'fartlek'
  | 'progression'
  | 'long_run'
  | 'race_pace'
  | 'time_trial'
  | 'cross_training'
  | 'strength';

export interface PlanSummary {
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

export interface PhaseSummary {
  phase: TrainingPhase;
  weeks: number;
  focus: string[];
  volumeProgression: number[];
  intensityDistribution: IntensityDistribution;
}

export interface IntensityDistribution {
  easy: number; // percentage
  moderate: number;
  hard: number;
}

// Run data for analysis
export interface RunData {
  date: Date;
  distance: number; // km
  duration: number; // minutes
  avgPace?: number; // min/km
  avgHeartRate?: number;
  maxHeartRate?: number;
  elevation?: number; // meters
  effortLevel?: number; // 1-10
  notes?: string;
  temperature?: number;
  isRace?: boolean;
}

export interface RunAnalysis {
  recentRuns: RunData[];
  weeklyPatterns: WeeklyPatterns;
  fitness: FitnessMetrics;
}

export interface WeeklyPatterns {
  avgWeeklyMileage: number;
  maxWeeklyMileage: number;
  avgRunsPerWeek: number;
  consistencyScore: number; // 0-100
  optimalDays: number[];
  typicalLongRunDay: number;
}

export interface FitnessMetrics {
  vdot: number;
  criticalSpeed: number; // km/h
  runningEconomy: number; // ml/kg/km
  lactateThreshold: number; // km/h
  trainingLoad: TrainingLoad;
  injuryRisk: number; // 0-100
  recoveryScore: number; // 0-100
}

export interface TrainingLoad {
  acute: number; // 7-day
  chronic: number; // 28-day
  ratio: number; // acute:chronic
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendation: string;
}

// Advanced Configuration Types
export type TrainingMethodology = 'daniels' | 'lydiard' | 'pfitzinger' | 'hanson' | 'custom';

export type ExportFormat = 'pdf' | 'ical' | 'csv' | 'json';

export type RaceDistance = '5k' | '10k' | 'half-marathon' | 'marathon' | 'ultra';

export interface TargetRace {
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

export interface AdvancedPlanConfig extends TrainingPlanConfig {
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

export interface ProgressData {
  date: Date;
  perceivedExertion: number; // 1-10
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

export interface CompletedWorkout {
  plannedWorkout: PlannedWorkout;
  actualDuration: number;
  actualDistance: number;
  actualPace: number; // min/km
  avgHeartRate: number;
  maxHeartRate: number;
  completionRate: number; // 0-1
  adherence: 'none' | 'partial' | 'complete';
  difficultyRating: number; // 1-10
}

export interface RecoveryMetrics {
  recoveryScore: number; // 0-100
  sleepQuality: number; // 0-100
  sleepDuration: number; // hours
  stressLevel: number; // 0-100
  muscleSoreness: number; // 1-10
  energyLevel: number; // 1-10
  motivation: number; // 1-10
}