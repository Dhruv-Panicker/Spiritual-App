
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAuth } from '../../contexts/AuthContext';
import { SPIRITUAL_COLORS } from '../../constants/SpiritualColors';

// Import screens
import { QuotesScreen } from '../../app/(tabs)/quotes';
import { VideosScreen } from '../../app/(tabs)/videos';
import { CalendarScreen } from '../../app/(tabs)/calendar';
import { GurudevScreen } from '../../app/(tabs)/gurudev';
import { AdminScreen } from '../../app/(tabs)/admin';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  const { user } = useAuth();

  // Define allowed admin emails
  const adminEmails = [
    'dhru.panicker@gmail.com',
    'apaaranddhruv@gmail.com',
  ];
  
  // Check if user is an actual admin based on email
  const isActualAdmin = user && adminEmails.includes(user.email);

  const handleTabPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Quotes':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Videos':
              iconName = focused ? 'play-circle' : 'play-circle-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Gurudev':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Admin':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: SPIRITUAL_COLORS.primary,
        tabBarInactiveTintColor: SPIRITUAL_COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: SPIRITUAL_COLORS.tabBackground,
          borderTopColor: SPIRITUAL_COLORS.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65,
          ...Platform.select({
            ios: {
              shadowColor: SPIRITUAL_COLORS.primary,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        headerShown: false,
        tabBarButton: (props) => (
          <TabBarButton {...props} onPress={handleTabPress} />
        ),
      })}
    >
      <Tab.Screen 
        name="Quotes" 
        component={QuotesScreen}
        options={{ title: 'Quotes' }}
      />
      <Tab.Screen 
        name="Videos" 
        component={VideosScreen}
        options={{ title: 'Videos' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Tab.Screen 
        name="Gurudev" 
        component={GurudevScreen}
        options={{ title: 'Gurudev' }}
      />
      {isActualAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{ title: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
};

// Custom tab bar button with haptic feedback
const TabBarButton: React.FC<any> = ({ children, onPress, ...props }) => {
  const handlePress = (e: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  return (
    <TouchableOpacity {...props} onPress={handlePress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};
