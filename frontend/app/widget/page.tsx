"use client"

import { useEffect, useState } from "react"
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

    setCurrentUrl(referrerUrl)

    console.log("[Widget] Page ready")

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const handleClose = () => {
    setShowPopup(false)
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
