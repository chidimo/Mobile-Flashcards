/** @type {import('tailwindcss').Config} */
module.exports = {
  // Toggled from ThemeProvider via nativewind's colorScheme.set
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Set at runtime from the chosen palette (see utils/palette-vars.ts); defaults live in global.css
      colors: {
        primary: Object.fromEntries(
          [50, 100, 200, 400, 500, 600, 700].map((shade) => [
            shade,
            `rgb(var(--primary-${shade}) / <alpha-value>)`,
          ]),
        ),
        ink: Object.fromEntries(
          [700, 800, 900, 950].map((shade) => [
            shade,
            `rgb(var(--ink-${shade}) / <alpha-value>)`,
          ]),
        ),
        canvas: "rgb(var(--canvas) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
