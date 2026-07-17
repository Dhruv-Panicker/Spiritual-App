import React, { useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { AuthFlow } from './AuthFlow';
import { PhotoLoadingRing } from '@/components/PhotoLoadingRing';
import { styles } from './styles/AuthGuard.styles';

interface AuthGuardProps {
  children: React.ReactNode;
}

const FADE_DURATION = 500;

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [showMainApp, setShowMainApp] = useState(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const showOverlay = isLoading || isTransitioningOut;

  // When user logs out, reset so we show AuthFlow (welcome/login) again
  useEffect(() => {
    if (!user) {
      setShowMainApp(false);
      setIsTransitioningOut(false);
    }
  }, [user]);

  // Fade in when overlay is first shown (loading)
  useEffect(() => {
    if (showOverlay && !isTransitioningOut) {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  // When loading finishes and we have a user, run fade-out then show main app
  useEffect(() => {
    if (!isLoading && user && !showMainApp && !isTransitioningOut) {
      setIsTransitioningOut(true);
    }
  }, [isLoading, user, showMainApp, isTransitioningOut]);

  useEffect(() => {
    if (!isTransitioningOut) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setIsTransitioningOut(false);
      setShowMainApp(true);
    });
  }, [isTransitioningOut]);

  if (showMainApp) {
    return <>{children}</>;
  }

  if (!user && !isLoading) {
    return <AuthFlow />;
  }

  return (
    <View style={styles.loadingContainer} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity }]}>
        <PhotoLoadingRing />
      </Animated.View>
    </View>
  );
};