import { Dimensions, StyleSheet } from 'react-native';
import { SPIRITUAL_COLORS, SPIRITUAL_PALETTE } from '@/constants/SpiritualColors';

const { height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPIRITUAL_COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroContainer: {
    height: screenHeight * 0.42,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    tintColor: SPIRITUAL_COLORS.borderSoft,
    opacity: 0.35,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'LibreBaskerville_700Bold',
    fontSize: 24,
    color: SPIRITUAL_PALETTE.brown800,
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: SPIRITUAL_PALETTE.brown600,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  privacyText: {
    fontFamily: 'DMSans_400Regular_Italic',
    fontSize: 12,
    color: SPIRITUAL_PALETTE.brown500,
    lineHeight: 18,
    flexShrink: 1,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 6,
  },
  labelSub: {
    fontSize: 12,
    color: SPIRITUAL_PALETTE.brown500,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    backgroundColor: SPIRITUAL_COLORS.input,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
  },
  inputDD: {
    width: 56,
    textAlign: 'center',
  },
  inputMM: {
    width: 56,
    textAlign: 'center',
  },
  inputYYYY: {
    flex: 1,
    minWidth: 72,
    textAlign: 'center',
  },
  inputCity: {
    flex: 1,
    minWidth: 0,
  },
  inputCountry: {
    flex: 1,
    minWidth: 0,
  },
  inputAreaCode: {
    width: 80,
  },
  inputPhone: {
    flex: 1,
    minWidth: 0,
  },
  textArea: {
    backgroundColor: SPIRITUAL_COLORS.input,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    minHeight: 140,
  },
  textAreaError: {
    borderWidth: 1.5,
    borderColor: SPIRITUAL_PALETTE.kumkum,
  },
  charCount: {
    fontSize: 12,
    color: SPIRITUAL_COLORS.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },
  charCountOver: {
    color: SPIRITUAL_PALETTE.kumkum,
    fontWeight: '700',
  },
  charLimitError: {
    fontSize: 13,
    fontWeight: '600',
    color: SPIRITUAL_PALETTE.kumkum,
    marginTop: 2,
    textAlign: 'right',
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: SPIRITUAL_COLORS.input,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 10,
    borderStyle: 'dashed',
    paddingVertical: 20,
  },
  addPhotoText: {
    fontSize: 15,
    color: SPIRITUAL_COLORS.primary,
    fontWeight: '500',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: SPIRITUAL_COLORS.border,
  },
  removePhotoBtn: {
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: SPIRITUAL_COLORS.primary,
  },
  submitButtonBusy: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.primaryForeground,
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
