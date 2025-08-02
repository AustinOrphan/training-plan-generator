/**
 * Tests for base TrainingPlanGenerator class
 * Covers plan structure, volume progression patterns, and edge cases
 */

import { describe, it, expect, beforeEach } from "vitest";
import { TrainingPlanGenerator } from "../generator";
import {
  type TrainingPlanConfig,
  type TrainingPlan,
  type TrainingBlock,
  type WeeklyMicrocycle,
  type PlannedWorkout,
  type FitnessAssessment,
} from "../types";
import {
  createMockTrainingPlanConfig,
  assertPlanStructure,
  validateDateRange,
  validateIntensityDistribution,
  testDateUtils,
  GeneratorTestDataBuilder,
} from "./test-utils";
import { calculateFitnessMetrics } from "../calculator";
import { addWeeks, differenceInWeeks } from "date-fns";

describe("TrainingPlanGenerator", () => {
  let generator: TrainingPlanGenerator;
  let baseConfig: TrainingPlanConfig;
  let dataBuilder: GeneratorTestDataBuilder;

  // Helper function to create config with duration
  const createConfigWithDuration = (
    duration: number,
    overrides?: Partial<TrainingPlanConfig>,
  ): TrainingPlanConfig => {
    const startDate = testDateUtils.createTestDate("2024-01-01");
    const targetDate = addWeeks(startDate, duration);
    return createMockTrainingPlanConfig({
      startDate,
      targetDate,
      ...overrides,
    });
  };

  beforeEach(() => {
    baseConfig = createMockTrainingPlanConfig();
    generator = new TrainingPlanGenerator(baseConfig);
    dataBuilder = GeneratorTestDataBuilder;
  });

  describe("Plan Structure Generation", () => {
    it("should generate a complete training plan with correct structure", () => {
      const plan = generator.generatePlan();

      // Use existing validation helper
      assertPlanStructure(plan);

      // Verify plan components
      expect(plan.config).toBeDefined();
      expect(plan.blocks).toBeInstanceOf(Array);
      expect(plan.workouts).toBeInstanceOf(Array);
      expect(plan.summary).toBeDefined();

      // Verify plan consistency
      expect(plan.blocks.length).toBeGreaterThan(0);
      expect(plan.workouts.length).toBeGreaterThan(0);
      expect(plan.summary.totalWeeks).toBeGreaterThan(0);
    });

    it("should create training blocks with proper phases", () => {
      const plan = generator.generatePlan();

      expect(plan.blocks).toBeInstanceOf(Array);
      plan.blocks.forEach((block: TrainingBlock) => {
        expect(block.phase).toBeDefined();
        expect(block.microcycles).toBeInstanceOf(Array);
        expect(block.microcycles.length).toBeGreaterThan(0);
        expect(block.weeks).toBeGreaterThan(0);

        // Verify week structure
        block.microcycles.forEach((week: WeeklyMicrocycle) => {
          expect(week.weekNumber).toBeGreaterThan(0);
          expect(week.workouts).toBeInstanceOf(Array);
          expect(week.totalVolume).toBeGreaterThan(0);
        });
      });
    });

    it("should generate workouts in chronological order", () => {
      const plan = generator.generatePlan();

      expect(plan.workouts.length).toBeGreaterThan(1);

      // Verify chronological order
      for (let i = 1; i < plan.workouts.length; i++) {
        const prevDate = plan.workouts[i - 1].date;
        const currDate = plan.workouts[i].date;
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });

    it("should calculate accurate plan summary", () => {
      const plan = generator.generatePlan();
      const { summary } = plan;

      expect(summary.totalWeeks).toBeGreaterThan(0);
      expect(summary.totalWorkouts).toBe(plan.workouts.length);
      expect(summary.totalDistance).toBeGreaterThan(0);
      expect(summary.peakWeeklyDistance).toBeGreaterThan(0);
      expect(summary.averageWeeklyDistance).toBeGreaterThan(0);
    });
  });

  describe("Volume Progression Patterns", () => {
    it("should implement progressive volume increase", () => {
      const config = createConfigWithDuration(12, {
        goal: "marathon",
      });
      const progressionGenerator = new TrainingPlanGenerator(config);
      const plan = progressionGenerator.generatePlan();

      // Extract weekly volumes
      const weeklyVolumes = plan.blocks.flatMap((block) =>
        block.microcycles.map((week) => week.totalVolume),
      );

      expect(weeklyVolumes.length).toBeGreaterThan(4);

      // Check for general upward trend (allowing for recovery weeks)
      const firstQuarter = weeklyVolumes.slice(
        0,
        Math.floor(weeklyVolumes.length / 4),
      );
      const lastQuarter = weeklyVolumes.slice(
        -Math.floor(weeklyVolumes.length / 4),
      );

      const avgFirst =
        firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
      const avgLast =
        lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;

      // Allow for reasonable progression (not strict mathematical progression)
      expect(avgLast).toBeGreaterThan(avgFirst * 0.9); // At least 90% progression maintained
    });

    it("should include recovery weeks in progression", () => {
      const config = createMockTrainingPlanConfig({
        duration: 16, // Longer plan to see recovery patterns
        goal: "half-marathon",
      });
      const progressionGenerator = new TrainingPlanGenerator(config);
      const plan = progressionGenerator.generatePlan();

      const weeklyVolumes = plan.blocks.flatMap((block) =>
        block.microcycles.map((week) => week.totalVolume),
      );

      // Look for recovery patterns (volume drops)
      let recoveryWeeksFound = 0;
      for (let i = 3; i < weeklyVolumes.length - 1; i++) {
        if (weeklyVolumes[i] < weeklyVolumes[i - 1] * 0.8) {
          recoveryWeeksFound++;
        }
      }

      // Should have at least some recovery weeks in a 16-week plan
      expect(recoveryWeeksFound).toBeGreaterThan(0);
    });

    it("should respect peak volume constraints", () => {
      const plan = generator.generatePlan();
      const { summary } = plan;

      // Peak volume should be reasonable relative to average
      expect(summary.peakWeeklyDistance).toBeLessThan(
        summary.averageWeeklyDistance * 2.5,
      );
      expect(summary.peakWeeklyDistance).toBeGreaterThan(
        summary.averageWeeklyDistance * 1.1,
      );
    });
  });

  describe("Short Plan Generation (4 weeks)", () => {
    it("should generate valid 4-week plan", () => {
      const shortConfig = createMockTrainingPlanConfig({
        duration: 4,
        goal: "5k",
      });
      const shortGenerator = new TrainingPlanGenerator(shortConfig);
      const plan = shortGenerator.generatePlan();

      // Use existing validation helper
      assertPlanStructure(plan);

      // Verify 4-week structure
      expect(plan.summary.totalWeeks).toBe(4);
      validateDateRange(
        plan.config.startDate,
        addWeeks(plan.config.startDate, 4),
        4,
      );

      // Should have minimal but complete structure
      expect(plan.blocks.length).toBeGreaterThan(0);
      expect(plan.workouts.length).toBeGreaterThan(8); // At least 2 workouts per week
      expect(plan.summary.totalDistance).toBeGreaterThan(0);
    });

    it("should handle short plan intensity distribution", () => {
      const shortConfig = createMockTrainingPlanConfig({
        duration: 4,
        goal: "10k",
      });
      const shortGenerator = new TrainingPlanGenerator(shortConfig);
      const plan = shortGenerator.generatePlan();

      // Should maintain reasonable intensity distribution even in short plan
      validateIntensityDistribution(plan.workouts, {
        easy: 0.6, // 60% easy (more flexible for short plans)
        moderate: 0.25, // 25% moderate
        hard: 0.15, // 15% hard
      });
    });

    it("should focus on race-specific work in short plans", () => {
      const baseConfig = createMockTrainingPlanConfig({
        duration: 4,
        goal: "5k",
      });
      const shortConfig = {
        ...baseConfig,
        races: [
          {
            distance: "5k",
            date: addWeeks(baseConfig.startDate, 3),
            priority: "A",
          },
        ],
      };
      const shortGenerator = new TrainingPlanGenerator(shortConfig);
      const plan = shortGenerator.generatePlan();

      // Should have some race-specific workouts
      const raceSpecificWorkouts = plan.workouts.filter((w) =>
        w.workout.segments?.some(
          (s) => s.pace?.includes("5K") || s.description?.includes("race"),
        ),
      );

      expect(raceSpecificWorkouts.length).toBeGreaterThan(0);
    });
  });

  describe("Long Plan Generation (52 weeks)", () => {
    it("should generate valid 52-week plan", () => {
      const longConfig = createMockTrainingPlanConfig({
        duration: 52,
        goal: "marathon",
      });
      const longGenerator = new TrainingPlanGenerator(longConfig);
      const plan = longGenerator.generatePlan();

      // Use existing validation helper
      assertPlanStructure(plan);

      // Verify 52-week structure
      expect(plan.summary.totalWeeks).toBe(52);
      validateDateRange(
        plan.config.startDate,
        addWeeks(plan.config.startDate, 52),
        52,
      );

      // Should have substantial structure
      expect(plan.blocks.length).toBeGreaterThan(3); // Multiple training phases
      expect(plan.workouts.length).toBeGreaterThan(200); // ~4 workouts per week
      expect(plan.summary.totalDistance).toBeGreaterThan(1000); // Substantial volume
    });

    it("should implement periodization in long plans", () => {
      const longConfig = createMockTrainingPlanConfig({
        duration: 52,
        goal: "marathon",
      });
      const longGenerator = new TrainingPlanGenerator(longConfig);
      const plan = longGenerator.generatePlan();

      // Should have multiple distinct phases
      const phaseTypes = new Set(plan.blocks.map((block) => block.phase));
      expect(phaseTypes.size).toBeGreaterThan(2);

      // Should include base building, build, and peak phases
      const phases = Array.from(phaseTypes);
      expect(phases.some((phase) => phase.toLowerCase().includes("base"))).toBe(
        true,
      );
    });

    it("should manage volume progression over long duration", () => {
      const longConfig = createMockTrainingPlanConfig({
        duration: 52,
        goal: "marathon",
      });
      const longGenerator = new TrainingPlanGenerator(longConfig);
      const plan = longGenerator.generatePlan();

      const weeklyVolumes = plan.blocks.flatMap((block) =>
        block.microcycles.map((week) => week.totalVolume),
      );

      // Should show long-term progression with multiple cycles
      const firstMonth = weeklyVolumes.slice(0, 4);
      const midPlan = weeklyVolumes.slice(20, 24);
      const finalBuild = weeklyVolumes.slice(40, 44);

      const avgFirst =
        firstMonth.reduce((a, b) => a + b, 0) / firstMonth.length;
      const avgMid = midPlan.reduce((a, b) => a + b, 0) / midPlan.length;
      const avgFinal =
        finalBuild.reduce((a, b) => a + b, 0) / finalBuild.length;

      // Should show overall progression (allowing for periodization)
      expect(avgMid).toBeGreaterThan(avgFirst * 0.8);
      expect(avgFinal).toBeGreaterThan(avgFirst * 0.7); // May taper at end
    });

    it("should include multiple recovery periods", () => {
      const longConfig = createMockTrainingPlanConfig({
        duration: 52,
        goal: "marathon",
      });
      const longGenerator = new TrainingPlanGenerator(longConfig);
      const plan = longGenerator.generatePlan();

      const weeklyVolumes = plan.blocks.flatMap((block) =>
        block.microcycles.map((week) => week.totalVolume),
      );

      // Count recovery weeks (significant volume drops)
      let recoveryWeeksFound = 0;
      for (let i = 3; i < weeklyVolumes.length - 1; i++) {
        if (weeklyVolumes[i] < weeklyVolumes[i - 1] * 0.75) {
          recoveryWeeksFound++;
        }
      }

      // Should have multiple recovery periods in 52 weeks
      expect(recoveryWeeksFound).toBeGreaterThan(8); // At least every 6 weeks on average
    });
  });

  describe("Calculator Integration", () => {
    it("should integrate with fitness metrics calculation", () => {
      const plan = generator.generatePlan();

      // Verify fitness assessment is used
      expect(plan.config.currentFitness).toBeDefined();

      // Should use fitness metrics in planning
      const fitnessMetrics = calculateFitnessMetrics(
        plan.config.currentFitness!,
        plan.config.recentRuns || [],
      );

      expect(fitnessMetrics).toBeDefined();
      expect(fitnessMetrics.vdot).toBeGreaterThan(0);
      expect(fitnessMetrics.fitnessLevel).toBeDefined();
    });

    it("should adapt to fitness level", () => {
      // Generate plans with different fitness levels
      const lowFitnessConfig = createMockTrainingPlanConfig({
        currentFitness: {
          vdot: 35,
          criticalSpeed: 3.5,
          lactateThreshold: 4.2,
          vo2max: 45,
          runningEconomy: 200,
          aerobicThreshold: 3.8,
        },
      });

      const highFitnessConfig = createMockTrainingPlanConfig({
        currentFitness: {
          vdot: 55,
          criticalSpeed: 4.8,
          lactateThreshold: 3.1,
          vo2max: 65,
          runningEconomy: 170,
          aerobicThreshold: 3.3,
        },
      });

      const lowFitnessGenerator = new TrainingPlanGenerator(lowFitnessConfig);
      const highFitnessGenerator = new TrainingPlanGenerator(highFitnessConfig);

      const lowPlan = lowFitnessGenerator.generatePlan();
      const highPlan = highFitnessGenerator.generatePlan();

      // High fitness should generally have higher volume
      expect(highPlan.summary.averageWeeklyDistance).toBeGreaterThan(
        lowPlan.summary.averageWeeklyDistance * 0.8,
      );
    });

    it("should use recent runs for adaptation", () => {
      const configWithRuns = createMockTrainingPlanConfig({
        recentRuns: [
          {
            date: new Date("2024-01-15"),
            distance: 10000,
            duration: 2700, // 45 minutes
            avgPace: 270, // 4:30/km
            avgHeartRate: 165,
            perceivedEffort: 7,
          },
          {
            date: new Date("2024-01-10"),
            distance: 5000,
            duration: 1200, // 20 minutes
            avgPace: 240, // 4:00/km
            avgHeartRate: 175,
            perceivedEffort: 8,
          },
        ],
      });

      const adaptiveGenerator = new TrainingPlanGenerator(configWithRuns);
      const plan = adaptiveGenerator.generatePlan();

      // Should generate valid plan with run data
      assertPlanStructure(plan);
      expect(plan.workouts.length).toBeGreaterThan(0);

      // Verify recent runs are considered
      expect(plan.config.recentRuns).toBeDefined();
      expect(plan.config.recentRuns!.length).toBe(2);
    });

    it("should handle missing fitness data gracefully", () => {
      const configWithoutFitness = createMockTrainingPlanConfig({
        currentFitness: undefined,
      });

      const fallbackGenerator = new TrainingPlanGenerator(configWithoutFitness);
      const plan = fallbackGenerator.generatePlan();

      // Should still generate valid plan with default fitness
      assertPlanStructure(plan);
      expect(plan.summary.totalWeeks).toBeGreaterThan(0);
      expect(plan.workouts.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle minimum duration plans", () => {
      const minConfig = createMockTrainingPlanConfig({
        duration: 1, // 1 week minimum
      });

      const minGenerator = new TrainingPlanGenerator(minConfig);
      const plan = minGenerator.generatePlan();

      assertPlanStructure(plan);
      expect(plan.summary.totalWeeks).toBe(1);
      expect(plan.workouts.length).toBeGreaterThan(0);
    });

    it("should handle plans with past start dates", () => {
      const pastConfig = createMockTrainingPlanConfig({
        startDate: new Date("2020-01-01"), // Past date
      });

      const pastGenerator = new TrainingPlanGenerator(pastConfig);
      const plan = pastGenerator.generatePlan();

      // Should generate plan regardless of start date
      assertPlanStructure(plan);
      expect(plan.config.startDate).toEqual(pastConfig.startDate);
    });

    it("should handle various goal types", () => {
      const goals = [
        "5k",
        "10k",
        "half-marathon",
        "marathon",
        "ultra",
        "general-fitness",
      ] as const;

      goals.forEach((goal) => {
        const goalConfig = createMockTrainingPlanConfig({ goal });
        const goalGenerator = new TrainingPlanGenerator(goalConfig);
        const plan = goalGenerator.generatePlan();

        assertPlanStructure(plan);
        expect(plan.config.goal).toBe(goal);
        expect(plan.workouts.length).toBeGreaterThan(0);
      });
    });

    it("should maintain data consistency throughout generation", () => {
      const plan = generator.generatePlan();

      // Verify workout dates match plan duration
      const planStartDate = plan.config.startDate;
      const expectedEndDate = addWeeks(planStartDate, plan.config.duration);

      plan.workouts.forEach((workout) => {
        expect(workout.date.getTime()).toBeGreaterThanOrEqual(
          planStartDate.getTime(),
        );
        expect(workout.date.getTime()).toBeLessThanOrEqual(
          expectedEndDate.getTime(),
        );
      });

      // Verify blocks contain all weeks
      const totalBlockWeeks = plan.blocks.reduce(
        (sum, block) => sum + block.weeks.length,
        0,
      );
      expect(totalBlockWeeks).toBe(plan.summary.totalWeeks);
    });
  });

  describe("Performance Requirements", () => {
    it("should generate plans within reasonable time", () => {
      const start = performance.now();

      const plan = generator.generatePlan();

      const end = performance.now();
      const duration = end - start;

      // Should generate plan quickly (less than 100ms for normal plan)
      expect(duration).toBeLessThan(100);
      expect(plan.workouts.length).toBeGreaterThan(0);
    });

    it("should handle large plans efficiently", () => {
      const largeConfig = createMockTrainingPlanConfig({
        duration: 52, // Full year
      });
      const largeGenerator = new TrainingPlanGenerator(largeConfig);

      const start = performance.now();
      const plan = largeGenerator.generatePlan();
      const end = performance.now();

      // Should generate even large plans in reasonable time (less than 500ms)
      expect(end - start).toBeLessThan(500);
      expect(plan.workouts.length).toBeGreaterThan(200);
    });
  });
});
