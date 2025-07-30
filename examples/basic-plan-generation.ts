/**
 * Basic Plan Generation Example
 * 
 * Demonstrates the simplest way to create a training plan using the
 * enhanced API with different methodologies and export options.
 */

import {
  AdvancedTrainingPlanGenerator,
  MultiFormatExporter,
  type AdvancedPlanConfig
} from '../src/index';

async function basicPlanGeneration() {
  console.log('🏃‍♂️ Training Plan Generator - Basic Example\n');

  // 1. Create a basic training plan configuration
  const config: AdvancedPlanConfig = {
    name: 'Half Marathon Training Plan',
    description: 'A science-based 12-week half marathon training program',
    goal: 'HALF_MARATHON',
    startDate: new Date(),
    targetDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000), // 12 weeks from now
    
    // Current fitness assessment
    currentFitness: {
      vdot: 45, // Estimated from recent 5K time
      criticalSpeed: 12.5, // km/h
      weeklyMileage: 30, // Current weekly volume
      longestRecentRun: 15, // km
      trainingAge: 2, // years of consistent running
      injuryHistory: [], // No recent injuries
      recoveryRate: 75 // Good recovery capacity
    },
    
    // Training preferences
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6], // Monday through Saturday
      preferredIntensity: 'moderate',
      crossTraining: false,
      strengthTraining: true,
      timeConstraints: {
        1: 60, // Monday: 60 minutes
        2: 45, // Tuesday: 45 minutes
        3: 60, // Wednesday: 60 minutes
        4: 45, // Thursday: 45 minutes
        5: 90, // Friday: 90 minutes
        6: 120 // Saturday: 120 minutes (long run day)
      }
    },
    
    // Enhanced features
    methodology: 'daniels', // Use Jack Daniels' methodology
    adaptationEnabled: true,
    progressTracking: true,
    exportFormats: ['pdf', 'ical', 'csv']
  };

  console.log('📋 Configuration:');
  console.log(`- Goal: ${config.goal}`);
  console.log(`- Duration: ${Math.round((config.targetDate.getTime() - config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))} weeks`);
  console.log(`- Methodology: ${config.methodology}`);
  console.log(`- Current VDOT: ${config.currentFitness?.vdot}`);
  console.log(`- Weekly Mileage: ${config.currentFitness?.weeklyMileage} km\n`);

  // 2. Generate the training plan
  console.log('🔄 Generating training plan...');
  const startTime = Date.now();
  
  const generator = new AdvancedTrainingPlanGenerator(config);
  const plan = await generator.generateAdvancedPlan();
  
  const generationTime = Date.now() - startTime;
  console.log(`✅ Plan generated in ${generationTime}ms\n`);

  // 3. Display plan summary
  console.log('📊 Plan Summary:');
  console.log(`- Total Weeks: ${plan.summary.totalWeeks}`);
  console.log(`- Total Workouts: ${plan.summary.totalWorkouts}`);
  console.log(`- Total Distance: ${Math.round(plan.summary.totalDistance)} km`);
  console.log(`- Average Weekly Distance: ${Math.round(plan.summary.averageWeeklyDistance)} km`);
  console.log(`- Peak Weekly Distance: ${Math.round(plan.summary.peakWeeklyDistance)} km`);
  console.log(`- Key Workouts: ${plan.summary.keyWorkouts}`);
  console.log(`- Recovery Days: ${plan.summary.recoveryDays}\n`);

  // 4. Show first week's workouts
  console.log('📅 First Week Workouts:');
  const firstWeekWorkouts = plan.workouts
    .filter(workout => {
      const weeksDiff = Math.floor((workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weeksDiff === 0;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  firstWeekWorkouts.forEach((workout, index) => {
    const dayName = workout.date.toLocaleDateString('en-US', { weekday: 'long' });
    console.log(`${index + 1}. ${dayName}: ${workout.name}`);
    console.log(`   Type: ${workout.type} | Duration: ${workout.targetMetrics.duration}min | TSS: ${workout.targetMetrics.tss}`);
    console.log(`   ${workout.description}\n`);
  });

  // 5. Export to different formats
  console.log('📤 Exporting plan to multiple formats...');
  const exporter = new MultiFormatExporter();

  try {
    // Export to PDF
    const pdfResult = await exporter.export(plan, 'pdf', {
      includePaces: true,
      includeHeartRates: true
    });
    console.log(`✅ PDF exported: ${pdfResult.filename} (${Math.round(pdfResult.size / 1024)} KB)`);

    // Export to Calendar
    const icalResult = await exporter.export(plan, 'ical', {
      timeZone: 'America/New_York'
    });
    console.log(`✅ Calendar exported: ${icalResult.filename} (${icalResult.metadata.totalWorkouts} events)`);

    // Export to CSV for analysis
    const csvResult = await exporter.export(plan, 'csv', {
      units: 'metric'
    });
    console.log(`✅ CSV exported: ${csvResult.filename} (${Math.round(csvResult.size / 1024)} KB)`);

    // Export to JSON for API integration
    const jsonResult = await exporter.export(plan, 'json');
    console.log(`✅ JSON exported: ${jsonResult.filename} (${Math.round(jsonResult.size / 1024)} KB)`);

  } catch (error) {
    console.error('❌ Export error:', error.message);
  }

  console.log('\n🎉 Basic plan generation complete!');
  console.log('\nNext steps:');
  console.log('- Review the generated PDF for detailed workout descriptions');
  console.log('- Import the iCal file into your calendar app');
  console.log('- Use the CSV file for progress tracking and analysis');
  console.log('- Implement adaptive modifications based on progress data');
}

// Example of error handling
async function runWithErrorHandling() {
  try {
    await basicPlanGeneration();
  } catch (error) {
    console.error('❌ Plan generation failed:', error.message);
    
    if (error.code === 'INVALID_CONFIG') {
      console.log('💡 Tip: Check your configuration parameters');
    } else if (error.code === 'CALCULATION_ERROR') {
      console.log('💡 Tip: Verify your fitness metrics are realistic');
    }
  }
}

// Run the example
if (require.main === module) {
  runWithErrorHandling();
}

export { basicPlanGeneration };