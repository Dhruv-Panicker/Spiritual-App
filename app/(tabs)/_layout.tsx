import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { SPIRITUAL_COLORS } from '@/constants/SpiritualColors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  // Define allowed admin emails
  const adminEmails = [
    'dhru.panicker@gmail.com',
    'apaaranddhruv@gmail.com',
  ];
  
  // Check if user is an actual admin based on email (case-insensitive)
  const isActualAdmin = user && user.email && adminEmails.includes(user.email.toLowerCase().trim());
  
  // Debug logging
  console.log('=== ADMIN CHECK DEBUG ===');
  console.log('User object:', user);
  console.log('User email:', user?.email);
  console.log('Admin emails:', adminEmails);
  console.log('Is actual admin:', isActualAdmin);
  console.log('Admin tab will render:', isActualAdmin === true);
  console.log('========================');

  return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: SPIRITUAL_COLORS.primary,
          tabBarInactiveTintColor: SPIRITUAL_COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: SPIRITUAL_COLORS.tabBackground,
            borderTopColor: SPIRITUAL_COLORS.border,
            ...Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
          },
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="quotes"
          options={{
            title: 'Quotes',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="book" color={color} />,
          }}
        />
        <Tabs.Screen
          name="videos"
          options={{
            title: 'Videos',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'play-circle' : 'play-circle-outline'} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="gurudev"
          options={{
            title: 'Gurudev',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={28} color={color} />
            ),
          }}
        />
        {isActualAdmin === true && (
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Admin',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'settings' : 'settings-outline'} size={28} color={color} />
              ),
            }}
          />
        )}
      </Tabs>
  );
}