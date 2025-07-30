# 'as any' Removal Action Plan

## Quick Wins (Can be done immediately) - 8 instances

### 1. Null/Undefined Testing (2 instances)
**Files**: `calculation-cache.test.ts`
```typescript
// Before
const nullRuns = null as any;
const undefinedRuns = undefined as any;

// After
const nullRuns: unknown = null;
const undefinedRuns: unknown = undefined;
```

### 2. Error Catching (1 instance)
**Files**: `test-utils.ts`
```typescript
// Before
} catch (error: any) {

// After  
} catch (error: unknown) {
```

### 3. Object Initialization (1 instance)
**Files**: `philosophy-comparator.ts`
```typescript
// Before
const scores: Record<TrainingMethodology, Record<string, number>> = {} as any;

// After
const scores: Record<TrainingMethodology, Record<string, number>> = {
  daniels: {},
  lydiard: {},
  pfitzinger: {}
};
```

### 4. Mock Array Creation (1 instance)
**Files**: `advanced-customization-integration.test.ts`
```typescript
// Before
const perfPlanned = Array(20).fill(null).map(() => ({} as any));

// After
const perfPlanned = Array(20).fill(null).map(() => createMockPlannedWorkout());
```

### 5. Property Deletion (2 instances)
**Files**: `methodology-adaptation-engine.test.ts`
```typescript
// Before
delete (basicConfig as any).methodology;

// After
const { methodology, ...basicConfig } = createMockAdvancedPlanConfig();
```

### 6. Reducer Type (1 instance)
**Files**: `environmental-constraint-adapter.ts`
```typescript
// Before
'low' as any

// After
const maxSeverity = specificRisks.reduce<'low' | 'moderate' | 'high'>((max, risk) => {
  // proper implementation
}, 'low');
```

## Medium Complexity (Requires new interfaces) - 25 instances

### 1. Extended Test Interfaces (12 instances)
**Files**: `test-utils.ts`

Create extended interfaces for backward compatibility:
```typescript
// src/types/test-extended-types.ts
export interface ExtendedProgressData extends ProgressData {
  fitnessChange?: number;
  trend?: 'improving' | 'stable' | 'declining';
  consistencyScore?: number;
  adherenceRate?: number;
  overreachingRisk?: number;
  recoveryTrend?: string;
  completedWorkouts?: CompletedWorkout[];
  totalWorkouts?: number;
  currentFitness?: Partial<FitnessAssessment>;
  lastUpdateDate?: Date;
  volumeProgress?: {
    weeklyAverage: number;
    trend: string;
  };
  intensityDistribution?: IntensityDistribution;
  performanceTrend?: string;
}

export interface ExtendedCompletedWorkout extends CompletedWorkout {
  workoutId?: string;
  date?: Date;
  notes?: string;
  perceivedEffort?: number;
  plannedDuration?: number;
}

export interface ExtendedRecoveryMetrics extends RecoveryMetrics {
  injuryStatus?: string;
  restingHR?: number;
  hrv?: number;
  notes?: string;
  date?: Date;
}
```

### 2. Private Method Access (13 instances)
**Files**: `pfitzinger-methodology.test.ts`

Create testable interface:
```typescript
// src/types/testable-philosophy-types.ts
export interface TestablePfitzingerPhilosophy extends TrainingPhilosophy {
  getPfitzingerBaseStructure(phase: TrainingPhase): WeeklyStructure;
  calculateThresholdVolumeProgression(phase: TrainingPhase, weeks: number): number[];
  getRaceSpecificIntegration(phase: TrainingPhase, weeksTillRace: number): IntegrationPlan;
  calculateThresholdDuration(week: number, baseMinutes: number): number;
  // ... other methods
}

// In test file
const philosophy = PhilosophyFactory.create('pfitzinger') as TestablePfitzingerPhilosophy;
```

## High Complexity (Requires architectural changes) - 26 instances

### 1. Dynamic Config Access (12 instances)
**Files**: `methodology-conflict-resolver.ts`

Create comprehensive config type system:
```typescript
// src/types/methodology-config-types.ts
export interface IntensityConfig {
  easy: number;
  moderate: number;
  hard: number;
}

export interface VolumeConfig {
  progressionRate: number;
  weeklyHours: number;
  weeklyDistance?: number;
  peakVolume?: number;
}

export interface RecoveryConfig {
  emphasis: number;
  daysPerWeek: number;
  minimumRestDays?: number;
}

export interface MethodologyConfig {
  intensity?: IntensityConfig;
  volume?: VolumeConfig;
  recovery?: RecoveryConfig;
  phases?: PhaseConfig[];
}

// Type guards
export function hasIntensityConfig(config: unknown): config is { intensity: IntensityConfig } {
  return typeof config === 'object' && 
         config !== null && 
         'intensity' in config &&
         typeof (config as any).intensity === 'object' &&
         'easy' in (config as any).intensity;
}

export function hasVolumeConfig(config: unknown): config is { volume: VolumeConfig } {
  return typeof config === 'object' && 
         config !== null && 
         'volume' in config &&
         typeof (config as any).volume === 'object' &&
         'progressionRate' in (config as any).volume;
}

// Usage in methodology-conflict-resolver.ts
if (hasIntensityConfig(config) && config.intensity.easy < 85) {
  // Now TypeScript knows config.intensity exists and has correct type
}
```

### 2. Generic Type Constraints (4 instances)
**Files**: `export-validation-types.ts`, `test-types.ts`

Improve generic constraints:
```typescript
// Before
planGuard: (value: unknown) => value is TPlan = isValidTrainingPlan as any

// After
export function createExportValidator<
  TOptions extends BaseExportOptions = BaseExportOptions,
  TPlan extends TrainingPlan = TrainingPlan
>(
  format: ExportFormat,
  optionsGuard: TypeGuard<TOptions>,
  planGuard: TypeGuard<TPlan> = createTypeGuard(isValidTrainingPlan)
): ExportFormatValidator<TOptions, TPlan> {
  // implementation
}

// Helper function
function createTypeGuard<T>(validator: (value: unknown) => boolean): TypeGuard<T> {
  return {
    check: validator as (value: unknown) => value is T,
    name: validator.name || 'anonymous'
  };
}
```

### 3. Private Method Access in Production (1 instance)
**Files**: `advanced-generator.ts`

Refactor to expose necessary functionality:
```typescript
// Option 1: Make method protected and extend for testing
protected generateMicrocycles(block: TrainingBlock): Microcycle[] {
  // implementation
}

// Option 2: Create public API
public generateBlockMicrocycles(block: TrainingBlock): Microcycle[] {
  return this.generateMicrocycles(block);
}
```

### 4. Remaining Test Mock Patterns (9 instances)
**Files**: Various test files

Create comprehensive mock utilities:
```typescript
// src/test/mock-builders.ts
export class MockBuilder<T> {
  private data: Partial<T> = {};
  
  with<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value;
    return this;
  }
  
  build(): T {
    return this.data as T;
  }
}

// Usage
const mockWorkout = new MockBuilder<PlannedWorkout>()
  .with('id', 'test-1')
  .with('date', new Date())
  .build();
```

## Implementation Schedule

### Week 1: Quick Wins
- [ ] Replace all null/undefined test patterns (2 instances)
- [ ] Fix error catching patterns (1 instance)
- [ ] Fix simple object initializations (1 instance)
- [ ] Fix mock array creation (1 instance)
- [ ] Convert property deletions to destructuring (2 instances)
- [ ] Fix reducer type assertion (1 instance)

### Week 2-3: Test Infrastructure
- [ ] Create extended interfaces for test data (12 instances)
- [ ] Implement testable philosophy interfaces (13 instances)
- [ ] Update all test files to use new interfaces

### Week 4-5: Config Type System
- [ ] Design comprehensive config type system
- [ ] Implement type guards for config objects
- [ ] Refactor methodology-conflict-resolver.ts (12 instances)

### Week 6: Generic Improvements
- [ ] Improve generic type constraints (4 instances)
- [ ] Update factory patterns with proper generics
- [ ] Fix remaining type narrowing issues

### Week 7-8: Final Cleanup
- [ ] Address private method access in production code (1 instance)
- [ ] Complete remaining test mock patterns (9 instances)
- [ ] Run full type check and ensure no regressions

## Success Metrics

1. **Type Coverage**: Increase from ~85% to 95%+
2. **Zero 'as any'**: Complete removal of all 59 instances
3. **No Runtime Errors**: All tests pass with strict type checking
4. **Improved DX**: Better autocomplete and type hints
5. **Documentation**: All new types properly documented

## Testing Strategy

1. **Incremental Testing**: Test each change in isolation
2. **Type Tests**: Add explicit type tests for new interfaces
3. **Runtime Tests**: Ensure no behavioral changes
4. **Integration Tests**: Verify end-to-end functionality
5. **Performance Tests**: Confirm no performance regression