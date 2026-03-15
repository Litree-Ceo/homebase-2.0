// ============================================
// OVERLORD SOCIAL - Main Application
// ============================================

// State Management
let currentUser = null;
let posts = [];
let authMode = 'login'; // 'login' or 'signup'
let firebase = null;
let db = null;
let auth = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    loadLocalUser();
    loadPosts();
    renderPosts();
    updateStats();
});

// ============================================
// FIREBASE CONFIGURATION
// ============================================
function initFirebase() {
    try {
        // Firebase config - REPLACE WITH YOUR OWN
        const firebaseConfig = {
            // Add your Firebase config here
            // For now, we'll work with localStorage
        };
        
        // Uncomment when you have Firebase credentials:
        // firebase.initializeApp(firebaseConfig);
        // db = firebase.firestore();
        // auth = firebase.auth();
        
        console.log('[OVERLORD] Running in offline mode (localStorage)');
    } catch (error) {
        console.log('[OVERLORD] Firebase not configured, using localStorage');
    }
}

// ============================================
// AUTHENTICATION
// ============================================
function toggleAuth() {
    const modal = document.getElementById('authModal');
    if (currentUser) {
        // Logout
        if (confirm('Sign out from The Grid?')) {
            currentUser = null;
            localStorage.removeItem('overlord_user');
            updateAuthUI();
            location.reload();
        }
    } else {
        // Show login modal
        modal.classList.add('active');
    }
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
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

async function handleAuth() {
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
    
    try {
        if (auth) {
            // Firebase authentication
            if (authMode === 'signup') {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await userCredential.user.updateProfile({ displayName: username });
                currentUser = {
                    uid: userCredential.user.uid,
                    email: email,
                    username: username
                };
            } else {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                currentUser = {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    username: userCredential.user.displayName || email.split('@')[0]
                };
            }
        } else {
            // Local authentication (offline mode)
            const users = JSON.parse(localStorage.getItem('overlord_users') || '{}');
            
            if (authMode === 'signup') {
                if (users[email]) {
                    alert('User already exists');
                    return;
                }
                users[email] = { password, username };
                localStorage.setItem('overlord_users', JSON.stringify(users));
                currentUser = { uid: Date.now().toString(), email, username };
            } else {
                if (!users[email] || users[email].password !== password) {
                    alert('Invalid credentials');
                    return;
                }
                currentUser = { uid: Date.now().toString(), email, username: users[email].username };
            }
        }
        
        localStorage.setItem('overlord_user', JSON.stringify(currentUser));
        closeAuthModal();
        updateAuthUI();
        location.reload();
    } catch (error) {
        alert('Auth error: ' + error.message);
    }
}

function loadLocalUser() {
    const stored = localStorage.getItem('overlord_user');
    if (stored) {
        currentUser = JSON.parse(stored);
        updateAuthUI();
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const profileName = document.getElementById('profileName');
    
    if (currentUser) {
        authBtn.textContent = '🚪 Logout';
        profileName.textContent = currentUser.username || currentUser.email;
    } else {
        authBtn.textContent = '🔐 Login';
        profileName.textContent = 'Guest User';
    }
}

// ============================================
// POSTS
// ============================================
function createPost() {
    const content = document.getElementById('postContent').value.trim();
    
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
        id: Date.now().toString(),
        author: currentUser.username || currentUser.email,
        authorId: currentUser.uid,
        content: content,
        timestamp: Date.now(),
        likes: [],
        comments: []
    };
    
    posts.unshift(post);
    savePosts();
    renderPosts();
    updateStats();
    
    document.getElementById('postContent').value = '';
    
    // Sync with Firebase if available
    if (db) {
        db.collection('posts').add(post);
    }
}

function likePost(postId) {
    if (!currentUser) {
        alert('Please login to like posts');
        toggleAuth();
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const userId = currentUser.uid;
    const index = post.likes.indexOf(userId);
    
    if (index > -1) {
        post.likes.splice(index, 1);
    } else {
        post.likes.push(userId);
    }
    
    savePosts();
    renderPosts();
}

function commentPost(postId) {
    if (!currentUser) {
        alert('Please login to comment');
        toggleAuth();
        return;
    }
    
    const comment = prompt('Enter your comment:');
    if (!comment) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    post.comments.push({
        author: currentUser.username || currentUser.email,
        content: comment,
        timestamp: Date.now()
    });
    
    savePosts();
    renderPosts();
}

function deletePost(postId) {
    if (!confirm('Delete this post?')) return;
    
    const index = posts.findIndex(p => p.id === postId);
    if (index > -1) {
        posts.splice(index, 1);
        savePosts();
        renderPosts();
        updateStats();
    }
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="post">
                <p style="text-align: center; color: var(--text-secondary);">
                    No posts yet. Be the first to share something! ⚡
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => {
        const isLiked = currentUser && post.likes.includes(currentUser.uid);
        const canDelete = currentUser && post.authorId === currentUser.uid;
        const timeAgo = getTimeAgo(post.timestamp);
        
        return `
            <div class="post">
                <div class="post-header">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}" alt="${post.author}" class="avatar">
                    <div class="post-author">
                        <div class="post-author-name">${post.author}</div>
                        <div class="post-timestamp">${timeAgo}</div>
                    </div>
                    ${canDelete ? `<button class="action-btn" onclick="deletePost('${post.id}')">🗑️</button>` : ''}
                </div>
                <div class="post-content">${escapeHtml(post.content)}</div>
                <div class="post-actions-bar">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="likePost('${post.id}')">
                        ${isLiked ? '❤️' : '🤍'} ${post.likes.length}
                    </button>
                    <button class="action-btn" onclick="commentPost('${post.id}')">
                        💬 ${post.comments.length}
                    </button>
                    <button class="action-btn" onclick="sharePost('${post.id}')">
                        🔗 Share
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function sharePost(postId) {
    const url = `${window.location.origin}?post=${postId}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
    }).catch(() => {
        alert(`Share this link: ${url}`);
    });
}

// ============================================
// DATA PERSISTENCE
// ============================================
function loadPosts() {
    const stored = localStorage.getItem('overlord_posts');
    if (stored) {
        posts = JSON.parse(stored);
    }
    
    // Load from Firebase if available
    if (db) {
        db.collection('posts')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get()
            .then(snapshot => {
                posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderPosts();
                updateStats();
            });
    }
}

function savePosts() {
    localStorage.setItem('overlord_posts', JSON.stringify(posts));
}

// ============================================
// UI HELPERS
// ============================================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'profile') {
        renderUserPosts();
    }
}

function renderUserPosts() {
    const container = document.getElementById('userPosts');
    if (!currentUser) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Login to view your posts</p>';
        return;
    }
    
    const userPosts = posts.filter(p => p.authorId === currentUser.uid);
    
    if (userPosts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">You haven\'t posted anything yet</p>';
        return;
    }
    
    container.innerHTML = userPosts.map(post => {
        const timeAgo = getTimeAgo(post.timestamp);
        return `
            <div class="post">
                <div class="post-header">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}" alt="${post.author}" class="avatar">
                    <div class="post-author">
                        <div class="post-author-name">${post.author}</div>
                        <div class="post-timestamp">${timeAgo}</div>
                    </div>
                    <button class="action-btn" onclick="deletePost('${post.id}')">🗑️</button>
                </div>
                <div class="post-content">${escapeHtml(post.content)}</div>
                <div class="post-actions-bar">
                    <button class="action-btn">❤️ ${post.likes.length}</button>
                    <button class="action-btn">💬 ${post.comments.length}</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    document.getElementById('totalPosts').textContent = posts.length;
    const uniqueAuthors = new Set(posts.map(p => p.authorId)).size;
    document.getElementById('activeUsers').textContent = uniqueAuthors || 1;
}

function addImage() {
    alert('Image upload coming soon! 📷');
}

function editProfile() {
    const bio = prompt('Update your bio:', 'Connected to The Grid');
    if (bio && currentUser) {
        currentUser.bio = bio;
        localStorage.setItem('overlord_user', JSON.stringify(currentUser));
        document.getElementById('profileBio').textContent = bio;
    }
}

// ============================================
// UTILITIES
// ============================================
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// SEARCH
// ============================================
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (!query) {
        renderPosts();
        return;
    }
    
    const filtered = posts.filter(p => 
        p.content.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query)
    );
    
    const container = document.getElementById('postsContainer');
    if (filtered.length === 0) {
        container.innerHTML = '<div class="post"><p style="text-align: center; color: var(--text-secondary);">No results found</p></div>';
        return;
    }
    
    posts = filtered;
    renderPosts();
});

// ============================================
// APP MANAGEMENT
// ============================================
async function checkAppStatus(appName, url) {
    const statusEl = document.getElementById(`status-${appName}`);
    statusEl.textContent = '🔄 Checking...';
    
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(url, { 
            method: 'HEAD',
            signal: controller.signal,
            mode: 'no-cors'
        });
        
        clearTimeout(timeout);
        statusEl.textContent = '🟢 Online';
        statusEl.style.color = 'var(--accent)';
    } catch (error) {
        statusEl.textContent = '🔴 Offline';
        statusEl.style.color = 'var(--danger)';
    }
}

function trackAppOpen(appName) {
    console.log(`[OVERLORD] Opening ${appName}...`);
    // Track usage if analytics enabled
}

function launchAll() {
    const apps = [
        { name: 'PC Dashboard', url: 'http://localhost:8080' },
        { name: 'L1T Stream', url: 'http://localhost:5000' },
        { name: 'Overlord Social', url: 'http://localhost:3000' }
    ];
    
    let opened = 0;
    apps.forEach((app, index) => {
        setTimeout(() => {
            window.open(app.url, '_blank');
            opened++;
            if (opened === apps.length) {
                alert('✅ All Grid apps launched!');
            }
        }, index * 500); // Stagger launches
    });
}

// Check app statuses on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        checkAppStatus('dashboard', 'http://localhost:8080');
        checkAppStatus('stream', 'http://localhost:5000');
        
        // Update social stats
        const socialStats = document.getElementById('social-stats');
        if (socialStats) {
            socialStats.textContent = `${posts.length} posts • ${new Set(posts.map(p => p.authorId)).size} users`;
        }
    }, 2000);
});

console.log('[OVERLORD SOCIAL] System online ⚡');
