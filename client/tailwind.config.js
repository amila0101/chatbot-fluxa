module.exports = {
  // 'class' strategy matches how ThemeContext.js toggles dark mode via isDarkMode state
  darkMode: 'class',

  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  // Safelist arbitrary color values used dynamically in Chatbot.js theme object.
  // Tailwind's purge cannot detect these at build time because they are
  // constructed as template strings (e.g. `${theme.background}`).
  safelist: [
    // Background colors
    'bg-white',
    'bg-gray-50',
    'bg-gray-700',
    'bg-gray-800',
    'bg-black/50',
    // Text colors
    'text-white',
    'text-gray-300',
    'text-gray-400',
    'text-gray-500',
    'text-gray-600',
    'text-gray-900',
    'text-red-500',
    // Border colors
    'border-gray-200',
    'border-gray-800',
    // Hover states
    'hover:bg-gray-100',
    'hover:bg-gray-800',
    // Flex / layout utilities used throughout
    'flex',
    'flex-1',
    'flex-col',
    'h-screen',
    'w-full',
    'w-64',
    'overflow-y-auto',
    'overflow-hidden',
    'items-center',
    'justify-center',
    'justify-between',
    'justify-end',
    'justify-start',
    'gap-2',
    'gap-3',
    'gap-4',
    'gap-6',
    'gap-8',
    // Padding / margin
    'p-2',
    'p-3',
    'p-4',
    'p-6',
    'p-8',
    'px-3',
    'px-4',
    'py-1',
    'py-2',
    'py-4',
    'mb-2',
    'mb-4',
    'mb-8',
    'mb-12',
    'ml-6',
    'mt-1',
    'mt-4',
    'mr-2',
    // Sizing
    'w-4',
    'w-5',
    'w-6',
    'w-8',
    'w-12',
    'h-4',
    'h-5',
    'h-6',
    'h-8',
    'h-16',
    'max-w-xl',
    'max-w-6xl',
    // Rounded
    'rounded',
    'rounded-lg',
    'rounded-xl',
    'rounded-2xl',
    'rounded-full',
    // Borders
    'border',
    'border-t',
    'border-b',
    'border-r',
    'border-dashed',
    'border-2',
    // Font
    'text-sm',
    'text-lg',
    'text-xl',
    'text-3xl',
    'text-5xl',
    'font-semibold',
    'font-bold',
    'font-medium',
    // Layout
    'grid',
    'grid-cols-2',
    'relative',
    'absolute',
    'fixed',
    'inset-0',
    'top-4',
    'right-4',
    'right-2',
    'bottom-2',
    'left-3',
    'z-50',
    // Transitions
    'transition-colors',
    'transition-transform',
    // Space
    'space-y-1',
    'space-y-2',
    'space-y-3',
    'space-y-4',
    // Shadow
    'shadow-md',
    // Ring
    'ring-2',
  ],

  theme: {
    extend: {
      colors: {
        primary: '#2DD4BF',
        dark: {
          DEFAULT: '#1E1E1E',
          lighter: '#1A1B26',
        },
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