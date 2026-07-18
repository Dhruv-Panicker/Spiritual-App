import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SPIRITUAL_GRADIENTS } from '@/constants/SpiritualColors';
import { styles } from '@/styles/gurudev.styles';

export default function GurudevScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

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
          {/* Hero Section - Om Siddheshwar profile image backdrop */}
          <View style={styles.heroContainer}>
            <Image
              source={require('@/assets/images/gurudev-profile-image.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(251,243,231,0)', 'rgba(251,243,231,0.85)', '#FBF3E7']}
              style={styles.heroFade}
            />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Om Siddheshwar</Text>
              <Text style={styles.heroSubtitle}>A beacon of wisdom and compassion</Text>
            </View>
          </View>

          {/* Content Card */}
          <Animated.View style={[styles.contentCard, { opacity: fadeAnim }]}>
            <View style={styles.biographySection}>
              <Text style={styles.bodyText}>
                Om Siddheshwar, also often known as Gurudev, spent over 50 years in deep, uninterrupted meditation and self-inquiry. That sustained focus has given him an unprecedented level of clarity about the rhythm of life and how to apply ancient wisdom to our modern challenges.
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

        </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
