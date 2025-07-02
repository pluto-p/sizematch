"use server"

import type { GarmentData } from "../page"

export async function scrapeGarmentData(url: string): Promise<GarmentData> {
  try {
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch webpage")
    }

    const html = await response.text()

    // Parse the HTML to extract garment data
    const garmentData = parseGarmentData(html, url)

    return garmentData
  } catch (error) {
    console.error("Error scraping garment data:", error)
    throw new Error("Failed to scrape garment data")
  }
}

function parseGarmentData(html: string, url: string): GarmentData {
  // This is a simplified parser - in a real implementation, you'd want to
  // handle different e-commerce sites with specific selectors

  // Extract product name
  const productNameMatch =
    html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
    html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
    html.match(/product[^>]*name[^>]*>([^<]+)<\/[^>]*>/i)
  const productName = productNameMatch ? productNameMatch[1].trim() : "Unknown Product"

  // Extract brand (this is simplified - real implementation would be more sophisticated)
  const brandMatch = html.match(/brand[^>]*>([^<]+)<\/[^>]*>/i) || html.match(/manufacturer[^>]*>([^<]+)<\/[^>]*>/i)
  const brand = brandMatch ? brandMatch[1].trim() : extractBrandFromUrl(url)

  // Extract price
  const priceMatch = html.match(/\$[\d,]+\.?\d*/g) || html.match(/price[^>]*>([^<]*\$[^<]*)<\/[^>]*>/i)
  const price = priceMatch ? priceMatch[0] : undefined

  // Extract image URL
  const imageMatch =
    html.match(/<img[^>]+src=["']([^"']+)["'][^>]*product/i) || html.match(/<img[^>]+product[^>]+src=["']([^"']+)["']/i)
  const imageUrl = imageMatch ? makeAbsoluteUrl(imageMatch[1], url) : undefined

  // Extract size information - this is the key part
  const sizes = extractSizeData(html)

  return {
    productName: cleanText(productName),
    brand: cleanText(brand),
    sizes,
    imageUrl,
    price,
  }
}

function extractSizeData(html: string): { [key: string]: string[] } {
  const sizes: { [key: string]: string[] } = {}

  // Look for common size patterns
  const sizePatterns = [
    // Waist sizes for jeans/pants
    {
      key: "waist",
      patterns: [
        /waist[^>]*>[\s\S]*?<select[^>]*>([\s\S]*?)<\/select>/gi,
        /size[^>]*waist[^>]*>[\s\S]*?<select[^>]*>([\s\S]*?)<\/select>/gi,
      ],
    },
    // Length/inseam for jeans/pants
    {
      key: "length",
      patterns: [
        /length[^>]*>[\s\S]*?<select[^>]*>([\s\S]*?)<\/select>/gi,
        /inseam[^>]*>[\s\S]*?<select[^>]*>([\s\S]*?)<\/select>/gi,
      ],
    },
    // General size (S, M, L, XL, etc.)
    {
      key: "size",
      patterns: [
        /<select[^>]*size[^>]*>([\s\S]*?)<\/select>/gi,
        /size[^>]*>[\s\S]*?<select[^>]*>([\s\S]*?)<\/select>/gi,
      ],
    },
    // Chest size for shirts
    {
      key: "chest",
      patterns: [/chest[^>]*>[\s\S]*?<select[^>]*>([\s\S]*?)<\/select>/gi],
    },
  ]

  sizePatterns.forEach(({ key, patterns }) => {
    patterns.forEach((pattern) => {
      const matches = html.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          const options = extractOptionsFromSelect(match)
          if (options.length > 0) {
            sizes[key] = [...(sizes[key] || []), ...options]
          }
        })
      }
    })
  })

  // If no specific size categories found, look for any size-related selects
  if (Object.keys(sizes).length === 0) {
    const generalSizePattern = /<select[^>]*>([\s\S]*?)<\/select>/gi
    const selectMatches = html.match(generalSizePattern) || []

    selectMatches.forEach((selectHtml) => {
      if (
        selectHtml.toLowerCase().includes("size") ||
        selectHtml.toLowerCase().includes("waist") ||
        selectHtml.toLowerCase().includes("length")
      ) {
        const options = extractOptionsFromSelect(selectHtml)
        if (options.length > 0) {
          // Determine the type based on the options
          if (options.some((opt) => /^\d+$/.test(opt) && Number.parseInt(opt) > 20 && Number.parseInt(opt) < 50)) {
            sizes["waist"] = options
          } else if (options.some((opt) => /^(XS|S|M|L|XL|XXL)$/i.test(opt))) {
            sizes["size"] = options
          } else {
            sizes["size"] = options
          }
        }
      }
    })
  }

  // Remove duplicates and sort
  Object.keys(sizes).forEach((key) => {
    sizes[key] = [...new Set(sizes[key])].sort((a, b) => {
      // Try to sort numerically if possible
      const aNum = Number.parseInt(a)
      const bNum = Number.parseInt(b)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum
      }
      return a.localeCompare(b)
    })
  })

  // Fallback: if no sizes found, provide some default options
  if (Object.keys(sizes).length === 0) {
    sizes["size"] = ["S", "M", "L", "XL"]
  }

  return sizes
}

function extractOptionsFromSelect(selectHtml: string): string[] {
  const optionPattern = /<option[^>]*value=["']([^"']+)["'][^>]*>([^<]*)<\/option>/gi
  const options: string[] = []
  let match

  while ((match = optionPattern.exec(selectHtml)) !== null) {
    const value = match[1].trim()
    const text = match[2].trim()

    // Use text if it's meaningful, otherwise use value
    const optionValue = text && text !== value && text.length > 0 ? text : value

    if (optionValue && optionValue !== "Select" && optionValue !== "Choose") {
      options.push(optionValue)
    }
  }

  return options
}

function extractBrandFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname
    const parts = hostname.split(".")
    return parts.length > 1 ? parts[parts.length - 2] : hostname
  } catch {
    return "Unknown Brand"
  }
}

function makeAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href
  } catch {
    return url
  }
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}
