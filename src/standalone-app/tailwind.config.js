/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0078D4', dark: '#005a9e', light: '#e6f2fb' },
      },
    },
  },
  plugins: [],
}
