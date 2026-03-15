import React from 'react';
import UserProfilePage from '@/components/UserProfilePage';

/**
 * @workspace User Profile Page
 * Dynamic route: /profile/[username]
 * Shows user profile with tabs, media gallery, and draggable modules
 */

// Mock data - replace with real API call
async function getUserProfile(username: string) {
  // NOTE: Replace with actual API call to fetch user profile
  // const response = await fetch(`/api/users/${username}`);
  // if (!response.ok) throw new Error('User not found');
  // return response.json();

  // Mock data for development
  return {
    id: '1',
    username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    coverImage:
      'https://images.unsplash.com/photo-1579546117519-6c3e73b5797d?w=1200&h=300&fit=crop',
    bio: 'Creating awesome HomeBase experiences 🚀',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    followers: 1234,
    following: 567,
    joinedDate: new Date('2024-01-01'),
    posts: [
      {
        id: '1',
        content: 'Just launched my new HomeBase module! 🎉',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop',
        createdAt: new Date(),
        likes: 342,
      },
      {
        id: '2',
        content: 'Check out this amazing collaboration with the community',
        createdAt: new Date(Date.now() - 86400000),
        likes: 128,
      },
      {
        id: '3',
        content: 'Building something cool with Three.js and React',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
        createdAt: new Date(Date.now() - 172800000),
        likes: 567,
      },
    ],
    mediaGallery: [
      {
        id: 'img1',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8e7b9b5f?w=400&h=400&fit=crop',
        type: 'image' as const,
        createdAt: new Date(),
      },
      {
        id: 'img2',
        url: 'https://images.unsplash.com/photo-1579546117519-6c3e73b5797d?w=400&h=400&fit=crop',
        type: 'image' as const,
        createdAt: new Date(),
      },
      {
        id: 'img3',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
        type: 'image' as const,
        createdAt: new Date(),
      },
      {
        id: 'img4',
        url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=400&fit=crop',
        type: 'image' as const,
        createdAt: new Date(),
      },
      {
        id: 'img5',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8e7b9b5f?w=400&h=400&fit=crop',
        type: 'image' as const,
        createdAt: new Date(),
      },
      {
        id: 'img6',
        url: 'https://images.unsplash.com/photo-1579546117519-6c3e73b5797d?w=400&h=400&fit=crop',
        type: 'image' as const,
        createdAt: new Date(),
      },
    ],
    pinnedModules: [
      {
        id: 'module1',
        type: 'widget' as const,
        title: 'Featured Project',
        content: 'My awesome 3D metaverse experience built with Three.js',
        order: 1,
      },
      {
        id: 'module2',
        type: 'section' as const,
        title: 'Latest Collab',
        content: 'Collaborating with 5 amazing creators on a new platform',
        order: 2,
      },
      {
        id: 'module3',
        type: 'widget' as const,
        title: 'Skills',
        content: 'React, Three.js, Next.js, TypeScript, Tailwind CSS',
        order: 3,
      },
    ],
  };
}

type Props = {
  readonly params: Promise<{ readonly username: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getUserProfile(username);

  // Check if this is the current user's profile (mock)
  const isOwnProfile = username === 'currentuser'; // Replace with actual auth check

  return (
    <div className="min-h-screen bg-background">
      <UserProfilePage profile={profile} isOwnProfile={isOwnProfile} />
    </div>
  );
}

export async function generateStaticParams() {
  // Fetch list of popular users from API
  // For now, return mock data
  return [{ username: 'alice' }, { username: 'bob' }, { username: 'charlie' }];
}
