"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Zap, Shield, BarChart3 } from "lucide-react"
import Script from "next/script"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">RunwAI</h1>
              <span className="ml-2 text-sm text-gray-500">Smart Sizing Assistant</span>
            </div>
            <nav className="flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="#integration" className="text-gray-600 hover:text-gray-900">
                Integration
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
              <Button className="bg-gray-900 hover:bg-gray-800">Get Started</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Reduce Returns with
            <span className="text-gray-700"> Smart Sizing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Help your customers find the perfect size using their purchase history. Integrate in 30 seconds with just
            one line of code.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-lg px-8 py-4"
              onClick={() => window.RunwAI?.open()}
            >
              🎯 Find My Size with RunwAI
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-transparent" asChild>
              <Link href="/dev-test">Go to Dev Test Bench</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">↑ Try the actual RunwAI experience right now!</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RunwAI?</h2>
            <p className="text-xl text-gray-600">Powerful features that drive results</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">30-Second Setup</h3>
              <p className="text-gray-600">Add one line of code and you&apos;re done. No complex integration required.</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">AI-powered size matching based on customer purchase history.</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">Customer data is encrypted and never shared with third parties.</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Included</h3>
              <p className="text-gray-600">Track conversion improvements and sizing accuracy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section id="integration" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Integration Made Simple</h2>
            <p className="text-xl text-gray-600">Add RunwAI to your site in three easy steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Copy the Script</h3>
              <p className="text-gray-600 mb-4">Copy our one-line embed script</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono">
                &lt;script src=&quot;https://runwai.com/embed.js&quot;&gt;&lt;/script&gt;
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Add to Your Site</h3>
              <p className="text-gray-600">Paste it before the closing &lt;/body&gt; tag on your product pages</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">You&apos;re Done!</h3>
              <p className="text-gray-600">RunwAI automatically detects your products and adds sizing buttons</p>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800">
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">RunwAI</h3>
              <p className="text-gray-400">Smart sizing for e-commerce</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#integration" className="hover:text-white">
                    Integration
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="mailto:support@runwai.com" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RunwAI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Load RunwAI script for homepage demo */}
      <Script
        src="/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Hide the auto-injected button since we have our own
          const autoButton = document.getElementById("runwai-button")
          if (autoButton) {
            autoButton.style.display = "none"
          }
        }}
      />
    </div>
  )
}
