/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '1/10': '10%',
        '3/10': '30%',
        '7/10': '70%',
        '9/10': '90%',
      },
      height: {
        '1/10': '10%',
        '3/10': '30%',
        '7/10': '70%',
        '9/10': '90%',
        '2screen': '200vh'
      },
      spacing: {
        '15': '58px',
        '2/5': '40%',
        '3/5': '60%',
        '6.5/10': '65%',
        '7/10': '70%',
        '8.4/10': '84%',
      },
      fontSize: {
        '2xs': '10px',
      }
    },
  },
  plugins: [],
}
