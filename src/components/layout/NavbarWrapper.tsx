"use client";

import { useProfile } from '@/lib/contexts/ProfileContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { Navbar, LoginButton } from '@/components';

export default function NavbarWrapper() {
  const { user, loading } = useAuth();
  const { hasCompleteProfile, isLoading } = useProfile();
  
  // Don't render while initial auth or profile loading
  if (loading || isLoading) {
    return null;
  }
  
  // For non-authenticated users, only show login button
  if (!user) {
    return (
      <div className="fixed w-full z-50 flex justify-center items-center h-16">
        <LoginButton />
      </div>
    );
  }
  
  // For authenticated users without complete profile, don't show anything
  if (!hasCompleteProfile) {
    return null;
  }
  
  // For authenticated users with complete profile, show full navbar
  return <Navbar />;
} 