// Core Types and Interfaces
export * from './types';

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

// Export with explicit name resolution for conflicting types
export * from './export';
export { ValidationResult as CoreValidationResult } from './validation';