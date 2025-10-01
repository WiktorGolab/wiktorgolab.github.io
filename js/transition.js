let nextHref = null;
let targetSlide = 0;

const splash = document.getElementById('splash');
const splashContent = splash.querySelector('.splash-content');

splash.addEventListener('transitionend', function(e) {
    if (e.propertyName === 'clip-path' && nextHref) {
        const href = nextHref;
        nextHref = null;

        splash.style.clipPath = 'none';
        splash.style.display = 'flex';

        setTimeout(() => {
            window.location.href = href;
        }, 30);
    }
});

// Funkcja do nawigacji z animacją
function navigateWithTransition(url, slide = 0) {
    event.preventDefault();
    
    targetSlide = slide;
    nextHref = url;

    // Zapisz docelowy slide w sessionStorage
    if (url.includes('index.html') || url === 'index.html' || url === '/') {
        sessionStorage.setItem('targetSlide', slide.toString());
    }

    splash.style.display = 'flex';
    splash.style.clipPath = 'circle(0% at center)';
    splashContent.style.display = 'none';
    splash.classList.remove('hidden', 'show-content');

    document.querySelectorAll('body > *:not(#splash)').forEach(el => {
        el.style.transition = 'opacity 0.5s ease';
        el.style.opacity = '0';
    });

    splash.offsetHeight;

    splash.style.transition = 'clip-path 1s ease-in-out';
    splash.style.clipPath = 'circle(150% at center)';

    createDust(50);

    setTimeout(() => {
        splash.style.transition = '';
        splashContent.style.display = '';
    }, 1500);
}

// Funkcja do obsługi przejść na stronie głównej
function handleHomePageTransition() {
    const savedSlide = sessionStorage.getItem('targetSlide');
    if (savedSlide !== null && window.goTo) {
        setTimeout(() => {
            window.goTo(parseInt(savedSlide));
            sessionStorage.removeItem('targetSlide');
        }, 500);
    }
}

// Sprawdź czy jesteśmy na stronie głównej i uruchom przejście
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', handleHomePageTransition);
}

// Obsługa zwykłych linków ze splash transition
const links = document.querySelectorAll('a.splash-transition');

links.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Dla linku do strony głównej bez określonego slajdu, użyj slajdu 0
        const slide = link.getAttribute('data-slide') || 0;
        navigateWithTransition(link.href, parseInt(slide));
    });
});