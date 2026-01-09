module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'move-stars': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'star-sparkle': {
          '0%, 100%': { 
            opacity: '0.7',
            transform: 'scale(1)',
            boxShadow: '0 0 4px 1px rgba(255,255,255,0.5)'
          },
          '50%': { 
            opacity: '0.3',
            transform: 'scale(0.8)',
            boxShadow: '0 0 8px 3px rgba(255,255,255,0.8)'
          }
        }
      },
      animation: {
        'move-stars': 'move-stars 20s linear infinite',
        'star-sparkle': 'star-sparkle 3s infinite'
      }
    }
  },
  plugins: [],
}