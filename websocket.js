// Initialize WebSocket connection
function initializeWebSocket() {
    // Use the same host and protocol, but switch to WebSocket protocol
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const wsUrl = `${protocol}${host}${port}`;
    
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    
    // Create WebSocket connection
    window.socket = new WebSocket(wsUrl);
    
    // Connection opened
    window.socket.addEventListener('open', (event) => {
        console.log('WebSocket connection established');
    });
    
    // Listen for messages
    window.socket.addEventListener('message', (event) => {
        try {
            const message = JSON.parse(event.data);
            console.log('WebSocket message received:', message.type);
            
            // Handle different message types
            switch (message.type) {
                case 'leaderboards':
                    handleLeaderboardsMessage(message);
                    break;
                    
                case 'leaderboard':
                    handleLeaderboardMessage(message);
                    break;
                    
                case 'communityCourses':
                    handleCommunityCoursesMessage(message);
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    });
    
    // Connection closed
    window.socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed');
        
        // Try to reconnect after a delay
        setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            initializeWebSocket();
        }, 5000);
    });
    
    // Connection error
    window.socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
    });
    
    // Return the socket instance
    return window.socket;
}

// Handle leaderboards message
function handleLeaderboardsMessage(message) {
    if (typeof window.onLeaderboardsReceived === 'function') {
        window.onLeaderboardsReceived(message.data);
    }
}

// Handle single leaderboard message
function handleLeaderboardMessage(message) {
    if (typeof window.onLeaderboardReceived === 'function') {
        window.onLeaderboardReceived(message.courseId, message.data);
    }
}

// Handle community courses message
function handleCommunityCoursesMessage(message) {
    if (typeof window.onCommunityCoursesReceived === 'function') {
        window.onCommunityCoursesReceived(message.data);
    } else if (typeof handleSocketMessage === 'function') {
        // For backward compatibility
        handleSocketMessage({ data: JSON.stringify(message) });
    } else {
        console.log('Community courses received, but no handler is defined');
        
        // Store the courses in localStorage as fallback
        try {
            localStorage.setItem('communityCourses', JSON.stringify(message.data));
            console.log('Saved community courses to localStorage');
        } catch (error) {
            console.error('Error saving community courses to localStorage:', error);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
}); 