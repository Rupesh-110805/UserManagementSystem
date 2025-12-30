from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin interface for User model"""
    
    list_display = ('email', 'full_name', 'role', 'status', 'is_active', 'created_at', 'last_login')
    list_filter = ('role', 'status', 'is_staff', 'is_active', 'created_at')
    search_fields = ('email', 'full_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name',)}),
        ('Permissions', {
            'fields': ('role', 'status', 'is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'role', 'status'),
        }),
    )
    
    actions = ['activate_users', 'deactivate_users']
    
    def activate_users(self, request, queryset):
        """Bulk activate users"""
        updated = queryset.update(status=User.Status.ACTIVE, is_active=True)
        self.message_user(request, f'{updated} user(s) successfully activated.')
    activate_users.short_description = "Activate selected users"
    
    def deactivate_users(self, request, queryset):
        """Bulk deactivate users"""
        # Filter out admin users
        non_admin_users = queryset.exclude(role=User.Role.ADMIN)
        updated = non_admin_users.update(status=User.Status.INACTIVE, is_active=False)
        self.message_user(request, f'{updated} user(s) successfully deactivated.')
    deactivate_users.short_description = "Deactivate selected users"
