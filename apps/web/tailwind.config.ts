import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // RoboVerse Futuristic Dark Green 3D Robotics Control-Room Design System
        brand: {
          neon: '#39FF6A',
          neonDark: '#2BD95B',
          teal: '#7FE7D6',
          orange: '#FF9A1F', // Restricted to warnings, faults, and "needs attention"
          coral: '#FF4D4D',  // Errors / danger
          blue: '#4C8DFF',   // Info
          dark: '#07110D',
          darkSurface: '#0E2A1F',
          darkPitch: '#040B08',
          darkCard: 'rgba(255, 255, 255, 0.04)',
          border: 'rgba(57, 255, 106, 0.15)',
          borderSubtle: 'rgba(57, 255, 106, 0.08)',
          borderHighlight: 'rgba(57, 255, 106, 0.40)',
          navy: '#EAF7EF',   // Headings & big metrics: near-white
          text: '#EAF7EF',
          muted: '#8FA99B',  // Muted green-grey labels
          pageBg: '#07110D',
          card: 'rgba(255, 255, 255, 0.04)',
          // Aliases for backwards compatibility
          orangeLight: '#7FE7D6',
          orangeDark: '#2BD95B',
          green: '#39FF6A',
          magenta: '#E5199B',
          purple: '#A855F7',
          darkBg: '#07110D',
          darkBorder: 'rgba(57, 255, 106, 0.15)',
        },
        // Robo control-room semantic aliases
        robo: {
          neon: '#39FF6A',
          neonDark: '#2BD95B',
          teal: '#7FE7D6',
          orange: '#FF9A1F',
          red: '#FF4D4D',
          blue: '#4C8DFF',
          text: '#EAF7EF',
          textSecondary: '#CBD8D0',
          textMuted: '#8FA99B',
          surface: '#07110D',
          surfaceRaised: '#0E2A1F',
          borderSubtle: 'rgba(57, 255, 106, 0.15)',
          borderHighlight: 'rgba(57, 255, 106, 0.40)',
        },
      },
      fontFamily: {
        sans: ['Sora', 'Manrope', 'Poppins', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card-soft': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'card-hover': '0 12px 40px 0 rgba(7, 27, 19, 0.8), 0 0 15px rgba(57, 255, 106, 0.15)',
        'neon-pill': '0 0 16px rgba(57, 255, 106, 0.45)',
        'neon-glow': '0 0 24px rgba(57, 255, 106, 0.50)',
        'neon-subtle': '0 0 12px rgba(57, 255, 106, 0.25)',
        'teal-pill': '0 0 14px rgba(127, 231, 214, 0.40)',
        'orange-pill': '0 0 16px rgba(57, 255, 106, 0.45)',
        'blue-pill': '0 0 14px rgba(76, 141, 255, 0.35)',
        'modal-soft': '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(57, 255, 106, 0.15)',
      },
      borderRadius: {
        card: '18px',
        pill: '9999px',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #39FF6A 0%, #2BD95B 100%)',
        'neon-gradient-hover': 'linear-gradient(135deg, #2BD95B 0%, #1FB84C 100%)',
        'orange-gradient': 'linear-gradient(135deg, #39FF6A 0%, #2BD95B 100%)',
        'orange-gradient-hover': 'linear-gradient(135deg, #2BD95B 0%, #1FB84C 100%)',
        'blue-gradient': 'linear-gradient(135deg, #4C8DFF 0%, #7BAAFF 100%)',
        'green-gradient': 'linear-gradient(135deg, #39FF6A 0%, #2BD95B 100%)',
        'control-gradient': 'radial-gradient(ellipse at 50% -20%, #0E2A1F 0%, #07110D 70%, #040B08 100%)',
        'glass-panel': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'pastel-glow': 'radial-gradient(at 0% 0%, rgba(57, 255, 106, 0.12) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(127, 231, 214, 0.10) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(7, 17, 13, 0.9) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'floatSlow 4s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(57, 255, 106, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(57, 255, 106, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
