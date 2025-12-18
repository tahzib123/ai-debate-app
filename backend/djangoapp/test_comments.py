#!/usr/bin/env python3

import os
import sys
import django
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoapp.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

print("Testing comment counts in API response")
print("=" * 40)

try:
    response = requests.get('http://localhost:8000/api/posts/')
    data = response.json()
    
    print(f"Total posts returned: {len(data)}")
    print()
    
    for post in data:
        print(f"Post {post['id']}: {post['comment_count']} comments")
        print(f"  Content: {post['content'][:60]}...")
        print(f"  Likes: {post['like_count']}, Dislikes: {post['dislike_count']}")
        print(f"  Views: {post['view_count']}")
        print()

except Exception as e:
    print(f"Error: {e}")
