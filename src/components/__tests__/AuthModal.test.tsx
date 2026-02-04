import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../src/test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import AuthModal from '../AuthModal';
import ApiService from '../../services/api';

// Mock ApiService
vi.mock('../../services/api', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn()
  }
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

describe('AuthModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnAuthSuccess = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onAuthSuccess: mockOnAuthSuccess
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form by default', () => {
    render(<AuthModal {...defaultProps} />);

    expect(screen.getByText('Welcome to Problem Tracker')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('should switch to register form when register tab is clicked', async () => {
    const user = userEvent.setup();
    render(<AuthModal {...defaultProps} />);

    await user.click(screen.getByRole('tab', { name: 'Register' }));

    expect(screen.getByRole('tab', { name: 'Register', selected: true })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      token: 'mock-token',
      user: { id: '123', email: 'test@example.com', username: 'testuser' }
    };

    vi.mocked(ApiService.login).mockResolvedValue(mockAuthResponse);

    render(<AuthModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(ApiService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockOnAuthSuccess).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should handle login error', async () => {
    const user = userEvent.setup();
    vi.mocked(ApiService.login).mockRejectedValue(new Error('Invalid credentials'));

    render(<AuthModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should handle successful registration', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      token: 'mock-token',
      user: { id: '123', email: 'new@example.com', username: 'newuser' }
    };

    vi.mocked(ApiService.register).mockResolvedValue(mockAuthResponse);

    render(<AuthModal {...defaultProps} />);

    await user.click(screen.getByRole('tab', { name: 'Register' }));
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Username'), 'newuser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(ApiService.register).toHaveBeenCalledWith('new@example.com', 'newuser', 'password123');
      expect(mockOnAuthSuccess).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<AuthModal {...defaultProps} />);

    await user.click(screen.getByRole('tab', { name: 'Register' }));
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'differentpassword');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should show error for short password', async () => {
    const user = userEvent.setup();
    render(<AuthModal {...defaultProps} />);

    await user.click(screen.getByRole('tab', { name: 'Register' }));
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), '123');
    await user.type(screen.getByLabelText('Confirm Password'), '123');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<AuthModal {...defaultProps} />);

    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should handle offline mode selection', async () => {
    const user = userEvent.setup();
    const mockLocalStorage = {
      setItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    render(<AuthModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Use Offline Mode' }));

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('offline-mode', 'true');
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnAuthSuccess).toHaveBeenCalled();
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    vi.mocked(ApiService.login).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AuthModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    expect(loginButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /Login/ })).toBeInTheDocument();
  });

  it('should show loading state during registration', async () => {
    const user = userEvent.setup();
    vi.mocked(ApiService.register).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AuthModal {...defaultProps} />);

    await user.click(screen.getByRole('tab', { name: 'Register' }));
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Username'), 'testuser');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    
    const registerButton = screen.getByRole('button', { name: 'Register' });
    await user.click(registerButton);

    expect(registerButton).toBeDisabled();
  });

  it('should not render when open is false', () => {
    render(<AuthModal {...defaultProps} open={false} />);

    expect(screen.queryByText('Welcome to Problem Tracker')).not.toBeInTheDocument();
  });

  it('should clear form data after successful login', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      token: 'mock-token',
      user: { id: '123', email: 'test@example.com', username: 'testuser' }
    };

    vi.mocked(ApiService.login).mockResolvedValue(mockAuthResponse);

    render(<AuthModal {...defaultProps} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalled();
    });

    // Form should be cleared after successful login
    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
  });
});
