# Scripts

This folder contains Google Apps Script automation tools for managing court compliance workflows, case tracking, and administrative tasks. The scripts are organized into functional modules that handle different aspects of the court case management system.

## 📁 Folder Structure

### [compliance-reports/](./compliance-reports/)
**Court Date Management & Compliance Tracking**
- Automated pulling of upcoming court dates from source sheets
- Syncing updated court dates back to master sheets  
- Progress tracking and batch processing for large datasets
- Handles date validation, duplicate checking, and data organization

### [mcjc-ifier/](./mcjc-ifier/)
**Case Processing & Referral Management**
- Automated case categorization based on precinct, charges, and eligibility criteria
- CSV generation for MCJC and MJO referrals
- Email content generation for case referrals
- APY eligibility processing and weekend referral handling

### [group-calendar/](./group-calendar/)
**Calendar & Scheduling Integration**
- Integration with Acuity Scheduling API for class/group management
- Automated calendar generation with color-coded class types
- Monthly calendar layouts with facilitator assignments
- API credential management and connection testing

### [community-service-parser/](./community-service-parser/)
**Community Service Attendance Tracking**
- Processes iPad check-in/check-out form submissions from community service providers
- Unifies bilingual (English/Spanish) form columns and fuzzy-matches organization names
- Pairs sign-in/sign-out records by timestamp and calculates hours completed
- Writes clean per-organization tabs with real-time incremental trigger support
- In-sheet participant report dialog with hours summary and monthly breakdown

### [groups-fetcher/](./groups-fetcher/)
**Group Class Roster Fetching**
- Pulls group class schedules and client rosters from Acuity for current and next month
- Joins class availability data with individual bookings into a single row-per-client view
- Multi-calendar support with per-appointment-type calendar overrides
- Consolidates both months into a unified sorted sheet

### [appointments/](./appointments/)
**Staff Appointment Fetching**
- Pulls upcoming appointments from Acuity across all staff calendars
- Rolling ~6-week date window ending on a Friday, weekdays only
- Extracts client details, appointment types, and intake form notes
- Writes results to a structured Appointments sheet

### [wait-times/](./wait-times/)
**Appointment Wait Time Tracking**
- Checks Acuity availability across all calendars for each appointment type
- Batched + per-calendar fallback logic with a 100-day lookahead
- Writes current wait times to a live sheet and maintains a historical log
- Runs automatically on an hourly time-based trigger

## 🔧 Key Features

- **Data Synchronization**: Automated pulling and pushing of court dates between different Google Sheets
- **Batch Processing**: Handles large datasets with progress tracking and execution time management
- **File Organization**: Intelligent folder structures for document management
- **Email Automation**: Streamlined communication workflows for court compliance
- **Template Processing**: Dynamic document generation from standardized templates
- **API Integration**: External service connectivity for scheduling and calendar management

## 🚀 Getting Started

1. **Setup**: Each subfolder contains specific setup instructions and configuration requirements
2. **Authentication**: Some scripts require API credentials stored in Google Apps Script Properties
3. **Permissions**: Scripts require appropriate Google Workspace permissions for Sheets, Drive, and Gmail access
4. **Execution**: Most functions are accessible through custom menu systems in Google Sheets

## 📋 Prerequisites

- Google Apps Script environment
- Access to Google Sheets, Drive, and Gmail APIs
- Appropriate permissions for the target Google Workspace
- For calendar features: Acuity Scheduling API credentials

## 🔗 Related Documentation

Each subfolder contains its own README.md with detailed implementation notes, function descriptions, and usage examples.
