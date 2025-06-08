from django.contrib import admin
from .models import GameSession, Score, UserProfile


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_id', 'difficulty',
                    'ship_type', 'started_at', 'is_active']
    list_filter = ['difficulty', 'ship_type', 'is_active', 'started_at']
    search_fields = ['user__username', 'session_id']
    readonly_fields = ['session_id', 'started_at']


@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ['user', 'score', 'level_reached',
                    'difficulty', 'ship_type', 'created_at']
    list_filter = ['difficulty', 'ship_type', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']
    ordering = ['-score', '-created_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_games_played',
                    'highest_score', 'total_score', 'favorite_ship']
    list_filter = ['favorite_ship', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
