export default {
  plugins: {
    // Tailwind v4 via `@tailwindcss/vite` does not require @tailwindcss/postcss.
    // Keeping this config minimal avoids loading the repo-level PostCSS plugin.
    autoprefixer: {},
  },
};

