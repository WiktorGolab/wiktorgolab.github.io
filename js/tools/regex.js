document.addEventListener('DOMContentLoaded', () => {
    const regexInput = document.getElementById('regexInput');
    const textInput = document.getElementById('textInput');
    const checkBtn = document.getElementById('checkRegexBtn');
    const output = document.getElementById('regexOutput');
    const status = document.getElementById('regexStatus');
    const regexGlobal = document.getElementById('regexGlobal');
    const regexCase = document.getElementById('regexCase');

    function highlightMatches(text, regex) {
        return text.replace(regex, match => `<mark>${match}</mark>`);
    }

    checkBtn.addEventListener('click', () => {
        const text = textInput.value;
        const pattern = regexInput.value;

        if (!pattern) {
            status.textContent = "Wprowadź wyrażenie regularne";
            status.style.color = 'tomato';
            output.innerHTML = '';
            return;
        }

        let flags = '';
        if (regexGlobal.checked) flags += 'g';
        if (regexCase.checked) flags += 'i';

        let regex;
        try {
            regex = new RegExp(pattern, flags);
        } catch (e) {
            status.textContent = "❌ Błąd w wyrażeniu regularnym: " + e.message;
            status.style.color = 'tomato';
            output.innerHTML = '';
            return;
        }

        const matches = text.match(regex);
        if (matches && matches.length > 0) {
            status.textContent = `Znaleziono ${matches.length} dopasowań`;
            status.style.color = 'limegreen';
        } else {
            status.textContent = "Brak dopasowań";
            status.style.color = 'orange';
        }

        output.innerHTML = highlightMatches(text, regex);
    });
});
