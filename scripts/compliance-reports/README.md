# Compliance Reports Suite

A comprehensive Google Apps Script automation suite for managing court compliance reporting workflows. This system streamlines the process of tracking court dates, generating compliance reports, and coordinating communications between Innovating Justice staff and court personnel.

## Overview

The Compliance Reports Suite automates the end-to-end workflow for managing court compliance requirements:

- **Data Synchronization**: Automatically pulls and updates court dates across multiple spreadsheets
- **Report Generation**: Creates formatted compliance reports in Google Docs with proper filing structure
- **Email Management**: Sends targeted email notifications to court staff organized by part
- **Progress Tracking**: Maintains processing state and batch management for large datasets

## Core Components

### 📊 **Data Management**
- Sync court dates between master sheets and working documents
- Pull upcoming court dates with intelligent filtering and deduplication
- Update main sheets with new court information while preserving historical data

### 📝 **Report Generation**
- Batch-process compliance reports with customizable templates
- Organize reports in nested folder structures (Year → Month → Week → Day → Part)
- Handle multiple Resource Coordinators with personalized templates
- Smart duplicate detection and progress tracking

### 📧 **Communications**
- Generate and send targeted emails to court staff by part
- Customize email content based on upcoming court dates
- Support for multiple user configurations and email routing

### 🛠️ **User Interface**
- Custom Google Sheets menu with intuitive tool access
- Built-in tool guide and help system
- Batch processing controls with progress management

## Quick Start

1. **Setup**: Configure sheet IDs and email mappings in the respective script files
2. **Menu Access**: Open your Google Sheet to access the "🛠️ Compliance Tools" menu
3. **Workflow**: Use the tools in sequence - pull dates, generate reports, send emails
4. **Monitoring**: Check logs and progress through the built-in tracking system

## File Structure

Each script file handles a specific aspect of the compliance workflow:
- `ComplianceCustomMenu.gs` - Main menu interface and navigation
- `PullUpcomingDates.gs` - Data synchronization and court date management
- `PushUpdatedDates.gs` - Bidirectional data updates
- `GenerateComplianceDrafts.gs` - Report generation and file organization
- `SendEmailDrafts.gs` - Email automation and communication
- `ToolGuide.gs` - User help and documentation system

## Key Features

✅ **Automated Workflow** - Reduces manual data entry and processing time  
✅ **Batch Processing** - Handles large datasets efficiently with progress tracking  
✅ **Smart Organization** - Maintains clean folder structures and prevents duplicates  
✅ **Multi-User Support** - Configurable for different staff members and roles  
✅ **Error Handling** - Robust logging and error recovery mechanisms  
✅ **Extensible Design** - Easy to modify for changing requirements  

## Usage Notes

- The system is designed to work with existing Google Sheets and Drive infrastructure
- All scripts include comprehensive logging for troubleshooting
- Batch processing prevents timeout issues with large datasets
- Email routing is configurable based on user authentication

---

*For detailed implementation instructions, see the individual README files in each script's subfolder.*
