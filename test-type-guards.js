// Quick test to validate our type guard improvements
const { 
  hasIntensityConfig, 
  hasVolumeConfig, 
  hasRecoveryConfig, 
  isTestableGenerator 
} = require('./dist/types/methodology-types.js');

console.log('Testing type guards...');

// Test hasIntensityConfig
const configWithIntensity = { intensity: { easy: 80, hard: 20 } };
const configWithoutIntensity = { volume: { weeklyHours: 10, progressionRate: 0.1 } };
const invalidConfig = null;

console.log('hasIntensityConfig tests:');
console.log('  With intensity:', hasIntensityConfig(configWithIntensity)); // should be true
console.log('  Without intensity:', hasIntensityConfig(configWithoutIntensity)); // should be false
console.log('  Invalid config:', hasIntensityConfig(invalidConfig)); // should be false
console.log('  With null intensity:', hasIntensityConfig({ intensity: null })); // should be false

// Test hasVolumeConfig
const configWithVolume = { volume: { weeklyHours: 10, progressionRate: 0.1 } };
console.log('\nhasVolumeConfig tests:');
console.log('  With volume:', hasVolumeConfig(configWithVolume)); // should be true
console.log('  Without volume:', hasVolumeConfig(configWithIntensity)); // should be false
console.log('  Invalid config:', hasVolumeConfig(invalidConfig)); // should be false

// Test hasRecoveryConfig
const configWithRecovery = { recovery: { emphasis: 0.3, daysPerWeek: 2 } };
console.log('\nhasRecoveryConfig tests:');
console.log('  With recovery:', hasRecoveryConfig(configWithRecovery)); // should be true
console.log('  Without recovery:', hasRecoveryConfig(configWithIntensity)); // should be false
console.log('  Invalid config:', hasRecoveryConfig(invalidConfig)); // should be false

// Test isTestableGenerator
const generatorWithMethod = { generateMicrocycles: () => {} };
const generatorWithoutMethod = { otherMethod: () => {} };
console.log('\nisTestableGenerator tests:');
console.log('  With method:', isTestableGenerator(generatorWithMethod)); // should be true
console.log('  Without method:', isTestableGenerator(generatorWithoutMethod)); // should be false
console.log('  Invalid generator:', isTestableGenerator(invalidConfig)); // should be false

console.log('\nAll type guard tests completed successfully!');