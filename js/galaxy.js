import * as THREE from 'three';

class GalaxyIntegrator {
    constructor(config = {}) {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.stars = null;
        this.animationId = null;

        // Lepsze wykrywanie urządzeń mobilnych
        this.isMobile = this.detectMobile();
        this.isLowEndMobile = this.isMobile && this.detectLowEndDevice();
        
        this.config = {
            // Znacząco zmniejszona liczba cząstek dla urządzeń mobilnych
            count: this.isLowEndMobile ? 10000 : (this.isMobile ? 30000 : 60000),
            size: 0.02,
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
                x: this.isMobile ? 0 : -2,
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
                y: this.isMobile ? 0.0015 : 0.00015,
                z: 0
            },

            // POPRAWIONE: Kamera ma inną pozycję niż galaktyka
            cameraPosition: {
                x: 0,  // Zmienione z -2 na 0
                y: 8,  // Zmienione z 6 na 8
                z: 12  // Zmienione z 5 na 12
            },

            enableControls: false,
            enableAutoRotation: true,

            fogEnabled: false,
            fogColor: '#000000ff',
            fogDensity: 0.03,
            glowEnabled: !this.isLowEndMobile, // Wyłącz glow na słabych urządzeniach
            glowIntensity: this.isMobile ? 3.0 : 3.0,

            // Znacząco zredukowane mgławice i gwiazdy tła
            nebulaCount: this.isLowEndMobile ? 300 : (this.isMobile ? 500 : 1000),
            nebulaSize: 10,
            nebulaColor: 'rgba(70, 59, 0, 1)',

            backgroundStarsCount: this.isLowEndMobile ? 5000 : (this.isMobile ? 8000 : 10000),
            haloStarsCount: this.isLowEndMobile ? 1000 : (this.isMobile ? 3000 : 5000),
            backgroundStarsColor: '#ffffff',
            haloStarsColor: '#ffffcc',
            backgroundStarsSize: this.isLowEndMobile ? 0.35 : (this.isMobile ? 0.35 : 0.15),
            haloStarsSize: 0.04,

            // Nowe opcje optymalizacji
            useSimpleShaders: this.isMobile, // Uproszczone shadery na mobile
            lowQualityMode: this.isLowEndMobile, // Tryb niskiej jakości
            ...config
        };

        this.isInitialized = false;
        this.frameCount = 0;
        this.rafActive = true;
    }

    detectMobile() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectLowEndDevice() {
        // Wykrywanie słabych urządzeń po liczbie rdzeni i pamięci
        const hasLowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
        const isOldCPU = /(A[0-9]|Snapdragon[0-9]{3}|Exynos[0-9]{4})/.test(navigator.userAgent);
        
        return hasLowCores || hasLowMemory || isOldCPU;
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
            
            // Optymalizacja kamery - mniejsze FOV na mobile
            const fov = this.isMobile ? 60 : 75;
            this.camera = new THREE.PerspectiveCamera(fov, container.clientWidth / container.clientHeight, 0.1, 1000);

            const canvas = document.getElementById('galaxy-canvas');
            if (!canvas) {
                console.error('Canvas element not found');
                return;
            }

            // Optymalizacje renderera dla mobile
            this.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !this.isLowEndMobile, // Wyłącz antyaliasing na słabych urządzeniach
                alpha: true,
                powerPreference: this.isLowEndMobile ? 'low-power' : 'default'
            });

            this.renderer.setSize(container.clientWidth, container.clientHeight);
            
            // Optymalizacja pixel ratio
            const maxPixelRatio = this.isLowEndMobile ? 1 : (this.isMobile ? 1.5 : 2);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
            
            // Dodatkowe optymalizacje renderera
            this.renderer.autoClear = true;
            this.renderer.sortObjects = false;

            if (this.config.fogEnabled && !this.isLowEndMobile) {
                this.scene.fog = new THREE.FogExp2(
                    this.config.fogColor,
                    this.config.fogDensity
                );
            }

            // Ustawienie pozycji kamery
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

            // DODANE: Kamera patrzy na galaktykę
            this.camera.lookAt(
                this.config.position.x,
                this.config.position.y,
                this.config.position.z
            );

            // Zoptymalizowany event resize z throttling
            this.resizeThrottle = null;
            window.addEventListener('resize', () => this.throttledResize());

            this.isInitialized = true;
            this.animate();

        } catch (error) {
            console.error('Error initializing galaxy:', error);
        }
    }

    throttledResize() {
        if (this.resizeThrottle) return;
        
        this.resizeThrottle = setTimeout(() => {
            this.onWindowResize();
            this.resizeThrottle = null;
        }, 250);
    }

    async createGalaxy() {
        if (!this.scene) return;

        // Uproszczone shadery dla urządzeń mobilnych
        const createSimpleVertexShader = () => `
            attribute float size;
            attribute float opacity;
            attribute vec3 color;
            varying float vOpacity;
            varying vec3 vColor;
            
            void main() {
                vColor = color;
                vOpacity = opacity;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (250.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const createSimpleFragmentShader = () => `
            uniform sampler2D pointTexture;
            varying float vOpacity;
            varying vec3 vColor;
            
            void main() {
                vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                if (texColor.a < 0.1) discard;
                gl_FragColor = vec4(vColor, texColor.a * vOpacity);
            }
        `;

        // Create background stars geometry
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

            const brightness = 0.4 + Math.random() * 0.6;
            backgroundColors[i3] = backgroundStarsColor.r * brightness;
            backgroundColors[i3 + 1] = backgroundStarsColor.g * brightness;
            backgroundColors[i3 + 2] = backgroundStarsColor.b * brightness;
        }

        backgroundGeometry.setAttribute('position', new THREE.BufferAttribute(backgroundPositions, 3));
        backgroundGeometry.setAttribute('color', new THREE.BufferAttribute(backgroundColors, 3));
        backgroundGeometry.setAttribute('size', new THREE.BufferAttribute(backgroundSizes, 1));

        // Create halo stars geometry
        const haloGeometry = new THREE.BufferGeometry();
        const haloPositions = new Float32Array(this.config.haloStarsCount * 3);
        const haloColors = new Float32Array(this.config.haloStarsCount * 3);
        const haloSizes = new Float32Array(this.config.haloStarsCount);

        const haloStarsColor = new THREE.Color(this.config.haloStarsColor);

        for (let i = 0; i < this.config.haloStarsCount; i++) {
            const i3 = i * 3;
            const distance = 9 + Math.random() * 12;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            haloPositions[i3] = Math.sin(phi) * Math.cos(theta) * distance;
            haloPositions[i3 + 1] = Math.sin(phi) * Math.sin(theta) * distance;
            haloPositions[i3 + 2] = Math.cos(phi) * distance;

            haloSizes[i] = this.config.haloStarsSize * (0.5 + Math.random());

            const brightness = 0.6 + Math.random() * 0.4;
            haloColors[i3] = haloStarsColor.r * brightness;
            haloColors[i3 + 1] = haloStarsColor.g * brightness;
            haloColors[i3 + 2] = haloStarsColor.b * brightness;
        }

        haloGeometry.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3));
        haloGeometry.setAttribute('color', new THREE.BufferAttribute(haloColors, 3));
        haloGeometry.setAttribute('size', new THREE.BufferAttribute(haloSizes, 1));

        // Create nebula geometry only if enabled
        let nebulaGeometry = null;
        if (this.config.glowEnabled) {
            nebulaGeometry = new THREE.BufferGeometry();
            const nebulaPositions = new Float32Array(this.config.nebulaCount * 3);
            const nebulaColors = new Float32Array(this.config.nebulaCount * 3);
            const nebulaSizes = new Float32Array(this.config.nebulaCount);
            const nebulaOpacities = new Float32Array(this.config.nebulaCount);

            const nebulaColor = new THREE.Color(this.config.nebulaColor);

            for (let i = 0; i < this.config.nebulaCount; i++) {
                const i3 = i * 3;
                const radius = this.config.innerRadius * 0.7 + Math.random() * (this.config.outerRadius * 1.3);
                const spinAngle = radius * this.config.spin;
                const branchAngle = (i % this.config.branches) / this.config.branches * Math.PI * 2;

                const randomX = (Math.random() - 0.5) * this.config.randomness * 3;
                const randomY = (Math.random() - 0.5) * this.config.randomness * 0.3;
                const randomZ = (Math.random() - 0.5) * this.config.randomness * 3;

                nebulaPositions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
                nebulaPositions[i3 + 1] = randomY;
                nebulaPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

                nebulaSizes[i] = this.config.nebulaSize * (0.7 + Math.random() * 0.6);

                const normalizedRadius = (radius - this.config.innerRadius) / (this.config.outerRadius - this.config.innerRadius);
                nebulaOpacities[i] = Math.max(0, 0.1 - Math.pow(normalizedRadius, 1.5) * 0.1);

                const colorVariation = 0.7 + Math.random() * 0.6;
                nebulaColors[i3] = nebulaColor.r * colorVariation;
                nebulaColors[i3 + 1] = nebulaColor.g * colorVariation * 0.8;
                nebulaColors[i3 + 2] = nebulaColor.b * colorVariation * 0.6;
            }

            nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
            nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));
            nebulaGeometry.setAttribute('size', new THREE.BufferAttribute(nebulaSizes, 1));
            nebulaGeometry.setAttribute('opacity', new THREE.BufferAttribute(nebulaOpacities, 1));
        }

        // Create main galaxy geometry
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.config.count * 3);
        const colors = new Float32Array(this.config.count * 3);
        const sizes = new Float32Array(this.config.count);
        const opacities = new Float32Array(this.config.count);

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
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

        // Texture creation with mobile optimization
        const createGlowTexture = (size = this.isMobile ? 64 : 128, color = '#ffffff') => {
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

        const createSharpStarTexture = (size = this.isMobile ? 32 : 64, color = '#ffffff') => {
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

        const glowTexture = createGlowTexture();
        const sharpStarTexture = createSharpStarTexture();

        // Materials with mobile optimization
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

        // Use simplified shaders for mobile
        const vertexShader = this.config.useSimpleShaders ? createSimpleVertexShader() : `
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
        `;

        const fragmentShader = this.config.useSimpleShaders ? createSimpleFragmentShader() : `
            uniform sampler2D pointTexture;
            varying float vOpacity;
            varying vec3 vColor;
            
            void main() {
                vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                gl_FragColor = vec4(vColor, texColor.a * vOpacity);
            }
        `;

        // Nebula material only if enabled
        let nebulaMaterial = null;
        if (this.config.glowEnabled) {
            nebulaMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    pointTexture: { value: glowTexture }
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
        }

        const galaxyStarMaterial = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: sharpStarTexture }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        const galaxyGlowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: glowTexture }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        // Create points
        const backgroundStarsPoints = new THREE.Points(backgroundGeometry, backgroundStarsMaterial);
        const haloStarsPoints = new THREE.Points(haloGeometry, haloStarsMaterial);
        
        let nebulaPoints = null;
        if (this.config.glowEnabled && nebulaGeometry && nebulaMaterial) {
            nebulaPoints = new THREE.Points(nebulaGeometry, nebulaMaterial);
        }
        
        const glowPoints = new THREE.Points(geometry, galaxyGlowMaterial);
        const starPoints = new THREE.Points(geometry, galaxyStarMaterial);

        // Add to scene
        this.scene.add(backgroundStarsPoints);
        this.scene.add(haloStarsPoints);
        if (nebulaPoints) this.scene.add(nebulaPoints);
        if (this.config.glowEnabled) this.scene.add(glowPoints);
        this.scene.add(starPoints);

        this.stars = {
            background: backgroundStarsPoints,
            halo: haloStarsPoints,
            nebula: nebulaPoints,
            glow: glowPoints,
            stars: starPoints
        };
    }

    setPosition(x, y, z) {
        if (this.stars) {
            this.stars.halo.position.set(x, y, z);
            if (this.stars.nebula) this.stars.nebula.position.set(x, y, z);
            this.stars.glow.position.set(x, y, z);
            this.stars.stars.position.set(x, y, z);
            this.config.position = { x, y, z };
            
            // DODANE: Kamera automatycznie patrzy na nową pozycję galaktyki
            if (this.camera) {
                this.camera.lookAt(x, y, z);
            }
        }
        return this;
    }

    setRotation(x, y, z) {
        if (this.stars) {
            this.stars.halo.rotation.set(x, y, z);
            if (this.stars.nebula) this.stars.nebula.rotation.set(x, y, z);
            this.stars.glow.rotation.set(x, y, z);
            this.stars.stars.rotation.set(x, y, z);
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
            
            // DODANE: Kamera patrzy na galaktykę po zmianie pozycji
            this.camera.lookAt(
                this.config.position.x,
                this.config.position.y,
                this.config.position.z
            );
        }
        return this;
    }

    setGlow(enabled = true) {
        this.config.glowEnabled = enabled;
        if (this.stars) {
            if (this.stars.glow) this.stars.glow.visible = enabled;
            if (this.stars.nebula) this.stars.nebula.visible = enabled;
        }
        return this;
    }

    setStarsSizes(backgroundSize, haloSize) {
        this.config.backgroundStarsSize = backgroundSize;
        this.config.haloStarsSize = haloSize;
        return this;
    }

    animate() {
        if (!this.rafActive) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        this.frameCount++;

        // Optymalizacja: pomijaj co drugą klatkę na słabych urządzeniach
        if (this.isLowEndMobile && this.frameCount % 2 === 0) {
            return;
        }

        if (this.stars && this.config.enableAutoRotation) {
            const rotationSpeed = this.config.autoRotationSpeed.y;
            this.stars.halo.rotation.y += rotationSpeed;
            if (this.stars.nebula) this.stars.nebula.rotation.y += rotationSpeed;
            this.stars.glow.rotation.y += rotationSpeed;
            this.stars.stars.rotation.y += rotationSpeed;
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
        
        // Ponowna optymalizacja pixel ratio przy resize
        const maxPixelRatio = this.isLowEndMobile ? 1 : (this.isMobile ? 1.5 : 2);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    }

    destroy() {
        this.isInitialized = false;
        this.rafActive = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.resizeThrottle) {
            clearTimeout(this.resizeThrottle);
        }
        
        window.removeEventListener('resize', this.throttledResize);
        
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