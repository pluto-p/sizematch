"use client"

import { useState, useEffect } from "react"

export default function EmbedPage() {
  const [script, setScript] = useState("")

  useEffect(() => {
    // This would be the embeddable script that retailers add to their sites
    const scriptContent = `
      (function() {
        // Create the "Find My Size" button
        function createSizingButton() {
          const button = document.createElement('button');
          button.innerHTML = '🎯 Find My Size';
          button.style.cssText = \`
            background: #7c3aed;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            margin: 8px 0;
            width: 100%;
          \`;
          
          button.addEventListener('click', function() {
            openSizingPopup();
          });
          
          return button;
        }
        
        // Open the sizing popup
        function openSizingPopup() {
          const iframe = document.createElement('iframe');
          iframe.src = '${window.location.origin}/widget?url=' + encodeURIComponent(window.location.href);
          iframe.style.cssText = \`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            z-index: 10000;
            background: rgba(0,0,0,0.5);
          \`;
          
          document.body.appendChild(iframe);
          
          // Listen for close message
          window.addEventListener('message', function(event) {
            if (event.data.type === 'RUNWAI_CLOSE') {
              document.body.removeChild(iframe);
            }
          });
        }
        
        // Auto-inject button near size selectors
        function injectButton() {
          const sizeSelectors = document.querySelectorAll('select[name*="size"], .size-selector, .product-size, [class*="SizeSelector"], [data-testid*="size-selector"]');
          let injected = false;
          sizeSelectors.forEach(selector => {
            if (injected) return; // Inject only once
            const button = createSizingButton();
            selector.parentNode.insertBefore(button, selector.nextSibling);
            injected = true;
          });

          // Fallback if no selector found
          if (!injected) {
            const addToCart = document.querySelector('[data-testid*="add-to-cart"], button[name="add"], #add-to-cart');
            if (addToCart) {
               const button = createSizingButton();
               addToCart.parentNode.insertBefore(button, addToCart);
            }
          }
        }
        
        // Expose RunwAI object
        window.RunwAI = {
          open: openSizingPopup,
        };

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', injectButton);
        } else {
          injectButton();
        }
      })();
    `
    setScript(scriptContent)
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Embeddable Smart Sizing Script</h1>
      <p className="mb-4">Retailers can add this script to their websites to enable smart sizing:</p>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{script}</code>
      </pre>
      <p className="mt-4 text-sm text-gray-600">
        This script automatically detects size selectors and adds &quot;Find My Size&quot; buttons next to them.
      </p>
    </div>
  )
}
