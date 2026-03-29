import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Image,
  Share,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

const { height: screenHeight } = Dimensions.get('window');

export default function GurudevScreen() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sacred pulse animation for Om symbol
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => pulseAnimation.stop();
  }, []);

  const shareApp = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const shareText = "🙏 I've been inspired by the teachings shared in this beautiful spiritual app. Thought you might find it meaningful too!";
    
    try {
      await Share.share({
        message: shareText,
        title: 'Meet Our Siddhguru',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Hero Section - Siddhguru profile image backdrop */}
          <View style={styles.heroContainer}>
            <Image
              source={require('@/assets/images/gurudev-profile-image.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
              style={styles.heroOverlay}
            />
            <View style={styles.heroContent}>
              <Animated.View style={[styles.omLogoWrap, { transform: [{ scale: pulseAnim }] }]}>
                <Image
                  source={require('@/assets/images/om_logo_transparent.png')}
                  style={styles.omLogo}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.heroTitle}>Siddhguru</Text>
              <Text style={styles.heroSubtitle}>A beacon of wisdom and compassion</Text>
            </View>
          </View>

          {/* Content Card */}
          <Animated.View style={[styles.contentCard, { opacity: fadeAnim }]}>
            <View style={styles.biographySection}>
              <Text style={styles.bodyText}>
                Siddhguru, also often known as Gurudev, spent over 50 years in deep, uninterrupted meditation and self-inquiry. That sustained focus has given him an unprecedented level of clarity about the rhythm of life and how to apply ancient wisdom to our modern challenges.
              </Text>

              <Text style={styles.bodyText}>
                Over the past 20 years, he has travelled to 190+ countries and supported millions, uplifting them with his divine capability. He has mastered the eight ‘siddhis’ — abilities described in ancient traditions that reflect a high level of inner development and control over the mind. While these abilities are often framed in spiritual language, those who spend time with him tend to experience something more understandable: a clarity of thought and a quiet mind for the first time that is difficult to explain but easy to recognize.
              </Text>

              <Text style={styles.bodyText}>
                He has advised world leaders including former presidents, prime ministers, and business leaders on navigating complex decisions during periods of uncertainty and pressure.
              </Text>

              <Text style={styles.bodyText}>
                His ashram, or monastery, is located in Tirupati, India, where all programs are offered freely. The intention is simple: to make self-development and self-upliftment accessible to anyone without barriers.
              </Text>

              <Text style={styles.bodyText}>
                At the core of his teaching is living not for happiness, but with happiness. Some describe his teaching in spiritual terms, while others simply experience it as a way to think more clearly and live with more direction.
              </Text>
            </View>
          </Animated.View>

          {/* Share App CTA */}
          <View style={styles.shareSection}>
            <LinearGradient
              colors={['#faf5ef', '#f0e4d4']}
              style={styles.shareCard}
            >
              <Text style={styles.shareTitle}>Share the Teaching</Text>
              <Text style={styles.shareSubtitle}>
                Share this app with someone who might find it meaningful
              </Text>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareApp}
                activeOpacity={0.8}
              >
                <Ionicons name="share-outline" size={20} color={SPIRITUAL_COLORS.primary} />
                <Text style={styles.shareButtonText}>Share App</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: screenHeight * 0.5,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  omLogoWrap: {
    marginBottom: 16,
  },
  omLogo: {
    width: 48,
    height: 48,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    ...SPIRITUAL_SHADOWS.divine,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  contentCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 16,
    padding: 24,
    ...SPIRITUAL_SHADOWS.divine,
  },
  biographySection: {
    gap: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    color: SPIRITUAL_COLORS.foreground,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  shareSection: {
    margin: 16,
    marginTop: 24,
  },
  shareCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(193,127,60,0.18)',
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  shareSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(193,127,60,0.22)',
  },
  shareButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primary,
  },
});
