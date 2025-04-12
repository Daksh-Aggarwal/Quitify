import communityService from './services/communityService.js';
import authService from './services/authService.js';

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
  // Authentication initialization - ensure the authService is properly initialized
  if (authService.isLoggedIn()) {
    // Update UI based on authentication status
    updateAuthUI();
  }

  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navLinks.classList.toggle('show');
    });
    
    // Close menu when clicking links
    const navItems = navLinks.querySelectorAll('a');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (navLinks.classList.contains('show')) {
          mobileMenuBtn.classList.remove('active');
          navLinks.classList.remove('show');
        }
      });
    });
  }
  
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        navbar.style.padding = '0.7rem 5%';
        navbar.style.boxShadow = '0 4px 20px rgba(124, 93, 250, 0.25)';
      } else {
        navbar.style.padding = '1rem 5%';
        navbar.style.boxShadow = '0 4px 15px rgba(124, 93, 250, 0.2)';
      }
    });
  }

  // Community Highlights Slider
  initCommunityHighlightsSlider();
  
  // Community Leaders Interactions
  initLeaderboardInteractions();
  
  // Initialize Journey section
  initJourneySection();

  // Handle login/register buttons in the navbar
  const loginNavBtn = document.getElementById('loginNavBtn');
  const registerNavBtn = document.getElementById('registerNavBtn');
  
  if (loginNavBtn) {
    loginNavBtn.addEventListener('click', () => {
      showAuthModal('login');
    });
  }
  
  if (registerNavBtn) {
    registerNavBtn.addEventListener('click', () => {
      showAuthModal('register');
    });
  }
  
  // Check for URL parameters that might indicate where to redirect after login
  const urlParams = new URLSearchParams(window.location.search);
  const authAction = urlParams.get('auth');
  const redirect = urlParams.get('redirect');
  
  if (authAction === 'login') {
    showAuthModal('login');
    if (redirect) {
      // Store redirect target
      sessionStorage.setItem('redirectAfterLogin', redirect);
    }
  } else if (authAction === 'register') {
    showAuthModal('register');
    if (redirect) {
      sessionStorage.setItem('redirectAfterLogin', redirect);
    }
  }

  // Get Help button shows login modal
  const getHelpBtn = document.getElementById('getHelp');
  if (getHelpBtn) {
    getHelpBtn.addEventListener('click', () => {
      showAuthModal('login');
    });
  }

  // Import community service
  

  // Load community data from backend
  loadCommunityData();
});

// Show the authentication modal with specified tab (login or register)
function showAuthModal(tab = 'login') {
  const authModal = document.getElementById('authModal');
  const loginSection = document.querySelector('.login-section');
  const registerSection = document.querySelector('.register-section');
  
  if (authModal) {
    authModal.style.display = 'flex';
    
    // Show the appropriate tab
    if (tab === 'login') {
      loginSection.classList.remove('hidden');
      registerSection.classList.add('hidden');
    } else {
      registerSection.classList.remove('hidden');
      loginSection.classList.add('hidden');
    }
    
    // Close when clicking X
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
      });
    }
    
    // Close when clicking outside
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        authModal.style.display = 'none';
      }
    });
  }
}

// Load community data from backend API
async function loadCommunityData() {
  try {
    // Load community highlights for the homepage slider
    const highlightsSection = document.querySelector('.community-highlights');
    if (highlightsSection) {
      const result = await communityService.getCommunityHighlights();
      if (result.success) {
        updateCommunityHighlights(result.highlights);
      }
    }
    
    // Load community leaders for the leaderboard section
    const leaderboardSection = document.querySelector('.leaderboard-section');
    if (leaderboardSection && !window.location.pathname.includes('addiction-tracker.html')) {
      const result = await communityService.getCommunityLeaders();
      if (result.success) {
        updateCommunityLeaders(result.leaders);
      }
    }
  } catch (error) {
    console.error('Failed to load community data:', error);
  }
}

// Update community highlights in the homepage slider
function updateCommunityHighlights(highlights) {
  const postsGrid = document.querySelector('.posts-grid');
  if (!postsGrid || !highlights || !highlights.length) return;
  
  // Clear existing posts
  postsGrid.innerHTML = '';
  
  // Add posts from the API
  highlights.forEach(post => {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    
    // Format the date
    const postDate = new Date(post.createdAt);
    const timeAgo = getTimeAgo(postDate);
    
    postCard.innerHTML = `
      <div class="post-header">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}" alt="Avatar" class="avatar">
        <div class="post-meta">
          <h3>${post.author.username}</h3>
          <span>${timeAgo}</span>
        </div>
      </div>
      <p>${post.content}</p>
      <div class="post-stats">
        <span>❤️ ${post.likes || 0} likes</span>
        <span>💭 ${post.comments ? post.comments.length : 0} comments</span>
      </div>
    `;
    
    postsGrid.appendChild(postCard);
  });
  
  // Reinitialize the slider
  initCommunityHighlightsSlider();
}

// Update community leaders in the leaderboard section
function updateCommunityLeaders(leaders) {
  const leaderboard = document.querySelector('.leaderboard');
  if (!leaderboard || !leaders || !leaders.length) return;
  
  // Clear existing leaders
  leaderboard.innerHTML = '';
  
  // Add leaders from the API
  leaders.forEach((leader, index) => {
    const leaderCard = document.createElement('div');
    leaderCard.className = 'leader-card';
    
    // Determine badge icons based on leader's achievements
    const badges = leader.badges.map(badge => 
      `<span class="badge" title="${badge.name}">${badge.icon}</span>`
    ).join('');
    
    leaderCard.innerHTML = `
      <div class="leader-rank">${index + 1}</div>
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.id}" alt="Top contributor" class="avatar">
      <h3>${leader.username}</h3>
      <p>${leader.title || 'Community Member'}</p>
      <span class="streak">${leader.streakIcon || '🔥'} ${leader.streaks} day streak</span>
      <div class="achievement-badges">
        ${badges || '<span class="badge" title="Member">👤</span>'}
      </div>
    `;
    
    leaderboard.appendChild(leaderCard);
  });
  
  // Initialize the leaderboard interaction effects
  initLeaderboardInteractions();
}

// Helper function to format date as time ago
function getTimeAgo(date) {
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);
  
  if (secondsAgo < 60) {
    return 'just now';
  } else if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// Initialize Community Highlights Slider
function initCommunityHighlightsSlider() {
  const postsGrid = document.querySelector('.posts-grid');
  const prevArrow = document.querySelector('.prev-arrow');
  const nextArrow = document.querySelector('.next-arrow');
  const dots = document.querySelectorAll('.dot');
  
  if (!postsGrid || !prevArrow || !nextArrow) return;
  
  let currentSlide = 0;
  const postCards = document.querySelectorAll('.post-card');
  const totalSlides = Math.ceil(postCards.length / 3);
  
  // Calculate slide width for proper movement
  const postCardWidth = postCards[0]?.offsetWidth || 0;
  const gap = 16; // gap in pixels
  
  // Helper function to update dots
  function updateDots(index) {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }
  
  // Helper function to move slides
  function moveToSlide(index) {
    // For small screens, we show one card at a time
    let cardsPerView = window.innerWidth > 768 ? 3 : 1;
    
    // Calculate the transform value
    const slideWidth = (postCardWidth + gap) * cardsPerView;
    
    // Implement infinite scroll
    if (index < 0) {
      index = totalSlides - 1;
    } else if (index >= totalSlides) {
      index = 0;
    }
    
    currentSlide = index;
    const transformValue = -index * slideWidth;
    postsGrid.style.transform = `translateX(${transformValue}px)`;
    updateDots(index);
  }
  
  // Event listeners for arrows
  prevArrow.addEventListener('click', () => {
    moveToSlide(currentSlide - 1);
  });
  
  nextArrow.addEventListener('click', () => {
    moveToSlide(currentSlide + 1);
  });
  
  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      moveToSlide(index);
    });
  });
  
  // Initialize first slide
  updateDots(0);
  
  // Auto-slide functionality
  let slideInterval = setInterval(() => {
    moveToSlide(currentSlide + 1);
  }, 5000);
  
  // Pause auto-slide on hover
  const sliderContainer = document.querySelector('.highlights-wrapper');
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
    });
    
    sliderContainer.addEventListener('mouseleave', () => {
      slideInterval = setInterval(() => {
        moveToSlide(currentSlide + 1);
      }, 5000);
    });
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    moveToSlide(currentSlide);
  });
  
  // Touch events for mobile swiping
  let startX, moveX;
  const slider = document.querySelector('.posts-slider');
  
  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    clearInterval(slideInterval);
  }, { passive: true });
  
  slider.addEventListener('touchmove', (e) => {
    if (!startX) return;
    moveX = e.touches[0].clientX;
  }, { passive: true });
  
  slider.addEventListener('touchend', () => {
    if (!startX || !moveX) return;
    const diffX = startX - moveX;
    if (Math.abs(diffX) > 50) { // Minimum swipe distance
      if (diffX > 0) {
        moveToSlide(currentSlide + 1); // Swipe left, go next
      } else {
        moveToSlide(currentSlide - 1); // Swipe right, go prev
      }
    }
    startX = null;
    moveX = null;
    
    // Resume auto-sliding
    slideInterval = setInterval(() => {
      moveToSlide(currentSlide + 1);
    }, 5000);
  }, { passive: true });
}

// Community Leaders Interactions
function initLeaderboardInteractions() {
  const leaderCards = document.querySelectorAll('.leader-card');
  const viewMoreBtn = document.querySelector('.view-more-btn');
  
  if (leaderCards.length > 0) {
    // Add hover effects and animations
    leaderCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      // Animate entry with delay based on index
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 300 + (index * 150));
      
      // Add tooltip functionality to badges
      const badges = card.querySelectorAll('.badge');
      badges.forEach(badge => {
        const title = badge.getAttribute('title');
        
        badge.addEventListener('mouseenter', () => {
          // Create and show tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'badge-tooltip';
          tooltip.textContent = title;
          tooltip.style.position = 'absolute';
          tooltip.style.backgroundColor = 'rgba(44, 44, 44, 0.9)';
          tooltip.style.color = 'white';
          tooltip.style.padding = '5px 10px';
          tooltip.style.borderRadius = '5px';
          tooltip.style.fontSize = '0.8rem';
          tooltip.style.zIndex = '100';
          tooltip.style.top = '-30px';
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translateX(-50%)';
          tooltip.style.whiteSpace = 'nowrap';
          
          badge.style.position = 'relative';
          badge.appendChild(tooltip);
        });
        
        badge.addEventListener('mouseleave', () => {
          const tooltip = badge.querySelector('.badge-tooltip');
          if (tooltip) {
            badge.removeChild(tooltip);
          }
        });
      });
    });
  }
  
  if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', () => {
      // Mock functionality - in a real app this would load more leaders
      viewMoreBtn.textContent = 'Loading...';
      
      setTimeout(() => {
        // Add new leader cards with animation
        const leaderboard = document.querySelector('.leaderboard');
        
        if (leaderboard) {
          const newLeaders = [
            {
              name: 'Thomas R.',
              rank: 4,
              title: 'Mindfulness Coach',
              streak: '🌱 45 day streak',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=11',
              badges: [
                { emoji: '🧘', title: 'Yoga Master' },
                { emoji: '🌱', title: 'Growth Mindset' }
              ]
            },
            {
              name: 'Jessica D.',
              rank: 5,
              title: 'Community Mentor',
              streak: '🤝 300+ interactions',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=12',
              badges: [
                { emoji: '💬', title: 'Active Communicator' },
                { emoji: '🛡️', title: 'Community Protector' }
              ]
            }
          ];
          
          newLeaders.forEach(leader => {
            const leaderCard = document.createElement('div');
            leaderCard.className = 'leader-card';
            leaderCard.innerHTML = `
              <div class="leader-rank">${leader.rank}</div>
              <img src="${leader.avatar}" alt="Leader" class="avatar">
              <h3>${leader.name}</h3>
              <p>${leader.title}</p>
              <span class="streak">${leader.streak}</span>
              <div class="achievement-badges">
                ${leader.badges.map(badge => `
                  <span class="badge" title="${badge.title}">${badge.emoji}</span>
                `).join('')}
              </div>
            `;
            
            // Apply initial style for animation
            leaderCard.style.opacity = '0';
            leaderCard.style.transform = 'translateY(20px)';
            
            leaderboard.appendChild(leaderCard);
            
            // Trigger animation
            setTimeout(() => {
              leaderCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              leaderCard.style.opacity = '1';
              leaderCard.style.transform = 'translateY(0)';
            }, 100);
          });
          
          // Update button
          viewMoreBtn.textContent = 'View All Leaders';
        }
      }, 1500);
    });
  }
}

// Enhanced Journey Section functionality
function initJourneySection() {
  if (!window.location.pathname.includes('profile.html')) return;
  
  const journeyFilters = document.querySelectorAll('.journey-filter');
  const memoryCards = document.querySelectorAll('.memory-card');
  
  // Initialize Intersection Observer for timeline animation
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate in the card when it becomes visible
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0) scale(1)';
        entry.target.classList.add('show-card');
      }
    });
  }, { threshold: 0.2 });
  
  // Initialize timeline elements with starting styles
  memoryCards.forEach((card, index) => {
    // Set initial state for entrance animation
    card.style.opacity = '0';
    card.style.transform = 'translateX(-30px) scale(0.95)';
    card.style.transition = 'opacity 0.6s ease, transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transitionDelay = `${0.1 + (index * 0.15)}s`;
    timelineObserver.observe(card);
    
    // Handle image loading
    const img = card.querySelector('.memory-image');
    if (img) {
      img.addEventListener('load', () => {
        // Add subtle zoom animation when image loads
        img.style.transform = 'scale(1.02)';
        setTimeout(() => {
          img.style.transform = 'scale(1)';
        }, 300);
      });
    }
  });
  
  // Animate time dots and markers
  const timeMarkers = document.querySelectorAll('.time-marker');
  timeMarkers.forEach((marker, index) => {
    marker.style.opacity = '0';
    marker.style.transform = 'translateX(-20px)';
    marker.style.transition = 'all 0.5s ease';
    marker.style.transitionDelay = `${index * 0.2}s`;
    
    setTimeout(() => {
      marker.style.opacity = '1';
      marker.style.transform = 'translateX(0)';
    }, 300);
    
    const timeDot = marker.querySelector('.time-dot');
    if (timeDot) {
      // Add pulsing effect to time dots
      timeDot.style.animation = 'pulse 2s infinite';
      
      // Create and add keyframes for pulse animation if they don't exist
      if (!document.querySelector('#pulse-animation')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'pulse-animation';
        styleSheet.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 209, 197, 0.4); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(79, 209, 197, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 209, 197, 0); }
          }
        `;
        document.head.appendChild(styleSheet);
      }
    }
  });
  
  // Filter functionality for journey memories
  if (journeyFilters.length > 0) {
    journeyFilters.forEach(filter => {
      filter.addEventListener('click', function() {
        // Update active filter
        journeyFilters.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const filterValue = this.getAttribute('data-filter');
        
        // Filter cards
        memoryCards.forEach(card => {
          card.classList.remove('show-card', 'hide-card');
          
          // Allow animation to reset
          setTimeout(() => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
              card.classList.add('show-card');
            } else {
              card.classList.add('hide-card');
            }
          }, 10);
        });
      });
    });
  }
  
  // Memory card interactions
  memoryCards.forEach(card => {
    // Add hover effects for memory cards
    card.addEventListener('mouseenter', function() {
      // Add subtle lift effect to sibling elements
      const siblings = Array.from(this.parentNode.children).filter(
        el => el.classList.contains('memory-card') && el !== this
      );
      
      siblings.forEach(sibling => {
        sibling.style.transform = 'scale(0.98) translateY(0)';
        sibling.style.opacity = '0.8';
      });
    });
    
    card.addEventListener('mouseleave', function() {
      // Reset siblings
      const siblings = Array.from(this.parentNode.children).filter(
        el => el.classList.contains('memory-card')
      );
      
      siblings.forEach(sibling => {
        if (sibling !== this) {
          sibling.style.transform = '';
          sibling.style.opacity = '';
        }
      });
    });
    
    // Add interactions for action buttons
    const actionBtns = card.querySelectorAll('.memory-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const action = this.textContent.trim().includes('Edit') ? 'edit' : 'highlight';
        const cardId = card.id || 'memory' + Math.floor(Math.random() * 1000);
        
        // Visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.style.transform = '';
          
          // For demo purposes, show an alert with the action
          if (action === 'edit') {
            alert('Edit memory functionality will be available soon!');
          } else {
            // Highlight animation effect
            card.style.boxShadow = '0 0 0 3px var(--primary-color)';
            
            // Create highlight effect
            const highlightEffect = document.createElement('div');
            highlightEffect.className = 'highlight-effect';
            Object.assign(highlightEffect.style, {
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(124, 93, 250, 0.2), rgba(79, 209, 197, 0.2))',
              opacity: '0',
              pointerEvents: 'none',
              zIndex: '1',
            });
            
            card.style.position = 'relative';
            card.appendChild(highlightEffect);
            
            // Animate highlight
            highlightEffect.animate([
              { opacity: 0 },
              { opacity: 1 },
              { opacity: 0 }
            ], {
              duration: 1500,
              easing: 'ease'
            });
            
            // Remove after animation
            setTimeout(() => {
              card.style.boxShadow = '';
              if (card.contains(highlightEffect)) {
                card.removeChild(highlightEffect);
              }
            }, 1500);
            
            alert('Memory highlighted! In the full version, this would be featured on your profile.');
          }
        }, 200);
      });
    });
  });
  
  // Add New Memory button interaction
  const addMemoryBtn = document.querySelector('.add-memory-btn');
  if (addMemoryBtn) {
    addMemoryBtn.addEventListener('click', function() {
      // Create a modal for adding new memory
      const memoryModal = document.createElement('div');
      memoryModal.className = 'memory-modal';
      memoryModal.innerHTML = `
        <div class="memory-modal-content">
          <button class="close-modal">&times;</button>
          <h2>Create New Memory</h2>
          
          <form class="memory-form">
            <div class="form-group">
              <label for="memory-title">Title</label>
              <input type="text" id="memory-title" placeholder="Title of your memory">
            </div>
            
            <div class="form-group">
              <label for="memory-content">Content</label>
              <textarea id="memory-content" placeholder="Write about your experience..."></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="memory-category">Category</label>
                <select id="memory-category">
                  <option value="milestones">Milestone</option>
                  <option value="reflections">Reflection</option>
                  <option value="gratitude">Gratitude</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="memory-mood">Mood</label>
                <div class="mood-selector">
                  <button type="button" class="mood-btn selected" data-mood="😊">😊</button>
                  <button type="button" class="mood-btn" data-mood="😌">😌</button>
                  <button type="button" class="mood-btn" data-mood="🧘‍♂️">🧘‍♂️</button>
                  <button type="button" class="mood-btn" data-mood="🙏">🙏</button>
                  <button type="button" class="mood-btn" data-mood="💪">💪</button>
                </div>
                <input type="hidden" id="memory-mood" value="😊">
              </div>
            </div>
            
            <div class="form-group">
              <label for="memory-image">Upload Image (optional)</label>
              <input type="file" id="memory-image" accept="image/*">
            </div>
            
            <div class="form-actions">
              <button type="button" class="cancel-memory-btn">Cancel</button>
              <button type="button" class="save-memory-btn">Save Memory</button>
            </div>
          </form>
        </div>
      `;
      
      // Style the modal
      Object.assign(memoryModal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '2000',
        opacity: '0',
        transition: 'opacity 0.3s ease'
      });
      
      const modalContent = memoryModal.querySelector('.memory-modal-content');
      Object.assign(modalContent.style, {
        background: 'white',
        padding: '2.5rem',
        borderRadius: '20px',
        maxWidth: '90%',
        width: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        transform: 'scale(0.9)',
        transition: 'transform 0.3s ease'
      });
      
      // Style the form elements
      const formStyles = document.createElement('style');
      formStyles.textContent = `
        .memory-form {
          margin-top: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-row {
          display: flex;
          gap: 1.5rem;
        }
        
        .form-row .form-group {
          flex: 1;
        }
        
        .memory-form label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--primary-color);
        }
        
        .memory-form input[type="text"],
        .memory-form textarea,
        .memory-form select {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
        }
        
        .memory-form textarea {
          min-height: 120px;
          resize: vertical;
        }
        
        .mood-selector {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .mood-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: white;
          font-size: 1.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .mood-btn.selected {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(124, 93, 250, 0.3);
          transform: scale(1.1);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .cancel-memory-btn,
        .save-memory-btn {
          padding: 0.8rem 1.5rem;
          border-radius: 30px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .cancel-memory-btn {
          background: #f1f1f1;
          color: #666;
        }
        
        .cancel-memory-btn:hover {
          background: #e1e1e1;
        }
        
        .save-memory-btn {
          background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
          color: white;
        }
        
        .save-memory-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(124, 93, 250, 0.25);
        }
        
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `;
      document.head.appendChild(formStyles);
      
      // Add to body and animate
      document.body.appendChild(memoryModal);
      setTimeout(() => {
        memoryModal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
      }, 10);
      
      // Close modal functionality
      const closeModal = () => {
        modalContent.style.transform = 'scale(0.9)';
        memoryModal.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(memoryModal)) {
            document.body.removeChild(memoryModal);
          }
        }, 300);
      };
      
      const closeBtn = memoryModal.querySelector('.close-modal');
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '15px';
      closeBtn.style.right = '20px';
      closeBtn.style.fontSize = '2rem';
      closeBtn.style.background = 'none';
      closeBtn.style.border = 'none';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.color = '#888';
      closeBtn.addEventListener('click', closeModal);
      
      // Mood selector functionality
      const moodBtns = memoryModal.querySelectorAll('.mood-btn');
      const moodInput = memoryModal.querySelector('#memory-mood');
      
      moodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          moodBtns.forEach(b => b.classList.remove('selected'));
          this.classList.add('selected');
          moodInput.value = this.getAttribute('data-mood');
        });
      });
      
      // Cancel button
      const cancelBtn = memoryModal.querySelector('.cancel-memory-btn');
      cancelBtn.addEventListener('click', closeModal);
      
      // Save functionality (demo)
      const saveBtn = memoryModal.querySelector('.save-memory-btn');
      saveBtn.addEventListener('click', function() {
        const title = document.getElementById('memory-title').value;
        const content = document.getElementById('memory-content').value;
        
        if (!title || !content) {
          alert('Please fill in at least the title and content fields.');
          return;
        }
        
        // For demo purposes: Show loading state
        this.textContent = 'Saving...';
        this.disabled = true;
        
        setTimeout(() => {
          alert('Memory saved successfully! In a complete application, this would be saved to your profile.');
          closeModal();
          
          // Optional: Reload to show a message that the memory was saved
          // In a real app, you'd dynamically add the new memory to the list
        }, 1500);
      });
      
      // Prevent closing when clicking inside modal content
      modalContent.addEventListener('click', e => {
        e.stopPropagation();
      });
      
      // Close when clicking outside modal content
      memoryModal.addEventListener('click', closeModal);
    });
  }
  
  // Animate the timeline line
  const timelineLine = document.querySelector('.timeline-line');
  if (timelineLine) {
    timelineLine.style.height = '0';
    setTimeout(() => {
      timelineLine.style.transition = 'height 1.5s ease-out';
      timelineLine.style.height = '100%';
    }, 500);
  }
}

// Main JavaScript file for authentication and shared functionality
import authService from './services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  if (authService.isLoggedIn() && window.location.pathname.includes('index.html')) {
    // Redirect to addiction tracker page if already logged in
    window.location.href = 'addiction-tracker.html';
    return;
  }

  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const loginBtn = document.getElementById('loginBtn');
      const errorMessage = document.getElementById('loginError');
      
      if (!email || !password) {
        errorMessage.textContent = 'Please fill in all fields';
        errorMessage.style.display = 'block';
        return;
      }
      
      // Show loading state
      loginBtn.disabled = true;
      loginBtn.textContent = 'Logging in...';
      errorMessage.style.display = 'none';
      
      try {
        const result = await authService.login(email, password);
        
        if (result.success) {
          // Redirect to the appropriate page
          const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
          if (redirectAfterLogin) {
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = `${redirectAfterLogin}.html`;
          } else {
            window.location.href = 'addiction-tracker.html';
          }
        } else {
          // Show error
          errorMessage.textContent = result.error;
          errorMessage.style.display = 'block';
        }
      } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred during login. Please try again.';
        errorMessage.style.display = 'block';
      } finally {
        // Reset button state
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
      }
    });
  }
  
  // Registration Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('registerUsername').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const registerBtn = document.getElementById('registerBtn');
      const errorMessage = document.getElementById('registerError');
      
      if (!username || !email || !password || !confirmPassword) {
        errorMessage.textContent = 'Please fill in all fields';
        errorMessage.style.display = 'block';
        return;
      }
      
      if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.style.display = 'block';
        return;
      }
      
      // Show loading state
      registerBtn.disabled = true;
      registerBtn.textContent = 'Creating account...';
      errorMessage.style.display = 'none';
      
      try {
        const result = await authService.register(username, email, password);
        
        if (result.success) {
          // Redirect to the appropriate page
          const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
          if (redirectAfterLogin) {
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = `${redirectAfterLogin}.html`;
          } else {
            window.location.href = 'addiction-tracker.html';
          }
        } else {
          // Show error
          errorMessage.textContent = result.error;
          errorMessage.style.display = 'block';
        }
      } catch (error) {
        console.error('Registration error:', error);
        errorMessage.textContent = 'An error occurred during registration. Please try again.';
        errorMessage.style.display = 'block';
      } finally {
        // Reset button state
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create Account';
      }
    });
  }
  
  // Toggle between login and register forms
  const toggleLinks = document.querySelectorAll('.toggle-form');
  if (toggleLinks.length > 0) {
    toggleLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const loginSection = document.querySelector('.login-section');
        const registerSection = document.querySelector('.register-section');
        
        loginSection.classList.toggle('hidden');
        registerSection.classList.toggle('hidden');
      });
    });
  }
  
  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      authService.logout();
      window.location.href = 'index.html';
    });
  }
  
  // Update UI based on authentication status
  updateAuthUI();
});

// Update UI elements based on authentication status
function updateAuthUI() {
  const isLoggedIn = authService.isLoggedIn();
  const user = authService.getUser();
  
  // Update nav items
  const authNav = document.querySelector('.auth-nav');
  const userNav = document.querySelector('.user-nav');
  
  if (authNav && userNav) {
    if (isLoggedIn) {
      authNav.style.display = 'none';
      userNav.style.display = 'flex';
      
      // Set username if available
      const usernameElement = userNav.querySelector('.username');
      if (usernameElement && user) {
        usernameElement.textContent = user.username;
      }
    } else {
      authNav.style.display = 'flex';
      userNav.style.display = 'none';
    }
  }
}
