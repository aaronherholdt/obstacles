document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let coursesData = []; // Default courses
    let communityCourses = []; // Community courses
    let currentFilter = 'all';
    let currentSort = 'newest';
    let currentPage = 1;
    let itemsPerPage = 8;
    let totalPages = 1;
    let searchQuery = '';
    let websocket = null;
    
    // DOM Elements
    const courseSelectionOverlay = document.getElementById('course-selection');
    const communityCoursesOverlay = document.getElementById('community-courses');
    const coursesGrid = document.getElementById('courses-grid');
    const communityGrid = document.getElementById('community-grid');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageIndicator = document.getElementById('pageIndicator');
    const courseSearch = document.getElementById('courseSearch');
    const searchButton = document.getElementById('searchButton');
    const refreshCommunityButton = document.getElementById('refreshCommunityButton');
    
    // Event Listeners
    createButton.addEventListener('click', function() {
        // Navigate to the builder page with editor=true parameter
        window.location.href = 'builder.html?editor=true';
    });
    
    playButton.addEventListener('click', function() {
        // Show course selection overlay
        showCourseSelection();
    });
    
    communityButton.addEventListener('click', function() {
        // Show community courses overlay
        showCommunityCourses();
    });
    
    browseCoursesLink.addEventListener('click', function(e) {
        e.preventDefault();
        // Show course selection overlay
        showCourseSelection();
    });
    
    closeSelectionButton.addEventListener('click', function() {
        // Hide course selection overlay
        hideCourseSelection();
    });
    
    closeCommunityButton.addEventListener('click', function() {
        // Hide community courses overlay
        hideCommunityCourses();
    });
    
    refreshCommunityButton.addEventListener('click', function() {
        // Reload community courses
        loadCommunityCourses();
    });
    
    searchButton.addEventListener('click', function() {
        searchQuery = courseSearch.value.trim();
        currentPage = 1;
        updateCommunityGrid();
    });
    
    courseSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchQuery = courseSearch.value.trim();
            currentPage = 1;
            updateCommunityGrid();
        }
    });
    
    prevPageButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updateCommunityGrid();
        }
    });
    
    nextPageButton.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            updateCommunityGrid();
        }
    });
    
    // Initialize course selection grid
    function initCourseGrid() {
        // Clear existing content
        coursesGrid.innerHTML = '';
        
        // Set up filter button listeners
        setupFilterListeners();
        
        // Populate with predefined courses
        predefinedCourses.forEach(course => {
            const courseElement = createCourseElement(course);
            coursesGrid.appendChild(courseElement);
        });
    }
    
    // Set up filter button event listeners
    function setupFilterListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get filter value
                const filterValue = this.getAttribute('data-filter');
                
                // Apply filter
                filterCourses(filterValue);
            });
        });
    }
    
    // Filter courses based on selected difficulty
    function filterCourses(difficulty) {
        const courseItems = document.querySelectorAll('.course-item');
        
        courseItems.forEach(item => {
            const courseId = item.dataset.courseId;
            const course = predefinedCourses.find(c => c.id.toString() === courseId);
            
            if (!course) return;
            
            if (difficulty === 'all' || course.difficulty === difficulty) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Create a course element
    function createCourseElement(course) {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'course-item';
        courseDiv.dataset.courseId = course.id;
        
        // Use CSS classes for thumbnails instead of image files
        courseDiv.innerHTML = `
            <div class="course-thumbnail ${course.thumbnailClass}">
                <div class="course-difficulty">${course.difficulty}</div>
            </div>
            <div class="course-title">${course.title}</div>
            <div class="course-description">${course.description}</div>
            <div class="course-actions">
                <button class="play-course-btn">Play</button>
                <button class="leaderboard-btn">Leaderboard</button>
            </div>
        `;
        
        // Add play button click event
        const playButton = courseDiv.querySelector('.play-course-btn');
        playButton.addEventListener('click', function(e) {
            e.stopPropagation();
            playCourse(course);
        });
        
        // Add leaderboard button click event
        const leaderboardButton = courseDiv.querySelector('.leaderboard-btn');
        leaderboardButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (window.leaderboardManager) {
                window.leaderboardManager.showLeaderboardOverlay(course.id, course.title);
            }
        });
        
        // Also add click event to the entire course item to play it (backward compatibility)
        courseDiv.addEventListener('click', function() {
            playCourse(course);
        });
        
        return courseDiv;
    }
    
    // Show the course selection overlay
    function showCourseSelection() {
        // Initialize the grid if it's empty
        if (coursesGrid.children.length === 0) {
            initCourseGrid();
        }
        
        courseSelection.style.display = 'flex';
        setTimeout(() => {
            courseSelection.classList.add('active');
        }, 10);
    }
    
    // Hide the course selection overlay
    function hideCourseSelection() {
        courseSelection.classList.remove('active');
        setTimeout(() => {
            courseSelection.style.display = 'none';
        }, 300);
    }
    
    // Play the selected course
    function playCourse(course) {
        // Store the selected course data (predefined or community) in localStorage
        localStorage.setItem('selectedCourse', JSON.stringify(course));

        // Navigate to the builder page with the course ID and play mode
        // Use course.id directly as it should be consistent now
        window.location.href = 'builder.html?mode=play&course=' + encodeURIComponent(String(course.id));
    }
    
    // Create folder for assets if needed
    function createAssetsFolder() {
        // This would normally be handled by the filesystem
        console.log('In a real environment, we would create the assets/courses folder here');
    }
    
    // Set up community courses storage if not already initialized
    function setupCommunityStorage() {
        if (!localStorage.getItem('communityCourses')) {
            // Initialize with empty array
            localStorage.setItem('communityCourses', JSON.stringify([]));
        }
    }
    
    // Initialize (called when the page loads)
    function init() {
        createAssetsFolder();
        setupCommunityStorage();
        setupTimestampRefresh();
        connectWebSocket(); // Connect to WebSocket server
        
        // Check for any URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const showCoursesParam = urlParams.get('showCourses');
        const showCommunityParam = urlParams.get('showCommunity');
        
        if (showCoursesParam === 'true') {
            // Auto-show course selection if requested
            showCourseSelection();
        } else if (showCommunityParam === 'true') {
            // Auto-show community courses if requested
            showCommunityCourses();
        }
        
        // Initialize community grid with classes to match courses-grid
        communityGrid.classList.add('courses-grid');
        
        // Add event listener for refresh button
        if (refreshCommunityButton) {
            refreshCommunityButton.addEventListener('click', function() {
                loadCommunityCourses();
            });
        }
    }
    
    // Call init to start everything
    init();

    // Show the community courses overlay
    function showCommunityCourses() {
        // Load community courses if not already loaded
        if (communityGrid.querySelector('.loading-indicator')) {
            loadCommunityCourses();
        } else {
            // Refresh the grid with current filters/sorting
            updateCommunityGrid();
        }
        
        communityCoursesOverlay.style.display = 'flex';
        setTimeout(() => {
            communityCoursesOverlay.classList.add('active');
        }, 10);
    }
    
    // Hide the community courses overlay
    function hideCommunityCourses() {
        communityCoursesOverlay.classList.remove('active');
        setTimeout(() => {
            communityCoursesOverlay.style.display = 'none';
        }, 300);
    }
    
    // Load community courses from server
    function loadCommunityCourses() {
        // Show loading indicator
        communityGrid.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading community courses...</p>
            </div>
        `;
        
        // Request courses from server
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            // Request community courses
            requestCommunityCourses();
        } else {
            // If WebSocket is not connected, try to connect
            connectWebSocket();
            
            // Fallback to localStorage while connecting
            setTimeout(() => {
                let loadedCourses = [];
                
                try {
                    const storedCourses = localStorage.getItem('communityCourses');
                    if (storedCourses) {
                        loadedCourses = JSON.parse(storedCourses);
                        console.log('Loaded stored community courses:', loadedCourses.length);
                        
                        // Ensure all courses have a valid created/dateCreated field
                        loadedCourses = loadedCourses.map(course => {
                            if (!course.created && !course.dateCreated) {
                                // If neither field exists, set them to current time
                                course.created = new Date().toISOString();
                                course.dateCreated = course.created;
                            } else if (!course.created) {
                                // If only dateCreated exists, copy it to created
                                course.created = course.dateCreated;
                            } else if (!course.dateCreated) {
                                // If only created exists, copy it to dateCreated
                                course.dateCreated = course.created;
                            }
                            return course;
                        });
                    }
                } catch (e) {
                    console.error('Error loading community courses from localStorage:', e);
                }
                
                // Set the community courses from loaded data
                communityCourses = loadedCourses;
                
                // Update the grid with loaded courses
                updateCommunityGrid();
                
                // Set up filter and sort button listeners
                setupCommunityFilterListeners();
                
                // If no courses found, show empty state
                if (communityCourses.length === 0) {
                    communityGrid.innerHTML = `
                        <div class="empty-state">
                            <h3>No courses available yet</h3>
                            <p>Be the first to create and share a course!</p>
                            <button class="menu-button" onclick="window.location.href='builder.html'">Create A Course</button>
                        </div>
                    `;
                }
            }, 500);
        }
    }
    
    // Generate mock community courses (for development/demo purposes)
    function generateMockCommunityCourses() {
        // This function is kept for development purposes but is no longer used
        const mockCourses = [];
        const courseCount = 15; // Generate 15 mock courses
        
        // Random course elements
        const prefixes = ['Amazing', 'Challenging', 'Super', 'Ultimate', 'Extreme', 'Basic', 'Simple', 'Hard'];
        const suffixes = ['Parkour', 'Maze', 'Jump', 'Climb', 'Obstacle Course', 'Adventure', 'Challenge'];
        const authors = ['SkyBuilder', 'MasterCreator', 'ObstaclePro', 'JumpKing', 'DesignWizard', 'ParkourQueen'];
        
        for (let i = 1; i <= courseCount; i++) {
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            const author = authors[Math.floor(Math.random() * authors.length)];
            const plays = Math.floor(Math.random() * 1000);
            const likes = Math.floor(Math.random() * plays * 0.7); // Some percentage of plays are likes
            const difficulty = ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)];
            const daysAgo = Math.floor(Math.random() * 60); // Random days ago (0-60)
            
            const creationDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
            
            mockCourses.push({
                id: 1000 + i,
                title: `${prefix} ${suffix}`,
                description: `A ${difficulty.toLowerCase()} ${suffix.toLowerCase()} with unique challenges`,
                difficulty: difficulty,
                author: author,
                thumbnailClass: `course-thumbnail-${1 + Math.floor(Math.random() * 8)}`,
                plays: plays,
                likes: likes,
                created: creationDate.toISOString(), // Store as ISO string for consistency
                dateCreated: creationDate.toISOString(), // Add dateCreated for compatibility
                data: {
                    // A simplified representation of course data
                    blocks: Array(50).fill(null).map(() => ({
                        x: Math.floor(Math.random() * 50) - 25,
                        y: Math.floor(Math.random() * 10),
                        z: Math.floor(Math.random() * 50) - 25,
                        type: Math.random() > 0.7 ? 
                            ['ice', 'bouncy', 'sticky'][Math.floor(Math.random() * 3)] : 
                            'regular'
                    })),
                    startMarker: { x: 0, y: 0.1, z: 3 },
                    finishMarker: { x: 20, y: 0.1, z: 20 }
                }
            });
        }
        
        return mockCourses;
    }
    
    // Set up filter and sort button listeners for community courses
    function setupCommunityFilterListeners() {
        // Difficulty filter buttons
        const filterButtons = document.querySelectorAll('#community-filters .filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all filter buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get filter value
                currentFilter = this.getAttribute('data-filter');
                currentPage = 1;
                
                // Apply filter
                updateCommunityGrid();
            });
        });
        
        // Sort buttons
        const sortButtons = document.querySelectorAll('.sort-btn');
        sortButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all sort buttons
                sortButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get sort value
                currentSort = this.getAttribute('data-sort');
                
                // Apply sorting
                updateCommunityGrid();
            });
        });
    }
    
    // Update the community grid with filtered and sorted courses
    function updateCommunityGrid() {
        // Clear grid
        communityGrid.innerHTML = '';
        
        // Filter courses
        let filteredCourses = communityCourses.filter(course => {
            // Apply difficulty filter
            if (currentFilter !== 'all' && course.difficulty !== currentFilter) {
                return false;
            }
            
            // Apply search query
            if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            
            return true;
        });
        
        // Sort courses
        filteredCourses.sort((a, b) => {
            switch (currentSort) {
                case 'newest':
                    return b.created - a.created;
                case 'popular':
                    return b.plays - a.plays;
                case 'rating':
                    return b.likes - a.likes;
                default:
                    return 0;
            }
        });
        
        // Update pagination
        totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
        currentPage = Math.min(currentPage, totalPages);
        currentPage = Math.max(1, currentPage);
        
        // Update pagination controls
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        
        // If no courses match filters, show empty state
        if (filteredCourses.length === 0) {
            if (communityCourses.length === 0) {
                // No courses available at all
                communityGrid.innerHTML = `
                    <div class="empty-state">
                        <h3>No courses available yet</h3>
                        <p>Be the first to create and share a course!</p>
                        <button class="menu-button" onclick="window.location.href='builder.html'">Create A Course</button>
                    </div>
                `;
            } else {
                // Courses exist, but none match the current filters
                communityGrid.innerHTML = `
                    <div class="empty-state">
                        <h3>No courses found</h3>
                        <p>Try different search terms or filters</p>
                        <button class="menu-button refresh-btn">Reset Filters</button>
                    </div>
                `;
                
                // Add event listener to reset filters button
                const resetButton = communityGrid.querySelector('.refresh-btn');
                if (resetButton) {
                    resetButton.addEventListener('click', function() {
                        // Reset filters to default
                        currentFilter = 'all';
                        currentSort = 'newest';
                        searchQuery = '';
                        courseSearch.value = '';
                        
                        // Reset active classes on filter/sort buttons
                        document.querySelectorAll('#community-filters .filter-btn').forEach(btn => {
                            btn.classList.remove('active');
                            if (btn.getAttribute('data-filter') === 'all') {
                                btn.classList.add('active');
                            }
                        });
                        
                        document.querySelectorAll('.sort-btn').forEach(btn => {
                            btn.classList.remove('active');
                            if (btn.getAttribute('data-sort') === 'newest') {
                                btn.classList.add('active');
                            }
                        });
                        
                        // Update grid with reset filters
                        updateCommunityGrid();
                    });
                }
            }
            return;
        }
        
        // Get current page of courses
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredCourses.length);
        const currentPageCourses = filteredCourses.slice(startIndex, endIndex);
        
        // Add course elements to grid
        currentPageCourses.forEach(course => {
            const courseElement = createCommunityCourseElement(course);
            communityGrid.appendChild(courseElement);
        });
    }
    
    // Create a community course element
    function createCommunityCourseElement(course) {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'community-course-item';
        courseDiv.dataset.courseId = course.id;
        
        // Use both created and dateCreated fields for compatibility
        const dateValue = course.created || course.dateCreated;
        const dateString = formatTimeAgo(dateValue);
        
        // Create course HTML
        courseDiv.innerHTML = `
            <div class="course-thumbnail ${course.thumbnailClass}">
                <div class="course-difficulty">${course.difficulty}</div>
            </div>
            <div class="course-title">${course.title}</div>
            <div class="course-description">${course.description}</div>
            <div class="course-meta">
                <div class="course-author">
                    <div class="course-author-icon">${course.author.charAt(0)}</div>
                    ${course.author}
                </div>
                <div class="created-date">${dateString}</div>
            </div>
            <div class="course-stats">
                <div class="plays-count">
                    <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    ${course.plays} plays
                </div>
                <div class="likes-count">
                    <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    ${course.likes || 0} likes
                </div>
            </div>
            <div class="course-actions">
                <button class="play-course-btn">Play</button>
                <button class="leaderboard-btn">Leaderboard</button>
            </div>
        `;
        
        // Add play button click event
        const playButton = courseDiv.querySelector('.play-course-btn');
        playButton.addEventListener('click', function(e) {
            e.stopPropagation();
            playCourse(course);
        });
        
        // Add leaderboard button click event
        const leaderboardButton = courseDiv.querySelector('.leaderboard-btn');
        leaderboardButton.addEventListener('click', function(e) {
            e.stopPropagation();
            if (window.leaderboardManager) {
                window.leaderboardManager.showLeaderboardOverlay(course.id, course.title);
            }
        });
        
        // Also add click event to the entire course item to play it
        courseDiv.addEventListener('click', function() {
            playCourse(course);
        });
        
        return courseDiv;
    }
    
    // Format time ago for dates
    function formatTimeAgo(date) {
        if (!date) return 'Unknown';
        
        const now = new Date();
        const dateObj = new Date(date);
        
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) return 'Invalid date';
        
        const seconds = Math.floor((now - dateObj) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (seconds < 60) {
            return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
        } else if (minutes < 60) {
            return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
        } else if (hours < 24) {
            return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        } else if (days < 30) {
            return days === 1 ? '1 day ago' : `${days} days ago`;
        } else if (months < 12) {
            return months === 1 ? '1 month ago' : `${months} months ago`;
        } else {
            return years === 1 ? '1 year ago' : `${years} years ago`;
        }
    }
    
    // Update all timestamps in the community grid
    function updateAllTimestamps() {
        const timestampElements = document.querySelectorAll('.created-date');
        timestampElements.forEach(element => {
            const courseId = element.closest('.community-course-item')?.dataset.courseId;
            if (courseId) {
                const course = communityCourses.find(c => String(c.id) === String(courseId));
                if (course) {
                    // Use both created and dateCreated fields for compatibility
                    const dateValue = course.created || course.dateCreated;
                    element.textContent = formatTimeAgo(dateValue);
                }
            }
        });
    }
    
    // Set up timer to refresh timestamps
    function setupTimestampRefresh() {
        // Initial update
        updateAllTimestamps();
        
        // Update every minute
        setInterval(updateAllTimestamps, 60000);
    }
    
    // Connect to WebSocket server
    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
        const wsUrl = `${protocol}//${host}:${port}`;
        
        console.log(`Connecting to WebSocket at ${wsUrl}`);
        
        // Create WebSocket connection
        websocket = new WebSocket(wsUrl);
        
        // Connection opened
        websocket.addEventListener('open', (event) => {
            console.log('Connected to WebSocket server');
            // Request community courses
            requestCommunityCourses();
        });
        
        // Listen for messages
        websocket.addEventListener('message', (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('Message from server:', message);
                
                if (message.type === 'communityCourses') {
                    // Handle community courses data
                    handleCommunityCourses(message.data);
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error);
            }
        });
        
        // Connection closed
        websocket.addEventListener('close', (event) => {
            console.log('Disconnected from WebSocket server, code:', event.code, 'reason:', event.reason);
            // Try to reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000);
        });
        
        // Connection error
        websocket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }
    
    // Request community courses from server
    function requestCommunityCourses() {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'getCommunityCourses'
            }));
        } else {
            console.error('WebSocket not connected, cannot request community courses');
        }
    }
    
    // Handle community courses data from server
    function handleCommunityCourses(courses) {
        if (!Array.isArray(courses)) {
            console.error('Received invalid community courses data:', courses);
            return;
        }
        
        console.log('Received community courses from server:', courses.length);
        
        // Update local courses with server data
        communityCourses = courses;
        
        // Save to localStorage for offline access
        localStorage.setItem('communityCourses', JSON.stringify(communityCourses));
        
        // Update the display
        updateCommunityGrid();
        
        // Set up filter and sort button listeners if not already setup
        setupCommunityFilterListeners();
    }
    
    // Update course stats with the server
    function updateCourseStats(courseId, incrementPlays = true, incrementLikes = false) {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'updateCourseStats',
                courseId: courseId,
                incrementPlays: incrementPlays,
                incrementLikes: incrementLikes
            }));
        } else {
            // Fallback to local update if WebSocket is not available
            try {
                const communityCourses = JSON.parse(localStorage.getItem('communityCourses') || '[]');
                const courseIndex = communityCourses.findIndex(course => course.id == courseId);
                
                if (courseIndex !== -1) {
                    if (incrementPlays) {
                        communityCourses[courseIndex].plays = (communityCourses[courseIndex].plays || 0) + 1;
                    }
                    
                    if (incrementLikes) {
                        communityCourses[courseIndex].likes = (communityCourses[courseIndex].likes || 0) + 1;
                    }
                    
                    localStorage.setItem('communityCourses', JSON.stringify(communityCourses));
                }
            } catch (error) {
                console.error('Error updating course stats locally:', error);
            }
        }
    }
    
    // Publish a course to the server
    function publishCourse(course) {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'publishCourse',
                course: course
            }));
        } else {
            console.error('WebSocket not connected, cannot publish course');
            // Fallback to local storage only
            try {
                const communityCourses = JSON.parse(localStorage.getItem('communityCourses') || '[]');
                const existingIndex = communityCourses.findIndex(c => c.id === course.id);
                
                if (existingIndex >= 0) {
                    communityCourses[existingIndex] = course;
                } else {
                    communityCourses.push(course);
                }
                
                localStorage.setItem('communityCourses', JSON.stringify(communityCourses));
            } catch (error) {
                console.error('Error publishing course locally:', error);
            }
        }
    }
}); 
