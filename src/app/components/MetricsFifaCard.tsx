import { Metrics } from '@/app/metrics/page';
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { FaRunning, FaBolt, FaDumbbell } from "react-icons/fa";
import { getProfile } from "@/lib/firebase/profileUtils";
import Image from "next/image";

interface MetricsFifaCardProps {
  metrics: Metrics;
}

export default function MetricsFifaCard({ metrics }: MetricsFifaCardProps) {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        try {
          const profile = await getProfile(user.uid);
          if (profile) {
            setUserName(profile.name || user.displayName || "");
            // Use profile photoData first, then fallback to photoURL from profile or user
            if (profile.photoData) {
              setProfileImage(profile.photoData);
            } else if (profile.photoURL) {
              setProfileImage(profile.photoURL);
            } else if (user.photoURL) {
              setProfileImage(user.photoURL);
            }
          } else if (user.photoURL) {
            setProfileImage(user.photoURL);
            setUserName(user.displayName || "");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    loadProfileData();
  }, [user]);

  // Convert metrics to ratings (0-99)
  const calculateRating = (value: string, type: 'time' | 'reps', metricType?: string) => {
    if (type === 'time') {
      const [minutes, seconds] = value.split(':').map(Number);
      const totalSeconds = minutes * 60 + seconds;
      
      if (isNaN(totalSeconds)) return 0;
      
      // For 3000m run (lower is better)
      if (metricType === '3000m' || value === metrics.run3000m) {
        if (totalSeconds < 600) return 99; // Under 10 minutes is exceptional
        if (totalSeconds > 1500) return 40; // Over 25 minutes is below average
        
        // Linear scale between 10 and 25 minutes
        return Math.round(99 - ((totalSeconds - 600) / 900) * 59);
      }
      
      // For 400m run (lower is better)
      if (metricType === '400m' || value === metrics.run400m) {
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
      if (metricType === 'pullUps' || value === metrics.pullUps) {
        if (reps > 20) return 99;
        if (reps < 1) return 40;
        return Math.round(40 + (reps / 20) * 59);
      }
      
      // Push-ups
      if (metricType === 'pushUps' || value === metrics.pushUps) {
        if (reps > 50) return 99;
        if (reps < 5) return 40;
        return Math.round(40 + (reps / 50) * 59);
      }
      
      // Sit-ups
      if (metricType === 'sitUps' || value === metrics.sitUps2min) {
        if (reps > 70) return 99;
        if (reps < 10) return 40;
        return Math.round(40 + (reps / 70) * 59);
      }
      
      return 50; // Default
    }
  };

  // Calculate overall rating
  const overallRating = Math.round(
    (calculateRating(metrics.run3000m, 'time', '3000m') +
    calculateRating(metrics.run400m, 'time', '400m') +
    calculateRating(metrics.pullUps, 'reps', 'pullUps') +
    calculateRating(metrics.pushUps, 'reps', 'pushUps') +
    calculateRating(metrics.sitUps2min, 'reps', 'sitUps')) / 5
  );

  // Get rating color based on value
  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-green-500";
    if (rating >= 80) return "text-green-400";
    if (rating >= 70) return "text-lime-500";
    if (rating >= 60) return "text-yellow-500";
    if (rating >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Card Background */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#ff8714]/10 border-2 border-white shadow flex items-center justify-center">
                {profileImage ? (
                  <Image 
                    src={profileImage} 
                    alt={userName || "User"} 
                    width={48} 
                    height={48} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-[#ff8714] text-xl font-bold">
                    {userName?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-gray-800 text-lg">{userName || "משתמש"}</div>
                <div className="text-xs text-gray-500">{formatDate(metrics.createdAt)}</div>
              </div>
            </div>
            
            {/* Overall Rating */}
            <div className="relative group">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.91549430918954"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.91549430918954"
                    fill="none"
                    stroke="#ff8714"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${overallRating}, 100`}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      strokeDashoffset: 'calc(100 - var(--rating))',
                      '--rating': overallRating
                    } as any}
                  />
                </svg>
                
                {/* Rating Display */}
                <div className="relative flex flex-col items-center">
                  <div className={`text-2xl font-bold ${getRatingColor(overallRating)} transition-colors duration-300`}>
                    {overallRating}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">דירוג כללי</div>
                </div>
              </div>
              
              {/* Hover Effect - Rating Description */}
              <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-right z-10">
                <div className="text-sm font-medium text-gray-800 mb-1">דירוג כללי</div>
                <div className="text-xs text-gray-500">
                  ממוצע משוקלל של כל המדדים שלך
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {/* Aerobic */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow hover:border-[#ff8714]/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#ff8714]/10 flex items-center justify-center">
                  <FaRunning className="text-[#ff8714]" />
                </div>
                <div className="text-sm font-medium">אירובי</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${getRatingColor(calculateRating(metrics.run3000m, 'time', '3000m'))}`}>
                  {calculateRating(metrics.run3000m, 'time', '3000m')}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff8714]" 
                      style={{ 
                        width: `${calculateRating(metrics.run3000m, 'time', '3000m')}%`,
                        transition: 'width 1s ease-out'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Anaerobic */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow hover:border-[#ff8714]/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#ff8714]/10 flex items-center justify-center">
                  <FaBolt className="text-[#ff8714]" />
                </div>
                <div className="text-sm font-medium">אנאירובי</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${getRatingColor(calculateRating(metrics.run400m, 'time', '400m'))}`}>
                  {calculateRating(metrics.run400m, 'time', '400m')}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff8714]" 
                      style={{ 
                        width: `${calculateRating(metrics.run400m, 'time', '400m')}%`,
                        transition: 'width 1s ease-out'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strength */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow hover:border-[#ff8714]/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#ff8714]/10 flex items-center justify-center">
                  <FaDumbbell className="text-[#ff8714]" />
                </div>
                <div className="text-sm font-medium">כוח</div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${getRatingColor(
                  Math.round((
                    calculateRating(metrics.pullUps, 'reps', 'pullUps') +
                    calculateRating(metrics.pushUps, 'reps', 'pushUps') +
                    calculateRating(metrics.sitUps2min, 'reps', 'sitUps')
                  ) / 3)
                )}`}>
                  {Math.round((
                    calculateRating(metrics.pullUps, 'reps', 'pullUps') +
                    calculateRating(metrics.pushUps, 'reps', 'pushUps') +
                    calculateRating(metrics.sitUps2min, 'reps', 'sitUps')
                  ) / 3)}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ff8714]" 
                      style={{ 
                        width: `${Math.round((
                          calculateRating(metrics.pullUps, 'reps', 'pullUps') +
                          calculateRating(metrics.pushUps, 'reps', 'pushUps') +
                          calculateRating(metrics.sitUps2min, 'reps', 'sitUps')
                        ) / 3)}%`,
                        transition: 'width 1s ease-out'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes dashOffset {
          from {
            stroke-dasharray: 0, 100;
          }
        }
        
        .animate-dashOffset {
          animation: dashOffset 1.5s ease-out forwards;
        }
      `}</style>
      <style jsx>{`
        @property --rating {
          syntax: '<number>';
          initial-value: 0;
          inherits: false;
        }
        
        circle {
          transition: stroke-dashoffset 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

// Helper function to get color in hex format for SVG
function getRatingColorHex(rating: number) {
  if (rating >= 90) return "#22c55e"; // green-500
  if (rating >= 80) return "#4ade80"; // green-400
  if (rating >= 70) return "#84cc16"; // lime-500
  if (rating >= 60) return "#eab308"; // yellow-500
  if (rating >= 50) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
} 