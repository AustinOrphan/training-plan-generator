import {
  TrainingMethodology,
  TrainingPlan,
  PlannedWorkout,
  CompletedWorkout,
  WorkoutType,
  TrainingPhase,
  FitnessAssessment,
  EnvironmentalFactors,
  RunnerAttribute
} from './types';
import { 
  SmartAdaptationEngine, 
  ProgressData,
  PlanModification 
} from './adaptation';
import { PhilosophyFactory, TrainingPhilosophy } from './philosophies';
import { PhilosophyComparator } from './philosophy-comparator';
import { MethodologyRecommendationEngine, UserProfile } from './methodology-recommendation-engine';
import { calculateVDOTCached, calculateFitnessMetricsCached } from './calculation-cache';
import { TRAINING_METHODOLOGIES } from './constants';
import { WORKOUT_TEMPLATES } from './workouts';
import { calculateTSS } from './calculator';

// Types for customization system
export interface MethodologyConfiguration {
  methodology: TrainingMethodology;
  baseConfig: MethodologyBaseConfig;
  adaptationPatterns: AdaptationPattern[];
  customizations: CustomizationSettings;
  performanceOptimizations: PerformanceOptimization[];
  constraints: CustomizationConstraints;
  lastUpdated: Date;
}

export interface MethodologyBaseConfig {
  // Core methodology parameters
  intensityDistribution: {
    easy: number;
    moderate: number;
    hard: number;
  };
  volumeProgression: {
    weeklyIncrease: number; // Percentage
    stepBackFrequency: number; // Weeks
    stepBackReduction: number; // Percentage
  };
  workoutEmphasis: Record<WorkoutType, number>; // 1-10 scale
  periodizationModel: {
    phaseDurations: Record<TrainingPhase, number>; // Percentage of total plan
    phaseTransitions: 'sharp' | 'gradual' | 'overlap';
  };
  recoveryProtocol: {
    easyDayMinimum: number; // Percentage of max HR
    recoveryDayFrequency: number; // Days per week
    completeRestDays: number; // Days per month
  };
}

export interface AdaptationPattern {
  id: string;
  name: string;
  trigger: AdaptationTrigger;
  response: AdaptationResponse;
  frequency: number; // How often this pattern is observed
  effectiveness: number; // 0-100 scale
  lastApplied?: Date;
}

export interface AdaptationTrigger {
  type: 'performance' | 'fatigue' | 'injury_risk' | 'plateau' | 'environmental';
  conditions: {
    metric: string;
    operator: 'greater' | 'less' | 'equal' | 'between';
    value: number | [number, number];
    duration?: number; // Days condition must persist
  }[];
}

export interface AdaptationResponse {
  modifications: CustomizationModification[];
  priority: 'immediate' | 'next_week' | 'next_phase';
  duration: number; // Days to apply modification
  monitoringPeriod: number; // Days to monitor effectiveness
}

export interface CustomizationModification {
  type: 'volume' | 'intensity' | 'workout_type' | 'recovery' | 'phase_adjustment';
  target: string; // What to modify
  adjustment: number | string; // How much or what to change
  rationale: string;
}

export interface CustomizationSettings {
  // User preferences
  allowIntensityAdjustments: boolean;
  allowVolumeAdjustments: boolean;
  allowWorkoutSubstitutions: boolean;
  preferredWorkoutTypes: WorkoutType[];
  avoidWorkoutTypes: WorkoutType[];
  
  // Advanced settings
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  adaptationSpeed: 'slow' | 'normal' | 'fast';
  injuryPrevention: 'minimal' | 'standard' | 'maximum';
  
  // Environmental adaptations
  altitudeAdjustment: boolean;
  heatAdaptation: boolean;
  coldAdaptation: boolean;
  terrainSpecific: boolean;
}

export interface PerformanceOptimization {
  id: string;
  name: string;
  targetMetric: 'vdot' | 'threshold' | 'endurance' | 'speed' | 'recovery';
  currentValue: number;
  targetValue: number;
  strategy: OptimizationStrategy;
  progress: number; // 0-100 percentage
  estimatedWeeks: number;
}

export interface OptimizationStrategy {
  methodologyTweaks: MethodologyTweak[];
  workoutProgressions: WorkoutProgression[];
  recoveryEnhancements: RecoveryEnhancement[];
  nutritionGuidelines?: string[];
  supplementation?: string[];
}

export interface MethodologyTweak {
  parameter: string;
  fromValue: number;
  toValue: number;
  timeline: number; // Weeks to transition
  rationale: string;
}

export interface WorkoutProgression {
  workoutType: WorkoutType;
  currentVolume: number;
  targetVolume: number;
  currentIntensity: number;
  targetIntensity: number;
  progressionRate: number; // Percentage per week
}

export interface RecoveryEnhancement {
  type: 'sleep' | 'nutrition' | 'active_recovery' | 'massage' | 'cold_therapy';
  frequency: string;
  duration: string;
  expectedBenefit: string;
}

export interface CustomizationConstraints {
  maxWeeklyHours: number;
  maxWeeklyMiles: number;
  maxIntensityPercentage: number;
  minRecoveryDays: number;
  blackoutDates: Date[];
  medicalRestrictions: string[];
}

export interface CustomizationAnalysis {
  currentState: MethodologyState;
  recommendations: CustomizationRecommendation[];
  warnings: string[];
  projectedOutcomes: ProjectedOutcome[];
}

export interface MethodologyState {
  adherenceToPhilosophy: number; // 0-100 percentage
  customizationLevel: 'minimal' | 'moderate' | 'extensive';
  effectivenessScore: number; // 0-100
  injuryRiskLevel: 'low' | 'medium' | 'high';
  adaptationSuccess: number; // 0-100 percentage
}

export interface CustomizationRecommendation {
  id: string;
  category: 'performance' | 'injury_prevention' | 'plateau_breaking' | 'environmental';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  implementation: string[];
  timeToEffect: number; // Weeks
}

export interface ProjectedOutcome {
  metric: string;
  currentValue: number;
  projectedValue: number;
  confidence: number; // 0-100 percentage
  timeframe: number; // Weeks
  assumptions: string[];
}

/**
 * MethodologyCustomizationEngine provides advanced configuration and optimization
 * capabilities for training methodologies based on individual response patterns
 */
export class MethodologyCustomizationEngine {
  private adaptationEngine: SmartAdaptationEngine;
  private philosophyComparator: PhilosophyComparator;
  private recommendationEngine: MethodologyRecommendationEngine;
  private configurations: Map<string, MethodologyConfiguration>; // userId -> config
  private adaptationHistory: Map<string, AdaptationPattern[]>; // userId -> patterns
  
  constructor() {
    this.adaptationEngine = new SmartAdaptationEngine();
    this.philosophyComparator = new PhilosophyComparator();
    this.recommendationEngine = new MethodologyRecommendationEngine();
    this.configurations = new Map();
    this.adaptationHistory = new Map();
  }

  /**
   * Initialize or update methodology configuration for a user
   */
  public initializeConfiguration(
    userId: string,
    methodology: TrainingMethodology,
    userProfile: UserProfile,
    customSettings?: Partial<CustomizationSettings>
  ): MethodologyConfiguration {
    const baseConfig = this.createBaseConfig(methodology, userProfile);
    const adaptationPatterns = this.initializeAdaptationPatterns(methodology, userProfile);
    const customizations = this.createCustomizationSettings(userProfile, customSettings);
    const performanceOptimizations = this.createPerformanceOptimizations(userProfile, methodology);
    const constraints = this.createConstraints(userProfile);

    const configuration: MethodologyConfiguration = {
      methodology,
      baseConfig,
      adaptationPatterns,
      customizations,
      performanceOptimizations,
      constraints,
      lastUpdated: new Date()
    };

    this.configurations.set(userId, configuration);
    return configuration;
  }

  /**
   * Track individual adaptation patterns
   */
  public trackAdaptationPattern(
    userId: string,
    completedWorkouts: CompletedWorkout[],
    plannedWorkouts: PlannedWorkout[],
    modifications: PlanModification[]
  ): void {
    const progressData = this.adaptationEngine.analyzeProgress(completedWorkouts, plannedWorkouts);
    const patterns = this.identifyPatterns(progressData, modifications);
    
    const existingPatterns = this.adaptationHistory.get(userId) || [];
    const updatedPatterns = this.mergePatterns(existingPatterns, patterns);
    
    this.adaptationHistory.set(userId, updatedPatterns);
    
    // Update configuration based on learned patterns
    const config = this.configurations.get(userId);
    if (config) {
      config.adaptationPatterns = this.selectEffectivePatterns(updatedPatterns);
      config.lastUpdated = new Date();
    }
  }

  /**
   * Optimize performance based on individual response
   */
  public optimizePerformance(
    userId: string,
    plan: TrainingPlan,
    completedWorkouts: CompletedWorkout[],
    targetMetrics: string[]
  ): PerformanceOptimization[] {
    const config = this.configurations.get(userId);
    if (!config) {
      throw new Error('No configuration found for user');
    }

    const currentMetrics = this.calculateCurrentMetrics(completedWorkouts);
    const optimizations: PerformanceOptimization[] = [];

    targetMetrics.forEach(metric => {
      const optimization = this.createOptimization(
        metric,
        currentMetrics,
        config,
        plan
      );
      if (optimization) {
        optimizations.push(optimization);
      }
    });

    // Update configuration with new optimizations
    config.performanceOptimizations = optimizations;
    config.lastUpdated = new Date();

    return optimizations;
  }

  /**
   * Apply environmental adaptations
   */
  public applyEnvironmentalAdaptations(
    userId: string,
    plan: TrainingPlan,
    environmentalFactors: EnvironmentalFactors
  ): PlanModification[] {
    const config = this.configurations.get(userId);
    if (!config) {
      throw new Error('No configuration found for user');
    }

    const modifications: PlanModification[] = [];

    // Altitude adjustments
    if (environmentalFactors.altitude && environmentalFactors.altitude > 1500) {
      modifications.push(...this.createAltitudeAdjustments(
        plan,
        environmentalFactors.altitude,
        config
      ));
    }

    // Temperature adjustments
    if (environmentalFactors.typicalTemperature) {
      if (environmentalFactors.typicalTemperature > 25) {
        modifications.push(...this.createHeatAdjustments(plan, config));
      } else if (environmentalFactors.typicalTemperature < 5) {
        modifications.push(...this.createColdAdjustments(plan, config));
      }
    }

    // Terrain adjustments
    if (environmentalFactors.terrain === 'hilly' || environmentalFactors.terrain === 'trail') {
      modifications.push(...this.createTerrainAdjustments(
        plan,
        environmentalFactors.terrain,
        config
      ));
    }

    return modifications;
  }

  /**
   * Resolve conflicts between methodology principles and individual needs
   */
  public resolveMethodologyConflicts(
    userId: string,
    conflicts: MethodologyConflict[]
  ): CustomizationModification[] {
    const config = this.configurations.get(userId);
    if (!config) {
      throw new Error('No configuration found for user');
    }

    const resolutions: CustomizationModification[] = [];

    conflicts.forEach(conflict => {
      const resolution = this.createConflictResolution(conflict, config);
      if (resolution) {
        resolutions.push(resolution);
      }
    });

    return resolutions;
  }

  /**
   * Unlock advanced features based on experience
   */
  public unlockAdvancedFeatures(
    userId: string,
    experience: RunnerExperience,
    completedWeeks: number
  ): AdvancedFeature[] {
    const config = this.configurations.get(userId);
    if (!config) {
      throw new Error('No configuration found for user');
    }

    const unlockedFeatures: AdvancedFeature[] = [];

    // Experience-based unlocks
    if (experience === 'advanced' || experience === 'expert') {
      unlockedFeatures.push({
        id: 'double_threshold',
        name: 'Double Threshold Days',
        description: 'Two threshold workouts in one day for advanced adaptation',
        requirements: 'Advanced experience, 50+ weekly miles',
        implementation: this.createDoubleThresholdProtocol(config.methodology)
      });

      unlockedFeatures.push({
        id: 'super_compensation',
        name: 'Super Compensation Cycles',
        description: 'Strategic overreaching followed by taper for peak performance',
        requirements: 'Expert experience, injury-free for 6 months',
        implementation: this.createSuperCompensationProtocol(config.methodology)
      });
    }

    // Time-based unlocks
    if (completedWeeks >= 12) {
      unlockedFeatures.push({
        id: 'race_simulation',
        name: 'Race Simulation Workouts',
        description: 'Full race pace simulation with nutrition practice',
        requirements: '12+ weeks of consistent training',
        implementation: this.createRaceSimulationProtocol(config.methodology)
      });
    }

    return unlockedFeatures;
  }

  /**
   * Apply injury prevention modifications
   */
  public applyInjuryPrevention(
    userId: string,
    plan: TrainingPlan,
    injuryHistory: string[],
    currentRiskFactors: RiskFactor[]
  ): PlanModification[] {
    const config = this.configurations.get(userId);
    if (!config) {
      throw new Error('No configuration found for user');
    }

    const modifications: PlanModification[] = [];

    // Historical injury prevention
    injuryHistory.forEach(injury => {
      const preventionMods = this.createInjuryPreventionMods(
        injury,
        plan,
        config
      );
      modifications.push(...preventionMods);
    });

    // Current risk mitigation
    currentRiskFactors.forEach(risk => {
      const mitigationMods = this.createRiskMitigationMods(
        risk,
        plan,
        config
      );
      modifications.push(...mitigationMods);
    });

    return modifications;
  }

  /**
   * Suggest breakthrough strategies for plateaus
   */
  public suggestBreakthroughStrategies(
    userId: string,
    plateauMetric: string,
    plateauDuration: number // weeks
  ): BreakthroughStrategy[] {
    const config = this.configurations.get(userId);
    if (!config) {
      throw new Error('No configuration found for user');
    }

    const strategies: BreakthroughStrategy[] = [];

    // Methodology-specific breakthrough protocols
    switch (config.methodology) {
      case 'daniels':
        strategies.push(...this.createDanielsBreakthroughs(plateauMetric, plateauDuration));
        break;
      case 'lydiard':
        strategies.push(...this.createLydiardBreakthroughs(plateauMetric, plateauDuration));
        break;
      case 'pfitzinger':
        strategies.push(...this.createPfitzingerBreakthroughs(plateauMetric, plateauDuration));
        break;
    }

    // General breakthrough strategies
    strategies.push(...this.createGeneralBreakthroughs(plateauMetric, plateauDuration, config));

    return strategies.sort((a, b) => b.successProbability - a.successProbability);
  }

  /**
   * Analyze current customization state
   */
  public analyzeCustomization(
    userId: string,
    plan: TrainingPlan,
    completedWorkouts: CompletedWorkout[]
  ): CustomizationAnalysis {
    const config = this.configurations.get(userId);
    if (!config) {
      throw new Error('No configuration found for user');
    }

    const currentState = this.assessMethodologyState(config, plan, completedWorkouts);
    const recommendations = this.generateCustomizationRecommendations(
      currentState,
      config,
      completedWorkouts
    );
    const warnings = this.identifyCustomizationWarnings(currentState, config);
    const projectedOutcomes = this.projectOutcomes(
      currentState,
      config,
      completedWorkouts
    );

    return {
      currentState,
      recommendations,
      warnings,
      projectedOutcomes
    };
  }

  /**
   * Get configuration for user
   */
  public getConfiguration(userId: string): MethodologyConfiguration | undefined {
    return this.configurations.get(userId);
  }

  /**
   * Get adaptation history for user
   */
  public getAdaptationHistory(userId: string): AdaptationPattern[] {
    return this.adaptationHistory.get(userId) || [];
  }

  // Private helper methods

  private createBaseConfig(
    methodology: TrainingMethodology,
    userProfile: UserProfile
  ): MethodologyBaseConfig {
    const profile = this.philosophyComparator.getMethodologyProfile(methodology)!;
    
    return {
      intensityDistribution: profile.intensityDistribution,
      volumeProgression: {
        weeklyIncrease: this.calculateWeeklyIncrease(userProfile),
        stepBackFrequency: 4,
        stepBackReduction: 20
      },
      workoutEmphasis: profile.workoutTypeEmphasis,
      periodizationModel: {
        phaseDurations: this.calculatePhaseDurations(methodology),
        phaseTransitions: methodology === 'lydiard' ? 'sharp' : 'gradual'
      },
      recoveryProtocol: {
        easyDayMinimum: 65,
        recoveryDayFrequency: 2,
        completeRestDays: methodology === 'lydiard' ? 2 : 0
      }
    };
  }

  private calculateWeeklyIncrease(userProfile: UserProfile): number {
    const baseIncrease = 10;
    let adjustment = 0;

    if (userProfile.experience === 'beginner') adjustment -= 5;
    if (userProfile.experience === 'expert') adjustment += 2;
    if (userProfile.injuryHistory && userProfile.injuryHistory.length > 2) adjustment -= 3;

    return Math.max(5, Math.min(15, baseIncrease + adjustment));
  }

  private calculatePhaseDurations(methodology: TrainingMethodology): Record<TrainingPhase, number> {
    switch (methodology) {
      case 'daniels':
        return { base: 25, build: 30, peak: 25, taper: 10, recovery: 10 };
      case 'lydiard':
        return { base: 40, build: 20, peak: 20, taper: 10, recovery: 10 };
      case 'pfitzinger':
        return { base: 30, build: 35, peak: 20, taper: 10, recovery: 5 };
      default:
        return { base: 30, build: 30, peak: 20, taper: 10, recovery: 10 };
    }
  }

  private initializeAdaptationPatterns(
    methodology: TrainingMethodology,
    userProfile: UserProfile
  ): AdaptationPattern[] {
    const patterns: AdaptationPattern[] = [];

    // Common adaptation patterns
    patterns.push({
      id: 'fatigue_accumulation',
      name: 'Fatigue Accumulation Response',
      trigger: {
        type: 'fatigue',
        conditions: [{
          metric: 'fatigue_score',
          operator: 'greater',
          value: 80,
          duration: 3
        }]
      },
      response: {
        modifications: [{
          type: 'volume',
          target: 'weekly_mileage',
          adjustment: -20,
          rationale: 'Reduce volume to manage fatigue'
        }],
        priority: 'immediate',
        duration: 7,
        monitoringPeriod: 14
      },
      frequency: 0,
      effectiveness: 0
    });

    // Add performance improvement pattern
    patterns.push({
      id: 'performance_improvement',
      name: 'Performance Improvement Pattern',
      trigger: {
        type: 'performance',
        conditions: [{
          metric: 'pace_achievement',
          operator: 'greater',
          value: 90,
          duration: 7
        }]
      },
      response: {
        modifications: [{
          type: 'intensity',
          target: 'workout_intensity',
          adjustment: 5,
          rationale: 'Increase intensity based on good performance'
        }],
        priority: 'next_week',
        duration: 14,
        monitoringPeriod: 14
      },
      frequency: 0,
      effectiveness: 0
    });

    // Methodology-specific patterns
    if (methodology === 'daniels') {
      patterns.push({
        id: 'vdot_improvement',
        name: 'VDOT Improvement Pattern',
        trigger: {
          type: 'performance',
          conditions: [{
            metric: 'workout_pace_achievement',
            operator: 'greater',
            value: 95,
            duration: 14
          }]
        },
        response: {
          modifications: [{
            type: 'intensity',
            target: 'vdot_adjustment',
            adjustment: 1,
            rationale: 'Increase VDOT based on consistent performance'
          }],
          priority: 'next_week',
          duration: 28,
          monitoringPeriod: 14
        },
        frequency: 0,
        effectiveness: 0
      });
    }

    if (methodology === 'lydiard') {
      patterns.push({
        id: 'aerobic_development',
        name: 'Aerobic Development Pattern',
        trigger: {
          type: 'performance',
          conditions: [{
            metric: 'aerobic_efficiency',
            operator: 'greater',
            value: 85,
            duration: 21
          }]
        },
        response: {
          modifications: [{
            type: 'volume',
            target: 'long_run_duration',
            adjustment: 10,
            rationale: 'Extend long runs for aerobic development'
          }],
          priority: 'next_phase',
          duration: 28,
          monitoringPeriod: 21
        },
        frequency: 0,
        effectiveness: 0
      });
    }

    if (methodology === 'pfitzinger') {
      patterns.push({
        id: 'threshold_progression',
        name: 'Threshold Progression Pattern',
        trigger: {
          type: 'performance',
          conditions: [{
            metric: 'threshold_pace',
            operator: 'greater',
            value: 88,
            duration: 14
          }]
        },
        response: {
          modifications: [{
            type: 'workout_type',
            target: 'threshold_volume',
            adjustment: 'increase',
            rationale: 'Progress threshold work based on adaptation'
          }],
          priority: 'next_week',
          duration: 21,
          monitoringPeriod: 14
        },
        frequency: 0,
        effectiveness: 0
      });
    }

    return patterns;
  }

  private createCustomizationSettings(
    userProfile: UserProfile,
    customSettings?: Partial<CustomizationSettings>
  ): CustomizationSettings {
    const defaults: CustomizationSettings = {
      allowIntensityAdjustments: true,
      allowVolumeAdjustments: true,
      allowWorkoutSubstitutions: true,
      preferredWorkoutTypes: [],
      avoidWorkoutTypes: [],
      aggressiveness: userProfile.experience === 'beginner' ? 'conservative' : 'moderate',
      adaptationSpeed: 'normal',
      injuryPrevention: userProfile.injuryHistory && userProfile.injuryHistory.length > 2 ? 'maximum' : 'standard',
      altitudeAdjustment: false,
      heatAdaptation: false,
      coldAdaptation: false,
      terrainSpecific: false
    };

    return { ...defaults, ...customSettings };
  }

  private createPerformanceOptimizations(
    userProfile: UserProfile,
    methodology: TrainingMethodology
  ): PerformanceOptimization[] {
    const optimizations: PerformanceOptimization[] = [];

    // VDOT optimization
    if (userProfile.currentFitness.vdot) {
      optimizations.push({
        id: 'vdot_improvement',
        name: 'VDOT Improvement',
        targetMetric: 'vdot',
        currentValue: userProfile.currentFitness.vdot,
        targetValue: userProfile.currentFitness.vdot + 2,
        strategy: this.createVDOTOptimizationStrategy(methodology),
        progress: 0,
        estimatedWeeks: 8
      });
    }

    return optimizations;
  }

  private createVDOTOptimizationStrategy(methodology: TrainingMethodology): OptimizationStrategy {
    return {
      methodologyTweaks: [{
        parameter: 'intensity_distribution_hard',
        fromValue: 5,
        toValue: 8,
        timeline: 4,
        rationale: 'Increase quality work for VDOT improvement'
      }],
      workoutProgressions: [{
        workoutType: 'vo2max',
        currentVolume: 3,
        targetVolume: 5,
        currentIntensity: 95,
        targetIntensity: 98,
        progressionRate: 2
      }],
      recoveryEnhancements: [{
        type: 'sleep',
        frequency: 'daily',
        duration: '8+ hours',
        expectedBenefit: 'Improved adaptation to high intensity work'
      }]
    };
  }

  private createConstraints(userProfile: UserProfile): CustomizationConstraints {
    return {
      maxWeeklyHours: userProfile.timeAvailability || 10,
      maxWeeklyMiles: userProfile.currentFitness.weeklyMileage * 1.5,
      maxIntensityPercentage: 95,
      minRecoveryDays: 1,
      blackoutDates: [],
      medicalRestrictions: []
    };
  }

  private identifyPatterns(
    progressData: ProgressData,
    modifications: PlanModification[]
  ): AdaptationPattern[] {
    const patterns: AdaptationPattern[] = [];
    
    // Always create at least one baseline pattern from progress data
    const adherenceRate = progressData.adherenceRate || 75; // Default if not provided
    if (adherenceRate > 70) {
      patterns.push({
        id: 'workout_completion_pattern',
        trigger: {
          condition: `adherence ${adherenceRate > 80 ? '> 80%' : '> 70%'}`,
          workoutTypes: ['easy', 'tempo'],
          timeframe: 'weekly'
        },
        response: {
          adjustment: adherenceRate > 85 ? 'maintain or increase intensity' : 'maintain intensity',
          confidence: Math.min(adherenceRate + 10, 90),
          evidence: `Adherence rate of ${adherenceRate}% indicates good tolerance`
        },
        effectiveness: Math.min(adherenceRate + 10, 90),
        frequency: 1,
        lastObserved: new Date()
      });
    }
    
    // Pattern from modifications
    if (modifications.length > 0) {
      const volumeReductions = modifications.filter(m => m.type === 'reduce_volume');
      if (volumeReductions.length > 0) {
        patterns.push({
          id: 'volume_sensitivity_pattern',
          trigger: {
            condition: 'high training load',
            workoutTypes: ['long_run', 'tempo'],
            timeframe: 'weekly'
          },
          response: {
            adjustment: 'reduce volume by 15%',
            confidence: 75,
            evidence: 'Repeated volume reductions needed'
          },
          effectiveness: 75,
          frequency: 1,
          lastObserved: new Date()
        });
      }
    } else {
      // When no modifications, create a stable training pattern
      patterns.push({
        id: 'stable_training_pattern',
        trigger: {
          condition: 'no modifications needed',
          workoutTypes: ['all'],
          timeframe: 'weekly'
        },
        response: {
          adjustment: 'continue current approach',
          confidence: 85,
          evidence: 'No modifications suggests good adaptation'
        },
        effectiveness: 85,
        frequency: 1,
        lastObserved: new Date()
      });
    }
    
    // Recovery pattern based on performance trends
    const performanceTrend = progressData.performanceTrend || 'stable';
    if (performanceTrend === 'declining') {
      patterns.push({
        id: 'recovery_need_pattern',
        trigger: {
          condition: 'declining performance',
          workoutTypes: ['all'],
          timeframe: 'bi-weekly'
        },
        response: {
          adjustment: 'add recovery days',
          confidence: 80,
          evidence: 'Performance decline suggests overreach'
        },
        effectiveness: 80,
        frequency: 1,
        lastObserved: new Date()
      });
    } else if (performanceTrend === 'improving') {
      patterns.push({
        id: 'progress_pattern',
        trigger: {
          condition: 'improving performance',
          workoutTypes: ['quality'],
          timeframe: 'weekly'
        },
        response: {
          adjustment: 'gradual progression',
          confidence: 85,
          evidence: 'Performance improvement validates current approach'
        },
        effectiveness: 85,
        frequency: 1,
        lastObserved: new Date()
      });
    }
    
    return patterns;
  }

  private mergePatterns(
    existing: AdaptationPattern[],
    newPatterns: AdaptationPattern[]
  ): AdaptationPattern[] {
    // Merge and update frequency/effectiveness
    const merged = [...existing];
    
    newPatterns.forEach(newPattern => {
      const existingIndex = merged.findIndex(p => p.id === newPattern.id);
      if (existingIndex >= 0) {
        merged[existingIndex].frequency++;
        // Update effectiveness based on outcomes
      } else {
        merged.push(newPattern);
      }
    });
    
    return merged;
  }

  private selectEffectivePatterns(patterns: AdaptationPattern[]): AdaptationPattern[] {
    // Select patterns with high effectiveness
    return patterns
      .filter(p => p.effectiveness > 60 || p.frequency > 3)
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 10); // Keep top 10
  }

  private calculateCurrentMetrics(completedWorkouts: CompletedWorkout[]): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    if (completedWorkouts.length === 0) return metrics;
    
    // Calculate various metrics from completed workouts
    const recentWorkouts = completedWorkouts.slice(-10);
    
    // Average pace achievement
    const paceAchievements = recentWorkouts
      .filter(w => w.actualMetrics && w.plannedWorkout?.targetMetrics)
      .map(w => {
        const actualPace = w.actualMetrics!.averagePace;
        const targetPace = w.plannedWorkout!.targetMetrics.pace;
        return targetPace ? (actualPace / targetPace) * 100 : 100;
      });
    
    if (paceAchievements.length > 0) {
      metrics.paceAchievement = paceAchievements.reduce((a, b) => a + b) / paceAchievements.length;
    }
    
    return metrics;
  }

  private createOptimization(
    metric: string,
    currentMetrics: Record<string, number>,
    config: MethodologyConfiguration,
    plan: TrainingPlan
  ): PerformanceOptimization | null {
    // Create optimization based on metric type
    switch (metric) {
      case 'vdot':
        return this.createVDOTOptimization(currentMetrics, config);
      case 'threshold':
        return this.createThresholdOptimization(currentMetrics, config);
      case 'endurance':
        return this.createEnduranceOptimization(currentMetrics, config);
      default:
        return null;
    }
  }

  private createThresholdOptimization(
    currentMetrics: Record<string, number>,
    config: MethodologyConfiguration
  ): PerformanceOptimization {
    return {
      id: 'threshold_improvement',
      name: 'Lactate Threshold Enhancement',
      targetMetric: 'threshold',
      currentValue: currentMetrics.threshold || 85,
      targetValue: (currentMetrics.threshold || 85) + 5,
      strategy: {
        methodologyTweaks: [{
          parameter: 'threshold_volume',
          fromValue: 15,
          toValue: 25,
          timeline: 6,
          rationale: 'Increase threshold work for LT improvement'
        }],
        workoutProgressions: [{
          workoutType: 'threshold',
          currentVolume: 20,
          targetVolume: 30,
          currentIntensity: 88,
          targetIntensity: 90,
          progressionRate: 1.5
        }],
        recoveryEnhancements: []
      },
      progress: 0,
      estimatedWeeks: 6
    };
  }

  private createEnduranceOptimization(
    currentMetrics: Record<string, number>,
    config: MethodologyConfiguration
  ): PerformanceOptimization {
    return {
      id: 'endurance_improvement',
      name: 'Aerobic Endurance Development',
      targetMetric: 'endurance',
      currentValue: currentMetrics.endurance || 70,
      targetValue: (currentMetrics.endurance || 70) + 10,
      strategy: {
        methodologyTweaks: [{
          parameter: 'long_run_duration',
          fromValue: 90,
          toValue: 120,
          timeline: 8,
          rationale: 'Extend long run duration for endurance'
        }],
        workoutProgressions: [{
          workoutType: 'long_run',
          currentVolume: 15,
          targetVolume: 20,
          currentIntensity: 70,
          targetIntensity: 75,
          progressionRate: 1
        }],
        recoveryEnhancements: [{
          type: 'nutrition',
          frequency: 'post-long-run',
          duration: 'within 30 minutes',
          expectedBenefit: 'Enhanced glycogen replenishment'
        }]
      },
      progress: 0,
      estimatedWeeks: 8
    };
  }

  private createVDOTOptimization(
    currentMetrics: Record<string, number>,
    config: MethodologyConfiguration
  ): PerformanceOptimization {
    const currentVDOT = currentMetrics.vdot || 45;
    const targetVDOT = currentVDOT + 2; // Target +2 VDOT points
    
    return {
      id: 'vdot_improvement',
      name: 'VDOT Enhancement',
      targetMetric: 'vdot',
      currentValue: currentVDOT,
      targetValue: targetVDOT,
      strategy: {
        methodologyTweaks: [{
          parameter: 'vo2max_volume',
          fromValue: 8,
          toValue: 12,
          timeline: 8,
          rationale: 'Increase VO2max work for VDOT improvement'
        }],
        workoutProgressions: [{
          workoutType: 'intervals',
          currentVolume: 5,
          targetVolume: 8,
          currentIntensity: 100,
          targetIntensity: 105,
          progressionRate: 0.5
        }],
        recoveryEnhancements: [{
          type: 'sleep',
          frequency: 'nightly',
          duration: '8+ hours',
          expectedBenefit: 'Enhanced recovery and adaptation'
        }]
      },
      progress: 0,
      estimatedWeeks: 8
    };
  }

  private createAltitudeAdjustments(
    plan: TrainingPlan,
    altitude: number,
    config: MethodologyConfiguration
  ): PlanModification[] {
    const modifications: PlanModification[] = [];
    
    // Reduce intensity for first 2 weeks at altitude
    modifications.push({
      type: 'reduce_intensity',
      reason: `Altitude adaptation at ${altitude}m`,
      priority: 'high',
      suggestedChanges: {
        intensityReduction: 10 + Math.floor((altitude - 1500) / 500) * 5
      }
    });
    
    return modifications;
  }

  private createHeatAdjustments(
    plan: TrainingPlan,
    config: MethodologyConfiguration
  ): PlanModification[] {
    return [{
      type: 'reduce_intensity',
      reason: 'Heat adaptation required',
      priority: 'medium',
      suggestedChanges: {
        intensityReduction: 5,
        additionalRecoveryDays: 1
      }
    }];
  }

  private createColdAdjustments(
    plan: TrainingPlan,
    config: MethodologyConfiguration
  ): PlanModification[] {
    return [{
      type: 'substitute_workout',
      reason: 'Cold weather adaptation',
      priority: 'low',
      suggestedChanges: {
        substituteWorkoutType: 'fartlek' // More flexible for cold conditions
      }
    }];
  }

  private createTerrainAdjustments(
    plan: TrainingPlan,
    terrain: string,
    config: MethodologyConfiguration
  ): PlanModification[] {
    const modifications: PlanModification[] = [];
    
    if (terrain === 'hilly') {
      modifications.push({
        type: 'substitute_workout',
        reason: 'Hilly terrain adaptation',
        priority: 'medium',
        suggestedChanges: {
          substituteWorkoutType: 'hill_repeats'
        }
      });
    }
    
    return modifications;
  }

  private createConflictResolution(
    conflict: MethodologyConflict,
    config: MethodologyConfiguration
  ): CustomizationModification | null {
    // Implement conflict resolution logic
    return {
      type: 'phase_adjustment',
      target: conflict.area,
      adjustment: 'modified_approach',
      rationale: `Resolving ${conflict.description}`
    };
  }

  private createDoubleThresholdProtocol(methodology: TrainingMethodology): string[] {
    return [
      'Morning: 20min threshold continuous',
      'Evening: 3x8min threshold intervals',
      'Ensure 8+ hours between sessions',
      'Only once per week maximum'
    ];
  }

  private createSuperCompensationProtocol(methodology: TrainingMethodology): string[] {
    return [
      'Week 1-2: 120% normal volume',
      'Week 3: 130% normal volume',
      'Week 4: 50% volume (super compensation)',
      'Monitor fatigue markers closely'
    ];
  }

  private createRaceSimulationProtocol(methodology: TrainingMethodology): string[] {
    return [
      'Full race distance at goal pace',
      'Practice nutrition strategy',
      'Simulate race day timing',
      '2-3 weeks before target race'
    ];
  }

  private createInjuryPreventionMods(
    injury: string,
    plan: TrainingPlan,
    config: MethodologyConfiguration
  ): PlanModification[] {
    const modifications: PlanModification[] = [];
    
    // Generic injury prevention
    modifications.push({
      type: 'reduce_volume',
      reason: `Previous ${injury} - preventive volume reduction`,
      priority: 'medium',
      suggestedChanges: {
        volumeReduction: 10
      }
    });
    
    return modifications;
  }

  private createRiskMitigationMods(
    risk: RiskFactor,
    plan: TrainingPlan,
    config: MethodologyConfiguration
  ): PlanModification[] {
    return [{
      type: 'add_recovery',
      reason: `Mitigating ${risk.type} risk`,
      priority: risk.severity as 'high' | 'medium' | 'low',
      suggestedChanges: {
        additionalRecoveryDays: 1
      }
    }];
  }

  private createDanielsBreakthroughs(
    metric: string,
    duration: number
  ): BreakthroughStrategy[] {
    return [{
      id: 'vdot_breakthrough',
      name: 'VDOT Breakthrough Protocol',
      description: 'Intensive VDOT improvement through targeted intervals',
      protocol: [
        'Week 1-2: Increase I-pace volume by 50%',
        'Week 3-4: Add R-pace strides to easy runs',
        'Week 5-6: Time trial to reassess VDOT'
      ],
      expectedImprovement: '1-2 VDOT points',
      duration: 6,
      intensity: 'high',
      successProbability: 75
    }];
  }

  private createLydiardBreakthroughs(
    metric: string,
    duration: number
  ): BreakthroughStrategy[] {
    return [{
      id: 'aerobic_breakthrough',
      name: 'Aerobic Capacity Breakthrough',
      description: 'Break through plateau with increased aerobic stimulus',
      protocol: [
        'Increase weekly long run by 20%',
        'Add second medium-long run',
        'Introduce fartlek sessions'
      ],
      expectedImprovement: '5% endurance improvement',
      duration: 8,
      intensity: 'moderate',
      successProbability: 80
    }];
  }

  private createPfitzingerBreakthroughs(
    metric: string,
    duration: number
  ): BreakthroughStrategy[] {
    return [{
      id: 'threshold_breakthrough',
      name: 'Lactate Threshold Breakthrough',
      description: 'Enhanced threshold development protocol',
      protocol: [
        'Double threshold days (AM/PM)',
        'Progressive long runs with threshold finish',
        'Threshold hill repeats'
      ],
      expectedImprovement: '3-5% threshold pace improvement',
      duration: 6,
      intensity: 'high',
      successProbability: 70
    }];
  }

  private createGeneralBreakthroughs(
    metric: string,
    duration: number,
    config: MethodologyConfiguration
  ): BreakthroughStrategy[] {
    return [{
      id: 'cross_training_breakthrough',
      name: 'Cross-Training Enhancement',
      description: 'Break plateau with complementary training',
      protocol: [
        'Add 2x weekly cycling sessions',
        'Include weekly pool running',
        'Strength training 2x per week'
      ],
      expectedImprovement: 'Varies by individual',
      duration: 4,
      intensity: 'low',
      successProbability: 60
    }];
  }

  private assessMethodologyState(
    config: MethodologyConfiguration,
    plan: TrainingPlan,
    completedWorkouts: CompletedWorkout[]
  ): MethodologyState {
    // Calculate adherence to philosophy
    const adherence = this.calculatePhilosophyAdherence(config, completedWorkouts);
    
    // Determine customization level
    const customizationLevel = this.determineCustomizationLevel(config);
    
    // Calculate effectiveness
    const effectiveness = this.calculateEffectiveness(completedWorkouts);
    
    // Assess injury risk
    const injuryRisk = this.assessInjuryRisk(completedWorkouts);
    
    // Calculate adaptation success
    const adaptationSuccess = this.calculateAdaptationSuccess(config);
    
    return {
      adherenceToPhilosophy: adherence,
      customizationLevel,
      effectivenessScore: effectiveness,
      injuryRiskLevel: injuryRisk,
      adaptationSuccess
    };
  }

  private calculatePhilosophyAdherence(
    config: MethodologyConfiguration,
    completedWorkouts: CompletedWorkout[]
  ): number {
    // Simplified calculation
    return 85; // Placeholder
  }

  private determineCustomizationLevel(
    config: MethodologyConfiguration
  ): 'minimal' | 'moderate' | 'extensive' {
    const modifications = config.adaptationPatterns.filter(p => p.frequency > 0).length;
    if (modifications < 3) return 'minimal';
    if (modifications < 7) return 'moderate';
    return 'extensive';
  }

  private calculateEffectiveness(completedWorkouts: CompletedWorkout[]): number {
    if (completedWorkouts.length === 0) return 0;
    
    // Calculate based on workout completion and performance
    const completionRate = completedWorkouts.filter(w => w.completed).length / completedWorkouts.length;
    return Math.round(completionRate * 100);
  }

  private assessInjuryRisk(completedWorkouts: CompletedWorkout[]): 'low' | 'medium' | 'high' {
    // Simplified assessment
    const recentWorkouts = completedWorkouts.slice(-14);
    const highIntensityCount = recentWorkouts.filter(w => 
      w.actualMetrics?.averageHeartRate && w.actualMetrics.averageHeartRate > 170
    ).length;
    
    if (highIntensityCount > 7) return 'high';
    if (highIntensityCount > 4) return 'medium';
    return 'low';
  }

  private calculateAdaptationSuccess(config: MethodologyConfiguration): number {
    const successfulPatterns = config.adaptationPatterns.filter(p => p.effectiveness > 70).length;
    const totalPatterns = config.adaptationPatterns.length;
    return totalPatterns > 0 ? Math.round((successfulPatterns / totalPatterns) * 100) : 0;
  }

  private generateCustomizationRecommendations(
    state: MethodologyState,
    config: MethodologyConfiguration,
    completedWorkouts: CompletedWorkout[]
  ): CustomizationRecommendation[] {
    const recommendations: CustomizationRecommendation[] = [];
    
    // Performance recommendations
    if (state.effectivenessScore < 70) {
      recommendations.push({
        id: 'improve_effectiveness',
        category: 'performance',
        title: 'Improve Training Effectiveness',
        description: 'Current effectiveness is below optimal. Consider adjustments.',
        impact: 'high',
        implementation: [
          'Review workout difficulty settings',
          'Adjust volume progression rate',
          'Consider additional recovery'
        ],
        timeToEffect: 2
      });
    }
    
    // Injury prevention recommendations
    if (state.injuryRiskLevel !== 'low') {
      recommendations.push({
        id: 'reduce_injury_risk',
        category: 'injury_prevention',
        title: 'Reduce Injury Risk',
        description: 'Current training load presents elevated injury risk.',
        impact: 'high',
        implementation: [
          'Reduce high-intensity volume by 20%',
          'Add additional recovery day',
          'Include injury prevention exercises'
        ],
        timeToEffect: 1
      });
    }
    
    return recommendations;
  }

  private identifyCustomizationWarnings(
    state: MethodologyState,
    config: MethodologyConfiguration
  ): string[] {
    const warnings: string[] = [];
    
    if (state.adherenceToPhilosophy < 60) {
      warnings.push('Customizations have significantly deviated from core methodology principles');
    }
    
    if (state.injuryRiskLevel === 'high') {
      warnings.push('Current training pattern shows high injury risk - immediate adjustment recommended');
    }
    
    if (state.customizationLevel === 'extensive' && state.effectivenessScore < 50) {
      warnings.push('Extensive customizations may be reducing training effectiveness');
    }
    
    return warnings;
  }

  private projectOutcomes(
    state: MethodologyState,
    config: MethodologyConfiguration,
    completedWorkouts: CompletedWorkout[]
  ): ProjectedOutcome[] {
    const outcomes: ProjectedOutcome[] = [];
    
    // Project performance improvements
    config.performanceOptimizations.forEach(opt => {
      outcomes.push({
        metric: opt.targetMetric,
        currentValue: opt.currentValue,
        projectedValue: opt.targetValue,
        confidence: this.calculateProjectionConfidence(opt, state),
        timeframe: opt.estimatedWeeks,
        assumptions: [
          'Consistent training adherence',
          'No significant injuries',
          'Proper recovery maintained'
        ]
      });
    });
    
    return outcomes;
  }

  private calculateProjectionConfidence(
    optimization: PerformanceOptimization,
    state: MethodologyState
  ): number {
    let confidence = 70; // Base confidence
    
    if (state.effectivenessScore > 80) confidence += 10;
    if (state.injuryRiskLevel === 'low') confidence += 10;
    if (state.adaptationSuccess > 70) confidence += 10;
    
    return Math.min(95, confidence);
  }
}

// Supporting types

export interface MethodologyConflict {
  area: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface RunnerExperience {
  level: 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'expert';
  years: number;
  racesCompleted: number;
}

export interface AdvancedFeature {
  id: string;
  name: string;
  description: string;
  requirements: string;
  implementation: string[];
}

export interface RiskFactor {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface BreakthroughStrategy {
  id: string;
  name: string;
  description: string;
  protocol: string[];
  expectedImprovement: string;
  duration: number; // weeks
  intensity: 'low' | 'moderate' | 'high';
  successProbability: number; // 0-100
}