from django.urls import path
from . import views

app_name = 'game'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/user/', views.get_user, name='get_user'),

    # Game endpoints
    path('game/start/', views.start_game, name='start_game'),
    path('game/end/', views.end_game, name='end_game'),
    path('game/update/', views.update_game_state, name='update_game_state'),
    path('game/leaderboard/', views.leaderboard, name='leaderboard'),
    path('game/stats/', views.user_stats, name='user_stats'),

    path('', views.game_view, name='game'),
]
