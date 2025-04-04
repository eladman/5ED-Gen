import { useState, useEffect } from 'react';
import { Metrics } from '@/app/metrics/page';
import Image from 'next/image';
import { 
  FaRunning, FaBolt, FaDumbbell, FaChevronUp, 
  FaChevronDown, FaEquals, FaSearch, FaTrophy, FaUsers, FaChartBar
} from 'react-icons/fa';
import { threeKRunScore } from '@/lib/fitnessUtils';
import { collection, getDocs, query, where, orderBy, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
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
  
  // Load available teams for user's gender
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setIsLoading(true);
        const teamsCollection = collection(db, "teams");
        
        // Get all teams first
        const teamsSnapshot = await getDocs(teamsCollection);
        let allTeams: Team[] = [];
        
        teamsSnapshot.forEach((doc) => {
          const teamData = doc.data();
          allTeams.push({
            id: doc.id,
            name: teamData.name,
            gender: teamData.gender
          } as Team);
        });

        // If no teams found in Firebase, use the ones from teamUtils
        if (allTeams.length === 0) {
          console.log("No teams found in Firebase, using predefined teams");
          
          // Create teams from the predefined list with appropriate gender
          allTeams = allTeamsData.map(team => {
            const isMaleTeam = team.name.includes('בנים') || 
              (!team.name.includes('בנות') && !team.name.includes('נערות'));
            
            return {
              id: team.id,
              name: team.name,
              gender: isMaleTeam ? 'male' : 'female'
            } as Team;
          });
          
          // Optionally save these teams to Firebase for future use
          for (const team of allTeams) {
            try {
              await addDoc(teamsCollection, team);
            } catch (error) {
              console.error("Error saving team to Firebase:", error);
            }
          }
        }

        // Filter teams based on user's gender and team type
        const filteredTeams = allTeams.filter(team => {
          // Check if team name contains 'נוער' (youth)
          const isYouthTeam = team.name.includes('נוער') || team.name.includes('בנות') || team.name.includes('בנים');
          
          // Check if team gender matches user's gender
          const genderMatch = team.gender === userGender;
          
          return isYouthTeam && genderMatch;
        });

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
  }, [userGender]);
  
  // Calculate user's rank within their gender category
  const calculateUserRankInGender = async () => {
    try {
      const usersCollection = collection(db, "users");
      const qUsers = query(usersCollection, where("gender", "==", userGender));
      const usersSnapshot = await getDocs(qUsers);
      
      const allUsers: {id: string, name: string}[] = [];
      usersSnapshot.forEach(doc => {
        allUsers.push({
          id: doc.id,
          name: doc.data().name || ""
        });
      });
      
      // Get metrics for all users in this gender
      const metricsCollection = collection(db, "metrics");
      
      // Get the latest metrics for each user
      const allUserMetrics: ComparisonMetrics[] = [];
      
      for (const user of allUsers) {
        const qMetrics = query(
          metricsCollection, 
          where("userId", "==", user.id),
          orderBy("createdAt", "desc")
        );
        
        const metricsSnapshot = await getDocs(qMetrics);
        if (!metricsSnapshot.empty) {
          // Get only the latest metrics entry
          const latestMetrics = metricsSnapshot.docs[0];
          allUserMetrics.push({
            id: latestMetrics.id,
            userName: user.name,
            userGroup: '', // We don't need this for ranking
            photoURL: null, // We don't need this for ranking
            ...latestMetrics.data()
          } as ComparisonMetrics);
        }
      }
      
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
      }
    } catch (err) {
      console.error("Error calculating user rank:", err);
    }
  };
  
  // When a team is selected, load team members and calculate stats
  useEffect(() => {
    if (!selectedTeamId) return;
    
    const loadTeamData = async () => {
      try {
        setIsLoading(true);
        
        // Get team members
        const usersCollection = collection(db, "users");
        const qUsers = query(usersCollection, where("teamId", "==", selectedTeamId));
        const usersSnapshot = await getDocs(qUsers);
        
        const teamUsersData: {id: string, name: string, photoURL?: string}[] = [];
        usersSnapshot.forEach(doc => {
          teamUsersData.push({
            id: doc.id,
            name: doc.data().name || "",
            photoURL: doc.data().photoURL || null,
            ...doc.data()
          });
        });
        
        // Get metrics for all team members
        const metricsCollection = collection(db, "metrics");
        const teamMembersMetrics: ComparisonMetrics[] = [];
        
        for (const user of teamUsersData) {
          const qMetrics = query(
            metricsCollection, 
            where("userId", "==", user.id),
            orderBy("createdAt", "desc")
          );
          
          const metricsSnapshot = await getDocs(qMetrics);
          if (!metricsSnapshot.empty) {
            // Get only the latest metrics entry
            const latestMetrics = metricsSnapshot.docs[0];
            teamMembersMetrics.push({
              id: latestMetrics.id,
              userName: user.name,
              userGroup: selectedTeamId,
              photoURL: user.photoURL || null,
              ...latestMetrics.data()
            } as ComparisonMetrics);
          }
        }
        
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
  }, [selectedTeamId, userGender]);

  // Calculate ratings for a user
  const calculateUserRatings = (metrics: Metrics, gender: string = 'male') => {
    // Calculate individual ratings
    const run3000Rating = calculateRating(metrics.run3000m, 'time', '3000m', gender);
    const run400Rating = calculateRating(metrics.run400m, 'time', '400m');
    const pullUpsRating = calculateRating(metrics.pullUps, 'reps', 'pullUps');
    const pushUpsRating = calculateRating(metrics.pushUps, 'reps', 'pushUps');
    const sitUpsRating = calculateRating(metrics.sitUps2min, 'reps', 'sitUps');

    // Calculate main category ratings
    const aerobic = run3000Rating;
    const anaerobic = run400Rating;
    const strength = Math.round((pullUpsRating + pushUpsRating + sitUpsRating) / 3);
    
    // Overall rating - match the calculation in MetricsFifaCard
    const overall = Math.round(
      (run3000Rating + run400Rating + pullUpsRating + pushUpsRating + sitUpsRating) / 5
    );

    return { overall, aerobic, anaerobic, strength };
  };

  // Convert metrics to ratings (0-99) - match the calculation in MetricsFifaCard
  const calculateRating = (value: string, type: 'time' | 'reps', metricType: string, gender: string = 'male') => {
    if (type === 'time') {
      const [minutes, seconds] = value.split(':').map(Number);
      const totalSeconds = minutes * 60 + seconds;
      
      if (isNaN(totalSeconds)) return 0;
      
      // For 3000m run (lower is better)
      if (metricType === '3000m' || value === userMetrics.run3000m) {
        if (gender === 'female') {
          return threeKRunScore(minutes, seconds, 'female');
        }
        return threeKRunScore(minutes, seconds);
      }
      
      // For 400m run (lower is better)
      if (metricType === '400m' || value === userMetrics.run400m) {
        if (totalSeconds < 60) return 99; // Under 1 minute is exceptional
        if (totalSeconds > 180) return 40; // Over 3 minutes is below average
        
        // Linear scale between 1 and 3 minutes
        return Math.round(99 - ((totalSeconds - 60) / 120) * 59);
      }
      
      return 50; // Default
    } else {
      // For reps (higher is better)
      const reps = parseInt(value);
      if (isNaN(reps)) return 0;
      
      // Pull-ups
      if (metricType === 'pullUps' || value === userMetrics.pullUps) {
        if (reps > 20) return 99;
        if (reps < 1) return 40;
        return Math.round(40 + (reps / 20) * 59);
      }
      
      // Push-ups
      if (metricType === 'pushUps' || value === userMetrics.pushUps) {
        if (reps > 50) return 99;
        if (reps < 5) return 40;
        return Math.round(40 + (reps / 50) * 59);
      }
      
      // Sit-ups
      if (metricType === 'sitUps' || value === userMetrics.sitUps2min) {
        if (reps > 70) return 99;
        if (reps < 10) return 40;
        return Math.round(40 + (reps / 70) * 59);
      }
      
      return 50; // Default
    }
  };

  // Get rating color based on value
  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-green-500";
    if (rating >= 80) return "text-green-400";
    if (rating >= 70) return "text-lime-500";
    if (rating >= 60) return "text-yellow-500";
    if (rating >= 50) return "text-orange-500";
    return "text-red-500";
  };

  // Get comparison info between two values
  const getComparisonInfo = (userValue: number, otherValue: number) => {
    const diff = userValue - otherValue;
    
    if (diff > 10) {
      return {
        icon: <FaChevronUp className="text-green-500" />,
        color: 'text-green-500',
        text: `אתה מוביל ב-${diff} נקודות`
      };
    } else if (diff > 0) {
      return {
        icon: <FaChevronUp className="text-green-400" />,
        color: 'text-green-400',
        text: `אתה מוביל במעט (${diff} נקודות)`
      };
    } else if (diff === 0) {
      return {
        icon: <FaEquals className="text-gray-400" />,
        color: 'text-gray-400',
        text: 'תיקו - אותו דירוג'
      };
    } else if (diff > -10) {
      return {
        icon: <FaChevronDown className="text-orange-400" />,
        color: 'text-orange-400',
        text: `אתה מפגר במעט (${Math.abs(diff)} נקודות)`
      };
    } else {
      return {
        icon: <FaChevronDown className="text-red-500" />,
        color: 'text-red-500',
        text: `אתה מפגר ב-${Math.abs(diff)} נקודות`
      };
    }
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
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            דירוג שלך
          </h3>
          <div className="bg-[#ff8714] text-white font-bold px-4 py-2 rounded-full">
            מקום {userRank.rank} מתוך {userRank.total}
          </div>
        </div>
        <p className="text-gray-600 mt-2">הדירוג שלך מבין כל {userGender === 'male' ? 'הבנים' : 'הבנות'}</p>
      </div>

      {/* Team Selection */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaUsers className="text-blue-500" />
          השוואה לקבוצות {userGender === 'male' ? 'בנים' : 'בנות'}
        </h3>
        
        {/* Team Selection Cards */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">בחר קבוצה להשוואה:</p>
          
          {teams.length === 0 && !isLoading ? (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <p className="text-gray-500">לא נמצאו קבוצות {userGender === 'male' ? 'בנים' : 'בנות'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {teams.map(team => (
                <div 
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id === selectedTeamId ? '' : team.id)}
                  className={`
                    cursor-pointer p-4 rounded-lg border-2 transition-all duration-200
                    ${team.id === selectedTeamId 
                      ? 'border-[#ff8714] bg-[#ff8714]/5 shadow-md transform scale-[1.02]' 
                      : 'border-gray-200 hover:border-[#ff8714]/50 hover:shadow'}
                  `}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-2
                      ${team.id === selectedTeamId ? 'bg-[#ff8714]/20' : 'bg-gray-100'}
                    `}>
                      <FaUsers className={team.id === selectedTeamId ? 'text-[#ff8714]' : 'text-gray-500'} />
                    </div>
                    <p className="font-medium truncate w-full">
                      {team.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {isLoading && (
          <div className="text-center py-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#ff8714] mx-auto mb-3"></div>
            <p className="text-gray-600">טוען נתונים...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        {selectedTeamId && !isLoading && !error && (
          <div className="space-y-6 animate-fadeIn">
            {/* Team Stats Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-lg">
                  {teams.find(t => t.id === selectedTeamId)?.name}
                </h4>
                <p className="text-sm text-gray-500">
                  השוואה בין המדדים שלך לביצועי הקבוצה
                </p>
              </div>
              <button 
                onClick={() => setSelectedTeamId('')}
                className="mt-3 md:mt-0 text-sm text-gray-500 hover:text-[#ff8714] flex items-center gap-1 transition-colors"
              >
                <span>בחר קבוצה אחרת</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {/* Comparison to Team Average */}
            <div className="border border-gray-200 rounded-lg p-5">
              <h4 className="font-medium text-lg mb-4 flex items-center gap-2">
                <FaChartBar className="text-indigo-500" />
                השוואה לממוצע הקבוצה
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Overall Rating */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">ציון כללי</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getRatingColor(userRatings.overall)}`}>
                        {userRatings.overall}
                      </span>
                      <span className="text-gray-400 mx-1">vs</span>
                      <span className={`font-bold ${getRatingColor(teamAverage.overall)}`}>
                        {teamAverage.overall}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`absolute h-full right-0 ${getRatingColor(userRatings.overall).replace('text-', 'bg-')}`}
                      style={{ width: `${userRatings.overall}%` }}
                    ></div>
                    <div className="absolute h-full right-0 bg-black opacity-20" style={{ width: `${teamAverage.overall}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-sm">
                      {getComparisonInfo(userRatings.overall, teamAverage.overall).icon}
                      <span className={getComparisonInfo(userRatings.overall, teamAverage.overall).color}>
                        {getComparisonInfo(userRatings.overall, teamAverage.overall).text}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span>אתה</span>
                      <span className="text-gray-500">ממוצע</span>
                    </div>
                  </div>
                </div>
                
                {/* Aerobic */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">סיבולת אירובית</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getRatingColor(userRatings.aerobic)}`}>
                      {userRatings.aerobic}
                      </span>
                      <span className="text-gray-400 mx-1">vs</span>
                      <span className={`font-bold ${getRatingColor(teamAverage.aerobic)}`}>
                        {teamAverage.aerobic}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`absolute h-full right-0 ${getRatingColor(userRatings.aerobic).replace('text-', 'bg-')}`}
                      style={{ width: `${userRatings.aerobic}%` }}
                    ></div>
                    <div className="absolute h-full right-0 bg-black opacity-20" style={{ width: `${teamAverage.aerobic}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-sm">
                      {getComparisonInfo(userRatings.aerobic, teamAverage.aerobic).icon}
                      <span className={getComparisonInfo(userRatings.aerobic, teamAverage.aerobic).color}>
                        {getComparisonInfo(userRatings.aerobic, teamAverage.aerobic).text}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span>אתה</span>
                      <span className="text-gray-500">ממוצע</span>
                    </div>
                  </div>
                </div>
                
                {/* Anaerobic */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">סיבולת אנאירובית</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getRatingColor(userRatings.anaerobic)}`}>
                      {userRatings.anaerobic}
                      </span>
                      <span className="text-gray-400 mx-1">vs</span>
                      <span className={`font-bold ${getRatingColor(teamAverage.anaerobic)}`}>
                        {teamAverage.anaerobic}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`absolute h-full right-0 ${getRatingColor(userRatings.anaerobic).replace('text-', 'bg-')}`}
                      style={{ width: `${userRatings.anaerobic}%` }}
                    ></div>
                    <div className="absolute h-full right-0 bg-black opacity-20" style={{ width: `${teamAverage.anaerobic}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-sm">
                      {getComparisonInfo(userRatings.anaerobic, teamAverage.anaerobic).icon}
                      <span className={getComparisonInfo(userRatings.anaerobic, teamAverage.anaerobic).color}>
                        {getComparisonInfo(userRatings.anaerobic, teamAverage.anaerobic).text}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span>אתה</span>
                      <span className="text-gray-500">ממוצע</span>
                    </div>
                  </div>
                </div>
                
                {/* Strength */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">כוח</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getRatingColor(userRatings.strength)}`}>
                      {userRatings.strength}
                      </span>
                      <span className="text-gray-400 mx-1">vs</span>
                      <span className={`font-bold ${getRatingColor(teamAverage.strength)}`}>
                        {teamAverage.strength}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`absolute h-full right-0 ${getRatingColor(userRatings.strength).replace('text-', 'bg-')}`}
                      style={{ width: `${userRatings.strength}%` }}
                    ></div>
                    <div className="absolute h-full right-0 bg-black opacity-20" style={{ width: `${teamAverage.strength}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-sm">
                      {getComparisonInfo(userRatings.strength, teamAverage.strength).icon}
                      <span className={getComparisonInfo(userRatings.strength, teamAverage.strength).color}>
                        {getComparisonInfo(userRatings.strength, teamAverage.strength).text}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span>אתה</span>
                      <span className="text-gray-500">ממוצע</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Helpful message when no team is selected */}
      {!selectedTeamId && !isLoading && teams.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg inline-flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>עצה!</span>
          </div>
          <p className="text-gray-600 mb-4">
            בחר קבוצה מהרשימה לעיל כדי להשוות את תוצאותיך לממוצע הקבוצה ולמוביל/ה בקבוצה
          </p>
          <p className="text-sm text-gray-500">
            הנתונים מאפשרים לך לראות את הביצועים שלך ביחס לקבוצות {userGender === 'male' ? 'בנים' : 'בנות'} אחרות
          </p>
        </div>
      )}
    </div>
  );
}