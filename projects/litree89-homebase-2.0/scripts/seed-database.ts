/**
 * Database Seeding Script
 * Creates test users, posts, comments, reactions, and modules
 * Run: npx ts-node scripts/seed-database.ts
 */

import { CosmosClient } from '@azure/cosmos';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from apps/web/.env.local
dotenv.config({ path: path.join(__dirname, '../apps/web/.env.local') });

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseName = 'litlab';

if (!endpoint || !key) {
  console.error('❌ Missing COSMOS_ENDPOINT or COSMOS_KEY in .env.local');
  process.exit(1);
}

const client = new CosmosClient({ endpoint, key });

async function ensureContainerExists(database: any, containerName: string, partitionKey: string) {
  try {
    await database.container(containerName).read();
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`  📦 Creating container: ${containerName}`);
      await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: [partitionKey] },
      });
    } else {
      throw error;
    }
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Create or get database
    const databaseResponse = await client.databases.createIfNotExists({ id: databaseName });
    const database = databaseResponse.database;

    // Ensure all containers exist
    console.log('🗄️  Ensuring containers exist...');
    await ensureContainerExists(database, 'users', '/id');
    await ensureContainerExists(database, 'posts', '/partitionKey');
    await ensureContainerExists(database, 'comments', '/partitionKey');
    await ensureContainerExists(database, 'reactions', '/partitionKey');
    await ensureContainerExists(database, 'media', '/userId');
    await ensureContainerExists(database, 'modules', '/partitionKey');
    await ensureContainerExists(database, 'sessions', '/partitionKey');
    console.log('✅ All containers ready\n');

    // ─────────────────────────────────────────────────────────────
    // 1. CREATE TEST USERS
    // ─────────────────────────────────────────────────────────────
    console.log('👤 Creating test users...');

    const usersContainer = database.container('users');
    const testUsers = [
      {
        id: 'user_alice',
        email: 'alice@example.com',
        username: 'alice',
        name: 'Alice Johnson',
        passwordHash: hashPassword('Alice123!', 'test_salt'),
        passwordSalt: 'test_salt',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=random',
        bio: '🎨 Designer & Creator | Coffee enthusiast | Building the future',
        followers: 245,
        following: 128,
        modules: [],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'users',
      },
      {
        id: 'user_bob',
        email: 'bob@example.com',
        username: 'bob',
        name: 'Bob Smith',
        passwordHash: hashPassword('Bob123!', 'test_salt'),
        passwordSalt: 'test_salt',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=random',
        bio: '💻 Full-stack developer | Open source | Tech talks',
        followers: 512,
        following: 87,
        modules: [],
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'users',
      },
      {
        id: 'user_charlie',
        email: 'charlie@example.com',
        username: 'charlie',
        name: 'Charlie Davis',
        passwordHash: hashPassword('Charlie123!', 'test_salt'),
        passwordSalt: 'test_salt',
        avatar: 'https://ui-avatars.com/api/?name=Charlie+Davis&background=random',
        bio: '📸 Photographer & Content Creator | Digital nomad',
        followers: 1203,
        following: 456,
        modules: [],
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'users',
      },
    ];

    for (const user of testUsers) {
      try {
        await usersContainer.items.create(user);
        console.log(`  ✅ Created user: ${user.name}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ⚠️  User already exists: ${user.name}`);
        } else {
          throw error;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CREATE TEST POSTS
    // ─────────────────────────────────────────────────────────────
    console.log('\n📝 Creating test posts...');

    const postsContainer = database.container('posts');
    const testPosts = [
      {
        id: 'post_1',
        userId: 'user_alice',
        username: 'alice',
        userAvatar: testUsers[0].avatar,
        content:
          'Just launched my new design portfolio! 🎨 Check it out and let me know what you think!',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
            type: 'image',
            alt: 'Design portfolio showcase',
          },
        ],
        reactions: {},
        comments: [],
        likes: 42,
        shares: 5,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'posts',
      },
      {
        id: 'post_2',
        userId: 'user_bob',
        username: 'bob',
        userAvatar: testUsers[1].avatar,
        content:
          'Just open-sourced my new React component library! Give it a star if you find it useful 🌟\n\nhttps://github.com/bobsmith/awesome-components',
        media: [],
        reactions: {},
        comments: [],
        likes: 156,
        shares: 23,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'posts',
      },
      {
        id: 'post_3',
        userId: 'user_charlie',
        username: 'charlie',
        userAvatar: testUsers[2].avatar,
        content:
          'Sunset in Bali 🌅 Nothing beats golden hour photography. Who else is a sunset chaser?',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=500',
            type: 'image',
            alt: 'Sunset in Bali',
          },
          {
            url: 'https://images.unsplash.com/photo-1495567720969-b06e50d776e4?w=500',
            type: 'image',
            alt: 'Sunset landscape',
          },
        ],
        reactions: {},
        comments: [],
        likes: 389,
        shares: 47,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'posts',
      },
      {
        id: 'post_4',
        userId: 'user_alice',
        username: 'alice',
        userAvatar: testUsers[0].avatar,
        content:
          'Design tip: Always consider the user journey first. Beautiful design without good UX is just decoration. 💡',
        media: [],
        reactions: {},
        comments: [],
        likes: 234,
        shares: 67,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'posts',
      },
    ];

    for (const post of testPosts) {
      try {
        await postsContainer.items.create(post);
        console.log(`  ✅ Created post: "${post.content.substring(0, 40)}..."`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ⚠️  Post already exists`);
        } else {
          throw error;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. CREATE TEST COMMENTS
    // ─────────────────────────────────────────────────────────────
    console.log('\n💬 Creating test comments...');

    const commentsContainer = database.container('comments');
    const testComments = [
      {
        id: 'comment_1',
        postId: 'post_1',
        userId: 'user_bob',
        username: 'bob',
        userAvatar: testUsers[1].avatar,
        text: 'This design is absolutely stunning! Love the color palette 🎨',
        reactions: { '❤️': 2 },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'comments',
      },
      {
        id: 'comment_2',
        postId: 'post_2',
        userId: 'user_charlie',
        username: 'charlie',
        userAvatar: testUsers[2].avatar,
        text: 'Awesome work! Just starred it. Will definitely use this in my next project.',
        reactions: { '⭐': 5, '👍': 3 },
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'comments',
      },
      {
        id: 'comment_3',
        postId: 'post_3',
        userId: 'user_alice',
        username: 'alice',
        userAvatar: testUsers[0].avatar,
        text: 'Breathtaking! 😍 I need to visit Bali someday.',
        reactions: { '❤️': 8 },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'comments',
      },
    ];

    for (const comment of testComments) {
      try {
        await commentsContainer.items.create(comment);
        console.log(`  ✅ Created comment: "${comment.text.substring(0, 30)}..."`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ⚠️  Comment already exists`);
        } else {
          throw error;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. CREATE TEST REACTIONS
    // ─────────────────────────────────────────────────────────────
    console.log('\n😊 Creating test reactions...');

    const reactionsContainer = database.container('reactions');
    const testReactions = [
      {
        id: 'reaction_1',
        postId: 'post_1',
        userId: 'user_bob',
        emoji: '❤️',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        partitionKey: 'reactions',
      },
      {
        id: 'reaction_2',
        postId: 'post_1',
        userId: 'user_charlie',
        emoji: '🔥',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        partitionKey: 'reactions',
      },
      {
        id: 'reaction_3',
        postId: 'post_2',
        userId: 'user_alice',
        emoji: '⭐',
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        partitionKey: 'reactions',
      },
      {
        id: 'reaction_4',
        postId: 'post_3',
        userId: 'user_bob',
        emoji: '😍',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        partitionKey: 'reactions',
      },
    ];

    for (const reaction of testReactions) {
      try {
        await reactionsContainer.items.create(reaction);
        console.log(`  ✅ Created reaction: ${reaction.emoji} on post`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ⚠️  Reaction already exists`);
        } else {
          throw error;
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. CREATE TEST MODULES
    // ─────────────────────────────────────────────────────────────
    console.log('\n🧩 Creating test modules...');

    const modulesContainer = database.container('modules');
    const testModules = [
      {
        id: 'module_1',
        userId: 'user_alice',
        type: 'gallery',
        title: 'Design Portfolio',
        config: {
          columns: 3,
          spacing: 12,
          images: [
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300',
            'https://images.unsplash.com/photo-1561070791-2526d30994c5?w=300',
            'https://images.unsplash.com/photo-1561070791-2526d30994d5?w=300',
          ],
        },
        published: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'modules',
      },
      {
        id: 'module_2',
        userId: 'user_bob',
        type: 'links',
        title: 'My Links',
        config: {
          links: [
            { label: 'GitHub', url: 'https://github.com/bobsmith', icon: 'github' },
            { label: 'Twitter', url: 'https://twitter.com/bobsmith', icon: 'twitter' },
            { label: 'Blog', url: 'https://bobsmith.dev', icon: 'globe' },
          ],
        },
        published: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'modules',
      },
      {
        id: 'module_3',
        userId: 'user_charlie',
        type: 'stats',
        title: 'Photography Stats',
        config: {
          stats: [
            { label: 'Posts', value: '234' },
            { label: 'Followers', value: '1.2K' },
            { label: 'Photos', value: '5.6K' },
          ],
        },
        published: true,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        partitionKey: 'modules',
      },
    ];

    for (const module of testModules) {
      try {
        await modulesContainer.items.create(module);
        console.log(`  ✅ Created module: ${module.title}`);
      } catch (error: any) {
        if (error.code === 409) {
          console.log(`  ⚠️  Module already exists: ${module.title}`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  • ${testUsers.length} users created`);
    console.log(`  • ${testPosts.length} posts created`);
    console.log(`  • ${testComments.length} comments created`);
    console.log(`  • ${testReactions.length} reactions created`);
    console.log(`  • ${testModules.length} modules created`);
    console.log('\n🎯 Test Credentials:');
    console.log('  Email: alice@example.com | Password: Alice123!');
    console.log('  Email: bob@example.com | Password: Bob123!');
    console.log('  Email: charlie@example.com | Password: Charlie123!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

/**
 * Hash password with salt (matches register.ts)
 */
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Run seeding
seedDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
