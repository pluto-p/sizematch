export interface GarmentInfo {
  name: string
  brand: string
  price?: string
  images: string[]
  category?: string
}

export interface SizingInfo {
  availableSizes: string[]
  sizeChart?: { [size: string]: { [measurement: string]: number } }
  sizeGuideUrl?: string
}

export interface AnalysisResult {
  garment: GarmentInfo
  sizing: SizingInfo
  productId: string
  confidence: number
  status: "complete" | "partial" | "incomplete"
  needsBackendLookup?: boolean
  needsManualInput?: boolean
}

export class GarmentAnalyzer {
  private debug = true

  private log(message: string, ...args: any[]) {
    console.log(`[GarmentAnalyzer] ${message}`, ...args);
  }

  async analyzePage(): Promise<any> {
    this.log("🚀 Starting page analysis...");
    try {
      this.log("Extracting garment information...");
      const garmentInfo = this.extractGarmentInfo();
      this.log("✅ Successfully extracted garment information:", garmentInfo);

      if (garmentInfo.imageUrl) {
        this.log(`🖼️ Analyzing image: ${garmentInfo.imageUrl}`);
        // ... image analysis logic
      }

      if (garmentInfo.text) {
        this.log(`📝 Analyzing text content...`);
        // ... text analysis logic
      }

      this.log("🏁 Page analysis complete.");
      return garmentInfo;
    } catch (error) {
      this.log("❌ Error during page analysis:", error);
      throw error;
    }
  }

  private extractGarmentInfo(): any {
    console.groupCollapsed("[GarmentAnalyzer]🕵️‍♂️ Extracting garment information...");

    const name = this.findProductName();
    const brand = this.findBrand();
    const price = this.findPrice();
    const images = this.findProductImages();
    const category = this.inferCategory(name.value || "");

    const extractedInfo = {
      name: name.value,
      foundBySelector: name.selector,
      brand: brand.value,
      brandFoundBy: brand.selector,
      price: price.value,
      priceFoundBy: price.selector,
      images: images.value,
      imagesFoundBy: images.selector,
      category: category,
    };

    console.log("📦 Extracted Info:", extractedInfo);
    console.groupEnd();

    return {
      name: name.value,
      brand: brand.value,
      price: price.value,
      images: images.value,
      category: category,
      // Keep original properties for compatibility
      title: name.value,
      imageUrl: images.value[0],
      text: `${name.value} ${""}`
    };
  }

  private findProductName(): { value: string | null; selector: string | null } {
    const selectors = [
      'h1[class*="product"]',
      ".product-title",
      ".product-name",
      '[data-testid*="product-name"]',
      '[data-testid*="product-title"]',
      ".pdp-product-name",
      ".product-details h1",
      "h1:first-of-type",
    ];

    return this.trySelectors(selectors);
  }

  private findBrand(): { value: string | null; selector: string | null } {
    const selectors = [
      ".product-brand",
      ".brand-name",
      '[data-testid*="brand"]',
      ".pdp-brand",
      ".product-details .brand",
    ];

    const result = this.trySelectors(selectors);
    if (result.value) return result;

    // Fallback: extract from hostname
    const hostname = window.location.hostname.replace(/^www\./, "");
    const brandFromDomain = hostname.split(".")[0];
    const value = brandFromDomain.charAt(0).toUpperCase() + brandFromDomain.slice(1);
    this.log("Brand not found with selectors, falling back to hostname:", value);
    return { value, selector: "hostname fallback" };
  }

  private findPrice(): { value: string | null; selector: string | null } {
    const selectors = [
      ".price",
      ".product-price",
      '[data-testid*="price"]',
      ".pdp-price",
      ".current-price",
      ".sale-price",
    ];

    const result = this.trySelectors(selectors);
    if (result.value) return result;

    // Also look for price patterns in text
    const pricePattern = /\\$[\d,]+\.?\d*/;
    const bodyText = document.body.textContent || "";
    const priceMatch = bodyText.match(pricePattern);
    if (priceMatch?.[0]) {
      this.log("Price found with regex pattern:", priceMatch[0]);
      return { value: priceMatch[0], selector: "regex pattern" };
    }

    return { value: null, selector: null };
  }

  private findProductImages(): { value: string[]; selector: string | null } {
    const images: string[] = [];
    let foundBySelector: string | null = null;

    const selectors = [
      ".product-image img",
      ".product-gallery img",
      ".pdp-image img",
      '[data-testid*="product-image"] img',
      ".main-image img",
    ];

    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          foundBySelector = selector;
          elements.forEach((img) => {
            const src = (img as HTMLImageElement).src;
            if (src && !src.includes("placeholder") && !images.includes(src)) {
              images.push(src);
            }
          });
          if (images.length > 0) break; // Stop after finding the first set of images
        }
      } catch (error) {
        this.log(`Error with image selector ${selector}:`, error);
      }
    }

    const finalImages = images.slice(0, 5);
    this.log(`Found ${finalImages.length} images with selector: ${foundBySelector}`);
    return { value: finalImages, selector: foundBySelector };
  }

  private extractSizingInfo(): SizingInfo {
    console.groupCollapsed("[GarmentAnalyzer] Extracting sizing information...");

    const availableSizes = this.findAvailableSizes()
    const sizeChart = this.findSizeChart()
    const sizeGuideUrl = this.findSizeGuideLink()

    this.log("Extracted sizing info:", { availableSizes, sizeChart, sizeGuideUrl });
    console.groupEnd();

    return { availableSizes, sizeChart, sizeGuideUrl }
  }

  private findAvailableSizes(): string[] {
    const sizes: string[] = []

    // Look for size selectors
    const sizeSelectors = [
      'select[name*="size"] option',
      'select[id*="size"] option',
      ".size-selector button",
      ".size-option",
      "[data-size]",
      ".size-swatch",
      ".size-button",
    ]

    sizeSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach((element) => {
        let sizeValue = ""

        if (element.tagName === "OPTION") {
          sizeValue = (element as HTMLOptionElement).value || element.textContent || ""
        } else {
          sizeValue =
            element.getAttribute("data-size") || element.getAttribute("data-value") || element.textContent || ""
        }

        sizeValue = sizeValue.trim()
        if (sizeValue && sizeValue !== "Select Size" && !sizes.includes(sizeValue)) {
          sizes.push(sizeValue)
        }
      })
    })

    return sizes
  }

  private findSizeChart(): { [size: string]: { [measurement: string]: number } } | undefined {
    // Look for size chart tables or structured data
    const sizeChartSelectors = [".size-chart table", ".size-guide table", '[data-testid*="size-chart"]']

    for (const selector of sizeChartSelectors) {
      const table = document.querySelector(selector) as HTMLTableElement
      if (table) {
        return this.parseSizeChartTable(table)
      }
    }

    return undefined
  }

  private parseSizeChartTable(table: HTMLTableElement): { [size: string]: { [measurement: string]: number } } {
    const sizeChart: { [size: string]: { [measurement: string]: number } } = {}

    try {
      const rows = table.querySelectorAll("tr")
      if (rows.length < 2) return sizeChart

      // Get headers
      const headerRow = rows[0]
      const headers = Array.from(headerRow.querySelectorAll("th, td")).map((cell) =>
        cell.textContent?.trim().toLowerCase(),
      )

      // Process data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll("td"))
        if (cells.length === 0) continue

        const size = cells[0].textContent?.trim()
        if (!size) continue

        sizeChart[size] = {}

        for (let j = 1; j < cells.length && j < headers.length; j++) {
          const measurement = headers[j]
          const value = cells[j].textContent?.trim()

          if (measurement && value) {
            const numericValue = Number.parseFloat(value.replace(/[^\d.]/g, ""))
            if (!isNaN(numericValue)) {
              sizeChart[size][measurement] = numericValue
            }
          }
        }
      }
    } catch (error) {
      this.log("Error parsing size chart table:", error)
    }

    return sizeChart
  }

  private findSizeGuideLink(): string | undefined {
    const selectors = [
      'a[href*="size-guide"]',
      'a[href*="sizing"]',
      'a[href*="size-chart"]',
      ".size-guide-link",
      '[data-testid*="size-guide"]',
    ]

    const link = this.trySelectorsForAttribute(selectors, "href")
    return link ? new URL(link, window.location.origin).href : undefined
  }

  private generateProductId(garment: GarmentInfo): string {
    const retailer = this.getRetailerIdentifier()
    const productCode = this.extractProductCode(garment)

    return `${retailer}_${productCode}`
  }

  private getRetailerIdentifier(): string {
    return window.location.hostname.replace(/^www\./, "")
  }

  private extractProductCode(garment: GarmentInfo): string {
    // Try multiple strategies to get a unique product identifier
    const strategies = [
      () => this.getFromURL(),
      () => this.getFromDataAttributes(),
      () => this.getFromSKU(),
      () => this.generateFromContent(garment),
    ]

    for (const strategy of strategies) {
      const result = strategy()
      if (result) return result
    }

    return "unknown"
  }

  private getFromURL(): string | null {
    const path = window.location.pathname
    const matches = path.match(/\/products?\/([^/]+)/) || path.match(/\/([^/]+)$/)
    return matches?.[1] || null
  }

  private getFromDataAttributes(): string | null {
    const selectors = ["[data-product-id]", "[data-sku]", "[data-product-code]", "[data-item-id]"]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element) {
        const value =
          element.getAttribute("data-product-id") ||
          element.getAttribute("data-sku") ||
          element.getAttribute("data-product-code") ||
          element.getAttribute("data-item-id")
        if (value) return value
      }
    }

    return null
  }

  private getFromSKU(): string | null {
    const skuSelectors = [".sku", ".product-sku", '[data-testid*="sku"]']
    return this.trySelectors(skuSelectors)
  }

  private generateFromContent(garment: GarmentInfo): string {
    // Generate hash from garment name and brand
    const content = `${garment.brand}-${garment.name}`.toLowerCase().replace(/[^a-z0-9]/g, "-")
    return content.substring(0, 50)
  }

  private inferCategory(productName: string): string {
    const name = productName.toLowerCase()

    if (name.includes("jean") || name.includes("denim")) return "jeans"
    if (name.includes("shirt") || name.includes("tee") || name.includes("top")) return "shirt"
    if (name.includes("pant") || name.includes("trouser") || name.includes("chino")) return "pants"
    if (name.includes("dress")) return "dress"
    if (name.includes("jacket") || name.includes("coat")) return "outerwear"
    if (name.includes("shoe") || name.includes("sneaker") || name.includes("boot")) return "shoes"

    return "clothing"
  }

  private calculateConfidence(garment: GarmentInfo, sizing: SizingInfo): number {
    let confidence = 0

    // Garment info scoring
    if (garment.name && garment.name !== "Unknown Product") confidence += 30
    if (garment.brand && garment.brand !== "Unknown Brand") confidence += 20 // Only add if not default
    if (garment.price) confidence += 10
    if (garment.images.length > 0) confidence += 10

    // Sizing info scoring
    if (sizing.availableSizes.length > 0) confidence += 20
    if (sizing.sizeChart && Object.keys(sizing.sizeChart).length > 0) confidence += 30
    if (sizing.sizeGuideUrl) confidence += 10

    return Math.min(confidence, 100)
  }

  private assessCompleteness(analysis: AnalysisResult): Partial<AnalysisResult> {
    const hasGarmentInfo = analysis.garment.name !== "Unknown Product" && analysis.garment.brand !== "Unknown Brand"
    const hasSizing = analysis.sizing.availableSizes.length > 0
    const hasMeasurements = analysis.sizing.sizeChart && Object.keys(analysis.sizing.sizeChart).length > 0

    // If confidence is below a certain threshold, it's likely not a product page or a very poor scrape.
    // In this case, always ask for manual URL input.
    // A confidence of 50 means it found a name AND a brand. If it only found one, it's lower.
    // Setting threshold to 55 means if it only found name+brand, it will go to URL input.
    // If it found name+brand+price OR name+brand+image, it's 60, which is enough to proceed.
    if (analysis.confidence < 55) {
      this.log(`Low confidence (${analysis.confidence}), setting status to incomplete and needs manual input.`)
      return {
        status: "incomplete",
        needsManualInput: true,
      }
    }

    if (hasGarmentInfo && hasSizing && hasMeasurements) {
      return { status: "complete" }
    }

    if (hasGarmentInfo && hasSizing) {
      // If we have garment info and available sizes, but no size chart,
      // it's a candidate for backend lookup.
      return {
        status: "partial",
        needsBackendLookup: true,
      }
    }

    // This path should ideally be covered by the confidence check above if it's truly a non-product page.
    // If it reaches here, it means confidence is >= 55, but it's still missing core info.
    // This might happen if, for example, it found a name and brand, but no sizes at all.
    // In such cases, manual input (URL) is still the best next step.
    return {
      status: "incomplete",
      needsManualInput: true,
    }
  }

  // Helper methods
  private trySelectors(selectors: string[]): { value: string | null; selector: string | null } {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        const textContent = element?.textContent?.trim();
        if (textContent) {
          this.log(`Found text "${textContent.substring(0, 50)}..." with selector: ${selector}`);
          return { value: textContent, selector: selector };
        }
      } catch (error) {
        this.log(`Error with selector ${selector}:`, error);
      }
    }
    return { value: null, selector: null };
  }

  private trySelectorsForAttribute(selectors: string[], attribute: string): { value: string | null; selector: string | null } {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const value = element.getAttribute(attribute);
          if (value) {
            this.log(`Found attribute ${attribute}="${value}" with selector: ${selector}`);
            return { value, selector };
          }
        }
      } catch (error) {
        this.log(`Error with selector ${selector}:`, error);
      }
    }
    return { value: null, selector: null };
  }
}
