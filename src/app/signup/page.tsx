"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/contexts/ProfileContext';
import SignupForm from '@/app/components/SignupForm';

export default function SignupPage() {
  const { user, loading } = useAuth();
  const { hasCompleteProfile, isLoading: profileLoading } = useProfile();
  const router = useRouter();
  
  useEffect(() => {
    if (loading || profileLoading) return;
    
    if (!user) {
      // If no user is signed in, redirect to home
      router.push('/');
      return;
    }
    
    // If user already has a complete profile, redirect to home
    if (hasCompleteProfile) {
      router.push('/');
    }
  }, [user, loading, router, hasCompleteProfile, profileLoading]);
  
  // Show loading state while checking auth
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 rounded-full border-t-4 border-[#ff8714] border-r-4 border-r-transparent animate-spin" />
      </div>
    );
  }
  
  // Show signup form once we know the user is logged in but has no profile
  if (user) {
    return <SignupForm />;
  }
  
  // This should not be rendered since we redirect, but just in case
  return null;
} 