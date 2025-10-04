import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications should be handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationData {
  type: 'quote' | 'reflection' | 'event' | 'test';
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<void> {
    try {
      console.log('🔔 Initializing notification service...');
      
      // Request permissions
      const hasPermission = await this.requestPermissions();
      
      if (hasPermission) {
        // Get push token
        await this.registerForPushNotifications();
        
        // Set up listeners
        this.setupNotificationListeners();
        
        console.log('✅ Notification service initialized successfully');
      } else {
        console.log('⚠️ Notification permissions denied');
      }
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
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
        console.log('❌ Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  private async registerForPushNotifications(): Promise<void> {
    try {
      if (Device.isDevice) {
        // Try to get push token without projectId first
        let token;
        try {
          // First try with projectId if it exists
          const projectId = Constants.expoConfig?.extra?.eas?.projectId;
          if (projectId) {
            token = await Notifications.getExpoPushTokenAsync({
              projectId: projectId,
            });
          } else {
            // Try without projectId for development
            token = await Notifications.getExpoPushTokenAsync();
          }
          
          this.expoPushToken = token.data;
          console.log('🎫 Expo Push Token:', this.expoPushToken);
          
          // Store token for later use
          await AsyncStorage.setItem('@expo_push_token', this.expoPushToken);
          
          // TODO: Send token to your backend server here
          // await this.sendTokenToServer(this.expoPushToken);
          
        } catch (tokenError) {
          console.log('⚠️ Push token not available in development mode');
          console.log('💡 Push notifications will work when you build the app for production');
          this.expoPushToken = null;
        }
        
      } else {
        console.log('❌ Must use physical device for push notifications');
      }
    } catch (error) {
      console.error('❌ Error getting push token:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Handle notifications that are received while the app is running
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
    
    switch (data.type) {
      case 'quote':
        // Navigate to quotes tab
        console.log('📚 Navigating to quotes...');
        break;
      case 'reflection':
        // Navigate to reflection or quotes tab
        console.log('💭 Navigating to reflection...');
        break;
      case 'event':
        // Navigate to calendar tab
        console.log('📅 Navigating to calendar...');
        break;
      case 'test':
        console.log('🧪 Test notification tapped');
        break;
      default:
        console.log('📱 Opening main app');
    }
  }

  // Schedule a local notification
  async scheduleLocalNotification(notificationData: NotificationData, triggerSeconds: number = 5): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Guru Darshan',
          body: notificationData.body,
          data: {
            type: notificationData.type,
            ...notificationData.data,
          },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
        },
      });

      console.log('📅 Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Error scheduling local notification:', error);
      return null;
    }
  }

  // Send push notification (for testing - normally done by server)
  async sendTestPushNotification(): Promise<boolean> {
    if (!this.expoPushToken) {
      console.log('❌ No push token available');
      return false;
    }

    try {
      const message = {
        to: this.expoPushToken,
        sound: 'default',
        title: 'Guru Darshan',
        body: 'Test notification from your spiritual app!',
        data: { 
          type: 'test',
          timestamp: new Date().toISOString()
        },
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('📤 Push notification sent:', result);
      
      return result.data?.status === 'ok';
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      return false;
    }
  }

  // Send daily quote notification
  async sendDailyQuoteNotification(quote: string, author: string): Promise<boolean> {
    if (!this.expoPushToken) {
      console.log('❌ No push token available');
      return false;
    }

    try {
      const message = {
        to: this.expoPushToken,
        sound: 'default',
        title: 'Guru Darshan',
        body: `Daily Wisdom: "${quote}" - ${author}`,
        data: { 
          type: 'quote',
          quote,
          author,
          timestamp: new Date().toISOString()
        },
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      return result.data?.status === 'ok';
    } catch (error) {
      console.error('❌ Error sending daily quote notification:', error);
      return false;
    }
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

  // Get current push token
  getPushToken(): string | null {
    return this.expoPushToken;
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

  // Schedule daily notifications (for future use)
  async scheduleDailyQuoteReminder(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Guru Darshan',
          body: 'Daily Spiritual Wisdom Awaits - Your morning quote is ready to inspire your day',
          data: { type: 'quote' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 7,
          minute: 0,
          repeats: true,
        },
      });

      console.log('📅 Daily quote reminder scheduled for 7:00 AM');
    } catch (error) {
      console.error('❌ Error scheduling daily reminder:', error);
    }
  }

  async scheduleEveningReflection(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Guru Darshan',
          body: 'Evening Reflection Time - Take a moment to reflect on today\'s spiritual journey',
          data: { type: 'reflection' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });

      console.log('📅 Evening reflection scheduled for 8:00 PM');
    } catch (error) {
      console.error('❌ Error scheduling evening reflection:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;