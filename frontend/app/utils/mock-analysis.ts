import type { AnalysisResult } from "./garment-analyzer"

export const mockAnalysisResults = {
  // Scenario 1: Complete data (e.g., Levi's page with full size chart)
  completeLeviJeans: {
    garment: {
      name: "511™ Slim Jeans",
      brand: "Levi's",
      price: "$79.50",
      images: ["/placeholder.svg?height=200&width=200"],
      category: "jeans",
    },
    sizing: {
      availableSizes: ["28", "30", "32", "34", "36"],
      sizeChart: {
        "28": { waist: 28, inseam: 32, rise: 8 },
        "30": { waist: 30, inseam: 32, rise: 8.5 },
        "32": { waist: 32, inseam: 32, rise: 9 },
        "34": { waist: 34, inseam: 32, rise: 9.5 },
        "36": { waist: 36, inseam: 32, rise: 10 },
      },
    },
    productId: "levi.com_511-slim-jeans",
    confidence: 95,
    status: "complete",
    needsBackendLookup: false,
    needsManualInput: false,
  } as AnalysisResult,

  // Scenario 2: Partial data, needs backend lookup (e.g., a page with sizes but no visible chart)
  partialUniqloChinos: {
    garment: {
      name: "Slim Fit Chino Pants",
      brand: "Uniqlo",
      price: "$39.90",
      images: ["/placeholder.svg?height=200&width=200"],
      category: "pants",
    },
    sizing: {
      availableSizes: ["S", "M", "L", "XL"],
      sizeChart: undefined, // No size chart found on DOM
    },
    productId: "uniqlo.com_slim-chinos",
    confidence: 80,
    status: "partial",
    needsBackendLookup: true, // Will trigger backend lookup
    needsManualInput: false,
  } as AnalysisResult,

  // Scenario 3: No size chart, needs screenshot upload (e.g., a new retailer or complex layout)
  needsScreenshotGenericShirt: {
    garment: {
      name: "Classic Cotton T-Shirt",
      brand: "Generic Brand",
      price: "$25.00",
      images: ["/placeholder.svg?height=200&width=200"],
      category: "shirt",
    },
    sizing: {
      availableSizes: ["S", "M", "L", "XL"],
      sizeChart: undefined,
    },
    productId: "generic.com_classic-tshirt",
    confidence: 70,
    status: "partial",
    needsBackendLookup: false, // Backend lookup failed or not applicable
    needsManualInput: true, // Will trigger screenshot upload
  } as AnalysisResult,

  // Scenario 4: No garment detected (e.g., running on a non-product page)
  noGarmentDetected: {
    garment: {
      name: "Unknown Product",
      brand: "Unknown Brand",
      images: [],
    },
    sizing: {
      availableSizes: [],
    },
    productId: "unknown_product",
    confidence: 10, // Low confidence
    status: "incomplete",
    needsBackendLookup: false,
    needsManualInput: true, // Will trigger URL input
  } as AnalysisResult,

  // Scenario 5: Multiple garments detected (mocked for the multiple-garment-selector)
  multipleGarments: [
    {
      garment: {
        name: "Product A",
        brand: "Brand X",
        price: "$100",
        images: ["/placeholder.svg?height=100&width=100"],
      },
      sizing: { availableSizes: ["S", "M"], sizeChart: { S: { chest: 38 } } },
      productId: "brandx_product-a",
      confidence: 90,
      status: "complete",
    },
    {
      garment: {
        name: "Product B",
        brand: "Brand X",
        price: "$120",
        images: ["/placeholder.svg?height=100&width=100"],
      },
      sizing: { availableSizes: ["L", "XL"], sizeChart: { L: { chest: 42 } } },
      productId: "brandx_product-b",
      confidence: 85,
      status: "complete",
    },
  ] as AnalysisResult[],
}
