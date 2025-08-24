
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './contexts/AuthContext';
import { MainAppNavigator } from './components/navigation/MainAppNavigator';
import { SPIRITUAL_COLORS } from './constants/SpiritualColors';
import { shareService } from './services/shareService';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialize shareable assets when app starts
    shareService.initializeShareableAssets().catch(error => {
      console.error('Failed to initialize share service:', error);
    });
  }, []);
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar 
            style="dark" 
            backgroundColor={SPIRITUAL_COLORS.background}
          />
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false,
              cardStyle: { backgroundColor: SPIRITUAL_COLORS.background }
            }}
          >
            <Stack.Screen 
              name="Main" 
              component={MainAppNavigator} 
            />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
