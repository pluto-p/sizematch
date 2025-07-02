;(() => {
  // RunwAI Widget Configuration
  const RUNWAI_CONFIG = {
    apiUrl: window.location.origin, // Use current domain for demo
    buttonText: "🎯 Find My Size with RunwAI",
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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
  }

  // Create the RunwAI button
  function createRunwAIButton() {
    const button = document.createElement("button")
    button.innerHTML = RUNWAI_CONFIG.buttonText
    button.id = "runwai-button"

    // Apply styles
    Object.assign(button.style, RUNWAI_CONFIG.buttonStyle)

    // Add hover effect
    button.addEventListener("mouseenter", function () {
      this.style.background = "#374151"
    })

    button.addEventListener("mouseleave", function () {
      this.style.background = "#1f2937"
    })

    // Add click handler
    button.addEventListener("click", () => {
      openRunwAIPopup()
    })

    return button
  }

  // Open the RunwAI popup
  function openRunwAIPopup() {
    // Create overlay
    const overlay = document.createElement("div")
    overlay.id = "runwai-overlay"
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    // Create iframe container
    const iframeContainer = document.createElement("div")
    iframeContainer.style.cssText = `
      width: 90%;
      max-width: 1200px;
      height: 90%;
      max-height: 800px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      position: relative;
    `

    // Create iframe - loads ONLY the popup component
    const iframe = document.createElement("iframe")
    iframe.src = `${RUNWAI_CONFIG.apiUrl}/widget?url=${encodeURIComponent(window.location.href)}&embedded=true`
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
    `

    // Prevent iframe from being indexed or cached
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups")

    iframeContainer.appendChild(iframe)
    overlay.appendChild(iframeContainer)
    document.body.appendChild(overlay)

    // Prevent body scroll when popup is open
    document.body.style.overflow = "hidden"

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

    // Listen for close message from iframe
    const handleMessage = (event) => {
      if (event.data === "closeRunwAI") {
        closeRunwAIPopup()
        window.removeEventListener("message", handleMessage)
      }
    }
    window.addEventListener("message", handleMessage)
  }

  // Close the RunwAI popup
  function closeRunwAIPopup() {
    const overlay = document.getElementById("runwai-overlay")
    if (overlay) {
      document.body.removeChild(overlay)
      // Restore body scroll
      document.body.style.overflow = ""
    }
  }

  // Auto-inject button near size selectors
  function injectRunwAIButton() {
    // Avoid double injection
    if (document.getElementById("runwai-button")) {
      return
    }

    // Look for common size selector patterns
    const selectors = [
      'select[name*="size"]',
      ".size-selector",
      ".product-size",
      ".size-options",
      '[class*="size"]',
      ".add-to-cart",
      'button[class*="cart"]',
      'button[class*="buy"]',
    ]

    let injected = false

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector)
      elements.forEach((element) => {
        if (!injected && element.offsetParent !== null) {
          // Element is visible
          const button = createRunwAIButton()

          // Try to insert before the element (above it)
          if (element.parentNode) {
            element.parentNode.insertBefore(button, element)
            injected = true
          }
        }
      })

      if (injected) break
    }

    // Fallback: add to body if no suitable location found
    if (!injected) {
      const button = createRunwAIButton()
      button.style.position = "fixed"
      button.style.bottom = "20px"
      button.style.right = "20px"
      button.style.width = "auto"
      button.style.zIndex = "999998"
      button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
      document.body.appendChild(button)
    }
  }

  // Initialize when DOM is ready
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", injectRunwAIButton)
    } else {
      injectRunwAIButton()
    }

    // Also try again after a short delay in case content loads dynamically
    setTimeout(injectRunwAIButton, 1000)
  }

  // Start the widget
  init()

  // Expose global function for manual triggering
  window.RunwAI = {
    open: openRunwAIPopup,
    close: closeRunwAIPopup,
  }
})()
