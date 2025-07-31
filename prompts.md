Project Context Prompt: 

-----------
1. General prompt to start new conversations.

I am developing a smart sizing SaaS widget called RunwAI for fashion e-commerce sites. The solution consists of an embeddable script that retailers add to their product pages, which extracts garment information (such as name, brand, price, images, category, and product ID) directly from the DOM using a GarmentAnalyzer class. This information is sent to a popup widget via postMessage.

The popup is a Next.js React app that provides a user experience including sign-in, a virtual wardrobe (purchase history), garment analysis, size recommendations, and manual input flows. The widget supports authentication, reference garment selection, backend size chart lookups, screenshot uploads, and multiple garment detection. The UI is modular, with components for authentication, sizing interface, purchase history, size recommendation, and more.

The codebase follows modern best practices (TypeScript, React, Next.js, modular components, ESLint, optimized images, etc.) and is designed for extensibility and maintainability. I want to continue developing new features, improving garment info extraction, enhancing the popup UI, and integrating with backend APIs for size recommendations and analytics.

Please use this context for any future feature development, bug fixes, or architectural improvements.
------------

2. Size Chart Scraper Development Roadmap

I am developing a universal size chart scraping solution that can reliably extract size data from any retail website, regardless of how they structure or render their size charts. This is a critical component of the RunwAI sizing widget, allowing us to dynamically retrieve and use accurate sizing information.

## Current Status (July 2025)
- Successfully implemented a Playwright-based approach that can extract size charts from fully rendered DOM content
- Created a browser manager singleton for handling browser lifecycle efficiently
- Implemented multiple extraction strategies for different layout types (tables, grids, JSON data)
- Built a comprehensive test suite that validates each extraction method and provides debugging information
- Fixed grid layout extraction to properly handle CSS grid-based size charts

## Development Roadmap

### Phase 1: Enhanced Extraction Capabilities (Current)
- Refine grid layout detection to handle more complex arrangements
- Add support for extracting from flexbox layouts and non-standard structures
- Implement image-based size chart detection for retailers that only provide images
- Create retailer-specific modules for major fashion websites with known patterns

### Phase 2: Interactive & Resilient Scraping (Next)
- Add capabilities to click on "Size Guide" links or buttons when charts aren't initially visible
- Implement automatic navigation to dedicated size chart pages when needed
- Develop fallback strategies to try multiple approaches when primary extraction fails
- Add wait and retry logic for slow-loading or dynamically injected content

### Phase 3: Data Normalization & Processing (Upcoming)
- Standardize measurement units (convert between inches/cm/etc.)
- Normalize measurement names across different retailers
- Handle range values in measurements (e.g., "34-36")
- Improve data cleanup for inconsistent or malformatted size charts

### Phase 4: Advanced Features (Future)
- Implement OCR capabilities for extracting data from image-only size charts
- Add caching mechanism to reduce redundant scraping of the same retailers
- Develop an AI model to identify size charts on pages without clear indicators
- Create a retailer database with known size chart patterns and locations

## Progress Tracking
- ✅ Headless browser approach with Playwright
- ✅ Extraction from HTML tables
- ✅ Extraction from CSS grid layouts
- ✅ Extraction from embedded JSON data
- ✅ Retailer-specific optimizations (Uniqlo)
- ⬜ Clicking size chart links
- ⬜ Image-based extraction
- ⬜ Measurement standardization

Please use this roadmap to guide the development of the size chart scraping functionality. When working on any component, prioritize reliability, performance, and maintainability.
------------

3. Development Best Practices and Test-Driven Approach

When extending or enhancing the RunwAI system, follow these development principles to ensure maintainable, reliable, and efficient code:

## Development Workflow

### Requirements-First Approach
1. **Define Requirements Clearly**: Begin by clearly articulating what the feature should do, its inputs, outputs, and constraints.
2. **Write Acceptance Criteria**: Create specific, testable criteria that define when the feature is complete.

### Test-Driven Development (When Appropriate)
1. **Write Tests First**: For complex or critical features, write failing tests that define the expected behavior before implementation.
2. **Implement Minimally**: Write just enough code to make the tests pass.
3. **Refactor**: Clean up the implementation while keeping tests passing.

### Pragmatic Balance
1. **Optimize for Iteration Speed**: For exploratory features or UI components, prioritize rapid iteration and feedback loops over strict TDD.
2. **Apply TDD Selectively**: Use TDD for:
   - Core business logic
   - Data processing pipelines
   - API integrations
   - Bug fixes (write a test that reproduces the bug)

## Code Quality Standards

1. **TypeScript Best Practices**:
   - Use specific types over `any` in production code
   - Define interfaces for data structures
   - Use environment-aware configurations for tests vs. production

2. **Component Structure**:
   - Keep components focused on single responsibilities
   - Use composition over inheritance
   - Follow the strategy pattern for variable behavior

3. **Testing Strategy**:
   - Unit tests for isolated functionality
   - Integration tests for feature workflows
   - Custom ESLint rules for test files when necessary

## Implementation Guidelines

1. **For Retail Scraper Enhancements**:
   - Implement retailer-specific scrapers by extending the RetailerScraper interface
   - Follow existing patterns for error handling and type safety
   - Ensure tests cover URL generation, extraction, and error cases

2. **For UI Components**:
   - Start with component design and user flow
   - Test state transitions and edge cases
   - Ensure responsive design and accessibility

3. **For Data Processing**:
   - Define clear data models and validation
   - Use strong typing for all transformations
   - Implement proper error boundaries

Apply these practices pragmatically, using them to accelerate development rather than slow it down. The goal is maintainable, reliable code that can be confidently extended as the RunwAI platform evolves.
------------