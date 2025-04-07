"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from '@/lib/contexts/ProfileContext';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface LoginButtonProps {
  isAcademy?: boolean;
}

export default function LoginButton({ isAcademy = false }: LoginButtonProps) {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { hasCompleteProfile, refreshProfile } = useProfile();
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleAuth = async () => {
    try {
      await signInWithGoogle();
      await refreshProfile();
      if (!hasCompleteProfile) {
        router.push("/signup");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "An error occurred during authentication";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was closed. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Sign-in popup was blocked. Please allow popups for this site and try again.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in process was cancelled. Please try again.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      setLocalError(errorMessage);
      setTimeout(() => setLocalError(null), 5000);
    }
  };

  if (user) {
    return (
      <button
        onClick={signOut}
        className={`${
          isAcademy
            ? 'text-white hover:text-gray-200'
            : 'text-gray-600 hover:text-[#ff8714]'
        } transition-colors`}
      >
        התנתק
      </button>
    );
  }

  return (
    <button
      onClick={handleAuth}
      className={`${
        isAcademy
          ? 'text-white hover:text-gray-200'
          : 'text-gray-600 hover:text-[#ff8714]'
      } transition-colors`}
    >
      התחבר
    </button>
  );
} 