/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg:      'var(--bg)',
        surface: 'var(--bg-surface)',
        raised:  'var(--bg-raised)',
        subtle:  'var(--bg-subtle)',
        // Border colors (also usable as bg/text for hover tricks)
        bd: {
          DEFAULT: 'var(--border)',
          dim:     'var(--border-dim)',
        },
        // Text
        tx: {
          DEFAULT: 'var(--text)',
          dim:     'var(--text-dim)',
          muted:   'var(--text-muted)',
        },
        // Primary accent
        accent: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          dim:     'var(--accent-dim)',
          fg:      'var(--accent-text)',
        },
        // Secondary accent
        accent2: {
          DEFAULT: 'var(--accent2)',
          fg:      'var(--accent2-text)',
        },
        // Generate button
        gen: {
          DEFAULT: 'var(--generate-bg)',
          hover:   'var(--generate-hover)',
          fg:      'var(--generate-text)',
        },
        // Status
        'status-up': 'var(--status-up)',
        // Danger
        danger: {
          DEFAULT: 'var(--color-danger)',
          soft:    'var(--color-danger-soft)',
        },
        // Warning
        warning: 'var(--color-warning)',
      },
      borderColor: {
        base:   'var(--border)',
        dim:    'var(--border-dim)',
        accent: 'var(--accent)',
      },
    },
  },
  plugins: [],
}
