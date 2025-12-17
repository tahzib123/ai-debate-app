from rest_framework import serializers
from debateapp.models import Topic, User, Post, Comment


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(read_only=True, source='created_by')
    topic_detail = TopicSerializer(read_only=True, source='topic')

    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    topic = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all(), write_only=True)

    class Meta:
        model = Post
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    created_by_detail = UserSerializer(read_only=True, source='created_by')
    

    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)

    class Meta:
        model = Comment
        fields = '__all__'