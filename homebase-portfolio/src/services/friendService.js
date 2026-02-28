import { db, hasValidConfig } from './firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, query, where, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';

// Mock friends data
const mockFriends = [
  { id: 'friend1', name: 'Alice Chen', avatar: 'AC', status: 'online', activity: 'Playing Tetris' },
  { id: 'friend2', name: 'Bob Smith', avatar: 'BS', status: 'offline', activity: '' },
  { id: 'friend3', name: 'Carol Davis', avatar: 'CD', status: 'in-game', activity: 'Listening to Music' },
];

const mockRequests = [
  { id: 'req1', fromId: 'user4', fromName: 'David Lee', status: 'pending' },
];

export const sendFriendRequest = async (fromId, toId) => {
  if (!hasValidConfig) {
    mockRequests.push({
      id: 'req_' + Date.now(),
      fromId,
      toId,
      status: 'pending',
      timestamp: Date.now(),
    });
    return;
  }
  
  const requestRef = doc(collection(db, 'friendRequests'));
  await setDoc(requestRef, {
    fromId,
    toId,
    status: 'pending',
    timestamp: serverTimestamp(),
  });
};

export const acceptFriendRequest = async (requestId) => {
  if (!hasValidConfig) {
    const req = mockRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'accepted';
      mockFriends.push({
        id: req.fromId,
        name: req.fromName,
        avatar: req.fromName.split(' ').map(n => n[0]).join(''),
        status: 'online',
        activity: '',
      });
    }
    return;
  }
  
  const requestRef = doc(db, 'friendRequests', requestId);
  await updateDoc(requestRef, { status: 'accepted' });
};

export const rejectFriendRequest = async (requestId) => {
  if (!hasValidConfig) {
    const idx = mockRequests.findIndex(r => r.id === requestId);
    if (idx !== -1) mockRequests.splice(idx, 1);
    return;
  }
  
  await deleteDoc(doc(db, 'friendRequests', requestId));
};

export const getFriends = async (userId) => {
  if (!hasValidConfig) {
    return mockFriends;
  }
  
  const friendsRef = collection(db, 'friendships');
  const q = query(friendsRef, where('users', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPendingRequests = async (userId) => {
  if (!hasValidConfig) {
    return mockRequests.filter(r => r.status === 'pending');
  }
  
  const requestsRef = collection(db, 'friendRequests');
  const q = query(requestsRef, where('toId', '==', userId), where('status', '==', 'pending'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToFriends = (userId, callback) => {
  if (!hasValidConfig) {
    callback(mockFriends);
    return () => {};
  }
  
  const friendsRef = collection(db, 'friendships');
  const q = query(friendsRef, where('users', 'array-contains', userId));
  
  return onSnapshot(q, (snapshot) => {
    const friends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(friends);
  });
};
