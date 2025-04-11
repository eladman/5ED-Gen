'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getProfile } from '@/lib/firebase/profileUtils';
import SavedWorkouts from '@/components/SavedWorkouts';
import Navbar from '@/components/Navbar';
import { redirect, useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';

export default function ProgramsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

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
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [user, router]);

  if (!user || isLoading) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container-custom pt-32 pb-16">
        <div className="flex flex-col items-center mb-12">
          <h1 className="heading-2 mb-6 text-center">
            תוכניות האימון שלי
          </h1>
          <button
            onClick={() => router.push('/create-program')}
            className="flex items-center gap-2 px-6 py-3 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>צור תוכנית חדשה</span>
          </button>
        </div>
        <SavedWorkouts />
      </div>
    </main>
  );
} 