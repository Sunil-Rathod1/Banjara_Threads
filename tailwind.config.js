/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50:  '#fdf2f2',
          100: '#fce4e4',
          200: '#f9b8b8',
          300: '#f48080',
          400: '#e84e4e',
          500: '#7b1c1c',
          600: '#6a1818',
          700: '#571414',
          800: '#450f0f',
          900: '#330b0b',
        },
        gold: {
          50:  '#fdf9ed',
          100: '#fbf0ce',
          200: '#f6de94',
          300: '#efc757',
          400: '#e8b534',
          500: '#c9a84c',
          600: '#b08d3a',
          700: '#8f7030',
          800: '#6e5425',
          900: '#4d3b1a',
        },
        ivory: {
          50:  '#ffffff',
          100: '#faf6f0',
          200: '#f5ece1',
          300: '#edddd0',
          400: '#e4cdb9',
          500: '#d8b99f',
          600: '#c19b83',
          700: '#a07d66',
          800: '#7d604e',
          900: '#5a4337',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
