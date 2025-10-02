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