import axios from 'axios';

// Updated API URL for Render backend deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://caffeinated-thoughts-backend.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for refresh token cookies
  timeout: 30000, // 30 second timeout for all requests
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and payment errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Log API errors for debugging
    console.error('API Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    // If 401 and haven't retried yet, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle specific payment errors
    if (originalRequest?.url?.includes('/payments/')) {
      const paymentError = error.response?.data?.error;
      if (paymentError) {
        // Enhance payment error messages
        if (paymentError.message?.includes('Merchant does not exist')) {
          error.paymentError = 'Payment service is temporarily unavailable. Please try again later.';
        } else if (paymentError.message?.includes('Invalid phone number')) {
          error.paymentError = 'Please enter a valid Kenyan phone number registered with M-Pesa.';
        } else if (paymentError.message?.includes('Invalid amount')) {
          error.paymentError = 'Please enter a valid amount between KES 10 and KES 70,000.';
        } else {
          error.paymentError = paymentError.message || 'Payment request failed.';
        }
      }
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      error.timeoutError = 'Request timed out. Please check your connection and try again.';
    }
    
    // Handle network errors
    if (!error.response && error.request) {
      error.networkError = 'Network error. Please check your internet connection and try again.';
    }
    
    return Promise.reject(error);
  }
);

// Payment-specific API functions
export const paymentAPI = {
  // Test M-Pesa credentials
  testCredentials: () => apiClient.get('/payments/test-mpesa'),
  
  // Test phone number
  testPhone: (phone: string) => apiClient.post('/payments/test-phone', { phone }),
  
  // Run diagnostics
  diagnostics: (testPhone?: string) => apiClient.post('/payments/diagnostics', { testPhone }),
  
  // Initiate STK Push
  stkPush: (data: { phone: string; amount: number; postId?: string }) => 
    apiClient.post('/payments/stkpush', data),
  
  // Check payment status
  getStatus: (checkoutRequestId: string) => 
    apiClient.get(`/payments/${checkoutRequestId}/status`),
};

// Utility function to format phone numbers
export const formatPhoneNumber = (phone: string): string => {
  // Remove non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Convert 07... to 2547...
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  }
  
  return cleaned;
};

// Utility function to validate phone numbers
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  const formatted = formatPhoneNumber(phone);
  const phoneRegex = /^254[17]\d{8}$/;
  
  if (!formatted) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  if (formatted.length < 10) {
    return { isValid: false, error: 'Phone number is too short' };
  }
  
  if (formatted.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }
  
  if (!phoneRegex.test(formatted)) {
    return { isValid: false, error: 'Please enter a valid Kenyan phone number (e.g., 0712345678)' };
  }
  
  return { isValid: true };
};

// Utility function to validate amounts
export const validateAmount = (amount: number): { isValid: boolean; error?: string } => {
  if (amount < 10) {
    return { isValid: false, error: 'Minimum amount is KES 10' };
  }
  
  if (amount > 70000) {
    return { isValid: false, error: 'Maximum amount is KES 70,000' };
  }
  
  if (!Number.isInteger(amount)) {
    return { isValid: false, error: 'Amount must be a whole number' };
  }
  
  return { isValid: true };
};
