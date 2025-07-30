/**
 * Season Planning Example
 * 
 * Demonstrates how to create a comprehensive season plan with multiple races,
 * periodization phases, and coordinated training objectives.
 */

import {
  AdvancedTrainingPlanGenerator,
  type AdvancedPlanConfig,
  type TrainingPlan
} from '../src/index';

async function seasonPlanningExample() {
  console.log('🏃‍♂️ Season Planning Example\n');

  // Define racing season with multiple goals
  const seasonStart = new Date('2024-01-01');
  const seasonEnd = new Date('2024-10-31');
  
  const races = [
    {
      name: 'Spring 5K Time Trial',
      distance: '5K',
      date: new Date('2024-02-15'),
      priority: 'C', // Fitness test
      goalTime: { minutes: 18, seconds: 30 },
      description: 'Early season fitness assessment'
    },
    {
      name: 'City 10K Championship',
      distance: '10K',
      date: new Date('2024-04-20'),
      priority: 'B', // Important but not peak
      goalTime: { minutes: 38, seconds: 45 },
      description: 'Spring speed focus race'
    },
    {
      name: 'Half Marathon PR Attempt',
      distance: 'HALF_MARATHON',
      date: new Date('2024-06-15'),
      priority: 'A', // Major goal
      goalTime: { hours: 1, minutes: 22, seconds: 0 },
      description: 'Primary spring goal - PR attempt'
    },
    {
      name: 'Summer 5K Series',
      distance: '5K',
      date: new Date('2024-08-10'),
      priority: 'B', // Fun but competitive
      goalTime: { minutes: 17, seconds: 45 },
      description: 'Mid-season speed maintenance'
    },
    {
      name: 'Marathon Championship',
      distance: 'MARATHON',
      date: new Date('2024-10-15'),
      priority: 'A', // Season finale
      goalTime: { hours: 3, minutes: 0, seconds: 0 },
      description: 'Season culmination - marathon PR'
    }
  ];

  console.log('🗓️ Racing Schedule:');
  races.forEach((race, index) => {
    const timeStr = race.goalTime.hours ? 
      `${race.goalTime.hours}:${race.goalTime.minutes.toString().padStart(2, '0')}:${race.goalTime.seconds.toString().padStart(2, '0')}` :
      `${race.goalTime.minutes}:${race.goalTime.seconds.toString().padStart(2, '0')}`;
    console.log(`${index + 1}. ${race.date.toLocaleDateString()} - ${race.name}`);
    console.log(`   Distance: ${race.distance} | Priority: ${race.priority} | Goal: ${timeStr}`);
    console.log(`   ${race.description}\n`);
  });

  // Create base configuration
  const baseConfig = {
    currentFitness: {
      vdot: 50, // Solid club-level runner
      weeklyMileage: 50,
      longestRecentRun: 25,
      trainingAge: 6,
      recoveryRate: 78
    },
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6, 0], // All days available
      preferredIntensity: 'moderate',
      crossTraining: true,
      strengthTraining: true
    }
  };

  console.log('👤 Athlete Profile:');
  console.log(`- VDOT: ${baseConfig.currentFitness.vdot}`);
  console.log(`- Current volume: ${baseConfig.currentFitness.weeklyMileage} km/week`);
  console.log(`- Training experience: ${baseConfig.currentFitness.trainingAge} years`);
  console.log(`- Recovery capacity: ${baseConfig.currentFitness.recoveryRate}%\n`);

  // Generate periodized training phases
  const phases = [
    {
      name: 'Base Building Phase',
      startDate: seasonStart,
      endDate: new Date('2024-02-10'),
      focus: 'aerobic development',
      targetRace: races[0], // 5K time trial
      methodology: 'lydiard' as const,
      description: 'Build aerobic base and general strength'
    },
    {
      name: 'Spring Speed Phase',
      startDate: new Date('2024-02-11'),
      endDate: new Date('2024-04-15'),
      focus: 'speed and power',
      targetRace: races[1], // 10K championship
      methodology: 'daniels' as const,
      description: 'Develop speed and racing sharpness for 10K'
    },
    {
      name: 'Half Marathon Build',
      startDate: new Date('2024-04-21'),
      endDate: new Date('2024-06-10'),
      focus: 'threshold and tempo',
      targetRace: races[2], // Half marathon PR
      methodology: 'daniels' as const,
      description: 'Half marathon specific preparation'
    },
    {
      name: 'Summer Base & Speed',
      startDate: new Date('2024-06-16'),
      endDate: new Date('2024-08-31'),
      focus: 'mixed development',
      targetRace: races[3], // Summer 5K
      methodology: 'daniels' as const,
      description: 'Maintain fitness with speed emphasis'
    },
    {
      name: 'Marathon Preparation',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-10-10'),
      focus: 'marathon specific',
      targetRace: races[4], // Marathon championship
      methodology: 'pfitzinger' as const,
      description: 'Marathon-specific endurance and pacing'
    }
  ];

  console.log('📅 Training Phases:\n');
  
  const plans: TrainingPlan[] = [];
  let cumulativeDistance = 0;
  let cumulativeWorkouts = 0;

  for (const [index, phase] of phases.entries()) {
    console.log(`Phase ${index + 1}: ${phase.name}`);
    console.log(`Duration: ${phase.startDate.toLocaleDateString()} - ${phase.endDate.toLocaleDateString()}`);
    console.log(`Focus: ${phase.focus} | Methodology: ${phase.methodology}`);
    console.log(`Target Race: ${phase.targetRace.name}\n`);

    // Create phase-specific configuration
    const phaseConfig: AdvancedPlanConfig = {
      name: phase.name,
      description: phase.description,
      goal: phase.targetRace.distance as any,
      startDate: phase.startDate,
      targetDate: phase.targetRace.date,
      methodology: phase.methodology,
      
      // Progressive fitness development
      currentFitness: {
        ...baseConfig.currentFitness,
        vdot: baseConfig.currentFitness.vdot + (index * 1), // Gradual improvement
        weeklyMileage: index === 0 ? 
          baseConfig.currentFitness.weeklyMileage : 
          Math.min(baseConfig.currentFitness.weeklyMileage + (index * 8), 75), // Progressive volume
        recoveryRate: Math.max(baseConfig.currentFitness.recoveryRate - (index * 2), 70) // Account for accumulated fatigue
      },
      
      preferences: baseConfig.preferences,
      adaptationEnabled: true,
      progressTracking: true,
      exportFormats: ['pdf', 'ical']
    };

    // Generate phase plan
    console.log(`🔄 Generating ${phase.name}...`);
    const generator = new AdvancedTrainingPlanGenerator(phaseConfig);
    const phasePlan = await generator.generateAdvancedPlan();
    plans.push(phasePlan);

    // Phase summary
    const weeks = Math.ceil((phase.endDate.getTime() - phase.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    console.log(`✅ Phase completed: ${weeks} weeks, ${phasePlan.summary.totalWorkouts} workouts`);
    console.log(`   Total distance: ${Math.round(phasePlan.summary.totalDistance)} km`);
    console.log(`   Average weekly: ${Math.round(phasePlan.summary.averageWeeklyDistance)} km`);
    console.log(`   Peak week: ${Math.round(phasePlan.summary.peakWeeklyDistance)} km\n`);

    cumulativeDistance += phasePlan.summary.totalDistance;
    cumulativeWorkouts += phasePlan.summary.totalWorkouts;
  }

  // Season summary
  console.log('📊 Season Summary\n');
  console.log(`Total Training Duration: ${Math.round((seasonEnd.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000))} weeks`);
  console.log(`Total Workouts: ${cumulativeWorkouts}`);
  console.log(`Total Distance: ${Math.round(cumulativeDistance)} km`);
  console.log(`Average Weekly Distance: ${Math.round(cumulativeDistance / ((seasonEnd.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000)))} km`);

  // Phase progression analysis
  console.log('\n📈 Phase Progression:');
  console.log('Phase'.padEnd(25) + 'Weeks'.padEnd(8) + 'Avg/Week'.padEnd(12) + 'Peak Week'.padEnd(12) + 'Focus');
  console.log('-'.repeat(70));
  
  phases.forEach((phase, index) => {
    const plan = plans[index];
    const weeks = Math.ceil((phase.endDate.getTime() - phase.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    console.log(
      phase.name.padEnd(25) +
      weeks.toString().padEnd(8) +
      Math.round(plan.summary.averageWeeklyDistance).toString().padEnd(12) +
      Math.round(plan.summary.peakWeeklyDistance).toString().padEnd(12) +
      phase.focus
    );
  });

  // Volume periodization visualization
  console.log('\n📊 Volume Periodization (Weekly Averages):');
  const volumeGraph = phases.map((phase, index) => {
    const plan = plans[index];
    const volume = Math.round(plan.summary.averageWeeklyDistance);
    const bar = '█'.repeat(Math.floor(volume / 5));
    return `${phase.name.substring(0, 15).padEnd(15)}: ${bar} (${volume} km)`;
  });
  volumeGraph.forEach(line => console.log(line));

  // Race preparation timeline
  console.log('\n🏁 Race Preparation Timeline:\n');
  
  phases.forEach((phase, index) => {
    const race = phase.targetRace;
    const plan = plans[index];
    
    console.log(`${race.name} (${race.date.toLocaleDateString()})`);
    console.log(`├─ Priority: ${race.priority} race`);
    console.log(`├─ Preparation: ${phase.name}`);
    console.log(`├─ Training focus: ${phase.focus}`);
    console.log(`├─ Methodology: ${phase.methodology}`);
    console.log(`├─ Peak volume: ${Math.round(plan.summary.peakWeeklyDistance)} km/week`);
    
    // Taper strategy
    const weeksToRace = Math.ceil((race.date.getTime() - phase.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (race.priority === 'A') {
      console.log(`├─ Taper: 2-3 week structured taper`);
      console.log(`├─ Volume reduction: 40-50% in final week`);
    } else if (race.priority === 'B') {
      console.log(`├─ Taper: 1 week mini-taper`);
      console.log(`├─ Volume reduction: 25% in race week`);
    } else {
      console.log(`├─ Taper: No formal taper (training continues)`);
    }
    
    console.log(`└─ Recovery: ${race.priority === 'A' ? '1-2 weeks' : race.priority === 'B' ? '3-5 days' : '1-2 days'} post-race\n`);
  });

  // Training distribution across season
  console.log('🎯 Season Training Distribution:\n');
  
  const seasonStats = {
    totalEasy: 0,
    totalModerate: 0,
    totalHard: 0,
    totalWorkouts: 0
  };

  plans.forEach(plan => {
    const easy = plan.workouts.filter(w => ['easy', 'recovery'].includes(w.type)).length;
    const hard = plan.workouts.filter(w => ['threshold', 'vo2max', 'speed'].includes(w.type)).length;
    const moderate = plan.workouts.length - easy - hard;
    
    seasonStats.totalEasy += easy;
    seasonStats.totalModerate += moderate;
    seasonStats.totalHard += hard;
    seasonStats.totalWorkouts += plan.workouts.length;
  });

  const easyPercent = Math.round((seasonStats.totalEasy / seasonStats.totalWorkouts) * 100);
  const moderatePercent = Math.round((seasonStats.totalModerate / seasonStats.totalWorkouts) * 100);
  const hardPercent = Math.round((seasonStats.totalHard / seasonStats.totalWorkouts) * 100);

  console.log(`Easy/Recovery: ${seasonStats.totalEasy} workouts (${easyPercent}%)`);
  console.log(`Moderate: ${seasonStats.totalModerate} workouts (${moderatePercent}%)`);
  console.log(`Hard/Quality: ${seasonStats.totalHard} workouts (${hardPercent}%)`);
  console.log(`\nOverall Distribution: ${easyPercent}/${moderatePercent}/${hardPercent} (Easy/Moderate/Hard)`);

  // Performance predictions
  console.log('\n🏆 Performance Projections:\n');
  
  races.forEach((race, index) => {
    const phase = phases[index];
    const baseVDOT = baseConfig.currentFitness.vdot;
    const phaseVDOT = baseVDOT + (index * 1); // Progressive improvement
    
    // Simple performance model based on training focus
    let performanceGain = 0;
    switch (phase.focus) {
      case 'speed and power':
        performanceGain = race.distance === '5K' || race.distance === '10K' ? 2 : 1;
        break;
      case 'threshold and tempo':
        performanceGain = race.distance === 'HALF_MARATHON' ? 2.5 : 1.5;
        break;
      case 'marathon specific':
        performanceGain = race.distance === 'MARATHON' ? 3 : 1;
        break;
      default:
        performanceGain = 1;
    }
    
    const projectedVDOT = phaseVDOT + performanceGain;
    const currentGoal = race.goalTime;
    const improvementFactor = projectedVDOT / baseVDOT;
    
    console.log(`${race.name}:`);
    console.log(`├─ Current goal: ${currentGoal.hours ? `${currentGoal.hours}:` : ''}${currentGoal.minutes}:${currentGoal.seconds.toString().padStart(2, '0')}`);
    console.log(`├─ Training VDOT: ${baseVDOT} → ${projectedVDOT.toFixed(1)}`);
    console.log(`├─ Expected improvement: ${((improvementFactor - 1) * 100).toFixed(1)}%`);
    console.log(`├─ Readiness: ${race.priority === 'A' ? 'Peak' : race.priority === 'B' ? 'Good' : 'Moderate'}`);
    console.log(`└─ Confidence: ${race.priority === 'A' ? 'High' : race.priority === 'B' ? 'Moderate' : 'Low'}\n`);
  });

  // Season planning best practices
  console.log('💡 Season Planning Best Practices:\n');
  console.log('1. **Periodization Principles:**');
  console.log('   - Start with aerobic base development');
  console.log('   - Progress from general to specific training');
  console.log('   - Allow adequate recovery between peak efforts');
  console.log('   - Plan 2-3 major goals maximum per season\n');
  
  console.log('2. **Race Prioritization:**');
  console.log('   - A races: Full taper and peak preparation');
  console.log('   - B races: Mini-taper, important but not peak');
  console.log('   - C races: Training races, no taper required\n');
  
  console.log('3. **Phase Transitions:**');
  console.log('   - Include 1-2 week transition periods');
  console.log('   - Gradually shift training emphasis');
  console.log('   - Monitor fatigue and adaptation markers');
  console.log('   - Adjust based on race performance and fitness\n');
  
  console.log('4. **Volume Management:**');
  console.log('   - Build weekly volume by 10% per week maximum');
  console.log('   - Include recovery weeks every 3-4 weeks');
  console.log('   - Peak volume should occur 4-6 weeks before A races');
  console.log('   - Maintain base fitness between competitive phases\n');

  console.log('✨ A well-planned season maximizes performance while minimizing injury risk through systematic progression!');
}

// Export for use in other examples
export { seasonPlanningExample };

// Run if called directly
if (require.main === module) {
  seasonPlanningExample().catch(console.error);
}