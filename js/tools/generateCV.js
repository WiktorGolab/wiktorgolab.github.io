class CVGenerator {
    constructor() {
        this.currentPreset = 'modern';
        this.cvData = this.getDefaultData();
        this.photoData = null;
        this.scale = 1;
        this.currentPage = 0;
        this.pages = [];
        this.isUpdating = false;
        this.init();
    }

    init() {
        this.setupPresets();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.loadFromLocalStorage();
        this.updateFontSelects();
        this.updateFormStyles();
        this.updatePreview();
    }

    getDefaultData() {
        return {
            personal: {
                firstName: '',
                lastName: '',
                gender: '',
                birthDate: '',
                nationality: '',
                drivingLicense: '',
                email: '',
                phone: '',
                address: '',
                website: '',
                linkedin: '',
                github: '',
                photo: null
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            languages: [],
            certificates: [],
            interests: [],
            projects: [],
            customSections: [],
            style: {
                preset: 'modern',
                primaryColor: '#2563eb',
                secondaryColor: '#64748b',
                backgroundColor: '#ffffff',
                textColor: '#333333',
                fontFamily: 'Aptos, sans-serif',
                headerFont: 'Aptos, sans-serif',
                fontSizes: {
                    headers: {
                        name: '32px',
                        sectionTitle: '20px',
                        itemTitle: '15px'
                    },
                    body: {
                        main: '12.5px',
                        subtitle: '14px',
                        small: '14px'
                    },
                    special: {
                        professionalTitle: '20px'
                    }
                },
                sectionMargins: {
                    summary: '20',
                    experience: '20',
                    education: '20',
                    skills: '20',
                    languages: '20',
                    certificates: '20',
                    interests: '20',
                    projects: '20',
                    custom: '20'
                }
            },
            sectionOrder: [
                'summary',
                'experience',
                'education',
                'skills',
                'languages',
                'certificates',
                'interests',
                'projects',
                'custom'
            ]
        };
    }

    setupPresets() {
        const presets = {
            modern: {
                name: 'Modny',
                colors: {
                    primary: '#000000',
                    secondary: '#000000',
                    background: '#ffffff',
                    text: '#000000'
                },
                fonts: {
                    main: 'Aptos, sans-serif',
                    header: 'Aptos, sans-serif'
                },
                template: 'modern'
            },
            professional: {
                name: 'Profesjonalny',
                colors: {
                    primary: '#045e41',
                    secondary: '#045e41',
                    background: '#ffffff',
                    text: '#1e293b'
                },
                fonts: {
                    main: 'Calibri, sans-serif',
                    header: 'Cambria, serif'
                },
                template: 'professional'
            },
            elegant: {
                name: 'Elegancki',
                colors: {
                    primary: '#7c3aed',
                    secondary: '#5b21b6',
                    background: '#ffffff',
                    text: '#2d3748'
                },
                fonts: {
                    main: 'Georgia, serif',
                    header: 'Playfair, serif'
                },
                template: 'elegant'
            },
            minimal: {
                name: 'Minimalistyczny',
                colors: {
                    primary: '#5a5853',
                    secondary: '#5a5853',
                    background: '#ffffff',
                    text: '#000000'
                },
                fonts: {
                    main: 'Arial, sans-serif',
                    header: 'Cambria, sans-serif'
                },
                template: 'minimal'
            },
            creative: {
                name: 'Kreatywny',
                colors: {
                    primary: '#dc2626',
                    secondary: '#b91c1c',
                    background: '#ffffff',
                    text: '#1e293b'
                },
                fonts: {
                    main: 'Aptos, sans-serif',
                    header: 'Aptos, sans-serif'
                },
                template: 'creative'
            },
            corporate: {
                name: 'Korporacyjny',
                colors: {
                    primary: '#0369a1',
                    secondary: '#0c4a6e',
                    background: '#ffffff',
                    text: '#0f172a'
                },
                fonts: {
                    main: 'Arial, sans-serif',
                    header: 'Arial, sans-serif'
                },
                template: 'corporate'
            },
            warm: {
                name: 'Ciepły',
                colors: {
                    primary: '#ea580c',
                    secondary: '#c2410c',
                    background: '#ffffff',
                    text: '#431407'
                },
                fonts: {
                    main: 'Merriweather, serif',
                    header: 'Merriweather, serif'
                },
                template: 'warm'
            },
            tech: {
                name: 'Technologiczny',
                colors: {
                    primary: '#0f766e',
                    secondary: '#115e59',
                    background: '#ffffff',
                    text: '#134e4a'
                },
                fonts: {
                    main: 'Segoe UI, sans-serif',
                    header: 'Segoe UI, sans-serif'
                },
                template: 'tech'
            }
        };

        const presetGrid = document.querySelector('.preset-grid');
        if (!presetGrid) return;

        presetGrid.innerHTML = '';

        Object.entries(presets).forEach(([key, preset]) => {
            const presetItem = document.createElement('div');
            presetItem.className = `preset-item ${key === this.currentPreset ? 'active' : ''}`;
            presetItem.style.background = `linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.secondary})`;
            presetItem.innerHTML = `<div class="preset-name">${preset.name}</div>`;
            presetItem.addEventListener('click', () => this.selectPreset(key, preset));
            presetGrid.appendChild(presetItem);
        });
    }

    selectPreset(presetKey, preset) {
        this.currentPreset = presetKey;
        this.cvData.style.preset = presetKey;
        this.cvData.style.primaryColor = preset.colors.primary;
        this.cvData.style.secondaryColor = preset.colors.secondary;
        this.cvData.style.backgroundColor = preset.colors.background;
        this.cvData.style.textColor = preset.colors.text;
        this.cvData.style.fontFamily = preset.fonts.main;
        this.cvData.style.headerFont = preset.fonts.header;

        document.querySelectorAll('.preset-item').forEach(item => item.classList.remove('active'));
        event.target.closest('.preset-item').classList.add('active');

        this.updateFormStyles();
        this.updatePreview();
    }

    updateSectionMargin(section, value) {
        if (!this.cvData.style.sectionMargins) {
            this.cvData.style.sectionMargins = this.getDefaultData().style.sectionMargins;
        }
        
        this.cvData.style.sectionMargins[section] = value;
        this.updatePreview();
    }

    updateFormMargins() {
        const margins = this.cvData.style.sectionMargins;
        
        if (!margins) return;

        const marginControls = {
            'summaryMargin': 'summary',
            'experienceMargin': 'experience',
            'educationMargin': 'education',
            'skillsMargin': 'skills',
            'languagesMargin': 'languages',
            'certificatesMargin': 'certificates',
            'interestsMargin': 'interests',
            'projectsMargin': 'projects',
            'customMargin': 'custom'
        };

        Object.entries(marginControls).forEach(([controlId, section]) => {
            const element = document.getElementById(controlId);
            if (element) {
                const currentValue = margins[section] || '20';
                element.value = currentValue;
            }
        });
    }

    updateFontSelects() {
        const fontOptions = [
            'Calibri, sans-serif',
            'Arial, sans-serif',
            'Helvetica, sans-serif',
            'Georgia, serif',
            'Cambria, serif',
            'Merriweather, serif',
            'Segoe UI, sans-serif',
            'Aptos, sans-serif',
            'Playfair, serif'
        ];

        const fontFamilySelect = document.getElementById('fontFamily');
        const headerFontSelect = document.getElementById('headerFont');

        if (fontFamilySelect) {
            const currentValue = this.cvData.style.fontFamily;
            fontFamilySelect.innerHTML = fontOptions.map(font =>
                `<option value="${font}">${font.split(',')[0]}</option>`
            ).join('');
            fontFamilySelect.value = currentValue;
        }

        if (headerFontSelect) {
            const currentValue = this.cvData.style.headerFont;
            headerFontSelect.innerHTML = fontOptions.map(font =>
                `<option value="${font}">${font.split(',')[0]}</option>`
            ).join('');
            headerFontSelect.value = currentValue;
        }
    }

    updateFormStyles() {
        // Kolory
        const primaryColor = document.getElementById('primaryColor');
        const secondaryColor = document.getElementById('secondaryColor');
        const backgroundColor = document.getElementById('backgroundColor');
        const textColor = document.getElementById('textColor');
        const fontFamily = document.getElementById('fontFamily');
        const headerFont = document.getElementById('headerFont');

        if (primaryColor) primaryColor.value = this.cvData.style.primaryColor;
        if (secondaryColor) secondaryColor.value = this.cvData.style.secondaryColor;
        if (backgroundColor) backgroundColor.value = this.cvData.style.backgroundColor;
        if (textColor) textColor.value = this.cvData.style.textColor;
        if (fontFamily) fontFamily.value = this.cvData.style.fontFamily;
        if (headerFont) headerFont.value = this.cvData.style.headerFont;

        // Rozmiary czcionek
        const fs = this.cvData.style.fontSizes;

        const nameFontSize = document.getElementById('nameFontSize');
        const sectionTitleFontSize = document.getElementById('sectionTitleFontSize');
        const itemTitleFontSize = document.getElementById('itemTitleFontSize');
        const bodyFontSize = document.getElementById('bodyFontSize');
        const itemSubtitleFontSize = document.getElementById('itemSubtitleFontSize');
        const smallTextSize = document.getElementById('smallTextSize');
        const titleFontSize = document.getElementById('titleFontSize');

        if (nameFontSize) nameFontSize.value = fs.headers.name.replace('px', '');
        if (sectionTitleFontSize) sectionTitleFontSize.value = fs.headers.sectionTitle.replace('px', '');
        if (itemTitleFontSize) itemTitleFontSize.value = fs.headers.itemTitle.replace('px', '');
        if (bodyFontSize) bodyFontSize.value = fs.body.main.replace('px', '');
        if (itemSubtitleFontSize) itemSubtitleFontSize.value = fs.body.subtitle.replace('px', '');
        if (smallTextSize) smallTextSize.value = fs.body.small.replace('px', '');
        if (titleFontSize) titleFontSize.value = fs.special.professionalTitle.replace('px', '');

        // Marginesy
        this.updateFormMargins();
    }

    setupEventListeners() {
        // Personal info - wszystkie pola
        const personalFields = [
            'firstName', 'lastName', 'gender', 'birthDate', 'nationality',
            'drivingLicense', 'email', 'phone', 'address', 'website',
            'linkedin', 'github'
        ];

        personalFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.cvData.personal[field] = e.target.value;
                    this.updatePreview();
                });
            }
        });

        // Summary
        const summary = document.getElementById('summary');
        if (summary) {
            summary.addEventListener('input', (e) => {
                this.cvData.summary = e.target.value;
                this.updatePreview();
            });
        }

        // Style controls - kolory
        const styleControls = [
            'primaryColor', 'secondaryColor', 'backgroundColor', 'textColor',
            'fontFamily', 'headerFont'
        ];

        styleControls.forEach(control => {
            const element = document.getElementById(control);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.cvData.style[control] = e.target.value;
                    this.updatePreview();
                });
                element.addEventListener('change', (e) => {
                    this.cvData.style[control] = e.target.value;
                    this.updatePreview();
                });
            }
        });

        // Style controls - rozmiary czcionek
        const fontSizeControls = [
            'nameFontSize', 'sectionTitleFontSize', 'itemTitleFontSize',
            'bodyFontSize', 'itemSubtitleFontSize', 'smallTextSize', 'titleFontSize'
        ];

        fontSizeControls.forEach(control => {
            const element = document.getElementById(control);
            if (element) {
                element.addEventListener('input', (e) => {
                    const propertyMap = {
                        nameFontSize: 'headers.name',
                        sectionTitleFontSize: 'headers.sectionTitle',
                        itemTitleFontSize: 'headers.itemTitle',
                        bodyFontSize: 'body.main',
                        itemSubtitleFontSize: 'body.subtitle',
                        smallTextSize: 'body.small',
                        titleFontSize: 'special.professionalTitle'
                    };

                    const property = propertyMap[control];
                    if (property) {
                        const [category, subProperty] = property.split('.');
                        this.cvData.style.fontSizes[category][subProperty] = e.target.value + 'px';
                        this.updatePreview();
                    }
                });
            }
        });

        // Zoom control
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel) {
            zoomLevel.addEventListener('input', (e) => {
                this.scale = parseFloat(e.target.value);
                const zoomValue = document.getElementById('zoomValue');
                if (zoomValue) {
                    zoomValue.textContent = Math.round(this.scale * 100) + '%';
                }
                this.updatePreviewScale();
            });
        }

        // Photo upload
        const photoUpload = document.getElementById('photoUpload');
        if (photoUpload) {
            photoUpload.addEventListener('change', (e) => this.handlePhotoUpload(e));
        }

        const removePhoto = document.getElementById('removePhoto');
        if (removePhoto) {
            removePhoto.addEventListener('click', () => this.removePhoto());
        }

        // Buttons
        const buttonHandlers = {
            'addExperienceBtn': () => this.addExperience(),
            'addEducationBtn': () => this.addEducation(),
            'addSkillBtn': () => this.addSkill(),
            'addLanguageBtn': () => this.addLanguage(),
            'addCertificateBtn': () => this.addCertificate(),
            'addInterestBtn': () => this.addInterest(),
            'addProjectBtn': () => this.addProject(),
            'addCustomSectionBtn': () => this.addCustomSection()
        };

        Object.keys(buttonHandlers).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', buttonHandlers[buttonId]);
            }
        });

        // Export buttons
        const exportButtonHandlers = {
            'exportPdfBtn': () => this.exportPDF(),
            'exportJpgBtn': () => this.exportJPG(),
            'saveCvBtn': () => this.saveToLocalStorage(),
            'loadCvBtn': () => this.loadFromFile()
        };

        Object.keys(exportButtonHandlers).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', exportButtonHandlers[buttonId]);
            }
        });

        // Marginesy
        const marginControls = {
            'summaryMargin': 'summary',
            'experienceMargin': 'experience', 
            'educationMargin': 'education',
            'skillsMargin': 'skills',
            'languagesMargin': 'languages',
            'certificatesMargin': 'certificates',
            'interestsMargin': 'interests',
            'projectsMargin': 'projects',
            'customMargin': 'custom'
        };

        Object.entries(marginControls).forEach(([controlId, section]) => {
            const element = document.getElementById(controlId);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.updateSectionMargin(section, e.target.value);
                });
            }
        });

        // Obsługa klawisza Enter dla inputów umiejętności i zainteresowań
        this.setupEnterKeyHandlers();

        // Initialize with empty sections
        this.renderSections();
    }

    setupEnterKeyHandlers() {
        // Obsługa Enter dla umiejętności
        const skillInput = document.getElementById('skillInput');
        if (skillInput) {
            skillInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addSkill();
                }
            });
        }

        // Obsługa Enter dla zainteresowań
        const interestInput = document.getElementById('interestInput');
        if (interestInput) {
            interestInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addInterest();
                }
            });
        }
    }

    setupDragAndDrop() {
    let draggedItem = null;
    let isDraggingEnabled = false;

    const sections = document.querySelectorAll('.form-section');
    
    sections.forEach(section => {
        const sectionHandle = section.querySelector('.section-handle');
        
        if (!sectionHandle) return;

        // Włącz przeciąganie tylko gdy kursor jest na section-handle
        sectionHandle.addEventListener('mouseenter', () => {
            section.setAttribute('draggable', 'true');
            isDraggingEnabled = true;
        });

        sectionHandle.addEventListener('mouseleave', () => {
            if (!draggedItem) {
                section.setAttribute('draggable', 'false');
                isDraggingEnabled = false;
            }
        });

        section.addEventListener('dragstart', (e) => {
            if (!isDraggingEnabled) {
                e.preventDefault();
                return;
            }
            
            draggedItem = section;
            setTimeout(() => section.classList.add('dragging'), 0);
        });

        section.addEventListener('dragend', () => {
            section.classList.remove('dragging');
            draggedItem = null;
            isDraggingEnabled = false;
            
            // Przywróć stan draggable po zakończeniu przeciągania
            sections.forEach(s => {
                const handle = s.querySelector('.section-handle');
                if (handle) {
                    s.setAttribute('draggable', 'false');
                }
            });
            
            document.querySelectorAll('.form-section').forEach(s => s.classList.remove('drag-over'));
        });

        section.addEventListener('dragover', (e) => {
            if (!draggedItem) return;
            e.preventDefault();
            section.classList.add('drag-over');
        });

        section.addEventListener('dragleave', () => {
            section.classList.remove('drag-over');
        });

        section.addEventListener('drop', (e) => {
            e.preventDefault();
            section.classList.remove('drag-over');

            if (draggedItem && draggedItem !== section && isDraggingEnabled) {
                const allSections = Array.from(document.querySelectorAll('.form-section'));
                const draggedIndex = allSections.indexOf(draggedItem);
                const targetIndex = allSections.indexOf(section);

                if (draggedIndex < targetIndex) {
                    section.parentNode.insertBefore(draggedItem, section.nextSibling);
                } else {
                    section.parentNode.insertBefore(draggedItem, section);
                }

                this.updateSectionOrder();
            }
        });
    });

    // Domyślnie wyłącz przeciąganie
    sections.forEach(section => {
        section.setAttribute('draggable', 'false');
    });
}

    updateSectionOrder() {
        const sections = Array.from(document.querySelectorAll('.form-section'));
        const sectionOrder = sections.map(section => {
            if (section.querySelector('#experienceItems')) return 'experience';
            if (section.querySelector('#educationItems')) return 'education';
            if (section.querySelector('#skillsList')) return 'skills';
            if (section.querySelector('#languageItems')) return 'languages';
            if (section.querySelector('#certificateItems')) return 'certificates';
            if (section.querySelector('#interestsList')) return 'interests';
            if (section.querySelector('#projectItems')) return 'projects';
            if (section.querySelector('#customSections')) return 'custom';
            if (section.querySelector('#summary')) return 'summary';
            return null;
        }).filter(Boolean);

        this.cvData.sectionOrder = sectionOrder;
        this.updatePreview();
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.cvData.personal.photo = e.target.result;
                this.updatePhotoPreview();
                this.updatePreview();
            };
            reader.readAsDataURL(file);
        }
    }

    removePhoto() {
        this.cvData.personal.photo = null;
        this.updatePhotoPreview();
        this.updatePreview();
        const photoUpload = document.getElementById('photoUpload');
        if (photoUpload) {
            photoUpload.value = '';
        }
    }

    updatePhotoPreview() {
        const preview = document.getElementById('photoPreview');
        if (!preview) return;

        if (this.cvData.personal.photo) {
            preview.innerHTML = `<img src="${this.cvData.personal.photo}" alt="Zdjęcie profilowe">`;
        } else {
            preview.innerHTML = '<div class="placeholder">Brak zdjęcia</div>';
        }
    }

    // Add methods for different sections
    addExperience() {
        if (!this.cvData.experience) this.cvData.experience = [];
        this.cvData.experience.push({
            position: '',
            company: '',
            startDate: '',
            endDate: '',
            description: '',
            current: false
        });
        this.renderExperience();
        this.updatePreview();
    }

    addEducation() {
        if (!this.cvData.education) this.cvData.education = [];
        this.cvData.education.push({
            degree: '',
            institution: '',
            startDate: '',
            endDate: '',
            description: ''
        });
        this.renderEducation();
        this.updatePreview();
    }

    addSkill() {
        if (!this.cvData.skills) this.cvData.skills = [];
        const skillInput = document.getElementById('skillInput');
        if (!skillInput) return;

        const skill = skillInput.value.trim();
        if (skill && !this.cvData.skills.includes(skill)) {
            this.cvData.skills.push(skill);
            skillInput.value = '';
            this.renderSkills();
            this.updatePreview();
            
            // Focus na input po dodaniu
            setTimeout(() => skillInput.focus(), 10);
        }
    }

    addLanguage() {
        if (!this.cvData.languages) this.cvData.languages = [];
        this.cvData.languages.push({
            language: '',
            level: ''
        });
        this.renderLanguages();
        this.updatePreview();
    }

    addCertificate() {
        if (!this.cvData.certificates) this.cvData.certificates = [];
        this.cvData.certificates.push({
            name: '',
            institution: '',
            date: '',
            description: ''
        });
        this.renderCertificates();
        this.updatePreview();
    }

    addInterest() {
        if (!this.cvData.interests) this.cvData.interests = [];
        const interestInput = document.getElementById('interestInput');
        if (!interestInput) return;

        const interest = interestInput.value.trim();
        if (interest && !this.cvData.interests.includes(interest)) {
            this.cvData.interests.push(interest);
            interestInput.value = '';
            this.renderInterests();
            this.updatePreview();
            
            // Focus na input po dodaniu
            setTimeout(() => interestInput.focus(), 10);
        }
    }

    addProject() {
        if (!this.cvData.projects) this.cvData.projects = [];
        this.cvData.projects.push({
            name: '',
            description: '',
            technologies: '',
            link: ''
        });
        this.renderProjects();
        this.updatePreview();
    }

    addCustomSection() {
        if (!this.cvData.customSections) this.cvData.customSections = [];
        this.cvData.customSections.push({
            title: '',
            content: ''
        });
        this.renderCustomSections();
        this.updatePreview();
    }

    // Render methods for all sections
    renderSections() {
        this.renderExperience();
        this.renderEducation();
        this.renderSkills();
        this.renderLanguages();
        this.renderCertificates();
        this.renderInterests();
        this.renderProjects();
        this.renderCustomSections();
        this.updatePhotoPreview();
    }

    renderExperience() {
        const container = document.getElementById('experienceItems');
        if (!container) return;

        container.innerHTML = '';

        if (!this.cvData.experience) this.cvData.experience = [];

        this.cvData.experience.forEach((exp, index) => {
            const item = document.createElement('div');
            item.className = 'section-item';
            item.innerHTML = `
                <div class="item-header">
                    <h5>Doświadczenie ${index + 1}</h5>
                    <div class="item-actions">
                        <button class="btn-small" onclick="cvGenerator.moveExperienceUp(${index})">↑</button>
                        <button class="btn-small" onclick="cvGenerator.moveExperienceDown(${index})">↓</button>
                        <button class="btn-small btn-danger" onclick="cvGenerator.removeExperience(${index})">✕</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Stanowisko</label>
                        <input type="text" value="${this.escapeHTML(exp.position || '')}" 
                               oninput="cvGenerator.updateExperience(${index}, 'position', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Firma</label>
                        <input type="text" value="${this.escapeHTML(exp.company || '')}" 
                               oninput="cvGenerator.updateExperience(${index}, 'company', this.value)">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Data rozpoczęcia</label>
                        <input type="text" value="${this.escapeHTML(exp.startDate || '')}" 
                               oninput="cvGenerator.updateExperience(${index}, 'startDate', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Data zakończenia</label>
                        <input type="text" value="${this.escapeHTML(exp.endDate || '')}" 
                               oninput="cvGenerator.updateExperience(${index}, 'endDate', this.value)">
                    </div>
                </div>
                <div class="form-group">
                    <label>Opis</label>
                    <textarea oninput="cvGenerator.updateExperience(${index}, 'description', this.value)">${this.escapeHTML(exp.description || '')}</textarea>
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderEducation() {
        const container = document.getElementById('educationItems');
        if (!container) return;

        container.innerHTML = '';

        if (!this.cvData.education) this.cvData.education = [];

        this.cvData.education.forEach((edu, index) => {
            const item = document.createElement('div');
            item.className = 'section-item';
            item.innerHTML = `
                <div class="item-header">
                    <h5>Edukacja ${index + 1}</h5>
                    <div class="item-actions">
                        <button class="btn-small" onclick="cvGenerator.moveEducationUp(${index})">↑</button>
                        <button class="btn-small" onclick="cvGenerator.moveEducationDown(${index})">↓</button>
                        <button class="btn-small btn-danger" onclick="cvGenerator.removeEducation(${index})">✕</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Tytuł</label>
                        <input type="text" value="${this.escapeHTML(edu.degree || '')}" 
                               oninput="cvGenerator.updateEducation(${index}, 'degree', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Instytucja</label>
                        <input type="text" value="${this.escapeHTML(edu.institution || '')}" 
                               oninput="cvGenerator.updateEducation(${index}, 'institution', this.value)">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Data rozpoczęcia</label>
                        <input type="text" value="${this.escapeHTML(edu.startDate || '')}" 
                               oninput="cvGenerator.updateEducation(${index}, 'startDate', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Data zakończenia</label>
                        <input type="text" value="${this.escapeHTML(edu.endDate || '')}" 
                               oninput="cvGenerator.updateEducation(${index}, 'endDate', this.value)">
                    </div>
                </div>
                <div class="form-group">
                    <label>Opis</label>
                    <textarea oninput="cvGenerator.updateEducation(${index}, 'description', this.value)">${this.escapeHTML(edu.description || '')}</textarea>
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderSkills() {
        const container = document.getElementById('skillsList');
        if (!container) return;

        container.innerHTML = '';

        if (!this.cvData.skills) this.cvData.skills = [];

        this.cvData.skills.forEach((skill, index) => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `
                ${this.escapeHTML(skill)}
                <span class="remove-skill" onclick="cvGenerator.removeSkill(${index})">✕</span>
            `;
            container.appendChild(tag);
        });
    }

    renderLanguages() {
        const container = document.getElementById('languageItems');
        if (!container) return;

        container.innerHTML = '';

        if (!this.cvData.languages) this.cvData.languages = [];

        this.cvData.languages.forEach((lang, index) => {
            const languageValue = typeof lang === 'string' ? lang : (lang.language || '');
            const levelValue = typeof lang === 'string' ? '' : (lang.level || '');

            const item = document.createElement('div');
            item.className = 'section-item';
            item.innerHTML = `
                <div class="item-header">
                    <h5>Język ${index + 1}</h5>
                    <div class="item-actions">
                        <button class="btn-small" onclick="cvGenerator.moveLanguageUp(${index})">↑</button>
                        <button class="btn-small" onclick="cvGenerator.moveLanguageDown(${index})">↓</button>
                        <button class="btn-small btn-danger" onclick="cvGenerator.removeLanguage(${index})">✕</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Język</label>
                        <input type="text" value="${this.escapeHTML(languageValue)}" 
                               oninput="cvGenerator.updateLanguage(${index}, 'language', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Poziom</label>
                        <select onchange="cvGenerator.updateLanguage(${index}, 'level', this.value)">
                            <option value="">Wybierz poziom</option>
                            <option value="Podstawowy" ${levelValue === 'Podstawowy' ? 'selected' : ''}>Podstawowy</option>
                            <option value="Średniozaawansowany" ${levelValue === 'Średniozaawansowany' ? 'selected' : ''}>Średniozaawansowany</option>
                            <option value="Zaawansowany" ${levelValue === 'Zaawansowany' ? 'selected' : ''}>Zaawansowany</option>
                            <option value="Biegły" ${levelValue === 'Biegły' ? 'selected' : ''}>Biegły</option>
                            <option value="Rodzimy" ${levelValue === 'Rodzimy' ? 'selected' : ''}>Rodzimy</option>
                        </select>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderCertificates() {
        const container = document.getElementById('certificateItems');
        if (!container) return;

        container.innerHTML = '';

        if (!this.cvData.certificates) this.cvData.certificates = [];

        this.cvData.certificates.forEach((cert, index) => {
            const item = document.createElement('div');
            item.className = 'section-item';
            item.innerHTML = `
                <div class="item-header">
                    <h5>Certyfikat ${index + 1}</h5>
                    <div class="item-actions">
                        <button class="btn-small" onclick="cvGenerator.moveCertificateUp(${index})">↑</button>
                        <button class="btn-small" onclick="cvGenerator.moveCertificateDown(${index})">↓</button>
                        <button class="btn-small btn-danger" onclick="cvGenerator.removeCertificate(${index})">✕</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nazwa certyfikatu</label>
                    <input type="text" value="${this.escapeHTML(cert.name || '')}" 
                           oninput="cvGenerator.updateCertificate(${index}, 'name', this.value)">
                </div>
                <div class="form-group">
                    <label>Instytucja</label>
                    <input type="text" value="${this.escapeHTML(cert.institution || '')}" 
                           oninput="cvGenerator.updateCertificate(${index}, 'institution', this.value)">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Data uzyskania</label>
                        <input type="text" value="${this.escapeHTML(cert.date || '')}" 
                               oninput="cvGenerator.updateCertificate(${index}, 'date', this.value)">
                    </div>
                </div>
                <div class="form-group">
                    <label>Opis</label>
                    <textarea oninput="cvGenerator.updateCertificate(${index}, 'description', this.value)">${this.escapeHTML(cert.description || '')}</textarea>
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderInterests() {
        const container = document.getElementById('interestsList');
        if (!container) return;

        container.innerHTML = '';

        if (!this.cvData.interests) this.cvData.interests = [];

        this.cvData.interests.forEach((interest, index) => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `
                ${this.escapeHTML(interest)}
                <span class="remove-skill" onclick="cvGenerator.removeInterest(${index})">✕</span>
            `;
            container.appendChild(tag);
        });
    }

    renderProjects() {
        const container = document.getElementById('projectItems');
        if (!container) return;

        container.innerHTML = '';

        if (!this.cvData.projects) this.cvData.projects = [];

        this.cvData.projects.forEach((project, index) => {
            const item = document.createElement('div');
            item.className = 'section-item';
            item.innerHTML = `
                <div class="item-header">
                    <h5>Projekt ${index + 1}</h5>
                    <div class="item-actions">
                        <button class="btn-small" onclick="cvGenerator.moveProjectUp(${index})">↑</button>
                        <button class="btn-small" onclick="cvGenerator.moveProjectDown(${index})">↓</button>
                        <button class="btn-small btn-danger" onclick="cvGenerator.removeProject(${index})">✕</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nazwa projektu</label>
                    <input type="text" value="${this.escapeHTML(project.name || '')}" 
                           oninput="cvGenerator.updateProject(${index}, 'name', this.value)">
                </div>
                <div class="form-group">
                    <label>Opis</label>
                    <textarea oninput="cvGenerator.updateProject(${index}, 'description', this.value)">${this.escapeHTML(project.description || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>Technologie</label>
                    <input type="text" value="${this.escapeHTML(project.technologies || '')}" 
                           oninput="cvGenerator.updateProject(${index}, 'technologies', this.value)">
                </div>
                <div class="form-group">
                    <label>Link</label>
                    <input type="text" value="${this.escapeHTML(project.link || '')}" 
                           oninput="cvGenerator.updateProject(${index}, 'link', this.value)">
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderCustomSections() {
        const container = document.getElementById('customSections');
        if (!container) return;

        container.innerHTML = '';

        if (!this.cvData.customSections) this.cvData.customSections = [];

        this.cvData.customSections.forEach((section, index) => {
            const item = document.createElement('div');
            item.className = 'custom-section-item';
            item.innerHTML = `
                <div class="item-header">
                    <h5>Sekcja niestandardowa ${index + 1}</h5>
                    <div class="item-actions">
                        <button class="btn-small" onclick="cvGenerator.moveCustomSectionUp(${index})">↑</button>
                        <button class="btn-small" onclick="cvGenerator.moveCustomSectionDown(${index})">↓</button>
                        <button class="btn-small btn-danger" onclick="cvGenerator.removeCustomSection(${index})">✕</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Tytuł sekcji</label>
                    <input type="text" value="${this.escapeHTML(section.title || '')}" 
                           oninput="cvGenerator.updateCustomSection(${index}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label>Treść</label>
                    <textarea oninput="cvGenerator.updateCustomSection(${index}, 'content', this.value)">${this.escapeHTML(section.content || '')}</textarea>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // Update methods
    updateExperience(index, field, value) {
        if (!this.cvData.experience) this.cvData.experience = [];
        this.cvData.experience[index][field] = value;
        this.updatePreview();
    }

    updateEducation(index, field, value) {
        if (!this.cvData.education) this.cvData.education = [];
        this.cvData.education[index][field] = value;
        this.updatePreview();
    }

    updateLanguage(index, field, value) {
        if (!this.cvData.languages) this.cvData.languages = [];

        if (typeof this.cvData.languages[index] === 'string') {
            this.cvData.languages[index] = {
                language: this.cvData.languages[index],
                level: ''
            };
        }

        if (!this.cvData.languages[index]) {
            this.cvData.languages[index] = {
                language: '',
                level: ''
            };
        }

        this.cvData.languages[index][field] = value;
        this.updatePreview();
    }

    updateCertificate(index, field, value) {
        if (!this.cvData.certificates) this.cvData.certificates = [];
        this.cvData.certificates[index][field] = value;
        this.updatePreview();
    }

    updateProject(index, field, value) {
        if (!this.cvData.projects) this.cvData.projects = [];
        this.cvData.projects[index][field] = value;
        this.updatePreview();
    }

    updateCustomSection(index, field, value) {
        if (!this.cvData.customSections) this.cvData.customSections = [];
        this.cvData.customSections[index][field] = value;
        this.updatePreview();
    }

    // Remove methods
    removeExperience(index) {
        if (!this.cvData.experience) return;
        this.cvData.experience.splice(index, 1);
        this.renderExperience();
        this.updatePreview();
    }

    removeEducation(index) {
        if (!this.cvData.education) return;
        this.cvData.education.splice(index, 1);
        this.renderEducation();
        this.updatePreview();
    }

    removeSkill(index) {
        if (!this.cvData.skills) return;
        this.cvData.skills.splice(index, 1);
        this.renderSkills();
        this.updatePreview();
    }

    removeLanguage(index) {
        if (!this.cvData.languages) return;
        this.cvData.languages.splice(index, 1);
        this.renderLanguages();
        this.updatePreview();
    }

    removeCertificate(index) {
        if (!this.cvData.certificates) return;
        this.cvData.certificates.splice(index, 1);
        this.renderCertificates();
        this.updatePreview();
    }

    removeInterest(index) {
        if (!this.cvData.interests) return;
        this.cvData.interests.splice(index, 1);
        this.renderInterests();
        this.updatePreview();
    }

    removeProject(index) {
        if (!this.cvData.projects) return;
        this.cvData.projects.splice(index, 1);
        this.renderProjects();
        this.updatePreview();
    }

    removeCustomSection(index) {
        if (!this.cvData.customSections) return;
        this.cvData.customSections.splice(index, 1);
        this.renderCustomSections();
        this.updatePreview();
    }

    // Move methods
    moveExperienceUp(index) {
        if (!this.cvData.experience || index <= 0) return;
        [this.cvData.experience[index], this.cvData.experience[index - 1]] = [this.cvData.experience[index - 1], this.cvData.experience[index]];
        this.renderExperience();
        this.updatePreview();
    }

    moveExperienceDown(index) {
        if (!this.cvData.experience || index >= this.cvData.experience.length - 1) return;
        [this.cvData.experience[index], this.cvData.experience[index + 1]] = [this.cvData.experience[index + 1], this.cvData.experience[index]];
        this.renderExperience();
        this.updatePreview();
    }

    moveEducationUp(index) {
        if (!this.cvData.education || index <= 0) return;
        [this.cvData.education[index], this.cvData.education[index - 1]] = [this.cvData.education[index - 1], this.cvData.education[index]];
        this.renderEducation();
        this.updatePreview();
    }

    moveEducationDown(index) {
        if (!this.cvData.education || index >= this.cvData.education.length - 1) return;
        [this.cvData.education[index], this.cvData.education[index + 1]] = [this.cvData.education[index + 1], this.cvData.education[index]];
        this.renderEducation();
        this.updatePreview();
    }

    moveLanguageUp(index) {
        if (!this.cvData.languages || index <= 0) return;
        [this.cvData.languages[index], this.cvData.languages[index - 1]] = [this.cvData.languages[index - 1], this.cvData.languages[index]];
        this.renderLanguages();
        this.updatePreview();
    }

    moveLanguageDown(index) {
        if (!this.cvData.languages || index >= this.cvData.languages.length - 1) return;
        [this.cvData.languages[index], this.cvData.languages[index + 1]] = [this.cvData.languages[index + 1], this.cvData.languages[index]];
        this.renderLanguages();
        this.updatePreview();
    }

    moveCertificateUp(index) {
        if (!this.cvData.certificates || index <= 0) return;
        [this.cvData.certificates[index], this.cvData.certificates[index - 1]] = [this.cvData.certificates[index - 1], this.cvData.certificates[index]];
        this.renderCertificates();
        this.updatePreview();
    }

    moveCertificateDown(index) {
        if (!this.cvData.certificates || index >= this.cvData.certificates.length - 1) return;
        [this.cvData.certificates[index], this.cvData.certificates[index + 1]] = [this.cvData.certificates[index + 1], this.cvData.certificates[index]];
        this.renderCertificates();
        this.updatePreview();
    }

    moveProjectUp(index) {
        if (!this.cvData.projects || index <= 0) return;
        [this.cvData.projects[index], this.cvData.projects[index - 1]] = [this.cvData.projects[index - 1], this.cvData.projects[index]];
        this.renderProjects();
        this.updatePreview();
    }

    moveProjectDown(index) {
        if (!this.cvData.projects || index >= this.cvData.projects.length - 1) return;
        [this.cvData.projects[index], this.cvData.projects[index + 1]] = [this.cvData.projects[index + 1], this.cvData.projects[index]];
        this.renderProjects();
        this.updatePreview();
    }

    moveCustomSectionUp(index) {
        if (!this.cvData.customSections || index <= 0) return;
        [this.cvData.customSections[index], this.cvData.customSections[index - 1]] = [this.cvData.customSections[index - 1], this.cvData.customSections[index]];
        this.renderCustomSections();
        this.updatePreview();
    }

    moveCustomSectionDown(index) {
        if (!this.cvData.customSections || index >= this.cvData.customSections.length - 1) return;
        [this.cvData.customSections[index], this.cvData.customSections[index + 1]] = [this.cvData.customSections[index + 1], this.cvData.customSections[index]];
        this.renderCustomSections();
        this.updatePreview();
    }

    updatePreview() {
        if (this.isUpdating) return;

        this.isUpdating = true;
        const preview = document.getElementById('cvPreview');
        if (!preview) {
            this.isUpdating = false;
            return;
        }

        this.showLoader();

        const cvHTML = this.generateCVHTML();
        preview.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                ${this.generateCVStyles()}
            </style>
        </head>
        <body>
            ${cvHTML}
        </body>
        </html>
    `;

        preview.onload = () => {
            this.updatePreviewScale();
            this.setupPageNavigation();
            this.hideLoader();
            this.isUpdating = false;
        };

        preview.onerror = () => {
            this.hideLoader();
            this.isUpdating = false;
        };

        setTimeout(() => {
            this.hideLoader();
            this.isUpdating = false;
        }, 3000);
    }

    showLoader() {
        const previewContainer = document.querySelector('.preview-container');
        if (!previewContainer) return;

        let loader = document.getElementById('previewLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'previewLoader';
            loader.className = 'preview-loader';
            loader.innerHTML = `
            <div class="loader-spinner"></div>
            <div class="loader-text">Aktualizowanie podglądu...</div>
        `;
            previewContainer.appendChild(loader);
            previewContainer.classList.add('loading');
        }
        loader.classList.add('active');
    }

    hideLoader() {
        const loader = document.getElementById('previewLoader');
        const previewContainer = document.querySelector('.preview-container');

        if (loader) {
            loader.classList.remove('active');
        }
        if (previewContainer) {
            previewContainer.classList.remove('loading');
        }
    }

    setupPageNavigation() {
        const preview = document.getElementById('cvPreview');
        if (!preview.contentDocument) return;

        const body = preview.contentDocument.body;
        const existingNav = body.querySelector('.page-navigation');
        if (existingNav) {
            existingNav.remove();
        }

        const pages = body.querySelectorAll('.cv-page');
        this.pages = Array.from(pages);

        if (this.pages.length > 1) {
            const nav = preview.contentDocument.createElement('div');
            nav.className = 'page-navigation';
            nav.innerHTML = `
                <div class="page-nav-container">
                    <button class="page-nav-btn" id="prevPage">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="page-info">
                        <span id="currentPage">1</span> / <span id="totalPages">${this.pages.length}</span>
                    </div>
                    <button class="page-nav-btn" id="nextPage">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `;
            body.appendChild(nav);

            preview.contentDocument.getElementById('prevPage').addEventListener('click', () => this.changePage(-1));
            preview.contentDocument.getElementById('nextPage').addEventListener('click', () => this.changePage(1));

            this.showPage(0);
        } else if (this.pages.length === 1) {
            this.pages[0].style.display = 'block';
        }
    }

    changePage(direction) {
        const totalPages = this.pages.length;
        this.currentPage += direction;

        if (this.currentPage < 0) {
            this.currentPage = totalPages - 1;
        } else if (this.currentPage >= totalPages) {
            this.currentPage = 0;
        }

        this.showPage(this.currentPage);

        const preview = document.getElementById('cvPreview');
        if (preview.contentDocument) {
            const currentPageElem = preview.contentDocument.getElementById('currentPage');
            if (currentPageElem) {
                currentPageElem.textContent = this.currentPage + 1;
            }
        }
    }

    showPage(pageIndex) {
        this.pages.forEach((page, index) => {
            page.style.display = index === pageIndex ? 'block' : 'none';
        });
    }

    updatePreviewScale() {
        const preview = document.getElementById('cvPreview');
        if (preview.contentDocument && preview.contentDocument.body) {
            const content = preview.contentDocument.body;
            content.style.transform = `scale(${this.scale})`;
            content.style.transformOrigin = 'top left';
            content.style.width = `${100/this.scale}%`;
            content.style.height = `${100/this.scale}%`;
        }
    }

    migrateOldData(data) {
        const defaultData = this.getDefaultData();
        const migratedData = {
            ...defaultData,
            ...data
        };

        if (data.style && !data.style.fontSizes) {
            migratedData.style.fontSizes = {
                headers: {
                    name: data.style.nameFontSize || defaultData.style.fontSizes.headers.name,
                    sectionTitle: data.style.sectionTitleFontSize || defaultData.style.fontSizes.headers.sectionTitle,
                    itemTitle: data.style.itemTitleFontSize || defaultData.style.fontSizes.headers.itemTitle
                },
                body: {
                    main: data.style.bodyFontSize || defaultData.style.fontSizes.body.main,
                    subtitle: data.style.itemSubtitleFontSize || defaultData.style.fontSizes.body.subtitle,
                    small: data.style.smallTextSize || defaultData.style.fontSizes.body.small
                },
                special: {
                    professionalTitle: data.style.titleFontSize || defaultData.style.fontSizes.special.professionalTitle
                }
            };
        }

        // Migracja marginesów
        if (!migratedData.style.sectionMargins) {
            migratedData.style.sectionMargins = defaultData.style.sectionMargins;
        }

        if (migratedData.languages && migratedData.languages.length > 0) {
            migratedData.languages = migratedData.languages.map(lang => {
                if (typeof lang === 'string') {
                    return {
                        language: lang,
                        level: ''
                    };
                }
                return lang;
            });
        }

        if (!migratedData.experience) migratedData.experience = [];
        if (!migratedData.education) migratedData.education = [];
        if (!migratedData.skills) migratedData.skills = [];
        if (!migratedData.languages) migratedData.languages = [];
        if (!migratedData.certificates) migratedData.certificates = [];
        if (!migratedData.interests) migratedData.interests = [];
        if (!migratedData.projects) migratedData.projects = [];
        if (!migratedData.customSections) migratedData.customSections = [];

        return migratedData;
    }

    generateCVStyles() {
        const style = this.cvData.style;
        const fs = style.fontSizes;
        const margins = style.sectionMargins || {};

        return `
        @media print {
            .cv-page {
                padding: 15mm !important;
                margin: 0 !important;
            }
            
            .cv-section {
                page-break-inside: avoid;
            }
            
            .experience-item, .education-item {
                page-break-inside: avoid;
            }
            
            .item-header {
                page-break-after: avoid;
            }
        }
        
        /* Zapewnij odpowiednie rozmiary dla PDF */
        @media all {
            .cv-page {
                width: 210mm;
                min-height: 297mm;
                height: auto;
            }
        }
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: ${style.fontFamily};
        font-size: ${fs.body.main};
        line-height: 1.6;
        letter-spacing: -0.3px;
        color: ${style.textColor};
        background: #f0f0f0;
        padding: 0;
        margin: 0;
        width: 100%;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
    }
    
    .page-navigation {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 12px 24px;
        border-radius: 50px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 20px;
        z-index: 1000;
        border: 2px solid ${style.primaryColor}30;
        backdrop-filter: blur(12px);
        min-width: 200px;
        justify-content: center;
    }
    
    .page-nav-container {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    
    .page-nav-btn {
        background: ${style.primaryColor};
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .page-info {
        font-size: ${fs.body.small};
        color: #333;
        font-weight: 600;
        min-width: 60px;
        text-align: center;
        font-family: ${style.fontFamily};
    }
    
    .cv-pages-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        width: 100%;
        max-width: 210mm;
        margin: 0;
        padding: 0;
    }
    
    .cv-page {
        background: ${style.backgroundColor};
        box-shadow: 0 5px 25px rgba(0,0,0,0.15);
        min-height: 297mm;
        height: auto;
        width: 210mm;
        position: relative;
        padding: 5mm;
        overflow: hidden;
        page-break-after: always;
        margin: 0;
    }
    
    .cv-header {
        background: ${style.primaryColor};
        color: white;
        padding: 1.7rem;
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
        border-radius: 8px;
    }
    
    .photo-container {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid white;
        flex-shrink: 0;
    }
    
    .photo-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .header-content {
        flex: 1;
    }
    
    .cv-name {
        font-family: ${style.headerFont};
        font-size: ${fs.headers.name};
        font-weight: bold;
        margin-bottom: 0.5rem;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    
    .cv-title {
        font-size: ${fs.special.professionalTitle};
        opacity: 0.95;
        margin-bottom: 1rem;
        font-weight: 300;
    }
    
    .personal-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
        font-size: ${fs.body.small};
        margin-bottom: 1rem;
    }
    
    .personal-info-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .personal-info-item .icon {
        width: 16px;
        height: 16px;
        opacity: 0.9;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .cv-contact {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
        font-size: ${fs.body.small};
    }
    
    .contact-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .contact-item .icon {
        width: 16px;
        height: 16px;
        opacity: 0.9;
        transform: translateY(-2px);
    }
    
    .cv-section {
        margin: 2rem 0;
        page-break-inside: avoid;
        break-inside: avoid;
    }
    
    .section-title {
        color: ${style.primaryColor};
        font-family: ${style.headerFont};
        font-size: ${fs.headers.sectionTitle};
        font-weight: bold;
        margin-bottom: 1rem;
        border-bottom: 3px solid ${style.secondaryColor};
        padding-bottom: 0.5rem;
        page-break-after: avoid;
        break-after: avoid;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .section-title .icon {
        width: 20px;
        height: 20px;
        opacity: 0.9;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .summary-text {
        text-align: justify;
        line-height: 1.8;
        font-size: 1.05em;
    }
    
    .experience-item, .education-item, .project-item, .certificate-item, .custom-section {
        margin-bottom: 1.8rem;
        page-break-inside: avoid;
        break-inside: avoid;
    }
    
    .experience-item:last-child, .education-item:last-child {
        margin-bottom: 0;
    }
    
    .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
        page-break-after: avoid;
    }
    
    .item-title {
        font-weight: bold;
        font-size: ${fs.headers.itemTitle};
        color: ${style.secondaryColor};
        flex: 1;
    }
    
    .item-date {
        color: #666;
        font-style: italic;
        font-size: ${fs.body.small};
        min-width: 120px;
        text-align: right;
    }
    
    .item-subtitle {
        color: #555;
        margin-bottom: 0.8rem;
        font-size: ${fs.body.subtitle};
        font-weight: 500;
    }
    
    .item-description {
        text-align: justify;
        line-height: 1.7;
        color: #444;
        font-size: ${fs.body.main};
    }
    
    .skills-grid, .languages-grid, .interests-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 0.4rem;
    }
    
    .skill-tag, .language-tag, .interest-tag {
        background: #00000008;
        color: ${style.primaryColor};
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: ${fs.body.small};
        text-align: center;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .language-item {
        margin-bottom: 1rem;
        padding: 0.8rem;
        background: ${style.primaryColor}08;
        border-radius: 10px;
    }
    
    .language-item .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.3rem;
    }
    
    .item-level {
        color: #666;
        font-style: italic;
        font-size: ${fs.body.small};
    }
    
    .custom-section-content {
        line-height: 1.6;
        text-align: justify;
        font-size: ${fs.body.main};
    }
    
    /* TIMELINE STYLES */
    .experience-timeline {
        position: relative;
        margin-left: 30px;
        padding-left: 20px;
    }
    
    .experience-timeline::before {
        content: '';
        position: absolute;
        left: -11px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: ${style.primaryColor};
        margin-top: 20px;
    }
    
    .experience-timeline-item {
        position: relative;
        padding-bottom: 1rem;
    }
    
    .experience-timeline-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
    }
    
    .timeline-marker {
        position: absolute;
        left: -36px;
        top: 8px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${style.primaryColor};
        border: 3px solid ${style.backgroundColor};
        box-shadow: 0 0 0 2px ${style.primaryColor};
        z-index: 2;
    }
    
    .timeline-content {
        margin-left: 0;
    }
    
    .page-break {
        page-break-before: always;
        break-before: page;
        height: 0;
        visibility: hidden;
    }
    
    /* Lepsze zarządzanie podziałami stron */
    .cv-section:first-child {
        page-break-before: auto;
    }
    
    .experience-item, .education-item {
        page-break-inside: avoid;
        break-inside: avoid;
    }
    
    /* Unikaj pozostawiania pojedynczych wierszy na stronie */
    .item-header, .item-title, .item-subtitle {
        page-break-after: avoid;
    }
    
    .item-description {
        orphans: 3;
        widows: 3;
    }
    
    /* MARGINESY SEKCJI */
    .summary-section {
        margin-bottom: ${margins.summary || '20'}px !important;
    }
    .experience-section {
        margin-bottom: ${margins.experience || '20'}px !important;
    }
    .education-section {
        margin-bottom: ${margins.education || '20'}px !important;
    }
    .skills-section {
        margin-bottom: ${margins.skills || '20'}px !important;
    }
    .languages-section {
        margin-bottom: ${margins.languages || '20'}px !important;
    }
    .certificates-section {
        margin-bottom: ${margins.certificates || '20'}px !important;
    }
    .interests-section {
        margin-bottom: ${margins.interests || '20'}px !important;
    }
    .projects-section {
        margin-bottom: ${margins.projects || '20'}px !important;
    }
    .custom-section {
        margin-bottom: ${margins.custom || '20'}px !important;
    }
    
    @media screen {
        .cv-page {
            margin-bottom: 20px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }
    }
    
    @media print {
        body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 210mm !important;
        }
        
        .cv-pages-container {
            max-width: none !important;
            gap: 0 !important;
        }
        
        .cv-page {
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always !important;
            border-radius: 0 !important;
            padding: 20mm !important;
            min-height: 297mm !important;
            height: auto !important;
        }
        
        .page-navigation {
            display: none !important;
        }
        
        .cv-page {
            display: block !important;
        }
    }
    `;
    }

    generateCVHTML() {
        const data = this.cvData;
        this.initializeDataArrays(data);

        if (!data.sectionOrder || !Array.isArray(data.sectionOrder)) {
            data.sectionOrder = ['summary', 'experience', 'education', 'skills', 'languages', 'certificates', 'interests', 'projects', 'custom'];
        }

        const headerHTML = this.generateHeaderHTML(data);
        const sectionsHTML = this.generateSectionsHTML(data);

        return `
        <div class="cv-pages-container">
            <div class="cv-page">
                ${headerHTML}
                ${sectionsHTML}
            </div>
        </div>
    `;
    }

    initializeDataArrays(data) {
        const arrays = ['experience', 'education', 'skills', 'languages', 'certificates', 'interests', 'projects', 'customSections'];
        arrays.forEach(key => {
            if (!data[key] || !Array.isArray(data[key])) {
                data[key] = [];
            }
        });
    }

    generateHeaderHTML(data) {
        const personalInfoHTML = this.generatePersonalInfoHTML(data.personal);
        const contactInfoHTML = this.generateContactInfoHTML(data.personal);
        const photoHTML = data.personal.photo ?
            `<div class="photo-container"><img src="${this.escapeHTML(data.personal.photo)}" alt="Zdjęcie profilowe"></div>` : '';

        return `
        <header class="cv-header">
            ${photoHTML}
            <div class="header-content">
                <h1 class="cv-name">${this.escapeHTML(data.personal.firstName || '')} ${this.escapeHTML(data.personal.lastName || '')}</h1>
                ${personalInfoHTML}
                ${contactInfoHTML}
            </div>
        </header>
    `;
    }

    generatePersonalInfoHTML(personal) {
        const items = [];
        const fields = [{
                key: 'gender',
                label: 'Płeć'
            },
            {
                key: 'birthDate',
                label: 'Data urodzenia'
            },
            {
                key: 'nationality',
                label: 'Narodowość'
            },
            {
                key: 'drivingLicense',
                label: 'Prawo jazdy'
            }
        ];

        fields.forEach(field => {
            if (personal[field.key]) {
                items.push(`<div class="personal-info-item">${this.getIcon(field.key)}${field.label}: ${this.escapeHTML(personal[field.key])}</div>`);
            }
        });

        return items.length > 0 ? `<div class="personal-info">${items.join('')}</div>` : '';
    }

    generateContactInfoHTML(personal) {
        const items = [];
        const fields = [{
                key: 'phone',
                icon: 'phone'
            },
            {
                key: 'email',
                icon: 'email'
            },
            {
                key: 'address',
                icon: 'address'
            },
            {
                key: 'website',
                icon: 'website'
            },
            {
                key: 'linkedin',
                icon: 'linkedin'
            },
            {
                key: 'github',
                icon: 'github'
            }
        ];

        fields.forEach(field => {
            if (personal[field.key]) {
                items.push(`<div class="contact-item">${this.getIcon(field.icon)}${this.escapeHTML(personal[field.key])}</div>`);
            }
        });

        return items.length > 0 ? `<div class="cv-contact">${items.join('')}</div>` : '';
    }

    generateSectionsHTML(data) {
        const sections = {
            summary: this.generateSummarySection(data.summary),
            experience: this.generateExperienceSection(data.experience),
            education: this.generateEducationSection(data.education),
            skills: this.generateSkillsSection(data.skills),
            languages: this.generateLanguagesSection(data.languages),
            certificates: this.generateCertificatesSection(data.certificates),
            interests: this.generateInterestsSection(data.interests),
            projects: this.generateProjectsSection(data.projects),
            custom: this.generateCustomSections(data.customSections)
        };

        return data.sectionOrder
            .map(sectionKey => sections[sectionKey] || '')
            .filter(section => section !== '')
            .join('');
    }

    generateSummarySection(summary) {
        if (!summary) return '';

        return `
        <section class="cv-section summary-section">
            <h2 class="section-title">${this.getIcon('summary')}Profil zawodowy</h2>
            <div class="summary-text">${this.formatTextWithLineBreaks(summary)}</div>
        </section>
    `;
    }

    generateExperienceSection(experience) {
        if (!experience || experience.length === 0) return '';

        const itemsHTML = experience.map((exp, index) => `
        <div class="experience-timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <div class="item-header">
                    <h3 class="item-title">${this.escapeHTML(exp.position || '')}</h3>
                    <span class="item-date">${this.escapeHTML(exp.startDate || '')} - ${exp.current ? 'obecnie' : this.escapeHTML(exp.endDate || '')}</span>
                </div>
                <div class="item-subtitle">${this.escapeHTML(exp.company || '')}</div>
                <div class="item-description">${this.formatTextWithLineBreaks(exp.description || '')}</div>
            </div>
        </div>
    `).join('');

        return `
    <section class="cv-section experience-section">
        <h2 class="section-title">${this.getIcon('experience')}Doświadczenie zawodowe</h2>
        <div class="experience-timeline">
            ${itemsHTML}
        </div>
    </section>
    `;
    }

    generateEducationSection(education) {
        if (!education || education.length === 0) return '';

        const itemsHTML = education.map((edu, index) => `
        <div class="education-item" data-item-index="${index}">
            <div class="item-header">
                <h3 class="item-title">${this.escapeHTML(edu.degree || '')}</h3>
                <span class="item-date">${this.escapeHTML(edu.startDate || '')} - ${this.escapeHTML(edu.endDate || '')}</span>
            </div>
            <div class="item-subtitle">${this.escapeHTML(edu.institution || '')}</div>
            <div class="item-description">${this.formatTextWithLineBreaks(edu.description || '')}</div>
        </div>
    `).join('');

        return `
        <section class="cv-section education-section">
            <h2 class="section-title">${this.getIcon('education')}Edukacja</h2>
            ${itemsHTML}
        </section>
    `;
    }

    generateSkillsSection(skills) {
        if (!skills || skills.length === 0) return '';

        const skillsHTML = skills.map(skill =>
            `<div class="skill-tag">${this.escapeHTML(skill)}</div>`
        ).join('');

        return `
        <section class="cv-section skills-section">
            <h2 class="section-title">${this.getIcon('skills')}Umiejętności</h2>
            <div class="skills-grid">${skillsHTML}</div>
        </section>
    `;
    }

    generateLanguagesSection(languages) {
        if (!languages || languages.length === 0) return '';

        const languagesHTML = languages.map(lang => {
            const languageName = typeof lang === 'string' ? lang : (lang.language || '');
            const languageLevel = typeof lang === 'string' ? '' : (lang.level || '');

            return `
            <div class="language-item">
                <div class="item-header">
                    <span class="item-title">${this.escapeHTML(languageName)}</span>
                    ${languageLevel ? `<span class="item-level">${this.escapeHTML(languageLevel)}</span>` : ''}
                </div>
            </div>
        `;
        }).join('');

        return `
        <section class="cv-section languages-section">
            <h2 class="section-title">${this.getIcon('languages')}Języki</h2>
            <div class="languages-grid">${languagesHTML}</div>
        </section>
    `;
    }

    generateCertificatesSection(certificates) {
        if (!certificates || certificates.length === 0) return '';

        const certificatesHTML = certificates.map((cert, index) => `
        <div class="certificate-item" data-item-index="${index}">
            <div class="item-header">
                <h3 class="item-title">${this.escapeHTML(cert.name || '')}</h3>
                <span class="item-date">${this.escapeHTML(cert.date || '')}</span>
            </div>
            <div class="item-subtitle">${this.escapeHTML(cert.institution || '')}</div>
            <div class="item-description">${this.formatTextWithLineBreaks(cert.description || '')}</div>
        </div>
    `).join('');

        return `
        <section class="cv-section certificates-section">
            <h2 class="section-title">${this.getIcon('certificates')}Certyfikaty</h2>
            ${certificatesHTML}
        </section>
    `;
    }

    generateInterestsSection(interests) {
        if (!interests || interests.length === 0) return '';

        const interestsHTML = interests.map(interest =>
            `<div class="interest-tag">${this.escapeHTML(interest)}</div>`
        ).join('');

        return `
        <section class="cv-section interests-section">
            <h2 class="section-title">${this.getIcon('interests')}Zainteresowania</h2>
            <div class="interests-grid">${interestsHTML}</div>
        </section>
    `;
    }

    generateProjectsSection(projects) {
        if (!projects || projects.length === 0) return '';

        const projectsHTML = projects.map((project, index) => `
        <div class="project-item" data-item-index="${index}">
            <h3 class="item-title">${this.escapeHTML(project.name || '')}</h3>
            <div class="item-description">${this.formatTextWithLineBreaks(project.description || '')}</div>
            ${project.technologies ? `<div class="item-subtitle">Technologie: ${this.escapeHTML(project.technologies)}</div>` : ''}
            ${project.link ? `<div class="item-subtitle">Link: <a href="${this.escapeHTML(project.link)}" target="_blank">${this.escapeHTML(project.link)}</a></div>` : ''}
        </div>
    `).join('');

        return `
        <section class="cv-section projects-section">
            <h2 class="section-title">${this.getIcon('projects')}Projekty</h2>
            ${projectsHTML}
        </section>
    `;
    }

    generateCustomSections(customSections) {
        if (!customSections || customSections.length === 0) return '';

        return customSections.map((section, index) => `
        <section class="cv-section custom-section" data-section-index="${index}">
            <h2 class="section-title">${this.getIcon('summary')}${this.escapeHTML(section.title || '')}</h2>
            <div class="custom-section-content">${this.formatTextWithLineBreaks(section.content || '')}</div>
        </section>
    `).join('');
    }

    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTextWithLineBreaks(text) {
        if (!text) return '';
        return this.escapeHTML(text).replace(/\n/g, '<br>');
    }

    getIcon(iconKey) {
        const icons = {
            gender: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
            birthDate: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`,
            nationality: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
            drivingLicense: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
            phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
            email: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
            address: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
            website: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>`,
            linkedin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>`,
            github: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>`,
            summary: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
            experience: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>`,
            education: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>`,
            skills: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
            languages: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>`,
            certificates: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>`,
            interests: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
            projects: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`
        };

        return icons[iconKey] ? `<span class="icon">${icons[iconKey]}</span>` : '';
    }

    async exportPDF() {
        try {
            this.showLoader();

            const preview = document.getElementById('cvPreview');
            if (!preview || !preview.contentDocument) {
                throw new Error('Podgląd CV nie jest dostępny');
            }

            const srcDoc = preview.contentDocument;
            const cvContainer = srcDoc.querySelector('.cv-pages-container');
            if (!cvContainer) throw new Error('Nie znaleziono zawartości CV');

            const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
            if (!jsPDF) throw new Error('Biblioteka jsPDF nie została załadowana.');

            const serializedHTML = `
            <html>
                <head>
                    ${Array.from(srcDoc.querySelectorAll('link[rel="stylesheet"], style'))
                        .map(el => el.outerHTML)
                        .join('\n')}
                </head>
                <body style="margin:0; background:#fff;">
                    ${cvContainer.outerHTML}
                </body>
            </html>
        `;

            const tempFrame = document.createElement('iframe');
            tempFrame.style.position = 'fixed';
            tempFrame.style.left = '-9999px';
            tempFrame.style.top = '0';
            tempFrame.style.width = '210mm';
            tempFrame.style.border = 'none';
            document.body.appendChild(tempFrame);

            const tempDoc = tempFrame.contentDocument;
            tempDoc.open();
            tempDoc.write(serializedHTML);
            tempDoc.close();

            await new Promise(resolve => {
                tempFrame.onload = async () => {
                    await tempDoc.fonts.ready;
                    setTimeout(resolve, 300);
                };
            });

            const element = tempDoc.body;
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const imgWidth = 210;
            const pageHeight = 297;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pageHeightPx = (pageHeight * canvas.width) / imgWidth;

            let yOffset = 0;
            let pageCount = 0;

            while (yOffset < canvas.height) {
                const pageCanvas = document.createElement('canvas');
                const pageContext = pageCanvas.getContext('2d');

                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.min(pageHeightPx, canvas.height - yOffset);

                pageContext.drawImage(
                    canvas,
                    0, yOffset,
                    canvas.width, pageCanvas.height,
                    0, 0,
                    canvas.width, pageCanvas.height
                );

                const imgData = pageCanvas.toDataURL('image/jpeg', 0.96);

                if (pageCount > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, (pageCanvas.height * imgWidth) / canvas.width);

                yOffset += pageHeightPx;
                pageCount++;
            }

            pdf.save(`CV_${this.cvData.personal.firstName || 'CV'}_${this.cvData.personal.lastName || ''}.pdf`);

            document.body.removeChild(tempFrame);

        } catch (error) {
            console.error('Błąd eksportu PDF:', error);
            this.fallbackPDFExport();
        } finally {
            this.hideLoader();
        }
    }

    async fallbackPDFExport() {
        try {
            const preview = document.getElementById('cvPreview');
            if (!preview) return;

            const cvContainer = preview.contentDocument.querySelector('.cv-pages-container');
            if (!cvContainer) return;

            const canvas = await html2canvas(cvContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            pdf.save(`CV_${this.cvData.personal.firstName || 'CV'}_${this.cvData.personal.lastName || ''}.pdf`);

        } catch (fallbackError) {
            console.error('Błąd awaryjnego eksportu PDF:', fallbackError);
            alert('Nie udało się wyeksportować PDF. Spróbuj użyć opcji drukowania przeglądarki (Ctrl+P).');
        }
    }

    async exportJPG() {
        try {
            const preview = document.getElementById('cvPreview');
            if (!preview) return;

            await new Promise(resolve => {
                if (preview.contentDocument.readyState === 'complete') {
                    resolve();
                } else {
                    preview.onload = resolve;
                }
            });

            if (typeof html2canvas !== 'undefined') {
                const cvPagesContainer = preview.contentDocument.querySelector('.cv-pages-container');

                if (!cvPagesContainer) {
                    alert('Nie znaleziono kontenera CV do eksportu.');
                    return;
                }

                const canvas = await html2canvas(cvPagesContainer, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    width: cvPagesContainer.scrollWidth,
                    height: cvPagesContainer.scrollHeight
                });

                const link = document.createElement('a');
                link.download = `CV_${this.cvData.personal.firstName}_${this.cvData.personal.lastName}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.click();
            } else {
                alert('Biblioteka html2canvas nie jest załadowana. Eksport JPG nie jest możliwy.');
            }
        } catch (error) {
            console.error('Error exporting JPG:', error);
            alert('Błąd podczas eksportu JPG. Spróbuj ponownie.');
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('cvData', JSON.stringify(this.cvData));
        alert('CV zapisane pomyślnie!');
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('cvData');
        if (saved) {
            try {
                const parsedData = JSON.parse(saved);
                this.cvData = this.migrateOldData(parsedData);
                this.populateForm();
                this.setupPresets();
                this.updatePreview();
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                this.cvData = this.getDefaultData();
                this.populateForm();
            }
        }
    }

    loadFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsedData = JSON.parse(event.target.result);
                    this.cvData = this.migrateOldData(parsedData);
                    this.populateForm();
                    this.setupPresets();
                    this.updatePreview();
                    alert('CV załadowane pomyślnie!');
                } catch (error) {
                    alert('Błąd podczas wczytywania pliku.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    populateForm() {
        // Personal info
        const personalFields = [
            'firstName', 'lastName', 'gender', 'birthDate', 'nationality',
            'drivingLicense', 'email', 'phone', 'address', 'website',
            'linkedin', 'github'
        ];

        personalFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = this.cvData.personal[field] || '';
            }
        });

        // Summary
        const summary = document.getElementById('summary');
        if (summary) {
            summary.value = this.cvData.summary || '';
        }

        // Style
        this.updateFormStyles();

        // Render sections
        this.renderSections();
    }
}

// Initialize CV Generator when DOM is loaded
let cvGenerator;
document.addEventListener('DOMContentLoaded', function () {
    cvGenerator = new CVGenerator();
});

// Back button functionality
const backButton = document.querySelector('.back-to-dashboard');
if (backButton) {
    backButton.addEventListener('click', () => {
        console.log('Back to dashboard clicked');
    });
}