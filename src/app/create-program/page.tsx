"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TrainingProgramForm from '../components/TrainingProgramForm';
import Navbar from '../components/Navbar';
import { getProfile } from "@/lib/firebase/profileUtils";

export default function CreateProgram() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Protect the route - redirect to home if not authenticated or to profile if profile not completed
  useEffect(() => {
    if (!user) {
      router.push("/");
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
    return null; // Don't render anything while checking authentication or profile
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto pt-32 pb-16">
        <TrainingProgramForm />
      </div>
    </main>
  );
} 