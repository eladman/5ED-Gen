'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import SavedWorkouts from '../components/SavedWorkouts';
import Navbar from '../components/Navbar';
import { redirect } from 'next/navigation';

export default function ProgramsPage() {
  const { user } = useAuth();

  if (!user) {
    redirect('/');
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container-custom pt-32 pb-16">
        <h1 className="heading-2 mb-8 text-center">
          תוכניות האימון שלי
        </h1>
        <SavedWorkouts />
      </div>
    </main>
  );
} 