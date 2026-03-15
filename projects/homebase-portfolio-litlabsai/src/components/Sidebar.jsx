import { useState } from 'react';
 
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { auth } from '../config/firebase';
import { 
  FiGrid, 
  FiBriefcase, 
  FiBarChart2, 
  FiTerminal, 
  FiSettings,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import './Sidebar.css';

import { useTheme } from '../hooks/useTheme';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      className="aurora-button secondary theme-toggle-btn"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiMoon />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiSun />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const Sidebar = () => {
  const user = auth.currentUser;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', text: 'Dashboard', icon: <FiGrid />, color: '#7F5AF0' },
    { to: '/projects', text: 'Projects', icon: <FiBriefcase />, color: '#2CB67D' },
    { to: '/analytics', text: 'Analytics', icon: <FiBarChart2 />, color: '#F2B900' },
    { to: '/termux', text: 'Termux', icon: <FiTerminal />, color: '#00D4AA' },
    { to: '/profile', text: 'Profile', icon: <FiUser />, color: '#E91E63' },
    { to: '/settings', text: 'Settings', icon: <FiSettings />, color: '#FF6B6B' },
  ];

  const handleSignOut = () => {
    auth.signOut();
    setMobileMenuOpen(false);
  };

  const sidebarVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button 
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {mobileMenuOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiX size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiMenu size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`sidebar-container ${mobileMenuOpen ? 'mobile-open' : ''}`}
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div className="sidebar-header" variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <h1 className="sidebar-logo">HomeBase</h1>
          </motion.div>
          <motion.span 
            className="sidebar-version"
            whileHover={{ scale: 1.1 }}
            animate={{ 
              boxShadow: [
                '0 0 0 rgba(127, 90, 240, 0)',
                '0 0 20px rgba(127, 90, 240, 0.5)',
                '0 0 0 rgba(127, 90, 240, 0)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Pro
          </motion.span>
        </motion.div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.to}
              variants={itemVariants}
              custom={index}
            >
              <NavLink 
                to={link.to} 
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {({ isActive }) => (
                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span 
                      className="nav-icon"
                      animate={isActive ? {
                        color: link.color,
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{ duration: 0.3 }}
                      style={{ color: isActive ? link.color : undefined }}
                    >
                      {link.icon}
                    </motion.span>
                    <span className="nav-text">{link.text}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="active-indicator"
                        style={{ background: link.color }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* User Profile */}
        <motion.div className="sidebar-footer" variants={itemVariants}>
          <motion.div 
            className="user-profile"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="user-avatar"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} />
              ) : (
                user?.displayName?.[0] || '?'
              )}
            </motion.div>
            <div className="user-info">
              <motion.span 
                className="user-name"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                {user?.displayName || 'Guest'}
              </motion.span>
              <span className="user-email">{user?.email}</span>
            </div>
          </motion.div>

          <div className="sidebar-actions">
            <ThemeToggle />
            <motion.button 
              className="aurora-button secondary sign-out-btn" 
              onClick={handleSignOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiLogOut />
              <span>Sign Out</span>
            </motion.button>
          </div>


        </motion.div>

        {/* Footer Info */}
        <motion.div 
          className="sidebar-credits"
          variants={itemVariants}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span>v2.0 • Made with 💜</span>
        </motion.div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
