/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        club: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
          menu: 'var(--color-menu)',
          header: 'var(--color-header)',
          footer: 'var(--color-footer)',
          card: 'var(--color-card)',
          button: 'var(--color-button)',
          buttonHover: 'var(--color-button-hover)',
          bg: 'var(--color-bg)',
          textMain: 'var(--color-text-main)',
          textSub: 'var(--color-text-sub)',
          border: 'var(--color-border)',
          icon: 'var(--color-icon)',
          kpi: 'var(--color-kpi)',
          alert: 'var(--color-alert)',
          success: 'var(--color-success)',
          warn: 'var(--color-warn)',
          error: 'var(--color-error)'
        }
      }
    },
  },
  plugins: [],
};
