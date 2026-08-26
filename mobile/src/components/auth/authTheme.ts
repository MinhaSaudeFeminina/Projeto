// The signed-out flow keeps its own warm palette, intentionally apart from the
// in-app theme so onboarding can be restyled without touching the logged-in UI.
export const authColors = {
  background: '#FBF4EB',
  border: '#F0D8E0',
  input: '#FFFDFC',
  muted: '#89656E',
  primary: '#C43A4A',
  primaryDark: '#8D3140',
  primaryForeground: '#FFF9F4',
  rose: '#C56682',
  softPink: '#FBD9E5',
  text: '#5B3038',
} as const;
