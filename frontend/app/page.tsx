"use client"

import { useState, useEffect } from "react"
import { SizingPopup } from "./components/sizing-popup"
import { Button } from "@/components/ui/button"

export type GarmentData = {
  productName: string
  brand: string
  sizes: { [key: string]: string[] }
  imageUrl?: string
  price?: string
}

export default function HomePage() {
  const [showPopup, setShowPopup] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    // Simulate being embedded on a retailer website
    setCurrentUrl(window.location.href)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Demo retailer page */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img src="/placeholder.svg?height=400&width=400" alt="Levi's 501 Jeans" className="w-full rounded-lg" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">Levi's 501® Original Jeans</h1>
              <p className="text-2xl font-semibold text-blue-600 mb-4">$89.50</p>
              <p className="text-gray-600 mb-6">
                The original blue jean since 1873. A blank canvas for self-expression that has been worn by generations
                of individuals who make their mark on the world.
              </p>

              {/* Size Chart Data (hidden, would be scraped) */}
              <div
                className="hidden"
                data-size-chart='{"28": {"waist": 28, "inseam": 32}, "30": {"waist": 30, "inseam": 32}, "32": {"waist": 32, "inseam": 32}, "34": {"waist": 34, "inseam": 32}}'
                data-brand="Levi's"
                data-product="501 Original Jeans"
                data-gender="men"
                data-category="jeans"
              ></div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Select Size</option>
                    <option>28</option>
                    <option>30</option>
                    <option>32</option>
                    <option>34</option>
                  </select>
                </div>

                {/* Our Smart Sizing Button */}
                <Button
                  onClick={() => setShowPopup(true)}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3"
                >
                  🎯 Find My Size with RunwAI
                </Button>

                <Button className="w-full bg-black text-white font-semibold py-3">Add to Cart</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Sizing Popup */}
      {showPopup && <SizingPopup isOpen={showPopup} onClose={() => setShowPopup(false)} currentUrl={currentUrl} />}
    </div>
  )
}
