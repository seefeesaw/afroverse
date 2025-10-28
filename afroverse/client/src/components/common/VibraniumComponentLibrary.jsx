/**
 * VIBRANIUM COMPONENT LIBRARY
 * 
 * This file demonstrates all Vibranium Royalty design system components
 * Use this as a reference guide for implementing the visual identity
 */

import React from 'react';

const VibraniumComponentLibrary = () => {
  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="text-center">
          <h1 className="text-gradient-vibranium mb-4">
            AfroMoji Component Library
          </h1>
          <p className="text-text-secondary">
            Vibranium Royalty Design System
          </p>
        </header>

        {/* BUTTONS */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Buttons</h2>
          
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">
              Primary Button
            </button>
            
            <button className="btn-secondary">
              Secondary Button
            </button>
            
            <button className="btn-outline">
              Outline Button
            </button>
            
            <button className="btn-ghost">
              Ghost Button
            </button>
          </div>

          {/* Vote Button with Pulse */}
          <div className="flex gap-4">
            <button className="btn-primary animate-vote-pulse">
              🔥 Vote Now
            </button>
          </div>
        </section>

        {/* CARDS */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Surface Card */}
            <div className="card-glass">
              <h3 className="text-white mb-2">Surface Card</h3>
              <p className="text-text-secondary text-sm">
                Default card for general content
              </p>
            </div>

            {/* Battle Card */}
            <div className="card-battle">
              <h3 className="text-white mb-2">Battle Card</h3>
              <p className="text-text-secondary text-sm">
                Neon purple edge for battles
              </p>
            </div>

            {/* Tribe Card */}
            <div className="card-tribe">
              <h3 className="text-white mb-2">Tribe Card</h3>
              <p className="text-text-secondary text-sm">
                Blue glow for tribe content
              </p>
            </div>
          </div>

          {/* Elevated Card */}
          <div className="card-elevated">
            <h3 className="text-white mb-4">Elevated Card</h3>
            <p className="text-text-secondary">
              Used for important content like modals and hero sections.
              Has stronger shadow and hover effect.
            </p>
          </div>
        </section>

        {/* INPUTS */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Input Fields</h2>
          
          <div className="space-y-4 max-w-md">
            <input 
              type="text" 
              className="input-primary w-full" 
              placeholder="Enter your name"
            />
            
            <input 
              type="email" 
              className="input-primary w-full" 
              placeholder="Enter your email"
            />

            <div className="relative">
              <input 
                type="search" 
                className="input-search w-full" 
                placeholder="Search battles..."
              />
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Upload Box */}
          <div className="upload-box text-center">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-white mb-2">Upload Your Photo</h3>
            <p className="text-text-secondary text-sm">
              Click or drag to upload
            </p>
          </div>
        </section>

        {/* CHAT BUBBLES */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Chat Bubbles</h2>
          
          <div className="space-y-4 max-w-md">
            {/* Bot Bubble */}
            <div className="flex justify-start">
              <div className="chat-bubble-bot max-w-[80%]">
                <p className="text-white text-sm">
                  Upload your photo to begin your transformation 👑🔥
                </p>
              </div>
            </div>

            {/* User Bubble */}
            <div className="flex justify-end">
              <div className="chat-bubble-user max-w-[80%]">
                <p className="text-white text-sm">
                  I'm ready! Let's go! 🚀
                </p>
              </div>
            </div>

            {/* Bot Bubble with Image */}
            <div className="flex justify-start">
              <div className="chat-bubble-bot max-w-[80%]">
                <p className="text-white text-sm mb-3">
                  Choose your transformation style:
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30">
                    Pharaoh 👑
                  </button>
                  <button className="px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30">
                    Warrior ⚔️
                  </button>
                  <button className="px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30">
                    Royalty 🦁
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BADGES */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Badges</h2>
          
          <div className="flex flex-wrap gap-3">
            <span className="badge-gold">👑 Winner</span>
            <span className="badge-purple">New</span>
            <span className="badge-tribe">🦁 Zulu</span>
            <span className="badge-success">✅ Complete</span>
          </div>
        </section>

        {/* TEXT STYLES */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Typography</h2>
          
          <div className="space-y-4">
            <h1 className="font-headline text-white">
              Headline H1 - Montserrat Black
            </h1>
            
            <h2 className="font-headline text-white">
              Headline H2 - Montserrat Bold
            </h2>
            
            <h3 className="font-headline text-white">
              Headline H3 - Montserrat Semibold
            </h3>
            
            <p className="font-body text-text-primary">
              Body text - Inter Regular (16px). This is the standard text used for paragraphs and general content.
            </p>
            
            <p className="font-body text-text-secondary text-sm">
              Secondary text - Inter Regular (14px) with 70% opacity.
            </p>
            
            <p className="font-body text-text-tertiary text-xs">
              Caption text - Inter Medium (13px) with 50% opacity.
            </p>
          </div>
        </section>

        {/* TEXT GRADIENTS */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Text Gradients</h2>
          
          <div className="space-y-4">
            <h1 className="text-gradient-vibranium">
              Vibranium Gradient Text
            </h1>
            
            <h2 className="text-gradient-purple">
              Purple Gradient Text
            </h2>
            
            <h2 className="text-gradient-gold">
              Gold Gradient Text
            </h2>
          </div>
        </section>

        {/* IMAGES */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Image Treatments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Output */}
            <div>
              <div className="bg-surface img-ai-output flex items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
              <p className="text-text-secondary text-sm mt-2 text-center">
                AI Output Image
              </p>
            </div>

            {/* Battle */}
            <div>
              <div className="bg-surface img-battle flex items-center justify-center">
                <span className="text-4xl">⚔️</span>
              </div>
              <p className="text-text-secondary text-sm mt-2 text-center">
                Battle Image
              </p>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-surface img-avatar flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
              <p className="text-text-secondary text-sm mt-2 text-center">
                Avatar
              </p>
            </div>
          </div>
        </section>

        {/* ANIMATIONS */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Animations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Vote Pulse */}
            <div className="card-glass text-center">
              <button className="btn-primary animate-vote-pulse mb-4">
                Vote
              </button>
              <p className="text-text-secondary text-sm">Vote Pulse</p>
            </div>

            {/* Float */}
            <div className="card-glass text-center">
              <div className="text-4xl animate-float mb-4">🦁</div>
              <p className="text-text-secondary text-sm">Float</p>
            </div>

            {/* Purple Glow */}
            <div className="card-glass text-center">
              <div className="w-16 h-16 bg-primary-purple rounded-lg animate-glow-purple mx-auto mb-4"></div>
              <p className="text-text-secondary text-sm">Glow Pulse</p>
            </div>

            {/* Gold Shimmer */}
            <div className="card-glass text-center">
              <div className="w-16 h-16 bg-gold rounded-lg animate-shimmer-gold mx-auto mb-4"></div>
              <p className="text-text-secondary text-sm">Gold Shimmer</p>
            </div>
          </div>
        </section>

        {/* LOADING STATES */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Loading States</h2>
          
          <div className="flex items-center gap-6">
            <div className="spinner w-8 h-8"></div>
            <p className="text-text-secondary">Vibranium Spinner</p>
          </div>
        </section>

        {/* SHADOWS & GLOWS */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Shadows & Glows</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="bg-surface p-6 rounded-lg shadow-glow-purple text-center">
              <p className="text-white text-sm">Purple Glow</p>
            </div>
            
            <div className="bg-surface p-6 rounded-lg shadow-glow-purple-strong text-center">
              <p className="text-white text-sm">Purple Strong</p>
            </div>
            
            <div className="bg-surface p-6 rounded-lg shadow-glow-gold text-center">
              <p className="text-white text-sm">Gold Glow</p>
            </div>
            
            <div className="bg-surface p-6 rounded-lg shadow-glow-red text-center">
              <p className="text-white text-sm">Red Glow</p>
            </div>
            
            <div className="bg-surface p-6 rounded-lg shadow-glow-blue text-center">
              <p className="text-white text-sm">Blue Glow</p>
            </div>
            
            <div className="bg-surface p-6 rounded-lg shadow-glow-green text-center">
              <p className="text-white text-sm">Green Glow</p>
            </div>
            
            <div className="bg-surface p-6 rounded-lg shadow-neon-purple text-center">
              <p className="text-white text-sm">Neon Purple</p>
            </div>
            
            <div className="bg-surface p-6 rounded-lg shadow-neon-gold text-center">
              <p className="text-white text-sm">Neon Gold</p>
            </div>
          </div>
        </section>

        {/* BRAND VOICE */}
        <section className="space-y-6">
          <h2 className="text-gradient-purple">Brand Voice Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-glass">
              <h3 className="text-gold mb-2">Motivational</h3>
              <p className="text-white italic">
                "Rise, Warrior. Your tribe awaits."
              </p>
            </div>

            <div className="card-glass">
              <h3 className="text-red mb-2">Competitive</h3>
              <p className="text-white italic">
                "They're catching up — defend your tribe!"
              </p>
            </div>

            <div className="card-glass">
              <h3 className="text-tribe-blue mb-2">Playful</h3>
              <p className="text-white italic">
                "Not bad… but can you beat a Zulu Warrior?"
              </p>
            </div>

            <div className="card-glass">
              <h3 className="text-success-green mb-2">Cultural Pride</h3>
              <p className="text-white italic">
                "Africa is Royal. Let the world see."
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center pt-12 pb-6">
          <p className="text-text-secondary text-sm">
            AfroMoji Visual Identity System - Vibranium Royalty
          </p>
          <p className="text-text-tertiary text-xs mt-2">
            Black Panther x TikTok x Duolingo
          </p>
        </footer>

      </div>
    </div>
  );
};

export default VibraniumComponentLibrary;


