import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s default — Gemini AI responses can take 15-30s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token + User Email for RBAC
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Attach auth token if exists
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Attach Clerk user email for backend RBAC (requireRole middleware)
      // Clerk stores the active session user data accessible via __clerk_db_jwt
      // We read it from sessionStorage that Clerk populates
      try {
        const clerkUserKey = Object.keys(sessionStorage).find(k => k.startsWith('__clerk'));
        if (clerkUserKey) {
          const clerkData = JSON.parse(sessionStorage.getItem(clerkUserKey) || '{}');
          const email = clerkData?.user?.primaryEmailAddress?.emailAddress;
          if (email && config.headers) {
            config.headers['x-user-email'] = email;
          }
        }
      } catch {
        // Silently ignore if Clerk session not available
      }

      // Fallback: also check for stored email
      const storedEmail = localStorage.getItem('user-email');
      if (storedEmail && config.headers && !config.headers['x-user-email']) {
        config.headers['x-user-email'] = storedEmail;
      }
    }
    // AI chat requests need a longer timeout — Gemini can take 15-30s
    if (config.url?.includes('/ai/')) {
      config.timeout = 90000;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format and catch API errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with non-2xx status
      const data = error.response.data as { message?: string; error?: string };
      errorMessage = data?.message || data?.error || errorMessage;
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No response from the server. Please check your connection.';
    } else {
      // Something went wrong setting up the request
      errorMessage = error.message;
    }
    
    // Log error in development environment
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]:', errorMessage, error);
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Helper to set user email for backend RBAC authorization.
 * Call this after Clerk user loads.
 */
export function setApiUserEmail(email: string | null | undefined) {
  if (typeof window === 'undefined') return;
  if (email) {
    localStorage.setItem('user-email', email);
  } else {
    localStorage.removeItem('user-email');
  }
}

export default apiClient;
