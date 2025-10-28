import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import CulturalPattern from '../components/common/CulturalPattern';

const Landing = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [liveStats, setLiveStats] = useState({
    battles: 2341,
    transformations: 15678,
    warriors: 8234
  });

  // Auto-carousel for hero images
  const heroImages = [
    '/hero/maasai-transform.jpg',
    '/hero/zulu-transform.jpg',
    '/hero/egyptian-transform.jpg',
    '/hero/yoruba-transform.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live stats updating
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        battles: prev.battles + Math.floor(Math.random() * 3),
        transformations: prev.transformations + Math.floor(Math.random() * 5),
        warriors: prev.warriors + Math.floor(Math.random() * 2)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollToUpload = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-tribe">
      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Cultural Pattern Overlay */}
          <CulturalPattern variant="ndebele" opacity={0.1} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          {/* Main Headline */}
          <h1 className="font-headline text-5xl md:text-7xl text-white mb-6 animate-fade-in">
            Discover Your African Heritage
            <span className="block text-gradient-sunset mt-2">
              in 60 Seconds
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-2xl md:text-3xl text-gray-200 mb-8 font-medium">
            Transform. Battle. Conquer.
          </p>

          {/* Live Stats Ticker */}
          <div className="flex items-center justify-center space-x-8 mb-10 animate-fade-in">
            <div className="text-center">
              <div className="text-3xl font-bold text-heritage-gold">
                {liveStats.battles.toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Battles Now</div>
            </div>
            <div className="w-px h-12 bg-gray-500" />
            <div className="text-center">
              <div className="text-3xl font-bold text-heritage-gold">
                {liveStats.transformations.toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Transformations</div>
            </div>
            <div className="w-px h-12 bg-gray-500" />
            <div className="text-center">
              <div className="text-3xl font-bold text-heritage-gold">
                {liveStats.warriors.toLocaleString()}
              </div>
              <div className="text-sm text-gray-300">Warriors</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              onClick={scrollToUpload}
              className="btn-primary text-xl px-10 py-5 w-full sm:w-auto"
            >
              🚀 Start Your Transformation
            </Button>
            <Button
              onClick={() => navigate('/feed')}
              className="btn-outline text-xl px-10 py-5 w-full sm:w-auto"
            >
              👀 Watch Battles
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-2 text-gray-300">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-heritage-orange to-heritage-gold border-2 border-white"
                />
              ))}
            </div>
            <span className="text-sm">+8K warriors joined this week</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-white text-sm mb-2">Scroll to learn more</div>
          <div className="w-6 h-10 border-2 border-white rounded-full mx-auto relative">
            <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-6 bg-dark-card">
        <CulturalPattern variant="kente" opacity={0.05} />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="font-headline text-4xl md:text-5xl text-center text-white mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-24 h-24 bg-sunset-fire rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-orange">
                <span className="text-5xl">📸</span>
              </div>
              <h3 className="font-headline text-2xl text-white mb-4">1. Upload</h3>
              <p className="text-gray-300 leading-relaxed">
                Upload your selfie and choose your heritage style from Maasai, Zulu, Egyptian, and more.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-24 h-24 bg-royal-glow rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-gold">
                <span className="text-5xl">✨</span>
              </div>
              <h3 className="font-headline text-2xl text-white mb-4">2. Transform</h3>
              <p className="text-gray-300 leading-relaxed">
                AI transforms you into legendary African royalty in just 15 seconds. Watch the magic happen!
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-24 h-24 bg-savannah-dawn rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-green">
                <span className="text-5xl">⚔️</span>
              </div>
              <h3 className="font-headline text-2xl text-white mb-4">3. Battle</h3>
              <p className="text-gray-300 leading-relaxed">
                Challenge friends, vote on battles, and climb the leaderboard. Join your tribe and conquer!
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button
              onClick={scrollToUpload}
              className="btn-primary text-xl px-10 py-5"
            >
              🔥 Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Live Stats Ticker */}
      <section className="relative bg-heritage-orange py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center space-x-8 text-white overflow-x-auto">
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-2xl">🔥</span>
              <span className="font-bold">{liveStats.battles} battles happening now</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30" />
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-2xl">👑</span>
              <span className="font-bold">{liveStats.warriors} warriors online</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/30" />
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-2xl">⚡</span>
              <span className="font-bold">New battle every 3 seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tribes Preview */}
      <section className="relative py-20 px-6 bg-gradient-tribe">
        <CulturalPattern variant="maasai" opacity={0.08} />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <h2 className="font-headline text-4xl md:text-5xl text-center text-white mb-4">
            Join Your Tribe
          </h2>
          <p className="text-center text-gray-300 text-xl mb-12">
            Battle alongside thousands of warriors for weekly glory
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Lagos Lions', icon: '🦁', color: 'from-heritage-orange to-heritage-gold' },
              { name: 'Wakanda Warriors', icon: '🐆', color: 'from-purple-500 to-pink-500' },
              { name: 'Sahara Storm', icon: '🌪️', color: 'from-heritage-gold to-yellow-500' },
              { name: 'Nile Nobility', icon: '🐪', color: 'from-pharaoh-blue to-cyan-500' },
              { name: 'Zulu Nation', icon: '🛡️', color: 'from-savannah-green to-emerald-500' }
            ].map((tribe, index) => (
              <div
                key={index}
                className={`card-glass text-center p-6 hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${tribe.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-3xl">{tribe.icon}</span>
                </div>
                <h4 className="font-headline text-lg text-white">{tribe.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-6 bg-dark-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-4xl md:text-6xl text-white mb-6">
            Ready to Discover Your
            <span className="block text-gradient-sunset mt-2">
              African Heritage?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of warriors. Free to start. Takes 60 seconds.
          </p>
          <Button
            onClick={scrollToUpload}
            className="btn-primary text-2xl px-12 py-6"
          >
            🚀 Start Free Transformation
          </Button>
          <p className="text-sm text-gray-400 mt-6">
            No credit card required • First 3 transformations free
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 Afroverse. Built with pride. 🔥👑🌍
            </div>
            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/help" className="hover:text-white transition-colors">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
