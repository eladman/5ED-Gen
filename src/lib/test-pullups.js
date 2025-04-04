// Test the pull-ups scoring function

function pullUpsScoreMaleEasierBreak27(reps) {
  // 1) 0 or fewer => 0 points
  if (reps <= 0) return 0;

  // 2) 40 or more => 100 points
  if (reps >= 40) return 100;

  // -- Segment 1: 1..9 (score: 10..60) --
  if (reps <= 9) {
    // slope = (60 - 10) / (9 - 1) = 6.25
    // formula: 10 + 6.25 * (reps - 1)
    const slope1 = 6.25;
    const score = 10 + slope1 * (reps - 1);
    return Math.round(score);
  }

  // -- Segment 2: 9..27 (score: 60..90) --
  if (reps <= 27) {
    // slope = (90 - 60) / (27 - 9) = 30/18 = 1.6667
    const slope2 = 30 / 18;
    // For R=9 exactly => 60
    const score = 60 + slope2 * (reps - 9);
    return Math.round(score);
  }

  // -- Segment 3: 27..40 (score: 90..100) --
  {
    // slope = (100 - 90) / (40 - 27) = 10/13 ~ 0.76923
    const slope3 = 10 / 13;
    const score = 90 + slope3 * (reps - 27);
    return Math.round(score);
  }
}

// Test cases for pull-ups
const testReps = [0, 1, 9, 10, 20, 27, 28, 35, 40, 45];
console.log("Pull-ups score test cases:");
for (const r of testReps) {
  console.log(`${r} reps => Score = ${pullUpsScoreMaleEasierBreak27(r)}`);
}

// Test the push-ups scoring function
function pushUpsScoreMale(reps) {
  // Clamp negative or zero
  if (reps <= 0) {
    return 0;
  }
  // 120 or more => 100
  if (reps >= 120) {
    return 100;
  }

  // --- Segment 1: 1..36 (strictly less than 37) ---
  if (reps < 37) {
    // slope = 60/37 ~ 1.6216
    // formula => slope * R
    const slope1 = 60 / 37;
    const score = slope1 * reps;
    return Math.round(score);
  }

  // --- Segment 2: 37..119 ---
  // slope = 40/83 ~ 0.4819
  // formula => 60 + slope*(R - 37)
  {
    const slope2 = 40 / 83;
    const score = 60 + slope2 * (reps - 37);
    return Math.round(score);
  }
}

// Test cases for push-ups
const pushUpTests = [-5, 0, 1, 10, 20, 36, 37, 50, 80, 119, 120, 200];
console.log("\nPush-ups score test cases:");
for (const r of pushUpTests) {
  console.log(`${r} reps => Score = ${pushUpsScoreMale(r)}`);
}

function strengthScoreMale(pullUps, pushUps) {
  const pullUpsScore = pullUpsScoreMaleEasierBreak27(pullUps);
  const pushUpsScore = pushUpsScoreMale(pushUps);
  
  // 50% pull-ups + 50% push-ups
  return Math.round((pullUpsScore * 0.5) + (pushUpsScore * 0.5));
}

console.log("\nTesting strength score calculation:");
console.log("Pull-ups: 10, Push-ups: 30");
console.log(`Pull-ups score: ${pullUpsScoreMaleEasierBreak27(10)}`);
console.log(`Push-ups score: ${pushUpsScoreMale(30)}`);
console.log(`Strength score: ${strengthScoreMale(10, 30)}`);

console.log("\nPull-ups: 27, Push-ups: 70");
console.log(`Pull-ups score: ${pullUpsScoreMaleEasierBreak27(27)}`);
console.log(`Push-ups score: ${pushUpsScoreMale(70)}`);
console.log(`Strength score: ${strengthScoreMale(27, 70)}`); 