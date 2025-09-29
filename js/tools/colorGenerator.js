document.addEventListener('DOMContentLoaded', () => {
    const palette = document.getElementById('colorPalette');
    const generateBtn = document.getElementById('generateColorsBtn');

    function randomHex() {
        return '#' + Math.floor(Math.random() * 0xffffff)
            .toString(16)
            .padStart(6, '0')
            .toUpperCase();
    }

    function generatePalette(count = 9) {
        palette.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const hex = randomHex();
            const tile = document.createElement('div');
            tile.className = 'color-tile';
            tile.style.background = hex;
            tile.innerHTML = `<span class="color-label">${hex}</span>`;
            tile.addEventListener('click', () => {
                navigator.clipboard.writeText(hex).then(() => {
                    tile.querySelector('.color-label').textContent = `${hex} ✔`;
                    setTimeout(() => {
                        tile.querySelector('.color-label').textContent = hex;
                    }, 800);
                });
            });
            palette.appendChild(tile);
        }
    }

    generateBtn.addEventListener('click', () => generatePalette());
    generatePalette();
});

const colorInput = document.getElementById('colorInput');
const hexValue   = document.getElementById('hexValue');
const rgbValue   = document.getElementById('rgbValue');
const hslValue   = document.getElementById('hslValue');

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max + min) / 2;

    if(max === min){
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function updatePickerValues(hex) {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);

    hexValue.value = hex.toUpperCase();
    rgbValue.value = `rgb(${r}, ${g}, ${b})`;
    hslValue.value = `hsl(${h}, ${s}%, ${l}%)`;
}

colorInput.addEventListener('input', () => {
    updatePickerValues(colorInput.value);
});

updatePickerValues(colorInput.value);
