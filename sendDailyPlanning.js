// sendDailyPlanning.js
// Legge il planning del giorno da Google Sheets, raggruppa gli appartamenti per cleaner
// e invia un messaggio WhatsApp personalizzato a ognuna tramite Twilio.

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const twilio = require('twilio');

// ==== CONFIGURAZIONE (da impostare come variabili d'ambiente su Railway) ====
const SPREADSHEET_ID = process.env.PLANNING_SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

function formatDateItaliano(date) {
  const gg = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${gg}-${mm}-${yyyy}`;
}

async function getSheetsDoc() {
  const jwt = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
  await doc.loadInfo();
  return doc;
}

async function leggiAnagraficaCleaner(doc) {
  const sheet = doc.sheetsByTitle['Anagrafica Cleiner'];
  const rows = await sheet.getRows();
  const anagrafica = {};
  for (const row of rows) {
    const nome = (row.get('CLEANER') || '').trim().toUpperCase();
    const numero = (row.get('NUMERO WHATSAPP') || '').trim();
    if (nome && numero) anagrafica[nome] = numero;
  }
  return anagrafica;
}

async function leggiPlanningGiorno(doc, nomeFoglioMese, dataOggi) {
  const sheet = doc.sheetsByTitle[nomeFoglioMese];
  const rows = await sheet.getRows();

  const righeGiorno = [];
  let dataCorrente = null;

  for (const row of rows) {
    const dataCell = (row.get('DATA') || '').trim();
    if (dataCell) dataCorrente = dataCell;

    if (dataCorrente === dataOggi) {
      righeGiorno.push({
        cliente: (row.get('CLIENTE') || '').trim(),
        indirizzo: (row.get('APPARTAMENTO') || '').trim(),
        nota: (row.get('NOTA') || '').trim(),
        cleaner: (row.get('CLEANER') || '').trim().toUpperCase(),
      });
    }
  }
  return righeGiorno;
}

function raggruppaPerCleaner(righe) {
  const gruppi = {};
  for (const riga of righe) {
    const nomi = riga.cleaner.split('-').map((n) => n.trim()).filter(Boolean);
    for (const nome of nomi) {
      if (!gruppi[nome]) gruppi[nome] = [];
      gruppi[nome].push(riga);
    }
  }
  return gruppi;
}

function componiMessaggio(nomeCleaner, appartamenti) {
  let testo = `🧹 Buongiorno ${nomeCleaner}! Ecco i tuoi appartamenti di oggi:\n\n`;
  appartamenti.forEach((app, i) => {
    testo += `${i + 1}. 🏠 ${app.cliente}\n📍 ${app.indirizzo}\n`;
    if (app.nota) testo += `📝 ${app.nota}\n`;
    testo += `👉 Scrivi "info ${app.indirizzo}" per il codice di accesso\n`;
    testo += `\n`;
  });
  return testo.trim();
}
async function inviaPlanningDelGiorno(nomeFoglioMese, opzioni = {}) {
  const dryRun = !!opzioni.dryRun; // se true, NON invia davvero su WhatsApp, solo anteprima

  const doc = await getSheetsDoc();
  const oggi = formatDateItaliano(new Date());

  const anagrafica = await leggiAnagraficaCleaner(doc);
  const righeOggi = await leggiPlanningGiorno(doc, nomeFoglioMese, oggi);
  const gruppi = raggruppaPerCleaner(righeOggi);

  const risultati = [];

  for (const [nomeCleaner, appartamenti] of Object.entries(gruppi)) {
    const numero = anagrafica[nomeCleaner];
    const messaggio = componiMessaggio(nomeCleaner, appartamenti);

    if (!numero) {
      risultati.push({ cleaner: nomeCleaner, stato: 'SALTATO - numero non trovato in anagrafica', messaggio });
      continue;
    }

    if (dryRun) {
      risultati.push({ cleaner: nomeCleaner, numero, stato: 'ANTEPRIMA (non inviato)', messaggio });
      continue;
    }

    try {
      await twilioClient.messages.create({
        from: TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${numero}`,
        body: messaggio,
      });
      risultati.push({ cleaner: nomeCleaner, stato: 'INVIATO', numAppartamenti: appartamenti.length });
    } catch (err) {
      risultati.push({ cleaner: nomeCleaner, stato: `ERRORE: ${err.message}` });
    }
  }

  return risultati;
  }

module.exports = { inviaPlanningDelGiorno };
