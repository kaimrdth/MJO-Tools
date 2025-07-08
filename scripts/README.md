# Scripts

This folder contains Google Apps Script automation tools for managing court compliance workflows, case tracking, and administrative tasks. The scripts are organized into functional modules that handle different aspects of the court case management system.

## 📁 Folder Structure

### [compliance-reports/](./compliance-reports/)
**Court Date Management & Compliance Tracking**
- Automated pulling of upcoming court dates from source sheets
- Syncing updated court dates back to master sheets  
- Progress tracking and batch processing for large datasets
- Handles date validation, duplicate checking, and data organization

### [sheets-menu/](./sheets-menu/)
**Custom Google Sheets Interface**
- Custom menu system for easy access to compliance tools
- Tool guide and help documentation
- User-friendly interface for running automated functions

### [drafting-emails/](./drafting-emails/)
**Email Automation & Communication**
- Automated generation of compliance report emails grouped by court part
- Draft email creation with case details and attachments
- User mapping and email routing based on active user

### [report-generation/](./report-generation/)
**Document Creation & File Management**
- Batch generation of compliance reports from Google Doc templates
- Automated folder organization by date hierarchy (Year/Month/Week/Day/Part)
- Template processing with dynamic data replacement
- File naming conventions and duplicate handling

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
