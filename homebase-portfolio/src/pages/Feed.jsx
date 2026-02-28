import { useState, useEffect } from 'react';
import { subscribeToFeed, createPost, likePost, addComment } from '../services/feedService';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [commentText, setCommentText] = useState({});
  const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{"id":"demo1","name":"Demo User"}');

  useEffect(() => {
    const unsubscribe = subscribeToFeed(setPosts);
    return () => unsubscribe();
  }, []);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    createPost(demoUser.id, demoUser.name, newPost);
    setNewPost('');
  };

  const handleLike = (postId) => {
    likePost(postId, demoUser.id);
  };

  const handleComment = (postId) => {
    if (!commentText[postId]?.trim()) return;
    addComment(postId, demoUser.id, demoUser.name, commentText[postId]);
    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Social Feed</h1>

        {/* Create Post */}
        <form onSubmit={handleCreatePost} className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-20"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
            >
              Post
            </button>
          </div>
        </form>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-semibold">
                  {post.userAvatar || post.userName?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-semibold">{post.userName || 'Anonymous'}</div>
                  <div className="text-xs text-gray-400">{formatTime(post.timestamp)}</div>
                </div>
              </div>

              <p className="text-gray-100 mb-4">{post.content}</p>

              <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-gray-700/50 pt-3">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 hover:text-pink-400 transition-all ${
                    post.likes?.includes(demoUser.id) ? 'text-pink-400' : ''
                  }`}
                >
                  ❤️ {post.likes?.length || 0}
                </button>
                <button className="flex items-center gap-1 hover:text-blue-400">
                  💬 {post.comments?.length || 0}
                </button>
              </div>

              {/* Comments */}
              {post.comments?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="bg-gray-700/30 rounded-lg p-2 text-sm">
                      <span className="font-semibold">{comment.userName}</span>: {comment.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={commentText[post.id] || ''}
                  onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-1 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleComment(post.id)}
                  className="px-3 py-1 bg-purple-500/80 text-white text-sm rounded-lg hover:bg-purple-500"
                >
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
