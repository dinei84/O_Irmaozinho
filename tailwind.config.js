/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D35400', // Terracotta
          dark: '#A04000',
          light: '#E59866',
        },
        secondary: {
          DEFAULT: '#2C3E50', // Navy
          light: '#34495E',
        },
        accent: {
          DEFAULT: '#F1C40F', // Gold
          hover: '#D4AC0D',
        },
        background: '#FDFBF7', // Cream
        surface: '#FFFFFF',
        text: {
          primary: '#2D3436',
          secondary: '#636E72',
        }
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
