/**
 * Authenticated API client with automatic session renewal.
 */

const getApiBaseUrl = () => {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return process.env.REACT_APP_API_URL || '/api';
};

const API_BASE_URL = getApiBaseUrl();
const AUTH_KEYS = [
  'accessToken', 'isAuthenticated', 'userEmail', 'userName', 'userPicture',
  'userData', 'authProvider', 'userRole', 'userType', 'isAdmin', 'courtType',
  'entityType', 'entityId',
];

let refreshPromise = null;

const buildUrl = (endpoint) => {
  const url = endpoint.startsWith('/api/')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  return url.replace(/([^:]\/)\/+/g, '$1');
};

export const getAuthToken = () => (
  localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
);

const dispatchAuthChange = () => {
  window.dispatchEvent(new CustomEvent('authStateChanged'));
};

export const clearAuthSession = ({ notify = true } = {}) => {
  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  if (notify) dispatchAuthChange();
};

const getRoleValue = (user) => user?.role?.value || user?.role;

export const saveAuthSession = (data, { provider = 'email' } = {}) => {
  const user = data?.user || {};
  const role = getRoleValue(user) || user.user_type || user.account_type;
  const userType = user.user_type;
  const isAdmin = user.is_admin === true
    || String(getRoleValue(user) || '').toLowerCase() === 'admin'
    || userType === 'administrator';

  localStorage.setItem('accessToken', data.access_token);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userEmail', user.email || '');
  localStorage.setItem('userName', user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : (user.email || '').split('@')[0]);
  localStorage.setItem('userData', JSON.stringify(user));
  localStorage.setItem('authProvider', provider);

  if (role) localStorage.setItem('userRole', String(role));
  else localStorage.removeItem('userRole');
  if (userType) localStorage.setItem('userType', userType);
  else localStorage.removeItem('userType');
  if (isAdmin) localStorage.setItem('isAdmin', 'true');
  else localStorage.removeItem('isAdmin');
  if (user.court_type) localStorage.setItem('courtType', user.court_type);
  if (user.entity_type) localStorage.setItem('entityType', user.entity_type);
  if (user.entity_id != null) localStorage.setItem('entityId', String(user.entity_id));
  dispatchAuthChange();
  return user;
};

const decodeJwtPayload = (token) => {
  try {
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(segment));
  } catch {
    return null;
  }
};

export const hasUsableAccessToken = (minimumLifetimeSeconds = 30) => {
  const token = getAuthToken();
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now() + minimumLifetimeSeconds * 1000;
};

export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(buildUrl('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        clearAuthSession();
        return null;
      }
      const data = await response.json();
      saveAuthSession(data, { provider: localStorage.getItem('authProvider') || 'email' });
      return data.access_token;
    } catch (error) {
      console.error('Session renewal failed:', error);
      clearAuthSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const ensureAuthenticated = async (minimumLifetimeSeconds = 30) => {
  if (hasUsableAccessToken(minimumLifetimeSeconds)) return true;
  return Boolean(await refreshAccessToken());
};

export const logoutSession = async () => {
  try {
    await fetch(buildUrl('/auth/logout'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  } catch (error) {
    console.error('Server logout failed:', error);
  } finally {
    clearAuthSession();
  }
};

export const getHeaders = (includeAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = includeAuth ? getAuthToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseResponse = async (response) => {
  if (response.headers.get('content-type')?.includes('application/json')) return response.json();
  return response.text();
};

export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET', body, includeAuth = true, headers: customHeaders, ...fetchOptions
  } = options;
  const config = {
    method,
    credentials: 'include',
    headers: { ...getHeaders(includeAuth), ...customHeaders },
    ...fetchOptions,
  };
  if (body !== undefined && body !== null) config.body = JSON.stringify(body);

  try {
    let response = await fetch(buildUrl(endpoint), config);
    if (response.status === 401 && includeAuth) {
      const renewedToken = await refreshAccessToken();
      if (renewedToken) {
        config.headers = { ...config.headers, Authorization: `Bearer ${renewedToken}` };
        response = await fetch(buildUrl(endpoint), config);
      }
    }
    return { response, data: await parseResponse(response) };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

const throwApiError = (response, data) => {
  let message = `Request failed with status ${response.status}`;
  if (data && typeof data === 'object') message = data.detail || data.message || message;
  else if (typeof data === 'string' && data) message = data;
  const error = new Error(message);
  error.response = response;
  error.data = data;
  error.detail = data?.detail || data?.message;
  error.status = response.status;
  throw error;
};

export const apiGet = async (endpoint, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') query.append(key, String(value));
  });
  const queryString = query.toString();
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = queryString ? `${endpoint}${separator}${queryString}` : endpoint;
  const { response, data } = await apiRequest(url, { method: 'GET' });
  if (!response.ok) throwApiError(response, data);
  return data;
};

export const apiPost = async (endpoint, body, options = {}) => {
  const { response, data } = await apiRequest(endpoint, { method: 'POST', body, ...options });
  if (!response.ok) throwApiError(response, data);
  return data;
};

export const apiPut = async (endpoint, body, options = {}) => {
  const { response, data } = await apiRequest(endpoint, { method: 'PUT', body, ...options });
  if (!response.ok) throwApiError(response, data);
  return data;
};

export const apiDelete = async (endpoint, options = {}) => {
  const { response, data } = await apiRequest(endpoint, { method: 'DELETE', ...options });
  if (!response.ok) throwApiError(response, data);
  return data;
};

export const apiPatch = async (endpoint, body, options = {}) => {
  const { response, data } = await apiRequest(endpoint, { method: 'PATCH', body, ...options });
  if (!response.ok) throwApiError(response, data);
  return data;
};

export const apiUpload = async (endpoint, formData) => {
  const request = async (token) => fetch(buildUrl(endpoint), {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  let response = await request(getAuthToken());
  if (response.status === 401) {
    const renewedToken = await refreshAccessToken();
    if (renewedToken) response = await request(renewedToken);
  }
  const data = await parseResponse(response);
  if (!response.ok) throwApiError(response, data);
  return data;
};

export const handleApiResponse = async (response) => {
  if (!response.ok) throwApiError(response, await parseResponse(response));
  return response;
};

export const authenticatedRequest = async (endpoint, options = {}) => {
  const { response, data } = await apiRequest(endpoint, options);
  if (!response.ok) throwApiError(response, data);
  return data;
};

const api = {
  apiRequest, apiGet, apiPost, apiPut, apiDelete, apiPatch, apiUpload, authenticatedRequest,
  clearAuthSession, ensureAuthenticated, getAuthToken, getHeaders, handleApiResponse,
  logoutSession, refreshAccessToken, saveAuthSession,
};

export default api;
