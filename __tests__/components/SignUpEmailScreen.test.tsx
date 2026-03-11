/**
 * Component tests for SignUpEmailScreen
 *
 * Tests cover:
 * - Renders name and email inputs and Continue button
 * - Validates empty name
 * - Validates empty email
 * - Validates invalid email format
 * - Checks for duplicate email in userbase and shows error
 * - On success, calls onCodeSent with email and name
 * - Shows error returned from twoFactorService
 * - Back button calls onBack
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

// Mock the services directly in the factory using jest.fn()
jest.mock('@/services/googleSheetsService', () => ({
  googleSheetsService: {
    checkUserInUserbase: jest.fn(),
    addToUserbase: jest.fn(),
    logUserLogin: jest.fn(),
    savePushToken: jest.fn(),
  },
}));

jest.mock('@/services/twoFactorService', () => ({
  twoFactorService: {
    sendVerificationCode: jest.fn(),
    verifyCode: jest.fn(),
    CODE_LENGTH: 6,
    RETRY_COOLDOWN_SECONDS: 30,
  },
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SignUpEmailScreen } from '@/components/auth/SignUpEmailScreen';
import { googleSheetsService } from '@/services/googleSheetsService';
import { twoFactorService } from '@/services/twoFactorService';

// Get typed references to the mock functions
const mockCheckUser = googleSheetsService.checkUserInUserbase as jest.Mock;
const mockSendCode = twoFactorService.sendVerificationCode as jest.Mock;

const mockOnBack = jest.fn();
const mockOnCodeSent = jest.fn();

function renderScreen() {
  return render(
    <SignUpEmailScreen onBack={mockOnBack} onCodeSent={mockOnCodeSent} />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SignUpEmailScreen rendering', () => {
  it('renders the name input', () => {
    const { getByPlaceholderText } = renderScreen();
    expect(getByPlaceholderText('First and last name')).toBeTruthy();
  });

  it('renders the email input', () => {
    const { getByPlaceholderText } = renderScreen();
    expect(getByPlaceholderText('name@example.com')).toBeTruthy();
  });

  it('renders the Continue button', () => {
    const { getByText } = renderScreen();
    expect(getByText('Continue')).toBeTruthy();
  });

  it('renders the back button', () => {
    const { getByText } = renderScreen();
    expect(getByText(/Back/i)).toBeTruthy();
  });

  it('renders the screen title', () => {
    const { getByText } = renderScreen();
    expect(getByText('Sign Up with Email')).toBeTruthy();
  });
});

describe('SignUpEmailScreen back navigation', () => {
  it('calls onBack when back button is pressed', () => {
    const { getByText } = renderScreen();

    fireEvent.press(getByText(/Back/i));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});

describe('SignUpEmailScreen validation', () => {
  it('shows error for empty name', async () => {
    const { getByText } = renderScreen();

    fireEvent.press(getByText('Continue'));

    // Validation is synchronous
    expect(getByText('Please enter your first and last name.')).toBeTruthy();
    expect(mockCheckUser).not.toHaveBeenCalled();
  });

  it('shows error for empty email', async () => {
    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('First and last name'), 'John Doe');
    fireEvent.press(getByText('Continue'));

    expect(getByText('Please enter your email address.')).toBeTruthy();
    expect(mockCheckUser).not.toHaveBeenCalled();
  });

  it('shows error for invalid email format', async () => {
    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('First and last name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'notanemail');
    fireEvent.press(getByText('Continue'));

    expect(getByText(/Please enter a valid email address/i)).toBeTruthy();
    expect(mockCheckUser).not.toHaveBeenCalled();
  });

  it('clears error when user starts typing', async () => {
    const { getByText, getByPlaceholderText, queryByText } = renderScreen();

    fireEvent.press(getByText('Continue'));
    expect(getByText('Please enter your first and last name.')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('First and last name'), 'John');
    expect(queryByText('Please enter your first and last name.')).toBeNull();
  });
});

describe('SignUpEmailScreen duplicate email check', () => {
  it('shows error when email is already in userbase', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: true });

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('First and last name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'existing@example.com');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText(/This email is already in use/i)).toBeTruthy();
    });
    expect(mockSendCode).not.toHaveBeenCalled();
  });
});

describe('SignUpEmailScreen success flow', () => {
  it('calls onCodeSent with lowercase email and trimmed name on success', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: false });
    mockSendCode.mockResolvedValueOnce({ success: true });

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('First and last name'), '  Jane Doe  ');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'JANE@EXAMPLE.COM');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(mockOnCodeSent).toHaveBeenCalledWith('jane@example.com', 'Jane Doe');
    });
  });

  it('calls sendVerificationCode with lowercase email', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: false });
    mockSendCode.mockResolvedValueOnce({ success: true });

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('First and last name'), 'Jane Doe');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'Jane@Example.com');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(mockSendCode).toHaveBeenCalledWith('jane@example.com');
    });
  });
});

describe('SignUpEmailScreen service error handling', () => {
  it('shows error returned by twoFactorService', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: false });
    mockSendCode.mockResolvedValueOnce({
      success: false,
      error: 'Email service unavailable',
    });

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('First and last name'), 'Jane Doe');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'jane@example.com');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Email service unavailable')).toBeTruthy();
    });
    expect(mockOnCodeSent).not.toHaveBeenCalled();
  });

  it('shows fallback error when service returns no error message', async () => {
    mockCheckUser.mockResolvedValueOnce({ exists: false });
    mockSendCode.mockResolvedValueOnce({ success: false });

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('First and last name'), 'Jane Doe');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'jane@example.com');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText(/Could not send code/i)).toBeTruthy();
    });
  });

  it('shows generic error when an exception is thrown', async () => {
    mockCheckUser.mockRejectedValueOnce(new Error('Unexpected error'));

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('First and last name'), 'Jane Doe');
    fireEvent.changeText(getByPlaceholderText('name@example.com'), 'jane@example.com');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText(/Something went wrong/i)).toBeTruthy();
    });
  });
});

describe('SignUpEmailScreen snapshot', () => {
  it('matches snapshot', () => {
    const { toJSON } = renderScreen();
    expect(toJSON()).toMatchSnapshot();
  });
});
