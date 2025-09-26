class Dashboard {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.contentArea = document.getElementById('contentArea');
        this.pageTitle = document.getElementById('pageTitle');

        this.init();
    }

    init() {
        this.bindEvents();
        this.setActiveContent('dashboard', 'Narzędzia');
        this.adjustLayout();
    }

    bindEvents() {
        // Wyszukiwanie w menu
        const menuSearch = document.getElementById('menuSearch');
        if (menuSearch) {
            menuSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
                    const text = item.innerText.toLowerCase();
                    const match = text.includes(query);

                    // Pokaż/ukryj całe menu-item
                    item.style.display = match ? '' : 'none';

                    // Jeśli wyszukiwanie aktywne, automatycznie rozwiń podmenu
                    if (query && item.querySelector('.submenu')) {
                        const submenu = item.querySelector('.submenu');
                        const header = item.querySelector('.menu-header');
                        item.classList.add('expanded');
                        submenu.classList.add('expanded');
                        if (header) header.classList.add('active');
                    } else if (!query) {
                        // Przy pustym wyszukiwaniu przywróć domyślne zamknięcie
                        const submenu = item.querySelector('.submenu');
                        const header = item.querySelector('.menu-header');
                        if (submenu && header) {
                            item.classList.remove('expanded');
                            submenu.classList.remove('expanded');
                            header.classList.remove('active');
                        }
                    }
                });
            });
        }

        // Tile clicks (dashboard grid)
        const tiles = document.querySelectorAll('#dashboardGrid .tile');
        tiles.forEach(tile => {
            tile.addEventListener('click', () => {
                const title = tile.dataset.title;
                if (!title) return;

                // Zamiana tytułu na contentId (np. "Generator kodu QR" -> "generator-qr-content")
                const contentId = title.toLowerCase().replace(/\s+/g, '-');
                this.setActiveContent(contentId, title);
            });
        });

        // Sidebar toggle
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Menu item clicks
        document.querySelectorAll('.menu-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const menuItem = e.currentTarget.closest('.menu-item');

                if (!menuItem) return;

                if (menuItem.classList.contains('single-item')) {
                    const contentId = e.currentTarget.getAttribute('data-content');
                    const title = e.currentTarget.getAttribute('data-title') || contentId;
                    if (contentId) {
                        this.setActiveContent(contentId, title);
                    }
                } else {
                    this.toggleSubmenu(menuItem);
                }
            });
        });

        // Submenu item clicks
        document.querySelectorAll('.submenu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const contentId = e.currentTarget.getAttribute('data-content');
                const title = e.currentTarget.getAttribute('data-title') || contentId;
                if (contentId) {
                    this.setActiveContent(contentId, title);

                    // Update active states
                    document.querySelectorAll('.submenu-item').forEach(i => i.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            });
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleSidebar() {
        if (!this.sidebar || !this.sidebarToggle || !this.contentArea) return;

        this.sidebar.classList.toggle('collapsed');
        this.sidebarToggle.classList.toggle('collapsed');

        this.adjustLayout();
    }

    adjustLayout() {
        if (!this.sidebar || !this.sidebarToggle || !this.contentArea) return;

        const isCollapsed = this.sidebar.classList.contains('collapsed');
        const isMobile = window.innerWidth <= 768;
        const sidebarWidth = isMobile ? 280 : 220;

        if (isCollapsed) {
            this.sidebarToggle.style.left = '0';

            // ✅ Na mobile nie zmieniamy szerokości contentArea
            if (!isMobile) {
                this.contentArea.style.width = '100%';
                this.contentArea.style.marginLeft = '0';
            }
        } else {
            this.sidebarToggle.style.left = `${sidebarWidth}px`;

            // ✅ Na mobile nie zmieniamy szerokości contentArea
            if (!isMobile) {
                this.contentArea.style.width = `calc(100% - ${sidebarWidth}px)`;
                this.contentArea.style.marginLeft = '0';
            }
        }
    }


    toggleSubmenu(menuItem) {
        if (!menuItem) return;

        const submenu = menuItem.querySelector('.submenu');
        const arrow = menuItem.querySelector('.arrow');
        const menuHeader = menuItem.querySelector('.menu-header');

        if (!submenu || !menuHeader) return;

        const isExpanded = menuItem.classList.contains('expanded');

        // Close all other submenus
        document.querySelectorAll('.menu-item').forEach(item => {
            if (item !== menuItem) {
                const otherSubmenu = item.querySelector('.submenu');
                const otherHeader = item.querySelector('.menu-header');

                if (otherSubmenu && otherHeader) {
                    item.classList.remove('expanded');
                    otherSubmenu.classList.remove('expanded');
                    otherHeader.classList.remove('active');
                }
            }
        });

        // Toggle current submenu
        if (isExpanded) {
            menuItem.classList.remove('expanded');
            submenu.classList.remove('expanded');
            menuHeader.classList.remove('active');
        } else {
            menuItem.classList.add('expanded');
            submenu.classList.add('expanded');
            menuHeader.classList.add('active');
        }
    }

    setActiveContent(contentId, title = null) {
        if (!contentId) return;

        // Hide all content items
        document.querySelectorAll('.content-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected content
        const activeContent = document.getElementById(`${contentId}-content`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Update page title
        this.updatePageTitle(title || this.getTitleFromContentId(contentId));

        // Auto-close sidebar on mobile after selection
        if (window.innerWidth <= 768 && this.sidebar && !this.sidebar.classList.contains('collapsed')) {
            this.toggleSidebar();
        }
    }

    updatePageTitle(title) {
        if (this.pageTitle && title) {
            this.pageTitle.style.opacity = '0';
            setTimeout(() => {
                this.pageTitle.textContent = title;
                this.pageTitle.style.opacity = '1';
            }, 150);
        }
    }

    getTitleFromContentId(contentId) {
        const titleMap = {
            'dashboard': 'Dashboard',
            'overview': 'Przegląd Dashboardu',
            'analytics': 'Analityka',
            'user-list': 'Lista Użytkowników',
            'user-roles': 'Role Użytkowników',
            'user-permissions': 'Uprawnienia',
            'general': 'Ustawienia Ogólne',
            'security': 'Ustawienia Bezpieczeństwa',
            'notifications': 'Powiadomienia',
            'profile': 'Profil Użytkownika',
            'help': 'Centrum Pomocy'
        };

        return titleMap[contentId] || 'Narzędzia';
    }

    handleResize() {
        const sidebar = document.getElementById('sidebar');
        const contentArea = document.getElementById('contentArea');
        const sidebarToggle = document.getElementById('sidebarToggle');

        if (!sidebar || !contentArea || !sidebarToggle) return;

        if (window.innerWidth <= 768) {
            // Mobile - sidebar zawsze schowany na start
            if (!sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                sidebarToggle.classList.add('collapsed');
            }
            contentArea.style.width = '100%';
            contentArea.style.marginLeft = '0';
            sidebarToggle.style.left = '0';
        } else {
            // Desktop - przywróć stan
            this.adjustLayout();
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();

    // Ustaw początkowy stan na mobile
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const contentArea = document.getElementById('contentArea');

        if (sidebar && sidebarToggle && contentArea) {
            sidebar.classList.add('collapsed');
            sidebarToggle.classList.add('collapsed');
            contentArea.style.width = '100%';
            sidebarToggle.style.left = '0';
        }
    }
});

// Fallback for DOM elements
document.addEventListener('DOMContentLoaded', () => {
    const requiredElements = ['sidebar', 'sidebarToggle', 'contentArea', 'pageTitle'];

    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            console.warn(`Element with id '${id}' not found`);
        }
    });
});