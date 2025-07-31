import { 
  TrainingMethodology, 
  TrainingPlan, 
  TrainingBlock, 
  TrainingPhase, 
  Workout, 
  WorkoutType,
  IntensityDistribution,
  FitnessAssessment,
  PlannedWorkout,
  RunData
} from './types';
import { WORKOUT_TEMPLATES, createCustomWorkout } from './workouts';
import { TRAINING_METHODOLOGIES, WORKOUT_EMPHASIS, METHODOLOGY_PHASE_TARGETS, INTENSITY_MODELS, METHODOLOGY_INTENSITY_DISTRIBUTIONS } from './constants';
import { calculateVDOT, calculateLactateThreshold } from './calculator';
import { calculateVDOTCached } from './calculation-cache';
import { TRAINING_ZONES, calculateTrainingPaces } from './zones';
import { differenceInWeeks } from 'date-fns';

// Training methodology type definitions
export type DanielsTrainingPaces = Record<string, number>;
export type PfitzingerTrainingPaces = Record<string, number>;
export type WeeklyMicrocycle = any; // Will be defined properly later
export type TrainingZone = any; // Will be defined properly later

// Weekly variation types
export interface WeeklyVariation {
  week: number;
  volumeMultiplier: number;
  intensityFocus: string[];
  restDays: number;
  keyWorkouts: string[];
}

// Pfitzinger specific types
export interface PfitzingerWeeklyStructure {
  baseVolume: number;
  qualityDays: number;
  recoveryDays: number;
  mediumLongRuns: number;
}

export interface RaceSpecificIntegration {
  raceDistance: string;
  preparationWeeks: number;
  tapering: {
    duration: number;
    volumeReduction: number;
  };
}

export interface PaceRange {
  min: number;
  max: number;
}

// Temporary WorkoutSegment definition (should be imported from types)
export interface WorkoutSegment {
  duration: number;
  intensity: number;
  description: string;
  zone?: any;
}

/**
 * Core interface for training philosophies
 * Defines how different coaching methodologies customize training plans
 */
export interface TrainingPhilosophy {
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
export abstract class BaseTrainingPhilosophy implements TrainingPhilosophy {
  protected readonly config: typeof TRAINING_METHODOLOGIES[TrainingMethodology];
  
  constructor(
    public readonly methodology: TrainingMethodology,
    public readonly name: string
  ) {
    this.config = TRAINING_METHODOLOGIES[methodology];
  }
  
  get intensityDistribution(): IntensityDistribution {
    return this.config.intensityDistribution;
  }
  
  get workoutPriorities(): WorkoutType[] {
    return [...this.config.workoutPriorities] as WorkoutType[];
  }
  
  get recoveryEmphasis(): number {
    return this.config.recoveryEmphasis;
  }
  
  /**
   * Default plan enhancement - can be overridden by specific philosophies
   */
  enhancePlan(basePlan: TrainingPlan): TrainingPlan {
    const enhancedBlocks = basePlan.blocks.map(block => this.enhanceBlock(block));
    
    return {
      ...basePlan,
      blocks: enhancedBlocks,
      summary: {
        ...basePlan.summary,
        phases: basePlan.summary.phases.map(phase => ({
          ...phase,
          intensityDistribution: this.getPhaseIntensityDistribution(phase.phase)
        }))
      }
    };
  }
  
  /**
   * Enhance a training block with philosophy-specific customizations
   */
  protected enhanceBlock(block: TrainingBlock): TrainingBlock {
    const enhancedMicrocycles = block.microcycles.map(microcycle => ({
      ...microcycle,
      workouts: microcycle.workouts.map(plannedWorkout => ({
        ...plannedWorkout,
        workout: this.customizeWorkout(
          plannedWorkout.workout, 
          block.phase, 
          microcycle.weekNumber
        )
      }))
    }));
    
    return {
      ...block,
      microcycles: enhancedMicrocycles
    };
  }
  
  /**
   * Default workout customization - adjusts intensity based on phase and philosophy
   */
  customizeWorkout(template: Workout, phase: TrainingPhase, weekNumber: number): Workout {
    const phaseIntensity = this.getPhaseIntensityDistribution(phase);
    const emphasis = this.getWorkoutEmphasis(template.type);
    
    // Adjust segments based on philosophy
    const customizedSegments = template.segments.map(segment => ({
      ...segment,
      intensity: this.adjustIntensity(segment.intensity, phase, emphasis)
    }));
    
    return {
      ...template,
      segments: customizedSegments,
      estimatedTSS: Math.round(template.estimatedTSS * emphasis),
      recoveryTime: Math.round(template.recoveryTime * this.recoveryEmphasis)
    };
  }
  
  /**
   * Select workout template based on philosophy priorities
   */
  selectWorkout(type: WorkoutType, phase: TrainingPhase, weekInPhase: number): string {
    // Get templates for the workout type
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES)
      .filter(key => WORKOUT_TEMPLATES[key].type === type);
    
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for workout type: ${type}`);
    }
    
    // Select based on phase and philosophy preferences
    return this.selectPreferredTemplate(availableTemplates, phase, weekInPhase);
  }
  
  /**
   * Get phase-specific intensity distribution
   */
  getPhaseIntensityDistribution(phase: TrainingPhase): IntensityDistribution {
    const methodologyDistributions = METHODOLOGY_INTENSITY_DISTRIBUTIONS[this.methodology as keyof typeof METHODOLOGY_INTENSITY_DISTRIBUTIONS];
    return methodologyDistributions?.[phase] || this.intensityDistribution;
  }
  
  /**
   * Get workout emphasis multiplier
   */
  getWorkoutEmphasis(type: WorkoutType): number {
    const emphasis = WORKOUT_EMPHASIS[this.methodology as keyof typeof WORKOUT_EMPHASIS];
    return emphasis?.[type] || 1.0;
  }
  
  /**
   * Adjust intensity based on philosophy and phase
   */
  protected adjustIntensity(baseIntensity: number, phase: TrainingPhase, emphasis: number): number {
    let adjustment = 1.0;
    
    // Phase-based adjustments
    switch (phase) {
      case 'base':
        adjustment = 0.95; // Slightly easier in base phase
        break;
      case 'build':
        adjustment = 1.0; // Standard intensity
        break;
      case 'peak':
        adjustment = 1.05; // Higher intensity in peak
        break;
      case 'taper':
        adjustment = 0.90; // Reduced intensity in taper
        break;
      case 'recovery':
        adjustment = 0.85; // Much easier in recovery
        break;
    }
    
    // Apply philosophy emphasis
    adjustment *= emphasis;
    
    // Ensure intensity stays within reasonable bounds
    const adjustedIntensity = baseIntensity * adjustment;
    return Math.max(40, Math.min(100, Math.round(adjustedIntensity)));
  }
  
  /**
   * Select preferred template based on philosophy
   */
  protected selectPreferredTemplate(
    templates: string[], 
    phase: TrainingPhase, 
    weekInPhase: number
  ): string {
    // Default implementation - selects first available
    // Specific philosophies can override for more sophisticated selection
    return templates[0];
  }
}

/**
 * Factory for creating training philosophy instances
 */
export class PhilosophyFactory {
  private static philosophyCache = new Map<TrainingMethodology, TrainingPhilosophy>();
  
  /**
   * Create a training philosophy instance
   */
  static create(methodology: TrainingMethodology): TrainingPhilosophy {
    // Check cache first
    if (this.philosophyCache.has(methodology)) {
      return this.philosophyCache.get(methodology)!;
    }
    
    let philosophy: TrainingPhilosophy;
    
    switch (methodology) {
      case 'daniels':
        philosophy = new DanielsPhilosophy();
        break;
      case 'lydiard':
        philosophy = new LydiardPhilosophy();
        break;
      case 'pfitzinger':
        philosophy = new PfitsingerPhilosophy();
        break;
      case 'hudson':
        philosophy = new HudsonPhilosophy();
        break;
      case 'custom':
        philosophy = new CustomPhilosophy();
        break;
      default:
        throw new Error(`Unknown training methodology: ${methodology}`);
    }
    
    // Cache the instance
    this.philosophyCache.set(methodology, philosophy);
    return philosophy;
  }
  
  /**
   * Get list of available methodologies
   */
  static getAvailableMethodologies(): TrainingMethodology[] {
    return ['daniels', 'lydiard', 'pfitzinger', 'hudson', 'custom'];
  }
  
  /**
   * Clear the philosophy cache (useful for testing)
   */
  static clearCache(): void {
    this.philosophyCache.clear();
  }
}

/**
 * Jack Daniels training methodology implementation
 * Based on VDOT system and structured intensity approach
 */
class DanielsPhilosophy extends BaseTrainingPhilosophy {
  private cachedVDOTPaces: Map<number, DanielsTrainingPaces> = new Map();
  
  constructor() {
    super('daniels', 'Jack Daniels');
  }
  
  /**
   * Enhanced plan generation with VDOT-based pacing and 80/20 enforcement
   */
  enhancePlan(basePlan: TrainingPlan): TrainingPlan {
    const enhancedPlan = super.enhancePlan(basePlan);
    
    // Get current VDOT from fitness assessment
    const currentVDOT = basePlan.config.currentFitness?.vdot || this.estimateVDOTFromPlan(basePlan);
    
    // Apply VDOT-based pacing to all workouts
    const pacedPlan = {
      ...enhancedPlan,
      workouts: enhancedPlan.workouts.map(workout => 
        this.applyVDOTBasedPacing(workout, currentVDOT)
      )
    };
    
    // Apply 80/20 intensity distribution enforcement
    const danielsCompliantPlan = this.validateAndEnforceIntensityDistribution(pacedPlan);
    
    // Generate intensity distribution report
    const intensityReport = this.generateIntensityReport(danielsCompliantPlan);
    
    return {
      ...danielsCompliantPlan,
      metadata: {
        ...danielsCompliantPlan.metadata,
        danielsVDOT: currentVDOT,
        trainingPaces: this.getVDOTPaces(currentVDOT),
        intensityDistribution: intensityReport.overall,
        intensityReport,
        methodology: 'daniels',
        complianceScore: intensityReport.compliance
      }
    };
  }
  
  /**
   * Daniels-specific workout customization with VDOT integration
   */
  customizeWorkout(template: Workout, phase: TrainingPhase, weekNumber: number, vdot?: number): Workout {
    const baseCustomization = super.customizeWorkout(template, phase, weekNumber);
    
    // Get VDOT for pace calculations (use provided or estimate from template)
    const currentVDOT = vdot || this.estimateVDOTFromTemplate(template);
    const trainingPaces = this.getVDOTPaces(currentVDOT);
    
    // Apply VDOT-based pace customization to segments
    const danielsSegments = baseCustomization.segments.map(segment => 
      this.customizeSegmentWithVDOTPaces(segment, template.type, phase, trainingPaces)
    );
    
    return {
      ...baseCustomization,
      segments: danielsSegments,
      adaptationTarget: this.getDanielsAdaptationTarget(template.type, phase),
      metadata: {
        ...baseCustomization.metadata,
        vdot: currentVDOT,
        trainingPaces,
        methodology: 'daniels'
      }
    };
  }

  /**
   * Customize workout segment with VDOT-based paces
   */
  private customizeSegmentWithVDOTPaces(
    segment: WorkoutSegment, 
    workoutType: WorkoutType, 
    phase: TrainingPhase,
    trainingPaces: DanielsTrainingPaces
  ): WorkoutSegment {
    // Map workout types to Daniels pace zones
    const paceMapping: Record<WorkoutType, keyof DanielsTrainingPaces> = {
      easy: 'easy',
      recovery: 'easy',
      long_run: 'easy',
      tempo: 'threshold',
      threshold: 'threshold',
      steady: 'marathon',
      vo2max: 'interval',
      speed: 'repetition',
      fartlek: 'threshold',
      progression: 'easy',
      race_pace: 'marathon'
    };

    const paceZone = paceMapping[workoutType] || 'easy';
    const targetPace = trainingPaces[paceZone];

    // Apply VDOT-based intensity and pace customization
    const customizedSegment = {
      ...segment,
      intensity: this.calculateVDOTBasedIntensity(segment.intensity, paceZone, phase),
      paceTarget: {
        min: targetPace.min,
        max: targetPace.max
      },
      description: this.enhanceSegmentDescriptionWithPace(
        segment.description, 
        workoutType, 
        targetPace,
        paceZone
      )
    };

    // Phase-specific adjustments
    return this.applyPhaseSpecificAdjustments(customizedSegment, phase, workoutType);
  }

  /**
   * Calculate VDOT-based intensity for a given pace zone
   */
  private calculateVDOTBasedIntensity(
    baseIntensity: number, 
    paceZone: keyof DanielsTrainingPaces, 
    phase: TrainingPhase
  ): number {
    // Daniels' intensity mapping based on physiological zones
    const danielsIntensityMap: Record<keyof DanielsTrainingPaces, number> = {
      easy: 70,        // E pace: 59-74% VO2max
      marathon: 84,    // M pace: 84% VO2max
      threshold: 88,   // T pace: 88% VO2max
      interval: 98,    // I pace: 98-100% VO2max
      repetition: 105  // R pace: 105-110% VO2max
    };

    const targetIntensity = danielsIntensityMap[paceZone];
    
    // Apply phase-specific intensity adjustments
    const phaseAdjustment = this.getPhaseIntensityAdjustment(phase, paceZone);
    
    return Math.min(100, Math.max(50, targetIntensity + phaseAdjustment));
  }

  /**
   * Get phase-specific intensity adjustments
   */
  private getPhaseIntensityAdjustment(phase: TrainingPhase, paceZone: keyof DanielsTrainingPaces): number {
    const adjustments: Record<TrainingPhase, Record<keyof DanielsTrainingPaces, number>> = {
      base: {
        easy: -2,      // Slightly easier in base phase
        marathon: -3,  // Conservative marathon pace
        threshold: -5, // Reduced threshold intensity
        interval: -10, // Minimal interval work
        repetition: -15 // Very limited speed work
      },
      build: {
        easy: 0,       // Standard easy pace
        marathon: 0,   // Standard marathon pace
        threshold: 0,  // Full threshold work
        interval: -2,  // Slightly reduced interval
        repetition: -5 // Conservative speed work
      },
      peak: {
        easy: 0,       // Standard easy for recovery
        marathon: 2,   // Slightly faster marathon pace
        threshold: 2,  // Enhanced threshold work
        interval: 0,   // Full interval intensity
        repetition: 0  // Full speed work
      },
      taper: {
        easy: -2,      // Very easy for recovery
        marathon: 0,   // Race-specific marathon pace
        threshold: -3, // Reduced threshold volume
        interval: -2,  // Maintain interval sharpness
        repetition: -5 // Light speed maintenance
      },
      recovery: {
        easy: -5,      // Very easy recovery
        marathon: -10, // Minimal marathon pace work
        threshold: -15, // Minimal threshold work
        interval: -20, // Minimal interval work
        repetition: -25 // Minimal speed work
      }
    };

    return adjustments[phase]?.[paceZone] || 0;
  }

  /**
   * Enhance segment description with VDOT-based pace information
   */
  private enhanceSegmentDescriptionWithPace(
    baseDescription: string,
    workoutType: WorkoutType,
    targetPace: PaceRange,
    paceZone: keyof DanielsTrainingPaces
  ): string {
    const paceDescription = this.formatPaceDescription(targetPace, paceZone);
    const zoneDescription = this.getZoneDescription(paceZone);
    
    return `${baseDescription} ${paceDescription} (${zoneDescription})`;
  }

  /**
   * Format pace description for display
   */
  private formatPaceDescription(pace: PaceRange, zone: keyof DanielsTrainingPaces): string {
    const formatPace = (p: number) => {
      const minutes = Math.floor(p);
      const seconds = Math.round((p - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const target = formatPace(pace.target);
    const range = `${formatPace(pace.min)}-${formatPace(pace.max)}`;
    
    return `at ${target}/km (${range}/km ${zone.toUpperCase()} pace)`;
  }

  /**
   * Get description for pace zone
   */
  private getZoneDescription(zone: keyof DanielsTrainingPaces): string {
    const descriptions: Record<keyof DanielsTrainingPaces, string> = {
      easy: 'E - Easy/Aerobic',
      marathon: 'M - Marathon',
      threshold: 'T - Threshold/Tempo',
      interval: 'I - Interval/VO2max',
      repetition: 'R - Repetition/Speed'
    };
    
    return descriptions[zone];
  }

  /**
   * Apply phase-specific adjustments to customized segments
   */
  private applyPhaseSpecificAdjustments(
    segment: WorkoutSegment,
    phase: TrainingPhase,
    workoutType: WorkoutType
  ): WorkoutSegment {
    // Base phase: Emphasize volume over intensity
    if (phase === 'base') {
      if (workoutType === 'threshold' || workoutType === 'vo2max') {
        return {
          ...segment,
          duration: Math.max(segment.duration * 0.8, 15), // Reduce duration in base
          intensity: Math.max(segment.intensity - 5, 70)   // Reduce intensity
        };
      }
    }

    // Peak phase: Emphasize quality and race-specific paces
    if (phase === 'peak') {
      if (workoutType === 'vo2max' || workoutType === 'speed') {
        return {
          ...segment,
          intensity: Math.min(segment.intensity + 2, 100) // Increase intensity slightly
        };
      }
    }

    // Taper phase: Maintain intensity but reduce volume
    if (phase === 'taper') {
      return {
        ...segment,
        duration: Math.max(segment.duration * 0.7, 10) // Reduce duration significantly
      };
    }

    return segment;
  }

  /**
   * Estimate VDOT from workout template characteristics
   */
  private estimateVDOTFromTemplate(template: Workout): number {
    // Default VDOT estimation based on workout complexity and target metrics
    const baseVDOT = 45; // Moderate fitness level
    
    // Adjust based on workout type and intensity
    const avgIntensity = template.segments.reduce((sum, seg) => sum + (seg.intensity || 75), 0) / template.segments.length;
    
    if (avgIntensity > 90) return baseVDOT + 5;  // High intensity suggests higher fitness
    if (avgIntensity > 80) return baseVDOT;      // Moderate intensity
    return baseVDOT - 5;                         // Low intensity suggests developing fitness
  }
  
  /**
   * Daniels workout selection prioritizing key workout types
   */
  selectWorkout(type: WorkoutType, phase: TrainingPhase, weekInPhase: number): string {
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES)
      .filter(key => WORKOUT_TEMPLATES[key].type === type);
    
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for workout type: ${type}`);
    }
    
    // Daniels-specific workout selection logic based on training phase and progression
    return this.selectDanielsSpecificWorkout(type, phase, weekInPhase, availableTemplates);
  }

  /**
   * Daniels-specific workout selection algorithm
   * Prioritizes tempo runs, intervals, and repetitions based on phase
   */
  private selectDanielsSpecificWorkout(
    type: WorkoutType, 
    phase: TrainingPhase, 
    weekInPhase: number,
    availableTemplates: string[]
  ): string {
    // Phase-specific workout priorities based on Daniels' methodology
    switch (phase) {
      case 'base':
        return this.selectBasePhaseWorkout(type, weekInPhase, availableTemplates);
      
      case 'build':
        return this.selectBuildPhaseWorkout(type, weekInPhase, availableTemplates);
      
      case 'peak':
        return this.selectPeakPhaseWorkout(type, weekInPhase, availableTemplates);
      
      case 'taper':
        return this.selectTaperPhaseWorkout(type, weekInPhase, availableTemplates);
      
      case 'recovery':
        return this.selectRecoveryPhaseWorkout(type, availableTemplates);
      
      default:
        return availableTemplates[0];
    }
  }

  /**
   * Base phase: Focus on easy running with gradual introduction of quality
   * Week 1-2: Easy only
   * Week 3-4: Add strides and light tempo
   * Week 5+: Introduce threshold work
   */
  private selectBasePhaseWorkout(type: WorkoutType, weekInPhase: number, templates: string[]): string {
    switch (type) {
      case 'easy':
        return 'EASY_AEROBIC';
      
      case 'tempo':
        // Introduce tempo only after 2 weeks
        if (weekInPhase <= 2) {
          return 'EASY_AEROBIC'; // Replace with easy in early base
        }
        return 'TEMPO_CONTINUOUS';
      
      case 'threshold':
        // Threshold only after 4 weeks in base
        if (weekInPhase <= 4) {
          return templates.includes('TEMPO_CONTINUOUS') ? 'TEMPO_CONTINUOUS' : templates[0];
        }
        return this.selectThresholdWorkout(weekInPhase, templates);
      
      case 'speed':
        // Only strides in base phase
        return 'SPEED_200M_REPS';
      
      case 'vo2max':
        // No VO2max work in base phase - substitute with tempo
        return templates.includes('TEMPO_CONTINUOUS') ? 'TEMPO_CONTINUOUS' : templates[0];
      
      case 'long_run':
        return 'LONG_RUN';
      
      default:
        return templates[0];
    }
  }

  /**
   * Build phase: Balance aerobic maintenance with quality work
   * Emphasis on threshold and tempo development
   * Introduction of VO2max work
   */
  private selectBuildPhaseWorkout(type: WorkoutType, weekInPhase: number, templates: string[]): string {
    switch (type) {
      case 'tempo':
        // Tempo is a key workout in build phase
        return 'TEMPO_CONTINUOUS';
      
      case 'threshold':
        // Threshold is the primary focus in build
        return this.selectThresholdWorkout(weekInPhase, templates);
      
      case 'vo2max':
        // Introduce VO2max gradually
        if (weekInPhase <= 2) {
          // Start with shorter intervals
          return templates.includes('VO2MAX_5X3') ? 'VO2MAX_5X3' : templates[0];
        }
        // Progress to longer intervals
        return this.selectVO2MaxWorkout(weekInPhase, templates);
      
      case 'speed':
        // Maintain neuromuscular fitness
        return 'SPEED_200M_REPS';
      
      case 'fartlek':
        // Good transition workout
        return 'FARTLEK_VARIED';
      
      case 'progression':
        // Excellent for building fatigue resistance
        return 'PROGRESSION_3_STAGE';
      
      case 'easy':
        return 'EASY_AEROBIC';
      
      case 'long_run':
        return 'LONG_RUN';
      
      default:
        return templates[0];
    }
  }

  /**
   * Peak phase: Focus on race pace and VO2max
   * Maintain threshold, reduce volume
   * Sharpen with speed work
   */
  private selectPeakPhaseWorkout(type: WorkoutType, weekInPhase: number, templates: string[]): string {
    switch (type) {
      case 'tempo':
        // Tempo at race pace in peak
        return 'TEMPO_CONTINUOUS';
      
      case 'threshold':
        // Maintain threshold fitness with less volume
        return templates.includes('THRESHOLD_PROGRESSION') ? 'THRESHOLD_PROGRESSION' : this.selectThresholdWorkout(weekInPhase, templates);
      
      case 'vo2max':
        // Primary focus in peak phase
        return this.selectVO2MaxWorkout(weekInPhase, templates);
      
      case 'speed':
        // Important for economy and sharpening
        return 'SPEED_200M_REPS';
      
      case 'race_pace':
        // Critical for race preparation
        return 'TEMPO_CONTINUOUS'; // At race pace
      
      case 'fartlek':
        // Good for maintaining fitness with variety
        return 'FARTLEK_VARIED';
      
      case 'easy':
        return 'EASY_AEROBIC';
      
      case 'long_run':
        return 'LONG_RUN';
      
      default:
        return templates[0];
    }
  }

  /**
   * Taper phase: Maintain fitness, reduce volume
   * Focus on race pace feel
   */
  private selectTaperPhaseWorkout(type: WorkoutType, weekInPhase: number, templates: string[]): string {
    switch (type) {
      case 'tempo':
        // Short tempo at race pace
        return 'TEMPO_CONTINUOUS';
      
      case 'threshold':
        // Very limited threshold work
        return 'THRESHOLD_PROGRESSION';
      
      case 'vo2max':
        // Short, sharp intervals only
        return templates.includes('VO2MAX_5X3') ? 'VO2MAX_5X3' : templates[0];
      
      case 'speed':
        // Maintain neuromuscular sharpness
        return 'SPEED_200M_REPS';
      
      case 'easy':
        return 'EASY_AEROBIC';
      
      case 'long_run':
        return 'LONG_RUN';
      
      default:
        return templates[0];
    }
  }

  /**
   * Recovery phase: Easy running only
   */
  private selectRecoveryPhaseWorkout(type: WorkoutType, templates: string[]): string {
    switch (type) {
      case 'recovery':
        return 'RECOVERY_JOG';
      
      case 'easy':
        return 'EASY_AEROBIC';
      
      default:
        // All other workout types become easy in recovery phase
        return 'EASY_AEROBIC';
    }
  }

  /**
   * Select appropriate threshold workout based on progression
   */
  private selectThresholdWorkout(weekInPhase: number, templates: string[]): string {
    // Prioritize 2x20 format for threshold work (classic Daniels workout)
    if (templates.includes('LACTATE_THRESHOLD_2X20')) {
      return 'LACTATE_THRESHOLD_2X20';
    }
    
    // Progressive threshold as alternative
    if (templates.includes('THRESHOLD_PROGRESSION')) {
      return 'THRESHOLD_PROGRESSION';
    }
    
    return templates[0];
  }

  /**
   * Select appropriate VO2max workout with progression
   */
  private selectVO2MaxWorkout(weekInPhase: number, templates: string[]): string {
    // Alternate between 4x4 and 5x3 for variety and adaptation
    if (templates.includes('VO2MAX_4X4') && templates.includes('VO2MAX_5X3')) {
      return weekInPhase % 2 === 0 ? 'VO2MAX_4X4' : 'VO2MAX_5X3';
    }
    
    // Default to available VO2max workout
    return templates.find(t => t.includes('VO2MAX')) || templates[0];
  }
  
  /**
   * Get cached or calculate VDOT-based training paces
   */
  private getVDOTPaces(vdot: number): DanielsTrainingPaces {
    // Cache paces to avoid recalculation
    if (!this.cachedVDOTPaces.has(vdot)) {
      this.cachedVDOTPaces.set(vdot, calculateTrainingPaces(vdot));
    }
    return this.cachedVDOTPaces.get(vdot)!;
  }

  /**
   * Calculate VDOT from run data with caching
   */
  calculateVDOTFromRuns(runs: RunData[]): { vdot: number; paces: DanielsTrainingPaces } {
    return calculateVDOTCached(runs);
  }

  /**
   * Apply VDOT-based pace calculations to workout segments
   */
  private applyVDOTBasedPacing(plannedWorkout: PlannedWorkout, vdot: number): PlannedWorkout {
    const workout = plannedWorkout.workout;
    if (!workout || !workout.segments || vdot < 30 || vdot > 85) {
      return plannedWorkout; // Invalid VDOT or no segments, return unchanged
    }
    
    const danielsPaces = this.getVDOTPaces(vdot);
    const enhancedSegments = workout.segments.map(segment => ({
      ...segment,
      paceTarget: this.getDanielsSpecificPace(segment.zone.name, danielsPaces),
      heartRateTarget: this.calculateVDOTHeartRates(segment.zone.name, vdot),
      description: this.enhanceSegmentWithVDOTInfo(segment.description, segment.zone.name, danielsPaces)
    }));
    
    return {
      ...plannedWorkout,
      workout: {
        ...workout,
        segments: enhancedSegments,
        vdotUsed: vdot,
        paceRecommendations: this.generatePaceRecommendations(danielsPaces)
      }
    };
  }
  
  /**
   * Get Daniels-specific pace for a training zone
   */
  private getDanielsSpecificPace(zoneName: string, paces: DanielsTrainingPaces): { min: number; max: number; target: number } {
    switch (zoneName.toLowerCase()) {
      case 'recovery':
        // Recovery pace is slower than easy pace
        return { 
          min: paces.easy.max * 1.1, 
          max: paces.easy.max * 1.25,
          target: paces.easy.max * 1.15
        };
      case 'easy':
        return paces.easy;
      case 'steady':
        // Steady is between easy and marathon pace
        return {
          min: paces.easy.min,
          max: paces.marathon.max,
          target: (paces.easy.target + paces.marathon.target) / 2
        };
      case 'tempo':
        // Tempo is slightly slower than marathon pace
        return {
          min: paces.marathon.max,
          max: paces.marathon.max * 1.05,
          target: paces.marathon.max * 1.02
        };
      case 'threshold':
        return paces.threshold;
      case 'vo2 max':
      case 'vo2max':
        return paces.interval;
      case 'neuromuscular':
        return paces.repetition;
      default:
        // Default to marathon pace
        return paces.marathon;
    }
  }
  
  /**
   * Calculate VDOT-based heart rate ranges
   */
  private calculateVDOTHeartRates(zoneName: string, vdot: number): { min: number; max: number } {
    // Estimate max HR from VDOT (simplified approach)
    const estimatedMaxHR = 220 - (vdot < 45 ? 35 : vdot < 55 ? 30 : 25); // Rough estimation
    
    switch (zoneName) {
      case 'Recovery':
        return { min: Math.round(estimatedMaxHR * 0.50), max: Math.round(estimatedMaxHR * 0.60) };
      case 'Easy':
        return { min: Math.round(estimatedMaxHR * 0.65), max: Math.round(estimatedMaxHR * 0.75) };
      case 'Steady':
        return { min: Math.round(estimatedMaxHR * 0.75), max: Math.round(estimatedMaxHR * 0.82) };
      case 'Tempo':
        return { min: Math.round(estimatedMaxHR * 0.82), max: Math.round(estimatedMaxHR * 0.87) };
      case 'Threshold':
        return { min: Math.round(estimatedMaxHR * 0.87), max: Math.round(estimatedMaxHR * 0.92) };
      case 'VO2max':
        return { min: Math.round(estimatedMaxHR * 0.92), max: Math.round(estimatedMaxHR * 0.97) };
      case 'Neuromuscular':
        return { min: Math.round(estimatedMaxHR * 0.95), max: Math.round(estimatedMaxHR * 1.00) };
      default:
        return { min: Math.round(estimatedMaxHR * 0.70), max: Math.round(estimatedMaxHR * 0.80) };
    }
  }
  
  /**
   * Enhance segment description with VDOT-specific pace information
   */
  private enhanceSegmentWithVDOTInfo(description: string, zoneName: string, paces: DanielsTrainingPaces): string {
    const pace = this.getDanielsSpecificPace(zoneName, paces);
    const paceStr = this.formatPaceRange(pace);
    
    const zoneDescriptions: Record<string, string> = {
      'easy': `E pace (${paceStr}) - Build aerobic base`,
      'marathon': `M pace (${paceStr}) - Race pace endurance`,
      'threshold': `T pace (${paceStr}) - Lactate threshold`,
      'interval': `I pace (${paceStr}) - VO2max development`,
      'repetition': `R pace (${paceStr}) - Speed and power`
    };
    
    const enhancement = zoneDescriptions[zoneName.toLowerCase()];
    return enhancement ? `${enhancement} - ${description}` : description;
  }

  /**
   * Format pace range for display
   */
  private formatPaceRange(pace: { min: number; max: number; target: number }): string {
    const formatTime = (minutes: number) => {
      const mins = Math.floor(minutes);
      const secs = Math.round((minutes - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    if (Math.abs(pace.min - pace.max) < 0.1) {
      return formatTime(pace.target);
    }
    return `${formatTime(pace.min)}-${formatTime(pace.max)}`;
  }

  /**
   * Generate pace recommendations for the workout
   */
  private generatePaceRecommendations(paces: DanielsTrainingPaces): Record<string, string> {
    return {
      easy: `E: ${this.formatPaceRange(paces.easy)} - Conversational pace, aerobic base`,
      marathon: `M: ${this.formatPaceRange(paces.marathon)} - Goal marathon pace`,
      threshold: `T: ${this.formatPaceRange(paces.threshold)} - Comfortably hard, 1-hour effort`,
      interval: `I: ${this.formatPaceRange(paces.interval)} - Hard intervals, VO2max`,
      repetition: `R: ${this.formatPaceRange(paces.repetition)} - Short, fast repeats`
    };
  }

  /**
   * Estimate VDOT from training plan characteristics
   */
  private estimateVDOTFromPlan(plan: TrainingPlan): number {
    // Analyze plan characteristics to estimate VDOT
    const weeklyDistance = plan.summary.totalDistance / plan.summary.totalWeeks;
    const workoutIntensity = plan.summary.phases.reduce((avg, phase) => 
      avg + phase.intensityDistribution.hard, 0) / plan.summary.phases.length;
    
    // Basic VDOT estimation based on volume and intensity
    let estimatedVDOT = 35; // Base for beginners
    
    if (weeklyDistance > 80) estimatedVDOT += 15;
    else if (weeklyDistance > 60) estimatedVDOT += 10;
    else if (weeklyDistance > 40) estimatedVDOT += 5;
    
    if (workoutIntensity > 20) estimatedVDOT += 10;
    else if (workoutIntensity > 15) estimatedVDOT += 5;
    
    return Math.min(65, estimatedVDOT); // Cap at reasonable maximum
  }

  /**
   * Calculate actual intensity distribution from plan
   */
  private calculateActualIntensityDistribution(plan: TrainingPlan): { easy: number; moderate: number; hard: number } {
    let easyMinutes = 0;
    let moderateMinutes = 0;
    let hardMinutes = 0;
    
    // Check if plan has workouts array
    const workouts = plan.workouts || [];
    
    workouts.forEach(workout => {
      // Ensure workout and segments exist
      if (workout?.workout?.segments) {
        workout.workout.segments.forEach(segment => {
          if (segment.intensity <= 75) {
            easyMinutes += segment.duration;
          } else if (segment.intensity <= 85) {
            moderateMinutes += segment.duration;
          } else {
            hardMinutes += segment.duration;
          }
        });
      }
    });
    
    const totalMinutes = easyMinutes + moderateMinutes + hardMinutes;
    if (totalMinutes === 0) return { easy: 80, moderate: 15, hard: 5 }; // Default
    
    return {
      easy: Math.round((easyMinutes / totalMinutes) * 100),
      moderate: Math.round((moderateMinutes / totalMinutes) * 100),
      hard: Math.round((hardMinutes / totalMinutes) * 100)
    };
  }

  /**
   * Update training paces when fitness changes
   */
  updateVDOT(newVDOT: number): DanielsTrainingPaces {
    if (newVDOT < 30 || newVDOT > 85) {
      throw new Error(`Invalid VDOT: ${newVDOT}. Must be between 30 and 85.`);
    }
    
    // Clear old cached pace and calculate new one
    this.cachedVDOTPaces.delete(newVDOT);
    const newPaces = this.getVDOTPaces(newVDOT);
    
    return newPaces;
  }

  /**
   * Enforce 80/20 intensity distribution across plan
   */
  enforce8020Distribution(plan: TrainingPlan): TrainingPlan {
    const actualDistribution = this.calculateActualIntensityDistribution(plan);
    
    // If already close to 80/20, no adjustment needed
    if (actualDistribution.easy >= 78 && actualDistribution.easy <= 82) {
      return plan;
    }
    
    // Adjust workouts to achieve 80/20 distribution
    const adjustedWorkouts = plan.workouts.map(workout => {
      if (actualDistribution.easy < 78) {
        // Need more easy running - convert some moderate/hard to easy
        return this.convertToEasierIntensity(workout);
      } else if (actualDistribution.easy > 82) {
        // Need more quality - add some intensity to select workouts
        return this.addQualityToWorkout(workout);
      }
      return workout;
    });
    
    return {
      ...plan,
      workouts: adjustedWorkouts
    };
  }

  /**
   * Convert workout to easier intensity for 80/20 compliance
   */
  private convertToEasierIntensity(workout: PlannedWorkout): PlannedWorkout {
    const modifiedSegments = workout.workout.segments.map(segment => {
      if (segment.intensity > 75 && segment.intensity < 90) {
        // Convert moderate efforts to easy
        return {
          ...segment,
          intensity: 70,
          zone: TRAINING_ZONES.EASY,
          description: `Easy ${segment.description.toLowerCase()}`
        };
      }
      return segment;
    });
    
    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: modifiedSegments
      }
    };
  }

  /**
   * Add quality to workout for better distribution
   */
  private addQualityToWorkout(workout: PlannedWorkout): PlannedWorkout {
    // Only add quality to certain workout types and not more than 2 per week
    if (workout.workout.type === 'easy' && Math.random() > 0.7) {
      const totalDuration = workout.workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
      
      if (totalDuration > 45) {
        // Add tempo segment to middle of easy run
        const segments = [
          {
            ...workout.workout.segments[0],
            duration: totalDuration * 0.4,
            description: 'Easy warm-up'
          },
          {
            duration: totalDuration * 0.2,
            intensity: 85,
            zone: TRAINING_ZONES.TEMPO,
            description: 'Tempo segment'
          },
          {
            ...workout.workout.segments[0],
            duration: totalDuration * 0.4,
            description: 'Easy cool-down'
          }
        ];
        
        return {
          ...workout,
          workout: {
            ...workout.workout,
            type: 'tempo',
            segments
          }
        };
      }
    }
    
    return workout;
  }

  /**
   * Comprehensive intensity distribution validation and enforcement system
   */
  
  /**
   * Validate and enforce 80/20 intensity distribution with phase-specific targets
   */
  validateAndEnforceIntensityDistribution(plan: TrainingPlan): TrainingPlan {
    const phaseSpecificPlan = this.applyPhaseSpecificTargets(plan);
    const validatedPlan = this.validateIntensityDistribution(phaseSpecificPlan);
    
    if (!validatedPlan.isValid) {
      return this.autoAdjustIntensityDistribution(phaseSpecificPlan, validatedPlan.violations);
    }
    
    return phaseSpecificPlan;
  }

  /**
   * Apply phase-specific intensity targets for Daniels methodology
   */
  private applyPhaseSpecificTargets(plan: TrainingPlan): TrainingPlan {
    const adjustedBlocks = plan.blocks.map(block => {
      const targetDistribution = this.getPhaseIntensityTarget(block.phase);
      const adjustedMicrocycles = block.microcycles.map(microcycle => ({
        ...microcycle,
        workouts: this.adjustWorkoutsToTargetDistribution(microcycle.workouts, targetDistribution, block.phase)
      }));
      
      return {
        ...block,
        microcycles: adjustedMicrocycles,
        targetIntensityDistribution: targetDistribution
      };
    });

    return {
      ...plan,
      blocks: adjustedBlocks
    };
  }

  /**
   * Get phase-specific intensity targets for Daniels methodology
   */
  private getPhaseIntensityTarget(phase: TrainingPhase): IntensityDistribution {
    const targets = METHODOLOGY_PHASE_TARGETS.daniels;
    return targets[phase] || { easy: 80, moderate: 5, hard: 15 }; // Default 80/20
  }

  /**
   * Adjust workouts to meet target intensity distribution
   */
  private adjustWorkoutsToTargetDistribution(
    workouts: PlannedWorkout[], 
    target: IntensityDistribution, 
    phase: TrainingPhase
  ): PlannedWorkout[] {
    const currentDistribution = this.calculateWorkoutGroupDistribution(workouts);
    const adjustmentNeeded = this.calculateDistributionAdjustment(currentDistribution, target);
    
    if (Math.abs(adjustmentNeeded.easy) <= 2) {
      return workouts; // Already within 2% tolerance
    }

    return this.applyDistributionAdjustments(workouts, adjustmentNeeded, phase);
  }

  /**
   * Calculate current intensity distribution from workout group
   */
  private calculateWorkoutGroupDistribution(workouts: PlannedWorkout[]): IntensityDistribution {
    let easyMinutes = 0;
    let moderateMinutes = 0;
    let hardMinutes = 0;

    workouts.forEach(workout => {
      if (workout?.workout?.segments) {
        workout.workout.segments.forEach(segment => {
          const intensity = segment.intensity;
          if (intensity <= 75) {
            easyMinutes += segment.duration;
          } else if (intensity <= 85) {
            moderateMinutes += segment.duration;
          } else {
            hardMinutes += segment.duration;
          }
        });
      }
    });

    const totalMinutes = easyMinutes + moderateMinutes + hardMinutes;
    if (totalMinutes === 0) return { easy: 80, moderate: 5, hard: 15 };

    return {
      easy: Math.round((easyMinutes / totalMinutes) * 100),
      moderate: Math.round((moderateMinutes / totalMinutes) * 100),
      hard: Math.round((hardMinutes / totalMinutes) * 100)
    };
  }

  /**
   * Calculate what adjustments are needed to meet target distribution
   */
  private calculateDistributionAdjustment(
    current: IntensityDistribution, 
    target: IntensityDistribution
  ): IntensityDistribution {
    return {
      easy: target.easy - current.easy,
      moderate: target.moderate - current.moderate,
      hard: target.hard - current.hard
    };
  }

  /**
   * Apply distribution adjustments to workouts
   */
  private applyDistributionAdjustments(
    workouts: PlannedWorkout[], 
    adjustment: IntensityDistribution, 
    phase: TrainingPhase
  ): PlannedWorkout[] {
    const adjustedWorkouts = [...workouts];
    
    // If we need more easy running
    if (adjustment.easy > 0) {
      adjustedWorkouts.forEach((workout, index) => {
        if (this.canConvertToEasier(workout)) {
          adjustedWorkouts[index] = this.convertToEasierIntensity(workout);
        }
      });
    }
    
    // If we need more hard running (but still maintain 80/20 for Daniels)
    if (adjustment.hard > 0 && phase !== 'base') {
      const eligibleWorkouts = adjustedWorkouts.filter(w => this.canAddQuality(w));
      const workoutsToModify = Math.min(2, eligibleWorkouts.length); // Max 2 quality workouts/week
      
      for (let i = 0; i < workoutsToModify; i++) {
        const workoutIndex = adjustedWorkouts.indexOf(eligibleWorkouts[i]);
        adjustedWorkouts[workoutIndex] = this.addQualityToWorkout(eligibleWorkouts[i]);
      }
    }

    return adjustedWorkouts;
  }

  /**
   * Check if workout can be converted to easier intensity
   */
  private canConvertToEasier(workout: PlannedWorkout): boolean {
    if (!workout?.workout?.segments) return false;
    
    const hasModerateIntensity = workout.workout.segments.some(
      segment => segment.intensity > 75 && segment.intensity < 90
    );
    
    return hasModerateIntensity && workout.workout.type !== 'threshold' && workout.workout.type !== 'vo2max';
  }

  /**
   * Check if workout can have quality added
   */
  private canAddQuality(workout: PlannedWorkout): boolean {
    if (!workout?.workout?.segments) return false;
    
    const totalDuration = workout.workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
    const isEasyRun = workout.workout.type === 'easy';
    const isLongEnough = totalDuration >= 45;
    
    return isEasyRun && isLongEnough;
  }

  /**
   * Comprehensive intensity distribution validation
   */
  private validateIntensityDistribution(plan: TrainingPlan): {
    isValid: boolean;
    violations: IntensityDistributionViolation[];
    overall: IntensityDistribution;
    phases: Record<string, IntensityDistribution>;
  } {
    const violations: IntensityDistributionViolation[] = [];
    const phaseDistributions: Record<string, IntensityDistribution> = {};
    
    // Validate each phase
    plan.blocks.forEach(block => {
      const phaseDistribution = this.calculateActualIntensityDistribution({
        ...plan,
        workouts: plan.workouts.filter(w => 
          w.date >= block.startDate && w.date <= block.endDate
        )
      });
      
      phaseDistributions[`${block.phase}-${block.startDate}`] = phaseDistribution;
      
      const target = this.getPhaseIntensityTarget(block.phase);
      const phaseViolations = this.checkDistributionViolations(
        phaseDistribution, 
        target, 
        block.phase
      );
      
      violations.push(...phaseViolations);
    });

    // Calculate overall distribution
    const overallDistribution = this.calculateActualIntensityDistribution(plan);
    const overallTarget = INTENSITY_MODELS.polarized; // Daniels uses polarized model
    const overallViolations = this.checkDistributionViolations(
      overallDistribution,
      overallTarget,
      'overall'
    );
    
    violations.push(...overallViolations);

    return {
      isValid: violations.length === 0,
      violations,
      overall: overallDistribution,
      phases: phaseDistributions
    };
  }

  /**
   * Check for distribution violations
   */
  private checkDistributionViolations(
    actual: IntensityDistribution,
    target: IntensityDistribution,
    phase: TrainingPhase | 'overall'
  ): IntensityDistributionViolation[] {
    const violations: IntensityDistributionViolation[] = [];
    const tolerance = 5; // 5% tolerance

    // Check easy running percentage
    if (actual.easy < target.easy - tolerance) {
      violations.push({
        type: 'insufficient_easy',
        phase,
        actual: actual.easy,
        target: target.easy,
        difference: target.easy - actual.easy,
        severity: this.calculateViolationSeverity(target.easy - actual.easy)
      });
    }

    // Check hard running percentage (don't exceed targets significantly)
    if (actual.hard > target.hard + tolerance) {
      violations.push({
        type: 'excessive_hard',
        phase,
        actual: actual.hard,
        target: target.hard,
        difference: actual.hard - target.hard,
        severity: this.calculateViolationSeverity(actual.hard - target.hard)
      });
    }

    return violations;
  }

  /**
   * Calculate violation severity
   */
  private calculateViolationSeverity(difference: number): 'low' | 'medium' | 'high' | 'critical' {
    const absDiff = Math.abs(difference);
    if (absDiff <= 5) return 'low';
    if (absDiff <= 10) return 'medium';
    if (absDiff <= 15) return 'high';
    return 'critical';
  }

  /**
   * Auto-adjust intensity distribution to fix violations
   */
  private autoAdjustIntensityDistribution(
    plan: TrainingPlan, 
    violations: IntensityDistributionViolation[]
  ): TrainingPlan {
    let adjustedPlan = { ...plan };

    // Sort violations by severity
    const sortedViolations = violations.sort((a, b) => {
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    // Address each violation
    sortedViolations.forEach(violation => {
      adjustedPlan = this.fixIntensityViolation(adjustedPlan, violation);
    });

    // Verify the adjustments worked
    const revalidation = this.validateIntensityDistribution(adjustedPlan);
    if (!revalidation.isValid && revalidation.violations.length < violations.length) {
      // Made progress, try one more round
      return this.autoAdjustIntensityDistribution(adjustedPlan, revalidation.violations);
    }

    return adjustedPlan;
  }

  /**
   * Fix specific intensity distribution violation
   */
  private fixIntensityViolation(
    plan: TrainingPlan, 
    violation: IntensityDistributionViolation
  ): TrainingPlan {
    const adjustedWorkouts = plan.workouts.map(workout => {
      switch (violation.type) {
        case 'insufficient_easy':
          return this.convertWorkoutToEasier(workout, violation);
        case 'excessive_hard':
          return this.reduceWorkoutIntensity(workout, violation);
        default:
          return workout;
      }
    });

    return {
      ...plan,
      workouts: adjustedWorkouts
    };
  }

  /**
   * Convert workout to easier intensity to increase easy percentage
   */
  private convertWorkoutToEasier(
    workout: PlannedWorkout, 
    violation: IntensityDistributionViolation
  ): PlannedWorkout {
    if (!this.shouldAdjustWorkout(workout, violation)) {
      return workout;
    }

    const modifiedSegments = workout.workout.segments.map(segment => {
      // Convert moderate intensity to easy
      if (segment.intensity > 75 && segment.intensity <= 85) {
        return {
          ...segment,
          intensity: 70,
          zone: TRAINING_ZONES.EASY,
          description: this.updateSegmentDescription(segment.description, 'easier')
        };
      }
      return segment;
    });

    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: modifiedSegments,
        type: 'easy' as WorkoutType,
        adaptationTarget: 'Aerobic base building, 80/20 compliance'
      }
    };
  }

  /**
   * Reduce workout intensity to decrease hard percentage
   */
  private reduceWorkoutIntensity(
    workout: PlannedWorkout, 
    violation: IntensityDistributionViolation
  ): PlannedWorkout {
    if (!this.shouldAdjustWorkout(workout, violation) || violation.severity === 'low') {
      return workout;
    }

    const modifiedSegments = workout.workout.segments.map(segment => {
      // Reduce high intensity to moderate or easy
      if (segment.intensity > 85) {
        const newIntensity = violation.severity === 'critical' ? 70 : 80;
        return {
          ...segment,
          intensity: newIntensity,
          zone: newIntensity <= 75 ? TRAINING_ZONES.EASY : TRAINING_ZONES.STEADY,
          description: this.updateSegmentDescription(segment.description, 'reduced')
        };
      }
      return segment;
    });

    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: modifiedSegments,
        adaptationTarget: `${workout.workout.adaptationTarget} (intensity reduced for 80/20 compliance)`
      }
    };
  }

  /**
   * Check if workout should be adjusted for violation
   */
  private shouldAdjustWorkout(
    workout: PlannedWorkout, 
    violation: IntensityDistributionViolation
  ): boolean {
    // Don't adjust race workouts or key workouts unless violation is critical
    if (workout.workout.type === 'race_pace' || workout.workout.type === 'time_trial') {
      return violation.severity === 'critical';
    }

    // Always adjust for high severity violations
    if (violation.severity === 'high' || violation.severity === 'critical') {
      return true;
    }

    // For lower severity, only adjust easy/steady workouts
    return ['easy', 'steady', 'recovery'].includes(workout.workout.type);
  }

  /**
   * Update segment description for intensity changes
   */
  private updateSegmentDescription(description: string, adjustment: 'easier' | 'reduced'): string {
    const prefix = adjustment === 'easier' ? 'Easy ' : 'Reduced intensity ';
    return `${prefix}${description.toLowerCase()} (80/20 compliance)`;
  }

  /**
   * Generate intensity distribution report
   */
  generateIntensityReport(plan: TrainingPlan): IntensityDistributionReport {
    const validation = this.validateIntensityDistribution(plan);
    const recommendations = this.generateIntensityRecommendations(validation);
    
    return {
      overall: validation.overall,
      target: INTENSITY_MODELS.polarized,
      phases: validation.phases,
      violations: validation.violations,
      recommendations,
      compliance: this.calculateComplianceScore(validation),
      methodology: 'daniels'
    };
  }

  /**
   * Generate intensity distribution recommendations
   */
  private generateIntensityRecommendations(
    validation: ReturnType<typeof this.validateIntensityDistribution>
  ): string[] {
    const recommendations: string[] = [];

    if (validation.overall.easy < 75) {
      recommendations.push('Increase easy running volume to build aerobic base');
      recommendations.push('Convert some moderate workouts to easy runs');
    }

    if (validation.overall.hard > 20) {
      recommendations.push('Reduce high-intensity work to prevent overtraining');
      recommendations.push('Focus on quality over quantity for hard workouts');
    }

    validation.violations.forEach(violation => {
      if (violation.severity === 'high' || violation.severity === 'critical') {
        recommendations.push(
          `Critical: ${violation.type} in ${violation.phase} phase - adjust immediately`
        );
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Intensity distribution looks good - maintain current balance');
    }

    return recommendations;
  }

  /**
   * Calculate compliance score (0-100)
   */
  private calculateComplianceScore(
    validation: ReturnType<typeof this.validateIntensityDistribution>
  ): number {
    const target = INTENSITY_MODELS.polarized;
    const actual = validation.overall;

    // Calculate deviations
    const easyDeviation = Math.abs(actual.easy - target.easy);
    const hardDeviation = Math.abs(actual.hard - target.hard);
    
    // Score based on deviations (lower is better)
    const easyScore = Math.max(0, 100 - (easyDeviation * 2));
    const hardScore = Math.max(0, 100 - (hardDeviation * 3)); // Weight hard deviation more
    
    // Penalty for violations
    const violationPenalty = validation.violations.reduce((penalty, violation) => {
      const severityPenalty = { low: 2, medium: 5, high: 10, critical: 20 };
      return penalty + severityPenalty[violation.severity];
    }, 0);

    const baseScore = (easyScore + hardScore) / 2;
    return Math.max(0, Math.round(baseScore - violationPenalty));
  }
  
  /**
   * Adjust intensity specifically for Daniels methodology
   */
  private adjustIntensityForDaniels(baseIntensity: number, workoutType: WorkoutType, phase: TrainingPhase): number {
    let adjustment = 1.0;
    
    // Daniels emphasizes precise intensity control
    switch (workoutType) {
      case 'easy':
        // Keep easy runs truly easy (65-75% max HR)
        adjustment = phase === 'base' ? 0.90 : 0.95;
        break;
      case 'tempo':
        // Tempo = comfortably hard effort (82-87% max HR)
        adjustment = 1.00;
        break;
      case 'threshold':
        // Threshold = sustainable hard effort (87-92% max HR)
        adjustment = 1.05;
        break;
      case 'vo2max':
        // VO2max intervals at 95-100% max HR
        adjustment = phase === 'peak' ? 1.10 : 1.05;
        break;
      case 'speed':
        // Neuromuscular power work
        adjustment = 1.00; // Keep at template intensity
        break;
      default:
        adjustment = 1.00;
    }
    
    const adjustedIntensity = baseIntensity * adjustment;
    return Math.max(40, Math.min(100, Math.round(adjustedIntensity)));
  }
  
  /**
   * Enhance segment descriptions with Daniels terminology
   */
  private enhanceSegmentDescription(baseDescription: string, workoutType: WorkoutType): string {
    const danielsTerms: Partial<Record<WorkoutType, string>> = {
      'recovery': 'Easy jog, focus on form and relaxation',
      'easy': 'Conversational pace, build aerobic base',
      'steady': 'Steady aerobic effort, controlled breathing',
      'tempo': 'Comfortably hard, controlled tempo effort',
      'threshold': 'Threshold pace, sustainable hard effort',
      'vo2max': 'VO2max intensity, hard but controlled',
      'speed': 'Neuromuscular power, focus on form',
      'hill_repeats': 'Hill power, strong uphill drive',
      'fartlek': 'Speed play, varied intensity surges',
      'progression': 'Progressive buildup, finish strong',
      'long_run': 'Aerobic base building, steady effort',
      'race_pace': 'Goal race pace, rhythm practice',
      'time_trial': 'All-out effort, race simulation',
      'cross_training': 'Non-impact aerobic exercise',
      'strength': 'Strength training for runners'
    };
    
    const enhancement = danielsTerms[workoutType];
    return enhancement ? `${enhancement} - ${baseDescription}` : baseDescription;
  }
  
  /**
   * Get Daniels-specific adaptation targets
   */
  private getDanielsAdaptationTarget(workoutType: WorkoutType, phase: TrainingPhase): string {
    const adaptationTargets: Partial<Record<WorkoutType, Record<TrainingPhase, string>>> = {
      'easy': {
        'base': 'Build aerobic base, improve fat oxidation',
        'build': 'Maintain aerobic fitness, aid recovery',
        'peak': 'Active recovery between hard sessions',
        'taper': 'Maintain fitness, promote recovery',
        'recovery': 'Full recovery, blood flow maintenance'
      },
      'tempo': {
        'base': 'Develop aerobic power, lactate clearance',
        'build': 'Improve tempo pace, aerobic strength',
        'peak': 'Race pace practice, lactate management',
        'taper': 'Maintain tempo fitness, race prep',
        'recovery': 'Light tempo work for fitness maintenance'
      },
      'threshold': {
        'base': 'Develop lactate threshold, aerobic power',
        'build': 'Improve threshold pace, lactate tolerance',
        'peak': 'Race-specific threshold work',
        'taper': 'Maintain threshold fitness',
        'recovery': 'Easy threshold maintenance'
      },
      'vo2max': {
        'base': 'Develop VO2max, running economy',
        'build': 'Improve VO2max, neuromuscular power',
        'peak': 'Peak VO2max fitness, race sharpening',
        'taper': 'Maintain VO2max, race readiness',
        'recovery': 'Light VO2max maintenance'
      }
    };
    
    return adaptationTargets[workoutType]?.[phase] || 
           `${workoutType} training adaptation for ${phase} phase`;
  }
}

/**
 * Aerobic base calculator for Lydiard methodology
 * Enforces 85%+ easy running and time-based training conversion
 */
class AerobicBaseCalculator {
  private readonly LYDIARD_EASY_TARGET = 85; // 85% minimum easy running
  private readonly MAX_HARD_PERCENTAGE = 15; // Maximum hard running allowed

  /**
   * Enforce 85%+ easy running distribution in plan
   */
  enforceAerobicBase(workouts: PlannedWorkout[]): PlannedWorkout[] {
    if (workouts.length === 0) return workouts;

    const currentDistribution = this.calculateIntensityDistribution(workouts);
    
    if (currentDistribution.easy >= this.LYDIARD_EASY_TARGET) {
      return workouts; // Already compliant
    }

    // Convert some harder workouts to easy to meet 85% target
    return this.convertToAerobicBase(workouts, currentDistribution);
  }

  /**
   * Calculate current intensity distribution
   */
  private calculateIntensityDistribution(workouts: PlannedWorkout[]): IntensityDistribution {
    if (workouts.length === 0) return { easy: 100, moderate: 0, hard: 0 };

    const totalDuration = workouts.reduce((sum, w) => sum + (w.targetMetrics.duration || 60), 0);
    let easyDuration = 0;
    let moderateDuration = 0;
    let hardDuration = 0;

    workouts.forEach(workout => {
      const duration = workout.targetMetrics.duration || 60;
      const intensity = workout.targetMetrics.intensity || 70;

      if (intensity <= 75) {
        easyDuration += duration;
      } else if (intensity <= 85) {
        moderateDuration += duration;
      } else {
        hardDuration += duration;
      }
    });

    return {
      easy: Math.round((easyDuration / totalDuration) * 100),
      moderate: Math.round((moderateDuration / totalDuration) * 100),
      hard: Math.round((hardDuration / totalDuration) * 100)
    };
  }

  /**
   * Convert workouts to achieve aerobic base targets
   */
  private convertToAerobicBase(workouts: PlannedWorkout[], currentDistribution: IntensityDistribution): PlannedWorkout[] {
    const targetEasyPercentage = this.LYDIARD_EASY_TARGET;
    const currentEasyPercentage = currentDistribution.easy;
    
    if (currentEasyPercentage >= targetEasyPercentage) {
      return workouts;
    }

    // Calculate how much intensity needs to be reduced
    const deficitPercentage = targetEasyPercentage - currentEasyPercentage;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.targetMetrics.duration || 60), 0);
    const durationToConvert = (deficitPercentage / 100) * totalDuration;

    // Convert hardest workouts to easier efforts
    const sortedWorkouts = [...workouts].sort((a, b) => 
      (b.targetMetrics.intensity || 70) - (a.targetMetrics.intensity || 70)
    );

    let remainingToConvert = durationToConvert;
    const convertedWorkouts = [...workouts];

    for (let i = 0; i < sortedWorkouts.length && remainingToConvert > 0; i++) {
      const workout = sortedWorkouts[i];
      const workoutIndex = workouts.findIndex(w => w === workout);
      const workoutDuration = workout.targetMetrics.duration || 60;
      const currentIntensity = workout.targetMetrics.intensity || 70;

      if (currentIntensity > 75) { // Only convert non-easy workouts
        // Convert this workout to easy intensity
        convertedWorkouts[workoutIndex] = {
          ...workout,
          workout: this.convertToEasyWorkout(workout.workout),
          targetMetrics: {
            ...workout.targetMetrics,
            intensity: 70, // Easy intensity
            tss: Math.round((workout.targetMetrics.tss || 50) * 0.7) // Reduce TSS accordingly
          }
        };
        
        remainingToConvert = Math.max(0, remainingToConvert - workoutDuration);
      }
    }

    return convertedWorkouts;
  }

  /**
   * Convert a workout to easy aerobic equivalent
   */
  private convertToEasyWorkout(workout: Workout): Workout {
    return {
      ...workout,
      type: 'easy',
      segments: workout.segments.map(segment => ({
        ...segment,
        intensity: 70, // Easy intensity
        description: `Easy aerobic - ${segment.description} (converted for aerobic base)`
      })),
      adaptationTarget: 'Aerobic base development, mitochondrial adaptation',
      estimatedTSS: Math.round(workout.estimatedTSS * 0.7)
    };
  }

  /**
   * Convert pace-based training to time/effort-based training
   */
  convertToTimeBased(workout: Workout): Workout {
    const timeBased = {
      ...workout,
      segments: workout.segments.map(segment => ({
        ...segment,
        description: this.convertToEffortDescription(segment.description, segment.intensity)
      })),
      adaptationTarget: 'Aerobic development through effort-based training'
    };

    return timeBased;
  }

  /**
   * Convert segment description to effort-based terminology
   */
  private convertToEffortDescription(description: string, intensity: number): string {
    let effortLevel: string;
    
    if (intensity <= 70) {
      effortLevel = 'Very easy effort - conversational, nose breathing only';
    } else if (intensity <= 75) {
      effortLevel = 'Easy effort - comfortable, can talk in full sentences';
    } else if (intensity <= 80) {
      effortLevel = 'Steady effort - comfortably hard, some breathing effort';
    } else if (intensity <= 87) {
      effortLevel = 'Moderate effort - controlled discomfort, rhythmic breathing';
    } else {
      effortLevel = 'Hard effort - significant breathing, focused effort';
    }

    return `${description} at ${effortLevel}`;
  }

  /**
   * Calculate long run progression up to 22+ miles
   */
  calculateLongRunProgression(currentWeek: number, totalWeeks: number, baseDistance: number = 10): number {
    // Lydiard's long run progression: gradual build to 22+ miles over aerobic base phase
    const targetDistance = 22; // Target 22+ mile long runs
    const progressionRate = (targetDistance - baseDistance) / (totalWeeks * 0.7); // Build over 70% of base phase
    
    // Conservative progression with plateau weeks
    let progressedDistance = baseDistance + (currentWeek * progressionRate);
    
    // Add plateau weeks every 3 weeks for adaptation
    if (currentWeek % 3 === 0 && currentWeek > 3) {
      progressedDistance = Math.max(baseDistance, progressedDistance - progressionRate);
    }
    
    // Cap at reasonable maximum
    return Math.min(progressedDistance, targetDistance);
  }

  /**
   * Validate aerobic base compliance
   */
  validateAerobicBase(workouts: PlannedWorkout[]): AerobicBaseReport {
    const distribution = this.calculateIntensityDistribution(workouts);
    const isCompliant = distribution.easy >= this.LYDIARD_EASY_TARGET;
    
    const violations: string[] = [];
    const recommendations: string[] = [];
    
    if (!isCompliant) {
      violations.push(`Easy running: ${distribution.easy}% (target: ${this.LYDIARD_EASY_TARGET}%+)`);
      recommendations.push(`Increase easy running by ${this.LYDIARD_EASY_TARGET - distribution.easy}%`);
      recommendations.push('Convert some tempo/threshold workouts to easy aerobic runs');
      recommendations.push('Focus on time on feet rather than pace');
    }
    
    if (distribution.hard > this.MAX_HARD_PERCENTAGE) {
      violations.push(`Hard running: ${distribution.hard}% (maximum: ${this.MAX_HARD_PERCENTAGE}%)`);
      recommendations.push('Reduce intensity of hard workouts');
      recommendations.push('Replace some intervals with steady state runs');
    }

    return {
      distribution,
      isCompliant,
      violations,
      recommendations,
      methodology: 'lydiard'
    };
  }
}

/**
 * Aerobic base validation report interface
 */
interface AerobicBaseReport {
  distribution: IntensityDistribution;
  isCompliant: boolean;
  violations: string[];
  recommendations: string[];
  methodology: string;
}

interface WeeklyLongRun {
  week: number;
  phase: TrainingPhase;
  distance: number; // in miles
  effort: string;
  focus: string;
}

interface LongRunProgression {
  totalWeeks: number;
  basePhaseWeeks: number;
  targetDistance: number; // target max distance in miles
  currentMax: number; // current max distance in miles
  weeklyProgression: WeeklyLongRun[];
}

/**
 * Lydiard Hill Training Generator
 * Implements Arthur Lydiard's specific hill repeat protocols for strength building
 */
class LydiardHillGenerator {
  /**
   * Generate Lydiard-specific hill workout based on phase and progression
   */
  generateHillWorkout(phase: TrainingPhase, weekInPhase: number, duration: number = 45): Workout {
    const hillProfile = this.getHillProfileForPhase(phase, weekInPhase);
    const segments = this.createHillSegments(hillProfile, duration);
    
    return {
      id: `lydiard-hill-${phase}-week${weekInPhase}`,
      name: `Lydiard ${hillProfile.name}`,
      type: 'hill_repeats',
      primaryZone: hillProfile.primaryZone,
      segments,
      adaptationTarget: hillProfile.adaptationTarget,
      estimatedTSS: this.calculateHillTSS(segments),
      recoveryTime: this.calculateHillRecovery(phase, segments.length),
      metadata: {
        methodology: 'lydiard',
        hillType: hillProfile.type,
        phase,
        weekInPhase,
        lydiardPrinciples: hillProfile.principles
      }
    };
  }

  /**
   * Get hill profile specific to Lydiard methodology and training phase
   */
  private getHillProfileForPhase(phase: TrainingPhase, weekInPhase: number): LydiardHillProfile {
    switch (phase) {
      case 'base':
        return {
          type: 'aerobic_strength',
          name: 'Aerobic Hill Strengthening',
          primaryZone: TRAINING_ZONES.STEADY,
          intensity: 75 + (weekInPhase * 2), // Progressive intensity 75-85%
          duration: 3 + Math.floor(weekInPhase / 2), // 3-6 minute efforts
          recovery: 90, // 1.5 minute recoveries
          repeats: Math.min(4 + weekInPhase, 8), // 4-8 repeats
          gradient: '6-8%',
          effort: 'Strong but controlled aerobic effort',
          adaptationTarget: 'Leg strength, running economy, aerobic power development',
          principles: [
            'Build strength through sustained hill efforts',
            'Focus on form and biomechanical efficiency',
            'Aerobic emphasis - not anaerobic stress',
            'Progressive volume and intensity over weeks'
          ]
        };
        
      case 'build':
        return {
          type: 'anaerobic_power',
          name: 'Hill Power Development',
          primaryZone: TRAINING_ZONES.VO2_MAX,
          intensity: 88 + weekInPhase, // Higher intensity 88-92%
          duration: 2 + Math.floor(weekInPhase / 3), // 2-4 minute efforts
          recovery: 120, // 2 minute full recoveries
          repeats: Math.min(6 + weekInPhase, 10), // 6-10 repeats
          gradient: '8-12%',
          effort: 'Hard uphill drive with controlled form',
          adaptationTarget: 'Anaerobic power, lactate tolerance, neuromuscular coordination',
          principles: [
            'Develop anaerobic power through hill efforts',
            'Maintain strong uphill drive technique',
            'Build lactate tolerance progressively',
            'Prepare for speed development phase'
          ]
        };
        
      case 'peak':
        return {
          type: 'speed_hills',
          name: 'Hill Speed Coordination',
          primaryZone: TRAINING_ZONES.VO2_MAX,
          intensity: 92 + weekInPhase, // Very high intensity 92-95%
          duration: 1 + (weekInPhase * 0.5), // 1-2.5 minute efforts
          recovery: 180, // 3 minute full recoveries
          repeats: Math.min(8 + weekInPhase, 12), // 8-12 shorter efforts
          gradient: '10-15%',
          effort: 'Fast uphill running with coordination focus',
          adaptationTarget: 'Speed coordination, neuromuscular power, race preparation',
          principles: [
            'Fast hill running for speed development',
            'Coordination and economy at speed',
            'Race-specific power development',
            'Final sharpening of leg speed'
          ]
        };
        
      case 'taper':
        return {
          type: 'maintenance',
          name: 'Hill Maintenance',
          primaryZone: TRAINING_ZONES.TEMPO,
          intensity: 80, // Moderate intensity
          duration: 2, // Short 2-minute efforts
          recovery: 120, // 2 minute recoveries
          repeats: 4, // Just 4 repeats
          gradient: '6-8%',
          effort: 'Moderate hill effort to maintain feel',
          adaptationTarget: 'Maintain hill strength and coordination',
          principles: [
            'Maintain hill strength without fatigue',
            'Keep neuromuscular patterns sharp',
            'Minimal stress with maximum maintenance',
            'Focus on race readiness'
          ]
        };
        
      case 'recovery':
        return {
          type: 'gentle_hills',
          name: 'Gentle Hill Walking/Jogging',
          primaryZone: TRAINING_ZONES.EASY,
          intensity: 60, // Very easy
          duration: 1, // 1 minute gentle efforts
          recovery: 180, // 3 minute recoveries
          repeats: 3, // Just 3 gentle efforts
          gradient: '4-6%',
          effort: 'Very easy hill walking or gentle jogging',
          adaptationTarget: 'Active recovery with gentle strength maintenance',
          principles: [
            'Gentle movement for recovery',
            'Maintain basic hill mechanics',
            'No stress on anaerobic systems',
            'Promote blood flow and healing'
          ]
        };
        
      default:
        // Default to base phase profile
        return this.getHillProfileForPhase('base', weekInPhase);
    }
  }

  /**
   * Create workout segments based on hill profile
   */
  private createHillSegments(profile: LydiardHillProfile, totalDuration: number): WorkoutSegment[] {
    const segments: WorkoutSegment[] = [];
    
    // Warm-up (15-20 minutes depending on total duration)
    const warmupDuration = Math.min(20, totalDuration * 0.3);
    segments.push({
      duration: warmupDuration,
      intensity: 65,
      zone: TRAINING_ZONES.EASY,
      description: `Warm-up jog to hills - easy pace, prepare for ${profile.effort.toLowerCase()}`
    });
    
    // Hill repeats
    for (let i = 1; i <= profile.repeats; i++) {
      // Hill effort
      segments.push({
        duration: profile.duration,
        intensity: profile.intensity,
        zone: profile.primaryZone,
        description: `Hill repeat ${i}/${profile.repeats} - ${profile.effort} on ${profile.gradient} gradient`,
        effort: profile.effort,
        terrain: `${profile.gradient} uphill`,
        focus: i === 1 ? 'Establish rhythm and form' : 
               i === profile.repeats ? 'Strong finish maintaining form' :
               'Maintain consistent effort and technique'
      });
      
      // Recovery (except after last repeat)
      if (i < profile.repeats) {
        segments.push({
          duration: profile.recovery / 60, // Convert seconds to minutes
          intensity: 50,
          zone: TRAINING_ZONES.RECOVERY,
          description: `Recovery jog/walk down hill - full recovery before next effort`,
          effort: 'Very easy recovery',
          terrain: 'downhill jog or walk',
          focus: 'Complete recovery, relax and prepare for next effort'
        });
      }
    }
    
    // Cool-down
    const cooldownDuration = Math.max(10, totalDuration * 0.2);
    segments.push({
      duration: cooldownDuration,
      intensity: 60,
      zone: TRAINING_ZONES.RECOVERY,
      description: 'Cool-down jog on flat terrain - easy pace to finish',
      effort: 'Easy relaxed jogging',
      focus: 'Gradual return to easy pace, form and relaxation'
    });
    
    return segments;
  }

  /**
   * Calculate TSS for hill workout
   */
  private calculateHillTSS(segments: WorkoutSegment[]): number {
    let totalTSS = 0;
    
    segments.forEach(segment => {
      const intensityFactor = segment.intensity / 100;
      const segmentTSS = (segment.duration * Math.pow(intensityFactor, 2) * 100) / 60;
      
      // Hills have higher neuromuscular cost - apply multiplier
      const hillMultiplier = segment.intensity > 80 ? 1.2 : 1.0;
      totalTSS += segmentTSS * hillMultiplier;
    });
    
    return Math.round(totalTSS);
  }

  /**
   * Calculate recovery time for hill workout
   */
  private calculateHillRecovery(phase: TrainingPhase, numRepeats: number): number {
    const baseRecovery = {
      'base': 24,      // Hills in base are moderate stress
      'build': 36,     // Higher intensity needs more recovery
      'peak': 48,      // Very high intensity
      'taper': 18,     // Light maintenance work
      'recovery': 12   // Gentle work
    };
    
    const phaseRecovery = baseRecovery[phase] || 24;
    const repeatMultiplier = 1 + (numRepeats - 4) * 0.1; // More repeats = more recovery
    
    return Math.round(phaseRecovery * repeatMultiplier);
  }

  /**
   * Create phase-specific hill training templates
   */
  createLydiardHillTemplates(): Record<string, Workout> {
    const templates: Record<string, Workout> = {};
    
    // Base Phase Hill Strength
    templates['LYDIARD_HILL_BASE'] = this.generateHillWorkout('base', 4);
    
    // Build Phase Hill Power
    templates['LYDIARD_HILL_BUILD'] = this.generateHillWorkout('build', 3);
    
    // Peak Phase Hill Speed
    templates['LYDIARD_HILL_PEAK'] = this.generateHillWorkout('peak', 2);
    
    // Taper Phase Hill Maintenance
    templates['LYDIARD_HILL_TAPER'] = this.generateHillWorkout('taper', 1);
    
    // Recovery Phase Gentle Hills
    templates['LYDIARD_HILL_RECOVERY'] = this.generateHillWorkout('recovery', 1);
    
    return templates;
  }

  /**
   * Get hill training progression recommendations
   */
  getHillProgressionGuidance(phase: TrainingPhase): LydiardHillGuidance {
    switch (phase) {
      case 'base':
        return {
          frequency: '2-3 times per week',
          duration: '4-8 weeks continuous',
          focus: 'Leg strength and running economy',
          effort: 'Strong but comfortable aerobic effort',
          progression: 'Increase duration and repeats gradually',
          cautions: [
            'Never run hills at anaerobic intensity',
            'Focus on form and rhythm over speed',
            'Build volume before intensity',
            'Allow adequate recovery between sessions'
          ],
          benefits: [
            'Increased leg strength and power',
            'Improved running economy',
            'Enhanced biomechanical efficiency',
            'Foundation for later speed development'
          ]
        };
        
      case 'build':
        return {
          frequency: '2 times per week',
          duration: '3-4 weeks',
          focus: 'Anaerobic power development',
          effort: 'Hard uphill drive with control',
          progression: 'Increase intensity while maintaining form',
          cautions: [
            'Maintain strong uphill drive technique',
            'Do not overstride or lose form',
            'Monitor recovery between sessions',
            'Reduce if signs of overreaching appear'
          ],
          benefits: [
            'Anaerobic power development',
            'Lactate tolerance improvement',
            'Neuromuscular coordination',
            'Preparation for speed phase'
          ]
        };
        
      case 'peak':
        return {
          frequency: '1-2 times per week',
          duration: '2-3 weeks',
          focus: 'Speed coordination and final sharpening',
          effort: 'Fast controlled hill running',
          progression: 'Emphasize speed and coordination',
          cautions: [
            'Focus on coordination over raw speed',
            'Maintain excellent form at all times',
            'Use sparingly - quality over quantity',
            'Ensure full recovery between efforts'
          ],
          benefits: [
            'Speed coordination development',
            'Neuromuscular power enhancement',
            'Race-specific preparation',
            'Final leg speed sharpening'
          ]
        };
        
      default:
        return {
          frequency: '1 time per week',
          duration: '1-2 weeks',
          focus: 'Maintenance or recovery',
          effort: 'Easy to moderate',
          progression: 'Maintain without stress',
          cautions: ['Keep efforts easy', 'Focus on recovery'],
          benefits: ['Strength maintenance', 'Active recovery']
        };
    }
  }
}

/**
 * Hill profile interface for Lydiard methodology
 */
interface LydiardHillProfile {
  type: string;
  name: string;
  primaryZone: TrainingZone;
  intensity: number;
  duration: number; // minutes
  recovery: number; // seconds
  repeats: number;
  gradient: string;
  effort: string;
  adaptationTarget: string;
  principles: string[];
}

/**
 * Hill training guidance interface
 */
interface LydiardHillGuidance {
  frequency: string;
  duration: string;
  focus: string;
  effort: string;
  progression: string;
  cautions: string[];
  benefits: string[];
}

/**
 * Lydiard Periodization System
 * Implements Arthur Lydiard's strict training phase progression
 */
class LydiardPeriodizationSystem {
  // Lydiard-specific phase names mapping to standard phases
  private readonly lydiardPhases = {
    'aerobic_base': 'base',
    'hill_phase': 'base',  // Hills are part of extended base in Lydiard
    'anaerobic': 'build',
    'coordination': 'peak',
    'taper': 'taper',
    'recovery': 'recovery'
  } as const;

  /**
   * Calculate Lydiard phase durations based on total plan length
   */
  calculatePhaseDurations(totalWeeks: number, targetRace: RaceType): LydiardPhaseDurations {
    // Lydiard emphasizes very long base phase (50-60% of total)
    const basePercentage = 0.55; // 55% for aerobic base + hills
    const anaerobicPercentage = 0.20; // 20% for anaerobic development
    const coordinationPercentage = 0.15; // 15% for coordination/sharpening
    const taperPercentage = 0.10; // 10% for taper
    
    // Calculate raw durations
    let baseDuration = Math.round(totalWeeks * basePercentage);
    let anaerobicDuration = Math.round(totalWeeks * anaerobicPercentage);
    let coordinationDuration = Math.round(totalWeeks * coordinationPercentage);
    let taperDuration = Math.round(totalWeeks * taperPercentage);
    
    // Ensure minimum durations for each phase
    baseDuration = Math.max(8, baseDuration); // Minimum 8 weeks base
    anaerobicDuration = Math.max(3, anaerobicDuration); // Minimum 3 weeks anaerobic
    coordinationDuration = Math.max(2, coordinationDuration); // Minimum 2 weeks coordination
    taperDuration = Math.max(2, Math.min(3, taperDuration)); // 2-3 weeks taper
    
    // Adjust for race distance
    if (targetRace === 'marathon') {
      baseDuration += 2; // Extra base for marathon
      coordinationDuration = Math.max(2, coordinationDuration - 1); // Less speed work
    } else if (targetRace === '5k' || targetRace === '10k') {
      anaerobicDuration += 1; // More anaerobic work for shorter races
      coordinationDuration += 1; // More speed coordination
    }
    
    // Calculate hill phase duration (part of base)
    const hillPhaseDuration = Math.max(4, Math.round(baseDuration * 0.3)); // 30% of base for hills
    const aerobicBaseDuration = baseDuration - hillPhaseDuration;
    
    return {
      aerobicBase: aerobicBaseDuration,
      hillPhase: hillPhaseDuration,
      anaerobic: anaerobicDuration,
      coordination: coordinationDuration,
      taper: taperDuration,
      totalWeeks: aerobicBaseDuration + hillPhaseDuration + anaerobicDuration + coordinationDuration + taperDuration
    };
  }

  /**
   * Create Lydiard-specific training blocks
   */
  createLydiardBlocks(config: TrainingPlanConfig): TrainingBlock[] {
    const durations = this.calculatePhaseDurations(
      config.targetWeeks,
      config.goalRace?.type || 'half_marathon'
    );
    
    const blocks: TrainingBlock[] = [];
    let weekNumber = 1;
    
    // 1. Aerobic Base Phase
    blocks.push({
      phase: 'base',
      name: 'Aerobic Base Building',
      description: 'Build maximum aerobic capacity through volume and easy running',
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.aerobicBase - 1,
      duration: durations.aerobicBase,
      microcycles: this.createMicrocycles('base', durations.aerobicBase, weekNumber),
      focus: ['Aerobic capacity', 'Volume building', 'Easy running', 'Long runs'],
      keyWorkouts: ['long_run', 'easy', 'steady'],
      intensityDistribution: { easy: 95, moderate: 4, hard: 1 }
    });
    weekNumber += durations.aerobicBase;
    
    // 2. Hill Phase (still part of base)
    blocks.push({
      phase: 'base',
      name: 'Hill Strength Development',
      description: 'Build leg strength and power through systematic hill training',
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.hillPhase - 1,
      duration: durations.hillPhase,
      microcycles: this.createMicrocycles('base', durations.hillPhase, weekNumber),
      focus: ['Hill strength', 'Running economy', 'Power development', 'Form improvement'],
      keyWorkouts: ['hill_repeats', 'long_run', 'easy'],
      intensityDistribution: { easy: 85, moderate: 10, hard: 5 }
    });
    weekNumber += durations.hillPhase;
    
    // 3. Anaerobic Phase
    blocks.push({
      phase: 'build',
      name: 'Anaerobic Development',
      description: 'Develop anaerobic capacity and lactate tolerance',
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.anaerobic - 1,
      duration: durations.anaerobic,
      microcycles: this.createMicrocycles('build', durations.anaerobic, weekNumber),
      focus: ['Anaerobic power', 'Lactate tolerance', 'Tempo running', 'Time trials'],
      keyWorkouts: ['tempo', 'threshold', 'time_trial', 'long_run'],
      intensityDistribution: { easy: 80, moderate: 15, hard: 5 }
    });
    weekNumber += durations.anaerobic;
    
    // 4. Coordination Phase
    blocks.push({
      phase: 'peak',
      name: 'Coordination & Sharpening',
      description: 'Develop speed coordination and race-specific fitness',
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.coordination - 1,
      duration: durations.coordination,
      microcycles: this.createMicrocycles('peak', durations.coordination, weekNumber),
      focus: ['Speed coordination', 'Race pace', 'Neuromuscular power', 'Final sharpening'],
      keyWorkouts: ['speed', 'race_pace', 'vo2max', 'fartlek'],
      intensityDistribution: { easy: 75, moderate: 15, hard: 10 }
    });
    weekNumber += durations.coordination;
    
    // 5. Taper Phase
    blocks.push({
      phase: 'taper',
      name: 'Race Taper',
      description: 'Reduce volume while maintaining fitness for peak performance',
      weekStart: weekNumber,
      weekEnd: weekNumber + durations.taper - 1,
      duration: durations.taper,
      microcycles: this.createMicrocycles('taper', durations.taper, weekNumber),
      focus: ['Recovery', 'Race preparation', 'Maintain fitness', 'Mental preparation'],
      keyWorkouts: ['race_pace', 'easy', 'tempo'],
      intensityDistribution: { easy: 85, moderate: 10, hard: 5 }
    });
    
    return blocks;
  }

  /**
   * Create microcycles for Lydiard periodization
   */
  private createMicrocycles(phase: TrainingPhase, duration: number, startWeek: number): WeeklyMicrocycle[] {
    const microcycles: WeeklyMicrocycle[] = [];
    
    for (let week = 0; week < duration; week++) {
      const weekNumber = startWeek + week;
      const isRecoveryWeek = (week + 1) % 4 === 0; // Every 4th week is recovery
      
      microcycles.push({
        weekNumber,
        phase,
        emphasis: this.getWeekEmphasis(phase, week, duration),
        workoutTypes: this.getLydiardWeeklyWorkouts(phase, week, isRecoveryWeek),
        volumeModifier: isRecoveryWeek ? 0.7 : 1.0 + (week * 0.05), // Progressive overload
        intensityModifier: this.getIntensityModifier(phase, week, duration),
        keyFocus: this.getWeeklyFocus(phase, week, duration),
        recoveryPriority: isRecoveryWeek ? 'high' : 'moderate'
      });
    }
    
    return microcycles;
  }

  /**
   * Get week emphasis based on Lydiard principles
   */
  private getWeekEmphasis(phase: TrainingPhase, weekInPhase: number, phaseDuration: number): string {
    const progression = weekInPhase / phaseDuration;
    
    switch (phase) {
      case 'base':
        if (progression < 0.3) return 'Volume building';
        if (progression < 0.6) return 'Aerobic development';
        return 'Strength building';
        
      case 'build':
        if (progression < 0.5) return 'Anaerobic introduction';
        return 'Lactate tolerance';
        
      case 'peak':
        if (progression < 0.5) return 'Speed coordination';
        return 'Race simulation';
        
      case 'taper':
        return 'Recovery and sharpening';
        
      default:
        return 'Recovery';
    }
  }

  /**
   * Get Lydiard-specific weekly workout distribution
   */
  private getLydiardWeeklyWorkouts(phase: TrainingPhase, weekInPhase: number, isRecoveryWeek: boolean): WorkoutType[] {
    if (isRecoveryWeek) {
      return ['easy', 'easy', 'steady', 'easy', 'long_run', 'easy', 'recovery'];
    }
    
    switch (phase) {
      case 'base':
        // Early base: all aerobic
        if (weekInPhase < 4) {
          return ['easy', 'steady', 'easy', 'steady', 'long_run', 'easy', 'recovery'];
        }
        // Mid-late base: add hills
        return ['easy', 'hill_repeats', 'easy', 'steady', 'long_run', 'hill_repeats', 'recovery'];
        
      case 'build':
        // Anaerobic phase: introduce harder work gradually
        return ['easy', 'tempo', 'easy', 'threshold', 'long_run', 'time_trial', 'recovery'];
        
      case 'peak':
        // Coordination phase: speed and race pace
        return ['easy', 'speed', 'easy', 'race_pace', 'tempo', 'vo2max', 'recovery'];
        
      case 'taper':
        // Taper: maintain with reduced volume
        return ['easy', 'race_pace', 'easy', 'tempo', 'easy', 'race_pace', 'recovery'];
        
      default:
        return ['recovery', 'easy', 'recovery', 'easy', 'recovery', 'easy', 'recovery'];
    }
  }

  /**
   * Get intensity modifier for progressive overload
   */
  private getIntensityModifier(phase: TrainingPhase, weekInPhase: number, phaseDuration: number): number {
    const progression = weekInPhase / phaseDuration;
    
    switch (phase) {
      case 'base':
        return 1.0; // No intensity increase in base
        
      case 'build':
        return 1.0 + (progression * 0.1); // Gradual intensity increase
        
      case 'peak':
        return 1.1 + (progression * 0.05); // Slight increase
        
      case 'taper':
        return 1.0 - (progression * 0.2); // Decrease intensity
        
      default:
        return 0.8; // Recovery intensity
    }
  }

  /**
   * Get weekly focus points
   */
  private getWeeklyFocus(phase: TrainingPhase, weekInPhase: number, phaseDuration: number): string[] {
    const baselineFocus = {
      'base': ['Aerobic development', 'Running form', 'Consistency'],
      'build': ['Lactate threshold', 'Tempo endurance', 'Mental toughness'],
      'peak': ['Race pace', 'Speed coordination', 'Race tactics'],
      'taper': ['Recovery', 'Race visualization', 'Maintain sharpness'],
      'recovery': ['Complete rest', 'Regeneration', 'Mental refresh']
    };
    
    return baselineFocus[phase] || ['General fitness'];
  }

  /**
   * Validate phase transition readiness
   */
  validatePhaseTransition(currentPhase: TrainingPhase, completedWorkouts: PlannedWorkout[]): PhaseTransitionValidation {
    const requiredCompletions = {
      'base': {
        minWeeks: 8,
        minLongRuns: 6,
        minWeeklyVolume: 40, // km
        requiredWorkoutTypes: ['long_run', 'easy', 'steady']
      },
      'build': {
        minWeeks: 3,
        minTempoRuns: 6,
        minThresholdWork: 4,
        requiredWorkoutTypes: ['tempo', 'threshold', 'time_trial']
      },
      'peak': {
        minWeeks: 2,
        minSpeedSessions: 4,
        minRacePaceWork: 3,
        requiredWorkoutTypes: ['speed', 'race_pace', 'vo2max']
      }
    };
    
    // Validation logic here
    const isReady = true; // Simplified for now
    const recommendations = isReady ? [] : ['Complete more base work before progressing'];
    
    return {
      currentPhase,
      nextPhase: this.getNextPhase(currentPhase),
      isReady,
      completionPercentage: 85, // Simplified
      missingRequirements: [],
      recommendations
    };
  }

  /**
   * Get next phase in Lydiard progression
   */
  private getNextPhase(currentPhase: TrainingPhase): TrainingPhase {
    const progression: Record<TrainingPhase, TrainingPhase> = {
      'base': 'build',
      'build': 'peak',
      'peak': 'taper',
      'taper': 'recovery',
      'recovery': 'base'
    };
    
    return progression[currentPhase] || 'base';
  }

  /**
   * Apply recovery emphasis based on Lydiard principles
   */
  applyRecoveryEmphasis(workout: Workout, phase: TrainingPhase, isRecoveryWeek: boolean): Workout {
    if (!isRecoveryWeek && phase !== 'recovery') {
      return workout;
    }
    
    // Lydiard emphasizes complete rest over active recovery
    if (workout.type === 'recovery' || workout.type === 'easy') {
      return {
        ...workout,
        segments: workout.segments.map(segment => ({
          ...segment,
          intensity: Math.min(segment.intensity, 60), // Very easy
          description: segment.description + ' - Complete recovery focus'
        })),
        adaptationTarget: 'Complete physiological and mental recovery',
        estimatedTSS: Math.round(workout.estimatedTSS * 0.5),
        recoveryTime: 8 // Minimal stress
      };
    }
    
    return workout;
  }
}

/**
 * Phase duration interface for Lydiard system
 */
interface LydiardPhaseDurations {
  aerobicBase: number;
  hillPhase: number;
  anaerobic: number;
  coordination: number;
  taper: number;
  totalWeeks: number;
}

/**
 * Phase transition validation interface
 */
interface PhaseTransitionValidation {
  currentPhase: TrainingPhase;
  nextPhase: TrainingPhase;
  isReady: boolean;
  completionPercentage: number;
  missingRequirements: string[];
  recommendations: string[];
}

/**
 * Arthur Lydiard training methodology implementation
 * Based on aerobic base building and progressive intensity development
 */
class LydiardPhilosophy extends BaseTrainingPhilosophy {
  private readonly aerobicBaseCalculator: AerobicBaseCalculator;
  private readonly lydiardHillGenerator: LydiardHillGenerator;
  private readonly periodizationSystem: LydiardPeriodizationSystem;

  constructor() {
    super('lydiard', 'Arthur Lydiard');
    this.aerobicBaseCalculator = new AerobicBaseCalculator();
    this.lydiardHillGenerator = new LydiardHillGenerator();
    this.periodizationSystem = new LydiardPeriodizationSystem();
  }
  
  /**
   * Enhanced plan generation with extended aerobic base phase and 85%+ easy running
   */
  enhancePlan(basePlan: TrainingPlan): TrainingPlan {
    const enhancedPlan = super.enhancePlan(basePlan);
    
    // Apply Lydiard periodization system if weeks data is available
    const totalWeeks = basePlan.weeks?.length || basePlan.summary?.totalWeeks || 12;
    const targetRace = basePlan.races?.find(r => r.priority === 'A') || basePlan.races?.[0];
    
    if (targetRace) {
      // 1. Calculate phase durations using Lydiard system
      const phaseDurations = this.periodizationSystem.calculatePhaseDurations(totalWeeks, targetRace.type);
      
      // 2. Create Lydiard-specific training blocks
      const lydiardBlocks = this.periodizationSystem.createLydiardBlocks(totalWeeks, phaseDurations, targetRace);
      
      // 3. Replace blocks with Lydiard periodization blocks
      enhancedPlan.blocks = lydiardBlocks;
    }
    
    // Apply aerobic base building system with 85%+ easy running enforcement
    const aerobicCompliantWorkouts = this.aerobicBaseCalculator.enforceAerobicBase(enhancedPlan.workouts);
    
    // Apply Lydiard-specific plan structure with extended base phase
    const lydiardBlocks = enhancedPlan.blocks.map(block => 
      this.applyLydiardPhaseEmphasis(block)
    );
    
    // Apply time-based training conversion to workouts
    const timeBasedWorkouts = aerobicCompliantWorkouts.map(plannedWorkout => ({
      ...plannedWorkout,
      workout: this.aerobicBaseCalculator.convertToTimeBased(plannedWorkout.workout)
    }));
    
    // Apply Lydiard's recovery emphasis (complete rest over active recovery)
    const recoveryEmphasizedWorkouts = this.periodizationSystem.applyRecoveryEmphasis(timeBasedWorkouts);
    
    // Generate aerobic base compliance report
    const aerobicBaseReport = this.aerobicBaseCalculator.validateAerobicBase(recoveryEmphasizedWorkouts);
    
    // Create the enhanced plan with all Lydiard features
    const lydiardPlan = {
      ...enhancedPlan,
      blocks: lydiardBlocks,
      workouts: recoveryEmphasizedWorkouts,
      summary: {
        ...enhancedPlan.summary,
        phases: enhancedPlan.summary.phases.map(phase => ({
          ...phase,
          intensityDistribution: this.getLydiardPhaseDistribution(phase.phase),
          focus: this.getLydiardPhaseFocus(phase.phase)
        }))
      },
      metadata: {
        ...enhancedPlan.metadata,
        methodology: 'lydiard',
        aerobicBaseReport,
        lydiardFeatures: {
          aerobicBaseCompliance: aerobicBaseReport.isCompliant,
          easyRunningPercentage: aerobicBaseReport.distribution.easy,
          timeBasedTraining: true,
          longRunProgression: this.calculateLongRunProgressionForPlan(enhancedPlan),
          periodizationModel: 'lydiard_classic',
          recoveryPhilosophy: 'complete_rest'
        }
      }
    };
    
    // Apply effort-based zone calculations
    this.applyEffortBasedZones(lydiardPlan);
    
    return lydiardPlan;
  }
  
  /**
   * Lydiard-specific workout customization emphasizing aerobic development
   */
  customizeWorkout(template: Workout, phase: TrainingPhase, weekNumber: number): Workout {
    const baseCustomization = super.customizeWorkout(template, phase, weekNumber);
    
    // Apply Lydiard-specific modifications
    const lydiardSegments = baseCustomization.segments.map(segment => ({
      ...segment,
      intensity: this.adjustIntensityForLydiard(segment.intensity, template.type, phase, weekNumber),
      description: this.enhanceLydiardDescription(segment.description, template.type, phase)
    }));
    
    return {
      ...baseCustomization,
      segments: lydiardSegments,
      adaptationTarget: this.getLydiardAdaptationTarget(template.type, phase),
      recoveryTime: Math.round(baseCustomization.recoveryTime * 1.1) // Conservative recovery
    };
  }
  
  /**
   * Lydiard workout selection emphasizing aerobic base and hill training
   */
  selectWorkout(type: WorkoutType, phase: TrainingPhase, weekInPhase: number): string {
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES)
      .filter(key => WORKOUT_TEMPLATES[key].type === type);
    
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for workout type: ${type}`);
    }
    
    // Lydiard-specific workout selection logic
    switch (type) {
      case 'easy':
        return 'EASY_AEROBIC'; // Foundation of Lydiard training
      
      case 'long_run':
        return 'LONG_RUN'; // Critical for aerobic base development
      
      case 'steady':
        // Lydiard's "steady state" runs - crucial for aerobic development
        return availableTemplates[0];
      
      case 'hill_repeats':
        // Hills are essential in Lydiard system for strength and power
        // Use Lydiard-specific hill training based on phase
        return this.selectLydiardHillWorkout(phase, weekInPhase);
      
      case 'tempo':
        // More conservative tempo work in Lydiard system
        return 'TEMPO_CONTINUOUS';
      
      case 'threshold':
        // Limited threshold work, mainly in build phase
        if (phase === 'base') {
          // Convert threshold to tempo in base phase
          return 'TEMPO_CONTINUOUS';
        }
        return availableTemplates.includes('THRESHOLD_PROGRESSION') 
          ? 'THRESHOLD_PROGRESSION' 
          : availableTemplates[0];
      
      case 'vo2max':
        // Minimal VO2max work, only in peak phase
        if (phase === 'base' || phase === 'build') {
          // Convert to hill repeats in earlier phases using Lydiard methodology
          return this.selectLydiardHillWorkout(phase, weekInPhase);
        }
        return availableTemplates[0];
      
      case 'speed':
        // Speed work only in final sharpening phase
        if (phase === 'base' || phase === 'build') {
          // Hills substitute for speed using Lydiard methodology
          return this.selectLydiardHillWorkout(phase, weekInPhase);
        }
        return availableTemplates[0];
      
      default:
        return availableTemplates[0];
    }
  }
  
  /**
   * Apply Lydiard phase emphasis with extended base phase
   */
  private applyLydiardPhaseEmphasis(block: TrainingBlock): TrainingBlock {
    const enhancedMicrocycles = block.microcycles.map(microcycle => {
      // Lydiard emphasizes fewer hard workouts per week
      const modifiedWorkouts = microcycle.workouts.map(plannedWorkout => {
        // Convert some hard workouts to easier efforts in base phase
        if (block.phase === 'base' && this.isHighIntensityWorkout(plannedWorkout.workout.type)) {
          const easierWorkout = this.convertToAerobicWorkout(plannedWorkout.workout);
          return {
            ...plannedWorkout,
            workout: easierWorkout
          };
        }
        return plannedWorkout;
      });
      
      return {
        ...microcycle,
        workouts: modifiedWorkouts
      };
    });
    
    return {
      ...block,
      microcycles: enhancedMicrocycles
    };
  }
  
  /**
   * Check if workout is high intensity
   */
  private isHighIntensityWorkout(type: WorkoutType): boolean {
    return ['vo2max', 'speed', 'threshold'].includes(type);
  }
  
  /**
   * Convert high-intensity workout to aerobic alternative
   */
  private convertToAerobicWorkout(workout: Workout): Workout {
    // Convert high-intensity workouts to steady aerobic work
    const aerobicSegments = workout.segments.map(segment => ({
      ...segment,
      intensity: Math.min(segment.intensity, 75), // Cap at steady intensity
      zone: segment.intensity > 80 ? TRAINING_ZONES.STEADY : segment.zone,
      description: `Aerobic ${segment.description.toLowerCase()}`
    }));
    
    return {
      ...workout,
      type: 'steady',
      primaryZone: TRAINING_ZONES.STEADY,
      segments: aerobicSegments,
      adaptationTarget: 'Aerobic base development, mitochondrial adaptation',
      estimatedTSS: Math.round(workout.estimatedTSS * 0.7), // Lower stress
      recoveryTime: Math.round(workout.recoveryTime * 0.8) // Faster recovery
    };
  }
  
  /**
   * Adjust intensity for Lydiard methodology
   */
  private adjustIntensityForLydiard(
    baseIntensity: number, 
    workoutType: WorkoutType, 
    phase: TrainingPhase,
    weekNumber: number
  ): number {
    let adjustment = 1.0;
    
    // Lydiard emphasizes very conservative intensity progression
    switch (workoutType) {
      case 'easy':
        // Keep easy runs very easy - foundation of aerobic base
        adjustment = 0.85; // Even easier than other systems
        break;
      
      case 'steady':
        // "Steady state" - key Lydiard concept, aerobic but not hard
        adjustment = 0.95;
        break;
      
      case 'long_run':
        // Long runs should be comfortable aerobic
        adjustment = 0.90;
        break;
      
      case 'hill_repeats':
        // Hills for strength, not necessarily max intensity
        adjustment = phase === 'base' ? 0.90 : 0.95;
        break;
      
      case 'tempo':
        // More conservative tempo approach
        adjustment = 0.95;
        break;
      
      case 'threshold':
        // Limited threshold work
        if (phase === 'base') {
          adjustment = 0.85; // Convert to aerobic work
        } else {
          adjustment = 0.98; // Conservative threshold
        }
        break;
      
      case 'vo2max':
        // Minimal VO2max work
        if (phase === 'base' || phase === 'build') {
          adjustment = 0.80; // Convert to aerobic work
        } else {
          adjustment = 1.00;
        }
        break;
      
      case 'speed':
        // Speed work only in final phase
        if (phase === 'base' || phase === 'build') {
          adjustment = 0.75; // Convert to tempo work
        } else {
          adjustment = 0.98; // Conservative speed work
        }
        break;
      
      default:
        adjustment = 0.95; // Generally conservative
    }
    
    // Apply progressive loading within phases
    const weeklyAdjustment = this.getWeeklyAdjustment(weekNumber, phase);
    adjustment *= weeklyAdjustment;
    
    const adjustedIntensity = baseIntensity * adjustment;
    return Math.max(45, Math.min(100, Math.round(adjustedIntensity)));
  }
  
  /**
   * Get weekly adjustment for progressive loading
   */
  private getWeeklyAdjustment(weekNumber: number, phase: TrainingPhase): number {
    // Lydiard uses very gradual progression
    const baseProgression = 0.02; // 2% per week maximum
    
    switch (phase) {
      case 'base':
        return 1.0 + (weekNumber * baseProgression * 0.5); // Very gradual in base
      case 'build':
        return 1.0 + (weekNumber * baseProgression * 0.8); // Moderate in build
      case 'peak':
        return 1.0 + (weekNumber * baseProgression); // Normal in peak
      default:
        return 1.0;
    }
  }
  
  /**
   * Get Lydiard phase-specific intensity distribution
   */
  private getLydiardPhaseDistribution(phase: TrainingPhase): IntensityDistribution {
    switch (phase) {
      case 'base':
        return { easy: 95, moderate: 4, hard: 1 }; // Extreme aerobic emphasis
      case 'build':
        return { easy: 90, moderate: 8, hard: 2 }; // Still very aerobic
      case 'peak':
        return { easy: 85, moderate: 10, hard: 5 }; // Some intensity added
      case 'taper':
        return { easy: 92, moderate: 5, hard: 3 }; // Back to easy emphasis
      case 'recovery':
        return { easy: 98, moderate: 2, hard: 0 }; // Almost all easy
      default:
        return this.intensityDistribution;
    }
  }
  
  /**
   * Get Lydiard phase focus areas
   */
  private getLydiardPhaseFocus(phase: TrainingPhase): string[] {
    switch (phase) {
      case 'base':
        return ['Aerobic base development', 'Mitochondrial adaptation', 'Capillarization', 'Hill strength'];
      case 'build':
        return ['Aerobic power', 'Lactate clearance', 'Time trials', 'Coordination'];
      case 'peak':
        return ['Race sharpening', 'Speed development', 'Race tactics', 'Final conditioning'];
      case 'taper':
        return ['Maintain fitness', 'Recovery', 'Race preparation', 'Mental readiness'];
      case 'recovery':
        return ['Full recovery', 'Base maintenance', 'Form work', 'Preparation for next cycle'];
      default:
        return ['General aerobic development'];
    }
  }
  
  /**
   * Enhance descriptions with Lydiard terminology
   */
  private enhanceLydiardDescription(baseDescription: string, workoutType: WorkoutType, phase: TrainingPhase): string {
    const lydiardTerms: Partial<Record<WorkoutType, Record<TrainingPhase, string>>> = {
      'easy': {
        'base': 'Aerobic base building - foundation mileage',
        'build': 'Aerobic maintenance - recovery between harder efforts',
        'peak': 'Active recovery - maintain aerobic base',
        'taper': 'Easy aerobic - maintain fitness with minimal stress',
        'recovery': 'Gentle jogging - promote recovery'
      },
      'steady': {
        'base': 'Steady state aerobic - key Lydiard development pace',
        'build': 'Sustained aerobic effort - lactate clearance',
        'peak': 'Aerobic power - controlled sustained effort',
        'taper': 'Steady maintenance - keep aerobic systems active',
        'recovery': 'Easy steady - very light aerobic work'
      },
      'hill_repeats': {
        'base': 'Hill strength - build power and economy',
        'build': 'Hill power - anaerobic strength development',
        'peak': 'Speed hill work - final power development',
        'taper': 'Light hill work - maintain strength',
        'recovery': 'Easy hill walking - gentle strength work'
      },
      'tempo': {
        'base': 'Aerobic tempo - controlled aerobic effort',
        'build': 'Tempo development - lactate threshold preparation',
        'peak': 'Race pace tempo - specific pace practice',
        'taper': 'Light tempo - maintain pace feel',
        'recovery': 'Easy tempo - very light sustained work'
      }
    };
    
    const enhancement = lydiardTerms[workoutType]?.[phase];
    return enhancement ? `${enhancement} - ${baseDescription}` : baseDescription;
  }
  
  /**
   * Get Lydiard-specific adaptation targets
   */
  private getLydiardAdaptationTarget(workoutType: WorkoutType, phase: TrainingPhase): string {
    const adaptationMatrix: Partial<Record<WorkoutType, Record<TrainingPhase, string>>> = {
      'easy': {
        'base': 'Aerobic enzyme development, mitochondrial biogenesis, capillary density',
        'build': 'Maintain aerobic base while building anaerobic capacity',
        'peak': 'Recovery facilitation, maintain aerobic fitness',
        'taper': 'Fitness maintenance with minimal fatigue',
        'recovery': 'Complete physiological restoration'
      },
      'steady': {
        'base': 'Aerobic power development, fat oxidation, cardiac output',
        'build': 'Lactate clearance, aerobic-anaerobic transition',
        'peak': 'Race pace conditioning, metabolic efficiency',
        'taper': 'Maintain aerobic power with reduced volume',
        'recovery': 'Light aerobic maintenance'
      },
      'hill_repeats': {
        'base': 'Leg strength, running economy, biomechanical efficiency',
        'build': 'Anaerobic power, lactate tolerance, neuromuscular coordination',
        'peak': 'Maximum power output, race-specific strength',
        'taper': 'Maintain strength with reduced stress',
        'recovery': 'Gentle strength maintenance'
      },
      'long_run': {
        'base': 'Aerobic base, glycogen storage, mental resilience, fat adaptation',
        'build': 'Sustained aerobic power, pace judgment, endurance',
        'peak': 'Race-specific endurance, pacing practice',
        'taper': 'Maintain endurance base with reduced distance',
        'recovery': 'Light endurance maintenance'
      }
    };
    
    return adaptationMatrix[workoutType]?.[phase] || 
           `${workoutType} adaptation for ${phase} phase in Lydiard system`;
  }
  
  /**
   * Generate Lydiard-specific hill training workouts
   */
  generateLydiardHillTraining(phase: TrainingPhase, weekInPhase: number, duration: number = 45): Workout {
    return this.lydiardHillGenerator.generateHillWorkout(phase, weekInPhase, duration);
  }
  
  /**
   * Calculate long run progression for entire plan
   */
  private calculateLongRunProgressionForPlan(plan: TrainingPlan): LongRunProgression {
    const baseBlocks = plan.blocks.filter(block => block.phase === 'base');
    const totalBaseWeeks = baseBlocks.reduce((sum, block) => sum + block.duration, 0);
    
    // Find current longest run in plan
    const currentLongRuns = plan.workouts.filter(w => w.workout.type === 'long_run');
    const currentLongestDistance = currentLongRuns.length > 0 
      ? Math.max(...currentLongRuns.map(w => w.targetMetrics.distance || 10))
      : 10;
    
    const progression: WeeklyLongRun[] = [];
    let weekCounter = 0;
    
    for (const block of plan.blocks) {
      for (let week = 1; week <= block.duration; week++) {
        weekCounter++;
        
        if (block.phase === 'base') {
          // Apply Lydiard long run progression during base phase
          const progressedDistance = this.aerobicBaseCalculator.calculateLongRunProgression(
            weekCounter, 
            totalBaseWeeks, 
            currentLongestDistance
          );
          
          progression.push({
            week: weekCounter,
            phase: block.phase,
            distance: Math.round(progressedDistance * 1.6 * 10) / 10, // Convert km to miles and round to 0.1
            effort: 'Easy aerobic - conversational pace',
            focus: 'Time on feet, aerobic adaptation'
          });
        } else {
          // Maintain or slightly reduce long run distance in other phases
          const maintainedDistance = currentLongestDistance * 
            (block.phase === 'peak' ? 0.8 : block.phase === 'taper' ? 0.6 : 0.9);
          
          progression.push({
            week: weekCounter,
            phase: block.phase,
            distance: Math.round(maintainedDistance * 1.6 * 10) / 10,
            effort: block.phase === 'peak' ? 'Moderate with race pace segments' : 'Easy aerobic',
            focus: block.phase === 'peak' ? 'Race preparation' : 'Fitness maintenance'
          });
        }
      }
    }
    
    return {
      totalWeeks: plan.summary.totalWeeks,
      basePhaseWeeks: totalBaseWeeks,
      targetDistance: 22, // Target 22+ mile long runs
      currentMax: currentLongestDistance * 1.6, // Convert to miles
      weeklyProgression: progression
    };
  }

  /**
   * Apply effort-based zone calculations to the plan
   */
  private applyEffortBasedZones(plan: TrainingPlan): void {
    plan.workouts.forEach(plannedWorkout => {
      if (plannedWorkout.workout && plannedWorkout.workout.segments) {
        plannedWorkout.workout.segments.forEach(segment => {
          // Convert intensity to effort-based description
          const effortLevel = this.getEffortDescription(segment.intensity);
          segment.description = `${effortLevel} - ${segment.description}`;
          
          // Add perceived effort guidance using proper types
          if (!segment.paceTarget) {
            segment.paceTarget = {
              min: 0,
              max: 0,
              effortBased: true,
              perceivedEffort: this.getPerceivedEffortScale(segment.intensity)
            };
          } else {
            segment.paceTarget = {
              ...segment.paceTarget,
              effortBased: true,
              perceivedEffort: this.getPerceivedEffortScale(segment.intensity)
            };
          }
        });
      }
    });
  }

  /**
   * Get effort description for intensity level
   */
  private getEffortDescription(intensity: number): string {
    if (intensity < 60) return 'Very easy effort';
    if (intensity < 70) return 'Easy conversational effort';
    if (intensity < 80) return 'Steady aerobic effort';
    if (intensity < 85) return 'Strong aerobic effort';
    if (intensity < 90) return 'Threshold effort';
    if (intensity < 95) return 'Hard anaerobic effort';
    return 'Maximum effort';
  }

  /**
   * Get perceived effort scale (1-10) for intensity
   */
  private getPerceivedEffortScale(intensity: number): number {
    // Map intensity percentage to 1-10 effort scale
    return Math.round((intensity - 50) / 5);
  }
  
  /**
   * Select appropriate Lydiard hill workout based on phase and week
   */
  private selectLydiardHillWorkout(phase: TrainingPhase, weekInPhase: number): string {
    // Generate phase-specific Lydiard hill templates using the hill generator
    const hillTemplates = this.lydiardHillGenerator.createLydiardHillTemplates();
    
    switch (phase) {
      case 'base':
        return 'LYDIARD_HILL_BASE';
      case 'build':
        return 'LYDIARD_HILL_BUILD';
      case 'peak':
        return 'LYDIARD_HILL_PEAK';
      case 'taper':
        return 'LYDIARD_HILL_TAPER';
      case 'recovery':
        return 'LYDIARD_HILL_RECOVERY';
      default:
        return 'LYDIARD_HILL_BASE'; // Default to base phase
    }
  }
  
  /**
   * Get hill training guidance for current phase
   */
  getHillTrainingGuidance(phase: TrainingPhase): LydiardHillGuidance {
    return this.lydiardHillGenerator.getHillProgressionGuidance(phase);
  }
  
  /**
   * Customize hill workout with Lydiard-specific modifications
   */
  customizeHillWorkout(phase: TrainingPhase, weekInPhase: number, duration: number = 45): Workout {
    const hillWorkout = this.lydiardHillGenerator.generateHillWorkout(phase, weekInPhase, duration);
    
    // Apply Lydiard-specific customizations
    const customizedSegments = hillWorkout.segments.map(segment => ({
      ...segment,
      description: this.enhanceLydiardDescription(segment.description, 'hill_repeats', phase)
    }));
    
    return {
      ...hillWorkout,
      segments: customizedSegments,
      metadata: {
        ...hillWorkout.metadata,
        lydiardCustomization: true,
        guidance: this.lydiardHillGenerator.getHillProgressionGuidance(phase)
      }
    };
  }
}

/**
 * Pete Pfitzinger training methodology implementation
 * Based on lactate threshold development and marathon-specific training
 */
class PfitsingerPhilosophy extends BaseTrainingPhilosophy {
  constructor() {
    super('pfitzinger', 'Pete Pfitzinger');
  }
  
  /**
   * Enhanced plan generation with lactate threshold emphasis and medium-long runs
   */
  enhancePlan(basePlan: TrainingPlan): TrainingPlan {
    const enhancedPlan = super.enhancePlan(basePlan);
    
    // Get lactate threshold pace as foundation for all pace calculations
    const ltPace = this.calculateLactateThresholdPace(basePlan);
    const pfitzingerPaces = this.calculatePfitzingerPaces(ltPace);
    
    // Apply LT-based pacing to all workouts
    const ltBasedPlan = {
      ...enhancedPlan,
      workouts: enhancedPlan.workouts.map(workout => 
        this.applyLTBasedPacing(workout, pfitzingerPaces, ltPace)
      )
    };
    
    // Apply progressive threshold volume calculations
    const planWithProgression = this.applyThresholdVolumeProgression(ltBasedPlan);
    
    // Apply Pfitzinger-specific plan structure
    const pfitzingerBlocks = planWithProgression.blocks.map(block => 
      this.applyPfitzingerStructure(block)
    );
    
    // Add tune-up races and medium-long runs
    const planWithRaces = this.integrateRacesAndMediumLongs(
      { ...planWithProgression, blocks: pfitzingerBlocks }
    );
    
    return {
      ...planWithRaces,
      metadata: {
        ...planWithRaces.metadata,
        methodology: 'pfitzinger',
        lactateThresholdPace: ltPace,
        pfitzingerPaces,
        thresholdVolumeProgression: this.calculateLegacyThresholdVolumeProgression(planWithRaces),
        ltBasedZones: this.generateLTBasedZones(ltPace)
      }
    };
  }
  
  /**
   * Pfitzinger-specific workout customization with threshold focus
   */
  customizeWorkout(template: Workout, phase: TrainingPhase, weekNumber: number): Workout {
    const baseCustomization = super.customizeWorkout(template, phase, weekNumber);
    
    // Apply Pfitzinger-specific modifications
    const pfitzingerSegments = baseCustomization.segments.map(segment => ({
      ...segment,
      intensity: this.adjustIntensityForPfitzinger(segment.intensity, template.type, phase, weekNumber),
      description: this.enhancePfitzingerDescription(segment.description, template.type, phase)
    }));
    
    // Add marathon-specific pacing for certain workouts
    if (this.isMarathonSpecificWorkout(template.type, phase)) {
      pfitzingerSegments.forEach(segment => {
        if (segment.zone.name === 'Tempo' || segment.zone.name === 'Threshold') {
          segment.paceTarget = this.getMarathonPaceTarget(segment.zone.name);
        }
      });
    }
    
    return {
      ...baseCustomization,
      segments: pfitzingerSegments,
      adaptationTarget: this.getPfitzingerAdaptationTarget(template.type, phase),
      estimatedTSS: this.adjustTSSForPfitzinger(baseCustomization.estimatedTSS, template.type)
    };
  }
  
  /**
   * Pfitzinger workout selection prioritizing threshold and progression work
   */
  selectWorkout(type: WorkoutType, phase: TrainingPhase, weekInPhase: number): string {
    const availableTemplates = Object.keys(WORKOUT_TEMPLATES)
      .filter(key => WORKOUT_TEMPLATES[key].type === type);
    
    if (availableTemplates.length === 0) {
      throw new Error(`No templates available for workout type: ${type}`);
    }
    
    // Pfitzinger-specific workout selection logic
    switch (type) {
      case 'threshold':
        // Pfitzinger loves lactate threshold work
        if (phase === 'build' || phase === 'peak') {
          return availableTemplates.includes('LACTATE_THRESHOLD_2X20') 
            ? 'LACTATE_THRESHOLD_2X20' 
            : 'THRESHOLD_PROGRESSION';
        }
        return 'THRESHOLD_PROGRESSION';
      
      case 'tempo':
        // Tempo runs are crucial for marathon training
        return 'TEMPO_CONTINUOUS';
      
      case 'progression':
        // Progression runs are Pfitzinger's specialty
        return 'PROGRESSION_3_STAGE';
      
      case 'long_run':
        // Long runs with quality segments
        return 'LONG_RUN';
      
      case 'vo2max':
        // VO2max work in peak phase only
        if (phase === 'peak') {
          return availableTemplates.includes('VO2MAX_5X3') ? 'VO2MAX_5X3' : availableTemplates[0];
        }
        // Convert to threshold work in other phases
        return 'THRESHOLD_PROGRESSION';
      
      case 'easy':
        return 'EASY_AEROBIC';
      
      case 'recovery':
        return 'RECOVERY_JOG';
      
      case 'steady':
        // Steady runs important for Pfitzinger
        return availableTemplates[0];
      
      default:
        return availableTemplates[0];
    }
  }
  
  /**
   * Apply Pfitzinger-specific structure with extended build phase
   */
  private applyPfitzingerStructure(block: TrainingBlock): TrainingBlock {
    // Pfitzinger emphasizes quality in all phases
    const enhancedMicrocycles = block.microcycles.map((microcycle, weekIndex) => {
      const modifiedWorkouts = microcycle.workouts.map(plannedWorkout => {
        // Add medium-long runs and quality elements
        if (this.shouldBeMediumLong(plannedWorkout, weekIndex, block.phase)) {
          return this.convertToMediumLong(plannedWorkout, block.phase, weekIndex + 1);
        }
        
        // Add quality segments to some long runs
        if (plannedWorkout.workout.type === 'long_run' && this.shouldAddQuality(block.phase, weekIndex)) {
          return this.addQualityToLongRun(plannedWorkout);
        }
        
        return plannedWorkout;
      });
      
      return {
        ...microcycle,
        workouts: modifiedWorkouts,
        pattern: this.getPfitzingerWeeklyPattern(block.phase, weekIndex)
      };
    });
    
    return {
      ...block,
      microcycles: enhancedMicrocycles,
      focusAreas: this.getPfitzingerPhaseFocus(block.phase)
    };
  }
  
  /**
   * Integrate tune-up races and medium-long runs
   */
  private integrateRacesAndMediumLongs(plan: TrainingPlan): TrainingPlan {
    const modifiedWorkouts = plan.workouts.map((workout, index) => {
      const weeksToGoal = differenceInWeeks(plan.config.targetDate || plan.config.endDate || new Date(), workout.date);
      
      // Add tune-up races at strategic points
      if (this.shouldBeRace(weeksToGoal) && workout.workout.type === 'long_run') {
        return this.convertToRace(workout, weeksToGoal);
      }
      
      return workout;
    });
    
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  
  /**
   * Check if workout should be medium-long run
   */
  private shouldBeMediumLong(workout: PlannedWorkout, weekIndex: number, phase: TrainingPhase): boolean {
    // Pfitzinger includes medium-long runs weekly
    return workout.workout.type === 'easy' && 
           weekIndex % 7 === 3 && // Mid-week
           (phase === 'build' || phase === 'peak');
  }
  
  // ===============================
  // PFITZINGER MEDIUM-LONG RUN GENERATION SYSTEM
  // ===============================
  
  /**
   * Generate Pfitzinger-style medium-long runs (12-16 miles with embedded tempo segments)
   * Implements progressive difficulty and signature workout patterns
   */
  private generateMediumLongRun(baseWorkout: PlannedWorkout, phase: TrainingPhase, weekNumber: number = 1): {
    name: string;
    description: string;
    workout: Workout;
  } {
    const pattern = this.selectMediumLongPattern(phase, weekNumber);
    const scaledPattern = this.scaleMediumLongDifficulty(pattern, weekNumber, phase);
    
    return this.createMediumLongWorkout(scaledPattern, baseWorkout);
  }
  
  /**
   * Select appropriate medium-long run pattern based on training phase and progression
   */
  private selectMediumLongPattern(phase: TrainingPhase, weekNumber: number): MediumLongRunPattern {
    const patterns = this.getMediumLongPatterns();
    
    // Progressive selection based on phase and week
    if (phase === 'base') {
      return patterns.aerobicMediumLong;
    } else if (phase === 'build') {
      // Alternate between different patterns for variety
      const buildPatterns = [
        patterns.tempoMediumLong,
        patterns.marathonPaceMediumLong,
        patterns.progressiveMediumLong
      ];
      return buildPatterns[weekNumber % buildPatterns.length];
    } else if (phase === 'peak') {
      // Race-specific patterns
      return weekNumber % 2 === 0 ? patterns.raceSpecificMediumLong : patterns.tempoMediumLong;
    } else {
      return patterns.aerobicMediumLong; // Default for recovery/taper
    }
  }
  
  /**
   * Get all medium-long run patterns following Pfitzinger's methodology
   */
  private getMediumLongPatterns(): Record<string, MediumLongRunPattern> {
    return {
      // Pattern 1: Pure aerobic medium-long (base phase)
      aerobicMediumLong: {
        name: 'Aerobic Medium-Long Run',
        description: '12-14 mile steady aerobic run building endurance base',
        totalDuration: 85, // ~12-13 miles at 6:30-7:00 pace
        segments: [
          {
            duration: 85,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Steady aerobic effort, conversational throughout',
            paceTarget: { min: 6.5, max: 7.0 }
          }
        ],
        adaptationTarget: 'Aerobic capacity, mitochondrial density, fat oxidation',
        estimatedTSS: 75,
        recoveryTime: 18
      },
      
      // Pattern 2: Medium-long with embedded tempo (signature Pfitzinger)
      tempoMediumLong: {
        name: 'Medium-Long Run with Tempo',
        description: '14-15 mile run with 4-6 mile tempo segment (signature Pfitzinger workout)',
        totalDuration: 95, // ~14-15 miles
        segments: [
          {
            duration: 25,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy warm-up, prepare for tempo effort',
            paceTarget: { min: 6.5, max: 7.0 }
          },
          {
            duration: 30, // ~4-5 miles of tempo
            intensity: 84,
            zone: TRAINING_ZONES.TEMPO,
            description: 'Lactate threshold pace, controlled discomfort',
            paceTarget: { min: 5.9, max: 6.2 }
          },
          {
            duration: 40,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy cool-down, maintain form despite fatigue',
            paceTarget: { min: 6.5, max: 7.0 }
          }
        ],
        adaptationTarget: 'Lactate threshold, marathon-specific endurance',
        estimatedTSS: 105,
        recoveryTime: 24
      },
      
      // Pattern 3: Medium-long with marathon pace segments
      marathonPaceMediumLong: {
        name: 'Medium-Long Run with Marathon Pace',
        description: '13-15 mile run with marathon pace segments for race simulation',
        totalDuration: 90, // ~13-14 miles
        segments: [
          {
            duration: 20,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy warm-up',
            paceTarget: { min: 6.5, max: 7.0 }
          },
          {
            duration: 12, // ~2 miles marathon pace
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: 'Marathon race pace - practice goal pace',
            paceTarget: { min: 6.0, max: 6.3 }
          },
          {
            duration: 10,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy recovery',
            paceTarget: { min: 6.5, max: 7.0 }
          },
          {
            duration: 15, // ~2.5 miles marathon pace
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: 'Second marathon pace segment',
            paceTarget: { min: 6.0, max: 6.3 }
          },
          {
            duration: 33,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy finish, practice running easy when tired',
            paceTarget: { min: 6.5, max: 7.0 }
          }
        ],
        adaptationTarget: 'Marathon pace practice, pacing discipline, fatigue resistance',
        estimatedTSS: 95,
        recoveryTime: 20
      },
      
      // Pattern 4: Progressive medium-long run
      progressiveMediumLong: {
        name: 'Progressive Medium-Long Run',
        description: '13-16 mile progressive run finishing at marathon pace or faster',
        totalDuration: 100, // ~15-16 miles
        segments: [
          {
            duration: 35,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy start, very comfortable',
            paceTarget: { min: 6.5, max: 7.0 }
          },
          {
            duration: 30,
            intensity: 76,
            zone: TRAINING_ZONES.STEADY,
            description: 'Moderate progression, steady effort',
            paceTarget: { min: 6.2, max: 6.5 }
          },
          {
            duration: 20,
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: 'Marathon pace progression',
            paceTarget: { min: 6.0, max: 6.3 }
          },
          {
            duration: 15,
            intensity: 84,
            zone: TRAINING_ZONES.TEMPO,
            description: 'Strong finish at lactate threshold pace',
            paceTarget: { min: 5.9, max: 6.2 }
          }
        ],
        adaptationTarget: 'Progressive fatigue resistance, mental toughness, pace judgment',
        estimatedTSS: 110,
        recoveryTime: 26
      },
      
      // Pattern 5: Race-specific medium-long (peak phase)
      raceSpecificMediumLong: {
        name: 'Race-Specific Medium-Long Run',
        description: '12-14 mile run with race pace segments and surges',
        totalDuration: 85, // ~12-13 miles
        segments: [
          {
            duration: 20,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy warm-up',
            paceTarget: { min: 6.5, max: 7.0 }
          },
          {
            duration: 8, // ~1.2 miles
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: 'Marathon pace segment',
            paceTarget: { min: 6.0, max: 6.3 }
          },
          {
            duration: 5,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy recovery',
            paceTarget: { min: 6.5, max: 7.0 }
          },
          {
            duration: 3, // ~0.5 mile surge
            intensity: 87,
            zone: TRAINING_ZONES.THRESHOLD,
            description: 'Race surge simulation',
            paceTarget: { min: 5.7, max: 6.0 }
          },
          {
            duration: 7,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Recovery from surge',
            paceTarget: { min: 6.5, max: 7.0 }
          },
          {
            duration: 12, // ~2 miles
            intensity: 82,
            zone: TRAINING_ZONES.STEADY,
            description: 'Final marathon pace segment',
            paceTarget: { min: 6.0, max: 6.3 }
          },
          {
            duration: 30,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy finish',
            paceTarget: { min: 6.5, max: 7.0 }
          }
        ],
        adaptationTarget: 'Race simulation, surge response, competitive fitness',
        estimatedTSS: 100,
        recoveryTime: 22
      }
    };
  }
  
  /**
   * Create the actual workout from a selected pattern
   */
  private createMediumLongWorkout(pattern: MediumLongRunPattern, baseWorkout: PlannedWorkout): {
    name: string;
    description: string;
    workout: Workout;
  } {
    const workout: Workout = {
      type: 'long_run', // Use long_run type for medium-long runs
      primaryZone: pattern.segments[0].zone,
      segments: pattern.segments.map(segment => ({
        duration: segment.duration,
        intensity: segment.intensity,
        zone: segment.zone,
        description: segment.description,
        cadenceTarget: 180, // Standard Pfitzinger cadence target
        paceTarget: segment.paceTarget
      })),
      adaptationTarget: pattern.adaptationTarget,
      estimatedTSS: pattern.estimatedTSS,
      recoveryTime: pattern.recoveryTime
    };
    
    return {
      name: pattern.name,
      description: pattern.description,
      workout
    };
  }
  
  /**
   * Progressive difficulty scaling for medium-long runs
   * Adjusts volume and intensity based on training progression
   */
  private scaleMediumLongDifficulty(
    pattern: MediumLongRunPattern, 
    weekNumber: number, 
    phase: TrainingPhase
  ): MediumLongRunPattern {
    // Base scaling factors
    let durationScale = 1.0;
    let intensityScale = 1.0;
    
    // Progressive scaling based on week in phase
    if (phase === 'build') {
      durationScale = 0.9 + (weekNumber * 0.025); // Gradual volume increase
      intensityScale = 0.95 + (weekNumber * 0.0125); // Gradual intensity increase
    } else if (phase === 'peak') {
      durationScale = 1.1; // Maintain high volume
      intensityScale = 1.05; // Slightly higher intensity
    }
    
    // Apply scaling
    const scaledPattern = { ...pattern };
    scaledPattern.totalDuration = Math.round(pattern.totalDuration * durationScale);
    scaledPattern.segments = pattern.segments.map(segment => ({
      ...segment,
      duration: Math.round(segment.duration * durationScale),
      intensity: Math.min(95, Math.round(segment.intensity * intensityScale))
    }));
    scaledPattern.estimatedTSS = Math.round(pattern.estimatedTSS * durationScale * intensityScale);
    scaledPattern.recoveryTime = Math.round(pattern.recoveryTime * durationScale);
    
    return scaledPattern;
  }
  
  /**
   * Convert easy run to Pfitzinger-style medium-long run with embedded tempo segments
   */
  private convertToMediumLong(workout: PlannedWorkout, phase: TrainingPhase = 'build', weekNumber: number = 1): PlannedWorkout {
    const mediumLongWorkout = this.generateMediumLongRun(workout, phase, weekNumber);
    
    return {
      ...workout,
      name: mediumLongWorkout.name,
      description: mediumLongWorkout.description,
      workout: mediumLongWorkout.workout
    };
  }
  
  /**
   * Check if quality should be added to long run
   */
  private shouldAddQuality(phase: TrainingPhase, weekIndex: number): boolean {
    // Add quality to long runs in build and peak phases, every 2-3 weeks
    return (phase === 'build' || phase === 'peak') && weekIndex % 3 === 0;
  }
  
  /**
   * Add quality segments to long run
   */
  private addQualityToLongRun(workout: PlannedWorkout): PlannedWorkout {
    const baseWorkout = workout.workout;
    const totalDuration = baseWorkout.segments.reduce((sum, seg) => sum + seg.duration, 0);
    
    // Add tempo segments to long run
    const qualityLongRun: Workout = {
      ...baseWorkout,
      segments: [
        {
          duration: totalDuration * 0.4,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: 'Easy pace warm-up'
        },
        {
          duration: totalDuration * 0.3,
          intensity: 84,
          zone: TRAINING_ZONES.TEMPO,
          description: 'Marathon pace segment'
        },
        {
          duration: totalDuration * 0.3,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: 'Easy pace cool-down'
        }
      ],
      adaptationTarget: 'Marathon-specific endurance with pace practice',
      estimatedTSS: Math.round(baseWorkout.estimatedTSS * 1.2)
    };
    
    return {
      ...workout,
      name: 'Long Run with Quality',
      description: 'Long run with marathon pace segment',
      workout: qualityLongRun
    };
  }
  
  /**
   * Check if workout should be a tune-up race
   */
  private shouldBeRace(weeksToGoal: number): boolean {
    // Pfitzinger recommends races at 8-10 weeks and 4-5 weeks before goal
    return weeksToGoal === 8 || weeksToGoal === 9 || weeksToGoal === 4 || weeksToGoal === 5;
  }
  
  /**
   * Convert long run to tune-up race
   */
  private convertToRace(workout: PlannedWorkout, weeksToGoal: number): PlannedWorkout {
    const raceDistance = weeksToGoal > 6 ? '15k' : '10k'; // Longer race earlier
    
    const raceWorkout: Workout = {
      type: 'race_pace',
      primaryZone: TRAINING_ZONES.THRESHOLD,
      segments: [
        {
          duration: 15,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: 'Pre-race warm-up'
        },
        {
          duration: weeksToGoal > 6 ? 50 : 35, // 15K or 10K duration
          intensity: 92,
          zone: TRAINING_ZONES.THRESHOLD,
          description: `${raceDistance} race effort`
        },
        {
          duration: 10,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: 'Cool-down jog'
        }
      ],
      adaptationTarget: 'Race practice, pace judgment, mental preparation',
      estimatedTSS: 110,
      recoveryTime: 48
    };
    
    return {
      ...workout,
      name: `${raceDistance} Tune-up Race`,
      description: `Race simulation ${weeksToGoal} weeks before goal`,
      workout: raceWorkout
    };
  }
  
  // ===============================
  // PFITZINGER WEEKLY STRUCTURE SYSTEM
  // ===============================
  
  /**
   * Generate comprehensive Pfitzinger weekly structure with specific day patterns,
   * workout spacing, threshold volume progression, and race-specific pace work
   */
  private generatePfitzingerWeeklyStructure(phase: TrainingPhase, weekIndex: number): PfitzingerWeeklyStructure {
    const baseStructure = this.getPfitzingerBaseStructure(phase);
    const volumeProgression = this.calculateThresholdVolumeProgression(phase, weekIndex);
    const raceIntegration = this.getRaceSpecificIntegration(phase, weekIndex);
    
    return this.applyPfitzingerWeeklySpacing(baseStructure, volumeProgression, raceIntegration, weekIndex);
  }
  
  /**
   * Get Pfitzinger base weekly structure by training phase
   * Following authentic Pfitzinger day-of-week patterns
   */
  private getPfitzingerBaseStructure(phase: TrainingPhase): PfitzingerWeeklyStructure {
    const structures: Record<TrainingPhase, PfitzingerWeeklyStructure> = {
      'base': {
        pattern: 'Easy-GA-Easy-LT-Recovery-Long-Recovery',
        dayStructure: {
          monday: { type: 'easy', purpose: 'recovery_from_weekend', intensity: 65 },
          tuesday: { type: 'general_aerobic', purpose: 'aerobic_development', intensity: 72 },
          wednesday: { type: 'easy', purpose: 'active_recovery', intensity: 65 },
          thursday: { type: 'lactate_threshold', purpose: 'lt_development', intensity: 85 },
          friday: { type: 'recovery', purpose: 'preparation_for_long', intensity: 60 },
          saturday: { type: 'long_run', purpose: 'endurance_development', intensity: 70 },
          sunday: { type: 'recovery', purpose: 'complete_rest_or_easy', intensity: 60 }
        },
        workoutSpacing: {
          hardDaySpacing: 48, // hours between quality sessions
          recoveryRatio: 0.4, // 40% of week should be recovery
          qualityDays: ['tuesday', 'thursday', 'saturday']
        },
        thresholdVolume: {
          weeklyMinutes: 20, // Start with 20 minutes/week
          progressionRate: 1.15, // 15% increase per week
          maxVolume: 45 // Cap at 45 minutes/week
        },
        focusAreas: ['Aerobic base building', 'LT introduction', 'Mileage progression']
      },
      
      'build': {
        pattern: 'Easy-LT-MLR-Tempo-Recovery-LongQuality-Easy',
        dayStructure: {
          monday: { type: 'easy', purpose: 'recovery_from_weekend', intensity: 65 },
          tuesday: { type: 'lactate_threshold', purpose: 'lt_maintenance', intensity: 87 },
          wednesday: { type: 'medium_long', purpose: 'endurance_with_quality', intensity: 75 },
          thursday: { type: 'tempo', purpose: 'threshold_development', intensity: 84 },
          friday: { type: 'recovery', purpose: 'preparation_for_long', intensity: 60 },
          saturday: { type: 'long_quality', purpose: 'marathon_simulation', intensity: 73 },
          sunday: { type: 'easy', purpose: 'active_recovery', intensity: 65 }
        },
        workoutSpacing: {
          hardDaySpacing: 48,
          recoveryRatio: 0.35, // Reduced recovery as fitness improves
          qualityDays: ['tuesday', 'wednesday', 'thursday', 'saturday']
        },
        thresholdVolume: {
          weeklyMinutes: 35, // Peak threshold volume
          progressionRate: 1.05, // Slower progression at higher volume
          maxVolume: 50
        },
        focusAreas: ['Threshold progression', 'Medium-long runs', 'Marathon pace work']
      },
      
      'peak': {
        pattern: 'Easy-VO2-MLR-LT-Recovery-RaceSimulation-Recovery',
        dayStructure: {
          monday: { type: 'easy', purpose: 'recovery_from_weekend', intensity: 65 },
          tuesday: { type: 'vo2max', purpose: 'peak_power_development', intensity: 95 },
          wednesday: { type: 'medium_long', purpose: 'race_specific_endurance', intensity: 78 },
          thursday: { type: 'lactate_threshold', purpose: 'race_pace_preparation', intensity: 87 },
          friday: { type: 'recovery', purpose: 'preparation_for_race_simulation', intensity: 60 },
          saturday: { type: 'race_simulation', purpose: 'competitive_preparation', intensity: 82 },
          sunday: { type: 'recovery', purpose: 'complete_recovery', intensity: 60 }
        },
        workoutSpacing: {
          hardDaySpacing: 48,
          recoveryRatio: 0.30, // Minimal recovery for peak fitness
          qualityDays: ['tuesday', 'wednesday', 'thursday', 'saturday']
        },
        thresholdVolume: {
          weeklyMinutes: 25, // Reduced volume for peak phase
          progressionRate: 1.0, // No progression, maintain
          maxVolume: 30
        },
        focusAreas: ['Race simulation', 'Peak power', 'Competitive readiness']
      },
      
      'taper': {
        pattern: 'Easy-Tempo-Easy-LT-Recovery-RaceTune-Recovery',
        dayStructure: {
          monday: { type: 'easy', purpose: 'gentle_recovery', intensity: 65 },
          tuesday: { type: 'tempo', purpose: 'sharpening', intensity: 84 },
          wednesday: { type: 'easy', purpose: 'maintenance', intensity: 65 },
          thursday: { type: 'lactate_threshold', purpose: 'race_feel', intensity: 87 },
          friday: { type: 'recovery', purpose: 'complete_rest', intensity: 55 },
          saturday: { type: 'race_tune', purpose: 'race_readiness', intensity: 85 },
          sunday: { type: 'recovery', purpose: 'pre_race_rest', intensity: 55 }
        },
        workoutSpacing: {
          hardDaySpacing: 72, // More recovery during taper
          recoveryRatio: 0.50, // Increased recovery
          qualityDays: ['tuesday', 'thursday', 'saturday']
        },
        thresholdVolume: {
          weeklyMinutes: 15, // Minimal threshold work
          progressionRate: 0.90, // Slight reduction
          maxVolume: 20
        },
        focusAreas: ['Race sharpening', 'Recovery optimization', 'Mental preparation']
      },
      
      'recovery': {
        pattern: 'Recovery-Easy-Recovery-Easy-Recovery-Easy-Recovery',
        dayStructure: {
          monday: { type: 'recovery', purpose: 'complete_rest', intensity: 55 },
          tuesday: { type: 'easy', purpose: 'gentle_movement', intensity: 62 },
          wednesday: { type: 'recovery', purpose: 'active_recovery', intensity: 55 },
          thursday: { type: 'easy', purpose: 'gentle_movement', intensity: 62 },
          friday: { type: 'recovery', purpose: 'complete_rest', intensity: 55 },
          saturday: { type: 'easy', purpose: 'optional_easy_run', intensity: 62 },
          sunday: { type: 'recovery', purpose: 'complete_rest', intensity: 55 }
        },
        workoutSpacing: {
          hardDaySpacing: 168, // No hard days
          recoveryRatio: 0.70, // Maximum recovery
          qualityDays: []
        },
        thresholdVolume: {
          weeklyMinutes: 0, // No threshold work
          progressionRate: 1.0,
          maxVolume: 0
        },
        focusAreas: ['Complete recovery', 'Injury prevention', 'Adaptation integration']
      }
    };
    
    return structures[phase] || structures['base'];
  }
  
  /**
   * Calculate progressive threshold volume following Pfitzinger protocols
   */
  private calculateThresholdVolumeProgression(phase: TrainingPhase, weekIndex: number): ThresholdVolumeProgression {
    const baseStructure = this.getPfitzingerBaseStructure(phase);
    const currentWeek = weekIndex + 1;
    
    // Apply Pfitzinger's progression principles
    let weeklyVolume = baseStructure.thresholdVolume.weeklyMinutes;
    
    // Progressive buildup in base and build phases
    if (phase === 'base' || phase === 'build') {
      weeklyVolume = Math.min(
        baseStructure.thresholdVolume.weeklyMinutes * Math.pow(baseStructure.thresholdVolume.progressionRate, Math.floor(currentWeek / 2)),
        baseStructure.thresholdVolume.maxVolume
      );
    }
    
    // Maintenance in peak phase
    if (phase === 'peak') {
      weeklyVolume = baseStructure.thresholdVolume.weeklyMinutes;
    }
    
    // Reduction in taper phase
    if (phase === 'taper') {
      const taperReduction = Math.pow(0.85, currentWeek); // 15% reduction per week
      weeklyVolume = baseStructure.thresholdVolume.weeklyMinutes * taperReduction;
    }
    
    return {
      weeklyMinutes: Math.round(weeklyVolume),
      sessionDistribution: this.distributeThresholdVolume(weeklyVolume, phase),
      intensityTargets: this.getThresholdIntensityTargets(phase),
      recoveryRequirements: this.getThresholdRecoveryRequirements(weeklyVolume)
    };
  }
  
  /**
   * Distribute threshold volume across weekly sessions
   */
  private distributeThresholdVolume(totalMinutes: number, phase: TrainingPhase): Record<string, number> {
    if (totalMinutes === 0) return {};
    
    const distributions: Record<TrainingPhase, Record<string, number>> = {
      'base': {
        'thursday': 1.0 // Single LT session
      },
      'build': {
        'tuesday': 0.6, // Primary LT session
        'thursday': 0.4  // Secondary tempo session
      },
      'peak': {
        'tuesday': 0.5, // VO2max with LT elements
        'thursday': 0.5  // Pure LT session
      },
      'taper': {
        'thursday': 1.0 // Single sharpening session
      },
      'recovery': {} // No threshold work
    };
    
    const distribution = distributions[phase] || distributions['base'];
    const result: Record<string, number> = {};
    
    Object.entries(distribution).forEach(([day, ratio]) => {
      result[day] = Math.round(totalMinutes * ratio);
    });
    
    return result;
  }
  
  /**
   * Get threshold intensity targets by phase
   */
  private getThresholdIntensityTargets(phase: TrainingPhase): Record<string, number> {
    const targets: Record<TrainingPhase, Record<string, number>> = {
      'base': { 'lactate_threshold': 85, 'tempo': 84 },
      'build': { 'lactate_threshold': 87, 'tempo': 84, 'medium_long_quality': 75 },
      'peak': { 'lactate_threshold': 87, 'vo2max': 95, 'race_pace': 82 },
      'taper': { 'lactate_threshold': 87, 'tempo': 84 },
      'recovery': {}
    };
    
    return targets[phase] || targets['base'];
  }
  
  /**
   * Get threshold recovery requirements
   */
  private getThresholdRecoveryRequirements(weeklyVolume: number): RecoveryRequirements {
    return {
      hoursAfterLT: Math.max(36, weeklyVolume * 0.8), // Minimum 36 hours, scales with volume
      hoursBeforeLT: Math.max(24, weeklyVolume * 0.6), // Minimum 24 hours preparation
      easyDayIntensity: Math.max(60, 70 - (weeklyVolume * 0.2)), // Easier recovery as volume increases
      recoveryDayFrequency: weeklyVolume > 30 ? 2 : 1 // More recovery days at high volume
    };
  }
  
  /**
   * Integrate race-specific pace work following Pfitzinger progression
   */
  private getRaceSpecificIntegration(phase: TrainingPhase, weekIndex: number): RaceSpecificIntegration {
    const raceWeeksOut = this.estimateWeeksToRace(phase, weekIndex);
    
    return {
      marathonPaceVolume: this.calculateMarathonPaceVolume(phase, raceWeeksOut),
      raceSimulationFrequency: this.getRaceSimulationFrequency(phase, raceWeeksOut),
      taperIntegration: this.getTaperIntegration(phase, raceWeeksOut),
      tuneUpRaces: this.getTuneUpRaceSchedule(phase, raceWeeksOut)
    };
  }
  
  /**
   * Calculate marathon pace volume progression
   */
  private calculateMarathonPaceVolume(phase: TrainingPhase, weeksToRace: number): number {
    if (phase === 'base') return 0; // No race pace in base
    
    if (phase === 'build') {
      // Gradual introduction 12-16 weeks out
      if (weeksToRace > 12) return 0;
      if (weeksToRace > 8) return 10; // 10 minutes/week
      if (weeksToRace > 4) return 15; // 15 minutes/week
      return 20; // Peak race pace volume
    }
    
    if (phase === 'peak') {
      // Peak race pace work 4-8 weeks out
      if (weeksToRace > 6) return 25;
      if (weeksToRace > 2) return 30;
      return 20; // Slight reduction very close to race
    }
    
    if (phase === 'taper') {
      // Minimal race pace to maintain feel
      return Math.max(5, 15 - weeksToRace * 2);
    }
    
    return 0;
  }
  
  /**
   * Get race simulation frequency
   */
  private getRaceSimulationFrequency(phase: TrainingPhase, weeksToRace: number): number {
    if (phase === 'peak' && weeksToRace <= 8) {
      return weeksToRace <= 4 ? 2 : 1; // Every 2 weeks close to race, weekly very close
    }
    
    if (phase === 'build' && weeksToRace <= 12) {
      return 0.5; // Every other week
    }
    
    return 0; // No race simulations in base or taper
  }
  
  /**
   * Get taper integration requirements
   */
  private getTaperIntegration(phase: TrainingPhase, weeksToRace: number): TaperIntegration {
    if (phase !== 'taper') {
      return { volumeReduction: 0, intensityMaintenance: 1.0, sharpening: false };
    }
    
    return {
      volumeReduction: Math.min(0.6, 0.15 * (4 - weeksToRace)), // Progressive 15% reduction per week
      intensityMaintenance: 1.0, // Keep intensity high
      sharpening: weeksToRace <= 2 // Final sharpening in last 2 weeks
    };
  }
  
  /**
   * Get tune-up race schedule
   */
  private getTuneUpRaceSchedule(phase: TrainingPhase, weeksToRace: number): TuneUpRace[] {
    const tuneUps: TuneUpRace[] = [];
    
    if (phase === 'build' && weeksToRace >= 8 && weeksToRace <= 12) {
      tuneUps.push({
        distance: '10K',
        weeksOut: Math.floor(weeksToRace),
        purpose: 'fitness_assessment',
        intensity: 95
      });
    }
    
    if (phase === 'peak' && weeksToRace >= 3 && weeksToRace <= 6) {
      tuneUps.push({
        distance: 'half_marathon',
        weeksOut: Math.floor(weeksToRace),
        purpose: 'race_simulation',
        intensity: 90
      });
    }
    
    return tuneUps;
  }
  
  /**
   * Estimate weeks to target race (simplified)
   */
  private estimateWeeksToRace(phase: TrainingPhase, weekIndex: number): number {
    // Simplified estimation based on phase
    const phaseWeeksToRace: Record<TrainingPhase, number> = {
      'base': 16 - weekIndex,
      'build': 8 - weekIndex,
      'peak': 4 - weekIndex,
      'taper': 2 - weekIndex,
      'recovery': 20 - weekIndex
    };
    
    return Math.max(1, phaseWeeksToRace[phase] || 8);
  }
  
  /**
   * Apply Pfitzinger workout spacing principles
   */
  private applyPfitzingerWeeklySpacing(
    baseStructure: PfitzingerWeeklyStructure,
    volumeProgression: ThresholdVolumeProgression,
    raceIntegration: RaceSpecificIntegration,
    weekIndex: number
  ): PfitzingerWeeklyStructure {
    const enhancedStructure = { ...baseStructure };
    
    // Apply threshold volume distribution
    Object.entries(volumeProgression.sessionDistribution).forEach(([day, minutes]) => {
      if (enhancedStructure.dayStructure[day as keyof typeof enhancedStructure.dayStructure]) {
        enhancedStructure.dayStructure[day as keyof typeof enhancedStructure.dayStructure].thresholdMinutes = minutes;
      }
    });
    
    // Apply race-specific pace work
    if (raceIntegration.marathonPaceVolume > 0) {
      // Integrate marathon pace into medium-long runs and long runs
      ['wednesday', 'saturday'].forEach(day => {
        const dayStructure = enhancedStructure.dayStructure[day as keyof typeof enhancedStructure.dayStructure];
        if (dayStructure && (dayStructure.type === 'medium_long' || dayStructure.type === 'long_quality')) {
          dayStructure.marathonPaceMinutes = Math.round(raceIntegration.marathonPaceVolume * 0.6);
        }
      });
    }
    
    // Apply weekly variations for optimal adaptation
    const weekVariation = this.getWeeklyVariation(weekIndex);
    enhancedStructure.weeklyVariation = weekVariation;
    
    return enhancedStructure;
  }
  
  /**
   * Get weekly variation to prevent monotony
   */
  private getWeeklyVariation(weekIndex: number): WeeklyVariation {
    const variations: WeeklyVariation[] = [
      { name: 'standard', volumeMultiplier: 1.0, intensityMultiplier: 1.0 },
      { name: 'volume_emphasis', volumeMultiplier: 1.15, intensityMultiplier: 0.95 },
      { name: 'intensity_emphasis', volumeMultiplier: 0.90, intensityMultiplier: 1.10 },
      { name: 'recovery', volumeMultiplier: 0.80, intensityMultiplier: 0.90 }
    ];
    
    // 3-week cycles with built-in recovery
    const cyclePosition = weekIndex % 4;
    return variations[cyclePosition] || variations[0];
  }
  
  /**
   * Get Pfitzinger weekly pattern
   */
  private getPfitzingerWeeklyPattern(phase: TrainingPhase, weekIndex: number): string {
    const weeklyStructure = this.generatePfitzingerWeeklyStructure(phase, weekIndex);
    return weeklyStructure.pattern;
  }
  
  /**
   * Get Pfitzinger phase focus areas
   */
  private getPfitzingerPhaseFocus(phase: TrainingPhase): string[] {
    switch (phase) {
      case 'base':
        return ['Aerobic base', 'Lactate threshold introduction', 'Running economy', 'Mileage buildup'];
      case 'build':
        return ['Lactate threshold development', 'Marathon pace work', 'Medium-long runs', 'Endurance'];
      case 'peak':
        return ['Race-specific fitness', 'Tune-up races', 'VO2max touches', 'Peak mileage'];
      case 'taper':
        return ['Maintain fitness', 'Reduce fatigue', 'Race preparation', 'Sharpening'];
      case 'recovery':
        return ['Active recovery', 'Base maintenance', 'Preparation for next cycle'];
      default:
        return ['General endurance development'];
    }
  }
  
  /**
   * Check if workout is marathon-specific
   */
  private isMarathonSpecificWorkout(type: WorkoutType, phase: TrainingPhase): boolean {
    return (type === 'tempo' || type === 'threshold' || type === 'progression') &&
           (phase === 'build' || phase === 'peak');
  }
  
  /**
   * Get marathon-specific pace targets
   */
  private getMarathonPaceTarget(zoneName: string): { min: number; max: number } {
    // Marathon pace is typically at the lower end of tempo zone
    switch (zoneName) {
      case 'Tempo':
        return { min: 4.5, max: 4.7 }; // Example: 4:30-4:42 per km for 3:10 marathon
      case 'Threshold':
        return { min: 4.3, max: 4.5 }; // Slightly faster than marathon pace
      default:
        return { min: 5.0, max: 5.5 };
    }
  }
  
  /**
   * Adjust intensity for Pfitzinger methodology
   */
  private adjustIntensityForPfitzinger(
    baseIntensity: number, 
    workoutType: WorkoutType, 
    phase: TrainingPhase,
    weekNumber: number
  ): number {
    let adjustment = 1.0;
    
    // Pfitzinger emphasizes quality throughout
    switch (workoutType) {
      case 'easy':
        // Keep easy runs moderate - not too slow
        adjustment = 0.95;
        break;
      
      case 'steady':
        // Steady runs are important
        adjustment = 1.00;
        break;
      
      case 'tempo':
        // Tempo is key for marathon training
        adjustment = phase === 'peak' ? 1.05 : 1.02;
        break;
      
      case 'threshold':
        // Lactate threshold is central to Pfitzinger
        adjustment = phase === 'build' || phase === 'peak' ? 1.08 : 1.05;
        break;
      
      case 'progression':
        // Progression runs build fatigue resistance
        adjustment = 1.05;
        break;
      
      case 'vo2max':
        // Limited but intense when used
        adjustment = phase === 'peak' ? 1.10 : 1.00;
        break;
      
      case 'long_run':
        // Long runs not too slow
        adjustment = 0.98;
        break;
      
      default:
        adjustment = 1.00;
    }
    
    // Apply aggressive progression in build phase
    if (phase === 'build') {
      const progressionMultiplier = 1.0 + (weekNumber * 0.01); // 1% per week
      adjustment *= progressionMultiplier;
    }
    
    const adjustedIntensity = baseIntensity * adjustment;
    return Math.max(50, Math.min(100, Math.round(adjustedIntensity)));
  }
  
  /**
   * Enhance descriptions with Pfitzinger terminology
   */
  private enhancePfitzingerDescription(baseDescription: string, workoutType: WorkoutType, phase: TrainingPhase): string {
    const pfitzingerTerms: Partial<Record<WorkoutType, string>> = {
      'easy': 'General aerobic run - comfortable effort',
      'steady': 'Medium-long run - sustained aerobic development',
      'tempo': 'Marathon pace run - race rhythm development',
      'threshold': 'Lactate threshold run - push the red line',
      'progression': 'Progressive long run - negative split practice',
      'vo2max': 'VO2max intervals - top-end speed',
      'long_run': 'Endurance long run - time on feet',
      'recovery': 'Recovery run - easy regeneration',
      'race_pace': 'Tune-up race - competitive sharpening',
      'hill_repeats': 'Hill workout - strength and power',
      'fartlek': 'Fartlek - varied pace training',
      'time_trial': 'Time trial - fitness assessment',
      'cross_training': 'Cross-training - active recovery',
      'strength': 'Strength training - injury prevention'
    };
    
    const enhancement = pfitzingerTerms[workoutType];
    return enhancement ? `${enhancement} - ${baseDescription}` : baseDescription;
  }
  
  /**
   * Get Pfitzinger-specific adaptation targets
   */
  private getPfitzingerAdaptationTarget(workoutType: WorkoutType, phase: TrainingPhase): string {
    const adaptationTargets: Partial<Record<WorkoutType, Record<TrainingPhase, string>>> = {
      'threshold': {
        'base': 'Lactate threshold introduction, aerobic power development',
        'build': 'Lactate threshold improvement, marathon pace efficiency',
        'peak': 'Peak lactate clearance, race-specific endurance',
        'taper': 'Maintain threshold fitness with reduced volume',
        'recovery': 'Light threshold maintenance'
      },
      'tempo': {
        'base': 'Marathon pace introduction, rhythm development',
        'build': 'Marathon pace efficiency, glycogen utilization',
        'peak': 'Race pace lock-in, mental preparation',
        'taper': 'Race pace feel, confidence building',
        'recovery': 'Easy tempo for base maintenance'
      },
      'progression': {
        'base': 'Negative split practice, fatigue resistance',
        'build': 'Late-race strength, glycogen depletion training',
        'peak': 'Race simulation, pacing discipline',
        'taper': 'Pace control, race strategy',
        'recovery': 'Light progression for maintenance'
      },
      'long_run': {
        'base': 'Aerobic base, time on feet, mental toughness',
        'build': 'Endurance with quality, marathon simulation',
        'peak': 'Race-specific endurance, fuel utilization',
        'taper': 'Maintain endurance, reduce fatigue',
        'recovery': 'Easy long run for base maintenance'
      }
    };
    
    return adaptationTargets[workoutType]?.[phase] || 
           `${workoutType} adaptation for ${phase} phase in Pfitzinger system`;
  }
  
  /**
   * Adjust TSS for Pfitzinger's higher quality approach
   */
  private adjustTSSForPfitzinger(baseTSS: number, workoutType: WorkoutType): number {
    const tssMultipliers: Partial<Record<WorkoutType, number>> = {
      'threshold': 1.15, // Higher stress from threshold work
      'tempo': 1.10,
      'progression': 1.12,
      'steady': 1.05,
      'long_run': 1.08, // Quality long runs
      'easy': 1.00,
      'recovery': 0.90,
      'vo2max': 1.20,
      'race_pace': 1.25
    };
    
    const multiplier = tssMultipliers[workoutType] || 1.00;
    return Math.round(baseTSS * multiplier);
  }
  
  // ===============================
  // LACTATE THRESHOLD-BASED PACE SYSTEM
  // ===============================
  
  /**
   * Calculate lactate threshold pace as foundation for all other paces
   * Requirement 3.3: Use LT pace as foundation for all other pace zones
   */
  private calculateLactateThresholdPace(plan: TrainingPlan): number {
    const currentFitness = plan.config.currentFitness;
    
    if (currentFitness?.vdot) {
      // Use existing calculateLactateThreshold from calculator.ts
      const ltVelocity = calculateLactateThreshold(currentFitness.vdot); // km/h
      return 60 / ltVelocity; // Convert to min/km
    }
    
    // Estimate from recent performances or default
    if (currentFitness?.recentRaces?.length) {
      const bestRace = currentFitness.recentRaces
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      // Estimate LT pace from race performance using Jack Daniels' formulas
      const raceVDOT = calculateVDOT(bestRace.distance, bestRace.time);
      const ltVelocity = calculateLactateThreshold(raceVDOT);
      return 60 / ltVelocity;
    }
    
    // Default LT pace for recreational runners (5:00/km)
    return 5.0;
  }
  
  /**
   * Calculate all Pfitzinger training paces based on lactate threshold
   * Pfitzinger derives all paces from LT as the foundation
   */
  private calculatePfitzingerPaces(ltPace: number): PfitzingerTrainingPaces {
    return {
      // Recovery: 30-45 seconds slower than LT pace
      recovery: {
        min: ltPace + 0.5,
        max: ltPace + 0.75,
        target: ltPace + 0.625
      },
      
      // General aerobic: 15-30 seconds slower than LT pace
      generalAerobic: {
        min: ltPace + 0.25,
        max: ltPace + 0.5,
        target: ltPace + 0.375
      },
      
      // Marathon pace: 10-15 seconds slower than LT pace
      marathonPace: {
        min: ltPace + 0.167,
        max: ltPace + 0.25,
        target: ltPace + 0.208
      },
      
      // Lactate threshold: The foundation pace
      lactateThreshold: {
        min: ltPace - 0.05,
        max: ltPace + 0.05,
        target: ltPace
      },
      
      // VO2max: 10-15 seconds faster than LT pace
      vo2max: {
        min: ltPace - 0.25,
        max: ltPace - 0.167,
        target: ltPace - 0.208
      },
      
      // Neuromuscular power: 20-30 seconds faster than LT pace
      neuromuscular: {
        min: ltPace - 0.5,
        max: ltPace - 0.333,
        target: ltPace - 0.417
      }
    };
  }
  
  /**
   * Apply LT-based pacing to workout
   */
  private applyLTBasedPacing(
    workout: PlannedWorkout, 
    paces: PfitzingerTrainingPaces, 
    ltPace: number
  ): PlannedWorkout {
    const pacedSegments = workout.workout.segments.map(segment => {
      const paceRange = this.getPaceRangeForZone(segment.zone.name, paces);
      
      return {
        ...segment,
        paceTarget: paceRange.target,
        paceRange: { min: paceRange.min, max: paceRange.max },
        description: this.enhancePaceDescription(segment.description, paceRange, segment.zone.name)
      };
    });
    
    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: pacedSegments,
        metadata: {
          ...workout.workout.metadata,
          lactateThresholdBased: true,
          foundationPace: ltPace
        }
      }
    };
  }
  
  /**
   * Get pace range for training zone based on Pfitzinger system
   */
  private getPaceRangeForZone(zoneName: string, paces: PfitzingerTrainingPaces): PaceRange {
    const zoneMapping: Record<string, keyof PfitzingerTrainingPaces> = {
      'RECOVERY': 'recovery',
      'EASY': 'generalAerobic', 
      'MARATHON': 'marathonPace',
      'TEMPO': 'lactateThreshold',
      'THRESHOLD': 'lactateThreshold',
      'VO2_MAX': 'vo2max',
      'SPEED': 'neuromuscular',
      'NEUROMUSCULAR': 'neuromuscular'
    };
    
    const paceKey = zoneMapping[zoneName] || 'generalAerobic';
    return paces[paceKey];
  }
  
  /**
   * Apply progressive threshold volume calculations
   * Requirement 3.1: Progressive threshold volume calculations
   */
  private applyThresholdVolumeProgression(plan: TrainingPlan): TrainingPlan {
    const totalWeeks = plan.weeks?.length || plan.summary?.totalWeeks || 12;
    const thresholdProgression = this.calculateLegacyThresholdVolumeProgression(plan);
    
    // Apply threshold volume to each week
    const enhancedWorkouts = plan.workouts.map((workout, index) => {
      const weekIndex = Math.floor(index / 7);
      const targetThresholdVolume = thresholdProgression[weekIndex] || thresholdProgression[0];
      
      if (this.isThresholdWorkout(workout.type)) {
        return this.adjustWorkoutForThresholdVolume(workout, targetThresholdVolume);
      }
      
      return workout;
    });
    
    return {
      ...plan,
      workouts: enhancedWorkouts
    };
  }
  
  /**
   * Calculate threshold volume progression following Pfitzinger's approach (legacy method)
   */
  private calculateLegacyThresholdVolumeProgression(plan: TrainingPlan): number[] {
    const totalWeeks = plan.weeks?.length || plan.summary?.totalWeeks || 12;
    const baseThresholdVolume = 20; // Start with 20 minutes per week
    const peakThresholdVolume = 60; // Build to 60 minutes per week
    
    const progression: number[] = [];
    
    for (let week = 0; week < totalWeeks; week++) {
      const progressRatio = week / (totalWeeks - 1);
      
      // Pfitzinger builds threshold volume gradually with recovery weeks
      let weeklyVolume: number;
      
      if (week % 4 === 3) {
        // Recovery week: reduce volume by 25%
        weeklyVolume = baseThresholdVolume + (peakThresholdVolume - baseThresholdVolume) * progressRatio * 0.75;
      } else {
        // Build weeks: progressive increase
        weeklyVolume = baseThresholdVolume + (peakThresholdVolume - baseThresholdVolume) * progressRatio;
      }
      
      progression.push(Math.round(weeklyVolume));
    }
    
    return progression;
  }
  
  /**
   * Check if workout is threshold-based
   */
  private isThresholdWorkout(workoutType: WorkoutType): boolean {
    return ['threshold', 'tempo', 'progression', 'race_pace'].includes(workoutType);
  }
  
  /**
   * Adjust workout duration based on target threshold volume
   */
  private adjustWorkoutForThresholdVolume(workout: PlannedWorkout, targetVolume: number): PlannedWorkout {
    const thresholdSegments = workout.workout.segments.filter(seg => 
      seg.intensity >= 84 && seg.intensity <= 92 // Threshold intensity range
    );
    
    const currentThresholdTime = thresholdSegments.reduce((sum, seg) => sum + seg.duration, 0);
    
    if (currentThresholdTime === 0) return workout; // No threshold segments
    
    const adjustmentFactor = targetVolume / currentThresholdTime;
    const cappedAdjustment = Math.max(0.5, Math.min(2.0, adjustmentFactor)); // Limit adjustment
    
    const adjustedSegments = workout.workout.segments.map(segment => {
      if (segment.intensity >= 84 && segment.intensity <= 92) {
        return {
          ...segment,
          duration: Math.round(segment.duration * cappedAdjustment)
        };
      }
      return segment;
    });
    
    return {
      ...workout,
      workout: {
        ...workout.workout,
        segments: adjustedSegments,
        estimatedTSS: Math.round(workout.workout.estimatedTSS * cappedAdjustment)
      }
    };
  }
  
  /**
   * Generate LT-based training zones
   * Requirement 3.3: Implement LT-based zone derivations
   */
  private generateLTBasedZones(ltPace: number): Record<string, TrainingZone> {
    const ltBasedZones: Record<string, TrainingZone> = {};
    
    // Create zones based on lactate threshold as foundation
    Object.entries(TRAINING_ZONES).forEach(([key, baseZone]) => {
      const zone = { ...baseZone };
      
      if (zone.paceRange) {
        // Calculate pace ranges relative to LT pace
        const ltAdjustment = this.getLTAdjustmentForZone(key);
        zone.paceRange = {
          min: ltPace + ltAdjustment.min,
          max: ltPace + ltAdjustment.max
        };
      }
      
      // Add LT-specific descriptions
      zone.description = this.getLTBasedDescription(key, ltPace);
      
      ltBasedZones[key] = zone;
    });
    
    return ltBasedZones;
  }
  
  /**
   * Get LT-based adjustment for each zone
   */
  private getLTAdjustmentForZone(zoneName: string): { min: number; max: number } {
    const adjustments: Record<string, { min: number; max: number }> = {
      'RECOVERY': { min: 0.5, max: 0.75 },
      'EASY': { min: 0.25, max: 0.5 },
      'MARATHON': { min: 0.167, max: 0.25 },
      'TEMPO': { min: -0.05, max: 0.05 },
      'THRESHOLD': { min: -0.05, max: 0.05 },
      'VO2_MAX': { min: -0.25, max: -0.167 },
      'SPEED': { min: -0.5, max: -0.333 }
    };
    
    return adjustments[zoneName] || { min: 0, max: 0 };
  }
  
  /**
   * Get LT-based description for zone
   */
  private getLTBasedDescription(zoneName: string, ltPace: number): string {
    const paceStr = this.formatPace(ltPace);
    const adjustments = this.getLTAdjustmentForZone(zoneName);
    const minPace = this.formatPace(ltPace + adjustments.min);
    const maxPace = this.formatPace(ltPace + adjustments.max);
    
    const descriptions: Record<string, string> = {
      'RECOVERY': `Recovery pace (${minPace}-${maxPace}) - Easy effort for active recovery`,
      'EASY': `General aerobic pace (${minPace}-${maxPace}) - Conversational, aerobic base building`,
      'MARATHON': `Marathon pace (${minPace}-${maxPace}) - Sustainable race pace effort`,
      'TEMPO': `Lactate threshold pace (${minPace}-${maxPace}) - Comfortably hard, 1-hour effort`,
      'THRESHOLD': `Lactate threshold pace (${minPace}-${maxPace}) - Foundation pace (${paceStr})`,
      'VO2_MAX': `VO2max pace (${minPace}-${maxPace}) - Hard intervals, oxygen uptake`,
      'SPEED': `Neuromuscular pace (${minPace}-${maxPace}) - Short, fast repetitions`
    };
    
    return descriptions[zoneName] || `Training pace based on LT pace (${paceStr})`;
  }
  
  /**
   * Enhance pace description with LT-based context
   */
  private enhancePaceDescription(
    baseDescription: string, 
    paceRange: PaceRange, 
    zoneName: string
  ): string {
    const paceStr = `${this.formatPace(paceRange.min)}-${this.formatPace(paceRange.max)}`;
    return `${baseDescription} (${paceStr} - LT-derived ${zoneName.toLowerCase()} pace)`;
  }
  
  /**
   * Format pace for display (mm:ss)
   */
  private formatPace(paceInMinPerKm: number): string {
    const minutes = Math.floor(paceInMinPerKm);
    const seconds = Math.round((paceInMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

class HudsonPhilosophy extends BaseTrainingPhilosophy {
  constructor() {
    super('hudson', 'Brad Hudson');
  }
  
  // Hudson-specific implementations can be added later
}

class CustomPhilosophy extends BaseTrainingPhilosophy {
  constructor() {
    super('custom', 'Custom Methodology');
  }
  
  // Custom philosophy allows for user-defined parameters
}

/**
 * Utility functions for working with philosophies
 */
export const PhilosophyUtils = {
  /**
   * Compare two philosophies by their characteristics
   */
  comparePhilosophies(
    methodology1: TrainingMethodology, 
    methodology2: TrainingMethodology
  ): {
    intensityDifference: number;
    recoveryDifference: number;
    workoutPriorityOverlap: number;
  } {
    const philosophy1 = PhilosophyFactory.create(methodology1);
    const philosophy2 = PhilosophyFactory.create(methodology2);
    
    // Calculate intensity distribution difference
    const intensityDiff = Math.abs(
      philosophy1.intensityDistribution.hard - philosophy2.intensityDistribution.hard
    );
    
    // Calculate recovery emphasis difference
    const recoveryDiff = Math.abs(
      philosophy1.recoveryEmphasis - philosophy2.recoveryEmphasis
    );
    
    // Calculate workout priority overlap
    const priorities1 = new Set(philosophy1.workoutPriorities);
    const priorities2 = new Set(philosophy2.workoutPriorities);
    const intersection = new Set([...priorities1].filter(x => priorities2.has(x)));
    const union = new Set([...priorities1, ...priorities2]);
    const overlap = intersection.size / union.size;
    
    return {
      intensityDifference: intensityDiff,
      recoveryDifference: recoveryDiff,
      workoutPriorityOverlap: overlap
    };
  },
  
  /**
   * Get philosophy recommendations based on athlete characteristics
   */
  recommendPhilosophy(characteristics: {
    experience: 'beginner' | 'intermediate' | 'advanced';
    injuryHistory: boolean;
    timeAvailable: 'limited' | 'moderate' | 'extensive';
    goals: 'general_fitness' | 'race_performance' | 'competitive';
  }): TrainingMethodology[] {
    const recommendations: TrainingMethodology[] = [];
    
    // Beginner-friendly philosophies
    if (characteristics.experience === 'beginner' || characteristics.injuryHistory) {
      recommendations.push('lydiard', 'hudson');
    }
    
    // Performance-focused philosophies
    if (characteristics.goals === 'race_performance' || characteristics.goals === 'competitive') {
      recommendations.push('daniels', 'pfitzinger');
    }
    
    // Time-efficient options
    if (characteristics.timeAvailable === 'limited') {
      recommendations.push('hudson', 'daniels');
    }
    
    // Default to balanced approach if no specific recommendations
    if (recommendations.length === 0) {
      recommendations.push('custom', 'daniels');
    }
    
    return [...new Set(recommendations)]; // Remove duplicates
  }
};