import { expect, test, describe, beforeAll } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { UniqloScraper } from '../retailers/uniqlo';

// Path to the captured HTML file (already captured and stored)
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const UNIQLO_HTML_PATH = path.join(FIXTURES_DIR, 'uniqlo-size-chart-live.html');

describe('Uniqlo Offline Scraper Tests', () => {
  let html: string;
  
  beforeAll(async () => {
    // Load the real HTML from file - we expect this file to exist
    try {
      html = await fs.readFile(UNIQLO_HTML_PATH, 'utf-8');
      console.log('Loaded Uniqlo HTML from captured file');
    } catch (error) {
      console.error('Error loading Uniqlo HTML file:', error);
      throw new Error('Unable to load Uniqlo HTML file. Make sure you have run the capture-uniqlo-html.ts script first.');
    }
  });
  
  // Test the URL generation
  test('generates proper size chart URL from product URL', async () => {
    const uniqloScraper = new UniqloScraper();
    const productUrl = 'https://www.uniqlo.com/us/en/products/E465185-000/00';
    const sizeChartUrl = await uniqloScraper.getSizeChartUrl(productUrl);
    
    expect(sizeChartUrl).toBeDefined();
    expect(sizeChartUrl).toBe('https://www.uniqlo.com/us/en/products/E465185-000/00/size?');
  });
  
  // Test the extraction logic with offline HTML
  test('extracts size chart data from captured HTML', async () => {
    const uniqloScraper = new UniqloScraper();
    const mockUrl = 'https://www.uniqlo.com/us/en/products/E465185-000/00/size?';
    
    // Process the HTML directly
    const result = await uniqloScraper.handleSizeChartFromHtml(html, mockUrl);
    
    // Verify the extraction was successful
    expect(result.success).toBe(true);
    expect(result.sizeChart).toBeDefined();
    
    if (result.sizeChart) {
      // Verify we have sizes
      const sizes = Object.keys(result.sizeChart);
      expect(sizes.length).toBeGreaterThan(0);
      console.log('Extracted sizes:', sizes);
      
      // Take the first size and verify it has measurements
      const firstSize = sizes[0];
      const measurements = Object.keys(result.sizeChart[firstSize]);
      expect(measurements.length).toBeGreaterThan(0);
      console.log('Extracted measurements for size', firstSize, ':', measurements);
      
      // Verify measurement values are numbers
      const firstMeasurement = measurements[0];
      expect(typeof result.sizeChart[firstSize][firstMeasurement]).toBe('number');
    }
  });
  
  // Test the full offline flow
  test('performs the full scraping flow with offline HTML', async () => {
    const uniqloScraper = new UniqloScraper();
    const productUrl = 'https://www.uniqlo.com/us/en/products/E465185-000/00';
    
    // Step 1: Generate size chart URL
    const sizeChartUrl = await uniqloScraper.getSizeChartUrl(productUrl);
    expect(sizeChartUrl).toBeDefined();
    
    // Step 2: Process the HTML (skipping navigation)
    const result = await uniqloScraper.handleSizeChartFromHtml(html, sizeChartUrl!);
    
    // Verify the result
    expect(result.success).toBe(true);
    expect(result.sizeChart).toBeDefined();
    
    if (result.sizeChart) {
      // Print out the first size for reference
      const sizes = Object.keys(result.sizeChart);
      if (sizes.length > 0) {
        console.log(`Sample data for size ${sizes[0]}:`, result.sizeChart[sizes[0]]);
      }
    }
  });
});
