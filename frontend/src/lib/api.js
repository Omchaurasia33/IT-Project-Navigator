// src/lib/api.js

/**
 * Generic fetch helper that automatically adds Authorization header (if token exists)
 * and redirects to login on 401.
 */
const API_URL = 'http://localhost:3000';

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${url}`, { ...options, headers });
  
  if (res.status === 401) {
    // Invalid/expired token -> clear and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try {
      const data = await res.json().catch(() => null);
      const message = data?.message || 'Unauthorized';
      // redirect then throw
      window.location.assign('/login');
      throw new Error(message);
    } catch (e) {
      window.location.assign('/login');
      throw e;
    }
  }

  if (res.status === 403) {
    const data = await res.clone().json().catch(() => null);
    if (data?.subscriptionStatus === 'inactive') {
      window.location.assign('/billing?reason=inactive');
      throw new Error(data.message || 'Subscription inactive');
    }
  }
  
  return res;
}