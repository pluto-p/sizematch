/**
 * This script captures HTML from the Uniqlo size chart page
 * Run with: npx ts-node capture-uniqlo-html.ts
 */
import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uniqlo product URL to capture
const UNIQLO_URL = 'https://www.uniqlo.com/us/en/products/E465185-000/00/size?';

// Path to save the captured HTML
const OUTPUT_PATH = path.join(__dirname, 'app/api/size-chart/utils/__tests__/fixtures/uniqlo-size-chart-live.html');

async function captureHtml() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log(`Navigating to ${UNIQLO_URL}...`);
    await page.goto(UNIQLO_URL, { waitUntil: 'networkidle' });
    console.log('Page loaded successfully');
    
    // Capture the HTML content
    const html = await page.content();
    
    // Save to file
    await fs.writeFile(OUTPUT_PATH, html);
    console.log(`HTML content saved to ${OUTPUT_PATH}`);
    
    // Also save a screenshot for reference
    const screenshotPath = OUTPUT_PATH.replace('.html', '.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    return html;
  } catch (error) {
    console.error('Error capturing HTML:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

// Run the capture
captureHtml()
  .then(() => console.log('HTML capture completed successfully'))
  .catch(err => console.error('Failed to capture HTML:', err))
  .finally(() => process.exit());
