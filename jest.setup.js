// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js Router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
    };
  },
}));

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Firebase for testing
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn().mockReturnValue({
    name: "[DEFAULT]",
    options: {},
  }),
  getApps: jest.fn().mockReturnValue([]),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({}),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  // Add mocks for other Firestore functions used if necessary
  // e.g., collection: jest.fn(), doc: jest.fn(), getDoc: jest.fn(), setDoc: jest.fn(), etc.
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  // Add mocks for other Storage functions used if necessary
  // e.g., ref: jest.fn(), uploadBytes: jest.fn(), getDownloadURL: jest.fn(), etc.
}));

// Mock sessionStorage for tests
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true
});

// Suppress console errors during tests
global.console = {
  ...console,
  // Uncomment the line below to ignore console errors during tests
  // error: jest.fn(),
  warn: jest.fn(),
}; 