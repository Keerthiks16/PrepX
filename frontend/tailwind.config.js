/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Foundation (dark slate)
        'base-900': '#0F1419',
        'base-800': '#1A1F2E',
        'base-700': '#252B3B',
        'base-600': '#353D50',
        'text-primary': '#F0F2F5',
        'text-secondary': '#8B95A5',

        // Unified Green Accent Palette (7 shades)
        'accent': {
          DEFAULT: '#00B894',   // Primary emerald
          50:  '#EAFFF8',       // Lightest mint tint
          100: '#B8FFE5',       // Pale mint
          200: '#55EFC4',       // Bright mint
          300: '#00D2A0',       // Vivid emerald
          400: '#00B894',       // Primary (same as DEFAULT)
          500: '#009B7D',       // Medium green
          600: '#007D65',       // Deep emerald
          700: '#005F4D',       // Forest green
          800: '#004236',       // Dark forest
          900: '#002A22',       // Deepest green
        },

        // Semantic
        'success': '#00B894',
        'warning': '#FDCB6E',
        'error':   '#FF6B6B',
        'info':    '#74B9FF',

        // Legacy aliases
        'dark-blue': '#0F1419',
        'dark-green': '#2B7A78',
        'medium-green': '#3AAFA9',
        'light-cyan': '#DEF2F1',
        'off-white': '#FEFFFF',
      },
    },
  },
  plugins: [],
}