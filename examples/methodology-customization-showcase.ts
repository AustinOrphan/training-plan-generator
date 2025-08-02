/**
 * Methodology Customization Showcase
 * 
 * Demonstrates advanced customization options for each training methodology,
 * showing how to adapt plans for specific needs, constraints, and goals.
 */

import {
  AdvancedTrainingPlanGenerator,
  PhilosophyFactory,
  SmartAdaptationEngine,
  type AdvancedPlanConfig,
  type TrainingPlan,
  type TrainingMethodology
} from '../src/index';

interface CustomizationScenario {
  name: string;
  description: string;
  methodology: TrainingMethodology;
  baseConfig: Omit<AdvancedPlanConfig, 'methodology' | 'name'>;
  customizations: {
    name: string;
    description: string;
    configChanges: Partial<AdvancedPlanConfig>;
    expectedImpact: string;
  }[];
}

class MethodologyCustomizationShowcase {
  
  /**
   * Run comprehensive customization demonstrations
   */
  async runCustomizationShowcase(): Promise<void> {
    console.log('🎛️ Training Methodology Customization Showcase\n');
    console.log('Demonstrating advanced customization options for each methodology\n');

    // Create customization scenarios
    const scenarios = this.createCustomizationScenarios();
    
    for (const scenario of scenarios) {
      await this.demonstrateScenarioCustomizations(scenario);
    }
    
    // Show methodology-specific advanced features
    await this.demonstrateAdvancedCustomizations();
    
    // Show environmental and constraint adaptations
    await this.demonstrateEnvironmentalAdaptations();
    
    // Show adaptive customizations
    await this.demonstrateAdaptiveCustomizations();
  }

  /**
   * Demonstrate all customizations for a specific scenario
   */
  private async demonstrateScenarioCustomizations(scenario: CustomizationScenario): Promise<void> {
    console.log(`${'='.repeat(80)}`);
    console.log(`🎯 ${scenario.name.toUpperCase()} (${scenario.methodology})`);
    console.log(`${'='.repeat(80)}\n`);
    console.log(`Description: ${scenario.description}\n`);
    
    // Generate base plan
    const baseConfig: AdvancedPlanConfig = {
      ...scenario.baseConfig,
      methodology: scenario.methodology,
      name: `${scenario.name} - Base Plan`
    };
    
    const baseGenerator = new AdvancedTrainingPlanGenerator(baseConfig);
    const basePlan = await baseGenerator.generateAdvancedPlan();
    
    console.log('📊 Base Plan Characteristics:');
    this.analyzePlan(basePlan, 'Base Configuration');
    
    // Apply each customization
    for (let i = 0; i < scenario.customizations.length; i++) {
      const customization = scenario.customizations[i];
      console.log(`\n🔧 CUSTOMIZATION ${i + 1}: ${customization.name}\n`);
      console.log(`Description: ${customization.description}`);
      console.log(`Expected Impact: ${customization.expectedImpact}\n`);
      
      // Generate customized plan
      const customConfig: AdvancedPlanConfig = {
        ...baseConfig,
        ...customization.configChanges,
        name: `${scenario.name} - ${customization.name}`
      };
      
      const customGenerator = new AdvancedTrainingPlanGenerator(customConfig);
      const customPlan = await customGenerator.generateAdvancedPlan();
      
      // Compare with base plan
      this.comparePlans(basePlan, customPlan, customization.name);
      
      // Show sample week from customized plan
      this.showCustomizationExample(customPlan, customization.name);
    }
    
    console.log('\n');
  }

  /**
   * Create customization scenarios for each methodology
   */
  private createCustomizationScenarios(): CustomizationScenario[] {
    return [
      {
        name: 'High-Volume Daniels Athlete',
        description: 'Advanced runner who can handle high training loads with Daniels precision',
        methodology: 'daniels',
        baseConfig: {
          goal: 'MARATHON',
          startDate: new Date(),
          targetDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
          currentFitness: {
            vdot: 58,
            weeklyMileage: 75,
            longestRecentRun: 35,
            trainingAge: 6,
            overallScore: 71 // VDOT: 72.5 + Volume: 75 + Experience: 60 + Recovery: 75 * weights = 71
          },
          preferences: {
            availableDays: [1, 2, 3, 4, 5, 6, 0],
            preferredIntensity: 'high'
          }
        },
        customizations: [
          {
            name: 'Modified 85/15 Distribution',
            description: 'Adjust from 80/20 to 85/15 for increased aerobic emphasis',
            configChanges: {
              preferences: {
                availableDays: [1, 2, 3, 4, 5, 6, 0],
                preferredIntensity: 'moderate',
                intensityDistribution: { easy: 85, hard: 15 }
              }
            },
            expectedImpact: 'Enhanced aerobic development, reduced injury risk'
          },
          {
            name: 'VDOT Progression Override',
            description: 'Use fitness testing schedule to update VDOT throughout plan',
            configChanges: {
              preferences: {
                availableDays: [1, 2, 3, 4, 5, 6, 0],
                preferredIntensity: 'high',
                vdotProgression: true,
                testingSchedule: [4, 8, 12] // Test weeks 4, 8, 12
              }
            },
            expectedImpact: 'More accurate training paces as fitness improves'
          },
          {
            name: 'Double Threshold Focus',
            description: 'Emphasize threshold work for marathon-specific fitness',
            configChanges: {
              preferences: {
                availableDays: [1, 2, 3, 4, 5, 6, 0],
                preferredIntensity: 'high',
                workoutEmphasis: ['threshold', 'tempo'],
                doubleThreshold: true
              }
            },
            expectedImpact: 'Enhanced lactate clearance and marathon-specific fitness'
          }
        ]
      },
      {
        name: 'Time-Constrained Lydiard Runner',
        description: 'Busy professional adapting Lydiard principles to limited time',
        methodology: 'lydiard',
        baseConfig: {
          goal: 'HALF_MARATHON',
          startDate: new Date(),
          targetDate: new Date(Date.now() + 14 * 7 * 24 * 60 * 60 * 1000),
          currentFitness: {
            vdot: 45,
            weeklyMileage: 40,
            longestRecentRun: 18,
            trainingAge: 3,
            overallScore: 50 // VDOT: 56.3 + Volume: 40 + Experience: 30 + Recovery: 75 * weights = 50
          },
          preferences: {
            availableDays: [1, 3, 5, 6],
            preferredIntensity: 'low'
          }
        },
        customizations: [
          {
            name: 'Compressed Base Phase',
            description: 'Shorten aerobic base phase while maintaining quality',
            configChanges: {
              preferences: {
                availableDays: [1, 3, 5, 6],
                preferredIntensity: 'low',
                compressedPhases: true,
                basePhaseWeeks: 6 // Reduced from typical 10-12 weeks
              }
            },
            expectedImpact: 'Faster progression to race-specific training'
          },
          {
            name: 'Indoor Hill Training',
            description: 'Adapt hill training for treadmill and gym access',
            configChanges: {
              preferences: {
                availableDays: [1, 3, 5, 6],
                preferredIntensity: 'low',
                hillAccess: false,
                treadmillAccess: true,
                indoorTraining: true
              }
            },
            expectedImpact: 'Maintain Lydiard strength benefits without outdoor hills'
          },
          {
            name: 'Time-Efficient Aerobic Focus',
            description: 'Maximize aerobic benefit in shorter time windows',
            configChanges: {
              preferences: {
                availableDays: [1, 3, 5, 6],
                preferredIntensity: 'low',
                timeConstraints: { 1: 45, 3: 60, 5: 45, 6: 90 },
                efficientAerobic: true
              }
            },
            expectedImpact: 'High aerobic stimulus in limited time'
          }
        ]
      },
      {
        name: 'Elite Pfitzinger Marathoner',
        description: 'Competitive athlete maximizing Pfitzinger methodology',
        methodology: 'pfitzinger',
        baseConfig: {
          goal: 'MARATHON',
          startDate: new Date(),
          targetDate: new Date(Date.now() + 18 * 7 * 24 * 60 * 60 * 1000),
          currentFitness: {
            vdot: 62,
            weeklyMileage: 95,
            longestRecentRun: 40,
            trainingAge: 8,
            overallScore: 82 // VDOT: 77.5 + Volume: 95 + Experience: 80 + Recovery: 75 * weights = 82
          },
          preferences: {
            availableDays: [1, 2, 3, 4, 5, 6, 0],
            preferredIntensity: 'high'
          }
        },
        customizations: [
          {
            name: 'Advanced LT Progression',
            description: 'Sophisticated lactate threshold development',
            configChanges: {
              preferences: {
                availableDays: [1, 2, 3, 4, 5, 6, 0],
                preferredIntensity: 'high',
                advancedLT: true,
                ltVolumeProgression: 'aggressive',
                cruiseIntervals: true
              }
            },
            expectedImpact: 'Maximum lactate threshold development'
          },
          {
            name: 'Multi-Pace MLRs',
            description: 'Complex medium-long runs with multiple pace changes',
            configChanges: {
              preferences: {
                availableDays: [1, 2, 3, 4, 5, 6, 0],
                preferredIntensity: 'high',
                complexMLRs: true,
                marathonSimulation: true,
                multiPaceMLRs: true
              }
            },
            expectedImpact: 'Enhanced race-specific fitness and mental preparation'
          },
          {
            name: 'Integrated Tune-up Strategy',
            description: 'Strategic tune-up race placement and recovery',
            configChanges: {
              preferences: {
                availableDays: [1, 2, 3, 4, 5, 6, 0],
                preferredIntensity: 'high'
              },
              targetRaces: [
                {
                  distance: '10K',
                  date: new Date(Date.now() + 6 * 7 * 24 * 60 * 60 * 1000),
                  priority: 'C',
                  goalTime: { minutes: 32, seconds: 0 }
                },
                {
                  distance: 'half-marathon',
                  date: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
                  priority: 'B',
                  goalTime: { hours: 1, minutes: 12, seconds: 0 }
                }
              ]
            },
            expectedImpact: 'Optimized fitness progression and race preparation'
          }
        ]
      }
    ];
  }

  /**
   * Demonstrate advanced methodology-specific customizations
   */
  private async demonstrateAdvancedCustomizations(): Promise<void> {
    console.log('🚀 ADVANCED METHODOLOGY CUSTOMIZATIONS\n');
    
    console.log('💡 Daniels Advanced Features:');
    console.log('  • Dynamic VDOT Updates: Automatic pace adjustments based on workout performance');
    console.log('  • Seasonal Periodization: Multiple training cycles throughout the year');
    console.log('  • Altitude Adjustment: Automatic pace modifications for elevation training');
    console.log('  • Heat Acclimatization: Progressive adaptation for hot weather racing');
    console.log('  • Track vs Road Optimization: Surface-specific workout selection');
    console.log('  • Race Prediction Modeling: Advanced performance forecasting\n');
    
    console.log('🏔️ Lydiard Advanced Features:');
    console.log('  • Extended Base Phases: 16-24 week aerobic base periods for ultra training');
    console.log('  • Hill Training Progressions: Sophisticated resistance training protocols');
    console.log('  • Cross-Training Integration: Cycling and swimming for aerobic development');
    console.log('  • Recovery Periodization: Strategic complete rest vs active recovery');
    console.log('  • Volume Plateau Management: Maintaining high volume without burnout');
    console.log('  • Natural Terrain Emphasis: Trail and varied surface training\n');
    
    console.log('🎯 Pfitzinger Advanced Features:');
    console.log('  • LT Threshold Refinement: Precise lactate threshold identification');
    console.log('  • Marathon Simulation Protocols: Race-day condition replication');
    console.log('  • Nutrition Strategy Integration: Fueling practice in long workouts');
    console.log('  • Weather Strategy Training: Pace adjustments for race conditions');
    console.log('  • Pacing Strategy Development: Negative split and surge training');
    console.log('  • Recovery Week Optimization: Strategic deload timing\n');
  }

  /**
   * Demonstrate environmental and constraint adaptations
   */
  private async demonstrateEnvironmentalAdaptations(): Promise<void> {
    console.log('🌍 ENVIRONMENTAL AND CONSTRAINT ADAPTATIONS\n');
    
    const adaptationExamples = [
      {
        scenario: 'Hot Climate Training',
        adaptations: [
          'Early morning workout scheduling',
          'Increased hydration protocols',
          'Pace adjustments for heat stress',
          'Recovery time extensions',
          'Indoor training alternatives'
        ]
      },
      {
        scenario: 'High Altitude Training',
        adaptations: [
          'Gradual acclimatization schedule',
          'Pace adjustments for reduced oxygen',
          'Increased easy running percentage',
          'Enhanced recovery monitoring',
          'Altitude-specific VDOT calculations'
        ]
      },
      {
        scenario: 'Urban/Pollution Training',
        adaptations: [
          'Air quality monitoring integration',
          'Indoor training prioritization',
          'Route optimization for cleaner air',
          'Mask training protocols',
          'Time-of-day adjustments'
        ]
      },
      {
        scenario: 'Limited Equipment Access',
        adaptations: [
          'Bodyweight strength training',
          'Hill repeat alternatives',
          'Track workout substitutions',
          'Pace estimation without GPS',
          'Heart rate-based training'
        ]
      },
      {
        scenario: 'Injury History Considerations',
        adaptations: [
          'Surface-specific training plans',
          'Biomechanical load management',
          'Cross-training emphasison',
          'Recovery protocol intensification',
          'Movement quality assessment'
        ]
      }
    ];
    
    adaptationExamples.forEach(example => {
      console.log(`🔧 ${example.scenario}:`);
      example.adaptations.forEach(adaptation => {
        console.log(`  • ${adaptation}`);
      });
      console.log('');
    });
  }

  /**
   * Demonstrate adaptive customizations based on progress
   */
  private async demonstrateAdaptiveCustomizations(): Promise<void> {
    console.log('🤖 ADAPTIVE CUSTOMIZATION EXAMPLES\n');
    
    console.log('Real-time plan adaptations based on performance and recovery:\n');
    
    const adaptationEngine = new SmartAdaptationEngine();
    
    // Simulate different response scenarios
    const scenarios = [
      {
        name: 'Positive Adaptation',
        description: 'Athlete responding well to training',
        response: 'excellent',
        adaptations: [
          'Gradual volume increases (+5-10%)',
          'Introduction of advanced workouts',
          'Reduced recovery time between sessions',
          'Addition of race-pace segments',
          'Progression to next training phase'
        ]
      },
      {
        name: 'Overreaching Detected',
        description: 'Signs of excessive training stress',
        response: 'struggling',
        adaptations: [
          'Immediate volume reduction (-20-30%)',
          'Intensity reduction to aerobic only',
          'Extended recovery periods',
          'Sleep and nutrition counseling',
          'Return-to-training protocol'
        ]
      },
      {
        name: 'Plateau Response',
        description: 'Fitness gains have stalled',
        response: 'plateau',
        adaptations: [
          'Training stimulus variation',
          'New workout types introduction',
          'Cross-training integration',
          'Recovery week insertion',
          'Goal reassessment and adjustment'
        ]
      },
      {
        name: 'Illness/Life Stress',
        description: 'External factors affecting training',
        response: 'compromised',
        adaptations: [
          'Flexible training schedule',
          'Reduced intensity requirements',
          'Maintenance-focused approach',
          'Stress management integration',
          'Timeline adjustment if needed'
        ]
      }
    ];
    
    scenarios.forEach(scenario => {
      console.log(`📊 ${scenario.name}:`);
      console.log(`   ${scenario.description}`);
      console.log('   Automatic Adaptations:');
      scenario.adaptations.forEach(adaptation => {
        console.log(`     • ${adaptation}`);
      });
      console.log('');
    });
    
    console.log('🔄 Adaptation Process:');
    console.log('  1. Continuous monitoring of workout completion rates');
    console.log('  2. Recovery metrics analysis (HRV, sleep, subjective scores)');
    console.log('  3. Performance trend identification');
    console.log('  4. Automatic plan modification recommendations');
    console.log('  5. User approval for significant changes');
    console.log('  6. Implementation and continued monitoring\n');
  }

  /**
   * Compare two training plans to show customization impact
   */
  private comparePlans(basePlan: TrainingPlan, customPlan: TrainingPlan, customizationName: string): void {
    console.log(`📊 Impact of "${customizationName}":\n`);
    
    // Volume comparison
    const baseVolume = Math.round(basePlan.summary.totalDistance);
    const customVolume = Math.round(customPlan.summary.totalDistance);
    const volumeChange = ((customVolume - baseVolume) / baseVolume) * 100;
    
    console.log(`Volume Change: ${baseVolume}km → ${customVolume}km (${volumeChange > 0 ? '+' : ''}${volumeChange.toFixed(1)}%)`);
    
    // Intensity distribution comparison
    const baseIntensity = this.analyzeIntensityDistribution(basePlan);
    const customIntensity = this.analyzeIntensityDistribution(customPlan);
    
    console.log('Intensity Distribution Changes:');
    console.log(`  Easy: ${baseIntensity.easy}% → ${customIntensity.easy}% (${customIntensity.easy - baseIntensity.easy > 0 ? '+' : ''}${customIntensity.easy - baseIntensity.easy}%)`);
    console.log(`  Moderate: ${baseIntensity.moderate}% → ${customIntensity.moderate}% (${customIntensity.moderate - baseIntensity.moderate > 0 ? '+' : ''}${customIntensity.moderate - baseIntensity.moderate}%)`);
    console.log(`  Hard: ${baseIntensity.hard}% → ${customIntensity.hard}% (${customIntensity.hard - baseIntensity.hard > 0 ? '+' : ''}${customIntensity.hard - baseIntensity.hard}%)`);
    
    // Workout type changes
    const baseTypes = this.analyzeWorkoutTypes(basePlan);
    const customTypes = this.analyzeWorkoutTypes(customPlan);
    
    console.log('Key Workout Changes:');
    Object.keys(baseTypes).forEach(type => {
      const baseCount = baseTypes[type] || 0;
      const customCount = customTypes[type] || 0;
      const change = customCount - baseCount;
      if (Math.abs(change) > 0) {
        console.log(`  ${type}: ${baseCount} → ${customCount} (${change > 0 ? '+' : ''}${change})`);
      }
    });
    
    console.log('');
  }

  /**
   * Show specific example of customization in action
   */
  private showCustomizationExample(plan: TrainingPlan, customizationName: string): void {
    console.log(`📅 Sample Week with "${customizationName}":\n`);
    
    // Find a representative week (around week 6-8)
    const targetWeek = 6;
    const weekWorkouts = plan.workouts.filter(workout => {
      const planWeek = Math.floor((workout.date.getTime() - plan.config.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return planWeek === targetWeek;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (weekWorkouts.length === 0) return;
    
    weekWorkouts.forEach(workout => {
      const day = workout.date.toLocaleDateString('en-US', { weekday: 'short' });
      const duration = workout.targetMetrics.duration;
      const distance = Math.round(workout.targetMetrics.distance || 0);
      
      console.log(`  ${day}: ${workout.type} - ${duration}min, ${distance}km`);
    });
    
    const totalDistance = weekWorkouts.reduce((sum, w) => sum + (w.targetMetrics.distance || 0), 0);
    console.log(`  Weekly Total: ${Math.round(totalDistance)}km\n`);
  }

  /**
   * Analyze plan characteristics
   */
  private analyzePlan(plan: TrainingPlan, label: string): void {
    console.log(`${label}:`);
    console.log(`  Total Distance: ${Math.round(plan.summary.totalDistance)}km`);
    console.log(`  Average Weekly: ${Math.round(plan.summary.averageWeeklyDistance)}km`);
    console.log(`  Total Workouts: ${plan.workouts.length}`);
    
    const intensity = this.analyzeIntensityDistribution(plan);
    console.log(`  Intensity: ${intensity.easy}% easy, ${intensity.moderate}% moderate, ${intensity.hard}% hard\n`);
  }

  /**
   * Analyze intensity distribution of a plan
   */
  private analyzeIntensityDistribution(plan: TrainingPlan): { easy: number; moderate: number; hard: number } {
    const workouts = plan.workouts;
    const total = workouts.length;
    
    const easy = workouts.filter(w => ['easy', 'recovery', 'long_run'].includes(w.type)).length;
    const hard = workouts.filter(w => ['intervals', 'vo2max', 'speed', 'threshold'].includes(w.type)).length;
    const moderate = total - easy - hard;
    
    return {
      easy: Math.round((easy / total) * 100),
      moderate: Math.round((moderate / total) * 100),
      hard: Math.round((hard / total) * 100)
    };
  }

  /**
   * Analyze workout type distribution
   */
  private analyzeWorkoutTypes(plan: TrainingPlan): Record<string, number> {
    return plan.workouts.reduce((counts: Record<string, number>, workout) => {
      counts[workout.type] = (counts[workout.type] || 0) + 1;
      return counts;
    }, {});
  }
}

// Export for use in other examples
export { MethodologyCustomizationShowcase };

// Run if called directly
if (require.main === module) {
  const showcase = new MethodologyCustomizationShowcase();
  showcase.runCustomizationShowcase().catch(console.error);
}