// projects-carousel.js
let latestProjects = [];
let currentSlide = 0;

// Inicjalizacja karuzeli po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function () {
    initProjectsCarousel();
});

async function initProjectsCarousel() {
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
}

async function loadLatestProjects() {
    try {
        

        // Spróbuj użyć istniejących projektów
        if (typeof allProjects !== 'undefined' && allProjects.length > 0) {
            latestProjects = allProjects
                .filter(project => project.showcase !== false)
                .sort((a, b) => (b.id || 0) - (a.id || 0))
                .slice(0, 3);
        } else {
            latestProjects = await loadProjectsDirectly();
        }
        

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

    
}

function initCarouselEvents() {
    

    // Event delegation dla dynamicznych elementów
    document.addEventListener('click', function (e) {
        const carousel = document.querySelector('.projects-carousel');
        if (!carousel) return;

        // Przyciski nawigacji - reagujemy tylko jeśli kliknięcie jest wewnątrz karuzeli
        if (e.target.closest('.projects-carousel .next-btn') || e.target.closest('.projects-carousel .fa-chevron-right')) {
            nextSlide();
            return;
        }

        if (e.target.closest('.projects-carousel .prev-btn') || e.target.closest('.projects-carousel .fa-chevron-left')) {
            prevSlide();
            return;
        }

        // Kropki (dots) wewnątrz karuzeli
        const dot = e.target.closest('.projects-carousel .dot');
        if (dot) {
            const index = parseInt(dot.getAttribute('data-index'));
            goToSlide(index);
            return;
        }

        // Przyciski szczegółów projektu — obsługujemy tylko te wewnątrz karuzeli
        const detailsBtn = e.target.closest('.projects-carousel .project-details-btn');
        if (detailsBtn) {
            const projectId = detailsBtn.getAttribute('data-project-id');
            openProjectModalById(projectId);
            return;
        }
    });

    // Obsługa klawiatury
    document.addEventListener('keydown', function (e) {
        const carousel = document.querySelector('.projects-carousel');
        if (!carousel) return;

        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });
    
}

function updateCarousel() {
    

    const slides = document.querySelectorAll('.carousel-slide');
    const currentSlideElement = document.querySelector('.current-slide');
    const totalSlidesElement = document.querySelector('.total-slides');

    

    if (slides.length === 0) {
        return;
    }

    // Ukryj wszystkie slajdy
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Pokaż aktualny slajd
    if (slides[currentSlide]) {
        slides[currentSlide].classList.add('active');
        
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
        
        
    }, 400); // Czas odpowiada transition time w CSS
}

// Funkcje nawigacji
function nextSlide() {
    if (latestProjects.length === 0) {
        return;
    }

    currentSlide = (currentSlide + 1) % latestProjects.length;
    updateCarousel();
}

function prevSlide() {
    if (latestProjects.length === 0) {
        return;
    }

    currentSlide = (currentSlide - 1 + latestProjects.length) % latestProjects.length;
    updateCarousel();
}

function goToSlide(index) {
    if (latestProjects.length === 0) {
        return;
    }

    if (index >= 0 && index < latestProjects.length) {
        currentSlide = index;
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