// text-distortion.js

// Nazwa elementu docelowego w HTML
const targetId = 'text-distortion';
// Determine display text based on selected language (stored in localStorage 'site_lang')
function getDisplayText() {
    const lang = localStorage.getItem('site_lang') || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'pl');
    return lang === 'en' ? 'Hello!' : 'Cześć!';
}
// Czcionka do użycia (ta sama co w CSS)
const fontFamily = 'Oxanium, serif';

// Funkcja inicjalizująca Blotter po załadowaniu czcionki
function initBlotter() {
    const target = document.getElementById(targetId);
    if (!target) return;

    // Upewnij się, że nie zostawiamy poprzednich instancji
    target.innerHTML = '';

    // Tekst do wyświetlenia (może być zmieniony przez język)
    const displayTextLocal = getDisplayText();

    // Tworzymy tekst Blottera
    const text = new Blotter.Text(displayTextLocal, {
        family: fontFamily,
        size: 200,
        weight: 900,
        fill: 'white'
    });

    // Tworzymy materiał efektu
    const material = new Blotter.LiquidDistortMaterial();
    material.uniforms.uSpeed.value = 0.1;
    material.uniforms.uVolatility.value = 0.03;
    material.uniforms.uSeed.value = 0.1;

    // Inicjalizacja Blottera
    const blotter = new Blotter(material, { texts: text });
    const scope = blotter.forText(text);
    scope.appendTo(target);
}

// Czekamy, aż wszystkie czcionki będą gotowe
document.fonts.ready.then(() => {
    initBlotter();
}).catch((err) => {
    console.error('Problem z załadowaniem czcionki:', err);
    // Nawet jeśli czcionka się nie załaduje, możemy spróbować
    initBlotter();
});

// Listen for clicks on language buttons to update the blotter text immediately
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.langbar button[data-lang]');
    if (!btn) return;
    const lang = btn.getAttribute('data-lang');
    if (!lang) return;
    // update site_lang so other systems remain consistent
    try { localStorage.setItem('site_lang', lang); } catch (err) { /* ignore */ }
    // reinitialize blotter to reflect new language
    initBlotter();
});
