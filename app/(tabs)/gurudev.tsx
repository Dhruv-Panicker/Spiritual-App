
import React, { useState, useRef, useEffect } from 'react';
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
import Toast from 'react-native-toast-message';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const shareText = "🙏 I've been inspired by the teachings shared in this beautiful spiritual app. Thought you might find it meaningful too!";
    
    try {
      await Share.share({
        message: shareText,
        title: 'Meet Our Gurudev',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Unable to share at this time.',
      });
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
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <Image
              source={require('@/assets/images/om-symbol.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
              style={styles.heroOverlay}
            />
            <View style={styles.heroContent}>
              <Animated.View style={[styles.omContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Image
                  source={require('@/assets/images/om-symbol.png')}
                  style={styles.omSymbol}
                  resizeMode="contain"
                />
              </Animated.View>
              <Text style={styles.heroTitle}>Gurudev</Text>
              <Text style={styles.heroSubtitle}>A beacon of wisdom and compassion</Text>
            </View>
          </View>

          {/* Content Card */}
          <Animated.View style={[styles.contentCard, { opacity: fadeAnim }]}>
            {/* Drop Cap Introduction */}
            <View style={styles.introSection}>
              <View style={styles.dropCapContainer}>
                <Text style={styles.dropCap}>I</Text>
                <Text style={styles.introText}>
                  n the sacred tradition of spiritual awakening, our beloved Gurudev stands as a living embodiment of divine wisdom and unconditional love. For over three decades, he has dedicated his life to guiding souls on their journey toward inner peace and self-realization.
                </Text>
              </View>
            </View>

            {/* Biography Content */}
            <View style={styles.biographySection}>
              <Text style={styles.bodyText}>
                Born into a family of spiritual seekers, Gurudev's path was illuminated from an early age. His profound understanding of ancient Vedantic teachings, combined with a deep compassion for all beings, has touched millions of hearts across the globe.
              </Text>

              {/* Quote Section */}
              <View style={styles.quoteContainer}>
                <Text style={styles.quoteText}>
                  "The purpose of life is not to be happy, but to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well."
                </Text>
                <Text style={styles.quoteAuthor}>— Gurudev</Text>
              </View>

              <Text style={styles.bodyText}>
                Through his teachings, Gurudev emphasizes the practical application of spiritual principles in daily life. His approach bridges the ancient wisdom of the East with the practical needs of modern living, making profound truths accessible to seekers from all walks of life.
              </Text>

              <Text style={styles.bodyText}>
                His ashram serves as a sanctuary where thousands come seeking solace, wisdom, and spiritual guidance. The transformative power of his presence and teachings continues to inspire a global community of practitioners committed to inner growth and service to humanity.
              </Text>

              {/* Core Teachings Section */}
              <LinearGradient
                colors={SPIRITUAL_GRADIENTS.meditation}
                style={styles.teachingsContainer}
              >
                <Animated.View style={[styles.teachingsOmContainer, { transform: [{ scale: pulseAnim }] }]}>
                  <Image
                    source={require('@/assets/images/om-symbol.png')}
                    style={styles.teachingsOm}
                    resizeMode="contain"
                  />
                </Animated.View>
                <Text style={styles.teachingsTitle}>Core Teachings</Text>
                <View style={styles.teachingsGrid}>
                  <View style={styles.teachingItem}>
                    <Text style={styles.teachingTitle}>Meditation</Text>
                    <Text style={styles.teachingDesc}>The path to inner silence and self-discovery</Text>
                  </View>
                  <View style={styles.teachingItem}>
                    <Text style={styles.teachingTitle}>Service</Text>
                    <Text style={styles.teachingDesc}>Selfless action as spiritual practice</Text>
                  </View>
                  <View style={styles.teachingItem}>
                    <Text style={styles.teachingTitle}>Wisdom</Text>
                    <Text style={styles.teachingDesc}>Ancient knowledge for modern living</Text>
                  </View>
                </View>
              </LinearGradient>

              <Text style={styles.bodyText}>
                Today, Gurudev's mission continues to expand, reaching new generations of seekers through technology while maintaining the timeless essence of spiritual transmission. His message remains simple yet profound: {' '}
                <Text style={styles.emphasizedText}>
                  "Find the divine within yourself, and you will see it everywhere."
                </Text>
              </Text>
            </View>
          </Animated.View>

          {/* Share App CTA */}
          <View style={styles.shareSection}>
            <LinearGradient
              colors={SPIRITUAL_GRADIENTS.divine}
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
                <Ionicons name="share-outline" size={20} color={SPIRITUAL_COLORS.foreground} />
                <Text style={styles.shareButtonText}>Share App</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
      <Toast />
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
    tintColor: SPIRITUAL_COLORS.omGold,
    opacity: 0.3,
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
  omContainer: {
    marginBottom: 16,
  },
  omSymbol: {
    width: 48,
    height: 48,
    tintColor: SPIRITUAL_COLORS.omGold,
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
  introSection: {
    marginBottom: 24,
  },
  dropCapContainer: {
    flexDirection: 'row',
  },
  dropCap: {
    fontSize: 64,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.primary,
    lineHeight: 64,
    marginRight: 8,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  introText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
    color: SPIRITUAL_COLORS.foreground,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
  quoteContainer: {
    backgroundColor: 'rgba(244, 228, 193, 0.3)',
    borderRadius: 12,
    padding: 24,
    marginVertical: 8,
  },
  quoteText: {
    ...SPIRITUAL_TYPOGRAPHY.quoteText,
    fontSize: 18,
    lineHeight: 28,
    color: SPIRITUAL_COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  quoteAuthor: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'right',
    marginTop: 12,
    fontStyle: 'normal',
  },
  teachingsContainer: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 8,
  },
  teachingsOmContainer: {
    marginBottom: 16,
  },
  teachingsOm: {
    width: 64,
    height: 64,
    tintColor: SPIRITUAL_COLORS.primaryForeground,
  },
  teachingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.primaryForeground,
    marginBottom: 16,
    textAlign: 'center',
  },
  teachingsGrid: {
    gap: 16,
    width: '100%',
  },
  teachingItem: {
    alignItems: 'center',
    marginBottom: 12,
  },
  teachingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.primaryForeground,
    marginBottom: 4,
  },
  teachingDesc: {
    fontSize: 14,
    color: 'rgba(253, 248, 243, 0.9)',
    textAlign: 'center',
  },
  emphasizedText: {
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  shareSection: {
    margin: 16,
    marginTop: 24,
  },
  shareCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.primaryForeground,
    marginBottom: 8,
    textAlign: 'center',
  },
  shareSubtitle: {
    fontSize: 16,
    color: 'rgba(253, 248, 243, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPIRITUAL_COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    ...SPIRITUAL_SHADOWS.card,
  },
  shareButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
  },
});
