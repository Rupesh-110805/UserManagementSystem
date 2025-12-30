import { useState, useEffect } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import { toast } from 'react-hot-toast';
import { userService } from '../services/userService';
import { validatePasswordUpdateForm, validatePasswordStrength } from '../utils/passwordValidation';
import { FiLock, FiAlertCircle } from 'react-icons/fi';

/**
 * Enhanced Password Update Component
 * Features:
 * - Real-time validation with visual feedback
 * - Password strength indicator
 * - Submit button enabled only when form is valid
 * - Comprehensive error handling
 */
export default function PasswordUpdateForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Real-time form validation
  useEffect(() => {
    const validation = validatePasswordUpdateForm(formData);
    setIsFormValid(validation.isValid);

    // Only show errors for touched fields
    const touchedErrors = {};
    Object.keys(validation.errors).forEach((key) => {
      if (touched[key]) {
        touchedErrors[key] = validation.errors[key];
      }
    });
    setErrors(touchedErrors);
  }, [formData, touched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmNewPassword: true,
    });

    // Final validation
    const validation = validatePasswordUpdateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to change password
      await userService.changePassword({
        old_password: formData.currentPassword,
        new_password: formData.newPassword,
      });

      toast.success('Password changed successfully!');
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setTouched({});
      setErrors({});

      // Call success callback
      if (onSuccess) onSuccess();

    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle API errors with specific cases
   */
  const handleApiError = (error) => {
    const errorData = error.response?.data;

    if (!error.response) {
      // Network error - DB connection failed
      toast.error('Unable to connect to server. Please check your connection and try again.');
      return;
    }

    if (error.response.status === 401) {
      // Current password is incorrect
      setErrors((prev) => ({
        ...prev,
        currentPassword: 'Current password is incorrect',
      }));
      toast.error('Current password is incorrect');
      return;
    }

    if (error.response.status === 400 && errorData) {
      // Validation errors from backend
      const backendErrors = {};
      Object.keys(errorData).forEach((key) => {
        // Map backend field names to frontend field names
        const fieldMap = {
          old_password: 'currentPassword',
          new_password: 'newPassword',
        };
        
        const frontendKey = fieldMap[key] || key;
        backendErrors[frontendKey] = Array.isArray(errorData[key])
          ? errorData[key][0]
          : errorData[key];
      });
      
      setErrors((prev) => ({ ...prev, ...backendErrors }));
      toast.error('Please correct the errors and try again');
      return;
    }

    if (error.response.status === 500) {
      // Server error
      toast.error('Server error. Please try again later.');
      return;
    }

    // Generic error
    toast.error('Failed to change password. Please try again.');
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setTouched({});
    setErrors({});
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Password Security Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use a unique password you don't use elsewhere</li>
            <li>Consider using a passphrase with random words</li>
            <li>Never share your password with anyone</li>
          </ul>
        </div>
      </div>

      {/* Current Password */}
      <Input
        label="Current Password"
        type="password"
        name="currentPassword"
        value={formData.currentPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.currentPassword}
        placeholder="Enter your current password"
        icon={<FiLock />}
        required
        disabled={isSubmitting}
      />

      {/* New Password */}
      <Input
        label="New Password"
        type="password"
        name="newPassword"
        value={formData.newPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.newPassword}
        placeholder="Enter your new password"
        icon={<FiLock />}
        required
        disabled={isSubmitting}
      />

      {/* Password Strength Indicator */}
      <PasswordStrengthIndicator
        password={formData.newPassword}
        showStrengthBar={true}
      />

      {/* Confirm New Password */}
      <Input
        label="Confirm New Password"
        type="password"
        name="confirmNewPassword"
        value={formData.confirmNewPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.confirmNewPassword}
        placeholder="Re-enter your new password"
        icon={<FiLock />}
        required
        disabled={isSubmitting}
      />

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
          className="flex-1"
        >
          Change Password
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
