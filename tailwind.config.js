/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f8faf5',
          100: '#f1f5eb',
          200: '#e2ecd7',
          300: '#cbdcc0',
          400: '#a8c69d',
          500: '#86ae7a',
          600: '#68925b',
          700: '#527548',
          800: '#435e3b',
          900: '#384f33',
        },
        soil: {
          50: '#fbf8f7',
          100: '#f7f1ef',
          200: '#eddfdb',
          300: '#dfc4bc',
          400: '#ca9f91',
          500: '#b47a6a',
          600: '#a26252',
          700: '#875143',
          800: '#714539',
          900: '#5e3a30',
        },
        forest: {
          950: '#1b3a16',
        },
        terracotta: {
          500: '#d35400',
        },
        amber: {
          500: '#f39c12',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'premium': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'premium-hover': '0 12px 48px 0 rgba(31, 38, 135, 0.12)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}

