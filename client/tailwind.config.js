module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2DD4BF',
        dark: {
          DEFAULT: '#1E1E1E',
          lighter: '#1A1B26',
        }
      },
      animation: {
        'slide-down': 'slideDown 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { height: 0, opacity: 0 },
          '100%': { height: 'var(--radix-accordion-content-height)', opacity: 1 },
        },
        slideUp: {
          '0%': { height: 'var(--radix-accordion-content-height)', opacity: 1 },
          '100%': { height: 0, opacity: 0 },
        },
      },
    },
  },
  plugins: [],
} 