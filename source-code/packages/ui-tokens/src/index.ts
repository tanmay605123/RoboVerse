export const roboverseTheme = {
  colors: {
    bg: {
      base: '#07110D',
      gradientEnd: '#0E2A1F',
      surface: '#091A14',
      surfaceRaised: '#0E261D',
      pitchDark: '#040B08',
      overlay: 'rgba(4, 11, 8, 0.85)',
    },
    neon: {
      primary: '#39FF6A',
      hover: '#2BD95B',
      active: '#1AC248',
      muted: '#158A38',
      faint: 'rgba(57, 255, 106, 0.12)',
      glow: '0 0 24px rgba(57, 255, 106, 0.45)',
      glowSubtle: '0 0 12px rgba(57, 255, 106, 0.25)',
      volumetric: 'radial-gradient(circle, rgba(57, 255, 106, 0.35) 0%, rgba(57, 255, 106, 0) 70%)',
    },
    robot: {
      teal: '#7FE7D6',
      tealHover: '#60D4C1',
      tealMuted: '#3A9687',
      tealGlow: '0 0 20px rgba(127, 231, 214, 0.35)',
    },
    status: {
      warning: '#FF9A1F',
      warningHover: '#E08312',
      warningGlow: '0 0 16px rgba(255, 154, 31, 0.4)',
      error: '#FF4343',
      errorGlow: '0 0 16px rgba(255, 67, 67, 0.4)',
      success: '#39FF6A',
      info: '#7FE7D6',
    },
    text: {
      primary: '#F0FFF5',
      secondary: '#A3C2B4',
      muted: '#5F8575',
      inverse: '#07110D',
    },
    border: {
      subtle: 'rgba(57, 255, 106, 0.12)',
      highlight: 'rgba(57, 255, 106, 0.35)',
      accent: '#39FF6A',
      teal: 'rgba(127, 231, 214, 0.25)',
      warning: 'rgba(255, 154, 31, 0.35)',
    },
  },

  typography: {
    fonts: {
      sans: "'Sora', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
  },

  glassmorphism: {
    panel: {
      background: 'rgba(9, 26, 20, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(57, 255, 106, 0.15)',
      borderRadius: '18px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(57, 255, 106, 0.15)',
    },
    panelActive: {
      background: 'rgba(14, 38, 29, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid #39FF6A',
      borderRadius: '18px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(57, 255, 106, 0.3), inset 0 1px 0 rgba(57, 255, 106, 0.3)',
    },
    hudBadge: {
      background: 'rgba(4, 11, 8, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(127, 231, 214, 0.3)',
      borderRadius: '9999px',
      color: '#7FE7D6',
    },
  },

  threeGrid: {
    size: 50,
    divisions: 50,
    colorCenterLine: '#39FF6A',
    colorGrid: '#0E3A28',
    opacity: 0.45,
  },
};

export type RoboVerseTheme = typeof roboverseTheme;
