import { Dimensions, StyleSheet } from 'react-native';
import { SPIRITUAL_COLORS } from '@/constants/SpiritualColors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
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
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  webView: {
    width: screenWidth,
    height: '100%',
    backgroundColor: '#000',
  },
  sideActionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
  },
  sideActionButton: {
    marginBottom: 20,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionIconActive: {
    backgroundColor: 'rgba(193,127,60,0.55)',
  },
  videoInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
  },
  captionHideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
    marginBottom: 4,
  },
  captionHideBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  videoDetails: {
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  videoCounter: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.7,
  },
  swipeHintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 8,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveTopBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff0000',
    marginRight: 8,
  },
  liveBadgeText: {
    color: '#ff0000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
