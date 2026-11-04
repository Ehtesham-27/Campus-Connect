import axios from 'axios';

const defaultBaseUrl = import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1';

/**
 * Centralized Axios client for Campus Connect API
 *
 * In production on Vercel, requests default to same-origin '/api/v1', which vercel.json
 * proxies directly to the Render backend, preserving HttpOnly first-party cookies.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error normalization
    const normalizedError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || [],
    };
    return Promise.reject(normalizedError);
  }
);

