import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const screenshot = formData.get("screenshot") as File
    const productId = formData.get("productId") as string

    console.log(`[Mock API] Analyzing screenshot for product: ${productId}`)
    console.log(`[Mock API] Screenshot file: ${screenshot?.name}, size: ${screenshot?.size} bytes`)

    // Simulate processing time for image analysis
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Mock extracted data based on product type/ID
    let mockExtractedData = {}
    let confidence = 0.85

    if (productId.includes("jeans") || productId.includes("pants") || productId.includes("levi")) {
      mockExtractedData = {
        "28": { waist: 28, inseam: 32, rise: 8 },
        "30": { waist: 30, inseam: 32, rise: 8.5 },
        "32": { waist: 32, inseam: 32, rise: 9 },
        "34": { waist: 34, inseam: 32, rise: 9.5 },
        "36": { waist: 36, inseam: 32, rise: 10 },
      }
      confidence = 0.92
    } else if (productId.includes("shirt") || productId.includes("tshirt") || productId.includes("top")) {
      mockExtractedData = {
        S: { chest: 38, length: 27, shoulder: 17 },
        M: { chest: 40, length: 28, shoulder: 18 },
        L: { chest: 42, length: 29, shoulder: 19 },
        XL: { chest: 44, length: 30, shoulder: 20 },
      }
      confidence = 0.88
    } else if (productId.includes("uniqlo") || productId.includes("chino")) {
      mockExtractedData = {
        S: { waist: 30, inseam: 32, length: 28 },
        M: { waist: 32, inseam: 32, length: 29 },
        L: { waist: 34, inseam: 32, length: 30 },
        XL: { waist: 36, inseam: 32, length: 31 },
      }
      confidence = 0.85
    } else {
      // Generic sizing
      mockExtractedData = {
        S: { chest: 36, length: 26 },
        M: { chest: 38, length: 27 },
        L: { chest: 40, length: 28 },
        XL: { chest: 42, length: 29 },
      }
      confidence = 0.75
    }

    console.log(`[Mock API] Extracted data:`, mockExtractedData)

    return NextResponse.json({
      success: true,
      extractedData: mockExtractedData,
      confidence,
      message: "Size chart successfully analyzed",
      processingTime: "2.3s",
    })
  } catch (error) {
    console.error("[Mock API] Error in screenshot analysis:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze screenshot",
        message: "Please try uploading a clearer image of the size chart",
      },
      { status: 500 },
    )
  }
}
