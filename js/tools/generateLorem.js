document.addEventListener('DOMContentLoaded', () => {
    const loremType   = document.getElementById('loremType');
    const loremAmount = document.getElementById('loremAmount');
    const generateBtn = document.getElementById('generateLoremBtn');
    const copyBtn     = document.getElementById('copyLoremBtn');
    const loremOutput = document.getElementById('loremOutput');

    const loremWords = (
    "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor " +
    "incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud " +
    "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute " +
    "irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla " +
    "pariatur Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia " +
    "deserunt mollit anim id est laborum Curabitur pretium tincidunt lacus Nulla gravida " +
    "orci a odio Nullam varius turpis et commodo pharetra est eros bibendum elit nec " +
    "lacinia erat quam eu magna Proin porttitor orci non libero scelerisque blandit " +
    "Praesent euismod purus at turpis condimentum feugiat Vivamus fermentum semper " +
    "porta Nunc diam velit adipiscing ut tristique vitae sagittis vel odio Maecenas " +
    "convallis ullamcorper ultricies Curabitur ornare consequat nunc Aenean vel metus " +
    "Ut posuere viverra nulla Aliquam erat volutpat Pellentesque habitant morbi " +
    "tristique senectus et netus et malesuada fames ac turpis egestas Maecenas id " +
    "nisi id erat feugiat euismod Aenean sollicitudin imperdiet arcu Donec cursus " +
    "urna sit amet aliquam placerat Praesent dapibus neque id cursus faucibus " +
    "tortor neque egestas aug ue eu vulputate magna eros eu erat Aliquam erat volutpat " +
    "Nam dui mi tincidunt quis accumsan porttitor facilisis luctus metus Phasellus " +
    "ultrices nulla quis nibh Aliquam fermentum dolor Nulla non arcu lacinia neque " +
    "faucibus fringilla Sed sit amet sem vitae urna fringilla tempus Vivamus vel " +
    "metus Ut ultricies imperdiet sapien Curabitur vitae semper sem Mauris sit amet " +
    "volutpat ligula Nulla facilisi Integer lacinia sollicitudin massa Cras metus " +
    "Sed aliquet risus a tortor Integer id quam Morbi mi Quisque nisl felis venenatis " +
    "tristique dignissim sit amet adipiscing nec leo Maecenas malesuada Praesent " +
    "congue erat at massa Sed cursus turpis vitae tortor Donec posuere vulputate arcu " +
    "Phasellus accumsan cursus velit Vestibulum ante ipsum primis in faucibus orci " +
    "luctus et ultrices posuere cubilia Curae Sed aliquam nisi quis porttitor congue " +
    "nisl est mattis libero eget vestibulum risus nisl sit amet est Nulla facilisi"
    ).split(/\s+/);

    function randomSentence() {
        const len = Math.floor(Math.random() * 8) + 8;
        const words = [];
        for (let i = 0; i < len; i++) {
            let w = loremWords[Math.floor(Math.random() * loremWords.length)];
            words.push(i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w);
        }
        return words.join(" ") + ".";
    }

    function randomParagraph() {
        const sentenceCount = Math.floor(Math.random() * 3) + 3;
        const sentences = [];
        for (let i = 0; i < sentenceCount; i++) sentences.push(randomSentence());
        return sentences.join(" ");
    }

    function generateLorem() {
        const amount = parseInt(loremAmount.value, 10);
        let output = "";

        switch (loremType.value) {
            case "paragraphs":
                for (let i = 0; i < amount; i++) output += randomParagraph() + "\n\n";
                break;
            case "sentences":
                for (let i = 0; i < amount; i++) output += randomSentence() + " ";
                break;
            case "words":
                for (let i = 0; i < amount; i++) {
                    output += loremWords[Math.floor(Math.random() * loremWords.length)] + " ";
                }
                break;
        }

        loremOutput.textContent = output.trim();
    }

    generateBtn.addEventListener('click', generateLorem);

    copyBtn.addEventListener('click', () => {
        if (!loremOutput.textContent.trim()) return;
        navigator.clipboard.writeText(loremOutput.textContent.trim())
            .then(() => {
                copyBtn.textContent = "Skopiowano!";
                setTimeout(() => copyBtn.textContent = "Kopiuj", 1500);
            });
    });

    generateLorem();
});
