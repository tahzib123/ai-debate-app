from django.urls import path
from . import views

urlpatterns = [
    path('topics/', views.getTopics),
    path('topic/create/', views.createTopic),
    path('user/<int:pk>/', views.user),
    path('user/<int:userId>/posts/', views.getUsersPosts),
    path('user/create/', views.createUser),
    path('users/', views.getUsers),
    path('posts/', views.getPosts),
    path('post/create/', views.createPost),
    path('post/<int:pk>/', views.post),
    path('post/<int:pk>/comments/', views.getCommentsForPost),
    path('comment/create/', views.createComment),
    path('comment/<int:pk>/', views.createComment),
]
