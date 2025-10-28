import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCoins } from 'react-icons/fa';
import './CoinAnimations.css';

const CoinAnimations = ({ 
  trigger, 
  amount, 
  reason, 
  onComplete 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      createParticles();
      
      // Auto-hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  const createParticles = () => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 0.5
    }));
    setParticles(newParticles);
  };

  const coinVariants = {
    initial: { 
      scale: 0, 
      rotate: 0,
      opacity: 0 
    },
    animate: { 
      scale: [0, 1.2, 1],
      rotate: [0, 180, 360],
      opacity: [0, 1, 1],
      transition: {
        duration: 0.8,
        ease: "easeOut",
        times: [0, 0.6, 1]
      }
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const particleVariants = {
    initial: { 
      scale: 0,
      opacity: 0,
      y: 0
    },
    animate: { 
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      y: [-20, -100],
      transition: {
        duration: 2,
        ease: "easeOut",
        delay: (i) => i * 0.1
      }
    }
  };

  const textVariants = {
    initial: { 
      y: 20, 
      opacity: 0 
    },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const confettiVariants = {
    initial: { 
      scale: 0,
      rotate: 0
    },
    animate: { 
      scale: [0, 1, 0],
      rotate: [0, 360],
      transition: {
        duration: 2,
        ease: "easeOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="coin-animation-overlay">
          {/* Confetti particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="confetti-particle"
              style={{
                left: particle.x,
                top: particle.y,
                background: `hsl(${Math.random() * 60 + 30}, 70%, 50%)`
              }}
              variants={confettiVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: particle.delay }}
            />
          ))}

          {/* Main coin animation */}
          <motion.div
            className="coin-animation-container"
            variants={coinVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="coin-main">
              <FaCoins className="coin-icon" />
            </div>
            
            <motion.div
              className="coin-text"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="coin-amount">+{amount}</div>
              <div className="coin-reason">{reason}</div>
            </motion.div>
          </motion.div>

          {/* Floating coins */}
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="floating-coin"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i % 3) * 20}%`
              }}
              variants={particleVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: i * 0.1 }}
            >
              <FaCoins />
            </motion.div>
          ))}

          {/* Glow effect */}
          <motion.div
            className="coin-glow"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 2, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut"
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default CoinAnimations;
