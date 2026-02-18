const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

// Your Free AI Endpoints
const MISTRAL_URL = "https://mistral-ai-three.vercel.app/";
const FLUX_URL = "https://flux-schnell.hello-kaiiddo.workers.dev/img";

// Root check
app.get('/', (req, res) => res.send('Cline Free AI Bridge is Active 🟢'));

// 1. List Models (So Cline sees "mistral-free")
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

// 2. Chat API (Connects to Mistral)
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const messages = req.body.messages || [];
    // Convert conversation to a single prompt string
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    // Generate a random user ID
    const userId = "user_" + crypto.randomUUID().split('-')[0];
    
    // Call the free Mistral endpoint
    const mistralUrl = `${MISTRAL_URL}?id=${userId}&question=${encodeURIComponent(prompt)}`;
    const response = await fetch(mistralUrl);
    
    if (!response.ok) throw new Error('Failed to fetch from Mistral');
    
    const text = await response.text();

    // Return in OpenAI format
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
    res.status(500).json({ error: error.message });
  }
});

// 3. Image API (Connects to Flux)
app.post('/v1/images/generations', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const timestamp = Math.floor(Date.now() / 1000);
    const finalUrl = `${FLUX_URL}?prompt=${encodeURIComponent(prompt)}&t=${timestamp}`;
    
    res.json({
      created: timestamp,
      data: [{ url: finalUrl }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => console.log(`Bridge running on port ${PORT}`));
