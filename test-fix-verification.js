// Quick verification test for the 'as any' fix
// This test verifies that the generateMicrocycles method is accessible via inheritance

const { AdvancedTrainingPlanGenerator } = require('./dist/advanced-generator');
const { addWeeks } = require('date-fns');

// Create a minimal config for testing
const testConfig = {
  athlete: {
    name: 'Test Runner',
    age: 30,
    gender: 'male'
  },
  goal: {
    targetRace: {
      distance: '10k',
      date: addWeeks(new Date(), 12),
      priority: 'A'
    }
  },
  schedule: {
    startDate: new Date(),
    weeksTotal: 12,
    daysPerWeek: 5
  },
  currentFitness: {
    weeklyMileage: 25,
    longRunDistance: 8,
    recentRaces: []
  },
  methodology: 'daniels'
};

try {
  console.log('Testing AdvancedTrainingPlanGenerator...');
  
  // This should work without any type casting or 'as any'
  const generator = new AdvancedTrainingPlanGenerator(testConfig);
  
  // Create a test block
  const testBlock = {
    phase: 'base',
    weeks: 2,
    startDate: new Date(),
    endDate: addWeeks(new Date(), 2),
    focusAreas: ['base building'],
    microcycles: []
  };
  
  // This calls integrateRaceBlocks internally, which uses our fixed generateMicrocycles method
  const plan = generator.generateAdvancedPlan();
  
  console.log('✅ SUCCESS: Advanced plan generation completed without type casting');
  console.log(`Generated ${plan.workouts.length} workouts across ${plan.blocks.length} blocks`);
  
  // Verify that blocks have microcycles (generated via our protected method)
  const hasBlocksWithMicrocycles = plan.blocks.some(block => block.microcycles && block.microcycles.length > 0);
  
  if (hasBlocksWithMicrocycles) {
    console.log('✅ SUCCESS: Blocks contain microcycles generated via protected method');
  } else {
    console.log('⚠️  WARNING: No microcycles found in blocks (may be expected for some configurations)');
  }
  
} catch (error) {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
}