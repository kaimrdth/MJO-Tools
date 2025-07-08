# MJO Compliance Reports Email Automation

A Google Apps Script tool that automatically sends compliance reports for upcoming court dates to designated recipients based on court parts.

## Overview

This script monitors a Google Sheets spreadsheet for upcoming court dates and automatically sends email notifications to appropriate court staff members. It groups cases by court part and sends consolidated emails for each part's compliance reports.

## Features

- **Automated Email Sending**: Sends compliance reports via Gmail
- **Date-Based Filtering**: Only processes cases with adjourn dates matching the next weekday
- **Part-Based Grouping**: Groups cases by court part and sends separate emails for each part
- **User Mapping**: Maps Gmail users to their corresponding court email addresses
- **Error Handling**: Comprehensive logging and error handling throughout the process
- **Weekend Skip Logic**: Automatically skips weekends when calculating next weekday

## Prerequisites

- Google Apps Script access
- Google Sheets with compliance data
- Gmail account with appropriate permissions
- Access to Google Workspace environment

## Setup

### 1. Spreadsheet Structure

Your Google Sheets spreadsheet must contain a sheet named **"Upcoming Dates"** with the following column structure:

| Column | Index | Description |
|--------|-------|-------------|
| A | 0 | (Not used in current version) |
| B | 1 | **Docket Number** |
| C | 2 | **Case Name** |
| D | 3 | (Not used in current version) |
| E | 4 | (Not used in current version) |
| F | 5 | (Not used in current version) |
| G | 6 | **Adjourn Date** |
| H | 7 | **Part** |

### 2. User Configuration

Update the `userMap` object in the script with your Gmail-to-court-email mappings:

```javascript
var userMap = {
  'your.gmail@innovatingjustice.org': 'your.email@nycourts.gov',
  'another.staff@innovatingjustice.org': 'another.staff@nycourts.gov',
  // Add more mappings as needed
};
```

### 3. Script Installation

1. Open Google Apps Script (script.google.com)
2. Create a new project
3. Replace the default code with the provided `sendComplianceReports()` function
4. Save the project with an appropriate name

### 4. Permissions

The script requires the following permissions:
- **Gmail**: To send emails
- **Google Sheets**: To read spreadsheet data
- **Google Drive**: To access the spreadsheet file

## Usage

### Manual Execution

1. Open your Google Apps Script project
2. Select the `sendComplianceReports` function
3. Click the "Run" button
4. Review the execution log for results

### Automated Execution (Recommended)

Set up a time-driven trigger to run the script automatically:

1. In Google Apps Script, go to **Triggers** (clock icon)
2. Click **"+ Add Trigger"**
3. Configure:
   - **Function**: `sendComplianceReports`
   - **Event Source**: Time-driven
   - **Type**: Day timer
   - **Time**: Choose appropriate time (e.g., 8:00 AM)
4. Save the trigger

## How It Works

1. **User Authentication**: Identifies the active Gmail user and maps to appropriate recipient
2. **Data Retrieval**: Reads the "Upcoming Dates" sheet from the active spreadsheet
3. **Date Filtering**: Filters cases where the adjourn date matches the next weekday
4. **Part Grouping**: Groups filtered cases by court part (removes "-W" suffix if present)
5. **Email Generation**: Creates separate emails for each part with case details
6. **Email Delivery**: Sends emails via Gmail with formatted subject lines and body content

## Email Format

### Subject Line
```
MJO Compliance [DATE]: Part [PART_NUMBER]
```

### Email Body
```
Good morning,

Please find the attached compliance reports for the following cases:

[CASE_NAME] ([DOCKET_NUMBER])
[CASE_NAME] ([DOCKET_NUMBER])
...

Best,
```

## Logging and Debugging

The script includes comprehensive logging accessible through Google Apps Script's execution log:

- ✅ Success messages for sent emails
- ❌ Error messages for failed operations
- 📩 Summary of processed parts
- 🚨 Unexpected error notifications

## Error Handling

The script handles various error scenarios:

- Missing or invalid recipient mappings
- Missing "Upcoming Dates" sheet
- Empty or invalid data
- Email sending failures
- Date parsing errors

## Customization Options

### Modifying Email Content

Update the email body template in the script:

```javascript
var emailBody = "Good morning,\n\nPlease find the attached compliance reports for the following cases:\n\n";
// Customize greeting, signature, or additional content
```

### Changing Date Logic

Modify the date calculation logic if needed:

```javascript
var nextWeekday = new Date(today);
nextWeekday.setDate(today.getDate() + 1); // Change +1 to different offset
```

### Adding Additional Data Fields

Include more case information in emails by referencing additional columns:

```javascript
emailBody += (r[2] || "Unknown Name") + " (" + (r[1] || "Unknown Docket") + ") - " + (r[8] || "Additional Info") + "\n";
```

## Security Considerations

- Keep user mappings updated and secure
- Regularly review script permissions
- Monitor execution logs for unusual activity
- Test thoroughly before deploying to production

## Support

For issues or questions:
1. Check the Google Apps Script execution log
2. Verify spreadsheet structure and data
3. Confirm user mappings are correct
4. Test with a single case first

## Version History

- **v1.0**: Initial release with basic email automation functionality
