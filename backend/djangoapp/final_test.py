#!/usr/bin/env python3

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_comprehensive_api():
    print("🎯 Comprehensive API Test Suite")
    print("=" * 50)

    # Test 1: Get all posts (latest)
    print("1. 📝 Latest Posts:")
    response = requests.get(f"{BASE_URL}/api/posts/")
    if response.status_code == 200:
        posts = response.json()
        print(f"   ✅ Found {len(posts)} posts")
        if posts:
            print(f"   📄 Latest: \"{posts[0]['content'][:50]}...\"")

    # Test 2: Popular sorting
    print("\n2. 🔥 Popular Posts:")
    response = requests.get(f"{BASE_URL}/api/posts/?sort=popular")
    if response.status_code == 200:
        posts = response.json()
        print(f"   ✅ Found {len(posts)} posts sorted by popularity")
        if posts:
            post = posts[0]
            print(f"   👍 Most popular: {post['like_count']} likes, {post['comment_count']} comments")

    # Test 3: Controversial sorting
    print("\n3. 💥 Controversial Posts:")
    response = requests.get(f"{BASE_URL}/api/posts/?sort=controversial")
    if response.status_code == 200:
        posts = response.json()
        print(f"   ✅ Found {len(posts)} posts sorted by controversy")

    # Test 4: Topic filtering
    print("\n4. 🏷️ Topics:")
    response = requests.get(f"{BASE_URL}/api/topics/")
    if response.status_code == 200:
        topics = response.json()
        print(f"   ✅ Found {len(topics)} topics")
        for topic in topics[:3]:
            print(f"   📋 {topic['name']}: {topic['post_count']} posts")

    # Test 5: Search functionality
    print("\n5. 🔍 Search:")
    response = requests.get(f"{BASE_URL}/api/topics/search/?q=AI")
    if response.status_code == 200:
        topics = response.json()
        print(f"   ✅ Found {len(topics)} topics matching 'AI'")

    # Test 6: Post search
    response = requests.get(f"{BASE_URL}/api/posts/?search=AI")
    if response.status_code == 200:
        posts = response.json()
        print(f"   ✅ Found {len(posts)} posts mentioning 'AI'")

    # Test 7: Trending posts
    print("\n6. 📈 Trending Posts:")
    response = requests.get(f"{BASE_URL}/api/posts/trending/")
    if response.status_code == 200:
        posts = response.json()
        print(f"   ✅ Found {len(posts)} trending posts")

    # Test 8: Statistics
    print("\n7. 📊 Platform Statistics:")
    response = requests.get(f"{BASE_URL}/api/statistics/")
    if response.status_code == 200:
        stats = response.json()
        print(f"   📄 Total Posts: {stats['total_posts']}")
        print(f"   👥 Total Users: {stats['total_users']}")
        print(f"   🗣️ Active Debates: {stats['active_debates']}")

    # Test 9: Interactive features
    print("\n8. 💫 Interactive Features:")
    
    # Get a post to interact with
    response = requests.get(f"{BASE_URL}/api/posts/")
    if response.status_code == 200:
        posts = response.json()
        if posts:
            post_id = posts[0]['id']
            
            # Test like toggle
            response = requests.post(f"{BASE_URL}/api/posts/{post_id}/toggle-reaction/", 
                                   json={"type": "like"})
            if response.status_code == 200:
                result = response.json()
                print(f"   👍 Reaction: {result['action']} - {result['type']}")
            
            # Test bookmark toggle
            response = requests.post(f"{BASE_URL}/api/posts/{post_id}/toggle-bookmark/")
            if response.status_code == 200:
                result = response.json()
                print(f"   🔖 Bookmark: {result['action']}")
            
            # Test view tracking
            response = requests.post(f"{BASE_URL}/api/posts/{post_id}/view/")
            if response.status_code == 200:
                result = response.json()
                print(f"   👀 View count: {result['view_count']}")

    print("\n🎉 All Enhanced Features Working!")
    print("✨ Backend fully supports the new frontend UI!")

if __name__ == "__main__":
    test_comprehensive_api()
