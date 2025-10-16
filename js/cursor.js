// Poczekaj aż cała strona się załaduje
document.addEventListener('DOMContentLoaded', function() {
    // Sprawdź czy jesteśmy na urządzeniu mobilnym
    function isMobileDevice() {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0) ||
            (window.innerWidth <= 768)); // Dodatkowe sprawdzenie szerokości ekranu
    }
    
    // Jeśli to urządzenie mobilne, przerwij wykonanie kodu
    if (isMobileDevice()) {
        console.log('Urządzenie mobilne - efekt kursora wyłączony');
        return;
    }
    
    // Sprawdź czy kursor już istnieje
    if (document.getElementById('cursor-style')) {
        console.log('Kursor już istnieje');
        return;
    }
    
    // Utwórz element kursora
    const cursor = document.createElement('div');
    cursor.id = 'cursor-style';
    
    // Dodaj kursor do body
    document.body.appendChild(cursor);
    
    // Poczekaj chwilę aż element zostanie dodany do DOM
    setTimeout(() => {
        // Ustaw podstawowe style konieczne do działania
        cursor.style.position = 'fixed';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9999';
        cursor.style.left = '0';
        cursor.style.top = '0';
        
        // Zmienne do śledzenia pozycji myszy
        let mouseX = 0;
        let mouseY = 0;
        let scale = 1;
        let time = 0;
        
        // Funkcja obsługująca ruch myszy
        function handleMouseMove(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
        
        // Funkcja animacji dla płynnego ruchu
        function animateCursor() {
            time += 0.02;
            // Animacja scale - pulsowanie
            scale = 1 + Math.sin(time) * 0.1;
            
            // Łączymy transformację pozycji i scale
            cursor.style.transform = `translate(${mouseX - 30}px, ${mouseY - 30}px) scale(${scale})`;
            requestAnimationFrame(animateCursor);
        }
        
        // Dodaj event listener i rozpocznij animację
        document.addEventListener('mousemove', handleMouseMove);
        animateCursor();

    }, 10);
});