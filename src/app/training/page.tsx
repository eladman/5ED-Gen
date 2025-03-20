"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getProfile } from "@/lib/firebase/profileUtils";

export default function TrainingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      const checkProfile = async () => {
        try {
          const profile = await getProfile(user.uid);
          if (!profile || !profile.name || !profile.phone || !profile.team) {
            // Profile doesn't exist or is incomplete, redirect to profile page
            router.push("/profile");
          }
        } catch (error) {
          console.error("Error checking profile:", error);
          // In case of error, still redirect to profile to be safe
          router.push("/profile");
        } finally {
          setIsCheckingProfile(false);
        }
      };

      checkProfile();
    }
  }, [user, loading, router]);

  if (loading || isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">תוכנית אימונים</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={user.photoURL || ""}
            alt="תמונת פרופיל"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        {/* כאן יהיה תוכן תוכנית האימונים */}
        <div className="space-y-4">
          <p className="text-lg">ברוך הבא לתוכנית האימונים שלך!</p>
          {/* הוסף כאן את תוכן תוכנית האימונים */}
        </div>
      </div>
    </div>
  );
} 