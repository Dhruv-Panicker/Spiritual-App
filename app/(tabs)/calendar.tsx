import React, { useState, useMemo } from 'react';
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
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useEvents, type MonthData, type Event } from '@/contexts/EventsContext';
import { shareService } from '@/services/shareService';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 90;
const MONTH_MODAL_MAX_HEIGHT = screenHeight - 140;
const CARD_WIDTH = (screenWidth - 16 * 3) / 2;

// Type pill styles (mockup: light bg + colored text)
function getEventTypePillStyle(type: Event['type']) {
  const color = {
    meditation: SPIRITUAL_COLORS.primary,
    teaching: SPIRITUAL_COLORS.secondary,
    celebration: SPIRITUAL_COLORS.spiritualRed,
    retreat: SPIRITUAL_COLORS.omGold,
  }[type] || SPIRITUAL_COLORS.textMuted;
  return {
    bg: `${color}20`,
    text: color,
    dot: color,
  };
}

function formatEventDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function CalendarScreen() {
  const {
    events,
    monthlyData,
    getCurrentMonthEvents,
    monthNames,
    getEventTypeColor,
    getEventTypeBadgeStyle,
    loading,
  } = useEvents();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalView, setModalView] = useState<'month' | 'event'>('month');
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = monthNames[currentMonthIndex];

  const sortedUpcomingEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const nextEvent = useMemo(() => {
    const now = Date.now();
    const future = sortedUpcomingEvents.find(e => new Date(e.date).getTime() >= now);
    return future || sortedUpcomingEvents[0] || null;
  }, [sortedUpcomingEvents]);

  const openMonthModal = (monthData: MonthData) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMonth(monthData);
    setModalView('month');
    setModalVisible(true);
  };

  const openEventDetail = (event: Event) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedEvent(event);
    setModalView('event');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalView('month');
    setSelectedMonth(null);
    setSelectedEvent(null);
  };

  const handleShareEvent = async (event: Event) => {
    try {
      if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await shareService.shareEvent(event);
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const handleSeeMore = async (event: Event) => {
    const url = event.link?.trim();
    if (!url) return;
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
      else Alert.alert('Cannot open link', 'This link could not be opened.');
    } catch (err) {
      console.error('Error opening event link:', err);
      Alert.alert('Error', 'Could not open the link.');
    }
  };

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
      <LinearGradient colors={['#fdf6ec', '#f5e2c4']} style={styles.gradient}>
        {/* Subtle warm glow at top */}
        <View style={styles.glowOverlay} pointerEvents="none" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header (mockup style) */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Calendar of Events</Text>
            <Text style={styles.headerSubtitle}>Upcoming teachings & sacred gatherings</Text>
          </View>

          {/* Next Upcoming Event hero card */}
          {nextEvent && (
            <TouchableOpacity
              style={styles.heroCardWrap}
              onPress={() => openEventDetail(nextEvent)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[SPIRITUAL_COLORS.secondary, SPIRITUAL_COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <View style={styles.heroCardCircles}>
                  <View style={styles.heroCircle1} />
                  <View style={styles.heroCircle2} />
                </View>
                <Text style={styles.heroLabel}>☀ Next Upcoming Event</Text>
                <View style={styles.heroTypePill}>
                  <Text style={styles.heroTypePillText}>{nextEvent.type}</Text>
                </View>
                <Text style={styles.heroTitle} numberOfLines={2}>{nextEvent.title}</Text>
                <View style={styles.heroMeta}>
                  <View style={styles.heroMetaRow}>
                    <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroMetaText}>{formatEventDate(nextEvent.date)}</Text>
                  </View>
                  <View style={styles.heroMetaRow}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroMetaText}>{nextEvent.time}</Text>
                  </View>
                  <View style={styles.heroMetaRow}>
                    <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroMetaText} numberOfLines={1}>{nextEvent.location?.trim() || '—'}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Ornamental divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>— ✦ —</Text>
            <View style={[styles.dividerLine, styles.dividerLineRight]} />
          </View>

          {/* All Upcoming Events */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>All Upcoming Events</Text>
            <View style={styles.totalPill}>
              <Text style={styles.totalPillText}>{sortedUpcomingEvents.length} total</Text>
            </View>
          </View>
          <View style={styles.allEventsList}>
            {sortedUpcomingEvents.map((event) => {
              const pill = getEventTypePillStyle(event.type);
              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventPill}
                  onPress={() => openEventDetail(event)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.eventPillBar, { backgroundColor: pill.dot }]} />
                  <View style={styles.eventPillContent}>
                    <View style={styles.eventPillHeader}>
                      <View style={[styles.eventPillBadge, { backgroundColor: pill.bg }]}>
                        <Text style={[styles.eventPillBadgeText, { color: pill.text }]}>{event.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.eventPillTitle} numberOfLines={2}>{event.title}</Text>
                    <View style={styles.eventPillLocationRow}>
                      <Ionicons name="location-outline" size={12} color={SPIRITUAL_COLORS.textMuted} />
                      <Text style={styles.eventPillLocationText} numberOfLines={1}>{event.location?.trim() || '—'}</Text>
                    </View>
                  </View>
                  <View style={styles.eventPillRight}>
                    <Text style={styles.eventPillDate}>{formatEventDate(event.date).split(',')[0]}</Text>
                    <Text style={styles.eventPillTime}>{event.time}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ornamental divider */}
          <View style={[styles.divider, styles.dividerMargin]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>— ✦ —</Text>
            <View style={[styles.dividerLine, styles.dividerLineRight]} />
          </View>

          {/* Browse by Month */}
          <Text style={styles.sectionTitle}>Browse by Month</Text>
          <View style={styles.monthGrid}>
            {monthlyData.map((monthData) => {
              const isCurrentMonth = monthData.month === currentMonthName;
              const hasEvents = monthData.events.length > 0;
              return (
                <TouchableOpacity
                  key={monthData.month}
                  style={[styles.monthCard, { width: CARD_WIDTH }, isCurrentMonth && styles.monthCardCurrent]}
                  onPress={() => openMonthModal(monthData)}
                  activeOpacity={0.85}
                >
                  {isCurrentMonth && <Text style={styles.monthCardNow}>NOW</Text>}
                  <Text style={styles.monthCardName}>{monthData.month}</Text>
                  <Text style={styles.monthCardYear}>{monthData.year}</Text>
                  {hasEvents ? (
                    <>
                      <View style={styles.monthCardPills}>
                        {monthData.events.slice(0, 3).map((e) => {
                          const p = getEventTypePillStyle(e.type);
                          return (
                            <View key={e.id} style={[styles.monthCardPill, { backgroundColor: p.bg }]}>
                              <Text style={[styles.monthCardPillText, { color: p.text }]}>{e.type}</Text>
                            </View>
                          );
                        })}
                      </View>
                      <Text style={styles.monthCardCount}>
                        {monthData.events.length} {monthData.events.length === 1 ? 'event' : 'events'}
                      </Text>
                      <View style={styles.monthCardDots}>
                        {monthData.events.slice(0, 5).map((e) => (
                          <View key={e.id} style={[styles.monthCardDot, { backgroundColor: getEventTypeColor(e.type) }]} />
                        ))}
                      </View>
                    </>
                  ) : (
                    <Text style={styles.monthCardEmpty}>No events</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Month detail bottom sheet */}
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
            <View style={styles.modalContentWrapper} pointerEvents="box-none">
              {modalView === 'month' && selectedMonth && (
                <View style={[styles.sheetContainer, styles.monthSheetContainer]} onStartShouldSetResponder={() => true}>
                  <View style={styles.sheetHandle} />
                  <Text style={styles.sheetYear}>{selectedMonth.year}</Text>
                  <Text style={styles.sheetMonthTitle}>{selectedMonth.month}</Text>
                  <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetScrollContent} showsVerticalScrollIndicator>
                    {selectedMonth.events.length > 0 ? (
                      selectedMonth.events.map((event) => {
                        const pill = getEventTypePillStyle(event.type);
                        return (
                          <TouchableOpacity
                            key={event.id}
                            style={styles.eventPill}
                            onPress={() => openEventDetail(event)}
                            activeOpacity={0.8}
                          >
                            <View style={[styles.eventPillBar, { backgroundColor: pill.dot }]} />
                            <View style={styles.eventPillContent}>
                              <View style={[styles.eventPillBadge, { backgroundColor: pill.bg }]}>
                                <Text style={[styles.eventPillBadgeText, { color: pill.text }]}>{event.type}</Text>
                              </View>
                              <Text style={styles.eventPillTitle}>{event.title}</Text>
                              <View style={styles.eventPillLocationRow}>
                                <Ionicons name="location-outline" size={12} color={SPIRITUAL_COLORS.textMuted} />
                                <Text style={styles.eventPillLocationText} numberOfLines={1}>{event.location?.trim() || '—'}</Text>
                              </View>
                            </View>
                            <View style={styles.eventPillRight}>
                              <Text style={styles.eventPillDate}>{formatEventDate(event.date).split(',')[0]}</Text>
                              <Text style={styles.eventPillTime}>{event.time}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <Text style={styles.noEventsMessage}>No events scheduled this month</Text>
                    )}
                  </ScrollView>
                </View>
              )}

              {modalView === 'event' && selectedEvent && (
                <View style={[styles.sheetContainer, styles.eventSheetContainer]}>
                  <View style={styles.sheetHandle} />
                  <View style={styles.eventSheetHeader}>
                    <Text style={styles.eventSheetTitle} numberOfLines={2}>{selectedEvent.title}</Text>
                    <TouchableOpacity onPress={closeModal} style={styles.sheetCloseBtn}>
                      <Ionicons name="close" size={24} color={SPIRITUAL_COLORS.foreground} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetScrollContent} showsVerticalScrollIndicator>
                    <View style={[styles.eventPillBadge, styles.eventDetailBadge, { backgroundColor: getEventTypePillStyle(selectedEvent.type).bg }]}>
                      <Text style={[styles.eventPillBadgeText, { color: getEventTypePillStyle(selectedEvent.type).text }]}>{selectedEvent.type}</Text>
                    </View>
                    <View style={styles.eventDetailMeta}>
                      <View style={styles.eventDetailRow}>
                        <Ionicons name="calendar-outline" size={20} color={SPIRITUAL_COLORS.primary} />
                        <Text style={styles.eventDetailMetaText}>{formatEventDate(selectedEvent.date)}</Text>
                      </View>
                      <View style={styles.eventDetailRow}>
                        <Ionicons name="time-outline" size={20} color={SPIRITUAL_COLORS.primary} />
                        <Text style={styles.eventDetailMetaText}>{selectedEvent.time}</Text>
                      </View>
                      {selectedEvent.location ? (
                        <View style={styles.eventDetailRow}>
                          <Ionicons name="location-outline" size={20} color={SPIRITUAL_COLORS.primary} />
                          <Text style={styles.eventDetailMetaText}>{selectedEvent.location}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.descriptionSection}>
                      <Text style={styles.descriptionTitle}>Description</Text>
                      <Text style={styles.descriptionText}>
                        {selectedEvent.description?.trim() || 'No description available.'}
                      </Text>
                    </View>
                    {selectedEvent.link?.trim() ? (
                      <TouchableOpacity style={styles.seeMoreButtonLarge} onPress={() => handleSeeMore(selectedEvent)} activeOpacity={0.8}>
                        <Text style={styles.seeMoreButtonTextLarge}>See more</Text>
                        <Ionicons name="open-outline" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity style={styles.shareButtonContainer} onPress={() => handleShareEvent(selectedEvent)} activeOpacity={0.8}>
                      <LinearGradient colors={SPIRITUAL_GRADIENTS.meditation as [string, string]} style={styles.shareButtonGradient}>
                        <Ionicons name="share-outline" size={20} color={SPIRITUAL_COLORS.primaryForeground} />
                        <Text style={styles.shareButtonText}>Share Event</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: 'rgba(193,127,60,0.06)',
    zIndex: 0,
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
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(193,127,60,0.12)',
  },
  headerLabel: {
    fontSize: 10,
    color: SPIRITUAL_COLORS.accent,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
  },
  headerSubtitle: {
    fontSize: 13,
    color: SPIRITUAL_COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  heroCardWrap: {
    marginBottom: 20,
    borderRadius: 18,
    ...SPIRITUAL_SHADOWS.divine,
  },
  heroCard: {
    borderRadius: 18,
    padding: 18,
    paddingBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroCardCircles: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
  },
  heroCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroCircle2: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTypePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroTypePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.primaryForeground,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.primaryForeground,
    marginBottom: 10,
    lineHeight: 24,
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dividerMargin: {
    marginTop: 20,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(193,127,60,0.3)',
  },
  dividerLineRight: {},
  dividerText: {
    fontSize: 12,
    color: 'rgba(193,127,60,0.5)',
    letterSpacing: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  totalPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(193,127,60,0.1)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  totalPillText: {
    fontSize: 10,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '600',
  },
  allEventsList: {
    gap: 0,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(193,127,60,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  eventPillBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
    marginRight: 10,
  },
  eventPillContent: {
    flex: 1,
    minWidth: 0,
  },
  eventPillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  eventPillBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 20,
  },
  eventPillBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  eventPillTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
  },
  eventPillLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventPillLocationText: {
    fontSize: 11,
    color: SPIRITUAL_COLORS.textMuted,
    flex: 1,
  },
  eventPillRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  eventPillDate: {
    fontSize: 11,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primary,
  },
  eventPillTime: {
    fontSize: 11,
    color: SPIRITUAL_COLORS.textMuted,
    marginTop: 1,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  monthCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(193,127,60,0.15)',
    padding: 16,
    paddingTop: 14,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  monthCardCurrent: {
    backgroundColor: 'rgba(193,127,60,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(193,127,60,0.35)',
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  monthCardNow: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: SPIRITUAL_COLORS.primary,
    opacity: 0.8,
  },
  monthCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
  },
  monthCardYear: {
    fontSize: 11,
    color: SPIRITUAL_COLORS.accent,
    marginBottom: 10,
    opacity: 0.7,
  },
  monthCardPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8,
  },
  monthCardPill: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  monthCardPillText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  monthCardCount: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
  },
  monthCardDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  monthCardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  monthCardEmpty: {
    fontSize: 11,
    fontStyle: 'italic',
    color: 'rgba(139,69,19,0.35)',
    marginTop: 4,
  },
  bottomPadding: {
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,10,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  sheetContainer: {
    backgroundColor: SPIRITUAL_COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
    ...SPIRITUAL_SHADOWS.divine,
  },
  monthSheetContainer: {
    height: MONTH_MODAL_MAX_HEIGHT,
    maxHeight: MONTH_MODAL_MAX_HEIGHT,
  },
  eventSheetContainer: {
    height: screenHeight * 0.88,
    maxHeight: screenHeight * 0.88,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(193,127,60,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetYear: {
    fontSize: 10,
    color: SPIRITUAL_COLORS.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sheetMonthTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 16,
  },
  sheetScroll: { flex: 1, minHeight: 0 },
  sheetScrollContent: { paddingBottom: 24, flexGrow: 1 },
  noEventsMessage: {
    fontSize: 13,
    color: SPIRITUAL_COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  eventSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eventSheetTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
    marginRight: 12,
  },
  sheetCloseBtn: {
    padding: 4,
  },
  eventDetailBadge: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  eventDetailMeta: {
    gap: 12,
    marginBottom: 24,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailMetaText: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
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
  seeMoreButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: SPIRITUAL_COLORS.primary,
    gap: 8,
  },
  seeMoreButtonTextLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.primaryForeground,
  },
  shareButtonContainer: {
    marginTop: 16,
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
});
