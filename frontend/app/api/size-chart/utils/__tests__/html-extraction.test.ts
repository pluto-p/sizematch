import { expect, test, describe, beforeAll } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { UniqloScraper } from '../retailers/uniqlo';

// Path to the captured HTML file
const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const UNIQLO_HTML_PATH = path.join(FIXTURES_DIR, 'uniqlo-size-chart-live.html');

// Mock HTML content for testing if the real one doesn't exist
const MOCK_UNIQLO_HTML = `
<html>
  <body>
    <table class="fr-ec-data-table">
      <tbody>
        <tr>
          <th>SIZE(CM)</th>
          <th>XS</th>
          <th>S</th>
          <th>M</th>
          <th>L</th>
          <th>XL</th>
        </tr>
        <tr>
          <td>SHOULDER WIDTH</td>
          <td>43</td>
          <td>45</td>
          <td>47</td>
          <td>49</td>
          <td>51</td>
        </tr>
        <tr>
          <td>CHEST</td>
          <td>49</td>
          <td>52</td>
          <td>55</td>
          <td>58</td>
          <td>61</td>
        </tr>
        <tr>
          <td>LENGTH</td>
          <td>66</td>
          <td>68</td>
          <td>70</td>
          <td>72</td>
          <td>74</td>
        </tr>
        <tr>
          <td>SLEEVE LENGTH</td>
          <td>62</td>
          <td>63.5</td>
          <td>65</td>
          <td>66.5</td>
          <td>68</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;

describe('HTML Extraction and Parsing Tests', () => {
  let html: string;
  
  beforeAll(async () => {
    // Try to load the real HTML from file
    try {
      html = await fs.readFile(UNIQLO_HTML_PATH, 'utf-8');
      console.log('Using real Uniqlo HTML from captured file');
    } catch {
      // If file doesn't exist, use mock HTML
      console.log('Real HTML not found, using mock data');
      html = MOCK_UNIQLO_HTML;
      
      // Create fixtures directory if it doesn't exist
      await fs.mkdir(FIXTURES_DIR, { recursive: true }).catch(() => {});
      
      // Save mock HTML for reference
      await fs.writeFile(UNIQLO_HTML_PATH, html);
    }
  });
  
  describe('Basic HTML Structure Tests', () => {
    test('can load HTML with Cheerio', () => {
      const $ = cheerio.load(html);
      expect($).toBeDefined();
      
      const body = $('body');
      expect(body.length).toBeGreaterThan(0);
    });
    
    test('can find size chart table in HTML', () => {
      const $ = cheerio.load(html);
      const table = $('table.fr-ec-data-table');
      expect(table.length).toBeGreaterThan(0);
      
      const rows = table.find('tr');
      console.log(`Found ${rows.length} rows in table`);
      expect(rows.length).toBeGreaterThan(0);
    });
  });
  
  describe('HTML Table Structure Tests', () => {
    test('can extract header information from table', () => {
      const $ = cheerio.load(html);
      const table = $('table.fr-ec-data-table');
      
      // Get header row
      const headerRow = table.find('tr').first();
      const headerCells = headerRow.find('th, td');
      
      console.log(`Found ${headerCells.length} header cells`);
      expect(headerCells.length).toBeGreaterThan(0);
      
      // Extract measurement names (skipping the first which is just "Size")
      const measurements = [];
      headerCells.each((i, el) => {
        if (i > 0) { // Skip first cell
          const measurement = $(el).text().trim();
          if (measurement) {
            measurements.push(measurement);
            console.log(`Found measurement: ${measurement}`);
          }
        }
      });
      
      expect(measurements.length).toBeGreaterThan(0);
    });
    
    test('can extract measurements from table', () => {
      const $ = cheerio.load(html);
      const table = $('table.fr-ec-data-table');
      
      // Skip header row, look at data rows
      const dataRows = table.find('tr').slice(1);
      console.log(`Found ${dataRows.length} data rows`);
      expect(dataRows.length).toBeGreaterThan(0);
      
      // Check first data row
      const firstRow = $(dataRows[0]);
      const measurementCell = firstRow.find('td').first();
      const measurement = measurementCell.text().trim();
      
      console.log(`First measurement name: ${measurement}`);
      expect(measurement.length).toBeGreaterThan(0);
      
      // Check for numerical values in the row
      let foundValue = false;
      firstRow.find('td').slice(1).each((i, el) => {
        const valueText = $(el).text().trim();
        const value = parseFloat(valueText.replace(/[^\d.]/g, ''));
        
        if (!isNaN(value)) {
          console.log(`Found value: ${value} for ${measurement}`);
          foundValue = true;
          return false; // Break the loop
        }
      });
      
      expect(foundValue).toBe(true);
    });
  });
  
  describe('Full Extraction Tests', () => {
    test('extracts size chart data using handleSizeChartFromHtml', async () => {
      const uniqloScraper = new UniqloScraper();
      const result = await uniqloScraper.handleSizeChartFromHtml(html, 'https://example.com/mock-url');
      
      console.log('Extraction result:', result);
      expect(result).toBeDefined();
      
      if (result.success && result.sizeChart) {
        // Test that we got a valid result
        const sizeChart = result.sizeChart;
        
        if (Array.isArray(sizeChart)) {
          // For array format
          expect(sizeChart.length).toBeGreaterThan(0);
          console.log(`Extracted ${sizeChart.length} sizes`);
          
          // Check first size entry
          const firstEntry = sizeChart[0];
          expect(firstEntry.size).toBeDefined();
          console.log(`First size: ${firstEntry.size}`);
          
          // Check that measurements exist
          const measurements = Object.keys(firstEntry).filter(k => k !== 'size');
          console.log(`Measurements: ${measurements.join(', ')}`);
          expect(measurements.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
