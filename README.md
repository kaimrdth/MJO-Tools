# MJO-Tools

This is a curated archive of internal tools developed for Manhattan Justice Opportunities (MJO), a court-based alternative-to-incarceration program in New York City. The tools were built to reduce manual overhead, streamline daily office operations, and improve service delivery to justice-involved participants. I tried to write and structure this repo to support both internal handoff and live as a public-facing portfolio of low-code systems work.

## Structure

### [`dashboard/`](./dashboard/)
The MJO Dashboard: a centralized AppSheet web app used by 35+ staff members to coordinate daily operations and client care. Contains visual assets and configuration files for the main operational interface.

### [`scripts/`](./scripts/)
A comprehensive collection of Google Apps Script automations organized by function:


## Technical Stack

- **Frontend**: AppSheet (dashboard interface)
- **Backend**: Google Apps Script (automation and data processing)
- **Data Storage**: Google Sheets (primary data repository)
- **Integration**: Custom APIs and data transformation tools. Primarily [AcuityScheduling](https://developers.acuityscheduling.com/) and [Slack Webhooks](https://api.slack.com/messaging/webhooks).

## Usage

These tools are designed to work within the Google Workspace ecosystem and integrate seamlessly with existing MJO workflows. Each script folder contains specific functionality that can be deployed independently or as part of the broader system.

## LLM Context Dump

Interested in using an LLM to explore this repo? You can upload or paste the contents of `MJO-Full-Dump.txt` into your AI tool of choice. This file is a full-text dump of the repo’s documentation and scripts, accurate as of **July 10, 2025**.

It’s a great way to load everything into context for AI-powered summarization, search, refactoring, or just getting oriented quickly.


Want to generate a similar dump for your own project? Use this Bash command from your repo root:

```bash
find . -type f \( -name "*.md" -o -name "*.gs" -o -name "*.js" -o -name "*.ts" -o -name "*.json" \) \
-exec echo "### FILE: {}" \; -exec cat {} \; -exec echo -e "\n\n---\n\n" \; > Full-Dump.txt
```

This collects all Markdown, Apps Script, JS/TS, and JSON files, adds clear headers and separators, and outputs them into a single LLM-friendly text file.

## License

This project is licensed under the [MIT License](./LICENSE).

## Maintainer

Created by Kai Meredith.  
Feel free to reach out at kaimrdth@gmail.com with questions or transfer inquiries.
