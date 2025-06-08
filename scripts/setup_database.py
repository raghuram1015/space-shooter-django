#!/usr/bin/env python
"""
Script to set up the database and create initial data
"""
from game.models import Score, UserProfile
from django.contrib.auth.models import User
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'space_shooter.settings')
django.setup()


def create_sample_data():
    """Create sample users and scores for testing"""

    # Create sample users
    users_data = [
        {'username': 'player1', 'email': 'player1@example.com',
            'password': 'testpass123'},
        {'username': 'player2', 'email': 'player2@example.com',
            'password': 'testpass123'},
        {'username': 'player3', 'email': 'player3@example.com',
            'password': 'testpass123'},
        {'username': 'spacehero', 'email': 'hero@example.com',
            'password': 'testpass123'},
        {'username': 'alienslayer', 'email': 'slayer@example.com',
            'password': 'testpass123'},
    ]

    created_users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email']
            }
        )
        if created:
            user.set_password(user_data['password'])
            user.save()
            print(f"Created user: {user.username}")
        created_users.append(user)

    # Create sample scores
    import random
    from datetime import datetime, timedelta

    difficulties = ['easy', 'medium', 'hard']
    ships = ['blue', 'red', 'green']

    for user in created_users:
        # Create 5-10 random scores for each user
        num_scores = random.randint(5, 10)
        for i in range(num_scores):
            score_value = random.randint(1000, 50000)
            level = min(score_value // 500 + 1, 20)
            difficulty = random.choice(difficulties)
            ship = random.choice(ships)

            # Random date within last 30 days
            days_ago = random.randint(0, 30)
            created_at = datetime.now() - timedelta(days=days_ago)

            score = Score.objects.create(
                user=user,
                score=score_value,
                level_reached=level,
                difficulty=difficulty,
                ship_type=ship
            )
            score.created_at = created_at
            score.save()

            # Update user profile
            profile = user.userprofile
            profile.update_stats(score_value, ship)

    print("Sample data created successfully!")
    print(f"Total users: {User.objects.count()}")
    print(f"Total scores: {Score.objects.count()}")

    # Display top 5 scores
    top_scores = Score.objects.order_by('-score')[:5]
    print("\nTop 5 Scores:")
    for i, score in enumerate(top_scores, 1):
        print(
            f"{i}. {score.user.username}: {score.score} (Level {score.level_reached})")


if __name__ == '__main__':
    create_sample_data()
