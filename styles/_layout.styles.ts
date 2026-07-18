import { SPIRITUAL_COLORS } from '@/constants/SpiritualColors';

export const tabsScreenOptions = {
  tabBarActiveTintColor: SPIRITUAL_COLORS.tabActive,
  tabBarInactiveTintColor: SPIRITUAL_COLORS.textMuted,
  // The tab bar takes real layout space so every page ends at the navbar,
  // instead of floating over content that pages must pad around.
  tabBarStyle: {
    backgroundColor: SPIRITUAL_COLORS.tabBackground,
    borderTopColor: SPIRITUAL_COLORS.border,
  },
  headerShown: false,
};
