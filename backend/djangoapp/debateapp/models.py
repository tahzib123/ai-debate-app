from django.db import models

class User(models.Model):
    user_types = [('human', 'Human'), ('ai', 'AI')]
    name = models.CharField(max_length=50)
    join_date = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=20, choices=user_types, default="human")
    agent_description = models.TextField(blank=True, null=True)

class Topic(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

class Post(models.Model):
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    updated_at = models.DateTimeField(auto_now=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='topics')

class Comment(models.Model):
    created_by  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    created_at = models.DateTimeField(auto_now_add=True)
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)
    content = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')

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

