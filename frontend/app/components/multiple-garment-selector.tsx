"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AnalysisResult } from "../utils/garment-analyzer"

interface MultipleGarmentSelectorProps {
  garments: AnalysisResult[]
  onGarmentSelect: (garment: AnalysisResult) => void
  onCancel: () => void
}

export function MultipleGarmentSelector({ garments, onGarmentSelect, onCancel }: MultipleGarmentSelectorProps) {
  const [selectedGarmentId, setSelectedGarmentId] = useState<string>("")

  const selectedGarment = garments.find((g) => g.productId === selectedGarmentId)

  const handleConfirm = () => {
    if (selectedGarment) {
      onGarmentSelect(selectedGarment)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Multiple Garments Detected</CardTitle>
        <CardDescription>
          We found {garments.length} garments on this page. Please select the one you're interested in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Garment Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Garment:</label>
          <Select value={selectedGarmentId} onValueChange={setSelectedGarmentId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a garment..." />
            </SelectTrigger>
            <SelectContent>
              {garments.map((garment) => (
                <SelectItem key={garment.productId} value={garment.productId}>
                  <div className="flex items-center gap-2">
                    <span>{garment.garment.brand}</span>
                    <span>-</span>
                    <span>{garment.garment.name}</span>
                    {garment.garment.price && <Badge variant="outline">{garment.garment.price}</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Garment Preview */}
        {selectedGarment && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex gap-4">
              {selectedGarment.garment.images[0] && (
                <img
                  src={selectedGarment.garment.images[0] || "/placeholder.svg"}
                  alt={selectedGarment.garment.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold">{selectedGarment.garment.name}</h4>
                <p className="text-sm text-gray-600">{selectedGarment.garment.brand}</p>
                {selectedGarment.garment.price && (
                  <p className="text-sm font-medium">{selectedGarment.garment.price}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedGarment.garment.category}</Badge>
                  <Badge variant={selectedGarment.status === "complete" ? "default" : "secondary"}>
                    {selectedGarment.status}
                  </Badge>
                  <Badge variant="outline">{selectedGarment.confidence}% confidence</Badge>
                </div>
                {selectedGarment.sizing.availableSizes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sizes: {selectedGarment.sizing.availableSizes.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedGarment} className="flex-1 bg-gray-900 hover:bg-gray-800">
            Continue with Selected Garment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
