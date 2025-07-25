import express from 'express';
import { chromium } from 'playwright';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  console.log('Received URL:', url); // Add this

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Page loaded'); // Add this

    // await page.waitForTimeout(3000);

    // const videoElement = await page.$('video');
    // let videoUrl = null;

    // if (videoElement) {
    //   videoUrl = await videoElement.getAttribute('src');
    //   console.log('Video URL:', videoUrl);
    // }
    //new edited line starts
    let videoUrl = null;
    await page.waitForTimeout(3000);

    try {
    await page.waitForSelector('video', { timeout: 10000 });
    const videoElement = await page.$('video');
    if (videoElement) {
    videoUrl = await videoElement.getAttribute('src');
    console.log('Video URL:', videoUrl);
            }
    } catch (e) {
      console.warn('Video element not found within timeout');
      }

    //new edited line ends
    const thumbnail = await page.$eval('meta[property="og:image"]', el => el.content);
    console.log('Thumbnail URL:', thumbnail);

    await browser.close();

    if (!videoUrl) {
      return res.status(404).json({ error: 'Video not found' });
    }

    return res.json({ videoUrl, thumbnail });
  } catch (err) {
    console.error('Error during scraping:', err);
    return res.status(500).json({ error: 'Scraping failed', details: err.toString() });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
