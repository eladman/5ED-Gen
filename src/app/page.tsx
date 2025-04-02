'use client';

import { useEffect, useState } from 'react';
import Hero from './components/Hero'
import Features from './components/Features'
import Dashboard from './components/Dashboard'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/lib/contexts/ProfileContext';
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home(): JSX.Element {
  const { user, loading } = useAuth();
  const { hasCompleteProfile, isLoading: profileLoading } = useProfile();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle hydration issues by waiting until client-side render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect users with incomplete profiles
  useEffect(() => {
    if (mounted && !loading && !profileLoading && user && !hasCompleteProfile) {
      router.push('/signup');
    }
  }, [mounted, loading, profileLoading, user, hasCompleteProfile, router]);

  // Show loading state while auth state is determined, checking profile, or during hydration
  if (!mounted || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 rounded-full border-t-4 border-[#ff8714] border-r-4 border-r-transparent"
        />
      </div>
    );
  }

  // Show different content based on authentication status
  return (
    <main className="min-h-screen">
      {user ? (
        <Dashboard />
      ) : (
        <>
          <Hero />
          <Features />
        </>
      )}
    </main>
  )
}
