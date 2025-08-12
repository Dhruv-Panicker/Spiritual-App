import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

const { width } = Dimensions.get('window');

// Safe gradient helper
const getSafeGradient = (gradientKey: keyof typeof SPIRITUAL_GRADIENTS) => {
  const gradient = SPIRITUAL_GRADIENTS[gradientKey];
  return gradient && Array.isArray(gradient) && gradient.length > 0
    ? gradient
    : ['#FFFFFF', '#F5F5F5'];
};

export default function GurudevScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={getSafeGradient('divine')}
          style={styles.heroSection}
        >
          <View style={styles.heroPlaceholder} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>श्री सिधेश्वर तीर्थ ब्रह्मर्षि जी</Text>
            <Text style={styles.heroSubtitle}>Our Beloved Gurudev</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Gurudev</Text>
            <Text style={styles.paragraph}>
              श्री सिधेश्वर तीर्थ ब्रह्मर्षि जी are a realized saint and spiritual master who has dedicated their life to the service of humanity and the spreading of divine knowledge.
            </Text>
            <Text style={styles.paragraph}>
              Through their divine grace and teachings, countless devotees have found the path to spiritual enlightenment and inner peace.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teachings</Text>
            <View style={styles.teachingCard}>
              <Text style={styles.teaching}>
                "The ultimate goal of human life is to realize the divine within oneself through devotion, service, and surrender."
              </Text>
            </View>
            <View style={styles.teachingCard}>
              <Text style={styles.teaching}>
                "True happiness comes not from material possessions but from the connection with the eternal divine consciousness."
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Divine Mission</Text>
            <Text style={styles.paragraph}>
              Gurudev's mission is to guide souls on their spiritual journey, helping them overcome the illusions of material existence and achieve self-realization.
            </Text>
            <Text style={styles.paragraph}>
              Through satsangs, spiritual discourses, and personal guidance, Gurudev illuminates the path of dharma for all sincere seekers.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.primary,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.text,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
  },
  teachingCard: {
    backgroundColor: SPIRITUAL_COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: SPIRITUAL_COLORS.primary,
    ...SPIRITUAL_SHADOWS.light,
  },
  teaching: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});