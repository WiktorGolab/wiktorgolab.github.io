document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qrInput');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const qrOutput = document.getElementById('qrOutput');
    const qrSizeSelect = document.getElementById('qrSize');
    const qrFormatSelect = document.getElementById('qrFormat');

    function generateQR(text, size = 200) {
        qrOutput.innerHTML = '';
        if (!text) return;
        new QRCode(qrOutput, {
            text: text,
            width: size,
            height: size,
            colorDark: "#f0f0f0",
            colorLight: "#111",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    const defaultURL = 'https://wiktorgolab.github.io';
    qrInput.value = defaultURL;
    generateQR(defaultURL, parseInt(qrSizeSelect.value, 10));

    generateBtn.addEventListener('click', () => {
        const text = qrInput.value.trim();
        const size = parseInt(qrSizeSelect.value, 10);
        generateQR(text, size);
    });

    downloadBtn.addEventListener('click', () => {
        const canvas = qrOutput.querySelector('canvas');
        if (!canvas) return;

        const format = qrFormatSelect.value.toLowerCase();
        const link = document.createElement('a');

        if (format === 'jpeg') {
            link.href = canvas.toDataURL('image/jpeg');
        } else {
            link.href = canvas.toDataURL('image/png');
        }

        link.download = `qr.${format}`;
        link.click();
    });

    const backBtn = document.querySelector('.back-to-dashboard');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.querySelectorAll('.content-item').forEach(c => c.classList.remove('active'));
            const dashboard = document.getElementById('dashboard-content');
            if (dashboard) dashboard.classList.add('active');
            dashboard.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
