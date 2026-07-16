'use strict';

const API_URL = process.env.MINIMAX_API_BASE || 'https://api.minimaxi.com/v1/chat/completions';
const MODEL = process.env.MINIMAX_MODEL || 'MiniMax-M2.5-highspeed';
const MAX_MESSAGES = 24;
const MAX_INPUT_CHARS = 40000;

// 允许跨域的来源白名单（GitHub Pages + Vercel 自身 + 本地开发）
const ALLOWED_ORIGINS = [
  'https://swording-k.github.io',
  'https://the-last-bookstore.vercel.app',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000'
];

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // 同源请求（Vercel 自身页面）也允许
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function parseBody(body) {
  if (body && typeof body === 'object') return body;
  if (typeof body === 'string' && body) return JSON.parse(body);
  return {};
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    throw new Error('messages must contain between 1 and 24 items');
  }

  let inputChars = 0;
  const clean = messages.map((message) => {
    if (!message || !['system', 'user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      throw new Error('invalid message');
    }
    inputChars += message.content.length;
    return { role: message.role, content: message.content };
  });

  if (inputChars > MAX_INPUT_CHARS) throw new Error('message content is too long');
  return clean;
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  // 处理预检请求（浏览器跨域 OPTIONS 请求）
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI service is not configured' });

  let body;
  try {
    body = parseBody(req.body);
    body.messages = sanitizeMessages(body.messages);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Invalid request' });
  }

  const payload = {
    model: MODEL,
    messages: body.messages,
    stream: body.stream === true,
    reasoning_split: true,
    temperature: Number.isFinite(body.temperature) ? Math.min(1.5, Math.max(0, body.temperature)) : 0.8,
    top_p: Number.isFinite(body.top_p) ? Math.min(1, Math.max(0, body.top_p)) : 0.9,
    max_tokens: Number.isInteger(body.max_tokens) ? Math.min(1024, Math.max(32, body.max_tokens)) : 512
  };

  let upstream;
  try {
    upstream = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return res.status(502).json({ error: 'AI provider is unavailable' });
  }

  if (!upstream.ok) {
    const providerBody = await upstream.text();
    console.error('[MiniMax proxy]', upstream.status, providerBody.slice(0, 500));
    return res.status(502).json({ error: 'AI provider request failed' });
  }

  if (!payload.stream) {
    const data = await upstream.json();
    return res.status(200).json(data);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');

  if (!upstream.body) return res.end();
  for await (const chunk of upstream.body) res.write(chunk);
  return res.end();
};
