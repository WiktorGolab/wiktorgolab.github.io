 // Tymczasowe funkcje dla kompatybilności
 let slideManager = null;

 // Tymczasowe funkcje, które będą zastąpione po inicjalizacji
 function tempGoTo(index) {
     if (slideManager) {
         slideManager.goTo(index);
     } else {
         // Jeśli slideManager nie jest jeszcze gotowy, zapisz żądanie
         setTimeout(() => {
             if (slideManager) {
                 slideManager.goTo(index);
             }
         }, 100);
     }
 }

 function tempNext() {
     if (slideManager) {
         slideManager.next();
     } else {
         setTimeout(() => {
             if (slideManager) slideManager.next();
         }, 100);
     }
 }

 function tempPrevious() {
     if (slideManager) {
         slideManager.previous();
     } else {
         setTimeout(() => {
             if (slideManager) slideManager.previous();
         }, 100);
     }
 }

 // Ulepszony system slajdów
 class SlideManager {
     constructor() {
         this.slides = Array.from(document.querySelectorAll('.slide'));
         this.slidesContainer = document.getElementById('slides');
         this.arrowDown = document.querySelector('.arrow-down');
         this.arrowUp = document.querySelector('.arrow-up');

         this.current = this.loadCurrentSlide();
         this.isAnimating = false;
         this.isMobile = this.detectMobile();
         this.touchStartY = 0;

         // Galaktyka
         this.galaxyInstance = null;
         this.galaxyScale = 1;
         this.targetScale = 1;
         this.scaleAnimation = null;

         this.init();
     }

     init() {
         this.setupEventListeners();
         this.setContainerHeight();
         this.activateSlide(this.current);

         // Inicjalizacja po załadowaniu
         window.addEventListener('load', () => {
             this.setContainerHeight();
             this.initializeGalaxy();
             this.activateSlide(this.current);

             if (this.isMobile) {
                 document.body.classList.add('mobile');
             }
         });
     }

     loadCurrentSlide() {
         const savedSlide = sessionStorage.getItem('targetSlide');
         return savedSlide !== null ? parseInt(savedSlide) : 0;
     }

     detectMobile() {
         return window.innerWidth <= 768;
     }

     getRealViewportHeight() {
         if (window.visualViewport) {
             return window.visualViewport.height;
         }

         const vh = window.innerHeight * 0.01;
         document.documentElement.style.setProperty('--vh', `${vh}px`);
         return window.innerHeight;
     }

     setContainerHeight() {
         const viewportHeight = this.getRealViewportHeight();
         this.isMobile = this.detectMobile();

         if (this.isMobile) {
             const slideHeight = viewportHeight;

             this.slidesContainer.style.height = `${this.slides.length * slideHeight}px`;
             this.slidesContainer.style.transform = `translateY(-${this.current * slideHeight}px)`;

             this.slides.forEach(slide => {
                 slide.style.height = `${slideHeight}px`;
                 slide.style.minHeight = `${slideHeight}px`;
                 slide.style.overflow = 'hidden';
             });

             // Dostosowanie elementów dla mobile
             this.adjustMobileElements();
         } else {
             // Desktop
             this.slidesContainer.style.height = '';
             this.slidesContainer.style.transform = `translateY(-${this.current * 100}vh)`;

             this.slides.forEach(slide => {
                 slide.style.height = '100vh';
                 slide.style.minHeight = '';
                 slide.style.overflow = '';
             });

             this.resetDesktopElements();
         }
     }

     adjustMobileElements() {
         const customMask = document.querySelector('.custom-mask');
         if (customMask) {
             customMask.style.height = `${this.getRealViewportHeight()}px`;
         }

         const safeAreaInsetBottom = 'env(safe-area-inset-bottom, 0px)';
         const safeAreaInsetTop = 'env(safe-area-inset-top, 0px)';

         if (this.arrowDown) {
             this.arrowDown.style.bottom = `calc(60px + ${safeAreaInsetBottom})`;
         }
         if (this.arrowUp) {
             this.arrowUp.style.top = `calc(60px + ${safeAreaInsetTop})`;
         }
     }

     resetDesktopElements() {
         const customMask = document.querySelector('.custom-mask');
         if (customMask) customMask.style.height = '';

         if (this.arrowDown) this.arrowDown.style.bottom = '';
         if (this.arrowUp) this.arrowUp.style.top = '';
     }

     goTo(index) {
         if (this.isAnimating) return;

         index = Math.max(0, Math.min(index, this.slides.length - 1));
         if (index === this.current) return;

         this.isAnimating = true;
         this.current = index;

         // Animacja przejścia
         this.animateTransition();

         // Aktywacja slajdu
         this.activateSlide(this.current);

         // Zapisanie stanu
         sessionStorage.setItem('targetSlide', this.current.toString());

         // Odblokowanie po animacji
         setTimeout(() => {
             this.isAnimating = false;
         }, this.isMobile ? 600 : 900);
     }

     animateTransition() {
         if (this.isMobile) {
             const slideHeight = this.getRealViewportHeight();
             this.slidesContainer.style.transform = `translateY(-${this.current * slideHeight}px)`;
         } else {
             this.slidesContainer.style.transform = `translateY(-${this.current * 100}vh)`;
         }
     }

     next() {
         this.goTo(this.current + 1);
     }

     previous() {
         this.goTo(this.current - 1);
     }

     activateSlide(index) {
         // Aktualizacja klas aktywności
         this.slides.forEach((slide, idx) => {
             if (idx === index) {
                 slide.classList.add('active');
             } else {
                 setTimeout(() => slide.classList.remove('active'), 50);
             }
         });

         // Aktualizacja strzałek nawigacyjnych
         this.updateNavigationArrows();

         // Aktualizacja przycisków navbar
         this.updateNavbarButtons();

         // Aktualizacja efektów wizualnych
         this.updateVisualEffects();

         // Kontrola galaktyki
         this.controlGalaxy();

         // Mobile navbar control
         if (this.isMobile) {
             this.controlMobileNavbar();
         }
     }

     updateNavigationArrows() {
         if (this.arrowDown) {
             this.arrowDown.classList.toggle('hidden', this.current === this.slides.length - 1);
         }
         if (this.arrowUp) {
             this.arrowUp.classList.toggle('hidden', this.current === 0);
         }
     }

     updateNavbarButtons() {
         const buttons = document.querySelectorAll('.navbar-buttons button');
         buttons.forEach((btn, idx) => {
             if (idx === this.current) {
                 btn.classList.add('active');
             } else {
                 btn.classList.remove('active');
             }
         });
     }

     updateVisualEffects() {
         const ambient = document.getElementById('ambient');
         const frame = this.slides[this.current].querySelector('.frame');
         const noise = document.getElementById('noise');

         let bg = "none";
         if (frame) {
             bg = window.getComputedStyle(frame).backgroundImage;
         }

         if (noise) {
             noise.style.opacity = this.isMobile ? 0.3 : 0.4;
             setTimeout(() => {
                 noise.style.opacity = this.isMobile ? 0.2 : 0.3;
             }, 300);
         }

         if (ambient) {
             ambient.style.opacity = 0;
             setTimeout(() => {
                 ambient.style.background = bg;
                 ambient.style.opacity = 1;
             }, 300);
         }
     }

     controlGalaxy() {
         if (this.current > 0) {
             setTimeout(() => {
                 this.zoomGalaxy();
             }, 200);
         } else {
             setTimeout(() => {
                 this.resetGalaxy();
             }, 200);
         }
     }

     controlMobileNavbar() {
         const navbar = document.querySelector('.navbar-buttons');
         if (navbar) {
             if (this.current === 0) {
                 navbar.style.opacity = '1';
                 navbar.style.pointerEvents = 'auto';
             } else {
                 navbar.style.opacity = '0';
                 navbar.style.pointerEvents = 'none';
             }
         }
     }

     // Metody galaktyki
     initializeGalaxy() {
         if (window.GalaxyIntegrator && !this.galaxyInstance) {
             this.galaxyInstance = new GalaxyIntegrator();
             this.galaxyInstance.init().then(() => {
                 return;
             });
         }
     }

     zoomGalaxy() {
         this.targetScale = this.isMobile ? 1.3 : 1.8;
         this.startScaleAnimation();
     }

     resetGalaxy() {
         this.targetScale = 1;
         this.startScaleAnimation();
     }

     startScaleAnimation() {
         if (this.scaleAnimation) {
             cancelAnimationFrame(this.scaleAnimation);
         }

         const startTime = performance.now();
         const startScale = this.galaxyScale;
         const duration = 700;

         const animateScale = (currentTime) => {
             const elapsed = currentTime - startTime;
             const progress = Math.min(elapsed / duration, 1);

             const easeProgress = progress < 0.5 ?
                 4 * progress * progress * progress :
                 1 - Math.pow(-2 * progress + 2, 3) / 2;

             this.galaxyScale = startScale + (this.targetScale - startScale) * easeProgress;
             this.applyGalaxyScale(this.galaxyScale);

             if (progress < 1) {
                 this.scaleAnimation = requestAnimationFrame(animateScale);
             } else {
                 this.scaleAnimation = null;
             }
         };

         this.scaleAnimation = requestAnimationFrame(animateScale);
     }

     applyGalaxyScale(scale) {
         if (!this.galaxyInstance || !this.galaxyInstance.stars) return;

         const baseGalaxyPosition = this.isMobile ? {
             x: 2,
             y: 4,
             z: 0
         } : {
             x: 5,
             y: 6,
             z: 0
         };

         const components = [
             this.galaxyInstance.stars.background,
             this.galaxyInstance.stars.halo,
             this.galaxyInstance.stars.nebula,
             this.galaxyInstance.stars.glow,
             this.galaxyInstance.stars.stars
         ];

         components.forEach(component => {
             if (component) {
                 component.scale.set(scale, scale, scale);
                 if (component !== this.galaxyInstance.stars.background) {
                     component.position.set(
                         baseGalaxyPosition.x,
                         baseGalaxyPosition.y,
                         baseGalaxyPosition.z
                     );
                 }
             }
         });

         const baseCameraPos = this.isMobile ? {
             x: 1,
             y: 4,
             z: 3
         } : {
             x: 3,
             y: 6,
             z: 5
         };
         const zoomFactor = this.isMobile ? 1.2 : 1.5;

         if (scale > 1) {
             const cameraScale = 1 + (scale - 1) * zoomFactor;
             this.galaxyInstance.camera.position.x = baseCameraPos.x * cameraScale;
             this.galaxyInstance.camera.position.y = baseCameraPos.y * cameraScale;
             this.galaxyInstance.camera.position.z = baseCameraPos.z * cameraScale;
         } else {
             this.galaxyInstance.camera.position.x = baseCameraPos.x;
             this.galaxyInstance.camera.position.y = baseCameraPos.y;
             this.galaxyInstance.camera.position.z = baseCameraPos.z;
         }

         this.galaxyInstance.camera.lookAt(
             baseGalaxyPosition.x,
             baseGalaxyPosition.y,
             baseGalaxyPosition.z
         );
         this.galaxyInstance.camera.updateProjectionMatrix();
     }

     setupEventListeners() {
         // Delegowanie eventów dla przycisków
         document.addEventListener('click', (e) => {
             const target = e.target.closest('[data-slide]');
             if (target) {
                 const slideIndex = parseInt(target.getAttribute('data-slide'));
                 this.goTo(slideIndex);
                 return;
             }

             const actionTarget = e.target.closest('[data-action]');
             if (actionTarget) {
                 const action = actionTarget.getAttribute('data-action');
                 if (action === 'next') this.next();
                 if (action === 'previous') this.previous();
                 return;
             }

             // Mobile navbar clicks
             if (this.isMobile && e.target.closest('.navbar-buttons button')) {
                 const button = e.target.closest('.navbar-buttons button');
                 const buttons = Array.from(document.querySelectorAll('.navbar-buttons button'));
                 const index = buttons.indexOf(button);
                 if (index !== -1) {
                     this.goTo(index);
                 }
             }
         });

         // Wheel events (desktop only)
         window.addEventListener('wheel', (e) => {
             if (this.isAnimating || this.isMobile) return;

             const isScrollingDown = e.deltaY > 0;
             if (isScrollingDown) {
                 this.next();
             } else {
                 this.previous();
             }
         }, {
             passive: true
         });

         // Keyboard events
         window.addEventListener('keydown', (e) => {
             if (this.isAnimating) return;
             if (e.key === 'ArrowDown') this.next();
             if (e.key === 'ArrowUp') this.previous();
         });

         // Touch events
         window.addEventListener('touchstart', (e) => {
             this.touchStartY = e.touches[0].clientY;
         }, {
             passive: true
         });

         window.addEventListener('touchmove', (e) => {
             if (this.isAnimating) return;
             e.preventDefault();
         }, {
             passive: false
         });

         window.addEventListener('touchend', (e) => {
             const dy = e.changedTouches[0].clientY - this.touchStartY;
             const minSwipeDistance = 50;

             if (Math.abs(dy) > minSwipeDistance) {
                 if (dy < 0) {
                     this.next();
                 } else {
                     this.previous();
                 }
             }
         });

         // Resize events
         let resizeTimeout;
         window.addEventListener('resize', () => {
             clearTimeout(resizeTimeout);
             resizeTimeout = setTimeout(() => {
                 this.setContainerHeight();
                 this.goTo(this.current);
             }, 150);
         });

         // Orientation change
         window.addEventListener('orientationchange', () => {
             setTimeout(() => {
                 this.setContainerHeight();
                 setTimeout(() => this.goTo(this.current), 50);
             }, 400);
         });

         // Visual viewport
         if (window.visualViewport) {
             window.visualViewport.addEventListener('resize', () => this.setContainerHeight());
             window.visualViewport.addEventListener('scroll', () => {
                 window.visualViewport.scrollTo(0, 0);
             });
         }

         // Prevent default scroll on mobile
         document.addEventListener('touchmove', (e) => {
             if (this.isMobile) {
                 e.preventDefault();
             }
         }, {
             passive: false
         });
     }

     // Public method for external access
     refresh() {
         this.setContainerHeight();
         setTimeout(() => this.goTo(this.current), 50);
     }
 }

 // Inicjalizacja systemu slajdów po załadowaniu DOM
 document.addEventListener('DOMContentLoaded', () => {
     slideManager = new SlideManager();

     // Aktualizacja globalnych funkcji
     window.slideManager = slideManager;
     window.goTo = (index) => slideManager.goTo(index);
     window.goArrowDown = () => slideManager.next();
     window.goArrowUp = () => slideManager.previous();
     window.refreshSlideHeights = () => slideManager.refresh();
 });