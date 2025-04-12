// Authentication service for handling user login, signup, and session management
import api from './api.js';

const authService = {
  // User registration
  async register(username, email, password) {
    try {
      const response = await api.post('/auth/signup', {
        username,
        email,
        password
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      return { success: false, error: response.error || 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  },
  
  // User login
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        
        // Fetch user data if not returned with the token
        if (!response.user) {
          const userData = await this.getCurrentUser();
          if (userData.success) {
            return { success: true, user: userData.user };
          }
        } else {
          localStorage.setItem('user', JSON.stringify(response.user));
          return { success: true, user: response.user };
        }
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please check your credentials.' };
    }
  },
  
  // Fetch current user data
  async getCurrentUser() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const userData = await api.get(`/users/${user.id}`);
        
        if (!userData.error) {
          localStorage.setItem('user', JSON.stringify(userData));
          return { success: true, user: userData };
        }
      } catch (error) {
        console.error('Get current user error:', error);
      }
    }
    return { success: false, error: 'User data not available' };
  },
  
  // User logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call the backend logout endpoint (optional since we're using JWTs)
    api.post('/auth/logout');
    
    return { success: true };
  },
  
  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },
  
  // Get current user data from localStorage
  getUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
};

export default authService;