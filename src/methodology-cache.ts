/**
 * Methodology-Specific Caching System
 * 
 * Provides high-performance caching for methodology-specific calculations,
 * workout selections, and philosophy comparisons to meet performance requirements.
 */

import { 
  TrainingMethodology, 
  TrainingPlan, 
  PlannedWorkout,
  AdvancedPlanConfig,
  FitnessAssessment,
  TrainingPhase,
  WorkoutType
} from './types';
import { TrainingPhilosophy } from './philosophies';
import { 
  MethodologyComparison, 
  PhilosophyDimension,
  ComparisonMatrix 
} from './philosophy-comparator';
import { WorkoutSelectionResult } from './methodology-workout-selector';
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hash: string;
}

/**
 * Base LRU cache implementation
 */
class LRUCache<T> {
  protected cache = new Map<string, CacheEntry<T>>();
  protected maxSize: number;
  protected maxAge: number;

  constructor(maxSize: number = 100, maxAgeMs: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.maxAge = maxAgeMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }

  set(key: string, value: T, hash: string): void {
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hash
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Cache configuration
const CACHE_CONFIG = {
  paceCalculations: { maxSize: 200, maxAge: 10 * 60 * 1000 }, // 10 minutes
  workoutSelection: { maxSize: 500, maxAge: 30 * 60 * 1000 }, // 30 minutes
  philosophyComparison: { maxSize: 50, maxAge: 60 * 60 * 1000 }, // 1 hour
  methodologyConfig: { maxSize: 100, maxAge: 15 * 60 * 1000 }, // 15 minutes
  planGeneration: { maxSize: 50, maxAge: 5 * 60 * 1000 } // 5 minutes
};

/**
 * Enhanced LRU cache with hit/miss tracking for performance analysis
 */
class MetricsLRUCache<T> extends LRUCache<T> {
  private hits = 0;
  private misses = 0;
  
  constructor(maxSize: number, maxAgeMs: number) {
    super(maxSize, maxAgeMs);
  }
  
  get(key: string): T | undefined {
    const result = super.get(key);
    if (result !== undefined) {
      this.hits++;
    } else {
      this.misses++;
    }
    return result;
  }
  
  getHitRatio(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }
  
  resetMetrics(): void {
    this.hits = 0;
    this.misses = 0;
  }
  
  getMetrics(): { hits: number; misses: number; hitRatio: number } {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.getHitRatio()
    };
  }
}

// Cache instances
const paceCalculationCache = new MetricsLRUCache<Record<string, number>>(
  CACHE_CONFIG.paceCalculations.maxSize,
  CACHE_CONFIG.paceCalculations.maxAge
);

const workoutSelectionCache = new MetricsLRUCache<WorkoutSelectionResult>(
  CACHE_CONFIG.workoutSelection.maxSize,
  CACHE_CONFIG.workoutSelection.maxAge
);

const philosophyComparisonCache = new MetricsLRUCache<MethodologyComparison>(
  CACHE_CONFIG.philosophyComparison.maxSize,
  CACHE_CONFIG.philosophyComparison.maxAge
);

const methodologyConfigCache = new MetricsLRUCache<any>(
  CACHE_CONFIG.methodologyConfig.maxSize,
  CACHE_CONFIG.methodologyConfig.maxAge
);

const planGenerationCache = new MetricsLRUCache<TrainingPlan>(
  CACHE_CONFIG.planGeneration.maxSize,
  CACHE_CONFIG.planGeneration.maxAge
);

/**
 * Generate cache key for methodology pace calculations
 */
function getMethodologyPaceCacheKey(
  methodology: TrainingMethodology,
  vdot: number,
  phase: TrainingPhase,
  weekNumber: number
): string {
  return `pace-${methodology}-${vdot}-${phase}-${weekNumber}`;
}

/**
 * Generate cache key for workout selection
 */
function getWorkoutSelectionCacheKey(
  methodology: TrainingMethodology,
  phase: TrainingPhase,
  weekNumber: number,
  dayOfWeek: number,
  fitness: FitnessAssessment
): string {
  const fitnessHash = `${fitness.vdot || 0}-${fitness.weeklyMileage || 0}`;
  return `workout-${methodology}-${phase}-${weekNumber}-${dayOfWeek}-${fitnessHash}`;
}

/**
 * Generate cache key for philosophy comparison
 */
function getPhilosophyComparisonCacheKey(
  methodology1: TrainingMethodology,
  methodology2: TrainingMethodology,
  dimensions?: PhilosophyDimension[]
): string {
  const sortedMethodologies = [methodology1, methodology2].sort();
  const dimensionKey = dimensions ? dimensions.sort().join('-') : 'all';
  return `compare-${sortedMethodologies[0]}-${sortedMethodologies[1]}-${dimensionKey}`;
}

/**
 * Generate cache key for plan generation
 */
function getPlanGenerationCacheKey(config: AdvancedPlanConfig): string {
  const key = [
    config.methodology,
    config.goal,
    config.targetDate?.getTime() || 0,
    config.startDate.getTime(),
    config.currentFitness?.vdot || 0,
    config.currentFitness?.weeklyMileage || 0,
    config.experience || 'intermediate'
  ].join('-');
  
  // Simple hash to keep key manageable
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `plan-${hash.toString(36)}`;
}

/**
 * Cached methodology pace calculations
 */
export function calculateMethodologyPacesCached(
  methodology: TrainingMethodology,
  vdot: number,
  phase: TrainingPhase,
  weekNumber: number,
  calculator: () => Record<string, number>
): Record<string, number> {
  const cacheKey = getMethodologyPaceCacheKey(methodology, vdot, phase, weekNumber);
  
  const cached = paceCalculationCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  const paces = calculator();
  paceCalculationCache.set(cacheKey, paces, cacheKey);
  
  return paces;
}

/**
 * Cached workout selection
 */
export function selectWorkoutCached(
  methodology: TrainingMethodology,
  phase: TrainingPhase,
  weekNumber: number,
  dayOfWeek: number,
  fitness: FitnessAssessment,
  selector: () => WorkoutSelectionResult
): WorkoutSelectionResult {
  const cacheKey = getWorkoutSelectionCacheKey(methodology, phase, weekNumber, dayOfWeek, fitness);
  
  const cached = workoutSelectionCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  const result = selector();
  workoutSelectionCache.set(cacheKey, result, cacheKey);
  
  return result;
}

/**
 * Cached philosophy comparison
 */
export function comparePhilosophiesCached(
  methodology1: TrainingMethodology,
  methodology2: TrainingMethodology,
  dimensions: PhilosophyDimension[] | undefined,
  comparator: () => MethodologyComparison
): MethodologyComparison {
  const cacheKey = getPhilosophyComparisonCacheKey(methodology1, methodology2, dimensions);
  
  const cached = philosophyComparisonCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  const comparison = comparator();
  philosophyComparisonCache.set(cacheKey, comparison, cacheKey);
  
  return comparison;
}

/**
 * Cached methodology configuration
 */
export function getMethodologyConfigCached<T>(
  methodology: TrainingMethodology,
  configType: string,
  generator: () => T
): T {
  const cacheKey = `config-${methodology}-${configType}`;
  
  const cached = methodologyConfigCache.get(cacheKey);
  if (cached !== undefined) {
    return cached as T;
  }
  
  const config = generator();
  methodologyConfigCache.set(cacheKey, config, cacheKey);
  
  return config;
}

/**
 * Cached plan generation for preview/draft plans
 */
export function generatePlanCached(
  config: AdvancedPlanConfig,
  generator: () => TrainingPlan
): TrainingPlan {
  // Only cache if it's a preview or draft (not final)
  if (config.isDraft !== true) {
    return generator();
  }
  
  const cacheKey = getPlanGenerationCacheKey(config);
  
  const cached = planGenerationCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  const plan = generator();
  planGenerationCache.set(cacheKey, plan, cacheKey);
  
  return plan;
}

/**
 * Batch workout selection with caching
 */
export function batchSelectWorkoutsCached(
  requests: Array<{
    methodology: TrainingMethodology;
    phase: TrainingPhase;
    weekNumber: number;
    dayOfWeek: number;
    fitness: FitnessAssessment;
  }>,
  selector: (request: any) => WorkoutSelectionResult
): WorkoutSelectionResult[] {
  const results: WorkoutSelectionResult[] = [];
  const uncachedIndices: number[] = [];
  const uncachedRequests: Array<{
    methodology: TrainingMethodology;
    phase: TrainingPhase;
    weekNumber: number;
    dayOfWeek: number;
    fitness: FitnessAssessment;
  }> = [];
  
  // Check cache for all requests
  requests.forEach((request, index) => {
    const cacheKey = getWorkoutSelectionCacheKey(
      request.methodology,
      request.phase,
      request.weekNumber,
      request.dayOfWeek,
      request.fitness
    );
    
    const cached = workoutSelectionCache.get(cacheKey);
    if (cached !== undefined) {
      results[index] = cached;
    } else {
      uncachedIndices.push(index);
      uncachedRequests.push(request);
    }
  });
  
  // Process uncached requests
  uncachedRequests.forEach((request, batchIndex) => {
    const actualIndex = uncachedIndices[batchIndex];
    const result = selector(request);
    
    results[actualIndex] = result;
    
    // Cache the result
    const cacheKey = getWorkoutSelectionCacheKey(
      request.methodology,
      request.phase,
      request.weekNumber,
      request.dayOfWeek,
      request.fitness
    );
    workoutSelectionCache.set(cacheKey, result, cacheKey);
  });
  
  return results;
}

/**
 * Cache warming utilities
 */
export class MethodologyCacheWarmer {
  /**
   * Pre-warm pace calculation caches for common scenarios
   */
  static async warmPaceCalculations(
    methodologies: TrainingMethodology[],
    vdotRange: { min: number; max: number; step: number },
    calculator: (methodology: TrainingMethodology, vdot: number) => Record<string, number>
  ): Promise<void> {
    const phases: TrainingPhase[] = ['base', 'build', 'peak', 'taper'];
    
    for (const methodology of methodologies) {
      for (let vdot = vdotRange.min; vdot <= vdotRange.max; vdot += vdotRange.step) {
        for (const phase of phases) {
          // Cache first 4 weeks of each phase
          for (let week = 1; week <= 4; week++) {
            const cacheKey = getMethodologyPaceCacheKey(methodology, vdot, phase, week);
            const cached = paceCalculationCache.get(cacheKey);
            
            if (cached === undefined) {
              const paces = calculator(methodology, vdot);
              paceCalculationCache.set(cacheKey, paces, cacheKey);
            }
          }
        }
      }
    }
  }
  
  /**
   * Pre-warm philosophy comparison cache
   */
  static async warmPhilosophyComparisons(
    comparator: (m1: TrainingMethodology, m2: TrainingMethodology) => MethodologyComparison
  ): Promise<void> {
    const methodologies: TrainingMethodology[] = ['daniels', 'lydiard', 'pfitzinger'];
    
    // Generate all unique pairs
    for (let i = 0; i < methodologies.length; i++) {
      for (let j = i + 1; j < methodologies.length; j++) {
        const cacheKey = getPhilosophyComparisonCacheKey(
          methodologies[i],
          methodologies[j],
          undefined
        );
        
        const cached = philosophyComparisonCache.get(cacheKey);
        if (cached === undefined) {
          const comparison = comparator(methodologies[i], methodologies[j]);
          philosophyComparisonCache.set(cacheKey, comparison, cacheKey);
        }
      }
    }
  }
}

/**
 * Cache management and monitoring
 */
export class MethodologyCacheManager {
  static clearAll(): void {
    paceCalculationCache.clear();
    workoutSelectionCache.clear();
    philosophyComparisonCache.clear();
    methodologyConfigCache.clear();
    planGenerationCache.clear();
  }
  
  static clearMethodologyCache(methodology: TrainingMethodology): void {
    // Would need to iterate through cache keys to selectively clear
    // For now, clear all caches
    this.clearAll();
  }
  
  static getStats(): Record<string, {
    size: number;
    hitRatio: number;
    metrics: { hits: number; misses: number };
  }> {
    return {
      paceCalculations: {
        size: paceCalculationCache.size(),
        hitRatio: paceCalculationCache.getHitRatio(),
        metrics: paceCalculationCache.getMetrics()
      },
      workoutSelection: {
        size: workoutSelectionCache.size(),
        hitRatio: workoutSelectionCache.getHitRatio(),
        metrics: workoutSelectionCache.getMetrics()
      },
      philosophyComparison: {
        size: philosophyComparisonCache.size(),
        hitRatio: philosophyComparisonCache.getHitRatio(),
        metrics: philosophyComparisonCache.getMetrics()
      },
      methodologyConfig: {
        size: methodologyConfigCache.size(),
        hitRatio: methodologyConfigCache.getHitRatio(),
        metrics: methodologyConfigCache.getMetrics()
      },
      planGeneration: {
        size: planGenerationCache.size(),
        hitRatio: planGenerationCache.getHitRatio(),
        metrics: planGenerationCache.getMetrics()
      }
    };
  }
  
  static resetMetrics(): void {
    paceCalculationCache.resetMetrics();
    workoutSelectionCache.resetMetrics();
    philosophyComparisonCache.resetMetrics();
    methodologyConfigCache.resetMetrics();
    planGenerationCache.resetMetrics();
  }
  
  static isPerformanceOptimal(): boolean {
    const stats = this.getStats();
    
    // Check if cache hit ratios are good
    const avgHitRatio = Object.values(stats)
      .reduce((sum, stat) => sum + stat.hitRatio, 0) / Object.keys(stats).length;
    
    return avgHitRatio > 0.7; // 70% hit ratio threshold
  }
  
  static getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getStats();
    
    // Check individual cache performance
    Object.entries(stats).forEach(([cacheName, stat]) => {
      if (stat.hitRatio < 0.5 && stat.metrics.misses > 10) {
        recommendations.push(`Low hit ratio for ${cacheName} cache (${(stat.hitRatio * 100).toFixed(1)}%) - consider increasing cache size`);
      }
      
      if (stat.size === 0 && stat.metrics.misses > 0) {
        recommendations.push(`${cacheName} cache is empty but has misses - check cache warming`);
      }
    });
    
    // Check overall performance
    const avgHitRatio = Object.values(stats)
      .reduce((sum, stat) => sum + stat.hitRatio, 0) / Object.keys(stats).length;
    
    if (avgHitRatio < 0.7) {
      recommendations.push(`Overall cache hit ratio is low (${(avgHitRatio * 100).toFixed(1)}%) - consider cache warming strategy`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Cache performance is optimal');
    }
    
    return recommendations;
  }
}

// Export cache instances for testing
export const methodologyCacheInstances = {
  paceCalculationCache,
  workoutSelectionCache,
  philosophyComparisonCache,
  methodologyConfigCache,
  planGenerationCache
};