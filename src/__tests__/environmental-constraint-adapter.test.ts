import { describe, it, expect, beforeEach } from "vitest";
import {
  EnvironmentalConstraintAdapter,
  DetailedEnvironmentalFactors,
  EquipmentConstraints,
  TimeConstraints,
  InjuryConstraints,
  AdaptationResult,
} from "../environmental-constraint-adapter";
import { TrainingPlan, TrainingMethodology, CompletedWorkout } from "../types";

// Helper function to create mock training plan
function createMockTrainingPlan(): TrainingPlan {
  return {
    id: "test-plan",
    config: {
      name: "Test Plan",
      goal: "MARATHON",
      startDate: new Date(),
      endDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
      methodology: "daniels",
    },
    blocks: [
      {
        id: "block-1",
        phase: "base",
        startDate: new Date(),
        endDate: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000),
        weeks: 4,
        focusAreas: ["aerobic base"],
        microcycles: [],
      },
    ],
    summary: {
      totalWeeks: 16,
      totalWorkouts: 80,
      totalDistance: 640,
      totalTime: 4800, // 5 hours per week
      peakWeeklyDistance: 50,
      averageWeeklyDistance: 40,
      keyWorkouts: 32,
      recoveryDays: 32,
      phases: [],
    },
    workouts: [],
  };
}

// Helper function to create mock environmental factors
function createMockEnvironmentalFactors(
  overrides?: Partial<DetailedEnvironmentalFactors>,
): DetailedEnvironmentalFactors {
  return {
    altitude: 500,
    typicalTemperature: 20,
    humidity: 50,
    terrain: "flat",
    windSpeed: 10,
    precipitation: 0,
    airQuality: "good",
    daylightHours: 12,
    seasonalFactors: {
      pollen: "low",
      extremeWeather: false,
    },
    ...overrides,
  };
}

// Helper function to create mock equipment constraints
function createMockEquipmentConstraints(
  overrides?: Partial<EquipmentConstraints>,
): EquipmentConstraints {
  return {
    availableSurfaces: ["road", "track", "trail"],
    hasGym: true,
    hasPool: true,
    weatherGear: {
      coldWeather: true,
      rainGear: true,
      windResistant: true,
    },
    safetyEquipment: {
      reflectiveGear: true,
      lights: true,
      emergencyDevice: true,
    },
    ...overrides,
  };
}

// Helper function to create mock time constraints
function createMockTimeConstraints(
  overrides?: Partial<TimeConstraints>,
): TimeConstraints {
  return {
    weeklyAvailableHours: 8,
    dailyTimeSlots: {
      morning: 60,
      afternoon: 45,
      evening: 60,
    },
    preferredWorkoutDuration: {
      min: 30,
      max: 120,
      optimal: 60,
    },
    flexibilityLevel: "moderate",
    consistentSchedule: true,
    ...overrides,
  };
}

// Helper function to create mock injury constraints
function createMockInjuryConstraints(
  overrides?: Partial<InjuryConstraints>,
): InjuryConstraints {
  return {
    currentInjuries: [],
    injuryHistory: [],
    painAreas: [],
    riskFactors: [],
    recoveryProtocols: [],
    ...overrides,
  };
}

// Helper function to create mock completed workouts
function createMockCompletedWorkouts(count: number = 10): CompletedWorkout[] {
  const workouts: CompletedWorkout[] = [];
  const baseDate = new Date();

  for (let i = 0; i < count; i++) {
    workouts.push({
      id: `completed-${i}`,
      date: new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000),
      plannedWorkout: {
        id: `planned-${i}`,
        date: new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000),
        type: i % 3 === 0 ? "tempo" : "easy",
        name: `Workout ${i}`,
        targetMetrics: {
          duration: 45,
          distance: 8,
          tss: 50,
          load: 100,
          intensity: i % 3 === 0 ? 85 : 70,
        },
      },
      actualMetrics: {
        duration: 44,
        distance: 7.8,
        averagePace: 5.5,
        averageHeartRate: i % 3 === 0 ? 165 : 145,
        calories: 500,
        elevationGain: 50,
      },
      completed: true,
      notes: `Workout ${i} completed`,
      rpe: i % 3 === 0 ? 7 : 5,
      feelingScore: 4,
      conditions: {
        temperature: 20,
        humidity: 50,
        wind: 5,
        precipitation: false,
      },
    });
  }

  return workouts;
}

describe("EnvironmentalConstraintAdapter", () => {
  let adapter: EnvironmentalConstraintAdapter;
  let mockPlan: TrainingPlan;
  let mockEnvironmental: DetailedEnvironmentalFactors;
  let mockEquipment: EquipmentConstraints;
  let mockTime: TimeConstraints;
  let mockInjury: InjuryConstraints;

  beforeEach(() => {
    adapter = new EnvironmentalConstraintAdapter();
    mockPlan = createMockTrainingPlan();
    mockEnvironmental = createMockEnvironmentalFactors();
    mockEquipment = createMockEquipmentConstraints();
    mockTime = createMockTimeConstraints();
    mockInjury = createMockInjuryConstraints();
  });

  describe("Environmental Adaptations (Requirement 6.3)", () => {
    it("should create altitude adaptations for moderate altitude", () => {
      const highAltitudeEnvironment = createMockEnvironmentalFactors({
        altitude: 2000, // Moderate altitude
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        highAltitudeEnvironment,
        mockEquipment,
        mockTime,
        mockInjury,
      );

      expect(result.modifications.length).toBeGreaterThan(0);

      const altitudeModification = result.modifications.find((mod) =>
        mod.reason.includes("Altitude adaptation"),
      );
      expect(altitudeModification).toBeDefined();
      expect(altitudeModification!.priority).toBe("high");
      expect(
        altitudeModification!.suggestedChanges.intensityReduction,
      ).toBeGreaterThan(0);

      const altitudeConstraint = result.constraints.environmental.find(
        (constraint) => constraint.factor === "altitude",
      );
      expect(altitudeConstraint).toBeDefined();
      expect(altitudeConstraint!.impact).toBe("moderate");
    });

    it("should create extreme altitude adaptations for high altitude", () => {
      const extremeAltitudeEnvironment = createMockEnvironmentalFactors({
        altitude: 4000, // High altitude
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "lydiard",
        extremeAltitudeEnvironment,
        mockEquipment,
        mockTime,
        mockInjury,
      );

      const altitudeModifications = result.modifications.filter(
        (mod) =>
          mod.reason.includes("altitude") || mod.reason.includes("Altitude"),
      );
      expect(altitudeModifications.length).toBeGreaterThanOrEqual(2);

      // Should have intensity reduction
      const intensityMod = altitudeModifications.find(
        (mod) => mod.type === "reduce_intensity",
      );
      expect(intensityMod).toBeDefined();
      expect(intensityMod!.suggestedChanges.intensityReduction).toBeGreaterThan(
        15,
      );

      // Should have phase adjustment for Lydiard
      const phaseMod = altitudeModifications.find(
        (mod) => mod.type === "phase_adjustment",
      );
      expect(phaseMod).toBeDefined();
    });

    it("should create heat adaptations for hot weather", () => {
      const hotEnvironment = createMockEnvironmentalFactors({
        typicalTemperature: 35, // Very hot
        humidity: 80, // High humidity
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "pfitzinger",
        hotEnvironment,
        mockEquipment,
        mockTime,
        mockInjury,
      );

      const heatModifications = result.modifications.filter(
        (mod) => mod.reason.includes("Heat") || mod.reason.includes("heat"),
      );
      expect(heatModifications.length).toBeGreaterThanOrEqual(2);

      // Should reduce intensity
      const intensityMod = heatModifications.find(
        (mod) => mod.type === "reduce_intensity",
      );
      expect(intensityMod).toBeDefined();
      expect(intensityMod!.priority).toBe("high");

      // Should adjust timing
      const timingMod = heatModifications.find(
        (mod) => mod.type === "workout_timing",
      );
      expect(timingMod).toBeDefined();
      expect(timingMod!.suggestedChanges.avoidTimeWindows).toContain(
        "10:00-16:00",
      );

      const heatConstraint = result.constraints.environmental.find(
        (constraint) => constraint.factor === "heat_index",
      );
      expect(heatConstraint).toBeDefined();
      expect(heatConstraint!.impact).toMatch(/moderate|significant/);
    });

    it("should create cold weather adaptations", () => {
      const coldEnvironment = createMockEnvironmentalFactors({
        typicalTemperature: -5, // Cold weather
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        coldEnvironment,
        mockEquipment,
        mockTime,
        mockInjury,
      );

      const coldModification = result.modifications.find((mod) =>
        mod.reason.includes("Cold weather"),
      );
      expect(coldModification).toBeDefined();
      expect(coldModification!.type).toBe("workout_timing");
      expect(coldModification!.suggestedChanges.warmupExtension).toBe(15);

      const coldConstraint = result.constraints.environmental.find(
        (constraint) => constraint.factor === "cold_temperature",
      );
      expect(coldConstraint).toBeDefined();
    });

    it("should create terrain-specific adaptations", () => {
      const hillyEnvironment = createMockEnvironmentalFactors({
        terrain: "hilly",
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "lydiard",
        hillyEnvironment,
        mockEquipment,
        mockTime,
        mockInjury,
      );

      const terrainModifications = result.modifications.filter(
        (mod) => mod.reason.includes("terrain") || mod.reason.includes("Hill"),
      );
      expect(terrainModifications.length).toBeGreaterThan(0);

      const substitutionMod = terrainModifications.find(
        (mod) => mod.type === "workout_substitution",
      );
      expect(substitutionMod).toBeDefined();
      expect(substitutionMod!.suggestedChanges.substituteWorkoutType).toBe(
        "hill_repeats",
      );

      // Lydiard should get phase enhancement
      const enhancementMod = terrainModifications.find(
        (mod) => mod.type === "phase_enhancement",
      );
      expect(enhancementMod).toBeDefined();
    });

    it("should create weather-specific adaptations for extreme conditions", () => {
      const extremeWeatherEnvironment = createMockEnvironmentalFactors({
        windSpeed: 50, // High wind
        precipitation: 25, // Heavy rain
        airQuality: "poor",
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        extremeWeatherEnvironment,
        mockEquipment,
        mockTime,
        mockInjury,
      );

      // Should have wind adaptations
      const windMod = result.modifications.find((mod) =>
        mod.reason.includes("wind"),
      );
      expect(windMod).toBeDefined();

      // Should have precipitation adaptations
      const precipMod = result.modifications.find((mod) =>
        mod.reason.includes("precipitation"),
      );
      expect(precipMod).toBeDefined();
      expect(precipMod!.type).toBe("safety_adjustment");
      expect(precipMod!.priority).toBe("high");

      // Should have air quality adaptations
      const airQualityMod = result.modifications.find((mod) =>
        mod.reason.includes("air quality"),
      );
      expect(airQualityMod).toBeDefined();
      expect(airQualityMod!.type).toBe("reduce_intensity");
      expect(airQualityMod!.suggestedChanges.intensityReduction).toBe(25);
    });
  });

  describe("Equipment Constraint Adaptations", () => {
    it("should adapt for limited surface availability", () => {
      const limitedEquipment = createMockEquipmentConstraints({
        availableSurfaces: ["road"], // No track access
        hasGym: false,
        hasPool: false,
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        mockEnvironmental,
        limitedEquipment,
        mockTime,
        mockInjury,
      );

      // Should substitute track workouts
      const trackSubstitution = result.modifications.find((mod) =>
        mod.reason.includes("No track access"),
      );
      expect(trackSubstitution).toBeDefined();
      expect(trackSubstitution!.type).toBe("workout_substitution");

      // Should adapt for no gym
      const gymSubstitution = result.modifications.find((mod) =>
        mod.reason.includes("No gym access"),
      );
      expect(gymSubstitution).toBeDefined();

      // Check equipment constraints
      const trackConstraint = result.constraints.equipment.find(
        (constraint) => constraint.missing === "running_track",
      );
      expect(trackConstraint).toBeDefined();
      expect(trackConstraint!.effectiveness).toBe(85);

      const gymConstraint = result.constraints.equipment.find(
        (constraint) => constraint.missing === "gym_access",
      );
      expect(gymConstraint).toBeDefined();
      expect(gymConstraint!.effectiveness).toBe(70);
    });

    it("should adapt for missing safety equipment", () => {
      const unsafeEquipment = createMockEquipmentConstraints({
        safetyEquipment: {
          reflectiveGear: false,
          lights: false,
          emergencyDevice: false,
        },
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "pfitzinger",
        mockEnvironmental,
        unsafeEquipment,
        mockTime,
        mockInjury,
      );

      const safetyModification = result.modifications.find((mod) =>
        mod.reason.includes("Safety equipment"),
      );
      expect(safetyModification).toBeDefined();
      expect(safetyModification!.type).toBe("timing_restriction");
      expect(safetyModification!.priority).toBe("high");
      expect(safetyModification!.suggestedChanges.daylightOnlyRunning).toBe(
        true,
      );

      // Should recommend safety equipment investment
      const safetyRecommendation = result.recommendations.find(
        (rec) => rec.category === "equipment" && rec.priority === "critical",
      );
      expect(safetyRecommendation).toBeDefined();
      expect(safetyRecommendation!.recommendation).toContain(
        "safety equipment",
      );
    });

    it("should adapt for weather gear limitations", () => {
      const limitedWeatherGear = createMockEquipmentConstraints({
        weatherGear: {
          coldWeather: false,
          rainGear: false,
          windResistant: false,
        },
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "lydiard",
        mockEnvironmental,
        limitedWeatherGear,
        mockTime,
        mockInjury,
      );

      const weatherGearModification = result.modifications.find((mod) =>
        mod.reason.includes("Limited weather gear"),
      );
      expect(weatherGearModification).toBeDefined();
      expect(weatherGearModification!.type).toBe("seasonal_planning");
      expect(
        weatherGearModification!.suggestedChanges.indoorSeasonalOptions,
      ).toBe(true);
    });
  });

  describe("Time Constraint Adaptations (Requirement 6.8)", () => {
    it("should compress training for severe time constraints", () => {
      const severeTimeConstraints = createMockTimeConstraints({
        weeklyAvailableHours: 4, // Much less than typical 8 hours needed
        preferredWorkoutDuration: {
          min: 20,
          max: 45,
          optimal: 30,
        },
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        mockEnvironmental,
        mockEquipment,
        severeTimeConstraints,
        mockInjury,
      );

      const timeCompressionMod = result.modifications.find(
        (mod) => mod.type === "time_compression",
      );
      expect(timeCompressionMod).toBeDefined();
      expect(timeCompressionMod!.priority).toBe("high");
      expect(timeCompressionMod!.reason).toContain("Time deficit");

      const durationConstraintMod = result.modifications.find(
        (mod) => mod.type === "duration_constraint",
      );
      expect(durationConstraintMod).toBeDefined();
      expect(durationConstraintMod!.suggestedChanges.splitLongRuns).toBe(true);

      // Should have time constraints documented
      expect(result.constraints.time.length).toBeGreaterThan(0);
      const timeConstraint = result.constraints.time[0];
      expect(timeConstraint.shortfall).toBeGreaterThan(0);
      expect(timeConstraint.compression).toBeDefined();
      expect(timeConstraint.compression.retainedEffectiveness).toBeLessThan(90);
    });

    it("should optimize for daily time slot limitations", () => {
      const limitedTimeSlots = createMockTimeConstraints({
        dailyTimeSlots: {
          morning: 30, // Very limited morning time
          afternoon: undefined,
          evening: 60,
        },
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "pfitzinger",
        mockEnvironmental,
        mockEquipment,
        limitedTimeSlots,
        mockInjury,
      );

      const timingModification = result.modifications.find(
        (mod) =>
          mod.type === "workout_timing" &&
          mod.reason.includes("Limited morning time"),
      );
      expect(timingModification).toBeDefined();
      expect(
        timingModification!.suggestedChanges.morningWorkoutTypes,
      ).toContain("easy_short");
      expect(
        timingModification!.suggestedChanges.qualityWorkoutsToOtherSlots,
      ).toBe(true);
    });

    it("should create different compression strategies based on time deficit", () => {
      // Test intensity focus strategy
      const moderateTimeConstraints = createMockTimeConstraints({
        weeklyAvailableHours: 6, // 2 hours short
      });

      const moderateResult = adapter.adaptPlan(
        mockPlan,
        "daniels",
        mockEnvironmental,
        mockEquipment,
        moderateTimeConstraints,
        mockInjury,
      );

      const moderateCompression =
        moderateResult.constraints.time[0]?.compression;
      expect(moderateCompression?.approach).toBe("intensity_focus");
      expect(moderateCompression?.retainedEffectiveness).toBeGreaterThan(85);

      // Test key workout only strategy
      const severeTimeConstraints = createMockTimeConstraints({
        weeklyAvailableHours: 2, // 6 hours short
      });

      const severeResult = adapter.adaptPlan(
        mockPlan,
        "lydiard",
        mockEnvironmental,
        mockEquipment,
        severeTimeConstraints,
        mockInjury,
      );

      const severeCompression = severeResult.constraints.time[0]?.compression;
      expect(severeCompression?.approach).toBe("key_workout_only");
      expect(severeCompression?.retainedEffectiveness).toBeLessThan(70);
    });

    it("should provide time management recommendations", () => {
      const timeConstrainedSetup = createMockTimeConstraints({
        weeklyAvailableHours: 5,
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "pfitzinger",
        mockEnvironmental,
        mockEquipment,
        timeConstrainedSetup,
        mockInjury,
      );

      const timeRecommendation = result.recommendations.find(
        (rec) => rec.category === "scheduling",
      );
      expect(timeRecommendation).toBeDefined();
      expect(timeRecommendation!.recommendation).toContain(
        "high-intensity, low-volume",
      );
    });
  });

  describe("Injury Constraint Adaptations (Requirement 6.6)", () => {
    it("should adapt for current injuries", () => {
      const injuryConstraints = createMockInjuryConstraints({
        currentInjuries: [
          {
            type: "knee_pain",
            severity: "moderate",
            stage: "healing",
            restrictions: ["no_running", "no_jumping"],
            expectedRecovery: 3,
          },
        ],
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        mockEnvironmental,
        mockEquipment,
        mockTime,
        injuryConstraints,
      );

      const injuryModification = result.modifications.find(
        (mod) => mod.type === "injury_accommodation",
      );
      expect(injuryModification).toBeDefined();
      expect(injuryModification!.priority).toBe("critical");
      expect(injuryModification!.reason).toContain("knee_pain");
      expect(injuryModification!.suggestedChanges.avoidActivities).toContain(
        "no_running",
      );

      const injuryConstraint = result.constraints.injury.find((constraint) =>
        constraint.restriction.includes("knee_pain"),
      );
      expect(injuryConstraint).toBeDefined();
      expect(injuryConstraint!.monitoringRequired).toBe(true);
    });

    it("should adapt for injury history", () => {
      const injuryHistoryConstraints = createMockInjuryConstraints({
        injuryHistory: ["IT_band", "plantar_fasciitis"],
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "lydiard",
        mockEnvironmental,
        mockEquipment,
        mockTime,
        injuryHistoryConstraints,
      );

      const preventionModifications = result.modifications.filter(
        (mod) => mod.type === "injury_prevention",
      );
      expect(preventionModifications.length).toBe(2); // One for each injury

      const itBandPrevention = preventionModifications.find((mod) =>
        mod.reason.includes("IT_band"),
      );
      expect(itBandPrevention).toBeDefined();

      const pfPrevention = preventionModifications.find((mod) =>
        mod.reason.includes("plantar_fasciitis"),
      );
      expect(pfPrevention).toBeDefined();
    });

    it("should adapt for high-risk factors", () => {
      const highRiskConstraints = createMockInjuryConstraints({
        riskFactors: [
          {
            type: "biomechanical",
            description: "Overpronation",
            severity: "high",
            mitigationStrategies: [
              "orthotics",
              "strength_training",
              "gait_analysis",
            ],
          },
        ],
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "pfitzinger",
        mockEnvironmental,
        mockEquipment,
        mockTime,
        highRiskConstraints,
      );

      const riskMitigation = result.modifications.find(
        (mod) => mod.type === "risk_mitigation",
      );
      expect(riskMitigation).toBeDefined();
      expect(riskMitigation!.priority).toBe("high");
      expect(riskMitigation!.suggestedChanges.mitigationStrategies).toContain(
        "orthotics",
      );

      // Should recommend injury prevention program
      const preventionRecommendation = result.recommendations.find(
        (rec) => rec.category === "injury_prevention",
      );
      expect(preventionRecommendation).toBeDefined();
    });

    it("should assess dynamic injury risk from workout history", () => {
      const completedWorkouts = createMockCompletedWorkouts(15);

      // Create pattern suggesting overtraining
      completedWorkouts.forEach((workout, index) => {
        if (index < 5) {
          workout.actualDuration = 90; // Recent high load
        }
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        mockEnvironmental,
        mockEquipment,
        mockTime,
        mockInjury,
        completedWorkouts,
      );

      // May include dynamic risk mitigation based on training load calculation
      const riskAssessment = result.riskAssessment;
      expect(riskAssessment).toBeDefined();
      expect(riskAssessment.overallRisk).toMatch(/low|moderate|high|critical/);
      expect(riskAssessment.specificRisks).toBeDefined();
    });
  });

  describe("Comprehensive Adaptation Integration", () => {
    it("should handle multiple constraint types simultaneously", () => {
      const complexEnvironmental = createMockEnvironmentalFactors({
        altitude: 2500,
        typicalTemperature: 32,
        terrain: "hilly",
        airQuality: "moderate",
      });

      const limitedEquipment = createMockEquipmentConstraints({
        availableSurfaces: ["road"],
        hasGym: false,
        safetyEquipment: {
          reflectiveGear: false,
          lights: false,
          emergencyDevice: false,
        },
      });

      const tightTimeConstraints = createMockTimeConstraints({
        weeklyAvailableHours: 5,
        preferredWorkoutDuration: { min: 20, max: 50, optimal: 35 },
      });

      const injuryConstraints = createMockInjuryConstraints({
        injuryHistory: ["IT_band"],
        riskFactors: [
          {
            type: "training_load",
            description: "Rapid increase pattern",
            severity: "moderate",
            mitigationStrategies: ["gradual_progression"],
          },
        ],
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        complexEnvironmental,
        limitedEquipment,
        tightTimeConstraints,
        injuryConstraints,
      );

      // Should have modifications from all categories
      expect(result.modifications.length).toBeGreaterThan(8);
      expect(result.constraints.environmental.length).toBeGreaterThan(0);
      expect(result.constraints.equipment.length).toBeGreaterThan(0);
      expect(result.constraints.time.length).toBeGreaterThan(0);
      expect(result.constraints.injury.length).toBeGreaterThan(0);

      // Should provide comprehensive recommendations
      expect(result.recommendations.length).toBeGreaterThan(3);
      expect(
        result.recommendations.some((r) => r.category === "environmental"),
      ).toBe(true);
      expect(
        result.recommendations.some((r) => r.category === "equipment"),
      ).toBe(true);

      // Should assess overall risk appropriately
      expect(result.riskAssessment.overallRisk).toMatch(/moderate|high/);
      expect(result.riskAssessment.specificRisks.length).toBeGreaterThan(1);

      // Effectiveness should be reduced but reasonable
      expect(result.effectiveness).toBeGreaterThan(50);
      expect(result.effectiveness).toBeLessThan(90);
    });

    it("should resolve conflicting adaptations appropriately", () => {
      // Create scenario with conflicting demands
      const coldHighAltitude = createMockEnvironmentalFactors({
        altitude: 3000, // Wants intensity reduction
        typicalTemperature: -10, // Wants indoor alternatives
      });

      const limitedTime = createMockTimeConstraints({
        weeklyAvailableHours: 4, // Wants intensity increase for efficiency
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "pfitzinger",
        coldHighAltitude,
        mockEquipment,
        limitedTime,
        mockInjury,
      );

      // Should resolve conflicts based on priority (altitude safety > time efficiency)
      const intensityReductions = result.modifications.filter(
        (mod) => mod.type === "reduce_intensity",
      );
      const intensityIncreases = result.modifications.filter(
        (mod) =>
          mod.type === "increase_intensity" ||
          (mod.type === "time_compression" &&
            mod.suggestedChanges.intensityCompensation),
      );

      // Should prioritize safety (altitude) over efficiency (time)
      expect(intensityReductions.length).toBeGreaterThanOrEqual(1);

      // Should still address time constraints but not conflict with safety
      const timeModifications = result.modifications.filter(
        (mod) =>
          mod.type === "time_compression" || mod.type === "duration_constraint",
      );
      expect(timeModifications.length).toBeGreaterThan(0);
    });

    it("should provide methodology-specific adaptations", () => {
      const testEnvironment = createMockEnvironmentalFactors({
        altitude: 2000,
        terrain: "hilly",
      });

      // Test Daniels methodology
      const danielsResult = adapter.adaptPlan(
        mockPlan,
        "daniels",
        testEnvironment,
        mockEquipment,
        mockTime,
        mockInjury,
      );

      // Test Lydiard methodology
      const lydiardResult = adapter.adaptPlan(
        mockPlan,
        "lydiard",
        testEnvironment,
        mockEquipment,
        mockTime,
        mockInjury,
      );

      // Should have different adaptations based on methodology
      const danielsHasVDOT = danielsResult.modifications.some((mod) =>
        mod.reason.includes("VDOT"),
      );
      const lydiardHasAerobic = lydiardResult.modifications.some(
        (mod) =>
          mod.reason.includes("aerobic") || mod.reason.includes("Lydiard"),
      );

      // Daniels should have VDOT-related adaptations
      expect(
        danielsHasVDOT ||
          danielsResult.recommendations.some((r) =>
            r.recommendation.includes("VDOT"),
          ),
      ).toBe(true);

      // Lydiard should have aerobic base extensions
      expect(lydiardHasAerobic).toBe(true);
    });

    it("should calculate adaptation effectiveness accurately", () => {
      // Minimal constraints - should have high effectiveness
      const minimalResult = adapter.adaptPlan(
        mockPlan,
        "daniels",
        mockEnvironmental,
        mockEquipment,
        mockTime,
        mockInjury,
      );
      expect(minimalResult.effectiveness).toBeGreaterThan(90);

      // Heavy constraints - should have lower effectiveness
      const heavyConstraints = adapter.adaptPlan(
        mockPlan,
        "daniels",
        createMockEnvironmentalFactors({
          altitude: 4000,
          typicalTemperature: 35,
        }),
        createMockEquipmentConstraints({
          availableSurfaces: ["road"],
          hasGym: false,
        }),
        createMockTimeConstraints({ weeklyAvailableHours: 3 }),
        createMockInjuryConstraints({
          currentInjuries: [
            {
              type: "knee",
              severity: "moderate",
              stage: "healing",
              restrictions: ["no_running"],
              expectedRecovery: 4,
            },
          ],
        }),
      );
      expect(heavyConstraints.effectiveness).toBeLessThan(70);
    });
  });

  describe("Risk Assessment and Monitoring", () => {
    it("should assess overall risk levels appropriately", () => {
      const highRiskScenario = createMockInjuryConstraints({
        currentInjuries: [
          {
            type: "stress_fracture",
            severity: "severe",
            stage: "acute",
            restrictions: ["no_impact"],
            expectedRecovery: 8,
          },
        ],
        riskFactors: [
          {
            type: "biomechanical",
            description: "Poor running form",
            severity: "high",
            mitigationStrategies: ["form_analysis"],
          },
        ],
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        mockEnvironmental,
        mockEquipment,
        mockTime,
        highRiskScenario,
      );

      expect(result.riskAssessment.overallRisk).toMatch(/high|critical/);
      expect(result.riskAssessment.mitigationRequired).toBe(true);
      expect(result.riskAssessment.specificRisks.length).toBeGreaterThan(0);
      expect(result.riskAssessment.monitoringPoints.length).toBeGreaterThan(0);

      // Should have injury-related specific risks
      const injuryRisk = result.riskAssessment.specificRisks.find(
        (risk) => risk.type === "injury",
      );
      expect(injuryRisk).toBeDefined();
      expect(injuryRisk!.probability).toBeGreaterThan(50);
    });

    it("should provide appropriate monitoring points", () => {
      const complexScenario = adapter.adaptPlan(
        mockPlan,
        "pfitzinger",
        createMockEnvironmentalFactors({ altitude: 2500 }),
        createMockEquipmentConstraints({
          safetyEquipment: {
            reflectiveGear: false,
            lights: false,
            emergencyDevice: false,
          },
        }),
        createMockTimeConstraints({ weeklyAvailableHours: 4 }),
        createMockInjuryConstraints({ injuryHistory: ["IT_band"] }),
      );

      const monitoringPoints = complexScenario.riskAssessment.monitoringPoints;
      expect(monitoringPoints.length).toBeGreaterThan(2);
      expect(monitoringPoints.some((point) => point.includes("injury"))).toBe(
        true,
      );
      expect(monitoringPoints.some((point) => point.includes("load"))).toBe(
        true,
      );
    });
  });

  describe("Recommendation System", () => {
    it("should prioritize recommendations by criticality", () => {
      const criticalSafetyIssue = createMockEquipmentConstraints({
        safetyEquipment: {
          reflectiveGear: false,
          lights: false,
          emergencyDevice: false,
        },
      });

      const result = adapter.adaptPlan(
        mockPlan,
        "daniels",
        mockEnvironmental,
        criticalSafetyIssue,
        mockTime,
        mockInjury,
      );

      expect(result.recommendations.length).toBeGreaterThan(0);

      // First recommendation should be critical safety issue
      const firstRecommendation = result.recommendations[0];
      expect(firstRecommendation.priority).toBe("critical");
      expect(firstRecommendation.category).toBe("equipment");
      expect(firstRecommendation.recommendation).toContain("safety equipment");
    });

    it("should provide implementation guidance", () => {
      const result = adapter.adaptPlan(
        mockPlan,
        "lydiard",
        createMockEnvironmentalFactors({ altitude: 2500 }),
        mockEquipment,
        mockTime,
        mockInjury,
      );

      result.recommendations.forEach((recommendation) => {
        expect(recommendation.implementation).toBeDefined();
        expect(recommendation.implementation.length).toBeGreaterThan(10);
        expect(recommendation.expectedBenefit).toBeDefined();
        expect(recommendation.timeToEffect).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
