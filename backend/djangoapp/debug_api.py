#!/usr/bin/env python3

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoapp.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from debateapp.models import Post, Topic, Comment, Reaction
from django.db.models import Count, Q

print("Debug API Issues")
print("==================")

try:
    # Test basic post query
    posts = Post.objects.all()
    print(f"✓ Basic post query: {posts.count()} posts")
    
    # Test post with reactions
    posts_with_reactions = Post.objects.select_related('created_by', 'topic').prefetch_related('reactions')
    print(f"✓ Posts with relations: {posts_with_reactions.count()} posts")
    
    # Test popular sorting step by step
    print("\nTesting popular sort logic:")
    posts = Post.objects.all()
    
    # Step 1: Add like count annotation
    posts_with_likes = posts.annotate(
        like_count=Count('reactions', filter=Q(reactions__type='like'), distinct=True)
    )
    print(f"✓ Posts with like annotation: {posts_with_likes.count()}")
    
    # Step 2: Add comment count annotation  
    posts_with_comments = posts_with_likes.annotate(
        comment_count=Count('comments', distinct=True)
    )
    print(f"✓ Posts with comment annotation: {posts_with_comments.count()}")
    
    # Step 3: Apply ordering
    ordered_posts = posts_with_comments.order_by('-like_count', '-comment_count', '-view_count', '-updated_at')
    print(f"✓ Ordered posts: {ordered_posts.count()}")
    
    # Test topic query
    topics = Topic.objects.all()
    print(f"✓ Basic topics: {topics.count()}")
    
    # Test topic with annotation
    topics_with_counts = Topic.objects.annotate(
        post_count=Count('topics', distinct=True)
    )
    print(f"✓ Topics with post counts: {topics_with_counts.count()}")
    
    # Test the first few posts
    print(f"\nFirst 3 posts:")
    for post in ordered_posts[:3]:
        print(f"- Post {post.id}: {post.like_count} likes, {post.comment_count} comments, {post.view_count} views")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
