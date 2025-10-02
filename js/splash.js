window.addEventListener('load', () => {
    const splash = document.getElementById('splash');

    setTimeout(() => {
        splash.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'clip-path') {
                splash.style.display = 'none';
            }
        });
        splash.classList.add('hidden');
    }, 500);
});

function createDust(num = 50) {
    const container = document.getElementById('dust-container');

    container.innerHTML = '';

    const radius = 350;

    for (let i = 0; i < num; i++) {
        const dust = document.createElement('div');
        dust.className = 'dust';

        const angle = Math.random() * 2 * Math.PI;
        const r = Math.random() * radius;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);

        const size = 2 + Math.random() * 8;
        dust.style.width = `${size}px`;
        dust.style.height = `${size}px`;
        dust.style.transform = `translate(${x}px, ${y}px)`;

        const maxOpacity = 1;
        const minOpacity = 0.1;
        const factor = Math.pow(r / radius, 2);
        const opacity = maxOpacity - factor * (maxOpacity - minOpacity);

        dust.style.opacity = opacity;

        container.appendChild(dust);

        animateDust(dust, radius);
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
    switch (document.readyState) {
        case 'loading':
            fill.style.width = '10%';
            break;
        case 'interactive':
            fill.style.width = '60%';
            break;
        case 'complete':
            fill.style.width = '100%';
            break;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash');

    requestAnimationFrame(() => {
        splash.classList.add('show-content');
    });
});