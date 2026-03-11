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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/contexts/QuotesContext';
import { useVideos } from '@/contexts/VideosContext';
import { useEvents } from '@/contexts/EventsContext';
import { notificationService } from '@/services/notificationService';
import { googleSheetsService } from '@/services/googleSheetsService';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

const { width } = Dimensions.get('window');

export default function AdminScreen() {
  const { user } = useAuth();
  const { addQuote, refreshQuotes } = useQuotes();
  const { addVideo, refreshVideos } = useVideos();
  const { addEvent, refreshEvents } = useEvents();

  // Redirect non-admin users immediately - no UI shown
  useEffect(() => {
    if (user && !user.isAdmin) {
      router.replace('/');
    }
  }, [user]);

  // Return null while checking or if not admin (prevents flash of content)
  if (!user || !user.isAdmin) {
    return null;
  }

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<'quotes' | 'videos' | 'events' | 'notifications'>('quotes');

  // Quote form states
  const [quoteText, setQuoteText] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteCategory, setQuoteCategory] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [sendQuoteNotification, setSendQuoteNotification] = useState(true);

  // Video form states
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [sendVideoNotification, setSendVideoNotification] = useState(true);

  // Event form states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [eventType, setEventType] = useState<'meditation' | 'teaching' | 'celebration' | 'retreat'>('teaching');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [sendEventNotification, setSendEventNotification] = useState(true);

  // Notification tab states
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const handleTabPress = async (tab: 'quotes' | 'videos' | 'events' | 'notifications') => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  // Get push tokens from all users stored in Google Sheets
  const getPushTokens = async (): Promise<string[]> => {
    try {
      // Get all push tokens from Google Sheets
      const tokens = await googleSheetsService.getPushTokens();
      
      if (tokens.length === 0) {
        console.log('⚠️ No push tokens found in Google Sheets, using local notification');
        // Fallback: if no tokens in sheets, use local token (for testing)
        const localToken = await notificationService.getStoredPushToken();
        return localToken ? [localToken] : [];
      }
      
      console.log(`✅ Found ${tokens.length} push tokens from Google Sheets`);
      return tokens;
    } catch (error) {
      console.error('❌ Error getting push tokens from Google Sheets:', error);
      // Fallback to local token
      const localToken = await notificationService.getStoredPushToken();
      return localToken ? [localToken] : [];
    }
  };

  const handleQuoteSubmit = async () => {
    if (!quoteText.trim() || !quoteAuthor.trim()) {
      Alert.alert('Error', 'Please fill in both quote and author fields');
      return;
    }

    setIsSubmittingQuote(true);

    try {
      const quoteData = {
        text: quoteText.trim(),
        author: quoteAuthor.trim(),
        category: quoteCategory.trim() || 'General',
      };

      await addQuote(quoteData);

      // Send notification if enabled
      if (sendQuoteNotification) {
        try {
          const pushTokens = await getPushTokens();
          await notificationService.notifyNewQuote(quoteData.text, quoteData.author, pushTokens);
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
          // Don't fail the quote submission if notification fails
        }
      }

      Alert.alert('Success', 'Quote has been added successfully!');
      
      // Clear form
      setQuoteText('');
      setQuoteAuthor('');
      setQuoteCategory('');
      
      // Refresh quotes
      await refreshQuotes();

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add quote. Please try again.');
      console.error('Error adding quote:', error);
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
      Alert.alert('Error', 'Please enter a valid YouTube URL');
      return;
    }

    setIsSubmittingVideo(true);

    try {
      const videoData = {
        title: videoTitle.trim(),
        description: videoDescription.trim(),
        youtubeId: youtubeId,
      };

      await addVideo(videoData);

      // Send notification if enabled
      if (sendVideoNotification) {
        try {
          const pushTokens = await getPushTokens();
          await notificationService.notifyNewVideo(videoData.title, pushTokens);
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      }

      Alert.alert('Success', 'Video has been added successfully!');

      // Clear form
      setVideoTitle('');
      setVideoDescription('');
      setYoutubeUrl('');

      // Refresh videos
      await refreshVideos();

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add video. Please try again.');
      console.error('Error adding video:', error);
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleEventSubmit = async () => {
    if (!eventTitle.trim() || !eventDate.trim() || !eventTime.trim() || !eventDescription.trim()) {
      Alert.alert('Error', 'Please fill in all required event fields');
      return;
    }

    setIsSubmittingEvent(true);

    try {
      const eventData = {
        title: eventTitle.trim(),
        date: eventDate.trim(),
        time: eventTime.trim(),
        description: eventDescription.trim(),
        location: eventLocation.trim() || undefined,
        link: eventLink.trim() || undefined,
        type: eventType,
      };

      await addEvent(eventData);

      // Send notification if enabled
      if (sendEventNotification) {
        try {
          const pushTokens = await getPushTokens();
          await notificationService.notifyNewEvent(eventData.title, eventData.date, pushTokens);
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      }

      Alert.alert('Success', 'Event has been added successfully!');

      // Clear form
      setEventTitle('');
      setEventDate('');
      setEventTime('');
      setEventDescription('');
      setEventLocation('');
      setEventLink('');
      setEventType('teaching');

      // Refresh events
      await refreshEvents();

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add event. Please try again.');
      console.error('Error adding event:', error);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // Render functions for each tab
  const renderQuotesTab = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Quote</Text>

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
              placeholder="e.g., Siddhguru, Buddha, Rumi..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={quoteAuthor}
              onChangeText={setQuoteAuthor}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Wisdom, Love, Peace..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={quoteCategory}
              onChangeText={setQuoteCategory}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setSendQuoteNotification(!sendQuoteNotification)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={sendQuoteNotification ? 'checkbox' : 'checkbox-outline'}
                size={24}
                color={sendQuoteNotification ? SPIRITUAL_COLORS.primary : SPIRITUAL_COLORS.textMuted}
              />
              <Text style={styles.checkboxLabel}>Send notification to all users</Text>
            </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );

  const renderVideosTab = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Video</Text>

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
              placeholder="https://youtube.com/watch?v=... or youtu.be/..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setSendVideoNotification(!sendVideoNotification)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={sendVideoNotification ? 'checkbox' : 'checkbox-outline'}
                size={24}
                color={sendVideoNotification ? SPIRITUAL_COLORS.primary : SPIRITUAL_COLORS.textMuted}
              />
              <Text style={styles.checkboxLabel}>Send notification to all users</Text>
            </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );

  const renderEventsTab = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Event</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the event title..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={eventTitle}
              onChangeText={setEventTitle}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-01-15"
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={eventDate}
              onChangeText={setEventDate}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="7:00 PM"
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={eventTime}
              onChangeText={setEventTime}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the event..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Event location..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={eventLocation}
              onChangeText={setEventLocation}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Link (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/event"
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={eventLink}
              onChangeText={setEventLink}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Type *</Text>
            <View style={styles.typeSelector}>
              {(['meditation', 'teaching', 'celebration', 'retreat'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    eventType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setEventType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      eventType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setSendEventNotification(!sendEventNotification)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={sendEventNotification ? 'checkbox' : 'checkbox-outline'}
                size={24}
                color={sendEventNotification ? SPIRITUAL_COLORS.primary : SPIRITUAL_COLORS.textMuted}
              />
              <Text style={styles.checkboxLabel}>Send notification to all users</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmittingEvent && styles.buttonDisabled]}
            onPress={handleEventSubmit}
            disabled={isSubmittingEvent}
          >
            {isSubmittingEvent ? (
              <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
            ) : (
              <>
                <Ionicons name="calendar" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
                <Text style={styles.submitButtonText}>Add Event</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      Alert.alert('Error', 'Please enter a notification message');
      return;
    }

    setIsSendingNotification(true);

    try {

      const hasPermission = await notificationService.checkPermissions();

      if (!hasPermission) {
        Alert.alert(
          'Permissions Required',
          'Please allow notifications in your device settings to send notifications.',
          [{ text: 'OK' }]
        );
        setIsSendingNotification(false);
        return;
      }

      // Get push tokens
      console.log('🔍 Fetching push tokens from Google Sheets...');
      const pushTokens = await getPushTokens();
      console.log(`📋 Found ${pushTokens.length} push token(s)`);
      
      if (pushTokens.length > 0) {
        console.log('  Tokens (first 30 chars each):');
        pushTokens.forEach((token, index) => {
          console.log(`    ${index + 1}. ${token.substring(0, 30)}...`);
        });
      }
      
      // Send notification
      console.log('📤 Sending notification...');
      const success = await notificationService.notifyGeneral(notificationMessage.trim(), pushTokens);
      
      if (success) {
        console.log('✅ Notification sent successfully!');
        
        // Show immediate alert for testing + notification
        Alert.alert(
          '✅ Notification Sent!', 
          `"${notificationMessage.trim()}"\n\nThe notification has been sent. On iOS:\n\n• If app is in FOREGROUND: Check the alert above or minimize the app\n• If app is in BACKGROUND: Check notification center (swipe down)\n• Lock your phone to see it on lock screen\n\n💡 Tip: Minimize the app or lock your phone to see the notification banner.`,
          [{ text: 'OK' }]
        );
        setNotificationMessage('');
      } else {
        console.error('❌ Notification send returned false');
        Alert.alert(
          'Notification Scheduled',
          'Notification was scheduled but may not have sent successfully.\n\nPlease try:\n• Minimize the app and check notification center\n• Lock your phone to see on lock screen\n• Verify notifications are enabled in iOS Settings',
          [{ text: 'OK' }]
        );
        setNotificationMessage('');
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('❌ Error sending notification:', error);
      console.error('  Error type:', error?.constructor?.name);
      console.error('  Error message:', errorMessage);
      console.error('  Full error:', JSON.stringify(error, null, 2));
      
      // Show detailed error in alert
      Alert.alert(
        'Error Sending Notification', 
        `Failed to send notification.\n\nError: ${errorMessage}\n\nPlease check:\n1. Notifications are enabled in device settings\n2. Internet connection is available\n3. Try again in a moment`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSendingNotification(false);
    }
  };

  const renderNotificationsTab = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Send Notification</Text>
          <Text style={styles.cardDescription}>
            Send a notification to all users of the app. This is useful for general announcements or greetings.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notification Message *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g., Hello! New spiritual wisdom awaits you..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={notificationMessage}
              onChangeText={setNotificationMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSendingNotification && styles.buttonDisabled]}
            onPress={handleSendNotification}
            disabled={isSendingNotification}
          >
            {isSendingNotification ? (
              <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
            ) : (
              <>
                <Ionicons name="notifications" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
                <Text style={styles.submitButtonText}>Send Notification</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={SPIRITUAL_COLORS.primary} />
            <Text style={styles.infoText}>
              Notifications are sent immediately to all users. In production, you'll need a backend service to collect and manage user push tokens.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Ionicons name="settings" size={32} color={SPIRITUAL_COLORS.primary} />
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage content</Text>
        </View>

        {/* Custom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'quotes' && styles.tabButtonActive]}
            onPress={() => handleTabPress('quotes')}
          >
            <Ionicons
              name={activeTab === 'quotes' ? 'chatbubble' : 'chatbubble-outline'}
              size={20}
              color={activeTab === 'quotes' ? SPIRITUAL_COLORS.primary : SPIRITUAL_COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'quotes' && styles.tabButtonTextActive,
              ]}
            >
              Quotes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'videos' && styles.tabButtonActive]}
            onPress={() => handleTabPress('videos')}
          >
            <Ionicons
              name={activeTab === 'videos' ? 'videocam' : 'videocam-outline'}
              size={20}
              color={activeTab === 'videos' ? SPIRITUAL_COLORS.primary : SPIRITUAL_COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'videos' && styles.tabButtonTextActive,
              ]}
            >
              Videos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'events' && styles.tabButtonActive]}
            onPress={() => handleTabPress('events')}
          >
            <Ionicons
              name={activeTab === 'events' ? 'calendar' : 'calendar-outline'}
              size={20}
              color={activeTab === 'events' ? SPIRITUAL_COLORS.primary : SPIRITUAL_COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'events' && styles.tabButtonTextActive,
              ]}
            >
              Events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'notifications' && styles.tabButtonActive]}
            onPress={() => handleTabPress('notifications')}
          >
            <Ionicons
              name={activeTab === 'notifications' ? 'notifications' : 'notifications-outline'}
              size={20}
              color={activeTab === 'notifications' ? SPIRITUAL_COLORS.primary : SPIRITUAL_COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'notifications' && styles.tabButtonTextActive,
              ]}
            >
              Notify
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'quotes' && renderQuotesTab()}
          {activeTab === 'videos' && renderVideosTab()}
          {activeTab === 'events' && renderEventsTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
        </View>
      </LinearGradient>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    ...SPIRITUAL_SHADOWS.card,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: SPIRITUAL_COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: SPIRITUAL_COLORS.primaryForeground,
  },
  tabContent: {
    flex: 1,
  },
  card: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    ...SPIRITUAL_SHADOWS.divine,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 20,
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
    backgroundColor: SPIRITUAL_COLORS.input,
  },
  textArea: {
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    backgroundColor: SPIRITUAL_COLORS.input,
    minHeight: 100,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    backgroundColor: SPIRITUAL_COLORS.input,
  },
  typeButtonActive: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    borderColor: SPIRITUAL_COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
  },
  typeButtonTextActive: {
    color: SPIRITUAL_COLORS.primaryForeground,
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
  checkboxContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.foreground,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: SPIRITUAL_COLORS.accent,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: SPIRITUAL_COLORS.foreground,
    lineHeight: 18,
  },
});

