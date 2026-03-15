import React, { useEffect, useState, useRef } from 'react';
import styles from './HoneycombVision.module.css';

interface HoneycombVisionProps {
  enabled: boolean;
  intensity?: number;
  colorScheme?: 'default' | 'black-purple-gold-yellow';
}

const HoneycombVision: React.FC<HoneycombVisionProps> = ({
  enabled,
  intensity = 1,
  colorScheme = 'black-purple-gold-yellow'
}) => {
  const [drips, setDrips] = useState<Array<{ id: number; x: number; y: number; type: string }>>([]);
  const [honeycombGrid, setHoneycombGrid] = useState<Array<{ id: number; x: number; y: number; active: boolean }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      setDrips([]);
      setHoneycombGrid([]);
      return;
    }

    // Initialize honeycomb grid
    initializeHoneycombGrid();
    
    // Start animation loop
    const animate = () => {
      updateDrips();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, intensity]);

  const initializeHoneycombGrid = () => {
    const grid: Array<{ id: number; x: number; y: number; active: boolean }> = [];
    const container = containerRef.current;
    
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cols = Math.floor(rect.width / 60);
    const rows = Math.floor(rect.height / 50);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Create hexagonal grid pattern
        const offsetX = y % 2 === 0 ? 0 : 30;
        grid.push({
          id: y * cols + x,
          x: x * 60 + offsetX,
          y: y * 50,
          active: Math.random() > 0.5
        });
      }
    }

    setHoneycombGrid(grid);
  };

  const updateDrips = () => {
    setDrips(prevDrips => {
      // Add new drips
      const newDrips = [...prevDrips];
      
      if (Math.random() < intensity * 0.1) {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const x = Math.random() * rect.width;
          const types = ['💧', '✨', '🌟', '💎', '⚡', '🌈'];
          const type = types[Math.floor(Math.random() * types.length)];
          
          newDrips.push({
            id: Date.now() + Math.random(),
            x,
            y: -20,
            type
          });
        }
      }

      // Update existing drips
      const updatedDrips = newDrips.map(drip => ({
        ...drip,
        y: drip.y + (5 * intensity)
      })).filter(drip => drip.y < (containerRef.current?.getBoundingClientRect().height || 0) + 20);

      return updatedDrips;
    });
  };

  const getDripStyle = (drip: any) => {
    const colors = {
      'default': '#00ffff',
      'black-purple-gold-yellow': ['#800080', '#ffd700', '#ffff00'][Math.floor(Math.random() * 3)]
    };
    
    return {
      position: 'absolute' as const,
      left: `${drip.x}px`,
      top: `${drip.y}px`,
      fontSize: '24px',
      color: colors[colorScheme] || colors.default,
      textShadow: '0 0 10px currentColor',
      animation: 'drip-fall 2s linear forwards',
      zIndex: 10
    };
  };

  const getHoneycombStyle = (cell: any) => {
    const colors = {
      'default': ['#00ffff', '#ff00ff'],
      'black-purple-gold-yellow': ['#800080', '#ffd700', '#ffff00', '#000000']
    };
    
    const color = colors[colorScheme][Math.floor(Math.random() * colors[colorScheme].length)];
    
    return {
      position: 'absolute' as const,
      left: `${cell.x}px`,
      top: `${cell.y}px`,
      width: '40px',
      height: '40px',
      backgroundColor: cell.active ? color : 'transparent',
      clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      border: cell.active ? `2px solid ${color}` : 'none',
      opacity: cell.active ? 0.8 : 0.2,
      transition: 'all 0.3s ease',
      zIndex: 5
    };
  };

  if (!enabled) return null;

  return (
    <div ref={containerRef} className={styles.honeycombVision}>
      {/* Honeycomb Grid */}
      <div className={styles.honeycombGrid}>
        {honeycombGrid.map(cell => (
          <div
            key={cell.id}
            style={getHoneycombStyle(cell)}
            className={styles.honeycombCell}
          />
        ))}
      </div>

      {/* Drip Effects */}
      <div className={styles.dripContainer}>
        {drips.map(drip => (
          <div
            key={drip.id}
            style={getDripStyle(drip)}
            className={styles.drip}
          >
            {drip.type}
          </div>
        ))}
      </div>

      {/* Overlay Effects */}
      <div className={styles.overlay}>
        <div className={styles.scanLine} />
        <div className={styles.gridOverlay} />
      </div>

      {/* Status Indicator */}
      <div className={styles.statusIndicator}>
        <div className={styles.statusPulse}>
          <span className={styles.statusText}>🐝 HONEYCOMB VISION ACTIVE</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes drip-fall {
          from {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          to {
            transform: translateY(100px) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default HoneycombVision;