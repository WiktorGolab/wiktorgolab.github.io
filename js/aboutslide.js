import * as THREE from 'three';

class AngledHalo {
    constructor() {
        this.container = document.getElementById('halo-container');
        if (!this.container) return;

        this.words = ["CREATIVITY", "CODE", "DESIGN", "SOLUTIONS", "WEB"];
        this.init();
    }

    init() {
        this.setupScene();
        this.createHalo();
        this.animate();
        this.handleResize();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(2.5, -2, 2.5);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Ustawienia głębi dla lepszego renderowania nakładających się obiektów
        this.renderer.sortObjects = true;

        this.container.appendChild(this.renderer.domElement);
    }

    createHalo() {
        this.haloGroup = new THREE.Group();

        // USTAWIENIE KĄTA
        this.haloGroup.rotation.x = Math.PI * 0.6;
        this.haloGroup.rotation.y = Math.PI * -0.1;
        this.haloGroup.rotation.z = Math.PI * 0.05;

        const radius = 2.2;
        const totalWords = this.words.length;

        // Najpierw tworzymy linię aureoli (będzie renderowana jako pierwsza)
        this.createHaloRing(radius);

        // Potem dodajemy napisy (będą renderowane na wierzchu)
        this.words.forEach((word, index) => {
            this.createTextElement(word, index, totalWords, radius);
        });

        this.setupLighting();

        this.scene.add(this.haloGroup);
    }

    createTextElement(word, index, totalWords, radius) {
        const canvas = this.createTextCanvas(word);
        const texture = new THREE.CanvasTexture(canvas);

        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        texture.generateMipmaps = false;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            color: 0xffd27f,
            depthTest: true,
            depthWrite: false // Wyłącz zapisywanie głębi dla sprite'ów
        });

        const sprite = new THREE.Sprite(material);

        const aspectRatio = canvas.width / canvas.height;
        const scaleFactor = 2.8;
        sprite.scale.set(aspectRatio * scaleFactor, scaleFactor, 1);

        // Pozycja na okręgu - TEKST PRZESUNIĘTY DO PRZODU (większe Z)
        const angle = (index / totalWords) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Tekst na Z = 0.01 (nieznacznie przed linią) - zapobiega konfliktom głębi
        sprite.position.set(x, y, 0.01);

        sprite.rotation.z = -angle;

        this.haloGroup.add(sprite);
    }

    createTextCanvas(text) {
        const fontSize = 60;
        const padding = 180;

        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        tempContext.font = `Bold ${fontSize}px Arial`;

        const textWidth = tempContext.measureText(text).width;
        const textHeight = fontSize;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = Math.ceil(textWidth + padding * 2);
        canvas.height = Math.ceil(textHeight + padding * 2);

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = `Bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#ffd27f');
        gradient.addColorStop(0.5, '#ffaa33');
        gradient.addColorStop(1, '#ff8800');

        context.fillStyle = gradient;

        context.shadowColor = '#ffaa33';
        context.shadowBlur = 25;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        context.fillText(text, canvas.width / 2, canvas.height / 2);

        context.strokeStyle = '#ff8800';
        context.lineWidth = 2;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);

        return canvas;
    }

    createHaloRing(radius) {
        const geometry = new THREE.BufferGeometry();
        const segments = 64;
        const vertices = [];

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            vertices.push(x, y, 0); // Linia na Z = 0
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.LineBasicMaterial({
            color: 0xffaa33,
            transparent: true,
            opacity: 0.5,
            linewidth: 1
        });

        const ring = new THREE.Line(geometry, material);
        this.haloGroup.add(ring);

        this.createGlowPoints(radius);
    }

    createGlowPoints(radius) {
        const pointsGeometry = new THREE.BufferGeometry();
        const pointsPositions = [];
        const pointsColors = [];

        const pointCount = 24;

        for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            // Punkty na Z = -0.01 (nieznacznie za linią)
            pointsPositions.push(x, y, -0.01);

            const intensity = (Math.cos(angle) + 1) * 0.3 + 0.4;
            pointsColors.push(1.0, 0.6 + intensity * 0.2, 0.2 + intensity * 0.2);
        }

        pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointsPositions, 3));
        pointsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(pointsColors, 3));

        const pointsMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: false,
            depthTest: true
        });

        const points = new THREE.Points(pointsGeometry, pointsMaterial);
        this.haloGroup.add(points);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffd27f, 0.8);
        directionalLight.position.set(1, 2, 3);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffaa33, 0.6, 5);
        pointLight.position.set(0, 0, 1);
        this.haloGroup.add(pointLight);
    }

    animate() {
        if (!this.renderer) return;

        requestAnimationFrame(() => this.animate());

        if (this.haloGroup) {
            this.haloGroup.rotation.z += 0.008;
        }

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            if (!this.container || !this.camera || !this.renderer) return;

            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }
}

// Klasa do obsługi paginacji
class PaginationManager {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        if (this.isMobile) {
            this.initMobilePagination();
        } else {
            this.initDesktopPagination();
        }
        this.setupEventListeners();
    }

    initDesktopPagination() {
        // Lewa kolumna
        this.leftPages = document.querySelectorAll('.about-left-column .page');
        this.leftIndicators = document.querySelectorAll('.about-left-column .page-indicator');
        this.leftPrevBtn = document.querySelector('.about-left-column .prev-btn');
        this.leftNextBtn = document.querySelector('.about-left-column .next-btn');
        this.leftCurrentPage = 1;
        this.leftTotalPages = this.leftPages.length;

        // Prawa kolumna
        this.rightPages = document.querySelectorAll('.about-right-column .page');
        this.rightIndicators = document.querySelectorAll('.about-right-column .page-indicator');
        this.rightPrevBtn = document.querySelector('.about-right-column .prev-btn');
        this.rightNextBtn = document.querySelector('.about-right-column .next-btn');
        this.rightCurrentPage = 1;
        this.rightTotalPages = this.rightPages.length;

        this.updateLeftPagination();
        this.updateRightPagination();
    }

    initMobilePagination() {
        this.combinedPages = document.querySelectorAll('.combined-page');
        this.combinedIndicators = document.querySelectorAll('.mobile-combined-pagination .page-indicator');
        this.combinedPrevBtn = document.querySelector('.combined-prev-btn');
        this.combinedNextBtn = document.querySelector('.combined-next-btn');
        this.combinedCurrentPage = 1;
        this.combinedTotalPages = this.combinedPages.length;

        this.updateCombinedPagination();
    }

    updateLeftPagination() {
        this.updatePagination(
            this.leftPages,
            this.leftIndicators,
            this.leftPrevBtn,
            this.leftNextBtn,
            this.leftCurrentPage,
            this.leftTotalPages
        );
    }

    updateRightPagination() {
        this.updatePagination(
            this.rightPages,
            this.rightIndicators,
            this.rightPrevBtn,
            this.rightNextBtn,
            this.rightCurrentPage,
            this.rightTotalPages
        );
    }

    updateCombinedPagination() {
        this.updatePagination(
            this.combinedPages,
            this.combinedIndicators,
            this.combinedPrevBtn,
            this.combinedNextBtn,
            this.combinedCurrentPage,
            this.combinedTotalPages
        );
    }

    updatePagination(pages, indicators, prevBtn, nextBtn, currentPage, totalPages) {
        if (!pages || !indicators) return;

        // Aktualizacja stron
        pages.forEach(page => {
            page.classList.remove('active');
            if (parseInt(page.dataset.page) === currentPage) {
                page.classList.add('active');
            }
        });

        // Aktualizacja wskaźników
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
            if (parseInt(indicator.dataset.page) === currentPage) {
                indicator.classList.add('active');
            }
        });

        // Aktualizacja przycisków
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    }

    setupEventListeners() {
        if (this.isMobile) {
            this.setupMobileEventListeners();
        } else {
            this.setupDesktopEventListeners();
        }

        // Obsługa zmiany rozmiaru okna
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;

            if (wasMobile !== this.isMobile) {
                this.reinitializePagination();
            }
        });
    }

    setupDesktopEventListeners() {
        // Lewa kolumna
        if (this.leftPrevBtn) {
            this.leftPrevBtn.addEventListener('click', () => {
                if (this.leftCurrentPage > 1) {
                    this.leftCurrentPage--;
                    this.updateLeftPagination();
                }
            });
        }

        if (this.leftNextBtn) {
            this.leftNextBtn.addEventListener('click', () => {
                if (this.leftCurrentPage < this.leftTotalPages) {
                    this.leftCurrentPage++;
                    this.updateLeftPagination();
                }
            });
        }

        this.leftIndicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                this.leftCurrentPage = parseInt(indicator.dataset.page);
                this.updateLeftPagination();
            });
        });

        // Prawa kolumna
        if (this.rightPrevBtn) {
            this.rightPrevBtn.addEventListener('click', () => {
                if (this.rightCurrentPage > 1) {
                    this.rightCurrentPage--;
                    this.updateRightPagination();
                }
            });
        }

        if (this.rightNextBtn) {
            this.rightNextBtn.addEventListener('click', () => {
                if (this.rightCurrentPage < this.rightTotalPages) {
                    this.rightCurrentPage++;
                    this.updateRightPagination();
                }
            });
        }

        this.rightIndicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                this.rightCurrentPage = parseInt(indicator.dataset.page);
                this.updateRightPagination();
            });
        });
    }

    setupMobileEventListeners() {
        if (this.combinedPrevBtn) {
            this.combinedPrevBtn.addEventListener('click', () => {
                if (this.combinedCurrentPage > 1) {
                    this.combinedCurrentPage--;
                    this.updateCombinedPagination();
                }
            });
        }

        if (this.combinedNextBtn) {
            this.combinedNextBtn.addEventListener('click', () => {
                if (this.combinedCurrentPage < this.combinedTotalPages) {
                    this.combinedCurrentPage++;
                    this.updateCombinedPagination();
                }
            });
        }

        this.combinedIndicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                this.combinedCurrentPage = parseInt(indicator.dataset.page);
                this.updateCombinedPagination();
            });
        });
    }

    reinitializePagination() {
        // Usuń wszystkie event listeners
        this.removeEventListeners();

        // Ponowna inicjalizacja
        this.init();
    }

    removeEventListeners() {
        // Ta metoda usuwa event listeners przy zmianie trybu
        // W praktyce, przy przeładowaniu strony, stare event listeners są usuwane automatycznie
        // W bardziej zaawansowanej implementacji można by tu użyć removeEventListener
    }
}

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicjalizacja Three.js halo
    new AngledHalo();

    // Inicjalizacja paginacji
    new PaginationManager();
});

// Fallback dla przeglądarek bez wsparcia dla modułów
if (typeof window !== 'undefined') {
    window.AngledHalo = AngledHalo;
    window.PaginationManager = PaginationManager;
}




// Particle system for about image
class AboutParticles {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isActive = false;
        this.devicePixelRatio = window.devicePixelRatio || 1;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Stwórz canvas który wypełnia cały ekran
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'about-particles-canvas';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.resizeCanvas();
        this.createParticles();
        this.startAnimation();

        // Obsługa zmiany rozmiaru okna
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.handleResponsiveChanges();
        });

        // Obsługa zmiany slajdu
        this.observeSlideChanges();
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Uwzględnij device pixel ratio
        this.canvas.width = width * this.devicePixelRatio;
        this.canvas.height = height * this.devicePixelRatio;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        // Skalowanie contextu dla retina
        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    }

    createParticles() {
        this.particles = [];
        const particleCount = this.getParticleCountByDevice();

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    getParticleCountByDevice() {
        const width = window.innerWidth;
        if (width < 768) return 20; // Mobile
        if (width < 1024) return 30; // Tablet
        return 40; // Desktop
    }

    createParticle() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // LOSOWA pozycja na CAŁYM EKRANIE
        const x = Math.random() * width;
        const y = Math.random() * height;

        // Bardzo wolny losowy kierunek
        const angle = Math.random() * Math.PI * 2;
        const speed = this.getSpeedByDevice();

        // Rozmiar zależny od urządzenia
        const size = this.getSizeByDevice();

        return {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            opacity: 0.2 + Math.random() * 0.3, // Jeszcze mniej widoczne
            fadeSpeed: 0.0005 + Math.random() * 0.0005, // Bardzo wolne zanikanie
            color: '#ffaa33'
        };
    }

    getSpeedByDevice() {
        const width = window.innerWidth;
        if (width < 768) return 0.05 + Math.random() * 0.1; // Mobile
        if (width < 1024) return 0.08 + Math.random() * 0.15; // Tablet
        return 0.1 + Math.random() * 0.2; // Desktop
    }

    getSizeByDevice() {
        const width = window.innerWidth;
        if (width < 768) return 1 + Math.random() * 2; // Mobile
        if (width < 1024) return 1.5 + Math.random() * 2.5; // Tablet
        return 2 + Math.random() * 3; // Desktop
    }

    startAnimation() {
        if (!this.isActive) {
            this.isActive = true;
            this.animate();
        }
    }

    stopAnimation() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    animate() {
        if (!this.isActive || !this.ctx || !this.canvas) return;

        // Czyść cały canvas - BRAK ŚCIEŻEK
        this.ctx.clearRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);

        const canvasWidth = this.canvas.width / this.devicePixelRatio;
        const canvasHeight = this.canvas.height / this.devicePixelRatio;

        // Aktualizuj i rysuj particle
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            if (!particle) continue;

            // Aktualizuj pozycję (bardzo wolno)
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Zmniejsz opacity
            particle.opacity -= particle.fadeSpeed;

            // Sprawdź czy particle jest poza ekranem lub zanikło
            const margin = 50;
            if (particle.opacity <= 0 ||
                particle.x < -margin || particle.x > canvasWidth + margin ||
                particle.y < -margin || particle.y > canvasHeight + margin) {

                // Zamień na nowy particle startujący z losowej pozycji na ekranie
                this.particles[i] = this.createParticle();
            } else {
                // Rysuj particle
                this.drawParticle(particle);
            }
        }

        // Dodawaj nowe particles jeśli jest ich za mało
        if (this.particles.length < this.getParticleCountByDevice()) {
            this.particles.push(this.createParticle());
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawParticle(particle) {
        this.ctx.save();

        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    observeSlideChanges() {
        // Ustaw początkowy stan (jeśli slideManager już istnieje)
        const initialIndex = (window.slideManager && typeof window.slideManager.current === 'number') ? window.slideManager.current : 0;
        this.setParticlesVisibility(initialIndex);

        // Nasłuchuj globalnego zdarzenia wysyłanego przez SlideManager
        window.addEventListener('slideChanged', (e) => {
            const idx = e && e.detail && typeof e.detail.index === 'number' ? e.detail.index : 0;
            this.setParticlesVisibility(idx);
        });

        // Dodatkowo reaguj gdy slideManager pojawi się później (w razie race condition)
        if (!window.slideManager) {
            const onSMReady = () => {
                const idx = window.slideManager ? window.slideManager.current : 0;
                this.setParticlesVisibility(idx);
                window.removeEventListener('slideManagerReady', onSMReady);
            };
            window.addEventListener('slideManagerReady', onSMReady);
        }
    }
    
    setParticlesVisibility(index) {
        // Zakładamy: "O mnie" to slajd o indexie 1
        const aboutIndex = 1;
        const visible = index === aboutIndex;

        if (!this.canvas) return;

        // Upewnij się, że mamy przejście
        if (!this.canvas.style.transition || !this.canvas.__transitionInitialized) {
            this.canvas.style.transition = 'opacity 0.6s ease';
            this.canvas.__transitionInitialized = true;
        }

        // Ustaw docelową przezroczystość i pointer-events
        this.canvas.style.opacity = visible ? '1' : '0';
        this.canvas.style.pointerEvents = visible ? 'auto' : 'none';

        // Sterowanie animacją, żeby oszczędzać zasoby
        if (visible) {
            // Jeśli ukryte przedtem -> wznów animację natychmiast
            this.startAnimation();
            // Usuń ewentualny timeout zatrzymujący animację
            if (this._hideTimeout) {
                clearTimeout(this._hideTimeout);
                this._hideTimeout = null;
            }
        } else {
            // Poczekaj na ukończenie fade-out zanim zatrzymamy pętlę requestAnimationFrame
            if (this._hideTimeout) clearTimeout(this._hideTimeout);
            this._hideTimeout = setTimeout(() => {
                this.stopAnimation();
                this._hideTimeout = null;
            }, 650); // trochę dłużej niż transition
        }
    }

    handleSlideChange(slide) {
        // Sprawdź czy to slajd "O mnie" (drugi slajd, index 1)
        const slideIndex = Array.from(document.querySelectorAll('.slide')).indexOf(slide);

        if (slideIndex === 1 && slide.classList.contains('active')) {
            // Slajd "O mnie" jest aktywny - ustaw opacity na 1
            this.targetOpacity = 1;
            if (!this.isActive) {
                this.startAnimation();
            }
        } else {
            // Inny slajd jest aktywny - ustaw opacity na 0
            this.targetOpacity = 0;
        }
    }

    handleResponsiveChanges() {
        // Aktualizuj device pixel ratio
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.resizeCanvas();

        // Dostosuj liczbę particles do nowego rozmiaru
        const targetCount = this.getParticleCountByDevice();
        const currentCount = this.particles.length;

        if (currentCount > targetCount) {
            this.particles = this.particles.slice(0, targetCount);
        } else if (currentCount < targetCount) {
            for (let i = currentCount; i < targetCount; i++) {
                this.particles.push(this.createParticle());
            }
        }
    }

    // Metody publiczne
    start() {
        this.startAnimation();
    }

    stop() {
        this.stopAnimation();
    }

    refresh() {
        this.resizeCanvas();
    }
}

// Inicjalizacja particle system
let aboutParticles = null;

function initAboutParticles() {
    aboutParticles = new AboutParticles();
}

// Automatyczna inicjalizacja
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutParticles);
} else {
    initAboutParticles();
}

// Export dla manualnego użycia
window.AboutParticlesSystem = {
    init: initAboutParticles,
    getInstance: () => aboutParticles
};