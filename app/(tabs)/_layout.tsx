import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { SPIRITUAL_COLORS } from '@/constants/SpiritualColors';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

function TabLayoutContent() {
  const { user } = useAuth();
  
  // Only show admin tab if user exists and is admin
  // When href is null, the tab is completely hidden from the tab bar
  const adminTabHref = user?.isAdmin === true ? undefined : null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: SPIRITUAL_COLORS.tabActive,
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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Quotes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={28} color={color} />
          ),
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
      <Tabs.Screen
        name="admin"
        options={{
          href: adminTabHref, // null completely hides the tab from tab bar
          title: 'Admin',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <AuthGuard>
      <TabLayoutContent />
    </AuthGuard>
  );
}

