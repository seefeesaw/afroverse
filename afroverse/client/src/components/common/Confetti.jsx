import React, { useEffect, useState } from 'react';

const Confetti = ({ duration = 3000, count = 50 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const emojis = ['🎉', '✨', '🔥', '👑', '⭐', '💫', '🏆', '⚔️'];
    const colors = ['#FF6B9D', '#C44569', '#FFC312', '#EE5A6F', '#00D2FF', '#3867D6'];
    
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 1000,
      duration: 2000 + Math.random() * 2000,
      rotation: Math.random() * 360
    }));
    
    setParticles(newParticles);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            top: '-10%',
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
            transform: `rotate(${particle.rotation}deg)`
          }}
        >
          {particle.emoji}
        </div>
      ))}

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Confetti;


