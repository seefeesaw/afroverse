/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // AFROMOJI VIBRANIUM ROYALTY COLOR SYSTEM
      colors: {
        // Primary - G-Purple (Vibranium Core)
        primary: {
          purple: '#6F2CFF',
          'purple-glow': 'rgba(111, 44, 255, 0.35)',
          'purple-light': '#BA36FF',
        },
        // Secondary & Accents
        gold: '#F5B63F',
        red: '#FF4D6D',
        'tribe-blue': '#2AB9FF',
        'success-green': '#3CCF4E',
        // Backgrounds
        'bg-dark': '#0E0B16',
        'surface': '#1B1528',
        'surface-hover': '#241D31',
        // Text
        'text-primary': '#FFFFFF',
        'text-secondary': 'rgba(255, 255, 255, 0.7)',
        'text-tertiary': 'rgba(255, 255, 255, 0.5)',
        // UI Elements
        'divider': 'rgba(255, 255, 255, 0.1)',
        'border-ui': 'rgba(255, 255, 255, 0.15)',
        'overlay': 'rgba(14, 11, 22, 0.9)',
        
        // Legacy support (for gradual migration)
        heritage: {
          orange: '#FF6B35',
          gold: '#F9A825',
          brown: '#4E342E',
          charcoal: '#1A1A1A',
          cream: '#FFF7ED'
        },
        dark: {
          bg: '#0E0B16',
          card: '#1B1528',
          stroke: '#241D31'
        }
      },
      
      // VIBRANIUM ROYALTY GRADIENTS
      backgroundImage: {
        // Primary Brand Gradient
        'vibranium': 'linear-gradient(135deg, #6F2CFF 0%, #BA36FF 45%, #F5B63F 100%)',
        'purple-dark': 'linear-gradient(135deg, #6F2CFF 0%, #4A1FB8 100%)',
        'purple-glow': 'linear-gradient(135deg, #BA36FF 0%, #6F2CFF 100%)',
        
        // Accent Gradients
        'gold-shine': 'linear-gradient(135deg, #F5B63F 0%, #FFD700 100%)',
        'red-alert': 'linear-gradient(135deg, #FF4D6D 0%, #C91F3D 100%)',
        'blue-info': 'linear-gradient(135deg, #2AB9FF 0%, #0E7BC4 100%)',
        'green-success': 'linear-gradient(135deg, #3CCF4E 0%, #2A9D3A 100%)',
        
        // Background Gradients
        'dark-bg': 'linear-gradient(180deg, #0E0B16 0%, #1B1528 100%)',
        'surface-card': 'linear-gradient(135deg, #1B1528 0%, #241D31 100%)',
        
        // Legacy support
        'sunset-fire': 'linear-gradient(45deg, #FF6B35 0%, #C22026 100%)',
        'royal-glow': 'linear-gradient(45deg, #F9A825 0%, #FFECB3 100%)',
        'tribe-night': 'linear-gradient(120deg, #1A1A1A 0%, #4E342E 100%)',
      },
      
      // TYPOGRAPHY - Montserrat + Inter
      fontFamily: {
        headline: ['"Montserrat"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      
      fontSize: {
        'h1': ['3rem', { lineHeight: '1.1', fontWeight: '800' }],
        'h1-mobile': ['2.75rem', { lineHeight: '1.1', fontWeight: '800' }],
        'h2': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      
      // SPACING SYSTEM
      spacing: {
        'xs': '0.25rem',
        's': '0.5rem',
        'm': '1rem',
        'l': '1.5rem',
        'xl': '2rem',
        'xxl': '3rem',
        'xxxl': '4rem'
      },
      
      // BORDER RADIUS
      borderRadius: {
        'xs': '0.25rem',
        's': '0.5rem',
        'm': '0.75rem',
        'l': '1rem',
        'xl': '1.25rem',
        'xxl': '1.5rem',
      },
      
      // VIBRANIUM GLOW EFFECTS
      boxShadow: {
        'glow-purple': '0 0 20px rgba(111, 44, 255, 0.35)',
        'glow-purple-strong': '0 0 30px rgba(111, 44, 255, 0.5)',
        'glow-gold': '0 0 20px rgba(245, 182, 63, 0.4)',
        'glow-red': '0 0 20px rgba(255, 77, 109, 0.4)',
        'glow-blue': '0 0 20px rgba(42, 185, 255, 0.4)',
        'glow-green': '0 0 20px rgba(60, 207, 78, 0.4)',
        'neon-purple': '0 0 10px rgba(111, 44, 255, 0.6), inset 0 0 10px rgba(111, 44, 255, 0.2)',
        'neon-gold': '0 0 10px rgba(245, 182, 63, 0.6), inset 0 0 10px rgba(245, 182, 63, 0.2)',
      },
      
      // ANIMATIONS
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'bounce-slow': 'bounceSlow 2s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'vote-pulse': 'votePulse 0.8s ease-out',
        'confetti-fall': 'confettiFall linear forwards',
        'float': 'float ease-in-out infinite',
      },
      
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.2' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        votePulse: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
      },
      
      // BACKDROP BLUR
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
