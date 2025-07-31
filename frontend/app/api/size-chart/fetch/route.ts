import { NextResponse } from 'next/server';
import { scrapeSizeChart } from '../utils/playwright-scraper';
import { getRetailerFromUrl } from '../utils/retailers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const productId = searchParams.get('productId');
    const brand = searchParams.get('brand');
    
    if (!url) {
      return NextResponse.json({
        status: 'error',
        message: 'URL parameter is required'
      });
    }
    
    console.log(`[API] Processing size chart request for URL: ${url}`);
    
    // In case a specific product ID is needed, extract it from the URL if not provided
    const extractedProductId = productId;
    if (!extractedProductId) {
      try {
        const parsedUrl = new URL(url);
        const productPathMatch = parsedUrl.pathname.match(/\/([^/]+)\/([^/]+)$/);
        
        if (productPathMatch) {
          const fullProductId = `${productPathMatch[1]}/${productPathMatch[2]}`;
          console.log(`[API] DEBUG: Extracted full product path from URL: ${fullProductId}`);
        } else {
          console.log(`[API] DEBUG: Could not extract product path from URL: ${parsedUrl.pathname}`);
        }
      } catch (e) {
        console.error(`[API] DEBUG: Error parsing URL: ${e}`);
      }
    }
    
    // Detect retailer from URL if needed (just for logging/analytics)
    const retailer = brand?.toLowerCase() || getRetailerFromUrl(url);
    
    // Call our universal Playwright scraper
    console.log(`[API] Using universal Playwright scraper for URL: ${url} (retailer: ${retailer || 'unknown'})`);
    const result = await scrapeSizeChart(url);
    
    // Return the result
    return NextResponse.json({
      ...result,
      retailer,
      url
    });
    
  } catch (error: any) {
    console.error('[API] Error processing size chart request:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Unknown error occurred'
    });
  }
}