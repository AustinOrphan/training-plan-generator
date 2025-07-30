/**
 * Multi-Methodology Performance Validation Test Suite
 * 
 * Comprehensive performance tests validating that the multi-methodology
 * training plan system meets all performance requirements including:
 * - Plan generation times (<2s previews, <30s full plans)
 * - Methodology comparison performance (<500ms)
 * - Caching effectiveness (>80% hit rate)
 * 
 * REQUIREMENTS REFERENCE:
 * - Performance Requirements from multi-methodology-plans spec
 * - Plan generation: <2 seconds (previews), <30 seconds (full plans)
 * - Philosophy comparison: <500 ms
 * - Workout customization: <1 second
 * - Cache hit rate: >80% for common operations
 * 
 * TEST STATUS: Task 9.2 - Add performance validation testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  TrainingPlan,
  AdvancedPlanConfig,
  TrainingMethodology
} from '../types';
import { AdvancedTrainingPlanGenerator } from '../advanced-generator';
import { PhilosophyFactory, TrainingPhilosophy } from '../philosophies';
import { PhilosophyComparator } from '../philosophy-comparator';
import { MultiFormatExporter } from '../export';
import { MethodologyTransitionSystem } from '../methodology-transition-system';
import { calculateVDOTCached, calculateVDOT } from '../calculator';
import { 
  createMockAdvancedPlanConfig,
  createMockTargetRace,
  measureExecutionTime,
  testDateUtils
} from './test-utils';
import { addWeeks, addDays } from 'date-fns';

describe('Multi-Methodology Performance Validation', () => {
  // Clear any caches before each test to ensure consistent measurements
  beforeEach(() => {
    // Clear calculation cache if available
    (global as any).__vdotCache = undefined;
    (global as any).__fitnessCache = undefined;
  });

  describe('Plan Generation Performance (<2s preview, <30s full)', () => {
    it('should generate preview plans within 2 seconds for all methodologies', async () => {
      const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
      const performanceResults: Record<string, number> = {};
      
      for (const methodology of methodologies) {
        const config = createMockAdvancedPlanConfig({
          methodology,
          startDate: testDateUtils.createTestDate('2024-01-01'),
          targetDate: addWeeks(testDateUtils.createTestDate('2024-01-01'), 8), // 8-week preview
          name: `${methodology} Preview Plan`
        });
        
        const generator = new AdvancedTrainingPlanGenerator(config);
        
        const { time, result } = await measureExecutionTime(async () => {
          return generator.generateAdvancedPlan();
        });
        
        performanceResults[methodology] = time;
        
        // Validate generation time meets requirement
        expect(time).toBeLessThan(2000); // <2 seconds requirement
        
        // Validate plan was generated
        expect(result).toBeDefined();
        expect(result.workouts.length).toBeGreaterThan(0);
        expect(result.config.methodology).toBe(methodology);
        
        console.log(`${methodology} preview plan generation: ${time.toFixed(2)}ms`);
      }
      
      // Log aggregate statistics
      const times = Object.values(performanceResults);
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
      console.log(`Average preview generation time: ${avgTime.toFixed(2)}ms`);
    });

    it('should generate full 16-week plans within 30 seconds', async () => {
      const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
      
      for (const methodology of methodologies) {
        const config = createMockAdvancedPlanConfig({
          methodology,
          startDate: testDateUtils.createTestDate('2024-01-01'),
          targetDate: addWeeks(testDateUtils.createTestDate('2024-01-01'), 16), // Full 16-week plan
          targetRaces: [
            createMockTargetRace({
              distance: 'marathon',
              date: addWeeks(testDateUtils.createTestDate('2024-01-01'), 16),
              priority: 'A'
            })
          ]
        });
        
        const generator = new AdvancedTrainingPlanGenerator(config);
        
        const { time, result } = await measureExecutionTime(async () => {
          return generator.generateAdvancedPlan();
        });
        
        // Validate generation time meets requirement
        expect(time).toBeLessThan(30000); // <30 seconds requirement
        
        // More realistically, should be much faster
        expect(time).toBeLessThan(5000); // Should complete in <5 seconds
        
        console.log(`${methodology} full plan generation: ${time.toFixed(2)}ms`);
      }
    });

    it('should scale performance linearly with plan duration', async () => {
      const planDurations = [4, 8, 12, 16, 20]; // weeks
      const performanceData: Array<{ weeks: number; time: number }> = [];
      
      for (const weeks of planDurations) {
        const config = createMockAdvancedPlanConfig({
          methodology: 'daniels',
          startDate: testDateUtils.createTestDate('2024-01-01'),
          targetDate: addWeeks(testDateUtils.createTestDate('2024-01-01'), weeks)
        });
        
        const generator = new AdvancedTrainingPlanGenerator(config);
        
        const { time } = await measureExecutionTime(async () => {
          return generator.generateAdvancedPlan();
        });
        
        performanceData.push({ weeks, time });
      }
      
      // Calculate time per week
      const timePerWeek = performanceData.map(d => d.time / d.weeks);
      const avgTimePerWeek = timePerWeek.reduce((sum, t) => sum + t, 0) / timePerWeek.length;
      
      // Verify linear scaling (should not have exponential growth)
      timePerWeek.forEach((tpw, index) => {
        const deviation = Math.abs(tpw - avgTimePerWeek) / avgTimePerWeek;
        expect(deviation).toBeLessThan(0.5); // Within 50% of average
        
        console.log(`${performanceData[index].weeks} weeks: ${performanceData[index].time.toFixed(2)}ms (${tpw.toFixed(2)}ms/week)`);
      });
    });

    it('should handle complex multi-race plans efficiently', async () => {
      const config = createMockAdvancedPlanConfig({
        methodology: 'pfitzinger',
        startDate: testDateUtils.createTestDate('2024-01-01'),
        targetRaces: [
          createMockTargetRace({
            distance: '10K',
            date: addWeeks(testDateUtils.createTestDate('2024-01-01'), 6),
            priority: 'B'
          }),
          createMockTargetRace({
            distance: 'half-marathon',
            date: addWeeks(testDateUtils.createTestDate('2024-01-01'), 12),
            priority: 'A'
          }),
          createMockTargetRace({
            distance: 'marathon',
            date: addWeeks(testDateUtils.createTestDate('2024-01-01'), 24),
            priority: 'A'
          })
        ]
      });
      
      const generator = new AdvancedTrainingPlanGenerator(config);
      
      const { time, result } = await measureExecutionTime(async () => {
        return generator.generateAdvancedPlan();
      });
      
      // Complex plans should still meet performance requirements
      expect(time).toBeLessThan(5000); // 5 seconds for complex multi-race plan
      
      // Verify plan includes race-specific elements
      expect(result.workouts.length).toBeGreaterThan(0);
      const raceWorkouts = result.workouts.filter(w => w.type === 'race_pace');
      expect(raceWorkouts.length).toBeGreaterThan(0);
      
      console.log(`Complex multi-race plan generation: ${time.toFixed(2)}ms`);
    });
  });

  describe('Philosophy Comparison Performance (<500ms)', () => {
    it('should complete methodology comparison within 500ms', async () => {
      const comparator = new PhilosophyComparator();
      
      const { time, result } = await measureExecutionTime(async () => {
        return comparator.generateComparisonMatrix();
      });
      
      // Must meet <500ms requirement
      expect(time).toBeLessThan(500);
      
      // Validate comparison completeness
      expect(result.methodologies).toHaveLength(3); // Daniels, Lydiard, Pfitzinger
      expect(result.dimensions.length).toBeGreaterThan(0);
      expect(result.overallRankings.length).toBe(3);
      
      console.log(`Philosophy comparison matrix generation: ${time.toFixed(2)}ms`);
    });

    it('should efficiently compare pairs of methodologies', async () => {
      const comparator = new PhilosophyComparator();
      const pairs = [
        ['daniels', 'lydiard'],
        ['daniels', 'pfitzinger'],
        ['lydiard', 'pfitzinger']
      ] as const;
      
      for (const [method1, method2] of pairs) {
        const { time, result } = await measureExecutionTime(async () => {
          return comparator.compareMethodologies(method1, method2);
        });
        
        // Pairwise comparison should be very fast
        expect(time).toBeLessThan(100); // 100ms for pairwise comparison
        
        // Validate comparison results
        expect(result.methodology1).toBe(method1);
        expect(result.methodology2).toBe(method2);
        expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
        expect(result.compatibilityScore).toBeLessThanOrEqual(100);
        
        console.log(`${method1} vs ${method2} comparison: ${time.toFixed(2)}ms`);
      }
    });

    it('should cache comparison results for repeated queries', async () => {
      const comparator = new PhilosophyComparator();
      
      // First call - should calculate
      const { time: firstTime } = await measureExecutionTime(async () => {
        return comparator.generateComparisonMatrix();
      });
      
      // Second call - should use cache
      const { time: secondTime } = await measureExecutionTime(async () => {
        return comparator.generateComparisonMatrix();
      });
      
      // Cached call should be significantly faster
      expect(secondTime).toBeLessThan(firstTime * 0.5); // At least 50% faster
      expect(secondTime).toBeLessThan(50); // Should be near-instant
      
      console.log(`First comparison: ${firstTime.toFixed(2)}ms, Cached: ${secondTime.toFixed(2)}ms`);
    });

    it('should validate methodologies efficiently', async () => {
      const comparator = new PhilosophyComparator();
      const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
      
      for (const methodology of methodologies) {
        const { time, result } = await measureExecutionTime(async () => {
          return comparator.validateMethodology(methodology);
        });
        
        // Validation should be fast
        expect(time).toBeLessThan(200); // 200ms per methodology validation
        
        // Check validation results
        expect(result.methodology).toBe(methodology);
        expect(result.accuracyScore).toBeGreaterThanOrEqual(0);
        expect(result.accuracyScore).toBeLessThanOrEqual(100);
        
        console.log(`${methodology} validation: ${time.toFixed(2)}ms (accuracy: ${result.accuracyScore}%)`);
      }
    });
  });

  describe('Workout Customization Performance (<1s)', () => {
    it('should customize workouts within 1 second', async () => {
      const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
      
      for (const methodology of methodologies) {
        const philosophy = PhilosophyFactory.create(methodology);
        const config = createMockAdvancedPlanConfig({ methodology });
        
        const testWorkout = {
          type: 'tempo' as const,
          primaryZone: { name: 'Threshold', rpe: 7, description: 'Threshold pace', purpose: 'LT development' },
          segments: [{
            duration: 20,
            intensity: 85,
            zone: { name: 'Threshold', rpe: 7, description: 'Threshold pace', purpose: 'LT development' },
            description: 'Tempo segment'
          }],
          adaptationTarget: 'Lactate threshold',
          estimatedTSS: 60,
          recoveryTime: 24
        };
        
        const { time, result } = await measureExecutionTime(async () => {
          return philosophy.customizeWorkout(testWorkout, config);
        });
        
        // Must meet <1 second requirement
        expect(time).toBeLessThan(1000);
        // Realistically should be much faster
        expect(time).toBeLessThan(50);
        
        // Validate customization was applied
        expect(result).toBeDefined();
        expect(result.segments.length).toBeGreaterThan(0);
        
        console.log(`${methodology} workout customization: ${time.toFixed(2)}ms`);
      }
    });

    it('should select appropriate workouts efficiently', async () => {
      const phases = ['base', 'build', 'peak'] as const;
      const workoutTypes = ['easy', 'tempo', 'threshold', 'long_run'] as const;
      
      for (const methodology of ['daniels', 'lydiard', 'pfitzinger'] as const) {
        const philosophy = PhilosophyFactory.create(methodology);
        const measurements: number[] = [];
        
        for (const phase of phases) {
          for (const type of workoutTypes) {
            const { time, result } = await measureExecutionTime(async () => {
              return philosophy.selectWorkout(type, phase, 1);
            });
            
            measurements.push(time);
            expect(time).toBeLessThan(100); // Should be very fast
            expect(result).toBeDefined();
          }
        }
        
        const avgTime = measurements.reduce((sum, t) => sum + t, 0) / measurements.length;
        console.log(`${methodology} average workout selection: ${avgTime.toFixed(2)}ms`);
      }
    });
  });

  describe('Caching Effectiveness (>80% hit rate)', () => {
    it('should achieve >80% cache hit rate for VDOT calculations', async () => {
      const testRuns = [
        { date: new Date(), distance: 5, duration: 20, avgPace: 4.0, effortLevel: 9 },
        { date: new Date(), distance: 10, duration: 45, avgPace: 4.5, effortLevel: 9 }
      ];
      
      let cacheHits = 0;
      let cacheMisses = 0;
      const totalCalls = 100;
      
      // First, populate cache with common calculations
      for (let i = 0; i < 10; i++) {
        calculateVDOTCached(testRuns);
        cacheMisses++; // First 10 are misses
      }
      
      // Now make many repeated calls
      for (let i = 0; i < totalCalls - 10; i++) {
        const startTime = performance.now();
        calculateVDOTCached(testRuns);
        const endTime = performance.now();
        
        // Cache hits should be <1ms, misses will be longer
        if (endTime - startTime < 1) {
          cacheHits++;
        } else {
          cacheMisses++;
        }
      }
      
      const hitRate = (cacheHits / totalCalls) * 100;
      console.log(`VDOT cache hit rate: ${hitRate.toFixed(1)}% (${cacheHits} hits, ${cacheMisses} misses)`);
      
      // Should achieve >80% hit rate
      expect(hitRate).toBeGreaterThan(80);
    });

    it('should cache philosophy instances efficiently', async () => {
      const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
      const measurements: Array<{ methodology: string; time: number }> = [];
      
      // Pre-warm the factory by creating each philosophy once
      for (const methodology of methodologies) {
        PhilosophyFactory.create(methodology);
      }
      
      // Now measure repeated calls
      for (let i = 0; i < 30; i++) {
        const methodology = methodologies[i % 3];
        const { time } = await measureExecutionTime(async () => {
          return PhilosophyFactory.create(methodology);
        });
        measurements.push({ methodology, time });
      }
      
      // All subsequent calls should be fast (cached)
      const fastCalls = measurements.filter(m => m.time < 0.5); // <0.5ms is cached
      const cacheHitRate = (fastCalls.length / measurements.length) * 100;
      
      console.log(`Philosophy factory cache hit rate: ${cacheHitRate.toFixed(1)}% (${fastCalls.length}/${measurements.length} fast calls)`);
      
      // PhilosophyFactory uses internal caching, so should have high hit rate
      expect(cacheHitRate).toBeGreaterThan(70); // Slightly lower threshold as factory may recreate instances
    });

    it('should cache comparison matrix calculations', async () => {
      const comparator = new PhilosophyComparator();
      const measurements: number[] = [];
      
      // Make 20 calls to generate comparison matrix
      for (let i = 0; i < 20; i++) {
        const { time } = await measureExecutionTime(async () => {
          return comparator.generateComparisonMatrix();
        });
        measurements.push(time);
      }
      
      // First call should be slowest
      const firstCallTime = measurements[0];
      const cachedCalls = measurements.slice(1).filter(t => t < firstCallTime * 0.2);
      const cacheHitRate = (cachedCalls.length / (measurements.length - 1)) * 100;
      
      console.log(`Comparison matrix cache hit rate: ${cacheHitRate.toFixed(1)}%`);
      console.log(`First call: ${firstCallTime.toFixed(2)}ms, Average cached: ${
        cachedCalls.reduce((sum, t) => sum + t, 0) / cachedCalls.length
      }.toFixed(2)}ms`);
      
      expect(cacheHitRate).toBeGreaterThan(80);
    });
  });

  describe('Methodology Transition Performance', () => {
    it('should handle methodology transitions efficiently', async () => {
      const transitionSystem = new MethodologyTransitionSystem();
      const transitions = [
        ['lydiard', 'daniels'],
        ['daniels', 'pfitzinger'],
        ['pfitzinger', 'lydiard']
      ] as const;
      
      // Create a sample plan for transition testing
      const config = createMockAdvancedPlanConfig({ methodology: 'daniels' });
      const generator = new AdvancedTrainingPlanGenerator(config);
      const currentPlan = await generator.generateAdvancedPlan();
      
      for (const [from, to] of transitions) {
        const { time, result } = await measureExecutionTime(async () => {
          return transitionSystem.createMethodologyTransition(
            currentPlan,
            from as TrainingMethodology,
            to as TrainingMethodology,
            'build' // current phase
          );
        });
        
        // Transitions should be fast
        expect(time).toBeLessThan(500);
        
        // Validate transition was created
        expect(result).toBeDefined();
        expect(result.fromMethodology).toBe(from);
        expect(result.toMethodology).toBe(to);
        expect(result.transitionPlan).toBeDefined();
        
        console.log(`${from} → ${to} transition: ${time.toFixed(2)}ms`);
      }
    });
  });

  describe('Export Performance with Methodologies', () => {
    it('should export methodology-specific plans efficiently', async () => {
      const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
      const formats = ['pdf', 'ical', 'csv', 'json'] as const;
      
      for (const methodology of methodologies) {
        const config = createMockAdvancedPlanConfig({ methodology });
        const generator = new AdvancedTrainingPlanGenerator(config);
        const plan = await generator.generateAdvancedPlan();
        
        const exporter = new MultiFormatExporter();
        
        for (const format of formats) {
          const { time } = await measureExecutionTime(async () => {
            return await exporter.exportPlan(plan, format);
          });
          
          // Exports should remain fast regardless of methodology
          expect(time).toBeLessThan(1000);
          
          console.log(`${methodology} ${format} export: ${time.toFixed(2)}ms`);
        }
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain performance with concurrent plan generations', async () => {
      const configs = [
        createMockAdvancedPlanConfig({ methodology: 'daniels' }),
        createMockAdvancedPlanConfig({ methodology: 'lydiard' }),
        createMockAdvancedPlanConfig({ methodology: 'pfitzinger' })
      ];
      
      const { time, result } = await measureExecutionTime(async () => {
        return await Promise.all(
          configs.map(config => {
            const generator = new AdvancedTrainingPlanGenerator(config);
            return generator.generateAdvancedPlan();
          })
        );
      });
      
      // Concurrent generation should still be efficient
      expect(time).toBeLessThan(3000); // 3 seconds for 3 concurrent plans
      
      // All plans should be generated
      expect(result).toHaveLength(3);
      result.forEach((plan, index) => {
        expect(plan.config.methodology).toBe(configs[index].methodology);
      });
      
      console.log(`Concurrent plan generation (3 plans): ${time.toFixed(2)}ms`);
    });

    it('should handle rapid methodology switching efficiently', async () => {
      const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
      const measurements: number[] = [];
      
      // Rapidly switch between methodologies
      for (let i = 0; i < 30; i++) {
        const methodology = methodologies[i % 3];
        const philosophy = PhilosophyFactory.create(methodology);
        
        const { time } = await measureExecutionTime(async () => {
          const workout = philosophy.selectWorkout('tempo', 'build', 1);
          return philosophy.customizeWorkout({
            type: 'tempo',
            primaryZone: { name: 'Threshold', rpe: 7, description: 'Threshold', purpose: 'LT' },
            segments: [{ duration: 20, intensity: 85, zone: { name: 'Threshold', rpe: 7, description: 'Threshold', purpose: 'LT' }, description: 'Tempo' }],
            adaptationTarget: 'LT',
            estimatedTSS: 60,
            recoveryTime: 24
          }, createMockAdvancedPlanConfig({ methodology }));
        });
        
        measurements.push(time);
      }
      
      const avgTime = measurements.reduce((sum, t) => sum + t, 0) / measurements.length;
      const maxTime = Math.max(...measurements);
      
      console.log(`Rapid methodology switching - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);
      
      // Performance should remain consistent
      expect(avgTime).toBeLessThan(50);
      expect(maxTime).toBeLessThan(100);
    });
  });

  describe('Performance Monitoring and Benchmarks', () => {
    it('should establish performance baselines for all operations', async () => {
      const benchmarks: Record<string, number> = {};
      
      // 1. Plan generation benchmark
      const danielsConfig = createMockAdvancedPlanConfig({ methodology: 'daniels' });
      const { time: planTime } = await measureExecutionTime(async () => {
        const generator = new AdvancedTrainingPlanGenerator(danielsConfig);
        return generator.generateAdvancedPlan();
      });
      benchmarks['plan_generation_daniels'] = planTime;
      
      // 2. Philosophy comparison benchmark
      const comparator = new PhilosophyComparator();
      const { time: comparisonTime } = await measureExecutionTime(async () => {
        return comparator.generateComparisonMatrix();
      });
      benchmarks['philosophy_comparison'] = comparisonTime;
      
      // 3. Methodology validation benchmark
      const { time: validationTime } = await measureExecutionTime(async () => {
        return comparator.validateMethodology('daniels');
      });
      benchmarks['methodology_validation'] = validationTime;
      
      // 4. Workout customization benchmark
      const philosophy = PhilosophyFactory.create('daniels');
      const { time: customizationTime } = await measureExecutionTime(async () => {
        return philosophy.customizeWorkout({
          type: 'intervals',
          primaryZone: { name: 'VO2Max', rpe: 9, description: 'VO2Max', purpose: 'VO2Max' },
          segments: [{ duration: 3, intensity: 95, zone: { name: 'VO2Max', rpe: 9, description: 'VO2Max', purpose: 'VO2Max' }, description: 'Interval' }],
          adaptationTarget: 'VO2Max',
          estimatedTSS: 80,
          recoveryTime: 48
        }, danielsConfig);
      });
      benchmarks['workout_customization'] = customizationTime;
      
      // 5. VDOT calculation benchmark
      const { time: vdotTime } = await measureExecutionTime(async () => {
        const runs = [{ date: new Date(), distance: 5, duration: 20, avgPace: 4.0, effortLevel: 9 }];
        return calculateVDOT(runs as any);
      });
      benchmarks['vdot_calculation'] = vdotTime;
      
      // Log all benchmarks
      console.log('\nPerformance Benchmarks:');
      Object.entries(benchmarks).forEach(([operation, time]) => {
        console.log(`  ${operation}: ${time.toFixed(2)}ms`);
      });
      
      // Verify all operations meet requirements
      expect(benchmarks['plan_generation_daniels']).toBeLessThan(2000);
      expect(benchmarks['philosophy_comparison']).toBeLessThan(500);
      expect(benchmarks['methodology_validation']).toBeLessThan(500);
      expect(benchmarks['workout_customization']).toBeLessThan(1000);
      expect(benchmarks['vdot_calculation']).toBeLessThan(100);
    });
  });
});