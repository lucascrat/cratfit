/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1bda67",
        "primary-dark": "#14a34d",
        "background-light": "#f6f8f7",
        "background-dark": "#112117",
        "surface-dark": "#1c2e24",
        "surface-dark-highlight": "#254632",
        "surface-light": "#ffffff",
        "card-dark": "#1c3225",
        "border-green": "#356448",
        "vip-gold": "#FFD700",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(27, 218, 103, 0.3)",
        "glow-primary-lg": "0 0 30px rgba(27, 218, 103, 0.5)",
        "glow-gold": "0 0 20px rgba(255, 215, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(27, 218, 103, 0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(27, 218, 103, 0.6)" },
        },
      },
    },
  },
  plugins: [],
}
