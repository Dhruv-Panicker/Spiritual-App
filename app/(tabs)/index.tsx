import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
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
    //for the auto rotate of the quotes on the home screen
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

          {/* Daily Quotes – swipable + auto-rotate */}
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

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `mailto:noreply.gurudevapp@gmail.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20account%20and%20all%20associated%20data.%0A%0AMy%20email%3A%20${encodeURIComponent(user?.email ?? '')}`
              )
            }
            activeOpacity={0.6}
          >
            <Text style={styles.deleteAccountText}>Delete my account</Text>
          </TouchableOpacity>

          <View style={styles.footerSpacer} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
