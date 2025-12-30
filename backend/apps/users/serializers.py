from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ('email', 'full_name', 'password', 'confirm_password')
    
    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    def create(self, validated_data):
        """Create and return a new user"""
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile display"""
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'full_name', 'role', 'status',
            'profile_picture', 'profile_picture_url',
            'last_login', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'role', 'created_at', 'updated_at', 'last_login', 'profile_picture_url')
    
    def get_profile_picture_url(self, obj):
        """Return full URL for profile picture"""
        request = self.context.get('request')
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = User
        fields = ('full_name', 'email')
    
    def validate_email(self, value):
        """Validate email uniqueness excluding current user"""
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value


class ProfilePictureUploadSerializer(serializers.Serializer):
    """Serializer for profile picture upload with validation"""
    profile_picture = serializers.ImageField(
        required=True,
        allow_empty_file=False,
        use_url=True
    )
    
    def validate_profile_picture(self, value):
        """Validate profile picture"""
        from PIL import Image
        
        # Check file size (5MB max)
        max_size = 5 * 1024 * 1024  # 5MB in bytes
        if value.size > max_size:
            raise serializers.ValidationError(
                f"Image file too large. Max size is 5MB. Your file is {value.size / (1024*1024):.2f}MB"
            )
        
        # Check file extension
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file extension '{ext}'. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Validate image dimensions
        try:
            img = Image.open(value)
            width, height = img.size
            
            # Maximum dimensions
            max_dimension = 2048
            if width > max_dimension or height > max_dimension:
                raise serializers.ValidationError(
                    f"Image dimensions too large. Maximum {max_dimension}x{max_dimension}px. "
                    f"Your image is {width}x{height}px"
                )
            
            # Minimum dimensions
            min_dimension = 100
            if width < min_dimension or height < min_dimension:
                raise serializers.ValidationError(
                    f"Image too small. Minimum {min_dimension}x{min_dimension}px. "
                    f"Your image is {width}x{height}px"
                )
            
            # Validate image format
            if img.format not in ['JPEG', 'PNG', 'WEBP']:
                raise serializers.ValidationError("Invalid image format")
            
        except Exception as e:
            raise serializers.ValidationError(f"Invalid image file: {str(e)}")
        
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    
    def validate_old_password(self, value):
        """Validate old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer with additional user data and role"""
    
    @classmethod
    def get_token(cls, user):
        """Add custom claims to token"""
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['full_name'] = user.full_name
        token['role'] = user.role
        token['status'] = user.status
        
        return token
    
    def validate(self, attrs):
        """Validate credentials and check user status"""
        data = super().validate(attrs)
        
        # Check if user is active
        if self.user.status == 'INACTIVE':
            raise serializers.ValidationError('Account is deactivated.')
        
        # Get profile picture URL
        profile_picture_url = None
        if self.user.profile_picture:
            from django.contrib.sites.shortcuts import get_current_site
            request = self.context.get('request')
            if request:
                profile_picture_url = request.build_absolute_uri(self.user.profile_picture.url)
            else:
                profile_picture_url = self.user.profile_picture.url
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'status': self.user.status,
            'profile_picture_url': profile_picture_url,
        }
        
        return data
