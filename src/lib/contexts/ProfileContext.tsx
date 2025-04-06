"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getProfile } from '@/lib/firebase/profileUtils';

interface ProfileContextType {
  hasCompleteProfile: boolean | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  hasCompleteProfile: null,
  isLoading: true,
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const { user } = useAuth();
  const [hasCompleteProfile, setHasCompleteProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to check for profile completion flag in sessionStorage
  const checkLocalProfileFlag = useCallback((): boolean => {
    try {
      return sessionStorage.getItem('profileCompleted') === 'true';
    } catch (e) {
      return false;
    }
  }, []);

  const checkUserProfile = useCallback(async () => {
    if (!user) {
      setHasCompleteProfile(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // First check sessionStorage for profile completion flag
      if (checkLocalProfileFlag()) {
        console.log('Profile completion flag found in sessionStorage');
        setHasCompleteProfile(true);
        setIsLoading(false);
        return;
      }
      
      // Then try to get profile from Firestore/localStorage
      const profile = await getProfile(user.uid);
      setHasCompleteProfile(Boolean(profile && profile.name && profile.phone && profile.team));
    } catch (error) {
      console.error('Error checking profile:', error);
      
      // Fall back to sessionStorage again if there was an error
      setHasCompleteProfile(checkLocalProfileFlag());
    } finally {
      setIsLoading(false);
    }
  }, [user, checkLocalProfileFlag]);

  // Check profile when user changes
  useEffect(() => {
    checkUserProfile();
  }, [checkUserProfile]);

  // Provide method to manually refresh profile
  const refreshProfile = async (): Promise<void> => {
    await checkUserProfile();
  };

  return (
    <ProfileContext.Provider value={{ 
      hasCompleteProfile, 
      isLoading,
      refreshProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext); 