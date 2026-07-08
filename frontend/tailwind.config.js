/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0D12',
          soft: '#14161D',
          line: '#22252F',
        },
        spotlight: {
          DEFAULT: '#F2B807',
          soft: '#FFD966',
        },
        signal: {
          DEFAULT: '#5EEAD4',
        },
        paper: {
          DEFAULT: '#F5F5F0',
          muted: '#9497A3',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        typewriter: {
          from: { width: '0' },
          to: { width: '100%' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
