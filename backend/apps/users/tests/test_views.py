import pytest
from django.urls import reverse
from apps.users.models import User


@pytest.mark.django_db
class TestUserViews:
    """Tests for user management endpoints"""
    
    def test_get_current_user(self, authenticated_client):
        """Test getting current user profile"""
        client, user = authenticated_client
        url = reverse('user-me')
        
        response = client.get(url)
        
        assert response.status_code == 200
        assert response.data['email'] == user.email
        assert response.data['full_name'] == user.full_name
    
    def test_update_profile(self, authenticated_client):
        """Test updating user profile"""
        client, user = authenticated_client
        url = reverse('user-update-profile')
        
        data = {
            'full_name': 'Updated Name',
            'email': 'updated@example.com'
        }
        response = client.put(url, data, format='json')
        
        assert response.status_code == 200
        user.refresh_from_db()
        assert user.full_name == 'Updated Name'
        assert user.email == 'updated@example.com'
    
    def test_change_password_success(self, authenticated_client):
        """Test changing password successfully"""
        client, user = authenticated_client
        url = reverse('user-change-password')
        
        data = {
            'old_password': 'TestPass123!@#',
            'new_password': 'NewPass123!@#'
        }
        response = client.post(url, data, format='json')
        
        assert response.status_code == 200
        user.refresh_from_db()
        assert user.check_password('NewPass123!@#')
    
    def test_change_password_wrong_old_password(self, authenticated_client):
        """Test changing password with wrong old password"""
        client, user = authenticated_client
        url = reverse('user-change-password')
        
        data = {
            'old_password': 'WrongPassword123',
            'new_password': 'NewPass123!@#'
        }
        response = client.post(url, data, format='json')
        
        assert response.status_code == 400
        assert 'old_password' in response.data
    
    def test_list_users_as_admin(self, admin_client, create_user):
        """Test admin can list all users"""
        client, admin = admin_client
        # Create some users
        create_user(email='user1@example.com')
        create_user(email='user2@example.com')
        
        url = reverse('user-list')
        response = client.get(url)
        
        assert response.status_code == 200
        assert 'results' in response.data
        assert len(response.data['results']) >= 3  # admin + 2 users
    
    def test_list_users_as_regular_user(self, authenticated_client):
        """Test regular user cannot list all users"""
        client, user = authenticated_client
        url = reverse('user-list')
        
        response = client.get(url)
        
        # Regular users only see themselves
        assert response.status_code == 200
        assert len(response.data['results']) == 1
    
    def test_activate_user_as_admin(self, admin_client, create_user):
        """Test admin can activate inactive user"""
        client, admin = admin_client
        inactive_user = create_user(
            email='inactive@example.com',
            status=User.Status.INACTIVE,
            is_active=False
        )
        
        url = reverse('user-activate', kwargs={'pk': inactive_user.id})
        response = client.post(url)
        
        assert response.status_code == 200
        inactive_user.refresh_from_db()
        assert inactive_user.status == User.Status.ACTIVE
        assert inactive_user.is_active is True
    
    def test_deactivate_user_as_admin(self, admin_client, create_user):
        """Test admin can deactivate active user"""
        client, admin = admin_client
        active_user = create_user(email='active@example.com')
        
        url = reverse('user-deactivate', kwargs={'pk': active_user.id})
        response = client.post(url)
        
        assert response.status_code == 200
        active_user.refresh_from_db()
        assert active_user.status == User.Status.INACTIVE
        assert active_user.is_active is False
    
    def test_cannot_deactivate_admin(self, admin_client, create_user):
        """Test cannot deactivate admin users"""
        client, admin = admin_client
        another_admin = create_user(
            email='admin2@example.com',
            role=User.Role.ADMIN
        )
        
        url = reverse('user-deactivate', kwargs={'pk': another_admin.id})
        response = client.post(url)
        
        assert response.status_code == 400
        another_admin.refresh_from_db()
        assert another_admin.status == User.Status.ACTIVE
    
    def test_regular_user_cannot_activate(self, authenticated_client, create_user):
        """Test regular user cannot activate other users"""
        client, user = authenticated_client
        inactive_user = create_user(
            email='inactive@example.com',
            status=User.Status.INACTIVE
        )
        
        url = reverse('user-activate', kwargs={'pk': inactive_user.id})
        response = client.post(url)
        
        assert response.status_code == 403
