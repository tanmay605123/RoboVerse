/**
 * RoboVerse UI Design System Tokens
 * Strict adherence to Original Futuristic Dark Green 3D Robotics Control-Room Design
 * Dark green/black gradient (#07110D to #0E2A1F), glowing isometric 3D robot HUD,
 * translucent dark glass panels, neon green accents (#39FF6A / #2BD95B).
 */

export const roboverseTheme = {
  colors: {
    // Dark Futuristic Control-Room Default Backgrounds & Glass Surfaces
    dark: {
      bg: '#07110D',
      bgEnd: '#0E2A1F',
      bgPitch: '#040B08',
      card: 'rgba(255, 255, 255, 0.04)',
      cardHover: 'rgba(255, 255, 255, 0.07)',
      surfaceRaised: '#0F261D',
      surfaceRaisedHover: '#143327',
      border: 'rgba(57, 255, 106, 0.15)',
      borderSubtle: 'rgba(57, 255, 106, 0.08)',
      borderHighlight: 'rgba(57, 255, 106, 0.40)',
      divider: 'rgba(57, 255, 106, 0.10)',
    },

    // For backwards compatibility and future optional light theme
    light: {
      bg: '#07110D',
      card: 'rgba(255, 255, 255, 0.04)',
      surfaceRaised: '#0F261D',
      surfaceHover: '#143327',
      border: 'rgba(57, 255, 106, 0.15)',
      borderSubtle: 'rgba(57, 255, 106, 0.08)',
      divider: 'rgba(57, 255, 106, 0.10)',
    },

    // Brand Primary Neon Green (#39FF6A / #2BD95B)
    primary: {
      neon: '#39FF6A',
      neonDark: '#2BD95B',
      neonGlow: 'rgba(57, 255, 106, 0.40)',
      faint: 'rgba(57, 255, 106, 0.12)',
      gradient: 'linear-gradient(135deg, #39FF6A 0%, #2BD95B 100%)',
      gradientHover: 'linear-gradient(135deg, #2BD95B 0%, #1FB84C 100%)',
      glow: '0 0 20px rgba(57, 255, 106, 0.45)',
      // Backwards-compat aliases mapped to neon green
      orange: '#39FF6A',
      orangeLight: '#7FE7D6',
      orangeDark: '#2BD95B',
      orangeGradient: 'linear-gradient(135deg, #39FF6A 0%, #2BD95B 100%)',
      orangeGradientHover: 'linear-gradient(135deg, #2BD95B 0%, #1FB84C 100%)',
    },

    // Secondary & State Accents
    secondary: {
      teal: '#7FE7D6', // Robot & 3D highlights
      tealLight: '#A3F2E6',
      tealFaint: 'rgba(127, 231, 214, 0.12)',
      blue: '#4C8DFF', // Info
      blueLight: '#7BAAFF',
      blueFaint: 'rgba(76, 141, 255, 0.12)',
      orange: '#FF9A1F', // ONLY for warnings, faults & "needs attention"
      orangeFaint: 'rgba(255, 154, 31, 0.15)',
      coral: '#FF4D4D', // Danger / errors
      coralFaint: 'rgba(255, 77, 77, 0.15)',
      purple: '#A855F7',
      purpleFaint: 'rgba(168, 85, 247, 0.12)',
      green: '#39FF6A',
      greenLight: '#7FE7D6',
      greenFaint: 'rgba(57, 255, 106, 0.12)',
      magenta: '#E5199B',
      magentaFaint: 'rgba(229, 25, 155, 0.12)',
    },

    // Specific Status Map
    status: {
      success: '#39FF6A',
      info: '#4C8DFF',
      warning: '#FF9A1F',
      danger: '#FF4D4D',
      offline: '#8FA99B',
    },

    // Typography Colors
    text: {
      primary: '#EAF7EF', // Near-white headings and big numbers
      headings: '#EAF7EF',
      body: '#CBD8D0',
      muted: '#8FA99B', // Muted green-grey for labels & meta
      subtle: '#527063',
      placeholder: '#527063',
      white: '#FFFFFF',
      navy: '#EAF7EF', // mapped for backwards compat
      darkHeadings: '#EAF7EF',
      darkBody: '#CBD8D0',
      darkMuted: '#8FA99B',
    },

    // Glass & HUD Backdrops
    glass: {
      fill: 'rgba(255, 255, 255, 0.04)',
      fillHover: 'rgba(255, 255, 255, 0.07)',
      border: 'rgba(57, 255, 106, 0.15)',
      borderActive: 'rgba(57, 255, 106, 0.40)',
      blur: '16px',
    },

    // Control-Room Glow Gradients
    backdrop: {
      gradient: 'radial-gradient(ellipse at 50% -20%, #0E2A1F 0%, #07110D 70%, #040B08 100%)',
      gridColor: 'rgba(57, 255, 106, 0.08)',
    },
  },

  typography: {
    fonts: {
      sans: "'Sora', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  shadows: {
    card: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
    cardHover: '0 12px 40px 0 rgba(7, 27, 19, 0.8), 0 0 15px rgba(57, 255, 106, 0.15)',
    neonPill: '0 0 16px rgba(57, 255, 106, 0.45)',
    neonGlow: '0 0 24px rgba(57, 255, 106, 0.50)',
    tealPill: '0 0 14px rgba(127, 231, 214, 0.40)',
    modal: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(57, 255, 106, 0.12)',
    dropdown: '0 10px 30px rgba(0, 0, 0, 0.7)',
    orangePill: '0 0 14px rgba(57, 255, 106, 0.40)', // mapped
    bluePill: '0 0 14px rgba(76, 141, 255, 0.40)',
  },

  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    standard: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

export type RoboVerseTheme = typeof roboverseTheme;
