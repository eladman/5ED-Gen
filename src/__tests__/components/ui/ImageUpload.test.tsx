import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ImageUpload from '@/components/ui/ImageUpload';

// Mock Next Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Pass all props to the img element, including layout and objectFit which are Next.js specific
    const { layout, objectFit, ...imgProps } = props;
    return <img {...imgProps} data-testid="uploaded-image" />;
  },
}));

// Mock file reader
class MockFileReader {
  onloadend: any;
  result: string = '';
  
  readAsDataURL(file: File) {
    // Set result before calling onloadend
    this.result = 'data:image/jpeg;base64,mockbase64data';
    
    // Make this synchronous for testing to avoid timing issues
    if (this.onloadend) {
      this.onloadend({ target: { result: this.result } });
    }
  }
}

// Replace global FileReader with mock
global.FileReader = MockFileReader as any;

describe('ImageUpload Component', () => {
  const mockOnImageChange = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders upload area when no image is selected', () => {
    render(<ImageUpload onImageChange={mockOnImageChange} />);
    
    // Check for upload label and instructions (test for partial text to be more resilient)
    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/PNG, JPG or GIF/i)).toBeInTheDocument();
    
    // Check that file input exists and is hidden
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveClass('hidden');
    
    // Ensure no image preview is shown
    expect(screen.queryByTestId('uploaded-image')).not.toBeInTheDocument();
  });
  
  it('calls onImageChange when a file is selected', () => {
    render(<ImageUpload onImageChange={mockOnImageChange} />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file selection
    act(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    
    // Check if onImageChange was called with the file
    expect(mockOnImageChange).toHaveBeenCalledWith(file);
  });
  
  it('shows image preview after file selection', async () => {
    const { container } = render(<ImageUpload onImageChange={mockOnImageChange} />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file selection within act
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    
    // Wait for the image to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('uploaded-image')).toBeInTheDocument();
    });
    
    // Check if upload instructions are no longer shown
    expect(screen.queryByText(/Click to upload/i)).not.toBeInTheDocument();
  });
  
  it('allows removing the selected image', async () => {
    const { container } = render(<ImageUpload onImageChange={mockOnImageChange} />);
    
    // Create a mock file
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file selection within act
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    
    // Wait for the image and remove button to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('uploaded-image')).toBeInTheDocument();
      
      // The X button should now be visible
      const removeButton = screen.getByRole('button');
      expect(removeButton).toBeInTheDocument();
      
      // Click the remove button
      fireEvent.click(removeButton);
    });
    
    // Check if onImageChange was called with null
    expect(mockOnImageChange).toHaveBeenCalledWith(null);
    
    // Check that we're back to the upload view
    await waitFor(() => {
      expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
    });
  });
}); 