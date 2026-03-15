import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Code, Sparkles } from 'lucide-react'

interface SocialPost {
  id: string
  project_id?: string
  author_name: string
  title: string
  content: string
  post_type: 'app' | 'visualizer' | 'text' | 'code'
  code_snapshot?: Record<string, string>
  likes: number
  tags: string[]
  created_at: string
}

interface PostComment {
  id: string
  author_name: string
  content: string
  created_at: string
}

export function SocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activePost, setActivePost] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, PostComment[]>>({})
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/social/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: data.likes } : p))
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: 'Anonymous User',
          content: newComment
        })
      })

      if (response.ok) {
        const comment = await response.json()
        setComments({
          ...comments,
          [postId]: [...(comments[postId] || []), comment]
        })
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const renderCodePreview = (post: SocialPost) => {
    if (!post.code_snapshot) return null

    const indexHtml = post.code_snapshot['index.html'] || post.code_snapshot['src/index.html']
    if (!indexHtml) return null

    return (
      <div className="code-preview-frame">
        <iframe
          srcDoc={indexHtml}
          title={`Preview of ${post.title}`}
          sandbox="allow-scripts"
          style={{
            width: '100%',
            height: '200px',
            border: 'none',
            borderRadius: '8px',
            background: '#0f172a'
          }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="social-feed-loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading the creative feed...</p>
      </div>
    )
  }

  return (
    <div className="social-feed">
      <header className="feed-header">
        <div className="feed-branding">
          <Sparkles className="feed-icon" />
          <div>
            <h1>LiTLab Social Hub</h1>
            <p>Discover AI-generated apps from the community</p>
          </div>
        </div>
      </header>

      <div className="feed-container">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <Share2 size={48} />
            <h2>No posts yet</h2>
            <p>Be the first to share your AI-generated creation!</p>
            <p className="hint">Generate an app and click "Share to Hub"</p>
          </div>
        ) : (
          posts.map(post => (
            <article key={post.id} className="feed-post">
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {post.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{post.author_name}</span>
                    <span className="post-time">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className={`post-type-badge ${post.post_type}`}>
                  {post.post_type}
                </span>
              </div>

              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{post.content}</p>

              {post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              )}

              {renderCodePreview(post)}

              <div className="post-actions">
                <button 
                  className="action-btn like"
                  onClick={() => handleLike(post.id)}
                >
                  <Heart size={18} />
                  <span>{post.likes}</span>
                </button>
                <button 
                  className="action-btn comment"
                  onClick={() => setActivePost(activePost === post.id ? null : post.id)}
                >
                  <MessageCircle size={18} />
                  <span>Comment</span>
                </button>
                {post.code_snapshot && (
                  <button className="action-btn fork">
                    <Code size={18} />
                    <span>Fork</span>
                  </button>
                )}
              </div>

              {activePost === post.id && (
                <div className="comments-section">
                  <div className="comments-list">
                    {(comments[post.id] || []).map(comment => (
                      <div key={comment.id} className="comment">
                        <span className="comment-author">{comment.author_name}</span>
                        <p>{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="add-comment">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <button onClick={() => handleAddComment(post.id)}>Post</button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  )
}
