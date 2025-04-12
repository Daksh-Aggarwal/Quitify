// Addiction Tracker JavaScript functionality
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const addictionForm = document.getElementById('addictionForm');
  const addictionTypeSelect = document.getElementById('addictionType');
  const otherAddictionContainer = document.getElementById('otherAddictionContainer');
  const otherAddiction = document.getElementById('otherAddiction');
  const startDateInput = document.getElementById('startDate');
  const motivationSlider = document.getElementById('motivationLevel');
  const motivationValue = document.getElementById('motivationValue');
  const recoveryGoalInput = document.getElementById('recoveryGoal');
  const saveGoalBtn = document.getElementById('saveGoalBtn');
  const progressSection = document.getElementById('progressSection');
  const addictionDisplay = document.getElementById('addictionDisplay').querySelector('span');
  const startDateDisplay = document.getElementById('startDateDisplay').querySelector('span');
  const dayCount = document.getElementById('dayCount');
  const editGoalBtn = document.getElementById('editGoalBtn');
  const milestoneCards = document.querySelectorAll('.milestone-card');
  const moodButtons = document.querySelectorAll('.mood-btn');
  const selectedMoodInput = document.getElementById('selectedMood');
  const checkInNotes = document.getElementById('checkInNotes');
  const saveCheckInBtn = document.getElementById('saveCheckInBtn');
  const checkInList = document.getElementById('checkInList');
  const leaderboardFilters = document.querySelectorAll('.leaderboard-filters .filter-btn');
  const leaderboardEntries = document.querySelectorAll('.leaderboard-entry');
  const viewMoreBtn = document.querySelector('.view-more-btn');

  // Set default date to today
  const today = new Date();
  const formattedDate = today.toISOString().substr(0, 10);
  startDateInput.value = formattedDate;

  // Initialize the tracker based on stored data
  initializeTracker();

  // Event Listeners
  addictionTypeSelect.addEventListener('change', handleAddictionTypeChange);
  motivationSlider.addEventListener('input', updateMotivationValue);
  addictionForm.addEventListener('submit', handleFormSubmit);
  editGoalBtn.addEventListener('click', showEditForm);
  
  // Mood button selection
  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      moodButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMoodInput.value = btn.getAttribute('data-mood');
    });
  });

  // Save check-in
  saveCheckInBtn.addEventListener('click', saveCheckIn);

  // Leaderboard filters
  leaderboardFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      filterLeaderboard(filter.getAttribute('data-filter'));
      leaderboardFilters.forEach(btn => btn.classList.remove('active'));
      filter.classList.add('active');
    });
  });

  // View more button
  viewMoreBtn.addEventListener('click', loadMoreLeaders);

  // Functions
  function initializeTracker() {
    const savedGoal = localStorage.getItem('addictionGoal');
    
    if (savedGoal) {
      const goalData = JSON.parse(savedGoal);
      
      // Display progress section instead of goal form
      document.querySelector('.set-goal-section').style.display = 'none';
      progressSection.style.display = 'block';
      
      // Update the display with saved data
      addictionDisplay.textContent = goalData.addictionType === 'Other' ? goalData.otherAddiction : goalData.addictionType;
      startDateDisplay.textContent = formatDate(goalData.startDate);
      
      // Calculate and display days clean
      const daysSince = calculateDaysSince(goalData.startDate);
      dayCount.textContent = daysSince;
      
      // Update milestone cards
      updateMilestones(daysSince);
      
      // Load check-ins
      loadCheckIns();
    }
  }

  function handleAddictionTypeChange() {
    if (addictionTypeSelect.value === 'Other') {
      otherAddictionContainer.style.display = 'block';
      otherAddiction.required = true;
    } else {
      otherAddictionContainer.style.display = 'none';
      otherAddiction.required = false;
    }
  }

  function updateMotivationValue() {
    motivationValue.textContent = motivationSlider.value;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    // Form validation
    if (addictionTypeSelect.value === '') {
      alert('Please select an addiction type.');
      return;
    }
    
    if (addictionTypeSelect.value === 'Other' && otherAddiction.value.trim() === '') {
      alert('Please specify your addiction type.');
      return;
    }
    
    if (startDateInput.value === '') {
      alert('Please enter a start date.');
      return;
    }
    
    // Save the goal
    const goalData = {
      addictionType: addictionTypeSelect.value,
      otherAddiction: otherAddiction.value.trim(),
      startDate: startDateInput.value,
      motivationLevel: motivationSlider.value,
      recoveryGoal: recoveryGoalInput.value.trim()
    };
    
    localStorage.setItem('addictionGoal', JSON.stringify(goalData));
    
    // Show progress section
    document.querySelector('.set-goal-section').style.display = 'none';
    progressSection.style.display = 'block';
    
    // Update the display
    addictionDisplay.textContent = goalData.addictionType === 'Other' ? goalData.otherAddiction : goalData.addictionType;
    startDateDisplay.textContent = formatDate(goalData.startDate);
    
    // Calculate and display days clean
    const daysSince = calculateDaysSince(goalData.startDate);
    dayCount.textContent = daysSince;
    
    // Update milestone cards
    updateMilestones(daysSince);
  }

  function showEditForm() {
    const savedGoal = JSON.parse(localStorage.getItem('addictionGoal'));
    
    // Populate the form with saved data
    addictionTypeSelect.value = savedGoal.addictionType;
    handleAddictionTypeChange();
    
    if (savedGoal.addictionType === 'Other') {
      otherAddiction.value = savedGoal.otherAddiction;
    }
    
    startDateInput.value = savedGoal.startDate;
    motivationSlider.value = savedGoal.motivationLevel;
    updateMotivationValue();
    recoveryGoalInput.value = savedGoal.recoveryGoal;
    
    // Show the goal form
    document.querySelector('.set-goal-section').style.display = 'block';
    progressSection.style.display = 'none';
    
    // Scroll to the form
    document.querySelector('.set-goal-section').scrollIntoView({ behavior: 'smooth' });
  }

  function calculateDaysSince(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    
    // Reset hours to compare just the dates
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  function updateMilestones(days) {
    milestoneCards.forEach(card => {
      const milestoneDays = parseInt(card.getAttribute('data-days'), 10);
      
      if (days >= milestoneDays) {
        card.classList.add('achieved');
      } else {
        card.classList.remove('achieved');
      }
    });
  }

  function saveCheckIn() {
    const mood = selectedMoodInput.value;
    const notes = checkInNotes.value.trim();
    
    if (!mood) {
      alert(`Please select how you're feeling today.`);
      return;
    }
    
    const checkIn = {
      date: new Date().toISOString(),
      mood: mood,
      notes: notes
    };
    
    let checkIns = JSON.parse(localStorage.getItem('addictionCheckIns') || '[]');
    checkIns.unshift(checkIn); // Add to the beginning of the array
    localStorage.setItem('addictionCheckIns', JSON.stringify(checkIns));
    
    // Reset form
    moodButtons.forEach(btn => btn.classList.remove('selected'));
    selectedMoodInput.value = '';
    checkInNotes.value = '';
    
    // Show success message
    showNotification('Check-in saved successfully!');
    
    // Reload check-ins
    loadCheckIns();
  }

  function loadCheckIns() {
    const checkIns = JSON.parse(localStorage.getItem('addictionCheckIns') || '[]');
    
    if (checkIns.length === 0) {
      checkInList.innerHTML = `
        <div class="empty-state">
          <p>No check-ins recorded yet. Start tracking your journey today!</p>
        </div>
      `;
      return;
    }
    
    checkInList.innerHTML = '';
    
    // Show the 5 most recent check-ins
    const recentCheckIns = checkIns.slice(0, 5);
    
    recentCheckIns.forEach(checkIn => {
      const checkInItem = document.createElement('div');
      checkInItem.className = 'check-in-item';
      
      checkInItem.innerHTML = `
        <div class="check-in-header">
          <div class="check-in-date">${formatDate(checkIn.date)}</div>
          <div class="check-in-mood">${checkIn.mood}</div>
        </div>
        <div class="check-in-content">${checkIn.notes || 'No notes for this day.'}</div>
      `;
      
      checkInList.appendChild(checkInItem);
    });
  }

  function filterLeaderboard(filter) {
    leaderboardEntries.forEach(entry => {
      const addiction = entry.querySelector('.addiction').textContent;
      
      if (filter === 'all' || addiction === filter) {
        entry.style.display = 'grid';
      } else {
        entry.style.display = 'none';
      }
    });
  }

  function loadMoreLeaders() {
    // Mock function to simulate loading more data
    viewMoreBtn.textContent = 'Loading...';
    
    setTimeout(() => {
      const leaderboardBody = document.getElementById('leaderboardList');
      
      const newEntries = [
        {
          rank: 6,
          user: { name: 'Thomas R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' },
          addiction: 'Smoking',
          streak: '30 days',
          achievement: '1 Month Milestone 🏆'
        },
        {
          rank: 7,
          user: { name: 'Jessica D.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7' },
          addiction: 'Social Media',
          streak: '22 days',
          achievement: '3 Week Milestone 🏆'
        },
        {
          rank: 8,
          user: { name: 'Robert L.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8' },
          addiction: 'Alcohol',
          streak: '15 days',
          achievement: '2 Week Milestone 🏆'
        }
      ];
      
      newEntries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'leaderboard-entry';
        
        entryElement.innerHTML = `
          <div class="rank"><span class="rank-number">${entry.rank}</span></div>
          <div class="user">
            <img src="${entry.user.avatar}" alt="User avatar">
            <span>${entry.user.name}</span>
          </div>
          <div class="addiction">${entry.addiction}</div>
          <div class="streak">${entry.streak}</div>
          <div class="achievement">
            <div class="achievement-tag">${entry.achievement}</div>
          </div>
        `;
        
        leaderboardBody.appendChild(entryElement);
        
        // Add the new entry to our NodeList for filtering
        leaderboardEntries.forEach(existingEntry => {
          if (existingEntry.querySelector('.addiction').textContent === entry.addiction) {
            existingEntry.style.display = 'grid';
          }
        });
      });
      
      viewMoreBtn.textContent = 'View More';
      
      // Change button functionality after first load
      viewMoreBtn.removeEventListener('click', loadMoreLeaders);
      viewMoreBtn.addEventListener('click', () => {
        alert('End of leaderboard reached. Check back later for more recovery champions!');
      });
      
    }, 1000);
  }

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'var(--primary-color)',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '10px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      zIndex: '1000',
      opacity: '0',
      transform: 'translateY(20px)',
      transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Animate out after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }
});
