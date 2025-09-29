const hamburger = document.getElementById('hamburger');
const navbarButtons = document.getElementById('navbarButtons');
const navbar = document.querySelector('.navbar');

hamburger.addEventListener('click', (e) => {
    e.stopPropagation();

    const isOpening = !navbarButtons.classList.contains('open');

    hamburger.classList.toggle('active');
    navbarButtons.classList.toggle('open');

    if (isOpening) {
        hamburger.classList.add('hidden');
        navbar.classList.add('transparent');
    } else {
        hamburger.classList.remove('hidden');
        navbar.classList.remove('transparent');
    }
});

navbarButtons.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        hamburger.classList.remove('active', 'hidden');
        navbarButtons.classList.remove('open');
        navbar.classList.remove('transparent');
    });
});

document.addEventListener('click', (e) => {
    if (!navbarButtons.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active', 'hidden');
        navbarButtons.classList.remove('open');
        navbar.classList.remove('transparent');
    }
});

window.addEventListener('load', () => {
    hamburger.classList.remove('active', 'hidden');
    navbarButtons.classList.remove('open');
    navbar.classList.remove('transparent');
});
