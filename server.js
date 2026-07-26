// server.js
// Server che riceve i messaggi WhatsApp inoltrati da Twilio e risponde.
//
// Quando avrai un account Twilio, dovrai solo:
// 1. npm install
// 2. npm start (o ospitarlo su Railway/Render)
// 3. Nel pannello Twilio, impostare "When a message comes in" = https://tuo-dominio/webhook

const express = require("express");
const { rispondi } = require("./intent");
const { inviaPlanningDelGiorno } = require("./sendDailyPlanning");
const app = express();
app.use(express.urlencoded({ extended: false })); // Twilio manda dati come form, non JSON
app.use(express.json());

// Endpoint che Twilio chiamerà ad ogni messaggio WhatsApp ricevuto
app.post("/webhook", (req, res) => {
  const testoMessaggio = req.body.Body || "";
  const mittente = req.body.From || "sconosciuto";

  console.log(`[Messaggio ricevuto da ${mittente}]: ${testoMessaggio}`);

  const rispostaTesto = rispondi(testoMessaggio);

  // Formato TwiML richiesto da Twilio per rispondere ai messaggi WhatsApp
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(rispostaTesto)}</Message>
</Response>`;

  res.type("text/xml").send(twiml);
});

// Endpoint di test rapido da browser/curl, senza passare da Twilio
app.get("/test", (req, res) => {
  const testoMessaggio = req.query.msg || "";
  res.json({ richiesta: testoMessaggio, risposta: rispondi(testoMessaggio) });
});

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const PORT = process.env.PORT || 3000;
// Endpoint per inviare davvero il planning di oggi via WhatsApp a tutte le cleaner
app.get("/invia-planning-oggi", async (req, res) => {
  const nomeFoglio = req.query.foglio || "LUGLIO 2026";
  try {
    const risultati = await inviaPlanningDelGiorno(nomeFoglio);
    res.json({ ok: true, risultati });
  } catch (err) {
    res.status(500).json({ ok: false, errore: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`Bot JVCLEANING in ascolto sulla porta ${PORT}`);
  console.log(`Prova subito: http://localhost:${PORT}/test?msg=checklist via roma 12`);
});
