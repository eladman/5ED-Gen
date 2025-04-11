import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import ScrollProgress from '@/components/ui/ScrollProgress';

// Mock framer-motion hooks
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ className, style }: any) => (
      <div className={className} style={style} data-testid="progress-bar" />
    ),
  },
  useScroll: () => ({ scrollYProgress: { get: () => 0.5 } }),
  useSpring: () => ({ get: () => 0.5 }),
}));

describe('ScrollProgress Component', () => {
  it('renders with correct classes and positioning', () => {
    const { getByTestId } = render(<ScrollProgress />);
    
    const progressBar = getByTestId('progress-bar');
    
    // Test for essential classes without exact match
    expect(progressBar).toHaveClass('fixed');
    expect(progressBar).toHaveClass('top-0');
    expect(progressBar).toHaveClass('z-50');
    
    // Check for any gradient color class
    expect(progressBar.className).toMatch(/bg-gradient-to-r/);
    
    // Check that it contains some orange/brand color
    expect(progressBar.className).toMatch(/from-\[#ff/);
  });
}); 