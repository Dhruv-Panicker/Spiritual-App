/**
 * Component tests for VerifyCodeScreen
 *
 * Tests cover:
 * - Renders email address, code input, and Verify button
 * - Shows initial countdown timer
 * - Shows "Resend code" button after countdown reaches zero
 * - Validates code length before verifying
 * - Filters non-digit characters from code input
 * - Successful verification calls completeSignUp
 * - Failed verification shows error message
 * - Resend button calls sendVerificationCode
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

jest.mock('@/services/twoFactorService', () => ({
  twoFactorService: {
    sendVerificationCode: jest.fn(),
    verifyCode: jest.fn(),
    CODE_LENGTH: 6,
    RETRY_COOLDOWN_SECONDS: 30,
  },
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    completeSignUp: mockCompleteSignUp,
    isLoading: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// mockCompleteSignUp must be accessible in the factory above — define it before the mock
const mockCompleteSignUp = jest.fn();

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { VerifyCodeScreen } from '@/components/auth/VerifyCodeScreen';
import { twoFactorService } from '@/services/twoFactorService';

const mockVerifyCode = twoFactorService.verifyCode as jest.Mock;
const mockSendCode = twoFactorService.sendVerificationCode as jest.Mock;

const mockOnBack = jest.fn();

const defaultProps = {
  email: 'user@example.com',
  name: 'User Name',
  onBack: mockOnBack,
};

function renderScreen(props = defaultProps) {
  return render(<VerifyCodeScreen {...props} />);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCompleteSignUp.mockResolvedValue(undefined);
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('VerifyCodeScreen rendering', () => {
  it('renders the email address', () => {
    const { getByText } = renderScreen();
    expect(getByText('user@example.com')).toBeTruthy();
  });

  it('renders the code input', () => {
    const { getByPlaceholderText } = renderScreen();
    expect(getByPlaceholderText('000000')).toBeTruthy();
  });

  it('renders the "Verify & sign in" button', () => {
    const { getByText } = renderScreen();
    expect(getByText('Verify & sign in')).toBeTruthy();
  });

  it('renders the back button', () => {
    const { getByText } = renderScreen();
    expect(getByText(/Back/i)).toBeTruthy();
  });

  it('renders title "Check your email"', () => {
    const { getByText } = renderScreen();
    expect(getByText('Check your email')).toBeTruthy();
  });
});

// ─── Back navigation ──────────────────────────────────────────────────────────

describe('VerifyCodeScreen back navigation', () => {
  it('calls onBack when back button is pressed', () => {
    const { getByText } = renderScreen();

    fireEvent.press(getByText(/Back/i));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});

// ─── Countdown timer ──────────────────────────────────────────────────────────

describe('VerifyCodeScreen countdown timer', () => {
  it('shows countdown text initially (not the Resend button)', () => {
    const { getByText, queryByText } = renderScreen();

    expect(getByText(/Resend code available in/i)).toBeTruthy();
    expect(queryByText('Resend code')).toBeNull();
  });

  it('shows "Resend code" button when countdown reaches zero', async () => {
    const { getByText } = renderScreen();

    act(() => {
      jest.advanceTimersByTime(31000);
    });

    await waitFor(() => {
      expect(getByText('Resend code')).toBeTruthy();
    });
  });
});

// ─── Code validation ──────────────────────────────────────────────────────────

describe('VerifyCodeScreen code validation', () => {
  it('shows error when code is less than 6 digits', async () => {
    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('000000'), '123');
    fireEvent.press(getByText('Verify & sign in'));

    expect(getByText(/Please enter the 6-digit code/i)).toBeTruthy();
    expect(mockVerifyCode).not.toHaveBeenCalled();
  });

  it('only accepts digit characters (strips letters)', () => {
    const { getByPlaceholderText } = renderScreen();
    const input = getByPlaceholderText('000000');

    fireEvent.changeText(input, '12a34b');

    // Letters stripped → '1234'
    expect(input.props.value).toBe('1234');
  });

  it('limits input to CODE_LENGTH (6) characters', () => {
    const { getByPlaceholderText } = renderScreen();
    const input = getByPlaceholderText('000000');

    fireEvent.changeText(input, '1234567890');

    expect(input.props.value).toBe('123456');
  });
});

// ─── Verification flow ────────────────────────────────────────────────────────

describe('VerifyCodeScreen verification flow', () => {
  it('calls verifyCode and then completeSignUp on success', async () => {
    mockVerifyCode.mockResolvedValueOnce({ success: true });

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('000000'), '123456');
    fireEvent.press(getByText('Verify & sign in'));

    await waitFor(() => {
      expect(mockVerifyCode).toHaveBeenCalledWith('user@example.com', '123456');
      expect(mockCompleteSignUp).toHaveBeenCalledWith('user@example.com', 'User Name');
    });
  });

  it('shows error message when verification fails', async () => {
    mockVerifyCode.mockResolvedValueOnce({
      success: false,
      error: 'Invalid or expired code',
    });

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('000000'), '999999');
    fireEvent.press(getByText('Verify & sign in'));

    await waitFor(() => {
      expect(getByText('Invalid or expired code')).toBeTruthy();
    });
    expect(mockCompleteSignUp).not.toHaveBeenCalled();
  });

  it('shows fallback error when verifyCode returns no error message', async () => {
    mockVerifyCode.mockResolvedValueOnce({ success: false });

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('000000'), '000000');
    fireEvent.press(getByText('Verify & sign in'));

    await waitFor(() => {
      expect(getByText(/Invalid or expired code/i)).toBeTruthy();
    });
  });

  it('shows generic error when an exception is thrown', async () => {
    mockVerifyCode.mockRejectedValueOnce(new Error('Network error'));

    const { getByText, getByPlaceholderText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('000000'), '123456');
    fireEvent.press(getByText('Verify & sign in'));

    await waitFor(() => {
      expect(getByText(/Verification failed/i)).toBeTruthy();
    });
  });

  it('clears error when user changes the code input', async () => {
    mockVerifyCode.mockResolvedValueOnce({ success: false, error: 'Wrong code' });

    const { getByText, getByPlaceholderText, queryByText } = renderScreen();

    fireEvent.changeText(getByPlaceholderText('000000'), '000000');
    fireEvent.press(getByText('Verify & sign in'));

    await waitFor(() => expect(getByText('Wrong code')).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText('000000'), '111111');

    expect(queryByText('Wrong code')).toBeNull();
  });
});

// ─── Resend code ──────────────────────────────────────────────────────────────

describe('VerifyCodeScreen resend code', () => {
  it('calls sendVerificationCode when "Resend code" is pressed', async () => {
    mockSendCode.mockResolvedValueOnce({ success: true });

    const { getByText } = renderScreen();

    act(() => {
      jest.advanceTimersByTime(31000);
    });

    await waitFor(() => expect(getByText('Resend code')).toBeTruthy());

    fireEvent.press(getByText('Resend code'));

    await waitFor(() => {
      expect(mockSendCode).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('resets the countdown to non-zero after successful resend', async () => {
    mockSendCode.mockResolvedValueOnce({ success: true });

    const { getByText, queryByText } = renderScreen();

    act(() => {
      jest.advanceTimersByTime(31000);
    });

    await waitFor(() => expect(getByText('Resend code')).toBeTruthy());

    fireEvent.press(getByText('Resend code'));

    await waitFor(() => {
      // Countdown should restart — "Resend code" button should disappear
      expect(queryByText('Resend code')).toBeNull();
    });
  });

  it('shows error when resend fails', async () => {
    mockSendCode.mockResolvedValueOnce({
      success: false,
      error: 'Cannot resend now',
    });

    const { getByText } = renderScreen();

    act(() => {
      jest.advanceTimersByTime(31000);
    });

    await waitFor(() => expect(getByText('Resend code')).toBeTruthy());

    fireEvent.press(getByText('Resend code'));

    await waitFor(() => {
      expect(getByText('Cannot resend now')).toBeTruthy();
    });
  });
});

// ─── Snapshot ─────────────────────────────────────────────────────────────────

describe('VerifyCodeScreen snapshot', () => {
  it('matches snapshot', () => {
    const { toJSON } = renderScreen();
    expect(toJSON()).toMatchSnapshot();
  });
});
