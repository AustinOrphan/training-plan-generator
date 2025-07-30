import {
  WorkoutType,
  TrainingPhase,
  FitnessAssessment,
  EnvironmentalFactors,
  TrainingPreferences,
  Workout,
  TrainingMethodology,
  PlannedWorkout,
  WorkoutSegment
} from './types';
import { TrainingPhilosophy, PhilosophyFactory } from './philosophies';
import { WORKOUT_TEMPLATES } from './workouts';
import { createCustomWorkout } from './workouts';

/**
 * Workout selection criteria for methodology-specific decisions
 */
export interface WorkoutSelectionCriteria {
  workoutType: WorkoutType;
  phase: TrainingPhase;
  weekNumber: number;
  dayOfWeek: number;
  previousWorkouts?: PlannedWorkout[];
  environmentalFactors?: EnvironmentalFactors;
  timeConstraints?: number; // available minutes
  equipment?: string[];
  fitness?: FitnessAssessment;
  preferences?: TrainingPreferences;
}

/**
 * Workout selection result with rationale
 */
export interface WorkoutSelectionResult {
  workout: Workout;
  templateName: string;
  rationale: string;
  alternativeOptions?: string[];
  warnings?: string[];
  methodologyCompliance: number; // 0-100 score
}

/**
 * Context-aware workout selection based on methodology principles
 * Requirement 4.1: Implement MethodologyWorkoutSelector class with selection rules
 * Requirement 4.2: Add context-aware selection (fitness, environment, equipment)
 */
export class MethodologyWorkoutSelector {
  private philosophy: TrainingPhilosophy;
  private methodology: TrainingMethodology;

  constructor(methodology: TrainingMethodology) {
    this.methodology = methodology;
    this.philosophy = PhilosophyFactory.create(methodology);
  }

  /**
   * Select the most appropriate workout based on methodology and context
   * Requirement 4.1: Create methodology-specific workout selector
   * Requirement 4.4: Choose based on methodology-specific selection criteria
   */
  public selectWorkout(criteria: WorkoutSelectionCriteria): WorkoutSelectionResult {
    // Get base workout recommendation from philosophy
    const templateName = this.philosophy.selectWorkout(
      criteria.workoutType,
      criteria.phase,
      criteria.weekNumber
    );

    let workout: Workout;
    let rationale: string;
    let warnings: string[] = [];
    let alternativeOptions: string[] = [];

    // Check if template exists and is appropriate
    if (templateName && WORKOUT_TEMPLATES[templateName]) {
      workout = { ...WORKOUT_TEMPLATES[templateName] };
      rationale = `Selected ${templateName} based on ${this.methodology} principles for ${criteria.phase} phase`;
    } else {
      // Create custom workout if template not found
      workout = this.createMethodologySpecificWorkout(criteria);
      rationale = `Created custom ${criteria.workoutType} workout following ${this.methodology} guidelines`;
    }
    
    // Ensure workout type is properly set
    workout.type = criteria.workoutType;
    
    // Ensure workout has proper type and template properties set
    if (criteria.workoutType === 'tempo' || criteria.workoutType === 'threshold') {
      // Make sure tempo/threshold workouts have correct intensity
      const hasCorrectIntensity = workout.segments.some(seg => 
        seg.intensity >= 86 && seg.intensity <= 90
      );
      if (!hasCorrectIntensity && this.methodology === 'daniels') {
        // Create a proper tempo workout for Daniels
        workout = this.createDanielsWorkout(criteria, 88, 40);
      }
    }

    // Apply context-specific modifications
    workout = this.applyContextModifications(workout, criteria, warnings);

    // Validate against methodology principles
    const compliance = this.validateMethodologyCompliance(workout, criteria);
    
    // Get alternative options
    alternativeOptions = this.getAlternativeOptions(criteria);

    // Check for conflicts with user preferences
    if (criteria.preferences) {
      // Check time constraints from preferences
      const dayOfWeek = criteria.dayOfWeek;
      const availableTime = criteria.preferences.timeConstraints?.[dayOfWeek];
      if (availableTime && !criteria.timeConstraints) {
        criteria.timeConstraints = availableTime;
        // Re-apply time constraints
        const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
        if (totalDuration > availableTime) {
          workout = this.applyContextModifications(workout, criteria, warnings);
        }
      }
      
      const conflicts = this.checkPreferenceConflicts(workout, criteria.preferences);
      warnings.push(...conflicts);
    }

    return {
      workout,
      templateName: templateName || 'custom',
      rationale,
      alternativeOptions,
      warnings,
      methodologyCompliance: compliance
    };
  }

  /**
   * Create custom workout following methodology guidelines
   * Requirement 4.3: When workout templates are insufficient, create custom workouts
   */
  private createMethodologySpecificWorkout(criteria: WorkoutSelectionCriteria): Workout {
    const baseIntensity = this.getMethodologyIntensity(criteria.workoutType, criteria.phase);
    const duration = this.getMethodologyDuration(criteria.workoutType, criteria.phase);
    
    // Apply methodology-specific customizations
    switch (this.methodology) {
      case 'daniels':
        return this.createDanielsWorkout(criteria, baseIntensity, duration);
      case 'lydiard':
        return this.createLydiardWorkout(criteria, baseIntensity, duration);
      case 'pfitzinger':
        return this.createPfitsingerWorkout(criteria, baseIntensity, duration);
      default:
        return createCustomWorkout(criteria.workoutType, duration, baseIntensity);
    }
  }

  /**
   * Create Daniels-specific workout with VDOT-based pacing
   */
  private createDanielsWorkout(
    criteria: WorkoutSelectionCriteria,
    baseIntensity: number,
    duration: number
  ): Workout {
    const segments: WorkoutSegment[] = [];
    
    switch (criteria.workoutType) {
      case 'tempo':
      case 'threshold':
        // Daniels tempo: 20 minutes at threshold pace
        segments.push(
          { duration: 10, intensity: 65, zone: { name: 'EASY' }, description: 'Warm-up' },
          { duration: 20, intensity: 88, zone: { name: 'THRESHOLD' }, description: 'Tempo at T pace' },
          { duration: 10, intensity: 60, zone: { name: 'RECOVERY' }, description: 'Cool-down' }
        );
        break;
      case 'vo2max':
        // Daniels intervals: 5x3min at I pace
        segments.push(
          { duration: 15, intensity: 65, zone: { name: 'EASY' }, description: 'Warm-up' }
        );
        for (let i = 0; i < 5; i++) {
          segments.push(
            { duration: 3, intensity: 95, zone: { name: 'VO2_MAX' }, description: `Interval ${i + 1} at I pace` },
            { duration: 2, intensity: 60, zone: { name: 'RECOVERY' }, description: 'Recovery jog' }
          );
        }
        segments.push(
          { duration: 10, intensity: 60, zone: { name: 'RECOVERY' }, description: 'Cool-down' }
        );
        break;
      default:
        segments.push({
          duration,
          intensity: baseIntensity,
          zone: { name: this.getZoneName(baseIntensity) },
          description: `${criteria.workoutType} workout`
        });
    }

    return {
      type: criteria.workoutType,
      primaryZone: { name: this.getZoneName(baseIntensity) },
      segments,
      adaptationTarget: this.getDanielsAdaptationTarget(criteria.workoutType),
      estimatedTSS: this.calculateTSS(segments),
      recoveryTime: this.getRecoveryTime(criteria.workoutType, duration, baseIntensity)
    };
  }

  /**
   * Create Lydiard-specific workout with aerobic emphasis
   */
  private createLydiardWorkout(
    criteria: WorkoutSelectionCriteria,
    baseIntensity: number,
    duration: number
  ): Workout {
    const segments: WorkoutSegment[] = [];
    
    switch (criteria.workoutType) {
      case 'long_run':
        // Lydiard long run: steady aerobic effort
        segments.push({
          duration: Math.min(duration, 180), // Cap at 3 hours
          intensity: 65,
          zone: { name: 'EASY' },
          description: 'Aerobic long run - conversation pace'
        });
        break;
      case 'hill_repeats':
        // Lydiard hills: strength-building focus
        segments.push(
          { duration: 15, intensity: 65, zone: { name: 'EASY' }, description: 'Warm-up to hills' }
        );
        const reps = criteria.phase === 'base' ? 6 : 8;
        for (let i = 0; i < reps; i++) {
          segments.push(
            { duration: 3, intensity: 85, zone: { name: 'TEMPO' }, description: `Hill repeat ${i + 1} - strong effort` },
            { duration: 2, intensity: 50, zone: { name: 'RECOVERY' }, description: 'Walk/jog down' }
          );
        }
        segments.push(
          { duration: 10, intensity: 60, zone: { name: 'RECOVERY' }, description: 'Cool-down' }
        );
        break;
      default:
        segments.push({
          duration,
          intensity: Math.min(baseIntensity, 75), // Keep intensity moderate
          zone: { name: this.getZoneName(Math.min(baseIntensity, 75)) },
          description: `${criteria.workoutType} workout - aerobic emphasis`
        });
    }

    return {
      type: criteria.workoutType,
      primaryZone: { name: this.getZoneName(baseIntensity) },
      segments,
      adaptationTarget: this.getLydiardAdaptationTarget(criteria.workoutType),
      estimatedTSS: this.calculateTSS(segments),
      recoveryTime: this.getRecoveryTime(criteria.workoutType, duration, baseIntensity)
    };
  }

  /**
   * Create Pfitzinger-specific workout with LT emphasis
   */
  private createPfitsingerWorkout(
    criteria: WorkoutSelectionCriteria,
    baseIntensity: number,
    duration: number
  ): Workout {
    const segments: WorkoutSegment[] = [];
    
    switch (criteria.workoutType) {
      case 'threshold':
        // Pfitzinger LT: continuous or intervals
        if (criteria.phase === 'build' || criteria.phase === 'peak') {
          // LT intervals
          segments.push(
            { duration: 15, intensity: 65, zone: { name: 'EASY' }, description: 'Warm-up' }
          );
          segments.push(
            { duration: 15, intensity: 88, zone: { name: 'THRESHOLD' }, description: 'LT interval 1' },
            { duration: 3, intensity: 65, zone: { name: 'EASY' }, description: 'Recovery' },
            { duration: 15, intensity: 88, zone: { name: 'THRESHOLD' }, description: 'LT interval 2' }
          );
          segments.push(
            { duration: 10, intensity: 60, zone: { name: 'RECOVERY' }, description: 'Cool-down' }
          );
        } else {
          // Continuous tempo
          segments.push(
            { duration: 10, intensity: 65, zone: { name: 'EASY' }, description: 'Warm-up' },
            { duration: 25, intensity: 86, zone: { name: 'THRESHOLD' }, description: 'Continuous LT run' },
            { duration: 10, intensity: 60, zone: { name: 'RECOVERY' }, description: 'Cool-down' }
          );
        }
        break;
      case 'long_run':
        // Pfitzinger medium-long with quality
        if (criteria.phase === 'build' && criteria.weekNumber > 4) {
          // Medium-long with tempo
          segments.push(
            { duration: 40, intensity: 70, zone: { name: 'EASY' }, description: 'Easy start' },
            { duration: 20, intensity: 85, zone: { name: 'TEMPO' }, description: 'Tempo segment' },
            { duration: 30, intensity: 70, zone: { name: 'EASY' }, description: 'Easy finish' }
          );
        } else {
          // Standard long run
          segments.push({
            duration,
            intensity: 70,
            zone: { name: 'EASY' },
            description: 'Long run at steady pace'
          });
        }
        break;
      default:
        segments.push({
          duration,
          intensity: baseIntensity,
          zone: { name: this.getZoneName(baseIntensity) },
          description: `${criteria.workoutType} workout`
        });
    }

    return {
      type: criteria.workoutType,
      primaryZone: { name: this.getZoneName(baseIntensity) },
      segments,
      adaptationTarget: this.getPfitsingerAdaptationTarget(criteria.workoutType),
      estimatedTSS: this.calculateTSS(segments),
      recoveryTime: this.getRecoveryTime(criteria.workoutType, duration, baseIntensity)
    };
  }

  /**
   * Apply modifications based on environmental and other constraints
   * Requirement 4.2: Add context-aware selection
   * Requirement 4.7: Substitute workouts while maintaining methodology integrity
   */
  private applyContextModifications(
    workout: Workout,
    criteria: WorkoutSelectionCriteria,
    warnings: string[]
  ): Workout {
    const modified = { ...workout };

    // Time constraints
    if (criteria.timeConstraints) {
      const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
      if (totalDuration > criteria.timeConstraints) {
        modified.segments = this.adjustWorkoutDuration(workout.segments, criteria.timeConstraints);
        warnings.push(`Workout shortened from ${totalDuration} to ${criteria.timeConstraints} minutes due to time constraints`);
      }
    }

    // Environmental factors
    if (criteria.environmentalFactors) {
      const env = criteria.environmentalFactors;
      
      // Altitude adjustments
      if (env.altitude && env.altitude > 1500) {
        modified.segments = modified.segments.map(seg => ({
          ...seg,
          intensity: Math.max(seg.intensity - 5, 50) // Reduce intensity at altitude
        }));
        warnings.push('Intensity reduced due to altitude');
      }

      // Temperature adjustments
      if (env.typicalTemperature) {
        if (env.typicalTemperature > 25) {
          modified.segments = modified.segments.map(seg => ({
            ...seg,
            intensity: Math.max(seg.intensity - 3, 50)
          }));
          warnings.push('Intensity reduced due to high temperature');
        } else if (env.typicalTemperature < 0) {
          // Add extra warm-up
          modified.segments.unshift({
            duration: 5,
            intensity: 60,
            zone: { name: 'RECOVERY' },
            description: 'Extra warm-up for cold conditions'
          });
        }
      }

      // Terrain adjustments
      if (env.terrain === 'hilly' && workout.type !== 'hill_repeats') {
        warnings.push('Adjust pace expectations for hilly terrain');
      }
    }

    // Equipment constraints
    if (criteria.equipment && !criteria.equipment.includes('track') && workout.type === 'speed') {
      // Modify speed workout for road/trail
      modified.segments = modified.segments.map(seg => {
        if (seg.intensity > 95) {
          return {
            ...seg,
            intensity: 92,
            description: seg.description + ' (modified for non-track surface)'
          };
        }
        return seg;
      });
      warnings.push('Speed workout modified for non-track surface');
    }

    return modified;
  }

  /**
   * Validate workout against methodology principles
   * Requirement 4.4: Methodology-specific selection criteria
   */
  private validateMethodologyCompliance(workout: Workout, criteria: WorkoutSelectionCriteria): number {
    let score = 100;
    const deductions: string[] = [];

    switch (this.methodology) {
      case 'daniels':
        // Check VDOT-based pacing compliance
        if (workout.type === 'tempo' || workout.type === 'threshold') {
          const hasCorrectIntensity = workout.segments.some(seg => 
            seg.intensity >= 86 && seg.intensity <= 90
          );
          if (!hasCorrectIntensity) {
            score -= 20;
            deductions.push('Tempo/threshold intensity outside Daniels T-pace range');
          }
        }
        // Check phase-appropriate workout selection
        if (criteria.phase === 'base' && workout.type === 'vo2max') {
          score -= 30;
          deductions.push('VO2max work too early for Daniels base phase');
        }
        break;

      case 'lydiard':
        // Check aerobic emphasis
        const hardSegments = workout.segments.filter(seg => seg.intensity > 85);
        const hardPercentage = hardSegments.reduce((sum, seg) => sum + seg.duration, 0) / 
                              workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
        if (hardPercentage > 0.15) {
          score -= 25;
          deductions.push('Excessive hard running for Lydiard methodology');
        }
        // Check base phase compliance
        if (criteria.phase === 'base' && ['vo2max', 'speed'].includes(workout.type)) {
          score -= 60; // More severe penalty for anaerobic work in base
          deductions.push('Anaerobic work inappropriate for Lydiard base phase');
        }
        // Additional penalty for speed work
        if (criteria.phase === 'base' && workout.type === 'speed') {
          score = Math.min(score, 40); // Cap score at 40 for speed work in base
        }
        break;

      case 'pfitzinger':
        // Check lactate threshold emphasis
        if (criteria.phase === 'build' || criteria.phase === 'peak') {
          const hasThresholdWork = workout.segments.some(seg => 
            seg.intensity >= 84 && seg.intensity <= 92
          );
          if (workout.type === 'tempo' && !hasThresholdWork) {
            score -= 20;
            deductions.push('Tempo workout missing lactate threshold work');
          }
        }
        // Check medium-long run structure
        if (workout.type === 'long_run' && criteria.phase === 'build') {
          const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
          if (totalDuration >= 90 && totalDuration <= 150) {
            const hasQualitySegment = workout.segments.some(seg => seg.intensity >= 82);
            if (!hasQualitySegment) {
              score -= 15;
              deductions.push('Medium-long run missing quality segment');
            }
          }
        }
        break;
    }

    // General compliance checks
    if (workout.segments.length === 0) {
      score = 0;
      deductions.push('Workout has no segments');
    }

    // Recovery time compliance
    if (workout.recoveryTime < 8) {
      score -= 10;
      deductions.push('Insufficient recovery time specified');
    }

    return Math.max(score, 0);
  }

  /**
   * Get alternative workout options
   */
  private getAlternativeOptions(criteria: WorkoutSelectionCriteria): string[] {
    const alternatives: string[] = [];
    
    // Get phase-appropriate alternatives
    switch (criteria.workoutType) {
      case 'tempo':
        alternatives.push('TEMPO_CONTINUOUS', 'THRESHOLD_PROGRESSION');
        if (this.methodology === 'pfitzinger') {
          alternatives.push('LACTATE_THRESHOLD_2X20');
        }
        break;
      case 'vo2max':
        alternatives.push('VO2MAX_4X4', 'VO2MAX_5X3');
        if (this.methodology === 'daniels') {
          alternatives.push('Custom I-pace intervals');
        }
        break;
      case 'long_run':
        alternatives.push('LONG_RUN');
        if (this.methodology === 'pfitzinger' && criteria.phase === 'build') {
          alternatives.push('Medium-long with tempo', 'Progressive long run');
        }
        break;
      case 'hill_repeats':
        if (this.methodology === 'lydiard') {
          alternatives.push('LYDIARD_HILL_BASE', 'LYDIARD_HILL_BUILD', 'LYDIARD_HILL_PEAK');
        } else {
          alternatives.push('HILL_REPEATS_6X2');
        }
        break;
    }

    return alternatives;
  }

  /**
   * Check for conflicts with user preferences
   * Requirement 4.8: Provide warnings and methodology-compliant alternatives
   */
  private checkPreferenceConflicts(workout: Workout, preferences: TrainingPreferences): string[] {
    const conflicts: string[] = [];

    // Check intensity preference
    const avgIntensity = this.calculateAverageIntensity(workout.segments);
    if (preferences.preferredIntensity === 'low' && avgIntensity > 75) {
      conflicts.push(`Workout intensity (${avgIntensity}%) exceeds your low intensity preference. Consider adjusting expectations or methodology.`);
    } else if (preferences.preferredIntensity === 'high' && avgIntensity < 70) {
      conflicts.push(`Workout intensity (${avgIntensity}%) is lower than your high intensity preference. ${this.methodology} methodology emphasizes controlled efforts.`);
    }
    
    // Add general conflict warning for tempo with low intensity preference
    if (preferences.preferredIntensity === 'low' && (workout.type === 'tempo' || workout.type === 'threshold')) {
      conflicts.push('Tempo/threshold workouts have higher intensity than your preference indicates.');
    }

    // Check time constraints
    const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
    const dayOfWeek = new Date().getDay();
    const availableTime = preferences.timeConstraints?.[dayOfWeek];
    if (availableTime && totalDuration > availableTime) {
      conflicts.push(`Workout duration (${totalDuration} min) exceeds available time (${availableTime} min). Workout has been adjusted.`);
    }

    return conflicts;
  }

  /**
   * Adjust workout duration to fit time constraints
   */
  private adjustWorkoutDuration(segments: WorkoutSegment[], targetDuration: number): WorkoutSegment[] {
    const currentDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const ratio = targetDuration / currentDuration;

    // Adjust segments but ensure total doesn't exceed target due to rounding
    let adjustedSegments = segments.map(seg => ({
      ...seg,
      duration: Math.floor(seg.duration * ratio) // Use floor to avoid exceeding
    }));
    
    // Add back any missing minutes to the largest segment
    const adjustedTotal = adjustedSegments.reduce((sum, seg) => sum + seg.duration, 0);
    const difference = targetDuration - adjustedTotal;
    if (difference > 0) {
      const maxSegmentIndex = adjustedSegments.reduce((maxIdx, seg, idx, arr) => 
        seg.duration > arr[maxIdx].duration ? idx : maxIdx, 0
      );
      adjustedSegments[maxSegmentIndex].duration += difference;
    }
    
    return adjustedSegments;
  }

  /**
   * Calculate average intensity across segments
   */
  private calculateAverageIntensity(segments: WorkoutSegment[]): number {
    const totalWeightedIntensity = segments.reduce((sum, seg) => sum + (seg.intensity * seg.duration), 0);
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    return Math.round(totalWeightedIntensity / totalDuration);
  }

  /**
   * Calculate Training Stress Score
   */
  private calculateTSS(segments: WorkoutSegment[]): number {
    return segments.reduce((sum, seg) => {
      const intensityFactor = seg.intensity / 100;
      return sum + (seg.duration * Math.pow(intensityFactor, 2) * 100) / 60;
    }, 0);
  }

  /**
   * Get methodology-specific intensity for workout type
   */
  private getMethodologyIntensity(workoutType: WorkoutType, phase: TrainingPhase): number {
    const intensityMap: Record<TrainingMethodology, Record<WorkoutType, number>> = {
      daniels: {
        recovery: 60,
        easy: 65,
        steady: 75,
        tempo: 88,
        threshold: 88,
        vo2max: 95,
        speed: 98,
        hill_repeats: 90,
        fartlek: 80,
        progression: 75,
        long_run: 65,
        race_pace: 85,
        time_trial: 92,
        cross_training: 65,
        strength: 70
      },
      lydiard: {
        recovery: 55,
        easy: 65,
        steady: 70,
        tempo: 80,
        threshold: 82,
        vo2max: 90,
        speed: 92,
        hill_repeats: 85,
        fartlek: 75,
        progression: 70,
        long_run: 65,
        race_pace: 80,
        time_trial: 85,
        cross_training: 60,
        strength: 65
      },
      pfitzinger: {
        recovery: 60,
        easy: 68,
        steady: 75,
        tempo: 85,
        threshold: 88,
        vo2max: 94,
        speed: 96,
        hill_repeats: 88,
        fartlek: 80,
        progression: 78,
        long_run: 70,
        race_pace: 86,
        time_trial: 90,
        cross_training: 65,
        strength: 70
      },
      hudson: {
        recovery: 60,
        easy: 65,
        steady: 75,
        tempo: 85,
        threshold: 88,
        vo2max: 95,
        speed: 98,
        hill_repeats: 90,
        fartlek: 80,
        progression: 75,
        long_run: 65,
        race_pace: 85,
        time_trial: 92,
        cross_training: 65,
        strength: 70
      },
      custom: {
        recovery: 60,
        easy: 65,
        steady: 75,
        tempo: 85,
        threshold: 88,
        vo2max: 95,
        speed: 98,
        hill_repeats: 90,
        fartlek: 80,
        progression: 75,
        long_run: 65,
        race_pace: 85,
        time_trial: 92,
        cross_training: 65,
        strength: 70
      }
    };

    return intensityMap[this.methodology]?.[workoutType] || 70;
  }

  /**
   * Get methodology-specific duration for workout type
   */
  private getMethodologyDuration(workoutType: WorkoutType, phase: TrainingPhase): number {
    const basedurations: Record<WorkoutType, number> = {
      recovery: 30,
      easy: 60,
      steady: 75,
      tempo: 50,
      threshold: 60,
      vo2max: 50,
      speed: 45,
      hill_repeats: 60,
      fartlek: 45,
      progression: 60,
      long_run: 120,
      race_pace: 70,
      time_trial: 40,
      cross_training: 45,
      strength: 30
    };

    let duration = basedurations[workoutType] || 60;

    // Adjust for phase
    if (phase === 'base') {
      duration *= 0.8;
    } else if (phase === 'peak') {
      duration *= 1.1;
    }

    // Adjust for methodology
    if (this.methodology === 'lydiard' && workoutType === 'long_run') {
      duration *= 1.3; // Longer long runs
    } else if (this.methodology === 'pfitzinger' && workoutType === 'tempo') {
      duration *= 1.2; // Longer threshold work
    }

    return Math.round(duration);
  }

  /**
   * Get zone name from intensity
   */
  private getZoneName(intensity: number): string {
    if (intensity < 60) return 'RECOVERY';
    if (intensity < 70) return 'EASY';
    if (intensity < 80) return 'STEADY';
    if (intensity < 87) return 'TEMPO';
    if (intensity < 92) return 'THRESHOLD';
    if (intensity < 97) return 'VO2_MAX';
    return 'NEUROMUSCULAR';
  }

  /**
   * Get recovery time based on workout
   */
  private getRecoveryTime(workoutType: WorkoutType, duration: number, intensity: number): number {
    const baseRecovery: Record<WorkoutType, number> = {
      recovery: 8,
      easy: 12,
      steady: 18,
      tempo: 24,
      threshold: 36,
      vo2max: 48,
      speed: 36,
      hill_repeats: 36,
      fartlek: 24,
      progression: 24,
      long_run: 24,
      race_pace: 36,
      time_trial: 48,
      cross_training: 12,
      strength: 24
    };

    const base = baseRecovery[workoutType] || 24;
    const intensityMultiplier = intensity / 80;
    const durationMultiplier = duration / 60;

    return Math.round(base * intensityMultiplier * durationMultiplier);
  }

  /**
   * Get methodology-specific adaptation targets
   */
  private getDanielsAdaptationTarget(workoutType: WorkoutType): string {
    const targets: Record<WorkoutType, string> = {
      recovery: 'Active recovery and blood flow',
      easy: 'Aerobic base and mitochondrial development',
      steady: 'Aerobic capacity and fat oxidation',
      tempo: 'Lactate threshold and buffering capacity',
      threshold: 'Lactate threshold clearance at T-pace',
      vo2max: 'VO2max and oxygen utilization at I-pace',
      speed: 'Neuromuscular power and running economy at R-pace',
      hill_repeats: 'Power development and running form',
      fartlek: 'Speed variation and mental toughness',
      progression: 'Pacing control and fatigue resistance',
      long_run: 'Glycogen storage and mental resilience',
      race_pace: 'Race-specific metabolic efficiency',
      time_trial: 'Competitive readiness and pacing',
      cross_training: 'Active recovery and injury prevention',
      strength: 'Muscular strength and injury prevention'
    };
    return targets[workoutType] || 'General fitness improvement';
  }

  private getLydiardAdaptationTarget(workoutType: WorkoutType): string {
    const targets: Record<WorkoutType, string> = {
      recovery: 'Complete recovery and regeneration',
      easy: 'Aerobic enzyme development and capillarization',
      steady: 'Aerobic threshold improvement',
      tempo: 'Steady-state aerobic capacity',
      threshold: 'Aerobic/anaerobic transition development',
      vo2max: 'Maximum oxygen uptake (anaerobic phase only)',
      speed: 'Neuromuscular coordination (peak phase only)',
      hill_repeats: 'Leg strength and power development',
      fartlek: 'Speed play and running enjoyment',
      progression: 'Aerobic capacity under fatigue',
      long_run: 'Maximum aerobic development and fat metabolism',
      race_pace: 'Race rhythm and efficiency',
      time_trial: 'Competitive sharpening',
      cross_training: 'Supplementary aerobic development',
      strength: 'Injury prevention and hill running preparation'
    };
    return targets[workoutType] || 'Aerobic system development';
  }

  private getPfitsingerAdaptationTarget(workoutType: WorkoutType): string {
    const targets: Record<WorkoutType, string> = {
      recovery: 'Recovery and adaptation',
      easy: 'General aerobic conditioning',
      steady: 'Aerobic development',
      tempo: 'Lactate threshold improvement',
      threshold: 'Lactate threshold clearance and threshold pace',
      vo2max: 'VO2max and speed development',
      speed: 'Neuromuscular power and efficiency',
      hill_repeats: 'Strength and power development',
      fartlek: 'Speed variation and lactate tolerance',
      progression: 'Fatigue resistance and pacing',
      long_run: 'Endurance and glycogen utilization',
      race_pace: 'Marathon-specific adaptations',
      time_trial: 'Race preparation and pacing',
      cross_training: 'Active recovery and variety',
      strength: 'Injury prevention and running economy'
    };
    return targets[workoutType] || 'Performance improvement';
  }

  /**
   * Automatically advance workout difficulty based on progression
   * Requirement 4.5: Automatically advance workout difficulty following methodology patterns
   */
  public getProgressedWorkout(
    previousWorkout: PlannedWorkout,
    weeksSinceStart: number,
    performanceData?: { completionRate: number; difficultyRating: number }
  ): WorkoutSelectionResult {
    const criteria: WorkoutSelectionCriteria = {
      workoutType: previousWorkout.type,
      phase: this.getPhaseFromWeek(weeksSinceStart),
      weekNumber: weeksSinceStart,
      dayOfWeek: previousWorkout.date.getDay()
    };

    // Get base workout - if previous workout has segments, use it as base
    let result: WorkoutSelectionResult;
    if (previousWorkout.workout && previousWorkout.workout.segments && previousWorkout.workout.segments.length > 0) {
      // Use the previous workout as the base
      result = {
        workout: { ...previousWorkout.workout },
        templateName: 'progressed',
        rationale: `Progressing from previous ${previousWorkout.type} workout`,
        methodologyCompliance: 100
      };
    } else {
      // Get a new workout
      result = this.selectWorkout(criteria);
    }

    // Apply progression based on methodology
    if (performanceData && performanceData.completionRate > 0.9 && performanceData.difficultyRating <= 7) {
      result.workout = this.applyMethodologyProgression(
        result.workout,
        weeksSinceStart,
        performanceData.difficultyRating
      );
      result.rationale += ` - Progressed based on ${Math.round(performanceData.completionRate * 100)}% completion rate`;
    }

    return result;
  }

  /**
   * Apply methodology-specific progression patterns
   */
  private applyMethodologyProgression(
    workout: Workout,
    weeksSinceStart: number,
    difficultyRating: number
  ): Workout {
    const progressed = { ...workout };

    switch (this.methodology) {
      case 'daniels':
        // Daniels: Increase volume before intensity
        if (difficultyRating < 7) {
          progressed.segments = progressed.segments.map(seg => {
            if (seg.zone.name === 'THRESHOLD' || seg.zone.name === 'VO2_MAX') {
              return { ...seg, duration: Math.round(seg.duration * 1.1) };
            }
            return seg;
          });
        }
        break;

      case 'lydiard':
        // Lydiard: Gradual volume increases
        if (weeksSinceStart < 12) {
          progressed.segments = progressed.segments.map(seg => {
            if (seg.intensity < 75) {
              return { ...seg, duration: Math.round(seg.duration * 1.05) };
            }
            return seg;
          });
        }
        break;

      case 'pfitzinger':
        // Pfitzinger: Increase threshold volume
        if (workout.type === 'threshold' || workout.type === 'tempo') {
          progressed.segments = progressed.segments.map(seg => {
            if (seg.intensity >= 84 && seg.intensity <= 92) {
              return { ...seg, duration: Math.round(seg.duration * 1.08) };
            }
            return seg;
          });
        }
        break;
    }

    // Update TSS
    progressed.estimatedTSS = this.calculateTSS(progressed.segments);

    return progressed;
  }

  /**
   * Get training phase from week number
   */
  private getPhaseFromWeek(weekNumber: number): TrainingPhase {
    if (weekNumber <= 4) return 'base';
    if (weekNumber <= 12) return 'build';
    if (weekNumber <= 16) return 'peak';
    if (weekNumber <= 18) return 'taper';
    return 'recovery';
  }

  /**
   * Select recovery workout based on methodology preferences
   * Requirement 4.6: Select appropriate active recovery or rest
   */
  public selectRecoveryWorkout(
    previousWorkouts: PlannedWorkout[],
    recoveryNeeded: number // 0-100 scale
  ): WorkoutSelectionResult {
    const criteria: WorkoutSelectionCriteria = {
      workoutType: 'recovery',
      phase: 'recovery',
      weekNumber: 1,
      dayOfWeek: new Date().getDay(),
      previousWorkouts
    };

    if (recoveryNeeded > 80 && this.methodology === 'lydiard') {
      // Lydiard prefers complete rest
      return {
        workout: {
          type: 'recovery',
          primaryZone: { name: 'RECOVERY' },
          segments: [{
            duration: 0,
            intensity: 0,
            zone: { name: 'RECOVERY' },
            description: 'Complete rest day - no running'
          }],
          adaptationTarget: 'Full recovery and adaptation',
          estimatedTSS: 0,
          recoveryTime: 0
        },
        templateName: 'rest_day',
        rationale: 'Lydiard methodology emphasizes complete rest for optimal recovery',
        methodologyCompliance: 100
      };
    }

    // Other methodologies use active recovery
    const result = this.selectWorkout(criteria);
    
    // Adjust intensity based on recovery need
    if (recoveryNeeded > 60) {
      result.workout.segments = result.workout.segments.map(seg => ({
        ...seg,
        intensity: Math.max(seg.intensity - 10, 50)
      }));
      result.rationale += ` - Intensity reduced due to high recovery need (${recoveryNeeded}/100)`;
    }

    return result;
  }
}