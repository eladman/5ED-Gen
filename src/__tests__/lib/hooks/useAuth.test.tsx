import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthContext, AuthProvider } from '@/lib/contexts/AuthContext';

// Mock the AuthContext
jest.mock('@/lib/contexts/AuthContext', () => {
  const originalModule = jest.requireActual('@/lib/contexts/AuthContext');
  
  return {
    ...originalModule,
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <originalModule.AuthContext.Provider 
        value={{
          user: null,
          loading: false,
          error: null,
          signInWithGoogle: jest.fn(),
          signOut: jest.fn()
        }}
      >
        {children}
      </originalModule.AuthContext.Provider>
    )
  };
});

describe('useAuth hook', () => {
  it('returns the context value', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    
    expect(result.current).toEqual({
      user: null,
      loading: false,
      error: null,
      signInWithGoogle: expect.any(Function),
      signOut: expect.any(Function)
    });
  });
  
  it('calls signInWithGoogle method from context', async () => {
    const mockSignIn = jest.fn();
    
    // Create a custom wrapper with our mock function
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider 
        value={{
          user: null,
          loading: false,
          error: null,
          signInWithGoogle: mockSignIn,
          signOut: jest.fn()
        }}
      >
        {children}
      </AuthContext.Provider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.signInWithGoogle();
    });
    
    expect(mockSignIn).toHaveBeenCalled();
  });
  
  it('calls signOut method from context', async () => {
    const mockSignOut = jest.fn();
    
    // Create a custom wrapper with our mock function
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider 
        value={{
          user: null,
          loading: false,
          error: null,
          signInWithGoogle: jest.fn(),
          signOut: mockSignOut
        }}
      >
        {children}
      </AuthContext.Provider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.signOut();
    });
    
    expect(mockSignOut).toHaveBeenCalled();
  });
  
  it('throws error when used outside AuthProvider', () => {
    // Mock console.error to avoid React's error logging in test output
    const originalError = console.error;
    console.error = jest.fn();
    
    // Mock React's useContext to return undefined, which should trigger the error
    jest.spyOn(React, 'useContext').mockImplementation(() => undefined);
    
    expect(() => {
      // Using renderHook without a provider should throw
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
    
    // Restore mocks
    console.error = originalError;
    jest.restoreAllMocks();
  });
}); 