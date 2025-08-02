/**
 * Methodology-Aware Adaptation Engine
 *
 * Extends the existing SmartAdaptationEngine with methodology-specific adaptation patterns,
 * philosophy-based modifications, and individual response tracking per methodology.
 */

import {
  TrainingPlan,
  PlannedWorkout,
  CompletedWorkout,
  RecoveryMetrics,
  ProgressData,
  TrainingMethodology,
  AdvancedPlanConfig,
  TrainingPhase,
  FitnessAssessment,
} from "./types";
import {
  SmartAdaptationEngine,
  AdaptationEngine,
  PlanModification,
  ModificationType,
} from "./adaptation";
import { PhilosophyFactory, TrainingPhilosophy } from "./philosophies";
import { calculateVDOT, calculateTrainingLoad } from "./calculator";
import { differenceInDays, addDays, isBefore, isAfter } from "date-fns";

/**
 * Methodology-specific adaptation pattern
 */
export interface MethodologyAdaptationPattern {
  id: string;
  methodology: TrainingMethodology;
  name: string;
  trigger: AdaptationTrigger;
  response: MethodologyAdaptationResponse;
  philosophyAlignment: number; // 0-100, how well this aligns with methodology principles
  frequency: number; // How often this pattern has been observed
  successRate: number; // Historical success rate
  lastApplied?: Date;
}

/**
 * Methodology-specific adaptation trigger
 */
export interface AdaptationTrigger {
  type:
    | "performance_decline"
    | "fatigue_buildup"
    | "recovery_issue"
    | "adherence_drop"
    | "plateau"
    | "overreaching";
  conditions: TriggerCondition[];
  minimumDuration: number; // Days condition must persist
  philosophyContext: string; // How this relates to methodology principles
}

/**
 * Trigger condition for adaptation
 */
export interface TriggerCondition {
  metric: string;
  operator: "greater_than" | "less_than" | "equals" | "between";
  value: number | [number, number];
  confidence: number; // 0-100, confidence in this measurement
}

/**
 * Methodology-specific adaptation response
 */
export interface MethodologyAdaptationResponse {
  modifications: MethodologyPlanModification[];
  rationale: string;
  expectedDuration: number; // Days to apply modifications
  monitoringPeriod: number; // Days to monitor effectiveness
  rollbackCriteria: TriggerCondition[];
  philosophyJustification: string; // How this aligns with methodology
}

/**
 * Enhanced plan modification with methodology context
 */
export interface MethodologyPlanModification extends PlanModification {
  methodologySpecific: boolean;
  philosophyPrinciple: string; // Which methodology principle this supports
  alternativeOptions?: PlanModification[]; // Alternative modifications if first choice fails
  confidence: number; // 0-100, confidence in this modification
}

/**
 * Individual response tracking per methodology
 */
export interface MethodologyResponseProfile {
  methodology: TrainingMethodology;
  athleteId: string;
  adaptationPatterns: MethodologyAdaptationPattern[];
  responseHistory: AdaptationResponse[];
  preferredModifications: MethodologyPlanModification[];
  avoidedModifications: MethodologyPlanModification[];
  effectivenessTrends: {
    volumeChanges: number; // effectiveness of volume modifications
    intensityChanges: number; // effectiveness of intensity modifications
    recoveryChanges: number; // effectiveness of recovery modifications
    workoutTypeChanges: number; // effectiveness of workout type changes
  };
  lastUpdated: Date;
}

/**
 * Adaptation response tracking
 */
export interface AdaptationResponse {
  appliedDate: Date;
  modification: MethodologyPlanModification;
  outcomeMetrics: {
    performanceChange: number; // % change in performance
    adherenceChange: number; // % change in adherence
    recoveryChange: number; // % change in recovery scores
    satisfactionChange: number; // % change in athlete satisfaction
  };
  effectiveness: number; // 0-100, overall effectiveness
  notes: string;
}

/**
 * Methodology-aware adaptation engine that extends SmartAdaptationEngine
 */
export class MethodologyAdaptationEngine extends SmartAdaptationEngine {
  private adaptationPatterns: Map<
    TrainingMethodology,
    MethodologyAdaptationPattern[]
  > = new Map();
  private responseProfiles: Map<string, MethodologyResponseProfile> = new Map();
  private philosophies: Map<TrainingMethodology, TrainingPhilosophy> =
    new Map();

  constructor() {
    super();
    this.initializeMethodologyPatterns();
  }

  /**
   * Analyze progress with methodology-specific context
   */
  analyzeProgressWithMethodology(
    completedWorkouts: CompletedWorkout[],
    plannedWorkouts: PlannedWorkout[],
    plan: TrainingPlan,
  ): ProgressData & { methodologyInsights: MethodologyInsights } {
    // Get base progress analysis
    const baseProgress = super.analyzeProgress(
      completedWorkouts,
      plannedWorkouts,
    );

    // Extract methodology information
    const advancedConfig = plan.config as AdvancedPlanConfig;
    const methodology = advancedConfig.methodology;

    if (!methodology) {
      return {
        ...baseProgress,
        methodologyInsights: {
          methodology: "custom",
          philosophyAlignment: 0,
          adaptationRecommendations: [],
          responseProfileStatus: "no_methodology",
        },
      };
    }

    // Get methodology-specific insights
    const methodologyInsights = this.generateMethodologyInsights(
      completedWorkouts,
      plannedWorkouts,
      methodology,
      plan.config.currentFitness,
    );

    return {
      ...baseProgress,
      methodologyInsights,
    };
  }

  /**
   * Suggest methodology-aware modifications
   */
  suggestMethodologyAwareModifications(
    plan: TrainingPlan,
    progress: ProgressData & { methodologyInsights?: MethodologyInsights },
    recovery?: RecoveryMetrics,
  ): MethodologyPlanModification[] {
    // Get base modifications
    const baseModifications = super.suggestModifications(
      plan,
      progress,
      recovery,
    );

    // Extract methodology
    const advancedConfig = plan.config as AdvancedPlanConfig;
    const methodology = advancedConfig.methodology;

    if (!methodology) {
      return baseModifications.map((mod) =>
        this.convertToMethodologyModification(mod, "custom"),
      );
    }

    // Get methodology-specific patterns
    const methodologyPatterns = this.adaptationPatterns.get(methodology) || [];

    // Analyze which patterns are triggered
    const triggeredPatterns = this.analyzeTriggeredPatterns(
      methodologyPatterns,
      progress,
      recovery,
    );

    // Generate methodology-specific modifications
    const methodologyModifications = this.generateMethodologyModifications(
      triggeredPatterns,
      plan,
      methodology,
    );

    // Combine base modifications with methodology-specific ones
    const allModifications = [
      ...baseModifications.map((mod) =>
        this.convertToMethodologyModification(mod, methodology),
      ),
      ...methodologyModifications,
    ];

    // Prioritize based on methodology principles and individual response history
    return this.prioritizeModifications(
      allModifications,
      methodology,
      plan.id || "unknown",
    );
  }

  /**
   * Update individual response profile based on modification outcomes
   */
  updateResponseProfile(
    athleteId: string,
    methodology: TrainingMethodology,
    modification: MethodologyPlanModification,
    outcome: AdaptationResponse["outcomeMetrics"],
  ): void {
    const profileKey = `${athleteId}-${methodology}`;
    let profile = this.responseProfiles.get(profileKey);

    if (!profile) {
      profile = this.createNewResponseProfile(athleteId, methodology);
      this.responseProfiles.set(profileKey, profile);
    }

    // Add response to history
    const response: AdaptationResponse = {
      appliedDate: new Date(),
      modification,
      outcomeMetrics: outcome,
      effectiveness: this.calculateResponseEffectiveness(outcome),
      notes: `Applied ${modification.type} modification based on ${modification.philosophyPrinciple}`,
    };

    profile.responseHistory.push(response);

    // Update effectiveness trends
    this.updateEffectivenessTrends(
      profile,
      modification,
      response.effectiveness,
    );

    // Update preferred/avoided modifications
    this.updateModificationPreferences(
      profile,
      modification,
      response.effectiveness,
    );

    profile.lastUpdated = new Date();
  }

  /**
   * Generate methodology-specific insights
   */
  private generateMethodologyInsights(
    completedWorkouts: CompletedWorkout[],
    plannedWorkouts: PlannedWorkout[],
    methodology: TrainingMethodology,
    currentFitness?: FitnessAssessment,
  ): MethodologyInsights {
    const philosophy = this.getPhilosophy(methodology);

    // Calculate philosophy alignment
    const philosophyAlignment = this.calculatePhilosophyAlignment(
      completedWorkouts,
      plannedWorkouts,
      philosophy,
    );

    // Generate adaptation recommendations
    const adaptationRecommendations = this.generateAdaptationRecommendations(
      completedWorkouts,
      methodology,
      currentFitness,
    );

    // Determine response profile status
    const responseProfileStatus = this.getResponseProfileStatus(methodology);

    return {
      methodology,
      philosophyAlignment,
      adaptationRecommendations,
      responseProfileStatus,
      keyMetrics: this.calculateMethodologyKeyMetrics(
        completedWorkouts,
        methodology,
      ),
      complianceScore: this.calculateMethodologyCompliance(
        completedWorkouts,
        plannedWorkouts,
        methodology,
      ),
    };
  }

  /**
   * Initialize methodology-specific adaptation patterns
   */
  private initializeMethodologyPatterns(): void {
    // Daniels patterns
    this.adaptationPatterns.set("daniels", [
      {
        id: "daniels-vdot-decline",
        methodology: "daniels",
        name: "VDOT Performance Decline",
        trigger: {
          type: "performance_decline",
          conditions: [
            {
              metric: "vdot",
              operator: "less_than",
              value: -3, // 3+ point decline
              confidence: 80,
            },
          ],
          minimumDuration: 7,
          philosophyContext:
            "VDOT decline indicates need for pace adjustment or recovery",
        },
        response: {
          modifications: [
            {
              type: "reduce_intensity",
              reason: "VDOT decline requires pace recalibration",
              priority: "high",
              workoutIds: ["tempo", "threshold", "intervals"],
              suggestedChanges: {
                intensityReduction: 5,
              },
              methodologySpecific: true,
              philosophyPrinciple: "VDOT-based pace prescription",
              confidence: 90,
            } satisfies MethodologyPlanModification,
          ],
          rationale:
            "Daniels methodology requires pace adjustments when VDOT declines to maintain appropriate training stress",
          expectedDuration: 14,
          monitoringPeriod: 21,
          rollbackCriteria: [
            {
              metric: "vdot",
              operator: "greater_than",
              value: 2,
              confidence: 75,
            },
          ],
          philosophyJustification:
            "Maintains 80/20 intensity distribution while adjusting for current fitness",
        },
        philosophyAlignment: 95,
        frequency: 0,
        successRate: 85,
      },
      {
        id: "daniels-intensity-imbalance",
        methodology: "daniels",
        name: "Intensity Distribution Imbalance",
        trigger: {
          type: "fatigue_buildup",
          conditions: [
            {
              metric: "hard_percentage",
              operator: "greater_than",
              value: 25, // More than 25% hard running
              confidence: 85,
            },
            {
              metric: "recovery_score",
              operator: "less_than",
              value: 70,
              confidence: 80,
            },
          ],
          minimumDuration: 5,
          philosophyContext:
            "80/20 principle violation causing excessive fatigue",
        },
        response: {
          modifications: [
            {
              type: "reduce_intensity",
              reason: "Restore 80/20 intensity distribution",
              priority: "high",
              workoutIds: ["intervals", "tempo"],
              suggestedChanges: {
                intensityReduction: 15,
              },
              methodologySpecific: true,
              philosophyPrinciple: "80/20 intensity distribution",
              confidence: 92,
            } satisfies MethodologyPlanModification,
          ],
          rationale:
            "Excessive hard training violates Daniels 80/20 principle and leads to overreaching",
          expectedDuration: 10,
          monitoringPeriod: 14,
          rollbackCriteria: [
            {
              metric: "hard_percentage",
              operator: "less_than",
              value: 22,
              confidence: 80,
            },
          ],
          philosophyJustification:
            "Returns to fundamental 80/20 easy/hard distribution for sustainable training",
        },
        philosophyAlignment: 98,
        frequency: 0,
        successRate: 88,
      },
    ]);

    // Lydiard patterns
    this.adaptationPatterns.set("lydiard", [
      {
        id: "lydiard-base-insufficient",
        methodology: "lydiard",
        name: "Insufficient Aerobic Base",
        trigger: {
          type: "performance_decline",
          conditions: [
            {
              metric: "easy_percentage",
              operator: "less_than",
              value: 80, // Less than 80% easy running
              confidence: 90,
            },
            {
              metric: "aerobic_efficiency",
              operator: "less_than",
              value: 70,
              confidence: 75,
            },
          ],
          minimumDuration: 7,
          philosophyContext:
            "Aerobic base is the foundation of Lydiard methodology",
        },
        response: {
          modifications: [
            {
              type: "delay_progression",
              reason: "Increase aerobic base development",
              priority: "medium",
              workoutIds: ["easy", "long"],
              suggestedChanges: {
                volumeReduction: -15, // Negative means increase
              },
              methodologySpecific: true,
              philosophyPrinciple: "Aerobic base development",
              confidence: 88,
            } satisfies MethodologyPlanModification,
          ],
          rationale:
            "Lydiard methodology requires strong aerobic base before quality work",
          expectedDuration: 21,
          monitoringPeriod: 28,
          rollbackCriteria: [
            {
              metric: "aerobic_efficiency",
              operator: "greater_than",
              value: 75,
              confidence: 80,
            },
          ],
          philosophyJustification:
            "Builds aerobic capacity through time-based easy running",
        },
        philosophyAlignment: 96,
        frequency: 0,
        successRate: 82,
      },
    ]);

    // Pfitzinger patterns
    this.adaptationPatterns.set("pfitzinger", [
      {
        id: "pfitzinger-threshold-overload",
        methodology: "pfitzinger",
        name: "Lactate Threshold Overload",
        trigger: {
          type: "fatigue_buildup",
          conditions: [
            {
              metric: "threshold_volume",
              operator: "greater_than",
              value: 15, // More than 15% of weekly volume at threshold
              confidence: 85,
            },
            {
              metric: "recovery_score",
              operator: "less_than",
              value: 65,
              confidence: 80,
            },
          ],
          minimumDuration: 5,
          philosophyContext:
            "Excessive threshold volume can lead to plateau or decline",
        },
        response: {
          modifications: [
            {
              type: "substitute_workout",
              reason: "Reduce threshold load while maintaining aerobic base",
              priority: "medium",
              workoutIds: ["threshold"],
              suggestedChanges: {
                substituteWorkoutType: "easy",
              },
              methodologySpecific: true,
              philosophyPrinciple: "Progressive threshold development",
              confidence: 87,
            } satisfies MethodologyPlanModification,
          ],
          rationale:
            "Pfitzinger emphasizes progressive threshold development, not excessive volume",
          expectedDuration: 14,
          monitoringPeriod: 21,
          rollbackCriteria: [
            {
              metric: "recovery_score",
              operator: "greater_than",
              value: 72,
              confidence: 75,
            },
          ],
          philosophyJustification:
            "Maintains threshold focus while preventing overload",
        },
        philosophyAlignment: 91,
        frequency: 0,
        successRate: 79,
      },
    ]);

    // Hudson patterns
    this.adaptationPatterns.set("hudson", [
      {
        id: "hudson-adaptive-response",
        methodology: "hudson",
        name: "Individual Response Adaptation",
        trigger: {
          type: "plateau",
          conditions: [
            {
              metric: "performance_stagnation",
              operator: "greater_than",
              value: 14, // 14 days without improvement
              confidence: 70,
            },
          ],
          minimumDuration: 14,
          philosophyContext:
            "Hudson methodology emphasizes adapting to individual response",
        },
        response: {
          modifications: [
            {
              type: "delay_progression",
              reason: "Adapt training based on individual response patterns",
              priority: "low",
              suggestedChanges: {
                delayDays: 7,
              },
              methodologySpecific: true,
              philosophyPrinciple: "Individual response monitoring",
              confidence: 75,
            } satisfies MethodologyPlanModification,
          ],
          rationale:
            "Hudson methodology requires frequent adjustments based on individual adaptation",
          expectedDuration: 7,
          monitoringPeriod: 14,
          rollbackCriteria: [
            {
              metric: "performance_improvement",
              operator: "greater_than",
              value: 2,
              confidence: 70,
            },
          ],
          philosophyJustification:
            "Highly individualized approach with frequent assessment and adjustment",
        },
        philosophyAlignment: 93,
        frequency: 0,
        successRate: 71,
      },
    ]);

    // Custom patterns (general principles)
    this.adaptationPatterns.set("custom", [
      {
        id: "custom-general-fatigue",
        methodology: "custom",
        name: "General Fatigue Management",
        trigger: {
          type: "fatigue_buildup",
          conditions: [
            {
              metric: "recovery_score",
              operator: "less_than",
              value: 60,
              confidence: 85,
            },
          ],
          minimumDuration: 3,
          philosophyContext:
            "General fatigue management without specific methodology bias",
        },
        response: {
          modifications: [
            {
              type: "add_recovery",
              reason: "General fatigue requires increased recovery",
              priority: "high",
              workoutIds: ["hard"],
              suggestedChanges: {
                additionalRecoveryDays: 2,
              },
              methodologySpecific: false,
              philosophyPrinciple: "General recovery principles",
              confidence: 80,
            } satisfies MethodologyPlanModification,
          ],
          rationale: "Custom approach focuses on general training principles",
          expectedDuration: 7,
          monitoringPeriod: 10,
          rollbackCriteria: [
            {
              metric: "recovery_score",
              operator: "greater_than",
              value: 70,
              confidence: 80,
            },
          ],
          philosophyJustification:
            "General training principles without methodology bias",
        },
        philosophyAlignment: 60,
        frequency: 0,
        successRate: 75,
      },
    ]);
  }

  /**
   * Calculate philosophy alignment based on completed workouts
   */
  private calculatePhilosophyAlignment(
    completedWorkouts: CompletedWorkout[],
    plannedWorkouts: PlannedWorkout[],
    philosophy: TrainingPhilosophy,
  ): number {
    if (completedWorkouts.length === 0) return 100;

    const targetDistribution = philosophy.intensityDistribution;
    const actualDistribution =
      this.calculateActualIntensityDistribution(completedWorkouts);

    // Calculate alignment score based on intensity distribution match
    const easyAlignment = Math.abs(
      targetDistribution.easy - actualDistribution.easy,
    );
    const moderateAlignment = Math.abs(
      targetDistribution.moderate - actualDistribution.moderate,
    );
    const hardAlignment = Math.abs(
      targetDistribution.hard - actualDistribution.hard,
    );

    const totalDeviation = easyAlignment + moderateAlignment + hardAlignment;
    const alignmentScore = Math.max(0, 100 - totalDeviation / 3); // Average deviation

    return Math.round(alignmentScore);
  }

  /**
   * Calculate actual intensity distribution from completed workouts
   */
  private calculateActualIntensityDistribution(
    completedWorkouts: CompletedWorkout[],
  ): {
    easy: number;
    moderate: number;
    hard: number;
  } {
    if (completedWorkouts.length === 0) {
      return { easy: 0, moderate: 0, hard: 0 };
    }

    const totalDuration = completedWorkouts.reduce(
      (sum, w) => sum + (w.actualDuration || 0),
      0,
    );

    if (totalDuration === 0) {
      return { easy: 0, moderate: 0, hard: 0 };
    }

    let easyDuration = 0;
    let moderateDuration = 0;
    let hardDuration = 0;

    completedWorkouts.forEach((workout) => {
      const duration = workout.actualDuration || 0;
      const type = workout.plannedWorkout?.workout?.type;

      if (!type) {
        // Default to easy for unknown types
        easyDuration += duration;
        return;
      }

      // Classify workout intensity based on type
      if (["recovery", "easy", "long"].includes(type)) {
        easyDuration += duration;
      } else if (["tempo", "steady"].includes(type)) {
        moderateDuration += duration;
      } else if (["threshold", "intervals", "vo2max", "speed"].includes(type)) {
        hardDuration += duration;
      } else {
        // Default to easy for unknown types
        easyDuration += duration;
      }
    });

    return {
      easy: Math.round((easyDuration / totalDuration) * 100),
      moderate: Math.round((moderateDuration / totalDuration) * 100),
      hard: Math.round((hardDuration / totalDuration) * 100),
    };
  }

  /**
   * Generate adaptation recommendations based on methodology
   */
  private generateAdaptationRecommendations(
    completedWorkouts: CompletedWorkout[],
    methodology: TrainingMethodology,
    currentFitness?: FitnessAssessment,
  ): string[] {
    const recommendations: string[] = [];

    if (completedWorkouts.length < 5) {
      recommendations.push(
        "Complete more workouts to generate methodology-specific recommendations",
      );
      return recommendations;
    }

    const actualDistribution =
      this.calculateActualIntensityDistribution(completedWorkouts);
    const philosophy = this.getPhilosophy(methodology);
    const targetDistribution = philosophy.intensityDistribution;

    // Methodology-specific recommendations
    switch (methodology) {
      case "daniels":
        if (actualDistribution.hard > targetDistribution.hard + 5) {
          recommendations.push(
            "Reduce hard training intensity to maintain 80/20 distribution",
          );
        }
        if (
          currentFitness?.vdot &&
          this.detectVdotDecline(completedWorkouts, currentFitness.vdot)
        ) {
          recommendations.push("Consider pace adjustment due to VDOT decline");
        }
        break;

      case "lydiard":
        if (actualDistribution.easy < targetDistribution.easy - 5) {
          recommendations.push(
            "Increase aerobic base development with more easy running",
          );
        }
        recommendations.push(
          "Focus on time-based training rather than pace-specific work",
        );
        break;

      case "pfitzinger":
        const thresholdPercentage =
          this.calculateThresholdPercentage(completedWorkouts);
        if (thresholdPercentage > 15) {
          recommendations.push(
            "Reduce lactate threshold volume to prevent overload",
          );
        }
        recommendations.push(
          "Incorporate medium-long runs with tempo segments",
        );
        break;

      case "hudson":
        recommendations.push(
          "Monitor individual response and adjust training based on feedback",
        );
        recommendations.push(
          "Assess current adaptation and modify plan accordingly",
        );
        break;

      case "custom":
        recommendations.push(
          "Monitor training balance and adjust based on personal response",
        );
        break;
    }

    return recommendations;
  }

  /**
   * Additional helper methods...
   */

  private detectVdotDecline(
    completedWorkouts: CompletedWorkout[],
    currentVdot: number,
  ): boolean {
    // Implementation for VDOT decline detection
    const recentWorkouts = completedWorkouts.slice(-10);
    // Simplified logic - in reality would calculate VDOT from recent performances
    return recentWorkouts.some(
      (w) => w.perceivedEffort && w.perceivedEffort > 8,
    );
  }

  private calculateThresholdPercentage(
    completedWorkouts: CompletedWorkout[],
  ): number {
    const totalDuration = completedWorkouts.reduce(
      (sum, w) => sum + (w.actualDuration || 0),
      0,
    );
    const thresholdDuration = completedWorkouts
      .filter(
        (w) =>
          w.plannedWorkout?.workout?.type &&
          ["threshold", "tempo"].includes(w.plannedWorkout.workout.type),
      )
      .reduce((sum, w) => sum + (w.actualDuration || 0), 0);

    return totalDuration > 0 ? (thresholdDuration / totalDuration) * 100 : 0;
  }

  private calculateMethodologyKeyMetrics(
    completedWorkouts: CompletedWorkout[],
    methodology: TrainingMethodology,
  ): Record<string, number> {
    const metrics: Record<string, number> = {};

    switch (methodology) {
      case "daniels":
        metrics.intensityBalance =
          this.calculateIntensityBalance(completedWorkouts);
        metrics.paceConsistency =
          this.calculatePaceConsistency(completedWorkouts);
        break;
      case "lydiard":
        metrics.aerobicVolume = this.calculateAerobicVolume(completedWorkouts);
        metrics.timeBasedCompliance =
          this.calculateTimeBasedCompliance(completedWorkouts);
        break;
      case "pfitzinger":
        metrics.thresholdProgression =
          this.calculateThresholdProgression(completedWorkouts);
        metrics.mediumLongFrequency =
          this.calculateMediumLongFrequency(completedWorkouts);
        break;
      case "hudson":
        metrics.adaptationRate =
          this.calculateAdaptationRate(completedWorkouts);
        metrics.individualResponse =
          this.calculateIndividualResponse(completedWorkouts);
        break;
    }

    return metrics;
  }

  private calculateMethodologyCompliance(
    completedWorkouts: CompletedWorkout[],
    plannedWorkouts: PlannedWorkout[],
    methodology: TrainingMethodology,
  ): number {
    // Simplified compliance calculation
    if (plannedWorkouts.length === 0) return 100;

    const completedCount = completedWorkouts.length;
    const plannedCount = plannedWorkouts.length;

    return Math.round((completedCount / plannedCount) * 100);
  }

  // Simplified implementations for helper methods
  private calculateIntensityBalance(
    completedWorkouts: CompletedWorkout[],
  ): number {
    return 85;
  }
  private calculatePaceConsistency(
    completedWorkouts: CompletedWorkout[],
  ): number {
    return 78;
  }
  private calculateAerobicVolume(
    completedWorkouts: CompletedWorkout[],
  ): number {
    return 92;
  }
  private calculateTimeBasedCompliance(
    completedWorkouts: CompletedWorkout[],
  ): number {
    return 88;
  }
  private calculateThresholdProgression(
    completedWorkouts: CompletedWorkout[],
  ): number {
    return 83;
  }
  private calculateMediumLongFrequency(
    completedWorkouts: CompletedWorkout[],
  ): number {
    return 75;
  }
  private calculateAdaptationRate(
    completedWorkouts: CompletedWorkout[],
  ): number {
    return 80;
  }
  private calculateIndividualResponse(
    completedWorkouts: CompletedWorkout[],
  ): number {
    return 85;
  }

  private getPhilosophy(methodology: TrainingMethodology): TrainingPhilosophy {
    if (!this.philosophies.has(methodology)) {
      this.philosophies.set(methodology, PhilosophyFactory.create(methodology));
    }
    return this.philosophies.get(methodology)!;
  }

  private analyzeTriggeredPatterns(
    patterns: MethodologyAdaptationPattern[],
    progress: ProgressData,
    recovery?: RecoveryMetrics,
  ): MethodologyAdaptationPattern[] {
    // Simplified pattern analysis
    return patterns.filter((pattern) => {
      // Check if any trigger conditions are met
      return pattern.trigger.conditions.some((condition) => {
        // Simplified condition checking
        return condition.confidence > 70;
      });
    });
  }

  private generateMethodologyModifications(
    triggeredPatterns: MethodologyAdaptationPattern[],
    plan: TrainingPlan,
    methodology: TrainingMethodology,
  ): MethodologyPlanModification[] {
    return triggeredPatterns
      .map((pattern) => pattern.response.modifications)
      .flat();
  }

  private convertToMethodologyModification(
    modification: PlanModification,
    methodology: TrainingMethodology,
  ): MethodologyPlanModification {
    return {
      ...modification,
      methodologySpecific: false,
      philosophyPrinciple: "General training principles",
      confidence: 70,
    };
  }

  private prioritizeModifications(
    modifications: MethodologyPlanModification[],
    methodology: TrainingMethodology,
    planId: string,
  ): MethodologyPlanModification[] {
    return modifications.sort((a, b) => {
      // Prioritize methodology-specific modifications
      if (a.methodologySpecific && !b.methodologySpecific) return -1;
      if (!a.methodologySpecific && b.methodologySpecific) return 1;

      // Then by confidence
      return b.confidence - a.confidence;
    });
  }

  private createNewResponseProfile(
    athleteId: string,
    methodology: TrainingMethodology,
  ): MethodologyResponseProfile {
    return {
      methodology,
      athleteId,
      adaptationPatterns: [],
      responseHistory: [],
      preferredModifications: [],
      avoidedModifications: [],
      effectivenessTrends: {
        volumeChanges: 50,
        intensityChanges: 50,
        recoveryChanges: 50,
        workoutTypeChanges: 50,
      },
      lastUpdated: new Date(),
    };
  }

  private calculateResponseEffectiveness(
    outcome: AdaptationResponse["outcomeMetrics"],
  ): number {
    const weights = {
      performance: 0.4,
      adherence: 0.3,
      recovery: 0.2,
      satisfaction: 0.1,
    };

    return Math.round(
      outcome.performanceChange * weights.performance +
        outcome.adherenceChange * weights.adherence +
        outcome.recoveryChange * weights.recovery +
        outcome.satisfactionChange * weights.satisfaction,
    );
  }

  private updateEffectivenessTrends(
    profile: MethodologyResponseProfile,
    modification: MethodologyPlanModification,
    effectiveness: number,
  ): void {
    const trend = profile.effectivenessTrends;
    const alpha = 0.3; // Learning rate

    switch (modification.type) {
      case "reduce_volume":
        trend.volumeChanges =
          trend.volumeChanges * (1 - alpha) + effectiveness * alpha;
        break;
      case "reduce_intensity":
        trend.intensityChanges =
          trend.intensityChanges * (1 - alpha) + effectiveness * alpha;
        break;
      case "add_recovery":
        trend.recoveryChanges =
          trend.recoveryChanges * (1 - alpha) + effectiveness * alpha;
        break;
      case "substitute_workout":
        trend.workoutTypeChanges =
          trend.workoutTypeChanges * (1 - alpha) + effectiveness * alpha;
        break;
    }
  }

  private updateModificationPreferences(
    profile: MethodologyResponseProfile,
    modification: MethodologyPlanModification,
    effectiveness: number,
  ): void {
    if (effectiveness > 75) {
      // Add to preferred if not already there
      const exists = profile.preferredModifications.some(
        (pref) =>
          pref.type === modification.type &&
          pref.philosophyPrinciple === modification.philosophyPrinciple,
      );
      if (!exists) {
        profile.preferredModifications.push(modification);
      }
    } else if (effectiveness < 40) {
      // Add to avoided if not already there
      const exists = profile.avoidedModifications.some(
        (avoid) =>
          avoid.type === modification.type &&
          avoid.philosophyPrinciple === modification.philosophyPrinciple,
      );
      if (!exists) {
        profile.avoidedModifications.push(modification);
      }
    }
  }

  private getResponseProfileStatus(methodology: TrainingMethodology): string {
    // Simplified status calculation
    return "learning"; // Could be 'new', 'learning', 'established'
  }
}

/**
 * Extended methodology insights
 */
export interface MethodologyInsights {
  methodology: TrainingMethodology;
  philosophyAlignment: number; // 0-100, how well training aligns with methodology
  adaptationRecommendations: string[];
  responseProfileStatus: string; // 'new', 'learning', 'established', 'no_methodology'
  keyMetrics?: Record<string, number>;
  complianceScore?: number;
}

/**
 * Utility functions for methodology adaptation
 */
export const MethodologyAdaptationUtils = {
  /**
   * Create methodology adaptation engine instance
   */
  createEngine: (): MethodologyAdaptationEngine => {
    return new MethodologyAdaptationEngine();
  },

  /**
   * Analyze methodology-specific adaptation needs
   */
  analyzeAdaptationNeeds: (
    plan: TrainingPlan,
    completedWorkouts: CompletedWorkout[],
    methodology: TrainingMethodology,
  ): MethodologyInsights => {
    const engine = new MethodologyAdaptationEngine();
    const plannedWorkouts = plan.workouts;
    const result = engine.analyzeProgressWithMethodology(
      completedWorkouts,
      plannedWorkouts,
      plan,
    );
    return result.methodologyInsights;
  },

  /**
   * Get methodology-specific modification suggestions
   */
  getModificationSuggestions: (
    plan: TrainingPlan,
    progress: ProgressData,
    methodology: TrainingMethodology,
  ): MethodologyPlanModification[] => {
    const engine = new MethodologyAdaptationEngine();
    return engine.suggestMethodologyAwareModifications(plan, progress);
  },
};
