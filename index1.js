const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing Instagram URL' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('video', { timeout: 10000 });

    const result = await page.evaluate(() => {
      const video = document.querySelector('video');
      const thumb = document.querySelector('meta[property="og:image"]');
      return {
        video: video?.src ?? null,
        thumbnail: thumb?.content ?? null,
      };
    });

    if (!result.video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(result);
  } catch (err) {
    console.error('Scraping error:', err);
    res.status(500).json({ error: 'Scraping failed' });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper server running on http://localhost:${PORT}`);
});
