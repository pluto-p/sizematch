"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "/components/ui/input"
import { Label } from "/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/components/ui/card"
import { Search, Loader2, AlertCircle, ExternalLink } from "lucide-react"

interface UrlInputProps {
  onUrlSubmit: (url: string) => void
  onCancel: () => void
  isLoading?: boolean
  error?: string | null
}

export function UrlInput({ onUrlSubmit, onCancel, isLoading = false, error }: UrlInputProps) {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onUrlSubmit(url.trim())
    }
  }

  const isValidUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          No Garment Detected
        </CardTitle>
        <CardDescription>
          We couldn't find product information on this page. Please provide the URL of the garment you want to get
          sizing recommendations for.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="garment-url">Product URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="garment-url"
                type="url"
                placeholder="https://example.com/products/jeans"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="submit"
                disabled={!url.trim() || !isValidUrl(url) || isLoading}
                className="bg-gray-900 hover:bg-gray-800"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Tips for best results:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use the direct product page URL</li>
              <li>• Make sure the page has size information</li>
              <li>• Popular retailers work best (Levi's, Uniqlo, H&M, etc.)</li>
            </ul>
          </div>
        </form>

        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
