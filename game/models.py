from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class GameSession(models.Model):
    """Model to track game sessions"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    SHIP_CHOICES = [
        ('blue', 'Blue Fighter'),
        ('red', 'Red Striker'),
        ('green', 'Green Scout'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=100, unique=True)
    difficulty = models.CharField(
        max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    ship_type = models.CharField(
        max_length=10, choices=SHIP_CHOICES, default='blue')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.session_id}"


class Score(models.Model):
    """Model to store game scores"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game_session = models.ForeignKey(
        GameSession, on_delete=models.CASCADE, null=True, blank=True)
    score = models.IntegerField()
    level_reached = models.IntegerField(default=1)
    difficulty = models.CharField(max_length=10, default='easy')
    ship_type = models.CharField(max_length=10, default='blue')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', '-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.score}"


class UserProfile(models.Model):
    """Extended user profile for game statistics"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_games_played = models.IntegerField(default=0)
    highest_score = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    favorite_ship = models.CharField(max_length=10, default='blue')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def update_stats(self, score, ship_type):
        """Update user statistics after a game"""
        self.total_games_played += 1
        self.total_score += score
        if score > self.highest_score:
            self.highest_score = score
        self.favorite_ship = ship_type
        self.save()


# Signal to create user profile when user is created


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'userprofile'):
        instance.userprofile.save()
