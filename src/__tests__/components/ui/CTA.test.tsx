import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CTA from '@/components/ui/CTA';

describe('CTA Component', () => {
  it('renders the heading correctly', () => {
    render(<CTA />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('מוכן להתחיל את המסע שלך?');
  });
  
  it('renders the description text', () => {
    render(<CTA />);
    
    const description = screen.getByText(/הצטרף לאלפי מתאמנים שכבר משיגים תוצאות מדהימות עם חמש אצבעות/i);
    expect(description).toBeInTheDocument();
  });
  
  it('renders two call-to-action buttons', () => {
    render(<CTA />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    const startButton = screen.getByText('התחל עכשיו');
    expect(startButton).toBeInTheDocument();
    
    const consultationButton = screen.getByText('תיאום שיחת היכרות');
    expect(consultationButton).toBeInTheDocument();
  });
  
  it('has correct styling classes', () => {
    render(<CTA />);
    
    const section = screen.getByTestId('cta-section');
    expect(section).toHaveClass('section-padding');
    expect(section).toHaveClass('bg-[#ff8714]');
    
    const startButton = screen.getByText('התחל עכשיו');
    expect(startButton).toHaveClass('bg-white');
    expect(startButton).toHaveClass('text-[#ff8714]');
    
    const consultationButton = screen.getByText('תיאום שיחת היכרות');
    expect(consultationButton).toHaveClass('bg-transparent');
    expect(consultationButton).toHaveClass('border-2');
  });
}); 