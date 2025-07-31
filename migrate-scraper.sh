#!/usr/bin/env zsh

# Migration script to update the scraper implementation
# This script helps transition from the old monolithic scraper to the new strategy pattern

echo "Starting migration of size chart scraper to strategy pattern architecture..."

# 1. Make backup copies of existing files
echo "Creating backups of existing files..."
cp frontend/app/api/size-chart/utils/retailers/uniqlo.ts frontend/app/api/size-chart/utils/retailers/uniqlo.ts.bak
cp frontend/app/api/size-chart/utils/retailers/index.ts frontend/app/api/size-chart/utils/retailers/index.ts.bak
cp frontend/app/api/size-chart/utils/scraper.ts frontend/app/api/size-chart/utils/scraper.ts.bak

# 2. Replace files with new implementations
echo "Implementing the new strategy pattern architecture..."

# Copy new files over the old ones
cp frontend/app/api/size-chart/utils/retailers/uniqlo-new.ts frontend/app/api/size-chart/utils/retailers/uniqlo.ts
cp frontend/app/api/size-chart/utils/retailers/index-updated.ts frontend/app/api/size-chart/utils/retailers/index.ts
cp frontend/app/api/size-chart/utils/scraper-updated.ts frontend/app/api/size-chart/utils/scraper.ts

# 3. Run the integration tests to verify everything works
echo "Running integration tests to verify the new implementation..."
cd frontend && npm test -- -t "Size Chart Scraper - Integration Tests"

# 4. Provide guidance on rollback if needed
echo "Migration complete! If you encounter any issues, you can restore the backups with:"
echo "cp frontend/app/api/size-chart/utils/retailers/uniqlo.ts.bak frontend/app/api/size-chart/utils/retailers/uniqlo.ts"
echo "cp frontend/app/api/size-chart/utils/retailers/index.ts.bak frontend/app/api/size-chart/utils/retailers/index.ts"
echo "cp frontend/app/api/size-chart/utils/scraper.ts.bak frontend/app/api/size-chart/utils/scraper.ts"
