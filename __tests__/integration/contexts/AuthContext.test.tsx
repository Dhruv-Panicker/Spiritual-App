import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { googleSheetsService } from '@/services/googleSheetsService';

// Mock dependencies
jest.mock('@/services/notificationService');
jest.mock('@/services/googleSheetsService');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Use fake timers to control setTimeout
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    // Set up default mocks
    (googleSheetsService.logUserLogin as jest.Mock).mockResolvedValue(true);
    (notificationService.initialize as jest.Mock).mockResolvedValue(undefined);
    (notificationService.getPushToken as jest.Mock).mockReturnValue(null);
    (notificationService.getStoredPushToken as jest.Mock).mockResolvedValue(null);
    (googleSheetsService.savePushToken as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    // Clear all pending timers without running them
    // The push token retry logic creates recursive timers that we don't need to test
    jest.clearAllTimers();
    jest.useRealTimers(); // Restore real timers
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('initial state', () => {
    it('should have null user initially', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.user).toBeFalsy(); // isAuthenticated is just checking if user exists
    });
  });

  describe('login', () => {
    it('should set user on successful login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      (notificationService.getPushToken as jest.Mock).mockReturnValue('token123');

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Clear any pending timers (push token retry logic runs in background)
      jest.clearAllTimers();

      expect(result.current.user).toBeTruthy();
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.user?.isAdmin).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle login failure with invalid email', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await expect(
          result.current.login('invalid-email', 'password123')
        ).rejects.toThrow('Invalid email or password');
      });

      // Clear any pending timers (though there shouldn't be any on failure)
      jest.clearAllTimers();

      expect(result.current.user).toBeNull();
    });
    
    it('should handle login failure with short password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await expect(
          result.current.login('test@example.com', 'ab')
        ).rejects.toThrow('Invalid email or password');
      });

      // Clear any pending timers (though there shouldn't be any on failure)
      jest.clearAllTimers();

      expect(result.current.user).toBeNull();
    });

    it('should initialize notifications on login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Clear any pending timers (push token retry logic runs in background)
      jest.clearAllTimers();

      expect(notificationService.initialize).toHaveBeenCalled();
    });

    it('should detect admin users correctly', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('dhru.panicker@gmail.com', 'password123');
      });

      // Clear any pending timers (push token retry logic runs in background)
      jest.clearAllTimers();

      expect(result.current.user?.isAdmin).toBe(true);
      expect(result.current.user?.email).toBe('dhru.panicker@gmail.com');
    });
  });

  describe('logout', () => {
    it('should clear user on logout', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // First login
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Clear any pending timers (push token retry logic runs in background)
      jest.clearAllTimers();

      expect(result.current.user).toBeTruthy();

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });
});

