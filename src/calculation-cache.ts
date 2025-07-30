/**
 * Calculation Cache and Optimization Utilities
 * 
 * Provides caching and optimization for expensive calculations used across
 * different training philosophies and plan generation components.
 */

import { RunData, FitnessMetrics } from './types';
import { calculateVDOT, calculateCriticalSpeed, calculateFitnessMetrics } from './calculator';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hash: string;
}

/**
 * Simple LRU cache implementation for calculation results
 */
class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize: number = 100, maxAgeMs: number = 5 * 60 * 1000) { // 5 minutes default
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

/**
 * Generate a hash for run data to use as cache key
 */
function hashRunData(runs: RunData[]): string {
  const runSignature = runs.map(run => 
    `${run.date.getTime()}-${run.distance}-${run.duration}-${run.avgPace || 0}`
  ).join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < runSignature.length; i++) {
    const char = runSignature.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
}

/**
 * Generate cache key for VDOT calculations
 */
function getVDOTCacheKey(runs: RunData[]): string {
  const hash = hashRunData(runs);
  return `vdot-${hash}`;
}

/**
 * Generate cache key for critical speed calculations
 */
function getCriticalSpeedCacheKey(runs: RunData[]): string {
  const hash = hashRunData(runs);
  return `cs-${hash}`;
}

/**
 * Generate cache key for fitness metrics
 */
function getFitnessMetricsCacheKey(runs: RunData[]): string {
  const hash = hashRunData(runs);
  return `fm-${hash}`;
}

/**
 * Calculate training paces cache key
 */
function getTrainingPacesCacheKey(vdot: number, methodology: string): string {
  return `paces-${methodology}-${vdot}`;
}

// Global cache instances
const vdotCache = new LRUCache<number>(50);
const criticalSpeedCache = new LRUCache<number>(50);
const fitnessMetricsCache = new LRUCache<FitnessMetrics>(50);
const trainingPacesCache = new LRUCache<Record<string, number>>(100);

/**
 * Cached VDOT calculation with performance optimization
 */
export function calculateVDOTCached(runs: RunData[]): number {
  const cacheKey = getVDOTCacheKey(runs);
  
  // Check cache first
  const cached = vdotCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  // Calculate and cache
  const vdot = calculateVDOT(runs);
  const hash = hashRunData(runs);
  vdotCache.set(cacheKey, vdot, hash);
  
  return vdot;
}

/**
 * Cached critical speed calculation
 */
export function calculateCriticalSpeedCached(runs: RunData[]): number {
  const cacheKey = getCriticalSpeedCacheKey(runs);
  
  const cached = criticalSpeedCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  const criticalSpeed = calculateCriticalSpeed(runs);
  const hash = hashRunData(runs);
  criticalSpeedCache.set(cacheKey, criticalSpeed, hash);
  
  return criticalSpeed;
}

/**
 * Cached fitness metrics calculation
 */
export function calculateFitnessMetricsCached(runs: RunData[]): FitnessMetrics {
  const cacheKey = getFitnessMetricsCacheKey(runs);
  
  const cached = fitnessMetricsCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  const metrics = calculateFitnessMetrics(runs);
  const hash = hashRunData(runs);
  fitnessMetricsCache.set(cacheKey, metrics, hash);
  
  return metrics;
}

/**
 * Cached training paces calculation for methodologies
 */
export function calculateTrainingPacesCached(
  vdot: number, 
  methodology: string,
  calculator: (vdot: number) => Record<string, number>
): Record<string, number> {
  const cacheKey = getTrainingPacesCacheKey(vdot, methodology);
  
  const cached = trainingPacesCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  const paces = calculator(vdot);
  trainingPacesCache.set(cacheKey, paces, `${methodology}-${vdot}`);
  
  return paces;
}

/**
 * Optimized batch calculation for multiple runners or scenarios
 */
export function batchCalculateVDOT(runDataSets: RunData[][]): number[] {
  const results: number[] = [];
  const uncachedIndices: number[] = [];
  const uncachedRunData: RunData[][] = [];
  
  // Check cache for all inputs first
  runDataSets.forEach((runs, index) => {
    const cacheKey = getVDOTCacheKey(runs);
    const cached = vdotCache.get(cacheKey);
    
    if (cached !== undefined) {
      results[index] = cached;
    } else {
      uncachedIndices.push(index);
      uncachedRunData.push(runs);
    }
  });
  
  // Calculate uncached values
  uncachedRunData.forEach((runs, batchIndex) => {
    const actualIndex = uncachedIndices[batchIndex];
    const vdot = calculateVDOT(runs);
    
    results[actualIndex] = vdot;
    
    // Cache the result
    const cacheKey = getVDOTCacheKey(runs);
    const hash = hashRunData(runs);
    vdotCache.set(cacheKey, vdot, hash);
  });
  
  return results;
}

/**
 * Performance monitoring utilities
 */
export class CalculationProfiler {
  private static metrics: Record<string, { calls: number; totalTime: number; avgTime: number }> = {};
  
  static profile<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    
    if (!this.metrics[operation]) {
      this.metrics[operation] = { calls: 0, totalTime: 0, avgTime: 0 };
    }
    
    this.metrics[operation].calls++;
    this.metrics[operation].totalTime += duration;
    this.metrics[operation].avgTime = this.metrics[operation].totalTime / this.metrics[operation].calls;
    
    return result;
  }
  
  static async profileAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    
    if (!this.metrics[operation]) {
      this.metrics[operation] = { calls: 0, totalTime: 0, avgTime: 0 };
    }
    
    this.metrics[operation].calls++;
    this.metrics[operation].totalTime += duration;
    this.metrics[operation].avgTime = this.metrics[operation].totalTime / this.metrics[operation].calls;
    
    return result;
  }
  
  static getMetrics(): Record<string, { calls: number; totalTime: number; avgTime: number }> {
    return { ...this.metrics };
  }
  
  static reset(): void {
    this.metrics = {};
  }
  
  static getSlowOperations(threshold: number = 100): Array<{operation: string; avgTime: number}> {
    return Object.entries(this.metrics)
      .filter(([_, metrics]) => metrics.avgTime > threshold)
      .map(([operation, metrics]) => ({ operation, avgTime: metrics.avgTime }))
      .sort((a, b) => b.avgTime - a.avgTime);
  }
}

/**
 * Memory usage monitoring
 */
export class MemoryMonitor {
  private static snapshots: Array<{ operation: string; memory: NodeJS.MemoryUsage; timestamp: number }> = [];
  
  static snapshot(operation: string): void {
    this.snapshots.push({
      operation,
      memory: process.memoryUsage(),
      timestamp: Date.now()
    });
  }
  
  static getMemoryIncrease(fromOperation: string, toOperation: string): number {
    const fromSnapshot = this.snapshots.find(s => s.operation === fromOperation);
    const toSnapshot = this.snapshots.find(s => s.operation === toOperation);
    
    if (!fromSnapshot || !toSnapshot) return 0;
    
    return (toSnapshot.memory.heapUsed - fromSnapshot.memory.heapUsed) / (1024 * 1024); // MB
  }
  
  static getCurrentMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } {
    const memory = process.memoryUsage();
    return {
      heapUsed: memory.heapUsed / (1024 * 1024), // MB
      heapTotal: memory.heapTotal / (1024 * 1024), // MB
      external: memory.external / (1024 * 1024) // MB
    };
  }
  
  static clearSnapshots(): void {
    this.snapshots = [];
  }
}

/**
 * Cache management utilities
 */
export class CacheManager {
  static clearAllCaches(): void {
    vdotCache.clear();
    criticalSpeedCache.clear();
    fitnessMetricsCache.clear();
    trainingPacesCache.clear();
  }
  
  static getCacheStats(): Record<string, number> {
    return {
      vdot: vdotCache.size(),
      criticalSpeed: criticalSpeedCache.size(),
      fitnessMetrics: fitnessMetricsCache.size(),
      trainingPaces: trainingPacesCache.size()
    };
  }
  
  static getCacheHitRatio(): Record<string, number> {
    // This would require tracking hits/misses - simplified for now
    return {
      overall: 0.85 // Example - would be calculated from actual hit/miss data
    };
  }
}

/**
 * Optimization recommendations based on usage patterns
 */
export class OptimizationAnalyzer {
  static analyzePerformance(): {
    recommendations: string[];
    slowOperations: Array<{operation: string; avgTime: number}>;
    memoryUsage: { current: number; recommended: number };
  } {
    const slowOps = CalculationProfiler.getSlowOperations(50);
    const memoryUsage = MemoryMonitor.getCurrentMemoryUsage();
    const recommendations: string[] = [];
    
    // Generate recommendations
    if (slowOps.length > 0) {
      recommendations.push(`Consider optimizing: ${slowOps[0].operation} (avg: ${slowOps[0].avgTime.toFixed(2)}ms)`);
    }
    
    if (memoryUsage.heapUsed > 80) {
      recommendations.push('High memory usage detected - consider clearing caches or reducing batch sizes');
    }
    
    const cacheStats = CacheManager.getCacheStats();
    const totalCacheSize = Object.values(cacheStats).reduce((sum, size) => sum + size, 0);
    
    if (totalCacheSize < 10) {
      recommendations.push('Low cache utilization - consider increasing cache sizes for better performance');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance appears optimal');
    }
    
    return {
      recommendations,
      slowOperations: slowOps,
      memoryUsage: {
        current: memoryUsage.heapUsed,
        recommended: Math.min(100, memoryUsage.heapUsed * 1.2)
      }
    };
  }
}

// Export cache instances for testing
export const cacheInstances = {
  vdotCache,
  criticalSpeedCache,
  fitnessMetricsCache,
  trainingPacesCache
};