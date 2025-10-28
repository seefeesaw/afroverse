import React from 'react';

/**
 * Cultural Pattern Component
 * Adds subtle African-inspired patterns as background overlays
 * "Motifs support the story, not overpower the UI"
 */

const CulturalPattern = ({ 
  variant = 'ndebele', 
  opacity = 0.08, 
  size = '200px',
  className = '' 
}) => {
  const patterns = {
    ndebele: {
      svg: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ndebele" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="50" height="50" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M25,0 L25,50 M0,25 L50,25" stroke="currentColor" stroke-width="2"/>
            <circle cx="25" cy="25" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#ndebele)"/>
      </svg>`,
      description: 'Ndebele geometric patterns'
    },
    maasai: {
      svg: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="maasai" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="currentColor"/>
            <circle cx="30" cy="30" r="3" fill="currentColor"/>
            <circle cx="50" cy="50" r="3" fill="currentColor"/>
            <line x1="0" y1="30" x2="60" y2="30" stroke="currentColor" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#maasai)"/>
      </svg>`,
      description: 'Maasai beadwork inspired'
    },
    kente: {
      svg: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="kente" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/>
            <rect x="40" y="40" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M0,0 L40,40 M40,0 L80,40 M0,40 L40,80 M40,40 L80,80" stroke="currentColor" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#kente)"/>
      </svg>`,
      description: 'Kente cloth symmetry'
    },
    moroccan: {
      svg: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="moroccan" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M50,0 L100,50 L50,100 L0,50 Z" fill="none" stroke="currentColor" stroke-width="2"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M50,35 L50,65 M35,50 L65,50" stroke="currentColor" stroke-width="2"/>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#moroccan)"/>
      </svg>`,
      description: 'Moroccan geometry'
    },
    tribal: {
      svg: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tribal" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M25,0 L50,25 L25,50 L0,25 Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="25" cy="25" r="5" fill="currentColor"/>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#tribal)"/>
      </svg>`,
      description: 'Generic tribal patterns'
    }
  };

  const pattern = patterns[variant] || patterns.tribal;
  const svgDataUri = `data:image/svg+xml,${encodeURIComponent(pattern.svg)}`;

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `url("${svgDataUri}")`,
        backgroundSize: size,
        backgroundRepeat: 'repeat',
        opacity: opacity,
      }}
      aria-hidden="true"
    />
  );
};

export default CulturalPattern;

/**
 * Usage Examples:
 * 
 * 1. Default Ndebele pattern:
 * <div className="relative">
 *   <CulturalPattern />
 *   <YourContent />
 * </div>
 * 
 * 2. Maasai pattern with custom opacity:
 * <div className="relative">
 *   <CulturalPattern variant="maasai" opacity={0.12} />
 *   <YourContent />
 * </div>
 * 
 * 3. Large Kente pattern:
 * <div className="relative">
 *   <CulturalPattern variant="kente" size="300px" opacity={0.06} />
 *   <YourContent />
 * </div>
 */


