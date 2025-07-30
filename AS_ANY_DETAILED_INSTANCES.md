# Detailed 'as any' Instance Catalog

## Complete Instance List by File

### 1. src/__tests__/pfitzinger-methodology.test.ts (13 instances)

```typescript
// Line 231: Accessing private method
const weeklyStructure = (philosophy as any).getPfitzingerBaseStructure('build');

// Line 250: Accessing private method
const weeklyStructure = (philosophy as any).getPfitzingerBaseStructure('build');

// Line 264: Accessing private method
const volumeProgression = (philosophy as any).calculateThresholdVolumeProgression('build', 5);

// Line 278: Accessing private method
const raceIntegration = (philosophy as any).getRaceSpecificIntegration('peak', 2);

// Line 294: Accessing private method
const thresholdDuration = (philosophy as any).calculateThresholdDuration(week, 45);

// Additional 8 similar instances of private method access
```

**Solution**: Create test-specific interface or make methods protected
```typescript
interface TestablePfitzingerPhilosophy extends TrainingPhilosophy {
  getPfitzingerBaseStructure(phase: string): BaseStructure;
  calculateThresholdVolumeProgression(phase: string, weeks: number): VolumeProgression;
  // ... other methods
}
```

### 2. src/methodology-conflict-resolver.ts (12 instances)

```typescript
// Line 330: Type coercion in factory
} as any);

// Line 384: Dynamic property access
if (config.intensity && (config.intensity as any).easy < 85) {

// Line 391: Dynamic property access
currentValue: (config.intensity as any)?.easy || 'unknown',

// Line 407: Dynamic property access
if (config.intensity && (config.intensity as any).easy < 75) {

// Line 414: Dynamic property access
currentValue: (config.intensity as any)?.easy || 'unknown',

// Line 443: Dynamic property access
if (config.volume && (config.volume as any).progressionRate > maxProgressionRate * 1.5) {

// Line 450: Dynamic property access
currentValue: (config.volume as any).progressionRate,

// Line 478: Dynamic property access
if (config.recovery && (config.recovery as any).emphasis < expectedRecoveryEmphasis - 0.1) {

// Line 485: Dynamic property access
currentValue: (config.recovery as any).emphasis,

// Line 533-534: Dynamic property access
const volumeHours = (config.volume as any).weeklyHours;
const hardIntensity = (config.intensity as any).hard;

// Line 702: Dynamic property access
const easyPercent = (config.intensity as any).easy;
```

**Solution**: Define proper config interfaces
```typescript
interface IntensityConfig {
  easy: number;
  moderate: number;
  hard: number;
}

interface VolumeConfig {
  progressionRate: number;
  weeklyHours: number;
}

interface RecoveryConfig {
  emphasis: number;
  daysPerWeek: number;
}

interface MethodologyConfig {
  intensity?: IntensityConfig;
  volume?: VolumeConfig;
  recovery?: RecoveryConfig;
}
```

### 3. src/__tests__/test-utils.ts (4 instances)

```typescript
// Line 245: Extending strict interface
const extendedData = strictProgressData as any;

// Line 294: Extending strict interface
const extendedData = strictCompletedWorkout as any;

// Line 319: Extending strict interface
const extendedData = strictRecoveryMetrics as any;

// Line 1050: Error casting
} catch (error: any) {
```

**Solution**: Create extended interfaces
```typescript
interface ExtendedProgressData extends ProgressData {
  fitnessChange?: number;
  trend?: string;
  // ... other backward compatibility fields
}

interface ExtendedCompletedWorkout extends CompletedWorkout {
  workoutId?: string;
  date?: Date;
  // ... other fields
}
```

### 4. src/types/test-types.ts (4 instances)

```typescript
// Line 420: Type narrowing in function default
planGuard: (value: unknown) => value is TPlan = isValidTrainingPlan as any

// Line 479: Override type in mock config
overrides: overrides as any, // Note: This will be replaced in Phase 6

// Additional instances in similar patterns
```

**Solution**: Use proper generic constraints
```typescript
export function createExportValidator<TOptions = BaseExportOptions, TPlan extends TrainingPlan = TrainingPlan>(
  format: ExportFormat,
  optionsGuard: (value: unknown) => value is TOptions,
  planGuard: (value: unknown) => value is TPlan = (value): value is TPlan => isValidTrainingPlan(value)
): ExportFormatValidator<TOptions, TPlan>
```

### 5. src/__tests__/methodology-export-enhancement.test.ts (4 instances)

```typescript
// Mock creation and type assertions for testing
// Similar patterns to other test files
```

### 6. src/__tests__/export-workflow.test.ts (3 instances)

```typescript
// Export result type assertions
// Mock data creation patterns
```

### 7. src/__tests__/export-validation.test.ts (3 instances)

```typescript
// Validation result type assertions
// Test data creation patterns
```

### 8. src/__tests__/multi-methodology-performance.test.ts (3 instances)

```typescript
// Performance measurement type assertions
// Mock data patterns
```

### 9. src/__tests__/methodology-adaptation-engine.test.ts (2 instances)

```typescript
// Line 102: Deleting property
delete (basicConfig as any).methodology;

// Line 173: Deleting property
delete (basicConfig as any).methodology;
```

**Solution**: Use object spread with omit
```typescript
const { methodology, ...basicConfig } = createMockAdvancedPlanConfig();
```

### 10. src/__tests__/lazy-methodology-loader.test.ts (2 instances)

```typescript
// Dynamic import mocking
// Module loading patterns
```

### 11. src/__tests__/calculation-cache.test.ts (2 instances)

```typescript
// Line 354-355: Null/undefined testing
const nullRuns = null as any;
const undefinedRuns = undefined as any;
```

**Solution**: Use unknown type
```typescript
const nullRuns: unknown = null;
const undefinedRuns: unknown = undefined;
```

### 12. src/types/export-validation-types.ts (1 instance)

```typescript
// Line 420: Generic type narrowing
planGuard: (value: unknown) => value is TPlan = isValidTrainingPlan as any
```

### 13. src/advanced-generator.ts (1 instance)

```typescript
// Line 695: Private method access
const microcycles = (generator as any).generateMicrocycles(block);
```

**Solution**: Make method public or create accessor
```typescript
// Option 1: Make method public
public generateMicrocycles(block: TrainingBlock): Microcycle[]

// Option 2: Create accessor method
public getMicrocyclesForBlock(block: TrainingBlock): Microcycle[]
```

### 14. src/philosophy-comparator.ts (1 instance)

```typescript
// Line 307: Object initialization
const scores: Record<TrainingMethodology, Record<string, number>> = {} as any;
```

**Solution**: Proper initialization
```typescript
const scores: Record<TrainingMethodology, Record<string, number>> = {
  daniels: {},
  lydiard: {},
  pfitzinger: {}
};
```

### 15. src/environmental-constraint-adapter.ts (1 instance)

```typescript
// Line 1396: Type assertion in reducer
risk.severity === 'high' ? 'high' : max === 'high' ? 'high' : risk.severity, 'low' as any
```

**Solution**: Proper type for reducer
```typescript
const maxSeverity = specificRisks.reduce<'low' | 'moderate' | 'high'>(
  (max, risk) => {
    if (risk.severity === 'high' || max === 'high') return 'high';
    if (risk.severity === 'moderate' || max === 'moderate') return 'moderate';
    return 'low';
  },
  'low'
);
```

### 16. src/__tests__/performance.test.ts (1 instance)

```typescript
// Performance measurement type assertion
```

### 17. src/__tests__/end-to-end.test.ts (1 instance)

```typescript
// End-to-end test data creation
```

### 18. src/__tests__/advanced-customization-integration.test.ts (1 instance)

```typescript
// Line 1128: Mock array creation
const perfPlanned = Array(20).fill(null).map(() => ({} as any));
```

**Solution**: Create proper mock data
```typescript
const perfPlanned = Array(20).fill(null).map(() => createMockPlannedWorkout());
```

## Quick Fix Script

For the simple replacements, here's a script that could handle many of the straightforward cases:

```bash
# Replace null/undefined as any patterns
find src -name "*.ts" -type f -exec sed -i '' 's/null as any/null as unknown/g' {} +
find src -name "*.ts" -type f -exec sed -i '' 's/undefined as any/undefined as unknown/g' {} +

# Replace error catching patterns
find src -name "*.ts" -type f -exec sed -i '' 's/catch (error: any)/catch (error: unknown)/g' {} +
```

## Type Definition Additions Needed

### 1. Config Type Definitions
```typescript
// src/types/methodology-config-types.ts
export interface MethodologyConfigConstraints {
  intensity?: IntensityDistribution;
  volume?: VolumeConfiguration;
  recovery?: RecoveryConfiguration;
  // ... other config types
}
```

### 2. Test Helper Types
```typescript
// src/types/test-helper-types.ts
export interface TestablePhilosophy extends TrainingPhilosophy {
  // Expose internal methods for testing
}
```

### 3. Extended Interfaces for Backward Compatibility
```typescript
// src/types/extended-types.ts
export interface ExtendedProgressData extends ProgressData {
  // Additional fields for backward compatibility
}
```