# Groups Fetcher

A Google Apps Script tool that pulls group class schedules and client rosters from Acuity Scheduling for the current and next month, then consolidates them into a single sorted sheet. Each row represents one client in one class session, with attendance counts and facilitator details included.

## Architecture

```mermaid
flowchart TD
    SP[Script Properties\nAPI_KEY]

    subgraph current["fetchAndWriteGroupAppointments()"]
        DR1[Date range\n1st → last of current month]
        CL1[fetchClassesForRangeMultiCalendar\nall unique calendars]
        AP1[fetchAppointmentsForRangeMultiCalendar\nall unique calendars]
        MAP1[Build classesMap\ndate|time|name key]
        ATT1[Attach clients\nto matching class]
        ROWS1[Flatten + sort rows]
    end

    subgraph next["fetchAndWriteGroupAppointmentsNextMonth()"]
        DR2[Date range\n1st → last of next month]
        CL2[fetchClassesForRangeMultiCalendar]
        AP2[fetchAppointmentsForRangeMultiCalendar]
        MAP2[Build classesMap]
        ATT2[Attach clients]
        ROWS2[Flatten + sort rows]
    end

    subgraph consolidate["consolidateGroupAppointments()"]
        MERGE[Read GroupAppointments\n+ GroupAppointmentsNextMonth]
        SORT[Sort combined rows\nby date + time]
    end

    SP -->|API key| current
    SP -->|API key| next

    DR1 --> CL1 & AP1 --> MAP1 --> ATT1 --> ROWS1 --> S1[GroupAppointments sheet]
    DR2 --> CL2 & AP2 --> MAP2 --> ATT2 --> ROWS2 --> S2[GroupAppointmentsNextMonth sheet]

    S1 & S2 --> MERGE --> SORT --> S3[AllGroupAppointments sheet]
```

## Features

- **Two-month coverage**: Separate functions for current month and next month, plus a consolidation function that merges both into one view
- **Multi-calendar support**: Deduplicates across a default calendar and per-appointment-type calendar overrides
- **Class + roster join**: Fetches class schedules (`/availability/classes`) and client bookings (`/appointments`) separately, then joins them on date/time/name
- **One row per client**: Each class session is expanded so every registered client appears on its own row alongside the total headcount
- **Empty class rows**: Classes with no bookings still appear with a count of 0 so gaps are visible

## Prerequisites

- Google Sheets access
- Acuity Scheduling account with API access
- `API_KEY` set in Script Properties

## Installation

1. **Open your Google Sheets document**
2. **Open Apps Script**:
   - Go to `Extensions` → `Apps Script`
3. **Add the scripts**:
   - Create two script files: `groups.js` and `consolidate.js`
   - Paste the respective file contents into each
4. **Save the project** (Ctrl+S or Cmd+S)

## Setup

### 1. Set the API Key

1. In the Apps Script editor, go to `Project Settings` → `Script Properties`
2. Add a property named `API_KEY` with your Acuity API key as the value

> The Acuity User ID (`acuityUserId = '25722431'`) is hardcoded in `groups.js`. Update it there if the account changes.

### 2. Update Calendar Mappings (if needed)

Certain appointment types use dedicated calendars instead of the default. These are configured in the `calendarMappings` object at the top of each fetch function in `groups.js`:

```javascript
const calendarMappings = {
  '77567367': '11998013',
  '23381332': '5601780',
  '33182300': '6818392',
  '30064732': '6460952',
  '77757462': '4286267'
};
const defaultCalendarId = '4795228';
```

Update these values if group calendars change in Acuity.

### 3. Add New Appointment Types (if needed)

Group appointment type IDs are listed in the `appointmentTypeIds` array in `groups.js`. Add new Acuity appointment type IDs to this array to include new group types in the fetch.

## Usage

### Running the Scripts

Run each function from the Apps Script editor by selecting it from the function dropdown and clicking **Run**:

| Function | What it does |
|----------|-------------|
| `fetchAndWriteGroupAppointments` | Fetches current month's classes + rosters → writes to **GroupAppointments** |
| `fetchAndWriteGroupAppointmentsNextMonth` | Fetches next month's classes + rosters → writes to **GroupAppointmentsNextMonth** |
| `consolidateGroupAppointments` | Merges both sheets → writes to **AllGroupAppointments** |

Run the two fetch functions before running consolidate.

### Output Sheet Structure

All three output sheets share the same column structure:

| Column | Description |
|--------|-------------|
| Date | Session date (`yyyy-MM-dd`, Eastern Time) |
| Time | Session time (`hh:mm AM/PM`, Eastern Time) |
| Group Name | Acuity appointment type name |
| # of People Signed Up | Total clients booked for that session |
| Facilitator | Assigned facilitator from Acuity class data |
| Client Name | Individual client name (one row per client; blank if no bookings) |

## Troubleshooting

### Common Issues

**`API_KEY` not set**
- Go to Apps Script → Project Settings → Script Properties and add the `API_KEY` property

**Classes appear but Client Name is blank for everyone**
- Confirm the appointment type IDs in `appointmentTypeIds` match the actual Acuity appointment type IDs
- The join between classes and appointments uses a `date|time|name` key — a mismatch in any field will result in no clients being attached

**A calendar's data is missing**
- Check the execution log for `Warning: Classes fetch failed` or `Warning: Appointments fetch failed` messages
- Verify that all calendar IDs in `calendarMappings` and `defaultCalendarId` are valid

**AllGroupAppointments is empty**
- Ensure `fetchAndWriteGroupAppointments` and `fetchAndWriteGroupAppointmentsNextMonth` have both been run first
- Confirm the sheets are named exactly `GroupAppointments` and `GroupAppointmentsNextMonth`

### Getting Help

1. **Check the execution log**: In Apps Script, open `Execution log` for detailed per-calendar API responses
2. **Verify appointment type IDs**: Log into Acuity → Business Settings → Appointment Types and confirm IDs match
3. **Verify calendar IDs**: Log into Acuity → Business Settings → Availability and confirm calendar IDs

## Security Notes

- The API key is stored in Script Properties and is not visible in the spreadsheet
- The Acuity User ID is hardcoded in `groups.js` — update it there if the account changes
- Credentials are scoped to the Apps Script project and not shared across documents
