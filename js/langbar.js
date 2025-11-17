class LangBar {
    constructor(options = {}) {
        this.containerSelector = options.containerSelector || '.langbar';
        this.dataPath = options.dataPath || 'assets/data';
        this.defaultLang = options.defaultLang || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'pl');
        this.lang = localStorage.getItem('site_lang') || this.defaultLang;
        this.translations = {};
        this.buttons = [];
    }

    async init() {
        await this.loadTranslations();
        this.findButtons();
        this.updateButtonsUI();
        this.applyTranslations();
        this.bindEvents();
    }

    async loadTranslations() {
        const langs = ['pl', 'en'];
        for (const l of langs) {
            try {
                const res = await fetch(`${this.dataPath}/lang_${l}.json`);
                if (!res.ok) throw new Error('Failed to load ' + l);
                this.translations[l] = await res.json();
            } catch (e) {
                console.warn('LangBar:', e);
                this.translations[l] = {};
            }
        }
    }

    findButtons() {
        const container = document.querySelector(this.containerSelector);
        if (!container) return;
        this.buttons = Array.from(container.querySelectorAll('button[data-lang]'));
    }

    bindEvents() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLang(lang);
            });
        });
    }

    setLang(lang) {
        if (!this.translations[lang]) return;
        this.lang = lang;
        localStorage.setItem('site_lang', lang);
        this.updateButtonsUI();
        this.applyTranslations();
        this.updateCvLinks();
        document.documentElement.lang = lang === 'en' ? 'en' : 'pl';
    }

    updateButtonsUI() {
        this.buttons.forEach(btn => {
            if (btn.getAttribute('data-lang') === this.lang) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    applyTranslations() {
        const map = this.translations[this.lang] || {};
        // elements with data-i18n replace innerHTML
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;
            if (map.hasOwnProperty(key)) el.innerHTML = map[key];
        });
        // elements with data-i18n-attr allow attribute translations, e.g. data-i18n-attr="title:nav.home"
        document.querySelectorAll('[data-i18n-attr]').forEach(el => {
            const raw = el.getAttribute('data-i18n-attr');
            // format: "attr:key;attr2:key2"
            raw.split(';').forEach(pair => {
                const [attr, key] = pair.split(':').map(s => s && s.trim());
                if (attr && key && map.hasOwnProperty(key)) el.setAttribute(attr, map[key]);
            });
        });
        // Update CV download links if present
        this.updateCvLinks();
    }

    updateCvLinks() {
        // Map language code to CV filename
        const mapping = {
            pl: 'downloads/pl_Wiktor Gołąb CV.pdf',
            en: 'downloads/en_Wiktor Gołąb CV.pdf'
        };
        const href = mapping[this.lang] || mapping.pl;
        document.querySelectorAll('[data-cv-toggle]').forEach(a => {
            try {
                a.setAttribute('href', href);
                // Ensure download attribute remains
                a.setAttribute('download', '');
            } catch (e) {
                // ignore
            }
        });
    }
}

// auto-init
document.addEventListener('DOMContentLoaded', () => {
    const lb = new LangBar();
    lb.init().catch(err => console.error('LangBar init error', err));
});
