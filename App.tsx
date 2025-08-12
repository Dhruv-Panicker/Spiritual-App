
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import { SPIRITUAL_COLORS } from './constants/SpiritualColors';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar 
        style="dark" 
        backgroundColor={SPIRITUAL_COLORS.background}
      />
      <Toast />
    </SafeAreaProvider>
  );
}
