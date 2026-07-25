// data.js
// Per ora questi dati sono scritti a mano qui dentro.
// In futuro questa funzione verrà sostituita con una lettura da Google Sheets,
// senza dover toccare il resto del codice (vedi googleSheets.js quando lo aggiungeremo).

// Ogni appartamento ha:
// - indirizzo: per cercarlo
// - linkAccesso: il link che il cliente (Just Urban) fornisce con le istruzioni di accesso
// - checklist: mini lista, solo i punti essenziali
const APARTMENTS_JUST_URBAN = [
  {
    indirizzo: "via giulio cesare 20",
    linkAccesso: "https://www.justurbanstays.com/guest/check-in-instructions?preview=1&id_instr=be835b993f6aa151107fc6db18257000",
    checklist: [
      "🧴 Riempire i due dispenser in bagno",
      "🔑 Controlla e fai le foto delle chiavi",
      "📸 Prima di uscire: fai foto a tutto l'appartamento",
      "🪟 Abbassa le tapparelle",
      "💡 Spegni luci e aria condizionata"
    ]
  },
  {
    indirizzo: "via bronzetti",
    linkAccesso: "https://esempio-just-urban.com/accesso/via-bronzetti",
    checklist: [
      "🧴 Riempire i due dispenser in bagno",
      "🔑 Controlla e fai le foto delle chiavi",
      "📸 Prima di uscire: fai foto a tutto l'appartamento",
      "🪟 Abbassa le tapparelle",
      "💡 Spegni luci e aria condizionata"
    ]
  },
  {
    indirizzo: "via roma 12",
    linkAccesso: "https://esempio-just-urban.com/accesso/via-roma-12",
    checklist: [
      "Cambio lenzuola e asciugamani",
      "Bagno e cucina puliti",
      "Pavimenti aspirati e lavati",
      "Foto finale nel gruppo WhatsApp"
    ]
  },
  {
    indirizzo: "corso buenos aires 45",
    linkAccesso: "https://esempio-just-urban.com/accesso/corso-buenos-aires-45",
    checklist: [
      "Cambio lenzuola e asciugamani",
      "Bagno e cucina puliti",
      "Pavimenti aspirati e lavati",
      "Foto finale nel gruppo WhatsApp"
    ]
  },
  {
    indirizzo: "viale monza 8",
    linkAccesso: "https://esempio-just-urban.com/accesso/viale-monza-8",
    checklist: [
      "Cambio lenzuola e asciugamani",
      "Bagno e cucina puliti",
      "Pavimenti aspirati e lavati",
      "Foto finale nel gruppo WhatsApp"
    ]
  }
];

// Cerca un appartamento per indirizzo (case-insensitive, match parziale)
function trovaAppartamento(testoIndirizzo) {
  const query = testoIndirizzo.trim().toLowerCase();
  if (!query) return null;
  return APARTMENTS_JUST_URBAN.find(a => a.indirizzo.includes(query) || query.includes(a.indirizzo));
}

function listaIndirizzi() {
  return APARTMENTS_JUST_URBAN.map(a => a.indirizzo);
}

module.exports = { trovaAppartamento, listaIndirizzi };
