document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const createButton = document.getElementById('createButton');
    const playButton = document.getElementById('playButton');
    const courseSelection = document.getElementById('course-selection');
    const closeSelectionButton = document.getElementById('closeSelectionButton');
    const coursesGrid = document.getElementById('courses-grid');
    
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
                    
                    // Victory platform
                    { x: 0, y: 4.5, z: 0, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: 0, y: 4.6, z: 0 }
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
                    { x: 4, y: -12.0, z: 1, type: 'regular' }
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
                    { x: -45, y: 100.5, z: -100, type: 'regular' }
                ],
                startMarker: { x: 0, y: 0.1, z: 3 },
                finishMarker: { x: -43, y: 100.6, z: -100 }
            }
        }
    ];
    
    // Event Listeners
    createButton.addEventListener('click', function() {
        // Navigate to the builder page
        window.location.href = 'builder.html';
    });
    
    playButton.addEventListener('click', function() {
        // Show course selection overlay
        showCourseSelection();
    });
    
    closeSelectionButton.addEventListener('click', function() {
        // Hide course selection overlay
        hideCourseSelection();
    });
    
    // Initialize course selection grid
    function initCourseGrid() {
        // Clear existing content
        coursesGrid.innerHTML = '';
        
        // Populate with predefined courses
        predefinedCourses.forEach(course => {
            const courseElement = createCourseElement(course);
            coursesGrid.appendChild(courseElement);
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
        // Store the course data in localStorage to be loaded by the game
        localStorage.setItem('selectedCourse', JSON.stringify(course.data));
        
        // Navigate to the builder page with a parameter to indicate we want to play
        window.location.href = 'builder.html?mode=play';
    }
    
    // Create folder for assets if needed
    function createAssetsFolder() {
        // This would normally be handled by the filesystem
        console.log('In a real environment, we would create the assets/courses folder here');
    }
    
    // Initialize (called when the page loads)
    function init() {
        createAssetsFolder();
        
        // Check for any URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const showCoursesParam = urlParams.get('showCourses');
        
        if (showCoursesParam === 'true') {
            // Auto-show course selection if requested
            showCourseSelection();
        }
    }
    
    // Call init to start everything
    init();
}); 