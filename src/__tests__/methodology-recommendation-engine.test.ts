import { describe, it, expect, beforeEach } from "vitest";
import {
  MethodologyRecommendationEngine,
  UserProfile,
  RecommendationResult,
  RecommendationQuiz,
} from "../methodology-recommendation-engine";
import { TrainingMethodology } from "../types";

describe("MethodologyRecommendationEngine", () => {
  let engine: MethodologyRecommendationEngine;

  beforeEach(() => {
    engine = new MethodologyRecommendationEngine();
  });

  describe("Requirement 5.2: User Profile-Based Recommendations", () => {
    it("should recommend methodologies based on user profile", () => {
      const userProfile: UserProfile = {
        experience: "intermediate",
        currentFitness: {
          vdot: 48,
          weeklyMileage: 30,
          longestRecentRun: 12,
          trainingAge: 3,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "moderate",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "MARATHON",
        motivations: ["improve_times", "qualify_boston"],
        timeAvailability: 8,
        preferredApproach: "scientific",
      };

      const result = engine.recommendMethodology(userProfile);

      expect(result).toBeDefined();
      expect(result.primaryRecommendation).toBeDefined();
      expect(result.primaryRecommendation.methodology).toMatch(
        /daniels|lydiard|pfitzinger/,
      );
      expect(result.primaryRecommendation.compatibilityScore).toBeGreaterThan(
        70,
      );
      expect(result.alternativeOptions).toHaveLength(2);
      expect(result.rationale).toBeDefined();
    });

    it("should recommend Daniels for scientific approach runners", () => {
      const scientificRunner: UserProfile = {
        experience: "advanced",
        currentFitness: {
          vdot: 52,
          weeklyMileage: 40,
          longestRecentRun: 16,
          trainingAge: 5,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "high",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "IMPROVE_MARATHON",
        motivations: ["improve_times", "compete"],
        timeAvailability: 7,
        preferredApproach: "scientific",
      };

      const result = engine.recommendMethodology(scientificRunner);

      expect(result.primaryRecommendation.methodology).toBe("daniels");
      expect(result.primaryRecommendation.compatibilityScore).toBeGreaterThan(
        85,
      );
      expect(result.primaryRecommendation.strengths).toContain(
        "Precise pace-based training for optimal adaptation",
      );
    });

    it("should recommend Lydiard for base-building focused runners", () => {
      const baseBuilder: UserProfile = {
        experience: "novice",
        currentFitness: {
          vdot: 42,
          weeklyMileage: 20,
          longestRecentRun: 8,
          trainingAge: 1.5,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "low",
          crossTraining: false,
          strengthTraining: true,
        },
        primaryGoal: "FIRST_MARATHON",
        motivations: ["finish_first_race", "stay_healthy"],
        timeAvailability: 10,
        preferredApproach: "intuitive",
        injuryHistory: ["IT band syndrome", "Plantar fasciitis"],
      };

      const result = engine.recommendMethodology(baseBuilder);

      expect(result.primaryRecommendation.methodology).toBe("lydiard");
      expect(result.primaryRecommendation.strengths).toContain(
        "Strong aerobic base development",
      );
      expect(result.primaryRecommendation.strengths).toContain(
        "Injury prevention through gradual progression",
      );
    });

    it("should recommend appropriate methodology for Boston qualifiers", () => {
      const bostonQualifier: UserProfile = {
        experience: "intermediate",
        currentFitness: {
          vdot: 50,
          weeklyMileage: 35,
          longestRecentRun: 14,
          trainingAge: 4,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "moderate",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "MARATHON",
        motivations: ["qualify_boston", "improve_times"],
        timeAvailability: 9,
        preferredApproach: "structured",
      };

      const result = engine.recommendMethodology(bostonQualifier);

      // Either Pfitzinger or Daniels are good for Boston qualification
      expect(result.primaryRecommendation.methodology).toMatch(
        /pfitzinger|daniels/,
      );
      expect(result.primaryRecommendation.compatibilityScore).toBeGreaterThan(
        85,
      );

      // Check that the recommendation includes marathon improvement
      const hasMarathonImprovement =
        result.primaryRecommendation.expectedOutcomes.some((outcome) =>
          outcome.match(
            /marathon.*improvement|improve.*marathon|VDOT improvement/i,
          ),
        );
      expect(hasMarathonImprovement).toBe(true);
    });
  });

  describe("Requirement 5.4: Compatibility Scoring System", () => {
    it("should calculate accurate compatibility scores", () => {
      const profiles: UserProfile[] = [
        {
          // Perfect Daniels candidate
          experience: "advanced",
          currentFitness: {
            vdot: 55,
            weeklyMileage: 45,
            longestRecentRun: 18,
            trainingAge: 8,
          },
          trainingPreferences: {
            availableDays: [0, 1, 2, 3, 4, 5, 6],
            preferredIntensity: "high",
            crossTraining: false,
            strengthTraining: false,
          },
          primaryGoal: "IMPROVE_MARATHON",
          motivations: ["improve_times", "compete"],
          timeAvailability: 7,
          preferredApproach: "scientific",
        },
        {
          // Perfect Lydiard candidate
          experience: "beginner",
          currentFitness: {
            vdot: 40,
            weeklyMileage: 15,
            longestRecentRun: 6,
            trainingAge: 0.5,
          },
          trainingPreferences: {
            availableDays: [0, 1, 2, 3, 4, 5, 6],
            preferredIntensity: "low",
            crossTraining: false,
            strengthTraining: true,
          },
          primaryGoal: "FIRST_HALF_MARATHON",
          motivations: ["finish_first_race", "stay_healthy", "longevity"],
          timeAvailability: 12,
          preferredApproach: "intuitive",
          injuryHistory: [
            "Previous injury 1",
            "Previous injury 2",
            "Previous injury 3",
          ],
        },
      ];

      const results = profiles.map((profile) =>
        engine.recommendMethodology(profile),
      );

      // First profile should strongly recommend Daniels
      expect(results[0].primaryRecommendation.methodology).toBe("daniels");
      expect(
        results[0].primaryRecommendation.compatibilityScore,
      ).toBeGreaterThan(90);

      // Second profile should strongly recommend Lydiard
      expect(results[1].primaryRecommendation.methodology).toBe("lydiard");
      expect(
        results[1].primaryRecommendation.compatibilityScore,
      ).toBeGreaterThan(85);

      // All recommendations should have scores between 0-100
      results.forEach((result) => {
        expect(
          result.primaryRecommendation.compatibilityScore,
        ).toBeGreaterThanOrEqual(0);
        expect(
          result.primaryRecommendation.compatibilityScore,
        ).toBeLessThanOrEqual(100);
        result.alternativeOptions.forEach((option) => {
          expect(option.compatibilityScore).toBeGreaterThanOrEqual(0);
          expect(option.compatibilityScore).toBeLessThanOrEqual(100);
        });
      });
    });

    it("should provide detailed scoring breakdown", () => {
      const userProfile: UserProfile = {
        experience: "intermediate",
        currentFitness: {
          vdot: 48,
          weeklyMileage: 30,
          longestRecentRun: 12,
          trainingAge: 3,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "moderate",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "MARATHON",
        motivations: ["improve_times"],
        timeAvailability: 8,
        preferredApproach: "structured",
      };

      const result = engine.recommendMethodology(userProfile);

      // Check rationale includes scoring breakdown
      expect(result.rationale.scoringBreakdown).toBeDefined();
      expect(result.rationale.scoringBreakdown).toHaveProperty(
        "experienceMatch",
      );
      expect(result.rationale.scoringBreakdown).toHaveProperty("goalAlignment");
      expect(result.rationale.scoringBreakdown).toHaveProperty(
        "timeAvailability",
      );
      expect(result.rationale.scoringBreakdown).toHaveProperty("injuryHistory");
      expect(result.rationale.scoringBreakdown).toHaveProperty(
        "trainingApproach",
      );
      expect(result.rationale.scoringBreakdown).toHaveProperty(
        "environmentalFactors",
      );
      expect(result.rationale.scoringBreakdown).toHaveProperty(
        "strengthsWeaknesses",
      );

      // All scores should be between 0-100
      Object.values(result.rationale.scoringBreakdown).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Requirement 5.8: Recommendation Rationale Generation", () => {
    it("should generate comprehensive rationale", () => {
      const userProfile: UserProfile = {
        experience: "intermediate",
        currentFitness: {
          vdot: 48,
          weeklyMileage: 30,
          longestRecentRun: 12,
          trainingAge: 3,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "moderate",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "MARATHON",
        motivations: ["improve_times", "qualify_boston"],
        timeAvailability: 8,
        preferredApproach: "scientific",
      };

      const result = engine.recommendMethodology(userProfile);

      expect(result.rationale).toBeDefined();
      expect(result.rationale.primaryFactors).toBeDefined();
      expect(result.rationale.primaryFactors.length).toBeGreaterThan(0);
      expect(result.rationale.userProfileMatch).toBeDefined();
      expect(result.rationale.userProfileMatch.length).toBeGreaterThan(0);
      expect(result.rationale.methodologyAdvantages).toBeDefined();
      expect(result.rationale.methodologyAdvantages.length).toBeGreaterThan(0);

      // Primary factors should be explanatory
      result.rationale.primaryFactors.forEach((factor) => {
        expect(factor).toMatch(
          /match|alignment|fit|compatibility|suitability|targeting/i,
        );
      });
    });

    it("should provide methodology-specific advantages", () => {
      const profiles: UserProfile[] = [
        {
          // Daniels candidate
          experience: "intermediate",
          currentFitness: {
            vdot: 48,
            weeklyMileage: 30,
            longestRecentRun: 12,
            trainingAge: 3,
          },
          trainingPreferences: {
            availableDays: [0, 1, 2, 3, 4, 5, 6],
            preferredIntensity: "moderate",
            crossTraining: false,
            strengthTraining: false,
          },
          primaryGoal: "IMPROVE_5K",
          motivations: ["improve_times"],
          timeAvailability: 6,
          preferredApproach: "scientific",
        },
        {
          // Lydiard candidate
          experience: "novice",
          currentFitness: {
            vdot: 42,
            weeklyMileage: 20,
            longestRecentRun: 8,
            trainingAge: 1.5,
          },
          trainingPreferences: {
            availableDays: [0, 1, 2, 3, 4, 5, 6],
            preferredIntensity: "low",
            crossTraining: false,
            strengthTraining: true,
          },
          primaryGoal: "FIRST_MARATHON",
          motivations: ["finish_first_race"],
          timeAvailability: 10,
          preferredApproach: "intuitive",
        },
      ];

      const results = profiles.map((profile) =>
        engine.recommendMethodology(profile),
      );

      // Daniels should have specific advantages
      if (results[0].primaryRecommendation.methodology === "daniels") {
        expect(results[0].primaryRecommendation.strengths).toContain(
          "Precise pace-based training for optimal adaptation",
        );
      }

      // Lydiard should have specific advantages
      if (results[1].primaryRecommendation.methodology === "lydiard") {
        expect(results[1].primaryRecommendation.strengths).toContain(
          "Strong aerobic base development",
        );
      }
    });
  });

  describe("Transition Planning", () => {
    it("should create transition plan when previous methodology exists", () => {
      const userProfile: UserProfile = {
        experience: "intermediate",
        currentFitness: {
          vdot: 48,
          weeklyMileage: 30,
          longestRecentRun: 12,
          trainingAge: 3,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "moderate",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "MARATHON",
        motivations: ["improve_times"],
        timeAvailability: 8,
        preferredApproach: "scientific",
        previousMethodologies: ["lydiard"],
      };

      const result = engine.recommendMethodology(userProfile);

      expect(result.transitionPlan).toBeDefined();
      expect(result.transitionPlan!.fromMethodology).toBe("lydiard");
      expect(result.transitionPlan!.toMethodology).toBeDefined();
      expect(result.transitionPlan!.transitionWeeks).toBeGreaterThan(0);
      expect(result.transitionPlan!.keyChanges).toBeDefined();
      expect(result.transitionPlan!.keyChanges.length).toBeGreaterThan(0);
      expect(result.transitionPlan!.adaptationFocus).toBeDefined();
      expect(result.transitionPlan!.gradualAdjustments).toBeDefined();
    });

    it("should not create transition plan for new runners", () => {
      const userProfile: UserProfile = {
        experience: "beginner",
        currentFitness: {
          vdot: 40,
          weeklyMileage: 15,
          longestRecentRun: 6,
          trainingAge: 0.5,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "low",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "FIRST_5K",
        motivations: ["finish_first_race"],
        timeAvailability: 5,
        preferredApproach: "flexible",
      };

      const result = engine.recommendMethodology(userProfile);

      expect(result.transitionPlan).toBeUndefined();
    });
  });

  describe("Warnings and Considerations", () => {
    it("should generate warnings for inappropriate recommendations", () => {
      const beginner: UserProfile = {
        experience: "beginner",
        currentFitness: {
          vdot: 38,
          weeklyMileage: 10,
          longestRecentRun: 4,
          trainingAge: 0.3,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "low",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "MARATHON",
        motivations: ["finish_first_race"],
        timeAvailability: 4,
        preferredApproach: "flexible",
      };

      const result = engine.recommendMethodology(beginner);

      // If Pfitzinger is recommended for a beginner, should have warnings
      if (result.primaryRecommendation.methodology === "pfitzinger") {
        expect(result.warnings).toBeDefined();
        expect(result.warnings!.length).toBeGreaterThan(0);
        expect(result.warnings![0]).toMatch(
          /requires significant running base/i,
        );
      }
    });

    it("should identify considerations for each methodology", () => {
      const userProfile: UserProfile = {
        experience: "intermediate",
        currentFitness: {
          vdot: 48,
          weeklyMileage: 30,
          longestRecentRun: 12,
          trainingAge: 3,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "moderate",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "MARATHON",
        motivations: ["improve_times"],
        timeAvailability: 5, // Limited time
        preferredApproach: "structured",
        injuryHistory: [
          "IT band",
          "Shin splints",
          "Achilles",
          "Plantar fasciitis",
        ], // Many injuries
      };

      const result = engine.recommendMethodology(userProfile);

      expect(result.primaryRecommendation.considerations).toBeDefined();
      expect(
        result.primaryRecommendation.considerations.length,
      ).toBeGreaterThan(0);

      // Should have considerations for all options
      result.alternativeOptions.forEach((option) => {
        expect(option.considerations).toBeDefined();
        expect(option.considerations.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Expected Outcomes", () => {
    it("should predict realistic outcomes", () => {
      const userProfile: UserProfile = {
        experience: "intermediate",
        currentFitness: {
          vdot: 48,
          weeklyMileage: 30,
          longestRecentRun: 12,
          trainingAge: 3,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "moderate",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "MARATHON",
        motivations: ["improve_times"],
        timeAvailability: 8,
        preferredApproach: "scientific",
      };

      const result = engine.recommendMethodology(userProfile);

      expect(result.primaryRecommendation.expectedOutcomes).toBeDefined();
      expect(
        result.primaryRecommendation.expectedOutcomes.length,
      ).toBeGreaterThan(0);

      // Outcomes should be specific and measurable
      result.primaryRecommendation.expectedOutcomes.forEach((outcome) => {
        expect(outcome).toMatch(
          /improvement|development|ability|fitness|toughness/i,
        );
      });
    });

    it("should estimate adaptation time", () => {
      const profiles: UserProfile[] = [
        {
          // Experienced runner - should adapt quickly
          experience: "advanced",
          currentFitness: {
            vdot: 55,
            weeklyMileage: 50,
            longestRecentRun: 20,
            trainingAge: 8,
          },
          trainingPreferences: {
            availableDays: [0, 1, 2, 3, 4, 5, 6],
            preferredIntensity: "high",
            crossTraining: false,
            strengthTraining: false,
          },
          primaryGoal: "IMPROVE_MARATHON",
          motivations: ["improve_times"],
          timeAvailability: 10,
          preferredApproach: "scientific",
        },
        {
          // Beginner - should need more adaptation time
          experience: "beginner",
          currentFitness: {
            vdot: 40,
            weeklyMileage: 15,
            longestRecentRun: 6,
            trainingAge: 0.5,
          },
          trainingPreferences: {
            availableDays: [0, 1, 2, 3, 4, 5, 6],
            preferredIntensity: "low",
            crossTraining: false,
            strengthTraining: false,
          },
          primaryGoal: "FIRST_5K",
          motivations: ["finish_first_race"],
          timeAvailability: 5,
          preferredApproach: "flexible",
        },
      ];

      const results = profiles.map((profile) =>
        engine.recommendMethodology(profile),
      );

      // Advanced runner should adapt faster
      expect(results[0].primaryRecommendation.timeToAdapt).toBeLessThanOrEqual(
        6,
      );

      // Beginner should need more time
      expect(
        results[1].primaryRecommendation.timeToAdapt,
      ).toBeGreaterThanOrEqual(6);
    });
  });

  describe("Recommendation Quiz", () => {
    it("should create a comprehensive quiz", () => {
      const quiz = engine.createRecommendationQuiz();

      expect(quiz).toBeDefined();
      expect(quiz.questions).toBeDefined();
      expect(quiz.questions.length).toBeGreaterThan(5);
      expect(quiz.scoringLogic).toBeDefined();

      // Verify question structure
      quiz.questions.forEach((question) => {
        expect(question.id).toBeDefined();
        expect(question.question).toBeDefined();
        expect(question.type).toMatch(/single|multiple|scale|text/);
        if (question.type !== "text") {
          expect(question.options).toBeDefined();
          expect(question.options!.length).toBeGreaterThan(0);
        }
      });
    });

    it("should score quiz answers correctly", () => {
      const quiz = engine.createRecommendationQuiz();

      const answers = [
        { questionId: "experience", answer: "intermediate" },
        { questionId: "goal", answer: "MARATHON" },
        { questionId: "timeAvailability", answer: "7" },
        { questionId: "approach", answer: "scientific" },
        {
          questionId: "motivations",
          answer: ["improve_times", "qualify_boston"],
        },
        { questionId: "currentMileage", answer: "30" },
        { questionId: "injuries", answer: "1" },
        { questionId: "strengths", answer: ["speed", "consistency"] },
      ];

      const userProfile = quiz.scoringLogic(answers);

      expect(userProfile).toBeDefined();
      expect(userProfile.experience).toBe("intermediate");
      expect(userProfile.primaryGoal).toBe("MARATHON");
      expect(userProfile.timeAvailability).toBe(7);
      expect(userProfile.preferredApproach).toBe("scientific");
      expect(userProfile.motivations).toContain("improve_times");
      expect(userProfile.motivations).toContain("qualify_boston");
      expect(userProfile.currentFitness.weeklyMileage).toBe(30);
      expect(userProfile.injuryHistory).toHaveLength(1);
      expect(userProfile.strengthsAndWeaknesses!.strengths).toContain("speed");
      expect(userProfile.strengthsAndWeaknesses!.strengths).toContain(
        "consistency",
      );
    });

    it("should handle quiz answers to generate recommendations", () => {
      const quiz = engine.createRecommendationQuiz();

      const beginnerAnswers = [
        { questionId: "experience", answer: "beginner" },
        { questionId: "goal", answer: "FIRST_5K" },
        { questionId: "timeAvailability", answer: "5" },
        { questionId: "approach", answer: "intuitive" },
        {
          questionId: "motivations",
          answer: ["finish_first_race", "stay_healthy"],
        },
        { questionId: "currentMileage", answer: "10" },
        { questionId: "injuries", answer: "0" },
        { questionId: "strengths", answer: ["consistency"] },
      ];

      const userProfile = quiz.scoringLogic(beginnerAnswers);
      const recommendation = engine.recommendMethodology(userProfile);

      expect(recommendation).toBeDefined();
      expect(recommendation.primaryRecommendation).toBeDefined();
      expect(recommendation.primaryRecommendation.methodology).toMatch(
        /daniels|lydiard|pfitzinger/,
      );
      expect(
        recommendation.primaryRecommendation.compatibilityScore,
      ).toBeGreaterThan(60);
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimal user profile", () => {
      const minimalProfile: UserProfile = {
        experience: "intermediate",
        currentFitness: {
          vdot: 45,
          weeklyMileage: 25,
          longestRecentRun: 10,
          trainingAge: 2,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "moderate",
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "GENERAL_FITNESS",
        motivations: [],
        timeAvailability: 6,
      };

      const result = engine.recommendMethodology(minimalProfile);

      expect(result).toBeDefined();
      expect(result.primaryRecommendation).toBeDefined();
      expect(result.primaryRecommendation.methodology).toMatch(
        /daniels|lydiard|pfitzinger/,
      );
    });

    it("should handle extreme fitness levels", () => {
      const eliteProfile: UserProfile = {
        experience: "expert",
        currentFitness: {
          vdot: 70, // Elite level
          weeklyMileage: 100,
          longestRecentRun: 26,
          trainingAge: 15,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "high",
          crossTraining: true,
          strengthTraining: true,
        },
        primaryGoal: "IMPROVE_MARATHON",
        motivations: ["compete", "improve_times"],
        timeAvailability: 20,
        preferredApproach: "scientific",
      };

      const result = engine.recommendMethodology(eliteProfile);

      expect(result).toBeDefined();
      expect(result.primaryRecommendation.compatibilityScore).toBeGreaterThan(
        70,
      );
    });

    it("should handle conflicting preferences", () => {
      const conflictingProfile: UserProfile = {
        experience: "beginner", // Beginner but wants high intensity
        currentFitness: {
          vdot: 38,
          weeklyMileage: 10,
          longestRecentRun: 4,
          trainingAge: 0.5,
        },
        trainingPreferences: {
          availableDays: [0, 1, 2, 3, 4, 5, 6],
          preferredIntensity: "high", // Conflicting with beginner status
          crossTraining: false,
          strengthTraining: false,
        },
        primaryGoal: "IMPROVE_MARATHON", // Advanced goal for beginner
        motivations: ["compete", "improve_times"],
        timeAvailability: 3, // Very limited time
        preferredApproach: "scientific", // Complex approach for beginner
      };

      const result = engine.recommendMethodology(conflictingProfile);

      expect(result).toBeDefined();
      expect(result.warnings).toBeDefined();
      expect(
        result.primaryRecommendation.considerations.length,
      ).toBeGreaterThan(0);
    });
  });
});
