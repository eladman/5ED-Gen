import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ProfileProvider, useProfile } from '@/lib/contexts/ProfileContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { getProfile } from '@/lib/firebase/profileUtils';

// Mock dependencies
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/lib/firebase/profileUtils', () => ({
  getProfile: jest.fn()
}));

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('ProfileContext', () => {
  const mockUser = { uid: 'test-user-123' };
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    
    // Default auth mock - logged in user
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });
    
    // Default profile mock - no profile
    (getProfile as jest.Mock).mockResolvedValue(null);
  });
  
  it('provides initial profile state', async () => {
    render(
      <ProfileProvider>
        <ProfileConsumer />
      </ProfileProvider>
    );
    
    // Initial state should be loading
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // After check completes, should no longer be loading
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    expect(screen.getByTestId('hasProfile').textContent).toBe('false');
  });
  
  it('detects complete profile from Firestore', async () => {
    // Mock a complete profile from Firestore
    (getProfile as jest.Mock).mockResolvedValue({
      name: 'Test User',
      phone: '123456789',
      team: 'Test Team'
    });
    
    render(
      <ProfileProvider>
        <ProfileConsumer />
      </ProfileProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('hasProfile').textContent).toBe('true');
    });
    
    expect(getProfile).toHaveBeenCalledWith(mockUser.uid);
  });
  
  it('prioritizes sessionStorage profile flag', async () => {
    // Set completed profile in sessionStorage
    mockSessionStorage.setItem('profileCompleted', 'true');
    
    // But Firestore would return incomplete profile
    (getProfile as jest.Mock).mockResolvedValue({ name: 'Test User' });
    
    render(
      <ProfileProvider>
        <ProfileConsumer />
      </ProfileProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('hasProfile').textContent).toBe('true');
    });
    
    // getProfile should not be called when sessionStorage has the flag
    expect(getProfile).not.toHaveBeenCalled();
  });
  
  it('sets hasCompleteProfile to false when user is not logged in', async () => {
    // Mock no user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });
    
    render(
      <ProfileProvider>
        <ProfileConsumer />
      </ProfileProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('hasProfile').textContent).toBe('false');
    });
    
    // getProfile should not be called when there's no user
    expect(getProfile).not.toHaveBeenCalled();
  });
  
  it('allows refreshing profile data', async () => {
    // First return incomplete profile
    (getProfile as jest.Mock).mockResolvedValueOnce({ name: 'Test User' });
    
    const { rerender } = render(
      <ProfileProvider>
        <ProfileConsumer showRefreshButton />
      </ProfileProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('hasProfile').textContent).toBe('false');
    });
    
    // Update mock to return complete profile on next call
    (getProfile as jest.Mock).mockResolvedValueOnce({
      name: 'Test User',
      phone: '123456789',
      team: 'Test Team'
    });
    
    // Trigger refresh
    act(() => {
      screen.getByTestId('refresh-button').click();
    });
    
    // Should be loading again
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Should update to complete profile
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('hasProfile').textContent).toBe('true');
    });
    
    // getProfile should have been called twice
    expect(getProfile).toHaveBeenCalledTimes(2);
  });
});

// Helper component to consume the context for testing
function ProfileConsumer({ showRefreshButton = false }: { showRefreshButton?: boolean }) {
  const { hasCompleteProfile, isLoading, refreshProfile } = useProfile();
  
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="hasProfile">{String(Boolean(hasCompleteProfile))}</div>
      {showRefreshButton && (
        <button 
          data-testid="refresh-button" 
          onClick={() => refreshProfile()}
        >
          Refresh Profile
        </button>
      )}
    </div>
  );
} 