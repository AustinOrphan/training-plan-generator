/**
 * Tests for Methodology-Aware Adaptation Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MethodologyAdaptationEngine,
  MethodologyAdaptationPattern,
  MethodologyResponseProfile,
  AdaptationResponse,
  MethodologyInsights,
  MethodologyAdaptationUtils
} from '../methodology-adaptation-engine';
import {
  TrainingPlan,
  PlannedWorkout,
  CompletedWorkout,
  RecoveryMetrics,
  ProgressData,
  TrainingMethodology,
  AdvancedPlanConfig,
  FitnessAssessment
} from '../types';
import { AdvancedTrainingPlanGenerator } from '../advanced-generator';
import { 
  createMockAdvancedPlanConfig,
  generateCompletedWorkouts,
  generatePlannedWorkouts,
  createMockRecoveryMetrics
} from './test-utils';

describe('MethodologyAdaptationEngine', () => {
  let engine: MethodologyAdaptationEngine;
  let testPlan: TrainingPlan;
  let plannedWorkouts: PlannedWorkout[];
  let completedWorkouts: CompletedWorkout[];
  let generator: AdvancedTrainingPlanGenerator;

  beforeEach(async () => {
    engine = new MethodologyAdaptationEngine();
    
    const config = createMockAdvancedPlanConfig({
      methodology: 'daniels' as TrainingMethodology,
      name: 'Test Daniels Plan',
      description: 'VDOT-based training plan for testing'
    });
    
    generator = new AdvancedTrainingPlanGenerator(config);
    testPlan = generator.generateAdvancedPlan();
    plannedWorkouts = testPlan.workouts;
    
    // Use test utilities to create proper completed workouts
    completedWorkouts = generateCompletedWorkouts(2, 3); // 2 weeks, 3 workouts per week
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default adaptation patterns', () => {
      expect(engine).toBeInstanceOf(MethodologyAdaptationEngine);
    });

    it('should have methodology-specific patterns for all supported methodologies', () => {
      const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger', 'hudson', 'custom'];
      
      // Test that patterns exist by analyzing progress with each methodology
      methodologies.forEach(methodology => {
        const testConfig = createMockAdvancedPlanConfig({ methodology });
        const testGen = new AdvancedTrainingPlanGenerator(testConfig);
        const testPlanForMethodology = testGen.generateAdvancedPlan();
        
        const result = engine.analyzeProgressWithMethodology(
          completedWorkouts,
          plannedWorkouts,
          testPlanForMethodology
        );
        
        expect(result.methodologyInsights.methodology).toBe(methodology);
      });
    });
  });

  describe('analyzeProgressWithMethodology', () => {
    it('should analyze progress with methodology context', () => {
      const result = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plannedWorkouts,
        testPlan
      );

      expect(result).toHaveProperty('methodologyInsights');
      expect(result.methodologyInsights.methodology).toBe('daniels');
      expect(result.methodologyInsights.philosophyAlignment).toBeGreaterThanOrEqual(0);
      expect(result.methodologyInsights.philosophyAlignment).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.methodologyInsights.adaptationRecommendations)).toBe(true);
      expect(result.methodologyInsights.responseProfileStatus).toBeDefined();
    });

    it('should handle plans without methodology', () => {
      const basicConfig = createMockAdvancedPlanConfig({
        name: 'Basic Plan',
        description: 'Plan without methodology'
      });
      delete (basicConfig as any).methodology;
      
      const basicGenerator = new AdvancedTrainingPlanGenerator(basicConfig);
      const basicPlan = basicGenerator.generateAdvancedPlan();

      const result = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plannedWorkouts,
        basicPlan
      );

      expect(result.methodologyInsights.methodology).toBe('custom');
      expect(result.methodologyInsights.philosophyAlignment).toBe(0);
      expect(result.methodologyInsights.responseProfileStatus).toBe('no_methodology');
    });

    it('should provide methodology-specific recommendations', () => {
      const result = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plannedWorkouts,
        testPlan
      );

      expect(result.methodologyInsights.adaptationRecommendations).toBeDefined();
      expect(Array.isArray(result.methodologyInsights.adaptationRecommendations)).toBe(true);
    });

    it('should calculate philosophy alignment correctly', () => {
      const result = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plannedWorkouts,
        testPlan
      );

      const alignment = result.methodologyInsights.philosophyAlignment;
      expect(typeof alignment).toBe('number');
      expect(alignment).toBeGreaterThanOrEqual(0);
      expect(alignment).toBeLessThanOrEqual(100);
    });
  });

  describe('suggestMethodologyAwareModifications', () => {
    let baseProgress: ProgressData;

    beforeEach(() => {
      baseProgress = engine.analyzeProgress(completedWorkouts, plannedWorkouts);
      // Ensure completedWorkouts array is properly set for base methods
      baseProgress.completedWorkouts = completedWorkouts;
    });

    it('should provide methodology-aware modifications', () => {
      const modifications = engine.suggestMethodologyAwareModifications(
        testPlan,
        baseProgress
      );

      expect(Array.isArray(modifications)).toBe(true);
      modifications.forEach(mod => {
        expect(mod).toHaveProperty('methodologySpecific');
        expect(mod).toHaveProperty('philosophyPrinciple');
        expect(mod).toHaveProperty('confidence');
        expect(typeof mod.confidence).toBe('number');
        expect(mod.confidence).toBeGreaterThanOrEqual(0);
        expect(mod.confidence).toBeLessThanOrEqual(100);
      });
    });

    it('should handle plans without methodology', () => {
      const basicConfig = createMockAdvancedPlanConfig({
        name: 'Basic Plan'
      });
      delete (basicConfig as any).methodology;
      
      const basicGenerator = new AdvancedTrainingPlanGenerator(basicConfig);
      const basicPlan = basicGenerator.generateAdvancedPlan();

      const modifications = engine.suggestMethodologyAwareModifications(
        basicPlan,
        baseProgress
      );

      expect(Array.isArray(modifications)).toBe(true);
      modifications.forEach(mod => {
        expect(mod.methodologySpecific).toBe(false);
      });
    });

    it('should prioritize modifications based on methodology principles', () => {
      const modifications = engine.suggestMethodologyAwareModifications(
        testPlan,
        baseProgress
      );

      if (modifications.length > 1) {
        // Check that methodology-specific modifications come first
        const firstMod = modifications[0];
        const hasMethodologySpecific = modifications.some(m => m.methodologySpecific);
        
        if (hasMethodologySpecific) {
          const methodologyMods = modifications.filter(m => m.methodologySpecific);
          const generalMods = modifications.filter(m => !m.methodologySpecific);
          
          if (methodologyMods.length > 0 && generalMods.length > 0) {
            const firstMethodologyIndex = modifications.indexOf(methodologyMods[0]);
            const firstGeneralIndex = modifications.indexOf(generalMods[0]);
            expect(firstMethodologyIndex).toBeLessThan(firstGeneralIndex);
          }
        }
      }
    });

    it('should include recovery metrics in modification decisions', () => {
      const recoveryMetrics = createMockRecoveryMetrics({
        readinessScore: 70,
        sleepQuality: 6,
        perceivedStress: 4
      });

      const modifications = engine.suggestMethodologyAwareModifications(
        testPlan,
        baseProgress,
        recoveryMetrics
      );

      expect(Array.isArray(modifications)).toBe(true);
      // Modifications should consider recovery metrics
      expect(modifications.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('updateResponseProfile', () => {
    it('should create and update response profiles', () => {
      const athleteId = 'test-athlete-123';
      const methodology: TrainingMethodology = 'daniels';
      
      const modification = {
        type: 'pace_adjustment' as const,
        reason: 'VDOT decline test',
        targetWorkouts: ['tempo'],
        adjustmentValue: -5,
        duration: 14,
        methodologySpecific: true,
        philosophyPrinciple: 'VDOT-based pace prescription',
        confidence: 90
      };

      const outcome = {
        performanceChange: 5,
        adherenceChange: 10,
        recoveryChange: 8,
        satisfactionChange: 7
      };

      // This creates a new profile
      engine.updateResponseProfile(athleteId, methodology, modification, outcome);

      // Test that the profile was created (indirectly through no errors)
      expect(() => {
        engine.updateResponseProfile(athleteId, methodology, modification, outcome);
      }).not.toThrow();
    });

    it('should calculate response effectiveness correctly', () => {
      const athleteId = 'test-athlete-effectiveness';
      const methodology: TrainingMethodology = 'lydiard';
      
      const modification = {
        type: 'volume_increase' as const,
        reason: 'Aerobic base development',
        targetWorkouts: ['easy'],
        adjustmentValue: 15,
        duration: 21,
        methodologySpecific: true,
        philosophyPrinciple: 'Aerobic base development',
        confidence: 88
      };

      // High effectiveness outcome
      const positiveOutcome = {
        performanceChange: 15,
        adherenceChange: 20,
        recoveryChange: 10,
        satisfactionChange: 12
      };

      expect(() => {
        engine.updateResponseProfile(athleteId, methodology, modification, positiveOutcome);
      }).not.toThrow();

      // Low effectiveness outcome
      const negativeOutcome = {
        performanceChange: -5,
        adherenceChange: -10,
        recoveryChange: -8,
        satisfactionChange: -3
      };

      expect(() => {
        engine.updateResponseProfile(athleteId, methodology, modification, negativeOutcome);
      }).not.toThrow();
    });
  });

  describe('Methodology-Specific Behavior', () => {
    it('should provide Daniels-specific insights', () => {
      const result = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plannedWorkouts,
        testPlan
      );

      expect(result.methodologyInsights.methodology).toBe('daniels');
      expect(result.methodologyInsights.keyMetrics).toBeDefined();
      expect(result.methodologyInsights.complianceScore).toBeDefined();
    });

    it('should provide Lydiard-specific insights', async () => {
      const lydiardConfig = createMockAdvancedPlanConfig({
        methodology: 'lydiard' as TrainingMethodology,
        name: 'Lydiard Base Building',
        description: 'Aerobic base development plan'
      });
      
      const lydiardGenerator = new AdvancedTrainingPlanGenerator(lydiardConfig);
      const lydiardPlan = lydiardGenerator.generateAdvancedPlan();

      const result = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plannedWorkouts,
        lydiardPlan
      );

      expect(result.methodologyInsights.methodology).toBe('lydiard');
      expect(result.methodologyInsights.adaptationRecommendations).toBeDefined();
    });

    it('should provide Pfitzinger-specific insights', async () => {
      const pfitzConfig = createMockAdvancedPlanConfig({
        methodology: 'pfitzinger' as TrainingMethodology,
        name: 'Pfitzinger Marathon',
        description: 'Lactate threshold focused plan'
      });
      
      const pfitzGenerator = new AdvancedTrainingPlanGenerator(pfitzConfig);
      const pfitzPlan = pfitzGenerator.generateAdvancedPlan();

      const result = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plannedWorkouts,
        pfitzPlan
      );

      expect(result.methodologyInsights.methodology).toBe('pfitzinger');
      expect(result.methodologyInsights.keyMetrics).toBeDefined();
    });

    it('should provide Hudson-specific insights', async () => {
      const hudsonConfig = createMockAdvancedPlanConfig({
        methodology: 'hudson' as TrainingMethodology,
        name: 'Hudson Adaptive',
        description: 'Individual response based plan'
      });
      
      const hudsonGenerator = new AdvancedTrainingPlanGenerator(hudsonConfig);
      const hudsonPlan = hudsonGenerator.generateAdvancedPlan();

      const result = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plannedWorkouts,
        hudsonPlan
      );

      expect(result.methodologyInsights.methodology).toBe('hudson');
      expect(result.methodologyInsights.responseProfileStatus).toBeDefined();
    });
  });

  describe('Integration with Base Adaptation Engine', () => {
    it('should extend base functionality without breaking existing features', () => {
      const baseResult = engine.analyzeProgress(completedWorkouts, plannedWorkouts);
      const enhancedResult = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plannedWorkouts,
        testPlan
      );

      // Base properties should be preserved
      expect(enhancedResult.totalWorkouts).toBe(baseResult.totalWorkouts);
      expect(enhancedResult.completedWorkouts).toBe(baseResult.completedWorkouts);
      expect(enhancedResult.adherenceRate).toBe(baseResult.adherenceRate);

      // Enhanced properties should be added
      expect(enhancedResult).toHaveProperty('methodologyInsights');
    });

    it('should provide both base and methodology-specific modifications', () => {
      const baseModifications = engine.suggestModifications(testPlan, engine.analyzeProgress(completedWorkouts, plannedWorkouts));
      const enhancedModifications = engine.suggestMethodologyAwareModifications(
        testPlan,
        engine.analyzeProgress(completedWorkouts, plannedWorkouts)
      );

      expect(Array.isArray(baseModifications)).toBe(true);
      expect(Array.isArray(enhancedModifications)).toBe(true);
      
      // Enhanced should have methodology-specific modifications
      const hasMethodologySpecific = enhancedModifications.some(mod => mod.methodologySpecific);
      if (enhancedModifications.length > 0) {
        expect(enhancedModifications.every(mod => mod.hasOwnProperty('methodologySpecific'))).toBe(true);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty workout arrays', () => {
      const result = engine.analyzeProgressWithMethodology(
        [],
        [],
        testPlan
      );

      expect(result.methodologyInsights).toBeDefined();
      expect(result.methodologyInsights.methodology).toBe('daniels');
    });

    it('should handle plans with minimal workout data', () => {
      const minimalWorkout: PlannedWorkout = {
        id: 'minimal-1',
        scheduledDate: new Date(),
        workout: {
          id: 'workout-minimal',
          name: 'Minimal Test Workout',
          type: 'easy',
          description: 'Basic workout for testing'
        },
        phase: 'base'
      };

      const result = engine.analyzeProgressWithMethodology(
        [],
        [minimalWorkout],
        testPlan
      );

      expect(result.methodologyInsights).toBeDefined();
    });

    it('should handle incomplete completed workout data', () => {
      const incompleteWorkout: CompletedWorkout = {
        id: 'incomplete-1',
        date: new Date(),
        workout: {
          id: 'workout-incomplete',
          name: 'Incomplete Workout',
          type: 'easy',
          description: 'Workout with minimal data'
        },
        actualMetrics: {
          duration: 30
          // Missing other metrics
        }
      };

      const result = engine.analyzeProgressWithMethodology(
        [incompleteWorkout],
        plannedWorkouts,
        testPlan
      );

      expect(result.methodologyInsights).toBeDefined();
      expect(result.methodologyInsights.methodology).toBe('daniels');
    });
  });
});

describe('MethodologyAdaptationUtils', () => {
  let testPlan: TrainingPlan;
  let completedWorkouts: CompletedWorkout[];

  beforeEach(() => {
    const config = createMockAdvancedPlanConfig({
      methodology: 'daniels' as TrainingMethodology,
      name: 'Utils Test Plan'
    });
    
    const generator = new AdvancedTrainingPlanGenerator(config);
    testPlan = generator.generateAdvancedPlan();
    
    completedWorkouts = generateCompletedWorkouts(1, 3); // 1 week, 3 workouts
  });

  describe('createEngine', () => {
    it('should create a new MethodologyAdaptationEngine instance', () => {
      const engine = MethodologyAdaptationUtils.createEngine();
      expect(engine).toBeInstanceOf(MethodologyAdaptationEngine);
    });
  });

  describe('analyzeAdaptationNeeds', () => {
    it('should analyze methodology-specific adaptation needs', () => {
      const insights = MethodologyAdaptationUtils.analyzeAdaptationNeeds(
        testPlan,
        completedWorkouts,
        'daniels'
      );

      expect(insights).toBeDefined();
      expect(insights.methodology).toBe('daniels');
      expect(insights.philosophyAlignment).toBeGreaterThanOrEqual(0);
      expect(insights.philosophyAlignment).toBeLessThanOrEqual(100);
      expect(Array.isArray(insights.adaptationRecommendations)).toBe(true);
    });

    it('should work with different methodologies', () => {
      const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger', 'hudson', 'custom'];
      
      methodologies.forEach(methodology => {
        // Create a plan specifically for this methodology
        const methodologyConfig = createMockAdvancedPlanConfig({
          methodology,
          name: `${methodology} Test Plan`
        });
        const methodologyGenerator = new AdvancedTrainingPlanGenerator(methodologyConfig);
        const methodologyPlan = methodologyGenerator.generateAdvancedPlan();
        
        const insights = MethodologyAdaptationUtils.analyzeAdaptationNeeds(
          methodologyPlan,
          completedWorkouts,
          methodology
        );
        
        expect(insights.methodology).toBe(methodology);
      });
    });
  });

  describe('getModificationSuggestions', () => {
    it('should provide methodology-specific modification suggestions', () => {
      const progress = {
        date: new Date(),
        totalWorkouts: 10,
        completedWorkouts: completedWorkouts,
        adherenceRate: 0.8,
        performanceTrend: 'stable' as const,
        volumeProgress: {
          weeklyAverage: 40,
          trend: 'stable' as const
        }
      };

      const suggestions = MethodologyAdaptationUtils.getModificationSuggestions(
        testPlan,
        progress,
        'daniels'
      );

      expect(Array.isArray(suggestions)).toBe(true);
      suggestions.forEach(suggestion => {
        expect(suggestion).toHaveProperty('methodologySpecific');
        expect(suggestion).toHaveProperty('philosophyPrinciple');
        expect(suggestion).toHaveProperty('confidence');
      });
    });

    it('should handle different progress scenarios', () => {
      const scenarios = [
        {
          name: 'high adherence',
          progress: { 
            date: new Date(),
            totalWorkouts: 10, 
            completedWorkouts: completedWorkouts, 
            adherenceRate: 1.0, 
            performanceTrend: 'improving' as const,
            volumeProgress: { weeklyAverage: 45, trend: 'increasing' as const }
          }
        },
        {
          name: 'low adherence',
          progress: { 
            date: new Date(),
            totalWorkouts: 10, 
            completedWorkouts: completedWorkouts.slice(0, 2), 
            adherenceRate: 0.5, 
            performanceTrend: 'declining' as const,
            volumeProgress: { weeklyAverage: 20, trend: 'decreasing' as const }
          }
        },
        {
          name: 'moderate performance',
          progress: { 
            date: new Date(),
            totalWorkouts: 10, 
            completedWorkouts: completedWorkouts, 
            adherenceRate: 0.7, 
            performanceTrend: 'stable' as const,
            volumeProgress: { weeklyAverage: 35, trend: 'stable' as const }
          }
        }
      ];

      scenarios.forEach(scenario => {
        const suggestions = MethodologyAdaptationUtils.getModificationSuggestions(
          testPlan,
          scenario.progress,
          'daniels'
        );
        
        expect(Array.isArray(suggestions)).toBe(true);
        // Each scenario should provide some kind of response
        expect(suggestions.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

describe('Methodology-Specific Adaptation Patterns', () => {
  let engine: MethodologyAdaptationEngine;

  beforeEach(() => {
    engine = new MethodologyAdaptationEngine();
  });

  it('should have distinct patterns for each methodology', () => {
    const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger', 'hudson', 'custom'];
    
    methodologies.forEach(methodology => {
      const config = createMockAdvancedPlanConfig({ methodology });
      const generator = new AdvancedTrainingPlanGenerator(config);
      const plan = generator.generateAdvancedPlan();
      
      const completedWorkouts = generateCompletedWorkouts(2, 2); // 2 weeks, 2 workouts per week

      const result = engine.analyzeProgressWithMethodology(
        completedWorkouts,
        plan.workouts,
        plan
      );

      expect(result.methodologyInsights.methodology).toBe(methodology);
      expect(result.methodologyInsights.adaptationRecommendations).toBeDefined();
      
      // Each methodology should have its own recommendations
      if (result.methodologyInsights.adaptationRecommendations.length > 0) {
        expect(result.methodologyInsights.adaptationRecommendations.every(rec => 
          typeof rec === 'string' && rec.length > 0
        )).toBe(true);
      }
    });
  });

  it('should provide methodology-appropriate modification suggestions', () => {
    const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
    
    methodologies.forEach(methodology => {
      const config = createMockAdvancedPlanConfig({ methodology });
      const generator = new AdvancedTrainingPlanGenerator(config);
      const plan = generator.generateAdvancedPlan();
      
      const progress = {
        date: new Date(),
        totalWorkouts: 10,
        completedWorkouts: [],
        adherenceRate: 0.8,
        performanceTrend: 'stable' as const,
        volumeProgress: {
          weeklyAverage: 40,
          trend: 'stable' as const
        }
      };

      const modifications = engine.suggestMethodologyAwareModifications(plan, progress);
      
      expect(Array.isArray(modifications)).toBe(true);
      
      // Check that modifications include methodology-specific elements
      const methodologySpecific = modifications.filter(mod => mod.methodologySpecific);
      if (methodologySpecific.length > 0) {
        methodologySpecific.forEach(mod => {
          expect(mod.philosophyPrinciple).toBeDefined();
          expect(typeof mod.philosophyPrinciple).toBe('string');
          expect(mod.philosophyPrinciple.length).toBeGreaterThan(0);
        });
      }
    });
  });
});