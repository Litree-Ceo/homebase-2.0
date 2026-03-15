import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
 
import { motion } from "framer-motion";


const Welcome = () => {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Guest';
  
  return (
    <motion.div 
      className="aurora-card" 
      style={{ padding: 'var(--space-5)', textAlign: 'center' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          boxShadow: '0 10px 40px rgba(127, 90, 240, 0.4)',
        }}
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        👨‍💻
      </motion.div>
      <h1 style={{ 
        fontSize: '2.5rem',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Welcome, {displayName}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2rem' }}>
        Your HomeBase Pro command center is ready
      </p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {[
          { icon: '🚀', label: 'Projects', path: '/projects' },
          { icon: '📊', label: 'Analytics', path: '/analytics' },
          { icon: '💻', label: 'Termux', path: '/termux' },
          { icon: '👤', label: 'Profile', path: '/profile' },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={item.path}
              className="aurora-card"
              style={{
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '2rem' }}>{item.icon}</span>
              <span style={{ fontWeight: 600 }}>{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Welcome;