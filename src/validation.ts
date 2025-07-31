/**
 * Validation Pipeline
 * 
 * Ensures data consistency and integrity throughout the training plan
 * generation, adaptation, and export workflow.
 */

import type {
  AdvancedPlanConfig,
  TrainingPlan,
  PlannedWorkout,
  ProgressData,
  FitnessAssessment
} from './types';
import type { ExportResult } from './export';
import { 
  validationGuards,
  validationUtils,
  primitiveGuards
} from './types/type-guards';
import type { TypedResult } from './types/base-types';
import { TypeValidationError } from './types/base-types';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
  context?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
  context?: unknown;
}

/**
 * Comprehensive validation pipeline for training plan data
 */
export class ValidationPipeline {
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  /**
   * Validate training plan configuration
   */
  validateConfig(config: unknown): ValidationResult {
    this.reset();

    // Use type guard to validate the config structure
    const configValidation = validationUtils.safeCast(config, validationGuards.isAdvancedPlanConfig, 'config');
    if (!configValidation.success) {
      this.addError('config', configValidation.error.message);
      return this.getResult();
    }

    const validConfig = configValidation.data;

    // Required fields (already validated by type guard, but checking for completeness)
    if (!primitiveGuards.isNonEmptyString(validConfig.name)) {
      this.addError('config.name', 'Plan name is required and must be non-empty');
    }

    if (!primitiveGuards.isNonEmptyString(validConfig.goal)) {
      this.addError('config.goal', 'Training goal is required and must be non-empty');
    }

    if (!primitiveGuards.isDate(validConfig.startDate)) {
      this.addError('config.startDate', 'Start date is required and must be a valid date');
    }

    if (!primitiveGuards.isDate(validConfig.targetDate)) {
      this.addError('config.targetDate', 'Target date is required and must be a valid date');
    }

    // Date validation using validated config
    if (primitiveGuards.isDate(validConfig.startDate) && primitiveGuards.isDate(validConfig.targetDate)) {
      const duration = validConfig.targetDate.getTime() - validConfig.startDate.getTime();
      const weeks = duration / (7 * 24 * 60 * 60 * 1000);

      if (weeks < 4) {
        this.addError('config.duration', 'Plan duration must be at least 4 weeks');
      }

      if (weeks > 52) {
        this.addWarning('config.duration', 'Plan duration exceeds 52 weeks - consider breaking into phases');
      }

      if (validConfig.startDate.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
        this.addWarning('config.startDate', 'Start date is in the past');
      }
    }

    // Fitness validation - use type guard for fitness assessment
    const fitnessValidation = validationUtils.safeCast(validConfig.currentFitness, validationGuards.isFitnessAssessment, 'currentFitness');
    if (fitnessValidation.success) {
      this.validateFitnessAssessment(fitnessValidation.data);
    } else {
      this.addError('config.currentFitness', 'Invalid fitness assessment: ' + fitnessValidation.error.message);
    }

    // Preferences validation - use type guard
    const preferencesValidation = validationUtils.safeCast(validConfig.preferences, validationGuards.isTrainingPreferences, 'preferences');
    if (preferencesValidation.success) {
      const preferences = preferencesValidation.data;
      if (primitiveGuards.isArray(preferences.availableDays, primitiveGuards.isNumber)) {
        const days = preferences.availableDays;
        if (days.length < 3) {
          this.addWarning('config.preferences.availableDays', 'Less than 3 training days may limit plan effectiveness');
        }
        
        days.forEach(day => {
          if (day < 0 || day > 6) {
            this.addError('config.preferences.availableDays', `Invalid day value: ${day}. Must be 0-6`);
          }
        });
      }

      if (primitiveGuards.isObject(preferences.timeConstraints)) {
        Object.entries(preferences.timeConstraints).forEach(([day, time]) => {
          const dayNum = parseInt(day);
          if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
            this.addError('config.preferences.timeConstraints', `Invalid day key: ${day}`);
          }
          if (primitiveGuards.isNumber(time)) {
            if (time < 15) {
              this.addError('config.preferences.timeConstraints', `Time constraint too short: ${time} minutes on day ${day}`);
            }
            if (time > 480) {
              this.addWarning('config.preferences.timeConstraints', `Time constraint very long: ${time} minutes on day ${day}`);
            }
          }
        });
      }
    } else {
      this.addError('config.preferences', 'Invalid training preferences: ' + preferencesValidation.error.message);
    }

    // Methodology validation using type-safe approach
    if (validConfig.methodology && !['daniels', 'lydiard', 'pfitzinger', 'hanson', 'custom'].includes(validConfig.methodology)) {
      this.addError('config.methodology', `Invalid methodology: ${validConfig.methodology}`);
    }

    return this.getResult();
  }

  /**
   * Validate fitness assessment data
   */
  private validateFitnessAssessment(fitness: FitnessAssessment): void {
    if (fitness.vdot !== undefined) {
      if (fitness.vdot < 20 || fitness.vdot > 85) {
        this.addError('currentFitness.vdot', `VDOT ${fitness.vdot} out of valid range (20-85)`);
      }
    }

    if (fitness.weeklyMileage !== undefined) {
      if (fitness.weeklyMileage < 0) {
        this.addError('currentFitness.weeklyMileage', 'Weekly mileage cannot be negative');
      }
      if (fitness.weeklyMileage > 200) {
        this.addWarning('currentFitness.weeklyMileage', 'Weekly mileage exceeds 200km - ensure this is accurate');
      }
    }

    if (fitness.longestRecentRun !== undefined) {
      if (fitness.longestRecentRun < 0) {
        this.addError('currentFitness.longestRecentRun', 'Longest run cannot be negative');
      }
      if (fitness.weeklyMileage && fitness.longestRecentRun > fitness.weeklyMileage) {
        this.addError('currentFitness.longestRecentRun', 'Longest run exceeds weekly mileage');
      }
    }

    if (fitness.trainingAge !== undefined) {
      if (fitness.trainingAge < 0) {
        this.addError('currentFitness.trainingAge', 'Training age cannot be negative');
      }
      if (fitness.trainingAge > 50) {
        this.addWarning('currentFitness.trainingAge', 'Training age exceeds 50 years - verify accuracy');
      }
    }

    if (fitness.recoveryRate !== undefined) {
      if (fitness.recoveryRate < 0 || fitness.recoveryRate > 100) {
        this.addError('currentFitness.recoveryRate', 'Recovery rate must be between 0-100');
      }
    }
  }

  /**
   * Validate generated training plan
   */
  validatePlan(plan: unknown): ValidationResult {
    this.reset();

    // Use type guard to validate the plan structure
    const planValidation = validationUtils.safeCast(plan, validationGuards.isTrainingPlan, 'plan');
    if (!planValidation.success) {
      this.addError('plan', planValidation.error.message);
      return this.getResult();
    }

    const validPlan = planValidation.data;

    // Basic structure validation (already validated by type guard, but checking for completeness)
    if (!primitiveGuards.isString(validPlan.id)) {
      this.addError('plan.id', 'Plan ID is required');
    }

    if (!validPlan.config) {
      this.addError('plan.config', 'Plan configuration is required');
    }

    if (!primitiveGuards.isArray(validPlan.workouts)) {
      this.addError('plan.workouts', 'Workouts must be an array');
    }

    if (!primitiveGuards.isObject(validPlan.summary)) {
      this.addError('plan.summary', 'Plan summary is required');
    }

    // Validate workouts using validated plan
    if (primitiveGuards.isArray(validPlan.workouts)) {
      if (validPlan.workouts.length === 0) {
        this.addError('plan.workouts', 'Plan has no workouts');
      }

      validPlan.workouts.forEach((workout, index) => {
        this.validateWorkout(workout, index, validPlan);
      });

      // Check chronological order
      for (let i = 1; i < validPlan.workouts.length; i++) {
        if (validPlan.workouts[i].date.getTime() < validPlan.workouts[i-1].date.getTime()) {
          this.addError('plan.workouts', `Workouts not in chronological order at index ${i}`);
        }
      }
    }

    // Validate summary consistency
    if (primitiveGuards.isObject(validPlan.summary) && primitiveGuards.isArray(validPlan.workouts)) {
      const actualWorkouts = validPlan.workouts.length;
      const summaryWorkouts = validPlan.summary.totalWorkouts;
      if (primitiveGuards.isNumber(summaryWorkouts) && summaryWorkouts !== actualWorkouts) {
        this.addError('plan.summary.totalWorkouts', `Summary count (${summaryWorkouts}) doesn't match actual workouts (${actualWorkouts})`);
      }

      const actualDistance = validPlan.workouts.reduce((sum, w) => {
        return sum + (primitiveGuards.isNumber(w.targetMetrics.distance) ? w.targetMetrics.distance : 0);
      }, 0);
      const summaryDistance = validPlan.summary.totalDistance;
      if (primitiveGuards.isNumber(summaryDistance)) {
        const distanceDiff = Math.abs(actualDistance - summaryDistance);
        if (distanceDiff > 1) { // Allow 1km tolerance for rounding
          this.addError('plan.summary.totalDistance', `Summary distance (${summaryDistance}) doesn't match calculated (${actualDistance})`);
        }
      }
    }

    return this.getResult();
  }

  /**
   * Validate individual workout
   */
  private validateWorkout(workout: PlannedWorkout, index: number, plan: TrainingPlan): void {
    const prefix = `workouts[${index}]`;

    if (!workout.id) {
      this.addError(`${prefix}.id`, 'Workout ID is required');
    }

    if (!workout.name) {
      this.addError(`${prefix}.name`, 'Workout name is required');
    }

    if (!workout.type) {
      this.addError(`${prefix}.type`, 'Workout type is required');
    }

    if (!workout.date) {
      this.addError(`${prefix}.date`, 'Workout date is required');
    } else {
      // Validate date is within plan range
      if (plan.config) {
        if (workout.date.getTime() < plan.config.startDate.getTime()) {
          this.addError(`${prefix}.date`, 'Workout date before plan start');
        }
        if (plan.config.targetDate && workout.date.getTime() > plan.config.targetDate.getTime()) {
          this.addError(`${prefix}.date`, 'Workout date after plan end');
        }
      }
    }

    // Validate metrics
    if (!workout.targetMetrics) {
      this.addError(`${prefix}.targetMetrics`, 'Target metrics are required');
    } else {
      if (workout.targetMetrics.duration <= 0) {
        this.addError(`${prefix}.targetMetrics.duration`, 'Duration must be positive');
      }
      if (workout.targetMetrics.duration > 480) {
        this.addWarning(`${prefix}.targetMetrics.duration`, 'Duration exceeds 8 hours');
      }

      if (workout.targetMetrics.distance !== undefined) {
        if (workout.targetMetrics.distance < 0) {
          this.addError(`${prefix}.targetMetrics.distance`, 'Distance cannot be negative');
        }
        if (workout.targetMetrics.distance > 100) {
          this.addWarning(`${prefix}.targetMetrics.distance`, 'Distance exceeds 100km');
        }
      }

      if (workout.targetMetrics.tss !== undefined) {
        if (workout.targetMetrics.tss < 0) {
          this.addError(`${prefix}.targetMetrics.tss`, 'TSS cannot be negative');
        }
        if (workout.targetMetrics.tss > 500) {
          this.addWarning(`${prefix}.targetMetrics.tss`, 'TSS exceeds 500');
        }
      }

      // Note: pace validation removed as WorkoutMetrics interface doesn't include pace property
      // Consider adding pace to WorkoutMetrics interface if pace validation is needed
    }
  }

  /**
   * Validate progress data
   */
  validateProgressData(progress: unknown): ValidationResult {
    this.reset();

    if (!primitiveGuards.isArray(progress)) {
      this.addError('progress', 'Progress data must be an array');
      return this.getResult();
    }

    // Validate each progress entry using type guards
    const progressValidation = validationUtils.validateArray(progress, validationGuards.isProgressData, 'progress');
    if (!progressValidation.success) {
      this.addError('progress', progressValidation.error.message);
      return this.getResult();
    }

    const validProgress = progressValidation.data;

    validProgress.forEach((entry, index) => {
      const prefix = `progress[${index}]`;

      // Additional validation for progress entries (type guard already validated structure)
      if (!primitiveGuards.isDate(entry.date)) {
        this.addError(`${prefix}.date`, 'Progress date is required and must be valid');
      }

      // Validate completion metrics - completedWorkouts is optional in ProgressData
      if (entry.completedWorkouts && primitiveGuards.isArray(entry.completedWorkouts)) {
        entry.completedWorkouts.forEach((completion, completionIndex) => {
          const completionPrefix = `${prefix}.completedWorkouts[${completionIndex}]`;
          
          if (completion.completionRate < 0 || completion.completionRate > 1) {
            this.addError(`${completionPrefix}.completionRate`, 'Completion rate must be between 0-1');
          }

          if (completion.actualDuration < 0) {
            this.addError(`${completionPrefix}.actualDuration`, 'Duration cannot be negative');
          }

          if (completion.actualDistance !== undefined && completion.actualDistance < 0) {
            this.addError(`${completionPrefix}.actualDistance`, 'Distance cannot be negative');
          }

          if (!['complete', 'partial', 'none'].includes(completion.adherence)) {
            this.addError(`${completionPrefix}.adherence`, 'Invalid adherence value');
          }

          if (completion.difficultyRating !== undefined) {
            if (completion.difficultyRating < 1 || completion.difficultyRating > 10) {
              this.addError(`${completionPrefix}.difficultyRating`, 'Difficulty rating must be 1-10');
            }
          }
        });
      }
    });

    return this.getResult();
  }

  /**
   * Validate export result
   */
  validateExportResult(result: ExportResult, expectedFormat: string): ValidationResult {
    this.reset();

    if (!result.metadata?.format) {
      this.addError('result.metadata.format', 'Export format is required');
    } else if (result.metadata.format !== expectedFormat) {
      this.addError('result.metadata.format', `Format mismatch: expected ${expectedFormat}, got ${result.metadata.format}`);
    }

    if (!result.filename) {
      this.addError('result.filename', 'Filename is required');
    } else {
      // Check file extension
      const expectedExt = expectedFormat === 'ical' ? 'ics' : expectedFormat;
      if (!result.filename.endsWith(`.${expectedExt}`)) {
        this.addError('result.filename', `Filename should end with .${expectedExt}`);
      }
    }

    if (!result.content) {
      this.addError('result.content', 'Export content is required');
    }

    if (result.size <= 0) {
      this.addError('result.size', 'Export size must be positive');
    }

    if (!result.metadata) {
      this.addError('result.metadata', 'Export metadata is required');
    }

    // Format-specific validation
    switch (expectedFormat) {
      case 'ical':
        if (typeof result.content === 'string') {
          if (!result.content.includes('BEGIN:VCALENDAR')) {
            this.addError('result.content', 'Invalid iCal format - missing BEGIN:VCALENDAR');
          }
          if (!result.content.includes('VERSION:2.0')) {
            this.addError('result.content', 'Invalid iCal format - missing VERSION:2.0');
          }
        }
        break;
        
      case 'csv':
        if (typeof result.content === 'string') {
          const lines = result.content.split('\n');
          if (lines.length < 2) {
            this.addError('result.content', 'CSV must have header and at least one data row');
          }
        }
        break;
        
      case 'json':
        if (typeof result.content === 'string') {
          try {
            JSON.parse(result.content);
          } catch (e) {
            this.addError('result.content', 'Invalid JSON format');
          }
        }
        break;
    }

    return this.getResult();
  }

  /**
   * Validate data consistency across pipeline stages
   */
  validatePipelineConsistency(
    config: AdvancedPlanConfig,
    plan: TrainingPlan,
    progress?: ProgressData[],
    exportResult?: ExportResult
  ): ValidationResult {
    this.reset();

    // Config to plan consistency
    if (config && plan) {
      if (plan.config.name !== config.name) {
        this.addError('consistency', 'Plan name doesn\'t match config');
      }
      
      if (plan.config.goal !== config.goal) {
        this.addError('consistency', 'Plan goal doesn\'t match config');
      }

      if (plan.config.startDate.getTime() !== config.startDate.getTime()) {
        this.addError('consistency', 'Plan start date doesn\'t match config');
      }

      if (plan.config.targetDate && config.targetDate && 
          plan.config.targetDate.getTime() !== config.targetDate.getTime()) {
        this.addError('consistency', 'Plan target date doesn\'t match config');
      }
    }

    // Plan to progress consistency
    if (plan && progress) {
      progress.forEach((entry, index) => {
        if (entry.completedWorkouts?.length > 0) {
          entry.completedWorkouts.forEach(workout => {
            const plannedId = workout.plannedWorkout.id;
            const found = plan.workouts.find(w => w.id === plannedId);
            if (!found) {
              this.addError(`progress[${index}]`, `References non-existent workout ID: ${plannedId}`);
            }
          });
        }
      });
    }

    // Plan to export consistency
    if (plan && exportResult?.metadata) {
      if (exportResult.metadata.planName !== plan.config.name) {
        this.addWarning('export.metadata', 'Export plan name doesn\'t match plan');
      }
      
      if (exportResult.metadata.totalWorkouts !== plan.workouts.length) {
        this.addError('export.metadata', 'Export workout count doesn\'t match plan');
      }
    }

    return this.getResult();
  }

  private reset(): void {
    this.errors = [];
    this.warnings = [];
  }

  private addError(field: string, message: string, context?: unknown): void {
    this.errors.push({ field, message, severity: 'error', context });
  }

  private addWarning(field: string, message: string, context?: unknown): void {
    this.warnings.push({ field, message, severity: 'warning', context });
  }

  private getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings]
    };
  }
}

/**
 * Factory for creating validation pipeline instances
 */
export class ValidationFactory {
  static createPipeline(): ValidationPipeline {
    return new ValidationPipeline();
  }

  /**
   * Run full validation on entire workflow
   */
  static async validateWorkflow(
    config: unknown,
    plan: unknown,
    progress?: unknown,
    exportResults?: Record<string, ExportResult>
  ): Promise<Record<string, ValidationResult>> {
    const pipeline = new ValidationPipeline();
    const results: Record<string, ValidationResult> = {};

    // Validate each stage using type-safe validation
    results.config = pipeline.validateConfig(config);
    results.plan = pipeline.validatePlan(plan);
    
    if (progress) {
      results.progress = pipeline.validateProgressData(progress);
    }
    
    if (exportResults) {
      for (const [format, result] of Object.entries(exportResults)) {
        results[`export_${format}`] = pipeline.validateExportResult(result, format);
      }
    }

    // Validate overall consistency only if config and plan are valid
    const configValidation = validationUtils.safeCast(config, validationGuards.isAdvancedPlanConfig);
    const planValidation = validationUtils.safeCast(plan, validationGuards.isTrainingPlan);
    
    if (configValidation.success && planValidation.success) {
      const progressValidation = progress ? validationUtils.validateArray(
        primitiveGuards.isArray(progress) ? progress : [],
        validationGuards.isProgressData
      ) : { success: true, data: undefined };
      
      if (progressValidation.success) {
        results.consistency = pipeline.validatePipelineConsistency(
          configValidation.data,
          planValidation.data,
          progressValidation.data
        );
      }
    }

    return results;
  }
}