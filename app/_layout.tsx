import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { QuotesProvider } from '@/contexts/QuotesContext';
import { VideosProvider } from '@/contexts/VideosContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { notificationService } from '@/services/notificationService';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Initialize notification service on app start
    (async () => {
      try {
        await notificationService.initialize();
        console.log('✅ Notification service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize notification service on app start:', error);
      }
    })();

    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => {
      clearTimeout(timer);
      notificationService.cleanup();
    };
  }, []);

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
            </EventsProvider>
          </VideosProvider>
        </QuotesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

