import { describe, it, expect, beforeEach } from 'vitest';
import {
  MethodologyConflictResolver,
  ConflictType,
  ConflictSeverity,
  ResolutionStrategy,
  MethodologyConflict,
  ConflictResolutionResult,
  SafetyAssessment,
  PrinciplePreservation
} from '../methodology-conflict-resolver';
import type { AdvancedPlanConfig, TrainingMethodology } from '../types';

// Helper function to create mock advanced plan config
function createMockAdvancedPlanConfig(overrides?: Partial<AdvancedPlanConfig>): AdvancedPlanConfig {
  return {
    name: 'Test Plan',
    goal: 'MARATHON',
    startDate: new Date(),
    endDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
    methodology: 'daniels',
    intensity: {
      easy: 70, // Below Daniels 80% recommendation
      moderate: 20,
      hard: 10
    },
    volume: {
      weeklyHours: 8,
      progressionRate: 0.15 // Higher than safe limits
    },
    recovery: {
      emphasis: 0.6, // Lower than methodology requirements
      restDays: 1
    },
    experience: 'intermediate',
    ...overrides
  } as AdvancedPlanConfig;
}

describe('MethodologyConflictResolver', () => {
  let resolver: MethodologyConflictResolver;

  beforeEach(() => {
    resolver = new MethodologyConflictResolver();
  });

  describe('Core Conflict Resolution (Requirement 6.4)', () => {
    it('should identify intensity distribution conflicts for Daniels methodology', () => {
      const config = createMockAdvancedPlanConfig({
        methodology: 'daniels',
        intensity: { easy: 70, moderate: 20, hard: 9, veryHard: 1 } // Below 80% easy
      });

      const result = resolver.resolveConflicts(config, 'daniels');

      expect(result.conflicts.length).toBeGreaterThan(0);
      const intensityConflict = result.conflicts.find(c => c.type === 'intensity_violation');
      expect(intensityConflict).toBeDefined();
      expect(intensityConflict!.severity).toBe('medium');
      expect(intensityConflict!.description).toContain('80/20');
    });

    it('should identify intensity distribution conflicts for Lydiard methodology', () => {
      const config = createMockAdvancedPlanConfig({
        methodology: 'lydiard',
        intensity: { easy: 75, moderate: 15, hard: 9, veryHard: 1 } // Below 85% easy
      });

      const result = resolver.resolveConflicts(config, 'lydiard');

      expect(result.conflicts.length).toBeGreaterThan(0);
      const intensityConflict = result.conflicts.find(c => c.type === 'intensity_violation');
      expect(intensityConflict).toBeDefined();
      expect(intensityConflict!.severity).toBe('high');
      expect(intensityConflict!.description).toContain('85%');
    });

    it('should identify volume progression conflicts', () => {
      const config = createMockAdvancedPlanConfig({
        volume: { progressionRate: 0.20 } // Very high progression rate
      });

      const result = resolver.resolveConflicts(config, 'daniels');

      const volumeConflict = result.conflicts.find(c => c.type === 'volume_violation');
      expect(volumeConflict).toBeDefined();
      expect(volumeConflict!.severity).toBe('high');
      expect(volumeConflict!.riskLevel).toBeGreaterThan(70);
    });

    it('should identify safety violations for high volume + high intensity', () => {
      const config = createMockAdvancedPlanConfig({
        volume: { weeklyHours: 20 },
        intensity: { easy: 70, moderate: 5, hard: 20, veryHard: 5 } // High intensity
      });

      const result = resolver.resolveConflicts(config, 'daniels');

      const safetyConflict = result.conflicts.find(c => c.type === 'safety_violation');
      expect(safetyConflict).toBeDefined();
      expect(safetyConflict!.severity).toBe('critical');
      expect(safetyConflict!.riskLevel).toBeGreaterThan(90);
    });

    it('should identify recovery emphasis conflicts', () => {
      const config = createMockAdvancedPlanConfig({
        methodology: 'lydiard',
        recovery: { emphasis: 0.7 } // Below Lydiard 0.85 requirement
      });

      const result = resolver.resolveConflicts(config, 'lydiard');

      const recoveryConflict = result.conflicts.find(c => c.type === 'recovery_violation');
      expect(recoveryConflict).toBeDefined();
      expect(recoveryConflict!.severity).toBe('medium');
    });
  });

  describe('Resolution Strategy Generation', () => {
    it('should recommend safety override for critical conflicts', () => {
      const config = createMockAdvancedPlanConfig({
        volume: { weeklyHours: 25 },
        intensity: { hard: 30 } // Dangerous combination
      });

      const result = resolver.resolveConflicts(config, 'daniels');

      const criticalResolution = result.resolutions.find(r => 
        r.strategy === 'safety_override'
      );
      expect(criticalResolution).toBeDefined();
      expect(criticalResolution!.recommendation).toContain('SAFETY CRITICAL');
    });

    it('should recommend strict methodology for high severity principle violations', () => {
      const config = createMockAdvancedPlanConfig({
        methodology: 'lydiard',
        intensity: { easy: 70 } // Major violation of Lydiard principles
      });

      const result = resolver.resolveConflicts(config, 'lydiard');

      const strictResolution = result.resolutions.find(r => 
        r.strategy === 'strict_methodology'
      );
      expect(strictResolution).toBeDefined();
    });

    it('should recommend guided modification for medium severity conflicts', () => {
      const config = createMockAdvancedPlanConfig({
        intensity: { easy: 75 } // Minor Daniels violation
      });

      const result = resolver.resolveConflicts(config, 'daniels');

      const guidedResolution = result.resolutions.find(r => 
        r.strategy === 'guided_modification'
      );
      expect(guidedResolution).toBeDefined();
    });

    it('should provide implementation steps for each resolution', () => {
      const config = createMockAdvancedPlanConfig({
        intensity: { easy: 70 }
      });

      const result = resolver.resolveConflicts(config, 'daniels');

      result.resolutions.forEach(resolution => {
        expect(resolution.implementationSteps).toBeDefined();
        expect(resolution.implementationSteps.length).toBeGreaterThan(0);
        expect(resolution.implementationSteps[0]).toContain('1.');
      });
    });

    it('should calculate confidence levels appropriately', () => {
      const config = createMockAdvancedPlanConfig({
        intensity: { easy: 75 }
      });

      const result = resolver.resolveConflicts(config, 'daniels');

      result.resolutions.forEach(resolution => {
        expect(resolution.confidenceLevel).toBeGreaterThanOrEqual(0);
        expect(resolution.confidenceLevel).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Safe Customization Options (Requirement 6.5)', () => {
    it('should provide safe customization options for each methodology', () => {
      const danielsOptions = resolver.getSafeCustomizationOptions('daniels');
      const lydiardOptions = resolver.getSafeCustomizationOptions('lydiard');
      const pfitzingerOptions = resolver.getSafeCustomizationOptions('pfitzinger');

      [danielsOptions, lydiardOptions, pfitzingerOptions].forEach(options => {
        expect(options.allowedModifications).toBeDefined();
        expect(options.restrictions).toBeDefined();
        expect(options.guidelines).toBeDefined();
        expect(options.warningThresholds).toBeDefined();
      });
    });

    it('should specify allowed modification ranges', () => {
      const options = resolver.getSafeCustomizationOptions('daniels');

      const volumeModification = options.allowedModifications.find(
        mod => mod.field === 'weeklyVolume'
      );
      expect(volumeModification).toBeDefined();
      expect(volumeModification!.allowedRange.min).toBeLessThan(0);
      expect(volumeModification!.allowedRange.max).toBeGreaterThan(0);
    });

    it('should provide methodology-specific restrictions', () => {
      const options = resolver.getSafeCustomizationOptions('lydiard');

      expect(options.restrictions.length).toBeGreaterThan(0);
      options.restrictions.forEach(restriction => {
        expect(restriction.methodologyPrinciple).toBeDefined();
        expect(restriction.reason).toBeDefined();
      });
    });

    it('should include implementation guidelines', () => {
      const options = resolver.getSafeCustomizationOptions('pfitzinger');

      expect(options.guidelines.length).toBeGreaterThan(0);
      options.guidelines.forEach(guideline => {
        expect(guideline.examples).toBeDefined();
        expect(guideline.warnings).toBeDefined();
        expect(guideline.examples.length).toBeGreaterThan(0);
      });
    });

    it('should set appropriate warning thresholds', () => {
      const options = resolver.getSafeCustomizationOptions('daniels');

      expect(options.warningThresholds.length).toBeGreaterThan(0);
      options.warningThresholds.forEach(threshold => {
        expect(threshold.severity).toMatch(/critical|high|medium|low/);
        expect(threshold.warning).toBeDefined();
      });
    });
  });

  describe('Methodology Principle Preservation', () => {
    it('should check principle preservation for Daniels methodology', () => {
      const config = createMockAdvancedPlanConfig({
        methodology: 'daniels',
        intensity: { easy: 80, moderate: 15, hard: 4, veryHard: 1 } // Good Daniels distribution
      });

      const preservation = resolver.checkPrinciplePreservation(config, 'daniels');

      expect(preservation.methodology).toBe('daniels');
      expect(preservation.corePrinciples.length).toBeGreaterThan(0);
      expect(preservation.preservationScore).toBeGreaterThan(70);
      expect(preservation.integrityLevel).toMatch(/high|medium|low|compromised/);
    });

    it('should check principle preservation for Lydiard methodology', () => {
      const config = createMockAdvancedPlanConfig({
        methodology: 'lydiard',
        intensity: { easy: 85, moderate: 10, hard: 4, veryHard: 1 } // Good Lydiard distribution
      });

      const preservation = resolver.checkPrinciplePreservation(config, 'lydiard');

      expect(preservation.methodology).toBe('lydiard');
      expect(preservation.preservationScore).toBeGreaterThan(70);
    });

    it('should identify principle violations', () => {
      const config = createMockAdvancedPlanConfig({
        methodology: 'lydiard',
        intensity: { easy: 60, moderate: 20, hard: 15, veryHard: 5 } // Major violations
      });

      const preservation = resolver.checkPrinciplePreservation(config, 'lydiard');

      // Should have lower scores due to violations
      expect(preservation.preservationScore).toBeLessThan(90);
    });

    it('should determine appropriate integrity levels', () => {
      // High integrity config
      const goodConfig = createMockAdvancedPlanConfig({
        methodology: 'daniels',
        intensity: { easy: 80, moderate: 15, hard: 4, veryHard: 1 }
      });

      const goodPreservation = resolver.checkPrinciplePreservation(goodConfig, 'daniels');
      expect(goodPreservation.integrityLevel).toMatch(/high|medium/);

      // Poor integrity config
      const badConfig = createMockAdvancedPlanConfig({
        methodology: 'daniels',
        intensity: { easy: 50, moderate: 25, hard: 20, veryHard: 5 }
      });

      const badPreservation = resolver.checkPrinciplePreservation(badConfig, 'daniels');
      expect(badPreservation.integrityLevel).toMatch(/low|compromised/);
    });

    it('should provide evidence for preserved principles', () => {
      const config = createMockAdvancedPlanConfig({
        methodology: 'daniels'
      });

      const preservation = resolver.checkPrinciplePreservation(config, 'daniels');

      preservation.corePrinciples.forEach(principle => {
        expect(principle.evidence).toBeDefined();
        expect(principle.evidence.length).toBeGreaterThan(0);
        expect(principle.preservationLevel).toBeGreaterThanOrEqual(0);
        expect(principle.preservationLevel).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Safety Assessment', () => {
    it('should assess overall safety correctly', () => {
      const unsafeConfig = createMockAdvancedPlanConfig({
        volume: { weeklyHours: 25 },
        intensity: { hard: 30 }
      });

      const result = resolver.resolveConflicts(unsafeConfig, 'daniels');

      expect(result.overallSafety.overallRisk).toBeGreaterThan(0);
      expect(result.overallSafety.safetyScore).toBeLessThan(100);
      expect(result.overallSafety.recommendedAction).toMatch(/abort|reconsider|modify|proceed/);
    });

    it('should recommend abort for critical safety violations', () => {
      const criticalConfig = createMockAdvancedPlanConfig({
        volume: { weeklyHours: 30 },
        intensity: { hard: 35 }
      });

      const result = resolver.resolveConflicts(criticalConfig, 'daniels');

      expect(result.overallSafety.recommendedAction).toBe('abort');
    });

    it('should recommend proceed for safe configurations', () => {
      const safeConfig = createMockAdvancedPlanConfig({
        methodology: 'daniels',
        intensity: { easy: 80, moderate: 15, hard: 4, veryHard: 1 },
        volume: { progressionRate: 0.08 }
      });

      const result = resolver.resolveConflicts(safeConfig, 'daniels');

      expect(result.overallSafety.recommendedAction).toMatch(/proceed|modify/);
    });

    it('should provide monitoring recommendations', () => {
      const config = createMockAdvancedPlanConfig();

      const result = resolver.resolveConflicts(config, 'daniels');

      expect(result.overallSafety.monitoring).toBeDefined();
      expect(result.overallSafety.monitoring.length).toBeGreaterThan(0);
    });

    it('should identify risk factors', () => {
      const riskyConfig = createMockAdvancedPlanConfig({
        volume: { progressionRate: 0.20 }
      });

      const result = resolver.resolveConflicts(riskyConfig, 'daniels');

      expect(result.overallSafety.riskFactors).toBeDefined();
      expect(result.overallSafety.riskFactors.length).toBeGreaterThan(0);
    });
  });

  describe('Customization Validation', () => {
    it('should validate customizations against methodology principles', () => {
      const customization = {
        intensity: { easy: 85, moderate: 10, hard: 4, veryHard: 1 }
      };

      const validation = resolver.validateCustomization(customization, 'lydiard');

      expect(validation.isValid).toBeDefined();
      expect(validation.errors).toBeDefined();
      expect(validation.warnings).toBeDefined();
    });

    it('should handle partial configurations', () => {
      const partialCustomization = {
        volume: { weeklyHours: 10 }
      };

      const validation = resolver.validateCustomization(partialCustomization, 'daniels');

      expect(validation).toBeDefined();
      expect(typeof validation.isValid).toBe('boolean');
    });

    it('should merge with base configuration', () => {
      const baseConfig = createMockAdvancedPlanConfig();
      const customization = {
        intensity: { easy: 85 }
      };

      const validation = resolver.validateCustomization(customization, 'daniels', baseConfig);

      expect(validation).toBeDefined();
    });
  });

  describe('Integration and Edge Cases', () => {
    it('should handle configurations with no conflicts', () => {
      const perfectConfig = createMockAdvancedPlanConfig({
        methodology: 'daniels',
        intensity: { easy: 80, moderate: 15, hard: 4, veryHard: 1 },
        volume: { progressionRate: 0.08 },
        recovery: { emphasis: 0.8 }
      });

      const result = resolver.resolveConflicts(perfectConfig, 'daniels');

      expect(result.conflicts.length).toBe(0);
      expect(result.resolutions.length).toBe(0);
      expect(result.overallSafety.recommendedAction).toBe('proceed');
    });

    it('should handle multiple methodology types consistently', () => {
      const config = createMockAdvancedPlanConfig();

      const danielsResult = resolver.resolveConflicts(config, 'daniels');
      const lydiardResult = resolver.resolveConflicts(config, 'lydiard');
      const pfitzingerResult = resolver.resolveConflicts(config, 'pfitzinger');

      [danielsResult, lydiardResult, pfitzingerResult].forEach(result => {
        expect(result.conflicts).toBeDefined();
        expect(result.resolutions).toBeDefined();
        expect(result.safeCustomizations).toBeDefined();
        expect(result.overallSafety).toBeDefined();
        expect(result.recommendations).toBeDefined();
      });
    });

    it('should provide meaningful recommendations', () => {
      const config = createMockAdvancedPlanConfig({
        intensity: { easy: 70 }
      });

      const result = resolver.resolveConflicts(config, 'daniels');

      expect(result.recommendations.length).toBeGreaterThan(0);
      result.recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(10);
      });
    });

    it('should handle empty or minimal configurations', () => {
      const minimalConfig = {
        methodology: 'daniels'
      } as AdvancedPlanConfig;

      expect(() => {
        resolver.resolveConflicts(minimalConfig, 'daniels');
      }).not.toThrow();
    });

    it('should maintain performance with complex configurations', () => {
      const complexConfig = createMockAdvancedPlanConfig({
        methodology: 'pfitzinger',
        intensity: { easy: 75, moderate: 15, hard: 9, veryHard: 1 },
        volume: { weeklyHours: 12, progressionRate: 0.12 },
        recovery: { emphasis: 0.75, restDays: 2 }
      });

      const startTime = Date.now();
      const result = resolver.resolveConflicts(complexConfig, 'pfitzinger');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
      expect(result).toBeDefined();
    });
  });

  describe('Methodology-Specific Behavior', () => {
    it('should apply Daniels-specific conflict detection', () => {
      const danielsConfig = createMockAdvancedPlanConfig({
        methodology: 'daniels',
        intensity: { easy: 70 } // Below 80%
      });

      const result = resolver.resolveConflicts(danielsConfig, 'daniels');

      expect(result.conflicts.some(c => 
        c.description.includes('80/20')
      )).toBe(true);
    });

    it('should apply Lydiard-specific conflict detection', () => {
      const lydiardConfig = createMockAdvancedPlanConfig({
        methodology: 'lydiard',
        intensity: { easy: 80 } // Below 85%
      });

      const result = resolver.resolveConflicts(lydiardConfig, 'lydiard');

      expect(result.conflicts.some(c => 
        c.description.includes('85%')
      )).toBe(true);
    });

    it('should provide methodology-specific safe customizations', () => {
      const danielsOptions = resolver.getSafeCustomizationOptions('daniels');
      const lydiardOptions = resolver.getSafeCustomizationOptions('lydiard');

      // Should have methodology-specific restrictions
      expect(danielsOptions.restrictions.some(r => 
        r.methodologyPrinciple.includes('Daniels') || r.methodologyPrinciple.includes('80/20')
      )).toBe(true);

      expect(lydiardOptions.restrictions.some(r => 
        r.methodologyPrinciple.includes('Lydiard') || r.methodologyPrinciple.includes('Aerobic')
      )).toBe(true);
    });
  });
});