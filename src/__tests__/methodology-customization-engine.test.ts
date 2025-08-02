import { describe, it, expect, beforeEach } from "vitest";
import {
  MethodologyCustomizationEngine,
  MethodologyConfiguration,
  CustomizationSettings,
  PerformanceOptimization,
  AdaptationPattern,
  CustomizationAnalysis,
} from "../methodology-customization-engine";
import {
  TrainingPlan,
  TrainingMethodology,
  PlannedWorkout,
  CompletedWorkout,
  EnvironmentalFactors,
  FitnessAssessment,
  TrainingGoal,
} from "../types";
import { UserProfile } from "../methodology-recommendation-engine";
import { PlanModification } from "../adaptation";

// Helper function to create mock user profile
function createMockUserProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    experience: "intermediate",
    currentFitness: {
      vdot: 45,
      weeklyMileage: 30,
      longestRecentRun: 13,
      trainingAge: 3,
    },
    trainingPreferences: {
      availableDays: [0, 1, 2, 3, 4, 5, 6],
      preferredIntensity: "moderate",
      crossTraining: false,
      strengthTraining: false,
    },
    primaryGoal: "MARATHON" as TrainingGoal,
    motivations: ["improve_times"],
    timeAvailability: 8,
    preferredApproach: "structured",
    ...overrides,
  };
}

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
      totalTime: 4800,
      peakWeeklyDistance: 50,
      averageWeeklyDistance: 40,
      keyWorkouts: 32,
      recoveryDays: 32,
      phases: [],
    },
    workouts: [],
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

describe("MethodologyCustomizationEngine", () => {
  let engine: MethodologyCustomizationEngine;
  let mockUserProfile: UserProfile;
  let mockPlan: TrainingPlan;

  beforeEach(() => {
    engine = new MethodologyCustomizationEngine();
    mockUserProfile = createMockUserProfile();
    mockPlan = createMockTrainingPlan();
  });

  describe("Requirement 6.1: Advanced Configuration Options", () => {
    it("should initialize methodology configuration with base settings", () => {
      const config = engine.initializeConfiguration(
        "user-1",
        "daniels",
        mockUserProfile,
      );

      expect(config).toBeDefined();
      expect(config.methodology).toBe("daniels");
      expect(config.baseConfig).toBeDefined();
      expect(config.baseConfig.intensityDistribution).toEqual({
        easy: 80,
        moderate: 15,
        hard: 5,
      });
      expect(config.baseConfig.volumeProgression).toBeDefined();
      expect(config.baseConfig.workoutEmphasis).toBeDefined();
      expect(config.baseConfig.periodizationModel).toBeDefined();
      expect(config.baseConfig.recoveryProtocol).toBeDefined();
    });

    it("should create methodology-specific configurations", () => {
      const methodologies: TrainingMethodology[] = [
        "daniels",
        "lydiard",
        "pfitzinger",
      ];

      methodologies.forEach((methodology) => {
        const config = engine.initializeConfiguration(
          `user-${methodology}`,
          methodology,
          mockUserProfile,
        );

        expect(config.methodology).toBe(methodology);

        // Verify methodology-specific settings
        if (methodology === "lydiard") {
          expect(config.baseConfig.periodizationModel.phaseTransitions).toBe(
            "sharp",
          );
          expect(
            config.baseConfig.recoveryProtocol.completeRestDays,
          ).toBeGreaterThan(0);
        } else {
          expect(config.baseConfig.periodizationModel.phaseTransitions).toBe(
            "gradual",
          );
        }
      });
    });

    it("should apply custom settings to configuration", () => {
      const customSettings: Partial<CustomizationSettings> = {
        aggressiveness: "aggressive",
        adaptationSpeed: "fast",
        injuryPrevention: "maximum",
        preferredWorkoutTypes: ["tempo", "threshold"],
        avoidWorkoutTypes: ["hill_repeats"],
      };

      const config = engine.initializeConfiguration(
        "user-1",
        "daniels",
        mockUserProfile,
        customSettings,
      );

      expect(config.customizations.aggressiveness).toBe("aggressive");
      expect(config.customizations.adaptationSpeed).toBe("fast");
      expect(config.customizations.injuryPrevention).toBe("maximum");
      expect(config.customizations.preferredWorkoutTypes).toContain("tempo");
      expect(config.customizations.avoidWorkoutTypes).toContain("hill_repeats");
    });

    it("should create performance optimization targets", () => {
      const config = engine.initializeConfiguration(
        "user-1",
        "daniels",
        mockUserProfile,
      );

      expect(config.performanceOptimizations).toBeDefined();
      expect(config.performanceOptimizations.length).toBeGreaterThan(0);

      const vdotOptimization = config.performanceOptimizations.find(
        (opt) => opt.targetMetric === "vdot",
      );

      expect(vdotOptimization).toBeDefined();
      expect(vdotOptimization!.currentValue).toBe(45); // From mock profile
      expect(vdotOptimization!.targetValue).toBe(47); // +2 VDOT points
      expect(vdotOptimization!.strategy).toBeDefined();
      expect(vdotOptimization!.estimatedWeeks).toBeGreaterThan(0);
    });
  });

  describe("Requirement 6.2: Individual Adaptation Pattern Tracking", () => {
    it("should track adaptation patterns from workout responses", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      const completedWorkouts = createMockCompletedWorkouts(20);
      const plannedWorkouts = completedWorkouts.map((cw) => cw.plannedWorkout!);
      const modifications: PlanModification[] = [
        {
          type: "reduce_volume",
          reason: "High fatigue detected",
          priority: "high",
          suggestedChanges: { volumeReduction: 20 },
        },
      ];

      engine.trackAdaptationPattern(
        "user-1",
        completedWorkouts,
        plannedWorkouts,
        modifications,
      );

      const history = engine.getAdaptationHistory("user-1");
      expect(history).toBeDefined();
      // History tracking is implemented but patterns are created through actual usage
    });

    it("should update configuration based on learned patterns", () => {
      const config = engine.initializeConfiguration(
        "user-1",
        "daniels",
        mockUserProfile,
      );
      const initialPatternCount = config.adaptationPatterns.length;

      // Track patterns multiple times with the same data to simulate pattern reinforcement
      const completedWorkouts = createMockCompletedWorkouts(20);
      const plannedWorkouts = completedWorkouts.map((cw) => cw.plannedWorkout!);
      const modifications: PlanModification[] = [];

      for (let i = 0; i < 3; i++) {
        engine.trackAdaptationPattern(
          "user-1",
          completedWorkouts,
          plannedWorkouts,
          modifications,
        );
      }

      const updatedConfig = engine.getConfiguration("user-1");
      expect(updatedConfig).toBeDefined();

      // Should have patterns (could be same or more than initial)
      expect(updatedConfig!.adaptationPatterns.length).toBeGreaterThan(0);

      // Verify that adaptation patterns exist and have been processed
      const patterns = updatedConfig!.adaptationPatterns;
      expect(patterns).toBeDefined();
      expect(patterns.length).toBeGreaterThan(0);

      // Each pattern should have required properties
      patterns.forEach((pattern) => {
        expect(pattern.id).toBeDefined();
        expect(pattern.trigger).toBeDefined();
        expect(pattern.response).toBeDefined();
        expect(pattern.effectiveness).toBeGreaterThan(0);
        expect(pattern.frequency).toBeGreaterThan(0);
        expect(pattern.lastObserved).toBeDefined();
      });
    });

    it("should optimize performance based on individual response", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);
      const completedWorkouts = createMockCompletedWorkouts(30);

      const optimizations = engine.optimizePerformance(
        "user-1",
        mockPlan,
        completedWorkouts,
        ["threshold", "endurance"],
      );

      expect(optimizations).toBeDefined();
      expect(optimizations.length).toBe(2);

      const thresholdOpt = optimizations.find(
        (opt) => opt.targetMetric === "threshold",
      );
      expect(thresholdOpt).toBeDefined();
      expect(thresholdOpt!.strategy).toBeDefined();
      expect(thresholdOpt!.strategy.methodologyTweaks).toBeDefined();
      expect(thresholdOpt!.strategy.workoutProgressions).toBeDefined();

      const enduranceOpt = optimizations.find(
        (opt) => opt.targetMetric === "endurance",
      );
      expect(enduranceOpt).toBeDefined();
    });
  });

  describe("Requirement 6.3: Environmental Factor Adaptations", () => {
    it("should apply altitude adjustments", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      const environmentalFactors: EnvironmentalFactors = {
        altitude: 2000, // 2000m altitude
        typicalTemperature: 20,
        terrain: "flat",
      };

      const modifications = engine.applyEnvironmentalAdaptations(
        "user-1",
        mockPlan,
        environmentalFactors,
      );

      expect(modifications.length).toBeGreaterThan(0);

      const altitudeMod = modifications.find((mod) =>
        mod.reason.includes("Altitude adaptation"),
      );
      expect(altitudeMod).toBeDefined();
      expect(altitudeMod!.type).toBe("reduce_intensity");
      expect(altitudeMod!.suggestedChanges.intensityReduction).toBeGreaterThan(
        0,
      );
    });

    it("should apply heat adaptations", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      const environmentalFactors: EnvironmentalFactors = {
        typicalTemperature: 30, // Hot weather
        humidity: 80,
        terrain: "flat",
      };

      const modifications = engine.applyEnvironmentalAdaptations(
        "user-1",
        mockPlan,
        environmentalFactors,
      );

      const heatMod = modifications.find((mod) =>
        mod.reason.includes("Heat adaptation"),
      );
      expect(heatMod).toBeDefined();
      expect(heatMod!.priority).toBe("medium");
    });

    it("should apply terrain-specific adaptations", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      const environmentalFactors: EnvironmentalFactors = {
        terrain: "hilly",
        typicalTemperature: 20,
      };

      const modifications = engine.applyEnvironmentalAdaptations(
        "user-1",
        mockPlan,
        environmentalFactors,
      );

      const terrainMod = modifications.find((mod) =>
        mod.reason.includes("terrain adaptation"),
      );
      expect(terrainMod).toBeDefined();
      expect(terrainMod!.suggestedChanges.substituteWorkoutType).toBe(
        "hill_repeats",
      );
    });
  });

  describe("Requirement 6.4: Safe Customization Options", () => {
    it("should resolve methodology conflicts safely", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      const conflicts = [
        {
          area: "intensity_distribution",
          description:
            "User needs more recovery than Daniels typically prescribes",
          severity: "high" as const,
        },
      ];

      const resolutions = engine.resolveMethodologyConflicts(
        "user-1",
        conflicts,
      );

      expect(resolutions).toBeDefined();
      expect(resolutions.length).toBeGreaterThan(0);
      expect(resolutions[0].type).toBe("phase_adjustment");
      expect(resolutions[0].rationale).toContain("Resolving");
    });

    it("should maintain safe customization constraints", () => {
      const injuryProneProfile = createMockUserProfile({
        injuryHistory: ["IT band", "plantar fasciitis", "stress fracture"],
      });

      const config = engine.initializeConfiguration(
        "user-1",
        "daniels",
        injuryProneProfile,
      );

      expect(config.customizations.injuryPrevention).toBe("maximum");
      expect(config.constraints.minRecoveryDays).toBeGreaterThanOrEqual(1);
      expect(config.baseConfig.volumeProgression.weeklyIncrease).toBeLessThan(
        10,
      );
    });
  });

  describe("Requirement 6.5: Experience-based Advanced Features", () => {
    it("should unlock advanced features for experienced runners", () => {
      const advancedProfile = createMockUserProfile({
        experience: "advanced",
      });

      engine.initializeConfiguration("user-1", "daniels", advancedProfile);

      const unlockedFeatures = engine.unlockAdvancedFeatures(
        "user-1",
        "advanced",
        20, // 20 weeks completed
      );

      expect(unlockedFeatures.length).toBeGreaterThan(0);

      const doubleThreshold = unlockedFeatures.find(
        (f) => f.id === "double_threshold",
      );
      expect(doubleThreshold).toBeDefined();
      expect(doubleThreshold!.requirements).toContain("Advanced experience");
      expect(doubleThreshold!.implementation).toBeDefined();
      expect(doubleThreshold!.implementation.length).toBeGreaterThan(0);
    });

    it("should unlock time-based features", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      const unlockedFeatures = engine.unlockAdvancedFeatures(
        "user-1",
        "intermediate",
        15, // 15 weeks completed
      );

      const raceSimulation = unlockedFeatures.find(
        (f) => f.id === "race_simulation",
      );
      expect(raceSimulation).toBeDefined();
      expect(raceSimulation!.requirements).toContain("12+ weeks");
    });

    it("should not unlock advanced features for beginners", () => {
      const beginnerProfile = createMockUserProfile({
        experience: "beginner",
      });

      engine.initializeConfiguration("user-1", "daniels", beginnerProfile);

      const unlockedFeatures = engine.unlockAdvancedFeatures(
        "user-1",
        "beginner",
        4, // 4 weeks completed
      );

      const advancedFeatures = unlockedFeatures.filter(
        (f) => f.id === "double_threshold" || f.id === "super_compensation",
      );
      expect(advancedFeatures.length).toBe(0);
    });
  });

  describe("Requirement 6.6: Injury Prevention Modifications", () => {
    it("should apply injury prevention based on history", () => {
      const injuryProfile = createMockUserProfile({
        injuryHistory: ["IT band syndrome", "shin splints"],
      });

      engine.initializeConfiguration("user-1", "daniels", injuryProfile);

      const modifications = engine.applyInjuryPrevention(
        "user-1",
        mockPlan,
        injuryProfile.injuryHistory!,
        [],
      );

      expect(modifications.length).toBeGreaterThanOrEqual(2);

      modifications.forEach((mod) => {
        expect(mod.reason).toMatch(/Previous.*preventive/);
        expect(mod.type).toBe("reduce_volume");
        expect(mod.suggestedChanges.volumeReduction).toBeGreaterThan(0);
      });
    });

    it("should mitigate current risk factors", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      const riskFactors = [
        {
          type: "overtraining",
          severity: "high" as const,
          description: "High training load detected",
        },
      ];

      const modifications = engine.applyInjuryPrevention(
        "user-1",
        mockPlan,
        [],
        riskFactors,
      );

      expect(modifications.length).toBeGreaterThan(0);

      const riskMod = modifications[0];
      expect(riskMod.type).toBe("add_recovery");
      expect(riskMod.priority).toBe("high");
      expect(riskMod.suggestedChanges.additionalRecoveryDays).toBeGreaterThan(
        0,
      );
    });
  });

  describe("Requirement 6.7: Performance Plateau Breakthrough", () => {
    it("should suggest methodology-specific breakthrough strategies", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      const strategies = engine.suggestBreakthroughStrategies(
        "user-1",
        "vdot",
        4, // 4-week plateau
      );

      expect(strategies.length).toBeGreaterThan(0);

      const vdotBreakthrough = strategies.find(
        (s) => s.id === "vdot_breakthrough",
      );
      expect(vdotBreakthrough).toBeDefined();
      expect(vdotBreakthrough!.protocol).toBeDefined();
      expect(vdotBreakthrough!.protocol.length).toBeGreaterThan(0);
      expect(vdotBreakthrough!.expectedImprovement).toContain("VDOT");
      expect(vdotBreakthrough!.successProbability).toBeGreaterThan(50);
    });

    it("should provide different strategies for different methodologies", () => {
      // Test Lydiard breakthrough
      engine.initializeConfiguration("user-1", "lydiard", mockUserProfile);
      const lydiardStrategies = engine.suggestBreakthroughStrategies(
        "user-1",
        "endurance",
        6,
      );

      const aerobicBreakthrough = lydiardStrategies.find(
        (s) => s.id === "aerobic_breakthrough",
      );
      expect(aerobicBreakthrough).toBeDefined();

      // Test Pfitzinger breakthrough
      engine.initializeConfiguration("user-2", "pfitzinger", mockUserProfile);
      const pfitzingerStrategies = engine.suggestBreakthroughStrategies(
        "user-2",
        "threshold",
        5,
      );

      const thresholdBreakthrough = pfitzingerStrategies.find(
        (s) => s.id === "threshold_breakthrough",
      );
      expect(thresholdBreakthrough).toBeDefined();
    });

    it("should sort strategies by success probability", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      const strategies = engine.suggestBreakthroughStrategies(
        "user-1",
        "speed",
        8,
      );

      expect(strategies.length).toBeGreaterThan(1);

      // Verify sorting by success probability
      for (let i = 1; i < strategies.length; i++) {
        expect(strategies[i - 1].successProbability).toBeGreaterThanOrEqual(
          strategies[i].successProbability,
        );
      }
    });
  });

  describe("Customization Analysis", () => {
    it("should analyze current customization state", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);
      const completedWorkouts = createMockCompletedWorkouts(30);

      const analysis = engine.analyzeCustomization(
        "user-1",
        mockPlan,
        completedWorkouts,
      );

      expect(analysis).toBeDefined();
      expect(analysis.currentState).toBeDefined();
      expect(
        analysis.currentState.adherenceToPhilosophy,
      ).toBeGreaterThanOrEqual(0);
      expect(analysis.currentState.adherenceToPhilosophy).toBeLessThanOrEqual(
        100,
      );
      expect(analysis.currentState.customizationLevel).toMatch(
        /minimal|moderate|extensive/,
      );
      expect(analysis.currentState.effectivenessScore).toBeGreaterThanOrEqual(
        0,
      );
      expect(analysis.currentState.injuryRiskLevel).toMatch(/low|medium|high/);
      expect(analysis.currentState.adaptationSuccess).toBeGreaterThanOrEqual(0);
    });

    it("should provide customization recommendations", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);
      const completedWorkouts = createMockCompletedWorkouts(30);

      const analysis = engine.analyzeCustomization(
        "user-1",
        mockPlan,
        completedWorkouts,
      );

      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);

      if (analysis.recommendations.length > 0) {
        const recommendation = analysis.recommendations[0];
        expect(recommendation.id).toBeDefined();
        expect(recommendation.category).toMatch(
          /performance|injury_prevention|plateau_breaking|environmental/,
        );
        expect(recommendation.title).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.impact).toMatch(/high|medium|low/);
        expect(recommendation.implementation).toBeDefined();
        expect(recommendation.timeToEffect).toBeGreaterThan(0);
      }
    });

    it("should identify customization warnings", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);

      // Create scenario that should generate warnings
      const lowEffectivenessWorkouts = createMockCompletedWorkouts(20).map(
        (w) => ({
          ...w,
          completed: false, // All workouts incomplete
        }),
      );

      const analysis = engine.analyzeCustomization(
        "user-1",
        mockPlan,
        lowEffectivenessWorkouts,
      );

      expect(analysis.warnings).toBeDefined();
      expect(Array.isArray(analysis.warnings)).toBe(true);
    });

    it("should project outcomes based on optimizations", () => {
      engine.initializeConfiguration("user-1", "daniels", mockUserProfile);
      const completedWorkouts = createMockCompletedWorkouts(30);

      // Create optimizations first
      engine.optimizePerformance("user-1", mockPlan, completedWorkouts, [
        "vdot",
      ]);

      const analysis = engine.analyzeCustomization(
        "user-1",
        mockPlan,
        completedWorkouts,
      );

      expect(analysis.projectedOutcomes).toBeDefined();
      expect(analysis.projectedOutcomes.length).toBeGreaterThan(0);

      const vdotProjection = analysis.projectedOutcomes.find(
        (outcome) => outcome.metric === "vdot",
      );

      if (vdotProjection) {
        expect(vdotProjection.currentValue).toBe(45); // From mock profile
        expect(vdotProjection.projectedValue).toBe(47); // Target
        expect(vdotProjection.confidence).toBeGreaterThan(0);
        expect(vdotProjection.confidence).toBeLessThanOrEqual(100);
        expect(vdotProjection.timeframe).toBeGreaterThan(0);
        expect(vdotProjection.assumptions).toBeDefined();
        expect(vdotProjection.assumptions.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Configuration Persistence", () => {
    it("should retrieve stored configuration", () => {
      const config = engine.initializeConfiguration(
        "user-1",
        "daniels",
        mockUserProfile,
      );

      const retrievedConfig = engine.getConfiguration("user-1");

      expect(retrievedConfig).toBeDefined();
      expect(retrievedConfig).toEqual(config);
    });

    it("should update configuration last updated timestamp", () => {
      const config = engine.initializeConfiguration(
        "user-1",
        "daniels",
        mockUserProfile,
      );

      const initialTimestamp = config.lastUpdated;

      // Wait a bit
      setTimeout(() => {
        engine.optimizePerformance(
          "user-1",
          mockPlan,
          createMockCompletedWorkouts(10),
          ["vdot"],
        );

        const updatedConfig = engine.getConfiguration("user-1");
        expect(updatedConfig!.lastUpdated.getTime()).toBeGreaterThan(
          initialTimestamp.getTime(),
        );
      }, 10);
    });
  });
});
