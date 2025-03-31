"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { getProfile } from '@/lib/firebase/profileUtils';

interface UseRequireAuthOptions {
  redirectTo?: string;
  requireProfile?: boolean;
}

/**
 * Custom hook to require authentication and optionally a complete user profile
 * 
 * @param options.redirectTo Path to redirect to if auth check fails (default: '/')
 * @param options.requireProfile Whether to check if user has a complete profile (default: true)
 * @returns Object containing authentication state
 */
export function useRequireAuth({ 
  redirectTo = '/',
  requireProfile = true
}: UseRequireAuthOptions = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(requireProfile);

  useEffect(() => {
    // Don't do anything while still loading auth state
    if (loading) return;

    // If not authenticated, redirect to specified path
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If we don't need to check profile, we're done
    if (!requireProfile) {
      setHasProfile(true);
      setIsCheckingProfile(false);
      return;
    }

    // Check if user has a complete profile
    const checkProfile = async () => {
      try {
        const profile = await getProfile(user.uid);
        // Check if profile exists and has required fields
        const isComplete = Boolean(profile && profile.name && profile.phone && profile.team);
        setHasProfile(isComplete);

        // If profile is incomplete, redirect to signup
        if (!isComplete) {
          router.push('/signup');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        setHasProfile(false);
        router.push('/signup');
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user, loading, router, redirectTo, requireProfile]);

  return { 
    user, 
    loading: loading || isCheckingProfile,
    hasProfile
  };
} 