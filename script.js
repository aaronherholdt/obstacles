// Import libraries
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MOUSE } from 'three'; // Import MOUSE enum
import { Character } from './character.js'; // Import Character class

// Variables for timer functionality
let timerStartTime = 0;
let timerInterval = null;
let elapsedTime = 0;
let timerDisplay = null;
let countdownInterval = null;
let isCountingDown = false;
let canCharacterMove = false; // Track whether the character can move

// Mobile detection function
function isMobileOrTablet() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Regular expressions for mobile and tablet detection
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const tabletRegex = /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i;
    
    // Check if touch is available
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return mobileRegex.test(userAgent) || tabletRegex.test(userAgent) || hasTouchScreen;
}

// Flag to track if we're on a mobile device
const isMobile = isMobileOrTablet();

// Mobile control variables
let joystickActive = false;
let joystickPosition = { x: 0, y: 0 };
let jumpButtonActive = false;
let lastDistance = 0;
let lastPointerDistance = 0;
let touchRotateActive = false;
let lastTouchX = 0;
let lastTouchY = 0;
let joystickSensitivity = 0.6; // New variable to control joystick sensitivity (values from 0.1 to 1.0)

// Check URL parameters to see if we should start in play mode
const urlParams = new URLSearchParams(window.location.search);
const startInPlayMode = urlParams.get('mode') === 'play';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10); // Start position

// Initialize game events system for communication between components
window.gameEvents = new EventTarget();

// Global variable for selected course
let selectedCourse = null;

// Listen for block destroyed events (for explosion blocks)
window.gameEvents.addEventListener('blockDestroyed', (event) => {
    const destroyedBlock = event.detail.block;
    // Remove from placedBlocks array
    const index = placedBlocks.indexOf(destroyedBlock);
    if (index !== -1) {
        placedBlocks.splice(index, 1);
    }
});

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional smooth damping
controls.dampingFactor = 0.05;
controls.minAzimuthAngle = -Infinity; // Allow full 360 horizontal rotation (Default)
controls.maxAzimuthAngle = Infinity;  // Allow full 360 horizontal rotation (Default)

// --- Configure Mouse Buttons ---
controls.mouseButtons = {
	LEFT: -1, // No action from OrbitControls for left mouse button
	MIDDLE: MOUSE.DOLLY, // Middle mouse button zooms (default)
	RIGHT: MOUSE.ROTATE // Right mouse button rotates/orbits
};
// --- End Mouse Button Configuration ---

// Enhance OrbitControls for mobile touch events in build mode
if (isMobile) {
    let touchStartDistance = 0;
    let touchStartRotation = 0;
    let touchPrevDistance = 0;
    
    // Add touch event listeners for pinch-to-rotate in build mode
    document.addEventListener('touchstart', handleBuildModeTouchStart, { passive: false });
    document.addEventListener('touchmove', handleBuildModeTouchMove, { passive: false });
    document.addEventListener('touchend', handleBuildModeTouchEnd, { passive: false });
    
    function handleBuildModeTouchStart(event) {
        // Only handle in build mode, not play mode
        if (isPlayMode) return;
        
        // Skip if touching UI elements
        if (isUIElement(event.target)) return;
        
        if (event.touches.length === 2) {
            // Get the two touch points
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            // Calculate the initial distance between touches
            touchStartDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            touchPrevDistance = touchStartDistance;
            
            // Calculate initial rotation angle
            touchStartRotation = Math.atan2(
                touch2.clientY - touch1.clientY,
                touch2.clientX - touch1.clientX
            );
            
            // Prevent default behavior
            event.preventDefault();
        }
    }
    
    function handleBuildModeTouchMove(event) {
        // Only handle in build mode, not play mode
        if (isPlayMode) return;
        
        if (event.touches.length === 2) {
            // Get the two touch points
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            // Calculate current distance
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            // Calculate current rotation angle
            const currentRotation = Math.atan2(
                touch2.clientY - touch1.clientY,
                touch2.clientX - touch1.clientX
            );
            
            // Calculate the difference from start
            const distanceDelta = currentDistance - touchPrevDistance;
            const rotationDelta = currentRotation - touchStartRotation;
            
            // Apply zoom effect based on pinch distance
            controls.dolly(distanceDelta > 0 ? 1.05 : 0.95);
            
            // Apply rotation effect based on the angle change
            controls.rotateLeft(-rotationDelta * 0.5);
            
            // Update previous distance
            touchPrevDistance = currentDistance;
            touchStartRotation = currentRotation;
            
            // Prevent default behavior
            event.preventDefault();
        }
    }
    
    function handleBuildModeTouchEnd(event) {
        // Only handle in build mode, not play mode
        if (isPlayMode) return;
        
        // Reset values
        touchStartDistance = 0;
        touchStartRotation = 0;
        touchPrevDistance = 0;
    }
}

// Prevent context menu from appearing when right-clicking
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Ground Plane
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Forest green
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
ground.position.y = 0; // Position at y=0 instead of -0.5
scene.add(ground);

// Create Checkered Texture for Start/Finish
function createCheckerTexture(color1, color2, size = 8) {
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const context = canvas.getContext('2d');
    
    // Draw checkerboard pattern
    for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 2; y++) {
            context.fillStyle = (x + y) % 2 === 0 ? color1 : color2;
            context.fillRect(x * size, y * size, size, size);
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    return texture;
}

// Create start and finish textures
const startTexture = createCheckerTexture('#00FF00', '#000000'); // Green and black
const finishTexture = createCheckerTexture('#FFFFFF', '#000000'); // White and black

// Block Geometry & Materials
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

// Different material types
const materialTypes = {
    regular: {
        material: new THREE.MeshStandardMaterial({ color: 0xFF8C00 }), // Orange
        properties: { type: 'regular' }
    },
    ice: {
        material: new THREE.MeshStandardMaterial({ 
            color: 0x87CEFA, 
            metalness: 0.7, 
            roughness: 0.1,
            envMapIntensity: 0.8
        }), // Light blue with very shiny reflective appearance
        properties: { type: 'ice', friction: 0.01 }
    },
    bouncy: {
        material: new THREE.MeshStandardMaterial({ 
            color: 0xFF4081, // Pink
            metalness: 0.1,
            roughness: 0.3
        }), 
        properties: { type: 'bouncy', bounciness: 1.2 }
    },
    sticky: {
        material: new THREE.MeshStandardMaterial({ 
            color: 0x8BC34A, // Green
            roughness: 0.95,
            metalness: 0.1,
            flatShading: true
        }),
        properties: { type: 'sticky', stickiness: 0.8 }
    },
    explosion: {
        material: new THREE.MeshStandardMaterial({ 
            color: 0xFF5722, // Orange-red
            emissive: 0xFF0000,
            emissiveIntensity: 0.5,
            metalness: 0.3,
            roughness: 0.7
        }),
        properties: { type: 'explosion', explosionTimer: 1500 } // Reduced time to explosion (ms)
    },
    teleport: {
        material: new THREE.MeshStandardMaterial({ 
            color: 0x9C27B0, // Purple
            emissive: 0x9C27B0,
            emissiveIntensity: 0.4,
            metalness: 0.5,
            roughness: 0.5
        }),
        properties: { type: 'teleport' }
    }
};

// Start and finish marker materials
const startMarkerMaterial = new THREE.MeshStandardMaterial({ 
    map: startTexture
});

const finishMarkerMaterial = new THREE.MeshStandardMaterial({ 
    map: finishTexture
});

// Marker geometries
const markerGeometry = new THREE.BoxGeometry(3, 0.2, 3); // Flat platform (3x3 units with height of 0.2)

// Current material selection
let currentMaterial = 'regular';

// Placeholder material (for showing where blocks will be placed/removed)
const placeholderMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    opacity: 0.5,
    transparent: true,
});

// Placeholder/Ghost Block
const placeholderCube = new THREE.Mesh(cubeGeometry, placeholderMaterial);
placeholderCube.position.set(0, -10, 0); // Start offscreen
placeholderCube.visible = false;
scene.add(placeholderCube);

// Placeholder for markers
const placeholderMarker = new THREE.Mesh(markerGeometry, placeholderMaterial);
placeholderMarker.position.set(0, -10, 0); // Start offscreen
placeholderMarker.visible = false;
scene.add(placeholderMarker);

// Arrays to hold placed objects
let placedBlocks = [];
let startMarker = null; // Reference to the current start marker
let finishMarker = null; // Reference to the current finish marker

// Mode management
let buildMode = 'place'; // Default: 'place', 'remove', 'placeStart', 'placeFinish'
let isPlayMode = false; // New flag for play mode

// UI Elements
const placeButton = document.getElementById('placeButton');
const removeButton = document.getElementById('removeButton');
const startMarkerButton = document.getElementById('startMarkerButton');
const finishMarkerButton = document.getElementById('finishMarkerButton');
const modeIndicator = document.getElementById('mode-indicator');

// Add a play button to the UI
const playButtonContainer = document.createElement('div');
playButtonContainer.id = 'play-button-container';
document.body.appendChild(playButtonContainer);

const playButton = document.createElement('button');
playButton.id = 'playButton';
playButton.className = 'tool-button';
playButton.title = 'Test Mode';
playButton.innerHTML = `
    <svg class="tool-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
    </svg>
`;
playButtonContainer.appendChild(playButton);

// Create a mode toggle button that switches between play and build mode
const modeToggleButton = document.createElement('button');
modeToggleButton.id = 'modeToggleButton';
modeToggleButton.innerHTML = `
    <svg class="mode-icon play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
    </svg>
    <span>Test Mode</span>
`;
modeToggleButton.style.backgroundColor = '#FF5252'; // Red for play
modeToggleButton.addEventListener('click', togglePlayMode);
document.body.appendChild(modeToggleButton);

// Material selector buttons
const material1Button = document.getElementById('material1');
const material2Button = document.getElementById('material2');
const material3Button = document.getElementById('material3');
const material4Button = document.getElementById('material4');
const material5Button = document.getElementById('material5');
const material6Button = document.getElementById('material6');
const saveButton = document.getElementById('saveButton');
const loadButton = document.getElementById('loadButton');

// Set up event listeners for UI buttons
placeButton.addEventListener('click', () => {
    setMode('place');
    // Show dropdown when place button is clicked
    document.getElementById('material-dropdown').classList.toggle('show');
});

removeButton.addEventListener('click', () => {
    setMode('remove');
    // Hide dropdown if it's open
    document.getElementById('material-dropdown').classList.remove('show');
});

startMarkerButton.addEventListener('click', () => {
    setMode('placeStart');
    // Hide dropdown if it's open
    document.getElementById('material-dropdown').classList.remove('show');
});

finishMarkerButton.addEventListener('click', () => {
    setMode('placeFinish');
    // Hide dropdown if it's open
    document.getElementById('material-dropdown').classList.remove('show');
});

saveButton.addEventListener('click', saveCourse);
loadButton.addEventListener('click', loadCourse);

// Set up event listeners for material selection in dropdown
material1Button.addEventListener('click', () => {
    setMaterial('regular');
    highlightSelectedMaterial('material1');
});

material2Button.addEventListener('click', () => {
    setMaterial('ice');
    highlightSelectedMaterial('material2');
});

material3Button.addEventListener('click', () => {
    setMaterial('bouncy');
    highlightSelectedMaterial('material3');
});

material4Button.addEventListener('click', () => {
    setMaterial('sticky');
    highlightSelectedMaterial('material4');
});

material5Button.addEventListener('click', () => {
    setMaterial('explosion');
    highlightSelectedMaterial('material5');
});

material6Button.addEventListener('click', () => {
    setMaterial('teleport');
    highlightSelectedMaterial('material6');
});

// Function to highlight the selected material in the dropdown
function highlightSelectedMaterial(materialId) {
    // Remove active class from all items
    const items = document.querySelectorAll('.dropdown-item');
    items.forEach(item => item.classList.remove('active'));
    
    // Add active class to selected item
    document.getElementById(materialId).classList.add('active');
    
    // Hide dropdown after selection
    document.getElementById('material-dropdown').classList.remove('show');
}

// Add play button listener
playButton.addEventListener('click', togglePlayMode);

// Close the dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('material-dropdown');
    const placeBtn = document.getElementById('placeButton');
    
    // If the click is outside the dropdown and not on the place button
    if (!dropdown.contains(event.target) && event.target !== placeBtn && !placeBtn.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Function to set the current build mode
function setMode(mode) {
    buildMode = mode;
    
    // Reset all buttons
    placeButton.classList.remove('active');
    removeButton.classList.remove('active');
    startMarkerButton.classList.remove('active');
    finishMarkerButton.classList.remove('active');
    
    // Update UI to reflect the current mode
    if (mode === 'place') {
        placeButton.classList.add('active');
        modeIndicator.textContent = `Mode: Place ${currentMaterial.charAt(0).toUpperCase() + currentMaterial.slice(1)} Block`;
        placeholderMaterial.color.set(0x4CAF50); // Green for adding
        // Change placeholder to cube
        updatePlaceholderGeometry('block');
    } else if (mode === 'remove') {
        removeButton.classList.add('active');
        modeIndicator.textContent = 'Mode: Remove Object';
        placeholderMaterial.color.set(0xFF5252); // Red for removing
        // Change placeholder to cube by default, will update based on what's being hovered
        updatePlaceholderGeometry('block');
    } else if (mode === 'placeStart') {
        startMarkerButton.classList.add('active');
        modeIndicator.textContent = 'Mode: Place Start Marker';
        placeholderMaterial.color.set(0x00FF00); // Green for start
        // Change placeholder to marker platform
        updatePlaceholderGeometry('marker');
    } else if (mode === 'placeFinish') {
        finishMarkerButton.classList.add('active');
        modeIndicator.textContent = 'Mode: Place Finish Marker';
        placeholderMaterial.color.set(0xFFFFFF); // White for finish
        // Change placeholder to marker platform
        updatePlaceholderGeometry('marker');
    }
}

// Function to update the placeholder geometry based on current mode
function updatePlaceholderGeometry(type) {
    if (type === 'block') {
        // Using cubeGeometry
        placeholderCube.visible = true;
        placeholderMarker.visible = false;
    } else if (type === 'marker') {
        // Using markerGeometry
        placeholderCube.visible = false;
        placeholderMarker.visible = true;
    }
}

// Function to set the current material
function setMaterial(material) {
    currentMaterial = material;
    
    // Update the place button indicator
    if (placeButton) {
        placeButton.classList.remove('material-regular', 'material-ice', 'material-bouncy', 'material-sticky', 'material-explosion', 'material-teleport');
        placeButton.classList.add(`material-${material}`);
    }
    
    // Update the mode indicator to show selected material (only if in place mode)
    if (buildMode === 'place') {
        modeIndicator.textContent = `Mode: Place ${material.charAt(0).toUpperCase() + material.slice(1)} Block`;
    }
}

// Raycaster for placing objects
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const placementPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.5); // Plane aligned with ground top

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Store the latest valid placement position
let placementPosition = new THREE.Vector3();
let canPlaceObject = false;

// Add a height limit constant
const MAX_BLOCK_HEIGHT = 10; // Maximum number of blocks that can be stacked

// Helper function to check if a position is on a marker platform
function isPositionOnMarker(position) {
    // Check if position is on start marker
    if (startMarker && 
        Math.abs(position.x - startMarker.position.x) < 1.5 && 
        Math.abs(position.z - startMarker.position.z) < 1.5) {
        return true;
    }
    
    // Check if position is on finish marker
    if (finishMarker && 
        Math.abs(position.x - finishMarker.position.x) < 1.5 && 
        Math.abs(position.z - finishMarker.position.z) < 1.5) {
        return true;
    }
    
    return false;
}

function updatePlacementIndicator(event) {
    // Check if the event target is a UI element
    if (isUIElement(event.target)) {
        // Don't update placement indicator when clicking UI
        return;
    }
    
    // Skip placement indicator in play mode
    if (isPlayMode) return;
    
    // Calculate mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    if (buildMode === 'place') {
        // In place mode - check intersection with both ground and existing blocks
        const allObjects = [...placedBlocks, ground];
        const intersects = raycaster.intersectObjects(allObjects);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            const hitObject = intersects[0].object;
            const faceNormal = intersects[0].face.normal.clone();
            
            // If we're hitting the ground, place at ground level
            if (hitObject === ground) {
                const placeX = Math.round(intersectPoint.x);
                const placeZ = Math.round(intersectPoint.z);
                
                // Position the block so its bottom is at y=0 (ground level)
                // Since the cube is 1x1x1, its center should be at y=0.5
                placementPosition.set(placeX, 0.5, placeZ);
                
                // Check if placement position is on a marker platform
                if (isPositionOnMarker(placementPosition)) {
                    placeholderCube.visible = false;
                    canPlaceObject = false;
                    return;
                }
                
                placeholderCube.position.copy(placementPosition);
                placeholderCube.visible = true;
                canPlaceObject = true;
            }
            // If we hit a block, handle it differently based on which face we hit
            else {
                // Convert the face normal from local block space to world space
                faceNormal.transformDirection(hitObject.matrixWorld);
                
                // Get the hit object's position
                const objPos = hitObject.position.clone();
                
                if (faceNormal.y > 0.5) {
                    // Top face hit - stack directly on top
                    placementPosition.set(
                        objPos.x,
                        objPos.y + 1,
                        objPos.z
                    );
                    
                    // Check height limit
                    if (placementPosition.y > MAX_BLOCK_HEIGHT) {
                        // Above height limit - hide indicator and disable placement
                        placeholderCube.visible = false;
                        canPlaceObject = false;
                        return;
                    }
                }
                else if (faceNormal.y < -0.5) {
                    // Bottom face hit - we don't place blocks under other blocks
                    placeholderCube.visible = false;
                    canPlaceObject = false;
                    return;
                }
                else {
                    // Side face hit - place adjacent to the side we clicked
                    // Add the normal vector to determine placement position
                    placementPosition.set(
                        objPos.x + Math.round(faceNormal.x),
                        objPos.y,
                        objPos.z + Math.round(faceNormal.z)
                    );
                    
                    // Check if placement position is on a marker platform
                    if (isPositionOnMarker(placementPosition)) {
                        placeholderCube.visible = false;
                        canPlaceObject = false;
                        return;
                    }
                    
                    // Check if there's already a block at this position
                    // If there is, we need to place on top of it
                    for (const block of placedBlocks) {
                        if (Math.abs(block.position.x - placementPosition.x) < 0.1 && 
                            Math.abs(block.position.z - placementPosition.z) < 0.1) {
                            if (block.position.y >= placementPosition.y) {
                                // There's a block here already, adjust height to place on top
                                placementPosition.y = Math.ceil(block.position.y) + 0.5;
                            }
                        }
                    }
                }
                
                // Final check if the adjusted position is on a marker platform
                if (isPositionOnMarker(placementPosition)) {
                    placeholderCube.visible = false;
                    canPlaceObject = false;
                    return;
                }
                
                placeholderCube.position.copy(placementPosition);
                placeholderCube.visible = true;
                canPlaceObject = true;
            }
        } else {
            placeholderCube.visible = false;
            canPlaceObject = false;
        }
    } else if (buildMode === 'remove') {
        // In remove mode - check intersection with existing objects
        const allObjects = [...placedBlocks];
        if (startMarker) allObjects.push(startMarker);
        if (finishMarker) allObjects.push(finishMarker);
        
        const intersects = raycaster.intersectObjects(allObjects);
        
        if (intersects.length > 0) {
            const objToRemove = intersects[0].object;
            
            // Adjust placeholder based on type
            if (placedBlocks.includes(objToRemove)) {
                updatePlaceholderGeometry('block');
                placeholderCube.position.copy(objToRemove.position);
                placeholderCube.visible = true;
            } else {
                updatePlaceholderGeometry('marker');
                placeholderMarker.position.copy(objToRemove.position);
                placeholderMarker.visible = true;
            }
            
            canPlaceObject = true; // In this case it means "can remove object"
        } else {
            placeholderCube.visible = false;
            placeholderMarker.visible = false;
            canPlaceObject = false;
        }
    } else if (buildMode === 'placeStart' || buildMode === 'placeFinish') {
        // Placing a marker - check intersection with ground
        const intersects = raycaster.intersectObject(ground);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            const placeX = Math.round(intersectPoint.x);
            const placeZ = Math.round(intersectPoint.z);

            // Position the marker so its bottom is at ground level
            // Since markers are thin, center is just slightly above ground
            placementPosition.set(placeX, 0.1, placeZ); // Height of 0.1 (half of 0.2)
            placeholderMarker.position.copy(placementPosition);
            placeholderMarker.visible = true;
            canPlaceObject = true;
        } else {
            placeholderMarker.visible = false;
            canPlaceObject = false;
        }
    }
}

// Function to check if the element is a UI element
function isUIElement(element) {
    // Check if element or any parent has a class or ID associated with UI
    let currentElement = element;
    
    while (currentElement) {
        // Check for UI elements
        if (currentElement.id === 'ui-controls' || 
            currentElement.id === 'props-selector' || 
            currentElement.id === 'material-dropdown' ||
            currentElement.id === 'modeToggleButton' ||
            currentElement.id === 'buildModeButton' ||
            currentElement.classList.contains('tool-button') ||
            currentElement.classList.contains('dropdown-item') ||
            currentElement.classList.contains('prop-button')) {
            return true;
        }
        
        currentElement = currentElement.parentElement;
    }
    
    return false;
}

// Modified function to handle touch events in build mode
function onPointerDown(event) {
    // Skip if in play mode
    if (isPlayMode) return;
    
    // Skip if clicking on UI elements
    if (isUIElement(event.target)) return;
    
    // Check if it's a touch event
    const isTouch = event.pointerType === 'touch';
    
    // Calculate mouse/touch position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // For mobile devices, act directly on touch instead of showing placeholder
    if (isTouch && isMobile) {
        if (buildMode === 'place') {
            // Ray cast to ground and placed blocks
            const allObjects = [...placedBlocks, ground];
            const intersects = raycaster.intersectObjects(allObjects);
            
            if (intersects.length > 0) {
                const intersectPoint = intersects[0].point;
                const hitObject = intersects[0].object;
                const faceNormal = intersects[0].face.normal.clone();
                let newPosition = new THREE.Vector3();
                
                // If we hit the ground
                if (hitObject === ground) {
                    const placeX = Math.round(intersectPoint.x);
                    const placeZ = Math.round(intersectPoint.z);
                    newPosition.set(placeX, 0.5, placeZ);
                    
                    // Check if position is on a marker platform
                    if (isPositionOnMarker(newPosition)) return;
                    
                    // Get the selected material
                    const selectedMaterialType = materialTypes[currentMaterial];
                    
                    // Create a new cube instance with the selected material
                    const newCube = new THREE.Mesh(cubeGeometry, selectedMaterialType.material.clone());
                    newCube.position.copy(newPosition);
                    
                    // Store material properties on the cube for gameplay logic
                    newCube.userData = { ...selectedMaterialType.properties };
                    
                    scene.add(newCube);
                    placedBlocks.push(newCube);
                }
                // If we hit a block
                else {
                    // Convert the face normal from local block space to world space
                    faceNormal.transformDirection(hitObject.matrixWorld);
                    
                    // Get the hit object's position
                    const objPos = hitObject.position.clone();
                    
                    if (faceNormal.y > 0.5) {
                        // Top face hit - stack directly on top
                        newPosition.set(objPos.x, objPos.y + 1, objPos.z);
                        
                        // Check height limit
                        if (newPosition.y > MAX_BLOCK_HEIGHT) return;
                    }
                    else if (faceNormal.y < -0.5) {
                        // Bottom face hit - we don't place blocks under other blocks
                        return;
                    }
                    else {
                        // Side face hit - place adjacent to the side we clicked
                        newPosition.set(
                            objPos.x + Math.round(faceNormal.x),
                            objPos.y,
                            objPos.z + Math.round(faceNormal.z)
                        );
                        
                        // Check if placement position is on a marker platform
                        if (isPositionOnMarker(newPosition)) return;
                        
                        // Check if there's already a block at this position
                        for (const block of placedBlocks) {
                            if (Math.abs(block.position.x - newPosition.x) < 0.1 && 
                                Math.abs(block.position.z - newPosition.z) < 0.1) {
                                if (block.position.y >= newPosition.y) {
                                    // There's a block here already, adjust height to place on top
                                    newPosition.y = Math.ceil(block.position.y) + 0.5;
                                }
                            }
                        }
                    }
                    
                    // Final check if the adjusted position is on a marker platform
                    if (isPositionOnMarker(newPosition)) return;
                    
                    // Get the selected material
                    const selectedMaterialType = materialTypes[currentMaterial];
                    
                    // Create a new cube instance with the selected material
                    const newCube = new THREE.Mesh(cubeGeometry, selectedMaterialType.material.clone());
                    newCube.position.copy(newPosition);
                    
                    // Store material properties on the cube for gameplay logic
                    newCube.userData = { ...selectedMaterialType.properties };
                    
                    scene.add(newCube);
                    placedBlocks.push(newCube);
                }
            }
        }
        else if (buildMode === 'remove') {
            // In remove mode - check intersection with existing objects
            const allObjects = [...placedBlocks];
            if (startMarker) allObjects.push(startMarker);
            if (finishMarker) allObjects.push(finishMarker);
            
            const intersects = raycaster.intersectObjects(allObjects);
            
            if (intersects.length > 0) {
                const objectToRemove = intersects[0].object;
                scene.remove(objectToRemove);
                
                // Determine what was removed and update references
                if (objectToRemove === startMarker) {
                    startMarker = null;
                } else if (objectToRemove === finishMarker) {
                    finishMarker = null;
                } else {
                    // Remove from our blocks array
                    const index = placedBlocks.indexOf(objectToRemove);
                    if (index > -1) {
                        placedBlocks.splice(index, 1);
                    }
                }
            }
        }
        else if (buildMode === 'placeStart') {
            // For placing start marker on mobile
            const intersects = raycaster.intersectObject(ground);
            
            if (intersects.length > 0) {
                const intersectPoint = intersects[0].point;
                const placeX = Math.round(intersectPoint.x);
                const placeZ = Math.round(intersectPoint.z);
                
                // Position the marker so its bottom is at ground level
                const position = new THREE.Vector3(placeX, 0.1, placeZ);
                
                // Remove existing start marker if there is one
                if (startMarker) {
                    scene.remove(startMarker);
                }
                
                // Create a new start marker
                startMarker = new THREE.Mesh(markerGeometry, startMarkerMaterial);
                startMarker.position.copy(position);
                startMarker.userData = { type: 'start' };
                
                scene.add(startMarker);
            }
        }
        else if (buildMode === 'placeFinish') {
            // For placing finish marker on mobile
            const intersects = raycaster.intersectObject(ground);
            
            if (intersects.length > 0) {
                const intersectPoint = intersects[0].point;
                const placeX = Math.round(intersectPoint.x);
                const placeZ = Math.round(intersectPoint.z);
                
                // Position the marker so its bottom is at ground level
                const position = new THREE.Vector3(placeX, 0.1, placeZ);
                
                // Remove existing finish marker if there is one
                if (finishMarker) {
                    scene.remove(finishMarker);
                }
                
                // Create a new finish marker
                finishMarker = new THREE.Mesh(markerGeometry, finishMarkerMaterial);
                finishMarker.position.copy(position);
                finishMarker.userData = { type: 'finish' };
                
                scene.add(finishMarker);
            }
        }
        
        return; // Skip the rest for touch events on mobile
    }
    
    // Standard mouse handling for desktop
    if (event.button !== 0) return; // Only respond to left mouse button
    
    // Handle based on current mode
    if (buildMode === 'place') {
        // For placing blocks, we check if placement is valid
        if (canPlaceObject) {
            // Double-check we're not placing on a marker platform
            if (isPositionOnMarker(placementPosition)) {
                return;
            }
            
            // Get the selected material
            const selectedMaterialType = materialTypes[currentMaterial];
            
            // Create a new cube instance with the selected material
            const newCube = new THREE.Mesh(cubeGeometry, selectedMaterialType.material.clone());
            newCube.position.copy(placeholderCube.position);
            
            // Store material properties on the cube for gameplay logic
            newCube.userData = { ...selectedMaterialType.properties };
            
            scene.add(newCube);
            placedBlocks.push(newCube);
        }
    } 
    else if (buildMode === 'remove') {
        // For removing objects, check if there's something to remove
        if (canPlaceObject) {
            const allObjects = [...placedBlocks];
            if (startMarker) allObjects.push(startMarker);
            if (finishMarker) allObjects.push(finishMarker);
            
            const intersects = raycaster.intersectObjects(allObjects);
            
            if (intersects.length > 0) {
                const objectToRemove = intersects[0].object;
                scene.remove(objectToRemove);
                
                // Determine what was removed and update references
                if (objectToRemove === startMarker) {
                    startMarker = null;
                } else if (objectToRemove === finishMarker) {
                    finishMarker = null;
                } else {
                    // Remove from our blocks array
                    const index = placedBlocks.indexOf(objectToRemove);
                    if (index > -1) {
                        placedBlocks.splice(index, 1);
                    }
                }
            }
        }
    } 
    else if (buildMode === 'placeStart') {
        // For placing start marker
        if (canPlaceObject) {
            // Remove existing start marker if there is one
            if (startMarker) {
                scene.remove(startMarker);
            }
            
            // Create a new start marker
            startMarker = new THREE.Mesh(markerGeometry, startMarkerMaterial);
            startMarker.position.copy(placeholderMarker.position);
            startMarker.userData = { type: 'start' };
            
            scene.add(startMarker);
        }
    } 
    else if (buildMode === 'placeFinish') {
        // For placing finish marker
        if (canPlaceObject) {
            // Remove existing finish marker if there is one
            if (finishMarker) {
                scene.remove(finishMarker);
            }
            
            // Create a new finish marker
            finishMarker = new THREE.Mesh(markerGeometry, finishMarkerMaterial);
            finishMarker.position.copy(placeholderMarker.position);
            finishMarker.userData = { type: 'finish' };
            
            scene.add(finishMarker);
        }
    }
}

// Add key handler for quick switching
window.addEventListener('keydown', (event) => {
    // Skip build mode shortcuts when in play mode
    if (isPlayMode) return;
    
    if (event.key === '1' || event.key === 'p') {
        setMode('place');
    } else if (event.key === '2' || event.key === 'r') {
        setMode('remove');
    } else if (event.key === '3' || event.key === 'z') {
        setMode('placeStart');
    } else if (event.key === '4' || event.key === 'f') {
        setMode('placeFinish');
    }
    
    // Material selection shortcuts
    if (event.key === 'q') {
        setMaterial('regular');
        highlightSelectedMaterial('material1');
    } else if (event.key === 'w') {
        setMaterial('ice');
        highlightSelectedMaterial('material2');
    } else if (event.key === 'e') {
        setMaterial('bouncy');
        highlightSelectedMaterial('material3');
    } else if (event.key === 'a') {
        setMaterial('sticky');
        highlightSelectedMaterial('material4');
    } else if (event.key === 's') {
        setMaterial('explosion');
        highlightSelectedMaterial('material5');
    } else if (event.key === 'd') {
        setMaterial('teleport');
        highlightSelectedMaterial('material6');
    }
});

window.addEventListener('pointermove', updatePlacementIndicator);
window.addEventListener('pointerdown', onPointerDown);

// Initialize the mode and material
setMode('place');
setMaterial('regular');
highlightSelectedMaterial('material1'); // Set default material as selected in dropdown

// Character variables
let character = null;
let clock = new THREE.Clock();
let keysPressed = {};
let hasCompleted = false; // Flag to track if level has been completed

// Add a control info panel to the body
const controlsInfo = document.createElement('div');
controlsInfo.id = 'controls-info';

controlsInfo.innerHTML = `
    <h3>Controls:</h3>
    <div class="mobile-controls">
        <p>Right Joystick: Move</p>
        <p>Left Button: Jump</p>
        <p>Pinch: Zoom Camera</p>
        <p>Swipe: Rotate Camera</p>
    </div>
    <div class="desktop-controls">
        <p>WASD or Arrow Keys: Move</p>
        <p>Space: Jump</p>
        <p>Right Mouse Button: Rotate Camera</p>
    </div>
`;

document.body.appendChild(controlsInfo);

// Create a build mode button that's only visible in play mode
const buildModeButton = document.createElement('button');
buildModeButton.id = 'buildModeButton';
buildModeButton.innerHTML = `
    <svg class="build-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 12a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM16 8V5H4v14h6.1c.15.71.39 1.39.71 2H3c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v5.1c-.71-.15-1.39-.1-2 .13V8h-7v2h4.13c-.63.64-1.13 1.39-1.5 2H8v2h2.06c-.11.5-.16.97-.13 1.5-.09.51-.14.97-.14 1.5H8v-2H3v2h2v-2h3zm-1-3V2H5c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h4.68c.21.74.53 1.43.95 2H5c-1.66 0-3-1.34-3-3V3c0-1.66 1.34-3 3-3h12c1.66 0 3 1.34 3 3v4.68c-.74-.21-1.43-.53-2-.95V5zm1.21 15.46l-2.13-2.12-1.42 1.42L16.5 20l5.84-5.84-1.42-1.42-5.71 5.72z"/>
    </svg>
    <span>Build Mode</span>
`;
buildModeButton.style.display = 'none'; // Hidden by default
// Only add event listener if we're not in a predefined course
if (!startInPlayMode) {
    buildModeButton.addEventListener('click', togglePlayMode);
}

// Add variables for camera controls in play mode
let cameraOffset = new THREE.Vector3(0, 5, 10);
let cameraTarget = new THREE.Vector3();
let cameraRotationAngle = 0;
let verticalRotationAngle = Math.PI/4; // Add vertical angle (pi/4 = 45 degrees)
let isRotatingCamera = false;
let lastMouseX = 0;
let lastMouseY = 0; // Add tracking for vertical mouse position
// Add zoom variables with min and max distances
let zoomLevel = 1.0;
const minZoomLevel = 0.5; // Closer zoom (50% of default)
const maxZoomLevel = 2.0; // Farther zoom (200% of default)
const defaultCameraOffsetZ = 10; // Store the default distance
// Limits for vertical rotation (to prevent flipping)
const minVerticalAngle = 0.1; // Almost horizontal (looking up)
const maxVerticalAngle = Math.PI - 0.1; // Almost horizontal (looking down)

// Function to toggle between build and play modes
function togglePlayMode() {
    isPlayMode = !isPlayMode;
    
    // Reset character movement flag when toggling modes
    canCharacterMove = false;
    
    // Update back button text based on mode
    if (startInPlayMode && isPlayMode) {
        backButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Obstacle Selector
        `;
    } else {
        backButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Menu
        `;
    }
    
    // Get UI elements to show/hide
    const buildUIElements = document.querySelectorAll('#ui-controls, #props-selector, #material-selector');
    const mobileControls = document.getElementById('mobile-controls');
    
    // Ensure mobile control styles are properly applied
    if (isPlayMode && isMobile) {
        ensureMobileControlStyles();
    }
    
    // Create a brief fade effect by adding a transition overlay
    const transitionOverlay = document.createElement('div');
    transitionOverlay.id = 'mode-transition';
    document.body.appendChild(transitionOverlay);
    
    // Fade in
    setTimeout(() => {
        transitionOverlay.style.opacity = '0.7';
        
        // Complete transition and remove overlay
        setTimeout(() => {
            completeModeSwitching();
            setTimeout(() => {
                transitionOverlay.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(transitionOverlay);
                }, 500);
            }, 100);
        }, 300);
    }, 0);
    
    function completeModeSwitching() {
        if (isPlayMode) {
            // Enter play mode - show build button to let user go back to build mode
            modeToggleButton.innerHTML = `
                <svg class="mode-icon build-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 12a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM16 8V5H4v14h6.1c.15.71.39 1.39.71 2H3c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v5.1c-.71-.15-1.39-.1-2 .13V8h-7v2h4.13c-.63.64-1.13 1.39-1.5 2H8v2h2.06c-.11.5-.16.97-.13 1.5-.09.51-.14.97-.14 1.5H8v-2H3v2h2v-2h3zm-1-3V2H5c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h4.68c.21.74.53 1.43.95 2H5c-1.66 0-3-1.34-3-3V3c0-1.66 1.34-3 3-3h12c1.66 0 3 1.34 3 3v4.68c-.74-.21-1.43-.53-2-.95V5zm1.21 15.46l-2.13-2.12-1.42 1.42L16.5 20l5.84-5.84-1.42-1.42-5.71 5.72z"/>
                </svg>
                <span>Build Mode</span>
            `;
            modeToggleButton.style.backgroundColor = '#4CAF50'; // Green for build
            
            // Only show mode toggle button if not playing a predefined course
            if (startInPlayMode) {
                modeToggleButton.style.display = 'none';
            } else {
                modeToggleButton.style.display = 'flex';
            }
            
            // Hide all build mode UI elements
            buildUIElements.forEach(el => el.style.display = 'none');
            
            // Hide the old play button container
            playButtonContainer.style.display = 'none';
            
            // Show "Test" in create section, but "Play" in obstacle courses
            if (startInPlayMode) {
                modeIndicator.textContent = 'Mode: Play';
            } else {
                modeIndicator.textContent = 'Mode: Test';
            }
            
            // Create and display the timer
            createTimerDisplay();
            
            // Don't start the timer automatically - wait for button press
            // startTimer(); <- Remove or comment this line
            
            // Show controls info
            controlsInfo.classList.add('visible');
            
            // Only show build mode button if not playing a predefined course
            if (!startInPlayMode) {
                buildModeButton.style.display = 'flex';
                document.body.appendChild(buildModeButton);
            }
            
            // Hide placeholder objects
            placeholderCube.visible = false;
            placeholderMarker.visible = false;
            
            // Disable orbit controls to prevent camera movement during play
            controls.enabled = false;
            
            // Hide the ground plane in play mode and remove from collision detection
            // But keep the start and finish platforms
            ground.visible = false;
            scene.remove(ground);
            
            // Create character at start marker position if it exists
            let startPosition = new THREE.Vector3(0, 1, 0);
            if (startMarker) {
                startPosition.set(startMarker.position.x, startMarker.position.y + 1, startMarker.position.z);
            }
            
            // Add the start and finish markers to blocks array for collision detection
            // This ensures the player can stand on these platforms in play mode
            if (startMarker) {
                placedBlocks.push(startMarker);
                // Add a userData type to identify it in collisions
                startMarker.userData.type = 'start';
            }
            
            if (finishMarker) {
                placedBlocks.push(finishMarker);
                // Add a userData type to identify it in collisions
                finishMarker.userData.type = 'finish';
            }
            
            // Create character
            character = new Character(scene, ground);
            character.mesh.position.copy(startPosition);
            
            // Store the starting position for respawning
            character.startPosition = startPosition.clone();
            
            // Reset camera angle and zoom
            cameraRotationAngle = 0;
            verticalRotationAngle = Math.PI/4; // Reset vertical angle to default 45 degrees
            zoomLevel = 1.0; // Reset zoom to default
            
            // Set up camera to follow character
            updateCameraPosition();
            
            // Start listening for keyboard input
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
            
            // Add mouse events for camera rotation in play mode
            window.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('wheel', handleMouseWheel); // Add wheel event listener
            
            // Show mobile controls if on mobile device
            if (isMobile) {
                mobileControls.classList.add('mobile-active');
                // Explicitly set display style to ensure visibility
                mobileControls.style.display = 'block';
                // Initialize mobile touch events
                initMobileTouchControls();
            }
        } else {
            // Exit play mode - show play button to let user enter play mode
            // Stop the timer when exiting play mode
            stopTimer();

            // Remove timer display
            if (timerDisplay) {
                timerDisplay.remove();
                timerDisplay = null;
            }

            // Hide the timer container
            document.getElementById('timer-container').style.display = 'none';
            
            // Exit play mode - show play button to let user enter play mode
            modeToggleButton.innerHTML = `
                <svg class="mode-icon play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Test Mode</span>
            `;
            modeToggleButton.style.backgroundColor = '#FF5252'; // Red for play
            
            // Show all build mode UI elements
            buildUIElements.forEach(el => el.style.display = '');
            
            // Add ground back to the scene and make it visible
            scene.add(ground);
            ground.visible = true;
            
            // Hide controls info
            controlsInfo.classList.remove('visible');
            
            // Re-enable build mode controls
            setMode('place');
            controls.enabled = true;
            
            // Update the mode indicator to show we're in build mode
            modeIndicator.textContent = 'Mode: Build';
            
            // Remove the start and finish markers from the blocks array
            // This is important so we don't duplicate them when entering play mode again
            placedBlocks = placedBlocks.filter(block => 
                block !== startMarker && block !== finishMarker
            );
            
            // Remove character
            if (character) {
                scene.remove(character.mesh);
                character = null;
            }
            
            // Stop listening for keyboard input and mouse events
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('wheel', handleMouseWheel); // Remove wheel event listener
            
            // Hide and remove build mode button
            buildModeButton.style.display = 'none';
            if (document.body.contains(buildModeButton)) {
                document.body.removeChild(buildModeButton);
            }
            
            // Hide mobile controls
            mobileControls.classList.remove('mobile-active');
            
            // Remove mobile touch event listeners
            if (isMobile) {
                removeMobileTouchControls();
            }
        }
    }
}

// Function to ensure mobile control styles are properly applied
function ensureMobileControlStyles() {
    // Check if the styles already exist
    let mobileStylesExist = false;
    const styleSheets = document.styleSheets;
    
    for (let i = 0; i < styleSheets.length; i++) {
        try {
            const rules = styleSheets[i].cssRules || styleSheets[i].rules;
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].selectorText && rules[j].selectorText.includes('#mobile-controls')) {
                        mobileStylesExist = true;
                        break;
                    }
                }
            }
            if (mobileStylesExist) break;
        } catch (e) {
            // Cross-origin stylesheet, skip it
            continue;
        }
    }
    
    // If styles don't exist, inject them
    if (!mobileStylesExist) {
        const mobileStyles = document.createElement('style');
        mobileStyles.textContent = `
            /* Mobile Controls */
            #mobile-controls {
                display: none; /* Hidden by default */
                position: absolute;
                z-index: 100;
                width: 100%;
                height: 100%;
                pointer-events: none;
                touch-action: none;
            }
            
            /* Show mobile controls on devices with coarse pointers or no hover */
            @media (pointer: coarse), (hover: none) {
                #mobile-controls.mobile-active {
                    display: block !important;
                }
            }
            
            /* Hide mobile controls on devices with fine pointers and hover capability */
            @media (pointer: fine) and (hover: hover) {
                #mobile-controls {
                    display: none !important;
                }
            }
            
            /* Virtual joystick container */
            #virtual-joystick {
                position: absolute;
                bottom: 100px;
                right: 100px;
                width: 120px;
                height: 120px;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 60px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                pointer-events: auto;
                touch-action: none;
            }
            
            #joystick-knob {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 25px;
                border: 2px solid rgba(255, 255, 255, 0.7);
                pointer-events: none; /* The knob itself doesn't need pointer events */
            }
            
            /* Jump button */
            #jump-button {
                position: absolute;
                bottom: 100px;
                left: 100px;
                width: 80px;
                height: 80px;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 40px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                pointer-events: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: none;
            }
            
            #jump-button-icon {
                width: 40px;
                height: 40px;
                fill: rgba(255, 255, 255, 0.7);
            }
            
            /* Media queries for different device sizes */
            @media (max-width: 768px) {
                #virtual-joystick {
                    bottom: 80px;
                    right: 60px;
                }
                
                #jump-button {
                    bottom: 80px;
                    left: 60px;
                }
            }
            
            /* Smaller phones */
            @media (max-width: 480px) {
                #virtual-joystick {
                    bottom: 60px;
                    right: 40px;
                    width: 100px;
                    height: 100px;
                }
                
                #joystick-knob {
                    width: 40px;
                    height: 40px;
                }
                
                #jump-button {
                    bottom: 60px;
                    left: 40px;
                    width: 70px;
                    height: 70px;
                }
                
                #jump-button-icon {
                    width: 35px;
                    height: 35px;
                }
            }
            
            /* Landscape orientation for tablets and mobile devices */
            @media (orientation: landscape) and (max-height: 768px) {
                #virtual-joystick {
                    bottom: 20px;
                    right: 20px;
                    width: 90px;
                    height: 90px;
                }
                
                #joystick-knob {
                    width: 35px;
                    height: 35px;
                }
                
                #jump-button {
                    bottom: 20px;
                    left: 20px;
                    width: 70px;
                    height: 70px;
                }
                
                #jump-button-icon {
                    width: 30px;
                    height: 30px;
                }
            }
            
            /* Ensure controls are visible regardless of orientation */
            @media screen and (orientation: landscape), screen and (orientation: portrait) {
                #mobile-controls.mobile-active {
                    display: block !important;
                }
            }
        `;
        document.head.appendChild(mobileStyles);
    }
}

// Add mouse event handlers for camera rotation
function handleMouseDown(event) {
    // Only handle right mouse button (button ID 2)
    if (event.button === 2) {
        isRotatingCamera = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY; // Track vertical position
    }
}

function handleMouseUp(event) {
    if (event.button === 2) {
        isRotatingCamera = false;
    }
}

function preventContextMenu(event) {
    event.preventDefault();
}

function handleMouseMove(event) {
    if (isRotatingCamera) {
        // Calculate mouse movement delta for both horizontal and vertical
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        
        // Update camera rotation angles (in radians)
        cameraRotationAngle -= deltaX * 0.01;
        
        // Update vertical angle, with limits to prevent flipping
        verticalRotationAngle += deltaY * 0.01;
        verticalRotationAngle = Math.max(minVerticalAngle, Math.min(maxVerticalAngle, verticalRotationAngle));
        
        // Update camera position based on new angles
        updateCameraPosition();
    }
}

// Function to update camera position based on character position and camera angle
function updateCameraPosition() {
    if (!character) return;
    
    // Apply zoom level to camera offset
    const zoomedOffsetZ = defaultCameraOffsetZ * zoomLevel;
    
    // Calculate camera position based on spherical coordinates
    const sinVertical = Math.sin(verticalRotationAngle);
    const cosVertical = Math.cos(verticalRotationAngle);
    const sinHorizontal = Math.sin(cameraRotationAngle);
    const cosHorizontal = Math.cos(cameraRotationAngle);
    
    // Convert from spherical to cartesian coordinates
    const offsetX = sinHorizontal * sinVertical * zoomedOffsetZ;
    const offsetY = cosVertical * zoomedOffsetZ;
    const offsetZ = cosHorizontal * sinVertical * zoomedOffsetZ;
    
    // Position camera around character
    camera.position.x = character.mesh.position.x + offsetX;
    camera.position.y = character.mesh.position.y + offsetY;
    camera.position.z = character.mesh.position.z + offsetZ;
    
    // Point camera at character
    camera.lookAt(character.mesh.position);
}

// Keyboard event handlers for character movement
function handleKeyDown(event) {
    if (!isPlayMode) return;
    
    const key = event.key.toLowerCase();
    
    // Always allow Escape key to exit play mode regardless of character movement state
    if (key === 'escape' && !startInPlayMode) {
        togglePlayMode();
        return;
    }
    
    // Only process movement keys if character can move
    if (!canCharacterMove && ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        event.preventDefault();
        return;
    }
    
    keysPressed[key] = true;
    
    // Prevent default behavior for arrow keys and space
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        event.preventDefault();
    }
}

function handleKeyUp(event) {
    if (!isPlayMode) return;
    
    const key = event.key.toLowerCase();
    
    // Only process movement keys if character can move
    if (!canCharacterMove && ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        return;
    }
    
    keysPressed[key] = false;
}

// Function to update character movement based on keyboard input and touch input
function updateCharacterMovement() {
    if (!character || !isPlayMode || isCountingDown || !canCharacterMove) return;
    
    // Get the delta time
    const deltaTime = clock.getDelta() * 60; // Convert to a normalized time step
    
    // Reset direction
    character.direction.set(0, 0, 0);
    
    // Handle keyboard input
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotationAngle);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotationAngle);
    
    if (keysPressed['w'] || keysPressed['arrowup']) {
        character.direction.add(forward);
    }
    if (keysPressed['s'] || keysPressed['arrowdown']) {
        character.direction.sub(forward);
    }
    if (keysPressed['a'] || keysPressed['arrowleft']) {
        character.direction.sub(right);
    }
    if (keysPressed['d'] || keysPressed['arrowright']) {
        character.direction.add(right);
    }
    
    // Handle mobile joystick input
    if (isMobile && joystickActive) {
        // Apply joystick direction (relative to camera)
        const joystickDirection = new THREE.Vector3();
        joystickDirection.add(forward.clone().multiplyScalar(joystickPosition.y));
        joystickDirection.add(right.clone().multiplyScalar(joystickPosition.x));
        
        if (joystickDirection.lengthSq() > 0) {
            joystickDirection.normalize();
            character.direction.copy(joystickDirection);
        }
    }
    
    // Normalize direction if moving diagonally
    if (character.direction.lengthSq() > 0) {
        character.direction.normalize();
    }
    
    // Jump with space bar or jump button
    if (keysPressed[' ']) {
        character.jump();
    }
    
    // Apply movement direction to velocity
    character.velocity.x = character.direction.x * character.moveSpeed;
    character.velocity.z = character.direction.z * character.moveSpeed;
    
    // Update character physics
    character.update(placedBlocks, deltaTime);
    
    // Check if character has fallen below the level
    const fallThreshold = -10; // Consider the player fallen if they go below this y-value
    if (character.mesh.position.y < fallThreshold && !character.isRespawning) {
        // Set respawning flag to prevent multiple respawns
        character.isRespawning = true;
        
        // Create a flash effect
        createRespawnEffect(character.mesh.position.clone(), () => {
            // Respawn the character at the start position
            character.mesh.position.copy(character.startPosition);
            character.velocity.set(0, 0, 0); // Reset velocity
            
            // Create another flash effect at respawn point
            createRespawnEffect(character.startPosition.clone(), () => {
                // Reset respawning flag
                character.isRespawning = false;
                hasCompleted = false; // Reset completion flag
            });
        });
    }
    
    // Update camera to follow character
    updateCameraPosition();
    
    // Check if character reached the finish
    if (finishMarker && !hasCompleted) {
        const charPos = character.mesh.position.clone();
        const finishPos = finishMarker.position.clone();
        
        // Check if character is within 2 units of the finish marker
        if (charPos.distanceTo(finishPos) < 2) {
            hasCompleted = true;
            showCompletionDialog();
        }
    }
}

// Show completion dialog when a level is completed
function showCompletionDialog() {
    // Stop the timer when completing the level
    stopTimer();
    
    // Check if an overlay already exists
    let overlay = document.getElementById('completion-overlay');
    if (overlay) return; // If it exists, don't create another one

    overlay = document.createElement('div');
    overlay.id = 'completion-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const dialog = document.createElement('div');
    dialog.style.backgroundColor = '#333';
    dialog.style.color = 'white';
    dialog.style.padding = '30px';
    dialog.style.borderRadius = '10px';
    dialog.style.textAlign = 'center';
    dialog.style.maxWidth = '400px';
    dialog.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';

    const title = document.createElement('h2');
    title.textContent = 'Level Complete!';
    title.style.marginTop = '0';
    title.style.marginBottom = '20px';
    title.style.color = '#00FFFF';

    const message = document.createElement('p');
    message.textContent = 'Congratulations! You have completed this obstacle course.';
    message.style.marginBottom = '20px';

    // Add time information
    const timeInfo = document.createElement('p');
    timeInfo.textContent = `Your time: ${formatTime(elapsedTime)}`;
    timeInfo.style.marginBottom = '30px';
    timeInfo.style.fontSize = '1.2rem';
    timeInfo.style.fontWeight = 'bold';
    timeInfo.style.color = '#FFFF00';

    // Add player name input and submit score elements
    const courseId = selectedCourse ? selectedCourse.id : 'custom';
    const courseName = selectedCourse ? selectedCourse.title : 'Custom Course';
    
    const leaderboardSection = document.createElement('div');
    leaderboardSection.style.marginBottom = '20px';
    leaderboardSection.style.padding = '15px';
    leaderboardSection.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    leaderboardSection.style.borderRadius = '8px';
    
    const leaderboardTitle = document.createElement('h3');
    leaderboardTitle.textContent = 'Submit Your Score';
    leaderboardTitle.style.margin = '0 0 10px 0';
    leaderboardTitle.style.color = '#4CAF50';
    
    const nameInput = document.createElement('input');
    nameInput.id = 'playerNameInput';
    nameInput.type = 'text';
    nameInput.placeholder = 'Your Name';
    nameInput.maxLength = 15;
    nameInput.value = localStorage.getItem('lastPlayerName') || '';
    
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Score';
    submitButton.style.backgroundColor = '#4CAF50';
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '5px';
    submitButton.style.padding = '10px 20px';
    submitButton.style.marginTop = '10px';
    submitButton.style.cursor = 'pointer';
    submitButton.style.fontWeight = 'bold';
    
    // Submit button click handler
    submitButton.addEventListener('click', () => {
        const playerName = nameInput.value.trim();
        if (playerName.length > 0) {
            // Save player name for future submissions
            localStorage.setItem('lastPlayerName', playerName);
            
            // Submit score to leaderboard
            if (window.leaderboardManager) {
                window.leaderboardManager.submitScore(courseId, playerName, elapsedTime);
                
                // Replace input and submit with confirmation
                leaderboardSection.innerHTML = '';
                const confirmationMsg = document.createElement('p');
                confirmationMsg.textContent = 'Score submitted! Thank you.';
                confirmationMsg.style.color = '#4CAF50';
                confirmationMsg.style.fontWeight = 'bold';
                leaderboardSection.appendChild(confirmationMsg);
                
                // Add view leaderboard button
                const viewLeaderboardButton = document.createElement('button');
                viewLeaderboardButton.id = 'viewLeaderboardButton';
                viewLeaderboardButton.textContent = 'View Leaderboard';
                viewLeaderboardButton.addEventListener('click', () => {
                    window.leaderboardManager.showLeaderboardOverlay(courseId, courseName);
                });
                leaderboardSection.appendChild(viewLeaderboardButton);
            }
        } else {
            // Visual feedback for empty name
            nameInput.style.borderColor = 'red';
            nameInput.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            setTimeout(() => {
                nameInput.style.borderColor = '';
                nameInput.style.backgroundColor = '';
            }, 1000);
        }
    });
    
    // Add view leaderboard button without submitting
    const viewOnlyButton = document.createElement('button');
    viewOnlyButton.id = 'viewLeaderboardButton';
    viewOnlyButton.textContent = 'View Leaderboard';
    viewOnlyButton.style.marginLeft = '10px';
    viewOnlyButton.addEventListener('click', () => {
        if (window.leaderboardManager) {
            window.leaderboardManager.showLeaderboardOverlay(courseId, courseName);
        }
    });
    
    // Assemble the leaderboard section
    leaderboardSection.appendChild(leaderboardTitle);
    leaderboardSection.appendChild(nameInput);
    leaderboardSection.appendChild(document.createElement('br'));
    leaderboardSection.appendChild(submitButton);
    leaderboardSection.appendChild(viewOnlyButton);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.gap = '15px';

    const tryAgainButton = document.createElement('button');
    tryAgainButton.textContent = 'Try Again';
    tryAgainButton.style.padding = '10px 20px';
    tryAgainButton.style.backgroundColor = '#4CAF50';
    tryAgainButton.style.color = 'white';
    tryAgainButton.style.border = 'none';
    tryAgainButton.style.borderRadius = '5px';
    tryAgainButton.style.cursor = 'pointer';
    tryAgainButton.style.flex = '1';
    tryAgainButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        restartLevel();
    });

    const returnButton = document.createElement('button');
    returnButton.textContent = 'Course Selection';
    returnButton.style.padding = '10px 20px';
    returnButton.style.backgroundColor = '#2196F3';
    returnButton.style.color = 'white';
    returnButton.style.border = 'none';
    returnButton.style.borderRadius = '5px';
    returnButton.style.cursor = 'pointer';
    returnButton.style.flex = '1';
    returnButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        window.location.href = 'index.html?showCourses=true';
    });

    buttonContainer.appendChild(tryAgainButton);
    buttonContainer.appendChild(returnButton);
    dialog.appendChild(title);
    dialog.appendChild(message);
    dialog.appendChild(timeInfo);
    dialog.appendChild(leaderboardSection);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

// Restart the current level
function restartLevel() {
    // Stop any existing timer or countdown
    stopTimer();
    
    // Disable character movement until start button is pressed again
    canCharacterMove = false;
    
    // Reset the character to start position
    if (character && character.startPosition) {
        const respawnEffect = createRespawnEffect(character.mesh.position, () => {
            character.mesh.position.copy(character.startPosition);
            character.velocity.set(0, 0, 0);
            character.isJumping = false;
            
            // Reset the timer display
            if (timerDisplay) {
                timerDisplay.textContent = '00:00.0';
            }
            
            // Show the start button again
            const startButton = document.getElementById('start-button');
            if (startButton) {
                startButton.style.display = 'inline-block';
            }
        });
    }
    
    // Remove any overlay if it exists
    const overlay = document.getElementById('completion-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Create a respawn effect
function createRespawnEffect(position, callback) {
    // Create a flash of light
    const flash = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.8
        })
    );
    flash.position.copy(position);
    scene.add(flash);
    
    // Create particles for the effect
    const particles = new THREE.Group();
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.8
            })
        );
        
        // Position randomly around the center
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 0.5;
        
        particle.position.set(
            position.x + radius * Math.sin(phi) * Math.cos(theta),
            position.y + radius * Math.sin(phi) * Math.sin(theta),
            position.z + radius * Math.cos(phi)
        );
        
        // Store velocity for animation
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        
        particles.add(particle);
    }
    
    scene.add(particles);
    
    // Animate the effect
    let frameCount = 0;
    const animate = () => {
        frameCount++;
        
        // Expand and fade out the flash
        flash.scale.multiplyScalar(1.1);
        flash.material.opacity -= 0.1;
        
        // Move and fade particles
        particles.children.forEach(particle => {
            particle.position.add(particle.userData.velocity);
            particle.material.opacity -= 0.05;
        });
        
        if (frameCount < 10) {
            requestAnimationFrame(animate);
        } else {
            // Clean up
            scene.remove(flash);
            scene.remove(particles);
            
            // Execute callback
            if (callback) callback();
        }
    };
    
    animate();
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (!isPlayMode) {
        controls.update(); // Only update controls in build mode
    } else if (character) {
        updateCharacterMovement();
    }

    renderer.render(scene, camera);
}

animate();

// --- Add Save Course Function ---
function saveCourse() {
    // Don't save in play mode
    if (isPlayMode) {
        alert("Please exit play mode before saving.");
        return;
    }

    const courseData = {
        blocks: [],
        startMarker: null,
        finishMarker: null
    };

    // Serialize blocks
    placedBlocks.forEach(block => {
        // Ensure we only save actual blocks, not markers that might be temporarily in the array during play mode
        if (block.userData.type !== 'start' && block.userData.type !== 'finish') {
            courseData.blocks.push({
                x: block.position.x,
                y: block.position.y,
                z: block.position.z,
                type: block.userData.type || 'regular' // Ensure type is saved
            });
        }
    });

    // Serialize start marker
    if (startMarker) {
        courseData.startMarker = {
            x: startMarker.position.x,
            y: startMarker.position.y,
            z: startMarker.position.z
        };
    }

    // Serialize finish marker
    if (finishMarker) {
        courseData.finishMarker = {
            x: finishMarker.position.x,
            y: finishMarker.position.y,
            z: finishMarker.position.z
        };
    }

    // Store in localStorage
    try {
        localStorage.setItem('obstacleCourseData', JSON.stringify(courseData));
        alert('Course saved successfully!');
        console.log("Saved Data:", courseData);
    } catch (error) {
        console.error("Error saving course:", error);
        alert('Failed to save course. LocalStorage might be full or disabled.');
    }
}

// --- Add Load Course Function ---
function loadCourse() {
    // Don't load in play mode
    if (isPlayMode) {
        alert("Please exit play mode before loading.");
        return;
    }

    const savedData = localStorage.getItem('obstacleCourseData');
    if (!savedData) {
        alert('No saved course found.');
        return;
    }

    try {
        const courseData = JSON.parse(savedData);
        console.log("Loading Data:", courseData);

        // --- Clear existing objects ---
        // Remove all placed blocks
        placedBlocks.forEach(block => scene.remove(block));
        placedBlocks.length = 0; // Clear the array

        // Remove start marker
        if (startMarker) {
            scene.remove(startMarker);
            startMarker = null;
        }
        // Remove finish marker
        if (finishMarker) {
            scene.remove(finishMarker);
            finishMarker = null;
        }

        // --- Rebuild the scene ---
        // Recreate blocks
        courseData.blocks.forEach(blockData => {
            const materialType = materialTypes[blockData.type] || materialTypes.regular;
            const newCube = new THREE.Mesh(cubeGeometry, materialType.material.clone());
            newCube.position.set(blockData.x, blockData.y, blockData.z);
            newCube.userData = { ...materialType.properties }; // Restore properties
            scene.add(newCube);
            placedBlocks.push(newCube);
        });

        // Recreate start marker
        if (courseData.startMarker) {
            startMarker = new THREE.Mesh(markerGeometry, startMarkerMaterial);
            startMarker.position.set(courseData.startMarker.x, courseData.startMarker.y, courseData.startMarker.z);
            startMarker.userData = { type: 'start' };
            scene.add(startMarker);
        }

        // Recreate finish marker
        if (courseData.finishMarker) {
            finishMarker = new THREE.Mesh(markerGeometry, finishMarkerMaterial);
            finishMarker.position.set(courseData.finishMarker.x, courseData.finishMarker.y, courseData.finishMarker.z);
            finishMarker.userData = { type: 'finish' };
            scene.add(finishMarker);
        }

        alert('Course loaded successfully!');

    } catch (error) {
        console.error("Error loading course:", error);
        alert('Failed to load course. Saved data might be corrupted.');
    }
}
// --- End Save/Load Functions ---

// Add back button to return to the landing page
const backButton = document.createElement('button');
backButton.id = 'backButton';
backButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
    ${startInPlayMode ? 'Back to Obstacle Selector' : 'Back to Menu'}
`;
backButton.style.position = 'absolute';
backButton.style.top = '20px';
backButton.style.right = '20px';
backButton.style.padding = '8px 15px';
backButton.style.backgroundColor = '#333';
backButton.style.color = 'white';
backButton.style.border = 'none';
backButton.style.borderRadius = '5px';
backButton.style.cursor = 'pointer';
backButton.style.display = 'flex';
backButton.style.alignItems = 'center';
backButton.style.gap = '8px';
backButton.style.zIndex = '100';

backButton.addEventListener('click', function() {
    // In play mode with a predefined course, go to course selection
    if (startInPlayMode && isPlayMode) {
        window.location.href = 'index.html?showCourses=true';
    } else {
        // Otherwise go back to the main landing page
        window.location.href = 'index.html';
    }
});

document.body.appendChild(backButton);

// -- Initialize with selected course if in Play mode --
function initializeFromSelectedCourse() {
    if (startInPlayMode) {
        const selectedCourseData = localStorage.getItem('selectedCourse');
        
        if (selectedCourseData) {
            try {
                const courseData = JSON.parse(selectedCourseData);
                
                // Set the global selectedCourse variable
                selectedCourse = {
                    id: courseData.id || 'custom',
                    title: courseData.title || 'Custom Course'
                };
                
                // Clear existing course
                // Remove all placed blocks
                placedBlocks.forEach(block => scene.remove(block));
                placedBlocks.length = 0; // Clear the array

                // Hide the build mode button completely in predefined courses
                buildModeButton.style.display = 'none';
                
                // Hide the mode toggle button in predefined courses
                modeToggleButton.style.display = 'none';

                // Remove start marker
                if (startMarker) {
                    scene.remove(startMarker);
                    startMarker = null;
                }
                
                // Remove finish marker
                if (finishMarker) {
                    scene.remove(finishMarker);
                    finishMarker = null;
                }

                // Recreate blocks from the course data
                if (courseData.blocks && Array.isArray(courseData.blocks)) {
                    courseData.blocks.forEach(blockData => {
                        const materialType = materialTypes[blockData.type] || materialTypes.regular;
                        const newCube = new THREE.Mesh(cubeGeometry, materialType.material.clone());
                        newCube.position.set(blockData.x, blockData.y, blockData.z);
                        newCube.userData = { ...materialType.properties }; // Restore properties
                        scene.add(newCube);
                        placedBlocks.push(newCube);
                    });
                }

                // Recreate start marker
                if (courseData.startMarker) {
                    startMarker = new THREE.Mesh(markerGeometry, startMarkerMaterial);
                    startMarker.position.set(
                        courseData.startMarker.x,
                        courseData.startMarker.y,
                        courseData.startMarker.z
                    );
                    startMarker.userData = { type: 'start' };
                    scene.add(startMarker);
                }

                // Recreate finish marker
                if (courseData.finishMarker) {
                    finishMarker = new THREE.Mesh(markerGeometry, finishMarkerMaterial);
                    finishMarker.position.set(
                        courseData.finishMarker.x,
                        courseData.finishMarker.y,
                        courseData.finishMarker.z
                    );
                    finishMarker.userData = { type: 'finish' };
                    scene.add(finishMarker);
                }

                // Automatically enter play mode after loading
                setTimeout(() => {
                    togglePlayMode();
                }, 500);
                
            } catch (error) {
                console.error("Error loading course data:", error);
                alert("There was an error loading the course. Returning to main menu.");
                window.location.href = 'index.html';
            }
        }
    }
}

// Call initializeFromSelectedCourse once the document is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    initializeFromSelectedCourse();
});

// Add mouse wheel handler for zooming
function handleMouseWheel(event) {
    // Prevent default scrolling behavior
    event.preventDefault();
    
    // Determine scroll direction (deltaY is positive when scrolling down/away, negative when scrolling up/toward)
    const zoomFactor = 0.05; // Adjust this value to control zoom sensitivity
    
    if (event.deltaY < 0) {
        // Scrolling up (zoom in)
        zoomLevel = Math.max(minZoomLevel, zoomLevel - zoomFactor);
    } else {
        // Scrolling down (zoom out)
        zoomLevel = Math.min(maxZoomLevel, zoomLevel + zoomFactor);
    }
    
    // Update camera position with new zoom level
    updateCameraPosition();
}

// Initialize mobile touch controls
function initMobileTouchControls() {
    // Check if mobile controls elements exist, create them if not
    let mobileControls = document.getElementById('mobile-controls');
    
    // If mobile controls don't exist, create the elements dynamically
    if (!mobileControls) {
        // Create the mobile controls container
        mobileControls = document.createElement('div');
        mobileControls.id = 'mobile-controls';
        
        // Create the virtual joystick
        const joystickElement = document.createElement('div');
        joystickElement.id = 'virtual-joystick';
        
        // Create the joystick knob
        const joystickKnob = document.createElement('div');
        joystickKnob.id = 'joystick-knob';
        joystickElement.appendChild(joystickKnob);
        
        // Create the jump button
        const jumpButton = document.createElement('div');
        jumpButton.id = 'jump-button';
        
        // Create the jump button icon (SVG)
        jumpButton.innerHTML = `
            <svg id="jump-button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M8 12l4-4 4 4H8z"/>
                <path d="M12 16V8"/>
            </svg>
        `;
        
        // Add the elements to the mobile controls container
        mobileControls.appendChild(joystickElement);
        mobileControls.appendChild(jumpButton);
        
        // Add the mobile controls to the document body
        document.body.appendChild(mobileControls);
    }
    
    // Get references to elements (whether they existed before or were just created)
    const joystickElement = document.getElementById('virtual-joystick');
    const joystickKnob = document.getElementById('joystick-knob');
    const jumpButton = document.getElementById('jump-button');
    
    // Joystick touch event handlers
    joystickElement.addEventListener('touchstart', handleJoystickStart);
    joystickElement.addEventListener('touchmove', handleJoystickMove);
    joystickElement.addEventListener('touchend', handleJoystickEnd);
    
    // Jump button event handlers
    jumpButton.addEventListener('touchstart', handleJumpStart);
    jumpButton.addEventListener('touchend', handleJumpEnd);
    
    // Add pinch-to-zoom functionality
    document.addEventListener('touchstart', handlePinchStart, { passive: false });
    document.addEventListener('touchmove', handlePinchMove, { passive: false });
    document.addEventListener('touchend', handlePinchEnd, { passive: false });
    
    // Add camera rotation on touch
    document.addEventListener('touchstart', handleTouchRotateStart);
    document.addEventListener('touchmove', handleTouchRotateMove);
    document.addEventListener('touchend', handleTouchRotateEnd);
    
    // Add orientation change listener
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);
    
    // Force update on initial load to ensure controls are visible
    handleOrientationChange();
}

// Handle orientation changes
function handleOrientationChange() {
    if (!isPlayMode || !isMobile) return;
    
    // Get the mobile controls
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;
    
    // Force the controls to be visible
    setTimeout(() => {
        if (mobileControls.classList.contains('mobile-active')) {
            // Force a repaint by toggling the class
            mobileControls.classList.remove('mobile-active');
            // Force browser to process the change
            void mobileControls.offsetWidth;
            // Add it back
            mobileControls.classList.add('mobile-active');
            
            // Explicitly set display style to ensure visibility
            mobileControls.style.display = 'block';
        }
    }, 200); // Short delay to allow orientation change to complete
}

// Remove mobile touch controls
function removeMobileTouchControls() {
    // Virtual joystick element
    const joystickElement = document.getElementById('virtual-joystick');
    const jumpButton = document.getElementById('jump-button');
    
    // Remove joystick touch event handlers
    joystickElement.removeEventListener('touchstart', handleJoystickStart);
    joystickElement.removeEventListener('touchmove', handleJoystickMove);
    joystickElement.removeEventListener('touchend', handleJoystickEnd);
    
    // Remove jump button event handlers
    jumpButton.removeEventListener('touchstart', handleJumpStart);
    jumpButton.removeEventListener('touchend', handleJumpEnd);
    
    // Remove pinch-to-zoom functionality
    document.removeEventListener('touchstart', handlePinchStart);
    document.removeEventListener('touchmove', handlePinchMove);
    document.removeEventListener('touchend', handlePinchEnd);
    
    // Remove camera rotation touch handlers
    document.removeEventListener('touchstart', handleTouchRotateStart);
    document.removeEventListener('touchmove', handleTouchRotateMove);
    document.removeEventListener('touchend', handleTouchRotateEnd);
}

// Mobile touch controls functions
function handleTouchRotateStart(event) {
    if (isCountingDown) return;
    
    // Only activate camera rotation if touch is not on joystick or jump button
    if (!isControlElement(event.target)) {
        touchRotateActive = true;
        lastTouchX = event.touches[0].clientX;
        lastTouchY = event.touches[0].clientY;
    }
}

function handleTouchRotateMove(event) {
    if (isCountingDown) return;
    
    if (event.touches.length === 1) {
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        
        // Calculate the movement delta
        const deltaX = touchX - lastTouchX;
        const deltaY = touchY - lastTouchY;
        
        // Update camera rotation angle (horizontal)
        cameraRotationAngle -= deltaX * 0.01;
        
        // Update vertical rotation angle with constraints
        verticalRotationAngle -= deltaY * 0.01;
        verticalRotationAngle = Math.max(minVerticalAngle, Math.min(verticalRotationAngle, maxVerticalAngle));
        
        // Update last position
        lastTouchX = touchX;
        lastTouchY = touchY;
        
        // Update camera position
        updateCameraPosition();
    }
}

function handleTouchRotateEnd(event) {
    touchRotateActive = false;
}

function isControlElement(element) {
    const joystickElement = document.getElementById('virtual-joystick');
    const jumpButton = document.getElementById('jump-button');
    return element === joystickElement || 
           joystickElement.contains(element) || 
           element === jumpButton || 
           jumpButton.contains(element);
}

function handleJoystickStart(event) {
    if (isCountingDown || !canCharacterMove) return;
    
    event.preventDefault();
    joystickActive = true;
    updateJoystickPosition(event);
}

function handleJoystickMove(event) {
    if (isCountingDown || !canCharacterMove) return;
    
    event.preventDefault();
    if (joystickActive) {
        updateJoystickPosition(event);
    }
}

function handleJoystickEnd(event) {
    event.preventDefault();
    joystickActive = false;
    joystickPosition = { x: 0, y: 0 };
    const joystickKnob = document.getElementById('joystick-knob');
    joystickKnob.style.transform = 'translate(-50%, -50%)';
}

function updateJoystickPosition(event) {
    if (isCountingDown || !canCharacterMove) return;
    
    const joystickElement = document.getElementById('virtual-joystick');
    const joystickKnob = document.getElementById('joystick-knob');
    const touch = event.touches[0];
    const joystickRect = joystickElement.getBoundingClientRect();
    
    // Calculate joystick position relative to center
    const centerX = joystickRect.left + joystickRect.width / 2;
    const centerY = joystickRect.top + joystickRect.height / 2;
    
    // Get touch position relative to center
    let x = touch.clientX - centerX;
    let y = touch.clientY - centerY;
    
    // Calculate distance from center
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = joystickRect.width / 2 - joystickKnob.offsetWidth / 2;
    
    // Normalize if distance is greater than maxDistance
    if (distance > maxDistance) {
        const ratio = maxDistance / distance;
        x *= ratio;
        y *= ratio;
    }
    
    // Update joystick knob position
    joystickKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    
    // Normalize values for character movement (-1 to 1) and apply sensitivity factor
    joystickPosition.x = (x / maxDistance) * joystickSensitivity;
    joystickPosition.y = (-y / maxDistance) * joystickSensitivity; // Invert Y for forward/backward movement
}

function handleJumpStart(event) {
    if (isCountingDown || !canCharacterMove) return;
    
    event.preventDefault();
    jumpButtonActive = true;
    keysPressed[' '] = true; // Simulate space key press
}

function handleJumpEnd(event) {
    event.preventDefault();
    jumpButtonActive = false;
    keysPressed[' '] = false; // Simulate space key release
}

function handlePinchStart(event) {
    if (event.touches.length !== 2) return;
    
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    // Calculate initial distance between touch points
    lastPointerDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
    );
}

function handlePinchMove(event) {
    if (event.touches.length !== 2) return;
    event.preventDefault();
    
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    // Calculate current distance between touch points
    const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
    );
    
    // Calculate pinch delta
    const delta = currentDistance - lastPointerDistance;
    
    // Apply zoom (simulating mouse wheel)
    if (Math.abs(delta) > 5) { // Threshold to avoid tiny changes
        // Update camera zoom
        zoomLevel -= delta * 0.005;
        zoomLevel = Math.max(0.5, Math.min(zoomLevel, 2.0)); // Clamp zoom level
        
        // Update last distance
        lastPointerDistance = currentDistance;
    }
}

function handlePinchEnd(event) {
    // Reset tracking
    lastPointerDistance = 0;
}

// Function to create timer display
function createTimerDisplay() {
    // Get the timer container
    const timerContainer = document.getElementById('timer-container');
    
    // Remove existing timer if any
    if (timerDisplay) {
        timerDisplay.remove();
    }
    
    // Create timer display element
    timerDisplay = document.createElement('div');
    timerDisplay.id = 'timer-display';
    timerDisplay.textContent = '00:00.0';
    
    // Create start button
    const startButton = document.createElement('button');
    startButton.id = 'start-button';
    startButton.textContent = 'Start';
    startButton.addEventListener('click', startCountdown);
    
    // Add start button and timer to the container
    timerContainer.appendChild(startButton);
    timerContainer.appendChild(timerDisplay);
    timerContainer.style.display = 'block';
}

// Function to start the countdown
function startCountdown() {
    // Hide the start button
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.style.display = 'none';
    }
    
    // Set countdown flag
    isCountingDown = true;
    
    // Add countdown class for styling
    timerDisplay.classList.add('countdown');
    
    // Show countdown in the timer display
    timerDisplay.textContent = '3';
    
    let count = 3;
    countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            timerDisplay.textContent = count.toString();
        } else {
            // Clear countdown interval
            clearInterval(countdownInterval);
            countdownInterval = null;
            isCountingDown = false;
            
            // Remove countdown class
            timerDisplay.classList.remove('countdown');
            
            // Enable character movement
            canCharacterMove = true;
            
            // Start the timer after countdown
            startTimer();
        }
    }, 1000);
}

// Function to start the timer
function startTimer() {
    // Reset existing timer if any
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Reset timer values
    timerStartTime = Date.now();
    elapsedTime = 0;
    
    // Start interval to update timer display
    timerInterval = setInterval(updateTimer, 100); // Update every 100ms for decisecond precision
}

// Function to update the timer
function updateTimer() {
    if (!isPlayMode || isCountingDown) return;
    
    // Calculate elapsed time
    elapsedTime = Date.now() - timerStartTime;
    
    // Update display if it exists
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(elapsedTime);
    }
}

// Function to stop the timer
function stopTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        isCountingDown = false;
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Function to format time as MM:SS.d
function formatTime(milliseconds) {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const deciseconds = Math.floor((totalSeconds % 1) * 10);
    
    // Format with leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}.${deciseconds}`;
} 