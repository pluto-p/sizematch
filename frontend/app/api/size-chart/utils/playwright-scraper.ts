import { Page } from 'playwright';
import { BrowserManager } from './browser-manager';

// Flag to identify test mode - helps bypass real navigation for tests
let TEST_MODE = false;

/**
 * Set test mode for scraper (used by tests to bypass real navigation)
 */
export function setTestMode(enabled: boolean) {
  TEST_MODE = enabled;
}

/**
 * Scrape size chart data from any retail website using Playwright
 * This approach works with client-rendered content that static HTML scraping can't handle
 */
export async function scrapeSizeChart(url: string, testPage?: Page): Promise<{
  sizeChart?: { [size: string]: { [measurement: string]: number } };
  imageUrl?: string;
  status: 'success' | 'no-size-chart-found' | 'error';
  message?: string;
}> {
  let page: Page | null = null;
  let shouldClosePage = true;
  
  try {
    console.log(`[PlaywrightScraper] Scraping size chart from: ${url}`);
    
    // Use provided test page or create a new one
    if (testPage) {
      page = testPage;
      shouldClosePage = false; // Don't close the page if it was provided by the test
    } else {
      const browserManager = BrowserManager.getInstance();
      page = await browserManager.newPage();
    }
    
    // Set a reasonable timeout for loading pages
    page.setDefaultTimeout(10000);
    
    // Navigate to the URL - skip for test URLs in TEST_MODE
    if (!TEST_MODE || !url.includes('mockurl.example.com')) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Wait for the page to be fully rendered - with a shorter timeout
      try {
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch {
        console.log('[PlaywrightScraper] Network did not become idle, continuing anyway');
      }
    }
    
    // Step 1: Try to extract size chart from the page
    const sizeChart = await extractSizeChartFromPage(page);
    if (sizeChart && Object.keys(sizeChart).length > 0) {
      console.log(`[PlaywrightScraper] Successfully extracted size chart with ${Object.keys(sizeChart).length} sizes`);
      return {
        sizeChart,
        status: 'success'
      };
    }
    
    // Step 2: Look for size chart image
    const imageUrl = await extractSizeChartImage(page);
    if (imageUrl) {
      console.log(`[PlaywrightScraper] Found size chart image: ${imageUrl}`);
      return {
        imageUrl,
        status: 'success'
      };
    }
    
    // Step 3: Look for a size chart link and follow it if found
    // Skip for test URLs in TEST_MODE
    if (!TEST_MODE || !url.includes('mockurl.example.com')) {
      const sizeChartUrl = await findSizeChartLink(page);
      if (sizeChartUrl) {
        console.log(`[PlaywrightScraper] Found size chart link: ${sizeChartUrl}`);
        
        // Navigate to the size chart page
        await page.goto(sizeChartUrl, { waitUntil: 'domcontentloaded' });
        
        try {
          await page.waitForLoadState('networkidle', { timeout: 5000 });
        } catch (e) {
          console.log('[PlaywrightScraper] Network did not become idle on linked page, continuing anyway');
        }
        
        // Try to extract size chart from the new page
        const linkSizeChart = await extractSizeChartFromPage(page);
        if (linkSizeChart && Object.keys(linkSizeChart).length > 0) {
          console.log(`[PlaywrightScraper] Successfully extracted size chart from link with ${Object.keys(linkSizeChart).length} sizes`);
          return {
            sizeChart: linkSizeChart,
            status: 'success'
          };
        }
        
        // Look for size chart image on the new page
        const linkImageUrl = await extractSizeChartImage(page);
        if (linkImageUrl) {
          console.log(`[PlaywrightScraper] Found size chart image on linked page: ${linkImageUrl}`);
          return {
            imageUrl: linkImageUrl,
            status: 'success'
          };
        }
      }
    }
    
    // No size chart found
    return {
      status: 'no-size-chart-found',
      message: 'No size chart found on the page'
    };
    
  } catch (error: any) {
    console.error('[PlaywrightScraper] Error:', error);
    return {
      status: 'error',
      message: error.message || 'Unknown error'
    };
  } finally {
    if (page && shouldClosePage) {
      try {
        await page.close();
      } catch (e) {
        console.log('[PlaywrightScraper] Failed to close page:', e);
      }
    }
  }
}

/**
 * Extract size chart data from the rendered page
 */
async function extractSizeChartFromPage(page: Page): Promise<{ [size: string]: { [measurement: string]: number } } | null> {
  try {
    // Step 1: Try to extract from tables (most common structure)
    const tableData = await extractFromTables(page);
    if (tableData && Object.keys(tableData).length > 0) {
      return tableData;
    }
    
    // Step 2: Try to extract from grid structures
    const gridData = await extractFromGrids(page);
    if (gridData && Object.keys(gridData).length > 0) {
      return gridData;
    }
    
    // Step 3: Look for size chart in JSON format (embedded scripts or JSON-LD)
    const jsonData = await extractFromScripts(page);
    if (jsonData && Object.keys(jsonData).length > 0) {
      return jsonData;
    }
    
    // Step 4: Try to extract from generic div structures
    const divData = await extractFromDivs(page);
    if (divData && Object.keys(divData).length > 0) {
      return divData;
    }
    
    return null;
  } catch (error) {
    console.error('[PlaywrightScraper] Error extracting size chart from page:', error);
    return null;
  }
}

/**
 * Extract size chart from HTML tables
 */
async function extractFromTables(page: Page): Promise<{ [size: string]: { [measurement: string]: number } } | null> {
  try {
    // Find tables that might contain size charts
    const tables = await page.$$('table');
    
    for (const table of tables) {
      // Check if this table is likely a size chart
      const tableText = await table.textContent() || '';
      const tableHtml = await table.evaluate(node => node.outerHTML);
      
      // Determine if this table contains size chart data
      const isSizeChart = 
        /size|small|medium|large|xs|s|m|l|xl/i.test(tableText) &&
        /chest|waist|hip|shoulder|length|sleeve|cm|inch|"/i.test(tableText);
      
      if (isSizeChart) {
        // Extract headers (sizes) and measurements
        const sizeChart: { [size: string]: { [measurement: string]: number } } = {};
        
        // Get all rows
        const rows = await table.$$('tr');
        
        if (rows.length < 2) continue; // Need at least header + data row
        
        // Check if first row contains sizes
        const headerRow = rows[0];
        const headerCells = await headerRow.$$('th, td');
        
        // Extract headers (potential sizes)
        const headers: string[] = [];
        for (let i = 0; i < headerCells.length; i++) {
          const cellText = await headerCells[i].textContent() || '';
          headers.push(cellText.trim());
        }
        
        // First cell is often empty or contains "Size" - we'll use it as measurement name column
        const hasMeasurementNameColumn = headers.length > 0 && 
          (headers[0] === '' || /size|measurement/i.test(headers[0]));
        
        // Process data rows
        for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
          const row = rows[rowIdx];
          const cells = await row.$$('td, th');
          
          if (cells.length < 2) continue;
          
          // First cell is usually the measurement name
          const measurementName = await cells[0].textContent() || '';
          if (!measurementName.trim()) continue;
          
          // Process each size column
          for (let colIdx = 1; colIdx < cells.length; colIdx++) {
            // Skip if we don't have a corresponding header
            if (colIdx >= headers.length) continue;
            
            const size = headers[colIdx];
            if (!size.trim() || /size|measurement/i.test(size)) continue;
            
            const valueText = await cells[colIdx].textContent() || '';
            const valueMatch = valueText.match(/(\d+(\.\d+)?)/);
            
            if (valueMatch) {
              const value = parseFloat(valueMatch[1]);
              if (!isNaN(value)) {
                // Initialize size entry if needed
                if (!sizeChart[size]) sizeChart[size] = {};
                
                // Standardize measurement name
                const stdMeasurement = standardizeMeasurementName(measurementName);
                sizeChart[size][stdMeasurement] = value;
              }
            }
          }
        }
        
        // If we found measurements, return the chart
        if (Object.keys(sizeChart).length > 0) {
          return sizeChart;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[PlaywrightScraper] Error extracting from tables:', error);
    return null;
  }
}

/**
 * Extract size chart from grid-like structures
 */
async function extractFromGrids(page: Page): Promise<{ [size: string]: { [measurement: string]: number } } | null> {
  try {
    console.log('[PlaywrightScraper] Attempting to extract from grid layouts');
    // Find grid-like structures
    const gridSelectors = [
      'div[class*="grid"]',
      'div[class*="row"]',
      'div[style*="display: grid"]',
      'div[style*="display:grid"]',
      'div[class*="size-chart"]',
      'div[class*="sizeChart"]'
    ];
    
    for (const selector of gridSelectors) {
      console.log(`[PlaywrightScraper] Checking selector: ${selector}`);
      const grids = await page.$$(selector);
      console.log(`[PlaywrightScraper] Found ${grids.length} potential grid elements`);
      
      for (const grid of grids) {
        // Check if this grid contains size info
        const gridText = await grid.textContent() || '';
        
        const hasSizeIndicators = /size|small|medium|large|xs|s|m|l|xl/i.test(gridText);
        const hasMeasurementIndicators = /chest|waist|hip|shoulder|length|sleeve|cm|inch|"/i.test(gridText);
        
        if (hasSizeIndicators && hasMeasurementIndicators) {
          console.log('[PlaywrightScraper] Found grid with size and measurement indicators');
          
          // This looks like a size chart grid
          const sizeChart: { [size: string]: { [measurement: string]: number } } = {};
          
          // Extract the HTML for debugging
          const gridHtml = await grid.evaluate(node => node.outerHTML);
          console.log('[PlaywrightScraper] Grid HTML:', gridHtml);
          
          // First approach: Look for explicit headers/sizes
          // For grid layouts that have explicit header rows (like in our test case)
          const headers = await grid.$$('.header, div:first-child > div');
          const sizeHeaders: string[] = [];
          
          // Skip the first header if it's a label like "Measurement"
          for (let i = 0; i < headers.length; i++) {
            const text = await headers[i].textContent() || '';
            const trimmedText = text.trim();
            
            if (i === 0 && /measurement|size/i.test(trimmedText)) {
              continue; // Skip the first header if it's a label
            }
            
            if (/^(xs|s|m|l|xl|xxl|small|medium|large)$/i.test(trimmedText)) {
              sizeHeaders.push(trimmedText.toUpperCase());
            }
          }
          
          console.log('[PlaywrightScraper] Found size headers:', sizeHeaders);
          
          if (sizeHeaders.length > 0) {
            // Initialize size chart with found headers
            for (const size of sizeHeaders) {
              sizeChart[size] = {};
            }
            
            // Extract rows (label + values)
            const rowLabels = await grid.$$('.label');
            
            for (let i = 0; i < rowLabels.length; i++) {
              const label = await rowLabels[i].textContent() || '';
              const measurementName = standardizeMeasurementName(label.trim());
              
              // Find all values for this measurement
              const values = await grid.$$('.value');
              
              // Calculate indices for this row's values
              const valuesPerRow = sizeHeaders.length;
              const startIdx = i * valuesPerRow;
              const endIdx = startIdx + valuesPerRow;
              
              // Extract values for each size
              for (let j = 0; j < sizeHeaders.length && (startIdx + j) < values.length; j++) {
                if (startIdx + j < values.length) {
                  const valueText = await values[startIdx + j].textContent() || '';
                  // Extract numeric value, removing units
                  const numericValue = parseFloat(valueText.replace(/[^\d.]/g, ''));
                  
                  if (!isNaN(numericValue)) {
                    sizeChart[sizeHeaders[j]][measurementName] = numericValue;
                  }
                }
              }
            }
            
            // If we have populated the size chart, return it
            if (Object.keys(sizeChart).length > 0 && 
                Object.values(sizeChart).some(size => Object.keys(size).length > 0)) {
              console.log('[PlaywrightScraper] Successfully extracted from grid layout:', sizeChart);
              return sizeChart;
            }
          }
          
          // Second approach: Fall back to the original implementation for other grid types
          const sizeElements = await grid.$$('div, span');
          const sizes: string[] = [];
          
          for (const element of sizeElements) {
            const text = await element.textContent() || '';
            if (/^(xs|s|m|l|xl|xxl|small|medium|large)$/i.test(text.trim())) {
              sizes.push(text.trim().toUpperCase());
            }
          }
          
          if (sizes.length === 0) continue;
          
          // Initialize size chart
          for (const size of sizes) {
            sizeChart[size] = {};
          }
          
          // Look for measurement rows
          const rows = await grid.$$('div[class*="row"], div > div');
          
          for (const row of rows) {
            const rowText = await row.textContent() || '';
            const measurementMatch = rowText.match(/([a-z\s]+)[\s:]+(\d+(\.\d+)?)/i);
            
            if (measurementMatch) {
              const measurementName = measurementMatch[1].trim();
              const value = parseFloat(measurementMatch[2]);
              
              if (!isNaN(value) && sizes.length > 0) {
                // For simplicity, assume first size
                const size = sizes[0];
                sizeChart[size][standardizeMeasurementName(measurementName)] = value;
              }
            }
          }
          
          if (Object.keys(sizeChart).length > 0 && 
              Object.values(sizeChart).some(size => Object.keys(size).length > 0)) {
            console.log('[PlaywrightScraper] Successfully extracted from generic grid structure:', sizeChart);
            return sizeChart;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[PlaywrightScraper] Error extracting from grids:', error);
    return null;
  }
}

/**
 * Extract size chart from script tags or JSON-LD
 */
async function extractFromScripts(page: Page): Promise<{ [size: string]: { [measurement: string]: number } } | null> {
  try {
    // Look for JSON-LD script tags
    const jsonLdData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '');
          
          // Look for product with size chart
          if (data['@type'] === 'Product' && data.sizeChart) {
            return data.sizeChart;
          }
          
          // Check for nested size chart data
          if (data.product && data.product.sizeChart) {
            return data.product.sizeChart;
          }
        } catch (e) {
          // Continue to next script
        }
      }
      
      // Look for global variables with size chart data
      const possibleVarNames = ['sizeChart', 'size_chart', 'sizeGuide', 'productSizes'];
      
      for (const varName of possibleVarNames) {
        // @ts-ignore
        if (window[varName] && typeof window[varName] === 'object') {
          // @ts-ignore
          return window[varName];
        }
      }
      
      return null;
    });
    
    if (jsonLdData) {
      return processJsonSizeChart(jsonLdData);
    }
    
    // Try to find size chart data in any script
    const scriptData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script:not([src])'));
      
      for (const script of scripts) {
        const content = script.textContent || '';
        
        // Look for JSON objects that might contain size data
        if (content.includes('sizeChart') || content.includes('size_chart') || 
            content.includes('sizeGuide') || content.includes('measurements')) {
          
          try {
            // Try to extract JSON-like objects from the script
            const jsonMatches = content.match(/\{[^{]*"(sizes?|measurements)"[^}]*\}/g);
            
            if (jsonMatches && jsonMatches.length > 0) {
              for (const match of jsonMatches) {
                try {
                  // Try to parse as JSON
                  const data = JSON.parse(match);
                  if (data && typeof data === 'object') {
                    return data;
                  }
                } catch (e) {
                  // Continue to next match
                }
              }
            }
          } catch (e) {
            // Continue to next script
          }
        }
      }
      
      return null;
    });
    
    if (scriptData) {
      return processJsonSizeChart(scriptData);
    }
    
    return null;
  } catch (error) {
    console.error('[PlaywrightScraper] Error extracting from scripts:', error);
    return null;
  }
}

/**
 * Extract size chart from div structures
 */
async function extractFromDivs(page: Page): Promise<{ [size: string]: { [measurement: string]: number } } | null> {
  try {
    // Find div elements that might contain size chart data
    const sizeChart: { [size: string]: { [measurement: string]: number } } = {};
    
    // Get all visible text with measurement patterns
    const measurements = await page.evaluate(() => {
      const measurementRegex = /(\d+(\.\d+)?)\s*(cm|in|″|inch)/gi;
      const results: {text: string, element: string}[] = [];
      
      // Function to check elements recursively
      function checkElement(element: Element) {
        const text = element.textContent || '';
        if (measurementRegex.test(text)) {
          // Element has measurement text
          results.push({
            text,
            element: element.tagName
          });
        }
        
        // Check children
        for (const child of Array.from(element.children)) {
          checkElement(child);
        }
      }
      
      // Start from body
      checkElement(document.body);
      return results;
    });
    
    if (measurements.length > 5) {
      // We found multiple measurements, try to organize them into a size chart
      // This is a simplified approach and would need refinement for production
      
      // Find sizes in the page
      const sizeText = await page.evaluate(() => {
        const sizeRegex = /size\s*(xs|s|m|l|xl|xxl|[0-9]+)/i;
        const results: string[] = [];
        
        document.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6').forEach(el => {
          const text = el.textContent || '';
          const match = text.match(sizeRegex);
          if (match) {
            results.push(match[1].toUpperCase());
          }
        });
        
        return [...new Set(results)]; // Unique sizes
      });
      
      if (sizeText.length > 0) {
        // Initialize size chart with found sizes
        for (const size of sizeText) {
          sizeChart[size] = {};
        }
        
        // For simplicity, assume measurements are for the first size
        const size = sizeText[0];
        
        // Extract measurement values
        let count = 0;
        for (const measurement of measurements) {
          const match = measurement.text.match(/([a-z\s]+)[\s:]+(\d+(\.\d+)?)/i);
          if (match) {
            const name = match[1].trim();
            const value = parseFloat(match[2]);
            
            if (!isNaN(value)) {
              sizeChart[size][standardizeMeasurementName(name)] = value;
              count++;
            }
          }
        }
        
        if (count > 0) {
          return sizeChart;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[PlaywrightScraper] Error extracting from divs:', error);
    return null;
  }
}

/**
 * Extract size chart image URL
 */
async function extractSizeChartImage(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      
      for (const img of images) {
        const alt = img.alt?.toLowerCase() || '';
        const src = img.src || '';
        const parentText = img.parentElement?.textContent?.toLowerCase() || '';
        
        // Check if this is a size chart image
        const isSizeChartImage = 
          alt.includes('size chart') ||
          alt.includes('size guide') ||
          alt.includes('measurement') ||
          parentText.includes('size chart') ||
          parentText.includes('size guide') ||
          parentText.includes('measurement') ||
          src.includes('size-chart') ||
          src.includes('size_chart') ||
          src.includes('sizechart') ||
          src.includes('size-guide');
          
        if (isSizeChartImage && src) {
          return src;
        }
      }
      
      return null;
    });
  } catch (error) {
    console.error('[PlaywrightScraper] Error extracting size chart image:', error);
    return null;
  }
}

/**
 * Find a link to a size chart
 */
async function findSizeChartLink(page: Page): Promise<string | null> {
  try {
    return await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      
      for (const link of links) {
        const href = link.href || '';
        const text = link.textContent?.toLowerCase() || '';
        
        const isSizeChartLink = 
          href.includes('size-chart') ||
          href.includes('size-guide') ||
          href.includes('sizing') ||
          text.includes('size chart') ||
          text.includes('size guide') ||
          text.includes('sizing');
          
        if (isSizeChartLink && href) {
          return href;
        }
      }
      
      return null;
    });
  } catch (error) {
    console.error('[PlaywrightScraper] Error finding size chart link:', error);
    return null;
  }
}

/**
 * Process JSON data into a standardized size chart format
 */
function processJsonSizeChart(data: any): { [size: string]: { [measurement: string]: number } } | null {
  if (!data || typeof data !== 'object') return null;
  
  const result: { [size: string]: { [measurement: string]: number } } = {};
  
  // Handle array format
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.size && item.measurements && typeof item.measurements === 'object') {
        const size = String(item.size);
        result[size] = {};
        
        for (const [key, value] of Object.entries(item.measurements)) {
          if (typeof value === 'number') {
            result[size][key] = value;
          } else if (typeof value === 'string') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              result[size][key] = numValue;
            }
          }
        }
      }
    }
  } 
  // Handle object format
  else {
    for (const [size, measurements] of Object.entries(data)) {
      if (typeof measurements === 'object' && measurements !== null) {
        result[size] = {};
        
        for (const [key, value] of Object.entries(measurements as object)) {
          if (typeof value === 'number') {
            result[size][key] = value;
          } else if (typeof value === 'string') {
            const numValue = parseFloat(value as string);
            if (!isNaN(numValue)) {
              result[size][key] = numValue;
            }
          }
        }
      }
    }
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Standardize measurement names to a common format
 */
function standardizeMeasurementName(name: string): string {
  const nameLower = name.toLowerCase().trim();
  
  if (/chest|bust/i.test(nameLower)) return 'chest';
  if (/waist/i.test(nameLower)) return 'waist';
  if (/hip|seat/i.test(nameLower)) return 'hip';
  if (/shoulder/i.test(nameLower)) return 'shoulder';
  if (/sleeve|arm/i.test(nameLower)) return 'sleeve';
  if (/length|height/i.test(nameLower)) return 'length';
  if (/inseam/i.test(nameLower)) return 'inseam';
  if (/rise/i.test(nameLower)) return 'rise';
  if (/thigh/i.test(nameLower)) return 'thigh';
  if (/neck/i.test(nameLower)) return 'neck';
  
  // Return original if no match
  return nameLower.replace(/\s+/g, '_');
}