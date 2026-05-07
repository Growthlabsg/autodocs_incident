/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        autodocs: {
          primary: '#0F7377',
          secondary: '#0a5254',
        },
        autoincident: {
          primary: '#EF4444',
          secondary: '#DC2626',
        },
      },
    },
  },
  plugins: [],
}
