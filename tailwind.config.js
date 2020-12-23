const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{html,ts,css}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
