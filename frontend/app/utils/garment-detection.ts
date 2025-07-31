import type { TargetGarment } from "../components/sizing-interface" // Updated import path

export async function detectGarmentFromPage(url: string): Promise<TargetGarment | null> {
  try {
    // In a real implementation, this would scrape the current page
    // For demo purposes, we'll simulate detection based on URL patterns

    // Removed localhost check as the /demo page is removed.
    // The logic below will now apply to any URL not explicitly handled by the analyzer.

    // Check if we're on a known retailer site
    const knownRetailers = ["levi.com", "uniqlo.com", "hm.com", "zara.com", "gap.com"]
    const hostname = new URL(url).hostname.toLowerCase()

    const isRetailerSite = knownRetailers.some((retailer) => hostname.includes(retailer))

    if (isRetailerSite) {
      // In reality, we'd scrape the page here
      return await scrapeGarmentFromUrl(url)
    }

    return null
  } catch (error) {
    console.error("Error detecting garment:", error)
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getSizeChartFromBackend(_productId: string, _retailer: string): Promise<{ [size: string]: { [measurement: string]: number } } | null> {
  // Placeholder: In a real implementation, this would query your backend/database
  // For now, always return null to simulate no data found
  // Example: await fetch(`/api/size-chart?productId=${_productId}&retailer=${_retailer}`)
  return null;
}

export async function scrapeGarmentFromUrl(
  url: string,
  notifyStatus?: (status: string) => void
): Promise<TargetGarment> {
  try {
    console.log('[GarmentDetection] Starting scrapeGarmentFromUrl for:', url);
    // Simulate API call to scraping service
    await new Promise((resolve) => setTimeout(resolve, 500))

    const hostname = new URL(url).hostname.toLowerCase()

    // 1. Try backend
    if (notifyStatus) notifyStatus("Checking backend for size chart...")
    console.log('[GarmentDetection] Checking backend for size chart');
    const backendSizeChart = await getSizeChartFromBackend("TODO", hostname)
    if (backendSizeChart) {
      console.log('[GarmentDetection] Found size chart in backend:', backendSizeChart);
      return {
        brand: "TODO: fill from backend or scraping",
        name: "TODO: fill from backend or scraping",
        category: "TODO: fill from backend or scraping",
        sizeChart: backendSizeChart,
        imageUrl: "/placeholder.svg?height=200&width=200",
        url,
      }
    } else {
      console.log('[GarmentDetection] No size chart found in backend.');
    }

    // 2. Try DOM scraping
    if (notifyStatus) notifyStatus("Scraping size chart from page...")
    console.log('[GarmentDetection] Attempting to scrape size chart from DOM...');
    const domSizeChart: { [size: string]: { [measurement: string]: number } } | undefined = undefined
    // TODO: implement real DOM scraping logic
    // For demo, always fail
    if (domSizeChart) {
      console.log('[GarmentDetection] Found size chart in DOM:', domSizeChart);
      return {
        brand: "TODO",
        name: "TODO",
        category: "TODO",
        sizeChart: domSizeChart,
        imageUrl: "/placeholder.svg?height=200&width=200",
        url,
      }
    } else {
      console.log('[GarmentDetection] No size chart found in DOM.');
    }

    // 3. Try size chart URL
    if (notifyStatus) notifyStatus("No size chart available, trying to collect from other source...")
    let sizeChartUrl: string | null = null
    if (hostname.includes("uniqlo")) {
      // Example: https://www.uniqlo.com/us/en/products/E465185-000/00/size?sizeDisplayCode=003&measurementUnit=cm
      const baseUrl = url.split("?")[0]
      sizeChartUrl = baseUrl + "/size?measurementUnit=cm"
      // TODO: add sizeDisplayCode if available
      console.log('[GarmentDetection] Trying size chart URL:', sizeChartUrl);
    }
    const urlSizeChart: { [size: string]: { [measurement: string]: number } } | undefined = undefined
    if (sizeChartUrl) {
      // TODO: fetch and parse size chart from sizeChartUrl
      // For demo, always fail
      // Example: const response = await fetch(sizeChartUrl)
      //          urlSizeChart = parseSizeChart(await response.text())
    }
    if (urlSizeChart) {
      console.log('[GarmentDetection] Found size chart at URL:', urlSizeChart);
      return {
        brand: "TODO",
        name: "TODO",
        category: "TODO",
        sizeChart: urlSizeChart,
        imageUrl: "/placeholder.svg?height=200&width=200",
        url,
      }
    } else {
      if (sizeChartUrl) {
        console.log('[GarmentDetection] No size chart found at URL:', sizeChartUrl);
      }
    }

    // 4. Fallback: manual input
    if (notifyStatus) notifyStatus("Manual input required: please upload a screenshot or provide a size chart URL.")
    console.log('[GarmentDetection] Manual input required: no size chart found by any strategy.');
    return {
      brand: "Unknown Brand",
      name: "Unknown Product",
      category: "Unknown",
      sizeChart: {},
      imageUrl: "/placeholder.svg?height=200&width=200",
      url,
    }
  } catch (error) {
    console.error("Error scraping garment:", error)
    throw new Error("Failed to scrape garment information")
  }
}

/**
 * Fetches a remote URL and tries to extract a size chart image or structured size data.
 */
export async function scrapeSizeChartFromUrl(url: string): Promise<{
  imageUrl?: string;
  sizeChart?: { [size: string]: { [measurement: string]: number } };
  rawTable?: string[][];
  html?: string;
  status: 'success' | 'no-size-chart-found' | 'fetch-error';
  error?: string;
}> {
  try {
    console.log(`[SizeChartScraper] Fetching URL: ${url}`);
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; RunwAISizeBot/1.0)'
      }
    });
    
    if (!response.ok) {
      console.log(`[SizeChartScraper] HTTP error: ${response.status}`);
      return { status: 'fetch-error', error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    console.log(`[SizeChartScraper] Received HTML (${html.length} chars)`);
    
    // Try to extract a size chart image
    const imgMatch = html.match(/<img[^>]+(alt=["']?.*?size\s?chart.*?["']?|class=["'][^"']*size[^"']*)[^>]*src=["']([^"']+)["'][^>]*>/i);
    let imageUrl: string | undefined = undefined;
    
    if (imgMatch && imgMatch[2]) {
      imageUrl = imgMatch[2].startsWith('http') ? imgMatch[2] : new URL(imgMatch[2], url).href;
      console.log(`[SizeChartScraper] Found size chart image: ${imageUrl}`);
    }
    
    // Try to extract size chart tables
    const tableMatches = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)];
    let bestTable: string[][] | undefined = undefined;
    let sizeChart: { [size: string]: { [measurement: string]: number } } | undefined = undefined;
    
    if (tableMatches.length > 0) {
      console.log(`[SizeChartScraper] Found ${tableMatches.length} tables, analyzing...`);
      
      // Find the most likely size chart table (highest score)
      let bestScore = 0;
      let bestTableHtml = '';
      
      for (const match of tableMatches) {
        const tableHtml = match[0];
        let score = 0;
        
        // Score based on keywords in or around the table
        const tableContext = tableHtml.toLowerCase();
        if (tableContext.includes('size')) score += 5;
        if (tableContext.includes('chart')) score += 5;
        if (tableContext.includes('measurement')) score += 10;
        if (tableContext.includes('cm') || tableContext.includes('inch')) score += 10;
        
        // Score for having multiple rows/columns
        const rowCount = (tableHtml.match(/<tr/gi) || []).length;
        score += Math.min(rowCount, 10); // Up to 10 points for rows
        
        if (score > bestScore) {
          bestScore = score;
          bestTableHtml = tableHtml;
        }
      }
      
      if (bestScore >= 10) { // Threshold for considering it a size chart
        console.log(`[SizeChartScraper] Found likely size chart table (score: ${bestScore})`);
        
        // Parse the table to a 2D array
        const rows = [...bestTableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)];
        bestTable = rows.map(row => {
          return [...row[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell => 
            cell[1].replace(/<[^>]+>/g, '').trim()
          );
        });
        
        // Try to convert to structured size chart
        if (bestTable && bestTable.length > 1) {
          sizeChart = parseTableToSizeChart(bestTable);
          console.log(`[SizeChartScraper] Parsed structured size chart: `, sizeChart);
        }
      }
    }
    
    if (imageUrl || sizeChart || (bestTable && bestTable.length > 0)) {
      return { 
        imageUrl, 
        sizeChart, 
        rawTable: bestTable, 
        html, 
        status: 'success' 
      };
    }
    
    return { html, status: 'no-size-chart-found' };
  } catch (error: any) {
    console.error(`[SizeChartScraper] Error: ${error.message}`);
    return { status: 'fetch-error', error: error.message };
  }
}

/**
 * Parses a raw HTML table into structured size chart data
 */
function parseTableToSizeChart(table: string[][]): { [size: string]: { [measurement: string]: number } } | undefined {
  try {
    if (!table || table.length < 2) return undefined;
    
    const sizeChart: { [size: string]: { [measurement: string]: number } } = {};
    
    // Determine if sizes are in rows or columns
    let sizesInRows = true; 
    
    // Check if sizes are common size designations (S, M, L, XL or numeric sizes like 32, 34, etc.)
    const firstColValues = table.slice(1).map(row => row[0].trim());
    const firstRowValues = table[0].slice(1).map(val => val.trim());
    
    const isSize = (val: string) => {
      return /^(XXS|XS|S|M|L|XL|XXL|XXXL|\d+(\.\d+)?|[1-6]X)$/i.test(val.replace(/[^A-Z0-9.]/gi, ''));
    };
    
    const rowSizeCount = firstColValues.filter(isSize).length;
    const colSizeCount = firstRowValues.filter(isSize).length;
    
    // Decide if sizes are in rows or columns based on which has more size-like values
    sizesInRows = rowSizeCount >= colSizeCount;
    
    console.log(`[SizeChartScraper] Detected size orientation: ${sizesInRows ? 'rows' : 'columns'}`);
    
    if (sizesInRows) {
      // Sizes in first column, measurements in header row
      const headers = table[0].slice(1).map(h => h.toLowerCase().trim());
      
      for (let i = 1; i < table.length; i++) {
        const row = table[i];
        const size = row[0].trim();
        if (!size || size.length > 10) continue; // Skip rows without a clear size
        
        sizeChart[size] = {};
        
        for (let j = 1; j < row.length && j <= headers.length; j++) {
          if (!headers[j-1]) continue;
          
          // Extract numeric values
          const valueText = row[j].trim();
          const numericValue = parseFloat(valueText.replace(/[^\d.]/g, ''));
          
          if (!isNaN(numericValue)) {
            let measurementName = headers[j-1];
            // Standardize common measurement names
            if (measurementName.includes('chest')) measurementName = 'chest';
            if (measurementName.includes('waist')) measurementName = 'waist';
            if (measurementName.includes('hip')) measurementName = 'hip';
            if (measurementName.includes('shoulder')) measurementName = 'shoulder';
            if (measurementName.includes('sleeve')) measurementName = 'sleeve';
            if (measurementName.includes('length')) measurementName = 'length';
            
            sizeChart[size][measurementName] = numericValue;
          }
        }
        
        // Remove sizes with no measurements
        if (Object.keys(sizeChart[size]).length === 0) {
          delete sizeChart[size];
        }
      }
    } else {
      // Sizes in header row, measurements in first column
      const headers = table[0].slice(1).map(h => h.trim());
      
      for (let i = 1; i < table.length; i++) {
        const row = table[i];
        const measurementName = row[0].toLowerCase().trim();
        if (!measurementName) continue;
        
        for (let j = 1; j < row.length && j <= headers.length; j++) {
          if (!headers[j-1]) continue;
          const size = headers[j-1];
          
          if (!sizeChart[size]) {
            sizeChart[size] = {};
          }
          
          // Extract numeric values
          const valueText = row[j].trim();
          const numericValue = parseFloat(valueText.replace(/[^\d.]/g, ''));
          
          if (!isNaN(numericValue)) {
            let stdMeasurementName = measurementName;
            // Standardize common measurement names
            if (stdMeasurementName.includes('chest')) stdMeasurementName = 'chest';
            if (stdMeasurementName.includes('waist')) stdMeasurementName = 'waist';
            if (stdMeasurementName.includes('hip')) stdMeasurementName = 'hip';
            if (stdMeasurementName.includes('shoulder')) stdMeasurementName = 'shoulder';
            if (stdMeasurementName.includes('sleeve')) stdMeasurementName = 'sleeve';
            if (stdMeasurementName.includes('length')) stdMeasurementName = 'length';
            
            sizeChart[size][stdMeasurementName] = numericValue;
          }
        }
      }
      
      // Remove sizes with no measurements
      for (const size of Object.keys(sizeChart)) {
        if (Object.keys(sizeChart[size]).length === 0) {
          delete sizeChart[size];
        }
      }
    }
    
    // Verify we have at least some data
    if (Object.keys(sizeChart).length === 0) {
      return undefined;
    }
    
    return sizeChart;
  } catch (error) {
    console.error('[SizeChartScraper] Error parsing table to size chart:', error);
    return undefined;
  }
}
