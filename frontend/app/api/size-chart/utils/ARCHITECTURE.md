# Size Chart Scraper Architecture

## Overview

The size chart scraper system uses a modular, extensible architecture to extract size chart data from various retailer websites. It follows a strategy pattern where different retailers can have specific implementations while maintaining a common interface.

## Key Components

### 1. RetailerScraper Interface

The core of the system is the `RetailerScraper` interface which defines the contract for all retailer-specific implementations:

```typescript
export interface RetailerScraper {
  getSizeChartUrl(url: string, productId?: string | null): Promise<string | null>;
  extractSizeChart(page: Page): Promise<SizeChartData | null>;
  handleSizeChartFromHtml(html: string, url: string): Promise<SizeChartResult>;
  standardizeMeasurementName(name: string): string;
}
```

### 2. Retailer-Specific Implementations

Each retailer has its own implementation that handles the specific details of extracting size charts from that retailer's website:

- `UniqloScraper`: Handles Uniqlo's size chart extraction, focusing on their table-based layout with class `fr-ec-data-table`.

### 3. Main Scraper 

The main scraper orchestrates the process:
- Detects the retailer from the URL
- Uses the appropriate retailer-specific scraper if available
- Falls back to generic extraction methods if needed

### 4. Generic Extraction Methods

For retailers without specific implementations, the system falls back to general-purpose extraction techniques:
- Table-based extraction
- Grid-based extraction
- Image detection

## Data Flow

1. A URL is passed to the scraper
2. The system identifies the retailer and selects the appropriate strategy
3. The retailer-specific strategy navigates to the correct size chart URL
4. The extractor pulls size chart data from the DOM
5. Measurements are standardized across retailers
6. A structured size chart object is returned

## Benefits of This Architecture

1. **Extensibility**: New retailers can be added by implementing the `RetailerScraper` interface
2. **Maintainability**: Retailer-specific logic is isolated from the main scraping engine
3. **Robustness**: Multiple extraction strategies provide fallbacks for reliability
4. **Standardization**: Measurement names are normalized for consistent downstream processing
5. **Testability**: Each component can be tested in isolation

## Testing Approach

1. **Unit Tests**: Test each retailer implementation with mock HTML
2. **Integration Tests**: Test real-world retailer websites using Playwright
3. **Fallback Tests**: Ensure generic strategies work when retailer-specific strategies fail

This architecture allows for both targeted reliability for major retailers and broad coverage for less common ones.
