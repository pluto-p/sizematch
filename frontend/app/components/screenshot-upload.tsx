"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ImageIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface ScreenshotUploadProps {
  productId: string
  onAnalysisComplete: (sizeChart: { [size: string]: { [measurement: string]: number } }) => void
  onCancel: () => void
}

export function ScreenshotUpload({ productId, onAnalysisComplete, onCancel }: ScreenshotUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null) // Stores the successful analysis data
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setAnalysisResult(null) // Clear previous results when a new file is selected
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setError(null)
    // DO NOT set analysisResult to null here. isAnalyzing handles the loading state.

    try {
      const formData = new FormData()
      formData.append("screenshot", selectedFile)
      formData.append("productId", productId)

      const response = await fetch("/api/size-chart/analyze", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setAnalysisResult(result) // Set the successful result
        // Call onAnalysisComplete immediately to transition the parent component
        onAnalysisComplete(result.extractedData)
      } else {
        setError(result.message || "Failed to analyze screenshot")
        setAnalysisResult(null) // Clear result on error
      }
    } catch (error) {
      console.error("Screenshot analysis error:", error)
      setError("Failed to upload and analyze screenshot")
      setAnalysisResult(null) // Clear result on error
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      setError(null)
      setAnalysisResult(null) // Clear previous results when a new file is dropped
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Upload Size Chart Screenshot
        </CardTitle>
        <CardDescription>
          We were not able to automatically detect the size chart. Take a screenshot of the size chart on this page and
          upload it. We'll extract the measurements automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area - always visible, content changes based on selectedFile */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button
                variant="link"
                onClick={() => {
                  setSelectedFile(null)
                  setAnalysisResult(null)
                  setError(null)
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Change File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium">Drop your screenshot here</p>
                <p className="text-gray-500">or click to browse</p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Analysis Results (if available and not currently analyzing) */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Analysis Complete!</p>
                <p className="text-sm">
                  Confidence: {Math.round(analysisResult.confidence * 100)}% • Processing time:{" "}
                  {analysisResult.processingTime}
                </p>
              </div>
            </div>

            {/* Extracted Size Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Extracted Size Chart:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries(analysisResult.extractedData).map(([size, measurements]) => (
                  <div key={size} className="flex justify-between p-2 bg-white rounded">
                    <span className="font-medium">Size {size}:</span>
                    <span>
                      {Object.entries(measurements as any)
                        .map(([key, value]) => `${key}: ${value}"`)
                        .join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isAnalyzing}
            className="flex-1 bg-gray-900 hover:bg-gray-800"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Screenshot"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
