import pytest
from rest_framework.test import APIClient
from apps.users.models import User


@pytest.fixture
def api_client():
    """Provide an API client for tests"""
    return APIClient()


@pytest.fixture
def user_data():
    """Provide sample user data"""
    return {
        'email': 'test@example.com',
        'full_name': 'Test User',
        'password': 'TestPass123!@#',
    }


@pytest.fixture
def create_user(db):
    """Factory fixture to create users"""
    def make_user(**kwargs):
        defaults = {
            'email': 'user@example.com',
            'full_name': 'Regular User',
            'password': 'TestPass123!@#',
        }
        defaults.update(kwargs)
        return User.objects.create_user(**defaults)
    return make_user


@pytest.fixture
def admin_user(create_user):
    """Create an admin user"""
    return create_user(
        email='admin@example.com',
        full_name='Admin User',
        role=User.Role.ADMIN
    )


@pytest.fixture
def regular_user(create_user):
    """Create a regular user"""
    return create_user()


@pytest.fixture
def authenticated_client(api_client, create_user):
    """Provide an authenticated API client"""
    user = create_user()
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.fixture
def admin_client(api_client, admin_user):
    """Provide an authenticated admin API client"""
    api_client.force_authenticate(user=admin_user)
    return api_client, admin_user
