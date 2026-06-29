import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';
import { styles } from '@/styles/siddhasana.styles';

export default function SiddhasanaScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const goToEvents = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/calendar');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            {/* TODO: Replace LinearGradient below with Image once photo is provided */}
            <LinearGradient
              colors={['#8B5E2A', '#c17f3c', '#fdf6ec']}
              style={styles.heroImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
              style={styles.heroOverlay}
            />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Siddhasana</Text>
              <Text style={styles.heroSubtitle}>The ancient seat of the Siddhas</Text>
            </View>
          </View>

          {/* Content Card */}
          <Animated.View style={[styles.contentCard, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              {/* TODO: Replace placeholder paragraphs below with actual content */}
              <Text style={styles.bodyText}>
                [Paragraph 1 — content to be added]
              </Text>

              <Text style={styles.bodyText}>
                [Paragraph 2 — content to be added]
              </Text>

              <Text style={styles.bodyText}>
                [Paragraph 3 — content to be added]
              </Text>

              <Text style={styles.bodyText}>
                [Paragraph 4 — content to be added]
              </Text>
            </View>
          </Animated.View>

          {/* See Upcoming Events CTA */}
          <View style={styles.eventsSection}>
            <LinearGradient
              colors={['#faf5ef', '#f0e4d4']}
              style={styles.eventsCard}
            >
              <Text style={styles.eventsTitle}>Join the Community</Text>
              <Text style={styles.eventsSubtitle}>
                Explore upcoming gatherings, meditations, and sacred celebrations
              </Text>
              <TouchableOpacity
                style={styles.eventsButton}
                onPress={goToEvents}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                <Text style={styles.eventsButtonText}>See Upcoming Events</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
