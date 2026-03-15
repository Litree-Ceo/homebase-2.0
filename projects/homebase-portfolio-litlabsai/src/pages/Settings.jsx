import { useState, useEffect } from 'react';
 
import { motion } from 'framer-motion';
import { useNotifier } from '../components/Notification';
import { useUser } from '../hooks/useUser';
import Loader from '../components/Loader';

const Settings = () => {
  const { userProfile, loading, updateUserProfile } = useUser();
  const [displayName, setDisplayName] = useState('');
  const { notify } = useNotifier();

  useEffect(() => {
    if (userProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(userProfile.displayName || '');
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateUserProfile({ displayName });
    notify('Settings saved successfully!');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="settings-container">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and application settings</p>
      </header>

      <motion.div className="aurora-card">
        <form onSubmit={handleSave} style={{ padding: 'var(--space-5)' }}>
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="aurora-button">
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Settings;
