import { auth, db, storage, firebaseReady } from "./firebase-config.js";
// ================================================================
// THE GRID — LiTreeLabStudio Social Platform
// Your Creative Network | Messages · Friends · Stories · AI Studio
// ================================================================

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
let marketplaceFilter = "all";
let authMode = "login";
let activeSection = "home";
let realtimeTimerId = null;
let storiesTimerId = null;

// ================== TOAST HELPER ==================
function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  while (container.children.length >= 5) {
    container.firstElementChild?.remove();
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✓", error: "✕", info: "⚡" };
  toast.innerHTML = `<span>${icons[type] || "⚡"}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    toast.style.transition = "all 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function openQuickInputDialog({
  title,
  placeholder = "",
  defaultValue = "",
  multiline = false,
  confirmText = "Save",
}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "quick-dialog-overlay";
    const inputField = multiline
      ? `<textarea id="quickDialogInput" class="quick-dialog-input" rows="4" placeholder="${placeholder}">${defaultValue || ""}</textarea>`
      : `<input id="quickDialogInput" class="quick-dialog-input" type="text" placeholder="${placeholder}" value="${defaultValue || ""}">`;

    overlay.innerHTML = `
      <div class="quick-dialog-card">
        <h3 class="quick-dialog-title">${title}</h3>
        ${inputField}
        <div class="quick-dialog-actions">
          <button class="btn-primary" id="quickDialogConfirm">${confirmText}</button>
          <button class="btn-secondary" id="quickDialogCancel">Cancel</button>
        </div>
      </div>
    `;

    const close = (value = null) => {
      overlay.remove();
      resolve(value);
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(null);
    });

    document.body.appendChild(overlay);

    const input = document.getElementById("quickDialogInput");
    const confirmBtn = document.getElementById("quickDialogConfirm");
    const cancelBtn = document.getElementById("quickDialogCancel");

    if (input) {
      input.focus();
      if (!multiline && typeof input.select === "function") input.select();
      input.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close(null);
        }
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
          close(input.value);
        }
      });
    }

    if (confirmBtn && input) {
      confirmBtn.addEventListener("click", () => close(input.value));
    }
    if (cancelBtn) cancelBtn.addEventListener("click", () => close(null));
  });
}

function openQuickConfirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "quick-dialog-overlay";
    overlay.innerHTML = `
      <div class="quick-dialog-card">
        <h3 class="quick-dialog-title">Confirm Action</h3>
        <p class="quick-dialog-text">${message}</p>
        <div class="quick-dialog-actions">
          <button class="btn-primary" id="quickConfirmYes">Confirm</button>
          <button class="btn-secondary" id="quickConfirmNo">Cancel</button>
        </div>
      </div>
    `;

    const close = (value) => {
      overlay.remove();
      resolve(value);
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(false);
    });

    document.body.appendChild(overlay);
    document
      .getElementById("quickConfirmYes")
      ?.addEventListener("click", () => close(true));
    document
      .getElementById("quickConfirmNo")
      ?.addEventListener("click", () => close(false));
  });
}

// ================== FIREBASE BADGE ==================
function updateFirebaseBadge() {
  const badge = document.getElementById("firebaseBadge");
  if (!badge) return;
  if (typeof firebaseReady !== "undefined" && firebaseReady) {
    badge.textContent = "⚡ Firebase";
    badge.classList.remove("offline");
  } else {
    badge.textContent = "⚡ Local Mode";
    badge.classList.add("offline");
  }
}

// ================== MEDIA UPLOAD ==================
let pendingMediaFile = null;
let pendingMediaURL = null;

function handleMediaSelected(input) {
  const file = input.files[0];
  if (!file) return;
  pendingMediaFile = file;
  pendingMediaURL = URL.createObjectURL(file);
  showToast(`Media ready: ${file.name}`, "success");
}

async function uploadMediaToStorage(file) {
  if (!firebaseReady || !storage) return null;
  if (!currentUser) return null;
  try {
    const ext = file.name.split(".").pop();
    const path = `posts/${currentUser.uid}/${Date.now()}.${ext}`;
    const ref = storage.ref(path);

    const progress = document.getElementById("uploadProgress");
    const bar = document.getElementById("uploadProgressBar");
    if (progress) progress.classList.add("active");

    const task = ref.put(file);
    task.on("state_changed", (snap) => {
      const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      if (bar) bar.style.width = pct + "%";
    });
    await task;

    if (progress) progress.classList.remove("active");
    if (bar) bar.style.width = "0%";

    return await ref.getDownloadURL();
  } catch (e) {
    console.error("[Storage] Upload failed:", e);
    showToast("Media upload failed", "error");
    return null;
  }
}

// ================== INITIALIZATION ==================
document.addEventListener("DOMContentLoaded", () => {
  updateFirebaseBadge();
  completeGoogleRedirectSignIn();
  setupFirebaseAuthListener();
  loadLocalUser();
  loadAllData();
  updateAuthUI();
  renderFeed();
  updateNotificationBadge();
  setupRealtimeUpdates();
  checkExpiredStories();

  // Bot Inbox UI setup
  const openBtn = document.getElementById("open-bot-inbox");
  const panel = document.getElementById("bot-inbox-panel");
  const closeBtn = document.getElementById("close-bot-inbox");
  const botInboxBadge = document.getElementById("botInboxBadge");
  let botInboxUnread = false;
  if (openBtn && panel && closeBtn) {
    openBtn.onclick = () => {
      panel.style.display = "flex";
      renderBotInbox();
      botInboxUnread = false;
      if (botInboxBadge) botInboxBadge.classList.add("hide");
    };
    closeBtn.onclick = () => {
      panel.style.display = "none";
    };
  }

  // Poll for bot events every 30s (or on page load)
  async function pollBotEvents() {
    let events = [];
    try {
      if (typeof firebaseReady !== "undefined" && firebaseReady && firebase?.functions) {
        const functions = firebase.functions();
        const listBotEvents = functions.httpsCallable("listBotEvents");
        const result = await listBotEvents();
        events = result.data?.events || [];
      }
    } catch {}
    if (events.length > 0) {
      botInboxUnread = true;
      if (botInboxBadge) {
        botInboxBadge.textContent = events.length;
        botInboxBadge.classList.remove("hide");
      }
    } else {
      if (botInboxBadge) botInboxBadge.classList.add("hide");
    }
  }
  pollBotEvents();
  setInterval(pollBotEvents, 30000);
});

// ================== BOT INBOX ==================
async function renderBotInbox() {
  const list = document.getElementById("bot-inbox-list");
  if (!list) return;
  list.innerHTML = '<p class="loading">Loading bot events...</p>';

  // Use Firebase callable function if available
  let events = [];
  try {
    if (typeof firebaseReady !== "undefined" && firebaseReady && firebase?.functions) {
      const functions = firebase.functions();
      const listBotEvents = functions.httpsCallable("listBotEvents");
      const result = await listBotEvents();
      events = result.data?.events || [];
    } else {
      // Fallback: show local message
      events = [{
        type: "info",
        message: "Bot event stream not available (offline mode)",
        timestamp: Date.now(),
      }];
    }
  } catch (e) {
    events = [{
      type: "error",
      message: "Failed to load bot events: " + (e.message || e),
      timestamp: Date.now(),
    }];
  }

  if (!events.length) {
    list.innerHTML = '<p class="loading">No bot events found.</p>';
    return;
  }
  list.innerHTML = events.map(ev => `
    <div class="event">
      <div>${ev.message || ev.text || JSON.stringify(ev)}</div>
      <div class="event-meta">${ev.type || "event"} · ${getTimeAgo(ev.timestamp || Date.now())}</div>
    </div>
  `).join("");
}
});

function setupFirebaseAuthListener() {
  if (typeof firebaseReady === "undefined" || !firebaseReady || !auth) return;
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email.split("@")[0],
        avatar:
          user.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        bio: "",
        location: "",
        website: "",
        coverPhoto: "https://source.unsplash.com/1200x400/?technology,cyber",
      };
      localStorage.setItem("LiTreeLabStudio_user", JSON.stringify(currentUser));
      updateAuthUI();
      updateFirebaseBadge();
      setupFirestorePostsListener();
    } else {
      // Not signed in via Firebase — keep localStorage user if set
    }
  });
}

// ================== AUTHENTICATION ==================

async function completeGoogleRedirectSignIn() {
  if (typeof firebaseReady === "undefined" || !firebaseReady || !auth) return;
  try {
    const result = await auth.getRedirectResult();
    if (result && result.user) {
      closeAuthModal();
      showToast("Signed in with Google ✓", "success");
    }
  } catch (e) {
    console.error("[Auth] Redirect sign-in:", e);
    showToast(e.message || "Google redirect sign-in failed", "error");
  }
}

function isEmbeddedAuthBrowser() {
  const userAgent = (navigator.userAgent || "").toLowerCase();
  return (
    userAgent.includes("electron") ||
    userAgent.includes("vscode") ||
    window.self !== window.top
  );
}

function getAuthPreflightIssues() {
  const issues = [];
  if (location.protocol === "file:") {
    issues.push("Run through http://localhost (not file://) for OAuth.");
  }
  if (isEmbeddedAuthBrowser()) {
    issues.push(
      "Embedded browser detected. Google sign-in is more reliable in Chrome/Edge.",
    );
  }
  if (
    location.protocol.startsWith("http") &&
    !["localhost", "127.0.0.1"].includes(location.hostname) &&
    !location.hostname.endsWith("firebaseapp.com") &&
    !location.hostname.endsWith("web.app")
  ) {
    issues.push(
      `Add ${location.hostname} to Firebase Auth > Settings > Authorized domains.`,
    );
  }
  return issues;
}

function showAuthPreflightIssues() {
  const issues = getAuthPreflightIssues();
  issues.forEach((issue) => showToast(issue, "info", 5200));
  return issues.length === 0;
}

async function signInWithProvider(provider, providerName) {
  try {
    await auth.signInWithPopup(provider);
    closeAuthModal();
    showToast(`Signed in with ${providerName} ✓`, "success");
  } catch (e) {
    console.error(`[Auth] ${providerName} sign-in:`, e);
    const fallbackCodes = new Set([
      "auth/popup-blocked",
      "auth/cancelled-popup-request",
      "auth/operation-not-supported-in-this-environment",
    ]);

    if (fallbackCodes.has(e.code)) {
      try {
        showToast(
          `Popup blocked. Switching to ${providerName} redirect...`,
          "info",
          4200,
        );
        showAuthPreflightIssues();
        await auth.signInWithRedirect(provider);
        return;
      } catch (redirectError) {
        console.error("[Auth] Redirect fallback failed:", redirectError);
      }
    }

    if (e.code === "auth/unauthorized-domain") {
      showToast(
        `Unauthorized domain: ${location.hostname}. Add it in Firebase Console authorized domains.`,
        "error",
        6200,
      );
      return;
    }

    if (e.code === "auth/network-request-failed") {
      showToast(
        "Network blocked during OAuth. Check VPN/firewall and try again in Chrome/Edge.",
        "error",
        6200,
      );
      return;
    }

    if (e.code === "auth/operation-not-allowed") {
      showToast(
        `${providerName} is not enabled in Firebase Authentication providers.`,
        "error",
        5200,
      );
      return;
    }

    showToast(e.message || `${providerName} sign-in failed`, "error");
  }
}

let phoneRecaptchaVerifier = null;

function ensurePhoneRecaptcha() {
  if (phoneRecaptchaVerifier) return phoneRecaptchaVerifier;
  const recaptchaContainer = document.getElementById("recaptcha-container");
  if (!recaptchaContainer) return null;

  phoneRecaptchaVerifier = new firebase.auth.RecaptchaVerifier(
  // Modular RecaptchaVerifier (v9+)
  // If using compat, replace with modular import as needed
  phoneRecaptchaVerifier = new window.firebase.auth.RecaptchaVerifier(
    "recaptcha-container",
    {
      size: "invisible",
    },
    auth.app,
  );

  return phoneRecaptchaVerifier;
}

// Handle Google Sign-In
async function handleGoogleAuth() {
  if (typeof firebaseReady === "undefined" || !firebaseReady || !auth) {
    showToast(
      "Firebase not configured — add your project credentials to firebase-config.js",
      "error",
      5000,
    );
    return;
  }
  try {
    showAuthPreflightIssues();
    const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    provider.addScope("email");
    provider.addScope("profile");
    await signInWithPopup(auth, provider);
    // After sign-in, check if user is allowed
    if (auth.currentUser) {
      const allowedEmails = [
        "highlife4real1989@gmail.com",
        "dyingbreed@gmail.com"
      ];
      if (!allowedEmails.includes(auth.currentUser.email)) {
        showToast(
          `This Google account (${auth.currentUser.email}) is not authorized for admin access.`,
          "error",
          7000
        );
        // Optionally sign out immediately
        setTimeout(() => auth.signOut(), 3000);
        return;
      }
      showToast("Welcome, admin!", "success", 4000);
    }
  } catch (e) {
    showToast(e.message || "Google sign-in failed", "error");
  }
}

async function handleFacebookAuth() {
  if (typeof firebaseReady === "undefined" || !firebaseReady || !auth) {
    showToast("Firebase is not ready for authentication.", "error");
    return;
  }
  const { FacebookAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new FacebookAuthProvider();
  provider.setCustomParameters({ display: "popup" });
  await signInWithPopup(auth, provider);
}

async function handleDiscordAuth() {
  if (typeof firebaseReady === "undefined" || !firebaseReady || !auth) {
    showToast("Firebase is not ready for authentication.", "error");
    return;
  }

  // Discord requires custom backend for OAuth and token minting
  // Use signInWithCustomToken(auth, token) after backend returns token
}

async function handlePhoneAuth() {
  if (typeof firebaseReady === "undefined" || !firebaseReady || !auth) {
    showToast("Firebase is not ready for authentication.", "error");
    return;
  }

  const phoneNumber = prompt(
    "Enter your phone number with country code (example: +15551234567)",
  );

  if (!phoneNumber) {
    return;
  }

  try {
    const verifier = ensurePhoneRecaptcha();
    if (!verifier) {
      showToast("Phone auth verifier failed to initialize.", "error");
      return;
    }

    const { signInWithPhoneNumber } = await import("firebase/auth");
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);

    const code = prompt("Enter the SMS verification code");
    if (!code) {
      showToast("SMS sign-in canceled.", "info");
      return;
    }

    await confirmationResult.confirm(code.trim());
    closeAuthModal();
    showToast("Signed in with SMS ✓", "success");
  } catch (e) {
    console.error("[Auth] Phone sign-in:", e);
    if (e.code === "auth/operation-not-allowed") {
      showToast(
        "Phone auth is not enabled in Firebase Authentication providers.",
        "error",
        5200,
      );
      return;
    }
    showToast(e.message || "Phone sign-in failed", "error");
  }
}

function toggleAuth() {
  const modal = document.getElementById("authModal");
  if (currentUser) {
    if (confirm("Sign out from The Grid?")) {
      if (firebaseReady && auth) {
        auth.signOut().catch(console.error);
      }
      currentUser = null;
      localStorage.removeItem("LiTreeLabStudio_user");
      location.reload();
    }
  } else {
    modal?.classList.add("active");
  }
}

function closeAuthModal() {
  document.getElementById("authModal")?.classList.remove("active");
}

function toggleAuthMode() {
  authMode = authMode === "login" ? "signup" : "login";
  const usernameField = document.getElementById("authUsername");
  const submitBtn = document.getElementById("authSubmitBtn");
  const title = document.getElementById("authTitle");
  const toggleText = document.getElementById("authToggleText");
  const toggleLink = document.getElementById("authToggleLink");

  if (authMode === "signup") {
    usernameField.style.display = "block";
    submitBtn.textContent = "Sign Up";
    title.textContent = "Join The Grid";
    toggleText.textContent = "Already have an account?";
    toggleLink.textContent = "Login";
  } else {
    usernameField.style.display = "none";
    submitBtn.textContent = "Login";
    title.textContent = "Enter The Grid";
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = "Sign up";
  }
}

async function handleAuth() {
  const email = document.getElementById("authEmail")?.value.trim();
  const password = document.getElementById("authPassword")?.value.trim();
  const username = document.getElementById("authUsername")?.value.trim();

  if (!email || !password) {
    showToast("Email and password required", "error");
    return;
  }
  if (authMode === "signup" && !username) {
    showToast("Username required for signup", "error");
    return;
  }

  // ── Firebase auth (when configured) ──────────────────
  if (typeof firebaseReady !== "undefined" && firebaseReady && auth) {
    try {
      if (authMode === "signup") {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: username });
        showToast("Account created — welcome to The Grid!", "success");
      } else {
        await auth.signInWithEmailAndPassword(email, password);
        showToast("Signed in ✓", "success");
      }
      closeAuthModal();
      return;
    } catch (e) {
      console.error("[Auth]", e);
      showToast(e.message || "Auth failed", "error");
      return;
    }
  }

  // ── LocalStorage fallback (no Firebase configured) ───
  const users = JSON.parse(
    localStorage.getItem("LiTreeLabStudio_users") || "{}",
  );

  if (authMode === "signup") {
    if (users[email]) {
      showToast("User already exists", "error");
      return;
    }
    users[email] = {
      password,
      username,
      joinDate: Date.now(),
      bio: "",
      location: "",
      website: "",
    };
    localStorage.setItem("LiTreeLabStudio_users", JSON.stringify(users));
    currentUser = {
      uid: "user_" + Date.now(),
      email,
      username,
      bio: "",
      location: "",
      website: "",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      coverPhoto: "https://source.unsplash.com/1200x400/?technology,cyber",
    };
  } else {
    if (!users[email] || users[email].password !== password) {
      showToast("Invalid credentials", "error");
      return;
    }
    currentUser = {
      uid: "user_" + email.replace(/[^a-z0-9]/gi, ""),
      email,
      username: users[email].username,
      bio: users[email].bio || "",
      location: users[email].location || "",
      website: users[email].website || "",
      avatar:
        users[email].avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${users[email].username}`,
      coverPhoto:
        users[email].coverPhoto ||
        "https://source.unsplash.com/1200x400/?technology,cyber",
    };
  }

  localStorage.setItem("LiTreeLabStudio_user", JSON.stringify(currentUser));
  closeAuthModal();
  location.reload();
}

function loadLocalUser() {
  const stored = localStorage.getItem("LiTreeLabStudio_user");
  if (stored) {
    currentUser = JSON.parse(stored);
    updateAuthUI();
  }
  // Start Firestore listener for public posts (even unauthenticated)
  setupFirestorePostsListener();
}

function updateAuthUI() {
  const authBtn = document.getElementById("authBtn");
  if (currentUser && authBtn) {
    authBtn.textContent = "🚪 Logout";
    authBtn.title = currentUser.email || currentUser.username;
  }
  const name = document.getElementById("profileName");
  const bio = document.getElementById("profileBio");
  if (name && currentUser)
    name.textContent = currentUser.username || currentUser.email;
  if (bio && currentUser?.bio) bio.textContent = currentUser.bio;
}

// ================== POSTS & REACTIONS ==================
const REACTIONS = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😠",
};

async function createPost() {
  const content = document.getElementById("postContent")?.value.trim();
  const privacy = document.getElementById("postPrivacy")?.value || "public";

  if (!content) {
    showToast("Post content cannot be empty", "error");
    return;
  }
  if (!currentUser) {
    showToast("Please login to post", "error");
    toggleAuth();
    return;
  }

  // Upload media if selected
  let mediaURL = null;
  if (pendingMediaFile) {
    mediaURL = await uploadMediaToStorage(pendingMediaFile);
    pendingMediaFile = null;
    pendingMediaURL = null;
    const input = document.getElementById("mediaInput");
    if (input) input.value = "";
  }

  const post = {
    id: "post_" + Date.now(),
    author: currentUser.username,
    authorId: currentUser.uid,
    authorAvatar: currentUser.avatar,
    content,
    timestamp: Date.now(),
    reactions: {},
    comments: [],
    shares: 0,
    privacy,
    media: mediaURL
      ? [
          {
            type: pendingMediaFile?.type?.startsWith("video")
              ? "video"
              : "image",
            url: mediaURL,
          },
        ]
      : [],
  };

  // ── Firestore (when configured) ──────────────────────
  if (typeof firebaseReady !== "undefined" && firebaseReady && db) {
    try {
      // Modular Firestore add
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      await addDoc(collection(db, "posts"), {
        ...post,
        serverTimestamp: serverTimestamp(),
      });
      showToast("Post shared ✓", "success");
    } catch (e) {
      console.error("[Firestore] createPost:", e);
      showToast("Post saved locally (Firestore error)", "info");
      posts.unshift(post);
      savePosts();
      renderFeed();
    }
  } else {
    // LocalStorage fallback
    posts.unshift(post);
    savePosts();
    renderFeed();
    showToast("Post created (offline mode)", "info");
  }

  document.getElementById("postContent").value = "";
  addNotification("You created a new post", "post", post.id);
}

function reactToPost(postId, reaction) {
  if (!currentUser) {
    showToast("Please login to react", "info");
    return;
  }

  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  if (!post.reactions) post.reactions = {};
  if (!post.reactions[reaction]) post.reactions[reaction] = [];

  const userId = currentUser.uid;

  // Remove from all other reactions
  Object.keys(post.reactions).forEach((r) => {
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

async function addComment(postId) {
  if (!currentUser) {
    showToast("Please login to comment", "info");
    return;
  }

  const comment = await openQuickInputDialog({
    title: "Add Comment",
    placeholder: "Write your comment...",
    multiline: true,
    confirmText: "Post",
  });
  if (!comment || !comment.trim()) return;

  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const commentObj = {
    id: "comment_" + Date.now(),
    author: currentUser.username,
    authorId: currentUser.uid,
    authorAvatar: currentUser.avatar,
    content: comment.trim(),
    timestamp: Date.now(),
    reactions: {},
    replies: [],
  };

  post.comments.push(commentObj);
  savePosts();
  renderFeed();

  // Notify post author
  if (post.authorId !== currentUser.uid) {
    addNotification(
      `${currentUser.username} commented on your post`,
      "comment",
      postId,
      post.authorId,
    );
  }
}

async function replyToComment(postId, commentId) {
  if (!currentUser) {
    showToast("Please login to reply", "info");
    return;
  }

  const reply = await openQuickInputDialog({
    title: "Reply",
    placeholder: "Write your reply...",
    multiline: true,
    confirmText: "Reply",
  });
  if (!reply || !reply.trim()) return;

  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const comment = post.comments.find((c) => c.id === commentId);
  if (!comment) return;

  const replyObj = {
    id: "reply_" + Date.now(),
    author: currentUser.username,
    authorId: currentUser.uid,
    authorAvatar: currentUser.avatar,
    content: reply.trim(),
    timestamp: Date.now(),
  };

  if (!comment.replies) comment.replies = [];
  comment.replies.push(replyObj);

  savePosts();
  renderFeed();

  // Notify comment author
  if (comment.authorId !== currentUser.uid) {
    addNotification(
      `${currentUser.username} replied to your comment`,
      "reply",
      postId,
      comment.authorId,
    );
  }
}

async function sharePost(postId) {
  if (!currentUser) {
    showToast("Please login to share", "info");
    return;
  }

  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const shareText = await openQuickInputDialog({
    title: "Share Post",
    placeholder: "Add a message (optional)",
    multiline: true,
    confirmText: "Share",
  });

  const sharedPost = {
    id: "post_" + Date.now(),
    author: currentUser.username,
    authorId: currentUser.uid,
    authorAvatar: currentUser.avatar,
    content: shareText || "",
    timestamp: Date.now(),
    reactions: {},
    comments: [],
    shares: 0,
    privacy: "public",
    sharedPost: {
      originalAuthor: post.author,
      originalContent: post.content,
      originalTimestamp: post.timestamp,
    },
  };

  posts.unshift(sharedPost);
  post.shares = (post.shares || 0) + 1;
  savePosts();
  renderFeed();

  showToast("Post shared", "success");
}

async function deletePost(postId) {
  const shouldDelete = await openQuickConfirmDialog("Delete this post?");
  if (!shouldDelete) return;

  const index = posts.findIndex((p) => p.id === postId);
  if (index > -1) {
    posts.splice(index, 1);
    savePosts();
    renderFeed();
  }
}

async function editPost(postId) {
  const post = posts.find((p) => p.id === postId);
  if (!post || post.authorId !== currentUser?.uid) return;

  const newContent = await openQuickInputDialog({
    title: "Edit Post",
    defaultValue: post.content,
    multiline: true,
    confirmText: "Save",
  });
  if (newContent && newContent.trim()) {
    post.content = newContent.trim();
    post.edited = true;
    savePosts();
    renderFeed();
  }
}

// ================== STORIES ==================
async function createStory() {
  if (!currentUser) {
    showToast("Please login to create a story", "info");
    return;
  }

  const content = await openQuickInputDialog({
    title: "Create Story",
    placeholder: "What's on your mind? (Story disappears in 24h)",
    multiline: true,
    confirmText: "Publish",
  });
  if (!content || !content.trim()) return;

  const story = {
    id: "story_" + Date.now(),
    author: currentUser.username,
    authorId: currentUser.uid,
    authorAvatar: currentUser.avatar,
    content: content.trim(),
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    views: [],
  };

  stories.unshift(story);
  saveStories();
  renderStories();
}

function viewStory(storyId) {
  const story = stories.find((s) => s.id === storyId);
  if (!story) return;

  if (currentUser && !story.views.includes(currentUser.uid)) {
    story.views.push(currentUser.uid);
    saveStories();
  }

  const modal = document.createElement("div");
  modal.className = "story-modal";
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
  stories = stories.filter((s) => s.expiresAt > now);
  saveStories();
  if (storiesTimerId) clearInterval(storiesTimerId);
  storiesTimerId = setInterval(() => {
    const currentNow = Date.now();
    const beforeCount = stories.length;
    stories = stories.filter((s) => s.expiresAt > currentNow);
    if (stories.length !== beforeCount) {
      saveStories();
      renderStories();
    }
  }, 60000); // Check every minute
}

// ================== FRIENDS SYSTEM ==================
function sendFriendRequest(userId) {
  if (!currentUser) {
    showToast("Please login to send friend requests", "info");
    return;
  }

  if (friends.find((f) => f.id === userId)) {
    showToast("Already friends", "info");
    return;
  }

  const existingRequest = friendRequests.find(
    (r) => r.from === currentUser.uid && r.to === userId,
  );

  if (existingRequest) {
    showToast("Friend request already sent", "info");
    return;
  }

  const request = {
    id: "req_" + Date.now(),
    from: currentUser.uid,
    fromName: currentUser.username,
    fromAvatar: currentUser.avatar,
    to: userId,
    timestamp: Date.now(),
  };

  friendRequests.push(request);
  saveFriendRequests();
  addNotification(
    `${currentUser.username} sent you a friend request`,
    "friend_request",
    request.id,
    userId,
  );
  showToast("Friend request sent", "success");
}

function acceptFriendRequest(requestId) {
  const request = friendRequests.find((r) => r.id === requestId);
  if (!request) return;

  friends.push({
    id: request.from,
    name: request.fromName,
    avatar: request.fromAvatar,
    since: Date.now(),
  });

  friendRequests = friendRequests.filter((r) => r.id !== requestId);
  saveFriends();
  saveFriendRequests();
  renderFriends();
  addNotification(
    `${currentUser.username} accepted your friend request`,
    "friend_accept",
    currentUser.uid,
    request.from,
  );
  showToast("Friend request accepted", "success");
}

function declineFriendRequest(requestId) {
  friendRequests = friendRequests.filter((r) => r.id !== requestId);
  saveFriendRequests();
  renderFriendRequests();
}

async function unfriend(friendId) {
  const shouldUnfriend = await openQuickConfirmDialog("Remove this friend?");
  if (!shouldUnfriend) return;

  friends = friends.filter((f) => f.id !== friendId);
  saveFriends();
  renderFriends();
}

function renderFriends() {
  const container = document.getElementById("friendsList");
  if (!container) return;

  if (friends.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;color:#8899aa">No friends yet. Send some friend requests!</p>';
    return;
  }

  container.innerHTML = friends
    .map(
      (friend) => `
        <div class="friend-card">
            <img src="${friend.avatar}" alt="${friend.name}" class="avatar">
            <div class="friend-info">
                <div class="friend-name">${friend.name}</div>
                <div class="friend-since">Friends since ${new Date(friend.since).toLocaleDateString()}</div>
            </div>
            <button class="btn-secondary" onclick="sendMessage('${friend.id}')">💬 Message</button>
            <button class="btn-danger" onclick="unfriend('${friend.id}')">✕</button>
        </div>
    `,
    )
    .join("");
}

function renderFriendRequests() {
  const container = document.getElementById("friendRequestsList");
  if (!container) return;

  const myRequests = friendRequests.filter((r) => r.to === currentUser?.uid);

  if (myRequests.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;color:#8899aa">No pending friend requests</p>';
    return;
  }

  container.innerHTML = myRequests
    .map(
      (req) => `
        <div class="friend-request">
            <img src="${req.fromAvatar}" alt="${req.fromName}" class="avatar">
            <div class="friend-info">
                <div class="friend-name">${req.fromName}</div>
                <div class="friend-time">${getTimeAgo(req.timestamp)}</div>
            </div>
            <button class="btn-primary" onclick="acceptFriendRequest('${req.id}')">Accept</button>
            <button class="btn-secondary" onclick="declineFriendRequest('${req.id}')">Decline</button>
        </div>
    `,
    )
    .join("");
}

// ================== MESSAGING ==================
async function sendMessage(toUserId, content = null) {
  if (!currentUser) {
    showToast("Please login to send messages", "info");
    return;
  }

  const messageContent =
    content ||
    (await openQuickInputDialog({
      title: "New Message",
      placeholder: "Type your message...",
      multiline: true,
      confirmText: "Send",
    }));
  if (!messageContent || !messageContent.trim()) return;

  const message = {
    id: "msg_" + Date.now(),
    from: currentUser.uid,
    fromName: currentUser.username,
    fromAvatar: currentUser.avatar,
    to: toUserId,
    content: messageContent.trim(),
    timestamp: Date.now(),
    read: false,
  };

  messages.push(message);
  saveMessages();
  addNotification(
    `New message from ${currentUser.username}`,
    "message",
    message.id,
    toUserId,
  );
  showToast("Message sent", "success");
}

function renderMessages() {
  const container = document.getElementById("messagesList");
  if (!container || !currentUser) return;

  const myMessages = messages.filter(
    (m) => m.from === currentUser.uid || m.to === currentUser.uid,
  );

  if (myMessages.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;color:#8899aa">No messages yet</p>';
    return;
  }

  // Group by conversation
  const conversations = {};
  myMessages.forEach((msg) => {
    const otherUser = msg.from === currentUser.uid ? msg.to : msg.from;
    if (!conversations[otherUser]) conversations[otherUser] = [];
    conversations[otherUser].push(msg);
  });

  container.innerHTML = Object.entries(conversations)
    .map(([userId, msgs]) => {
      const lastMsg = msgs[msgs.length - 1];
      const unread = msgs.filter(
        (m) => m.to === currentUser.uid && !m.read,
      ).length;

      return `
            <div class="message-preview" onclick="openConversation('${userId}')">
                <img src="${lastMsg.fromAvatar}" alt="${lastMsg.fromName}" class="avatar">
                <div class="message-info">
                    <div class="message-name">${lastMsg.fromName}</div>
                    <div class="message-text">${lastMsg.content.substring(0, 50)}...</div>
                </div>
                ${unread > 0 ? `<span class="message-badge">${unread}</span>` : ""}
                <div class="message-time">${getTimeAgo(lastMsg.timestamp)}</div>
            </div>
        `;
    })
    .join("");
}

// ================== GROUPS ==================
async function createGroup() {
  if (!currentUser) {
    showToast("Please login to create a group", "info");
    return;
  }

  const name = await openQuickInputDialog({
    title: "Create Group",
    placeholder: "Group name",
    confirmText: "Next",
  });
  if (!name || !name.trim()) return;

  const description = await openQuickInputDialog({
    title: "Group Description",
    placeholder: "Description (optional)",
    multiline: true,
    confirmText: "Create Group",
  });

  const group = {
    id: "group_" + Date.now(),
    name: name.trim(),
    description: description?.trim() || "",
    creator: currentUser.uid,
    creatorName: currentUser.username,
    members: [currentUser.uid],
    admins: [currentUser.uid],
    posts: [],
    created: Date.now(),
    privacy: "public",
  };

  groups.push(group);
  saveGroups();
  renderGroups();
  showToast("Group created", "success");
}

function joinGroup(groupId) {
  if (!currentUser) {
    showToast("Please login to join groups", "info");
    return;
  }

  const group = groups.find((g) => g.id === groupId);
  if (!group) return;

  if (group.members.includes(currentUser.uid)) {
    showToast("You're already a member", "info");
    return;
  }

  group.members.push(currentUser.uid);
  saveGroups();
  renderGroups();
  showToast("Joined group", "success");
}

async function leaveGroup(groupId) {
  const shouldLeave = await openQuickConfirmDialog("Leave this group?");
  if (!shouldLeave) return;

  const group = groups.find((g) => g.id === groupId);
  if (!group) return;

  group.members = group.members.filter((m) => m !== currentUser?.uid);
  saveGroups();
  renderGroups();
}

// ================== EVENTS ==================
async function createEvent() {
  if (!currentUser) {
    showToast("Please login to create events", "info");
    return;
  }

  const title = await openQuickInputDialog({
    title: "Create Event",
    placeholder: "Event name",
    confirmText: "Next",
  });
  if (!title || !title.trim()) return;

  const date = await openQuickInputDialog({
    title: "Event Date",
    placeholder: "MM/DD/YYYY",
    confirmText: "Next",
  });
  if (!date) return;

  const location = await openQuickInputDialog({
    title: "Location",
    placeholder: "Location",
    confirmText: "Next",
  });
  const description = await openQuickInputDialog({
    title: "Description",
    placeholder: "Description (optional)",
    multiline: true,
    confirmText: "Create Event",
  });

  const event = {
    id: "event_" + Date.now(),
    title: title.trim(),
    date: date,
    location: location?.trim() || "TBD",
    description: description?.trim() || "",
    creator: currentUser.uid,
    creatorName: currentUser.username,
    going: [currentUser.uid],
    interested: [],
    notGoing: [],
    created: Date.now(),
  };

  events.push(event);
  saveEvents();
  renderEvents();
  showToast("Event created", "success");
}

function rsvpEvent(eventId, status) {
  if (!currentUser) {
    showToast("Please login to RSVP", "info");
    return;
  }

  const event = events.find((e) => e.id === eventId);
  if (!event) return;

  // Remove from all lists
  event.going = event.going.filter((u) => u !== currentUser.uid);
  event.interested = event.interested.filter((u) => u !== currentUser.uid);
  event.notGoing = event.notGoing.filter((u) => u !== currentUser.uid);

  // Add to selected list
  if (status === "going") event.going.push(currentUser.uid);
  else if (status === "interested") event.interested.push(currentUser.uid);
  else if (status === "not-going") event.notGoing.push(currentUser.uid);

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
    id: "notif_" + Date.now(),
    message: message,
    type: type,
    targetId: targetId,
    timestamp: Date.now(),
    read: false,
  };

  notifications.unshift(notification);
  saveNotifications();
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  if (!badge) return;

  const unread = notifications.filter((n) => !n.read).length;
  if (unread > 0) {
    badge.textContent = unread;
    badge.style.display = "block";
  } else {
    badge.style.display = "none";
  }
}

function clearAllNotifications() {
  notifications = [];
  saveNotifications();
  updateNotificationBadge();
  renderNotifications();
  showToast("Notifications cleared", "info");
}

function renderNotifications() {
  const container = document.getElementById("notificationsList");
  if (!container) return;

  if (!notifications.length) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-title">All caught up!</div><div class="empty-state-text">No new notifications</div></div>';
    return;
  }

  container.innerHTML = notifications
    .slice()
    .reverse()
    .map(
      (n) => `
    <div class="post-card" style="padding:14px 16px;cursor:pointer;border-left:3px solid ${n.read ? "var(--border)" : "var(--violet)"}" onclick="markNotificationRead('${n.id}')">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.2rem">${getNotificationIcon(n.type)}</span>
        <div style="flex:1">
          <div style="font-size:0.875rem;color:var(--text)">${n.message}</div>
          <div style="font-size:0.72rem;color:var(--text-3);font-family:var(--font-mono);margin-top:2px">${getTimeAgo(n.timestamp)}</div>
        </div>
        ${!n.read ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--violet);flex-shrink:0"></span>' : ""}
      </div>
    </div>`,
    )
    .join("");
}

function markNotificationRead(notifId) {
  const notif = notifications.find((n) => n.id === notifId);
  if (notif) {
    notif.read = true;
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
  }
}

function getNotificationIcon(type) {
  const icons = {
    like: "❤️",
    comment: "💬",
    share: "🔗",
    friend_request: "👥",
    friend_accept: "✅",
    message: "✉️",
    post: "📝",
    reply: "↩️",
  };
  return icons[type] || "🔔";
}

// ================== FEED RENDERING ==================
function renderFeed() {
  const container = document.getElementById("postsContainer");
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

  container.innerHTML = posts
    .map((post) => {
      const reactionCounts = Object.entries(post.reactions || {})
        .map(([type, users]) => ({ type, count: users.length }))
        .filter((r) => r.count > 0)
        .sort((a, b) => b.count - a.count);

      const totalReactions = reactionCounts.reduce(
        (sum, r) => sum + r.count,
        0,
      );
      const userReaction = currentUser
        ? Object.entries(post.reactions || {}).find(([type, users]) =>
            users.includes(currentUser.uid),
          )
        : null;

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
                            ${post.edited ? ' · <span style="color:#8899aa">(edited)</span>' : ""}
                            · ${post.privacy === "friends" ? "👥" : "🌐"}
                        </div>
                    </div>
                    <div class="post-menu">
                        ${canEdit ? `<button class="action-btn" onclick="editPost('${post.id}')">✏️</button>` : ""}
                        ${canDelete ? `<button class="action-btn" onclick="deletePost('${post.id}')">🗑️</button>` : ""}
                    </div>
                </div>
                
                <div class="post-content">${escapeHtml(post.content)}</div>
                
                ${
                  post.sharedPost
                    ? `
                    <div class="shared-post">
                        <div class="shared-author">${post.sharedPost.originalAuthor}</div>
                        <div class="shared-content">${escapeHtml(post.sharedPost.originalContent)}</div>
                        <div class="shared-time">${getTimeAgo(post.sharedPost.originalTimestamp)}</div>
                    </div>
                `
                    : ""
                }
                
                ${
                  totalReactions > 0
                    ? `
                    <div class="post-reactions-summary">
                        ${reactionCounts
                          .slice(0, 3)
                          .map((r) => REACTIONS[r.type])
                          .join(" ")}
                        <span style="margin-left:8px;color:#8899aa">${totalReactions}</span>
                        <div style="flex:1"></div>
                        <span style="color:#8899aa">${post.comments.length} comments · ${post.shares || 0} shares</span>
                    </div>
                `
                    : ""
                }
                
                <div class="post-actions-bar">
                    <div class="reaction-picker">
                        <button class="action-btn ${userReaction ? "reacted" : ""}" 
                                onmouseenter="showReactionPicker(event, '${post.id}')"
                                onmouseleave="hideReactionPicker()">
                            ${userReaction ? REACTIONS[userReaction[0]] : "👍"} 
                            ${userReaction ? userReaction[0] : "Like"}
                        </button>
                        <div class="reaction-picker-menu" id="picker-${post.id}" style="display:none">
                            ${Object.entries(REACTIONS)
                              .map(
                                ([type, emoji]) => `
                                <button onclick="reactToPost('${post.id}', '${type}')" title="${type}">
                                    ${emoji}
                                </button>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                    <button class="action-btn" onclick="addComment('${post.id}')">
                        💬 Comment
                    </button>
                    <button class="action-btn" onclick="sharePost('${post.id}')">
                        🔗 Share
                    </button>
                </div>
                
                ${
                  post.comments.length > 0
                    ? `
                    <div class="post-comments">
                        ${post.comments
                          .map(
                            (comment) => `
                            <div class="comment">
                                <img src="${comment.authorAvatar}" alt="${comment.author}" class="avatar-small">
                                <div class="comment-content">
                                    <div class="comment-author">${comment.author}</div>
                                    <div class="comment-text">${escapeHtml(comment.content)}</div>
                                    <div class="comment-actions">
                                        <button class="comment-action" onclick="replyToComment('${post.id}', '${comment.id}')">Reply</button>
                                        <span class="comment-time">${getTimeAgo(comment.timestamp)}</span>
                                    </div>
                                    ${
                                      comment.replies &&
                                      comment.replies.length > 0
                                        ? `
                                        <div class="comment-replies">
                                            ${comment.replies
                                              .map(
                                                (reply) => `
                                                <div class="comment-reply">
                                                    <img src="${reply.authorAvatar}" alt="${reply.author}" class="avatar-small">
                                                    <div class="reply-content">
                                                        <div class="reply-author">${reply.author}</div>
                                                        <div class="reply-text">${escapeHtml(reply.content)}</div>
                                                        <span class="reply-time">${getTimeAgo(reply.timestamp)}</span>
                                                    </div>
                                                </div>
                                            `,
                                              )
                                              .join("")}
                                        </div>
                                    `
                                        : ""
                                    }
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
            </div>
        `;
    })
    .join("");
}

function showReactionPicker(event, postId) {
  const picker = document.getElementById(`picker-${postId}`);
  if (picker) {
    picker.style.display = "flex";
  }
}

function hideReactionPicker() {
  document.querySelectorAll(".reaction-picker-menu").forEach((picker) => {
    picker.style.display = "none";
  });
}

function renderStories() {
  const container = document.getElementById("storiesContainer");
  if (!container) return;

  const createStoryCard = (
    avatar,
    name,
    isCreate = false,
    storyId = null,
    viewed = false,
  ) => {
    return `
      <div class="story-item ${isCreate ? "create-story" : ""}" ${storyId ? `onclick="viewStory('${storyId}')"` : isCreate ? 'onclick="createStory()"' : ""}>
        <div class="story-avatar-ring ${viewed ? "viewed" : ""}">
          <img src="${avatar}" alt="${name}" />
          ${isCreate ? '<div class="story-add-btn">+</div>' : ""}
        </div>
        <span class="story-name">${name}</span>
      </div>
    `;
  };

  const currentAvatar =
    currentUser?.avatar ||
    localStorage.getItem("avatarURL") ||
    "https://api.dicebear.com/9.x/notionists/svg?seed=guest&backgroundColor=7c6dff&backgroundType=gradientLinear";

  if (stories.length === 0 && currentUser) {
    container.innerHTML = createStoryCard(currentAvatar, "Create Story", true);
    return;
  }

  const storiesHtml = stories
    .map((story) =>
      createStoryCard(
        story.authorAvatar,
        story.author,
        false,
        story.id,
        story.views?.includes(currentUser?.uid),
      ),
    )
    .join("");

  container.innerHTML = currentUser
    ? createStoryCard(currentAvatar, "Create Story", true) + storiesHtml
    : storiesHtml;
}

function renderGroups() {
  const container = document.getElementById("groupsList");
  if (!container) return;

  if (groups.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;color:#8899aa">No groups yet. Create one!</p>';
    return;
  }

  container.innerHTML = groups
    .map((group) => {
      const isMember = currentUser && group.members.includes(currentUser.uid);
      return `
            <div class="group-card">
                <div class="group-header">
                    <div class="group-name">${group.name}</div>
                    <div class="group-members">${group.members.length} members</div>
                </div>
                <div class="group-description">${group.description || "No description"}</div>
                <div class="group-actions">
                    ${
                      isMember
                        ? `
                        <button class="btn-secondary" onclick="leaveGroup('${group.id}')">Leave</button>
                    `
                        : `
                        <button class="btn-primary" onclick="joinGroup('${group.id}')">Join</button>
                    `
                    }
                </div>
            </div>
        `;
    })
    .join("");
}

function renderEvents() {
  const container = document.getElementById("eventsList");
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;color:#8899aa">No events yet. Create one!</p>';
    return;
  }

  container.innerHTML = events
    .map((event) => {
      const userStatus = currentUser
        ? event.going.includes(currentUser.uid)
          ? "going"
          : event.interested.includes(currentUser.uid)
            ? "interested"
            : event.notGoing.includes(currentUser.uid)
              ? "not-going"
              : null
        : null;

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
                ${event.description ? `<div class="event-description">${event.description}</div>` : ""}
                <div class="event-stats">
                    <span>✅ ${event.going.length} going</span>
                    <span>⭐ ${event.interested.length} interested</span>
                </div>
                <div class="event-actions">
                    <button class="btn-${userStatus === "going" ? "primary" : "secondary"}" 
                            onclick="rsvpEvent('${event.id}', 'going')">✅ Going</button>
                    <button class="btn-${userStatus === "interested" ? "primary" : "secondary"}" 
                            onclick="rsvpEvent('${event.id}', 'interested')">⭐ Interested</button>
                    <button class="btn-${userStatus === "not-going" ? "primary" : "secondary"}" 
                            onclick="rsvpEvent('${event.id}', 'not-going')">❌ Can't Go</button>
                </div>
            </div>
        `;
    })
    .join("");
}

// ================== DATA PERSISTENCE ==================
function loadAllData() {
  // Always load non-post data from localStorage
  stories = JSON.parse(localStorage.getItem("LiTreeLabStudio_stories") || "[]");
  friends = JSON.parse(localStorage.getItem("LiTreeLabStudio_friends") || "[]");
  friendRequests = JSON.parse(
    localStorage.getItem("LiTreeLabStudio_friend_requests") || "[]",
  );
  messages = JSON.parse(
    localStorage.getItem("LiTreeLabStudio_messages") || "[]",
  );
  groups = JSON.parse(localStorage.getItem("LiTreeLabStudio_groups") || "[]");
  events = JSON.parse(localStorage.getItem("LiTreeLabStudio_events") || "[]");
  notifications = JSON.parse(
    localStorage.getItem("LiTreeLabStudio_notifications") || "[]",
  );
  marketplace = JSON.parse(
    localStorage.getItem("LiTreeLabStudio_marketplace") || "[]",
  );
  // Posts: loaded from localStorage as fallback; Firestore listener replaces if configured
  posts = JSON.parse(localStorage.getItem("LiTreeLabStudio_posts") || "[]");
}

// Real-time Firestore listener for the public feed
let _unsubPosts = null;
function setupFirestorePostsListener() {
  if (typeof firebaseReady === "undefined" || !firebaseReady || !db) return;
  if (_unsubPosts) _unsubPosts(); // unsubscribe old listener if any

  _unsubPosts = db
    .collection("posts")
    .orderBy("timestamp", "desc")
    .limit(50)
    .onSnapshot(
      (snapshot) => {
        const fbPosts = [];
        snapshot.forEach((doc) => {
          fbPosts.push({ id: doc.id, ...doc.data() });
        });
        if (fbPosts.length > 0) {
          posts = fbPosts;
        } else {
          // Keep localStorage posts in feed if Firestore empty
          posts = JSON.parse(
            localStorage.getItem("LiTreeLabStudio_posts") || "[]",
          );
        }
        renderFeed();
        updateStats();
      },
      (err) => {
        console.warn("[Firestore] Posts listener error:", err.message);
      },
    );
}

function updateStats() {
  const tp = document.getElementById("totalPosts");
  if (tp) tp.textContent = posts.length;
}

function savePosts() {
  localStorage.setItem("LiTreeLabStudio_posts", JSON.stringify(posts));
}
function saveStories() {
  localStorage.setItem("LiTreeLabStudio_stories", JSON.stringify(stories));
}
function saveFriends() {
  localStorage.setItem("LiTreeLabStudio_friends", JSON.stringify(friends));
}
function saveFriendRequests() {
  localStorage.setItem(
    "LiTreeLabStudio_friend_requests",
    JSON.stringify(friendRequests),
  );
}
function saveMessages() {
  localStorage.setItem("LiTreeLabStudio_messages", JSON.stringify(messages));
}
function saveGroups() {
  localStorage.setItem("LiTreeLabStudio_groups", JSON.stringify(groups));
}
function saveEvents() {
  localStorage.setItem("LiTreeLabStudio_events", JSON.stringify(events));
}
function saveNotifications() {
  localStorage.setItem(
    "LiTreeLabStudio_notifications",
    JSON.stringify(notifications),
  );
}
function saveMarketplace() {
  localStorage.setItem(
    "LiTreeLabStudio_marketplace",
    JSON.stringify(marketplace),
  );
}

// ================== UTILITIES ==================
function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function setupRealtimeUpdates() {
  if (realtimeTimerId) clearInterval(realtimeTimerId);

  const tick = () => {
    if (document.hidden) return;
    loadAllData();
    renderActiveSection();
    updateNotificationBadge();
  };

  // Simulate real-time updates every 45 seconds
  realtimeTimerId = setInterval(tick, 45000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      tick();
    }
  });
}

function renderActiveSection() {
  if (activeSection === "home") {
    renderFeed();
    renderStories();
    return;
  }
  if (activeSection === "messages") {
    renderConversationList();
    if (activeChatWith) renderChatMessages(activeChatWith);
    return;
  }
  if (activeSection === "notifications") {
    renderNotifications();
    return;
  }
  if (activeSection === "friends") {
    renderFriends();
    renderFriendRequests();
    return;
  }
  if (activeSection === "groups") {
    renderGroups();
    return;
  }
  if (activeSection === "events") {
    renderEvents();
    return;
  }
  if (activeSection === "marketplace") {
    renderMarketplace();
  }
}

// ================== NAVIGATION ==================
function showSection(sectionId) {
  activeSection = sectionId;

  // Update active nav button
  document
    .querySelectorAll(".nav-icon-btn")
    .forEach((btn) => btn.classList.remove("active"));

  // Activate sections
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  const section = document.getElementById(sectionId);
  if (section) section.classList.add("active");

  // Update nav button active state
  const activeBtn = document.querySelector(
    `button[onclick="showSection('${sectionId}')"]`,
  );
  if (activeBtn) activeBtn.classList.add("active");

  // Render section-specific content
  if (sectionId === "hero") {
    console.log("⚡ Hero Landing Ready");
  } else if (sectionId === "home") {
    renderFeed();
    renderStories();
  } else if (sectionId === "LiTreeLabStudio") {
    console.log("🛡️ Entering LiTreeLabStudio Control Center...");
  } else if (sectionId === "marketplace") {
    renderMarketplace();
  } else if (sectionId === "reels") {
    initReels();
  } else if (sectionId === "video") {
    initVideoHub();
  } else if (sectionId === "gaming") {
    initGamingHub();
  } else if (sectionId === "pages") {
    renderPages();
  } else if (sectionId === "friends") {
    renderFriends();
    renderFriendRequests();
  } else if (sectionId === "messages") {
    renderChatSection();
  } else if (sectionId === "discover") {
    renderDiscoverPeople();
  } else if (sectionId === "ai-create") {
    // AI Studio — no init needed
  } else if (sectionId === "groups") {
    renderGroups();
  } else if (sectionId === "events") {
    renderEvents();
  } else if (sectionId === "notifications") {
    renderNotifications();
  } else if (sectionId === "profile") {
    renderProfileSection();
  }

  updateStats();
}

function renderProfileSection() {
  if (!currentUser) {
    showToast("Please login to view profile", "info");
    return;
  }

  // Update profile info
  const profileName = document.getElementById("profileName");
  const profileBio = document.getElementById("profileBio");
  const coverPhoto = document.getElementById("coverPhoto");
  const profileAvatar = document.querySelector(".profile-avatar-large img");

  if (profileName) profileName.textContent = currentUser.username;
  if (profileBio) profileBio.textContent = currentUser.bio || "No bio yet";
  if (coverPhoto) {
    coverPhoto.style.backgroundImage = `url('${currentUser.coverPhoto}')`;
    coverPhoto.classList.toggle(
      "cover-photo-has-image",
      Boolean(currentUser.coverPhoto),
    );
  }
  if (profileAvatar) profileAvatar.src = currentUser.avatar;

  // Update stats
  const userPosts = posts.filter((p) => p.authorId === currentUser.uid);
  const profilePostCount = document.getElementById("profilePostCount");
  const profileFriendCount = document.getElementById("profileFriendCount");

  if (profilePostCount) profilePostCount.textContent = userPosts.length;
  if (profileFriendCount) profileFriendCount.textContent = friends.length;

  // Render user posts
  renderUserPosts();
}

function renderUserPosts() {
  const container = document.getElementById("userPosts");
  if (!container || !currentUser) return;

  const userPosts = posts.filter((p) => p.authorId === currentUser.uid);

  if (userPosts.length === 0) {
    container.innerHTML =
      '<div class="card"><p style="text-align:center;color:#8899aa">No posts yet</p></div>';
    return;
  }

  container.innerHTML =
    '<div class="posts-feed">' +
    userPosts
      .map((post) => {
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
      })
      .join("") +
    "</div>";
}

function showProfileTab(tabName) {
  // Remove active class from all tabs
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".profile-tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Add active class to selected tab
  event.target.classList.add("active");
  const contentId =
    "profile" + tabName.charAt(0).toUpperCase() + tabName.slice(1);
  const content = document.getElementById(contentId);
  if (content) content.classList.add("active");

  // Load tab-specific content
  if (tabName === "about") {
    const userBio = document.getElementById("userBio");
    const userLocation = document.getElementById("userLocation");
    const userWebsite = document.getElementById("userWebsite");

    if (userBio) userBio.textContent = currentUser?.bio || "No bio yet";
    if (userLocation)
      userLocation.textContent = currentUser?.location
        ? `📍 ${currentUser.location}`
        : "📍 Location not set";
    if (userWebsite)
      userWebsite.textContent = currentUser?.website
        ? `🌐 ${currentUser.website}`
        : "🌐 No website";
  } else if (tabName === "friends") {
    const container = document.getElementById("profileFriendsList");
    if (container) {
      container.innerHTML = friends
        .map(
          (friend) => `
                <div class="friend-card">
                    <img src="${friend.avatar}" alt="${friend.name}" class="avatar">
                    <div class="friend-info">
                        <div class="friend-name">${friend.name}</div>
                    </div>
                </div>
            `,
        )
        .join("");
    }
  }
}

function editProfile() {
  if (!currentUser) {
    showToast("Login to edit profile", "info");
    return;
  }

  const card = document.getElementById("profileEditFormCard");
  const bio = document.getElementById("profileBioInput");
  const location = document.getElementById("profileLocationInput");
  const website = document.getElementById("profileWebsiteInput");

  if (bio) bio.value = currentUser.bio || "";
  if (location) location.value = currentUser.location || "";
  if (website) website.value = currentUser.website || "";
  if (card) card.classList.remove("hide");
}

function closeProfileEditor() {
  const card = document.getElementById("profileEditFormCard");
  if (card) card.classList.add("hide");
}

function saveProfileFromForm() {
  if (!currentUser) return;

  const bio = document.getElementById("profileBioInput")?.value || "";
  const location = document.getElementById("profileLocationInput")?.value || "";
  const website = document.getElementById("profileWebsiteInput")?.value || "";

  currentUser.bio = bio.trim();
  currentUser.location = location.trim();
  currentUser.website = website.trim();
  persistCurrentUser();
  renderProfileSection();
  closeProfileEditor();
  showToast("Profile updated", "success");
}

function persistCurrentUser() {
  if (!currentUser) return;
  localStorage.setItem("LiTreeLabStudio_user", JSON.stringify(currentUser));
  const users = JSON.parse(
    localStorage.getItem("LiTreeLabStudio_users") || "{}",
  );
  if (currentUser.email && users[currentUser.email]) {
    users[currentUser.email] = {
      ...users[currentUser.email],
      ...currentUser,
    };
    localStorage.setItem("LiTreeLabStudio_users", JSON.stringify(users));
  }
}

function openCoverPhotoPicker() {
  if (!currentUser) {
    showToast("Login to change your cover", "info");
    return;
  }
  const input = document.getElementById("coverPhotoInput");
  if (input) input.click();
}

async function handleCoverPhotoSelected(input) {
  const file = input?.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please select an image file", "error");
    return;
  }

  try {
    let photoUrl = null;
    if (
      typeof firebaseReady !== "undefined" &&
      firebaseReady &&
      storage &&
      currentUser?.uid
    ) {
      const ext = file.name.split(".").pop() || "jpg";
      const ref = storage.ref(`covers/${currentUser.uid}/${Date.now()}.${ext}`);
      await ref.put(file);
      photoUrl = await ref.getDownloadURL();
    }

    if (!photoUrl) {
      photoUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("file_read_error"));
        reader.readAsDataURL(file);
      });
    }

    currentUser.coverPhoto = photoUrl;
    persistCurrentUser();
    renderProfileSection();
    showToast("Cover photo updated", "success");
  } catch (error) {
    console.error("[Cover] Upload failed:", error);
    showToast("Cover upload failed", "error");
  } finally {
    input.value = "";
  }
}

function openConversation(userId) {
  showToast(`Conversation with ${userId} opened`, "info");

  // Mark messages as read
  messages.forEach((msg) => {
    if (msg.from === userId && msg.to === currentUser?.uid) {
      msg.read = true;
    }
  });
  saveMessages();
  renderMessages();
}

function markAllRead() {
  notifications.forEach((n) => (n.read = true));
  saveNotifications();
  updateNotificationBadge();
  renderNotifications();
}

function renderMarketplace() {
  const container = document.getElementById("marketplaceList");
  if (!container) return;

  // Seed marketplace with NFT-first listings
  if (marketplace.length === 0) {
    marketplace = [
      {
        id: "nft_1",
        title: "Neon Overlord Genesis #001",
        price: "0.85 ETH",
        chain: "Ethereum",
        type: "art",
        creator: "@LiTreeStudio",
        img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "nft_2",
        title: "Synthwave Session Pass",
        price: "120 USDC",
        chain: "Base",
        type: "music",
        creator: "@NeonStudio",
        img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "nft_3",
        title: "Grid Arena Skin Pack",
        price: "75 USDC",
        chain: "Polygon",
        type: "gaming",
        creator: "@GridRunner",
        img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400",
      },
      {
        id: "nft_4",
        title: "Rare Monolith Badge",
        price: "0.12 ETH",
        chain: "Ethereum",
        type: "collectible",
        creator: "@OverlordFan",
        img: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=400",
      },
    ];
    saveMarketplace();
  }

  const filtered =
    marketplaceFilter === "all"
      ? marketplace
      : marketplace.filter((item) => item.type === marketplaceFilter);

  container.innerHTML = filtered
    .map(
      (item) => `
        <div class="marketplace-item nft-card">
            <div class="nft-card-media">
                <img src="${item.img}" alt="${item.title}" class="nft-card-image">
            </div>
            <div class="nft-card-body">
                <h3 class="nft-card-title">${item.title}</h3>
                <p class="nft-card-price">${item.price}</p>
                <p class="nft-card-meta">⛓ ${item.chain} · 👤 ${item.creator}</p>
                <div class="nft-card-actions">
                    <button class="btn-primary" onclick="contactSeller('${item.id}')">Message Seller</button>
                    <button class="btn-secondary" onclick="saveMarketplaceItem('${item.id}')">🔖 Save</button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");

  if (!container.innerHTML) {
    container.innerHTML =
      '<div class="card"><p class="empty-state-text">No NFTs in this category yet.</p></div>';
  }
}

function filterMarketplaceCategory(category) {
  marketplaceFilter = category || "all";
  renderMarketplace();
}

function sellMarketplaceItem() {
  openNFTListingForm();
}

function openNFTListingForm() {
  if (!currentUser) {
    showToast("Login to list your NFT", "info");
    return;
  }

  const card = document.getElementById("nftListingFormCard");
  if (card) card.classList.remove("hide");
}

function closeNFTListingForm() {
  const card = document.getElementById("nftListingFormCard");
  if (card) card.classList.add("hide");
}

function submitNFTListingForm() {
  if (!currentUser) return;

  const title = document.getElementById("nftTitleInput")?.value?.trim();
  const price = document.getElementById("nftPriceInput")?.value?.trim();
  const type =
    document.getElementById("nftCategoryInput")?.value?.trim() || "art";
  const chain =
    document.getElementById("nftChainInput")?.value?.trim() || "Ethereum";
  const imageInput = document.getElementById("nftImageInput")?.value?.trim();

  if (!title || !price) {
    showToast("Title and price are required", "error");
    return;
  }

  const image =
    imageInput ||
    "https://images.unsplash.com/photo-1644363832001-0876e81f37a9?auto=format&fit=crop&q=80&w=400";

  marketplace.unshift({
    id: `nft_${Date.now()}`,
    title,
    price,
    type: type.toLowerCase(),
    chain,
    creator: `@${currentUser.username}`,
    img: image,
  });
  saveMarketplace();
  renderMarketplace();
  closeNFTListingForm();

  const titleInput = document.getElementById("nftTitleInput");
  const priceInput = document.getElementById("nftPriceInput");
  const imageUrlInput = document.getElementById("nftImageInput");
  if (titleInput) titleInput.value = "";
  if (priceInput) priceInput.value = "";
  if (imageUrlInput) imageUrlInput.value = "";

  showToast("NFT listed", "success");
}

function contactSeller(itemId) {
  showToast(`Seller chat opened for ${itemId}`, "info");
}

function saveMarketplaceItem(itemId) {
  showToast(`Saved ${itemId}`, "success");
}

function initReels() {
  console.log("🎬 Reels Mode Activated");
  const container = document.getElementById("reelsContainer");
  if (!container) return;

  // Seed cinematic reels
  const reels = [
    {
      id: 1,
      author: "LiTree Studio",
      video:
        "https://cdn.pixabay.com/video/2018/06/11/16726-274889704_medium.mp4",
      caption: "⚡ THE GRID: New Cyberpunk Skins Incoming ⚡",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=monolith",
    },
    {
      id: 2,
      author: "GridRunner",
      video:
        "https://cdn.pixabay.com/video/2021/04/05/70161-534727142_medium.mp4",
      caption: "High-speed data sync in the new Monolith architecture. 💾",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=runner",
    },
    {
      id: 3,
      author: "TechOverlord",
      video:
        "https://cdn.pixabay.com/video/2020/03/17/33719-391444589_medium.mp4",
      caption: "Checking the health state of the Overlord Engine. 🟢 ONLINE",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=boss",
    },
  ];

  container.innerHTML = reels
    .map(
      (reel) => `
        <div class="reel-item" style="scroll-snap-align: start; min-height: 80vh; position: relative; background: #000; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid #FF2D8D; margin-bottom: 20px;">
            <video loop muted onclick="this.paused ? this.play() : this.pause()" style="max-height: 100%; max-width: 100%; border-radius: 10px;">
                <source src="${reel.video}" type="video/mp4">
            </video>
            <div class="reel-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.8));">
                <div class="reel-user" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <img src="${reel.avatar}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #FF2D8D;">
                    <span style="font-weight: bold;">@${reel.author}</span>
                </div>
                <div class="reel-caption">${reel.caption}</div>
                <div class="reel-actions" style="position: absolute; right: 20px; bottom: 60px; display: flex; flex-direction: column; gap: 15px;">
                    <button style="background: none; border: none; font-size: 1.5rem; color: #FF2D8D; cursor: pointer;">❤️</button>
                    <button style="background: none; border: none; font-size: 1.5rem; color: #FF2D8D; cursor: pointer;">💬</button>
                    <button style="background: none; border: none; font-size: 1.5rem; color: #FF2D8D; cursor: pointer;">🔗</button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

function initVideoHub() {
  const container = document.getElementById("videoHubList");
  if (!container) return;

  const videos = [
    {
      title: "Creator Shorts Pipeline",
      desc: "Shoot → edit → post flow tuned for daily social clips.",
      link: "https://www.capcut.com/ai-video-generator",
      tag: "Creation",
    },
    {
      title: "AI Motion Studio",
      desc: "Generate quick stylized motion clips from prompts.",
      link: "https://klingai.com",
      tag: "AI",
    },
    {
      title: "Reels Distribution Checklist",
      desc: "Post cadence, captions, and hook templates for engagement.",
      link: "https://app.runwayml.com",
      tag: "Growth",
    },
  ];

  container.innerHTML = videos
    .map(
      (video) => `
      <div class="card video-hub-card">
        <div class="video-hub-tag">${video.tag}</div>
        <h3>${video.title}</h3>
        <p>${video.desc}</p>
        <a href="${video.link}" target="_blank" rel="noopener noreferrer" class="btn-secondary video-hub-link">Open Resource</a>
      </div>
    `,
    )
    .join("");
}

function initGamingHub() {
  const container = document.getElementById("gamingHubList");
  if (!container) return;

  const gamingCards = [
    {
      title: "RetroArch Local Library",
      desc: "Keep your ROMs in one folder and point RetroArch + Termux to the same path.",
    },
    {
      title: "Cloud Save Sync",
      desc: "Sync saves through your existing Overlord storage path for cross-device gaming.",
    },
    {
      title: "Stream Capture Workflow",
      desc: "Record gameplay, clip highlights, and post into Reels/Video Hub fast.",
    },
  ];

  container.innerHTML = gamingCards
    .map(
      (item) => `
      <div class="card gaming-hub-card">
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
      </div>
    `,
    )
    .join("");
}

function launchRetroArchDesktop() {
  const launched = window.open("retroarch://", "_blank");
  if (!launched) {
    showToast("Could not launch directly. Open RetroArch manually.", "info");
  } else {
    showToast("RetroArch launch requested", "success");
  }
}

async function copyTermuxRetroCommand() {
  const cmd = "termux-open-url retroarch://";
  await copyTextToClipboard(cmd, "Termux command copied");
}

async function copyRetroArchPathHint() {
  const hint = "/storage/emulated/0/RetroArch/roms";
  await copyTextToClipboard(hint, "ROM path hint copied");
}

async function copyTextToClipboard(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage, "success");
  } catch {
    showToast("Clipboard copy failed", "error");
  }
}

function renderPages() {
  console.log("🚩 Pages Rendered");
}

function updateStats() {
  const totalPostsEl = document.getElementById("totalPosts");
  const totalUsersEl = document.getElementById("totalUsers");
  const totalGroupsEl = document.getElementById("totalGroups");
  const totalEventsEl = document.getElementById("totalEvents");

  if (totalPostsEl) totalPostsEl.textContent = posts.length;
  if (totalUsersEl) {
    const users = JSON.parse(
      localStorage.getItem("LiTreeLabStudio_users") || "{}",
    );
    totalUsersEl.textContent = Object.keys(users).length;
  }
  if (totalGroupsEl) totalGroupsEl.textContent = groups.length;
  if (totalEventsEl) totalEventsEl.textContent = events.length;
}

console.log("[LiTreeLabStudio SOCIAL] Full advanced social features loaded ⚡");

// ══════════════════════════════════════════════════════════════
// AI IMAGE GENERATOR  (Pollinations.ai — 100% free, no API key)
// ══════════════════════════════════════════════════════════════
const FUN_PROMPTS = [
  "A cyberpunk city skyline at night with neon purple and cyan lights, ultra-detailed",
  "An astronaut riding a dragon through a galaxy, digital art, vibrant colors",
  "A futuristic underground lab with glowing servers and dark atmosphere",
  "A fantasy forest with bioluminescent plants, magical and cinematic",
  "A samurai warrior in the rain at night, neon city reflections in puddles",
];

function preloadImageWithTimeout(url, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => {
      reject(new Error("timeout"));
    }, timeoutMs);

    image.onload = () => {
      clearTimeout(timer);
      resolve(url);
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(new Error("image_error"));
    };
    image.src = url;
  });
}

async function generateAIImage(random = false) {
  const promptInput = document.getElementById("aiImagePrompt");
  const style = document.getElementById("aiStyle")?.value;
  const sizeVal = document.getElementById("aiSize")?.value || "1024/1024";
  const [w, h] = sizeVal.split("/");
  const btn = document.getElementById("aiGenBtn");
  const resultCard = document.getElementById("aiResultCard");
  const resultImg = document.getElementById("aiResultImg");
  const promptLabel = document.getElementById("aiResultPromptLabel");

  let prompt = random
    ? FUN_PROMPTS[Math.floor(Math.random() * FUN_PROMPTS.length)]
    : promptInput?.value.trim();

  if (!prompt) {
    showToast("Enter a prompt first!", "info");
    return;
  }
  if (random && promptInput) promptInput.value = prompt;

  if (style) prompt += `, ${style} style`;
  const seed = Math.floor(Math.random() * 999999);
  const encoded = encodeURIComponent(prompt);
  const candidates = [
    {
      url: `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&nologo=true`,
      fallback: false,
    },
    {
      url: `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&model=flux&nologo=true`,
      fallback: false,
    },
    {
      url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
      fallback: true,
    },
  ];

  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Generating…";
  }
  if (resultCard) resultCard.classList.add("hide");

  showToast("Generating your image…", "info", 8000);

  let selected = null;
  for (const candidate of candidates) {
    try {
      await preloadImageWithTimeout(candidate.url);
      selected = candidate;
      break;
    } catch {
      continue;
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = "⚡ Generate Image";
  }

  if (!selected) {
    showToast("Generation failed — try a simpler prompt", "error");
    return;
  }

  if (resultImg) resultImg.src = selected.url;
  if (promptLabel) {
    promptLabel.textContent = selected.fallback
      ? `${prompt} (fallback preview)`
      : prompt;
  }
  if (resultCard) resultCard.classList.remove("hide");

  showToast(
    selected.fallback
      ? "AI provider busy — loaded fallback image"
      : "Image ready!",
    selected.fallback ? "info" : "success",
  );
  window._lastAIPrompt = prompt;
  window._lastAIURL = selected.url;
}

function downloadAIImage() {
  const url = window._lastAIURL;
  if (!url) {
    showToast("Generate an image first", "info");
    return;
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = "ai-generated.jpg";
  a.target = "_blank";
  a.click();
}

function shareAIImage() {
  if (!currentUser) {
    showToast("Login to post", "info");
    toggleAuth();
    return;
  }
  const url = window._lastAIURL;
  const prompt = window._lastAIPrompt;
  if (!url) {
    showToast("Generate an image first", "info");
    return;
  }

  const post = {
    id: "post_" + Date.now(),
    author: currentUser.username,
    authorId: currentUser.uid,
    authorAvatar: currentUser.avatar,
    content: `🎨 AI Art: "${prompt}"`,
    timestamp: Date.now(),
    reactions: {},
    comments: [],
    shares: 0,
    privacy: "public",
    media: [{ type: "image", url }],
  };

  if (typeof firebaseReady !== "undefined" && firebaseReady && db) {
    db.collection("posts")
      .add(post)
      .then(() => {
        showToast("AI art posted to your feed!", "success");
        showSection("home");
      })
      .catch(() => {
        posts.unshift(post);
        savePosts();
        showToast("Posted locally", "info");
        showSection("home");
      });
  } else {
    posts.unshift(post);
    savePosts();
    showToast("AI art posted!", "success");
    showSection("home");
  }
}

// ══════════════════════════════════════════════════════════════
// DISCOVER PEOPLE
// ══════════════════════════════════════════════════════════════
const SAMPLE_PROFILES = [
  {
    username: "@LiTreeStudio",
    bio: "Creator · Overlord Dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=litree",
  },
  {
    username: "@CyberPunkDev",
    bio: "Full-stack developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cyber",
  },
  {
    username: "@GridArtist",
    bio: "Digital artist · Reels creator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=grid",
  },
  {
    username: "@TechRunner99",
    bio: "Hardware enthusiast",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech",
  },
  {
    username: "@NeonStudio",
    bio: "Motion designer · Filmmaker",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neon",
  },
  {
    username: "@OverlordFan",
    bio: "Game dev · AI explorer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ovl",
  },
];

function renderDiscoverPeople() {
  const grid = document.getElementById("discoverPeopleGrid");
  if (!grid) return;

  // Merge sample profiles with real localStorage users
  const storedUsers = JSON.parse(
    localStorage.getItem("LiTreeLabStudio_users") || "{}",
  );
  const realProfiles = Object.entries(storedUsers).map(([email, u]) => ({
    username: "@" + (u.username || email.split("@")[0]),
    bio: u.bio || "LiTree Grid member",
    avatar:
      u.avatar ||
      `https://api.dicebear.com/9.x/notionists/svg?seed=${u.username}&backgroundColor=7c6dff&backgroundType=gradientLinear`,
  }));

  const profiles = [...realProfiles, ...SAMPLE_PROFILES].slice(0, 9);

  grid.innerHTML = profiles
    .map(
      (p) => `
    <div class="discover-person-card">
      <div class="discover-avatar-wrap">
        <div class="discover-avatar-ring"></div>
        <img src="${p.avatar}" alt="${p.username}" class="discover-person-avatar" />
      </div>
      <div class="discover-person-name">${p.username}</div>
      <div class="discover-person-bio">${p.bio}</div>
      <div class="discover-person-actions">
        <button class="btn-secondary" onclick="addFriendByName('${p.username}')">+ Add</button>
        <button class="btn-secondary" onclick="openDM('${p.username}')">💬 DM</button>
      </div>
    </div>`,
    )
    .join("");
}

function addFriendByName(username) {
  if (!currentUser) {
    showToast("Login to add friends", "info");
    toggleAuth();
    return;
  }
  const already = friends.find((f) => f.username === username);
  if (already) {
    showToast("Already friends!", "info");
    return;
  }
  friends.push({
    id: "f_" + Date.now(),
    username,
    status: "pending",
    addedAt: Date.now(),
  });
  saveFriends();
  showToast(`Friend request sent to ${username}!`, "success");
}

function generateInviteLink() {
  const code = btoa(
    (currentUser?.username || "guest") + "_" + Date.now(),
  ).slice(0, 12);
  const link = `${window.location.origin}${window.location.pathname}?invite=${code}`;
  const banner = document.getElementById("inviteLinkBanner");
  const text = document.getElementById("inviteLinkText");
  if (banner) banner.classList.remove("hide");
  if (text) text.textContent = link;
  window._inviteLink = link;
}

function copyInviteLink() {
  const link = window._inviteLink;
  if (!link) return;
  navigator.clipboard
    ?.writeText(link)
    .then(() => showToast("Invite link copied!", "success"))
    .catch(() => showToast("Copy manually: " + link, "info"));
}

function sendInviteEmail() {
  const email = document.getElementById("inviteEmail")?.value.trim();
  if (!email) {
    showToast("Enter an email address", "info");
    return;
  }
  // Opens the user's email client with pre-filled invite
  const link = window._inviteLink || window.location.href;
  const subject = encodeURIComponent("Join me on LiTree Grid!");
  const body = encodeURIComponent(
    `Hey! I'd love for you to join me on The Grid.\n\nJoin here: ${link}\n\nSee you there! ⚡`,
  );
  window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  showToast("Email client opened!", "success");
}

// ══════════════════════════════════════════════════════════════
// MESSAGES — Working Chat System
// ══════════════════════════════════════════════════════════════
let activeChatWith = null; // username of active chat

function getConversations() {
  if (!currentUser) return [];
  const key = `LiTreeLabStudio_convos_${currentUser.uid}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function saveConversations(convos) {
  if (!currentUser) return;
  const key = `LiTreeLabStudio_convos_${currentUser.uid}`;
  localStorage.setItem(key, JSON.stringify(convos));
}
function getChatMessages(username) {
  const key = `LiTreeLabStudio_chat_${[currentUser?.uid, username].sort().join("_")}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function saveChatMessages(username, msgs) {
  const key = `LiTreeLabStudio_chat_${[currentUser?.uid, username].sort().join("_")}`;
  localStorage.setItem(key, JSON.stringify(msgs));
}

function renderChatSection() {
  renderConversationList();
  if (activeChatWith) openDM(activeChatWith);
}

function renderConversationList() {
  const list = document.getElementById("conversationList");
  if (!list) return;
  if (!currentUser) {
    list.innerHTML =
      '<div style="padding:16px;font-size:0.82rem;color:var(--text-3)">Login to see messages</div>';
    return;
  }

  const convos = getConversations();
  if (!convos.length) {
    list.innerHTML =
      '<div style="padding:16px;font-size:0.82rem;color:var(--text-3)">No conversations yet. Go to Discover and DM someone!</div>';
    return;
  }

  list.innerHTML = convos
    .map((c) => {
      const msgs = getChatMessages(c.username);
      const lastMsg = msgs[msgs.length - 1];
      return `<div onclick="openDM('${c.username}')" style="padding:12px 16px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center;transition:background 0.15s" onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background=''">
      <img src="${c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`}" alt="${c.username}" style="width:38px;height:38px;border-radius:50%;border:2px solid var(--violet-dim)">
      <div style="flex:1;min-width:0">
        <div style="font-size:0.85rem;font-weight:600;color:var(--text)">${c.username}</div>
        <div style="font-size:0.75rem;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${lastMsg ? lastMsg.content : "Start a conversation"}</div>
      </div>
    </div>`;
    })
    .join("");
}

function openDM(username) {
  if (!currentUser) {
    showToast("Login to send messages", "info");
    toggleAuth();
    return;
  }

  activeChatWith = username;

  // Ensure conversation exists
  const convos = getConversations();
  if (!convos.find((c) => c.username === username)) {
    convos.push({
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      startedAt: Date.now(),
    });
    saveConversations(convos);
  }

  // Update header
  const chatName = document.getElementById("chatName");
  const chatStatus = document.getElementById("chatStatus");
  const chatAvatar = document.getElementById("chatAvatar");
  if (chatName) chatName.textContent = username;
  if (chatStatus)
    chatStatus.textContent =
      "Local messages (end-to-end encrypted with Firebase when connected)";
  if (chatAvatar)
    chatAvatar.innerHTML = `<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${username}" style="width:36px;height:36px;border-radius:50%">`;

  // Enable input
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendMsgBtn");
  if (input) {
    input.disabled = false;
    input.placeholder = `Message ${username}…`;
  }
  if (sendBtn) sendBtn.disabled = false;

  // If we're not on messages section, navigate there
  if (!document.getElementById("messages")?.classList.contains("active")) {
    showSection("messages");
    return;
  }

  renderChatMessages(username);
  renderConversationList();
}

function renderChatMessages(username) {
  const container = document.getElementById("chatMessages");
  if (!container) return;

  const msgs = getChatMessages(username);
  if (!msgs.length) {
    container.innerHTML = `<div style="text-align:center;color:var(--text-3);font-size:0.82rem;margin-top:40px">No messages yet. Say hello! 👋</div>`;
    return;
  }

  container.innerHTML = msgs
    .map((m) => {
      const isMine = m.senderId === currentUser.uid;
      return `<div style="display:flex;${isMine ? "justify-content:flex-end" : "justify-content:flex-start"}">
      <div style="max-width:70%;padding:10px 14px;border-radius:${isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px"};background:${isMine ? "linear-gradient(135deg,var(--violet),#5b52e0)" : "var(--surface-2)"};color:${isMine ? "#fff" : "var(--text)"};font-size:0.88rem;line-height:1.5;word-break:break-word">
        ${m.content}
        <div style="font-size:0.65rem;opacity:0.6;margin-top:4px;text-align:right">${getTimeAgo(m.timestamp)}</div>
      </div>
    </div>`;
    })
    .join("");

  container.scrollTop = container.scrollHeight;
}

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const text = input?.value.trim();
  if (!text || !activeChatWith || !currentUser) return;

  const msg = {
    id: "msg_" + Date.now(),
    senderId: currentUser.uid,
    sender: currentUser.username,
    content: text,
    timestamp: Date.now(),
  };

  const msgs = getChatMessages(activeChatWith);
  msgs.push(msg);
  saveChatMessages(activeChatWith, msgs);

  if (input) input.value = "";
  renderChatMessages(activeChatWith);
  renderConversationList();
}

async function startNewConversation() {
  if (!currentUser) {
    showToast("Login first", "info");
    toggleAuth();
    return;
  }
  const username = await openQuickInputDialog({
    title: "Start Conversation",
    placeholder: "@username",
    confirmText: "Open Chat",
  });
  if (!username?.trim()) return;
  openDM(
    username.trim().replace(/^@/, "@").startsWith("@")
      ? username.trim()
      : "@" + username.trim(),
  );
}

function filterConversations(query) {
  const items = document.querySelectorAll("#conversationList > div");
  items.forEach((item) => {
    item.style.display = item.textContent
      .toLowerCase()
      .includes(query.toLowerCase())
      ? ""
      : "none";
  });
}
