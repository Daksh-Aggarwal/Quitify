// Addiction tracking service for managing recovery goals and progress
import api from './api.js';

const addictionService = {
  // Save user addiction recovery goal
  async saveGoal(goalData) {
    try {
      const result = await api.post('/users/goals', goalData);
      
      if (!result.error) {
        // Also store locally for offline access
        localStorage.setItem('addictionGoal', JSON.stringify(goalData));
        return { success: true, goal: result };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Save goal error:', error);
      // Fallback to localStorage if API fails
      localStorage.setItem('addictionGoal', JSON.stringify(goalData));
      return { success: false, error: 'Failed to save goal to server, saved locally.' };
    }
  },
  
  // Get user's saved goal
  async getGoal() {
    try {
      const result = await api.get('/users/goals');
      
      if (!result.error) {
        localStorage.setItem('addictionGoal', JSON.stringify(result));
        return { success: true, goal: result };
      }
      
      // Fallback to locally stored goal
      const localGoal = localStorage.getItem('addictionGoal');
      if (localGoal) {
        return { success: true, goal: JSON.parse(localGoal), source: 'local' };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get goal error:', error);
      // Fallback to localStorage
      const localGoal = localStorage.getItem('addictionGoal');
      if (localGoal) {
        return { success: true, goal: JSON.parse(localGoal), source: 'local' };
      }
      return { success: false, error: 'Failed to retrieve goal data' };
    }
  },
  
  // Update user's goal
  async updateGoal(goalData) {
    try {
      const result = await api.put('/users/goals', goalData);
      
      if (!result.error) {
        localStorage.setItem('addictionGoal', JSON.stringify(goalData));
        return { success: true, goal: result };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Update goal error:', error);
      // Fallback to localStorage
      localStorage.setItem('addictionGoal', JSON.stringify(goalData));
      return { success: false, error: 'Failed to update goal on server, updated locally.' };
    }
  },
  
  // Save a daily check-in
  async saveCheckIn(checkInData) {
    try {
      const result = await api.post('/users/checkins', checkInData);
      
      if (!result.error) {
        // Update local storage as well
        let checkIns = JSON.parse(localStorage.getItem('addictionCheckIns') || '[]');
        checkIns.unshift(checkInData); // Add to beginning
        localStorage.setItem('addictionCheckIns', JSON.stringify(checkIns));
        
        return { success: true, checkIn: result };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Save check-in error:', error);
      // Fallback to localStorage
      let checkIns = JSON.parse(localStorage.getItem('addictionCheckIns') || '[]');
      checkIns.unshift(checkInData);
      localStorage.setItem('addictionCheckIns', JSON.stringify(checkIns));
      
      return { success: false, error: 'Failed to save check-in to server, saved locally.' };
    }
  },
  
  // Get user's check-ins
  async getCheckIns() {
    try {
      const result = await api.get('/users/checkins');
      
      if (!result.error) {
        // Update local storage
        localStorage.setItem('addictionCheckIns', JSON.stringify(result));
        return { success: true, checkIns: result };
      }
      
      // Fallback to locally stored check-ins
      const localCheckIns = localStorage.getItem('addictionCheckIns');
      if (localCheckIns) {
        return { success: true, checkIns: JSON.parse(localCheckIns), source: 'local' };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get check-ins error:', error);
      // Fallback to localStorage
      const localCheckIns = localStorage.getItem('addictionCheckIns');
      if (localCheckIns) {
        return { success: true, checkIns: JSON.parse(localCheckIns), source: 'local' };
      }
      return { success: false, error: 'Failed to retrieve check-in data' };
    }
  }
};

export default addictionService;