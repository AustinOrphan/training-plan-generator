# Mock Generation Patterns for Type-Safe Testing

This document outlines the type-safe mock generation patterns implemented in the training plan generator test suite. These patterns eliminate the need for `as any` type assertions in tests while providing consistent, validated test data.

## Core Concepts

### MockGenerator<T> Interface

The `MockGenerator<T>` interface provides a structured approach to generating test data with full type safety:

```typescript
interface MockGenerator<T> {
  generate(overrides?: Partial<T>): T;
  generateMany(count: number, overrides?: Partial<T> | ((index: number) => Partial<T>)): T[];
  validate(instance: T): boolean;
  schema: TypedSchema<T>;
  metadata?: GeneratorMetadata;
}
```

### TestConfig<T, TRequired> Type

The `TestConfig<T, TRequired>` type allows flexible test parameter overrides with proper type constraints:

```typescript
type TestConfig<T, TRequired extends keyof T = never> = 
  T extends object ? (
    TRequired extends never 
      ? Partial<T>
      : Partial<T> & Required<Pick<T, TRequired>>
  ) : never;
```

## Implementation Patterns

### 1. Basic Mock Generator

For simple data structures, implement a straightforward generator:

```typescript
export const fitnessAssessmentMockGenerator: MockGenerator<FitnessAssessment> = {
  generate: (overrides?: Partial<FitnessAssessment>): FitnessAssessment => 
    createMockFitnessAssessment(overrides),
  
  generateMany: (count: number, overrides?: Partial<FitnessAssessment> | ((index: number) => Partial<FitnessAssessment>)): FitnessAssessment[] => {
    return Array(count).fill(null).map((_, index) => {
      const override = typeof overrides === 'function' ? overrides(index) : overrides;
      return createMockFitnessAssessment(override);
    });
  },
  
  validate: (instance: FitnessAssessment): boolean => {
    return instance.vdot > 0 && 
           instance.criticalSpeed > 0 && 
           instance.lactateThreshold > 0;
  },
  
  schema: {
    validate: (data: unknown): data is FitnessAssessment => {
      return typeof data === 'object' && data !== null &&
             'vdot' in data && 'criticalSpeed' in data;
    },
    properties: ['vdot', 'criticalSpeed', 'lactateThreshold', 'runningEconomy']
  },
  
  metadata: {
    typeName: 'FitnessAssessment',
    version: '1.0.0',
    description: 'Generates mock fitness assessment data for testing'
  }
};
```

### 2. Hierarchical Mock Generator

For complex objects with nested dependencies:

```typescript
export const advancedPlanConfigMockGenerator: MockGenerator<AdvancedPlanConfig> = {
  generate: (overrides?: Partial<AdvancedPlanConfig>): AdvancedPlanConfig =>
    createMockAdvancedPlanConfig(overrides),
  
  validate: (instance: AdvancedPlanConfig): boolean => {
    return trainingPlanConfigMockGenerator.validate(instance) &&
           instance.methodology !== undefined &&
           instance.intensityDistribution !== undefined;
  },
  
  schema: {
    validate: (data: unknown): data is AdvancedPlanConfig => {
      return trainingPlanConfigMockGenerator.schema.validate(data) &&
             typeof data === 'object' && data !== null &&
             'methodology' in data;
    },
    properties: [...trainingPlanConfigMockGenerator.schema.properties, 'methodology', 'intensityDistribution']
  }
};
```

### 3. Mock Factory Registry

Centralized registry for managing multiple generators:

```typescript
export class TypedMockRegistry implements MockFactoryRegistry {
  private generators = new Map<string, MockGenerator<any>>();
  
  register<T>(typeName: string, generator: MockGenerator<T>): void {
    this.generators.set(typeName, generator);
  }
  
  create<T>(typeName: string, overrides?: Partial<T>): T {
    const generator = this.generators.get(typeName);
    if (!generator) {
      throw new Error(`No generator registered for type: ${typeName}`);
    }
    return generator.generate(overrides);
  }
}

// Usage
const registry = new TypedMockRegistry();
registry.register('FitnessAssessment', fitnessAssessmentMockGenerator);
const fitness = registry.create('FitnessAssessment', { vdot: 50 });
```

## Usage Examples

### Single Instance Generation

```typescript
// Basic usage
const fitness = fitnessAssessmentMockGenerator.generate();

// With overrides
const advancedFitness = fitnessAssessmentMockGenerator.generate({
  vdot: 55,
  weeklyMileage: 60
});

// With validation
const workout = plannedWorkoutMockGenerator.generate({ duration: 90 });
if (plannedWorkoutMockGenerator.validate(workout)) {
  // TypeScript knows workout is valid PlannedWorkout
  expect(workout.targetMetrics.duration).toBe(90);
}
```

### Multiple Instance Generation

```typescript
// Generate multiple instances with same overrides
const workouts = plannedWorkoutMockGenerator.generateMany(5, {
  type: 'easy',
  targetMetrics: { intensity: 65 }
});

// Generate multiple instances with varying overrides
const progressData = fitnessAssessmentMockGenerator.generateMany(10, (index) => ({
  vdot: 45 + index * 2,
  weeklyMileage: 30 + index * 5
}));
```

### Test Configuration Patterns

```typescript
// Basic test config
const testConfig = createTestConfig<TrainingPlanConfig>({
  name: 'Test Plan',
  goal: 'marathon'
});

// Required fields enforced
type WorkoutTestConfig = TestConfig<PlannedWorkout, 'id' | 'date'>;
const workoutConfig: WorkoutTestConfig = {
  id: 'test-workout-1',
  date: new Date(),
  // Other properties are optional
  duration: 45
};
```

## Available Mock Generators

### Core Domain Types

1. **FitnessAssessment** - `fitnessAssessmentMockGenerator`
   - Generates realistic fitness assessment data
   - Validates VDOT, critical speed, and threshold values
   - Supports injury history and recovery rate generation

2. **TrainingPlanConfig** - `trainingPlanConfigMockGenerator`
   - Creates complete training plan configurations
   - Handles date ranges and fitness assessments
   - Validates required fields and date consistency

3. **AdvancedPlanConfig** - `advancedPlanConfigMockGenerator`
   - Extends TrainingPlanConfig with methodology support
   - Includes race targeting and adaptation settings
   - Validates methodology-specific properties

4. **PlannedWorkout** - `plannedWorkoutMockGenerator`
   - Generates structured workout data
   - Creates realistic target metrics and segments
   - Validates workout structure and timing

5. **CompletedWorkout** - `completedWorkoutMockGenerator`
   - Links to planned workouts for comparison
   - Generates realistic completion metrics
   - Validates adherence and performance data

### Registry and Utilities

- **TypedMockRegistry** - Centralized generator management
- **defaultMockRegistry** - Pre-configured registry with common generators
- **createTestConfig<T>** - Type-safe test configuration helper
- **createCompliantMockData** - Strict interface compliance utilities

## Testing Patterns

### Integration Test Data

```typescript
// Create consistent test data for integration tests
const testData = createCompliantMockData.adaptationTestData({
  progressData: { performanceMetrics: { vo2max: 52 } }
});

// Use in tests
const engine = new SmartAdaptationEngine();
const result = engine.analyzeProgress(
  testData.completedWorkouts,
  testData.plannedWorkouts
);
```

### Performance Testing

```typescript
// Generate large datasets for performance testing
const largePlan = advancedPlanConfigMockGenerator.generate({
  targetRaces: plannedWorkoutMockGenerator.generateMany(20, (index) => ({
    date: addDays(new Date(), index * 7),
    priority: index % 3 === 0 ? 'A' : 'B'
  }))
});
```

### Error Case Testing

```typescript
// Generate invalid data for error testing
const invalidWorkout = plannedWorkoutMockGenerator.generate({
  targetMetrics: { duration: -10 } // Invalid duration
});

expect(plannedWorkoutMockGenerator.validate(invalidWorkout)).toBe(false);
```

## Best Practices

### 1. Leverage Existing Functions

Always build on existing `createMock*` functions rather than duplicating logic:

```typescript
// Good: Reuses existing function
export const myGenerator: MockGenerator<MyType> = {
  generate: (overrides) => createMockMyType(overrides),
  // ...
};

// Avoid: Duplicating logic
export const myGenerator: MockGenerator<MyType> = {
  generate: (overrides) => ({
    prop1: 'default',
    prop2: 42,
    ...overrides
  }),
  // ...
};
```

### 2. Provide Meaningful Validation

Include runtime validation that catches common issues:

```typescript
validate: (instance: WorkoutType): boolean => {
  return instance.duration > 0 &&
         instance.date instanceof Date &&
         instance.targetMetrics !== undefined &&
         instance.id.length > 0;
}
```

### 3. Use Type Guards in Schema

Implement proper type guards for schema validation:

```typescript
schema: {
  validate: (data: unknown): data is MyType => {
    return typeof data === 'object' && data !== null &&
           'requiredProp' in data &&
           typeof (data as any).requiredProp === 'string';
  },
  properties: ['requiredProp', 'optionalProp']
}
```

### 4. Document Generator Metadata

Provide clear metadata for debugging and documentation:

```typescript
metadata: {
  typeName: 'MyType',
  version: '1.0.0',
  description: 'Generates MyType instances for testing specific scenarios',
  examples: [{
    description: 'Basic usage',
    code: 'generator.generate({ prop: "value" })',
    result: { prop: "value", otherProp: "default" }
  }]
}
```

## Migration Guide

### From Legacy Mock Functions

To migrate existing test files:

1. **Replace direct mock calls**:
   ```typescript
   // Before
   const workout = createMockPlannedWorkout({ duration: 60 });
   
   // After
   const workout = plannedWorkoutMockGenerator.generate({ duration: 60 });
   ```

2. **Use validation instead of assumptions**:
   ```typescript
   // Before
   expect(workout.targetMetrics).toBeDefined();
   
   // After
   expect(plannedWorkoutMockGenerator.validate(workout)).toBe(true);
   ```

3. **Leverage registry for consistency**:
   ```typescript
   // Before
   const fitness = createMockFitnessAssessment();
   const config = createMockTrainingPlanConfig({ currentFitness: fitness });
   
   // After
   const config = defaultMockRegistry.create('TrainingPlanConfig');
   ```

### Type Safety Improvements

Replace `as any` assertions with proper typing:

```typescript
// Before
const result = someFunction(testData as any);

// After
const assertion = createTestAssertion(
  testData,
  (data): data is ExpectedType => validateExpectedType(data),
  'ExpectedType'
);

if (assertion.assert(assertion.value)) {
  const result = someFunction(assertion.value);
}
```

## Troubleshooting

### Common Issues

1. **Generator not registered**: Ensure generators are registered in the default registry
2. **Validation failures**: Check that required properties are included in overrides
3. **Type mismatches**: Verify that schema validation matches the actual interface
4. **Date handling**: Use `testDateUtils.createTestDate()` for consistent date handling

### Debugging Tips

1. Use `generator.validate()` to check generated data
2. Check `generator.metadata.typeName` for debugging context
3. Use registry's `getRegisteredTypes()` to see available generators
4. Enable TypeScript strict mode to catch type issues early

This mock generation system provides a robust foundation for type-safe testing while maintaining flexibility and ease of use.