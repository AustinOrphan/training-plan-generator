# Training Plan Generator Examples

This directory contains practical examples demonstrating how to use the Training Plan Generator API for various scenarios.

## Quick Start Examples

- [**basic-plan-generation.ts**](./basic-plan-generation.ts) - Simple plan creation
- [**methodology-comparison.ts**](./methodology-comparison.ts) - Compare different training philosophies
- [**multi-format-export.ts**](./multi-format-export.ts) - Export plans to various formats

## Training Methodology Examples

- [**daniels-plan-examples.ts**](./daniels-plan-examples.ts) - Jack Daniels methodology examples for various scenarios
- [**lydiard-plan-examples.ts**](./lydiard-plan-examples.ts) - Arthur Lydiard system demonstrations
- [**pfitzinger-plan-examples.ts**](./pfitzinger-plan-examples.ts) - Pete Pfitzinger approach examples

## Interactive Demonstrations

- [**interactive-methodology-demo.ts**](./interactive-methodology-demo.ts) - Comprehensive interactive methodology showcase
- [**methodology-customization-showcase.ts**](./methodology-customization-showcase.ts) - Advanced customization examples

## Advanced Examples

- [**adaptive-training.ts**](./adaptive-training.ts) - Implement adaptive plan modifications
- [**season-planning.ts**](./season-planning.ts) - Multi-race season management
- [**performance-monitoring.ts**](./performance-monitoring.ts) - Track and optimize performance
- [**logging-integration-examples.ts**](./logging-integration-examples.ts) - Configurable logging system integration patterns

## Integration Examples

- [**coach-dashboard.ts**](./coach-dashboard.ts) - Coach management interface
- [**athlete-app.ts**](./athlete-app.ts) - Athlete mobile app integration
- [**api-server.ts**](./api-server.ts) - REST API server implementation

## Platform Examples

- [**trainingpeaks-sync.ts**](./trainingpeaks-sync.ts) - TrainingPeaks integration
- [**strava-export.ts**](./strava-export.ts) - Strava activity creation
- [**garmin-connect.ts**](./garmin-connect.ts) - Garmin Connect IQ integration

## Running Examples

```bash
# Install dependencies
npm install

# Run TypeScript examples directly
npx ts-node examples/basic-plan-generation.ts

# Run methodology-specific examples
npx ts-node examples/daniels-plan-examples.ts
npx ts-node examples/lydiard-plan-examples.ts
npx ts-node examples/pfitzinger-plan-examples.ts

# Run interactive demonstrations
npx ts-node examples/interactive-methodology-demo.ts
npx ts-node examples/methodology-customization-showcase.ts

# Run logging integration examples
npx ts-node examples/logging-integration-examples.ts

# Or compile and run
npm run build
node dist/examples/basic-plan-generation.js
```

## Methodology-Specific Examples

Each methodology example file demonstrates:

- **Daniels Examples**: VDOT-based training, 80/20 intensity distribution, precise pace calculations
- **Lydiard Examples**: Aerobic base building, hill training, conservative progression
- **Pfitzinger Examples**: Lactate threshold focus, medium-long runs, systematic progression

## Interactive Features

The interactive examples provide:
- Step-by-step methodology comparison
- Real athlete scenarios and solutions
- Customization options demonstration
- Export format examples
- Research validation insights

## System Integration Examples

The logging integration examples demonstrate:

- **LoggableOptions Usage**: Custom options with configurable logging for any system
- **Export System Integration**: Automatic logging capabilities through BaseExportOptions  
- **Error Handling Integration**: Options-aware error handlers with consistent logging
- **Environment Configurations**: Preset-based logging for development, production, and testing
- **Migration Patterns**: Best practices for moving from console statements to configurable logging

## Example Data

All examples use realistic sample data that demonstrates proper API usage patterns and best practices. The methodology examples show how each system adapts to different runner profiles, goals, and constraints.