"""
WSGI config for space_shooter project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'space_shooter.settings')

application = get_wsgi_application()
