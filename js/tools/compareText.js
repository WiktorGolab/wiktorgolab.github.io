document.addEventListener('DOMContentLoaded', () => {
    const textA = document.getElementById('textA');
    const textB = document.getElementById('textB');
    const compareBtn = document.getElementById('compareBtn');
    const diffOutput = document.getElementById('diffOutput');

    // Dodajemy element na komunikat
    const statusMessage = document.createElement('div');
    statusMessage.id = 'diffStatus';
    statusMessage.style.marginBottom = '10px';
    statusMessage.style.fontWeight = 'bold';
    diffOutput.parentNode.insertBefore(statusMessage, diffOutput);

    function diffWords(oldText, newText) {
        const oldWords = oldText.split(/\s+/);
        const newWords = newText.split(/\s+/);
        let result = "";

        let i = 0, j = 0;
        while (i < oldWords.length || j < newWords.length) {
            if (oldWords[i] === newWords[j]) {
                result += oldWords[i] + " ";
                i++; j++;
            } else if (newWords[j] && !oldWords.includes(newWords[j])) {
                result += `<ins>${newWords[j]}</ins> `;
                j++;
            } else if (oldWords[i] && !newWords.includes(oldWords[i])) {
                result += `<del>${oldWords[i]}</del> `;
                i++;
            } else {
                i++; j++;
            }
        }
        return result.trim();
    }

    compareBtn.addEventListener('click', () => {
        const oldText = textA.value.trim();
        const newText = textB.value.trim();

        if (!oldText && !newText) {
            statusMessage.textContent = "⚠️ Wpisz teksty do porównania.";
            diffOutput.textContent = "";
            return;
        }

        // Sprawdzamy zgodność
        if (oldText === newText) {
            statusMessage.textContent = "Teksty są zgodne";
            statusMessage.style.color = "limegreen";
        } else {
            statusMessage.textContent = "Teksty są niezgodne";
            statusMessage.style.color = "tomato";
        }

        diffOutput.innerHTML = diffWords(oldText, newText);
    });
});
