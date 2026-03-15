import { useState } from 'react';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
 
import { motion } from "framer-motion";
import { useNotifier } from "../components/Notification";
import { FiGithub, FiTwitter, FiGlobe } from "react-icons/fi";

const Auth = () => {
  const { notify } = useNotifier();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      notify('Welcome to HomeBase Pro! 🚀');
    } catch {
      notify("Sign-in failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notify("Passwords do not match");
      return;
    }
    setIsSigningIn(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      notify('Welcome to HomeBase Pro! 🚀');
    } catch (error) {
      notify(error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      notify('Welcome back! 🎉');
    } catch (error) {
      notify(error.message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <motion.div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
          filter: 'blur(60px)',
          opacity: 0.3,
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.2,
          right: '10%',
          bottom: '10%',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="aurora-card"
        style={{
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '420px',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants}>
          <div style={{
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
          }}>
            🚀
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1 
          variants={itemVariants}
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          HomeBase Pro
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          style={{ 
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            fontSize: '1rem',
          }}
        >
          The Future of Portfolio Management
        </motion.p>

        {/* Google Sign In Button */}
        <motion.button
          variants={itemVariants}
          className="aurora-button"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '14px 24px',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '1.5rem',
            opacity: isSigningIn ? 0.7 : 1,
            cursor: isSigningIn ? 'wait' : 'pointer',
          }}
        >
          {isSigningIn ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ⏳
            </motion.span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
        </motion.button>

        {/* Divider */}
        <motion.div 
          variants={itemVariants}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          <span>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
        </motion.div>

        {/* Email/Password Form */}
        <motion.div variants={itemVariants}>
          {isRegistering ? (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="aurora-input"
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="aurora-input"
                required
              />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="aurora-input"
                required
              />
              <button type="submit" className="aurora-button" disabled={isSigningIn}>
                {isSigningIn ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="aurora-input"
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="aurora-input"
                required
              />
              <button type="submit" className="aurora-button" disabled={isSigningIn}>
                {isSigningIn ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}
        </motion.div>

        <motion.div variants={itemVariants} style={{ marginTop: '1rem' }}>
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            className="aurora-button secondary"
            style={{ width: '100%' }}
          >
            {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </motion.div>

        {/* Features */}
        <motion.div 
          variants={itemVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(127, 90, 240, 0.1)',
            borderRadius: '12px',
            marginTop: '1.5rem',
          }}
        >
          {[
            { icon: '📊', label: 'Analytics' },
            { icon: '🚀', label: 'Deploy' },
            { icon: '🔒', label: 'Secure' },
          ].map((feature, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{feature.icon}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{feature.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Footer Links */}
        <motion.div 
          variants={itemVariants}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiGlobe size={12} /> Website
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiGithub size={12} /> GitHub
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiTwitter size={12} /> Twitter
          </a>
        </motion.div>

        {/* Easter Egg Hint */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={{
            fontSize: '0.625rem',
            color: 'var(--text-secondary)',
            marginTop: '1rem',
            opacity: 0.5,
          }}
        >
          💡 Try the Konami code for a surprise...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
