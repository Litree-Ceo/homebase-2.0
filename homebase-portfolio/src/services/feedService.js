// Mock posts for testing
const mockPosts = [
  {
    id: 'post1',
    userId: 'user1',
    userName: 'Alice Chen',
    userAvatar: 'AC',
    content: 'Just finished an amazing coding session! 🚀',
    likes: ['user2', 'user3'],
    comments: [{ id: 'c1', userId: 'user2', text: 'Great work!', timestamp: Date.now() }],
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'post2',
    userId: 'user2',
    userName: 'Bob Smith',
    userAvatar: 'BS',
    content: 'Anyone up for a game of Tetris? 🎮',
    likes: ['user1'],
    comments: [],
    timestamp: Date.now() - 3600000,
  },
];

export const createPost = async (userId, userName, content) => {
  const post = {
    id: 'mock_' + Date.now(),
    userId,
    userName,
    userAvatar: userName.split(' ').map(n => n[0]).join(''),
    content,
    likes: [],
    comments: [],
    timestamp: Date.now(),
  };
  mockPosts.unshift(post);
  return post.id;
};

export const likePost = async (postId, userId) => {
  const post = mockPosts.find(p => p.id === postId);
  if (post) {
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
  }
};

export const addComment = async (postId, userId, userName, text) => {
  const post = mockPosts.find(p => p.id === postId);
  if (post) {
    post.comments.push({
      id: 'c' + Date.now(),
      userId,
      userName,
      text,
      timestamp: Date.now(),
    });
  }
};

export const subscribeToFeed = (callback) => {
  callback(mockPosts);
  return () => {};
};

export const sharePost = async (postId) => {
  console.log('Shared post', postId);
};

export const deletePost = async (postId) => {
  const idx = mockPosts.findIndex(p => p.id === postId);
  if (idx !== -1) mockPosts.splice(idx, 1);
};
