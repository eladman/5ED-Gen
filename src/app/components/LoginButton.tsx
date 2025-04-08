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
  const [isHovered, setIsHovered] = useState(false);

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
    return null;
  }

  return (
    <button
      onClick={handleAuth}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative
        px-6 py-2.5
        rounded-full
        text-sm font-medium
        transition-all duration-300
        ${isAcademy 
          ? 'text-white border border-white/30 hover:border-white/60' 
          : 'text-[#ff8714] border border-[#ff8714]/30 hover:border-[#ff8714]/60'
        }
        before:absolute before:inset-0 before:rounded-full
        before:transition-all before:duration-300
        ${isAcademy
          ? 'before:bg-white/5 hover:before:bg-white/10'
          : 'before:bg-[#ff8714]/5 hover:before:bg-[#ff8714]/10'
        }
        hover:scale-[1.02]
        active:scale-[0.98]
        overflow-hidden
      `}
    >
      התחבר
    </button>
  );
} 