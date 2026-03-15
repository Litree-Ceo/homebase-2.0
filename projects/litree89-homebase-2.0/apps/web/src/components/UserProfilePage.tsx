'use client';

import React, { useState } from 'react';
import { Edit, Settings, MapPin, Link as LinkIcon } from 'lucide-react';
import Masonry, { Responsive } from 'react-grid-layout';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  joinedDate: Date;
  posts: PostItem[];
  mediaGallery: MediaItem[];
  pinnedModules: Module[];
}

interface PostItem {
  id: string;
  content: string;
  image?: string;
  createdAt: Date;
  likes: number;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  createdAt: Date;
}

interface Module {
  id: string;
  type: 'section' | 'widget';
  title: string;
  content: any;
  order: number;
}

type TabType = 'posts' | 'media' | 'modules';

interface UserProfilePageProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onCreateHomeBase?: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  profile,
  isOwnProfile = false,
  onEditProfile,
  onCreateHomeBase,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [modules, setModules] = useState(profile.pinnedModules);

  const handleLayoutChange = (newLayout: any) => {
    // Update module order on drag
    const updatedModules = [...modules].sort(
      (a, b) =>
        newLayout.find((l: any) => l.i === a.id)?.y - newLayout.find((l: any) => l.i === b.id)?.y,
    );
    setModules(updatedModules);
  };

  return (
    <div className="w-full">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-lg overflow-hidden">
        <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
        {isOwnProfile && (
          <Button variant="secondary" className="absolute bottom-4 right-4" onClick={onEditProfile}>
            <Settings className="w-4 h-4 mr-2" />
            Edit Cover
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-20 relative z-10 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Avatar */}
          <img
            src={profile.avatar}
            alt={profile.displayName}
            className="w-32 h-32 rounded-full border-4 border-background object-cover"
          />

          {/* Profile Info */}
          <div className="flex-1 mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
              {isOwnProfile && (
                <Button variant="outline" size="icon" onClick={onEditProfile}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-muted-foreground">@{profile.username}</p>

            {/* Bio & Location */}
            <p className="mt-2 text-sm">{profile.bio}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <LinkIcon className="w-4 h-4" />
                  Website
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div>
                <p className="font-semibold">{profile.followers}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="font-semibold">{profile.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div>
                <p className="font-semibold">{profile.posts.length}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isOwnProfile && (
            <Button onClick={onCreateHomeBase} className="mb-4">
              + Create Your HomeBase
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 border-b border-border mb-6">
        <div className="flex gap-8">
          {(['posts', 'media', 'modules'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-3 px-1 border-b-2 transition font-medium capitalize',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.posts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition">
                <CardContent className="p-4">
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-sm leading-relaxed">{post.content}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{post.createdAt.toLocaleDateString()}</span>
                    <span>❤️ {post.likes}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Media Gallery Tab */}
        {activeTab === 'media' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {profile.mediaGallery.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-muted h-40 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                  onClick={() => setLightboxIndex(index)}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt="Gallery" className="w-full h-full object-cover" />
                  ) : (
                    <video src={item.url} className="w-full h-full object-cover" muted />
                  )}
                </div>
              ))}
            </div>

            {/* Lightbox */}
            <Lightbox
              index={lightboxIndex}
              slides={profile.mediaGallery.map(m => ({
                src: m.url,
                alt: 'Gallery item',
              }))}
              open={lightboxIndex >= 0}
              close={() => setLightboxIndex(-1)}
            />
          </>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <Masonry
            className="layout"
            layout={modules.map((m, i) => ({
              x: (i % 2) * 6,
              y: Math.floor(i / 2) * 4,
              w: 6,
              h: 4,
              i: m.id,
            }))}
            cols={12}
            rowHeight={80}
            width={1200}
            isDraggable={isOwnProfile}
            isResizable={isOwnProfile}
            onLayoutChange={handleLayoutChange}
            compactType="vertical"
            preventCollision={false}
          >
            {modules.map(module => (
              <div key={module.id} className="bg-card rounded-lg border p-4">
                <h3 className="font-semibold text-sm mb-2">{module.title}</h3>
                <p className="text-xs text-muted-foreground">{module.content}</p>
              </div>
            ))}
          </Masonry>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
