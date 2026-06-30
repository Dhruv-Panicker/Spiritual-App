import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
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
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';
import { styles } from '@/styles/admin.styles';

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

  // Return null while checking or if not admin 
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
        console.log('No push tokens found in Google Sheets, using local notification');
        // Fallback: if no tokens in sheets, use local token (for testing)
        const localToken = await notificationService.getStoredPushToken();
        return localToken ? [localToken] : [];
      }
      
      console.log(`Found ${tokens.length} push tokens from Google Sheets`);
      return tokens;
    } catch (error) {
      console.error('Error getting push tokens from Google Sheets:', error);
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

      if (sendQuoteNotification) {
        try {
          const pushTokens = await getPushTokens();
          const adminToken = notificationService.getPushToken() || await notificationService.getStoredPushToken();
          const remoteTokens = adminToken ? pushTokens.filter(t => t !== adminToken) : pushTokens;
          if (remoteTokens.length > 0) {
            await notificationService.notifyNewQuote(quoteData.text, quoteData.author, remoteTokens);
          }
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      }

      const quotePreview = quoteData.text.length > 60 ? quoteData.text.substring(0, 57) + '...' : quoteData.text;
      Alert.alert('Success', 'Quote has been added successfully!', [{
        text: 'OK',
        onPress: () => {
          if (sendQuoteNotification) {
            notificationService.sendLocalNotification({
              type: 'quote',
              title: 'New Daily Wisdom',
              body: `"${quotePreview}" - ${quoteData.author}`,
            }).catch(() => {});
          }
        },
      }]);
      
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

      if (sendVideoNotification) {
        try {
          const pushTokens = await getPushTokens();
          const adminToken = notificationService.getPushToken() || await notificationService.getStoredPushToken();
          const remoteTokens = adminToken ? pushTokens.filter(t => t !== adminToken) : pushTokens;
          if (remoteTokens.length > 0) {
            await notificationService.notifyNewVideo(videoData.title, remoteTokens);
          }
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      }

      Alert.alert('Success', 'Video has been added successfully!', [{
        text: 'OK',
        onPress: () => {
          if (sendVideoNotification) {
            notificationService.sendLocalNotification({
              type: 'video',
              title: 'New Spiritual Video',
              body: `New video available: ${videoData.title}`,
            }).catch(() => {});
          }
        },
      }]);

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

      if (sendEventNotification) {
        try {
          const pushTokens = await getPushTokens();
          const adminToken = notificationService.getPushToken() || await notificationService.getStoredPushToken();
          const remoteTokens = adminToken ? pushTokens.filter(t => t !== adminToken) : pushTokens;
          if (remoteTokens.length > 0) {
            await notificationService.notifyNewEvent(eventData.title, eventData.date, remoteTokens);
          }
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      }

      Alert.alert('Success', 'Event has been added successfully!', [{
        text: 'OK',
        onPress: () => {
          if (sendEventNotification) {
            notificationService.sendLocalNotification({
              type: 'event',
              title: 'New Event',
              body: `${eventData.title} - ${eventData.date}`,
            }).catch(() => {});
          }
        },
      }]);

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
              placeholder="e.g., Om Siddheshwar, Buddha, Rumi..."
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

      // Get all push tokens from Google Sheets
      const allTokens = await getPushTokens();

      // Get admin's own token so we can exclude it from push (admin gets local instead)
      const adminToken = notificationService.getPushToken() || await notificationService.getStoredPushToken();
      const remoteTokens = adminToken
        ? allTokens.filter(t => t !== adminToken)
        : allTokens;

      // Send push to all other users
      if (remoteTokens.length > 0) {
        await notificationService.notifyGeneral(notificationMessage.trim(), remoteTokens);
      }

      const message = notificationMessage.trim();
      setNotificationMessage('');

      Alert.alert('Notification Sent', 'Your message has been sent to all users.', [{
        text: 'OK',
        onPress: () => {
          notificationService.sendLocalNotification({
            type: 'general',
            title: 'Om Siddheshwar',
            body: message,
          }).catch(() => {});
        },
      }]);
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      Alert.alert('Error', `Failed to send notification: ${errorMessage}`, [{ text: 'OK' }]);
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

