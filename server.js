const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

// Aapke Free URLs
const MISTRAL_URL = "https://mistral-ai-three.vercel.app/";
const FLUX_URL = "https://flux-schnell.hello-kaiiddo.workers.dev/img";

// Root route checks
app.get('/', (req, res) => res.send('Cline Proxy Server is Running!'));

// 1. Models List (Cline needs this to know "mistral-free" exists)
app.get('/v1/models', (req, res) => {
  res.json({
    object: "list",
    data: [{
      id: "mistral-free",
      object: "model",
      created: Date.now(),
      owned_by: "user"
    }]
  });
});

// 2. Chat Completions (Forward to Mistral)
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const messages = req.body.messages;
    // Prompt ko simple string mein convert karte hain
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    // User ID generate karein (random)
    const userId = "user_" + crypto.randomUUID().split('-')[0];
    
    // Mistral URL par request bhejein
    // URL Format: .../?id={user_id}&question={question_param}
    const mistralUrl = `${MISTRAL_URL}?id=${userId}&question=${encodeURIComponent(prompt)}`;
    
    const response = await fetch(mistralUrl);
    if (!response.ok) throw new Error('Mistral API Error');
    
    const text = await response.text();

    // OpenAI Format mein wapas bhejein
    res.json({
      id: "chatcmpl-" + crypto.randomUUID(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: req.body.model || "mistral-free",
      choices: [{
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: "stop"
      }]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Proxy Error: " + error.message });
  }
});

// 3. Image Generation (Forward to Flux)
app.post('/v1/images/generations', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Flux URL banayein
    const finalUrl = `${FLUX_URL}?prompt=${encodeURIComponent(prompt)}&t=${timestamp}`;
    
    // Direct URL return karein
    res.json({
      created: timestamp,
      data: [{ url: finalUrl }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server Start
const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
