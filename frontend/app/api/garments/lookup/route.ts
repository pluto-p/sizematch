import { type NextRequest, NextResponse } from "next/server"

// Mock database of garment measurements
const MOCK_GARMENT_DATABASE = {
  "levi.com_511-slim-jeans": {
    sizeChart: {
      "28": { waist: 28, inseam: 32, rise: 8 },
      "30": { waist: 30, inseam: 32, rise: 8.5 },
      "32": { waist: 32, inseam: 32, rise: 9 },
      "34": { waist: 34, inseam: 32, rise: 9.5 },
      "36": { waist: 36, inseam: 32, rise: 10 },
    },
    lastUpdated: "2024-01-15",
    source: "scraped",
  },
  "uniqlo.com_slim-fit-chinos": {
    sizeChart: {
      S: { waist: 30, inseam: 32, length: 28 },
      M: { waist: 32, inseam: 32, length: 29 },
      L: { waist: 34, inseam: 32, length: 30 },
      XL: { waist: 36, inseam: 32, length: 31 },
    },
    lastUpdated: "2024-01-10",
    source: "manual",
  },
  "hm.com_cotton-tshirt": {
    sizeChart: {
      S: { chest: 38, length: 27, shoulder: 17 },
      M: { chest: 40, length: 28, shoulder: 18 },
      L: { chest: 42, length: 29, shoulder: 19 },
      XL: { chest: 44, length: 30, shoulder: 20 },
    },
    lastUpdated: "2024-01-12",
    source: "scraped",
  },
}

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()

    console.log(`[Mock API] Looking up product: ${productId}`)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const garmentData = MOCK_GARMENT_DATABASE[productId as keyof typeof MOCK_GARMENT_DATABASE]

    if (garmentData) {
      console.log(`[Mock API] Found data for ${productId}`)
      return NextResponse.json({
        found: true,
        sizeChart: garmentData.sizeChart,
        lastUpdated: garmentData.lastUpdated,
        source: garmentData.source,
      })
    } else {
      console.log(`[Mock API] No data found for ${productId}`)
      return NextResponse.json({
        found: false,
        sizeChart: null,
        message: "No size chart data available for this product",
      })
    }
  } catch (error) {
    console.error("[Mock API] Error in garment lookup:", error)
    return NextResponse.json({ error: "Failed to lookup garment data" }, { status: 500 })
  }
}
