import { Post } from '../types';

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="post-card">
      <div className="post-card-header">
        <div className="avatar">{post.author.charAt(0)}</div>
        <div>
          <div className="post-author">{post.author}</div>
          <div className="post-time">{post.time}</div>
        </div>
      </div>
      <div className="post-card-content">{post.content}</div>
      <div className="post-card-actions">
        <span>{post.likes} Likes</span>
        <span>{post.comments} Comments</span>
      </div>
    </div>
  );
}
