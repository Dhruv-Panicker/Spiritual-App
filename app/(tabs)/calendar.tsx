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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEvents, type MonthData, type Event } from '@/contexts/EventsContext';
import { shareService } from '@/services/shareService';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CalendarScreen() {
  const {
    monthlyData,
    getCurrentMonthEvents,
    monthNames,
    getEventTypeColor,
    getEventTypeBadgeStyle,
    loading,
  } = useEvents();

  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const handleMonthPress = async (monthData: MonthData) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedMonth(monthData);
    setIsMonthModalOpen(true);
  };

  const handleEventPress = async (event: Event) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Close month modal first, then open event modal after a brief delay
    if (isMonthModalOpen) {
      setIsMonthModalOpen(false);
      // Small delay to ensure month modal closes before event modal opens
      setTimeout(() => {
        setSelectedEvent(event);
        setIsEventModalOpen(true);
      }, 100);
    } else {
      setSelectedEvent(event);
      setIsEventModalOpen(true);
    }
  };

  const closeMonthModal = () => {
    setIsMonthModalOpen(false);
    setSelectedMonth(null);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleShareEvent = async (event: Event) => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await shareService.shareEvent(event);
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const cardWidth = (screenWidth - 60) / 2; // 2 columns with padding

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={SPIRITUAL_GRADIENTS.peace} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={SPIRITUAL_COLORS.primary} />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

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
          {getCurrentMonthEvents.length > 0 && (
            <View style={styles.currentMonthBanner}>
              <Text style={styles.currentMonthTitle}>
                This Month
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.currentMonthEventsContainer}
              >
                {getCurrentMonthEvents.map((event) => (
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
            {monthlyData.map((monthData) => (
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
                        {monthData.events.slice(0, 3).map((event) => (
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
        </ScrollView>

        {/* Month Events Modal */}
        <Modal
          visible={isMonthModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={closeMonthModal}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={20} style={styles.blurOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={closeMonthModal}
              />
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={[SPIRITUAL_TYPOGRAPHY.spiritualHeading, styles.modalTitle]}>
                    {selectedMonth?.month} {selectedMonth?.year}
                  </Text>
                  <TouchableOpacity
                    onPress={closeMonthModal}
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
                        onPress={() => handleEventPress(event)}
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

                        {/* Share button in event card */}
                        <TouchableOpacity
                          style={styles.eventCardShareButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleShareEvent(event);
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="share-outline" size={18} color={SPIRITUAL_COLORS.primary} />
                          <Text style={styles.eventCardShareText}>Share</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noEventsMessage}>No events this month</Text>
                  )}
                </ScrollView>
              </View>
            </BlurView>
          </View>
        </Modal>

        {/* Event Detail Modal */}
        <Modal
          visible={isEventModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={closeEventModal}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={20} style={styles.blurOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={closeEventModal}
              />
              <View style={styles.eventModalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={[SPIRITUAL_TYPOGRAPHY.spiritualHeading, styles.eventModalTitle]}>
                    {selectedEvent?.title}
                  </Text>
                  <View style={styles.modalHeaderActions}>
                    {selectedEvent && (
                      <TouchableOpacity
                        onPress={() => handleShareEvent(selectedEvent)}
                        style={styles.shareEventButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="share-outline" size={22} color={SPIRITUAL_COLORS.primary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={closeEventModal}
                      style={styles.closeButton}
                      activeOpacity={0.7}
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
                        <Text style={styles.descriptionText}>
                          {selectedEvent.description || 'No description available.'}
                        </Text>
                      </View>

                      {/* Share button at bottom of event details */}
                      {selectedEvent && (
                        <TouchableOpacity
                          style={styles.shareButtonContainer}
                          onPress={() => handleShareEvent(selectedEvent)}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={SPIRITUAL_GRADIENTS.meditation as any}
                            style={styles.shareButtonGradient}
                          >
                            <Ionicons name="share-outline" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
                            <Text style={styles.shareButtonText}>Share Event</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </ScrollView>
              </View>
            </BlurView>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
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
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  monthCard: {
    marginBottom: 16,
  },
  monthCardContent: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    ...SPIRITUAL_SHADOWS.card,
  },
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 4,
  },
  yearText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    marginBottom: 16,
  },
  eventInfo: {
    alignItems: 'center',
    width: '100%',
  },
  eventCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  eventCount: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
  },
  eventDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreEventsText: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    fontWeight: '600',
  },
  noEventsText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    fontStyle: 'italic',
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  eventBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
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
    position: 'relative',
  },
  modalContainer: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 20,
    maxHeight: screenHeight * 0.8,
    ...SPIRITUAL_SHADOWS.divine,
    marginVertical: 20,
    flex: 1,
    zIndex: 1000,
  },
  eventModalContainer: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 20,
    maxHeight: screenHeight * 0.85,
    ...SPIRITUAL_SHADOWS.divine,
    overflow: 'hidden',
    zIndex: 1000,
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
  eventModalTitle: {
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
    marginRight: 4,
  },
  closeButton: {
    padding: 8,
  },
  eventCardShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: SPIRITUAL_COLORS.accent,
    gap: 6,
  },
  eventCardShareText: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primary,
  },
  shareButtonContainer: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primaryForeground,
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
});
