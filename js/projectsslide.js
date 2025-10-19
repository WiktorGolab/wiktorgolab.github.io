// projects-carousel.js
let latestProjects = [];
let currentSlide = 0;

// Inicjalizacja karuzeli po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded - initializing carousel');
    initProjectsCarousel();
});

async function initProjectsCarousel() {
    console.log('Initializing projects carousel');
    await loadLatestProjects();
    await preloadCarouselImages(); // Dodaj preload dla lepszej płynności
    renderProjectsSlides();
    initCarouselEvents();
    updateCarousel();
}

// Funkcja do preloadu obrazów
async function preloadCarouselImages() {
    if (latestProjects.length === 0) return;
    
    const preloadPromises = latestProjects.map(project => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = project.image || 'assets/img/projects/default.png';
            img.onload = resolve;
            img.onerror = resolve;
        });
    });
    
    await Promise.all(preloadPromises);
    console.log('Carousel background images preloaded');
}

async function loadLatestProjects() {
    try {
        console.log('Loading latest projects...');

        // Spróbuj użyć istniejących projektów
        if (typeof allProjects !== 'undefined' && allProjects.length > 0) {
            console.log('Using existing allProjects');
            latestProjects = allProjects
                .filter(project => project.showcase !== false)
                .sort((a, b) => (b.id || 0) - (a.id || 0))
                .slice(0, 3);
        } else {
            console.log('Loading projects directly');
            latestProjects = await loadProjectsDirectly();
        }

        console.log(`Loaded ${latestProjects.length} projects for carousel:`, latestProjects.map(p => p.title));

        // Aktualizuj licznik slajdów
        const totalSlidesElement = document.querySelector('.total-slides');
        if (totalSlidesElement) {
            totalSlidesElement.textContent = latestProjects.length;
        }

    } catch (error) {
        console.error('Error loading projects for carousel:', error);
        latestProjects = [];
    }
}

async function loadProjectsDirectly() {
    const projects = [];
    try {
        for (let i = 1; i <= 20; i++) {
            try {
                const response = await fetch(`assets/data/projects/project-${i}.json`);
                if (response.ok) {
                    const project = await response.json();
                    if (project.showcase !== false) {
                        projects.push(project);
                    }
                }
            } catch (e) {
                continue;
            }
        }
        return projects.sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 3);
    } catch (error) {
        return [];
    }
}

function renderProjectsSlides() {
    const carouselTrack = document.querySelector('.carousel-track');

    if (!carouselTrack) {
        console.error('Carousel track not found');
        return;
    }

    if (latestProjects.length === 0) {
        carouselTrack.innerHTML = `
            <div class="carousel-slide active">
                <div class="no-projects-message">
                    <h2>Brak projektów do wyświetlenia</h2>
                    <p>Nie udało się załadować projektów.</p>
                </div>
            </div>
        `;
        return;
    }

    carouselTrack.innerHTML = latestProjects.map((project, index) => `
        <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <div class="project-content-wrapper">
                <div class="project-image-section project-details-btn" data-project-id="${project.id}">
                    <div class="project-image-topbar">
                        <div class="project-window-controls">
                            <span class="project-window-dot red"></span>
                            <span class="project-window-dot yellow"></span>
                            <span class="project-window-dot green"></span>
                        </div>
                        <div class="project-window-searchbar"></div>
                    </div>
                    <img src="${project.image || 'assets/img/projects/default.png'}" 
                        alt="${project.title}" 
                        class="project-image"
                        onerror="this.src='assets/img/projects/default.png'">
                    ${index === 0 ? '<div class="project-badge">Najnowsze</div>' : ''}
                </div>
                
                <div class="project-info-section">
                    <div class="project-meta">
                        <span class="project-date">${formatCarouselDate(project.completionDate)}</span>
                        <span class="project-technologies">
                            ${project.tags ? project.tags.slice(0, 3).join(', ') : ''}
                        </span>
                    </div>
                    
                    <h2 class="project-title">${project.title}</h2>
                    <p class="project-description">${project.description}</p>
                    
                    <div class="project-features">
                        ${project.features ? `
                            <h4>Kluczowe funkcje:</h4>
                            <ul>
                                ${project.features.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                    
                    <div class="project-actions">
                        <button class="project-details-btn" data-project-id="${project.id}">
                            Zobacz więcej informacji
                        </button>
                        
                        <!-- Kontrolki karuzeli dodane tutaj -->
                        <div class="carousel-controls">
                            <button class="carousel-btn prev-btn">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span class="carousel-counter">
                                <span class="current-slide">${index + 1}</span> / <span class="total-slides">${latestProjects.length}</span>
                            </span>
                            <button class="carousel-btn next-btn">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    console.log('Projects slides rendered successfully with controls inside track');
}

function initCarouselEvents() {
    console.log('Initializing carousel events');

    // Event delegation dla dynamicznych elementów
    document.addEventListener('click', function (e) {
        // Przyciski nawigacji - teraz wewnątrz tracku
        if (e.target.closest('.next-btn') || e.target.classList.contains('fa-chevron-right')) {
            console.log('Next button clicked');
            nextSlide();
        }

        if (e.target.closest('.prev-btn') || e.target.classList.contains('fa-chevron-left')) {
            console.log('Prev button clicked');
            prevSlide();
        }

        // Kropki
        if (e.target.classList.contains('dot')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            console.log('Dot clicked, index:', index);
            goToSlide(index);
        }

        // Przyciski szczegółów projektu
        if (e.target.classList.contains('project-details-btn')) {
            const projectId = e.target.getAttribute('data-project-id');
            console.log('Details button clicked, projectId:', projectId);
            openProjectModalById(projectId);
        }
    });

    // Obsługa klawiatury
    document.addEventListener('keydown', function (e) {
        const carousel = document.querySelector('.projects-carousel');
        if (!carousel) return;

        if (e.key === 'ArrowLeft') {
            console.log('Left arrow pressed');
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            console.log('Right arrow pressed');
            nextSlide();
        }
    });

    console.log('Carousel events initialized');
}

function updateCarousel() {
    console.log('Updating carousel to slide:', currentSlide);

    const slides = document.querySelectorAll('.carousel-slide');
    const currentSlideElement = document.querySelector('.current-slide');
    const totalSlidesElement = document.querySelector('.total-slides');

    console.log('Found slides:', slides.length);

    if (slides.length === 0) {
        console.log('No slides found');
        return;
    }

    // Ukryj wszystkie slajdy
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Pokaż aktualny slajd
    if (slides[currentSlide]) {
        slides[currentSlide].classList.add('active');
        console.log('Activated slide:', currentSlide);
        
        // Ustaw tło na obraz aktualnego projektu z płynnym przejściem
        if (latestProjects[currentSlide]) {
            setBackgroundWithTransition(latestProjects[currentSlide]);
        }
    }

    // Zaktualizuj licznik we wszystkich kontrolkach
    const allCurrentSlideElements = document.querySelectorAll('.current-slide');
    const allTotalSlidesElements = document.querySelectorAll('.total-slides');

    allCurrentSlideElements.forEach(element => {
        element.textContent = currentSlide + 1;
    });

    allTotalSlidesElements.forEach(element => {
        element.textContent = latestProjects.length;
    });

    console.log('Updated counter to:', currentSlide + 1);
}

function setBackgroundWithTransition(project) {
    const imageUrl = project.image || 'assets/img/projects/default.png';
    const backgroundElement = document.querySelector('.carousel-background');
    
    if (!backgroundElement) {
        console.error('Background element not found');
        return;
    }

    // Rozpocznij animację wyjścia
    backgroundElement.classList.remove('loaded');
    
    // Czekamy na zakończenie animacji wyjścia, potem zmieniamy tło
    setTimeout(() => {
        // Ustawiamy nowe tło
        backgroundElement.style.backgroundImage = `url('${imageUrl}')`;
        
        // Uruchamiamy animację wejścia po krótkim opóźnieniu
        setTimeout(() => {
            backgroundElement.classList.add('loaded');
        }, 50);
        
        console.log('Background transition to:', imageUrl);
    }, 400); // Czas odpowiada transition time w CSS
}

// Funkcje nawigacji
function nextSlide() {
    console.log('nextSlide called, currentSlide:', currentSlide, 'total:', latestProjects.length);
    if (latestProjects.length === 0) {
        console.log('No projects available');
        return;
    }

    currentSlide = (currentSlide + 1) % latestProjects.length;
    console.log('new currentSlide:', currentSlide);
    updateCarousel();
}

function prevSlide() {
    console.log('prevSlide called, currentSlide:', currentSlide, 'total:', latestProjects.length);
    if (latestProjects.length === 0) {
        console.log('No projects available');
        return;
    }

    currentSlide = (currentSlide - 1 + latestProjects.length) % latestProjects.length;
    console.log('new currentSlide:', currentSlide);
    updateCarousel();
}

function goToSlide(index) {
    console.log('goToSlide called, index:', index);
    if (latestProjects.length === 0) {
        console.log('No projects available');
        return;
    }

    if (index >= 0 && index < latestProjects.length) {
        currentSlide = index;
        console.log('new currentSlide:', currentSlide);
        updateCarousel();
    }
}

function formatCarouselDate(dateString) {
    if (!dateString) return '';

    const dateParts = dateString.split('-');
    if (dateParts.length === 3) {
        if (dateParts[0].length === 4) {
            return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
        } else if (dateParts[2].length === 4) {
            return `${dateParts[0]}.${dateParts[1]}.${dateParts[2]}`;
        }
    }
    return dateString;
}

// Funkcja pomocnicza do otwierania modala
function openProjectModalById(projectId) {
    console.log('Opening project modal for id:', projectId);
    if (typeof allProjects !== 'undefined' && allProjects.length > 0) {
        const project = allProjects.find(p => p.id == projectId);
        if (project) {
            if (typeof openProjectModal === 'function') {
                openProjectModal(project);
            } else {
                window.location.href = `projects.html#project-${projectId}`;
            }
        } else {
            window.location.href = `projects.html#project-${projectId}`;
        }
    } else {
        window.location.href = `projects.html#project-${projectId}`;
    }
}