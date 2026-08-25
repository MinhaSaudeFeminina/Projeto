export const colors = {
  background: '#fcfbfc',
  foreground: '#2b1b32',
  card: '#ffffff',
  cardForeground: '#2b1b32',
  primary: '#c847b0',
  primaryForeground: '#ffffff',
  secondary: '#f2edf8',
  secondaryForeground: '#402d4b',
  muted: '#f6f3f7',
  mutedForeground: '#817487',
  accent: '#eee2f5',
  accentForeground: '#56366b',
  destructive: '#ef4444',
  destructiveLight: '#fff1f2',
  destructiveForeground: '#ffffff',
  border: '#ede6ef',
  input: '#e7dde9',
  ring: '#c847b0',
  rosa: '#e66798',
  rosaLight: '#f9dce8',
  lilas: '#b98fdb',
  lilasLight: '#f0e8f8',
  roxo: '#8c2eb8',
  roxoLight: '#eedff5',
  magenta: '#d9269f',
  fertile: '#40bf73',
  fertileLight: '#def5e7',
  ovulation: '#e6951f',
  ovulationLight: '#faecd6',
  tabInactive: '#817487',
  backdrop: 'rgba(43, 27, 50, 0.32)',
} as const;

export const typography = {
  fontFamily: 'Nunito_400Regular',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const shadows = {
  card: {
    shadowColor: '#2b1b32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
} as const;
