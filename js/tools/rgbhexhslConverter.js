document.addEventListener('DOMContentLoaded', () => {
    const hexInput = document.getElementById('hexInput');
    const rgbInput = document.getElementById('rgbInput');
    const hslInput = document.getElementById('hslInput');
    const preview = document.getElementById('colorPreview');

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
        const num = parseInt(hex, 16);
        return [num >> 16 & 255, num >> 8 & 255, num & 255];
    }

    function rgbToHex(r, g, b) {
        return (
            '#' +
            [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
        );
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [
            Math.round(h * 360),
            Math.round(s * 100) + '%',
            Math.round(l * 100) + '%'
        ];
    }

    function hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        let r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
    }

    function updatePreview(color) {
        preview.style.background = color;
    }

    hexInput.addEventListener('input', () => {
        const val = hexInput.value.trim();
        if (!/^#?[0-9A-Fa-f]{3,6}$/.test(val)) return;
        const [r,g,b] = hexToRgb(val);
        rgbInput.value = `${r},${g},${b}`;
        const [hh,ss,ll] = rgbToHsl(r,g,b);
        hslInput.value = `${hh},${ss},${ll}`;
        updatePreview(rgbToHex(r,g,b));
    });

    rgbInput.addEventListener('input', () => {
        const parts = rgbInput.value.split(',').map(x => parseInt(x.trim(), 10));
        if (parts.length !== 3 || parts.some(isNaN)) return;
        const [r,g,b] = parts;
        hexInput.value = rgbToHex(r,g,b);
        const [hh,ss,ll] = rgbToHsl(r,g,b);
        hslInput.value = `${hh},${ss},${ll}`;
        updatePreview(rgbToHex(r,g,b));
    });

    hslInput.addEventListener('input', () => {
        const parts = hslInput.value.split(',').map(x => x.trim());
        if (parts.length !== 3) return;
        const h = parseFloat(parts[0]);
        const s = parseFloat(parts[1]);
        const l = parseFloat(parts[2]);
        if ([h,s,l].some(isNaN)) return;
        const [r,g,b] = hslToRgb(h,s,l);
        hexInput.value = rgbToHex(r,g,b);
        rgbInput.value = `${r},${g},${b}`;
        updatePreview(rgbToHex(r,g,b));
    });

    hexInput.value = '#ff0000';
    hexInput.dispatchEvent(new Event('input'));
});
