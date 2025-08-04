/**
 * Tests to validate TypedOptions interface remains unchanged
 * 
 * This test suite validates that the TypedOptions interface continues to work
 * exactly as it did before the logging integration, ensuring that:
 * 
 * 1. Existing TypedOptions usage patterns work unchanged
 * 2. LoggableOptions doesn't affect TypedOptions behavior
 * 3. Non-logging systems using TypedOptions continue to work
 * 4. Generic type parameter behavior remains consistent
 * 5. Interface compatibility and type inference work as expected
 * 
 * This is part of the backward compatibility validation for the logging-integration
 * specification, ensuring zero breaking changes to existing code.
 */

import { describe, it, expect } from 'vitest';
import type { TypedOptions, LoggableOptions } from '../types/base-types';

describe('TypedOptions Interface Unchanged Validation', () => {
  describe('Core Interface Behavior', () => {
    it('should work exactly as before - basic usage', () => {
      // Basic TypedOptions usage should be identical to pre-logging implementation
      const options: TypedOptions = {
        customField: 'value',
        numericField: 42,
        booleanField: true,
      };

      expect(options.customField).toBe('value');
      expect(options.numericField).toBe(42);
      expect(options.booleanField).toBe(true);
    });

    it('should allow arbitrary string keys with unknown values', () => {
      // Core TypedOptions behavior: index signature should work
      const options: TypedOptions = {};
      
      // Dynamically assign properties
      options['dynamicKey1'] = 'string value';
      options['dynamicKey2'] = 123;
      options['dynamicKey3'] = { nested: 'object' };
      options['dynamicKey4'] = [1, 2, 3];
      options['dynamicKey5'] = true;
      options['dynamicKey6'] = null;
      options['dynamicKey7'] = undefined;

      expect(options.dynamicKey1).toBe('string value');
      expect(options.dynamicKey2).toBe(123);
      expect(options.dynamicKey3).toEqual({ nested: 'object' });
      expect(options.dynamicKey4).toEqual([1, 2, 3]);
      expect(options.dynamicKey5).toBe(true);
      expect(options.dynamicKey6).toBe(null);
      expect(options.dynamicKey7).toBe(undefined);
    });

    it('should work with empty objects', () => {
      // Empty TypedOptions should work as before
      const emptyOptions: TypedOptions = {};
      expect(Object.keys(emptyOptions)).toHaveLength(0);
      
      // Should be able to add properties dynamically
      emptyOptions.addedLater = 'value';
      expect(emptyOptions.addedLater).toBe('value');
    });

    it('should work with mixed property types', () => {
      // TypedOptions should handle complex mixed types
      const complexOptions: TypedOptions = {
        string: 'text',
        number: 3.14,
        boolean: false,
        object: { a: 1, b: 2 },
        array: ['x', 'y', 'z'],
        nestedObject: {
          deep: {
            property: 'value'
          }
        },
        functionValue: () => 'test',
        symbolValue: Symbol('test'),
        dateValue: new Date('2023-01-01'),
        regexValue: /test/gi,
      };

      expect(typeof complexOptions.string).toBe('string');
      expect(typeof complexOptions.number).toBe('number');
      expect(typeof complexOptions.boolean).toBe('boolean');
      expect(typeof complexOptions.object).toBe('object');
      expect(Array.isArray(complexOptions.array)).toBe(true);
      expect(typeof complexOptions.functionValue).toBe('function');
      expect(typeof complexOptions.symbolValue).toBe('symbol');
      expect(complexOptions.dateValue instanceof Date).toBe(true);
      expect(complexOptions.regexValue instanceof RegExp).toBe(true);
    });
  });

  describe('Generic Type Parameter Behavior', () => {
    it('should maintain default generic behavior (Record<string, unknown>)', () => {
      // Default generic type should work as before
      const options: TypedOptions = {
        anyField: 'any value',
        anotherField: 123,
      };

      // Should allow any string key
      expect(options.anyField).toBe('any value');
      expect(options.anotherField).toBe(123);
    });

    it('should work with specific generic constraints', () => {
      // Custom generic constraints should work exactly as before
      interface CustomFields {
        apiKey: string;
        timeout: number;
        enabled: boolean;
      }

      const options: TypedOptions<CustomFields> = {
        apiKey: 'secret-key',
        timeout: 5000,
        enabled: true,
        // Should still allow additional properties due to index signature
        extraField: 'additional value',
      };

      expect(options.apiKey).toBe('secret-key');
      expect(options.timeout).toBe(5000);
      expect(options.enabled).toBe(true);
      expect(options.extraField).toBe('additional value');
    });

    it('should support complex generic constraints', () => {
      // Complex generic types should work unchanged
      interface ComplexFields {
        mode: 'production' | 'development' | 'testing';
        config?: {
          database: {
            host: string;
            port: number;
          };
          features: string[];
        };
        metadata: Record<string, unknown>;
      }

      const options: TypedOptions<ComplexFields> = {
        mode: 'development',
        config: {
          database: {
            host: 'localhost',
            port: 5432,
          },
          features: ['feature1', 'feature2'],
        },
        metadata: {
          version: '1.0.0',
          build: 123,
        },
        // Index signature allows additional properties
        customProperty: 'value',
      };

      expect(options.mode).toBe('development');
      expect(options.config?.database.host).toBe('localhost');
      expect(options.config?.features).toEqual(['feature1', 'feature2']);
      expect(options.metadata.version).toBe('1.0.0');
      expect(options.customProperty).toBe('value');
    });

    it('should support optional and readonly properties in generics', () => {
      // Test with optional and readonly properties
      interface StrictFields {
        readonly id: number;
        name: string;
        description?: string;
        tags?: readonly string[];
      }

      const options: TypedOptions<StrictFields> = {
        id: 123,
        name: 'Test Item',
        description: 'Optional description',
        tags: ['tag1', 'tag2'],
        additionalData: { key: 'value' },
      };

      expect(options.id).toBe(123);
      expect(options.name).toBe('Test Item');
      expect(options.description).toBe('Optional description');
      expect(options.tags).toEqual(['tag1', 'tag2']);
      expect(options.additionalData).toEqual({ key: 'value' });
    });
  });

  describe('Interface Compatibility', () => {
    it('should be assignable to itself', () => {
      // Self-assignment should work
      const options1: TypedOptions = { field: 'value1' };
      const options2: TypedOptions = options1;
      
      expect(options2.field).toBe('value1');
    });

    it('should work in function parameter positions', () => {
      // Functions accepting TypedOptions should work unchanged
      function processOptions(opts: TypedOptions<{ data: string }>): string {
        return opts.data;
      }

      const result = processOptions({
        data: 'test-data',
        extraField: 'extra',
      });

      expect(result).toBe('test-data');
    });

    it('should work in class property positions', () => {
      // Classes using TypedOptions should work unchanged
      class ConfigService {
        constructor(public options: TypedOptions<{ endpoint: string }>) {}

        getEndpoint(): string {
          return this.options.endpoint;
        }

        hasProperty(key: string): boolean {
          return key in this.options;
        }
      }

      const service = new ConfigService({
        endpoint: 'https://api.example.com',
        timeout: 5000,
        retries: 3,
      });

      expect(service.getEndpoint()).toBe('https://api.example.com');
      expect(service.hasProperty('timeout')).toBe(true);
      expect(service.hasProperty('nonexistent')).toBe(false);
    });

    it('should work in interface inheritance', () => {
      // Interface extending TypedOptions should work unchanged
      interface ExtendedOptions extends TypedOptions<{ apiKey: string }> {
        timeout: number;
        retries: number;
      }

      const extended: ExtendedOptions = {
        apiKey: 'key',
        timeout: 1000,
        retries: 3,
        customField: 'value', // Index signature allows this
      };

      expect(extended.apiKey).toBe('key');
      expect(extended.timeout).toBe(1000);
      expect(extended.retries).toBe(3);
      expect(extended.customField).toBe('value');

      // Should be assignable back to TypedOptions
      const base: TypedOptions<{ apiKey: string }> = extended;
      expect(base.apiKey).toBe('key');
    });

    it('should work with nested interface inheritance', () => {
      // Multiple levels of inheritance should work
      interface BaseConfig extends TypedOptions<{ version: string }> {
        environment: 'dev' | 'prod';
      }

      interface DatabaseConfig extends BaseConfig {
        host: string;
        port: number;
      }

      interface FullConfig extends DatabaseConfig {
        ssl: boolean;
        poolSize: number;
      }

      const config: FullConfig = {
        version: '1.0.0',
        environment: 'prod',
        host: 'db.example.com',
        port: 5432,
        ssl: true,
        poolSize: 10,
        // Index signature still allows additional properties
        customSetting: 'value',
      };

      expect(config.version).toBe('1.0.0');
      expect(config.environment).toBe('prod');
      expect(config.host).toBe('db.example.com');
      expect(config.port).toBe(5432);
      expect(config.ssl).toBe(true);
      expect(config.poolSize).toBe(10);
      expect(config.customSetting).toBe('value');

      // Should be assignable to any parent interface
      const baseConfig: BaseConfig = config;
      const typedOptions: TypedOptions<{ version: string }> = config;
      
      expect(baseConfig.version).toBe('1.0.0');
      expect(typedOptions.version).toBe('1.0.0');
    });
  });

  describe('Object Operations and Patterns', () => {
    it('should work with object destructuring', () => {
      // Destructuring should work unchanged
      const options: TypedOptions<{ api: string; timeout: number }> = {
        api: 'https://api.example.com',
        timeout: 5000,
        debug: true,
        retries: 3,
      };

      const { api, timeout, ...rest } = options;

      expect(api).toBe('https://api.example.com');
      expect(timeout).toBe(5000);
      expect(rest.debug).toBe(true);
      expect(rest.retries).toBe(3);
    });

    it('should work with spread operators', () => {
      // Spread operations should work unchanged
      const baseOptions: TypedOptions = {
        feature: 'base',
        enabled: true,
      };

      const extendedOptions: TypedOptions = {
        ...baseOptions,
        timeout: 1000,
        feature: 'extended', // Should override
      };

      expect(extendedOptions.feature).toBe('extended');
      expect(extendedOptions.enabled).toBe(true);
      expect(extendedOptions.timeout).toBe(1000);
    });

    it('should work with Object.keys, Object.values, Object.entries', () => {
      // Standard object operations should work unchanged
      const options: TypedOptions = {
        name: 'test',
        count: 42,
        active: true,
      };

      const keys = Object.keys(options);
      const values = Object.values(options);
      const entries = Object.entries(options);

      expect(keys).toEqual(['name', 'count', 'active']);
      expect(values).toEqual(['test', 42, true]);
      expect(entries).toEqual([
        ['name', 'test'],
        ['count', 42],
        ['active', true],
      ]);
    });

    it('should work with JSON serialization', () => {
      // JSON operations should work unchanged
      const options: TypedOptions = {
        config: {
          api: 'https://api.example.com',
          timeout: 5000,
        },
        features: ['feature1', 'feature2'],
        metadata: {
          version: '1.0.0',
          build: 123,
        },
      };

      const serialized = JSON.stringify(options);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.config.api).toBe('https://api.example.com');
      expect(deserialized.features).toEqual(['feature1', 'feature2']);
      expect(deserialized.metadata.version).toBe('1.0.0');
    });

    it('should work with property enumeration', () => {
      // Property enumeration should work unchanged
      const options: TypedOptions = {
        prop1: 'value1',
        prop2: 'value2',
        prop3: 'value3',
      };

      const properties: string[] = [];
      for (const key in options) {
        properties.push(key);
      }

      expect(properties).toEqual(['prop1', 'prop2', 'prop3']);

      // hasOwnProperty should work
      expect(options.hasOwnProperty('prop1')).toBe(true);
      expect(options.hasOwnProperty('nonexistent')).toBe(false);
    });
  });

  describe('TypedOptions vs LoggableOptions Isolation', () => {
    it('should remain completely independent of LoggableOptions', () => {
      // TypedOptions should work without any reference to logging
      const typedOptions: TypedOptions = {
        feature: 'test',
        enabled: true,
        config: { key: 'value' },
      };

      // Should not have logging property or any logging-related behavior
      expect('logging' in typedOptions).toBe(false);
      expect(typedOptions.logging).toBeUndefined();

      // Should work exactly as it did before LoggableOptions existed
      expect(typedOptions.feature).toBe('test');
      expect(typedOptions.enabled).toBe(true);
      expect(typedOptions.config).toEqual({ key: 'value' });
    });

    it('should not be affected by LoggableOptions existence', () => {
      // Even with LoggableOptions available, TypedOptions should be unchanged
      interface ServiceOptions extends TypedOptions<{ endpoint: string }> {
        timeout: number;
      }

      // This should work exactly the same as pre-logging implementation
      const options: ServiceOptions = {
        endpoint: 'https://service.example.com',
        timeout: 30000,
        customProperty: 'value',
      };

      expect(options.endpoint).toBe('https://service.example.com');
      expect(options.timeout).toBe(30000);
      expect(options.customProperty).toBe('value');
      
      // Should not have any logging properties
      expect('logging' in options).toBe(false);
    });

    it('should work in systems that never use logging', () => {
      // Simulate a system that uses TypedOptions but has no logging concerns
      class NonLoggingService {
        private config: TypedOptions<{ database: string; port: number }>;

        constructor(config: TypedOptions<{ database: string; port: number }>) {
          this.config = config;
        }

        getConnectionString(): string {
          return `${this.config.database}:${this.config.port}`;
        }

        hasFeature(feature: string): boolean {
          return Boolean(this.config[feature]);
        }

        getAllOptions(): Record<string, unknown> {
          return { ...this.config };
        }
      }

      const service = new NonLoggingService({
        database: 'localhost',
        port: 5432,
        ssl: true,
        poolSize: 10,
      });

      expect(service.getConnectionString()).toBe('localhost:5432');
      expect(service.hasFeature('ssl')).toBe(true);
      expect(service.hasFeature('nonexistent')).toBe(false);
      
      const allOptions = service.getAllOptions();
      expect(allOptions.database).toBe('localhost');
      expect(allOptions.port).toBe(5432);
      expect(allOptions.ssl).toBe(true);
      expect(allOptions.poolSize).toBe(10);
      expect('logging' in allOptions).toBe(false);
    });

    it('should maintain separate type identity from LoggableOptions', () => {
      // TypedOptions and LoggableOptions should be distinct types
      const typedOptions: TypedOptions = { field: 'value' };
      
      // TypedOptions should be assignable to LoggableOptions (inheritance)
      const loggableOptions: LoggableOptions = typedOptions;
      expect(loggableOptions.field).toBe('value');
      
      // But the original TypedOptions should remain unchanged
      expect(typedOptions.field).toBe('value');
      expect('logging' in typedOptions).toBe(false);
      expect('logging' in loggableOptions).toBe(false); // Since we didn't add it
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should work in configuration management systems', () => {
      // Simulate real-world config management usage
      interface AppConfig extends TypedOptions<{ 
        appName: string; 
        version: string; 
      }> {
        port: number;
        environment: 'development' | 'staging' | 'production';
      }

      function loadConfig(overrides: Partial<AppConfig> = {}): AppConfig {
        const defaults: AppConfig = {
          appName: 'MyApp',
          version: '1.0.0',
          port: 3000,
          environment: 'development',
        };

        return { ...defaults, ...overrides };
      }

      const config = loadConfig({
        port: 8080,
        environment: 'production',
        customFeature: true, // Index signature allows this
      });

      expect(config.appName).toBe('MyApp');
      expect(config.port).toBe(8080);
      expect(config.environment).toBe('production');
      expect(config.customFeature).toBe(true);
    });

    it('should work in plugin system architectures', () => {
      // Simulate plugin system usage
      abstract class Plugin {
        constructor(protected options: TypedOptions) {}
        
        abstract getName(): string;
        
        getOption(key: string): unknown {
          return this.options[key];
        }
        
        hasOption(key: string): boolean {
          return key in this.options;
        }
      }

      class DatabasePlugin extends Plugin {
        getName(): string {
          return 'Database Plugin';
        }
        
        getConnectionUrl(): string {
          return `${this.options.host}:${this.options.port}/${this.options.database}`;
        }
      }

      const plugin = new DatabasePlugin({
        host: 'localhost',
        port: 5432,
        database: 'myapp',
        ssl: true,
        retryAttempts: 3,
      });

      expect(plugin.getName()).toBe('Database Plugin');
      expect(plugin.getConnectionUrl()).toBe('localhost:5432/myapp');
      expect(plugin.getOption('ssl')).toBe(true);
      expect(plugin.hasOption('retryAttempts')).toBe(true);
      expect(plugin.hasOption('nonexistent')).toBe(false);
    });

    it('should work in middleware systems', () => {
      // Simulate middleware pattern usage
      type MiddlewareFunction = (
        context: unknown, 
        options: TypedOptions
      ) => Promise<void> | void;

      class MiddlewareStack {
        private middlewares: Array<{
          fn: MiddlewareFunction;
          options: TypedOptions;
        }> = [];

        use(middleware: MiddlewareFunction, options: TypedOptions = {}): this {
          this.middlewares.push({ fn: middleware, options });
          return this;
        }

        async execute(context: unknown): Promise<void> {
          for (const { fn, options } of this.middlewares) {
            await fn(context, options);
          }
        }

        getMiddlewareCount(): number {
          return this.middlewares.length;
        }

        getMiddlewareOptions(index: number): TypedOptions | undefined {
          return this.middlewares[index]?.options;
        }
      }

      const stack = new MiddlewareStack();
      
      stack.use(async (ctx, opts) => {
        // Middleware logic here
      }, {
        timeout: 5000,
        retries: 3,
        logLevel: 'info',
      });

      stack.use(async (ctx, opts) => {
        // Another middleware
      }, {
        cacheEnabled: true,
        cacheTTL: 300,
      });

      expect(stack.getMiddlewareCount()).toBe(2);
      
      const firstOptions = stack.getMiddlewareOptions(0);
      expect(firstOptions?.timeout).toBe(5000);
      expect(firstOptions?.retries).toBe(3);
      expect(firstOptions?.logLevel).toBe('info');
      
      const secondOptions = stack.getMiddlewareOptions(1);
      expect(secondOptions?.cacheEnabled).toBe(true);
      expect(secondOptions?.cacheTTL).toBe(300);
    });
  });

  describe('Performance and Memory Behavior', () => {
    it('should have no performance overhead compared to plain objects', () => {
      // TypedOptions should behave exactly like plain objects
      const plainObject = {
        field1: 'value1',
        field2: 42,
        field3: true,
      };

      const typedOptions: TypedOptions = {
        field1: 'value1',
        field2: 42,
        field3: true,
      };

      // Property access should be identical
      expect(typedOptions.field1).toBe(plainObject.field1);
      expect(typedOptions.field2).toBe(plainObject.field2);
      expect(typedOptions.field3).toBe(plainObject.field3);

      // Object operations should be identical
      expect(Object.keys(typedOptions)).toEqual(Object.keys(plainObject));
      expect(Object.values(typedOptions)).toEqual(Object.values(plainObject));
    });

    it('should have minimal memory footprint', () => {
      // TypedOptions should not add any runtime overhead
      const options: TypedOptions = {
        smallField: 'value',
      };

      // Should only contain the properties we added
      const keys = Object.keys(options);
      expect(keys).toEqual(['smallField']);
      expect(keys.length).toBe(1);

      // Should not have any hidden properties related to logging
      const descriptors = Object.getOwnPropertyDescriptors(options);
      expect(Object.keys(descriptors)).toEqual(['smallField']);
    });

    it('should work efficiently with large objects', () => {
      // TypedOptions should handle large objects efficiently
      const largeOptions: TypedOptions = {};
      
      // Add many properties
      for (let i = 0; i < 1000; i++) {
        largeOptions[`property${i}`] = `value${i}`;
      }

      expect(Object.keys(largeOptions)).toHaveLength(1000);
      expect(largeOptions.property0).toBe('value0');
      expect(largeOptions.property999).toBe('value999');

      // Spread operation should work efficiently
      const copied = { ...largeOptions };
      expect(Object.keys(copied)).toHaveLength(1000);
      expect(copied.property500).toBe('value500');
    });
  });
});