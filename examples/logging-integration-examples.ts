/**
 * Logging Integration Examples
 * 
 * Comprehensive examples demonstrating how to use the configurable logging system
 * throughout the Training Plan Generator API. Shows integration patterns, best
 * practices, and migration strategies for different scenarios.
 */

import { AdvancedTrainingPlanGenerator } from '../src/advanced-generator';
import { MultiFormatExporter } from '../src/export';
import { TypeSafeErrorHandler } from '../src/types/error-types';
import {
  getLoggerFromOptions,
  withLogging,
  LOGGING_PRESETS,
  createLogger,
  type Logger,
  type LoggingConfig,
} from '../src/types/logging';
import type {
  AdvancedPlanConfig,
  BaseExportOptions,
  LoggableOptions,
} from '../src/types';

// ============================================================================
// Example 1: LoggableOptions with Custom Options
// ============================================================================

/**
 * Demonstrates LoggableOptions usage with custom configuration fields
 * Shows how logging integrates with existing type-safe configuration patterns
 */
async function customOptionsWithLogging() {
  console.log('📝 Example 1: LoggableOptions with Custom Options\n');

  // Custom options extending LoggableOptions with domain-specific fields
  interface CustomProcessingOptions extends LoggableOptions {
    batchSize?: number;
    retryAttempts?: number;
    timeout?: number;
    validateInput?: boolean;
  }

  // Function accepting LoggableOptions with custom fields
  function processTrainingData(
    data: unknown[],
    options?: CustomProcessingOptions
  ): { processed: number; errors: number } {
    // Extract logger from options (or get default if not provided)
    const logger = getLoggerFromOptions(options);
    
    // Use default values for custom options
    const batchSize = options?.batchSize ?? 100;
    const retryAttempts = options?.retryAttempts ?? 3;
    const timeout = options?.timeout ?? 5000;
    const validateInput = options?.validateInput ?? true;

    logger.info('Starting data processing', { 
      totalItems: data.length,
      batchSize,
      retryAttempts,
      timeout,
      validateInput
    });

    let processed = 0;
    let errors = 0;

    // Simulate batch processing with logging
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      logger.debug(`Processing batch ${Math.floor(i / batchSize) + 1}`, {
        batchStart: i,
        batchSize: batch.length
      });

      try {
        // Simulate processing
        if (validateInput && batch.some(item => !item)) {
          throw new Error('Invalid data in batch');
        }
        
        processed += batch.length;
        logger.debug('Batch processed successfully', { 
          processed: batch.length 
        });
      } catch (error) {
        errors += batch.length;
        logger.warn('Batch processing failed', {
          batchIndex: Math.floor(i / batchSize),
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.info('Data processing completed', { processed, errors });
    return { processed, errors };
  }

  // Example usage with different logging configurations
  const sampleData = new Array(250).fill(null).map((_, i) => ({ id: i, value: i }));

  console.log('🔧 Processing with development logging (full output):');
  const devResult = processTrainingData(sampleData, {
    batchSize: 50,
    retryAttempts: 2,
    timeout: 3000,
    validateInput: true,
    logging: LOGGING_PRESETS.development // Full debug output
  });
  console.log(`Result: ${devResult.processed} processed, ${devResult.errors} errors\n`);

  console.log('🔧 Processing with production logging (silent):');
  const prodResult = processTrainingData(sampleData, {
    batchSize: 100,
    retryAttempts: 1,
    timeout: 5000,
    validateInput: false,
    logging: LOGGING_PRESETS.production // Silent logging
  });
  console.log(`Result: ${prodResult.processed} processed, ${prodResult.errors} errors\n`);

  console.log('🔧 Processing with custom logging configuration:');
  const customResult = processTrainingData(sampleData, {
    batchSize: 75,
    logging: {
      level: 'info', // Only info and above
      backend: 'console'
    }
  });
  console.log(`Result: ${customResult.processed} processed, ${customResult.errors} errors\n`);

  console.log('✅ Example 1 complete: LoggableOptions with custom fields\n');
}

// ============================================================================
// Example 2: Export Operations with Logging Configuration
// ============================================================================

/**
 * Demonstrates export system integration with configurable logging
 * Shows how BaseExportOptions automatically inherits logging capabilities
 */
async function exportWithLoggingConfiguration() {
  console.log('📤 Example 2: Export Operations with Logging Configuration\n');

  // Create a sample training plan for export examples
  const planConfig: AdvancedPlanConfig = {
    name: 'Logging Example Plan',
    description: 'Sample plan for logging integration demo',
    goal: 'HALF_MARATHON',
    startDate: new Date(),
    targetDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000), // 8 weeks
    currentFitness: {
      vdot: 45,
      criticalSpeed: 12.5,
      weeklyMileage: 30,
      longestRecentRun: 15,
      trainingAge: 2,
      injuryHistory: [],
      recoveryRate: 75,
      overallScore: 65
    },
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6],
      preferredIntensity: 'moderate',
      crossTraining: false,
      strengthTraining: true,
      timeConstraints: {
        1: 60, 2: 45, 3: 60, 4: 45, 5: 90, 6: 120
      }
    },
    methodology: 'daniels',
    intensityDistribution: { easy: 0.8, moderate: 0.15, hard: 0.05 },
    periodization: 'linear',
    targetRaces: [{
      name: 'Example Half Marathon',
      date: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000),
      distance: 21.1,
      priority: 'A',
      location: 'Example City',
      terrain: 'road',
      conditions: { temperature: 15, humidity: 60, windSpeed: 5, elevation: 100 }
    }],
    adaptationEnabled: true,
    progressTracking: true,
    exportFormats: ['pdf', 'ical', 'csv', 'json']
  };

  console.log('🔄 Generating training plan for export examples...');
  const generator = new AdvancedTrainingPlanGenerator(planConfig);
  const plan = await generator.generateAdvancedPlan();
  console.log(`✅ Plan generated: ${plan.summary.totalWorkouts} workouts\n`);

  const exporter = new MultiFormatExporter();

  // Export with development logging (verbose output)
  console.log('📊 Export with development logging (verbose):');
  try {
    const pdfOptions: BaseExportOptions = {
      includePaces: true,
      includeHeartRates: true,
      units: 'metric',
      logging: LOGGING_PRESETS.development // Full logging
    };

    const pdfResult = await exporter.exportPlan(plan, 'pdf', pdfOptions);
    console.log(`✅ PDF exported: ${pdfResult.filename} (${Math.round(pdfResult.size / 1024)} KB)\n`);
  } catch (error) {
    console.error('❌ PDF export failed:', error instanceof Error ? error.message : String(error));
  }

  // Export with production logging (silent)
  console.log('📊 Export with production logging (silent):');
  try {
    const icalOptions: BaseExportOptions = {
      timeZone: 'America/New_York',
      includeNotes: true,
      logging: LOGGING_PRESETS.production // Silent logging
    };

    const icalResult = await exporter.exportPlan(plan, 'ical', icalOptions);
    console.log(`✅ iCal exported: ${icalResult.filename} (${icalResult.metadata?.totalWorkouts || 'unknown'} events)\n`);
  } catch (error) {
    console.error('❌ iCal export failed:', error instanceof Error ? error.message : String(error));
  }

  // Export with custom logging level
  console.log('📊 Export with custom logging (warnings and errors only):');
  try {
    const csvOptions: BaseExportOptions = {
      units: 'imperial',
      includeMetadata: true,
      logging: {
        level: 'warn', // Only warnings and errors
        backend: 'console'
      }
    };

    const csvResult = await exporter.exportPlan(plan, 'csv', csvOptions);
    console.log(`✅ CSV exported: ${csvResult.filename} (${Math.round(csvResult.size / 1024)} KB)\n`);
  } catch (error) {
    console.error('❌ CSV export failed:', error instanceof Error ? error.message : String(error));
  }

  // Export with no logging configuration (uses defaults)
  console.log('📊 Export with default logging (no configuration provided):');
  try {
    const jsonOptions: BaseExportOptions = {
      prettify: true,
      includeMetadata: true
      // No logging configuration - uses defaultLogger
    };

    const jsonResult = await exporter.exportPlan(plan, 'json', jsonOptions);
    console.log(`✅ JSON exported: ${jsonResult.filename} (${Math.round(jsonResult.size / 1024)} KB)\n`);
  } catch (error) {
    console.error('❌ JSON export failed:', error instanceof Error ? error.message : String(error));
  }

  console.log('✅ Example 2 complete: Export operations with logging configuration\n');
}

// ============================================================================
// Example 3: Error Handling with Options-Based Logging
// ============================================================================

/**
 * Demonstrates error handling with configurable logging through options
 * Shows TypeSafeErrorHandler integration with LoggableOptions
 */
async function errorHandlingWithOptionsLogging() {
  console.log('🚨 Example 3: Error Handling with Options-Based Logging\n');

  // Mock validation function that might throw different types of errors
  function validateTrainingConfig(config: unknown, options?: LoggableOptions): { isValid: boolean; data?: any } {
    const logger = getLoggerFromOptions(options);
    
    logger.info('Starting training configuration validation');

    try {
      // Simulate various validation scenarios
      if (!config) {
        throw new Error('Configuration is required');
      }

      if (typeof config !== 'object') {
        throw new Error('Configuration must be an object');
      }

      const configObj = config as Record<string, unknown>;
      
      // Simulate complex validation
      if (!configObj.goal) {
        throw new Error('Training goal is required');
      }

      if (!configObj.startDate) {
        throw new Error('Start date is required');
      }

      logger.info('Configuration validation passed');
      return { isValid: true, data: configObj };
    } catch (error) {
      // Use options-aware error handling
      const result = TypeSafeErrorHandler.handleErrorWithOptions(
        () => {
          throw error; // Re-throw to trigger error handling
        },
        'training-config-validation',
        options // Pass options for logging configuration
      );

      if (result.success) {
        return { isValid: true, data: result.data };
      } else {
        logger.error('Configuration validation failed', { 
          error: result.error 
        });
        return { isValid: false };
      }
    }
  }

  // Example 1: Development environment - full error logging
  console.log('🔧 Error handling with development logging (verbose):');
  const devResult1 = validateTrainingConfig(null, {
    logging: LOGGING_PRESETS.development
  });
  console.log(`Validation result: ${devResult1.isValid ? 'Valid' : 'Invalid'}\n`);

  const devResult2 = validateTrainingConfig({
    goal: 'MARATHON',
    startDate: new Date(),
    targetDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000)
  }, {
    logging: LOGGING_PRESETS.development
  });
  console.log(`Validation result: ${devResult2.isValid ? 'Valid' : 'Invalid'}\n`);

  // Example 2: Production environment - silent error logging
  console.log('🔧 Error handling with production logging (silent):');
  const prodResult = validateTrainingConfig('invalid-config', {
    logging: LOGGING_PRESETS.production
  });
  console.log(`Validation result: ${prodResult.isValid ? 'Valid' : 'Invalid'}\n`);

  // Example 3: Custom error logging level
  console.log('🔧 Error handling with custom logging (errors only):');
  const customResult = validateTrainingConfig({
    // Missing required fields
    description: 'Test plan'
  }, {
    logging: {
      level: 'error', // Only log errors
      backend: 'console'
    }
  });
  console.log(`Validation result: ${customResult.isValid ? 'Valid' : 'Invalid'}\n`);

  // Example 4: No logging configuration (uses defaults)
  console.log('🔧 Error handling with default logging:');
  const defaultResult = validateTrainingConfig({
    goal: 'FIVE_K',
    startDate: new Date()
    // Valid configuration
  });
  console.log(`Validation result: ${defaultResult.isValid ? 'Valid' : 'Invalid'}\n`);

  console.log('✅ Example 3 complete: Error handling with options-based logging\n');
}

// ============================================================================
// Example 4: Logging Presets Usage
// ============================================================================

/**
 * Demonstrates comprehensive usage of logging presets for different scenarios
 * Shows environment-specific configurations and migration patterns
 */
async function loggingPresetsUsage() {
  console.log('🎯 Example 4: Logging Presets Usage\n');

  // Mock service that processes training data
  class TrainingDataService {
    private logger: Logger;

    constructor(options?: LoggableOptions) {
      this.logger = getLoggerFromOptions(options);
    }

    async processWorkouts(workouts: unknown[]): Promise<{ processed: number; skipped: number }> {
      this.logger.info('Starting workout processing', { 
        totalWorkouts: workouts.length 
      });

      let processed = 0;
      let skipped = 0;

      for (const [index, workout] of workouts.entries()) {
        this.logger.debug(`Processing workout ${index + 1}`, { 
          workoutIndex: index 
        });

        try {
          // Simulate workout processing
          if (!workout || typeof workout !== 'object') {
            this.logger.warn('Skipping invalid workout', { 
              workoutIndex: index,
              workoutType: typeof workout
            });
            skipped++;
            continue;
          }

          // Simulate some processing delay
          await new Promise(resolve => setTimeout(resolve, 10));
          processed++;
          
          this.logger.debug('Workout processed successfully', { 
            workoutIndex: index 
          });
        } catch (error) {
          this.logger.error('Workout processing failed', {
            workoutIndex: index,
            error: error instanceof Error ? error.message : String(error)
          });
          skipped++;
        }
      }

      this.logger.info('Workout processing completed', { 
        processed, 
        skipped,
        totalProcessed: processed + skipped
      });

      return { processed, skipped };
    }
  }

  const sampleWorkouts = [
    { type: 'easy', duration: 60, distance: 8 },
    { type: 'tempo', duration: 45, distance: 6 },
    null, // Invalid workout
    { type: 'interval', duration: 30, distance: 5 },
    'invalid', // Invalid workout
    { type: 'long', duration: 120, distance: 15 }
  ];

  // Preset 1: Development - Full debug output
  console.log('🛠️  Development preset (full debug output):');
  const devService = new TrainingDataService({
    logging: LOGGING_PRESETS.development
  });
  const devResult = await devService.processWorkouts(sampleWorkouts);
  console.log(`Dev result: ${devResult.processed} processed, ${devResult.skipped} skipped\n`);

  // Preset 2: Production - Silent logging
  console.log('🏭 Production preset (silent logging):');
  const prodService = new TrainingDataService({
    logging: LOGGING_PRESETS.production
  });
  const prodResult = await prodService.processWorkouts(sampleWorkouts);
  console.log(`Prod result: ${prodResult.processed} processed, ${prodResult.skipped} skipped\n`);

  // Preset 3: Testing - Silent logging (clean test output)
  console.log('🧪 Testing preset (clean test output):');
  const testService = new TrainingDataService({
    logging: LOGGING_PRESETS.testing
  });
  const testResult = await testService.processWorkouts(sampleWorkouts);
  console.log(`Test result: ${testResult.processed} processed, ${testResult.skipped} skipped\n`);

  // Preset 4: Debug - Verbose troubleshooting
  console.log('🐛 Debug preset (verbose troubleshooting):');
  const debugService = new TrainingDataService({
    logging: LOGGING_PRESETS.debug
  });
  const debugResult = await debugService.processWorkouts(sampleWorkouts.slice(0, 3)); // Smaller sample
  console.log(`Debug result: ${debugResult.processed} processed, ${debugResult.skipped} skipped\n`);

  // Environment-specific configuration pattern
  console.log('🌍 Environment-based configuration:');
  function getEnvironmentLogging(): LoggingConfig {
    switch (process.env.NODE_ENV) {
      case 'development':
        return LOGGING_PRESETS.development;
      case 'production':
        return LOGGING_PRESETS.production;
      case 'test':
        return LOGGING_PRESETS.testing;
      default:
        return LOGGING_PRESETS.development;
    }
  }

  const envService = new TrainingDataService({
    logging: getEnvironmentLogging()
  });
  const envResult = await envService.processWorkouts(sampleWorkouts.slice(0, 2));
  console.log(`Environment result: ${envResult.processed} processed, ${envResult.skipped} skipped\n`);

  console.log('✅ Example 4 complete: Logging presets usage\n');
}

// ============================================================================
// Example 5: Best Practices and Migration Patterns
// ============================================================================

/**
 * Demonstrates best practices for logging configuration and migration patterns
 * Shows how to migrate existing code to use the new logging system
 */
async function bestPracticesAndMigration() {
  console.log('📚 Example 5: Best Practices and Migration Patterns\n');

  // =========================================================================
  // Best Practice 1: Centralized Logging Configuration
  // =========================================================================
  
  console.log('✨ Best Practice 1: Centralized Logging Configuration\n');

  // Application-level logging configuration
  class ApplicationConfig {
    private static loggingConfig: LoggingConfig;

    static initialize(environment: 'development' | 'production' | 'test' | 'debug') {
      this.loggingConfig = LOGGING_PRESETS[environment];
    }

    static getLoggingConfig(): LoggingConfig {
      return this.loggingConfig || LOGGING_PRESETS.development;
    }

    static createOptionsWithLogging<T extends Record<string, unknown>>(
      customOptions: T
    ): LoggableOptions<T> {
      return withLogging(customOptions, this.getLoggingConfig());
    }
  }

  // Initialize for current environment
  ApplicationConfig.initialize('development');

  // Service using centralized configuration
  function processTrainingPlan(planData: unknown) {
    const options = ApplicationConfig.createOptionsWithLogging({
      validateInput: true,
      timeout: 5000
    });

    const logger = getLoggerFromOptions(options);
    logger.info('Processing training plan with centralized config');
    
    // Process with consistent logging configuration
    return { success: true };
  }

  const result1 = processTrainingPlan({ goal: 'MARATHON' });
  console.log(`Centralized config result: ${result1.success ? 'Success' : 'Failed'}\n`);

  // =========================================================================
  // Best Practice 2: Graceful Migration from Console Statements
  // =========================================================================
  
  console.log('✨ Best Practice 2: Graceful Migration from Console Statements\n');

  // BEFORE: Direct console usage (legacy pattern)
  function legacyExportFunction(data: unknown, format: string) {
    console.log(`Starting export to ${format}`); // Direct console usage
    
    try {
      // Export logic
      const result = { filename: `export.${format}`, size: 1024 };
      console.log(`Export completed: ${result.filename}`); // Direct console usage
      return result;
    } catch (error) {
      console.error('Export failed:', error); // Direct console usage
      throw error;
    }
  }

  // AFTER: Configurable logging (modern pattern)
  function modernExportFunction(data: unknown, format: string, options?: LoggableOptions) {
    const logger = getLoggerFromOptions(options);
    
    logger.info('Starting export', { format }); // Configurable logging
    
    try {
      // Export logic
      const result = { filename: `export.${format}`, size: 1024 };
      logger.info('Export completed', { 
        filename: result.filename,
        size: result.size
      }); // Structured logging with context
      return result;
    } catch (error) {
      logger.error('Export failed', { 
        format,
        error: error instanceof Error ? error.message : String(error)
      }); // Configurable error logging
      throw error;
    }
  }

  // Show migration - both functions work, but modern one is configurable
  console.log('Legacy function (always logs to console):');
  legacyExportFunction({ data: 'sample' }, 'pdf');

  console.log('\nModern function (configurable logging):');
  modernExportFunction({ data: 'sample' }, 'csv', {
    logging: { level: 'info', backend: 'console' }
  });

  console.log('\nModern function (silent in production):');
  modernExportFunction({ data: 'sample' }, 'json', {
    logging: LOGGING_PRESETS.production // Silent
  });
  console.log('(No output from function - silent logging)\n');

  // =========================================================================
  // Best Practice 3: Type-Safe Options Extension
  // =========================================================================
  
  console.log('✨ Best Practice 3: Type-Safe Options Extension\n');

  // Domain-specific options extending LoggableOptions
  interface WorkoutAnalysisOptions extends LoggableOptions {
    includeHeartRate?: boolean;
    includePower?: boolean;
    analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
    timeWindow?: number; // days
  }

  function analyzeWorkouts(workouts: unknown[], options?: WorkoutAnalysisOptions) {
    const logger = getLoggerFromOptions(options);
    
    // Use typed options with defaults
    const includeHeartRate = options?.includeHeartRate ?? false;
    const includePower = options?.includePower ?? false;
    const analysisDepth = options?.analysisDepth ?? 'basic';
    const timeWindow = options?.timeWindow ?? 30;

    logger.info('Starting workout analysis', {
      workoutCount: workouts.length,
      includeHeartRate,
      includePower,
      analysisDepth,
      timeWindow
    });

    // Simulate analysis
    const analysisResult = {
      totalWorkouts: workouts.length,
      averageIntensity: 'moderate',
      trends: ['improving endurance', 'stable power'],
      recommendations: ['increase weekly volume', 'add speed work']
    };

    logger.info('Workout analysis completed', {
      resultSummary: {
        totalWorkouts: analysisResult.totalWorkouts,
        trends: analysisResult.trends.length,
        recommendations: analysisResult.recommendations.length
      }
    });

    return analysisResult;
  }

  const sampleWorkouts = [
    { type: 'easy', duration: 60 },
    { type: 'tempo', duration: 45 },
    { type: 'interval', duration: 30 }
  ];

  const analysisResult = analyzeWorkouts(sampleWorkouts, {
    includeHeartRate: true,
    analysisDepth: 'detailed',
    timeWindow: 14,
    logging: LOGGING_PRESETS.development
  });

  console.log(`Analysis result: ${analysisResult.totalWorkouts} workouts analyzed\n`);

  // =========================================================================
  // Best Practice 4: Error Handling Integration
  // =========================================================================
  
  console.log('✨ Best Practice 4: Error Handling Integration\n');

  function validateAndProcessData(data: unknown, options?: LoggableOptions) {
    const logger = getLoggerFromOptions(options);
    
    logger.debug('Starting data validation and processing');

    // Use options-aware error handling for consistent logging
    const validationResult = TypeSafeErrorHandler.handleErrorWithOptions(
      () => {
        if (!data) {
          throw new Error('Data is required');
        }
        if (typeof data !== 'object') {
          throw new Error('Data must be an object');
        }
        return data;
      },
      'data-validation',
      options // Pass options for consistent logging configuration
    );

    if (!validationResult.success) {
      logger.error('Data validation failed', { 
        error: validationResult.error 
      });
      return { success: false, error: validationResult.error };
    }

    logger.info('Data validation successful, proceeding with processing');
    
    // Continue with processing...
    const processingResult = TypeSafeErrorHandler.handleErrorWithOptions(
      () => {
        // Simulate processing
        return { processedItems: 5, timestamp: new Date() };
      },
      'data-processing',
      options
    );

    if (processingResult.success) {
      logger.info('Data processing completed successfully');
      return { success: true, data: processingResult.data };
    } else {
      logger.error('Data processing failed', { 
        error: processingResult.error 
      });
      return { success: false, error: processingResult.error };
    }
  }

  // Test with different logging configurations
  const validData = { workouts: [], config: {} };
  const invalidData = null;

  console.log('Validation with development logging:');
  const devValidation = validateAndProcessData(validData, {
    logging: LOGGING_PRESETS.development
  });
  console.log(`Validation result: ${devValidation.success ? 'Success' : 'Failed'}\n`);

  console.log('Validation with silent logging:');
  const silentValidation = validateAndProcessData(invalidData, {
    logging: LOGGING_PRESETS.production
  });
  console.log(`Validation result: ${silentValidation.success ? 'Success' : 'Failed'}\n`);

  console.log('✅ Example 5 complete: Best practices and migration patterns\n');
}

// ============================================================================
// Main Example Runner
// ============================================================================

/**
 * Run all logging integration examples
 */
async function runAllLoggingExamples() {
  console.log('🚀 Training Plan Generator - Logging Integration Examples\n');
  console.log('This demo shows comprehensive usage of the configurable logging system');
  console.log('integrated throughout the Training Plan Generator API.\n');

  try {
    await customOptionsWithLogging();
    await exportWithLoggingConfiguration();
    await errorHandlingWithOptionsLogging();
    await loggingPresetsUsage();
    await bestPracticesAndMigration();

    console.log('🎉 All logging integration examples completed successfully!\n');
    console.log('Key Takeaways:');
    console.log('• LoggableOptions provides system-wide logging configuration');
    console.log('• Export operations automatically inherit logging capabilities');
    console.log('• Error handlers respect logging configuration from options');
    console.log('• Presets make environment-specific configuration easy');
    console.log('• Migration from console statements is backward compatible');
    console.log('• Type safety is maintained throughout the configuration chain');

  } catch (error) {
    console.error('❌ Example execution failed:', error instanceof Error ? error.message : String(error));
  }
}

// Export examples for individual usage
export {
  customOptionsWithLogging,
  exportWithLoggingConfiguration,
  errorHandlingWithOptionsLogging,
  loggingPresetsUsage,
  bestPracticesAndMigration,
  runAllLoggingExamples
};

// Run all examples if this file is executed directly
if (require.main === module) {
  runAllLoggingExamples();
}