# Academy Page

## Testing

This project uses Jest and React Testing Library for unit and component testing. Tests are automatically run on all pull requests to the main branches using GitHub Actions.

### Running Tests Locally

To run tests locally:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Continuous Integration

The GitHub Actions workflow is set up to:
1. Run on all pull requests and pushes to main, master, and develop branches
2. Install dependencies
3. Run tests
4. Generate and upload test coverage reports

The configuration can be found in `.github/workflows/test.yml`.

### Test Structure

Tests are organized in the `src/__tests__` directory, mirroring the structure of the source code:

- `src/__tests__/components/` - Component tests
- `src/__tests__/lib/` - Utility and hook tests

### Writing Tests

When writing tests, follow these guidelines:

1. Create test files with the `.test.tsx` extension
2. Use descriptive test names
3. Mock external dependencies
4. Test component rendering, interactions, and state changes
5. Follow the Arrange-Act-Assert pattern

Example:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });

  it('handles clicks', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```
