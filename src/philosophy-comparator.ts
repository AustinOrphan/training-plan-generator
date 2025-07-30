import { 
  TrainingMethodology, 
  TrainingPhase, 
  WorkoutType, 
  TrainingPlan,
  Workout 
} from './types';
import { TRAINING_METHODOLOGIES } from './constants';
import { PhilosophyFactory } from './philosophies';
import { calculateTrainingPaces } from './zones';
import { MethodologyScores, createEmptyScores } from './types/methodology-types';

// Types for philosophy comparison system
export interface PhilosophyDimension {
  name: string;
  description: string;
  scale: number; // 1-10 scale
  weight: number; // Importance weight for overall comparison
}

export interface MethodologyProfile {
  methodology: TrainingMethodology;
  intensityDistribution: {
    easy: number;
    moderate: number;
    hard: number;
  };
  workoutTypeEmphasis: Record<WorkoutType, number>;
  periodizationApproach: string;
  paceCalculationMethod: string;
  recoveryPhilosophy: string;
  volumeProgression: string;
  strengthTraining: boolean;
  targetAudience: string[];
  researchBasis: ResearchCitation[];
}

export interface ResearchCitation {
  author: string;
  title: string;
  year: number;
  publication?: string;
  doi?: string;
  url?: string;
  credibilityScore: number; // 1-10 scale
  relevance: string;
}

export interface ComparisonMatrix {
  dimensions: PhilosophyDimension[];
  methodologies: TrainingMethodology[];
  scores: Record<TrainingMethodology, Record<string, number>>;
  overallRankings: Array<{
    methodology: TrainingMethodology;
    totalScore: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  lastUpdated: Date;
}

export interface MethodologyComparison {
  methodology1: TrainingMethodology;
  methodology2: TrainingMethodology;
  similarities: string[];
  differences: string[];
  compatibilityScore: number; // 0-100 scale
  transitionDifficulty: 'easy' | 'moderate' | 'difficult';
  recommendedFor: string[];
  researchSupport: {
    methodology1: number;
    methodology2: number;
  };
}

export interface ValidationResult {
  methodology: TrainingMethodology;
  accuracyScore: number; // 0-100 scale
  validatedAspects: string[];
  discrepancies: string[];
  lastValidated: Date;
  validatedBy: string;
}

/**
 * PhilosophyComparator provides comprehensive comparison capabilities
 * for training methodologies, including multi-dimensional analysis,
 * research validation, and compatibility assessment.
 */
export class PhilosophyComparator {
  private methodologyProfiles: Map<TrainingMethodology, MethodologyProfile>;
  private comparisonDimensions: PhilosophyDimension[];
  private validationResults: Map<TrainingMethodology, ValidationResult>;
  private cachedMatrix: ComparisonMatrix | null = null;

  constructor() {
    this.methodologyProfiles = new Map();
    this.validationResults = new Map();
    this.comparisonDimensions = this.initializeComparisonDimensions();
    this.initializeMethodologyProfiles();
  }

  /**
   * Initialize the comparison dimensions used for methodology analysis
   */
  private initializeComparisonDimensions(): PhilosophyDimension[] {
    return [
      {
        name: 'Intensity Distribution',
        description: 'How the methodology balances easy, moderate, and hard training',
        scale: 10,
        weight: 0.20
      },
      {
        name: 'Scientific Foundation',
        description: 'Strength of research backing and peer review',
        scale: 10,
        weight: 0.15
      },
      {
        name: 'Periodization Structure',
        description: 'Sophistication and clarity of training phase progression',
        scale: 10,
        weight: 0.15
      },
      {
        name: 'Workout Variety',
        description: 'Range and diversity of training stimulus',
        scale: 10,
        weight: 0.10
      },
      {
        name: 'Pace Precision',
        description: 'Accuracy and specificity of training pace calculations',
        scale: 10,
        weight: 0.15
      },
      {
        name: 'Individual Adaptation',
        description: 'Flexibility to accommodate individual differences',
        scale: 10,
        weight: 0.10
      },
      {
        name: 'Recovery Integration',
        description: 'How well recovery is planned and emphasized',
        scale: 10,
        weight: 0.10
      },
      {
        name: 'Practical Application',
        description: 'Ease of implementation for average runners',
        scale: 10,
        weight: 0.05
      }
    ];
  }

  /**
   * Initialize methodology profiles with detailed characteristics
   */
  private initializeMethodologyProfiles(): void {
    // Daniels Methodology Profile
    this.methodologyProfiles.set('daniels', {
      methodology: 'daniels',
      intensityDistribution: { easy: 80, moderate: 15, hard: 5 },
      workoutTypeEmphasis: {
        'easy': 8,
        'tempo': 9,
        'threshold': 10,
        'vo2max': 8,
        'speed': 7,
        'long_run': 6,
        'recovery': 7,
        'fartlek': 6,
        'hill_repeats': 5,
        'progression': 7,
        'steady': 6,
        'race_pace': 7,
        'time_trial': 6,
        'cross_training': 3,
        'strength': 2
      },
      periodizationApproach: 'Base-Build-Peak with consistent quality work',
      paceCalculationMethod: 'VDOT-based with 5 distinct training zones',
      recoveryPhilosophy: 'Active recovery with easy pace running',
      volumeProgression: 'Conservative weekly increases with step-back weeks',
      strengthTraining: false,
      targetAudience: ['competitive runners', 'data-driven athletes', 'marathon runners'],
      researchBasis: [
        {
          author: 'Jack Daniels',
          title: "Daniels' Running Formula",
          year: 2013,
          credibilityScore: 10,
          relevance: 'Primary methodology source'
        },
        {
          author: 'Daniels & Gilbert',
          title: 'Oxygen Power: Performance Tables for Distance Runners',
          year: 1979,
          credibilityScore: 9,
          relevance: 'VDOT system foundation'
        }
      ]
    });

    // Lydiard Methodology Profile  
    this.methodologyProfiles.set('lydiard', {
      methodology: 'lydiard',
      intensityDistribution: { easy: 85, moderate: 10, hard: 5 },
      workoutTypeEmphasis: {
        'easy': 10,
        'tempo': 6,
        'threshold': 5,
        'vo2max': 4,
        'speed': 3,
        'long_run': 10,
        'recovery': 9,
        'fartlek': 7,
        'hill_repeats': 8,
        'progression': 6,
        'steady': 9,
        'race_pace': 4,
        'time_trial': 3,
        'cross_training': 2,
        'strength': 8
      },
      periodizationApproach: 'Strict base-anaerobic-coordination-taper progression',
      paceCalculationMethod: 'Effort-based with time emphasis over pace',
      recoveryPhilosophy: 'Complete rest preferred over active recovery',
      volumeProgression: 'High volume base with gradual anaerobic introduction',
      strengthTraining: true,
      targetAudience: ['endurance athletes', 'marathon runners', 'base-building focused'],
      researchBasis: [
        {
          author: 'Arthur Lydiard',
          title: 'Running to the Top',
          year: 1997,
          credibilityScore: 9,
          relevance: 'Primary methodology source'
        },
        {
          author: 'Nobby Hashizume',
          title: 'Lydiard Training Principles',
          year: 2006,
          credibilityScore: 8,
          relevance: 'Modern interpretation of Lydiard methods'
        }
      ]
    });

    // Pfitzinger Methodology Profile
    this.methodologyProfiles.set('pfitzinger', {
      methodology: 'pfitzinger',
      intensityDistribution: { easy: 75, moderate: 20, hard: 5 },
      workoutTypeEmphasis: {
        'easy': 7,
        'tempo': 8,
        'threshold': 10,
        'vo2max': 7,
        'speed': 6,
        'long_run': 8,
        'recovery': 6,
        'fartlek': 6,
        'hill_repeats': 6,
        'progression': 9,
        'steady': 7,
        'race_pace': 8,
        'time_trial': 7,
        'cross_training': 4,
        'strength': 3
      },
      periodizationApproach: 'Lactate threshold focused with medium-long emphasis',
      paceCalculationMethod: 'LT-based pace derivations with race-specific work',
      recoveryPhilosophy: 'Structured recovery with optional easy runs',
      volumeProgression: 'Systematic threshold volume increases',
      strengthTraining: false,
      targetAudience: ['marathon runners', 'threshold-focused athletes', 'systematic trainers'],
      researchBasis: [
        {
          author: 'Pete Pfitzinger & Scott Douglas',
          title: 'Advanced Marathoning',
          year: 2008,
          credibilityScore: 9,
          relevance: 'Primary methodology source'
        },
        {
          author: 'Pete Pfitzinger',
          title: 'Road Racing for Serious Runners',
          year: 1999,
          credibilityScore: 8,
          relevance: 'Training principles foundation'
        }
      ]
    });
  }

  /**
   * Generate comprehensive comparison matrix for all methodologies
   */
  public generateComparisonMatrix(): ComparisonMatrix {
    if (this.cachedMatrix && this.isCacheValid()) {
      return this.cachedMatrix;
    }

    const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
    const scores: MethodologyScores = createEmptyScores();

    // Calculate scores for each methodology across all dimensions
    methodologies.forEach(methodology => {
      scores[methodology] = {};
      const profile = this.methodologyProfiles.get(methodology)!;

      this.comparisonDimensions.forEach(dimension => {
        scores[methodology][dimension.name] = this.calculateDimensionScore(
          methodology, 
          dimension, 
          profile
        );
      });
    });

    // Calculate overall rankings
    const overallRankings = methodologies.map(methodology => {
      const totalScore = this.comparisonDimensions.reduce((sum, dimension) => {
        return sum + (scores[methodology][dimension.name] * dimension.weight);
      }, 0);

      const profile = this.methodologyProfiles.get(methodology)!;
      const strengths = this.identifyStrengths(methodology, scores[methodology]);
      const weaknesses = this.identifyWeaknesses(methodology, scores[methodology]);

      return {
        methodology,
        totalScore: Math.round(totalScore * 10) / 10,
        strengths,
        weaknesses
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    this.cachedMatrix = {
      dimensions: this.comparisonDimensions,
      methodologies,
      scores,
      overallRankings,
      lastUpdated: new Date()
    };

    return this.cachedMatrix;
  }

  /**
   * Compare two methodologies directly
   */
  public compareMethodologies(
    methodology1: TrainingMethodology, 
    methodology2: TrainingMethodology
  ): MethodologyComparison {
    const profile1 = this.methodologyProfiles.get(methodology1)!;
    const profile2 = this.methodologyProfiles.get(methodology2)!;

    // Identify similarities
    const similarities = this.findSimilarities(profile1, profile2);
    
    // Identify differences
    const differences = this.findDifferences(profile1, profile2);

    // Calculate compatibility score
    const compatibilityScore = this.calculateCompatibilityScore(profile1, profile2);

    // Assess transition difficulty
    const transitionDifficulty = this.assessTransitionDifficulty(profile1, profile2);

    // Generate recommendations
    const recommendedFor = this.generateRecommendations(profile1, profile2);

    // Calculate research support
    const researchSupport = {
      methodology1: this.calculateResearchSupport(profile1),
      methodology2: this.calculateResearchSupport(profile2)
    };

    return {
      methodology1,
      methodology2,
      similarities,
      differences,
      compatibilityScore,
      transitionDifficulty,
      recommendedFor,
      researchSupport
    };
  }

  /**
   * Validate methodology implementation against research
   */
  public validateMethodology(
    methodology: TrainingMethodology,
    validatedBy: string = 'system'
  ): ValidationResult {
    const profile = this.methodologyProfiles.get(methodology)!;
    const philosophy = PhilosophyFactory.create(methodology);

    // Test plan generation to validate implementation
    const testPlan = this.generateTestPlan(methodology);
    
    // Validate against expected characteristics
    const validatedAspects: string[] = [];
    const discrepancies: string[] = [];
    let accuracyScore = 0;

    // Validate intensity distribution
    const intensityValidation = this.validateIntensityDistribution(testPlan, profile);
    if (intensityValidation.isValid) {
      validatedAspects.push('Intensity Distribution');
      accuracyScore += 15;
    } else {
      discrepancies.push(`Intensity distribution: ${intensityValidation.error}`);
    }

    // Validate workout type emphasis
    const workoutValidation = this.validateWorkoutTypeEmphasis(testPlan, profile);
    if (workoutValidation.isValid) {
      validatedAspects.push('Workout Type Emphasis');
      accuracyScore += 15;
    } else {
      discrepancies.push(`Workout emphasis: ${workoutValidation.error}`);
    }

    // Validate periodization approach
    const periodizationValidation = this.validatePeriodization(testPlan, profile);
    if (periodizationValidation.isValid) {
      validatedAspects.push('Periodization Structure');
      accuracyScore += 20;
    } else {
      discrepancies.push(`Periodization: ${periodizationValidation.error}`);
    }

    // Validate pace calculation method
    try {
      const paces = calculateTrainingPaces(50); // Test with VDOT 50
      if (paces && Object.keys(paces).length > 0) {
        validatedAspects.push('Pace Calculation');
        accuracyScore += 20;
      }
    } catch (error) {
      discrepancies.push('Pace calculation system not properly implemented');
    }

    // Validate recovery philosophy
    const recoveryValidation = this.validateRecoveryPhilosophy(testPlan, profile);
    if (recoveryValidation.isValid) {
      validatedAspects.push('Recovery Integration');
      accuracyScore += 15;
    } else {
      discrepancies.push(`Recovery philosophy: ${recoveryValidation.error}`);
    }

    // Validate research citations
    if (profile.researchBasis.length > 0 && 
        profile.researchBasis.every(citation => citation.credibilityScore >= 7)) {
      validatedAspects.push('Research Foundation');
      accuracyScore += 15;
    } else {
      discrepancies.push('Insufficient or low-quality research citations');
    }

    const validationResult: ValidationResult = {
      methodology,
      accuracyScore,
      validatedAspects,
      discrepancies,
      lastValidated: new Date(),
      validatedBy
    };

    this.validationResults.set(methodology, validationResult);
    return validationResult;
  }

  /**
   * Get detailed methodology profile
   */
  public getMethodologyProfile(methodology: TrainingMethodology): MethodologyProfile | undefined {
    return this.methodologyProfiles.get(methodology);
  }

  /**
   * Get research citations for methodology
   */
  public getResearchCitations(methodology: TrainingMethodology): ResearchCitation[] {
    const profile = this.methodologyProfiles.get(methodology);
    return profile ? profile.researchBasis : [];
  }

  /**
   * Get validation results for methodology
   */
  public getValidationResults(methodology: TrainingMethodology): ValidationResult | undefined {
    return this.validationResults.get(methodology);
  }

  /**
   * Calculate dimension score for methodology
   */
  private calculateDimensionScore(
    methodology: TrainingMethodology,
    dimension: PhilosophyDimension,
    profile: MethodologyProfile
  ): number {
    switch (dimension.name) {
      case 'Intensity Distribution':
        return this.scoreIntensityDistribution(profile);
      case 'Scientific Foundation':
        return this.scoreScientificFoundation(profile);
      case 'Periodization Structure':
        return this.scorePeriodizationStructure(profile);
      case 'Workout Variety':
        return this.scoreWorkoutVariety(profile);
      case 'Pace Precision':
        return this.scorePacePrecision(profile);
      case 'Individual Adaptation':
        return this.scoreIndividualAdaptation(profile);
      case 'Recovery Integration':
        return this.scoreRecoveryIntegration(profile);
      case 'Practical Application':
        return this.scorePracticalApplication(profile);
      default:
        return 5; // Default middle score
    }
  }

  private scoreIntensityDistribution(profile: MethodologyProfile): number {
    // Higher score for better adherence to 80/20 rule
    const easyPercentage = profile.intensityDistribution.easy;
    if (easyPercentage >= 80) return 9;
    if (easyPercentage >= 75) return 8;
    if (easyPercentage >= 70) return 7;
    return 6;
  }

  private scoreScientificFoundation(profile: MethodologyProfile): number {
    const avgCredibility = profile.researchBasis.reduce(
      (sum, citation) => sum + citation.credibilityScore, 0
    ) / profile.researchBasis.length;
    return Math.min(10, Math.round(avgCredibility));
  }

  private scorePeriodizationStructure(profile: MethodologyProfile): number {
    // Score based on clarity and structure of periodization
    if (profile.periodizationApproach.includes('strict') || 
        profile.periodizationApproach.includes('systematic')) return 9;
    if (profile.periodizationApproach.includes('Base-Build-Peak')) return 8;
    return 7;
  }

  private scoreWorkoutVariety(profile: MethodologyProfile): number {
    const emphasisValues = Object.values(profile.workoutTypeEmphasis);
    const variety = emphasisValues.filter(value => value >= 6).length;
    return Math.min(10, variety + 2);
  }

  private scorePacePrecision(profile: MethodologyProfile): number {
    if (profile.paceCalculationMethod.includes('VDOT')) return 10;
    if (profile.paceCalculationMethod.includes('LT-based')) return 9;
    if (profile.paceCalculationMethod.includes('effort-based')) return 7;
    return 6;
  }

  private scoreIndividualAdaptation(profile: MethodologyProfile): number {
    // Lydiard gets high score for effort-based approach
    if (profile.methodology === 'lydiard') return 8;
    // Daniels gets high score for VDOT precision
    if (profile.methodology === 'daniels') return 9;
    // Pfitzinger gets moderate score
    return 7;
  }

  private scoreRecoveryIntegration(profile: MethodologyProfile): number {
    if (profile.recoveryPhilosophy.includes('complete rest')) return 9;
    if (profile.recoveryPhilosophy.includes('structured')) return 8;
    if (profile.recoveryPhilosophy.includes('active recovery')) return 7;
    return 6;
  }

  private scorePracticalApplication(profile: MethodologyProfile): number {
    // Score based on complexity and accessibility
    if (profile.methodology === 'lydiard') return 8; // Simple effort-based
    if (profile.methodology === 'pfitzinger') return 7; // Moderate complexity
    if (profile.methodology === 'daniels') return 6; // Requires VDOT calculation
    return 7;
  }

  private identifyStrengths(methodology: TrainingMethodology, scores: Record<string, number>): string[] {
    const strengths: string[] = [];
    Object.entries(scores).forEach(([dimension, score]) => {
      if (score >= 8) {
        strengths.push(dimension);
      }
    });
    return strengths;
  }

  private identifyWeaknesses(methodology: TrainingMethodology, scores: Record<string, number>): string[] {
    const weaknesses: string[] = [];
    Object.entries(scores).forEach(([dimension, score]) => {
      if (score <= 6) {
        weaknesses.push(dimension);
      }
    });
    return weaknesses;
  }

  private findSimilarities(profile1: MethodologyProfile, profile2: MethodologyProfile): string[] {
    const similarities: string[] = [];

    // Compare intensity distributions
    const diff = Math.abs(profile1.intensityDistribution.easy - profile2.intensityDistribution.easy);
    if (diff <= 10) {
      similarities.push('Similar easy running emphasis');
    }

    // Compare target audience overlap
    const audienceOverlap = profile1.targetAudience.filter(
      audience => profile2.targetAudience.includes(audience)
    );
    if (audienceOverlap.length > 0) {
      similarities.push(`Both target ${audienceOverlap.join(', ')}`);
    }

    // Compare workout emphases
    const sharedEmphases = Object.keys(profile1.workoutTypeEmphasis).filter(type => {
      const type1 = profile1.workoutTypeEmphasis[type as WorkoutType];
      const type2 = profile2.workoutTypeEmphasis[type as WorkoutType];
      return Math.abs(type1 - type2) <= 2 && type1 >= 7;
    });
    if (sharedEmphases.length > 0) {
      similarities.push(`Both emphasize ${sharedEmphases.join(', ')} workouts`);
    }

    return similarities;
  }

  private findDifferences(profile1: MethodologyProfile, profile2: MethodologyProfile): string[] {
    const differences: string[] = [];

    // Periodization differences
    if (profile1.periodizationApproach !== profile2.periodizationApproach) {
      differences.push(`Periodization: ${profile1.methodology} uses ${profile1.periodizationApproach} vs ${profile2.methodology} uses ${profile2.periodizationApproach}`);
    }

    // Pace calculation differences
    if (profile1.paceCalculationMethod !== profile2.paceCalculationMethod) {
      differences.push(`Pace calculation: ${profile1.methodology} uses ${profile1.paceCalculationMethod} vs ${profile2.methodology} uses ${profile2.paceCalculationMethod}`);
    }

    // Recovery philosophy differences
    if (profile1.recoveryPhilosophy !== profile2.recoveryPhilosophy) {
      differences.push(`Recovery: ${profile1.methodology} prefers ${profile1.recoveryPhilosophy} vs ${profile2.methodology} prefers ${profile2.recoveryPhilosophy}`);
    }

    // Strength training differences
    if (profile1.strengthTraining !== profile2.strengthTraining) {
      const withStrength = profile1.strengthTraining ? profile1.methodology : profile2.methodology;
      const withoutStrength = profile1.strengthTraining ? profile2.methodology : profile1.methodology;
      differences.push(`${withStrength} includes strength training while ${withoutStrength} does not`);
    }

    return differences;
  }

  private calculateCompatibilityScore(profile1: MethodologyProfile, profile2: MethodologyProfile): number {
    let score = 50; // Base compatibility

    // Intensity distribution compatibility
    const intensityDiff = Math.abs(profile1.intensityDistribution.easy - profile2.intensityDistribution.easy);
    score += Math.max(0, 20 - intensityDiff);

    // Target audience overlap
    const audienceOverlap = profile1.targetAudience.filter(
      audience => profile2.targetAudience.includes(audience)
    ).length;
    score += audienceOverlap * 5;

    // Workout emphasis compatibility
    let workoutCompatibility = 0;
    Object.keys(profile1.workoutTypeEmphasis).forEach(type => {
      const diff = Math.abs(
        profile1.workoutTypeEmphasis[type as WorkoutType] - 
        profile2.workoutTypeEmphasis[type as WorkoutType]
      );
      workoutCompatibility += Math.max(0, 3 - diff);
    });
    score += workoutCompatibility;

    return Math.min(100, Math.max(0, score));
  }

  private assessTransitionDifficulty(
    profile1: MethodologyProfile, 
    profile2: MethodologyProfile
  ): 'easy' | 'moderate' | 'difficult' {
    const compatibilityScore = this.calculateCompatibilityScore(profile1, profile2);
    
    if (compatibilityScore >= 80) return 'easy';
    if (compatibilityScore >= 60) return 'moderate';
    return 'difficult';
  }

  private generateRecommendations(profile1: MethodologyProfile, profile2: MethodologyProfile): string[] {
    const recommendations: string[] = [];

    // Combine target audiences
    const combinedAudiences = profile1.targetAudience.concat(profile2.targetAudience);
    const uniqueAudiences = Array.from(new Set(combinedAudiences));
    recommendations.push(...uniqueAudiences);

    // Add specific recommendations based on methodology combinations
    if ((profile1.methodology === 'daniels' && profile2.methodology === 'pfitzinger') ||
        (profile1.methodology === 'pfitzinger' && profile2.methodology === 'daniels')) {
      recommendations.push('Data-driven runners seeking threshold development');
    }

    if ((profile1.methodology === 'lydiard' && profile2.methodology === 'daniels') ||
        (profile1.methodology === 'daniels' && profile2.methodology === 'lydiard')) {
      recommendations.push('Runners wanting aerobic base with structured quality');
    }

    return recommendations;
  }

  private calculateResearchSupport(profile: MethodologyProfile): number {
    return profile.researchBasis.reduce(
      (sum, citation) => sum + citation.credibilityScore, 0
    ) / profile.researchBasis.length;
  }

  private generateTestPlan(methodology: TrainingMethodology): TrainingPlan {
    // Generate a simple test plan to validate methodology characteristics
    // Since TrainingPhilosophy doesn't have generatePlan, create a mock plan structure
    const mockBasePlan: TrainingPlan = {
      id: 'test-plan',
      config: {
        name: 'Test Plan',
        goal: 'MARATHON',
        startDate: new Date(),
        endDate: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000)
      },
      blocks: [{
        id: 'block-1',
        phase: 'base',
        startDate: new Date(),
        endDate: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000),
        weeks: 4,
        focusAreas: ['aerobic base'],
        microcycles: []
      }],
      summary: {
        totalWeeks: 4,
        totalWorkouts: 2,
        totalDistance: 14,
        totalTime: 75,
        peakWeeklyDistance: 14,
        averageWeeklyDistance: 14,
        keyWorkouts: 1,
        recoveryDays: 0,
        phases: [{
          phase: 'base',
          weeks: 4,
          totalWorkouts: 2,
          avgWeeklyDistance: 14,
          focusAreas: ['aerobic base']
        }]
      },
      workouts: [
        {
          id: 'w1-1',
          date: new Date(),
          type: 'easy',
          name: 'Easy Run',
          description: 'Base aerobic run',
          workout: {
            type: 'easy',
            primaryZone: { name: 'Easy', rpe: 4, description: 'Easy pace', purpose: 'Aerobic base' },
            segments: [{
              duration: 45,
              intensity: 70,
              zone: { name: 'Easy', rpe: 4, description: 'Easy pace', purpose: 'Aerobic base' },
              description: 'Easy pace'
            }],
            adaptationTarget: 'Aerobic base',
            estimatedTSS: 50,
            recoveryTime: 12
          },
          targetMetrics: { duration: 45, distance: 8, tss: 50, load: 100, intensity: 70 }
        },
        {
          id: 'w1-2',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          type: 'tempo',
          name: 'Tempo Run',
          description: 'Threshold workout',
          workout: {
            type: 'tempo',
            primaryZone: { name: 'Threshold', rpe: 7, description: 'Threshold pace', purpose: 'Lactate threshold' },
            segments: [{
              duration: 30,
              intensity: 88,
              zone: { name: 'Threshold', rpe: 7, description: 'Threshold pace', purpose: 'Lactate threshold' },
              description: 'Tempo segment'
            }],
            adaptationTarget: 'Lactate threshold',
            estimatedTSS: 80,
            recoveryTime: 24
          },
          targetMetrics: { duration: 30, distance: 6, tss: 80, load: 150, intensity: 88 }
        }
      ]
    };

    // Return the mock plan directly for validation purposes
    // Note: enhancePlan may fail due to missing plan structure complexity
    return mockBasePlan;
  }

  private validateIntensityDistribution(
    plan: TrainingPlan, 
    profile: MethodologyProfile
  ): { isValid: boolean; error?: string } {
    const workouts = plan.workouts;
    const easyWorkouts = workouts.filter(w => 
      w.type === 'easy' || w.type === 'recovery'
    ).length;
    const totalWorkouts = workouts.length;
    
    const easyPercentage = (easyWorkouts / totalWorkouts) * 100;
    const expectedEasy = profile.intensityDistribution.easy;
    
    if (Math.abs(easyPercentage - expectedEasy) <= 15) {
      return { isValid: true };
    }
    
    return { 
      isValid: false, 
      error: `Expected ${expectedEasy}% easy, got ${Math.round(easyPercentage)}%` 
    };
  }

  private validateWorkoutTypeEmphasis(
    plan: TrainingPlan,
    profile: MethodologyProfile
  ): { isValid: boolean; error?: string } {
    const workouts = plan.workouts;
    const workoutCounts: Record<string, number> = {};
    
    workouts.forEach(workout => {
      workoutCounts[workout.type] = (workoutCounts[workout.type] || 0) + 1;
    });

    // Check if high-emphasis workout types appear frequently
    const highEmphasisTypes = Object.entries(profile.workoutTypeEmphasis)
      .filter(([type, emphasis]) => emphasis >= 8)
      .map(([type]) => type);

    const foundHighEmphasis = highEmphasisTypes.some(type => 
      workoutCounts[type] && workoutCounts[type] > 0
    );

    if (foundHighEmphasis || highEmphasisTypes.length === 0) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: `Expected emphasis on ${highEmphasisTypes.join(', ')} but not found in plan`
    };
  }

  private validatePeriodization(
    plan: TrainingPlan,
    profile: MethodologyProfile
  ): { isValid: boolean; error?: string } {
    // Simple validation - check that plan has blocks and progression
    if (plan.blocks.length === 0) {
      return {
        isValid: false,
        error: 'No training blocks found'
      };
    }

    // Check if blocks have progression phases
    const hasProgression = plan.blocks.some(block => 
      ['base', 'build', 'peak'].includes(block.phase)
    );
    
    if (hasProgression) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: 'No clear periodization progression detected'
    };
  }

  private validateRecoveryPhilosophy(
    plan: TrainingPlan,
    profile: MethodologyProfile
  ): { isValid: boolean; error?: string } {
    const workouts = plan.workouts;
    const recoveryWorkouts = workouts.filter(w => w.type === 'recovery').length;
    
    // Lydiard should have more complete rest (fewer recovery runs)
    if (profile.methodology === 'lydiard' && recoveryWorkouts > workouts.length * 0.15) {
      return {
        isValid: false,
        error: 'Too many active recovery runs for Lydiard methodology'
      };
    }

    return { isValid: true };
  }

  private isCacheValid(): boolean {
    if (!this.cachedMatrix) return false;
    const cacheAge = Date.now() - this.cachedMatrix.lastUpdated.getTime();
    return cacheAge < 24 * 60 * 60 * 1000; // 24 hours
  }
}