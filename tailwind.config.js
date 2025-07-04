/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#0F1014',
        'brand-surface': '#1A1C22',
        'brand-primary': '#3B82F6',
        'brand-secondary': '#8B5CF6',
        'brand-text-primary': '#F3F4F6',
        'brand-text-secondary': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
