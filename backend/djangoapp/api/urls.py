from django.urls import path
from . import views

urlpatterns = [
    # Topic endpoints
    path('topics/', views.getTopics, name='get_topics'),
    path('topics/search/', views.searchTopics, name='search_topics'),
    path('topic/create/', views.createTopic, name='create_topic'),
    
    # User endpoints
    path('users/', views.getUsers, name='get_users'),
    path('user/<int:pk>/', views.user, name='user_detail'),
    path('user/<int:userId>/posts/', views.getUsersPosts, name='user_posts'),
    path('user/<int:user_id>/bookmarks/', views.getUserBookmarks, name='user_bookmarks'),
    
    # Post endpoints
    path('posts/', views.getPosts, name='get_posts'),
    path('posts/trending/', views.getTrendingPosts, name='trending_posts'),
    path('post/create/', views.createPost, name='create_post'),
    path('post/<int:pk>/', views.post, name='post_detail'),
    path('post/<int:pk>/comments/', views.getCommentsForPost, name='post_comments'),
    
    # Comment endpoints
    path('comment/create/', views.createComment, name='create_comment'),
    
    # Reaction endpoints
    path('reaction/toggle/', views.toggleReaction, name='toggle_reaction'),
    
    # Bookmark endpoints
    path('bookmark/toggle/', views.toggleBookmark, name='toggle_bookmark'),
    
    # Statistics endpoint
    path('statistics/', views.getStatistics, name='get_statistics'),
]
