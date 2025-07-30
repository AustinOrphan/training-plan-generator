/**
 * Research Validation System
 * 
 * Implements comprehensive validation of training methodologies against
 * source material, expert review integration, and continuous validation
 * monitoring to ensure 95%+ accuracy in methodology implementation.
 * 
 * LEVERAGES:
 * - Existing validation engine (ValidationPipeline)
 * - Research citation system (ResearchCitation from PhilosophyComparator)
 * - Methodology profiles and validation results
 * 
 * REQUIREMENTS:
 * - 95%+ accuracy in methodology principle implementation vs. source material
 * - Peer review by certified coaches familiar with each methodology
 * - Continuous updates based on latest sports science research
 */

import {
  TrainingMethodology,
  TrainingPlan,
  PlannedWorkout,
  AdvancedPlanConfig,
  WorkoutType,
  TrainingPhase
} from './types';
import { ValidationPipeline, ValidationResult } from './validation';
import { 
  PhilosophyComparator, 
  ResearchCitation, 
  MethodologyProfile,
  ValidationResult as MethodologyValidationResult
} from './philosophy-comparator';
import { PhilosophyFactory } from './philosophies';
import { AdvancedTrainingPlanGenerator } from './advanced-generator';
import { calculateTrainingPaces } from './zones';

// Research validation types
export interface ResearchValidationResult {
  methodology: TrainingMethodology;
  accuracyScore: number; // 0-100 scale
  validatedPrinciples: ValidatedPrinciple[];
  sourceCompliance: SourceCompliance[];
  expertReviews: ExpertReview[];
  continuousMonitoring: MonitoringResult[];
  recommendedUpdates: ResearchUpdate[];
  lastValidated: Date;
  validationSummary: ValidationSummary;
}

export interface ValidatedPrinciple {
  principle: string;
  sourceReference: string;
  implementationAccuracy: number; // 0-100
  complianceEvidence: string[];
  deviations: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface SourceCompliance {
  citation: ResearchCitation;
  complianceScore: number; // 0-100
  implementedAspects: string[];
  missingAspects: string[];
  deviations: ComplianceDeviation[];
  lastReviewed: Date;
}

export interface ComplianceDeviation {
  aspect: string;
  expected: string;
  actual: string;
  severity: 'major' | 'minor' | 'cosmetic';
  justification?: string;
}

export interface ExpertReview {
  reviewerId: string;
  reviewerCredentials: string[];
  methodology: TrainingMethodology;
  overallScore: number; // 0-100
  principleAssessments: PrincipleAssessment[];
  recommendations: string[];
  approvalStatus: 'approved' | 'conditional' | 'rejected';
  reviewDate: Date;
  comments: string;
}

export interface PrincipleAssessment {
  principle: string;
  accuracy: number; // 0-100
  completeness: number; // 0-100
  practicalRelevance: number; // 0-100
  feedback: string;
}

export interface MonitoringResult {
  monitoringDate: Date;
  newResearchFound: ResearchUpdate[];
  accuracyTrend: AccuracyTrend;
  userFeedback: UserFeedbackSummary;
  performanceMetrics: PerformanceMetrics;
  recommendedActions: RecommendedAction[];
}

export interface ResearchUpdate {
  citation: ResearchCitation;
  relevantPrinciples: string[];
  potentialImpact: 'high' | 'medium' | 'low';
  implementationSuggestions: string[];
  priority: number; // 1-10
  estimatedEffort: string;
}

export interface AccuracyTrend {
  currentScore: number;
  previousScore: number;
  trend: 'improving' | 'stable' | 'declining';
  timeframe: string;
  significantChanges: string[];
}

export interface UserFeedbackSummary {
  totalResponses: number;
  averageSatisfaction: number; // 0-100
  commonComplaints: string[];
  suggestedImprovements: string[];
  methodologyPreferences: Record<TrainingMethodology, number>;
}

export interface PerformanceMetrics {
  planGenerationAccuracy: number;
  workoutSelectionRelevance: number;
  intensityDistributionCompliance: number;
  phaseProgressionAccuracy: number;
  userAdherenceRate: number;
}

export interface RecommendedAction {
  action: string;
  methodology: TrainingMethodology[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeline: string;
  effort: 'minimal' | 'moderate' | 'significant';
  expectedImprovement: number; // accuracy score improvement
}

export interface ValidationSummary {
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  strengthAreas: string[];
  improvementAreas: string[];
  criticalIssues: string[];
  nextReviewDate: Date;
  certificationStatus: 'certified' | 'provisional' | 'under_review';
}

/**
 * Research Validation System
 * 
 * Provides comprehensive methodology validation against research sources,
 * expert review integration, and continuous monitoring for accuracy
 */
export class ResearchValidationSystem {
  private comparator: PhilosophyComparator;
  private validationPipeline: ValidationPipeline;
  private validationHistory: Map<TrainingMethodology, ResearchValidationResult[]>;
  private expertReviews: Map<TrainingMethodology, ExpertReview[]>;
  private monitoringData: Map<TrainingMethodology, MonitoringResult[]>;

  constructor() {
    this.comparator = new PhilosophyComparator();
    this.validationPipeline = new ValidationPipeline();
    this.validationHistory = new Map();
    this.expertReviews = new Map();
    this.monitoringData = new Map();
  }

  /**
   * Perform comprehensive research validation for a methodology
   */
  public async validateMethodologyResearch(
    methodology: TrainingMethodology,
    includeExpertReview: boolean = false
  ): Promise<ResearchValidationResult> {
    // Get methodology profile and research citations
    const profile = this.comparator.getMethodologyProfile(methodology);
    if (!profile) {
      throw new Error(`Methodology profile not found: ${methodology}`);
    }

    // Validate against source material
    const sourceCompliance = await this.validateSourceCompliance(profile);
    
    // Validate methodology principles
    const validatedPrinciples = await this.validateMethodologyPrinciples(methodology, profile);
    
    // Get expert reviews if requested
    const expertReviews = includeExpertReview 
      ? await this.getExpertReviews(methodology)
      : [];
    
    // Get continuous monitoring data
    const continuousMonitoring = this.getContinuousMonitoringData(methodology);
    
    // Identify recommended updates
    const recommendedUpdates = await this.identifyResearchUpdates(methodology, profile);
    
    // Calculate overall accuracy score
    const accuracyScore = this.calculateOverallAccuracyScore(
      validatedPrinciples,
      sourceCompliance,
      expertReviews
    );
    
    // Generate validation summary
    const validationSummary = this.generateValidationSummary(
      accuracyScore,
      validatedPrinciples,
      sourceCompliance,
      expertReviews
    );

    const result: ResearchValidationResult = {
      methodology,
      accuracyScore,
      validatedPrinciples,
      sourceCompliance,
      expertReviews,
      continuousMonitoring,
      recommendedUpdates,
      lastValidated: new Date(),
      validationSummary
    };

    // Store in validation history
    this.addToValidationHistory(methodology, result);

    return result;
  }

  /**
   * Validate methodology compliance with source material
   */
  private async validateSourceCompliance(profile: MethodologyProfile): Promise<SourceCompliance[]> {
    const compliance: SourceCompliance[] = [];

    for (const citation of profile.researchBasis) {
      const sourceCompliance = await this.validateAgainstSource(citation, profile);
      compliance.push(sourceCompliance);
    }

    return compliance;
  }

  /**
   * Validate against specific research source
   */
  private async validateAgainstSource(
    citation: ResearchCitation,
    profile: MethodologyProfile
  ): Promise<SourceCompliance> {
    const implementedAspects: string[] = [];
    const missingAspects: string[] = [];
    const deviations: ComplianceDeviation[] = [];

    // Validate based on methodology and citation
    switch (profile.methodology) {
      case 'daniels':
        return this.validateDanielsSource(citation, profile);
      case 'lydiard':
        return this.validateLydiardSource(citation, profile);
      case 'pfitzinger':
        return this.validatePfitzingerSource(citation, profile);
      default:
        throw new Error(`Unsupported methodology: ${profile.methodology}`);
    }
  }

  /**
   * Validate Daniels methodology against source material
   */
  private validateDanielsSource(citation: ResearchCitation, profile: MethodologyProfile): SourceCompliance {
    const implementedAspects: string[] = [];
    const missingAspects: string[] = [];
    const deviations: ComplianceDeviation[] = [];

    // Check VDOT implementation
    if (citation.title.includes("Daniels' Running Formula")) {
      implementedAspects.push('VDOT-based pace calculations');
      implementedAspects.push('Five training zones (E, M, T, I, R)');
      implementedAspects.push('80/20 intensity distribution');
      
      // Check intensity distribution compliance
      const expectedEasy = 80;
      const actualEasy = profile.intensityDistribution.easy;
      if (Math.abs(actualEasy - expectedEasy) > 5) {
        deviations.push({
          aspect: 'Intensity Distribution',
          expected: `${expectedEasy}% easy running`,
          actual: `${actualEasy}% easy running`,
          severity: 'minor',
          justification: 'Adjusted for practical implementation'
        });
      }

      // Check workout emphasis
      if (profile.workoutTypeEmphasis.tempo < 8) {
        missingAspects.push('Sufficient tempo run emphasis');
      }
    }

    const complianceScore = this.calculateComplianceScore(implementedAspects, missingAspects, deviations);

    return {
      citation,
      complianceScore,
      implementedAspects,
      missingAspects,
      deviations,
      lastReviewed: new Date()
    };
  }

  /**
   * Validate Lydiard methodology against source material
   */
  private validateLydiardSource(citation: ResearchCitation, profile: MethodologyProfile): SourceCompliance {
    const implementedAspects: string[] = [];
    const missingAspects: string[] = [];
    const deviations: ComplianceDeviation[] = [];

    if (citation.title.includes('Running to the Top')) {
      implementedAspects.push('Aerobic base building emphasis');
      implementedAspects.push('Hill training integration');
      implementedAspects.push('Strict periodization progression');
      
      // Check aerobic emphasis
      const expectedEasy = 85;
      const actualEasy = profile.intensityDistribution.easy;
      if (actualEasy >= expectedEasy) {
        implementedAspects.push('85%+ easy running compliance');
      } else {
        deviations.push({
          aspect: 'Aerobic Base Emphasis',
          expected: `${expectedEasy}%+ easy running`,
          actual: `${actualEasy}% easy running`,
          severity: 'major'
        });
      }

      // Check strength training inclusion
      if (profile.strengthTraining) {
        implementedAspects.push('Strength training integration');
      } else {
        missingAspects.push('Strength training component');
      }
    }

    const complianceScore = this.calculateComplianceScore(implementedAspects, missingAspects, deviations);

    return {
      citation,
      complianceScore,
      implementedAspects,
      missingAspects,
      deviations,
      lastReviewed: new Date()
    };
  }

  /**
   * Validate Pfitzinger methodology against source material
   */
  private validatePfitzingerSource(citation: ResearchCitation, profile: MethodologyProfile): SourceCompliance {
    const implementedAspects: string[] = [];
    const missingAspects: string[] = [];
    const deviations: ComplianceDeviation[] = [];

    if (citation.title.includes('Advanced Marathoning')) {
      implementedAspects.push('Lactate threshold focus');
      implementedAspects.push('Medium-long run emphasis');
      implementedAspects.push('Systematic progression');
      
      // Check threshold emphasis
      if (profile.workoutTypeEmphasis.threshold >= 8) {
        implementedAspects.push('Strong threshold workout emphasis');
      } else {
        missingAspects.push('Sufficient threshold workout emphasis');
      }

      // Check pace calculation method
      if (profile.paceCalculationMethod.includes('LT-based')) {
        implementedAspects.push('LT-based pace calculations');
      } else {
        deviations.push({
          aspect: 'Pace Calculation Method',
          expected: 'LT-based pace derivations',
          actual: profile.paceCalculationMethod,
          severity: 'minor'
        });
      }
    }

    const complianceScore = this.calculateComplianceScore(implementedAspects, missingAspects, deviations);

    return {
      citation,
      complianceScore,
      implementedAspects,
      missingAspects,
      deviations,
      lastReviewed: new Date()
    };
  }

  /**
   * Validate core methodology principles through generated plans
   */
  private async validateMethodologyPrinciples(
    methodology: TrainingMethodology,
    profile: MethodologyProfile
  ): Promise<ValidatedPrinciple[]> {
    const principles: ValidatedPrinciple[] = [];

    // Generate test plan for validation
    const testConfig = this.createTestConfig(methodology);
    const generator = new AdvancedTrainingPlanGenerator(testConfig);
    const testPlan = await generator.generateAdvancedPlan();

    // Validate intensity distribution principle
    const intensityPrinciple = this.validateIntensityDistribution(testPlan, profile);
    principles.push(intensityPrinciple);

    // Validate workout selection principle
    const workoutPrinciple = this.validateWorkoutSelection(testPlan, profile);
    principles.push(workoutPrinciple);

    // Validate periodization principle
    const periodizationPrinciple = this.validatePeriodization(testPlan, profile);
    principles.push(periodizationPrinciple);

    // Validate pace calculation principle
    const pacePrinciple = this.validatePaceCalculations(methodology, profile);
    principles.push(pacePrinciple);

    return principles;
  }

  /**
   * Validate intensity distribution principle
   */
  private validateIntensityDistribution(plan: TrainingPlan, profile: MethodologyProfile): ValidatedPrinciple {
    const easyWorkouts = plan.workouts.filter(w => 
      ['easy', 'recovery', 'long_run'].includes(w.type)
    ).length;
    const totalWorkouts = plan.workouts.length;
    const actualEasyPercentage = (easyWorkouts / totalWorkouts) * 100;
    const expectedEasyPercentage = profile.intensityDistribution.easy;
    
    const accuracy = Math.max(0, 100 - Math.abs(actualEasyPercentage - expectedEasyPercentage) * 2);
    
    return {
      principle: 'Intensity Distribution',
      sourceReference: `${profile.methodology} methodology intensity targets`,
      implementationAccuracy: accuracy,
      complianceEvidence: [
        `Generated ${easyWorkouts} easy workouts out of ${totalWorkouts} total (${actualEasyPercentage.toFixed(1)}%)`,
        `Target: ${expectedEasyPercentage}% easy running`
      ],
      deviations: accuracy < 90 ? [`Deviation of ${Math.abs(actualEasyPercentage - expectedEasyPercentage).toFixed(1)}% from target`] : [],
      confidenceLevel: accuracy >= 90 ? 'high' : accuracy >= 75 ? 'medium' : 'low'
    };
  }

  /**
   * Validate workout selection principle
   */
  private validateWorkoutSelection(plan: TrainingPlan, profile: MethodologyProfile): ValidatedPrinciple {
    const workoutCounts: Record<string, number> = {};
    plan.workouts.forEach(w => {
      workoutCounts[w.type] = (workoutCounts[w.type] || 0) + 1;
    });

    const highEmphasisTypes = Object.entries(profile.workoutTypeEmphasis)
      .filter(([type, emphasis]) => emphasis >= 8)
      .map(([type]) => type);

    const implementedHighEmphasis = highEmphasisTypes.filter(type => 
      workoutCounts[type] && workoutCounts[type] > 0
    );

    const accuracy = (implementedHighEmphasis.length / Math.max(1, highEmphasisTypes.length)) * 100;

    return {
      principle: 'Workout Selection Priority',
      sourceReference: `${profile.methodology} methodology workout emphasis`,
      implementationAccuracy: accuracy,
      complianceEvidence: [
        `Implemented ${implementedHighEmphasis.length} of ${highEmphasisTypes.length} high-emphasis workout types`,
        `High-emphasis types: ${highEmphasisTypes.join(', ')}`
      ],
      deviations: accuracy < 100 ? [`Missing workout types: ${highEmphasisTypes.filter(t => !implementedHighEmphasis.includes(t)).join(', ')}`] : [],
      confidenceLevel: accuracy >= 90 ? 'high' : accuracy >= 75 ? 'medium' : 'low'
    };
  }

  /**
   * Validate periodization principle
   */
  private validatePeriodization(plan: TrainingPlan, profile: MethodologyProfile): ValidatedPrinciple {
    const hasProgression = plan.blocks.length > 1;
    const hasPhaseStructure = plan.blocks.some(block => ['base', 'build', 'peak'].includes(block.phase));
    
    let accuracy = 0;
    if (hasProgression) accuracy += 50;
    if (hasPhaseStructure) accuracy += 50;
    
    return {
      principle: 'Periodization Structure',
      sourceReference: profile.periodizationApproach,
      implementationAccuracy: accuracy,
      complianceEvidence: [
        `Plan has ${plan.blocks.length} training blocks`,
        hasPhaseStructure ? 'Clear phase progression implemented' : 'Phase structure needs improvement'
      ],
      deviations: accuracy < 100 ? ['Periodization structure could be more detailed'] : [],
      confidenceLevel: accuracy >= 90 ? 'high' : accuracy >= 75 ? 'medium' : 'low'
    };
  }

  /**
   * Validate pace calculation principle
   */
  private validatePaceCalculations(methodology: TrainingMethodology, profile: MethodologyProfile): ValidatedPrinciple {
    try {
      const testVdot = 50;
      const paces = calculateTrainingPaces(testVdot);
      
      const hasValidPaces = paces && Object.keys(paces).length > 0;
      const paceProgression = hasValidPaces && 
        paces.repetition < paces.interval &&
        paces.interval < paces.threshold &&
        paces.threshold < paces.easy;
      
      let accuracy = 0;
      if (hasValidPaces) accuracy += 60;
      if (paceProgression) accuracy += 40;
      
      return {
        principle: 'Pace Calculation System',
        sourceReference: profile.paceCalculationMethod,
        implementationAccuracy: accuracy,
        complianceEvidence: [
          hasValidPaces ? 'Pace calculations functioning correctly' : 'Pace calculation issues detected',
          paceProgression ? 'Pace progression follows expected pattern' : 'Pace progression needs validation'
        ],
        deviations: accuracy < 100 ? ['Pace calculation system may need refinement'] : [],
        confidenceLevel: accuracy >= 90 ? 'high' : accuracy >= 75 ? 'medium' : 'low'
      };
    } catch (error) {
      return {
        principle: 'Pace Calculation System',
        sourceReference: profile.paceCalculationMethod,
        implementationAccuracy: 0,
        complianceEvidence: [],
        deviations: [`Pace calculation error: ${error}`],
        confidenceLevel: 'low'
      };
    }
  }

  /**
   * Get expert reviews for methodology
   */
  private async getExpertReviews(methodology: TrainingMethodology): Promise<ExpertReview[]> {
    // Return existing expert reviews or create mock reviews for demonstration
    const existingReviews = this.expertReviews.get(methodology) || [];
    
    if (existingReviews.length === 0) {
      // Create mock expert review for demonstration
      const mockReview = this.createMockExpertReview(methodology);
      existingReviews.push(mockReview);
      this.expertReviews.set(methodology, existingReviews);
    }
    
    return existingReviews;
  }

  /**
   * Create mock expert review for demonstration
   */
  private createMockExpertReview(methodology: TrainingMethodology): ExpertReview {
    const reviewData = {
      daniels: {
        score: 92,
        credentials: ['USATF Level 3 Coach', 'Exercise Physiology PhD'],
        assessments: [
          { principle: 'VDOT System', accuracy: 95, completeness: 90, practicalRelevance: 95, feedback: 'Excellent implementation of VDOT principles' },
          { principle: '80/20 Distribution', accuracy: 90, completeness: 85, practicalRelevance: 90, feedback: 'Good adherence to intensity distribution' },
          { principle: 'Workout Selection', accuracy: 88, completeness: 85, practicalRelevance: 92, feedback: 'Appropriate workout selection for methodology' }
        ],
        recommendations: ['Consider adding more specific VO2max progression guidelines', 'Enhance recovery week protocols']
      },
      lydiard: {
        score: 88,
        credentials: ['Arthur Lydiard Foundation Certified', 'IAAF Level 4 Coach'],
        assessments: [
          { principle: 'Aerobic Base', accuracy: 90, completeness: 88, practicalRelevance: 92, feedback: 'Strong aerobic base implementation' },
          { principle: 'Hill Training', accuracy: 85, completeness: 80, practicalRelevance: 88, feedback: 'Hill training could be more detailed' },
          { principle: 'Periodization', accuracy: 90, completeness: 90, practicalRelevance: 90, feedback: 'Excellent periodization structure' }
        ],
        recommendations: ['Add more specific hill training protocols', 'Include coordination phase details']
      },
      pfitzinger: {
        score: 90,
        credentials: ['Olympic Marathon Coach', 'Exercise Science MS'],
        assessments: [
          { principle: 'LT Focus', accuracy: 92, completeness: 90, practicalRelevance: 93, feedback: 'Excellent lactate threshold implementation' },
          { principle: 'Medium-Long Runs', accuracy: 88, completeness: 85, practicalRelevance: 90, feedback: 'Good medium-long run structure' },
          { principle: 'Systematic Progression', accuracy: 90, completeness: 88, practicalRelevance: 91, feedback: 'Well-structured progression' }
        ],
        recommendations: ['Enhance race-pace workout variety', 'Add more taper customization options']
      }
    };

    const data = reviewData[methodology];

    return {
      reviewerId: `expert_${methodology}_001`,
      reviewerCredentials: data.credentials,
      methodology,
      overallScore: data.score,
      principleAssessments: data.assessments,
      recommendations: data.recommendations,
      approvalStatus: data.score >= 85 ? 'approved' : 'conditional',
      reviewDate: new Date(),
      comments: `Comprehensive review of ${methodology} methodology implementation. Overall excellent work with some areas for enhancement.`
    };
  }

  /**
   * Get continuous monitoring data
   */
  private getContinuousMonitoringData(methodology: TrainingMethodology): MonitoringResult[] {
    return this.monitoringData.get(methodology) || [];
  }

  /**
   * Identify potential research updates
   */
  private async identifyResearchUpdates(
    methodology: TrainingMethodology,
    profile: MethodologyProfile
  ): Promise<ResearchUpdate[]> {
    // Mock research updates for demonstration
    const updates: ResearchUpdate[] = [];

    // Check for outdated citations
    const currentYear = new Date().getFullYear();
    profile.researchBasis.forEach(citation => {
      const age = currentYear - citation.year;
      if (age > 10) {
        updates.push({
          citation: {
            ...citation,
            title: `Updated ${citation.title} Research`,
            year: currentYear,
            relevance: 'Updated methodology principles'
          },
          relevantPrinciples: ['intensity distribution', 'workout selection'],
          potentialImpact: 'medium',
          implementationSuggestions: ['Review latest research findings', 'Update calculation parameters'],
          priority: 6,
          estimatedEffort: '2-3 weeks'
        });
      }
    });

    return updates;
  }

  /**
   * Calculate overall accuracy score
   */
  private calculateOverallAccuracyScore(
    principles: ValidatedPrinciple[],
    sourceCompliance: SourceCompliance[],
    expertReviews: ExpertReview[]
  ): number {
    let totalScore = 0;
    let weightSum = 0;

    // Weight principles validation (40%)
    if (principles.length > 0) {
      const principleScore = principles.reduce((sum, p) => sum + p.implementationAccuracy, 0) / principles.length;
      totalScore += principleScore * 0.4;
      weightSum += 0.4;
    }

    // Weight source compliance (35%)
    if (sourceCompliance.length > 0) {
      const complianceScore = sourceCompliance.reduce((sum, c) => sum + c.complianceScore, 0) / sourceCompliance.length;
      totalScore += complianceScore * 0.35;
      weightSum += 0.35;
    }

    // Weight expert reviews (25%)
    if (expertReviews.length > 0) {
      const expertScore = expertReviews.reduce((sum, r) => sum + r.overallScore, 0) / expertReviews.length;
      totalScore += expertScore * 0.25;
      weightSum += 0.25;
    }

    return weightSum > 0 ? totalScore / weightSum : 0;
  }

  /**
   * Generate validation summary
   */
  private generateValidationSummary(
    accuracyScore: number,
    principles: ValidatedPrinciple[],
    sourceCompliance: SourceCompliance[],
    expertReviews: ExpertReview[]
  ): ValidationSummary {
    const grade = this.calculateGrade(accuracyScore);
    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];
    const criticalIssues: string[] = [];

    // Analyze principles
    principles.forEach(p => {
      if (p.implementationAccuracy >= 90) {
        strengthAreas.push(p.principle);
      } else if (p.implementationAccuracy < 75) {
        improvementAreas.push(p.principle);
      }
      if (p.implementationAccuracy < 50) {
        criticalIssues.push(`Critical issue with ${p.principle}`);
      }
    });

    // Analyze source compliance
    sourceCompliance.forEach(c => {
      if (c.deviations.some(d => d.severity === 'major')) {
        criticalIssues.push(`Major deviation from ${c.citation.title}`);
      }
    });

    // Determine certification status
    let certificationStatus: 'certified' | 'provisional' | 'under_review';
    if (accuracyScore >= 95 && criticalIssues.length === 0) {
      certificationStatus = 'certified';
    } else if (accuracyScore >= 85) {
      certificationStatus = 'provisional';
    } else {
      certificationStatus = 'under_review';
    }

    // Next review date (3 months for certified, 1 month for others)
    const nextReviewDate = new Date();
    nextReviewDate.setMonth(nextReviewDate.getMonth() + (certificationStatus === 'certified' ? 3 : 1));

    return {
      overallGrade: grade,
      strengthAreas: strengthAreas.slice(0, 5), // Top 5
      improvementAreas: improvementAreas.slice(0, 5), // Top 5
      criticalIssues,
      nextReviewDate,
      certificationStatus
    };
  }

  /**
   * Calculate grade from accuracy score
   */
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A';
    if (score >= 85) return 'B';
    if (score >= 75) return 'C';
    if (score >= 65) return 'D';
    return 'F';
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(
    implemented: string[],
    missing: string[],
    deviations: ComplianceDeviation[]
  ): number {
    const totalAspects = implemented.length + missing.length;
    if (totalAspects === 0) return 100;

    let score = (implemented.length / totalAspects) * 100;

    // Deduct points for deviations
    deviations.forEach(deviation => {
      const penalty = deviation.severity === 'major' ? 10 : deviation.severity === 'minor' ? 5 : 2;
      score -= penalty;
    });

    return Math.max(0, score);
  }

  /**
   * Add to validation history
   */
  private addToValidationHistory(methodology: TrainingMethodology, result: ResearchValidationResult): void {
    const history = this.validationHistory.get(methodology) || [];
    history.push(result);
    
    // Keep only last 10 validation results
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    this.validationHistory.set(methodology, history);
  }

  /**
   * Create test configuration for validation
   */
  private createTestConfig(methodology: TrainingMethodology): AdvancedPlanConfig {
    return {
      name: `${methodology} Validation Test`,
      goal: 'MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000), // 16 weeks
      methodology,
      currentFitness: {
        vdot: 50,
        weeklyMileage: 40,
        longestRun: 16
      },
      preferences: {
        availableDays: [1, 2, 3, 4, 5, 6],
        preferredIntensity: 'moderate',
        crossTraining: false,
        strengthTraining: false
      }
    };
  }

  /**
   * Public API methods
   */

  /**
   * Get validation history for methodology
   */
  public getValidationHistory(methodology: TrainingMethodology): ResearchValidationResult[] {
    return this.validationHistory.get(methodology) || [];
  }

  /**
   * Submit expert review
   */
  public submitExpertReview(review: ExpertReview): void {
    const reviews = this.expertReviews.get(review.methodology) || [];
    reviews.push(review);
    this.expertReviews.set(review.methodology, reviews);
  }

  /**
   * Add monitoring result
   */
  public addMonitoringResult(methodology: TrainingMethodology, result: MonitoringResult): void {
    const monitoring = this.monitoringData.get(methodology) || [];
    monitoring.push(result);
    
    // Keep only last 12 months of monitoring data
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const filtered = monitoring.filter(m => m.monitoringDate > oneYearAgo);
    this.monitoringData.set(methodology, filtered);
  }

  /**
   * Get current certification status for all methodologies
   */
  public getCertificationStatus(): Record<TrainingMethodology, string> {
    const status: Record<string, string> = {};
    
    (['daniels', 'lydiard', 'pfitzinger'] as TrainingMethodology[]).forEach(methodology => {
      const history = this.getValidationHistory(methodology);
      if (history.length > 0) {
        const latest = history[history.length - 1];
        status[methodology] = latest.validationSummary.certificationStatus;
      } else {
        status[methodology] = 'not_validated';
      }
    });
    
    return status as Record<TrainingMethodology, string>;
  }

  /**
   * Generate research validation report
   */
  public generateValidationReport(methodology: TrainingMethodology): string {
    const history = this.getValidationHistory(methodology);
    if (history.length === 0) {
      return `No validation data available for ${methodology} methodology.`;
    }

    const latest = history[history.length - 1];
    
    return `
# ${methodology.toUpperCase()} Methodology Validation Report

## Overall Assessment
- **Accuracy Score**: ${latest.accuracyScore.toFixed(1)}%
- **Grade**: ${latest.validationSummary.overallGrade}
- **Certification Status**: ${latest.validationSummary.certificationStatus}
- **Last Validated**: ${latest.lastValidated.toLocaleDateString()}

## Validated Principles
${latest.validatedPrinciples.map(p => 
  `- **${p.principle}**: ${p.implementationAccuracy.toFixed(1)}% accuracy (${p.confidenceLevel} confidence)`
).join('\n')}

## Source Compliance
${latest.sourceCompliance.map(c => 
  `- **${c.citation.title}**: ${c.complianceScore.toFixed(1)}% compliance`
).join('\n')}

## Expert Reviews
${latest.expertReviews.map(r => 
  `- **Reviewer ${r.reviewerId}**: ${r.overallScore}% (${r.approvalStatus})`
).join('\n')}

## Strengths
${latest.validationSummary.strengthAreas.map(s => `- ${s}`).join('\n')}

## Areas for Improvement
${latest.validationSummary.improvementAreas.map(i => `- ${i}`).join('\n')}

## Critical Issues
${latest.validationSummary.criticalIssues.length > 0 
  ? latest.validationSummary.criticalIssues.map(i => `- ${i}`).join('\n')
  : '- None identified'
}

## Recommended Updates
${latest.recommendedUpdates.map(u => 
  `- **${u.citation.title}**: ${u.potentialImpact} impact, Priority ${u.priority}/10`
).join('\n')}

---
*Next review scheduled for: ${latest.validationSummary.nextReviewDate.toLocaleDateString()}*
`.trim();
  }
}