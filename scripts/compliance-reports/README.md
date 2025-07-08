# Compliance Reports Suite

A comprehensive Google Apps Script automation suite for managing court compliance reporting workflows. This system streamlines the process of tracking court dates, generating compliance reports, and coordinating communications between Innovating Justice staff and court personnel.

## Overview

The Compliance Reports Suite automates the end-to-end workflow for managing court compliance requirements:

- **Data Synchronization**: Automatically pulls and updates court dates across multiple spreadsheets
- **Report Generation**: Creates formatted compliance reports in Google Docs with proper filing structure
- **Email Management**: Sends targeted email notifications to court staff organized by part
- **Progress Tracking**: Maintains processing state and batch management for large datasets

## Suite Components

### 🛠️ [`sheets-menu/`](./sheets-menu/)
Provides the custom Google Sheets interface with intuitive tool access and built-in help system.
- `ComplianceCustomMenu.gs` - Main menu interface and navigation
- `ToolGuide.gs` - User help and documentation system

### 📧 [`drafting-emails/`](./drafting-emails/)
Automates email generation and delivery to court staff, with targeting by court part and customizable content based on upcoming court dates.
- `SendEmailDrafts.gs` - Email automation and communication routing

### 📊 [`tracking-dates/`](./tracking-dates/)
Handles all court date synchronization and data management between master sheets and working documents. Includes intelligent filtering, deduplication, and bidirectional updates while preserving historical data.
- `PullUpcomingDates.gs` - Data synchronization and court date management
- `PushUpdatedDates.gs` - Bidirectional data updates

### 📝 [`report-generation/`](./report-generation/)
Manages the batch processing of compliance reports with customizable templates. Organizes reports in nested folder structures and handles multiple Resource Coordinators with smart duplicate detection and progress tracking.
- `GenerateComplianceDrafts.gs` - Report generation and file organization
- `README.md` - Detailed implementation guide

## Workflow Integration

The suite components work together in a typical workflow:

1. **Pull Dates** (`tracking-dates`) - Sync upcoming court dates from master sheets
2. **Generate Reports** (`report-generation`) - Create compliance documents in organized folders
3. **Send Emails** (`drafting-emails`) - Notify court staff with targeted communications
4. **Update Records** (`tracking-dates`) - Push any changes back to master sheets

All functions are accessible through the **Compliance Tools** menu (`sheets-menu`) integrated directly into your Google Sheets interface.

## Key Features

✅ **Automated Workflow** - Reduces manual data entry and processing time  
✅ **Batch Processing** - Handles large datasets efficiently with progress tracking  
✅ **Smart Organization** - Maintains clean folder structures and prevents duplicates  
✅ **Multi-User Support** - Configurable for different staff members and roles  
✅ **Error Handling** - Robust logging and error recovery mechanisms  
✅ **Extensible Design** - Easy to modify for changing requirements  

## Quick Start

1. **Setup**: Configure sheet IDs and email mappings in the respective component folders
2. **Menu Access**: Open your Google Sheet to access the "🛠️ Compliance Tools" menu
3. **Workflow**: Use the tools in sequence - pull dates, generate reports, send emails
4. **Monitoring**: Check logs and progress through the built-in tracking system

## Usage Notes

- The system is designed to work with existing Google Sheets and Drive infrastructure
- All scripts include comprehensive logging for troubleshooting
- Batch processing prevents timeout issues with large datasets
- Email routing is configurable based on user authentication

---

*For detailed implementation instructions and configuration options, see the individual README files in each component folder.*
