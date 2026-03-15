"""
Social API Routes for App Builder
"""

from datetime import datetime
from typing import Optional, List
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/social", tags=["social"])

# In-memory storage for social posts
social_posts = []

class SocialPostCreate(BaseModel):
    project_id: str
    author_name: str
    title: str
    content: str
    post_type: str = "app"
    code_snapshot: dict
    tags: List[str] = []

class SocialPost(BaseModel):
    id: str
    project_id: str
    author_name: str
    title: str
    content: str
    post_type: str
    code_snapshot: dict
    tags: List[str]
    likes: int
    created_at: str

@router.post("/posts", response_model=SocialPost)
async def create_post(post: SocialPostCreate):
    new_post = SocialPost(
        id=str(uuid4()),
        project_id=post.project_id,
        author_name=post.author_name,
        title=post.title,
        content=post.content,
        post_type=post.post_type,
        code_snapshot=post.code_snapshot,
        tags=post.tags,
        likes=0,
        created_at=datetime.utcnow().isoformat()
    )
    social_posts.insert(0, new_post)
    return new_post

@router.get("/posts", response_model=List[SocialPost])
async def list_posts(limit: int = 10):
    return social_posts[:limit]

@router.post("/posts/{post_id}/like")
async def like_post(post_id: str):
    for post in social_posts:
        if post.id == post_id:
            post.likes += 1
            return {"likes": post.likes}
    raise HTTPException(status_code=404, detail="Post not found")
