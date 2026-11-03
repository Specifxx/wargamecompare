import type { Config } from "tailwindcss";

// Colours are CSS variables (src/app/globals.css) so light and dark themes
// share one set of class names: bg-surface, text-ink, border-line, …
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        raised: v("raised"),
        line: v("line"),
        ink: v("ink"),
        muted: v("muted"),
        faint: v("faint"),
        brand: { DEFAULT: v("brand"), ink: v("brand-ink"), soft: v("brand-soft"), strong: v("brand-strong") },
        spark: v("spark"),
        open: { DEFAULT: v("open"), soft: v("open-soft") },
        sold: { DEFAULT: v("sold"), soft: v("sold-soft") },
        stale: { DEFAULT: v("stale"), soft: v("stale-soft") },
        ad: { DEFAULT: v("ad"), line: v("ad-line") },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { lg: "10px", xl: "16px", "2xl": "22px", "3xl": "28px" },
      boxShadow: {
        card: "0 1px 2px rgb(var(--shadow) / 0.08), 0 1px 0 rgb(var(--shadow) / 0.03)",
        lift: "0 16px 40px -16px rgb(var(--shadow) / 0.45), 0 4px 10px rgb(var(--shadow) / 0.08)",
        glow: "0 0 0 1px rgb(var(--brand) / 0.35), 0 12px 40px -10px rgb(var(--brand) / 0.45)",
      },
      maxWidth: { page: "1200px", shell: "1480px" },
    },
  },
  plugins: [],
};

export default config;
