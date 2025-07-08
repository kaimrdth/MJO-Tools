# Compliance Report Generator

A Google Apps Script that automates the generation of compliance reports from spreadsheet data, organizing them into a structured folder hierarchy in Google Drive.

## Overview

This script processes rows from a Google Sheets spreadsheet containing court case information and generates compliance reports using predefined Google Docs templates. Reports are automatically organized into a nested folder structure based on dates and court parts.

## Features

- **Batch Processing**: Processes reports in configurable batches to avoid execution time limits
- **Progress Tracking**: Saves progress between runs and allows manual starting point selection
- **Template-Based Generation**: Uses Google Docs templates with placeholder replacement
- **Smart Organization**: Creates a nested folder structure (Year → Month → Week → Day → Part)
- **Duplicate Prevention**: Skips files that already exist
- **Legacy Migration**: Automatically reorganizes old folder structures to the new format

## Prerequisites

1. Google Sheets spreadsheet named "Upcoming Dates" with the following columns:
   - Column A: Mandate Date
   - Column B: Docket #
   - Column C: Participant Name
   - Column D: Charge
   - Column E: Dispo
   - Column F: Mandate
   - Column G: Adjourn Date
   - Column H: Part
   - Column I: Notes
   - Column J: RC
   - Column P: Last Court Date

2. Google Docs templates with placeholders:
   - `{{Mandate Date}}`
   - `{{Docket #}}`
   - `{{Participant Name}}`
   - `{{Charge}}`
   - `{{Dispo}}`
   - `{{Mandate}}`
   - `{{Adjourn. Date}}`
   - `{{Part}}`
   - `{{Notes}}`
   - `{{RC}}`
   - `{{LastCourtDate}}`

3. A Google Drive folder to store generated reports

## Setup

1. **Create Templates**: 
   - Create Google Docs templates for each RC (Resource Coordinator)
   - Add placeholders using the format `{{Placeholder Name}}`
   - Note the document IDs

2. **Update Configuration**:
   ```javascript
   // Update template IDs in rcTemplateMap
   var rcTemplateMap = {
     "Kai": "YOUR_TEMPLATE_ID_HERE",
     // Add more RC mappings as needed
   };
   
   // Update main folder ID
   var mainFolderId = "YOUR_FOLDER_ID_HERE";
   ```

3. **Adjust Batch Size** (optional):
   ```javascript
   var BATCH_SIZE = 15; // Adjust based on your needs
   ```

## Usage

### Running the Script

1. Open your Google Sheets file
2. Go to Extensions → Apps Script
3. Run the `generateComplianceReports()` function
4. When prompted, enter a starting row number or press Cancel to use the saved position

### Functions

- **`generateComplianceReports()`**: Main function that processes reports
- **`resetProcessing()`**: Clears saved progress and resets to row 1

### Folder Structure

Reports are organized as follows:
```
Main Folder/
├── 2025/
│   ├── January/
│   │   ├── Week of 1/6/
│   │   │   ├── Monday 1/6/
│   │   │   │   ├── ASC/
│   │   │   │   │   └── LastName_F_ASC_Compliance Report
│   │   │   │   └── TAP/
│   │   │   │       └── LastName_F_TAP_Compliance Report
```

### File Naming Convention

Files are named using the pattern: `LastName_FirstInitial_Part_Compliance Report`

Example: `Smith_J_ASC_Compliance Report`

## Script Properties

The script uses Google Apps Script Properties Service to track progress:
- `currentRowIndex`: Stores the next row to process

## Execution Time Management

- The script monitors execution time and pauses before the 6-minute limit
- Progress is automatically saved when pausing
- Subsequent runs continue from where the previous run stopped

## Legacy Folder Migration

The script automatically handles two types of legacy structures:

1. **Flat date folders** (e.g., "4-10-2025")
2. **Previous nested structure** without Part-level folders

Files are moved to the new structure while preserving all data.

## Troubleshooting

### Common Issues

1. **"Sheet not found" error**: Ensure your sheet is named exactly "Upcoming Dates"
2. **Template errors**: Verify template IDs are correct and accessible
3. **Folder access issues**: Check that the script has permission to access the main folder
4. **Duplicate files**: The script skips existing files to prevent overwrites

### Logging

Check the Apps Script editor's Execution Log for detailed information about:
- Processing progress
- Skipped duplicates
- Error messages
- File movements during reorganization

## Performance Tips

1. **Batch Size**: Larger batches process more efficiently but risk timeout
2. **Starting Row**: Use manual starting row selection to reprocess specific ranges
3. **Regular Runs**: Schedule regular runs to process new data incrementally

## Security Notes

- Template IDs and folder IDs should be kept secure
- The script requires edit access to both the spreadsheet and Drive folders
- Consider restricting access to the Apps Script project

## Maintenance

- Regularly check execution logs for errors
- Monitor the folder structure for any irregularities
- Update template IDs when templates change
- Add new RC mappings as needed
