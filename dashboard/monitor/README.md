# 📊 Monitor

The **Monitor** view is an operational health dashboard that tracks appointment availability and intake volume over time. It gives the team the context needed to make informed resourcing decisions, drawing on demand patterns, participant wait times, and referrals to ensure the office has what it needs to serve participants well.

![Monitor View Screenshot](../images/monitor.png)

## Purpose & Overview

The Monitor view brings together appointment availability and intake data to support the team in understanding demand trends and planning accordingly. 

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

### Next Available Appointments Table
A table listing the next 10 available appointments by type (intakes and assessments), including:
- **Average wait time** (in days) across available slots
- **Maximum wait time:** the longest a participant would wait for the next opening

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

Scheduling decisions at MJO sit at the intersection of several real-world factors: practitioner availability, participant access, and the expectations of referring court partners. Getting that balance right requires visibility rather than relying on a general sense of how busy things feel day-to-day.

---

## 📎 Implementation Notes

- Wait time data is pulled from AcuityScheduling via an Apps Script that crawls appointment availability by type; the script is scheduled to run on a regular cadence to keep the data current
- Intake and referral data is sourced from Salesforce and aggregated at the monthly level

---

