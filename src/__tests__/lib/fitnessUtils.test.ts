import { 
  threeKRunScore,
  threeKRunScoreFemale,
  threeKRunScoreFromString,
  pullUpsScoreMaleEasierBreak27,
  pushUpsScoreMale,
  pullUpsScoreFemale,
  pushUpsScoreFemale,
  pullUpsScore,
  pushUpsScore,
  strengthScoreMale,
  strengthScoreFromString,
  fourHundredMeterScoreMale,
  fourHundredMeterScoreFemale,
  fourHundredMeterScoreFromString
} from '@/lib/fitnessUtils';

describe('Fitness Utilities', () => {
  describe('threeKRunScore', () => {
    it('should return 100 for fast male run times', () => {
      expect(threeKRunScore(9, 0)).toBe(100);  // 9:00
      expect(threeKRunScore(9, 30)).toBe(100); // 9:30 exactly
    });

    it('should return scores between 60-100 for intermediate male run times', () => {
      expect(threeKRunScore(12, 0)).toBeGreaterThan(60);
      expect(threeKRunScore(12, 0)).toBeLessThan(100);
    });

    it('should return 60 for 14:15 male run time', () => {
      expect(threeKRunScore(14, 15)).toBe(60);
    });

    it('should return scores between 0-60 for slower male run times', () => {
      expect(threeKRunScore(16, 0)).toBeGreaterThan(0);
      expect(threeKRunScore(16, 0)).toBeLessThan(60);
    });

    it('should return 0 for very slow male run times', () => {
      expect(threeKRunScore(18, 0)).toBe(0);
      expect(threeKRunScore(20, 0)).toBe(0);
    });

    it('should use female calculation when gender is specified', () => {
      // Should match threeKRunScoreFemale results
      expect(threeKRunScore(11, 30, 'female')).toBe(100);
    });
  });

  describe('threeKRunScoreFemale', () => {
    it('should return 100 for fast female run times', () => {
      expect(threeKRunScoreFemale(11, 0)).toBe(100);
      expect(threeKRunScoreFemale(11, 30)).toBe(100);
    });

    it('should return scores between 60-100 for intermediate female run times', () => {
      expect(threeKRunScoreFemale(14, 0)).toBeGreaterThan(60);
      expect(threeKRunScoreFemale(14, 0)).toBeLessThan(100);
    });

    it('should return 60 for 17:15 female run time', () => {
      expect(threeKRunScoreFemale(17, 15)).toBe(60);
    });

    it('should return scores between 0-60 for slower female run times', () => {
      expect(threeKRunScoreFemale(19, 0)).toBeGreaterThan(0);
      expect(threeKRunScoreFemale(19, 0)).toBeLessThan(60);
    });

    it('should return 0 for very slow female run times', () => {
      expect(threeKRunScoreFemale(21, 0)).toBe(0);
      expect(threeKRunScoreFemale(25, 0)).toBe(0);
    });
  });

  describe('threeKRunScoreFromString', () => {
    it('should correctly parse string time and calculate male score', () => {
      expect(threeKRunScoreFromString('9:30')).toBe(100);
      expect(threeKRunScoreFromString('14:15')).toBe(60);
    });

    it('should correctly parse string time and calculate female score', () => {
      expect(threeKRunScoreFromString('11:30', 'female')).toBe(100);
      expect(threeKRunScoreFromString('17:15', 'female')).toBe(60);
    });

    it('should throw error for invalid time format', () => {
      expect(() => threeKRunScoreFromString('invalid')).toThrow();
    });
  });

  describe('pullUpsScoreMaleEasierBreak27', () => {
    it('should return 0 for 0 or fewer pull-ups', () => {
      expect(pullUpsScoreMaleEasierBreak27(0)).toBe(0);
      expect(pullUpsScoreMaleEasierBreak27(-1)).toBe(0);
    });

    it('should return 100 for 40 or more pull-ups', () => {
      expect(pullUpsScoreMaleEasierBreak27(40)).toBe(100);
      expect(pullUpsScoreMaleEasierBreak27(45)).toBe(100);
    });

    it('should return scores between 10-60 for 1-9 pull-ups', () => {
      expect(pullUpsScoreMaleEasierBreak27(1)).toBe(10);
      expect(pullUpsScoreMaleEasierBreak27(9)).toBe(60);
      expect(pullUpsScoreMaleEasierBreak27(5)).toBeGreaterThan(10);
      expect(pullUpsScoreMaleEasierBreak27(5)).toBeLessThan(60);
    });

    it('should return scores between 60-90 for 10-27 pull-ups', () => {
      expect(pullUpsScoreMaleEasierBreak27(10)).toBeGreaterThan(60);
      expect(pullUpsScoreMaleEasierBreak27(10)).toBeLessThan(90);
      expect(pullUpsScoreMaleEasierBreak27(27)).toBe(90);
    });

    it('should return scores between 90-100 for 28-39 pull-ups', () => {
      expect(pullUpsScoreMaleEasierBreak27(28)).toBeGreaterThan(90);
      expect(pullUpsScoreMaleEasierBreak27(28)).toBeLessThan(100);
      expect(pullUpsScoreMaleEasierBreak27(39)).toBeGreaterThan(90);
      expect(pullUpsScoreMaleEasierBreak27(39)).toBeLessThan(100);
    });
  });

  describe('pushUpsScoreMale', () => {
    it('should return 0 for 0 or fewer push-ups', () => {
      expect(pushUpsScoreMale(0)).toBe(0);
      expect(pushUpsScoreMale(-5)).toBe(0);
    });

    it('should return 100 for 120 or more push-ups', () => {
      expect(pushUpsScoreMale(120)).toBe(100);
      expect(pushUpsScoreMale(150)).toBe(100);
    });

    it('should return scores between 0-60 for 1-36 push-ups', () => {
      expect(pushUpsScoreMale(1)).toBeGreaterThan(0);
      expect(pushUpsScoreMale(1)).toBeLessThan(60);
      expect(pushUpsScoreMale(36)).toBeLessThanOrEqual(60);
    });

    it('should return scores between 60-100 for 37-119 push-ups', () => {
      expect(pushUpsScoreMale(37)).toBeGreaterThanOrEqual(60);
      expect(pushUpsScoreMale(37)).toBeLessThan(100);
      expect(pushUpsScoreMale(119)).toBeLessThanOrEqual(100);
    });
  });

  describe('pullUpsScoreFemale', () => {
    it('should return 0 for 0 pull-ups', () => {
      expect(pullUpsScoreFemale(0)).toBe(0);
    });

    it('should return 100 for 15 or more pull-ups', () => {
      expect(pullUpsScoreFemale(15)).toBe(100);
      expect(pullUpsScoreFemale(20)).toBe(100);
    });

    it('should return 55 for 1 pull-up', () => {
      expect(pullUpsScoreFemale(1)).toBe(55);
    });

    it('should return 60 for 2 pull-ups', () => {
      expect(pullUpsScoreFemale(2)).toBe(60);
    });

    it('should return scores between 60-90 for 3-9 pull-ups', () => {
      expect(pullUpsScoreFemale(3)).toBeGreaterThan(60);
      expect(pullUpsScoreFemale(9)).toBeLessThan(90);
    });

    it('should return 90 for 10 pull-ups', () => {
      expect(pullUpsScoreFemale(10)).toBe(90);
    });

    it('should return scores between 90-100 for 11-14 pull-ups', () => {
      expect(pullUpsScoreFemale(11)).toBeGreaterThan(90);
      expect(pullUpsScoreFemale(14)).toBeLessThan(100);
    });
  });

  describe('pushUpsScoreFemale', () => {
    it('should return 0 for 0 or fewer push-ups', () => {
      expect(pushUpsScoreFemale(0)).toBe(0);
      expect(pushUpsScoreFemale(-1)).toBe(0);
    });

    it('should return 100 for 80 or more push-ups', () => {
      expect(pushUpsScoreFemale(80)).toBe(100);
      expect(pushUpsScoreFemale(90)).toBe(100);
    });

    it('should return scores between 0-40 for 1-9 push-ups', () => {
      expect(pushUpsScoreFemale(1)).toBe(4);
      expect(pushUpsScoreFemale(9)).toBe(36);
    });
  });

  describe('pullUpsScore and pushUpsScore', () => {
    it('should call the male version by default', () => {
      expect(pullUpsScore(30)).toEqual(pullUpsScoreMaleEasierBreak27(30));
      expect(pushUpsScore(50)).toEqual(pushUpsScoreMale(50));
    });

    it('should call the female version when gender is female', () => {
      expect(pullUpsScore(5, 'female')).toEqual(pullUpsScoreFemale(5));
      expect(pushUpsScore(30, 'female')).toEqual(pushUpsScoreFemale(30));
    });
  });

  // Additional tests for strengthScoreMale, strengthScoreFromString, 
  // fourHundredMeterScoreMale, fourHundredMeterScoreFemale, and fourHundredMeterScoreFromString
  // would follow the same pattern as above tests
}); 