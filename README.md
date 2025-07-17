# SizeMatch AI Sizing Widget

This project is an embeddable widget that can be placed on retail websites to provide AI-powered size recommendations to customers. It analyzes product information directly from the retailer's page and compares it against a user's purchase history to suggest the best fit.

## How It Works: The Analysis Workflow

The entire process is initiated within the user's browser on the retailer's website, orchestrated by an embedded JavaScript widget.

1.  **Embedding**: A retailer embeds a `<script>` tag on their product pages, which loads the widget's code from our Next.js application (e.g., `public/embed-widget.js`).

2.  **Widget Initialization**: When a user visits the product page, the embedded script loads and initializes the main UI component, `EnhancedSizingInterface`.

3.  **DOM Analysis**:
    *   The `EnhancedSizingInterface` component immediately instantiates and runs the `GarmentAnalyzer`.
    *   `GarmentAnalyzer` scans the retailer's webpage DOM to extract key information like product name, brand, price, available sizes, and looks for a size chart table.
    *   **Enhanced logging** has been added here. Open the browser's developer console to see detailed output from `[GarmentAnalyzer]` as it extracts each piece of data.

4.  **State Management & UI Flow**:
    *   The `EnhancedSizingInterface` receives the analysis result from the `GarmentAnalyzer`.
    *   Based on the completeness of the scraped data, it transitions through different states:
        *   **Success**: If all data is found, it displays the size recommendation UI.
        *   **Backend Lookup**: If a size chart is missing, it can call a backend API (`/api/garments/lookup`) to see if we have it saved.
        *   **Manual Input**: If the analysis has low confidence, it prompts the user to upload a screenshot of the size chart.
    *   **Enhanced logging** in `[EnhancedSizingInterface]` shows which state is active and why.

5.  **Backend API Interaction**:
    *   If a user uploads a screenshot of a size chart, the data is sent to the `/api/size-chart/analyze` endpoint.
    *   This serverless function (which simulates a call to a Vision AI) processes the image, extracts the measurements, and returns a structured size chart.
    *   **Enhanced logging** in `[API/size-chart/analyze]` tracks the request's progress on the server.

6.  **Recommendation**: Finally, the component uses the complete product data to provide a size recommendation to the user.

## Project Structure

Here are the key files and directories involved in the workflow:

-   `frontend/`
    -   `app/`
        -   `components/`
            -   `enhanced-sizing-interface.tsx`: The main React component that orchestrates the entire widget UI and analysis workflow.
            -   `sizing-popup.tsx`: The container for the widget's UI.
        -   `utils/`
            -   `garment-analyzer.ts`: The core client-side logic responsible for scraping and analyzing the host page's DOM. **This is where the primary data extraction happens.**
        -   `api/`
            -   `size-chart/analyze/route.ts`: The backend API endpoint for processing size chart screenshots.
            -   `garments/lookup/route.ts`: API endpoint to look up known garments from a database.
    -   `public/`
        -   `embed-widget.js`: The distributable JavaScript file that retailers embed on their websites.

## Getting Started

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser to `http://localhost:3000/` to see the application. The demo pages (`/dev-test`, `/embed`) are useful for testing the widget's functionality.
