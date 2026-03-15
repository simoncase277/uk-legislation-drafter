const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Auth route ────────────────────────────────────────────────────────────
// Accepts a password, checks it against ACCESS_PASSWORD env var.
// Returns a random session token on success.
app.post('/api/auth', (req, res) => {
  const accessPassword = process.env.ACCESS_PASSWORD;

  if (!accessPassword) {
    // No password configured — allow access (useful during initial setup)
    const token = crypto.randomBytes(32).toString('hex');
    return res.json({ success: true, token });
  }

  const { password } = req.body || {};

  if (!password || password !== accessPassword) {
    return res.status(401).json({ success: false });
  }

  const token = crypto.randomBytes(32).toString('hex');
  res.json({ success: true, token });
});

// ── Token validation helper ───────────────────────────────────────────────
function isValidToken(token) {
  return typeof token === 'string' && token.length >= 64;
}

// ── Proxy route ───────────────────────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  // Check access token if a password is configured
  const accessPassword = process.env.ACCESS_PASSWORD;
  if (accessPassword) {
    const token = req.headers['x-access-token'];
    if (!isValidToken(token)) {
      return res.status(401).json({
        error: { message: 'Unauthorised. Please log in again.' }
      });
    }
  }

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
    res.status(response.status).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({
      error: { message: 'Proxy could not reach Anthropic. Please try again.' }
    });
  }
});

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Catch-all ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`UK Legislation Drafter running on port ${PORT}`);
});
