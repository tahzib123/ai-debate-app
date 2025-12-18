import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoints():
    print("Testing Enhanced API Endpoints\n" + "="*50)
    
    # Test 1: Get posts with sorting
    print("1. Testing posts endpoint with sorting:")
    try:
        # Test latest sorting
        response = requests.get(f"{BASE_URL}/posts/?sort=latest")
        print(f"   Latest posts: {response.status_code} - {len(response.json()) if response.status_code == 200 else 'Error'}")
        
        # Test popular sorting
        response = requests.get(f"{BASE_URL}/posts/?sort=popular")
        print(f"   Popular posts: {response.status_code} - {len(response.json()) if response.status_code == 200 else 'Error'}")
        
        # Test controversial sorting
        response = requests.get(f"{BASE_URL}/posts/?sort=controversial")
        print(f"   Controversial posts: {response.status_code} - {len(response.json()) if response.status_code == 200 else 'Error'}")
        
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Get topics with counts
    print("\n2. Testing enhanced topics endpoint:")
    try:
        response = requests.get(f"{BASE_URL}/topics/")
        if response.status_code == 200:
            topics = response.json()
            print(f"   Topics found: {len(topics)}")
            if topics:
                topic = topics[0]
                print(f"   Sample topic: {topic.get('name')} (Posts: {topic.get('post_count', 0)})")
        else:
            print(f"   Error: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Search topics
    print("\n3. Testing topic search:")
    try:
        response = requests.get(f"{BASE_URL}/topics/search/?q=climate")
        print(f"   Search 'climate': {response.status_code} - {len(response.json()) if response.status_code == 200 else 'Error'}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Get trending posts
    print("\n4. Testing trending posts:")
    try:
        response = requests.get(f"{BASE_URL}/posts/trending/")
        print(f"   Trending posts: {response.status_code} - {len(response.json()) if response.status_code == 200 else 'Error'}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 5: Get statistics
    print("\n5. Testing statistics endpoint:")
    try:
        response = requests.get(f"{BASE_URL}/statistics/")
        if response.status_code == 200:
            stats = response.json()
            print(f"   Total posts: {stats.get('total_posts', 0)}")
            print(f"   Total users: {stats.get('total_users', 0)}")
            print(f"   Active debates: {stats.get('active_debates', 0)}")
        else:
            print(f"   Error: {response.status_code}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 6: Toggle reaction
    print("\n6. Testing reaction toggle:")
    try:
        # First get a post ID
        posts_response = requests.get(f"{BASE_URL}/posts/")
        if posts_response.status_code == 200 and posts_response.json():
            post_id = posts_response.json()[0]['id']
            
            # Toggle like reaction
            reaction_data = {
                'type': 'like',
                'post_id': post_id,
                'user_id': 1
            }
            response = requests.post(f"{BASE_URL}/reaction/toggle/", json=reaction_data)
            print(f"   Toggle like: {response.status_code} - {response.json() if response.status_code == 200 else 'Error'}")
        else:
            print("   No posts found to test reactions")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 7: Toggle bookmark
    print("\n7. Testing bookmark toggle:")
    try:
        # Get a post ID
        posts_response = requests.get(f"{BASE_URL}/posts/")
        if posts_response.status_code == 200 and posts_response.json():
            post_id = posts_response.json()[0]['id']
            
            # Toggle bookmark
            bookmark_data = {
                'post_id': post_id,
                'user_id': 1
            }
            response = requests.post(f"{BASE_URL}/bookmark/toggle/", json=bookmark_data)
            print(f"   Toggle bookmark: {response.status_code} - {response.json() if response.status_code == 200 else 'Error'}")
        else:
            print("   No posts found to test bookmarks")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 8: Get post with view tracking
    print("\n8. Testing post view tracking:")
    try:
        posts_response = requests.get(f"{BASE_URL}/posts/")
        if posts_response.status_code == 200 and posts_response.json():
            post_id = posts_response.json()[0]['id']
            
            # Get post detail (should increment view count)
            response = requests.get(f"{BASE_URL}/post/{post_id}/")
            if response.status_code == 200:
                post = response.json()
                print(f"   Post view count: {post.get('view_count', 0)}")
                print(f"   Like count: {post.get('like_count', 0)}")
                print(f"   Comment count: {post.get('comment_count', 0)}")
            else:
                print(f"   Error: {response.status_code}")
        else:
            print("   No posts found")
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    test_endpoints()
