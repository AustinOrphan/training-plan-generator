/**
 * Jack Daniels Training Plan Examples
 * 
 * Demonstrates the Daniels methodology with various scenarios,
 * showcasing VDOT-based training, 80/20 intensity distribution,
 * and precise pace calculations.
 */

import {
  AdvancedTrainingPlanGenerator,
  PhilosophyFactory,
  calculateVDOTCached,
  type AdvancedPlanConfig,
  type TrainingPlan
} from '../src/index';

class DanielsTrainingExamples {
  
  /**
   * Generate examples for different runner profiles using Daniels methodology
   */
  async generateAllExamples(): Promise<void> {
    console.log('🏃‍♂️ Jack Daniels Training Plan Examples\n');
    console.log('Demonstrating VDOT-based training with precise pace calculations\n');

    // Example 1: Competitive 5K/10K Runner
    await this.example1CompetitiveTrackRunner();
    
    // Example 2: Marathon First-Timer (Daniels Approach)
    await this.example2MarathonFirstTimer();
    
    // Example 3: Time-Constrained Professional
    await this.example3TimeConstrainedRunner();
    
    // Example 4: Advanced Runner Seeking PR
    await this.example4AdvancedRunner();
    
    // Demonstrate Daniels-specific features
    await this.demonstrateDanielsFeatures();
  }

  /**
   * Example 1: Competitive 5K/10K track runner
   */
  private async example1CompetitiveTrackRunner(): Promise<void> {
    console.log('📊 EXAMPLE 1: Competitive 5K/10K Track Runner\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Daniels 5K/10K Competition Plan',
      methodology: 'daniels',
      goal: '10K',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000), // 12 weeks
      
      currentFitness: {
        vdot: 55, // Strong club-level runner
        weeklyMileage: 60, // km/week
        longestRecentRun: 25,
        trainingAge: 6
      },
      
      preferences: {
        availableDays: [1, 2, 3, 4, 5, 6, 0], // All days available
        preferredIntensity: 'high',
        crossTraining: false,
        strengthTraining: true,
        trackAccess: true
      },
      
      targetRaces: [
        {
          distance: '5K',
          date: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B',
          goalTime: { minutes: 18, seconds: 30 }
        },
        {
          distance: '10K',
          date: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { minutes: 38, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzeDanielsPlan(plan, 'Competitive Track Runner');
    
    // Show specific Daniels features for this runner
    const daniels = PhilosophyFactory.create('daniels');
    const paces = daniels.calculateTrainingPaces(55);
    
    console.log('🎯 Daniels Training Paces (VDOT 55):');
    console.log(`  Easy (E): ${paces.easy.toFixed(1)} min/km`);
    console.log(`  Marathon (M): ${paces.marathon.toFixed(1)} min/km`);
    console.log(`  Threshold (T): ${paces.threshold.toFixed(1)} min/km`);
    console.log(`  Interval (I): ${paces.interval.toFixed(1)} min/km`);
    console.log(`  Repetition (R): ${paces.repetition.toFixed(1)} min/km\n`);
    
    // Show sample week
    this.showSampleWeek(plan, 6, 'Peak Training Week');
  }

  /**
   * Example 2: Marathon first-timer using Daniels approach
   */
  private async example2MarathonFirstTimer(): Promise<void> {
    console.log('🔥 EXAMPLE 2: Marathon First-Timer (Daniels Approach)\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Daniels First Marathon Plan',
      methodology: 'daniels',
      goal: 'MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 18 * 7 * 24 * 60 * 60 * 1000), // 18 weeks
      
      currentFitness: {
        vdot: 42, // Intermediate runner
        weeklyMileage: 40,
        longestRecentRun: 18,
        trainingAge: 2
      },
      
      preferences: {
        availableDays: [1, 2, 3, 5, 6], // 5 days/week
        preferredIntensity: 'moderate',
        crossTraining: true,
        strengthTraining: true,
        conservative: true // Safe progression
      },
      
      targetRaces: [
        {
          distance: 'half-marathon',
          date: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B',
          goalTime: { hours: 1, minutes: 45, seconds: 0 }
        },
        {
          distance: 'marathon',
          date: new Date(Date.now() + 18 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { hours: 3, minutes: 45, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzeDanielsPlan(plan, 'Marathon First-Timer');
    
    // Show how Daniels 80/20 helps with marathon preparation
    console.log('📈 Daniels 80/20 Approach Benefits for Marathon:');
    console.log('  • 80% easy running builds massive aerobic base');
    console.log('  • 20% hard running develops efficiency and speed');
    console.log('  • VDOT progression ensures appropriate intensity');
    console.log('  • Scientific approach reduces guesswork\n');
    
    this.showSampleWeek(plan, 14, 'Marathon Build Week');
  }

  /**
   * Example 3: Time-constrained professional
   */
  private async example3TimeConstrainedRunner(): Promise<void> {
    console.log('⏰ EXAMPLE 3: Time-Constrained Professional\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Daniels Efficient Training Plan',
      methodology: 'daniels',
      goal: 'HALF_MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000), // 10 weeks
      
      currentFitness: {
        vdot: 48,
        weeklyMileage: 35,
        longestRecentRun: 16,
        trainingAge: 3
      },
      
      preferences: {
        availableDays: [1, 3, 5, 6], // 4 days/week
        preferredIntensity: 'moderate',
        crossTraining: true,
        timeConstraints: {
          1: 50, // Monday: 50 minutes max
          3: 45, // Wednesday: 45 minutes max  
          5: 60, // Friday: 60 minutes max
          6: 90  // Saturday: 90 minutes max
        }
      },
      
      targetRaces: [
        {
          distance: 'half-marathon',
          date: new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { hours: 1, minutes: 35, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzeDanielsPlan(plan, 'Time-Constrained Professional');
    
    console.log('⚡ Daniels Efficiency for Busy Runners:');
    console.log('  • Quality over quantity - precise intensity targeting');
    console.log('  • Structured workouts maximize limited time');
    console.log('  • VDOT ensures every minute counts');
    console.log('  • Clear progression without wasted effort\n');
    
    this.showSampleWeek(plan, 7, 'Efficient Training Week');
  }

  /**
   * Example 4: Advanced runner seeking PR
   */
  private async example4AdvancedRunner(): Promise<void> {
    console.log('🏆 EXAMPLE 4: Advanced Runner Seeking PR\n');
    
    const config: AdvancedPlanConfig = {
      name: 'Daniels Advanced PR Plan',
      methodology: 'daniels',
      goal: 'MARATHON',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000), // 16 weeks
      
      currentFitness: {
        vdot: 60, // High-level club runner
        weeklyMileage: 85,
        longestRecentRun: 35,
        trainingAge: 8
      },
      
      preferences: {
        availableDays: [1, 2, 3, 4, 5, 6, 0], // Daily training
        preferredIntensity: 'high',
        crossTraining: false,
        strengthTraining: true,
        trackAccess: true,
        advanced: true
      },
      
      targetRaces: [
        {
          distance: '10K',
          date: new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B',
          goalTime: { minutes: 34, seconds: 0 }
        },
        {
          distance: 'half-marathon',
          date: new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000),
          priority: 'B',
          goalTime: { hours: 1, minutes: 15, seconds: 0 }
        },
        {
          distance: 'marathon',
          date: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
          priority: 'A',
          goalTime: { hours: 2, minutes: 45, seconds: 0 }
        }
      ]
    };

    const generator = new AdvancedTrainingPlanGenerator(config);
    const plan = await generator.generateAdvancedPlan();
    
    this.analyzeDanielsPlan(plan, 'Advanced PR Seeker');
    
    console.log('🎯 Advanced Daniels Features:');
    console.log('  • Multiple VDOT testing throughout plan');
    console.log('  • Advanced interval structures (cruise intervals, etc.)');
    console.log('  • Precise marathon simulation workouts');
    console.log('  • Integrated tune-up race analysis\n');
    
    this.showSampleWeek(plan, 12, 'Advanced Peak Week');
  }

  /**
   * Demonstrate Daniels-specific features and customizations
   */
  private async demonstrateDanielsFeatures(): Promise<void> {
    console.log('🔬 DANIELS METHODOLOGY FEATURES\n');
    
    const daniels = PhilosophyFactory.create('daniels');
    
    // VDOT progression examples
    console.log('📊 VDOT Progression Examples:');
    const vdotValues = [35, 40, 45, 50, 55, 60, 65];
    
    console.log('VDOT'.padEnd(8) + 'E Pace'.padEnd(10) + 'T Pace'.padEnd(10) + 'I Pace'.padEnd(10) + 'R Pace');
    console.log('-'.repeat(50));
    
    vdotValues.forEach(vdot => {
      const paces = daniels.calculateTrainingPaces(vdot);
      console.log(
        vdot.toString().padEnd(8) +
        paces.easy.toFixed(1).padEnd(10) +
        paces.threshold.toFixed(1).padEnd(10) +
        paces.interval.toFixed(1).padEnd(10) +
        paces.repetition.toFixed(1)
      );
    });
    
    console.log('\n🎯 Intensity Distribution Analysis:');
    console.log('The Daniels 80/20 principle:');
    console.log('  • 80% Easy + Marathon pace running');
    console.log('  • 20% Threshold + Interval + Repetition work');
    console.log('  • Promotes aerobic development while maintaining speed');
    console.log('  • Supported by physiological research on optimal training stress\n');
    
    console.log('⚙️ Daniels Customization Options:');
    console.log('  1. VDOT Adjustment: Fine-tune based on individual response');
    console.log('  2. Intensity Distribution: Modify 80/20 for specific goals');
    console.log('  3. Zone Emphasis: Focus on specific physiological adaptations');
    console.log('  4. Workout Complexity: Simple to advanced interval structures');
    console.log('  5. Race Integration: Use races as fitness assessments');
    console.log('  6. Environmental Factors: Altitude, heat, humidity adjustments\n');
    
    console.log('🏃‍♂️ Signature Daniels Workouts:');
    console.log('  • Cruise Intervals: 15-30 min tempo runs with short rests');
    console.log('  • 400m/800m/1200m Intervals: VO2max development');
    console.log('  • Short Repetitions: 200m-400m for speed/neuromuscular power');
    console.log('  • Long Runs: 25-35% of weekly volume at easy pace');
    console.log('  • Marathon Simulation: Race pace segments in long runs\n');
  }

  /**
   * Analyze a Daniels training plan
   */
  private analyzeDanielsPlan(plan: TrainingPlan, description: string): void {
    console.log(`📋 ${description} Plan Analysis:\n`);
    
    // Basic statistics
    console.log(`Total workouts: ${plan.workouts.length}`);
    console.log(`Total distance: ${Math.round(plan.summary.totalDistance)}km`);
    console.log(`Average weekly: ${Math.round(plan.summary.averageWeeklyDistance)}km`);
    console.log(`Peak week: ${Math.round(plan.summary.peakWeeklyDistance)}km\n`);
    
    // Intensity distribution analysis
    const workoutTypes = plan.workouts.reduce((counts: Record<string, number>, workout) => {
      counts[workout.type] = (counts[workout.type] || 0) + 1;
      return counts;
    }, {});
    
    const totalWorkouts = plan.workouts.length;
    const easyWorkouts = (workoutTypes.easy || 0) + (workoutTypes.recovery || 0) + (workoutTypes.long_run || 0);
    const hardWorkouts = (workoutTypes.threshold || 0) + (workoutTypes.vo2max || 0) + 
                        (workoutTypes.speed || 0) + (workoutTypes.intervals || 0);
    const moderateWorkouts = totalWorkouts - easyWorkouts - hardWorkouts;
    
    const easyPercent = Math.round((easyWorkouts / totalWorkouts) * 100);
    const hardPercent = Math.round((hardWorkouts / totalWorkouts) * 100);
    
    console.log('🎯 Daniels 80/20 Analysis:');
    console.log(`  Easy running: ${easyPercent}% (target: ~80%)`);
    console.log(`  Hard running: ${hardPercent}% (target: ~20%)`);
    console.log(`  Quality distribution: ${this.assessDanielsCompliance(easyPercent, hardPercent)}\n`);
    
    // Key workout distribution
    console.log('🏃‍♂️ Key Workout Types:');
    Object.entries(workoutTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([type, count]) => {
        const percentage = Math.round((count / totalWorkouts) * 100);
        console.log(`  ${type}: ${count} workouts (${percentage}%)`);
      });
    
    console.log('\n');
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
      const intensity = this.getIntensityDescription(workout.type);
      
      console.log(`  ${day}: ${workout.type} - ${duration}min, ${distance}km ${intensity}`);
    });
    
    const totalDistance = weekWorkouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    const totalTime = weekWorkouts.reduce((sum, w) => sum + w.targetMetrics.duration, 0);
    
    console.log(`  Total: ${Math.round(totalDistance)}km, ${Math.round(totalTime)}min\n`);
  }

  /**
   * Assess compliance with Daniels 80/20 principle
   */
  private assessDanielsCompliance(easyPercent: number, hardPercent: number): string {
    if (easyPercent >= 75 && easyPercent <= 85 && hardPercent >= 15 && hardPercent <= 25) {
      return 'Excellent compliance with 80/20 principle ✅';
    } else if (easyPercent >= 70 && easyPercent <= 90 && hardPercent >= 10 && hardPercent <= 30) {
      return 'Good compliance, within acceptable range ✓';
    } else {
      return 'Outside optimal range, may need adjustment ⚠️';
    }
  }

  /**
   * Get intensity description for workout type
   */
  private getIntensityDescription(workoutType: string): string {
    const intensityMap: Record<string, string> = {
      'easy': '(Easy pace)',
      'recovery': '(Recovery pace)',
      'long_run': '(Easy/Marathon pace)',
      'tempo': '(Comfortably hard)',
      'threshold': '(Threshold pace)',
      'intervals': '(VO2max pace)',
      'vo2max': '(VO2max pace)',
      'speed': '(5K pace)',
      'repetition': '(Mile pace or faster)'
    };
    
    return intensityMap[workoutType] || '';
  }
}

// Export for use in other examples
export { DanielsTrainingExamples };

// Run if called directly
if (require.main === module) {
  const examples = new DanielsTrainingExamples();
  examples.generateAllExamples().catch(console.error);
}