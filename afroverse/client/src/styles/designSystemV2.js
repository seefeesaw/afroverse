/**
 * AfroMoji Visual Identity System - PACKET 6
 * "Vibranium Royalty" - Black Panther x TikTok x Duolingo
 * 
 * This is the official design bible for AfroMoji MVP
 * Every screen, component, and animation follows this system
 */

// ========================================
// 1. COLOR SYSTEM - "Vibranium Royalty"
// ========================================

export const colors = {
  // PRIMARY - G-Purple (Vibranium Core)
  primary: {
    purple: '#6F2CFF',
    purpleGlow: 'rgba(111, 44, 255, 0.35)',
    purpleLight: '#BA36FF',
  },
  
  // SECONDARY & ACCENTS
  secondary: {
    gold: '#F5B63F',
    red: '#FF4D6D',
    tribeBlue: '#2AB9FF',
    successGreen: '#3CCF4E',
  },
  
  // BACKGROUNDS
  background: {
    dark: '#0E0B16',
    surface: '#1B1528',
    surfaceHover: '#241D31',
  },
  
  // TEXT
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
  },
  
  // UI ELEMENTS
  ui: {
    divider: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.15)',
    overlay: 'rgba(14, 11, 22, 0.9)',
  },
  
  // GRADIENTS (Core to Brand)
  gradients: {
    // Primary UI Gradient - Main brand gradient
    primary: 'linear-gradient(135deg, #6F2CFF 0%, #BA36FF 45%, #F5B63F 100%)',
    
    // Purple variations
    purpleDark: 'linear-gradient(135deg, #6F2CFF 0%, #4A1FB8 100%)',
    purpleGlow: 'linear-gradient(135deg, #BA36FF 0%, #6F2CFF 100%)',
    
    // Accent gradients
    goldShine: 'linear-gradient(135deg, #F5B63F 0%, #FFD700 100%)',
    redAlert: 'linear-gradient(135deg, #FF4D6D 0%, #C91F3D 100%)',
    blueInfo: 'linear-gradient(135deg, #2AB9FF 0%, #0E7BC4 100%)',
    greenSuccess: 'linear-gradient(135deg, #3CCF4E 0%, #2A9D3A 100%)',
    
    // Background gradients
    darkBackground: 'linear-gradient(180deg, #0E0B16 0%, #1B1528 100%)',
    surfaceCard: 'linear-gradient(135deg, #1B1528 0%, #241D31 100%)',
  },
};

// ========================================
// 2. TYPOGRAPHY SYSTEM
// ========================================

export const typography = {
  fonts: {
    headline: '"Montserrat", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  
  sizes: {
    // Headlines - Montserrat Black/Bold
    h1: { 
      size: '2.5rem',      // 40px
      lineHeight: '1.2', 
      weight: 900,
      letterSpacing: '-0.02em'
    },
    h1Mobile: { 
      size: '2rem',        // 32px
      lineHeight: '1.2', 
      weight: 900,
      letterSpacing: '-0.02em'
    },
    h2: { 
      size: '1.75rem',     // 28px
      lineHeight: '1.3', 
      weight: 700,
      letterSpacing: '-0.01em'
    },
    h2Mobile: { 
      size: '1.5rem',      // 24px
      lineHeight: '1.3', 
      weight: 700 
    },
    h3: { 
      size: '1.25rem',     // 20px
      lineHeight: '1.4', 
      weight: 600 
    },
    h3Mobile: { 
      size: '1.125rem',    // 18px
      lineHeight: '1.4', 
      weight: 600 
    },
    
    // Body - Inter Regular/Medium
    body: { 
      size: '1rem',        // 16px
      lineHeight: '1.5', 
      weight: 400 
    },
    bodySmall: { 
      size: '0.875rem',    // 14px
      lineHeight: '1.5', 
      weight: 400 
    },
    caption: { 
      size: '0.8125rem',   // 13px
      lineHeight: '1.4', 
      weight: 500 
    },
    captionSmall: { 
      size: '0.75rem',     // 12px
      lineHeight: '1.4', 
      weight: 500 
    },
  },
  
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
};

// ========================================
// 3. SPACING SYSTEM (8pt Grid)
// ========================================

export const spacing = {
  xs: '8px',
  s: '16px',
  m: '24px',
  l: '32px',
  xl: '40px',
  xxl: '48px',
  xxxl: '64px',
};

// ========================================
// 4. BORDER RADIUS
// ========================================

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',    // Standard for all components
  xl: '20px',
  xxl: '24px',
  full: '9999px',
};

// ========================================
// 5. SHADOWS & GLOWS
// ========================================

export const shadows = {
  // Standard shadows
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.25)',
  
  // Glow effects - Vibranium style
  glowPurple: '0 0 20px rgba(111, 44, 255, 0.35)',
  glowPurpleStrong: '0 0 30px rgba(111, 44, 255, 0.5)',
  glowGold: '0 0 20px rgba(245, 182, 63, 0.4)',
  glowRed: '0 0 20px rgba(255, 77, 109, 0.4)',
  glowBlue: '0 0 20px rgba(42, 185, 255, 0.4)',
  glowGreen: '0 0 20px rgba(60, 207, 78, 0.4)',
  
  // Neon edges
  neonPurple: '0 0 10px rgba(111, 44, 255, 0.6), inset 0 0 10px rgba(111, 44, 255, 0.2)',
  neonGold: '0 0 10px rgba(245, 182, 63, 0.6), inset 0 0 10px rgba(245, 182, 63, 0.2)',
};

// ========================================
// 6. ANIMATIONS & MOTION
// ========================================

export const animations = {
  durations: {
    fast: '100ms',
    normal: '300ms',
    slow: '900ms',
    voteLoop: '1500ms',
    scanEffect: '1200ms',
  },
  
  easings: {
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    linear: 'linear',
  },
  
  // Predefined animations
  keyframes: {
    fadeIn: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    slideIn: {
      from: { transform: 'translateX(-100%)' },
      to: { transform: 'translateX(0)' },
    },
    votePulse: {
      '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(111, 44, 255, 0.7)' },
      '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(111, 44, 255, 0)' },
    },
    confettiBurst: {
      '0%': { transform: 'scale(0) rotate(0deg)', opacity: 1 },
      '100%': { transform: 'scale(1) rotate(360deg)', opacity: 0 },
    },
    scanEffect: {
      '0%': { transform: 'translateY(-100%)' },
      '100%': { transform: 'translateY(100%)' },
    },
  },
};

// ========================================
// 7. COMPONENT STYLES
// ========================================

export const components = {
  // Primary Button - G-Purple with gold glow
  buttonPrimary: {
    background: colors.gradients.primary,
    color: colors.text.primary,
    borderRadius: borderRadius.lg,
    padding: '12px 24px',
    boxShadow: shadows.glowPurple,
    hoverScale: 1.03,
    transition: 'all 300ms ease-out',
  },
  
  // Secondary Button - Outlined purple
  buttonSecondary: {
    background: 'transparent',
    color: colors.primary.purple,
    border: `2px solid ${colors.primary.purple}`,
    borderRadius: borderRadius.lg,
    padding: '12px 24px',
    hoverGlow: shadows.glowPurple,
  },
  
  // Battle Card
  battleCard: {
    background: colors.background.surface,
    borderRadius: borderRadius.lg,
    border: `2px solid ${colors.primary.purple}`,
    boxShadow: shadows.neonPurple,
  },
  
  // Vote Button
  voteButton: {
    background: colors.gradients.primary,
    borderRadius: borderRadius.full,
    animation: 'votePulse 1500ms infinite',
    hoverScale: 1.1,
  },
  
  // Upload Box
  uploadBox: {
    border: `2px dashed ${colors.primary.purple}`,
    borderRadius: borderRadius.lg,
    background: 'transparent',
    hoverGlow: shadows.glowPurple,
  },
  
  // Chat Bubble Bot
  chatBubbleBot: {
    background: colors.gradients.purpleGlow,
    borderRadius: `${borderRadius.lg} ${borderRadius.lg} ${borderRadius.lg} 0`,
    padding: spacing.s,
  },
  
  // Chat Bubble User
  chatBubbleUser: {
    background: colors.background.surface,
    borderRadius: `${borderRadius.lg} ${borderRadius.lg} 0 ${borderRadius.lg}`,
    padding: spacing.s,
    boxShadow: shadows.sm,
  },
  
  // Card/Surface
  card: {
    background: colors.gradients.surfaceCard,
    borderRadius: borderRadius.lg,
    padding: spacing.s,
    boxShadow: shadows.md,
  },
};

// ========================================
// 8. LAYOUT RULES
// ========================================

export const layout = {
  minPadding: '24px',
  cardPadding: '16px-24px',
  componentSpacing: '16px-32px',
  maxContentWidth: '900px',
  
  // Responsive breakpoints
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1024px',
  },
};

// ========================================
// 9. ICONOGRAPHY
// ========================================

export const icons = {
  style: 'rounded-edges-hybrid',
  strokeWidth: '2px',
  glowColor: colors.primary.purpleGlow,
  
  // Core icons (emoji-based)
  battle: '⚔️',
  vote: '👍',
  challenge: '🔥',
  tribe: '🦁',
  crown: '👑',
  star: '⭐',
  camera: '📸',
  share: '📤',
  profile: '👤',
  settings: '⚙️',
};

// ========================================
// 10. BRAND VOICE
// ========================================

export const brandVoice = {
  motivational: 'Rise, Warrior. Your tribe awaits.',
  competitive: 'They\'re catching up — defend your tribe!',
  playful: 'Not bad… but can you beat a Zulu Warrior?',
  culturalPride: 'Africa is Royal. Let the world see.',
  
  tone: 'Hype + Heritage',
  avoid: ['preaching', 'politics', 'religion', 'negativity'],
};

// ========================================
// 11. AFRICAN PATTERNS (10% opacity overlays)
// ========================================

export const patterns = {
  zulu: {
    type: 'triangles',
    opacity: 0.1,
    usage: 'battle screens',
  },
  ndebele: {
    type: 'lines',
    opacity: 0.1,
    usage: 'tribe banners',
  },
  adinkra: {
    type: 'symbols',
    opacity: 0.1,
    usage: 'intro modals',
  },
};

// ========================================
// 12. SOCIAL SHARE TEMPLATES
// ========================================

export const shareTemplates = {
  aspectRatios: {
    tiktok: '9:16',
    whatsapp: '1:1',
    youtube: '16:9',
  },
  
  elements: {
    frame: 'African glow border',
    badge: 'Tribe badge',
    cta: 'Vote for me / Join the battle',
    logo: 'AfroMoji logo in corner',
    qr: 'QR + link',
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
  components,
  layout,
  icons,
  brandVoice,
  patterns,
  shareTemplates,
};


