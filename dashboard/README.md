# 🧭 MJO Dashboard

This folder documents the full AppSheet-based **MJO Dashboard**, an internal tool built to support daily court operations at Manhattan Justice Opportunities.

The dashboard serves as a centralized platform for staff to manage client appointments, track participant flow, fulfill phone requests, access resources, and coordinate real-time tasks — all from a single interface.

---

## ⚙️ Platform Overview

- **Frontend**: AppSheet views and behavior logic
- **Backend**: Google Sheets (data tables and schemas)
- **Automation Layer**: AppSheet bots and custom Apps Script functions
- **Integrations**: Slack, AcuityScheduling, Inventory system

The documentation below is organized by feature. Each folder contains:
- View definitions and UX logic
- Table schemas and data relationships
- Conditional visibility rules, actions, and virtual columns
- Any relevant scripts or backend automation

---

## 📂 Feature Breakdown

| Feature            | Description                                                      |
|--------------------|------------------------------------------------------------------|
| [home](./home/)                  | Central dashboard aggregating key views and check-in tools         |
| [waiting-area](./waiting-area/)         | Manages active participant flow and in-office triage              |
| [participants](./participants/)         | Profile pages for each client, showing case details and status    |
| [resource-portal](./resource-portal/)   | Curated database of community resources and referral tools        |
| [supplies](./supplies/)               | Inventory of distributed items (e.g., MetroCards, hygiene kits)   |
| [phones](./phones/)                   | Phone request and fulfillment workflow, integrated with Slack     |
| [attorney-rolodex](./attorney-rolodex/)| Reference view of public defenders and attorneys                   |
| [donations](./donations/)             | Tracks received donations and inventory flow                      |
| [mjo-staff](./mjo-staff/)             | Staff list, permissions, and user-level customization              |
| [special-instructions](./special-instructions/)| Records participant-specific precautions or notes           |

---

## 🛠️ Shared Logic

See [`common/`](./common/) for reusable components:
- Slices, user roles, shared formatting rules, and app-level behaviors

---

## 📎 Notes

- For media and demos, see [`media/`](../media/)
- This dashboard is actively used by 35+ staff and supports services for over 3,000 participants annually.
- View-by-view documentation will continue to evolve as features are added or refactored.
