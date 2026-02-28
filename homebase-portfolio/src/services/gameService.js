import { db, hasValidConfig } from './firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp, where, getDocs, limit, arrayUnion } from 'firebase/firestore';

// Mock game data
const mockGameRooms = {};
const mockLeaderboard = [
  { id: '1', game: 'tetris', userId: 'user1', userName: 'Alice', score: 15000, timestamp: Date.now() },
  { id: '2', game: 'tetris', userId: 'user2', userName: 'Bob', score: 12000, timestamp: Date.now() - 86400000 },
  { id: '3', game: 'snake', userId: 'user3', userName: 'Carol', score: 500, timestamp: Date.now() },
];

export const createGameRoom = async (gameType, hostId, hostName, maxPlayers = 2) => {
  if (!hasValidConfig) {
    const roomId = 'room_' + Date.now();
    mockGameRooms[roomId] = {
      id: roomId,
      gameType,
      hostId,
      hostName,
      maxPlayers,
      players: [{ id: hostId, name: hostName, score: 0 }],
      status: 'waiting',
      createdAt: Date.now(),
    };
    return roomId;
  }
  
  const roomRef = doc(collection(db, 'gameRooms'));
  await setDoc(roomRef, {
    gameType,
    hostId,
    hostName,
    maxPlayers,
    players: [{ id: hostId, name: hostName, score: 0 }],
    status: 'waiting',
    createdAt: serverTimestamp(),
  });
  return roomRef.id;
};

export const joinGameRoom = async (roomId, playerId, playerName) => {
  if (!hasValidConfig) {
    const room = mockGameRooms[roomId];
    if (room && room.players.length < room.maxPlayers) {
      room.players.push({ id: playerId, name: playerName, score: 0 });
    }
    return;
  }
  
  const roomRef = doc(db, 'gameRooms', roomId);
  await updateDoc(roomRef, {
    players: arrayUnion({ id: playerId, name: playerName, score: 0 }),
  });
};

export const updateScore = async (roomId, playerId, score) => {
  if (!hasValidConfig) {
    const room = mockGameRooms[roomId];
    if (room) {
      const player = room.players.find(p => p.id === playerId);
      if (player) player.score = score;
    }
    return;
  }
  
  const roomRef = doc(db, 'gameRooms', roomId);
  const roomSnap = await getDocs(query(collection(db, 'gameRooms'), where('__name__', '==', roomId)));
  if (!roomSnap.empty) {
    const room = roomSnap.docs[0].data();
    const players = room.players.map(p => 
      p.id === playerId ? { ...p, score } : p
    );
    await updateDoc(roomRef, { players });
  }
};

export const deleteGameRoom = async (roomId) => {
  if (!hasValidConfig) {
    delete mockGameRooms[roomId];
    return;
  }
  await deleteDoc(doc(db, 'gameRooms', roomId));
};

export const saveHighScore = async (gameType, userId, userName, score) => {
  if (!hasValidConfig) {
    mockLeaderboard.push({
      id: 'score_' + Date.now(),
      game: gameType,
      userId,
      userName,
      score,
      timestamp: Date.now(),
    });
    return;
  }
  
  const scoreRef = doc(collection(db, 'leaderboard'));
  await setDoc(scoreRef, {
    game: gameType,
    userId,
    userName,
    score,
    timestamp: serverTimestamp(),
  });
};

export const subscribeToLeaderboard = (gameType, callback) => {
  if (!hasValidConfig) {
    const scores = mockLeaderboard
      .filter(s => s.game === gameType)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    callback(scores);
    return () => {};
  }
  
  const leaderboardRef = collection(db, 'leaderboard');
  const q = query(
    leaderboardRef,
    where('game', '==', gameType),
    orderBy('score', 'desc'),
    limit(10)
  );
  
  return onSnapshot(q, (snapshot) => {
    const scores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(scores);
  });
};

// Legacy mock data for old getGames function
export async function getGames() {
  return [
    { id: 'tetris', title: 'Tetris', type: 'puzzle', emoji: '🎮' },
    { id: 'snake', title: 'Snake', type: 'arcade', emoji: '🐍' },
  ];
}
