import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AuthGuard } from '../auth/AuthGuard';
import { useAuth } from '../../contexts/AuthContext';
import { SPIRITUAL_COLORS } from '../../constants/SpiritualColors';

const Tab = createBottomTabNavigator();

const AdminTab = () => {
  // Admin tab content will be here
  return null;
};

export const MainAppNavigator: React.FC = () => {
  const { user } = useAuth();
  const adminEmails = [
    'dhru.panicker@gmail.com',
    'apaaranddhruv@gmail.com',
  ];
  const isAdmin = user && adminEmails.includes(user.email);

  return (
    <AuthGuard>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else if (route.name === 'Admin' && isAdmin) {
              iconName = focused ? 'person' : 'person-outline';
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: SPIRITUAL_COLORS.tabBarActiveTintColor,
          tabBarInactiveTintColor: SPIRITUAL_COLORS.tabBarInactiveTintColor,
          tabBarStyle: {
            backgroundColor: SPIRITUAL_COLORS.tabBarStyle,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 80 : 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={TabNavigator} />
        <Tab.Screen name="Settings" component={TabNavigator} />
        {isAdmin && <Tab.Screen name="Admin" component={AdminTab} />}
      </Tab.Navigator>
    </AuthGuard>
  );
};