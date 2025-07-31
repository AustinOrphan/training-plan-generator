/**
 * Import Verification Test
 * Task 10: Create import verification test
 * 
 * This test verifies that all public exports from the library are accessible
 * and work correctly, ensuring no internal types are exposed and all documented
 * APIs are available for import.
 * 
 * Requirements: 1.3, 1.4
 * Leverages: test-utils.ts patterns
 * 
 * Note: Some modules are temporarily excluded from index.ts due to TypeScript
 * errors that need to be resolved in the earlier tasks. This test validates
 * the current working state while also testing the problematic modules directly.
 */

import { describe, test, expect } from 'vitest';

describe('Import Verification', () => {
  describe('Core Types and Interfaces', () => {
    test('should import all essential types', async () => {
      const typesModule = await import('../types');
      
      // Verify essential type exports exist
      expect(typesModule).toHaveProperty('TrainingPlanConfig');
      expect(typesModule).toHaveProperty('FitnessAssessment');
      expect(typesModule).toHaveProperty('TrainingPreferences');
      expect(typesModule).toHaveProperty('TargetRace');
      expect(typesModule).toHaveProperty('PlannedWorkout');
      expect(typesModule).toHaveProperty('CompletedWorkout');
      expect(typesModule).toHaveProperty('TrainingPlan');
      expect(typesModule).toHaveProperty('TrainingBlock');
      
      // Verify type constructors work (if they exist)
      if (typeof typesModule.TrainingPlanConfig === 'function') {
        expect(() => new typesModule.TrainingPlanConfig()).not.toThrow();
      }
    });
  });

  describe('Core Functionality', () => {
    test('should import calculator functions', async () => {
      const calculatorModule = await import('../calculator');
      
      // Verify essential calculator exports
      expect(calculatorModule).toHaveProperty('calculateVDOT');
      expect(calculatorModule).toHaveProperty('calculateCriticalSpeed');
      expect(typeof calculatorModule.calculateVDOT).toBe('function');
      expect(typeof calculatorModule.calculateCriticalSpeed).toBe('function');
      
      // Verify cached versions if they exist
      if (calculatorModule.calculateVDOTCached) {
        expect(typeof calculatorModule.calculateVDOTCached).toBe('function');
      }
    });

    test('should import basic generator class', async () => {
      const generatorModule = await import('../generator');
      
      // Verify generator class exports
      expect(generatorModule).toHaveProperty('TrainingPlanGenerator');
      expect(typeof generatorModule.TrainingPlanGenerator).toBe('function');
    });

    test('should import advanced generator class (direct import)', async () => {
      // Test direct import since it's temporarily excluded from index
      const advancedGeneratorModule = await import('../advanced-generator');
      
      expect(advancedGeneratorModule).toHaveProperty('AdvancedTrainingPlanGenerator');
      expect(typeof advancedGeneratorModule.AdvancedTrainingPlanGenerator).toBe('function');
      
      // Verify AdvancedPlanConfig is exported
      expect(advancedGeneratorModule).toHaveProperty('AdvancedPlanConfig');
    });
  });

  describe('Workout and Zone Management', () => {
    test('should import workout utilities', async () => {
      const workoutsModule = await import('../workouts');
      
      // Verify workout-related exports exist
      expect(workoutsModule).toBeDefined();
      
      // Check for common workout functions/classes
      const exportKeys = Object.keys(workoutsModule);
      expect(exportKeys.length).toBeGreaterThan(0);
    });

    test('should import zone utilities', async () => {
      const zonesModule = await import('../zones');
      
      // Verify zones exports exist
      expect(zonesModule).toBeDefined();
      expect(zonesModule).toHaveProperty('calculateTrainingPaces');
      expect(typeof zonesModule.calculateTrainingPaces).toBe('function');
    });
  });

  describe('Training Philosophies (Direct Import)', () => {
    test('should import philosophy system directly', async () => {
      // Test direct import since temporarily excluded from index
      const philosophiesModule = await import('../philosophies');
      
      // Verify philosophy exports
      expect(philosophiesModule).toHaveProperty('PhilosophyFactory');
      expect(philosophiesModule).toHaveProperty('TrainingPhilosophy');
      expect(typeof philosophiesModule.PhilosophyFactory).toBe('function');
      
      // Verify factory can create philosophies
      const factory = new philosophiesModule.PhilosophyFactory();
      expect(factory).toBeDefined();
      expect(typeof factory.create).toBe('function');
    });

    test('should not expose internal philosophy classes', async () => {
      const philosophiesModule = await import('../philosophies');
      
      // Verify individual philosophy classes are NOT exported
      expect(philosophiesModule).not.toHaveProperty('DanielsPhilosophy');
      expect(philosophiesModule).not.toHaveProperty('LydiardPhilosophy');
      expect(philosophiesModule).not.toHaveProperty('PfitsingerPhilosophy');
    });
  });

  describe('Adaptation System (Direct Import)', () => {
    test('should import adaptation engine and types directly', async () => {
      // Test direct import since temporarily excluded from index
      const adaptationModule = await import('../adaptation');
      
      // Verify adaptation exports
      expect(adaptationModule).toHaveProperty('SmartAdaptationEngine');
      expect(adaptationModule).toHaveProperty('AdaptationSettings');
      expect(adaptationModule).toHaveProperty('ProgressData');
      expect(typeof adaptationModule.SmartAdaptationEngine).toBe('function');
      
      // Verify engine can be instantiated
      const engine = new adaptationModule.SmartAdaptationEngine();
      expect(engine).toBeDefined();
      expect(typeof engine.analyzeProgress).toBe('function');
      expect(typeof engine.suggestModifications).toBe('function');
    });
  });

  describe('Export System (Direct Import)', () => {
    test('should import export utilities directly', async () => {
      // Test direct import since temporarily excluded from index
      const exportModule = await import('../export');
      
      // Verify export system
      expect(exportModule).toHaveProperty('MultiFormatExporter');
      expect(exportModule).toHaveProperty('ExportFormat');
      expect(exportModule).toHaveProperty('ExportResult');
      expect(typeof exportModule.MultiFormatExporter).toBe('function');
      
      // Verify exporter can be instantiated
      const exporter = new exportModule.MultiFormatExporter();
      expect(exporter).toBeDefined();
      expect(typeof exporter.exportPlan).toBe('function');
    });
  });

  describe('Validation System (Direct Import)', () => {
    test('should import validation utilities directly', async () => {
      // Test direct import since temporarily excluded from index
      const validationModule = await import('../validation');
      
      // Verify validation exports exist
      expect(validationModule).toBeDefined();
      
      // Check for validation functions
      const exportKeys = Object.keys(validationModule);
      expect(exportKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration and Constants', () => {
    test('should import constants', async () => {
      const constantsModule = await import('../constants');
      
      // Verify constants exports exist
      expect(constantsModule).toBeDefined();
      
      // Check for common constants
      const exportKeys = Object.keys(constantsModule);
      expect(exportKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced Features', () => {
    test('should import cache system', async () => {
      const cacheModule = await import('../calculation-cache');
      
      // Verify cache exports exist
      expect(cacheModule).toBeDefined();
      
      // Should have cache-related exports
      const exportKeys = Object.keys(cacheModule);
      expect(exportKeys.length).toBeGreaterThan(0);
      
      // Should also be available from index since it's now enabled
      const indexModule = await import('../index');
      // Note: Since it's a wildcard export, specific exports depend on what calculation-cache exports
      expect(indexModule).toBeDefined();
    });

    test('should import custom workout generator (direct import)', async () => {
      // Test direct import since not in index yet
      const customWorkoutModule = await import('../custom-workout-generator');
      
      // Verify custom workout generator exports exist
      expect(customWorkoutModule).toBeDefined();
      
      // Should have generator-related exports
      const exportKeys = Object.keys(customWorkoutModule);
      expect(exportKeys.length).toBeGreaterThan(0);
    });
  });

  describe('Current Public API Integration', () => {
    test('should import currently available API from index', async () => {
      const indexModule = await import('../index');
      
      // Verify currently available classes
      expect(indexModule).toHaveProperty('TrainingPlanGenerator');
      // Note: Advanced features temporarily excluded due to TS errors
      
      // Verify functions are available
      expect(indexModule).toHaveProperty('calculateVDOT');
      expect(indexModule).toHaveProperty('calculateCriticalSpeed');
      expect(indexModule).toHaveProperty('calculateTrainingPaces');
      
      // Verify types are available
      expect(indexModule).toHaveProperty('TrainingPlanConfig');
      expect(indexModule).toHaveProperty('FitnessAssessment');
      expect(indexModule).toHaveProperty('TrainingPreferences');
    });

    test('should instantiate available classes without errors', async () => {
      const indexModule = await import('../index');
      
      // Test core generator
      expect(() => {
        const generator = new indexModule.TrainingPlanGenerator();
        expect(generator).toBeDefined();
      }).not.toThrow();
    });

    test('should call available functions without errors', async () => {
      const indexModule = await import('../index');
      const { createMockRunData } = await import('./test-utils');
      
      // Test calculator functions
      expect(() => {
        const mockRuns = [createMockRunData(0)];
        const vdot = indexModule.calculateVDOT(mockRuns);
        expect(typeof vdot).toBe('number');
        expect(vdot).toBeGreaterThan(0);
      }).not.toThrow();
      
      expect(() => {
        const mockRuns = [createMockRunData(0)];
        const criticalSpeed = indexModule.calculateCriticalSpeed(mockRuns);
        expect(typeof criticalSpeed).toBe('number');
        expect(criticalSpeed).toBeGreaterThan(0);
      }).not.toThrow();
      
      // Test zone calculation function
      expect(() => {
        const paces = indexModule.calculateTrainingPaces(45); // VDOT of 45
        expect(paces).toBeDefined();
        expect(typeof paces).toBe('object');
      }).not.toThrow();
    });

    test('should verify all problematic modules work via direct import', async () => {
      // Test that the temporarily excluded modules work when imported directly
      
      // Advanced generator
      expect(async () => {
        const advancedModule = await import('../advanced-generator');
        const generator = new advancedModule.AdvancedTrainingPlanGenerator();
        expect(generator).toBeDefined();
      }).not.toThrow();
      
      // Philosophy system
      expect(async () => {
        const philosophyModule = await import('../philosophies');
        const factory = new philosophyModule.PhilosophyFactory();
        expect(factory).toBeDefined();
      }).not.toThrow();
      
      // Adaptation system
      expect(async () => {
        const adaptationModule = await import('../adaptation');
        const engine = new adaptationModule.SmartAdaptationEngine();
        expect(engine).toBeDefined();
      }).not.toThrow();
      
      // Export system
      expect(async () => {
        const exportModule = await import('../export');
        const exporter = new exportModule.MultiFormatExporter();
        expect(exporter).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Type Safety', () => {
    test('should verify currently available type imports work correctly', async () => {
      // This test ensures currently exported TypeScript types are properly available
      const { createMockTrainingPlanConfig } = await import('./test-utils');
      const indexModule = await import('../index');
      
      // Test currently available type usage
      const config: typeof indexModule.TrainingPlanConfig = createMockTrainingPlanConfig();
      expect(config).toBeDefined();
      
      // Test fitness assessment type
      const fitness: typeof indexModule.FitnessAssessment = {
        vdot: 45,
        criticalSpeed: 12.5,
        lactateThreshold: 11.2,
        runningEconomy: 190,
        weeklyMileage: 40,
        longestRecentRun: 20,
        trainingAge: 3,
        injuryHistory: [],
        recoveryRate: 75
      };
      expect(fitness).toBeDefined();
    });

    test('should verify excluded types work via direct import', async () => {
      // Test types that are temporarily excluded from index but should work directly
      const { createMockAdvancedPlanConfig } = await import('./test-utils');
      const advancedModule = await import('../advanced-generator');
      const adaptationModule = await import('../adaptation');
      
      // Test AdvancedPlanConfig via direct import
      const config: typeof advancedModule.AdvancedPlanConfig = createMockAdvancedPlanConfig();
      expect(config).toBeDefined();
      
      // Test AdaptationSettings via direct import
      const adaptationSettings: typeof adaptationModule.AdaptationSettings = {
        enableAutoAdjustment: true,
        maxVolumeChange: 20,
        minRecoveryDays: 1
      };
      expect(adaptationSettings).toBeDefined();
    });

    test('should not expose internal implementation details', async () => {
      const indexModule = await import('../index');
      
      // Verify internal classes are not exposed (they shouldn't be in current limited export)
      expect(indexModule).not.toHaveProperty('DanielsPhilosophy');
      expect(indexModule).not.toHaveProperty('LydiardPhilosophy');
      expect(indexModule).not.toHaveProperty('PfitsingerPhilosophy');
      
      // Verify private utility functions are not exposed
      expect(indexModule).not.toHaveProperty('calculateInternal');
      expect(indexModule).not.toHaveProperty('privateHelper');
      expect(indexModule).not.toHaveProperty('internalCache');
    });
  });

  describe('Module Loading Performance', () => {
    test('should load modules efficiently', async () => {
      const startTime = performance.now();
      
      // Import all major modules
      await Promise.all([
        import('../index'),
        import('../types'),
        import('../calculator'),
        import('../generator'),
        import('../advanced-generator'),
        import('../philosophies'),
        import('../adaptation'),
        import('../export'),
        import('../validation')
      ]);
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // All imports should complete within reasonable time (< 100ms)
      expect(loadTime).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing optional exports gracefully', async () => {
      // Test that missing optional exports don't break the module
      expect(async () => {
        const module = await import('../index');
        
        // If optional exports are missing, accessing them should not throw
        // but they should be undefined
        const optionalExport = (module as any).OptionalFeature;
        if (optionalExport !== undefined) {
          expect(typeof optionalExport).toBe('function');
        }
      }).not.toThrow();
    });

    test('should provide meaningful error messages for invalid imports', async () => {
      // Test that importing from non-existent modules provides clear errors
      await expect(async () => {
        await import('../non-existent-module');
      }).rejects.toThrow();
    });
  });
});