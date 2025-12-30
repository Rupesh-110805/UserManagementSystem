import pytest
from django.urls import reverse
from apps.users.models import User


@pytest.mark.django_db
class TestAuthentication:
    """Tests for authentication endpoints"""
    
    def test_user_registration_success(self, api_client):
        """Test successful user registration"""
        url = reverse('register')
        data = {
            'email': 'newuser@example.com',
            'full_name': 'New User',
            'password': 'StrongPass123!@#',
            'confirm_password': 'StrongPass123!@#',
        }
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == 201
        assert 'tokens' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == data['email']
        assert User.objects.filter(email=data['email']).exists()
    
    def test_registration_password_mismatch(self, api_client):
        """Test registration fails with mismatched passwords"""
        url = reverse('register')
        data = {
            'email': 'newuser@example.com',
            'full_name': 'New User',
            'password': 'StrongPass123!@#',
            'confirm_password': 'DifferentPass123!@#',
        }
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == 400
        assert 'password' in response.data
    
    def test_registration_duplicate_email(self, api_client, create_user):
        """Test registration fails with duplicate email"""
        existing_user = create_user(email='existing@example.com')
        
        url = reverse('register')
        data = {
            'email': 'existing@example.com',
            'full_name': 'New User',
            'password': 'StrongPass123!@#',
            'confirm_password': 'StrongPass123!@#',
        }
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == 400
        assert 'email' in response.data
    
    def test_user_login_success(self, api_client, create_user):
        """Test successful login"""
        user = create_user(email='login@example.com', password='TestPass123!@#')
        
        url = reverse('login')
        data = {
            'email': 'login@example.com',
            'password': 'TestPass123!@#',
        }
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
    
    def test_login_invalid_credentials(self, api_client, create_user):
        """Test login fails with invalid credentials"""
        user = create_user(email='test@example.com')
        
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword123',
        }
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == 401
    
    def test_login_inactive_user(self, api_client, create_user):
        """Test login fails for inactive users"""
        user = create_user(
            email='inactive@example.com',
            status=User.Status.INACTIVE
        )
        
        url = reverse('login')
        data = {
            'email': 'inactive@example.com',
            'password': 'TestPass123!@#',
        }
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == 400
