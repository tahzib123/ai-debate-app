from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from debateapp.models import Topic, User, Post, Comment, Reaction, Bookmark, PostView
from .serializers import (
    TopicSerializer, UserSerializer, PostSerializer, CommentSerializer, 
    ReactionSerializer, BookmarkSerializer
)
from rest_framework import status
from django.db.models import Q, Count, F
from django.utils import timezone
from datetime import timedelta
import ipaddress
import threading
import time
from debateapp.personas import choose_persona_ai, get_ai_responses, AI_PERSONAS

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@api_view(['GET'])
def getTopics(request):
    """Get all topics with post counts and activity status"""
    topics = Topic.objects.annotate(
        annotated_post_count=Count('topics', distinct=True)
    ).order_by('-annotated_post_count', 'name')
    serializer = TopicSerializer(topics, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def searchTopics(request):
    """Search topics by name"""
    query = request.GET.get('q', '')
    if query:
        topics = Topic.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        ).annotate(annotated_post_count=Count('topics', distinct=True)).order_by('-annotated_post_count')
    else:
        topics = Topic.objects.none()
    
    serializer = TopicSerializer(topics, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def createTopic(request):
    serializer = TopicSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def getPosts(request):
    """Get posts with filtering and sorting"""
    posts = Post.objects.select_related('created_by', 'topic').prefetch_related('reactions')
    
    # Topic filtering
    topic_id = request.GET.get('topic')
    if topic_id:
        posts = posts.filter(topic_id=topic_id)
    
    # Search filtering
    search = request.GET.get('search', '')
    if search:
        posts = posts.filter(
            Q(content__icontains=search) | 
            Q(topic__name__icontains=search) |
            Q(created_by__name__icontains=search)
        )
    
    # Sorting
    sort_by = request.GET.get('sort', 'latest')
    if sort_by == 'latest':
        posts = posts.order_by('-updated_at')
    elif sort_by == 'popular':
        # Sort by engagement score (likes + comments + views)
        posts = posts.annotate(
            annotated_like_count=Count('reactions', filter=Q(reactions__type='like'), distinct=True),
            annotated_comment_count=Count('comments', distinct=True),
        ).order_by('-annotated_like_count', '-annotated_comment_count', '-view_count', '-updated_at')
    elif sort_by == 'controversial':
        # Sort by controversy score (posts with mixed reactions)
        posts = posts.annotate(
            annotated_like_count=Count('reactions', filter=Q(reactions__type='like'), distinct=True),
            annotated_dislike_count=Count('reactions', filter=Q(reactions__type='dislike'), distinct=True),
            annotated_total_reactions=Count('reactions', distinct=True)
        ).order_by('-annotated_total_reactions', '-updated_at')
    
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def getTrendingPosts(request):
    """Get trending posts based on recent activity"""
    week_ago = timezone.now() - timedelta(days=7)
    
    trending_posts = Post.objects.select_related('created_by', 'topic').annotate(
        recent_likes=Count('reactions', filter=Q(reactions__type='like', reactions__created_at__gte=week_ago)),
        recent_comments=Count('comments', filter=Q(comments__created_at__gte=week_ago)),
        recent_views=Count('views', filter=Q(views__viewed_at__gte=week_ago))
    ).filter(
        Q(updated_at__gte=week_ago) |
        Q(recent_likes__gt=0) |
        Q(recent_comments__gt=0) |
        Q(recent_views__gt=5)
    ).order_by('-recent_likes', '-recent_comments', '-recent_views', '-updated_at')[:20]
    
    serializer = PostSerializer(trending_posts, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def getUsersPosts(request, userId):
    try:
        posts = Post.objects.filter(created_by=userId).select_related('created_by', 'topic')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    except Post.DoesNotExist:
        return Response([], status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'PUT'])
def post(request, pk):
    try:
        post_obj = Post.objects.select_related('created_by', 'topic').get(pk=pk)
    except Post.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Track view
        client_ip = get_client_ip(request)
        if client_ip:
            PostView.objects.get_or_create(
                post=post_obj,
                ip_address=client_ip,
                defaults={'user_id': 1}  # For demo, use user ID 1
            )
            # Update view count
            post_obj.view_count = F('view_count') + 1
            post_obj.save(update_fields=['view_count'])
            post_obj.refresh_from_db()
        
        serializer = PostSerializer(post_obj, context={'request': request})
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = PostSerializer(post_obj, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

@api_view(['GET'])
def getCommentsForPost(request, pk):
    try:
        comments = Comment.objects.filter(post=pk).select_related('created_by').order_by('created_at')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    except Comment.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def createPost(request):
    serializer = PostSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        post = serializer.save()
        
        # Trigger AI responses in a background thread to avoid blocking the response
        def generate_ai_responses():
            try:
                # Build conversation history for this specific post
                conversation_history = []
                
                # Start with the original post
                conversation_history.append({
                    "role": "user" if post.created_by.type == "human" else "assistant",
                    "content": f"{post.created_by.name}: {post.content}"
                })
                
                # Add all existing comments/replies to this post in chronological order
                existing_comments = Comment.objects.filter(post=post).order_by('created_at')
                for comment in existing_comments:
                    conversation_history.append({
                        "role": "user" if comment.created_by.type == "human" else "assistant", 
                        "content": f"{comment.created_by.name}: {comment.content}"
                    })
                
                # Add some recent context from other posts in the same topic (for broader context)
                recent_posts = Post.objects.filter(topic=post.topic).exclude(id=post.id).order_by('-created_at')[:3]
                topic_context = []
                for p in recent_posts:
                    topic_context.append({
                        "role": "system",
                        "content": f"Recent topic discussion - {p.created_by.name}: {p.content}"
                    })
                
                # Combine topic context + current post conversation
                full_context = topic_context + conversation_history
                
                # Choose which AI personas should respond
                selected_personas = choose_persona_ai(post.content, full_context)
                
                # Get AI responses
                ai_responses = get_ai_responses(selected_personas, full_context)
                
                # Create comments for each AI response immediately
                for i, response in enumerate(ai_responses):
                    persona_name = response["persona"]["username"]
                    ai_user = User.objects.filter(name=persona_name, type="ai").first()
                    
                    if ai_user:
                        Comment.objects.create(
                            created_by=ai_user,
                            post=post,
                            content=response["message"]
                        )
                        
            except Exception as e:
                print(f"Error generating AI responses: {e}")
        
        # Start the AI response generation in a background thread
        thread = threading.Thread(target=generate_ai_responses)
        thread.daemon = True
        thread.start()
        
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def triggerAIResponses(request, post_id):
    """Manually trigger AI responses for a specific post (for testing/debugging)"""
    try:
        post = Post.objects.get(id=post_id)
        
        # Build conversation history for this specific post
        conversation_history = []
        
        # Start with the original post
        conversation_history.append({
            "role": "user" if post.created_by.type == "human" else "assistant",
            "content": f"{post.created_by.name}: {post.content}"
        })
        
        # Add all existing comments/replies to this post in chronological order
        existing_comments = Comment.objects.filter(post=post).order_by('created_at')
        for comment in existing_comments:
            conversation_history.append({
                "role": "user" if comment.created_by.type == "human" else "assistant", 
                "content": f"{comment.created_by.name}: {comment.content}"
            })
        
        # Add some recent context from other posts in the same topic
        recent_posts = Post.objects.filter(topic=post.topic).exclude(id=post.id).order_by('-created_at')[:3]
        topic_context = []
        for p in recent_posts:
            topic_context.append({
                "role": "system",
                "content": f"Recent topic discussion - {p.created_by.name}: {p.content}"
            })
        
        # Combine topic context + current post conversation
        full_context = topic_context + conversation_history
        
        # Choose which AI personas should respond
        selected_personas = choose_persona_ai(post.content, full_context)
        
        # Get AI responses
        ai_responses = get_ai_responses(selected_personas, full_context)
        
        # Create comments for each AI response
        created_comments = []
        for response in ai_responses:
            persona_name = response["persona"]["username"]
            ai_user = User.objects.filter(name=persona_name, type="ai").first()
            
            if ai_user:
                comment = Comment.objects.create(
                    created_by=ai_user,
                    post=post,
                    content=response["message"]
                )
                created_comments.append({
                    'id': comment.id,
                    'persona': persona_name,
                    'content': response["message"]
                })
        
        return Response({
            'success': True,
            'message': f'Created {len(created_comments)} AI responses',
            'responses': created_comments
        })
        
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def createComment(request):
    serializer = CommentSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Reaction endpoints
@csrf_exempt
@api_view(['POST'])
def toggleReaction(request):
    """Toggle like/dislike on post or comment"""
    reaction_type = request.data.get('type')  # 'like' or 'dislike'
    post_id = request.data.get('post_id')
    comment_id = request.data.get('comment_id')
    user_id = request.data.get('user_id', 1)  # Default to user 1 for demo
    
    if not reaction_type or reaction_type not in ['like', 'dislike']:
        return Response({'error': 'Invalid reaction type'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not (post_id or comment_id):
        return Response({'error': 'Post ID or Comment ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Check if reaction already exists
        if post_id:
            existing_reaction = Reaction.objects.filter(post_id=post_id, created_by_id=user_id).first()
        else:
            existing_reaction = Reaction.objects.filter(comment_id=comment_id, created_by_id=user_id).first()
        
        if existing_reaction:
            if existing_reaction.type == reaction_type:
                # Remove reaction if same type
                existing_reaction.delete()
                return Response({'action': 'removed', 'type': reaction_type})
            else:
                # Update reaction type
                existing_reaction.type = reaction_type
                existing_reaction.save()
                return Response({'action': 'updated', 'type': reaction_type})
        else:
            # Create new reaction
            reaction_data = {
                'type': reaction_type,
                'created_by': user_id,
                'post': post_id,
                'comment': comment_id
            }
            serializer = ReactionSerializer(data=reaction_data)
            if serializer.is_valid():
                serializer.save()
                return Response({'action': 'created', 'type': reaction_type})
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Bookmark endpoints
@csrf_exempt
@api_view(['POST'])
def toggleBookmark(request):
    """Toggle bookmark for a post"""
    post_id = request.data.get('post_id')
    user_id = request.data.get('user_id', 1)  # Default to user 1 for demo
    
    if not post_id:
        return Response({'error': 'Post ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        bookmark = Bookmark.objects.filter(post_id=post_id, user_id=user_id).first()
        if bookmark:
            bookmark.delete()
            return Response({'action': 'removed'})
        else:
            Bookmark.objects.create(post_id=post_id, user_id=user_id)
            return Response({'action': 'added'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def getUserBookmarks(request, user_id):
    """Get user's bookmarked posts"""
    bookmarks = Bookmark.objects.filter(user_id=user_id).select_related('post__created_by', 'post__topic')
    serializer = BookmarkSerializer(bookmarks, many=True, context={'request': request})
    return Response(serializer.data)

# Statistics endpoints
@api_view(['GET'])
def getStatistics(request):
    """Get dashboard statistics"""
    from django.utils import timezone
    from datetime import timedelta
    
    today = timezone.now().date()
    week_ago = timezone.now() - timedelta(days=7)
    
    stats = {
        'total_posts': Post.objects.count(),
        'total_users': User.objects.count(),
        'total_comments': Comment.objects.count(),
        'active_debates': Post.objects.filter(updated_at__gte=week_ago).count(),
        'participants_today': User.objects.filter(
            Q(posts__created_at__date=today) | Q(comments__created_at__date=today)
        ).distinct().count(),
        'new_posts_today': Post.objects.filter(created_at__date=today).count(),
        'trending_topics': Topic.objects.annotate(
            recent_posts=Count('topics', filter=Q(topics__updated_at__gte=week_ago))
        ).filter(recent_posts__gt=0).order_by('-recent_posts')[:5].values('id', 'name', 'recent_posts')
    }
    
    return Response(stats)

@api_view(['GET'])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT'])
def user(request, pk):
    try:
        user = User.objects.get(pk=pk)
        
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

@api_view(['POST'])
def createUser(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
def comment(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
        serializer = CommentSerializer(data=comment)
    except Comment.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CommentSerializer(post, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
@api_view(['POST'])
def createComment(request):
    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
