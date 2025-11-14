// Contact slide galaxy initialization
import * as THREE from 'three';

class ContactGalaxy {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.stars = null;
        this.animationId = null;
        this.isInitialized = false;
        this.rafActive = false;
        this.frameCount = 0;
        
        this.isMobile = window.innerWidth <= 768;
        this.isLowEndMobile = this.isMobile && (navigator.hardwareConcurrency <= 4 || (navigator.deviceMemory && navigator.deviceMemory <= 2));
        
        this.config = {
            count: this.isLowEndMobile ? 15000 : (this.isMobile ? 25000 : 50000),
            size: 0.015,
            radius: 6,
            branches: 4,
            spin: 1.2,
            randomness: 0.35,
            randomnessPower: 2.5,
            innerRadius: 1.2,
            outerRadius: 6,
            thickness: 1.8,
            
            insideColor: 'rgba(255, 115, 0, 0.8)',
            outsideColor: 'rgba(255, 115, 0, 0.6)',
            whiteStarsColor: '#e0e0e0ff',
            whiteStarsPercentage: 0.2,
            
            position: { x: 0, y: 4, z: 0 },
            rotation: { x: -2.5, y: 0, z: 0 },
            autoRotationSpeed: { x: 0, y: this.isMobile ? 0.002 : 0.0002, z: 0 },
            cameraPosition: { x: 0, y: 6, z: 10 },
            
            enableAutoRotation: true,
            glowEnabled: !this.isLowEndMobile && !this.isMobile,
            glowIntensity: 2.5,
            
            nebulaCount: this.isLowEndMobile ? 200 : (this.isMobile ? 300 : 600),
            nebulaSize: 8,
            nebulaColor: 'rgba(70, 59, 0, 0.8)',
            
            backgroundStarsCount: this.isLowEndMobile ? 5000 : (this.isMobile ? 8000 : 15000),
            haloStarsCount: this.isLowEndMobile ? 2000 : (this.isMobile ? 4000 : 8000),
            backgroundStarsColor: '#cccccc',
            haloStarsColor: '#ddddbb',
            backgroundStarsSize: this.isLowEndMobile ? 0.5 : (this.isMobile ? 0.4 : 0.2),
            haloStarsSize: 0.035,
            
            useSimpleShaders: this.isMobile
        };
    }
    
    async init() {
        const container = document.getElementById('contact-galaxy-container');
        const canvas = document.getElementById('contact-galaxy-canvas');
        
        if (!container || !canvas) {
            console.error('Contact galaxy container or canvas not found');
            return;
        }
        
        console.log('Initializing contact galaxy...', { container, canvas });
        
        try {
            this.scene = new THREE.Scene();
            
            const fov = this.isMobile ? 60 : 75;
            this.camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, 0.1, 1000);
            
            this.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !this.isLowEndMobile,
                alpha: true,
                powerPreference: this.isLowEndMobile ? 'low-power' : 'default'
            });
            
            this.renderer.setSize(container.clientWidth, container.clientHeight);
            const maxPixelRatio = this.isLowEndMobile ? 1 : (this.isMobile ? 1.5 : 2);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
            
            this.camera.position.set(
                this.config.cameraPosition.x,
                this.config.cameraPosition.y,
                this.config.cameraPosition.z
            );
            
            await this.createGalaxy();
            
            this.setRotation(
                this.config.rotation.x,
                this.config.rotation.y,
                this.config.rotation.z
            );
            
            this.setPosition(
                this.config.position.x,
                this.config.position.y,
                this.config.position.z
            );
            
            this.camera.lookAt(
                this.config.position.x,
                this.config.position.y,
                this.config.position.z
            );
            
            window.addEventListener('resize', () => this.onWindowResize());
            
            this.isInitialized = true;
            this.rafActive = true;
            console.log('Contact galaxy initialized successfully');
            this.animate();
            
        } catch (error) {
            console.error('Error initializing contact galaxy:', error);
        }
    }
    
    async createGalaxy() {
        if (!this.scene) return;
        
        // Use the same galaxy creation logic as GalaxyIntegrator
        // Simplified version - create background stars and halo stars
        const backgroundGeometry = new THREE.BufferGeometry();
        const backgroundPositions = new Float32Array(this.config.backgroundStarsCount * 3);
        const backgroundColors = new Float32Array(this.config.backgroundStarsCount * 3);
        const backgroundSizes = new Float32Array(this.config.backgroundStarsCount);
        
        const backgroundStarsColor = new THREE.Color(this.config.backgroundStarsColor);
        
        for (let i = 0; i < this.config.backgroundStarsCount; i++) {
            const i3 = i * 3;
            const distance = 40 + Math.random() * 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            backgroundPositions[i3] = distance * Math.sin(phi) * Math.cos(theta);
            backgroundPositions[i3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
            backgroundPositions[i3 + 2] = distance * Math.cos(phi);
            
            backgroundSizes[i] = this.config.backgroundStarsSize * (0.5 + Math.random());
            
            const brightness = 0.3 + Math.random() * 0.5;
            backgroundColors[i3] = backgroundStarsColor.r * brightness;
            backgroundColors[i3 + 1] = backgroundStarsColor.g * brightness;
            backgroundColors[i3 + 2] = backgroundStarsColor.b * brightness;
        }
        
        backgroundGeometry.setAttribute('position', new THREE.BufferAttribute(backgroundPositions, 3));
        backgroundGeometry.setAttribute('color', new THREE.BufferAttribute(backgroundColors, 3));
        backgroundGeometry.setAttribute('size', new THREE.BufferAttribute(backgroundSizes, 1));
        
        // Create star texture
        const createStarTexture = (size = this.isMobile ? 32 : 64) => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
            ctx.fill();
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        };
        
        const starTexture = createStarTexture();
        
        const backgroundStarsMaterial = new THREE.PointsMaterial({
            size: this.config.backgroundStarsSize * 2,
            sizeAttenuation: true,
            map: starTexture,
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexColors: true,
            transparent: true,
            opacity: 0.7
        });
        
        const backgroundStarsPoints = new THREE.Points(backgroundGeometry, backgroundStarsMaterial);
        this.scene.add(backgroundStarsPoints);
        
        this.stars = {
            background: backgroundStarsPoints
        };
    }
    
    setPosition(x, y, z) {
        if (this.stars) {
            this.stars.background.position.set(x, y, z);
            this.config.position = { x, y, z };
            if (this.camera) {
                this.camera.lookAt(x, y, z);
            }
        }
    }
    
    setRotation(x, y, z) {
        if (this.stars) {
            this.stars.background.rotation.set(x, y, z);
            this.config.rotation = { x, y, z };
        }
    }
    
    animate() {
        if (!this.rafActive || !this.isInitialized) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        this.frameCount++;
        
        if (this.isLowEndMobile && this.frameCount % 2 === 0) {
            return;
        }
        
        if (this.stars && this.config.enableAutoRotation) {
            const rotationSpeed = this.config.autoRotationSpeed.y;
            this.stars.background.rotation.y += rotationSpeed;
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    onWindowResize() {
        const container = document.getElementById('contact-galaxy-container');
        if (!container || !this.camera || !this.renderer) return;
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        
        const maxPixelRatio = this.isLowEndMobile ? 1 : (this.isMobile ? 1.5 : 2);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    }
    
    destroy() {
        this.rafActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize contact galaxy
let contactGalaxyInstance = null;

function initContactGalaxy() {
    if (contactGalaxyInstance && contactGalaxyInstance.isInitialized) return;
    
    const container = document.getElementById('contact-galaxy-container');
    const canvas = document.getElementById('contact-galaxy-canvas');
    
    if (!container || !canvas) {
        // Retry after a short delay
        setTimeout(initContactGalaxy, 100);
        return;
    }
    
    if (!contactGalaxyInstance) {
        contactGalaxyInstance = new ContactGalaxy();
    }
    
    if (!contactGalaxyInstance.isInitialized) {
        contactGalaxyInstance.init().catch(err => {
            console.error('Failed to initialize contact galaxy:', err);
        });
    }
}

// Initialize when DOM is ready
function setupContactGalaxy() {
    // Try to initialize
    setTimeout(initContactGalaxy, 1000);
    
    // Also try to initialize when slide becomes active
    const contactSlide = document.querySelector('.slide.contact');
    if (contactSlide) {
        const observer = new MutationObserver(() => {
            if (contactSlide.classList.contains('active')) {
                if (!contactGalaxyInstance || !contactGalaxyInstance.isInitialized) {
                    initContactGalaxy();
                } else {
                    contactGalaxyInstance.rafActive = true;
                    if (!contactGalaxyInstance.animationId) {
                        contactGalaxyInstance.animate();
                    }
                }
            }
        });
        
        observer.observe(contactSlide, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Check immediately
        if (contactSlide.classList.contains('active')) {
            setTimeout(initContactGalaxy, 500);
        }
    } else {
        // Retry if slide not found yet
        setTimeout(setupContactGalaxy, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupContactGalaxy);
} else {
    setupContactGalaxy();
}

