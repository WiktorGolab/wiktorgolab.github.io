// Struktura kategorii
const categories = [{
        id: "all",
        name: "Wszystkie"
    },
    {
        id: "webpage",
        name: "Strony internetowe"
    },
    {
        id: "web",
        name: "Aplikacje Webowe"
    },
    {
        id: "games",
        name: "Gry"
    },
    {
        id: "tools",
        name: "Narzędzia"
    },
    {
        id: "other",
        name: "Inne"
    }
];

// Zmienne globalne
let currentCategory = "all";
let currentSearch = "";
let allProjects = [];