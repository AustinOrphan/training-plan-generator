import {
  TrainingPlan,
  PlannedWorkout,
  CompletedWorkout,
  RecoveryMetrics,
  ProgressData,
  TrainingBlock,
  WeeklyMicrocycle,
  WorkoutType,
  TrainingPhase,
  RunData
} from './types';
import { 
  calculateTrainingLoad,
  calculateRecoveryScore,
  calculateInjuryRisk,
  calculateFitnessMetrics,
  analyzeWeeklyPatterns,
  calculateTSS
} from './calculator';
import { WORKOUT_TEMPLATES } from './workouts';
import { differenceInDays, addDays, startOfWeek, isSameDay } from 'date-fns';

/**
 * Interface for training plan adaptation engines
 */
/**
 * Plan modification types for different adaptation strategies
 */
export type ModificationType = 'reduce_volume' | 'reduce_intensity' | 'add_recovery' | 'substitute_workout' | 'delay_progression' | 'injury_protocol';

export interface AdaptationEngine {
  /**
   * Analyze workout completion and performance data
   */
  analyzeProgress(
    completedWorkouts: CompletedWorkout[],
    plannedWorkouts: PlannedWorkout[]
  ): ProgressData;
  
  /**
   * Suggest modifications based on progress and recovery
   */
  suggestModifications(
    plan: TrainingPlan,
    progress: ProgressData,
    recovery?: RecoveryMetrics
  ): PlanModification[];
  
  /**
   * Apply modifications to the training plan
   */
  applyModifications(
    plan: TrainingPlan,
    modifications: PlanModification[]
  ): TrainingPlan;
  
  /**
   * Check if adaptation is needed based on current metrics
   */
  needsAdaptation(
    progress: ProgressData,
    recovery?: RecoveryMetrics
  ): boolean;
}

/**
 * Represents a suggested modification to the training plan
 */
export interface PlanModification {
  type: ModificationType;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  workoutIds?: string[];
  suggestedChanges: {
    volumeReduction?: number; // Percentage
    intensityReduction?: number; // Percentage
    substituteWorkoutType?: WorkoutType;
    additionalRecoveryDays?: number;
    delayDays?: number;
  };
}

/**
 * Smart adaptation engine implementing scientific training principles
 */
export class SmartAdaptationEngine implements AdaptationEngine {
  private readonly SAFE_ACWR_LOWER = 0.8;
  private readonly SAFE_ACWR_UPPER = 1.3;
  private readonly HIGH_RISK_ACWR = 1.5;
  private readonly MIN_RECOVERY_SCORE = 60;
  private readonly HIGH_FATIGUE_THRESHOLD = 80;
  private readonly OVERREACHING_TSS_THRESHOLD = 150; // Daily TSS indicating overreaching
  private readonly CHRONIC_FATIGUE_DAYS = 5; // Days of high fatigue before intervention
  
  /**
   * Analyze workout completion and performance data
   */
  analyzeProgress(
    completedWorkouts: CompletedWorkout[],
    plannedWorkouts: PlannedWorkout[]
  ): ProgressData {
    const adherence = this.calculateAdherence(completedWorkouts, plannedWorkouts);
    const performanceTrend = this.analyzePerformanceTrend(completedWorkouts);
    const volumeProgress = this.analyzeVolumeProgress(completedWorkouts);
    const intensityDistribution = this.analyzeIntensityDistribution(completedWorkouts);
    
    // Convert completed workouts to RunData for fitness calculations
    const runData = this.convertToRunData(completedWorkouts);
    const fitnessMetrics = calculateFitnessMetrics(runData);
    const weeklyPatterns = analyzeWeeklyPatterns(runData);
    
    return {
      adherenceRate: adherence,
      completedWorkouts: completedWorkouts, // Array of completed workouts
      totalWorkouts: plannedWorkouts.length,
      performanceTrend,
      volumeProgress,
      intensityDistribution,
      currentFitness: {
        vdot: fitnessMetrics.vdot,
        weeklyMileage: weeklyPatterns.avgWeeklyMileage,
        longestRecentRun: Math.max(...runData.map(r => r.distance)),
        trainingAge: 1 // Would need more data
      },
      lastUpdateDate: new Date(),
      date: new Date()
    };
  }
  
  /**
   * Suggest modifications based on progress and recovery
   */
  suggestModifications(
    plan: TrainingPlan,
    progress: ProgressData,
    recovery?: RecoveryMetrics
  ): PlanModification[] {
    const modifications: PlanModification[] = [];
    
    // Check acute:chronic workload ratio
    const runData = this.convertToRunData(progress.completedWorkouts || []);
    const trainingLoad = calculateTrainingLoad(runData, 5.0); // Using 5:00/km as threshold pace
    
    if (trainingLoad.ratio > this.HIGH_RISK_ACWR) {
      modifications.push({
        type: 'reduce_volume',
        reason: `Acute:Chronic workload ratio (${trainingLoad.ratio.toFixed(2)}) exceeds safe threshold`,
        priority: 'high',
        suggestedChanges: {
          volumeReduction: 30
        }
      });
    } else if (trainingLoad.ratio > this.SAFE_ACWR_UPPER) {
      modifications.push({
        type: 'reduce_intensity',
        reason: `Elevated training load (A:C ratio ${trainingLoad.ratio.toFixed(2)})`,
        priority: 'medium',
        suggestedChanges: {
          intensityReduction: 20
        }
      });
    }
    
    // Check recovery metrics
    if (recovery) {
      const overallRecovery = this.calculateOverallRecovery(recovery);
      
      if (overallRecovery < this.MIN_RECOVERY_SCORE) {
        modifications.push({
          type: 'add_recovery',
          reason: `Low recovery score (${overallRecovery}), indicating high fatigue`,
          priority: 'high',
          suggestedChanges: {
            additionalRecoveryDays: 2,
            intensityReduction: 30
          }
        });
      }
      
      // Check for injury or illness
      if (recovery.injuryStatus === 'injured' || recovery.illnessStatus === 'sick') {
        modifications.push({
          type: 'injury_protocol',
          reason: recovery.injuryStatus === 'injured' ? 'Injury reported' : 'Illness reported',
          priority: 'high',
          suggestedChanges: {
            substituteWorkoutType: 'recovery',
            volumeReduction: recovery.injuryStatus === 'injured' ? 100 : 50
          }
        });
      }
    }
    
    // Check adherence and performance trends
    if (progress.adherenceRate < 0.7) {
      modifications.push({
        type: 'reduce_volume',
        reason: `Low adherence rate (${(progress.adherenceRate * 100).toFixed(0)}%)`,
        priority: 'medium',
        suggestedChanges: {
          volumeReduction: 20,
          delayDays: 7
        }
      });
    }
    
    if (progress.performanceTrend === 'declining') {
      modifications.push({
        type: 'delay_progression',
        reason: 'Performance trend showing decline',
        priority: 'medium',
        suggestedChanges: {
          delayDays: 7,
          intensityReduction: 15
        }
      });
    }
    
    return modifications;
  }
  
  /**
   * Apply modifications to the training plan
   */
  applyModifications(
    plan: TrainingPlan,
    modifications: PlanModification[]
  ): TrainingPlan {
    let modifiedPlan = { ...plan };
    
    // Sort modifications by priority
    const sortedMods = modifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    sortedMods.forEach(mod => {
      switch (mod.type) {
        case 'reduce_volume':
          modifiedPlan = this.applyVolumeReduction(modifiedPlan, mod);
          break;
        case 'reduce_intensity':
          modifiedPlan = this.applyIntensityReduction(modifiedPlan, mod);
          break;
        case 'add_recovery':
          modifiedPlan = this.addRecoveryDays(modifiedPlan, mod);
          break;
        case 'substitute_workout':
          modifiedPlan = this.substituteWorkouts(modifiedPlan, mod);
          break;
        case 'delay_progression':
          modifiedPlan = this.delayProgression(modifiedPlan, mod);
          break;
        case 'injury_protocol':
          modifiedPlan = this.applyInjuryProtocol(modifiedPlan, mod);
          break;
      }
    });
    
    return modifiedPlan;
  }
  
  /**
   * Check if adaptation is needed based on current metrics
   */
  needsAdaptation(
    progress: ProgressData,
    recovery?: RecoveryMetrics
  ): boolean {
    // Check training load
    const runData = this.convertToRunData(progress.completedWorkouts || []);
    const trainingLoad = calculateTrainingLoad(runData, 5.0);
    
    if (trainingLoad.ratio > this.SAFE_ACWR_UPPER || trainingLoad.ratio < this.SAFE_ACWR_LOWER) {
      return true;
    }
    
    // Check recovery
    if (recovery) {
      const overallRecovery = this.calculateOverallRecovery(recovery);
      if (overallRecovery < this.MIN_RECOVERY_SCORE) {
        return true;
      }
      
      if (recovery.injuryStatus === 'injured' || recovery.illnessStatus === 'sick') {
        return true;
      }
    }
    
    // Check adherence
    if (progress.adherenceRate < 0.7) {
      return true;
    }
    
    // Check performance trend
    if (progress.performanceTrend === 'declining') {
      return true;
    }
    
    return false;
  }
  
  /**
   * Calculate adherence rate
   */
  private calculateAdherence(
    completed: CompletedWorkout[],
    planned: PlannedWorkout[]
  ): number {
    if (planned.length === 0) return 1;
    
    const now = new Date();
    const pastPlanned = planned.filter(w => w.date <= now);
    
    if (pastPlanned.length === 0) return 1;
    
    return completed.length / pastPlanned.length;
  }
  
  /**
   * Analyze performance trend from completed workouts
   */
  private analyzePerformanceTrend(
    completed: CompletedWorkout[]
  ): 'improving' | 'stable' | 'declining' {
    if (completed.length < 5) return 'stable';
    
    // Look at recent workouts vs older workouts
    const sortedByDate = [...completed].sort((a, b) => a.date.getTime() - b.date.getTime());
    const midpoint = Math.floor(sortedByDate.length / 2);
    
    const olderWorkouts = sortedByDate.slice(0, midpoint);
    const recentWorkouts = sortedByDate.slice(midpoint);
    
    // Compare average pace relative to effort
    const olderAvgRelativePace = this.calculateAverageRelativePace(olderWorkouts);
    const recentAvgRelativePace = this.calculateAverageRelativePace(recentWorkouts);
    
    const improvement = ((olderAvgRelativePace - recentAvgRelativePace) / olderAvgRelativePace) * 100;
    
    if (improvement > 2) return 'improving';
    if (improvement < -2) return 'declining';
    return 'stable';
  }
  
  /**
   * Calculate average pace adjusted for effort level
   */
  private calculateAverageRelativePace(workouts: CompletedWorkout[]): number {
    const validWorkouts = workouts.filter(w => w.actualDistance && w.actualDuration && w.perceivedEffort);
    
    if (validWorkouts.length === 0) return 0;
    
    const relativePaces = validWorkouts.map(w => {
      const pace = w.actualDuration! / w.actualDistance!;
      const effortAdjustment = w.perceivedEffort! / 10; // Normalize to 0-1
      return pace / effortAdjustment; // Lower is better
    });
    
    return relativePaces.reduce((sum, pace) => sum + pace, 0) / relativePaces.length;
  }
  
  /**
   * Analyze volume progression
   */
  private analyzeVolumeProgress(completed: CompletedWorkout[]): {
    weeklyAverage: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  } {
    // Group by week
    const weeklyVolumes = new Map<string, number>();
    
    completed.forEach(workout => {
      if (workout.actualDistance) {
        const weekStart = startOfWeek(workout.date);
        const weekKey = weekStart.toISOString();
        weeklyVolumes.set(weekKey, (weeklyVolumes.get(weekKey) || 0) + workout.actualDistance);
      }
    });
    
    const volumes = Array.from(weeklyVolumes.values());
    const average = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    
    // Simple trend analysis
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (volumes.length >= 3) {
      const firstThird = volumes.slice(0, Math.floor(volumes.length / 3));
      const lastThird = volumes.slice(-Math.floor(volumes.length / 3));
      
      const firstAvg = firstThird.reduce((sum, v) => sum + v, 0) / firstThird.length;
      const lastAvg = lastThird.reduce((sum, v) => sum + v, 0) / lastThird.length;
      
      if (lastAvg > firstAvg * 1.1) trend = 'increasing';
      else if (lastAvg < firstAvg * 0.9) trend = 'decreasing';
    }
    
    return { weeklyAverage: average, trend };
  }
  
  /**
   * Analyze intensity distribution
   */
  private analyzeIntensityDistribution(completed: CompletedWorkout[]): {
    easy: number;
    moderate: number;
    hard: number;
    veryHard: number;
  } {
    let easy = 0;
    let moderate = 0;
    let hard = 0;
    let veryHard = 0;
    
    completed.forEach(workout => {
      const effort = workout.perceivedEffort || 5;
      if (effort <= 3) easy++;
      else if (effort <= 6) moderate++;
      else if (effort <= 8) hard++;
      else veryHard++;
    });
    
    const total = easy + moderate + hard + veryHard || 1;
    
    return {
      easy: Math.round((easy / total) * 100),
      moderate: Math.round((moderate / total) * 100),
      hard: Math.round((hard / total) * 100),
      veryHard: Math.round((veryHard / total) * 100)
    };
  }
  
  /**
   * Convert completed workouts to run data for calculations
   */
  private convertToRunData(completed: CompletedWorkout[]): RunData[] {
    return completed.map(workout => ({
      id: workout.workoutId,
      date: workout.date,
      distance: workout.actualDistance || 0,
      duration: workout.actualDuration || 0,
      avgPace: workout.actualDuration && workout.actualDistance 
        ? workout.actualDuration / workout.actualDistance 
        : undefined,
      avgHeartRate: workout.avgHeartRate,
      elevation: 0,
      effortLevel: workout.perceivedEffort,
      notes: workout.notes || ''
    }));
  }
  
  /**
   * Enhanced recovery score assessment using multiple data points
   */
  assessRecoveryStatus(
    completedWorkouts: CompletedWorkout[],
    recovery?: RecoveryMetrics
  ): {
    score: number;
    status: 'recovered' | 'adequate' | 'fatigued' | 'overreached';
    recommendations: string[];
  } {
    const runData = this.convertToRunData(completedWorkouts);
    
    // Calculate base recovery score from recent training
    const baseRecoveryScore = calculateRecoveryScore(
      runData,
      recovery?.restingHR,
      recovery?.hrv
    );
    
    // Enhance with additional recovery metrics
    const enhancedScore = recovery 
      ? this.calculateOverallRecovery(recovery)
      : baseRecoveryScore;
    
    // Determine recovery status
    let status: 'recovered' | 'adequate' | 'fatigued' | 'overreached';
    if (enhancedScore >= 80) status = 'recovered';
    else if (enhancedScore >= 60) status = 'adequate';
    else if (enhancedScore >= 40) status = 'fatigued';
    else status = 'overreached';
    
    // Generate recommendations
    const recommendations = this.generateRecoveryRecommendations(
      enhancedScore,
      status,
      runData,
      recovery
    );
    
    return { score: enhancedScore, status, recommendations };
  }
  
  /**
   * Detect fatigue patterns and adjust workout intensity
   */
  detectFatigueAndAdjust(
    completedWorkouts: CompletedWorkout[],
    upcomingWorkouts: PlannedWorkout[],
    recovery?: RecoveryMetrics
  ): {
    fatigueLevel: 'low' | 'moderate' | 'high' | 'severe';
    adjustedWorkouts: PlannedWorkout[];
    warnings: string[];
  } {
    const runData = this.convertToRunData(completedWorkouts);
    const trainingLoad = calculateTrainingLoad(runData, 5.0);
    
    // Calculate fatigue indicators
    const acuteFatigue = this.calculateAcuteFatigue(completedWorkouts);
    const chronicFatigue = this.detectChronicFatigue(completedWorkouts);
    const tssOverload = this.detectTSSOverload(completedWorkouts);
    
    // Determine overall fatigue level
    let fatigueLevel: 'low' | 'moderate' | 'high' | 'severe';
    const warnings: string[] = [];
    
    if (chronicFatigue.days >= this.CHRONIC_FATIGUE_DAYS || tssOverload.consecutive >= 3) {
      fatigueLevel = 'severe';
      warnings.push('Severe fatigue detected - immediate rest recommended');
    } else if (acuteFatigue > 70 || trainingLoad.ratio > this.HIGH_RISK_ACWR) {
      fatigueLevel = 'high';
      warnings.push('High fatigue levels - reduce training intensity');
    } else if (acuteFatigue > 50 || trainingLoad.ratio > this.SAFE_ACWR_UPPER) {
      fatigueLevel = 'moderate';
      warnings.push('Moderate fatigue - monitor closely');
    } else {
      fatigueLevel = 'low';
    }
    
    // Adjust upcoming workouts based on fatigue level
    const adjustedWorkouts = this.adjustWorkoutsForFatigue(
      upcomingWorkouts,
      fatigueLevel,
      trainingLoad.ratio
    );
    
    return { fatigueLevel, adjustedWorkouts, warnings };
  }
  
  /**
   * Create overreaching risk assessment using acute:chronic ratios
   */
  assessOverreachingRisk(
    completedWorkouts: CompletedWorkout[],
    plannedWorkouts: PlannedWorkout[]
  ): {
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    acuteChronicRatio: number;
    weeklyLoadIncrease: number;
    projectedRisk: number;
    mitigationStrategies: string[];
  } {
    const runData = this.convertToRunData(completedWorkouts);
    const trainingLoad = calculateTrainingLoad(runData, 5.0);
    const weeklyPatterns = analyzeWeeklyPatterns(runData);
    
    // Calculate weekly load increase
    const recentWeekMileage = runData
      .filter(run => run.date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((sum, run) => sum + run.distance, 0);
    
    const weeklyLoadIncrease = weeklyPatterns.avgWeeklyMileage > 0
      ? ((recentWeekMileage - weeklyPatterns.avgWeeklyMileage) / weeklyPatterns.avgWeeklyMileage) * 100
      : 0;
    
    // Calculate current injury risk
    const recoveryScore = calculateRecoveryScore(runData);
    const currentRisk = calculateInjuryRisk(trainingLoad, weeklyLoadIncrease, recoveryScore);
    
    // Project future risk based on planned workouts
    const projectedRisk = this.projectFutureRisk(
      completedWorkouts,
      plannedWorkouts,
      trainingLoad.ratio
    );
    
    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    if (currentRisk >= 80 || projectedRisk >= 90) {
      riskLevel = 'critical';
    } else if (currentRisk >= 60 || projectedRisk >= 70) {
      riskLevel = 'high';
    } else if (currentRisk >= 40 || projectedRisk >= 50) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'low';
    }
    
    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(
      riskLevel,
      trainingLoad.ratio,
      weeklyLoadIncrease,
      recoveryScore
    );
    
    return {
      riskLevel,
      acuteChronicRatio: trainingLoad.ratio,
      weeklyLoadIncrease,
      projectedRisk,
      mitigationStrategies
    };
  }
  
  /**
   * Calculate acute fatigue score
   */
  private calculateAcuteFatigue(completedWorkouts: CompletedWorkout[]): number {
    const recentWorkouts = completedWorkouts.filter(
      w => w.date > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    );
    
    let fatigueScore = 0;
    
    recentWorkouts.forEach(workout => {
      // Factor in perceived effort
      const effortContribution = (workout.perceivedEffort || 5) * 2;
      
      // Factor in workout completion
      const completionRate = workout.actualDuration && workout.plannedDuration
        ? workout.actualDuration / workout.plannedDuration
        : 1;
      
      // Lower completion might indicate fatigue
      if (completionRate < 0.9) {
        fatigueScore += 10;
      }
      
      // High effort workouts increase fatigue
      if (workout.perceivedEffort && workout.perceivedEffort >= 8) {
        fatigueScore += effortContribution;
      }
      
      // Poor execution quality indicates fatigue
      if (workout.notes?.toLowerCase().includes('tired') || 
          workout.notes?.toLowerCase().includes('fatigue')) {
        fatigueScore += 15;
      }
    });
    
    return Math.min(100, fatigueScore);
  }
  
  /**
   * Detect chronic fatigue patterns
   */
  private detectChronicFatigue(completedWorkouts: CompletedWorkout[]): {
    detected: boolean;
    days: number;
    pattern: string;
  } {
    const sortedWorkouts = [...completedWorkouts].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    
    let consecutiveFatigueDays = 0;
    let maxConsecutive = 0;
    let pattern = 'none';
    
    sortedWorkouts.forEach((workout, index) => {
      const highEffort = workout.perceivedEffort && workout.perceivedEffort >= 7;
      const poorCompletion = workout.actualDuration && workout.plannedDuration
        ? workout.actualDuration / workout.plannedDuration < 0.85
        : false;
      
      if (highEffort && poorCompletion) {
        consecutiveFatigueDays++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveFatigueDays);
      } else {
        consecutiveFatigueDays = 0;
      }
    });
    
    if (maxConsecutive >= this.CHRONIC_FATIGUE_DAYS) {
      pattern = 'persistent_underperformance';
    } else if (maxConsecutive >= 3) {
      pattern = 'emerging_fatigue';
    }
    
    return {
      detected: maxConsecutive >= 3,
      days: maxConsecutive,
      pattern
    };
  }
  
  /**
   * Detect TSS overload patterns
   */
  private detectTSSOverload(completedWorkouts: CompletedWorkout[]): {
    detected: boolean;
    consecutive: number;
    maxDailyTSS: number;
  } {
    // Group workouts by day
    const dailyTSS = new Map<string, number>();
    
    completedWorkouts.forEach(workout => {
      const dateKey = workout.date.toISOString().split('T')[0];
      const workoutTSS = this.estimateWorkoutTSS(workout);
      dailyTSS.set(dateKey, (dailyTSS.get(dateKey) || 0) + workoutTSS);
    });
    
    // Check for consecutive high TSS days
    const sortedDays = Array.from(dailyTSS.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    let consecutiveHighDays = 0;
    let maxConsecutive = 0;
    let maxDailyTSS = 0;
    
    sortedDays.forEach(([date, tss]) => {
      maxDailyTSS = Math.max(maxDailyTSS, tss);
      
      if (tss > this.OVERREACHING_TSS_THRESHOLD) {
        consecutiveHighDays++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveHighDays);
      } else {
        consecutiveHighDays = 0;
      }
    });
    
    return {
      detected: maxConsecutive >= 2,
      consecutive: maxConsecutive,
      maxDailyTSS
    };
  }
  
  /**
   * Estimate TSS for a completed workout
   */
  private estimateWorkoutTSS(workout: CompletedWorkout): number {
    if (!workout.actualDuration) return 0;
    
    // Simple estimation based on duration and effort
    const intensityFactor = (workout.perceivedEffort || 5) / 10;
    const tss = (workout.actualDuration * Math.pow(intensityFactor, 2) * 100) / 60;
    
    return Math.round(tss);
  }
  
  /**
   * Adjust workouts based on fatigue level
   */
  private adjustWorkoutsForFatigue(
    workouts: PlannedWorkout[],
    fatigueLevel: 'low' | 'moderate' | 'high' | 'severe',
    acwr: number
  ): PlannedWorkout[] {
    const adjustmentFactors = {
      low: { volume: 1.0, intensity: 1.0 },
      moderate: { volume: 0.9, intensity: 0.95 },
      high: { volume: 0.7, intensity: 0.85 },
      severe: { volume: 0.5, intensity: 0.7 }
    };
    
    const factors = adjustmentFactors[fatigueLevel];
    
    return workouts.map(workout => {
      // Only adjust future workouts
      if (workout.date <= new Date()) return workout;
      
      // Skip recovery workouts
      if (workout.type === 'recovery') return workout;
      
      // Apply adjustments
      return {
        ...workout,
        name: `${workout.name} (Adjusted for ${fatigueLevel} fatigue)`,
        targetMetrics: {
          ...workout.targetMetrics,
          duration: Math.round(workout.targetMetrics.duration * factors.volume),
          distance: workout.targetMetrics.distance 
            ? workout.targetMetrics.distance * factors.volume 
            : undefined,
          intensity: Math.round(workout.targetMetrics.intensity * factors.intensity)
        },
        workout: {
          ...workout.workout,
          segments: workout.workout.segments.map(segment => ({
            ...segment,
            duration: Math.round(segment.duration * factors.volume),
            intensity: Math.round(segment.intensity * factors.intensity)
          }))
        }
      };
    });
  }
  
  /**
   * Generate recovery recommendations
   */
  private generateRecoveryRecommendations(
    score: number,
    status: string,
    runData: RunData[],
    recovery?: RecoveryMetrics
  ): string[] {
    const recommendations: string[] = [];
    
    if (status === 'overreached') {
      recommendations.push('Take 2-3 days of complete rest');
      recommendations.push('Focus on sleep quality (8+ hours)');
      recommendations.push('Consider massage or light stretching');
    } else if (status === 'fatigued') {
      recommendations.push('Reduce training intensity by 30%');
      recommendations.push('Add an extra recovery day this week');
      recommendations.push('Prioritize hydration and nutrition');
    }
    
    // Specific recommendations based on metrics
    if (recovery?.sleepQuality && recovery.sleepQuality < 6) {
      recommendations.push('Improve sleep hygiene - aim for consistent bedtime');
    }
    
    if (recovery?.muscleSoreness && recovery.muscleSoreness > 7) {
      recommendations.push('Consider foam rolling and dynamic stretching');
    }
    
    if (recovery?.hrv && recovery.hrv < 40) {
      recommendations.push('HRV is low - reduce stress and training load');
    }
    
    return recommendations;
  }
  
  /**
   * Project future injury risk
   */
  private projectFutureRisk(
    completed: CompletedWorkout[],
    planned: PlannedWorkout[],
    currentACWR: number
  ): number {
    // Estimate future training load based on planned workouts
    const upcomingWeek = planned.filter(
      w => w.date > new Date() && w.date < addDays(new Date(), 7)
    );
    
    const plannedTSS = upcomingWeek.reduce((sum, workout) => {
      return sum + (workout.workout.estimatedTSS || 50);
    }, 0);
    
    // Project new ACWR
    const projectedACWR = currentACWR + (plannedTSS / 350); // Rough estimation
    
    // Calculate projected risk
    let risk = 0;
    if (projectedACWR > 1.5) risk += 40;
    else if (projectedACWR > 1.3) risk += 25;
    else if (projectedACWR < 0.8) risk += 20;
    
    // Add current fatigue contribution
    const recentHighIntensity = completed
      .filter(w => w.date > addDays(new Date(), -7))
      .filter(w => w.perceivedEffort && w.perceivedEffort >= 8)
      .length;
    
    risk += recentHighIntensity * 10;
    
    return Math.min(100, risk);
  }
  
  /**
   * Generate mitigation strategies for injury risk
   */
  private generateMitigationStrategies(
    riskLevel: string,
    acwr: number,
    weeklyIncrease: number,
    recoveryScore: number
  ): string[] {
    const strategies: string[] = [];
    
    if (riskLevel === 'critical' || riskLevel === 'high') {
      strategies.push('Immediately reduce training volume by 30-40%');
      strategies.push('Replace high-intensity workouts with easy recovery runs');
      strategies.push('Schedule professional assessment if pain persists');
    }
    
    if (acwr > 1.3) {
      strategies.push('Gradually reduce training load over 2 weeks');
      strategies.push('Focus on maintaining fitness rather than building');
    }
    
    if (weeklyIncrease > 10) {
      strategies.push('Limit weekly mileage increases to 10%');
      strategies.push('Add recovery weeks every 3-4 weeks');
    }
    
    if (recoveryScore < 60) {
      strategies.push('Prioritize sleep and nutrition');
      strategies.push('Consider cross-training activities');
      strategies.push('Monitor morning heart rate variability');
    }
    
    return strategies;
  }
  
  /**
   * Calculate overall recovery score from metrics
   */
  private calculateOverallRecovery(recovery: RecoveryMetrics): number {
    let score = 70; // Base score
    
    // Sleep quality contribution (0-20 points)
    if (recovery.sleepQuality) {
      score += (recovery.sleepQuality - 5) * 4;
    }
    
    // Muscle soreness contribution (0-20 points)
    if (recovery.muscleSoreness) {
      score -= (recovery.muscleSoreness - 5) * 4;
    }
    
    // Energy level contribution (0-20 points)
    if (recovery.energyLevel) {
      score += (recovery.energyLevel - 5) * 4;
    }
    
    // HRV contribution if available (0-10 points)
    if (recovery.hrv) {
      if (recovery.hrv > 60) score += 10;
      else if (recovery.hrv > 50) score += 5;
      else if (recovery.hrv < 40) score -= 10;
    }
    
    // Resting HR contribution if available (0-10 points)
    if (recovery.restingHR) {
      if (recovery.restingHR < 50) score += 10;
      else if (recovery.restingHR < 60) score += 5;
      else if (recovery.restingHR > 70) score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Apply volume reduction to workouts
   */
  private applyVolumeReduction(
    plan: TrainingPlan,
    modification: PlanModification
  ): TrainingPlan {
    const reduction = modification.suggestedChanges.volumeReduction || 20;
    const factor = 1 - (reduction / 100);
    
    const modifiedWorkouts = plan.workouts.map(workout => {
      // Only modify future workouts
      if (workout.date > new Date()) {
        return {
          ...workout,
          targetMetrics: {
            ...workout.targetMetrics,
            distance: workout.targetMetrics.distance ? workout.targetMetrics.distance * factor : undefined,
            duration: workout.targetMetrics.duration * factor
          }
        };
      }
      return workout;
    });
    
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  
  /**
   * Apply intensity reduction to workouts
   */
  private applyIntensityReduction(
    plan: TrainingPlan,
    modification: PlanModification
  ): TrainingPlan {
    const reduction = modification.suggestedChanges.intensityReduction || 20;
    const factor = 1 - (reduction / 100);
    
    const modifiedWorkouts = plan.workouts.map(workout => {
      // Only modify future high-intensity workouts
      if (workout.date > new Date() && workout.targetMetrics.intensity > 80) {
        return {
          ...workout,
          targetMetrics: {
            ...workout.targetMetrics,
            intensity: workout.targetMetrics.intensity * factor
          },
          workout: {
            ...workout.workout,
            segments: workout.workout.segments.map(segment => ({
              ...segment,
              intensity: segment.intensity > 80 ? segment.intensity * factor : segment.intensity
            }))
          }
        };
      }
      return workout;
    });
    
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  
  /**
   * Add recovery days to the plan
   */
  private addRecoveryDays(
    plan: TrainingPlan,
    modification: PlanModification
  ): TrainingPlan {
    const additionalDays = modification.suggestedChanges.additionalRecoveryDays || 2;
    const futureWorkouts = plan.workouts.filter(w => w.date > new Date());
    
    // Convert next N hard workouts to recovery
    let converted = 0;
    const modifiedWorkouts = plan.workouts.map(workout => {
      if (
        workout.date > new Date() && 
        converted < additionalDays && 
        workout.targetMetrics.intensity > 75
      ) {
        converted++;
        return {
          ...workout,
          type: 'recovery' as WorkoutType,
          name: 'Recovery Run (Modified)',
          description: 'Easy recovery run - plan adjusted for fatigue',
          workout: {
            ...workout.workout,
            type: 'recovery' as WorkoutType,
            segments: [{
              duration: 30,
              intensity: 50,
              zone: { name: 'Recovery' },
              description: 'Very easy recovery pace'
            }]
          },
          targetMetrics: {
            ...workout.targetMetrics,
            intensity: 50,
            duration: 30
          }
        };
      }
      return workout;
    });
    
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  
  /**
   * Substitute workouts based on modification
   */
  private substituteWorkouts(
    plan: TrainingPlan,
    modification: PlanModification
  ): TrainingPlan {
    const substituteType = modification.suggestedChanges.substituteWorkoutType || 'easy';
    const workoutIds = modification.workoutIds || [];
    
    const modifiedWorkouts = plan.workouts.map(workout => {
      if (workoutIds.includes(workout.id) || (workoutIds.length === 0 && workout.date > new Date())) {
        return {
          ...workout,
          type: substituteType,
          name: `${substituteType.charAt(0).toUpperCase() + substituteType.slice(1)} Run (Substituted)`,
          description: `Workout substituted: ${modification.reason}`,
          workout: {
            ...workout.workout,
            type: substituteType
          }
        };
      }
      return workout;
    });
    
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  
  /**
   * Delay progression by shifting workouts
   */
  private delayProgression(
    plan: TrainingPlan,
    modification: PlanModification
  ): TrainingPlan {
    const delayDays = modification.suggestedChanges.delayDays || 7;
    
    const modifiedWorkouts = plan.workouts.map(workout => {
      if (workout.date > new Date()) {
        return {
          ...workout,
          date: addDays(workout.date, delayDays)
        };
      }
      return workout;
    });
    
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  
  /**
   * Apply injury or illness protocol
   */
  private applyInjuryProtocol(
    plan: TrainingPlan,
    modification: PlanModification
  ): TrainingPlan {
    const volumeReduction = modification.suggestedChanges.volumeReduction || 100;
    
    if (volumeReduction === 100) {
      // Complete rest - remove all workouts for next 7 days
      const oneWeekFromNow = addDays(new Date(), 7);
      const modifiedWorkouts = plan.workouts.filter(
        workout => workout.date < new Date() || workout.date > oneWeekFromNow
      );
      
      return {
        ...plan,
        workouts: modifiedWorkouts
      };
    } else {
      // Partial reduction - convert to recovery workouts
      return this.addRecoveryDays(plan, {
        ...modification,
        suggestedChanges: {
          ...modification.suggestedChanges,
          additionalRecoveryDays: 7
        }
      });
    }
  }
  
  /**
   * Create intelligent workout substitutions based on fatigue and goals
   */
  createSmartSubstitutions(
    originalWorkout: PlannedWorkout,
    reason: 'fatigue' | 'injury' | 'illness' | 'time_constraint' | 'weather'
  ): PlannedWorkout {
    const substitutionMap: Record<string, Record<WorkoutType, WorkoutType>> = {
      fatigue: {
        vo2max: 'tempo',
        threshold: 'steady',
        tempo: 'easy',
        speed: 'easy',
        hill_repeats: 'easy',
        long_run: 'easy',
        progression: 'steady',
        fartlek: 'easy',
        race_pace: 'steady',
        time_trial: 'tempo',
        easy: 'recovery',
        steady: 'easy',
        recovery: 'recovery',
        cross_training: 'recovery',
        strength: 'recovery'
      },
      injury: {
        vo2max: 'cross_training',
        threshold: 'cross_training',
        tempo: 'cross_training',
        speed: 'recovery',
        hill_repeats: 'recovery',
        long_run: 'cross_training',
        progression: 'easy',
        fartlek: 'easy',
        race_pace: 'easy',
        time_trial: 'easy',
        easy: 'recovery',
        steady: 'recovery',
        recovery: 'recovery',
        cross_training: 'cross_training',
        strength: 'recovery'
      },
      illness: {
        vo2max: 'recovery',
        threshold: 'recovery',
        tempo: 'easy',
        speed: 'recovery',
        hill_repeats: 'recovery',
        long_run: 'easy',
        progression: 'easy',
        fartlek: 'recovery',
        race_pace: 'easy',
        time_trial: 'recovery',
        easy: 'recovery',
        steady: 'recovery',
        recovery: 'recovery',
        cross_training: 'recovery',
        strength: 'recovery'
      },
      time_constraint: {
        long_run: 'tempo',
        vo2max: 'fartlek',
        threshold: 'tempo',
        tempo: 'tempo',
        speed: 'speed',
        hill_repeats: 'tempo',
        progression: 'tempo',
        fartlek: 'fartlek',
        race_pace: 'tempo',
        time_trial: 'tempo',
        easy: 'easy',
        steady: 'steady',
        recovery: 'recovery',
        cross_training: 'cross_training',
        strength: 'strength'
      },
      weather: {
        speed: 'tempo',
        vo2max: 'threshold',
        hill_repeats: 'tempo',
        long_run: 'long_run',
        threshold: 'tempo',
        tempo: 'steady',
        progression: 'steady',
        fartlek: 'tempo',
        race_pace: 'tempo',
        time_trial: 'tempo',
        easy: 'easy',
        steady: 'steady',
        recovery: 'recovery',
        cross_training: 'cross_training',
        strength: 'strength'
      }
    };
    
    const newType = substitutionMap[reason][originalWorkout.type] || 'easy';
    const template = this.selectAppropriateTemplate(newType, originalWorkout.targetMetrics.duration);
    
    return {
      ...originalWorkout,
      type: newType,
      name: `${this.getWorkoutName(newType)} (Substituted due to ${reason})`,
      description: `Original ${originalWorkout.type} workout modified due to ${reason}`,
      workout: template,
      targetMetrics: {
        ...originalWorkout.targetMetrics,
        intensity: template.segments.reduce((sum, s) => sum + s.intensity, 0) / template.segments.length,
        tss: template.estimatedTSS,
        load: template.estimatedTSS
      }
    };
  }
  
  /**
   * Select appropriate workout template based on type and duration
   */
  private selectAppropriateTemplate(type: WorkoutType, targetDuration: number): any {
    const templates = {
      recovery: WORKOUT_TEMPLATES.RECOVERY_JOG,
      easy: WORKOUT_TEMPLATES.EASY_AEROBIC,
      steady: WORKOUT_TEMPLATES.EASY_AEROBIC,
      tempo: WORKOUT_TEMPLATES.TEMPO_CONTINUOUS,
      threshold: WORKOUT_TEMPLATES.LACTATE_THRESHOLD_2X20,
      vo2max: WORKOUT_TEMPLATES.VO2MAX_4X4,
      speed: WORKOUT_TEMPLATES.SPEED_200M_REPS,
      hill_repeats: WORKOUT_TEMPLATES.HILL_REPEATS_6X2,
      fartlek: WORKOUT_TEMPLATES.FARTLEK_VARIED,
      progression: WORKOUT_TEMPLATES.PROGRESSION_3_STAGE,
      long_run: WORKOUT_TEMPLATES.LONG_RUN,
      race_pace: WORKOUT_TEMPLATES.TEMPO_CONTINUOUS,
      time_trial: WORKOUT_TEMPLATES.THRESHOLD_PROGRESSION,
      cross_training: WORKOUT_TEMPLATES.EASY_AEROBIC,
      strength: WORKOUT_TEMPLATES.RECOVERY_JOG
    };
    
    const template = templates[type] || WORKOUT_TEMPLATES.EASY_AEROBIC;
    
    // Adjust duration if needed
    if (targetDuration < 45 && template.segments.reduce((sum, s) => sum + s.duration, 0) > 60) {
      // Scale down workout duration
      const scaleFactor = targetDuration / template.segments.reduce((sum, s) => sum + s.duration, 0);
      return {
        ...template,
        segments: template.segments.map(s => ({
          ...s,
          duration: Math.round(s.duration * scaleFactor)
        }))
      };
    }
    
    return template;
  }
  
  /**
   * Create recovery protocol for injury or illness
   */
  createRecoveryProtocol(
    condition: 'injury' | 'illness',
    severity: 'mild' | 'moderate' | 'severe',
    affectedArea?: string
  ): {
    phases: RecoveryPhase[];
    guidelines: string[];
    returnCriteria: string[];
  } {
    const recoveryPhases: RecoveryPhase[] = [];
    
    if (condition === 'injury') {
      if (severity === 'mild') {
        recoveryPhases.push(
          {
            name: 'Acute Phase',
            duration: 3,
            workouts: ['recovery', 'cross_training'],
            volumePercent: 30,
            intensityLimit: 60,
            focus: 'Pain reduction and healing'
          },
          {
            name: 'Return Phase',
            duration: 4,
            workouts: ['easy', 'recovery', 'cross_training'],
            volumePercent: 50,
            intensityLimit: 70,
            focus: 'Gradual loading'
          },
          {
            name: 'Build Phase',
            duration: 7,
            workouts: ['easy', 'steady', 'tempo'],
            volumePercent: 80,
            intensityLimit: 85,
            focus: 'Progressive return'
          }
        );
      } else if (severity === 'moderate') {
        recoveryPhases.push(
          {
            name: 'Rest Phase',
            duration: 7,
            workouts: ['recovery', 'cross_training'],
            volumePercent: 0,
            intensityLimit: 50,
            focus: 'Complete rest or cross-training only'
          },
          {
            name: 'Return to Running',
            duration: 7,
            workouts: ['recovery', 'easy'],
            volumePercent: 25,
            intensityLimit: 65,
            focus: 'Walk-run progression'
          },
          {
            name: 'Base Rebuild',
            duration: 14,
            workouts: ['easy', 'steady'],
            volumePercent: 60,
            intensityLimit: 75,
            focus: 'Aerobic base reconstruction'
          }
        );
      } else {
        recoveryPhases.push(
          {
            name: 'Medical Phase',
            duration: 14,
            workouts: [],
            volumePercent: 0,
            intensityLimit: 0,
            focus: 'Medical treatment and complete rest'
          },
          {
            name: 'Rehabilitation',
            duration: 21,
            workouts: ['recovery'],
            volumePercent: 10,
            intensityLimit: 50,
            focus: 'Guided return with medical clearance'
          },
          {
            name: 'Reconditioning',
            duration: 28,
            workouts: ['recovery', 'easy'],
            volumePercent: 40,
            intensityLimit: 65,
            focus: 'Very gradual fitness rebuild'
          }
        );
      }
    } else { // illness
      if (severity === 'mild') {
        recoveryPhases.push(
          {
            name: 'Symptom Phase',
            duration: 3,
            workouts: ['recovery'],
            volumePercent: 50,
            intensityLimit: 60,
            focus: 'Below neck symptoms only'
          },
          {
            name: 'Return Phase',
            duration: 4,
            workouts: ['easy', 'recovery'],
            volumePercent: 70,
            intensityLimit: 70,
            focus: 'Gradual return'
          }
        );
      } else {
        recoveryPhases.push(
          {
            name: 'Rest Phase',
            duration: 7,
            workouts: [],
            volumePercent: 0,
            intensityLimit: 0,
            focus: 'Complete rest until fever-free 24h'
          },
          {
            name: 'Easy Return',
            duration: 7,
            workouts: ['recovery', 'easy'],
            volumePercent: 30,
            intensityLimit: 65,
            focus: 'Very easy efforts only'
          },
          {
            name: 'Progressive Build',
            duration: 14,
            workouts: ['easy', 'steady', 'tempo'],
            volumePercent: 70,
            intensityLimit: 80,
            focus: 'Gradual intensity increase'
          }
        );
      }
    }
    
    const guidelines = this.generateRecoveryGuidelines(condition, severity, affectedArea);
    const returnCriteria = this.generateReturnCriteria(condition, severity);
    
    return { phases: recoveryPhases, guidelines, returnCriteria };
  }
  
  /**
   * Generate recovery guidelines
   */
  private generateRecoveryGuidelines(
    condition: string,
    severity: string,
    affectedArea?: string
  ): string[] {
    const guidelines: string[] = [];
    
    if (condition === 'injury') {
      guidelines.push('Follow RICE protocol (Rest, Ice, Compression, Elevation) for acute injuries');
      guidelines.push('Maintain fitness through cross-training if pain-free');
      guidelines.push('Focus on sleep quality (8+ hours) for optimal healing');
      guidelines.push('Ensure adequate protein intake (1.6-2.2g/kg body weight)');
      
      if (affectedArea?.includes('knee') || affectedArea?.includes('ankle')) {
        guidelines.push('Consider pool running or cycling for cardio maintenance');
        guidelines.push('Strengthen supporting muscles (glutes, core, calves)');
      }
      
      if (severity === 'severe') {
        guidelines.push('Seek professional medical evaluation');
        guidelines.push('Consider physical therapy for proper rehabilitation');
      }
    } else {
      guidelines.push('No exercise with fever or below-neck symptoms');
      guidelines.push('Stay hydrated and maintain electrolyte balance');
      guidelines.push('Return to activity should be gradual');
      guidelines.push('Monitor heart rate - may be elevated during recovery');
      
      if (severity !== 'mild') {
        guidelines.push('Wait 24-48 hours after last fever before any exercise');
        guidelines.push('First workout back should be 50% normal duration at easy pace');
      }
    }
    
    return guidelines;
  }
  
  /**
   * Generate return-to-running criteria
   */
  private generateReturnCriteria(condition: string, severity: string): string[] {
    const criteria: string[] = [];
    
    if (condition === 'injury') {
      criteria.push('Pain-free during daily activities');
      criteria.push('Full range of motion restored');
      criteria.push('No swelling or inflammation');
      
      if (severity !== 'mild') {
        criteria.push('Medical clearance obtained');
        criteria.push('Able to walk 30 minutes pain-free');
        criteria.push('Single-leg balance test passed');
      }
    } else {
      criteria.push('Fever-free for 24-48 hours');
      criteria.push('Resting heart rate returned to normal');
      criteria.push('Energy levels at 80% or better');
      criteria.push('No chest pain or breathing difficulties');
    }
    
    criteria.push('Mentally ready to return to training');
    criteria.push('Sleep quality normalized');
    
    return criteria;
  }
  
  /**
   * Apply progressive overload adjustments
   */
  applyProgressiveOverload(
    plan: TrainingPlan,
    currentFitness: any,
    progressRate: 'conservative' | 'moderate' | 'aggressive'
  ): TrainingPlan {
    const overloadFactors = {
      conservative: { volume: 1.05, intensity: 1.02 },
      moderate: { volume: 1.10, intensity: 1.05 },
      aggressive: { volume: 1.15, intensity: 1.08 }
    };
    
    const factors = overloadFactors[progressRate];
    
    // Group workouts by week
    const weeklyWorkouts = this.groupWorkoutsByWeek(plan.workouts);
    const modifiedWorkouts: PlannedWorkout[] = [];
    
    weeklyWorkouts.forEach((weekWorkouts, weekIndex) => {
      weekWorkouts.forEach(workout => {
        // Apply progressive overload after first 2 weeks
        if (weekIndex > 1 && workout.type !== 'recovery') {
          const overloadWeek = weekIndex - 1;
          const volumeFactor = Math.pow(factors.volume, overloadWeek / 4);
          const intensityFactor = Math.pow(factors.intensity, overloadWeek / 8);
          
          modifiedWorkouts.push({
            ...workout,
            targetMetrics: {
              ...workout.targetMetrics,
              duration: Math.round(workout.targetMetrics.duration * volumeFactor),
              distance: workout.targetMetrics.distance 
                ? workout.targetMetrics.distance * volumeFactor 
                : undefined,
              intensity: Math.min(95, workout.targetMetrics.intensity * intensityFactor)
            }
          });
        } else {
          modifiedWorkouts.push(workout);
        }
      });
    });
    
    return {
      ...plan,
      workouts: modifiedWorkouts
    };
  }
  
  /**
   * Group workouts by week
   */
  private groupWorkoutsByWeek(workouts: PlannedWorkout[]): PlannedWorkout[][] {
    const weeks: PlannedWorkout[][] = [];
    const sortedWorkouts = [...workouts].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (sortedWorkouts.length === 0) return weeks;
    
    let currentWeek: PlannedWorkout[] = [];
    let weekStart = startOfWeek(sortedWorkouts[0].date);
    
    sortedWorkouts.forEach(workout => {
      const workoutWeekStart = startOfWeek(workout.date);
      
      if (workoutWeekStart.getTime() !== weekStart.getTime()) {
        weeks.push(currentWeek);
        currentWeek = [];
        weekStart = workoutWeekStart;
      }
      
      currentWeek.push(workout);
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }
  
  /**
   * Get workout name for type
   */
  private getWorkoutName(type: WorkoutType): string {
    const names: Record<WorkoutType, string> = {
      recovery: 'Recovery Run',
      easy: 'Easy Run',
      steady: 'Steady State Run',
      tempo: 'Tempo Run',
      threshold: 'Threshold Workout',
      vo2max: 'VO2max Intervals',
      speed: 'Speed Work',
      hill_repeats: 'Hill Repeats',
      fartlek: 'Fartlek Run',
      progression: 'Progression Run',
      long_run: 'Long Run',
      race_pace: 'Race Pace Run',
      time_trial: 'Time Trial',
      cross_training: 'Cross Training',
      strength: 'Strength Training'
    };
    
    return names[type] || 'Training Run';
  }
}

/**
 * Recovery phase definition
 */
export interface RecoveryPhase {
  name: string;
  duration: number; // days
  workouts: WorkoutType[];
  volumePercent: number;
  intensityLimit: number;
  focus: string;
}

/**
 * Factory function to create adaptation engine
 */
export function createAdaptationEngine(): AdaptationEngine {
  return new SmartAdaptationEngine();
}