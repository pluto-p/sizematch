import { expect, test, describe, beforeAll, afterAll, jest, beforeEach, afterEach } from '@jest/globals';
import { Page, chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { UniqloScraper } from '../retailers/uniqlo';

// The actual Uniqlo product URL to test navigation
const LIVE_UNIQLO_URL = 'https://www.uniqlo.com/us/en/products/E465185-000/00';
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const HTML_OUTPUT_PATH = path.join(FIXTURES_DIR, 'uniqlo-size-chart-live.html');

describe('Playwright Navigation Tests', () => {
  let page: Page;
  
  beforeAll(async () => {
    // Ensure fixtures directory exists
    await fs.mkdir(FIXTURES_DIR, { recursive: true }).catch(() => {});
  });
  
  beforeEach(async () => {
    // Create a fresh browser instance exactly like in the capture script
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    });
    
    page = await context.newPage();
    
    // Extend the default timeout for real-world navigation
    jest.setTimeout(60000); // Using a longer timeout to be safe
  });
  
  afterEach(async () => {
    // Clean up after each test
    if (page) {
      // Close the browser context and browser
      const context = page.context();
      const browser = context.browser();
      
      await page.close();
      await context.close();
      if (browser) await browser.close();
      
      console.log('Browser closed after test');
    }
  });
  
  afterAll(async () => {
    console.log('All tests completed');
  });
  
  // This test specifically focuses on step 3: Page Navigation with Playwright
  // Marking as skipped due to unreliable network conditions with external sites
  test.skip('can navigate to Uniqlo size chart page', async () => {
    // Create Uniqlo scraper to get the size chart URL
    const uniqloScraper = new UniqloScraper();
    const sizeChartUrl = await uniqloScraper.getSizeChartUrl(LIVE_UNIQLO_URL);
    
    // Verify we got a URL
    expect(sizeChartUrl).toBeDefined();
    expect(typeof sizeChartUrl).toBe('string');
    
    // The actual navigation test - Step 3 of our flow
    try {
      console.log(`Navigating to Uniqlo size chart URL: ${sizeChartUrl}`);
      const response = await page.goto(sizeChartUrl!, { 
        waitUntil: 'networkidle',
        timeout: 30000 // Allow a longer timeout for real-world conditions
      });
      
      // Verify the response
      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);
      
      // Verify the page contains the expected content
      const title = await page.title();
      console.log(`Page title: ${title}`);
      expect(title).toContain('UNIQLO');
      
      // Save the HTML content for other tests
      const html = await page.content();
      await fs.writeFile(HTML_OUTPUT_PATH, html);
      console.log(`Saved Uniqlo size chart HTML to: ${HTML_OUTPUT_PATH}`);
      
      // Take a screenshot for reference
      const screenshotPath = HTML_OUTPUT_PATH.replace('.html', '.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Saved screenshot to: ${screenshotPath}`);
      
      // Verify we can find the size chart table
      const sizeChartTable = await page.$('table.fr-ec-data-table');
      expect(sizeChartTable).not.toBeNull();
      
    } catch (error) {
      console.error('Navigation failed:', error);
      throw error;
    }
  });
  
  // Optional: Add a test that verifies we can handle navigation errors gracefully
  test.skip('handles navigation errors gracefully', async () => {
    // Intentionally use an invalid URL
    const invalidUrl = 'https://invalid.uniqlo.example.com/nonexistent';
    
    try {
      // Navigation should throw an error
      await page.goto(invalidUrl, { timeout: 10000 });
      // If we get here, something went wrong
      fail('Navigation to invalid URL did not fail as expected');
    } catch (error: any) {
      // This is expected behavior
      expect(error).toBeDefined();
      console.log('Successfully caught navigation error:', error.message);
    }
  });
});
