import { db, storage, hasValidConfig } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, updateDoc, query, where, onSnapshot, serverTimestamp, getDocs, arrayUnion } from 'firebase/firestore';

// Mock music data
const mockPlaylists = [
  {
    id: 'playlist1',
    name: 'Gaming Vibes',
    ownerId: 'user1',
    tracks: [
      { id: 't1', title: 'Chill Beats', artist: 'Lo-Fi Master', duration: 180, url: '' },
      { id: 't2', title: 'Electronic Dreams', artist: 'Synth Wave', duration: 240, url: '' },
    ],
  },
];

const mockNowPlaying = {
  user1: { track: { title: 'Chill Beats', artist: 'Lo-Fi Master' }, timestamp: Date.now() },
  user2: { track: { title: 'Rock Anthem', artist: 'The Band' }, timestamp: Date.now() - 300000 },
};

export const uploadMusic = async (file, userId, _metadata) => {
  if (!hasValidConfig) {
    console.log('Mock: Uploading music', file.name);
    return 'mock_url_' + Date.now();
  }
  
  const fileRef = ref(storage, `music/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

export const createPlaylist = async (userId, name) => {
  if (!hasValidConfig) {
    const playlist = {
      id: 'pl_' + Date.now(),
      name,
      ownerId: userId,
      tracks: [],
    };
    mockPlaylists.push(playlist);
    return playlist.id;
  }
  
  const playlistRef = doc(collection(db, 'playlists'));
  await setDoc(playlistRef, {
    name,
    ownerId: userId,
    tracks: [],
    createdAt: serverTimestamp(),
  });
  return playlistRef.id;
};

export const addTrackToPlaylist = async (playlistId, track) => {
  if (!hasValidConfig) {
    const playlist = mockPlaylists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.tracks.push({ ...track, id: 't' + Date.now() });
    }
    return;
  }
  
  const playlistRef = doc(db, 'playlists', playlistId);
  await updateDoc(playlistRef, {
    tracks: arrayUnion({ ...track, id: Date.now().toString() }),
  });
};

export const updateNowPlaying = async (userId, track) => {
  if (!hasValidConfig) {
    mockNowPlaying[userId] = { track, timestamp: Date.now() };
    return;
  }
  
  const nowPlayingRef = doc(db, 'nowPlaying', userId);
  await setDoc(nowPlayingRef, {
    track,
    timestamp: serverTimestamp(),
  });
};

export const subscribeToFriendActivity = (userId, callback) => {
  if (!hasValidConfig) {
    callback(mockNowPlaying);
    return () => {};
  }
  
  const nowPlayingRef = collection(db, 'nowPlaying');
  return onSnapshot(nowPlayingRef, (snapshot) => {
    const activity = {};
    snapshot.docs.forEach(doc => {
      activity[doc.id] = doc.data();
    });
    callback(activity);
  });
};

export const getUserPlaylists = async (userId) => {
  if (!hasValidConfig) {
    return mockPlaylists.filter(p => p.ownerId === userId);
  }
  
  const playlistsRef = collection(db, 'playlists');
  const q = query(playlistsRef, where('ownerId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Legacy mock function
export async function getMusic() {
  return [
    { id: '1', title: 'Summer Vibes', artist: 'Chill Out', emoji: '🎵' },
    { id: '2', title: 'Night Drive', artist: 'Synthwave', emoji: '🎶' },
  ];
}
