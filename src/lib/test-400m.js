// Test the 400m run scoring function for males

function fourHundredMeterScoreMale(minutes, seconds) {
  // 1) Convert to total seconds
  const T = minutes * 60 + seconds;
  
  // 2) Clamp at extremes
  if (T <= 55) {
    return 100; // 0:55 or faster => 100
  }
  if (T >= 120) {
    return 0;   // 2:00 or slower => 0
  }
  
  // -- Segment 1: 55..60 => 100..90 --
  if (T <= 60) {
    // slope = -2 => Score = 100 - 2*(T - 55)
    return Math.round(100 - 2 * (T - 55));
  }
  
  // -- Segment 2: 60..80 => 90..60 --
  if (T <= 80) {
    // slope = -1.5 => Score = 90 - 1.5*(T - 60)
    return Math.round(90 - 1.5 * (T - 60));
  }
  
  // -- Segment 3: 80..120 => 60..0 --
  // slope = -1.5 => Score = 60 - 1.5*(T - 80)
  return Math.round(60 - 1.5 * (T - 80));
}

// Times to test
const timesToTest = [
  [0, 50],  // faster than 0:55 => 100
  [0, 55],  // exactly 0:55 => 100
  [0, 56],  // between 0:55..1:00 => high 90s
  [0, 58],  // 0:58 => 94
  [1, 0],   // 1:00 => 90
  [1, 5],   // 1:05 => 82.5
  [1, 10],  // 1:10 => 75
  [1, 20],  // 1:20 => 60
  [1, 30],  // 1:30 => 45
  [1, 40],  // 1:40 => 30
  [1, 50],  // 1:50 => 15
  [2, 0],   // 2:00 => 0
  [2, 10]   // slower than 2:00 => 0
];

console.log("Testing 400m run scoring for males:");
timesToTest.forEach(([m, s]) => {
  console.log(
    `Time ${m}:${String(s).padStart(2, '0')} => Score = ${fourHundredMeterScoreMale(m, s)}`
  );
});

// Plot the function over the domain of interest
console.log("\nScores at each 5-second interval:");
for (let totalSeconds = 55; totalSeconds <= 120; totalSeconds += 5) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  console.log(
    `Time ${minutes}:${String(seconds).padStart(2, '0')} => Score = ${fourHundredMeterScoreMale(minutes, seconds)}`
  );
} 