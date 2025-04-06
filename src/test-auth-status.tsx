"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/firebase';

export default function AuthStatusTest() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current auth state
        const user = auth.currentUser;
        
        // Collect auth details
        const authDetails = {
          isAuthenticated: !!user,
          userId: user?.uid || 'Not authenticated',
          email: user?.email || 'Not available',
          displayName: user?.displayName || 'Not available',
          photoURL: user?.photoURL || 'Not available',
          providerId: user?.providerData[0]?.providerId || 'Not available',
          metadata: {
            creationTime: user?.metadata.creationTime,
            lastSignInTime: user?.metadata.lastSignInTime
          },
          token: user ? await user.getIdToken(true) : 'Not available'
        };
        
        setAuthStatus(authDetails);
      } catch (err: any) {
        console.error('Error checking auth:', err);
        setError(err.message || 'Unknown error checking auth status');
      }
    };
    
    checkAuth();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {authStatus ? (
        <div className="space-y-2">
          <p><strong>Authenticated:</strong> {authStatus.isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {authStatus.userId}</p>
          <p><strong>Email:</strong> {authStatus.email}</p>
          <p><strong>Display Name:</strong> {authStatus.displayName}</p>
          <p><strong>Provider:</strong> {authStatus.providerId}</p>
          <p><strong>Account Created:</strong> {authStatus.metadata.creationTime}</p>
          <p><strong>Last Sign In:</strong> {authStatus.metadata.lastSignInTime}</p>
        </div>
      ) : (
        <p>Loading authentication status...</p>
      )}
    </div>
  );
} 