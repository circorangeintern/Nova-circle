/** @type {import('tailwindcss').Config} */
// -----------------------------------------------------------------------------
// PublicEye NG — Design Tokens (Master PRD, Part II)
// Single source of truth for colour, type, spacing, radius and elevation.
// Backend/other devs: change a value here and it propagates everywhere.
// -----------------------------------------------------------------------------
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — Civic Blue system
        civic: {
          DEFAULT: '#1D4ED8', // primary buttons, links, focus
          600: '#1D4ED8',
          500: '#2563EB', // report-issue button, dashboard CTA
          400: '#60A5FA', // secondary / hover / highlights
        },
        // Deep navy used by the top nav + hero gradient
        navy: {
          DEFAULT: '#1B2A6B',
          950: '#101B47',
          900: '#16215A',
          800: '#1B2A6B',
          700: '#24358A',
        },
        accent: {
          DEFAULT: '#F59E0B', // civic orange (headline highlight, warnings)
          soft: '#FEF3E2',
        },
        // Semantic status colours (used identically on every screen)
        status: {
          open: '#F97316', // orange — action needed (PDF §7.2)
          acknowledged: '#D97706', // amber
          progress: '#2563EB', // blue
          resolved: '#16A34A', // green
          disputed: '#DC2626', // red
          offline: '#6B7280', // gray
        },
        success: '#16A34A',
        warning: '#F59E0B',
        critical: '#DC2626',
        // Neutrals
        ink: '#111827',
        slate: '#374151',
        muted: '#6B7280',
        line: '#E5E7EB',
        surface: '#F9FAFB',
      },
      fontFamily: {
        // Display serif gives the civic / editorial authority seen in the mockups.
        // (PRD lists Sora as an alternative — swap here to switch globally.)
        display: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h1: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h2: ['2rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        h3: ['1.5rem', { lineHeight: '1.2' }],
      },
      spacing: {
        // 8pt grid extras
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        card: '1rem', // 16px
        modal: '1.25rem', // 20px
        panel: '1.5rem', // 24px
      },
      boxShadow: {
        'e1': '0 1px 2px 0 rgba(16,24,40,0.06), 0 1px 3px 0 rgba(16,24,40,0.08)',
        'e2': '0 4px 12px -2px rgba(16,24,40,0.10), 0 2px 6px -2px rgba(16,24,40,0.06)',
        'e3': '0 12px 32px -8px rgba(16,24,40,0.18), 0 6px 12px -6px rgba(16,24,40,0.10)',
        'card': '0 1px 3px rgba(16,24,40,0.06), 0 8px 24px -12px rgba(16,24,40,0.12)',
      },
      maxWidth: {
        container: '1320px',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(2.2)', opacity: '0' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
