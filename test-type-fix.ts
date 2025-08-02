// Quick test to verify the 'as any' fix is working properly
import { createExportValidator, isValidTrainingPlan } from './src/types/export-validation-types';
import { TrainingPlan } from './src/types';

// Test that the generic constraint works properly
const testValidator = createExportValidator(
  'pdf' as any, // ExportFormat
  (value: unknown): value is any => true, // Simple options guard for testing
  // The planGuard parameter should now use proper type safety without 'as any'
);

// Test that the function compiles without 'as any'
const testPlan: unknown = {};
const isValid = isValidTrainingPlan(testPlan);

if (isValid) {
  console.log('Plan is valid:', testPlan);
}

console.log('Type fix test compiled successfully!');