const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data', 'stories');
fs.mkdirSync(DATA_DIR, { recursive: true });

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: '服务器未配置 ANTHROPIC_API_KEY，请在 .env 文件中设置' } });
  }
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: { message: e.message } });
  }
});

app.get('/api/stories', (_req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const stories = files.map(f => {
      const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      return {
        id: f.replace('.json', ''),
        title: d.title,
        savedAt: d.savedAt,
        charCount: (d.chars || []).length,
        logCount: (d.log || []).length
      };
    }).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    res.json(stories);
  } catch {
    res.json([]);
  }
});

app.post('/api/stories', (req, res) => {
  const id = 'story_' + Date.now();
  const story = { ...req.body, savedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(DATA_DIR, id + '.json'), JSON.stringify(story, null, 2));
  res.json({ id });
});

app.get('/api/stories/:id', (req, res) => {
  try {
    const file = path.join(DATA_DIR, req.params.id + '.json');
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch {
    res.status(404).json({ error: '故事不存在' });
  }
});

app.delete('/api/stories/:id', (req, res) => {
  try {
    fs.unlinkSync(path.join(DATA_DIR, req.params.id + '.json'));
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: '故事不存在' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✓ 群像叙事服务已启动: http://localhost:${PORT}`));
