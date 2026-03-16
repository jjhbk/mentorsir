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
  accentDark: '#7A5222',

  // Semantic
  success: '#3A6B4F',       // deep forest green
  successLight: '#E3EDE8',
  danger: '#9B3D3D',        // muted red
  dangerLight: '#F2E3E3',
  warning: '#8A6020',       // dark amber

  // Structure
  border: '#E4DCCF',        // warm separator
  divider: '#EDE8DF',       // subtle row divider

  // Dark mode surfaces (Auth screen)
  darkBg: '#1A1410',        // warm black
  darkSurface: '#252019',   // warm dark card
  darkText: '#F0EBE1',
  darkMuted: '#7A6E62',

  // Status (minimal — dots only)
  statusOnTrack: '#3A6B4F',
  statusAtRisk: '#8A6020',
  statusInactive: '#9B3D3D',
} as const;
