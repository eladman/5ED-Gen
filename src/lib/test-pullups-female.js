// Test the female pull-ups scoring function

// Import from fitnessUtils (commented out for standalone testing)
// import { pullUpsScoreFemale } from './fitnessUtils.ts';

// Copy of the function for standalone testing
function pullUpsScoreFemale(reps) {
  // 1) Handle extremes
  if (reps <= 0) {
    return 0;           // 0 pull-ups => 0 points
  }
  if (reps >= 15) {
    return 100;         // 15 or more => 100 points
  }
  
  // 2) The anchor points
  //  - (0,0)
  //  - (1,55)
  //  - (2,60)
  //  - (10,90)
  //  - (15,100)
  
  // Because reps is an integer, we can jump directly:
  if (reps === 1) {
    return 55;
  }
  if (reps === 2) {
    return 60;
  }
  
  // Segment C: 3..9 => from (2,60) to (10,90)
  if (reps >= 3 && reps < 10) {
    // slope = (90 - 60) / (10 - 2) = 3.75
    // formula => 60 + 3.75 * (R - 2)
    const slopeC = 3.75;
    const score = 60 + slopeC * (reps - 2);
    return Math.round(score);
  }
  
  // Segment D: 10..14 => from (10,90) to (15,100)
  if (reps >= 10 && reps < 15) {
    // slope = (100 - 90) / (15 - 10) = 2
    // formula => 90 + 2*(R - 10)
    const slopeD = 2;
    const score = 90 + slopeD * (reps - 10);
    return Math.round(score);
  }
  
  // Fallback (should never hit if logic is correct):
  return 100; 
}

// Test cases
const testReps = [0, 1, 2, 3, 5, 7, 10, 12, 14, 15, 20];

console.log("===== Female Pull-Ups Score Testing =====");
for (const r of testReps) {
  console.log(`${r} reps => Score = ${pullUpsScoreFemale(r)}`);
}

// Expected output:
// 0 reps => Score = 0
// 1 reps => Score = 55
// 2 reps => Score = 60
// 3 reps => Score = 64
// 5 reps => Score = 71
// 7 reps => Score = 79
// 10 reps => Score = 90
// 12 reps => Score = 94
// 14 reps => Score = 98
// 15 reps => Score = 100
// 20 reps => Score = 100 