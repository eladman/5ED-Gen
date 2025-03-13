"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TrainingProgramForm from '../components/TrainingProgramForm';
import Navbar from '../components/Navbar';

export default function CreateProgram() {
  const { user } = useAuth();
  const router = useRouter();

  // Protect the route - redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) {
    return null; // Don't render anything while checking authentication
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