import { roboverseTheme } from '@roboverse/ui-tokens';

/**
 * RoboVerse Mobile Theme Tokens
 * Strict adherence to Futuristic Dark Green 3D Robotics Control-Room Design
 * Dark green/black gradient (#07110D to #0E2A1F), translucent dark glass cards,
 * glowing neon green primary (#39FF6A / #2BD95B), teal 3D highlights (#7FE7D6),
 * and orange (#FF9A1F) strictly reserved for warnings/faults.
 */
export const COLORS = {
  // Backgrounds & Surfaces (Futuristic Control Room)
  bgBase: '#07110D',
  bgGradientEnd: '#0E2A1F',
  bgSurface: '#0E2A1F',
  bgSurfaceRaised: '#143327',
  bgPitchDark: '#040B08',
  card: 'rgba(255, 255, 255, 0.04)',
  cardSolid: '#0E2A1F',

  // Primary Neon Green Brand Palette
  primary: '#39FF6A',
  primaryLight: '#7FE7D6',
  primaryDark: '#2BD95B',

  // Signature Accent (Neon Green)
  neon: '#39FF6A',
  neonHover: '#2BD95B',
  neonMuted: 'rgba(57, 255, 106, 0.45)',
  neonFaint: 'rgba(57, 255, 106, 0.12)',

  // Secondary Accents
  teal: '#7FE7D6',
  tealMuted: '#A3F2E6',
  tealFaint: 'rgba(127, 231, 214, 0.12)',
  blue: '#4C8DFF',
  green: '#39FF6A',
  coral: '#FF4D4D',
  magenta: '#E5199B',

  // Status Colors (Orange strictly for warnings/faults)
  warning: '#FF9A1F',
  error: '#FF4D4D',
  success: '#39FF6A',
  info: '#4C8DFF',

  // Typography
  textPrimary: '#EAF7EF',
  textSecondary: '#CBD8D0',
  textMuted: '#8FA99B',
  textWhite: '#FFFFFF',
  navy: '#EAF7EF',
  white: '#FFFFFF',

  // Borders & Dividers
  border: 'rgba(57, 255, 106, 0.15)',
  borderSubtle: 'rgba(57, 255, 106, 0.08)',
  borderHighlight: 'rgba(57, 255, 106, 0.40)',
  borderAccent: '#39FF6A',
  divider: 'rgba(57, 255, 106, 0.10)',
};
