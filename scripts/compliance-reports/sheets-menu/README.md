# 🛠️ Compliance Tools for Google Sheets

A comprehensive Google Apps Script solution for managing court dates and compliance reporting within Google Sheets.

## 📋 Overview

This tool suite provides an automated workflow for tracking court dates, generating compliance reports, and managing email communications. The system integrates directly into Google Sheets via a custom menu, making it easy for users to access all functionality without leaving their spreadsheet.

## 🚀 Features

### Custom Menu Integration
- **Seamless Access**: All tools are available through a custom "🛠️ Compliance Tools" menu in Google Sheets
- **Intuitive Interface**: Clear icons and descriptions for each function
- **Built-in Help**: Integrated tool guide accessible from the menu

### Core Functionality
- **📅 Date Management**: Automated syncing and pulling of court dates
- **📧 Email Generation**: Automated compliance report email creation and sending
- **📊 Report Generation**: Formatted report creation with Google Drive integration
- **🔗 Quick Navigation**: Direct access to report folders

## 📖 Menu Options

### ⬆️ Update Main Sheet Dates
**Function**: `updateMainSheetDates()`
- Synchronizes new court dates into the master tracking sheet
- Ensures all date information is current and accurate
- Prevents duplicate entries and maintains data integrity

### ⬇️ Pull Upcoming Dates
**Function**: `copyUpcomingCourtDates()`
- Retrieves the latest upcoming court dates from the source data tab
- Filters and organizes dates for easy review
- Updates the working dataset with relevant upcoming events

### 📩 Generate Emails
**Function**: `sendComplianceReports()`
- Creates and sends drafted compliance emails
- Processes emails by part/section for organized distribution
- Includes relevant court date information and compliance details

### 📝 Generate Reports
**Function**: `generateComplianceReports()`
- Produces formatted compliance reports
- Automatically saves reports to designated Google Drive folders
- Includes comprehensive date tracking and status information

### 📂 Jump to Reports
**Function**: `openThisWeekFolder()`
- Provides quick access to the current week's report folder
- Streamlines file organization and retrieval
- Maintains consistent folder structure

### 🧰 Tool Tips
**Function**: `showToolGuide()`
- Displays an interactive help dialog
- Provides quick reference for all available tools
- Includes usage descriptions and functionality overview

## 🔧 Installation

1. **Open Google Sheets** and create or open your compliance tracking spreadsheet
2. **Access Apps Script**:
   - Go to `Extensions` → `Apps Script`
3. **Add the Scripts**:
   - Create a new file called `ComplianceCustomMenu.gs`
   - Copy the custom menu code into this file
   - Create another file called `ToolGuide.gs`
   - Copy the tool guide code into this file
4. **Save and Authorize**:
   - Save both files
   - Run the `onOpen()` function to authorize permissions
5. **Refresh Your Sheet**:
   - Close and reopen your Google Sheet
   - The "🛠️ Compliance Tools" menu should now appear

## 💡 Usage

### First Time Setup
1. Open your Google Sheet
2. Look for the "🛠️ Compliance Tools" menu in the menu bar
3. Click "🧰 Tool Tips" to familiarize yourself with available functions

### Daily Workflow
1. **Morning**: Use "⬇️ Pull Upcoming Dates" to get the latest court schedule
2. **Data Entry**: Update any new information in your main sheet
3. **Sync**: Run "⬆️ Update Main Sheet Dates" to keep everything current
4. **Reporting**: Use "📝 Generate Reports" to create compliance documents
5. **Communication**: Use "📩 Generate Emails" to send out required notifications

### Quick Access
- Use "📂 Jump to Reports" to quickly navigate to your report folders
- Reference "🧰 Tool Tips" whenever you need a reminder of tool functions

## 📁 File Structure

```
Google Apps Script Project/
├── ComplianceCustomMenu.gs    # Main menu system
├── ToolGuide.gs              # Interactive help system
└── [Additional functions]     # Your other compliance functions
```

## 🔐 Permissions Required

This script requires the following Google Apps Script permissions:
- **Spreadsheet Access**: To read and write data
- **Drive Access**: To create and manage report folders
- **Gmail Access**: To send compliance emails
- **HTML Service**: To display the tool guide dialog

## 🛡️ Security Notes

- All functions run within your Google account's security context
- No external services are accessed without explicit permission
- Data remains within your Google Workspace environment
- Email sending requires your explicit authorization

## 🐛 Troubleshooting

### Menu Not Appearing
- Refresh your Google Sheet
- Check that the `onOpen()` function ran successfully
- Verify script permissions are properly granted

### Function Errors
- Ensure all required sheets and data ranges exist
- Check that column headers match expected formats
- Verify Google Drive folder structure is set up correctly

### Permission Issues
- Re-run the authorization process
- Check that your Google account has necessary permissions
- Ensure Apps Script is enabled for your Google Workspace

## 📞 Support

For technical issues or feature requests:
1. Check the "🧰 Tool Tips" guide first
2. Review your sheet structure and data format
3. Verify all required permissions are granted
4. Test functions individually to isolate issues

## 📋 Requirements

- Google Sheets with appropriate data structure
- Google Apps Script enabled
- Necessary Google Workspace permissions
- Properly configured Google Drive folder structure

## 🔄 Updates

To update the tools:
1. Access your Apps Script project
2. Update the relevant `.gs` files
3. Save changes
4. Refresh your Google Sheet to see updates

---

*This tool suite is designed to streamline compliance tracking and reporting workflows. For best results, ensure your data is properly structured and all required permissions are granted.*
