// filepath: /Users/richard/Documents/Repos/sizematch/frontend/app/api/size-chart/utils/__tests__/integration.test.ts
import { describe, expect, test, jest, beforeEach, afterEach, afterAll } from '@jest/globals';
import { scrapeSizeChart, setTestMode } from '../playwright-scraper';
// Cheerio import removed as it's not used
import { BrowserManager } from '../browser-manager';
import { Page } from 'playwright';

/**
 * Progressive Integration Tests for Size Chart Extraction
 * 
 * These tests are designed to help with development of the Playwright-based size chart scraper.
 * They provide rich debugging output and test real URLs to make development easier.
 * 
 * Tests are structured in steps to isolate and validate each part of the scraping process:
 * 1. Browser Startup - Can we initialize the Playwright browser?
 * 2. Page Navigation - Can we navigate to a URL?
 * 3. DOM Extraction - Can we extract data from rendered DOM?
 * 4. Size Chart Processing - Can we process the data into a structured size chart?
 */

// Store the original fetch function for restoration
const originalFetch = global.fetch;

// URL is intentionally commented out as it's preserved for future tests but not currently used
// const TEST_URL = 'https://www.uniqlo.com/us/en/products/E465185-000/00/size?';

describe('Size Chart Integration Tests - Playwright Approach', () => {
  // Track browser state for proper test cleanup
  let browserManager: BrowserManager;
  let page: Page | null = null;
  
  beforeEach(() => {
    // Set a reasonable timeout for tests
    jest.setTimeout(10000);
    browserManager = BrowserManager.getInstance();
    
    // Enable test mode to skip actual navigation for mock URLs
    setTestMode(true);
  });
  
  afterEach(async () => {
    // Close the page after each test if it hasn't been closed yet
    if (page) {
      try {
        await page.close();
      } catch {
        console.log('Page already closed or unable to close');
      }
      page = null;
    }
    
    // Reset fetch mock if it was modified
    global.fetch = originalFetch;
  });
  
  afterAll(async () => {
    // Clean up browser instance after all tests
    try {
      await browserManager.closeBrowser();
    } catch (error) {
      console.error("Error closing browser:", error);
    }
    
    // Disable test mode
    setTestMode(false);
  });

  /**
   * Testing isolated steps of the scraping process
   */
  describe('Progressive Browser Tests', () => {
    test('1. Browser startup should work', async () => {
      try {
        page = await browserManager.newPage();
        expect(page).toBeDefined();
        console.log('✅ Successfully initialized Playwright browser and created a page');
      } catch (error) {
        console.error('❌ Failed to initialize Playwright browser:', error);
        throw error;
      }
    });
    
    test('2. Page navigation should work', async () => {
      try {
        page = await browserManager.newPage();
        
        // Set a shorter timeout for navigation
        page.setDefaultTimeout(10000);
        
        // Navigate to a lightweight test URL (Google is fast and reliable)
        const testUrl = 'https://www.google.com/';
        console.log(`Navigating to ${testUrl}`);
        
        // Navigation with load state tracking
        const navigationStart = Date.now();
        await page.goto(testUrl, { waitUntil: 'domcontentloaded' });
        console.log(`Basic DOM loaded in ${Date.now() - navigationStart}ms`);
        
        // Verify basic page content
        const title = await page.title();
        expect(title).toContain('Google');
        console.log(`✅ Successfully navigated to ${testUrl} (Title: ${title})`);
        
        // Wait for network to become idle (optional, with short timeout)
        try {
          const networkStart = Date.now();
          await page.waitForLoadState('networkidle', { timeout: 5000 });
          console.log(`Network became idle in ${Date.now() - networkStart}ms`);
        } catch {
          console.log('Network did not become idle within timeout - this is OK for testing');
        }
      } catch (error) {
        console.error('❌ Failed to navigate to test URL:', error);
        throw error;
      }
    });
    
    test('3. DOM extraction should work', async () => {
      try {
        page = await browserManager.newPage();
        page.setDefaultTimeout(10000);
        
        // Use a simple HTML example directly
        await page.setContent(`
          <html>
            <body>
              <h1>Size Chart</h1>
              <table>
                <tr>
                  <th>Size</th>
                  <th>S</th>
                  <th>M</th>
                  <th>L</th>
                </tr>
                <tr>
                  <td>Chest</td>
                  <td>36</td>
                  <td>38</td>
                  <td>40</td>
                </tr>
                <tr>
                  <td>Waist</td>
                  <td>30</td>
                  <td>32</td>
                  <td>34</td>
                </tr>
              </table>
            </body>
          </html>
        `);
        
        // Extract table data using Playwright's DOM querying
        const tableExists = await page.locator('table').count() > 0;
        expect(tableExists).toBe(true);
        console.log('✅ Successfully found table in DOM');
        
        // Extract table text to verify content
        const tableText = await page.locator('table').textContent();
        expect(tableText).toContain('Chest');
        expect(tableText).toContain('36');
        console.log('✅ Successfully extracted text from table:', tableText?.substring(0, 100));
        
        // Test more complex DOM operations
        const sizes = await page.$$eval('table tr:first-child th:not(:first-child)', 
          cells => cells.map(cell => cell.textContent?.trim())
        );
        expect(sizes).toEqual(['S', 'M', 'L']);
        console.log('✅ Successfully extracted sizes:', sizes);
        
        // Test extracting measurements
        const measurements = await page.$$eval('table tr:not(:first-child) td:first-child',
          cells => cells.map(cell => cell.textContent?.trim())
        );
        expect(measurements).toEqual(['Chest', 'Waist']);
        console.log('✅ Successfully extracted measurements:', measurements);
      } catch (error) {
        console.error('❌ Failed to extract data from DOM:', error);
        throw error;
      }
    });
    
    test('4. Size chart processing should work', async () => {
      try {
        // This test focuses on processing DOM data into a structured size chart
        // We'll create simple HTML with a size chart and process it with our scraper
        page = await browserManager.newPage();
        page.setDefaultTimeout(10000);
        
        await page.setContent(`
          <html>
            <body>
              <h1>Size Chart</h1>
              <table>
                <tr>
                  <th>Measurement</th>
                  <th>S</th>
                  <th>M</th>
                  <th>L</th>
                </tr>
                <tr>
                  <td>Chest</td>
                  <td>36</td>
                  <td>38</td>
                  <td>40</td>
                </tr>
                <tr>
                  <td>Waist</td>
                  <td>30</td>
                  <td>32</td>
                  <td>34</td>
                </tr>
                <tr>
                  <td>Sleeve</td>
                  <td>25</td>
                  <td>26</td>
                  <td>27</td>
                </tr>
              </table>
            </body>
          </html>
        `);
        
        // Call our scraper with the test page instead of creating a new one
        const result = await scrapeSizeChart('https://mockurl.example.com', page);
        
        // Verify we got proper size chart data
        expect(result.status).toBe('success');
        expect(result.sizeChart).toBeDefined();
        
        if (result.sizeChart) {
          // Check sizes
          expect(Object.keys(result.sizeChart)).toContain('S');
          expect(Object.keys(result.sizeChart)).toContain('M');
          expect(Object.keys(result.sizeChart)).toContain('L');
          
          // Check measurements for S size
          expect(result.sizeChart.S).toBeDefined();
          expect(result.sizeChart.S.chest).toBe(36);
          expect(result.sizeChart.S.waist).toBe(30);
          expect(result.sizeChart.S.sleeve).toBe(25);
          
          console.log('✅ Successfully processed HTML into structured size chart:');
          console.log(JSON.stringify(result.sizeChart, null, 2));
        }
      } catch (error) {
        console.error('❌ Failed to process size chart data:', error);
        throw error;
      }
    });
  });

  /**
   * End-to-end testing with realistic examples
   * These are skipped by default to avoid external dependencies during CI
   */
  describe('End-to-end Tests', () => {
    test.skip('should extract size chart from a real retailer URL', async () => {
      // Use a lighter-weight retailer site if Uniqlo is too slow
      const testUrl = 'https://www.gap.com/browse/product.do?pid=5464250023032';
      console.log(`Testing scraper with URL: ${testUrl}`);
      
      // Disable test mode for real URLs
      setTestMode(false);
      
      const result = await scrapeSizeChart(testUrl);
      
      // Re-enable test mode for other tests
      setTestMode(true);
      
      // Log the result
      console.log('Scraping result:', JSON.stringify(result, null, 2));
      
      // Check for success or valid failure
      expect(['success', 'no-size-chart-found']).toContain(result.status);
      
      if (result.status === 'success') {
        if (result.sizeChart) {
          console.log(`Found structured size chart with ${Object.keys(result.sizeChart).length} sizes`);
        } else if (result.imageUrl) {
          console.log(`Found size chart image: ${result.imageUrl}`);
        }
      }
    });
  });

  /**
   * Mock-based testing for specific extraction methods
   */
  describe('Extraction Method Tests', () => {
    test('should extract from tables with mixed content', async () => {
      // Create a fresh page for this test
      page = await browserManager.newPage();
      
      // Create complex table with merged cells and mixed content
      await page.setContent(`
        <html>
          <body>
            <h2>Size Guide</h2>
            <table>
              <tr>
                <th colspan="2">Measurement Guide</th>
                <th>XS</th>
                <th>S</th>
                <th>M</th>
              </tr>
              <tr>
                <td rowspan="2">Chest</td>
                <td>Inches</td>
                <td>34-36</td>
                <td>36-38</td>
                <td>38-40</td>
              </tr>
              <tr>
                <td>CM</td>
                <td>86-91</td>
                <td>91-97</td>
                <td>97-102</td>
              </tr>
              <tr>
                <td rowspan="2">Waist</td>
                <td>Inches</td>
                <td>28-30</td>
                <td>30-32</td>
                <td>32-34</td>
              </tr>
              <tr>
                <td>CM</td>
                <td>71-76</td>
                <td>76-81</td>
                <td>81-86</td>
              </tr>
            </table>
          </body>
        </html>
      `);
      
      // Call scraper directly with the prepared page
      const result = await scrapeSizeChart('https://mockurl.example.com', page);
      
      // Check if we extracted data from the complex table
      expect(result.status).toBe('success');
      expect(result.sizeChart).toBeDefined();
      
      console.log('Complex table extraction result:', JSON.stringify(result.sizeChart, null, 2));
    });
    
    test('should extract from grid layouts', async () => {
      // Create a fresh page for this test
      page = await browserManager.newPage();
      
      // Create a size chart in a grid layout rather than a table
      await page.setContent(`
        <html>
          <body>
            <h2>Size Chart</h2>
            <div class="size-chart-grid" style="display: grid; grid-template-columns: repeat(4, 1fr);">
              <div class="header">Measurement</div>
              <div class="header">S</div>
              <div class="header">M</div>
              <div class="header">L</div>
              
              <div class="label">Chest</div>
              <div class="value">36 cm</div>
              <div class="value">38 cm</div>
              <div class="value">40 cm</div>
              
              <div class="label">Waist</div>
              <div class="value">30 cm</div>
              <div class="value">32 cm</div>
              <div class="value">34 cm</div>
              
              <div class="label">Sleeve</div>
              <div class="value">25 cm</div>
              <div class="value">26 cm</div>
              <div class="value">27 cm</div>
            </div>
          </body>
        </html>
      `);
      
      // Call scraper directly with the prepared page
      const result = await scrapeSizeChart('https://mockurl.example.com', page);
      
      // Check if we extracted data from the grid layout
      expect(result.status).toBe('success');
      
      console.log('Grid layout extraction result:', JSON.stringify(result.sizeChart, null, 2));
    });
    
    test('should extract from embedded JSON data', async () => {
      // Create a fresh page for this test
      page = await browserManager.newPage();
      
      // Create HTML with embedded JSON data
      await page.setContent(`
        <html>
          <body>
            <h2>Product Details</h2>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": "Test Product",
              "sizeChart": {
                "S": {
                  "chest": 36,
                  "waist": 30,
                  "sleeve": 25
                },
                "M": {
                  "chest": 38,
                  "waist": 32,
                  "sleeve": 26
                },
                "L": {
                  "chest": 40,
                  "waist": 34,
                  "sleeve": 27
                }
              }
            }
            </script>
          </body>
        </html>
      `);
      
      // Call scraper directly with the prepared page
      const result = await scrapeSizeChart('https://mockurl.example.com', page);
      
      // Check if we extracted data from the JSON
      expect(result.status).toBe('success');
      expect(result.sizeChart).toBeDefined();
      
      if (result.sizeChart && result.sizeChart.S) {
        expect(result.sizeChart.S.chest).toBe(36);
      }
      
      console.log('JSON data extraction result:', JSON.stringify(result.sizeChart, null, 2));
    });
  });
});