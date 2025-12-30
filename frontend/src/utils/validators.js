import { validatePasswordStrength, validatePasswordMatch as validatePwdMatch } from './passwordValidation';

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!regex.test(email)) return 'Invalid email format';
  return '';
};

/**
 * Validate password using centralized validation
 * @deprecated Use validatePasswordStrength from passwordValidation.js for detailed validation
 */
export const validatePassword = (password) => {
  const validation = validatePasswordStrength(password);
  if (!validation.isValid) {
    return validation.errors[0]; // Return first error
  }
  return '';
};

export const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return '';
};

/**
 * Validate password match
 * @deprecated Use validatePasswordMatch from passwordValidation.js
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  return validatePwdMatch(password, confirmPassword);
};
