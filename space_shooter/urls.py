"""
URL configuration for space_shooter project.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('game.urls')),
    path('', TemplateView.as_view(template_name='game/index.html'), name='home'),
]
