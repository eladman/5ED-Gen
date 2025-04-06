// Test the 400m run scoring function for females

function fourHundredMeterScoreFemale(minutes, seconds) {
  // Convert to total seconds
  const T = minutes * 60 + seconds;

  // Key times (in seconds)
  const t100 = 60;   // 1:00 => 100
  const t80  = 82;   // 1:22 => 80
  const t60  = 106;  // 1:46 => 60
  const t0   = 150;  // 2:30 => 0

  // Clamp extremes
  if (T <= t100) {
    return 100;
  }
  if (T >= t0) {
    return 0;
  }

  // Segment 1: (60, 82] => 100..80
  if (T <= t80) {
    // slope = (80 - 100) / (82 - 60) ~ -0.90909
    return Math.round(100 - 0.90909 * (T - t100));
  }

  // Segment 2: (82, 106] => 80..60
  if (T <= t60) {
    // slope = (60 - 80) / (106 - 82) = -20/24 = -0.8333
    return Math.round(80 - 0.8333 * (T - t80));
  }

  // Segment 3: (106, 150) => 60..0
  // slope = (0 - 60) / (150 - 106) = -60/44 = -1.363636
  return Math.round(60 - 1.363636 * (T - t60));
}

// Test cases
const testTimes = [
  [0, 55],  // faster than 1:00 => 100
  [1,  0],  // exactly 1:00 => 100
  [1, 22],  // exactly 1:22 => 80
  [1, 46],  // exactly 1:46 => 60
  [2, 30]   // 2:30 => 0
];

for (const [m, s] of testTimes) {
  const sc = fourHundredMeterScoreFemale(m, s);
  console.log(`${m}:${String(s).padStart(2, '0')} => Score = ${sc}`);
}

console.log("\nTesting additional times:");
// Test every 10 seconds from 1:00 to 2:30
for (let totalSeconds = 60; totalSeconds <= 150; totalSeconds += 10) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const score = fourHundredMeterScoreFemale(minutes, seconds);
  console.log(`${minutes}:${String(seconds).padStart(2, '0')} => Score = ${score}`);
} 