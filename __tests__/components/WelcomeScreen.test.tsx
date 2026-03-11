/**
 * Component tests for WelcomeScreen
 *
 * Tests cover:
 * - Renders key text elements (title, tagline, buttons)
 * - Pressing "Sign Up" calls onSignUp callback
 * - Pressing "Log in" calls onLogIn callback
 * - Snapshot regression test
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WelcomeScreen } from '@/components/auth/WelcomeScreen';

// expo-linear-gradient is already mocked globally in jest.setup.ts
// expo-constants is not needed here since WelcomeScreen has no env dependency

const mockOnSignUp = jest.fn();
const mockOnLogIn = jest.fn();

function renderWelcomeScreen() {
  return render(
    <WelcomeScreen onSignUp={mockOnSignUp} onLogIn={mockOnLogIn} />
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('WelcomeScreen rendering', () => {
  it('renders "Sri Sidheshwar" text', () => {
    const { getByText } = renderWelcomeScreen();
    expect(getByText('Sri Sidheshwar')).toBeTruthy();
  });

  it('renders "SiddhGuru" heading', () => {
    const { getByText } = renderWelcomeScreen();
    expect(getByText('SiddhGuru')).toBeTruthy();
  });

  it('renders the Sign Up button', () => {
    const { getByText } = renderWelcomeScreen();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('renders the Log in link', () => {
    const { getByText } = renderWelcomeScreen();
    expect(getByText(/Log in/i)).toBeTruthy();
  });

  it('renders the footer tagline', () => {
    const { getByText } = renderWelcomeScreen();
    expect(getByText('Sri SiddhGuru · Vedic Wisdom · Ancient Path')).toBeTruthy();
  });
});

describe('WelcomeScreen interactions', () => {
  it('calls onSignUp when Sign Up button is pressed', () => {
    const { getByText } = renderWelcomeScreen();

    fireEvent.press(getByText('Sign Up'));

    expect(mockOnSignUp).toHaveBeenCalledTimes(1);
    expect(mockOnLogIn).not.toHaveBeenCalled();
  });

  it('calls onLogIn when the Log in link is pressed', () => {
    const { getByText } = renderWelcomeScreen();

    // The full text is "Already have an account? Log in"
    fireEvent.press(getByText(/Already have an account/i));

    expect(mockOnLogIn).toHaveBeenCalledTimes(1);
    expect(mockOnSignUp).not.toHaveBeenCalled();
  });
});

describe('WelcomeScreen snapshot', () => {
  it('matches snapshot', () => {
    const { toJSON } = renderWelcomeScreen();
    expect(toJSON()).toMatchSnapshot();
  });
});
