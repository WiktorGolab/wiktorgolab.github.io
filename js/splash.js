window.addEventListener('load', () => {
    const splash = document.getElementById('splash');

    setTimeout(() => {
        splash.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'clip-path') {
                splash.remove();
            }
        });
        splash.classList.add('hidden');
    }, 500);
});

function createDust(num = 50) {
    const container = document.getElementById('dust-container');

    // Czyścimy poprzednie pyłki
    container.innerHTML = '';

    const radius = 350; // promień wokół logo

    for (let i = 0; i < num; i++) {
        const dust = document.createElement('div');
        dust.className = 'dust';

        // Losowa pozycja w okręgu
        const angle = Math.random() * 2 * Math.PI;
        const r = Math.random() * radius;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);

        const size = 2 + Math.random() * 8; // od 2px do 8px
        dust.style.width = `${size}px`;
        dust.style.height = `${size}px`;


        dust.style.transform = `translate(${x}px, ${y}px)`;

        // Opacity zależne od odległości od środka
        const maxOpacity = 1; // zamiast 0.8
        const minOpacity = 0.2; // zamiast 0.1
        const opacity = maxOpacity - (r / radius) * (maxOpacity - minOpacity);
        dust.style.opacity = opacity;


        container.appendChild(dust);

        animateDust(dust, radius); // animacja z uwzględnieniem promienia
    }
}

function animateDust(el) {
    const dx = (Math.random() - 0.5) * 50;
    const dy = (Math.random() - 0.5) * 50;
    const duration = 2000 + Math.random() * 2000;

    el.animate([{
            transform: el.style.transform,
            opacity: 0.8
        },
        {
            transform: `translate(${parseFloat(el.style.transform.split('(')[1]) + dx}px, ${parseFloat(el.style.transform.split(',')[1]) + dy}px)`,
            opacity: 0
        }
    ], {
        duration: duration,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out'
    });
}

window.addEventListener('load', () => {
    createDust(50);
});

document.addEventListener('readystatechange', () => {
    const fill = document.querySelector('.loading-bar__fill');
    // readyState: loading → interactive → complete
    switch (document.readyState) {
        case 'loading': // początek
            fill.style.width = '10%';
            break;
        case 'interactive': // DOM gotowy, ale obrazki/filmy jeszcze nie
            fill.style.width = '60%';
            break;
        case 'complete': // wszystkie zasoby pobrane
            fill.style.width = '100%';
            break;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash');

    // mały timeout / requestAnimationFrame – by przeglądarka zarejestrowała stan początkowy (opacity:0)
    requestAnimationFrame(() => {
        splash.classList.add('show-content');
    });
});