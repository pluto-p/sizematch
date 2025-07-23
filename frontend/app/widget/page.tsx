"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { SizingPopup } from "../components/sizing-popup"
import type { GarmentInfo } from "../utils/garment-analyzer"

export default function WidgetPage() {
  const [showPopup, setShowPopup] = useState(true)
  const [currentUrl, setCurrentUrl] = useState("")
  const [garmentInfo, setGarmentInfo] = useState<GarmentInfo | null>(null)

  useEffect(() => {
    console.log("[Widget] Page loading...")

    // Get the URL from query params (passed from the embed script)
    const urlParams = new URLSearchParams(window.location.search)
    const referrerUrl = urlParams.get("url") || document.referrer || window.location.href

    console.log("[Widget] Current URL:", referrerUrl)

    // Optimize for iframe embedding
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.overflow = "hidden"
    document.body.style.background = "white"

    // Send ready message to parent (with error handling for CORS)
    if (window.parent !== window) {
      try {
        console.log("[Widget] Sending ready message to parent")
        window.parent.postMessage({ type: "RUNWAI_READY" }, "*")
      } catch {
        // CORS error is expected and doesn't affect functionality
        console.log("[Widget] CORS restriction (expected, doesn't affect functionality)")
      }
    }

    // Add message listener for parent communication
    const handleMessage = (event: MessageEvent) => {
      console.log("[Widget] Received message:", event.data)
      // --- NEW: Receive Garment Info from parent ---
      if (event.data.type === "GARMENT_INFO") {
        setGarmentInfo(event.data.data)
        console.log("[Widget] Received GARMENT_INFO from parent", event.data.data)
      }
    }

    window.addEventListener("message", handleMessage)

    console.log("[Widget] Page ready")

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const handleClose = () => {
    setShowPopup(false)
  }

  // Helper to render garment info in a user-friendly way
  function renderGarmentInfo(info: GarmentInfo) {
    return (
      <div style={{padding: 24, background: '#f9fafb', borderBottom: '1px solid #eee'}}>
        <h2 className="text-xl font-bold mb-2">Product Details</h2>
        <div className="flex gap-6 items-start">
          {info.images && info.images.length > 0 && (
            <Image
              src={info.images[0]}
              alt={info.name}
              width={120}
              height={160}
              style={{ objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}
            />
          )}
          <div>
            <div className="mb-2">
              <span className="font-semibold">Name:</span> {info.name}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Brand:</span> {info.brand}
            </div>
            {info.price && (
              <div className="mb-2">
                <span className="font-semibold">Price:</span> {info.price}
              </div>
            )}
            {info.category && (
              <div className="mb-2">
                <span className="font-semibold">Category:</span> {info.category}
              </div>
            )}
            {info.productId && (
              <div className="mb-2">
                <span className="font-semibold">Product ID:</span> {info.productId}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  console.log("[Widget] Rendering")

  return (
    <div className="w-full h-screen bg-white">
      <SizingPopup
        isOpen={showPopup}
        onClose={handleClose}
        currentUrl={currentUrl}
        mockAnalysisResult={garmentInfo ? {
          garment: garmentInfo,
          sizing: { availableSizes: [] },
          productId: garmentInfo.productId || "",
          confidence: 0,
          status: "incomplete"
        } : undefined}
      />
    </div>
  )
}
