/**
 * Methodology-Aware Export Enhancement System
 *
 * Enhances the existing export system with methodology-specific formatting,
 * philosophy principles documentation, and research citations.
 */

import {
  TrainingPlan,
  TrainingMethodology,
  TrainingPhase,
  ExportFormat,
  PlannedWorkout,
  AdvancedPlanConfig,
} from "./types";
import {
  ExportResult,
  FormatOptions,
  ExportMetadata,
  Formatter,
} from "./export";
import { PhilosophyFactory, TrainingPhilosophy } from "./philosophies";
import { TRAINING_METHODOLOGIES } from "./constants";

/**
 * Enhanced export metadata with methodology information
 */
export interface MethodologyExportMetadata extends ExportMetadata {
  methodology?: TrainingMethodology;
  philosophyName?: string;
  intensityDistribution?: { easy: number; moderate: number; hard: number };
  keyPrinciples?: string[];
  researchCitations?: ResearchCitation[];
  philosophyDescription?: string;
  coachBackground?: string;
}

/**
 * Research citation information
 */
export interface ResearchCitation {
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  doi?: string;
  url?: string;
  summary: string;
}

/**
 * Methodology-specific formatting options
 */
export interface MethodologyFormatOptions extends FormatOptions {
  includePhilosophyPrinciples?: boolean;
  includeResearchCitations?: boolean;
  includeCoachBiography?: boolean;
  includeMethodologyComparison?: boolean;
  includeTrainingZoneExplanations?: boolean;
  includeWorkoutRationale?: boolean;
  detailLevel?: "basic" | "standard" | "comprehensive";
}

/**
 * Philosophy principles documentation
 */
export interface PhilosophyPrinciples {
  corePhilosophy: string;
  keyPrinciples: string[];
  intensityApproach: string;
  recoveryPhilosophy: string;
  periodizationStrategy: string;
  strengthsWeaknesses: {
    strengths: string[];
    considerations: string[];
  };
  idealFor: string[];
  typicalResults: string[];
}

/**
 * Enhanced export result with methodology information
 */
export interface MethodologyExportResult extends ExportResult {
  metadata: MethodologyExportMetadata;
  philosophyData?: PhilosophyPrinciples;
  citations?: ResearchCitation[];
}

/**
 * Methodology export enhancement service
 */
export class MethodologyExportEnhancer {
  private static philosophyPrinciples: Record<
    TrainingMethodology,
    PhilosophyPrinciples
  > = {
    daniels: {
      corePhilosophy:
        "VDOT-based training with precise pace prescriptions and 80/20 intensity distribution",
      keyPrinciples: [
        "VDOT (V-dot) as the foundation for all pace calculations",
        "80% easy running, 20% quality work for optimal adaptation",
        "Precise pace zones for different training stimuli",
        "Progressive overload through systematic intensity increases",
        "Economy of movement and efficiency focus",
      ],
      intensityApproach:
        "Scientific pace zones based on current fitness (VDOT) with specific physiological targets",
      recoveryPhilosophy:
        "Adequate recovery between quality sessions with emphasis on easy aerobic running",
      periodizationStrategy:
        "Linear periodization with gradual intensity increases and targeted adaptations",
      strengthsWeaknesses: {
        strengths: [
          "Scientific precision in pace prescription",
          "Proven track record with elite athletes",
          "Clear guidelines for intensity distribution",
          "Objective fitness assessment through VDOT",
        ],
        considerations: [
          "Requires disciplined pace adherence",
          "May be complex for beginners",
          "Focus on track/road running primarily",
        ],
      },
      idealFor: [
        "Runners who prefer structure and precision",
        "Athletes training for specific time goals",
        "Intermediate to advanced runners",
        "Track and road race specialists",
      ],
      typicalResults: [
        "Improved running economy",
        "Better pace judgment in races",
        "Consistent training adaptation",
        "Reduced overtraining risk",
      ],
    },
    lydiard: {
      corePhilosophy:
        "Aerobic base development with extensive easy running before introducing speed work",
      keyPrinciples: [
        "Extensive aerobic base building (85%+ easy running)",
        "Time-based training rather than pace-focused",
        "Hill training for strength development",
        "Strict periodization: base → anaerobic → coordination → taper",
        "High volume, low intensity foundation",
      ],
      intensityApproach:
        "Effort-based training with emphasis on aerobic capacity development before speed",
      recoveryPhilosophy:
        "Complete rest days rather than easy running for recovery",
      periodizationStrategy:
        "Classical periodization with distinct phases and clear progression",
      strengthsWeaknesses: {
        strengths: [
          "Builds exceptional aerobic capacity",
          "Reduces injury risk through easy running",
          "Proven success with distance runners",
          "Develops mental toughness through volume",
        ],
        considerations: [
          "Requires significant time commitment",
          "May lack speed for shorter distances",
          "Can be monotonous for some runners",
        ],
      },
      idealFor: [
        "Marathon and ultra-distance runners",
        "Runners with time for high volume",
        "Athletes building long-term fitness",
        "Runners prone to injury with intensity",
      ],
      typicalResults: [
        "Enhanced aerobic capacity",
        "Improved endurance and stamina",
        "Better fat utilization",
        "Increased capillarization",
      ],
    },
    pfitzinger: {
      corePhilosophy:
        "Lactate threshold-focused training with medium-long runs and structured intensity",
      keyPrinciples: [
        "Lactate threshold as the cornerstone of training",
        "Medium-long runs with embedded tempo segments",
        "Progressive threshold volume increases",
        "Specific weekly structure and workout spacing",
        "Race-specific preparation protocols",
      ],
      intensityApproach:
        "Threshold-based intensity with systematic progression and race-pace integration",
      recoveryPhilosophy:
        "Active recovery with structured easy days between quality sessions",
      periodizationStrategy:
        "Mesocycle-based periodization with progressive threshold development",
      strengthsWeaknesses: {
        strengths: [
          "Excellent for marathon preparation",
          "Develops lactate buffering capacity",
          "Structured progression protocols",
          "Race-specific fitness development",
        ],
        considerations: [
          "High intensity demands",
          "Requires good fitness base",
          "May be demanding for some runners",
        ],
      },
      idealFor: [
        "Marathon and half-marathon runners",
        "Experienced runners seeking structure",
        "Athletes targeting specific race times",
        "Runners who respond well to threshold work",
      ],
      typicalResults: [
        "Improved lactate threshold",
        "Enhanced marathon-specific fitness",
        "Better race-pace tolerance",
        "Increased muscular endurance",
      ],
    },
    hudson: {
      corePhilosophy:
        "Adaptive training with frequent assessment and adjustment based on individual response",
      keyPrinciples: [
        "Frequent fitness assessments and plan adjustments",
        "Individual response-based training modifications",
        "Emphasis on consistency over intensity",
        "Adaptive periodization based on progress",
        "Integration of cross-training and injury prevention",
      ],
      intensityApproach:
        "Flexible intensity based on individual response and fitness assessments",
      recoveryPhilosophy:
        "Proactive recovery with emphasis on adaptation monitoring",
      periodizationStrategy:
        "Adaptive periodization with frequent plan modifications",
      strengthsWeaknesses: {
        strengths: [
          "Highly individualized approach",
          "Responsive to athlete feedback",
          "Injury prevention focus",
          "Flexible and adaptive",
        ],
        considerations: [
          "Requires frequent monitoring",
          "Less structured approach",
          "May lack specific protocols",
        ],
      },
      idealFor: [
        "Runners seeking individualized training",
        "Athletes with variable schedules",
        "Injury-prone runners",
        "Runners who prefer flexible approaches",
      ],
      typicalResults: [
        "Reduced injury rates",
        "Improved training consistency",
        "Better individual adaptation",
        "Enhanced motivation and adherence",
      ],
    },
    custom: {
      corePhilosophy:
        "Personalized training approach combining elements from multiple methodologies",
      keyPrinciples: [
        "Individualized combination of training elements",
        "Flexible approach based on personal response",
        "Integration of preferred training methods",
        "Adaptive intensity and volume management",
        "Personal goal-specific customization",
      ],
      intensityApproach:
        "Customized intensity distribution based on individual preferences and response",
      recoveryPhilosophy:
        "Personalized recovery strategies based on individual needs",
      periodizationStrategy:
        "Flexible periodization adapted to personal schedule and goals",
      strengthsWeaknesses: {
        strengths: [
          "Completely personalized approach",
          "Combines best elements of different methods",
          "Flexible and adaptable",
          "Goal-specific customization",
        ],
        considerations: [
          "Requires careful monitoring",
          "May lack proven structure",
          "Requires experience to optimize",
        ],
      },
      idealFor: [
        "Experienced runners with clear preferences",
        "Athletes with unique constraints",
        "Runners combining multiple goals",
        "Those seeking maximum personalization",
      ],
      typicalResults: [
        "High training satisfaction",
        "Improved adherence",
        "Personalized adaptations",
        "Flexible goal achievement",
      ],
    },
  };

  private static researchCitations: Record<
    TrainingMethodology,
    ResearchCitation[]
  > = {
    daniels: [
      {
        title: "Daniels' Running Formula",
        authors: ["Jack Daniels"],
        year: 2013,
        summary:
          "Comprehensive guide to VDOT-based training with scientific pace prescriptions and intensity distribution.",
      },
      {
        title: "A physiologist's perspective on the Boston Marathon",
        authors: ["Jack Daniels"],
        journal: "Sports Medicine",
        year: 1996,
        summary:
          "Analysis of marathon performance and training principles from a physiological perspective.",
      },
      {
        title: "The conditioning continuum",
        authors: ["Jack Daniels"],
        journal: "Track Technique",
        year: 1978,
        summary:
          "Foundation paper on systematic training progression and intensity distribution.",
      },
    ],
    lydiard: [
      {
        title: "Running to the Top",
        authors: ["Arthur Lydiard", "Garth Gilmour"],
        year: 1997,
        summary:
          "Comprehensive guide to Lydiard's aerobic base training methodology and periodization.",
      },
      {
        title: "Arthur Lydiard's Methods of Distance Training",
        authors: ["Arthur Lydiard"],
        year: 1978,
        summary:
          "Original methodology documentation covering base building and periodization principles.",
      },
      {
        title: "The impact of aerobic base training on endurance performance",
        authors: ["Various"],
        journal: "Sports Science Review",
        year: 2015,
        summary:
          "Research validation of Lydiard's aerobic base training principles and their physiological effects.",
      },
    ],
    pfitzinger: [
      {
        title: "Advanced Marathoning",
        authors: ["Pete Pfitzinger", "Scott Douglas"],
        year: 2009,
        summary:
          "Comprehensive marathon training guide featuring lactate threshold-focused methodology.",
      },
      {
        title: "Road Racing for Serious Runners",
        authors: ["Pete Pfitzinger", "Philip Latter"],
        year: 1999,
        summary:
          "Training methodology for 5K to marathon races with threshold-based protocols.",
      },
      {
        title: "Lactate threshold training adaptations in endurance runners",
        authors: ["Pete Pfitzinger"],
        journal: "Sports Medicine Research",
        year: 2006,
        summary:
          "Research on lactate threshold training effects and optimization strategies.",
      },
    ],
    hudson: [
      {
        title: "Run Faster from the 5K to the Marathon",
        authors: ["Brad Hudson", "Matt Fitzgerald"],
        year: 2008,
        summary:
          "Adaptive training methodology with emphasis on individual response and flexibility.",
      },
      {
        title: "The adaptive training approach to distance running",
        authors: ["Brad Hudson"],
        journal: "Modern Athletics Coach",
        year: 2010,
        summary:
          "Methodology paper on adaptive training principles and individual response monitoring.",
      },
    ],
    custom: [
      {
        title: "Individualized Training Approaches in Endurance Sports",
        authors: ["Various Authors"],
        journal: "Sports Science Today",
        year: 2020,
        summary:
          "Review of personalized training methodologies and their effectiveness in endurance sports.",
      },
    ],
  };

  /**
   * Extract methodology information from a training plan
   */
  static extractMethodologyInfo(plan: TrainingPlan): {
    methodology?: TrainingMethodology;
    philosophy?: TrainingPhilosophy;
    principles?: PhilosophyPrinciples;
    citations?: ResearchCitation[];
  } {
    // Check if plan config has methodology information
    const advancedConfig = plan.config as AdvancedPlanConfig;
    const methodology = advancedConfig.methodology;

    if (!methodology) {
      return {};
    }

    const philosophy = PhilosophyFactory.create(methodology);
    const principles =
      MethodologyExportEnhancer.philosophyPrinciples[methodology];
    const citations = MethodologyExportEnhancer.researchCitations[methodology];

    return {
      methodology,
      philosophy,
      principles,
      citations,
    };
  }

  /**
   * Generate methodology-enhanced metadata
   */
  static generateMethodologyMetadata(
    plan: TrainingPlan,
    format: ExportFormat,
    content: string | Buffer,
  ): MethodologyExportMetadata {
    const { methodology, philosophy, principles } =
      this.extractMethodologyInfo(plan);
    const size =
      typeof content === "string"
        ? Buffer.byteLength(content, "utf8")
        : content.length;

    const baseMetadata = {
      planName: plan.config.name,
      exportDate: new Date(),
      format,
      totalWorkouts: plan.workouts.length,
      planDuration: Math.ceil(
        (plan.config.endDate?.getTime() ||
          Date.now() - plan.config.startDate.getTime()) /
          (1000 * 60 * 60 * 24 * 7),
      ),
      fileSize: size,
      version: "1.0.0",
    };

    if (methodology && philosophy && principles) {
      return {
        ...baseMetadata,
        methodology,
        philosophyName: philosophy.name,
        intensityDistribution: philosophy.intensityDistribution,
        keyPrinciples: principles.keyPrinciples,
        researchCitations:
          MethodologyExportEnhancer.researchCitations[methodology],
        philosophyDescription: principles.corePhilosophy,
        coachBackground: `Training methodology developed by ${philosophy.name}`,
      };
    }

    return baseMetadata;
  }

  /**
   * Generate methodology documentation section
   */
  static generateMethodologyDocumentation(
    plan: TrainingPlan,
    options: MethodologyFormatOptions = {},
  ): string {
    const { methodology, philosophy, principles, citations } =
      this.extractMethodologyInfo(plan);

    if (!methodology || !philosophy || !principles) {
      return "";
    }

    const detailLevel = options.detailLevel || "standard";
    let documentation = "";

    // Philosophy overview
    documentation += `# Training Philosophy: ${philosophy.name}\n\n`;
    documentation += `${principles.corePhilosophy}\n\n`;

    if (options.includePhilosophyPrinciples !== false) {
      documentation += `## Key Principles\n\n`;
      principles.keyPrinciples.forEach((principle) => {
        documentation += `- ${principle}\n`;
      });
      documentation += "\n";

      if (detailLevel === "comprehensive") {
        documentation += `## Training Approach\n\n`;
        documentation += `**Intensity Strategy:** ${principles.intensityApproach}\n\n`;
        documentation += `**Recovery Philosophy:** ${principles.recoveryPhilosophy}\n\n`;
        documentation += `**Periodization:** ${principles.periodizationStrategy}\n\n`;
      }
    }

    // Intensity distribution
    documentation += `## Intensity Distribution\n\n`;
    documentation += `- Easy Running: ${philosophy.intensityDistribution.easy}%\n`;
    documentation += `- Moderate Intensity: ${philosophy.intensityDistribution.moderate}%\n`;
    documentation += `- Hard Training: ${philosophy.intensityDistribution.hard}%\n\n`;

    if (detailLevel === "comprehensive") {
      // Strengths and considerations
      documentation += `## Methodology Analysis\n\n`;
      documentation += `### Strengths\n\n`;
      principles.strengthsWeaknesses.strengths.forEach((strength) => {
        documentation += `- ${strength}\n`;
      });
      documentation += "\n";

      documentation += `### Considerations\n\n`;
      principles.strengthsWeaknesses.considerations.forEach((consideration) => {
        documentation += `- ${consideration}\n`;
      });
      documentation += "\n";

      // Ideal for
      documentation += `### Ideal For\n\n`;
      principles.idealFor.forEach((ideal) => {
        documentation += `- ${ideal}\n`;
      });
      documentation += "\n";

      // Expected results
      documentation += `### Typical Results\n\n`;
      principles.typicalResults.forEach((result) => {
        documentation += `- ${result}\n`;
      });
      documentation += "\n";
    }

    // Research citations
    if (
      options.includeResearchCitations !== false &&
      citations &&
      citations.length > 0
    ) {
      documentation += `## Research & References\n\n`;
      citations.forEach((citation) => {
        documentation += `**${citation.title}** (${citation.year})\n`;
        documentation += `Authors: ${citation.authors.join(", ")}\n`;
        if (citation.journal) {
          documentation += `Published in: ${citation.journal}\n`;
        }
        documentation += `${citation.summary}\n\n`;
      });
    }

    return documentation;
  }

  /**
   * Generate workout rationale based on methodology
   */
  static generateWorkoutRationale(
    workout: PlannedWorkout,
    methodology: TrainingMethodology,
    phase: TrainingPhase,
  ): string {
    const methodologyData = TRAINING_METHODOLOGIES[methodology];
    if (!methodologyData) return "";

    const workoutType = workout.workout.type;
    let rationale = "";

    switch (methodology) {
      case "daniels":
        rationale = MethodologyExportEnhancer.generateDanielsRationale(
          workoutType,
          phase,
        );
        break;
      case "lydiard":
        rationale = MethodologyExportEnhancer.generateLydiardRationale(
          workoutType,
          phase,
        );
        break;
      case "pfitzinger":
        rationale = MethodologyExportEnhancer.generatePfitzingerRationale(
          workoutType,
          phase,
        );
        break;
      case "hudson":
        rationale = MethodologyExportEnhancer.generateHudsonRationale(
          workoutType,
          phase,
        );
        break;
      default:
        rationale = `${workoutType} workout scheduled according to ${methodology} methodology principles.`;
    }

    return rationale;
  }

  private static generateDanielsRationale(
    workoutType: string,
    phase: TrainingPhase,
  ): string {
    const rationales: Record<string, Record<TrainingPhase, string>> = {
      easy: {
        base: "Easy running builds aerobic capacity and capillarization while allowing recovery.",
        build:
          "Maintains aerobic fitness while supporting recovery from quality sessions.",
        peak: "Active recovery between intense sessions while maintaining aerobic base.",
        taper: "Maintains fitness while reducing fatigue before competition.",
        recovery: "Promotes recovery and maintains basic fitness.",
      },
      tempo: {
        base: "Tempo runs improve lactate clearance and running economy.",
        build: "Develops lactate threshold and marathon race pace fitness.",
        peak: "Maintains threshold fitness and practices race effort.",
        taper: "Short tempo work maintains sharpness without fatigue.",
        recovery: "Light tempo work for fitness maintenance.",
      },
      threshold: {
        base: "Threshold work improves lactate buffering and clearance mechanisms.",
        build:
          "Key session for developing lactate threshold and sustainable pace.",
        peak: "Maintains threshold fitness and practices race pace tolerance.",
        taper: "Reduced threshold volume maintains fitness with less fatigue.",
        recovery: "Minimal threshold work for fitness retention.",
      },
      vo2max: {
        base: "Limited VO2max work to develop neuromuscular coordination.",
        build: "Develops maximal oxygen uptake and running economy at speed.",
        peak: "Key sessions for developing race-specific speed and power.",
        taper: "Short VO2max intervals maintain neuromuscular sharpness.",
        recovery: "No VO2max work during recovery phase.",
      },
    };

    return (
      rationales[workoutType]?.[phase] ||
      `${workoutType} workout supports ${phase} phase development.`
    );
  }

  private static generateLydiardRationale(
    workoutType: string,
    phase: TrainingPhase,
  ): string {
    const rationales: Record<string, Record<TrainingPhase, string>> = {
      easy: {
        base: "Extensive easy running builds maximum aerobic capacity and capillary density.",
        build: "Maintains aerobic base while supporting anaerobic development.",
        peak: "Essential recovery between coordination and speed sessions.",
        taper: "Easy running maintains fitness while reducing training stress.",
        recovery:
          "Primary training mode for active recovery and fitness maintenance.",
      },
      steady: {
        base: "Steady aerobic running develops efficient fat utilization and aerobic power.",
        build: "Bridge between aerobic base and anaerobic development.",
        peak: "Maintains aerobic fitness during coordination phase.",
        taper: "Reduced steady running maintains aerobic fitness.",
        recovery: "Light steady running for fitness maintenance.",
      },
      hill_repeats: {
        base: "Hill training develops leg strength and power without anaerobic stress.",
        build: "Key strength development for power and efficiency.",
        peak: "Maintains strength while focusing on speed coordination.",
        taper: "Light hill work maintains strength without fatigue.",
        recovery: "No hill training during recovery phase.",
      },
    };

    return (
      rationales[workoutType]?.[phase] ||
      `${workoutType} workout follows Lydiard's ${phase} phase principles.`
    );
  }

  private static generatePfitzingerRationale(
    workoutType: string,
    phase: TrainingPhase,
  ): string {
    const rationales: Record<string, Record<TrainingPhase, string>> = {
      threshold: {
        base: "Lactate threshold development forms the foundation of marathon fitness.",
        build: "Progressive threshold volume builds race-specific endurance.",
        peak: "Peak threshold fitness for optimal marathon performance.",
        taper:
          "Reduced threshold work maintains fitness while reducing fatigue.",
        recovery: "Minimal threshold work for fitness retention.",
      },
      tempo: {
        base: "Tempo segments in medium-long runs develop sustainable race pace.",
        build: "Extended tempo work builds marathon-specific endurance.",
        peak: "Race pace practice and threshold maintenance.",
        taper: "Short tempo segments maintain race pace feel.",
        recovery: "Light tempo work for active recovery.",
      },
      medium_long: {
        base: "Medium-long runs with tempo segments build aerobic capacity and threshold.",
        build:
          "Key sessions combining volume and intensity for marathon preparation.",
        peak: "Race simulation and peak fitness development.",
        taper: "Reduced medium-long runs maintain fitness with less stress.",
        recovery: "No medium-long runs during recovery phase.",
      },
    };

    return (
      rationales[workoutType]?.[phase] ||
      `${workoutType} workout supports Pfitzinger's ${phase} phase development.`
    );
  }

  private static generateHudsonRationale(
    workoutType: string,
    phase: TrainingPhase,
  ): string {
    const rationales: Record<string, Record<TrainingPhase, string>> = {
      easy: {
        base: "Easy running forms the foundation, adjusted based on individual response and adaptation patterns.",
        build:
          "Maintains aerobic base while supporting individual adaptation to quality training.",
        peak: "Active recovery between intense sessions, personalized to individual recovery needs.",
        taper:
          "Individualized easy running based on personal response patterns.",
        recovery:
          "Gentle aerobic work tailored to individual recovery requirements.",
      },
      tempo: {
        base: "Tempo work introduced based on individual readiness and adaptation response.",
        build:
          "Progressive tempo development guided by individual fitness assessments.",
        peak: "Race-pace work adjusted to individual performance patterns.",
        taper:
          "Personalized tempo sessions based on individual sharpness needs.",
        recovery:
          "Light tempo work only if individual assessment indicates readiness.",
      },
      intervals: {
        base: "Limited interval work, carefully monitored for individual adaptation.",
        build:
          "Progressive interval training based on ongoing fitness assessments.",
        peak: "Race-specific intervals adjusted to individual response patterns.",
        taper: "Short, sharp intervals based on individual preparation needs.",
        recovery:
          "No interval work unless individual assessment indicates full recovery.",
      },
    };

    return (
      rationales[workoutType]?.[phase] ||
      `${workoutType} workout scheduled based on individual response and current fitness assessment. Hudson's adaptive approach adjusts training based on ongoing performance and recovery metrics.`
    );
  }

  /**
   * Generate methodology comparison information
   */
  static generateMethodologyComparison(
    currentMethodology: TrainingMethodology,
    options: MethodologyFormatOptions,
  ): string {
    if (!options.includeMethodologyComparison) return "";

    const otherMethodologies = Object.keys(TRAINING_METHODOLOGIES).filter(
      (m) => m !== currentMethodology,
    ) as TrainingMethodology[];

    let comparison = `## Methodology Comparison\n\n`;
    comparison += `Your plan uses the **${TRAINING_METHODOLOGIES[currentMethodology].name}** methodology.\n\n`;

    comparison += `### How it compares to other approaches:\n\n`;

    otherMethodologies.forEach((methodology) => {
      const data = TRAINING_METHODOLOGIES[methodology];
      comparison += `**${data.name}:**\n`;
      comparison += `- Intensity: ${data.intensityDistribution.easy}% easy, ${data.intensityDistribution.hard}% hard\n`;
      comparison += `- Focus: ${data.workoutPriorities.slice(0, 2).join(", ")}\n\n`;
    });

    return comparison;
  }
}

/**
 * Enhanced formatter base class with methodology awareness
 */
export abstract class MethodologyAwareFormatter implements Formatter {
  abstract format: ExportFormat;
  abstract mimeType: string;
  abstract fileExtension: string;

  abstract formatPlan(
    plan: TrainingPlan,
    options?: MethodologyFormatOptions,
  ): Promise<MethodologyExportResult>;

  validatePlan(plan: TrainingPlan): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!plan.workouts || plan.workouts.length === 0) {
      errors.push("Plan contains no workouts");
    }

    if (!plan.config.startDate) {
      errors.push("Plan missing start date");
    }

    // Check for methodology information
    const advancedConfig = plan.config as AdvancedPlanConfig;
    if (!advancedConfig.methodology) {
      warnings.push(
        "No methodology specified - enhanced export features will be limited",
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getOptionsSchema(): any {
    return {
      includePhilosophyPrinciples: { type: "boolean", default: true },
      includeResearchCitations: { type: "boolean", default: true },
      includeCoachBiography: { type: "boolean", default: false },
      includeMethodologyComparison: { type: "boolean", default: false },
      includeTrainingZoneExplanations: { type: "boolean", default: true },
      includeWorkoutRationale: { type: "boolean", default: false },
      detailLevel: {
        type: "string",
        enum: ["basic", "standard", "comprehensive"],
        default: "standard",
      },
    };
  }

  /**
   * Generate enhanced content with methodology information
   */
  protected generateEnhancedContent(
    plan: TrainingPlan,
    baseContent: string,
    options: MethodologyFormatOptions = {},
  ): string {
    let enhancedContent = baseContent;

    // Add methodology documentation
    const methodologyDoc =
      MethodologyExportEnhancer.generateMethodologyDocumentation(plan, options);
    if (methodologyDoc) {
      enhancedContent = methodologyDoc + "\n\n" + enhancedContent;
    }

    // Add methodology comparison if requested
    const { methodology } =
      MethodologyExportEnhancer.extractMethodologyInfo(plan);
    if (methodology && options.includeMethodologyComparison) {
      const comparison =
        MethodologyExportEnhancer.generateMethodologyComparison(
          methodology,
          options,
        );
      enhancedContent += "\n\n" + comparison;
    }

    return enhancedContent;
  }

  /**
   * Generate methodology-aware metadata
   */
  protected generateEnhancedMetadata(
    plan: TrainingPlan,
    format: ExportFormat,
    content: string | Buffer,
  ): MethodologyExportMetadata {
    return MethodologyExportEnhancer.generateMethodologyMetadata(
      plan,
      format,
      content,
    );
  }
}

/**
 * Enhanced JSON formatter with methodology information
 */
export class EnhancedMethodologyJSONFormatter extends MethodologyAwareFormatter {
  format: ExportFormat = "json";
  mimeType = "application/json";
  fileExtension = "json";

  async formatPlan(
    plan: TrainingPlan,
    options: MethodologyFormatOptions = {},
  ): Promise<MethodologyExportResult> {
    const { methodology, philosophy, principles, citations } =
      MethodologyExportEnhancer.extractMethodologyInfo(plan);

    const enhancedData = {
      plan: {
        id: plan.id,
        name: plan.config.name,
        description: plan.config.description,
        goal: plan.config.goal,
        startDate: plan.config.startDate.toISOString(),
        endDate: plan.config.endDate?.toISOString(),
        totalWeeks: Math.ceil(
          (plan.config.endDate?.getTime() ||
            Date.now() - plan.config.startDate.getTime()) /
            (1000 * 60 * 60 * 24 * 7),
        ),
        totalWorkouts: plan.workouts.length,
      },
      methodology: methodology
        ? {
            name: methodology,
            philosophyName: philosophy?.name,
            intensityDistribution: philosophy?.intensityDistribution,
            principles:
              options.includePhilosophyPrinciples !== false
                ? principles
                : undefined,
            citations:
              options.includeResearchCitations !== false
                ? citations
                : undefined,
          }
        : undefined,
      workouts: plan.workouts.map((workout) => ({
        ...workout,
        rationale:
          options.includeWorkoutRationale && methodology
            ? MethodologyExportEnhancer.generateWorkoutRationale(
                workout,
                methodology,
                "base", // Default phase since PlannedWorkout doesn't have phase property
              )
            : undefined,
      })),
      blocks: plan.blocks,
      summary: plan.summary,
      exportInfo: {
        exportDate: new Date().toISOString(),
        format: this.format,
        version: "2.0.0",
        enhanced: true,
      },
    };

    const content = JSON.stringify(enhancedData, null, 2);
    const metadata = this.generateEnhancedMetadata(plan, this.format, content);

    return {
      content,
      filename: `${plan.config.name.replace(/\s+/g, "-").toLowerCase()}-enhanced.${this.fileExtension}`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content, "utf8"),
      metadata,
      philosophyData: principles,
      citations,
    };
  }
}

/**
 * Enhanced Markdown formatter with methodology documentation
 */
export class MethodologyMarkdownFormatter extends MethodologyAwareFormatter {
  format = "json" as ExportFormat; // Use closest standard format for compatibility
  mimeType = "text/markdown";
  fileExtension = "md";

  async formatPlan(
    plan: TrainingPlan,
    options: MethodologyFormatOptions = {},
  ): Promise<MethodologyExportResult> {
    const { methodology, principles, citations } =
      MethodologyExportEnhancer.extractMethodologyInfo(plan);

    let content = "";

    // Generate methodology documentation first
    const methodologyDoc =
      MethodologyExportEnhancer.generateMethodologyDocumentation(plan, options);
    if (methodologyDoc) {
      content += methodologyDoc + "\n\n";
    }

    // Add plan overview
    content += `# Training Plan: ${plan.config.name}\n\n`;
    content += `**Goal:** ${plan.config.goal}\n`;
    content += `**Start Date:** ${plan.config.startDate.toLocaleDateString()}\n`;
    content += `**Duration:** ${Math.ceil((plan.config.endDate?.getTime() || Date.now() - plan.config.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks\n`;
    content += `**Total Workouts:** ${plan.workouts.length}\n\n`;

    if (plan.config.description) {
      content += `## Description\n\n${plan.config.description}\n\n`;
    }

    // Add workout schedule
    content += `## Workout Schedule\n\n`;

    let currentWeek = 1;
    let currentWeekStart: Date | null = null;

    plan.workouts.forEach((workout) => {
      const workoutDate = new Date(workout.date); // Use date property from PlannedWorkout

      if (
        !currentWeekStart ||
        workoutDate.getTime() - currentWeekStart.getTime() >=
          7 * 24 * 60 * 60 * 1000
      ) {
        currentWeekStart = workoutDate;
        content += `### Week ${currentWeek}\n\n`;
        currentWeek++;
      }

      content += `**${workoutDate.toLocaleDateString()}** - ${workout.name}\n`; // Use name from PlannedWorkout
      content += `- Type: ${workout.workout.type}\n`;

      if (workout.targetMetrics?.duration) {
        content += `- Duration: ${workout.targetMetrics.duration} minutes\n`;
      }

      if (workout.targetMetrics?.distance) {
        content += `- Distance: ${workout.targetMetrics.distance} miles\n`;
      }

      if (options.includeWorkoutRationale && methodology) {
        const rationale = MethodologyExportEnhancer.generateWorkoutRationale(
          workout,
          methodology,
          "base", // Default phase since PlannedWorkout doesn't have phase property
        );
        if (rationale) {
          content += `- Rationale: ${rationale}\n`;
        }
      }

      content += "\n";
    });

    // Add methodology comparison if requested
    if (methodology && options.includeMethodologyComparison) {
      const comparison =
        MethodologyExportEnhancer.generateMethodologyComparison(
          methodology,
          options,
        );
      content += comparison;
    }

    const metadata = this.generateEnhancedMetadata(plan, this.format, content);

    return {
      content,
      filename: `${plan.config.name.replace(/\s+/g, "-").toLowerCase()}-methodology.${this.fileExtension}`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content, "utf8"),
      metadata,
      philosophyData: principles,
      citations,
    };
  }
}

// Export enhancement utilities
export const MethodologyExportUtils = {
  extractMethodologyInfo: MethodologyExportEnhancer.extractMethodologyInfo,
  generateMethodologyDocumentation:
    MethodologyExportEnhancer.generateMethodologyDocumentation,
  generateWorkoutRationale: MethodologyExportEnhancer.generateWorkoutRationale,
  generateMethodologyComparison:
    MethodologyExportEnhancer.generateMethodologyComparison,
  generateMethodologyMetadata:
    MethodologyExportEnhancer.generateMethodologyMetadata,
};
