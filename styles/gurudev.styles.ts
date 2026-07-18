import { Dimensions, StyleSheet } from 'react-native';
import { SPIRITUAL_COLORS, SPIRITUAL_PALETTE, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

const { height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroContainer: {
    height: screenHeight * 0.5,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '18%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'LibreBaskerville_700Bold',
    fontSize: 30,
    color: SPIRITUAL_PALETTE.brown800,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'DMSans_400Regular_Italic',
    fontSize: 16,
    color: SPIRITUAL_PALETTE.brown600,
    textAlign: 'center',
  },
  contentCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    ...SPIRITUAL_SHADOWS.divine,
  },
  biographySection: {
    gap: 20,
  },
  bodyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: SPIRITUAL_COLORS.foreground,
  },
  footerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 12,
    marginHorizontal: 40,
  },
  footerDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: SPIRITUAL_PALETTE.brown300,
  },
  footerDividerStar: {
    color: SPIRITUAL_PALETTE.brown300,
    fontSize: 16,
  },
});
