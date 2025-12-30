import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PasswordUpdateForm from '../components/PasswordUpdateForm';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { toast } from 'react-hot-toast';
import { userService } from '../services/userService';
import { validateEmail, validateRequired } from '../utils/validators';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });
  
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    const nameError = validateRequired(profileData.full_name, 'Full name');
    if (nameError) newErrors.full_name = nameError;
    
    const emailError = validateEmail(profileData.email);
    if (emailError) newErrors.email = emailError;
    
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setProfileLoading(true);
    
    try {
      const updatedUser = await userService.updateProfile(profileData);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData) {
        const newErrors = {};
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            newErrors[key] = errorData[key][0];
          } else {
            newErrors[key] = errorData[key];
          }
        });
        setProfileErrors(newErrors);
      }
      
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      full_name: user?.full_name || '',
      email: user?.email || '',
    });
    setProfileErrors({});
    setIsEditingProfile(false);
  };

  const handleProfilePictureUpload = async (file) => {
    try {
      const response = await userService.uploadProfilePicture(file);
      updateUser(response.user);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to upload profile picture');
    }
  };

  const handleProfilePictureDelete = async () => {
    try {
      const response = await userService.deleteProfilePicture();
      updateUser(response.user);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete profile picture');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Profile Picture */}
        <ProfilePictureUpload
          currentPictureUrl={user?.profile_picture_url}
          onUpload={handleProfilePictureUpload}
          onDelete={handleProfilePictureDelete}
        />

        {/* Profile Information */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            {!isEditingProfile && (
              <Button variant="primary" onClick={() => setIsEditingProfile(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          {!isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900">{user?.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user?.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.status}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="full_name"
                value={profileData.full_name}
                onChange={handleProfileChange}
                error={profileErrors.full_name}
                required
              />
              
              <Input
                label="Email"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                error={profileErrors.email}
                required
              />

              <div className="flex space-x-3">
                <Button type="submit" variant="primary" loading={profileLoading}>
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCancelEdit}
                  disabled={profileLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
            {!isChangingPassword && (
              <Button variant="primary" onClick={() => setIsChangingPassword(true)}>
                Change Password
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <PasswordUpdateForm
              onSuccess={() => setIsChangingPassword(false)}
              onCancel={() => setIsChangingPassword(false)}
            />
          ) : (
            <p className="text-gray-600">Click "Change Password" to update your password.</p>
          )}
        </div>
      </div>
    </div>
  );
}
