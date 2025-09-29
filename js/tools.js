class Dashboard {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.contentArea = document.getElementById('contentArea');

        this.init();
    }

    init() {
        this.bindEvents();
        this.setActiveContent('dashboard', 'Narzędzia');
        this.adjustLayout();
    }

    bindEvents() {
        const menuSearch = document.getElementById('menuSearch');
        if (menuSearch) {
            menuSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
                    const text = item.innerText.toLowerCase();
                    const match = text.includes(query);

                    item.style.display = match ? '' : 'none';

                    if (query && item.querySelector('.submenu')) {
                        const submenu = item.querySelector('.submenu');
                        const header = item.querySelector('.menu-header');
                        item.classList.add('expanded');
                        submenu.classList.add('expanded');
                        if (header) header.classList.add('active');
                    } else if (!query) {
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

        const tiles = document.querySelectorAll('#dashboardGrid .tile');
        tiles.forEach(tile => {
            tile.addEventListener('click', () => {
                const title = tile.dataset.title;
                if (!title) return;

                const contentId = title.toLowerCase().replace(/\s+/g, '-');
                this.setActiveContent(contentId, title);
            });
        });

        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

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

        document.querySelectorAll('.submenu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const contentId = e.currentTarget.getAttribute('data-content');
                const title = e.currentTarget.getAttribute('data-title') || contentId;
                if (contentId) {
                    this.setActiveContent(contentId, title);

                    document.querySelectorAll('.submenu-item').forEach(i => i.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            });
        });

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
            if (!isMobile) {
                this.contentArea.style.width = '100%';
                this.contentArea.style.marginLeft = '0';
            }
            if (isMobile) {
                this.sidebarToggle.style.left = '280px !important';
            }
        } else {
            this.sidebarToggle.style.left = isMobile ? '280px' : `${sidebarWidth}px`;

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

    setActiveContent(contentId) {
        if (!contentId) return;

        document.querySelectorAll('.content-item').forEach(item => item.classList.remove('active'));

        const activeContent = document.getElementById(`${contentId}-content`);
        if (activeContent) {
            activeContent.classList.add('active');

            const onAnimationEnd = () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'auto'
                });
                if (this.contentArea) this.contentArea.scrollTop = 0;

                activeContent.removeEventListener('animationend', onAnimationEnd);
            };

            activeContent.addEventListener('animationend', onAnimationEnd);
        }

        if (window.innerWidth <= 768 && this.sidebar && !this.sidebar.classList.contains('collapsed')) {
            this.toggleSidebar();
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
            if (!sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                sidebarToggle.classList.add('collapsed');
            }
            contentArea.style.width = '100%';
            contentArea.style.marginLeft = '0';
            sidebarToggle.style.left = '280px';
        } else {
            sidebarToggle.style.left = '220px';
            this.adjustLayout();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();

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

document.addEventListener('DOMContentLoaded', () => {
    const requiredElements = ['sidebar', 'sidebarToggle', 'contentArea'];

    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            console.warn(`Element with id '${id}' not found`);
        }
    });
});

document.querySelectorAll('.back-to-dashboard').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.content-item').forEach(c => c.classList.remove('active'));
        const dashboard = document.getElementById('dashboard-content');
        if (dashboard) dashboard.classList.add('active');
        dashboard.scrollIntoView({
            behavior: 'smooth'
        });
    });
});