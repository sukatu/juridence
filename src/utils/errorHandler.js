/**
 * Error handling utility functions
 */

/**
 * Show a success message to the user
 */
export const showSuccess = (message) => {
  // Try to use a toast system if available, otherwise use alert
  if (window.showToast) {
    window.showToast(message, 'success');
  } else {
    alert(message);
  }
};

/**
 * Show an error message to the user
 */
export const showError = (error, defaultMessage = 'An error occurred') => {
  let message = defaultMessage;
  
  if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.detail) {
    message = error.detail;
  } else if (error?.response?.data?.detail) {
    message = error.response.data.detail;
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  }
  
  // Try to use a toast system if available, otherwise use alert
  if (window.showToast) {
    window.showToast(message, 'error');
  } else {
    alert(message);
  }
  
  console.error('Error:', error);
};

/**
 * Handle API errors with proper messaging
 */
export const handleApiError = (error, operation = 'operation') => {
  let message = `Failed to ${operation}`;
  
  if (error?.status === 400) {
    message = error?.detail || error?.message || `Invalid data. Please check your input.`;
  } else if (error?.status === 401) {
    message = 'You are not authorized to perform this action. Please log in again.';
  } else if (error?.status === 403) {
    message = 'You do not have permission to perform this action.';
  } else if (error?.status === 404) {
    message = `The ${operation} was not found.`;
  } else if (error?.status === 409) {
    message = 'This record already exists or conflicts with existing data.';
  } else if (error?.status === 422) {
    message = error?.detail || 'Validation error. Please check your input.';
  } else if (error?.status === 500) {
    message = 'Server error. Please try again later.';
  } else if (error?.message) {
    message = error.message;
  } else if (error?.detail) {
    message = error.detail;
  }
  
  showError(error, message);
  return message;
};

/**
 * Validate required fields
 */
export const validateRequired = (data, fields, customMessages = {}) => {
  const errors = {};
  
  fields.forEach(field => {
    const value = data[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors[field] = customMessages[field] || `${field} is required`;
    }
  });
  
  return errors;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate date format
 */
export const validateDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must include at least one letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must include at least one number');
  }
  
  return errors;
};

/**
 * Confirm action with user
 */
export const confirmAction = (message, onConfirm, onCancel = () => {}) => {
  if (window.confirm(message)) {
    onConfirm();
  } else {
    onCancel();
  }
};

/**
 * Safe API call wrapper with error handling
 */
export const safeApiCall = async (apiFunction, successMessage, errorOperation, onSuccess) => {
  try {
    const result = await apiFunction();
    
    if (successMessage) {
      showSuccess(successMessage);
    }
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = handleApiError(error, errorOperation);
    return { success: false, error: errorMessage };
  }
};

export default {
  showSuccess,
  showError,
  handleApiError,
  validateRequired,
  validateEmail,
  validateDate,
  validatePassword,
  confirmAction,
  safeApiCall
};

