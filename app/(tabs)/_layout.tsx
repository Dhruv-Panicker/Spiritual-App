import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SPIRITUAL_COLORS } from '@/constants/SpiritualColors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthGuard>
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
            href: null, // Hide this tab from the tab bar
          }}
        />
        <Tabs.Screen
          name="quotes"
          options={{
            title: 'Quotes',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="quote" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}