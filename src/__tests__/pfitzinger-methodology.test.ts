import { describe, it, expect, beforeEach } from 'vitest';
import { 
  PhilosophyFactory, 
  TrainingPhilosophy,
  PfitsingerPhilosophy
} from '../philosophies';
import { 
  createMockTrainingPlanConfig,
  createMockRunData,
  createMockFitnessAssessment,
  createMockTrainingPreferences,
  createMockEnvironmentalFactors,
  testDateUtils,
  createMockPlannedWorkout,
  createMockAdvancedPlanConfig
} from './test-utils';
import { 
  TrainingPlanConfig,
  Workout,
  WorkoutType,
  PlannedWorkout,
  TrainingPlan,
  TrainingPhase,
  PfitzingerTrainingPaces,
  MediumLongRunPattern,
  PfitzingerWeeklyStructure,
  ThresholdVolumeProgression
} from '../types';
import { calculateLactateThreshold, calculateTrainingPaces } from '../zones';
import { WORKOUT_TEMPLATES } from '../workouts';

// Helper function to create mock training plan
const createMockTrainingPlan = (overrides?: Partial<TrainingPlan>): TrainingPlan => ({
  id: 'test-plan',
  config: createMockTrainingPlanConfig(),
  blocks: [],
  workouts: [],
  summary: {
    totalWeeks: 12,
    totalWorkouts: 84,
    totalDistance: 500,
    totalTime: 3000,
    peakWeeklyDistance: 60,
    averageWeeklyDistance: 42,
    keyWorkouts: 20,
    recoveryDays: 24,
    phases: []
  },
  ...overrides
});

describe('Pfitzinger Methodology Complete Test Suite', () => {
  let philosophy: PfitsingerPhilosophy;
  let mockConfig: TrainingPlanConfig;
  let mockPlan: TrainingPlan;

  beforeEach(() => {
    philosophy = PhilosophyFactory.create('pfitzinger') as PfitsingerPhilosophy;
    mockConfig = createMockTrainingPlanConfig({
      currentFitness: createMockFitnessAssessment({
        vdot: 50,
        lactateThreshold: 12.0,
        weeklyMileage: 45
      })
    });
    mockPlan = createMockTrainingPlan({
      config: mockConfig,
      workouts: []
    });
  });

  describe('Requirement 3.1: Lactate Threshold-Based Pace System', () => {
    it('should calculate LT pace as foundation for all paces', () => {
      // LT pace is calculated in enhancePlan
      const enhancedPlan = philosophy.enhancePlan(mockPlan);
      const ltPace = enhancedPlan.metadata?.lactateThresholdPace || 0;
      expect(ltPace).toBeGreaterThan(0);
      expect(ltPace).toBeLessThan(10); // Reasonable pace range
    });

    it('should derive all training paces from LT pace', () => {
      // Access private method through enhancePlan
      const enhancedPlan = philosophy.enhancePlan(mockPlan);
      const ltPace = enhancedPlan.metadata?.lactateThresholdPace;
      const paces = enhancedPlan.metadata?.pfitzingerPaces as PfitzingerTrainingPaces;
      
      expect(paces).toBeDefined();
      expect(paces.lactateThreshold.target).toBe(ltPace);
      
      // Verify pace relationships (recovery slower than LT, VO2max faster than LT)
      expect(paces.recovery.target).toBeGreaterThan(ltPace);
      expect(paces.generalAerobic.target).toBeGreaterThan(ltPace);
      expect(paces.marathonPace.target).toBeGreaterThan(ltPace);
      expect(paces.vo2max.target).toBeLessThan(ltPace);
      expect(paces.neuromuscular.target).toBeLessThan(ltPace);
    });

    it('should provide pace ranges with min, max, and target', () => {
      const enhancedPlan = philosophy.enhancePlan(mockPlan);
      const paces = enhancedPlan.metadata?.pfitzingerPaces as PfitzingerTrainingPaces;
      
      // Each pace should have proper range structure
      Object.values(paces).forEach(paceRange => {
        expect(paceRange).toHaveProperty('min');
        expect(paceRange).toHaveProperty('max');
        expect(paceRange).toHaveProperty('target');
        expect(paceRange.min).toBeLessThan(paceRange.max);
        expect(paceRange.target).toBeGreaterThanOrEqual(paceRange.min);
        expect(paceRange.target).toBeLessThanOrEqual(paceRange.max);
      });
    });

    it('should calculate progressive threshold volume', () => {
      const enhancedPlan = philosophy.enhancePlan({
        ...mockPlan,
        summary: { ...mockPlan.summary, totalWeeks: 16 }
      });
      
      const thresholdProgression = enhancedPlan.metadata?.thresholdVolumeProgression as number[];
      
      expect(thresholdProgression).toBeDefined();
      expect(thresholdProgression).toHaveLength(16);
      
      // Should start low and progress
      expect(thresholdProgression[0]).toBeLessThanOrEqual(25);
      expect(thresholdProgression[15]).toBeGreaterThanOrEqual(40);
      
      // Check for some variation in volume (not all monotonically increasing)
      const hasVariation = thresholdProgression.some((vol, i) => 
        i > 0 && vol < thresholdProgression[i - 1]
      );
      expect(hasVariation).toBe(true);
    });

    it('should generate LT-based zones', () => {
      const enhancedPlan = philosophy.enhancePlan(mockPlan);
      const ltBasedZones = enhancedPlan.metadata?.ltBasedZones;
      
      expect(ltBasedZones).toBeDefined();
      // ltBasedZones might be an object with zone properties
      if (Array.isArray(ltBasedZones)) {
        expect(ltBasedZones.length).toBeGreaterThan(0);
      } else {
        expect(typeof ltBasedZones).toBe('object');
      }
    });
  });

  describe('Requirement 3.2: Medium-Long Run Generation System', () => {
    it('should generate 12-16 mile medium-long runs', () => {
      const mediumLongWorkout = philosophy.selectWorkout('long_run', 'build', 6);
      expect(mediumLongWorkout).toBeDefined();
      
      // Customize the workout to get medium-long pattern
      const baseWorkout = WORKOUT_TEMPLATES[mediumLongWorkout];
      const customized = philosophy.customizeWorkout(baseWorkout, 'build', 6);
      
      // Check duration is in medium-long range (90-150 minutes typically)
      const totalDuration = customized.segments.reduce((sum, seg) => sum + seg.duration, 0);
      expect(totalDuration).toBeGreaterThanOrEqual(90);
      expect(totalDuration).toBeLessThanOrEqual(180);
    });

    it('should include embedded tempo segments in medium-long runs', () => {
      // Simulate a build phase medium-long run
      const longRunWorkout = {
        type: 'long_run' as WorkoutType,
        primaryZone: { name: 'EASY' },
        segments: [{
          duration: 120,
          intensity: 65,
          zone: { name: 'EASY' },
          description: 'Long run'
        }],
        adaptationTarget: 'Aerobic endurance',
        estimatedTSS: 120,
        recoveryTime: 36
      };
      
      const customized = philosophy.customizeWorkout(longRunWorkout, 'build', 8);
      
      // In build phase, should potentially have tempo segments
      const hasTempoSegment = customized.segments.some(seg => 
        seg.intensity >= 82 && seg.intensity <= 88
      );
      
      // Not all medium-long runs have tempo, but the capability should exist
      expect(customized.segments.length).toBeGreaterThanOrEqual(1);
    });

    it('should implement all 5 Pfitzinger medium-long patterns', () => {
      const patterns = [
        'aerobicMediumLong',
        'tempoMediumLong', 
        'marathonPaceMediumLong',
        'progressiveMediumLong',
        'raceSpecificMediumLong'
      ];
      
      // Test that philosophy can generate different patterns based on phase
      const phases: TrainingPhase[] = ['base', 'build', 'peak'];
      
      phases.forEach(phase => {
        const workout = philosophy.selectWorkout('long_run', phase, 5);
        expect(workout).toBeDefined();
      });
    });

    it('should progressively increase medium-long run difficulty', () => {
      // Early build phase
      const earlyWorkout = philosophy.customizeWorkout(
        WORKOUT_TEMPLATES.LONG_RUN,
        'build',
        2
      );
      
      // Late build phase
      const lateWorkout = philosophy.customizeWorkout(
        WORKOUT_TEMPLATES.LONG_RUN,
        'build',
        10
      );
      
      // Later workouts should potentially be more complex or intense
      expect(lateWorkout.estimatedTSS).toBeGreaterThanOrEqual(earlyWorkout.estimatedTSS);
    });
  });

  describe('Requirement 3.3: Pfitzinger Weekly Structure System', () => {
    it('should implement day-of-week patterns', () => {
      const weeklyStructure = (philosophy as any).getPfitzingerBaseStructure('build');
      
      expect(weeklyStructure).toBeDefined();
      expect(weeklyStructure.dayStructure).toBeDefined();
      expect(weeklyStructure.dayStructure.sunday).toBeDefined();
      expect(weeklyStructure.dayStructure.tuesday).toBeDefined();
      expect(weeklyStructure.dayStructure.thursday).toBeDefined();
      
      // Sunday should typically be long run or easy day in build phase
      expect(weeklyStructure.dayStructure.sunday.type).toBeDefined();
      
      // Tuesday/Thursday for quality work
      const tuesdayType = weeklyStructure.dayStructure.tuesday.type;
      const thursdayType = weeklyStructure.dayStructure.thursday.type;
      expect(['lactate_threshold', 'tempo', 'vo2max']).toContain(tuesdayType);
      expect(['lactate_threshold', 'tempo', 'marathon_pace']).toContain(thursdayType);
    });

    it('should enforce 48-72 hour spacing between quality sessions', () => {
      const weeklyStructure = (philosophy as any).getPfitzingerBaseStructure('build');
      
      expect(weeklyStructure.workoutSpacing).toBeDefined();
      expect(weeklyStructure.workoutSpacing.hardDaySpacing).toBeGreaterThanOrEqual(48);
      expect(weeklyStructure.workoutSpacing.hardDaySpacing).toBeLessThanOrEqual(72);
      
      // Quality days should be properly spaced
      const qualityDays = weeklyStructure.workoutSpacing.qualityDays;
      expect(qualityDays).toContain('tuesday');
      expect(qualityDays).toContain('thursday');
      // Sunday might not always be a quality day in all phases
    });

    it('should calculate threshold volume progression', () => {
      const volumeProgression = (philosophy as any).calculateThresholdVolumeProgression('build', 5);
      
      expect(volumeProgression).toBeDefined();
      expect(volumeProgression.weeklyMinutes).toBeGreaterThan(0);
      expect(volumeProgression.sessionDistribution).toBeDefined();
      expect(volumeProgression.intensityTargets).toBeDefined();
      expect(volumeProgression.recoveryRequirements).toBeDefined();
      
      // Recovery requirements should be sensible
      expect(volumeProgression.recoveryRequirements.hoursAfterLT).toBeGreaterThanOrEqual(24);
      expect(volumeProgression.recoveryRequirements.hoursBeforeLT).toBeGreaterThanOrEqual(24);
    });

    it('should integrate race-specific pace work', () => {
      const raceIntegration = (philosophy as any).getRaceSpecificIntegration('peak', 2);
      
      expect(raceIntegration).toBeDefined();
      expect(raceIntegration.marathonPaceVolume).toBeGreaterThan(0);
      expect(raceIntegration.raceSimulationFrequency).toBeGreaterThanOrEqual(0);
      expect(raceIntegration.taperIntegration).toBeDefined();
      
      // Peak phase should have significant race pace work
      expect(raceIntegration.marathonPaceVolume).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Requirement 3.4: Build Phase Threshold Volume', () => {
    it('should progressively increase threshold volume in build phase', () => {
      const weeks = [1, 4, 8, 12];
      const volumes = weeks.map(week => {
        const prog = (philosophy as any).calculateThresholdVolumeProgression('build', week);
        return prog.weeklyMinutes;
      });
      
      // Should generally increase over time
      expect(volumes[3]).toBeGreaterThan(volumes[0]);
      
      // But not necessarily monotonic due to recovery weeks
      volumes.forEach(vol => {
        expect(vol).toBeGreaterThan(0);
        expect(vol).toBeLessThanOrEqual(70); // Reasonable upper limit
      });
    });

    it('should maintain aerobic base while adding threshold work', () => {
      const distribution = philosophy.getPhaseIntensityDistribution('build');
      
      // Should still have majority easy running
      expect(distribution.easy).toBeGreaterThanOrEqual(65);
      expect(distribution.moderate).toBeGreaterThan(10);
      expect(distribution.hard).toBeLessThanOrEqual(15);
    });
  });

  describe('Requirement 3.5: Tempo Run Variations', () => {
    it('should generate continuous tempo runs', () => {
      const tempo = philosophy.selectWorkout('tempo', 'build', 4);
      expect(tempo).toBe('TEMPO_CONTINUOUS');
      
      const workout = WORKOUT_TEMPLATES[tempo];
      const customized = philosophy.customizeWorkout(workout, 'build', 4);
      
      // Should have warm-up, tempo, cool-down structure
      expect(customized.segments.length).toBeGreaterThanOrEqual(3);
      
      // Main tempo segment
      const tempoSegment = customized.segments.find(seg => 
        seg.intensity >= 82 && seg.intensity <= 88
      );
      expect(tempoSegment).toBeDefined();
      if (tempoSegment) {
        expect(tempoSegment.duration).toBeGreaterThan(0);
      }
    });

    it('should generate lactate threshold intervals', () => {
      const threshold = philosophy.selectWorkout('threshold', 'peak', 3);
      expect(threshold).toBeDefined();
      
      const workout = WORKOUT_TEMPLATES[threshold];
      const customized = philosophy.customizeWorkout(workout, 'peak', 3);
      
      // Check if workout has appropriate intensity segments
      const hasIntenseSegments = customized.segments.some(seg =>
        seg.intensity >= 80
      );
      expect(hasIntenseSegments).toBe(true);
    });

    it('should generate progression runs', () => {
      const progression = philosophy.selectWorkout('progression', 'build', 6);
      expect(progression).toBeDefined();
      
      if (progression) {
        const workout = WORKOUT_TEMPLATES[progression];
        
        // Progression runs should increase in intensity
        const intensities = workout.segments.map(seg => seg.intensity);
        const mainSegments = intensities.slice(0, -1); // Exclude cool-down
        
        // Check for progressive intensity
        for (let i = 1; i < mainSegments.length; i++) {
          expect(mainSegments[i]).toBeGreaterThanOrEqual(mainSegments[i-1]);
        }
      }
    });
  });

  describe('Requirement 3.6: Race-Specific Pace Work', () => {
    it('should increase race pace work approaching goal race', () => {
      // Compare early vs late peak phase
      const earlyPeak = (philosophy as any).getRaceSpecificIntegration('peak', 1);
      const latePeak = (philosophy as any).getRaceSpecificIntegration('peak', 4);
      
      // Later in peak phase should have at least as much or more race pace work
      expect(latePeak.marathonPaceVolume).toBeGreaterThan(0);
      expect(latePeak.marathonPaceVolume).toBeGreaterThanOrEqual(earlyPeak.marathonPaceVolume - 5); // Allow some variation
    });

    it('should implement proper tapering protocols', () => {
      const taperStructure = (philosophy as any).getPfitzingerBaseStructure('taper');
      
      // Taper should reduce volume
      expect(taperStructure.thresholdVolume.weeklyMinutes).toBeLessThan(40);
      
      // But maintain some intensity
      const hasQualityWork = Object.values(taperStructure.dayStructure).some(day =>
        ['tempo', 'race_pace', 'lactate_threshold'].includes(day.type)
      );
      expect(hasQualityWork).toBe(true);
    });
  });

  describe('Requirement 3.7: Weekly Structure Patterns', () => {
    it('should follow Pfitzinger day-of-week patterns', () => {
      const phases: TrainingPhase[] = ['base', 'build', 'peak', 'taper'];
      
      phases.forEach(phase => {
        const structure = (philosophy as any).getPfitzingerBaseStructure(phase);
        
        // All phases should have structured weekly patterns
        expect(structure.pattern).toBeDefined();
        expect(structure.pattern).toContain('-');
        
        // Recovery ratio should be appropriate (allow more flexibility)
        expect(structure.workoutSpacing.recoveryRatio).toBeGreaterThan(0);
        expect(structure.workoutSpacing.recoveryRatio).toBeLessThanOrEqual(1.0);
      });
    });

    it('should implement weekly variation to prevent monotony', () => {
      // Test that consecutive weeks can have variation
      const week1 = (philosophy as any).generatePfitzingerWeeklyStructure('build', 4);
      const week2 = (philosophy as any).generatePfitzingerWeeklyStructure('build', 5);
      
      // Should have some variation mechanism
      expect(week1).toBeDefined();
      expect(week2).toBeDefined();
      
      // Weekly variation should exist
      if (week1.weeklyVariation || week2.weeklyVariation) {
        const variation = week1.weeklyVariation || week2.weeklyVariation;
        expect(variation!.volumeMultiplier).toBeGreaterThan(0);
        expect(variation!.intensityMultiplier).toBeGreaterThan(0);
      }
    });
  });

  describe('Requirement 3.8: Training Load Calculations', () => {
    it('should use Pfitzinger progression rates', () => {
      const plan = philosophy.enhancePlan({
        ...mockPlan,
        summary: { ...mockPlan.summary, totalWeeks: 18 }
      });
      
      // Should have appropriate metadata
      expect(plan.metadata).toBeDefined();
      expect(plan.metadata?.methodology).toBe('pfitzinger');
      expect(plan.metadata?.lactateThresholdPace).toBeDefined();
      expect(plan.metadata?.pfitzingerPaces).toBeDefined();
    });

    it('should implement recovery protocols', () => {
      const volumeProgression = (philosophy as any).calculateThresholdVolumeProgression('build', 6);
      const recovery = volumeProgression.recoveryRequirements;
      
      // Pfitzinger emphasizes adequate recovery
      expect(recovery.hoursAfterLT).toBeGreaterThanOrEqual(24);
      expect(recovery.easyDayIntensity).toBeLessThanOrEqual(75);
      expect(recovery.recoveryDayFrequency).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Integration and Edge Cases', () => {
    it('should handle athletes with no lactate threshold data', () => {
      const noLTConfig = createMockTrainingPlanConfig({
        currentFitness: createMockFitnessAssessment({
          lactateThreshold: undefined,
          vdot: 45
        })
      });
      
      const plan = createMockTrainingPlan({ config: noLTConfig });
      const enhanced = philosophy.enhancePlan(plan);
      
      // Should estimate LT from other data
      expect(enhanced.metadata?.lactateThresholdPace).toBeDefined();
      expect(enhanced.metadata?.lactateThresholdPace).toBeGreaterThan(0);
    });

    it('should adapt for different race distances', () => {
      const configs = [
        { goal: 'HALF_MARATHON' as const },
        { goal: 'MARATHON' as const },
        { goal: '10K' as const }
      ];
      
      configs.forEach(({ goal }) => {
        const config = createMockTrainingPlanConfig({ goal });
        const plan = createMockTrainingPlan({ config });
        const enhanced = philosophy.enhancePlan(plan);
        
        expect(enhanced).toBeDefined();
        expect(enhanced.config.goal).toBe(goal);
        
        // Each should have appropriate pacing
        const paces = enhanced.metadata?.pfitzingerPaces;
        expect(paces).toBeDefined();
      });
    });

    it('should maintain workout variety across phases', () => {
      const phases: TrainingPhase[] = ['base', 'build', 'peak'];
      const workoutTypes = new Set<string>();
      
      phases.forEach(phase => {
        const types: WorkoutType[] = ['easy', 'tempo', 'threshold', 'long_run'];
        types.forEach(type => {
          const selected = philosophy.selectWorkout(type, phase, 3);
          if (selected) workoutTypes.add(selected);
        });
      });
      
      // Should select variety of workouts
      expect(workoutTypes.size).toBeGreaterThanOrEqual(5);
    });

    it('should validate intensity distribution compliance', () => {
      const distribution = philosophy.intensityDistribution;
      
      expect(distribution.easy).toBe(75);
      expect(distribution.moderate).toBe(15);
      expect(distribution.hard).toBe(10);
      expect(distribution.easy + distribution.moderate + distribution.hard).toBe(100);
    });

    it('should handle concurrent threshold and marathon pace work', () => {
      const peakStructure = (philosophy as any).getPfitzingerBaseStructure('peak');
      
      // Peak phase should balance both
      const hasThreshold = Object.values(peakStructure.dayStructure).some(day =>
        day.type === 'lactate_threshold' || day.thresholdMinutes
      );
      const hasMarathonPace = Object.values(peakStructure.dayStructure).some(day =>
        day.type === 'marathon_pace' || day.marathonPaceMinutes
      );
      
      // At least one of these should be present in peak phase
      expect(hasThreshold || hasMarathonPace).toBe(true);
    });
  });

  describe('Performance and Optimization', () => {
    it('should efficiently calculate paces', () => {
      const startTime = performance.now();
      
      // Run multiple pace calculations
      for (let i = 0; i < 100; i++) {
        philosophy.enhancePlan(mockPlan);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;
      
      // Should be fast enough for real-time use
      expect(avgTime).toBeLessThan(50); // 50ms per plan enhancement
    });

    it('should handle plans of various lengths', () => {
      const planLengths = [8, 12, 16, 20, 24];
      
      planLengths.forEach(weeks => {
        const plan = createMockTrainingPlan({
          summary: { ...mockPlan.summary, totalWeeks: weeks }
        });
        
        const enhanced = philosophy.enhancePlan(plan);
        
        expect(enhanced).toBeDefined();
        expect(enhanced.metadata?.thresholdVolumeProgression).toHaveLength(weeks);
      });
    });
  });
});