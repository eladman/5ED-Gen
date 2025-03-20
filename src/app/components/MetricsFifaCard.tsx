import { Metrics } from '@/app/metrics/page';
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect, useState } from "react";
import { FaRunning, FaBolt, FaDumbbell } from "react-icons/fa";
import { getProfile } from "@/lib/firebase/profileUtils";
import Image from "next/image";
import { threeKRunScore } from "@/lib/fitnessUtils";

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
      
      // For 3000m run - use the threeKRunScore function
      if (metricType === '3000m' || value === metrics.run3000m) {
        return threeKRunScore(minutes, seconds);
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

  // Calculate category ratings
  const aerobicRating = calculateRating(metrics.run3000m, 'time', '3000m');
  const anaerobicRating = calculateRating(metrics.run400m, 'time', '400m');
  const strengthRating = Math.round(
    (calculateRating(metrics.pullUps, 'reps', 'pullUps') +
     calculateRating(metrics.pushUps, 'reps', 'pushUps') +
     calculateRating(metrics.sitUps2min, 'reps', 'sitUps')) / 3
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Top Profile Bar - Minimal */}
        <div className="p-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-sm">
              {profileImage ? (
                <Image 
                  src={profileImage} 
                  alt={userName || "User"} 
                  width={32} 
                  height={32} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-slate-700 text-sm font-bold">
                  {userName?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="text-sm text-slate-600">{userName || "משתמש"}</div>
          </div>
          <div className="text-xs text-slate-400">{formatDate(metrics.createdAt)}</div>
        </div>
        
        {/* Main Rating Focus */}
        <div className="p-5 flex justify-center items-center">
          <div 
            className="w-28 h-28 rounded-full flex items-center justify-center" 
            style={{ 
              background: `conic-gradient(${getAccentColor(overallRating)} ${overallRating}%, #f1f5f9 0)`,
              boxShadow: `0 0 0 6px #ffffff, 0 0 0 7px ${getAccentColor(overallRating)}20`
            }}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getRatingColor(overallRating)}`}>
                  {overallRating}
                </div>
                <div className="text-xs text-slate-500">דירוג כללי</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Category Ratings Grid */}
        <div className="px-5 pb-5 grid grid-cols-3 gap-4">
          <RatingBlock 
            label="אירובי" 
            rating={aerobicRating} 
            accent={getAccentColor(aerobicRating)}
            icon={<FaRunning size={12} />} 
          />
          <RatingBlock 
            label="אנאירובי" 
            rating={anaerobicRating} 
            accent={getAccentColor(anaerobicRating)}
            icon={<FaBolt size={12} />} 
          />
          <RatingBlock 
            label="כוח" 
            rating={strengthRating} 
            accent={getAccentColor(strengthRating)}
            icon={<FaDumbbell size={12} />} 
          />
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
  icon
}: { 
  label: string; 
  rating: number; 
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center p-3 rounded-lg" style={{ backgroundColor: `${accent}10` }}>
      <div className="text-2xl font-bold" style={{ color: accent }}>{rating}</div>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-slate-600">{icon}</span>
        <span className="text-xs text-slate-600">{label}</span>
      </div>
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