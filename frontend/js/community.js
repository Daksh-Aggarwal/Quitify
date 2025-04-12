// Community page functionality
import communityService from './services/communityService.js';
import authService from './services/authService.js';

// DOM elements
const createPostBtn = document.querySelector('.create-post-btn');
const postCreation = document.getElementById('postCreation');
const postForm = document.querySelector('.post-form');
const postBtn = document.querySelector('.post-btn');
const cancelBtn = document.querySelector('.cancel-btn');
const postInput = document.querySelector('.post-input');
const postTitleInput = document.querySelector('.post-title-input');
const habitSelect = document.querySelector('.habit-select');
const postTypeRadios = document.querySelectorAll('input[name="postType"]');
const milestoneContainer = document.querySelector('.milestone-container');
const milestoneInput = document.querySelector('.milestone-input');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const filterBtns = document.querySelectorAll('.filter-btn');

const threadsContainer = document.querySelector('.threads-container');
const supportGroupsContainer = document.querySelector('.support-groups-container');
const featuredStoriesContainer = document.querySelector('.featured-stories-container');
const allStoriesContainer = document.querySelector('.all-stories-container');

const postTemplate = document.getElementById('post-template');
const commentTemplate = document.getElementById('comment-template');
const supportGroupTemplate = document.getElementById('support-group-template');

let currentUser = null;
let currentTab = 'all-posts';
let currentFilter = 'recent';

// Initialize the community page
async function initCommunity() {
  // Get the current user
  const userResponse = await authService.getCurrentUser();
  if (userResponse.success) {
    currentUser = userResponse.user;
    document.querySelector('.username').textContent = currentUser.username;
    document.querySelector('.auth-nav').style.display = 'none';
    document.querySelector('.user-nav').style.display = 'flex';
  }

  // Load initial content based on the active tab
  loadTabContent(currentTab);

  // Set up event listeners
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  // Create post button
  createPostBtn.addEventListener('click', () => {
    postCreation.style.display = 'block';
    postInput.focus();
  });

  // Cancel post creation
  cancelBtn.addEventListener('click', () => {
    postCreation.style.display = 'none';
    resetPostForm();
  });

  // Post button
  postBtn.addEventListener('click', createPost);

  // Tab navigation
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      setActiveTab(tab);
    });
  });

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      setActiveFilter(filter);
    });
  });

  // Post type selection
  postTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      // Show milestone input only when post type is 'success_story'
      if (radio.value === 'success_story') {
        milestoneContainer.style.display = 'block';
      } else {
        milestoneContainer.style.display = 'none';
      }
    });
  });
}

// Set the active tab and load its content
function setActiveTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Update tab panels
  tabPanels.forEach(panel => {
    if (panel.id === `${tab}-panel`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
  
  // Load content for the active tab
  loadTabContent(tab);
}

// Set the active filter and reload posts
function setActiveFilter(filter) {
  currentFilter = filter;
  
  // Update filter buttons
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  // Reload posts with the new filter
  if (currentTab === 'all-posts') {
    loadPosts();
  }
}

// Load content based on the active tab
async function loadTabContent(tab) {
  switch (tab) {
    case 'all-posts':
      await loadPosts();
      break;
    case 'support-groups':
      await loadSupportGroups();
      break;
    case 'success-stories':
      await loadSuccessStories();
      break;
  }
}

// Load posts
async function loadPosts() {
  // Show loading state
  threadsContainer.innerHTML = '<p class="loading">Loading posts...</p>';
  
  // Determine filters based on current filter selection
  let filters = {};
  if (currentFilter === 'support-needed') {
    filters.postType = 'question';
  }
  
  // Get posts from service
  const response = await communityService.getPosts(filters);
  
  if (response.success) {
    // Clear loading state
    threadsContainer.innerHTML = '';
    
    let posts = response.posts;
    
    // Apply client-side filtering based on the selected filter
    if (currentFilter === 'popular') {
      // Sort by total reactions (support + helpful + insightful)
      posts = posts.sort((a, b) => {
        const aTotalReactions = (a.reactions.support + a.reactions.helpful + a.reactions.insightful);
        const bTotalReactions = (b.reactions.support + b.reactions.helpful + b.reactions.insightful);
        return bTotalReactions - aTotalReactions;
      });
    }
    
    // Render each post
    if (posts.length === 0) {
      threadsContainer.innerHTML = '<p class="no-content">No posts yet. Be the first to share!</p>';
    } else {
      posts.forEach(post => {
        const postElement = createPostElement(post);
        threadsContainer.appendChild(postElement);
      });
    }
  } else {
    threadsContainer.innerHTML = '<p class="error">Failed to load posts. Please try again later.</p>';
  }
}

// Load support groups
async function loadSupportGroups() {
  // Show loading state
  supportGroupsContainer.innerHTML = '<p class="loading">Loading support groups...</p>';
  
  // Get support groups from service
  const response = await communityService.getSupportGroups();
  
  if (response.success) {
    // Clear loading state
    supportGroupsContainer.innerHTML = '';
    
    const groups = response.groups;
    
    // Render each support group
    if (groups.length === 0) {
      supportGroupsContainer.innerHTML = '<p class="no-content">No support groups yet. Create a post with a habit category to start one!</p>';
    } else {
      groups.forEach(group => {
        const groupElement = createSupportGroupElement(group);
        supportGroupsContainer.appendChild(groupElement);
      });
    }
  } else {
    supportGroupsContainer.innerHTML = '<p class="error">Failed to load support groups. Please try again later.</p>';
  }
}

// Load success stories
async function loadSuccessStories() {
  // Show loading state
  featuredStoriesContainer.innerHTML = '<p class="loading">Loading featured stories...</p>';
  allStoriesContainer.innerHTML = '<p class="loading">Loading success stories...</p>';
  
  // Get featured success stories
  const featuredResponse = await communityService.getSuccessStories(true, 3);
  
  if (featuredResponse.success) {
    // Clear loading state
    featuredStoriesContainer.innerHTML = '';
    
    const featuredStories = featuredResponse.stories;
    
    // Render featured stories
    if (featuredStories.length === 0) {
      featuredStoriesContainer.innerHTML = '<p class="no-content">No featured stories yet.</p>';
    } else {
      featuredStories.forEach(story => {
        const storyElement = createPostElement(story);
        storyElement.classList.add('featured-story');
        featuredStoriesContainer.appendChild(storyElement);
      });
    }
  } else {
    featuredStoriesContainer.innerHTML = '<p class="error">Failed to load featured stories.</p>';
  }
  
  // Get all success stories
  const allStoriesResponse = await communityService.getSuccessStories(false);
  
  if (allStoriesResponse.success) {
    // Clear loading state
    allStoriesContainer.innerHTML = '';
    
    const allStories = allStoriesResponse.stories;
    
    // Render all success stories
    if (allStories.length === 0) {
      allStoriesContainer.innerHTML = '<p class="no-content">No success stories yet. Share yours!</p>';
    } else {
      allStories.forEach(story => {
        const storyElement = createPostElement(story);
        allStoriesContainer.appendChild(storyElement);
      });
    }
  } else {
    allStoriesContainer.innerHTML = '<p class="error">Failed to load success stories.</p>';
  }
}

// Create a new post
async function createPost() {
  const content = postInput.value.trim();
  const title = postTitleInput.value.trim();
  const habitCategory = habitSelect.value;
  const postType = document.querySelector('input[name="postType"]:checked').value;
  const milestoneAchieved = milestoneInput.value.trim();
  
  if (!content) {
    alert('Please enter some content for your post.');
    return;
  }
  
  // Create post data object
  const postData = {
    content,
    title: title || null,
    postType,
    habitCategory: habitCategory || null,
    milestoneAchieved: postType === 'success_story' ? milestoneAchieved : null
  };
  
  // Send post to server
  const response = await communityService.createPost(postData);
  
  if (response.success) {
    // Hide post creation form and reset it
    postCreation.style.display = 'none';
    resetPostForm();
    
    // If we're on the all posts tab, prepend the new post
    if (currentTab === 'all-posts') {
      const postElement = createPostElement(response.post);
      threadsContainer.prepend(postElement);
    } 
    // If we're on success stories tab and this is a success story, add it there
    else if (currentTab === 'success-stories' && postType === 'success_story') {
      const postElement = createPostElement(response.post);
      allStoriesContainer.prepend(postElement);
    }
    // If we're on the support groups tab and this has a habit category, reload
    else if (currentTab === 'support-groups' && habitCategory) {
      loadSupportGroups();
    }
  } else {
    alert('Failed to create post. Please try again.');
  }
}

// Reset the post creation form
function resetPostForm() {
  postInput.value = '';
  postTitleInput.value = '';
  habitSelect.selectedIndex = 0;
  document.querySelector('input[name="postType"][value="general"]').checked = true;
  milestoneContainer.style.display = 'none';
  milestoneInput.value = '';
}

// Create a post element from post data
function createPostElement(post) {
  // Clone the post template
  const postElement = document.importNode(postTemplate.content, true).querySelector('.thread');
  
  // Set post data
  postElement.dataset.postId = post._id;
  
  const avatar = postElement.querySelector('.avatar');
  avatar.src = post.authorId.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId._id}`;
  
  const authorName = postElement.querySelector('.author-name');
  authorName.textContent = post.authorId.username;
  
  const postTime = postElement.querySelector('.post-time');
  postTime.textContent = formatDate(post.createdAt);
  
  // Add title if present
  const titleElement = postElement.querySelector('.thread-title');
  if (post.title) {
    titleElement.textContent = post.title;
    titleElement.style.display = 'block';
  } else {
    titleElement.style.display = 'none';
  }
  
  const postContent = postElement.querySelector('.post-content');
  postContent.textContent = post.content;
  
  // Add post type badge
  const postTypeBadge = postElement.querySelector('.post-type-badge');
  if (post.postType && post.postType !== 'general') {
    let badgeText = '';
    let badgeClass = '';
    
    switch (post.postType) {
      case 'experience':
        badgeText = 'Experience';
        badgeClass = 'badge-experience';
        break;
      case 'success_story':
        badgeText = 'Success Story';
        badgeClass = 'badge-success';
        break;
      case 'question':
        badgeText = 'Support Needed';
        badgeClass = 'badge-question';
        break;
    }
    
    postTypeBadge.textContent = badgeText;
    postTypeBadge.classList.add(badgeClass);
    postTypeBadge.style.display = 'inline-block';
  } else {
    postTypeBadge.style.display = 'none';
  }
  
  // Add habit category badge
  const habitBadge = postElement.querySelector('.habit-category-badge');
  if (post.habitCategory) {
    habitBadge.textContent = capitalizeFirstLetter(post.habitCategory.replace('_', ' '));
    habitBadge.style.display = 'inline-block';
  } else {
    habitBadge.style.display = 'none';
  }
  
  // Display milestone achievement if present
  const milestoneElement = postElement.querySelector('.milestone-achievement');
  if (post.milestoneAchieved) {
    milestoneElement.textContent = `🎉 Milestone: ${post.milestoneAchieved}`;
    milestoneElement.style.display = 'block';
  } else {
    milestoneElement.style.display = 'none';
  }
  
  // Set reaction counts
  postElement.querySelector('.support-count').textContent = post.reactions.support || 0;
  postElement.querySelector('.helpful-count').textContent = post.reactions.helpful || 0;
  postElement.querySelector('.insightful-count').textContent = post.reactions.insightful || 0;
  
  // Set comment count
  postElement.querySelector('.comment-count').textContent = post.comments ? post.comments.length : 0;
  
  // Add comments if they exist
  const commentsSection = postElement.querySelector('.comments-section');
  if (post.comments && post.comments.length > 0) {
    post.comments.forEach(comment => {
      const commentElement = createCommentElement(comment, post._id);
      commentsSection.appendChild(commentElement);
    });
  }
  
  // Set up event listeners for post actions
  setupPostEventListeners(postElement, post._id);
  
  return postElement;
}

// Create a comment element from comment data
function createCommentElement(comment, postId) {
  // Clone the comment template
  const commentElement = document.importNode(commentTemplate.content, true).querySelector('.comment');
  
  // Set comment data
  commentElement.dataset.commentId = comment._id;
  commentElement.dataset.postId = postId;
  
  const avatar = commentElement.querySelector('.avatar-small');
  avatar.src = comment.authorId.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId._id}`;
  
  const commentAuthor = commentElement.querySelector('.comment-author');
  commentAuthor.textContent = comment.authorId.username;
  
  const commentText = commentElement.querySelector('.comment-text');
  commentText.textContent = comment.content;
  
  // Set reaction counts
  commentElement.querySelector('.comment-support-count').textContent = comment.reactions.support || 0;
  commentElement.querySelector('.comment-helpful-count').textContent = comment.reactions.helpful || 0;
  commentElement.querySelector('.comment-insightful-count').textContent = comment.reactions.insightful || 0;
  
  // Set up event listeners for comment reactions
  setupCommentEventListeners(commentElement, postId, comment._id);
  
  return commentElement;
}

// Create a support group element
function createSupportGroupElement(group) {
  // Clone the support group template
  const groupElement = document.importNode(supportGroupTemplate.content, true).querySelector('.support-group');
  
  // Set group data
  groupElement.dataset.habitCategory = group.habitCategory;
  
  const groupName = groupElement.querySelector('.group-name');
  groupName.textContent = capitalizeFirstLetter(group.habitCategory.replace('_', ' '));
  
  const postCount = groupElement.querySelector('.post-count');
  postCount.textContent = group.postCount;
  
  // Set random member count for demo purposes
  const memberCount = groupElement.querySelector('.member-count');
  memberCount.textContent = Math.floor(Math.random() * 100) + group.postCount;
  
  // Add preview of most recent post if available
  const recentPostContainer = groupElement.querySelector('.recent-post');
  if (group.latestPost) {
    recentPostContainer.innerHTML = `
      <div class="preview-post">
        <img src="${group.latestPost.authorId.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${group.latestPost.authorId._id}`}" class="avatar-small">
        <div class="preview-content">
          <strong>${group.latestPost.authorId.username}</strong> 
          <p>${truncateText(group.latestPost.content, 100)}</p>
          <span class="preview-time">${formatDate(group.latestPost.createdAt)}</span>
        </div>
      </div>
    `;
  } else {
    recentPostContainer.innerHTML = '<p class="no-posts">No posts in this group yet.</p>';
  }
  
  // Set up event listeners for the support group
  const joinBtn = groupElement.querySelector('.join-group-btn');
  joinBtn.addEventListener('click', () => {
    // Filter the posts by this habit category
    setActiveTab('all-posts');
    communityService.getPosts({ habitCategory: group.habitCategory })
      .then(response => {
        if (response.success) {
          threadsContainer.innerHTML = '';
          if (response.posts.length === 0) {
            threadsContainer.innerHTML = '<p class="no-content">No posts in this group yet. Be the first to share!</p>';
          } else {
            response.posts.forEach(post => {
              const postElement = createPostElement(post);
              threadsContainer.appendChild(postElement);
            });
          }
        }
      });
  });
  
  return groupElement;
}

// Set up event listeners for post actions
function setupPostEventListeners(postElement, postId) {
  // Reaction buttons
  const reactionBtns = postElement.querySelectorAll('.thread-actions .action-btn[data-reaction]');
  reactionBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const reactionType = btn.dataset.reaction;
      const response = await communityService.reactToPost(postId, reactionType);
      if (response.success) {
        // Update reaction counts
        postElement.querySelector(`.${reactionType}-count`).textContent = response.reactions[reactionType];
        
        // Toggle active class
        btn.classList.toggle('active');
      }
    });
  });
  
  // Comment button
  const commentBtn = postElement.querySelector('.comment-btn');
  commentBtn.addEventListener('click', () => {
    // Show/hide comments section
    const commentsSection = postElement.querySelector('.comments-section');
    const addComment = postElement.querySelector('.add-comment');
    
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
    addComment.style.display = addComment.style.display === 'none' ? 'flex' : 'none';
    
    // Focus comment input if showing
    if (addComment.style.display === 'flex') {
      addComment.querySelector('.comment-input').focus();
    }
  });
  
  // Add comment
  const sendCommentBtn = postElement.querySelector('.send-btn');
  const commentInput = postElement.querySelector('.comment-input');
  
  sendCommentBtn.addEventListener('click', async () => {
    const content = commentInput.value.trim();
    if (!content) return;
    
    const response = await communityService.addComment(postId, content);
    if (response.success) {
      // Create and add the new comment
      const commentElement = createCommentElement(response.comment, postId);
      postElement.querySelector('.comments-section').appendChild(commentElement);
      
      // Update comment count
      const commentCount = postElement.querySelector('.comment-count');
      commentCount.textContent = parseInt(commentCount.textContent) + 1;
      
      // Clear comment input
      commentInput.value = '';
    }
  });
  
  // Allow enter key to submit comment
  commentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCommentBtn.click();
    }
  });
}

// Set up event listeners for comment reactions
function setupCommentEventListeners(commentElement, postId, commentId) {
  // Reaction buttons
  const reactionBtns = commentElement.querySelectorAll('.comment-reaction-btn');
  reactionBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const reactionType = btn.dataset.reaction;
      const response = await communityService.reactToComment(postId, commentId, reactionType);
      if (response.success) {
        // Update reaction counts
        commentElement.querySelector(`.comment-${reactionType}-count`).textContent = response.reactions[reactionType];
        
        // Toggle active class
        btn.classList.toggle('active');
      }
    });
  });
}

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  // For older dates, use the actual date
  return date.toLocaleDateString();
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Initialize the community page when the DOM is loaded
document.addEventListener('DOMContentLoaded', initCommunity);