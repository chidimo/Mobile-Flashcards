/** @type {import('tailwindcss').Config} */
module.exports = {
  // Toggled from ThemeProvider via nativewind's colorScheme.set
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f1edff",
          100: "#e4dcff",
          200: "#cbbcff",
          400: "#9a7fff",
          500: "#7c5cff",
          600: "#6a45f5",
          700: "#5632d6",
        },
        canvas: "#f7f6fc",
        // Dark surfaces, tinted toward the brand violet
        ink: { 700: "#2c2848", 800: "#1b1830", 900: "#100e1d", 950: "#0b0914" },
      },
    },
  },
  plugins: [],
};
