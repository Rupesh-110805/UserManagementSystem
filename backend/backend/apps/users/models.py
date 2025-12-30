from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from PIL import Image
import os
from .managers import UserManager


def user_profile_picture_path(instance, filename):
    '''Generate upload path for profile pictures'''
    ext = filename.split('.')[-1]
    filename = f'user_{instance.id}_profile.{ext}'
    return os.path.join('profile_pictures', filename)


class User(AbstractBaseUser, PermissionsMixin):
    '''Custom User model with email as username field'''
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        USER = 'USER', 'User'
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'
    
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    
    # Profile picture field
    profile_picture = models.ImageField(
        upload_to=user_profile_picture_path,
        blank=True,
        null=True,
        help_text='Profile picture (max 5MB, 400x400px recommended)'
    )
    
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Required fields for Django admin
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email
    
    @property
    def is_admin(self):
        '''Check if user has admin role'''
        return self.role == self.Role.ADMIN
    
    def save(self, *args, **kwargs):
        '''Optimize profile picture on save'''
        super().save(*args, **kwargs)
        
        if self.profile_picture:
            try:
                img_path = self.profile_picture.path
                img = Image.open(img_path)
                
                # Convert RGBA to RGB (PNG to JPEG)
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'RGBA':
                        background.paste(img, mask=img.split()[-1])
                    else:
                        background.paste(img)
                    img = background
                
                # Resize if larger than 400x400
                max_size = (400, 400)
                if img.height > max_size[0] or img.width > max_size[1]:
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(img_path, 'JPEG', quality=85, optimize=True, progressive=True)
            except Exception as e:
                print(f'Error optimizing profile picture: {e}')
    
    def delete_profile_picture(self):
        '''Delete profile picture file from storage'''
        if self.profile_picture:
            if os.path.isfile(self.profile_picture.path):
                os.remove(self.profile_picture.path)
            self.profile_picture = None
            self.save()
