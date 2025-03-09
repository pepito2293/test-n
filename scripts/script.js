import { defaultEmojis, loadEmojiList, saveEmojiList } from './dobbleLogic.js';
import { generateCards, updatePreview, populateEmojiTable, initializeUIEvents } from './uiManager.js';
import { downloadCardsAsPDF, exportCardsAsZip } from './exportManager.js';

// Initialisation de la liste d'émojis
let emojiList = loadEmojiList();

// Fonction pour réinitialiser un émoji
function resetEmoji(index) {
    if (index < defaultEmojis.length) {
        emojiList[index] = defaultEmojis[index];
        saveEmojiList(emojiList);
        populateEmojiTable(emojiList);
        generateCards(emojiList);
    }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    populateEmojiTable(emojiList);
    generateCards(emojiList);
    initializeUIEvents(emojiList, resetEmoji);

    // Gestion des événements pour les curseurs de taille
    document.querySelectorAll("#minSize, #maxSize").forEach(input => {
        input.addEventListener("input", () => {
            updatePreview();
            generateCards(emojiList);
        });
    });

    // Gestion de l'upload d'image
    document.getElementById("imageUpload").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const customEmoji = e.target.result;
                const selectedCell = document.querySelector(".selected-cell");
                if (selectedCell) {
                    const index = Array.from(selectedCell.parentNode.children).indexOf(selectedCell);
                    emojiList[index] = customEmoji;
                    saveEmojiList(emojiList);
                    populateEmojiTable(emojiList);
                    generateCards(emojiList);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Gestion des exports
    document.getElementById("downloadPDF").addEventListener("click", () => downloadCardsAsPDF(emojiList));
    document.getElementById("downloadZIP").addEventListener("click", () => exportCardsAsZip(emojiList));

    // Plugin tout réinitialiser
    document.getElementById("resetAll").addEventListener("click", () => {
        if (confirm("Voulez-vous vraiment réinitialiser tous les émojis ?")) {
            emojiList = [...defaultEmojis];
            saveEmojiList(emojiList);
            populateEmojiTable(emojiList);
            generateCards(emojiList);
        }
    });
});
