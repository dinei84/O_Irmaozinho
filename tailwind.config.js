/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores de ação — paleta terrosa (PROJECT_SPEC.md §3)
        primary: {
          DEFAULT: '#B65E38', // terracota
          dark: '#9B5030',
          light: '#C17656',
        },
        secondary: {
          DEFAULT: '#47533F', // oliva
          light: '#636D5C',
          dark: '#3C4736',
        },
        // Cores de fundo e texto
        background: '#F7F1E7', // papel
        surface: '#FFFFFF',
        'text-primary': '#2A2620', // tinta
        'text-secondary': '#8B7C64', // neutro
        // Paleta complementar (PROJECT_SPEC.md §3)
        dourado: '#C79A3E',
        areia: '#EFE6D5',
        pessego: '#E8C9B4',
        borda: '#E4D9C7',
      },
      fontFamily: {
        sans: ['Mulish', 'sans-serif'],
        heading: ['Spectral', 'serif'],
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      },
    },
  },
  plugins: [],
}

