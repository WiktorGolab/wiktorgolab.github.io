let nextHref = null;

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

const links = document.querySelectorAll('a.splash-transition');

links.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();

        nextHref = link.href;

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
    });
});
