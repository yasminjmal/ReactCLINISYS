/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'animate-gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // This is the spin animation from before
        spin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        // --- ADD THIS NEW KEYFRAME ---
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 15px 0px rgba(0, 191, 255, 0.5)', // Softer Blue Glow
          },
          '50%': {
            boxShadow: '0 0 30px 5px rgba(138, 43, 226, 0.6)', // Intense Purple Glow
          },
        }
      },
      animation: {
        // This is the spin animation from before
        'spin-slow': 'spin 3s linear infinite',
        // --- ADD THIS NEW ANIMATION ---
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'gradient': 'animate-gradient 3s linear infinite',

      }
    },
  },
  plugins: [],
}