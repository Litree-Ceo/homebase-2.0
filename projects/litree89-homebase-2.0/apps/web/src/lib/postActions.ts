/**
 * Post Actions - Migrated to Azure Functions
 *
 * This file previously used Firebase Firestore.
 * Functionality has been replaced with Cosmos DB via Azure Functions.
 *
 * See: api/src/functions/bot-api.ts for serverless endpoints
 * Database: Azure Cosmos DB via apps/web/src/lib/cosmos.ts
 */

export const likePost = async (postId: string) => {
  // Implement via Cosmos DB REST endpoint
  // POST /api/posts/{postId}/like
  const response = await fetch(`/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
};

export const addComment = async (postId: string, content: string) => {
  // Implement via Cosmos DB REST endpoint
  // POST /api/posts/{postId}/comments
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return response.json();
};

export const markRead = async (notificationId: string) => {
  // Mark notification as read via API
  // PATCH /api/notifications/{notificationId}
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read: true }),
  });
  return response.json();
};
