# 🔴 Real-time Chat & Voice Rooms - Socket.io Implementation

**Status:** Ready to Implement  
**Complexity:** Medium-High  
**Time Estimate:** 3-4 days

---

## 🎯 Quick Start

### 1. Install Dependencies

```bash
# Navigate to api folder
cd api
npm install socket.io

# Navigate to app folder
cd ../app
npm install socket.io-client
```

### 2. Server Setup

Create `api/socket-server.js`:

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());

// Track active users and connections
const activeUsers = new Map(); // Map<socketId, {userId, guildId}>
const userSockets = new Map(); // Map<userId, Set<socketId>>
const guildMembers = new Map(); // Map<guildId, Set<userId>>

// Connection handler
io.on('connection', (socket) => {
  console.log(`[SOCKET] New connection: ${socket.id}`);

  // User joins a guild
  socket.on('guild:join', (data) => {
    const { userId, guildId, username } = data;
    
    // Track this connection
    socket.join(`guild:${guildId}`);
    socket.userId = userId;
    socket.guildId = guildId;
    socket.username = username;

    // Update user tracking
    activeUsers.set(socket.id, { userId, guildId, username });
    
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    if (!guildMembers.has(guildId)) {
      guildMembers.set(guildId, new Set());
    }
    guildMembers.get(guildId).add(userId);

    // Notify others
    io.to(`guild:${guildId}`).emit('user:joined', {
      userId,
      username,
      timestamp: new Date(),
      onlineCount: guildMembers.get(guildId).size
    });

    // Send current online list to this user
    const onlineUsers = Array.from(guildMembers.get(guildId) || []);
    socket.emit('guild:online-users', onlineUsers);

    console.log(`[GUILD] ${username} joined guild ${guildId}`);
  });

  // Message sent
  socket.on('message:send', async (data) => {
    const { guildId, content, timestamp } = data;
    const userId = socket.userId;
    const username = socket.username;

    // Validate
    if (!guildId || !content || !userId) {
      socket.emit('error', 'Invalid message data');
      return;
    }

    // Rate limiting (simple: max 5 messages per second)
    if (!socket.messageCount) {
      socket.messageCount = 0;
      socket.lastMessageTime = Date.now();
    }
    
    const now = Date.now();
    if (now - socket.lastMessageTime > 1000) {
      socket.messageCount = 0;
      socket.lastMessageTime = now;
    }
    
    socket.messageCount++;
    if (socket.messageCount > 5) {
      socket.emit('error', 'Rate limit exceeded');
      return;
    }

    // Create message object
    const message = {
      id: Math.random().toString(36).substr(2, 9),
      guildId,
      userId,
      username,
      content: sanitizeInput(content),
      timestamp: timestamp || new Date(),
      reactions: []
    };

    // Save to database (future)
    // await db.messages.create(message);

    // Broadcast to guild
    io.to(`guild:${guildId}`).emit('message:new', message);
    console.log(`[MSG] ${username}: ${content.substring(0, 50)}`);
  });

  // Typing indicator
  socket.on('user:typing', (data) => {
    const { guildId, username } = data;
    
    if (!socket.typingTimeout) {
      socket.typingTimeout = {};
    }

    // Clear previous timeout
    if (socket.typingTimeout[guildId]) {
      clearTimeout(socket.typingTimeout[guildId]);
    }

    // Broadcast typing
    socket.to(`guild:${guildId}`).emit('user:typing', {
      userId: socket.userId,
      username
    });

    // Auto-stop typing after 3 seconds of inactivity
    socket.typingTimeout[guildId] = setTimeout(() => {
      socket.to(`guild:${guildId}`).emit('user:stopped-typing', {
        userId: socket.userId
      });
    }, 3000);
  });

  // Message reaction (emoji)
  socket.on('message:react', (data) => {
    const { guildId, messageId, emoji, userId } = data;

    io.to(`guild:${guildId}`).emit('message:reaction', {
      messageId,
      emoji,
      userId,
      username: socket.username
    });
  });

  // Voice room creation
  socket.on('voice-room:create', (data) => {
    const { roomId, roomName, guildId } = data;

    socket.join(`voice:${roomId}`);
    
    io.to(`guild:${guildId}`).emit('voice-room:created', {
      roomId,
      roomName,
      createdBy: socket.username,
      participantCount: 1
    });

    console.log(`[VOICE] Room ${roomName} created by ${socket.username}`);
  });

  // Join voice room
  socket.on('voice-room:join', (data) => {
    const { roomId, guildId } = data;

    socket.join(`voice:${roomId}`);
    socket.voiceRoomId = roomId;

    // Notify others in room
    io.to(`voice:${roomId}`).emit('voice-room:participant-joined', {
      userId: socket.userId,
      username: socket.username
    });
  });

  // WebRTC signaling
  socket.on('webrtc:offer', (data) => {
    const { roomId, offer, targetUserId } = data;

    // Send to specific peer
    const targetSocket = Array.from(userSockets.get(targetUserId) || [])
      .find(id => io.sockets.sockets.get(id)?.voiceRoomId === roomId);

    if (targetSocket) {
      io.to(targetSocket).emit('webrtc:offer', {
        offer,
        fromUserId: socket.userId,
        fromUsername: socket.username
      });
    }
  });

  socket.on('webrtc:answer', (data) => {
    const { roomId, answer, targetUserId } = data;

    const targetSocket = Array.from(userSockets.get(targetUserId) || [])
      .find(id => io.sockets.sockets.get(id)?.voiceRoomId === roomId);

    if (targetSocket) {
      io.to(targetSocket).emit('webrtc:answer', {
        answer,
        fromUserId: socket.userId
      });
    }
  });

  socket.on('webrtc:ice-candidate', (data) => {
    const { roomId, candidate, targetUserId } = data;

    const targetSocket = Array.from(userSockets.get(targetUserId) || [])
      .find(id => io.sockets.sockets.get(id)?.voiceRoomId === roomId);

    if (targetSocket) {
      io.to(targetSocket).emit('webrtc:ice-candidate', {
        candidate,
        fromUserId: socket.userId
      });
    }
  });

  // Leave voice room
  socket.on('voice-room:leave', (data) => {
    const { roomId } = data;

    socket.leave(`voice:${roomId}`);
    socket.voiceRoomId = null;

    io.to(`voice:${roomId}`).emit('voice-room:participant-left', {
      userId: socket.userId
    });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);

    if (user) {
      // Remove from user sockets
      const sockets = userSockets.get(user.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(user.userId);
        }
      }

      // Remove from guild members if last connection
      if (!userSockets.has(user.userId)) {
        const members = guildMembers.get(user.guildId);
        if (members) {
          members.delete(user.userId);
        }
      }

      // Notify guild
      io.to(`guild:${user.guildId}`).emit('user:left', {
        userId: user.userId,
        username: user.username,
        onlineCount: guildMembers.get(user.guildId)?.size || 0
      });

      console.log(`[SOCKET] ${user.username} disconnected`);
    }
  });

  // Error handler
  socket.on('error', (error) => {
    console.error(`[ERROR] ${socket.id}:`, error);
  });
});

// Utility: Sanitize input
function sanitizeInput(input) {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .substring(0, 1000); // Max 1000 chars
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    connectedUsers: activeUsers.size
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🔴 Socket.io server running on port ${PORT}`);
});

module.exports = { io, server };
```

---

## 📱 Client Setup

Create `app/src/services/socket.js`:

```javascript
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket = null;

export const initializeSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: {
      token: localStorage.getItem('sessionId')
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  });

  // Connection events
  socket.on('connect', () => {
    console.log('[SOCKET] Connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[SOCKET] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[SOCKET] Connection error:', error);
  });

  return socket;
};

// Guild operations
export const joinGuild = (userId, guildId, username) => {
  if (!socket) initializeSocket();
  socket.emit('guild:join', { userId, guildId, username });
};

export const onUserJoined = (callback) => {
  if (!socket) initializeSocket();
  socket.off('user:joined');
  socket.on('user:joined', callback);
};

export const onUserLeft = (callback) => {
  if (!socket) initializeSocket();
  socket.off('user:left');
  socket.on('user:left', callback);
};

export const getOnlineUsers = (callback) => {
  if (!socket) initializeSocket();
  socket.off('guild:online-users');
  socket.on('guild:online-users', callback);
};

// Chat operations
export const sendMessage = (guildId, content) => {
  if (!socket) initializeSocket();
  socket.emit('message:send', {
    guildId,
    content,
    timestamp: new Date()
  });
};

export const onNewMessage = (callback) => {
  if (!socket) initializeSocket();
  socket.off('message:new');
  socket.on('message:new', callback);
};

export const emitTyping = (guildId, username) => {
  if (!socket) initializeSocket();
  socket.emit('user:typing', { guildId, username });
};

export const onUserTyping = (callback) => {
  if (!socket) initializeSocket();
  socket.off('user:typing');
  socket.on('user:typing', callback);
};

export const onUserStoppedTyping = (callback) => {
  if (!socket) initializeSocket();
  socket.off('user:stopped-typing');
  socket.on('user:stopped-typing', callback);
};

export const reactToMessage = (guildId, messageId, emoji) => {
  if (!socket) initializeSocket();
  socket.emit('message:react', {
    guildId,
    messageId,
    emoji,
    userId: localStorage.getItem('userId')
  });
};

export const onMessageReaction = (callback) => {
  if (!socket) initializeSocket();
  socket.off('message:reaction');
  socket.on('message:reaction', callback);
};

// Voice room operations
export const createVoiceRoom = (roomId, roomName, guildId) => {
  if (!socket) initializeSocket();
  socket.emit('voice-room:create', { roomId, roomName, guildId });
};

export const onVoiceRoomCreated = (callback) => {
  if (!socket) initializeSocket();
  socket.off('voice-room:created');
  socket.on('voice-room:created', callback);
};

export const joinVoiceRoom = (roomId, guildId) => {
  if (!socket) initializeSocket();
  socket.emit('voice-room:join', { roomId, guildId });
};

export const onParticipantJoined = (callback) => {
  if (!socket) initializeSocket();
  socket.off('voice-room:participant-joined');
  socket.on('voice-room:participant-joined', callback);
};

export const leaveVoiceRoom = (roomId) => {
  if (!socket) initializeSocket();
  socket.emit('voice-room:leave', { roomId });
};

export const onParticipantLeft = (callback) => {
  if (!socket) initializeSocket();
  socket.off('voice-room:participant-left');
  socket.on('voice-room:participant-left', callback);
};

// WebRTC signaling
export const sendOffer = (roomId, offer, targetUserId) => {
  if (!socket) initializeSocket();
  socket.emit('webrtc:offer', { roomId, offer, targetUserId });
};

export const onOffer = (callback) => {
  if (!socket) initializeSocket();
  socket.off('webrtc:offer');
  socket.on('webrtc:offer', callback);
};

export const sendAnswer = (roomId, answer, targetUserId) => {
  if (!socket) initializeSocket();
  socket.emit('webrtc:answer', { roomId, answer, targetUserId });
};

export const onAnswer = (callback) => {
  if (!socket) initializeSocket();
  socket.off('webrtc:answer');
  socket.on('webrtc:answer', callback);
};

export const sendIceCandidate = (roomId, candidate, targetUserId) => {
  if (!socket) initializeSocket();
  socket.emit('webrtc:ice-candidate', { roomId, candidate, targetUserId });
};

export const onIceCandidate = (callback) => {
  if (!socket) initializeSocket();
  socket.off('webrtc:ice-candidate');
  socket.on('webrtc:ice-candidate', callback);
};

export const getSocket = () => {
  if (!socket) initializeSocket();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

---

## ⚛️ React Chat Component

Create `app/src/components/ChatWindow.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  joinGuild,
  sendMessage,
  onNewMessage,
  onUserTyping,
  onUserStoppedTyping,
  emitTyping,
  reactToMessage
} from '../services/socket';
import '../styles/Chat.css';

export const ChatWindow = ({ guildId, userId, username }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket and join guild
  useEffect(() => {
    joinGuild(userId, guildId, username);

    // Listen for new messages
    onNewMessage((message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    // Listen for typing
    onUserTyping(({ userId, username }) => {
      setTypingUsers(prev => new Set([...prev, username]));
    });

    onUserStoppedTyping(({ userId }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
    });

    return () => {
      // Cleanup
    };
  }, [guildId, userId, username]);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Emit typing event
    emitTyping(guildId, username);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
    }, 1000);
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (input.trim()) {
      sendMessage(guildId, input);
      setInput('');
    }
  };

  // Handle emoji reaction
  const handleReaction = (messageId, emoji) => {
    reactToMessage(guildId, messageId, emoji);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Guild Chat</h2>
        <span className="online-count">🟢 {onlineCount} online</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} className="message">
              <div className="message-header">
                <strong>{msg.username}</strong>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="message-reactions">
                  {msg.reactions.map((react, i) => (
                    <span key={i} className="reaction">
                      {react.emoji}
                    </span>
                  ))}
                </div>
              )}
              <div className="message-actions">
                <button
                  className="reaction-btn"
                  onClick={() => handleReaction(msg.id, '👍')}
                  title="Like"
                >
                  👍
                </button>
                <button
                  className="reaction-btn"
                  onClick={() => handleReaction(msg.id, '❤️')}
                  title="Love"
                >
                  ❤️
                </button>
                <button
                  className="reaction-btn"
                  onClick={() => handleReaction(msg.id, '😂')}
                  title="Laugh"
                >
                  😂
                </button>
              </div>
            </div>
          ))
        )}

        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            <p>
              {Array.from(typingUsers).join(', ')}
              {typingUsers.size === 1 ? ' is' : ' are'} typing...
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="chat-input"
          maxLength={1000}
        />
        <button type="submit" className="send-btn" disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
```

---

## 🎤 Voice Room Component

Create `app/src/components/VoiceRoom.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';
import {
  createVoiceRoom,
  joinVoiceRoom,
  leaveVoiceRoom,
  onParticipantJoined,
  onParticipantLeft,
  sendOffer,
  onOffer,
  sendAnswer,
  onAnswer,
  sendIceCandidate,
  onIceCandidate
} from '../services/socket';
import '../styles/VoiceRoom.css';

export const VoiceRoom = ({ roomId, guildId, userId, username }) => {
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const localVideoRef = useRef(null);

  // Get user media
  const getMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideoEnabled
      });
      setLocalStream(stream);

      if (localVideoRef.current && isVideoEnabled) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('Failed to get media:', err);
    }
  };

  // Initialize voice room
  useEffect(() => {
    getMediaStream();
    joinVoiceRoom(roomId, guildId);

    // Handle new participant
    onParticipantJoined(({ userId: newUserId, username: newUsername }) => {
      if (newUserId !== userId && localStream) {
        // Create peer connection
        const peer = new SimplePeer({
          initiator: true,
          stream: localStream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        peer.on('signal', (offer) => {
          sendOffer(roomId, offer, newUserId);
        });

        peer.on('stream', (stream) => {
          console.log('Got remote stream');
        });

        peer.on('error', (err) => {
          console.error('Peer error:', err);
        });

        setPeers(prev => ({ ...prev, [newUserId]: peer }));
      }
    });

    // Handle offer from new participant
    onOffer(({ offer, fromUserId, fromUsername }) => {
      if (!(fromUserId in peers) && localStream) {
        const peer = new SimplePeer({
          initiator: false,
          stream: localStream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        peer.signal(offer);

        peer.on('signal', (answer) => {
          sendAnswer(roomId, answer, fromUserId);
        });

        peer.on('error', (err) => {
          console.error('Peer error:', err);
        });

        setPeers(prev => ({ ...prev, [fromUserId]: peer }));
      }
    });

    // Handle answer
    onAnswer(({ answer, fromUserId }) => {
      if (fromUserId in peers) {
        peers[fromUserId].signal(answer);
      }
    });

    // Handle ICE candidate
    onIceCandidate(({ candidate, fromUserId }) => {
      if (fromUserId in peers) {
        peers[fromUserId].signal(candidate);
      }
    });

    // Handle participant left
    onParticipantLeft(({ userId: leftUserId }) => {
      if (leftUserId in peers) {
        peers[leftUserId].destroy();
        setPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[leftUserId];
          return newPeers;
        });
      }
    });

    return () => {
      // Cleanup
      localStream?.getTracks().forEach(track => track.stop());
      Object.values(peers).forEach(peer => peer.destroy());
      leaveVoiceRoom(roomId);
    };
  }, [roomId, guildId, userId, username, localStream, isVideoEnabled]);

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  return (
    <div className="voice-room">
      <div className="video-grid">
        {isVideoEnabled && (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="local-video"
          />
        )}
        {Object.entries(peers).map(([peerId, peer]) => (
          <RemoteVideo key={peerId} peer={peer} />
        ))}
      </div>

      <div className="voice-controls">
        <button
          className={`control-btn ${isAudioEnabled ? 'active' : ''}`}
          onClick={toggleAudio}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          🎤
        </button>
        <button
          className={`control-btn ${isVideoEnabled ? 'active' : ''}`}
          onClick={toggleVideo}
          title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
        >
          📹
        </button>
        <button
          className="control-btn leave"
          onClick={() => leaveVoiceRoom(roomId)}
          title="Leave Room"
        >
          ❌
        </button>
      </div>
    </div>
  );
};

const RemoteVideo = ({ peer }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    peer.on('stream', (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, [peer]);

  return <video ref={videoRef} autoPlay className="remote-video" />;
};

export default VoiceRoom;
```

---

## 📝 CSS Styling

Create `app/src/styles/Chat.css`:

```css
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.online-count {
  font-size: 0.9rem;
  opacity: 0.9;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.message {
  background: white;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.message-header strong {
  color: #667eea;
}

.timestamp {
  color: #999;
  font-size: 0.8rem;
}

.message-content {
  color: #333;
  word-wrap: break-word;
}

.message-reactions {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.reaction {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.message-actions {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.reaction-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.reaction-btn:hover {
  opacity: 1;
}

.typing-indicator {
  font-style: italic;
  color: #999;
  padding: 0.5rem;
  text-align: center;
}

.chat-input-form {
  display: flex;
  padding: 1rem;
  background: white;
  border-top: 1px solid #eee;
  gap: 0.5rem;
}

.chat-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: none;
}

.chat-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.send-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

Create `app/src/styles/VoiceRoom.css`:

```css
.voice-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.video-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  overflow: auto;
}

.local-video,
.remote-video {
  width: 100%;
  height: 100%;
  background: #333;
  border-radius: 8px;
  object-fit: cover;
}

.voice-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid #333;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #333;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: #444;
}

.control-btn.active {
  background: #667eea;
}

.control-btn.leave {
  background: #e74c3c;
}

.control-btn.leave:hover {
  background: #c0392b;
}
```

---

## 🚀 Integration Checklist

- [ ] Install Socket.io dependencies
- [ ] Set up socket server in api folder
- [ ] Create socket.js service in app folder
- [ ] Create ChatWindow component
- [ ] Create VoiceRoom component
- [ ] Add CSS styling
- [ ] Test message sending
- [ ] Test typing indicators
- [ ] Test voice room creation
- [ ] Test WebRTC connections
- [ ] Add database persistence
- [ ] Deploy to production

---

## 🧪 Testing Socket.io

```bash
# In one terminal: Start socket server
cd api
node socket-server.js

# In another terminal: Start Vite dev server
cd app
npm run dev

# Open localhost:5173 in multiple browser windows
# Join same guild and test chat
```

---

**Ready to implement real-time magic! 🚀**
