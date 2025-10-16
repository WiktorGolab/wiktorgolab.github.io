(function () {
    // Sprawdź czy mamy zapisany target slide
    const savedSlide = sessionStorage.getItem('targetSlide');
    if (savedSlide !== null) {
        window.current = parseInt(savedSlide);
    } else {
        window.current = 0;
    }

    const slides = Array.from(document.querySelectorAll('.slide'));
    const slidesContainer = document.getElementById('slides');
    const arrowDown = document.querySelector('.arrow-down');
    const arrowUp = document.querySelector('.arrow-up');
    let locked = false;
    let touchStartY = 0;

    // Zmienne do kontroli galaktyki
    let galaxyInstance = null;
    let galaxyScale = 1;
    let targetScale = 1;
    let scaleAnimation = null;

    function initializeGalaxy() {
        if (window.GalaxyIntegrator && !galaxyInstance) {
            galaxyInstance = new GalaxyIntegrator();
            galaxyInstance.init().then(() => {
                return;
            });
        }
    }

    function zoomGalaxy() {
        targetScale = 1.8;
        startScaleAnimation();
    }

    function resetGalaxy() {
        targetScale = 1;
        startScaleAnimation();
    }

    function startScaleAnimation() {
        if (scaleAnimation) {
            cancelAnimationFrame(scaleAnimation);
        }

        const startTime = performance.now();
        const startScale = galaxyScale;
        const duration = 700;

        function animateScale(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeProgress = progress < 0.5 ?
                4 * progress * progress * progress :
                1 - Math.pow(-2 * progress + 2, 3) / 2;

            galaxyScale = startScale + (targetScale - startScale) * easeProgress;

            // Apply scale to all galaxy components
            applyGalaxyScale(galaxyScale);

            if (progress < 1) {
                scaleAnimation = requestAnimationFrame(animateScale);
            } else {
                scaleAnimation = null;
            }
        }

        scaleAnimation = requestAnimationFrame(animateScale);
    }

    function applyGalaxyScale(scale) {
        if (!galaxyInstance || !galaxyInstance.stars) return;

        // NOWA POZYCJA GALAKTYKI - przesunięta w prawo
        const baseGalaxyPosition = {
            x: 5,
            y: 6,
            z: 0
        }; // Zwiększono x z 0 do 5

        // Scale all galaxy components
        const components = [
            galaxyInstance.stars.background,
            galaxyInstance.stars.halo,
            galaxyInstance.stars.nebula,
            galaxyInstance.stars.glow,
            galaxyInstance.stars.stars
        ];

        components.forEach(component => {
            if (component) {
                component.scale.set(scale, scale, scale);
                // Ustaw pozycję dla komponentów, które powinny być w centrum galaktyki
                if (component !== galaxyInstance.stars.background) {
                    component.position.set(
                        baseGalaxyPosition.x,
                        baseGalaxyPosition.y,
                        baseGalaxyPosition.z
                    );
                }
            }
        });

        // NOWA POZYCJA KAMERY - dostosowana do nowej pozycji galaktyki
        const baseCameraPos = {
            x: 3,
            y: 6,
            z: 5
        }; // Zwiększono x z -2 do 3
        const zoomFactor = 1.5;

        if (scale > 1) {
            const cameraScale = 1 + (scale - 1) * zoomFactor;
            galaxyInstance.camera.position.x = baseCameraPos.x * cameraScale;
            galaxyInstance.camera.position.y = baseCameraPos.y * cameraScale;
            galaxyInstance.camera.position.z = baseCameraPos.z * cameraScale;
        } else {
            galaxyInstance.camera.position.x = baseCameraPos.x;
            galaxyInstance.camera.position.y = baseCameraPos.y;
            galaxyInstance.camera.position.z = baseCameraPos.z;
        }

        // Punkt, w który kamera ma patrzeć (centrum galaktyki)
        galaxyInstance.camera.lookAt(
            baseGalaxyPosition.x,
            baseGalaxyPosition.y,
            baseGalaxyPosition.z
        );
        galaxyInstance.camera.updateProjectionMatrix();
    }

    function setContainerHeight() {
        const viewportWidth = window.innerWidth;

        if (viewportWidth <= 768) {
            const viewportHeight = window.innerHeight;
            const slideHeight = viewportHeight - 20;

            slides.forEach(slide => {
                slide.style.height = `${slideHeight}px`;
            });

            const customMask = document.querySelector('.custom-mask');
            if (customMask) {
                customMask.style.height = `${slideHeight}px`;
            }

            slidesContainer.style.height = `${slides.length * slideHeight}px`;

            slidesContainer.style.transform = `translateY(-${window.current * slideHeight}px)`;
        } else {
            slides.forEach(slide => slide.style.height = '');
            slidesContainer.style.height = '';
            slidesContainer.style.transform =
                `translateY(-${window.current * slides[0].getBoundingClientRect().height}px)`;

            const customMask = document.querySelector('.custom-mask');
            if (customMask) customMask.style.height = '';
        }
    }

    function activateSlide(i) {
        slides.forEach((s, idx) => {
            if (idx === i) s.classList.add('active');
            else setTimeout(() => s.classList.remove('active'), 50);
        });

        arrowDown.classList.toggle('hidden', i === slides.length - 1);
        arrowUp.classList.toggle('hidden', i === 0);

        const buttons = document.querySelectorAll('.navbar-buttons button');
        buttons.forEach((btn, idx) => {
            if (idx === i) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        const ambient = document.getElementById('ambient');
        const frame = slides[i].querySelector('.frame');

        let bg = "none";
        if (frame) {
            bg = window.getComputedStyle(frame).backgroundImage;
        }

        const noise = document.getElementById('noise');
        if (noise) {
            noise.style.opacity = 0.4;
            setTimeout(() => noise.style.opacity = 0.3, 300);
        }

        ambient.style.opacity = 0;
        setTimeout(() => {
            ambient.style.background = bg;
            ambient.style.opacity = 1;
        }, 300);

        // Kontrola galaktyki na podstawie scrollowania
        if (i > 0) {
            // Jeśli scrollujemy w dół (do kolejnych slajdów)
            setTimeout(() => {
                zoomGalaxy();
            }, 200);
        } else {
            // Jeśli scrollujemy w górę (powrót do pierwszego slajdu)
            setTimeout(() => {
                resetGalaxy();
            }, 200);
        }
    }

    function goTo(index) {
        if (locked) return;
        index = Math.max(0, Math.min(index, slides.length - 1));
        if (index === window.current) return;
        locked = true;

        window.current = index;

        const slideHeight = slides[0].getBoundingClientRect().height;
        slidesContainer.style.transform = `translateY(-${window.current * slideHeight}px)`;
        activateSlide(window.current);

        // Zapisz aktualny slide w sessionStorage
        sessionStorage.setItem('targetSlide', window.current.toString());

        setTimeout(() => locked = false, 900);
    }

    window.goTo = goTo;
    window.goArrowDown = () => goTo(window.current + 1);
    window.goArrowUp = () => goTo(window.current - 1);

    window.addEventListener('wheel', e => {
        if (locked) return;
        const isScrollingDown = e.deltaY > 0;

        if (isScrollingDown) {
            goTo(window.current + 1);
        } else {
            goTo(window.current - 1);
        }
    }, {
        passive: true
    });

    window.addEventListener('keydown', e => {
        if (locked) return;
        if (e.key === 'ArrowDown') goTo(window.current + 1);
        if (e.key === 'ArrowUp') goTo(window.current - 1);
    });

    window.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY, {
        passive: true
    });
    window.addEventListener('touchend', e => {
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dy) > 50) {
            if (dy < 0) goTo(window.current + 1);
            else goTo(window.current - 1);
        }
    });

    window.addEventListener('load', () => {
        setContainerHeight();
        initializeGalaxy();
        activateSlide(window.current);
    });

    window.addEventListener('resize', () => {
        setContainerHeight();
        const slideHeight = slides[0].getBoundingClientRect().height;
        slidesContainer.style.transform = `translateY(-${window.current * slideHeight}px)`;
    });
})();