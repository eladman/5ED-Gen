"use client";

import React, { createContext, useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, User } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      console.log("Attempting to sign in with Google");
      const provider = new GoogleAuthProvider();
      
      // Add scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set custom parameters - using redirect instead of popup to avoid promise issues
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use signInWithPopup with proper error handling
      const result = await signInWithPopup(auth, provider).catch((error) => {
        console.error("Popup error:", error);
        // If popup is blocked or fails, throw the error to be caught by the outer catch
        throw error;
      });
      
      console.log("Sign in successful:", result.user.email);
    } catch (error: any) {
      console.error("Detailed error signing in with Google:", error);
      setError(error.message || "An error occurred during sign in");
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      setError(null);
      console.log("Attempting to sign out");
      await firebaseSignOut(auth);
      console.log("Sign out successful");
    } catch (error: any) {
      console.error("Error signing out:", error);
      setError(error.message || "An error occurred during sign out");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      signInWithGoogle, 
      signOut: signOutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
