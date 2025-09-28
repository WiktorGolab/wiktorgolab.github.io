document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('imageInput');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const formatSelect = document.getElementById('formatSelect');
    const processAllBtn = document.getElementById('processAllBtn');
    const previewList = document.getElementById('previewList');
    const sizeRadios = document.querySelectorAll('input[name="sizeMode"]');

    let files = [];

    // --- Drag & Drop ---
    function handleFiles(selected) {
        for (let f of selected) {
            if (f.type.startsWith('image/')) files.push(f);
        }
        renderPreviews();
    }

    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    // --- Podgląd ---
    function renderPreviews() {
        previewList.innerHTML = '';
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.src = ev.target.result;
                img.onload = () => {
                    const container = document.createElement('div');
                    container.className = 'preview-item';

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Przycisk pobierz
                    const downloadBtn = document.createElement('button');
                    downloadBtn.textContent = 'Pobierz';
                    downloadBtn.addEventListener('click', () => processAndDownload(img, canvas));

                    // Przycisk usuń
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = '✕';
                    removeBtn.className = 'remove-btn';
                    removeBtn.addEventListener('click', () => {
                        files.splice(index, 1); // usuń z tablicy
                        renderPreviews(); // przerysuj kolejkę
                    });

                    container.appendChild(canvas);
                    container.appendChild(downloadBtn);
                    container.appendChild(removeBtn);
                    previewList.appendChild(container);
                };
            };
            reader.readAsDataURL(file);
        });
    }


    // --- Przetwarzanie pojedynczego obrazu ---
    function processAndDownload(img, canvas) {
        const mode = [...sizeRadios].find(r => r.checked).value;
        const format = formatSelect.value;
        let w = parseInt(widthInput.value);
        let h = parseInt(heightInput.value);

        if (mode === 'percent') {
            w = Math.round(img.width * (w / 100));
            h = Math.round(img.height * (h / 100));
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const link = document.createElement('a');
        link.href = canvas.toDataURL(`image/${format}`);
        link.download = `resized-${Date.now()}.${format}`;
        link.click();
    }

    // --- Przetwarzanie wszystkich obrazów do ZIP ---
    processAllBtn.addEventListener('click', async () => {
        if (files.length === 0) return;

        // Jeżeli tylko jeden obraz, pobierz normalnie
        if (files.length === 1) {
            const canvas = previewList.querySelector('canvas');
            const img = new Image();
            img.src = canvas.toDataURL();
            img.onload = () => processAndDownload(img, canvas);
            return;
        }

        // Wiele obrazów -> ZIP
        const zip = new JSZip();
        const mode = [...sizeRadios].find(r => r.checked).value;
        const format = formatSelect.value;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const dataURL = await resizeImage(file, mode);
            const base64 = dataURL.split(',')[1]; // usuń prefix
            zip.file(`image-${i + 1}.${format}`, base64, {
                base64: true
            });
        }

        zip.generateAsync({
            type: "blob"
        }).then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `images-${Date.now()}.zip`;
            link.click();
        });
    });

    // --- Funkcja do zmiany rozmiaru obrazu ---
    function resizeImage(file, mode) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = ev => {
                const img = new Image();
                img.src = ev.target.result;
                img.onload = () => {
                    let w = parseInt(widthInput.value);
                    let h = parseInt(heightInput.value);
                    if (mode === 'percent') {
                        w = Math.round(img.width * (w / 100));
                        h = Math.round(img.height * (h / 100));
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL(`image/${formatSelect.value}`));
                };
            };
            reader.readAsDataURL(file);
        });
    }

    // Back to dashboard
    const backBtn = document.querySelector('#zmien-rozmiar-obrazu-content .back-to-dashboard');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.querySelectorAll('.content-item').forEach(c => c.classList.remove('active'));
            const dash = document.getElementById('dashboard-content');
            if (dash) dash.classList.add('active');
            dash.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});