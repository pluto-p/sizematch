import { Page } from 'playwright';

/**
 * Interface for retailer-specific size chart scraping strategies
 */
export interface RetailerScraper {
  /**
   * Returns the correct URL to scrape for a size chart
   * @param url Original product URL
   * @param productId Optional product ID if already extracted
   * @returns URL to scrape for size chart or null if unable to determine
   */
  getSizeChartUrl(url: string, productId?: string | null): Promise<string | null>;
  
  /**
   * Extracts size chart data from a page
   * @param page Playwright page object with loaded content
   * @returns Structured size chart data or null if extraction fails
   */
  extractSizeChart(page: Page): Promise<SizeChartData | null>;
  
  /**
   * Process HTML content to extract size chart data (primarily for testing)
   * @param html HTML content to parse
   * @param url Original URL for context
   */
  handleSizeChartFromHtml(html: string, url: string): Promise<SizeChartResult>;
  
  /**
   * Standardize measurement names for consistency
   * @param name Original measurement name
   * @returns Standardized measurement name
   */
  standardizeMeasurementName(name: string): string;
}

/**
 * Base type for size chart data - legacy object format
 */
export type SizeChartDataObject = { [size: string]: { [measurement: string]: number } };

/**
 * New array-based size chart format
 */
export type SizeChartDataArray = Array<{ size: string } & { [measurement: string]: number }>;

/**
 * Combined type for size chart data
 */
export type SizeChartData = SizeChartDataObject | SizeChartDataArray;

/**
 * Result type for size chart extraction
 */
export interface SizeChartResult {
  success: boolean;
  sizeChart?: SizeChartData;
  message?: string;
}

/**
 * Generic utility to standardize measurement names across retailers
 */
export function standardizeMeasurementName(name: string): string {
  const lowerName = name.toLowerCase().trim();
  
  // Updated measurement name mappings for Uniqlo format
  const mappings: { [key: string]: string } = {
    // New Uniqlo-specific mappings
    'body length back': 'bodyLengthBack',
    'body length': 'bodyLength',
    'shoulder width': 'shoulderWidth',
    'body width': 'bodyWidth',
    'sleeve length (center back)': 'sleeveLengthCenterBack',
    'sleeve length': 'sleeveLength',
    
    // Legacy mappings converted to camelCase
    'length': 'bodyLength',
    'shoulder': 'shoulderWidth',
    'chest width': 'bodyWidth',
    'chest': 'bodyWidth',
    'sleeve': 'sleeveLength',
    'waist': 'waistWidth',
    'waist width': 'waistWidth',
    'hip': 'hipWidth',
    'hips': 'hipWidth',
    'inseam': 'inseamLength',
    'outseam': 'outseamLength',
    'thigh': 'thighWidth',
    'rise': 'riseLength',
    'leg opening': 'legOpening'
  };
  
  // Check for exact matches or includes
  for (const [pattern, standardName] of Object.entries(mappings)) {
    if (lowerName === pattern || lowerName.includes(pattern)) {
      return standardName;
    }
  }
  
  // If no match found, convert to camelCase
  return lowerName
    .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
    .replace(/\s+/g, '');
}
