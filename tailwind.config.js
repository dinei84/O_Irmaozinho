/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a73e8',
          dark: '#1557b0',
          light: '#e8f0fe',
        },
        secondary: {
          DEFAULT: '#34a853',
          dark: '#2d8e4a',
        },
        accent: {
          DEFAULT: '#fbbc04',
          dark: '#e6a703',
        },
        dark: {
          DEFAULT: '#202124',
          light: '#5f6368',
        },
        light: {
          DEFAULT: '#f8f9fa',
          dark: '#e8eaed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
