/**
 * Environmental and Constraint Adaptation System
 *
 * Comprehensive system for adapting training plans based on environmental factors,
 * equipment constraints, injury history, and time limitations while maintaining
 * methodology integrity.
 *
 * Leverages existing environmental factors system and injury risk assessment.
 */

import {
  TrainingPlan,
  PlannedWorkout,
  CompletedWorkout,
  EnvironmentalFactors,
  TrainingMethodology,
  FitnessAssessment,
} from "./types";
import { PlanModification } from "./adaptation";
import { getHighestSeverity, RiskSeverity } from "./types/methodology-types";
import {
  calculateInjuryRisk,
  calculateTrainingLoad,
  calculateRecoveryScore,
} from "./calculator";

// Enhanced environmental factor interfaces
export interface DetailedEnvironmentalFactors extends EnvironmentalFactors {
  windSpeed?: number; // km/h
  precipitation?: number; // mm
  airQuality?: "good" | "moderate" | "poor" | "hazardous";
  daylightHours?: number;
  seasonalFactors?: {
    pollen?: "low" | "moderate" | "high";
    extremeWeather?: boolean;
  };
}

export interface EquipmentConstraints {
  availableSurfaces: ("road" | "track" | "trail" | "treadmill")[];
  hasGym?: boolean;
  hasPool?: boolean;
  weatherGear: {
    coldWeather: boolean;
    rainGear: boolean;
    windResistant: boolean;
  };
  safetyEquipment: {
    reflectiveGear: boolean;
    lights: boolean;
    emergencyDevice: boolean;
  };
}

export interface TimeConstraints {
  weeklyAvailableHours: number;
  dailyTimeSlots: {
    morning?: number; // minutes
    afternoon?: number;
    evening?: number;
  };
  preferredWorkoutDuration: {
    min: number;
    max: number;
    optimal: number;
  };
  flexibilityLevel: "rigid" | "moderate" | "flexible";
  consistentSchedule: boolean;
}

export interface InjuryConstraints {
  currentInjuries: InjuryStatus[];
  injuryHistory: string[];
  painAreas: BodyRegion[];
  riskFactors: RiskFactor[];
  recoveryProtocols: RecoveryProtocol[];
}

export interface InjuryStatus {
  type: string;
  severity: "minor" | "moderate" | "severe";
  stage: "acute" | "healing" | "chronic";
  restrictions: string[];
  expectedRecovery: number; // weeks
}

export interface BodyRegion {
  area:
    | "knee"
    | "ankle"
    | "hip"
    | "back"
    | "foot"
    | "calf"
    | "hamstring"
    | "quad"
    | "IT_band";
  painLevel: number; // 1-10
  functionalLimitation: string[];
}

export interface RiskFactor {
  type:
    | "biomechanical"
    | "training_load"
    | "environmental"
    | "equipment"
    | "lifestyle";
  description: string;
  severity: "low" | "moderate" | "high";
  mitigationStrategies: string[];
}

export interface RecoveryProtocol {
  type: "rest" | "active_recovery" | "therapy" | "cross_training";
  frequency: string;
  duration: string;
  effectiveness: number; // 1-100
}

export interface AdaptationResult {
  modifications: PlanModification[];
  constraints: AdaptationConstraints;
  recommendations: AdaptationRecommendation[];
  riskAssessment: RiskAssessment;
  effectiveness: number; // predicted effectiveness 1-100
}

export interface AdaptationConstraints {
  environmental: EnvironmentalConstraint[];
  equipment: EquipmentConstraint[];
  time: TimeConstraint[];
  injury: InjuryConstraint[];
}

export interface EnvironmentalConstraint {
  factor: string;
  limitation: string;
  workaround: string;
  impact: "minimal" | "moderate" | "significant";
}

export interface EquipmentConstraint {
  missing: string;
  substitute: string;
  effectiveness: number; // compared to ideal
}

export interface TimeConstraint {
  shortfall: number; // minutes per week
  compression: CompressionStrategy;
  prioritization: WorkoutPriority[];
}

export interface InjuryConstraint {
  restriction: string;
  alternative: string;
  monitoringRequired: boolean;
}

export interface CompressionStrategy {
  approach:
    | "intensity_focus"
    | "volume_reduction"
    | "session_combination"
    | "key_workout_only";
  retainedEffectiveness: number; // percentage
  recommendations: string[];
}

export interface WorkoutPriority {
  workoutType: string;
  importance: number; // 1-10
  reason: string;
}

export interface AdaptationRecommendation {
  category:
    | "environmental"
    | "equipment"
    | "scheduling"
    | "injury_prevention"
    | "methodology";
  priority: "low" | "medium" | "high" | "critical";
  recommendation: string;
  implementation: string;
  expectedBenefit: string;
  timeToEffect: number; // weeks
}

export interface RiskAssessment {
  overallRisk: "low" | "moderate" | "high" | "critical";
  specificRisks: SpecificRisk[];
  mitigationRequired: boolean;
  monitoringPoints: string[];
}

export interface SpecificRisk {
  type: "injury" | "overtraining" | "environmental" | "adherence";
  probability: number; // 1-100
  severity: "low" | "moderate" | "high";
  factors: string[];
}

/**
 * Comprehensive Environmental and Constraint Adaptation Engine
 */
export class EnvironmentalConstraintAdapter {
  private readonly ALTITUDE_THRESHOLDS = {
    LOW: 1500,
    MODERATE: 2500,
    HIGH: 3500,
    EXTREME: 4500,
  };

  private readonly TEMPERATURE_THRESHOLDS = {
    COLD: 0,
    COOL: 10,
    MODERATE: 20,
    WARM: 25,
    HOT: 30,
    EXTREME: 35,
  };

  /**
   * Primary adaptation method - analyzes all constraints and creates comprehensive adaptations
   */
  public adaptPlan(
    plan: TrainingPlan,
    methodology: TrainingMethodology,
    environmental: DetailedEnvironmentalFactors,
    equipment: EquipmentConstraints,
    time: TimeConstraints,
    injury: InjuryConstraints,
    completedWorkouts: CompletedWorkout[] = [],
  ): AdaptationResult {
    // Analyze current state and constraints
    const environmentalAdaptations = this.createEnvironmentalAdaptations(
      plan,
      methodology,
      environmental,
    );

    const equipmentAdaptations = this.createEquipmentAdaptations(
      plan,
      methodology,
      equipment,
    );

    const timeAdaptations = this.createTimeConstraintAdaptations(
      plan,
      methodology,
      time,
    );

    const injuryAdaptations = this.createInjuryAdaptations(
      plan,
      methodology,
      injury,
      completedWorkouts,
    );

    // Combine all modifications
    const allModifications = [
      ...environmentalAdaptations.modifications,
      ...equipmentAdaptations.modifications,
      ...timeAdaptations.modifications,
      ...injuryAdaptations.modifications,
    ];

    // Resolve conflicts between adaptations
    const resolvedModifications = this.resolveAdaptationConflicts(
      allModifications,
      methodology,
    );

    // Create comprehensive constraints documentation
    const constraints: AdaptationConstraints = {
      environmental: environmentalAdaptations.constraints,
      equipment: equipmentAdaptations.constraints,
      time: timeAdaptations.constraints,
      injury: injuryAdaptations.constraints,
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      environmental,
      equipment,
      time,
      injury,
      methodology,
    );

    // Assess overall risk
    const riskAssessment = this.assessAdaptationRisk(
      plan,
      resolvedModifications,
      injury,
      completedWorkouts,
    );

    // Calculate predicted effectiveness
    const effectiveness = this.calculateAdaptationEffectiveness(
      resolvedModifications,
      constraints,
      methodology,
    );

    return {
      modifications: resolvedModifications,
      constraints,
      recommendations,
      riskAssessment,
      effectiveness,
    };
  }

  /**
   * Environmental adaptations - enhanced beyond basic implementation
   */
  private createEnvironmentalAdaptations(
    plan: TrainingPlan,
    methodology: TrainingMethodology,
    environmental: DetailedEnvironmentalFactors,
  ): {
    modifications: PlanModification[];
    constraints: EnvironmentalConstraint[];
  } {
    const modifications: PlanModification[] = [];
    const constraints: EnvironmentalConstraint[] = [];

    // Altitude adaptations
    if (
      environmental.altitude &&
      environmental.altitude > this.ALTITUDE_THRESHOLDS.LOW
    ) {
      const altitudeAdaptations = this.createAltitudeAdaptations(
        environmental.altitude,
        methodology,
      );
      modifications.push(...altitudeAdaptations.modifications);
      constraints.push(...altitudeAdaptations.constraints);
    }

    // Temperature adaptations
    if (environmental.typicalTemperature !== undefined) {
      const tempAdaptations = this.createTemperatureAdaptations(
        environmental.typicalTemperature,
        environmental.humidity || 50,
        methodology,
      );
      modifications.push(...tempAdaptations.modifications);
      constraints.push(...tempAdaptations.constraints);
    }

    // Terrain adaptations
    const terrainAdaptations = this.createTerrainAdaptations(
      environmental.terrain,
      methodology,
    );
    modifications.push(...terrainAdaptations.modifications);
    constraints.push(...terrainAdaptations.constraints);

    // Weather-specific adaptations
    if (
      environmental.windSpeed ||
      environmental.precipitation ||
      environmental.airQuality
    ) {
      const weatherAdaptations = this.createWeatherAdaptations(
        environmental,
        methodology,
      );
      modifications.push(...weatherAdaptations.modifications);
      constraints.push(...weatherAdaptations.constraints);
    }

    return { modifications, constraints };
  }

  /**
   * Enhanced altitude adaptation system
   */
  private createAltitudeAdaptations(
    altitude: number,
    methodology: TrainingMethodology,
  ): {
    modifications: PlanModification[];
    constraints: EnvironmentalConstraint[];
  } {
    const modifications: PlanModification[] = [];
    const constraints: EnvironmentalConstraint[] = [];

    const altitudeLevel = this.getAltitudeLevel(altitude);

    // Base intensity reduction
    const intensityReduction =
      this.calculateAltitudeIntensityReduction(altitude);
    modifications.push({
      type: "reduce_intensity",
      reason: `Altitude adaptation at ${altitude}m (${altitudeLevel} altitude)`,
      priority: "high",
      suggestedChanges: {
        intensityReduction,
        ...(altitude > this.ALTITUDE_THRESHOLDS.HIGH
          ? ({ phaseAdjustment: "extend_base" } as any)
          : {}),
      },
    });

    // Acclimatization period
    const acclimatizationWeeks = Math.ceil(altitude / 1000);
    modifications.push({
      type: "delay_progression",
      reason: `Altitude acclimatization period required`,
      priority: "medium",
      suggestedChanges: {
        delayDays: Math.min(acclimatizationWeeks, 4) * 7,
        ...({
          extendPhase: "base",
          extensionWeeks: Math.min(acclimatizationWeeks, 4),
        } as any),
      },
    });

    // Methodology-specific altitude adaptations
    if (methodology === "daniels") {
      // VDOT calculations need adjustment at altitude
      modifications.push({
        type: "reduce_intensity",
        reason: "VDOT calculations require altitude correction",
        priority: "high",
        suggestedChanges: {
          intensityReduction: Math.floor(altitude / 300),
          ...({ vdotAdjustment: -Math.floor(altitude / 300) } as any),
        },
      });
    } else if (methodology === "lydiard") {
      // Extend aerobic base phase more at altitude
      modifications.push({
        type: "delay_progression",
        reason: "Lydiard aerobic base requires longer adaptation at altitude",
        priority: "medium",
        suggestedChanges: {
          delayDays: Math.min(Math.ceil(altitude / 800), 6) * 7,
          ...({
            extendPhase: "base",
            extensionWeeks: Math.min(Math.ceil(altitude / 800), 6),
          } as any),
        },
      });
    }

    // Document constraints
    constraints.push({
      factor: "altitude",
      limitation: `Reduced oxygen availability at ${altitude}m`,
      workaround: `${intensityReduction}% intensity reduction with ${acclimatizationWeeks}-week adaptation`,
      impact:
        altitude > this.ALTITUDE_THRESHOLDS.HIGH ? "significant" : "moderate",
    });

    return { modifications, constraints };
  }

  /**
   * Enhanced temperature adaptation system
   */
  private createTemperatureAdaptations(
    temperature: number,
    humidity: number,
    methodology: TrainingMethodology,
  ): {
    modifications: PlanModification[];
    constraints: EnvironmentalConstraint[];
  } {
    const modifications: PlanModification[] = [];
    const constraints: EnvironmentalConstraint[] = [];

    const heatIndex = this.calculateHeatIndex(temperature, humidity);

    // Cold weather adaptations
    if (temperature < this.TEMPERATURE_THRESHOLDS.COLD) {
      modifications.push({
        type: "substitute_workout",
        reason: `Cold weather adaptations for ${temperature}°C`,
        priority: "medium",
        suggestedChanges: {
          substituteWorkoutType: "easy",
          ...({
            warmupExtension: 15,
            indoorAlternatives: true,
            layeringRecommendations: true,
          } as any),
        },
      });

      constraints.push({
        factor: "cold_temperature",
        limitation: `Increased injury risk and longer warmup required at ${temperature}°C`,
        workaround: "Extended warmup, layered clothing, indoor alternatives",
        impact: "moderate",
      });
    }

    // Hot weather adaptations
    if (temperature > this.TEMPERATURE_THRESHOLDS.HOT || heatIndex > 32) {
      const intensityReduction =
        this.calculateHeatIntensityReduction(heatIndex);

      modifications.push({
        type: "reduce_intensity",
        reason: `Heat stress management (Heat Index: ${heatIndex}°C)`,
        priority: "high",
        suggestedChanges: {
          intensityReduction,
          ...({
            hydrationIncrease: Math.min(50, (heatIndex - 25) * 2),
            timingAdjustment: "early_morning_or_evening",
          } as any),
        },
      });

      modifications.push({
        type: "substitute_workout",
        reason: "Heat avoidance scheduling",
        priority: "high",
        suggestedChanges: {
          substituteWorkoutType: "easy",
          ...({
            avoidTimeWindows: ["10:00-16:00"],
            preferredTimes: ["05:00-08:00", "19:00-21:00"],
          } as any),
        },
      });

      constraints.push({
        factor: "heat_index",
        limitation: `Dangerous heat conditions (${heatIndex}°C heat index)`,
        workaround: `${intensityReduction}% intensity reduction, timing shifts, increased hydration`,
        impact: heatIndex > 40 ? "significant" : "moderate",
      });
    }

    // High humidity specific adaptations
    if (humidity > 80) {
      modifications.push({
        type: "reduce_intensity",
        reason: `High humidity (${humidity}%) pace adjustments`,
        priority: "medium",
        suggestedChanges: {
          intensityReduction: Math.ceil((humidity - 60) / 10) * 2,
          ...({
            paceSlowing: Math.ceil((humidity - 60) / 10) * 5,
            recoveryExtension: 20,
          } as any),
        },
      });
    }

    return { modifications, constraints };
  }

  /**
   * Enhanced terrain adaptation system
   */
  private createTerrainAdaptations(
    terrain: string,
    methodology: TrainingMethodology,
  ): {
    modifications: PlanModification[];
    constraints: EnvironmentalConstraint[];
  } {
    const modifications: PlanModification[] = [];
    const constraints: EnvironmentalConstraint[] = [];

    switch (terrain) {
      case "hilly":
        modifications.push({
          type: "substitute_workout",
          reason: "Hill terrain integration",
          priority: "medium",
          suggestedChanges: {
            substituteWorkoutType: "hill_repeats",
            ...({ frequency: "weekly", intensityAdjustment: 5 } as any),
          },
        });

        if (methodology === "lydiard") {
          modifications.push({
            type: "delay_progression",
            reason: "Lydiard hill phase optimization for natural terrain",
            priority: "low",
            suggestedChanges: {
              delayDays: 7,
              ...({
                enhancePhase: "hill",
                naturalHillIntegration: true,
              } as any),
            },
          });
        }

        constraints.push({
          factor: "hilly_terrain",
          limitation: "Increased workload and impact stress",
          workaround: "Natural hill training integration, adjusted pacing",
          impact: "moderate",
        });
        break;

      case "trail":
        modifications.push({
          type: "reduce_intensity",
          reason: "Trail running adaptations",
          priority: "medium",
          suggestedChanges: {
            intensityReduction: 10,
            ...({
              paceAdjustment: -10,
              stabilityFocus: true,
              technicalSkillDevelopment: true,
            } as any),
          },
        });

        constraints.push({
          factor: "trail_surface",
          limitation: "Variable footing, slower paces, navigation requirements",
          workaround: "Adjusted pacing expectations, stability training",
          impact: "moderate",
        });
        break;
    }

    return { modifications, constraints };
  }

  /**
   * Weather-specific adaptations (wind, precipitation, air quality)
   */
  private createWeatherAdaptations(
    environmental: DetailedEnvironmentalFactors,
    methodology: TrainingMethodology,
  ): {
    modifications: PlanModification[];
    constraints: EnvironmentalConstraint[];
  } {
    const modifications: PlanModification[] = [];
    const constraints: EnvironmentalConstraint[] = [];

    // Wind adaptations
    if (environmental.windSpeed && environmental.windSpeed > 20) {
      modifications.push({
        type: "substitute_workout",
        reason: `High wind speeds (${environmental.windSpeed} km/h)`,
        priority: "medium",
        suggestedChanges: {
          substituteWorkoutType: "easy",
          ...({
            windProtection: true,
            routeModification: "sheltered_areas",
            paceVariability: 15,
          } as any),
        },
      });

      constraints.push({
        factor: "wind_speed",
        limitation: `Challenging conditions at ${environmental.windSpeed} km/h`,
        workaround: "Sheltered routes, pace adjustments, safety considerations",
        impact: environmental.windSpeed > 40 ? "significant" : "moderate",
      });
    }

    // Precipitation adaptations
    if (environmental.precipitation && environmental.precipitation > 5) {
      modifications.push({
        type: "substitute_workout",
        reason: `Heavy precipitation (${environmental.precipitation}mm)`,
        priority: "high",
        suggestedChanges: {
          substituteWorkoutType: "easy",
          ...({
            indoorAlternatives: true,
            safetyEquipment: ["reflective_gear", "traction_devices"],
            routeModification: "well_lit_safe_areas",
          } as any),
        },
      });

      constraints.push({
        factor: "precipitation",
        limitation: `Safety and traction concerns with ${environmental.precipitation}mm precipitation`,
        workaround:
          "Indoor alternatives, safety equipment, route modifications",
        impact: environmental.precipitation > 20 ? "significant" : "moderate",
      });
    }

    // Air quality adaptations
    if (
      environmental.airQuality &&
      ["poor", "hazardous"].includes(environmental.airQuality)
    ) {
      modifications.push({
        type: "reduce_intensity",
        reason: `Poor air quality (${environmental.airQuality})`,
        priority: "high",
        suggestedChanges: {
          intensityReduction:
            environmental.airQuality === "hazardous" ? 50 : 25,
          ...({
            indoorAlternatives: true,
            timingAdjustment: "early_morning",
          } as any), // when air quality often better
        },
      });

      constraints.push({
        factor: "air_quality",
        limitation: `Health risks from ${environmental.airQuality} air quality`,
        workaround: "Intensity reduction, indoor training, timing optimization",
        impact:
          environmental.airQuality === "hazardous" ? "significant" : "moderate",
      });
    }

    return { modifications, constraints };
  }

  /**
   * Equipment constraint adaptations
   */
  private createEquipmentAdaptations(
    plan: TrainingPlan,
    methodology: TrainingMethodology,
    equipment: EquipmentConstraints,
  ): { modifications: PlanModification[]; constraints: EquipmentConstraint[] } {
    const modifications: PlanModification[] = [];
    const constraints: EquipmentConstraint[] = [];

    // Surface availability adaptations
    if (!equipment.availableSurfaces.includes("track")) {
      modifications.push({
        type: "substitute_workout",
        reason: "No track access - adapt interval workouts",
        priority: "medium",
        suggestedChanges: {
          substituteWorkoutType: "vo2max",
          ...({
            distanceAdjustment: "time_based_vs_distance",
            landmarkNavigation: true,
          } as any),
        },
      });

      constraints.push({
        missing: "running_track",
        substitute: "road_intervals_with_timing",
        effectiveness: 85,
      });
    }

    // Gym access impacts
    if (!equipment.hasGym) {
      modifications.push({
        type: "substitute_workout",
        reason: "No gym access - bodyweight alternatives",
        priority: "low",
        suggestedChanges: {
          substituteWorkoutType: "strength",
          ...({
            bodyweightAlternatives: true,
            outdoorStrengthOptions: true,
            equipmentFreeWorkouts: true,
          } as any),
        },
      });

      constraints.push({
        missing: "gym_access",
        substitute: "bodyweight_and_outdoor_strength",
        effectiveness: 70,
      });
    }

    // Pool access for cross-training
    if (!equipment.hasPool && methodology === "lydiard") {
      // Lydiard often recommends pool running for recovery
      modifications.push({
        type: "substitute_workout",
        reason: "No pool access - alternative recovery methods",
        priority: "low",
        suggestedChanges: {
          substituteWorkoutType: "cross_training",
          ...({
            alternativeRecovery: ["walking", "cycling", "yoga"],
            activeRecoveryFocus: true,
          } as any),
        },
      });

      constraints.push({
        missing: "pool_access",
        substitute: "land_based_recovery_activities",
        effectiveness: 80,
      });
    }

    // Weather gear limitations
    if (!equipment.weatherGear.coldWeather || !equipment.weatherGear.rainGear) {
      modifications.push({
        type: "delay_progression",
        reason: "Limited weather gear requires seasonal adaptations",
        priority: "medium",
        suggestedChanges: {
          delayDays: 7,
          ...({
            indoorSeasonalOptions: true,
            weatherWindowOptimization: true,
            gearInvestmentPlan: true,
          } as any),
        },
      });

      constraints.push({
        missing: "weather_appropriate_gear",
        substitute: "indoor_alternatives_and_weather_timing",
        effectiveness: 75,
      });
    }

    // Safety equipment considerations
    if (
      !equipment.safetyEquipment.lights &&
      !equipment.safetyEquipment.reflectiveGear
    ) {
      modifications.push({
        type: "substitute_workout",
        reason: "Safety equipment limitations restrict dawn/dusk running",
        priority: "high",
        suggestedChanges: {
          substituteWorkoutType: "easy",
          ...({
            daylightOnlyRunning: true,
            routeRestrictions: "well_lit_areas_only",
            safetyPriorityInvestment: true,
          } as any),
        },
      });

      constraints.push({
        missing: "safety_equipment",
        substitute: "daylight_and_well_lit_area_restrictions",
        effectiveness: 60,
      });
    }

    return { modifications, constraints };
  }

  /**
   * Time constraint adaptations - comprehensive time optimization
   */
  private createTimeConstraintAdaptations(
    plan: TrainingPlan,
    methodology: TrainingMethodology,
    time: TimeConstraints,
  ): { modifications: PlanModification[]; constraints: TimeConstraint[] } {
    const modifications: PlanModification[] = [];
    const constraints: TimeConstraint[] = [];

    // Calculate weekly time deficit/surplus
    const plannedWeeklyMinutes = this.calculatePlannedWeeklyTime(plan);
    const timeDeficit = Math.max(
      0,
      plannedWeeklyMinutes - time.weeklyAvailableHours * 60,
    );

    if (timeDeficit > 0) {
      const compressionStrategy = this.createTimeCompressionStrategy(
        timeDeficit,
        methodology,
        time,
      );

      modifications.push({
        type: "reduce_volume",
        reason: `Time deficit of ${Math.round(timeDeficit / 60)} hours per week`,
        priority: "high",
        suggestedChanges: {
          volumeReduction: Math.min(
            50,
            (timeDeficit / plannedWeeklyMinutes) * 100,
          ),
          ...({
            compressionApproach: compressionStrategy.approach,
            retainedEffectiveness: compressionStrategy.retainedEffectiveness,
            prioritizedWorkouts: compressionStrategy.recommendations,
          } as any),
        },
      });

      constraints.push({
        shortfall: timeDeficit,
        compression: compressionStrategy,
        prioritization: this.createWorkoutPriorities(methodology),
      });
    } else if (time.weeklyAvailableHours < 8) {
      // Even if no deficit, document time limitations for future reference
      const compressionStrategy = this.createTimeCompressionStrategy(
        60,
        methodology,
        time, // Minimal deficit for strategy creation
      );

      constraints.push({
        shortfall: 0,
        compression: compressionStrategy,
        prioritization: this.createWorkoutPriorities(methodology),
      });
    }

    // Daily time slot optimizations
    const slotOptimizations = this.optimizeDailyTimeSlots(time, methodology);
    if (slotOptimizations.modifications.length > 0) {
      modifications.push(...slotOptimizations.modifications);
    }

    // Workout duration optimizations
    if (time.preferredWorkoutDuration.max < 90) {
      // Most training plans assume longer workouts are possible
      modifications.push({
        type: "reduce_volume",
        reason: `Workout duration limited to ${time.preferredWorkoutDuration.max} minutes`,
        priority: "medium",
        suggestedChanges: {
          volumeReduction: 15,
          ...({
            splitLongRuns: true,
            doubleRunDays: time.flexibilityLevel === "flexible",
            intensityCompensation: 10,
          } as any), // % higher intensity for shorter sessions
        },
      });
    }

    return { modifications, constraints };
  }

  /**
   * Enhanced injury adaptation system
   */
  private createInjuryAdaptations(
    plan: TrainingPlan,
    methodology: TrainingMethodology,
    injury: InjuryConstraints,
    completedWorkouts: CompletedWorkout[],
  ): { modifications: PlanModification[]; constraints: InjuryConstraint[] } {
    const modifications: PlanModification[] = [];
    const constraints: InjuryConstraint[] = [];

    // Current injury adaptations
    injury.currentInjuries.forEach((currentInjury) => {
      const injuryMods = this.createCurrentInjuryAdaptations(
        currentInjury,
        methodology,
      );
      modifications.push(...injuryMods.modifications);
      constraints.push(...injuryMods.constraints);
    });

    // Historical injury prevention
    injury.injuryHistory.forEach((pastInjury) => {
      const preventionMods = this.createInjuryPreventionAdaptations(
        pastInjury,
        methodology,
      );
      modifications.push(...preventionMods.modifications);
      constraints.push(...preventionMods.constraints);
    });

    // Risk factor mitigation
    injury.riskFactors.forEach((riskFactor) => {
      const riskMods = this.createRiskFactorAdaptations(
        riskFactor,
        methodology,
      );
      modifications.push(...riskMods.modifications);
    });

    // Dynamic injury risk assessment using existing calculator
    if (completedWorkouts.length > 0) {
      const riskAssessment = this.assessDynamicInjuryRisk(
        completedWorkouts,
        plan,
      );
      if (riskAssessment.risk > 70) {
        // High risk threshold
        modifications.push({
          type: "injury_protocol",
          reason: `High dynamic injury risk detected (${riskAssessment.risk}%)`,
          priority: "high",
          suggestedChanges: {
            volumeReduction: 20,
            additionalRecoveryDays: 2,
            ...({ recoveryIncrease: 30, monitoringIncrease: true } as any),
          },
        });
      }
    }

    return { modifications, constraints };
  }

  // Helper methods for calculations and utilities

  private getAltitudeLevel(altitude: number): string {
    if (altitude < this.ALTITUDE_THRESHOLDS.LOW) return "sea_level";
    if (altitude < this.ALTITUDE_THRESHOLDS.MODERATE) return "low";
    if (altitude < this.ALTITUDE_THRESHOLDS.HIGH) return "moderate";
    if (altitude < this.ALTITUDE_THRESHOLDS.EXTREME) return "high";
    return "extreme";
  }

  private calculateAltitudeIntensityReduction(altitude: number): number {
    if (altitude < this.ALTITUDE_THRESHOLDS.LOW) return 0;

    // Base reduction + additional for each 500m above threshold
    const baseReduction = 10;
    const additionalReduction =
      Math.floor((altitude - this.ALTITUDE_THRESHOLDS.LOW) / 500) * 5;

    return Math.min(baseReduction + additionalReduction, 40); // Cap at 40%
  }

  private calculateHeatIndex(temperature: number, humidity: number): number {
    // Simplified heat index calculation
    if (temperature < 27) return temperature;

    const c1 = -8.78469475556;
    const c2 = 1.61139411;
    const c3 = 2.33854883889;
    const c4 = -0.14611605;
    const c5 = -0.012308094;
    const c6 = -0.0164248277778;
    const c7 = 0.002211732;
    const c8 = 0.00072546;
    const c9 = -0.000003582;

    const T = temperature;
    const H = humidity;

    return (
      c1 +
      c2 * T +
      c3 * H +
      c4 * T * H +
      c5 * T * T +
      c6 * H * H +
      c7 * T * T * H +
      c8 * T * H * H +
      c9 * T * T * H * H
    );
  }

  private calculateHeatIntensityReduction(heatIndex: number): number {
    if (heatIndex < 27) return 0;
    if (heatIndex < 32) return 5;
    if (heatIndex < 38) return 15;
    if (heatIndex < 46) return 30;
    return 50; // Extreme heat
  }

  private calculatePlannedWeeklyTime(plan: TrainingPlan): number {
    // Simplified calculation - would analyze actual workouts in real implementation
    return plan.summary?.totalTime
      ? plan.summary.totalTime / plan.summary.totalWeeks
      : 300; // Default 5 hours
  }

  private createTimeCompressionStrategy(
    timeDeficit: number,
    methodology: TrainingMethodology,
    time: TimeConstraints,
  ): CompressionStrategy {
    const deficitHours = timeDeficit / 60;

    if (deficitHours < 1.5) {
      return {
        approach: "intensity_focus",
        retainedEffectiveness: 87,
        recommendations: [
          "Increase workout intensity by 10%",
          "Reduce easy run duration",
          "Maintain key workouts",
        ],
      };
    } else if (deficitHours < 3) {
      return {
        approach: "volume_reduction",
        retainedEffectiveness: 75,
        recommendations: [
          "Reduce weekly volume by 20%",
          "Maintain workout quality",
          "Focus on key sessions",
        ],
      };
    } else if (deficitHours < 3.0) {
      return {
        approach: "session_combination",
        retainedEffectiveness: 65,
        recommendations: [
          "Combine easy runs with warmup/cooldown",
          "Double runs on available days",
          "Multi-purpose sessions",
        ],
      };
    } else {
      return {
        approach: "key_workout_only",
        retainedEffectiveness: 50,
        recommendations: [
          "Focus only on key workouts",
          "Minimal maintenance volume",
          "Cross-training substitution",
        ],
      };
    }
  }

  private createWorkoutPriorities(
    methodology: TrainingMethodology,
  ): WorkoutPriority[] {
    const basePriorities = [
      {
        workoutType: "long_run",
        importance: 9,
        reason: "Aerobic base development",
      },
      {
        workoutType: "tempo",
        importance: 8,
        reason: "Lactate threshold development",
      },
      { workoutType: "intervals", importance: 7, reason: "VO2max development" },
      {
        workoutType: "easy",
        importance: 6,
        reason: "Recovery and aerobic maintenance",
      },
    ];

    // Methodology-specific adjustments
    if (methodology === "lydiard") {
      basePriorities.find((p) => p.workoutType === "long_run")!.importance = 10;
      basePriorities.find((p) => p.workoutType === "easy")!.importance = 8;
    } else if (methodology === "pfitzinger") {
      basePriorities.find((p) => p.workoutType === "tempo")!.importance = 9;
      basePriorities.push({
        workoutType: "medium_long",
        importance: 8,
        reason: "Pfitzinger signature workout",
      });
    }

    return basePriorities.sort((a, b) => b.importance - a.importance);
  }

  private optimizeDailyTimeSlots(
    time: TimeConstraints,
    methodology: TrainingMethodology,
  ): { modifications: PlanModification[] } {
    const modifications: PlanModification[] = [];

    // Morning slot optimization
    if (time.dailyTimeSlots.morning && time.dailyTimeSlots.morning < 45) {
      modifications.push({
        type: "substitute_workout",
        reason: `Limited morning time slot (${time.dailyTimeSlots.morning} minutes)`,
        priority: "medium",
        suggestedChanges: {
          substituteWorkoutType: "recovery",
          ...({
            morningWorkoutTypes: ["easy_short", "recovery"],
            qualityWorkoutsToOtherSlots: true,
          } as any),
        },
      });
    }

    return { modifications };
  }

  private createCurrentInjuryAdaptations(
    injury: InjuryStatus,
    methodology: TrainingMethodology,
  ): { modifications: PlanModification[]; constraints: InjuryConstraint[] } {
    const modifications: PlanModification[] = [];
    const constraints: InjuryConstraint[] = [];

    const volumeReduction = this.calculateInjuryVolumeReduction(
      injury.severity,
      injury.stage,
    );

    modifications.push({
      type: "injury_protocol",
      reason: `Current ${injury.severity} ${injury.type} in ${injury.stage} stage`,
      priority: "high",
      suggestedChanges: {
        volumeReduction,
        ...({
          avoidActivities: injury.restrictions,
          alternativeActivities: this.getInjuryAlternatives(injury.type),
          monitoringRequired: true,
        } as any),
      },
    });

    constraints.push({
      restriction: `${injury.type} restrictions during ${injury.stage} phase`,
      alternative: this.getInjuryAlternatives(injury.type).join(", "),
      monitoringRequired: true,
    });

    return { modifications, constraints };
  }

  private createInjuryPreventionAdaptations(
    injuryHistory: string,
    methodology: TrainingMethodology,
  ): { modifications: PlanModification[]; constraints: InjuryConstraint[] } {
    const modifications: PlanModification[] = [];
    const constraints: InjuryConstraint[] = [];

    const preventionStrategy = this.getInjuryPreventionStrategy(injuryHistory);

    modifications.push({
      type: "injury_protocol",
      reason: `Prevention strategy for history of ${injuryHistory}`,
      priority: "medium",
      suggestedChanges: {
        ...(preventionStrategy as any),
      },
    });

    constraints.push({
      restriction: `Preventive measures for ${injuryHistory} history`,
      alternative:
        preventionStrategy.primaryPrevention || "standard_prevention",
      monitoringRequired: true,
    });

    return { modifications, constraints };
  }

  private createRiskFactorAdaptations(
    riskFactor: RiskFactor,
    methodology: TrainingMethodology,
  ): { modifications: PlanModification[] } {
    const modifications: PlanModification[] = [];

    modifications.push({
      type: "injury_protocol",
      reason: `${riskFactor.severity} ${riskFactor.type} risk factor`,
      priority: riskFactor.severity === "high" ? "high" : "medium",
      suggestedChanges: {
        volumeReduction: 10,
        ...({
          mitigationStrategies: riskFactor.mitigationStrategies,
          monitoring: true,
        } as any),
      },
    });

    return { modifications };
  }

  private assessDynamicInjuryRisk(
    completedWorkouts: CompletedWorkout[],
    plan: TrainingPlan,
  ): { risk: number; factors: string[] } {
    // Use existing injury risk calculation
    if (completedWorkouts.length < 2) return { risk: 0, factors: [] };

    const recent = completedWorkouts.slice(-10);

    // Convert CompletedWorkout to RunData format
    const runData = recent.map((workout) => ({
      date: workout.date,
      distance: workout.actualDistance || 0,
      duration: workout.actualDuration || 0,
      pace: workout.actualPace || 300, // Default pace if not available
      heartRate: {
        average: workout.avgHeartRate || 150,
        max: workout.maxHeartRate || 180,
      },
    }));

    const trainingLoad = calculateTrainingLoad(runData, 300); // Default threshold pace
    const recoveryScore = calculateRecoveryScore(runData);

    // Calculate weekly load increase
    const recentLoad =
      recent.slice(-3).reduce((sum, w) => sum + (w.actualDuration || 0), 0) / 3;
    const priorLoad =
      recent
        .slice(-6, -3)
        .reduce((sum, w) => sum + (w.actualDuration || 0), 0) / 3;
    const weeklyIncrease =
      priorLoad > 0 ? ((recentLoad - priorLoad) / priorLoad) * 100 : 0;

    const injuryRisk = calculateInjuryRisk(
      trainingLoad,
      weeklyIncrease,
      recoveryScore,
    );

    const factors = [];
    if (weeklyIncrease > 10) factors.push("rapid_load_increase");
    if (recoveryScore < 70) factors.push("poor_recovery");
    if (trainingLoad.acute > trainingLoad.chronic * 1.3)
      factors.push("high_absolute_load");

    return { risk: injuryRisk, factors };
  }

  private calculateInjuryVolumeReduction(
    severity: string,
    stage: string,
  ): number {
    const severityMultiplier = { minor: 0.1, moderate: 0.3, severe: 0.6 };
    const stageMultiplier = { acute: 0.8, healing: 0.5, chronic: 0.3 };

    return Math.min(
      80,
      (severityMultiplier[severity as keyof typeof severityMultiplier] || 0.3) *
        (stageMultiplier[stage as keyof typeof stageMultiplier] || 0.5) *
        100,
    );
  }

  private getInjuryAlternatives(injuryType: string): string[] {
    const alternatives: Record<string, string[]> = {
      knee: ["pool_running", "cycling", "upper_body_strength"],
      ankle: ["pool_running", "upper_body_strength", "core_work"],
      foot: ["pool_running", "cycling", "upper_body_strength"],
      hip: ["pool_running", "walking", "core_strengthening"],
      back: ["walking", "swimming", "gentle_yoga"],
    };

    return alternatives[injuryType] || ["complete_rest", "gentle_walking"];
  }

  private getInjuryPreventionStrategy(injuryHistory: string): any {
    const strategies: Record<string, any> = {
      IT_band: {
        primaryPrevention: "hip_strengthening",
        secondaryPrevention: "foam_rolling",
        volumeLimit: 10, // % reduction from standard
      },
      plantar_fasciitis: {
        primaryPrevention: "calf_stretching",
        secondary_prevention: "arch_support",
        surfaceRecommendations: ["avoid_concrete", "prefer_trails"],
      },
      stress_fracture: {
        primaryPrevention: "gradual_progression",
        secondaryPrevention: "calcium_vitamin_d",
        volumeLimit: 15,
      },
    };

    return (
      strategies[injuryHistory] || {
        primaryPrevention: "standard_injury_prevention",
        volumeLimit: 5,
      }
    );
  }

  private resolveAdaptationConflicts(
    modifications: PlanModification[],
    methodology: TrainingMethodology,
  ): PlanModification[] {
    // Group conflicting modifications and resolve them
    const conflictGroups = this.identifyConflicts(modifications);
    const resolved: PlanModification[] = [];

    conflictGroups.forEach((group) => {
      if (group.length === 1) {
        resolved.push(group[0]);
      } else {
        // Resolve conflicts by priority and methodology compatibility
        const bestResolution = this.resolveSingleConflict(group, methodology);
        resolved.push(bestResolution);
      }
    });

    return resolved;
  }

  private identifyConflicts(
    modifications: PlanModification[],
  ): PlanModification[][] {
    // Simplified conflict identification - would be more sophisticated in practice
    const groups: PlanModification[][] = [];
    const processed = new Set<number>();

    modifications.forEach((mod, index) => {
      if (processed.has(index)) return;

      const conflictGroup = [mod];
      processed.add(index);

      // Find conflicts with this modification
      modifications.forEach((other, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return;

        if (this.areConflicting(mod, other)) {
          conflictGroup.push(other);
          processed.add(otherIndex);
        }
      });

      groups.push(conflictGroup);
    });

    return groups;
  }

  private areConflicting(
    mod1: PlanModification,
    mod2: PlanModification,
  ): boolean {
    // Check if modifications conflict (e.g., both trying to modify same aspect)
    const conflictTypes = [
      ["reduce_intensity", "increase_intensity"],
      ["reduce_volume", "increase_volume"],
      ["extend_phase", "shorten_phase"],
    ];

    return conflictTypes.some(
      (conflict) =>
        (mod1.type === conflict[0] && mod2.type === conflict[1]) ||
        (mod1.type === conflict[1] && mod2.type === conflict[0]),
    );
  }

  private resolveSingleConflict(
    conflictGroup: PlanModification[],
    methodology: TrainingMethodology,
  ): PlanModification {
    // Priority order: critical > high > medium > low
    const priorityOrder = ["critical", "high", "medium", "low"];

    // Sort by priority and return highest priority modification
    const sorted = conflictGroup.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.priority);
      const bIndex = priorityOrder.indexOf(b.priority);
      return aIndex - bIndex;
    });

    return sorted[0];
  }

  private generateRecommendations(
    environmental: DetailedEnvironmentalFactors,
    equipment: EquipmentConstraints,
    time: TimeConstraints,
    injury: InjuryConstraints,
    methodology: TrainingMethodology,
  ): AdaptationRecommendation[] {
    const recommendations: AdaptationRecommendation[] = [];

    // Environmental recommendations
    if (environmental.altitude && environmental.altitude > 2500) {
      recommendations.push({
        category: "environmental",
        priority: "high",
        recommendation: "Consider altitude pre-acclimatization",
        implementation:
          "Spend 1-2 weeks at moderate altitude before high altitude training",
        expectedBenefit: "Faster adaptation and reduced altitude sickness risk",
        timeToEffect: 2,
      });
    }

    // Heat/Temperature recommendations
    if (
      environmental.typicalTemperature &&
      environmental.typicalTemperature > 30
    ) {
      recommendations.push({
        category: "environmental",
        priority: "high",
        recommendation: "Implement heat acclimatization protocol",
        implementation: "Gradual exposure to hot conditions over 10-14 days",
        expectedBenefit:
          "Improved heat tolerance and reduced heat illness risk",
        timeToEffect: 2,
      });
    }

    // Terrain recommendations
    if (environmental.terrain === "hilly") {
      recommendations.push({
        category: "environmental",
        priority: "medium",
        recommendation: "Develop hill-specific training techniques",
        implementation:
          "Practice uphill and downhill running form, add hill-specific strength work",
        expectedBenefit:
          "Improved efficiency and reduced injury risk on hilly terrain",
        timeToEffect: 4,
      });
    }

    // Air quality recommendations
    if (
      environmental.airQuality &&
      ["poor", "hazardous"].includes(environmental.airQuality)
    ) {
      recommendations.push({
        category: "environmental",
        priority: "high",
        recommendation:
          "Develop air quality monitoring and indoor alternatives",
        implementation:
          "Use air quality apps, identify indoor training facilities",
        expectedBenefit:
          "Consistent training despite poor air quality conditions",
        timeToEffect: 1,
      });
    }

    // Equipment recommendations
    if (
      !equipment.safetyEquipment.lights &&
      !equipment.safetyEquipment.reflectiveGear
    ) {
      recommendations.push({
        category: "equipment",
        priority: "high",
        recommendation: "Invest in safety equipment for low-light running",
        implementation: "Purchase LED lights and reflective vest/clothing",
        expectedBenefit: "Expanded training time windows and improved safety",
        timeToEffect: 0, // immediate
      });
    }

    // Gym access recommendations
    if (!equipment.hasGym) {
      recommendations.push({
        category: "equipment",
        priority: "medium",
        recommendation: "Develop home-based strength training setup",
        implementation:
          "Invest in resistance bands, bodyweight program, basic equipment",
        expectedBenefit: "Maintain strength training without gym access",
        timeToEffect: 1,
      });
    }

    // Surface variety recommendations
    if (equipment.availableSurfaces.length < 3) {
      recommendations.push({
        category: "equipment",
        priority: "low",
        recommendation: "Identify additional training surfaces",
        implementation: "Scout local trails, tracks, or indoor facilities",
        expectedBenefit: "Greater training variety and reduced injury risk",
        timeToEffect: 2,
      });
    }

    // Time constraint recommendations
    if (time.weeklyAvailableHours < 6) {
      recommendations.push({
        category: "scheduling",
        priority: "medium",
        recommendation: "Focus on high-intensity, low-volume training approach",
        implementation:
          "Emphasize quality over quantity, use interval training",
        expectedBenefit: "Maintain fitness with limited time commitment",
        timeToEffect: 3,
      });
    }

    // Injury prevention recommendations
    if (injury.riskFactors.some((rf) => rf.severity === "high")) {
      recommendations.push({
        category: "injury_prevention",
        priority: "high",
        recommendation: "Implement comprehensive injury prevention program",
        implementation:
          "Add strength training, mobility work, and recovery protocols",
        expectedBenefit:
          "Reduced injury risk and improved training consistency",
        timeToEffect: 4,
      });
    }

    // Methodology-specific recommendations
    if (
      methodology === "daniels" &&
      environmental.altitude &&
      environmental.altitude > 1500
    ) {
      recommendations.push({
        category: "methodology",
        priority: "medium",
        recommendation: "Adjust VDOT calculations for altitude",
        implementation: "Use altitude-corrected VDOT tables and paces",
        expectedBenefit: "More accurate training zones at altitude",
        timeToEffect: 1,
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = ["critical", "high", "medium", "low"];
      return (
        priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
      );
    });
  }

  private assessAdaptationRisk(
    plan: TrainingPlan,
    modifications: PlanModification[],
    injury: InjuryConstraints,
    completedWorkouts: CompletedWorkout[],
  ): RiskAssessment {
    const specificRisks: SpecificRisk[] = [];

    // Injury risk assessment
    if (injury.currentInjuries.length > 0) {
      specificRisks.push({
        type: "injury",
        probability: 70,
        severity: "high",
        factors: ["current_active_injuries", "modified_training_plan"],
      });
    }

    // Over-adaptation risk
    const highPriorityMods = modifications.filter((m) => m.priority === "high");
    if (highPriorityMods.length > 3) {
      specificRisks.push({
        type: "overtraining",
        probability: 60,
        severity: "moderate",
        factors: [
          "multiple_significant_adaptations",
          "training_stress_accumulation",
        ],
      });
    }

    // Adherence risk from too many modifications
    if (modifications.length > 8) {
      specificRisks.push({
        type: "adherence",
        probability: 80,
        severity: "moderate",
        factors: [
          "complex_adaptation_requirements",
          "overwhelming_modifications",
        ],
      });
    }

    // Environmental risk
    if (
      modifications.some(
        (m) => m.reason.includes("altitude") || m.reason.includes("heat"),
      )
    ) {
      specificRisks.push({
        type: "environmental",
        probability: 40,
        severity: "moderate",
        factors: ["challenging_environmental_conditions"],
      });
    }

    // Overall risk calculation
    const avgProbability =
      specificRisks.reduce((sum, risk) => sum + risk.probability, 0) /
      specificRisks.length;
    const severities = specificRisks.map(
      (risk) => risk.severity as RiskSeverity,
    );
    const maxSeverity = getHighestSeverity(severities);

    let overallRisk: "low" | "moderate" | "high" | "critical";
    if (avgProbability > 70 && maxSeverity === "high") overallRisk = "critical";
    else if (avgProbability > 60 || maxSeverity === "high")
      overallRisk = "high";
    else if (avgProbability > 40 || maxSeverity === "moderate")
      overallRisk = "moderate";
    else overallRisk = "low";

    const monitoringPoints = [
      "Weekly injury check-ins",
      "Training load progression monitoring",
      "Environmental condition tracking",
      "Adherence and motivation assessment",
    ];

    return {
      overallRisk,
      specificRisks,
      mitigationRequired: overallRisk === "high" || overallRisk === "critical",
      monitoringPoints,
    };
  }

  private calculateAdaptationEffectiveness(
    modifications: PlanModification[],
    constraints: AdaptationConstraints,
    methodology: TrainingMethodology,
  ): number {
    let baseEffectiveness = 100;

    // Reduce effectiveness based on modifications (with diminishing returns for multiple constraints)
    const criticalMods = 0; // No critical priority exists, using 0
    const highMods = modifications.filter((m) => m.priority === "high").length;
    const mediumMods = modifications.filter(
      (m) => m.priority === "medium",
    ).length;

    // Apply diminishing returns to prevent excessive effectiveness reduction
    baseEffectiveness -= criticalMods * Math.max(10, 15 - criticalMods * 2);
    baseEffectiveness -= highMods * Math.max(4, 8 - highMods * 1);
    baseEffectiveness -= mediumMods * Math.max(2, 3 - mediumMods * 0.5);

    // Equipment constraints impact (reduced)
    const equipmentImpact = constraints.equipment.reduce(
      (impact, constraint) => {
        return impact + (100 - constraint.effectiveness) * 0.05; // Reduced from 0.1
      },
      0,
    );
    baseEffectiveness -= equipmentImpact;

    // Time constraint impacts (reduced)
    constraints.time.forEach((timeConstraint) => {
      if (timeConstraint.compression.retainedEffectiveness < 90) {
        baseEffectiveness -=
          (100 - timeConstraint.compression.retainedEffectiveness) * 0.3; // Reduced from 0.5
      }
    });

    // Methodology preservation bonus
    const methodologyAlignmentBonus = this.assessMethodologyAlignment(
      modifications,
      methodology,
    );
    baseEffectiveness += methodologyAlignmentBonus;

    // Ensure minimum effectiveness is reasonable (raised from 40 to 50)
    return Math.max(50, Math.min(100, baseEffectiveness));
  }

  private assessMethodologyAlignment(
    modifications: PlanModification[],
    methodology: TrainingMethodology,
  ): number {
    // Assess how well adaptations align with methodology principles
    let alignment = 0;

    if (methodology === "daniels") {
      // Daniels appreciates precision and scientific approach
      if (
        modifications.some(
          (m) => m.reason.includes("VDOT") || m.reason.includes("precise"),
        )
      ) {
        alignment += 5;
      }
    } else if (methodology === "lydiard") {
      // Lydiard emphasizes aerobic base and natural adaptation
      if (
        modifications.some(
          (m) => m.reason.includes("aerobic") || m.reason.includes("base"),
        )
      ) {
        alignment += 5;
      }
    } else if (methodology === "pfitzinger") {
      // Pfitzinger focuses on systematic progression and threshold work
      if (
        modifications.some(
          (m) =>
            m.reason.includes("threshold") || m.reason.includes("progression"),
        )
      ) {
        alignment += 5;
      }
    }

    return alignment;
  }
}
