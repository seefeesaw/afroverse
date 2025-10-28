# 🎨 AfroMoji Vibranium Royalty - Developer Guide

**Visual Identity System v2.0 - "Black Panther x TikTok x Duolingo"**

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Design System Access](#design-system-access)
3. [Component Usage](#component-usage)
4. [Color Reference](#color-reference)
5. [Typography](#typography)
6. [Animations](#animations)
7. [Best Practices](#best-practices)
8. [Migration from Heritage Orange](#migration)

---

## 🚀 Quick Start

### View the Component Library
Navigate to `/design-system` in your browser to see all components in action:

```bash
npm run dev
# Open http://localhost:5173/design-system
```

### Import Design System
```javascript
// JavaScript/React
import designSystem from '@/styles/designSystemV2';

const { colors, typography, shadows, animations } = designSystem;
```

### Use Tailwind Classes
```jsx
<button className="bg-vibranium text-white shadow-glow-purple rounded-lg px-6 py-3">
  Click Me
</button>
```

---

## 🎨 Design System Access

### Method 1: Direct Import (JavaScript)

```javascript
import designSystem from '@/styles/designSystemV2';

// Access colors
const primaryPurple = designSystem.colors.primary.purple; // #6F2CFF

// Access gradients
const vibraniumGradient = designSystem.colors.gradients.primary;

// Access typography
const headlineFont = designSystem.typography.fonts.headline;

// Access shadows
const purpleGlow = designSystem.shadows.glowPurple;
```

### Method 2: Tailwind Classes (Recommended)

```jsx
// Colors
<div className="bg-primary-purple">Purple Background</div>
<div className="text-gold">Gold Text</div>

// Gradients
<div className="bg-vibranium">Vibranium Gradient</div>
<div className="bg-gold-shine">Gold Gradient</div>

// Typography
<h1 className="font-headline">Montserrat Headline</h1>
<p className="font-body">Inter Body Text</p>

// Shadows & Glows
<div className="shadow-glow-purple">Purple Glow</div>
<div className="shadow-neon-purple">Neon Purple</div>
```

---

## 🧩 Component Usage

### 1. Buttons

#### Primary Button (Vibranium Gradient)
```jsx
<button className="btn-primary">
  Create Battle
</button>
```

#### Secondary Button (Outlined)
```jsx
<button className="btn-secondary">
  Learn More
</button>
```

#### Vote Button with Animation
```jsx
import VibraniumVoteButton from '@/components/common/VibraniumVoteButton';

<VibraniumVoteButton 
  onVote={handleVote}
  label="Vote Now"
/>
```

### 2. Cards

#### Battle Card
```jsx
<div className="card-battle">
  <h3 className="text-white mb-2">Battle Title</h3>
  <p className="text-text-secondary">Battle content</p>
</div>
```

#### Surface Card
```jsx
<div className="card-glass">
  <h3 className="text-white mb-2">Card Title</h3>
  <p className="text-text-secondary">Card content</p>
</div>
```

#### Tribe Card
```jsx
<div className="card-tribe">
  <h3 className="text-white mb-2">🦁 Zulu Warriors</h3>
  <p className="text-text-secondary">Tribe stats</p>
</div>
```

#### Full Battle Card Component
```jsx
import VibraniumBattleCard from '@/components/common/VibraniumBattleCard';

<VibraniumBattleCard 
  battle={{
    challenger: {
      name: 'User A',
      imageUrl: '/path/to/image.jpg',
      tribe: '🦁 Zulu',
      votes: 120
    },
    defender: {
      name: 'User B',
      imageUrl: '/path/to/image.jpg',
      tribe: '🐘 Ndebele',
      votes: 98
    },
    timeLeft: '2h 30m',
    totalVotes: 218
  }}
  onVote={handleVote}
/>
```

### 3. Inputs

#### Text Input
```jsx
<input 
  type="text" 
  className="input-primary w-full" 
  placeholder="Enter your name"
/>
```

#### Search Input
```jsx
<div className="relative">
  <input 
    type="search" 
    className="input-search w-full" 
    placeholder="Search..."
  />
  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
</div>
```

#### Upload Box
```jsx
import VibraniumUploadBox from '@/components/common/VibraniumUploadBox';

<VibraniumUploadBox 
  onUpload={handleFileUpload}
  isProcessing={isUploading}
/>
```

### 4. Chat Bubbles

```jsx
import VibraniumChatBubble from '@/components/common/VibraniumChatBubble';

{/* Bot Message */}
<VibraniumChatBubble 
  type="bot"
  avatar="🤖"
  message="Upload your photo to begin your transformation 👑🔥"
  buttons={[
    { label: 'Pharaoh 👑', onClick: () => selectStyle('pharaoh') },
    { label: 'Warrior ⚔️', onClick: () => selectStyle('warrior') }
  ]}
/>

{/* User Message */}
<VibraniumChatBubble 
  type="user"
  avatar="👤"
  message="I'm ready!"
/>
```

### 5. Progress Ring (Timer)

```jsx
import VibraniumProgressRing from '@/components/common/VibraniumProgressRing';

<VibraniumProgressRing 
  duration={60}
  onComplete={handleTimeUp}
  size={120}
  strokeWidth={8}
/>
```

### 6. Badges

```jsx
{/* Gold Badge (Winners) */}
<span className="badge-gold">👑 Winner</span>

{/* Purple Badge (Actions) */}
<span className="badge-purple">New</span>

{/* Tribe Badge */}
<span className="badge-tribe">🦁 Zulu</span>

{/* Success Badge */}
<span className="badge-success">✅ Complete</span>
```

### 7. Images

```jsx
{/* AI Output Image */}
<img src={image} className="img-ai-output" alt="Transformation" />

{/* Battle Image */}
<img src={image} className="img-battle" alt="Battle" />

{/* Avatar */}
<img src={avatar} className="img-avatar" alt="User" />
```

---

## 🎨 Color Reference

### Primary Colors
```javascript
// Vibranium Purple
className="bg-primary-purple"        // #6F2CFF
className="text-primary-purple"      // #6F2CFF
className="border-primary-purple"    // #6F2CFF

// Secondary Gold
className="bg-gold"                  // #F5B63F
className="text-gold"                // #F5B63F
```

### Accent Colors
```javascript
className="bg-red"                   // #FF4D6D (Alerts)
className="bg-tribe-blue"            // #2AB9FF (Tribes)
className="bg-success-green"         // #3CCF4E (Success)
```

### Background Colors
```javascript
className="bg-dark"                  // #0E0B16 (Main background)
className="bg-surface"               // #1B1528 (Cards)
className="bg-surface-hover"         // #241D31 (Hover states)
```

### Text Colors
```javascript
className="text-text-primary"        // #FFFFFF (Main text)
className="text-text-secondary"      // rgba(255,255,255,0.7)
className="text-text-tertiary"       // rgba(255,255,255,0.5)
```

### Gradients
```javascript
className="bg-vibranium"             // Purple → Gold
className="bg-purple-glow"           // Purple variations
className="bg-gold-shine"            // Gold gradient
className="bg-red-alert"             // Alert gradient
className="bg-blue-info"             // Info gradient
className="bg-green-success"         // Success gradient
```

---

## 🔤 Typography

### Fonts
```jsx
// Headlines - Montserrat Black/Bold
<h1 className="font-headline text-5xl font-black">
  Headline Text
</h1>

// Body - Inter Regular
<p className="font-body text-base">
  Body text content
</p>
```

### Text Sizes
```jsx
<h1 className="text-4xl md:text-5xl">H1 - Mobile 32px, Desktop 40px</h1>
<h2 className="text-2xl md:text-3xl">H2 - Mobile 24px, Desktop 28px</h2>
<h3 className="text-xl md:text-2xl">H3 - Mobile 18px, Desktop 20px</h3>
<p className="text-base">Body - 16px</p>
<p className="text-sm">Small - 14px</p>
<p className="text-xs">Caption - 13px</p>
```

### Text Gradients
```jsx
<h1 className="text-gradient-vibranium">
  Vibranium Gradient Text
</h1>

<h2 className="text-gradient-purple">
  Purple Gradient Text
</h2>

<span className="text-gradient-gold">
  Gold Gradient Text
</span>
```

---

## ✨ Animations

### Available Animations
```jsx
// Vote Pulse (1500ms infinite)
<button className="animate-vote-pulse">Vote</button>

// Confetti Burst (900ms once)
<div className="animate-confetti">🎉</div>

// Scan Effect (1200ms infinite)
<div className="animate-scan"></div>

// Float (3s infinite)
<div className="animate-float">🦁</div>

// Purple Glow Pulse (2s infinite)
<div className="animate-glow-purple"></div>

// Gold Shimmer (2s infinite)
<div className="animate-shimmer-gold">Premium</div>
```

### Custom Animation Duration
```jsx
<div 
  className="animate-vote-pulse"
  style={{ animationDuration: '2s' }}
>
  Custom Duration
</div>
```

---

## 🛡️ Best Practices

### 1. **Use Semantic Classes**
```jsx
// ✅ Good - Semantic and reusable
<button className="btn-primary">Submit</button>

// ❌ Avoid - Inline styling
<button style={{ background: 'linear-gradient(...)' }}>Submit</button>
```

### 2. **Consistent Spacing**
```jsx
// ✅ Good - Use Tailwind spacing scale
<div className="p-6 space-y-4">
  <h2 className="mb-2">Title</h2>
  <p>Content</p>
</div>

// ❌ Avoid - Random pixel values
<div style={{ padding: '23px', marginBottom: '17px' }}>
```

### 3. **Responsive Design**
```jsx
// ✅ Good - Mobile-first responsive
<h1 className="text-2xl md:text-4xl lg:text-5xl">
  Responsive Headline
</h1>

// ❌ Avoid - Fixed sizes
<h1 className="text-5xl">Desktop Only</h1>
```

### 4. **Accessible Colors**
```jsx
// ✅ Good - High contrast
<p className="text-text-primary">Main content</p>
<p className="text-text-secondary">Secondary content</p>

// ❌ Avoid - Low contrast
<p className="text-gray-700">Hard to read</p>
```

### 5. **Animation Performance**
```jsx
// ✅ Good - CSS animations (GPU accelerated)
<div className="animate-vote-pulse">

// ✅ Good - Transform & Opacity
<div className="hover:scale-105 transition-transform">

// ❌ Avoid - Animating layout properties
<div style={{ animation: 'width 1s' }}>
```

### 6. **Component Reusability**
```jsx
// ✅ Good - Import reusable components
import VibraniumVoteButton from '@/components/common/VibraniumVoteButton';
<VibraniumVoteButton onVote={handleVote} />

// ❌ Avoid - Duplicating button styles
<button className="bg-vibranium text-white shadow-glow-purple...">
```

---

## 🔄 Migration from Heritage Orange

### Color Mapping
```javascript
// OLD → NEW
'bg-heritage-orange'      → 'bg-primary-purple'
'text-heritage-orange'    → 'text-primary-purple'
'border-heritage-orange'  → 'border-primary-purple'
'bg-heritage-gold'        → 'bg-gold'
'bg-dark-bg'              → 'bg-dark'
'bg-dark-card'            → 'bg-surface'
```

### Gradient Mapping
```javascript
// OLD → NEW
'bg-sunset-fire'          → 'bg-vibranium'
'bg-royal-glow'           → 'bg-gold-shine'
'bg-tribe-night'          → 'bg-dark-bg'
```

### Shadow Mapping
```javascript
// OLD → NEW
'shadow-glow-orange'      → 'shadow-glow-purple'
'shadow-glow-gold'        → 'shadow-glow-gold' (unchanged)
```

### Font Mapping
```javascript
// OLD → NEW
font-headline: 'Bebas Neue'  → 'Montserrat'
font-accent: 'Kalam'         → (removed)
font-body: 'Inter'           → 'Inter' (unchanged)
```

### Search & Replace Guide
```bash
# Find and replace in your codebase
bg-heritage-orange → bg-primary-purple
text-heritage-orange → text-primary-purple
border-heritage-orange → border-primary-purple
bg-sunset-fire → bg-vibranium
shadow-glow-orange → shadow-glow-purple
font-headline → font-headline (update font-family separately)
```

---

## 🎯 Common Patterns

### Hero Section
```jsx
<section className="min-h-screen bg-dark-bg relative overflow-hidden">
  <div className="pattern-overlay">
    <div className="container mx-auto px-6 py-20">
      <h1 className="text-gradient-vibranium text-5xl md:text-6xl font-black mb-6">
        Transform Yourself
      </h1>
      <p className="text-text-secondary text-xl mb-8">
        Join the battle and show your tribe's strength
      </p>
      <button className="btn-primary animate-vote-pulse">
        Get Started 🔥
      </button>
    </div>
  </div>
</section>
```

### Battle Feed Card
```jsx
<div className="card-battle space-y-4">
  {/* Header */}
  <div className="flex items-center justify-between">
    <span className="badge-tribe">🦁 Zulu</span>
    <span className="badge-purple">2h left</span>
  </div>
  
  {/* Battle Images */}
  <div className="grid grid-cols-2 gap-4">
    <img src={img1} className="img-battle" alt="Challenger" />
    <img src={img2} className="img-battle" alt="Defender" />
  </div>
  
  {/* Vote Buttons */}
  <div className="grid grid-cols-2 gap-4">
    <button className="btn-primary animate-vote-pulse">
      Vote Left
    </button>
    <button className="btn-primary animate-vote-pulse">
      Vote Right
    </button>
  </div>
</div>
```

### ChatGPT-Style Interface
```jsx
<div className="min-h-screen bg-dark-bg flex flex-col">
  {/* Chat Container */}
  <div className="flex-1 overflow-y-auto p-6 space-y-4">
    <VibraniumChatBubble 
      type="bot"
      avatar="🤖"
      message="Upload your photo to begin!"
    />
    
    <VibraniumChatBubble 
      type="user"
      avatar="👤"
      message="Ready!"
    />
  </div>
  
  {/* Input Area */}
  <div className="p-6 bg-surface border-t border-border-ui">
    <VibraniumUploadBox onUpload={handleUpload} />
  </div>
</div>
```

---

## 🐛 Troubleshooting

### Fonts Not Loading
```javascript
// Check if fonts are imported in index.css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&family=Inter:wght@400;500;600;700&display=swap');
```

### Gradients Not Working
```javascript
// Ensure Tailwind config includes custom gradients
// Check tailwind.config.js > theme.extend.backgroundImage
```

### Animations Not Smooth
```javascript
// Ensure you're using GPU-accelerated properties
// transform, opacity, filter are best
// Avoid animating: width, height, margin, padding
```

### Colors Not Applying
```javascript
// Check if Tailwind is purging your classes
// Add paths to content array in tailwind.config.js
content: ["./src/**/*.{js,jsx,ts,tsx}"]
```

---

## 📚 Resources

- **Component Library:** `/design-system`
- **Design System File:** `/client/src/styles/designSystemV2.js`
- **Tailwind Config:** `/client/tailwind.config.js`
- **Main CSS:** `/client/src/styles/index.css`
- **Full Documentation:** `/PACKET_6_IMPLEMENTATION_COMPLETE.md`

---

## 💡 Pro Tips

1. **Use the Component Library** - Always check `/design-system` before building new components
2. **Leverage Tailwind** - Use utility classes for faster development
3. **Import Reusable Components** - Don't rebuild buttons, use `VibraniumVoteButton`
4. **Test Responsiveness** - Always check mobile, tablet, desktop
5. **Optimize Animations** - Use `will-change` for smooth animations
6. **Consistent Spacing** - Stick to 8pt grid (8px, 16px, 24px, 32px)
7. **Semantic HTML** - Use proper tags (h1, h2, button, etc.)
8. **Accessibility** - Ensure proper contrast ratios and focus states

---

**Happy Coding with Vibranium Royalty! 👑⚡**

*If you have questions, refer to the component library at `/design-system` or check the full implementation guide.*


