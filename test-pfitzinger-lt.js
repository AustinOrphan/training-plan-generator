// Quick test for Pfitzinger LT implementation
import { PhilosophyFactory } from './src/philosophies.js';
import { generateBasePlan } from './src/generator.js';

console.log('Testing Pfitzinger LT implementation...');

try {
  // Create Pfitzinger philosophy
  const pfitz = PhilosophyFactory.create('pfitzinger');
  console.log('✓ Created Pfitzinger philosophy');

  // Create a simple plan config
  const config = {
    name: 'Test LT Plan',
    goal: 'MARATHON',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-01'),
    currentFitness: {
      vdot: 50,
      weeklyMileage: 40,
      longestRecentRun: 15
    },
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6],
      preferredIntensity: 'moderate',
      crossTraining: false,
      strengthTraining: false
    },
    environment: {
      terrain: 'mixed'
    }
  };

  // Generate base plan
  const basePlan = generateBasePlan(config);
  console.log('✓ Generated base plan');

  // Enhance with Pfitzinger philosophy
  const enhancedPlan = pfitz.enhancePlan(basePlan);
  console.log('✓ Enhanced plan with Pfitzinger methodology');

  // Check for LT-based features
  const hasLTWorkouts = enhancedPlan.workouts.some(w => 
    w.name.toLowerCase().includes('threshold') || 
    w.description.toLowerCase().includes('lactate')
  );
  
  console.log(`✓ Plan has LT-focused workouts: ${hasLTWorkouts}`);
  console.log(`✓ Total workouts: ${enhancedPlan.workouts.length}`);
  console.log(`✓ Plan ID: ${enhancedPlan.id}`);
  
  // Sample a few workouts to check structure
  const sampleWorkouts = enhancedPlan.workouts.slice(0, 3);
  sampleWorkouts.forEach((workout, i) => {
    console.log(`  Workout ${i + 1}: ${workout.name} - ${workout.type}`);
  });

  console.log('\n✅ Pfitzinger LT implementation test completed successfully!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}