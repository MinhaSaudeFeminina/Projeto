// Design tokens mirrored from the admin web app (frontend/src/index.css and
// tailwind.config.ts) so both clients share one identity: cream background,
// deep-red primary, soft pink and peach accents, Barlow Condensed for text and
// Leckerli One for the brand. Hex values are the web HSL tokens resolved.
export const colors = {
  background: '#fcf8f3',
  foreground: '#503033',
  card: '#ffffff',
  cardForeground: '#503033',
  // Web sets a single deep tone on every h1-h6; mobile titles reuse it.
  heading: '#7e252e',
  display: '#9b2732',
  primary: '#cc6670',
  primaryDark: '#7e252e',
  primaryForeground: '#fdfaf7',
  secondary: '#fce9ef',
  // A pink one step deeper than `secondary`, for fills that must read against
  // the cream background (calendar days, hero panels).
  secondaryStrong: '#fadbe6',
  secondaryForeground: '#8f3d45',
  muted: '#f9f3ec',
  mutedForeground: '#8f7073',
  accent: '#f4cebe',
  accentForeground: '#673237',
  peach: '#e9a78b',
  peachLight: '#f7ded4',
  rose: '#d590a5',
  roseLight: '#f8e2e9',
  success: '#5eba94',
  successLight: '#daf1e7',
  warning: '#e9b163',
  warningLight: '#fae9d1',
  warningForeground: '#5c3a0a',
  info: '#d590a5',
  infoLight: '#f9e7ec',
  destructive: '#d65c5c',
  destructiveLight: '#fceeee',
  destructiveForeground: '#ffffff',
  border: '#f2e3e8',
  input: '#f2e3e8',
  ring: '#d27982',
  tabInactive: '#8f7073',
  backdrop: 'rgba(80, 48, 51, 0.32)',
} as const;

/** Counterparts of the web `--gradient-*` custom properties. */
export const gradients = {
  primary: ['#da8189', '#df9fb3'],
  soft: ['#fcf8f3', '#fce9ef'],
  warm: ['#fbe4ec', '#f6d8cb'],
} as const;

export const typography = {
  // React Native picks a face by family name, not by numeric weight, so each
  // weight is its own family here.
  fonts: {
    regular: 'BarlowCondensed_400Regular',
    italic: 'BarlowCondensed_400Regular_Italic',
    medium: 'BarlowCondensed_500Medium',
    semibold: 'BarlowCondensed_600SemiBold',
    bold: 'BarlowCondensed_700Bold',
    extraBold: 'BarlowCondensed_800ExtraBold',
    display: 'LeckerliOne_400Regular',
  },
  // Barlow Condensed is narrower than the previous face, so the scale runs one
  // step larger to keep the same reading size.
  sizes: {
    xs: 13,
    sm: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
  },
  letterSpacing: 0.2,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Web `--radius` is 1rem, with the smaller steps derived from it.
export const radii = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const shadows = {
  /** Matches the web `shadow-sm` used on cards. */
  card: {
    shadowColor: '#7e252e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  /** Matches the web `shadow-md` used on floating and active elements. */
  raised: {
    shadowColor: '#7e252e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  radii,
  shadows,
} as const;
