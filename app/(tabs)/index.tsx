import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.8}>
    <LinearGradient
      colors={[SPIRITUAL_COLORS.cardBackground, SPIRITUAL_COLORS.accent]}
      style={styles.featureCardGradient}
    >
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={32} color={SPIRITUAL_COLORS.primary} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    console.log('Logout button clicked');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Logout cancelled'),
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('Logout confirmed, calling logout function');
            logout();
          },
        },
      ]
    );
  };

  const features = [
    {
      icon: 'book-outline' as const,
      title: 'Daily Quotes',
      description: 'Discover wisdom through sacred teachings and spiritual insights',
      onPress: () => {
        router.push('/(tabs)/quotes');
      },
    },
    {
      icon: 'calendar-outline' as const,
      title: 'Sacred Calendar',
      description: 'Stay connected with spiritual events and celebrations',
      onPress: () => {
        router.push('/(tabs)/calendar');
      },
    },
    {
      icon: 'play-circle-outline' as const,
      title: 'Divine Videos',
      description: 'Experience spiritual guidance through sacred video content',
      onPress: () => {
        router.push('/(tabs)/videos');
      },
    },
    {
      icon: 'heart-outline' as const,
      title: 'Gurudev Wisdom',
      description: 'Connect with the teachings of Sri Sidheshwar Tirth Brahmarshi Ji',
      onPress: () => {
        router.push('/(tabs)/gurudev');
      },
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
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <View style={styles.omContainer}>
                  <Text style={styles.omSymbol}>ॐ</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  console.log('TouchableOpacity pressed');
                  handleLogout();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={24} color={SPIRITUAL_COLORS.primary} />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.welcomeText}>
              Namaste, {user?.name || 'Spiritual Seeker'}
            </Text>
            <Text style={styles.subtitle}>
              May your path be illuminated with divine wisdom
            </Text>
          </View>

          {/* Daily Blessing Card */}
          <View style={styles.blessingCard}>
            <LinearGradient
              colors={SPIRITUAL_GRADIENTS.divine}
              style={styles.blessingGradient}
            >
              <View style={styles.blessingContent}>
                <Ionicons name="sunny-outline" size={24} color={SPIRITUAL_COLORS.primaryForeground} />
                <Text style={styles.blessingText}>
                  "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः"
                </Text>
                <Text style={styles.blessingTranslation}>
                  May all beings be happy, may all beings be healthy
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Explore Spiritual Path</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  onPress={feature.onPress}
                />
              ))}
            </View>
          </View>

          {/* Spiritual Quote Section */}
          <View style={styles.quoteSection}>
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>
                "When you connect with the silence within you, that is when you can make sense of the disturbance going on around you."
              </Text>
              <Text style={styles.quoteAuthor}>- Ancient Wisdom</Text>
            </View>
          </View>

          {/* Footer Blessing */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🙏 हरे कृष्ण हरे राम 🙏
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

export { HomeScreen };
export default HomeScreen;

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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    ...SPIRITUAL_SHADOWS.card,
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primary,
  },
  omContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SPIRITUAL_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SPIRITUAL_SHADOWS.divine,
  },
  omSymbol: {
    fontSize: 36,
    color: SPIRITUAL_COLORS.primaryForeground,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  blessingCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    ...SPIRITUAL_SHADOWS.divine,
  },
  blessingGradient: {
    borderRadius: 16,
    padding: 20,
  },
  blessingContent: {
    alignItems: 'center',
  },
  blessingText: {
    fontSize: 18,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primaryForeground,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  blessingTranslation: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.primaryForeground,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
    ...SPIRITUAL_SHADOWS.card,
  },
  featureCardGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: SPIRITUAL_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  quoteSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quoteCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: SPIRITUAL_COLORS.secondary,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  quoteText: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 18,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '600',
  },
});