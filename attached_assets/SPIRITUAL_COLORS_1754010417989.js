// SPIRITUAL COLOR PALETTE - Extract these exact colors for React Native
// Use these hex values in your React Native StyleSheet

export const SPIRITUAL_COLORS = {
  // Primary Saffron Colors
  primary: '#FF6B35',           // Rich saffron orange (--primary: 30 100% 60%)
  primaryGlow: '#FFA366',       // Lighter saffron for glows (--primary-glow: 35 95% 70%)
  primaryForeground: '#FDF8F3', // Light cream for text on primary
  
  // Background Colors  
  background: '#FDF8F3',        // Warm ivory white (--background: 35 25% 98%)
  cardBackground: '#FEFCF8',    // Cream white with subtle warmth (--card: 40 50% 97%)
  
  // Text Colors
  foreground: '#2D1810',        // Deep earth brown (--foreground: 15 25% 15%)
  textMuted: '#8E6A5B',         // Warm gray (--muted-foreground: 25 15% 45%)
  
  // Secondary Colors
  secondary: '#D4AF37',         // Deep ceremonial gold (--secondary: 45 85% 55%)
  secondaryForeground: '#2D1810',
  
  // Accent Colors
  accent: '#F4E4C1',           // Light saffron accent (--accent: 35 70% 85%)
  accentForeground: '#2D1810',
  
  // Spiritual Elements
  spiritualRed: '#D32F2F',     // Temple red (--spiritual-red: 0 75% 55%)
  omGold: '#DAA520',           // Om symbol gold (--om-symbol: 45 90% 50%)
  
  // Border and Input
  border: '#E8D5B7',           // Subtle warm border (--border: 40 25% 85%)
  input: '#F9F3E9',            // Input background (--input: 40 25% 90%)
  
  // Tab Navigation
  tabBackground: '#FDF8F3',
  tabForeground: '#2D1810', 
  tabActive: '#FF6B35',
  tabActiveForeground: '#FEFCF8',
};

// GRADIENTS for LinearGradient component
export const SPIRITUAL_GRADIENTS = {
  divine: ['#FF6B35', '#D4AF37'],      // Primary to secondary
  peace: ['#FDF8F3', '#F4E4C1'],       // Background to accent  
  meditation: ['#FFA366', '#FF6B35'],   // Light to primary
  sunset: ['#FF6B35', '#FFE5D9'],       // Primary to very light
};

// SHADOWS for React Native
export const SPIRITUAL_SHADOWS = {
  peaceful: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  divine: {
    shadowColor: '#D4AF37', 
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  }
};

// TYPOGRAPHY
export const SPIRITUAL_TYPOGRAPHY = {
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#2D1810',
  },
  spiritualHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1810',
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    textAlign: 'right',
  },
  reflection: {
    fontSize: 14,
    color: '#5D4037',
    fontStyle: 'italic',
    lineHeight: 20,
  }
};
