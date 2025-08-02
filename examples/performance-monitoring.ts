/**
 * Performance Monitoring Example
 * 
 * Demonstrates how to track training effectiveness, monitor performance trends,
 * and optimize training plans based on data-driven insights.
 */

import {
  AdvancedTrainingPlanGenerator,
  calculateVDOTCached,
  calculateFitnessMetricsCached,
  CalculationProfiler,
  MemoryMonitor,
  type AdvancedPlanConfig,
  type TrainingPlan
} from '../src/index';

interface PerformanceData {
  date: Date;
  workoutType: string;
  distance: number;
  duration: number; // minutes
  avgPace: number; // min/km
  avgHeartRate?: number;
  rpe: number; // 1-10 scale
  conditions: {
    temperature: number;
    humidity: number;
    wind: string;
  };
  notes?: string;
}

interface FitnessMetrics {
  vdot: number;
  criticalSpeed: number;
  lactateThreshold: number;
  aerobicCapacity: number;
  runningEconomy: number;
  trainingLoad: {
    acute: number;
    chronic: number;
    ratio: number;
  };
  injuryRisk: number;
  recoveryScore: number;
}

async function performanceMonitoringExample() {
  console.log('📊 Performance Monitoring & Optimization Example\n');

  // Initial athlete assessment
  const baseConfig: AdvancedPlanConfig = {
    name: 'Performance Monitoring Program',
    goal: 'HALF_MARATHON',
    startDate: new Date(),
    targetDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
    
    currentFitness: {
      vdot: 48,
      weeklyMileage: 45,
      longestRecentRun: 20,
      trainingAge: 4,
      recoveryRate: 75,
      overallScore: 55 // VDOT: 60 + Volume: 45 + Experience: 40 + Recovery: 75 * weights = 55
    },
    
    preferences: {
      availableDays: [1, 2, 3, 4, 5, 6],
      preferredIntensity: 'moderate'
    },
    
    methodology: 'daniels',
    adaptationEnabled: true,
    progressTracking: true
  };

  console.log('🏃‍♂️ Initial Athlete Profile:');
  console.log(`- VDOT: ${baseConfig.currentFitness?.vdot}`);
  console.log(`- Weekly Volume: ${baseConfig.currentFitness?.weeklyMileage} km`);
  console.log(`- Training Age: ${baseConfig.currentFitness?.trainingAge} years`);
  console.log(`- Recovery Rate: ${baseConfig.currentFitness?.recoveryRate}%\n`);

  // Generate initial training plan
  MemoryMonitor.snapshot('plan-generation-start');
  
  const startTime = Date.now();
  const generator = new AdvancedTrainingPlanGenerator(baseConfig);
  const initialPlan = await generator.generateAdvancedPlan();
  const generationTime = Date.now() - startTime;
  
  MemoryMonitor.snapshot('plan-generation-end');
  const memoryUsage = MemoryMonitor.getMemoryIncrease('plan-generation-start', 'plan-generation-end');

  console.log('⚡ Plan Generation Performance:');
  console.log(`- Generation time: ${generationTime}ms`);
  console.log(`- Memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB\n`);

  // Simulate 8 weeks of training data
  console.log('📈 Simulating 8 weeks of training data...\n');
  
  const performanceHistory: PerformanceData[] = [];
  const fitnessEvolution: FitnessMetrics[] = [];
  
  // Generate realistic training data
  for (let week = 1; week <= 8; week++) {
    console.log(`Week ${week}:`);
    
    // Get week's planned workouts
    const weekStart = new Date(baseConfig.startDate.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const weekWorkouts = initialPlan.workouts.filter(w => 
      w.date >= weekStart && w.date < weekEnd
    );

    // Simulate performance for each workout
    for (const plannedWorkout of weekWorkouts) {
      const performance = simulateWorkoutPerformance(plannedWorkout, week);
      performanceHistory.push(performance);
      
      const day = performance.date.toLocaleDateString('en-US', { weekday: 'short' });
      console.log(`  ${day}: ${performance.workoutType} - ${performance.distance}km in ${performance.duration}min`);
      console.log(`       Pace: ${performance.avgPace.toFixed(2)} min/km | RPE: ${performance.rpe}/10`);
    }

    // Calculate weekly fitness metrics
    const weekHistory = performanceHistory.slice(-weekWorkouts.length);
    const weeklyMetrics = calculateWeeklyFitnessMetrics(weekHistory, week);
    fitnessEvolution.push(weeklyMetrics);
    
    console.log(`  📊 Weekly Metrics:`);
    console.log(`     VDOT: ${weeklyMetrics.vdot.toFixed(1)} | Training Load: ${weeklyMetrics.trainingLoad.acute.toFixed(0)}`);
    console.log(`     Recovery: ${weeklyMetrics.recoveryScore}% | Injury Risk: ${weeklyMetrics.injuryRisk.toFixed(1)}%\n`);
  }

  // Performance trend analysis
  console.log('📈 Performance Trend Analysis\n');
  
  // VDOT progression
  console.log('🎯 VDOT Progression:');
  const initialVDOT = fitnessEvolution[0].vdot;
  const currentVDOT = fitnessEvolution[fitnessEvolution.length - 1].vdot;
  const vdotImprovement = ((currentVDOT - initialVDOT) / initialVDOT) * 100;
  
  console.log(`Week    VDOT    Change    Trend`);
  console.log('-'.repeat(35));
  
  fitnessEvolution.forEach((metrics, index) => {
    const week = index + 1;
    const change = index === 0 ? 0 : metrics.vdot - fitnessEvolution[index - 1].vdot;
    const trend = change > 0.5 ? '↗️' : change < -0.5 ? '↘️' : '→';
    
    console.log(
      `${week.toString().padStart(2)} `.padEnd(8) +
      `${metrics.vdot.toFixed(1)}`.padEnd(8) +
      `${change >= 0 ? '+' : ''}${change.toFixed(1)}`.padEnd(10) +
      trend
    );
  });
  
  console.log(`\nTotal VDOT improvement: ${vdotImprovement >= 0 ? '+' : ''}${vdotImprovement.toFixed(1)}%\n`);

  // Training load analysis
  console.log('⚖️ Training Load Analysis:');
  console.log('Week    Acute    Chronic    Ratio    Status');
  console.log('-'.repeat(45));
  
  fitnessEvolution.forEach((metrics, index) => {
    const week = index + 1;
    const ratio = metrics.trainingLoad.ratio;
    let status = '';
    
    if (ratio < 0.8) status = '🔵 Recovery';
    else if (ratio < 1.0) status = '🟢 Optimal';
    else if (ratio < 1.3) status = '🟡 Building';
    else status = '🔴 High Risk';
    
    console.log(
      `${week.toString().padStart(2)} `.padEnd(8) +
      `${metrics.trainingLoad.acute.toFixed(0)}`.padEnd(9) +
      `${metrics.trainingLoad.chronic.toFixed(0)}`.padEnd(11) +
      `${ratio.toFixed(2)}`.padEnd(9) +
      status
    );
  });

  // Injury risk monitoring
  const avgInjuryRisk = fitnessEvolution.reduce((sum, m) => sum + m.injuryRisk, 0) / fitnessEvolution.length;
  const currentInjuryRisk = fitnessEvolution[fitnessEvolution.length - 1].injuryRisk;
  
  console.log(`\n🩺 Injury Risk Assessment:`);
  console.log(`- Average risk: ${avgInjuryRisk.toFixed(1)}%`);
  console.log(`- Current risk: ${currentInjuryRisk.toFixed(1)}%`);
  console.log(`- Risk trend: ${currentInjuryRisk > avgInjuryRisk ? '⬆️ Increasing' : '⬇️ Decreasing'}\n`);

  // Workout quality analysis
  console.log('🎯 Workout Quality Analysis\n');
  
  const workoutTypes = ['Easy', 'Tempo', 'Threshold', 'VO2max', 'Long Run'];
  
  workoutTypes.forEach(type => {
    const typeWorkouts = performanceHistory.filter(w => 
      w.workoutType.toLowerCase().includes(type.toLowerCase())
    );
    
    if (typeWorkouts.length > 0) {
      const avgPace = typeWorkouts.reduce((sum, w) => sum + w.avgPace, 0) / typeWorkouts.length;
      const avgRPE = typeWorkouts.reduce((sum, w) => sum + w.rpe, 0) / typeWorkouts.length;
      const consistency = calculatePaceConsistency(typeWorkouts);
      
      console.log(`${type}:`);
      console.log(`  Sessions: ${typeWorkouts.length}`);
      console.log(`  Avg pace: ${avgPace.toFixed(2)} min/km`);
      console.log(`  Avg RPE: ${avgRPE.toFixed(1)}/10`);
      console.log(`  Consistency: ${consistency.toFixed(1)}% (${consistency > 90 ? 'Excellent' : consistency > 80 ? 'Good' : 'Variable'})`);
      console.log('');
    }
  });

  // Performance predictions
  console.log('🔮 Performance Predictions\n');
  
  const currentMetrics = fitnessEvolution[fitnessEvolution.length - 1];
  const predictions = generatePerformancePredictions(currentMetrics);
  
  console.log('Race Distance    Current Ability    Predicted (4 weeks)    Improvement');
  console.log('-'.repeat(70));
  
  Object.entries(predictions).forEach(([distance, prediction]) => {
    const current = prediction.current;
    const future = prediction.predicted;
    const improvement = ((current - future) / current) * 100;
    
    console.log(
      `${distance}`.padEnd(15) +
      `${formatTime(current)}`.padEnd(19) +
      `${formatTime(future)}`.padEnd(23) +
      `${improvement >= 0 ? '-' : '+'}${Math.abs(improvement).toFixed(1)}%`
    );
  });

  // Training recommendations
  console.log('\n💡 Data-Driven Training Recommendations\n');
  
  const recommendations = generateTrainingRecommendations(fitnessEvolution, performanceHistory);
  
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. **${rec.category}**: ${rec.recommendation}`);
    console.log(`   Rationale: ${rec.rationale}`);
    console.log(`   Priority: ${rec.priority}`);
    console.log(`   Implementation: ${rec.implementation}\n`);
  });

  // Plan optimization
  console.log('🔧 Plan Optimization Based on Data\n');
  
  const optimizationInsights = analyzeTrainingEffectiveness(fitnessEvolution, performanceHistory);
  
  console.log('Key Insights:');
  optimizationInsights.insights.forEach((insight, index) => {
    console.log(`${index + 1}. ${insight}`);
  });
  
  console.log('\nOptimization Actions:');
  optimizationInsights.actions.forEach((action, index) => {
    console.log(`${index + 1}. ${action}`);
  });

  // Performance dashboard summary
  console.log('\n📊 Performance Dashboard Summary\n');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│                    TRAINING SUMMARY                         │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│ Training Period: 8 weeks                                   │`);
  console.log(`│ Total Workouts: ${performanceHistory.length.toString().padEnd(48)} │`);
  console.log(`│ VDOT Progress: ${initialVDOT.toFixed(1)} → ${currentVDOT.toFixed(1)} (${vdotImprovement >= 0 ? '+' : ''}${vdotImprovement.toFixed(1)}%)${' '.padEnd(25)} │`);
  console.log(`│ Current Fitness: ${getFitnessLevel(currentVDOT).padEnd(43)} │`);
  console.log(`│ Injury Risk: ${currentInjuryRisk.toFixed(1)}% (${getRiskLevel(currentInjuryRisk)})${' '.padEnd(35)} │`);
  console.log(`│ Training Load: ${fitnessEvolution[fitnessEvolution.length-1].trainingLoad.ratio.toFixed(2)} (${getLoadStatus(fitnessEvolution[fitnessEvolution.length-1].trainingLoad.ratio)})${' '.padEnd(30)} │`);
  console.log('└─────────────────────────────────────────────────────────────┘');

  console.log('\n✨ Performance monitoring enables data-driven training optimization and injury prevention!');
}

// Helper functions
function simulateWorkoutPerformance(plannedWorkout: any, week: number): PerformanceData {
  const baseDistance = plannedWorkout.targetMetrics.distance || 8;
  const baseDuration = plannedWorkout.targetMetrics.duration || 45;
  const basePace = baseDuration / baseDistance;
  
  // Add week-based progression and random variation
  const progression = 1 - (week * 0.005); // Slight improvement over time
  const randomVariation = 0.95 + (Math.random() * 0.1); // ±5% variation
  
  const actualPace = basePace * progression * randomVariation;
  const actualDuration = baseDistance * actualPace;
  
  return {
    date: plannedWorkout.date,
    workoutType: plannedWorkout.type,
    distance: baseDistance,
    duration: actualDuration,
    avgPace: actualPace,
    avgHeartRate: 140 + Math.floor(Math.random() * 30),
    rpe: Math.min(10, Math.max(1, 6 + Math.floor(Math.random() * 3))),
    conditions: {
      temperature: 15 + Math.floor(Math.random() * 20),
      humidity: 40 + Math.floor(Math.random() * 40),
      wind: ['calm', 'light', 'moderate'][Math.floor(Math.random() * 3)]
    }
  };
}

function calculateWeeklyFitnessMetrics(weekHistory: PerformanceData[], week: number): FitnessMetrics {
  const baseVDOT = 48 + (week * 0.3); // Progressive improvement
  const weekLoad = weekHistory.reduce((sum, w) => sum + (w.distance * w.rpe), 0);
  
  return {
    vdot: baseVDOT + (Math.random() * 2 - 1), // Some variation
    criticalSpeed: 13.5 + (week * 0.1),
    lactateThreshold: 12.2 + (week * 0.05),
    aerobicCapacity: 55 + (week * 0.5),
    runningEconomy: 190 + (Math.random() * 10 - 5),
    trainingLoad: {
      acute: weekLoad,
      chronic: weekLoad * (0.9 + (week * 0.02)),
      ratio: 0.8 + (week * 0.05) + (Math.random() * 0.3)
    },
    injuryRisk: Math.max(0, Math.min(100, 15 + (week * 2) + (Math.random() * 10 - 5))),
    recoveryScore: Math.max(0, Math.min(100, 85 - (week * 1.5) + (Math.random() * 20 - 10)))
  };
}

function calculatePaceConsistency(workouts: PerformanceData[]): number {
  if (workouts.length < 2) return 100;
  
  const paces = workouts.map(w => w.avgPace);
  const avgPace = paces.reduce((sum, p) => sum + p, 0) / paces.length;
  const variance = paces.reduce((sum, p) => sum + Math.pow(p - avgPace, 2), 0) / paces.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / avgPace) * 100;
  
  return Math.max(0, 100 - cv * 10); // Convert CV to consistency percentage
}

function generatePerformancePredictions(currentMetrics: FitnessMetrics) {
  const vdot = currentMetrics.vdot;
  const improvement = 1.05; // 5% improvement assumption
  
  return {
    '5K': {
      current: vdotToPace(vdot, 5),
      predicted: vdotToPace(vdot * improvement, 5)
    },
    '10K': {
      current: vdotToPace(vdot, 10),
      predicted: vdotToPace(vdot * improvement, 10)
    },
    'Half Marathon': {
      current: vdotToPace(vdot, 21.1),
      predicted: vdotToPace(vdot * improvement, 21.1)
    },
    'Marathon': {
      current: vdotToPace(vdot, 42.2),
      predicted: vdotToPace(vdot * improvement, 42.2)
    }
  };
}

function vdotToPace(vdot: number, distance: number): number {
  // Simplified VDOT to pace conversion (minutes per km)
  const basePace = 360 / vdot; // Rough approximation
  const distanceFactor = distance < 10 ? 0.9 : distance < 25 ? 1.0 : 1.1;
  return basePace * distanceFactor;
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.floor((totalMinutes % 1) * 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

function generateTrainingRecommendations(fitnessEvolution: FitnessMetrics[], performanceHistory: PerformanceData[]) {
  const recommendations = [];
  const currentMetrics = fitnessEvolution[fitnessEvolution.length - 1];
  const avgTrainingLoad = fitnessEvolution.reduce((sum, m) => sum + m.trainingLoad.ratio, 0) / fitnessEvolution.length;
  
  if (currentMetrics.trainingLoad.ratio > 1.3) {
    recommendations.push({
      category: 'Training Load',
      recommendation: 'Reduce training volume by 15-20% this week',
      rationale: 'Training load ratio indicates high fatigue accumulation',
      priority: 'High',
      implementation: 'Replace one quality session with easy aerobic running'
    });
  }
  
  if (currentMetrics.injuryRisk > 25) {
    recommendations.push({
      category: 'Injury Prevention',
      recommendation: 'Increase recovery and mobility work',
      rationale: 'Injury risk score exceeds recommended threshold',
      priority: 'High',
      implementation: 'Add 15-20 minutes daily stretching and foam rolling'
    });
  }
  
  const easyWorkouts = performanceHistory.filter(w => w.workoutType.toLowerCase().includes('easy'));
  const avgEasyRPE = easyWorkouts.reduce((sum, w) => sum + w.rpe, 0) / easyWorkouts.length;
  
  if (avgEasyRPE > 6) {
    recommendations.push({
      category: 'Easy Day Intensity',
      recommendation: 'Slow down easy run pace',
      rationale: 'Easy runs averaging RPE > 6 may impede recovery',
      priority: 'Medium',
      implementation: 'Run easy days 30-60 seconds per km slower'
    });
  }
  
  return recommendations;
}

function analyzeTrainingEffectiveness(fitnessEvolution: FitnessMetrics[], performanceHistory: PerformanceData[]) {
  const insights = [];
  const actions = [];
  
  // VDOT progression analysis
  const vdotTrend = fitnessEvolution[fitnessEvolution.length - 1].vdot - fitnessEvolution[0].vdot;
  if (vdotTrend > 2) {
    insights.push('Strong fitness gains - current training approach is effective');
  } else if (vdotTrend < 0.5) {
    insights.push('Limited fitness gains - training may need adjustment');
    actions.push('Consider increasing training stimulus or variety');
  }
  
  // Training load consistency
  const loadVariability = calculateVariability(fitnessEvolution.map(m => m.trainingLoad.ratio));
  if (loadVariability > 0.3) {
    insights.push('High training load variability may indicate inconsistent adaptation');
    actions.push('Aim for more consistent week-to-week training loads');
  }
  
  // Recovery patterns
  const avgRecovery = fitnessEvolution.reduce((sum, m) => sum + m.recoveryScore, 0) / fitnessEvolution.length;
  if (avgRecovery < 70) {
    insights.push('Low average recovery scores suggest inadequate rest');
    actions.push('Prioritize sleep quality and stress management');
  }
  
  return { insights, actions };
}

function calculateVariability(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function getFitnessLevel(vdot: number): string {
  if (vdot < 35) return 'Beginner';
  if (vdot < 45) return 'Recreational';
  if (vdot < 55) return 'Competitive';
  if (vdot < 65) return 'Advanced';
  return 'Elite';
}

function getRiskLevel(risk: number): string {
  if (risk < 15) return 'Low';
  if (risk < 25) return 'Moderate';
  if (risk < 35) return 'High';
  return 'Very High';
}

function getLoadStatus(ratio: number): string {
  if (ratio < 0.8) return 'Recovery';
  if (ratio < 1.0) return 'Optimal';
  if (ratio < 1.3) return 'Building';
  return 'High Risk';
}

// Export for use in other examples
export { performanceMonitoringExample };

// Run if called directly
if (require.main === module) {
  performanceMonitoringExample().catch(console.error);
}