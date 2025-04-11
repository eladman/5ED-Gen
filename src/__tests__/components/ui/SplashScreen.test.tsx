import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SplashScreen from '@/components/ui/SplashScreen';
import { act } from 'react-dom/test-utils';

// Mock Next Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} data-testid="next-image" />;
  },
}));

describe('SplashScreen Component', () => {
  beforeEach(() => {
    // Clear timers between tests
    jest.useFakeTimers();
    // Reset body style
    document.body.style.overflow = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders and is visible when isLoaded is false', () => {
    render(<SplashScreen isLoaded={false} />);
    
    // Check if splash container exists and is visible
    const splashContainer = screen.getByText('טוען...').closest('div');
    expect(splashContainer).toBeInTheDocument();
    expect(splashContainer?.className).not.toContain('pointer-events-none');
    
    // Check if logo image exists
    const logo = screen.getByTestId('next-image');
    expect(logo).toBeInTheDocument();
    
    // Check if loading spinner exists
    const spinner = screen.getByText('טוען...').previousSibling;
    expect(spinner).toHaveClass('animate-spin');
    
    // Check if body scroll is disabled
    expect(document.body.style.overflow).toBe('hidden');
  });
  
  it('becomes hidden when isLoaded becomes true and min time passes', () => {
    const { rerender } = render(<SplashScreen isLoaded={false} />);
    
    // Fast-forward timer to complete the min display time
    act(() => {
      jest.advanceTimersByTime(3000); // More than 2.5s
    });
    
    // Update props to indicate content is loaded
    rerender(<SplashScreen isLoaded={true} />);
    
    // Check that opacity and pointer-events classes are applied
    const splashContainer = screen.getByText('טוען...').closest('div');
    expect(splashContainer?.className).toContain('opacity-0');
    expect(splashContainer?.className).toContain('pointer-events-none');
    
    // Body overflow should be restored
    expect(document.body.style.overflow).not.toBe('hidden');
  });
  
  it('stays visible until minimum time passes even if isLoaded is true', () => {
    render(<SplashScreen isLoaded={true} />);
    
    // Component should still be visible as min time hasn't passed
    const splashContainer = screen.getByText('טוען...').closest('div');
    expect(splashContainer?.className).not.toContain('pointer-events-none');
    
    // Fast-forward timer partially (not enough to trigger min time)
    act(() => {
      jest.advanceTimersByTime(1000); // Less than 2.5s
    });
    
    // Should still be visible
    expect(splashContainer?.className).not.toContain('pointer-events-none');
    
    // Complete the timer
    act(() => {
      jest.advanceTimersByTime(2000); // Total time now > 2.5s
    });
    
    // Now it should be hidden
    expect(splashContainer?.className).toContain('pointer-events-none');
  });
}); 