/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        trio: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          orange: '#f59e0b',
          amber: '#fb923c',
        },
        brand: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#ec4899', // Primary Vibrant Pink/Magenta from Logo
          600: '#d946ef',
          700: '#c026d3',
          800: '#a21caf',
          900: '#86198f',
          glow: '#f59e0b',
        },
        dark: {
          bg: '#08080a',
          card: '#101014',
          surface: '#18181f',
          border: '#242430',
          muted: '#8b8b9e',
        }
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(236, 72, 153, 0.12) 1px, transparent 1px)",
        'mesh-pattern': "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
        'trio-gradient': "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)",
        'trio-ambient': "radial-gradient(ellipse at 50% -20%, rgba(139, 92, 246, 0.25), rgba(236, 72, 153, 0.15), rgba(8, 8, 10, 0))",
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'apple-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      boxShadow: {
        'apple-glass': '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'trio-glow': '0 0 35px rgba(236, 72, 153, 0.35), 0 0 60px rgba(245, 158, 11, 0.2)',
        'trio-glow-lg': '0 0 60px rgba(139, 92, 246, 0.4), 0 0 90px rgba(236, 72, 153, 0.3)',
      },
      animation: {
        'print-beam': 'beam 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        beam: {
          '0%, 100%': { transform: 'translateX(0%) opacity(0.3)' },
          '50%': { transform: 'translateX(100%) opacity(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}


