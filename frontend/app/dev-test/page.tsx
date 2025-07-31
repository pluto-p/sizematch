"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SizingPopup } from "../components/sizing-popup"
import { Input } from "@/components/ui/input"
import { uniqloStrategy } from "../api/size-chart/utils/retailers/uniqlo"

export default function DevTestPage() {
  const [showPopup, setShowPopup] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<string>("live")
  const [currentUrl, setCurrentUrl] = useState("")

  const [testUrl, setTestUrl] = useState<string>("https://www.uniqlo.com/us/en/products/E465185-000/00")
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apiResponse, setApiResponse] = useState<any>(null)

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleOpenPopup = () => {
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  const testUniqloStrategy = async () => {
    try {
      setIsLoading(true)
      const sizeChartUrl = await uniqloStrategy(testUrl)
      setResultUrl(sizeChartUrl)

      // Test scraping the size chart
      const response = await fetch("/api/size-chart/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: testUrl,
          retailer: "uniqlo",
        }),
      })

      const data = await response.json()
      setApiResponse(data)
    } catch (error) {
      console.error("Error testing Uniqlo strategy:", error)
      setApiResponse({ error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">RunwAI Development Test Bench</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="scenario-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Scenario:
            </label>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger id="scenario-select">
                <SelectValue placeholder="Choose a test scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live Page Analysis (Current URL)</SelectItem>
                <SelectItem value="completeLeviJeans">Levi&apos;s Jeans (Complete Data)</SelectItem>
                <SelectItem value="partialUniqloChinos">Uniqlo Chinos (Needs Backend Lookup)</SelectItem>
                <SelectItem value="needsScreenshotGenericShirt">Generic Shirt (Needs Screenshot)</SelectItem>
                <SelectItem value="noGarmentDetected">No Garment Detected (Triggers URL Input)</SelectItem>
                <SelectItem value="multipleGarments">Multiple Garments Detected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleOpenPopup} className="w-full bg-gray-900 hover:bg-gray-800">
            Open RunwAI Popup
          </Button>
        </CardContent>
      </Card>

      <SizingPopup
        isOpen={showPopup}
        onClose={handleClosePopup}
        currentUrl={currentUrl}
      />

      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>This page allows you to simulate different RunwAI analysis outcomes for development and testing.</p>
        <p>Select a scenario and click &quot;Open RunwAI Popup&quot; to see the flow.</p>
      </div>

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Development Testing Page</h1>

        <Card className="p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Uniqlo Size Chart Scraper Test</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="uniqlo-url" className="block text-sm font-medium mb-1">
                Uniqlo Product URL
              </label>
              <Input
                id="uniqlo-url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://www.uniqlo.com/us/en/products/..."
                className="w-full"
              />
            </div>

            <Button onClick={testUniqloStrategy} disabled={isLoading}>
              {isLoading ? "Testing..." : "Test Uniqlo Scraper"}
            </Button>

            {resultUrl && (
              <div className="mt-4">
                <h3 className="text-lg font-medium">Size Chart URL:</h3>
                <div className="p-2 bg-gray-100 rounded overflow-auto">
                  {resultUrl}
                </div>
              </div>
            )}

            {apiResponse && (
              <div className="mt-4">
                <h3 className="text-lg font-medium">API Response:</h3>
                <div className="p-2 bg-gray-100 rounded overflow-auto">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
