import * as THREE from 'three';

export class Character {
    constructor(scene, ground) {
        this.scene = scene;
        this.ground = ground;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveSpeed = 0.1;
        this.jumpStrength = 0.4;
        this.gravity = -0.02;
        this.isGrounded = false;
        this.currentSurface = 'regular'; // Type of surface the character is on
        
        // Track movement properties per surface type
        this.surfaceProperties = {
            regular: { friction: 0.9, speedMultiplier: 1.0 },
            ice: { friction: 0.99, speedMultiplier: 1.1 },
            bouncy: { friction: 0.75, speedMultiplier: 1.0, bounce: 1.8 },
            sticky: { friction: 0.3, speedMultiplier: 0.2 },
            explosion: { friction: 0.9, speedMultiplier: 1.0 },
            teleport: { friction: 0.9, speedMultiplier: 1.0 }
        };
        
        // Explosion timer
        this.explosionTimer = null;
        this.currentExplosionBlock = null;
        this.justExploded = false; // Flag to track recent explosion
        this.explosionDelay = 0; // Time before gravity reapplies after explosion
        
        // Last teleport time to prevent continuous teleportation
        this.lastTeleportTime = 0;
        this.teleportCooldown = 1000; // ms
        
        // Create character mesh
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4285F4 });
        
        // Create character as a group of objects for more visual appeal
        this.mesh = new THREE.Group();
        
        // Body (capsule)
        this.body = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.3, 0.8, 4, 8),
            bodyMaterial
        );
        this.body.position.y = 0.1; // Position relative to group
        this.mesh.add(this.body);
        
        // Eyes (spheres)
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        // Create an eyes group to move together
        this.eyesGroup = new THREE.Group();
        this.eyesGroup.position.set(0, 0.4, 0);
        this.mesh.add(this.eyesGroup);
        
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            eyeMaterial
        );
        leftEye.position.set(0.15, 0, 0.25);
        this.eyesGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            eyeMaterial
        );
        rightEye.position.set(-0.15, 0, 0.25);
        this.eyesGroup.add(rightEye);
        
        // Pupils
        const leftPupil = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            pupilMaterial
        );
        leftPupil.position.set(0.15, 0, 0.33);
        this.eyesGroup.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            pupilMaterial
        );
        rightPupil.position.set(-0.15, 0, 0.33);
        this.eyesGroup.add(rightPupil);
        
        // Position the character
        this.mesh.position.set(0, 1.5, 0);
        scene.add(this.mesh);

        // Physics properties
        this.radius = 0.3;
        this.height = 1.5;
        
        // Add shadow
        this.body.castShadow = true;

        // Create a collision box helper for debugging (optional)
        this.collisionBox = new THREE.Box3();
        this.lastPosition = new THREE.Vector3();
        
        // Default eyes direction
        this.targetEyesRotation = new THREE.Euler();
        this.eyesRotationSpeed = 0.1;
    }

    update(blocks, deltaTime) {
        // Store the last position before we move
        this.lastPosition.copy(this.mesh.position);
        
        // Apply friction based on surface type
        this.applyFriction();
        
        // Apply gravity unless recently exploded
        if (!this.isGrounded && !this.justExploded) {
            this.velocity.y += this.gravity * deltaTime;
        }
        
        // Reset justExploded flag after a short delay
        if (this.justExploded) {
            this.explosionDelay -= deltaTime / 60; // Convert frames to seconds (assuming 60 FPS)
            if (this.explosionDelay <= 0) {
                this.justExploded = false;
            }
        }

        // Apply surface-specific movement modifiers
        if (this.isGrounded) {
            const props = this.surfaceProperties[this.currentSurface] || this.surfaceProperties.regular;
            
            // Modify horizontal velocity based on surface speed multiplier
            this.velocity.x *= props.speedMultiplier;
            this.velocity.z *= props.speedMultiplier;
            
            // For ice, maintain more momentum
            if (this.currentSurface === 'ice') {
                // Boost existing movement slightly to create "ice glide" feeling
                const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
                if (currentSpeed > 0.01) {
                    const boostFactor = 1.02;
                    this.velocity.x *= boostFactor;
                    this.velocity.z *= boostFactor;
                }
            }
        }

        // Update position - perform separate movements for better collision
        
        // First move horizontally (X and Z)
        const horizontalDelta = new THREE.Vector3(
            this.velocity.x * deltaTime,
            0,
            this.velocity.z * deltaTime
        );
        this.mesh.position.add(horizontalDelta);
        
        // Check horizontal collisions
        this.handleCollisionsHorizontal(blocks);
        
        // Then move vertically (Y)
        const verticalDelta = new THREE.Vector3(
            0,
            this.velocity.y * deltaTime,
            0
        );
        this.mesh.position.add(verticalDelta);
        
        // Check vertical collisions
        this.handleCollisionsVertical(blocks);

        // Reset surface type if not on ground (falling)
        if (!this.isGrounded) {
            this.currentSurface = 'regular';
            
            // Clear explosion timer if we're no longer on the explosion block
            if (this.explosionTimer && this.currentExplosionBlock) {
                clearTimeout(this.explosionTimer);
                this.explosionTimer = null;
                this.currentExplosionBlock = null;
            }
        }
        
        // Handle teleport cooldown
        if (this.currentSurface === 'teleport' && this.isGrounded) {
            const currentTime = Date.now();
            if (currentTime - this.lastTeleportTime > this.teleportCooldown) {
                this.teleport(blocks);
                this.lastTeleportTime = currentTime;
            }
        }
        
        // Update eye direction based on movement
        this.updateEyesDirection(deltaTime);
    }

    updateEyesDirection(deltaTime) {
        // Only rotate eyes if we have a movement direction
        if (this.direction.length() > 0.1 || Math.abs(this.velocity.x) > 0.05 || Math.abs(this.velocity.z) > 0.05) {
            // Create a vector pointing in the direction of movement
            const movementDir = new THREE.Vector3(this.velocity.x, 0, this.velocity.z).normalize();
            
            // Calculate the target rotation
            this.targetEyesRotation.y = Math.atan2(movementDir.x, movementDir.z);
            
            // Apply some smoothing for natural movement
            const currentRotation = this.eyesGroup.rotation.y;
            const angleDiff = this.targetEyesRotation.y - currentRotation;
            
            // Handle angle wrapping (i.e., -π to π transition)
            let rotationDelta = angleDiff;
            if (angleDiff > Math.PI) rotationDelta = angleDiff - 2 * Math.PI;
            if (angleDiff < -Math.PI) rotationDelta = angleDiff + 2 * Math.PI;
            
            // Apply smooth rotation
            this.eyesGroup.rotation.y += rotationDelta * this.eyesRotationSpeed * deltaTime;
        }
    }

    applyFriction() {
        if (!this.isGrounded) return;
        
        // Get friction coefficient from surface properties
        const props = this.surfaceProperties[this.currentSurface] || this.surfaceProperties.regular;
        const frictionCoefficient = props.friction;
        
        // Apply friction
        this.velocity.x *= frictionCoefficient;
        this.velocity.z *= frictionCoefficient;
        
        // Stop micro-movements
        if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
        if (Math.abs(this.velocity.z) < 0.01) this.velocity.z = 0;
    }

    handleCollisionsHorizontal(blocks) {
        // Update the collision box to current position
        this.updateCollisionBox();
        
        for (const block of blocks) {
            // Get block type
            const blockType = block.userData.type || 'regular';
            
            // Skip horizontal collision for start and finish markers
            // This allows the player to walk off the edges of these platforms
            if (blockType === 'start' || blockType === 'finish') {
                continue;
            }
            
            // Store current scale
            const originalScale = block.scale.clone();
            
            // Set scale to 1 for collision detection
            block.scale.set(1, 1, 1);
            
            // Calculate bounding box with original size
            const blockBox = new THREE.Box3().setFromObject(block);
            
            // Restore original scale
            block.scale.copy(originalScale);
            
            // Check for intersection
            if (this.collisionBox.intersectsBox(blockBox)) {
                // Calculate overlap
                const overlap = new THREE.Box3();
                overlap.copy(this.collisionBox).intersect(blockBox);
                const overlapSize = new THREE.Vector3();
                overlap.getSize(overlapSize);
                
                // Determine which axis has the smallest overlap
                if (overlapSize.x < overlapSize.z) {
                    // X-axis collision
                    if (this.mesh.position.x < block.position.x) {
                        // Colliding from left
                        this.mesh.position.x = blockBox.min.x - this.radius - 0.05;
                    } else {
                        // Colliding from right
                        this.mesh.position.x = blockBox.max.x + this.radius + 0.05;
                    }
                    this.velocity.x = 0;
                } else {
                    // Z-axis collision
                    if (this.mesh.position.z < block.position.z) {
                        // Colliding from front
                        this.mesh.position.z = blockBox.min.z - this.radius - 0.05;
                    } else {
                        // Colliding from back
                        this.mesh.position.z = blockBox.max.z + this.radius + 0.05;
                    }
                    this.velocity.z = 0;
                }
                
                // Update collision box after repositioning
                this.updateCollisionBox();
            }
        }
    }

    handleCollisionsVertical(blocks) {
        this.isGrounded = false;
        this.currentSurface = 'regular';
        
        // Ground collision - only check if ground is in the scene
        if (this.ground && this.ground.parent) {
            if (this.mesh.position.y - this.height/2 < this.ground.position.y + 0.02) {
                this.mesh.position.y = this.ground.position.y + this.height/2 + 0.001;
                this.velocity.y = 0;
                this.isGrounded = true;
            }
        }
        
        // Update the collision box to current position
        this.updateCollisionBox();
        
        for (const block of blocks) {
            // Store current scale
            const originalScale = block.scale.clone();
            
            // Set scale to 1 for collision detection
            block.scale.set(1, 1, 1);
            
            // Calculate bounding box with original size
            const blockBox = new THREE.Box3().setFromObject(block);
            
            // Restore original scale for visual pulsing
            block.scale.copy(originalScale);
            
            const blockType = block.userData.type || 'regular';
            const isMarker = blockType === 'start' || blockType === 'finish';
            const isTeleport = blockType === 'teleport';
            
            if (this.collisionBox.intersectsBox(blockBox)) {
                // Calculate the vertical distance between centers
                const characterBottom = this.mesh.position.y - this.height/2;
                const characterTop = this.mesh.position.y + this.height/2;
                const blockBottom = blockBox.min.y;
                const blockTop = blockBox.max.y;
                
                // For markers (which are flat platforms), use a different collision approach
                if (isMarker) {
                    // Only check if character is above the marker platform
                    // And only if they're close to it vertically (within 0.5 units)
                    if (this.lastPosition.y - this.height/2 >= blockTop - 0.5 && 
                        Math.abs(characterBottom - blockTop) < 0.5) {
                        // Collision from above - character is on top of marker platform
                        this.mesh.position.y = blockTop + this.height/2 + 0.001;
                        this.velocity.y = 0;
                        this.isGrounded = true;
                        this.currentSurface = 'regular'; // Markers use regular friction
                    }
                    // No need to handle collisions from sides or below for marker platforms
                } else if (isTeleport) {
                    // For teleport blocks, treat the top like a normal block but with teleport surface
                    if (this.lastPosition.y - this.height/2 >= blockTop - 0.1) {
                        // Collision from above - character is on top of block
                        this.mesh.position.y = blockTop + this.height/2 + 0.001;
                        this.velocity.y = 0;
                        this.isGrounded = true;
                        this.currentSurface = 'teleport';
                    }
                    // Check if character is below the block
                    else if (this.lastPosition.y + this.height/2 <= blockBottom + 0.1) {
                        // Collision from below - character's head hit the block
                        this.mesh.position.y = blockBottom - this.height/2 - 0.01;
                        this.velocity.y = Math.min(0, this.velocity.y);  // Stop upward momentum
                    }
                    // We'll handle side collisions normally for teleport blocks
                } else {
                    // Standard block collision logic
                    // Check if character is above the block
                    if (this.lastPosition.y - this.height/2 >= blockTop - 0.1) {
                        // Collision from above - character is on top of block
                        this.mesh.position.y = blockTop + this.height/2 + 0.001;
                        this.velocity.y = 0;
                        this.isGrounded = true;
                        this.currentSurface = blockType;
                        
                        // Handle bouncy blocks
                        if (blockType === 'bouncy') {
                            const bounceProps = this.surfaceProperties.bouncy;
                            const impactSpeed = Math.abs(this.velocity.y); // How fast we were falling
                            
                            // Higher bounce for faster impacts
                            const baseBounce = this.jumpStrength * bounceProps.bounce;
                            const speedBonus = impactSpeed * 0.5; // Bonus based on impact speed
                            this.velocity.y = baseBounce + speedBonus;
                            
                            this.isGrounded = false;
                            
                            // Create a quick visual squish effect
                            this.createBounceEffect(block);
                        }
                        
                        // Handle explosion blocks
                        if (blockType === 'explosion') {
                            if (!block.userData.explosionTimerId) {
                                const originalScale = block.scale.clone();
                                let pulseCount = 0;
                                
                                const pulseInterval = setInterval(() => {
                                    pulseCount++;
                                    const pulsePhase = pulseCount % 2;
                                    const scaleFactor = pulsePhase === 0 ? 1.0 : 1.15;
                                    block.scale.set(
                                        originalScale.x * scaleFactor,
                                        originalScale.y * scaleFactor,
                                        originalScale.z * scaleFactor
                                    );
                                    if (pulseCount > 10 && pulseCount < 15) {
                                        clearInterval(pulseInterval);
                                        setInterval(() => {
                                            pulseCount++;
                                            const pulsePhase = pulseCount % 2;
                                            const scaleFactor = pulsePhase === 0 ? 1.0 : 1.2;
                                            block.scale.set(
                                                originalScale.x * scaleFactor,
                                                originalScale.y * scaleFactor,
                                                originalScale.z * scaleFactor
                                            );
                                        }, 150);
                                    }
                                }, 300);
                                
                                block.userData.explosionTimerId = setTimeout(() => {
                                    // Launch player if still on the block
                                    if (this.isGrounded && this.currentSurface === 'explosion' && this.currentExplosionBlock === block) {
                                        this.velocity.y = this.jumpStrength * 1.0; // Reduced force from 2.0 to 1.0
                                        this.isGrounded = false;
                                        this.justExploded = true;
                                        this.explosionDelay = 0.5; // 0.5 seconds delay
                                    }
                                    
                                    // Trigger explosion effect regardless of player position
                                    this.createExplosionEffect(block.position, block);
                                    
                                    block.scale.copy(originalScale);
                                    clearInterval(pulseInterval);
                                    delete block.userData.explosionTimerId;
                                }, block.userData.explosionTimer || 1500);
                            }
                            this.currentExplosionBlock = block;
                        }
                    }
                    // Check if character is below the block
                    else if (this.lastPosition.y + this.height/2 <= blockBottom + 0.1) {
                        // Collision from below - character's head hit the block
                        this.mesh.position.y = blockBottom - this.height/2 - 0.01;
                        this.velocity.y = Math.min(0, this.velocity.y);  // Stop upward momentum
                    }
                    // Otherwise, it's a side collision that occurred after horizontal movement
                    // but we already handled that in handleCollisionsHorizontal
                }
                
                // Update collision box after repositioning
                this.updateCollisionBox();
            }
        }
    }
    
    updateCollisionBox() {
        // Create a tight box around the character for collision detection
        const charSize = new THREE.Vector3(this.radius * 1.8, this.height, this.radius * 1.8);
        this.collisionBox.setFromCenterAndSize(this.mesh.position, charSize);
    }

    moveForward() {
        // This method is kept for backward compatibility
        // but we're now setting the direction vector directly
        this.direction.z = -1;
    }

    moveBackward() {
        // This method is kept for backward compatibility
        // but we're now setting the direction vector directly
        this.direction.z = 1;
    }

    moveLeft() {
        // This method is kept for backward compatibility
        // but we're now setting the direction vector directly
        this.direction.x = -1;
    }

    moveRight() {
        // This method is kept for backward compatibility
        // but we're now setting the direction vector directly
        this.direction.x = 1;
    }

    jump() {
        if (this.isGrounded) {
            // Check if the character is on a sticky surface
            if (this.currentSurface === 'sticky') {
                // Apply a significantly reduced jump strength or prevent jumping
                this.velocity.y = this.jumpStrength * 0.1; // Very small jump
                // Alternatively, uncomment the line below to prevent jumping entirely:
                // this.velocity.y = 0; 
            } else {
                // Regular jump
                this.velocity.y = this.jumpStrength;
            }
            this.isGrounded = false;
        }
    }

    // Create a visual explosion effect
    createExplosionEffect(position, explodingBlock = null) {
        const particles = new THREE.Group();
        
        const flash = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 })
        );
        flash.position.copy(position);
        this.scene.add(flash);
        
        if (explodingBlock) {
            const fragmentSize = 0.5;
            const blockColor = explodingBlock.material.color.clone();
            
            for (let x = 0; x < 2; x++) {
                for (let y = 0; y < 2; y++) {
                    for (let z = 0; z < 2; z++) {
                        const fragment = new THREE.Mesh(
                            new THREE.BoxGeometry(fragmentSize, fragmentSize, fragmentSize),
                            new THREE.MeshStandardMaterial({
                                color: blockColor,
                                emissive: 0xFF0000,
                                emissiveIntensity: 0.5 * Math.random(),
                                transparent: true,
                                opacity: 1.0
                            })
                        );
                        const offsetX = x === 0 ? -fragmentSize/2 : fragmentSize/2;
                        const offsetY = y === 0 ? -fragmentSize/2 : fragmentSize/2;
                        const offsetZ = z === 0 ? -fragmentSize/2 : fragmentSize/2;
                        fragment.position.set(position.x + offsetX, position.y + offsetY, position.z + offsetZ);
                        fragment.userData.vx = offsetX * 0.3;
                        fragment.userData.vy = offsetY * 0.3 + 0.2;
                        fragment.userData.vz = offsetZ * 0.3;
                        fragment.userData.rotX = (Math.random() - 0.5) * 0.2;
                        fragment.userData.rotY = (Math.random() - 0.5) * 0.2;
                        fragment.userData.rotZ = (Math.random() - 0.5) * 0.2;
                        // Add random fade delay and fade duration for each fragment
                        fragment.userData.fadeDelay = 30 + Math.floor(Math.random() * 30); // Random delay between 30-60 frames
                        fragment.userData.fadeDuration = 20 + Math.floor(Math.random() * 40); // Random fade duration between 20-60 frames
                        particles.add(fragment);
                    }
                }
            }
            
            this.scene.remove(explodingBlock);
            window.gameEvents.dispatchEvent(new CustomEvent('blockDestroyed', { detail: { block: explodingBlock } }));
        }
        
        this.scene.add(particles);
        
        let frameCount = 0;
        const maxFrames = 100; // Extended animation duration
        const animateExplosion = () => {
            frameCount++;
            flash.material.opacity -= 0.1;
            
            particles.children.forEach(p => {
                p.position.x += p.userData.vx;
                p.position.y += p.userData.vy;
                p.position.z += p.userData.vz;
                p.userData.vy -= 0.01;
                p.rotation.x += p.userData.rotX;
                p.rotation.y += p.userData.rotY;
                p.rotation.z += p.userData.rotZ;
                
                // Start fading after individual delay
                if (frameCount > p.userData.fadeDelay) {
                    const fadeProgress = (frameCount - p.userData.fadeDelay) / p.userData.fadeDuration;
                    p.material.opacity = Math.max(0, 1 - fadeProgress);
                }
            });
            
            // Remove particles when all have faded out or max frames reached
            if (frameCount < maxFrames && particles.children.some(p => p.material.opacity > 0)) {
                requestAnimationFrame(animateExplosion);
            } else {
                this.scene.remove(flash);
                this.scene.remove(particles);
            }
        };
        animateExplosion();
    }
    
    // Handle teleportation
    teleport(blocks) {
        // Find all teleport blocks
        const teleportBlocks = blocks.filter(block => block.userData.type === 'teleport');
        
        // Need at least 2 teleport blocks to teleport
        if (teleportBlocks.length < 2) return;
        
        // Find our current block and a random different target
        const currentBlockIndex = teleportBlocks.findIndex(block => 
            Math.abs(block.position.x - this.mesh.position.x) < 1 && 
            Math.abs(block.position.z - this.mesh.position.z) < 1);
        
        if (currentBlockIndex === -1) return;
        
        // Generate an array of possible targets (excludes current block)
        const possibleTargets = teleportBlocks.filter((_, index) => index !== currentBlockIndex);
        
        // Select random target
        const targetBlock = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        
        // Create teleport effect at current position
        this.createTeleportEffect(this.mesh.position.clone());
        
        // Teleport character - position properly above the target block
        // Get the height of the target teleport block
        const targetBox = new THREE.Box3().setFromObject(targetBlock);
        const blockTop = targetBox.max.y;
        
        this.mesh.position.set(
            targetBlock.position.x,
            blockTop + this.height/2 + 0.001,
            targetBlock.position.z
        );
        
        // Reset vertical velocity to prevent falling
        this.velocity.y = 0;
        
        // Create teleport effect at target position
        this.createTeleportEffect(this.mesh.position.clone());
    }
    
    // Create visual teleport effect
    createTeleportEffect(position) {
        // Create a ring of particles
        const particleCount = 15;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x9C27B0 })
            );
            
            // Position in a ring
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 0.5;
            particle.position.set(
                position.x + Math.cos(angle) * radius,
                position.y,
                position.z + Math.sin(angle) * radius
            );
            
            particles.add(particle);
        }
        
        this.scene.add(particles);
        
        // Animate and remove after a short time
        let frameCount = 0;
        const animateTeleport = () => {
            frameCount++;
            
            for (let i = 0; i < particles.children.length; i++) {
                const p = particles.children[i];
                
                // Scale up and fade out
                p.scale.multiplyScalar(1.1);
                p.material.opacity = 1 - (frameCount / 20);
                p.material.transparent = true;
            }
            
            if (frameCount < 20) {
                requestAnimationFrame(animateTeleport);
            } else {
                this.scene.remove(particles);
            }
        };
        
        animateTeleport();
    }

    // Create a visual bounce effect
    createBounceEffect(block) {
        // Store original scale
        const originalScale = block.scale.clone();
        
        // Squish the block
        block.scale.set(originalScale.x * 1.2, originalScale.y * 0.8, originalScale.z * 1.2);
        
        // Restore with a bouncy tween effect
        setTimeout(() => {
            // Expand vertically slightly beyond original
            block.scale.set(originalScale.x * 0.9, originalScale.y * 1.1, originalScale.z * 0.9);
            
            // Return to normal
            setTimeout(() => {
                block.scale.copy(originalScale);
            }, 100);
        }, 100);
    }
} 