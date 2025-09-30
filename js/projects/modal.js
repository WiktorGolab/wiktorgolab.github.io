// Funkcja do otwierania modala z projektem
function openProjectModal(project) {
    // Pobieramy nazwy kategorii dla wyświetlania w modal
    const projectCategories = Array.isArray(project.category) 
        ? project.category 
        : [project.category];
    const categoryNames = projectCategories.map(catId => getCategoryName(catId)).join(', ');

    // Funkcja do bezpiecznego renderowania HTML z tekstu
    const renderHtmlContent = (content) => {
        if (!content) return '';
        
        if (typeof content === 'string') {
            // Jeśli content to string, zwracamy jako HTML
            return content;
        } else if (Array.isArray(content)) {
            // Jeśli content to tablica, łączymy elementy
            return content.map(item => {
                if (typeof item === 'string') {
                    return item;
                } else if (typeof item === 'object' && item.type) {
                    // Obsługa strukturyzowanych bloków
                    switch (item.type) {
                        case 'html':
                            return item.content || '';
                        case 'text':
                            return `<p>${item.content || ''}</p>`;
                        case 'heading':
                            return `<h${item.level || 3}>${item.content || ''}</h${item.level || 3}>`;
                        case 'code':
                            return `<pre><code class="language-${item.language || 'javascript'}">${escapeHtml(item.content || '')}</code></pre>`;
                        case 'image':
                            return `<img src="${item.src || ''}" alt="${item.alt || ''}" class="${item.class || ''}" style="${item.style || ''}">`;
                        case 'custom':
                            return item.html || '';
                        default:
                            return item.content || '';
                    }
                }
                return String(item);
            }).join('');
        }
        return String(content);
    };

    // Funkcja do escape'owania HTML dla bloków kodu
    const escapeHtml = (unsafe) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // Tworzymy modal
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            
            <div class="modal-header">
                <h2 class="modal-title">${project.title}</h2>
                <span class="project-category">${categoryNames}</span>
            </div>

            <div class="modal-body">
                <div class="project-gallery">
                    ${project.demoLink ? `
                    <a href="${project.demoLink}" target="_blank" class="main-image-link">
                        <img src="${project.image || 'assets/img/projects/default.png'}" 
                             alt="${project.title}" 
                             class="main-image"
                             onerror="this.src='assets/img/projects/default.png'">
                    </a>
                    ` : `
                    <img src="${project.image || 'assets/img/projects/default.png'}" 
                         alt="${project.title}" 
                         class="main-image"
                         onerror="this.src='assets/img/projects/default.png'">
                    `}
                    ${project.images && project.images.length > 0 ? `
                    <div class="gallery-thumbnails">
                        ${project.images.map((img, index) => `
                            <img src="${img}" alt="Screen ${index + 1}" class="thumbnail">
                        `).join('')}
                    </div>
                    ` : ''}
                </div>

                <div class="project-details">
                    <div class="project-description-full">
                        <h3>Opis projektu</h3>
                        <div class="description-content">
                            ${renderHtmlContent(project.fullDescription || project.description)}
                        </div>
                    </div>

                    ${project.features && project.features.length > 0 ? `
                    <div class="project-features">
                        <h3>Główne funkcjonalności</h3>
                        <ul>
                            ${project.features.map(feature => `
                                <li>${renderHtmlContent(feature)}</li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${project.technologies && project.technologies.length > 0 ? `
                    <div class="project-technologies">
                        <h3>Technologie</h3>
                        <div class="tech-list">
                            ${project.technologies.map(tech => `
                                <span class="tech-item">
                                    ${tech.name}${tech.version ? ` <span class="tech-version">${tech.version}</span>` : ''}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Opcjonalne dodatkowe sekcje HTML -->
                    ${project.htmlBlocks && project.htmlBlocks.length > 0 ? `
                    <div class="project-html-blocks">
                        ${renderHtmlContent(project.htmlBlocks)}
                    </div>
                    ` : ''}

                    ${project.customSections && project.customSections.length > 0 ? 
                        project.customSections.map(section => `
                            <div class="project-custom-section ${section.class || ''}">
                                ${section.title ? `<h3>${section.title}</h3>` : ''}
                                ${section.content ? renderHtmlContent(section.content) : ''}
                            </div>
                        `).join('') 
                    : ''}

                    <div class="project-meta">
                        <div class="meta-item"><strong>Kategorie:</strong> ${categoryNames}</div>
                        ${project.status ? `<div class="meta-item"><strong>Status:</strong> ${getStatusText(project.status)}</div>` : ''}
                        ${project.completionDate ? `<div class="meta-item"><strong>Data ukończenia:</strong> ${formatDate(project.completionDate)}</div>` : ''}
                        ${project.collaborators && project.collaborators.length > 0 ? `
                        <div class="meta-item">
                            <strong>Współpracownicy:</strong>
                            ${project.collaborators.map(collab => 
                                collab.link ? `<a href="${collab.link}" target="_blank">${collab.name}</a>` : collab.name
                            ).join(', ')}
                        </div>
                        ` : ''}
                    </div>

                    <div class="project-links-modal">
                        ${project.demoLink ? `<a href="${project.demoLink}" target="_blank" class="project-link large"><i class="fas fa-external-link-alt"></i> Zobacz stronę</a>` : ''}
                        ${project.codeLink ? `<a href="${project.codeLink}" target="_blank" class="project-link large"><i class="fab fa-github"></i> Kod źródłowy</a>` : ''}
                        ${project.documentationLink ? `<a href="${project.documentationLink}" target="_blank" class="project-link large"><i class="fas fa-book"></i> Dokumentacja</a>` : ''}
                        ${project.videoLink ? `<a href="${project.videoLink}" target="_blank" class="project-link large"><i class="fas fa-video"></i> Wideo</a>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Dodajemy modal do body
    document.body.appendChild(modal);

    // Obsługa zamknięcia modala
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    const closeModal = () => {
        document.body.removeChild(modal);
        document.body.style.overflow = ''; // Przywracamy scroll
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Zamykanie klawiszem ESC
    const handleEscape = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEscape);

    // Blokujemy scroll na body
    document.body.style.overflow = 'hidden';

    // Usuwamy listener po zamknięciu
    modal._closeHandler = handleEscape;

    // Obsługa miniaturek galerii
    const thumbnails = modal.querySelectorAll('.thumbnail');
    const mainImage = modal.querySelector('.main-image');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            mainImage.src = thumb.src;
        });
    });

    // Inicjalizacja składni kodu (jeśli używasz biblioteki jak Prism.js)
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(modal);
    }
}

// Pozostałe funkcje pomocnicze pozostają bez zmian
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Inne';
}

function getStatusText(status) {
    const statusMap = {
        'completed': 'Ukończony',
        'in-progress': 'W trakcie',
        'planned': 'Planowany',
        'archived': 'Zarchiwizowany'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
}