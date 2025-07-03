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
      headless: false,// <--- for debugging, set to true for deployment
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0 Safari/537.36'
    );

    //await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    let videoUrl = null;

    // Intercept .mp4 video responses
    page.on('response', async (response) => {
      const contentType = response.headers()['content-type'];
      if (contentType?.includes('video/mp4') && !videoUrl) {
        videoUrl = response.url();
      }
    });

    // Navigate to Instagram reel page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait to ensure video request occurs
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Extract thumbnail using DOM
    const thumbnail = await page.$eval('meta[property="og:image"]', el => el.content);

    // Return real video URL (not blob)
    if (!videoUrl) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      video: videoUrl,
      thumbnail: thumbnail,
    });

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
