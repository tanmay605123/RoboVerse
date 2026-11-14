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
        robo: {
          bg: '#07110D',
          bgGradient: '#0E2A1F',
          surface: '#091A14',
          surfaceRaised: '#0E261D',
          pitchDark: '#040B08',
          neon: '#39FF6A',
          neonHover: '#2BD95B',
          neonMuted: '#158A38',
          teal: '#7FE7D6',
          tealHover: '#60D4C1',
          tealMuted: '#3A9687',
          orange: '#FF9A1F',
          orangeHover: '#E08312',
          red: '#FF4343',
          text: '#F0FFF5',
          textSecondary: '#A3C2B4',
          textMuted: '#5F8575',
          borderSubtle: 'rgba(57, 255, 106, 0.15)',
          borderHighlight: 'rgba(57, 255, 106, 0.4)',
        },
      },
      fontFamily: {
        sans: ['Sora', 'Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-glow': '0 0 24px rgba(57, 255, 106, 0.45)',
        'neon-subtle': '0 0 12px rgba(57, 255, 106, 0.25)',
        'teal-glow': '0 0 20px rgba(127, 231, 214, 0.35)',
        'glass-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(57, 255, 106, 0.15)',
        'glass-active': '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(57, 255, 106, 0.3), inset 0 1px 0 rgba(57, 255, 106, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'float-slow': 'floatSlow 4s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(57, 255, 106, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(57, 255, 106, 0.7)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
