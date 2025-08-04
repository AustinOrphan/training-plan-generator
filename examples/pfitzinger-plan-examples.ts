/**
 * Pete Pfitzinger Training Plan Examples
 * 
 * Demonstrates the Pfitzinger methodology with various scenarios,
 * showcasing lactate threshold development, medium-long runs,
 * and systematic marathon preparation.
 */

import {
  AdvancedTrainingPlanGenerator,
  PhilosophyFactory,
  type AdvancedPlanConfig,
  type TrainingPlan
} from '../src/index';

class PfitzingerTrainingExamples {
  
  /**
   * Generate examples for different runner profiles using Pfitzinger methodology
   */
  async generateAllExamples(): Promise<void> {
    console.log('🎯 Pete Pfitzinger Training Plan Examples\n');
    console.log('Demonstrating lactate threshold focus and systematic marathon preparation\n');

    // Example 1: Serious Marathoner
    await this.example1SeriousMarathoner();
    
    // Example 2: Half Marathon Specialist
    await this.example2HalfMarathonSpecialist();
    
    // Example 3: Multi-Race Season Planning
    await this.example3MultiRaceSeason();
    
    // Example 4: BQ (Boston Qualifier) Attempt
    await this.example4BostonQualifier();
    
    // Demonstrate Pfitzinger-specific features
    await this.demonstratePfitzingerFeatures();
  }

  /**
   * Example 1: Serious marathoner using full Pfitzinger system
   */
  private async example1SeriousMarathoner(): Promise<void> {
    console.log('🏃‍♂️ EXAMPLE 1: Serious Marathoner - Full Pfitzinger System\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Pfitzinger Advanced Marathon',
      methodology: 'pfitzinger',
      goal: 'MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 18 * 7 * 24 * 60 * 60 * 1000), // 18 weeks
      
      currentFitness: {
        vdot: 52,
        weeklyMileage: 65, // km/week
        longestRecentRun: 32,
        trainingAge: 6,
        overallScore: 66 // VDOT: 65 + Volume: 65 + Experience: 60 + Recovery: 75 * weights = 66
      },
      
      preferences: {
        availableDays: [1, 2, 3, 4, 5, 6, 0], // Daily training
        preferredIntensity: 'moderate', // Balanced approach
        crossTraining: false,
        strengthTraining: true,
        trackAccess: true
      },
      
      targetRaces: [
        {
          distance: '10K',
          date: new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000),
          priority: 'C', // Fitness assessment
          goalTime: { minutes: 37, seconds: 30 }
        },
        {
          distance: 'half-marathon',
          date: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B', // Tune-up race
          goalTime: { hours: 1, minutes: 23, seconds: 0 }
        },
        {
          distance: 'marathon',
          date: new Date(Date.now() + 18 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { hours: 2, minutes: 55, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzePfitzingerPlan(plan, 'Serious Marathoner');
    
    // Show Pfitzinger principles
    console.log('🎯 Pfitzinger Marathon Principles:');
    console.log('  • Lactate threshold development as foundation');
    console.log('  • Medium-long runs (75-85% of long run distance)');
    console.log('  • Systematic progression in LT volume');
    console.log('  • Tune-up races integrated into training');
    console.log('  • Higher moderate intensity than other methodologies\n');
    
    this.showSampleWeek(plan, 8, 'Lactate Threshold Build Week');
    this.showSampleWeek(plan, 14, 'Peak Marathon Preparation');
  }

  /**
   * Example 2: Half marathon specialist
   */
  private async example2HalfMarathonSpecialist(): Promise<void> {
    console.log('🏃‍♀️ EXAMPLE 2: Half Marathon Specialist\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Pfitzinger Half Marathon Mastery',
      methodology: 'pfitzinger',
      goal: 'HALF_MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000), // 12 weeks
      
      currentFitness: {
        vdot: 48,
        weeklyMileage: 55,
        longestRecentRun: 22,
        trainingAge: 4,
        overallScore: 57 // VDOT: 60 + Volume: 55 + Experience: 40 + Recovery: 75 * weights = 57
      },
      
      preferences: {
        availableDays: [1, 2, 3, 4, 5, 6], // 6 days/week
        preferredIntensity: 'moderate',
        crossTraining: false,
        strengthTraining: true,
        trackAccess: true
      },
      
      targetRaces: [
        {
          distance: '5K',
          date: new Date(Date.now() + 4 * 7 * 24 * 60 * 60 * 1000),
          priority: 'C',
          goalTime: { minutes: 19, seconds: 45 }
        },
        {
          distance: '10K',
          date: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B',
          goalTime: { minutes: 41, seconds: 0 }
        },
        {
          distance: 'half-marathon',
          date: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { hours: 1, minutes: 28, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzePfitzingerPlan(plan, 'Half Marathon Specialist');
    
    console.log('🎯 Pfitzinger Half Marathon Focus:');
    console.log('  • Higher proportion of lactate threshold work');
    console.log('  • Medium-long runs at half marathon effort');
    console.log('  • VO2max intervals for speed development');
    console.log('  • Frequent tune-up races to gauge fitness\n');
    
    this.showSampleWeek(plan, 6, 'Half Marathon Specific Build');
    this.showSampleWeek(plan, 10, 'Race Preparation Peak');
  }

  /**
   * Example 3: Multi-race season with strategic planning
   */
  private async example3MultiRaceSeason(): Promise<void> {
    console.log('📅 EXAMPLE 3: Multi-Race Season Planning\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Pfitzinger Season Campaign',
      methodology: 'pfitzinger',
      goal: 'MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 24 * 7 * 24 * 60 * 60 * 1000), // 24 weeks - full season
      
      currentFitness: {
        vdot: 50,
        weeklyMileage: 60,
        longestRecentRun: 28,
        trainingAge: 5,
        overallScore: 61 // VDOT: 62.5 + Volume: 60 + Experience: 50 + Recovery: 75 * weights = 61
      },
      
      preferences: {
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        preferredIntensity: 'moderate',
        crossTraining: true,
        strengthTraining: true,
        seasonPlanning: true
      },
      
      targetRaces: [
        {
          distance: '10K',
          date: new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B',
          goalTime: { minutes: 38, seconds: 30 }
        },
        {
          distance: 'half-marathon',
          date: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A', // Spring goal race
          goalTime: { hours: 1, minutes: 25, seconds: 0 }
        },
        {
          distance: 'marathon',
          date: new Date(Date.now() + 24 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A', // Fall goal race
          goalTime: { hours: 3, minutes: 0, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzePfitzingerPlan(plan, 'Multi-Race Season');
    
    console.log('📈 Pfitzinger Season Periodization:');
    console.log('  • Base building between goal races');
    console.log('  • Strategic tune-up race placement');
    console.log('  • Progressive LT development throughout season');
    console.log('  • Recovery blocks after major efforts\n');
    
    this.showSeasonProgression(plan);
    this.showSampleWeek(plan, 18, 'Marathon-Specific Block');
  }

  /**
   * Example 4: Boston Marathon qualifier attempt
   */
  private async example4BostonQualifier(): Promise<void> {
    console.log('🇺🇸 EXAMPLE 4: Boston Marathon Qualifier Attempt\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Pfitzinger BQ Training',
      methodology: 'pfitzinger',
      goal: 'MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000), // 16 weeks
      
      currentFitness: {
        vdot: 49, // Right at BQ fitness level
        weeklyMileage: 60,
        longestRecentRun: 30,
        trainingAge: 4,
        overallScore: 59 // VDOT: 61.3 + Volume: 60 + Experience: 40 + Recovery: 75 * weights = 59
      },
      
      preferences: {
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        preferredIntensity: 'high', // Aggressive for BQ
        crossTraining: false,
        strengthTraining: true,
        bostonQualifier: true // Special BQ considerations
      },
      
      targetRaces: [
        {
          distance: 'half-marathon',
          date: new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B', // BQ predictor race
          goalTime: { hours: 1, minutes: 26, seconds: 0 } // Sub-3 marathon predictor
        },
        {
          distance: 'marathon',
          date: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { hours: 2, minutes: 58, seconds: 0 } // BQ -2 minutes buffer
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzePfitzingerPlan(plan, 'Boston Qualifier');
    
    console.log('🎯 BQ-Specific Pfitzinger Adaptations:');
    console.log('  • Higher volume lactate threshold work');
    console.log('  • Marathon pace segments in medium-long runs');
    console.log('  • Predictor workouts and races');
    console.log('  • Race strategy practice and pacing rehearsal\n');
    
    this.showBQSpecificWorkouts(plan);
    this.showSampleWeek(plan, 12, 'BQ Preparation Week');
  }

  /**
   * Demonstrate Pfitzinger-specific features and workouts
   */
  private async demonstratePfitzingerFeatures(): Promise<void> {
    console.log('🎯 PFITZINGER METHODOLOGY FEATURES\n');
    
    const pfitzinger = PhilosophyFactory.create('pfitzinger');
    
    // Lactate threshold progression
    console.log('📊 Lactate Threshold Volume Progression:');
    
    const ltProgression = [
      { week: 1, volume: 20, description: 'Introduction to LT work' },
      { week: 4, volume: 30, description: 'Building LT capacity' },
      { week: 8, volume: 40, description: 'LT development peak' },
      { week: 12, volume: 35, description: 'LT maintenance' },
      { week: 16, volume: 25, description: 'Race preparation' }
    ];
    
    console.log('Week'.padEnd(8) + 'LT Volume'.padEnd(12) + 'Focus');
    console.log('-'.repeat(50));
    
    ltProgression.forEach(point => {
      console.log(
        point.week.toString().padEnd(8) +
        `${point.volume} min`.padEnd(12) +
        point.description
      );
    });
    
    console.log('\n🏃‍♂️ Medium-Long Run Structure:');
    console.log('  Standard MLR: 12-16 miles at moderate effort');
    console.log('  MLR with LT: 8 miles + 4 miles at LT pace + 2 miles easy');
    console.log('  MLR with MP: 10 miles + 4 miles at marathon pace + 2 miles easy');
    console.log('  Progressive MLR: Start moderate, finish at half marathon effort\n');
    
    console.log('⚡ Pfitzinger Intensity Distribution:');
    console.log('  • Easy running: 70-75% (lower than Daniels/Lydiard)');
    console.log('  • Moderate (LT/Tempo): 20-25% (higher than others)');
    console.log('  • Hard (VO2max): 5-10% (race-specific)');
    console.log('  • Focus on "comfortably hard" threshold zone\n');
    
    console.log('🎯 Pfitzinger Training Principles:');
    console.log('  1. LT Foundation: Lactate threshold as base for all other training');
    console.log('  2. Systematic Progression: Methodical increases in LT volume');
    console.log('  3. Race Integration: Frequent tune-up races as training tools');
    console.log('  4. Specificity: Training becomes increasingly race-specific');
    console.log('  5. Recovery Balance: Strategic rest to absorb training stress');
    console.log('  6. Medium-Long Runs: Signature workout for marathon preparation\n');
    
    console.log('🏃‍♂️ Signature Pfitzinger Workouts:');
    console.log('  • LT Tempo Runs: 20-40 minutes at lactate threshold pace');
    console.log('  • Medium-Long Runs: 12-16 miles with tempo segments');
    console.log('  • VO2max Intervals: 1000m-1600m repeats at 3K-5K pace');
    console.log('  • Marathon Pace Runs: Race-specific pace practice');
    console.log('  • Tune-up Races: 5K-Half Marathon fitness assessments\n');
    
    console.log('🔧 Pfitzinger Customization Options:');
    console.log('  1. LT Volume Progression: Adjust based on individual tolerance');
    console.log('  2. MLR Structure: Customize tempo segments for specific needs');
    console.log('  3. Tune-up Race Schedule: Plan around local race calendar');
    console.log('  4. Recovery Week Frequency: Every 3rd or 4th week');
    console.log('  5. Marathon Simulation: Practice race-day nutrition/pacing');
    console.log('  6. Altitude/Weather: Adjust paces for environmental conditions\n');
    
    console.log('📈 Weekly Structure Examples:');
    console.log('  Monday: Easy run or rest');
    console.log('  Tuesday: LT tempo run or VO2max intervals');
    console.log('  Wednesday: Easy run');
    console.log('  Thursday: Medium-long run with tempo segment');
    console.log('  Friday: Easy run or rest');
    console.log('  Saturday: Easy run');
    console.log('  Sunday: Long run (progression or steady effort)\n');
  }

  /**
   * Show season progression for multi-race planning
   */
  private showSeasonProgression(plan: TrainingPlan): void {
    console.log('📅 Season Progression Analysis:\n');
    
    // Identify race periods and training blocks
    const races = plan.config.targetRaces || [];
    races.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    races.forEach((race, index) => {
      const weekNumber = Math.ceil((race.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      console.log(`Race ${index + 1}: ${race.distance} - Week ${weekNumber} (${race.priority} Priority)`);
      console.log(`  Goal: ${race.goalTime?.hours || 0}:${(race.goalTime?.minutes || 0).toString().padStart(2, '0')}:${(race.goalTime?.seconds || 0).toString().padStart(2, '0')}`);
      
      if (index < races.length - 1) {
        const nextRace = races[index + 1];
        const weeksToNext = Math.ceil((nextRace.date.getTime() - race.date.getTime()) / (7 * 24 * 60 * 60 * 1000));
        console.log(`  Recovery and build period: ${weeksToNext} weeks to next race\n`);
      } else {
        console.log('  Season finale - extended recovery period\n');
      }
    });
  }

  /**
   * Show Boston Qualifier specific workouts
   */
  private showBQSpecificWorkouts(plan: TrainingPlan): void {
    console.log('🇺🇸 BQ-Specific Workout Examples:\n');
    
    console.log('Key BQ Predictor Workouts:');
    console.log('  1. Half Marathon Predictor: Race 13.1 miles at BQ pace + 10-15 seconds');
    console.log('  2. Marathon Simulation: 20 miles with final 8 at goal marathon pace');
    console.log('  3. BQ Pacing Practice: 6 x 2 miles at BQ pace with 800m recovery');
    console.log('  4. Negative Split Practice: 16 miles, second half 30 seconds faster');
    console.log('  5. Race Strategy Rehearsal: Practice nutrition/hydration at race pace\n');
    
    console.log('BQ Pace Targets (for various age groups):');
    console.log('  Men 18-34: 3:05 (4:23/km) - BQ: 3:00 (4:16/km)');
    console.log('  Men 35-39: 3:15 (4:38/km) - BQ: 3:10 (4:31/km)');
    console.log('  Women 18-34: 3:35 (5:07/km) - BQ: 3:30 (4:59/km)');
    console.log('  Women 35-39: 3:45 (5:21/km) - BQ: 3:40 (5:13/km)\n');
    
    console.log('Note: Training paces include 2-5 minute buffer for race day conditions\n');
  }

  /**
   * Analyze a Pfitzinger training plan
   */
  private analyzePfitzingerPlan(plan: TrainingPlan, description: string): void {
    console.log(`📋 ${description} Plan Analysis:\n`);
    
    // Basic statistics
    console.log(`Total workouts: ${plan.workouts.length}`);
    console.log(`Total distance: ${Math.round(plan.summary.totalDistance)}km`);
    console.log(`Average weekly: ${Math.round(plan.summary.averageWeeklyDistance)}km`);
    console.log(`Peak week: ${Math.round(plan.summary.peakWeeklyDistance)}km\n`);
    
    // Pfitzinger-specific analysis
    const workoutTypes = plan.workouts.reduce((counts: Record<string, number>, workout) => {
      counts[workout.type] = (counts[workout.type] || 0) + 1;
      return counts;
    }, {});
    
    const totalWorkouts = plan.workouts.length;
    const easyWorkouts = (workoutTypes.easy || 0) + (workoutTypes.recovery || 0);
    const ltWorkouts = (workoutTypes.threshold || 0) + (workoutTypes.tempo || 0);
    const mlrWorkouts = workoutTypes.medium_long || 0;
    const longRunWorkouts = workoutTypes.long_run || 0;
    const hardWorkouts = (workoutTypes.vo2max || 0) + (workoutTypes.speed || 0) + (workoutTypes.intervals || 0);
    
    const easyPercent = Math.round((easyWorkouts / totalWorkouts) * 100);
    const ltPercent = Math.round((ltWorkouts / totalWorkouts) * 100);
    const hardPercent = Math.round((hardWorkouts / totalWorkouts) * 100);
    
    console.log('🎯 Pfitzinger LT Focus Analysis:');
    console.log(`  Easy running: ${easyPercent}% (target: 70-75%)`);
    console.log(`  Lactate threshold: ${ltPercent}% (target: 15-20%)`);
    console.log(`  Hard running: ${hardPercent}% (target: 5-10%)`);
    console.log(`  LT emphasis: ${this.assessPfitzingerCompliance(easyPercent, ltPercent, hardPercent)}\n`);
    
    // Medium-long run analysis
    if (mlrWorkouts > 0 || longRunWorkouts > 0) {
      console.log('🏃‍♂️ Long Run System:');
      console.log(`  Medium-long runs: ${mlrWorkouts}`);
      console.log(`  Long runs: ${longRunWorkouts}`);
      console.log(`  Total long sessions: ${mlrWorkouts + longRunWorkouts}\n`);
    }
    
    // Tune-up race integration
    const races = plan.config.targetRaces || [];
    if (races.length > 0) {
      console.log('🏁 Race Integration:');
      races.forEach((race, index) => {
        const weekNumber = Math.ceil((race.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        console.log(`  Race ${index + 1}: ${race.distance} - Week ${weekNumber} (${race.priority} priority)`);
      });
      console.log('');
    }
    
    // LT progression analysis
    this.analyzeLTProgression(plan);
  }

  /**
   * Analyze lactate threshold progression
   */
  private analyzeLTProgression(plan: TrainingPlan): void {
    const ltWorkouts = plan.workouts.filter(w => 
      w.type === 'threshold' || w.type === 'tempo'
    );
    
    if (ltWorkouts.length === 0) return;
    
    // Group by week and calculate LT volume
    const weeklyLT: { [week: number]: number } = {};
    
    ltWorkouts.forEach(workout => {
      const weekNumber = Math.floor((workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (!weeklyLT[weekNumber]) {
        weeklyLT[weekNumber] = 0;
      }
      weeklyLT[weekNumber] += workout.targetMetrics.duration;
    });
    
    const ltProgression = Object.entries(weeklyLT)
      .map(([week, volume]) => ({ week: parseInt(week) + 1, volume }))
      .sort((a, b) => a.week - b.week);
    
    if (ltProgression.length > 0) {
      console.log('📈 Lactate Threshold Progression:');
      console.log('Week'.padEnd(8) + 'LT Volume'.padEnd(12) + 'Progression');
      console.log('-'.repeat(40));
      
      ltProgression.forEach((point, index) => {
        let progression = '';
        if (index > 0) {
          const change = point.volume - ltProgression[index - 1].volume;
          progression = change > 0 ? `+${change} min` : `${change} min`;
        }
        
        console.log(
          point.week.toString().padEnd(8) +
          `${point.volume} min`.padEnd(12) +
          progression
        );
      });
      
      const avgVolume = ltProgression.reduce((sum, p) => sum + p.volume, 0) / ltProgression.length;
      const maxVolume = Math.max(...ltProgression.map(p => p.volume));
      
      console.log(`\nLT Summary: Average ${Math.round(avgVolume)} min/week, Peak ${maxVolume} min/week\n`);
    }
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
      const intensity = this.getPfitzingerIntensityDescription(workout.type);
      
      console.log(`  ${day}: ${workout.type} - ${duration}min, ${distance}km ${intensity}`);
    });
    
    const totalDistance = weekWorkouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const totalTime = weekWorkouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0);
    const ltTime = weekWorkouts
      .filter(w => w.type === 'threshold' || w.type === 'tempo')
      .reduce((sum, w) => sum + w.targetMetrics.duration, 0);
    
    console.log(`  Total: ${Math.round(totalDistance)}km, ${Math.round(totalTime)}min`);
    if (ltTime > 0) {
      console.log(`  LT Volume: ${ltTime} minutes`);
    }
    console.log('');
  }

  /**
   * Assess compliance with Pfitzinger principles
   */
  private assessPfitzingerCompliance(easyPercent: number, ltPercent: number, hardPercent: number): string {
    if (easyPercent >= 70 && easyPercent <= 75 && ltPercent >= 15 && ltPercent <= 25 && hardPercent <= 10) {
      return 'Excellent Pfitzinger distribution ✅';
    } else if (easyPercent >= 65 && easyPercent <= 80 && ltPercent >= 10 && ltPercent <= 30 && hardPercent <= 15) {
      return 'Good LT emphasis ✓';
    } else {
      return 'May need adjustment for optimal LT development ⚠️';
    }
  }

  /**
   * Get Pfitzinger-specific intensity description
   */
  private getPfitzingerIntensityDescription(workoutType: string): string {
    const intensityMap: Record<string, string> = {
      'easy': '(Easy/aerobic pace)',
      'recovery': '(Very easy pace)',
      'long_run': '(Progressive effort)',
      'medium_long': '(Moderate with tempo)',
      'tempo': '(Comfortably hard)',
      'threshold': '(Lactate threshold)',
      'vo2max': '(3K-5K pace)',
      'intervals': '(VO2max pace)',
      'marathon_pace': '(Goal race pace)'
    };
    
    return intensityMap[workoutType] || '';
  }
}

// Export for use in other examples
export { PfitzingerTrainingExamples };

// Run if called directly
if (require.main === module) {
  const examples = new PfitzingerTrainingExamples();
  examples.generateAllExamples().catch(console.error);
}