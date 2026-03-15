import { useState, useEffect } from 'react';
 
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from 'firebase/auth';
import { FiEdit2, FiSave, FiUser, FiMail, FiShield, FiZap } from 'react-icons/fi';

export function UserProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load user data when available
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (user) {
        await updateProfile(user, {
          displayName: displayName.trim() || null,
        });
        
        setMessage('Profile updated successfully! ✨');
        setIsEditing(false);
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="aurora-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Please sign in to view your profile.</h2>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="profile-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header className="page-header" variants={itemVariants}>
        <h1 className="page-title">litreelabmeta Profile</h1>
        <p className="page-subtitle">Manage your HomeBase Pro identity</p>
      </motion.header>

      {/* Profile Card */}
      <motion.div 
        className="aurora-card"
        variants={itemVariants}
        style={{ 
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(127, 90, 240, 0.1), rgba(44, 182, 125, 0.1))'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          {/* Avatar */}
          <motion.div 
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 10px 40px rgba(127, 90, 240, 0.4)',
              position: 'relative'
            }}
            whileHover={{ scale: 1.05 }}
            animate={{ 
              boxShadow: [
                '0 10px 40px rgba(127, 90, 240, 0.4)',
                '0 10px 60px rgba(127, 90, 240, 0.6)',
                '0 10px 40px rgba(127, 90, 240, 0.4)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={displayName} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
            ) : (
              displayName?.charAt(0)?.toUpperCase() || <FiUser />
            )}
            <div style={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              width: '20px',
              height: '20px',
              background: '#2CB67D',
              borderRadius: '50%',
              border: '3px solid var(--background-primary)'
            }} />
          </motion.div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              fontSize: '1.75rem', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {displayName || 'litreelabmeta'}
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <FiMail size={16} /> {email}
            </p>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)'
            }}>
              ID: {user.uid?.slice(0, 8)}...{user.uid?.slice(-8)}
            </p>
          </div>

          {/* Edit Button */}
          <motion.button
            className="aurora-button secondary"
            onClick={() => setIsEditing(!isEditing)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isEditing ? <FiSave /> : <FiEdit2 />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        {[
          { icon: <FiShield />, label: 'Status', value: user.emailVerified ? 'Verified ✓' : 'Unverified', color: user.emailVerified ? '#2CB67D' : '#F2B900' },
          { icon: <FiZap />, label: 'Provider', value: user.providerData[0]?.providerId?.split('.')[0] || 'Google', color: '#7F5AF0' },
          { icon: <FiUser />, label: 'Member Since', value: user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A', color: '#00D4AA' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            className="aurora-card"
            style={{ 
              padding: '1.5rem',
              textAlign: 'center',
              borderLeft: `4px solid ${stat.color}`
            }}
            whileHover={{ y: -5 }}
          >
            <div style={{ 
              fontSize: '2rem', 
              color: stat.color,
              marginBottom: '0.5rem'
            }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stat.value}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Edit Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="aurora-card"
            style={{ padding: '2rem' }}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Edit Profile</h3>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FiUser size={16} /> Display Name
                </label>
                <input
                  type="text"
                  className="aurora-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FiMail size={16} /> Email (Read-only)
                </label>
                <input
                  type="email"
                  className="aurora-input"
                  value={email}
                  disabled
                  style={{ opacity: 0.6 }}
                />
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ 
                    padding: '1rem', 
                    background: message.includes('Error') ? 'rgba(229, 62, 62, 0.1)' : 'rgba(44, 182, 125, 0.1)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: message.includes('Error') ? 'var(--color-error)' : 'var(--color-success)'
                  }}
                >
                  {message}
                </motion.div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <motion.button 
                  type="button"
                  className="aurora-button secondary"
                  onClick={() => setIsEditing(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  type="submit" 
                  className="aurora-button"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default UserProfile;
