window.addEventListener('load', () => {
    const splash = document.getElementById('splash');

    // Odczekaj 3 sekundy po pełnym załadowaniu treści
    setTimeout(() => {
      splash.classList.add('hidden');

      // Po zakończeniu animacji usuń element z DOM
      splash.addEventListener('transitionend', () => splash.remove());
    }, 500);
  });