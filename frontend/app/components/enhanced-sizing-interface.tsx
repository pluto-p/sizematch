"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  AlertCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { PurchaseHistory } from "./purchase-history";
import { SizeRecommendation } from "./size-recommendation";
import { ScreenshotUpload } from "./screenshot-upload";
import { MultipleGarmentSelector } from "./multiple-garment-selector";
import { UrlInput } from "./url-input";
import { GarmentAnalyzer, AnalysisResult } from "../utils/garment-analyzer";
import type { User, Garment } from "./sizing-popup";

/**
 * Fetches a size chart from the server-side API
 */
async function fetchSizeChartFromServer(
  url: string, 
  brand?: string, 
  productId?: string
): Promise<{
  sizeChart?: { [size: string]: { [measurement: string]: number } };
  imageUrl?: string;
  status: string;
  message?: string;
}> {
  try {
    const params = new URLSearchParams({ url });
    if (brand) params.append('brand', brand);
    if (productId) params.append('productId', productId);
    
    console.log(`[EnhancedSizingInterface] Fetching size chart from API for URL: ${url}, Brand: ${brand || 'not provided'}, Product ID: ${productId || 'not provided'}`);
    const response = await fetch(`/api/size-chart/fetch?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`[EnhancedSizingInterface] API response:`, result);
    return result;
  } catch (error: any) {
    console.error('[EnhancedSizingInterface] API fetch error:', error);
    return { status: 'error', message: error.message };
  }
}

interface EnhancedSizingInterfaceProps {
  user: User;
  currentUrl: string;
  onLogout: () => void;
  initialAnalysisResult?: AnalysisResult;
}

type ViewState =
  | "analyzing"
  | "multiple-garments"
  | "screenshot-upload"
  | "url-input"
  | "ready"
  | "error";

export function EnhancedSizingInterface({
  user,
  currentUrl,
  onLogout,
  initialAnalysisResult,
}: EnhancedSizingInterfaceProps) {
  const [viewState, setViewState] = useState<ViewState>("analyzing");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedGarment, setSelectedGarment] = useState<AnalysisResult | null>(
    null
  );
  const [selectedReference, setSelectedReference] = useState<Garment | null>(
    null
  );
  const [purchases, setPurchases] = useState<Garment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBackendLookup, setIsBackendLookup] = useState(false);
  const [urlInputError, setUrlInputError] = useState<string | null>(null);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [autoSizeChartAttempted, setAutoSizeChartAttempted] = useState(false);

  const log = useCallback((message: string, ...args: unknown[]) => {
    console.log(`[EnhancedSizingInterface] ${message}`, ...args);
  }, []);

  const analyzer = useMemo(() => new GarmentAnalyzer(), []);

  const performBackendLookup = useCallback(async (garment: AnalysisResult) => {
    setIsBackendLookup(true);

    try {
      log("Performing backend lookup for:", garment.productId);

      const response = await fetch("/api/garments/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: garment.productId }),
      });

      const result = await response.json();

      if (result.found && result.sizeChart) {
        const updatedGarment: AnalysisResult = {
          ...garment,
          sizing: {
            ...garment.sizing,
            sizeChart: result.sizeChart,
          },
          status: "complete",
          needsBackendLookup: false,
        };

        setSelectedGarment(updatedGarment);
        setViewState("ready");
        log("Backend lookup successful");
      } else {
        log("No backend data found, requesting screenshot");
        setViewState("screenshot-upload");
      }
    } catch (error) {
      console.error("Backend lookup failed:", error);
      setViewState("screenshot-upload");
    } finally {
      setIsBackendLookup(false);
    }
  }, [log]);

  const handleSingleGarment = useCallback(async (garment: AnalysisResult) => {
    setSelectedGarment(garment);

    if (garment.status === "complete") {
      setViewState("ready");
    } else if (garment.needsBackendLookup) {
      // If it needs backend lookup, try that first.
      await performBackendLookup(garment);
    } else if (garment.status === "partial" && !garment.sizing.sizeChart) {
      // If it's partial (meaning garment info and sizes were found, but no size chart),
      // and it didn't need backend lookup (or backend lookup failed, handled in performBackendLookup),
      // then it's a good candidate for screenshot upload.
      setViewState("screenshot-upload");
    } else if (garment.needsManualInput) {
      // This case should primarily be hit by the initial analysis if it's very poor.
      // If we're here after a manual URL submission, it means the submitted URL
      // still couldn't be processed enough to even get to screenshot upload.
      setViewState("url-input");
    } else {
      // Fallback for any other partial state that might be considered "ready"
      setViewState("ready");
    }
  }, [performBackendLookup]);

  const performAnalysis = useCallback(async (targetUrl?: string) => {
    setViewState("analyzing");
    setError(null);
    setIsBackendLookup(false);

    log("🚀 Starting analysis for:", targetUrl || currentUrl);

    try {
      const urlToAnalyze = targetUrl || currentUrl;

      let analysis: AnalysisResult | AnalysisResult[] | null = null;

      // Remove mockAnalysisResult logic
      analysis = await analyzer.analyzePage();
      log("Live analysis result:", analysis);

      if (!analysis) {
        log("No analysis result, defaulting to URL input.");
        setViewState("url-input");
        return;
      }

      let results: AnalysisResult[];
      if (Array.isArray(analysis)) {
        results = analysis;
      } else {
        results = [analysis];
      }

      // This check is only for live analysis when no mock is provided
      // and if the current URL is on the same domain as the app itself.
      // If the confidence is low, it means it's likely not a product page.
      if (
        urlToAnalyze.includes(window.location.hostname) &&
        results[0].confidence < 55
      ) {
        log("Low confidence on own domain (live analysis), defaulting to URL input.");
        setViewState("url-input");
        return;
      }

      setAnalysisResults(results);

      if (results.length > 1) {
        setViewState("multiple-garments");
      } else {
        await handleSingleGarment(results[0]);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setError("Failed to analyze the current page. Please try manual input.");
      setViewState("error");
    }
  }, [analyzer, currentUrl, handleSingleGarment, log]);

  useEffect(() => {
    if (initialAnalysisResult) {
      setSelectedGarment(initialAnalysisResult);
      setViewState("ready"); // Always show detected info first
      // If size chart is missing, trigger improved workflow in background
      if (!initialAnalysisResult.sizing.sizeChart && !autoSizeChartAttempted) {
        setAutoSizeChartAttempted(true);
        (async () => {
          if (initialAnalysisResult.needsBackendLookup) {
            await performBackendLookup(initialAnalysisResult);
          } else {
            log("Attempting to fetch size chart from server API");
            const brand = initialAnalysisResult.garment.brand || '';
            const productId = initialAnalysisResult.productId || '';
            
            // Make sure we pass both brand and productId to the API
            const result = await fetchSizeChartFromServer(currentUrl, brand, productId);
            
            if (result.status === 'success' && (result.sizeChart || result.imageUrl)) {
              log("Successfully found size chart from API");
              
              // If we have structured size chart data
              if (result.sizeChart && Object.keys(result.sizeChart).length > 0) {
                // Update the selected garment with the size chart
                const updatedGarment: AnalysisResult = {
                  ...initialAnalysisResult,
                  sizing: {
                    ...initialAnalysisResult.sizing,
                    sizeChart: result.sizeChart,
                    // Store the image URL if available too
                    sizeGuideUrl: result.imageUrl || initialAnalysisResult.sizing.sizeGuideUrl
                  },
                  status: "complete", // Mark as complete since we have a size chart
                };
                
                setSelectedGarment(updatedGarment);
                log("Updated garment with size chart from API");
              }
              // If we only have an image but no structured data
              else if (result.imageUrl) {
                // Store the image URL for potential display
                const updatedGarment: AnalysisResult = {
                  ...initialAnalysisResult,
                  sizing: {
                    ...initialAnalysisResult.sizing,
                    sizeGuideUrl: result.imageUrl
                  },
                  // Keep as partial since we have an image but no structured data
                  status: "partial", 
                };
                
                setSelectedGarment(updatedGarment);
                log("Updated garment with size chart image URL");
              }
            } else {
              log("No size chart found via API, tried all automated strategies");
            }
          }
        })();
      }
      return;
    }
    // Only run analyzer if not in iframe/embedded mode
    const timer = setTimeout(() => {
      performAnalysis();
    }, 1000);

    return () => clearTimeout(timer);
  }, [performAnalysis, initialAnalysisResult, performBackendLookup, autoSizeChartAttempted, log, currentUrl]);

  const handleMultipleGarmentSelect = (garment: AnalysisResult) => {
    handleSingleGarment(garment);
  };

  const handleScreenshotAnalysis = (sizeChart: { [size: string]: { [measurement: string]: number } }) => {
    if (selectedGarment) {
      const updatedGarment: AnalysisResult = {
        ...selectedGarment,
        sizing: {
          ...selectedGarment.sizing,
          sizeChart,
        },
        status: "complete",
        needsManualInput: false,
      };

      setSelectedGarment(updatedGarment);
      setViewState("ready");
    }
  };

  const handleUrlSubmit = async (url: string) => {
    setIsUrlLoading(true);
    setUrlInputError(null);

    try {
      log("Analyzing URL:", url);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      let mockGarment: AnalysisResult;

      if (url.toLowerCase().includes("levi")) {
        mockGarment = {
          garment: {
            name: "511™ Slim Jeans",
            brand: "Levi's",
            price: "$79.50",
            images: ["/placeholder.svg?height=200&width=200"],
            category: "jeans",
          },
          sizing: {
            availableSizes: ["28", "30", "32", "34", "36"],
            sizeChart: {
              "28": { waist: 28, inseam: 32, rise: 8 },
              "30": { waist: 30, inseam: 32, rise: 8.5 },
              "32": { waist: 32, inseam: 32, rise: 9 },
              "34": { waist: 34, inseam: 32, rise: 9.5 },
              "36": { waist: 36, inseam: 32, rise: 10 },
            },
          },
          productId: "levi.com_511-slim-jeans",
          confidence: 95,
          status: "complete",
          needsManualInput: false, // Explicitly set to false as URL was manually provided
        };
      } else if (url.toLowerCase().includes("uniqlo")) {
        mockGarment = {
          garment: {
            name: "Slim Fit Chino Pants",
            brand: "Uniqlo",
            price: "$39.90",
            images: ["/placeholder.svg?height=200&width=200"],
            category: "pants",
          },
          sizing: {
            availableSizes: ["S", "M", "L", "XL"],
            sizeChart: undefined, // Explicitly undefined to trigger screenshot upload
          },
          productId: "uniqlo.com_slim-chinos",
          confidence: 80,
          status: "partial",
          needsManualInput: false, // Explicitly set to false as URL was manually provided
        };
      } else {
        mockGarment = {
          garment: {
            name: "Classic Garment",
            brand: "Generic Brand",
            price: "$49.99",
            images: ["/placeholder.svg?height=200&width=200"],
            category: "clothing",
          },
          sizing: {
            availableSizes: ["S", "M", "L", "XL"],
            sizeChart: undefined, // Explicitly undefined to trigger screenshot upload
          },
          productId: "generic_garment",
          confidence: 60,
          status: "partial",
          needsManualInput: false, // Explicitly set to false as URL was manually provided
        };
      }

      setSelectedGarment(mockGarment);
      await handleSingleGarment(mockGarment);
    } catch (error) {
      console.error("URL analysis failed:", error);
      setUrlInputError("Failed to analyze the provided URL. Please check the URL and try again.");
    } finally {
      setIsUrlLoading(false);
    }
  };

  const handleRetry = () => {
    performAnalysis();
  };

  const handleManualInput = () => {
    setViewState("url-input");
  };

  const getTargetGarment = (analysis: AnalysisResult) => ({
    brand: analysis.garment.brand,
    name: analysis.garment.name,
    category: analysis.garment.category || "clothing",
    gender: "unisex" as const,
    sizeChart: analysis.sizing.sizeChart || {},
    imageUrl: analysis.garment.images[0],
    url: currentUrl,
  });

  const handleAddToWardrobe = (garmentData: Partial<Garment>) => {
    const newGarment: Garment = {
      id: Date.now().toString(),
      brand: garmentData.brand || "",
      name: garmentData.name || "",
      category: garmentData.category || "",
      size: garmentData.size || "",
      measurements: garmentData.measurements || {},
      fit: garmentData.fit || "regular",
      imageUrl: garmentData.imageUrl || "/placeholder.svg?height=100&width=100",
      purchaseDate: new Date().toISOString().split("T")[0],
      url: garmentData.url,
    };

    setPurchases((prev) => [newGarment, ...prev]);
  };

  const handleNewSearch = () => {
    setSelectedGarment(null);
    setSelectedReference(null);
    setViewState("url-input");
  };

  // Handler for reference garment selection with logging
  const handleReferenceSelect = (garment: Garment) => {
    log("Reference garment selected:", garment);
    setSelectedReference(garment);
  };

  // In the UI, only show screenshot upload if user clicks a button
  // Add a handler to trigger screenshot upload view
  const handleShowScreenshotUpload = () => setViewState("screenshot-upload");

  return (
    <div className="flex w-full h-full">
      {/* Left Sidebar - Purchase History */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Welcome, {user.name}</h3>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Your Purchase History</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <PurchaseHistory
            onSelectGarment={handleReferenceSelect}
            selectedGarment={selectedReference}
            purchases={purchases}
            setPurchases={setPurchases}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-white">
          <h2 className="text-2xl font-bold text-gray-900">RunwAI</h2>
          <p className="text-gray-600">Smart sizing powered by AI analysis</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {viewState === "analyzing" && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-900" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isBackendLookup ? "Looking up size chart..." : "Collecting garment size information"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isBackendLookup
                      ? "Checking our database for size chart measurements..."
                      : "Scanning the page for product information and sizing details..."}
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>• Extracting product details</p>
                    <p>• Finding available sizes</p>
                    <p>• Looking for size charts</p>
                    {isBackendLookup && <p>• Checking our database</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {viewState === "multiple-garments" && (
            <MultipleGarmentSelector
              garments={analysisResults}
              onGarmentSelect={handleMultipleGarmentSelect}
              onCancel={() => setViewState("error")}
            />
          )}

          {viewState === "screenshot-upload" && selectedGarment && (
            <ScreenshotUpload
              productId={selectedGarment.productId}
              onAnalysisComplete={handleScreenshotAnalysis}
              onCancel={() => setViewState("ready")}
            />
          )}

          {viewState === "url-input" && (
            <UrlInput
              onUrlSubmit={handleUrlSubmit}
              onCancel={() => setViewState("error")}
              isLoading={isUrlLoading}
              error={urlInputError}
            />
          )}

          {viewState === "ready" && selectedGarment && (
            <div className="space-y-6">
              {/* Target Garment Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Detected Garment</span>
                    <Badge variant={selectedGarment.status === "complete" ? "default" : "secondary"}>
                      {selectedGarment.status}
                    </Badge>
                    <Badge variant="outline">{selectedGarment.confidence}% confidence</Badge>
                  </CardTitle>
                  <CardDescription>
                    {selectedGarment.status === "complete"
                      ? "Complete garment information found"
                      : "Partial information - some details may be missing"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {selectedGarment.garment?.images?.length > 0 && (
                      <Image
                        src={selectedGarment.garment.images[0]}
                        alt={selectedGarment.garment.name || 'Garment Image'}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{selectedGarment.garment?.name || 'Unknown Garment'}</h4>
                      <p className="text-sm text-gray-600">{selectedGarment.garment?.brand || 'Unknown Brand'}</p>
                      {selectedGarment.garment?.price && (
                        <p className="text-sm font-medium">{selectedGarment.garment.price}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{selectedGarment.garment?.category || 'clothing'}</Badge>
                      </div>
                      {selectedGarment.sizing?.availableSizes?.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Available sizes: {selectedGarment.sizing.availableSizes.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Status message about size information - no actual chart display */}
                  {selectedGarment.sizing.sizeChart && Object.keys(selectedGarment.sizing.sizeChart).length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-sm">
                          Size information has been successfully collected. Select a garment from your wardrobe to compare sizes.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Only show upload option if size chart is missing */}
                  {!selectedGarment.sizing.sizeChart && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">
                          Size information not found.
                          <Button
                            variant="link"
                            className="p-0 h-auto text-yellow-800 underline"
                            onClick={handleShowScreenshotUpload}
                          >
                            Upload a screenshot
                          </Button>{" "}
                          of the size chart to enable size comparisons.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Size Recommendation */}
              {selectedReference && selectedGarment.sizing?.sizeChart && (
                <>
                  {log("Triggering size recommendation with target:", getTargetGarment(selectedGarment), "and reference:", selectedReference)}
                  <SizeRecommendation
                    targetGarment={getTargetGarment(selectedGarment)}
                    referenceGarment={selectedReference}
                    onAddToWardrobe={handleAddToWardrobe}
                    onNewSearch={handleNewSearch}
                  />
                </>
              )}

              {/* Instructions */}
              {!selectedReference && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <p className="mb-2">👈 Select a reference garment from your purchase history</p>
                      <p className="text-sm">We&apos;ll compare measurements to recommend the best size</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {viewState === "error" && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
                  <p className="text-gray-600 mb-6">{error || "We couldn't find garment information on this page."}</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleRetry} variant="outline" className="bg-transparent">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button onClick={handleManualInput} className="bg-gray-900 hover:bg-gray-800">
                      <Search className="h-4 w-4 mr-2" />
                      Manual Input
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
