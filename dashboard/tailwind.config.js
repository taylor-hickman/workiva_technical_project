/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'card': 'hsl(var(--card))',
          'card-foreground': 'hsl(var(--card-foreground))',
        },
      },
    },
    plugins: [],
  }