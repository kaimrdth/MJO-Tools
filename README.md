# MJO-Tools

This is a curated archive of internal tools developed for Manhattan Justice Opportunities (MJO), a court-based alternative-to-incarceration program in New York City. The tools were built to reduce manual overhead, streamline daily court operations, and improve service delivery to justice-involved participants. This repo is structured to support both internal handoff and as a public-facing portfolio of low-code systems work.

## Structure

### [`dashboard/`](./dashboard/)
The MJO Dashboard: a centralized AppSheet web app used by 35+ staff members to coordinate daily operations and client care. Contains visual assets and configuration files for the main operational interface.

### [`scripts/`](./scripts/)
A comprehensive collection of Google Apps Script automations organized by function:

#### [`compliance-reports/`](./scripts/compliance-reports/)
- **[`sheets-menu/`](./scripts/compliance-reports/sheets-menu/)** - Custom menu system for Google Sheets
  - [`ToolGuide.gs`](./scripts/compliance-reports/sheets-menu/ToolGuide.gs) - User guidance and documentation
  - [`ComplianceCustomMenu.gs`](./scripts/compliance-reports/sheets-menu/ComplianceCustomMenu.gs) - Custom menu interface for compliance workflows
- **[`drafting-emails/`](./scripts/compliance-reports/drafting-emails/)** - Email automation tools
  - [`SendEmailDrafts.gs`](./scripts/compliance-reports/drafting-emails/SendEmailDrafts.gs) - Automated email draft generation and sending
- **[`tracking-dates/`](./scripts/compliance-reports/tracking-dates/)** - Date management and tracking systems
  - [`PullUpcomingDates.gs`](./scripts/compliance-reports/tracking-dates/PullUpcomingDates.gs) - Retrieves upcoming compliance dates
  - [`PushUpdatedDates.gs`](./scripts/compliance-reports/tracking-dates/PushUpdatedDates.gs) - Updates date tracking across systems
- **[`report-generation/`](./scripts/compliance-reports/report-generation/)** - Automated report creation
  - [`GenerateComplianceDrafts.gs`](./scripts/compliance-reports/report-generation/GenerateComplianceDrafts.gs) - Generates compliance report drafts
  - [`README.md`](./scripts/compliance-reports/report-generation/README.md) - Documentation for report generation processes

#### [`mcjc-ifier/`](./scripts/mcjc-ifier/)
Manhattan Community Justice Center integration tools
- [`MCJC-ifier.gs`](./scripts/mcjc-ifier/MCJC-ifier.gs) - Data transformation and formatting for MCJC systems
- [`MainSheetChecker.gs`](./scripts/mcjc-ifier/MainSheetChecker.gs) - Validation and quality control for main data sheets

#### [`group-calendar-generator/`](./scripts/group-calendar-generator/)
- [`Calendar-Generator.gs`](./scripts/group-calendar-generator/Calendar-Generator.gs) - Automated calendar creation for group programming and court dates

### [`media/`](./media/)
Demo videos, diagrams, and visual aids for understanding how the systems work.

## Key Features

- **Compliance Tracking**: Automated monitoring of participant compliance requirements with date tracking and notification systems
- **Report Generation**: Streamlined creation of compliance reports and court documentation
- **Email Automation**: Bulk email drafting and sending capabilities for case management
- **Calendar Management**: Automated generation of group programming and court calendars
- **Data Integration**: Tools for formatting and transferring data between MJO systems and external partners like MCJC
- **Quality Control**: Validation systems to ensure data accuracy across all platforms

## Technical Stack

- **Frontend**: AppSheet (dashboard interface)
- **Backend**: Google Apps Script (automation and data processing)
- **Data Storage**: Google Sheets (primary data repository)
- **Integration**: Custom APIs and data transformation tools. Primarily [AcuityScheduling](https://developers.acuityscheduling.com/) and [Slack Webhooks](https://api.slack.com/messaging/webhooks).

## Usage

These tools are designed to work within the Google Workspace ecosystem and integrate seamlessly with existing MJO workflows. Each script folder contains specific functionality that can be deployed independently or as part of the broader system.

## License

This project is licensed under the [MIT License](./LICENSE).

## Maintainer

Created by Kai Meredith.  
Feel free to reach out at kaimrdth@gmail.com with questions or transfer inquiries.
