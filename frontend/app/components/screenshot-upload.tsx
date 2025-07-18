"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud, AlertCircle } from "lucide-react"

interface ScreenshotUploadProps {
  productId: string
  onAnalysisComplete: (sizeChart: { [size: string]: { [measurement: string]: number } }) => void
  onCancel: () => void
}

export function ScreenshotUpload({ productId, onAnalysisComplete, onCancel }: ScreenshotUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 10 * 1024 * 1024, // 10 MB
  })

  const handleUpload = async () => {
    if (!file) return

    setStatus("uploading")
    setError(null)

    const formData = new FormData()
    formData.append("screenshot", file)
    formData.append("productId", productId)

    try {
      const response = await fetch("/api/size-chart/analyze", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.message || "Upload failed")

      setStatus("success")
      onAnalysisComplete(result.data)
    } catch {
      setStatus("error")
      setError("Couldn't process the size chart. Please try a different image or contact support.")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5" />
          Upload Size Chart Screenshot
        </CardTitle>
        <CardDescription>
          We were not able to automatically detect the size chart. Take a screenshot of the size chart on this page and
          upload it. We&apos;ll extract the measurements automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preview ? (
          <div className="relative">
            <Image src={preview} alt="Size chart preview" width={500} height={500} className="w-full rounded-lg" />
            <Button
              variant="destructive"
              onClick={() => {
                setPreview(null)
                setFile(null)
                setError(null)
              }}
              className="absolute top-2 right-2"
            >
              Remove
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-center text-gray-600">
              {isDragActive ? "Drop the image here..." : "Drag 'n' drop an image here, or click to select one"}
            </p>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || status === "uploading"}
            className="flex-1 bg-gray-900 hover:bg-gray-800"
          >
            {status === "uploading" ? "Uploading..." : "Upload Screenshot"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
