import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: jest.fn(),
}));

// Mock LoginScreen to avoid complex component dependencies
jest.mock('@/components/auth/LoginScreen', () => {
  const React = require('react');
  return {
    LoginScreen: () => React.createElement('View', { testID: 'login-screen' }, 'Login Screen'),
  };
});

// Mock SPIRITUAL_COLORS used by AuthGuard
jest.mock('@/constants/SpiritualColors', () => ({
  SPIRITUAL_COLORS: {
    primary: '#FF6B35',
    background: '#FFFFFF',
  },
}));

describe('AuthGuard', () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@example.com', name: 'Test User' },
      isLoading: false,
    });

    const { getByText } = render(
      <AuthGuard>
        <Text>Protected Content</Text>
      </AuthGuard>
    );

    expect(getByText('Protected Content')).toBeTruthy();
  });

  it('should render LoginScreen when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });

    const { getByTestID, queryByText } = render(
      <AuthGuard>
        <Text>Protected Content</Text>
      </AuthGuard>
    );

    // LoginScreen should be rendered
    expect(getByTestID('login-screen')).toBeTruthy();
    // Protected content should not be visible when not authenticated
    expect(queryByText('Protected Content')).toBeNull();
  });
});

