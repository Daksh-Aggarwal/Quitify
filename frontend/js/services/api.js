// Base API configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function for handling API errors
function handleApiError(error) {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return { error: error.response.data.message || 'Server error', status: error.response.status };
  } else if (error.request) {
    // The request was made but no response was received
    return { error: 'No response from server. Please check your connection.', status: 0 };
  } else {
    // Something happened in setting up the request that triggered an Error
    return { error: error.message || 'Unknown error occurred', status: -1 };
  }
}

// Fetch API wrapper with authentication
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Token expired or invalid
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if on protected page
        if (!window.location.pathname.includes('index.html')) {
          window.location.href = 'index.html';
        }
      }
      
      throw { 
        response: { 
          status: response.status, 
          data: data 
        } 
      };
    }
    
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

export default {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data) => apiRequest(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};