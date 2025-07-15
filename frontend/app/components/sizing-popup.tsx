"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AuthScreen } from "./auth-screen"
import { SizingInterface } from "./sizing-interface"
import { X } from "lucide-react"

interface SizingPopupProps {
  isOpen: boolean
  onClose: () => void
  currentUrl: string
}

export type User = {
  id: string
  email: string
  name: string
}

export type Garment = {
  id: string
  brand: string
  name: string
  category: string
  size: string
  measurements: { [key: string]: number }
  fit: "tight" | "regular" | "loose"
  imageUrl: string
  purchaseDate: string
  url?: string
}

export function SizingPopup({ isOpen, onClose, currentUrl }: SizingPopupProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Changed to false initially
  const [isEmbedded, setIsEmbedded] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        // Simulate checking authentication
        const savedUser = localStorage.getItem("sizing-user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      checkAuth()
    }
  }, [isOpen])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsEmbedded(window.parent !== window)
    }
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem("sizing-user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("sizing-user")
  }

  if (!isOpen) return null

  if (isEmbedded) {
    // When embedded, render without Dialog wrapper for cleaner iframe display
    return (
      <div className="w-full h-full bg-white">
        {/* Header with close button */}
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="w-full h-full">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Checking authentication...</p>
              </div>
            </div>
          ) : !user ? (
            <AuthScreen onLogin={handleLogin} />
          ) : (
            <SizingInterface user={user} currentUrl={currentUrl} onLogout={handleLogout} />
          )}
        </div>
      </div>
    )
  }

  // When not embedded, use Dialog wrapper (for direct page access)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex h-[80vh]">
          {/* Header */}
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Checking authentication...</p>
              </div>
            </div>
          ) : !user ? (
            <AuthScreen onLogin={handleLogin} />
          ) : (
            <SizingInterface user={user} currentUrl={currentUrl} onLogout={handleLogout} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
