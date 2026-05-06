import { StyleSheet } from 'react-native';
import { SPIRITUAL_COLORS, SPIRITUAL_TYPOGRAPHY } from '@/constants/SpiritualColors';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: SPIRITUAL_COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20, paddingTop: 12 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 16, marginBottom: 16 },
  backButtonText: { fontSize: 16, color: SPIRITUAL_COLORS.primary, fontWeight: '500' },
  container: { maxWidth: 400, width: '100%', alignSelf: 'center' },
  title: {
    ...SPIRITUAL_TYPOGRAPHY.spiritualHeading,
    fontSize: 26,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 15,
    color: SPIRITUAL_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: SPIRITUAL_COLORS.input || SPIRITUAL_COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 8,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
  },
  inputError: { borderColor: SPIRITUAL_COLORS.spiritualRed },
  errorText: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.spiritualRed,
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  continueButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
});
