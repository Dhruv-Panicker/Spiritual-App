
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

const { width } = Dimensions.get('window');

interface QuoteForm {
  text: string;
  author: string;
  reflection: string;
}

interface EventForm {
  title: string;
  date: Date;
  time: Date;
  location: string;
  description: string;
  type: string;
}

export const AdminScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'quotes', title: 'Quotes', icon: 'chatbubble' },
    { key: 'events', title: 'Events', icon: 'calendar' },
    { key: 'notifications', title: 'Notify', icon: 'notifications' },
  ]);

  // Form states
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({
    text: '',
    author: '',
    reflection: ''
  });

  const [eventForm, setEventForm] = useState<EventForm>({
    title: '',
    date: new Date(),
    time: new Date(),
    location: '',
    description: '',
    type: 'meditation'
  });

  // Loading states
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Form validation
  const [quoteErrors, setQuoteErrors] = useState<Partial<QuoteForm>>({});
  const [eventErrors, setEventErrors] = useState<Partial<EventForm>>({});

  // Auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveFormData();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [quoteForm, eventForm]);

  const saveFormData = async () => {
    try {
      await AsyncStorage.setItem('adminQuoteForm', JSON.stringify(quoteForm));
      await AsyncStorage.setItem('adminEventForm', JSON.stringify({
        ...eventForm,
        date: eventForm.date.toISOString(),
        time: eventForm.time.toISOString(),
      }));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };

  const loadFormData = async () => {
    try {
      const savedQuoteForm = await AsyncStorage.getItem('adminQuoteForm');
      const savedEventForm = await AsyncStorage.getItem('adminEventForm');

      if (savedQuoteForm) {
        setQuoteForm(JSON.parse(savedQuoteForm));
      }

      if (savedEventForm) {
        const parsed = JSON.parse(savedEventForm);
        setEventForm({
          ...parsed,
          date: new Date(parsed.date),
          time: new Date(parsed.time),
        });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  // Form validation functions
  const validateQuoteForm = (): boolean => {
    const errors: Partial<QuoteForm> = {};

    if (!quoteForm.text.trim()) {
      errors.text = 'Quote text is required';
    } else if (quoteForm.text.length < 10) {
      errors.text = 'Quote must be at least 10 characters';
    }

    if (!quoteForm.author.trim()) {
      errors.author = 'Author is required';
    }

    setQuoteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEventForm = (): boolean => {
    const errors: Partial<EventForm> = {};

    if (!eventForm.title.trim()) {
      errors.title = 'Event title is required';
    }

    if (!eventForm.description.trim()) {
      errors.description = 'Event description is required';
    }

    setEventErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handlers
  const handleQuoteSubmit = async () => {
    if (!validateQuoteForm()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsSubmittingQuote(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Toast.show({
        type: 'success',
        text1: 'Quote Published',
        text2: 'The quote has been added to the daily feed.',
        visibilityTime: 4000,
      });

      // Clear form
      setQuoteForm({ text: '', author: '', reflection: '' });
      await AsyncStorage.removeItem('adminQuoteForm');

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to publish quote. Please try again.',
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleEventSubmit = async () => {
    if (!validateEventForm()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsSubmittingEvent(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Toast.show({
        type: 'success',
        text1: 'Event Created',
        text2: 'The event has been added to the calendar.',
        visibilityTime: 4000,
      });

      // Clear form
      setEventForm({
        title: '',
        date: new Date(),
        time: new Date(),
        location: '',
        description: '',
        type: 'meditation'
      });
      await AsyncStorage.removeItem('adminEventForm');

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create event. Please try again.',
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleSendNotification = async () => {
    Alert.alert(
      'Send Notification',
      'Send today\'s quote as a push notification to all users?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setIsSendingNotification(true);
            try {
              // Simulate push notification
              await new Promise(resolve => setTimeout(resolve, 1500));

              Toast.show({
                type: 'success',
                text1: 'Notification Sent',
                text2: 'Push notification sent to all users.',
                visibilityTime: 4000,
              });

              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to send notification.',
                visibilityTime: 4000,
              });
            } finally {
              setIsSendingNotification(false);
            }
          }
        }
      ]
    );
  };

  // Date picker handlers
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventForm(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setEventForm(prev => ({ ...prev, time: selectedTime }));
    }
  };

  // Tab scenes
  const QuotesRoute = () => (
    <KeyboardAvoidingView
      style={styles.scene}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="add-circle" size={24} color={SPIRITUAL_COLORS.primary} />
            <Text style={styles.cardTitle}>Add New Quote</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quote Text *</Text>
            <TextInput
              style={[
                styles.textArea,
                quoteErrors.text ? styles.inputError : null
              ]}
              placeholder="Enter the inspirational quote..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={quoteForm.text}
              onChangeText={(text) => {
                setQuoteForm(prev => ({ ...prev, text }));
                if (quoteErrors.text) {
                  setQuoteErrors(prev => ({ ...prev, text: undefined }));
                }
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {quoteErrors.text && <Text style={styles.errorText}>{quoteErrors.text}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Author *</Text>
            <TextInput
              style={[
                styles.input,
                quoteErrors.author ? styles.inputError : null
              ]}
              placeholder="e.g., Gurudev, Buddha, Rumi..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={quoteForm.author}
              onChangeText={(text) => {
                setQuoteForm(prev => ({ ...prev, author: text }));
                if (quoteErrors.author) {
                  setQuoteErrors(prev => ({ ...prev, author: undefined }));
                }
              }}
            />
            {quoteErrors.author && <Text style={styles.errorText}>{quoteErrors.author}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Reflection Question (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="A question to help users reflect..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={quoteForm.reflection}
              onChangeText={(text) => setQuoteForm(prev => ({ ...prev, reflection: text }))}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmittingQuote && styles.buttonDisabled
            ]}
            onPress={handleQuoteSubmit}
            disabled={isSubmittingQuote}
            activeOpacity={0.8}
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

  const EventsRoute = () => (
    <KeyboardAvoidingView
      style={styles.scene}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color={SPIRITUAL_COLORS.primary} />
            <Text style={styles.cardTitle}>Create New Event</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={[
                styles.input,
                eventErrors.title ? styles.inputError : null
              ]}
              placeholder="e.g., Morning Meditation, Vedanta Talk..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={eventForm.title}
              onChangeText={(text) => {
                setEventForm(prev => ({ ...prev, title: text }));
                if (eventErrors.title) {
                  setEventErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
            />
            {eventErrors.title && <Text style={styles.errorText}>{eventErrors.title}</Text>}
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {eventForm.date.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={SPIRITUAL_COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Time *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {eventForm.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Ionicons name="time-outline" size={20} color={SPIRITUAL_COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Main Hall, Online, Community Center..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={eventForm.location}
              onChangeText={(text) => setEventForm(prev => ({ ...prev, location: text }))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Type</Text>
            <View style={styles.pickerContainer}>
              {['meditation', 'teaching', 'celebration', 'retreat'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pickerOption,
                    eventForm.type === type && styles.pickerOptionSelected
                  ]}
                  onPress={() => setEventForm(prev => ({ ...prev, type }))}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    eventForm.type === type && styles.pickerOptionTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[
                styles.textArea,
                eventErrors.description ? styles.inputError : null
              ]}
              placeholder="Describe the event, what participants can expect..."
              placeholderTextColor={SPIRITUAL_COLORS.textMuted}
              value={eventForm.description}
              onChangeText={(text) => {
                setEventForm(prev => ({ ...prev, description: text }));
                if (eventErrors.description) {
                  setEventErrors(prev => ({ ...prev, description: undefined }));
                }
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {eventErrors.description && <Text style={styles.errorText}>{eventErrors.description}</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmittingEvent && styles.buttonDisabled
            ]}
            onPress={handleEventSubmit}
            disabled={isSubmittingEvent}
            activeOpacity={0.8}
          >
            {isSubmittingEvent ? (
              <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
                <Text style={styles.submitButtonText}>Create Event</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={eventForm.date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={eventForm.time}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const NotificationsRoute = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="notifications" size={24} color={SPIRITUAL_COLORS.primary} />
          <Text style={styles.cardTitle}>Send Push Notification</Text>
        </View>

        <Text style={styles.description}>
          Send today's quote as a push notification to all app users.
        </Text>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSendingNotification && styles.buttonDisabled
          ]}
          onPress={handleSendNotification}
          disabled={isSendingNotification}
          activeOpacity={0.8}
        >
          {isSendingNotification ? (
            <ActivityIndicator color={SPIRITUAL_COLORS.primaryForeground} />
          ) : (
            <>
              <Ionicons name="send" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
              <Text style={styles.submitButtonText}>Send Daily Quote Notification</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={24} color={SPIRITUAL_COLORS.secondary} />
          <Text style={styles.cardTitle}>Recent Activity</Text>
        </View>

        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Quote published: "The mind is everything..."</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Event created: New Moon Meditation</Text>
            <Text style={styles.activityTime}>1 day ago</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Push notification sent to 1,247 users</Text>
            <Text style={styles.activityTime}>2 days ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderScene = SceneMap({
    quotes: QuotesRoute,
    events: EventsRoute,
    notifications: NotificationsRoute,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={SPIRITUAL_COLORS.primary}
      inactiveColor={SPIRITUAL_COLORS.textMuted}
      renderIcon={({ route, focused, color }) => (
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
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage quotes, events, and notifications</Text>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    ...SPIRITUAL_SHADOWS.card,
  },
  tabIndicator: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    height: 3,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'none',
  },
  scene: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...SPIRITUAL_SHADOWS.divine,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
  },
  input: {
    backgroundColor: SPIRITUAL_COLORS.input,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
  },
  textArea: {
    backgroundColor: SPIRITUAL_COLORS.input,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    minHeight: 100,
  },
  inputError: {
    borderColor: SPIRITUAL_COLORS.spiritualRed,
    borderWidth: 2,
  },
  errorText: {
    color: SPIRITUAL_COLORS.spiritualRed,
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: SPIRITUAL_COLORS.input,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    backgroundColor: SPIRITUAL_COLORS.input,
  },
  pickerOptionSelected: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    borderColor: SPIRITUAL_COLORS.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.foreground,
  },
  pickerOptionTextSelected: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: SPIRITUAL_COLORS.border,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: SPIRITUAL_COLORS.foreground,
  },
  activityTime: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
  },
});

export default AdminScreen;
