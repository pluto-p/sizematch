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
    if (this.debug) {
      console.log(`[GarmentAnalyzer] ${message}`, ...args)
    }
  }

  async analyzeCurrentPage(): Promise<AnalysisResult> {
    this.log("Starting page analysis...")

    const garment = this.extractGarmentInfo()
    const sizing = this.extractSizingInfo()
    const productId = this.generateProductId(garment)
    const confidence = this.calculateConfidence(garment, sizing)

    const analysis: AnalysisResult = {
      garment,
      sizing,
      productId,
      confidence,
      status: "incomplete",
    }

    // Assess completeness
    const assessment = this.assessCompleteness(analysis)
    return { ...analysis, ...assessment }
  }

  private extractGarmentInfo(): GarmentInfo {
    this.log("Extracting garment information...")

    const name = this.findProductName()
    const brand = this.findBrand()
    const price = this.findPrice()
    const images = this.findProductImages()
    const category = this.inferCategory(name)

    this.log("Extracted garment info:", { name, brand, price, images: images.length, category })

    return { name, brand, price, images, category }
  }

  private findProductName(): string {
    const selectors = [
      'h1[class*="product"]',
      ".product-title",
      ".product-name",
      '[data-testid*="product-name"]',
      '[data-testid*="product-title"]',
      ".pdp-product-name",
      ".product-details h1",
      "h1:first-of-type",
    ]

    return this.trySelectors(selectors) || "Unknown Product"
  }

  private findBrand(): string {
    const selectors = [
      ".product-brand",
      ".brand-name",
      '[data-testid*="brand"]',
      ".pdp-brand",
      ".product-details .brand",
    ]

    const brand = this.trySelectors(selectors)
    if (brand) return brand

    // Fallback: extract from hostname
    const hostname = window.location.hostname.replace(/^www\./, "")
    const brandFromDomain = hostname.split(".")[0]
    return brandFromDomain.charAt(0).toUpperCase() + brandFromDomain.slice(1)
  }

  private findPrice(): string | undefined {
    const selectors = [
      ".price",
      ".product-price",
      '[data-testid*="price"]',
      ".pdp-price",
      ".current-price",
      ".sale-price",
    ]

    // Also look for price patterns in text
    const pricePattern = /\$[\d,]+\.?\d*/
    const bodyText = document.body.textContent || ""
    const priceMatch = bodyText.match(pricePattern)

    return this.trySelectors(selectors) || priceMatch?.[0]
  }

  private findProductImages(): string[] {
    const images: string[] = []

    const selectors = [
      ".product-image img",
      ".product-gallery img",
      ".pdp-image img",
      '[data-testid*="product-image"] img',
      ".main-image img",
    ]

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach((img) => {
        const src = (img as HTMLImageElement).src
        if (src && !src.includes("placeholder") && !images.includes(src)) {
          images.push(src)
        }
      })
    })

    return images.slice(0, 5) // Limit to 5 images
  }

  private extractSizingInfo(): SizingInfo {
    this.log("Extracting sizing information...")

    const availableSizes = this.findAvailableSizes()
    const sizeChart = this.findSizeChart()
    const sizeGuideUrl = this.findSizeGuideLink()

    this.log("Extracted sizing info:", { availableSizes, sizeChart, sizeGuideUrl })

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
    if (garment.brand) confidence += 20
    if (garment.price) confidence += 10
    if (garment.images.length > 0) confidence += 10

    // Sizing info scoring
    if (sizing.availableSizes.length > 0) confidence += 20
    if (sizing.sizeChart && Object.keys(sizing.sizeChart).length > 0) confidence += 30
    if (sizing.sizeGuideUrl) confidence += 10

    return Math.min(confidence, 100)
  }

  private assessCompleteness(analysis: AnalysisResult): Partial<AnalysisResult> {
    const hasGarmentInfo = analysis.garment.name !== "Unknown Product" && analysis.garment.brand
    const hasSizing = analysis.sizing.availableSizes.length > 0
    const hasMeasurements = analysis.sizing.sizeChart && Object.keys(analysis.sizing.sizeChart).length > 0

    if (hasGarmentInfo && hasSizing && hasMeasurements) {
      return { status: "complete" }
    }

    if (hasGarmentInfo && hasSizing) {
      return {
        status: "partial",
        needsBackendLookup: true,
      }
    }

    return {
      status: "incomplete",
      needsManualInput: true,
    }
  }

  // Helper methods
  private trySelectors(selectors: string[]): string | null {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector)
        if (element?.textContent?.trim()) {
          return element.textContent.trim()
        }
      } catch (error) {
        this.log(`Error with selector ${selector}:`, error)
      }
    }
    return null
  }

  private trySelectorsForAttribute(selectors: string[], attribute: string): string | null {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector)
        if (element) {
          const value = element.getAttribute(attribute)
          if (value) return value
        }
      } catch (error) {
        this.log(`Error with selector ${selector}:`, error)
      }
    }
    return null
  }
}
