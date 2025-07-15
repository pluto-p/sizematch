# RunwAI - Smart Sizing Assistant

## Overview

RunwAI is an embeddable smart sizing assistant that helps e-commerce customers find the perfect size using their purchase history. The system reduces returns by providing AI-powered size recommendations based on garments customers have previously purchased and how they fit.

## System Architecture

This is a **Next.js application** with an **embeddable widget system** that can be integrated into any e-commerce website with a single line of code.

### Core Components

#### 1. **Embeddable Widget System** (`/public/embed.js`)
- **Purpose**: JavaScript widget that retailers embed on their websites
- **Functionality**: 
  - Auto-detects size selectors on product pages
  - Injects "Find My Size with RunwAI" buttons
  - Opens sizing popup in iframe overlay
  - Handles cross-origin communication
- **Integration**: Single `<script>` tag in retailer's HTML

#### 2. **Widget Interface** (`/app/widget/page.tsx`)
- **Purpose**: Iframe-embedded page that loads the full sizing experience
- **Functionality**: Optimized for iframe embedding with proper messaging
- **Communication**: Uses postMessage API to communicate with parent window

#### 3. **Authentication System** (`/app/components/auth-screen.tsx`)
- **Purpose**: User login/signup interface
- **Features**: Email/password and OAuth (Google, Facebook) authentication
- **Storage**: Uses localStorage for demo (would use proper auth in production)

#### 4. **Purchase History Management** (`/app/components/purchase-history.tsx`)
- **Purpose**: Manages user's wardrobe of previously purchased garments
- **Features**: 
  - Search and filter garments
  - Add new reference garments via URL scraping
  - Select garments for size comparison

#### 5. **Garment Detection & Scraping** (`/app/utils/garment-detection.ts`)
- **Purpose**: Automatically detects and scrapes garment information from product pages
- **Functionality**: 
  - Detects current page garment info
  - Scrapes product details from URLs
  - Extracts size charts and measurements

#### 6. **Size Recommendation Engine** (`/app/components/size-recommendation.tsx`)
- **Purpose**: AI-powered size matching algorithm
- **Process**:
  1. Compares target garment measurements with reference garment
  2. Accounts for user's fit preferences (tight/regular/loose)
  3. Generates confidence scores and alternatives
  4. Provides detailed measurement comparisons

#### 7. **Reference Garment Addition** (`/app/components/add-reference-form.tsx`)
- **Purpose**: Streamlined flow for adding garments to user's wardrobe
- **Process**: URL input → scraping → size selection → fit rating → save

## Updated File Structure

```
/app
├── components/
│   ├── auth-screen.tsx           # User authentication interface
│   ├── sizing-popup.tsx          # Main popup container with state management
│   ├── sizing-interface.tsx      # Core sizing interface with sidebar layout
│   ├── purchase-history.tsx      # Wardrobe management and garment selection
│   ├── add-reference-form.tsx    # Add new reference garments workflow
│   ├── size-recommendation.tsx   # Size matching algorithm and results display
│   ├── size-selection-modal.tsx  # Legacy component (can be removed)
│   ├── enhanced-sizing-interface.tsx # Enhanced sizing interface
│   ├── multiple-garment-selector.tsx # Multi-garment selection component
│   ├── screenshot-upload.tsx     # Screenshot upload functionality
│   ├── url-input.tsx             # URL input for garment scraping
├── utils/
│   ├── garment-detection.ts      # Web scraping and garment detection logic
│   └── garment-analyzer.ts       # Garment analysis utilities
├── actions/
│   └── scrape-garment.ts         # Server action for garment scraping
├── api/
│   ├── analytics/route.ts        # Analytics endpoint for tracking
│   ├── garments/lookup/route.ts  # Garment lookup API
│   ├── sessions/route.ts         # Session management API
│   └── size-chart/analyze/route.ts # Size chart analysis API
├── widget/
│   └── page.tsx                  # Iframe-embedded widget page
├── embed/
│   └── page.tsx                  # Integration documentation page
├── demo/
│   └── page.tsx                  # Demo page for showcasing features
├── page.tsx                      # Marketing homepage
├── layout.tsx                    # Root layout
├── favicon.ico                   # Favicon for the application
├── globals.css                   # Global CSS styles

/public
├── embed.js                      # Main embeddable widget script
├── embed-widget.js               # Alternative widget implementation
├── embed-improved.js             # Improved widget script
├── integration-guide.html        # Integration documentation
├── file.svg                      # Example SVG file
├── globe.svg                     # Example SVG file
├── next.svg                      # Example SVG file
├── vercel.svg                    # Example SVG file
├── window.svg                    # Example SVG file

/lib
├── utils.ts                      # Utility functions

/components
├── ui/
│   ├── badge.tsx                 # Badge UI component
│   ├── button.tsx                # Button UI component
│   ├── card.tsx                  # Card UI component
│   ├── dialog.tsx                # Dialog UI component
│   ├── input.tsx                 # Input UI component
│   ├── label.tsx                 # Label UI component
│   ├── progress.tsx              # Progress UI component
│   ├── select.tsx                # Select UI component
│   └── tabs.tsx                  # Tabs UI component

Other files:
├── eslint.config.mjs             # ESLint configuration
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Project metadata and dependencies
├── package-lock.json             # Dependency lock file
```

This updated structure reflects the current state of the project, including all files and directories.

## Key Features

### For Retailers
- **30-second integration**: Single script tag
- **Auto-detection**: Automatically finds size selectors
- **No maintenance**: Fully hosted solution
- **Analytics**: Built-in conversion tracking
- **Customizable**: Button styling and placement options

### For Customers
- **Purchase history**: Build wardrobe of owned garments
- **Smart recommendations**: AI-powered size matching
- **Confidence scores**: Know how certain the recommendation is
- **Alternative sizes**: See other options with fit explanations
- **Cross-brand compatibility**: Works across different retailers

## Data Flow

1. **Customer clicks "Find My Size" button** on retailer site
2. **Widget opens** in iframe overlay
3. **Authentication** - customer logs in or signs up
4. **Garment detection** - system detects current product automatically
5. **Reference selection** - customer selects similar garment from their history
6. **Size calculation** - algorithm compares measurements and fit preferences
7. **Recommendation display** - shows recommended size with confidence and alternatives
8. **Purchase tracking** - customer can add new garment to wardrobe for future use

## Technical Implementation

### Embedding Process
\`\`\`html
<!-- Retailer adds this single line -->
<script src="https://runwai.com/embed.js"></script>
\`\`\`

### Widget Initialization
1. Script loads and scans page for size selectors
2. Injects RunwAI buttons near relevant elements
3. Sets up click handlers and iframe communication
4. Handles responsive design and mobile compatibility

### Size Matching Algorithm
\`\`\`typescript
// Simplified algorithm flow:
1. Extract measurements from target garment size chart
2. Compare with reference garment measurements
3. Apply fit preference adjustments (tight/regular/loose)
4. Calculate confidence score based on measurement similarity
5. Generate alternative size recommendations
6. Format results with explanations
\`\`\`

### Cross-Origin Communication
- Uses `postMessage` API for iframe ↔ parent communication
- Handles close events, resize requests, and analytics
- Secure origin validation for production use

## Mock Data & Simulation

The current implementation uses **mock data** for demonstration:
- **Authentication**: Simulated login (no real backend)
- **Garment scraping**: Mock responses based on URL patterns
- **Purchase history**: Pre-populated sample garments
- **Size recommendations**: Simplified algorithm with mock calculations

## Production Considerations

To make this production-ready, implement:

### Backend Services
- **User authentication** with proper JWT/session management
- **Database** for user profiles and purchase history
- **Web scraping service** with proxy rotation and rate limiting
- **Machine learning** models for improved size recommendations

### Security
- **CORS policies** for iframe embedding
- **Input validation** for all user data
- **Rate limiting** on API endpoints
- **Secure credential storage**

### Performance
- **CDN delivery** for embed script
- **Caching** for scraped garment data
- **Image optimization** for garment photos
- **Analytics batching** to reduce server load

### Integration
- **E-commerce platform plugins** (Shopify, WooCommerce, etc.)
- **Webhook support** for real-time purchase tracking
- **API documentation** for custom integrations
- **A/B testing** framework for optimization

## Usage Instructions for LLMs

When working with this codebase:

1. **Main entry point**: `/app/page.tsx` (marketing site) and `/app/widget/page.tsx` (embedded widget)
2. **State management**: Centralized in `sizing-popup.tsx` with prop drilling to child components
3. **Styling**: Uses Tailwind CSS with gray/black color scheme throughout
4. **Mock data**: All API calls are simulated - look for `await new Promise(resolve => setTimeout(resolve, 1000))` patterns
5. **Component hierarchy**: `SizingPopup` → `SizingInterface` → `PurchaseHistory` + `SizeRecommendation`
6. **Embedding**: The `/public/embed.js` script is the main integration point for retailers

The system is designed to be **modular** and **extensible** - each component handles a specific part of the user journey and can be modified independently.
