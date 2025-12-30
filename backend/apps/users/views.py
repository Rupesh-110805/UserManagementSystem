from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Q, F
from django.db.models.functions import TruncDate, TruncMonth, ExtractWeekDay, ExtractHour
from django.utils import timezone
from datetime import timedelta
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    ProfilePictureUploadSerializer
)
from .permissions import IsAdminUser


class RegisterView(APIView):
    """API view for user registration"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with additional user data"""
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """API view for user logout"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Blacklist the refresh token"""
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Invalid token or token already blacklisted'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user operations"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve', 'activate', 'deactivate']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Admins see all users, regular users see only themselves"""
        if self.request.user.is_admin:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'user': UserSerializer(request.user).data,
            'message': 'Profile updated successfully'
        })
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Set new password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({
            'message': 'Password updated successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_profile_picture(self, request):
        """Upload profile picture for current user"""
        serializer = ProfilePictureUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Delete old profile picture if exists
        if request.user.profile_picture:
            request.user.delete_profile_picture()
        
        # Save new profile picture
        request.user.profile_picture = serializer.validated_data['profile_picture']
        request.user.save()
        
        # Return updated user data with profile picture URL
        user_serializer = UserSerializer(request.user, context={'request': request})
        
        return Response({
            'message': 'Profile picture uploaded successfully',
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['delete'])
    def delete_profile_picture(self, request):
        """Delete profile picture for current user"""
        if not request.user.profile_picture:
            return Response(
                {'error': 'No profile picture to delete'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the profile picture
        request.user.delete_profile_picture()
        request.user.profile_picture = None
        request.user.save()
        
        # Return updated user data
        user_serializer = UserSerializer(request.user, context={'request': request})
        
        return Response({
            'message': 'Profile picture deleted successfully',
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Admin: Activate a user"""
        user = self.get_object()
        user.status = User.Status.ACTIVE
        user.is_active = True
        user.save()
        
        return Response({
            'message': f'User {user.email} activated successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Admin: Deactivate a user"""
        user = self.get_object()
        
        # Prevent deactivating admin users
        if user.is_admin:
            return Response(
                {'error': 'Cannot deactivate admin users'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.status = User.Status.INACTIVE
        user.is_active = False
        user.save()
        
        return Response({
            'message': f'User {user.email} deactivated successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Admin: Get comprehensive user statistics"""
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        
        # Basic counts
        total_users = User.objects.count()
        active_users = User.objects.filter(status='ACTIVE').count()
        inactive_users = User.objects.filter(status='INACTIVE').count()
        admin_users = User.objects.filter(role='ADMIN').count()
        regular_users = User.objects.filter(role='USER').count()
        
        # Recent registrations (last 30 days)
        recent_registrations = User.objects.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        # Growth data (last 30 days, grouped by day)
        growth_data = list(
            User.objects.filter(created_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        
        # Monthly registrations (last 12 months)
        twelve_months_ago = now - timedelta(days=365)
        monthly_data = list(
            User.objects.filter(created_at__gte=twelve_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        
        # Day of week distribution
        day_of_week_data = list(
            User.objects.annotate(day_of_week=ExtractWeekDay('created_at'))
            .values('day_of_week')
            .annotate(count=Count('id'))
            .order_by('day_of_week')
        )
        
        # Account age distribution
        account_ages = []
        for user in User.objects.all():
            days_old = (now - user.created_at).days
            if days_old < 30:
                category = '0-30 days'
            elif days_old < 90:
                category = '30-90 days'
            elif days_old < 180:
                category = '90-180 days'
            elif days_old < 365:
                category = '180-365 days'
            else:
                category = '1+ years'
            account_ages.append(category)
        
        age_distribution = {}
        for age in account_ages:
            age_distribution[age] = age_distribution.get(age, 0) + 1
        
        # Email domain analysis
        email_domains = {}
        for user in User.objects.all():
            domain = user.email.split('@')[1] if '@' in user.email else 'unknown'
            email_domains[domain] = email_domains.get(domain, 0) + 1
        
        # Sort and get top 10 domains
        top_domains = sorted(email_domains.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Dormant accounts (no last_login or last login > 30 days ago)
        dormant_count = User.objects.filter(
            Q(last_login__isnull=True) | Q(last_login__lt=thirty_days_ago)
        ).count()
        
        # Recent users (last 10)
        recent_users = User.objects.order_by('-created_at')[:10]
        recent_users_data = UserSerializer(recent_users, many=True, context={'request': request}).data
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'admin_users': admin_users,
            'regular_users': regular_users,
            'recent_registrations': recent_registrations,
            'dormant_accounts': dormant_count,
            'growth_data': growth_data,
            'monthly_data': monthly_data,
            'day_of_week_data': day_of_week_data,
            'age_distribution': age_distribution,
            'email_domains': [{'domain': domain, 'count': count} for domain, count in top_domains],
            'recent_users': recent_users_data,
        }, status=status.HTTP_200_OK)
