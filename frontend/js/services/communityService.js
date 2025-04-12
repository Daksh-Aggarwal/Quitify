// Community service for managing posts, comments, and leaderboard
import api from './api.js';

const communityService = {
  // Get leaderboard data with caching for offline use
  async getLeaderboard() {
    try {
      const result = await api.get('/leaderboard');
      if (!result.error) {
        // Cache the data for offline use
        localStorage.setItem('communityLeaderboard', JSON.stringify(result));
        return { success: true, leaders: result };
      }
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communityLeaderboard');
      if (cachedData) {
        return { success: true, leaders: JSON.parse(cachedData), cached: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get leaderboard error:', error);
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communityLeaderboard');
      if (cachedData) {
        return { success: true, leaders: JSON.parse(cachedData), cached: true };
      }
      
      return { success: false, error: 'Failed to retrieve leaderboard data' };
    }
  },
  
  // Filter leaderboard by addiction type
  async filterLeaderboard(addictionType) {
    try {
      const result = await api.get(`/leaderboard?addiction=${addictionType}`);
      if (!result.error) {
        return { success: true, leaders: result };
      }
      
      // Fallback to local filtering if API filtering fails
      const cachedData = localStorage.getItem('communityLeaderboard');
      if (cachedData) {
        const allLeaders = JSON.parse(cachedData);
        const filtered = addictionType === 'all' ? 
          allLeaders : 
          allLeaders.filter(leader => leader.addictionType === addictionType);
        return { success: true, leaders: filtered, cached: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Filter leaderboard error:', error);
      
      // Fallback to local filtering
      const cachedData = localStorage.getItem('communityLeaderboard');
      if (cachedData) {
        const allLeaders = JSON.parse(cachedData);
        const filtered = addictionType === 'all' ? 
          allLeaders : 
          allLeaders.filter(leader => leader.addictionType === addictionType);
        return { success: true, leaders: filtered, cached: true };
      }
      
      return { success: false, error: 'Failed to filter leaderboard data' };
    }
  },
  
  // Get community posts with caching
  async getPosts(filters = {}) {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.habitCategory) queryParams.append('habitCategory', filters.habitCategory);
      if (filters.postType) queryParams.append('postType', filters.postType);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/posts?${queryString}` : '/posts';
      
      const result = await api.get(endpoint);
      if (!result.error) {
        // Cache the data for offline use
        localStorage.setItem('communityPosts', JSON.stringify(result));
        return { success: true, posts: result };
      }
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communityPosts');
      if (cachedData) {
        let posts = JSON.parse(cachedData);
        
        // Apply filters client-side if using cached data
        if (filters.habitCategory) {
          posts = posts.filter(post => post.habitCategory === filters.habitCategory);
        }
        if (filters.postType) {
          posts = posts.filter(post => post.postType === filters.postType);
        }
        
        return { success: true, posts, cached: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get posts error:', error);
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communityPosts');
      if (cachedData) {
        let posts = JSON.parse(cachedData);
        
        // Apply filters client-side if using cached data
        if (filters.habitCategory) {
          posts = posts.filter(post => post.habitCategory === filters.habitCategory);
        }
        if (filters.postType) {
          posts = posts.filter(post => post.postType === filters.postType);
        }
        
        return { success: true, posts, cached: true };
      }
      
      return { success: false, error: 'Failed to retrieve community posts' };
    }
  },
  
  // Create a new post with proper error handling
  async createPost(postData) {
    try {
      const result = await api.post('/posts', postData);
      if (!result.error) {
        // Update local cache with new post
        try {
          const cachedData = localStorage.getItem('communityPosts');
          if (cachedData) {
            const posts = JSON.parse(cachedData);
            posts.unshift(result); // Add new post to beginning
            localStorage.setItem('communityPosts', JSON.stringify(posts));
          }
        } catch (e) {
          console.error('Cache update error:', e);
        }
        
        return { success: true, post: result };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Create post error:', error);
      return { success: false, error: 'Failed to create post' };
    }
  },
  
  // Get community highlights for the home page
  async getCommunityHighlights() {
    try {
      const result = await api.get('/posts/highlights');
      if (!result.error) {
        // Cache the data for offline use
        localStorage.setItem('communityHighlights', JSON.stringify(result));
        return { success: true, highlights: result };
      }
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communityHighlights');
      if (cachedData) {
        return { success: true, highlights: JSON.parse(cachedData), cached: true };
      }
      
      // If there's no cached highlight data, try getting from cached posts
      const cachedPosts = localStorage.getItem('communityPosts');
      if (cachedPosts) {
        const posts = JSON.parse(cachedPosts);
        const highlights = posts.slice(0, 5); // Get top 5 posts as highlights
        return { success: true, highlights: highlights, cached: true };
      }
      
      return { success: false, error: 'Failed to retrieve community highlights' };
    }
  },
  
  // Get community leaders data
  async getCommunityLeaders() {
    try {
      const result = await api.get('/leaderboard/top');
      if (!result.error) {
        // Cache the data for offline use
        localStorage.setItem('communityLeaders', JSON.stringify(result));
        return { success: true, leaders: result };
      }
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communityLeaders');
      if (cachedData) {
        return { success: true, leaders: JSON.parse(cachedData), cached: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get community leaders error:', error);
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communityLeaders');
      if (cachedData) {
        return { success: true, leaders: JSON.parse(cachedData), cached: true };
      }
      
      return { success: false, error: 'Failed to retrieve community leaders' };
    }
  },
  
  // Get single post with comments
  async getPost(postId) {
    try {
      const result = await api.get(`/posts/${postId}`);
      if (!result.error) {
        return { success: true, post: result };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get post error:', error);
      return { success: false, error: 'Failed to retrieve post data' };
    }
  },
  
  // Add comment to a post
  async addComment(postId, content) {
    try {
      const result = await api.post(`/posts/${postId}/comments`, { content });
      if (!result.error) {
        return { success: true, comment: result };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Add comment error:', error);
      return { success: false, error: 'Failed to add comment' };
    }
  },
  
  // React to a post (support, helpful, insightful)
  async reactToPost(postId, reactionType) {
    try {
      const result = await api.post(`/posts/${postId}/react`, { reactionType });
      if (!result.error) {
        return { success: true, reactions: result.reactions };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('React to post error:', error);
      return { success: false, error: 'Failed to react to post' };
    }
  },
  
  // React to a comment
  async reactToComment(postId, commentId, reactionType) {
    try {
      const result = await api.post(`/posts/${postId}/comments/${commentId}/react`, { reactionType });
      if (!result.error) {
        return { success: true, reactions: result.reactions };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('React to comment error:', error);
      return { success: false, error: 'Failed to react to comment' };
    }
  },
  
  // Get support groups by habit category
  async getSupportGroups() {
    try {
      const result = await api.get('/posts/groups/support');
      if (!result.error) {
        // Cache the data for offline use
        localStorage.setItem('communitySupportGroups', JSON.stringify(result));
        return { success: true, groups: result };
      }
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communitySupportGroups');
      if (cachedData) {
        return { success: true, groups: JSON.parse(cachedData), cached: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get support groups error:', error);
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communitySupportGroups');
      if (cachedData) {
        return { success: true, groups: JSON.parse(cachedData), cached: true };
      }
      
      return { success: false, error: 'Failed to retrieve support groups' };
    }
  },
  
  // Get success stories
  async getSuccessStories(featured = false, limit = 10) {
    try {
      const queryParams = new URLSearchParams();
      if (featured) queryParams.append('featured', 'true');
      if (limit) queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const endpoint = `/posts/stories/success${queryString ? '?' + queryString : ''}`;
      
      const result = await api.get(endpoint);
      if (!result.error) {
        // Cache the data for offline use
        localStorage.setItem('communitySuccessStories', JSON.stringify(result));
        return { success: true, stories: result };
      }
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communitySuccessStories');
      if (cachedData) {
        let stories = JSON.parse(cachedData);
        
        // Filter for featured stories if requested
        if (featured) {
          stories = stories.filter(story => story.featuredSuccess);
        }
        
        // Limit the number of stories if requested
        if (limit) {
          stories = stories.slice(0, limit);
        }
        
        return { success: true, stories, cached: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Get success stories error:', error);
      
      // Fallback to cached data if available
      const cachedData = localStorage.getItem('communitySuccessStories');
      if (cachedData) {
        let stories = JSON.parse(cachedData);
        
        // Filter for featured stories if requested
        if (featured) {
          stories = stories.filter(story => story.featuredSuccess);
        }
        
        // Limit the number of stories if requested
        if (limit) {
          stories = stories.slice(0, limit);
        }
        
        return { success: true, stories, cached: true };
      }
      
      return { success: false, error: 'Failed to retrieve success stories' };
    }
  },
  
  // Feature a success story (admin/moderator only)
  async featureSuccessStory(postId) {
    try {
      const result = await api.post(`/posts/${postId}/feature`);
      if (!result.error) {
        return { success: true, featured: result.featured };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Feature story error:', error);
      return { success: false, error: 'Failed to feature success story' };
    }
  }
};

export default communityService;