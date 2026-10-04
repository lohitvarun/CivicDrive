const express = require('express');

const router = express.Router();

function localAnswer(question) {
  const s = String(question || '').toLowerCase();

  if (/report.*violation|violation.*report/.test(s)) {
    return 'Open New Report, select the violation type, add the vehicle number, location and incident time, attach evidence if available, then submit. You can track the case under My Reports.';
  }
  if (/pothole|hazard|broken signal|road issue|waterlogging|blockage|streetlight|missing sign/.test(s)) {
    return 'Use Road Hazards to report potholes, damaged signals, waterlogging, blockages, missing signs, streetlight issues and similar problems. Add the location and a photo when possible.';
  }
  if (/challan|fine|penalty/.test(s)) {
    return 'CivicDrive can explain challan information and the payment workflow. For payment or the legally current fine amount, use an authorised official traffic or transport payment channel.';
  }
  if (/status|pending|approved|rejected/.test(s)) {
    return 'Pending means a case is awaiting review, Review means it is being checked, Approved means it has been verified, and Rejected means it was not accepted.';
  }
  if (/certificate/.test(s)) {
    return 'Approved community reports can qualify for a CivicDrive safety certificate in this prototype. Check the Certificates section for available certificates.';
  }
  if (/traffic rule|helmet|seat belt|red light|speed/.test(s)) {
    return 'Traffic rules and penalties can vary and change. I can explain the general safety concept, but current legal requirements should be checked with the applicable official authority.';
  }
  if (/hello|hi|hey/.test(s)) {
    return 'Hello! I’m CivicDrive AI. Ask me about reports, road hazards, challans, certificates or navigating the platform.';
  }

  return 'I can help with CivicDrive features, traffic-safety guidance, report workflows, road hazards, certificates and challan information. Try asking “How do I report a pothole?”';
}

router.post('/', async (req, res) => {
  const question = String(req.body?.message || '').trim();

  if (!question) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // If a Gemini API key is available, use Gemini server-side.
  // Otherwise the CivicDrive-specific local assistant keeps the feature working.
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `You are CivicDrive AI, the assistant for a civic traffic-safety platform.
Help users understand how to use CivicDrive: traffic-violation reports, road-hazard reports,
report statuses, e-challans, certificates, safety insights and emergency alerts.
Be concise, friendly and practical. Do not invent current laws, fines, government procedures,
or official decisions. For legal/current information, tell the user to verify with the relevant
official authority. Do not claim that CivicDrive is an official government authority.

User question:
${question}`;

      const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt
      });

      return res.json({
        reply: interaction.output_text || 'I could not generate a response right now.',
        provider: 'gemini'
      });
    } catch (err) {
      console.error('Gemini request failed:', err.message);
      // Fall back instead of breaking the CivicDrive chatbot.
    }
  }

  return res.json({
    reply: localAnswer(question),
    provider: 'civicdrive-local'
  });
});

module.exports = router;
