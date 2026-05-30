const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data', 'stories');
fs.mkdirSync(DATA_DIR, { recursive: true });

const PROVIDER_URLS = {
  anthropic:   'https://api.anthropic.com/v1/messages',
  openai:      'https://api.openai.com/v1/chat/completions',
  deepseek:    'https://api.deepseek.com/v1/chat/completions',
  gemini:      'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  moonshot:    'https://api.moonshot.cn/v1/chat/completions',
  qwen:        'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  groq:        'https://api.groq.com/openai/v1/chat/completions',
  siliconflow: 'https://api.siliconflow.cn/v1/chat/completions',
};

app.post('/api/chat', async (req, res) => {
  const { provider = 'anthropic', apiKey, model, system, messages, max_tokens = 1000 } = req.body;

  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(400).json({ error: { message: '请提供 API Key（在页面右上角 AI设置 中配置）' } });
  }

  const url = PROVIDER_URLS[provider] || PROVIDER_URLS.openai;

  try {
    let headers, body;

    if (provider === 'anthropic') {
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      };
      body = { model, max_tokens, system, messages };
    } else {
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      };
      const oaiMessages = system
        ? [{ role: 'system', content: system }, ...messages]
        : messages;
      body = { model, max_tokens, messages: oaiMessages };
    }

    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await r.json();

    if (provider !== 'anthropic' && data.choices) {
      return res.status(r.status).json({
        content: [{ text: data.choices[0]?.message?.content || '' }]
      });
    }
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
