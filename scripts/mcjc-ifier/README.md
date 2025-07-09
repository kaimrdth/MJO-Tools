# MCJC-ifier

A Google Apps Script automation tool for the Manhattan Justice Opportunities (MJO) program to streamline case referrals to the Midtown Community Justice Center (MCJC).

## Overview

The MCJC-ifier automates the manual process of sorting cases, generating referral emails, and creating CSV reports when forwarding eligible cases to our partner organization, Midtown Community Justice Center. The tool processes case data based on predefined criteria and automatically categorizes cases into those that should be referred to MCJC versus those that remain with MJO.

## Workflow 

A resource coordinator will paste a table of cases to process. They click a button to run the MCJC-ifier which sends an email to them (it knows which email to use based on the user's Gmail account) containing:
1. Drafts of the emails we send to MCJC with case information 
2. An attached CSV of the cases we are sending to MCJC
3. An attached CSV of the cases we are keeping

What used to take 15 to 30 minutes of manually checking cases, sending emails, and creating tables now happens with a single click.

## Features

### Core Functionality (`MCJC-ifier.gs`)
- **Automated Case Sorting**: Processes spreadsheet data to identify cases meeting MCJC referral criteria
- **Email Generation**: Creates personalized referral emails with case details
- **CSV Report Generation**: Produces separate CSV files for MCJC referrals and MJO cases
- **Multi-criteria Evaluation**: Evaluates cases based on:
  - Arrest precinct (10, 13, 14, 17, 18, 20)
  - Specific charges (PL 220.03)
  - APY (Adolescent and Young Adult) eligibility
  - Weekend processing requirements

### Data Validation (`MainSheetChecker.gs`)
- **Duplicate Detection**: Cross-references cases against main database to prevent duplicate processing
- **Flexible Search Options**: 
  - Search all database tabs
  - Search specific monthly tabs
- **Comprehensive Logging**: Detailed console logging for troubleshooting and audit trails

## Setup Instructions

### Prerequisites
- Access to Google Sheets with the case data
- Google Apps Script editor permissions
- Email access for the configured user accounts

### Installation
1. Open your Google Sheet containing case data
2. Go to `Extensions > Apps Script`
3. Replace the default code with the provided scripts:
   - `MCJC-ifier.gs`
   - `MainSheetChecker.gs`
4. Update the `EXTERNAL_SHEET_ID` constant in `MainSheetChecker.gs` with your main database spreadsheet ID
5. Configure user email mappings in the `userMap` object within `MCJC-ifier.gs`

## Usage

### Processing Case Referrals
1. Open your case data spreadsheet
2. Run the `processSheet()` function from the Apps Script editor, or set up a custom menu/button
3. Enter the mandate date when prompted
4. The script will:
   - Analyze each case against referral criteria
   - Generate personalized emails for MCJC referrals
   - Create CSV attachments for both MCJC and MJO cases
   - Send email with attachments to the configured recipient

### Checking for Duplicates
1. Run the `findDocketMatches()` function
2. Choose search scope:
   - **All tabs**: Searches entire database
   - **Specific month**: Searches only specified month + MCJC Referrals tab
3. Results appear in Column K:
   - Sheet name if case found in database
   - "Missing" if case not found

### Utility Functions
- `clearResults()`: Clears Column K results
- `runFullProcess()`: Combines clear and lookup operations

## Data Structure

### Expected Input Format
The script expects case data with the following columns:
- Column A: Name
- Column B: Docket Number
- Column C: Arrest Precinct
- Column D: [Other data]
- Column E: Top Charge
- Column F: Number of Sessions
- Columns G-I: Attorney information
- Column J: APY Eligibility (Yes/No)

### Output Files
- **MCJC_Referrals.csv**: Cases meeting referral criteria
- **MJO_Referrals.csv**: Cases remaining with MJO

## Referral Criteria

Cases are referred to MCJC if they meet ANY of the following criteria:
- **Precinct-based**: Arrest occurred in precincts 10, 13, 14, 17, 18, or 20
- **Charge-based**: Top charge is PL 220.03
- **APY Eligibility**: Case involves adolescent/young adult participant
- **Weekend Processing**: Case processed on weekend (Saturday/Sunday)

## Configuration

### User Email Mapping
Update the `userMap` object in `MCJC-ifier.gs`:
```javascript
var userMap = {
  'user@organization.org': 'recipient@courts.gov',
  // Add additional mappings as needed
};
```

### Excluded Database Sheets
Modify the `EXCLUDED_SHEET_NAMES` array in `MainSheetChecker.gs` to skip specific tabs:
```javascript
const EXCLUDED_SHEET_NAMES = [
  'Alchemer Master Sheet - No edits allowed',
  'RC Calendar',
  'Salesforce_Engagements',
  'MCJC Data',
  'MCJC Referrals',
  'RESET'
];
```

## Error Handling

Both scripts include comprehensive error handling:
- Try-catch blocks for main operations
- Detailed logging for troubleshooting
- User-friendly error messages
- Graceful handling of missing data

## Logging and Monitoring

The scripts provide extensive logging through:
- `console.log()` for real-time debugging
- `Logger.log()` for persistent logging
- Progress indicators for long-running operations
- Execution summaries with timing and statistics

## Security Considerations

- Email addresses are mapped to prevent unauthorized access
- External spreadsheet access is controlled via specific Sheet IDs
- User permissions are validated through Google's authentication system

## Troubleshooting

### Common Issues
1. **"No data found"**: Ensure case data starts from row 3
2. **Email not sending**: Verify user email mapping and permissions
3. **External sheet access**: Confirm `EXTERNAL_SHEET_ID` is correct and accessible
4. **Slow performance**: Check database size and consider specific month searches

### Debug Information
Enable detailed logging by checking the Apps Script console and Logger outputs for execution traces and error messages.

## Maintenance

### Regular Tasks
- Update user email mappings as staff changes
- Review and update excluded sheet names
- Monitor execution logs for performance issues
- Validate referral criteria against current policies
