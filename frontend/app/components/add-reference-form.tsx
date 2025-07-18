"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"
import type { Garment } from "./sizing-popup"
import Image from "next/image"

interface ScrapedGarment {
  brand: string
  name: string
  category: string
  imageUrl?: string
  sizeChart: { [size: string]: { [measurement: string]: number } }
}

interface AddReferenceFormProps {
  onSubmit: (data: Partial<Garment>) => void
  onCancel: () => void
}

export function AddReferenceForm({ onSubmit, onCancel }: AddReferenceFormProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedGarment | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [fit, setFit] = useState<"tight" | "regular" | "loose">("regular")

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    try {
      // Simulate scraping
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock scraped data based on URL
      let mockData: ScrapedGarment

      if (url.toLowerCase().includes("uniqlo")) {
        mockData = {
          brand: "Uniqlo",
          name: "Slim Fit Chino Pants",
          category: "pants",
          imageUrl: "/placeholder.svg?height=200&width=200",
          sizeChart: {
            S: { waist: 30, inseam: 32, length: 28 },
            M: { waist: 32, inseam: 32, length: 29 },
            L: { waist: 34, inseam: 32, length: 30 },
            XL: { waist: 36, inseam: 32, length: 31 },
          },
        }
      } else if (url.toLowerCase().includes("levi")) {
        mockData = {
          brand: "Levi's",
          name: "511 Slim Jeans",
          category: "jeans",
          imageUrl: "/placeholder.svg?height=200&width=200",
          sizeChart: {
            "28": { waist: 28, inseam: 32 },
            "30": { waist: 30, inseam: 32 },
            "32": { waist: 32, inseam: 32 },
            "34": { waist: 34, inseam: 32 },
          },
        }
      } else {
        mockData = {
          brand: "Generic Brand",
          name: "Classic Shirt",
          category: "shirt",
          imageUrl: "/placeholder.svg?height=200&width=200",
          sizeChart: {
            S: { chest: 38, length: 27 },
            M: { chest: 40, length: 28 },
            L: { chest: 42, length: 29 },
            XL: { chest: 44, length: 30 },
          },
        }
      }

      setScrapedData(mockData)
    } catch (error) {
      console.error("Failed to scrape:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalSubmit = () => {
    if (!scrapedData || !selectedSize) return

    const measurements = scrapedData.sizeChart[selectedSize] || {}

    onSubmit({
      brand: scrapedData.brand,
      name: scrapedData.name,
      category: scrapedData.category,
      size: selectedSize,
      fit,
      url,
      measurements,
    })
  }

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Reference Garment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <Label htmlFor="product-url">Product URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="product-url"
                  type="url"
                  placeholder="https://example.com/product/jeans"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={isLoading} className="bg-gray-900 hover:bg-gray-800">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Go
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Scraped Data Display */}
      {scrapedData && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Size</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              {scrapedData.imageUrl && (
                <Image
                  src={scrapedData.imageUrl || "/placeholder.svg"}
                  alt={scrapedData.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold">{scrapedData.name}</h4>
                <p className="text-sm text-gray-600">{scrapedData.brand}</p>
                <Badge variant="outline" className="mt-2">
                  {scrapedData.category}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="size">Size You Purchased</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(scrapedData.sizeChart).map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fit">How did it fit?</Label>
                <Select value={fit} onValueChange={(value: "tight" | "regular" | "loose") => setFit(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tight">Tight</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="loose">Loose</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Show measurements for selected size */}
            {selectedSize && scrapedData.sizeChart[selectedSize] && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium mb-2">Measurements for Size {selectedSize}:</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(scrapedData.sizeChart[selectedSize]).map(([measurement, value]) => (
                    <div key={measurement} className="flex justify-between">
                      <span className="capitalize">{measurement}:</span>
                      <span>{value}&quot;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={!selectedSize}
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                Add to Wardrobe
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
