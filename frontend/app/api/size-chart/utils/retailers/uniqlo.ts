import { Page } from 'playwright';
import { RetailerScraper, SizeChartData, SizeChartResult, standardizeMeasurementName } from './retailer-scraper';
import * as cheerio from 'cheerio';

/**
 * Uniqlo-specific implementation of size chart scraping
 */
export class UniqloScraper implements RetailerScraper {
  /**
   * Extract product ID from Uniqlo URL and construct size chart URL
   */
  async getSizeChartUrl(url: string, productId?: string | null): Promise<string | null> {
    console.log(`[Uniqlo] Processing URL: ${url}`);
    
    // If product ID is directly provided, use it
    if (productId) {
      console.log(`[Uniqlo] Using provided product ID: ${productId}`);
      return `https://www.uniqlo.com/us/en/products/${productId}/00/size?`;
    }
    
    try {
      // Extract product ID from URL patterns
      // Pattern: /products/E{NUMBER}-{NUMBER}/{VARIANT}
      const productPattern = /\/products\/([A-Z]\d+(?:-\d+)?(?:\/\d+)?)/i;
      const match = url.match(productPattern);
      
      if (match && match[1]) {
        const extractedId = match[1];
        console.log(`[Uniqlo] Extracted product ID: ${extractedId}`);
        
        // For Uniqlo, we'll use the original URL or the size chart URL
        // Depending on whether it already contains "size" in the path
        if (url.includes('/size')) {
          return url;
        } else if (extractedId.includes('/')) {
          // ID already has variant, add size to URL
          return `https://www.uniqlo.com/us/en/products/${extractedId}/size?`;
        } else {
          // No variant in ID, use default variant 00
          return `https://www.uniqlo.com/us/en/products/${extractedId}/00/size?`;
        }
      }
      
      console.log('[Uniqlo] Could not extract product ID from URL');
      return null;
    } catch (error) {
      console.error('[Uniqlo] Error extracting product ID:', error);
      return null;
    }
  }
  
  /**
   * Extract size chart data from Uniqlo's page
   * Specifically targets the table with class fr-ec-data-table
   */
  async extractSizeChart(page: Page): Promise<SizeChartData | null> {
    try {
      console.log('[UniqloScraper] Extracting size chart from Uniqlo page');
      
      // Wait for the size chart table to be present in the DOM
      // Uniqlo uses a table with class fr-ec-data-table for their size charts
      const tableSelector = 'table.fr-ec-data-table';
      
      try {
        await page.waitForSelector(tableSelector, { timeout: 5000 });
      } catch (e) {
        console.log('[UniqloScraper] Size chart table not found:', e);
        return null;
      }
      
      // Extract the size chart data
      const sizeChart = await page.evaluate((selector) => {
        const table = document.querySelector(selector);
        if (!table) return null;
        
        const result: { [size: string]: { [measurement: string]: number } } = {};
        
        // Extract headers (sizes)
        const headerRow = table.querySelector('tr');
        if (!headerRow) return null;
        
        const headers: string[] = [];
        const headerCells = headerRow.querySelectorAll('th');
        
        // Start from index 1 to skip the first header (which is usually empty or "Size")
        for (let i = 1; i < headerCells.length; i++) {
          const headerText = headerCells[i].textContent?.trim() || '';
          if (headerText) {
            headers.push(headerText);
          }
        }
        
        if (headers.length === 0) return null;
        
        // Process each data row
        const rows = table.querySelectorAll('tr');
        
        // Start from index 1 to skip the header row
        for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
          const row = rows[rowIdx];
          const cells = row.querySelectorAll('td');
          
          if (cells.length < 2) continue;
          
          // First cell contains the measurement name
          const measurementName = cells[0].textContent?.trim() || '';
          if (!measurementName) continue;
          
          // Process each size column (starting from index 1)
          for (let colIdx = 1; colIdx < cells.length && (colIdx - 1) < headers.length; colIdx++) {
            const size = headers[colIdx - 1];
            const valueText = cells[colIdx].textContent?.trim() || '';
            
            // Extract numeric value
            const numericValue = parseFloat(valueText.replace(/[^\d.]/g, ''));
            
            if (!isNaN(numericValue)) {
              // Initialize size if needed
              if (!result[size]) {
                result[size] = {};
              }
              
              // Store the measurement with standardized name
              // We'll standardize names here directly in the browser context
              const standardizedName = measurementName.toLowerCase()
                .replace('body length back', 'length')
                .replace('body length', 'length')
                .replace('shoulder width', 'shoulder')
                .replace('body width', 'chest')
                .replace('sleeve length (center back)', 'sleeve')
                .replace('sleeve length', 'sleeve')
                .replace(/\s+/g, '_');
              
              result[size][standardizedName] = numericValue;
            }
          }
        }
        
        return Object.keys(result).length > 0 ? result : null;
      }, tableSelector);
      
      return sizeChart;
    } catch (error) {
      console.error('[UniqloScraper] Error extracting size chart:', error);
      return null;
    }
  }
  
  /**
   * Process HTML content to extract size chart data
   * This is a complementary method that can be used for unit testing without a browser
   */
  // URL parameter is kept for API compatibility but not currently used
  async handleSizeChartFromHtml(html: string, url: string): Promise<SizeChartResult> {
    try {
      console.log('[Uniqlo] Attempting to extract size chart data from HTML');
      
      // Load HTML
      const $ = cheerio.load(html);
      
      // Method 1: Try to extract from JSON-LD data on the page
      const jsonLdData = this.extractJsonLdFromHtml(html);
      if (jsonLdData && Object.keys(jsonLdData).length > 0) {
        console.log('[Uniqlo] Successfully extracted size chart from JSON-LD data');
        return {
          success: true,
          sizeChart: jsonLdData
        };
      }
      
      // Method 2: Look for table with class fr-ec-data-table
      const sizeTable = $('table.fr-ec-data-table');
      if (sizeTable.length > 0) {
        console.log('[Uniqlo] Found size chart table in HTML');
        const sizeChart = this.parseSizeTableFromHtml($, sizeTable);
        if (sizeChart && Object.keys(sizeChart).length > 0) {
          return {
            success: true,
            sizeChart
          };
        }
      }
      
      return {
        success: false,
        message: 'No size chart found in HTML content'
      };
    } catch (error: unknown) {
      console.error('[Uniqlo] Error processing HTML:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error processing HTML'
      };
    }
  }
  
  /**
   * Extract JSON-LD data from HTML
   */
  private extractJsonLdFromHtml(html: string): SizeChartData | null {
    try {
      const $ = cheerio.load(html);
      
      const jsonLdScripts = $('script[type="application/ld+json"]').toArray();
      for (const script of jsonLdScripts) {
        const scriptContent = $(script).html();
        if (!scriptContent) continue;
        
        try {
          const jsonData = JSON.parse(scriptContent.trim());
          
          // Look for size chart data in the JSON
          const sizeGuide = 
            jsonData.sizeGuide ||
            jsonData.sizeChart ||
            (jsonData.product && (jsonData.product.sizeGuide || jsonData.product.sizeChart));
          
          if (sizeGuide) {
            return this.processSizeGuideData(sizeGuide);
          }
        } catch {
          // Continue to next script
        }
      }
      
      return null;
    } catch (err) {
      console.error('[Uniqlo] Error extracting JSON-LD:', err);
      return null;
    }
  }
  
  /**
   * Parse size chart table from HTML
   */
  private parseSizeTableFromHtml($: cheerio.CheerioAPI, table: cheerio.Cheerio<any>): SizeChartData | null {
    try {
      const sizeChart: SizeChartData = {};
      
      // Get all rows
      const rows = table.find('tr');
      
      if (rows.length < 2) return null; // Need at least a header row and a data row
      
      // Extract headers (sizes)
      const headerRow = $(rows[0]);
      const headerCells = headerRow.find('th');
      
      const headers: string[] = [];
      
      // Start from index 1 to skip the first header (which is usually empty or "Size")
      for (let i = 1; i < headerCells.length; i++) {
        const headerText = $(headerCells[i]).text().trim();
        if (headerText) {
          headers.push(headerText);
        }
      }
      
      if (headers.length === 0) return null;
      
      // Process each data row
      for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
        const row = $(rows[rowIdx]);
        const cells = row.find('td');
        
        if (cells.length < 2) continue;
        
        // First cell contains the measurement name
        const measurementName = $(cells[0]).text().trim();
        if (!measurementName) continue;
        
        // Process each size column (starting from index 1)
        for (let colIdx = 1; colIdx < cells.length && (colIdx - 1) < headers.length; colIdx++) {
          const size = headers[colIdx - 1];
          const valueText = $(cells[colIdx]).text().trim();
          
          // Extract numeric value
          const numericValue = parseFloat(valueText.replace(/[^\d.]/g, ''));
          
          if (!isNaN(numericValue)) {
            // Initialize size if needed
            if (!sizeChart[size]) {
              sizeChart[size] = {};
            }
            
            // Store the measurement with standardized name
            sizeChart[size][this.standardizeMeasurementName(measurementName)] = numericValue;
          }
        }
      }
      
      return Object.keys(sizeChart).length > 0 ? sizeChart : null;
    } catch (error) {
      console.error('[Uniqlo] Error parsing size table from HTML:', error);
      return null;
    }
  }
  
  /**
   * Process size guide data from JSON-LD
   */
  private processSizeGuideData(data: unknown): SizeChartData | null {
    if (!data) return null;
    
    // Convert string data to object if needed
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return null;
      }
    }
    
    // Handle different formats of size guide data
    if (typeof data === 'object' && data !== null) {
      const result: SizeChartData = {};
      
      // Case 1: Direct mapping of sizes to measurements
      // { "S": { "chest": 36, "waist": 28 }, "M": {...} }
      const isSizeChart = Object.values(data).some(value => 
        typeof value === 'object' && value !== null &&
        Object.values(value as object).some(v => typeof v === 'number')
      );
      
      if (isSizeChart) {
        for (const [size, measurements] of Object.entries(data)) {
          if (typeof measurements === 'object' && measurements !== null) {
            result[size] = {};
            
            for (const [key, value] of Object.entries(measurements as object)) {
              const numValue = typeof value === 'number' ? value : parseFloat(String(value));
              if (!isNaN(numValue)) {
                result[size][this.standardizeMeasurementName(key)] = numValue;
              }
            }
          }
        }
      }
      
      return Object.keys(result).length > 0 ? result : null;
    }
    
    return null;
  }
  
  /**
   * Standardize measurement names for consistency
   */
  standardizeMeasurementName(name: string): string {
    return standardizeMeasurementName(name);
  }
}

// Export singleton instance for use throughout the application
export const uniqloScraper = new UniqloScraper();

// Backwards compatibility function for existing code
export async function uniqloStrategy(url: string, productId?: string | null): Promise<string | null> {
  return uniqloScraper.getSizeChartUrl(url, productId);
}

// Backwards compatibility function for existing tests
export async function handleUniqloSizeChart(html: string, url: string): Promise<SizeChartResult> {
  return uniqloScraper.handleSizeChartFromHtml(html, url);
}
