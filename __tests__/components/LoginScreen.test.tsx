/**
 * Component tests for LoginScreen
 *
 * Tests cover:
 * - Renders email input and login button
 * - Empty email shows validation error without calling login
 * - Calls auth.login with trimmed email on press
 * - Displays UNVERIFIED_USER error with special message and CTA
 * - Displays generic errors
 * - Calls onGoToSignUp from the UNVERIFIED_USER CTA
 * - Snapshot regression
 */

jest.mock('@/config/env', () => ({
  env: {
    googleSheetsApiKey: 'test',
    googleSheetId: 'test',
    googleAppsScriptWebhookUrl: 'https://test.webhook',
    adminEmails: [],
    prayerRecipientEmail: '',
    appName: 'Test',
    appStoreLink: '',
    playStoreLink: '',
    webAppLink: '',
  },
  validateEnv: jest.fn(),
}));

const mockLogin = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    user: null,
    logout: jest.fn(),
    completeSignUp: jest.fn(),
  }),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '@/components/auth/LoginScreen';

const mockOnGoToSignUp = jest.fn();

// The LoginScreen has two "Log in" texts: a label and a button.
// The button text is the SECOND occurrence in the component tree.
// We use getAllByText to handle this.
function getLoginButton(getAllByText: ReturnType<typeof render>['getAllByText']) {
  return getAllByText('Log in')[1];
}

function renderLoginScreen(withSignUpProp = true) {
  return render(
    <LoginScreen onGoToSignUp={withSignUpProp ? mockOnGoToSignUp : undefined} />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginScreen rendering', () => {
  it('renders the email input', () => {
    const { getByPlaceholderText } = renderLoginScreen();
    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('renders the Log in button (second "Log in" in tree)', () => {
    const { getAllByText } = renderLoginScreen();
    // There is a label "Log in" AND a button text "Log in"
    const elements = getAllByText('Log in');
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the title', () => {
    const { getByText } = renderLoginScreen();
    expect(getByText('SiddhGuru')).toBeTruthy();
  });

  it('renders the "Sign up" link when onGoToSignUp is provided', () => {
    const { getByText } = renderLoginScreen(true);
    expect(getByText(/Don't have an account/i)).toBeTruthy();
  });

  it('does not render "Sign up" link when onGoToSignUp is not provided', () => {
    const { queryByText } = renderLoginScreen(false);
    expect(queryByText(/Don't have an account/i)).toBeNull();
  });
});

describe('LoginScreen validation', () => {
  it('shows error and does not call login when email is empty', async () => {
    const { getAllByText, getByText } = renderLoginScreen();

    fireEvent.press(getLoginButton(getAllByText));

    await waitFor(() => {
      expect(getByText('Please enter your email address.')).toBeTruthy();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('clears error when user starts typing', async () => {
    const { getAllByText, getByPlaceholderText, queryByText } = renderLoginScreen();

    // Trigger error
    fireEvent.press(getLoginButton(getAllByText));
    await waitFor(() =>
      expect(queryByText('Please enter your email address.')).toBeTruthy()
    );

    // Start typing
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');

    expect(queryByText('Please enter your email address.')).toBeNull();
  });
});

describe('LoginScreen login flow', () => {
  it('calls login with trimmed email on press', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    const { getAllByText, getByPlaceholderText } = renderLoginScreen();

    fireEvent.changeText(getByPlaceholderText('Email'), '  user@example.com  ');
    fireEvent.press(getLoginButton(getAllByText));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('shows UNVERIFIED_USER message when login throws that error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('UNVERIFIED_USER'));

    const { getAllByText, getByPlaceholderText, getByText } = renderLoginScreen();

    fireEvent.changeText(getByPlaceholderText('Email'), 'unknown@example.com');
    fireEvent.press(getLoginButton(getAllByText));

    await waitFor(() => {
      expect(
        getByText(/You are an unverified user and have not signed up yet/i)
      ).toBeTruthy();
    });
  });

  it('shows the "Go to Sign up" button for UNVERIFIED_USER error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('UNVERIFIED_USER'));

    const { getAllByText, getByPlaceholderText, getByText } = renderLoginScreen();
    fireEvent.changeText(getByPlaceholderText('Email'), 'unknown@example.com');
    fireEvent.press(getLoginButton(getAllByText));

    await waitFor(() => {
      expect(getByText('Go to Sign up')).toBeTruthy();
    });
  });

  it('calls onGoToSignUp when "Go to Sign up" is pressed', async () => {
    mockLogin.mockRejectedValueOnce(new Error('UNVERIFIED_USER'));

    const { getAllByText, getByPlaceholderText, getByText } = renderLoginScreen();
    fireEvent.changeText(getByPlaceholderText('Email'), 'unknown@example.com');
    fireEvent.press(getLoginButton(getAllByText));

    await waitFor(() => getByText('Go to Sign up'));
    fireEvent.press(getByText('Go to Sign up'));

    expect(mockOnGoToSignUp).toHaveBeenCalledTimes(1);
  });

  it('shows a generic error message for non-UNVERIFIED_USER errors', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Something went wrong'));

    const { getAllByText, getByPlaceholderText, getByText } = renderLoginScreen();
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.press(getLoginButton(getAllByText));

    await waitFor(() => {
      expect(getByText('Something went wrong')).toBeTruthy();
    });
  });

  it('does not show the "Go to Sign up" button for generic errors', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'));

    const { getAllByText, getByPlaceholderText, queryByText } = renderLoginScreen();
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    fireEvent.press(getLoginButton(getAllByText));

    await waitFor(() =>
      expect(queryByText('Network error')).toBeTruthy()
    );
    expect(queryByText('Go to Sign up')).toBeNull();
  });
});

describe('LoginScreen snapshot', () => {
  it('matches snapshot', () => {
    const { toJSON } = renderLoginScreen();
    expect(toJSON()).toMatchSnapshot();
  });
});
