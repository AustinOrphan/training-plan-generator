import { describe, it, expect, beforeEach } from "vitest";
import {
  CustomWorkoutGenerator,
  CustomWorkoutParameters,
  WorkoutConstraints,
} from "../custom-workout-generator";
import {
  createMockEnvironmentalFactors,
  createMockFitnessAssessment,
  createMockTrainingPreferences,
} from "./test-utils";
import { WorkoutType, TrainingPhase } from "../types";

describe("CustomWorkoutGenerator", () => {
  describe("Daniels Methodology Generator", () => {
    let generator: CustomWorkoutGenerator;

    beforeEach(() => {
      generator = new CustomWorkoutGenerator("daniels");
    });

    it("should generate VDOT-based tempo workout", () => {
      const parameters: CustomWorkoutParameters = {
        type: "tempo",
        phase: "build",
        methodology: "daniels",
        targetDuration: 50,
        targetIntensity: 88,
      };

      const result = generator.generateWorkout(parameters);

      expect(result.workout.type).toBe("tempo");
      expect(result.methodologyCompliance).toBeGreaterThanOrEqual(80);

      // Should have T-pace segment
      const tempoSegment = result.workout.segments.find(
        (seg) => seg.intensity === 88 && seg.zone.name === "Tempo",
      );
      expect(tempoSegment).toBeDefined();
      expect(tempoSegment?.description).toContain("T-pace");
    });

    it("should generate VO2max intervals with proper recovery", () => {
      const parameters: CustomWorkoutParameters = {
        type: "vo2max",
        phase: "peak",
        methodology: "daniels",
        targetDuration: 60,
      };

      const result = generator.generateWorkout(parameters);

      // Check for I-pace intervals
      const intervals = result.workout.segments.filter(
        (seg) => seg.intensity === 95,
      );
      expect(intervals.length).toBeGreaterThan(0);

      // Check for recovery segments
      const recoveries = result.workout.segments.filter(
        (seg) => seg.intensity === 60,
      );
      expect(recoveries.length).toBeGreaterThan(0);

      expect(result.rationale).toContain("daniels");
    });

    it("should generate speed repetitions with full recovery", () => {
      const parameters: CustomWorkoutParameters = {
        type: "speed",
        phase: "peak",
        methodology: "daniels",
        targetDuration: 45,
      };

      const result = generator.generateWorkout(parameters);

      // Check for R-pace reps
      const reps = result.workout.segments.filter(
        (seg) => seg.intensity === 98,
      );
      expect(reps.length).toBeGreaterThan(0);

      // Check recovery is longer than work
      const firstRep = reps[0];
      const recovery = result.workout.segments.find(
        (seg) => seg.intensity === 50 && seg.description.includes("recovery"),
      );

      if (firstRep && recovery) {
        expect(recovery.duration).toBeGreaterThan(firstRep.duration);
      }
    });
  });

  describe("Lydiard Methodology Generator", () => {
    let generator: CustomWorkoutGenerator;

    beforeEach(() => {
      generator = new CustomWorkoutGenerator("lydiard");
    });

    it("should generate aerobic-emphasis long run", () => {
      const parameters: CustomWorkoutParameters = {
        type: "long_run",
        phase: "base",
        methodology: "lydiard",
        targetDuration: 120,
      };

      const result = generator.generateWorkout(parameters);

      expect(result.workout.type).toBe("long_run");
      expect(result.methodologyCompliance).toBeGreaterThanOrEqual(90);

      // Should be purely aerobic in base
      const aerobicSegments = result.workout.segments.filter(
        (seg) => seg.intensity <= 65,
      );
      const totalDuration = result.workout.segments.reduce(
        (sum, seg) => sum + seg.duration,
        0,
      );
      expect(aerobicSegments.reduce((sum, seg) => sum + seg.duration, 0)).toBe(
        totalDuration,
      );
    });

    it("should generate hill circuit workout", () => {
      const parameters: CustomWorkoutParameters = {
        type: "hill_repeats",
        phase: "base",
        methodology: "lydiard",
        targetDuration: 60,
      };

      const result = generator.generateWorkout(parameters);

      // Should have hill work
      const hillSegments = result.workout.segments.filter((seg) =>
        seg.description.toLowerCase().includes("hill"),
      );
      expect(hillSegments.length).toBeGreaterThan(0);

      // Base phase should use continuous circuit
      const circuitSegment = result.workout.segments.find((seg) =>
        seg.description.includes("circuit"),
      );
      expect(circuitSegment).toBeDefined();
    });

    it("should generate fartlek with speed play", () => {
      const parameters: CustomWorkoutParameters = {
        type: "fartlek",
        phase: "build",
        methodology: "lydiard",
        targetDuration: 45,
      };

      const result = generator.generateWorkout(parameters);

      expect(result.workout.type).toBe("fartlek");

      const fartlekSegment = result.workout.segments.find((seg) =>
        seg.description.toLowerCase().includes("fartlek"),
      );
      expect(fartlekSegment).toBeDefined();
      expect(fartlekSegment?.description).toContain("vary pace");
    });

    it("should maintain high compliance for base phase workouts", () => {
      const workoutTypes: WorkoutType[] = ["easy", "long_run", "steady"];

      workoutTypes.forEach((type) => {
        const parameters: CustomWorkoutParameters = {
          type,
          phase: "base",
          methodology: "lydiard",
        };

        const result = generator.generateWorkout(parameters);
        expect(result.methodologyCompliance).toBeGreaterThanOrEqual(85);
      });
    });
  });

  describe("Pfitzinger Methodology Generator", () => {
    let generator: CustomWorkoutGenerator;

    beforeEach(() => {
      generator = new CustomWorkoutGenerator("pfitzinger");
    });

    it("should generate LT intervals for longer threshold sessions", () => {
      const parameters: CustomWorkoutParameters = {
        type: "threshold",
        phase: "build",
        methodology: "pfitzinger",
        targetDuration: 70,
      };

      const result = generator.generateWorkout(parameters);

      // Should have multiple LT intervals
      const ltIntervals = result.workout.segments.filter(
        (seg) =>
          seg.intensity === 87 && seg.description.includes("LT interval"),
      );
      expect(ltIntervals.length).toBeGreaterThanOrEqual(2);

      // Check for recovery between intervals
      const recoveries = result.workout.segments.filter(
        (seg) => seg.intensity === 65 && seg.description.includes("Recovery"),
      );
      expect(recoveries.length).toBeGreaterThanOrEqual(1);
    });

    it("should generate medium-long run with quality segment", () => {
      const parameters: CustomWorkoutParameters = {
        type: "long_run",
        phase: "build",
        methodology: "pfitzinger",
        targetDuration: 120,
      };

      const result = generator.generateWorkout(parameters);

      // Should have marathon pace segment
      const qualitySegment = result.workout.segments.find(
        (seg) =>
          seg.intensity === 82 && seg.description.includes("Marathon pace"),
      );
      expect(qualitySegment).toBeDefined();

      // Should still have easy portions
      const easySegments = result.workout.segments.filter(
        (seg) => seg.intensity === 70,
      );
      expect(easySegments.length).toBeGreaterThan(0);
    });

    it("should generate progression run with three zones", () => {
      const parameters: CustomWorkoutParameters = {
        type: "progression",
        phase: "peak",
        methodology: "pfitzinger",
        targetDuration: 60,
      };

      const result = generator.generateWorkout(parameters);

      expect(result.workout.segments).toHaveLength(3);

      // Check progressive intensity
      const intensities = result.workout.segments.map((seg) => seg.intensity);
      expect(intensities[0]).toBeLessThan(intensities[1]);
      expect(intensities[1]).toBeLessThan(intensities[2]);

      // Final segment should be tempo
      expect(result.workout.segments[2].intensity).toBe(85);
    });
  });

  describe("Environmental and Constraint Handling", () => {
    let generator: CustomWorkoutGenerator;

    beforeEach(() => {
      generator = new CustomWorkoutGenerator("daniels");
    });

    it("should adjust for time constraints", () => {
      const parameters: CustomWorkoutParameters = {
        type: "tempo",
        phase: "build",
        methodology: "daniels",
        targetDuration: 60,
        constraints: {
          availableTime: 30,
        },
      };

      const result = generator.generateWorkout(parameters);

      const totalDuration = result.workout.segments.reduce(
        (sum, seg) => sum + seg.duration,
        0,
      );
      expect(totalDuration).toBeLessThanOrEqual(30);
      expect(result.rationale).toContain("30 minute time constraint");
    });

    it("should adjust intensity for altitude", () => {
      const parameters: CustomWorkoutParameters = {
        type: "vo2max",
        phase: "peak",
        methodology: "daniels",
        environmentalFactors: createMockEnvironmentalFactors({
          altitude: 2000,
          typicalTemperature: 15,
        }),
      };

      const result = generator.generateWorkout(parameters);

      // Intensity should be reduced
      const maxIntensity = Math.max(
        ...result.workout.segments.map((seg) => seg.intensity),
      );
      expect(maxIntensity).toBeLessThan(95);
      expect(result.rationale).toContain("altitude");

      // Should have altitude adjusted descriptions
      const adjustedSegments = result.workout.segments.filter((seg) =>
        seg.description.includes("altitude adjusted"),
      );
      expect(adjustedSegments.length).toBeGreaterThan(0);
    });

    it("should adjust for hot weather", () => {
      const parameters: CustomWorkoutParameters = {
        type: "tempo",
        phase: "build",
        methodology: "daniels",
        environmentalFactors: createMockEnvironmentalFactors({
          typicalTemperature: 30,
          humidity: 80,
        }),
      };

      const result = generator.generateWorkout(parameters);

      // Should reduce intensity - look for any tempo zone segment since intensity was reduced
      const tempoSegment = result.workout.segments.find(
        (seg) => seg.zone.name === "Tempo" && seg.description.includes("Tempo"),
      );
      expect(tempoSegment?.intensity).toBeLessThan(88);
      expect(result.rationale).toContain("heat");
    });

    it("should add extra warm-up for cold conditions", () => {
      const parameters: CustomWorkoutParameters = {
        type: "speed",
        phase: "peak",
        methodology: "daniels",
        environmentalFactors: createMockEnvironmentalFactors({
          typicalTemperature: -5,
        }),
      };

      const result = generator.generateWorkout(parameters);

      // Should have extra warm-up segment
      const warmupSegments = result.workout.segments.filter((seg) =>
        seg.description.toLowerCase().includes("warm-up"),
      );
      expect(warmupSegments.length).toBeGreaterThanOrEqual(2);

      const extraWarmup = result.workout.segments.find((seg) =>
        seg.description.includes("Extra warm-up for cold"),
      );
      expect(extraWarmup).toBeDefined();
    });

    it("should modify speed work for non-track surfaces", () => {
      const parameters: CustomWorkoutParameters = {
        type: "speed",
        phase: "peak",
        methodology: "daniels",
        equipment: ["road", "watch"], // No track
      };

      const result = generator.generateWorkout(parameters);

      // High intensity should be capped
      const maxIntensity = Math.max(
        ...result.workout.segments.map((seg) => seg.intensity),
      );
      expect(maxIntensity).toBeLessThanOrEqual(92);

      // Should have modification note
      const modifiedSegments = result.workout.segments.filter((seg) =>
        seg.description.includes("road/trail"),
      );
      expect(modifiedSegments.length).toBeGreaterThan(0);
    });
  });

  describe("Constraint Validation and Warnings", () => {
    let generator: CustomWorkoutGenerator;

    beforeEach(() => {
      generator = new CustomWorkoutGenerator("pfitzinger");
    });

    it("should warn about duration constraint violations", () => {
      const parameters: CustomWorkoutParameters = {
        type: "long_run",
        phase: "build",
        methodology: "pfitzinger",
        targetDuration: 150,
        constraints: {
          maxDuration: 90,
        },
      };

      const result = generator.generateWorkout(parameters);

      // Should cap at max duration
      const totalDuration = result.workout.segments.reduce(
        (sum, seg) => sum + seg.duration,
        0,
      );
      expect(totalDuration).toBeLessThanOrEqual(90);
    });

    it("should warn about high altitude impacts", () => {
      const parameters: CustomWorkoutParameters = {
        type: "vo2max",
        phase: "peak",
        methodology: "pfitzinger",
        environmentalFactors: createMockEnvironmentalFactors({
          altitude: 3000,
        }),
      };

      const result = generator.generateWorkout(parameters);

      expect(result.constraints).toContain(
        "High altitude may significantly impact performance",
      );
    });

    it("should warn about intensity preference conflicts", () => {
      const parameters: CustomWorkoutParameters = {
        type: "tempo",
        phase: "build",
        methodology: "pfitzinger",
        preferences: createMockTrainingPreferences({
          preferredIntensity: "low",
        }),
      };

      const result = generator.generateWorkout(parameters);

      const hasWarning = result.constraints.some((c) =>
        c.includes("high intensity segments despite low intensity preference"),
      );
      expect(hasWarning).toBe(true);
    });
  });

  describe("Alternative Workout Generation", () => {
    let generator: CustomWorkoutGenerator;

    beforeEach(() => {
      generator = new CustomWorkoutGenerator("lydiard");
    });

    it("should generate alternatives when compliance is low", () => {
      // Force low compliance by requesting speed work in base phase
      const parameters: CustomWorkoutParameters = {
        type: "speed",
        phase: "base",
        methodology: "lydiard",
        targetDuration: 45,
      };

      const result = generator.generateWorkout(parameters);

      // Compliance should be low for speed in base
      expect(result.methodologyCompliance).toBeLessThan(80);

      // Should have alternatives
      expect(result.alternatives).toBeDefined();
      expect(result.alternatives?.length).toBeGreaterThan(0);

      // Alternatives should be more appropriate
      result.alternatives?.forEach((alt) => {
        const avgIntensity =
          alt.segments.reduce(
            (sum, seg) => sum + seg.intensity * seg.duration,
            0,
          ) / alt.segments.reduce((sum, seg) => sum + seg.duration, 0);
        expect(avgIntensity).toBeLessThan(85);
      });
    });

    it("should suggest appropriate alternative workout types", () => {
      const parameters: CustomWorkoutParameters = {
        type: "vo2max",
        phase: "base",
        methodology: "lydiard",
        targetDuration: 50,
      };

      const result = generator.generateWorkout(parameters);

      if (result.alternatives) {
        // Alternatives should be more base-appropriate
        const alternativeTypes = result.alternatives.map((alt) => alt.type);
        expect(alternativeTypes).toEqual(
          expect.arrayContaining(["fartlek", "hill_repeats"]),
        );
      }
    });
  });

  describe("Methodology-Specific Rules", () => {
    it("should enforce Daniels pacing zones", () => {
      const generator = new CustomWorkoutGenerator("daniels");
      const workoutTypes: Array<{
        type: WorkoutType;
        expectedIntensity: number;
      }> = [
        { type: "tempo", expectedIntensity: 88 },
        { type: "vo2max", expectedIntensity: 95 },
        { type: "speed", expectedIntensity: 98 },
      ];

      workoutTypes.forEach(({ type, expectedIntensity }) => {
        const result = generator.generateWorkout({
          type,
          phase: "build",
          methodology: "daniels",
        });

        const hasCorrectIntensity = result.workout.segments.some(
          (seg) => seg.intensity === expectedIntensity,
        );
        expect(hasCorrectIntensity).toBe(true);
      });
    });

    it("should enforce Lydiard aerobic emphasis", () => {
      const generator = new CustomWorkoutGenerator("lydiard");
      const parameters: CustomWorkoutParameters = {
        type: "steady",
        phase: "base",
        methodology: "lydiard",
        targetDuration: 90,
      };

      const result = generator.generateWorkout(parameters);

      // Calculate hard percentage
      const hardTime = result.workout.segments
        .filter((seg) => seg.intensity > 85)
        .reduce((sum, seg) => sum + seg.duration, 0);
      const totalTime = result.workout.segments.reduce(
        (sum, seg) => sum + seg.duration,
        0,
      );
      const hardPercentage = hardTime / totalTime;

      expect(hardPercentage).toBeLessThanOrEqual(0.1);
      expect(result.methodologyCompliance).toBeGreaterThanOrEqual(70);
    });

    it("should implement Pfitzinger LT focus", () => {
      const generator = new CustomWorkoutGenerator("pfitzinger");
      const phases: TrainingPhase[] = ["build", "peak"];

      phases.forEach((phase) => {
        const result = generator.generateWorkout({
          type: "threshold",
          phase,
          methodology: "pfitzinger",
        });

        const ltSegments = result.workout.segments.filter(
          (seg) => seg.intensity >= 84 && seg.intensity <= 88,
        );
        expect(ltSegments.length).toBeGreaterThan(0);
        expect(result.methodologyCompliance).toBeGreaterThanOrEqual(75);
      });
    });
  });

  describe("TSS and Recovery Calculations", () => {
    let generator: CustomWorkoutGenerator;

    beforeEach(() => {
      generator = new CustomWorkoutGenerator("daniels");
    });

    it("should calculate appropriate TSS for workouts", () => {
      const parameters: CustomWorkoutParameters = {
        type: "tempo",
        phase: "build",
        methodology: "daniels",
        targetDuration: 60,
      };

      const result = generator.generateWorkout(parameters);

      // TSS should be reasonable for 60min tempo
      expect(result.workout.estimatedTSS).toBeGreaterThan(50);
      expect(result.workout.estimatedTSS).toBeLessThan(100);
    });

    it("should assign appropriate recovery times", () => {
      const workoutTypes: Array<{ type: WorkoutType; minRecovery: number }> = [
        { type: "recovery", minRecovery: 8 },
        { type: "easy", minRecovery: 12 },
        { type: "tempo", minRecovery: 24 },
        { type: "vo2max", minRecovery: 36 },
      ];

      workoutTypes.forEach(({ type, minRecovery }) => {
        const result = generator.generateWorkout({
          type,
          phase: "build",
          methodology: "daniels",
        });

        expect(result.workout.recoveryTime).toBeGreaterThanOrEqual(minRecovery);
      });
    });
  });
});
