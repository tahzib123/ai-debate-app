# Debate App API Documentation

## Base URL

```
http://localhost:8000/api/
```

## Endpoints Overview

### Posts

#### GET `/posts/`

Get all posts with filtering and sorting options.

**Query Parameters:**

- `sort` (optional): `latest`, `popular`, `controversial` (default: `latest`)
- `topic` (optional): Topic ID to filter by
- `search` (optional): Search term for content, topic name, or author name

**Response:**

```json
[
  {
    "id": 1,
    "content": "Post content here...",
    "created_by": 1,
    "created_by_detail": {
      "id": 1,
      "name": "John Doe",
      "type": "human",
      "join_date": "2024-01-01T00:00:00Z"
    },
    "topic": 1,
    "topic_detail": {
      "id": 1,
      "name": "Climate Change",
      "description": "Climate discussions",
      "post_count": 5,
      "activity_score": 12.5,
      "is_active": true
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "view_count": 127,
    "like_count": 15,
    "dislike_count": 2,
    "comment_count": 8,
    "is_bookmarked": false,
    "user_reaction": null
  }
]
```

#### GET `/posts/trending/`

Get trending posts based on recent activity.

#### GET `/post/{id}/`

Get specific post details (also increments view count).

#### POST `/post/create/`

Create a new post.

**Request Body:**

```json
{
  "content": "Your post content here...",
  "created_by": 1,
  "topic": 1
}
```

#### GET `/post/{id}/comments/`

Get all comments for a specific post.

### Topics

#### GET `/topics/`

Get all topics with post counts and activity status.

**Response:**

```json
[
  {
    "id": 1,
    "name": "Climate Change",
    "description": "Climate discussions",
    "created_at": "2024-01-01T00:00:00Z",
    "is_active": true,
    "post_count": 5,
    "activity_score": 12.5
  }
]
```

#### GET `/topics/search/`

Search topics by name or description.

**Query Parameters:**

- `q`: Search query

#### POST `/topic/create/`

Create a new topic.

### Reactions

#### POST `/reaction/toggle/`

Toggle like/dislike on posts or comments.

**Request Body:**

```json
{
  "type": "like", // or "dislike"
  "post_id": 1, // optional, for post reactions
  "comment_id": 1, // optional, for comment reactions
  "user_id": 1 // optional, defaults to 1
}
```

**Response:**

```json
{
  "action": "created", // "created", "updated", or "removed"
  "type": "like"
}
```

### Bookmarks

#### POST `/bookmark/toggle/`

Toggle bookmark for a post.

**Request Body:**

```json
{
  "post_id": 1,
  "user_id": 1 // optional, defaults to 1
}
```

**Response:**

```json
{
  "action": "added" // "added" or "removed"
}
```

#### GET `/user/{user_id}/bookmarks/`

Get user's bookmarked posts.

### Comments

#### POST `/comment/create/`

Create a new comment.

**Request Body:**

```json
{
  "content": "Your comment here...",
  "post": 1,
  "created_by": 1,
  "parent": null // optional, for reply to comment
}
```

### Users

#### GET `/users/`

Get all users.

#### GET `/user/{id}/`

Get specific user details.

#### GET `/user/{user_id}/posts/`

Get all posts by a specific user.

### Statistics

#### GET `/statistics/`

Get dashboard statistics.

**Response:**

```json
{
  "total_posts": 25,
  "total_users": 12,
  "total_comments": 48,
  "active_debates": 8,
  "participants_today": 5,
  "new_posts_today": 3,
  "trending_topics": [
    {
      "id": 1,
      "name": "Climate Change",
      "recent_posts": 5
    }
  ]
}
```

## Frontend Integration Examples

### Fetching Posts with Sorting

```javascript
// Get latest posts
const latestPosts = await fetch("/api/posts/?sort=latest");

// Get popular posts
const popularPosts = await fetch("/api/posts/?sort=popular");

// Get posts by topic
const topicPosts = await fetch("/api/posts/?topic=1&sort=popular");

// Search posts
const searchResults = await fetch("/api/posts/?search=climate&sort=popular");
```

### Toggle Reactions

```javascript
// Like a post
const response = await fetch("/api/reaction/toggle/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "like",
    post_id: 1,
    user_id: 1,
  }),
});

const result = await response.json();
console.log(result); // { action: 'created', type: 'like' }
```

### Bookmark Post

```javascript
const response = await fetch("/api/bookmark/toggle/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    post_id: 1,
    user_id: 1,
  }),
});

const result = await response.json();
console.log(result); // { action: 'added' }
```

### Get Dashboard Statistics

```javascript
const stats = await fetch("/api/statistics/");
const data = await stats.json();
console.log(data.active_debates); // 8
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `422`: Unprocessable Entity
- `500`: Internal Server Error

Error responses include a message:

```json
{
  "error": "Invalid reaction type"
}
```

## Database Models

### Key Model Properties

**Post Model:**

- `like_count`: Computed property for number of likes
- `dislike_count`: Computed property for number of dislikes
- `comment_count`: Computed property for number of comments
- `engagement_score`: Computed score for popularity sorting
- `controversy_score`: Computed score for controversial sorting

**Topic Model:**

- `post_count`: Computed property for number of posts in topic
- `activity_score`: Computed score based on recent activity

**Reaction Model:**

- Unique constraint: One reaction per user per post/comment
- Supports both posts and comments

**Bookmark Model:**

- Unique constraint: One bookmark per user per post

**PostView Model:**

- Tracks unique views per IP address
- Used for view counting and analytics
