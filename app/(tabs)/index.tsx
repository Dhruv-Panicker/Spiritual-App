import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/contexts/QuotesContext';
import { useVideos } from '@/contexts/VideosContext';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';
import { styles } from '@/styles/index.styles';

const { width: screenWidth } = Dimensions.get('window');
const QUOTE_CARD_PADDING = 80;
const quotePageWidth = screenWidth - QUOTE_CARD_PADDING;

const ROTATE_QUOTE_INTERVAL_MS = 5000;

const TILE_THEME_COLORS = [
  '#c17f3c', // – Daily Quotes
  '#a67c52', //  – Calendar
  '#a0522d', // – Videos
  '#b07d62', // – About Siddhguru
  '#8b6914', // – Siddhasana
  '#b5651d', // – Send Prayer
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
  const { liveStatus } = useVideos();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const quoteScrollRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);

  const liveAvailable = liveStatus.isLive && !!liveStatus.liveVideoId;

  const threeRecentQuotes = React.useMemo(() => {
    const sorted = [...quotes].sort((a, b) =>
      (b.dateAdded || '').localeCompare(a.dateAdded || '')
    );
    return sorted.slice(0, 3);
  }, [quotes]);

  // Activity slides: live broadcast (if any) first, then recent quotes.
  type ActivitySlide =
    | { type: 'live' }
    | { type: 'quote'; quote: (typeof threeRecentQuotes)[number] };
  const slides: ActivitySlide[] = React.useMemo(() => {
    const quoteSlides = threeRecentQuotes.map(
      (quote) => ({ type: 'quote', quote } as ActivitySlide)
    );
    return liveAvailable ? [{ type: 'live' }, ...quoteSlides] : quoteSlides;
  }, [liveAvailable, threeRecentQuotes]);

  // Clamp the active index when the slide count changes (e.g. live ends).
  useEffect(() => {
    if (quoteIndex > slides.length - 1) {
      setQuoteIndex(Math.max(0, slides.length - 1));
    }
  }, [slides.length, quoteIndex]);

  useEffect(() => {
    if (slides.length < 2) return;
    //for the auto rotate of the activity cards on the home screen
    const interval = setInterval(() => {
      if (isUserScrolling.current) return;
      const next = (quoteIndex + 1) % slides.length;
      setQuoteIndex(next);
      quoteScrollRef.current?.scrollTo({
        x: next * quotePageWidth,
        animated: true,
      });
    }, ROTATE_QUOTE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [slides.length, quoteIndex]);

  const goToLiveStream = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/(tabs)/videos');
  };

  const handleLogout = () => {
    setAccountMenuVisible(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    logout();
  };

  const handleDeleteAccount = () => {
    setAccountMenuVisible(false);
    Linking.openURL(
      `mailto:noreply.gurudevapp@gmail.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20account%20and%20all%20associated%20data.%0A%0AMy%20email%3A%20${encodeURIComponent(user?.email ?? '')}`
    );
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
      title: "Om Siddheshwar's Videos",
      description: 'Experience spiritual guidance through sacred video content',
      onPress: () => router.push('/(tabs)/videos'),
      accentColor: TILE_THEME_COLORS[2],
    },
    {
      icon: 'person-outline' as const,
      title: 'About Om Siddheshwar',
      description: "Connect with the teachings of Sri Sidheshwar Brahmrishi",
      onPress: () => router.push('/(tabs)/gurudev'),
      accentColor: TILE_THEME_COLORS[3],
    },
    {
      icon: 'flower-outline' as const,
      title: 'Siddhasana',
      description: 'Deepen your practice through stillness and sacred posture',
      onPress: () => router.push('/(tabs)/siddhasana' as never),
      accentColor: TILE_THEME_COLORS[4],
    },
    {
      icon: 'heart-outline' as const,
      title: 'Send Prayer',
      description: 'Share your prayers and intentions with the community',
      onPress: () => router.push('/(tabs)/prayer' as never),
      accentColor: TILE_THEME_COLORS[5],
    },
  ];

  const renderSlide = (slide: ActivitySlide) => {
    if (slide.type === 'live') {
      return (
        <View style={styles.liveSlide}>
          <View style={styles.liveSlideHeader}>
            <View style={styles.liveSlideDot} />
            <Text style={styles.liveSlideLabel}>NOW LIVE</Text>
          </View>
          <Text style={styles.liveSlideTitle} numberOfLines={2}>
            Sri Sidheshwar Live Broadcast
          </Text>
          <TouchableOpacity
            style={styles.liveSlideButton}
            onPress={goToLiveStream}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={styles.liveSlideButtonText}>Join Now</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <>
        <Text style={styles.dailyQuoteText}>{slide.quote.text}</Text>
        <Text style={styles.dailyQuoteAuthor}>— {slide.quote.author}</Text>
      </>
    );
  };

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
                  source={require('@/assets/images/app-main-icon.png')}
                  style={styles.omLogo}
                  resizeMode="contain"
                />
              </View>
              <TouchableOpacity
                style={styles.accountButton}
                onPress={() => setAccountMenuVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="person-circle-outline" size={34} color={SPIRITUAL_COLORS.primary} />
              </TouchableOpacity>

              <Modal
                visible={accountMenuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAccountMenuVisible(false)}
              >
                <TouchableOpacity
                  style={styles.dropdownBackdrop}
                  activeOpacity={1}
                  onPress={() => setAccountMenuVisible(false)}
                >
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout} activeOpacity={0.7}>
                      <Ionicons name="log-out-outline" size={18} color={SPIRITUAL_COLORS.primary} />
                      <Text style={styles.dropdownItemText}>Logout</Text>
                    </TouchableOpacity>
                    <View style={styles.dropdownDivider} />
                    <TouchableOpacity style={styles.dropdownItem} onPress={handleDeleteAccount} activeOpacity={0.7}>
                      <Ionicons name="trash-outline" size={18} color="#c0392b" />
                      <Text style={[styles.dropdownItemText, { color: '#c0392b' }]}>Delete my account</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>

          {/* Hero: SIDDGURU / Sri Sidheshwar Brahmrishi / description */}
          <View style={styles.hero}>
            <Text style={styles.heroMainTitle}>Om Siddheshwar Brahmrishi Ji</Text>
            <Text style={styles.heroSubTitle}>A Living Divine Power</Text>
            <View style={styles.heroDescriptionWrap}>
              <Text style={styles.heroDescription}>
                The supreme global ambassador of divine consciousness, universal peace, spirituality, humanity, and non-violence
              </Text>
            </View>
          </View>

          {/* Hero image */}
          <View style={styles.heroImageContainer}>
            <View style={styles.heroImageClip}>
              <Image
                source={require('@/assets/images/hero-image-1.jpeg')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Divider */}
          <Text style={styles.divider}>— ✦ —</Text>

          {/* Activity – live broadcast + recent quotes, swipable + auto-rotate */}
          <View style={styles.dailyQuotesCard}>
            <View style={styles.dailyQuotesAccent} />
            {slides.length === 0 ? (
              <Text style={styles.dailyQuotePlaceholder}>
                No quotes yet. Add some in Daily Quotes.
              </Text>
            ) : slides.length === 1 ? (
              <View style={[styles.quoteContent, styles.quotePage]}>
                {renderSlide(slides[0])}
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
                    setQuoteIndex(Math.min(index, slides.length - 1));
                    isUserScrolling.current = false;
                  }}
                  scrollEventThrottle={16}
                  decelerationRate="fast"
                  contentContainerStyle={styles.quoteScrollContent}
                >
                  {slides.map((slide, i) => (
                    <View key={i} style={[styles.quotePage, { width: quotePageWidth }]}>
                      {renderSlide(slide)}
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.dots}>
                  {slides.map((_, i) => (
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
                accentColor={feature.accentColor}
              />
            ))}
          </View>

          {/* Bottom image */}
          <View style={styles.bottomImageContainer}>
            <View style={styles.bottomImageClip}>
              <Image
                source={require('@/assets/images/bottom-image-1.jpeg')}
                style={styles.bottomImage}
                resizeMode="cover"
              />
            </View>
          </View>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
