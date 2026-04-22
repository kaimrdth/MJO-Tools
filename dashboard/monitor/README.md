# 📊 Monitor

The **Monitor** view is an operational health dashboard that tracks appointment availability and intake volume over time. It gives leadership the context needed to make informed resourcing decisions, drawing on demand patterns, participant wait times, and referral throughput to ensure the office has what it needs to serve participants well.

![Monitor View Screenshot](../images/monitor.png)

## Purpose & Overview

The Monitor view brings together appointment availability and intake data to support leadership in understanding demand trends and planning accordingly. Rather than a reactive tool, it's designed for proactive decision-making, giving the office visibility into where resources are most needed so that participants get timely access to services and court partners stay appropriately informed.

---

## Modules

### Appointment Wait Times — Weekly
A chart showing weekly appointment wait times over time. Tracks how many days participants are waiting for their next available appointment, week by week, giving a granular view of how capacity fluctuates.

### Appointment Wait Times — Monthly
The same wait time data aggregated by month, providing a longer-range trend line. Useful for identifying whether conditions are improving, stable, or deteriorating over time.

### Referrals & Intakes Completed
A monthly chart showing:
- **Referrals received:** cases referred to MJO by courts and other partners
- **Intakes completed:** participants who have completed the intake process
- **Delta:** the gap between the two, surfacing whether intake throughput is keeping pace with incoming referrals

Tracking the delta over time helps leadership understand whether current capacity aligns with referral volume and whether additional resources or scheduling adjustments may be warranted.

### Next Available Appointments Table
A table listing the next 10 available appointments by type (intakes and assessments), including:
- **Average wait time** (in days) across available slots
- **Maximum wait time:** the longest a participant would wait for the next opening

This table gives staff and leadership an immediate answer to "how long is someone going to wait if they call today?"

---

## Data Sources

| Module | Source | Method |
|--------|--------|--------|
| Wait time charts | AcuityScheduling | Apps Script crawls available appointments by type via API |
| Next available appointments table | AcuityScheduling | Same Apps Script, surfaces top 10 results with avg/max calculations |
| Referrals & intakes | Salesforce | Aggregated intake and referral data pulled into the dashboard |

The Apps Script iterates through AcuityScheduling appointment types (intakes and assessments) to find the next available slot for each, then surfaces those results into the wait time charts and the next available table.

---

## Why This Matters

Scheduling decisions at MJO sit at the intersection of several real-world factors: practitioner availability, participant access, and the expectations of referring court partners. Getting that balance right requires visibility into demand rather than relying on a general sense of how busy things feel day-to-day.

Monitor provides the data infrastructure to make those conversations concrete. When leadership can point to trends in wait times or referral volume, resourcing discussions are grounded in evidence rather than intuition, making it easier to advocate for what the team actually needs.

---

## 📎 Implementation Notes

- Wait time data is pulled from AcuityScheduling via an Apps Script that crawls appointment availability by type; the script is scheduled to run on a regular cadence to keep the data current
- Intake and referral data is sourced from Salesforce and aggregated at the monthly level
- The next available appointments table is designed for quick operational reference; staff can check it at any time to give accurate wait time estimates to callers or walk-ins
- The referrals/intakes delta is useful for understanding how demand is trending relative to current capacity and for building the case for resourcing changes when needed

---

*This documentation reflects the current state of the Monitor view as of the latest AppSheet configuration.*
