import * as THREE from 'three';

class GalaxyIntegrator {
    constructor(config = {}) {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.stars = null;
        this.animationId = null;

        this.config = {
            count: 100000,
            size: 0.015,
            radius: 8,
            branches: 4,
            spin: 1.5,
            randomness: 0.4,
            randomnessPower: 2.5,
            innerRadius: 1.5,
            outerRadius: 8,
            thickness: 2.0,

            insideColor: 'rgba(255, 102, 0, 1)',
            outsideColor: 'rgba(255, 115, 0, 1)',
            whiteStarsColor: '#e0e0e0ff',
            whiteStarsPercentage: 0.15,

            position: {
                x: 0,
                y: 5,
                z: 0
            },
            rotation: {
                x: -3,
                y: 0,
                z: 0
            },
            autoRotationSpeed: {
                x: 0,
                y: 0.00015,
                z: 0
            },

            cameraPosition: {
                x: -2,
                y: 6,
                z: 5
            },

            enableControls: false,
            enableAutoRotation: true,

            fogEnabled: false,
            fogColor: '#000000ff',
            fogDensity: 0.03,
            glowEnabled: true,
            glowIntensity: 3.0,

            // New parameters for nebula
            nebulaCount: 800,
            nebulaSize: 10,
            nebulaColor: 'rgba(63, 54, 0, 1)',

            // New parameters for background and halo stars
            backgroundStarsCount: 8000,
            haloStarsCount: 4000,
            backgroundStarsColor: '#ffffff',
            haloStarsColor: '#ffffcc',
            backgroundStarsSize: 0.1,  // Configurable background stars size
            haloStarsSize: 0.04,         // Configurable halo stars size

            ...config
        };

        this.isInitialized = false;
    }

    async init(containerId = 'galaxy-container') {
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }

        try {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

            const canvas = document.getElementById('galaxy-canvas');
            if (!canvas) {
                console.error('Canvas element not found');
                return;
            }

            this.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: true
            });

            this.renderer.setSize(container.clientWidth, container.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            if (this.config.fogEnabled) {
                this.scene.fog = new THREE.FogExp2(
                    this.config.fogColor,
                    this.config.fogDensity
                );
            }

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

            window.addEventListener('resize', () => this.onWindowResize());

            this.isInitialized = true;
            this.animate();

        } catch (error) {
            console.error('Error initializing galaxy:', error);
        }
    }

    async createGalaxy() {
        if (!this.scene) return;

        // Create background stars geometry (static, far away)
        const backgroundGeometry = new THREE.BufferGeometry();
        const backgroundPositions = new Float32Array(this.config.backgroundStarsCount * 3);
        const backgroundColors = new Float32Array(this.config.backgroundStarsCount * 3);
        const backgroundSizes = new Float32Array(this.config.backgroundStarsCount);

        const backgroundStarsColor = new THREE.Color(this.config.backgroundStarsColor);

        // Create static background stars
        for (let i = 0; i < this.config.backgroundStarsCount; i++) {
            const i3 = i * 3;

            // Random positions in a large sphere (far away)
            const distance = 40 + Math.random() * 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            backgroundPositions[i3] = distance * Math.sin(phi) * Math.cos(theta);
            backgroundPositions[i3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
            backgroundPositions[i3 + 2] = distance * Math.cos(phi);

            // Use configurable size with random variation
            backgroundSizes[i] = this.config.backgroundStarsSize * (0.5 + Math.random());

            // Color variations for background stars
            const brightness = 0.4 + Math.random() * 0.6;
            backgroundColors[i3] = backgroundStarsColor.r * brightness;
            backgroundColors[i3 + 1] = backgroundStarsColor.g * brightness;
            backgroundColors[i3 + 2] = backgroundStarsColor.b * brightness;
        }

        backgroundGeometry.setAttribute('position', new THREE.BufferAttribute(backgroundPositions, 3));
        backgroundGeometry.setAttribute('color', new THREE.BufferAttribute(backgroundColors, 3));
        backgroundGeometry.setAttribute('size', new THREE.BufferAttribute(backgroundSizes, 1));

        // Create halo stars geometry (following the galaxy)
        const haloGeometry = new THREE.BufferGeometry();
        const haloPositions = new Float32Array(this.config.haloStarsCount * 3);
        const haloColors = new Float32Array(this.config.haloStarsCount * 3);
        const haloSizes = new Float32Array(this.config.haloStarsCount);

        const haloStarsColor = new THREE.Color(this.config.haloStarsColor);

        // Create halo stars around the galaxy
        for (let i = 0; i < this.config.haloStarsCount; i++) {
            const i3 = i * 3;

            // Position in a sphere around the galaxy
            const distance = 9 + Math.random() * 12;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            haloPositions[i3] = Math.sin(phi) * Math.cos(theta) * distance;
            haloPositions[i3 + 1] = Math.sin(phi) * Math.sin(theta) * distance;
            haloPositions[i3 + 2] = Math.cos(phi) * distance;

            // Use configurable size with random variation
            haloSizes[i] = this.config.haloStarsSize * (0.5 + Math.random());

            // Color variations for halo stars
            const brightness = 0.6 + Math.random() * 0.4;
            haloColors[i3] = haloStarsColor.r * brightness;
            haloColors[i3 + 1] = haloStarsColor.g * brightness;
            haloColors[i3 + 2] = haloStarsColor.b * brightness;
        }

        haloGeometry.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3));
        haloGeometry.setAttribute('color', new THREE.BufferAttribute(haloColors, 3));
        haloGeometry.setAttribute('size', new THREE.BufferAttribute(haloSizes, 1));

        // Create nebula geometry (large glow elements) with opacity based on distance
        const nebulaGeometry = new THREE.BufferGeometry();
        const nebulaPositions = new Float32Array(this.config.nebulaCount * 3);
        const nebulaColors = new Float32Array(this.config.nebulaCount * 3);
        const nebulaSizes = new Float32Array(this.config.nebulaCount);
        const nebulaOpacities = new Float32Array(this.config.nebulaCount); // New opacity attribute for nebula

        const nebulaColor = new THREE.Color(this.config.nebulaColor);

        // Create large nebula clouds in spiral pattern
        for (let i = 0; i < this.config.nebulaCount; i++) {
            const i3 = i * 3;

            // Position in spiral arms - closer to galaxy center in Y axis
            const radius = this.config.innerRadius * 0.7 + Math.random() * (this.config.outerRadius * 1.3);
            const spinAngle = radius * this.config.spin;
            const branchAngle = (i % this.config.branches) / this.config.branches * Math.PI * 2;

            // Reduced vertical spread for nebula clouds - much closer to center plane
            const randomX = (Math.random() - 0.5) * this.config.randomness * 3;
            const randomY = (Math.random() - 0.5) * this.config.randomness * 0.3;
            const randomZ = (Math.random() - 0.5) * this.config.randomness * 3;

            nebulaPositions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            nebulaPositions[i3 + 1] = randomY;
            nebulaPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            // Large sizes for nebula
            nebulaSizes[i] = this.config.nebulaSize * (0.7 + Math.random() * 0.6);

            // Calculate opacity based on distance from center for nebula
            // Nebula further from center have lower opacity (down to 0 at outer edge)
            const normalizedRadius = (radius - this.config.innerRadius) / (this.config.outerRadius - this.config.innerRadius);
            nebulaOpacities[i] = Math.max(0, 0.1 - Math.pow(normalizedRadius, 1.5) * 0.1); // Start from 0.1 and decrease

            // Nebula colors with variations
            const colorVariation = 0.7 + Math.random() * 0.6;
            nebulaColors[i3] = nebulaColor.r * colorVariation;
            nebulaColors[i3 + 1] = nebulaColor.g * colorVariation * 0.8;
            nebulaColors[i3 + 2] = nebulaColor.b * colorVariation * 0.6;
        }

        nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
        nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));
        nebulaGeometry.setAttribute('size', new THREE.BufferAttribute(nebulaSizes, 1));
        nebulaGeometry.setAttribute('opacity', new THREE.BufferAttribute(nebulaOpacities, 1)); // Add opacity attribute for nebula

        // Create star geometry with opacity based on distance
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.config.count * 3);
        const colors = new Float32Array(this.config.count * 3);
        const sizes = new Float32Array(this.config.count);
        const opacities = new Float32Array(this.config.count); // New opacity attribute

        const colorInside = new THREE.Color(this.config.insideColor);
        const colorOutside = new THREE.Color(this.config.outsideColor);
        const colorWhite = new THREE.Color(this.config.whiteStarsColor);

        for (let i = 0; i < this.config.count; i++) {
            const i3 = i * 3;

            const randomRadius = Math.random();
            const radius = this.config.innerRadius + 
                          (this.config.outerRadius - this.config.innerRadius) * 
                          Math.pow(randomRadius, 1.5);

            const spinAngle = radius * this.config.spin;
            const branchAngle = (i % this.config.branches) / this.config.branches * Math.PI * 2;

            const randomX = Math.pow(Math.random(), this.config.randomnessPower) * 
                           (Math.random() < 0.5 ? 1 : -1) * 
                           this.config.randomness * Math.pow(radius / this.config.outerRadius, 0.5);
            
            const randomY = Math.pow(Math.random(), this.config.randomnessPower) * 
                           (Math.random() < 0.5 ? 1 : -1) * 
                           this.config.randomness * this.config.thickness * 
                           Math.pow(radius / this.config.outerRadius, 0.8);
            
            const randomZ = Math.pow(Math.random(), this.config.randomnessPower) * 
                           (Math.random() < 0.5 ? 1 : -1) * 
                           this.config.randomness * Math.pow(radius / this.config.outerRadius, 0.5);

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            sizes[i] = this.config.size * (0.5 + Math.random() * 0.5) * 
                      (1 - radius / this.config.outerRadius * 0.7);

            // Calculate opacity based on distance from center
            // Stars further from center have lower opacity (down to 0 at outer edge)
            const normalizedRadius = (radius - this.config.innerRadius) / (this.config.outerRadius - this.config.innerRadius);
            opacities[i] = Math.max(0, 1.0 - Math.pow(normalizedRadius, 1.2));

            let mixedColor;
            const isWhiteStarInGalaxy = Math.random() < this.config.whiteStarsPercentage;

            if (isWhiteStarInGalaxy) {
                const brightness = 0.8 + Math.random() * 0.4;
                mixedColor = colorWhite.clone();
                mixedColor.r *= brightness * this.config.glowIntensity;
                mixedColor.g *= brightness * this.config.glowIntensity;
                mixedColor.b *= brightness * this.config.glowIntensity;
            } else {
                const colorMixFactor = Math.pow(radius / this.config.outerRadius, 0.7);
                mixedColor = colorInside.clone();
                mixedColor.lerp(colorOutside, colorMixFactor);

                const glowFactor = 1 + (radius / this.config.outerRadius) * 0.3;
                const colorVariation = 0.7 + Math.random() * 0.6;
                mixedColor.r = Math.min(1, mixedColor.r * colorVariation * glowFactor * this.config.glowIntensity);
                mixedColor.g = Math.min(1, mixedColor.g * colorVariation * 0.9 * glowFactor * this.config.glowIntensity);
                mixedColor.b = Math.min(1, mixedColor.b * colorVariation * 0.7 * glowFactor * this.config.glowIntensity);
            }

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1)); // Add opacity attribute

        // Texture creation functions
        const createGlowTexture = (size = 128, color = '#ffffff') => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = size;
            const ctx = canvas.getContext('2d');

            const gradient = ctx.createRadialGradient(
                size / 2, size / 2, 0,
                size / 2, size / 2, size / 2
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.2, color + 'cc');
            gradient.addColorStop(0.4, color + '88');
            gradient.addColorStop(0.6, color + '44');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.fill();

            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        };

        const createSharpStarTexture = (size = 64, color = '#ffffff') => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = size;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
            ctx.fill();

            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        };

        const glowTexture = createGlowTexture(128, '#ffffff');
        const sharpStarTexture = createSharpStarTexture(64, '#ffffff');

        // Background stars material - small, sharp stars
        const backgroundStarsMaterial = new THREE.PointsMaterial({
            size: this.config.backgroundStarsSize,
            sizeAttenuation: true,
            map: sharpStarTexture,
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexColors: true,
            transparent: true,
            opacity: 0.9
        });

        // Halo stars material - small, sharp stars
        const haloStarsMaterial = new THREE.PointsMaterial({
            size: this.config.haloStarsSize,
            sizeAttenuation: true,
            map: sharpStarTexture,
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        // Custom shader material for nebula with distance-based opacity
        const nebulaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: glowTexture }
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                attribute vec3 color;
                varying float vOpacity;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vOpacity = opacity;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying float vOpacity;
                varying vec3 vColor;
                
                void main() {
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(vColor, texColor.a * vOpacity);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });


        // Custom shader material for galaxy stars with distance-based opacity
        const galaxyStarMaterial = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: sharpStarTexture }
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                attribute vec3 color;
                varying float vOpacity;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vOpacity = opacity;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying float vOpacity;
                varying vec3 vColor;
                
                void main() {
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(vColor, texColor.a * vOpacity);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        // Custom shader material for galaxy glow with distance-based opacity
        const galaxyGlowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: glowTexture }
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                attribute vec3 color;
                varying float vOpacity;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vOpacity = opacity * 0.2; // Reduce overall opacity for glow
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * 6.0 * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying float vOpacity;
                varying vec3 vColor;
                
                void main() {
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(vColor, texColor.a * vOpacity);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        // Create points for all layers
        const backgroundStarsPoints = new THREE.Points(backgroundGeometry, backgroundStarsMaterial);
        const haloStarsPoints = new THREE.Points(haloGeometry, haloStarsMaterial);
        const nebulaPoints = new THREE.Points(nebulaGeometry, nebulaMaterial);
        const glowPoints = new THREE.Points(geometry, galaxyGlowMaterial);
        const starPoints = new THREE.Points(geometry, galaxyStarMaterial);

        // Add to scene in correct order
        this.scene.add(backgroundStarsPoints); // Static background stars (far away)
        this.scene.add(haloStarsPoints);       // Halo stars (follow galaxy)
        this.scene.add(nebulaPoints);          // Nebula clouds
        this.scene.add(glowPoints);            // Galaxy glow
        this.scene.add(starPoints);            // Galaxy stars

        this.stars = {
            background: backgroundStarsPoints,  // Static, don't move with galaxy
            halo: haloStarsPoints,              // Move with galaxy
            nebula: nebulaPoints,
            glow: glowPoints,
            stars: starPoints
        };
    }

    setPosition(x, y, z) {
        if (this.stars) {
            // Only halo, nebula and galaxy stars move with the galaxy
            this.stars.halo.position.set(x, y, z);
            this.stars.nebula.position.set(x, y, z);
            this.stars.glow.position.set(x, y, z);
            this.stars.stars.position.set(x, y, z);
            // Background stars remain static
            this.config.position = { x, y, z };
        }
        return this;
    }

    setRotation(x, y, z) {
        if (this.stars) {
            // Only halo, nebula and galaxy stars rotate with the galaxy
            this.stars.halo.rotation.set(x, y, z);
            this.stars.nebula.rotation.set(x, y, z);
            this.stars.glow.rotation.set(x, y, z);
            this.stars.stars.rotation.set(x, y, z);
            // Background stars remain static
            this.config.rotation = { x, y, z };
        }
        return this;
    }

    setAutoRotationSpeed(y) {
        this.config.autoRotationSpeed.y = y;
        return this;
    }

    setCameraPosition(x, y, z) {
        if (this.camera) {
            this.camera.position.set(x, y, z);
            this.config.cameraPosition = { x, y, z };
        }
        return this;
    }

    setGlow(enabled = true) {
        this.config.glowEnabled = enabled;
        if (this.stars) {
            this.stars.glow.visible = enabled;
            this.stars.nebula.visible = enabled;
        }
        return this;
    }

    // New method for setting stars sizes
    setStarsSizes(backgroundSize, haloSize) {
        this.config.backgroundStarsSize = backgroundSize;
        this.config.haloStarsSize = haloSize;
        return this;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.stars && this.config.enableAutoRotation) {
            const rotationSpeed = this.config.autoRotationSpeed.y;
            // Only halo, nebula and galaxy stars rotate
            this.stars.halo.rotation.y += rotationSpeed;
            this.stars.nebula.rotation.y += rotationSpeed;
            this.stars.glow.rotation.y += rotationSpeed;
            this.stars.stars.rotation.y += rotationSpeed;
            // Background stars remain static
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        const container = document.getElementById('galaxy-container');
        if (!container || !this.camera || !this.renderer) return;

        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    destroy() {
        this.isInitialized = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const galaxy = new GalaxyIntegrator();
    galaxy.init();
});

window.GalaxyIntegrator = GalaxyIntegrator;