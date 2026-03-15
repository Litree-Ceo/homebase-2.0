/**
 * Cosmos DB Data Models for Social Media Platform
 *
 * @workspace Core data types for the Facebook-like + Kodi media streaming platform
 *
 * Partition Key Strategy:
 * - Users: /id (userId)
 * - Posts: /userId (author's ID for efficient feed queries)
 * - Media: /userId (owner's ID)
 * - Comments: /postId (parent post)
 * - Notifications: /recipientId (target user)
 * - Friendships: /userId (requesting user)
 */

// ============ Common Type Aliases ============

export type ThemePreference = 'dark' | 'light' | 'system';
export type MediaQuality = 'auto' | '720p' | '1080p' | '4k';
export type DirectMessagePermission = 'everyone' | 'friends' | 'none';
export type VisibilityLevel = 'public' | 'friends' | 'private';
export type MediaVisibility = 'public' | 'friends' | 'private' | 'unlisted';
export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
export type MediaCategory = 'movie' | 'tvshow' | 'music' | 'podcast' | 'livestream' | 'clip';
export type ParticipantStatus = 'watching' | 'away' | 'disconnected';

// ============ User Types ============

export interface User {
  id: string;
  email: string;
  displayName: string;
  username: string; // unique handle @username
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  isPrivate: boolean;
  createdAt: string;
  lastLogin: string;
  lastActive: string;
  preferences: UserPreferences;
  socialLinks: SocialLinks;
  stats: UserStats;
  type: 'user';
}

export interface UserPreferences {
  theme: ThemePreference;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  mediaQuality: MediaQuality;
  autoplayMedia: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  watchPartyInvites: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastActive: boolean;
  allowDirectMessages: DirectMessagePermission;
  showMediaLibrary: VisibilityLevel;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  twitch?: string;
}

export interface UserStats {
  followers: number;
  following: number;
  posts: number;
  mediaItems: number;
  watchParties: number;
  totalWatchTime: number; // in minutes
}

// ============ Post Types ============

export interface Post {
  id: string;
  userId: string; // partition key
  authorDisplayName: string;
  authorUsername: string;
  authorProfilePic?: string;
  content: string;
  mediaAttachments: MediaAttachment[];
  hashtags: string[];
  mentions: string[]; // userIds
  visibility: VisibilityLevel;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  stats: PostStats;
  sharedPost?: SharedPost; // for reposting
  poll?: Poll;
  type: 'post';
}

export interface PostStats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  saves: number;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'gif';
  url: string;
  thumbnailUrl?: string;
  duration?: number; // for video/audio
  width?: number;
  height?: number;
  altText?: string;
}

export interface SharedPost {
  originalPostId: string;
  originalAuthorId: string;
  originalAuthorName: string;
  addedComment?: string;
}

export interface Poll {
  question: string;
  options: PollOption[];
  expiresAt: string;
  allowMultiple: boolean;
  totalVotes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

// ============ Comment Types ============

export interface Comment {
  id: string;
  postId: string; // partition key
  parentCommentId?: string; // for nested replies
  userId: string;
  authorDisplayName: string;
  authorUsername: string;
  authorProfilePic?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  likes: number;
  replyCount: number;
  type: 'comment';
}

// ============ Media Library Types (Kodi-like) ============

export interface MediaItem {
  id: string;
  userId: string; // partition key (owner)
  title: string;
  description?: string;
  mediaType: 'movie' | 'tvshow' | 'music' | 'podcast' | 'livestream' | 'clip';
  genre: string[];
  tags: string[];
  thumbnailUrl: string;
  posterUrl?: string;
  backdropUrl?: string;
  sourceUrl: string;
  hlsUrl?: string; // for adaptive streaming
  dashUrl?: string;
  duration: number; // in seconds
  releaseYear?: number;
  rating?: MediaRating;
  quality: string; // '720p', '1080p', '4k'
  fileSize?: number; // in bytes
  visibility: MediaVisibility;
  createdAt: string;
  updatedAt?: string;
  stats: MediaStats;
  metadata: MediaMetadata;
  type: 'media';
}

export interface MediaRating {
  average: number; // 1-5 stars
  count: number;
}

export interface MediaStats {
  views: number;
  likes: number;
  shares: number;
  saves: number;
  watchTime: number; // total watch time in minutes
  completionRate: number; // percentage of users who watched to end
}

export interface MediaMetadata {
  // For movies/shows
  director?: string;
  cast?: string[];
  studio?: string;
  imdbId?: string;
  tmdbId?: string;

  // For music
  artist?: string;
  album?: string;
  trackNumber?: number;

  // For all
  language?: string;
  subtitles?: SubtitleTrack[];
  audioTracks?: AudioTrack[];
  chapters?: Chapter[];
}

export interface SubtitleTrack {
  language: string;
  label: string;
  url: string;
  isDefault: boolean;
}

export interface AudioTrack {
  language: string;
  label: string;
  isDefault: boolean;
}

export interface Chapter {
  title: string;
  startTime: number; // in seconds
}

// ============ Playlist Types ============

export interface Playlist {
  id: string;
  userId: string; // partition key (owner)
  title: string;
  description?: string;
  coverImage?: string;
  visibility: VisibilityLevel;
  isCollaborative: boolean;
  collaborators: string[]; // userIds
  mediaItems: PlaylistItem[];
  createdAt: string;
  updatedAt?: string;
  stats: PlaylistStats;
  type: 'playlist';
}

export interface PlaylistItem {
  mediaId: string;
  addedBy: string;
  addedAt: string;
  position: number;
}

export interface PlaylistStats {
  followers: number;
  totalDuration: number;
  itemCount: number;
  views: number;
}

// ============ Watch Party Types ============

export interface WatchParty {
  id: string;
  hostId: string;
  hostDisplayName: string;
  title: string;
  description?: string;
  mediaId: string;
  mediaTitle: string;
  mediaThumbnail?: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduledStart?: string;
  actualStart?: string;
  endedAt?: string;
  visibility: 'public' | 'friends' | 'invite-only';
  maxParticipants: number;
  currentParticipants: number;
  participants: WatchPartyParticipant[];
  chatEnabled: boolean;
  syncEnabled: boolean;
  currentPosition: number; // current playback position in seconds
  isPlaying: boolean;
  createdAt: string;
  type: 'watchparty';
}

export interface WatchPartyParticipant {
  userId: string;
  displayName: string;
  profilePic?: string;
  joinedAt: string;
  isHost: boolean;
  canControl: boolean;
  status?: ParticipantStatus;
}

// ============ Notification Types ============

export interface Notification {
  id: string;
  recipientId: string; // partition key
  senderId?: string;
  senderDisplayName?: string;
  senderProfilePic?: string;
  notificationType: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'post' | 'comment' | 'media' | 'watchparty' | 'user';
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  type: 'notification';
}

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'mention'
  | 'share'
  | 'watchparty_invite'
  | 'watchparty_starting'
  | 'media_recommendation'
  | 'friend_request'
  | 'friend_accepted'
  | 'system';

// ============ Friendship/Follow Types ============

export interface Friendship {
  id: string;
  userId: string; // partition key (who initiated)
  targetUserId: string;
  status: 'pending' | 'accepted' | 'blocked';
  followType: 'follow' | 'friend';
  createdAt: string;
  updatedAt?: string;
  type: 'friendship';
}

// ============ Message Types (DMs) ============

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: MessagePreview;
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  createdAt: string;
  updatedAt: string;
  type: 'conversation';
}

export interface ConversationParticipant {
  userId: string;
  displayName: string;
  profilePic?: string;
  lastRead?: string;
  isAdmin?: boolean;
}

export interface MessagePreview {
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
}

export interface Message {
  id: string;
  conversationId: string; // partition key
  senderId: string;
  senderDisplayName: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  replyToId?: string;
  reactions: MessageReaction[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  type: 'message';
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: string;
}

// ============ Activity/Engagement Types ============

export interface UserActivity {
  id: string;
  userId: string; // partition key
  activityType: 'like' | 'view' | 'share' | 'save' | 'watch' | 'vote';
  targetId: string;
  targetType: 'post' | 'media' | 'comment' | 'playlist';
  timestamp: string;
  duration?: number; // for watch activity
  type: 'activity';
}

export interface WatchHistory {
  id: string;
  userId: string; // partition key
  mediaId: string;
  mediaTitle: string;
  mediaThumbnail: string;
  mediaType: string;
  watchedAt: string;
  duration: number; // total media duration
  progress: number; // where user left off
  completed: boolean;
  type: 'watchhistory';
}

// ============ Add-on/Extension Types (Kodi-like) ============

export interface MediaAddOn {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  iconUrl: string;
  category: 'video' | 'music' | 'program' | 'skin' | 'subtitles';
  sourceUrl: string;
  isOfficial: boolean;
  isEnabled: boolean;
  settings?: Record<string, unknown>;
  installedAt?: string;
  rating: number;
  downloads: number;
  type: 'addon';
}

// ============ Container Definitions ============

export const CONTAINERS = {
  users: {
    id: 'users',
    partitionKey: '/id',
    ttl: -1,
  },
  posts: {
    id: 'posts',
    partitionKey: '/userId',
    ttl: -1,
  },
  comments: {
    id: 'comments',
    partitionKey: '/postId',
    ttl: -1,
  },
  media: {
    id: 'media',
    partitionKey: '/userId',
    ttl: -1,
  },
  playlists: {
    id: 'playlists',
    partitionKey: '/userId',
    ttl: -1,
  },
  watchParties: {
    id: 'watchParties',
    partitionKey: '/hostId',
    ttl: 86400, // 24 hours for ended watch parties
  },
  notifications: {
    id: 'notifications',
    partitionKey: '/recipientId',
    ttl: 2592000, // 30 days
  },
  friendships: {
    id: 'friendships',
    partitionKey: '/userId',
    ttl: -1,
  },
  conversations: {
    id: 'conversations',
    partitionKey: '/id',
    ttl: -1,
  },
  messages: {
    id: 'messages',
    partitionKey: '/conversationId',
    ttl: -1,
  },
  activities: {
    id: 'activities',
    partitionKey: '/userId',
    ttl: 7776000, // 90 days
  },
  watchHistory: {
    id: 'watchHistory',
    partitionKey: '/userId',
    ttl: -1,
  },
  addons: {
    id: 'addons',
    partitionKey: '/id',
    ttl: -1,
  },
} as const;
