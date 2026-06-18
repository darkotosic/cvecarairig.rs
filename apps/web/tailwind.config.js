/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#111827',
        secondary: '#1e3a8a',
        accent: '#b91c1c',
        gold: '#c8a24a',
      },
    },
  },
  plugins: [],
};
