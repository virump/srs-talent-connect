/**
 * Must stay CommonJS `postcss.config.js`.
 *
 * Next.js 14 does not load `postcss.config.mjs`, so the previous ESM config
 * was silently ignored: Tailwind never ran, `@tailwind`/`@apply` were emitted
 * verbatim, and the app shipped ~5 KB of unprocessed CSS with no utility
 * classes at all.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
  },
}
