import { Browser, Page, chromium } from 'playwright';

/**
 * Singleton manager for Playwright browser instances
 * Ensures efficient reuse of browser instances during scraping operations
 */
export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  
  private constructor() {}
  
  /**
   * Get the singleton instance of BrowserManager
   */
  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }
  
  /**
   * Create a new browser page for scraping
   * Launches the browser if it's not already running
   */
  public async newPage(): Promise<Page> {
    if (!this.browser) {
      console.log('[BrowserManager] Launching new browser instance');
      this.browser = await chromium.launch({
        headless: true
      });
    }
    
    // Create a new context for isolation
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      // Optimized for performance and compatibility
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      javaScriptEnabled: true,
      // Shorter timeouts for better performance
      timezoneId: 'America/New_York',
    });
    
    // Create a new page with custom options for scraping
    const page = await context.newPage();
    
    // Set default timeout to be shorter than usual to avoid long-running tests
    page.setDefaultTimeout(10000);
    
    return page;
  }
  
  /**
   * Close the browser instance
   * Should be called to clean up resources when scraping is complete
   */
  public async closeBrowser(): Promise<void> {
    if (this.browser) {
      console.log('[BrowserManager] Closing browser instance');
      await this.browser.close();
      this.browser = null;
    }
  }
}