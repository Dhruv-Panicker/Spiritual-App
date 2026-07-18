import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useEvents, type MonthData, type Event } from '@/contexts/EventsContext';
import { shareService } from '@/services/shareService';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_PALETTE } from '@/constants/SpiritualColors';
import { styles } from '@/styles/calendar.styles';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 16 * 2 - 12) / 2;

// Type pill styles (mockup: light bg + colored text)
function getEventTypePillStyle(type: Event['type']) {
  const styles = {
    meditation: { bg: SPIRITUAL_PALETTE.marigoldLo, text: SPIRITUAL_PALETTE.brown800, dot: SPIRITUAL_PALETTE.marigold, icon: 'flower-outline' as const },
    teaching: { bg: SPIRITUAL_PALETTE.brown200, text: SPIRITUAL_PALETTE.brown800, dot: SPIRITUAL_PALETTE.brown600, icon: 'book-outline' as const },
    celebration: { bg: SPIRITUAL_PALETTE.kumkum, text: SPIRITUAL_PALETTE.bg, dot: SPIRITUAL_PALETTE.kumkum, icon: 'sparkles-outline' as const },
    retreat: { bg: SPIRITUAL_PALETTE.tulsiLo, text: SPIRITUAL_PALETTE.tulsi, dot: SPIRITUAL_PALETTE.tulsi, icon: 'leaf-outline' as const },
  };
  return styles[type] || { bg: SPIRITUAL_PALETTE.sunken, text: SPIRITUAL_PALETTE.brown600, dot: SPIRITUAL_PALETTE.brown400, icon: 'ellipse-outline' as const };
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
    monthNames,
    getEventTypeColor,
    loading,
  } = useEvents();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalView, setModalView] = useState<'month' | 'event'>('month');
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Drag-to-dismiss for the bottom sheets: grab the handle area and swipe down
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const sheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) sheetTranslateY.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > 120 || g.vy > 0.8) {
          Animated.timing(sheetTranslateY, { toValue: 700, duration: 180, useNativeDriver: true }).start(() => {
            sheetTranslateY.setValue(0);
            closeModal();
          });
        } else {
          Animated.spring(sheetTranslateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

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
    sheetTranslateY.setValue(0);
    setSelectedMonth(monthData);
    setModalView('month');
    setModalVisible(true);
  };

  const openEventDetail = (event: Event) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sheetTranslateY.setValue(0);
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
    <View style={styles.container}>
      <LinearGradient colors={['#fdf6ec', '#f5e2c4']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header (mockup style) */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Calendar of Events</Text>
            <Text style={styles.headerSubtitle}>Upcoming teachings & gatherings</Text>
          </View>

          {/* Next Upcoming Event hero card */}
          {nextEvent && (
            <TouchableOpacity
              style={styles.heroCardWrap}
              onPress={() => openEventDetail(nextEvent)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={SPIRITUAL_GRADIENTS.marigold as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <View style={styles.heroCardCircles}>
                  <View style={styles.heroCircle1} />
                  <View style={styles.heroCircle2} />
                </View>
                <Text style={styles.heroLabel}> Next Upcoming Event</Text>
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
                        <Ionicons name={pill.icon} size={16} color={pill.text} />
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
          {/* Ornamental divider – page footer */}
          <View style={[styles.divider, styles.dividerMargin]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>— ✦ —</Text>
            <View style={[styles.dividerLine, styles.dividerLineRight]} />
          </View>
          <View style={styles.bottomPadding} />
        </ScrollView>
        </SafeAreaView>

        {/* Month detail bottom sheet */}
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
            <View style={styles.modalContentWrapper} pointerEvents="box-none">
              {modalView === 'month' && selectedMonth && (
                <Animated.View
                  style={[styles.sheetContainer, styles.monthSheetContainer, { transform: [{ translateY: sheetTranslateY }] }]}
                  onStartShouldSetResponder={() => true}
                >
                  <View {...sheetPanResponder.panHandlers}>
                    <View style={styles.sheetHandle} />
                    <Text style={styles.sheetYear}>{selectedMonth.year}</Text>
                    <Text style={styles.sheetMonthTitle}>{selectedMonth.month}</Text>
                  </View>
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
                                <Ionicons name={pill.icon} size={16} color={pill.text} />
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
                </Animated.View>
              )}

              {modalView === 'event' && selectedEvent && (
                <Animated.View
                  style={[styles.sheetContainer, styles.eventSheetContainer, { transform: [{ translateY: sheetTranslateY }] }]}
                  onStartShouldSetResponder={() => true}
                >
                  <View {...sheetPanResponder.panHandlers}>
                    <View style={styles.sheetHandle} />
                  </View>
                  <View style={styles.eventSheetHeader}>
                    <Text style={styles.eventSheetTitle} numberOfLines={2}>{selectedEvent.title}</Text>
                    <TouchableOpacity onPress={closeModal} style={styles.sheetCloseBtn}>
                      <Ionicons name="close" size={24} color={SPIRITUAL_COLORS.foreground} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetScrollContent} showsVerticalScrollIndicator>
                    <View style={[styles.eventPillBadge, styles.eventDetailBadge, { backgroundColor: getEventTypePillStyle(selectedEvent.type).bg }]}>
                      <Ionicons name={getEventTypePillStyle(selectedEvent.type).icon} size={16} color={getEventTypePillStyle(selectedEvent.type).text} />
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
                </Animated.View>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    </View>
  );
}
