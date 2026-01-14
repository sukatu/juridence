/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
          colors: {
            brand: {
              // Primary Blue from Figma (#022658)
              50: '#f0f4f8',
              100: '#d4e1ea',
              200: '#b1b9c6',
              300: '#868c98',
              400: '#525866',
              500: '#022658', // Primary Blue from Figma
              600: '#1a365d',
              700: '#0f2847',
              800: '#070810',
              900: '#050f1c',
              950: '#030509',
              DEFAULT: '#022658',
              dark: '#0f2847',
              light: '#1a365d'
            },
            figma: {
              primary: '#022658',
              black: '#070810',
              gray1: '#525866',
              gray2: '#868C98',
              gray3: '#B1B9C6',
              gray4: '#D4E1EA',
              offWhite: '#F7F8FA',
              reserve: '#1A365D',
              error: '#EF4444',
              success: '#10B981',
              neutralBlue: '#3B82F6',
              orange: '#F59E0B',
            },
            accent: {
              // Teal - Secondary brand color (#5CDAB9)
              50: '#f0fdfa',
              100: '#ccfbf1',
              200: '#99f6e4',
              300: '#5CDAB9', // Primary Teal
              400: '#2dd4bf',
              500: '#14b8a6',
              600: '#0d9488',
              700: '#0f766e',
              800: '#115e59',
              900: '#134e4a',
              950: '#042f2e'
            },
            light: {
              // Light Blue - Tertiary brand color (#D5DFE7)
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#D5DFE7', // Primary Light Blue
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a',
              950: '#020617'
            }
          },
      fontFamily: {
        'inter': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
        'satoshi': ['Satoshi', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        'poppins': ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif']
      },
      fontSize: {
        'caption': ['12px', { lineHeight: '100%' }],
        'small': ['14px', { lineHeight: '100%' }],
        'body': ['16px', { lineHeight: '100%' }],
        'h4': ['18px', { lineHeight: '100%' }],
      }
    },
  },
  plugins: [],
}
