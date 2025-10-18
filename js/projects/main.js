let currentSort = "newest"; // Domyślnie najnowsze

// Inicjalizacja strony po załadowaniu
document.addEventListener('DOMContentLoaded', function () {
    initProjectsPage();
    initCompanyClickHandlers();
    checkHashOnLoad();
});

async function initProjectsPage() {
    renderCategories();
    renderSortOptions();
    await loadAllProjects();
    renderProjects();

    // Obsługa wyszukiwania
    document.getElementById('searchInput').addEventListener('input', function (e) {
        currentSearch = e.target.value.toLowerCase();
        renderProjects();
        setTimeout(initScrollShadows, 50);
    });

    // Obsługa sortowania
    document.getElementById('sortSelect').addEventListener('change', function (e) {
        currentSort = e.target.value;
        renderProjects();
        setTimeout(initScrollShadows, 50);
    });

    // Inicjalizacja cieni
    initScrollShadows();
}

// FUNKCJE DO KLIKALNEGO M3 GROUP
function initCompanyClickHandlers() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('clickable-company')) {
            e.preventDefault();
            const projectId = e.target.getAttribute('data-project-id');
            openCompanyProject(projectId);
        }
    });
}

function openCompanyProject(projectId) {
    if (window.location.pathname.includes('projects.html')) {
        openProjectModalById(projectId);
    } else {
        window.location.href = 'projects.html#project-' + projectId;
    }
}

function openProjectModalById(projectId) {
    if (typeof allProjects !== 'undefined' && allProjects.length > 0) {
        const project = allProjects.find(p => p.id == projectId);
        if (project) {
            openProjectModal(project);
            history.replaceState(null, null, ' ');
        } else {
            console.warn('Project not found:', projectId);
        }
    } else {
        setTimeout(() => openProjectModalById(projectId), 100);
    }
}

function checkHashOnLoad() {
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash.startsWith('project-')) {
            const projectId = hash.replace('project-', '');
            setTimeout(() => openProjectModalById(projectId), 800);
        }
    }
}

window.addEventListener('hashchange', function() {
    checkHashOnLoad();
});

// POZOSTAŁE FUNKCJE BEZ ZMIAN
function renderSortOptions() {
    const filtersContainer = document.querySelector('.filters-container');
    
    if (!document.getElementById('sortSelect')) {
        const sortContainer = document.createElement('div');
        sortContainer.className = 'sort-container';
        
        sortContainer.innerHTML = `
            <label for="sortSelect" style="color: rgba(255,255,255,0.8); font-size: 0.9rem; white-space: nowrap;">Sortuj:</label>
            <select id="sortSelect" class="sort-select">
                <option value="newest">Najnowsze</option>
                <option value="alphabetical">Alfabetycznie</option>
            </select>
        `;
        
        filtersContainer.appendChild(sortContainer);
    }
    
    document.getElementById('sortSelect').value = currentSort;
}

function renderCategories() {
    const categoriesContainer = document.getElementById('categories');
    categoriesContainer.innerHTML = '';

    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = `category-btn ${category.id === currentCategory ? 'active' : ''}`;
        button.textContent = category.name;
        button.dataset.category = category.id;
        button.addEventListener('click', () => {
            currentCategory = category.id;
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderProjects();
            setTimeout(initScrollShadows, 50);
        });

        categoriesContainer.appendChild(button);
    });
}

async function loadAllProjects() {
    try {
        const BATCH_SIZE = 10;
        const MAX_PROJECTS = 100;
        let allProjectPromises = [];
        
        for (let batchStart = 1; batchStart <= MAX_PROJECTS; batchStart += BATCH_SIZE) {
            const batchPromises = [];
            
            for (let i = batchStart; i < batchStart + BATCH_SIZE; i++) {
                const projectPromise = fetch(`assets/data/projects/project-${i}.json`)
                    .then(response => {
                        if (!response.ok) return { exists: false };
                        return response.json().then(data => ({ exists: true, data }));
                    })
                    .catch(() => ({ exists: false }));
                
                batchPromises.push(projectPromise);
            }
            
            const batchResults = await Promise.all(batchPromises);
            const existingProjects = batchResults
                .filter(result => result.exists)
                .map(result => result.data);
            
            allProjectPromises = allProjectPromises.concat(existingProjects);
            
            if (existingProjects.length === 0) {
                break;
            }
        }

        allProjects = allProjectPromises
            .filter(project => project.showcase !== false);

        console.log(`Załadowano ${allProjects.length} projektów`);

    } catch (error) {
        console.error('Błąd podczas ładowania projektów:', error);
        allProjects = [];
    }
}

function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');

    let filteredProjects = allProjects.filter(project => {
        if (currentCategory !== 'all') {
            const projectCategories = Array.isArray(project.category) 
                ? project.category 
                : [project.category];
            
            if (!projectCategories.includes(currentCategory)) {
                return false;
            }
        }

        if (currentSearch) {
            const searchTerm = currentSearch.toLowerCase();
            return (
                project.title.toLowerCase().includes(searchTerm) ||
                project.description.toLowerCase().includes(searchTerm) ||
                (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        return true;
    });

    sortProjects(filteredProjects);

    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = '<div class="no-projects">Brak projektów spełniających kryteria wyszukiwania.</div>';
    } else {
        projectsGrid.innerHTML = '';
        filteredProjects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });
    }
}

function sortProjects(projects) {
    switch (currentSort) {
        case 'alphabetical':
            projects.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'newest':
            projects.sort((a, b) => (b.id || 0) - (a.id || 0));
            break;
        default:
            projects.sort((a, b) => a.title.localeCompare(b.title));
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.addEventListener('click', () => openProjectModal(project));

    const imageSrc = project.image || 'assets/img/projects/default.png';

    const projectCategories = Array.isArray(project.category) 
        ? project.category 
        : [project.category];
    const categoryNames = projectCategories.map(catId => getCategoryName(catId)).join(', ');

    let formattedDate = '';
    if (project.completionDate) {
        const dateParts = project.completionDate.split('-');
        if (dateParts.length === 3) {
            if (dateParts[0].length === 4) {
                formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            } else if (dateParts[2].length === 4) {
                formattedDate = project.completionDate;
            }
        } else {
            formattedDate = project.completionDate;
        }
    }

    card.innerHTML = `
        <img src="${imageSrc}" alt="${project.title}" class="project-image" onerror="this.src='assets/img/projects/default.png'">
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-categories">
                ${categoryNames ? `<span class="project-category-badge">${categoryNames}</span>` : ''}
            </div>
            ${project.tags ? `
            <div class="project-tags" style="flex: 1; min-height: 0; overflow: hidden;">
                ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>
            ` : '<div style="flex: 1;"></div>'}
            <div class="project-links">
                ${project.demoLink ? `<a href="${project.demoLink}" target="_blank" class="project-link" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i> Strona</a>` : ''}
                ${project.codeLink ? `<a href="${project.codeLink}" target="_blank" class="project-link" onclick="event.stopPropagation()"><i class="fab fa-github"></i> Kod</a>` : ''}
                ${!project.demoLink && !project.codeLink ? `<span class="project-link" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);"><i class="fas fa-lock"></i> Prywatny</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const dateParts = dateString.split('-');
    if (dateParts.length === 3) {
        if (dateParts[0].length === 4) {
            return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        } else if (dateParts[2].length === 4) {
            return dateString;
        }
    }
    return dateString;
}

function initScrollShadows() {
    const projectsSection = document.querySelector('.projects-section');
    if (!projectsSection) {
        console.log('Projects section not found');
        return;
    }
    
    function updateShadows() {
        const { scrollTop, scrollHeight, clientHeight } = projectsSection;
        const isScrolled = scrollTop > 10;
        const canScrollDown = scrollTop + clientHeight < scrollHeight - 10;
        
        projectsSection.classList.toggle('has-top-shadow', isScrolled);
        projectsSection.classList.toggle('has-bottom-shadow', canScrollDown);
    }
    
    setTimeout(updateShadows, 100);
    
    projectsSection.addEventListener('scroll', updateShadows);
    window.addEventListener('resize', updateShadows);
}