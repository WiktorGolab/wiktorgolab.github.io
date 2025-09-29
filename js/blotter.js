// text-distortion.js

// Nazwa elementu docelowego w HTML
const targetId = 'text-distortion';
// Tekst do wyświetlenia
const displayText = 'Cześć!';
// Czcionka do użycia (ta sama co w CSS)
const fontFamily = 'Oxanium, serif';

// Funkcja inicjalizująca Blotter po załadowaniu czcionki
function initBlotter() {
    const target = document.getElementById(targetId);
    if (!target) return;

    // Tworzymy tekst Blottera
    const text = new Blotter.Text(displayText, {
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
