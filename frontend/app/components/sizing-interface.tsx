"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PurchaseHistory } from "./purchase-history"
import { SizeRecommendation } from "./size-recommendation"
import { detectGarmentFromPage, scrapeGarmentFromUrl } from "../utils/garment-detection"
import type { User, Garment } from "./sizing-popup"
import { LogOut, Search } from "lucide-react"

interface SizingInterfaceProps {
  user: User
  currentUrl: string
  onLogout: () => void
}

export type TargetGarment = {
  brand: string
  name: string
  category: string
  gender?: string
  sizeChart: { [size: string]: { [measurement: string]: number } }
  imageUrl?: string
  url: string
}

export function SizingInterface({ user, currentUrl, onLogout }: SizingInterfaceProps) {
  const [targetGarment, setTargetGarment] = useState<TargetGarment | null>(null)
  const [selectedReference, setSelectedReference] = useState<Garment | null>(null)
  const [manualUrl, setManualUrl] = useState("")
  const [isDetecting, setIsDetecting] = useState(true)
  const [isOnRetailerSite, setIsOnRetailerSite] = useState(false)
  const [purchases, setPurchases] = useState<Garment[]>([]) // Add this state

  useEffect(() => {
    detectCurrentPageGarment()
  }, [currentUrl])

  const detectCurrentPageGarment = async () => {
    setIsDetecting(true)
    try {
      const detected = await detectGarmentFromPage(currentUrl)
      if (detected) {
        setTargetGarment(detected)
        setIsOnRetailerSite(true)
      } else {
        setIsOnRetailerSite(false)
      }
    } catch (error) {
      console.error("Failed to detect garment:", error)
      setIsOnRetailerSite(false)
    } finally {
      setIsDetecting(false)
    }
  }

  const handleManualUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualUrl.trim()) return

    setIsDetecting(true)
    try {
      const scraped = await scrapeGarmentFromUrl(manualUrl)
      setTargetGarment(scraped)
    } catch (error) {
      console.error("Failed to scrape garment:", error)
    } finally {
      setIsDetecting(false)
    }
  }

  // Add handlers for new functionality
  const handleAddToWardrobe = (garmentData: Partial<Garment>) => {
    const newGarment: Garment = {
      id: Date.now().toString(),
      brand: garmentData.brand || "",
      name: garmentData.name || "",
      category: garmentData.category || "",
      size: garmentData.size || "",
      measurements: garmentData.measurements || {},
      fit: garmentData.fit || "regular",
      imageUrl: garmentData.imageUrl || "/placeholder.svg?height=100&width=100",
      purchaseDate: new Date().toISOString().split("T")[0],
      url: garmentData.url,
    }

    setPurchases((prev) => [newGarment, ...prev])
    // Show success message or toast here
  }

  const handleNewSearch = () => {
    setTargetGarment(null)
    setSelectedReference(null)
    setManualUrl("")
    detectCurrentPageGarment() // Re-detect current page
  }

  return (
    <div className="flex w-full h-full">
      {/* Left Sidebar - Purchase History */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Welcome, {user.name}</h3>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Your Purchase History</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <PurchaseHistory
            userId={user.id}
            onSelectGarment={setSelectedReference}
            selectedGarment={selectedReference}
            purchases={purchases}
            setPurchases={setPurchases}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-[90vw] mx-auto">
        {/* Header */}
        <div className="p-6 border-b bg-white">
          <h2 className="text-2xl font-bold text-gray-900">RunwAI</h2>
          <p className="text-gray-600">Find your perfect size using your purchase history</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isDetecting ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>Detecting garment information...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Target Garment Section */}
              <Card className="max-w-[80vw] mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Target Garment</span>
                    {isOnRetailerSite && <Badge variant="secondary">Auto-detected</Badge>}
                  </CardTitle>
                  <CardDescription>
                    {isOnRetailerSite
                      ? "We've detected garment information from this page"
                      : "Provide a product URL to get sizing recommendations"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {targetGarment ? (
                    <div className="flex gap-4">
                      {targetGarment.imageUrl && (
                        <img
                          src={targetGarment.imageUrl || "/placeholder.svg"}
                          alt={targetGarment.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{targetGarment.name}</h4>
                        <p className="text-sm text-gray-600">{targetGarment.brand}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{targetGarment.category}</Badge>
                          {targetGarment.gender && <Badge variant="outline">{targetGarment.gender}</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Available sizes: {Object.keys(targetGarment.sizeChart).join(", ")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleManualUrlSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="product-url">Product URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="product-url"
                            type="url"
                            placeholder="https://example.com/product/jeans"
                            value={manualUrl}
                            onChange={(e) => setManualUrl(e.target.value)}
                            required
                          />
                          <Button type="submit">
                            <Search className="h-4 w-4 mr-2" />
                            Go
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Size Recommendation */}
              {targetGarment && selectedReference && (
                <SizeRecommendation
                  targetGarment={targetGarment}
                  referenceGarment={selectedReference}
                  onAddToWardrobe={handleAddToWardrobe}
                  onNewSearch={handleNewSearch}
                />
              )}

              {/* Instructions */}
              {!selectedReference && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <p className="mb-2">👈 Select a reference garment from your purchase history</p>
                      <p className="text-sm">We'll compare measurements to recommend the best size</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
