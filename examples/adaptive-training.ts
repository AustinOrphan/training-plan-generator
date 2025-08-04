/**
 * Adaptive Training Example
 * 
 * Demonstrates how to implement adaptive plan modifications based on
 * real-time progress data, recovery metrics, and performance feedback.
 */

import { AdvancedTrainingPlanGenerator } from '../src/advanced-generator';
import { SmartAdaptationEngine } from '../src/adaptation';
import type { AdvancedPlanConfig, ProgressData, TrainingPlan } from '../src/types';

async function adaptiveTrainingExample() {
  console.log('🔄 Adaptive Training Plan Example\n');

  // 1. Create initial training plan
  const config: AdvancedPlanConfig = {
    name: 'Adaptive Marathon Training',
    goal: 'MARATHON',
    startDate: new Date(),
    targetDate: new Date(Date.now() + 18 * 7 * 24 * 60 * 60 * 1000), // 18 weeks
    
    currentFitness: {
      vdot: 47,
      weeklyMileage: 40,
      longestRecentRun: 22,
      trainingAge: 4,
      recoveryRate: 72,
      overallScore: 69 // VDOT: 58.8 + Volume: 40 + Experience: 80 + Recovery: 72 * weights = 69
    },
    
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6, 7],
      preferredIntensity: 'moderate'
    },
    
    methodology: 'daniels',
    intensityDistribution: { easy: 0.8, moderate: 0.15, hard: 0.05 },
    periodization: 'linear',
    targetRaces: [{
      name: 'Target Marathon',
      date: new Date(Date.now() + 18 * 7 * 24 * 60 * 60 * 1000),
      distance: 42.2,
      priority: 'A',
      targetTime: 220, // 3:40 marathon
      conditions: { temperature: 15, humidity: 60, wind: 5, elevation: 0 }
    }],
    adaptationEnabled: true,
    progressTracking: true
  };

  console.log('📋 Initial Plan Configuration:');
  console.log(`- Goal: ${config.goal}`);
  console.log(`- Methodology: ${config.methodology}`);
  console.log(`- Current VDOT: ${config.currentFitness?.vdot}`);
  console.log(`- Weekly Mileage: ${config.currentFitness?.weeklyMileage} km\n`);

  // Generate initial plan
  const generator = new AdvancedTrainingPlanGenerator(config);
  const initialPlan = await generator.generateAdvancedPlan();
  
  console.log('✅ Initial plan generated');
  console.log(`- Total workouts: ${initialPlan.summary.totalWorkouts}`);
  console.log(`- Average weekly distance: ${Math.round(initialPlan.summary.averageWeeklyDistance)} km\n`);

  // 2. Set up adaptive engine
  const adaptationEngine = new SmartAdaptationEngine({
    enabled: true,
    sensitivityLevel: 'medium',
    recoveryThreshold: 70,
    workloadThreshold: 1.3,
    autoAdjustments: false,
    userApprovalRequired: true,
    maxVolumeReduction: 25,
    maxIntensityReduction: 20
  });

  console.log('🧠 Adaptation Engine Configured:');
  console.log('- Sensitivity: Medium');
  console.log('- Recovery threshold: 70%');
  console.log('- Manual approval required\n');

  // 3. Simulate 3 weeks of training with varied recovery
  const progressHistory: ProgressData[] = [];
  const weekScenarios = [
    { week: 1, scenario: 'good', description: 'Strong start with good recovery' },
    { week: 2, scenario: 'tired', description: 'Accumulated fatigue from increased volume' },
    { week: 3, scenario: 'sick', description: 'Minor illness affecting training' }
  ];

  for (const { week, scenario, description } of weekScenarios) {
    console.log(`🗓️ Week ${week}: ${description}\n`);
    
    // Get week's planned workouts
    const weekWorkouts = initialPlan.workouts.filter(workout => {
      const weekNumber = Math.floor((workout.date.getTime() - initialPlan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weekNumber === week - 1;
    });

    // Simulate completing each workout with scenario-based outcomes
    for (const [index, plannedWorkout] of weekWorkouts.entries()) {
      let completionData;
      let recoveryMetrics;

      switch (scenario) {
        case 'good':
          completionData = {
            plannedWorkout,
            actualDuration: plannedWorkout.targetMetrics.duration,
            actualDistance: plannedWorkout.targetMetrics.distance || 0,
            completionRate: 1.0,
            adherence: 'complete' as const,
            difficultyRating: 5,
            paceDeviation: 0
          };
          recoveryMetrics = {
            recoveryScore: 85 - (index * 2), // Slight decline through week
            sleepQuality: 80,
            sleepDuration: 7.5,
            stressLevel: 20,
            muscleSoreness: 2,
            energyLevel: 8,
            motivation: 9
          };
          break;
          
        case 'tired':
          completionData = {
            plannedWorkout,
            actualDuration: plannedWorkout.targetMetrics.duration * 0.9,
            actualDistance: (plannedWorkout.targetMetrics.distance || 0) * 0.85,
            completionRate: 0.85,
            adherence: 'partial' as const,
            difficultyRating: 7,
            paceDeviation: 10 // 10% slower than target
          };
          recoveryMetrics = {
            recoveryScore: 65 - (index * 3), // Poor recovery
            sleepQuality: 70,
            sleepDuration: 6.5,
            stressLevel: 40,
            muscleSoreness: 5,
            energyLevel: 5,
            motivation: 6
          };
          break;
          
        case 'sick':
          if (index < 2) { // Skip first two workouts
            completionData = {
              plannedWorkout,
              actualDuration: 0,
              actualDistance: 0,
              completionRate: 0,
              adherence: 'missed' as const,
              difficultyRating: 0,
              paceDeviation: 0
            };
            recoveryMetrics = {
              recoveryScore: 45,
              sleepQuality: 60,
              sleepDuration: 8.5, // More sleep when sick
              stressLevel: 60,
              muscleSoreness: 6,
              energyLevel: 3,
              motivation: 4
            };
          } else { // Light return to training
            completionData = {
              plannedWorkout,
              actualDuration: plannedWorkout.targetMetrics.duration * 0.6,
              actualDistance: (plannedWorkout.targetMetrics.distance || 0) * 0.5,
              completionRate: 0.5,
              adherence: 'modified' as const,
              difficultyRating: 3,
              paceDeviation: 20 // Much slower return
            };
            recoveryMetrics = {
              recoveryScore: 60,
              sleepQuality: 65,
              sleepDuration: 8,
              stressLevel: 50,
              muscleSoreness: 4,
              energyLevel: 5,
              motivation: 6
            };
          }
          break;
      }

      const progressEntry: ProgressData = {
        date: plannedWorkout.date,
        completedWorkout: completionData,
        recoveryMetrics
      };

      progressHistory.push(progressEntry);

      const day = plannedWorkout.date.toLocaleDateString('en-US', { weekday: 'short' });
      console.log(`  ${day}: ${plannedWorkout.name}`);
      console.log(`    Planned: ${plannedWorkout.targetMetrics.duration}min, ${Math.round(plannedWorkout.targetMetrics.distance || 0)}km`);
      console.log(`    Actual: ${completionData.actualDuration}min, ${Math.round(completionData.actualDistance)}km`);
      console.log(`    Recovery: ${recoveryMetrics.recoveryScore}%, Energy: ${recoveryMetrics.energyLevel}/10`);
    }

    // Analyze progress and get recommendations
    const weekProgress = progressHistory.slice(-weekWorkouts.length);
    const analysis = adaptationEngine.analyzeProgress(weekProgress, weekWorkouts);
    const modifications = adaptationEngine.suggestModifications(initialPlan, analysis);

    console.log(`\n📊 Week ${week} Analysis:`);
    console.log(`- Adherence Rate: ${(analysis.adherenceRate * 100).toFixed(1)}%`);
    console.log(`- Performance Trend: ${analysis.performanceTrend}`);
    console.log(`- Current VDOT: ${analysis.currentFitness.vdot.toFixed(1)}`);
    console.log(`- Weekly Mileage: ${analysis.currentFitness.weeklyMileage.toFixed(1)}km`);

    if (modifications.length > 0) {
      console.log('\n🔧 Recommended Modifications:');
      modifications.forEach((mod, index) => {
        console.log(`${index + 1}. ${mod.type.toUpperCase()}: ${mod.description}`);
        console.log(`   Rationale: ${mod.rationale}`);
        console.log(`   Confidence: ${(mod.confidence * 100).toFixed(0)}%`);
      });
      
      // Simulate user approval
      const approvedModifications = modifications.filter(mod => mod.confidence > 0.7);
      if (approvedModifications.length > 0) {
        console.log(`\n✅ Applied ${approvedModifications.length} high-confidence modifications`);
      }
    } else {
      console.log('\n✅ No modifications needed - training progressing well');
    }
    
    console.log('\n' + '-'.repeat(60) + '\n');
  }

  // 4. Show adaptation summary
  console.log('📈 Adaptation Summary\n');
  
  const finalAnalysis = adaptationEngine.analyzeProgress(progressHistory, initialPlan.workouts);
  console.log('Overall Progress:');
  console.log(`- Overall Adherence: ${(finalAnalysis.adherenceRate * 100).toFixed(1)}%`);
  console.log(`- Performance Trend: ${finalAnalysis.performanceTrend}`);
  console.log(`- Final VDOT: ${finalAnalysis.currentFitness.vdot.toFixed(1)}`);
  console.log(`- Final Weekly Mileage: ${finalAnalysis.currentFitness.weeklyMileage.toFixed(1)}km`);

  // Calculate adaptation metrics
  const totalPlannedWorkouts = progressHistory.length;
  const completedWorkouts = progressHistory.filter(p => p.completedWorkout.adherence === 'complete').length;
  const partialWorkouts = progressHistory.filter(p => p.completedWorkout.adherence === 'partial').length;
  const missedWorkouts = progressHistory.filter(p => p.completedWorkout.adherence === 'missed').length;

  console.log('\nWorkout Completion:');
  console.log(`- Completed: ${completedWorkouts}/${totalPlannedWorkouts} (${((completedWorkouts/totalPlannedWorkouts)*100).toFixed(1)}%)`);
  console.log(`- Partial: ${partialWorkouts} (${((partialWorkouts/totalPlannedWorkouts)*100).toFixed(1)}%)`);
  console.log(`- Missed: ${missedWorkouts} (${((missedWorkouts/totalPlannedWorkouts)*100).toFixed(1)}%)`);

  // Recovery insights
  const avgRecovery = progressHistory.reduce((sum, p) => sum + p.recoveryMetrics.recoveryScore, 0) / progressHistory.length;
  const avgEnergy = progressHistory.reduce((sum, p) => sum + p.recoveryMetrics.energyLevel, 0) / progressHistory.length;

  console.log('\nRecovery Insights:');
  console.log(`- Average Recovery Score: ${avgRecovery.toFixed(1)}%`);
  console.log(`- Average Energy Level: ${avgEnergy.toFixed(1)}/10`);
  console.log(`- Sleep Quality Trend: ${progressHistory[progressHistory.length-1].recoveryMetrics.sleepQuality}%`);

  // 5. Generate adapted plan for next phase
  console.log('\n🔄 Generating Adapted Plan for Next Phase...\n');
  
  // Update fitness metrics based on progress
  const adaptedConfig: AdvancedPlanConfig = {
    ...config,
    name: 'Adapted Marathon Training - Phase 2',
    startDate: new Date(Date.now() + 3 * 7 * 24 * 60 * 60 * 1000), // Continue from week 4
    currentFitness: {
      ...config.currentFitness!,
      vdot: config.currentFitness!.vdot + 1, // Slight improvement
      weeklyMileage: config.currentFitness!.weeklyMileage * 0.9, // Reduce based on recent struggles
      recoveryRate: avgRecovery // Update based on actual recovery
    }
  };

  const adaptedGenerator = new AdvancedTrainingPlanGenerator(adaptedConfig);
  const adaptedPlan = await adaptedGenerator.generateAdvancedPlan();

  console.log('✅ Adapted Plan Generated:');
  console.log(`- Adjusted weekly volume: ${Math.round(adaptedPlan.summary.averageWeeklyDistance)} km (vs ${Math.round(initialPlan.summary.averageWeeklyDistance)} km)`);
  console.log(`- Volume change: ${((adaptedPlan.summary.averageWeeklyDistance / initialPlan.summary.averageWeeklyDistance - 1) * 100).toFixed(1)}%`);

  console.log('\n💡 Key Adaptations Made:');
  console.log('- Reduced weekly volume based on adherence challenges');
  console.log('- Adjusted intensity distribution for better recovery');
  console.log('- Updated fitness parameters based on actual performance');
  console.log('- Maintained goal timeline with modified approach');

  console.log('\n🎯 Adaptive Training Best Practices:');
  console.log('1. Monitor recovery metrics daily');
  console.log('2. Track workout completion rates and difficulty');
  console.log('3. Allow flexibility in weekly volume (±20%)');
  console.log('4. Prioritize consistency over peak performance');
  console.log('5. Adjust plans proactively, not reactively');
  console.log('6. Consider external stressors in adaptation decisions');

  console.log('\n✨ Adaptive training enables personalized optimization while maintaining long-term progression!');
}

// Export for use in other examples
export { adaptiveTrainingExample };

// Run if called directly
if (require.main === module) {
  adaptiveTrainingExample().catch(console.error);
}