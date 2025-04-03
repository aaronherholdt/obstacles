/**
 * Leaderboard functionality for the Obstacle Course Challenge
 * Manages WebSocket connections and leaderboard UI
 */

class LeaderboardManager {
    constructor() {
        // WebSocket connection
        this.socket = null;
        
        // Fallback mode for when server is unavailable
        this.useLocalStorage = false;
        
        // Current course ID
        this.currentCourseId = null;
        
        // Connect to WebSocket server
        this.connect();
    }
    
    // Connect to WebSocket server
    connect() {
        // Use secure WebSocket in production, regular in development
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const host = window.location.hostname === 'localhost' ? 'localhost:3000' : window.location.host;
        
        // Update UI to show connecting status
        this.updateConnectionStatus('connecting');
        
        try {
            // Create WebSocket connection
            this.socket = new WebSocket(`${protocol}${host}`);
            
            console.log(`Attempting to connect to: ${protocol}${host}`);
            
            // Setup event handlers
            this.socket.onopen = () => {
                console.log('Connected to leaderboard server');
                this.useLocalStorage = false;
                
                // Update UI to show connected status
                this.updateConnectionStatus('connected');
                
                // Request all leaderboards upon connection
                this.socket.send(JSON.stringify({
                    type: 'getLeaderboards'
                }));
                
                // If we have a current course ID, request its leaderboard
                if (this.currentCourseId) {
                    this.getLeaderboard(this.currentCourseId);
                }
            };
            
            this.socket.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('error');
                this.fallbackToLocalStorage();
            };
            
            this.socket.onclose = (event) => {
                console.log('Disconnected from leaderboard server:', event.code, event.reason);
                this.updateConnectionStatus('disconnected');
                this.fallbackToLocalStorage();
                
                // Attempt to reconnect after delay (if not a normal closure)
                if (event.code !== 1000) {
                    console.log('Attempting to reconnect in 5 seconds...');
                    setTimeout(() => this.connect(), 5000);
                }
            };
        } catch (error) {
            console.error('Failed to connect to leaderboard server:', error);
            this.fallbackToLocalStorage();
            
            // Attempt to reconnect after delay
            console.log('Attempting to reconnect in 5 seconds...');
            setTimeout(() => this.connect(), 5000);
        }
    }
    
    // Handle messages from the server
    handleMessage(message) {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'leaderboards':
                    // Received all leaderboards
                    this.updateLocalStorage(data.data);
                    if (this.currentCourseId) {
                        this.updateLeaderboardUI(data.data[this.currentCourseId] || []);
                    }
                    break;
                    
                case 'leaderboard':
                    // Received specific leaderboard
                    if (data.courseId === this.currentCourseId) {
                        this.updateLeaderboardUI(data.data);
                    }
                    
                    // Update local storage with the specific leaderboard data
                    const leaderboards = this.getLeaderboardsFromLocalStorage();
                    leaderboards[data.courseId] = data.data;
                    this.updateLocalStorage(leaderboards);
                    break;
                    
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
    
    // Submit a score to the leaderboard
    submitScore(courseId, playerName, time) {
        if (!courseId || !playerName || !time) {
            console.error('Invalid score data');
            return;
        }
        
        // Format the data
        const scoreData = {
            type: 'submitScore',
            courseId: courseId,
            playerName: playerName,
            time: time,
            date: new Date().toISOString()
        };
        
        // Make sure we're tracking the current course ID
        this.currentCourseId = courseId;
        
        // If connected to WebSocket, send score to server
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(scoreData));
            
            // For immediate feedback, also update locally and show UI
            // (server will eventually broadcast the updated data)
            this.submitScoreLocally(courseId, playerName, time);
            
            // Request updated leaderboard from server
            setTimeout(() => {
                this.getLeaderboard(courseId);
            }, 500);
        } else {
            // Fallback to local storage
            this.submitScoreLocally(courseId, playerName, time);
        }
    }
    
    // Submit score to local storage when offline
    submitScoreLocally(courseId, playerName, time) {
        // Get current leaderboards
        const leaderboards = this.getLeaderboardsFromLocalStorage();
        
        // Initialize leaderboard for this course if it doesn't exist
        if (!leaderboards[courseId]) {
            leaderboards[courseId] = [];
        }
        
        // Add the new score
        leaderboards[courseId].push({
            playerName,
            time,
            date: new Date().toISOString()
        });
        
        // Sort by time (ascending)
        leaderboards[courseId].sort((a, b) => a.time - b.time);
        
        // Limit to top 10 scores
        if (leaderboards[courseId].length > 10) {
            leaderboards[courseId] = leaderboards[courseId].slice(0, 10);
        }
        
        // Save updated leaderboards
        this.updateLocalStorage(leaderboards);
        
        // Update UI
        this.updateLeaderboardUI(leaderboards[courseId]);
    }
    
    // Request leaderboard for a specific course
    getLeaderboard(courseId) {
        this.currentCourseId = courseId;
        
        // If connected to WebSocket, request from server
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'getLeaderboard',
                courseId: courseId
            }));
        } else {
            // Fallback to local storage
            const leaderboards = this.getLeaderboardsFromLocalStorage();
            this.updateLeaderboardUI(leaderboards[courseId] || []);
        }
    }
    
    // Retrieve leaderboards from local storage
    getLeaderboardsFromLocalStorage() {
        try {
            const data = localStorage.getItem('obstacleLeaderboards');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error reading leaderboards from local storage:', error);
            return {};
        }
    }
    
    // Update local storage with new leaderboard data
    updateLocalStorage(leaderboards) {
        try {
            localStorage.setItem('obstacleLeaderboards', JSON.stringify(leaderboards));
        } catch (error) {
            console.error('Error saving leaderboards to local storage:', error);
        }
    }
    
    // Fallback to local storage when server is unavailable
    fallbackToLocalStorage() {
        console.log('Using local storage for leaderboards');
        this.useLocalStorage = true;
        
        // If we have a current course ID, display its leaderboard
        if (this.currentCourseId) {
            const leaderboards = this.getLeaderboardsFromLocalStorage();
            this.updateLeaderboardUI(leaderboards[this.currentCourseId] || []);
        }
    }
    
    // Format time for display (MM:SS.d)
    formatTime(milliseconds) {
        const totalSeconds = milliseconds / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const deciseconds = Math.floor((totalSeconds % 1) * 10);
        
        // Format with leading zeros
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        
        return `${formattedMinutes}:${formattedSeconds}.${deciseconds}`;
    }
    
    // Update the leaderboard UI
    updateLeaderboardUI(leaderboardData) {
        // Find the leaderboard container
        const leaderboardContainer = document.getElementById('leaderboard-container');
        if (!leaderboardContainer) {
            return;
        }
        
        // Clear existing entries
        leaderboardContainer.innerHTML = '';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'leaderboard-header';
        header.innerHTML = `
            <div class="leaderboard-rank">Rank</div>
            <div class="leaderboard-player">Player</div>
            <div class="leaderboard-time">Time</div>
            <div class="leaderboard-date">Date</div>
        `;
        leaderboardContainer.appendChild(header);
        
        // No scores message
        if (leaderboardData.length === 0) {
            const noScores = document.createElement('div');
            noScores.className = 'no-scores';
            noScores.textContent = 'No scores recorded yet. Be the first!';
            leaderboardContainer.appendChild(noScores);
            return;
        }
        
        // Add each entry
        leaderboardData.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'leaderboard-entry';
            
            // Highlight if it's a top 3 entry
            if (index < 3) {
                entryElement.classList.add(`rank-${index + 1}`);
            }
            
            // Format the date
            const date = new Date(entry.date);
            const formattedDate = `${date.toLocaleDateString()}`;
            
            entryElement.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-player">${entry.playerName}</div>
                <div class="leaderboard-time">${this.formatTime(entry.time)}</div>
                <div class="leaderboard-date">${formattedDate}</div>
            `;
            leaderboardContainer.appendChild(entryElement);
        });
    }
    
    // Show the leaderboard overlay
    showLeaderboardOverlay(courseId, courseName) {
        // Create overlay if it doesn't exist
        let overlay = document.getElementById('leaderboard-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'leaderboard-overlay';
            overlay.className = 'overlay';
            
            const content = document.createElement('div');
            content.className = 'overlay-content';
            
            // Title with course name
            const title = document.createElement('h2');
            title.id = 'leaderboard-title';
            content.appendChild(title);
            
            // Leaderboard container
            const leaderboardContainer = document.createElement('div');
            leaderboardContainer.id = 'leaderboard-container';
            content.appendChild(leaderboardContainer);
            
            // Connection status
            const connectionStatus = document.createElement('div');
            connectionStatus.id = 'connection-status';
            content.appendChild(connectionStatus);
            
            // Close button
            const closeButton = document.createElement('button');
            closeButton.id = 'closeLeaderboardButton';
            closeButton.className = 'menu-button';
            closeButton.textContent = 'Close';
            closeButton.addEventListener('click', () => this.hideLeaderboardOverlay());
            content.appendChild(closeButton);
            
            overlay.appendChild(content);
            document.body.appendChild(overlay);
        }
        
        // Update leaderboard title
        const title = document.getElementById('leaderboard-title');
        title.textContent = courseName ? `Leaderboard: ${courseName}` : 'Leaderboard';
        
        // Update connection status
        if (this.useLocalStorage) {
            this.updateConnectionStatus('offline');
        } else if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.updateConnectionStatus('connected');
        } else if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
            this.updateConnectionStatus('connecting');
        } else {
            this.updateConnectionStatus('offline');
        }
        
        // Get leaderboard data - always request fresh data from server if connected
        this.currentCourseId = courseId;
        // Call getLeaderboard to properly fetch and display the leaderboard data
        this.getLeaderboard(courseId);
        
        // Show the overlay
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }
    
    // Hide the leaderboard overlay
    hideLeaderboardOverlay() {
        const overlay = document.getElementById('leaderboard-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }
    
    // Update connection status
    updateConnectionStatus(status) {
        const connectionStatus = document.getElementById('connection-status');
        if (!connectionStatus) return;
        
        let message = '';
        let className = '';
        
        switch (status) {
            case 'connected':
                message = 'Connected to leaderboard server.';
                className = 'online';
                break;
            case 'connecting':
                message = 'Connecting to leaderboard server...';
                className = 'connecting';
                break;
            case 'error':
                message = 'Error connecting to leaderboard server. Using local storage.';
                className = 'offline';
                break;
            case 'disconnected':
                message = 'Disconnected from leaderboard server. Using local storage.';
                className = 'offline';
                break;
            default:
                message = 'You are currently offline. Leaderboard data is stored locally.';
                className = 'offline';
        }
        
        connectionStatus.textContent = message;
        connectionStatus.className = className;
    }
}

// Create a global instance
window.leaderboardManager = new LeaderboardManager(); 
