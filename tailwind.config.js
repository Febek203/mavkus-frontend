/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bgDark: "#0B0614",
        bgCard: "#120B23",
        borderSoft: "#2E1A47",

        primary: "#7C3AED",
        primaryLight: "#A78BFA",
        primaryDark: "#4C1D95",

        accentCyan: "#22D3EE",
        accentGold: "#FACC15",

        textMain: "#EDE9FE",
        textMuted: "#A1A1AA",
      },
      boxShadow: {
        glow: "0 0 25px rgba(124,58,237,0.5)",
        glowSm: "0 0 15px rgba(124,58,237,0.35)",
      },
      animation: {
        'bounce-dot': 'bounceDot 1.2s infinite',
        'glow-bg': 'glowBG 20s infinite linear',
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        glowBG: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundImage: {
        'animated-glow': 'linear-gradient(270deg, #7C3AED, #22D3EE, #FACC15)',
      },
      backgroundSize: {
        '200': '200% 200%',
      },
    },
  },
  plugins: [],
};
