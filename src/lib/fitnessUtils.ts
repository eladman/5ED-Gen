/**
 * Calculates aerobic score based on 3K run time
 * 
 * @param minutes - Minutes portion of the run time
 * @param seconds - Seconds portion of the run time
 * @param gender - Optional user gender ('male' or 'female')
 * @returns Fitness score (0-100)
 */
export function threeKRunScore(minutes: number, seconds: number, gender?: string): number {
  // Use gender-specific calculation if provided
  if (gender === 'female') {
    return threeKRunScoreFemale(minutes, seconds);
  }

  // Default male calculation (original logic)
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
 * Calculates aerobic score for females based on 3K run time
 * 
 * @param minutes - Minutes portion of the run time
 * @param seconds - Seconds portion of the run time
 * @returns Fitness score (0-100)
 */
export function threeKRunScoreFemale(minutes: number, seconds: number): number {
  // Convert total time to decimal minutes
  const T = minutes + (seconds / 60.0);

  // Key times in minutes
  const t100 = 11.5;    // 11:30 => score 100
  const tPass = 17.25;  // 17:15 => score 60
  const tZero = 21.0;   // 21:00 => score 0

  // Slopes for each segment
  // Segment 1: 100 -> 60
  const slope1 = (60 - 100) / (tPass - t100); // -40 / 5.75
  // Segment 2: 60 -> 0
  const slope2 = (0 - 60) / (tZero - tPass);  // -60 / 3.75

  // Piecewise logic
  if (T <= t100) {
    return 100;        // 11:30 or faster
  } else if (T < tPass) {
    // 11:30 < T < 17:15
    return Math.round(100 + slope1 * (T - t100));
  } else if (T < tZero) {
    // 17:15 <= T < 21:00
    return Math.round(60 + slope2 * (T - tPass));
  } else {
    return 0;          // 21:00 or slower
  }
}

/**
 * Calculates aerobic score based on 3K run time string formatted as "MM:SS"
 * 
 * @param timeString - Run time in format "9:30" or "10:45"
 * @param gender - Optional user gender ('male' or 'female')
 * @returns Fitness score (0-100)
 */
export function threeKRunScoreFromString(timeString: string, gender?: string): number {
  const [minutes, seconds] = timeString.split(':').map(Number);
  
  if (isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Invalid time format. Please use MM:SS format (e.g., "9:30")');
  }
  
  if (gender === 'female') {
    return threeKRunScore(minutes, seconds, 'female');
  }
  return threeKRunScore(minutes, seconds);
}

/**
 * Calculates pull-ups score for males with an easier scoring scale
 * with a break at 27 repetitions
 * 
 * @param reps - Number of pull-ups completed
 * @returns Fitness score (0-100)
 */
export function pullUpsScoreMaleEasierBreak27(reps: number): number {
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

/**
 * Calculates push-ups score for males
 * 
 * @param reps - Number of push-ups completed
 * @returns Fitness score (0-100)
 */
export function pushUpsScoreMale(reps: number): number {
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

/**
 * Calculates the strength score which combines pull-ups and push-ups.
 * 50% pull-ups score + 50% push-ups score
 * 
 * @param pullUps - Number of pull-ups completed
 * @param pushUps - Number of push-ups completed
 * @returns Combined strength score (0-100)
 */
export function strengthScoreMale(pullUps: number, pushUps: number): number {
  const pullUpsScore = pullUpsScoreMaleEasierBreak27(pullUps);
  const pushUpsScore = pushUpsScoreMale(pushUps);
  
  // 50% pull-ups + 50% push-ups
  return Math.round((pullUpsScore * 0.5) + (pushUpsScore * 0.5));
}

/**
 * Calculates the strength score from string inputs
 * 
 * @param pullUpsString - Pull-ups count as string
 * @param pushUpsString - Push-ups count as string
 * @returns Combined strength score (0-100)
 */
export function strengthScoreFromString(pullUpsString: string, pushUpsString: string): number {
  const pullUps = parseInt(pullUpsString);
  const pushUps = parseInt(pushUpsString);
  
  if (isNaN(pullUps) || isNaN(pushUps)) {
    throw new Error('Invalid input. Please provide valid numbers for pull-ups and push-ups');
  }
  
  return strengthScoreMale(pullUps, pushUps);
}

/**
 * Calculates the score for 400-meter run for males
 * 
 * @param minutes - Minutes portion of the run time
 * @param seconds - Seconds portion of the run time
 * @returns Fitness score (0-100)
 */
export function fourHundredMeterScoreMale(minutes: number, seconds: number): number {
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

/**
 * Calculates 400-meter run score based on time string formatted as "MM:SS"
 * 
 * @param timeString - Run time in format "0:55" or "1:30"
 * @returns Fitness score (0-100)
 */
export function fourHundredMeterScoreFromString(timeString: string): number {
  const [minutes, seconds] = timeString.split(':').map(Number);
  
  if (isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Invalid time format. Please use MM:SS format (e.g., "0:55")');
  }
  
  return fourHundredMeterScoreMale(minutes, seconds);
} 