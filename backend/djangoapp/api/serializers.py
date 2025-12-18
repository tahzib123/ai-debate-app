from rest_framework import serializers
from debateapp.models import Topic, User, Post, Comment, Reaction, Bookmark, PostView
from django.db.models import Q


class TopicSerializer(serializers.ModelSerializer):
    post_count = serializers.ReadOnlyField()
    activity_score = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()

    class Meta:
        model = Topic
        fields = ['id', 'name', 'description', 'created_at', 'is_active', 'post_count', 'activity_score']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class ReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reaction
        fields = ['id', 'type', 'created_by', 'created_at', 'post', 'comment']


class PostSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(read_only=True, source='created_by')
    topic_detail = TopicSerializer(read_only=True, source='topic')
    
    # Engagement metrics
    like_count = serializers.ReadOnlyField()
    dislike_count = serializers.ReadOnlyField()
    comment_count = serializers.ReadOnlyField()
    view_count = serializers.ReadOnlyField()
    
    # User-specific fields (require user context)
    is_bookmarked = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_disliked = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()

    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    topic = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all(), write_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'content', 'created_by', 'created_by_detail', 'created_at', 
            'updated_at', 'topic', 'topic_detail', 'view_count',
            'like_count', 'dislike_count', 'comment_count',
            'is_bookmarked', 'is_liked', 'is_disliked', 'user_reaction'
        ]

    def get_is_bookmarked(self, obj):
        """Check if current user has bookmarked this post"""
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            # For demo purposes, we'll use user ID 1
            return Bookmark.objects.filter(post=obj, user_id=1).exists()
        return False

    def get_is_liked(self, obj):
        """Check if current user has liked this post"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # For demo purposes, we'll use user ID 1
            return Reaction.objects.filter(post=obj, created_by_id=1, type='like').exists()
        return False

    def get_is_disliked(self, obj):
        """Check if current user has disliked this post"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # For demo purposes, we'll use user ID 1
            return Reaction.objects.filter(post=obj, created_by_id=1, type='dislike').exists()
        return False

    def get_user_reaction(self, obj):
        """Get current user's reaction to this post"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # For demo purposes, we'll use user ID 1
            try:
                reaction = Reaction.objects.get(post=obj, created_by_id=1)
                return reaction.type
            except Reaction.DoesNotExist:
                return None
        return None


class CommentSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(read_only=True, source='created_by')
    
    # Engagement metrics
    like_count = serializers.ReadOnlyField()
    dislike_count = serializers.ReadOnlyField()
    
    # User-specific fields
    user_reaction = serializers.SerializerMethodField()
    
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)

    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'created_by', 'created_by_detail', 'created_at', 
            'updated_at', 'post', 'parent', 'like_count', 'dislike_count', 'user_reaction'
        ]

    def get_user_reaction(self, obj):
        """Get current user's reaction to this comment"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # For demo purposes, we'll use user ID 1
            try:
                reaction = Reaction.objects.get(comment=obj, created_by_id=1)
                return reaction.type
            except Reaction.DoesNotExist:
                return None
        return None


class BookmarkSerializer(serializers.ModelSerializer):
    post_detail = PostSerializer(read_only=True, source='post')
    
    class Meta:
        model = Bookmark
        fields = ['id', 'post', 'post_detail', 'created_at']


class PostViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostView
        fields = ['id', 'post', 'user', 'ip_address', 'viewed_at']