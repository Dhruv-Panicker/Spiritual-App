import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Share } from 'react-native';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location?: string;
  type: 'meditation' | 'teaching' | 'celebration' | 'retreat';
}

interface MonthData {
  month: string;
  year: number;
  events: Event[];
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'New Moon Meditation',
    date: '2024-01-15',
    time: '7:00 PM',
    description: 'Join us for a powerful new moon meditation to set intentions for the lunar cycle ahead. We will practice breath awareness and silent contemplation.',
    location: 'Main Hall',
    type: 'meditation'
  },
  {
    id: '2',
    title: 'Vedanta Philosophy Talk',
    date: '2024-01-22',
    time: '6:30 PM', 
    description: 'Explore the profound teachings of Vedanta philosophy and its practical applications in daily life. Discover the nature of reality and consciousness.',
    location: 'Teaching Hall',
    type: 'teaching'
  },
  {
    id: '3',
    title: 'Diwali Celebration',
    date: '2024-02-14',
    time: '5:00 PM',
    description: 'Celebrate the festival of lights with traditional prayers, music, and community feast. Join us in spreading joy and divine light.',
    location: 'Community Center',
    type: 'celebration'
  },
  {
    id: '4',
    title: 'Silent Retreat Weekend',
    date: '2024-03-20',
    time: '9:00 AM',
    description: 'A transformative weekend of silence, meditation, and inner reflection. Disconnect from the world and reconnect with your true self.',
    location: 'Retreat Center',
    type: 'retreat'
  },
  {
    id: '5',
    title: 'Spring Equinox Ceremony',
    date: '2024-03-20',
    time: '6:00 PM',
    description: 'Celebrate the balance of day and night with a special ceremony honoring the arrival of spring and new beginnings.',
    location: 'Outdoor Garden',
    type: 'celebration'
  },
  {
    id: '6',
    title: 'Karma Yoga Workshop',
    date: '2024-04-10',
    time: '2:00 PM',
    description: 'Learn the path of selfless service and how to transform daily actions into spiritual practice through Karma Yoga principles.',
    location: 'Workshop Room',
    type: 'teaching'
  },
  {
    id: '7',
    title: 'Full Moon Meditation Circle',
    date: '2024-08-05',
    time: '7:30 PM',
    description: 'Join us for a powerful full moon meditation to harness the lunar energy for spiritual transformation and inner healing.',
    location: 'Meditation Hall',
    type: 'meditation'
  },
  {
    id: '8',
    title: 'Bhagavad Gita Study Group',
    date: '2024-08-12',
    time: '6:00 PM',
    description: 'Deep dive into the sacred teachings of the Bhagavad Gita and explore its practical wisdom for modern spiritual seekers.',
    location: 'Study Room',
    type: 'teaching'
  },
  {
    id: '9',
    title: 'Krishna Janmashtami Celebration',
    date: '2024-08-26',
    time: '5:00 PM',
    description: 'Celebrate the birth of Lord Krishna with devotional singing, traditional dance, and spiritual discourse on divine love.',
    location: 'Main Temple',
    type: 'celebration'
  },
  {
    id: '10',
    title: 'Mindfulness & Meditation Workshop',
    date: '2024-08-18',
    time: '10:00 AM',
    description: 'Learn practical techniques for cultivating mindfulness in daily life and developing a consistent meditation practice.',
    location: 'Workshop Hall',
    type: 'teaching'
  }
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Get current month events
  const getCurrentMonthEvents = () => {
    const currentMonth = new Date().getMonth(); // August is month 7 (0-indexed)
    return mockEvents.filter(event => {
      const eventMonth = new Date(event.date).getMonth();
      return eventMonth === currentMonth;
    });
  };

  const currentMonthEvents = getCurrentMonthEvents();

  // Group events by month
  const monthlyData: MonthData[] = monthNames.map((month, index) => ({
    month,
    year: 2024,
    events: mockEvents.filter(event => {
      const eventMonth = new Date(event.date).getMonth();
      return eventMonth === index;
    })
  }));

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meditation': return SPIRITUAL_COLORS.primary;
      case 'teaching': return SPIRITUAL_COLORS.secondary;
      case 'celebration': return SPIRITUAL_COLORS.spiritualRed;
      case 'retreat': return SPIRITUAL_COLORS.omGold;
      default: return SPIRITUAL_COLORS.textMuted;
    }
  };

  const getEventTypeBadgeStyle = (type: Event['type']) => {
    const color = getEventTypeColor(type);
    return {
      backgroundColor: color,
      color: '#FFFFFF',
    };
  };

  const handleMonthPress = async (monthData: MonthData) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMonth(monthData);
    setIsMonthModalOpen(true);
  };

  const handleEventPress = async (event: Event) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const shareEvent = async (event: Event) => {
    const shareText = `📅 ${event.title}\n📍 ${event.location}\n🕐 ${event.time}\n\n${event.description}\n\nFrom our Spiritual Wisdom calendar`;

    try {
      await Share.share({
        message: shareText,
        title: event.title,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share event details.',
      });
    }
  };

  const shareApp = async () => {
    const shareText = "🗓️ Stay connected with upcoming spiritual events and teachings through this beautiful app!";

    try {
      await Share.share({
        message: shareText,
        title: 'Spiritual Calendar',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share app.',
      });
    }
  };

  const cardWidth = (screenWidth - 60) / 2; // 2 columns with padding

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[SPIRITUAL_TYPOGRAPHY.spiritualHeading, styles.title]}>
              Sacred Calendar
            </Text>
            <Text style={styles.subtitle}>Upcoming events and teachings</Text>
          </View>

          {/* Current Month Events Banner */}
          {currentMonthEvents.length > 0 && (
            <View style={styles.currentMonthBanner}>
              <Text style={styles.currentMonthTitle}>
                This Month
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.currentMonthEventsContainer}
              >
                {currentMonthEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.currentMonthEventCard}
                    onPress={() => handleEventPress(event)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.eventBadge, getEventTypeBadgeStyle(event.type), styles.currentMonthEventBadge]}>
                      <Text style={styles.eventBadgeText}>{event.type}</Text>
                    </View>
                    <Text style={styles.currentMonthEventTitle} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View style={styles.currentMonthEventDetails}>
                      <View style={styles.currentMonthEventDetailRow}>
                        <Ionicons name="calendar" size={14} color={SPIRITUAL_COLORS.primary} />
                        <Text style={styles.currentMonthEventDetailText}>
                          {monthNames[new Date(event.date).getMonth()]} {new Date(event.date).getDate()}
                        </Text>
                      </View>
                      <View style={styles.currentMonthEventDetailRow}>
                        <Ionicons name="time" size={14} color={SPIRITUAL_COLORS.primary} />
                        <Text style={styles.currentMonthEventDetailText}>
                          {event.time}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 12-Month Grid */}
          <View style={styles.monthGrid}>
            {monthlyData.map((monthData, index) => (
              <TouchableOpacity
                key={monthData.month}
                style={[styles.monthCard, { width: cardWidth }]}
                onPress={() => handleMonthPress(monthData)}
                activeOpacity={0.8}
              >
                <View style={styles.monthCardContent}>
                  <Text style={styles.monthName}>{monthData.month}</Text>
                  <Text style={styles.yearText}>{monthData.year}</Text>

                  {monthData.events.length > 0 ? (
                    <View style={styles.eventInfo}>
                      <View style={styles.eventCountContainer}>
                        <Ionicons name="calendar" size={16} color={SPIRITUAL_COLORS.primary} />
                        <Text style={styles.eventCount}>
                          {monthData.events.length} event{monthData.events.length !== 1 ? 's' : ''}
                        </Text>
                      </View>

                      <View style={styles.eventDots}>
                        {monthData.events.slice(0, 3).map((event, eventIndex) => (
                          <View
                            key={event.id}
                            style={[
                              styles.eventDot,
                              { backgroundColor: getEventTypeColor(event.type) }
                            ]}
                          />
                        ))}
                        {monthData.events.length > 3 && (
                          <Text style={styles.moreEventsText}>+{monthData.events.length - 3}</Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.noEventsText}>No events</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Share App CTA */}
          <View style={styles.shareContainer}>
            <LinearGradient
              colors={SPIRITUAL_GRADIENTS.divine}
              style={styles.shareCard}
            >
              <Text style={[SPIRITUAL_TYPOGRAPHY.spiritualHeading, styles.shareTitle]}>
                Stay Connected
              </Text>
              <Text style={styles.shareSubtitle}>
                Share this app with someone who might find it meaningful
              </Text>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareApp}
                activeOpacity={0.8}
              >
                <Ionicons name="share" size={20} color={SPIRITUAL_COLORS.foreground} />
                <Text style={styles.shareButtonText}>Share App</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>

        {/* Month Events Modal */}
        <Modal
          visible={isMonthModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsMonthModalOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setIsMonthModalOpen(false)}
          >
            <BlurView intensity={20} style={styles.blurOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={[SPIRITUAL_TYPOGRAPHY.spiritualHeading, styles.modalTitle]}>
                    {selectedMonth?.month} {selectedMonth?.year}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsMonthModalOpen(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={SPIRITUAL_COLORS.foreground} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  {selectedMonth?.events.length ? (
                    selectedMonth.events.map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        style={styles.eventCard}
                        onPress={() => {
                          setIsMonthModalOpen(false);
                          setTimeout(() => handleEventPress(event), 300);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.eventCardHeader}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <View style={[styles.eventBadge, getEventTypeBadgeStyle(event.type)]}>
                            <Text style={styles.eventBadgeText}>{event.type}</Text>
                          </View>
                        </View>

                        <View style={styles.eventDetails}>
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="calendar" size={16} color={SPIRITUAL_COLORS.primary} />
                            <Text style={styles.eventDetailText}>
                              {new Date(event.date).toLocaleDateString()}
                            </Text>
                          </View>
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="time" size={16} color={SPIRITUAL_COLORS.primary} />
                            <Text style={styles.eventDetailText}>{event.time}</Text>
                          </View>
                          {event.location && (
                            <View style={styles.eventDetailRow}>
                              <Ionicons name="location" size={16} color={SPIRITUAL_COLORS.primary} />
                              <Text style={styles.eventDetailText}>{event.location}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noEventsMessage}>No events this month</Text>
                  )}
                </ScrollView>
              </View>
            </BlurView>
          </TouchableOpacity>
        </Modal>

        {/* Event Detail Modal */}
        <Modal
          visible={isEventModalOpen}
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          presentationStyle="overFullScreen"
          onRequestClose={() => setIsEventModalOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setIsEventModalOpen(false)}
          >
            <BlurView intensity={20} style={styles.blurOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={[SPIRITUAL_TYPOGRAPHY.spiritualHeading, styles.modalTitle]}>
                    {selectedEvent?.title}
                  </Text>
                  <View style={styles.modalHeaderActions}>
                    <TouchableOpacity
                      onPress={() => selectedEvent && shareEvent(selectedEvent)}
                      style={styles.shareEventButton}
                    >
                      <Ionicons name="share" size={20} color={SPIRITUAL_COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setIsEventModalOpen(false)}
                      style={styles.closeButton}
                    >
                      <Ionicons name="close" size={24} color={SPIRITUAL_COLORS.foreground} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView style={styles.modalContent}>
                  {selectedEvent && (
                    <View style={styles.eventDetailContainer}>
                      <View style={[styles.eventBadge, getEventTypeBadgeStyle(selectedEvent.type), styles.eventBadgeLarge]}>
                        <Text style={styles.eventBadgeText}>{selectedEvent.type}</Text>
                      </View>

                      <View style={styles.eventDetailsSection}>
                        <View style={styles.eventDetailRow}>
                          <Ionicons name="calendar" size={20} color={SPIRITUAL_COLORS.primary} />
                          <Text style={styles.eventDetailTextLarge}>
                            {new Date(selectedEvent.date).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.eventDetailRow}>
                          <Ionicons name="time" size={20} color={SPIRITUAL_COLORS.primary} />
                          <Text style={styles.eventDetailTextLarge}>{selectedEvent.time}</Text>
                        </View>
                        {selectedEvent.location && (
                          <View style={styles.eventDetailRow}>
                            <Ionicons name="location" size={20} color={SPIRITUAL_COLORS.primary} />
                            <Text style={styles.eventDetailTextLarge}>{selectedEvent.location}</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.descriptionSection}>
                        <Text style={styles.descriptionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{selectedEvent.description}</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </View>
            </BlurView>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
      <Toast />
    </SafeAreaView>
  );
}

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    color: SPIRITUAL_COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
  },
  monthCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SPIRITUAL_SHADOWS.card,
  },
  monthCardContent: {
    alignItems: 'center',
  },
  monthName: {
    fontSize: 18,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.primary,
    marginBottom: 4,
  },
  yearText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    marginBottom: 12,
  },
  eventInfo: {
    alignItems: 'center',
    width: '100%',
  },
  eventCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventCount: {
    fontSize: 12,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginLeft: 4,
  },
  eventDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreEventsText: {
    fontSize: 10,
    color: SPIRITUAL_COLORS.textMuted,
    marginLeft: 4,
  },
  noEventsText: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    fontStyle: 'italic',
  },
  shareContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  shareCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...SPIRITUAL_SHADOWS.divine,
  },
  shareTitle: {
    color: SPIRITUAL_COLORS.primaryForeground,
    marginBottom: 8,
  },
  shareSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.primaryForeground,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  shareButton: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 20,
    maxHeight: screenHeight * 0.8,
    ...SPIRITUAL_SHADOWS.divine,
    marginVertical: 20,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: SPIRITUAL_COLORS.border,
  },
  modalTitle: {
    color: SPIRITUAL_COLORS.primary,
    flex: 1,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareEventButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  eventCard: {
    backgroundColor: SPIRITUAL_COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    flex: 1,
    marginRight: 12,
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventBadgeLarge: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailsSection: {
    gap: 12,
    marginBottom: 24,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
  },
  eventDetailTextLarge: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
  },
  noEventsMessage: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
    fontStyle: 'italic',
  },
  eventDetailContainer: {
    paddingVertical: 20,
  },
  descriptionSection: {
    borderTopWidth: 1,
    borderTopColor: SPIRITUAL_COLORS.border,
    paddingTop: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    lineHeight: 24,
  },
  currentMonthBanner: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  currentMonthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  currentMonthEventsContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  currentMonthEventCard: {
    backgroundColor: SPIRITUAL_COLORS.background,
    borderRadius: 12,
    padding: 12,
    width: 180,
    marginRight: 12,
    ...SPIRITUAL_SHADOWS.card,
  },
  currentMonthEventBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  currentMonthEventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
    lineHeight: 18,
  },
  currentMonthEventDetails: {
    gap: 4,
  },
  currentMonthEventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentMonthEventDetailText: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
  },
});