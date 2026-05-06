import { StyleSheet } from 'react-native';
import { SPIRITUAL_COLORS } from '@/constants/SpiritualColors';

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingImage: {
    width: '100%',
    height: '100%',
  },
  spinnerWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerCircle: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 9999,
    padding: 16,
  },
});
