import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <Image
              source={require('@/assets/images/siddhasana-yoga.jpeg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(247,236,220,0)', 'rgba(247,236,220,0.85)', '#F7ECDC']}
              style={styles.heroFade}
            />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Siddhasana</Text>
              <Text style={styles.heroSubtitle}>Intentional living, offered freely</Text>
            </View>
          </View>

          {/* Content Card */}
          <Animated.View style={[styles.contentCard, { opacity: fadeAnim }]}>
            <View style={styles.section}>
              <Text style={styles.bodyText}>
                Siddhasana is a flagship lifestyle program built around one idea: intentional living. It is completely free to access for anyone.
              </Text>

              <Text style={styles.bodyText}>
                The flagship experience is a residential silence retreat, structured to lift consciousness out of the subconscious and into higher conscious living. It unfolds over seven levels. Each level has its own activities, guidelines, and purpose, and each one is crafted to bring the untrained, distracted mind a step closer to more complete living. People tend to leave a level lighter than they arrived, carrying a happiness that was already theirs.
              </Text>

              <Text style={styles.bodyText}>
                The residential retreats are held every month at Sri Siddheshwar Tirth, in the calm and lush mountains of Tirupati, India. Three-day international retreats are held in different parts of the world. Two-hour sessions are conducted in person at conferences, organizations, and universities, and online workshops run worldwide through the year.
              </Text>

              <Text style={styles.bodyText}>
                Residential retreats are open to anyone from the age of 25. Workshops are open to adults, and to children from the age of 14. All of it is built and sustained purely by the labor of love. There is absolutely no charge to participate in any residential retreat in India.
              </Text>

              <Text style={styles.bodyText}>
                The reason for all of it is simple. Most of us live in the subconscious, and the days pass in a blur. We react, we carry, and we repeat. Stress, anxiety, anger, fear, guilt, hurt, and sadness are not who we are. They are signs of internal energy worn thin. Siddhasana meets that directly, through the pure element of silence, sharing the art of living above emotional baggage rather than compartmentalizing it. What follows is a life with more freedom in it, and a way of living that is chosen rather than inherited.
              </Text>

              <Text style={styles.closingText}>
                Join us and explore your inner world for outer development.
              </Text>
            </View>
          </Animated.View>

          {/* See Upcoming Events CTA */}
          <View style={styles.eventsSection}>
            <LinearGradient
              colors={['#faf5ef', '#f0e4d4']}
              style={styles.eventsCard}
            >
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
          <View style={styles.footerDivider}>
            <View style={styles.footerDividerLine} />
            <Text style={styles.footerDividerStar}>✦</Text>
            <View style={styles.footerDividerLine} />
          </View>
        </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
