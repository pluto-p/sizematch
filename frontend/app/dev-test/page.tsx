"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SizingPopup } from "../components/sizing-popup"
import { mockAnalysisResults } from "../utils/mock-analysis"
import type { AnalysisResult } from "../utils/garment-analyzer"

export default function DevTestPage() {
  const [showPopup, setShowPopup] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<string>("live")
  const [mockResult, setMockResult] = useState<AnalysisResult | AnalysisResult[] | null>(null)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleOpenPopup = () => {
    let resultToPass: AnalysisResult | AnalysisResult[] | null = null

    if (selectedScenario !== "live") {
      resultToPass = mockAnalysisResults[selectedScenario as keyof typeof mockAnalysisResults]
    }
    setMockResult(resultToPass)
    setShowPopup(true)
  }

  const handleClosePopup = () => {
    setShowPopup(false)
    setMockResult(null) // Clear mock result on close
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
        mockAnalysisResult={mockResult}
      />

      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>This page allows you to simulate different RunwAI analysis outcomes for development and testing.</p>
        <p>Select a scenario and click &quot;Open RunwAI Popup&quot; to see the flow.</p>
      </div>
    </div>
  )
}
