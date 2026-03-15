import path from 'path';
import crypto from 'crypto';
import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';
import type { Post, User } from '../src/types/social-media';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const DATABASE_ID = 'litlab';

if (!endpoint || !key) {
  throw new Error('Set COSMOS_ENDPOINT and COSMOS_KEY in .env.local before seeding.');
}

const client = new CosmosClient({ endpoint, key });

async function ensureContainers() {
  const { database } = await client.databases.createIfNotExists({ id: DATABASE_ID });

  await database.containers.createIfNotExists({
    id: 'users',
    partitionKey: { paths: ['/id'] },
    throughput: 400,
  });

  await database.containers.createIfNotExists({
    id: 'posts',
    partitionKey: { paths: ['/userId'] },
    throughput: 400,
  });

  await database.containers.createIfNotExists({
    id: 'sessions',
    partitionKey: { paths: ['/id'] },
    throughput: 400,
  });
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { passwordHash, salt };
}

function buildUsers(): User[] {
  const now = new Date().toISOString();
  const basePassword = 'Password123!';

  const profiles: Array<Partial<User> & { email: string; username: string; displayName: string }> =
    [
      {
        email: 'alice@example.com',
        username: 'alice',
        displayName: 'Alice Vision',
        bio: 'Product + ops, building calm systems.',
        location: 'San Francisco, CA',
        website: 'https://example.com/alice',
      },
      {
        email: 'bob@example.com',
        username: 'bob',
        displayName: 'Bob Signals',
        bio: 'Media + realtime. Shipping experiments weekly.',
        location: 'Austin, TX',
        website: 'https://example.com/bob',
      },
      {
        email: 'charlie@example.com',
        username: 'charlie',
        displayName: 'Charlie Automator',
        bio: 'Automation + AI copilot loops.',
        location: 'Seattle, WA',
        website: 'https://example.com/charlie',
      },
    ];

  return profiles.map(profile => {
    const id = crypto.randomUUID();
    const { passwordHash, salt } = hashPassword(basePassword);

    return {
      id,
      email: profile.email,
      displayName: profile.displayName,
      username: profile.username,
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
      coverPhoto:
        'https://images.unsplash.com/photo-1579546117519-6c3e73b5797d?w=1200&h=300&fit=crop',
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      isVerified: false,
      isPrivate: false,
      createdAt: now,
      lastLogin: now,
      lastActive: now,
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          likes: true,
          comments: true,
          follows: true,
          mentions: true,
          watchPartyInvites: true,
        },
        privacy: {
          showOnlineStatus: true,
          showLastActive: true,
          allowDirectMessages: 'everyone',
          showMediaLibrary: 'public',
        },
        mediaQuality: '1080p',
        autoplayMedia: true,
      },
      socialLinks: {},
      stats: {
        followers: 0,
        following: 0,
        posts: 0,
        mediaItems: 0,
        watchParties: 0,
        totalWatchTime: 0,
      },
      type: 'user',
      passwordHash,
      passwordSalt: salt,
      partitionKey: 'users',
    } as unknown as User & { passwordHash: string; passwordSalt: string; partitionKey: string };
  });
}

function buildPosts(users: User[]): Post[] {
  const now = new Date();
  const posts: Post[] = [];

  users.forEach((user, index) => {
    const baseTime = new Date(now.getTime() - index * 60 * 60 * 1000);
    posts.push({
      id: `post_${Date.now()}_${index}`,
      userId: user.id,
      authorDisplayName: user.displayName,
      authorUsername: user.username,
      authorProfilePic: user.profilePicture,
      content: `Hello from ${user.displayName}! Launching the HomeBase feed.`,
      mediaAttachments: [],
      hashtags: ['#homebase', '#launch'],
      mentions: [],
      visibility: 'public',
      createdAt: baseTime.toISOString(),
      updatedAt: baseTime.toISOString(),
      isEdited: false,
      stats: { likes: 0, comments: 0, shares: 0, views: 0, saves: 0 },
      type: 'post',
    });
  });

  return posts;
}

async function seed() {
  console.log('Ensuring database and containers exist...');
  const { database } = await client.databases.createIfNotExists({ id: DATABASE_ID });
  await ensureContainers();

  const usersContainer = database.container('users');
  const postsContainer = database.container('posts');

  const sampleUsers = buildUsers();
  const samplePosts = buildPosts(sampleUsers);

  console.log('Seeding users...');
  for (const user of sampleUsers) {
    const existing = await usersContainer.items
      .query({
        query: 'SELECT TOP 1 * FROM c WHERE c.username = @username',
        parameters: [{ name: '@username', value: user.username }],
      })
      .fetchAll();

    if (existing.resources.length > 0) {
      console.log(`- Skipping existing user ${user.username}`);
      continue;
    }

    await usersContainer.items.create(user);
    console.log(`- Added user ${user.username}`);
  }

  console.log('Seeding posts...');
  for (const post of samplePosts) {
    const existing = await postsContainer.items
      .query({
        query: 'SELECT TOP 1 * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: post.id }],
      })
      .fetchAll();

    if (existing.resources.length > 0) {
      console.log(`- Skipping existing post ${post.id}`);
      continue;
    }

    await postsContainer.items.create(post);
    console.log(`- Added post for ${post.authorUsername}`);
  }

  console.log('Seed complete ✅');
}

seed().catch(error => {
  console.error('Seed failed', error);
  process.exit(1);
});
