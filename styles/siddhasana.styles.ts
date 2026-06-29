import { Dimensions, Platform, StyleSheet } from 'react-native';
import { SPIRITUAL_COLORS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

const { height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    ...SPIRITUAL_SHADOWS.divine,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  contentCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 16,
    padding: 24,
    ...SPIRITUAL_SHADOWS.divine,
  },
  section: {
    gap: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    color: SPIRITUAL_COLORS.foreground,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  eventsSection: {
    margin: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  eventsCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(193,127,60,0.18)',
    ...SPIRITUAL_SHADOWS.peaceful,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  eventsSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  eventsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SPIRITUAL_COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  eventsButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
