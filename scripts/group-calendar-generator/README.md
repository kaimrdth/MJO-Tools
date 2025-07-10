# Acuity Calendar Generator

A Google Apps Script tool that automatically generates visual monthly calendars for group classes by fetching data from Acuity Scheduling and organizing it in Google Sheets.

## Features

- **Monthly Calendar Generation**: Creates formatted monthly calendars showing all group classes
- **Acuity Integration**: Fetches class data directly from Acuity Scheduling API
- **Multiple Group Support**: Handles multiple groups with different appointment types
- **Rich Formatting**: Color-coded classes, formatted time display, and availability tracking
- **Facilitator Display**: Shows assigned facilitators for each class
- **Easy Setup**: Simple menu-driven interface with API credential management

## Prerequisites

- Google Sheets access
- Acuity Scheduling account with API access
- Basic understanding of Google Apps Script (for initial setup)

## Installation

1. **Create a new Google Sheets document**
2. **Open Apps Script**:
   - Go to `Extensions` → `Apps Script`
3. **Replace the default code**:
   - Delete the existing `myFunction()` code
   - Paste the entire script from the provided file
4. **Save the project**:
   - Give it a name like "Acuity Calendar Generator"
   - Save the project (Ctrl+S or Cmd+S)

## Setup

### 1. Create the Group Lookup Table

In your Google Sheets document, create a sheet named **"Group Lookup Table"** with the following structure:

| Column A (Group Name) | Column B (Appointment Type ID) | Column C (Facilitator) |
|----------------------|-------------------------------|----------------------|
| Justice Circle       | 12345                         | John Smith           |
| Fresh Start          | 67890                         | Jane Doe             |
| Wellness Check-In    | 54321                         | Dr. Johnson          |

**To find your Appointment Type IDs:**
1. Log into your Acuity Scheduling account
2. Go to Business Settings → Appointment Types
3. Click on each appointment type to see its ID in the URL

### 2. Set Up API Credentials

1. **Get your Acuity API credentials**:
   - Go to your Acuity account settings
   - Navigate to Integrations → API
   - Note your User ID and generate an API Key

2. **Test API Connection**:
   - In Google Sheets, use the menu: `📅 Generate Group Calendars` → `Test API Connection`
   - Enter your User ID and API Key when prompted
   - The system will test the connection and save your credentials securely

## Usage

### Generating a Monthly Calendar
![Group Calendar Menu](../images/groupcalendarmenu.png)
1. **Open your Google Sheets document**
2. **Access the menu**: `📅 Generate Group Calendars` → `Generate Groups Calendar`
3. **Enter the month and year** (e.g., "July 2025", "December 2024")
4. **Confirm generation**
5. **Wait for processing** - the script will:
   - Fetch class data from Acuity
   - Create/update the calendar sheet
   - Format and color-code the results

### Calendar Features

Each calendar includes:
- **Day-by-day layout** with classes organized by date
- **Class information** for each session:
  - Class name
  - Time
  - Facilitator
  - Available slots (e.g., "5/10" meaning 5 available out of 10 total)
- **Color coding** by group type
- **Generation timestamp** for tracking when the calendar was created

## Configuration

### Customizing Colors

To change the colors for different groups, modify the `getClassColor()` function:

```javascript
function getClassColor(groupName) {
  var colorMap = {
    'Justice Circle': '#1f77b4',      // Blue
    'Fresh Start': '#ff7f0e',         // Orange
    'Wellness Check-In': '#2ca02c',   // Green
    'Resilience Builders': '#d62728', // Red
    'Pathways Group': '#9467bd'       // Purple
  };
  return colorMap[groupName] || '#000000';
}
```

### Adding New Groups

1. Add the new group to your "Group Lookup Table" sheet
2. Get the Appointment Type ID from Acuity
3. Add the facilitator name
4. Optionally add a color in the `getClassColor()` function

## Troubleshooting

### Common Issues

**"Group Lookup Table sheet not found"**
- Ensure you have a sheet named exactly "Group Lookup Table"
- Check that it contains the required columns (Group Name, Appointment Type ID, Facilitator)

**"API connection failed"**
- Verify your Acuity API credentials are correct
- Check that your API key hasn't expired
- Ensure your Acuity account has API access enabled

**"No classes found for this month"**
- Verify the month/year format (e.g., "July 2025")
- Check that classes are actually scheduled in Acuity for that month
- Ensure Appointment Type IDs are correct

**Script timeout errors**
- This can happen with large amounts of data
- Try generating calendars for individual months rather than multiple months at once

### Getting Help

1. **Check the execution log**:
   - In Apps Script, go to `Execution log` to see detailed error messages
2. **Test individual components**:
   - Use "Test API Connection" to verify your credentials
   - Check that your Group Lookup Table has the correct format
3. **Verify your Acuity setup**:
   - Ensure classes are published and visible in your Acuity calendar

## API Rate Limits

The script includes a 300ms delay between API calls to respect Acuity's rate limits. For accounts with many groups, calendar generation may take a few minutes.

## Security Notes

- API credentials are stored securely in Google Apps Script's PropertiesService
- Credentials are not visible in the spreadsheet or shared with other users
- Each user must set up their own API credentials

## Version History

- **v1.0**: Initial release with basic calendar generation
- **v1.1**: Added color coding and facilitator display
- **v1.2**: Improved error handling and user interface

