import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock theme provider for tests
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-theme="light">
      {children}
    </div>
  );
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockThemeProvider>
      {children}
    </MockThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data helpers
export const mockProblem = {
  id: 'test-problem-1',
  platform: 'leetcode' as const,
  title: 'Two Sum',
  problemId: 'two-sum',
  difficulty: 'Easy',
  url: 'https://leetcode.com/problems/two-sum/',
  dateSolved: '2024-01-01',
  createdAt: '2024-01-01T00:00:00.000Z',
  notes: 'Hash table solution',
  isReview: false,
  repetition: 0,
  interval: 0,
  nextReviewDate: null,
  topics: ['Array', 'Hash Table'],
  status: 'active' as const,
  companies: ['Google']
};

export const mockContest = {
  id: 'test-contest-1',
  name: 'Weekly Contest 123',
  platform: 'leetcode' as const,
  startTime: '2024-01-07T10:30:00.000Z',
  duration: 90,
  url: 'https://leetcode.com/contest/weekly-contest-123/',
  status: 'scheduled' as const,
  problemsSolved: 0
};

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser'
};

// Helper to mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    store
  };
};

// Helper to wait for async operations
export const waitFor = (callback: () => void | Promise<void>, timeout = 1000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    
    const check = async () => {
      try {
        await callback();
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, 10);
        }
      }
    };
    
    check();
  });
};
