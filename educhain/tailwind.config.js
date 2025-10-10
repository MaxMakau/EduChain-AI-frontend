/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        oceanBlue: '#2772A0',
        cloudySky: '#CCDDEA',
        darkText: '#1E293B',
      },
    },
  },
  plugins: [],
}

