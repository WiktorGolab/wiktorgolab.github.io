document.addEventListener('DOMContentLoaded', () => {
    const palette = document.getElementById('colorPalette');
    const generateBtn = document.getElementById('generateColorsBtn');
    const derivedPalette = document.getElementById('derivedPalette');

    const complementaryBtn = document.getElementById('complementaryBtn');
    const analogousBtn = document.getElementById('analogousBtn');
    const triadicBtn = document.getElementById('triadicBtn');
    const monochromaticBtn = document.getElementById('monochromaticBtn');
    const shadesBtn = document.getElementById('shadesBtn');
    const tintsBtn = document.getElementById('tintsBtn');

    let activeScheme = null;

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
            createColorTile(palette, hex);
        }
    }

    function createColorTile(container, hex) {
        const tile = document.createElement('div');
        tile.className = 'color-tile';
        tile.style.background = hex;
        tile.innerHTML = `<span class="color-label">${hex}</span>`;
        tile.addEventListener('click', (e) => {
            e.stopPropagation();

            colorInput.value = hex;
            updatePickerValues(hex);
            updateDerivedPalette();
        });
        container.appendChild(tile);
    }

    function updateDerivedPalette() {
        if (!activeScheme) return;
        const baseColor = colorInput.value;
        derivedPalette.innerHTML = '';

        switch (activeScheme) {
            case 'complementary':
                createColorTile(derivedPalette, baseColor);
                createColorTile(derivedPalette, getComplementaryColor(baseColor));
                break;

            case 'analogous':
                createColorTile(derivedPalette, baseColor);
                getAnalogousColors(baseColor).forEach(color => createColorTile(derivedPalette, color));
                break;

            case 'triadic':
                createColorTile(derivedPalette, baseColor);
                getTriadicColors(baseColor).forEach(color => createColorTile(derivedPalette, color));
                break;

            case 'monochromatic':
                createColorTile(derivedPalette, baseColor);
                getMonochromaticColors(baseColor).forEach(color => createColorTile(derivedPalette, color));
                break;

            case 'shades':
                createColorTile(derivedPalette, baseColor);
                getShades(baseColor).forEach(color => createColorTile(derivedPalette, color));
                break;

            case 'tints':
                createColorTile(derivedPalette, baseColor);
                getTints(baseColor).forEach(color => createColorTile(derivedPalette, color));
                break;
        }
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return {
            r,
            g,
            b
        };
    }

    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    function getComplementaryColor(hex) {
        const {
            h,
            s,
            l
        } = rgbToHsl(...Object.values(hexToRgb(hex)));
        const complementaryHue = (h + 180) % 360;
        const {
            r,
            g,
            b
        } = hslToRgb(complementaryHue, s, l);
        return rgbToHex(r, g, b);
    }

    function getAnalogousColors(hex, count = 3) {
        const {
            h,
            s,
            l
        } = rgbToHsl(...Object.values(hexToRgb(hex)));
        const colors = [];
        const step = 30;

        for (let i = -Math.floor(count / 2); i <= Math.floor(count / 2); i++) {
            if (i === 0) continue;
            const newHue = (h + i * step + 360) % 360;
            const {
                r,
                g,
                b
            } = hslToRgb(newHue, s, l);
            colors.push(rgbToHex(r, g, b));
        }

        return colors.slice(0, count);
    }

    function getTriadicColors(hex) {
        const {
            h,
            s,
            l
        } = rgbToHsl(...Object.values(hexToRgb(hex)));
        const colors = [];

        for (let i = 1; i <= 2; i++) {
            const newHue = (h + i * 120) % 360;
            const {
                r,
                g,
                b
            } = hslToRgb(newHue, s, l);
            colors.push(rgbToHex(r, g, b));
        }

        return colors;
    }

    function getMonochromaticColors(hex, count = 5) {
        const {
            h,
            s,
            l
        } = rgbToHsl(...Object.values(hexToRgb(hex)));
        const colors = [];
        const step = 100 / (count + 1);

        for (let i = 1; i <= count; i++) {
            const newLightness = Math.max(5, Math.min(95, i * step));
            const {
                r,
                g,
                b
            } = hslToRgb(h, s, newLightness);
            colors.push(rgbToHex(r, g, b));
        }

        return colors;
    }

    function getShades(hex, count = 5) {
        const {
            r: baseR,
            g: baseG,
            b: baseB
        } = hexToRgb(hex);
        const colors = [];
        const step = 100 / (count + 1);

        for (let i = 1; i <= count; i++) {
            const factor = (100 - i * step) / 100;
            const newR = Math.round(baseR * factor);
            const newG = Math.round(baseG * factor);
            const newB = Math.round(baseB * factor);
            colors.push(rgbToHex(newR, newG, newB));
        }

        return colors;
    }

    function getTints(hex, count = 5) {
        const {
            r: baseR,
            g: baseG,
            b: baseB
        } = hexToRgb(hex);
        const colors = [];
        const step = 100 / (count + 1);

        for (let i = 1; i <= count; i++) {
            const factor = i * step / 100;
            const newR = Math.round(baseR + (255 - baseR) * factor);
            const newG = Math.round(baseG + (255 - baseG) * factor);
            const newB = Math.round(baseB + (255 - baseB) * factor);
            colors.push(rgbToHex(newR, newG, newB));
        }

        return colors;
    }

    function setActiveScheme(scheme) {
        activeScheme = scheme;
        updateDerivedPalette();
    }

    complementaryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveScheme('complementary');
    });
    analogousBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveScheme('analogous');
    });
    triadicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveScheme('triadic');
    });
    monochromaticBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveScheme('monochromatic');
    });
    shadesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveScheme('shades');
    });
    tintsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveScheme('tints');
    });

    generateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        generatePalette();
    });
    generatePalette();
});

const colorInput = document.getElementById('colorInput');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');
const hslValue = document.getElementById('hslValue');

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return {
        r,
        g,
        b
    };
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
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
    const {
        r,
        g,
        b
    } = hexToRgb(hex);
    const {
        h,
        s,
        l
    } = rgbToHsl(r, g, b);

    hexValue.value = hex.toUpperCase();
    rgbValue.value = `rgb(${r}, ${g}, ${b})`;
    hslValue.value = `hsl(${h}, ${s}%, ${l}%)`;
}

colorInput.addEventListener('input', (e) => {
    e.stopPropagation();
    updatePickerValues(colorInput.value);
    const derivedColors = document.querySelector('.derived-colors');
    if (derivedColors && derivedColors.querySelector('.palette').children.length > 0) {
        const event = new CustomEvent('colorChanged', {
            detail: colorInput.value
        });
        document.dispatchEvent(event);
    }
});

document.addEventListener('colorChanged', (e) => {
    updatePickerValues(e.detail);
});

document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);

        navigator.clipboard.writeText(input.value).then(() => {
            const originalText = btn.textContent;
            btn.textContent = "✔ Skopiowano";
            setTimeout(() => btn.textContent = originalText, 1000);
        });
    });
});

updatePickerValues(colorInput.value);

document.getElementById('generator-kolorow-content').addEventListener('click', (e) => {
    e.stopPropagation();
});