import { RetailerScraper } from './retailer-scraper';
import { uniqloScraper } from './uniqlo';

// Registry of retailer-specific scrapers
export const scrapers: Record<string, RetailerScraper> = {
  'uniqlo': uniqloScraper,
  // Add more retailers as needed
};

/**
 * Type definition for retailer URL strategy functions
 * This is for backwards compatibility with the old retailer strategy pattern
 */
export type retailerStrategy = (url: string, productId?: string | null) => Promise<string | null>;

/**
 * Detects which retailer a URL belongs to
 */
export function getRetailerFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('uniqlo')) return 'uniqlo';
    
    // Additional retailer detection patterns
    const retailers = [
      { name: 'levis', pattern: /levi(\.com|s\.com)/ },
      { name: 'hm', pattern: /(hm\.com|h-m\.com|hm\.)/ },
      { name: 'zara', pattern: /zara\.com/ },
      { name: 'gap', pattern: /(gap\.com|oldnavy\.com|bananarepublic\.com)/ },
      { name: 'nike', pattern: /nike\.com/ },
      { name: 'adidas', pattern: /adidas\.com/ },
    ];
    
    for (const retailer of retailers) {
      if (retailer.pattern.test(hostname)) {
        return retailer.name;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get a scraper for a specific retailer
 */
export function getScraperForRetailer(retailerName: string): RetailerScraper | null {
  return scrapers[retailerName] || null;
}

/**
 * Get a scraper for a URL
 */
export function getScraperForUrl(url: string): RetailerScraper | null {
  const retailerName = getRetailerFromUrl(url);
  if (!retailerName) return null;
  
  return getScraperForRetailer(retailerName);
}
