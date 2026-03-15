import { Heart, GitFork, Eye, Code, Image as ImageIcon } from 'lucide-react';

interface FeedCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    author_name: string;
    created_at: string;
    likes: number;
    post_type: string;
    code_snapshot?: any;
    thumbnail_url?: string;
  };
}

export function FeedCard({ post }: FeedCardProps) {
  const date = new Date(post.created_at).toLocaleDateString();
  
  // Generate a deterministic gradient based on the post ID
  const getGradient = (id: string) => {
    const gradients = [
      'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
      'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  // Get file count for display
  const getFileCount = () => {
    if (!post.code_snapshot) return 0;
    return Object.keys(post.code_snapshot).length;
  };

  // Check if post has a visual preview
  const hasVisualPreview = post.post_type === 'app' || post.post_type === 'visualizer';
  const fileCount = getFileCount();

  return (
    <div className="feed-card">
      {/* Hero Thumbnail */}
      {hasVisualPreview && (
        <div className="feed-card-thumbnail">
          {post.thumbnail_url ? (
            <img src={post.thumbnail_url} alt={post.title} loading="lazy" />
          ) : (
            <div className="thumbnail-fallback" style={{ background: getGradient(post.id) }}>
              <ImageIcon size={48} />
            </div>
          )}
          {fileCount > 0 && (
            <span className="file-count-badge">{fileCount} files</span>
          )}
        </div>
      )}

      <div className="feed-card-header">
        <div className="author-info">
          <div className="author-avatar" style={{ background: getGradient(post.author_name) }}>
            {post.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="post-title">{post.title}</h3>
            <p className="post-meta">by {post.author_name} • {date}</p>
          </div>
        </div>
        <span className={`post-type ${post.post_type}`}>{post.post_type}</span>
      </div>

      <p className="post-description">{post.content}</p>

      {/* Code Preview for code posts without visual thumbnail */}
      {post.code_snapshot && !hasVisualPreview && (
        <div className="code-preview-mini">
          <div className="file-count">
            {fileCount} files
          </div>
          <pre className="code-snippet">
            {JSON.stringify(post.code_snapshot, null, 2).slice(0, 300)}...
          </pre>
        </div>
      )}

      {/* Quick code preview for apps */}
      {post.code_snapshot && hasVisualPreview && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginBottom: '1rem',
          padding: '0.5rem 0.75rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <Code size={14} />
          <span>{fileCount} source files included</span>
        </div>
      )}

      <div className="feed-card-actions">
        <button className="action-btn like">
          <Heart size={16} />
          <span>{post.likes || 0}</span>
        </button>
        <button className="action-btn fork">
          <GitFork size={16} />
          <span>Fork</span>
        </button>
        <button className="action-btn view">
          <Eye size={16} />
          <span>Preview</span>
        </button>
      </div>
    </div>
  );
}
