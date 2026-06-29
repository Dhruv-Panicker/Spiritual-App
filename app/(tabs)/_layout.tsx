import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { tabsScreenOptions } from '@/styles/_layout.styles';

function TabLayoutContent() {
  const { user } = useAuth();
  
  // Only show admin tab if user exists and is admin
  const adminTabHref = user?.isAdmin === true ? undefined : null;

  return (
    <Tabs screenOptions={tabsScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarAccessibilityLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Quotes',
          tabBarAccessibilityLabel: 'Daily Quotes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Videos',
          tabBarAccessibilityLabel: 'Videos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'play-circle' : 'play-circle-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarAccessibilityLabel: 'Events Calendar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gurudev"
        options={{
          title: 'Siddhguru',
          tabBarAccessibilityLabel: 'About Siddhguru',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="siddhasana"
        options={{
          title: 'Siddhasana',
          tabBarAccessibilityLabel: 'Siddhasana',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'flower' : 'flower-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Prayer',
          tabBarAccessibilityLabel: 'Send a Prayer',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: adminTabHref,
          title: 'Admin',
          tabBarAccessibilityLabel: 'Admin Panel',
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

