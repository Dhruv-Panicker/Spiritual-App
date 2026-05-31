import { Platform } from 'react-native';
import { SPIRITUAL_COLORS } from '@/constants/SpiritualColors';

export const tabsScreenOptions = {
  tabBarActiveTintColor: SPIRITUAL_COLORS.tabActive,
  tabBarInactiveTintColor: SPIRITUAL_COLORS.textMuted,
  tabBarStyle: {
    backgroundColor: SPIRITUAL_COLORS.tabBackground,
    borderTopColor: SPIRITUAL_COLORS.border,
    ...Platform.select({
      ios: { position: 'absolute' as const },
      default: {},
    }),
  },
  headerShown: false,
};
