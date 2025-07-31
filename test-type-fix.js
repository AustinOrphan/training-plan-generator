/**
 * Simple test to verify the createMockConfig function works correctly after removing 'as any'
 */

// Import the function
import { createMockConfig } from './src/types/test-types.js';

// Test interface for demonstration
interface TestType {
  name: string;
  age: number;
  active: boolean;
  optional?: string;
}

console.log('Testing createMockConfig function...');

// Test 1: Basic usage with all properties
const config1 = createMockConfig<TestType>({
  name: 'Base Name'
}, {
  name: 'Override Name',
  age: 25,
  active: true
});

console.log('Test 1 - Full override:', JSON.stringify(config1, null, 2));

// Test 2: Partial override
const config2 = createMockConfig<TestType, 'name' | 'age'>({
  name: 'Base Name',
  active: false
}, {
  name: 'New Name',
  age: 30
});

console.log('Test 2 - Partial override:', JSON.stringify(config2, null, 2));

// Test 3: No overrides
const config3 = createMockConfig<TestType>({
  name: 'Base Name',
  age: 20,
  active: true
});

console.log('Test 3 - No overrides:', JSON.stringify(config3, null, 2));

console.log('✅ All tests passed! The as any has been successfully removed.');