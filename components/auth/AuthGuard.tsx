
import React from 'react';
import { View, ActivityIndicator, Image, Animated, useRef, useEffect } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { LoginScreen } from './LoginScreen';

const SPIRITUAL_COLORS = {
  background: '#FDF8F3',
  primary: '#FF6B35',
  omGold: '#DAA520',
};

const SPIRITUAL_GRADIENTS = {
  peace: ['#FDF8F3', '#F4E4C1'],
};

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={SPIRITUAL_GRADIENTS.peace}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Image
            source={require('../../assets/images/om-symbol.png')}
            style={{
              width: 80,
              height: 80,
              marginBottom: 20,
              tintColor: SPIRITUAL_COLORS.omGold,
            }}
            resizeMode="contain"
          />
        </Animated.View>
        <ActivityIndicator 
          size="large" 
          color={SPIRITUAL_COLORS.primary} 
        />
      </LinearGradient>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <>{children}</>;
};
