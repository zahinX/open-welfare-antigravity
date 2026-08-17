# Open Welfare — Product Requirements Document

> **Status:** Draft  
> **Version:** 0.1.0  
> **Last Updated:** 2026-08-06

---

## 1. Overview

Open Welfare is a centralized portal for mosques and local charities to manage their core operations. The platform serves three main user personas:
1. **Admins:** Charity managers who create campaigns, disburse aid to beneficiaries, and manage volunteer shifts.
2. **Public Donors:** Community members who browse active campaigns and make donations.
3. **Volunteers:** Community members who sign up for shifts and track their service history.

## 2. Public Campaigns (Donations)

### Description
A system to create and manage fundraising goals for specific causes (e.g., "Winter Blanket Drive", "Masjid Expansion").

### Functional Requirements
- **Admin:** Can create, edit, and close campaigns. Must set a Title, Description, Target Amount, and Deadline.
- **Admin:** Can manually log offline donations or link to online payments (future phase).
- **Public:** Can view a grid of active campaigns on the landing page.
- **Public:** Can view a detailed page for a campaign showing a progress bar (`Current Amount / Target Amount`), recent donations (if public), and campaign story.

## 3. Admin Beneficiary Logs

### Description
A secure, private CRM for tracking community members requiring assistance and logging aid disbursements.

### Functional Requirements
- **Admin Only:** Complete CRUD access to beneficiary profiles (Name, Contact, Address, Family Size, Assessment Notes).
- **Admin Only:** Can log a "Disbursement" against a beneficiary (e.g., "$500 from Zakat Fund", "Weekly Groceries").
- **Admin Only:** Can link a disbursement to a specific Campaign to track where funds went.
- **Security:** Strict RLS; public users and standard volunteers cannot view any beneficiary data.

## 4. Volunteer Shifts

### Description
A coordination tool for community service events, food banks, and clean-up drives.

### Functional Requirements
- **Admin:** Can create a "Shift" (Title, Date, Time, Location, Max Volunteers Needed, Task Description).
- **Public/Volunteer:** Can browse available upcoming shifts on a public `/volunteer` page.
- **Public/Volunteer:** Can sign up for a shift by providing Name, Email, and Phone.
- **Admin:** Can view a roster of signed-up volunteers for any given shift and mark attendance.
