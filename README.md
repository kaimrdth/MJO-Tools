# MJO-Tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/kaitagamimeredith/MJO-Tools?style=social)](https://github.com/kaitagamimeredith/MJO-Tools/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/kaitagamimeredith/MJO-Tools?style=social)](https://github.com/kaitagamimeredith/MJO-Tools/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/kaitagamimeredith/MJO-Tools)](https://github.com/kaitagamimeredith/MJO-Tools/issues)
[![Last Commit](https://img.shields.io/github/last-commit/kaitagamimeredith/MJO-Tools)](https://github.com/kaitagamimeredith/MJO-Tools/commits/main)

This is a curated archive of internal tools developed for Manhattan Justice Opportunities (MJO), a court-based alternative-to-incarceration program in New York City. The tools were built to reduce manual overhead, streamline daily office operations, and improve service delivery to justice-involved participants. I tried to write and structure this repo to support both internal handoff and live as a public-facing portfolio of low-code systems work.

## Structure


### [`scripts/`](./scripts/)
A comprehensive collection of Google Apps Script automations organized by function.

### [`dashboard/`](./dashboard/)
The MJO Dashboard: a centralized AppSheet web app used by 35+ staff members to coordinate daily operations and client care. Contains visual assets and configuration files for the main operational interface.


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
