console.log("[RunwAI] Embed script starting to load...")
;(() => {
  // RunwAI Configuration
  const RUNWAI_CONFIG = {
    apiUrl: window.location.origin, // Always use current origin
    version: "1.0.0",
    buttonText: "🎯 Find My Size with RunwAI",
    debug: true, // Enable debug mode to see what's happening

    // Default button styles
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

    // Overlay styles
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

    // Container styles
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
      animation: "runwai-popup-enter 0.3s ease-out",
    },
  }

  // Add CSS animations
  const addStyles = () => {
    if (document.getElementById("runwai-styles")) return

    const style = document.createElement("style")
    style.id = "runwai-styles"
    style.textContent = `
      @keyframes runwai-popup-enter {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      @keyframes runwai-popup-exit {
        from {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        to {
          opacity: 0;
          transform: scale(0.95) translateY(10px);
        }
      }
      
      .runwai-button:hover {
        background: #374151 !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
      }
      
      .runwai-button:active {
        transform: translateY(0);
      }
      
      @media (max-width: 768px) {
        .runwai-container {
          width: 95% !important;
          height: 95% !important;
          border-radius: 8px !important;
        }
      }
    `
    document.head.appendChild(style)
  }

  // Logging utility
  const log = (message, ...args) => {
    if (RUNWAI_CONFIG.debug) {
      console.log(`[RunwAI] ${message}`, ...args)
    }
  }

  // Create the RunwAI button
  const createRunwAIButton = () => {
    const button = document.createElement("button")
    button.innerHTML = RUNWAI_CONFIG.buttonText
    button.id = "runwai-button"
    button.className = "runwai-button"
    button.setAttribute("data-runwai-version", RUNWAI_CONFIG.version)

    // Apply styles
    Object.assign(button.style, RUNWAI_CONFIG.buttonStyle)

    // Add click handler
    button.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      openRunwAIPopup()

      // Analytics tracking
      trackEvent("button_click", {
        url: window.location.href,
        timestamp: Date.now(),
      })
    })

    log("Button created")
    return button
  }

  // Open the RunwAI popup
  const openRunwAIPopup = () => {
    // Prevent multiple popups
    if (document.getElementById("runwai-overlay")) {
      log("Popup already open")
      return
    }

    log("Opening popup")

    // Create overlay
    const overlay = document.createElement("div")
    overlay.id = "runwai-overlay"
    Object.assign(overlay.style, RUNWAI_CONFIG.overlayStyle)

    // Create container
    const container = document.createElement("div")
    container.className = "runwai-container"
    Object.assign(container.style, RUNWAI_CONFIG.containerStyle)

    // Create loading indicator with timeout
    const loader = document.createElement("div")
    loader.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
        <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #1f2937; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 16px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Loading RunwAI...</p>
        <p id="loading-timeout" style="margin-top: 8px; color: #999; font-size: 12px; display: none;">Taking longer than expected...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `
    container.appendChild(loader)

    // Show timeout message after 5 seconds
    setTimeout(() => {
      const timeoutMsg = document.getElementById("loading-timeout")
      if (timeoutMsg) {
        timeoutMsg.style.display = "block"
      }
    }, 5000)

    // Create iframe
    const iframe = document.createElement("iframe")
    const params = new URLSearchParams({
      url: window.location.href,
      embedded: "true",
      version: RUNWAI_CONFIG.version,
      referrer: document.referrer || "",
    })

    const iframeUrl = `${RUNWAI_CONFIG.apiUrl}/widget?${params.toString()}`
    log("Loading iframe:", iframeUrl)

    iframe.src = iframeUrl
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      display: none;
    `

    // Security attributes
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox",
    )
    iframe.setAttribute("loading", "eager")

    // Handle iframe load
    iframe.onload = () => {
      log("Iframe loaded successfully")
      loader.style.display = "none"
      iframe.style.display = "block"
    }

    // Handle iframe error
    iframe.onerror = (error) => {
      log("Iframe failed to load:", error)
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; padding: 20px; text-align: center;">
          <h3 style="color: #dc2626; margin-bottom: 16px;">Unable to load RunwAI</h3>
          <p style="color: #666; margin-bottom: 20px;">Please check your internet connection and try again.</p>
          <p style="color: #999; font-size: 12px; margin-bottom: 20px;">URL: ${iframeUrl}</p>
          <button onclick="closeRunwAIPopup()" style="background: #1f2937; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">Close</button>
        </div>
      `
    }

    // Fallback: if iframe doesn't load in 10 seconds, show error
    setTimeout(() => {
      if (iframe.style.display === "none") {
        log("Iframe timeout - showing fallback")
        container.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; padding: 20px; text-align: center;">
            <h3 style="color: #dc2626; margin-bottom: 16px;">Loading Timeout</h3>
            <p style="color: #666; margin-bottom: 20px;">RunwAI is taking longer than expected to load.</p>
            <p style="color: #999; font-size: 12px; margin-bottom: 20px;">This might be due to a slow connection or server issue.</p>
            <div style="display: flex; gap: 12px;">
              <button onclick="location.reload()" style="background: #1f2937; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">Retry</button>
              <button onclick="closeRunwAIPopup()" style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">Close</button>
            </div>
          </div>
        `
      }
    }, 10000)

    container.appendChild(iframe)
    overlay.appendChild(container)
    document.body.appendChild(overlay)

    // Prevent body scroll
    document.body.style.overflow = "hidden"

    // Event listeners
    setupEventListeners(overlay)

    // Analytics
    trackEvent("popup_open", {
      url: window.location.href,
      timestamp: Date.now(),
    })
  }

  // Setup event listeners for popup
  const setupEventListeners = (overlay) => {
    // Close on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeRunwAIPopup()
      }
    })

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeRunwAIPopup()
        document.removeEventListener("keydown", handleEscape)
      }
    }
    document.addEventListener("keydown", handleEscape)

    // Listen for messages from iframe
    const handleMessage = (event) => {
      log("Received message:", event.data)

      if (event.origin !== RUNWAI_CONFIG.apiUrl && !RUNWAI_CONFIG.apiUrl.includes("localhost")) {
        return
      }

      const { type, data } = event.data

      switch (type) {
        case "RUNWAI_CLOSE":
          closeRunwAIPopup()
          break
        case "RUNWAI_RESIZE":
          // Handle resize if needed
          break
        case "RUNWAI_ANALYTICS":
          trackEvent(data.event, data.properties)
          break
        default:
          // Legacy support
          if (event.data === "closeRunwAI") {
            closeRunwAIPopup()
          }
      }
    }

    window.addEventListener("message", handleMessage)

    // Store cleanup function
    overlay._cleanup = () => {
      document.removeEventListener("keydown", handleEscape)
      window.removeEventListener("message", handleMessage)
    }
  }

  // Close the RunwAI popup
  const closeRunwAIPopup = () => {
    const overlay = document.getElementById("runwai-overlay")
    if (!overlay) return

    log("Closing popup")

    // Cleanup event listeners
    if (overlay._cleanup) {
      overlay._cleanup()
    }

    // Animate out
    overlay.style.animation = "runwai-popup-exit 0.2s ease-in"

    setTimeout(() => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay)
      }
      // Restore body scroll
      document.body.style.overflow = ""
    }, 200)

    // Analytics
    trackEvent("popup_close", {
      url: window.location.href,
      timestamp: Date.now(),
    })
  }

  // Analytics tracking
  const trackEvent = (event, properties = {}) => {
    try {
      // Send to your analytics endpoint
      fetch(`${RUNWAI_CONFIG.apiUrl}/api/analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event,
          properties: {
            ...properties,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            timestamp: Date.now(),
          },
        }),
      }).catch(() => {}) // Fail silently
    } catch (e) {
      // Fail silently
    }
  }

  // Auto-inject button near size selectors
  const injectRunwAIButton = () => {
    // Avoid double injection
    if (document.getElementById("runwai-button")) {
      log("Button already exists")
      return
    }

    log("Attempting to inject button")

    // Look for size selector patterns (in order of preference)
    const selectors = [
      // Most specific first
      'select[name*="size"]:not([style*="display: none"])',
      '.size-selector:not([style*="display: none"])',
      '.product-size:not([style*="display: none"])',
      '.size-options:not([style*="display: none"])',

      // More general
      '[class*="size"]:not([style*="display: none"])',
      '.add-to-cart:not([style*="display: none"])',
      'button[class*="cart"]:not([style*="display: none"])',
      'button[class*="buy"]:not([style*="display: none"])',

      // Fallback
      ".product-form",
      ".product-options",
    ]

    let injected = false

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector)

      for (const element of elements) {
        // Check if element is visible and suitable
        if (element.offsetParent !== null && element.offsetWidth > 0 && element.offsetHeight > 0) {
          const button = createRunwAIButton()

          try {
            // Try to insert before the element
            if (element.parentNode) {
              element.parentNode.insertBefore(button, element)
              injected = true
              log(`Button injected before ${selector}`)
              break
            }
          } catch (e) {
            log(`Failed to inject before ${selector}:`, e)
          }
        }
      }

      if (injected) break
    }

    // Fallback: floating button
    if (!injected) {
      log("Using fallback floating button")
      const button = createRunwAIButton()

      Object.assign(button.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "auto",
        zIndex: "999998",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "50px",
        padding: "12px 20px",
      })

      document.body.appendChild(button)
      injected = true
    }

    if (injected) {
      trackEvent("button_injected", {
        url: window.location.href,
        method: injected ? "auto" : "fallback",
      })
    }
  }

  // Initialize the widget
  const init = () => {
    log("Initializing RunwAI widget")

    // Add styles
    addStyles()

    // Inject button when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", injectRunwAIButton)
    } else {
      injectRunwAIButton()
    }

    // Try again after delay for dynamic content
    setTimeout(injectRunwAIButton, 1000)
    setTimeout(injectRunwAIButton, 3000)

    // Watch for dynamic content changes
    if (window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        let shouldReinject = false

        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            shouldReinject = true
          }
        })

        if (shouldReinject && !document.getElementById("runwai-button")) {
          setTimeout(injectRunwAIButton, 500)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    }
  }

  // Expose global API
  window.RunwAI = {
    open: openRunwAIPopup,
    close: closeRunwAIPopup,
    version: RUNWAI_CONFIG.version,
    config: RUNWAI_CONFIG,
  }

  // Make close function globally available for error handling
  window.closeRunwAIPopup = closeRunwAIPopup

  // Start the widget
  init()

  log("RunwAI widget loaded successfully")
})()
