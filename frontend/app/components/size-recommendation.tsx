"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { TargetGarment } from "./sizing-interface"
import type { Garment } from "./sizing-popup"
import { TrendingUp, TrendingDown, Minus, CheckCircle, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
// Declare the SizeRecommendation variable
type SizeRecommendation = {
  recommendedSize: string
  confidence: number
  reasoning: string
  alternatives: {
    size: string
    reason: string
    fit: "tighter" | "looser"
  }[]
  measurements: {
    measurement: string
    reference: number
    target: number
    difference: number
  }[]
}

// Add new props interface
interface SizeRecommendationProps {
  targetGarment: TargetGarment
  referenceGarment: Garment
  onAddToWardrobe?: (garment: Partial<Garment>) => void
  onNewSearch?: () => void
}

export function SizeRecommendation({
  targetGarment,
  referenceGarment,
  onAddToWardrobe,
  onNewSearch,
}: SizeRecommendationProps) {
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null)
  const [isCalculating, setIsCalculating] = useState(true)

  useEffect(() => {
    calculateRecommendation()
  }, [targetGarment, referenceGarment])

  const calculateRecommendation = async () => {
    setIsCalculating(true)

    // Simulate calculation time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const result = generateSizeRecommendation(targetGarment, referenceGarment)
    setRecommendation(result)
    setIsCalculating(false)
  }

  const handleAddToWardrobe = () => {
    if (!recommendation || !onAddToWardrobe) return

    const newGarment: Partial<Garment> = {
      brand: targetGarment.brand,
      name: targetGarment.name,
      category: targetGarment.category,
      size: recommendation.recommendedSize,
      measurements: targetGarment.sizeChart[recommendation.recommendedSize],
      fit: "regular", // Default fit
      url: targetGarment.url,
    }

    onAddToWardrobe(newGarment)
  }

  if (isCalculating) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Analyzing measurements and calculating recommendation...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!recommendation) return null

  return (
    <div className="space-y-4">
      {/* Main Recommendation */}
      <Card className="border-gray-300 bg-gray-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Size Recommendation
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-200 text-gray-800">
              {recommendation.confidence}% confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-gray-900 mb-2">Size {recommendation.recommendedSize}</div>
            <p className="text-gray-700">{recommendation.reasoning}</p>
          </div>

          <Progress value={recommendation.confidence} className="mb-4" />

          <div className="text-sm text-gray-600 text-center mb-4">
            Based on your {referenceGarment.brand} {referenceGarment.name} (Size {referenceGarment.size})
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleAddToWardrobe} className="flex-1 bg-gray-900 hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Add to Wardrobe
            </Button>
            <Button onClick={onNewSearch} variant="outline" className="flex-1 border-gray-300 bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              New Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Measurement Comparison</CardTitle>
          <CardDescription>How the recommended size compares to your reference garment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendation.measurements.map((measurement) => (
              <div
                key={measurement.measurement}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium capitalize">{measurement.measurement}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{measurement.reference}"</span>
                    <span>→</span>
                    <span>{measurement.target}"</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {measurement.difference > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600 text-sm">+{measurement.difference}"</span>
                    </>
                  ) : measurement.difference < 0 ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-orange-500" />
                      <span className="text-orange-600 text-sm">{measurement.difference}"</span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">Same</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Sizes */}
      {recommendation.alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternative Sizes</CardTitle>
            <CardDescription>If you prefer a different fit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {recommendation.alternatives.map((alt, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Size {alt.size}</span>
                    <p className="text-sm text-gray-600">{alt.reason}</p>
                  </div>
                  <Badge variant={alt.fit === "tighter" ? "destructive" : "secondary"}>{alt.fit} fit</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function generateSizeRecommendation(target: TargetGarment, reference: Garment): SizeRecommendation {
  // This is a simplified algorithm - in reality, this would be much more sophisticated

  const targetSizes = Object.keys(target.sizeChart)
  const referenceMeasurements = reference.measurements

  let bestSize = targetSizes[0]
  let bestScore = Number.NEGATIVE_INFINITY
  const measurements: SizeRecommendation["measurements"] = []

  // Find the best matching size based on measurements
  for (const size of targetSizes) {
    const targetMeasurements = target.sizeChart[size]
    let score = 0
    let matchCount = 0

    for (const [measurement, refValue] of Object.entries(referenceMeasurements)) {
      if (targetMeasurements[measurement]) {
        const targetValue = targetMeasurements[measurement]
        const difference = Math.abs(targetValue - refValue)

        // Prefer closer measurements, with some tolerance for fit preference
        let measurementScore = 100 - difference * 10

        // Adjust for fit preference
        if (reference.fit === "tight" && targetValue > refValue) {
          measurementScore += 10 // Prefer slightly larger
        } else if (reference.fit === "loose" && targetValue < refValue) {
          measurementScore += 10 // Prefer slightly smaller
        }

        score += measurementScore
        matchCount++
      }
    }

    if (matchCount > 0) {
      score = score / matchCount
      if (score > bestScore) {
        bestScore = score
        bestSize = size
      }
    }
  }

  // Generate measurement comparisons
  const targetMeasurements = target.sizeChart[bestSize]
  for (const [measurement, refValue] of Object.entries(referenceMeasurements)) {
    if (targetMeasurements[measurement]) {
      measurements.push({
        measurement,
        reference: refValue,
        target: targetMeasurements[measurement],
        difference: targetMeasurements[measurement] - refValue,
      })
    }
  }

  // Calculate confidence based on how well measurements match
  const confidence = Math.min(95, Math.max(60, bestScore))

  // Generate reasoning
  let reasoning = `Based on your ${reference.fit} fit preference and measurement comparison`
  if (reference.fit === "tight") {
    reasoning += ", we recommend staying with a similar fit"
  } else if (reference.fit === "loose") {
    reasoning += ", we account for your preference for roomier clothing"
  }

  // Generate alternatives
  const alternatives: SizeRecommendation["alternatives"] = []
  const bestSizeIndex = targetSizes.indexOf(bestSize)

  if (bestSizeIndex > 0) {
    alternatives.push({
      size: targetSizes[bestSizeIndex - 1],
      reason: "For a more fitted look",
      fit: "tighter",
    })
  }

  if (bestSizeIndex < targetSizes.length - 1) {
    alternatives.push({
      size: targetSizes[bestSizeIndex + 1],
      reason: "For a more relaxed fit",
      fit: "looser",
    })
  }

  return {
    recommendedSize: bestSize,
    confidence: Math.round(confidence),
    reasoning,
    alternatives,
    measurements,
  }
}
