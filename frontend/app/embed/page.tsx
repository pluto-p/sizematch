"use client"

import { useEffect } from "react"

export default function EmbedPage() {
  useEffect(() => {
    // This would be the embeddable script that retailers add to their sites
    const script = `
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
          iframe.src = '${window.location.origin}';
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
            if (event.data === 'closeSizingPopup') {
              document.body.removeChild(iframe);
            }
          });
        }
        
        // Auto-inject button near size selectors
        function injectButton() {
          const sizeSelectors = document.querySelectorAll('select[name*="size"], .size-selector, .product-size');
          sizeSelectors.forEach(selector => {
            const button = createSizingButton();
            selector.parentNode.insertBefore(button, selector.nextSibling);
          });
        }
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', injectButton);
        } else {
          injectButton();
        }
      })();
    `

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Embeddable Smart Sizing Script</h1>
        <p className="mb-4">Retailers can add this script to their websites to enable smart sizing:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{script}</code>
        </pre>
        <p className="mt-4 text-sm text-gray-600">
          This script automatically detects size selectors and adds "Find My Size" buttons next to them.
        </p>
      </div>
    )
  }, [])

  return null
}
