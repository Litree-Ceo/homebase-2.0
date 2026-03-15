import { motion } from 'framer-motion';

const GlitchText = ({ children, className = '', as = 'span', intensity = 'medium' }) => {
  const intensityMap = {
    low: { duration: 0.5 },
    medium: { duration: 0.3 },
    high: { duration: 0.15 },
  };

  const { duration } = intensityMap[intensity] || intensityMap.medium;

  const glitchVariants = {
    initial: { skewX: 0 },
    animate: {
      skewX: [0, -2, 2, -1, 1, 0],
      x: [0, -2, 2, -1, 0],
      transition: {
        duration,
        repeat: Infinity,
        repeatDelay: 2.5,
        ease: 'steps(1)',
      },
    },
  };

  const Component = motion[as] || motion.span;

  return (
    <Component
      className={`glitch-text ${className}`}
      variants={glitchVariants}
      initial="initial"
      animate="animate"
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {children}
      <span
        className="glitch-layer"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          color: '#ff00ff',
          clipPath: 'inset(0 0 0 0)',
          animation: `glitch-cyan ${duration * 2}s infinite linear alternate-reverse`,
        }}
      >
        {children}
      </span>
      <span
        className="glitch-layer"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          color: '#00ffff',
          clipPath: 'inset(0 0 0 0)',
          animation: `glitch-magenta ${duration * 2.5}s infinite linear alternate-reverse`,
        }}
      >
        {children}
      </span>
    </Component>
  );
};

export default GlitchText;
