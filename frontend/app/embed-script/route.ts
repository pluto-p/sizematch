import { NextResponse } from "next/server"

export async function GET() {
  const embedScript = `
console.log('[RunwAI] Embed script starting to load...');

;(() => {
  // RunwAI Configuration
  const RUNWAI_CONFIG = {
    apiUrl: window.location.origin.includes("localhost") ? "https://kzmk0kwvtbzus65va7av.lite.vusercontent.net" : window.location.origin,
    version: "1.0.0",
    buttonText: "🎯 Find My Size with RunwAI",
    debug: true,

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
      animation: "runwai-popup-enter 0.3s ease-out",
    },
  }

  const addStyles = () => {
    if (document.getElementById("runwai-styles")) return

    const style = document.createElement("style")
    style.id = "runwai-styles"
    style.textContent = \`
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
    \`
    document.head.appendChild(style)
  }

  const log = (message, ...args) => {
    if (RUNWAI_CONFIG.debug) {
      console.log(\`[RunwAI] \${message}\`, ...args)
    }
  }

  const createRunwAIButton = () => {
    const button = document.createElement("button")
    button.innerHTML = RUNWAI_CONFIG.buttonText
    button.id = "runwai-button"
    button.className = "runwai-button"
    button.setAttribute("data-runwai-version", RUNWAI_CONFIG.version)

    Object.assign(button.style, RUNWAI_CONFIG.buttonStyle)

    button.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      openRunwAIPopup()
    })

    log("Button created")
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
    container.className = "runwai-container"
    Object.assign(container.style, RUNWAI_CONFIG.containerStyle)

    const loader = document.createElement("div")
    loader.innerHTML = \`
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
        <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #1f2937; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 16px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Loading RunwAI...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    \`
    container.appendChild(loader)

    const iframe = document.createElement("iframe")
    const params = new URLSearchParams({
      url: window.location.href,
      embedded: "true",
      version: RUNWAI_CONFIG.version,
      referrer: document.referrer || "",
    })

    const iframeUrl = \`\${RUNWAI_CONFIG.apiUrl}/widget?\${params.toString()}\`
    log("Loading iframe:", iframeUrl)

    iframe.src = iframeUrl
    iframe.style.cssText = \`
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      display: none;
    \`

    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox")
    iframe.setAttribute("loading", "eager")

    iframe.onload = () => {
      log("Iframe loaded successfully")
      loader.style.display = "none"
      iframe.style.display = "block"
    }

    iframe.onerror = (error) => {
      log("Iframe failed to load:", error)
      container.innerHTML = \`
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; padding: 20px; text-align: center;">
          <h3 style="color: #dc2626; margin-bottom: 16px;">Unable to load RunwAI</h3>
          <p style="color: #666; margin-bottom: 20px;">Please check your internet connection and try again.</p>
          <button onclick="closeRunwAIPopup()" style="background: #1f2937; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">Close</button>
        </div>
      \`
    }

    container.appendChild(iframe)
    overlay.appendChild(container)
    document.body.appendChild(overlay)
    document.body.style.overflow = "hidden"

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeRunwAIPopup()
      }
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
    overlay.style.animation = "runwai-popup-exit 0.2s ease-in"

    setTimeout(() => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay)
      }
      document.body.style.overflow = ""
    }, 200)
  }

  const injectRunwAIButton = () => {
    if (document.getElementById("runwai-button")) {
      log("Button already exists")
      return
    }

    log("Attempting to inject button")

    const selectors = [
      'select[name*="size"]:not([style*="display: none"])',
      '.size-selector:not([style*="display: none"])',
      '.product-size:not([style*="display: none"])',
      '.size-options:not([style*="display: none"])',
      '[class*="size"]:not([style*="display: none"])',
      '.add-to-cart:not([style*="display: none"])',
      'button[class*="cart"]:not([style*="display: none"])',
      'button[class*="buy"]:not([style*="display: none"])',
      ".product-form",
      ".product-options",
    ]

    let injected = false

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector)

      for (const element of elements) {
        if (element.offsetParent !== null && element.offsetWidth > 0 && element.offsetHeight > 0) {
          const button = createRunwAIButton()

          try {
            if (element.parentNode) {
              element.parentNode.insertBefore(button, element)
              injected = true
              log(\`Button injected before \${selector}\`)
              break
            }
          } catch (e) {
            log(\`Failed to inject before \${selector}:\`, e)
          }
        }
      }

      if (injected) break
    }

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
  }

  const init = () => {
    log("Initializing RunwAI widget")
    addStyles()

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", injectRunwAIButton)
    } else {
      injectRunwAIButton()
    }

    setTimeout(injectRunwAIButton, 1000)
    setTimeout(injectRunwAIButton, 3000)
  }

  window.RunwAI = {
    open: openRunwAIPopup,
    close: closeRunwAIPopup,
    version: RUNWAI_CONFIG.version,
    config: RUNWAI_CONFIG,
  }

  window.closeRunwAIPopup = closeRunwAIPopup

  init()
  log("RunwAI widget loaded successfully")
})();
`

  return new NextResponse(embedScript, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
