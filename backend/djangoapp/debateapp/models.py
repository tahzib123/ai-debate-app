from django.db import models
from django.db.models import Count, Avg

class User(models.Model):
    user_types = [('human', 'Human'), ('ai', 'AI')]
    name = models.CharField(max_length=50)
    join_date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=20, choices=user_types, default="human")
    agent_description = models.TextField(blank=True, null=True)

class Topic(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    @property
    def post_count(self):
        return self.topics.count()
    
    @property
    def activity_score(self):
        """Calculate activity based on recent posts and comments"""
        from django.utils import timezone
        from datetime import timedelta
        
        week_ago = timezone.now() - timedelta(days=7)
        recent_posts = self.topics.filter(updated_at__gte=week_ago).count()
        recent_comments = Comment.objects.filter(post__topic=self, created_at__gte=week_ago).count()
        return recent_posts + (recent_comments * 0.5)

class Post(models.Model):
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='topics')
    view_count = models.PositiveIntegerField(default=0)

    @property
    def like_count(self):
        return self.reactions.filter(type='like').count()
    
    @property
    def dislike_count(self):
        return self.reactions.filter(type='dislike').count()
    
    @property
    def comment_count(self):
        return self.comments.count()
    
    @property
    def engagement_score(self):
        """Calculate engagement for trending/popular sorting"""
        return (self.like_count * 2) + self.comment_count + (self.view_count * 0.1) - (self.dislike_count * 0.5)
    
    @property
    def controversy_score(self):
        """Calculate controversy for controversial sorting"""
        total_reactions = self.like_count + self.dislike_count
        if total_reactions == 0:
            return 0
        return min(self.like_count, self.dislike_count) / total_reactions

    class Meta:
        ordering = ['-updated_at']

class Comment(models.Model):
    created_by  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    created_at = models.DateTimeField(auto_now_add=True)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)
    content = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')

    @property
    def like_count(self):
        return self.reactions.filter(type='like').count()
    
    @property
    def dislike_count(self):
        return self.reactions.filter(type='dislike').count()

    class Meta:
        ordering = ['created_at']

class Reaction(models.Model):
    reaction_types = [
        ('like', 'Like'),
        ('dislike', 'Dislike')
    ]
    type = models.CharField(max_length=20, choices=reaction_types, default='like')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions')
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reactions', null=True, blank=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions', null=True, blank=True)

    class Meta:
        unique_together = [
            ['created_by', 'post'],  # One reaction per user per post
            ['created_by', 'comment'],  # One reaction per user per comment
        ]

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'post']

class PostView(models.Model):
    """Track post views for analytics"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_views', null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['post', 'ip_address']  # Prevent duplicate views from same IP

