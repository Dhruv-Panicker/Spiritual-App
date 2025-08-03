
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { MainAppNavigator } from './components/navigation/MainAppNavigator';
import { SPIRITUAL_COLORS } from './constants/SpiritualColors';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar 
            style="dark" 
            backgroundColor={SPIRITUAL_COLORS.background}
          />
          <AuthGuard>
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
          </AuthGuard>
        </NavigationContainer>
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
