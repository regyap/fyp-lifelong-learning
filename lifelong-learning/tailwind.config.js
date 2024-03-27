
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {

      gridColumnStart: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
      },

      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'outfit': ['Outfit', 'sans-serif']
      },

    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
};
