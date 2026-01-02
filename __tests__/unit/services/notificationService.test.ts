import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { notificationService } from '@/services/notificationService';

// Get the mock device from global scope
const mockDevice = (global as any).mockDevice;

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service state
    (notificationService as any).expoPushToken = null;
  });

  describe('initialize', () => {
    it('should initialize notification service successfully', async () => {
      mockDevice.isDevice = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[test123]',
      });

      await notificationService.initialize();

      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    });

    it('should handle permission denial', async () => {
      // Reset the service state first
      (notificationService as any).initialized = false;
      mockDevice.isDevice = true;
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined', // Start with undetermined so it will try to request
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({
        data: 'ExponentPushToken[test123]',
      });

      await notificationService.initialize();

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('checkPermissions', () => {
    it('should return true when permissions are granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const hasPermission = await notificationService.checkPermissions();

      expect(hasPermission).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const hasPermission = await notificationService.checkPermissions();

      expect(hasPermission).toBe(false);
    });
  });

  describe('sendLocalNotification', () => {
    beforeEach(() => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.setNotificationChannelAsync as jest.Mock).mockResolvedValue(undefined);
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');
    });

    it('should send local notification successfully', async () => {
      const notificationData = {
        title: 'Test Notification',
        body: 'Test body',
        type: 'general' as const,
      };

      const notificationId = await notificationService.sendLocalNotification(notificationData);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      expect(notificationId).toBe('notification-id');
    });

    it('should set up Android channel on Android platform', async () => {
      Platform.OS = 'android';
      const notificationData = {
        title: 'Test',
        body: 'Test body',
      };

      await notificationService.sendLocalNotification(notificationData);

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
      });
    });

    it('should throw error when permissions are not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const notificationData = {
        title: 'Test',
        body: 'Test body',
      };

      await expect(
        notificationService.sendLocalNotification(notificationData)
      ).rejects.toThrow('Notification permissions not granted');
    });
  });

  describe('notifyNewQuote', () => {
    beforeEach(() => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');
    });

    it('should send quote notification with correct format', async () => {
      const quoteText = 'Test quote';
      const author = 'Test Author';

      await notificationService.notifyNewQuote(quoteText, author, []);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      const callArgs = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(callArgs.content.title).toBe('📚 New Daily Wisdom');
      expect(callArgs.content.body).toContain(quoteText);
      expect(callArgs.content.body).toContain(author);
    });
  });

  describe('notifyNewVideo', () => {
    beforeEach(() => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');
    });

    it('should send video notification with correct format', async () => {
      const videoTitle = 'Test Video';

      await notificationService.notifyNewVideo(videoTitle, []);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      const callArgs = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(callArgs.content.title).toBe('🎥 New Spiritual Video');
      expect(callArgs.content.body).toContain(videoTitle);
    });
  });

  describe('notifyNewEvent', () => {
    beforeEach(() => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');
    });

    it('should send event notification with correct format', async () => {
      const eventTitle = 'Test Event';
      const eventDate = '2024-12-31';

      await notificationService.notifyNewEvent(eventTitle, eventDate, []);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
      const callArgs = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0];
      expect(callArgs.content.title).toBe('📅 New Event');
      expect(callArgs.content.body).toContain(eventTitle);
    });
  });

  describe('getPushToken', () => {
    it('should return push token when available', () => {
      (notificationService as any).expoPushToken = 'ExponentPushToken[test123]';

      const token = notificationService.getPushToken();

      expect(token).toBe('ExponentPushToken[test123]');
    });

    it('should return null when token not available', () => {
      (notificationService as any).expoPushToken = null;

      const token = notificationService.getPushToken();

      expect(token).toBeNull();
    });
  });
});

