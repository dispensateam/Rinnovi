/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette di base (§9.1) — nessun colore va hardcoded nei componenti
        bg: '#0A0810',
        'bg-raised': '#131019',
        card: '#17151E',
        'card-hi': '#1E1B26',
        accent: '#6C4BF6',
        'accent-glow': '#8B6BFF',
        'planet-top': '#F5A03C',
        'planet-bottom': '#E8407A',
        'text-primary': '#FFFFFF',
        'text-muted': '#8E8A99',
        warning: '#F5A03C',
        danger: '#E5484D',
        // Superfici accessorie ricorrenti
        'today-cell': '#3A2A6B',
        'tab-active': '#2A2632',
        hairline: 'rgba(255,255,255,.08)',
        // I 14 colori assegnabili agli abbonamenti (§9.1)
        sub: {
          viola: '#6C4BF6',
          indaco: '#4F46E5',
          blu: '#2563EB',
          ciano: '#06B6D4',
          teal: '#14B8A6',
          verde: '#22C55E',
          lime: '#84CC16',
          giallo: '#EAB308',
          arancio: '#F5A03C',
          corallo: '#FB7185',
          rosso: '#E5484D',
          magenta: '#E8407A',
          rosa: '#EC4899',
          ardesia: '#64748B',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        // Colonna mobile: su desktop l'app resta larga 440px, centrata (§7)
        app: '440px',
      },
      borderRadius: {
        panel: '28px',
      },
      boxShadow: {
        panel: '0 24px 60px -12px rgba(0,0,0,.75)',
        glow: '0 0 80px rgba(108,75,246,.5)',
      },
      keyframes: {
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'orbit-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '.25' },
          '50%': { opacity: '.9' },
        },
      },
      animation: {
        orbit: 'orbit linear infinite',
        'orbit-reverse': 'orbit-reverse linear infinite',
        twinkle: 'twinkle ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
