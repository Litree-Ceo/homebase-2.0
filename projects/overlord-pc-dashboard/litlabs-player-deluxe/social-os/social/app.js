// ============================================
// LiTreeLabStudio LiTreeLabStudio SOCIAL - Advanced Social Features
// Full Social Network with Messaging, Friends, Stories, Groups, Events
// ============================================

// ================== STATE MANAGEMENT ==================
let currentUser = null;
let posts = [];
let stories = [];
let friends = [];
let friendRequests = [];
let messages = [];
let groups = [];
let events = [];
let notifications = [];
let marketplace = [];
let authMode = 'login';

// ================== INITIALIZATION ==================
document.addEventListener('DOMContentLoaded', () => {
    loadLocalUser();
    loadAllData();
    updateAuthUI();
    renderFeed();
    updateNotificationBadge();
    setupRealtimeUpdates();
    checkExpiredStories();
});

// ================== AUTHENTICATION ==================
function toggleAuth() {
    const modal = document.getElementById('authModal');
    if (currentUser) {
        if (confirm('Sign out from The Grid?')) {
            currentUser = null;
            localStorage.removeItem('LiTreeLabStudio_user');
            location.reload();
        }
    } else {
        modal?.classList.add('active');
    }
}

function closeAuthModal() {
    document.getElementById('authModal')?.classList.remove('active');
}

function toggleAuthMode() {
    authMode = authMode === 'login' ? 'signup' : 'login';
    const usernameField = document.getElementById('authUsername');
    const submitBtn = document.getElementById('authSubmitBtn');
    const title = document.getElementById('authTitle');
    const toggleText = document.getElementById('authToggleText');
    const toggleLink = document.getElementById('authToggleLink');
    
    if (authMode === 'signup') {
        usernameField.style.display = 'block';
        submitBtn.textContent = 'Sign Up';
        title.textContent = 'Join The Grid';
        toggleText.textContent = 'Already have an account?';
        toggleLink.textContent = 'Login';
    } else {
        usernameField.style.display = 'none';
        submitBtn.textContent = 'Login';
        title.textContent = 'Enter The Grid';
        toggleText.textContent = "Don't have an account?";
        toggleLink.textContent = 'Sign up';
    }
}

function handleAuth() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const username = document.getElementById('authUsername').value.trim();
    
    if (!email || !password) {
        alert('Email and password required');
        return;
    }
    
    if (authMode === 'signup' && !username) {
        alert('Username required for signup');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('LiTreeLabStudio_users') || '{}');
    
    if (authMode === 'signup') {
        if (users[email]) {
            alert('User already exists');
            return;
        }
        users[email] = { password, username, joinDate: Date.now(), bio: '', location: '', website: '' };
        localStorage.setItem('LiTreeLabStudio_users', JSON.stringify(users));
        currentUser = { 
            uid: 'user_' + Date.now(), 
            email, 
            username,
            bio: '',
            location: '',
            website: '',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            coverPhoto: 'https://source.unsplash.com/1200x400/?technology,cyber'
        };
    } else {
        if (!users[email] || users[email].password !== password) {
            alert('Invalid credentials');
            return;
        }
        currentUser = { 
            uid: 'user_' + email.replace(/[^a-z0-9]/gi, ''), 
            email, 
            username: users[email].username,
            bio: users[email].bio || '',
            location: users[email].location || '',
            website: users[email].website || '',
            avatar: users[email].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${users[email].username}`,
            coverPhoto: users[email].coverPhoto || 'https://source.unsplash.com/1200x400/?technology,cyber'
        };
    }
    
    localStorage.setItem('LiTreeLabStudio_user', JSON.stringify(currentUser));
    closeAuthModal();
    location.reload();
}

function loadLocalUser() {
    const stored = localStorage.getItem('LiTreeLabStudio_user');
    if (stored) {
        currentUser = JSON.parse(stored);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    if (currentUser && authBtn) {
        authBtn.textContent = '🚪 Logout';
    }
}

// ================== POSTS & REACTIONS ==================
const REACTIONS = {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠'
};

function createPost() {
    const content = document.getElementById('postContent')?.value.trim();
    const privacy = document.getElementById('postPrivacy')?.value || 'public';
    
    if (!content) {
        alert('Post content cannot be empty');
        return;
    }
    
    if (!currentUser) {
        alert('Please login to post');
        toggleAuth();
        return;
    }
    
    const post = {
        id: 'post_' + Date.now(),
        author: currentUser.username,
        authorId: currentUser.uid,
        authorAvatar: currentUser.avatar,
        content: content,
        timestamp: Date.now(),
        reactions: {},
        comments: [],
        shares: 0,
        privacy: privacy,
        media: []
    };
    
    posts.unshift(post);
    savePosts();
    renderFeed();
    
    document.getElementById('postContent').value = '';
    addNotification('You created a new post', 'post', post.id);
}

function reactToPost(postId, reaction) {
    if (!currentUser) {
        alert('Please login to react');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    if (!post.reactions) post.reactions = {};
    if (!post.reactions[reaction]) post.reactions[reaction] = [];
    
    const userId = currentUser.uid;
    
    // Remove from all other reactions
    Object.keys(post.reactions).forEach(r => {
        const index = post.reactions[r].indexOf(userId);
        if (index > -1) post.reactions[r].splice(index, 1);
    });
    
    // Add to selected reaction
    if (!post.reactions[reaction].includes(userId)) {
        post.reactions[reaction].push(userId);
    }
    
    savePosts();
    renderFeed();
}

function addComment(postId) {
    if (!currentUser) {
        alert('Please login to comment');
        return;
    }
    
    const comment = prompt('Enter your comment:');
    if (!comment || !comment.trim()) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const commentObj = {
        id: 'comment_' + Date.now(),
        author: currentUser.username,
        authorId: currentUser.uid,
        authorAvatar: currentUser.avatar,
        content: comment.trim(),
        timestamp: Date.now(),
        reactions: {},
        replies: []
    };
    
    post.comments.push(commentObj);
    savePosts();
    renderFeed();
    
    // Notify post author
    if (post.authorId !== currentUser.uid) {
        addNotification(`${currentUser.username} commented on your post`, 'comment', postId, post.authorId);
    }
}

function replyToComment(postId, commentId) {
    if (!currentUser) {
        alert('Please login to reply');
        return;
    }
    
    const reply = prompt('Enter your reply:');
    if (!reply || !reply.trim()) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return;
    
    const replyObj = {
        id: 'reply_' + Date.now(),
        author: currentUser.username,
        authorId: currentUser.uid,
        authorAvatar: currentUser.avatar,
        content: reply.trim(),
        timestamp: Date.now()
    };
    
    if (!comment.replies) comment.replies = [];
    comment.replies.push(replyObj);
    
    savePosts();
    renderFeed();
    
    // Notify comment author
    if (comment.authorId !== currentUser.uid) {
        addNotification(`${currentUser.username} replied to your comment`, 'reply', postId, comment.authorId);
    }
}

function sharePost(postId) {
    if (!currentUser) {
        alert('Please login to share');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const shareText = prompt('Add a message (optional):');
    
    const sharedPost = {
        id: 'post_' + Date.now(),
        author: currentUser.username,
        authorId: currentUser.uid,
        authorAvatar: currentUser.avatar,
        content: shareText || '',
        timestamp: Date.now(),
        reactions: {},
        comments: [],
        shares: 0,
        privacy: 'public',
        sharedPost: {
            originalAuthor: post.author,
            originalContent: post.content,
            originalTimestamp: post.timestamp
        }
    };
    
    posts.unshift(sharedPost);
    post.shares = (post.shares || 0) + 1;
    savePosts();
    renderFeed();
    
    alert('Post shared!');
}

function deletePost(postId) {
    if (!confirm('Delete this post?')) return;
    
    const index = posts.findIndex(p => p.id === postId);
    if (index > -1) {
        posts.splice(index, 1);
        savePosts();
        renderFeed();
    }
}

function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || post.authorId !== currentUser?.uid) return;
    
    const newContent = prompt('Edit your post:', post.content);
    if (newContent && newContent.trim()) {
        post.content = newContent.trim();
        post.edited = true;
        savePosts();
        renderFeed();
    }
}

// ================== STORIES ==================
function createStory() {
    if (!currentUser) {
        alert('Please login to create a story');
        return;
    }
    
    const content = prompt('What\'s on your mind? (Story will disappear in 24 hours)');
    if (!content || !content.trim()) return;
    
    const story = {
        id: 'story_' + Date.now(),
        author: currentUser.username,
        authorId: currentUser.uid,
        authorAvatar: currentUser.avatar,
        content: content.trim(),
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        views: []
    };
    
    stories.unshift(story);
    saveStories();
    renderStories();
}

function viewStory(storyId) {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    
    if (currentUser && !story.views.includes(currentUser.uid)) {
        story.views.push(currentUser.uid);
        saveStories();
    }
    
    const modal = document.createElement('div');
    modal.className = 'story-modal';
    modal.innerHTML = `
        <div class="story-content">
            <div class="story-header">
                <img src="${story.authorAvatar}" alt="${story.author}" class="avatar">
                <div>
                    <div class="story-author">${story.author}</div>
                    <div class="story-time">${getTimeAgo(story.timestamp)}</div>
                </div>
                <button class="close-btn" onclick="this.closest('.story-modal').remove()">✕</button>
            </div>
            <div class="story-body">${escapeHtml(story.content)}</div>
            <div class="story-footer">
                <div class="story-views">👁️ ${story.views.length} views</div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function checkExpiredStories() {
    const now = Date.now();
    stories = stories.filter(s => s.expiresAt > now);
    saveStories();
    setInterval(() => {
        const beforeCount = stories.length;
        stories = stories.filter(s => s.expiresAt > now);
        if (stories.length !== beforeCount) {
            saveStories();
            renderStories();
        }
    }, 60000); // Check every minute
}

// ================== FRIENDS SYSTEM ==================
function sendFriendRequest(userId) {
    if (!currentUser) {
        alert('Please login to send friend requests');
        return;
    }
    
    if (friends.find(f => f.id === userId)) {
        alert('Already friends!');
        return;
    }
    
    const existingRequest = friendRequests.find(r => 
        r.from === currentUser.uid && r.to === userId
    );
    
    if (existingRequest) {
        alert('Friend request already sent!');
        return;
    }
    
    const request = {
        id: 'req_' + Date.now(),
        from: currentUser.uid,
        fromName: currentUser.username,
        fromAvatar: currentUser.avatar,
        to: userId,
        timestamp: Date.now()
    };
    
    friendRequests.push(request);
    saveFriendRequests();
    addNotification(`${currentUser.username} sent you a friend request`, 'friend_request', request.id, userId);
    alert('Friend request sent!');
}

function acceptFriendRequest(requestId) {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;
    
    friends.push({
        id: request.from,
        name: request.fromName,
        avatar: request.fromAvatar,
        since: Date.now()
    });
    
    friendRequests = friendRequests.filter(r => r.id !== requestId);
    saveFriends();
    saveFriendRequests();
    renderFriends();
    addNotification(`${currentUser.username} accepted your friend request`, 'friend_accept', currentUser.uid, request.from);
    alert('Friend request accepted!');
}

function declineFriendRequest(requestId) {
    friendRequests = friendRequests.filter(r => r.id !== requestId);
    saveFriendRequests();
    renderFriendRequests();
}

function unfriend(friendId) {
    if (!confirm('Remove this friend?')) return;
    
    friends = friends.filter(f => f.id !== friendId);
    saveFriends();
    renderFriends();
}

function renderFriends() {
    const container = document.getElementById('friendsList');
    if (!container) return;
    
    if (friends.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8899aa">No friends yet. Send some friend requests!</p>';
        return;
    }
    
    container.innerHTML = friends.map(friend => `
        <div class="friend-card">
            <img src="${friend.avatar}" alt="${friend.name}" class="avatar">
            <div class="friend-info">
                <div class="friend-name">${friend.name}</div>
                <div class="friend-since">Friends since ${new Date(friend.since).toLocaleDateString()}</div>
            </div>
            <button class="btn-secondary" onclick="sendMessage('${friend.id}')">💬 Message</button>
            <button class="btn-danger" onclick="unfriend('${friend.id}')">✕</button>
        </div>
    `).join('');
}

function renderFriendRequests() {
    const container = document.getElementById('friendRequestsList');
    if (!container) return;
    
    const myRequests = friendRequests.filter(r => r.to === currentUser?.uid);
    
    if (myRequests.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8899aa">No pending friend requests</p>';
        return;
    }
    
    container.innerHTML = myRequests.map(req => `
        <div class="friend-request">
            <img src="${req.fromAvatar}" alt="${req.fromName}" class="avatar">
            <div class="friend-info">
                <div class="friend-name">${req.fromName}</div>
                <div class="friend-time">${getTimeAgo(req.timestamp)}</div>
            </div>
            <button class="btn-primary" onclick="acceptFriendRequest('${req.id}')">Accept</button>
            <button class="btn-secondary" onclick="declineFriendRequest('${req.id}')">Decline</button>
        </div>
    `).join('');
}

// ================== MESSAGING ==================
function sendMessage(toUserId, content = null) {
    if (!currentUser) {
        alert('Please login to send messages');
        return;
    }
    
    const messageContent = content || prompt('Enter your message:');
    if (!messageContent || !messageContent.trim()) return;
    
    const message = {
        id: 'msg_' + Date.now(),
        from: currentUser.uid,
        fromName: currentUser.username,
        fromAvatar: currentUser.avatar,
        to: toUserId,
        content: messageContent.trim(),
        timestamp: Date.now(),
        read: false
    };
    
    messages.push(message);
    saveMessages();
    addNotification(`New message from ${currentUser.username}`, 'message', message.id, toUserId);
    alert('Message sent!');
}

function renderMessages() {
    const container = document.getElementById('messagesList');
    if (!container || !currentUser) return;
    
    const myMessages = messages.filter(m => 
        m.from === currentUser.uid || m.to === currentUser.uid
    );
    
    if (myMessages.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8899aa">No messages yet</p>';
        return;
    }
    
    // Group by conversation
    const conversations = {};
    myMessages.forEach(msg => {
        const otherUser = msg.from === currentUser.uid ? msg.to : msg.from;
        if (!conversations[otherUser]) conversations[otherUser] = [];
        conversations[otherUser].push(msg);
    });
    
    container.innerHTML = Object.entries(conversations).map(([userId, msgs]) => {
        const lastMsg = msgs[msgs.length - 1];
        const unread = msgs.filter(m => m.to === currentUser.uid && !m.read).length;
        
        return `
            <div class="message-preview" onclick="openConversation('${userId}')">
                <img src="${lastMsg.fromAvatar}" alt="${lastMsg.fromName}" class="avatar">
                <div class="message-info">
                    <div class="message-name">${lastMsg.fromName}</div>
                    <div class="message-text">${lastMsg.content.substring(0, 50)}...</div>
                </div>
                ${unread > 0 ? `<span class="message-badge">${unread}</span>` : ''}
                <div class="message-time">${getTimeAgo(lastMsg.timestamp)}</div>
            </div>
        `;
    }).join('');
}

// ================== GROUPS ==================
function createGroup() {
    if (!currentUser) {
        alert('Please login to create a group');
        return;
    }
    
    const name = prompt('Group name:');
    if (!name || !name.trim()) return;
    
    const description = prompt('Group description (optional):');
    
    const group = {
        id: 'group_' + Date.now(),
        name: name.trim(),
        description: description?.trim() || '',
        creator: currentUser.uid,
        creatorName: currentUser.username,
        members: [currentUser.uid],
        admins: [currentUser.uid],
        posts: [],
        created: Date.now(),
        privacy: 'public'
    };
    
    groups.push(group);
    saveGroups();
    renderGroups();
    alert('Group created!');
}

function joinGroup(groupId) {
    if (!currentUser) {
        alert('Please login to join groups');
        return;
    }
    
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    if (group.members.includes(currentUser.uid)) {
        alert('You\'re already a member!');
        return;
    }
    
    group.members.push(currentUser.uid);
    saveGroups();
    renderGroups();
    alert('Joined group!');
}

function leaveGroup(groupId) {
    if (!confirm('Leave this group?')) return;
    
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    group.members = group.members.filter(m => m !== currentUser?.uid);
    saveGroups();
    renderGroups();
}

// ================== EVENTS ==================
function createEvent() {
    if (!currentUser) {
        alert('Please login to create events');
        return;
    }
    
    const title = prompt('Event name:');
    if (!title || !title.trim()) return;
    
    const date = prompt('Event date (MM/DD/YYYY):');
    if (!date) return;
    
    const location = prompt('Location:');
    const description = prompt('Description (optional):');
    
    const event = {
        id: 'event_' + Date.now(),
        title: title.trim(),
        date: date,
        location: location?.trim() || 'TBD',
        description: description?.trim() || '',
        creator: currentUser.uid,
        creatorName: currentUser.username,
        going: [currentUser.uid],
        interested: [],
        notGoing: [],
        created: Date.now()
    };
    
    events.push(event);
    saveEvents();
    renderEvents();
    alert('Event created!');
}

function rsvpEvent(eventId, status) {
    if (!currentUser) {
        alert('Please login to RSVP');
        return;
    }
    
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    // Remove from all lists
    event.going = event.going.filter(u => u !== currentUser.uid);
    event.interested = event.interested.filter(u => u !== currentUser.uid);
    event.notGoing = event.notGoing.filter(u => u !== currentUser.uid);
    
    // Add to selected list
    if (status === 'going') event.going.push(currentUser.uid);
    else if (status === 'interested') event.interested.push(currentUser.uid);
    else if (status === 'not-going') event.notGoing.push(currentUser.uid);
    
    saveEvents();
    renderEvents();
}

// ================== NOTIFICATIONS ==================
function addNotification(message, type, targetId, recipientId = null) {
    if (recipientId && recipientId !== currentUser?.uid) {
        // Notification is for another user, don't add to current user's notifications
return;
    }
    
    const notification = {
        id: 'notif_' + Date.now(),
        message: message,
        type: type,
        targetId: targetId,
        timestamp: Date.now(),
        read: false
    };
    
    notifications.unshift(notification);
    saveNotifications();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    const unread = notifications.filter(n => !n.read).length;
    if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8899aa">No notifications</p>';
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification ${notif.read ? 'read' : 'unread'}" onclick="markNotificationRead('${notif.id}')">
            <div class="notification-icon">${getNotificationIcon(notif.type)}</div>
            <div class="notification-content">
                <div class="notification-text">${notif.message}</div>
                <div class="notification-time">${getTimeAgo(notif.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function markNotificationRead(notifId) {
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
    }
}

function getNotificationIcon(type) {
    const icons = {
        'like': '❤️',
        'comment': '💬',
        'share': '🔗',
        'friend_request': '👥',
        'friend_accept': '✅',
        'message': '✉️',
        'post': '📝',
        'reply': '↩️'
    };
    return icons[type] || '🔔';
}

// ================== FEED RENDERING ==================
function renderFeed() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="post">
                <p style="text-align: center; color: #8899aa;">
                    No posts yet. Be the first to share something! ⚡
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => {
        const reactionCounts = Object.entries(post.reactions || {})
            .map(([type, users]) => ({ type, count: users.length }))
            .filter(r => r.count > 0)
            .sort((a, b) => b.count - a.count);
        
        const totalReactions = reactionCounts.reduce((sum, r) => sum + r.count, 0);
        const userReaction = currentUser ? Object.entries(post.reactions || {})
            .find(([type, users]) => users.includes(currentUser.uid)) : null;
        
        const canDelete = currentUser && post.authorId === currentUser.uid;
        const canEdit = currentUser && post.authorId === currentUser.uid;
        
        return `
            <div class="post">
                <div class="post-header">
                    <img src="${post.authorAvatar}" alt="${post.author}" class="avatar">
                    <div class="post-author">
                        <div class="post-author-name">${post.author}</div>
                        <div class="post-timestamp">
                            ${getTimeAgo(post.timestamp)}
                            ${post.edited ? ' · <span style="color:#8899aa">(edited)</span>' : ''}
                            · ${post.privacy === 'friends' ? '👥' : '🌐'}
                        </div>
                    </div>
                    <div class="post-menu">
                        ${canEdit ? `<button class="action-btn" onclick="editPost('${post.id}')">✏️</button>` : ''}
                        ${canDelete ? `<button class="action-btn" onclick="deletePost('${post.id}')">🗑️</button>` : ''}
                    </div>
                </div>
                
                <div class="post-content">${escapeHtml(post.content)}</div>
                
                ${post.sharedPost ? `
                    <div class="shared-post">
                        <div class="shared-author">${post.sharedPost.originalAuthor}</div>
                        <div class="shared-content">${escapeHtml(post.sharedPost.originalContent)}</div>
                        <div class="shared-time">${getTimeAgo(post.sharedPost.originalTimestamp)}</div>
                    </div>
                ` : ''}
                
                ${totalReactions > 0 ? `
                    <div class="post-reactions-summary">
                        ${reactionCounts.slice(0, 3).map(r => REACTIONS[r.type]).join(' ')}
                        <span style="margin-left:8px;color:#8899aa">${totalReactions}</span>
                        <div style="flex:1"></div>
                        <span style="color:#8899aa">${post.comments.length} comments · ${post.shares || 0} shares</span>
                    </div>
                ` : ''}
                
                <div class="post-actions-bar">
                    <div class="reaction-picker">
                        <button class="action-btn ${userReaction ? 'reacted' : ''}" 
                                onmouseenter="showReactionPicker(event, '${post.id}')"
                                onmouseleave="hideReactionPicker()">
                            ${userReaction ? REACTIONS[userReaction[0]] : '👍'} 
                            ${userReaction ? userReaction[0] : 'Like'}
                        </button>
                        <div class="reaction-picker-menu" id="picker-${post.id}" style="display:none">
                            ${Object.entries(REACTIONS).map(([type, emoji]) => `
                                <button onclick="reactToPost('${post.id}', '${type}')" title="${type}">
                                    ${emoji}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <button class="action-btn" onclick="addComment('${post.id}')">
                        💬 Comment
                    </button>
                    <button class="action-btn" onclick="sharePost('${post.id}')">
                        🔗 Share
                    </button>
                </div>
                
                ${post.comments.length > 0 ? `
                    <div class="post-comments">
                        ${post.comments.map(comment => `
                            <div class="comment">
                                <img src="${comment.authorAvatar}" alt="${comment.author}" class="avatar-small">
                                <div class="comment-content">
                                    <div class="comment-author">${comment.author}</div>
                                    <div class="comment-text">${escapeHtml(comment.content)}</div>
                                    <div class="comment-actions">
                                        <button class="comment-action" onclick="replyToComment('${post.id}', '${comment.id}')">Reply</button>
                                        <span class="comment-time">${getTimeAgo(comment.timestamp)}</span>
                                    </div>
                                    ${comment.replies && comment.replies.length > 0 ? `
                                        <div class="comment-replies">
                                            ${comment.replies.map(reply => `
                                                <div class="comment-reply">
                                                    <img src="${reply.authorAvatar}" alt="${reply.author}" class="avatar-small">
                                                    <div class="reply-content">
                                                        <div class="reply-author">${reply.author}</div>
                                                        <div class="reply-text">${escapeHtml(reply.content)}</div>
                                                        <span class="reply-time">${getTimeAgo(reply.timestamp)}</span>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function showReactionPicker(event, postId) {
    const picker = document.getElementById(`picker-${postId}`);
    if (picker) {
        picker.style.display = 'flex';
    }
}

function hideReactionPicker() {
    document.querySelectorAll('.reaction-picker-menu').forEach(picker => {
        picker.style.display = 'none';
    });
}

function renderStories() {
    const container = document.getElementById('storiesContainer');
    if (!container) return;
    
    if (stories.length === 0 && currentUser) {
        container.innerHTML = `
            <div class="story-card create-story" onclick="createStory()">
                <div class="story-avatar">
                    <img src="${currentUser.avatar}" alt="You">
                    <div class="story-add-btn">+</div>
                </div>
                <div class="story-name">Create Story</div>
            </div>
        `;
        return;
    }
    
    const html = stories.map(story => `
        <div class="story-card" onclick="viewStory('${story.id}')">
            <div class="story-avatar ${story.views.includes(currentUser?.uid) ? 'viewed' : ''}">
                <img src="${story.authorAvatar}" alt="${story.author}">
            </div>
            <div class="story-name">${story.author}</div>
        </div>
    `).join('');
    
    container.innerHTML = currentUser ? `
        <div class="story-card create-story" onclick="createStory()">
            <div class="story-avatar">
                <img src="${currentUser.avatar}" alt="You">
                <div class="story-add-btn">+</div>
            </div>
            <div class="story-name">Create Story</div>
        </div>
        ${html}
    ` : html;
}

function renderGroups() {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    if (groups.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8899aa">No groups yet. Create one!</p>';
        return;
    }
    
    container.innerHTML = groups.map(group => {
        const isMember = currentUser && group.members.includes(currentUser.uid);
        return `
            <div class="group-card">
                <div class="group-header">
                    <div class="group-name">${group.name}</div>
                    <div class="group-members">${group.members.length} members</div>
                </div>
                <div class="group-description">${group.description || 'No description'}</div>
                <div class="group-actions">
                    ${isMember ? `
                        <button class="btn-secondary" onclick="leaveGroup('${group.id}')">Leave</button>
                    ` : `
                        <button class="btn-primary" onclick="joinGroup('${group.id}')">Join</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function renderEvents() {
    const container = document.getElementById('eventsList');
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8899aa">No events yet. Create one!</p>';
        return;
    }
    
    container.innerHTML = events.map(event => {
        const userStatus = currentUser ? 
            (event.going.includes(currentUser.uid) ? 'going' :
             event.interested.includes(currentUser.uid) ? 'interested' :
             event.notGoing.includes(currentUser.uid) ? 'not-going' : null) : null;
        
        return `
            <div class="event-card">
                <div class="event-header">
                    <div class="event-title">${event.title}</div>
                    <div class="event-creator">by ${event.creatorName}</div>
                </div>
                <div class="event-details">
                    <div>📅 ${event.date}</div>
                    <div>📍 ${event.location}</div>
                </div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                <div class="event-stats">
                    <span>✅ ${event.going.length} going</span>
                    <span>⭐ ${event.interested.length} interested</span>
                </div>
                <div class="event-actions">
                    <button class="btn-${userStatus === 'going' ? 'primary' : 'secondary'}" 
                            onclick="rsvpEvent('${event.id}', 'going')">✅ Going</button>
                    <button class="btn-${userStatus === 'interested' ? 'primary' : 'secondary'}" 
                            onclick="rsvpEvent('${event.id}', 'interested')">⭐ Interested</button>
                    <button class="btn-${userStatus === 'not-going' ? 'primary' : 'secondary'}" 
                            onclick="rsvpEvent('${event.id}', 'not-going')">❌ Can't Go</button>
                </div>
            </div>
        `;
    }).join('');
}

// ================== DATA PERSISTENCE ==================
function loadAllData() {
    posts = JSON.parse(localStorage.getItem('LiTreeLabStudio_posts') || '[]');
    stories = JSON.parse(localStorage.getItem('LiTreeLabStudio_stories') || '[]');
    friends = JSON.parse(localStorage.getItem('LiTreeLabStudio_friends') || '[]');
    friendRequests = JSON.parse(localStorage.getItem('LiTreeLabStudio_friend_requests') || '[]');
    messages = JSON.parse(localStorage.getItem('LiTreeLabStudio_messages') || '[]');
    groups = JSON.parse(localStorage.getItem('LiTreeLabStudio_groups') || '[]');
    events = JSON.parse(localStorage.getItem('LiTreeLabStudio_events') || '[]');
    notifications = JSON.parse(localStorage.getItem('LiTreeLabStudio_notifications') || '[]');
}

function savePosts() { localStorage.setItem('LiTreeLabStudio_posts', JSON.stringify(posts)); }
function saveStories() { localStorage.setItem('LiTreeLabStudio_stories', JSON.stringify(stories)); }
function saveFriends() { localStorage.setItem('LiTreeLabStudio_friends', JSON.stringify(friends)); }
function saveFriendRequests() { localStorage.setItem('LiTreeLabStudio_friend_requests', JSON.stringify(friendRequests)); }
function saveMessages() { localStorage.setItem('LiTreeLabStudio_messages', JSON.stringify(messages)); }
function saveGroups() { localStorage.setItem('LiTreeLabStudio_groups', JSON.stringify(groups)); }
function saveEvents() { localStorage.setItem('LiTreeLabStudio_events', JSON.stringify(events)); }
function saveNotifications() { localStorage.setItem('LiTreeLabStudio_notifications', JSON.stringify(notifications)); }

// ================== UTILITIES ==================
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(text) {
    const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
    return text.replace(/[&<>"']/g, m => map[m]);
}

function setupRealtimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
        loadAllData();
        renderFeed();
        renderStories();
        updateNotificationBadge();
    }, 30000);
}

// ================== NAVIGATION ==================
function showSection(sectionId) {
    // Update active nav button
    document.querySelectorAll('.nav-icon-btn').forEach(btn => btn.classList.remove('active'));
    
    // Activate sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');
    
    // Update nav button active state
    const activeBtn = document.querySelector(`button[onclick="showSection('${sectionId}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Render section-specific content
    if (sectionId === 'hero') {
         console.log('⚡ Hero Landing Ready');
    } else if (sectionId === 'home') {
        renderFeed();
        renderStories();
    } else if (sectionId === 'LiTreeLabStudio') {
        console.log('🛡️ Entering LiTreeLabStudio Control Center...');
    } else if (sectionId === 'marketplace') {
        renderMarketplace();
    } else if (sectionId === 'reels') {
        initReels();
    } else if (sectionId === 'pages') {
        renderPages();
    } else if (sectionId === 'friends') {
        renderFriends();
        renderFriendRequests();
    } else if (sectionId === 'messages') {
        renderMessages();
    } else if (sectionId === 'groups') {
        renderGroups();
    } else if (sectionId === 'events') {
        renderEvents();
    } else if (sectionId === 'notifications') {
        renderNotifications();
    } else if (sectionId === 'profile') {
        renderProfileSection();
    }
    
    updateStats();
}

function renderProfileSection() {
    if (!currentUser) {
        alert('Please login to view profile');
        return;
    }
    
    // Update profile info
    const profileName = document.getElementById('profileName');
    const profileBio = document.getElementById('profileBio');
    const coverPhoto = document.getElementById('coverPhoto');
    const profileAvatar = document.querySelector('.profile-avatar-large img');
    
    if (profileName) profileName.textContent = currentUser.username;
    if (profileBio) profileBio.textContent = currentUser.bio || 'No bio yet';
    if (coverPhoto) coverPhoto.style.backgroundImage = `url('${currentUser.coverPhoto}')`;
    if (profileAvatar) profileAvatar.src = currentUser.avatar;
    
    // Update stats
    const userPosts = posts.filter(p => p.authorId === currentUser.uid);
    const profilePostCount = document.getElementById('profilePostCount');
    const profileFriendCount = document.getElementById('profileFriendCount');
    
    if (profilePostCount) profilePostCount.textContent = `${userPosts.length} posts`;
    if (profileFriendCount) profileFriendCount.textContent = `${friends.length} friends`;
    
    // Render user posts
    renderUserPosts();
}

function renderUserPosts() {
    const container = document.getElementById('userPosts');
    if (!container || !currentUser) return;
    
    const userPosts = posts.filter(p => p.authorId === currentUser.uid);
    
    if (userPosts.length === 0) {
        container.innerHTML = '<div class="card"><p style="text-align:center;color:#8899aa">No posts yet</p></div>';
        return;
    }
    
    container.innerHTML = '<div class="posts-feed">' + userPosts.map(post => {
        return `
            <div class="post">
                <div class="post-header">
                    <img src="${post.authorAvatar}" alt="${post.author}" class="avatar">
                    <div class="post-author">
                        <div class="post-author-name">${post.author}</div>
                        <div class="post-timestamp">${getTimeAgo(post.timestamp)}</div>
                    </div>
                    <button class="action-btn" onclick="deletePost('${post.id}')">🗑️</button>
                </div>
                <div class="post-content">${escapeHtml(post.content)}</div>
            </div>
        `;
    }).join('') + '</div>';
}

function showProfileTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.profile-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab
    event.target.classList.add('active');
    const contentId = 'profile' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
    const content = document.getElementById(contentId);
    if (content) content.classList.add('active');
    
    // Load tab-specific content
    if (tabName === 'about') {
        const userBio = document.getElementById('userBio');
        const userLocation = document.getElementById('userLocation');
        const userWebsite = document.getElementById('userWebsite');
        
        if (userBio) userBio.textContent = currentUser?.bio || 'No bio yet';
        if (userLocation) userLocation.textContent = currentUser?.location ? `📍 ${currentUser.location}` : '📍 Location not set';
        if (userWebsite) userWebsite.textContent = currentUser?.website ? `🌐 ${currentUser.website}` : '🌐 No website';
    } else if (tabName === 'friends') {
        const container = document.getElementById('profileFriendsList');
        if (container) {
            container.innerHTML = friends.map(friend => `
                <div class="friend-card">
                    <img src="${friend.avatar}" alt="${friend.name}" class="avatar">
                    <div class="friend-info">
                        <div class="friend-name">${friend.name}</div>
                    </div>
                </div>
            `).join('');
        }
    }
}

function editProfile() {
    if (!currentUser) return;
    
    const newBio = prompt('Edit your bio:', currentUser.bio || '');
    const newLocation = prompt('Edit your location:', currentUser.location || '');
    const newWebsite = prompt('Edit your website:', currentUser.website || '');
    
    if (newBio !== null) currentUser.bio = newBio.trim();
    if (newLocation !== null) currentUser.location = newLocation.trim();
    if (newWebsite !== null) currentUser.website = newWebsite.trim();
    
    localStorage.setItem('LiTreeLabStudio_user', JSON.stringify(currentUser));
    
    // Update users database
    const users = JSON.parse(localStorage.getItem('LiTreeLabStudio_users') || '{}');
    if (users[currentUser.email]) {
        users[currentUser.email].bio = currentUser.bio;
        users[currentUser.email].location = currentUser.location;
        users[currentUser.email].website = currentUser.website;
        localStorage.setItem('LiTreeLabStudio_users', JSON.stringify(users));
    }
    
    renderProfileSection();
    alert('Profile updated!');
}

function openConversation(userId) {
    alert(`Conversation with user ${userId} - Full messenger UI coming in next update!`);
    
    // Mark messages as read
    messages.forEach(msg => {
        if (msg.from === userId && msg.to === currentUser?.uid) {
            msg.read = true;
        }
    });
    saveMessages();
    renderMessages();
}

function markAllRead() {
    notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
}

function renderMarketplace() {
    const container = document.getElementById('marketplaceList');
    if (!container) return;
    
    // Seed marketplace if empty
    if (marketplace.length === 0) {
        marketplace = [
            { id: 1, title: 'RTX 4090 GPU', price: '$1599', loc: 'Monolith City', img: 'https://source.unsplash.com/400x300/?gpu' },
            { id: 2, title: 'LiTree Studio Mic', price: '$299', loc: 'Downtown', img: 'https://source.unsplash.com/400x310/?microphone' }
        ];
    }

    container.innerHTML = marketplace.map(item => `
        <div class="marketplace-card card">
            <img src="${item.img}" alt="${item.title}" style="width:100%;border-radius:8px">
            <h3>${item.title}</h3>
            <p class="price">${item.price}</p>
            <p class="loc">📍 ${item.loc}</p>
            <button class="btn-primary" style="width:100%">Message Seller</button>
        </div>
    `).join('');
}

function initReels() {
    console.log('🎬 Reels Mode Activated');
}

function renderPages() {
    console.log('🚩 Pages Rendered');
}

function updateStats() {
    const totalPostsEl = document.getElementById('totalPosts');
    const totalUsersEl = document.getElementById('totalUsers');
    const totalGroupsEl = document.getElementById('totalGroups');
    const totalEventsEl = document.getElementById('totalEvents');
    
    if (totalPostsEl) totalPostsEl.textContent = posts.length;
    if (totalUsersEl) {
        const users = JSON.parse(localStorage.getItem('LiTreeLabStudio_users') || '{}');
        totalUsersEl.textContent = Object.keys(users).length;
    }
    if (totalGroupsEl) totalGroupsEl.textContent = groups.length;
    if (totalEventsEl) totalEventsEl.textContent = events.length;
}

console.log('[LiTreeLabStudio SOCIAL] Full advanced social features loaded ⚡');
