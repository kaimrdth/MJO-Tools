# 🏠 Home View
The **Home** view is the default landing screen for staff, designed as a central dashboard for daily office operations. It dynamically displays the current date and aggregates multiple subviews that reflect real-time information on participants, appointments, and internal workflows. It features integration with AcuityScheduling API to pull in real-time appointment information for our practitioners. It also triggers Slack webhooks when using the Sign In feature, so staff in office are notified when clients check in at the front desk.  

![Home View Screenshot](../images/home-view.png)

## Key Features
- **Real-time appointment calendar** with check-in capabilities
- **Quick action buttons** for common front desk tasks
- **Dynamic date display** that updates automatically
- **Integrated workflows** connecting appointments to participant logging
- **Slack notifications** for seamless team communication

This dashboard serves as the operational hub for daily client interactions, streamlining the check-in process and providing staff with immediate visibility into scheduled appointments and walk-ins.

---

## Technical Configuration

### 🧱 View Setup
- **Type**: Dashboard
- **Display Name Formula**:  
  ```appsheetscript
  CONCATENATE("Home | ", TEXT(NOW(), "ddd MMM D"))
  ```
- **Visibility Condition**:
  ```appsheetscript
  useremail() <> "mjo80conf@gmail.com"
  ```
  *This hides the Home view on the iPad used for inventory.*

### 🧩 Subview: Appointments
**View Type**: Calendar  
**Table**: `Appointments`

**View Options:**
| Setting        | Value               |
|----------------|---------------------|
| Start Date     | `Appointment Date`  |
| Start Time     | `Appointment Time`  |
| End Date       | `Appointment Date`  |
| End Time       | `endtime`           |
| Description    | `Type with Participant` |
| Category       | `Case Manager`      |
| Default View   | `Day`               |

### ⚡ Action: Check In
This **Quick Action** appears prominently in the Appointments calendar and creates a new row in the `Participant Log` table when staff mark someone as checked in.

| Attribute         | Value |
|------------------|-------|
| **Type**          | `Data: add a new row to another table` |
| **Target Table**  | `Participant Log` |
| **Set Columns**   | See below |
| **Position**      | `Prominent` |
| **Show If**       | `OR(CONTAINS([Case Manager], "In-Person"), CONTAINS([Appointment Type], "In-Person"))` |
| **Confirmation**  | `CONCATENATE("Check In ", [Participant], "?")` |

**Set Column Values:**
```text
Name         = [Participant]
Visit Reason = [Appointment Type]
CM           = [Full Case Manager]
Notes        = [Notes]
Walk In Date = today()
Check In     = timenow()
Status       = "Waiting Area"
```

### 🔄 Action: Sign In (Navigation)
This action enables quick navigation from the Appointments calendar to the **Sign In** form at the front desk. While the "Check In" button provides rapid appointment check-ins, this action routes to the full sign-in workflow for walk-ins and detailed participant logging.

| Attribute        | Value |
|-----------------|-------|
| **Action Name**  | `Sign In` |
| **Type**         | `App: go to another view within this app` |
| **Target**       | `LINKTOVIEW("Sign In")` |
| **Table**        | `Appointments` |
| **Position**     | `Primary` |
| **Display Name** | `"Sign In"` |

---

## 📎 Implementation Notes
- This dashboard is used live in office every day
- The Quick Check In action reduces friction by automatically logging arrivals with a timestamp and routing them to the "Waiting Area" flow
- The confirmation prompt helps prevent mis-clicks during rapid client check-ins
- The view dynamically updates throughout the day as new appointments are added or modified

### 🧠 Next Steps
- Drop your screenshots into `dashboard/home/images/` and rename them cleanly
- Add the next subview or feature from the Home dashboard when you're ready (e.g. Waiting Area)
- Document any additional actions or workflows specific to the Home view

---
*This documentation reflects the current state of the Home view as of the latest AppSheet configuration.*
