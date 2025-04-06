// Test the female push-ups scoring function

// Import from fitnessUtils (commented out for standalone testing)
// import { pushUpsScoreFemale } from './fitnessUtils.ts';

// Copy of the function for standalone testing
function pushUpsScoreFemale(reps) {
  // 1) Clamp negatives
  if (reps <= 0) {
    return 0;
  }
  // 2) Clamp at 80 or more => 100
  if (reps >= 80) {
    return 100;
  }

  // -- Segment A: 1..9 => slope=4 => score=4*R
  if (reps < 10) {
    return Math.round(4 * reps);
  }

  // -- Segment B: 10..19 => slope=2 => score=40 + 2*(R-10)
  if (reps < 20) {
    const score = 40 + 2 * (reps - 10);
    return Math.round(score);
  }

  // -- Segment C: 20..39 => slope=1 => score=60 + (R-20)
  if (reps < 40) {
    const score = 60 + (reps - 20);
    return Math.round(score);
  }

  // -- Segment D: 40..79 => slope=0.5 => score=80 + 0.5*(R-40)
  // (We've already handled R>=80 above)
  const score = 80 + 0.5 * (reps - 40);
  return Math.round(score);
}

// Test cases
const testReps = [0, 5, 10, 15, 20, 30, 40, 60, 80, 100];

console.log("===== Female Push-Ups Score Testing =====");
for (const r of testReps) {
  console.log(`${r} push-ups => Score = ${pushUpsScoreFemale(r)}`);
}

// Expected output:
// 0 push-ups => Score = 0
// 5 push-ups => Score = 20
// 10 push-ups => Score = 40
// 15 push-ups => Score = 50
// 20 push-ups => Score = 60
// 30 push-ups => Score = 70
// 40 push-ups => Score = 80
// 60 push-ups => Score = 90
// 80 push-ups => Score = 100
// 100 push-ups => Score = 100 