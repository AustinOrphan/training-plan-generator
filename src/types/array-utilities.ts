/**
 * Typed Array Utilities for Collection Operations
 * 
 * Provides type-safe array transformation functions and collection utilities
 * that preserve type information while leveraging native TypeScript array methods.
 * These utilities ensure type safety throughout array operations and provide
 * enhanced collection handling capabilities.
 * 
 * @fileoverview Type-safe array and collection utilities
 */

import { TypedCollection, ArrayElement, TypedResult, TypeValidationError } from './base-types';

/**
 * Result type for batch collection operations
 * Provides structured results for operations that process multiple items
 * 
 * @template T The element type in the collection
 * @template E The error type for failed operations
 */
export interface CollectionResult<T, E = Error> {
  /** Successfully processed items */
  successes: T[];
  /** Failed items with their associated errors */
  failures: Array<{ item: unknown; error: E }>;
  /** Summary statistics */
  summary: {
    /** Total number of items processed */
    total: number;
    /** Number of successful operations */
    successCount: number;
    /** Number of failed operations */
    failureCount: number;
    /** Success rate as a percentage (0-100) */
    successRate: number;
  };
}

/**
 * Configuration options for array transformation operations
 * Provides fine-grained control over how array operations are performed
 */
export interface ArrayTransformOptions {
  /** Whether to continue processing after encountering errors */
  continueOnError?: boolean;
  /** Maximum number of concurrent operations (for async operations) */
  maxConcurrency?: number;
  /** Whether to preserve original array order in results */
  preserveOrder?: boolean;
  /** Custom error handler for transformation failures */
  errorHandler?: (error: unknown, item: unknown, index: number) => void;
}

/**
 * Type-safe array wrapper that provides enhanced array operations
 * Preserves type information and adds validation capabilities
 * 
 * @template T The element type
 */
export class TypedArray<T> {
  private readonly _items: T[];
  private readonly _metadata: {
    readonly elementType: string;
    readonly created: Date;
    readonly frozen: boolean;
  };

  constructor(items: T[], elementType: string = 'unknown') {
    this._items = [...items]; // Create defensive copy
    this._metadata = {
      elementType,
      created: new Date(),
      frozen: false
    };
  }

  /**
   * Get the underlying array (defensive copy)
   */
  get items(): readonly T[] {
    return [...this._items];
  }

  /**
   * Get the length of the array
   */
  get length(): number {
    return this._items.length;
  }

  /**
   * Get array metadata
   */
  get metadata() {
    return { ...this._metadata };
  }

  /**
   * Type-safe map operation that preserves element type information
   * 
   * @template U The mapped element type
   * @param fn Transformation function
   * @param targetType Optional type name for the resulting array
   * @returns New TypedArray with transformed elements
   */
  map<U>(fn: (item: T, index: number, array: readonly T[]) => U, targetType?: string): TypedArray<U> {
    const mapped = this._items.map(fn);
    return new TypedArray(mapped, targetType || 'mapped');
  }

  /**
   * Type-safe filter operation that maintains element type
   * 
   * @param predicate Filtering predicate function
   * @returns New TypedArray with filtered elements
   */
  filter(predicate: (item: T, index: number, array: readonly T[]) => boolean): TypedArray<T> {
    const filtered = this._items.filter(predicate);
    return new TypedArray(filtered, this._metadata.elementType);
  }

  /**
   * Type-safe reduce operation with proper type inference
   * 
   * @template U The accumulator type
   * @param fn Reducer function
   * @param initialValue Initial accumulator value
   * @returns Reduced value
   */
  reduce<U>(fn: (acc: U, item: T, index: number, array: readonly T[]) => U, initialValue: U): U {
    return this._items.reduce(fn, initialValue);
  }

  /**
   * Type-safe forEach operation for side effects
   * 
   * @param fn Function to execute for each element
   */
  forEach(fn: (item: T, index: number, array: readonly T[]) => void): void {
    this._items.forEach(fn);
  }

  /**
   * Type-safe find operation
   * 
   * @param predicate Search predicate
   * @returns Found element or undefined
   */
  find(predicate: (item: T, index: number, array: readonly T[]) => boolean): T | undefined {
    return this._items.find(predicate);
  }

  /**
   * Type-safe some operation
   * 
   * @param predicate Test predicate
   * @returns Whether any element matches the predicate
   */
  some(predicate: (item: T, index: number, array: readonly T[]) => boolean): boolean {
    return this._items.some(predicate);
  }

  /**
   * Type-safe every operation
   * 
   * @param predicate Test predicate
   * @returns Whether all elements match the predicate
   */
  every(predicate: (item: T, index: number, array: readonly T[]) => boolean): boolean {
    return this._items.every(predicate);
  }

  /**
   * Safe array access with bounds checking
   * 
   * @param index Array index
   * @returns Element at index or undefined if out of bounds
   */
  at(index: number): T | undefined {
    return index >= 0 && index < this._items.length ? this._items[index] : undefined;
  }

  /**
   * Type-safe slice operation
   * 
   * @param start Start index
   * @param end End index
   * @returns New TypedArray with sliced elements
   */
  slice(start?: number, end?: number): TypedArray<T> {
    const sliced = this._items.slice(start, end);
    return new TypedArray(sliced, this._metadata.elementType);
  }

  /**
   * Convert to plain JavaScript array
   * 
   * @returns Plain array copy
   */
  toArray(): T[] {
    return [...this._items];
  }

  /**
   * Convert to TypedCollection
   * 
   * @returns TypedCollection representation
   */
  toCollection(): TypedCollection<T> {
    return {
      items: [...this._items],
      count: this._items.length,
      metadata: {
        type: this._metadata.elementType,
        indexed: false,
        createdAt: this._metadata.created,
        updatedAt: new Date()
      }
    };
  }

  /**
   * Create a TypedArray from a regular array
   * 
   * @template T The element type
   * @param items Source array
   * @param elementType Type name for metadata
   * @returns New TypedArray instance
   */
  static from<T>(items: T[], elementType?: string): TypedArray<T> {
    return new TypedArray(items, elementType);
  }

  /**
   * Create an empty TypedArray
   * 
   * @template T The element type
   * @param elementType Type name for metadata
   * @returns Empty TypedArray instance
   */
  static empty<T>(elementType?: string): TypedArray<T> {
    return new TypedArray<T>([], elementType);
  }
}

/**
 * Utility functions for type-safe array operations
 * Provides standalone functions that work with regular arrays while preserving type safety
 */
export class ArrayUtils {
  /**
   * Type-safe map with error handling
   * Maps over an array and collects both successes and failures
   * 
   * @template T Input element type
   * @template U Output element type
   * @param items Input array
   * @param fn Transformation function
   * @param options Transformation options
   * @returns CollectionResult with successes and failures
   */
  static safeMap<T, U>(
    items: T[],
    fn: (item: T, index: number) => U,
    options: ArrayTransformOptions = {}
  ): CollectionResult<U, Error> {
    const successes: U[] = [];
    const failures: Array<{ item: T; error: Error }> = [];
    const { continueOnError = true, errorHandler } = options;

    for (let i = 0; i < items.length; i++) {
      try {
        const result = fn(items[i], i);
        successes.push(result);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        failures.push({ item: items[i], error: errorObj });
        
        if (errorHandler) {
          errorHandler(error, items[i], i);
        }

        if (!continueOnError) {
          break;
        }
      }
    }

    const total = items.length;
    const successCount = successes.length;
    const failureCount = failures.length;

    return {
      successes,
      failures,
      summary: {
        total,
        successCount,
        failureCount,
        successRate: total > 0 ? (successCount / total) * 100 : 0
      }
    };
  }

  /**
   * Type-safe filter with error handling
   * Filters an array and tracks any predicate errors
   * 
   * @template T Element type
   * @param items Input array
   * @param predicate Filter predicate
   * @param options Filter options
   * @returns CollectionResult with filtered items and errors
   */
  static safeFilter<T>(
    items: T[],
    predicate: (item: T, index: number) => boolean,
    options: ArrayTransformOptions = {}
  ): CollectionResult<T, Error> {
    const successes: T[] = [];
    const failures: Array<{ item: T; error: Error }> = [];
    const { continueOnError = true, errorHandler } = options;

    for (let i = 0; i < items.length; i++) {
      try {
        if (predicate(items[i], i)) {
          successes.push(items[i]);
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        failures.push({ item: items[i], error: errorObj });
        
        if (errorHandler) {
          errorHandler(error, items[i], i);
        }

        if (!continueOnError) {
          break;
        }
      }
    }

    const total = items.length;
    const successCount = successes.length;
    const failureCount = failures.length;

    return {
      successes,
      failures,
      summary: {
        total,
        successCount,
        failureCount,
        successRate: total > 0 ? (successCount / total) * 100 : 0
      }
    };
  }

  /**
   * Partition an array into chunks of specified size
   * Maintains type safety while chunking arrays
   * 
   * @template T Element type
   * @param items Input array
   * @param chunkSize Size of each chunk
   * @returns Array of chunks
   */
  static chunk<T>(items: T[], chunkSize: number): T[][] {
    if (chunkSize <= 0) {
      throw new TypeValidationError(
        'Chunk size must be positive',
        'positive number',
        chunkSize,
        'array-chunking'
      );
    }

    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Group array elements by a key function
   * Creates a Map with type-safe grouping
   * 
   * @template T Element type
   * @template K Key type
   * @param items Input array
   * @param keyFn Function to extract grouping key
   * @returns Map of grouped elements
   */
  static groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>();
    
    for (const item of items) {
      const key = keyFn(item);
      const existing = groups.get(key);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(key, [item]);
      }
    }
    
    return groups;
  }

  /**
   * Remove duplicate elements from an array
   * Uses a key function for complex deduplication logic
   * 
   * @template T Element type
   * @template K Key type for deduplication
   * @param items Input array
   * @param keyFn Function to extract comparison key
   * @returns Deduplicated array
   */
  static uniqueBy<T, K>(items: T[], keyFn: (item: T) => K): T[] {
    const seen = new Set<K>();
    const unique: T[] = [];
    
    for (const item of items) {
      const key = keyFn(item);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    
    return unique;
  }

  /**
   * Flatten nested arrays while preserving type safety
   * 
   * @template T Element type
   * @param items Array of arrays
   * @returns Flattened array
   */
  static flatten<T>(items: T[][]): T[] {
    return items.flat();
  }

  /**
   * Type-safe array intersection
   * Finds elements that exist in all provided arrays
   * 
   * @template T Element type
   * @param arrays Arrays to intersect
   * @param keyFn Function to extract comparison key
   * @returns Array of intersecting elements
   */
  static intersection<T, K>(arrays: T[][], keyFn: (item: T) => K): T[] {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return [...arrays[0]];

    const [first, ...rest] = arrays;
    const intersection: T[] = [];
    
    for (const item of first) {
      const key = keyFn(item);
      const existsInAll = rest.every(arr => 
        arr.some(otherItem => keyFn(otherItem) === key)
      );
      
      if (existsInAll) {
        intersection.push(item);
      }
    }
    
    return intersection;
  }

  /**
   * Type-safe array union
   * Combines arrays while removing duplicates
   * 
   * @template T Element type
   * @template K Key type for deduplication
   * @param arrays Arrays to unite
   * @param keyFn Function to extract comparison key
   * @returns Union array without duplicates
   */
  static union<T, K>(arrays: T[][], keyFn: (item: T) => K): T[] {
    const combined = arrays.flat();
    return this.uniqueBy(combined, keyFn);
  }

  /**
   * Check if an array is properly typed (not containing any)
   * Runtime validation for array type safety
   * 
   * @param items Array to check
   * @param typeName Expected type name for error messages
   * @returns TypedResult indicating if array is properly typed
   */
  static validateTypedArray<T>(
    items: unknown[],
    typeName: string
  ): TypedResult<T[], TypeValidationError> {
    // Basic array validation
    if (!Array.isArray(items)) {
      return {
        success: false,
        error: new TypeValidationError(
          'Expected array',
          'Array',
          items,
          'array-validation'
        )
      };
    }

    // Check for any types
    const anyIndices = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item === undefined || item === null)
      .map(({ index }) => index);

    if (anyIndices.length > 0) {
      return {
        success: false,
        error: new TypeValidationError(
          `Array contains undefined/null values at indices: ${anyIndices.join(', ')}`,
          typeName,
          items,
          'array-type-validation'
        )
      };
    }

    return { success: true, data: items as T[] };
  }
}

/**
 * Higher-order functions for array transformations
 * Provides functional programming utilities with type safety
 */
export class FunctionalArrayUtils {
  /**
   * Create a type-safe compose function for array transformations
   * 
   * @template T Input type
   * @template U Intermediate type
   * @template V Output type
   * @param fn1 First transformation function
   * @param fn2 Second transformation function
   * @returns Composed transformation function
   */
  static compose<T, U, V>(
    fn1: (items: T[]) => U[],
    fn2: (items: U[]) => V[]
  ): (items: T[]) => V[] {
    return (items: T[]) => fn2(fn1(items));
  }

  /**
   * Create a curried map function
   * 
   * @template T Input element type
   * @template U Output element type
   * @param fn Transformation function
   * @returns Curried map function
   */
  static map<T, U>(fn: (item: T, index: number) => U): (items: T[]) => U[] {
    return (items: T[]) => items.map(fn);
  }

  /**
   * Create a curried filter function
   * 
   * @template T Element type
   * @param predicate Filter predicate
   * @returns Curried filter function
   */
  static filter<T>(predicate: (item: T, index: number) => boolean): (items: T[]) => T[] {
    return (items: T[]) => items.filter(predicate);
  }

  /**
   * Create a pipeline of array transformations
   * 
   * @template T Input type
   * @param transformations Array of transformation functions
   * @returns Single transformation function that applies all transformations
   */
  static pipeline<T>(
    ...transformations: Array<(items: T[]) => T[]>
  ): (items: T[]) => T[] {
    return (items: T[]) => transformations.reduce((acc, fn) => fn(acc), items);
  }
}

/**
 * Type-safe collection builders for common patterns
 * Provides builder patterns for creating typed collections
 */
export class CollectionBuilder<T> {
  private items: T[] = [];
  private readonly elementType: string;

  constructor(elementType: string = 'unknown') {
    this.elementType = elementType;
  }

  /**
   * Add a single item to the collection
   */
  add(item: T): this {
    this.items.push(item);
    return this;
  }

  /**
   * Add multiple items to the collection
   */
  addAll(items: T[]): this {
    this.items.push(...items);
    return this;
  }

  /**
   * Add an item conditionally
   */
  addIf(condition: boolean, item: T): this {
    if (condition) {
      this.items.push(item);
    }
    return this;
  }

  /**
   * Transform and add items
   */
  addMapped<U>(sourceItems: U[], mapFn: (item: U) => T): this {
    const mapped = sourceItems.map(mapFn);
    this.items.push(...mapped);
    return this;
  }

  /**
   * Clear all items
   */
  clear(): this {
    this.items = [];
    return this;
  }

  /**
   * Build the final TypedArray
   */
  build(): TypedArray<T> {
    return new TypedArray([...this.items], this.elementType);
  }

  /**
   * Build as TypedCollection
   */
  buildCollection(): TypedCollection<T> {
    return {
      items: [...this.items],
      count: this.items.length,
      metadata: {
        type: this.elementType,
        indexed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  }

  /**
   * Build as plain array
   */
  buildArray(): T[] {
    return [...this.items];
  }

  /**
   * Create a new builder
   */
  static create<T>(elementType?: string): CollectionBuilder<T> {
    return new CollectionBuilder<T>(elementType);
  }
}

/**
 * Type-safe array assertion utilities
 * Provides runtime type checking for arrays with proper error handling
 */
export class ArrayTypeAssertions {
  /**
   * Assert that an array contains only elements of a specific type
   * 
   * @template T Expected element type
   * @param items Array to validate
   * @param typeGuard Type guard function
   * @param typeName Type name for error messages
   * @returns TypedResult with validated array or error
   */
  static assertElementType<T>(
    items: unknown[],
    typeGuard: (item: unknown) => item is T,
    typeName: string
  ): TypedResult<T[], TypeValidationError> {
    if (!Array.isArray(items)) {
      return {
        success: false,
        error: new TypeValidationError(
          'Expected array',
          'Array',
          items,
          'array-type-assertion'
        )
      };
    }

    const invalidItems: Array<{ index: number; item: unknown }> = [];
    
    for (let i = 0; i < items.length; i++) {
      if (!typeGuard(items[i])) {
        invalidItems.push({ index: i, item: items[i] });
      }
    }

    if (invalidItems.length > 0) {
      const invalidIndices = invalidItems.map(({ index }) => index).join(', ');
      return {
        success: false,
        error: new TypeValidationError(
          `Array contains invalid ${typeName} elements at indices: ${invalidIndices}`,
          `${typeName}[]`,
          items,
          'array-element-type-validation'
        )
      };
    }

    return { success: true, data: items as T[] };
  }

  /**
   * Assert minimum array length
   * 
   * @template T Element type
   * @param items Array to validate
   * @param minLength Minimum required length
   * @returns TypedResult with validated array or error
   */
  static assertMinLength<T>(
    items: T[],
    minLength: number
  ): TypedResult<T[], TypeValidationError> {
    if (items.length < minLength) {
      return {
        success: false,
        error: new TypeValidationError(
          `Array length ${items.length} is less than required minimum ${minLength}`,
          `Array with min length ${minLength}`,
          items,
          'array-length-validation'
        )
      };
    }

    return { success: true, data: items };
  }

  /**
   * Assert maximum array length
   * 
   * @template T Element type
   * @param items Array to validate
   * @param maxLength Maximum allowed length
   * @returns TypedResult with validated array or error
   */
  static assertMaxLength<T>(
    items: T[],
    maxLength: number
  ): TypedResult<T[], TypeValidationError> {
    if (items.length > maxLength) {
      return {
        success: false,
        error: new TypeValidationError(
          `Array length ${items.length} exceeds maximum allowed ${maxLength}`,
          `Array with max length ${maxLength}`,
          items,
          'array-length-validation'
        )
      };
    }

    return { success: true, data: items };
  }
}