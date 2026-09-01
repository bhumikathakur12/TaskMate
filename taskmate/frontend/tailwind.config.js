/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        board: '#131B2E',        // deep dispatch-navy — main app background
        'board-raised': '#1D2942', // panel / section background, one step up from board
        'board-line': '#2A3A5C',   // hairline borders on navy
        paper: '#F3EEDF',        // warm ticket-paper, used for cards & light surfaces
        'paper-dim': '#E4DDC7',
        ink: '#1A1A1A',           // text on paper
        signal: '#FF6A1A',        // hi-vis accent — primary CTA, "open" status
        'signal-dark': '#DB5610',
        teal: '#2FB6A6',          // secondary accent — "tasker / assigned" status
        stamp: '#C43D3D',         // urgent / cancelled status
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        ticket: '0 6px 0 rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
