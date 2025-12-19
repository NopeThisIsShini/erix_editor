/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: 'var(--editor-bg)',
          surface: 'var(--editor-surface)',
          text: 'var(--editor-text)',
          muted: 'var(--editor-muted-text)',
          border: 'var(--editor-border)',
          accent: 'var(--editor-accent)',
          'accent-foreground': 'var(--editor-accent-foreground)',
        },
      },
      borderRadius: {
        editor: 'var(--editor-radius)',
      },
      fontFamily: {
        editor: 'var(--editor-font-family)',
      },
    },
  },
  plugins: [],
}
