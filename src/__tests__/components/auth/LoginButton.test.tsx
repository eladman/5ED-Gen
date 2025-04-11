import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginButton from '@/components/auth/LoginButton';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/contexts/ProfileContext';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/hooks/useAuth');
jest.mock('@/lib/contexts/ProfileContext');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginButton Component', () => {
  // Default mock implementations
  const mockSignInWithGoogle = jest.fn();
  const mockRefreshProfile = jest.fn();
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      signInWithGoogle: mockSignInWithGoogle,
      signOut: jest.fn(),
    });
    
    (useProfile as jest.Mock).mockReturnValue({
      hasCompleteProfile: false,
      refreshProfile: mockRefreshProfile,
    });
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });
  
  it('renders the login button when user is not authenticated', () => {
    render(<LoginButton />);
    
    // Button should be in the document with "התחבר" text
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('התחבר');
  });
  
  it('does not render when user is authenticated', () => {
    // Mock authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'test-uid' },
      signInWithGoogle: mockSignInWithGoogle,
      signOut: jest.fn(),
    });
    
    render(<LoginButton />);
    
    // Button should not exist
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  
  it('triggers sign in and redirects to signup when profile is incomplete', async () => {
    // Mock successful login but incomplete profile
    mockSignInWithGoogle.mockResolvedValue(undefined);
    mockRefreshProfile.mockResolvedValue(undefined);
    
    (useProfile as jest.Mock).mockReturnValue({
      hasCompleteProfile: false,
      refreshProfile: mockRefreshProfile,
    });
    
    render(<LoginButton />);
    
    // Click the login button
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
      expect(mockRefreshProfile).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/signup');
    });
  });
  
  it('triggers sign in and redirects to home when profile is complete', async () => {
    // Mock successful login with complete profile
    mockSignInWithGoogle.mockResolvedValue(undefined);
    mockRefreshProfile.mockResolvedValue(undefined);
    
    (useProfile as jest.Mock).mockReturnValue({
      hasCompleteProfile: true,
      refreshProfile: mockRefreshProfile,
    });
    
    render(<LoginButton />);
    
    // Click the login button
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
      expect(mockRefreshProfile).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
  
  it('handles authentication errors', async () => {
    // Mock error in sign in
    const errorMessage = 'Sign-in popup was closed';
    mockSignInWithGoogle.mockRejectedValue({ 
      code: 'auth/popup-closed-by-user',
      message: errorMessage
    });
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(<LoginButton />);
    
    // Click the login button
    fireEvent.click(screen.getByRole('button'));
    
    // Verify console.error was called
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(mockRefreshProfile).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it('applies different styling when isAcademy is true', () => {
    render(<LoginButton isAcademy={true} />);
    
    const button = screen.getByRole('button');
    
    // Check for academy-specific styling
    expect(button.className).toContain('text-white');
    expect(button.className).toContain('border-white');
    
    // Should NOT have the default styling
    expect(button.className).not.toContain('text-[#ff8714]');
  });
}); 