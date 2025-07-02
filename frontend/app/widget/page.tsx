"use client"

import { useEffect, useState } from "react"
import { SizingPopup } from "../components/sizing-popup"

export default function WidgetPage() {
  const [showPopup, setShowPopup] = useState(true)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    console.log("[Widget] Page loading...")

    // Get the URL from query params (passed from the embed script)
    const urlParams = new URLSearchParams(window.location.search)
    const referrerUrl = urlParams.get("url") || document.referrer || window.location.href
    setCurrentUrl(referrerUrl)

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
      } catch (error) {
        // CORS error is expected and doesn't affect functionality
        console.log("[Widget] CORS restriction (expected, doesn't affect functionality)")
      }
    }

    // Add message listener for parent communication
    const handleMessage = (event) => {
      console.log("[Widget] Received message:", event.data)
      if (event.data.type === "RUNWAI_RESIZE") {
        // Handle resize requests from parent
        try {
          window.parent.postMessage(
            {
              type: "RUNWAI_RESIZE_RESPONSE",
              height: document.body.scrollHeight,
            },
            "*",
          )
        } catch (error) {
          // CORS error is expected
        }
      }
    }

    window.addEventListener("message", handleMessage)

    console.log("[Widget] Page ready")

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const handleClose = () => {
    console.log("[Widget] Close requested")
    // Send close message to parent window (with error handling)
    if (window.parent !== window) {
      try {
        window.parent.postMessage({ type: "RUNWAI_CLOSE" }, "*")
      } catch (error) {
        // CORS error is expected, fallback to closing locally
        console.log("[Widget] CORS restriction, closing locally")
        setShowPopup(false)
      }
    } else {
      setShowPopup(false)
    }
  }

  console.log("[Widget] Rendering with showPopup:", showPopup)

  return (
    <div className="w-full h-screen bg-white">
      <SizingPopup isOpen={showPopup} onClose={handleClose} currentUrl={currentUrl} />
    </div>
  )
}
