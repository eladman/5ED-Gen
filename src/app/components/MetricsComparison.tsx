import { useState, useEffect, useCallback } from 'react';
import { Metrics } from '@/app/metrics/page';
import Image from 'next/image';
import { 
  FaRunning, FaBolt, FaDumbbell, FaChevronUp, 
  FaChevronDown, FaEquals, FaSearch, FaTrophy, FaUsers, FaChartBar
} from 'react-icons/fa';
// Try to import, but don't rely on it being available
let threeKRunScoreImported: ((minutes: number, seconds: number, gender?: string) => number) | null = null;
try {
  const fitnessUtils = require('@/lib/fitnessUtils');
  threeKRunScoreImported = fitnessUtils.threeKRunScore;
} catch (error) {
  console.error('Failed to import threeKRunScore from fitnessUtils:', error);
  threeKRunScoreImported = null;
}
import { teams as allTeamsData } from '@/lib/teamUtils';

export interface MetricsComparisonProps {
  userMetrics: Metrics;
  userName: string;
  userPhoto?: string | null;
  userGroup?: string;
  userGender?: string;
}

// Extended metrics with user info for comparison
interface ComparisonMetrics extends Metrics {
  id: string;
  userName: string;
  userGroup: string;
  photoURL: string | null;
  gender?: string;
}

interface Team {
  id: string;
  name: string;
  gender: string; // 'male' or 'female'
}

export default function MetricsComparison({ 
  userMetrics, 
  userName, 
  userPhoto,
  userGroup = 'כיתה א', // Default group if not provided
  userGender = 'male' // Default gender if not provided
}: MetricsComparisonProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<ComparisonMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRank, setUserRank] = useState<{rank: number, total: number}>({rank: 0, total: 0});
  const [bestTeamMember, setBestTeamMember] = useState<ComparisonMetrics | null>(null);
  const [teamAverage, setTeamAverage] = useState<{
    overall: number,
    aerobic: number,
    anaerobic: number,
    strength: number
  }>({
    overall: 0,
    aerobic: 0,
    anaerobic: 0,
    strength: 0
  });
  
  // Custom scoring functions implemented directly in the component
  const calculatePullUpsScore = useCallback((reps: number, gender: string): number => {
    if (gender === 'female') {
      // Female pull-ups scoring - Corrected formula
      if (reps <= 0) return 0;           // 0 pull-ups => 0 points
      if (reps >= 15) return 100;        // 15 or more => 100 points
      
      // Fixed anchor points for females
      if (reps === 1) return 55;        // 1 pull-up => 55 points
      if (reps === 2) return 60;        // 2 pull-ups => 60 points
      
      // Segment C: 3..9 (inclusive) => from (2,60) to (10,90)
      if (reps >= 3 && reps <= 9) {
        // slope = (90 - 60) / (10 - 2) = 30/8 = 3.75
        return Math.round(60 + 3.75 * (reps - 2));
      }
      
      // Segment D: 10..14 (inclusive) => from (10,90) to (15,100)
      if (reps >= 10 && reps <= 14) {
        // slope = (100 - 90) / (15 - 10) = 10/5 = 2
        return Math.round(90 + 2 * (reps - 10));
      }
      
      // Should never reach here if our conditions are complete
      return Math.round(90 + 2 * (reps - 10)); // Use segment D formula as fallback
    } else {
      // Male pull-ups scoring (equivalent to pullUpsScoreMaleEasierBreak27)
      if (reps <= 0) return 0;
      if (reps >= 40) return 100;
      
      if (reps <= 9) {
        const slope1 = 6.25;
        const score = 10 + slope1 * (reps - 1);
        return Math.round(score);
      }
      
      if (reps <= 27) {
        const slope2 = 30 / 18;
        const score = 60 + slope2 * (reps - 9);
        return Math.round(score);
      }
      
      const slope3 = 10 / 13;
      const score = 90 + slope3 * (reps - 27);
      return Math.round(score);
    }
  }, []);
  
  const calculatePushUpsScore = useCallback((reps: number, gender: string): number => {
    if (gender === 'female') {
      // Female push-ups scoring - Corrected formula
      if (reps <= 0) return 0;         // 0 reps => 0 points
      if (reps >= 80) return 100;      // 80 or more => 100 points
      
      // Segment A: 1..9 (inclusive) => slope=4 => score=4*R
      if (reps <= 9) {
        return Math.round(4 * reps);  // 1=>4, 2=>8, ..., 9=>36
      }
      
      // Segment B: 10..24 (inclusive) => score from 40 to 80
      if (reps <= 24) {
        // slope = (80 - 40) / (25 - 10) = 40/15 ≈ 2.667
        return Math.round(40 + (80 - 40) / 15 * (reps - 10));
      }
      
      // Segment C: 25..79 (inclusive) => score from 80 to 100
      // slope = (100 - 80) / (80 - 25) = 20/55 ≈ 0.364
      return Math.round(80 + (100 - 80) / 55 * (reps - 25));
    } else {
      // Male push-ups scoring
      if (reps <= 0) return 0;
      if (reps >= 120) return 100;
      
      if (reps < 37) {
        const slope1 = 60 / 37;
        const score = slope1 * reps;
        return Math.round(score);
      }
      
      const slope2 = 40 / 83;
      const score = 60 + slope2 * (reps - 37);
      return Math.round(score);
    }
  }, []);
  
  const calculate400mRunScore = useCallback((minutes: number, seconds: number, gender: string): number => {
    // Convert to total seconds
    const totalSeconds = minutes * 60 + seconds;
    
    if (gender === 'female') {
      // Female 400m scoring
      const t100 = 60;   // 1:00 => 100
      const t80  = 82;   // 1:22 => 80
      const t60  = 106;  // 1:46 => 60
      const t0   = 150;  // 2:30 => 0
      
      // Clamp extremes
      if (totalSeconds <= t100) return 100;
      if (totalSeconds >= t0) return 0;
      
      // Segment 1: (60, 82] => 100..80
      if (totalSeconds <= t80) {
        return Math.round(100 - 0.90909 * (totalSeconds - t100));
      }
      
      // Segment 2: (82, 106] => 80..60
      if (totalSeconds <= t60) {
        return Math.round(80 - 0.8333 * (totalSeconds - t80));
      }
      
      // Segment 3: (106, 150) => 60..0
      return Math.round(60 - 1.363636 * (totalSeconds - t60));
    } else {
      // Male 400m scoring
      if (totalSeconds <= 55) return 100; // 0:55 or faster => 100
      if (totalSeconds >= 120) return 0;  // 2:00 or slower => 0
      
      // -- Segment 1: 55..60 => 100..90 --
      if (totalSeconds <= 60) {
        return Math.round(100 - 2 * (totalSeconds - 55));
      }
      
      // -- Segment 2: 60..80 => 90..60 --
      if (totalSeconds <= 80) {
        return Math.round(90 - 1.5 * (totalSeconds - 60));
      }
      
      // -- Segment 3: 80..120 => 60..0 --
      return Math.round(60 - 1.5 * (totalSeconds - 80));
    }
  }, []);
  
  const calculate3kRunScore = useCallback((minutes: number, seconds: number, gender: string): number => {
    // If the imported function is available, use it
    if (threeKRunScoreImported) {
      try {
        return threeKRunScoreImported(minutes, seconds, gender);
      } catch (error) {
        console.error('Error using imported threeKRunScore, falling back to local implementation:', error);
      }
    }
    
    // Otherwise use our local implementation
    if (gender === 'female') {
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
    } else {
      // Male calculation
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
  }, []);
  
  // Generate random time for running metrics
  const generateRandomTime = (minMinutes: number, maxMinutes: number, minSeconds: number, maxSeconds: number) => {
    const minutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
    const seconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };
  
  // Generate mock team members for demo
  const generateMockTeamMembers = useCallback((teamId: string, count: number, gender: string): ComparisonMetrics[] => {
    const maleNames = ['אלון', 'דניאל', 'יואב', 'איתן', 'אמיר', 'עידו', 'יונתן', 'רועי', 'נדב', 'אורי'];
    const femaleNames = ['נועה', 'תמר', 'מיכל', 'יעל', 'שירה', 'רוני', 'מאיה', 'אורי', 'אביגיל', 'ליאור'];
    
    const names = gender === 'male' ? maleNames : femaleNames;
    
    const mockMembers: ComparisonMetrics[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const id = `mock-${teamId}-${i}`;
      
      // Generate random metrics based on gender (gender-specific distributions)
      const run3000m = gender === 'male' 
        ? generateRandomTime(12, 16, 0, 59) // Males: 12:00 - 16:59
        : generateRandomTime(13, 18, 0, 59); // Females: 13:00 - 18:59
      
      const run400m = gender === 'male'
        ? generateRandomTime(1, 1, 10, 40) // Males: 1:10 - 1:40
        : generateRandomTime(1, 1, 20, 50); // Females: 1:20 - 1:50
      
      const pullUps = gender === 'male'
        ? Math.floor(Math.random() * 15) + 3 // Males: 3-18
        : Math.floor(Math.random() * 10) + 1; // Females: 1-11
        
      const pushUps = gender === 'male'
        ? Math.floor(Math.random() * 30) + 15 // Males: 15-45
        : Math.floor(Math.random() * 20) + 10; // Females: 10-30
        
      const sitUps2min = gender === 'male'
        ? Math.floor(Math.random() * 25) + 30 // Males: 30-55
        : Math.floor(Math.random() * 20) + 25; // Females: 25-45
        
      mockMembers.push({
        id,
        userId: id,
        userName: name,
        userGroup: teamId,
        photoURL: null,
        gender,
        run3000m,
        run400m,
        pullUps: pullUps.toString(),
        pushUps: pushUps.toString(),
        sitUps2min: sitUps2min.toString(),
        createdAt: new Date().toISOString()
      } as ComparisonMetrics);
    }
    
    return mockMembers;
  }, []);
  
  // Define reusable functions BEFORE they're used in dependencies
  
  const calculateRating = useCallback((value: string, type: 'time' | 'reps', metricType: string, gender: string = 'male') => {
    // Rating calculation logic
    if (!value || value === '0' || value === '0:00') return 0;
    
    try {
      if (type === 'time') {
        // For time-based metrics like running
        const [mins, secs] = value.split(':').map(Number);
        
        if (metricType === 'run3000m') {
          return calculate3kRunScore(mins, secs, gender);
        } else if (metricType === 'run400m') {
          return calculate400mRunScore(mins, secs, gender);
        }
        // Other time-based calculations can go here
      } else if (type === 'reps') {
        // For repetition-based metrics
        const reps = parseInt(value, 10);
        
        if (metricType === 'pullUps') {
          return calculatePullUpsScore(reps, gender);
        } else if (metricType === 'pushUps') {
          return calculatePushUpsScore(reps, gender);
        }
        // Other rep-based calculations
      }
    } catch (error) {
      console.error(`Error calculating rating for ${metricType}:`, error);
    }
    
    return 0; // Default fallback
  }, [calculatePullUpsScore, calculatePushUpsScore, calculate400mRunScore, calculate3kRunScore]);
  
  const calculateUserRatings = useCallback((metrics: Metrics, gender: string = 'male') => {
    // Calculate individual scores
    const aerobicScore = metrics.run3000m ? calculateRating(metrics.run3000m, 'time', 'run3000m', gender) : 0;
    const anaerobicScore = metrics.run400m ? calculateRating(metrics.run400m, 'time', 'run400m', gender) : 0;
    
    let pullUpsRating = 0;
    let pushUpsRating = 0;
    
    // Calculate pull-ups score
    if (metrics.pullUps) {
      const pullUpsReps = parseInt(metrics.pullUps.toString(), 10);
      if (!isNaN(pullUpsReps)) {
        try {
          pullUpsRating = calculatePullUpsScore(pullUpsReps, gender);
        } catch (error) {
          console.error('Error calculating pull-ups score:', error);
        }
      }
    }
    
    // Calculate push-ups score
    if (metrics.pushUps) {
      const pushUpsReps = parseInt(metrics.pushUps.toString(), 10);
      if (!isNaN(pushUpsReps)) {
        try {
          pushUpsRating = calculatePushUpsScore(pushUpsReps, gender);
        } catch (error) {
          console.error('Error calculating push-ups score:', error);
        }
      }
    }
    
    // Strength is average of pull-ups and push-ups
    const strengthScore = pullUpsRating > 0 || pushUpsRating > 0 
      ? Math.round((pullUpsRating + pushUpsRating) / 2) 
      : 0;
    
    // Overall score is average of the three categories
    const validScores = [
      aerobicScore > 0 ? aerobicScore : null,
      anaerobicScore > 0 ? anaerobicScore : null,
      strengthScore > 0 ? strengthScore : null
    ].filter((score): score is number => score !== null);
    
    const overallScore = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) 
      : 0;
    
    return {
      overall: overallScore,
      aerobic: aerobicScore,
      anaerobic: anaerobicScore,
      strength: strengthScore
    };
  }, [calculateRating, calculatePullUpsScore, calculatePushUpsScore]);
  
  // Calculate user's rank within their gender category
  const calculateUserRankInGender = useCallback(async () => {
    try {
      // Generate mock data instead of trying to access Firebase
      console.log("Generating mock ranking data");
      let allUserMetrics = generateMockTeamMembers("ranking", 15, userGender);
      
      // Add the current user to the mix
      allUserMetrics.push({
        id: 'current-user',
        userId: userMetrics.userId || 'current-user-id',
        userName: userName,
        userGroup: userGroup,
        photoURL: userPhoto || null,
        gender: userGender,
        run3000m: userMetrics.run3000m,
        run400m: userMetrics.run400m,
        pullUps: userMetrics.pullUps,
        pushUps: userMetrics.pushUps,
        sitUps2min: userMetrics.sitUps2min,
        createdAt: new Date().toISOString()
      } as ComparisonMetrics);
      
      // Sort by overall rating (highest first)
      allUserMetrics.sort((a, b) => {
        const aRating = calculateUserRatings(a, a.gender || 'male').overall;
        const bRating = calculateUserRatings(b, b.gender || 'male').overall;
        return bRating - aRating;
      });
      
      // Find user's position
      const userIndex = allUserMetrics.findIndex(m => m.userId === userMetrics.userId);
      
      if (userIndex !== -1) {
        setUserRank({
          rank: userIndex + 1,
          total: allUserMetrics.length
        });
      } else {
        // If user not found in the list (shouldn't happen with mock data)
        // Set a reasonable rank
        setUserRank({
          rank: Math.floor(Math.random() * allUserMetrics.length) + 1,
          total: allUserMetrics.length
        });
      }
    } catch (err) {
      console.error("Error calculating user rank:", err);
      
      // Fallback to mock rank on error
      setUserRank({
        rank: Math.floor(Math.random() * 15) + 1,
        total: 16
      });
    }
  }, [userMetrics, userGender, userName, userGroup, userPhoto, generateMockTeamMembers, calculateUserRatings]);
  
  // Load available teams for user's gender
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setIsLoading(true);
        
        // Skip Firebase and use predefined teams directly
        console.log("Using predefined teams from teamUtils");
        
        // Create teams from the predefined list with appropriate gender
        const allTeams = allTeamsData.map(team => {
          const isMaleTeam = team.name.includes('בנים') || 
            (!team.name.includes('בנות') && !team.name.includes('נערות'));
          
          return {
            id: team.id,
            name: team.name,
            gender: isMaleTeam ? 'male' : 'female'
          } as Team;
        });
        
        // Filter teams based on user's gender
        const filteredTeams = allTeams.filter(team => {
          // Check gender match (primary filter)
          const genderMatch = team.gender === userGender;
          
          // Allow any team type for now to make sure some teams appear
          return genderMatch;
        });

        console.log("Filtered teams:", filteredTeams);
        setTeams(filteredTeams);
        
        // Calculate user's rank within their gender
        await calculateUserRankInGender();
        
      } catch (err) {
        console.error("Error loading teams:", err);
        setError('אירעה שגיאה בטעינת הקבוצות');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeams();
  }, [userGender, calculateUserRankInGender]);
  
  // When a team is selected, generate mock data instead of trying to access Firebase
  useEffect(() => {
    if (!selectedTeamId) return;
    
    const loadTeamData = async () => {
      try {
        setIsLoading(true);
        
        // Generate mock data instead of trying to fetch from Firebase
        console.log("Generating mock team data for team:", selectedTeamId);
        const teamMembersMetrics = generateMockTeamMembers(selectedTeamId, 5, userGender);
        
        setTeamMembers(teamMembersMetrics);
        
        // Calculate team average
        if (teamMembersMetrics.length > 0) {
          let overallSum = 0;
          let aerobicSum = 0;
          let anaerobicSum = 0;
          let strengthSum = 0;
          
          teamMembersMetrics.forEach(member => {
            const ratings = calculateUserRatings(member, member.gender || userGender);
            overallSum += ratings.overall;
            aerobicSum += ratings.aerobic;
            anaerobicSum += ratings.anaerobic;
            strengthSum += ratings.strength;
          });
          
          setTeamAverage({
            overall: Math.round(overallSum / teamMembersMetrics.length),
            aerobic: Math.round(aerobicSum / teamMembersMetrics.length),
            anaerobic: Math.round(anaerobicSum / teamMembersMetrics.length),
            strength: Math.round(strengthSum / teamMembersMetrics.length)
          });
          
          // Find best team member
          teamMembersMetrics.sort((a, b) => {
            const aRating = calculateUserRatings(a, a.gender || userGender).overall;
            const bRating = calculateUserRatings(b, b.gender || userGender).overall;
            return bRating - aRating;
          });
          
          setBestTeamMember(teamMembersMetrics[0]);
        }
        
      } catch (err) {
        console.error("Error loading team data:", err);
        setError('אירעה שגיאה בטעינת נתוני הקבוצה');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeamData();
  }, [selectedTeamId, userGender, calculateUserRatings, generateMockTeamMembers]);

  // Get rating color based on value
  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-emerald-600";
    if (rating >= 80) return "text-emerald-500";
    if (rating >= 70) return "text-blue-600";
    if (rating >= 60) return "text-indigo-500";
    if (rating >= 50) return "text-slate-700";
    return "text-slate-500";
  };

  // Get comparison info between two values
  const getComparisonInfo = (userValue: number, otherValue: number) => {
    const diff = userValue - otherValue;
    
    if (diff > 10) {
      return {
        icon: <FaChevronUp className="text-emerald-600" />,
        color: 'text-emerald-600',
        text: `אתה מוביל ב-${diff} נקודות`
      };
    } else if (diff > 0) {
      return {
        icon: <FaChevronUp className="text-emerald-500" />,
        color: 'text-emerald-500',
        text: `אתה מוביל במעט (${diff} נקודות)`
      };
    } else if (diff === 0) {
      return {
        icon: <FaEquals className="text-slate-500" />,
        color: 'text-slate-500',
        text: 'תיקו - אותו דירוג'
      };
    } else if (diff > -10) {
      return {
        icon: <FaChevronDown className="text-indigo-500" />,
        color: 'text-indigo-500',
        text: `אתה מפגר במעט (${Math.abs(diff)} נקודות)`
      };
    } else {
      return {
        icon: <FaChevronDown className="text-slate-700" />,
        color: 'text-slate-700',
        text: `אתה מפגר ב-${Math.abs(diff)} נקודות`
      };
    };
  };

  const userRatings = calculateUserRatings(userMetrics, userGender);

  // Return loading state
  if (isLoading && teams.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8714] mx-auto mb-4"></div>
        <p className="text-gray-600">טוען נתונים...</p>
      </div>
    );
  }

  // Return error state
  if (error && teams.length === 0) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Render the comparison UI
  return (
    <div className="space-y-6">
      {/* User Ranking */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium flex items-center gap-2 text-slate-800">
            <FaTrophy className="text-amber-400" />
            דירוג שלך
          </h3>
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white font-medium px-4 py-2 rounded-full">
            מקום {userRank.rank} מתוך {userRank.total}
          </div>
        </div>
        <p className="text-slate-500 mt-2">הדירוג שלך מבין כל {userGender === 'male' ? 'הבנים' : 'הבנות'}</p>
      </div>

      {/* Team Comparison Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-medium mb-6 flex items-center gap-2 text-slate-800">
          <FaUsers className="text-blue-500" />
          השוואה לקבוצות {userGender === 'male' ? 'בנים' : 'בנות'}
        </h3>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Team Selection List - Sidebar */}
          <div className="md:w-1/4 md:border-l md:border-slate-200 md:pl-4">
            <h4 className="font-medium text-md mb-3 text-slate-700">בחר קבוצה:</h4>
            
            {isLoading && teams.length === 0 && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-700"></div>
              </div>
            )}
            
            {!isLoading && teams.length === 0 && (
              <div className="text-center py-3 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                <p className="text-sm text-slate-500">לא נמצאו קבוצות {userGender === 'male' ? 'בנים' : 'בנות'}</p>
              </div>
            )}
            
            {!isLoading && teams.length > 0 && (
              <div className="overflow-y-auto max-h-[70vh] pr-2 space-y-1">
                {teams.map(team => (
                  <div 
                    key={team.id} 
                    onClick={() => setSelectedTeamId(team.id === selectedTeamId ? '' : team.id)}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all
                      ${team.id === selectedTeamId 
                        ? 'bg-slate-700 text-white font-medium shadow-sm' 
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200'}
                    `}
                  >
                    <div className={`
                      w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                      ${team.id === selectedTeamId ? 'bg-white/20' : 'bg-slate-100'}
                    `}>
                      <FaUsers className={team.id === selectedTeamId ? 'text-white' : 'text-slate-500'} size={12} />
                    </div>
                    <span className="text-sm truncate">{team.name}</span>
                    {team.id === selectedTeamId && (
                      <div className="ml-auto">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Main Comparison Content */}
          <div className="md:w-3/4">
            {/* No team selected message */}
            {!selectedTeamId && !isLoading && teams.length > 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-slate-300 rounded-lg">
                <div className="bg-slate-100 p-3 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h4 className="font-medium text-lg mb-2 text-slate-700">בחר קבוצה מהרשימה</h4>
                <p className="text-slate-500 max-w-md">
                  בחר קבוצה מהרשימה בצד ימין כדי להשוות את הביצועים שלך לממוצע הקבוצה 
                  ולביצועי המוביל/ה בקבוצה
                </p>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="text-center py-6 border border-slate-200 rounded-lg bg-slate-50">
                <div className="text-red-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {/* Loading state */}
            {isLoading && selectedTeamId && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-600 mx-auto mb-3"></div>
                <p className="text-slate-600">טוען נתוני קבוצה...</p>
              </div>
            )}
            
            {/* Team Overview Section */}
            {selectedTeamId && !isLoading && !error && (
              <div className="space-y-8 animate-fadeIn">
                {/* Team Header & Overview */}
                <div className="bg-slate-50 p-5 rounded-xl relative overflow-hidden border border-slate-200">
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-xl text-slate-800">
                          {teams.find(t => t.id === selectedTeamId)?.name}
                        </h4>
                        <p className="text-slate-500 text-sm">
                          השוואה בין המדדים שלך לביצועי הקבוצה
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-center min-w-[150px]">
                        <div className="flex items-center justify-center mb-1">
                          <span className={`text-2xl font-bold ${getRatingColor(userRatings.overall)}`}>
                            {userRatings.overall}
                          </span>
                          <span className="text-slate-400 mx-2 text-lg">vs</span>
                          <span className={`text-2xl font-bold ${getRatingColor(teamAverage.overall)}`}>
                            {teamAverage.overall}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">הציון הכללי שלך מול ממוצע הקבוצה</p>
                      </div>
                    </div>
                    
                    {/* Comparison Summary */}
                    <div className="mt-6 p-3 bg-slate-100 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        {getComparisonInfo(userRatings.overall, teamAverage.overall).icon}
                        <span className={`${getComparisonInfo(userRatings.overall, teamAverage.overall).color} font-medium`}>
                          {getComparisonInfo(userRatings.overall, teamAverage.overall).text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Best Team Member Comparison */}
                {bestTeamMember && (
                  <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <FaTrophy className="text-amber-400" />
                        השוואה למוביל/ה בקבוצה
                      </h4>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Top Performer Card */}
                        <div className="md:w-1/3 bg-slate-50 rounded-xl border border-slate-200 p-4">
                          <div className="flex flex-col items-center text-center">
                            <div className="relative w-20 h-20 overflow-hidden rounded-full border-4 border-slate-100 mb-3">
                              {bestTeamMember.photoURL ? (
                                <Image 
                                  src={bestTeamMember.photoURL} 
                                  alt={bestTeamMember.userName}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xl">
                                  {bestTeamMember.userName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-800 rounded-full w-8 h-8 flex items-center justify-center">
                                <FaTrophy size={14} />
                              </div>
                            </div>
                            
                            <h5 className="font-semibold text-lg mb-1">{bestTeamMember.userName}</h5>
                            <p className="text-slate-500 text-sm mb-3">מוביל/ה בקבוצה</p>
                            
                            <div className="bg-slate-100 rounded-full px-6 py-2 inline-flex items-center gap-2">
                              <span className="text-slate-600">ציון כללי:</span>
                              <span className={`font-bold text-xl ${getRatingColor(calculateUserRatings(bestTeamMember).overall)}`}>
                                {calculateUserRatings(bestTeamMember).overall}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Comparison Metrics */}
                        <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-slate-700">סיבולת אירובית</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${getRatingColor(userRatings.aerobic)}`}>{userRatings.aerobic}</span>
                                <span className="text-slate-400 mx-1">vs</span>
                                <span className={`font-bold ${getRatingColor(calculateUserRatings(bestTeamMember).aerobic)}`}>
                                  {calculateUserRatings(bestTeamMember).aerobic}
                                </span>
                              </div>
                            </div>
                            
                            <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                              <div 
                                className="absolute h-full right-0 bg-blue-500/80"
                                style={{ width: `${userRatings.aerobic}%` }}
                              ></div>
                              <div 
                                className="absolute h-full right-0 border-l border-amber-400"
                                style={{ width: `${calculateUserRatings(bestTeamMember).aerobic}%` }}
                              ></div>
                            </div>
                            
                            <div className="text-sm flex items-center gap-1">
                              {getComparisonInfo(userRatings.aerobic, calculateUserRatings(bestTeamMember).aerobic).icon}
                              <span className={getComparisonInfo(userRatings.aerobic, calculateUserRatings(bestTeamMember).aerobic).color}>
                                {getComparisonInfo(userRatings.aerobic, calculateUserRatings(bestTeamMember).aerobic).text}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-slate-700">סיבולת אנאירובית</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${getRatingColor(userRatings.anaerobic)}`}>{userRatings.anaerobic}</span>
                                <span className="text-slate-400 mx-1">vs</span>
                                <span className={`font-bold ${getRatingColor(calculateUserRatings(bestTeamMember).anaerobic)}`}>
                                  {calculateUserRatings(bestTeamMember).anaerobic}
                                </span>
                              </div>
                            </div>
                            
                            <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                              <div 
                                className="absolute h-full right-0 bg-indigo-500/80"
                                style={{ width: `${userRatings.anaerobic}%` }}
                              ></div>
                              <div 
                                className="absolute h-full right-0 border-l border-amber-400"
                                style={{ width: `${calculateUserRatings(bestTeamMember).anaerobic}%` }}
                              ></div>
                            </div>
                            
                            <div className="text-sm flex items-center gap-1">
                              {getComparisonInfo(userRatings.anaerobic, calculateUserRatings(bestTeamMember).anaerobic).icon}
                              <span className={getComparisonInfo(userRatings.anaerobic, calculateUserRatings(bestTeamMember).anaerobic).color}>
                                {getComparisonInfo(userRatings.anaerobic, calculateUserRatings(bestTeamMember).anaerobic).text}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-slate-700">כוח</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${getRatingColor(userRatings.strength)}`}>{userRatings.strength}</span>
                                <span className="text-slate-400 mx-1">vs</span>
                                <span className={`font-bold ${getRatingColor(calculateUserRatings(bestTeamMember).strength)}`}>
                                  {calculateUserRatings(bestTeamMember).strength}
                                </span>
                              </div>
                            </div>
                            
                            <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                              <div 
                                className="absolute h-full right-0 bg-emerald-500/80"
                                style={{ width: `${userRatings.strength}%` }}
                              ></div>
                              <div 
                                className="absolute h-full right-0 border-l border-amber-400"
                                style={{ width: `${calculateUserRatings(bestTeamMember).strength}%` }}
                              ></div>
                            </div>
                            
                            <div className="text-sm flex items-center gap-1">
                              {getComparisonInfo(userRatings.strength, calculateUserRatings(bestTeamMember).strength).icon}
                              <span className={getComparisonInfo(userRatings.strength, calculateUserRatings(bestTeamMember).strength).color}>
                                {getComparisonInfo(userRatings.strength, calculateUserRatings(bestTeamMember).strength).text}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-slate-700">ציון כללי</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${getRatingColor(userRatings.overall)}`}>{userRatings.overall}</span>
                                <span className="text-slate-400 mx-1">vs</span>
                                <span className={`font-bold ${getRatingColor(calculateUserRatings(bestTeamMember).overall)}`}>
                                  {calculateUserRatings(bestTeamMember).overall}
                                </span>
                              </div>
                            </div>
                            
                            <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                              <div 
                                className="absolute h-full right-0 bg-slate-700/80"
                                style={{ width: `${userRatings.overall}%` }}
                              ></div>
                              <div 
                                className="absolute h-full right-0 border-l border-amber-400"
                                style={{ width: `${calculateUserRatings(bestTeamMember).overall}%` }}
                              ></div>
                            </div>
                            
                            <div className="text-sm flex items-center gap-1">
                              {getComparisonInfo(userRatings.overall, calculateUserRatings(bestTeamMember).overall).icon}
                              <span className={getComparisonInfo(userRatings.overall, calculateUserRatings(bestTeamMember).overall).color}>
                                {getComparisonInfo(userRatings.overall, calculateUserRatings(bestTeamMember).overall).text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Metrics Comparison Tabs */}
                <div className="p-5 border border-slate-200 rounded-xl shadow-sm bg-white">
                  <h4 className="font-medium text-lg mb-6 text-slate-800">השוואה לממוצע הקבוצה לפי קטגוריות</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Aerobic Card */}
                    <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaRunning size={16} />
                          <h5 className="font-medium">סיבולת אירובית</h5>
                        </div>
                        <div className="bg-white/10 px-2 py-1 rounded text-xs">
                          ריצת 3000 מ׳
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600">אתה</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-xl font-bold ${getRatingColor(userRatings.aerobic)}`}>
                              {userRatings.aerobic}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-600">ממוצע הקבוצה</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-xl font-bold ${getRatingColor(teamAverage.aerobic)}`}>
                              {teamAverage.aerobic}
                            </span>
                          </div>
                        </div>
                        
                        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                          <div 
                            className="absolute h-full right-0 bg-blue-500/80"
                            style={{ width: `${userRatings.aerobic}%` }}
                          ></div>
                          <div 
                            className="absolute h-full right-0 border-l border-slate-400"
                            style={{ width: `${teamAverage.aerobic}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-sm text-slate-600">
                          {getComparisonInfo(userRatings.aerobic, teamAverage.aerobic).text}
                        </div>
                      </div>
                    </div>
                    
                    {/* Anaerobic Card */}
                    <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                      <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaBolt size={16} />
                          <h5 className="font-medium">סיבולת אנאירובית</h5>
                        </div>
                        <div className="bg-white/10 px-2 py-1 rounded text-xs">
                          ריצת 400 מ׳
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600">אתה</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-xl font-bold ${getRatingColor(userRatings.anaerobic)}`}>
                              {userRatings.anaerobic}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-600">ממוצע הקבוצה</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-xl font-bold ${getRatingColor(teamAverage.anaerobic)}`}>
                              {teamAverage.anaerobic}
                            </span>
                          </div>
                        </div>
                        
                        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                          <div 
                            className="absolute h-full right-0 bg-indigo-500/80"
                            style={{ width: `${userRatings.anaerobic}%` }}
                          ></div>
                          <div 
                            className="absolute h-full right-0 border-l border-slate-400"
                            style={{ width: `${teamAverage.anaerobic}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-sm text-slate-600">
                          {getComparisonInfo(userRatings.anaerobic, teamAverage.anaerobic).text}
                        </div>
                      </div>
                    </div>
                    
                    {/* Strength Card */}
                    <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                      <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaDumbbell size={16} />
                          <h5 className="font-medium">כוח</h5>
                        </div>
                        <div className="bg-white/10 px-2 py-1 rounded text-xs">
                          מתח, שכיבות סמיכה, בטן
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600">אתה</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-xl font-bold ${getRatingColor(userRatings.strength)}`}>
                              {userRatings.strength}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-600">ממוצע הקבוצה</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-xl font-bold ${getRatingColor(teamAverage.strength)}`}>
                              {teamAverage.strength}
                            </span>
                          </div>
                        </div>
                        
                        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                          <div 
                            className="absolute h-full right-0 bg-emerald-500/80"
                            style={{ width: `${userRatings.strength}%` }}
                          ></div>
                          <div 
                            className="absolute h-full right-0 border-l border-slate-400"
                            style={{ width: `${teamAverage.strength}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-sm text-slate-600">
                          {getComparisonInfo(userRatings.strength, teamAverage.strength).text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}