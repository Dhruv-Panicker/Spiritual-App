// React Native version of SpiritualApp.tsx
import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginScreen } from './auth/LoginScreen';
import { QuotesPage } from './quotes/QuotesPage';
import { VideosPage } from './videos/VideosPage';
import { CalendarPage } from './calendar/CalendarPage';
import { GurudevPage } from './gurudev/GurudevPage';
import { AdminPage } from './admin/AdminPage';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Quotes':
              iconName = 'format-quote';
              break;
            case 'Videos':
              iconName = 'play-circle-outline';
              break;
            case 'Calendar':
              iconName = 'calendar-today';
              break;
            case 'Gurudev':
              iconName = 'person';
              break;
            case 'Admin':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35', // Saffron color
        tabBarInactiveTintColor: '#8E6A5B',
        tabBarStyle: {
          backgroundColor: '#FDF8F3',
          borderTopColor: '#E8D5B7',
          paddingBottom: 5,
          height: 65,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Quotes" component={QuotesPage} />
      <Tab.Screen name="Videos" component={VideosPage} />
      <Tab.Screen name="Calendar" component={CalendarPage} />
      <Tab.Screen name="Gurudev" component={GurudevPage} />
      {user?.isAdmin && (
        <Tab.Screen name="Admin" component={AdminPage} />
      )}
    </Tab.Navigator>
  );
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export const SpiritualApp = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
