/**
 * Methodology Cache Type Definitions
 *
 * This module provides type-safe caching interfaces for training methodologies,
 * leveraging the existing LRUCache pattern while adding generic type parameters
 * and proper constraints for methodology-specific data.
 *
 * @fileoverview Type definitions for methodology caching system with generic constraints
 */

import { TrainingMethodology } from "../types.js";
import { TrainingPhilosophy } from "../philosophies.js";

/**
 * Generic cache entry interface with typed value and metadata
 * Extends the existing cache entry pattern with proper type constraints
 *
 * @template T The type of the cached value
 * @example
 * ```typescript
 * const entry: MethodologyCacheEntry<TrainingPhilosophy> = {
 *   value: philosophyInstance,
 *   timestamp: Date.now(),
 *   hash: 'methodology-hash',
 *   metadata: {
 *     methodology: 'daniels',
 *     featureLevel: 'advanced',
 *     version: '1.0.0'
 *   }
 * };
 * ```
 */
export interface MethodologyCacheEntry<T> {
  /** The cached value with proper typing */
  value: T;
  /** Timestamp when the entry was created */
  timestamp: number;
  /** Hash string for cache key validation */
  hash: string;
  /** Optional metadata about the cached entry */
  metadata?: {
    /** The methodology this entry represents */
    methodology?: TrainingMethodology;
    /** Feature level of the cached content */
    featureLevel?: FeatureLevel;
    /** Version of the cached data */
    version?: string;
    /** Size of the cached data in bytes */
    size?: number;
    /** Number of times this entry has been accessed */
    accessCount?: number;
    /** Last access timestamp */
    lastAccessed?: number;
  };
}

/**
 * Feature level enumeration for progressive methodology loading
 * Defines different levels of methodology features that can be cached separately
 */
export type FeatureLevel = "basic" | "standard" | "advanced" | "expert";

/**
 * Generic methodology cache interface with type parameters
 * Leverages the existing LRUCache pattern while adding methodology-specific typing
 *
 * @template T The type of values stored in the cache (constrained to TrainingPhilosophy or its subtypes)
 * @example
 * ```typescript
 * const cache: MethodologyCache<DanielsPhilosophy> = new LRUMethodologyCache(100, 600000);
 *
 * cache.set('daniels-advanced', philosophy, 'hash-123', {
 *   methodology: 'daniels',
 *   featureLevel: 'advanced'
 * });
 * ```
 */
export interface MethodologyCache<
  T extends TrainingPhilosophy = TrainingPhilosophy,
> {
  /** Get a cached value by key with proper type safety */
  get(key: string): T | undefined;

  /** Set a cached value with typed constraints */
  set(
    key: string,
    value: T,
    hash: string,
    metadata?: MethodologyCacheEntry<T>["metadata"],
  ): void;

  /** Check if a key exists in the cache */
  has(key: string): boolean;

  /** Delete a specific cache entry */
  delete(key: string): boolean;

  /** Clear all cache entries */
  clear(): void;

  /** Get current cache size */
  size(): number;

  /** Get all cache keys */
  keys(): string[];

  /** Get cache entries matching a filter predicate */
  getEntriesWhere(
    predicate: (entry: MethodologyCacheEntry<T>) => boolean,
  ): MethodologyCacheEntry<T>[];

  /** Get cache statistics */
  getStats(): MethodologyCacheStats;
}

/**
 * Cache statistics interface for monitoring and optimization
 * Provides insights into cache performance and usage patterns
 */
export interface MethodologyCacheStats {
  /** Total number of cached entries */
  totalEntries: number;
  /** Total memory usage in bytes */
  memoryUsage: number;
  /** Cache hit rate (0-1) */
  hitRate: number;
  /** Cache miss rate (0-1) */
  missRate: number;
  /** Average access time in milliseconds */
  avgAccessTime: number;
  /** Most frequently accessed entries */
  topEntries: Array<{
    key: string;
    accessCount: number;
    methodology?: TrainingMethodology;
  }>;
  /** Oldest entries that might be candidates for eviction */
  oldestEntries: Array<{
    key: string;
    age: number;
    lastAccessed: number;
  }>;
}

/**
 * Methodology-specific cache configuration
 * Extends basic cache configuration with methodology-specific options
 */
export interface MethodologyCacheConfig {
  /** Maximum number of entries in the cache */
  maxSize: number;
  /** Maximum age of entries in milliseconds */
  maxAgeMs: number;
  /** Whether to automatically cleanup expired entries */
  autoCleanup: boolean;
  /** Cleanup interval in milliseconds */
  cleanupIntervalMs?: number;
  /** Memory limit in bytes */
  memoryLimitBytes?: number;
  /** Whether to persist cache to disk */
  persistToDisk?: boolean;
  /** Cache persistence file path */
  persistencePath?: string;
}

/**
 * Cache key generator interface for creating type-safe cache keys
 * Provides consistent key generation for different types of methodology data
 *
 * @template T The type being cached
 */
export interface CacheKeyGenerator<T> {
  /** Generate a cache key for the given parameters */
  generateKey(
    methodology?: TrainingMethodology,
    params?: CacheKeyParams,
  ): string;

  /** Generate a hash for the given value */
  generateHash(value: T): string;

  /** Validate a cache key format */
  validateKey(key: string): boolean;

  /** Extract parameters from a cache key */
  parseKey(key: string): CacheKeyParams | null;
}

/**
 * Parameters used for cache key generation
 * Standardizes the parameters used to create cache keys
 */
export interface CacheKeyParams {
  /** The training methodology */
  methodology?: TrainingMethodology;
  /** Feature level for the cached content */
  featureLevel?: FeatureLevel;
  /** Additional identifying parameters */
  params?: Record<string, string | number>;
  /** Version string for cache invalidation */
  version?: string;
  /** Environment-specific identifier */
  environment?: string;
}

/**
 * Cache eviction policy interface for managing cache size and memory
 * Defines strategies for removing entries when cache limits are reached
 */
export interface CacheEvictionPolicy<T> {
  /** Policy name for identification */
  name: "lru" | "lfu" | "ttl" | "size" | "custom";

  /** Determine which entries should be evicted */
  selectForEviction(
    entries: Map<string, MethodologyCacheEntry<T>>,
    config: MethodologyCacheConfig,
  ): string[];

  /** Update entry metadata when accessed */
  onAccess(key: string, entry: MethodologyCacheEntry<T>): void;

  /** Update entry metadata when set */
  onSet(key: string, entry: MethodologyCacheEntry<T>): void;
}

/**
 * Typed cache manager for coordinating multiple methodology caches
 * Provides centralized management of different cache instances
 *
 * @template T The base type constraint for all managed caches
 */
export interface MethodologyCacheManager<
  T extends TrainingPhilosophy = TrainingPhilosophy,
> {
  /** Create a new cache for a specific methodology */
  createCache<K extends T>(
    methodology: TrainingMethodology,
    config?: MethodologyCacheConfig,
  ): MethodologyCache<K>;

  /** Get an existing cache by methodology */
  getCache<K extends T>(
    methodology: TrainingMethodology,
  ): MethodologyCache<K> | undefined;

  /** Check if a cache exists for a methodology */
  hasCache(methodology: TrainingMethodology): boolean;

  /** Remove a cache for a methodology */
  removeCache(methodology: TrainingMethodology): boolean;

  /** Clear all caches */
  clearAllCaches(): void;

  /** Get aggregated statistics across all caches */
  getAggregatedStats(): MethodologyCacheStats;

  /** Get individual cache statistics */
  getCacheStats(
    methodology: TrainingMethodology,
  ): MethodologyCacheStats | undefined;

  /** Optimize all caches (cleanup, defragment, etc.) */
  optimizeAll(): Promise<void>;
}

/**
 * Cache persistence interface for saving/loading cache data
 * Provides type-safe persistence operations for methodology caches
 *
 * @template T The type being persisted
 */
export interface CachePersistence<T> {
  /** Save cache data to persistent storage */
  save(
    cache: Map<string, MethodologyCacheEntry<T>>,
    path: string,
  ): Promise<void>;

  /** Load cache data from persistent storage */
  load(path: string): Promise<Map<string, MethodologyCacheEntry<T>>>;

  /** Check if persistence data exists */
  exists(path: string): Promise<boolean>;

  /** Clear persistence data */
  clear(path: string): Promise<void>;

  /** Get size of persistence data */
  getSize(path: string): Promise<number>;
}

/**
 * Methodology-specific cache implementation constraints
 * Defines type constraints for different methodology cache implementations
 */
export type MethodologyConstraints = {
  /** Daniels methodology cache constraints */
  daniels: TrainingPhilosophy & {
    calculateVDOTPaces: (vdot: number) => Record<string, number>;
    getWorkoutTypes: () => string[];
  };

  /** Lydiard methodology cache constraints */
  lydiard: TrainingPhilosophy & {
    calculateAerobicPaces: (fitness: number) => Record<string, number>;
    getPhaseStructure: () => Record<string, unknown>;
  };

  /** Pfitzinger methodology cache constraints */
  pfitzinger: TrainingPhilosophy & {
    calculateLactatePaces: (threshold: number) => Record<string, number>;
    getTrainingBlocks: () => Record<string, unknown>;
  };

  /** Hudson methodology cache constraints */
  hudson: TrainingPhilosophy & {
    calculateAdaptationZones: (fitness: number) => Record<string, number>;
    getProgressionModel: () => Record<string, unknown>;
  };

  /** Custom methodology with flexible constraints */
  custom: TrainingPhilosophy & Record<string, unknown>;
};

/**
 * Methodology cache factory interface for creating typed cache instances
 * Provides factory methods for creating methodology-specific caches
 */
export interface MethodologyCacheFactory {
  /** Create a cache for a specific methodology with proper typing */
  createMethodologyCache<M extends keyof MethodologyConstraints>(
    methodology: M,
    config?: MethodologyCacheConfig,
  ): MethodologyCache<MethodologyConstraints[M]>;

  /** Create a generic cache with custom type constraints */
  createGenericCache<T extends TrainingPhilosophy>(
    config?: MethodologyCacheConfig,
  ): MethodologyCache<T>;

  /** Get default configuration for a methodology */
  getDefaultConfig(methodology: TrainingMethodology): MethodologyCacheConfig;

  /** Create a cache manager for coordinating multiple caches */
  createCacheManager<
    T extends TrainingPhilosophy,
  >(): MethodologyCacheManager<T>;
}

/**
 * Cache metrics collector interface for performance monitoring
 * Provides comprehensive metrics collection for cache performance analysis
 */
export interface CacheMetricsCollector {
  /** Record a cache hit */
  recordHit(key: string, methodology?: TrainingMethodology): void;

  /** Record a cache miss */
  recordMiss(key: string, methodology?: TrainingMethodology): void;

  /** Record cache access time */
  recordAccessTime(key: string, timeMs: number): void;

  /** Record cache memory usage */
  recordMemoryUsage(bytes: number): void;

  /** Get current metrics */
  getMetrics(): MethodologyCacheStats;

  /** Reset all metrics */
  reset(): void;

  /** Export metrics to external monitoring system */
  export(format: "json" | "csv" | "prometheus"): string;
}

/**
 * Advanced cache operations interface for complex cache management
 * Provides advanced operations beyond basic get/set functionality
 */
export interface AdvancedCacheOperations<T extends TrainingPhilosophy> {
  /** Batch get multiple values */
  getBatch(keys: string[]): Map<string, T>;

  /** Batch set multiple values */
  setBatch(
    entries: Map<
      string,
      {
        value: T;
        hash: string;
        metadata?: MethodologyCacheEntry<T>["metadata"];
      }
    >,
  ): void;

  /** Get entries by methodology type */
  getByMethodology(methodology: TrainingMethodology): Map<string, T>;

  /** Get entries by feature level */
  getByFeatureLevel(level: FeatureLevel): Map<string, T>;

  /** Preload common entries */
  preload(methodology: TrainingMethodology, level: FeatureLevel): Promise<void>;

  /** Invalidate entries matching pattern */
  invalidatePattern(pattern: RegExp): number;

  /** Warm up cache with expected data */
  warmUp(
    predictions: Array<{ key: string; value: T; priority: number }>,
  ): Promise<void>;

  /** Compact cache by removing expired entries */
  compact(): number;

  /** Analyze cache performance and suggest optimizations */
  analyze(): {
    hitRate: number;
    memoryEfficiency: number;
    recommendations: string[];
  };
}

/**
 * Cache synchronization interface for multi-instance cache coordination
 * Provides synchronization capabilities for distributed cache scenarios
 */
export interface CacheSynchronization<T extends TrainingPhilosophy> {
  /** Synchronize with another cache instance */
  syncWith(otherCache: MethodologyCache<T>): Promise<void>;

  /** Broadcast cache changes to other instances */
  broadcast(operation: "set" | "delete" | "clear", key?: string): void;

  /** Subscribe to cache change notifications */
  subscribe(
    callback: (operation: string, key: string, value?: T) => void,
  ): void;

  /** Unsubscribe from cache change notifications */
  unsubscribe(
    callback: (operation: string, key: string, value?: T) => void,
  ): void;

  /** Resolve conflicts between cache instances */
  resolveConflicts(strategy: "latest" | "merge" | "manual"): Promise<void>;
}

/**
 * Type utility for extracting cache value type from methodology type
 * Provides type-level utilities for working with methodology cache types
 */
export type ExtractCacheValueType<T extends MethodologyCache<any>> =
  T extends MethodologyCache<infer U> ? U : never;

/**
 * Type utility for creating methodology-specific cache configurations
 * Ensures type safety when creating caches for specific methodologies
 */
export type MethodologySpecificConfig<M extends keyof MethodologyConstraints> =
  MethodologyCacheConfig & {
    /** Methodology-specific validation rules */
    validationRules?: Array<(value: MethodologyConstraints[M]) => boolean>;
    /** Methodology-specific serialization */
    serializer?: {
      serialize: (value: MethodologyConstraints[M]) => string;
      deserialize: (data: string) => MethodologyConstraints[M];
    };
  };

/**
 * Default implementations and constants for methodology caching
 */
export const DEFAULT_CACHE_CONFIG: MethodologyCacheConfig = {
  maxSize: 100,
  maxAgeMs: 5 * 60 * 1000, // 5 minutes
  autoCleanup: true,
  cleanupIntervalMs: 60 * 1000, // 1 minute
  memoryLimitBytes: 50 * 1024 * 1024, // 50MB
  persistToDisk: false,
};

/**
 * Default cache key prefixes for different methodology types
 */
export const CACHE_KEY_PREFIXES = {
  daniels: "daniels",
  lydiard: "lydiard",
  pfitzinger: "pfitz",
  hudson: "hudson",
  custom: "custom",
} as const;

/**
 * Cache performance thresholds for monitoring and alerting
 */
export const CACHE_PERFORMANCE_THRESHOLDS = {
  /** Minimum acceptable hit rate */
  MIN_HIT_RATE: 0.8,
  /** Maximum acceptable access time in milliseconds */
  MAX_ACCESS_TIME: 10,
  /** Maximum acceptable memory usage percentage */
  MAX_MEMORY_USAGE: 0.8,
  /** Minimum entries before cache is considered effective */
  MIN_EFFECTIVE_SIZE: 10,
} as const;
