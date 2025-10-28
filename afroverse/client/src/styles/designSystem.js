/**
 * Afroverse Design System
 * Visual Language & Art Direction Guide
 * "Modern Viral UI with Ancient Cultural Soul"
 */

// ========================================
// 1. COLOR SYSTEM
// ========================================

export const colors = {
  // PRIMARY COLORS
  primary: {
    heritageOrange: '#FF6B35',
    royalGold: '#F9A825',
    tribalBrown: '#4E342E',
    midnightCharcoal: '#1A1A1A',
    warmCream: '#FFF7ED',
  },
  
  // SECONDARY COLORS
  secondary: {
    savannahGreen: '#3FA34D',
    pharaohBlue: '#3559E0',
    saharaSand: '#EAD8B1',
    masaiRed: '#C22026',
  },
  
  // UTILITY COLORS
  utility: {
    success: '#3FA34D',
    error: '#C22026',
    warning: '#F9A825',
    info: '#3559E0',
    white: '#FFFFFF',
    black: '#000000',
  },
  
  // DARK MODE
  dark: {
    background: '#0D0D0D',
    card: '#1A1A1A',
    stroke: '#2F2F2F',
    text: '#E5E5E5',
    textMuted: '#9CA3AF',
  },
  
  // GRADIENTS (as CSS strings)
  gradients: {
    sunsetFire: 'linear-gradient(45deg, #FF6B35 0%, #C22026 100%)',
    royalGlow: 'linear-gradient(45deg, #F9A825 0%, #FFECB3 100%)',
    tribeNight: 'linear-gradient(120deg, #1A1A1A 0%, #4E342E 100%)',
    heritageBlend: 'linear-gradient(135deg, #FF6B35 0%, #F9A825 100%)',
    savannahMist: 'linear-gradient(180deg, #3FA34D 0%, #2D7A3A 100%)',
    pharaohMystic: 'linear-gradient(45deg, #3559E0 0%, #1E40AF 100%)',
    desertSun: 'linear-gradient(45deg, #F9A825 0%, #FF6B35 100%)',
  },
};

// ========================================
// 2. TYPOGRAPHY SYSTEM
// ========================================

export const typography = {
  fonts: {
    headline: '"Bebas Neue", "Anton", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    accent: '"Kalam", cursive',
    mono: '"Fira Code", monospace',
  },
  
  sizes: {
    h1: { size: '3rem', lineHeight: '3.5rem', weight: 800 }, // 48px
    h2: { size: '2rem', lineHeight: '2.5rem', weight: 700 }, // 32px
    h3: { size: '1.5rem', lineHeight: '2rem', weight: 600 }, // 24px
    h4: { size: '1.25rem', lineHeight: '1.75rem', weight: 600 }, // 20px
    h5: { size: '1.125rem', lineHeight: '1.5rem', weight: 600 }, // 18px
    body: { size: '1rem', lineHeight: '1.5rem', weight: 400 }, // 16px
    bodySmall: { size: '0.875rem', lineHeight: '1.25rem', weight: 400 }, // 14px
    caption: { size: '0.8125rem', lineHeight: '1.125rem', weight: 400 }, // 13px
    tiny: { size: '0.75rem', lineHeight: '1rem', weight: 400 }, // 12px
  },
  
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

// ========================================
// 3. SPACING SYSTEM
// ========================================

export const spacing = {
  xs: '4px',
  s: '8px',
  m: '16px',
  l: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
  xxxxl: '96px',
};

// ========================================
// 4. BORDER RADIUS
// ========================================

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  xxxl: '24px',
  full: '9999px',
  image: '18px', // For AI outputs
};

// ========================================
// 5. SHADOWS
// ========================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 30px rgba(255, 107, 53, 0.3)', // Heritage orange glow
  goldGlow: '0 0 30px rgba(249, 168, 37, 0.4)', // Royal gold glow
};

// ========================================
// 6. ANIMATIONS & TRANSITIONS
// ========================================

export const animations = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  
  easings: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// ========================================
// 7. ICONOGRAPHY
// ========================================

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
  win: '🏆',
  vote: '👍',
  share: '📤',
  boost: '⚡',
  star: '⭐',
  crown: '👑',
  fire: '🔥',
  warrior: '⚔️',
  magic: '✨',
};

// ========================================
// 8. BREAKPOINTS
// ========================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

// ========================================
// 9. GRID SYSTEM
// ========================================

export const grid = {
  mobile: {
    columns: 4,
    margin: '16px',
    gutter: '16px',
  },
  tablet: {
    columns: 8,
    margin: '32px',
    gutter: '24px',
  },
  desktop: {
    columns: 12,
    margin: '80px',
    gutter: '32px',
  },
};

// ========================================
// 10. Z-INDEX LAYERS
// ========================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// ========================================
// 11. IMAGE TREATMENT
// ========================================

export const imageStyles = {
  aiOutput: {
    aspectRatio: '1:1',
    borderRadius: borderRadius.image,
    shadow: shadows.glow,
  },
  
  battle: {
    aspectRatio: '1:1',
    borderRadius: borderRadius.xl,
    shadow: shadows.xl,
  },
  
  watermark: {
    opacity: 0.28,
    position: 'bottom-right',
    size: '6%', // of image width
  },
};

// ========================================
// 12. CULTURAL PATTERNS
// ========================================

export const patterns = {
  ndebele: {
    url: '/patterns/ndebele.svg',
    opacity: 0.1,
  },
  maasai: {
    url: '/patterns/maasai.svg',
    opacity: 0.12,
  },
  kente: {
    url: '/patterns/kente.svg',
    opacity: 0.08,
  },
  moroccan: {
    url: '/patterns/moroccan.svg',
    opacity: 0.15,
  },
};

// ========================================
// 13. BRAND MOTIFS
// ========================================

export const motifs = {
  pride: {
    colors: [colors.primary.heritageOrange, colors.primary.royalGold],
    pattern: 'geometric',
  },
  energy: {
    colors: [colors.primary.heritageOrange, colors.secondary.masaiRed],
    pattern: 'dynamic',
  },
  regal: {
    colors: [colors.primary.royalGold, colors.primary.tribalBrown],
    pattern: 'symmetrical',
  },
  futuristic: {
    colors: [colors.secondary.pharaohBlue, colors.primary.heritageOrange],
    pattern: 'angular',
  },
};

// ========================================
// 14. BUTTON STYLES
// ========================================

export const buttonStyles = {
  primary: {
    background: colors.gradients.sunsetFire,
    color: colors.utility.white,
    shadow: shadows.md,
    hover: {
      shadow: shadows.lg,
      transform: 'scale(1.02)',
    },
  },
  
  secondary: {
    background: colors.gradients.royalGlow,
    color: colors.primary.tribalBrown,
    shadow: shadows.sm,
    hover: {
      shadow: shadows.md,
      transform: 'scale(1.02)',
    },
  },
  
  outline: {
    background: 'transparent',
    border: `2px solid ${colors.primary.heritageOrange}`,
    color: colors.primary.heritageOrange,
    hover: {
      background: colors.primary.heritageOrange,
      color: colors.utility.white,
    },
  },
};

// ========================================
// 15. CARD STYLES
// ========================================

export const cardStyles = {
  default: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.xl,
    shadow: shadows.md,
  },
  
  elevated: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.xxl,
    shadow: shadows.xl,
  },
  
  battle: {
    background: colors.dark.card,
    backdropFilter: 'blur(10px)',
    border: `2px solid ${colors.primary.heritageOrange}`,
    borderRadius: borderRadius.xl,
    shadow: shadows.glow,
  },
};

// ========================================
// EXPORT DEFAULT DESIGN SYSTEM
// ========================================

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  icons,
  breakpoints,
  grid,
  zIndex,
  imageStyles,
  patterns,
  motifs,
  buttonStyles,
  cardStyles,
};


