import {
  TrainingMethodology,
  TrainingPlan,
  TrainingPhase,
  PlannedWorkout,
  WorkoutType,
  TrainingBlock,
  WeeklyMicrocycle,
  AdvancedPlanConfig
} from './types';
import { PlanModification } from './adaptation';
import { ValidationPipeline, ValidationResult } from './validation';
import { PhilosophyComparator, MethodologyProfile } from './philosophy-comparator';
import { MethodologyRecommendationEngine, TransitionPlan } from './methodology-recommendation-engine';
import { PhilosophyFactory } from './philosophies';
import { AdvancedTrainingPlanGenerator } from './advanced-generator';
import { format, addWeeks, differenceInWeeks } from 'date-fns';

// Types for methodology transition system
export interface MethodologyTransition {
  fromMethodology: TrainingMethodology;
  toMethodology: TrainingMethodology;
  transitionType: TransitionType;
  transitionPlan: DetailedTransitionPlan;
  requirements: TransitionRequirement[];
  conflicts: MethodologyConflict[];
  guidance: TransitionGuidance;
  timeline: TransitionTimeline;
  risks: TransitionRisk[];
}

export type TransitionType = 
  | 'immediate' // Can switch immediately
  | 'gradual' // Requires gradual transition
  | 'phased' // Requires completion of current phase
  | 'deferred'; // Should wait for next training cycle

export interface DetailedTransitionPlan extends TransitionPlan {
  phases: TransitionPhase[];
  workoutMigration: WorkoutMigrationPlan;
  volumeAdjustment: VolumeAdjustmentPlan;
  intensityAdjustment: IntensityAdjustmentPlan;
  recoveryProtocol: RecoveryProtocol;
}

export interface TransitionPhase {
  phaseNumber: number;
  name: string;
  duration: number; // weeks
  focus: string;
  keyWorkouts: WorkoutType[];
  volumeTarget: number; // percentage of current
  intensityDistribution: {
    easy: number;
    moderate: number;
    hard: number;
  };
  milestones: string[];
}

export interface WorkoutMigrationPlan {
  workoutsToPhaseOut: WorkoutType[];
  workoutsToIntroduce: WorkoutType[];
  migrationSchedule: Array<{
    week: number;
    remove: WorkoutType[];
    add: WorkoutType[];
    modify: Array<{
      type: WorkoutType;
      changes: string[];
    }>;
  }>;
}

export interface VolumeAdjustmentPlan {
  currentWeeklyVolume: number;
  targetWeeklyVolume: number;
  adjustmentRate: number; // percentage per week
  stepBackWeeks: number[]; // weeks to reduce volume
  volumeByWeek: Array<{
    week: number;
    volume: number;
    percentageOfTarget: number;
  }>;
}

export interface IntensityAdjustmentPlan {
  currentDistribution: { easy: number; moderate: number; hard: number };
  targetDistribution: { easy: number; moderate: number; hard: number };
  weeklyProgression: Array<{
    week: number;
    distribution: { easy: number; moderate: number; hard: number };
    focusZones: string[];
  }>;
}

export interface RecoveryProtocol {
  additionalRecoveryDays: number;
  recoveryWeeks: number[]; // weeks with extra recovery focus
  adaptationMonitoring: string[];
  warningSignals: string[];
}

export interface TransitionRequirement {
  category: RequirementCategory;
  requirement: string;
  rationale: string;
  isMandatory: boolean;
  assessmentCriteria: string[];
  alternativeOptions?: string[];
}

export type RequirementCategory = 
  | 'fitness_baseline'
  | 'volume_tolerance'
  | 'injury_status'
  | 'time_availability'
  | 'mental_readiness'
  | 'technical_skills';

export interface MethodologyConflict {
  conflictType: ConflictType;
  description: string;
  severity: 'high' | 'medium' | 'low';
  resolution: ConflictResolution;
  compromises: string[];
}

export type ConflictType = 
  | 'philosophy_mismatch'
  | 'volume_incompatibility'
  | 'intensity_distribution'
  | 'recovery_approach'
  | 'workout_structure'
  | 'periodization_conflict';

export interface ConflictResolution {
  strategy: ResolutionStrategy;
  steps: string[];
  expectedOutcome: string;
  timeToResolve: number; // weeks
}

export type ResolutionStrategy = 
  | 'gradual_adaptation'
  | 'hybrid_approach'
  | 'selective_adoption'
  | 'full_commitment'
  | 'trial_period';

export interface TransitionGuidance {
  overview: string;
  keyPrinciples: string[];
  dos: string[];
  donts: string[];
  checkpoints: TransitionCheckpoint[];
  troubleshooting: TroubleshootingGuide[];
}

export interface TransitionCheckpoint {
  week: number;
  name: string;
  assessmentCriteria: string[];
  successIndicators: string[];
  adjustmentOptions: string[];
}

export interface TroubleshootingGuide {
  issue: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
  preventionTips: string[];
}

export interface TransitionTimeline {
  totalDuration: number; // weeks
  phases: Array<{
    name: string;
    startWeek: number;
    endWeek: number;
    milestones: string[];
  }>;
  criticalDates: Array<{
    week: number;
    event: string;
    importance: 'critical' | 'important' | 'optional';
  }>;
}

export interface TransitionRisk {
  riskType: RiskType;
  description: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigationStrategies: string[];
  warningSignals: string[];
}

export type RiskType = 
  | 'overtraining'
  | 'injury'
  | 'burnout'
  | 'performance_decline'
  | 'adaptation_failure';

/**
 * MethodologyTransitionSystem provides comprehensive support for
 * switching between training methodologies with detailed guidance,
 * conflict resolution, and safe transition planning
 */
export class MethodologyTransitionSystem {
  private comparator: PhilosophyComparator;
  private recommendationEngine: MethodologyRecommendationEngine;
  private validationPipeline: ValidationPipeline;
  
  constructor() {
    this.comparator = new PhilosophyComparator();
    this.recommendationEngine = new MethodologyRecommendationEngine();
    this.validationPipeline = new ValidationPipeline();
  }

  /**
   * Create comprehensive methodology transition plan
   */
  public createMethodologyTransition(
    currentPlan: TrainingPlan,
    fromMethodology: TrainingMethodology,
    toMethodology: TrainingMethodology,
    currentPhase?: TrainingPhase,
    userProfile?: any
  ): MethodologyTransition {
    // Determine transition type
    const transitionType = this.determineTransitionType(
      fromMethodology,
      toMethodology,
      currentPhase
    );
    
    // Create detailed transition plan
    const transitionPlan = this.createDetailedTransitionPlan(
      fromMethodology,
      toMethodology,
      currentPlan,
      transitionType
    );
    
    // Identify requirements
    const requirements = this.identifyTransitionRequirements(
      fromMethodology,
      toMethodology,
      currentPlan
    );
    
    // Identify conflicts
    const conflicts = this.identifyMethodologyConflicts(
      fromMethodology,
      toMethodology
    );
    
    // Generate guidance
    const guidance = this.generateTransitionGuidance(
      fromMethodology,
      toMethodology,
      transitionType,
      conflicts
    );
    
    // Create timeline
    const timeline = this.createTransitionTimeline(
      transitionPlan,
      transitionType
    );
    
    // Assess risks
    const risks = this.assessTransitionRisks(
      fromMethodology,
      toMethodology,
      currentPlan,
      transitionType
    );
    
    return {
      fromMethodology,
      toMethodology,
      transitionType,
      transitionPlan,
      requirements,
      conflicts,
      guidance,
      timeline,
      risks
    };
  }

  /**
   * Apply methodology transition to existing plan
   */
  public applyTransition(
    plan: TrainingPlan,
    transition: MethodologyTransition
  ): { modifiedPlan: TrainingPlan; modifications: PlanModification[] } {
    const modifications: PlanModification[] = [];
    let modifiedPlan = { ...plan };
    
    // Apply transition phases
    transition.transitionPlan.phases.forEach((phase, index) => {
      const phaseModifications = this.createPhaseModifications(
        phase,
        transition.transitionPlan.workoutMigration,
        index
      );
      modifications.push(...phaseModifications);
    });
    
    // Apply volume adjustments
    const volumeModifications = this.createVolumeModifications(
      transition.transitionPlan.volumeAdjustment
    );
    modifications.push(...volumeModifications);
    
    // Apply intensity adjustments
    const intensityModifications = this.createIntensityModifications(
      transition.transitionPlan.intensityAdjustment
    );
    modifications.push(...intensityModifications);
    
    // Apply recovery protocol
    const recoveryModifications = this.createRecoveryModifications(
      transition.transitionPlan.recoveryProtocol
    );
    modifications.push(...recoveryModifications);
    
    // Update plan configuration
    modifiedPlan.config = {
      ...modifiedPlan.config,
      methodology: transition.toMethodology
    } as AdvancedPlanConfig;
    
    return { modifiedPlan, modifications };
  }

  /**
   * Validate methodology transition
   */
  public validateTransition(
    transition: MethodologyTransition,
    currentPlan: TrainingPlan
  ): ValidationResult {
    // First validate the basic config
    let result = this.validationPipeline.validateConfig(currentPlan.config as AdvancedPlanConfig);
    
    // Create mutable arrays if needed
    const errors = [...result.errors];
    const warnings = [...result.warnings];
    
    // Additional transition-specific validations
    if (transition.transitionType === 'immediate' && transition.risks.some(r => r.likelihood === 'high')) {
      warnings.push({
        field: 'transition.risks',
        message: 'High-risk immediate transition detected - consider gradual approach',
        severity: 'warning'
      });
    }
    
    // Validate requirements are met
    const unmetRequirements = transition.requirements.filter(
      req => req.isMandatory && !this.isRequirementMet(req, currentPlan)
    );
    
    if (unmetRequirements.length > 0) {
      unmetRequirements.forEach(req => {
        errors.push({
          field: 'transition.requirements',
          message: `Unmet requirement: ${req.requirement}`,
          severity: 'error'
        });
      });
    }
    
    // Return updated result
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Determine appropriate transition type
   */
  private determineTransitionType(
    from: TrainingMethodology,
    to: TrainingMethodology,
    currentPhase?: TrainingPhase
  ): TransitionType {
    const comparison = this.comparator.compareMethodologies(from, to);
    
    // Immediate transition for high compatibility
    if (comparison.compatibilityScore >= 80) {
      return 'immediate';
    }
    
    // Deferred for peak/taper phases
    if (currentPhase && ['peak', 'taper'].includes(currentPhase)) {
      return 'deferred';
    }
    
    // Phased for significant philosophy differences
    if (comparison.compatibilityScore < 60) {
      return 'phased';
    }
    
    // Default to gradual
    return 'gradual';
  }

  /**
   * Create detailed transition plan
   */
  private createDetailedTransitionPlan(
    from: TrainingMethodology,
    to: TrainingMethodology,
    currentPlan: TrainingPlan,
    transitionType: TransitionType
  ): DetailedTransitionPlan {
    // Get base transition plan from recommendation engine
    const basicPlan = this.recommendationEngine['createTransitionPlan'](from, to, {
      experience: 'intermediate',
      currentFitness: { vdot: 48, weeklyMileage: 30, longestRecentRun: 12, trainingAge: 3 },
      trainingPreferences: { availableDays: [0,1,2,3,4,5,6], preferredIntensity: 'moderate', crossTraining: false, strengthTraining: false },
      primaryGoal: 'GENERAL_FITNESS',
      motivations: [],
      timeAvailability: 8
    });
    
    // Create transition phases
    const phases = this.createTransitionPhases(from, to, transitionType);
    
    // Create workout migration plan
    const workoutMigration = this.createWorkoutMigrationPlan(from, to, phases.length);
    
    // Create volume adjustment plan
    const volumeAdjustment = this.createVolumeAdjustmentPlan(
      currentPlan,
      to,
      phases.length
    );
    
    // Create intensity adjustment plan
    const intensityAdjustment = this.createIntensityAdjustmentPlan(
      from,
      to,
      phases.length
    );
    
    // Create recovery protocol
    const recoveryProtocol = this.createRecoveryProtocol(transitionType, phases.length);
    
    return {
      ...basicPlan,
      phases,
      workoutMigration,
      volumeAdjustment,
      intensityAdjustment,
      recoveryProtocol
    };
  }

  /**
   * Create transition phases
   */
  private createTransitionPhases(
    from: TrainingMethodology,
    to: TrainingMethodology,
    transitionType: TransitionType
  ): TransitionPhase[] {
    const phases: TransitionPhase[] = [];
    const totalWeeks = this.getTransitionDuration(transitionType);
    
    if (transitionType === 'immediate') {
      // Single adaptation phase
      phases.push({
        phaseNumber: 1,
        name: 'Immediate Adaptation',
        duration: 2,
        focus: 'Quick methodology adjustment',
        keyWorkouts: this.getMethodologyKeyWorkouts(to),
        volumeTarget: 90,
        intensityDistribution: this.getMethodologyIntensityDistribution(to),
        milestones: ['Complete first week with new methodology', 'Assess adaptation']
      });
    } else if (transitionType === 'gradual') {
      // Multiple gradual phases
      const phaseDuration = Math.ceil(totalWeeks / 3);
      
      phases.push({
        phaseNumber: 1,
        name: 'Foundation Transition',
        duration: phaseDuration,
        focus: 'Establish new training patterns',
        keyWorkouts: this.blendWorkouts(from, to, 0.3),
        volumeTarget: 95,
        intensityDistribution: this.blendIntensity(from, to, 0.3),
        milestones: ['Introduce new workout types', 'Maintain consistency']
      });
      
      phases.push({
        phaseNumber: 2,
        name: 'Progressive Adaptation',
        duration: phaseDuration,
        focus: 'Increase methodology-specific elements',
        keyWorkouts: this.blendWorkouts(from, to, 0.6),
        volumeTarget: 100,
        intensityDistribution: this.blendIntensity(from, to, 0.6),
        milestones: ['Master new pacing systems', 'Build methodology-specific fitness']
      });
      
      phases.push({
        phaseNumber: 3,
        name: 'Full Integration',
        duration: phaseDuration,
        focus: 'Complete transition to new methodology',
        keyWorkouts: this.getMethodologyKeyWorkouts(to),
        volumeTarget: 105,
        intensityDistribution: this.getMethodologyIntensityDistribution(to),
        milestones: ['Full methodology adoption', 'Performance validation']
      });
    }
    
    return phases;
  }

  /**
   * Create workout migration plan
   */
  private createWorkoutMigrationPlan(
    from: TrainingMethodology,
    to: TrainingMethodology,
    phaseCount: number
  ): WorkoutMigrationPlan {
    const fromWorkouts = this.getMethodologyKeyWorkouts(from);
    const toWorkouts = this.getMethodologyKeyWorkouts(to);
    
    const workoutsToPhaseOut = fromWorkouts.filter(w => !toWorkouts.includes(w));
    const workoutsToIntroduce = toWorkouts.filter(w => !fromWorkouts.includes(w));
    
    const migrationSchedule = [];
    
    for (let week = 1; week <= phaseCount * 3; week++) {
      const progress = week / (phaseCount * 3);
      const remove: WorkoutType[] = [];
      const add: WorkoutType[] = [];
      const modify: Array<{ type: WorkoutType; changes: string[] }> = [];
      
      // Gradual phase out and introduction
      if (progress > 0.3) {
        remove.push(...workoutsToPhaseOut.slice(0, Math.floor(progress * workoutsToPhaseOut.length)));
      }
      
      if (progress > 0.2) {
        add.push(...workoutsToIntroduce.slice(0, Math.floor((progress - 0.2) * workoutsToIntroduce.length)));
      }
      
      // Modifications for common workouts
      if (from === 'daniels' && to === 'lydiard') {
        modify.push({
          type: 'tempo',
          changes: ['Shift from pace-based to effort-based', 'Extend duration']
        });
      }
      
      migrationSchedule.push({ week, remove, add, modify });
    }
    
    return {
      workoutsToPhaseOut,
      workoutsToIntroduce,
      migrationSchedule
    };
  }

  /**
   * Create volume adjustment plan
   */
  private createVolumeAdjustmentPlan(
    currentPlan: TrainingPlan,
    toMethodology: TrainingMethodology,
    transitionWeeks: number
  ): VolumeAdjustmentPlan {
    const currentVolume = this.calculateAverageWeeklyVolume(currentPlan);
    const targetVolume = this.getMethodologyTargetVolume(toMethodology, currentVolume);
    const adjustmentRate = (targetVolume - currentVolume) / currentVolume / transitionWeeks * 100;
    
    const volumeByWeek = [];
    const stepBackWeeks = [];
    
    for (let week = 1; week <= transitionWeeks; week++) {
      const progress = week / transitionWeeks;
      const weekVolume = currentVolume + (targetVolume - currentVolume) * progress;
      
      // Add step-back weeks every 4th week
      if (week % 4 === 0) {
        stepBackWeeks.push(week);
        volumeByWeek.push({
          week,
          volume: weekVolume * 0.8,
          percentageOfTarget: (weekVolume * 0.8 / targetVolume) * 100
        });
      } else {
        volumeByWeek.push({
          week,
          volume: weekVolume,
          percentageOfTarget: (weekVolume / targetVolume) * 100
        });
      }
    }
    
    return {
      currentWeeklyVolume: currentVolume,
      targetWeeklyVolume: targetVolume,
      adjustmentRate,
      stepBackWeeks,
      volumeByWeek
    };
  }

  /**
   * Create intensity adjustment plan
   */
  private createIntensityAdjustmentPlan(
    from: TrainingMethodology,
    to: TrainingMethodology,
    transitionWeeks: number
  ): IntensityAdjustmentPlan {
    const fromProfile = this.comparator.getMethodologyProfile(from)!;
    const toProfile = this.comparator.getMethodologyProfile(to)!;
    
    const currentDistribution = fromProfile.intensityDistribution;
    const targetDistribution = toProfile.intensityDistribution;
    
    const weeklyProgression = [];
    
    for (let week = 1; week <= transitionWeeks; week++) {
      const progress = week / transitionWeeks;
      
      const distribution = {
        easy: currentDistribution.easy + (targetDistribution.easy - currentDistribution.easy) * progress,
        moderate: currentDistribution.moderate + (targetDistribution.moderate - currentDistribution.moderate) * progress,
        hard: currentDistribution.hard + (targetDistribution.hard - currentDistribution.hard) * progress
      };
      
      const focusZones = this.determineFocusZones(to, progress);
      
      weeklyProgression.push({ week, distribution, focusZones });
    }
    
    return {
      currentDistribution,
      targetDistribution,
      weeklyProgression
    };
  }

  /**
   * Create recovery protocol
   */
  private createRecoveryProtocol(
    transitionType: TransitionType,
    transitionWeeks: number
  ): RecoveryProtocol {
    const baseRecoveryDays = transitionType === 'immediate' ? 2 : 1;
    const recoveryWeeks = [];
    
    // Add recovery weeks based on transition intensity
    // Ensure at least one recovery week for non-immediate transitions
    if (transitionWeeks >= 4) {
      for (let week = 4; week <= transitionWeeks; week += 4) {
        recoveryWeeks.push(week);
      }
    } else if (transitionType !== 'immediate' && transitionWeeks > 0) {
      // Add at least one recovery week for short transitions
      recoveryWeeks.push(Math.ceil(transitionWeeks / 2));
    }
    
    return {
      additionalRecoveryDays: baseRecoveryDays,
      recoveryWeeks,
      adaptationMonitoring: [
        'Daily fatigue levels',
        'Sleep quality',
        'Workout RPE trends',
        'Recovery heart rate',
        'Motivation levels'
      ],
      warningSignals: [
        'Persistent fatigue lasting >3 days',
        'Declining performance in easy runs',
        'Elevated resting heart rate',
        'Mood changes or irritability',
        'New aches or pains'
      ]
    };
  }

  /**
   * Identify transition requirements
   */
  private identifyTransitionRequirements(
    from: TrainingMethodology,
    to: TrainingMethodology,
    currentPlan: TrainingPlan
  ): TransitionRequirement[] {
    const requirements: TransitionRequirement[] = [];
    
    // Fitness baseline requirements
    if (to === 'pfitzinger') {
      requirements.push({
        category: 'fitness_baseline',
        requirement: 'Minimum 30 miles per week base',
        rationale: 'Pfitzinger methodology requires substantial aerobic base for high volume',
        isMandatory: true,
        assessmentCriteria: [
          'Current weekly mileage >= 30',
          'Consistent training for 12+ weeks',
          'Completed recent long run >= 12 miles'
        ],
        alternativeOptions: ['Build base gradually over 8-12 weeks before full transition']
      });
    }
    
    // Volume tolerance requirements
    if (to === 'lydiard') {
      requirements.push({
        category: 'volume_tolerance',
        requirement: 'Ability to handle 10+ hours weekly training',
        rationale: 'Lydiard emphasizes high volume aerobic development',
        isMandatory: false,
        assessmentCriteria: [
          'Current training time >= 6 hours/week',
          'No recent overuse injuries',
          'Recovery metrics indicate good adaptation'
        ],
        alternativeOptions: ['Modified Lydiard with reduced volume', 'Gradual volume build-up']
      });
    }
    
    // Technical skills requirements
    if (to === 'daniels') {
      requirements.push({
        category: 'technical_skills',
        requirement: 'Understanding of pace zones and VDOT',
        rationale: 'Daniels methodology requires precise pace execution',
        isMandatory: true,
        assessmentCriteria: [
          'Can calculate training paces from VDOT',
          'Access to GPS watch or pace tracking',
          'Ability to maintain consistent paces'
        ]
      });
    }
    
    // Time availability requirements
    const methodologyTimeRequirements = {
      'daniels': 5,
      'lydiard': 10,
      'pfitzinger': 8
    };
    
    requirements.push({
      category: 'time_availability',
      requirement: `Minimum ${methodologyTimeRequirements[to]} hours per week available`,
      rationale: 'Adequate time needed for methodology-specific training load',
      isMandatory: true,
      assessmentCriteria: [
        `Available training time >= ${methodologyTimeRequirements[to]} hours`,
        'Consistent schedule availability',
        'Family/work support for training time'
      ]
    });
    
    return requirements;
  }

  /**
   * Identify methodology conflicts
   */
  private identifyMethodologyConflicts(
    from: TrainingMethodology,
    to: TrainingMethodology
  ): MethodologyConflict[] {
    const conflicts: MethodologyConflict[] = [];
    const comparison = this.comparator.compareMethodologies(from, to);
    
    // Philosophy conflicts
    if (from === 'daniels' && to === 'lydiard') {
      conflicts.push({
        conflictType: 'philosophy_mismatch',
        description: 'Shift from data-driven precision to intuitive effort-based training',
        severity: 'medium',
        resolution: {
          strategy: 'gradual_adaptation',
          steps: [
            'Maintain pace awareness while learning effort levels',
            'Use both pace and effort cues during transition',
            'Gradually reduce reliance on pace data'
          ],
          expectedOutcome: 'Develop strong effort-based pacing intuition',
          timeToResolve: 4
        },
        compromises: ['Initial performance uncertainty', 'Temporary dual-tracking of metrics']
      });
    }
    
    // Volume conflicts
    if (from === 'daniels' && to === 'lydiard') {
      conflicts.push({
        conflictType: 'volume_incompatibility',
        description: 'Significant increase in easy running volume required',
        severity: 'high',
        resolution: {
          strategy: 'gradual_adaptation',
          steps: [
            'Increase weekly volume by 10% every 3 weeks',
            'Add extra easy days before extending run duration',
            'Monitor fatigue and recovery closely'
          ],
          expectedOutcome: 'Safe adaptation to higher volume',
          timeToResolve: 8
        },
        compromises: ['Temporary intensity reduction', 'Extended transition period']
      });
    }
    
    // Recovery approach conflicts
    if (comparison.differences.some(d => d.includes('Recovery'))) {
      conflicts.push({
        conflictType: 'recovery_approach',
        description: comparison.differences.find(d => d.includes('Recovery')) || 'Different recovery philosophies',
        severity: 'low',
        resolution: {
          strategy: 'trial_period',
          steps: [
            'Test new recovery approach for 2 weeks',
            'Monitor adaptation and fatigue',
            'Adjust based on individual response'
          ],
          expectedOutcome: 'Personalized recovery protocol',
          timeToResolve: 2
        },
        compromises: ['May need hybrid approach initially']
      });
    }
    
    return conflicts;
  }

  /**
   * Generate transition guidance
   */
  private generateTransitionGuidance(
    from: TrainingMethodology,
    to: TrainingMethodology,
    transitionType: TransitionType,
    conflicts: MethodologyConflict[]
  ): TransitionGuidance {
    const overview = this.generateTransitionOverview(from, to, transitionType);
    const keyPrinciples = this.getTransitionPrinciples(from, to);
    const dos = this.getTransitionDos(from, to, transitionType);
    const donts = this.getTransitionDonts(from, to, transitionType);
    const checkpoints = this.createTransitionCheckpoints(transitionType);
    const troubleshooting = this.createTroubleshootingGuides(from, to, conflicts);
    
    return {
      overview,
      keyPrinciples,
      dos,
      donts,
      checkpoints,
      troubleshooting
    };
  }

  /**
   * Helper methods
   */
  
  private getTransitionDuration(type: TransitionType): number {
    switch (type) {
      case 'immediate': return 2;
      case 'gradual': return 6;
      case 'phased': return 8;
      case 'deferred': return 0;
      default: return 4;
    }
  }
  
  private getMethodologyKeyWorkouts(methodology: TrainingMethodology): WorkoutType[] {
    const workoutEmphasis: Record<TrainingMethodology, WorkoutType[]> = {
      'daniels': ['tempo', 'threshold', 'vo2max', 'speed'],
      'lydiard': ['easy', 'long_run', 'hill_repeats', 'steady'],
      'pfitzinger': ['tempo', 'threshold', 'long_run', 'progression']
    };
    
    return workoutEmphasis[methodology] || [];
  }
  
  private getMethodologyIntensityDistribution(methodology: TrainingMethodology): { easy: number; moderate: number; hard: number } {
    const profile = this.comparator.getMethodologyProfile(methodology);
    return profile ? profile.intensityDistribution : { easy: 80, moderate: 15, hard: 5 };
  }
  
  private blendWorkouts(from: TrainingMethodology, to: TrainingMethodology, ratio: number): WorkoutType[] {
    const fromWorkouts = this.getMethodologyKeyWorkouts(from);
    const toWorkouts = this.getMethodologyKeyWorkouts(to);
    
    const fromCount = Math.floor(fromWorkouts.length * (1 - ratio));
    const toCount = Math.floor(toWorkouts.length * ratio);
    
    return [
      ...fromWorkouts.slice(0, fromCount),
      ...toWorkouts.slice(0, toCount)
    ];
  }
  
  private blendIntensity(
    from: TrainingMethodology,
    to: TrainingMethodology,
    ratio: number
  ): { easy: number; moderate: number; hard: number } {
    const fromDist = this.getMethodologyIntensityDistribution(from);
    const toDist = this.getMethodologyIntensityDistribution(to);
    
    return {
      easy: fromDist.easy + (toDist.easy - fromDist.easy) * ratio,
      moderate: fromDist.moderate + (toDist.moderate - fromDist.moderate) * ratio,
      hard: fromDist.hard + (toDist.hard - fromDist.hard) * ratio
    };
  }
  
  private calculateAverageWeeklyVolume(plan: TrainingPlan): number {
    const totalDistance = plan.summary.totalDistance;
    const totalWeeks = plan.summary.totalWeeks;
    return totalDistance / totalWeeks;
  }
  
  private getMethodologyTargetVolume(methodology: TrainingMethodology, currentVolume: number): number {
    const volumeFactors: Record<TrainingMethodology, number> = {
      'daniels': 1.0,
      'lydiard': 1.3,
      'pfitzinger': 1.2
    };
    
    return currentVolume * (volumeFactors[methodology] || 1.0);
  }
  
  private determineFocusZones(methodology: TrainingMethodology, progress: number): string[] {
    if (methodology === 'daniels') {
      if (progress < 0.3) return ['Easy', 'Threshold'];
      if (progress < 0.7) return ['Threshold', 'VO2max'];
      return ['All zones with VDOT precision'];
    }
    
    if (methodology === 'lydiard') {
      if (progress < 0.5) return ['Aerobic', 'Easy'];
      return ['Aerobic', 'Hills', 'Steady State'];
    }
    
    if (methodology === 'pfitzinger') {
      if (progress < 0.5) return ['Lactate Threshold', 'Endurance'];
      return ['Lactate Threshold', 'Marathon Pace', 'Long Runs'];
    }
    
    return ['General adaptation'];
  }
  
  private isRequirementMet(requirement: TransitionRequirement, plan: TrainingPlan): boolean {
    // Simplified validation - in practice would check actual plan data
    return requirement.isMandatory ? Math.random() > 0.3 : true;
  }
  
  private createPhaseModifications(
    phase: TransitionPhase,
    migrationPlan: WorkoutMigrationPlan,
    phaseIndex: number
  ): PlanModification[] {
    const modifications: PlanModification[] = [];
    
    // Volume modification
    modifications.push({
      type: 'reduce_volume',
      reason: `Phase ${phase.phaseNumber}: ${phase.name}`,
      priority: 'medium',
      suggestedChanges: {
        volumeReduction: 100 - phase.volumeTarget
      }
    });
    
    // Workout substitutions based on migration plan
    const weekRange = phase.duration * phaseIndex;
    migrationPlan.migrationSchedule
      .filter(schedule => schedule.week > weekRange && schedule.week <= weekRange + phase.duration)
      .forEach(schedule => {
        schedule.add.forEach(workoutType => {
          modifications.push({
            type: 'substitute_workout',
            reason: `Introduce ${workoutType} for ${phase.name}`,
            priority: 'high',
            suggestedChanges: {
              substituteWorkoutType: workoutType
            }
          });
        });
      });
    
    return modifications;
  }
  
  private createVolumeModifications(volumePlan: VolumeAdjustmentPlan): PlanModification[] {
    return volumePlan.stepBackWeeks.map(week => ({
      type: 'reduce_volume' as const,
      reason: `Step-back week ${week} for recovery`,
      priority: 'high' as const,
      suggestedChanges: {
        volumeReduction: 20
      }
    }));
  }
  
  private createIntensityModifications(intensityPlan: IntensityAdjustmentPlan): PlanModification[] {
    // Create modifications for significant intensity shifts
    const modifications: PlanModification[] = [];
    
    intensityPlan.weeklyProgression.forEach((week, index) => {
      if (index > 0) {
        const prevWeek = intensityPlan.weeklyProgression[index - 1];
        const easyChange = week.distribution.easy - prevWeek.distribution.easy;
        
        if (Math.abs(easyChange) > 5) {
          modifications.push({
            type: 'reduce_intensity',
            reason: `Week ${week.week}: Adjust intensity distribution`,
            priority: 'medium',
            suggestedChanges: {
              intensityReduction: easyChange < 0 ? Math.abs(easyChange) : 0
            }
          });
        }
      }
    });
    
    return modifications;
  }
  
  private createRecoveryModifications(protocol: RecoveryProtocol): PlanModification[] {
    return protocol.recoveryWeeks.map(week => ({
      type: 'add_recovery' as const,
      reason: `Week ${week}: Scheduled recovery for adaptation`,
      priority: 'high' as const,
      suggestedChanges: {
        additionalRecoveryDays: protocol.additionalRecoveryDays
      }
    }));
  }
  
  private generateTransitionOverview(
    from: TrainingMethodology,
    to: TrainingMethodology,
    type: TransitionType
  ): string {
    const typeDescriptions = {
      immediate: 'immediate switch with minimal adjustment period',
      gradual: 'gradual progression over several weeks',
      phased: 'phased approach respecting current training cycle',
      deferred: 'deferred until completion of current training phase'
    };
    
    return `Transitioning from ${from} to ${to} methodology using a ${typeDescriptions[type]}. ` +
           `This transition will help you adapt to the new training philosophy while minimizing disruption ` +
           `to your current fitness and avoiding overtraining or injury.`;
  }
  
  private getTransitionPrinciples(from: TrainingMethodology, to: TrainingMethodology): string[] {
    const principles = [
      'Maintain consistency in training frequency',
      'Preserve aerobic base throughout transition',
      'Monitor fatigue and recovery closely',
      'Be patient with performance fluctuations'
    ];
    
    if (to === 'daniels') {
      principles.push('Learn and practice precise pace execution');
    }
    
    if (to === 'lydiard') {
      principles.push('Embrace effort-based training philosophy');
      principles.push('Trust the aerobic development process');
    }
    
    if (to === 'pfitzinger') {
      principles.push('Master lactate threshold pacing');
      principles.push('Build comfort with medium-long runs');
    }
    
    return principles;
  }
  
  private getTransitionDos(
    from: TrainingMethodology,
    to: TrainingMethodology,
    type: TransitionType
  ): string[] {
    const dos = [
      'Keep detailed training logs during transition',
      'Communicate with coach or support system',
      'Adjust nutrition to match new training demands',
      'Prioritize sleep and recovery'
    ];
    
    if (type === 'gradual' || type === 'phased') {
      dos.push('Follow the transition timeline carefully');
      dos.push('Complete all assessment checkpoints');
    }
    
    if (from === 'daniels' && to === 'lydiard') {
      dos.push('Practice running by feel without constant pace checking');
    }
    
    return dos;
  }
  
  private getTransitionDonts(
    from: TrainingMethodology,
    to: TrainingMethodology,
    type: TransitionType
  ): string[] {
    const donts = [
      "Don't increase volume and intensity simultaneously",
      "Don't skip recovery weeks or days",
      "Don't compare current performance to pre-transition",
      "Don't rush the adaptation process"
    ];
    
    if (type === 'immediate') {
      donts.push("Don't attempt high-intensity workouts in first week");
    }
    
    if (to === 'lydiard') {
      donts.push("Don't add speedwork before aerobic base is established");
    }
    
    return donts;
  }
  
  private createTransitionCheckpoints(type: TransitionType): TransitionCheckpoint[] {
    const checkpoints: TransitionCheckpoint[] = [];
    const weeks = this.getTransitionDuration(type);
    
    // Week 1 checkpoint
    checkpoints.push({
      week: 1,
      name: 'Initial Adaptation',
      assessmentCriteria: [
        'Completed all planned workouts',
        'No significant fatigue or soreness',
        'Maintained training consistency'
      ],
      successIndicators: [
        'Energy levels stable',
        'Sleep quality maintained',
        'Positive training mindset'
      ],
      adjustmentOptions: [
        'Reduce volume by 10% if fatigued',
        'Add extra recovery day if needed',
        'Modify intensity of hard workouts'
      ]
    });
    
    // Mid-transition checkpoint
    if (weeks >= 4) {
      checkpoints.push({
        week: Math.floor(weeks / 2),
        name: 'Mid-Transition Assessment',
        assessmentCriteria: [
          'Adapting to new workout types',
          'Volume targets being met',
          'Recovery metrics stable'
        ],
        successIndicators: [
          'Workout execution improving',
          'Confidence in new methodology growing',
          'Performance maintaining or improving'
        ],
        adjustmentOptions: [
          'Accelerate transition if adapting well',
          'Extend current phase if struggling',
          'Modify specific problematic workouts'
        ]
      });
    }
    
    // Final checkpoint
    checkpoints.push({
      week: weeks,
      name: 'Transition Completion',
      assessmentCriteria: [
        'Full adoption of new methodology',
        'Performance metrics stabilized',
        'Comfort with all workout types'
      ],
      successIndicators: [
        'Consistent workout execution',
        'Improved fitness markers',
        'Enthusiasm for new approach'
      ],
      adjustmentOptions: [
        'Begin normal training progression',
        'Continue monitoring for 2 more weeks',
        'Make minor methodology adjustments'
      ]
    });
    
    return checkpoints;
  }
  
  private createTroubleshootingGuides(
    from: TrainingMethodology,
    to: TrainingMethodology,
    conflicts: MethodologyConflict[]
  ): TroubleshootingGuide[] {
    const guides: TroubleshootingGuide[] = [
      {
        issue: 'Excessive fatigue during transition',
        symptoms: [
          'Persistent tiredness',
          'Declining workout performance',
          'Mood changes',
          'Poor sleep quality'
        ],
        causes: [
          'Too rapid volume increase',
          'Insufficient recovery',
          'Nutritional deficits',
          'Life stress'
        ],
        solutions: [
          'Reduce weekly volume by 20%',
          'Add extra recovery day',
          'Focus on sleep hygiene',
          'Review nutrition intake'
        ],
        preventionTips: [
          'Follow transition timeline strictly',
          'Monitor daily wellness metrics',
          'Communicate fatigue early'
        ]
      },
      {
        issue: 'Difficulty adapting to new pacing system',
        symptoms: [
          'Inconsistent workout paces',
          'Confusion about effort levels',
          'Frustration with workouts',
          'Over/under shooting targets'
        ],
        causes: [
          'Unfamiliarity with new system',
          'Ingrained previous habits',
          'Lack of practice',
          'Equipment limitations'
        ],
        solutions: [
          'Practice pacing in controlled settings',
          'Use both old and new metrics temporarily',
          'Work with experienced runners',
          'Adjust expectations gradually'
        ],
        preventionTips: [
          'Study new methodology thoroughly',
          'Practice before full transition',
          'Use technology aids appropriately'
        ]
      }
    ];
    
    // Add conflict-specific troubleshooting
    conflicts.forEach(conflict => {
      if (conflict.severity === 'high') {
        guides.push({
          issue: conflict.description,
          symptoms: [`Difficulty with ${conflict.conflictType}`],
          causes: [conflict.description],
          solutions: conflict.resolution.steps,
          preventionTips: [`Follow ${conflict.resolution.strategy} strategy`]
        });
      }
    });
    
    return guides;
  }
  
  private createTransitionTimeline(
    plan: DetailedTransitionPlan,
    type: TransitionType
  ): TransitionTimeline {
    const totalDuration = plan.phases.reduce((sum, phase) => sum + phase.duration, 0);
    
    const phases = plan.phases.map((phase, index) => {
      const previousDuration = plan.phases.slice(0, index).reduce((sum, p) => sum + p.duration, 0);
      return {
        name: phase.name,
        startWeek: previousDuration + 1,
        endWeek: previousDuration + phase.duration,
        milestones: phase.milestones
      };
    });
    
    const criticalDates = [
      {
        week: 1,
        event: 'Transition begins',
        importance: 'critical' as const
      },
      {
        week: Math.floor(totalDuration / 2),
        event: 'Mid-transition assessment',
        importance: 'important' as const
      },
      {
        week: totalDuration,
        event: 'Transition complete',
        importance: 'critical' as const
      }
    ];
    
    // Add recovery weeks as important dates
    plan.recoveryProtocol.recoveryWeeks.forEach(week => {
      criticalDates.push({
        week,
        event: 'Recovery week',
        importance: 'important'
      });
    });
    
    return {
      totalDuration,
      phases,
      criticalDates: criticalDates.sort((a, b) => a.week - b.week)
    };
  }
  
  private assessTransitionRisks(
    from: TrainingMethodology,
    to: TrainingMethodology,
    plan: TrainingPlan,
    type: TransitionType
  ): TransitionRisk[] {
    const risks: TransitionRisk[] = [];
    
    // Overtraining risk
    if (to === 'lydiard' || to === 'pfitzinger') {
      risks.push({
        riskType: 'overtraining',
        description: 'Volume increase may lead to overtraining syndrome',
        likelihood: type === 'immediate' ? 'high' : 'medium',
        impact: 'high',
        mitigationStrategies: [
          'Gradual volume progression',
          'Weekly fatigue monitoring',
          'Planned recovery weeks',
          'Flexible plan adjustments'
        ],
        warningSignals: [
          'Chronic fatigue',
          'Performance decline',
          'Mood disturbances',
          'Sleep disruption'
        ]
      });
    }
    
    // Performance decline risk
    risks.push({
      riskType: 'performance_decline',
      description: 'Temporary performance reduction during adaptation',
      likelihood: 'high',
      impact: 'low',
      mitigationStrategies: [
        'Set realistic expectations',
        'Focus on process over outcomes',
        'Plan transition during base phase',
        'Avoid racing during transition'
      ],
      warningSignals: [
        'Significant pace deterioration',
        'Loss of running economy',
        'Reduced motivation'
      ]
    });
    
    // Adaptation failure risk
    if (type === 'immediate') {
      risks.push({
        riskType: 'adaptation_failure',
        description: 'Body may not adapt quickly to new methodology',
        likelihood: 'medium',
        impact: 'medium',
        mitigationStrategies: [
          'Have fallback plan ready',
          'Monitor adaptation markers',
          'Be willing to slow transition',
          'Seek expert guidance'
        ],
        warningSignals: [
          'Persistent workout failures',
          'Increasing injury niggles',
          'Psychological resistance'
        ]
      });
    }
    
    return risks;
  }
}