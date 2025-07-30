/**
 * Tests for methodology-aware export enhancement system
 */

import { expect, describe, it, beforeEach } from 'vitest';
import {
  MethodologyExportEnhancer,
  EnhancedMethodologyJSONFormatter,
  MethodologyMarkdownFormatter,
  MethodologyExportUtils,
  type MethodologyFormatOptions
} from '../methodology-export-enhancement';
import { MultiFormatExporter } from '../export';
import { AdvancedTrainingPlanGenerator } from '../advanced-generator';
import { createMockAdvancedPlanConfig } from './test-utils';
import type { TrainingPlan, AdvancedPlanConfig, TrainingMethodology } from '../types';

describe('MethodologyExportEnhancer', () => {
  let testPlan: TrainingPlan;
  let generator: AdvancedTrainingPlanGenerator;

  beforeEach(async () => {
    const config = createMockAdvancedPlanConfig({
      methodology: 'daniels' as TrainingMethodology,
      name: 'Test Daniels Plan',
      description: 'VDOT-based training plan'
    });
    generator = new AdvancedTrainingPlanGenerator(config);
    testPlan = generator.generateAdvancedPlan();
  });

  describe('extractMethodologyInfo', () => {
    it('should extract methodology information from plan', () => {
      const info = MethodologyExportEnhancer.extractMethodologyInfo(testPlan);
      
      expect(info.methodology).toBe('daniels');
      expect(info.philosophy).toBeDefined();
      expect(info.philosophy?.name).toBe('Jack Daniels');
      expect(info.principles).toBeDefined();
      expect(info.principles?.corePhilosophy).toContain('VDOT');
      expect(info.citations).toBeDefined();
      expect(info.citations?.length).toBeGreaterThan(0);
    });

    it('should handle plans without methodology info', () => {
      // Create plan without methodology
      const basicConfig = createMockAdvancedPlanConfig({
        name: 'Basic Plan'
      });
      delete (basicConfig as any).methodology;
      
      const basicPlan: TrainingPlan = {
        id: 'test-basic',
        config: basicConfig,
        workouts: [],
        blocks: [],
        summary: { totalDistance: 0, totalDuration: 0, weeklyAverages: { distance: 0, duration: 0 } }
      };

      const info = MethodologyExportEnhancer.extractMethodologyInfo(basicPlan);
      
      expect(info.methodology).toBeUndefined();
      expect(info.philosophy).toBeUndefined();
      expect(info.principles).toBeUndefined();
      expect(info.citations).toBeUndefined();
    });
  });

  describe('generateMethodologyMetadata', () => {
    it('should generate enhanced metadata with methodology info', () => {
      const content = 'test content';
      const metadata = MethodologyExportEnhancer.generateMethodologyMetadata(
        testPlan,
        'json',
        content
      );

      expect(metadata.methodology).toBe('daniels');
      expect(metadata.philosophyName).toBe('Jack Daniels');
      expect(metadata.intensityDistribution).toBeDefined();
      expect(metadata.keyPrinciples).toBeDefined();
      expect(metadata.researchCitations).toBeDefined();
      expect(metadata.philosophyDescription).toContain('VDOT');
      expect(metadata.coachBackground).toContain('Jack Daniels');
      expect(metadata.fileSize).toBe(Buffer.byteLength(content, 'utf8'));
    });
  });

  describe('generateMethodologyDocumentation', () => {
    it('should generate comprehensive methodology documentation', () => {
      const documentation = MethodologyExportEnhancer.generateMethodologyDocumentation(testPlan, {
        detailLevel: 'comprehensive',
        includePhilosophyPrinciples: true,
        includeResearchCitations: true
      });

      expect(documentation).toContain('Training Philosophy: Jack Daniels');
      expect(documentation).toContain('VDOT');
      expect(documentation).toContain('Key Principles');
      expect(documentation).toContain('Intensity Distribution');
      expect(documentation).toContain('Methodology Analysis');
      expect(documentation).toContain('Research & References');
      expect(documentation).toContain('80% easy');
      expect(documentation).toContain('Daniels\' Running Formula');
    });

    it('should generate basic documentation when requested', () => {
      const documentation = MethodologyExportEnhancer.generateMethodologyDocumentation(testPlan, {
        detailLevel: 'basic',
        includePhilosophyPrinciples: true,
        includeResearchCitations: false
      });

      expect(documentation).toContain('Training Philosophy: Jack Daniels');
      expect(documentation).toContain('Key Principles');
      expect(documentation).toContain('Intensity Distribution');
      expect(documentation).not.toContain('Methodology Analysis');
      expect(documentation).not.toContain('Research & References');
    });

    it('should handle plans without methodology gracefully', () => {
      const basicConfig = createMockAdvancedPlanConfig({ name: 'Basic Plan' });
      delete (basicConfig as any).methodology;
      
      const basicPlan: TrainingPlan = {
        id: 'test-basic',
        config: basicConfig,
        workouts: [],
        blocks: [],
        summary: { totalDistance: 0, totalDuration: 0, weeklyAverages: { distance: 0, duration: 0 } }
      };

      const documentation = MethodologyExportEnhancer.generateMethodologyDocumentation(basicPlan);
      expect(documentation).toBe('');
    });
  });

  describe('generateWorkoutRationale', () => {
    it('should generate Daniels-specific workout rationale', () => {
      const workout = testPlan.workouts[0];
      if (workout) {
        const rationale = MethodologyExportEnhancer.generateWorkoutRationale(
          workout,
          'daniels',
          'base'
        );

        expect(rationale).toBeTruthy();
        expect(rationale.length).toBeGreaterThan(10);
        // Should contain methodology-specific language
        expect(rationale.toLowerCase()).toMatch(/(aerobic|capacity|threshold|economy)/);
      }
    });

    it('should generate different rationales for different methodologies', () => {
      const workout = testPlan.workouts[0];
      if (workout) {
        const danielsRationale = MethodologyExportEnhancer.generateWorkoutRationale(
          workout,
          'daniels',
          'base'
        );
        
        const lydiardRationale = MethodologyExportEnhancer.generateWorkoutRationale(
          workout,
          'lydiard',
          'base'
        );

        expect(danielsRationale).not.toBe(lydiardRationale);
        expect(lydiardRationale).toContain('aerobic');
      }
    });
  });

  describe('generateMethodologyComparison', () => {
    it('should generate methodology comparison information', () => {
      const comparison = MethodologyExportEnhancer.generateMethodologyComparison('daniels', {
        includeMethodologyComparison: true
      });

      expect(comparison).toContain('Methodology Comparison');
      expect(comparison).toContain('Jack Daniels');
      expect(comparison).toContain('Arthur Lydiard');
      expect(comparison).toContain('Pete Pfitzinger');
      expect(comparison).toContain('Intensity:');
    });

    it('should return empty string when comparison not requested', () => {
      const comparison = MethodologyExportEnhancer.generateMethodologyComparison('daniels', {
        includeMethodologyComparison: false
      });

      expect(comparison).toBe('');
    });
  });
});

describe('EnhancedMethodologyJSONFormatter', () => {
  let formatter: EnhancedMethodologyJSONFormatter;
  let testPlan: TrainingPlan;

  beforeEach(async () => {
    formatter = new EnhancedMethodologyJSONFormatter();
    const config = createMockAdvancedPlanConfig({
      methodology: 'daniels' as TrainingMethodology,
      name: 'Test Enhanced Export'
    });
    const generator = new AdvancedTrainingPlanGenerator(config);
    testPlan = generator.generateAdvancedPlan();
  });

  it('should format plan with methodology information', async () => {
    const result = await formatter.formatPlan(testPlan, {
      includePhilosophyPrinciples: true,
      includeResearchCitations: true,
      includeWorkoutRationale: true
    });

    expect(result.content).toBeDefined();
    expect(result.filename).toContain('enhanced');
    expect(result.metadata.methodology).toBe('daniels');
    expect(result.philosophyData).toBeDefined();
    expect(result.citations).toBeDefined();

    // Parse and validate JSON content
    const jsonData = JSON.parse(result.content as string);
    expect(jsonData.methodology).toBeDefined();
    expect(jsonData.methodology.name).toBe('daniels');
    expect(jsonData.methodology.philosophyName).toBe('Jack Daniels');
    expect(jsonData.methodology.principles).toBeDefined();
    expect(jsonData.methodology.citations).toBeDefined();
    expect(jsonData.exportInfo.enhanced).toBe(true);
  });

  it('should include workout rationale when requested', async () => {
    const result = await formatter.formatPlan(testPlan, {
      includeWorkoutRationale: true
    });

    const jsonData = JSON.parse(result.content as string);
    const workoutsWithRationale = jsonData.workouts.filter((w: any) => w.rationale);
    expect(workoutsWithRationale.length).toBeGreaterThan(0);
  });

  it('should exclude optional fields when not requested', async () => {
    const result = await formatter.formatPlan(testPlan, {
      includePhilosophyPrinciples: false,
      includeResearchCitations: false,
      includeWorkoutRationale: false
    });

    const jsonData = JSON.parse(result.content as string);
    expect(jsonData.methodology.principles).toBeUndefined();
    expect(jsonData.methodology.citations).toBeUndefined();
    
    const workoutsWithRationale = jsonData.workouts.filter((w: any) => w.rationale);
    expect(workoutsWithRationale.length).toBe(0);
  });
});

describe('MethodologyMarkdownFormatter', () => {
  let formatter: MethodologyMarkdownFormatter;
  let testPlan: TrainingPlan;

  beforeEach(async () => {
    formatter = new MethodologyMarkdownFormatter();
    const config = createMockAdvancedPlanConfig({
      methodology: 'pfitzinger' as TrainingMethodology,
      name: 'Test Markdown Export'
    });
    const generator = new AdvancedTrainingPlanGenerator(config);
    testPlan = generator.generateAdvancedPlan();
  });

  it('should format plan as markdown with methodology documentation', async () => {
    const result = await formatter.formatPlan(testPlan, {
      detailLevel: 'comprehensive',
      includePhilosophyPrinciples: true,
      includeResearchCitations: true
    });

    const content = result.content as string;
    
    expect(content).toContain('# Training Philosophy: Pete Pfitzinger');
    expect(content).toContain('# Training Plan: Test Markdown Export');
    expect(content).toContain('## Key Principles');
    expect(content).toContain('## Intensity Distribution');
    expect(content).toContain('## Workout Schedule');
    expect(content).toContain('lactate threshold');
    expect(result.filename).toContain('methodology.md');
  });

  it('should include workout rationale in markdown format', async () => {
    const result = await formatter.formatPlan(testPlan, {
      includeWorkoutRationale: true
    });

    const content = result.content as string;
    expect(content).toContain('- Rationale:');
  });

  it('should include methodology comparison when requested', async () => {
    const result = await formatter.formatPlan(testPlan, {
      includeMethodologyComparison: true
    });

    const content = result.content as string;
    expect(content).toContain('## Methodology Comparison');
    expect(content).toContain('Pete Pfitzinger');
  });
});

describe('MultiFormatExporter integration', () => {
  let exporter: MultiFormatExporter;
  let testPlan: TrainingPlan;

  beforeEach(async () => {
    exporter = new MultiFormatExporter();
    const config = createMockAdvancedPlanConfig({
      methodology: 'lydiard' as TrainingMethodology,
      name: 'Test Integration Export'
    });
    const generator = new AdvancedTrainingPlanGenerator(config);
    testPlan = generator.generateAdvancedPlan();
  });

  it('should export with methodology awareness when requested', async () => {
    const result = await exporter.exportPlanWithMethodology(testPlan, 'json', {
      enhancedExport: true,
      includePhilosophyPrinciples: true,
      includeResearchCitations: true
    });

    // Should return MethodologyExportResult
    expect(result.metadata.methodology).toBe('lydiard');
    expect('philosophyData' in result).toBe(true);
    expect('citations' in result).toBe(true);
  });

  it('should fall back to standard export when enhancement not requested', async () => {
    const result = await exporter.exportPlanWithMethodology(testPlan, 'json', {
      enhancedExport: false
    });

    // Should return standard ExportResult (no methodology-specific fields)
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.metadata).toBeDefined();
    
    // Should not have enhanced fields or should have them as undefined
    if ('philosophyData' in result) {
      expect((result as any).philosophyData).toBeUndefined();
    }
    if ('citations' in result) {
      expect((result as any).citations).toBeUndefined();
    }
  });

  it('should enhance standard formats with methodology info', async () => {
    const result = await exporter.exportPlanWithMethodology(testPlan, 'csv', {
      enhancedExport: true,
      includePhilosophyPrinciples: true
    });

    // CSV content should be enhanced with methodology documentation
    expect(typeof result.content).toBe('string');
    if (typeof result.content === 'string') {
      expect(result.content).toContain('Arthur Lydiard');
      expect(result.content).toContain('aerobic base');
    }
  });

  it('should work with all supported methodology-aware formats', async () => {
    const formats: Array<'json' | 'markdown'> = ['json', 'markdown'];
    
    for (const format of formats) {
      const result = await exporter.exportPlanWithMethodology(testPlan, format, {
        enhancedExport: true
      });
      
      expect(result).toBeDefined();
      expect(result.metadata.methodology).toBe('lydiard');
      expect('philosophyData' in result).toBe(true);
    }
  });
});

describe('MethodologyExportUtils', () => {
  let testPlan: TrainingPlan;

  beforeEach(async () => {
    const config = createMockAdvancedPlanConfig({
      methodology: 'daniels' as TrainingMethodology,
      name: 'Test Utils Export'
    });
    const generator = new AdvancedTrainingPlanGenerator(config);
    testPlan = generator.generateAdvancedPlan();
  });

  it('should provide utility functions for methodology extraction', () => {
    const info = MethodologyExportUtils.extractMethodologyInfo(testPlan);
    expect(info.methodology).toBe('daniels');
    expect(info.philosophy).toBeDefined();
  });

  it('should provide utility functions for documentation generation', () => {
    const documentation = MethodologyExportUtils.generateMethodologyDocumentation(testPlan);
    expect(documentation).toContain('Jack Daniels');
    expect(documentation).toContain('VDOT');
  });

  it('should provide utility functions for workout rationale', () => {
    const workout = testPlan.workouts[0];
    if (workout) {
      const rationale = MethodologyExportUtils.generateWorkoutRationale(
        workout,
        'daniels',
        'base'
      );
      expect(rationale).toContain('aerobic');
    }
  });

  it('should provide utility functions for methodology comparison', () => {
    const comparison = MethodologyExportUtils.generateMethodologyComparison('daniels', {
      includeMethodologyComparison: true
    });
    expect(comparison).toContain('Jack Daniels');
  });

  it('should provide utility functions for metadata generation', () => {
    const metadata = MethodologyExportUtils.generateMethodologyMetadata(
      testPlan,
      'json',
      'test content'
    );
    expect(metadata.methodology).toBe('daniels');
    expect(metadata.philosophyName).toBe('Jack Daniels');
  });
});

describe('Philosophy-specific export features', () => {
  it('should generate Daniels-specific export content', async () => {
    const config = createMockAdvancedPlanConfig({
      methodology: 'daniels' as TrainingMethodology
    });
    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = generator.generateAdvancedPlan();

    const documentation = MethodologyExportEnhancer.generateMethodologyDocumentation(plan, {
      detailLevel: 'comprehensive'
    });

    expect(documentation).toContain('VDOT');
    expect(documentation).toContain('80% easy running');
    expect(documentation).toContain('Scientific precision');
    expect(documentation).toContain('Track and road race specialists');
  });

  it('should generate Lydiard-specific export content', async () => {
    const config = createMockAdvancedPlanConfig({
      methodology: 'lydiard' as TrainingMethodology
    });
    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = generator.generateAdvancedPlan();

    const documentation = MethodologyExportEnhancer.generateMethodologyDocumentation(plan, {
      detailLevel: 'comprehensive'
    });

    expect(documentation).toContain('aerobic base');
    expect(documentation).toContain('85%+ easy running');
    expect(documentation).toContain('Hill training');
    expect(documentation).toContain('Marathon and ultra-distance');
  });

  it('should generate Pfitzinger-specific export content', async () => {
    const config = createMockAdvancedPlanConfig({
      methodology: 'pfitzinger' as TrainingMethodology
    });
    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = generator.generateAdvancedPlan();

    const documentation = MethodologyExportEnhancer.generateMethodologyDocumentation(plan, {
      detailLevel: 'comprehensive'
    });

    expect(documentation).toContain('lactate threshold');
    expect(documentation).toContain('medium-long runs');
    expect(documentation).toContain('threshold development');
    expect(documentation).toContain('Marathon and half-marathon');
  });
});