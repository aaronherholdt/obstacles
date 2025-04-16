const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Create Express app
const app = express();

// Serve static files
app.use(express.static(__dirname));

// Handle all routes by serving index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create HTTP server using Express app
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Store leaderboards in memory
let leaderboards = {};

// Store community courses in memory
let communityCourses = {
    courses: [],
    nextId: 1000
};

// Path for storing leaderboard data
const leaderboardsPath = path.join(__dirname, 'leaderboards.json');

// Path for storing community courses data
const communityCoursesPath = path.join(__dirname, 'community-courses-index.json');

// Load existing leaderboard data if available
try {
    if (fs.existsSync(leaderboardsPath)) {
        const data = fs.readFileSync(leaderboardsPath, 'utf8');
        try {
            leaderboards = JSON.parse(data);
            console.log('Leaderboards loaded from file:', JSON.stringify(leaderboards, null, 2));
            
            // Validate the loaded data structure
            if (typeof leaderboards !== 'object') {
                console.error('Invalid leaderboards data format, resetting to empty object');
                leaderboards = {};
            }
            
            // Create backup of current leaderboards file
            const backupPath = `${leaderboardsPath}.backup`;
            fs.writeFileSync(backupPath, data, 'utf8');
            console.log('Created backup of leaderboards file');
        } catch (parseError) {
            console.error('Error parsing leaderboards JSON:', parseError);
            console.log('Using empty leaderboards and backing up corrupted file');
            
            // Backup the corrupted file
            const corruptedPath = `${leaderboardsPath}.corrupted`;
            fs.writeFileSync(corruptedPath, data, 'utf8');
            
            // Reset to empty leaderboards
            leaderboards = {};
        }
    } else {
        console.log('No existing leaderboards found. Starting with empty leaderboards.');
        leaderboards = {}; // Explicitly set to empty object
        saveLeaderboards(); // Create the initial empty file
    }
} catch (error) {
    console.error('Error loading leaderboards:', error);
    leaderboards = {};
}

// Load existing community courses data if available
try {
    if (fs.existsSync(communityCoursesPath)) {
        const data = fs.readFileSync(communityCoursesPath, 'utf8');
        try {
            communityCourses = JSON.parse(data);
            console.log('Community courses loaded from file:', JSON.stringify(communityCourses, null, 2));
            
            // Validate the loaded data structure
            if (!communityCourses.courses || !Array.isArray(communityCourses.courses)) {
                console.error('Invalid community courses data format, resetting to empty array');
                communityCourses = { courses: [], nextId: 1000 };
            }
            
            // Create backup of current community courses file
            const backupPath = `${communityCoursesPath}.backup`;
            fs.writeFileSync(backupPath, data, 'utf8');
            console.log('Created backup of community courses file');
        } catch (parseError) {
            console.error('Error parsing community courses JSON:', parseError);
            console.log('Using empty community courses and backing up corrupted file');
            
            // Backup the corrupted file
            const corruptedPath = `${communityCoursesPath}.corrupted`;
            fs.writeFileSync(corruptedPath, data, 'utf8');
            
            // Reset to empty community courses
            communityCourses = { courses: [], nextId: 1000 };
        }
    } else {
        console.log('No existing community courses found. Starting with empty courses.');
        communityCourses = { courses: [], nextId: 1000 }; 
        saveCommunityCourses(); // Create the initial empty file
    }
} catch (error) {
    console.error('Error loading community courses:', error);
    communityCourses = { courses: [], nextId: 1000 };
}

// Save leaderboards to file
function saveLeaderboards() {
    try {
        fs.writeFileSync(leaderboardsPath, JSON.stringify(leaderboards, null, 2), 'utf8');
        console.log('Leaderboards saved to file:', JSON.stringify(leaderboards, null, 2));
    } catch (error) {
        console.error('Error saving leaderboards:', error);
    }
}

// Save community courses to file
function saveCommunityCourses() {
    try {
        fs.writeFileSync(communityCoursesPath, JSON.stringify(communityCourses, null, 2), 'utf8');
        console.log('Community courses saved to file');
    } catch (error) {
        console.error('Error saving community courses:', error);
    }
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send the current leaderboards to the new client
    ws.send(JSON.stringify({
        type: 'leaderboards',
        data: leaderboards
    }));
    
    // Send the current community courses to the new client
    ws.send(JSON.stringify({
        type: 'communityCourses',
        data: communityCourses.courses
    }));
    
    // Handle messages from clients
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);
            
            switch (data.type) {
                case 'submitScore':
                    handleScoreSubmission(data.courseId, data.playerName, data.time, data.date);
                    break;
                    
                case 'getLeaderboard':
                    sendLeaderboard(ws, data.courseId);
                    break;
                
                case 'getLeaderboards':
                    sendAllLeaderboards(ws);
                    break;
                    
                case 'saveLeaderboards':
                    handleSaveLeaderboards(data.data);
                    break;
                
                case 'publishCourse':
                    handlePublishCourse(data.course);
                    break;
                
                case 'getCommunityCourses':
                    sendCommunityCourses(ws);
                    break;
                
                case 'updateCourseStats':
                    updateCourseStats(data.courseId, data.incrementPlays, data.incrementLikes);
                    break;
                    
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Handle score submission
function handleScoreSubmission(courseId, playerName, time, date) {
    if (!courseId || !playerName || !time) {
        console.error('Invalid score submission data');
        return;
    }
    
    // Initialize leaderboard for this course if it doesn't exist
    if (!leaderboards[courseId]) {
        leaderboards[courseId] = [];
    }
    
    // Add the new score
    leaderboards[courseId].push({
        playerName,
        time,
        date: date || new Date().toISOString()
    });
    
    // Sort by time (ascending)
    leaderboards[courseId].sort((a, b) => a.time - b.time);
    
    // Limit to top 10 scores
    if (leaderboards[courseId].length > 10) {
        leaderboards[courseId] = leaderboards[courseId].slice(0, 10);
    }
    
    // Save updated leaderboards
    saveLeaderboards();
    
    // Broadcast the updated leaderboard to all clients
    broadcastLeaderboard(courseId);
}

// Handle course publishing
function handlePublishCourse(course) {
    if (!course) {
        console.error('Invalid course data');
        return;
    }
    
    // Check if course already exists (update it) or is new (add it)
    const existingIndex = communityCourses.courses.findIndex(c => String(c.id) === String(course.id));
    
    if (existingIndex >= 0) {
        // Update existing course
        communityCourses.courses[existingIndex] = course;
    } else {
        // Assign a new ID if not provided
        if (!course.id) {
            course.id = communityCourses.nextId++;
        }
        
        // Ensure created timestamp
        if (!course.created) {
            course.created = new Date().toISOString();
        }
        if (!course.dateCreated) {
            course.dateCreated = course.created;
        }
        
        // Add new course
        communityCourses.courses.push(course);
    }
    
    // Save and broadcast update
    saveCommunityCourses();
    broadcastCommunityCourses();
}

// Update course statistics (plays and likes)
function updateCourseStats(courseId, incrementPlays = false, incrementLikes = false) {
    const courseIndex = communityCourses.courses.findIndex(c => String(c.id) === String(courseId));
    
    if (courseIndex >= 0) {
        if (incrementPlays) {
            communityCourses.courses[courseIndex].plays = 
                (communityCourses.courses[courseIndex].plays || 0) + 1;
        }
        
        if (incrementLikes) {
            communityCourses.courses[courseIndex].likes = 
                (communityCourses.courses[courseIndex].likes || 0) + 1;
        }
        
        // Save and broadcast update
        saveCommunityCourses();
        broadcastCommunityCourses();
    }
}

// Send leaderboard for a specific course to a client
function sendLeaderboard(ws, courseId) {
    const leaderboardData = leaderboards[courseId] || [];
    
    ws.send(JSON.stringify({
        type: 'leaderboard',
        courseId: courseId,
        data: leaderboardData
    }));
}

// Send all community courses to a client
function sendCommunityCourses(ws) {
    ws.send(JSON.stringify({
        type: 'communityCourses',
        data: communityCourses.courses
    }));
}

// Broadcast leaderboard update to all connected clients
function broadcastLeaderboard(courseId) {
    const leaderboardData = leaderboards[courseId] || [];
    
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'leaderboard',
                courseId: courseId,
                data: leaderboardData
            }));
        }
    });
}

// Broadcast community courses update to all connected clients
function broadcastCommunityCourses() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'communityCourses',
                data: communityCourses.courses
            }));
        }
    });
}

// Send all leaderboards to a client
function sendAllLeaderboards(ws) {
    ws.send(JSON.stringify({
        type: 'leaderboards',
        data: leaderboards
    }));
}

// Handle saving leaderboards from client
function handleSaveLeaderboards(newLeaderboards) {
    if (!newLeaderboards || typeof newLeaderboards !== 'object') {
        console.error('Invalid leaderboards data received');
        return;
    }
    
    // Merge the new leaderboards with existing ones
    // (keeping existing entries if they're not in the new data)
    for (const courseId in newLeaderboards) {
        if (!leaderboards[courseId]) {
            leaderboards[courseId] = [];
        }
        
        // Add new entries
        newLeaderboards[courseId].forEach(newEntry => {
            // Check if entry already exists to avoid duplicates
            const exists = leaderboards[courseId].some(existingEntry => 
                existingEntry.playerName === newEntry.playerName && 
                existingEntry.time === newEntry.time && 
                existingEntry.date === newEntry.date
            );
            
            if (!exists) {
                leaderboards[courseId].push(newEntry);
            }
        });
        
        // Sort and limit entries
        leaderboards[courseId].sort((a, b) => a.time - b.time);
        if (leaderboards[courseId].length > 10) {
            leaderboards[courseId] = leaderboards[courseId].slice(0, 10);
        }
    }
    
    // Save updated leaderboards to file
    saveLeaderboards();
    
    // Broadcast updated leaderboards to all clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            sendAllLeaderboards(client);
        }
    });
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});

// Set up interval to auto-save data every 5 minutes
setInterval(() => {
    console.log('Auto-saving data...');
    saveLeaderboards();
    saveCommunityCourses();
}, 5 * 60 * 1000); // 5 minutes in milliseconds 
