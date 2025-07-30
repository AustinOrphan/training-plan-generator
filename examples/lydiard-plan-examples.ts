/**
 * Arthur Lydiard Training Plan Examples
 * 
 * Demonstrates the Lydiard methodology with various scenarios,
 * showcasing aerobic base building, hill training, and the
 * four-phase periodization system.
 */

import {
  AdvancedTrainingPlanGenerator,
  PhilosophyFactory,
  type AdvancedPlanConfig,
  type TrainingPlan
} from '../src/index';

class LydiardTrainingExamples {
  
  /**
   * Generate examples for different runner profiles using Lydiard methodology
   */
  async generateAllExamples(): Promise<void> {
    console.log('🏔️ Arthur Lydiard Training Plan Examples\n');
    console.log('Demonstrating aerobic base building and systematic periodization\n');

    // Example 1: Marathon Runner Building Base
    await this.example1MarathonBaseBuilder();
    
    // Example 2: Ultra Runner Long-Term Development
    await this.example2UltraRunner();
    
    // Example 3: Comeback from Injury
    await this.example3InjuryComeback();
    
    // Example 4: Youth/Masters Runner Development
    await this.example4DevelopmentalRunner();
    
    // Demonstrate Lydiard-specific features
    await this.demonstrateLydiardFeatures();
  }

  /**
   * Example 1: Marathon runner building massive aerobic base
   */
  private async example1MarathonBaseBuilder(): Promise<void> {
    console.log('🏃‍♂️ EXAMPLE 1: Marathon Runner - Aerobic Base Building\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Lydiard Marathon Base Building',
      methodology: 'lydiard',
      goal: 'MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 24 * 7 * 24 * 60 * 60 * 1000), // 24 weeks - long cycle
      
      currentFitness: {
        vdot: 48,
        weeklyMileage: 55, // km/week
        longestRecentRun: 22,
        trainingAge: 4
      },
      
      preferences: {
        availableDays: [1, 2, 3, 4, 5, 6, 0], // Daily running
        preferredIntensity: 'low', // Aerobic emphasis
        crossTraining: false, // Pure running focus
        strengthTraining: false, // Hills provide strength
        hillAccess: true
      },
      
      targetRaces: [
        {
          distance: 'half-marathon',
          date: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B',
          goalTime: { hours: 1, minutes: 28, seconds: 0 }
        },
        {
          distance: 'marathon',
          date: new Date(Date.now() + 24 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { hours: 3, minutes: 10, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzeLydiardPlan(plan, 'Marathon Base Builder');
    
    // Show Lydiard phases
    console.log('📈 Lydiard Four-Phase System:');
    console.log('  Phase 1 (Weeks 1-10): Aerobic Base - 85%+ easy running');
    console.log('  Phase 2 (Weeks 11-16): Hill Training - Strength development');
    console.log('  Phase 3 (Weeks 17-20): Anaerobic Development - Speed work');
    console.log('  Phase 4 (Weeks 21-24): Coordination/Taper - Race preparation\n');
    
    this.showLydiardPhaseProgression(plan);
    this.showSampleWeek(plan, 6, 'Aerobic Base Week');
    this.showSampleWeek(plan, 14, 'Hill Training Week');
  }

  /**
   * Example 2: Ultra runner with long-term development focus
   */
  private async example2UltraRunner(): Promise<void> {
    console.log('🏔️ EXAMPLE 2: Ultra Runner - Long-Term Development\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Lydiard Ultra Development',
      methodology: 'lydiard',
      goal: 'ULTRA',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 32 * 7 * 24 * 60 * 60 * 1000), // 32 weeks - extended cycle
      
      currentFitness: {
        vdot: 45,
        weeklyMileage: 70,
        longestRecentRun: 35,
        trainingAge: 6
      },
      
      preferences: {
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        preferredIntensity: 'low',
        crossTraining: true, // Hiking, cycling for variety
        strengthTraining: false,
        hillAccess: true,
        trailAccess: true
      },
      
      targetRaces: [
        {
          distance: 'marathon',
          date: new Date(Date.now() + 20 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B',
          goalTime: { hours: 3, minutes: 15, seconds: 0 }
        },
        {
          distance: '50K',
          date: new Date(Date.now() + 32 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { hours: 4, minutes: 30, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzeLydiardPlan(plan, 'Ultra Runner Development');
    
    console.log('🗻 Ultra-Specific Lydiard Adaptations:');
    console.log('  • Extended aerobic base phase (16+ weeks)');
    console.log('  • Long hill training sessions for strength-endurance');
    console.log('  • Minimal anaerobic work - focus on sustainable pace');
    console.log('  • Back-to-back long runs for ultra-specific adaptation\n');
    
    this.showSampleWeek(plan, 12, 'Extended Base Building');
    this.showSampleWeek(plan, 18, 'Hill Strength Phase');
  }

  /**
   * Example 3: Comeback from injury using conservative Lydiard approach
   */
  private async example3InjuryComeback(): Promise<void> {
    console.log('🔄 EXAMPLE 3: Injury Comeback - Conservative Progression\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Lydiard Injury Comeback',
      methodology: 'lydiard',
      goal: 'HALF_MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 20 * 7 * 24 * 60 * 60 * 1000), // 20 weeks - gradual return
      
      currentFitness: {
        vdot: 40, // Reduced from injury
        weeklyMileage: 20, // Starting low
        longestRecentRun: 10,
        trainingAge: 3,
        injuryHistory: ['plantar fasciitis']
      },
      
      preferences: {
        availableDays: [1, 3, 5, 6], // Every other day initially
        preferredIntensity: 'very_low',
        crossTraining: true,
        strengthTraining: true,
        conservative: true
      },
      
      targetRaces: [
        {
          distance: '10K',
          date: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
          priority: 'C', // Test race
          goalTime: { minutes: 45, seconds: 0 }
        },
        {
          distance: 'half-marathon',
          date: new Date(Date.now() + 20 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { hours: 1, minutes: 50, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzeLydiardPlan(plan, 'Injury Comeback');
    
    console.log('🩹 Lydiard Injury Comeback Benefits:');
    console.log('  • Ultra-conservative progression protects against re-injury');
    console.log('  • Aerobic base emphasis minimizes stress on tissues');
    console.log('  • Time-based training reduces pressure for pace/distance');
    console.log('  • Extended base phase allows thorough tissue adaptation\n');
    
    this.showSampleWeek(plan, 4, 'Early Comeback Week');
    this.showSampleWeek(plan, 16, 'Return to Racing Form');
  }

  /**
   * Example 4: Youth or Masters runner development
   */
  private async example4DevelopmentalRunner(): Promise<void> {
    console.log('👥 EXAMPLE 4: Developmental Runner - Long-Term Growth\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Lydiard Development Program',
      methodology: 'lydiard',
      goal: '10K',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000), // 16 weeks
      
      currentFitness: {
        vdot: 38, // Developing runner
        weeklyMileage: 30,
        longestRecentRun: 12,
        trainingAge: 1 // New to structured training
      },
      
      preferences: {
        availableDays: [1, 2, 4, 5, 6], // 5 days/week
        preferredIntensity: 'low',
        crossTraining: true,
        strengthTraining: true,
        developmental: true
      },
      
      targetRaces: [
        {
          distance: '5K',
          date: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B',
          goalTime: { minutes: 22, seconds: 0 }
        },
        {
          distance: '10K',
          date: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { minutes: 47, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzeLydiardPlan(plan, 'Developmental Runner');
    
    console.log('🌱 Lydiard Development Philosophy:');
    console.log('  • Prioritizes long-term aerobic development over short-term gains');
    console.log('  • Builds massive running volume tolerance gradually');
    console.log('  • Develops running strength through hills, not gym work');
    console.log('  • Creates lifetime base for future performance improvements\n');
    
    this.showSampleWeek(plan, 10, 'Developmental Base Week');
  }

  /**
   * Demonstrate Lydiard-specific features and principles
   */
  private async demonstrateLydiardFeatures(): Promise<void> {
    console.log('🗻 LYDIARD METHODOLOGY FEATURES\n');
    
    const lydiard = PhilosophyFactory.create('lydiard');
    
    // Intensity distribution across phases
    console.log('📊 Lydiard Intensity Distribution by Phase:');
    
    const phases = [
      { name: 'Aerobic Base', easy: 90, moderate: 8, hard: 2 },
      { name: 'Hill Training', easy: 85, moderate: 12, hard: 3 },
      { name: 'Anaerobic Dev', easy: 75, moderate: 15, hard: 10 },
      { name: 'Coordination', easy: 70, moderate: 20, hard: 10 },
      { name: 'Taper', easy: 85, moderate: 10, hard: 5 }
    ];
    
    console.log('Phase'.padEnd(15) + 'Easy %'.padEnd(10) + 'Moderate %'.padEnd(12) + 'Hard %');
    console.log('-'.repeat(50));
    
    phases.forEach(phase => {
      console.log(
        phase.name.padEnd(15) +
        `${phase.easy}%`.padEnd(10) +
        `${phase.moderate}%`.padEnd(12) +
        `${phase.hard}%`
      );
    });
    
    console.log('\n🏔️ Lydiard Hill Training Progression:');
    console.log('  Week 1-2: Hill running introduction (6-8 x 30sec hills)');
    console.log('  Week 3-4: Hill resistance development (8-10 x 45sec hills)');
    console.log('  Week 5-6: Hill strength peak (10-12 x 60sec hills)');
    console.log('  Week 7-8: Hill speed transition (8-10 x 30sec hills, faster)\n');
    
    console.log('⏱️ Lydiard Time-Based Training:');
    console.log('  • Easy runs: By time, not distance (effort-based)');
    console.log('  • Long runs: 2-2.5 hours at aerobic pace');
    console.log('  • Hills: Effort-based, not pace-based');
    console.log('  • Recovery: Complete rest or very easy jogging\n');
    
    console.log('🎯 Lydiard Philosophy Principles:');
    console.log('  1. Aerobic Base First: Massive cardio-respiratory development');
    console.log('  2. Strength Through Hills: Natural resistance training');
    console.log('  3. Conservative Progression: Avoid injury and overtraining');
    console.log('  4. Time-Based Training: Focus on effort, not pace');
    console.log('  5. Patience: Long-term development over quick fixes');
    console.log('  6. Natural Running: Minimal artificial structure\n');
    
    console.log('🏃‍♂️ Signature Lydiard Workouts:');
    console.log('  • Long Aerobic Runs: 1.5-2.5 hours at conversational pace');
    console.log('  • Hill Circuits: 30-60 second hill repeats with jog recovery');
    console.log('  • Time Trials: Racing speed development in final phase');
    console.log('  • Steady State Runs: "Comfortably fast" continuous efforts');
    console.log('  • Easy Jogging: Foundation of all Lydiard training\n');
    
    console.log('🔄 Lydiard Customization Options:');
    console.log('  1. Base Phase Duration: 10-20 weeks depending on goals');
    console.log('  2. Hill Training Intensity: Adjusted for terrain and fitness');
    console.log('  3. Volume Progression: Very gradual increases (5-10% weekly)');
    console.log('  4. Anaerobic Volume: Minimal but race-specific');
    console.log('  5. Recovery Emphasis: Complete rest vs active recovery');
    console.log('  6. Seasonal Periodization: Multiple base-build cycles per year\n');
  }

  /**
   * Show Lydiard phase progression throughout the plan
   */
  private showLydiardPhaseProgression(plan: TrainingPlan): void {
    console.log('📈 Lydiard Phase Progression Analysis:\n');
    
    const totalWeeks = Math.ceil((plan.config.targetDate.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Estimate phase distribution for Lydiard
    const baseWeeks = Math.floor(totalWeeks * 0.5); // 50% base phase
    const hillWeeks = Math.floor(totalWeeks * 0.25); // 25% hill phase
    const anaerobicWeeks = Math.floor(totalWeeks * 0.15); // 15% anaerobic
    const taperWeeks = totalWeeks - baseWeeks - hillWeeks - anaerobicWeeks; // Remainder
    
    console.log(`Phase 1 - Aerobic Base: Weeks 1-${baseWeeks}`);
    console.log(`  Focus: Build massive aerobic capacity with 85%+ easy running`);
    console.log(`  Key workouts: Long runs, easy jogging, steady state runs\n`);
    
    console.log(`Phase 2 - Hill Training: Weeks ${baseWeeks + 1}-${baseWeeks + hillWeeks}`);
    console.log(`  Focus: Develop running strength and power through hill repeats`);
    console.log(`  Key workouts: Hill circuits, resistance running, strength development\n`);
    
    console.log(`Phase 3 - Anaerobic: Weeks ${baseWeeks + hillWeeks + 1}-${baseWeeks + hillWeeks + anaerobicWeeks}`);
    console.log(`  Focus: Sharpen racing speed and lactate tolerance`);
    console.log(`  Key workouts: Track intervals, tempo runs, time trials\n`);
    
    console.log(`Phase 4 - Coordination/Taper: Weeks ${baseWeeks + hillWeeks + anaerobicWeeks + 1}-${totalWeeks}`);
    console.log(`  Focus: Race preparation, speed coordination, recovery`);
    console.log(`  Key workouts: Race pace runs, sharpening, reduced volume\n`);
  }

  /**
   * Analyze a Lydiard training plan
   */
  private analyzeLydiardPlan(plan: TrainingPlan, description: string): void {
    console.log(`📋 ${description} Plan Analysis:\n`);
    
    // Basic statistics
    console.log(`Total workouts: ${plan.workouts.length}`);
    console.log(`Total distance: ${Math.round(plan.summary.totalDistance)}km`);
    console.log(`Average weekly: ${Math.round(plan.summary.averageWeeklyDistance)}km`);
    console.log(`Peak week: ${Math.round(plan.summary.peakWeeklyDistance)}km\n`);
    
    // Lydiard-specific analysis
    const workoutTypes = plan.workouts.reduce((counts: Record<string, number>, workout) => {
      counts[workout.type] = (counts[workout.type] || 0) + 1;
      return counts;
    }, {});
    
    const totalWorkouts = plan.workouts.length;
    const easyWorkouts = (workoutTypes.easy || 0) + (workoutTypes.recovery || 0) + (workoutTypes.long_run || 0);
    const hillWorkouts = workoutTypes.hills || 0;
    const hardWorkouts = (workoutTypes.threshold || 0) + (workoutTypes.vo2max || 0) + (workoutTypes.speed || 0);
    
    const easyPercent = Math.round((easyWorkouts / totalWorkouts) * 100);
    const hillPercent = Math.round((hillWorkouts / totalWorkouts) * 100);
    const hardPercent = Math.round((hardWorkouts / totalWorkouts) * 100);
    
    console.log('🏔️ Lydiard Aerobic Emphasis Analysis:');
    console.log(`  Easy/Aerobic running: ${easyPercent}% (target: 85%+)`);
    console.log(`  Hill training: ${hillPercent}%`);
    console.log(`  Hard anaerobic: ${hardPercent}% (target: <10%)`);
    console.log(`  Aerobic compliance: ${this.assessLydiardCompliance(easyPercent, hardPercent)}\n`);
    
    // Long run analysis
    const longRuns = plan.workouts.filter(w => w.type === 'long_run');
    if (longRuns.length > 0) {
      const avgLongRunDistance = longRuns.reduce((sum, lr) => sum + (lr.targetMetrics.distance || 0), 0) / longRuns.length;
      const maxLongRun = Math.max(...longRuns.map(lr => lr.targetMetrics.distance || 0));
      
      console.log('🏃‍♂️ Long Run Development:');
      console.log(`  Long runs scheduled: ${longRuns.length}`);
      console.log(`  Average distance: ${Math.round(avgLongRunDistance)}km`);
      console.log(`  Longest run: ${Math.round(maxLongRun)}km\n`);
    }
    
    // Weekly progression
    const weeklyDistances = this.calculateWeeklyDistances(plan);
    const progression = this.analyzeVolumeProgression(weeklyDistances);
    
    console.log('📈 Volume Progression:');
    console.log(`  Average weekly increase: ${progression.avgIncrease.toFixed(1)}%`);
    console.log(`  Maximum weekly increase: ${progression.maxIncrease.toFixed(1)}%`);
    console.log(`  Progression assessment: ${progression.assessment}\n`);
  }

  /**
   * Show a sample training week
   */
  private showSampleWeek(plan: TrainingPlan, weekNumber: number, description: string): void {
    console.log(`📅 ${description} (Week ${weekNumber}):\n`);
    
    const weekWorkouts = plan.workouts.filter(workout => {
      const planWeek = Math.floor((workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return planWeek === weekNumber - 1;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (weekWorkouts.length === 0) {
      console.log('No workouts found for this week.\n');
      return;
    }
    
    weekWorkouts.forEach(workout => {
      const day = workout.date.toLocaleDateString('en-US', { weekday: 'short' });
      const duration = workout.targetMetrics.duration;
      const distance = Math.round(workout.targetMetrics.distance || 0);
      const effort = this.getLydiardEffortDescription(workout.type);
      
      console.log(`  ${day}: ${workout.type} - ${duration}min, ${distance}km ${effort}`);
    });
    
    const totalDistance = weekWorkouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const totalTime = weekWorkouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0);
    
    console.log(`  Total: ${Math.round(totalDistance)}km, ${Math.round(totalTime)}min\n`);
  }

  /**
   * Calculate weekly distances for progression analysis
   */
  private calculateWeeklyDistances(plan: TrainingPlan): number[] {
    const startTime = plan.config.startDate.getTime();
    const weeklyDistances: number[] = [];
    
    plan.workouts.forEach(workout => {
      const weekIndex = Math.floor((workout.date.getTime() - startTime) / (7 * 24 * 60 * 60 * 1000));
      if (!weeklyDistances[weekIndex]) {
        weeklyDistances[weekIndex] = 0;
      }
      weeklyDistances[weekIndex] += workout.targetMetrics.distance || 0;
    });
    
    return weeklyDistances.filter(distance => distance > 0);
  }

  /**
   * Analyze volume progression for Lydiard assessment
   */
  private analyzeVolumeProgression(weeklyDistances: number[]): { avgIncrease: number; maxIncrease: number; assessment: string } {
    if (weeklyDistances.length < 2) {
      return { avgIncrease: 0, maxIncrease: 0, assessment: 'Insufficient data' };
    }
    
    const increases: number[] = [];
    for (let i = 1; i < weeklyDistances.length; i++) {
      if (weeklyDistances[i] > weeklyDistances[i - 1]) {
        const increase = ((weeklyDistances[i] - weeklyDistances[i - 1]) / weeklyDistances[i - 1]) * 100;
        increases.push(increase);
      }
    }
    
    const avgIncrease = increases.length > 0 ? increases.reduce((sum, inc) => sum + inc, 0) / increases.length : 0;
    const maxIncrease = increases.length > 0 ? Math.max(...increases) : 0;
    
    let assessment: string;
    if (avgIncrease <= 5 && maxIncrease <= 10) {
      assessment = 'Excellent Lydiard progression - very conservative ✅';
    } else if (avgIncrease <= 8 && maxIncrease <= 15) {
      assessment = 'Good progression - within safe limits ✓';
    } else {
      assessment = 'Aggressive progression - monitor for overtraining ⚠️';
    }
    
    return { avgIncrease, maxIncrease, assessment };
  }

  /**
   * Assess compliance with Lydiard aerobic emphasis
   */
  private assessLydiardCompliance(easyPercent: number, hardPercent: number): string {
    if (easyPercent >= 85 && hardPercent <= 10) {
      return 'Excellent adherence to Lydiard principles ✅';
    } else if (easyPercent >= 80 && hardPercent <= 15) {
      return 'Good aerobic emphasis ✓';
    } else {
      return 'Too much hard training for Lydiard approach ⚠️';
    }
  }

  /**
   * Get Lydiard-specific effort description
   */
  private getLydiardEffortDescription(workoutType: string): string {
    const effortMap: Record<string, string> = {
      'easy': '(Conversational pace)',
      'recovery': '(Very easy jogging)',
      'long_run': '(Steady aerobic effort)',
      'hills': '(Strong hill effort)',
      'steady_state': '(Comfortably fast)',
      'tempo': '(Comfortably hard)',
      'threshold': '(Hard but controlled)',
      'time_trial': '(Racing effort)'
    };
    
    return effortMap[workoutType] || '(Time-based effort)';
  }
}

// Export for use in other examples
export { LydiardTrainingExamples };

// Run if called directly
if (require.main === module) {
  const examples = new LydiardTrainingExamples();
  examples.generateAllExamples().catch(console.error);
}