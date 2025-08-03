
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_SHADOWS } from '../../constants/SpiritualColors';

interface UserProfileProps {
  style?: any;
}

export const UserProfile: React.FC<UserProfileProps> = ({ style }) => {
  const { user, logout, isAdmin } = useAuth();

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
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await logout();
              Toast.show({
                type: 'success',
                text1: 'Signed Out',
                text2: 'You have been successfully signed out',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Sign Out Failed',
                text2: 'Please try again',
              });
            }
          },
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Ionicons 
            name="person" 
            size={24} 
            color={SPIRITUAL_COLORS.primary} 
          />
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {user.displayName || 'Spiritual Seeker'}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out" size={20} color={SPIRITUAL_COLORS.destructive} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    ...SPIRITUAL_SHADOWS.card,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: SPIRITUAL_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    marginBottom: 4,
  },
  adminBadge: {
    alignSelf: 'flex-start',
    backgroundColor: SPIRITUAL_COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primaryForeground,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: SPIRITUAL_COLORS.destructive,
    fontSize: 14,
    fontWeight: '500',
  },
});
