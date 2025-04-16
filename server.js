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

// Path for storing leaderboard data
const leaderboardsPath = path.join(__dirname, 'leaderboards.json');

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

// Save leaderboards to file
function saveLeaderboards() {
    try {
        fs.writeFileSync(leaderboardsPath, JSON.stringify(leaderboards, null, 2), 'utf8');
        console.log('Leaderboards saved to file:', JSON.stringify(leaderboards, null, 2));
    } catch (error) {
        console.error('Error saving leaderboards:', error);
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

// Send leaderboard for a specific course to a client
function sendLeaderboard(ws, courseId) {
    const leaderboardData = leaderboards[courseId] || [];
    
    ws.send(JSON.stringify({
        type: 'leaderboard',
        courseId: courseId,
        data: leaderboardData
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

// Set up interval to auto-save leaderboards every 5 minutes
setInterval(() => {
    console.log('Auto-saving leaderboards...');
    saveLeaderboards();
}, 5 * 60 * 1000); // 5 minutes in milliseconds 
