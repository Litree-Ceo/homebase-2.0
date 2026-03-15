/**
 * Single Post API Route
 *
 * @workspace Handles individual post operations, reactions, and comments
 */

import { NextRequest, NextResponse } from "next/server";
import { getCosmosClient } from "@/lib/cosmos";
import { verifyToken } from "@/lib/auth-utils";
import type { Post, Comment, ReactionType } from "@/types";

const DATABASE_ID = "litlab";
const POSTS_CONTAINER = "posts";
const COMMENTS_CONTAINER = "comments";

// GET /api/posts/[id] - Get single post with comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeComments = searchParams.get("comments") === "true";
    const commentsLimit = Number.parseInt(searchParams.get("commentsLimit") || "10");

    const client = getCosmosClient();
    const postsContainer = client
      .database(DATABASE_ID)
      .container(POSTS_CONTAINER);

    // Find post by id (need to query since we don't know userId for partition key)
    const { resources: posts } = await postsContainer.items
      .query<Post>({
        query: "SELECT * FROM c WHERE c.id = @postId",
        parameters: [{ name: "@postId", value: postId }],
      })
      .fetchAll();

    if (!posts.length) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = posts[0];

    // Increment view count
    await postsContainer
      .item(postId, post.userId)
      .patch([{ op: "incr", path: "/stats/views", value: 1 }]);

    let comments: Comment[] = [];
    if (includeComments) {
      const commentsContainer = client
        .database(DATABASE_ID)
        .container(COMMENTS_CONTAINER);
      const { resources } = await commentsContainer.items
        .query<Comment>(
          {
            query:
              "SELECT * FROM c WHERE c.postId = @postId ORDER BY c.createdAt DESC",
            parameters: [{ name: "@postId", value: postId }],
          },
          { maxItemCount: commentsLimit }
        )
        .fetchNext();
      comments = resources;
    }

    return NextResponse.json({
      post: { ...post, stats: { ...post.stats, views: post.stats.views + 1 } },
      comments,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = verifiedUser.sub;
    const client = getCosmosClient();
    const postsContainer = client
      .database(DATABASE_ID)
      .container(POSTS_CONTAINER);
    const usersContainer = client.database(DATABASE_ID).container("users");

    // Verify ownership
    const { resource: post } = await postsContainer
      .item(postId, userId)
      .read<Post>();
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await postsContainer.item(postId, userId).delete();

    // Update user's post count
    await usersContainer
      .item(userId, userId)
      .patch([{ op: "incr", path: "/stats/posts", value: -1 }]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

// Helper: Handle reaction logic
async function handleReaction(
  container: any,
  postId: string,
  post: Post,
  reactionType: ReactionType,
  previousReaction: ReactionType | null
) {
  const operations: Array<any> = [];

  if (previousReaction && previousReaction !== reactionType) {
    operations.push({
      op: "incr" as const,
      path: `/stats/reactions/${previousReaction}`,
      value: -1,
    });
  }

  if (reactionType) {
    if (previousReaction === reactionType) {
      operations.push({
        op: "incr" as const,
        path: `/stats/reactions/${reactionType}`,
        value: -1,
      });
    } else {
      operations.push({
        op: "incr" as const,
        path: `/stats/reactions/${reactionType}`,
        value: 1,
      });
    }
  }

  if (operations.length > 0) {
    await container.item(postId, post.userId).patch(operations);
  }
}

// Helper: Handle content update
async function handleContentUpdate(
  container: any,
  postId: string,
  post: Post,
  content: string,
  userId: string
) {
  if (post.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await container.item(postId, post.userId).patch([
    { op: "replace", path: "/content", value: content },
    { op: "replace", path: "/updatedAt", value: new Date().toISOString() },
    { op: "set", path: "/isEdited", value: true },
  ]);

  return NextResponse.json({ success: true });
}

// Helper: Handle share action
async function handleShare(container: any, postId: string, post: Post) {
  await container
    .item(postId, post.userId)
    .patch([{ op: "incr", path: "/stats/shares", value: 1 }]);
  return NextResponse.json({ success: true });
}

// PATCH /api/posts/[id] - Update post or add reaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const client = getCosmosClient();
    const postsContainer = client
      .database(DATABASE_ID)
      .container(POSTS_CONTAINER);

    // Find post
    const { resources: posts } = await postsContainer.items
      .query<Post>({
        query: "SELECT * FROM c WHERE c.id = @postId",
        parameters: [{ name: "@postId", value: postId }],
      })
      .fetchAll();

    if (!posts.length) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = posts[0];

    // Route to appropriate handler
    if (body.action === "react") {
      await handleReaction(
        postsContainer,
        postId,
        post,
        body.reactionType,
        body.previousReaction
      );
      return NextResponse.json({ success: true });
    }

    if (body.content !== undefined) {
      return handleContentUpdate(
        postsContainer,
        postId,
        post,
        body.content,
        verifiedUser.sub
      );
    }

    if (body.action === "share") {
      return handleShare(postsContainer, postId, post);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id] - Add comment to post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const userId = verifiedUser.sub;

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: "Comment content required" },
        { status: 400 }
      );
    }

    const client = getCosmosClient();
    const postsContainer = client
      .database(DATABASE_ID)
      .container(POSTS_CONTAINER);
    const commentsContainer = client
      .database(DATABASE_ID)
      .container(COMMENTS_CONTAINER);
    const usersContainer = client.database(DATABASE_ID).container("users");

    // Get user info
    const { resource: user } = await usersContainer.item(userId, userId).read();

    // Find post to increment comment count
    const { resources: posts } = await postsContainer.items
      .query<Post>({
        query: "SELECT * FROM c WHERE c.id = @postId",
        parameters: [{ name: "@postId", value: postId }],
      })
      .fetchAll();

    if (!posts.length) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = posts[0];

    const commentId = `comment_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)}`;
    const now = new Date().toISOString();

    const comment: Comment = {
      id: commentId,
      postId,
      userId,
      authorDisplayName: user?.displayName || "Unknown User",
      authorUsername: user?.username || "unknown",
      authorProfilePic: user?.profilePicture || "/avatars/default.png",
      content: body.content,
      createdAt: now,
      updatedAt: now,
      isEdited: false,
      likes: 0,
      replyCount: 0,
      type: 'comment',
    };

    await commentsContainer.items.create(comment);

    // Increment post comment count
    await postsContainer
      .item(postId, post.userId)
      .patch([{ op: "incr", path: "/stats/comments", value: 1 }]);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
