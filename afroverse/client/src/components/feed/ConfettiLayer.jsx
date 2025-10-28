import React, { useState, useEffect } from 'react';

const ConfettiLayer = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isActive) {
      // Create confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 7)],
        size: Math.random() * 10 + 5,
        velocity: Math.random() * 3 + 2,
        rotationSpeed: Math.random() * 10 - 5
      }));

      setParticles(newParticles);

      // Animate particles
      const animate = () => {
        setParticles(prevParticles => {
          const updatedParticles = prevParticles.map(particle => ({
            ...particle,
            y: particle.y + particle.velocity,
            rotation: particle.rotation + particle.rotationSpeed
          }));

          // Remove particles that have fallen off screen
          const filteredParticles = updatedParticles.filter(particle => particle.y < 110);

          if (filteredParticles.length === 0) {
            onComplete?.();
            return [];
          }

          return filteredParticles;
        });
      };

      const interval = setInterval(animate, 16); // 60fps

      return () => clearInterval(interval);
    }
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            transition: 'none'
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiLayer;
