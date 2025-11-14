// tools-slide.js
class ToolsSlide {
    constructor() {
        this.tools = [
            'Generator CV',
            'Generator kodu QR', 
            'Generator kolorów',
            'Generator Lorem Ipsum',
            'Konwertuj HEX ↔ RGB ↔ HSL',
            'Porównaj tekst',
            'Sprawdź Regex',
            'Stwórz gradient',
            'Zmień atrybuty pliku',
            'Zmień rozmiar obrazu'
        ];
        
        this.background = null;
        this.isActive = false;
        this.effectsInterval = null;
        this.glitchInterval = null;
    }

    init() {
        this.background = document.getElementById('toolsBackground');
        if (!this.background) return;

        this.isActive = true;
        this.createLines();
        this.startWordEffects();
        this.startGlitchEffects();
    }

    createLines() {
        this.background.innerHTML = '';
        const lineCount = 16; // Więcej linii dla lepszego wypełnienia

        for (let i = 0; i < lineCount; i++) {
            const line = document.createElement('div');
            const lineType = i % 2 === 0 ? 'odd' : 'even'; // Nieparzyste/parzyste
            
            line.className = `tools-line ${lineType}`;
            line.style.top = `${(i / lineCount) * 100}%`;
            
            // Różne prędkości dla każdej linii
            const duration = 20 + (Math.random() * 15);
            line.style.animationDuration = `${duration}s`;
            
            // Losowe opóźnienie startu
            const delay = Math.random() * -25;
            line.style.animationDelay = `${delay}s`;
            
            // Różne rozmiary i przezroczystości
            const fontSize = 16 + Math.random() * 8;
            line.style.fontSize = `${fontSize}px`;
            line.style.opacity = `${0.1 + Math.random() * 0.15}`;

            // Tworzymy bardzo długą linię z narzędziami w losowej kolejności
            line.innerHTML = this.createLineContent();
            this.background.appendChild(line);
        }
    }

    createLineContent() {
        let content = '';
        // 6 powtórzeń dla ciągłości
        for (let i = 0; i < 6; i++) {
            const shuffledTools = [...this.tools].sort(() => Math.random() - 0.5);
            content += shuffledTools.map(tool => 
                `<span class="tools-word">${tool}</span>`
            ).join('');
        }
        return content;
    }

    startWordEffects() {
        // Aktualizuj efekty co 1.2 sekundy
        this.updateWordEffects();
        this.effectsInterval = setInterval(() => {
            if (this.isActive) this.updateWordEffects();
        }, 1200);
    }

    updateWordEffects() {
        const words = document.querySelectorAll('.tools-word');
        const totalWords = words.length;
        
        // Reset wszystkich słów
        words.forEach(word => {
            word.classList.remove('highlight', 'fade');
        });

        // Losowo wybierz słowa do podświetlenia (10-15%)
        const highlightCount = Math.floor(totalWords * (0.1 + Math.random() * 0.05));
        for (let i = 0; i < highlightCount; i++) {
            const randomIndex = Math.floor(Math.random() * totalWords);
            words[randomIndex].classList.add('highlight');
        }

        // Losowo wybierz słowa do zaniknięcia (5-8%)
        const fadeCount = Math.floor(totalWords * (0.05 + Math.random() * 0.03));
        for (let i = 0; i < fadeCount; i++) {
            const randomIndex = Math.floor(Math.random() * totalWords);
            words[randomIndex].classList.add('fade');
        }
    }

    startGlitchEffects() {
        // Glitche co 2-4 sekundy
        this.glitchInterval = setInterval(() => {
            if (this.isActive && Math.random() < 0.7) {
                this.createGlitch();
            }
        }, 2000 + Math.random() * 2000);
    }

    createGlitch() {
        const glitch = document.createElement('div');
        glitch.className = 'tools-glitch';
        
        // Losowa ilość elementów glitch (2-4)
        const glitchCount = 2 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < glitchCount; i++) {
            if (Math.random() < 0.6) {
                // Linia glitch
                const line = document.createElement('div');
                line.className = 'glitch-line';
                line.style.cssText = `
                    top: ${Math.random() * 100}%;
                    left: 0;
                    width: 100%;
                    height: ${1 + Math.random() * 2}px;
                `;
                glitch.appendChild(line);
            } else {
                // Blok glitch
                const block = document.createElement('div');
                block.className = 'glitch-block';
                const size = 20 + Math.random() * 80;
                block.style.cssText = `
                    top: ${Math.random() * 100}%;
                    left: ${Math.random() * 100}%;
                    width: ${size}px;
                    height: ${size * 0.3}px;
                `;
                glitch.appendChild(block);
            }
        }
        
        this.background.appendChild(glitch);
        
        // Usuń glitch po animacji
        setTimeout(() => {
            if (glitch.parentNode) {
                glitch.parentNode.removeChild(glitch);
            }
        }, 500);
    }

    destroy() {
        this.isActive = false;
        
        if (this.effectsInterval) {
            clearInterval(this.effectsInterval);
        }
        
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
        }
        
        // Usuń wszystkie elementy glitch
        const glitches = this.background.querySelectorAll('.tools-glitch');
        glitches.forEach(glitch => {
            if (glitch.parentNode) {
                glitch.parentNode.removeChild(glitch);
            }
        });
    }
}

// Inicjalizacja i zarządzanie stanem
let currentToolsSlide = null;

function initializeToolsSlide() {
    // Zniszcz istniejącą instancję
    if (currentToolsSlide) {
        currentToolsSlide.destroy();
    }
    
    // Stwórz nową
    currentToolsSlide = new ToolsSlide();
    currentToolsSlide.init();
}

// Start gdy DOM jest gotowy
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeToolsSlide);
} else {
    initializeToolsSlide();
}

// Obserwuj zmiany aktywności slajdu
const toolsSlideElement = document.querySelector('.slide.tools');
if (toolsSlideElement) {
    const slideObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isActive = toolsSlideElement.classList.contains('active');
                
                if (isActive && currentToolsSlide) {
                    // Slajd stał się aktywny - zainicjuj
                    setTimeout(initializeToolsSlide, 100);
                } else if (!isActive && currentToolsSlide) {
                    // Slajd stał się nieaktywny - zniszcz
                    currentToolsSlide.destroy();
                }
            }
        });
    });
    
    slideObserver.observe(toolsSlideElement, { attributes: true });
}