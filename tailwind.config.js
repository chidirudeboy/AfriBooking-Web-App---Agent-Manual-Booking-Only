/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E09702',
          dark: '#C08502',
          light: '#FFAB48',
          hover: '#D68902',
        },
        accent: {
          DEFAULT: '#FFAB48',
        },
        error: {
          DEFAULT: '#FF5252',
        },
        success: {
          DEFAULT: '#4CAF50',
        },
        warning: {
          DEFAULT: '#FF9800',
        },
        info: {
          DEFAULT: '#2196F3',
        },
      },
    },
  },
  plugins: [],
}

