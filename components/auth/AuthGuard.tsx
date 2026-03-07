import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { AuthFlow } from './AuthFlow';
import { SPIRITUAL_COLORS } from '@/constants/SpiritualColors';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={SPIRITUAL_COLORS.primary} 
        />
      </View>
    );
  }

  if (!user) {
    return <AuthFlow />;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SPIRITUAL_COLORS.background,
  },
});

