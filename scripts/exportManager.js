import { generateDobbleCards } from './dobbleLogic.js';

// Fonction pour télécharger les cartes en PDF
export async function downloadCardsAsPDF(emojiList) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const cards = generateDobbleCards(emojiList);
  const cardsPerPage = 6;
  const cardWidth = 70;
  const cardHeight = 70;
  const margin = 10;
  const spacing = 5;

  for (let i = 0; i < cards.length; i++) {
    if (i > 0 && i % cardsPerPage === 0) {
      pdf.addPage();
    }

    const pageIndex = Math.floor(i / cardsPerPage);
    const cardIndex = i % cardsPerPage;
    const row = Math.floor(cardIndex / 2);
    const col = cardIndex % 2;

    const x = margin + col * (cardWidth + spacing);
    const y = margin + row * (cardHeight + spacing);

    // Dessiner le cercle de la carte
    pdf.setDrawColor(0);
    pdf.circle(x + cardWidth / 2, y + cardHeight / 2, cardWidth / 2);

    // Placer les symboles
    const card = cards[i];
    const centerX = x + cardWidth / 2;
    const centerY = y + cardHeight / 2;
    const radius = cardWidth / 4;

    card.forEach((symbol, index) => {
      const angle = (index * 2 * Math.PI) / card.length;
      let symbolX, symbolY;

      if (index === 0) {
        symbolX = centerX - 4;
        symbolY = centerY + 4;
      } else {
        symbolX = centerX + radius * Math.cos(angle) - 4;
        symbolY = centerY + radius * Math.sin(angle) + 4;
      }

      if (symbol.startsWith("data:image")) {
        // Pour les images personnalisées
        pdf.addImage(symbol, "PNG", symbolX - 3, symbolY - 3, 6, 6);
      } else {
        pdf.setFontSize(12);
        pdf.text(symbol, symbolX, symbolY);
      }
    });
  }

  pdf.save("dobble_cards.pdf");
}

// Fonction pour exporter les cartes en ZIP
export async function exportCardsAsZip(emojiList) {
  const JSZip = window.JSZip;
  const zip = new JSZip();
  const cards = generateDobbleCards(emojiList);

  cards.forEach((card, index) => {
    const canvas = document.createElement("canvas");
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext("2d");

    // Dessiner le fond blanc
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner le cercle de la carte
    ctx.beginPath();
    ctx.arc(125, 125, 120, 0, 2 * Math.PI);
    ctx.stroke();

    // Placer les symboles
    card.forEach((symbol, symbolIndex) => {
      const angle = (symbolIndex * 2 * Math.PI) / card.length;
      const radius = 60;
      let x, y;

      if (symbolIndex === 0) {
        x = 125;
        y = 125;
      } else {
        x = 125 + radius * Math.cos(angle);
        y = 125 + radius * Math.sin(angle);
      }

      if (symbol.startsWith("data:image")) {
        const img = new Image();
        img.src = symbol;
        ctx.drawImage(img, x - 15, y - 15, 30, 30);
      } else {
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(symbol, x, y);
      }
    });

    const imageData = canvas.toDataURL("image/png");
    zip.file(`card_${index + 1}.png`, imageData.split(",")[1], { base64: true });
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dobble_cards.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
