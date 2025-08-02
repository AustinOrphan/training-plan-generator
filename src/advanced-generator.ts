import {
  TrainingPlan,
  TrainingBlock,
  PlannedWorkout,
  AdvancedPlanConfig,
  TrainingMethodology,
  TrainingPhase,
  WorkoutType,
  TargetRace,
  RaceDistance,
  WeeklyMicrocycle,
} from "./types";
import { TrainingPlanGenerator } from "./generator";
import { PhilosophyFactory, TrainingPhilosophy } from "./philosophies";
import { TRAINING_METHODOLOGIES } from "./constants";
import {
  differenceInWeeks,
  addWeeks,
  isAfter,
  isBefore,
  addDays,
} from "date-fns";
import { analyzeWeeklyPatterns } from "./calculator";
import type { RunData } from "./types";

// Re-export public types for convenience
export type { AdvancedPlanConfig } from "./types";

/**
 * Advanced training plan generator with philosophy support
 * Extends the base TrainingPlanGenerator with methodology-specific customizations
 */
export class AdvancedTrainingPlanGenerator extends TrainingPlanGenerator {
  private advancedConfig: AdvancedPlanConfig;
  private philosophy: TrainingPhilosophy;

  constructor(config: AdvancedPlanConfig) {
    // Initialize base generator with standard config
    super(config);

    // Store advanced configuration
    this.advancedConfig = config;

    // Initialize training philosophy
    const methodology = config.methodology || "custom";
    this.philosophy = PhilosophyFactory.create(methodology);
  }

  /**
   * Generate an advanced training plan with philosophy integration
   */
  generateAdvancedPlan(): TrainingPlan {
    // Generate base plan using existing functionality
    const basePlan = super.generatePlan();

    // Enhance plan with philosophy-specific customizations
    const enhancedPlan = this.philosophy.enhancePlan(basePlan);

    // Apply additional advanced features
    const finalPlan = this.applyAdvancedFeatures(enhancedPlan);

    return finalPlan;
  }

  /**
   * Override base workout selection to integrate philosophy
   */
  protected selectWorkoutTemplate(
    type: WorkoutType,
    phase: TrainingPhase,
    weekInPhase: number,
  ): string {
    // Use philosophy-specific workout selection
    return this.philosophy.selectWorkout(type, phase, weekInPhase);
  }

  /**
   * Override workout generation to apply philosophy customizations
   */
  protected generateWorkout(
    date: Date,
    type: WorkoutType,
    phase: TrainingPhase,
    weekNumber: number,
  ): PlannedWorkout {
    // Get base workout from parent class
    const baseWorkout = super.generateWorkout(date, type, phase, weekNumber);

    // Apply philosophy-specific customizations
    const customizedWorkout = {
      ...baseWorkout,
      workout: this.philosophy.customizeWorkout(
        baseWorkout.workout,
        phase,
        weekNumber,
      ),
    };

    return customizedWorkout;
  }

  /**
   * Apply additional advanced features based on configuration
   */
  private applyAdvancedFeatures(plan: TrainingPlan): TrainingPlan {
    let enhancedPlan = plan;

    // Apply multi-race planning if target races are specified
    if (
      this.advancedConfig.targetRaces &&
      this.advancedConfig.targetRaces.length > 0
    ) {
      enhancedPlan = this.applyMultiRacePlanning(enhancedPlan);
    }

    // Apply intensity distribution if specified
    if (this.advancedConfig.intensityDistribution) {
      enhancedPlan = this.applyCustomIntensityDistribution(enhancedPlan);
    }

    // Apply periodization type if specified
    if (this.advancedConfig.periodization) {
      enhancedPlan = this.applyPeriodizationType(enhancedPlan);
    }

    // Add recovery monitoring if enabled
    if (this.advancedConfig.recoveryMonitoring) {
      enhancedPlan = this.addRecoveryMonitoring(enhancedPlan);
    }

    // Add progress tracking if enabled
    if (this.advancedConfig.progressTracking) {
      enhancedPlan = this.addProgressTracking(enhancedPlan);
    }

    return enhancedPlan;
  }

  /**
   * Apply custom intensity distribution to the plan
   */
  private applyCustomIntensityDistribution(plan: TrainingPlan): TrainingPlan {
    const distribution = this.advancedConfig.intensityDistribution!;

    // Recalculate workout distribution based on custom settings
    const modifiedBlocks = plan.blocks.map((block) => {
      const totalWorkouts = block.microcycles.reduce(
        (sum, micro) => sum + micro.workouts.length,
        0,
      );

      const easyWorkouts = Math.round(
        totalWorkouts * (distribution.easy / 100),
      );
      const moderateWorkouts = Math.round(
        totalWorkouts * (distribution.moderate / 100),
      );
      const hardWorkouts = totalWorkouts - easyWorkouts - moderateWorkouts;

      // Redistribute workouts according to custom distribution
      return this.redistributeWorkouts(
        block,
        easyWorkouts,
        moderateWorkouts,
        hardWorkouts,
      );
    });

    return {
      ...plan,
      blocks: modifiedBlocks,
    };
  }

  /**
   * Apply specific periodization type to the plan
   */
  private applyPeriodizationType(plan: TrainingPlan): TrainingPlan {
    const periodization = this.advancedConfig.periodization!;

    switch (periodization) {
      case "linear":
        return this.applyLinearPeriodization(plan);
      case "block":
        return this.applyBlockPeriodization(plan);
      case "undulating":
        return this.applyUndulatingPeriodization(plan);
      case "reverse":
        return this.applyReversePeriodization(plan);
      default:
        return plan;
    }
  }

  /**
   * Add recovery monitoring features to workouts
   */
  private addRecoveryMonitoring(plan: TrainingPlan): TrainingPlan {
    const enhancedWorkouts = plan.workouts.map((workout) => ({
      ...workout,
      targetMetrics: {
        ...workout.targetMetrics,
        recoveryMetrics: {
          minRecoveryScore: 60, // Minimum recovery score to proceed
          maxHeartRateVariability: 50, // HRV threshold
          requiredSleepHours: 7.5,
        },
      },
    }));

    return {
      ...plan,
      workouts: enhancedWorkouts,
    };
  }

  /**
   * Add progress tracking features to the plan
   */
  private addProgressTracking(plan: TrainingPlan): TrainingPlan {
    // Add progress checkpoints at key intervals
    const checkpointWeeks = [4, 8, 12, 16];
    const enhancedBlocks = plan.blocks.map((block) => {
      const enhancedMicrocycles = block.microcycles.map((micro) => {
        if (checkpointWeeks.includes(micro.weekNumber)) {
          // Add fitness assessment workout
          const assessmentWorkout = this.createFitnessAssessment(
            block.phase,
            micro.weekNumber,
          );
          return {
            ...micro,
            workouts: [...micro.workouts, assessmentWorkout],
          };
        }
        return micro;
      });

      return {
        ...block,
        microcycles: enhancedMicrocycles,
      };
    });

    return {
      ...plan,
      blocks: enhancedBlocks,
    };
  }

  /**
   * Redistribute workouts based on intensity targets
   */
  private redistributeWorkouts(
    block: TrainingBlock,
    easyCount: number,
    moderateCount: number,
    hardCount: number,
  ): TrainingBlock {
    // Implementation would redistribute existing workouts
    // This is a simplified version
    return block;
  }

  /**
   * Apply linear periodization pattern
   */
  private applyLinearPeriodization(plan: TrainingPlan): TrainingPlan {
    // Volume decreases, intensity increases over time
    // Implementation would modify workout progression
    return plan;
  }

  /**
   * Apply block periodization pattern
   */
  private applyBlockPeriodization(plan: TrainingPlan): TrainingPlan {
    // Concentrated training blocks with specific focus
    // Implementation would restructure blocks
    return plan;
  }

  /**
   * Apply undulating periodization pattern
   */
  private applyUndulatingPeriodization(plan: TrainingPlan): TrainingPlan {
    // Frequent variation in volume and intensity
    // Implementation would vary workout patterns
    return plan;
  }

  /**
   * Apply reverse periodization pattern
   */
  private applyReversePeriodization(plan: TrainingPlan): TrainingPlan {
    // Start with intensity, build volume later
    // Implementation would reverse typical progression
    return plan;
  }

  /**
   * Create a fitness assessment workout
   */
  private createFitnessAssessment(
    phase: TrainingPhase,
    week: number,
  ): PlannedWorkout {
    // Implementation would create appropriate assessment
    // This is a placeholder
    return {
      id: `assessment-${week}`,
      date: new Date(),
      type: "time_trial" as WorkoutType,
      name: "Fitness Assessment",
      description: "Progress check time trial",
      workout: {
        type: "time_trial" as WorkoutType,
        primaryZone: this.getZoneForType("time_trial"),
        segments: [],
        adaptationTarget: "Fitness assessment",
        estimatedTSS: 80,
        recoveryTime: 24,
      },
      targetMetrics: {
        duration: 30,
        tss: 80,
        load: 80,
        intensity: 90,
      },
    };
  }

  /**
   * Helper to get appropriate zone for workout type
   */
  private getZoneForType(type: WorkoutType): any {
    // This would map workout types to appropriate zones
    // Placeholder implementation
    return { name: "Threshold" };
  }

  /**
   * Apply multi-race planning to create a season-long plan
   */
  private applyMultiRacePlanning(plan: TrainingPlan): TrainingPlan {
    const races = this.advancedConfig.targetRaces!;

    // Sort races by date and priority
    const sortedRaces = this.sortRacesByPriority(races);

    // Create race-specific training blocks
    const raceBlocks = this.createMultiRaceBlocks(sortedRaces);

    // Adjust existing plan to incorporate multi-race structure
    const adjustedPlan = this.integrateRaceBlocks(plan, raceBlocks);

    // Add race-specific workouts and tapers
    const finalPlan = this.addRaceSpecificElements(adjustedPlan, sortedRaces);

    return finalPlan;
  }

  /**
   * Sort races by priority and date for optimal planning
   */
  private sortRacesByPriority(races: TargetRace[]): TargetRace[] {
    return [...races]
      .filter(
        (race) =>
          race.date && race.date instanceof Date && !isNaN(race.date.getTime()),
      )
      .sort((a, b) => {
        // Priority A races come first
        if (a.priority !== b.priority) {
          return a.priority.charCodeAt(0) - b.priority.charCodeAt(0);
        }
        // Then sort by date
        return a.date.getTime() - b.date.getTime();
      });
  }

  /**
   * Create training blocks for multiple races
   */
  private createMultiRaceBlocks(races: TargetRace[]): TrainingBlock[] {
    const blocks: TrainingBlock[] = [];
    let previousRaceDate = this.advancedConfig.startDate;

    races.forEach((race, index) => {
      const weeksAvailable = differenceInWeeks(race.date, previousRaceDate);
      const raceBlocks = this.createRacePreparationBlocks(
        race,
        previousRaceDate,
        weeksAvailable,
        index,
      );

      blocks.push(...raceBlocks);

      // Add recovery/transition period after race (except for last race)
      if (index < races.length - 1) {
        const nextRace = races[index + 1];
        const transitionWeeks = this.calculateTransitionPeriod(race, nextRace);
        if (transitionWeeks > 0) {
          blocks.push(
            this.createTransitionBlock(
              race.date,
              transitionWeeks,
              race.distance,
              nextRace.distance,
            ),
          );
        }
      }

      previousRaceDate = addWeeks(race.date, 1); // Start next cycle 1 week after race
    });

    return blocks;
  }

  /**
   * Create preparation blocks for a specific race
   */
  private createRacePreparationBlocks(
    race: TargetRace,
    startDate: Date,
    totalWeeks: number,
    blockIndex: number,
  ): TrainingBlock[] {
    const blocks: TrainingBlock[] = [];

    // Determine phase distribution based on available time and race priority
    const phaseWeeks = this.calculateRacePhaseDistribution(
      totalWeeks,
      race.priority,
    );

    let currentDate = startDate;

    // Create blocks for each phase
    if (phaseWeeks.base > 0) {
      blocks.push({
        id: `race-${blockIndex}-base`,
        phase: "base",
        startDate: currentDate,
        endDate: addWeeks(currentDate, phaseWeeks.base),
        weeks: phaseWeeks.base,
        focusAreas: this.getRaceFocusAreas("base", race.distance),
        microcycles: [],
      });
      currentDate = addWeeks(currentDate, phaseWeeks.base);
    }

    if (phaseWeeks.build > 0) {
      blocks.push({
        id: `race-${blockIndex}-build`,
        phase: "build",
        startDate: currentDate,
        endDate: addWeeks(currentDate, phaseWeeks.build),
        weeks: phaseWeeks.build,
        focusAreas: this.getRaceFocusAreas("build", race.distance),
        microcycles: [],
      });
      currentDate = addWeeks(currentDate, phaseWeeks.build);
    }

    if (phaseWeeks.peak > 0) {
      blocks.push({
        id: `race-${blockIndex}-peak`,
        phase: "peak",
        startDate: currentDate,
        endDate: addWeeks(currentDate, phaseWeeks.peak),
        weeks: phaseWeeks.peak,
        focusAreas: this.getRaceFocusAreas("peak", race.distance),
        microcycles: [],
      });
      currentDate = addWeeks(currentDate, phaseWeeks.peak);
    }

    // Always include taper for races
    blocks.push({
      id: `race-${blockIndex}-taper`,
      phase: "taper",
      startDate: currentDate,
      endDate: addWeeks(currentDate, phaseWeeks.taper),
      weeks: phaseWeeks.taper,
      focusAreas: ["Race preparation", "Recovery", "Mental readiness"],
      microcycles: [],
    });

    return blocks;
  }

  /**
   * Calculate phase distribution for race preparation
   */
  private calculateRacePhaseDistribution(
    weeks: number,
    priority: "A" | "B" | "C",
  ): Record<TrainingPhase, number> {
    const distribution = {
      base: 0,
      build: 0,
      peak: 0,
      taper: 0,
      recovery: 0,
    };

    // Adjust distribution based on priority and available time
    if (priority === "A") {
      // A races get full preparation
      if (weeks >= 12) {
        distribution.base = Math.floor(weeks * 0.3);
        distribution.build = Math.floor(weeks * 0.35);
        distribution.peak = Math.floor(weeks * 0.25);
        distribution.taper = Math.max(2, Math.floor(weeks * 0.1));
      } else if (weeks >= 8) {
        distribution.base = Math.floor(weeks * 0.25);
        distribution.build = Math.floor(weeks * 0.4);
        distribution.peak = Math.floor(weeks * 0.25);
        distribution.taper = Math.max(
          1,
          weeks - distribution.base - distribution.build - distribution.peak,
        );
      } else {
        // Minimal preparation
        distribution.build = Math.floor(weeks * 0.6);
        distribution.peak = Math.floor(weeks * 0.3);
        distribution.taper = Math.max(
          1,
          weeks - distribution.build - distribution.peak,
        );
      }
    } else if (priority === "B") {
      // B races get moderate preparation
      if (weeks >= 8) {
        distribution.base = Math.floor(weeks * 0.2);
        distribution.build = Math.floor(weeks * 0.5);
        distribution.peak = Math.floor(weeks * 0.2);
        distribution.taper = Math.max(
          1,
          weeks - distribution.base - distribution.build - distribution.peak,
        );
      } else {
        distribution.build = Math.floor(weeks * 0.7);
        distribution.taper = Math.max(1, weeks - distribution.build);
      }
    } else {
      // C races get minimal taper only
      if (weeks >= 4) {
        distribution.build = weeks - 1;
        distribution.taper = 1;
      } else {
        distribution.build = weeks;
      }
    }

    return distribution;
  }

  /**
   * Get race-specific focus areas
   */
  private getRaceFocusAreas(
    phase: TrainingPhase,
    distance: RaceDistance,
  ): string[] {
    const distanceFocus: Record<
      RaceDistance,
      Record<TrainingPhase, string[]>
    > = {
      "5k": {
        base: ["Speed development", "Running economy", "Aerobic power"],
        build: ["VO2max", "Lactate threshold", "Speed endurance"],
        peak: ["Race pace", "Speed", "Mental preparation"],
        taper: ["Maintenance", "Sharpening", "Recovery"],
        recovery: ["Active recovery", "Regeneration"],
      },
      "10k": {
        base: ["Aerobic capacity", "Threshold development", "Speed"],
        build: ["Threshold", "VO2max", "Race pace"],
        peak: ["Race simulation", "Speed endurance", "Tactics"],
        taper: ["Freshness", "Race pace feel", "Mental prep"],
        recovery: ["Easy running", "Flexibility"],
      },
      "half-marathon": {
        base: ["Aerobic base", "Threshold", "Mileage build"],
        build: ["Threshold focus", "Tempo runs", "Race pace"],
        peak: ["Race pace specificity", "Endurance", "Speed"],
        taper: ["Volume reduction", "Pace maintenance", "Rest"],
        recovery: ["Recovery runs", "Cross-training"],
      },
      marathon: {
        base: ["High mileage", "Aerobic development", "Long runs"],
        build: ["Marathon pace", "Long tempo", "Fuel practice"],
        peak: ["Race simulation", "Pace discipline", "Nutrition"],
        taper: ["Gradual reduction", "Glycogen storage", "Rest"],
        recovery: ["Active recovery", "Reflection", "Planning"],
      },
      // Add other distances with reasonable defaults
      "15k": {
        base: ["Aerobic capacity", "Threshold", "Mileage"],
        build: ["Threshold", "Tempo", "Race pace"],
        peak: ["Race pace", "Endurance", "Speed"],
        taper: ["Recovery", "Maintenance", "Mental prep"],
        recovery: ["Easy running", "Recovery"],
      },
      "50k": {
        base: ["Ultra endurance", "Time on feet", "Nutrition"],
        build: ["Back-to-back long runs", "Hill strength", "Pacing"],
        peak: ["Race simulation", "Fueling strategy", "Mental prep"],
        taper: ["Volume reduction", "Recovery", "Preparation"],
        recovery: ["Active recovery", "Adaptation"],
      },
      "50-mile": {
        base: ["High volume", "Endurance", "Strength"],
        build: ["Ultra-specific training", "Nutrition practice", "Hills"],
        peak: ["Race rehearsal", "Mental preparation", "Logistics"],
        taper: ["Rest", "Recovery", "Preparation"],
        recovery: ["Extended recovery", "Adaptation"],
      },
      "100k": {
        base: ["Volume build", "Endurance", "Consistency"],
        build: ["Back-to-backs", "Night running", "Nutrition"],
        peak: ["Race simulation", "Mental training", "Strategy"],
        taper: ["Deep recovery", "Preparation", "Rest"],
        recovery: ["Extended recovery", "Reflection"],
      },
      "100-mile": {
        base: ["Massive volume", "Time on feet", "Adaptation"],
        build: ["Ultra endurance", "Sleep deprivation", "Nutrition"],
        peak: ["Mental preparation", "Logistics", "Strategy"],
        taper: ["Complete rest", "Recovery", "Mental prep"],
        recovery: ["Extended recovery", "Adaptation", "Planning"],
      },
      ultra: {
        base: ["Ultra endurance", "Time on feet", "Base building"],
        build: ["Long sustained efforts", "Nutrition", "Mental training"],
        peak: ["Race preparation", "Strategy", "Fueling"],
        taper: ["Recovery", "Preparation", "Rest"],
        recovery: ["Extended recovery", "Regeneration"],
      },
    };

    return distanceFocus[distance]?.[phase] || ["General preparation"];
  }

  /**
   * Calculate transition period between races
   */
  private calculateTransitionPeriod(
    completedRace: TargetRace,
    upcomingRace: TargetRace,
  ): number {
    const weeksBetween = differenceInWeeks(
      upcomingRace.date,
      completedRace.date,
    );

    // Factor in race distances and priorities
    const recoveryNeeded = this.getRecoveryWeeks(
      completedRace.distance,
      completedRace.priority,
    );
    const preparationNeeded = this.getMinimalPreparationWeeks(
      upcomingRace.distance,
      upcomingRace.priority,
    );

    // If races are very close, minimize transition
    if (weeksBetween < recoveryNeeded + preparationNeeded) {
      return Math.max(1, Math.floor(weeksBetween * 0.2));
    }

    return Math.min(recoveryNeeded, Math.floor(weeksBetween * 0.3));
  }

  /**
   * Get recovery weeks needed after a race
   */
  private getRecoveryWeeks(
    distance: RaceDistance,
    priority: "A" | "B" | "C",
  ): number {
    const baseRecovery: Record<RaceDistance, number> = {
      "5k": 1,
      "10k": 1,
      "15k": 1,
      "half-marathon": 2,
      marathon: 3,
      "50k": 4,
      "50-mile": 6,
      "100k": 8,
      "100-mile": 12,
      ultra: 10,
    };

    // Adjust based on priority (harder effort = more recovery)
    const priorityMultiplier =
      priority === "A" ? 1.0 : priority === "B" ? 0.7 : 0.5;

    return Math.ceil(baseRecovery[distance] * priorityMultiplier);
  }

  /**
   * Get minimal preparation weeks for a race
   */
  private getMinimalPreparationWeeks(
    distance: RaceDistance,
    priority: "A" | "B" | "C",
  ): number {
    const basePrep: Record<RaceDistance, number> = {
      "5k": 4,
      "10k": 6,
      "15k": 8,
      "half-marathon": 8,
      marathon: 12,
      "50k": 16,
      "50-mile": 20,
      "100k": 24,
      "100-mile": 32,
      ultra: 20,
    };

    // Adjust based on priority
    const priorityMultiplier =
      priority === "A" ? 1.0 : priority === "B" ? 0.6 : 0.3;

    return Math.ceil(basePrep[distance] * priorityMultiplier);
  }

  /**
   * Create transition block between races
   */
  private createTransitionBlock(
    startDate: Date,
    weeks: number,
    fromDistance: RaceDistance,
    toDistance: RaceDistance,
  ): TrainingBlock {
    return {
      id: `transition-${fromDistance}-to-${toDistance}`,
      phase: "recovery",
      startDate: addWeeks(startDate, 1),
      endDate: addWeeks(startDate, weeks + 1),
      weeks,
      focusAreas: [
        "Active recovery",
        `Transition from ${fromDistance} to ${toDistance}`,
        "Base maintenance",
      ],
      microcycles: [],
    };
  }

  /**
   * Integrate race blocks with existing plan structure
   */
  private integrateRaceBlocks(
    plan: TrainingPlan,
    raceBlocks: TrainingBlock[],
  ): TrainingPlan {
    // Replace existing blocks with race-specific blocks
    const updatedBlocks = raceBlocks.map((block) => {
      // Generate microcycles for each block using the protected method
      // This is type-safe since AdvancedTrainingPlanGenerator extends TrainingPlanGenerator
      const microcycles = this.generateMicrocycles(block);

      return {
        ...block,
        microcycles,
      };
    });

    // Regenerate all workouts based on new block structure
    const allWorkouts = updatedBlocks.flatMap((block) =>
      block.microcycles.flatMap((cycle) => cycle.workouts),
    );

    return {
      ...plan,
      blocks: updatedBlocks,
      workouts: allWorkouts,
    };
  }

  /**
   * Add race-specific elements to the plan
   */
  private addRaceSpecificElements(
    plan: TrainingPlan,
    races: TargetRace[],
  ): TrainingPlan {
    const enhancedWorkouts = [...plan.workouts];

    races.forEach((race) => {
      // Validate race date
      if (
        !race.date ||
        !(race.date instanceof Date) ||
        isNaN(race.date.getTime())
      ) {
        console.warn(
          `Invalid race date for ${race.distance} race, skipping...`,
        );
        return;
      }

      // Add race day placeholder
      const raceWorkout: PlannedWorkout = {
        id: `race-${race.distance}-${race.date.toISOString()}`,
        date: race.date,
        type: "race_pace",
        name: `${race.distance} Race${race.location ? ` - ${race.location}` : ""}`,
        description: `Priority ${race.priority} race`,
        workout: {
          type: "race_pace",
          primaryZone: this.getZoneForType("race_pace"),
          segments: [
            {
              duration: this.estimateRaceDuration(race.distance),
              intensity: 95,
              zone: this.getZoneForType("race_pace"),
              description: "Race effort",
            },
          ],
          adaptationTarget: "Race performance",
          estimatedTSS: this.estimateRaceTSS(race.distance),
          recoveryTime:
            this.getRecoveryWeeks(race.distance, race.priority) * 168, // hours
        },
        targetMetrics: {
          duration: this.estimateRaceDuration(race.distance),
          distance: this.getRaceDistanceKm(race.distance),
          tss: this.estimateRaceTSS(race.distance),
          load: this.estimateRaceTSS(race.distance),
          intensity: 95,
        },
      };

      enhancedWorkouts.push(raceWorkout);

      // Add race-week tune-up workouts
      if (race.priority === "A" || race.priority === "B") {
        const tuneUpWorkout = this.createRaceTuneUpWorkout(
          race,
          addDays(race.date, -3),
        );
        enhancedWorkouts.push(tuneUpWorkout);
      }
    });

    // Sort workouts by date
    enhancedWorkouts.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      ...plan,
      workouts: enhancedWorkouts,
    };
  }

  /**
   * Estimate race duration in minutes
   */
  private estimateRaceDuration(distance: RaceDistance): number {
    // Rough estimates for planning purposes
    const durations: Record<RaceDistance, number> = {
      "5k": 25,
      "10k": 50,
      "15k": 80,
      "half-marathon": 110,
      marathon: 240,
      "50k": 360,
      "50-mile": 600,
      "100k": 840,
      "100-mile": 1800,
      ultra: 600,
    };

    return durations[distance] || 60;
  }

  /**
   * Get race distance in kilometers
   */
  private getRaceDistanceKm(distance: RaceDistance): number {
    const distances: Record<RaceDistance, number> = {
      "5k": 5,
      "10k": 10,
      "15k": 15,
      "half-marathon": 21.1,
      marathon: 42.2,
      "50k": 50,
      "50-mile": 80.5,
      "100k": 100,
      "100-mile": 161,
      ultra: 50,
    };

    return distances[distance] || 10;
  }

  /**
   * Estimate race TSS
   */
  private estimateRaceTSS(distance: RaceDistance): number {
    const tssValues: Record<RaceDistance, number> = {
      "5k": 60,
      "10k": 100,
      "15k": 140,
      "half-marathon": 180,
      marathon: 300,
      "50k": 400,
      "50-mile": 600,
      "100k": 800,
      "100-mile": 1200,
      ultra: 500,
    };

    return tssValues[distance] || 100;
  }

  /**
   * Create race tune-up workout
   */
  private createRaceTuneUpWorkout(
    race: TargetRace,
    date: Date,
  ): PlannedWorkout {
    const distance = race.distance;
    const tuneUpDistance = this.getTuneUpDistance(distance);

    return {
      id: `tune-up-${race.distance}-${date.toISOString()}`,
      date,
      type: "race_pace",
      name: `${distance} Race Tune-up`,
      description: "Pre-race shakeout with race pace segments",
      workout: {
        type: "race_pace",
        primaryZone: this.getZoneForType("tempo"),
        segments: [
          {
            duration: 10,
            intensity: 65,
            zone: this.getZoneForType("easy"),
            description: "Easy warm-up",
          },
          {
            duration: tuneUpDistance,
            intensity: 90,
            zone: this.getZoneForType("race_pace"),
            description: "Race pace",
          },
          {
            duration: 10,
            intensity: 60,
            zone: this.getZoneForType("recovery"),
            description: "Cool-down",
          },
        ],
        adaptationTarget: "Race pace feel and confidence",
        estimatedTSS: 40,
        recoveryTime: 24,
      },
      targetMetrics: {
        duration: 20 + tuneUpDistance,
        distance: (20 + tuneUpDistance) / 5, // Rough estimate
        tss: 40,
        load: 40,
        intensity: 75,
      },
    };
  }

  /**
   * Get appropriate tune-up distance for race
   */
  private getTuneUpDistance(distance: RaceDistance): number {
    const tuneUpMap: Record<RaceDistance, number> = {
      "5k": 5,
      "10k": 8,
      "15k": 10,
      "half-marathon": 12,
      marathon: 15,
      "50k": 20,
      "50-mile": 30,
      "100k": 30,
      "100-mile": 45,
      ultra: 25,
    };

    return tuneUpMap[distance] || 10;
  }

  /**
   * Create advanced plan from run history with methodology
   */
  static fromRunHistoryAdvanced(
    runs: RunData[],
    config: Partial<AdvancedPlanConfig>,
  ): TrainingPlan {
    // Assess fitness from runs using base class method
    const fitness = TrainingPlanGenerator.assessFitnessFromRuns(runs);
    const weeklyPatterns = analyzeWeeklyPatterns(runs);

    // Create advanced configuration
    const advancedConfig: AdvancedPlanConfig = {
      name: config.name || "Advanced Training Plan",
      goal: config.goal || "GENERAL_FITNESS",
      startDate: config.startDate || new Date(),
      targetDate: config.targetDate,
      currentFitness: fitness,
      preferences: {
        availableDays: weeklyPatterns.optimalDays,
        preferredIntensity: "moderate",
        crossTraining: false,
        strengthTraining: false,
        ...config.preferences,
      },
      methodology: config.methodology || "custom",
      intensityDistribution: config.intensityDistribution ?? {
        easy: 80,
        moderate: 15,
        hard: 5,
        veryHard: 0,
      },
      periodization: config.periodization ?? "linear",
      targetRaces: config.targetRaces || [],
      adaptationEnabled: config.adaptationEnabled || false,
      recoveryMonitoring: config.recoveryMonitoring || false,
      progressTracking: config.progressTracking || true,
      ...config,
    };

    const generator = new AdvancedTrainingPlanGenerator(advancedConfig);
    return generator.generateAdvancedPlan();
  }

  /**
   * Get methodology-specific configuration
   */
  getMethodologyConfig(): (typeof TRAINING_METHODOLOGIES)[TrainingMethodology] {
    return TRAINING_METHODOLOGIES[this.advancedConfig.methodology || "custom"];
  }

  /**
   * Get current philosophy instance
   */
  getPhilosophy(): TrainingPhilosophy {
    return this.philosophy;
  }
}
