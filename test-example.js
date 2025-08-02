const { TrainingPlanGenerator } = require('./dist/index.js');

// Create a simple marathon training plan
const config = {
  name: 'Test Marathon Plan',
  goal: 'MARATHON',
  startDate: new Date('2025-08-01'),
  targetDate: new Date('2025-11-15'),
  currentFitness: {
    weeklyMileage: 30,
    longestRecentRun: 15,
    vdot: 45
  },
  preferences: {
    availableDays: [0, 2, 4, 6], // Sun, Tue, Thu, Sat
    preferredIntensity: 'moderate',
    crossTraining: false,
    strengthTraining: true
  }
};

console.log('Generating training plan...\n');
const generator = new TrainingPlanGenerator(config);
const plan = generator.generatePlan();

console.log(`✅ Plan generated: ${plan.summary.name}`);
console.log(`📅 Duration: ${plan.summary.weeks} weeks`);
console.log(`🏃 Total workouts: ${plan.workouts.length}`);
console.log(`📊 Phases: ${plan.blocks.map(b => b.phase).join(' → ')}`);
console.log(`\n📋 First week workouts:`);

// Show first week
plan.workouts.slice(0, 7).forEach(workout => {
  console.log(`  ${workout.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${workout.name} (${workout.targetMetrics.duration} min)`);
});

console.log(`\n🎯 Peak week volume: ${Math.max(...plan.blocks.flatMap(b => b.microcycles).map(m => m.totalDistance))} km`);