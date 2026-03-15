// LiTree Studio - Unified Dashboard JavaScript
// Enhanced with GPU support and better stats

const API_BASE = '';
const AUTH_TOKEN = 'dev-token-for-local-use-only'; // In a real app, this would be handled securely

// Helper to fetch data with authentication
async function fetchAPI(url, options = {}) {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(API_BASE + url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

let lastDiskIO = { read_bytes: 0, write_bytes: 0, time: 0 };

// Helper to format bytes to GB
function formatBytes(bytes, decimals = 1) {
  if (!bytes) return '0 GB';
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(decimals) + ' GB';
}

// Helper to format bytes to MB
function formatMB(bytes, decimals = 0) {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(decimals) + ' MB';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Time ago helper
function timeAgo(timestamp) {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  return days + 'd ago';
}

// ── Navigation ──
document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    const section = item.dataset.section;

    // Update nav
    document
      .querySelectorAll('.nav-item')
      .forEach((i) => i.classList.remove('active'));
    item.classList.add('active');

    // Update section
    document
      .querySelectorAll('.section')
      .forEach((s) => s.classList.remove('active'));
    document.getElementById(section).classList.add('active');

    // Load section data
    if (section === 'dashboard') loadDashboard();
    if (section === 'social') loadSocial();
    if (section === 'music') loadMusic();
  });
});

// ── Dashboard (PC Monitoring) ──
let pcStatsInterval;
const statsHistory = [];

async function loadDashboard() {
  await Promise.all([fetchPCStats(), fetchLogs(), fetchProcesses()]);
  if (pcStatsInterval) clearInterval(pcStatsInterval);
  pcStatsInterval = setInterval(() => {
    fetchPCStats();
    fetchLogs();
    fetchProcesses();
  }, 2000);
}

async function fetchPCStats() {
  try {
    const stats = await fetchAPI('/api/pc/stats');

    // Update CPU
    document.getElementById('cpu-percent').textContent =
      Math.round(stats.cpu.percent) + '%';
    document.getElementById('cpu-bar').style.width = stats.cpu.percent + '%';
    document.getElementById('cpu-cores').textContent =
      `${stats.cpu.count} cores`;

    // Update RAM
    document.getElementById('ram-percent').textContent =
      Math.round(stats.ram.percent) + '%';
    document.getElementById('ram-bar').style.width = stats.ram.percent + '%';
    document.getElementById('ram-used').textContent =
      `${formatBytes(stats.ram.used)} / ${formatBytes(stats.ram.total)}`;

    // Update Disk
    document.getElementById('disk-percent').textContent =
      Math.round(stats.disk.percent) + '%';
    document.getElementById('disk-bar').style.width = stats.disk.percent + '%';
    document.getElementById('disk-used').textContent =
      `${formatBytes(stats.disk.used)} / ${formatBytes(stats.disk.total)}`;

    // Calculate and Update Disk I/O
    const timeDelta = (Date.now() - lastDiskIO.time) / 1000; // in seconds
    if (lastDiskIO.time > 0 && timeDelta > 0) {
      const readSpeed =
        (stats.disk.read_bytes - lastDiskIO.read_bytes) / timeDelta;
      const writeSpeed =
        (stats.disk.write_bytes - lastDiskIO.write_bytes) / timeDelta;
      document.getElementById('disk-read').textContent =
        `${formatBytes(readSpeed, 1)}/s`;
      document.getElementById('disk-write').textContent =
        `${formatBytes(writeSpeed, 1)}/s`;
    }
    lastDiskIO = { ...stats.disk, time: Date.now() };

    // Update GPU if available
    if (stats.gpu && stats.gpu.available) {
      document.getElementById('gpu-card').style.display = 'block';
      document.getElementById('gpu-temp').textContent =
        Math.round(stats.gpu.temperature) + '°C';
      document.getElementById('gpu-util').textContent =
        stats.gpu.utilization + '% util';
    } else {
      document.getElementById('gpu-card').style.display = 'none';
    }

    // Add to history for chart
    statsHistory.push({
      time: new Date().toLocaleTimeString(),
      cpu: stats.cpu.percent,
      ram: stats.ram.percent,
      gpu: stats.gpu && stats.gpu.available ? stats.gpu.utilization : null,
    });
    if (statsHistory.length > 60) statsHistory.shift();

    drawChart();
  } catch (err) {
    console.error('Failed to fetch PC stats:', err);
  }
}

async function fetchLogs() {
  try {
    const logs = await fetchAPI('/api/log');
    const container = document.getElementById('log-content');
    container.innerHTML = logs
      .map((log) => `<div>${escapeHtml(log)}</div>`)
      .join('');
  } catch (err) {
    console.error('Failed to fetch logs:', err);
  }
}

async function fetchProcesses() {
  try {
    const processes = await fetchAPI('/api/processes');
    const container = document.getElementById('processes-content');
    container.innerHTML = processes
      .map(
        (p) => `
            <div class="process-item">
                <span class="process-name">${escapeHtml(p.name)}</span>
                <span class="process-cpu">${p.cpu_percent.toFixed(1)}%</span>
                <span class="process-mem">${formatMB(p.memory_mb)}</span>
            </div>
        `
      )
      .join('');
  } catch (err) {
    console.error('Failed to fetch processes:', err);
  }
}

function drawChart() {
  const canvas = document.getElementById('pc-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = (canvas.width = canvas.offsetWidth);
  const height = (canvas.height = canvas.offsetHeight);

  ctx.clearRect(0, 0, width, height);

  if (statsHistory.length < 2) return;

  // Draw grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw CPU line
  ctx.strokeStyle = '#4d21fc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  statsHistory.forEach((point, i) => {
    const x = (width / (statsHistory.length - 1)) * i;
    const y = height - (point.cpu / 100) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw RAM line
  ctx.strokeStyle = '#a599e9';
  ctx.lineWidth = 2;
  ctx.beginPath();
  statsHistory.forEach((point, i) => {
    const x = (width / (statsHistory.length - 1)) * i;
    const y = height - (point.ram / 100) * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw GPU line if available
  const hasGpu = statsHistory.some((p) => p.gpu !== null);
  if (hasGpu) {
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    statsHistory.forEach((point, i) => {
      const x = (width / (statsHistory.length - 1)) * i;
      const y = point.gpu !== null ? height - (point.gpu / 100) * height : y;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}

// ── Social Feed ──
async function loadSocial() {
  try {
    const posts = await fetchAPI('/api/posts');
    const container = document.getElementById('feed');
    if (!posts || posts.length === 0) {
      container.innerHTML =
        '<p class="empty-state">No posts yet. Be the first!</p>';
      return;
    }

    container.innerHTML = posts
      .map(
        (post) => `
            <div class="post-card">
                <div class="post-header">
                    <span class="post-author">@${escapeHtml(post.author)}</span>
                    <span class="post-time">${timeAgo(post.timestamp)}</span>
                </div>
                <div class="post-content">${escapeHtml(post.content)}</div>
                <div class="post-actions">
                    <button class="post-action" onclick="likePost(${post.id})">❤️ ${post.likes || 0}</button>
                    <button class="post-action">💬 Reply</button>
                    <button class="post-action">↗️ Share</button>
                </div>
            </div>
        `
      )
      .join('');
  } catch (err) {
    console.error('Failed to load posts:', err);
    document.getElementById('feed').innerHTML =
      '<p class="empty-state">Failed to load posts</p>';
  }
}

async function likePost(postId) {
  try {
    await fetchAPI(`/api/posts/${postId}/like`, { method: 'POST' });
    loadSocial(); // Refresh
  } catch (err) {
    console.error('Failed to like post:', err);
  }
}

function showPostModal() {
  document.getElementById('post-modal').style.display = 'flex';
}

function hidePostModal() {
  document.getElementById('post-modal').style.display = 'none';
}

async function submitPost() {
  const author = document.getElementById('post-author').value.trim();
  const content = document.getElementById('post-content').value.trim();

  if (!author || !content) {
    alert('Please fill in both fields');
    return;
  }

  try {
    await fetchAPI('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ author, content }),
    });

    hidePostModal();
    document.getElementById('post-author').value = '';
    document.getElementById('post-content').value = '';
    loadSocial();
  } catch (err) {
    console.error('Failed to create post:', err);
    alert('Failed to create post');
  }
}

// ── Music Player ──
let tracks = [];
let currentTrack = 0;
let isPlaying = false;

async function loadMusic() {
  try {
    tracks = await fetchAPI('/api/music/tracks');
    renderTracklist();
    updateNowPlaying();
  } catch (err) {
    console.error('Failed to load music:', err);
    document.getElementById('track-list').innerHTML =
      '<p class="empty-state">No tracks found</p>';
  }
}

function renderTracklist() {
  const trackList = document.getElementById('track-list');
  if (!tracks || tracks.length === 0) {
    trackList.innerHTML =
      '<p class="empty-state">No tracks in media folder</p>';
    return;
  }
  trackList.innerHTML = tracks
    .map(
      (track, i) => `
        <div class="track-item ${i === currentTrack ? 'active' : ''}" onclick="playTrack(${i})">
            <div class="track-info">
                <span class="track-title">${escapeHtml(track.title)}</span>
                <span class="track-artist">${escapeHtml(track.artist || 'Unknown Artist')}</span>
            </div>
            <span class="track-duration">${track.duration}</span>
        </div>
    `
    )
    .join('');
}

function playTrack(index) {
  currentTrack = index;
  isPlaying = true;
  // Here you would add actual audio playback logic
  // e.g., const audio = new Audio(`/media/${tracks[currentTrack].filename}`); audio.play();
  renderTracklist();
  updateNowPlaying();
  document.querySelector('.control-btn.play').textContent = '⏸';
}

function updateNowPlaying() {
  if (tracks.length === 0) return;
  const track = tracks[currentTrack];
  document.getElementById('current-track').textContent = track.title;
  document.getElementById('current-artist').textContent =
    track.artist || 'Unknown Artist';
}

const player = {
  prev: () => {
    if (tracks.length === 0) return;
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    playTrack(currentTrack);
  },
  next: () => {
    if (tracks.length === 0) return;
    currentTrack = (currentTrack + 1) % tracks.length;
    playTrack(currentTrack);
  },
  toggle: () => {
    if (tracks.length === 0) return;
    isPlaying = !isPlaying;
    document.querySelector('.control-btn.play').textContent = isPlaying
      ? '⏸'
      : '▶';
    // Add audio pause/resume logic here
  },
};

// ── AI Chat ──
let chatHistory = [];

async function sendChat() {
  const input = document.getElementById('chat-message');
  const message = input.value.trim();
  if (!message) return;

  // Add user message
  addMessage('user', message);
  chatHistory.push({ role: 'user', content: message });
  input.value = '';

  // Show loading
  addMessage('ai', 'Thinking...');

  try {
    const data = await fetchAPI('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        history: chatHistory.slice(0, -1),
      }),
    });

    // Remove loading message
    const messages = document.querySelectorAll('.message');
    messages[messages.length - 1].remove();

    if (data.reply) {
      addMessage('ai', data.reply);
      chatHistory.push({ role: 'assistant', content: data.reply });
    } else if (data.error) {
      addMessage('ai', `Error: ${data.error}`);
    }
  } catch (err) {
    console.error('Chat error:', err);
    const messages = document.querySelectorAll('.message');
    messages[messages.length - 1].remove();
    addMessage('ai', 'Failed to connect to AI service');
  }
}

function addMessage(role, content) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `
        <div class="avatar">${role === 'ai' ? '🤖' : '👤'}</div>
        <div class="content">${escapeHtml(content)}</div>
    `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// Enter key to send chat
document.getElementById('chat-message')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChat();
});

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});
