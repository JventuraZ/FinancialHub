import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Consolas', 'monospace'],
      },
      colors: {
        // ── "Vidro Sereno": accent teal-ciano sofisticado ──
        brand: {
          50: '#ecfeff',
          100: '#cff9fe',
          200: '#a5f0f8',
          300: '#6fe0ee',
          400: '#33c6dc', // accent principal (logo, links, foco)
          500: '#1bb0c9',
          600: '#159bb3', // botão primário
          700: '#137e92',
          800: '#155e6c',
          900: '#0b3a45', // backgrounds de badges/itens ativos
        },
        // ── superfícies dark frias por camadas ──
        surface: {
          DEFAULT: '#0d1320', // fundo da aplicação
          card: '#161e2e',    // cards e painéis
          elevated: '#1c2738', // tooltips, dropdowns, controles
          border: '#2a3650',  // bordas e divisores
          hover: '#222e42',   // hover states
        },
        // ── semânticos (harmonizam com o accent) ──
        pos: { DEFAULT: '#2bd9a0', soft: '#11352d' }, // alta
        neg: { DEFAULT: '#ff6b7a', soft: '#3a1a20' }, // baixa / erro
        flag: { DEFAULT: '#ffc857', soft: '#372c12' }, // destaque / seleção
      },
      boxShadow: {
        // microborda superior luminosa ("vidro") + sombra de profundidade
        card: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.35)',
        // glow do accent — usar só em estados ativos/foco (nunca em tudo)
        glow: '0 0 0 1px rgba(51,198,220,0.45), 0 0 18px rgba(51,198,220,0.22)',
        'glow-sm': '0 0 12px rgba(51,198,220,0.20)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        ticker: 'ticker 40s linear infinite',
        'glow-pulse': 'glow-pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
