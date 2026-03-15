/**
 * Core types for social platform
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  coverImage?: string;
  followers: number;
  following: number;
  createdAt: string;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  author?: User;
  content: string;
  media?: Media[];
  reactions: Reaction[];
  comments: Comment[];
  shares: number;
  createdAt: string;
  updatedAt: string;
  visibility: 'public' | 'followers' | 'private';
  pinnedAt?: string;
}

export interface Media {
  id: string;
  postId: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  duration?: number; // for videos
  width?: number;
  height?: number;
  uploadedAt: string;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: User;
  content: string;
  media?: Media[];
  reactions: Reaction[];
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  user: User;
  posts: Post[];
  mediaGallery: Media[];
  pinnedPosts: Post[];
  followers: User[];
  following: User[];
}

export interface FeedPost extends Post {
  author: User;
  userReaction?: Reaction;
  isFollowing: boolean;
}
