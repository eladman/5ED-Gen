import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../components/ui/Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Test Button</Button>);
    
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toBeInTheDocument();
    
    // Check default styling
    expect(button.className).toContain('bg-primary');
  });
  
  it('renders with custom className', () => {
    render(<Button className="custom-class">Test Button</Button>);
    
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button.className).toContain('custom-class');
  });
  
  it('applies different styles for different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let button = screen.getByRole('button', { name: /primary/i });
    expect(button.className).toContain('bg-primary');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /secondary/i });
    expect(button.className).toContain('bg-secondary');
    
    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button.className).toContain('border');
    
    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button.className).toContain('hover:bg-accent');
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies disabled styles and prevents clicks when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
    expect(button.className).toContain('disabled:opacity-50');
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
  
  it('renders with size variations', () => {
    const { rerender } = render(<Button size="default">Default Size</Button>);
    let button = screen.getByRole('button', { name: /default size/i });
    expect(button.className).toContain('h-10');
    
    rerender(<Button size="sm">Small Size</Button>);
    button = screen.getByRole('button', { name: /small size/i });
    expect(button.className).toContain('h-9');
    
    rerender(<Button size="lg">Large Size</Button>);
    button = screen.getByRole('button', { name: /large size/i });
    expect(button.className).toContain('h-11');
  });
}); 