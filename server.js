const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Proxy route ───────────────────────────────────────────────────────────
// The app sends requests here instead of directly to Anthropic.
// This server adds the secret API key and forwards the request.
app.post('/api/generate', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'Server is missing ANTHROPIC_API_KEY. Please add it in your Render environment variables.' }
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Pass the response (or error) straight back to the browser
    res.status(response.status).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({
      error: { message: 'Proxy could not reach Anthropic. Please try again.' }
    });
  }
});

// ── Health check (Render uses this to verify the server is running) ───────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Catch-all: serve the app for any other route ──────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`UK Legislation Drafter running on port ${PORT}`);
});
