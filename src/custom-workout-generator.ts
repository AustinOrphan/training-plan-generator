import {
  WorkoutType,
  Workout,
  WorkoutSegment,
  TrainingMethodology,
  TrainingPhase,
  EnvironmentalFactors,
  FitnessAssessment,
  TrainingPreferences
} from './types';
import { createCustomWorkout } from './workouts';
import { TRAINING_ZONES } from './zones';
import { PhilosophyFactory, TrainingPhilosophy } from './philosophies';

/**
 * Custom workout generation parameters
 */
export interface CustomWorkoutParameters {
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
export interface WorkoutConstraints {
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
export interface GeneratedWorkout {
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
export class CustomWorkoutGenerator {
  private philosophy: TrainingPhilosophy;
  private methodology: TrainingMethodology;

  constructor(methodology: TrainingMethodology) {
    this.methodology = methodology;
    this.philosophy = PhilosophyFactory.create(methodology);
  }

  /**
   * Generate a custom workout based on complex requirements
   * Requirement 4.3: Create custom workouts following methodology guidelines
   */
  public generateWorkout(parameters: CustomWorkoutParameters): GeneratedWorkout {
    const {
      type,
      phase,
      targetDuration = this.getDefaultDuration(type, phase),
      targetIntensity = this.getDefaultIntensity(type, phase),
      environmentalFactors,
      equipment,
      constraints = {},
      preferences
    } = parameters;

    // Apply constraints to targets
    const adjustedDuration = this.applyDurationConstraints(targetDuration, constraints);
    const adjustedIntensity = this.applyIntensityConstraints(targetIntensity, constraints, environmentalFactors);

    // Generate segments based on methodology
    const segments = this.generateMethodologySegments(
      type,
      phase,
      adjustedDuration,
      adjustedIntensity
    );

    // Apply environmental and equipment modifications
    const modifiedSegments = this.applyEnvironmentalModifications(
      segments,
      environmentalFactors,
      equipment
    );

    // Create the workout
    const workout = this.createWorkoutFromSegments(type, modifiedSegments);

    // Calculate compliance
    const compliance = this.calculateMethodologyCompliance(workout, type, phase);

    // Generate alternatives if needed
    const alternatives = compliance < 80 ? this.generateAlternatives(parameters) : undefined;

    // Build rationale
    const rationale = this.buildRationale(type, phase, constraints, environmentalFactors);

    // Collect constraint warnings
    const constraintWarnings = this.collectConstraintWarnings(parameters, workout);

    return {
      workout,
      rationale,
      methodologyCompliance: compliance,
      constraints: constraintWarnings,
      alternatives
    };
  }

  /**
   * Generate workout segments following methodology principles
   * Requirement 4.3: Methodology-specific workout creation rules
   */
  private generateMethodologySegments(
    type: WorkoutType,
    phase: TrainingPhase,
    duration: number,
    targetIntensity: number
  ): WorkoutSegment[] {
    switch (this.methodology) {
      case 'daniels':
        return this.generateDanielsSegments(type, phase, duration, targetIntensity);
      case 'lydiard':
        return this.generateLydiardSegments(type, phase, duration, targetIntensity);
      case 'pfitzinger':
        return this.generatePfitsingerSegments(type, phase, duration, targetIntensity);
      default:
        return this.generateDefaultSegments(type, duration, targetIntensity);
    }
  }

  /**
   * Generate Daniels-specific segments with precise pacing
   */
  private generateDanielsSegments(
    type: WorkoutType,
    phase: TrainingPhase,
    duration: number,
    targetIntensity: number
  ): WorkoutSegment[] {
    const segments: WorkoutSegment[] = [];

    switch (type) {
      case 'tempo':
      case 'threshold':
        // Daniels tempo: warm-up, T-pace, cool-down
        const tempoDuration = Math.max(20, duration * 0.5);
        const warmupCooldown = (duration - tempoDuration) / 2;
        
        segments.push(
          {
            duration: Math.round(warmupCooldown),
            intensity: 65,
            zone: TRAINING_ZONES.EASY,
            description: 'Warm-up to T-pace'
          },
          {
            duration: Math.round(tempoDuration),
            intensity: 88, // Daniels T-pace
            zone: TRAINING_ZONES.TEMPO, // Changed from THRESHOLD to TEMPO for 88 intensity
            description: 'Tempo at T-pace'
          },
          {
            duration: Math.round(warmupCooldown),
            intensity: 60,
            zone: TRAINING_ZONES.RECOVERY,
            description: 'Cool-down'
          }
        );
        break;

      case 'vo2max':
        // Daniels intervals: I-pace with recovery
        const warmup = Math.min(15, duration * 0.25);
        const cooldown = Math.min(10, duration * 0.15);
        const workDuration = duration - warmup - cooldown;
        const intervalLength = phase === 'peak' ? 4 : 3; // Longer intervals in peak
        const recoveryRatio = 0.8; // 80% recovery time
        
        segments.push({
          duration: warmup,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: 'Warm-up'
        });

        // Calculate number of intervals
        const intervalTime = intervalLength + (intervalLength * recoveryRatio);
        const numIntervals = Math.floor(workDuration / intervalTime);

        for (let i = 0; i < numIntervals; i++) {
          segments.push(
            {
              duration: intervalLength,
              intensity: 95, // I-pace
              zone: TRAINING_ZONES.VO2_MAX,
              description: `Interval ${i + 1} at I-pace`
            },
            {
              duration: Math.round(intervalLength * recoveryRatio),
              intensity: 60,
              zone: TRAINING_ZONES.RECOVERY,
              description: 'Recovery jog'
            }
          );
        }

        segments.push({
          duration: cooldown,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: 'Cool-down'
        });
        break;

      case 'speed':
        // Daniels repetitions: R-pace with full recovery
        segments.push({
          duration: 15,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: 'Warm-up with strides'
        });

        const repDuration = 1; // 1 minute reps
        const repRecovery = 3; // 3 minutes recovery
        const availableTime = duration - 25; // Minus warm-up/cool-down
        const reps = Math.floor(availableTime / (repDuration + repRecovery));

        for (let i = 0; i < reps; i++) {
          segments.push(
            {
              duration: repDuration,
              intensity: 98, // R-pace
              zone: TRAINING_ZONES.NEUROMUSCULAR,
              description: `Rep ${i + 1} at R-pace`
            },
            {
              duration: repRecovery,
              intensity: 50,
              zone: TRAINING_ZONES.RECOVERY,
              description: 'Full recovery'
            }
          );
        }

        segments.push({
          duration: 10,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: 'Cool-down'
        });
        break;

      default:
        // For other types, use single segment at appropriate intensity
        segments.push({
          duration,
          intensity: targetIntensity,
          zone: this.getZoneForIntensity(targetIntensity),
          description: `${type} workout at ${this.getPaceName(targetIntensity)} pace`
        });
    }

    return segments;
  }

  /**
   * Generate Lydiard-specific segments with aerobic emphasis
   */
  private generateLydiardSegments(
    type: WorkoutType,
    phase: TrainingPhase,
    duration: number,
    targetIntensity: number
  ): WorkoutSegment[] {
    const segments: WorkoutSegment[] = [];

    switch (type) {
      case 'long_run':
        // Lydiard long runs: steady aerobic effort
        if (phase === 'base') {
          // Pure aerobic in base
          segments.push({
            duration,
            intensity: 65,
            zone: TRAINING_ZONES.EASY,
            description: 'Aerobic long run - conversation pace throughout'
          });
        } else if (phase === 'build') {
          // Can add some faster finish
          const easyDuration = Math.round(duration * 0.75);
          const steadyDuration = duration - easyDuration;
          
          segments.push(
            {
              duration: easyDuration,
              intensity: 65,
              zone: TRAINING_ZONES.EASY,
              description: 'Aerobic pace - relaxed and comfortable'
            },
            {
              duration: steadyDuration,
              intensity: 75,
              zone: TRAINING_ZONES.STEADY,
              description: 'Steady aerobic finish - strong but controlled'
            }
          );
        }
        break;

      case 'hill_repeats':
        // Lydiard hills: strength and power focus
        const hillWarmup = 20;
        const hillCooldown = 15;
        const hillWork = duration - hillWarmup - hillCooldown;
        
        segments.push({
          duration: hillWarmup,
          intensity: 65,
          zone: TRAINING_ZONES.EASY,
          description: 'Warm-up to hill location'
        });

        // Hill circuit approach
        if (phase === 'base') {
          // Continuous hill circuit
          segments.push({
            duration: hillWork,
            intensity: 80,
            zone: TRAINING_ZONES.TEMPO,
            description: 'Hill circuit: bound up, jog down, repeat continuously'
          });
        } else {
          // Interval hills
          const hillInterval = 3;
          const recovery = 2;
          const circuits = Math.floor(hillWork / (hillInterval + recovery));
          
          for (let i = 0; i < circuits; i++) {
            segments.push(
              {
                duration: hillInterval,
                intensity: 85,
                zone: TRAINING_ZONES.TEMPO,
                description: `Hill ${i + 1}: Strong effort with good form`
              },
              {
                duration: recovery,
                intensity: 50,
                zone: TRAINING_ZONES.RECOVERY,
                description: 'Jog down recovery'
              }
            );
          }
        }

        segments.push({
          duration: hillCooldown,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: 'Cool-down jog'
        });
        break;

      case 'fartlek':
        // Lydiard fartlek: unstructured speed play
        segments.push(
          {
            duration: 15,
            intensity: 65,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy warm-up'
          },
          {
            duration: duration - 25,
            intensity: 75,
            zone: TRAINING_ZONES.STEADY,
            description: 'Fartlek main set: vary pace by feel, include surges'
          },
          {
            duration: 10,
            intensity: 60,
            zone: TRAINING_ZONES.RECOVERY,
            description: 'Cool-down'
          }
        );
        break;

      default:
        // Default to aerobic emphasis
        const adjustedIntensity = Math.min(targetIntensity, 75); // Cap intensity
        segments.push({
          duration,
          intensity: adjustedIntensity,
          zone: this.getZoneForIntensity(adjustedIntensity),
          description: `${type} workout - aerobic emphasis`
        });
    }

    return segments;
  }

  /**
   * Generate Pfitzinger-specific segments with LT emphasis
   */
  private generatePfitsingerSegments(
    type: WorkoutType,
    phase: TrainingPhase,
    duration: number,
    targetIntensity: number
  ): WorkoutSegment[] {
    const segments: WorkoutSegment[] = [];

    switch (type) {
      case 'threshold':
      case 'tempo':
        // Pfitzinger LT workouts
        if (duration >= 60 && (phase === 'build' || phase === 'peak')) {
          // LT intervals for longer sessions
          const warmup = 15;
          const cooldown = 10;
          const workTime = duration - warmup - cooldown;
          
          segments.push({
            duration: warmup,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Warm-up'
          });

          // 2-3 x 15-20 minute intervals
          const intervalDuration = Math.min(20, workTime / 2.5);
          const recoveryDuration = 3;
          const numIntervals = Math.floor(workTime / (intervalDuration + recoveryDuration));

          for (let i = 0; i < numIntervals; i++) {
            segments.push({
              duration: intervalDuration,
              intensity: 87, // LT pace
              zone: TRAINING_ZONES.THRESHOLD,
              description: `LT interval ${i + 1}`
            });
            
            if (i < numIntervals - 1) {
              segments.push({
                duration: recoveryDuration,
                intensity: 65,
                zone: TRAINING_ZONES.EASY,
                description: 'Recovery jog'
              });
            }
          }

          segments.push({
            duration: cooldown,
            intensity: 60,
            zone: TRAINING_ZONES.RECOVERY,
            description: 'Cool-down'
          });
        } else {
          // Continuous tempo for shorter sessions
          const warmup = Math.min(10, duration * 0.2);
          const cooldown = Math.min(10, duration * 0.2);
          const tempoTime = duration - warmup - cooldown;
          
          segments.push(
            {
              duration: warmup,
              intensity: 68,
              zone: TRAINING_ZONES.EASY,
              description: 'Warm-up'
            },
            {
              duration: tempoTime,
              intensity: 85,
              zone: TRAINING_ZONES.TEMPO,
              description: 'Continuous tempo run'
            },
            {
              duration: cooldown,
              intensity: 60,
              zone: TRAINING_ZONES.RECOVERY,
              description: 'Cool-down'
            }
          );
        }
        break;

      case 'long_run':
        // Pfitzinger medium-long and long runs
        if (phase === 'build' && duration >= 90) {
          // Medium-long with quality
          const easyStart = Math.round(duration * 0.4);
          const qualityMiddle = Math.round(duration * 0.3);
          const easyFinish = duration - easyStart - qualityMiddle;
          
          segments.push(
            {
              duration: easyStart,
              intensity: 70,
              zone: TRAINING_ZONES.EASY,
              description: 'Easy start - settle into rhythm'
            },
            {
              duration: qualityMiddle,
              intensity: 82,
              zone: TRAINING_ZONES.TEMPO,
              description: 'Marathon pace segment'
            },
            {
              duration: easyFinish,
              intensity: 70,
              zone: TRAINING_ZONES.EASY,
              description: 'Easy finish - maintain form'
            }
          );
        } else {
          // Standard long run
          segments.push({
            duration,
            intensity: 70,
            zone: TRAINING_ZONES.EASY,
            description: 'Long run at steady aerobic pace'
          });
        }
        break;

      case 'progression':
        // Pfitzinger progression runs
        const thirds = Math.round(duration / 3);
        
        segments.push(
          {
            duration: thirds,
            intensity: 68,
            zone: TRAINING_ZONES.EASY,
            description: 'Easy start'
          },
          {
            duration: thirds,
            intensity: 75,
            zone: TRAINING_ZONES.STEADY,
            description: 'Steady middle'
          },
          {
            duration: duration - (thirds * 2),
            intensity: 85,
            zone: TRAINING_ZONES.TEMPO,
            description: 'Tempo finish'
          }
        );
        break;

      default:
        segments.push({
          duration,
          intensity: targetIntensity,
          zone: this.getZoneForIntensity(targetIntensity),
          description: `${type} workout`
        });
    }

    return segments;
  }

  /**
   * Generate default segments when no specific methodology pattern applies
   */
  private generateDefaultSegments(
    type: WorkoutType,
    duration: number,
    intensity: number
  ): WorkoutSegment[] {
    // Use existing createCustomWorkout logic
    const workout = createCustomWorkout(type, duration, intensity);
    return workout.segments;
  }

  /**
   * Apply environmental modifications to workout segments
   * Requirement 4.7: Environmental and equipment constraint handling
   */
  private applyEnvironmentalModifications(
    segments: WorkoutSegment[],
    environmentalFactors?: EnvironmentalFactors,
    equipment?: string[]
  ): WorkoutSegment[] {
    if (!environmentalFactors && !equipment) {
      return segments;
    }

    let modifiedSegments = [...segments];

    // Temperature adjustments
    if (environmentalFactors?.typicalTemperature) {
      if (environmentalFactors.typicalTemperature > 25) {
        // Reduce intensity in heat
        modifiedSegments = modifiedSegments.map(seg => {
          const newIntensity = Math.max(seg.intensity - 3, 50);
          const newZone = this.getZoneForIntensity(newIntensity);
          return {
            ...seg,
            intensity: newIntensity,
            zone: newZone,
            description: seg.description + ' (adjusted for heat)'
          };
        });
      } else if (environmentalFactors.typicalTemperature < 0) {
        // Add extra warm-up in cold
        modifiedSegments.unshift({
          duration: 5,
          intensity: 60,
          zone: TRAINING_ZONES.RECOVERY,
          description: 'Extra warm-up for cold conditions'
        });
      }
    }

    // Altitude adjustments
    if (environmentalFactors?.altitude && environmentalFactors.altitude > 1500) {
      const altitudeReduction = Math.min(5, Math.floor(environmentalFactors.altitude / 1000));
      modifiedSegments = modifiedSegments.map(seg => ({
        ...seg,
        intensity: Math.max(seg.intensity - altitudeReduction, 50),
        description: seg.description + ' (altitude adjusted)'
      }));
    }

    // Equipment constraints
    if (equipment && !equipment.includes('track')) {
      // Modify high-intensity segments for non-track surfaces
      modifiedSegments = modifiedSegments.map(seg => {
        if (seg.intensity > 95) {
          return {
            ...seg,
            intensity: Math.min(seg.intensity, 92),
            description: seg.description + ' (modified for road/trail)'
          };
        }
        return seg;
      });
    }

    return modifiedSegments;
  }

  /**
   * Create workout from generated segments
   */
  private createWorkoutFromSegments(type: WorkoutType, segments: WorkoutSegment[]): Workout {
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const avgIntensity = segments.reduce((sum, seg) => sum + seg.intensity * seg.duration, 0) / totalDuration;
    
    return {
      type,
      primaryZone: this.getZoneForIntensity(avgIntensity),
      segments,
      adaptationTarget: this.getAdaptationTarget(type),
      estimatedTSS: this.calculateTSS(segments),
      recoveryTime: this.calculateRecoveryTime(type, totalDuration, avgIntensity)
    };
  }

  /**
   * Calculate methodology compliance score
   */
  private calculateMethodologyCompliance(
    workout: Workout,
    type: WorkoutType,
    phase: TrainingPhase
  ): number {
    let score = 100;

    switch (this.methodology) {
      case 'daniels':
        // Check for proper pacing zones
        if (type === 'tempo' || type === 'threshold') {
          const hasTPace = workout.segments.some(seg => seg.intensity >= 86 && seg.intensity <= 90);
          if (!hasTPace) score -= 20;
        }
        if (type === 'vo2max') {
          const hasIPace = workout.segments.some(seg => seg.intensity >= 93 && seg.intensity <= 97);
          if (!hasIPace) score -= 20;
        }
        break;

      case 'lydiard':
        // Check for aerobic emphasis
        const hardTime = workout.segments
          .filter(seg => seg.intensity > 85)
          .reduce((sum, seg) => sum + seg.duration, 0);
        const totalTime = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
        const hardPercentage = hardTime / totalTime;
        
        if (hardPercentage > 0.2) score -= 30;
        if (phase === 'base' && hardPercentage > 0.1) score -= 20;
        
        // Speed work in base phase is strongly discouraged
        if (phase === 'base' && type === 'speed') {
          score = Math.min(score, 30); // Force very low compliance
        }
        break;

      case 'pfitzinger':
        // Check for LT work presence
        if ((type === 'tempo' || type === 'threshold') && phase !== 'base') {
          const hasLTWork = workout.segments.some(seg => seg.intensity >= 84 && seg.intensity <= 88);
          if (!hasLTWork) score -= 25;
        }
        break;
    }

    return Math.max(score, 0);
  }

  /**
   * Generate alternative workouts if compliance is low
   * Requirement 4.8: Provide methodology-compliant alternatives
   */
  private generateAlternatives(parameters: CustomWorkoutParameters): Workout[] {
    const alternatives: Workout[] = [];
    const { type, phase } = parameters;

    // Generate 2-3 alternatives with different approaches
    const alternativeTypes = this.getAlternativeTypes(type);
    
    for (const altType of alternativeTypes.slice(0, 2)) {
      const altParams = { ...parameters, type: altType };
      const result = this.generateWorkout(altParams);
      if (result.methodologyCompliance >= 80) {
        alternatives.push(result.workout);
      }
    }

    return alternatives;
  }

  /**
   * Get alternative workout types for substitution
   */
  private getAlternativeTypes(type: WorkoutType): WorkoutType[] {
    const alternatives: Record<WorkoutType, WorkoutType[]> = {
      tempo: ['threshold', 'steady', 'progression'],
      threshold: ['tempo', 'progression', 'steady'],
      vo2max: ['fartlek', 'hill_repeats', 'race_pace'],
      speed: ['fartlek', 'hill_repeats', 'vo2max'],
      long_run: ['steady', 'easy', 'progression'],
      easy: ['recovery', 'steady', 'long_run'],
      recovery: ['easy', 'cross_training'],
      hill_repeats: ['fartlek', 'vo2max', 'tempo'],
      fartlek: ['tempo', 'hill_repeats', 'progression'],
      progression: ['tempo', 'steady', 'threshold'],
      steady: ['easy', 'tempo', 'progression'],
      race_pace: ['tempo', 'threshold', 'time_trial'],
      time_trial: ['race_pace', 'threshold', 'vo2max'],
      cross_training: ['easy', 'recovery'],
      strength: ['hill_repeats', 'cross_training']
    };

    return alternatives[type] || ['easy', 'steady'];
  }

  /**
   * Build rationale for workout generation
   */
  private buildRationale(
    type: WorkoutType,
    phase: TrainingPhase,
    constraints: WorkoutConstraints,
    environmentalFactors?: EnvironmentalFactors
  ): string {
    let rationale = `Generated custom ${type} workout for ${this.methodology} methodology in ${phase} phase.`;

    if (constraints.availableTime) {
      rationale += ` Adjusted for ${constraints.availableTime} minute time constraint.`;
    }

    if (environmentalFactors?.altitude && environmentalFactors.altitude > 1500) {
      rationale += ` Modified for altitude (${environmentalFactors.altitude}m).`;
    }

    if (environmentalFactors?.typicalTemperature) {
      if (environmentalFactors.typicalTemperature > 25) {
        rationale += ' Intensity reduced for heat.';
      } else if (environmentalFactors.typicalTemperature < 0) {
        rationale += ' Extra warm-up added for cold.';
      }
    }

    return rationale;
  }

  /**
   * Collect constraint warnings
   */
  private collectConstraintWarnings(
    parameters: CustomWorkoutParameters,
    workout: Workout
  ): string[] {
    const warnings: string[] = [];

    if (parameters.constraints?.maxDuration) {
      const totalDuration = workout.segments.reduce((sum, seg) => sum + seg.duration, 0);
      if (totalDuration > parameters.constraints.maxDuration) {
        warnings.push(`Workout duration (${totalDuration}min) exceeds maximum constraint (${parameters.constraints.maxDuration}min)`);
      }
    }

    if (parameters.environmentalFactors?.altitude && parameters.environmentalFactors.altitude > 2500) {
      warnings.push('High altitude may significantly impact performance');
    }

    if (parameters.preferences?.preferredIntensity === 'low') {
      const hasHighIntensity = workout.segments.some(seg => seg.intensity > 80);
      if (hasHighIntensity && parameters.type === 'tempo') {
        warnings.push('Workout contains high intensity segments despite low intensity preference');
      }
    }

    return warnings;
  }

  /**
   * Apply duration constraints
   */
  private applyDurationConstraints(
    targetDuration: number,
    constraints: WorkoutConstraints
  ): number {
    let duration = targetDuration;

    if (constraints.maxDuration && duration > constraints.maxDuration) {
      duration = constraints.maxDuration;
    }

    if (constraints.minDuration && duration < constraints.minDuration) {
      duration = constraints.minDuration;
    }

    if (constraints.availableTime && duration > constraints.availableTime) {
      duration = constraints.availableTime;
    }

    return duration;
  }

  /**
   * Apply intensity constraints
   */
  private applyIntensityConstraints(
    targetIntensity: number,
    constraints: WorkoutConstraints,
    environmentalFactors?: EnvironmentalFactors
  ): number {
    let intensity = targetIntensity;

    if (constraints.maxIntensity && intensity > constraints.maxIntensity) {
      intensity = constraints.maxIntensity;
    }

    if (constraints.minIntensity && intensity < constraints.minIntensity) {
      intensity = constraints.minIntensity;
    }

    // Environmental adjustments
    if (environmentalFactors?.altitude && environmentalFactors.altitude > 1500) {
      intensity = Math.max(intensity - 5, 50);
    }

    if (environmentalFactors?.typicalTemperature && environmentalFactors.typicalTemperature > 30) {
      intensity = Math.max(intensity - 3, 50);
    }

    return intensity;
  }

  /**
   * Get default duration for workout type and phase
   */
  private getDefaultDuration(type: WorkoutType, phase: TrainingPhase): number {
    const baseDurations: Record<WorkoutType, number> = {
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

    let duration = baseDurations[type] || 60;

    // Adjust for phase
    if (phase === 'base') {
      duration *= 0.8;
    } else if (phase === 'peak') {
      duration *= 1.1;
    }

    return Math.round(duration);
  }

  /**
   * Get default intensity for workout type and phase
   */
  private getDefaultIntensity(type: WorkoutType, phase: TrainingPhase): number {
    const methodologyIntensities: Record<TrainingMethodology, Record<WorkoutType, number>> = {
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

    return methodologyIntensities[this.methodology]?.[type] || 70;
  }

  /**
   * Get zone for intensity level
   */
  private getZoneForIntensity(intensity: number): typeof TRAINING_ZONES[keyof typeof TRAINING_ZONES] {
    if (intensity < 60) return TRAINING_ZONES.RECOVERY;
    if (intensity < 70) return TRAINING_ZONES.EASY;
    if (intensity < 80) return TRAINING_ZONES.STEADY;
    if (intensity < 90) return TRAINING_ZONES.TEMPO;
    if (intensity < 93) return TRAINING_ZONES.THRESHOLD;
    if (intensity < 97) return TRAINING_ZONES.VO2_MAX;
    return TRAINING_ZONES.NEUROMUSCULAR;
  }

  /**
   * Get pace name for intensity
   */
  private getPaceName(intensity: number): string {
    if (this.methodology === 'daniels') {
      if (intensity >= 95) return 'I';
      if (intensity >= 86) return 'T';
      if (intensity >= 75) return 'M';
      if (intensity >= 60) return 'E';
      return 'Recovery';
    }
    
    const zone = this.getZoneForIntensity(intensity);
    return zone.name.toLowerCase().replace('_', ' ');
  }

  /**
   * Get adaptation target for workout type
   */
  private getAdaptationTarget(type: WorkoutType): string {
    const targets: Record<WorkoutType, string> = {
      recovery: 'Active recovery and regeneration',
      easy: 'Aerobic base development',
      steady: 'Aerobic capacity improvement',
      tempo: 'Lactate threshold development',
      threshold: 'Lactate clearance improvement',
      vo2max: 'Maximum oxygen uptake',
      speed: 'Neuromuscular power',
      hill_repeats: 'Strength and power development',
      fartlek: 'Speed variation and lactate tolerance',
      progression: 'Fatigue resistance',
      long_run: 'Endurance and glycogen utilization',
      race_pace: 'Race-specific adaptations',
      time_trial: 'Competitive readiness',
      cross_training: 'Active recovery and variety',
      strength: 'Muscular strength'
    };

    return targets[type] || 'General fitness improvement';
  }

  /**
   * Calculate TSS for workout segments
   */
  private calculateTSS(segments: WorkoutSegment[]): number {
    return segments.reduce((total, seg) => {
      const intensityFactor = seg.intensity / 100;
      const segmentTSS = (seg.duration * Math.pow(intensityFactor, 2) * 100) / 60;
      return total + segmentTSS;
    }, 0);
  }

  /**
   * Calculate recovery time needed
   */
  private calculateRecoveryTime(
    type: WorkoutType,
    duration: number,
    avgIntensity: number
  ): number {
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

    const base = baseRecovery[type] || 24;
    const intensityMultiplier = Math.max(1, avgIntensity / 80);
    const durationMultiplier = Math.max(0.5, duration / 60);

    // Ensure minimum recovery times are met
    const calculatedRecovery = Math.round(base * intensityMultiplier * durationMultiplier);
    return Math.max(base, calculatedRecovery);
  }
}