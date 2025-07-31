// Core Types and Interfaces
export * from './types';

// Extended Type Modules
export * from './types/base-types';
export * from './types/error-types';
export * from './types/methodology-types';
export * from './types/methodology-cache-types';
export * from './types/methodology-loader-types';
export * from './types/export-types';
export * from './types/export-validation-types';
export * from './types/array-utilities';
export * from './types/type-guards';

// Test Types (conditional export for development/testing)
export * from './types/test-types';
export * from './types/test-extensions';

// Core Calculation and Generation Engine
export * from './calculator';
export * from './generator';

// Workout and Zone Management
export * from './workouts';
export * from './zones';

// Configuration and Constants
export * from './constants';

// Essential Advanced Features (stable modules)
export * from './calculation-cache';

// Advanced Features
export * from './advanced-generator';
export * from './adaptation';
export * from './philosophies';

// Methodology System
export * from './lazy-methodology-loader';
export * from './methodology-adaptation-engine';
export * from './methodology-customization-engine';
export * from './methodology-recommendation-engine';
export * from './methodology-cache 2';

// Export with explicit name resolution for conflicting types
export * from './export';
export { ValidationResult as CoreValidationResult } from './validation';

// Workout Progression and Selection System
export * from './workout-progression-system';
export * from './methodology-workout-selector';
export * from './custom-workout-generator';