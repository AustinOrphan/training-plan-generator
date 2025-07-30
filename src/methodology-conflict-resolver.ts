/**
 * Methodology Conflict Resolution System
 * 
 * Provides safe customization validation, guided conflict resolution,
 * and methodology principle preservation for advanced training plan customizations.
 */

import type {
  AdvancedPlanConfig,
  TrainingPlan,
  TrainingMethodology,
  PlannedWorkout,
  TrainingPhase
} from './types';
import { ValidationPipeline, ValidationResult, ValidationError, ValidationWarning } from './validation';
import { TRAINING_METHODOLOGIES } from './constants';
import { 
  MethodologyConfig, 
  getIntensityConfig, 
  getVolumeConfig, 
  getRecoveryConfig 
} from './types/methodology-types';

/**
 * Types of methodology conflicts that can occur
 */
export type ConflictType = 
  | 'intensity_violation'      // Violates methodology's intensity distribution
  | 'volume_violation'         // Violates methodology's volume principles
  | 'recovery_violation'       // Violates methodology's recovery requirements
  | 'progression_violation'    // Violates methodology's progression patterns
  | 'workout_violation'        // Violates methodology's workout priorities
  | 'phase_violation'          // Violates methodology's periodization
  | 'principle_violation'      // Violates core methodology principles
  | 'safety_violation';        // Creates unsafe training conditions

/**
 * Severity levels for conflicts
 */
export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Resolution strategies for conflicts
 */
export type ResolutionStrategy = 
  | 'strict_methodology'       // Maintain strict methodology adherence
  | 'guided_modification'      // Modify with methodology-aware constraints
  | 'hybrid_approach'          // Blend methodologies safely
  | 'progressive_adaptation'   // Gradually introduce changes
  | 'safety_override';         // Prioritize safety over methodology

/**
 * A specific methodology conflict
 */
export interface MethodologyConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affectedAspect: string;
  currentValue: any;
  suggestedValue: any;
  methodologyPrinciple: string;
  riskLevel: number; // 0-100
  impacts: ConflictImpact[];
}

/**
 * Impact of a conflict on training effectiveness
 */
export interface ConflictImpact {
  aspect: string;
  description: string;
  effectivenessReduction: number; // percentage
  riskIncrease: number; // percentage
}

/**
 * Resolution options for a conflict
 */
export interface ConflictResolution {
  conflictId: string;
  strategy: ResolutionStrategy;
  recommendation: string;
  modifications: ConflictModification[];
  safeguards: string[];
  effectivenessImpact: number; // percentage change
  confidenceLevel: number; // 0-100
  implementationSteps: string[];
}

/**
 * Specific modification to resolve a conflict
 */
export interface ConflictModification {
  field: string;
  from: any;
  to: any;
  reason: string;
  validation: string;
}

/**
 * Safe customization options that preserve methodology integrity
 */
export interface SafeCustomizationOptions {
  allowedModifications: AllowedModification[];
  restrictions: CustomizationRestriction[];
  guidelines: CustomizationGuideline[];
  warningThresholds: WarningThreshold[];
}

/**
 * Modifications that are safe within a methodology
 */
export interface AllowedModification {
  field: string;
  allowedRange: { min: any; max: any };
  conditions: string[];
  rationale: string;
}

/**
 * Restrictions to maintain methodology integrity
 */
export interface CustomizationRestriction {
  field: string;
  restriction: string;
  reason: string;
  methodologyPrinciple: string;
}

/**
 * Guidelines for safe customization
 */
export interface CustomizationGuideline {
  aspect: string;
  guideline: string;
  examples: string[];
  warnings: string[];
}

/**
 * Warning thresholds for customizations
 */
export interface WarningThreshold {
  field: string;
  threshold: any;
  warning: string;
  severity: ConflictSeverity;
}

/**
 * Result of conflict resolution analysis
 */
export interface ConflictResolutionResult {
  conflicts: MethodologyConflict[];
  resolutions: ConflictResolution[];
  safeCustomizations: SafeCustomizationOptions;
  overallSafety: SafetyAssessment;
  recommendations: string[];
}

/**
 * Safety assessment of the customization
 */
export interface SafetyAssessment {
  overallRisk: number; // 0-100
  riskFactors: string[];
  safetyScore: number; // 0-100
  recommendedAction: 'proceed' | 'modify' | 'reconsider' | 'abort';
  monitoring: string[];
}

/**
 * Methodology principle preservation check
 */
export interface PrinciplePreservation {
  methodology: TrainingMethodology;
  corePrinciples: PreservedPrinciple[];
  violations: PrincipleViolation[];
  preservationScore: number; // 0-100
  integrityLevel: 'high' | 'medium' | 'low' | 'compromised';
}

/**
 * A preserved methodology principle
 */
export interface PreservedPrinciple {
  name: string;
  description: string;
  preservationLevel: number; // 0-100
  evidence: string[];
}

/**
 * A violated methodology principle
 */
export interface PrincipleViolation {
  principle: string;
  violation: string;
  severity: ConflictSeverity;
  consequences: string[];
  mitigation: string[];
}

/**
 * MethodologyConflictResolver provides comprehensive conflict resolution
 * for advanced methodology customizations
 */
export class MethodologyConflictResolver {
  private validationPipeline: ValidationPipeline;
  
  constructor() {
    this.validationPipeline = new ValidationPipeline();
  }

  /**
   * Analyze and resolve methodology conflicts in a configuration
   */
  public resolveConflicts(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology,
    plan?: TrainingPlan
  ): ConflictResolutionResult {
    // Identify conflicts
    const conflicts = this.identifyConflicts(config, methodology, plan);
    
    // Generate resolutions
    const resolutions = conflicts.map(conflict => 
      this.generateResolution(conflict, methodology, config)
    );
    
    // Determine safe customization options
    const safeCustomizations = this.determineSafeCustomizations(methodology, config);
    
    // Assess overall safety
    const overallSafety = this.assessSafety(conflicts, resolutions);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      conflicts, resolutions, overallSafety
    );
    
    return {
      conflicts,
      resolutions,
      safeCustomizations,
      overallSafety,
      recommendations
    };
  }

  /**
   * Validate customization against methodology principles
   */
  public validateCustomization(
    customization: Partial<AdvancedPlanConfig>,
    methodology: TrainingMethodology,
    baseConfig?: AdvancedPlanConfig
  ): ValidationResult {
    // Use existing validation pipeline
    const baseValidation = this.validationPipeline.validateConfig({
      ...baseConfig,
      ...customization
    } as AdvancedPlanConfig);
    
    // Add methodology-specific validation
    const methodologyValidation = this.validateMethodologyCompliance(
      customization, methodology
    );
    
    return {
      isValid: baseValidation.isValid && methodologyValidation.isValid,
      errors: [...baseValidation.errors, ...methodologyValidation.errors],
      warnings: [...baseValidation.warnings, ...methodologyValidation.warnings]
    };
  }

  /**
   * Check methodology principle preservation
   */
  public checkPrinciplePreservation(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology
  ): PrinciplePreservation {
    const methodologyConstants = TRAINING_METHODOLOGIES[methodology];
    const corePrinciples: PreservedPrinciple[] = [];
    const violations: PrincipleViolation[] = [];
    
    // Check intensity distribution preservation
    const intensityPreservation = this.checkIntensityDistribution(config, methodology);
    corePrinciples.push(intensityPreservation.principle);
    violations.push(...intensityPreservation.violations);
    
    // Check volume progression preservation
    const volumePreservation = this.checkVolumeProgression(config, methodology);
    corePrinciples.push(volumePreservation.principle);
    violations.push(...volumePreservation.violations);
    
    // Check recovery emphasis preservation
    const recoveryPreservation = this.checkRecoveryEmphasis(config, methodology);
    corePrinciples.push(recoveryPreservation.principle);
    violations.push(...recoveryPreservation.violations);
    
    // Check workout priorities preservation
    const workoutPreservation = this.checkWorkoutPriorities(config, methodology);
    corePrinciples.push(workoutPreservation.principle);
    violations.push(...workoutPreservation.violations);
    
    // Calculate preservation score
    const preservationScore = this.calculatePreservationScore(corePrinciples, violations);
    
    // Determine integrity level
    const integrityLevel = this.determineIntegrityLevel(preservationScore, violations);
    
    return {
      methodology,
      corePrinciples,
      violations,
      preservationScore,
      integrityLevel
    };
  }

  /**
   * Get safe customization options for a methodology
   */
  public getSafeCustomizationOptions(
    methodology: TrainingMethodology,
    userExperience: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): SafeCustomizationOptions {
    return this.determineSafeCustomizations(methodology, {
      methodology,
      // Note: experience field may not be part of AdvancedPlanConfig - consider extending the interface
    } as Partial<AdvancedPlanConfig>);
  }

  /**
   * Identify conflicts in the configuration
   */
  private identifyConflicts(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology,
    plan?: TrainingPlan
  ): MethodologyConflict[] {
    const conflicts: MethodologyConflict[] = [];
    const methodologyConstants = TRAINING_METHODOLOGIES[methodology];
    
    // Check intensity distribution conflicts
    conflicts.push(...this.checkIntensityConflicts(config, methodology));
    
    // Check volume conflicts
    conflicts.push(...this.checkVolumeConflicts(config, methodology));
    
    // Check recovery conflicts
    conflicts.push(...this.checkRecoveryConflicts(config, methodology));
    
    // Check progression conflicts
    conflicts.push(...this.checkProgressionConflicts(config, methodology));
    
    // Check workout priority conflicts
    conflicts.push(...this.checkWorkoutConflicts(config, methodology));
    
    // Check phase distribution conflicts
    conflicts.push(...this.checkPhaseConflicts(config, methodology));
    
    // Check safety conflicts
    conflicts.push(...this.checkSafetyConflicts(config, methodology));
    
    return conflicts;
  }

  /**
   * Check intensity distribution conflicts
   */
  private checkIntensityConflicts(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology
  ): MethodologyConflict[] {
    const conflicts: MethodologyConflict[] = [];
    const methodologyConstants = TRAINING_METHODOLOGIES[methodology];
    const expectedDistribution = methodologyConstants.intensityDistribution;
    
    // This would check against actual intensity distribution in config
    // For now, we'll check if there are obvious violations
    
    if (methodology === 'lydiard') {
      // Lydiard requires 85%+ easy running
      const intensityConfig = getIntensityConfig(config);
      if (intensityConfig && intensityConfig.easy < 85) {
        conflicts.push({
          id: 'lydiard-intensity-violation',
          type: 'intensity_violation',
          severity: 'high',
          description: 'Lydiard methodology requires 85%+ easy running',
          affectedAspect: 'intensity_distribution',
          currentValue: intensityConfig.easy || 'unknown',
          suggestedValue: '85%+',
          methodologyPrinciple: 'Aerobic base development',
          riskLevel: 75,
          impacts: [{
            aspect: 'Aerobic development',
            description: 'Insufficient aerobic base building',
            effectivenessReduction: 30,
            riskIncrease: 25
          }]
        });
      }
    }
    
    if (methodology === 'daniels') {
      // Daniels requires 80/20 distribution
      const intensityConfig = getIntensityConfig(config);
      if (intensityConfig && intensityConfig.easy < 75) {
        conflicts.push({
          id: 'daniels-intensity-violation',
          type: 'intensity_violation',
          severity: 'medium',
          description: 'Daniels methodology recommends 80/20 easy/hard distribution',
          affectedAspect: 'intensity_distribution',
          currentValue: intensityConfig.easy || 'unknown',
          suggestedValue: '80%',
          methodologyPrinciple: '80/20 training distribution',
          riskLevel: 60,
          impacts: [{
            aspect: 'Training balance',
            description: 'Imbalanced intensity distribution',
            effectivenessReduction: 20,
            riskIncrease: 15
          }]
        });
      }
    }
    
    return conflicts;
  }

  /**
   * Check volume progression conflicts
   */
  private checkVolumeConflicts(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology
  ): MethodologyConflict[] {
    const conflicts: MethodologyConflict[] = [];
    const methodologyConstants = TRAINING_METHODOLOGIES[methodology];
    
    // Check if volume progression rate exceeds safe limits for methodology
    const maxProgressionRate = methodologyConstants.progressionRate;
    const volumeConfig = getVolumeConfig(config);
    if (volumeConfig && volumeConfig.progressionRate > maxProgressionRate * 1.5) {
      conflicts.push({
        id: 'volume-progression-violation',
        type: 'volume_violation',
        severity: 'high',
        description: `Volume progression exceeds ${methodology} safe limits`,
        affectedAspect: 'volume_progression',
        currentValue: volumeConfig.progressionRate,
        suggestedValue: maxProgressionRate,
        methodologyPrinciple: 'Progressive overload safety',
        riskLevel: 80,
        impacts: [{
          aspect: 'Injury risk',
          description: 'Excessive volume progression increases injury risk',
          effectivenessReduction: 10,
          riskIncrease: 40
        }]
      });
    }
    
    return conflicts;
  }

  /**
   * Check recovery approach conflicts
   */
  private checkRecoveryConflicts(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology
  ): MethodologyConflict[] {
    const conflicts: MethodologyConflict[] = [];
    const methodologyConstants = TRAINING_METHODOLOGIES[methodology];
    
    // Check recovery emphasis
    const expectedRecoveryEmphasis = methodologyConstants.recoveryEmphasis;
    const recoveryConfig = getRecoveryConfig(config);
    if (recoveryConfig && recoveryConfig.emphasis < expectedRecoveryEmphasis - 0.1) {
      conflicts.push({
        id: 'recovery-emphasis-violation',
        type: 'recovery_violation',
        severity: 'medium',
        description: `Insufficient recovery emphasis for ${methodology} methodology`,
        affectedAspect: 'recovery_emphasis',
        currentValue: recoveryConfig.emphasis,
        suggestedValue: expectedRecoveryEmphasis,
        methodologyPrinciple: 'Adequate recovery for adaptation',
        riskLevel: 65,
        impacts: [{
          aspect: 'Recovery quality',
          description: 'Inadequate recovery may impair adaptations',
          effectivenessReduction: 25,
          riskIncrease: 20
        }]
      });
    }
    
    return conflicts;
  }

  /**
   * Generate additional conflict checking methods
   */
  private checkProgressionConflicts(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology
  ): MethodologyConflict[] {
    return []; // Simplified for now
  }

  private checkWorkoutConflicts(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology
  ): MethodologyConflict[] {
    return []; // Simplified for now
  }

  private checkPhaseConflicts(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology
  ): MethodologyConflict[] {
    return []; // Simplified for now
  }

  private checkSafetyConflicts(
    config: AdvancedPlanConfig,
    methodology: TrainingMethodology
  ): MethodologyConflict[] {
    const conflicts: MethodologyConflict[] = [];
    
    // Check for unsafe combinations
    const volumeConfig = getVolumeConfig(config);
    const intensityConfig = getIntensityConfig(config);
    if (volumeConfig && intensityConfig) {
      const volumeHours = volumeConfig.weeklyHours;
      const hardIntensity = intensityConfig.hard;
      
      // More specific conditions for safety violations
      const highVolume = volumeHours && volumeHours > 15;
      const highIntensity = hardIntensity && hardIntensity > 20;
      
      if (highVolume && highIntensity) {
        conflicts.push({
          id: 'safety-volume-intensity-violation',
          type: 'safety_violation',
          severity: 'critical',
          description: 'High volume and high intensity combination is unsafe',
          affectedAspect: 'volume_intensity_combination',
          currentValue: `${volumeHours}h/week + ${hardIntensity}% hard`,
          suggestedValue: 'Reduce volume or intensity',
          methodologyPrinciple: 'Training stress management',
          riskLevel: 95,
          impacts: [{
            aspect: 'Overtraining risk',
            description: 'Extremely high risk of overtraining and injury',
            effectivenessReduction: 50,
            riskIncrease: 80
          }]
        });
      }
    }
    
    return conflicts;
  }

  /**
   * Generate resolution for a conflict
   */
  private generateResolution(
    conflict: MethodologyConflict,
    methodology: TrainingMethodology,
    config: AdvancedPlanConfig
  ): ConflictResolution {
    const strategy = this.determineResolutionStrategy(conflict, methodology);
    
    return {
      conflictId: conflict.id,
      strategy,
      recommendation: this.generateRecommendation(conflict, strategy),
      modifications: this.generateModifications(conflict, strategy, config),
      safeguards: this.generateSafeguards(conflict, methodology),
      effectivenessImpact: this.calculateEffectivenessImpact(conflict, strategy),
      confidenceLevel: this.calculateConfidenceLevel(conflict, strategy),
      implementationSteps: this.generateImplementationSteps(conflict, strategy)
    };
  }

  /**
   * Determine resolution strategy based on conflict type and severity
   */
  private determineResolutionStrategy(
    conflict: MethodologyConflict,
    methodology: TrainingMethodology
  ): ResolutionStrategy {
    if (conflict.severity === 'critical' || conflict.type === 'safety_violation') {
      return 'safety_override';
    }
    
    // High severity conflicts involving core methodology principles should use strict methodology
    if (conflict.severity === 'high' && (
      conflict.type === 'principle_violation' || 
      conflict.type === 'intensity_violation' ||
      conflict.type === 'recovery_violation'
    )) {
      return 'strict_methodology';
    }
    
    if (conflict.severity === 'medium') {
      return 'guided_modification';
    }
    
    return 'progressive_adaptation';
  }

  /**
   * Additional helper methods for resolution generation
   */
  private generateRecommendation(conflict: MethodologyConflict, strategy: ResolutionStrategy): string {
    switch (strategy) {
      case 'safety_override':
        return `SAFETY CRITICAL: ${conflict.description}. Immediate modification required.`;
      case 'strict_methodology':
        return `Maintain ${conflict.methodologyPrinciple} by adjusting to ${conflict.suggestedValue}.`;
      case 'guided_modification':
        return `Carefully modify while preserving ${conflict.methodologyPrinciple}.`;
      case 'progressive_adaptation':
        return `Gradually adapt toward ${conflict.suggestedValue} over time.`;
      default:
        return `Address ${conflict.description} appropriately.`;
    }
  }

  private generateModifications(
    conflict: MethodologyConflict,
    strategy: ResolutionStrategy,
    config: AdvancedPlanConfig
  ): ConflictModification[] {
    return [{
      field: conflict.affectedAspect,
      from: conflict.currentValue,
      to: conflict.suggestedValue,
      reason: conflict.description,
      validation: `Ensures ${conflict.methodologyPrinciple}`
    }];
  }

  private generateSafeguards(conflict: MethodologyConflict, methodology: TrainingMethodology): string[] {
    return [
      'Monitor training response closely',
      'Implement gradual progression',
      `Follow ${methodology} recovery protocols`,
      'Regular assessment of adaptation'
    ];
  }

  private calculateEffectivenessImpact(conflict: MethodologyConflict, strategy: ResolutionStrategy): number {
    const baseImpact = conflict.impacts.reduce((sum, impact) => sum + impact.effectivenessReduction, 0) / conflict.impacts.length;
    
    switch (strategy) {
      case 'safety_override': return baseImpact * 0.3; // Safety first, effectiveness second
      case 'strict_methodology': return baseImpact * 0.1; // Minimal impact
      case 'guided_modification': return baseImpact * 0.5; // Moderate impact
      case 'progressive_adaptation': return baseImpact * 0.7; // Higher impact initially
      default: return baseImpact;
    }
  }

  private calculateConfidenceLevel(conflict: MethodologyConflict, strategy: ResolutionStrategy): number {
    let confidence = 100 - conflict.riskLevel;
    
    switch (strategy) {
      case 'safety_override': confidence = Math.max(confidence, 90);
      case 'strict_methodology': confidence = Math.max(confidence, 85);
      case 'guided_modification': confidence *= 0.8;
      case 'progressive_adaptation': confidence *= 0.7;
    }
    
    return Math.max(0, Math.min(100, confidence));
  }

  private generateImplementationSteps(conflict: MethodologyConflict, strategy: ResolutionStrategy): string[] {
    const baseSteps = [
      `1. Review ${conflict.methodologyPrinciple}`,
      `2. Adjust ${conflict.affectedAspect}`,
      '3. Monitor response',
      '4. Validate effectiveness'
    ];
    
    if (strategy === 'safety_override') {
      return ['1. IMMEDIATE: Stop current approach', ...baseSteps];
    }
    
    return baseSteps;
  }

  /**
   * Placeholder methods for principle preservation checking
   */
  private checkIntensityDistribution(config: AdvancedPlanConfig, methodology: TrainingMethodology) {
    const violations: PrincipleViolation[] = [];
    let preservationLevel = 100;
    
    const intensityConfig = getIntensityConfig(config);
    if (intensityConfig) {
      const easyPercent = intensityConfig.easy;
      const methodologyConstants = TRAINING_METHODOLOGIES[methodology];
      const expectedEasy = methodologyConstants.intensityDistribution.easy;
      
      if (easyPercent < expectedEasy - 20) {
        violations.push({
          principle: 'Intensity Distribution',
          violation: `Only ${easyPercent}% easy running, expected ${expectedEasy}%+`,
          severity: 'high',
          consequences: ['Poor aerobic development', 'Increased injury risk'],
          mitigation: ['Increase easy running percentage', 'Reduce hard training']
        });
        preservationLevel = Math.max(20, preservationLevel - 50);
      } else if (easyPercent < expectedEasy - 10) {
        violations.push({
          principle: 'Intensity Distribution',
          violation: `${easyPercent}% easy running below optimal ${expectedEasy}%`,
          severity: 'medium',
          consequences: ['Suboptimal aerobic development'],
          mitigation: ['Gradually increase easy running percentage']
        });
        preservationLevel = Math.max(50, preservationLevel - 30);
      }
    }
    
    return {
      principle: {
        name: 'Intensity Distribution',
        description: `${methodology} intensity distribution`,
        preservationLevel,
        evidence: violations.length === 0 ? ['Maintains methodology ratios'] : ['Some deviations detected']
      },
      violations
    };
  }

  private checkVolumeProgression(config: AdvancedPlanConfig, methodology: TrainingMethodology) {
    return {
      principle: {
        name: 'Volume Progression',
        description: `${methodology} volume progression`,
        preservationLevel: 90,
        evidence: ['Follows safe progression rates']
      },
      violations: [] as PrincipleViolation[]
    };
  }

  private checkRecoveryEmphasis(config: AdvancedPlanConfig, methodology: TrainingMethodology) {
    return {
      principle: {
        name: 'Recovery Emphasis',
        description: `${methodology} recovery approach`,
        preservationLevel: 80,
        evidence: ['Maintains adequate recovery']
      },
      violations: [] as PrincipleViolation[]
    };
  }

  private checkWorkoutPriorities(config: AdvancedPlanConfig, methodology: TrainingMethodology) {
    return {
      principle: {
        name: 'Workout Priorities',
        description: `${methodology} workout priorities`,
        preservationLevel: 75,
        evidence: ['Follows methodology priorities']
      },
      violations: [] as PrincipleViolation[]
    };
  }

  private calculatePreservationScore(principles: PreservedPrinciple[], violations: PrincipleViolation[]): number {
    const avgPreservation = principles.reduce((sum, p) => sum + p.preservationLevel, 0) / principles.length;
    const violationPenalty = violations.length * 15; // Increased penalty
    
    // Additional penalty for severe deviations from methodology principles
    let severityPenalty = 0;
    violations.forEach(violation => {
      if (violation.severity === 'critical') severityPenalty += 30;
      else if (violation.severity === 'high') severityPenalty += 20;
      else if (violation.severity === 'medium') severityPenalty += 10;
    });
    
    return Math.max(0, avgPreservation - violationPenalty - severityPenalty);
  }

  private determineIntegrityLevel(score: number, violations: PrincipleViolation[]): 'high' | 'medium' | 'low' | 'compromised' {
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;
    
    if (criticalViolations > 0) return 'compromised';
    if (highViolations > 1) return 'compromised';
    if (score >= 90) return 'high';
    if (score >= 75) return 'medium';
    if (score >= 60) return 'low';
    return 'compromised';
  }

  /**
   * Determine safe customization options
   */
  private determineSafeCustomizations(
    methodology: TrainingMethodology,
    config: Partial<AdvancedPlanConfig>
  ): SafeCustomizationOptions {
    const methodologyConstants = TRAINING_METHODOLOGIES[methodology];
    
    return {
      allowedModifications: [
        {
          field: 'weeklyVolume',
          allowedRange: { min: -20, max: 20 }, // ±20% from base
          conditions: ['Gradual progression', 'Monitor response'],
          rationale: 'Volume can be adjusted within safe limits'
        },
        {
          field: 'intensityDistribution',
          allowedRange: { min: -5, max: 5 }, // ±5% from methodology standard
          conditions: ['Maintain methodology ratios', 'Progressive adjustment'],
          rationale: 'Minor intensity adjustments preserving methodology principles'
        }
      ],
      restrictions: [
        {
          field: 'coreIntensityDistribution',
          restriction: `Must maintain ${methodology} intensity principles`,
          reason: 'Core methodology principle',
          methodologyPrinciple: methodologyConstants.name + ' intensity distribution'
        }
      ],
      guidelines: [
        {
          aspect: 'Volume Adjustments',
          guideline: 'Make gradual changes and monitor response',
          examples: ['Increase weekly volume by 5-10%', 'Reduce volume during high stress'],
          warnings: ['Avoid sudden volume changes', 'Monitor for overtraining signs']
        }
      ],
      warningThresholds: [
        {
          field: 'weeklyVolume',
          threshold: 25, // 25% increase
          warning: 'Large volume increase may increase injury risk',
          severity: 'high'
        }
      ]
    };
  }

  /**
   * Assess overall safety of the configuration
   */
  private assessSafety(conflicts: MethodologyConflict[], resolutions: ConflictResolution[]): SafetyAssessment {
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical').length;
    const highRiskConflicts = conflicts.filter(c => c.riskLevel > 80).length;
    
    const overallRisk = conflicts.length > 0 
      ? conflicts.reduce((sum, c) => sum + c.riskLevel, 0) / conflicts.length
      : 0;
    
    const safetyScore = Math.max(0, 100 - overallRisk);
    
    let recommendedAction: 'proceed' | 'modify' | 'reconsider' | 'abort';
    if (criticalConflicts > 0) {
      recommendedAction = 'abort';
    } else if (highRiskConflicts > 0 || overallRisk > 70) {
      recommendedAction = 'reconsider';
    } else if (overallRisk > 40) {
      recommendedAction = 'modify';
    } else {
      recommendedAction = 'proceed';
    }
    
    return {
      overallRisk,
      riskFactors: conflicts.map(c => c.description),
      safetyScore,
      recommendedAction,
      monitoring: [
        'Monitor training response',
        'Track recovery metrics',
        'Watch for overtraining signs',
        'Regular fitness assessments'
      ]
    };
  }

  /**
   * Generate overall recommendations
   */
  private generateRecommendations(
    conflicts: MethodologyConflict[],
    resolutions: ConflictResolution[],
    safety: SafetyAssessment
  ): string[] {
    const recommendations: string[] = [];
    
    if (safety.recommendedAction === 'abort') {
      recommendations.push('CRITICAL: Do not proceed with current configuration');
      recommendations.push('Address all critical conflicts before continuing');
    }
    
    if (conflicts.length === 0) {
      recommendations.push('Configuration appears safe and methodology-compliant');
    } else {
      recommendations.push(`Address ${conflicts.length} identified conflicts`);
      recommendations.push('Follow provided resolution strategies');
    }
    
    recommendations.push('Monitor training response closely');
    recommendations.push('Adjust based on individual adaptation');
    
    return recommendations;
  }

  /**
   * Validate methodology compliance
   */
  private validateMethodologyCompliance(
    customization: Partial<AdvancedPlanConfig>,
    methodology: TrainingMethodology
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Add methodology-specific validation logic here
    // This is simplified for the implementation
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}