'use client';

import { Metrics } from '@/app/metrics/page';
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { FaRunning, FaBolt, FaDumbbell } from "react-icons/fa";
import { getProfile } from "@/lib/firebase/profileUtils";
import Image from "next/image";
import { threeKRunScore, strengthScoreFromString, fourHundredMeterScoreFromString } from "@/lib/fitnessUtils";

interface MetricsFifaCardProps {
  metrics: Metrics;
}

export default function MetricsFifaCard({ metrics }: MetricsFifaCardProps) {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userGender, setUserGender] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [displayRating, setDisplayRating] = useState(0);

  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        try {
          const profile = await getProfile(user.uid);
          if (profile) {
            setUserName(profile.name || user.displayName || "");
            setUserGender(profile.gender || "male"); // Default to male if not specified
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
      
      // For 3000m run - use the threeKRunScore function with gender
      if (metricType === '3000m' || value === metrics.run3000m) {
        return threeKRunScore(minutes, seconds, userGender);
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

  // Calculate category ratings
  const aerobicRating = calculateRating(metrics.run3000m, 'time', '3000m');
  const anaerobicRating = fourHundredMeterScoreFromString(metrics.run400m, userGender);
  
  // Use the new strength score calculation (50% pull-ups, 50% push-ups)
  const strengthRating = strengthScoreFromString(metrics.pullUps, metrics.pushUps, userGender);
  
  // Sit-ups rating as a separate category
  const sitUpsRating = calculateRating(metrics.sitUps2min, 'reps', 'sitUps');

  // Overall rating calculation 
  const overallRating = Math.round(
    (aerobicRating + anaerobicRating + strengthRating + sitUpsRating) / 4
  );

  // Animate the rating display
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        let currentRating = 0;
        const interval = setInterval(() => {
          currentRating += 1;
          setDisplayRating(currentRating);
          if (currentRating >= overallRating) {
            clearInterval(interval);
          }
        }, 20);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, overallRating]);

  // Get rating color based on value
  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-green-500";
    if (rating >= 80) return "text-green-400";
    if (rating >= 70) return "text-lime-500";
    if (rating >= 60) return "text-yellow-500";
    if (rating >= 50) return "text-orange-500";
    return "text-red-500";
  };

  // Get accent color for the card
  const getAccentColor = (rating: number) => {
    if (rating >= 90) return "#22c55e"; // green-500
    if (rating >= 80) return "#4ade80"; // green-400
    if (rating >= 70) return "#84cc16"; // lime-500
    if (rating >= 60) return "#eab308"; // yellow-500
    if (rating >= 50) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
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
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
        {/* Enhanced Header with User Info */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md border-4 border-white">
            {profileImage ? (
              <Image 
                src={profileImage} 
                alt={userName || "User"} 
                width={80} 
                height={80} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="text-slate-700 text-3xl font-bold">
                {userName?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold text-white mb-1">{userName || "משתמש"}</div>
            <div className="text-xs text-slate-300">{formatDate(metrics.createdAt)}</div>
          </div>
        </div>
        
        {/* Main Rating Focus - Larger and more prominent */}
        <div className="p-6 flex flex-col items-center bg-slate-50">
          <div 
            className={`w-40 h-40 rounded-full flex items-center justify-center mb-4 transition-all duration-1000 ease-out`} 
            style={{ 
              background: `conic-gradient(${getAccentColor(displayRating)} ${displayRating}%, #f1f5f9 0)`,
              boxShadow: `0 0 0 8px #ffffff, 0 0 0 9px ${getAccentColor(displayRating)}20`,
              transform: isLoading ? 'scale(0.8)' : 'scale(1)',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getRatingColor(displayRating)} transition-colors duration-500`}>
                  {displayRating}
                </div>
                <div className="text-sm text-slate-500 mt-1 font-medium">דירוג כללי</div>
              </div>
            </div>
          </div>
          
          {/* Secondary Categories Section - Now below the main rating */}
          <div className="w-full mt-2">
            <div className="px-4 py-2 border-t border-b border-slate-200">
              <h3 className="text-sm font-medium text-slate-500 text-center">פירוט קטגוריות</h3>
            </div>
            <div className="px-4 py-4 grid grid-cols-3 gap-3">
              <RatingBlock 
                label="אירובי" 
                rating={aerobicRating} 
                accent={getAccentColor(aerobicRating)}
                icon={<FaRunning size={12} />} 
                description="ריצת 3000 מ׳"
              />
              <RatingBlock 
                label="אנאירובי" 
                rating={anaerobicRating} 
                accent={getAccentColor(anaerobicRating)}
                icon={<FaBolt size={12} />} 
                description="ריצת 400 מ׳"
              />
              <RatingBlock 
                label="כוח" 
                rating={strengthRating} 
                accent={getAccentColor(strengthRating)}
                icon={<FaDumbbell size={12} />} 
                description="מתח ושכיבות"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rating block with emphasis on the score
function RatingBlock({ 
  label, 
  rating, 
  accent,
  icon,
  description
}: { 
  label: string; 
  rating: number; 
  accent: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center p-3 rounded-lg border border-slate-100" 
         style={{ backgroundColor: `${accent}05` }}>
      <div className="text-xl font-bold" style={{ color: accent }}>{rating}</div>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-slate-600">{icon}</span>
        <span className="text-xs text-slate-600 font-medium">{label}</span>
      </div>
      <div className="text-[10px] text-slate-400 mt-1">{description}</div>
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