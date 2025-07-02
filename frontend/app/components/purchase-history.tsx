"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import type { Garment } from "./sizing-popup"
import { Plus, Search } from "lucide-react"
import { AddReferenceForm } from "./add-reference-form"

interface PurchaseHistoryProps {
  userId: string
  onSelectGarment: (garment: Garment) => void
  selectedGarment: Garment | null
  purchases: Garment[]
  setPurchases: (purchases: Garment[]) => void
}

// Mock data - in real app, this would come from API
const mockPurchases: Garment[] = [
  {
    id: "1",
    brand: "Uniqlo",
    name: "Slim Fit Jeans",
    category: "jeans",
    size: "30",
    measurements: { waist: 30, inseam: 32 },
    fit: "regular",
    imageUrl: "/placeholder.svg?height=100&width=100",
    purchaseDate: "2024-01-15",
    url: "https://uniqlo.com/jeans",
  },
  {
    id: "2",
    brand: "H&M",
    name: "Cotton T-Shirt",
    category: "shirt",
    size: "M",
    measurements: { chest: 40, length: 28 },
    fit: "regular",
    imageUrl: "/placeholder.svg?height=100&width=100",
    purchaseDate: "2024-02-20",
  },
  {
    id: "3",
    brand: "Zara",
    name: "Skinny Jeans",
    category: "jeans",
    size: "29",
    measurements: { waist: 29, inseam: 30 },
    fit: "tight",
    imageUrl: "/placeholder.svg?height=100&width=100",
    purchaseDate: "2024-03-10",
  },
]

export function PurchaseHistory({
  userId,
  onSelectGarment,
  selectedGarment,
  purchases,
  setPurchases,
}: PurchaseHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    // Initialize with mock data if empty
    if (purchases.length === 0) {
      setPurchases(mockPurchases)
    }
  }, [purchases.length, setPurchases])

  const filteredPurchases = purchases.filter(
    (item) =>
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddManualGarment = (garmentData: Partial<Garment>) => {
    const newGarment: Garment = {
      id: Date.now().toString(),
      brand: garmentData.brand || "",
      name: garmentData.name || "",
      category: garmentData.category || "",
      size: garmentData.size || "",
      measurements: garmentData.measurements || {},
      fit: garmentData.fit || "regular",
      imageUrl: "/placeholder.svg?height=100&width=100",
      purchaseDate: new Date().toISOString().split("T")[0],
      url: garmentData.url,
    }

    setPurchases([newGarment, ...purchases])
    setShowAddForm(false)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search your purchases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add New Garment */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full bg-transparent border-gray-300">
            <Plus className="h-4 w-4 mr-2" />
            Add Reference Garment
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Add Reference Garment</DialogTitle>
          <AddReferenceForm onSubmit={handleAddManualGarment} onCancel={() => setShowAddForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Purchase List */}
      <div className="space-y-3">
        {filteredPurchases.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedGarment?.id === item.id ? "ring-2 ring-gray-900 bg-gray-50" : ""
            }`}
            onClick={() => onSelectGarment(item)}
          >
            <CardContent className="p-3">
              <div className="flex gap-3">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-gray-600">{item.brand}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Size {item.size}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.fit}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{new Date(item.purchaseDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPurchases.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No purchases found</p>
          <p className="text-xs">Add a reference garment to get started</p>
        </div>
      )}
    </div>
  )
}
