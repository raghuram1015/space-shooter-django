from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta
import uuid
import random
import math
from django.shortcuts import render

from .models import GameSession, Score, UserProfile
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    ScoreSerializer,
    GameSessionSerializer,
    UserProfileSerializer
)


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)
    return Response({
        'error': 'Registration failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({
            'error': 'Username and password required'
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })

    return Response({
        'error': 'Invalid credentials'
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'})
    except:
        return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    """Get current user info"""
    token, created = Token.objects.get_or_create(user=request.user)
    return Response({
        'user': UserSerializer(request.user).data,
        'token': token.key
    })


# Game Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_game(request):
    """Start a new game session"""
    difficulty = request.data.get('difficulty', 'easy')
    ship_type = request.data.get('ship', 'blue')

    # Generate unique session ID
    session_id = str(uuid.uuid4())

    # Create game session
    game_session = GameSession.objects.create(
        user=request.user,
        session_id=session_id,
        difficulty=difficulty,
        ship_type=ship_type
    )

    return Response({
        'game_id': session_id,
        'status': 'started',
        'difficulty': difficulty,
        'ship': ship_type
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_game(request):
    """End game session and save score"""
    game_id = request.data.get('game_id')
    score = request.data.get('score', 0)
    level = request.data.get('level', 1)

    try:
        # Find the game session
        game_session = GameSession.objects.get(
            session_id=game_id,
            user=request.user,
            is_active=True
        )

        # End the session
        game_session.ended_at = timezone.now()
        game_session.is_active = False
        game_session.save()

        # Save the score
        score_obj = Score.objects.create(
            user=request.user,
            game_session=game_session,
            score=score,
            level_reached=level,
            difficulty=game_session.difficulty,
            ship_type=game_session.ship_type
        )

        # Update user profile stats
        profile = request.user.userprofile
        profile.update_stats(score, game_session.ship_type)

        # Check if it's a high score (top 10)
        top_scores = Score.objects.all()[:10]
        is_high_score = len(top_scores) < 10 or score > top_scores.last().score

        return Response({
            'status': 'game_ended',
            'score': score,
            'is_high_score': is_high_score,
            'message': 'Score saved successfully'
        })

    except GameSession.DoesNotExist:
        # Still save the score even if session not found
        score_obj = Score.objects.create(
            user=request.user,
            score=score,
            level_reached=level,
            difficulty=request.data.get('difficulty', 'easy'),
            ship_type=request.data.get('ship', 'blue')
        )

        # Update user profile stats
        profile = request.user.userprofile
        profile.update_stats(score, request.data.get('ship', 'blue'))

        return Response({
            'status': 'score_saved',
            'score': score,
            'is_high_score': False
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    """Get leaderboard/high scores"""
    period = request.GET.get('period', 'all')
    limit = int(request.GET.get('limit', 10))

    # Filter by time period
    if period == 'week':
        start_date = timezone.now() - timedelta(days=7)
        scores = Score.objects.filter(created_at__gte=start_date)
    elif period == 'month':
        start_date = timezone.now() - timedelta(days=30)
        scores = Score.objects.filter(created_at__gte=start_date)
    else:  # all time
        scores = Score.objects.all()

    # Get top scores
    scores = scores.order_by('-score')[:limit]

    return Response({
        'scores': ScoreSerializer(scores, many=True).data,
        'period': period
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Get user statistics"""
    profile = request.user.userprofile
    recent_scores = Score.objects.filter(
        user=request.user).order_by('-created_at')[:5]

    return Response({
        'profile': UserProfileSerializer(profile).data,
        'recent_scores': ScoreSerializer(recent_scores, many=True).data
    })


# Game Logic Views (for server-side game state management)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_game_state(request):
    """Update game state (simplified version)"""
    game_id = request.data.get('game_id')
    input_data = request.data.get('input', {})
    delta_time = request.data.get('deltaTime', 16)

    try:
        game_session = GameSession.objects.get(
            session_id=game_id,
            user=request.user,
            is_active=True
        )

        # For this implementation, we'll return a simple response
        # In a full implementation, you would maintain game state on the server
        return Response({
            'status': 'updated',
            'game_id': game_id,
            'message': 'Game state updated'
        })

    except GameSession.DoesNotExist:
        return Response({
            'error': 'Game session not found'
        }, status=status.HTTP_404_NOT_FOUND)


def index(request):
    return render(request, 'game/index.html')


def game_view(request):
    return render(request, 'game/index.html')
