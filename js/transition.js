let nextHref = null; // globalna zmienna dla docelowego linku

const splash = document.getElementById('splash');
const splashContent = splash.querySelector('.splash-content');

splash.addEventListener('transitionend', function(e) {
    if (e.propertyName === 'clip-path' && nextHref) {
        const href = nextHref;
        nextHref = null;

        // upewniamy się, że splash jest w pełni rozwinięty
        splash.style.clipPath = 'none';
        splash.style.display = 'flex'; // gwarantujemy, że jest widoczny

        setTimeout(() => {
            window.location.href = href;
        }, 30); // minimalny delay
    }
});

const links = document.querySelectorAll('a.splash-transition');

links.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();

        // ustawiamy docelowy link
        nextHref = link.href;

        // pokaż splash i ustaw clip-path na 0% na start
        splash.style.display = 'flex';
        splash.style.clipPath = 'circle(0% at center)';
        splashContent.style.display = 'none';
        splash.classList.remove('hidden', 'show-content');

        // Ukryj wszystkie elementy poza splash
        document.querySelectorAll('body > *:not(#splash)').forEach(el => {
            el.style.transition = 'opacity 0.5s ease';
            el.style.opacity = '0';
        });

        // wymuszenie reflow
        splash.offsetHeight;

        // animacja rozwinięcia
        splash.style.transition = 'clip-path 1s ease-in-out';
        splash.style.clipPath = 'circle(150% at center)';

        // Tworzymy pył
        createDust(50);

        // Usunięcie klasy .hidden – splash zostaje na ekranie
        setTimeout(() => {
            splash.style.transition = '';
            splashContent.style.display = ''; // przywracamy dla kolejnego użycia
        }, 1500);
    });
});
