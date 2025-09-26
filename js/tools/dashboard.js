document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('tileSearch');
    const tileSort = document.getElementById('tileSort');
    const dashboardGrid = document.getElementById('dashboardGrid');
    const tiles = dashboardGrid.querySelectorAll('.tile');

    // Mapa tytułów kafelków -> id sekcji
    const tileToSectionMap = {
        "Generator kodu QR": "generator-qr-content",
        "Generator Lorem Ipsum": "generator-lorem-content",
        "Generator kolorów": "generator-kolorow-content",
        "Konwertuj HEX RGB HSL": "Konwertuj-hex-rgb-hsl-content",
        "Porównaj tekst": "porownaj-tekst-content",
        "Sprawdź Regex": "sprawdz-regex-content",
        "Stwórz gradient": "stworz-gradient-content",
        "Zmień rozmiar obrazu": "zmien-rozmiar-obrazu-content"
    };

    // Filtr kafelków
    function filterTiles() {
        const query = searchInput.value.toLowerCase();
        tiles.forEach(tile => {
            const title = tile.dataset.title.toLowerCase();
            tile.style.display = title.includes(query) ? 'flex' : 'none';
        });
    }

    // Sortowanie kafelków
    function sortTiles() {
        const tilesArray = Array.from(tiles);
        const sortValue = tileSort.value;
        let sortedTiles = tilesArray.slice();

        if (sortValue === 'alphabetical') {
            sortedTiles.sort((a, b) => a.dataset.title.localeCompare(b.dataset.title));
        } else if (sortValue === 'reverse') {
            sortedTiles.sort((a, b) => b.dataset.title.localeCompare(a.dataset.title));
        }

        sortedTiles.forEach(tile => dashboardGrid.appendChild(tile));
    }

    // Podpinanie kliknięcia kafelków do sekcji
    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            const sectionId = tileToSectionMap[tile.dataset.title];
            if (sectionId) {
                // Ukryj wszystkie content-item
                document.querySelectorAll('.content-item').forEach(c => c.classList.remove('active'));
                // Pokaż wybraną sekcję
                const targetSection = document.getElementById(sectionId);
                if (targetSection) targetSection.classList.add('active');
                // Przewiń do góry (opcjonalnie)
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Eventy wyszukiwania i sortowania
    searchInput.addEventListener('input', () => filterTiles());
    tileSort.addEventListener('change', () => sortTiles());

    // ✅ Domyślnie sortuj alfabetycznie
    tileSort.value = 'alphabetical';
    sortTiles();
});
