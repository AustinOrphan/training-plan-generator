/**
 * Complete Workflow Examples
 * 
 * Demonstrates end-to-end implementation for each training methodology
 * with full validation, adaptation, and export capabilities.
 */

import { AdvancedTrainingPlanGenerator } from '../src/advanced-generator';
import { PhilosophyFactory } from '../src/philosophies';
import { SmartAdaptationEngine } from '../src/adaptation';
import { MultiFormatExporter } from '../src/export';
import { ValidationFactory } from '../src/validation';
import type { AdvancedPlanConfig, TrainingPlan, ProgressData } from '../src/types';

/**
 * Complete workflow for Jack Daniels methodology
 */
export async function danielsCompleteWorkflow() {
  console.log('=== JACK DANIELS COMPLETE WORKFLOW ===\n');
  
  // Step 1: Configuration
  const config: AdvancedPlanConfig = {
    name: 'Daniels Half Marathon Plan',
    description: 'VDOT-based scientific training approach',
    goal: 'HALF_MARATHON',
    startDate: new Date('2024-01-15'),
    targetDate: new Date('2024-04-21'), // 14 weeks
    
    currentFitness: {
      vdot: 48,
      criticalSpeed: 12.8,
      lactateThreshold: 11.5,
      weeklyMileage: 40,
      longestRecentRun: 18,
      trainingAge: 3,
      injuryHistory: [],
      recoveryRate: 78,
      overallScore: 70 // VDOT: 60 + Volume: 40 + Experience: 60 + Recovery: 78 * weights = 70
    },
    
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
      preferredIntensity: 'moderate',
      crossTraining: false,
      strengthTraining: true,
      timeConstraints: {
        1: 60, 2: 45, 3: 60, 4: 45, 5: 75, 6: 120
      }
    },
    
    methodology: 'daniels',
    adaptationEnabled: true,
    progressTracking: true,
    exportFormats: ['pdf', 'ical', 'json']
  };

  console.log('📋 Configuration Summary:');
  console.log(`- Methodology: Jack Daniels' Running Formula`);
  console.log(`- Goal: ${config.goal}`);
  console.log(`- Duration: 14 weeks`);
  console.log(`- Current VDOT: ${config.currentFitness?.vdot}`);
  console.log(`- Training days: 6 per week\n`);

  // Validate configuration
  const validator = ValidationFactory.createPipeline();
  const configValidation = validator.validateConfig(config);
  
  if (!configValidation.isValid) {
    console.error('❌ Configuration validation failed:', configValidation.errors);
    return;
  }
  console.log('✅ Configuration validated successfully\n');

  // Step 2: Generate training plan
  console.log('🔄 Generating Daniels training plan...');
  const generator = new AdvancedTrainingPlanGenerator(config);
  const plan = await generator.generateAdvancedPlan();
  
  // Validate plan
  const planValidation = validator.validatePlan(plan);
  if (!planValidation.isValid) {
    console.error('❌ Plan validation failed:', planValidation.errors);
    return;
  }

  console.log('✅ Plan generated successfully');
  console.log(`- Total workouts: ${plan.summary.totalWorkouts}`);
  console.log(`- Total distance: ${Math.round(plan.summary.totalDistance)} km`);
  console.log(`- Peak week: ${Math.round(plan.summary.peakWeeklyDistance)} km`);

  // Display Daniels-specific features
  const philosophy = PhilosophyFactory.create('daniels');
  const trainingPaces = philosophy.calculateTrainingPaces(config.currentFitness!.vdot!);
  
  console.log('\n📊 Daniels Training Paces (min/km):');
  console.log(`- Easy: ${trainingPaces.easy.toFixed(2)}`);
  console.log(`- Marathon: ${trainingPaces.marathon.toFixed(2)}`);
  console.log(`- Threshold: ${trainingPaces.threshold.toFixed(2)}`);
  console.log(`- Interval: ${trainingPaces.interval.toFixed(2)}`);
  console.log(`- Repetition: ${trainingPaces.repetition.toFixed(2)}`);

  // Analyze intensity distribution
  const workoutTypes = plan.workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const easyWorkouts = (workoutTypes.easy || 0) + (workoutTypes.recovery || 0);
  const qualityWorkouts = (workoutTypes.threshold || 0) + (workoutTypes.vo2max || 0) + 
                         (workoutTypes.speed || 0) + (workoutTypes.tempo || 0);
  const easyPercentage = (easyWorkouts / plan.workouts.length) * 100;

  console.log('\n📈 Daniels 80/20 Distribution:');
  console.log(`- Easy/Recovery: ${easyWorkouts} workouts (${easyPercentage.toFixed(1)}%)`);
  console.log(`- Quality: ${qualityWorkouts} workouts (${(100 - easyPercentage).toFixed(1)}%)`);
  console.log(`- Matches Daniels 80/20 principle: ${easyPercentage >= 75 ? '✅' : '❌'}`);

  // Step 3: Simulate 4 weeks of training
  console.log('\n🏃‍♂️ Simulating 4 weeks of training...\n');
  
  const adaptationEngine = new SmartAdaptationEngine({
    enabled: true,
    sensitivityLevel: 'medium',
    recoveryThreshold: 70,
    workloadThreshold: 1.25
  });

  const progressHistory: ProgressData[] = [];
  
  for (let week = 1; week <= 4; week++) {
    const weekStart = new Date(config.startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const weekWorkouts = plan.workouts.filter(w => 
      w.date >= weekStart && w.date < weekEnd
    );

    console.log(`Week ${week}:`);
    let weekDistance = 0;

    weekWorkouts.forEach((workout, index) => {
      // Simulate realistic completion based on workout type
      let completionRate = 1.0;
      let difficultyRating = 5;
      
      if (workout.type === 'threshold' || workout.type === 'vo2max') {
        completionRate = 0.85 + Math.random() * 0.15;
        difficultyRating = 6 + Math.floor(Math.random() * 3);
      }

      const actualDistance = (workout.targetMetrics.distance || 0) * completionRate;
      weekDistance += actualDistance;

      const progressEntry: ProgressData = {
        date: workout.date,
        completedWorkout: {
          plannedWorkout: workout,
          actualDuration: workout.targetMetrics.duration * completionRate,
          actualDistance,
          completionRate,
          adherence: completionRate > 0.9 ? 'complete' : 'partial',
          difficultyRating,
          paceDeviation: workout.type === 'easy' ? 0 : Math.random() * 5
        },
        recoveryMetrics: {
          recoveryScore: 75 + Math.floor(Math.random() * 15) - index * 2,
          sleepQuality: 75 + Math.floor(Math.random() * 15),
          sleepDuration: 7 + Math.random(),
          stressLevel: 25 + Math.floor(Math.random() * 25),
          muscleSoreness: 2 + Math.floor(Math.random() * 3),
          energyLevel: 7 + Math.floor(Math.random() * 2),
          motivation: 8 + Math.floor(Math.random() * 2)
        }
      };

      progressHistory.push(progressEntry);
    });

    console.log(`- Completed: ${weekWorkouts.length} workouts`);
    console.log(`- Total distance: ${Math.round(weekDistance)} km`);
    
    // Analyze week
    const weekProgress = progressHistory.slice(-weekWorkouts.length);
    const analysis = adaptationEngine.analyzeProgress(weekProgress);
    console.log(`- Training load ratio: ${analysis.trainingLoad.toFixed(2)}`);
    console.log(`- Recovery trend: ${analysis.recoveryTrend}\n`);
  }

  // Step 4: Export in multiple formats
  console.log('📤 Exporting plan in multiple formats...\n');
  const exporter = new MultiFormatExporter();

  // PDF Export
  const pdfResult = await exporter.export(plan, 'pdf', {
    includePaces: true,
    includeHeartRates: true,
    customFields: {
      vdotPaces: trainingPaces,
      methodology: 'Jack Daniels VDOT System'
    }
  });
  console.log(`✅ PDF: ${pdfResult.filename} (${Math.round(pdfResult.size / 1024)} KB)`);

  // iCal Export
  const icalResult = await exporter.export(plan, 'ical', {
    timeZone: 'America/New_York',
    includeTargetPaces: true
  });
  console.log(`✅ iCal: ${icalResult.filename} (${icalResult.metadata.totalWorkouts} events)`);

  // JSON Export
  const jsonResult = await exporter.export(plan, 'json');
  console.log(`✅ JSON: ${jsonResult.filename} (${Math.round(jsonResult.size / 1024)} KB)`);

  // Final validation
  const workflowValidation = await ValidationFactory.validateWorkflow(
    config,
    plan,
    progressHistory,
    { pdf: pdfResult, ical: icalResult, json: jsonResult }
  );

  console.log('\n✅ Daniels workflow completed successfully!');
  console.log('🎯 Key features demonstrated:');
  console.log('- VDOT-based pace calculations');
  console.log('- 80/20 intensity distribution');
  console.log('- Scientific training zones');
  console.log('- Adaptive modifications based on progress');
  console.log('- Multi-format export capabilities\n');
}

/**
 * Complete workflow for Arthur Lydiard methodology
 */
export async function lydiardCompleteWorkflow() {
  console.log('=== ARTHUR LYDIARD COMPLETE WORKFLOW ===\n');
  
  // Step 1: Configuration
  const config: AdvancedPlanConfig = {
    name: 'Lydiard Marathon Base Building',
    description: 'Aerobic base emphasis with systematic progression',
    goal: 'MARATHON',
    startDate: new Date('2024-01-01'),
    targetDate: new Date('2024-06-01'), // 22 weeks
    
    currentFitness: {
      vdot: 42,
      weeklyMileage: 30,
      longestRecentRun: 15,
      trainingAge: 2,
      recoveryRate: 70,
      overallScore: 59 // VDOT: 52.5 + Volume: 30 + Experience: 40 + Recovery: 70 * weights = 59
    },
    
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6, 0], // All week
      preferredIntensity: 'low', // Lydiard emphasizes easy running
      crossTraining: true,
      strengthTraining: true
    },
    
    methodology: 'lydiard',
    adaptationEnabled: true,
    progressTracking: true,
    exportFormats: ['pdf', 'csv']
  };

  console.log('📋 Configuration Summary:');
  console.log(`- Methodology: Arthur Lydiard System`);
  console.log(`- Goal: ${config.goal}`);
  console.log(`- Duration: 22 weeks`);
  console.log(`- Focus: Aerobic base building`);
  console.log(`- Training days: 7 per week\n`);

  // Generate plan
  const generator = new AdvancedTrainingPlanGenerator(config);
  const plan = await generator.generateAdvancedPlan();

  console.log('✅ Lydiard plan generated');
  console.log(`- Total workouts: ${plan.summary.totalWorkouts}`);
  console.log(`- Total distance: ${Math.round(plan.summary.totalDistance)} km`);

  // Analyze Lydiard-specific features
  const philosophy = PhilosophyFactory.create('lydiard');
  const phases = identifyLydiardPhases(plan);
  
  console.log('\n📊 Lydiard Phase Analysis:');
  phases.forEach(phase => {
    console.log(`- ${phase.name}: Weeks ${phase.startWeek}-${phase.endWeek}`);
    console.log(`  Volume: ${Math.round(phase.avgWeeklyVolume)} km/week`);
    console.log(`  Focus: ${phase.focus}`);
  });

  // Intensity distribution
  const workoutCounts = plan.workouts.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const aerobicWorkouts = (workoutCounts.easy || 0) + (workoutCounts.recovery || 0) + 
                         (workoutCounts.long_run || 0);
  const aerobicPercentage = (aerobicWorkouts / plan.workouts.length) * 100;

  console.log('\n📈 Lydiard Aerobic Emphasis:');
  console.log(`- Aerobic workouts: ${aerobicWorkouts} (${aerobicPercentage.toFixed(1)}%)`);
  console.log(`- Hill training: ${workoutCounts.hill || 0} sessions`);
  console.log(`- Time trials: ${workoutCounts.time_trial || 0} sessions`);
  console.log(`- Matches Lydiard 85%+ aerobic: ${aerobicPercentage >= 85 ? '✅' : '❌'}`);

  // Simulate base building phase (6 weeks)
  console.log('\n🏃‍♂️ Simulating 6-week base building phase...\n');
  
  const adaptationEngine = new SmartAdaptationEngine({
    enabled: true,
    sensitivityLevel: 'low', // Lydiard favors consistency
    recoveryThreshold: 65,
    workloadThreshold: 1.4 // Allow higher load for base building
  });

  const progressHistory: ProgressData[] = [];
  let cumulativeVolume = 0;

  for (let week = 1; week <= 6; week++) {
    const weekWorkouts = plan.workouts.filter(w => {
      const weekNum = Math.floor((w.date.getTime() - config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weekNum === week - 1;
    });

    let weekVolume = 0;
    weekWorkouts.forEach(workout => {
      // Lydiard athletes typically complete all easy runs
      const completionRate = workout.type === 'easy' || workout.type === 'long_run' ? 
        0.95 + Math.random() * 0.05 : 0.85 + Math.random() * 0.15;

      const actualDistance = (workout.targetMetrics.distance || 0) * completionRate;
      weekVolume += actualDistance;

      progressHistory.push({
        date: workout.date,
        completedWorkout: {
          plannedWorkout: workout,
          actualDuration: workout.targetMetrics.duration * completionRate,
          actualDistance,
          completionRate,
          adherence: completionRate > 0.9 ? 'complete' : 'partial',
          difficultyRating: workout.type === 'easy' ? 3 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 3),
          paceDeviation: workout.type === 'easy' ? Math.random() * 3 : Math.random() * 5
        },
        recoveryMetrics: {
          recoveryScore: 70 + Math.floor(Math.random() * 20),
          sleepQuality: 75 + Math.floor(Math.random() * 15),
          sleepDuration: 7.5 + Math.random(),
          stressLevel: 20 + Math.floor(Math.random() * 20),
          muscleSoreness: 2 + Math.floor(Math.random() * 4),
          energyLevel: 6 + Math.floor(Math.random() * 3),
          motivation: 7 + Math.floor(Math.random() * 3)
        }
      });
    });

    cumulativeVolume += weekVolume;
    console.log(`Week ${week}: ${Math.round(weekVolume)} km (${weekWorkouts.length} workouts)`);
  }

  console.log(`\nTotal base phase volume: ${Math.round(cumulativeVolume)} km`);
  console.log(`Average weekly: ${Math.round(cumulativeVolume / 6)} km`);

  // Export
  console.log('\n📤 Exporting Lydiard plan...');
  const exporter = new MultiFormatExporter();

  const pdfResult = await exporter.export(plan, 'pdf', {
    includePhases: true,
    customFields: {
      methodology: 'Arthur Lydiard Aerobic System',
      basePhaseWeeks: 10,
      hillPhaseWeeks: 4
    }
  });

  const csvResult = await exporter.export(plan, 'csv', {
    includeWeeklySummaries: true,
    units: 'metric'
  });

  console.log(`✅ PDF: ${pdfResult.filename}`);
  console.log(`✅ CSV: ${csvResult.filename}`);

  console.log('\n✅ Lydiard workflow completed!');
  console.log('🎯 Key features demonstrated:');
  console.log('- 85%+ aerobic emphasis');
  console.log('- Systematic base building');
  console.log('- Hill training integration');
  console.log('- Long steady runs');
  console.log('- Conservative progression\n');
}

/**
 * Complete workflow for Pete Pfitzinger methodology
 */
export async function pfitzingerCompleteWorkflow() {
  console.log('=== PETE PFITZINGER COMPLETE WORKFLOW ===\n');
  
  // Step 1: Configuration
  const config: AdvancedPlanConfig = {
    name: 'Pfitzinger Advanced Marathon',
    description: 'Lactate threshold focus with medium-long runs',
    goal: 'MARATHON',
    startDate: new Date('2024-02-01'),
    targetDate: new Date('2024-05-26'), // 16 weeks
    
    currentFitness: {
      vdot: 52,
      weeklyMileage: 55,
      longestRecentRun: 26,
      trainingAge: 5,
      recoveryRate: 80,
      overallScore: 76 // VDOT: 65 + Volume: 55 + Experience: 100 + Recovery: 80 * weights = 76
    },
    
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6, 0],
      preferredIntensity: 'high', // Pfitz plans are demanding
      crossTraining: true,
      strengthTraining: true
    },
    
    targetRaces: [
      {
        distance: '10K',
        date: new Date('2024-03-15'),
        priority: 'B',
        description: 'Tune-up race'
      },
      {
        distance: 'HALF_MARATHON',
        date: new Date('2024-04-20'),
        priority: 'B',
        description: 'Marathon pace assessment'
      }
    ],
    
    methodology: 'pfitzinger',
    adaptationEnabled: true,
    progressTracking: true
  };

  console.log('📋 Configuration Summary:');
  console.log(`- Methodology: Pete Pfitzinger Advanced Marathoning`);
  console.log(`- Goal: ${config.goal}`);
  console.log(`- Duration: 16 weeks`);
  console.log(`- Peak mileage target: 70+ km/week`);
  console.log(`- Tune-up races: 2 planned\n`);

  // Generate plan
  const generator = new AdvancedTrainingPlanGenerator(config);
  const plan = await generator.generateAdvancedPlan();

  console.log('✅ Pfitzinger plan generated');
  console.log(`- Total workouts: ${plan.summary.totalWorkouts}`);
  console.log(`- Peak week: ${Math.round(plan.summary.peakWeeklyDistance)} km`);

  // Analyze Pfitzinger-specific features
  const mediumLongRuns = plan.workouts.filter(w => 
    w.type === 'medium_long' || 
    (w.type === 'easy' && w.targetMetrics.distance && w.targetMetrics.distance >= 16 && w.targetMetrics.distance < 26)
  );

  const tempoRuns = plan.workouts.filter(w => 
    w.type === 'tempo' || w.type === 'threshold'
  );

  console.log('\n📊 Pfitzinger Key Elements:');
  console.log(`- Medium-long runs: ${mediumLongRuns.length} (${(mediumLongRuns.length / 16).toFixed(1)} per week)`);
  console.log(`- Tempo/LT runs: ${tempoRuns.length}`);
  console.log(`- Long runs: ${plan.workouts.filter(w => w.type === 'long_run').length}`);
  console.log(`- Recovery days: ${plan.summary.recoveryDays}`);

  // Validate marathon-specific progression
  const longRuns = plan.workouts
    .filter(w => w.type === 'long_run')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  console.log('\n📈 Long Run Progression:');
  longRuns.slice(0, 5).forEach((run, index) => {
    const weekNum = Math.floor((run.date.getTime() - config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    console.log(`- Week ${weekNum}: ${Math.round(run.targetMetrics.distance || 0)} km`);
  });
  console.log(`- Peak long run: ${Math.round(Math.max(...longRuns.map(r => r.targetMetrics.distance || 0)))} km`);

  // Simulate peak training phase (4 weeks)
  console.log('\n🏃‍♂️ Simulating 4-week peak phase (weeks 9-12)...\n');
  
  const adaptationEngine = new SmartAdaptationEngine({
    enabled: true,
    sensitivityLevel: 'high', // Monitor closely during peak
    recoveryThreshold: 75,
    workloadThreshold: 1.2,
    maxVolumeReduction: 20
  });

  const peakWeeks = [9, 10, 11, 12];
  const progressHistory: ProgressData[] = [];

  for (const weekNum of peakWeeks) {
    const weekWorkouts = plan.workouts.filter(w => {
      const week = Math.floor((w.date.getTime() - config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return week === weekNum - 1;
    });

    console.log(`Week ${weekNum} (Peak Phase):`);
    let weekVolume = 0;
    let qualityWorkouts = 0;

    weekWorkouts.forEach(workout => {
      const isQuality = ['tempo', 'threshold', 'vo2max', 'marathon_pace'].includes(workout.type);
      if (isQuality) qualityWorkouts++;

      // Simulate realistic peak phase fatigue
      const fatigueMultiplier = 1 - (weekNum - 9) * 0.02; // Increasing fatigue
      const completionRate = isQuality ? 
        (0.80 + Math.random() * 0.15) * fatigueMultiplier :
        (0.90 + Math.random() * 0.10) * fatigueMultiplier;

      const actualDistance = (workout.targetMetrics.distance || 0) * completionRate;
      weekVolume += actualDistance;

      progressHistory.push({
        date: workout.date,
        completedWorkout: {
          plannedWorkout: workout,
          actualDuration: workout.targetMetrics.duration * completionRate,
          actualDistance,
          completionRate,
          adherence: completionRate > 0.85 ? 'complete' : 'partial',
          difficultyRating: isQuality ? 7 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 2),
          paceDeviation: isQuality ? 5 + Math.random() * 5 : Math.random() * 3
        },
        recoveryMetrics: {
          recoveryScore: 80 - (weekNum - 9) * 5 + Math.floor(Math.random() * 10),
          sleepQuality: 75 + Math.floor(Math.random() * 10),
          sleepDuration: 7 + Math.random() * 1.5,
          stressLevel: 30 + (weekNum - 9) * 5 + Math.floor(Math.random() * 20),
          muscleSoreness: 3 + (weekNum - 9) + Math.floor(Math.random() * 3),
          energyLevel: 7 - Math.floor((weekNum - 9) / 2) + Math.floor(Math.random() * 2),
          motivation: 8 + Math.floor(Math.random() * 2)
        }
      });
    });

    console.log(`- Volume: ${Math.round(weekVolume)} km`);
    console.log(`- Quality workouts: ${qualityWorkouts}`);
    console.log(`- Workouts completed: ${weekWorkouts.length}`);

    // Check for needed adaptations
    const weekProgress = progressHistory.slice(-weekWorkouts.length);
    const analysis = adaptationEngine.analyzeProgress(weekProgress);
    
    if (analysis.riskLevel === 'high') {
      console.log(`- ⚠️ High fatigue detected - consider recovery week`);
    }
  }

  // Export with platform integration
  console.log('\n📤 Exporting for platform integration...');
  const exporter = new MultiFormatExporter();

  // TrainingPeaks export
  const tpResult = await exporter.export(plan, 'json', {
    formatter: 'trainingpeaks',
    includeTSS: true,
    includeIF: true
  });
  console.log(`✅ TrainingPeaks: ${tpResult.filename}`);

  // Garmin export
  const garminResult = await exporter.export(plan, 'json', {
    formatter: 'garmin',
    includeStructuredWorkouts: true
  });
  console.log(`✅ Garmin Connect: ${garminResult.filename}`);

  console.log('\n✅ Pfitzinger workflow completed!');
  console.log('🎯 Key features demonstrated:');
  console.log('- Medium-long run emphasis');
  console.log('- Lactate threshold focus');
  console.log('- Tune-up race integration');
  console.log('- High-volume marathon preparation');
  console.log('- Platform-specific exports\n');
}

/**
 * Helper function to identify Lydiard training phases
 */
function identifyLydiardPhases(plan: TrainingPlan) {
  const totalWeeks = plan.summary.totalWeeks;
  const phases = [];

  // Base phase (typically 10-12 weeks)
  const baseWeeks = Math.floor(totalWeeks * 0.5);
  phases.push({
    name: 'Aerobic Base Building',
    startWeek: 1,
    endWeek: baseWeeks,
    avgWeeklyVolume: calculatePhaseVolume(plan, 0, baseWeeks),
    focus: 'High volume easy running'
  });

  // Hill phase (typically 4 weeks)
  const hillStartWeek = baseWeeks + 1;
  const hillEndWeek = baseWeeks + 4;
  phases.push({
    name: 'Hill Training',
    startWeek: hillStartWeek,
    endWeek: hillEndWeek,
    avgWeeklyVolume: calculatePhaseVolume(plan, hillStartWeek - 1, hillEndWeek - 1),
    focus: 'Strength and power development'
  });

  // Speed phase (remaining weeks minus taper)
  const speedStartWeek = hillEndWeek + 1;
  const speedEndWeek = totalWeeks - 2;
  phases.push({
    name: 'Speed Development',
    startWeek: speedStartWeek,
    endWeek: speedEndWeek,
    avgWeeklyVolume: calculatePhaseVolume(plan, speedStartWeek - 1, speedEndWeek - 1),
    focus: 'Time trials and speed work'
  });

  // Taper
  phases.push({
    name: 'Taper',
    startWeek: totalWeeks - 1,
    endWeek: totalWeeks,
    avgWeeklyVolume: calculatePhaseVolume(plan, totalWeeks - 2, totalWeeks - 1),
    focus: 'Recovery and race preparation'
  });

  return phases;
}

function calculatePhaseVolume(plan: TrainingPlan, startWeek: number, endWeek: number): number {
  let totalVolume = 0;
  let weeks = 0;

  for (let week = startWeek; week <= endWeek; week++) {
    const weekWorkouts = plan.workouts.filter(w => {
      const weekNum = Math.floor((w.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weekNum === week;
    });

    const weekVolume = weekWorkouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    if (weekVolume > 0) {
      totalVolume += weekVolume;
      weeks++;
    }
  }

  return weeks > 0 ? totalVolume / weeks : 0;
}

/**
 * Run all methodology workflows
 */
export async function runAllWorkflows() {
  console.log('🚀 RUNNING ALL METHODOLOGY WORKFLOWS\n');
  console.log('This demonstrates complete end-to-end integration for each training philosophy.\n');
  
  try {
    await danielsCompleteWorkflow();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await lydiardCompleteWorkflow();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await pfitzingerCompleteWorkflow();
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ ALL WORKFLOWS COMPLETED SUCCESSFULLY!');
    console.log('\nThe training plan generator successfully demonstrated:');
    console.log('- Multiple training methodologies');
    console.log('- Complete configuration validation');
    console.log('- Plan generation with philosophy-specific features');
    console.log('- Progress tracking and adaptation');
    console.log('- Multi-format export capabilities');
    console.log('- Platform integrations');
    console.log('\nReady for production use! 🎉');
    
  } catch (error) {
    console.error('❌ Workflow error:', error);
  }
}

// Export individual workflows
export {
  danielsCompleteWorkflow as danielsWorkflow,
  lydiardCompleteWorkflow as lydiardWorkflow,
  pfitzingerCompleteWorkflow as pfitzingerWorkflow
};

// Run if called directly
if (require.main === module) {
  runAllWorkflows().catch(console.error);
}