import { useState, useEffect, useCallback } from 'react';
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
  
  // Define reusable functions BEFORE they're used in dependencies
  
  const calculateRating = useCallback((value: string, type: 'time' | 'reps', metricType: string, gender: string = 'male') => {
    // Rating calculation logic
    if (!value || value === '0' || value === '0:00') return 0;
    
    try {
      if (type === 'time') {
        // For time-based metrics like running
        const [mins, secs] = value.split(':').map(Number);
        
        if (metricType === 'run3000m') {
          return threeKRunScore(mins, secs, gender);
        }
        // Other time-based calculations can go here
      } else if (type === 'reps') {
        // For repetition-based metrics
        const reps = parseInt(value, 10);
        
        if (metricType === 'pullUps') {
          // Pull-ups logic
          return reps < 5 ? reps * 10 : 50 + (reps - 5) * 5;
        } else if (metricType === 'pushUps') {
          // Push-ups logic
          return reps < 30 ? reps * 2 : 60 + (reps - 30);
        }
        // Other rep-based calculations
      }
    } catch (error) {
      console.error(`Error calculating rating for ${metricType}:`, error);
    }
    
    return 0; // Default fallback
  }, []);
  
  const calculateUserRatings = useCallback((metrics: Metrics, gender: string = 'male') => {
    // Calculate individual scores
    const aerobicScore = metrics.run3000m ? calculateRating(metrics.run3000m, 'time', 'run3000m', gender) : 0;
    const anaerobicScore = metrics.run400m ? calculateRating(metrics.run400m, 'time', 'run400m', gender) : 0;
    
    const pullUpsScore = metrics.pullUps ? calculateRating(metrics.pullUps.toString(), 'reps', 'pullUps', gender) : 0;
    const pushUpsScore = metrics.pushUps ? calculateRating(metrics.pushUps.toString(), 'reps', 'pushUps', gender) : 0;
    
    // Strength is average of pull-ups and push-ups
    const strengthScore = pullUpsScore > 0 || pushUpsScore > 0 
      ? Math.round((pullUpsScore + pushUpsScore) / 2) 
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
  }, [calculateRating]);
  
  const generateMockTeamMembers = useCallback((teamId: string, count: number, gender: string): ComparisonMetrics[] => {
    const mockMembers: ComparisonMetrics[] = [];
    
    // Mock names
    const maleFirstNames = ['יובל', 'איתי', 'נועם', 'אורי', 'דניאל', 'רועי', 'איתמר', 'עידו', 'אלון', 'יואב'];
    const femaleFirstNames = ['נועה', 'מאיה', 'רוני', 'תמר', 'שירה', 'יעל', 'אביגיל', 'הילה', 'ליאור', 'עדי'];
    const lastNames = ['כהן', 'לוי', 'מזרחי', 'אברהם', 'דוד', 'פרץ', 'ביטון', 'אוחיון', 'גולן', 'אזולאי'];
    
    const names = gender === 'female' ? femaleFirstNames : maleFirstNames;
    
    for (let i = 0; i < count; i++) {
      const firstName = names[Math.floor(Math.random() * names.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      
      // Generate user ID
      const userId = `mock-${teamId}-${i}`;
      
      // Generate mock metrics based on gender
      // 3K run: men 10-15 mins, women 12-17 mins
      let run3000mMin, run3000mMax, pullUpsMin, pullUpsMax, pushUpsMin, pushUpsMax;
      
      if (gender === 'female') {
        run3000mMin = 12;
        run3000mMax = 17;
        pullUpsMin = 1;
        pullUpsMax = 15;
        pushUpsMin = 10;
        pushUpsMax = 50;
      } else {
        run3000mMin = 10;
        run3000mMax = 15;
        pullUpsMin = 3;
        pullUpsMax = 25;
        pushUpsMin = 20;
        pushUpsMax = 70;
      }
      
      // Random 3K run time (minutes:seconds)
      const run3000mMinutes = Math.floor(Math.random() * (run3000mMax - run3000mMin) + run3000mMin);
      const run3000mSeconds = Math.floor(Math.random() * 60);
      const run3000m = `${run3000mMinutes}:${run3000mSeconds.toString().padStart(2, '0')}`;
      
      // Random 400m time
      const run400mSeconds = Math.floor(Math.random() * 30) + 50; // 50-80 seconds
      const run400m = `0:${run400mSeconds.toString().padStart(2, '0')}`;
      
      // Random reps
      const pullUps = Math.floor(Math.random() * (pullUpsMax - pullUpsMin) + pullUpsMin);
      const pushUps = Math.floor(Math.random() * (pushUpsMax - pushUpsMin) + pushUpsMin);
      const sitUps2min = Math.floor(Math.random() * 30) + 30; // 30-60 sit-ups
      
      mockMembers.push({
        id: userId,
        userId: userId,
        userName: fullName,
        userGroup: 'נערים',
        photoURL: null,
        gender: gender,
        run3000m,
        run400m,
        pullUps: pullUps.toString(),
        pushUps: pushUps.toString(),
        sitUps2min: sitUps2min.toString(),
        createdAt: new Date().toISOString()
      } as unknown as ComparisonMetrics);
    }
    
    return mockMembers;
  }, []);
  
  // Calculate user's rank within their gender category
  const calculateUserRankInGender = useCallback(async () => {
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
      let allUserMetrics: ComparisonMetrics[] = [];
      
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
      
      // If no real users found, generate mock data for demo
      if (allUserMetrics.length === 0) {
        console.log("No real users found, generating mock ranking data");
        // Generate 15 random users of the same gender for ranking purposes
        allUserMetrics = generateMockTeamMembers("ranking", 15, userGender);
        
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
        let teamMembersMetrics: ComparisonMetrics[] = [];
        
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
        
        // If no real team members found, generate mock data for demo
        if (teamMembersMetrics.length === 0) {
          console.log("No real team members found, generating mock data");
          teamMembersMetrics = generateMockTeamMembers(selectedTeamId, 5, userGender);
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
  }, [selectedTeamId, userGender, calculateUserRatings]);

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