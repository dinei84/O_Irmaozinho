/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais
        primary: {
          DEFAULT: '#4A90E2',
          dark: '#357ABD',
          light: '#6BA3E8',
        },
        secondary: {
          DEFAULT: '#2C3E50',
          light: '#34495E',
          dark: '#1A252F',
        },
        // Cores de fundo e texto
        background: '#F8F9FA',
        surface: '#FFFFFF',
        'text-primary': '#2C3E50',
        'text-secondary': '#7F8C8D',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      },
    },
  },
  plugins: [],
}

