/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      opacity: {
        '2': '0.02',
        '3': '0.03',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
        '18': '0.18',
        '22': '0.22',
      },
    },
  },
  plugins: [],
}
