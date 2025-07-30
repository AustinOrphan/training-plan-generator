import {
  TrainingPlan,
  PlannedWorkout,
  TrainingBlock,
  WeeklyMicrocycle,
  ExportFormat,
  WorkoutType,
  TrainingPhase,
  TrainingMethodology,
  AdvancedPlanConfig,
  Workout,
  WorkoutSegment
} from './types';
import { TRAINING_ZONES, TrainingZone } from './zones';
import { WORKOUT_TEMPLATES } from './workouts';
import { format, addDays, startOfWeek } from 'date-fns';
import {
  MethodologyExportEnhancer,
  MethodologyExportMetadata,
  MethodologyExportResult,
  MethodologyFormatOptions,
  EnhancedMethodologyJSONFormatter,
  MethodologyMarkdownFormatter,
  MethodologyAwareFormatter
} from './methodology-export-enhancement';
import { TypedSchema } from './types/base-types';
import {
  BaseExportOptions,
  PDFOptions,
  iCalOptions,
  CSVOptions,
  JSONOptions,
  AnyExportOptions
} from './types/export-types';
import {
  TypedValidationResult,
  ExportFormatValidator,
  EXPORT_VALIDATORS,
  validateExport,
  isValidTrainingPlan
} from './types/export-validation-types';

/**
 * Export result containing formatted data and metadata
 */
export interface ExportResult {
  content: string | Buffer;
  filename: string;
  mimeType: string;
  size: number;
  metadata: ExportMetadata;
}

/**
 * Metadata about the exported plan
 */
export interface ExportMetadata {
  planName: string;
  exportDate: Date;
  format: ExportFormat;
  totalWorkouts: number;
  planDuration: number; // weeks
  fileSize: number; // bytes
  checksum?: string;
  version: string;
}

/**
 * Base formatter interface for all export formats
 * @template TOptions The specific options type for this formatter
 */
export interface Formatter<TOptions extends BaseExportOptions = BaseExportOptions> {
  format: ExportFormat;
  mimeType: string;
  fileExtension: string;
  
  /**
   * Format the training plan to the specific format
   */
  formatPlan(plan: TrainingPlan, options?: TOptions): Promise<ExportResult>;
  
  /**
   * Validate the plan can be exported in this format
   */
  validatePlan(plan: TrainingPlan): ValidationResult;
  
  /**
   * Get format-specific options schema with proper typing
   */
  getOptionsSchema(): TypedSchema<TOptions>;
}

/**
 * Validation result for export compatibility
 * @deprecated Use TypedValidationResult from export-validation-types for better type safety
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Enhanced validation result with type safety - preferred for new code
 */
export type EnhancedValidationResult<T = any> = TypedValidationResult<T>;

/**
 * Format-specific options
 * @deprecated Use specific format interfaces (PDFOptions, CSVOptions, etc.) instead
 * @template TCustomFields Type-safe custom fields constraint
 */
export interface FormatOptions<TCustomFields extends Record<string, unknown> = Record<string, unknown>> {
  includePaces?: boolean;
  includeHeartRates?: boolean;
  includePower?: boolean;
  timeZone?: string;
  units?: 'metric' | 'imperial';
  language?: string;
  /** Type-safe custom fields with generic constraints */
  customFields?: TCustomFields;
  // Methodology-specific options
  includePhilosophyPrinciples?: boolean;
  includeResearchCitations?: boolean;
  includeCoachBiography?: boolean;
  includeMethodologyComparison?: boolean;
  includeTrainingZoneExplanations?: boolean;
  includeWorkoutRationale?: boolean;
  detailLevel?: 'basic' | 'standard' | 'comprehensive';
  enhancedExport?: boolean; // Toggle for methodology-aware exports
}

/**
 * Chart data for visualization exports
 */
export interface ChartData {
  weeklyVolume: { week: number; distance: number; }[];
  intensityDistribution: { zone: string; percentage: number; }[];
  periodization: { phase: string; weeks: number; focus: string[]; }[];
  trainingLoad: { date: string; tss: number; }[];
}

/**
 * Export manager interface with type-safe operations
 */
export interface ExportManager {
  /**
   * Export plan in specified format with type-safe options
   */
  exportPlan(
    plan: TrainingPlan, 
    format: ExportFormat, 
    options?: BaseExportOptions
  ): Promise<ExportResult>;
  
  /**
   * Export plan in multiple formats
   */
  exportMultiFormat(
    plan: TrainingPlan, 
    formats: ExportFormat[], 
    options?: BaseExportOptions
  ): Promise<ExportResult[]>;
  
  /**
   * Get available formats
   */
  getAvailableFormats(): ExportFormat[];
  
  /**
   * Register a new formatter with type safety
   */
  registerFormatter<TOptions extends BaseExportOptions>(formatter: Formatter<TOptions>): void;
  
  /**
   * Validate plan for export compatibility
   */
  validateForExport(plan: TrainingPlan, format: ExportFormat): ValidationResult;
}

/**
 * Multi-format exporter implementation with type safety
 */
export class MultiFormatExporter implements ExportManager {
  private formatters = new Map<ExportFormat, Formatter<BaseExportOptions>>();
  
  constructor() {
    this.initializeDefaultFormatters();
  }
  
  /**
   * Export plan in specified format with type-safe options
   */
  async exportPlan(
    plan: TrainingPlan, 
    format: ExportFormat, 
    options?: BaseExportOptions
  ): Promise<ExportResult> {
    const formatter = this.formatters.get(format);
    if (!formatter) {
      throw new Error(`Unsupported export format: ${format}`);
    }
    
    const validation = formatter.validatePlan(plan);
    if (!validation.isValid) {
      throw new Error(`Plan validation failed: ${validation.errors.join(', ')}`);
    }
    
    // For CSV format, use simple format for basic compatibility
    const formatOptions = format === 'csv' 
      ? { ...options, detailLevel: 'basic' as const }
      : options;
    
    return await formatter.formatPlan(plan, formatOptions);
  }
  
  /**
   * Export plan in multiple formats with type-safe options
   */
  async exportMultiFormat(
    plan: TrainingPlan, 
    formats: ExportFormat[], 
    options?: BaseExportOptions
  ): Promise<ExportResult[]> {
    const results = await Promise.all(
      formats.map(format => this.exportPlan(plan, format, options))
    );
    
    return results;
  }
  
  /**
   * Get available formats
   */
  getAvailableFormats(): ExportFormat[] {
    return Array.from(this.formatters.keys());
  }
  
  /**
   * Register a new formatter with type safety
   */
  registerFormatter<TOptions extends BaseExportOptions>(formatter: Formatter<TOptions>): void {
    this.formatters.set(formatter.format, formatter as Formatter<BaseExportOptions>);
  }
  
  /**
   * Validate plan for export compatibility
   */
  validateForExport(plan: TrainingPlan, format: ExportFormat): ValidationResult {
    const formatter = this.formatters.get(format);
    if (!formatter) {
      return {
        isValid: false,
        errors: [`Unsupported format: ${format}`],
        warnings: []
      };
    }
    
    return formatter.validatePlan(plan);
  }
  
  /**
   * Initialize default formatters
   */
  private initializeDefaultFormatters(): void {
    this.registerFormatter(new JSONFormatter());
    this.registerFormatter(new CSVFormatter());
    this.registerFormatter(new iCalFormatter());
    this.registerFormatter(new PDFFormatter());
    this.registerFormatter(new TCXFormatter());
    // Note: Enhanced methodology formatters are instantiated on-demand, not pre-registered
    // to avoid conflicts with standard formatters
  }

  /**
   * Export plan with methodology awareness
   */
  async exportPlanWithMethodology(
    plan: TrainingPlan,
    format: ExportFormat,
    options?: FormatOptions
  ): Promise<ExportResult | MethodologyExportResult> {
    // Check if enhanced export is explicitly requested and methodology info is available
    const advancedConfig = plan.config as AdvancedPlanConfig;
    const hasMethodology = !!advancedConfig.methodology;
    const enhancedRequested = options?.enhancedExport === true;
    const useEnhanced = enhancedRequested && hasMethodology;

    if (useEnhanced) {
      // Use methodology-aware formatters for enhanced exports
      return this.exportWithMethodologyAwareFormatter(plan, format, options);
    }

    // Fall back to standard export
    return this.exportPlan(plan, format, options);
  }

  /**
   * Export using methodology-aware formatters
   */
  private async exportWithMethodologyAwareFormatter(
    plan: TrainingPlan,
    format: ExportFormat,
    options?: FormatOptions
  ): Promise<MethodologyExportResult> {
    const methodologyOptions: MethodologyFormatOptions = {
      ...options,
      includePhilosophyPrinciples: options?.includePhilosophyPrinciples ?? true,
      includeResearchCitations: options?.includeResearchCitations ?? true,
      includeCoachBiography: options?.includeCoachBiography ?? false,
      includeMethodologyComparison: options?.includeMethodologyComparison ?? false,
      includeTrainingZoneExplanations: options?.includeTrainingZoneExplanations ?? true,
      includeWorkoutRationale: options?.includeWorkoutRationale ?? false,
      detailLevel: options?.detailLevel ?? 'standard'
    };

    // Select appropriate methodology-aware formatter
    let formatter: MethodologyAwareFormatter;
    
    switch (format) {
      case 'json':
        formatter = new EnhancedMethodologyJSONFormatter();
        break;
      case 'markdown':
        formatter = new MethodologyMarkdownFormatter();
        break;
      default:
        // For unsupported enhanced formats, enhance the standard export
        const standardResult = await this.exportPlan(plan, format, options);
        return this.enhanceStandardExport(plan, standardResult, methodologyOptions);
    }

    return formatter.formatPlan(plan, methodologyOptions);
  }

  /**
   * Enhance standard export with methodology information
   */
  private async enhanceStandardExport(
    plan: TrainingPlan,
    standardResult: ExportResult,
    options: MethodologyFormatOptions
  ): Promise<MethodologyExportResult> {
    const { methodology, principles, citations } = MethodologyExportEnhancer.extractMethodologyInfo(plan);
    
    // Generate enhanced metadata
    const enhancedMetadata = MethodologyExportEnhancer.generateMethodologyMetadata(
      plan,
      standardResult.metadata.format,
      standardResult.content
    );

    // For text-based formats, prepend methodology documentation
    let enhancedContent = standardResult.content;
    if (typeof enhancedContent === 'string' && (
      standardResult.metadata.format === 'csv' ||
      standardResult.metadata.format === 'ical'
    )) {
      const methodologyDoc = MethodologyExportEnhancer.generateMethodologyDocumentation(plan, options);
      if (methodologyDoc) {
        enhancedContent = `# ${methodologyDoc}\n\n${enhancedContent}`;
      }
    }

    return {
      ...standardResult,
      content: enhancedContent,
      metadata: enhancedMetadata,
      philosophyData: principles,
      citations
    };
  }
}

/**
 * Base formatter class with common functionality and type safety
 * @template TOptions The specific options type for this formatter
 */
abstract class BaseFormatter<TOptions extends BaseExportOptions = BaseExportOptions> 
  implements Formatter<TOptions> {
  abstract format: ExportFormat;
  abstract mimeType: string;
  abstract fileExtension: string;
  
  abstract formatPlan(plan: TrainingPlan, options?: TOptions): Promise<ExportResult>;
  
  /**
   * Default validation - can be overridden by specific formatters
   */
  validatePlan(plan: TrainingPlan): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!plan.workouts || plan.workouts.length === 0) {
      errors.push('Plan contains no workouts');
    }
    
    if (!plan.config.name) {
      warnings.push('Plan has no name');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Get format-specific options schema with proper typing
   */
  getOptionsSchema(): TypedSchema<TOptions> {
    return {
      validate: (data: unknown): data is TOptions => {
        return typeof data === 'object' && data !== null;
      },
      properties: [
        'includePaces',
        'includeHeartRates', 
        'includePower',
        'timeZone',
        'units'
      ] as (keyof TOptions)[],
      metadata: {
        version: '1.0.0',
        description: 'Base export options schema',
        examples: []
      }
    };
  }
  
  /**
   * Generate base metadata
   */
  protected generateMetadata(plan: TrainingPlan, content: string | Buffer): ExportMetadata {
    const contentSize = typeof content === 'string' ? Buffer.byteLength(content) : content.length;
    
    return {
      planName: plan.config.name || 'Training Plan',
      exportDate: new Date(),
      format: this.format,
      totalWorkouts: plan.workouts.length,
      planDuration: Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 16,
      fileSize: contentSize,
      version: '1.0.0'
    };
  }
  
  /**
   * Generate chart data for visualization
   */
  protected generateChartData(plan: TrainingPlan): ChartData {
    const weeklyVolume = this.generateWeeklyVolumeData(plan);
    const intensityDistribution = this.generateIntensityData(plan);
    const periodization = this.generatePeriodizationData(plan);
    const trainingLoad = this.generateTrainingLoadData(plan);
    
    return {
      weeklyVolume,
      intensityDistribution,
      periodization,
      trainingLoad
    };
  }
  
  private generateWeeklyVolumeData(plan: TrainingPlan): { week: number; distance: number; }[] {
    const weeklyData = new Map<number, number>();
    
    plan.workouts.forEach(workout => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ) + 1;
      
      const currentDistance = weeklyData.get(weekNumber) || 0;
      weeklyData.set(weekNumber, currentDistance + (workout.targetMetrics.distance || 0));
    });
    
    return Array.from(weeklyData.entries())
      .map(([week, distance]) => ({ week, distance }))
      .sort((a, b) => a.week - b.week);
  }
  
  private generateIntensityData(plan: TrainingPlan): { zone: string; percentage: number; }[] {
    const zoneCounts = new Map<string, number>();
    
    plan.workouts.forEach(workout => {
      const zone = this.getWorkoutZone(workout);
      zoneCounts.set(zone, (zoneCounts.get(zone) || 0) + 1);
    });
    
    const total = plan.workouts.length;
    return Array.from(zoneCounts.entries())
      .map(([zone, count]) => ({ zone, percentage: Math.round((count / total) * 100) }));
  }
  
  private generatePeriodizationData(plan: TrainingPlan): { phase: string; weeks: number; focus: string[]; }[] {
    return plan.blocks.map(block => ({
      phase: block.phase,
      weeks: block.weeks,
      focus: block.focusAreas
    }));
  }
  
  private generateTrainingLoadData(plan: TrainingPlan): { date: string; tss: number; }[] {
    return plan.workouts.map(workout => ({
      date: format(workout.date, 'yyyy-MM-dd'),
      tss: workout.workout.estimatedTSS || 0
    }));
  }
  
  private getWorkoutZone(workout: PlannedWorkout): string {
    const intensity = workout.targetMetrics.intensity;
    
    if (intensity < 60) return 'Recovery';
    if (intensity < 70) return 'Easy';
    if (intensity < 80) return 'Steady';
    if (intensity < 87) return 'Tempo';
    if (intensity < 92) return 'Threshold';
    if (intensity < 97) return 'VO2max';
    return 'Neuromuscular';
  }
  
  /**
   * Calculate pace from zone and fitness metrics
   */
  protected calculatePace(zone: TrainingZone, thresholdPace: number): { min: string; max: string } {
    if (!zone || !zone.paceRange || !thresholdPace) {
      return { min: '0:00', max: '0:00' };
    }
    
    const minPace = thresholdPace * (zone.paceRange.min / 100);
    const maxPace = thresholdPace * (zone.paceRange.max / 100);
    
    return {
      min: this.formatPace(minPace),
      max: this.formatPace(maxPace)
    };
  }
  
  private formatPace(pace: number): string {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * JSON formatter for structured data export
 */
class JSONFormatter extends BaseFormatter<JSONOptions> {
  format: ExportFormat = 'json';
  mimeType = 'application/json';
  fileExtension = 'json';
  
  async formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult> {
    const exportData = {
      plan: {
        name: plan.config.name,
        goal: plan.config.goal,
        startDate: plan.config.startDate.toISOString(),
        targetDate: plan.config.targetDate?.toISOString(),
        summary: plan.summary
      },
      blocks: plan.blocks.map(block => ({
        id: block.id,
        phase: block.phase,
        startDate: block.startDate.toISOString(),
        endDate: block.endDate.toISOString(),
        weeks: block.weeks,
        focusAreas: block.focusAreas
      })),
      workouts: plan.workouts.map(workout => ({
        id: workout.id,
        date: workout.date.toISOString(),
        type: workout.type,
        name: workout.name,
        description: workout.description,
        targetMetrics: workout.targetMetrics,
        workout: workout.workout
      })),
      charts: options?.customFields?.includeCharts ? this.generateChartData(plan) : undefined
    };
    
    const content = JSON.stringify(exportData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    
    return {
      content,
      filename: `${plan.config.name || 'training-plan'}.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
}

/**
 * CSV formatter for spreadsheet compatibility
 */
class CSVFormatter extends BaseFormatter<CSVOptions> {
  format: ExportFormat = 'csv';
  mimeType = 'text/csv';
  fileExtension = 'csv';
  
  async formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult> {
    // Use comprehensive format by default, simple format for basic compatibility
    const useComprehensive = options?.comprehensive !== false;
    const csvContent = useComprehensive 
      ? this.generateComprehensiveCSV(plan, options)
      : this.generateSimpleCSV(plan, options);
    const metadata = this.generateMetadata(plan, csvContent);
    
    return {
      content: csvContent,
      filename: `${plan.config.name || 'training-plan'}.csv`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(csvContent),
      metadata
    };
  }
  
  private generateSimpleCSV(plan: TrainingPlan, options?: FormatOptions): string {
    // Generate simple CSV format that matches test expectations
    const headers = 'Date,Workout Type,Duration';
    
    const rows = plan.workouts.map(workout => {
      const date = format(workout.date, 'yyyy-MM-dd');
      const workoutType = workout.type.replace('_', ' ');
      const duration = workout.targetMetrics.duration;
      
      return `${date},${workoutType},${duration}`;
    });
    
    return [headers, ...rows].join('\n');
  }
  
  private generateComprehensiveCSV(plan: TrainingPlan, options?: FormatOptions): string {
    const sections: string[] = [];
    
    // Section 1: Plan Overview
    sections.push(this.generatePlanOverviewSection(plan));
    sections.push(''); // Empty line separator
    
    // Section 2: Daily Workout Schedule
    sections.push(this.generateWorkoutScheduleSection(plan, options));
    sections.push(''); // Empty line separator
    
    // Section 3: Weekly Summary
    sections.push(this.generateWeeklySummarySection(plan));
    sections.push(''); // Empty line separator
    
    // Section 4: Training Load Analysis
    sections.push(this.generateTrainingLoadSection(plan));
    sections.push(''); // Empty line separator
    
    // Section 5: Progress Tracking Template
    sections.push(this.generateProgressTrackingSection(plan));
    sections.push(''); // Empty line separator
    
    // Section 6: Phase Analysis
    sections.push(this.generatePhaseAnalysisSection(plan));
    
    return sections.join('\n');
  }
  
  private generatePlanOverviewSection(plan: TrainingPlan): string {
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const totalTSS = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
    const duration = plan.config.targetDate 
      ? Math.ceil((plan.config.targetDate.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      : 16;
    
    const rows = [
      ['"=== TRAINING PLAN OVERVIEW ==="'],
      ['"Plan Name"', `"${plan.config.name || 'Training Plan'}"`],
      ['"Goal"', `"${plan.config.goal}"`],
      ['"Start Date"', `"${format(plan.config.startDate, 'yyyy-MM-dd')}"`],
      ['"End Date"', `"${format(plan.config.targetDate || addDays(plan.config.startDate, duration * 7), 'yyyy-MM-dd')}"`],
      ['"Duration (weeks)"', `"${duration}"`],
      ['"Total Workouts"', `"${plan.workouts.length}"`],
      ['"Total Distance (km)"', `"${Math.round(totalDistance)}"`],
      ['"Total TSS"', `"${Math.round(totalTSS)}"`],
      ['"Average Weekly Distance"', `"${Math.round(totalDistance / duration)}"`],
      ['"Phases"', `"${plan.blocks.length}"`],
      ['""'], // Empty row
      ['"Phase Summary"'],
      ['"Phase"', '"Weeks"', '"Focus Areas"'],
      ...plan.blocks.map(block => [
        `"${block.phase}"`,
        `"${block.weeks}"`,
        `"${block.focusAreas.join(', ')}"`
      ])
    ];
    
    return rows.map(row => row.join(',')).join('\n');
  }
  
  private generateWorkoutScheduleSection(plan: TrainingPlan, options?: FormatOptions): string {
    const headers = [
      '"=== DAILY WORKOUT SCHEDULE ==="',
      '""', // Empty cell to align with data
      '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""'
    ];
    
    const dataHeaders = [
      '"Date"', '"Day"', '"Week"', '"Phase"', '"Workout Type"', '"Name"', 
      '"Description"', '"Duration (min)"', '"Distance (km)"', '"Intensity (%)"', 
      '"TSS"', '"Primary Zone"', '"Pace Range"', '"HR Range"', 
      '"Completed"', '"Actual Distance"', '"Actual Duration"', '"RPE (1-10)"', '"Notes"'
    ];
    
    const rows = plan.workouts.map(workout => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ) + 1;
      
      const block = plan.blocks.find(b => 
        workout.date >= b.startDate && workout.date <= b.endDate
      );
      
      const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
      const paceRange = zone ? this.calculatePace(zone, 5.0) : { min: '', max: '' };
      const hrRange = zone?.heartRateRange ? `${zone.heartRateRange.min}-${zone.heartRateRange.max}%` : '';
      
      return [
        `"${format(workout.date, 'yyyy-MM-dd')}"`,
        `"${format(workout.date, 'EEEE')}"`,
        `"${weekNumber}"`,
        `"${block?.phase || ''}"`,
        `"${workout.type}"`,
        `"${workout.name}"`,
        `"${workout.description.replace(/"/g, '""')}"`, // Escape quotes
        `"${workout.targetMetrics.duration}"`,
        `"${workout.targetMetrics.distance || 0}"`,
        `"${workout.targetMetrics.intensity}"`,
        `"${workout.targetMetrics.tss}"`,
        `"${zone?.name || 'Easy'}"`,
        `"${paceRange.min}-${paceRange.max}"`,
        `"${hrRange}"`,
        '""', // Completed (for user to fill)
        '""', // Actual Distance (for user to fill)
        '""', // Actual Duration (for user to fill)
        '""', // RPE (for user to fill)
        '""'  // Notes (for user to fill)
      ];
    });
    
    return [headers, dataHeaders, ...rows]
      .map(row => Array.isArray(row) ? row.join(',') : row)
      .join('\n');
  }
  
  private generateWeeklySummarySection(plan: TrainingPlan): string {
    const weeklyData = this.generateWeeklyMetrics(plan);
    
    const headers = [
      '"=== WEEKLY SUMMARY ==="',
      '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""', '""'
    ];
    
    const dataHeaders = [
      '"Week"', '"Start Date"', '"Phase"', '"Planned Distance (km)"', 
      '"Planned TSS"', '"Workouts"', '"Easy %"', '"Moderate %"', '"Hard %"',
      '"Actual Distance"', '"Actual TSS"', '"Completion %"', '"Weekly Notes"'
    ];
    
    const rows = weeklyData.map(week => [
      `"${week.weekNumber}"`,
      `"${format(week.startDate, 'yyyy-MM-dd')}"`,
      `"${week.phase}"`,
      `"${Math.round(week.plannedDistance)}"`,
      `"${Math.round(week.plannedTSS)}"`,
      `"${week.workoutCount}"`,
      `"${week.easyPercentage}%"`,
      `"${week.moderatePercentage}%"`,
      `"${week.hardPercentage}%"`,
      '""', // Actual Distance (for user to fill)
      '""', // Actual TSS (for user to fill)
      '""', // Completion % (for user to fill)
      '""'  // Weekly Notes (for user to fill)
    ]);
    
    return [headers, dataHeaders, ...rows]
      .map(row => Array.isArray(row) ? row.join(',') : row)
      .join('\n');
  }
  
  private generateTrainingLoadSection(plan: TrainingPlan): string {
    const weeklyData = this.generateWeeklyMetrics(plan);
    
    const headers = [
      '"=== TRAINING LOAD ANALYSIS ==="',
      '""', '""', '""', '""', '""', '""', '""', '""'
    ];
    
    const dataHeaders = [
      '"Week"', '"Start Date"', '"Planned TSS"', '"Cumulative TSS"', 
      '"Load Ramp Rate"', '"Acute:Chronic Ratio"', '"Recovery Score"', 
      '"Fatigue Risk"', '"Load Notes"'
    ];
    
    let cumulativeTSS = 0;
    const rows = weeklyData.map((week, index) => {
      cumulativeTSS += week.plannedTSS;
      
      // Calculate ramp rate (compared to 4-week average)
      const recentWeeks = weeklyData.slice(Math.max(0, index - 3), index + 1);
      const avgTSS = recentWeeks.reduce((sum, w) => sum + w.plannedTSS, 0) / recentWeeks.length;
      const rampRate = index > 0 ? ((week.plannedTSS - avgTSS) / avgTSS * 100) : 0;
      
      // Simulated acute:chronic ratio (7-day:28-day)
      const acuteWeeks = weeklyData.slice(Math.max(0, index - 0), index + 1);
      const chronicWeeks = weeklyData.slice(Math.max(0, index - 3), index + 1);
      const acuteTSS = acuteWeeks.reduce((sum, w) => sum + w.plannedTSS, 0) / Math.min(1, acuteWeeks.length);
      const chronicTSS = chronicWeeks.reduce((sum, w) => sum + w.plannedTSS, 0) / Math.min(4, chronicWeeks.length);
      const acuteChronicRatio = chronicTSS > 0 ? acuteTSS / chronicTSS : 1;
      
      // Recovery score (simplified)
      const recoveryScore = Math.max(0, 100 - (week.hardPercentage * 1.5) - Math.max(0, rampRate));
      
      // Fatigue risk assessment
      let fatigueRisk = 'Low';
      if (acuteChronicRatio > 1.3 || rampRate > 15) fatigueRisk = 'High';
      else if (acuteChronicRatio > 1.1 || rampRate > 10) fatigueRisk = 'Moderate';
      
      return [
        `"${week.weekNumber}"`,
        `"${format(week.startDate, 'yyyy-MM-dd')}"`,
        `"${Math.round(week.plannedTSS)}"`,
        `"${Math.round(cumulativeTSS)}"`,
        `"${Math.round(rampRate)}%"`,
        `"${acuteChronicRatio.toFixed(2)}"`,
        `"${Math.round(recoveryScore)}"`,
        `"${fatigueRisk}"`,
        '""' // Load Notes (for user to fill)
      ];
    });
    
    return [headers, dataHeaders, ...rows]
      .map(row => Array.isArray(row) ? row.join(',') : row)
      .join('\n');
  }
  
  private generateProgressTrackingSection(plan: TrainingPlan): string {
    const headers = [
      '"=== PROGRESS TRACKING TEMPLATE ==="',
      '""', '""', '""', '""', '""', '""', '""', '""', '""'
    ];
    
    const instructions = [
      '"Instructions: Fill in actual values as you complete workouts"',
      '""', '""', '""', '""', '""', '""', '""', '""', '""'
    ];
    
    const dataHeaders = [
      '"Date"', '"Workout Name"', '"Planned Distance"', '"Actual Distance"', 
      '"Planned Duration"', '"Actual Duration"', '"Average Pace"', '"Average HR"', 
      '"RPE (1-10)"', '"Workout Notes"'
    ];
    
    const rows = plan.workouts.map(workout => [
      `"${format(workout.date, 'yyyy-MM-dd')}"`,
      `"${workout.name}"`,
      `"${workout.targetMetrics.distance || 0}"`,
      '""', // Actual Distance (for user to fill)
      `"${workout.targetMetrics.duration}"`,
      '""', // Actual Duration (for user to fill)
      '""', // Average Pace (for user to fill)
      '""', // Average HR (for user to fill)
      '""', // RPE (for user to fill)
      '""'  // Workout Notes (for user to fill)
    ]);
    
    return [headers, instructions, dataHeaders, ...rows]
      .map(row => Array.isArray(row) ? row.join(',') : row)
      .join('\n');
  }
  
  private generatePhaseAnalysisSection(plan: TrainingPlan): string {
    const headers = [
      '"=== TRAINING PHASE ANALYSIS ==="',
      '""', '""', '""', '""', '""', '""', '""'
    ];
    
    const dataHeaders = [
      '"Phase"', '"Duration (weeks)"', '"Total Distance (km)"', '"Total TSS"', 
      '"Primary Focus"', '"Key Workouts"', '"Volume Emphasis"', '"Intensity Emphasis"'
    ];
    
    const rows = plan.blocks.map(block => {
      const blockWorkouts = plan.workouts.filter(w => 
        w.date >= block.startDate && w.date <= block.endDate
      );
      
      const totalDistance = blockWorkouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
      const totalTSS = blockWorkouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
      
      // Analyze workout distribution
      const workoutTypes = blockWorkouts.reduce((acc, workout) => {
        acc[workout.type] = (acc[workout.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const keyWorkouts = Object.entries(workoutTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type, count]) => `${type} (${count})`)
        .join(', ');
      
      // Calculate intensity distribution
      const easyWorkouts = blockWorkouts.filter(w => w.targetMetrics.intensity < 70).length;
      const hardWorkouts = blockWorkouts.filter(w => w.targetMetrics.intensity >= 85).length;
      const totalWorkouts = blockWorkouts.length;
      
      const volumeEmphasis = totalDistance / block.weeks > 50 ? 'High' : totalDistance / block.weeks > 30 ? 'Moderate' : 'Low';
      const intensityEmphasis = (hardWorkouts / totalWorkouts) > 0.3 ? 'High' : (hardWorkouts / totalWorkouts) > 0.15 ? 'Moderate' : 'Low';
      
      return [
        `"${block.phase}"`,
        `"${block.weeks}"`,
        `"${Math.round(totalDistance)}"`,
        `"${Math.round(totalTSS)}"`,
        `"${block.focusAreas.join(', ')}"`,
        `"${keyWorkouts}"`,
        `"${volumeEmphasis}"`,
        `"${intensityEmphasis}"`
      ];
    });
    
    return [headers, dataHeaders, ...rows]
      .map(row => Array.isArray(row) ? row.join(',') : row)
      .join('\n');
  }
  
  private generateWeeklyMetrics(plan: TrainingPlan): WeeklyMetrics[] {
    const weeks = new Map<number, PlannedWorkout[]>();
    
    // Group workouts by week
    plan.workouts.forEach(workout => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ) + 1;
      
      if (!weeks.has(weekNumber)) {
        weeks.set(weekNumber, []);
      }
      weeks.get(weekNumber)!.push(workout);
    });
    
    return Array.from(weeks.entries()).map(([weekNumber, workouts]) => {
      const startDate = addDays(plan.config.startDate, (weekNumber - 1) * 7);
      const block = plan.blocks.find(b => 
        workouts[0] && workouts[0].date >= b.startDate && workouts[0].date <= b.endDate
      );
      
      const plannedDistance = workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
      const plannedTSS = workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
      
      // Calculate intensity distribution
      const easyCount = workouts.filter(w => w.targetMetrics.intensity < 70).length;
      const moderateCount = workouts.filter(w => w.targetMetrics.intensity >= 70 && w.targetMetrics.intensity < 85).length;
      const hardCount = workouts.filter(w => w.targetMetrics.intensity >= 85).length;
      const total = workouts.length;
      
      return {
        weekNumber,
        startDate,
        phase: block?.phase || 'Training',
        plannedDistance,
        plannedTSS,
        workoutCount: workouts.length,
        easyPercentage: Math.round((easyCount / total) * 100),
        moderatePercentage: Math.round((moderateCount / total) * 100),
        hardPercentage: Math.round((hardCount / total) * 100)
      };
    }).sort((a, b) => a.weekNumber - b.weekNumber);
  }
}

interface WeeklyMetrics {
  weekNumber: number;
  startDate: Date;
  phase: string;
  plannedDistance: number;
  plannedTSS: number;
  workoutCount: number;
  easyPercentage: number;
  moderatePercentage: number;
  hardPercentage: number;
}

/**
 * iCal formatter for calendar integration
 */
class iCalFormatter extends BaseFormatter<iCalOptions> {
  format: ExportFormat = 'ical';
  mimeType = 'text/calendar';
  fileExtension = 'ics';
  
  async formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult> {
    const timeZone = options?.timeZone || 'UTC';
    const now = new Date();
    
    let icalContent = this.generateCalendarHeader(plan, timeZone, now);
    
    // Add timezone definition if not UTC
    if (timeZone !== 'UTC') {
      icalContent += this.generateTimezoneDefinition(timeZone);
    }
    
    // Generate workout events
    plan.workouts.forEach(workout => {
      icalContent += this.generateWorkoutEvent(workout, plan, timeZone, now, options);
    });
    
    // Add plan overview event
    icalContent += this.generatePlanOverviewEvent(plan, timeZone, now);
    
    icalContent += this.foldLine('END:VCALENDAR') + '\r\n';
    
    const metadata = this.generateMetadata(plan, icalContent);
    
    return {
      content: icalContent,
      filename: `${plan.config.name || 'training-plan'}.ics`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(icalContent),
      metadata
    };
  }
  
  private generateCalendarHeader(plan: TrainingPlan, timeZone: string, now: Date): string {
    const calendarName = this.sanitizeText(plan.config.name || 'Training Plan');
    const description = this.sanitizeText(plan.config.goal || 'Running Training Plan');
    
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Training Plan Generator//EN',
      `X-WR-CALNAME:${calendarName}`,
      `X-WR-CALDESC:${description}`,
      'X-WR-TIMEZONE:' + timeZone,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-REFRESH-INTERVAL;VALUE=DURATION:P1D`,
      `CREATED:${this.formatICalDate(now)}`,
      ''
    ];
    
    return this.foldContent(lines);
  }
  
  private generateTimezoneDefinition(timeZone: string): string {
    // Basic timezone definition - in real implementation would use comprehensive timezone data
    const lines = [
      'BEGIN:VTIMEZONE',
      `TZID:${timeZone}`,
      'BEGIN:STANDARD',
      'DTSTART:19701101T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
      'TZOFFSETFROM:-0400',
      'TZOFFSETTO:-0500',
      'TZNAME:EST',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:19700308T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
      'TZOFFSETFROM:-0500',
      'TZOFFSETTO:-0400',
      'TZNAME:EDT',
      'END:DAYLIGHT',
      'END:VTIMEZONE',
      ''
    ];
    
    return this.foldContent(lines);
  }
  
  private generateWorkoutEvent(
    workout: PlannedWorkout, 
    plan: TrainingPlan, 
    timeZone: string, 
    now: Date, 
    options?: FormatOptions
  ): string {
    const startTime = this.calculateWorkoutStartTime(workout, options);
    const endTime = new Date(startTime.getTime() + workout.targetMetrics.duration * 60000);
    
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    const paceRange = zone ? this.calculatePace(zone, 5.0) : { min: '5:00', max: '5:00' };
    
    const description = this.generateWorkoutDescription(workout, zone, paceRange, options);
    const location = this.generateWorkoutLocation(workout, options);
    const alarms = this.generateWorkoutAlarms(workout, options);
    
    const eventLines = [
      'BEGIN:VEVENT',
      `UID:workout-${workout.id}@training-plan-generator.com`,
      `DTSTAMP:${this.formatICalDate(now)}`,
      timeZone === 'UTC' 
        ? `DTSTART:${this.formatICalDate(startTime)}`
        : `DTSTART;TZID=${timeZone}:${this.formatICalDateLocal(startTime)}`,
      timeZone === 'UTC'
        ? `DTEND:${this.formatICalDate(endTime)}`
        : `DTEND;TZID=${timeZone}:${this.formatICalDateLocal(endTime)}`,
      `SUMMARY:${this.sanitizeText(workout.name)}`,
      `DESCRIPTION:${this.sanitizeText(description)}`,
      `CATEGORIES:TRAINING,${workout.type.toUpperCase().replace('_', '-')}`,
      location ? `LOCATION:${this.sanitizeText(location)}` : '',
      `PRIORITY:${this.getWorkoutPriority(workout)}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      `CLASS:PUBLIC`,
      `X-MICROSOFT-CDO-BUSYSTATUS:BUSY`,
      `X-WORKOUT-TYPE:${workout.type}`,
      `X-TRAINING-ZONE:${zone?.name || 'Easy'}`,
      `X-TARGET-DURATION:${workout.targetMetrics.duration}`,
      workout.targetMetrics.distance ? `X-TARGET-DISTANCE:${workout.targetMetrics.distance}` : '',
      `X-TSS:${workout.targetMetrics.tss}`,
      ...alarms,
      'END:VEVENT'
    ].filter(line => line !== '');
    
    return this.foldContent(eventLines);
  }
  
  private calculateWorkoutStartTime(workout: PlannedWorkout, options?: FormatOptions): Date {
    const startTime = new Date(workout.date);
    
    // Intelligent scheduling based on workout type
    const optimalTimes = {
      'easy': { hour: 7, minute: 0 },
      'long_run': { hour: 8, minute: 0 },
      'recovery': { hour: 7, minute: 30 },
      'tempo': { hour: 17, minute: 0 },
      'threshold': { hour: 17, minute: 30 },
      'vo2max': { hour: 17, minute: 0 },
      'speed': { hour: 17, minute: 30 },
      'hill_repeats': { hour: 17, minute: 0 },
      'fartlek': { hour: 17, minute: 30 },
      'progression': { hour: 16, minute: 30 },
      'race_pace': { hour: 17, minute: 0 },
      'time_trial': { hour: 9, minute: 0 },
      'cross_training': { hour: 18, minute: 0 },
      'strength': { hour: 18, minute: 30 }
    };
    
    const timing = optimalTimes[workout.type] || { hour: 7, minute: 0 };
    
    // Adjust for weekends - later start times
    const dayOfWeek = startTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      timing.hour = Math.max(8, timing.hour);
    }
    
    startTime.setHours(timing.hour, timing.minute, 0, 0);
    return startTime;
  }
  
  private generateWorkoutDescription(
    workout: PlannedWorkout, 
    zone: TrainingZone | undefined, 
    paceRange: { min: string; max: string },
    options?: FormatOptions
  ): string {
    const template = Object.values(WORKOUT_TEMPLATES).find(t => t.type === workout.type);
    
    const descriptionParts = [
      `🏃 ${workout.description}`,
      '',
      '📊 WORKOUT DETAILS:',
      `• Duration: ${workout.targetMetrics.duration} minutes`,
      workout.targetMetrics.distance ? `• Distance: ${workout.targetMetrics.distance} km` : '',
      `• Intensity: ${workout.targetMetrics.intensity}%`,
      `• Training Stress Score: ${workout.targetMetrics.tss}`,
      '',
      '🎯 TRAINING ZONE:',
      zone ? `• ${zone.name} (${zone.description})` : '• Easy Zone',
      zone ? `• Effort Level: ${zone.rpe}/10 RPE` : '',
      zone?.heartRateRange ? `• Heart Rate: ${zone.heartRateRange.min}-${zone.heartRateRange.max}% Max HR` : '',
      paceRange.min !== '0:00' ? `• Target Pace: ${paceRange.min} - ${paceRange.max} /km` : '',
      ''
    ];
    
    if (template && template.segments.length > 1) {
      descriptionParts.push(
        '📋 WORKOUT STRUCTURE:',
        ...template.segments
          .filter(seg => seg.duration > 1)
          .map(seg => `• ${seg.duration}min @ ${seg.zone.name} - ${seg.description}`),
        ''
      );
    }
    
    if (template?.adaptationTarget) {
      descriptionParts.push(
        '🎯 TRAINING FOCUS:',
        `• ${template.adaptationTarget}`,
        ''
      );
    }
    
    // Add pre-workout checklist
    descriptionParts.push(
      '✅ PRE-WORKOUT CHECKLIST:',
      '• Proper warm-up (10-15 min)',
      '• Hydration check',
      '• Weather-appropriate gear',
      '• Route/location planned',
      ''
    );
    
    // Add post-workout notes
    descriptionParts.push(
      '📝 POST-WORKOUT:',
      '• Cool-down and stretching',
      '• Log actual pace, distance, RPE',
      '• Note how you felt',
      `• Recovery time: ~${workout.workout.recoveryTime || 24}hrs`
    );
    
    return descriptionParts.filter(Boolean).join('\\n');
  }
  
  private generateWorkoutLocation(workout: PlannedWorkout, options?: FormatOptions): string {
    const locationMap = {
      'track': 'Local Running Track',
      'trail': 'Trail System',
      'road': 'Road Route',
      'treadmill': 'Gym/Home Treadmill',
      'hills': 'Hilly Route/Park'
    };
    
    // Suggest location based on workout type
    if (workout.type === 'speed' || workout.type === 'vo2max') {
      return 'Running Track (400m)';
    } else if (workout.type === 'hill_repeats') {
      return 'Hill Training Location';
    } else if (workout.type === 'long_run') {
      return 'Scenic Long Run Route';
    } else if (workout.type === 'recovery') {
      return 'Easy/Flat Route';
    } else if (workout.type === 'cross_training' || workout.type === 'strength') {
      return 'Gym/Fitness Center';
    }
    
    return options?.customFields?.defaultLocation || 'Your Preferred Running Route';
  }
  
  private generateWorkoutAlarms(workout: PlannedWorkout, options?: FormatOptions): string[] {
    const alarms: string[] = [];
    
    // Pre-workout reminder (day before)
    alarms.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Tomorrow: ${workout.name} - Check weather & prepare gear`,
      'TRIGGER:-P1D',
      'END:VALARM'
    );
    
    // Pre-workout reminder (2 hours before)
    alarms.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Workout in 2 hours: ${workout.name} - Start hydrating`,
      'TRIGGER:-PT2H',
      'END:VALARM'
    );
    
    // Pre-workout reminder (30 minutes before)
    alarms.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Workout in 30 min: Begin warm-up routine`,
      'TRIGGER:-PT30M',
      'END:VALARM'
    );
    
    return alarms;
  }
  
  private generatePlanOverviewEvent(plan: TrainingPlan, timeZone: string, now: Date): string {
    const startDate = new Date(plan.config.startDate);
    const endDate = plan.config.targetDate || addDays(startDate, 112); // 16 weeks default
    
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const totalTSS = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
    
    const description = [
      `🏃‍♂️ TRAINING PLAN OVERVIEW`,
      '',
      `📅 Duration: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`,
      `🎯 Goal: ${plan.config.goal}`,
      `🏋️ Total Workouts: ${plan.workouts.length}`,
      `📏 Total Distance: ${Math.round(totalDistance)} km`,
      `⚡ Total Training Load: ${Math.round(totalTSS)} TSS`,
      '',
      '📊 TRAINING PHASES:',
      ...plan.blocks.map(block => 
        `• ${block.phase} (${block.weeks} weeks): ${block.focusAreas.join(', ')}`
      ),
      '',
      '💡 Remember to listen to your body and adapt the plan as needed!',
      '🩺 Consult a healthcare provider before starting any new training program.'
    ].join('\\n');
    
    const eventLines = [
      'BEGIN:VEVENT',
      `UID:plan-overview-${plan.config.startDate.getTime()}@training-plan-generator.com`,
      `DTSTAMP:${this.formatICalDate(now)}`,
      timeZone === 'UTC' 
        ? `DTSTART;VALUE=DATE:${format(startDate, 'yyyyMMdd')}`
        : `DTSTART;TZID=${timeZone};VALUE=DATE:${format(startDate, 'yyyyMMdd')}`,
      timeZone === 'UTC'
        ? `DTEND;VALUE=DATE:${format(addDays(endDate, 1), 'yyyyMMdd')}`
        : `DTEND;TZID=${timeZone};VALUE=DATE:${format(addDays(endDate, 1), 'yyyyMMdd')}`,
      `SUMMARY:📋 ${plan.config.name || 'Training Plan'} - Overview`,
      `DESCRIPTION:${this.sanitizeText(description)}`,
      'CATEGORIES:TRAINING,PLAN-OVERVIEW',
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'CLASS:PUBLIC',
      'END:VEVENT',
      ''
    ];
    
    return this.foldContent(eventLines);
  }
  
  private getWorkoutPriority(workout: PlannedWorkout): number {
    // Higher priority for key workouts
    const priorityMap = {
      'vo2max': 1,
      'threshold': 2,
      'tempo': 3,
      'long_run': 2,
      'race_pace': 1,
      'time_trial': 1,
      'speed': 3,
      'hill_repeats': 3,
      'progression': 4,
      'fartlek': 4,
      'steady': 5,
      'easy': 6,
      'recovery': 7,
      'cross_training': 8,
      'strength': 8
    };
    
    return priorityMap[workout.type] || 5;
  }
  
  private formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  
  private formatICalDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hour}${minute}${second}`;
  }
  
  private sanitizeText(text: string): string {
    // Escape special characters for iCal format
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '')
      .trim();
  }
  
  /**
   * Fold lines to comply with RFC 5545 (75 character limit)
   */
  private foldLine(line: string): string {
    if (line.length <= 75) {
      return line;
    }
    
    const folded: string[] = [];
    let remaining = line;
    
    // First line can be up to 75 characters
    folded.push(remaining.substring(0, 75));
    remaining = remaining.substring(75);
    
    // Subsequent lines can be up to 74 characters (space for leading space)
    while (remaining.length > 0) {
      const chunk = remaining.substring(0, 74);
      folded.push(' ' + chunk); // Leading space for continuation
      remaining = remaining.substring(74);
    }
    
    return folded.join('\r\n');
  }
  
  /**
   * Fold all lines in iCal content for RFC 5545 compliance
   */
  private foldContent(content: string | string[]): string {
    const lines = Array.isArray(content) ? content : content.split('\r\n');
    return lines
      .map(line => this.foldLine(line))
      .join('\r\n');
  }
  
  /**
   * Enhanced validation for iCal format
   */
  validatePlan(plan: TrainingPlan): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Call base validation
    const baseValidation = super.validatePlan(plan);
    errors.push(...baseValidation.errors);
    warnings.push(...baseValidation.warnings);
    
    // iCal-specific validation
    if (plan.workouts.some(w => !w.date)) {
      errors.push('Some workouts are missing dates');
    }
    
    if (plan.workouts.some(w => w.targetMetrics.duration <= 0)) {
      errors.push('Some workouts have invalid duration');
    }
    
    const futureCutoff = new Date();
    futureCutoff.setFullYear(futureCutoff.getFullYear() + 2);
    if (plan.workouts.some(w => w.date > futureCutoff)) {
      warnings.push('Some workouts are scheduled more than 2 years in the future');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * PDF formatter for printable plans
 */
class PDFFormatter extends BaseFormatter<PDFOptions> {
  format: ExportFormat = 'pdf';
  mimeType = 'application/pdf';
  fileExtension = 'pdf';
  
  async formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult> {
    const htmlContent = this.generateComprehensiveHTMLContent(plan, options);
    
    // In a real implementation, you'd convert HTML to PDF using a library like Puppeteer or jsPDF
    // For now, we'll return the HTML content as PDF simulation
    const pdfContent = htmlContent;
    const metadata = this.generateMetadata(plan, pdfContent);
    
    return {
      content: Buffer.from(pdfContent),
      filename: `${plan.config.name || 'training-plan'}.pdf`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(pdfContent),
      metadata
    };
  }
  
  private generateComprehensiveHTMLContent(plan: TrainingPlan, options?: FormatOptions): string {
    const chartData = this.generateChartData(plan);
    const thresholdPace = 5.0; // Default threshold pace for calculations
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${plan.config.name || 'Training Plan'}</title>
          <meta charset="UTF-8">
          <style>
            ${this.getEnhancedCSS()}
          </style>
        </head>
        <body>
          ${this.generatePlanHeader(plan)}
          ${this.generatePlanOverview(plan, chartData)}
          ${this.generateTrainingZoneChart(thresholdPace, options)}
          ${this.generatePeriodizationChart(chartData)}
          ${this.generateWeeklyScheduleDetailed(plan, thresholdPace, options)}
          ${this.generateWorkoutLibrary(plan)}
          ${this.generateProgressTracking(plan)}
          ${this.generateFooter()}
        </body>
      </html>
    `;
  }
  
  private getEnhancedCSS(): string {
    return `
      * { box-sizing: border-box; }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 20px;
        line-height: 1.4;
        color: #333;
        font-size: 11pt;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 3px solid #2196F3;
        padding-bottom: 20px;
      }
      
      .header h1 {
        color: #2196F3;
        margin: 0 0 10px 0;
        font-size: 24pt;
        font-weight: bold;
      }
      
      .header .subtitle {
        color: #666;
        font-size: 12pt;
        margin: 5px 0;
      }
      
      .section {
        margin: 25px 0;
        page-break-inside: avoid;
      }
      
      .section h2 {
        color: #2196F3;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 8px;
        margin-bottom: 15px;
        font-size: 16pt;
      }
      
      .section h3 {
        color: #333;
        margin-bottom: 10px;
        font-size: 14pt;
      }
      
      .overview-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .overview-card {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 15px;
      }
      
      .overview-card h4 {
        margin: 0 0 10px 0;
        color: #2196F3;
        font-size: 12pt;
      }
      
      .stat-item {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
        font-size: 10pt;
      }
      
      .stat-label {
        font-weight: 500;
      }
      
      .stat-value {
        font-weight: bold;
        color: #2196F3;
      }
      
      .zone-table, .schedule-table, .workout-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 10pt;
      }
      
      .zone-table th, .schedule-table th, .workout-table th {
        background: #2196F3;
        color: white;
        padding: 10px 8px;
        text-align: left;
        font-weight: bold;
      }
      
      .zone-table td, .schedule-table td, .workout-table td {
        border: 1px solid #ddd;
        padding: 8px;
      }
      
      .zone-table tbody tr:nth-child(even),
      .schedule-table tbody tr:nth-child(even),
      .workout-table tbody tr:nth-child(even) {
        background: #f8f9fa;
      }
      
      .zone-recovery { border-left: 4px solid #4CAF50; }
      .zone-easy { border-left: 4px solid #8BC34A; }
      .zone-steady { border-left: 4px solid #CDDC39; }
      .zone-tempo { border-left: 4px solid #FFC107; }
      .zone-threshold { border-left: 4px solid #FF9800; }
      .zone-vo2max { border-left: 4px solid #FF5722; }
      .zone-neuromuscular { border-left: 4px solid #F44336; }
      
      .week-header {
        background: #e3f2fd;
        border: 2px solid #2196F3;
        padding: 10px;
        margin: 20px 0 10px 0;
        border-radius: 6px;
      }
      
      .week-header .week-title {
        font-weight: bold;
        font-size: 12pt;
        color: #2196F3;
      }
      
      .week-summary {
        font-size: 10pt;
        color: #666;
        margin-top: 5px;
      }
      
      .workout-description {
        font-size: 9pt;
        color: #666;
        margin-top: 3px;
        line-height: 1.3;
      }
      
      .pace-range {
        font-weight: bold;
        color: #2196F3;
      }
      
      .chart-placeholder {
        background: #f0f0f0;
        border: 2px dashed #ccc;
        padding: 30px;
        text-align: center;
        margin: 15px 0;
        border-radius: 6px;
        color: #666;
      }
      
      .progress-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 9pt;
      }
      
      .progress-table th {
        background: #f8f9fa;
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
        font-size: 9pt;
      }
      
      .progress-table td {
        border: 1px solid #ddd;
        padding: 6px;
        text-align: center;
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #e0e0e0;
        text-align: center;
        color: #666;
        font-size: 9pt;
      }
      
      @media print {
        body { margin: 0; padding: 15px; }
        .section { page-break-inside: avoid; }
        .week-header { page-break-after: avoid; }
      }
    `;
  }
  
  private generatePlanHeader(plan: TrainingPlan): string {
    const duration = plan.config.targetDate 
      ? Math.ceil((plan.config.targetDate.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      : 16;
      
    return `
      <div class="header">
        <h1>${plan.config.name || 'Training Plan'}</h1>
        <div class="subtitle">Goal: ${plan.config.goal}</div>
        <div class="subtitle">
          ${format(plan.config.startDate, 'MMMM dd, yyyy')} - 
          ${format(plan.config.targetDate || addDays(plan.config.startDate, duration * 7), 'MMMM dd, yyyy')}
        </div>
        <div class="subtitle">${duration} weeks • ${plan.workouts.length} workouts</div>
      </div>
    `;
  }
  
  private generatePlanOverview(plan: TrainingPlan, chartData: ChartData): string {
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const totalTSS = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
    const avgWeeklyDistance = chartData.weeklyVolume.length > 0 
      ? Math.round(chartData.weeklyVolume.reduce((sum, week) => sum + week.distance, 0) / chartData.weeklyVolume.length)
      : 0;
    const peakWeeklyDistance = Math.max(...chartData.weeklyVolume.map(w => w.distance));
    
    return `
      <div class="section">
        <h2>Plan Overview</h2>
        <div class="overview-grid">
          <div class="overview-card">
            <h4>Training Volume</h4>
            <div class="stat-item">
              <span class="stat-label">Total Distance:</span>
              <span class="stat-value">${Math.round(totalDistance)} km</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Average Weekly:</span>
              <span class="stat-value">${avgWeeklyDistance} km</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Peak Weekly:</span>
              <span class="stat-value">${Math.round(peakWeeklyDistance)} km</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total TSS:</span>
              <span class="stat-value">${Math.round(totalTSS)}</span>
            </div>
          </div>
          
          <div class="overview-card">
            <h4>Intensity Distribution</h4>
            ${chartData.intensityDistribution.map(zone => `
              <div class="stat-item">
                <span class="stat-label">${zone.zone}:</span>
                <span class="stat-value">${zone.percentage}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  private generateTrainingZoneChart(thresholdPace: number, options?: FormatOptions): string {
    const zones = Object.values(TRAINING_ZONES);
    
    return `
      <div class="section">
        <h2>Training Zones & Pace Guide</h2>
        <table class="zone-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>RPE</th>
              <th>Heart Rate</th>
              <th>Pace Range</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            ${zones.map(zone => {
              const paceRange = this.calculatePace(zone, thresholdPace);
              const hrRange = zone.heartRateRange 
                ? `${zone.heartRateRange.min}-${zone.heartRateRange.max}%` 
                : 'N/A';
              const zoneClass = `zone-${zone.name.toLowerCase().replace(/\s+/g, '-')}`;
              
              return `
                <tr class="${zoneClass}">
                  <td><strong>${zone.name}</strong><br><small>${zone.description}</small></td>
                  <td>${zone.rpe}/10</td>
                  <td>${hrRange}</td>
                  <td class="pace-range">${paceRange.min} - ${paceRange.max} /km</td>
                  <td><small>${zone.purpose}</small></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  private generatePeriodizationChart(chartData: ChartData): string {
    return `
      <div class="section">
        <h2>Periodization Overview</h2>
        <table class="workout-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>Duration</th>
              <th>Focus Areas</th>
            </tr>
          </thead>
          <tbody>
            ${chartData.periodization.map(phase => `
              <tr>
                <td><strong>${phase.phase}</strong></td>
                <td>${phase.weeks} weeks</td>
                <td>${phase.focus.join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="chart-placeholder">
          <strong>Weekly Volume Chart</strong><br>
          Training load progression across ${chartData.weeklyVolume.length} weeks<br>
          <small>Peak: ${Math.max(...chartData.weeklyVolume.map(w => w.distance))} km • 
          Average: ${Math.round(chartData.weeklyVolume.reduce((sum, w) => sum + w.distance, 0) / chartData.weeklyVolume.length)} km</small>
        </div>
      </div>
    `;
  }
  
  private generateWeeklyScheduleDetailed(plan: TrainingPlan, thresholdPace: number, options?: FormatOptions): string {
    const weeks = new Map<number, PlannedWorkout[]>();
    
    plan.workouts.forEach(workout => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ) + 1;
      
      if (!weeks.has(weekNumber)) {
        weeks.set(weekNumber, []);
      }
      weeks.get(weekNumber)!.push(workout);
    });
    
    let html = `
      <div class="section">
        <h2>Weekly Training Schedule</h2>
    `;
    
    weeks.forEach((workouts, weekNumber) => {
      const weekDistance = workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
      const weekTSS = workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0);
      const weekBlock = plan.blocks.find(b => 
        workouts[0] && workouts[0].date >= b.startDate && workouts[0].date <= b.endDate
      );
      
      html += `
        <div class="week-header">
          <div class="week-title">Week ${weekNumber} - ${weekBlock?.phase || 'Training'}</div>
          <div class="week-summary">
            ${Math.round(weekDistance)} km • ${Math.round(weekTSS)} TSS • ${workouts.length} workouts
          </div>
        </div>
        
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Workout</th>
              <th>Duration</th>
              <th>Distance</th>
              <th>Zone</th>
              <th>Pace</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${workouts.sort((a, b) => a.date.getTime() - b.date.getTime()).map(workout => {
              const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
              const paceRange = zone ? this.calculatePace(zone, thresholdPace) : { min: '5:00', max: '5:00' };
              const zoneClass = zone ? `zone-${zone.name.toLowerCase().replace(/\s+/g, '-')}` : '';
              
              return `
                <tr class="${zoneClass}">
                  <td>${format(workout.date, 'EEE MMM dd')}</td>
                  <td><strong>${workout.name}</strong></td>
                  <td>${workout.targetMetrics.duration} min</td>
                  <td>${workout.targetMetrics.distance || 0} km</td>
                  <td>${zone?.name || 'Easy'}</td>
                  <td class="pace-range">${paceRange.min}-${paceRange.max}</td>
                  <td class="workout-description">${this.getDetailedWorkoutDescription(workout)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  private generateWorkoutLibrary(plan: TrainingPlan): string {
    const uniqueWorkoutTypes = [...new Set(plan.workouts.map(w => w.type))];
    
    return `
      <div class="section">
        <h2>Workout Library</h2>
        <p><small>Detailed descriptions of workout types used in this plan</small></p>
        
        ${uniqueWorkoutTypes.map(type => {
          const template = Object.values(WORKOUT_TEMPLATES).find(t => t.type === type);
          if (!template) return '';
          
          return `
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
              <h4 style="margin: 0 0 8px 0; color: #2196F3; text-transform: capitalize;">
                ${type.replace(/_/g, ' ')} Workouts
              </h4>
              <div style="font-size: 10pt; color: #666; margin-bottom: 8px;">
                <strong>Purpose:</strong> ${template.adaptationTarget}
              </div>
              <div style="font-size: 10pt; color: #666; margin-bottom: 8px;">
                <strong>Primary Zone:</strong> ${template.primaryZone.name} (${template.primaryZone.description})
              </div>
              ${template.segments.length > 1 ? `
                <div style="font-size: 9pt; color: #555;">
                  <strong>Structure:</strong> ${template.segments.map(seg => 
                    `${seg.duration}min @ ${seg.zone.name}`
                  ).join(' → ')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  
  private generateProgressTracking(plan: TrainingPlan): string {
    const weeklyData = this.generateChartData(plan).weeklyVolume;
    
    return `
      <div class="section">
        <h2>Progress Tracking</h2>
        <p><small>Use this table to track your weekly progress and make notes</small></p>
        
        <table class="progress-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Target Distance</th>
              <th>Actual Distance</th>
              <th>Completed Workouts</th>
              <th>RPE (1-10)</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${weeklyData.map(week => `
              <tr>
                <td><strong>${week.week}</strong></td>
                <td>${Math.round(week.distance)} km</td>
                <td style="border-bottom: 1px solid #999;"></td>
                <td style="border-bottom: 1px solid #999;"></td>
                <td style="border-bottom: 1px solid #999;"></td>
                <td style="border-bottom: 1px solid #999; width: 200px;"></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  
  private generateFooter(): string {
    return `
      <div class="footer">
        <div>Training Plan generated by Training Plan Generator</div>
        <div>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</div>
        <div style="margin-top: 10px; font-size: 8pt;">
          <strong>Important:</strong> Always listen to your body. Adjust training intensity based on how you feel.
          Consult with a healthcare provider before starting any new training program.
        </div>
      </div>
    `;
  }
  
  private getDetailedWorkoutDescription(workout: PlannedWorkout): string {
    const template = Object.values(WORKOUT_TEMPLATES).find(t => t.type === workout.type);
    
    if (template && template.segments.length > 1) {
      // Multi-segment workout - provide structured description
      return template.segments
        .filter(seg => seg.duration > 2) // Filter out very short segments
        .map(seg => `${seg.duration}min @ ${seg.zone.name}`)
        .join(' → ');
    }
    
    // Single segment or simple workout
    return workout.description || template?.adaptationTarget || 'Standard training session';
  }
}

/**
 * TrainingPeaks formatter with TSS and workout codes
 */
class TrainingPeaksFormatter extends BaseFormatter {
  format: ExportFormat = 'json'; // TrainingPeaks uses JSON format
  mimeType = 'application/json';
  fileExtension = 'json';
  
  async formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult> {
    const trainingPeaksData = this.generateTrainingPeaksFormat(plan, options);
    const content = JSON.stringify(trainingPeaksData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    
    return {
      content,
      filename: `${plan.config.name || 'training-plan'}-trainingpeaks.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
  
  private generateTrainingPeaksFormat(plan: TrainingPlan, options?: FormatOptions) {
    return {
      plan: {
        name: plan.config.name || 'Training Plan',
        description: plan.config.goal,
        author: 'Training Plan Generator',
        startDate: plan.config.startDate.toISOString(),
        endDate: plan.config.targetDate?.toISOString() || addDays(plan.config.startDate, 112).toISOString(),
        planType: 'running',
        difficulty: this.calculatePlanDifficulty(plan),
        weeklyHours: this.estimateWeeklyHours(plan),
        totalTSS: plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0)
      },
      workouts: plan.workouts.map(workout => this.formatTrainingPeaksWorkout(workout, plan)),
      phases: plan.blocks.map(block => ({
        name: block.phase,
        startDate: block.startDate.toISOString(),
        endDate: block.endDate.toISOString(),
        weeks: block.weeks,
        objectives: block.focusAreas,
        description: `${block.phase} phase focusing on ${block.focusAreas.join(', ')}`
      })),
      annotations: this.generateTrainingPeaksAnnotations(plan)
    };
  }
  
  private formatTrainingPeaksWorkout(workout: PlannedWorkout, plan: TrainingPlan) {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    const workoutCode = this.generateWorkoutCode(workout);
    const template = Object.values(WORKOUT_TEMPLATES).find(t => t.type === workout.type);
    
    return {
      date: workout.date.toISOString().split('T')[0],
      name: workout.name,
      description: this.generateTrainingPeaksDescription(workout, template),
      workoutCode,
      tss: workout.targetMetrics.tss,
      duration: workout.targetMetrics.duration,
      distance: workout.targetMetrics.distance || null,
      intensity: workout.targetMetrics.intensity,
      workoutType: this.mapToTrainingPeaksType(workout.type),
      primaryZone: zone?.name || 'Aerobic',
      structure: this.generateWorkoutStructure(workout, template),
      tags: this.generateWorkoutTags(workout),
      priority: this.getWorkoutPriority(workout),
      equipment: this.getRequiredEquipment(workout)
    };
  }
  
  private generateWorkoutCode(workout: PlannedWorkout): string {
    const typeMap: Record<string, string> = {
      'recovery': 'REC',
      'easy': 'E',
      'steady': 'ST', 
      'tempo': 'T',
      'threshold': 'LT',
      'vo2max': 'VO2',
      'speed': 'SP',
      'hill_repeats': 'H',
      'fartlek': 'F',
      'progression': 'PR',
      'long_run': 'LSD',
      'race_pace': 'RP',
      'time_trial': 'TT',
      'cross_training': 'XT',
      'strength': 'S'
    };
    
    const code = typeMap[workout.type] || 'GEN';
    const duration = Math.round(workout.targetMetrics.duration);
    const intensity = Math.round(workout.targetMetrics.intensity);
    
    // Generate code with only alphanumeric characters for platform compatibility
    return `${code}${duration}I${intensity}`;
  }
  
  private generateTrainingPeaksDescription(workout: PlannedWorkout, template: Workout): string {
    const parts = [
      workout.description,
      '',
      `TSS: ${workout.targetMetrics.tss}`,
      `Duration: ${workout.targetMetrics.duration} minutes`,
      workout.targetMetrics.distance ? `Distance: ${workout.targetMetrics.distance} km` : '',
      `Intensity: ${workout.targetMetrics.intensity}%`
    ];
    
    if (template?.adaptationTarget) {
      parts.push('', `Training Focus: ${template.adaptationTarget}`);
    }
    
    if (template && template.segments.length > 1) {
      parts.push('', 'Workout Structure:');
      template.segments
        .filter((seg: WorkoutSegment) => seg.duration > 2)
        .forEach((seg: WorkoutSegment) => {
          parts.push(`• ${seg.duration}min @ ${seg.zone.name} - ${seg.description}`);
        });
    }
    
    return parts.filter(Boolean).join('\n');
  }
  
  private generateWorkoutStructure(workout: PlannedWorkout, template: Workout) {
    if (!template || template.segments.length <= 1) {
      return [{
        duration: workout.targetMetrics.duration,
        intensity: workout.targetMetrics.intensity,
        zone: workout.workout.primaryZone?.name || 'Easy',
        description: workout.description
      }];
    }
    
    return template.segments.map((segment: WorkoutSegment) => ({
      duration: segment.duration,
      intensity: segment.intensity,
      zone: segment.zone.name,
      description: segment.description,
      targetPace: this.calculateSegmentPace(segment),
      targetHR: this.calculateSegmentHR(segment)
    }));
  }
  
  private calculateSegmentPace(segment: WorkoutSegment): string | null {
    if (segment.zone.paceRange) {
      const thresholdPace = 5.0; // Default threshold pace
      const minPace = thresholdPace * (segment.zone.paceRange.min / 100);
      const maxPace = thresholdPace * (segment.zone.paceRange.max / 100);
      return `${this.formatPace(minPace)}-${this.formatPace(maxPace)}`;
    }
    return null;
  }
  
  private calculateSegmentHR(segment: WorkoutSegment): string | null {
    if (segment.zone.heartRateRange) {
      return `${segment.zone.heartRateRange.min}-${segment.zone.heartRateRange.max}%`;
    }
    return null;
  }
  
  private formatPace(pace: number): string {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  private mapToTrainingPeaksType(type: string): string {
    const typeMap: Record<string, string> = {
      'recovery': 'Recovery',
      'easy': 'Aerobic',
      'steady': 'Aerobic',
      'tempo': 'Tempo',
      'threshold': 'Lactate Threshold',
      'vo2max': 'VO2max',
      'speed': 'Neuromuscular Power',
      'hill_repeats': 'Aerobic Power',
      'fartlek': 'Mixed',
      'progression': 'Aerobic Power',
      'long_run': 'Aerobic',
      'race_pace': 'Lactate Threshold',
      'time_trial': 'Testing',
      'cross_training': 'Cross Training',
      'strength': 'Strength'
    };
    return typeMap[type] || 'General';
  }
  
  private generateWorkoutTags(workout: PlannedWorkout): string[] {
    const tags = [workout.type.replace('_', ' ')];
    
    if (workout.targetMetrics.intensity >= 85) tags.push('High Intensity');
    if (workout.targetMetrics.tss >= 100) tags.push('Key Workout');
    if (workout.targetMetrics.duration >= 90) tags.push('Long Session');
    if (workout.type.includes('race')) tags.push('Race Prep');
    
    return tags;
  }
  
  private getWorkoutPriority(workout: PlannedWorkout): 'A' | 'B' | 'C' {
    if (['vo2max', 'threshold', 'race_pace', 'time_trial'].includes(workout.type)) return 'A';
    if (['tempo', 'long_run', 'speed', 'hill_repeats'].includes(workout.type)) return 'B';
    return 'C';
  }
  
  private getRequiredEquipment(workout: PlannedWorkout): string[] {
    const equipment = ['Running Shoes'];
    
    if (workout.type === 'speed') equipment.push('Track Access');
    if (workout.type === 'hill_repeats') equipment.push('Hilly Route');
    if (workout.type === 'cross_training') equipment.push('Cross Training Equipment');
    if (workout.type === 'strength') equipment.push('Gym Access');
    if (workout.targetMetrics.intensity >= 85) equipment.push('Heart Rate Monitor');
    
    return equipment;
  }
  
  private calculatePlanDifficulty(plan: TrainingPlan): 'Beginner' | 'Intermediate' | 'Advanced' {
    const avgTSS = plan.workouts.reduce((sum, w) => sum + w.targetMetrics.tss, 0) / plan.workouts.length;
    const highIntensityPercent = plan.workouts.filter(w => w.targetMetrics.intensity >= 85).length / plan.workouts.length;
    
    if (avgTSS >= 80 || highIntensityPercent >= 0.3) return 'Advanced';
    if (avgTSS >= 60 || highIntensityPercent >= 0.2) return 'Intermediate';
    return 'Beginner';
  }
  
  private estimateWeeklyHours(plan: TrainingPlan): number {
    const totalMinutes = plan.workouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0);
    const weeks = Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 16;
    return Math.round((totalMinutes / weeks) / 60 * 10) / 10; // Round to 1 decimal
  }
  
  private generateTrainingPeaksAnnotations(plan: TrainingPlan) {
    const annotations = [];
    
    // Add phase transition annotations
    plan.blocks.forEach(block => {
      annotations.push({
        date: block.startDate.toISOString().split('T')[0],
        type: 'phase-start',
        title: `${block.phase} Phase Begins`,
        description: `Focus: ${block.focusAreas.join(', ')}`,
        priority: 'high'
      });
    });
    
    // Add key workout annotations
    plan.workouts
      .filter(w => w.targetMetrics.tss >= 100 || ['vo2max', 'threshold', 'time_trial'].includes(w.type))
      .forEach(workout => {
        annotations.push({
          date: workout.date.toISOString().split('T')[0],
          type: 'key-workout',
          title: `Key Workout: ${workout.name}`,
          description: `TSS: ${workout.targetMetrics.tss}`,
          priority: 'medium'
        });
      });
    
    return annotations;
  }
}

/**
 * Strava formatter with activity descriptions and segments
 */
class StravaFormatter extends BaseFormatter {
  format: ExportFormat = 'json';
  mimeType = 'application/json';
  fileExtension = 'json';
  
  async formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult> {
    const stravaData = this.generateStravaFormat(plan, options);
    const content = JSON.stringify(stravaData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    
    return {
      content,
      filename: `${plan.config.name || 'training-plan'}-strava.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
  
  private generateStravaFormat(plan: TrainingPlan, options?: FormatOptions) {
    return {
      plan: {
        name: plan.config.name || 'Training Plan',
        description: this.generateStravaDescription(plan),
        sport_type: 'Run',
        start_date: plan.config.startDate.toISOString(),
        end_date: plan.config.targetDate?.toISOString() || addDays(plan.config.startDate, 112).toISOString()
      },
      activities: plan.workouts.map(workout => this.formatStravaActivity(workout, plan)),
      segments: this.generateStravaSegments(plan),
      goals: this.generateStravaGoals(plan)
    };
  }
  
  private generateStravaDescription(plan: TrainingPlan): string {
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const weeks = Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 16;
    
    return [
      `🏃‍♂️ ${plan.config.goal}`,
      '',
      `📊 Plan Overview:`,
      `• Duration: ${weeks} weeks`,
      `• Total Distance: ${Math.round(totalDistance)} km`,
      `• Total Workouts: ${plan.workouts.length}`,
      `• Training Phases: ${plan.blocks.length}`,
      '',
      `🎯 Training Focus:`,
      ...plan.blocks.map(block => `• ${block.phase}: ${block.focusAreas.join(', ')}`),
      '',
      `💪 Generated by Training Plan Generator`
    ].join('\n');
  }
  
  private formatStravaActivity(workout: PlannedWorkout, plan: TrainingPlan) {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    const template = Object.values(WORKOUT_TEMPLATES).find(t => t.type === workout.type);
    
    return {
      name: this.generateStravaActivityName(workout),
      description: this.generateStravaActivityDescription(workout, template),
      type: 'Run',
      start_date: workout.date.toISOString(),
      distance: (workout.targetMetrics.distance || 0) * 1000, // Convert to meters
      moving_time: workout.targetMetrics.duration * 60, // Convert to seconds
      workout_type: this.mapToStravaWorkoutType(workout.type),
      trainer: false,
      commute: false,
      gear_id: null,
      average_heartrate: this.estimateAverageHR(zone),
      max_heartrate: this.estimateMaxHR(zone),
      average_speed: this.calculateAverageSpeed(workout),
      max_speed: this.calculateMaxSpeed(workout),
      suffer_score: Math.round(workout.targetMetrics.tss * 0.8), // Strava's relative effort
      segments_effort: this.generateSegmentEfforts(workout, template),
      segments: this.generateSegmentEfforts(workout, template), // Alias for test compatibility
      splits_metric: this.generateKilometerSplits(workout, template),
      tags: this.generateStravaTags(workout),
      kudos_count: 0,
      comment_count: 0,
      athlete_count: 1,
      photo_count: 0,
      map: null,
      manual: true,
      private: false,
      visibility: 'everyone',
      flagged: false,
      has_kudoed: false,
      achievement_count: 0,
      pr_count: 0
    };
  }
  
  private generateStravaActivityName(workout: PlannedWorkout): string {
    const emojiMap: Record<string, string> = {
      'recovery': '😌',
      'easy': '🏃‍♂️',
      'steady': '🏃‍♀️',
      'tempo': '💨',
      'threshold': '🔥',
      'vo2max': '⚡',
      'speed': '🚀',
      'hill_repeats': '⛰️',
      'fartlek': '🎯',
      'progression': '📈',
      'long_run': '🏃‍♂️💪',
      'race_pace': '🏁',
      'time_trial': '⏱️',
      'cross_training': '🏋️‍♂️',
      'strength': '💪'
    };
    
    const emoji = emojiMap[workout.type] || '🏃‍♂️';
    const distance = workout.targetMetrics.distance ? ` ${workout.targetMetrics.distance}km` : '';
    const intensity = workout.targetMetrics.intensity >= 85 ? ' (High Intensity)' : '';
    
    return `${emoji} ${workout.name}${distance}${intensity}`;
  }
  
  private generateStravaActivityDescription(workout: PlannedWorkout, template: Workout): string {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    const paceRange = this.calculatePace(zone, 5.0);
    
    const parts = [
      `🎯 ${workout.description}`,
      '',
      `📊 Workout Details:`,
      `• Duration: ${workout.targetMetrics.duration} minutes`,
      workout.targetMetrics.distance ? `• Distance: ${workout.targetMetrics.distance} km` : '',
      `• Target Pace: ${paceRange.min}-${paceRange.max} /km`,
      `• Training Zone: ${zone?.name || 'Easy'} (${zone?.description || 'Easy effort'})`,
      `• RPE: ${zone?.rpe || 2}/10`,
      `• Estimated TSS: ${workout.targetMetrics.tss}`,
      ''
    ];
    
    if (template && template.segments.length > 1) {
      parts.push('🏃‍♂️ Workout Structure:');
      template.segments
        .filter((seg: WorkoutSegment) => seg.duration > 2)
        .forEach((seg: WorkoutSegment, index: number) => {
          parts.push(`${index + 1}. ${seg.duration}min @ ${seg.zone.name} - ${seg.description}`);
        });
      parts.push('');
    }
    
    if (template?.adaptationTarget) {
      parts.push(`🎯 Training Focus: ${template.adaptationTarget}`, '');
    }
    
    parts.push(
      '✅ Pre-Workout:',
      '• Proper warm-up completed',
      '• Hydration check ✓',
      '• Route planned ✓',
      '',
      '📝 Post-Workout:',
      '• How did it feel?',
      '• Any adjustments needed?',
      '• Recovery notes',
      '',
      '#TrainingPlan #RunningTraining #StructuredWorkout'
    );
    
    return parts.join('\n');
  }
  
  private mapToStravaWorkoutType(type: string): number {
    // Strava workout type IDs
    const typeMap: Record<string, number> = {
      'recovery': 1, // Default Run
      'easy': 1,     // Default Run
      'steady': 1,   // Default Run
      'tempo': 11,   // Workout
      'threshold': 11, // Workout
      'vo2max': 11,  // Workout
      'speed': 11,   // Workout
      'hill_repeats': 11, // Workout
      'fartlek': 11, // Workout
      'progression': 1, // Default Run
      'long_run': 2, // Long Run
      'race_pace': 3, // Race
      'time_trial': 3, // Race
      'cross_training': 1, // Default Run
      'strength': 1  // Default Run
    };
    return typeMap[type] || 1;
  }
  
  private estimateAverageHR(zone: TrainingZone): number | null {
    if (zone?.heartRateRange) {
      const maxHR = 185; // Assumed max HR
      return Math.round((zone.heartRateRange.min + zone.heartRateRange.max) / 2 * maxHR / 100);
    }
    return null;
  }
  
  private estimateMaxHR(zone: TrainingZone): number | null {
    if (zone?.heartRateRange) {
      const maxHR = 185; // Assumed max HR
      return Math.round(zone.heartRateRange.max * maxHR / 100 * 1.05); // 5% higher than zone max
    }
    return null;
  }
  
  private calculateAverageSpeed(workout: PlannedWorkout): number {
    if (workout.targetMetrics.distance && workout.targetMetrics.duration) {
      // Speed in m/s
      return (workout.targetMetrics.distance * 1000) / (workout.targetMetrics.duration * 60);
    }
    return 3.33; // Default ~5:00/km pace
  }
  
  private calculateMaxSpeed(workout: PlannedWorkout): number {
    const avgSpeed = this.calculateAverageSpeed(workout);
    // Max speed typically 20-30% higher than average for interval workouts
    const multiplier = ['vo2max', 'speed', 'hill_repeats'].includes(workout.type) ? 1.3 : 1.1;
    return avgSpeed * multiplier;
  }
  
  private generateSegmentEfforts(workout: PlannedWorkout, template: Workout) {
    if (!template || template.segments.length <= 1) return [];
    
    return template.segments
      .filter((seg: WorkoutSegment) => seg.duration > 2 && seg.intensity > 75)
      .map((seg: WorkoutSegment, index: number) => ({
        id: `segment_${index}`,
        name: `${seg.zone.name} Interval`,
        distance: Math.round((workout.targetMetrics.distance || 5) * (seg.duration / workout.targetMetrics.duration) * 1000),
        moving_time: seg.duration * 60,
        elapsed_time: seg.duration * 60,
        start_index: index * 100,
        end_index: (index + 1) * 100,
        average_heartrate: this.estimateAverageHR(seg.zone),
        max_heartrate: this.estimateMaxHR(seg.zone),
        effort_score: Math.round(seg.intensity * 0.8)
      }));
  }
  
  private generateKilometerSplits(workout: PlannedWorkout, template: Workout) {
    if (!workout.targetMetrics.distance) return [];
    
    const totalKm = Math.floor(workout.targetMetrics.distance);
    const splits = [];
    
    for (let i = 1; i <= totalKm; i++) {
      const avgPace = this.calculateAverageSpeed(workout);
      const paceVariation = Math.random() * 0.2 - 0.1; // ±10% variation
      const splitTime = (1000 / avgPace) * (1 + paceVariation);
      
      splits.push({
        distance: 1000, // 1km in meters
        elapsed_time: Math.round(splitTime),
        elevation_difference: Math.round((Math.random() - 0.5) * 20), // ±10m elevation
        moving_time: Math.round(splitTime),
        pace_zone: this.getSplitPaceZone(workout, i, totalKm),
        split: i,
        average_speed: 1000 / splitTime,
        average_heartrate: this.estimateAverageHR(TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'])
      });
    }
    
    return splits;
  }
  
  private getSplitPaceZone(workout: PlannedWorkout, km: number, totalKm: number): number {
    // Simulate pacing strategy
    if (workout.type === 'progression') {
      return Math.min(9, Math.floor(3 + (km / totalKm) * 4)); // Progressive effort
    } else if (workout.type === 'fartlek') {
      return Math.floor(3 + Math.random() * 4); // Variable effort
    } else {
      const baseZone = Math.min(9, Math.max(1, Math.round(workout.targetMetrics.intensity / 12)));
      return baseZone + Math.round((Math.random() - 0.5) * 2); // Slight variation
    }
  }
  
  private generateStravaTags(workout: PlannedWorkout): string[] {
    const tags = ['#TrainingPlan', '#RunningTraining'];
    
    tags.push(`#${workout.type.replace('_', '').toLowerCase()}`);
    
    if (workout.targetMetrics.intensity >= 85) tags.push('#HighIntensity');
    if (workout.targetMetrics.tss >= 100) tags.push('#KeyWorkout');
    if (workout.targetMetrics.duration >= 90) tags.push('#LongRun');
    if (workout.type.includes('race')) tags.push('#RacePrep');
    
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    if (zone) tags.push(`#Zone${zone.name.replace(/\s+/g, '')}`);
    
    return tags;
  }
  
  private generateStravaSegments(plan: TrainingPlan) {
    // Generate common training segments
    return [
      {
        id: 'warmup-segment',
        name: 'Training Plan Warm-up',
        distance: 1000,
        average_grade: 0.5,
        maximum_grade: 2.0,
        climb_category: 0,
        city: 'Training Route',
        state: 'Training',
        country: 'Training',
        private: false,
        effort_count: plan.workouts.length,
        athlete_count: 1,
        star_count: 0
      },
      {
        id: 'cooldown-segment',
        name: 'Training Plan Cool-down',
        distance: 800,
        average_grade: -0.3,
        maximum_grade: 1.0,
        climb_category: 0,
        city: 'Training Route',
        state: 'Training',
        country: 'Training',
        private: false,
        effort_count: plan.workouts.length,
        athlete_count: 1,
        star_count: 0
      }
    ];
  }
  
  private generateStravaGoals(plan: TrainingPlan) {
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const weeks = Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 16;
    
    return [
      {
        type: 'distance',
        period: 'total',
        target: Math.round(totalDistance * 1000), // Convert to meters
        current: 0,
        unit: 'meters'
      },
      {
        type: 'time',
        period: 'total', 
        target: plan.workouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0) * 60, // Convert to seconds
        current: 0,
        unit: 'seconds'
      },
      {
        type: 'activities',
        period: 'total',
        target: plan.workouts.length,
        current: 0,
        unit: 'activities'
      }
    ];
  }
}

/**
 * Garmin formatter with structured workout files  
 */
class GarminFormatter extends BaseFormatter {
  format: ExportFormat = 'json';
  mimeType = 'application/json';
  fileExtension = 'json';
  
  async formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult> {
    const garminData = this.generateGarminFormat(plan, options);
    const content = JSON.stringify(garminData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    
    return {
      content,
      filename: `${plan.config.name || 'training-plan'}-garmin.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
  
  private generateGarminFormat(plan: TrainingPlan, options?: FormatOptions) {
    return {
      trainingPlan: {
        planId: `tp-${Date.now()}`,
        planName: plan.config.name || 'Training Plan',
        description: plan.config.goal,
        estimatedDurationInWeeks: Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 16,
        startDate: plan.config.startDate.toISOString(),
        endDate: plan.config.targetDate?.toISOString() || addDays(plan.config.startDate, 112).toISOString(),
        sportType: 'RUNNING',
        planType: 'CUSTOM',
        difficulty: this.calculateGarminDifficulty(plan),
        createdBy: 'Training Plan Generator',
        version: '1.0'
      },
      workouts: plan.workouts.map(workout => this.formatGarminWorkout(workout, plan)),
      schedule: this.generateGarminSchedule(plan),
      phases: plan.blocks.map(block => this.formatGarminPhase(block)),
      settings: this.generateGarminSettings(plan, options)
    };
  }
  
  private formatGarminWorkout(workout: PlannedWorkout, plan: TrainingPlan) {
    const template = Object.values(WORKOUT_TEMPLATES).find(t => t.type === workout.type);
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    
    const segments = this.generateGarminSegments(workout, template);
    
    return {
      workoutId: `workout-${workout.id}`,
      workoutName: workout.name,
      description: workout.description,
      sport: 'RUNNING',
      subSport: 'GENERIC',
      estimatedDurationInSecs: workout.targetMetrics.duration * 60,
      estimatedDistanceInMeters: (workout.targetMetrics.distance || 0) * 1000,
      tss: workout.targetMetrics.tss,
      workoutSegments: segments,
      steps: segments, // Alias for compatibility with tests
      primaryBenefit: this.mapToPrimaryBenefit(workout.type),
      secondaryBenefit: this.mapToSecondaryBenefit(workout.type),
      equipmentRequired: this.getGarminEquipment(workout),
      instructions: this.generateGarminInstructions(workout, template),
      tags: [workout.type, zone?.name || 'Easy'],
      difficulty: this.calculateWorkoutDifficulty(workout),
      creator: 'Training Plan Generator'
    };
  }
  
  private generateGarminSegments(workout: PlannedWorkout, template: Workout) {
    if (!template || template.segments.length <= 1) {
      // Simple workout
      return [{
        segmentOrder: 1,
        segmentType: 'INTERVAL',
        durationType: 'TIME',
        durationValue: workout.targetMetrics.duration * 60,
        targetType: 'PACE',
        targetValueLow: this.calculatePaceTarget(workout, 'low'),
        targetValueHigh: this.calculatePaceTarget(workout, 'high'),
        intensity: this.mapToGarminIntensity(workout.targetMetrics.intensity),
        description: workout.description
      }];
    }
    
    // Structured workout with multiple segments
    return template.segments.map((segment: WorkoutSegment, index: number) => ({
      segmentOrder: index + 1,
      segmentType: this.getGarminSegmentType(segment),
      durationType: 'TIME',
      durationValue: segment.duration * 60,
      targetType: this.getGarminTargetType(segment),
      targetValueLow: this.calculateSegmentTargetLow(segment),
      targetValueHigh: this.calculateSegmentTargetHigh(segment),
      intensity: this.mapToGarminIntensity(segment.intensity),
      description: segment.description,
      restDuration: this.calculateRestDuration(segment, template.segments[index + 1])
    }));
  }
  
  private getGarminSegmentType(segment: WorkoutSegment): string {
    if (segment.zone.name === 'Recovery') return 'RECOVERY';
    if (segment.intensity >= 85) return 'INTERVAL';
    if (segment.description.toLowerCase().includes('warm')) return 'WARMUP';
    if (segment.description.toLowerCase().includes('cool')) return 'COOLDOWN';
    return 'INTERVAL';
  }
  
  private getGarminTargetType(segment: WorkoutSegment): string {
    if (segment.zone.heartRateRange) return 'HEART_RATE';
    if (segment.zone.paceRange) return 'PACE';
    return 'OPEN';
  }
  
  private calculatePaceTarget(workout: PlannedWorkout, bound: 'low' | 'high'): number {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    if (zone?.paceRange) {
      const thresholdPace = 5.0; // Default threshold pace in min/km
      const paceInMinKm = bound === 'low' 
        ? thresholdPace * (zone.paceRange.min / 100)
        : thresholdPace * (zone.paceRange.max / 100);
      return Math.round(paceInMinKm * 60); // Convert to seconds per km
    }
    return 300; // Default 5:00/km in seconds
  }
  
  private calculateSegmentTargetLow(segment: WorkoutSegment): number {
    if (segment.zone.heartRateRange) {
      return Math.round(segment.zone.heartRateRange.min * 1.85); // Assuming max HR of 185
    }
    if (segment.zone.paceRange) {
      const thresholdPace = 5.0;
      return Math.round(thresholdPace * (segment.zone.paceRange.min / 100) * 60);
    }
    return segment.intensity; // Fallback to intensity percentage
  }
  
  private calculateSegmentTargetHigh(segment: WorkoutSegment): number {
    if (segment.zone.heartRateRange) {
      return Math.round(segment.zone.heartRateRange.max * 1.85); // Assuming max HR of 185
    }
    if (segment.zone.paceRange) {
      const thresholdPace = 5.0;
      return Math.round(thresholdPace * (segment.zone.paceRange.max / 100) * 60);
    }
    return segment.intensity; // Fallback to intensity percentage
  }
  
  private calculateRestDuration(currentSegment: WorkoutSegment, nextSegment: WorkoutSegment | undefined): number {
    if (!nextSegment) return 0;
    
    // Add rest between high-intensity intervals
    if (currentSegment.intensity >= 85 && nextSegment.intensity >= 85) {
      return Math.round(currentSegment.duration * 0.5 * 60); // Half the interval duration
    }
    
    // Add short rest between different zones
    if (currentSegment.zone.name !== nextSegment.zone.name) {
      return 30; // 30 seconds
    }
    
    return 0;
  }
  
  private mapToGarminIntensity(intensity: number): string {
    if (intensity >= 95) return 'NEUROMUSCULAR_POWER';
    if (intensity >= 90) return 'ANAEROBIC_CAPACITY';
    if (intensity >= 85) return 'VO2_MAX';
    if (intensity >= 80) return 'LACTATE_THRESHOLD';
    if (intensity >= 70) return 'TEMPO';
    if (intensity >= 60) return 'AEROBIC_BASE';
    return 'RECOVERY';
  }
  
  private mapToPrimaryBenefit(type: string): string {
    const benefitMap: Record<string, string> = {
      'recovery': 'RECOVERY',
      'easy': 'AEROBIC_BASE',
      'steady': 'AEROBIC_BASE',
      'tempo': 'TEMPO',
      'threshold': 'LACTATE_THRESHOLD',
      'vo2max': 'VO2_MAX',
      'speed': 'NEUROMUSCULAR_POWER',
      'hill_repeats': 'ANAEROBIC_CAPACITY',
      'fartlek': 'VO2_MAX',
      'progression': 'LACTATE_THRESHOLD',
      'long_run': 'AEROBIC_BASE',
      'race_pace': 'LACTATE_THRESHOLD',
      'time_trial': 'VO2_MAX',
      'cross_training': 'RECOVERY',
      'strength': 'MUSCULAR_ENDURANCE'
    };
    return benefitMap[type] || 'AEROBIC_BASE';
  }
  
  private mapToSecondaryBenefit(type: string): string {
    const benefitMap: Record<string, string> = {
      'recovery': 'AEROBIC_BASE',
      'easy': 'RECOVERY',
      'steady': 'TEMPO',
      'tempo': 'AEROBIC_BASE',
      'threshold': 'VO2_MAX',
      'vo2max': 'ANAEROBIC_CAPACITY',
      'speed': 'VO2_MAX',
      'hill_repeats': 'MUSCULAR_ENDURANCE',
      'fartlek': 'ANAEROBIC_CAPACITY',
      'progression': 'VO2_MAX',
      'long_run': 'MUSCULAR_ENDURANCE',
      'race_pace': 'VO2_MAX',
      'time_trial': 'LACTATE_THRESHOLD',
      'cross_training': 'AEROBIC_BASE',
      'strength': 'RECOVERY'
    };
    return benefitMap[type] || 'RECOVERY';
  }
  
  private getGarminEquipment(workout: PlannedWorkout): string[] {
    const equipment = [];
    
    if (workout.targetMetrics.intensity >= 80) equipment.push('HEART_RATE_MONITOR');
    if (workout.type === 'speed') equipment.push('GPS_WATCH');
    if (workout.type === 'strength') equipment.push('GYM_EQUIPMENT');
    if (workout.targetMetrics.duration >= 90) equipment.push('HYDRATION');
    
    return equipment;
  }
  
  private generateGarminInstructions(workout: PlannedWorkout, template: Workout): string[] {
    const instructions = [];
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    
    instructions.push(`Primary Zone: ${zone?.name || 'Easy'} (RPE ${zone?.rpe || 2}/10)`);
    
    if (zone?.heartRateRange) {
      instructions.push(`Target Heart Rate: ${zone.heartRateRange.min}-${zone.heartRateRange.max}% Max HR`);
    }
    
    if (template && template.segments.length > 1) {
      instructions.push('Workout Structure:');
      template.segments
        .filter((seg: WorkoutSegment) => seg.duration > 2)
        .forEach((seg: WorkoutSegment, index: number) => {
          instructions.push(`${index + 1}. ${seg.duration}min @ ${seg.zone.name} - ${seg.description}`);
        });
    }
    
    if (template?.adaptationTarget) {
      instructions.push(`Training Focus: ${template.adaptationTarget}`);
    }
    
    instructions.push('Remember to warm up properly and cool down afterward');
    
    return instructions;
  }
  
  private calculateWorkoutDifficulty(workout: PlannedWorkout): number {
    // Scale 1-10
    const intensityFactor = workout.targetMetrics.intensity / 100;
    const durationFactor = Math.min(workout.targetMetrics.duration / 120, 1); // Cap at 2 hours
    const tssFactor = Math.min(workout.targetMetrics.tss / 150, 1); // Cap at TSS 150
    
    return Math.round((intensityFactor * 0.4 + durationFactor * 0.3 + tssFactor * 0.3) * 10);
  }
  
  private calculateGarminDifficulty(plan: TrainingPlan): string {
    const avgDifficulty = plan.workouts.reduce((sum, w) => sum + this.calculateWorkoutDifficulty(w), 0) / plan.workouts.length;
    
    if (avgDifficulty >= 7) return 'ADVANCED';
    if (avgDifficulty >= 5) return 'INTERMEDIATE';
    return 'BEGINNER';
  }
  
  private generateGarminSchedule(plan: TrainingPlan) {
    return plan.workouts.map(workout => ({
      date: workout.date.toISOString().split('T')[0],
      workoutId: `workout-${workout.id}`,
      scheduledStartTime: this.calculateGarminStartTime(workout),
      priority: this.getGarminPriority(workout),
      notes: workout.description
    }));
  }
  
  private calculateGarminStartTime(workout: PlannedWorkout): string {
    const startTime = new Date(workout.date);
    
    // Optimal scheduling based on workout type
    if (['recovery', 'easy'].includes(workout.type)) {
      startTime.setHours(7, 0, 0, 0);
    } else if (['vo2max', 'threshold', 'speed'].includes(workout.type)) {
      startTime.setHours(17, 0, 0, 0);
    } else if (workout.type === 'long_run') {
      startTime.setHours(8, 0, 0, 0);
    } else {
      startTime.setHours(7, 30, 0, 0);
    }
    
    return startTime.toISOString();
  }
  
  private getGarminPriority(workout: PlannedWorkout): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (['vo2max', 'threshold', 'race_pace', 'time_trial'].includes(workout.type)) return 'HIGH';
    if (['tempo', 'long_run', 'speed', 'hill_repeats'].includes(workout.type)) return 'MEDIUM';
    return 'LOW';
  }
  
  private formatGarminPhase(block: TrainingBlock) {
    return {
      phaseId: `phase-${block.id || block.phase}`,
      phaseName: block.phase,
      startDate: block.startDate.toISOString(),
      endDate: block.endDate.toISOString(),
      durationInWeeks: block.weeks,
      objectives: block.focusAreas,
      description: `${block.phase} phase focusing on ${block.focusAreas.join(', ')}`,
      primaryFocus: block.focusAreas[0] || 'General Fitness'
    };
  }
  
  private generateGarminSettings(plan: TrainingPlan, options?: FormatOptions) {
    return {
      units: options?.units || 'metric',
      timezone: options?.timeZone || 'UTC',
      autoSync: true,
      notifications: {
        workoutReminders: true,
        phaseTransitions: true,
        restDayReminders: false
      },
      dataFields: [
        'TIME',
        'DISTANCE',
        'PACE',
        'HEART_RATE',
        'TRAINING_EFFECT'
      ],
      autoLap: {
        enabled: true,
        distance: 1000 // 1km auto laps
      }
    };
  }
}

/**
 * Enhanced JSON formatter for API integration
 */
class EnhancedJSONFormatter extends BaseFormatter {
  format: ExportFormat = 'json';
  mimeType = 'application/json';
  fileExtension = 'json';
  
  async formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult> {
    const enhancedData = this.generateEnhancedJSON(plan, options);
    const content = JSON.stringify(enhancedData, null, 2);
    const metadata = this.generateMetadata(plan, content);
    
    return {
      content,
      filename: `${plan.config.name || 'training-plan'}-api.json`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(content),
      metadata
    };
  }
  
  private generateEnhancedJSON(plan: TrainingPlan, options?: FormatOptions) {
    return {
      meta: {
        version: '1.0.0',
        generator: 'Training Plan Generator',
        exportDate: new Date().toISOString(),
        format: 'enhanced-json',
        apiVersion: '2023-01'
      },
      plan: {
        id: `plan-${Date.now()}`,
        name: plan.config.name || 'Training Plan',
        description: plan.config.goal,
        sport: 'running',
        difficulty: this.calculateAPIDifficulty(plan),
        duration: {
          weeks: Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 16,
          startDate: plan.config.startDate.toISOString(),
          endDate: plan.config.targetDate?.toISOString() || addDays(plan.config.startDate, 112).toISOString()
        },
        metrics: {
          totalWorkouts: plan.workouts.length,
          totalDistance: plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0),
          totalTSS: plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.tss || 0), 0),
          totalDuration: plan.workouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0),
          averageWeeklyDistance: this.calculateAverageWeeklyDistance(plan),
          peakWeeklyDistance: this.calculatePeakWeeklyDistance(plan),
          intensityDistribution: this.calculateIntensityDistribution(plan)
        },
        config: plan.config
      },
      phases: plan.blocks.map(block => ({
        id: `phase-${block.id || block.phase}`,
        name: block.phase,
        startDate: block.startDate.toISOString(),
        endDate: block.endDate.toISOString(),
        duration: {
          weeks: block.weeks,
          days: Math.ceil((block.endDate.getTime() - block.startDate.getTime()) / (24 * 60 * 60 * 1000))
        },
        objectives: block.focusAreas,
        description: `${block.phase} phase focusing on ${block.focusAreas.join(', ')}`,
        workoutCount: plan.workouts.filter(w => w.date >= block.startDate && w.date <= block.endDate).length
      })),
      workouts: plan.workouts.map(workout => this.formatAPIWorkout(workout, plan)),
      trainingZones: this.exportTrainingZones(),
      analytics: this.generateAnalytics(plan),
      integrations: {
        trainingPeaks: {
          compatible: true,
          tssCalculated: true,
          workoutCodes: true
        },
        strava: {
          compatible: true,
          activityDescriptions: true,
          segmentData: true
        },
        garmin: {
          compatible: true,
          structuredWorkouts: true,
          deviceSync: true
        }
      }
    };
  }
  
  private formatAPIWorkout(workout: PlannedWorkout, plan: TrainingPlan) {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    const template = Object.values(WORKOUT_TEMPLATES).find(t => t.type === workout.type);
    const block = plan.blocks.find(b => workout.date >= b.startDate && b.date <= b.endDate);
    
    return {
      id: workout.id,
      date: workout.date.toISOString(),
      name: workout.name,
      description: workout.description,
      type: workout.type,
      phase: block?.phase || 'Training',
      targets: {
        duration: workout.targetMetrics.duration,
        distance: workout.targetMetrics.distance || null,
        intensity: workout.targetMetrics.intensity,
        tss: workout.targetMetrics.tss,
        load: workout.targetMetrics.load
      },
      zones: {
        primary: {
          name: zone?.name || 'Easy',
          rpe: zone?.rpe || 2,
          heartRate: zone?.heartRateRange || null,
          pace: zone?.paceRange || null,
          description: zone?.description || 'Easy effort'
        }
      },
      structure: template ? this.formatWorkoutStructure(template) : null,
      adaptations: {
        primary: template?.adaptationTarget || 'General fitness',
        recoveryTime: workout.workout.recoveryTime || 24
      },
      instructions: this.generateAPIInstructions(workout, template),
      tags: this.generateAPITags(workout),
      difficulty: this.calculateWorkoutDifficulty(workout),
      equipment: this.getRequiredEquipment(workout)
    };
  }
  
  private formatWorkoutStructure(template: Workout) {
    return {
      segments: template.segments.map((segment: WorkoutSegment, index: number) => ({
        order: index + 1,
        duration: segment.duration,
        intensity: segment.intensity,
        zone: {
          name: segment.zone.name,
          rpe: segment.zone.rpe,
          description: segment.zone.description
        },
        description: segment.description,
        targets: {
          heartRate: segment.zone.heartRateRange || null,
          pace: segment.zone.paceRange || null
        }
      })),
      totalDuration: template.segments.reduce((sum: number, seg: WorkoutSegment) => sum + seg.duration, 0),
      estimatedTSS: template.estimatedTSS
    };
  }
  
  private generateAPIInstructions(workout: PlannedWorkout, template: Workout): string[] {
    const instructions = [];
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    
    if (zone) {
      instructions.push(`Maintain ${zone.name} effort (${zone.description})`);
      instructions.push(`Target RPE: ${zone.rpe}/10`);
    }
    
    if (template?.segments && template.segments.length > 1) {
      instructions.push('Follow structured workout segments');
      instructions.push('Allow adequate recovery between intervals');
    }
    
    if (workout.targetMetrics.duration >= 90) {
      instructions.push('Ensure proper hydration and fueling');
    }
    
    if (workout.targetMetrics.intensity >= 85) {
      instructions.push('Complete thorough warm-up before main set');
      instructions.push('Monitor heart rate to avoid overexertion');
    }
    
    return instructions;
  }
  
  private generateAPITags(workout: PlannedWorkout): string[] {
    const tags = [workout.type];
    
    if (workout.targetMetrics.intensity >= 85) tags.push('high-intensity');
    if (workout.targetMetrics.tss >= 100) tags.push('key-workout');
    if (workout.targetMetrics.duration >= 90) tags.push('long-session');
    if (workout.type.includes('race')) tags.push('race-specific');
    
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    if (zone) tags.push(zone.name.toLowerCase().replace(/\s+/g, '-'));
    
    return tags;
  }
  
  private calculateAPIDifficulty(plan: TrainingPlan): { level: string; score: number; factors: Record<string, number> } {
    const avgTSS = plan.workouts.reduce((sum, w) => sum + w.targetMetrics.tss, 0) / plan.workouts.length;
    const highIntensityPercent = plan.workouts.filter(w => w.targetMetrics.intensity >= 85).length / plan.workouts.length;
    const avgDuration = plan.workouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0) / plan.workouts.length;
    
    const score = Math.round(
      (avgTSS / 100 * 0.4) +
      (highIntensityPercent * 100 * 0.3) +
      (avgDuration / 120 * 0.3)
    );
    
    let level = 'Beginner';
    if (score >= 70) level = 'Advanced';
    else if (score >= 50) level = 'Intermediate';
    
    return {
      level,
      score,
      factors: {
        averageTSS: Math.round(avgTSS),
        highIntensityPercentage: Math.round(highIntensityPercent * 100),
        averageDuration: Math.round(avgDuration)
      }
    };
  }
  
  private calculateAverageWeeklyDistance(plan: TrainingPlan): number {
    const weeks = Math.ceil((plan.config.targetDate?.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 16;
    const totalDistance = plan.workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    return Math.round(totalDistance / weeks);
  }
  
  private calculatePeakWeeklyDistance(plan: TrainingPlan): number {
    const weeklyData = this.generateWeeklyData(plan);
    return Math.max(...weeklyData.map(week => week.distance));
  }
  
  private calculateIntensityDistribution(plan: TrainingPlan) {
    const zones = {
      easy: plan.workouts.filter(w => w.targetMetrics.intensity < 70).length,
      moderate: plan.workouts.filter(w => w.targetMetrics.intensity >= 70 && w.targetMetrics.intensity < 85).length,
      hard: plan.workouts.filter(w => w.targetMetrics.intensity >= 85).length
    };
    
    const total = plan.workouts.length;
    return {
      easy: Math.round((zones.easy / total) * 100),
      moderate: Math.round((zones.moderate / total) * 100),
      hard: Math.round((zones.hard / total) * 100)
    };
  }
  
  private generateWeeklyData(plan: TrainingPlan) {
    const weeks = new Map<number, { distance: number; tss: number; workouts: number }>();
    
    plan.workouts.forEach(workout => {
      const weekNumber = Math.floor(
        (workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      ) + 1;
      
      const current = weeks.get(weekNumber) || { distance: 0, tss: 0, workouts: 0 };
      weeks.set(weekNumber, {
        distance: current.distance + (workout.targetMetrics.distance || 0),
        tss: current.tss + workout.targetMetrics.tss,
        workouts: current.workouts + 1
      });
    });
    
    return Array.from(weeks.values());
  }
  
  private exportTrainingZones() {
    return Object.entries(TRAINING_ZONES).map(([key, zone]) => ({
      id: key,
      name: zone.name,
      rpe: zone.rpe,
      heartRateRange: zone.heartRateRange,
      paceRange: zone.paceRange,
      powerRange: zone.powerRange,
      description: zone.description,
      purpose: zone.purpose
    }));
  }
  
  private generateAnalytics(plan: TrainingPlan) {
    const weeklyData = this.generateWeeklyData(plan);
    const intensityDist = this.calculateIntensityDistribution(plan);
    
    return {
      trainingLoad: {
        weeklyProgression: weeklyData.map((week, index) => ({
          week: index + 1,
          tss: week.tss,
          distance: week.distance,
          workouts: week.workouts
        })),
        peakWeek: {
          week: weeklyData.findIndex(w => w.tss === Math.max(...weeklyData.map(w => w.tss))) + 1,
          tss: Math.max(...weeklyData.map(w => w.tss))
        },
        totalLoad: weeklyData.reduce((sum, week) => sum + week.tss, 0)
      },
      workoutDistribution: {
        byType: this.calculateWorkoutTypeDistribution(plan),
        byIntensity: intensityDist,
        byDuration: this.calculateDurationDistribution(plan)
      },
      phaseAnalysis: plan.blocks.map(block => {
        const blockWorkouts = plan.workouts.filter(w => 
          w.date >= block.startDate && w.date <= block.endDate
        );
        
        return {
          phase: block.phase,
          workoutCount: blockWorkouts.length,
          totalTSS: blockWorkouts.reduce((sum, w) => sum + w.targetMetrics.tss, 0),
          averageIntensity: blockWorkouts.reduce((sum, w) => sum + w.targetMetrics.intensity, 0) / blockWorkouts.length,
          focusAreas: block.focusAreas
        };
      })
    };
  }
  
  private calculateWorkoutTypeDistribution(plan: TrainingPlan) {
    const types: Record<string, number> = {};
    
    plan.workouts.forEach(workout => {
      types[workout.type] = (types[workout.type] || 0) + 1;
    });
    
    return Object.entries(types).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / plan.workouts.length) * 100)
    }));
  }
  
  private calculateDurationDistribution(plan: TrainingPlan) {
    const short = plan.workouts.filter(w => w.targetMetrics.duration < 45).length;
    const medium = plan.workouts.filter(w => w.targetMetrics.duration >= 45 && w.targetMetrics.duration < 90).length;
    const long = plan.workouts.filter(w => w.targetMetrics.duration >= 90).length;
    const total = plan.workouts.length;
    
    return {
      short: { count: short, percentage: Math.round((short / total) * 100) },
      medium: { count: medium, percentage: Math.round((medium / total) * 100) },
      long: { count: long, percentage: Math.round((long / total) * 100) }
    };
  }
  
  private calculateWorkoutDifficulty(workout: PlannedWorkout): number {
    const intensityFactor = workout.targetMetrics.intensity / 100;
    const durationFactor = Math.min(workout.targetMetrics.duration / 120, 1);
    const tssFactor = Math.min(workout.targetMetrics.tss / 150, 1);
    
    return Math.round((intensityFactor * 0.4 + durationFactor * 0.3 + tssFactor * 0.3) * 10);
  }
  
  private getRequiredEquipment(workout: PlannedWorkout): string[] {
    const equipment = ['running-shoes'];
    
    if (workout.type === 'speed') equipment.push('track-access');
    if (workout.type === 'hill_repeats') equipment.push('hilly-terrain');
    if (workout.type === 'cross_training') equipment.push('cross-training-equipment');
    if (workout.type === 'strength') equipment.push('gym-access');
    if (workout.targetMetrics.intensity >= 80) equipment.push('heart-rate-monitor');
    if (workout.targetMetrics.duration >= 90) equipment.push('hydration-system');
    
    return equipment;
  }
}

/**
 * TCX formatter for Garmin/training device compatibility
 */
class TCXFormatter extends BaseFormatter {
  format: ExportFormat = 'tcx';
  mimeType = 'application/vnd.garmin.tcx+xml';
  fileExtension = 'tcx';
  
  async formatPlan(plan: TrainingPlan, options?: FormatOptions): Promise<ExportResult> {
    const tcxContent = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">',
      '  <Folders>',
      '    <Workouts>',
      '      <Folder Name="Training Plan">',
      ...plan.workouts.map(workout => this.generateWorkoutXML(workout)),
      '      </Folder>',
      '    </Workouts>',
      '  </Folders>',
      '</TrainingCenterDatabase>'
    ].join('\n');
    
    const metadata = this.generateMetadata(plan, tcxContent);
    
    return {
      content: tcxContent,
      filename: `${plan.config.name || 'training-plan'}.tcx`,
      mimeType: this.mimeType,
      size: Buffer.byteLength(tcxContent),
      metadata
    };
  }
  
  private generateWorkoutXML(workout: PlannedWorkout): string {
    const zone = TRAINING_ZONES[workout.workout.primaryZone?.name || 'EASY'];
    const paceRange = zone ? this.calculatePace(zone, 5.0) : { min: '5:00', max: '5:00' };
    
    return [
      `    <Workout Name="${workout.name}" Sport="Running">`,
      `      <Step xsi:type="Step_t">`,
      `        <StepId>1</StepId>`,
      `        <Duration xsi:type="Time_t">`,
      `          <Seconds>${workout.targetMetrics.duration * 60}</Seconds>`,
      `        </Duration>`,
      `        <Intensity>Active</Intensity>`,
      `        <Target xsi:type="Zone_t">`,
      `          <Low>${Math.round(workout.targetMetrics.intensity * 0.95)}</Low>`,
      `          <High>${Math.round(workout.targetMetrics.intensity * 1.05)}</High>`,
      `        </Target>`,
      `      </Step>`,
      `    </Workout>`
    ].join('\n');
  }
}

// Export formatter classes for direct use
export { 
  PDFFormatter,
  iCalFormatter,
  CSVFormatter,
  TrainingPeaksFormatter,
  StravaFormatter,
  GarminFormatter,
  EnhancedJSONFormatter,
  TCXFormatter,
  JSONFormatter
};

/**
 * Factory function to create export manager
 */
export function createExportManager(): ExportManager {
  return new MultiFormatExporter();
}

/**
 * Utility functions for export operations
 */
export const ExportUtils = {
  /**
   * Generate filename with timestamp
   */
  generateFilename(baseName: string, format: ExportFormat): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    const extension = this.getFileExtension(format);
    const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-');
    return `${safeName}-${timestamp}.${extension}`;
  },
  
  /**
   * Get file extension for format
   */
  getFileExtension(format: ExportFormat): string {
    const extensions: Record<ExportFormat, string> = {
      json: 'json',
      csv: 'csv',
      ical: 'ics',
      pdf: 'pdf',
      tcx: 'tcx'
    };
    return extensions[format] || 'txt';
  },
  
  /**
   * Get MIME type for format
   */
  getMimeType(format: ExportFormat): string {
    const mimeTypes: Record<ExportFormat, string> = {
      json: 'application/json',
      csv: 'text/csv',
      ical: 'text/calendar',
      pdf: 'application/pdf',
      tcx: 'application/vnd.garmin.tcx+xml'
    };
    return mimeTypes[format] || 'text/plain';
  }
};