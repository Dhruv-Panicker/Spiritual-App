
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LoginScreen } from './LoginScreen';
import { SPIRITUAL_COLORS } from '../../constants/SpiritualColors';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: SPIRITUAL_COLORS.background,
      }}>
        <ActivityIndicator 
          size="large" 
          color={SPIRITUAL_COLORS.primary} 
        />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
};
