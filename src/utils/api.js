/**
 * API utility functions for making authenticated requests
 */

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If we're in production (server), use relative URLs
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api'; // Use relative URLs for server deployment
  }
  // For local development, use localhost
  return process.env.REACT_APP_API_URL || '/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Get the stored access token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Get common headers for API requests
 */
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Make an authenticated API request
 */
export const apiRequest = async (endpoint, options = {}) => {
  // If endpoint already starts with /api/, don't add API_BASE_URL
  let url;
  if (endpoint.startsWith('/api/')) {
    url = endpoint;
  } else {
    // Ensure endpoint doesn't start with / if API_BASE_URL already ends with /
    url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }
  // Remove double slashes (except after http:// or https://)
  url = url.replace(/([^:]\/)\/+/g, '$1');
  
  const {
    method = 'GET',
    body,
    includeAuth = true,
    ...fetchOptions
  } = options;

  const config = {
    method,
    headers: getHeaders(includeAuth),
    ...fetchOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle redirects (3xx status codes) - fetch follows redirects automatically
    // but we need to check if the final response is ok
    if (!response.ok && response.status >= 500) {
      // Server error - try to get error details
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { detail: errorText || `Server error: ${response.status}` };
      }
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }
    
    // Handle different response types
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      return { response, data };
    } else {
      const text = await response.text();
      return { response, data: text };
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make a GET request
 */
export const apiGet = async (endpoint, params = {}) => {
  // Build URL with query parameters
  let url = endpoint;
  const queryParams = new URLSearchParams();
  
  // Add query parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, String(params[key]));
    }
  });
  
  const queryString = queryParams.toString();
  if (queryString) {
    // Check if endpoint already has query parameters
    const separator = url.includes('?') ? '&' : '?';
    url += separator + queryString;
  }
  
  const { response, data } = await apiRequest(url, { method: 'GET' });
  
  if (!response.ok) {
    // Try to extract error message from response
    let errorMessage = `Request failed with status ${response.status}`;
    if (data && typeof data === 'object') {
      errorMessage = data.detail || data.message || errorMessage;
    } else if (typeof data === 'string') {
      errorMessage = data;
    }
    
    const error = new Error(errorMessage);
    error.response = response;
    error.data = data;
    error.status = response.status;
    throw error;
  }
  
  return data;
};

/**
 * Make a POST request
 */
export const apiPost = async (endpoint, body, options = {}) => {
  const { response, data } = await apiRequest(endpoint, { method: 'POST', body, ...options });
  
  if (!response.ok) {
    // Try to extract error message from response
    let errorMessage = `Request failed with status ${response.status}`;
    if (data && typeof data === 'object') {
      errorMessage = data.detail || data.message || errorMessage;
    } else if (typeof data === 'string') {
      errorMessage = data;
    }
    
    // Handle authentication errors (401 only - 403 is permission denied, not auth failure)
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('accessToken');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Note: 403 errors are permission issues, not authentication issues
    // Don't redirect - let the calling code handle the error message
    
    const error = new Error(errorMessage);
    error.detail = data?.detail || data?.message;
    error.status = response.status;
    throw error;
  }
  
  return data;
};

/**
 * Make a PUT request
 */
export const apiPut = async (endpoint, body, options = {}) => {
  const { response, data } = await apiRequest(endpoint, { method: 'PUT', body, ...options });
  
  if (!response.ok) {
    // Try to extract error message from response
    let errorMessage = `Request failed with status ${response.status}`;
    if (data && typeof data === 'object') {
      errorMessage = data.detail || data.message || errorMessage;
    } else if (typeof data === 'string') {
      errorMessage = data;
    }
    
    // Handle authentication errors (401 only - 403 is permission denied, not auth failure)
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('accessToken');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Note: 403 errors are permission issues, not authentication issues
    // Don't redirect - let the calling code handle the error message
    
    const error = new Error(errorMessage);
    error.detail = data?.detail || data?.message;
    error.status = response.status;
    throw error;
  }
  
  return data;
};

/**
 * Make a DELETE request
 */
export const apiDelete = async (endpoint, options = {}) => {
  const { response, data } = await apiRequest(endpoint, { method: 'DELETE', ...options });
  
  if (!response.ok) {
    // Try to extract error message from response
    let errorMessage = `Request failed with status ${response.status}`;
    if (data && typeof data === 'object') {
      errorMessage = data.detail || data.message || errorMessage;
    } else if (typeof data === 'string') {
      errorMessage = data;
    }
    
    // Handle authentication errors (401 only - 403 is permission denied, not auth failure)
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('accessToken');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Note: 403 errors are permission issues, not authentication issues
    // Don't redirect - let the calling code handle the error message
    
    const error = new Error(errorMessage);
    error.detail = data?.detail || data?.message;
    error.status = response.status;
    throw error;
  }
  
  return data;
};

/**
 * Make a PATCH request
 */
export const apiPatch = async (endpoint, body, options = {}) => {
  const { response, data } = await apiRequest(endpoint, { method: 'PATCH', body, ...options });
  
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  
  return data;
};

/**
 * Handle API response and throw errors for non-2xx status codes
 */
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return response;
};

/**
 * Make an authenticated API request with error handling
 */
export const authenticatedRequest = async (endpoint, options = {}) => {
  const { response, data } = await apiRequest(endpoint, options);
  await handleApiResponse(response);
  return data;
};

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  handleApiResponse,
  authenticatedRequest,
  getAuthToken,
  getHeaders,
};
