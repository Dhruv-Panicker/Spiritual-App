import { StyleSheet } from 'react-native';
import { SPIRITUAL_COLORS, SPIRITUAL_SHADOWS } from '@/constants/SpiritualColors';

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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: SPIRITUAL_COLORS.textMuted,
    marginTop: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    ...SPIRITUAL_SHADOWS.card,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: SPIRITUAL_COLORS.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: SPIRITUAL_COLORS.primaryForeground,
  },
  tabContent: {
    flex: 1,
  },
  card: {
    backgroundColor: SPIRITUAL_COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    ...SPIRITUAL_SHADOWS.divine,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    backgroundColor: SPIRITUAL_COLORS.input,
  },
  textArea: {
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: SPIRITUAL_COLORS.foreground,
    backgroundColor: SPIRITUAL_COLORS.input,
    minHeight: 100,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SPIRITUAL_COLORS.border,
    backgroundColor: SPIRITUAL_COLORS.input,
  },
  typeButtonActive: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    borderColor: SPIRITUAL_COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SPIRITUAL_COLORS.foreground,
  },
  typeButtonTextActive: {
    color: SPIRITUAL_COLORS.primaryForeground,
  },
  submitButton: {
    backgroundColor: SPIRITUAL_COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: SPIRITUAL_COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.foreground,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: SPIRITUAL_COLORS.textMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: SPIRITUAL_COLORS.accent,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: SPIRITUAL_COLORS.foreground,
    lineHeight: 18,
  },
});
