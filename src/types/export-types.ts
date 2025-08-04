/**
 * Export Type Definitions
 *
 * Format-specific interfaces for PDF, iCal, CSV, and JSON export options.
 * This module provides type-safe alternatives to the generic FormatOptions
 * interface, enabling format-specific properties and better type checking.
 *
 * @fileoverview Export format type definitions for type-safe export operations
 */

import { LoggableOptions } from "./base-types";
import { ExportFormat } from "../types";

/**
 * Base interface for all export format options
 * 
 * Provides common properties shared across all export formats while extending
 * LoggableOptions to enable optional logging configuration for all export operations.
 * This design ensures consistent logging behavior across all export formats 
 * (PDF, iCal, CSV, JSON) while maintaining complete backward compatibility.
 * 
 * **Key Benefits:**
 * - **Unified Logging**: All export formats automatically inherit logging capabilities
 * - **Format-Agnostic**: Same logging configuration works across PDF, iCal, CSV, and JSON
 * - **Zero Breaking Changes**: Existing export code continues to work unchanged
 * - **Environment-Aware**: Easy to configure different logging for dev/production
 *
 * @template TCustomFields Type-constrained custom fields for format extensions
 * 
 * @example Basic Export Without Logging (Backward Compatible)
 * ```typescript
 * // Existing code continues to work unchanged
 * const options: BaseExportOptions = {
 *   includePaces: true,
 *   units: 'metric'
 * };
 * 
 * const exporter = new MultiFormatExporter();
 * const result = await exporter.exportPlan(trainingPlan, 'pdf', options);
 * ```
 * 
 * @example Enhanced Export with Logging Configuration
 * ```typescript
 * import { LOGGING_PRESETS } from '../types/logging';
 * 
 * // Environment-specific logging
 * const devOptions: BaseExportOptions = {
 *   includePaces: true,
 *   units: 'metric',
 *   logging: LOGGING_PRESETS.development // Full debug output
 * };
 * 
 * const prodOptions: BaseExportOptions = {
 *   includePaces: true,
 *   units: 'metric',
 *   logging: LOGGING_PRESETS.production // Silent logging
 * };
 * 
 * // Custom logging configuration
 * const customOptions: BaseExportOptions = {
 *   includePaces: true,
 *   units: 'metric',
 *   logging: { level: 'info', backend: 'console' }
 * };
 * ```
 * 
 * @example Format-Specific Options with Logging
 * ```typescript
 * // PDF export with logging
 * const pdfOptions: PDFOptions = {
 *   pageSize: 'A4',
 *   orientation: 'portrait',
 *   margins: { top: 20, right: 20, bottom: 20, left: 20 },
 *   includeCharts: true,
 *   logging: { level: 'debug', backend: 'console' }
 * };
 * 
 * // iCal export with logging
 * const icalOptions: iCalOptions = {
 *   calendarName: 'Training Schedule',
 *   defaultEventDuration: 60,
 *   includeAlarms: true,
 *   logging: { level: 'info', backend: 'console' }
 * };
 * 
 * // All format-specific options inherit logging capability
 * const csvOptions: CSVOptions = {
 *   delimiter: ',',
 *   includeHeaders: true,
 *   dateFormat: 'ISO',
 *   logging: LOGGING_PRESETS.development
 * };
 * ```
 * 
 * @example Migration from Manual Error Handling
 * ```typescript
 * // Before: Manual console.error statements
 * function exportTrainingPlan(plan: TrainingPlan, format: ExportFormat) {
 *   try {
 *     // ... export logic
 *     console.error('Export failed:', error); // Manual logging
 *   } catch (error) {
 *     console.error('Export failed:', error);
 *   }
 * }
 * 
 * // After: Configurable logging through options
 * function exportTrainingPlan(
 *   plan: TrainingPlan, 
 *   format: ExportFormat, 
 *   options: BaseExportOptions
 * ) {
 *   const logger = getLoggerFromOptions(options);
 *   
 *   try {
 *     // Export operations automatically use configured logger
 *     const result = TypeSafeErrorHandler.handleErrorWithOptions(
 *       () => performExport(plan, format, options),
 *       'export-operation',
 *       options
 *     );
 *     return result;
 *   } catch (error) {
 *     // Logger configuration from options applied automatically
 *     logger.error('Export failed', { format, error: error.message });
 *     throw error;
 *   }
 * }
 * ```
 * 
 * @example Error Handling Integration
 * ```typescript
 * import { TypeSafeErrorHandler } from '../types/error-types';
 * 
 * const exportOptions: BaseExportOptions = {
 *   includePaces: true,
 *   logging: { level: 'error', backend: 'console' }
 * };
 * 
 * // Error handlers automatically use logging configuration from options
 * const result = TypeSafeErrorHandler.handleValidationErrorWithOptions(
 *   validationError,
 *   'export-validation',
 *   exportOptions // Logging config used automatically
 * );
 * 
 * if (!result.success) {
 *   // Error already logged according to options.logging configuration
 *   return { error: result.error };
 * }
 * ```
 * 
 * @see {@link LoggableOptions} For the base logging capability interface
 * @see {@link getLoggerFromOptions} For extracting loggers from export options
 * @see {@link LOGGING_PRESETS} For common environment-specific logging configurations
 * @see {@link TypeSafeErrorHandler} For error handling with automatic logging configuration
 */
export interface BaseExportOptions<
  TCustomFields extends Record<string, unknown> = Record<string, unknown>,
> extends LoggableOptions<TCustomFields> {
  /** Include workout pace information in export */
  includePaces?: boolean;
  /** Include heart rate zone information */
  includeHeartRates?: boolean;
  /** Include power zone information */
  includePower?: boolean;
  /** Target timezone for date/time formatting */
  timeZone?: string;
  /** Unit system for measurements */
  units?: "metric" | "imperial";
  /** Language for text content */
  language?: string;
  /** Detail level for exported content */
  detailLevel?: "basic" | "standard" | "comprehensive";

  // Methodology-specific options
  /** Include training philosophy principles */
  includePhilosophyPrinciples?: boolean;
  /** Include research citations and references */
  includeResearchCitations?: boolean;
  /** Include coach biography information */
  includeCoachBiography?: boolean;
  /** Include methodology comparison charts */
  includeMethodologyComparison?: boolean;
  /** Include training zone explanations */
  includeTrainingZoneExplanations?: boolean;
  /** Include workout rationale and reasoning */
  includeWorkoutRationale?: boolean;
  /** Enable enhanced methodology-aware export features */
  enhancedExport?: boolean;
}

/**
 * PDF export format options
 * Provides PDF-specific configuration for layout, styling, and content organization
 */
export interface PDFOptions
  extends BaseExportOptions<{
    /** Custom watermark text for PDF pages */
    watermark?: string;
    /** PDF metadata for document properties */
    pdfMetadata?: {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string[];
    };
  }> {
  /** Page size for PDF output */
  pageSize: "A4" | "letter" | "legal" | "A3";
  /** Page orientation */
  orientation: "portrait" | "landscape";
  /** Page margins in millimeters */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Include visual charts and graphs */
  includeCharts?: boolean;
  /** Chart types to include */
  chartTypes?: Array<
    "weeklyVolume" | "intensityDistribution" | "periodization" | "trainingLoad"
  >;
  /** Color scheme for charts */
  colorScheme?: "default" | "monochrome" | "highContrast" | "custom";
  /** Custom color palette (when colorScheme is 'custom') */
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  /** Font settings */
  fonts?: {
    body: string;
    heading: string;
    code: string;
    size: number;
  };
  /** Include table of contents */
  includeTableOfContents?: boolean;
  /** Include page numbers */
  includePageNumbers?: boolean;
  /** Header/footer configuration */
  headerFooter?: {
    includeHeader: boolean;
    includeFooter: boolean;
    headerText?: string;
    footerText?: string;
  };
  /** PDF security settings */
  security?: {
    ownerPassword?: string;
    userPassword?: string;
    permissions?: {
      printing: boolean;
      modifying: boolean;
      copying: boolean;
      annotating: boolean;
    };
  };
}

/**
 * iCalendar export format options
 * Provides iCal-specific configuration for calendar integration and event formatting
 */
export interface iCalOptions
  extends BaseExportOptions<{
    /** Custom event categories for calendar organization */
    eventCategories?: string[];
    /** Calendar color coding system */
    colorCoding?: Record<string, string>;
  }> {
  /** Calendar name for the exported calendar */
  calendarName: string;
  /** Calendar description */
  calendarDescription?: string;
  /** Event duration for workouts without specific duration */
  defaultEventDuration: number; // minutes
  /** Include location information in events */
  includeLocation?: boolean;
  /** Default location for workouts */
  defaultLocation?: string;
  /** Include alarm/reminder settings */
  includeAlarms?: boolean;
  /** Alarm settings */
  alarmSettings?: {
    /** Minutes before event to trigger alarm */
    minutesBefore: number;
    /** Alarm action type */
    action: "DISPLAY" | "EMAIL" | "AUDIO";
    /** Custom alarm description */
    description?: string;
  };
  /** Include workout notes as event descriptions */
  includeWorkoutNotes?: boolean;
  /** Timezone identifier for calendar events */
  calendarTimezone?: string;
  /** Include training stress score in event titles */
  includeTSSInTitle?: boolean;
  /** Event title format template */
  eventTitleFormat?: string; // e.g., "{type} - {duration} - TSS: {tss}"
  /** Include recurring event rules for repeated workouts */
  includeRecurrence?: boolean;
  /** Organizer information */
  organizer?: {
    name: string;
    email: string;
  };
  /** Attendee list for shared calendars */
  attendees?: Array<{
    name: string;
    email: string;
    role: "REQ-PARTICIPANT" | "OPT-PARTICIPANT" | "NON-PARTICIPANT";
  }>;
}

/**
 * CSV export format options
 * Provides CSV-specific configuration for data formatting and column organization
 */
export interface CSVOptions
  extends BaseExportOptions<{
    /** Custom column mappings for non-standard fields */
    columnMappings?: Record<string, string>;
    /** Data transformation functions for custom formatting */
    dataTransformers?: Record<string, (value: unknown) => string>;
  }> {
  /** CSV delimiter character */
  delimiter: "," | ";" | "\t" | "|";
  /** Quote character for text fields */
  quoteChar: '"' | "'";
  /** Include header row with column names */
  includeHeaders: boolean;
  /** Columns to include in export */
  columns?: Array<
    | "date"
    | "workoutType"
    | "duration"
    | "distance"
    | "pace"
    | "heartRate"
    | "power"
    | "tss"
    | "description"
    | "phase"
    | "week"
    | "methodology"
    | "workoutRationale"
  >;
  /** Custom column order */
  columnOrder?: string[];
  /** Date format for date columns */
  dateFormat: "ISO" | "US" | "EU" | "custom";
  /** Custom date format string (when dateFormat is 'custom') */
  customDateFormat?: string;
  /** Number format for numeric values */
  numberFormat?: {
    decimalPlaces: number;
    thousandsSeparator: "," | "." | " " | "";
    decimalSeparator: "." | ",";
  };
  /** Text encoding for file output */
  encoding: "utf-8" | "utf-16" | "iso-8859-1" | "windows-1252";
  /** Include row numbers */
  includeRowNumbers?: boolean;
  /** Include summary statistics row */
  includeSummary?: boolean;
  /** Group workouts by week */
  groupByWeek?: boolean;
  /** Include empty rows between groups */
  includeGroupSeparators?: boolean;
}

/**
 * JSON export format options
 * Provides JSON-specific configuration for data structure and formatting
 */
export interface JSONOptions
  extends BaseExportOptions<{
    /** Custom schema validation rules */
    schemaValidation?: {
      strict: boolean;
      additionalProperties: boolean;
      required: string[];
    };
    /** Data transformation hooks */
    transformHooks?: {
      preExport?: (data: unknown) => unknown;
      postExport?: (json: string) => string;
    };
  }> {
  /** JSON formatting style */
  formatting: "compact" | "pretty" | "minified";
  /** Indentation for pretty formatting */
  indentation?: number | string;
  /** Include schema reference in output */
  includeSchema?: boolean;
  /** Schema version identifier */
  schemaVersion?: string;
  /** Include metadata in output */
  includeMetadata: boolean;
  /** Metadata fields to include */
  metadataFields?: Array<
    | "exportDate"
    | "generatorVersion"
    | "planStatistics"
    | "methodologyInfo"
    | "validationResults"
  >;
  /** Date serialization format */
  dateFormat: "iso" | "timestamp" | "custom" | "epoch";
  /** Custom date serialization function */
  customDateSerializer?: (date: Date) => string | number;
  /** Include type information for complex objects */
  includeTypeHints?: boolean;
  /** Array format preference */
  arrayFormat: "nested" | "flat" | "indexed";
  /** Null value handling */
  nullHandling: "include" | "omit" | "emptyString";
  /** Include validation checksums */
  includeChecksums?: boolean;
  /** Compression settings */
  compression?: {
    enabled: boolean;
    algorithm: "gzip" | "deflate" | "brotli";
    level?: number;
  };
  /** Include source code references for debugging */
  includeDebugInfo?: boolean;
  /** Custom JSON serializer for specific types */
  customSerializers?: Record<string, (value: unknown) => unknown>;
}

/**
 * Export format option type map
 * Maps export format types to their corresponding option interfaces
 * Enables type-safe format-specific option handling
 */
export interface ExportFormatOptionsMap {
  pdf: PDFOptions;
  ical: iCalOptions;
  csv: CSVOptions;
  json: JSONOptions;
}

/**
 * Utility type for getting options type by format
 * Enables dynamic typing based on export format
 *
 * @template T The export format type
 * @example
 * ```typescript
 * function getDefaultOptions<T extends ExportFormat>(format: T): OptionsForFormat<T> {
 *   // Returns the appropriate options type for the format
 * }
 * ```
 */
export type OptionsForFormat<T extends ExportFormat> =
  T extends keyof ExportFormatOptionsMap
    ? ExportFormatOptionsMap[T]
    : BaseExportOptions;

/**
 * Union type of all format-specific option types
 * Useful for functions that accept any format options
 */
export type AnyExportOptions =
  | PDFOptions
  | iCalOptions
  | CSVOptions
  | JSONOptions;

/**
 * Type guard to check if options match a specific format
 * Provides runtime type checking for format-specific options
 *
 * @param options The options to check
 * @param format The expected format
 * @returns Type predicate indicating if options match the format
 * @example
 * ```typescript
 * if (isOptionsForFormat(options, 'pdf')) {
 *   // options is now typed as PDFOptions
 *   console.log(options.pageSize);
 * }
 * ```
 */
export function isOptionsForFormat<T extends ExportFormat>(
  options: unknown,
  format: T,
): options is OptionsForFormat<T> {
  if (!options || typeof options !== "object") {
    return false;
  }

  // Basic validation - could be enhanced with more specific checks
  return true;
}

/**
 * Default option values for each export format
 * Provides sensible defaults to reduce configuration overhead
 */
export const DEFAULT_EXPORT_OPTIONS: Record<
  ExportFormat,
  Partial<AnyExportOptions>
> = {
  pdf: {
    pageSize: "A4",
    orientation: "portrait",
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    includeCharts: true,
    chartTypes: ["weeklyVolume", "intensityDistribution"],
    colorScheme: "default",
    includeTableOfContents: true,
    includePageNumbers: true,
    detailLevel: "standard",
    units: "metric",
    includePaces: true,
    includeHeartRates: true,
    includePower: false,
  } as Partial<PDFOptions>,

  ical: {
    calendarName: "Training Plan",
    defaultEventDuration: 60,
    includeLocation: false,
    includeAlarms: true,
    alarmSettings: {
      minutesBefore: 30,
      action: "DISPLAY",
    },
    includeWorkoutNotes: true,
    includeTSSInTitle: true,
    eventTitleFormat: "{type} - {duration}min",
    detailLevel: "standard",
    units: "metric",
    includePaces: true,
    includeHeartRates: true,
  } as Partial<iCalOptions>,

  csv: {
    delimiter: ",",
    quoteChar: '"',
    includeHeaders: true,
    dateFormat: "ISO",
    numberFormat: {
      decimalPlaces: 2,
      thousandsSeparator: "",
      decimalSeparator: ".",
    },
    encoding: "utf-8",
    includeSummary: false,
    groupByWeek: false,
    detailLevel: "standard",
    units: "metric",
    includePaces: true,
    includeHeartRates: true,
  } as Partial<CSVOptions>,

  json: {
    formatting: "pretty",
    indentation: 2,
    includeSchema: false,
    includeMetadata: true,
    metadataFields: ["exportDate", "generatorVersion", "planStatistics"],
    dateFormat: "iso",
    arrayFormat: "nested",
    nullHandling: "omit",
    includeChecksums: false,
    detailLevel: "comprehensive",
    units: "metric",
    includePaces: true,
    includeHeartRates: true,
    includePower: true,
  } as Partial<JSONOptions>,
};

/**
 * Factory function to create format-specific options with defaults
 * Merges user-provided options with sensible defaults
 *
 * @template T The export format type
 * @param format The export format
 * @param userOptions User-provided options (optional)
 * @returns Merged options with defaults applied
 * @example
 * ```typescript
 * const pdfOptions = createExportOptions('pdf', { pageSize: 'letter' });
 * // Result includes default margins, colors, etc. with custom page size
 * ```
 */
export function createExportOptions<T extends ExportFormat>(
  format: T,
  userOptions?: Partial<OptionsForFormat<T>>,
): OptionsForFormat<T> {
  const defaults = DEFAULT_EXPORT_OPTIONS[format] as Partial<
    OptionsForFormat<T>
  >;
  return { ...defaults, ...userOptions } as OptionsForFormat<T>;
}

/**
 * Validation functions for format-specific options
 * Provides runtime validation for each export format's options
 */
export const EXPORT_OPTION_VALIDATORS = {
  pdf: (options: PDFOptions): string[] => {
    const errors: string[] = [];

    if (!["A4", "letter", "legal", "A3"].includes(options.pageSize)) {
      errors.push("Invalid page size for PDF export");
    }

    if (options.margins) {
      const { top, right, bottom, left } = options.margins;
      if (
        [top, right, bottom, left].some((margin) => margin < 0 || margin > 100)
      ) {
        errors.push("PDF margins must be between 0 and 100mm");
      }
    }

    if (options.customColors && options.colorScheme !== "custom") {
      errors.push("Custom colors can only be used with custom color scheme");
    }

    return errors;
  },

  ical: (options: iCalOptions): string[] => {
    const errors: string[] = [];

    if (!options.calendarName || options.calendarName.trim().length === 0) {
      errors.push("Calendar name is required for iCal export");
    }

    if (
      options.defaultEventDuration <= 0 ||
      options.defaultEventDuration > 1440
    ) {
      errors.push("Default event duration must be between 1 and 1440 minutes");
    }

    if (options.alarmSettings && options.alarmSettings.minutesBefore < 0) {
      errors.push("Alarm minutes before must be non-negative");
    }

    return errors;
  },

  csv: (options: CSVOptions): string[] => {
    const errors: string[] = [];

    if (
      !options.delimiter ||
      ![",", ";", "\t", "|"].includes(options.delimiter)
    ) {
      errors.push("Invalid CSV delimiter");
    }

    if (options.numberFormat && options.numberFormat.decimalPlaces < 0) {
      errors.push("Decimal places must be non-negative");
    }

    if (options.customDateFormat && options.dateFormat !== "custom") {
      errors.push(
        "Custom date format can only be used with custom date format setting",
      );
    }

    return errors;
  },

  json: (options: JSONOptions): string[] => {
    const errors: string[] = [];

    if (!["compact", "pretty", "minified"].includes(options.formatting)) {
      errors.push("Invalid JSON formatting option");
    }

    if (options.formatting === "pretty" && options.indentation !== undefined) {
      if (typeof options.indentation === "number" && options.indentation < 0) {
        errors.push("JSON indentation must be non-negative");
      }
    }

    if (
      options.compression?.enabled &&
      options.compression.level !== undefined
    ) {
      if (options.compression.level < 1 || options.compression.level > 9) {
        errors.push("Compression level must be between 1 and 9");
      }
    }

    return errors;
  },
} as const;

/**
 * Validate export options for a specific format
 * Provides runtime validation with detailed error messages
 *
 * @param format The export format
 * @param options The options to validate
 * @returns Array of validation error messages (empty if valid)
 * @example
 * ```typescript
 * const errors = validateExportOptions('pdf', pdfOptions);
 * if (errors.length > 0) {
 *   throw new Error(`Invalid PDF options: ${errors.join(', ')}`);
 * }
 * ```
 */
export function validateExportOptions<T extends ExportFormat>(
  format: T,
  options: OptionsForFormat<T>,
): string[] {
  const validator = EXPORT_OPTION_VALIDATORS[format] as (
    options: OptionsForFormat<T>,
  ) => string[];
  return validator(options);
}
