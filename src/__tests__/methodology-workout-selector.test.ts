import { describe, it, expect, beforeEach } from "vitest";
import {
  MethodologyWorkoutSelector,
  WorkoutSelectionCriteria,
} from "../methodology-workout-selector";
import {
  createMockFitnessAssessment,
  createMockEnvironmentalFactors,
  createMockTrainingPreferences,
  createMockPlannedWorkout,
} from "./test-utils";
import { WorkoutType, TrainingPhase } from "../types";

describe("MethodologyWorkoutSelector", () => {
  describe("Daniels Methodology Selector", () => {
    let selector: MethodologyWorkoutSelector;

    beforeEach(() => {
      selector = new MethodologyWorkoutSelector("daniels");
    });

    it("should select VDOT-based workouts for Daniels methodology", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "tempo",
        phase: "build",
        weekNumber: 6,
        dayOfWeek: 2, // Tuesday
      };

      const result = selector.selectWorkout(criteria);

      expect(result.workout).toBeDefined();
      expect(result.workout.type).toBe("tempo");
      expect(result.methodologyCompliance).toBeGreaterThanOrEqual(80);
      expect(result.rationale).toContain("daniels");

      // Check for threshold intensity
      const hasThresholdIntensity = result.workout.segments.some(
        (seg) => seg.intensity >= 86 && seg.intensity <= 90,
      );
      expect(hasThresholdIntensity).toBe(true);
    });

    it("should create custom Daniels workout when template unavailable", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "vo2max",
        phase: "peak",
        weekNumber: 12,
        dayOfWeek: 4,
      };

      const result = selector.selectWorkout(criteria);

      expect(result.workout.type).toBe("vo2max");
      expect(result.rationale).toContain("daniels");

      // Should have intervals at I-pace
      const intervals = result.workout.segments.filter(
        (seg) => seg.intensity >= 95,
      );
      expect(intervals.length).toBeGreaterThanOrEqual(3);
    });

    it("should validate phase-appropriate workout selection", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "vo2max",
        phase: "base",
        weekNumber: 2,
        dayOfWeek: 3,
      };

      const result = selector.selectWorkout(criteria);

      // Should have lower compliance for VO2max in base phase
      expect(result.methodologyCompliance).toBeLessThan(80);
      expect(result.warnings).toBeDefined();
    });
  });

  describe("Lydiard Methodology Selector", () => {
    let selector: MethodologyWorkoutSelector;

    beforeEach(() => {
      selector = new MethodologyWorkoutSelector("lydiard");
    });

    it("should emphasize aerobic workouts for Lydiard methodology", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "long_run",
        phase: "base",
        weekNumber: 4,
        dayOfWeek: 0, // Sunday
      };

      const result = selector.selectWorkout(criteria);

      expect(result.workout.type).toBe("long_run");

      // Check for aerobic intensity
      const avgIntensity =
        result.workout.segments.reduce(
          (sum, seg) => sum + seg.intensity * seg.duration,
          0,
        ) / result.workout.segments.reduce((sum, seg) => sum + seg.duration, 0);

      expect(avgIntensity).toBeLessThanOrEqual(75);
      expect(result.methodologyCompliance).toBeGreaterThanOrEqual(90);
    });

    it("should select appropriate hill workouts", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "hill_repeats",
        phase: "base",
        weekNumber: 6,
        dayOfWeek: 2,
      };

      const result = selector.selectWorkout(criteria);

      expect(result.workout.type).toBe("hill_repeats");
      expect(result.templateName).toContain("LYDIARD");
      expect(result.alternativeOptions).toContain("LYDIARD_HILL_BASE");
    });

    it("should restrict anaerobic work in base phase", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "speed",
        phase: "base",
        weekNumber: 3,
        dayOfWeek: 4,
      };

      const result = selector.selectWorkout(criteria);

      // Should have low compliance for speed work in base
      expect(result.methodologyCompliance).toBeLessThan(70);
    });

    it("should prefer complete rest for high recovery needs", () => {
      const previousWorkouts = [
        createMockPlannedWorkout({ type: "long_run" }),
        createMockPlannedWorkout({ type: "hill_repeats" }),
      ];

      const result = selector.selectRecoveryWorkout(previousWorkouts, 85);

      expect(result.workout.segments[0].duration).toBe(0);
      expect(result.rationale).toContain("complete rest");
      expect(result.methodologyCompliance).toBe(100);
    });
  });

  describe("Pfitzinger Methodology Selector", () => {
    let selector: MethodologyWorkoutSelector;

    beforeEach(() => {
      selector = new MethodologyWorkoutSelector("pfitzinger");
    });

    it("should emphasize lactate threshold workouts", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "threshold",
        phase: "build",
        weekNumber: 8,
        dayOfWeek: 2,
      };

      const result = selector.selectWorkout(criteria);

      expect(result.workout.type).toBe("threshold");

      // Check for LT intensity
      const ltSegments = result.workout.segments.filter(
        (seg) => seg.intensity >= 84 && seg.intensity <= 92,
      );
      expect(ltSegments.length).toBeGreaterThan(0);
      expect(result.methodologyCompliance).toBeGreaterThanOrEqual(80);
    });

    it("should create medium-long runs with quality segments", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "long_run",
        phase: "build",
        weekNumber: 6,
        dayOfWeek: 0,
      };

      const result = selector.selectWorkout(criteria);

      expect(result.workout.type).toBe("long_run");

      // Should potentially have tempo segments in build phase
      const totalDuration = result.workout.segments.reduce(
        (sum, seg) => sum + seg.duration,
        0,
      );
      expect(totalDuration).toBeGreaterThanOrEqual(60);
    });

    it("should provide LT interval alternatives", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "tempo",
        phase: "peak",
        weekNumber: 14,
        dayOfWeek: 4,
      };

      const result = selector.selectWorkout(criteria);

      expect(result.alternativeOptions).toContain("LACTATE_THRESHOLD_2X20");
      expect(result.workout.adaptationTarget.toLowerCase()).toMatch(
        /threshold|lactate|tempo/,
      );
    });
  });

  describe("Context-Aware Modifications", () => {
    let selector: MethodologyWorkoutSelector;

    beforeEach(() => {
      selector = new MethodologyWorkoutSelector("daniels");
    });

    it("should adjust for time constraints", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "tempo",
        phase: "build",
        weekNumber: 6,
        dayOfWeek: 2,
        timeConstraints: 30, // Only 30 minutes available
      };

      const result = selector.selectWorkout(criteria);

      const totalDuration = result.workout.segments.reduce(
        (sum, seg) => sum + seg.duration,
        0,
      );
      expect(totalDuration).toBeLessThanOrEqual(30);
      expect(result.warnings?.some((w) => w.includes("shortened"))).toBe(true);
    });

    it("should adjust for altitude", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "vo2max",
        phase: "peak",
        weekNumber: 12,
        dayOfWeek: 3,
        environmentalFactors: createMockEnvironmentalFactors({
          altitude: 2000,
          typicalTemperature: 15,
        }),
      };

      const result = selector.selectWorkout(criteria);

      // Check intensity reduction
      const maxIntensity = Math.max(
        ...result.workout.segments.map((seg) => seg.intensity),
      );
      expect(maxIntensity).toBeLessThanOrEqual(93); // Reduced from typical 95+
      expect(
        result.warnings?.some((w) => w.toLowerCase().includes("altitude")),
      ).toBe(true);
    });

    it("should adjust for high temperature", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "tempo",
        phase: "build",
        weekNumber: 8,
        dayOfWeek: 2,
        environmentalFactors: createMockEnvironmentalFactors({
          typicalTemperature: 30,
          humidity: 80,
        }),
      };

      const result = selector.selectWorkout(criteria);

      expect(
        result.warnings?.some((w) => w.toLowerCase().includes("temperature")),
      ).toBe(true);
      // Intensity should be reduced
      const tempoSegment = result.workout.segments.find(
        (seg) => seg.zone.name === "THRESHOLD",
      );
      if (tempoSegment) {
        expect(tempoSegment.intensity).toBeLessThanOrEqual(85);
      }
    });

    it("should add extra warm-up for cold conditions", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "speed",
        phase: "peak",
        weekNumber: 14,
        dayOfWeek: 3,
        environmentalFactors: createMockEnvironmentalFactors({
          typicalTemperature: -5,
        }),
      };

      const result = selector.selectWorkout(criteria);

      // Should have extra warm-up
      expect(result.workout.segments[0].description).toContain("cold");
      expect(result.workout.segments[0].duration).toBeGreaterThanOrEqual(5);
    });

    it("should modify speed work for non-track surfaces", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "speed",
        phase: "peak",
        weekNumber: 14,
        dayOfWeek: 3,
        equipment: ["road", "watch"], // No track
      };

      const result = selector.selectWorkout(criteria);

      expect(
        result.warnings?.some((w) => w.toLowerCase().includes("non-track")),
      ).toBe(true);
      // High intensity should be capped
      const maxIntensity = Math.max(
        ...result.workout.segments.map((seg) => seg.intensity),
      );
      expect(maxIntensity).toBeLessThanOrEqual(92);
    });
  });

  describe("User Preference Conflicts", () => {
    let selector: MethodologyWorkoutSelector;

    beforeEach(() => {
      selector = new MethodologyWorkoutSelector("daniels");
    });

    it("should warn about intensity preference conflicts", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "tempo",
        phase: "build",
        weekNumber: 8,
        dayOfWeek: 2,
        preferences: createMockTrainingPreferences({
          preferredIntensity: "low",
        }),
      };

      const result = selector.selectWorkout(criteria);

      expect(result.warnings?.some((w) => w.includes("intensity"))).toBe(true);
      expect(result.warnings?.some((w) => w.includes("preference"))).toBe(true);
    });

    it("should handle time constraint conflicts", () => {
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "long_run",
        phase: "build",
        weekNumber: 8,
        dayOfWeek: 0,
        preferences: createMockTrainingPreferences({
          timeConstraints: { 0: 60 }, // Only 60 min on Sunday
        }),
      };

      const result = selector.selectWorkout(criteria);

      const totalDuration = result.workout.segments.reduce(
        (sum, seg) => sum + seg.duration,
        0,
      );
      expect(totalDuration).toBeLessThanOrEqual(60);
    });
  });

  describe("Workout Progression", () => {
    let selector: MethodologyWorkoutSelector;

    beforeEach(() => {
      selector = new MethodologyWorkoutSelector("daniels");
    });

    it("should progress workout difficulty based on performance", () => {
      const previousWorkout = createMockPlannedWorkout({
        type: "threshold",
        workout: {
          type: "threshold",
          primaryZone: { name: "THRESHOLD" },
          segments: [
            {
              duration: 10,
              intensity: 65,
              zone: { name: "EASY" },
              description: "Warm-up",
            },
            {
              duration: 20,
              intensity: 88,
              zone: { name: "THRESHOLD" },
              description: "Threshold",
            },
            {
              duration: 10,
              intensity: 60,
              zone: { name: "RECOVERY" },
              description: "Cool-down",
            },
          ],
          adaptationTarget: "Lactate threshold",
          estimatedTSS: 50,
          recoveryTime: 24,
        },
      });

      const result = selector.getProgressedWorkout(
        previousWorkout,
        8, // 8 weeks into program
        { completionRate: 0.95, difficultyRating: 6 },
      );

      expect(result.workout.type).toBe("threshold");
      // Should increase volume for Daniels
      const thresholdDuration = result.workout.segments
        .filter((seg) => seg.zone.name === "THRESHOLD")
        .reduce((sum, seg) => sum + seg.duration, 0);
      expect(thresholdDuration).toBeGreaterThan(20);
      expect(result.rationale).toContain("Progressed");
    });

    it("should not progress if difficulty rating is too high", () => {
      const previousWorkout = createMockPlannedWorkout({
        type: "vo2max",
      });

      const result = selector.getProgressedWorkout(previousWorkout, 10, {
        completionRate: 0.92,
        difficultyRating: 9,
      });

      expect(result.rationale).not.toContain("Progressed");
    });
  });

  describe("Methodology Compliance Validation", () => {
    it("should validate Daniels compliance correctly", () => {
      const selector = new MethodologyWorkoutSelector("daniels");
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "tempo",
        phase: "build",
        weekNumber: 8,
        dayOfWeek: 2,
      };

      const result = selector.selectWorkout(criteria);

      // Daniels tempo should have high compliance
      expect(result.methodologyCompliance).toBeGreaterThanOrEqual(80);
    });

    it("should validate Lydiard compliance correctly", () => {
      const selector = new MethodologyWorkoutSelector("lydiard");
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "easy",
        phase: "base",
        weekNumber: 4,
        dayOfWeek: 1,
      };

      const result = selector.selectWorkout(criteria);

      // Lydiard easy in base should have very high compliance
      expect(result.methodologyCompliance).toBeGreaterThanOrEqual(90);
    });

    it("should validate Pfitzinger compliance correctly", () => {
      const selector = new MethodologyWorkoutSelector("pfitzinger");
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "threshold",
        phase: "build",
        weekNumber: 10,
        dayOfWeek: 2,
      };

      const result = selector.selectWorkout(criteria);

      // Pfitzinger threshold should have high compliance
      expect(result.methodologyCompliance).toBeGreaterThanOrEqual(80);
    });
  });

  describe("Alternative Options", () => {
    it("should provide methodology-specific alternatives", () => {
      const danielsSelector = new MethodologyWorkoutSelector("daniels");
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "vo2max",
        phase: "peak",
        weekNumber: 14,
        dayOfWeek: 3,
      };

      const result = danielsSelector.selectWorkout(criteria);

      expect(result.alternativeOptions).toContain("VO2MAX_4X4");
      expect(result.alternativeOptions).toContain("VO2MAX_5X3");
      expect(
        result.alternativeOptions?.some((opt) => opt.includes("I-pace")),
      ).toBe(true);
    });

    it("should provide Lydiard hill alternatives", () => {
      const lydiardSelector = new MethodologyWorkoutSelector("lydiard");
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "hill_repeats",
        phase: "build",
        weekNumber: 8,
        dayOfWeek: 2,
      };

      const result = lydiardSelector.selectWorkout(criteria);

      expect(result.alternativeOptions).toContain("LYDIARD_HILL_BUILD");
      expect(result.alternativeOptions?.length).toBeGreaterThanOrEqual(3);
    });

    it("should provide Pfitzinger medium-long alternatives", () => {
      const pfitzingerSelector = new MethodologyWorkoutSelector("pfitzinger");
      const criteria: WorkoutSelectionCriteria = {
        workoutType: "long_run",
        phase: "build",
        weekNumber: 10,
        dayOfWeek: 0,
      };

      const result = pfitzingerSelector.selectWorkout(criteria);

      expect(
        result.alternativeOptions?.some((opt) => opt.includes("Medium-long")),
      ).toBe(true);
      expect(
        result.alternativeOptions?.some((opt) => opt.includes("Progressive")),
      ).toBe(true);
    });
  });
});
