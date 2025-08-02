/**
 * Training Methodology Comparison Example
 * 
 * Demonstrates how different training philosophies (Daniels, Lydiard, Pfitzinger)
 * create different plan structures and workout distributions for the same athlete.
 */

import { AdvancedTrainingPlanGenerator } from '../src/advanced-generator';
import { PhilosophyFactory } from '../src/philosophies';
import { calculateTrainingPaces } from '../src/zones';
import type { AdvancedPlanConfig, TrainingPlan } from '../src/types';

async function compareMethodologies() {
  console.log('🔬 Training Methodology Comparison\n');

  // Base configuration that will be used for all methodologies
  const baseConfig: Omit<AdvancedPlanConfig, 'methodology'> = {
    name: 'Marathon Training Comparison',
    goal: 'MARATHON',
    startDate: new Date(),
    targetDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000), // 16 weeks
    
    currentFitness: {
      vdot: 50, // Experienced runner
      weeklyMileage: 50, // Solid base
      longestRecentRun: 20,
      trainingAge: 5,
      overallScore: 73 // VDOT: 62.5 + Volume: 50 + Experience: 100 + Recovery: 75 * weights = 73
    },
    
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6, 0], // All week
      preferredIntensity: 'moderate',
      crossTraining: false,
      strengthTraining: true
    },

    intensityDistribution: { easy: 0.8, moderate: 0.15, hard: 0.05 },
    periodization: 'linear',
    targetRaces: [{
      name: 'Target Marathon',
      date: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
      distance: 42.2,
      priority: 'A',
      targetTime: 210, // 3:30 marathon
      conditions: { temperature: 15, humidity: 60, wind: 5, elevation: 0 }
    }]
  };

  const methodologies = ['daniels', 'lydiard', 'pfitzinger'] as const;
  const plans: Record<string, TrainingPlan> = {};
  const comparisons: Record<string, any> = {};

  // Generate plans for each methodology
  for (const methodology of methodologies) {
    console.log(`🔄 Generating ${methodology} plan...`);
    
    const config: AdvancedPlanConfig = {
      ...baseConfig,
      methodology,
      name: `${methodology} Marathon Plan`
    };
    
    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    plans[methodology] = plan;
    
    // Analyze plan characteristics
    const workoutTypes = plan.workouts.reduce((counts: Record<string, number>, workout) => {
      counts[workout.type] = (counts[workout.type] || 0) + 1;
      return counts;
    }, {});
    
    const totalWorkouts = plan.workouts.length;
    const easyWorkouts = (workoutTypes.easy || 0) + (workoutTypes.recovery || 0);
    const hardWorkouts = (workoutTypes.threshold || 0) + (workoutTypes.vo2max || 0) + (workoutTypes.speed || 0);
    const moderateWorkouts = totalWorkouts - easyWorkouts - hardWorkouts;
    
    comparisons[methodology] = {
      totalWorkouts,
      totalDistance: plan.summary.totalDistance,
      averageWeeklyDistance: plan.summary.averageWeeklyDistance,
      peakWeeklyDistance: plan.summary.peakWeeklyDistance,
      intensityDistribution: {
        easy: Math.round((easyWorkouts / totalWorkouts) * 100),
        moderate: Math.round((moderateWorkouts / totalWorkouts) * 100),
        hard: Math.round((hardWorkouts / totalWorkouts) * 100)
      },
      workoutTypes,
      longRuns: workoutTypes.long_run || 0,
      tempoRuns: workoutTypes.tempo || 0,
      thresholdRuns: workoutTypes.threshold || 0
    };
    
    console.log(`✅ ${methodology} plan generated\n`);
  }

  // Display detailed comparison
  console.log('📊 Methodology Comparison Results\n');
  
  // Volume comparison
  console.log('📏 Volume Comparison:');
  console.log('Methodology'.padEnd(12) + 'Total km'.padEnd(10) + 'Avg/Week'.padEnd(10) + 'Peak Week');
  console.log('-'.repeat(50));
  
  methodologies.forEach(methodology => {
    const data = comparisons[methodology];
    console.log(
      methodology.padEnd(12) + 
      Math.round(data.totalDistance).toString().padEnd(10) +
      Math.round(data.averageWeeklyDistance).toString().padEnd(10) +
      Math.round(data.peakWeeklyDistance).toString()
    );
  });
  
  console.log('\n🎯 Intensity Distribution:');
  console.log('Methodology'.padEnd(12) + 'Easy %'.padEnd(8) + 'Moderate %'.padEnd(12) + 'Hard %');
  console.log('-'.repeat(50));
  
  methodologies.forEach(methodology => {
    const dist = comparisons[methodology].intensityDistribution;
    console.log(
      methodology.padEnd(12) + 
      `${dist.easy}%`.padEnd(8) +
      `${dist.moderate}%`.padEnd(12) +
      `${dist.hard}%`
    );
  });
  
  console.log('\n🏃‍♂️ Key Workout Types:');
  console.log('Methodology'.padEnd(12) + 'Long Runs'.padEnd(12) + 'Tempo'.padEnd(8) + 'Threshold');
  console.log('-'.repeat(50));
  
  methodologies.forEach(methodology => {
    const data = comparisons[methodology];
    console.log(
      methodology.padEnd(12) + 
      data.longRuns.toString().padEnd(12) +
      data.tempoRuns.toString().padEnd(8) +
      data.thresholdRuns.toString()
    );
  });

  // Philosophy-specific insights
  console.log('\n🧠 Philosophy-Specific Insights:\n');
  
  // Daniels insights
  const danielsPhilosophy = PhilosophyFactory.create('daniels');
  console.log('📚 Jack Daniels Approach:');
  console.log('- VDOT-based training with precise pace calculations');
  console.log('- 80/20 easy/hard distribution philosophy');
  console.log('- Scientific approach to training intensities');
  
  const danielsPaces = calculateTrainingPaces(50);
  console.log('- Training paces for VDOT 50:');
  Object.entries(danielsPaces).forEach(([type, pace]) => {
    console.log(`  ${type}: ${pace.toFixed(1)} min/km`);
  });
  
  console.log('\n🏔️ Arthur Lydiard System:');
  console.log('- Strong aerobic base emphasis (85% easy running)');
  console.log('- Hill training integration for strength');
  console.log('- Long steady runs for aerobic development');
  console.log('- Conservative approach to high-intensity work');
  
  console.log('\n🎯 Pete Pfitzinger Approach:');
  console.log('- Lactate threshold focus for marathon training');
  console.log('- Medium-long runs (75-85% of long run distance)');
  console.log('- Tune-up races integrated into training');
  console.log('- Higher moderate intensity percentage');

  // Sample week comparison
  console.log('\n📅 Sample Week Comparison (Week 8):\n');
  
  methodologies.forEach(methodology => {
    const plan = plans[methodology];
    const week8Workouts = plan.workouts.filter(workout => {
      const weekNumber = Math.floor((workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weekNumber === 7; // Week 8 (0-indexed)
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    console.log(`${methodology.toUpperCase()} - Week 8:`);
    week8Workouts.forEach((workout, index) => {
      const day = workout.date.toLocaleDateString('en-US', { weekday: 'short' });
      console.log(`  ${day}: ${workout.type} - ${workout.targetMetrics.duration}min (${Math.round(workout.targetMetrics.distance || 0)}km)`);
    });
    
    const weeklyDistance = week8Workouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    console.log(`  Total: ${Math.round(weeklyDistance)}km\n`);
  });

  // Recommendations
  console.log('💡 Methodology Selection Guide:\n');
  
  console.log('Choose DANIELS if:');
  console.log('- You prefer scientific, data-driven training');
  console.log('- You have access to pace/heart rate monitoring');
  console.log('- You want precise training zones');
  console.log('- You race frequently at various distances\n');
  
  console.log('Choose LYDIARD if:');
  console.log('- You prioritize building a strong aerobic base');
  console.log('- You prefer higher volume, lower intensity');
  console.log('- You have time for longer training cycles');
  console.log('- You want to minimize injury risk\n');
  
  console.log('Choose PFITZINGER if:');
  console.log('- You are training specifically for marathon distance');
  console.log('- You can handle moderate-to-high training volumes');
  console.log('- You want to incorporate tune-up races');
  console.log('- You prefer a balanced intensity approach\n');

  // Performance comparison simulation
  console.log('🏆 Projected Performance Impact:\n');
  
  const baseMarathonTime = 3.5; // hours (baseline performance)
  
  methodologies.forEach(methodology => {
    const data = comparisons[methodology];
    let projectedImprovement = 0;
    
    // Simple model based on methodology characteristics
    if (methodology === 'daniels') {
      projectedImprovement = 0.05; // 5% improvement from precision
    } else if (methodology === 'lydiard') {
      projectedImprovement = 0.07; // 7% improvement from aerobic base
    } else if (methodology === 'pfitzinger') {
      projectedImprovement = 0.06; // 6% improvement from specificity
    }
    
    const projectedTime = baseMarathonTime * (1 - projectedImprovement);
    const minutes = Math.floor((projectedTime % 1) * 60);
    const hours = Math.floor(projectedTime);
    
    console.log(`${methodology}: ${hours}:${minutes.toString().padStart(2, '0')}:00 (${(projectedImprovement * 100).toFixed(1)}% improvement)`);
  });

  console.log('\n✨ Comparison complete! Each methodology offers unique advantages based on your goals and preferences.');
}

// Export for use in other examples
export { compareMethodologies };

// Run if called directly
if (require.main === module) {
  compareMethodologies().catch(console.error);
}