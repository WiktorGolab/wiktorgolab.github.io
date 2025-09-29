(function () {
    const slides = Array.from(document.querySelectorAll('.slide'));
    const slidesContainer = document.getElementById('slides');
    const arrowDown = document.querySelector('.arrow-down');
    const arrowUp = document.querySelector('.arrow-up');
    window.current = 0;
    let locked = false;
    let touchStartY = 0;

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

        setTimeout(() => locked = false, 900);
    }

    window.goTo = goTo;
    window.goArrowDown = () => goTo(window.current + 1);
    window.goArrowUp = () => goTo(window.current - 1);

    window.addEventListener('wheel', e => {
        if (locked) return;
        e.deltaY > 0 ? goTo(window.current + 1) : goTo(window.current - 1);
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
        if (Math.abs(dy) > 50) dy < 0 ? goTo(window.current + 1) : goTo(window.current - 1);
    });

    window.addEventListener('load', () => {
        setContainerHeight();
        activateSlide(window.current);
    });

    window.addEventListener('resize', () => {
        setContainerHeight();
        const slideHeight = slides[0].getBoundingClientRect().height;
        slidesContainer.style.transform = `translateY(-${window.current * slideHeight}px)`;
    });
})();

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
const hero = document.getElementById('heroimg');

let particles = [];
const particleCount = 300;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getHeroCenter() {
    const rect = hero.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        radius: Math.max(rect.width, rect.height) / 1.5
    };
}

function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5
        });
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const heroCenter = getHeroCenter();

    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        const dx = p.x - heroCenter.x;
        const dy = p.y - heroCenter.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        const maxDist = heroCenter.radius;
        let alpha = 1 - Math.min(dist / maxDist, 1);
        alpha = Math.pow(alpha, 1.5);

        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(drawParticles);
}

createParticles();
drawParticles();