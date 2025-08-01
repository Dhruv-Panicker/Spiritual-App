
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

export default function HomeScreen() {
  const handleNavigateToSection = async (section: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/${section}` as any);
  };

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
          {/* Header Section */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/om-symbol.png')}
              style={styles.omSymbol}
              resizeMode="contain"
            />
            <Text style={styles.title}>Spiritual Wisdom</Text>
            <Text style={styles.subtitle}>Find peace in daily wisdom</Text>
          </View>

          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome, Seeker</Text>
            <Text style={styles.welcomeText}>
              Begin your spiritual journey with daily quotes, inspiring videos, and peaceful exploration.
            </Text>
          </View>

          {/* Navigation Cards */}
          <View style={styles.navigationGrid}>
            <TouchableOpacity
              style={styles.navCard}
              onPress={() => handleNavigateToSection('quotes')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B35', '#FF8F65']}
                style={styles.navCardGradient}
              >
                <Ionicons name="book" size={32} color={SPIRITUAL_COLORS.primaryForeground} />
                <Text style={styles.navCardTitle}>Daily Quotes</Text>
                <Text style={styles.navCardDescription}>
                  Discover wisdom from ancient texts and modern teachers
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCard}
              onPress={() => handleNavigateToSection('videos')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8E6A5B', '#A67C6A']}
                style={styles.navCardGradient}
              >
                <Ionicons name="play-circle" size={32} color={SPIRITUAL_COLORS.primaryForeground} />
                <Text style={styles.navCardTitle}>Sacred Videos</Text>
                <Text style={styles.navCardDescription}>
                  Watch inspiring spiritual content and teachings
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCard}
              onPress={() => handleNavigateToSection('explore')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#D4A574', '#E6B887']}
                style={styles.navCardGradient}
              >
                <Ionicons name="compass" size={32} color={SPIRITUAL_COLORS.foreground} />
                <Text style={[styles.navCardTitle, { color: SPIRITUAL_COLORS.foreground }]}>
                  Explore
                </Text>
                <Text style={[styles.navCardDescription, { color: SPIRITUAL_COLORS.textMuted }]}>
                  Discover new paths and spiritual practices
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Daily Inspiration */}
          <View style={styles.inspirationCard}>
            <Text style={styles.inspirationTitle}>Today's Inspiration</Text>
            <Text style={styles.inspirationQuote}>
              "The journey of a thousand miles begins with a single step."
            </Text>
            <Text style={styles.inspirationAuthor}>- Lao Tzu</Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  omSymbol: {
    width: 60,
    height: 60,
    marginBottom: 12,
    tintColor: SPIRITUAL_COLORS.omGold,
  },
  title: {
    fontSize: 28,
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
  welcomeCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationGrid: {
    gap: 16,
    marginBottom: 24,
  },
  navCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SPIRITUAL_SHADOWS.card,
  },
  navCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  navCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primaryForeground,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  navCardDescription: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.primaryForeground,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  inspirationCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: SPIRITUAL_COLORS.primary,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  inspirationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  inspirationQuote: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  inspirationAuthor: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
});
