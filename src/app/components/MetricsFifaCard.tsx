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
  const calculateRating = (value: string, type: 'time' | 'reps') => {
    if (type === 'time') {
      const [minutes, seconds] = value.split(':').map(Number);
      const totalSeconds = minutes * 60 + seconds;
      
      // For 3000m: Under 12:00 is excellent (99), over 20:00 is 70
      if (value.startsWith('3')) {
        return Math.max(70, 99 - Math.floor((totalSeconds - 720) / 30));
      }
      // For 400m: Under 1:00 is excellent (99), over 2:00 is 70
      return Math.max(70, 99 - Math.floor((totalSeconds - 60) / 3));
    } else {
      // For reps: Over 30 is excellent (99), under 5 is 70
      return Math.max(70, Math.min(99, 70 + Math.floor(Number(value) * 1.5)));
    }
  };

  // Calculate individual ratings
  const run3000Rating = calculateRating(metrics.run3000m, 'time');
  const run400Rating = calculateRating(metrics.run400m, 'time');
  const pullUpsRating = calculateRating(metrics.pullUps, 'reps');
  const pushUpsRating = calculateRating(metrics.pushUps, 'reps');
  const sitUpsRating = calculateRating(metrics.sitUps2min, 'reps');

  // Calculate main category ratings
  const aerobic = run3000Rating;
  const anaerobic = run400Rating;
  const strength = Math.floor((pullUpsRating + pushUpsRating) / 2);
  
  // Overall rating
  const overall = Math.floor((aerobic + anaerobic + strength) / 3);

  // Get rating color based on value
  const getRatingColor = (rating: number) => {
    if (rating >= 90) return 'text-emerald-400';
    if (rating >= 80) return 'text-blue-400';
    return 'text-amber-400';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', { 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="w-full max-w-md relative mx-auto mb-8 group">
      {/* Card Background */}
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl shadow-xl overflow-hidden">
        {/* Accent elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#ff8714]/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#ff8714]/20 to-transparent rounded-full blur-2xl" />
        
        {/* Card Content */}
        <div className="relative p-6 flex flex-col">
          {/* Header with date */}
          <div className="text-white/60 text-sm mb-2 text-right">
            {formatDate(metrics.createdAt)}
          </div>
          
          {/* User info and overall rating */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-2xl md:text-3xl font-bold text-white/90">
              {userName || "כרטיס מדדים"}
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff8714] to-[#e67200] flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">{overall}</span>
            </div>
          </div>
          
          {/* Profile Picture */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff8714] to-[#e67200] blur-md opacity-50" />
            <div className="relative w-full h-full rounded-full border-2 border-[#ff8714] overflow-hidden">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="תמונת פרופיל"
                  fill
                  className="object-cover"
                  unoptimized={profileImage.startsWith('data:')}
                  priority
                  onError={() => {
                    console.error('Error loading profile image in FIFA card');
                    setProfileImage(null);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white/50 text-xl">
                    {userName ? userName.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Detailed Stats */}
          <div className="space-y-4 mb-4">
            <h3 className="text-white/70 text-sm font-medium mb-3 text-center">קטגוריות ראשיות</h3>
            
            {/* Aerobic */}
            <div className="relative overflow-hidden rounded-lg bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaRunning className="w-5 h-5 text-[#ff8714]" />
                  <span className="text-white/80">אירובי</span>
                </div>
                <span className={`text-xl font-bold ${getRatingColor(aerobic)}`}>{aerobic}</span>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#ff8714] to-[#e67200]" style={{ width: `${aerobic}%` }} />
            </div>

            {/* Anaerobic */}
            <div className="relative overflow-hidden rounded-lg bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaBolt className="w-5 h-5 text-[#ff8714]" />
                  <span className="text-white/80">אנאירובי</span>
                </div>
                <span className={`text-xl font-bold ${getRatingColor(anaerobic)}`}>{anaerobic}</span>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#ff8714] to-[#e67200]" style={{ width: `${anaerobic}%` }} />
            </div>

            {/* Strength */}
            <div className="relative overflow-hidden rounded-lg bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaDumbbell className="w-5 h-5 text-[#ff8714]" />
                  <span className="text-white/80">כוח</span>
                </div>
                <span className={`text-xl font-bold ${getRatingColor(strength)}`}>{strength}</span>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#ff8714] to-[#e67200]" style={{ width: `${strength}%` }} />
            </div>
          </div>
          
          {/* Raw Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 p-2 rounded-lg">
              <div className="text-xs text-white/60">ריצת 3000</div>
              <div className="text-white font-medium">{metrics.run3000m}</div>
            </div>
            <div className="bg-white/5 p-2 rounded-lg">
              <div className="text-xs text-white/60">ריצת 400</div>
              <div className="text-white font-medium">{metrics.run400m}</div>
            </div>
            <div className="bg-white/5 p-2 rounded-lg">
              <div className="text-xs text-white/60">מתח</div>
              <div className="text-white font-medium">{metrics.pullUps}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 