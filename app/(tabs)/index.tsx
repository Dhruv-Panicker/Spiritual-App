import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/contexts/QuotesContext';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

const { width: screenWidth } = Dimensions.get('window');
const QUOTE_CARD_PADDING = 80;
const quotePageWidth = screenWidth - QUOTE_CARD_PADDING;

const ROTATE_QUOTE_INTERVAL_MS = 5000;

const TILE_THEME_COLORS = [
  '#c17f3c', // copper / amber – Daily Quotes
  '#a67c52', // warm pastel tan – Calendar
  '#a0522d', // sienna / rust – Videos
  '#b07d62', // dusty rose-brown – About Siddhguru
  '#b5651d', // warm brown-red (accent) – Send Prayer
] as const;

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  fullWidth?: boolean;
  accentColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onPress, fullWidth, accentColor }) => {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity style={[styles.featureCard, fullWidth && styles.featureCardFullWidth]} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.featureCardInner}>
        <View style={[styles.featureAccent, { backgroundColor: accentColor }]} />
        <View style={styles.featureIconWrap}>
          <Ionicons name={icon} size={26} color={accentColor} />
        </View>
        <Text style={[styles.featureTitle, { color: accentColor }]}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { quotes } = useQuotes();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quoteScrollRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);

  const threeRecentQuotes = React.useMemo(() => {
    const sorted = [...quotes].sort((a, b) =>
      (b.dateAdded || '').localeCompare(a.dateAdded || '')
    );
    return sorted.slice(0, 3);
  }, [quotes]);

  useEffect(() => {
    if (threeRecentQuotes.length < 2) return;
    const interval = setInterval(() => {
      if (isUserScrolling.current) return;
      const next = (quoteIndex + 1) % threeRecentQuotes.length;
      setQuoteIndex(next);
      quoteScrollRef.current?.scrollTo({
        x: next * quotePageWidth,
        animated: true,
      });
    }, ROTATE_QUOTE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [threeRecentQuotes.length, quoteIndex]);

  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    logout();
  };

  const features = [
    {
      icon: 'book-outline' as const,
      title: 'Daily Quotes',
      description: 'Discover wisdom through sacred teachings and spiritual insights',
      onPress: () => router.push('/(tabs)/quotes'),
      accentColor: TILE_THEME_COLORS[0],
    },
    {
      icon: 'calendar-outline' as const,
      title: 'Calendar',
      description: 'Stay connected with spiritual events and celebrations',
      onPress: () => router.push('/(tabs)/calendar'),
      accentColor: TILE_THEME_COLORS[1],
    },
    {
      icon: 'play-circle-outline' as const,
      title: "Siddhguru's Videos",
      description: 'Experience spiritual guidance through sacred video content',
      onPress: () => router.push('/(tabs)/videos'),
      accentColor: TILE_THEME_COLORS[2],
    },
    {
      icon: 'person-outline' as const,
      title: 'About Siddhguru',
      description: "Connect with the teachings of Sri Sidheshwar Brahmrishi",
      onPress: () => router.push('/(tabs)/gurudev'),
      accentColor: TILE_THEME_COLORS[3],
    },
    {
      icon: 'heart-outline' as const,
      title: 'Send Prayer',
      description: 'Share your prayers and intentions with the community',
      onPress: () => router.push('/(tabs)/prayer' as never),
      fullWidth: true,
      accentColor: TILE_THEME_COLORS[4],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header: OM logo + Logout */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Image
                  source={require('@/assets/images/om_logo_transparent.png')}
                  style={styles.omLogo}
                  resizeMode="contain"
                />
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={20} color={SPIRITUAL_COLORS.primary} />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero: SIDDGURU / Sri Sidheshwar Brahmrishi / description */}
          <View style={styles.hero}>
            <Text style={styles.heroMainTitle}>SIDDHGURU</Text>
            <Text style={styles.heroSubTitle}>Sri Sidheshwar Brahmrishi</Text>
            <View style={styles.heroDescriptionWrap}>
              <Text style={styles.heroDescription}>
                An enlightened master dedicated to lifting your consciousness
              </Text>
            </View>
          </View>

          {/* Divider */}
          <Text style={styles.divider}>— ✦ —</Text>

          {/* Daily Quotes – shloka-style card, swipable + auto-rotate */}
          <View style={styles.dailyQuotesCard}>
            <View style={styles.dailyQuotesAccent} />
            <Text style={styles.dailyQuotesLabel}>☀ Daily Quotes</Text>
            {threeRecentQuotes.length === 0 ? (
              <Text style={styles.dailyQuotePlaceholder}>
                No quotes yet. Add some in Daily Quotes.
              </Text>
            ) : threeRecentQuotes.length === 1 ? (
              <View style={[styles.quoteContent, styles.quotePage]}>
                <Text style={styles.dailyQuoteText}>{threeRecentQuotes[0].text}</Text>
                <Text style={styles.dailyQuoteAuthor}>— {threeRecentQuotes[0].author}</Text>
              </View>
            ) : (
              <>
                <ScrollView
                  ref={quoteScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScrollBeginDrag={() => { isUserScrolling.current = true; }}
                  onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const index = Math.round(x / quotePageWidth);
                    setQuoteIndex(Math.min(index, threeRecentQuotes.length - 1));
                    isUserScrolling.current = false;
                  }}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  contentContainerStyle={styles.quoteScrollContent}
                >
                  {threeRecentQuotes.map((q, i) => (
                    <View key={i} style={[styles.quotePage, { width: quotePageWidth }]}>
                      <Text style={styles.dailyQuoteText}>{q.text}</Text>
                      <Text style={styles.dailyQuoteAuthor}>— {q.author}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.dots}>
                  {threeRecentQuotes.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === quoteIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Explore the Path – 5 boxes */}
          <Text style={styles.sectionTitle}>Explore the Path</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                onPress={feature.onPress}
                fullWidth={feature.fullWidth}
                accentColor={feature.accentColor}
              />
            ))}
          </View>

          {/* Siddhguru Says */}
          <View style={styles.gurudevSaysCard}>
            <Text style={styles.gurudevSaysLabel}>Siddhguru Says</Text>
            <Text style={styles.gurudevSaysText}>
              When you connect with the silence within you, that is when you can make sense of the disturbance going on around you.
            </Text>
            <Text style={styles.gurudevSaysAuthor}>— Sri Sidheshwar Brahmrishi</Text>
          </View>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

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
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,69,19,0.12)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  omLogo: {
    width: 80,
    height: 80,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(139,69,19,0.25)',
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primary,
    letterSpacing: 0.5,
  },
  hero: {
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  heroMainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.accent,
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroDescriptionWrap: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(193,127,60,0.4)',
    paddingLeft: 12,
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  divider: {
    textAlign: 'center',
    color: 'rgba(139,69,19,0.3)',
    fontSize: 16,
    marginVertical: 18,
    letterSpacing: 6,
  },
  dailyQuotesCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(193,127,60,0.2)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
    overflow: 'hidden',
    ...SPIRITUAL_SHADOWS.card,
  },
  dailyQuotesAccent: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: SPIRITUAL_COLORS.primary,
    borderRadius: 1,
  },
  dailyQuotesLabel: {
    fontSize: 10,
    color: SPIRITUAL_COLORS.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
    textAlign: 'center',
  },
  quoteContent: {
    minHeight: 60,
  },
  quoteScrollContent: {},
  quotePage: {
    paddingHorizontal: 4,
    minHeight: 60,
    justifyContent: 'center',
  },
  dailyQuoteText: {
    fontSize: 16,
    color: '#5a2d0c',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: '600',
  },
  dailyQuoteAuthor: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dailyQuotePlaceholder: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(193,127,60,0.25)',
  },
  dotActive: {
    width: 18,
    backgroundColor: SPIRITUAL_COLORS.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 14,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (screenWidth - 52) / 2,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  featureCardFullWidth: {
    width: '100%',
  },
  featureCardInner: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(193,127,60,0.18)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    minHeight: 120,
    position: 'relative',
    ...SPIRITUAL_SHADOWS.card,
  },
  featureAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: '40%',
    borderTopLeftRadius: 14,
  },
  featureIconWrap: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    color: SPIRITUAL_COLORS.textMuted,
    lineHeight: 16,
  },
  gurudevSaysCard: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(193,127,60,0.2)',
  },
  gurudevSaysLabel: {
    fontSize: 10,
    color: SPIRITUAL_COLORS.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  gurudevSaysText: {
    fontSize: 14,
    color: '#5a2d0c',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  gurudevSaysAuthor: {
    fontSize: 11,
    color: SPIRITUAL_COLORS.accent,
    marginTop: 8,
    textAlign: 'center',
  },
  footerSpacer: {
    height: 24,
  },
});
