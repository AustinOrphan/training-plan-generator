/**
 * Interactive Training Methodology Demo
 * 
 * A comprehensive interactive demonstration that showcases the differences
 * between training methodologies through step-by-step examples, comparisons,
 * and customization options.
 */

import {
  AdvancedTrainingPlanGenerator,
  PhilosophyFactory,
  PhilosophyComparator,
  MultiFormatExporter,
  SmartAdaptationEngine,
  ResearchValidationSystem,
  type AdvancedPlanConfig,
  type TrainingPlan,
  type TrainingMethodology
} from '../src/index';

interface DemoScenario {
  name: string;
  description: string;
  athlete: {
    level: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
    constraints: string[];
    preferences: any;
  };
  config: Omit<AdvancedPlanConfig, 'methodology'>;
}

class InteractiveMethodologyDemo {
  private comparator = new PhilosophyComparator();
  private exporter = new MultiFormatExporter();
  private validator = new ResearchValidationSystem();

  /**
   * Main interactive demo that walks through methodology selection and comparison
   */
  async runInteractiveDemo(): Promise<void> {
    console.log('🚀 Welcome to the Interactive Training Methodology Demo!\n');
    console.log('This demo will help you understand the differences between training methodologies');
    console.log('and see how they work with different athlete profiles and goals.\n');

    // Demo scenarios
    const scenarios = this.createDemoScenarios();
    
    console.log('📋 Available Demo Scenarios:\n');
    scenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.name}`);
      console.log(`   ${scenario.description}`);
      console.log(`   Level: ${scenario.athlete.level} | Goals: ${scenario.athlete.goals.join(', ')}\n`);
    });

    // Run all scenarios
    for (let i = 0; i < scenarios.length; i++) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎯 SCENARIO ${i + 1}: ${scenarios[i].name.toUpperCase()}`);
      console.log(`${'='.repeat(80)}\n`);
      
      await this.runScenarioDemo(scenarios[i]);
      
      if (i < scenarios.length - 1) {
        console.log('\n⏸️  Press any key to continue to the next scenario...\n');
        // In a real interactive environment, you'd wait for user input
      }
    }

    console.log('\n🎉 Demo complete! You now have a comprehensive understanding of how');
    console.log('different training methodologies work for various athlete profiles.');
  }

  /**
   * Run a comprehensive demo for a specific scenario
   */
  private async runScenarioDemo(scenario: DemoScenario): Promise<void> {
    console.log(`👤 Athlete Profile: ${scenario.athlete.level} runner`);
    console.log(`🎯 Goals: ${scenario.athlete.goals.join(', ')}`);
    console.log(`⚠️  Constraints: ${scenario.athlete.constraints.join(', ')}\n`);

    // Step 1: Methodology Recommendation
    await this.demonstrateMethodologyRecommendation(scenario);

    // Step 2: Generate plans for all methodologies
    const plans = await this.generatePlansForAllMethodologies(scenario);

    // Step 3: Compare methodology outcomes
    await this.compareMethodologyOutcomes(plans, scenario);

    // Step 4: Demonstrate customization options
    await this.demonstrateCustomizationOptions(plans, scenario);

    // Step 5: Show research validation
    await this.demonstrateResearchValidation();

    // Step 6: Export examples
    await this.demonstrateExportOptions(plans);
  }

  /**
   * Demonstrate methodology recommendation engine
   */
  private async demonstrateMethodologyRecommendation(scenario: DemoScenario): Promise<void> {
    console.log('🤖 STEP 1: Methodology Recommendation\n');
    
    // Simulate recommendation logic
    const recommendations = await this.getMethodologyRecommendations(scenario);
    
    console.log('Based on your profile, here are the methodology recommendations:\n');
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.methodology.toUpperCase()} (Score: ${rec.score}/100)`);
      console.log(`   Strengths: ${rec.strengths.join(', ')}`);
      console.log(`   Considerations: ${rec.considerations.join(', ')}`);
      console.log(`   Best For: ${rec.bestFor}\n`);
    });

    console.log(`💡 Top Recommendation: ${recommendations[0].methodology.toUpperCase()}`);
    console.log(`   Reason: ${recommendations[0].reason}\n`);
  }

  /**
   * Generate training plans for all methodologies
   */
  private async generatePlansForAllMethodologies(scenario: DemoScenario): Promise<Record<TrainingMethodology, TrainingPlan>> {
    console.log('⚙️  STEP 2: Plan Generation\n');
    
    const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
    const plans: Record<string, TrainingPlan> = {};

    for (const methodology of methodologies) {
      console.log(`🔄 Generating ${methodology} plan...`);
      
      const config: AdvancedPlanConfig = {
        ...scenario.config,
        methodology,
        name: `${scenario.name} - ${methodology} approach`
      };

      const generator = new AdvancedTrainingPlanGenerator(config);
      const plan = await generator.generateAdvancedPlan();
      plans[methodology] = plan;
      
      console.log(`✅ ${methodology} plan: ${plan.workouts.length} workouts, ${Math.round(plan.summary.totalDistance)}km total`);
    }

    console.log('\n📊 All plans generated successfully!\n');
    return plans as Record<TrainingMethodology, TrainingPlan>;
  }

  /**
   * Compare outcomes between methodologies
   */
  private async compareMethodologyOutcomes(
    plans: Record<TrainingMethodology, TrainingPlan>, 
    scenario: DemoScenario
  ): Promise<void> {
    console.log('📈 STEP 3: Methodology Comparison\n');

    // Generate comparison matrix
    const comparison = await this.comparator.generateComparisonMatrix();
    
    console.log('Key Differences Summary:\n');
    
    const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
    
    // Volume comparison
    console.log('📏 Training Volume:');
    console.log('Method'.padEnd(12) + 'Weekly Avg'.padEnd(12) + 'Peak Week'.padEnd(12) + 'Total');
    console.log('-'.repeat(50));
    
    methodologies.forEach(methodology => {
      const plan = plans[methodology];
      console.log(
        methodology.padEnd(12) + 
        `${Math.round(plan.summary.averageWeeklyDistance)}km`.padEnd(12) +
        `${Math.round(plan.summary.peakWeeklyDistance)}km`.padEnd(12) +
        `${Math.round(plan.summary.totalDistance)}km`
      );
    });

    // Intensity distribution
    console.log('\n🎯 Intensity Distribution:');
    console.log('Method'.padEnd(12) + 'Easy %'.padEnd(10) + 'Moderate %'.padEnd(12) + 'Hard %');
    console.log('-'.repeat(50));
    
    methodologies.forEach(methodology => {
      const plan = plans[methodology];
      const distribution = this.analyzeIntensityDistribution(plan);
      console.log(
        methodology.padEnd(12) + 
        `${distribution.easy}%`.padEnd(10) +
        `${distribution.moderate}%`.padEnd(12) +
        `${distribution.hard}%`
      );
    });

    // Workout focus
    console.log('\n🏃‍♂️ Workout Focus:');
    methodologies.forEach(methodology => {
      const plan = plans[methodology];
      const focus = this.analyzeWorkoutFocus(plan);
      console.log(`${methodology.toUpperCase()}:`);
      console.log(`  Primary: ${focus.primary}`);
      console.log(`  Secondary: ${focus.secondary}`);
      console.log(`  Signature workouts: ${focus.signature.join(', ')}\n`);
    });

    // Expected adaptations
    console.log('🧬 Expected Adaptations:\n');
    methodologies.forEach(methodology => {
      const adaptations = this.getExpectedAdaptations(methodology, scenario);
      console.log(`${methodology.toUpperCase()}:`);
      adaptations.forEach(adaptation => {
        console.log(`  • ${adaptation}`);
      });
      console.log('');
    });
  }

  /**
   * Demonstrate customization options
   */
  private async demonstrateCustomizationOptions(
    plans: Record<TrainingMethodology, TrainingPlan>,
    scenario: DemoScenario
  ): Promise<void> {
    console.log('🎛️  STEP 4: Customization Showcase\n');

    // Show how each methodology can be customized
    const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
    
    for (const methodology of methodologies) {
      console.log(`🔧 ${methodology.toUpperCase()} Customization Options:\n`);
      
      const philosophy = PhilosophyFactory.create(methodology);
      const customizations = this.getCustomizationOptions(methodology, scenario);
      
      console.log('Available Customizations:');
      customizations.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.name}: ${option.description}`);
        console.log(`     Impact: ${option.impact}`);
        console.log(`     Use case: ${option.useCase}\n`);
      });

      // Show a specific customization example
      const plan = plans[methodology];
      const customizedWorkout = await this.demonstrateWorkoutCustomization(philosophy, methodology, scenario);
      
      console.log(`Example: Customized ${methodology} workout:`);
      console.log(`  Type: ${customizedWorkout.type}`);
      console.log(`  Duration: ${customizedWorkout.estimatedDuration} minutes`);
      console.log(`  Focus: ${customizedWorkout.adaptationTarget}`);
      console.log(`  Special features: ${customizedWorkout.specialFeatures.join(', ')}\n`);
    }
  }

  /**
   * Demonstrate research validation
   */
  private async demonstrateResearchValidation(): Promise<void> {
    console.log('🔬 STEP 5: Research Validation\n');

    console.log('Each methodology has been validated against research sources:\n');

    const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
    
    for (const methodology of methodologies) {
      console.log(`📚 ${methodology.toUpperCase()} Validation:`);
      
      // Get validation results
      const validation = await this.validator.validateMethodologyResearch(methodology, true);
      
      console.log(`  Accuracy Score: ${validation.accuracyScore.toFixed(1)}%`);
      console.log(`  Grade: ${validation.validationSummary.overallGrade}`);
      console.log(`  Certification: ${validation.validationSummary.certificationStatus}`);
      console.log(`  Expert Reviews: ${validation.expertReviews.length} reviews`);
      console.log(`  Source Compliance: ${validation.sourceCompliance.length} sources validated`);
      
      // Show top validated principles
      const topPrinciples = validation.validatedPrinciples
        .sort((a, b) => b.implementationAccuracy - a.implementationAccuracy)
        .slice(0, 3);
        
      console.log('  Top Validated Principles:');
      topPrinciples.forEach(principle => {
        console.log(`    • ${principle.principle}: ${principle.implementationAccuracy.toFixed(1)}% accuracy`);
      });
      
      console.log('');
    }
  }

  /**
   * Demonstrate export options
   */
  private async demonstrateExportOptions(plans: Record<TrainingMethodology, TrainingPlan>): Promise<void> {
    console.log('📤 STEP 6: Export Options\n');

    const formats = ['pdf', 'ical', 'csv', 'json'];
    const methodology = 'daniels'; // Use Daniels as example
    const plan = plans[methodology];

    console.log(`Demonstrating export options using ${methodology} plan:\n`);

    for (const format of formats) {
      console.log(`🔄 Exporting to ${format.toUpperCase()}...`);
      
      try {
        const result = await this.exporter.exportPlan(plan, format as any);
        
        console.log(`✅ Export successful:`);
        console.log(`   File: ${result.filename}`);
        console.log(`   Size: ${result.size} bytes`);
        console.log(`   Format: ${result.metadata?.format}`);
        
        if (format === 'ical') {
          console.log(`   Events: ${result.metadata?.eventCount || 'N/A'}`);
        } else if (format === 'csv') {
          console.log(`   Rows: ${result.metadata?.rowCount || 'N/A'}`);
        } else if (format === 'pdf') {
          console.log(`   Pages: ${result.metadata?.pageCount || 'N/A'}`);
        }
        
        console.log('');
      } catch (error) {
        console.log(`❌ Export failed: ${error}\n`);
      }
    }

    // Platform-specific exports
    console.log('🏆 Platform-Specific Exports:\n');
    
    const platforms = ['trainingpeaks', 'strava', 'garmin'];
    
    for (const platform of platforms) {
      console.log(`📱 ${platform.toUpperCase()} format:`);
      console.log(`   Optimized for: ${this.getPlatformOptimizations(platform)}`);
      console.log(`   Special features: ${this.getPlatformFeatures(platform)}`);
      console.log('');
    }
  }

  /**
   * Create demo scenarios for different athlete types
   */
  private createDemoScenarios(): DemoScenario[] {
    return [
      {
        name: 'First-Time Marathoner',
        description: 'New to marathon distance, wants safe progression',
        athlete: {
          level: 'intermediate',
          goals: ['Complete first marathon', 'Stay injury-free'],
          constraints: ['Limited time (4-5 days/week)', 'No track access'],
          preferences: { conservative: true, safeProgression: true }
        },
        config: {
          name: 'First Marathon Plan',
          goal: 'MARATHON',
          startDate: new Date(),
          targetDate: new Date(Date.now() + 20 * 7 * 24 * 60 * 60 * 1000),
          currentFitness: {
            vdot: 42,
            weeklyMileage: 35,
            longestRecentRun: 16,
            trainingAge: 2,
            overallScore: 58 // VDOT: 52.5 + Volume: 35 + Experience: 40 + Recovery: 75 * weights = 58
          },
          preferences: {
            availableDays: [1, 2, 3, 4, 6],
            preferredIntensity: 'low',
            crossTraining: true,
            strengthTraining: false
          }
        }
      },
      {
        name: 'Competitive Age Grouper',
        description: 'Experienced runner targeting marathon PR',
        athlete: {
          level: 'advanced',
          goals: ['Marathon PR (sub 3:00)', 'Qualify for Boston'],
          constraints: ['High training volume OK', 'Injury history'],
          preferences: { aggressive: true, dataFocused: true }
        },
        config: {
          name: 'Marathon PR Plan',
          goal: 'MARATHON',
          startDate: new Date(),
          targetDate: new Date(Date.now() + 18 * 7 * 24 * 60 * 60 * 1000),
          currentFitness: {
            vdot: 58,
            weeklyMileage: 70,
            longestRecentRun: 32,
            trainingAge: 8,
            overallScore: 83 // VDOT: 72.5 + Volume: 70 + Experience: 100 + Recovery: 75 * weights = 83
          },
          preferences: {
            availableDays: [1, 2, 3, 4, 5, 6, 0],
            preferredIntensity: 'high',
            crossTraining: false,
            strengthTraining: true
          }
        }
      },
      {
        name: 'Busy Professional',
        description: 'Time-constrained runner seeking efficiency',
        athlete: {
          level: 'intermediate',
          goals: ['Half marathon improvement', 'Maintain fitness'],
          constraints: ['Limited time (3-4 days/week)', 'Travel frequently'],
          preferences: { efficient: true, flexible: true }
        },
        config: {
          name: 'Efficient Half Marathon Plan',
          goal: 'HALF_MARATHON',
          startDate: new Date(),
          targetDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
          currentFitness: {
            vdot: 48,
            weeklyMileage: 40,
            longestRecentRun: 18,
            trainingAge: 4,
            overallScore: 67 // VDOT: 60 + Volume: 40 + Experience: 80 + Recovery: 75 * weights = 67
          },
          preferences: {
            availableDays: [1, 3, 5, 6],
            preferredIntensity: 'moderate',
            crossTraining: true,
            strengthTraining: false,
            timeConstraints: {
              1: 60, 3: 45, 5: 60, 6: 120
            }
          }
        }
      }
    ];
  }

  // Helper methods for generating demo content
  private async getMethodologyRecommendations(scenario: DemoScenario) {
    // Simulate recommendation engine logic
    const recommendations = [
      {
        methodology: 'lydiard' as TrainingMethodology,
        score: 92,
        strengths: ['Safe progression', 'High aerobic base', 'Lower injury risk'],
        considerations: ['Requires patience', 'Longer training cycles'],
        bestFor: 'Marathon distance and conservative progression',
        reason: 'Strong aerobic base ideal for first marathon with low injury risk'
      },
      {
        methodology: 'pfitzinger' as TrainingMethodology,
        score: 85,
        strengths: ['Marathon-specific', 'Systematic progression', 'Proven results'],
        considerations: ['Higher volume', 'More complex structure'],
        bestFor: 'Marathon focus with structured approach',
        reason: 'Marathon-specific training with proven track record'
      },
      {
        methodology: 'daniels' as TrainingMethodology,
        score: 78,
        strengths: ['Scientific precision', 'Data-driven', 'Flexible'],
        considerations: ['Requires monitoring', 'More complex'],
        bestFor: 'Data-focused athletes with monitoring capabilities',
        reason: 'Precise training zones but may be complex for beginners'
      }
    ];

    // Adjust based on scenario
    if (scenario.athlete.level === 'advanced') {
      recommendations[0].score = 95; // Daniels
      recommendations[1].score = 88; // Pfitzinger  
      recommendations[2].score = 82; // Lydiard
      recommendations.sort((a, b) => b.score - a.score);
    }

    return recommendations;
  }

  private analyzeIntensityDistribution(plan: TrainingPlan) {
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

  private analyzeWorkoutFocus(plan: TrainingPlan) {
    const workoutCounts: Record<string, number> = {};
    plan.workouts.forEach(w => {
      workoutCounts[w.type] = (workoutCounts[w.type] || 0) + 1;
    });

    const sorted = Object.entries(workoutCounts).sort((a, b) => b[1] - a[1]);
    
    return {
      primary: sorted[0]?.[0] || 'easy',
      secondary: sorted[1]?.[0] || 'long_run',
      signature: sorted.slice(0, 3).map(([type]) => type)
    };
  }

  private getExpectedAdaptations(methodology: TrainingMethodology, scenario: DemoScenario): string[] {
    const adaptations = {
      daniels: [
        'Improved VO2max through precise interval training',
        'Enhanced lactate threshold via tempo work',
        'Better pacing accuracy and race execution',
        'Increased running economy from varied intensities'
      ],
      lydiard: [
        'Massive aerobic capacity development',
        'Improved fat oxidation and endurance',
        'Enhanced running strength from hill training',
        'Better recovery capacity and durability'
      ],
      pfitzinger: [
        'Optimized lactate threshold for marathon pace',
        'Enhanced aerobic power through medium-long runs',
        'Improved marathon-specific fitness',
        'Better race-pace execution and confidence'
      ]
    };

    return adaptations[methodology];
  }

  private getCustomizationOptions(methodology: TrainingMethodology, scenario: DemoScenario) {
    const options = {
      daniels: [
        {
          name: 'VDOT Adjustment',
          description: 'Fine-tune VDOT based on individual response',
          impact: 'More accurate training paces',
          useCase: 'When workouts feel too easy or too hard'
        },
        {
          name: 'Intensity Distribution',
          description: 'Adjust 80/20 ratio based on goals',
          impact: 'Modified easy/hard balance',
          useCase: 'Time-constrained athletes or injury recovery'
        },
        {
          name: 'Zone Emphasis',
          description: 'Prioritize specific training zones',
          impact: 'Targeted physiological adaptations',
          useCase: 'Distance-specific training focus'
        }
      ],
      lydiard: [
        {
          name: 'Base Phase Duration',
          description: 'Extend or shorten aerobic base period',
          impact: 'Deeper aerobic development',
          useCase: 'Newer runners or time constraints'
        },
        {
          name: 'Hill Training Intensity',
          description: 'Adjust hill workout difficulty',
          impact: 'Strength and power development',
          useCase: 'Based on terrain availability and experience'
        },
        {
          name: 'Volume Progression',
          description: 'Customize weekly mileage increases',
          impact: 'Injury prevention and adaptation',
          useCase: 'Individual recovery capacity'
        }
      ],
      pfitzinger: [
        {
          name: 'LT Volume Progression',
          description: 'Adjust lactate threshold workout volume',
          impact: 'Marathon-specific fitness development',
          useCase: 'Based on LT workout tolerance'
        },
        {
          name: 'Medium-Long Run Structure',
          description: 'Customize MLR tempo segments',
          impact: 'Race-specific preparation',
          useCase: 'Marathon pace confidence and execution'
        },
        {
          name: 'Tune-up Race Integration',
          description: 'Plan and integrate tune-up races',
          impact: 'Fitness assessment and race practice',
          useCase: 'Based on local race calendar'
        }
      ]
    };

    return options[methodology];
  }

  private async demonstrateWorkoutCustomization(philosophy: any, methodology: TrainingMethodology, scenario: DemoScenario) {
    // Create a sample workout and customize it
    const baseWorkout = {
      type: 'threshold',
      estimatedDuration: 60,
      adaptationTarget: 'Lactate threshold development',
      specialFeatures: []
    };

    // Add methodology-specific features
    if (methodology === 'daniels') {
      baseWorkout.specialFeatures.push('VDOT-based pace calculation', 'Precise heart rate zones');
    } else if (methodology === 'lydiard') {
      baseWorkout.specialFeatures.push('Effort-based intensity', 'Conservative progression');
      baseWorkout.type = 'steady_state';
      baseWorkout.adaptationTarget = 'Aerobic power development';
    } else if (methodology === 'pfitzinger') {
      baseWorkout.specialFeatures.push('LT-based pacing', 'Marathon race simulation');
      baseWorkout.estimatedDuration = 75; // Longer threshold sessions
    }

    return baseWorkout;
  }

  private getPlatformOptimizations(platform: string): string {
    const optimizations = {
      trainingpeaks: 'TSS/IF calculations, power-based metrics, PMC tracking',
      strava: 'Social features, segment targeting, activity descriptions',
      garmin: 'Device compatibility, structured workouts, Connect IQ integration'
    };
    
    return optimizations[platform] || 'General optimization';
  }

  private getPlatformFeatures(platform: string): string {
    const features = {
      trainingpeaks: 'Coach sharing, annual training plan, performance management',
      strava: 'Activity sharing, kudos integration, segment challenges',
      garmin: 'Watch workouts, training calendar, recovery metrics'
    };
    
    return features[platform] || 'Standard features';
  }
}

// Export for use in other examples
export { InteractiveMethodologyDemo };

// Run if called directly
if (require.main === module) {
  const demo = new InteractiveMethodologyDemo();
  demo.runInteractiveDemo().catch(console.error);
}