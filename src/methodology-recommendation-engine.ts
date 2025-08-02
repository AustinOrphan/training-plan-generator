import {
  TrainingMethodology,
  TrainingGoal,
  FitnessAssessment,
  TrainingPreferences,
  EnvironmentalFactors,
  RaceDistance,
  TargetRace,
  RunnerAttribute,
} from "./types";
import {
  PhilosophyComparator,
  MethodologyProfile,
} from "./philosophy-comparator";
import { TRAINING_METHODOLOGIES } from "./constants";

// Types for recommendation system
export interface UserProfile {
  // Basic information
  age?: number;
  gender?: "male" | "female" | "other";
  experience: RunnerExperience;

  // Training background
  currentFitness: FitnessAssessment;
  trainingPreferences: TrainingPreferences;
  environmentalFactors?: EnvironmentalFactors;

  // Goals and motivation
  primaryGoal: TrainingGoal;
  targetRaces?: TargetRace[];
  motivations: RunnerMotivation[];

  // Constraints and considerations
  injuryHistory?: string[];
  timeAvailability: number; // hours per week
  strengthsAndWeaknesses?: StrengthsWeaknesses;

  // Training philosophy preferences
  preferredApproach?: TrainingApproach;
  previousMethodologies?: TrainingMethodology[];
}

export type RunnerExperience =
  | "beginner" // < 1 year
  | "novice" // 1-2 years
  | "intermediate" // 2-5 years
  | "advanced" // 5-10 years
  | "expert"; // 10+ years

export type RunnerMotivation =
  | "finish_first_race"
  | "improve_times"
  | "qualify_boston"
  | "stay_healthy"
  | "lose_weight"
  | "social_aspect"
  | "compete"
  | "mental_health"
  | "longevity";

export interface StrengthsWeaknesses {
  strengths: RunnerAttribute[];
  weaknesses: RunnerAttribute[];
}

export type TrainingApproach =
  | "scientific" // Data-driven, precise pacing
  | "intuitive" // Feel-based, flexible
  | "structured" // Strict adherence to plans
  | "flexible"; // Adaptable to daily life

export interface RecommendationResult {
  primaryRecommendation: MethodologyRecommendation;
  alternativeOptions: MethodologyRecommendation[];
  rationale: RecommendationRationale;
  transitionPlan?: TransitionPlan;
  warnings?: string[];
}

export interface MethodologyRecommendation {
  methodology: TrainingMethodology;
  compatibilityScore: number; // 0-100
  strengths: string[];
  considerations: string[];
  expectedOutcomes: string[];
  timeToAdapt: number; // weeks
}

export interface RecommendationRationale {
  primaryFactors: string[];
  scoringBreakdown: Record<string, number>;
  userProfileMatch: string[];
  methodologyAdvantages: string[];
}

export interface TransitionPlan {
  fromMethodology?: TrainingMethodology;
  toMethodology: TrainingMethodology;
  transitionWeeks: number;
  keyChanges: string[];
  adaptationFocus: string[];
  gradualAdjustments: WeeklyAdjustment[];
}

export interface WeeklyAdjustment {
  week: number;
  focus: string;
  changes: string[];
  targetMetrics: Record<string, number>;
}

export interface RecommendationQuiz {
  questions: QuizQuestion[];
  scoringLogic: (answers: QuizAnswer[]) => UserProfile;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "single" | "multiple" | "scale" | "text";
  options?: QuizOption[];
  validation?: (answer: any) => boolean;
}

export interface QuizOption {
  value: string;
  label: string;
  score?: Record<string, number>;
}

export interface QuizAnswer {
  questionId: string;
  answer: any;
}

/**
 * MethodologyRecommendationEngine provides sophisticated user profile-based
 * training methodology recommendations with detailed rationale and transition support
 */
export class MethodologyRecommendationEngine {
  private comparator: PhilosophyComparator;
  private scoringWeights: Record<string, number>;

  constructor() {
    this.comparator = new PhilosophyComparator();
    this.scoringWeights = this.initializeScoringWeights();
  }

  /**
   * Initialize scoring weights for different recommendation factors
   */
  private initializeScoringWeights(): Record<string, number> {
    return {
      experienceMatch: 0.2,
      goalAlignment: 0.25,
      timeAvailability: 0.15,
      injuryHistory: 0.1,
      trainingApproach: 0.15,
      environmentalFactors: 0.05,
      strengthsWeaknesses: 0.1,
    };
  }

  /**
   * Get methodology recommendation based on user profile
   */
  public recommendMethodology(userProfile: UserProfile): RecommendationResult {
    // Score each methodology against user profile
    const methodologyScores = this.scoreMethodologies(userProfile);

    // Sort by compatibility score
    const sortedRecommendations = methodologyScores.sort(
      (a, b) => b.compatibilityScore - a.compatibilityScore,
    );

    // Generate detailed rationale
    const rationale = this.generateRationale(
      userProfile,
      sortedRecommendations[0],
    );

    // Create transition plan if user has previous methodology
    const transitionPlan = userProfile.previousMethodologies?.length
      ? this.createTransitionPlan(
          userProfile.previousMethodologies[0],
          sortedRecommendations[0].methodology,
          userProfile,
        )
      : undefined;

    // Generate warnings if applicable
    const warnings = this.generateWarnings(
      userProfile,
      sortedRecommendations[0],
    );

    return {
      primaryRecommendation: sortedRecommendations[0],
      alternativeOptions: sortedRecommendations.slice(1),
      rationale,
      transitionPlan,
      warnings,
    };
  }

  /**
   * Score all methodologies against user profile
   */
  private scoreMethodologies(
    userProfile: UserProfile,
  ): MethodologyRecommendation[] {
    const methodologies: TrainingMethodology[] = [
      "daniels",
      "lydiard",
      "pfitzinger",
    ];

    return methodologies.map((methodology) => {
      const profile = this.comparator.getMethodologyProfile(methodology)!;
      const scores = this.calculateMethodologyScores(userProfile, profile);
      const totalScore = this.calculateTotalScore(scores);

      return {
        methodology,
        compatibilityScore: Math.round(totalScore),
        strengths: this.identifyMethodologyStrengths(userProfile, profile),
        considerations: this.identifyConsiderations(userProfile, profile),
        expectedOutcomes: this.predictOutcomes(userProfile, profile),
        timeToAdapt: this.estimateAdaptationTime(userProfile, profile),
      };
    });
  }

  /**
   * Calculate individual scoring components
   */
  private calculateMethodologyScores(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): Record<string, number> {
    return {
      experienceMatch: this.scoreExperienceMatch(
        userProfile,
        methodologyProfile,
      ),
      goalAlignment: this.scoreGoalAlignment(userProfile, methodologyProfile),
      timeAvailability: this.scoreTimeAvailability(
        userProfile,
        methodologyProfile,
      ),
      injuryHistory: this.scoreInjuryHistory(userProfile, methodologyProfile),
      trainingApproach: this.scoreTrainingApproach(
        userProfile,
        methodologyProfile,
      ),
      environmentalFactors: this.scoreEnvironmentalFactors(
        userProfile,
        methodologyProfile,
      ),
      strengthsWeaknesses: this.scoreStrengthsWeaknesses(
        userProfile,
        methodologyProfile,
      ),
    };
  }

  /**
   * Score experience match (0-100)
   */
  private scoreExperienceMatch(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): number {
    const experienceMap: Record<RunnerExperience, number> = {
      beginner: 1,
      novice: 2,
      intermediate: 3,
      advanced: 4,
      expert: 5,
    };

    const userLevel = experienceMap[userProfile.experience];

    // Daniels: Best for intermediate to advanced (precise pacing needs experience)
    if (methodologyProfile.methodology === "daniels") {
      if (userLevel >= 3) return 90 + (userLevel - 3) * 5;
      return 60 + userLevel * 10;
    }

    // Lydiard: Good for all levels (effort-based is accessible)
    if (methodologyProfile.methodology === "lydiard") {
      return 80 + Math.abs(3 - userLevel) * 5; // Peak at intermediate
    }

    // Pfitzinger: Best for intermediate to advanced (high volume)
    if (methodologyProfile.methodology === "pfitzinger") {
      if (userLevel >= 3) return 85 + (userLevel - 3) * 5;
      return 50 + userLevel * 10;
    }

    return 70;
  }

  /**
   * Score goal alignment (0-100)
   */
  private scoreGoalAlignment(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): number {
    const goal = userProfile.primaryGoal;
    const targetAudience = methodologyProfile.targetAudience;

    // Check if methodology explicitly targets the goal
    if (goal === "MARATHON" && targetAudience.includes("marathon runners")) {
      return 95;
    }

    // Daniels: Excellent for time improvement goals
    if (methodologyProfile.methodology === "daniels") {
      if (
        goal.includes("IMPROVE") ||
        userProfile.motivations.includes("improve_times")
      ) {
        // Check if Boston qualifier - Pfitzinger should win
        if (
          goal === "MARATHON" &&
          userProfile.motivations.includes("qualify_boston")
        ) {
          return 90; // Less than Pfitzinger's 100
        }
        return 95;
      }
      if (goal === "MARATHON" || goal === "HALF_MARATHON") return 85;
      if (goal.includes("FIRST")) return 70; // May be too complex for first-timers
      return 75;
    }

    // Lydiard: Great for building base and first-time goals
    if (methodologyProfile.methodology === "lydiard") {
      if (goal.includes("FIRST") || goal === "ULTRA") return 95;
      if (goal === "MARATHON") return 90;
      if (userProfile.motivations.includes("stay_healthy")) return 90;
      return 80;
    }

    // Pfitzinger: Ideal for serious marathon training
    if (methodologyProfile.methodology === "pfitzinger") {
      if (
        goal === "MARATHON" &&
        userProfile.motivations.includes("qualify_boston")
      ) {
        return 100;
      }
      if (goal === "MARATHON" || goal === "HALF_MARATHON") return 90;
      if (goal.includes("IMPROVE")) return 85;
      return 70;
    }

    return 75;
  }

  /**
   * Score time availability (0-100)
   */
  private scoreTimeAvailability(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): number {
    const hoursPerWeek = userProfile.timeAvailability;

    // Daniels: Moderate time requirements (quality over quantity)
    if (methodologyProfile.methodology === "daniels") {
      if (hoursPerWeek >= 5 && hoursPerWeek <= 10) return 95;
      if (hoursPerWeek < 5) return 70; // Can work with less time
      if (hoursPerWeek > 10) return 85; // Not optimized for high volume
      return 80;
    }

    // Lydiard: High time requirements (volume-based)
    if (methodologyProfile.methodology === "lydiard") {
      if (hoursPerWeek >= 8) return 90 + Math.min((hoursPerWeek - 8) * 2, 10);
      if (hoursPerWeek >= 6) return 70;
      return 50 + hoursPerWeek * 5; // Challenging with limited time
    }

    // Pfitzinger: Moderate to high time requirements
    if (methodologyProfile.methodology === "pfitzinger") {
      if (hoursPerWeek >= 7 && hoursPerWeek <= 12) return 95;
      if (hoursPerWeek < 7) return 60 + hoursPerWeek * 5;
      return 85;
    }

    return 75;
  }

  /**
   * Score injury history compatibility (0-100)
   */
  private scoreInjuryHistory(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): number {
    const injuryCount = userProfile.injuryHistory?.length || 0;
    const hasRecurringInjuries = injuryCount > 2;

    // Daniels: Good injury prevention through controlled intensity
    if (methodologyProfile.methodology === "daniels") {
      if (injuryCount === 0) return 85;
      if (hasRecurringInjuries) return 75; // Structured approach helps
      return 80;
    }

    // Lydiard: Excellent for injury-prone (gradual buildup)
    if (methodologyProfile.methodology === "lydiard") {
      if (injuryCount === 0) return 80;
      if (hasRecurringInjuries) return 90; // Aerobic emphasis reduces risk
      return 85;
    }

    // Pfitzinger: Higher risk due to volume
    if (methodologyProfile.methodology === "pfitzinger") {
      if (injuryCount === 0) return 85;
      if (hasRecurringInjuries) return 60; // Volume may be problematic
      return 70;
    }

    return 75;
  }

  /**
   * Score training approach preference (0-100)
   */
  private scoreTrainingApproach(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): number {
    const approach = userProfile.preferredApproach || "flexible";

    // Daniels: Perfect for scientific approach
    if (methodologyProfile.methodology === "daniels") {
      if (approach === "scientific") return 100;
      if (approach === "structured") return 90;
      if (approach === "flexible") return 70;
      if (approach === "intuitive") return 60;
    }

    // Lydiard: Great for intuitive approach
    if (methodologyProfile.methodology === "lydiard") {
      if (approach === "intuitive") return 95;
      if (approach === "flexible") return 85;
      if (approach === "structured") return 75;
      if (approach === "scientific") return 70;
    }

    // Pfitzinger: Balanced structure
    if (methodologyProfile.methodology === "pfitzinger") {
      if (approach === "structured") return 98; // Highest for structured approach
      if (approach === "scientific") return 85;
      if (approach === "flexible") return 75;
      if (approach === "intuitive") return 65;
    }

    return 75;
  }

  /**
   * Score environmental factors (0-100)
   */
  private scoreEnvironmentalFactors(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): number {
    const env = userProfile.environmentalFactors;
    if (!env) return 80; // Neutral score if not specified

    const hasChallengingConditions =
      (env.altitude && env.altitude > 1500) ||
      (env.typicalTemperature &&
        (env.typicalTemperature > 25 || env.typicalTemperature < 5)) ||
      env.terrain === "hilly" ||
      env.terrain === "trail";

    // All methodologies can adapt, but some better than others
    if (methodologyProfile.methodology === "lydiard") {
      // Effort-based adapts well to conditions
      return hasChallengingConditions ? 90 : 85;
    }

    if (methodologyProfile.methodology === "daniels") {
      // Pace-based may need adjustment
      return hasChallengingConditions ? 75 : 90;
    }

    return 80;
  }

  /**
   * Score strengths and weaknesses match (0-100)
   */
  private scoreStrengthsWeaknesses(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): number {
    const sw = userProfile.strengthsAndWeaknesses;
    if (!sw) return 80;

    let score = 80;

    // Daniels: Builds speed and efficiency
    if (methodologyProfile.methodology === "daniels") {
      if (sw.weaknesses.includes("speed")) score += 15;
      if (sw.strengths.includes("consistency")) score += 10;
      if (sw.weaknesses.includes("endurance")) score -= 5;
    }

    // Lydiard: Builds endurance and injury resistance
    if (methodologyProfile.methodology === "lydiard") {
      if (sw.weaknesses.includes("endurance")) score += 20;
      if (sw.weaknesses.includes("injury_resistance")) score += 15;
      if (sw.strengths.includes("speed")) score -= 5; // May reduce speed initially
    }

    // Pfitzinger: Builds threshold and mental toughness
    if (methodologyProfile.methodology === "pfitzinger") {
      if (sw.weaknesses.includes("mental_toughness")) score += 15;
      if (sw.strengths.includes("endurance")) score += 10;
      if (sw.weaknesses.includes("recovery")) score -= 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate total weighted score
   */
  private calculateTotalScore(scores: Record<string, number>): number {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([factor, score]) => {
      const weight = this.scoringWeights[factor] || 0;
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Identify methodology strengths for user
   */
  private identifyMethodologyStrengths(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): string[] {
    const strengths: string[] = [];

    // Common strength identification
    if (methodologyProfile.methodology === "daniels") {
      strengths.push("Precise pace-based training for optimal adaptation");
      strengths.push("Scientific approach with proven VDOT system");
      if (userProfile.experience !== "beginner") {
        strengths.push("Efficient training maximizes limited time");
      }
    }

    if (methodologyProfile.methodology === "lydiard") {
      strengths.push("Strong aerobic base development");
      strengths.push("Injury prevention through gradual progression");
      strengths.push("Flexible effort-based approach");
    }

    if (methodologyProfile.methodology === "pfitzinger") {
      strengths.push("Excellent marathon-specific preparation");
      strengths.push("Lactate threshold development");
      strengths.push("Structured progression with medium-long runs");
    }

    return strengths;
  }

  /**
   * Identify considerations for user
   */
  private identifyConsiderations(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): string[] {
    const considerations: string[] = [];

    if (methodologyProfile.methodology === "daniels") {
      if (userProfile.experience === "beginner") {
        considerations.push("Requires understanding of pace zones");
      }
      if (userProfile.preferredApproach === "intuitive") {
        considerations.push("Very structured approach may feel restrictive");
      }
      if (userProfile.timeAvailability < 5) {
        considerations.push(
          "Limited time requires careful workout prioritization",
        );
      }
      if (userProfile.injuryHistory && userProfile.injuryHistory.length > 3) {
        considerations.push(
          "Structured intensity may need adjustment for injury prevention",
        );
      }
    }

    if (methodologyProfile.methodology === "lydiard") {
      if (userProfile.timeAvailability < 6) {
        considerations.push("High volume requirements may be challenging");
      }
      if (userProfile.motivations.includes("improve_times")) {
        considerations.push("Speed development comes later in progression");
      }
      if (
        userProfile.experience === "intermediate" ||
        userProfile.experience === "advanced"
      ) {
        considerations.push("May require patience with aerobic-only phase");
      }
    }

    if (methodologyProfile.methodology === "pfitzinger") {
      if (userProfile.injuryHistory && userProfile.injuryHistory.length > 2) {
        considerations.push("High volume may increase injury risk");
      }
      if (
        userProfile.experience === "beginner" ||
        userProfile.experience === "novice"
      ) {
        considerations.push("Demanding workload requires strong base");
      }
      if (userProfile.timeAvailability < 7) {
        considerations.push(
          "May need to modify volume to fit time constraints",
        );
      }
    }

    // Ensure at least one consideration for each methodology
    if (considerations.length === 0) {
      considerations.push("Monitor adaptation and adjust as needed");
    }

    return considerations;
  }

  /**
   * Predict expected outcomes
   */
  private predictOutcomes(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): string[] {
    const outcomes: string[] = [];
    const vdot = userProfile.currentFitness.vdot || 45;

    if (methodologyProfile.methodology === "daniels") {
      outcomes.push("2-3% VDOT improvement per training cycle");
      outcomes.push("Consistent pacing ability across all distances");
      if (vdot < 50) {
        outcomes.push(
          "Potential for 5-8% performance improvement in first year",
        );
      }
    }

    if (methodologyProfile.methodology === "lydiard") {
      outcomes.push("Significant aerobic capacity improvement");
      outcomes.push("Enhanced injury resistance and longevity");
      outcomes.push("Strong finishing ability in races");
    }

    if (methodologyProfile.methodology === "pfitzinger") {
      outcomes.push("Marathon time improvement of 3-5%");
      outcomes.push("Excellent race-specific fitness");
      outcomes.push("Mental toughness development");
    }

    return outcomes;
  }

  /**
   * Estimate adaptation time
   */
  private estimateAdaptationTime(
    userProfile: UserProfile,
    methodologyProfile: MethodologyProfile,
  ): number {
    let baseWeeks = 4;

    // Experience factor
    if (userProfile.experience === "beginner") baseWeeks += 4;
    else if (userProfile.experience === "novice") baseWeeks += 2;

    // Previous methodology factor
    if (userProfile.previousMethodologies?.length) {
      const comparison = this.comparator.compareMethodologies(
        userProfile.previousMethodologies[0],
        methodologyProfile.methodology,
      );

      if (comparison.transitionDifficulty === "difficult") baseWeeks += 4;
      else if (comparison.transitionDifficulty === "moderate") baseWeeks += 2;
    }

    // Methodology-specific adjustments
    if (
      methodologyProfile.methodology === "daniels" &&
      userProfile.preferredApproach !== "scientific"
    ) {
      baseWeeks += 2; // Learning pace zones
    }

    if (
      methodologyProfile.methodology === "lydiard" &&
      userProfile.currentFitness.weeklyMileage < 30
    ) {
      baseWeeks += 4; // Building volume
    }

    return baseWeeks;
  }

  /**
   * Generate detailed rationale
   */
  private generateRationale(
    userProfile: UserProfile,
    recommendation: MethodologyRecommendation,
  ): RecommendationRationale {
    const scores = this.calculateMethodologyScores(
      userProfile,
      this.comparator.getMethodologyProfile(recommendation.methodology)!,
    );

    const primaryFactors: string[] = [];
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // Identify top 3 factors
    sortedScores.slice(0, 3).forEach(([factor, score]) => {
      if (score >= 80) {
        primaryFactors.push(this.explainFactor(factor, score, userProfile));
      }
    });

    const userProfileMatch = this.generateProfileMatchExplanation(
      userProfile,
      recommendation,
    );
    const methodologyAdvantages = recommendation.strengths;

    return {
      primaryFactors,
      scoringBreakdown: scores,
      userProfileMatch,
      methodologyAdvantages,
    };
  }

  /**
   * Explain scoring factor
   */
  private explainFactor(
    factor: string,
    score: number,
    userProfile: UserProfile,
  ): string {
    const explanations: Record<string, string> = {
      experienceMatch: `Your ${userProfile.experience} experience level aligns well with this methodology (${score}% match)`,
      goalAlignment: `Excellent fit for your ${userProfile.primaryGoal} goal (${score}% alignment)`,
      timeAvailability: `Works well with your ${userProfile.timeAvailability} hours/week availability (${score}% fit)`,
      injuryHistory: `Appropriate injury risk management for your history (${score}% safety)`,
      trainingApproach: `Matches your ${userProfile.preferredApproach || "flexible"} training style (${score}% compatibility)`,
      environmentalFactors: `Adapts well to your training environment (${score}% suitability)`,
      strengthsWeaknesses: `Addresses your specific strengths and weaknesses (${score}% targeting)`,
    };

    return explanations[factor] || `${factor}: ${score}% match`;
  }

  /**
   * Generate profile match explanation
   */
  private generateProfileMatchExplanation(
    userProfile: UserProfile,
    recommendation: MethodologyRecommendation,
  ): string[] {
    const matches: string[] = [];

    // Experience-based explanation
    if (
      userProfile.experience === "intermediate" ||
      userProfile.experience === "advanced"
    ) {
      matches.push(
        `${recommendation.methodology} is ideal for ${userProfile.experience} runners ready for structured training`,
      );
    }

    // Goal-based explanation
    if (userProfile.primaryGoal === "MARATHON") {
      matches.push(`Proven marathon training system with excellent results`);
    }

    // Motivation-based explanation
    if (userProfile.motivations.includes("improve_times")) {
      matches.push(
        `Focus on performance improvement through systematic progression`,
      );
    }

    return matches;
  }

  /**
   * Create transition plan between methodologies
   */
  private createTransitionPlan(
    fromMethodology: TrainingMethodology,
    toMethodology: TrainingMethodology,
    userProfile: UserProfile,
  ): TransitionPlan {
    const comparison = this.comparator.compareMethodologies(
      fromMethodology,
      toMethodology,
    );
    const transitionWeeks = this.calculateTransitionWeeks(
      comparison.transitionDifficulty,
    );

    return {
      fromMethodology,
      toMethodology,
      transitionWeeks,
      keyChanges: this.identifyKeyChanges(fromMethodology, toMethodology),
      adaptationFocus: this.getAdaptationFocus(fromMethodology, toMethodology),
      gradualAdjustments: this.createWeeklyAdjustments(
        fromMethodology,
        toMethodology,
        transitionWeeks,
      ),
    };
  }

  /**
   * Calculate transition weeks needed
   */
  private calculateTransitionWeeks(
    difficulty: "easy" | "moderate" | "difficult",
  ): number {
    switch (difficulty) {
      case "easy":
        return 2;
      case "moderate":
        return 4;
      case "difficult":
        return 6;
      default:
        return 4;
    }
  }

  /**
   * Identify key changes in transition
   */
  private identifyKeyChanges(
    from: TrainingMethodology,
    to: TrainingMethodology,
  ): string[] {
    const changes: string[] = [];

    // Daniels to Lydiard
    if (from === "daniels" && to === "lydiard") {
      changes.push("Shift from pace-based to effort-based training");
      changes.push("Increase overall volume with more easy running");
      changes.push("Reduce structured interval work temporarily");
    }

    // Lydiard to Daniels
    if (from === "lydiard" && to === "daniels") {
      changes.push("Introduce precise pace zones and VDOT calculations");
      changes.push("Add structured quality sessions");
      changes.push("Maintain aerobic base while adding intensity");
    }

    // Daniels to Pfitzinger
    if (from === "daniels" && to === "pfitzinger") {
      changes.push("Add medium-long runs to weekly schedule");
      changes.push("Increase lactate threshold volume");
      changes.push("Shift from VDOT to LT-based pacing");
    }

    // Lydiard to Pfitzinger
    if (from === "lydiard" && to === "pfitzinger") {
      changes.push("Add structured threshold workouts");
      changes.push("Introduce medium-long runs with quality");
      changes.push("Transition from pure aerobic to threshold focus");
    }

    return changes;
  }

  /**
   * Get adaptation focus areas
   */
  private getAdaptationFocus(
    from: TrainingMethodology,
    to: TrainingMethodology,
  ): string[] {
    const focus: string[] = [];

    if (to === "daniels") {
      focus.push("Learn and internalize pace zones");
      focus.push("Develop pacing discipline");
    }

    if (to === "lydiard") {
      focus.push("Build aerobic base patience");
      focus.push("Learn effort-based training");
    }

    if (to === "pfitzinger") {
      focus.push("Adapt to higher training volume");
      focus.push("Master lactate threshold pacing");
    }

    return focus;
  }

  /**
   * Create weekly adjustment plan
   */
  private createWeeklyAdjustments(
    from: TrainingMethodology,
    to: TrainingMethodology,
    weeks: number,
  ): WeeklyAdjustment[] {
    const adjustments: WeeklyAdjustment[] = [];

    for (let week = 1; week <= weeks; week++) {
      const progress = week / weeks;

      adjustments.push({
        week,
        focus: this.getWeeklyFocus(from, to, progress),
        changes: this.getWeeklyChanges(from, to, progress),
        targetMetrics: this.getWeeklyTargets(from, to, progress),
      });
    }

    return adjustments;
  }

  /**
   * Get focus for specific week in transition
   */
  private getWeeklyFocus(
    from: TrainingMethodology,
    to: TrainingMethodology,
    progress: number,
  ): string {
    if (progress <= 0.33) return "Foundation and adaptation";
    if (progress <= 0.67) return "Methodology integration";
    return "Full transition completion";
  }

  /**
   * Get specific changes for week
   */
  private getWeeklyChanges(
    from: TrainingMethodology,
    to: TrainingMethodology,
    progress: number,
  ): string[] {
    const changes: string[] = [];

    if (to === "daniels" && progress > 0.5) {
      changes.push("Add VDOT-based interval session");
    }

    if (to === "lydiard" && progress <= 0.5) {
      changes.push("Increase easy run duration by 10%");
    }

    return changes;
  }

  /**
   * Get weekly target metrics
   */
  private getWeeklyTargets(
    from: TrainingMethodology,
    to: TrainingMethodology,
    progress: number,
  ): Record<string, number> {
    const fromProfile = this.comparator.getMethodologyProfile(from)!;
    const toProfile = this.comparator.getMethodologyProfile(to)!;

    // Interpolate intensity distribution
    const easyPercent =
      fromProfile.intensityDistribution.easy +
      (toProfile.intensityDistribution.easy -
        fromProfile.intensityDistribution.easy) *
        progress;

    return {
      easyRunningPercent: Math.round(easyPercent),
      weeklyHours: 8, // Example target
      qualitySessions: Math.round(2 * progress),
    };
  }

  /**
   * Generate warnings for recommendation
   */
  private generateWarnings(
    userProfile: UserProfile,
    recommendation: MethodologyRecommendation,
  ): string[] {
    const warnings: string[] = [];

    // Beginner warnings
    if (
      userProfile.experience === "beginner" &&
      recommendation.methodology === "pfitzinger"
    ) {
      warnings.push(
        "This methodology requires significant running base - consider building up gradually",
      );
    }

    // Time constraint warnings
    if (
      userProfile.timeAvailability < 5 &&
      recommendation.methodology === "lydiard"
    ) {
      warnings.push(
        "Limited time may require significant modifications to volume-based approach",
      );
    }

    // Injury history warnings
    if (
      userProfile.injuryHistory &&
      userProfile.injuryHistory.length > 3 &&
      recommendation.methodology === "pfitzinger"
    ) {
      warnings.push(
        "High volume training may increase injury risk - monitor carefully",
      );
    }

    return warnings;
  }

  /**
   * Create recommendation quiz
   */
  public createRecommendationQuiz(): RecommendationQuiz {
    const questions: QuizQuestion[] = [
      {
        id: "experience",
        question: "How long have you been running consistently?",
        type: "single",
        options: [
          { value: "beginner", label: "Less than 1 year" },
          { value: "novice", label: "1-2 years" },
          { value: "intermediate", label: "2-5 years" },
          { value: "advanced", label: "5-10 years" },
          { value: "expert", label: "More than 10 years" },
        ],
      },
      {
        id: "goal",
        question: "What is your primary running goal?",
        type: "single",
        options: [
          { value: "FIRST_5K", label: "Complete my first 5K" },
          { value: "IMPROVE_5K", label: "Improve my 5K time" },
          { value: "FIRST_10K", label: "Complete my first 10K" },
          { value: "HALF_MARATHON", label: "Run a half marathon" },
          { value: "MARATHON", label: "Run a marathon" },
          { value: "ULTRA", label: "Run an ultra marathon" },
          { value: "GENERAL_FITNESS", label: "General fitness and health" },
        ],
      },
      {
        id: "timeAvailability",
        question: "How many hours per week can you dedicate to running?",
        type: "single",
        options: [
          { value: "3", label: "Less than 3 hours" },
          { value: "5", label: "3-5 hours" },
          { value: "7", label: "5-7 hours" },
          { value: "10", label: "7-10 hours" },
          { value: "15", label: "More than 10 hours" },
        ],
      },
      {
        id: "approach",
        question: "What training approach appeals to you most?",
        type: "single",
        options: [
          { value: "scientific", label: "Data-driven with precise pacing" },
          { value: "intuitive", label: "Feel-based and flexible" },
          { value: "structured", label: "Strict plan adherence" },
          { value: "flexible", label: "Adaptable to daily life" },
        ],
      },
      {
        id: "motivations",
        question: "What motivates you to run? (Select all that apply)",
        type: "multiple",
        options: [
          { value: "finish_first_race", label: "Finish my first race" },
          { value: "improve_times", label: "Improve my race times" },
          { value: "qualify_boston", label: "Qualify for Boston Marathon" },
          { value: "stay_healthy", label: "Stay healthy and fit" },
          { value: "lose_weight", label: "Lose weight" },
          { value: "social_aspect", label: "Social connections" },
          { value: "compete", label: "Compete and win" },
          { value: "mental_health", label: "Mental health benefits" },
          { value: "longevity", label: "Long-term health" },
        ],
      },
      {
        id: "currentMileage",
        question: "What is your current weekly mileage?",
        type: "single",
        options: [
          { value: "10", label: "Less than 10 miles" },
          { value: "20", label: "10-20 miles" },
          { value: "30", label: "20-30 miles" },
          { value: "40", label: "30-40 miles" },
          { value: "50", label: "More than 40 miles" },
        ],
      },
      {
        id: "injuries",
        question: "How many running injuries have you had in the past 2 years?",
        type: "single",
        options: [
          { value: "0", label: "None" },
          { value: "1", label: "1 injury" },
          { value: "2", label: "2 injuries" },
          { value: "3", label: "3 or more injuries" },
        ],
      },
      {
        id: "strengths",
        question: "What are your running strengths? (Select up to 3)",
        type: "multiple",
        options: [
          { value: "speed", label: "Natural speed" },
          { value: "endurance", label: "Long distance endurance" },
          { value: "consistency", label: "Consistent training" },
          { value: "mental_toughness", label: "Mental toughness" },
          { value: "recovery", label: "Quick recovery" },
          { value: "injury_resistance", label: "Rarely get injured" },
          { value: "hill_running", label: "Strong on hills" },
        ],
      },
    ];

    return {
      questions,
      scoringLogic: (answers) => this.scoreQuizAnswers(answers),
    };
  }

  /**
   * Score quiz answers to create user profile
   */
  private scoreQuizAnswers(answers: QuizAnswer[]): UserProfile {
    const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));

    const experience =
      (answerMap.get("experience") as RunnerExperience) || "intermediate";
    const goal = (answerMap.get("goal") as TrainingGoal) || "GENERAL_FITNESS";
    const timeAvailability = parseInt(
      (answerMap.get("timeAvailability") as string) || "7",
    );
    const approach =
      (answerMap.get("approach") as TrainingApproach) || "flexible";
    const motivations =
      (answerMap.get("motivations") as RunnerMotivation[]) || [];
    const currentMileage = parseInt(
      (answerMap.get("currentMileage") as string) || "20",
    );
    const injuryCount = parseInt((answerMap.get("injuries") as string) || "0");
    const strengths = (answerMap.get("strengths") as RunnerAttribute[]) || [];

    // Create injury history based on count
    const injuryHistory: string[] = [];
    for (let i = 0; i < injuryCount; i++) {
      injuryHistory.push(`Previous injury ${i + 1}`);
    }

    // Estimate VDOT based on experience and goals
    let estimatedVDOT = 45;
    if (experience === "intermediate") estimatedVDOT = 48;
    if (experience === "advanced") estimatedVDOT = 52;
    if (experience === "expert") estimatedVDOT = 55;
    if (motivations.includes("qualify_boston")) estimatedVDOT += 3;

    return {
      experience,
      currentFitness: {
        vdot: estimatedVDOT,
        weeklyMileage: currentMileage,
        longestRecentRun: Math.round(currentMileage * 0.4),
        trainingAge:
          experience === "beginner"
            ? 0.5
            : experience === "novice"
              ? 1.5
              : experience === "intermediate"
                ? 3.5
                : experience === "advanced"
                  ? 7
                  : 12,
        overallScore: estimatedVDOT || currentMileage * 1.5 || 40,
      },
      trainingPreferences: {
        availableDays: [0, 1, 2, 3, 4, 5, 6], // Default to all days
        preferredIntensity: motivations.includes("compete")
          ? "high"
          : motivations.includes("stay_healthy")
            ? "low"
            : "moderate",
        crossTraining: false,
        strengthTraining: strengths.includes("injury_resistance"),
      },
      primaryGoal: goal,
      motivations,
      injuryHistory,
      timeAvailability,
      strengthsAndWeaknesses: {
        strengths,
        weaknesses: [], // Would need additional questions to determine
      },
      preferredApproach: approach,
    };
  }
}
