
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { SPIRITUAL_COLORS, SPIRITUAL_SHADOWS } from '../../constants/SpiritualColors';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user.name}</Text>
        
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
        
        {user.isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>Admin User</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    ...SPIRITUAL_SHADOWS.card,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    fontWeight: '500',
  },
  adminBadge: {
    backgroundColor: SPIRITUAL_COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
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
    alignItems: 'center',
    marginTop: 24,
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
