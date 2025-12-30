from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Only allow admin users to access this view"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow users to access their own data or admins to access any data"""
    
    def has_object_permission(self, request, view, obj):
        # Admin can access anything
        if request.user.role == 'ADMIN':
            return True
        # Users can only access their own data
        return obj == request.user
