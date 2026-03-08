// Spiritual color palette – Siddguru / Vedic-inspired (brown, copper, cream)
// Replaces previous saffron theme globally.
export const SPIRITUAL_COLORS = {
  // Primary – copper / saddle brown
  primary: '#c17f3c',
  primaryGlow: '#d4955c',
  primaryForeground: '#fdf6ec',

  // Background
  background: '#fdf6ec',
  cardBackground: 'rgba(255,255,255,0.9)',

  // Text
  foreground: '#3d1f0a',
  textMuted: '#8b6a4a',

  // Secondary – deeper brown
  secondary: '#8b4513',
  secondaryForeground: '#fdf6ec',

  // Accent – warm brown
  accent: '#b5651d',
  accentForeground: '#3d1f0a',

  // UI
  spiritualRed: '#c41e1e',
  omGold: '#c17f3c',

  // Border and input
  border: 'rgba(193,127,60,0.25)',
  input: 'rgba(255,255,255,0.9)',

  // Tab navigation
  tabBackground: '#fdf6ec',
  tabForeground: '#3d1f0a',
  tabActive: '#c17f3c',
  tabActiveForeground: '#fdf6ec',
};

// Gradients (cream / tan / copper)
export const SPIRITUAL_GRADIENTS = {
  divine: ['#c17f3c', '#8b4513'],
  peace: ['#fdf6ec', '#f5e6d0'],
  meditation: ['#d4955c', '#c17f3c'],
  sunset: ['#c17f3c', '#f5e6d0'],
};

// Shadows – brown-based
export const SPIRITUAL_SHADOWS = {
  peaceful: {
    shadowColor: '#8b4513',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  divine: {
    shadowColor: '#8b4513',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: '#8b4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
};

// Typography
export const SPIRITUAL_TYPOGRAPHY = {
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    color: '#3d1f0a',
  },
  spiritualHeading: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#3d1f0a',
  },
  author: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#c17f3c',
    textAlign: 'right' as const,
  },
  reflection: {
    fontSize: 14,
    color: '#5a2d0c',
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
};
