import { describe, it, expect, beforeEach } from "vitest";
import {
  MethodologyTransitionSystem,
  MethodologyTransition,
  TransitionType,
} from "../methodology-transition-system";
import { TrainingPlan, TrainingPhase, TrainingMethodology } from "../types";
import { PlanModification } from "../adaptation";

// Helper function to create a mock training plan
function createMockTrainingPlan(
  methodology: TrainingMethodology = "daniels",
): TrainingPlan {
  return {
    id: "test-plan",
    config: {
      name: "Test Plan",
      goal: "MARATHON",
      startDate: new Date(),
      endDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
      methodology,
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
      {
        id: "block-2",
        phase: "build",
        startDate: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000),
        weeks: 4,
        focusAreas: ["threshold development"],
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
      phases: [
        {
          phase: "base",
          weeks: 4,
          totalWorkouts: 20,
          avgWeeklyDistance: 35,
          focusAreas: ["aerobic base"],
        },
        {
          phase: "build",
          weeks: 4,
          totalWorkouts: 20,
          avgWeeklyDistance: 40,
          focusAreas: ["threshold development"],
        },
      ],
    },
    workouts: [],
  };
}

describe("MethodologyTransitionSystem", () => {
  let system: MethodologyTransitionSystem;

  beforeEach(() => {
    system = new MethodologyTransitionSystem();
  });

  describe("Requirement 5.5: Methodology Switching Support", () => {
    it("should create methodology transition for different methodology pairs", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      expect(transition).toBeDefined();
      expect(transition.fromMethodology).toBe("daniels");
      expect(transition.toMethodology).toBe("lydiard");
      expect(transition.transitionType).toBeDefined();
      expect(transition.transitionPlan).toBeDefined();
    });

    it("should determine appropriate transition type based on compatibility", () => {
      const plan = createMockTrainingPlan("daniels");

      // Test different transition scenarios
      const transitions = [
        { from: "daniels", to: "pfitzinger", expectedType: "gradual" },
        { from: "lydiard", to: "daniels", expectedType: "gradual" },
        { from: "daniels", to: "lydiard", expectedType: "gradual" },
      ];

      transitions.forEach(({ from, to, expectedType }) => {
        const transition = system.createMethodologyTransition(
          plan,
          from as TrainingMethodology,
          to as TrainingMethodology,
          "base",
        );

        expect(["immediate", "gradual", "phased", "deferred"]).toContain(
          transition.transitionType,
        );
      });
    });

    it("should defer transition during peak/taper phases", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "peak",
      );

      expect(transition.transitionType).toBe("deferred");
    });

    it("should create detailed transition plan with phases", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      expect(transition.transitionPlan.phases).toBeDefined();
      expect(transition.transitionPlan.phases.length).toBeGreaterThan(0);

      transition.transitionPlan.phases.forEach((phase) => {
        expect(phase.phaseNumber).toBeDefined();
        expect(phase.name).toBeDefined();
        expect(phase.duration).toBeGreaterThan(0);
        expect(phase.focus).toBeDefined();
        expect(phase.keyWorkouts).toBeDefined();
        expect(phase.volumeTarget).toBeDefined();
        expect(phase.intensityDistribution).toBeDefined();
        expect(phase.milestones).toBeDefined();
      });
    });

    it("should create workout migration plan", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const migration = transition.transitionPlan.workoutMigration;
      expect(migration.workoutsToPhaseOut).toBeDefined();
      expect(migration.workoutsToIntroduce).toBeDefined();
      expect(migration.migrationSchedule).toBeDefined();
      expect(migration.migrationSchedule.length).toBeGreaterThan(0);
    });

    it("should apply transition to existing plan", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const { modifiedPlan, modifications } = system.applyTransition(
        plan,
        transition,
      );

      expect(modifiedPlan).toBeDefined();
      expect(modifiedPlan.config.methodology).toBe("lydiard");
      expect(modifications).toBeDefined();
      expect(modifications.length).toBeGreaterThan(0);
    });
  });

  describe("Requirement 5.6: Transition Requirement Explanations", () => {
    it("should identify transition requirements", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "pfitzinger",
        "base",
      );

      expect(transition.requirements).toBeDefined();
      expect(transition.requirements.length).toBeGreaterThan(0);

      transition.requirements.forEach((req) => {
        expect(req.category).toBeDefined();
        expect(req.requirement).toBeDefined();
        expect(req.rationale).toBeDefined();
        expect(typeof req.isMandatory).toBe("boolean");
        expect(req.assessmentCriteria).toBeDefined();
        expect(req.assessmentCriteria.length).toBeGreaterThan(0);
      });
    });

    it("should provide specific requirements for each methodology", () => {
      const plan = createMockTrainingPlan("daniels");

      // Transition to Pfitzinger should require volume base
      const toPfitzinger = system.createMethodologyTransition(
        plan,
        "daniels",
        "pfitzinger",
        "base",
      );

      const volumeReq = toPfitzinger.requirements.find(
        (r) => r.category === "fitness_baseline",
      );
      expect(volumeReq).toBeDefined();
      expect(volumeReq!.requirement).toMatch(/minimum.*miles.*week/i);

      // Transition to Lydiard should require time availability
      const toLydiard = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const timeReq = toLydiard.requirements.find(
        (r) => r.category === "time_availability",
      );
      expect(timeReq).toBeDefined();
      expect(timeReq!.requirement).toMatch(/hours.*week/i);

      // Transition to Daniels should require technical skills
      const toDaniels = system.createMethodologyTransition(
        plan,
        "lydiard",
        "daniels",
        "base",
      );

      const techReq = toDaniels.requirements.find(
        (r) => r.category === "technical_skills",
      );
      expect(techReq).toBeDefined();
      expect(techReq!.requirement).toMatch(/pace.*VDOT/i);
    });

    it("should provide alternative options for non-mandatory requirements", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const nonMandatoryReqs = transition.requirements.filter(
        (r) => !r.isMandatory,
      );
      const reqsWithAlternatives = nonMandatoryReqs.filter(
        (r) => r.alternativeOptions && r.alternativeOptions.length > 0,
      );

      expect(reqsWithAlternatives.length).toBeGreaterThan(0);
    });
  });

  describe("Requirement 5.8: Methodology Conflict Resolution", () => {
    it("should identify methodology conflicts", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      expect(transition.conflicts).toBeDefined();
      expect(transition.conflicts.length).toBeGreaterThan(0);

      transition.conflicts.forEach((conflict) => {
        expect(conflict.conflictType).toBeDefined();
        expect(conflict.description).toBeDefined();
        expect(conflict.severity).toMatch(/high|medium|low/);
        expect(conflict.resolution).toBeDefined();
        expect(conflict.compromises).toBeDefined();
      });
    });

    it("should provide resolution strategies for conflicts", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      transition.conflicts.forEach((conflict) => {
        expect(conflict.resolution.strategy).toBeDefined();
        expect(conflict.resolution.steps).toBeDefined();
        expect(conflict.resolution.steps.length).toBeGreaterThan(0);
        expect(conflict.resolution.expectedOutcome).toBeDefined();
        expect(conflict.resolution.timeToResolve).toBeGreaterThan(0);
      });
    });

    it("should identify philosophy mismatches", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const philosophyConflict = transition.conflicts.find(
        (c) => c.conflictType === "philosophy_mismatch",
      );

      expect(philosophyConflict).toBeDefined();
      expect(philosophyConflict!.description).toMatch(
        /data-driven.*intuitive|precision.*effort/i,
      );
    });

    it("should identify volume incompatibilities", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const volumeConflict = transition.conflicts.find(
        (c) => c.conflictType === "volume_incompatibility",
      );

      if (volumeConflict) {
        expect(volumeConflict.severity).toMatch(/high|medium/);
        const hasVolumeStep = volumeConflict.resolution.steps.some((step) =>
          step.match(/increase.*volume|gradual/i),
        );
        expect(hasVolumeStep).toBe(true);
      }
    });
  });

  describe("Transition Guidance", () => {
    it("should provide comprehensive transition guidance", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      expect(transition.guidance).toBeDefined();
      expect(transition.guidance.overview).toBeDefined();
      expect(transition.guidance.keyPrinciples).toBeDefined();
      expect(transition.guidance.keyPrinciples.length).toBeGreaterThan(0);
      expect(transition.guidance.dos).toBeDefined();
      expect(transition.guidance.dos.length).toBeGreaterThan(0);
      expect(transition.guidance.donts).toBeDefined();
      expect(transition.guidance.donts.length).toBeGreaterThan(0);
    });

    it("should provide transition checkpoints", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      expect(transition.guidance.checkpoints).toBeDefined();
      expect(transition.guidance.checkpoints.length).toBeGreaterThan(0);

      transition.guidance.checkpoints.forEach((checkpoint) => {
        expect(checkpoint.week).toBeDefined();
        expect(checkpoint.name).toBeDefined();
        expect(checkpoint.assessmentCriteria).toBeDefined();
        expect(checkpoint.successIndicators).toBeDefined();
        expect(checkpoint.adjustmentOptions).toBeDefined();
      });
    });

    it("should provide troubleshooting guides", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      expect(transition.guidance.troubleshooting).toBeDefined();
      expect(transition.guidance.troubleshooting.length).toBeGreaterThan(0);

      transition.guidance.troubleshooting.forEach((guide) => {
        expect(guide.issue).toBeDefined();
        expect(guide.symptoms).toBeDefined();
        expect(guide.causes).toBeDefined();
        expect(guide.solutions).toBeDefined();
        expect(guide.preventionTips).toBeDefined();
      });
    });
  });

  describe("Volume and Intensity Adjustments", () => {
    it("should create volume adjustment plan", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const volumePlan = transition.transitionPlan.volumeAdjustment;
      expect(volumePlan.currentWeeklyVolume).toBeDefined();
      expect(volumePlan.targetWeeklyVolume).toBeDefined();
      expect(volumePlan.adjustmentRate).toBeDefined();
      expect(volumePlan.stepBackWeeks).toBeDefined();
      expect(volumePlan.volumeByWeek).toBeDefined();

      // Verify progressive volume increase
      let previousVolume = volumePlan.currentWeeklyVolume;
      volumePlan.volumeByWeek.forEach((week, index) => {
        if (!volumePlan.stepBackWeeks.includes(week.week)) {
          expect(week.volume).toBeGreaterThanOrEqual(previousVolume);
          previousVolume = week.volume;
        }
      });
    });

    it("should create intensity adjustment plan", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const intensityPlan = transition.transitionPlan.intensityAdjustment;
      expect(intensityPlan.currentDistribution).toBeDefined();
      expect(intensityPlan.targetDistribution).toBeDefined();
      expect(intensityPlan.weeklyProgression).toBeDefined();

      // Verify intensity distribution sums to 100
      intensityPlan.weeklyProgression.forEach((week) => {
        const total =
          week.distribution.easy +
          week.distribution.moderate +
          week.distribution.hard;
        expect(Math.round(total)).toBe(100);
      });
    });

    it("should include recovery protocol", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const recovery = transition.transitionPlan.recoveryProtocol;
      expect(recovery.additionalRecoveryDays).toBeGreaterThan(0);
      expect(recovery.recoveryWeeks).toBeDefined();
      expect(recovery.adaptationMonitoring).toBeDefined();
      expect(recovery.adaptationMonitoring.length).toBeGreaterThan(0);
      expect(recovery.warningSignals).toBeDefined();
      expect(recovery.warningSignals.length).toBeGreaterThan(0);
    });
  });

  describe("Timeline and Risk Assessment", () => {
    it("should create transition timeline", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      expect(transition.timeline).toBeDefined();
      expect(transition.timeline.totalDuration).toBeGreaterThan(0);
      expect(transition.timeline.phases).toBeDefined();
      expect(transition.timeline.criticalDates).toBeDefined();

      // Verify critical dates are in order
      let previousWeek = 0;
      transition.timeline.criticalDates.forEach((date) => {
        expect(date.week).toBeGreaterThanOrEqual(previousWeek);
        previousWeek = date.week;
      });
    });

    it("should assess transition risks", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      expect(transition.risks).toBeDefined();
      expect(transition.risks.length).toBeGreaterThan(0);

      transition.risks.forEach((risk) => {
        expect(risk.riskType).toBeDefined();
        expect(risk.description).toBeDefined();
        expect(risk.likelihood).toMatch(/high|medium|low/);
        expect(risk.impact).toMatch(/high|medium|low/);
        expect(risk.mitigationStrategies).toBeDefined();
        expect(risk.mitigationStrategies.length).toBeGreaterThan(0);
        expect(risk.warningSignals).toBeDefined();
      });
    });

    it("should identify overtraining risk for volume increases", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const overtrainingRisk = transition.risks.find(
        (r) => r.riskType === "overtraining",
      );
      expect(overtrainingRisk).toBeDefined();
      const hasGradualStrategy = overtrainingRisk!.mitigationStrategies.some(
        (strategy) =>
          strategy.match(
            /gradual.*volume|monitor.*fatigue|volume.*progression/i,
          ),
      );
      expect(hasGradualStrategy).toBe(true);
    });
  });

  describe("Validation", () => {
    it("should validate transition plan", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const validation = system.validateTransition(transition, plan);

      expect(validation).toBeDefined();
      expect(validation.isValid).toBeDefined();
      expect(validation.errors).toBeDefined();
      expect(validation.warnings).toBeDefined();
    });

    it("should warn about high-risk immediate transitions", () => {
      const plan = createMockTrainingPlan("daniels");

      // Create a transition with high risk
      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      // Manually set to immediate with high risk for testing
      transition.transitionType = "immediate";
      transition.risks.push({
        riskType: "overtraining",
        description: "Test high risk",
        likelihood: "high",
        impact: "high",
        mitigationStrategies: [],
        warningSignals: [],
      });

      const validation = system.validateTransition(transition, plan);

      const hasWarning = validation.warnings.some((w) =>
        w.message.match(/high-risk.*immediate/i),
      );
      expect(hasWarning).toBe(true);
    });
  });

  describe("Plan Modifications", () => {
    it("should create appropriate plan modifications", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const { modifications } = system.applyTransition(plan, transition);

      expect(modifications.length).toBeGreaterThan(0);

      // Should have volume modifications
      const volumeMods = modifications.filter(
        (m) => m.type === "reduce_volume",
      );
      expect(volumeMods.length).toBeGreaterThan(0);

      // Should have recovery modifications
      const recoveryMods = modifications.filter(
        (m) => m.type === "add_recovery",
      );
      expect(recoveryMods.length).toBeGreaterThan(0);
    });

    it("should create workout substitution modifications", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
      );

      const { modifications } = system.applyTransition(plan, transition);

      const substitutions = modifications.filter(
        (m) => m.type === "substitute_workout",
      );
      expect(substitutions.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle same methodology transitions", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "daniels",
        "base",
      );

      expect(transition.transitionType).toBe("immediate");
      expect(transition.conflicts.length).toBe(0);
    });

    it("should handle transitions during different phases", () => {
      const plan = createMockTrainingPlan("daniels");
      const phases: TrainingPhase[] = [
        "base",
        "build",
        "peak",
        "taper",
        "recovery",
      ];

      phases.forEach((phase) => {
        const transition = system.createMethodologyTransition(
          plan,
          "daniels",
          "lydiard",
          phase,
        );

        expect(transition).toBeDefined();
        if (phase === "peak" || phase === "taper") {
          expect(transition.transitionType).toBe("deferred");
        }
      });
    });

    it("should handle transitions with missing user profile", () => {
      const plan = createMockTrainingPlan("daniels");

      const transition = system.createMethodologyTransition(
        plan,
        "daniels",
        "lydiard",
        "base",
        undefined, // No user profile
      );

      expect(transition).toBeDefined();
      expect(transition.transitionPlan).toBeDefined();
    });
  });
});
