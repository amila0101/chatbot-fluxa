/**
 * postcss.config.js
 *
 * Tailwind CSS is served via the Play CDN in public/index.html.
 * PostCSS only needs to run autoprefixer for vendor prefix compatibility.
 */
module.exports = {
  plugins: {
    autoprefixer: {},
  },
};
