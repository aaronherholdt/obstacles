// Utility functions for handling courses

// Generate a unique ID for a course
function generateCourseId() {
    return Date.now();
}

// Get the community courses from WebSocket or localStorage
function getCommunityCoursesAsync() {
    return new Promise((resolve) => {
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            // Set up a one-time listener for the response
            const messageHandler = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'communityCourses') {
                        window.socket.removeEventListener('message', messageHandler);
                        resolve(message.data);
                    }
                } catch (error) {
                    console.error('Error handling WebSocket message:', error);
                }
            };
            
            // Add the temporary listener
            window.socket.addEventListener('message', messageHandler);
            
            // Request courses from server
            window.socket.send(JSON.stringify({
                type: 'getCommunityCourses'
            }));
            
            // Set a timeout in case server doesn't respond
            setTimeout(() => {
                window.socket.removeEventListener('message', messageHandler);
                // Fall back to localStorage
                const storedCourses = localStorage.getItem('communityCourses');
                resolve(storedCourses ? JSON.parse(storedCourses) : []);
            }, 5000);
        } else {
            // Get from localStorage
            const storedCourses = localStorage.getItem('communityCourses');
            resolve(storedCourses ? JSON.parse(storedCourses) : []);
        }
    });
}

// Save a course to the community
function publishCourse(course) {
    return new Promise((resolve, reject) => {
        if (!course || !course.title || !course.author) {
            reject(new Error('Invalid course data'));
            return;
        }
        
        // Generate a unique ID if not provided
        if (!course.id) {
            course.id = generateCourseId();
        }
        
        // Set created date if not provided
        if (!course.created) {
            course.created = new Date().toISOString();
        }
        
        // Set dateCreated for compatibility
        if (!course.dateCreated) {
            course.dateCreated = course.created;
        }
        
        // Initialize plays and likes if not provided
        if (typeof course.plays !== 'number') {
            course.plays = 0;
        }
        
        if (typeof course.likes !== 'number') {
            course.likes = 0;
        }
        
        // Publish via WebSocket if available
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            window.socket.send(JSON.stringify({
                type: 'publishCourse',
                course: course
            }));
            resolve(course);
        } else {
            // Fallback to localStorage
            console.warn('WebSocket not available, using localStorage fallback');
            getCommunityCoursesAsync().then(courses => {
                // Check if course already exists
                const existingIndex = courses.findIndex(c => c.id === course.id);
                if (existingIndex >= 0) {
                    courses[existingIndex] = course;
                } else {
                    courses.push(course);
                }
                
                // Save to localStorage
                localStorage.setItem('communityCourses', JSON.stringify(courses));
                resolve(course);
            });
        }
    });
}

// Update course stats
function updateCourseStats(courseId, field, value) {
    if (!courseId || !field) {
        console.error('Invalid course update data');
        return Promise.reject(new Error('Invalid course update data'));
    }
    
    if (window.socket && window.socket.readyState === WebSocket.OPEN) {
        window.socket.send(JSON.stringify({
            type: 'updateCourse',
            courseId: courseId,
            field: field,
            value: value
        }));
        return Promise.resolve();
    } else {
        // Fallback to localStorage
        return getCommunityCoursesAsync().then(courses => {
            const courseIndex = courses.findIndex(c => String(c.id) === String(courseId));
            if (courseIndex >= 0) {
                if (value === null) {
                    // Increment the current value
                    courses[courseIndex][field] = (courses[courseIndex][field] || 0) + 1;
                } else {
                    courses[courseIndex][field] = value;
                }
                localStorage.setItem('communityCourses', JSON.stringify(courses));
            }
        });
    }
}

// Make functions globally available
window.generateCourseId = generateCourseId;
window.getCommunityCoursesAsync = getCommunityCoursesAsync;
window.publishCourse = publishCourse;
window.updateCourseStats = updateCourseStats; 