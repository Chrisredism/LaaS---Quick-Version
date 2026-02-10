import express from 'express';
import cors from 'cors';
import logger from './logger.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/lie', async (req, res) => {
  const url = 'curl https://lies-as-a-service.onrender.com/lie';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      return res.status(502).json({
        error: { message: 'Upstream API error', status: response.status },
      });
    }

    const data = await response.json();
    return res.json({ lie: data.lie, category: data.category });
  } catch {
    return res.status(502).json({ error: { message: 'Failed to fetch lie' } });
  } finally {
    clearTimeout(timeoutId);
  }
});

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
