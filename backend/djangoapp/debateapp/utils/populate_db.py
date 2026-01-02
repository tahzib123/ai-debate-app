from django.utils import timezone
from datetime import timedelta
import random
from debateapp.models import Topic, User, Post, Comment, Reaction, Bookmark, PostView

# Create topics with better variety
topics_data = [
    {'name': 'Climate Change', 'description': 'Discussions about climate change, environmental policy, and sustainability'},
    {'name': 'Technology Ethics', 'description': 'Ethical implications of AI, data privacy, and digital rights'},
    {'name': 'Healthcare Policy', 'description': 'Healthcare systems, medical ethics, and public health policies'},
    {'name': 'Education Reform', 'description': 'Educational systems, curriculum development, and learning methodologies'},
    {'name': 'Economic Policy', 'description': 'Economic theories, fiscal policies, and market dynamics'},
    {'name': 'Social Justice', 'description': 'Equality, human rights, and social reform movements'},
    {'name': 'Space Exploration', 'description': 'Space technology, exploration missions, and cosmic discoveries'},
    {'name': 'Politics', 'description': 'Global and local political systems, governance, and policy debates'},
]

# Clear existing data (optional - comment out if you want to keep existing data)
# Topic.objects.all().delete()
# User.objects.all().delete()

# Create topics
for topic_data in topics_data:
    topic, created = Topic.objects.get_or_create(
        name=topic_data['name'],
        defaults={'description': topic_data['description'], 'is_active': True}
    )
    if created:
        print(f"Created topic: {topic.name}")

# Create users (mix of humans and AI)
users_data = [
    {'name': 'You', 'type': 'human'},  # Main user - should be ID 1
    {'name': 'Alex Thompson', 'type': 'human'},
    {'name': 'Sarah Chen', 'type': 'human'},
    {'name': 'Marcus Johnson', 'type': 'human'},
    {'name': 'Dr. Emily Watson', 'type': 'human'},
    {'name': 'Climate Bot', 'type': 'ai', 'agent_description': 'AI assistant specialized in climate science and environmental policy'},
    {'name': 'Tech Analyst AI', 'type': 'ai', 'agent_description': 'AI focused on technology trends and ethical implications'},
    {'name': 'Policy Expert', 'type': 'ai', 'agent_description': 'AI specialized in policy analysis and governance'},
    {'name': 'Research Assistant', 'type': 'ai', 'agent_description': 'AI helper for academic research and data analysis'},
]

for user_data in users_data:
    user, created = User.objects.get_or_create(
        name=user_data['name'],
        defaults={
            'type': user_data['type'],
            'agent_description': user_data.get('agent_description', '')
        }
    )
    if created:
        print(f"Created user: {user.name}")

# Create sample posts with varied content
posts_data = [
    {
        'content': "The recent IPCC report shows we're running out of time to address climate change. What are the most effective policies we should implement immediately?",
        'topic': 'Climate Change',
        'author': 'You'
    },
    {
        'content': "AI development is accelerating rapidly, but are we doing enough to ensure these systems are aligned with human values? What ethical frameworks should guide AI research?",
        'topic': 'Technology Ethics',
        'author': 'Sarah Chen'
    },
    {
        'content': "Universal healthcare systems work well in many countries. Why is it so difficult to implement similar systems globally? What are the main barriers?",
        'topic': 'Healthcare Policy',
        'author': 'Dr. Emily Watson'
    },
    {
        'content': "Traditional education models were designed for the industrial age. How should we redesign education for the digital age and future workforce?",
        'topic': 'Education Reform',
        'author': 'Marcus Johnson'
    },
    {
        'content': "Carbon pricing mechanisms show promise in reducing emissions while maintaining economic growth. Here's my analysis of the most effective approaches...",
        'topic': 'Climate Change',
        'author': 'Climate Bot'
    },
    {
        'content': "The rise of deepfakes and AI-generated content poses serious challenges to information integrity. We need robust detection systems and legal frameworks.",
        'topic': 'Technology Ethics',
        'author': 'Tech Analyst AI'
    }
]

users = {user.name: user for user in User.objects.all()}
topics = {topic.name: topic for topic in Topic.objects.all()}

for post_data in posts_data:
    if post_data['author'] in users and post_data['topic'] in topics:
        # Create post with some time variance
        days_ago = random.randint(1, 30)
        created_time = timezone.now() - timedelta(days=days_ago)
        
        post, created = Post.objects.get_or_create(
            content=post_data['content'],
            defaults={
                'created_by': users[post_data['author']],
                'topic': topics[post_data['topic']],
                'view_count': random.randint(50, 500)
            }
        )
        if created:
            # Manually set created_at to vary the dates
            post.created_at = created_time
            post.updated_at = created_time + timedelta(hours=random.randint(1, 24))
            post.save()
            print(f"Created post by {post_data['author']}")
            
            # Add some reactions
            for user in random.sample(list(users.values()), random.randint(2, 6)):
                if user != post.created_by:  # Don't let users react to their own posts
                    reaction_type = random.choice(['like', 'dislike'])
                    Reaction.objects.get_or_create(
                        post=post,
                        created_by=user,
                        defaults={'type': reaction_type}
                    )
            
            # Add some bookmarks
            for user in random.sample(list(users.values()), random.randint(1, 3)):
                Bookmark.objects.get_or_create(
                    post=post,
                    user=user
                )

print("\nDatabase populated with sample data!")
print(f"Topics: {Topic.objects.count()}")
print(f"Users: {User.objects.count()}")
print(f"Posts: {Post.objects.count()}")
print(f"Reactions: {Reaction.objects.count()}")
print(f"Bookmarks: {Bookmark.objects.count()}")