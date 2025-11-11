# AEM Cloud Migrations Reporter - Admin Interface

## Overview

The AEM Cloud Migrations Reporter provides a comprehensive dashboard for tracking and analyzing AEM Cloud Service migration activities across multiple customers.

## Architecture

### File Structure

```
migration-admin/
├── index.html          # Entry point HTML
├── main.js             # Application controller and state management
├── main.css            # Stylesheet
├── api.js              # API communication layer
├── config.js           # Environment configuration
├── constants.js        # Application constants
├── errors.js           # Error handling utilities
├── validators.js       # Data validation layer
├── utils.js            # Utility functions
├── graph.js            # Chart rendering logic
├── migrationsTable.js  # Table component
├── userProfile.js      # User authentication
└── DateRange.js        # Date range selection logic
```

### Key Components

#### Main Application (`main.js`)
- **`MigrationsApp`** - Main application controller
  - Manages application state (migrations, filteredMigrations)
  - Handles user authentication
  - Coordinates data loading and UI updates
  - Event listener setup and management

#### Data Visualization (`graph.js`)
- **`createCustomersGraph()`** - Renders unique customers by time period
- **`createIngestionsGraph()`** - Renders ingestion activity by time period
- Uses SVG for scalable, interactive charts
- Includes gradient coloring based on data intensity

#### Table Display (`migrationsTable.js`)
- **`MigrationsTable`** - Table rendering and interaction
  - Sortable columns
  - Formatted date and number display
  - Responsive design

#### Data Layer
- **`api.js`** - API calls with error handling
- **`validators.js`** - Input validation and data normalization
- **`errors.js`** - Centralized error handling

### Data Flow

```
1. User Action (page load / date range selection / search)
   ↓
2. MigrationsApp.startMigrationSearch()
   ↓
3. API Call (getCustomerMigrationInfo)
   ↓
4. Data Validation (validateMigrations)
   ↓
5. Data Processing (filter, sort)
   ↓
6. UI Rendering (graphs + table)
   ↓
7. User Interaction (sort, hover, etc.)
```

## Development

### Local Setup

```bash
# Navigate to project root
cd aem-cloud-migration-reporter

# Install dependencies
npm install

# Start local development server
aem up

# Access the admin interface
open http://localhost:3000/migration-admin/?email=you@adobe.com&name=YourName
```

**Note:** For localhost development, email and name query parameters are required.

### Build & Deploy

```bash
# Run linter
npm run lint

# Run specific linters
npm run lint:js
npm run lint:css
```

### Code Style Guidelines

1. **Use constants** - Extract magic numbers and strings to `constants.js`
2. **Add JSDoc** - Document all public functions and classes
3. **Error handling** - Use `MigrationError` and `ValidationError` classes
4. **Validation** - Validate all user input and API data
5. **ESLint** - Follow project ESLint configuration

### Adding New Features

#### Adding a New Graph

1. Define configuration in `constants.js`:

   ```javascript
   export const GRAPH_CONFIG = {
     // ... add your config
   };
   ```

2. Create graph function in `graph.js`:

   ```javascript
   export function createMyGraph(migrations) {
     return createBarGraph({
       migrations,
       title: 'My Graph Title',
       yAxisLabel: 'Y Axis',
       xAxisLabel: 'X Axis',
       barColor: '#hexcolor',
       calculateData: (migs) => {
         // Your logic here
         return { dataPoints, maxCount };
       },
     });
   }
   ```

3. Render in `main.js`:

   ```javascript
   const myGraph = createMyGraph(this.filteredMigrations);
   graphWrapper.appendChild(myGraph);
   ```

#### Adding a New Table Column

1. Add column definition to `constants.js`:

   ```javascript
   export const COLUMNS = {
     // ...existing columns...
     NEW_COLUMN: 'newColumnKey',
   };
   ```

2. Update table header in `migrationsTable.js`
3. Update row rendering logic

#### Adding a New Filter

1. Add HTML element in `index.html`
2. Add element ID to `constants.js` - `ELEMENT_IDS`
3. Add event listener in `main.js` - `setupEventListeners()`
4. Implement filter logic in `filterMigrations()`

## Data Models

### Migration Object

```typescript
interface Migration {
  customerName: string;        // Customer name
  imsOrgId: string;            // IMS Organization ID
  firstIngestion: number;      // Unix timestamp (ms)
  lastIngestion: number;       // Unix timestamp (ms)
  totalIngestions: number;     // Total count
  failedIngestions: number;    // Failed count
  totalProjects: number;       // Project count
  bpaReportUploaded: number;   // Unix timestamp (ms)
  ingestionStartDates: number[]; // Array of timestamps
}
```

### Date Range Options

- `LAST_1_MONTH` - Last 30 days
- `LAST_2_MONTHS` - Last 60 days (default)
- `LAST_3_MONTHS` - Last 90 days

## API Endpoints

### GET Migration Data

**Endpoint:** `${API_ENDPOINT}?from={timestamp}`

**Parameters:**
- `from` - Start date as Unix timestamp in milliseconds

**Response:**
```json
[
  {
    "customerName": "Customer Name",
    "imsOrgId": "ABC123@AdobeOrg",
    "firstIngestion": 1699564800000,
    "lastIngestion": 1699651200000,
    "totalIngestions": 10,
    "failedIngestions": 0,
    "totalProjects": 2,
    "bpaReportUploaded": 1699478400000,
    "ingestionStartDates": [1699564800000, 1699651200000]
  }
]
```

## Error Handling

### Error Types

- **`MigrationError`** - General application errors
- **`ValidationError`** - Data validation failures

### Error Display

Errors are displayed inline in the UI:
```javascript
import { handleError } from './errors.js';

try {
  // Your code
} catch (error) {
  handleError(error, 'User-friendly message');
}
```

## Utilities

### Date Utilities

```javascript
import { DateUtils } from './utils.js';

DateUtils.formatDate(timestamp);           // "Nov 10, 2024"
DateUtils.formatDate(timestamp, true);     // "Nov 10, 2024, 14:30:00 UTC"
DateUtils.daysAgo(timestamp);              // 5
DateUtils.formatDateRange(start, end);     // "Nov 1-10"
```

### Number Utilities

```javascript
import { NumberUtils } from './utils.js';

NumberUtils.formatNumber(1234567);              // "1,234,567"
NumberUtils.formatPercentage(25, 100);          // "25.0%"
NumberUtils.clamp(value, 0, 100);               // Clamps between 0-100
```

### DOM Utilities

```javascript
import { DOMUtils } from './utils.js';

DOMUtils.getElementById('my-id');
DOMUtils.createSVGElement('rect', { x: 0, y: 0 });
DOMUtils.toggleSpinner(true);
```

## Testing

### Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Graphs render correctly
- [ ] Table displays data
- [ ] Sorting works on all columns
- [ ] Date range filtering works
- [ ] Customer search filtering works
- [ ] Responsive layout works on mobile
- [ ] Error messages display correctly
- [ ] Loading spinner shows during data fetch

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

### Optimization Tips

1. **Large datasets** - Use pagination or virtual scrolling for >1000 rows
2. **Graph rendering** - Debounce window resize events
3. **API calls** - Implement caching with reasonable TTL
4. **DOM updates** - Batch updates to minimize reflows

## Troubleshooting

### Common Issues

**Issue:** "Module not found" error  
**Solution:** Check import paths and ensure files exist

**Issue:** Authentication fails on localhost  
**Solution:** Add `?email=your@email.com&name=YourName` to URL

**Issue:** Data not loading  
**Solution:** Check browser console for API errors, verify network connection

**Issue:** Graphs not rendering  
**Solution:** Check for JavaScript errors, ensure data format is correct

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linter: `npm run lint`
4. Test thoroughly
5. Create pull request with description

## License

Copyright 2025 Adobe. All rights reserved.  
Licensed under the Apache License, Version 2.0.

