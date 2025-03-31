"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
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

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [hasCompleteProfile, setHasCompleteProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserProfile = async () => {
    if (!user) {
      setHasCompleteProfile(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const profile = await getProfile(user.uid);
      setHasCompleteProfile(Boolean(profile && profile.name && profile.phone && profile.team));
    } catch (error) {
      console.error('Error checking profile:', error);
      setHasCompleteProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check profile when user changes
  useEffect(() => {
    checkUserProfile();
  }, [user]);

  // Provide method to manually refresh profile
  const refreshProfile = async () => {
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