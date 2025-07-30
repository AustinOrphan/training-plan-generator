import { describe, it, expect, beforeEach } from 'vitest';
import { 
  PhilosophyFactory, 
  TrainingPhilosophy 
} from '../philosophies';
import { 
  createMockTrainingPlanConfig,
  createMockRunData,
  generateMockRunHistory,
  validateIntensityDistribution
} from './test-utils';

describe('PhilosophyFactory', () => {
  it('should create Daniels philosophy', () => {
    const philosophy = PhilosophyFactory.create('daniels');
    expect(philosophy).toBeDefined();
    expect(philosophy.name).toBe('Jack Daniels');
    expect(philosophy.methodology).toBe('daniels');
  });

  it('should create Lydiard philosophy', () => {
    const philosophy = PhilosophyFactory.create('lydiard');
    expect(philosophy).toBeDefined();
    expect(philosophy.name).toBe('Arthur Lydiard');
    expect(philosophy.methodology).toBe('lydiard');
  });

  it('should create Pfitzinger philosophy', () => {
    const philosophy = PhilosophyFactory.create('pfitzinger');
    expect(philosophy).toBeDefined();
    expect(philosophy.name).toBe('Pete Pfitzinger');
    expect(philosophy.methodology).toBe('pfitzinger');
  });

  it('should throw error for unknown philosophy', () => {
    // Test error handling for invalid methodology string
    const invalidMethodology = 'unknown' as TrainingMethodology;
    expect(() => PhilosophyFactory.create(invalidMethodology)).toThrow('Unknown training methodology: unknown');
  });
});

describe('DanielsPhilosophy', () => {
  let philosophy: TrainingPhilosophy;
  let mockConfig: any;

  beforeEach(() => {
    philosophy = PhilosophyFactory.create('daniels');
    mockConfig = createMockTrainingPlanConfig();
  });

  it('should have correct philosophy properties', () => {
    expect(philosophy.name).toBe('Jack Daniels');
    expect(philosophy.methodology).toBe('daniels');
    expect(philosophy.intensityDistribution).toEqual({
      easy: 80,
      moderate: 5,
      hard: 15
    });
  });

  it('should customize workout with VDOT-based paces', () => {
    const baseWorkout = {
      type: 'tempo' as const,
      primaryZone: { name: 'TEMPO' },
      segments: [{
        duration: 20,
        intensity: 88,
        zone: { name: 'TEMPO' },
        description: 'Tempo run'
      }],
      adaptationTarget: 'Lactate threshold',
      estimatedTSS: 45,
      recoveryTime: 24
    };

    // customizeWorkout takes phase and weekNumber, not config
    const customized = philosophy.customizeWorkout(baseWorkout, 'build', 4);
    
    expect(customized.segments).toBeDefined();
    expect(customized.segments[0].intensity).toBeGreaterThan(0);
    expect(customized.adaptationTarget).toBeDefined();
  });

  it('should select appropriate workout templates', () => {
    // Test workout selection for different phases
    const tempoWorkout = philosophy.selectWorkout('tempo', 'build', 3);
    expect(tempoWorkout).toBeDefined();
    expect(tempoWorkout).toContain('TEMPO');
    
    const thresholdWorkout = philosophy.selectWorkout('threshold', 'peak', 2);
    expect(thresholdWorkout).toBeDefined();
    
    const easyWorkout = philosophy.selectWorkout('easy', 'base', 1);
    expect(easyWorkout).toBe('EASY_AEROBIC');
  });

  it('should get phase-specific intensity distribution', () => {
    const baseDistribution = philosophy.getPhaseIntensityDistribution('base');
    expect(baseDistribution).toBeDefined();
    expect(baseDistribution.easy).toBeGreaterThan(0);
    expect(baseDistribution.moderate).toBeGreaterThan(0);
    expect(baseDistribution.hard).toBeGreaterThan(0);
    expect(baseDistribution.easy + baseDistribution.moderate + baseDistribution.hard).toBe(100);
  });

  it('should enhance plan with philosophy customizations', () => {
    const mockPlan = {
      id: 'test-plan',
      config: mockConfig,
      blocks: [],
      workouts: Array(20).fill(null).map((_, i) => ({
        id: `workout-${i}`,
        type: i % 5 === 0 ? 'threshold' : 'easy',
        targetMetrics: { tss: 50 },
        segments: [{
          distance: 5,
          duration: 30,
          zone: { name: i % 5 === 0 ? 'TEMPO' : 'EASY' },
          intensity: i % 5 === 0 ? 80 : 70
        }]
      })),
      summary: {
        phases: []
      }
    };

    // Assert mockPlan as TrainingPlan for test purposes
    const testPlan = mockPlan as unknown as TrainingPlan;
    const enhanced = philosophy.enhancePlan(testPlan);
    expect(enhanced).toBeDefined();
    expect(enhanced.workouts).toHaveLength(20);
  });
});

describe('LydiardPhilosophy', () => {
  let philosophy: TrainingPhilosophy;
  let mockConfig: any;

  beforeEach(() => {
    philosophy = PhilosophyFactory.create('lydiard');
    mockConfig = createMockTrainingPlanConfig();
  });

  it('should emphasize aerobic base building', () => {
    expect(philosophy.intensityDistribution).toEqual({
      easy: 85,
      moderate: 10,
      hard: 5
    });
    expect(philosophy.name).toBe('Arthur Lydiard');
    expect(philosophy.methodology).toBe('lydiard');
  });

  it('should customize workout with hill emphasis', () => {
    const hillWorkout = {
      type: 'hill_repeats' as const,
      primaryZone: { name: 'VO2_MAX' },
      segments: [{
        duration: 5,
        intensity: 95,
        zone: { name: 'VO2_MAX' },
        description: 'Hill repeat'
      }],
      adaptationTarget: 'Power and strength',
      estimatedTSS: 60,
      recoveryTime: 48
    };

    const customized = philosophy.customizeWorkout(hillWorkout, 'build', 3);
    
    expect(customized.segments[0].description).toBeDefined();
    expect(customized.estimatedTSS).toBeGreaterThan(0);
    expect(customized.adaptationTarget).toBeDefined();
  });

  it('should select appropriate Lydiard-specific workouts', () => {
    // Test workout selection emphasizing aerobic base
    const easyWorkout = philosophy.selectWorkout('easy', 'base', 1);
    expect(easyWorkout).toBe('EASY_AEROBIC');
    
    const hillWorkout = philosophy.selectWorkout('hill_repeats', 'base', 2);
    expect(hillWorkout).toBe('LYDIARD_HILL_BASE');
    
    // In base phase, threshold should convert to tempo
    const thresholdInBase = philosophy.selectWorkout('threshold', 'base', 3);
    expect(thresholdInBase).toBe('TEMPO_CONTINUOUS');
  });

  it('should get Lydiard phase distribution', () => {
    const basePhase = philosophy.getPhaseIntensityDistribution('base');
    expect(basePhase.easy).toBeGreaterThanOrEqual(90); // Very high aerobic emphasis
    
    const peakPhase = philosophy.getPhaseIntensityDistribution('peak');
    expect(peakPhase.hard).toBeLessThanOrEqual(10); // Still conservative on intensity
  });

  it('should implement effort-based training conversion', () => {
    // Create a mock plan with segments
    const mockPlan = {
      id: 'test-plan',
      config: mockConfig,
      blocks: [],
      summary: {} as any,
      workouts: [{
        id: 'test-workout',
        date: new Date(),
        type: 'easy' as const,
        name: 'Easy Run',
        description: 'Test workout',
        workout: {
          type: 'easy' as const,
          primaryZone: { name: 'EASY' },
          segments: [{
            duration: 30,
            intensity: 70,
            zone: { name: 'EASY' },
            description: 'Easy pace segment'
          }],
          adaptationTarget: 'Aerobic base',
          estimatedTSS: 50,
          recoveryTime: 24
        },
        targetMetrics: {
          duration: 30,
          tss: 50,
          load: 50,
          intensity: 70
        }
      }]
    };

    // Apply effort-based zones
    (philosophy as any).applyEffortBasedZones(mockPlan);

    // Verify effort-based properties are set
    const segment = mockPlan.workouts[0].workout.segments[0];
    expect(segment.paceTarget?.effortBased).toBe(true);
    expect(segment.paceTarget?.perceivedEffort).toBeGreaterThan(0);
    expect(segment.paceTarget?.perceivedEffort).toBeLessThanOrEqual(10);
    expect(segment.description).toContain('Gentle'); // Should have effort description
  });
});

describe('PfitsingerPhilosophy', () => {
  let philosophy: TrainingPhilosophy;
  let mockConfig: any;

  beforeEach(() => {
    philosophy = PhilosophyFactory.create('pfitzinger');
    mockConfig = createMockTrainingPlanConfig();
  });

  it('should emphasize lactate threshold training', () => {
    expect(philosophy.intensityDistribution).toEqual({
      easy: 75,
      moderate: 15,
      hard: 10
    });
    expect(philosophy.name).toBe('Pete Pfitzinger');
    expect(philosophy.methodology).toBe('pfitzinger');
  });

  it('should customize workout with medium-long run emphasis', () => {
    const longRun = {
      type: 'long_run' as const,
      primaryZone: { name: 'EASY' },
      segments: [{
        duration: 90,
        intensity: 70,
        zone: { name: 'EASY' },
        description: 'Long run'
      }],
      adaptationTarget: 'Aerobic capacity',
      estimatedTSS: 120,
      recoveryTime: 48
    };

    const customized = philosophy.customizeWorkout(longRun, 'build', 4);
    
    // Should maintain workout structure
    expect(customized.segments.length).toBeGreaterThanOrEqual(1);
    expect(customized.adaptationTarget).toBeDefined();
    expect(customized.estimatedTSS).toBeGreaterThan(0);
  });

  it('should select Pfitzinger-specific workouts', () => {
    // Test workout selection prioritizing threshold
    const thresholdWorkout = philosophy.selectWorkout('threshold', 'build', 2);
    expect(thresholdWorkout).toBeDefined();
    
    const tempoWorkout = philosophy.selectWorkout('tempo', 'peak', 3);
    expect(tempoWorkout).toBe('TEMPO_CONTINUOUS');
    
    // VO2max work in peak phase only
    const vo2maxInBuild = philosophy.selectWorkout('vo2max', 'build', 4);
    expect(vo2maxInBuild).toBe('THRESHOLD_PROGRESSION'); // Converts to threshold
  });

  it('should enhance plan with Pfitzinger features', () => {
    const mockPlan = { 
      id: 'test-plan',
      config: mockConfig,
      blocks: [],
      workouts: [],
      summary: { phases: [] }
    };
    
    // Assert mockPlan as TrainingPlan for test purposes  
    const testPlan = mockPlan as unknown as TrainingPlan;
    const enhanced = philosophy.enhancePlan(testPlan);
    expect(enhanced).toBeDefined();
    expect(enhanced.summary).toBeDefined();
  });
});

describe('Philosophy Integration', () => {
  it('should maintain consistent workout customization', () => {
    const philosophies = [
      PhilosophyFactory.create('daniels'),
      PhilosophyFactory.create('lydiard'),
      PhilosophyFactory.create('pfitzinger')
    ];
    
    const baseWorkout = {
      type: 'tempo' as const,
      primaryZone: { name: 'TEMPO' },
      segments: [{
        duration: 20,
        intensity: 88,
        zone: { name: 'TEMPO' },
        description: 'Tempo run'
      }],
      adaptationTarget: 'Lactate threshold',
      estimatedTSS: 45,
      recoveryTime: 24
    };
    
    const config = createMockTrainingPlanConfig();
    
    philosophies.forEach(philosophy => {
      const customized = philosophy.customizeWorkout(baseWorkout, 'build', 4);
      
      // All should maintain basic workout structure
      expect(customized.type).toBe(baseWorkout.type);
      expect(customized.segments).toHaveLength(baseWorkout.segments.length);
      expect(customized.adaptationTarget).toBeDefined();
      expect(customized.estimatedTSS).toBeGreaterThan(0);
    });
  });

  it('should validate different intensity distributions', () => {
    const mockWorkouts = {
      daniels: Array(100).fill(null).map((_, i) => {
        const type = i < 80 ? 'easy' : i < 95 ? 'tempo' : 'threshold';
        return { type, targetMetrics: { tss: 50 } };
      }),
      lydiard: Array(100).fill(null).map((_, i) => {
        const type = i < 85 ? 'easy' : i < 95 ? 'steady' : 'hill_repeats';
        return { type, targetMetrics: { tss: 50 } };
      }),
      pfitzinger: Array(100).fill(null).map((_, i) => {
        const type = i < 75 ? 'easy' : i < 95 ? 'tempo' : 'threshold';
        return { type, targetMetrics: { tss: 50 } };
      })
    };

    const daniels = PhilosophyFactory.create('daniels');
    const lydiard = PhilosophyFactory.create('lydiard');
    const pfitzinger = PhilosophyFactory.create('pfitzinger');

    validateIntensityDistribution(mockWorkouts.daniels, daniels.intensityDistribution);
    validateIntensityDistribution(mockWorkouts.lydiard, lydiard.intensityDistribution);
    validateIntensityDistribution(mockWorkouts.pfitzinger, pfitzinger.intensityDistribution);
  });
});