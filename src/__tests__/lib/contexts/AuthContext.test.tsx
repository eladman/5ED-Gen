import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthContext, AuthProvider } from '@/lib/contexts/AuthContext';
import { auth } from '@/lib/firebase/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Mock the Firebase modules
jest.mock('@/lib/firebase/firebase', () => ({
  auth: {}
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn()
  }))
}));

describe('AuthContext', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock onAuthStateChanged to call the callback immediately with null (not logged in)
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn(); // Return unsubscribe function
    });
  });
  
  it('provides initial auth state', () => {
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(context) => (
            <div>
              <div data-testid="user">{context.user ? 'User exists' : 'No user'}</div>
              <div data-testid="loading">{context.loading ? 'Loading' : 'Not loading'}</div>
              <div data-testid="error">{context.error || 'No error'}</div>
            </div>
          )}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user').textContent).toBe('No user');
    expect(screen.getByTestId('loading').textContent).toBe('Not loading'); // Initial loading state
    expect(screen.getByTestId('error').textContent).toBe('No error');
  });
  
  it('updates auth state when user logs in', async () => {
    // Mock onAuthStateChanged to emit a logged-in user
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      callback(mockUser);
      return jest.fn(); // Return unsubscribe function
    });
    
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(context) => (
            <div>
              <div data-testid="user">{context.user ? 'User exists' : 'No user'}</div>
              <div data-testid="user-email">{context.user?.email || 'No email'}</div>
            </div>
          )}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user').textContent).toBe('User exists');
    expect(screen.getByTestId('user-email').textContent).toBe(mockUser.email);
  });
  
  it('calls signInWithPopup when signInWithGoogle is called', async () => {
    (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });
    
    let contextValue: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(context) => {
            contextValue = context;
            return <div>Auth Provider</div>;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    await act(async () => {
      await contextValue.signInWithGoogle();
    });
    
    expect(signInWithPopup).toHaveBeenCalled();
  });
  
  it('calls signOut when signOut is called', async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);
    
    let contextValue: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(context) => {
            contextValue = context;
            return <div>Auth Provider</div>;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    await act(async () => {
      await contextValue.signOut();
    });
    
    expect(signOut).toHaveBeenCalled();
  });
  
  it('handles sign in error correctly', async () => {
    const errorMessage = 'Sign in failed';
    (signInWithPopup as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    let contextValue: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(context) => {
            contextValue = context;
            return (
              <div>
                <div data-testid="error">{context.error || 'No error'}</div>
              </div>
            );
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );
    
    await act(async () => {
      try {
        await contextValue.signInWithGoogle();
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(screen.getByTestId('error').textContent).toContain(errorMessage);
  });
}); 