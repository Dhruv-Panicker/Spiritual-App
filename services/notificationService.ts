import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications should be handled when the app is running
// IMPORTANT: This ensures notifications show even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('🔔 Notification received in handler:', notification.request.content.title);
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

interface NotificationData {
  type: 'quote' | 'video' | 'event' | 'general';
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🔔 Notification service already initialized, skipping...');
      return;
    }

    try {
      console.log('🔔 Initializing notification service...');
      
      // Request permissions
      const hasPermission = await this.requestPermissions();
      console.log('  Permission result:', hasPermission);
      
      if (hasPermission) {
        // Get push token
        console.log('  Registering for push notifications...');
        await this.registerForPushNotifications();
        
        // Set up listeners
        console.log('  Setting up notification listeners...');
        this.setupNotificationListeners();
        
        console.log('✅ Notification service initialized successfully');
        this.initialized = true;
      } else {
        console.log('⚠️ Notification permissions denied - local notifications may still work');
        // Even without permissions, we can still mark as initialized for local notifications
        this.initialized = true;
      }
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
      // Mark as initialized even on error so we can still try local notifications
      this.initialized = true;
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('❌ Permission not granted for push notifications');
          return false;
        }

        console.log('✅ Notification permissions granted');
        return true;
      } else {
        console.log('⚠️ Using simulator - push notifications require a physical device');
        // For simulator, we can still use local notifications
        return true;
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  private async registerForPushNotifications(): Promise<void> {
    try {
      if (Device.isDevice) {
        let token;
        try {
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          if (projectId) {
            token = await Notifications.getExpoPushTokenAsync({
              projectId: projectId,
            });
          } else {
            token = await Notifications.getExpoPushTokenAsync();
          }
          
          this.expoPushToken = token.data;
          console.log('🎫 Expo Push Token:', this.expoPushToken);
          
          await AsyncStorage.setItem('@expo_push_token', this.expoPushToken);
        } catch (tokenError) {
          console.log('⚠️ Push token not available - using local notifications only');
          this.expoPushToken = null;
        }
      }
    } catch (error) {
      console.error('❌ Error getting push token:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Handle notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('🔔 Notification received:', notification);
      }
    );

    // Handle user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        const notificationData = response.notification.request.content.data;
        if (notificationData?.type) {
          this.handleNotificationTap(notificationData);
        }
      }
    );
  }

  private handleNotificationTap(data: any): void {
    console.log('🎯 Handling notification tap:', data);
    // Navigation can be handled here in the future
  }

  // Public method: Check if permissions are granted
  async checkPermissions(): Promise<boolean> {
    try {
      console.log('🔍 Checking notification permissions...');
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      console.log('  Current status:', status);
      
      if (status === 'granted') {
        console.log('✅ Permissions already granted');
        return true;
      }
      
      if (status === 'denied' && !canAskAgain) {
        console.log('❌ Permissions denied and cannot ask again - user must enable in settings');
        return false;
      }
      
      console.log('⚠️ Permissions not granted, requesting...');
      const { status: newStatus } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: false,
        },
      });
      
      console.log('  New status after request:', newStatus);
      return newStatus === 'granted';
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      return false;
    }
  }

  // Send local notification immediately (for testing and quick notifications)
  async sendLocalNotification(notificationData: NotificationData): Promise<string | null> {
    try {
      console.log('📤 Preparing to send local notification...');
      console.log('  Title:', notificationData.title);
      console.log('  Body:', notificationData.body);
      console.log('  Type:', notificationData.type || 'general');
      console.log('  Platform:', Platform.OS);
      
      // Ensure permissions are granted
      console.log('🔍 Checking permissions...');
      const hasPermission = await this.checkPermissions();
      console.log('  Permission status:', hasPermission);
      
      if (!hasPermission) {
        const errorMsg = 'Notification permissions not granted';
        console.error('❌ Cannot send notification:', errorMsg);
        throw new Error(errorMsg);
      }

      // Ensure Android channel is set up
      if (Platform.OS === 'android') {
        console.log('📱 Setting up Android notification channel...');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          enableLights: true,
        });
        console.log('✅ Android channel set up');
      }

      // For iOS, ensure we have proper configuration
      if (Platform.OS === 'ios') {
        console.log('📱 iOS platform - ensuring proper notification setup...');
      }

      console.log('📤 Scheduling notification with trigger: immediate...');

      // Try immediate trigger first (works better on iOS)
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title || 'Spiritual Wisdom',
          body: notificationData.body,
          sound: 'default',
          badge: 1,
          data: {
            type: notificationData.type || 'general',
            ...notificationData.data,
          },
        },
        trigger: null, // null = immediate (iOS handles this better with our handler)
      });

      console.log('✅ Local notification scheduled successfully!');
      console.log('  Notification ID:', notificationId);
      console.log('  Platform:', Platform.OS);
      console.log('  Trigger: immediate (null)');
      
      return notificationId;
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || 'Unknown error';
      console.error('❌ Error sending local notification:', errorMsg);
      console.error('  Error type:', error?.constructor?.name);
      if (error?.stack) {
        console.error('  Stack trace:', error.stack);
      }
      console.error('  Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error; // Re-throw so caller can handle it
    }
  }

  // Send push notification to all users (requires backend or Expo push service)
  async sendPushNotification(notificationData: NotificationData, pushTokens: string[]): Promise<boolean> {
    if (!pushTokens || pushTokens.length === 0) {
      console.log('📱 Using LOCAL notification (works immediately, no backend needed)');
      try {
        const notificationId = await this.sendLocalNotification(notificationData);
        return notificationId !== null;
      } catch (error) {
        console.error('❌ Failed to send local notification:', error);
        return false;
      }
    }

    try {
      const messages = pushTokens.map(token => ({
        to: token,
        sound: 'default',
        title: notificationData.title || 'Spiritual Wisdom',
        body: notificationData.body,
        data: {
          type: notificationData.type,
          ...notificationData.data,
          timestamp: new Date().toISOString(),
        },
      }));

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      console.log('📤 Push notifications sent:', result);
      
      // Check if at least one notification was sent successfully
      if (Array.isArray(result.data)) {
        return result.data.some((item: any) => item.status === 'ok');
      }
      return result.data?.status === 'ok';
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      // Fallback to local notification
      return (await this.sendLocalNotification(notificationData)) !== null;
    }
  }

  // Helper method: Send notification for new quote
  async notifyNewQuote(quoteText: string, author: string, pushTokens: string[] = []): Promise<boolean> {
    const truncatedQuote = quoteText.length > 60 ? quoteText.substring(0, 57) + '...' : quoteText;
    return await this.sendPushNotification(
      {
        type: 'quote',
        title: '📚 New Daily Wisdom',
        body: `"${truncatedQuote}" - ${author}`,
        data: { quote: quoteText, author },
      },
      pushTokens
    );
  }

  // Helper method: Send notification for new video
  async notifyNewVideo(videoTitle: string, pushTokens: string[] = []): Promise<boolean> {
    return await this.sendPushNotification(
      {
        type: 'video',
        title: '🎥 New Spiritual Video',
        body: `New video available: ${videoTitle}`,
        data: { title: videoTitle },
      },
      pushTokens
    );
  }

  // Helper method: Send notification for new event
  async notifyNewEvent(eventTitle: string, eventDate: string, pushTokens: string[] = []): Promise<boolean> {
    const date = new Date(eventDate).toLocaleDateString();
    return await this.sendPushNotification(
      {
        type: 'event',
        title: '📅 New Event',
        body: `${eventTitle} - ${date}`,
        data: { title: eventTitle, date: eventDate },
      },
      pushTokens
    );
  }

  // Helper method: Send general notification
  async notifyGeneral(message: string, pushTokens: string[] = []): Promise<boolean> {
    return await this.sendPushNotification(
      {
        type: 'general',
        title: '🙏 Spiritual Wisdom',
        body: message,
      },
      pushTokens
    );
  }

  // Get current push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Get stored push token
  async getStoredPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('@expo_push_token');
    } catch (error) {
      console.error('Error getting stored push token:', error);
      return null;
    }
  }

  // Clean up listeners
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

