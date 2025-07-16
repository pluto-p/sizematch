"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { GarmentData } from "../actions/scrape-garment"
import Image from "next/image"

interface SizeSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  garmentData: GarmentData
  onSizeSelect: (selectedSizes: { [key: string]: string }) => void
}

export function SizeSelectionModal({ isOpen, onClose, garmentData, onSizeSelect }: SizeSelectionModalProps) {
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({})

  const handleSizeChange = (measurement: string, value: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [measurement]: value,
    }))
  }

  const handleSubmit = () => {
    // Check if all required measurements are selected
    const allMeasurementsSelected = Object.keys(garmentData.sizes).every((measurement) => selectedSizes[measurement])

    if (allMeasurementsSelected) {
      onSizeSelect(selectedSizes)
    }
  }

  const isSubmitDisabled = !Object.keys(garmentData.sizes).every((measurement) => selectedSizes[measurement])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Select size of the {garmentData.productName} from {garmentData.brand}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {garmentData.imageUrl && (
            <div className="flex justify-center">
              <Image
                src={garmentData.imageUrl || "/placeholder.svg"}
                alt={garmentData.productName}
                width={200}
                height={200}
                className="rounded-lg object-cover"
              />
            </div>
          )}

          {garmentData.price && <div className="text-center text-lg font-semibold">{garmentData.price}</div>}

          <div className="space-y-4">
            {Object.entries(garmentData.sizes).map(([measurement, options]) => (
              <div key={measurement} className="space-y-2">
                <Label htmlFor={measurement} className="capitalize">
                  {measurement}
                </Label>
                <Select
                  value={selectedSizes[measurement] || ""}
                  onValueChange={(value) => handleSizeChange(measurement, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${measurement}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitDisabled} className="flex-1">
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
