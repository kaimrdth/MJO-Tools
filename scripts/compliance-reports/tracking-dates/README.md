# Court Dates Management System

A Google Apps Script-based system for managing court dates across multiple spreadsheets, designed to track upcoming court dates and synchronize updates back to the main case management system.

## System Overview

This system consists of two main components that work together to manage court date information:

1. **PullUpcomingDates.gs** - Extracts upcoming court dates from main case sheets
2. **PushUpdatedDates.gs** - Updates main sheets with revised court dates

## Architecture

```
┌─────────────────┐    Pull Upcoming    ┌──────────────────┐
│   Main Sheet    │ ──────────────────► │ Upcoming Dates   │
│   (Source)      │                     │   Spreadsheet    │
│                 │                     │                  │
│ Multiple Tabs   │                     │ ┌──────────────┐ │
│ Case Data       │                     │ │Upcoming Dates│ │
│                 │                     │ │   (Tab 1)    │ │
│                 │    Push Updates     │ └──────────────┘ │
│                 │ ◄──────────────────  │ ┌──────────────┐ │
└─────────────────┘                     │ │Updated Dates │ │
                                        │ │   (Tab 2)    │ │
                                        │ └──────────────┘ │
                                        └──────────────────┘
```

## Component Details

### 1. PullUpcomingDates.gs

**Purpose**: Extracts court dates from the main spreadsheet that fall within the next 10 weeks.

**Key Features**:
- Scans all sheets in the main spreadsheet except excluded ones
- Filters dates to show only upcoming dates (next 10 weeks)
- Prevents duplicate entries by checking existing docket numbers
- Highlights new entries in yellow for easy identification
- Automatically sorts data by date
- Handles "Last Court Date" tracking

**Configuration**:
```javascript
const MAIN_SHEET_ID = 'SOURCE_SHEET_ID';           // Main case management sheet
const UPCOMING_DATES_SHEET_ID = 'DESTINATION_SHEET_ID';  // Upcoming dates sheet
const UPCOMING_WEEKS = 10;                          // Look-ahead period
const HIGHLIGHT_COLOR = '#FFFF00';                  // Yellow highlight for new entries
```

**Excluded Sheets**:
- Alchemer Master Sheet - No edits allowed
- RC Calendar
- Salesforce_Engagements
- MCJC Data
- MCJC Referrals
- RESET

**Data Structure**:
- Uses column indexes to identify key fields:
  - Column B (1): Docket Number
  - Column G (6): Adjournment Date
  - Column A (0): Mandate Date
  - Column K (10): Last Court Date (source)
  - Column P (15): Last Court Date (destination)

### 2. PushUpdatedDates.gs

**Purpose**: Updates the main spreadsheet with revised court dates from the "Updated Dates" tab.

**Key Features**:
- Reads from "Updated Dates" tab in the upcoming dates spreadsheet
- Matches records by docket number
- Updates adjournment dates and court parts
- Preserves court date history by moving current date to "Last Court Date"
- Processes all tabs in main sheet (except first tab)

**Configuration**:
```javascript
var mainSheetId = 'destination_google_sheets_ID';    // Main case management sheet
var upcomingDatesSheetId = 'source_google_sheets_ID'; // Upcoming dates sheet
var upcomingDatesTab3Name = 'Updated Dates';          // Source tab for updates
```

**Update Process**:
1. Current adjournment date is saved as "Last Court Date"
2. New adjournment date replaces current date
3. Court part information is updated
4. Changes are applied across all relevant sheets

## Workflow

### Step 1: Extract Upcoming Dates
```javascript
copyUpcomingDates();
```
- Scans main spreadsheet for dates in next 10 weeks
- Creates/updates "Upcoming Dates" tab
- Highlights new entries in yellow
- Sorts by date ascending

### Step 2: Manual Review & Updates
- Review upcoming dates in the "Upcoming Dates" tab
- Make any necessary changes to dates/court parts
- Move updated records to "Updated Dates" tab

### Step 3: Push Updates Back
```javascript
updateMainSheetDates();
```
- Reads from "Updated Dates" tab
- Matches by docket number
- Updates main spreadsheet with new information
- Preserves date history

## Column Mapping

| Column | Letter | Purpose | Pull Script | Push Script |
|--------|--------|---------|-------------|-------------|
| 0 | A | Mandate Date | ✓ | |
| 1 | B | Docket Number | ✓ | ✓ |
| 6 | G | Adjournment Date | ✓ | ✓ |
| 7 | H | Court Part | | ✓ |
| 10 | K | Last Court Date (Main) | ✓ | ✓ |
| 15 | P | Last Court Date (Upcoming) | ✓ | ✓ |

## Setup Instructions

### Prerequisites
- Google Apps Script access
- Two Google Sheets:
  - Main case management spreadsheet
  - Upcoming dates tracking spreadsheet

### Installation

1. **Configure Sheet IDs**:
   ```javascript
   // In PullUpcomingDates.gs
   const MAIN_SHEET_ID = 'your_main_sheet_id';
   const UPCOMING_DATES_SHEET_ID = 'your_upcoming_dates_sheet_id';
   
   // In PushUpdatedDates.gs
   var mainSheetId = 'your_main_sheet_id';
   var upcomingDatesSheetId = 'your_upcoming_dates_sheet_id';
   ```

2. **Set up triggers** (optional):
   - Create time-driven triggers for automatic execution
   - Recommended: Daily execution of `copyUpcomingDates()`

3. **Create required tabs**:
   - "Upcoming Dates" tab will be created automatically
   - Manually create "Updated Dates" tab for the push process

### Usage

1. **Regular Monitoring**:
   ```javascript
   copyUpcomingDates();
   ```
   Run daily or as needed to capture new upcoming dates.

2. **Process Updates**:
   - Review highlighted entries in "Upcoming Dates"
   - Move changed records to "Updated Dates" tab
   - Run: `updateMainSheetDates();`

## Error Handling

Both scripts include comprehensive error handling:
- Invalid date detection and logging
- Spreadsheet access error handling
- Data validation checks
- Detailed logging for troubleshooting

## Logging

The system provides detailed logging for:
- Number of new records added
- Date validation errors
- Processing status updates
- Error stack traces

## Best Practices

1. **Regular Backups**: Backup main spreadsheet before major updates
2. **Test Environment**: Test scripts on copies before production use
3. **Monitor Logs**: Regular review of execution logs
4. **Data Validation**: Verify date formats and docket numbers
5. **Manual Review**: Always review highlighted entries before processing

## Troubleshooting

### Common Issues

1. **Invalid Date Errors**: Check date format consistency
2. **Duplicate Entries**: Verify docket number uniqueness
3. **Missing Data**: Ensure all required columns exist
4. **Permission Errors**: Verify script has access to both spreadsheets

### Debug Tips

- Check Google Apps Script execution logs
- Verify sheet names match configuration
- Ensure column indexes align with actual data structure
- Test with small data sets first

## Maintenance

- **Monthly**: Review excluded sheets list
- **Quarterly**: Validate column mappings
- **As needed**: Adjust `UPCOMING_WEEKS` parameter
- **Regular**: Monitor script execution quotas and performance
