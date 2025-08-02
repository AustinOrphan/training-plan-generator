import { calculateTrainingPaces } from './src/zones';

const paces = calculateTrainingPaces(50);
console.log('VDOT 50 paces:');
console.log('Easy:', paces.easy);
console.log('Marathon:', paces.marathon);
console.log('Threshold:', paces.threshold);
console.log('Interval:', paces.interval);
console.log('Repetition:', paces.repetition);