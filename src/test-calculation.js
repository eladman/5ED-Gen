// Run this with ts-node -r tsconfig-paths/register src/test-calculation.js
const { threeKRunScore } = require('./lib/fitnessUtils');

// Test basic calculation
console.log('3K time 12:00 = score', threeKRunScore(12, 0));
