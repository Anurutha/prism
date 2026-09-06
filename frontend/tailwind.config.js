/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A0D14',
          900: '#11141F',
          800: '#1A1E2B',
          700: '#252A3B',
        },
        paper: '#F4F1EA',
        spectrum: {
          violet: '#7C6FFF',
          magenta: '#F2569B',
          amber: '#F4A93E',
          cyan: '#3FD1D6',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'spectrum-fan': 'linear-gradient(115deg, #7C6FFF 0%, #F2569B 45%, #F4A93E 75%, #3FD1D6 100%)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateY(0px) rotate(var(--tilt, 0deg))' },
          '50%': { transform: 'translateY(-10px) rotate(var(--tilt, 0deg))' },
        },
      },
      animation: {
        drift: 'drift 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
