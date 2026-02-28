import { db, hasValidConfig } from './firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp, where, getDocs } from 'firebase/firestore';

// Mock data for testing
const mockChats = {
  'chat1': {
    id: 'chat1',
    participants: ['user1', 'user2'],
    messages: [
      { id: 'm1', senderId: 'user1', text: 'Hey! Want to play a game?', timestamp: Date.now() - 3600000 },
      { id: 'm2', senderId: 'user2', text: 'Sure! Which one?', timestamp: Date.now() - 3000000 },
    ],
    lastMessage: { text: 'Sure! Which one?', timestamp: Date.now() - 3000000 },
  },
};

/**
 * Creates a new chat between participants
 * @param {string[]} participants - Array of user IDs
 * @returns {Promise<string>} - Chat ID
 */
export const createChat = async (participants) => {
  try {
    if (!hasValidConfig) {
      const chatId = 'mock_' + Date.now();
      mockChats[chatId] = { id: chatId, participants, messages: [] };
      return chatId;
    }
    
    const chatRef = doc(collection(db, 'chats'));
    await setDoc(chatRef, {
      participants,
      createdAt: serverTimestamp(),
      lastMessage: null,
    });
    return chatRef.id;
  } catch (error) {
    console.error('Chat creation failed:', error);
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
    throw new Error('Failed to create chat. Please try again.');
  }
};

export const sendMessage = async (chatId, senderId, text) => {
  try {
    if (!hasValidConfig) {
      const message = { id: 'm' + Date.now(), senderId, text, timestamp: Date.now() };
      if (mockChats[chatId]) {
        mockChats[chatId].messages.push(message);
        mockChats[chatId].lastMessage = { text, timestamp: Date.now() };
      }
      return message.id;
    }
    
    const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
    await setDoc(messageRef, {
      senderId,
      text,
      timestamp: serverTimestamp(),
    });
    
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: { text, timestamp: serverTimestamp() },
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Message delivery failed');
  }
};

export const subscribeToChat = (chatId, callback) => {
  if (!hasValidConfig) {
    const chat = mockChats[chatId] || { messages: [] };
    callback(chat.messages);
    return () => {};
  }
  
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

export const getUserChats = async (userId) => {
  const cacheKey = `user_chats_${userId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    if (!hasValidConfig) {
      const result = Object.values(mockChats);
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    }
    
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));
    const snapshot = await getDocs(q);
    const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Failed to get user chats:', error);
    throw new Error('Failed to retrieve user chats');
  }
};

export const deleteChat = async (chatId) => {
  try {
    if (!hasValidConfig) {
      delete mockChats[chatId];
      return;
    }
    await deleteDoc(doc(db, 'chats', chatId));
  } catch (error) {
    console.error('Failed to delete chat:', error);
    throw new Error('Failed to delete chat');
  }
};
