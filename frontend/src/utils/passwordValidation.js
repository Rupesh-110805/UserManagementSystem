/**
 * Centralized Password Validation Module
 * Used by both Sign-up and Password Update features
 */

// Password constraint patterns
export const PASSWORD_CONSTRAINTS = {
  minLength: {
    pattern: /.{8,}/,
    message: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  uppercase: {
    pattern: /[A-Z]/,
    message: 'One uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  lowercase: {
    pattern: /[a-z]/,
    message: 'One lowercase letter (a-z)',
    test: (password) => /[a-z]/.test(password),
  },
  number: {
    pattern: /[0-9]/,
    message: 'One number (0-9)',
    test: (password) => /[0-9]/.test(password),
  },
  special: {
    pattern: /[!@#$%^&*(),.?":{}|<>]/,
    message: 'One special character (!@#$%^&*)',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
};

/**
 * Validate a password against all constraints
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[], constraints: Object }
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      constraints: {},
    };
  }

  const constraints = {};
  const errors = [];

  Object.keys(PASSWORD_CONSTRAINTS).forEach((key) => {
    const constraint = PASSWORD_CONSTRAINTS[key];
    const passed = constraint.test(password);
    constraints[key] = passed;
    
    if (!passed) {
      errors.push(constraint.message);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    constraints,
  };
};

/**
 * Validate password match (for confirm password)
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string} - Error message or empty string
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

/**
 * Calculate password strength score (0-5)
 * @param {string} password - Password to score
 * @returns {Object} - { score: number, label: string, color: string }
 */
export const calculatePasswordStrength = (password) => {
  const { constraints } = validatePasswordStrength(password);
  const passedCount = Object.values(constraints).filter(Boolean).length;

  const strengthLevels = {
    0: { label: 'Very Weak', color: 'red' },
    1: { label: 'Weak', color: 'orange' },
    2: { label: 'Fair', color: 'yellow' },
    3: { label: 'Good', color: 'blue' },
    4: { label: 'Strong', color: 'green' },
    5: { label: 'Very Strong', color: 'green' },
  };

  return {
    score: passedCount,
    ...strengthLevels[passedCount],
  };
};

/**
 * Validate password update form
 * @param {Object} data - { currentPassword, newPassword, confirmNewPassword }
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validatePasswordUpdateForm = (data) => {
  const errors = {};

  // Current password check
  if (!data.currentPassword || !data.currentPassword.trim()) {
    errors.currentPassword = 'Current password is required';
  }

  // New password validation
  const newPasswordValidation = validatePasswordStrength(data.newPassword);
  if (!newPasswordValidation.isValid) {
    errors.newPassword = newPasswordValidation.errors[0]; // First error
  }

  // Same as current password check
  if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  // Confirm password match
  const matchError = validatePasswordMatch(data.newPassword, data.confirmNewPassword);
  if (matchError) {
    errors.confirmNewPassword = matchError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
