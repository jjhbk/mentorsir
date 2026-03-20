export const colors = {
  // Backgrounds
  bg: '#F6F2EB',           // warm parchment
  surface: '#FDFBF7',      // near white, warm
  surfaceAlt: '#F0EBE1',   // slightly deeper parchment

  // Typography
  text: '#1C1710',          // warm near-black
  textMuted: '#8B7B6E',     // warm taupe
  textFaint: '#C4B8AA',     // very faint

  // Accent — single cognac amber
  accent: '#9C6B2E',
  accentLight: '#F4E6D0',
  accentSubtle: '#FBF5ED',
  accentDark: '#7A5222',

  // Semantic
  success: '#3A6B4F',       // deep forest green
  successLight: '#E3EDE8',
  successSubtle: '#F1F6F3',
  danger: '#9B3D3D',        // muted red
  dangerLight: '#F2E3E3',
  dangerSubtle: '#FAF1F1',
  warning: '#8A6020',       // dark amber
  warningLight: '#F5EDD8',
  warningSubtle: '#FCF7EC',

  // Structure
  border: '#E4DCCF',        // warm separator
  borderStrong: '#D0C5B3',  // stronger border
  divider: '#EDE8DF',       // subtle row divider

  // Elevation (shadows)
  shadow: 'rgba(28, 23, 16, 0.07)',
  shadowMd: 'rgba(28, 23, 16, 0.11)',

  // Dark mode surfaces (Auth screen)
  darkBg: '#1A1410',        // warm black
  darkSurface: '#252019',   // warm dark card
  darkCard: '#2E2820',      // slightly lighter dark card
  darkText: '#F0EBE1',
  darkMuted: '#7A6E62',
  darkFaint: '#3E342A',

  // Status (minimal — dots only)
  statusOnTrack: '#3A6B4F',
  statusAtRisk: '#8A6020',
  statusInactive: '#9B3D3D',
} as const;
