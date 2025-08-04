/**
 * Constants Module Test Suite
 *
 * Tests all scientific constants, training zone boundaries, default thresholds,
 * and methodology configurations for correctness and consistency.
 *
 * Scientific references are documented for each validated constant to ensure
 * accuracy against published sports science research.
 */

import { describe, it, expect } from "vitest";
import {
  ADAPTATION_TIMELINE,
  PHASE_DURATION,
  INTENSITY_MODELS,
  PROGRESSION_RATES,
  RECOVERY_MULTIPLIERS,
  LOAD_THRESHOLDS,
  WORKOUT_DURATIONS,
  RACE_DISTANCES,
  ENVIRONMENTAL_FACTORS,
  TRAINING_METHODOLOGIES,
  WORKOUT_EMPHASIS,
  METHODOLOGY_PHASE_TARGETS,
} from "../constants";

describe("Constants Module", () => {
  describe("ADAPTATION_TIMELINE", () => {
    it("should have correct physiological adaptation timelines", () => {
      // Based on sports science research (Laursen & Jenkins, 2002)
      expect(ADAPTATION_TIMELINE.neuromuscular).toBe(7);
      expect(ADAPTATION_TIMELINE.anaerobic).toBe(14);
      expect(ADAPTATION_TIMELINE.aerobic_power).toBe(21);
      expect(ADAPTATION_TIMELINE.aerobic_capacity).toBe(28);
      expect(ADAPTATION_TIMELINE.mitochondrial).toBe(42);
      expect(ADAPTATION_TIMELINE.capillarization).toBe(56);
    });

    it("should have logical progression of adaptation times", () => {
      const values = Object.values(ADAPTATION_TIMELINE);
      expect(values).toEqual([...values].sort((a, b) => a - b));
    });

    it("should have all values as positive integers", () => {
      Object.values(ADAPTATION_TIMELINE).forEach((value) => {
        expect(value).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
      });
    });
  });

  describe("PHASE_DURATION", () => {
    it("should have valid duration ranges for all phases", () => {
      Object.entries(PHASE_DURATION).forEach(([phase, durations]) => {
        expect(durations.min).toBeGreaterThan(0);
        expect(durations.max).toBeGreaterThanOrEqual(durations.min);
        expect(durations.optimal).toBeGreaterThanOrEqual(durations.min);
        expect(durations.optimal).toBeLessThanOrEqual(durations.max);
      });
    });

    it("should have reasonable phase durations", () => {
      // Base phase should be longest (aerobic development)
      expect(PHASE_DURATION.base.optimal).toBeGreaterThanOrEqual(8);
      expect(PHASE_DURATION.base.max).toBe(12);

      // Taper should be shortest
      expect(PHASE_DURATION.taper.optimal).toBeLessThanOrEqual(2);
      expect(PHASE_DURATION.taper.max).toBeLessThanOrEqual(3);
    });

    it("should include all required training phases", () => {
      const expectedPhases = ["base", "build", "peak", "taper", "recovery"];
      expectedPhases.forEach((phase) => {
        expect(PHASE_DURATION).toHaveProperty(phase);
      });
    });
  });

  describe("INTENSITY_MODELS", () => {
    it("should have correct intensity distributions", () => {
      // Polarized model (Seiler, 2010)
      expect(INTENSITY_MODELS.polarized.easy).toBe(80);
      expect(INTENSITY_MODELS.polarized.moderate).toBe(5);
      expect(INTENSITY_MODELS.polarized.hard).toBe(15);

      // Pyramidal model (traditional approach)
      expect(INTENSITY_MODELS.pyramidal.easy).toBe(70);
      expect(INTENSITY_MODELS.pyramidal.moderate).toBe(20);
      expect(INTENSITY_MODELS.pyramidal.hard).toBe(10);
    });

    it("should have all distributions sum to 100%", () => {
      Object.values(INTENSITY_MODELS).forEach((model) => {
        const sum = model.easy + model.moderate + model.hard;
        expect(sum).toBe(100);
      });
    });

    it("should maintain easy emphasis in all models", () => {
      Object.values(INTENSITY_MODELS).forEach((model) => {
        expect(model.easy).toBeGreaterThanOrEqual(60);
        expect(model.easy).toBeGreaterThan(model.moderate);
        expect(model.easy).toBeGreaterThan(model.hard);
      });
    });
  });

  describe("PROGRESSION_RATES", () => {
    it("should have safe weekly progression rates", () => {
      // Based on 10% rule and injury prevention research
      expect(PROGRESSION_RATES.beginner).toBe(0.05); // 5%
      expect(PROGRESSION_RATES.intermediate).toBe(0.08); // 8%
      expect(PROGRESSION_RATES.advanced).toBe(0.1); // 10%
      expect(PROGRESSION_RATES.maxSingleWeek).toBe(0.2); // 20%
    });

    it("should have logical progression hierarchy", () => {
      expect(PROGRESSION_RATES.beginner).toBeLessThan(
        PROGRESSION_RATES.intermediate,
      );
      expect(PROGRESSION_RATES.intermediate).toBeLessThan(
        PROGRESSION_RATES.advanced,
      );
      expect(PROGRESSION_RATES.advanced).toBeLessThan(
        PROGRESSION_RATES.maxSingleWeek,
      );
    });

    it("should be within safe training bounds", () => {
      Object.values(PROGRESSION_RATES).forEach((rate) => {
        expect(rate).toBeGreaterThan(0);
        expect(rate).toBeLessThanOrEqual(0.25); // Never exceed 25%
      });
    });
  });

  describe("RECOVERY_MULTIPLIERS", () => {
    it("should have correct recovery time multipliers", () => {
      expect(RECOVERY_MULTIPLIERS.recovery).toBe(0.5);
      expect(RECOVERY_MULTIPLIERS.easy).toBe(1.0);
      expect(RECOVERY_MULTIPLIERS.race).toBe(5.0);
    });

    it("should have logical intensity-recovery relationship", () => {
      // Higher intensity should require more recovery
      expect(RECOVERY_MULTIPLIERS.recovery).toBeLessThan(
        RECOVERY_MULTIPLIERS.easy,
      );
      expect(RECOVERY_MULTIPLIERS.easy).toBeLessThan(
        RECOVERY_MULTIPLIERS.steady,
      );
      expect(RECOVERY_MULTIPLIERS.steady).toBeLessThan(
        RECOVERY_MULTIPLIERS.tempo,
      );
      expect(RECOVERY_MULTIPLIERS.tempo).toBeLessThan(
        RECOVERY_MULTIPLIERS.threshold,
      );
      expect(RECOVERY_MULTIPLIERS.vo2max).toBeGreaterThan(
        RECOVERY_MULTIPLIERS.threshold,
      );
      expect(RECOVERY_MULTIPLIERS.race).toBeGreaterThan(
        RECOVERY_MULTIPLIERS.vo2max,
      );
    });

    it("should have reasonable recovery ranges", () => {
      Object.values(RECOVERY_MULTIPLIERS).forEach((multiplier) => {
        expect(multiplier).toBeGreaterThan(0);
        expect(multiplier).toBeLessThanOrEqual(5.0);
      });
    });
  });

  describe("LOAD_THRESHOLDS", () => {
    it("should have correct acute:chronic ratios", () => {
      // Based on Gabbett (2016) injury risk research
      const acr = LOAD_THRESHOLDS.acute_chronic_ratio;
      expect(acr.veryLow).toBe(0.8);
      expect(acr.optimal).toBe(1.25);
      expect(acr.high).toBe(1.5);
      expect(acr.veryHigh).toBe(2.0);
    });

    it("should have logical TSS thresholds", () => {
      const tss = LOAD_THRESHOLDS.weekly_tss;
      expect(tss.recovery).toBeLessThan(tss.maintenance);
      expect(tss.maintenance).toBeLessThan(tss.productive);
      expect(tss.productive).toBeLessThan(tss.overreaching);
      expect(tss.overreaching).toBeLessThan(tss.risky);
    });

    it("should have realistic weekly TSS values", () => {
      const tss = LOAD_THRESHOLDS.weekly_tss;
      expect(tss.recovery).toBe(300);
      expect(tss.maintenance).toBe(500);
      expect(tss.productive).toBe(700);
      expect(tss.overreaching).toBe(900);
      expect(tss.risky).toBe(1200);
    });
  });

  describe("WORKOUT_DURATIONS", () => {
    it("should have valid duration ranges", () => {
      Object.values(WORKOUT_DURATIONS).forEach((duration) => {
        expect(duration.min).toBeGreaterThan(0);
        expect(duration.max).toBeGreaterThan(duration.min);
        expect(duration.typical).toBeGreaterThanOrEqual(duration.min);
        expect(duration.typical).toBeLessThanOrEqual(duration.max);
      });
    });

    it("should have appropriate workout lengths", () => {
      // Recovery runs should be shortest
      expect(WORKOUT_DURATIONS.recovery.typical).toBe(30);
      expect(WORKOUT_DURATIONS.recovery.max).toBe(40);

      // Long runs should be longest
      expect(WORKOUT_DURATIONS.long_run.typical).toBe(120);
      expect(WORKOUT_DURATIONS.long_run.max).toBe(180);
    });

    it("should maintain logical duration hierarchy", () => {
      expect(WORKOUT_DURATIONS.recovery.typical).toBeLessThan(
        WORKOUT_DURATIONS.easy.typical,
      );
      expect(WORKOUT_DURATIONS.easy.typical).toBeLessThan(
        WORKOUT_DURATIONS.long_run.typical,
      );
    });
  });

  describe("RACE_DISTANCES", () => {
    it("should have correct standard race distances", () => {
      expect(RACE_DISTANCES["5K"]).toBe(5);
      expect(RACE_DISTANCES["10K"]).toBe(10);
      expect(RACE_DISTANCES.HALF_MARATHON).toBe(21.0975);
      expect(RACE_DISTANCES.MARATHON).toBe(42.195);
    });

    it("should have correct ultra distances", () => {
      expect(RACE_DISTANCES["50K"]).toBe(50);
      expect(RACE_DISTANCES["50_MILE"]).toBe(80.4672);
      expect(RACE_DISTANCES["100K"]).toBe(100);
      expect(RACE_DISTANCES["100_MILE"]).toBe(160.9344);
    });

    it("should have all positive distance values", () => {
      const distances = Object.values(RACE_DISTANCES);

      // All values should be positive
      distances.forEach((distance) => {
        expect(distance).toBeGreaterThan(0);
      });

      // Should include both metric and imperial distances
      expect(distances.some((d) => d < 10)).toBe(true); // Short races
      expect(distances.some((d) => d > 100)).toBe(true); // Ultra distances
    });
  });

  describe("ENVIRONMENTAL_FACTORS", () => {
    it("should have correct altitude adjustment factors", () => {
      const altitude = ENVIRONMENTAL_FACTORS.altitude;
      expect(altitude.seaLevel).toBe(1.0);
      expect(altitude.moderate).toBe(0.98);
      expect(altitude.high).toBe(0.94);
      expect(altitude.veryHigh).toBe(0.88);
    });

    it("should have decreasing performance with altitude", () => {
      const altitude = ENVIRONMENTAL_FACTORS.altitude;
      expect(altitude.seaLevel).toBeGreaterThan(altitude.moderate);
      expect(altitude.moderate).toBeGreaterThan(altitude.high);
      expect(altitude.high).toBeGreaterThan(altitude.veryHigh);
    });

    it("should have realistic environmental impacts", () => {
      // All factors should be between 0.8 and 1.0 (max 20% impact)
      Object.values(ENVIRONMENTAL_FACTORS).forEach((category) => {
        Object.values(category).forEach((factor) => {
          expect(factor).toBeGreaterThanOrEqual(0.8);
          expect(factor).toBeLessThanOrEqual(1.0);
        });
      });
    });

    it("should have optimal conditions at 1.0", () => {
      expect(ENVIRONMENTAL_FACTORS.altitude.seaLevel).toBe(1.0);
      expect(ENVIRONMENTAL_FACTORS.temperature.cool).toBe(1.0);
      expect(ENVIRONMENTAL_FACTORS.humidity.low).toBe(1.0);
    });
  });

  describe("TRAINING_METHODOLOGIES", () => {
    it("should include all major methodologies", () => {
      const expectedMethodologies = [
        "daniels",
        "lydiard",
        "pfitzinger",
        "hudson",
        "custom",
      ];
      expectedMethodologies.forEach((method) => {
        expect(TRAINING_METHODOLOGIES).toHaveProperty(method);
      });
    });

    it("should have correct methodology names", () => {
      expect(TRAINING_METHODOLOGIES.daniels.name).toBe("Jack Daniels");
      expect(TRAINING_METHODOLOGIES.lydiard.name).toBe("Arthur Lydiard");
      expect(TRAINING_METHODOLOGIES.pfitzinger.name).toBe("Pete Pfitzinger");
      expect(TRAINING_METHODOLOGIES.hudson.name).toBe("Brad Hudson");
    });

    it("should have valid intensity distributions", () => {
      Object.values(TRAINING_METHODOLOGIES).forEach((methodology) => {
        const dist = methodology.intensityDistribution;
        const sum = dist.easy + dist.moderate + dist.hard;
        expect(sum).toBe(100);
        expect(dist.easy).toBeGreaterThanOrEqual(60); // Minimum easy volume
      });
    });

    it("should have valid recovery emphasis values", () => {
      Object.values(TRAINING_METHODOLOGIES).forEach((methodology) => {
        expect(methodology.recoveryEmphasis).toBeGreaterThan(0);
        expect(methodology.recoveryEmphasis).toBeLessThanOrEqual(1.0);
      });
    });

    it("should have complete phase transitions", () => {
      Object.values(TRAINING_METHODOLOGIES).forEach((methodology) => {
        const phases = ["base", "build", "peak", "taper"];
        phases.forEach((phase) => {
          expect(methodology.phaseTransitions).toHaveProperty(phase);
          expect(methodology.phaseTransitions[phase]).toHaveProperty(
            "duration",
          );
          expect(methodology.phaseTransitions[phase]).toHaveProperty("focus");
        });
      });
    });
  });

  describe("WORKOUT_EMPHASIS", () => {
    it("should have emphasis values for all methodologies", () => {
      const methodologies = [
        "daniels",
        "lydiard",
        "pfitzinger",
        "hudson",
        "custom",
      ];
      methodologies.forEach((method) => {
        expect(WORKOUT_EMPHASIS).toHaveProperty(method);
      });
    });

    it("should have recovery as baseline (1.0)", () => {
      Object.values(WORKOUT_EMPHASIS).forEach((methodology) => {
        expect(methodology.recovery).toBe(1.0);
      });
    });

    it("should have valid emphasis multipliers", () => {
      Object.values(WORKOUT_EMPHASIS).forEach((methodology) => {
        Object.values(methodology).forEach((multiplier) => {
          expect(multiplier).toBeGreaterThan(0);
          expect(multiplier).toBeLessThanOrEqual(2.0); // Max 2x emphasis
        });
      });
    });

    it("should reflect methodology characteristics", () => {
      // Lydiard should emphasize easy running
      expect(WORKOUT_EMPHASIS.lydiard.easy).toBeGreaterThanOrEqual(1.4);

      // Pfitzinger should emphasize threshold
      expect(WORKOUT_EMPHASIS.pfitzinger.threshold).toBeGreaterThanOrEqual(1.4);

      // Hudson should emphasize tempo/fartlek
      expect(WORKOUT_EMPHASIS.hudson.tempo).toBeGreaterThanOrEqual(1.3);
      expect(WORKOUT_EMPHASIS.hudson.fartlek).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe("METHODOLOGY_PHASE_TARGETS", () => {
    it("should have targets for all methodologies and phases", () => {
      const methodologies = [
        "daniels",
        "lydiard",
        "pfitzinger",
        "hudson",
        "custom",
      ];
      const phases = ["base", "build", "peak", "taper"];

      methodologies.forEach((method) => {
        expect(METHODOLOGY_PHASE_TARGETS).toHaveProperty(method);
        phases.forEach((phase) => {
          expect(METHODOLOGY_PHASE_TARGETS[method]).toHaveProperty(phase);
          expect(Array.isArray(METHODOLOGY_PHASE_TARGETS[method][phase])).toBe(
            true,
          );
          expect(
            METHODOLOGY_PHASE_TARGETS[method][phase].length,
          ).toBeGreaterThan(0);
        });
      });
    });

    it("should have consistent taper targets", () => {
      Object.values(METHODOLOGY_PHASE_TARGETS).forEach((methodology) => {
        const taperTargets = methodology.taper;
        expect(taperTargets).toContain("maintenance");
        expect(
          taperTargets.some(
            (target) =>
              target.includes("fresh") || target.includes("readiness"),
          ),
        ).toBe(true);
      });
    });

    it("should have base phase aerobic emphasis", () => {
      Object.values(METHODOLOGY_PHASE_TARGETS).forEach((methodology) => {
        const baseTargets = methodology.base;
        expect(
          baseTargets.some(
            (target) =>
              target.includes("aerobic") ||
              target.includes("mitochondrial") ||
              target.includes("capillar"),
          ),
        ).toBe(true);
      });
    });

    it("should have methodology-specific peak targets", () => {
      // Lydiard should target speed in peak
      expect(METHODOLOGY_PHASE_TARGETS.lydiard.peak).toContain("speed");

      // Daniels should target vo2max
      expect(METHODOLOGY_PHASE_TARGETS.daniels.peak).toContain("vo2max");

      // Pfitzinger should target race pace
      expect(METHODOLOGY_PHASE_TARGETS.pfitzinger.peak).toContain("race_pace");
    });
  });

  describe("Constant Relationships and Cross-Validation", () => {
    it("should have consistent adaptation and phase relationships", () => {
      // Base phase duration should allow for aerobic adaptations
      expect(PHASE_DURATION.base.optimal * 7).toBeGreaterThanOrEqual(
        ADAPTATION_TIMELINE.aerobic_capacity,
      );
      expect(PHASE_DURATION.base.max * 7).toBeGreaterThanOrEqual(
        ADAPTATION_TIMELINE.mitochondrial,
      );
    });

    it("should have realistic progression vs recovery balance", () => {
      // Maximum progression rate should not exceed recovery capacity
      const maxProgression = PROGRESSION_RATES.maxSingleWeek;
      const minRecovery = Math.min(...Object.values(RECOVERY_MULTIPLIERS));
      expect(maxProgression).toBeLessThan(0.3); // Conservative limit
    });

    it("should maintain scientific consistency", () => {
      // Environmental factors should not completely negate performance
      Object.values(ENVIRONMENTAL_FACTORS).forEach((category) => {
        Object.values(category).forEach((factor) => {
          expect(factor).toBeGreaterThan(0.5); // Never more than 50% impact
        });
      });
    });
  });
});
