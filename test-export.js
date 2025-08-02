const { AdvancedTrainingPlanGenerator, MultiFormatExporter } = require('./dist/index.js');

async function testExport() {
  // Create a plan with advanced features
  const config = {
    name: 'Smart 10K Plan',
    goal: 'IMPROVE_5K',
    startDate: new Date('2025-08-01'),
    targetDate: new Date('2025-10-01'),
    currentFitness: {
      weeklyMileage: 25,
      longestRecentRun: 10,
      vdot: 48
    },
    methodology: 'daniels' // Using Daniels methodology
  };

  console.log('🚀 Generating advanced plan with Daniels methodology...\n');
  const generator = new AdvancedTrainingPlanGenerator(config);
  const plan = generator.generateAdvancedPlan();
  
  console.log(`✅ Advanced plan generated!`);
  console.log(`📚 Methodology: Daniels' Running Formula`);
  console.log(`🏃 Total workouts: ${plan.workouts.length}`);
  
  // Test export functionality
  const exporter = new MultiFormatExporter();
  
  console.log('\n📤 Testing export formats:');
  
  // Export to JSON
  const jsonExport = await exporter.exportPlan(plan, 'json');
  console.log(`  ✅ JSON export: ${jsonExport.filename} (${jsonExport.size} bytes)`);
  
  // Export to CSV
  const csvExport = await exporter.exportPlan(plan, 'csv');
  console.log(`  ✅ CSV export: ${csvExport.filename} (${csvExport.size} bytes)`);
  
  // Show sample workout from plan
  const sampleWorkout = plan.workouts.find(w => w.type === 'tempo') || plan.workouts[10];
  console.log('\n🏃 Sample workout:');
  console.log(`  Date: ${sampleWorkout.date.toLocaleDateString()}`);
  console.log(`  Type: ${sampleWorkout.type}`);
  console.log(`  Name: ${sampleWorkout.name}`);
  console.log(`  Duration: ${sampleWorkout.targetMetrics.duration} minutes`);
}

testExport().catch(console.error);