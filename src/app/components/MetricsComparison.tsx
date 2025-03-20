import { useState, useEffect } from 'react';
import { Metrics } from '@/app/metrics/page';
import { getAllMockMetrics } from '@/lib/mock/mockUserData';
import Image from 'next/image';
import { 
  FaRunning, FaBolt, FaDumbbell, FaChevronUp, 
  FaChevronDown, FaEquals, FaSearch, FaTrophy, FaUsers
} from 'react-icons/fa';
import { threeKRunScore } from '@/lib/fitnessUtils';

interface MetricsComparisonProps {
  userMetrics: Metrics;
  userName: string;
  userPhoto?: string | null;
  userGroup?: string;
}

// Extended metrics with user info for comparison
interface ComparisonMetrics extends Metrics {
  userName: string;
  userGroup: string;
  photoURL: string | null;
}

export default function MetricsComparison({ 
  userMetrics, 
  userName, 
  userPhoto,
  userGroup = 'כיתה א' // Default group if not provided
}: MetricsComparisonProps) {
  const [otherUsers, setOtherUsers] = useState<ComparisonMetrics[]>([]);
  const [selectedUser, setSelectedUser] = useState<ComparisonMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardCategory, setLeaderboardCategory] = useState<'overall' | 'aerobic' | 'anaerobic' | 'strength'>('overall');
  
  // Load mock data
  useEffect(() => {
    const mockMetrics = getAllMockMetrics();
    setOtherUsers(mockMetrics);
    // Select first user by default
    if (mockMetrics.length > 0) {
      setSelectedUser(mockMetrics[0]);
    }
  }, []);

  // Calculate ratings for a user
  const calculateUserRatings = (metrics: Metrics) => {
    // Calculate individual ratings
    const run3000Rating = calculateRating(metrics.run3000m, 'time', '3000m');
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
  const calculateRating = (value: string, type: 'time' | 'reps', metricType: string) => {
    if (type === 'time') {
      const [minutes, seconds] = value.split(':').map(Number);
      const totalSeconds = minutes * 60 + seconds;
      
      if (isNaN(totalSeconds)) return 0;
      
      // For 3000m run (lower is better)
      if (metricType === '3000m' || value === userMetrics.run3000m) {
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

  // Filter users based on search query
  const filteredUsers = otherUsers.filter(user => 
    user.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.userGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort users by selected category for leaderboard
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aRatings = calculateUserRatings(a);
    const bRatings = calculateUserRatings(b);
    
    return bRatings[leaderboardCategory] - aRatings[leaderboardCategory];
  });

  // User's rank in each category
  const userRankData = (() => {
    const userRatings = calculateUserRatings(userMetrics);
    const allUsersWithCurrent = [...otherUsers, {
      ...userMetrics,
      userName,
      userGroup: userGroup || 'כיתה א',
      photoURL: userPhoto || null
    }];
    
    // Sort everyone by category and find user's position
    const overallRank = [...allUsersWithCurrent]
      .sort((a, b) => calculateUserRatings(b).overall - calculateUserRatings(a).overall)
      .findIndex(u => u.userName === userName) + 1;
      
    const aerobicRank = [...allUsersWithCurrent]
      .sort((a, b) => calculateUserRatings(b).aerobic - calculateUserRatings(a).aerobic)
      .findIndex(u => u.userName === userName) + 1;
      
    const anaerobicRank = [...allUsersWithCurrent]
      .sort((a, b) => calculateUserRatings(b).anaerobic - calculateUserRatings(a).anaerobic)
      .findIndex(u => u.userName === userName) + 1;
      
    const strengthRank = [...allUsersWithCurrent]
      .sort((a, b) => calculateUserRatings(b).strength - calculateUserRatings(a).strength)
      .findIndex(u => u.userName === userName) + 1;
    
    const totalUsers = allUsersWithCurrent.length;
    
    return {
      overall: { rank: overallRank, total: totalUsers },
      aerobic: { rank: aerobicRank, total: totalUsers },
      anaerobic: { rank: anaerobicRank, total: totalUsers },
      strength: { rank: strengthRank, total: totalUsers },
    };
  })();

  // Calculate same group rank  
  const getUserGroupRank = () => {
    const sameGroupUsers = otherUsers.filter(u => u.userGroup === userGroup);
    
    // Add current user to the list
    const allGroupUsers = [...sameGroupUsers, {
      ...userMetrics,
      userName,
      userGroup: userGroup || 'כיתה א',
      photoURL: userPhoto || null
    }];
    
    // Sort by overall rating and find user position
    const groupRank = [...allGroupUsers]
      .sort((a, b) => calculateUserRatings(b).overall - calculateUserRatings(a).overall)
      .findIndex(u => u.userName === userName) + 1;
      
    return { rank: groupRank, total: allGroupUsers.length };
  };

  const userRatings = calculateUserRatings(userMetrics);
  const selectedUserRatings = selectedUser ? calculateUserRatings(selectedUser) : {
    overall: 0,
    aerobic: 0,
    anaerobic: 0,
    strength: 0
  };
  const groupRank = getUserGroupRank();

  return (
    <div className="space-y-8">
      {/* User Stats Summary - Enhanced with better card design */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-[#ff8714]/5 p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-4 border-[#ff8714]/20 flex items-center justify-center shadow-md">
              {userPhoto ? (
                <Image 
                  src={userPhoto} 
                  alt={userName} 
                  width={64} 
                  height={64} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-[#ff8714] text-2xl font-bold">
                  {userName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{userGroup}</span>
                <span className="inline-flex items-center gap-1 bg-[#ff8714]/10 text-[#ff8714] px-2 py-0.5 rounded-full text-xs font-medium">
                  <FaTrophy className="w-3 h-3" /> מקום {groupRank.rank}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Overall Rating */}
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200 flex flex-col items-center justify-center">
              <div className="text-sm text-gray-500 mb-1">דירוג כללי</div>
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className={`text-3xl font-bold ${getRatingColor(userRatings.overall)}`}>
                    {userRatings.overall}
                  </div>
                </div>
                <div 
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{ 
                    borderTopColor: '#ff8714',
                    transform: `rotate(${userRatings.overall * 3.6}deg)`,
                    transition: 'transform 1s ease-out'
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">מתוך 100</div>
            </div>
            
            {/* Category Ratings */}
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200 col-span-3">
              <h3 className="text-sm font-medium text-gray-500 mb-4">דירוג לפי קטגוריה</h3>
              
              <div className="space-y-4">
                {/* Aerobic */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <FaRunning className="text-[#ff8714]" />
                      <span className="text-sm font-medium">אירובי</span>
                    </div>
                    <div className={`font-bold ${getRatingColor(userRatings.aerobic)}`}>
                      {userRatings.aerobic}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff8714]" 
                      style={{ width: `${userRatings.aerobic}%`, transition: 'width 1s ease-out' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>דירוג: {userRankData.aerobic.rank}/{userRankData.aerobic.total}</span>
                    <span>{userRatings.aerobic}%</span>
                  </div>
                </div>
                
                {/* Anaerobic */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <FaBolt className="text-[#ff8714]" />
                      <span className="text-sm font-medium">אנאירובי</span>
                    </div>
                    <div className={`font-bold ${getRatingColor(userRatings.anaerobic)}`}>
                      {userRatings.anaerobic}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff8714]" 
                      style={{ width: `${userRatings.anaerobic}%`, transition: 'width 1s ease-out' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>דירוג: {userRankData.anaerobic.rank}/{userRankData.anaerobic.total}</span>
                    <span>{userRatings.anaerobic}%</span>
                  </div>
                </div>
                
                {/* Strength */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <FaDumbbell className="text-[#ff8714]" />
                      <span className="text-sm font-medium">כוח</span>
                    </div>
                    <div className={`font-bold ${getRatingColor(userRatings.strength)}`}>
                      {userRatings.strength}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff8714]" 
                      style={{ width: `${userRatings.strength}%`, transition: 'width 1s ease-out' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>דירוג: {userRankData.strength.rank}/{userRankData.strength.total}</span>
                    <span>{userRatings.strength}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comparison Section - Enhanced with better UI */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaUsers className="text-[#ff8714]" />
              השוואה חברתית
            </h2>
            <button 
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="px-4 py-2 rounded-full bg-[#ff8714] text-white hover:bg-[#e67200] transition-colors flex items-center gap-2 text-sm font-medium"
            >
              {showLeaderboard ? (
                <>
                  <span>חזרה להשוואה</span>
                </>
              ) : (
                <>
                  <FaTrophy className="w-4 h-4" />
                  <span>הצג טבלת דירוג</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Search Bar - Enhanced with better styling */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="relative max-w-md mx-auto">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="חפש לפי שם או קבוצה..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pr-10 pl-4 text-right bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-black shadow-sm"
            />
          </div>
        </div>
        
        <div className="p-6">
          {showLeaderboard ? (
            <div className="animate-fadeIn">
              {/* Leaderboard category selector - Enhanced with pill style */}
              <div className="bg-gray-100 p-1 rounded-full inline-flex mb-6 shadow-sm">
                {['overall', 'aerobic', 'anaerobic', 'strength'].map((category) => (
                  <button 
                    key={category}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                      leaderboardCategory === category 
                        ? 'bg-white text-[#ff8714] shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => setLeaderboardCategory(category as any)}
                  >
                    {category === 'overall' && 'דירוג כללי'}
                    {category === 'aerobic' && 'אירובי'}
                    {category === 'anaerobic' && 'אנאירובי'}
                    {category === 'strength' && 'כוח'}
                  </button>
                ))}
              </div>
              
              {/* Leaderboard table - Enhanced with better styling */}
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-gray-500 text-sm font-medium">דירוג</th>
                      <th className="px-4 py-3 text-right text-gray-500 text-sm font-medium">משתמש</th>
                      <th className="px-4 py-3 text-right text-gray-500 text-sm font-medium">קבוצה</th>
                      <th className="px-4 py-3 text-right text-gray-500 text-sm font-medium">ציון</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedUsers.map((user, index) => {
                      const isCurrentUser = user.userName === userName;
                      const userRating = calculateUserRatings(user)[leaderboardCategory];
                      return (
                        <tr 
                          key={index} 
                          className={`${
                            isCurrentUser 
                              ? 'bg-[#ff8714]/10' 
                              : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } hover:bg-gray-100 transition-colors`}
                        >
                          <td className="px-4 py-3 text-right">
                            {index === 0 ? (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#ff8714] text-white">
                                <FaTrophy className="w-3 h-3" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-sm">
                                {index + 1}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {user.photoURL ? (
                                  <Image 
                                    src={user.photoURL} 
                                    alt={user.userName} 
                                    width={32} 
                                    height={32} 
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    {user.userName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <span className={`${isCurrentUser ? 'font-bold' : ''}`}>
                                {user.userName}
                                {isCurrentUser && (
                                  <span className="text-xs text-[#ff8714] mr-1">(אתה)</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">{user.userGroup}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${getRatingColor(userRating)}`}>
                              {userRating}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {/* User selection - Enhanced with better cards */}
              <h3 className="text-lg font-medium mb-4">בחר משתמש להשוואה</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                {filteredUsers.map((user) => (
                  <button
                    key={user.userName}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedUser?.userName === user.userName
                        ? 'border-[#ff8714] bg-[#ff8714]/5 shadow-md transform scale-105'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'
                    } flex flex-col items-center`}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 mb-2 border-2 border-white shadow">
                      {user.photoURL ? (
                        <Image 
                          src={user.photoURL} 
                          alt={user.userName} 
                          width={56} 
                          height={56} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                          {user.userName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-center">{user.userName}</div>
                    <div className="text-xs text-gray-500">{user.userGroup}</div>
                  </button>
                ))}
              </div>
              
              {/* Comparison details - Enhanced with better visualization */}
              {selectedUser && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-slideUp">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">השוואה מפורטת</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#ff8714]"></div>
                          <span className="text-sm">{userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          <span className="text-sm">{selectedUser.userName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overall comparison - Enhanced with better visualization */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-[#ff8714]/10 flex items-center justify-center mx-auto mb-2">
                          <div className={`text-3xl font-bold ${getRatingColor(userRatings.overall)}`}>
                            {userRatings.overall}
                          </div>
                        </div>
                        <div className="text-sm font-medium">{userName}</div>
                      </div>
                      
                      <div className="flex-1 max-w-xs mx-8">
                        <div className="text-center mb-2">
                          <span className="text-sm font-medium">דירוג כללי</span>
                          <span className="text-xs text-gray-500 mr-2">
                            {getComparisonInfo(userRatings.overall, selectedUserRatings.overall).text}
                          </span>
                        </div>
                        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-[#ff8714]" style={{ width: `${userRatings.overall}%` }}></div>
                          <div className="absolute inset-y-0 left-0 bg-gray-400" style={{ width: `${selectedUserRatings.overall}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                          <div className={`text-3xl font-bold ${getRatingColor(selectedUserRatings.overall)}`}>
                            {selectedUserRatings.overall}
                          </div>
                        </div>
                        <div className="text-sm font-medium">{selectedUser.userName}</div>
                      </div>
                    </div>
                    
                    {/* Category comparisons - Enhanced with better visualization */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Aerobic */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-[#ff8714]/10 flex items-center justify-center">
                            <FaRunning className="text-[#ff8714]" />
                          </div>
                          <h4 className="font-medium">אירובי</h4>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <div className={`text-xl font-bold ${getRatingColor(userRatings.aerobic)}`}>
                            {userRatings.aerobic}
                          </div>
                          <div className="text-gray-400">vs</div>
                          <div className={`text-xl font-bold ${getRatingColor(selectedUserRatings.aerobic)}`}>
                            {selectedUserRatings.aerobic}
                          </div>
                        </div>
                        
                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div className="absolute inset-y-0 left-0 bg-[#ff8714]" style={{ width: `${userRatings.aerobic}%` }}></div>
                          <div className="absolute inset-y-0 left-0 bg-gray-400" style={{ width: `${selectedUserRatings.aerobic}%` }}></div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {getComparisonInfo(userRatings.aerobic, selectedUserRatings.aerobic).text}
                        </div>
                      </div>
                      
                      {/* Anaerobic */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-[#ff8714]/10 flex items-center justify-center">
                            <FaBolt className="text-[#ff8714]" />
                          </div>
                          <h4 className="font-medium">אנאירובי</h4>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <div className={`text-xl font-bold ${getRatingColor(userRatings.anaerobic)}`}>
                            {userRatings.anaerobic}
                          </div>
                          <div className="text-gray-400">vs</div>
                          <div className={`text-xl font-bold ${getRatingColor(selectedUserRatings.anaerobic)}`}>
                            {selectedUserRatings.anaerobic}
                          </div>
                        </div>
                        
                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div className="absolute inset-y-0 left-0 bg-[#ff8714]" style={{ width: `${userRatings.anaerobic}%` }}></div>
                          <div className="absolute inset-y-0 left-0 bg-gray-400" style={{ width: `${selectedUserRatings.anaerobic}%` }}></div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {getComparisonInfo(userRatings.anaerobic, selectedUserRatings.anaerobic).text}
                        </div>
                      </div>
                      
                      {/* Strength */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-[#ff8714]/10 flex items-center justify-center">
                            <FaDumbbell className="text-[#ff8714]" />
                          </div>
                          <h4 className="font-medium">כוח</h4>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <div className={`text-xl font-bold ${getRatingColor(userRatings.strength)}`}>
                            {userRatings.strength}
                          </div>
                          <div className="text-gray-400">vs</div>
                          <div className={`text-xl font-bold ${getRatingColor(selectedUserRatings.strength)}`}>
                            {selectedUserRatings.strength}
                          </div>
                        </div>
                        
                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div className="absolute inset-y-0 left-0 bg-[#ff8714]" style={{ width: `${userRatings.strength}%` }}></div>
                          <div className="absolute inset-y-0 left-0 bg-gray-400" style={{ width: `${selectedUserRatings.strength}%` }}></div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {getComparisonInfo(userRatings.strength, selectedUserRatings.strength).text}
                        </div>
                      </div>
                    </div>
                    
                    {/* Raw metrics comparison */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-medium mb-4">השוואת מדדים גולמיים</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">ריצת 3,000 מטר</div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{userMetrics.run3000m}</div>
                            <div className="text-gray-400 text-xs">vs</div>
                            <div className="font-medium">{selectedUser.run3000m}</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">ריצת 400 מטר</div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{userMetrics.run400m}</div>
                            <div className="text-gray-400 text-xs">vs</div>
                            <div className="font-medium">{selectedUser.run400m}</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">מתח</div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{userMetrics.pullUps}</div>
                            <div className="text-gray-400 text-xs">vs</div>
                            <div className="font-medium">{selectedUser.pullUps}</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">שכיבות שמיכה</div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{userMetrics.pushUps}</div>
                            <div className="text-gray-400 text-xs">vs</div>
                            <div className="font-medium">{selectedUser.pushUps}</div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">בטן 2 דקות</div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{userMetrics.sitUps2min}</div>
                            <div className="text-gray-400 text-xs">vs</div>
                            <div className="font-medium">{selectedUser.sitUps2min}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 