document.addEventListener('DOMContentLoaded', function() {
    // Initialize liked courses array if it doesn't exist
    if (!localStorage.getItem('likedCourses')) {
        localStorage.setItem('likedCourses', JSON.stringify([]));
    }
    
    // DOM Elements
    const createButton = document.getElementById('createButton');
    const playButton = document.getElementById('playButton');
    const communityButton = document.getElementById('communityButton');
    const browseCoursesLink = document.getElementById('browseCourses');
    const courseSelection = document.getElementById('course-selection');
    const communityCoursesOverlay = document.getElementById('community-courses');
    const closeSelectionButton = document.getElementById('closeSelectionButton');
    const closeCommunityButton = document.getElementById('closeCommunityButton');
    const refreshCommunityButton = document.getElementById('refreshCommunityButton');
    const coursesGrid = document.getElementById('courses-grid');
    const communityGrid = document.getElementById('community-grid');
    const courseSearch = document.getElementById('courseSearch');
    const searchButton = document.getElementById('searchButton');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageIndicator = document.getElementById('pageIndicator');
    
    // Pagination and filtering state
    let currentPage = 1;
    let totalPages = 1;
    let itemsPerPage = 8;
    let currentFilter = 'all';
    let currentSort = 'newest';
    let searchQuery = '';
    
    // Community courses data
    let communityCourses = [];
    
    // Pre-defined courses data
    const predefinedCourses = [
        // Easy courses (2)
        {
            id: 1,
            title: 'First Steps',
            description: 'Perfect for beginners with minimal jumping required',
            difficulty: 'Easy',
            thumbnailClass: 'course-thumbnail-1',
            data: {
                blocks: [
                    // Starting area - continuous platform
                    { x: 2, y: 0.5, z: 3, type: 'regular' },
                    { x: 3, y: 0.5, z: 3, type: 'regular' },
                    { x: 4, y: 0.5, z: 3, type: 'regular' },
                    { x: 5, y: 0.5, z: 3, type: 'regular' },
                    
                    // Small step up
                    { x: 7, y: 0.5, z: 3, type: 'regular' },
                    { x: 8, y: 0.5, z: 3, type: 'regular' },
                    
                    // Gentle turn - no jumping required
                    { x: 10, y: 0.5, z: 3, type: 'regular' },
                    { x: 10, y: 0.5, z: 2, type: 'regular' },
                    { x: 10, y: 0.5, z: 1, type: 'regular' },
                    { x: 10, y: 0.5, z: 0, type: 'regular' },
                    
                    // Gentle turn back
                    { x: 11, y: 0.5, z: 0, type: 'regular' },
                    { x: 12, y: 0.5, z: 0, type: 'regular' },
                    { x: 13, y: 0.5, z: 0, type: 'regular' },
                    { x: 14, y: 0.5, z: 1, type: 'regular' },
                    { x: 14, y: 0.5, z: 2, type: 'regular' },
                    { x: 14, y: 0.5, z: 3, type: 'regular' },
                    
                    // Final stretch - one tiny gap
                    { x: 16, y: 0.5, z: 3, type: 'regular' },
                    { x: 17, y: 0.5, z: 3, type: 'regular' },
                    { x: 18, y: 0.5, z: 3, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: 20, y: 0.1, z: 3 }
            }
        },
        {
            id: 2,
            title: 'Basic Training',
            description: 'Learn the basics with simple jumps and obstacles',
            difficulty: 'Easy',
            thumbnailClass: 'course-thumbnail-2',
            data: {
                // Course data would be stored here or loaded from a separate file
                // This is a simplified version
                blocks: [
                    // Starting platform
                    { x: 2, y: 0.5, z: 3, type: 'regular' },
                    { x: 3, y: 0.5, z: 3, type: 'regular' },
                    
                    // First gap
                    { x: 5, y: 0.5, z: 3, type: 'regular' },
                    { x: 6, y: 0.5, z: 3, type: 'regular' },
                    
                    // Elevated section
                    { x: 8, y: 1.5, z: 3, type: 'regular' },
                    { x: 9, y: 1.5, z: 3, type: 'regular' },
                    
                    // Descending and gap
                    { x: 11, y: 0.5, z: 3, type: 'regular' },
                    
                    // Zigzag pattern
                    { x: 13, y: 0.5, z: 4, type: 'regular' },
                    { x: 15, y: 0.5, z: 2, type: 'regular' },
                    { x: 17, y: 0.5, z: 4, type: 'regular' },
                    { x: 19, y: 0.5, z: 2, type: 'regular' },
                    
                    // Higher elevation
                    { x: 21, y: 1.5, z: 3, type: 'regular' },
                    { x: 22, y: 1.5, z: 3, type: 'regular' },
                    
                    // Even higher with gap
                    { x: 24, y: 2.5, z: 3, type: 'regular' },
                    { x: 25, y: 2.5, z: 3, type: 'regular' },
                    
                    // Long gap to lower platform
                    { x: 28, y: 1.5, z: 3, type: 'regular' },
                    { x: 29, y: 1.5, z: 3, type: 'regular' },
                    
                    // Walk zone - continuous path without jumps
                    { x: 31, y: 0.5, z: 3, type: 'regular' },
                    { x: 32, y: 0.5, z: 3, type: 'regular' },
                    { x: 33, y: 0.5, z: 3, type: 'regular' },
                    { x: 34, y: 0.5, z: 3, type: 'regular' },
                    { x: 35, y: 0.5, z: 3, type: 'regular' },
                    { x: 36, y: 0.5, z: 3, type: 'regular' },
                    { x: 37, y: 0.5, z: 3, type: 'regular' },
                    
                    // Final approach with stepping stones
                    { x: 39, y: 0.5, z: 3, type: 'regular' },
                    { x: 41, y: 0.5, z: 3, type: 'regular' },
                    { x: 43, y: 0.5, z: 3, type: 'regular' },
                    { x: 45, y: 0.5, z: 3, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: 47, y: 0.1, z: 3 }
            }
        },
        
        // Medium courses (4)
        {
            id: 3,
            title: 'Ice Slide Challenge',
            description: 'Test your balance on extremely slippery ice blocks',
            difficulty: 'Medium',
            thumbnailClass: 'course-thumbnail-3',
            data: {
                blocks: [
                    // Starting ice platform
                    { x: 2, y: 0.5, z: 3, type: 'ice' },
                    { x: 3, y: 0.5, z: 3, type: 'ice' },
                    { x: 4, y: 0.5, z: 3, type: 'ice' },
                    
                    // First diagonal slide section
                    { x: 5, y: 0.5, z: 2, type: 'ice' },
                    { x: 6, y: 0.5, z: 1, type: 'ice' },
                    { x: 7, y: 0.5, z: 0, type: 'ice' },
                    { x: 8, y: 0.5, z: -1, type: 'ice' },
                    
                    // Stability platform (regular block)
                    { x: 9, y: 0.5, z: -1, type: 'regular' },
                    
                    // Second slide section - S-curve
                    { x: 10, y: 0.5, z: -1, type: 'ice' },
                    { x: 11, y: 0.5, z: -1, type: 'ice' },
                    { x: 12, y: 0.5, z: -1, type: 'ice' },
                    { x: 13, y: 0.5, z: 0, type: 'ice' },
                    { x: 14, y: 0.5, z: 1, type: 'ice' },
                    { x: 15, y: 0.5, z: 2, type: 'ice' },
                    { x: 16, y: 0.5, z: 2, type: 'ice' },
                    { x: 17, y: 0.5, z: 1, type: 'ice' },
                    { x: 18, y: 0.5, z: 0, type: 'ice' },
                    { x: 19, y: 0.5, z: -1, type: 'ice' },
                    
                    // Second stability platform
                    { x: 20, y: 0.5, z: -1, type: 'regular' },
                    
                    // Descending ice slide
                    { x: 21, y: 0.5, z: -1, type: 'ice' },
                    { x: 22, y: 0.4, z: -1, type: 'ice' },
                    { x: 23, y: 0.3, z: -1, type: 'ice' },
                    { x: 24, y: 0.2, z: -1, type: 'ice' },
                    
                    // Uphill challenge
                    { x: 25, y: 0.3, z: -1, type: 'ice' },
                    { x: 26, y: 0.4, z: -1, type: 'ice' },
                    { x: 27, y: 0.5, z: -1, type: 'ice' },
                    { x: 28, y: 0.6, z: -1, type: 'ice' },
                    { x: 29, y: 0.5, z: -1, type: 'ice' },
                    
                    // Final approach with zigzag ice pattern
                    { x: 30, y: 0.5, z: -2, type: 'ice' },
                    { x: 31, y: 0.5, z: -3, type: 'ice' },
                    { x: 32, y: 0.5, z: -2, type: 'ice' },
                    { x: 33, y: 0.5, z: -1, type: 'ice' },
                    { x: 34, y: 0.5, z: 0, type: 'ice' },
                    { x: 35, y: 0.5, z: 1, type: 'ice' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: 37, y: 0.1, z: 1 }
            }
        },
        {
            id: 4,
            title: 'Bounce House',
            description: 'Navigate through a course of bouncy platforms',
            difficulty: 'Medium',
            thumbnailClass: 'course-thumbnail-4',
            data: {
                blocks: [
                    // Starting section - basic bounces
                    { x: 2, y: 0.5, z: 3, type: 'bouncy' },
                    { x: 4, y: 0.5, z: 3, type: 'bouncy' },
                    { x: 6, y: 0.5, z: 3, type: 'bouncy' },
                    
                    // Recovery platform
                    { x: 8, y: 0.5, z: 3, type: 'regular' },
                    
                    // Diagonal bounce pattern
                    { x: 10, y: 0.5, z: 4, type: 'bouncy' },
                    { x: 12, y: 0.5, z: 5, type: 'bouncy' },
                    { x: 14, y: 0.5, z: 4, type: 'bouncy' },
                    { x: 16, y: 0.5, z: 3, type: 'bouncy' },
                    { x: 18, y: 0.5, z: 2, type: 'bouncy' },
                    
                    // Recovery platform
                    { x: 20, y: 0.5, z: 2, type: 'regular' },
                    
                    // Zigzag with height variations
                    { x: 22, y: 0.5, z: 1, type: 'bouncy' },
                    { x: 23, y: 1.5, z: 0, type: 'bouncy' },
                    { x: 24, y: 0.5, z: -1, type: 'bouncy' },
                    { x: 25, y: 1.5, z: 0, type: 'bouncy' },
                    { x: 26, y: 0.5, z: 1, type: 'bouncy' },
                    
                    // Recovery platform
                    { x: 28, y: 0.5, z: 1, type: 'regular' },
                    
                    // Bounce gap challenge
                    { x: 30, y: 0.5, z: 1, type: 'bouncy' },
                    { x: 33, y: 0.5, z: 1, type: 'bouncy' },
                    { x: 36, y: 0.5, z: 1, type: 'bouncy' },
                    
                    // Final bounce section
                    { x: 38, y: 0.5, z: 0, type: 'bouncy' },
                    { x: 39, y: 0.5, z: -1, type: 'bouncy' },
                    { x: 40, y: 0.5, z: -2, type: 'bouncy' },
                    { x: 41, y: 0.5, z: -1, type: 'bouncy' },
                    { x: 42, y: 0.5, z: 0, type: 'bouncy' },
                    { x: 43, y: 0.5, z: 1, type: 'bouncy' },
                    { x: 44, y: 0.5, z: 2, type: 'bouncy' },
                    { x: 45, y: 0.5, z: 3, type: 'bouncy' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: 47, y: 0.1, z: 3 }
            }
        },
        {
            id: 5,
            title: 'Sticky Situation',
            description: 'Navigate through a mix of sticky and regular blocks that require careful climbing',
            difficulty: 'Medium',
            thumbnailClass: 'course-thumbnail-5',
            data: {
                blocks: [
                    // Initial climb section with alternating blocks
                    { x: 2, y: 0.5, z: 3, type: 'sticky' },
                    { x: 3, y: 1.5, z: 3, type: 'regular' }, // Regular block to allow jumping
                    { x: 4, y: 2.5, z: 3, type: 'sticky' },
                    { x: 5, y: 3.5, z: 3, type: 'regular' }, // Regular block to allow jumping
                    { x: 6, y: 4.5, z: 3, type: 'sticky' },
                    
                    // Horizontal path with mixed blocks
                    { x: 7, y: 4.5, z: 3, type: 'regular' }, // Regular block to allow jumping
                    { x: 8, y: 4.5, z: 3, type: 'sticky' },
                    { x: 9, y: 4.5, z: 3, type: 'regular' }, // Regular block to allow jumping
                    { x: 10, y: 4.5, z: 3, type: 'sticky' },
                    
                    // Drop to platform and rest
                    { x: 10, y: 2.5, z: 3, type: 'regular' },
                    { x: 11, y: 2.5, z: 3, type: 'regular' },
                    
                    // Wall climb with jumping options
                    { x: 12, y: 3.5, z: 3, type: 'sticky' },
                    { x: 12, y: 4.5, z: 3, type: 'regular' }, // Regular block to allow jumping
                    { x: 12, y: 5.5, z: 3, type: 'sticky' },
                    
                    // Ceiling traverse with jumping sections
                    { x: 13, y: 5.5, z: 3, type: 'regular' }, // Regular block to allow jumping
                    { x: 14, y: 5.5, z: 3, type: 'sticky' },
                    { x: 15, y: 5.5, z: 3, type: 'regular' }, // Regular block to allow jumping
                    
                    // Side path with alternating blocks
                    { x: 15, y: 5.5, z: 2, type: 'sticky' },
                    { x: 15, y: 5.5, z: 1, type: 'regular' }, // Regular block to allow jumping
                    { x: 15, y: 5.5, z: 0, type: 'sticky' },
                    
                    // Descending zigzag with jumping opportunities
                    { x: 14, y: 4.5, z: 0, type: 'regular' }, // Regular block to allow jumping
                    { x: 13, y: 3.5, z: 0, type: 'sticky' },
                    { x: 12, y: 2.5, z: 0, type: 'regular' }, // Regular block to allow jumping
                    
                    // Platform break
                    { x: 11, y: 2.5, z: 0, type: 'regular' },
                    
                    // Climb up with jumping options
                    { x: 10, y: 3.5, z: 0, type: 'sticky' },
                    { x: 9, y: 4.5, z: 0, type: 'regular' }, // Regular block to allow jumping
                    { x: 8, y: 5.5, z: 0, type: 'sticky' },
                    { x: 7, y: 6.5, z: 0, type: 'regular' }, // Regular block to allow jumping
                    
                    // High path with jumping opportunities
                    { x: 6, y: 6.5, z: 0, type: 'sticky' },
                    { x: 5, y: 6.5, z: 0, type: 'regular' }, // Regular block to allow jumping
                    { x: 4, y: 6.5, z: 0, type: 'sticky' },
                    { x: 3, y: 6.5, z: 0, type: 'regular' }, // Regular block to allow jumping
                    
                    // Final descent with mixed blocks
                    { x: 2, y: 5.5, z: 0, type: 'sticky' },
                    { x: 1, y: 4.5, z: 0, type: 'regular' }, // Regular block to allow jumping
                    
                    // Victory platform and extended path to new finish
                    { x: 0, y: 4.5, z: 0, type: 'regular' },
                    { x: -1, y: 4.5, z: -1, type: 'regular' },
                    { x: -2, y: 4.5, z: -2, type: 'sticky' },
                    { x: -3, y: 4.5, z: -3, type: 'regular' },
                    { x: -4, y: 4.5, z: -4, type: 'regular' },
                    { x: -5, y: 4.5, z: -4, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: -5, y: 4.6, z: -4 }
            }
        },
        {
            id: 5,
            title: 'Spiral Path',
            description: 'Climb an extreme spiral with challenging materials and then freefall through the center to reach the finish far below',
            difficulty: 'Medium',
            thumbnailClass: 'course-thumbnail-6',
            data: {
                blocks: [
                    // Ground floor - outer spiral start
                    { x: 2, y: 0.5, z: 3, type: 'regular' },
                    { x: 3, y: 0.5, z: 3, type: 'regular' },
                    { x: 4, y: 0.5, z: 3, type: 'regular' },
                    { x: 5, y: 0.5, z: 3, type: 'regular' },
                    { x: 6, y: 0.5, z: 3, type: 'regular' },
                    { x: 7, y: 0.5, z: 3, type: 'regular' },
                    
                    // Outer ring - second side (ice section - slippery!)
                    { x: 7, y: 1.0, z: 2, type: 'ice' },
                    { x: 7, y: 1.0, z: 1, type: 'ice' },
                    { x: 7, y: 1.0, z: 0, type: 'ice' },
                    { x: 7, y: 1.0, z: -1, type: 'ice' },
                    { x: 7, y: 1.0, z: -2, type: 'ice' },
                    
                    // Outer ring - third side (regular blocks for recovery)
                    { x: 6, y: 1.5, z: -2, type: 'regular' },
                    { x: 5, y: 1.5, z: -2, type: 'regular' },
                    { x: 4, y: 1.5, z: -2, type: 'regular' },
                    { x: 3, y: 1.5, z: -2, type: 'regular' },
                    { x: 2, y: 1.5, z: -2, type: 'regular' },
                    
                    // Outer ring - fourth side (bouncy section - unpredictable!)
                    { x: 2, y: 2.0, z: -1, type: 'bouncy' },
                    { x: 2, y: 2.0, z: 0, type: 'bouncy' },
                    { x: 2, y: 2.0, z: 1, type: 'bouncy' },
                    { x: 2, y: 2.0, z: 2, type: 'bouncy' },
                    
                    // Inner ring - first side (alternating sticky and regular for better jumping)
                    { x: 3, y: 2.5, z: 2, type: 'sticky' },
                    { x: 4, y: 2.5, z: 2, type: 'regular' },
                    { x: 5, y: 2.5, z: 2, type: 'sticky' },
                    { x: 6, y: 2.5, z: 2, type: 'regular' },
                    
                    // Inner ring - second side (explosion hazards - be careful!)
                    { x: 6, y: 3.0, z: 1, type: 'regular' },
                    { x: 6, y: 3.0, z: 0, type: 'explosion' },
                    { x: 6, y: 3.0, z: -1, type: 'regular' },
                    
                    // Inner ring - third side (ice again - slippery!)
                    { x: 5, y: 3.5, z: -1, type: 'ice' },
                    { x: 4, y: 3.5, z: -1, type: 'ice' },
                    { x: 3, y: 3.5, z: -1, type: 'ice' },
                    
                    // Inner ring - fourth side (bouncy section - unpredictable!)
                    { x: 3, y: 4.0, z: 0, type: 'bouncy' },
                    { x: 3, y: 4.0, z: 1, type: 'bouncy' },
                    
                    // Higher ring - first side (regular blocks for recovery)
                    { x: 4, y: 4.5, z: 2, type: 'regular' },
                    { x: 5, y: 4.5, z: 2, type: 'regular' },
                    
                    // Higher ring - second side (alternating sticky and regular)
                    { x: 5, y: 5.0, z: 1, type: 'sticky' },
                    { x: 5, y: 5.0, z: 0, type: 'regular' },
                    
                    // Higher ring - third side (explosion challenges)
                    { x: 4, y: 5.5, z: 0, type: 'explosion' },
                    { x: 3, y: 5.5, z: 0, type: 'regular' },
                    
                    // Higher ring - fourth side (ice section - slippery!)
                    { x: 3, y: 6.0, z: 1, type: 'ice' },
                    { x: 4, y: 6.0, z: 1, type: 'ice' },
                    { x: 5, y: 6.0, z: 1, type: 'ice' },
                    
                    // Even higher ring - first side (bouncy section)
                    { x: 5, y: 6.5, z: 0, type: 'bouncy' },
                    { x: 5, y: 6.5, z: -1, type: 'bouncy' },
                    
                    // Even higher ring - second side (alternating sticky and regular)
                    { x: 4, y: 7.0, z: -1, type: 'sticky' },
                    { x: 3, y: 7.0, z: -1, type: 'regular' },
                    
                    // Even higher ring - third side (explosion hazards)
                    { x: 3, y: 7.5, z: 0, type: 'regular' },
                    { x: 3, y: 7.5, z: 1, type: 'explosion' },
                    
                    // Even higher ring - fourth side (icy path)
                    { x: 4, y: 8.0, z: 1, type: 'ice' },
                    { x: 5, y: 8.0, z: 1, type: 'ice' },
                    
                    // Advanced climb - first side (ice block, moved away from center)
                    { x: 5, y: 8.5, z: 0, type: 'ice' },
                    { x: 5, y: 8.5, z: -1, type: 'regular' },
                    
                    // Advanced climb - second side (better spaced for jumping)
                    { x: 4, y: 9.0, z: -1, type: 'bouncy' },
                    { x: 3, y: 9.0, z: -1, type: 'explosion' },
                    
                    // Advanced climb - third side (moved to edge, away from center)
                    { x: 2, y: 9.5, z: 0, type: 'regular' },
                    { x: 2, y: 10.0, z: 0, type: 'sticky' },
                    
                    // Advanced climb - vertical section (moved to edge, away from center)
                    { x: 1, y: 10.5, z: 0, type: 'regular' },
                    { x: 1, y: 11.0, z: 0, type: 'sticky' },
                    { x: 1, y: 11.5, z: 0, type: 'regular' },
                    
                    // Advanced climb - horizontal stretch (ice bridge, moved away from center)
                    { x: 1, y: 12.0, z: 1, type: 'ice' },
                    { x: 1, y: 12.0, z: 2, type: 'ice' },
                    { x: 2, y: 12.0, z: 2, type: 'ice' },
                    { x: 3, y: 12.0, z: 2, type: 'ice' },
                    
                    // Advanced climb - vertical challenge (moved to edge, away from center)
                    { x: 3, y: 12.5, z: 3, type: 'explosion' },
                    { x: 3, y: 13.0, z: 3, type: 'bouncy' },
                    { x: 3, y: 13.5, z: 3, type: 'bouncy' },
                    
                    // Final climb - zig-zag path (moved away from center)
                    { x: 2, y: 14.0, z: 3, type: 'regular' },
                    { x: 1, y: 14.5, z: 3, type: 'ice' },
                    { x: 0, y: 15.0, z: 3, type: 'bouncy' },
                    { x: -1, y: 15.5, z: 3, type: 'regular' },
                    { x: -2, y: 16.0, z: 3, type: 'explosion' },
                    
                    // Summit (regular block for relief, moved to edge)
                    { x: -2, y: 16.5, z: 2, type: 'regular' },
                    
                    // Landing platform below - where player will fall to finish (Much deeper)
                    { x: 4, y: -12.0, z: 0, type: 'regular' },
                    { x: 5, y: -12.0, z: 0, type: 'regular' },
                    { x: 5, y: -12.0, z: 1, type: 'regular' },
                    { x: 4, y: -12.0, z: 1, type: 'regular' },
                    
                    // Barrier to prevent direct jumping from start to finish
                    { x: 2, y: -6.0, z: 2, type: 'regular' },
                    { x: 3, y: -6.0, z: 2, type: 'regular' },
                    { x: 2, y: -6.0, z: 1, type: 'regular' },
                    { x: 3, y: -6.0, z: 1, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: 4.5, y: -11.9, z: 0.5 }
            }
        },
    
        // Hard courses (3)
        {
            id: 7,
            title: 'Explosive Path',
            description: 'Navigate through a dangerous course of exploding blocks and mixed obstacles',
            difficulty: 'Hard',
            thumbnailClass: 'course-thumbnail-7',
            data: {
                blocks: [
                    // Starting section
                    { x: 2, y: 0.5, z: 3, type: 'regular' },
                    { x: 3, y: 0.5, z: 3, type: 'regular' },
                    { x: 4, y: 0.5, z: 3, type: 'regular' },
                    
                    // First explosive challenge
                    { x: 6, y: 0.5, z: 3, type: 'explosion' },
                    { x: 7, y: 0.5, z: 3, type: 'explosion' },
                    { x: 8, y: 0.5, z: 3, type: 'regular' },
                    
                    // Ice path leading to explosives
                    { x: 10, y: 0.5, z: 3, type: 'ice' },
                    { x: 11, y: 0.5, z: 3, type: 'ice' },
                    { x: 12, y: 0.5, z: 3, type: 'ice' },
                    { x: 13, y: 0.5, z: 3, type: 'explosion' },
                    { x: 14, y: 0.5, z: 3, type: 'regular' },
                    
                    // Bouncy section with explosives
                    { x: 16, y: 0.5, z: 3, type: 'bouncy' },
                    { x: 18, y: 0.5, z: 3, type: 'explosion' },
                    { x: 20, y: 0.5, z: 3, type: 'bouncy' },
                    { x: 22, y: 0.5, z: 3, type: 'regular' },
                    
                    // Sticky climb with explosives
                    { x: 23, y: 1.5, z: 3, type: 'sticky' },
                    { x: 23, y: 2.5, z: 3, type: 'explosion' },
                    { x: 23, y: 3.5, z: 3, type: 'sticky' },
                    { x: 24, y: 3.5, z: 3, type: 'regular' },
                    
                    // Teleport section
                    { x: 26, y: 3.5, z: 3, type: 'teleport' },
                    { x: 26, y: 0.5, z: 0, type: 'regular' },
                    { x: 27, y: 0.5, z: 0, type: 'regular' },
                    
                    // Zigzag with explosives
                    { x: 29, y: 0.5, z: 0, type: 'explosion' },
                    { x: 30, y: 0.5, z: 1, type: 'regular' },
                    { x: 31, y: 0.5, z: 0, type: 'explosion' },
                    { x: 32, y: 0.5, z: 1, type: 'regular' },
                    { x: 33, y: 0.5, z: 0, type: 'explosion' },
                    
                    // Ice slide with explosives
                    { x: 35, y: 0.5, z: 0, type: 'ice' },
                    { x: 36, y: 0.5, z: -1, type: 'ice' },
                    { x: 37, y: 0.5, z: -2, type: 'explosion' },
                    { x: 38, y: 0.5, z: -3, type: 'ice' },
                    { x: 39, y: 0.5, z: -2, type: 'regular' },
                    
                    // Bouncy explosion field
                    { x: 41, y: 0.5, z: -2, type: 'bouncy' },
                    { x: 42, y: 0.5, z: -2, type: 'explosion' },
                    { x: 43, y: 0.5, z: -2, type: 'bouncy' },
                    { x: 44, y: 0.5, z: -2, type: 'explosion' },
                    { x: 45, y: 0.5, z: -2, type: 'bouncy' },
                    
                    // Sticky wall traverse with explosives
                    { x: 47, y: 0.5, z: -2, type: 'regular' },
                    { x: 47, y: 1.5, z: -2, type: 'sticky' },
                    { x: 47, y: 2.5, z: -2, type: 'explosion' },
                    { x: 47, y: 3.5, z: -2, type: 'sticky' },
                    { x: 47, y: 4.5, z: -2, type: 'sticky' },
                    { x: 48, y: 4.5, z: -2, type: 'regular' },
                    
                    // Teleport to higher platform
                    { x: 50, y: 4.5, z: -2, type: 'teleport' },
                    { x: 50, y: 6.5, z: 2, type: 'regular' },
                    { x: 51, y: 6.5, z: 2, type: 'regular' },
                    
                    // Explosive descent
                    { x: 52, y: 5.5, z: 2, type: 'explosion' },
                    { x: 53, y: 4.5, z: 2, type: 'regular' },
                    { x: 54, y: 3.5, z: 2, type: 'explosion' },
                    { x: 55, y: 2.5, z: 2, type: 'regular' },
                    
                    // Ice bridges with explosives
                    { x: 57, y: 2.5, z: 2, type: 'ice' },
                    { x: 58, y: 2.5, z: 2, type: 'explosion' },
                    { x: 59, y: 2.5, z: 2, type: 'ice' },
                    { x: 60, y: 2.5, z: 1, type: 'ice' },
                    { x: 60, y: 2.5, z: 0, type: 'ice' },
                    
                    // Mixed material section
                    { x: 60, y: 2.5, z: -1, type: 'bouncy' },
                    { x: 60, y: 2.5, z: -2, type: 'sticky' },
                    { x: 60, y: 2.5, z: -3, type: 'explosion' },
                    { x: 60, y: 2.5, z: -4, type: 'teleport' },
                    { x: 60, y: 2.5, z: -5, type: 'regular' },
                    
                    // Final approach
                    { x: 58, y: 2.5, z: -5, type: 'regular' },
                    { x: 56, y: 2.5, z: -5, type: 'explosion' },
                    { x: 54, y: 2.5, z: -5, type: 'regular' },
                    { x: 52, y: 2.5, z: -5, type: 'explosion' },
                    { x: 50, y: 2.5, z: -5, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: 48, y: 2.6, z: -5 }
            }
        },
        {
            id: 8,
            title: 'Teleport Maze',
            description: 'Find your way through a complex maze of teleporting blocks and challenging obstacles',
            difficulty: 'Hard',
            thumbnailClass: 'course-thumbnail-8',
            data: {
                blocks: [
                    // Starting section
                    { x: 2, y: 0.5, z: 3, type: 'regular' },
                    { x: 3, y: 0.5, z: 3, type: 'regular' },
                    
                    // First teleport puzzle
                    { x: 5, y: 0.5, z: 3, type: 'teleport' },
                    { x: 5, y: 0.5, z: -5, type: 'regular' }, // Teleport destination
                    { x: 6, y: 0.5, z: -5, type: 'regular' },
                    
                    // Ice path leading to teleport
                    { x: 7, y: 0.5, z: -5, type: 'ice' },
                    { x: 8, y: 0.5, z: -5, type: 'ice' },
                    { x: 9, y: 0.5, z: -5, type: 'ice' },
                    { x: 10, y: 0.5, z: -5, type: 'teleport' },
                    { x: -5, y: 2.5, z: 0, type: 'regular' }, // Teleport destination
                    
                    // Sticky wall path
                    { x: -5, y: 3.5, z: 0, type: 'sticky' },
                    { x: -5, y: 4.5, z: 0, type: 'sticky' },
                    { x: -4, y: 4.5, z: 0, type: 'sticky' },
                    { x: -3, y: 4.5, z: 0, type: 'sticky' },
                    { x: -2, y: 4.5, z: 0, type: 'regular' },
                    
                    // Bouncy sequence to teleport
                    { x: 0, y: 4.5, z: 0, type: 'bouncy' },
                    { x: 2, y: 4.5, z: 0, type: 'bouncy' },
                    { x: 4, y: 4.5, z: 0, type: 'teleport' },
                    { x: 4, y: 0.5, z: 8, type: 'regular' }, // Teleport destination
                    
                    // Explosive challenge
                    { x: 5, y: 0.5, z: 8, type: 'explosion' },
                    { x: 6, y: 0.5, z: 8, type: 'regular' },
                    { x: 7, y: 0.5, z: 8, type: 'explosion' },
                    { x: 8, y: 0.5, z: 8, type: 'regular' },
                    
                    // Multi-teleport puzzle
                    { x: 10, y: 0.5, z: 8, type: 'teleport' }, // First teleport
                    { x: 10, y: 0.5, z: 12, type: 'teleport' }, // Teleport destination 1
                    { x: 12, y: 0.5, z: 12, type: 'teleport' }, // Second teleport
                    { x: 12, y: 0.5, z: -8, type: 'teleport' }, // Teleport destination 2
                    { x: 14, y: 0.5, z: -8, type: 'teleport' }, // Third teleport
                    { x: -10, y: 0.5, z: -10, type: 'regular' }, // Final teleport destination
                    
                    // Ice maze
                    { x: -10, y: 0.5, z: -9, type: 'ice' },
                    { x: -10, y: 0.5, z: -8, type: 'ice' },
                    { x: -9, y: 0.5, z: -8, type: 'ice' },
                    { x: -8, y: 0.5, z: -8, type: 'ice' },
                    { x: -8, y: 0.5, z: -7, type: 'ice' },
                    { x: -8, y: 0.5, z: -6, type: 'ice' },
                    { x: -9, y: 0.5, z: -6, type: 'ice' },
                    { x: -10, y: 0.5, z: -6, type: 'regular' },
                    
                    // Sticky climbing challenge
                    { x: -10, y: 1.5, z: -6, type: 'sticky' },
                    { x: -10, y: 2.5, z: -6, type: 'sticky' },
                    { x: -10, y: 3.5, z: -6, type: 'sticky' },
                    { x: -9, y: 3.5, z: -6, type: 'sticky' },
                    { x: -8, y: 3.5, z: -6, type: 'regular' },
                    
                    // Teleport to bouncy area
                    { x: -6, y: 3.5, z: -6, type: 'teleport' },
                    { x: -6, y: 5.5, z: 6, type: 'bouncy' }, // Teleport destination
                    { x: -4, y: 5.5, z: 6, type: 'bouncy' },
                    { x: -2, y: 5.5, z: 6, type: 'bouncy' },
                    { x: 0, y: 5.5, z: 6, type: 'regular' },
                    
                    // Explosive corridor
                    { x: 0, y: 5.5, z: 4, type: 'explosion' },
                    { x: 0, y: 5.5, z: 2, type: 'regular' },
                    { x: 0, y: 5.5, z: 0, type: 'explosion' },
                    { x: 0, y: 5.5, z: -2, type: 'regular' },
                    
                    // Mixed materials section
                    { x: 2, y: 5.5, z: -2, type: 'ice' },
                    { x: 4, y: 5.5, z: -2, type: 'bouncy' },
                    { x: 6, y: 5.5, z: -2, type: 'sticky' },
                    { x: 8, y: 5.5, z: -2, type: 'explosion' },
                    { x: 10, y: 5.5, z: -2, type: 'teleport' },
                    { x: -15, y: 0.5, z: -15, type: 'regular' }, // Teleport destination
                    
                    // Final approach
                    { x: -14, y: 0.5, z: -15, type: 'regular' },
                    { x: -13, y: 0.5, z: -15, type: 'ice' },
                    { x: -12, y: 0.5, z: -15, type: 'explosion' },
                    { x: -11, y: 0.5, z: -15, type: 'bouncy' },
                    { x: -10, y: 0.5, z: -15, type: 'sticky' },
                    { x: -9, y: 0.5, z: -15, type: 'regular' },
                    { x: -8, y: 0.5, z: -15, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: -6, y: 0.1, z: -15 }
            }
        },
        {
            id: 9,
            title: 'Tower Challenge',
            description: 'Scale this massive tower with various material types and obstacles on each level',
            difficulty: 'Hard',
            thumbnailClass: 'course-thumbnail-9',
            data: {
                blocks: [
                    // Ground floor - regular base
                    { x: 2, y: 0.5, z: 3, type: 'regular' },
                    { x: 3, y: 0.5, z: 3, type: 'regular' },
                    { x: 4, y: 0.5, z: 3, type: 'regular' },
                    { x: 4, y: 0.5, z: 2, type: 'regular' },
                    { x: 4, y: 0.5, z: 1, type: 'regular' },
                    { x: 3, y: 0.5, z: 1, type: 'regular' },
                    { x: 2, y: 0.5, z: 1, type: 'regular' },
                    
                    // First floor - ice layer
                    { x: 3, y: 1.5, z: 2, type: 'ice' },
                    { x: 3, y: 1.5, z: 3, type: 'ice' },
                    { x: 4, y: 1.5, z: 3, type: 'ice' },
                    { x: 5, y: 1.5, z: 3, type: 'ice' },
                    { x: 5, y: 1.5, z: 2, type: 'ice' },
                    { x: 5, y: 1.5, z: 1, type: 'ice' },
                    { x: 4, y: 1.5, z: 1, type: 'ice' },
                    
                    // Bridge to second section
                    { x: 6, y: 1.5, z: 2, type: 'regular' },
                    { x: 7, y: 1.5, z: 2, type: 'regular' },
                    
                    // Second floor - bouncy layer
                    { x: 8, y: 2.5, z: 2, type: 'bouncy' },
                    { x: 8, y: 2.5, z: 3, type: 'bouncy' },
                    { x: 8, y: 2.5, z: 4, type: 'bouncy' },
                    { x: 9, y: 2.5, z: 4, type: 'bouncy' },
                    { x: 10, y: 2.5, z: 4, type: 'bouncy' },
                    { x: 10, y: 2.5, z: 3, type: 'bouncy' },
                    { x: 10, y: 2.5, z: 2, type: 'bouncy' },
                    { x: 9, y: 2.5, z: 2, type: 'bouncy' },
                    
                    // Third floor - sticky layer for vertical climb
                    { x: 9, y: 3.5, z: 3, type: 'sticky' },
                    { x: 9, y: 4.5, z: 3, type: 'sticky' },
                    { x: 9, y: 5.5, z: 3, type: 'sticky' },
                    
                    // Fourth floor - explosive challenge
                    { x: 8, y: 6.5, z: 3, type: 'regular' },
                    { x: 7, y: 6.5, z: 3, type: 'explosion' },
                    { x: 6, y: 6.5, z: 3, type: 'regular' },
                    { x: 5, y: 6.5, z: 3, type: 'explosion' },
                    { x: 4, y: 6.5, z: 3, type: 'regular' },
                    
                    // Bridge to spiral tower
                    { x: 2, y: 6.5, z: 3, type: 'regular' },
                    { x: 0, y: 6.5, z: 3, type: 'regular' },
                    { x: -2, y: 6.5, z: 3, type: 'regular' },
                    
                    // Spiral tower - level 1 (mixed materials)
                    { x: -3, y: 6.5, z: 3, type: 'regular' },
                    { x: -3, y: 6.5, z: 2, type: 'ice' },
                    { x: -3, y: 6.5, z: 1, type: 'bouncy' },
                    { x: -2, y: 6.5, z: 1, type: 'sticky' },
                    { x: -1, y: 6.5, z: 1, type: 'regular' },
                    
                    // Spiral tower - level 2
                    { x: -1, y: 7.5, z: 0, type: 'regular' },
                    { x: -2, y: 7.5, z: 0, type: 'regular' },
                    { x: -3, y: 7.5, z: 0, type: 'explosion' },
                    { x: -3, y: 7.5, z: -1, type: 'regular' },
                    { x: -3, y: 7.5, z: -2, type: 'regular' },
                    
                    // Spiral tower - level 3 (teleport)
                    { x: -2, y: 8.5, z: -2, type: 'teleport' },
                    { x: 4, y: 10.5, z: 0, type: 'regular' }, // Teleport destination
                    
                    // Upper tower - level 1
                    { x: 4, y: 10.5, z: 1, type: 'regular' },
                    { x: 4, y: 10.5, z: 2, type: 'ice' },
                    { x: 3, y: 10.5, z: 2, type: 'sticky' },
                    { x: 2, y: 10.5, z: 2, type: 'regular' },
                    
                    // Upper tower - level 2 (careful climbing)
                    { x: 2, y: 11.5, z: 1, type: 'regular' },
                    { x: 2, y: 12.5, z: 0, type: 'sticky' },
                    { x: 2, y: 13.5, z: -1, type: 'regular' },
                    
                    // Upper tower - level 3 (bouncy ring)
                    { x: 3, y: 13.5, z: -1, type: 'bouncy' },
                    { x: 4, y: 13.5, z: -1, type: 'bouncy' },
                    { x: 4, y: 13.5, z: 0, type: 'bouncy' },
                    { x: 4, y: 13.5, z: 1, type: 'bouncy' },
                    { x: 3, y: 13.5, z: 1, type: 'bouncy' },
                    { x: 2, y: 13.5, z: 1, type: 'bouncy' },
                    { x: 1, y: 13.5, z: 1, type: 'bouncy' },
                    { x: 1, y: 13.5, z: 0, type: 'bouncy' },
                    { x: 1, y: 13.5, z: -1, type: 'bouncy' },
                    
                    // Tower pinnacle - explosive challenge
                    { x: 2, y: 14.5, z: 0, type: 'explosion' },
                    { x: 3, y: 14.5, z: 0, type: 'regular' },
                    
                    // Final path to top
                    { x: 3, y: 15.5, z: 0, type: 'sticky' },
                    { x: 3, y: 16.5, z: 0, type: 'sticky' },
                    { x: 3, y: 17.5, z: 0, type: 'regular' },
                    { x: 3, y: 17.5, z: 1, type: 'regular' },
                    { x: 3, y: 17.5, z: 2, type: 'ice' },
                    { x: 2, y: 17.5, z: 2, type: 'regular' },
                    
                    // Summit
                    { x: 1, y: 17.5, z: 2, type: 'regular' },
                    { x: 0, y: 17.5, z: 2, type: 'regular' },
                    { x: 0, y: 17.5, z: 1, type: 'regular' },
                    { x: 0, y: 17.5, z: 0, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: 0, y: 17.6, z: 0 }
            }
        },
        
        // Extreme courses (2)
        {
            id: 10,
            title: 'Mixed Materials Gauntlet',
            description: 'Master every material type in this punishing obstacle course',
            difficulty: 'Extreme',
            thumbnailClass: 'course-thumbnail-10',
            data: {
                blocks: [
                    // Starting area - regular blocks
                    { x: 2, y: 0.5, z: 3, type: 'regular' },
                    { x: 3, y: 0.5, z: 3, type: 'regular' },
                    { x: 4, y: 0.5, z: 3, type: 'regular' },
                    
                    // First challenge - ice corridor with explosives
                    { x: 6, y: 0.5, z: 3, type: 'ice' },
                    { x: 7, y: 0.5, z: 3, type: 'ice' },
                    { x: 8, y: 0.5, z: 3, type: 'explosion' },
                    { x: 9, y: 0.5, z: 3, type: 'ice' },
                    { x: 10, y: 0.5, z: 3, type: 'explosion' },
                    { x: 11, y: 0.5, z: 3, type: 'ice' },
                    { x: 12, y: 0.5, z: 3, type: 'ice' },
                    
                    // Recovery platform
                    { x: 14, y: 0.5, z: 3, type: 'regular' },
                    
                    // Ascending bounce challenge
                    { x: 16, y: 0.5, z: 3, type: 'bouncy' },
                    { x: 18, y: 1.5, z: 3, type: 'bouncy' },
                    { x: 20, y: 2.5, z: 3, type: 'bouncy' },
                    { x: 22, y: 3.5, z: 3, type: 'bouncy' },
                    { x: 24, y: 4.5, z: 3, type: 'regular' },
                    
                    // Sticky ceiling traverse
                    { x: 24, y: 5.5, z: 3, type: 'sticky' },
                    { x: 24, y: 5.5, z: 2, type: 'sticky' },
                    { x: 24, y: 5.5, z: 1, type: 'sticky' },
                    { x: 24, y: 5.5, z: 0, type: 'sticky' },
                    { x: 24, y: 5.5, z: -1, type: 'sticky' },
                    { x: 24, y: 5.5, z: -2, type: 'sticky' },
                    
                    // Teleport trap - series of teleports
                    { x: 24, y: 4.5, z: -2, type: 'teleport' }, // First teleport
                    { x: 0, y: 8.5, z: -10, type: 'regular' }, // Teleport destination
                    { x: 0, y: 8.5, z: -11, type: 'teleport' }, // Second teleport
                    { x: 35, y: 0.5, z: 0, type: 'regular' }, // Teleport destination
                    
                    // Material transition zone - every block different
                    { x: 36, y: 0.5, z: 0, type: 'ice' },
                    { x: 37, y: 0.5, z: 0, type: 'bouncy' },
                    { x: 38, y: 0.5, z: 0, type: 'sticky' },
                    { x: 39, y: 0.5, z: 0, type: 'explosion' },
                    { x: 40, y: 0.5, z: 0, type: 'teleport' }, // Teleport trap
                    { x: 20, y: 9.5, z: 10, type: 'regular' }, // Teleport destination
                    
                    // Ice slide challenge - descending ice path
                    { x: 21, y: 9.5, z: 10, type: 'ice' },
                    { x: 22, y: 9.3, z: 10, type: 'ice' },
                    { x: 23, y: 9.1, z: 10, type: 'ice' },
                    { x: 24, y: 8.9, z: 10, type: 'ice' },
                    { x: 25, y: 8.7, z: 10, type: 'ice' },
                    { x: 26, y: 8.5, z: 10, type: 'ice' },
                    { x: 27, y: 8.3, z: 10, type: 'ice' },
                    { x: 28, y: 8.1, z: 10, type: 'explosion' }, // Explosion at end of slide
                    { x: 29, y: 7.9, z: 10, type: 'ice' },
                    { x: 30, y: 7.7, z: 10, type: 'ice' },
                    
                    // Bouncy zigzag - requires precision
                    { x: 32, y: 7.5, z: 10, type: 'bouncy' },
                    { x: 34, y: 7.5, z: 9, type: 'bouncy' },
                    { x: 32, y: 7.5, z: 8, type: 'bouncy' },
                    { x: 34, y: 7.5, z: 7, type: 'bouncy' },
                    { x: 32, y: 7.5, z: 6, type: 'bouncy' },
                    { x: 34, y: 7.5, z: 5, type: 'regular' },
                    
                    // Sticky wall climb with explosives
                    { x: 34, y: 8.5, z: 5, type: 'sticky' },
                    { x: 34, y: 9.5, z: 5, type: 'explosion' },
                    { x: 34, y: 10.5, z: 5, type: 'sticky' },
                    { x: 34, y: 11.5, z: 5, type: 'explosion' },
                    { x: 34, y: 12.5, z: 5, type: 'sticky' },
                    { x: 34, y: 13.5, z: 5, type: 'regular' },
                    
                    // Teleport shortcut (but with a twist)
                    { x: 36, y: 13.5, z: 5, type: 'teleport' },
                    { x: -20, y: 15.5, z: 0, type: 'regular' }, // Far away teleport destination
                    
                    // Ice bridge crossing
                    { x: -19, y: 15.5, z: 0, type: 'ice' },
                    { x: -18, y: 15.5, z: 0, type: 'ice' },
                    { x: -17, y: 15.5, z: 0, type: 'ice' },
                    { x: -16, y: 15.5, z: 0, type: 'explosion' }, // Explosion in middle of bridge
                    { x: -15, y: 15.5, z: 0, type: 'ice' },
                    { x: -14, y: 15.5, z: 0, type: 'ice' },
                    { x: -13, y: 15.5, z: 0, type: 'ice' },
                    { x: -12, y: 15.5, z: 0, type: 'regular' },
                    
                    // Bouncy descent challenge
                    { x: -12, y: 15.5, z: -2, type: 'bouncy' },
                    { x: -12, y: 15.5, z: -4, type: 'bouncy' },
                    { x: -12, y: 15.5, z: -6, type: 'bouncy' },
                    { x: -12, y: 15.5, z: -8, type: 'bouncy' },
                    { x: -12, y: 15.5, z: -10, type: 'regular' },
                    
                    // Sticky ceiling traverse with explosions
                    { x: -12, y: 14.5, z: -10, type: 'sticky' },
                    { x: -13, y: 14.5, z: -10, type: 'explosion' },
                    { x: -14, y: 14.5, z: -10, type: 'sticky' },
                    { x: -15, y: 14.5, z: -10, type: 'explosion' },
                    { x: -16, y: 14.5, z: -10, type: 'sticky' },
                    { x: -17, y: 14.5, z: -10, type: 'explosion' },
                    { x: -18, y: 14.5, z: -10, type: 'sticky' },
                    { x: -19, y: 14.5, z: -10, type: 'explosion' },
                    { x: -20, y: 14.5, z: -10, type: 'sticky' },
                    { x: -21, y: 14.5, z: -10, type: 'regular' },
                    
                    // Teleport to mixed platform
                    { x: -23, y: 14.5, z: -10, type: 'teleport' },
                    { x: 40, y: 20.5, z: -20, type: 'regular' },
                    
                    // Mixed material challenge - rows of different materials
                    { x: 39, y: 20.5, z: -20, type: 'regular' },
                    { x: 38, y: 20.5, z: -20, type: 'ice' },
                    { x: 37, y: 20.5, z: -20, type: 'ice' },
                    { x: 36, y: 20.5, z: -20, type: 'ice' },
                    { x: 35, y: 20.5, z: -20, type: 'bouncy' },
                    { x: 34, y: 20.5, z: -20, type: 'bouncy' },
                    { x: 33, y: 20.5, z: -20, type: 'bouncy' },
                    { x: 32, y: 20.5, z: -20, type: 'sticky' },
                    { x: 31, y: 20.5, z: -20, type: 'sticky' },
                    { x: 30, y: 20.5, z: -20, type: 'sticky' },
                    { x: 29, y: 20.5, z: -20, type: 'explosion' },
                    { x: 28, y: 20.5, z: -20, type: 'explosion' },
                    { x: 27, y: 20.5, z: -20, type: 'regular' },
                    
                    // Teleport to final challenge
                    { x: 25, y: 20.5, z: -20, type: 'teleport' },
                    { x: -40, y: 25.5, z: -40, type: 'regular' },
                    
                    // Final gauntlet - all materials in sequence
                    // Ice section
                    { x: -39, y: 25.3, z: -40, type: 'ice' },
                    { x: -38, y: 25.1, z: -40, type: 'ice' },
                    { x: -37, y: 24.9, z: -40, type: 'ice' },
                    
                    // Explosion section
                    { x: -36, y: 24.7, z: -40, type: 'explosion' },
                    { x: -35, y: 24.5, z: -40, type: 'regular' },
                    { x: -34, y: 24.3, z: -40, type: 'explosion' },
                    
                    // Bouncy section
                    { x: -33, y: 24.1, z: -40, type: 'bouncy' },
                    { x: -31, y: 24.1, z: -40, type: 'bouncy' },
                    { x: -29, y: 24.1, z: -40, type: 'bouncy' },
                    
                    // Sticky wall climb
                    { x: -27, y: 24.1, z: -40, type: 'sticky' },
                    { x: -27, y: 25.1, z: -40, type: 'sticky' },
                    { x: -27, y: 26.1, z: -40, type: 'sticky' },
                    
                    // Teleport section
                    { x: -27, y: 27.1, z: -40, type: 'teleport' },
                    { x: -40, y: 30.5, z: -60, type: 'regular' },
                    
                    // Final stretch - victory path
                    { x: -39, y: 30.5, z: -60, type: 'regular' },
                    { x: -38, y: 30.5, z: -60, type: 'regular' },
                    { x: -37, y: 30.5, z: -60, type: 'regular' },
                    { x: -36, y: 30.5, z: -60, type: 'regular' },
                    { x: -35, y: 30.5, z: -60, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: -35, y: 30.6, z: -60 }
            }
        },
        {
            id: 11,
            title: 'Ultimate Challenge',
            description: 'The pinnacle of difficulty - only the most skilled players will complete this course',
            difficulty: 'Extreme',
            thumbnailClass: 'course-thumbnail-11',
            data: {
                blocks: [
                    // Starting platform - deceptively simple
                    { x: 2, y: 0.5, z: 3, type: 'regular' },
                    { x: 3, y: 0.5, z: 3, type: 'regular' },
                    { x: 4, y: 0.5, z: 3, type: 'regular' },
                    
                    // Immediate teleport trap
                    { x: 6, y: 0.5, z: 3, type: 'teleport' },
                    { x: -30, y: -10.5, z: 30, type: 'regular' }, // Far below and away
                    
                    // Underground ice maze - slippery and hard to navigate
                    { x: -29, y: -10.5, z: 30, type: 'ice' },
                    { x: -28, y: -10.5, z: 30, type: 'ice' },
                    { x: -28, y: -10.5, z: 29, type: 'ice' },
                    { x: -28, y: -10.5, z: 28, type: 'ice' },
                    { x: -29, y: -10.5, z: 28, type: 'ice' },
                    { x: -30, y: -10.5, z: 28, type: 'ice' },
                    { x: -30, y: -10.5, z: 27, type: 'ice' },
                    { x: -29, y: -10.5, z: 27, type: 'ice' },
                    { x: -28, y: -10.5, z: 27, type: 'ice' },
                    { x: -27, y: -10.5, z: 27, type: 'ice' },
                    { x: -27, y: -10.5, z: 28, type: 'ice' },
                    { x: -26, y: -10.5, z: 28, type: 'ice' },
                    { x: -25, y: -10.5, z: 28, type: 'regular' },
                    
                    // Explosion corridor - precise timing needed
                    { x: -25, y: -10.5, z: 26, type: 'explosion' },
                    { x: -25, y: -10.5, z: 24, type: 'regular' },
                    { x: -25, y: -10.5, z: 22, type: 'explosion' },
                    { x: -25, y: -10.5, z: 20, type: 'regular' },
                    { x: -25, y: -10.5, z: 18, type: 'explosion' },
                    { x: -25, y: -10.5, z: 16, type: 'regular' },
                    
                    // Bouncy upward challenge
                    { x: -25, y: -10.5, z: 14, type: 'bouncy' },
                    { x: -25, y: -8.5, z: 12, type: 'bouncy' },
                    { x: -25, y: -6.5, z: 10, type: 'bouncy' },
                    { x: -25, y: -4.5, z: 8, type: 'bouncy' },
                    { x: -25, y: -2.5, z: 6, type: 'bouncy' },
                    { x: -25, y: 0.5, z: 4, type: 'regular' },
                    
                    // Sticky ceiling challenge with explosives
                    { x: -25, y: 1.5, z: 4, type: 'sticky' },
                    { x: -25, y: 1.5, z: 2, type: 'explosion' },
                    { x: -25, y: 1.5, z: 0, type: 'sticky' },
                    { x: -25, y: 1.5, z: -2, type: 'explosion' },
                    { x: -25, y: 1.5, z: -4, type: 'sticky' },
                    { x: -25, y: 1.5, z: -6, type: 'explosion' },
                    { x: -25, y: 1.5, z: -8, type: 'sticky' },
                    { x: -25, y: 0.5, z: -10, type: 'regular' },
                    
                    // Mixed teleport field - teleport maze
                    { x: -25, y: 0.5, z: -12, type: 'teleport' }, // First teleport
                    { x: 10, y: 5.5, z: -20, type: 'teleport' }, // Teleport to another teleport
                    { x: -10, y: 15.5, z: 10, type: 'teleport' }, // Teleport to another teleport
                    { x: 30, y: 20.5, z: 0, type: 'regular' }, // Final teleport destination
                    
                    // Ice bridge across chasm
                    { x: 31, y: 20.5, z: 0, type: 'ice' },
                    { x: 32, y: 20.5, z: 0, type: 'ice' },
                    { x: 33, y: 20.5, z: 0, type: 'ice' },
                    { x: 34, y: 20.5, z: 0, type: 'ice' },
                    { x: 35, y: 20.5, z: 0, type: 'ice' },
                    { x: 36, y: 20.5, z: 0, type: 'ice' },
                    { x: 37, y: 20.5, z: 0, type: 'ice' },
                    { x: 38, y: 20.5, z: 0, type: 'ice' },
                    { x: 39, y: 20.5, z: 0, type: 'ice' },
                    { x: 40, y: 20.5, z: 0, type: 'regular' },
                    
                    // Alternating explosive/sticky walls - complex vertical climb
                    { x: 40, y: 21.5, z: 0, type: 'explosion' },
                    { x: 40, y: 22.5, z: 0, type: 'sticky' },
                    { x: 40, y: 23.5, z: 0, type: 'explosion' },
                    { x: 40, y: 24.5, z: 0, type: 'sticky' },
                    { x: 40, y: 25.5, z: 0, type: 'explosion' },
                    { x: 40, y: 26.5, z: 0, type: 'sticky' },
                    { x: 40, y: 27.5, z: 0, type: 'explosion' },
                    { x: 40, y: 28.5, z: 0, type: 'regular' },
                    
                    // Bouncy zigzag descent
                    { x: 42, y: 28.5, z: 0, type: 'bouncy' },
                    { x: 44, y: 26.5, z: 2, type: 'bouncy' },
                    { x: 46, y: 24.5, z: 0, type: 'bouncy' },
                    { x: 48, y: 22.5, z: 2, type: 'bouncy' },
                    { x: 50, y: 20.5, z: 0, type: 'regular' },
                    
                    // Teleport to new zone
                    { x: 52, y: 20.5, z: 0, type: 'teleport' },
                    { x: 0, y: 40.5, z: -50, type: 'regular' }, // High altitude challenge
                    
                    // High altitude ice bridge with explosives
                    { x: 1, y: 40.5, z: -50, type: 'ice' },
                    { x: 2, y: 40.5, z: -50, type: 'explosion' },
                    { x: 3, y: 40.5, z: -50, type: 'ice' },
                    { x: 4, y: 40.5, z: -50, type: 'explosion' },
                    { x: 5, y: 40.5, z: -50, type: 'ice' },
                    { x: 6, y: 40.5, z: -50, type: 'explosion' },
                    { x: 7, y: 40.5, z: -50, type: 'ice' },
                    { x: 8, y: 40.5, z: -50, type: 'regular' },
                    
                    // Triple-layer challenge - must navigate all materials
                    // Bottom layer - ice with explosives
                    { x: 10, y: 40.5, z: -50, type: 'ice' },
                    { x: 12, y: 40.5, z: -50, type: 'explosion' },
                    { x: 14, y: 40.5, z: -50, type: 'ice' },
                    
                    // Middle layer - bouncy platforms
                    { x: 10, y: 42.5, z: -50, type: 'bouncy' },
                    { x: 12, y: 42.5, z: -50, type: 'bouncy' },
                    { x: 14, y: 42.5, z: -50, type: 'bouncy' },
                    
                    // Top layer - sticky ceiling
                    { x: 10, y: 44.5, z: -50, type: 'sticky' },
                    { x: 12, y: 44.5, z: -50, type: 'sticky' },
                    { x: 14, y: 44.5, z: -50, type: 'sticky' },
                    { x: 16, y: 44.5, z: -50, type: 'regular' },
                    
                    // Teleport into the void
                    { x: 18, y: 44.5, z: -50, type: 'teleport' },
                    { x: 0, y: -30.5, z: -80, type: 'regular' }, // Deep below in a new area
                    
                    // Extreme ice slide - very steep, difficult to control
                    { x: 0, y: -30.5, z: -79, type: 'ice' },
                    { x: 0, y: -30.6, z: -78, type: 'ice' },
                    { x: 0, y: -30.7, z: -77, type: 'ice' },
                    { x: 0, y: -30.9, z: -76, type: 'ice' },
                    { x: 0, y: -31.2, z: -75, type: 'ice' },
                    { x: 0, y: -31.5, z: -74, type: 'ice' },
                    { x: 0, y: -31.9, z: -73, type: 'explosion' }, // Explosion on the slide
                    { x: 0, y: -32.3, z: -72, type: 'ice' },
                    { x: 0, y: -32.8, z: -71, type: 'ice' },
                    { x: 0, y: -33.3, z: -70, type: 'regular' },
                    
                    // Bouncy tornado - spiraling bouncy pattern
                    { x: 1, y: -33.3, z: -70, type: 'bouncy' },
                    { x: 2, y: -32.3, z: -69, type: 'bouncy' },
                    { x: 3, y: -31.3, z: -68, type: 'bouncy' },
                    { x: 4, y: -30.3, z: -67, type: 'bouncy' },
                    { x: 5, y: -29.3, z: -66, type: 'bouncy' },
                    { x: 6, y: -28.3, z: -65, type: 'regular' },
                    
                    // Sticky wall labyrinth
                    { x: 6, y: -27.3, z: -65, type: 'sticky' },
                    { x: 6, y: -26.3, z: -65, type: 'sticky' },
                    { x: 7, y: -26.3, z: -65, type: 'sticky' },
                    { x: 8, y: -26.3, z: -65, type: 'sticky' },
                    { x: 8, y: -25.3, z: -65, type: 'sticky' },
                    { x: 8, y: -24.3, z: -65, type: 'sticky' },
                    { x: 7, y: -24.3, z: -65, type: 'sticky' },
                    { x: 6, y: -24.3, z: -65, type: 'sticky' },
                    { x: 6, y: -23.3, z: -65, type: 'sticky' },
                    { x: 6, y: -22.3, z: -65, type: 'regular' },
                    
                    // Final teleport - to victory platform far above starting point
                    { x: 6, y: -22.3, z: -63, type: 'teleport' },
                    { x: -50, y: 100.5, z: -100, type: 'regular' }, // Extremely high and far
                    
                    // Victory platform with all materials
                    { x: -49, y: 100.5, z: -100, type: 'ice' },
                    { x: -48, y: 100.5, z: -100, type: 'bouncy' },
                    { x: -47, y: 100.5, z: -100, type: 'sticky' },
                    { x: -46, y: 100.5, z: -100, type: 'explosion' }, // One last explosive trap
                    { x: -45, y: 100.5, z: -100, type: 'regular' },
                    
                    // New challenging but achievable path to the finish
                    { x: -44, y: 100.5, z: -100, type: 'regular' },
                    
                    // Victory checkpoint with psychological reward of achievement
                    { x: -43, y: 100.5, z: -100, type: 'regular' },
                    
                    // Bonus area - reward for those who conquered the challenge
                    { x: -43, y: 100.5, z: -99, type: 'bouncy' },
                    { x: -43, y: 100.5, z: -98, type: 'sticky' },
                    { x: -43, y: 100.5, z: -97, type: 'ice' },
                    
                    // Hidden "easter egg" challenge path
                    { x: -45, y: 100.5, z: -99, type: 'teleport' },
                    { x: -45, y: 110.5, z: -110, type: 'regular' }, // Secret high platform
                    { x: -44, y: 110.5, z: -110, type: 'ice' },
                    { x: -43, y: 110.5, z: -110, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: -43, y: 100.6, z: -100 }
            }
        }
    ];
    
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
            <div class="course-info">
                <div class="likes-count"><span class="heart-icon ${hasUserLikedCourse(course.id) ? 'liked' : 'empty'}"></span> ${course.likes || 0} likes</div>
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
        
        // Add like functionality to the heart icon
        const likesCount = courseDiv.querySelector('.likes-count');
        likesCount.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Only allow liking if the user hasn't already liked this course
            if (!hasUserLikedCourse(course.id)) {
                // Mark this course as liked by the user first
                markCourseAsLiked(course.id);
                
                // Update course likes in backend
                if (typeof window.updateCourseStats === 'function') {
                    window.updateCourseStats(course.id, 'likes', null);
                } else {
                    // Local fallback update
                    course.likes = (course.likes || 0) + 1;
                    
                    // Update in localStorage if needed
                    try {
                        const communityCourses = JSON.parse(localStorage.getItem('communityCourses') || '[]');
                        const courseIndex = communityCourses.findIndex(c => String(c.id) === String(course.id));
                        if (courseIndex !== -1) {
                            communityCourses[courseIndex].likes = (communityCourses[courseIndex].likes || 0) + 1;
                            localStorage.setItem('communityCourses', JSON.stringify(communityCourses));
                        }
                    } catch (error) {
                        console.error("Error updating course likes:", error);
                    }
                }
                
                // Immediately update the heart icon
                const heartIcon = likesCount.querySelector('.heart-icon');
                heartIcon.classList.remove('empty');
                heartIcon.classList.add('liked');
                
                // Update the container class
                likesCount.classList.add('liked');
                
                // Update the count text
                course.likes = (course.likes || 0) + 1;
                const countText = likesCount.lastChild;
                countText.textContent = ` ${course.likes} likes`;
                
                // Add liked effect
                setTimeout(() => {
                    likesCount.classList.remove('liked');
                }, 1000);
                
                // Disable further clicks by removing the click event listener
                likesCount.removeEventListener('click', arguments.callee);
                // Or alternatively add a data attribute to mark it as liked
                likesCount.dataset.liked = 'true';
            } else {
                // Show feedback that the course is already liked
                likesCount.classList.add('liked');
                setTimeout(() => {
                    likesCount.classList.remove('liked');
                }, 500);
            }
        });
        
        // Also add click event to the entire course item to play it
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
        
        // Check if the utility function is available
        if (typeof getCommunityCoursesAsync === 'function') {
            getCommunityCoursesAsync()
                .then(courses => {
                    communityCourses = courses;
                    
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
                })
                .catch(error => {
                    console.error('Error loading community courses:', error);
                    // Fall back to localStorage
                    loadCoursesFromLocalStorage();
                });
            return;
        }
        
        // Check if WebSocket connection is available
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            // Request community courses from the server
            window.socket.send(JSON.stringify({
                type: 'getCommunityCourses'
            }));
        } else {
            // If WebSocket is not available, try to load from localStorage as fallback
            console.warn('WebSocket not available, loading courses from localStorage as fallback');
            loadCoursesFromLocalStorage();
        }
    }
    
    // Fallback function to load courses from localStorage
    function loadCoursesFromLocalStorage() {
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
    
    // Function to handle WebSocket messages for community courses
    function handleSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'communityCourses') {
                console.log('Received community courses from server:', message.data.length);
                communityCourses = message.data;
                
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
            }
        } catch (e) {
            console.error('Error processing WebSocket message:', e);
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
                <div class="likes-count ${hasUserLikedCourse(course.id) ? 'liked' : ''}">
                    <svg class="stat-icon heart-icon ${hasUserLikedCourse(course.id) ? 'liked' : 'empty'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
        
        // Add like functionality to the heart icon
        const likesCount = courseDiv.querySelector('.likes-count');
        likesCount.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Only allow liking if the user hasn't already liked this course
            if (!hasUserLikedCourse(course.id)) {
                // Mark this course as liked by the user first
                markCourseAsLiked(course.id);
                
                // Update course likes in backend
                if (typeof window.updateCourseStats === 'function') {
                    window.updateCourseStats(course.id, 'likes', null);
                } else {
                    // Local fallback update
                    course.likes = (course.likes || 0) + 1;
                    
                    // Update in localStorage if needed
                    try {
                        const communityCourses = JSON.parse(localStorage.getItem('communityCourses') || '[]');
                        const courseIndex = communityCourses.findIndex(c => String(c.id) === String(course.id));
                        if (courseIndex !== -1) {
                            communityCourses[courseIndex].likes = (communityCourses[courseIndex].likes || 0) + 1;
                            localStorage.setItem('communityCourses', JSON.stringify(communityCourses));
                        }
                    } catch (error) {
                        console.error("Error updating course likes:", error);
                    }
                }
                
                // Immediately update the display
                course.likes = (course.likes || 0) + 1;
                likesCount.innerHTML = `
                    <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    ${course.likes} likes
                `;
                
                // Add liked effect
                likesCount.style.color = '#FF4081';
                setTimeout(() => {
                    likesCount.style.color = '';
                }, 1000);
                
                // Disable further clicks by removing the click event listener
                likesCount.removeEventListener('click', arguments.callee);
                // Or alternatively add a data attribute to mark it as liked
                likesCount.dataset.liked = 'true';
            } else {
                // Show feedback that the course is already liked
                likesCount.style.color = '#FF4081';
                setTimeout(() => {
                    likesCount.style.color = '';
                }, 500);
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
    
    // Function to load community courses from data received via WebSocket
    function loadCommunityCoursesFromData(courses) {
        communityCourses = courses;
        console.log('Setting community courses from data:', communityCourses.length);
        
        // Update the grid with loaded courses
        updateCommunityGrid();
        
        // Set up filter and sort button listeners if not already set
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
    }
    
    // Function to check if user has already liked a course
    function hasUserLikedCourse(courseId) {
        try {
            // Ensure courseId is converted to string for comparison
            courseId = String(courseId);
            const likedCourses = JSON.parse(localStorage.getItem('likedCourses') || '[]');
            return Array.isArray(likedCourses) && likedCourses.includes(courseId);
        } catch (error) {
            console.error("Error checking liked courses:", error);
            return false;
        }
    }
    
    // Function to mark a course as liked by the user
    function markCourseAsLiked(courseId) {
        try {
            // Ensure courseId is converted to string for storage
            courseId = String(courseId);
            const likedCourses = JSON.parse(localStorage.getItem('likedCourses') || '[]');
            
            // Ensure we have an array
            const likedArray = Array.isArray(likedCourses) ? likedCourses : [];
            
            // Add the course ID if not already present
            if (!likedArray.includes(courseId)) {
                likedArray.push(courseId);
                localStorage.setItem('likedCourses', JSON.stringify(likedArray));
                console.log(`Course ${courseId} marked as liked`);
            }
        } catch (error) {
            console.error("Error marking course as liked:", error);
            // Initialize with just this course if there was an error
            localStorage.setItem('likedCourses', JSON.stringify([String(courseId)]));
        }
    }
    
    // Make functions globally available
    window.hasUserLikedCourse = hasUserLikedCourse;
    window.markCourseAsLiked = markCourseAsLiked;
    window.loadCommunityCoursesFromData = loadCommunityCoursesFromData;
}); 