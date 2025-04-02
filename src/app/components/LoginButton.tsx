"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useProfile } from '@/lib/contexts/ProfileContext';
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from 'next/image';

export default function LoginButton() {
  const { user, signInWithGoogle, signOut, error: authError } = useAuth();
  const { hasCompleteProfile, refreshProfile } = useProfile();
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleAuth = async () => {
    try {
      setLocalError(null);
      if (user) {
        await signOut();
        router.push("/");
      } else {
        // Check if running in a browser environment
        if (typeof window !== 'undefined') {
          // Inform user about potential popup blockers
          console.log("Please ensure popup blockers are disabled for this site");
          
          await signInWithGoogle();
          
          // Refresh profile state from context
          await refreshProfile();
          
          // Check if user has a complete profile
          if (!hasCompleteProfile) {
            // New user or incomplete profile - redirect to signup
            router.push("/signup");
          } else {
            // Existing user with complete profile - redirect to home
            router.push("/");
          }
        } else {
          throw new Error("Authentication requires a browser environment");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Provide more specific error messages based on error type
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
      // Clear error after 5 seconds
      setTimeout(() => setLocalError(null), 5000);
    }
  };

  // Show either auth error or local error
  const displayError = authError || localError;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleAuth}
        className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
      >
        {user ? (
          <>
            <Image
              src={user.photoURL || ""}
              alt="תמונת פרופיל"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>התנתק</span>
          </>
        ) : (
          <>
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>התחבר עם Google</span>
          </>
        )}
      </button>
      {displayError && (
        <div className="mt-2 text-red-500 text-sm text-center max-w-md">
          {displayError}
        </div>
      )}
    </div>
  );
} 