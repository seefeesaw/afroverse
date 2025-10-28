/**
 * AFROVERSE DESIGN SYSTEM
 * Visual Language & Art Direction Guide
 * 
 * "Modern Viral UI with Ancient Cultural Soul"
 * Africa's visual richness - Apple x Afrofuturism
 */

// ============================================
// 1. BRAND IDENTITY
// ============================================
export const brandIdentity = {
  attributes: {
    proud: 'Celebrating African heritage',
    energetic: 'Viral, youthful',
    regal: 'Royalty, tradition',
    futuristic: 'Afro-future, Wakanda vibe'
  }
};

// ============================================
// 2. COLOR SYSTEM
// ============================================

// Primary Colors
export const colors = {
  primary: {
    heritageOrange: '#FF6B35',
    royalGold: '#F9A825',
    tribalBrown: '#4E342E',
    midnightCharcoal: '#1A1A1A',
    warmCream: '#FFF7ED'
  },
  
  // Secondary Colors
  secondary: {
    savannahGreen: '#3FA34D',
    pharaohBlue: '#3559E0',
    saharaSand: '#EAD8B1',
    masaiRed: '#C22026'
  },
  
  // Utility Colors
  utility: {
    success: '#3FA34D',
    error: '#C22026',
    warning: '#F9A825',
    info: '#3559E0'
  },
  
  // Dark Mode
  darkMode: {
    background: '#0D0D0D',
    cards: '#1A1A1A',
    stroke: '#2F2F2F'
  }
};

// Gradients (Core to Brand)
export const gradients = {
  sunsetFire: 'linear-gradient(45deg, #FF6B35 0%, #C22026 100%)',
  royalGlow: 'linear-gradient(45deg, #F9A825 0%, #FFECB3 100%)',
  tribeNight: 'linear-gradient(120deg, #1A1A1A 0%, #4E342E 100%)',
  
  // Additional Gradients
  savannahDawn: 'linear-gradient(135deg, #3FA34D 0%, #F9A825 100%)',
  pharaohPower: 'linear-gradient(45deg, #3559E0 0%, #F9A825 100%)',
  heritageHeat: 'linear-gradient(180deg, #FF6B35 0%, #F9A825 100%)',
  
  // Overlay Gradients
  darkOverlay: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
  lightOverlay: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)'
};

// ============================================
// 3. TYPOGRAPHY SYSTEM
// ============================================

export const typography = {
  fonts: {
    headline: '"Bebas Neue", "Anton", "Impact", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    accent: '"Kalam", cursive'
  },
  
  scale: {
    h1: {
      size: '3rem', // 48px
      sizeMobile: '2.75rem', // 44px
      weight: '800',
      lineHeight: '1.1'
    },
    h2: {
      size: '2rem', // 32px
      weight: '700',
      lineHeight: '1.2'
    },
    h3: {
      size: '1.5rem', // 24px
      weight: '600',
      lineHeight: '1.3'
    },
    body: {
      size: '1rem', // 16px
      weight: '400',
      lineHeight: '1.5'
    },
    caption: {
      size: '0.875rem', // 14px
      weight: '400',
      lineHeight: '1.4'
    },
    small: {
      size: '0.8125rem', // 13px
      weight: '400',
      lineHeight: '1.3'
    }
  }
};

// ============================================
// 4. SPACING & LAYOUT SYSTEM
// ============================================

export const spacing = {
  xs: '0.25rem',  // 4px
  s: '0.5rem',    // 8px
  m: '1rem',      // 16px
  l: '1.5rem',    // 24px
  xl: '2rem',     // 32px
  xxl: '3rem',    // 48px
  xxxl: '4rem'    // 64px
};

export const grid = {
  desktop: {
    columns: 12,
    margin: '5rem', // 80px
    gutter: '1.5rem' // 24px
  },
  mobile: {
    columns: 4,
    margin: '1rem', // 16px
    gutter: '1rem' // 16px
  }
};

// ============================================
// 5. ICONOGRAPHY
// ============================================

export const icons = {
  tribe: '🦁',
  battle: '⚔️',
  streak: '🔥',
  leader: '👑',
  profile: '🛡️',
  pin: '📌',
  chat: '💬',
  global: '🌍',
  transform: '📸',
  warrior: '🗡️',
  queen: '👸',
  king: '🤴',
  trophy: '🏆',
  star: '⭐',
  lightning: '⚡',
  rocket: '🚀'
};

// ============================================
// 6. IMAGE TREATMENT
// ============================================

export const imageStyles = {
  transformation: {
    aspectRatio: '1:1',
    borderRadius: '1.25rem', // 20px
    shadow: '0 8px 24px rgba(249, 168, 37, 0.3)',
    watermarkOpacity: 0.3
  },
  
  battle: {
    aspectRatio: '1:1',
    borderRadius: '1rem', // 16px
    shadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    challenger: {
      filter: 'sepia(0.1) saturate(1.1) hue-rotate(-5deg)' // warm tint
    },
    defender: {
      filter: 'sepia(0.1) saturate(1.1) hue-rotate(5deg)' // cool tint
    }
  },
  
  avatar: {
    borderRadius: '50%',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
  }
};

// ============================================
// 7. HERITAGE PATTERNS & MOTIFS
// ============================================

export const heritagePatterns = {
  ndebele: {
    pattern: 'zigzag',
    colors: ['#FF6B35', '#F9A825', '#3FA34D'],
    usage: 'borders, dividers'
  },
  maasai: {
    pattern: 'beaded-stripes',
    colors: ['#C22026', '#F9A825', '#3559E0'],
    usage: 'backgrounds, overlays'
  },
  moroccan: {
    pattern: 'geometric-tiles',
    colors: ['#3559E0', '#F9A825', '#4E342E'],
    usage: 'cards, containers'
  },
  kente: {
    pattern: 'woven-symmetry',
    colors: ['#F9A825', '#3FA34D', '#FF6B35'],
    usage: 'highlights, accents'
  }
};

// ============================================
// 8. BORDER RADIUS SYSTEM
// ============================================

export const borderRadius = {
  xs: '0.25rem',   // 4px
  s: '0.5rem',     // 8px
  m: '0.75rem',    // 12px
  l: '1rem',       // 16px
  xl: '1.25rem',   // 20px
  xxl: '1.5rem',   // 24px
  full: '9999px'
};

// ============================================
// 9. SHADOWS & ELEVATION
// ============================================

export const shadows = {
  low: '0 2px 8px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
  high: '0 8px 24px rgba(0, 0, 0, 0.2)',
  glow: {
    gold: '0 4px 20px rgba(249, 168, 37, 0.4)',
    orange: '0 4px 20px rgba(255, 107, 53, 0.4)',
    red: '0 4px 20px rgba(194, 32, 38, 0.4)',
    green: '0 4px 20px rgba(63, 163, 77, 0.4)',
    blue: '0 4px 20px rgba(53, 89, 224, 0.4)'
  }
};

// ============================================
// 10. ANIMATION TIMINGS
// ============================================

export const animations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slowest: '800ms',
  
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

// ============================================
// 11. COMPONENT-SPECIFIC RULES
// ============================================

export const components = {
  button: {
    primary: {
      background: gradients.sunsetFire,
      color: '#FFFFFF',
      padding: '0.75rem 1.5rem',
      borderRadius: borderRadius.l,
      shadow: shadows.medium,
      hoverTransform: 'scale(1.05)',
      activeTransform: 'scale(0.98)'
    },
    secondary: {
      background: 'transparent',
      color: colors.primary.heritageOrange,
      border: `2px solid ${colors.primary.heritageOrange}`,
      padding: '0.75rem 1.5rem',
      borderRadius: borderRadius.l
    }
  },
  
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.xl,
    padding: spacing.l,
    shadow: shadows.medium
  },
  
  fab: {
    size: '4rem',
    background: gradients.sunsetFire,
    shadow: shadows.glow.orange,
    borderRadius: borderRadius.full,
    position: 'fixed',
    bottom: '5rem',
    right: '1.5rem'
  },
  
  bottomNav: {
    height: '5rem',
    background: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  }
};

// ============================================
// 12. BREAKPOINTS
// ============================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px'
};

// ============================================
// EXPORT ALL
// ============================================

export default {
  brandIdentity,
  colors,
  gradients,
  typography,
  spacing,
  grid,
  icons,
  imageStyles,
  heritagePatterns,
  borderRadius,
  shadows,
  animations,
  components,
  breakpoints
};


