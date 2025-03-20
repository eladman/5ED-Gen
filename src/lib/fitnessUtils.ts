/**
 * Calculates aerobic score based on 3K run time
 * 
 * @param minutes - Minutes portion of the run time
 * @param seconds - Seconds portion of the run time
 * @returns Fitness score (0-100)
 */
export function threeKRunScore(minutes: number, seconds: number): number {
  // Convert total time to decimal minutes
  const T = minutes + seconds / 60.0;
  
  // Define key time boundaries (in decimal minutes)
  const time100 = 9.5;      // 9:30
  const timePass = 14.25;   // 14:15
  const timeZero = 18.0;    // 18:00

  // Slopes for the linear segments:
  // Segment 1 slope (9:30 → 14:15 => 100 → 60)
  const slope1 = (60 - 100) / (timePass - time100);
  // Segment 2 slope (14:15 → 18:00 => 60 → 0)
  const slope2 = (0 - 60) / (timeZero - timePass);

  // Piecewise logic
  if (T <= time100) {
    // 9:30 or faster ⇒ 100
    return 100;
  } else if (T < timePass) {
    // Between 9:30 and 14:15 ⇒ [100..60]
    const score = 100 + slope1 * (T - time100);
    return Math.round(score);
  } else if (T < timeZero) {
    // Between 14:15 and 18:00 ⇒ [60..0]
    const score = 60 + slope2 * (T - timePass);
    return Math.round(score);
  } else {
    // 18:00 or slower ⇒ 0
    return 0;
  }
}

/**
 * Calculates aerobic score based on 3K run time string formatted as "MM:SS"
 * 
 * @param timeString - Run time in format "9:30" or "10:45"
 * @returns Fitness score (0-100)
 */
export function threeKRunScoreFromString(timeString: string): number {
  const [minutes, seconds] = timeString.split(':').map(Number);
  
  if (isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Invalid time format. Please use MM:SS format (e.g., "9:30")');
  }
  
  return threeKRunScore(minutes, seconds);
} 