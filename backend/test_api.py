"""
Test script for the new API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_posts_endpoint():
    print("Testing /posts/ endpoint...")
    
    # Test basic posts
    response = requests.get(f"{BASE_URL}/posts/")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Got {len(data)} posts")
        if data:
            post = data[0]
            print(f"  First post: {post.get('like_count', 0)} likes, {post.get('view_count', 0)} views")
    else:
        print(f"✗ Error: {response.status_code}")

def test_posts_sorting():
    print("\nTesting post sorting...")
    
    # Test popular sorting
    response = requests.get(f"{BASE_URL}/posts/?sort=popular")
    if response.status_code == 200:
        print("✓ Popular sorting works")
    else:
        print(f"✗ Popular sorting error: {response.status_code}")
    
    # Test controversial sorting
    response = requests.get(f"{BASE_URL}/posts/?sort=controversial")
    if response.status_code == 200:
        print("✓ Controversial sorting works")
    else:
        print(f"✗ Controversial sorting error: {response.status_code}")

def test_topics_endpoint():
    print("\nTesting /topics/ endpoint...")
    
    response = requests.get(f"{BASE_URL}/topics/")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Got {len(data)} topics")
        if data:
            topic = data[0]
            print(f"  First topic: {topic.get('name')} ({topic.get('post_count', 0)} posts)")
    else:
        print(f"✗ Error: {response.status_code}")

def test_statistics_endpoint():
    print("\nTesting /statistics/ endpoint...")
    
    response = requests.get(f"{BASE_URL}/statistics/")
    if response.status_code == 200:
        data = response.json()
        print("✓ Statistics endpoint works")
        print(f"  Total posts: {data.get('total_posts')}")
        print(f"  Active debates: {data.get('active_debates')}")
        print(f"  Total users: {data.get('total_users')}")
    else:
        print(f"✗ Error: {response.status_code}")

def test_reaction_toggle():
    print("\nTesting reaction toggle...")
    
    # Toggle like on post 1
    data = {
        "type": "like",
        "post_id": 1,
        "user_id": 1
    }
    
    response = requests.post(f"{BASE_URL}/reaction/toggle/", 
                           headers={'Content-Type': 'application/json'},
                           data=json.dumps(data))
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Reaction toggle works: {result.get('action')} {result.get('type')}")
    else:
        print(f"✗ Reaction toggle error: {response.status_code}")

def test_bookmark_toggle():
    print("\nTesting bookmark toggle...")
    
    data = {
        "post_id": 1,
        "user_id": 1
    }
    
    response = requests.post(f"{BASE_URL}/bookmark/toggle/", 
                           headers={'Content-Type': 'application/json'},
                           data=json.dumps(data))
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Bookmark toggle works: {result.get('action')}")
    else:
        print(f"✗ Bookmark toggle error: {response.status_code}")

def test_trending_posts():
    print("\nTesting trending posts...")
    
    response = requests.get(f"{BASE_URL}/posts/trending/")
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Got {len(data)} trending posts")
    else:
        print(f"✗ Trending posts error: {response.status_code}")

if __name__ == "__main__":
    print("Testing new API endpoints...")
    print("=" * 50)
    
    try:
        test_posts_endpoint()
        test_posts_sorting()
        test_topics_endpoint()
        test_statistics_endpoint()
        test_reaction_toggle()
        test_bookmark_toggle()
        test_trending_posts()
        
        print("\n" + "=" * 50)
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to server. Make sure Django is running on localhost:8000")
    except Exception as e:
        print(f"✗ Error during testing: {e}")
