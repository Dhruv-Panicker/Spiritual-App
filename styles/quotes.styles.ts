import { StyleSheet } from 'react-native';
import { SPIRITUAL_COLORS, SPIRITUAL_PALETTE, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  omHeaderLogo: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Space for tab bar
  },
  quoteCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...SPIRITUAL_SHADOWS.card,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  omQuoteLogo: {
    width: 32,
    height: 32,
  },
  date: {
    fontSize: 12,
    color: SPIRITUAL_PALETTE.brown500,
  },
  quoteText: {
    marginBottom: 12,
  },
  quoteImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  author: {
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reflectionContainer: {
    backgroundColor: SPIRITUAL_COLORS.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reflectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: SPIRITUAL_COLORS.input,
  },
  likedButton: {
    backgroundColor: SPIRITUAL_PALETTE.marigoldLo,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    fontWeight: '500',
  },
  likedText: {
    color: SPIRITUAL_COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
  },
});
