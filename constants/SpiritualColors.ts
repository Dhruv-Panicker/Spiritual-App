// Om Siddheshwar colour system.
// Brown does neutral work only; three imported accents (marigold, kumkum,
// tulsi) do all the separating. All values are WCAG-verified — do not
// re-derive or "improve" the hex values.

// Raw tokens
export const SPIRITUAL_PALETTE = {
  // Base surfaces
  bg: '#FBF3E7',
  surface: '#FEF9F3',
  sunken: '#F3E6D2',

  // Brown spine (chroma tapers as lightness rises)
  brown900: '#241007', // dark blocks, quote card background (16.6:1)
  brown800: '#392218', // headings, body text (13.5:1)
  brown600: '#594136', // supporting copy (8.5:1)
  brown500: '#826B60', // dates, metadata, captions (4.5:1)
  brown400: '#9C8980', // input borders, component boundaries (3.0:1)
  brown300: '#C4B3AC', // decorative dividers, watermarks
  brown200: '#E3D4CD', // soft fills

  // Accents
  marigold: '#E9A13B',   // fill only — never a word on cream
  marigoldLo: '#FFCE91', // chips
  kumkum: '#8C2C37',     // links, emphasis, filled heart
  kumkumDeep: '#55101A', // deep fills
  tulsi: '#3C5838',      // retreat category only
  tulsiLo: '#D3E3D1',    // retreat chips
  copper: '#AA5B0D',     // brand labels only — never for emphasis
};

export const SPIRITUAL_COLORS = {
  // Primary – kumkum, the single emphasis colour
  primary: SPIRITUAL_PALETTE.kumkum,
  primaryGlow: SPIRITUAL_PALETTE.marigold,
  primaryForeground: SPIRITUAL_PALETTE.bg,

  // Background
  background: SPIRITUAL_PALETTE.bg,
  cardBackground: SPIRITUAL_PALETTE.surface,

  // Text
  foreground: SPIRITUAL_PALETTE.brown800,
  textMuted: SPIRITUAL_PALETTE.brown600,
  textMeta: SPIRITUAL_PALETTE.brown500,

  // Secondary – deep kumkum fill
  secondary: SPIRITUAL_PALETTE.kumkumDeep,
  secondaryForeground: SPIRITUAL_PALETTE.bg,

  // Accent – copper, brand labels only
  accent: SPIRITUAL_PALETTE.copper,
  accentForeground: SPIRITUAL_PALETTE.brown800,

  // UI
  spiritualRed: SPIRITUAL_PALETTE.kumkum,
  omGold: SPIRITUAL_PALETTE.marigold,

  // Border and input
  border: SPIRITUAL_PALETTE.brown400,
  borderSoft: SPIRITUAL_PALETTE.brown300,
  input: SPIRITUAL_PALETTE.sunken,

  // Tab navigation
  tabBackground: SPIRITUAL_PALETTE.bg,
  tabForeground: SPIRITUAL_PALETTE.brown800,
  tabActive: SPIRITUAL_PALETTE.kumkum,
  tabActiveForeground: SPIRITUAL_PALETTE.bg,
};

// Gradients
export const SPIRITUAL_GRADIENTS = {
  divine: [SPIRITUAL_PALETTE.kumkum, SPIRITUAL_PALETTE.kumkumDeep],
  peace: [SPIRITUAL_PALETTE.bg, SPIRITUAL_PALETTE.sunken],
  meditation: [SPIRITUAL_PALETTE.marigoldLo, SPIRITUAL_PALETTE.marigold],
  sunset: [SPIRITUAL_PALETTE.marigold, SPIRITUAL_PALETTE.bg],
  marigold: ['#F2B45B', SPIRITUAL_PALETTE.marigold],
};

// Shadows – brown-based
export const SPIRITUAL_SHADOWS = {
  peaceful: {
    shadowColor: SPIRITUAL_PALETTE.brown900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  divine: {
    shadowColor: SPIRITUAL_PALETTE.brown900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: SPIRITUAL_PALETTE.brown900,
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
    color: SPIRITUAL_PALETTE.brown800,
  },
  spiritualHeading: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: SPIRITUAL_PALETTE.brown800,
  },
  author: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: SPIRITUAL_PALETTE.brown500,
    textAlign: 'right' as const,
  },
  reflection: {
    fontSize: 14,
    color: SPIRITUAL_PALETTE.brown600,
    fontStyle: 'italic' as const,
    lineHeight: 20,
  },
};
