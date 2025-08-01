
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

export default function ExploreScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
          },
        },
      ]
    );
  };

  const explorationSections = [
    {
      id: '1',
      title: 'Meditation Practices',
      description: 'Discover different meditation techniques',
      icon: 'flower' as const,
      color: ['#8E6A5B', '#A67C6A'],
    },
    {
      id: '2',
      title: 'Sacred Texts',
      description: 'Explore ancient wisdom and teachings',
      icon: 'book' as const,
      color: ['#FF6B35', '#FF8F65'],
    },
    {
      id: '3',
      title: 'Spiritual Practices',
      description: 'Learn about various spiritual traditions',
      icon: 'leaf' as const,
      color: ['#D4A574', '#E6B887'],
    },
    {
      id: '4',
      title: 'Mindfulness Exercises',
      description: 'Practice awareness and presence',
      icon: 'heart' as const,
      color: ['#9B59B6', '#BB7BD9'],
    },
  ];

  const handleSectionPress = async (section: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigation to specific section would go here
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
          {/* Header with User Profile */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/om-symbol.png')}
              style={styles.omSymbol}
              resizeMode="contain"
            />
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>Discover your spiritual path</Text>
          </View>

          {/* User Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={60} color={SPIRITUAL_COLORS.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{user?.name || 'Spiritual Seeker'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'guest@example.com'}</Text>
                {user?.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminText}>Admin</Text>
                  </View>
                )}
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Exploration Sections */}
          <Text style={styles.sectionTitle}>Spiritual Exploration</Text>
          <View style={styles.sectionsGrid}>
            {explorationSections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={styles.sectionCard}
                onPress={() => handleSectionPress(section)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={section.color}
                  style={styles.sectionGradient}
                >
                  <Ionicons 
                    name={section.icon} 
                    size={32} 
                    color={SPIRITUAL_COLORS.primaryForeground} 
                  />
                  <Text style={styles.sectionCardTitle}>{section.title}</Text>
                  <Text style={styles.sectionCardDescription}>
                    {section.description}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Inspiration Quote */}
          <View style={styles.inspirationCard}>
            <Text style={styles.inspirationTitle}>Daily Reflection</Text>
            <Text style={styles.inspirationQuote}>
              "The spiritual journey is the unlearning of fear and the acceptance of love."
            </Text>
            <Text style={styles.inspirationAuthor}>- Marianne Williamson</Text>
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
  profileCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: SPIRITUAL_COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  adminText: {
    color: SPIRITUAL_COLORS.secondaryForeground,
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: SPIRITUAL_COLORS.spiritualRed,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SPIRITUAL_SHADOWS.card,
  },
  sectionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  sectionCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primaryForeground,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionCardDescription: {
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
