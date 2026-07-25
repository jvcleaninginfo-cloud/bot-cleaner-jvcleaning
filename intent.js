// intent.js
// Capisce cosa vuole la cleaner dal testo del messaggio WhatsApp.
// Semplice per ora (parole chiave). Se in futuro serve capire frasi più libere,
// qui è il punto giusto per aggiungere una chiamata all'API di Claude.

const { trovaAppartamento, listaIndirizzi } = require("./data");

function rispondi(testoMessaggio) {
  const testo = (testoMessaggio || "").trim().toLowerCase();

  if (!testo) {
    return messaggioAiuto();
  }

  // Comando: aiuto / menu
  if (testo === "aiuto" || testo === "help" || testo === "menu") {
    return messaggioAiuto();
  }

  // Comando: checklist <indirizzo>
  if (testo.startsWith("checklist")) {
    const indirizzo = testo.replace("checklist", "").trim();
    const app = trovaAppartamento(indirizzo);
    if (!app) return nonTrovato(indirizzo, "checklist");
    return `Checklist per ${capitalize(app.indirizzo)}:\n\n${app.checklist.join("\n")}`;
  }

  // Comando: info <indirizzo> -> mostra tutto insieme (indirizzo, link, cosa fare)
  if (testo.startsWith("info")) {
    const indirizzo = testo.replace("info", "").trim();
    const app = trovaAppartamento(indirizzo);
    if (!app) return nonTrovato(indirizzo, "info");
    return [
      `🏠 ${capitalize(app.indirizzo)}`,
      "",
      `🔗 Accesso: ${app.linkAccesso}`,
      "",
      "✅ Da fare:",
      app.checklist.map(voce => `- ${voce}`).join("\n")
    ].join("\n");
  }

  // Comando: accesso / codice <indirizzo>
  if (testo.startsWith("accesso") || testo.startsWith("codice")) {
    const indirizzo = testo.replace("accesso", "").replace("codice", "").trim();
    const app = trovaAppartamento(indirizzo);
    if (!app) return nonTrovato(indirizzo, "accesso");
    return `Istruzioni di accesso per ${capitalize(app.indirizzo)}:\n${app.linkAccesso}`;
  }

  // Nessun comando riconosciuto
  return `Non ho capito la richiesta.\n\n${messaggioAiuto()}`;
}

function nonTrovato(indirizzo, tipoRichiesta) {
  const indirizzi = listaIndirizzi().map(i => "- " + capitalize(i)).join("\n");
  return `Non trovo l'appartamento "${indirizzo}".\n\nIndirizzi disponibili:\n${indirizzi}\n\nScrivi ad esempio: "${tipoRichiesta} ${listaIndirizzi()[0]}"`;
}

function messaggioAiuto() {
  return [
    "Ciao! Puoi chiedermi:",
    '- "info [indirizzo]" per tutto insieme: link accesso + cosa fare',
    '- "checklist [indirizzo]" solo per la mini checklist',
    '- "accesso [indirizzo]" solo per il link di accesso',
    "",
    "Esempio: info bronzetti"
  ].join("\n");
}

function capitalize(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

module.exports = { rispondi };
