# Size Chart Scraper Architecture

This module provides functionality to scrape size charts from various retail websites using a strategy pattern. It's designed to be extensible, allowing for retailer-specific implementations while maintaining a consistent interface.

## Architecture Overview

The scraper uses a strategy pattern to apply different extraction techniques depending on the retailer:

1. **RetailerScraper Interface**: Defines the contract for all retailer-specific scrapers
2. **Retailer Implementations**: Individual classes for each supported retailer (e.g., Uniqlo)
3. **Main Scraper**: Orchestration logic that selects the appropriate strategy based on the URL

## Running Integration Tests

Integration tests validate the scraper's ability to extract size chart data from real retailer HTML structures. To run the tests:

```bash
# Navigate to the frontend directory
cd frontend

# Run all tests
npm test

# Run only the Uniqlo integration tests
npm test -- -t "Uniqlo Integration"
```

## Supported Retailers

Currently, the following retailers are supported:

- **Uniqlo**: Extracts size charts from Uniqlo's standard table format with `.fr-ec-data-table` class

## Adding New Retailers

To add support for a new retailer:

1. Create a new class that implements the `RetailerScraper` interface
2. Add the retailer detection logic in `index-updated.ts`
3. Create integration tests for the new implementation

Example implementation:

```typescript
import { Page } from 'playwright';
import { RetailerScraper, SizeChartData } from './retailer-scraper';

export class NewRetailerScraper implements RetailerScraper {
  async getSizeChartUrl(productUrl: string): Promise<string | null> {
    // Implement URL generation logic
    return productUrl;
  }

  async extractSizeChart(page: Page): Promise<SizeChartData | null> {
    // Implement extraction logic
    return {};
  }

  parseHtml(html: string): SizeChartData | null {
    // Implement HTML parsing logic for tests
    return {};
  }
}
```

## General Usage

To use the scraper in your code:

```typescript
import { scrapeSizeChart } from './scraper-updated';

// Example usage
async function getSizeChart(url: string) {
  const result = await scrapeSizeChart(url);
  
  if (result.status === 'success') {
    if (result.sizeChart) {
      console.log('Size Chart:', result.sizeChart);
    } else if (result.imageUrl) {
      console.log('Size Chart Image:', result.imageUrl);
    }
  } else {
    console.error('Error:', result.message);
  }
}
```

## Testing

This module includes:

1. **Unit Tests**: For individual retailer scrapers and utilities
2. **Integration Tests**: That validate end-to-end scraping functionality with real HTML structures
