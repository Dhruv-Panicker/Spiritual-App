import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

Sentry.init({
  dsn: 'https://64cb5a6d7bb3c0d945609f9444e04654@o4511130079789056.ingest.us.sentry.io/4511130095648768',
  enabled: !__DEV__,
});
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { LibreBaskerville_700Bold } from '@expo-google-fonts/libre-baskerville';
import {
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { QuotesProvider } from '@/contexts/QuotesContext';
import { VideosProvider } from '@/contexts/VideosContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { notificationService } from '@/services/notificationService';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PhotoLoadingRing } from '@/components/auth/PhotoLoadingRing';
import { styles as ringStyles } from '@/components/auth/styles/PhotoLoadingRing.styles';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const LOADER_MIN_MS = 1000;   // how long the animated loader stays up
const LOADER_FADE_MS = 400;   // fade-out duration

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    LibreBaskerville_700Bold,
    DMSans_400Regular,
    DMSans_400Regular_Italic,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const [showLoader, setShowLoader] = useState(true);
  const loaderOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initialize notification service on app start
    (async () => {
      try {
        await notificationService.initialize();
        console.log('Notification service initialized');
      } catch (error) {
        console.error('Failed to initialize notification service on app start:', error);
      }
    })();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  useEffect(() => {
    // Hold the native splash until fonts are ready so text never flashes in a
    // fallback font, then swap to the animated loader for its minimum time.
    if (!fontsLoaded) return;

    SplashScreen.hideAsync();

    const timer = setTimeout(() => {
      Animated.timing(loaderOpacity, {
        toValue: 0,
        duration: LOADER_FADE_MS,
        useNativeDriver: true,
      }).start(() => setShowLoader(false));
    }, LOADER_MIN_MS);

    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QuotesProvider>
          <VideosProvider>
            <EventsProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
              {showLoader && (
                <Animated.View
                  style={[
                    layoutStyles.loaderOverlay,
                    ringStyles.centered,
                    { opacity: loaderOpacity },
                  ]}
                >
                  <PhotoLoadingRing />
                </Animated.View>
              )}
            </EventsProvider>
          </VideosProvider>
        </QuotesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const layoutStyles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111111', // match your splash backgroundColor in app.json
    zIndex: 100,
  },
});
