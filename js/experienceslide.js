class ExperienceSlide {
    constructor() {
        this.root = document.querySelector('.slide.experience');
        if (!this.root) return;

        this.track = this.root.querySelector('[data-exp-track]');
        this.viewport = this.root.querySelector('[data-exp-viewport]');
        this.nodes = Array.from(this.root.querySelectorAll('.exp-node'));
        this.panels = Array.from(this.root.querySelectorAll('[data-exp-panel]'));

        this.activeIndex = 0;
        this.trackX = 0;
        this.init();
    }

    init() {
        if (!this.track || this.nodes.length === 0 || this.panels.length === 0) return;

        this.nodes.forEach((node) => {
            node.addEventListener('click', () => {
                const index = Number(node.dataset.expIndex);
                if (Number.isFinite(index)) this.setActive(index, { focus: true, center: true });
            });
        });

        this.track.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                this.setActive(this.activeIndex - 1, { focus: true, center: true });
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                this.setActive(this.activeIndex + 1, { focus: true, center: true });
            }
            if (event.key === 'Home') {
                event.preventDefault();
                this.setActive(0, { focus: true, center: true });
            }
            if (event.key === 'End') {
                event.preventDefault();
                this.setActive(this.nodes.length - 1, { focus: true, center: true });
            }
        });

        // Keep the active circle centered on resize
        window.addEventListener('resize', () => {
            window.requestAnimationFrame(() => this.centerActive({ animate: false }));
        });

        // Re-center after language change (translations can change widths)
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            const langButton = target.closest('button[data-lang]');
            if (!langButton) return;
            setTimeout(() => this.centerActive({ animate: false }), 0);
        });

        this.setActive(0, { focus: false, center: false });
        this.centerActive({ animate: false });
    }

    setActive(index, { focus, center } = { focus: false, center: false }) {
        const nextIndex = Math.max(0, Math.min(index, this.nodes.length - 1));
        this.activeIndex = nextIndex;

        this.nodes.forEach((node, i) => {
            const isActive = i === nextIndex;
            node.classList.toggle('is-active', isActive);
            node.setAttribute('aria-selected', isActive ? 'true' : 'false');
            node.tabIndex = isActive ? 0 : -1;
        });

        this.panels.forEach((panel) => {
            const panelIndex = Number(panel.dataset.expPanel);
            const isActive = panelIndex === nextIndex;
            panel.classList.toggle('is-active', isActive);
            panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        const activeNode = this.nodes[nextIndex];
        if (center) this.centerActive({ animate: true });
        if (focus && activeNode) {
            activeNode.focus({ preventScroll: true });
        }
    }

    centerActive({ animate }) {
        if (!this.viewport || !this.track) return;
        const activeNode = this.nodes[this.activeIndex];
        if (!activeNode) return;

        // Temporarily disable animation if requested
        const previousTransition = this.track.style.transition;
        if (!animate) this.track.style.transition = 'none';

        const viewportRect = this.viewport.getBoundingClientRect();
        const nodeRect = activeNode.getBoundingClientRect();

        const viewportCenterX = viewportRect.left + viewportRect.width / 2;
        const nodeCenterX = nodeRect.left + nodeRect.width / 2;
        const delta = viewportCenterX - nodeCenterX;

        let nextX = this.trackX + delta;

        // Clamp so we don't show empty space outside the track
        const trackWidth = this.track.scrollWidth;
        const viewportWidth = this.viewport.clientWidth;
        const minX = Math.min(0, viewportWidth - trackWidth);
        const maxX = 0;
        nextX = Math.max(minX, Math.min(maxX, nextX));

        this.trackX = nextX;
        this.track.style.transform = `translate3d(${this.trackX}px, 0, 0)`;

        if (!animate) {
            // Restore transition on next frame to avoid a visible jump later
            window.requestAnimationFrame(() => {
                this.track.style.transition = previousTransition;
            });
        }
    }
}

new ExperienceSlide();
