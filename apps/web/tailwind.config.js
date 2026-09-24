/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3f4a32',
        secondary: '#66734d',
        accent: '#7a6848',
        gold: '#c5a46d',
        ink: '#2d3027',
        muted: '#6e6a5f',
        surface: '#f5f0e6',
        'surface-soft': '#ebe4d7',
        paper: '#fffdf8',
        line: '#d8cfbd',
      },
    },
  },
  plugins: [],
};
