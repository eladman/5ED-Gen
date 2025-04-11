import { renderHook, waitFor } from '@testing-library/react';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getProfile } from '@/lib/firebase/profileUtils';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

jest.mock('@/lib/firebase/profileUtils', () => ({
  getProfile: jest.fn()
}));

describe('useRequireAuth', () => {
  // Mock implementation
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    
    // Default auth mock - loading
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true
    });
    
    // Default profile mock - no profile
    (getProfile as jest.Mock).mockResolvedValue(null);
  });
  
  it('does nothing while auth is loading', async () => {
    const { result } = renderHook(() => useRequireAuth());
    
    expect(result.current.loading).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });
  
  it('redirects to / when user is not authenticated', async () => {
    // Not loading anymore, but no user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });
    
    renderHook(() => useRequireAuth());
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });
  
  it('redirects to custom path when user is not authenticated', async () => {
    // Not loading anymore, but no user
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false
    });
    
    renderHook(() => useRequireAuth({ redirectTo: '/login' }));
    
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
  
  it('checks profile when user is authenticated', async () => {
    const mockUser = { uid: 'test-user-id' };
    
    // User is authenticated
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });
    
    // Return a complete profile
    (getProfile as jest.Mock).mockResolvedValue({
      name: 'Test User',
      phone: '123456789',
      team: 'Test Team'
    });
    
    const { result } = renderHook(() => useRequireAuth());
    
    // Initially it should be loading (checking profile)
    expect(result.current.loading).toBe(true);
    
    // After profile check finishes
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(getProfile).toHaveBeenCalledWith(mockUser.uid);
    expect(result.current.hasProfile).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });
  
  it('redirects to /signup when user has incomplete profile', async () => {
    const mockUser = { uid: 'test-user-id' };
    
    // User is authenticated
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });
    
    // Return an incomplete profile (missing team)
    (getProfile as jest.Mock).mockResolvedValue({
      name: 'Test User',
      phone: '123456789',
    });
    
    renderHook(() => useRequireAuth());
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signup');
    });
  });
  
  it('skips profile check when requireProfile is false', async () => {
    const mockUser = { uid: 'test-user-id' };
    
    // User is authenticated
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });
    
    const { result } = renderHook(() => useRequireAuth({ requireProfile: false }));
    
    // Should immediately finish loading
    expect(result.current.loading).toBe(false);
    
    // Should not call getProfile
    expect(getProfile).not.toHaveBeenCalled();
    
    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled();
    
    // Should set hasProfile to true regardless
    expect(result.current.hasProfile).toBe(true);
  });
  
  it('handles profile check errors', async () => {
    const mockUser = { uid: 'test-user-id' };
    
    // User is authenticated
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false
    });
    
    // Simulate error during profile check
    (getProfile as jest.Mock).mockRejectedValue(new Error('Profile check failed'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    renderHook(() => useRequireAuth());
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/signup');
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
}); 