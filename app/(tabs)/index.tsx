import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@/contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

// Safe gradient helper
const getSafeGradient = (gradientKey: keyof typeof SPIRITUAL_GRADIENTS) => {
  const gradient = SPIRITUAL_GRADIENTS[gradientKey];
  return gradient && Array.isArray(gradient) && gradient.length > 0 
    ? gradient 
    : ['#FFFFFF', '#F5F5F5'];
};

const { width: screenWidth } = Dimensions.get('window');

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  gradient: string[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onPress, gradient }) => {
  return (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <LinearGradient colors={gradient} style={styles.featureGradient}>
        <View style={styles.featureIconContainer}>
          <Ionicons name={icon as any} size={32} color={SPIRITUAL_COLORS.white} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleFeaturePress = (feature: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`Navigate to ${feature}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={getSafeGradient('divine')}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>🙏 नमस्ते</Text>
            <Text style={styles.welcome}>
              Welcome, {user?.displayName || user?.email || 'Devotee'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={SPIRITUAL_COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.featuresContainer}>
          <FeatureCard
            title="Daily Quotes"
            description="Spiritual wisdom for daily reflection"
            icon="book-outline"
            gradient={getSafeGradient('wisdom')}
            onPress={() => handleFeaturePress('quotes')}
          />

          <FeatureCard
            title="Sacred Videos"
            description="Divine teachings and satsangs"
            icon="play-circle-outline"
            gradient={getSafeGradient('devotion')}
            onPress={() => handleFeaturePress('videos')}
          />

          <FeatureCard
            title="Calendar"
            description="Sacred dates and festivals"
            icon="calendar-outline"
            gradient={getSafeGradient('peace')}
            onPress={() => handleFeaturePress('calendar')}
          />

          <FeatureCard
            title="About Gurudev"
            description="Life and teachings of our beloved master"
            icon="person-outline"
            gradient={getSafeGradient('blessing')}
            onPress={() => handleFeaturePress('gurudev')}
          />
        </View>

        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Today's Blessing</Text>
          <View style={styles.blessingCard}>
            <Text style={styles.blessingText}>
              "The purpose of life is to realize God. All other activities are secondary."
            </Text>
            <Text style={styles.blessingAuthor}>- Sri Siddheshwar Tirth Brahmarshi Ji</Text>
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
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 24,
    color: SPIRITUAL_COLORS.white,
    fontWeight: 'bold',
  },
  welcome: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  featuresContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...SPIRITUAL_SHADOWS.medium,
  },
  featureGradient: {
    padding: 20,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconContainer: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  todaySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.text,
    marginBottom: 16,
  },
  blessingCard: {
    backgroundColor: SPIRITUAL_COLORS.white,
    padding: 20,
    borderRadius: 16,
    ...SPIRITUAL_SHADOWS.light,
  },
  blessingText: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.text,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  blessingAuthor: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
});