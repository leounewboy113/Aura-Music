export const COLORS = {
  // Backgrounds
  bg: '#080510',
  bgSecondary: '#0d0614',
  surface: 'rgba(255,255,255,0.04)',
  glass: 'rgba(255,255,255,0.07)',
  glassStrong: 'rgba(255,255,255,0.12)',

  // Accents
  primary: '#e8460a',
  secondary: '#f5a623',
  purple: '#6c3ff5',
  teal: '#0af5a6',
  pink: '#f50a7f',
  blue: '#0a7ff5',

  // Text
  text: '#f0eaf8',
  textMuted: 'rgba(240,234,248,0.45)',
  textDim: 'rgba(240,234,248,0.25)',

  // Borders
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.12)',

  // Gradients (used as arrays for LinearGradient)
  gradientPrimary: ['#e8460a', '#c5390a'],
  gradientHero: ['rgba(232,70,10,0.25)', 'rgba(245,166,35,0.15)'],
  gradientCard: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)'],

  // Artist gradient presets
  artistColors: [
    ['#e8460a', '#1a0a2e'],
    ['#6c3ff5', '#1a0040'],
    ['#f5a623', '#3d2900'],
    ['#0af5a6', '#003d29'],
    ['#f50a7f', '#3d0020'],
    ['#0a7ff5', '#001a3d'],
  ],

  // Medal colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

export const FONTS = {
  display: 'System',   // Remplacé par Syne au runtime
  body: 'System',      // Remplacé par DM Sans au runtime
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    hero: 28,
    display: 36,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '800',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const SHADOWS = {
  primary: {
    shadowColor: '#e8460a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
