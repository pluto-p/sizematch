console.log("[RunwAI] Enhanced embed script starting...")
;(() => {
  const RUNWAI_CONFIG = {
    // https://kzmk0kwvtbzus65va7av.lite.vusercontent.net
    apiUrl: "https://localhost:3000",
    version: "1.0.0",
    buttonText: "🎯 Find My Size with RunwAI",
    debug: true,

    buttonStyle: {
      background: "#1f2937",
      color: "white",
      border: "none",
      padding: "12px 24px",
      borderRadius: "6px",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "14px",
      width: "100%",
      marginTop: "8px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: "all 0.2s ease",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },

    overlayStyle: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(4px)",
    },

    containerStyle: {
      width: "90%",
      maxWidth: "1200px",
      height: "90%",
      maxHeight: "800px",
      borderRadius: "12px",
      background: "white",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      position: "relative",
    },
  }

  const log = (message, ...args) => {
    if (RUNWAI_CONFIG.debug) {
      console.log(`[RunwAI] ${message}`, ...args)
    }
  }

  // Enhanced element scoring system
  const scoreElement = (element) => {
    let score = 0
    const text = element.textContent?.toLowerCase() || ""
    const className = element.className?.toLowerCase() || ""
    const id = element.id?.toLowerCase() || ""
    const tagName = element.tagName.toLowerCase()

    // High priority: Actual size selectors
    if (tagName === "select" && (element.name?.includes("size") || className.includes("size"))) {
      score += 100
    }

    // High priority: Size-related classes (but more specific)
    if (
      className.includes("size-selector") ||
      className.includes("product-size") ||
      className.includes("size-option")
    ) {
      score += 90
    }

    // Medium priority: Add to cart buttons
    if (
      tagName === "button" &&
      (text.includes("add to cart") || text.includes("add to bag") || className.includes("add-to-cart"))
    ) {
      score += 80
    }

    // Medium priority: Size-related text content
    if (text.includes("select size") || text.includes("choose size") || text.includes("size:")) {
      score += 70
    }

    // Lower priority: Generic cart/buy buttons
    if (tagName === "button" && (text.includes("buy") || text.includes("cart") || text.includes("purchase"))) {
      score += 60
    }

    // Bonus for being in product area
    const productContainer = element.closest('[class*="product"], [id*="product"], .pdp, .product-details')
    if (productContainer) {
      score += 20
    }

    // Penalty for being hidden or very small
    if (element.offsetWidth < 50 || element.offsetHeight < 20) {
      score -= 50
    }

    // Penalty for being in header/footer/nav
    if (element.closest("header, footer, nav, .header, .footer, .nav")) {
      score -= 30
    }

    // Penalty for generic "size" matches that aren't actually size selectors
    if (
      className.includes("size") &&
      !className.includes("product") &&
      !className.includes("select") &&
      !className.includes("option")
    ) {
      // Check if it's likely a sizing element by looking at siblings/parent
      const parent = element.parentElement
      const hasSizeContext =
        parent?.textContent?.toLowerCase().includes("size") ||
        parent?.querySelector('select, input[type="radio"], input[type="checkbox"]')

      if (!hasSizeContext) {
        score -= 40 // Likely a false positive
      }
    }

    return score
  }

  const findBestPlacement = () => {
    log("Starting smart placement analysis...")

    // Enhanced selector list with better specificity
    const selectors = [
      // Highest priority: Actual size controls
      'select[name*="size"]',
      'select[id*="size"]',
      'input[name*="size"]',

      // High priority: Size-specific classes
      ".size-selector",
      ".product-size",
      ".size-options",
      ".size-selection",
      ".size-picker",

      // Medium priority: Product action buttons
      ".add-to-cart",
      ".add-to-bag",
      'button[class*="add-to-cart"]',
      'button[class*="add-to-bag"]',

      // Lower priority: Generic elements that might be near size selectors
      ".product-options",
      ".product-variants",
      ".product-form",

      // Last resort: Any element with size in class (but we'll score it)
      '[class*="size"]',
      '[id*="size"]',
    ]

    let bestElement = null
    let bestScore = -1
    let bestReason = ""

    // Collect all potential elements
    const candidates = []

    selectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector)
        elements.forEach((element) => {
          // Skip if already processed
          if (candidates.some((c) => c.element === element)) return

          const score = scoreElement(element)
          candidates.push({
            element,
            selector,
            score,
            text: element.textContent?.slice(0, 50) || "",
            className: element.className || "",
          })
        })
      } catch (e) {
        log(`Error with selector ${selector}:`, e)
      }
    })

    // Sort by score and pick the best
    candidates.sort((a, b) => b.score - a.score)

    log(
      "Placement candidates:",
      candidates.slice(0, 5).map((c) => ({
        score: c.score,
        selector: c.selector,
        className: c.className,
        text: c.text,
      })),
    )

    if (candidates.length > 0 && candidates[0].score > 0) {
      bestElement = candidates[0].element
      bestScore = candidates[0].score
      bestReason = `Best match: ${candidates[0].selector} (score: ${bestScore})`
    }

    return { element: bestElement, score: bestScore, reason: bestReason }
  }

  const createRunwAIButton = () => {
    const button = document.createElement("button")
    button.innerHTML = RUNWAI_CONFIG.buttonText
    button.id = "runwai-button"
    button.className = "runwai-button"

    Object.assign(button.style, RUNWAI_CONFIG.buttonStyle)

    button.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      openRunwAIPopup()
    })

    return button
  }

  const openRunwAIPopup = () => {
    if (document.getElementById("runwai-overlay")) {
      log("Popup already open")
      return
    }

    log("Opening popup")

    const overlay = document.createElement("div")
    overlay.id = "runwai-overlay"
    Object.assign(overlay.style, RUNWAI_CONFIG.overlayStyle)

    const container = document.createElement("div")
    Object.assign(container.style, RUNWAI_CONFIG.containerStyle)

    const loader = document.createElement("div")
    loader.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
        <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #1f2937; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 16px; color: #666;">Loading RunwAI...</p>
      </div>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `
    container.appendChild(loader)

    const iframe = document.createElement("iframe")
    const params = new URLSearchParams({
      url: window.location.href,
      embedded: "true",
      version: RUNWAI_CONFIG.version,
    })

    // --- New: Extract and pass JSON-LD data ---
    try {
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      jsonLdScripts.forEach((script, index) => {
        if (script.textContent) {
          // Find the one with Product data, as that's the most important
          if (script.textContent.includes('"@type":"Product"')) {
            // Use encodeURIComponent to handle special characters before Base64 encoding
            const encodedData = btoa(unescape(encodeURIComponent(script.textContent)));
            params.set('jsonLd', encodedData);
            log(`Found and encoded JSON-LD Product data to pass to iframe.`);
          }
        }
      });
    } catch (e) {
      log("Could not process JSON-LD data:", e);
    }
    // --- End New ---

    iframe.src = `${RUNWAI_CONFIG.apiUrl}/widget?${params.toString()}`
    iframe.style.cssText = `width: 100%; height: 100%; border: none; background: transparent; display: none;`
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups")

    iframe.onload = () => {
      log("Iframe loaded successfully")
      loader.style.display = "none"
      iframe.style.display = "block"
    }

    container.appendChild(iframe)
    overlay.appendChild(container)
    document.body.appendChild(overlay)
    document.body.style.overflow = "hidden"

    // Close handlers
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeRunwAIPopup()
    })

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeRunwAIPopup()
        document.removeEventListener("keydown", handleEscape)
      }
    }
    document.addEventListener("keydown", handleEscape)
  }

  const closeRunwAIPopup = () => {
    const overlay = document.getElementById("runwai-overlay")
    if (!overlay) return
    log("Closing popup")
    document.body.removeChild(overlay)
    document.body.style.overflow = ""
  }

  const injectRunwAIButton = () => {
    if (document.getElementById("runwai-button")) {
      log("Button already exists")
      return
    }

    const placement = findBestPlacement()

    if (placement.element && placement.score > 0) {
      const button = createRunwAIButton()

      try {
        // Try different insertion strategies
        const parent = placement.element.parentNode

        if (parent) {
          // Strategy 1: Insert after the element
          if (placement.element.nextSibling) {
            parent.insertBefore(button, placement.element.nextSibling)
          } else {
            parent.appendChild(button)
          }

          log(`✅ Button placed after element: ${placement.reason}`)
          return
        }
      } catch (e) {
        log(`Failed to place button: ${e.message}`)
      }
    }

    // Fallback: floating button
    log("Using fallback floating button")
    const button = createRunwAIButton()

    Object.assign(button.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "auto",
      zIndex: "999998",
      borderRadius: "50px",
      padding: "12px 20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    })

    document.body.appendChild(button)
  }

  // Initialize
  log("Initializing enhanced RunwAI widget")

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectRunwAIButton)
  } else {
    injectRunwAIButton()
  }

  // Try again after delays for dynamic content
  setTimeout(injectRunwAIButton, 1000)
  setTimeout(injectRunwAIButton, 3000)

  // Global API
  window.RunwAI = { open: openRunwAIPopup, close: closeRunwAIPopup }
  window.closeRunwAIPopup = closeRunwAIPopup

  log("Enhanced RunwAI widget loaded successfully")
})()
