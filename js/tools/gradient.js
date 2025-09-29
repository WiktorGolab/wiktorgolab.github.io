document.addEventListener('DOMContentLoaded', () => {
    const typeSelect     = document.getElementById('gradientType');
    const dirSelect      = document.getElementById('gradientDirection');
    const shapeSelect    = document.getElementById('radialShape');
    const track          = document.getElementById('stopsTrack');
    const preview        = document.getElementById('gradientPreview');
    const cssPreview     = document.getElementById('cssPreview');
    const addStopBtn     = document.getElementById('addStop');
    const copyCssBtn     = document.getElementById('copyCss');

    const linearOpts = document.querySelector('.linear-options');
    const radialOpts = document.querySelector('.radial-options');

    let stops = [
        { color: '#ff0000', position: 0 },
        { color: '#0000ff', position: 100 }
    ];

    function buildCSS() {
        const sorted = [...stops].sort((a,b)=>a.position-b.position);
        const colorStops = sorted.map(s => `${s.color} ${s.position}%`).join(', ');
        if (typeSelect.value === 'linear') {
            return `linear-gradient(${dirSelect.value}, ${colorStops})`;
        } else {
            return `radial-gradient(${shapeSelect.value}, ${colorStops})`;
        }
    }

    function updatePreview() {
        const css = buildCSS();
        preview.style.background = css;
        track.style.background = css;
        cssPreview.textContent = `background: ${css};`;
        renderStops();
    }

    function renderStops() {
        track.innerHTML = '';
        stops.forEach((stop, idx) => {
            const dot = document.createElement('div');
            dot.className = 'stop-dot';
            dot.style.left = stop.position + '%';
            dot.style.background = stop.color;

            let drag = false;
            dot.addEventListener('mousedown', () => drag = true);
            window.addEventListener('mouseup', () => drag = false);
            window.addEventListener('mousemove', e => {
                if (!drag) return;
                const rect = track.getBoundingClientRect();
                let pos = ((e.clientX - rect.left) / rect.width) * 100;
                pos = Math.max(0, Math.min(100, pos));
                stop.position = pos;
                updatePreview();
            });

            dot.addEventListener('click', e => {
                e.stopPropagation();
                const input = document.createElement('input');
                input.type = 'color';
                input.value = stop.color;
                input.style.position = 'absolute';
                input.style.left = '-9999px';
                document.body.appendChild(input);
                input.click();
                input.addEventListener('input', () => {
                    stop.color = input.value;
                    updatePreview();
                });
                input.addEventListener('blur', () => input.remove());
            });

            dot.addEventListener('contextmenu', e => {
                e.preventDefault();
                if (stops.length > 2) {
                    stops.splice(idx,1);
                    updatePreview();
                }
            });

            track.appendChild(dot);
        });
    }

    addStopBtn.addEventListener('click', () => {
        stops.push({ color: '#ffffff', position: 50 });
        updatePreview();
    });

    copyCssBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(cssPreview.textContent).then(() => {
            copyCssBtn.textContent = 'Skopiowano!';
            setTimeout(()=> copyCssBtn.textContent = 'Kopiuj CSS',1500);
        });
    });

    typeSelect.addEventListener('input', () => {
        const linear = typeSelect.value === 'linear';
        linearOpts.classList.toggle('hidden', !linear);
        radialOpts.classList.toggle('hidden', linear);
        updatePreview();
    });

    dirSelect.addEventListener('input', updatePreview);
    shapeSelect.addEventListener('input', updatePreview);

    updatePreview();
});
