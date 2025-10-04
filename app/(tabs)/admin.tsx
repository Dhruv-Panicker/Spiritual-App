import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TabView, TabBar } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useQuotes } from '../../contexts/QuotesContext';
import { useVideos } from '../../contexts/VideosContext';
import { SPIRITUAL_COLORS } from '../../constants/SpiritualColors';
import { notificationService } from '../../services/notificationService';

const { width } = Dimensions.get('window');

// Update function name
export default function AdminScreen() {
  const { user } = useAuth();
  const { addQuote } = useQuotes();
  const { addVideo } = useVideos();
  
  // Protect admin screen
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace('/');
      return;
    }
  }, [user]);

  // Load push token
  useEffect(() => {
    const loadPushToken = async () => {
      const token = notificationService.getPushToken();
      setPushToken(token);
    };
    loadPushToken();
  }, []);

  if (!user?.isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied</Text>
      </View>
    );
  }

  // Tab navigation state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'quotes', title: 'Quotes', icon: 'chatbubble' },
    { key: 'videos', title: 'Videos', icon: 'videocam' },
    { key: 'notifications', title: 'Notifications', icon: 'notifications' },
  ]);

  // Quote form states
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [reflectionQuestion, setReflectionQuestion] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Video form states
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);

  // Notification states
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  const handleQuoteSubmit = async () => {
    if (!quoteText.trim() || !quoteAuthor.trim()) {
      Alert.alert('Error', 'Please fill in both quote and author fields');
      return;
    }

    setIsSubmittingQuote(true);
    
    try {
      // Add the quote to the context
      console.log('🎯 Admin panel calling addQuote with:', {
        text: quoteText.trim(),
        author: quoteAuthor.trim(),
        category: reflectionQuestion.trim() || 'General'
      });
      
      addQuote({
        text: quoteText.trim(),
        author: quoteAuthor.trim(),
        category: reflectionQuestion.trim() || 'General'
      });
      
      Toast.show({
        type: 'success',
        text1: 'Quote Published',
        text2: 'The quote has been added to the quotes page.',
      });
      
      // Clear form
      setQuoteText('');
      setQuoteAuthor('');
      setReflectionQuestion('');
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to publish quote. Please try again.',
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Utility function to extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleVideoSubmit = async () => {
    if (!videoTitle.trim() || !videoDescription.trim() || !youtubeUrl.trim()) {
      Alert.alert('Error', 'Please fill in all video fields');
      return;
    }

    const youtubeId = extractYouTubeId(youtubeUrl.trim());
    if (!youtubeId) {
      Alert.alert('Error', 'Please enter a valid YouTube URL (regular video, shorts, or embed link)');
      return;
    }

    setIsSubmittingVideo(true);
    
    try {
      // Add the video to the context
      addVideo({
        title: videoTitle.trim(),
        description: videoDescription.trim(),
        youtubeId: youtubeId
      });
      
      Toast.show({
        type: 'success',
        text1: 'Video Added',
        text2: 'The video has been added to the videos page.',
      });
      
      // Clear form
      setVideoTitle('');
      setVideoDescription('');
      setYoutubeUrl('');
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add video. Please try again.',
      });
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  // Notification handlers
  const handleSendTestNotification = async () => {
    setIsSendingNotification(true);
    
    try {
      let success = false;
      
      if (pushToken) {
        // Try push notification if token is available
        success = await notificationService.sendTestPushNotification();
      } else {
        // Fall back to local notification for testing
        await notificationService.scheduleLocalNotification({
          type: 'test',
          title: 'Test Notification',
          body: 'This is a test notification from Guru Darshan app!',
          data: { source: 'admin_test' }
        });
        success = true;
      }
      
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Test Notification Sent! 🔔',
          text2: pushToken ? 'Push notification sent' : 'Local notification scheduled',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to Send',
          text2: 'Make sure notifications are enabled',
        });
      }
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send test notification',
      });
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleSendCustomNotification = async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      Alert.alert('Error', 'Please fill in both title and message fields');
      return;
    }

    setIsSendingNotification(true);
    
    try {
      // Send local notification with custom content
      await notificationService.scheduleLocalNotification({
        type: 'test',
        title: notificationTitle.trim(),
        body: notificationBody.trim(),
        data: { customTitle: notificationTitle.trim() }
      });
      const success = true;
      
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Custom Notification Sent! 🔔',
          text2: 'Your custom message has been delivered',
        });
        
        // Clear form
        setNotificationTitle('');
        setNotificationBody('');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to Send',
          text2: 'Make sure notifications are enabled',
        });
      }
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send custom notification',
      });
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleScheduleLocalNotification = async () => {
    try {
      await notificationService.scheduleLocalNotification(
        {
          type: 'test',
          title: 'Guru Darshan',
          body: 'Test scheduled notification from your spiritual app',
        },
        10 // 10 seconds from now
      );
      
      Toast.show({
        type: 'success',
        text1: 'Local Notification Scheduled! ⏰',
        text2: 'You will receive it in 10 seconds',
      });
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to schedule notification',
      });
    }
  };

  // Render functions for each tab
  const renderQuotesTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Quote Text *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter the inspirational quote..."
            placeholderTextColor={SPIRITUAL_COLORS.textMuted}
            value={quoteText}
            onChangeText={setQuoteText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Author *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Gurudev, Buddha, Rumi..."
            placeholderTextColor={SPIRITUAL_COLORS.textMuted}
            value={quoteAuthor}
            onChangeText={setQuoteAuthor}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reflection Question (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="A question to help users reflect on this quote..."
            placeholderTextColor={SPIRITUAL_COLORS.textMuted}
            value={reflectionQuestion}
            onChangeText={setReflectionQuestion}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmittingQuote && styles.buttonDisabled]}
          onPress={handleQuoteSubmit}
          disabled={isSubmittingQuote}
        >
          {isSubmittingQuote ? (
            <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
              <Text style={styles.submitButtonText}>Publish Quote</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderVideosTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Video Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the video title..."
            placeholderTextColor={SPIRITUAL_COLORS.textMuted}
            value={videoTitle}
            onChangeText={setVideoTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what this video is about..."
            placeholderTextColor={SPIRITUAL_COLORS.textMuted}
            value={videoDescription}
            onChangeText={setVideoDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>YouTube URL *</Text>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=... or youtu.be/... or youtube.com/shorts/..."
            placeholderTextColor={SPIRITUAL_COLORS.textMuted}
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmittingVideo && styles.buttonDisabled]}
          onPress={handleVideoSubmit}
          disabled={isSubmittingVideo}
        >
          {isSubmittingVideo ? (
            <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
          ) : (
            <>
              <Ionicons name="videocam" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
              <Text style={styles.submitButtonText}>Add Video</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderNotificationsTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Push Token Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 Push Notification Status</Text>
        <View style={styles.tokenContainer}>
          <Text style={styles.label}>Push Token Status:</Text>
          <Text style={[styles.tokenStatus, pushToken ? styles.tokenActive : styles.tokenInactive]}>
            {pushToken ? '✅ Active' : '⚠️ Development Mode'}
          </Text>
          {pushToken ? (
            <Text style={styles.tokenText} numberOfLines={3}>
              {pushToken.substring(0, 50)}...
            </Text>
          ) : (
            <Text style={styles.infoText}>
              Push tokens are not available in development mode.{'\n'}
              Local notifications will work for testing.{'\n'}
              Push notifications work in production builds.
            </Text>
          )}
        </View>
      </View>

      {/* Quick Test Notification */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧪 Quick Test</Text>
        <Text style={styles.cardDescription}>
          Send a test notification to verify the system is working
        </Text>
        
        <TouchableOpacity
          style={[styles.submitButton, styles.testButton, isSendingNotification && styles.buttonDisabled]}
          onPress={handleSendTestNotification}
          disabled={isSendingNotification}
        >
          {isSendingNotification ? (
            <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
          ) : (
            <>
              <Ionicons name="notifications" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
              <Text style={styles.submitButtonText}>
                {pushToken ? 'Send Test Push Notification' : 'Send Test Local Notification'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Notification */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✏️ Custom Notification</Text>
        <Text style={styles.cardDescription}>
          Create and send a custom notification message
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notification Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Daily Spiritual Wisdom"
            placeholderTextColor={SPIRITUAL_COLORS.textMuted}
            value={notificationTitle}
            onChangeText={setNotificationTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notification Message *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write your spiritual message here..."
            placeholderTextColor={SPIRITUAL_COLORS.textMuted}
            value={notificationBody}
            onChangeText={setNotificationBody}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, styles.customButton, isSendingNotification && styles.buttonDisabled]}
          onPress={handleSendCustomNotification}
          disabled={isSendingNotification || !pushToken || !notificationTitle.trim() || !notificationBody.trim()}
        >
          {isSendingNotification ? (
            <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
          ) : (
            <>
              <Ionicons name="send" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
              <Text style={styles.submitButtonText}>Send Custom Notification</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Local Notification Test */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏰ Local Notification Test</Text>
        <Text style={styles.cardDescription}>
          Schedule a local notification that will appear in 10 seconds
        </Text>
        
        <TouchableOpacity
          style={[styles.submitButton, styles.localButton]}
          onPress={handleScheduleLocalNotification}
        >
          <Ionicons name="timer" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
          <Text style={styles.submitButtonText}>Schedule Local Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ℹ️ Information</Text>
        <Text style={styles.infoText}>
          • <Text style={styles.infoBold}>Test Notifications:</Text> Send to your device only{'\n'}
          • <Text style={styles.infoBold}>Push Notifications:</Text> Require internet connection{'\n'}
          • <Text style={styles.infoBold}>Local Notifications:</Text> Work offline{'\n'}
          • <Text style={styles.infoBold}>Permissions:</Text> Must be enabled in device settings
        </Text>
      </View>
    </ScrollView>
  );

  const renderScene = ({ route }: { route: any }) => {
    switch (route.key) {
      case 'quotes':
        return renderQuotesTab();
      case 'videos':
        return renderVideosTab();
      case 'notifications':
        return renderNotificationsTab();
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: SPIRITUAL_COLORS.primary }}
      style={{ backgroundColor: 'transparent' }}
      labelStyle={{ fontSize: 12, fontWeight: '600' }}
      activeColor={SPIRITUAL_COLORS.primary}
      inactiveColor={SPIRITUAL_COLORS.textMuted}
      renderIcon={({ route, focused, color }: any) => (
        <Ionicons
          name={route.icon as any}
          size={20}
          color={color}
          style={{ marginBottom: 4 }}
        />
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[SPIRITUAL_COLORS.background, SPIRITUAL_COLORS.cardBackground]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Ionicons name="settings" size={32} color={SPIRITUAL_COLORS.primary} />
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage quotes and videos</Text>
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width }}
          renderTabBar={renderTabBar}
        />
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    marginTop: 5,
  },
  card: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
  },
  textArea: {
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: SPIRITUAL_COLORS.spiritualRed,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  // Notification styles
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  tokenContainer: {
    marginTop: 8,
  },
  tokenStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tokenActive: {
    color: SPIRITUAL_COLORS.secondary, // Gold for active
  },
  tokenInactive: {
    color: SPIRITUAL_COLORS.spiritualRed,
  },
  tokenText: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    fontFamily: 'monospace',
    backgroundColor: SPIRITUAL_COLORS.input,
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  testButton: {
    backgroundColor: SPIRITUAL_COLORS.secondary, // Gold for test
  },
  customButton: {
    backgroundColor: SPIRITUAL_COLORS.accent, // Light saffron for custom
  },
  localButton: {
    backgroundColor: SPIRITUAL_COLORS.omGold, // Om gold for local
  },
  infoText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    lineHeight: 22,
  },
  infoBold: {
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
  },
});