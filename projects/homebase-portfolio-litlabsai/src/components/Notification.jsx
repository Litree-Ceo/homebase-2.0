import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
 
import { motion, AnimatePresence } from 'framer-motion';
import './Notification.css';

const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifier = () => useContext(NotificationContext);

const Notification = ({ message, onDismiss }) => (
  <motion.div
    className="aurora-card notification"
    initial={{ opacity: 0, y: 50, scale: 0.3 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
    onClick={onDismiss}
  >
    {message}
  </motion.div>
);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return;
    
    const timers = notifications.map((n) => 
      setTimeout(() => {
        setNotifications((prev) => prev.filter((item) => item.id !== n.id));
      }, 5000)
    );

    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="notification-container">
        <AnimatePresence>
          {notifications.map(({ id, message }) => (
            <Notification key={id} message={message} onDismiss={() => dismiss(id)} />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};