# 🎮 Phase 2: Community Features - Implementation Guide

**Timeline:** Weeks 2-3  
**Status:** Ready to Build  
**Previous Phase:** Phase 1 ✅ Complete (MVP)

---

## 🎯 Phase 2 Overview

Build the social and gamification engine that keeps users engaged daily.

**Key Features:**
- Guilds & Communities
- Posts & Social Feed
- Missions & Gamification (streaks, badges, leaderboards)
- Real-time Chat
- Voice/Video Rooms
- Creator Studio (basic)

**Tech Stack Additions:**
- Socket.io (real-time comms)
- WebRTC (voice/video)
- Redis (caching, sessions)
- Message queue (Bull)

---

## 📋 Week 2-3 Breakdown

### Week 2: Foundation
- Community database schema
- Guild CRUD endpoints
- Posts & feed database
- Real-time chat setup

### Week 3: Features
- Missions system
- Streaks tracking
- Badge system
- Leaderboards
- Voice rooms setup

---

## 1️⃣ Feature: Guilds & Communities

### Database Schema

```sql
-- Guilds table
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  banner_url TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  visibility VARCHAR(20) DEFAULT 'public',
  members_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name)
);

-- Guild members table
CREATE TABLE guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);

-- Guild posts table
CREATE TABLE guild_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Guild roles table
CREATE TABLE guild_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  permissions TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

**Guilds**
```
POST   /api/guilds                 - Create guild
GET    /api/guilds                 - List guilds (paginated, searchable)
GET    /api/guilds/:id             - Get guild details
PUT    /api/guilds/:id             - Update guild
DELETE /api/guilds/:id             - Delete guild (owner only)
```

**Guild Members**
```
POST   /api/guilds/:id/members     - Join guild
DELETE /api/guilds/:id/members/:userId - Leave guild
GET    /api/guilds/:id/members     - List members
PUT    /api/guilds/:id/members/:userId - Update member role
```

**Guild Posts**
```
POST   /api/guilds/:id/posts       - Create post
GET    /api/guilds/:id/posts       - Get guild posts (feed)
PUT    /api/posts/:postId          - Update post
DELETE /api/posts/:postId          - Delete post
POST   /api/posts/:postId/like     - Like post
```

### Frontend Components

```
GuildBrowser/
├── GuildList.jsx          - Browse guilds
├── GuildCard.jsx          - Individual guild card
├── GuildDetail.jsx        - Guild profile page
├── GuildCreate.jsx        - Create new guild
├── GuildMembers.jsx       - Members list
├── GuildFeed.jsx          - Posts feed
└── PostCreate.jsx         - Post editor

Context:
└── GuildContext.jsx       - Guild state management
```

---

## 2️⃣ Feature: Missions & Gamification

### Database Schema

```sql
-- Missions table
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  difficulty VARCHAR(20),
  xp_reward INT,
  litbit_reward INT,
  duration_days INT,
  recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User mission progress
CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active',
  progress INT DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Streaks table
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  current_count INT DEFAULT 1,
  best_count INT DEFAULT 1,
  last_completed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User badges table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Leaderboards table
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  xp_total INT DEFAULT 0,
  missions_completed INT DEFAULT 0,
  rank INT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Gamification Mechanics

```
Daily Missions (5 XP each)
├─ Log in (1 XP)
├─ Create post (2 XP)
├─ Complete guild mission (3 XP)
├─ Help community member (4 XP)
└─ Daily reward (5 XP)

Weekly Missions
├─ Join guild
├─ Earn 50 XP
├─ Help 3 members
└─ Complete advanced mission

Streaks
├─ Login streak
├─ Post streak
├─ Mission completion streak
└─ Bonus: 7-day = 2x XP

Badges
├─ First Post
├─ Guild Founder
├─ 100 Posts
├─ 10 Day Streak
├─ Community Helper
└─ Level Milestones (10, 25, 50)
```

### API Endpoints

```
GET    /api/missions              - List available missions
POST   /api/missions/:id/start    - Start mission
PUT    /api/missions/:id/progress - Update progress
POST   /api/missions/:id/complete - Complete mission

GET    /api/streaks              - Get user streaks
PUT    /api/streaks/:type        - Update streak

GET    /api/leaderboard          - Global leaderboard
GET    /api/leaderboard/guild/:id - Guild leaderboard
GET    /api/leaderboard/friends   - Friends leaderboard

GET    /api/badges               - Get user badges
```

### Frontend Components

```
Missions/
├── MissionList.jsx      - Available missions
├── MissionCard.jsx      - Mission details
├── MissionProgress.jsx  - Progress tracker
└── MissionRewards.jsx   - Reward preview

Gamification/
├── StreakDisplay.jsx    - Show streaks
├── BadgeCollection.jsx  - Badge showcase
├── Leaderboard.jsx      - Global/guild leaderboards
└── AchievementNotice.jsx - Notification system
```

---

## 3️⃣ Feature: Real-time Chat

### Socket.io Setup

Install dependencies:
```bash
npm install socket.io socket.io-client
```

Backend `api/services/socket.js`:

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins
  socket.on('user:join', (userId, guildId) => {
    socket.join(`guild:${guildId}`);
    activeUsers.set(socket.id, { userId, guildId });
    
    io.to(`guild:${guildId}`).emit('user:joined', {
      userId,
      timestamp: new Date()
    });
  });

  // Message sent
  socket.on('message:send', async (data) => {
    const { guildId, content, userId } = data;
    
    // Save to database
    const message = await saveMessage(guildId, userId, content);
    
    // Broadcast to guild
    io.to(`guild:${guildId}`).emit('message:new', message);
  });

  // Typing indicator
  socket.on('user:typing', (guildId, userId) => {
    io.to(`guild:${guildId}`).emit('user:typing', userId);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);
    
    if (user) {
      io.to(`guild:${user.guildId}`).emit('user:left', user.userId);
    }
  });
});

module.exports = io;
```

Frontend `app/src/services/chat.js`:

```javascript
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL, {
  auth: {
    token: localStorage.getItem('sessionId')
  }
});

export const joinChat = (userId, guildId) => {
  socket.emit('user:join', userId, guildId);
};

export const sendMessage = (guildId, content) => {
  socket.emit('message:send', {
    guildId,
    content,
    userId: localStorage.getItem('userId')
  });
};

export const onNewMessage = (callback) => {
  socket.on('message:new', callback);
};

export const onUserTyping = (callback) => {
  socket.on('user:typing', callback);
};

export default socket;
```

### Frontend Chat Component

```
Chat/
├── ChatWindow.jsx       - Main chat interface
├── MessageList.jsx      - Messages display
├── MessageInput.jsx     - Text input
├── TypingIndicator.jsx  - Show who's typing
├── UserList.jsx         - Online users
└── ChatContext.jsx      - Chat state management
```

---

## 4️⃣ Feature: Voice/Video Rooms

### WebRTC Setup

Install dependencies:
```bash
npm install simple-peer
```

Backend room management:

```javascript
const rooms = new Map();

socket.on('room:create', (roomId, roomName) => {
  rooms.set(roomId, {
    id: roomId,
    name: roomName,
    participants: new Set(),
    createdAt: new Date()
  });
  
  socket.join(`room:${roomId}`);
  io.emit('room:available', Array.from(rooms.values()));
});

socket.on('room:join', (roomId, userId) => {
  const room = rooms.get(roomId);
  if (room) {
    room.participants.add(userId);
    socket.join(`room:${roomId}`);
    
    io.to(`room:${roomId}`).emit('participant:joined', userId);
  }
});

socket.on('webrtc:offer', (data) => {
  io.to(`room:${data.roomId}`).emit('webrtc:offer', data);
});

socket.on('webrtc:answer', (data) => {
  io.to(`room:${data.roomId}`).emit('webrtc:answer', data);
});

socket.on('webrtc:ice-candidate', (data) => {
  io.to(`room:${data.roomId}`).emit('webrtc:ice-candidate', data);
});
```

Frontend component:

```
VoiceRoom/
├── RoomBrowser.jsx      - Browse available rooms
├── RoomCreate.jsx       - Create voice room
├── VoiceChat.jsx        - Voice/video interface
├── PeerConnection.jsx   - WebRTC peer handling
└── ParticipantGrid.jsx  - Video grid display
```

---

## 5️⃣ Feature: Creator Studio (Basic)

### Capabilities

```
Post Editor
├─ Text formatting
├─ Image upload
├─ Link preview
├─ Draft saving
└─ Schedule posting

Analytics
├─ View count
├─ Engagement metrics
├─ Peak times
└─ Audience demographics

Publishing
├─ Publish to guild
├─ Publish to marketplace
├─ Share to social
└─ Pin post
```

### Database Schema

```sql
CREATE TABLE creator_drafts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT,
  media_urls TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE creator_analytics (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES guild_posts(id),
  views INT DEFAULT 0,
  engagements INT DEFAULT 0,
  shares INT DEFAULT 0,
  updated_at TIMESTAMP
);
```

---

## 📊 Implementation Timeline

### Day 1-2: Database Setup
- [ ] Create all Phase 2 tables
- [ ] Run migrations
- [ ] Create indexes
- [ ] Set up connection pooling

### Day 3-4: Guild System
- [ ] CRUD endpoints
- [ ] Frontend components
- [ ] Guild context/state
- [ ] Testing

### Day 5-6: Missions & Gamification
- [ ] Mission endpoints
- [ ] Badge system
- [ ] Leaderboard logic
- [ ] Frontend components

### Day 7-9: Real-time Chat
- [ ] Socket.io setup
- [ ] Message persistence
- [ ] Chat components
- [ ] Typing indicators

### Day 10-12: Voice Rooms
- [ ] WebRTC setup
- [ ] Room management
- [ ] Voice components
- [ ] Testing

### Day 13-14: Polish & Testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security review
- [ ] User testing

---

## 🧪 Testing Strategy

### Unit Tests
```bash
npm run test -- --coverage
```

### Integration Tests
```bash
# Test guild creation
# Test message sending
# Test mission completion
# Test chat socket events
```

### Manual Testing
```
1. Create guild
2. Join guild
3. Post in guild
4. Complete mission
5. Join voice chat
6. Check leaderboard
```

---

## 🚀 Rollout Strategy

### Week 2 Beta (Internal)
- Test with team members
- Gather feedback
- Fix bugs

### Week 3 Beta (External)
- 100 beta users
- Collect analytics
- Iterate based on feedback

### Week 4 Launch
- Production deployment
- Monitor metrics
- Support users

---

## 📈 Success Metrics

### Week 2-3 Goals
```
✓ Guild creation: 20+ guilds
✓ Active members: 100+ daily active
✓ Chat messages: 500+ per day
✓ Mission completion: 80%+ of users
✓ Voice rooms: 10+ concurrent users
```

### Ongoing KPIs
```
✓ DAU growth: 2x per week
✓ Chat engagement: 50%+ of users
✓ Mission completion rate: >70%
✓ Guild retention: >80% after 7 days
✓ Voice room usage: Growing 10% weekly
```

---

## 🔐 Security Considerations

- [ ] Validate guild permissions
- [ ] Rate limit chat messages
- [ ] Sanitize user input
- [ ] Encrypt voice streams
- [ ] Validate WebRTC connections
- [ ] Audit database access

---

## 📞 Questions?

See:
- [FULL_IMPLEMENTATION_GUIDE.md](./FULL_IMPLEMENTATION_GUIDE.md) - Phase overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Database setup
- [Phase 1 docs](./PHASE1_IMPLEMENTATION.md) - Reference existing patterns

---

**Ready to build Phase 2? Let's create the most engaging community platform! 🚀**
