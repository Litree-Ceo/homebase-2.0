import { useEffect, useState } from 'react';
import { FeedCard } from '../components/FeedCard';
import { Sparkles, TrendingUp, Users } from 'lucide-react';

interface SocialPost {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  likes: number;
  post_type: string;
  code_snapshot?: any;
}

export default function Feed() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/social/posts?limit=20')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch feed:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="feed-page">
      <header className="feed-header">
        <div className="feed-branding">
          <Sparkles className="feed-logo" size={32} />
          <div>
            <h1>LiTLab Network</h1>
            <p>Discover & fork AI-generated apps from the community</p>
          </div>
        </div>
        <div className="feed-stats">
          <div className="stat">
            <TrendingUp size={20} />
            <span>{posts.length} creations</span>
          </div>
          <div className="stat">
            <Users size={20} />
            <span>Live now</span>
          </div>
        </div>
      </header>

      <div className="feed-content">
        {loading ? (
          <div className="feed-loading">
            <div className="spinner"></div>
            <p>Loading creative feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <Sparkles size={64} />
            <h2>No posts yet</h2>
            <p>Be the first to share your AI-generated creation!</p>
            <p className="hint">Generate an app and click "Share to Hub"</p>
          </div>
        ) : (
          <div className="feed-grid">
            {posts.map(post => (
              <FeedCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
