
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_GRADIENTS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
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
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.welcomeContainer}>
              <Image
                source={require('../../assets/images/om-symbol.png')}
                style={styles.omSymbol}
                resizeMode="contain"
              />
              <Text style={styles.title}>Spiritual Wisdom</Text>
              <Text style={styles.welcomeTitle}>Welcome, {user?.name}</Text>
              <Text style={styles.welcomeSubtitle}>Find peace in daily wisdom</Text>
            </View>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inspirationCard}>
              <Text style={styles.inspirationTitle}>Today's Inspiration</Text>
              <Text style={styles.inspirationQuote}>
                "The soul is here for its own joy."
              </Text>
              <Text style={styles.inspirationAuthor}>- Rumi</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>Days Active</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>42</Text>
                <Text style={styles.statLabel}>Quotes Read</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>15</Text>
                <Text style={styles.statLabel}>Videos Watched</Text>
              </View>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  omSymbol: {
    width: 80,
    height: 80,
    marginBottom: 16,
    tintColor: SPIRITUAL_COLORS.omGold,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: SPIRITUAL_COLORS.spiritualRed,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  inspirationCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...SPIRITUAL_SHADOWS.card,
  },
  inspirationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  inspirationQuote: {
    fontSize: 18,
    color: SPIRITUAL_COLORS.foreground,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: 12,
  },
  inspirationAuthor: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
});
