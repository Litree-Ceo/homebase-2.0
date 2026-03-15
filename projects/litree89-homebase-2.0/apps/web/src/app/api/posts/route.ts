/**
 * Posts API Route - Social Feed Management
 *
 * @workspace Handles post creation, listing, and feed operations
 */

import { NextRequest, NextResponse } from "next/server";
import { getCosmosClient } from "@/lib/cosmos";
import { verifyToken } from "@/lib/auth-utils";
import type { Post, PostStats } from "@/types";

const DATABASE_ID = "litlab";
const POSTS_CONTAINER = "posts";

// GET /api/posts - Get feed posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const continuationToken = searchParams.get("continuation");

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(POSTS_CONTAINER);

    let query = 'SELECT * FROM c WHERE c.visibility = "public"';
    const parameters: { name: string; value: string }[] = [];

    if (userId) {
      query = "SELECT * FROM c WHERE c.userId = @userId";
      parameters.push({ name: "@userId", value: userId });
    }

    if (type) {
      query += " AND c.type = @type";
      parameters.push({ name: "@type", value: type });
    }

    query += " ORDER BY c.createdAt DESC";

    const { resources: posts, continuationToken: nextToken } =
      await container.items
        .query<Post>(
          { query, parameters },
          {
            maxItemCount: limit,
            continuationToken: continuationToken || undefined,
          }
        )
        .fetchNext();

    return NextResponse.json({
      posts,
      continuation: nextToken,
      hasMore: !!nextToken,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const userId = verifiedUser.sub;

    // Validate required fields
    if (!body.content && !body.media?.length && !body.poll) {
      return NextResponse.json(
        { error: "Post must have content, media, or a poll" },
        { status: 400 }
      );
    }

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(POSTS_CONTAINER);
    const usersContainer = client.database(DATABASE_ID).container("users");

    // Get user info for the post
    const { resource: user } = await usersContainer.item(userId, userId).read();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const postId = `post_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)}`;
    const now = new Date().toISOString();

    const stats: PostStats = {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      saves: 0,
    };

    const newPost: Post = {
      id: postId,
      userId,
      authorDisplayName: user.displayName,
      authorUsername: user.username || "",
      authorProfilePic: user.profilePicture,
      content: body.content || "",
      mediaAttachments: body.media || [],
      hashtags: body.tags || [],
      mentions: body.mentions || [],
      visibility: body.visibility || "public",
      createdAt: now,
      updatedAt: now,
      isEdited: false,
      stats,
      poll: body.poll,
      sharedPost: body.sharedPost,
      type: "post",
    };

    const { resource } = await container.items.create(newPost);

    // Update user's post count
    await usersContainer
      .item(userId, userId)
      .patch([{ op: "incr", path: "/stats/posts", value: 1 }]);

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
