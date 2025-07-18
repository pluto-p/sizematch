"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SizingPopup } from "../components/sizing-popup"

export default function DemoPage() {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Mock E-commerce Product Page */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <Image
              src="/placeholder.svg"
              alt="Levi's 511 Slim Jeans"
              width={400}
              height={400}
              className="w-full rounded-lg"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Levi&apos;s 511™ Slim Jeans</h1>
              <p className="text-xl text-gray-600">$79.50</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">
                The 511™ Slim is cut close to the body with a slim leg from hip to ankle. Made with our signature
                stretch denim for all-day comfort and movement.
              </p>
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <select className="w-full p-3 border border-gray-300 rounded-md">
                  <option>Select Size</option>
                  <option>28</option>
                  <option>30</option>
                  <option>32</option>
                  <option>34</option>
                  <option>36</option>
                </select>
              </div>

              {/* This is where RunwAI button would be injected */}
              <Button
                onClick={() => setShowPopup(true)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3"
              >
                🎯 Find My Size with RunwAI
              </Button>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">Add to Cart</Button>
            </div>

            <div className="text-sm text-gray-500">
              <p>• Free shipping on orders over $50</p>
              <p>• 30-day returns</p>
              <p>• Size guide available</p>
            </div>
          </div>
        </div>
      </div>

      {/* RunwAI Popup */}
      <SizingPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        currentUrl="https://levi.com/products/511-slim-jeans"
      />

      {/* Demo Instructions */}
      <div className="max-w-4xl mx-auto mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">🎯 RunwAI Demo Experience</h2>
        <div className="space-y-2 text-blue-800">
          <p>
            <strong>1. Click &quot;Find My Size with RunwAI&quot;</strong> - This simulates the button that would be
            auto-injected
          </p>
          <p>
            <strong>2. Sign up/Login</strong> - Use any email (demo mode)
          </p>
          <p>
            <strong>3. Add Reference Garments</strong> - Build your wardrobe by adding clothes you own
          </p>
          <p>
            <strong>4. Get Size Recommendations</strong> - AI compares measurements to suggest the best size
          </p>
          <p>
            <strong>5. See Confidence Scores</strong> - Know how certain the recommendation is
          </p>
        </div>
      </div>
    </div>
  )
}
