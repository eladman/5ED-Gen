'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import { Hero, Features, TeamSection, PurposeSection } from '@/components'
import { Dashboard } from '@/components'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/lib/contexts/ProfileContext';
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const { user, loading } = useAuth();
  const { hasCompleteProfile, isLoading: profileLoading } = useProfile();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  console.log('Home page rendering - Initial state:', { 
    user: user?.uid ? 'Logged in' : 'Not logged in', 
    loading, 
    profileLoading, 
    mounted,
    hasCompleteProfile 
  });

  // Handle hydration issues by waiting until client-side render
  useEffect(() => {
    console.log('Setting mounted to true');
    setMounted(true);
  }, []);

  // Redirect users with incomplete profiles
  useEffect(() => {
    console.log('Profile check effect running:', { 
      mounted, 
      loading, 
      profileLoading, 
      userExists: !!user, 
      hasCompleteProfile 
    });
    
    if (mounted && !loading && !profileLoading && user && !hasCompleteProfile) {
      console.log('Redirecting to signup page...');
      router.push('/signup');
    }
  }, [mounted, loading, profileLoading, user, hasCompleteProfile, router]);

  // Show loading state while auth state is determined, checking profile, or during hydration
  if (!mounted || loading || profileLoading) {
    console.log('Showing loading spinner:', { mounted, loading, profileLoading });
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

  console.log('Rendering main content:', { user: !!user });
  
  // Show different content based on authentication status
  return (
    <main className="min-h-screen">
      {user ? (
        <Dashboard />
      ) : (
        <>
          <Hero />
          <PurposeSection />
          <Features />
          <TeamSection />
        </>
      )}
    </main>
  )
}
