 
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="aurora-card not-found-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="not-found-content">
        <h1 className="glitch" data-text="404">404</h1>
        <h2>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="not-found-actions">
          <button className="aurora-button" onClick={() => navigate('/')}>
            Go Home
          </button>
          <button className="aurora-button secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
