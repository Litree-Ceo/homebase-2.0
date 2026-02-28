import { rtdb, hasValidConfig } from './firebase';
import { ref, set, onDisconnect, onValue } from 'firebase/database';

export const updateUserPresence = async (userId, status) => {
  if (!hasValidConfig) {
    console.log('Mock: Updating presence', userId, status);
    return;
  }
  
  const userStatusRef = ref(rtdb, `presence/${userId}`);
  await set(userStatusRef, {
    status,
    lastSeen: Date.now(),
  });
  
  // Set up disconnect handler
  onDisconnect(userStatusRef).set({
    status: 'offline',
    lastSeen: Date.now(),
  });
};

export const subscribeToFriendsPresence = (userId, callback) => {
  if (!hasValidConfig) {
    // Mock mode - return fake presence data
    const mockData = {
      'friend1': { status: 'online', lastSeen: Date.now() },
      'friend2': { status: 'in-game', lastSeen: Date.now() },
      'friend3': { status: 'offline', lastSeen: Date.now() - 3600000 },
    };
    callback(mockData);
    return () => {};
  }
  
  const presenceRef = ref(rtdb, 'presence');
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
  
  return unsubscribe;
};

export const setUserActivity = async (userId, activity) => {
  if (!hasValidConfig) {
    console.log('Mock: Setting activity', userId, activity);
    return;
  }
  
  const activityRef = ref(rtdb, `presence/${userId}/activity`);
  await set(activityRef, activity);
};
