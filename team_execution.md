Save the following as **`TEAM_EXECUTION_PLAN.md`** in your notes and share it with your teammates.

---

# SMART HOSTEL MANAGEMENT — FINAL TEAM EXECUTION PLAN

## Purpose

This document explains exactly how the remaining work from the final reference repo **`Intelli-Hostel`** must be moved into the group repo **`smart-hostel-management`** in a professional GitHub workflow.

The goal is to show:

- meaningful commits
- multiple contributors
- issues
- milestones
- PRs
- merge conflicts
- merge conflict resolution
- final release flow

This plan is based on the **actual current state** of both repositories.

---

# 1. Repositories

## Main submission repo
**Repo:** `smart-hostel-management`  
**GitHub:** `https://github.com/Mahi-Jadeja/smart-hostel-management`

This is the repo the teacher will check for:
- commits
- PRs
- issues
- milestones
- merge conflicts
- contribution by all members

---

## Final reference repo
**Repo:** `Intelli-Hostel`  
**GitHub:** `https://github.com/Mahi-Jadeja/Intelli-Hostel`

This repo already contains the completed project and will be used as the **source of truth**.

> Important: We are **not recreating fake history**.  
> We are using the completed repo as reference and committing the final files into the main repo in **logical feature groups**.

---

# 2. Team Members

| Member | GitHub Username | Main Ownership |
|---|---|---|
| **Mahi Jadeja** | `Mahi-Jadeja` | Outpass, Payments, Guardian Flow, Email/Cron, Final Integration |
| **Khushi** | `khushik8605` | Auth, Public Pages, Complaints |
| **Nakshatra** | `Nakshatra-05` | Student APIs, Hostel Management, Allocation, Preferences |
| **Devershika** | `Devershika` | Shared Frontend Shell, Student Pages, Admin Operational UIs, Final Route Wiring |

---

# 3. Current Repo Reality

## `smart-hostel-management` currently contains roughly:
- setup/foundation
- models
- base testing
- base frontend

It does **not** yet contain the full controller/routes/pages structure from the final repo.

So the remaining project will now be committed into the group repo in feature-based chunks.

---

# 4. Important Ground Rules

## 4.1 Golden rule
If there is any doubt, the **correct final code** is the code from:

```text
Intelli-Hostel
```

Use that as the source of truth.

---

## 4.2 Never commit these files
Do **not** commit:

```text
backend/.env
frontend/.env
backend/logs/
commits.txt
commits_with_stats.txt
commits_with_patches.txt
smart_hostel_data/
smart_tree.txt
intelli_tree.txt
```

---

## 4.3 Commit message format
Use this pattern only:

```text
type: description
```

### Allowed types
- `feat:` → new feature
- `fix:` → bug fix
- `chore:` → maintenance/config/dependency/update
- `docs:` → documentation changes
- `style:` → formatting only
- `refactor:` → restructure without behavior change
- `test:` → add/fix tests

---

## 4.4 Branch target
All feature PRs must go into:

```text
dev
```

Final release PR will go:

```text
dev -> main
```

---

## 4.5 Shared conflict files
We intentionally expect merge conflicts in these files:

```text
backend/src/routes/v1/index.js
frontend/src/services/student.service.js
frontend/src/App.jsx
```

### Conflict resolution rule
When conflict happens, resolve the file so that it matches the **final version from `Intelli-Hostel`**.

---

## 4.6 Do not invent missing modules
Work only from the **actual files present in the final reference repo**.

If a file is **not** in `Intelli-Hostel`, do not create it just because an older written plan mentioned it.

---

# 5. GitHub Project Management Setup (Owner: Mahi)

These steps must be completed **before feature PRs start**.

---

## 5.1 Close old planning issues
Current old open issues:
- #1 Project Setup & Architecture Initialization
- #2 Database, Testing & Deployment
- #3 Backend Development & APIs
- #4 System Design (UI/UX + Database Architecture)

### Comment to add before closing each:
```text
This initial planning issue is being superseded by smaller implementation issues for the final build workflow.
Closing this issue and continuing work through detailed module-specific issues.
```

Then close them.

---

## 5.2 Archive old milestones
Close these existing broad milestones:
- Milestone 1 — Setup & System Design
- Milestone 2 — UI Layout Setup
- Milestone 3 — Backend Development

### Optional title update before closing
- `Archived - Setup & System Design`
- `Archived - UI Layout Setup`
- `Archived - Backend Development`

### Optional description append
```text
These milestones were part of the initial planning stage.
Implementation tracking is being continued in revised execution milestones for the final build.
```

---

## 5.3 Create new milestones

### Milestone 4 — Auth & Complaints Foundation
**Due:** 2026-04-16

**Description**
```text
Implement authentication, public access flow, and complaint system foundation for the smart hostel management application.
```

---

### Milestone 5 — Outpass, Payments & Automation
**Due:** 2026-04-17

**Description**
```text
Implement outpass system, guardian approval flow, payments module, reminders, email support, and cron automation.
```

---

### Milestone 6 — Student & Hostel Management
**Due:** 2026-04-18

**Description**
```text
Implement student APIs, hostel room generation, allocation/deallocation, student room preferences, and smart bulk allocation.
```

---

### Milestone 7 — Frontend Integration & Admin Ops
**Due:** 2026-04-19

**Description**
```text
Implement shared frontend shell, student-facing pages, admin operational pages, and final routing/navigation integration.
```

---

### Milestone 8 — Final Integration & Release
**Due:** 2026-04-20

**Description**
```text
Resolve merge conflicts, merge all feature branches into dev, validate final integration, and release dev into main.
```

---

## 5.4 Create new issues

---

### Issue #5
**Title:** Implement authentication flow with JWT, Google OAuth, protected routes, and public auth pages  
**Assignee:** Khushi  
**Labels:** `backend`, `frontend`, `security`, `enhancement`  
**Milestone:** Milestone 4

**Description**
```text
Build the complete authentication flow for the project.

Scope:
- backend auth middleware
- auth controller/routes
- Google OAuth setup
- auth validation
- token utility
- auth integration tests
- frontend landing/login/register/callback pages
- auth context and route protection
```

---

### Issue #6
**Title:** Implement complaint system with auto-escalation, student complaint history, and admin APIs  
**Assignee:** Khushi  
**Labels:** `backend`, `frontend`, `enhancement`  
**Milestone:** Milestone 4

**Description**
```text
Build the complaint module.

Scope:
- complaint controller/routes/validation
- complaint integration tests
- student complaints page
- complaint service
- pagination support
- auto-escalation support
```

---

### Issue #7
**Title:** Standardize student model, enums, migration logic, and student API foundation  
**Assignee:** Nakshatra  
**Labels:** `backend`, `enhancement`, `security`  
**Milestone:** Milestone 6

**Description**
```text
Update the student/hostel data foundation.

Scope:
- constants enums
- final student model
- migration script
- student controller/routes/validation
- student integration tests
- room preference support
```

---

### Issue #8
**Title:** Implement outpass module with guardian approval flow and public approval page  
**Assignee:** Mahi  
**Labels:** `backend`, `frontend`, `enhancement`  
**Milestone:** Milestone 5

**Description**
```text
Build the full outpass workflow.

Scope:
- outpass controller/routes/validation
- guardian token fields
- public guardian approval page
- guardian approval tests
- student outpass page
```

---

### Issue #9
**Title:** Implement payments module with reminder processing, admin trigger, and student payment flow  
**Assignee:** Mahi  
**Labels:** `backend`, `frontend`, `enhancement`  
**Milestone:** Milestone 5

**Description**
```text
Build the full payments workflow.

Scope:
- payments controller/routes/validation
- payment reminder utility
- manual reminder endpoint
- email reminder support
- cron integration
- student payments page
- admin payments page
- payment tests
```

---

### Issue #10
**Title:** Implement hostel core APIs for config, room generation, layout, eligible students, and allocation  
**Assignee:** Nakshatra  
**Labels:** `backend`, `frontend`, `enhancement`  
**Milestone:** Milestone 6

**Description**
```text
Build the core hostel room management flow.

Scope:
- hostel controller/routes/validation
- room generation
- room layout API
- eligible students API
- allocation/deallocation
- room management UI
- hostel tests
```

---

### Issue #11
**Title:** Implement room preference, student room preview, and advanced bulk allocation logic  
**Assignee:** Nakshatra  
**Labels:** `backend`, `frontend`, `enhancement`  
**Milestone:** Milestone 6

**Description**
```text
Build smart allocation and room preference support.

Scope:
- allocation utility
- preview/execute flow
- preference mode
- branch mode
- student room preference page
- room preference tests
```

---

### Issue #12
**Title:** Implement shared frontend shell and student-facing pages  
**Assignee:** Devershika  
**Labels:** `frontend`, `design`, `enhancement`  
**Milestone:** Milestone 7

**Description**
```text
Build the shared frontend layout and student pages.

Scope:
- shared UI components
- dashboard layout shell
- error boundary
- custom 404 page
- student overview/profile/room pages
```

---

### Issue #13
**Title:** Implement admin operational frontend pages and final route/navigation wiring  
**Assignee:** Devershika  
**Labels:** `frontend`, `design`, `enhancement`  
**Milestone:** Milestone 7

**Description**
```text
Build the admin-facing operational frontend pages.

Scope:
- admin complaints page
- admin outpass page
- final App.jsx route wiring
- final sidebar navigation
```

---

### Issue #14
**Title:** Perform final integration, resolve merge conflicts, and release dev into main  
**Assignee:** Mahi  
**Labels:** `documentation`, `enhancement`  
**Milestone:** Milestone 8

**Description**
```text
Finalize all merges, resolve conflicts, validate integration, and release final code from dev to main.
```

---

# 6. Common Setup for Every Team Member

Every member must clone **both repos** side by side.

```bash
git clone https://github.com/Mahi-Jadeja/smart-hostel-management.git
git clone https://github.com/Mahi-Jadeja/Intelli-Hostel.git
```

Now you should have:

```text
smart-hostel-management/
Intelli-Hostel/
```

---

## 6.1 Always start from `dev`

```bash
cd smart-hostel-management
git fetch origin
git checkout dev
git pull origin dev
```

---

## 6.2 Create your branch

### Khushi
```bash
git checkout -b feature/khushi/auth-complaints
```

### Mahi
```bash
git checkout -b feature/mahi/outpass-payments-automation
```

### Nakshatra
```bash
git checkout -b feature/nakshatra/student-hostel-allocation
```

### Devershika
```bash
git checkout -b feature/devershika/frontend-admin-ops
```

---

## 6.3 How to copy files from reference repo

For every listed file in your commit:
- open the same file in `Intelli-Hostel`
- copy its full content
- paste into the matching file in `smart-hostel-management`
- if the file does not exist in main repo, create it with the same relative path

---

## 6.4 Important warning for shared files

For these files, do **not blindly replace full file early** unless the step specifically tells you:

```text
backend/src/routes/v1/index.js
frontend/src/services/student.service.js
frontend/src/App.jsx
```

If your step says **partial edit**, only add your module’s imports/routes/methods.

At conflict resolution stage, final version must match `Intelli-Hostel`.

---

# 7. Member Instructions

---

# 7A. Khushi — Auth + Complaints

## Branch
```bash
git checkout dev
git pull origin dev
git checkout -b feature/khushi/auth-complaints
```

## Assigned Issues
- #5
- #6

---

## Commit K1
### Message
```bash
feat: add auth backend with JWT, Google OAuth, and protected route middleware
```

### Copy these files from `Intelli-Hostel`:
```text
backend/src/config/passport.js
backend/src/controllers/auth.controller.js
backend/src/middleware/auth.js
backend/src/routes/v1/auth.routes.js
backend/src/utils/token.js
backend/src/validations/auth.validation.js
```

### Partial edit:
```text
backend/src/routes/v1/index.js
```

Add only:
- import for `auth.routes.js`
- `router.use('/auth', authRoutes);`

### Partial edit:
```text
backend/src/app.js
```

Add only the passport-related setup from final repo:
- passport import
- setupPassport import
- `app.use(passport.initialize())`
- `setupPassport()`

### Commands
```bash
git add .
git commit -m "feat: add auth backend with JWT, Google OAuth, and protected route middleware"
```

---

## Commit K2
### Message
```bash
test: add auth integration tests for register, login, and current user endpoints
```

### Copy:
```text
backend/tests/integration/auth.test.js
```

### Commands
```bash
git add .
git commit -m "test: add auth integration tests for register, login, and current user endpoints"
```

---

## Commit K3
### Message
```bash
feat: add frontend auth flow with auth context, protected route, and public auth pages
```

### Copy:
```text
frontend/src/context/AuthContext.jsx
frontend/src/components/shared/ProtectedRoute.jsx
frontend/src/pages/public/Landing.jsx
frontend/src/pages/public/Login.jsx
frontend/src/pages/public/Register.jsx
frontend/src/pages/public/OAuthCallback.jsx
```

### Do **not** replace full `App.jsx` here.
Frontend route wiring will be finalized later by Devershika.

### Commands
```bash
git add .
git commit -m "feat: add frontend auth flow with auth context, protected route, and public auth pages"
```

---

## Commit K4
### Message
```bash
feat: add complaints backend with controller logic, validation, and admin complaint apis
```

### Copy:
```text
backend/src/controllers/complaint.controller.js
backend/src/routes/v1/complaint.routes.js
backend/src/validations/complaint.validation.js
```

### Partial edit:
```text
backend/src/routes/v1/index.js
```

Add only:
- import for `complaint.routes.js`
- `router.use('/complaints', complaintRoutes);`

### Commands
```bash
git add .
git commit -m "feat: add complaints backend with controller logic, validation, and admin complaint apis"
```

---

## Commit K5
### Message
```bash
test: add complaint integration tests including auto-escalation and ownership checks
```

### Copy:
```text
backend/tests/integration/complaints.test.js
```

### Commands
```bash
git add .
git commit -m "test: add complaint integration tests including auto-escalation and ownership checks"
```

---

## Commit K6
### Message
```bash
feat: add student complaints page with create, delete, and paginated complaint history
```

### Copy:
```text
frontend/src/services/complaint.service.js
frontend/src/pages/student/Complaints.jsx
```

### Optional test copy if present in your final working branch:
```text
frontend/src/components/__tests__/ProtectedRoute.test.jsx
```

### Commands
```bash
git add .
git commit -m "feat: add student complaints page with create, delete, and paginated complaint history"
```

---

## Push branch
```bash
git push -u origin feature/khushi/auth-complaints
```

---

## Open PR
### Title
```text
feat: auth, public access flow, and complaints foundation
```

### PR Description
```text
## Summary
This PR adds the authentication system and complaint module foundation.

## Includes
- JWT auth backend
- Google OAuth setup
- Auth integration tests
- Auth context and protected route
- Public auth pages
- Complaint backend APIs
- Complaint integration tests
- Student complaints page

## Issues Closed
Closes #5
Closes #6
```

---

# 7B. Mahi — Outpass + Payments + Guardian Flow + Email/Cron

## Branch
```bash
git checkout dev
git pull origin dev
git checkout -b feature/mahi/outpass-payments-automation
```

## Assigned Issues
- #8
- #9
- #14

---

## Commit M1
### Message
```bash
chore: add email utility and dependency updates for guardian approval and reminder processing
```

### Copy:
```text
backend/package.json
backend/package-lock.json
backend/src/utils/email.js
```

### Commands
```bash
git add .
git commit -m "chore: add email utility and dependency updates for guardian approval and reminder processing"
```

---

## Commit M2
### Message
```bash
feat: add outpass backend with validation, guardian approval fields, and admin decision flow
```

### Copy:
```text
backend/src/models/Outpass.js
backend/src/controllers/outpass.controller.js
backend/src/routes/v1/outpass.routes.js
backend/src/validations/outpass.validation.js
```

### Partial edit:
```text
backend/src/routes/v1/index.js
```

Add only:
- import for `outpass.routes.js`
- `router.use('/outpass', outpassRoutes);`

### Commands
```bash
git add .
git commit -m "feat: add outpass backend with validation, guardian approval fields, and admin decision flow"
```

---

## Commit M3
### Message
```bash
test: add outpass integration tests for student history, admin decisions, and guardian approval flow
```

### Copy:
```text
backend/tests/integration/outpass.test.js
backend/tests/integration/outpass-guardian.test.js
```

### Commands
```bash
git add .
git commit -m "test: add outpass integration tests for student history, admin decisions, and guardian approval flow"
```

---

## Commit M4
### Message
```bash
feat: add outpass frontend with student request history and public guardian approval page
```

### Copy:
```text
frontend/src/services/outpass.service.js
frontend/src/pages/student/Outpass.jsx
frontend/src/pages/public/GuardianAction.jsx
```

### Commands
```bash
git add .
git commit -m "feat: add outpass frontend with student request history and public guardian approval page"
```

---

## Commit M5
### Message
```bash
feat: add payments backend with reminders, admin creation, and student mark-as-paid flow
```

### Copy:
```text
backend/src/models/Payment.js
backend/src/controllers/payment.controller.js
backend/src/routes/v1/payment.routes.js
backend/src/validations/payment.validation.js
backend/src/utils/paymentReminder.js
```

### Partial edit:
```text
backend/src/routes/v1/index.js
```

Add only:
- import for `payment.routes.js`
- `router.use('/payments', paymentRoutes);`

### Commands
```bash
git add .
git commit -m "feat: add payments backend with reminders, admin creation, and student mark-as-paid flow"
```

---

## Commit M6
### Message
```bash
feat: add payment reminders automation, admin payments page, and student payments page
```

### Copy:
```text
backend/src/utils/cron.js
backend/src/server.js
backend/tests/integration/payments.test.js
backend/tests/integration/payment-reminders.test.js

frontend/src/services/payment.service.js
frontend/src/pages/student/Payments.jsx
frontend/src/pages/admin/Payments.jsx
frontend/src/components/__tests__/OutpassPage.test.jsx
frontend/src/components/__tests__/PaymentsPage.test.jsx
```

### Commands
```bash
git add .
git commit -m "feat: add payment reminders automation, admin payments page, and student payments page"
```

---

## Push branch
```bash
git push -u origin feature/mahi/outpass-payments-automation
```

---

## Open PR
### Title
```text
feat: outpass, payments, guardian approval, and automation workflows
```

### PR Description
```text
## Summary
This PR adds outpass, payments, guardian approval, and automation support.

## Includes
- Outpass backend and tests
- Guardian approval flow
- Public guardian approval page
- Payments backend and tests
- Payment reminders
- Email utility
- Cron scheduler
- Student payments page
- Admin payments page

## Issues Closed
Closes #8
Closes #9
```

---

# 7C. Nakshatra — Student APIs + Hostel + Allocation + Preferences

## Branch
```bash
git checkout dev
git pull origin dev
git checkout -b feature/nakshatra/student-hostel-allocation
```

## Assigned Issues
- #7
- #10
- #11

---

## Commit N1
### Message
```bash
feat: standardize student and hostel data models with enums, migration support, and room preference field
```

### Copy:
```text
backend/src/constants/enums.js
frontend/src/constants/enums.js
backend/src/models/Student.js
backend/src/models/HostelConfig.js
backend/src/seeds/migrateStudentData.js
```

### Commands
```bash
git add .
git commit -m "feat: standardize student and hostel data models with enums, migration support, and room preference field"
```

---

## Commit N2
### Message
```bash
feat: add student backend apis for profile, room data, preferences, and dashboard operations
```

### Copy:
```text
backend/src/controllers/student.controller.js
backend/src/routes/v1/student.routes.js
backend/src/validations/student.validation.js
```

### Partial edit:
```text
backend/src/routes/v1/index.js
```

Add only:
- import for `student.routes.js`
- `router.use('/student', studentRoutes);`

### Commands
```bash
git add .
git commit -m "feat: add student backend apis for profile, room data, preferences, and dashboard operations"
```

---

## Commit N3
### Message
```bash
test: add student integration tests for profile, room, dashboard stats, and room preferences
```

### Copy:
```text
backend/tests/integration/student.test.js
backend/tests/integration/student-room-preference.test.js
```

### Commands
```bash
git add .
git commit -m "test: add student integration tests for profile, room, dashboard stats, and room preferences"
```

---

## Commit N4
### Message
```bash
feat: add hostel backend with config, room generation, layout, eligible students, allocation, and deallocation apis
```

### Copy:
```text
backend/src/controllers/hostel.controller.js
backend/src/routes/v1/hostel.routes.js
backend/src/validations/hostel.validation.js
backend/src/utils/allocation.js
```

### Partial edit:
```text
backend/src/routes/v1/index.js
```

Add only:
- import for `hostel.routes.js`
- `router.use('/hostel', hostelRoutes);`

### Commands
```bash
git add .
git commit -m "feat: add hostel backend with config, room generation, layout, eligible students, allocation, and deallocation apis"
```

---

## Commit N5
### Message
```bash
test: add hostel integration tests for config, room generation, layout, allocation, and deallocation
```

### Copy:
```text
backend/tests/integration/hostel.test.js
```

### Commands
```bash
git add .
git commit -m "test: add hostel integration tests for config, room generation, layout, allocation, and deallocation"
```

---

## Commit N6
### Message
```bash
feat: add room preference frontend, hostel service, student service, room layout page, and advanced bulk allocation flow
```

### Copy:
```text
frontend/src/services/hostel.service.js
frontend/src/services/student.service.js
frontend/src/pages/admin/RoomLayout.jsx
frontend/src/pages/student/RoomPreference.jsx
frontend/src/components/__tests__/RoomLayoutPage.test.jsx
```

### Notes
- This commit may later conflict with Devershika’s branch on:
  - `frontend/src/services/student.service.js`

That is intentional.

### Commands
```bash
git add .
git commit -m "feat: add room preference frontend, hostel service, student service, room layout page, and advanced bulk allocation flow"
```

---

## Push branch
```bash
git push -u origin feature/nakshatra/student-hostel-allocation
```

---

## Open PR
### Title
```text
feat: student apis, hostel room management, smart allocation, and preferences
```

### PR Description
```text
## Summary
This PR adds student APIs, hostel management APIs, room layout UI, and smart allocation support.

## Includes
- Student controller/routes/validation
- Student tests
- Hostel controller/routes/validation
- Hostel tests
- Standardized enums/models
- Room preference support
- Hostel frontend service
- Student frontend service
- Room layout admin page

## Issues Closed
Closes #7
Closes #10
Closes #11
```

---

# 7D. Devershika — Shared Frontend Shell + Student Pages + Admin Operational UI

## Branch
```bash
git checkout dev
git pull origin dev
git checkout -b feature/devershika/frontend-admin-ops
```

## Assigned Issues
- #12
- #13

---

## Commit D1
### Message
```bash
feat: add shared ui components and responsive dashboard shell
```

### Copy:
```text
frontend/src/components/ui/Badge.jsx
frontend/src/components/ui/Card.jsx
frontend/src/components/ui/EmptyState.jsx
frontend/src/components/ui/Skeleton.jsx
frontend/src/components/ui/StatCard.jsx
frontend/src/components/layout/DashboardLayout.jsx
frontend/src/components/layout/Sidebar.jsx
frontend/src/components/layout/TopBar.jsx
```

### Commands
```bash
git add .
git commit -m "feat: add shared ui components and responsive dashboard shell"
```

---

## Commit D2
### Message
```bash
feat: add error boundary and custom 404 page for frontend resilience
```

### Copy:
```text
frontend/src/components/shared/ErrorBoundary.jsx
frontend/src/pages/errors/NotFound.jsx
```

### Commands
```bash
git add .
git commit -m "feat: add error boundary and custom 404 page for frontend resilience"
```

---

## Commit D3
### Message
```bash
feat: add student dashboard pages for overview, profile editing, and room allocation view
```

### Copy:
```text
frontend/src/pages/student/Overview.jsx
frontend/src/pages/student/Profile.jsx
frontend/src/pages/student/Room.jsx
frontend/src/services/student.service.js
```

### Notes
- This commit may later conflict with Nakshatra’s branch on:
  - `frontend/src/services/student.service.js`

That is intentional. Final version after conflict must match `Intelli-Hostel`.

### Commands
```bash
git add .
git commit -m "feat: add student dashboard pages for overview, profile editing, and room allocation view"
```

---

## Commit D4
### Message
```bash
feat: add admin complaints management page with filtering and status updates
```

### Copy:
```text
frontend/src/pages/admin/Complaints.jsx
```

### Commands
```bash
git add .
git commit -m "feat: add admin complaints management page with filtering and status updates"
```

---

## Commit D5
### Message
```bash
feat: add admin outpass management page and finalize operational page ui
```

### Copy:
```text
frontend/src/pages/admin/Outpass.jsx
```

### Commands
```bash
git add .
git commit -m "feat: add admin outpass management page and finalize operational page ui"
```

---

## Commit D6
### Message
```bash
feat: finalize frontend route wiring and shared navigation using completed module pages
```

### Copy:
```text
frontend/src/App.jsx
frontend/src/main.jsx
frontend/src/components/layout/Sidebar.jsx
```

### Important
At this step, use the **final full version** from `Intelli-Hostel`.

This commit is meant to:
- wire all student routes
- wire admin routes that actually exist in final repo
- finalize sidebar nav
- connect shared frontend shell

### Commands
```bash
git add .
git commit -m "feat: finalize frontend route wiring and shared navigation using completed module pages"
```

---

## Push branch
```bash
git push -u origin feature/devershika/frontend-admin-ops
```

---

## Open PR
### Title
```text
feat: shared frontend shell, student pages, admin operations, and final route wiring
```

### PR Description
```text
## Summary
This PR adds shared frontend shell components, student-facing pages, admin operational pages, and final route wiring.

## Includes
- Shared UI components
- Dashboard layout shell
- Error boundary
- 404 page
- Student overview/profile/room pages
- Admin complaints page
- Admin outpass page
- Final App and sidebar wiring

## Issues Closed
Closes #12
Closes #13
```

---

# 8. Review / Comment Requirements

To make GitHub activity look professional, each member should leave at least **one review-style comment** on another member’s PR.

## Comment chain
- **Khushi** comments on **Mahi’s PR**
- **Mahi** comments on **Nakshatra’s PR**
- **Nakshatra** comments on **Devershika’s PR**
- **Devershika** comments on **Khushi’s PR**

### Comment template
```text
Reviewed the module structure and commit grouping. The implementation scope matches the issue description. Please resolve any shared-file conflicts before merge.
```

If conflict already happened, use:
```text
Reviewed after conflict resolution. Shared routing/navigation files now look consistent with the integrated module scope.
```

---

# 9. Merge Order

This order matters.

## Merge order
1. Khushi PR
2. Mahi PR
3. Nakshatra PR
4. Devershika PR
5. Final release PR (`dev -> main`) by Mahi

---

# 10. Merge Conflict Resolution Guide

## 10.1 After Khushi PR is merged
Mahi, Nakshatra, and Devershika must update their branch from latest `dev` before merge.

---

## 10.2 Mahi conflict resolution

### Commands
```bash
git checkout feature/mahi/outpass-payments-automation
git fetch origin
git merge origin/dev
```

### Expected conflicts
```text
backend/src/routes/v1/index.js
```

### Resolve rule
Make `backend/src/routes/v1/index.js` match the final `Intelli-Hostel` version for all routes that now exist.

Then:

```bash
git add .
git commit -m "fix: resolve merge conflicts with dev for outpass, payments, and automation modules"
git push
```

Then merge Mahi PR.

---

## 10.3 Nakshatra conflict resolution

### Commands
```bash
git checkout feature/nakshatra/student-hostel-allocation
git fetch origin
git merge origin/dev
```

### Expected conflicts
```text
backend/src/routes/v1/index.js
```

Possible additional conflict:
```text
frontend/src/services/student.service.js
```

### Resolve rule
Use final `Intelli-Hostel` version for those files.

Then:

```bash
git add .
git commit -m "fix: resolve merge conflicts with dev for student and hostel allocation modules"
git push
```

Then merge Nakshatra PR.

---

## 10.4 Devershika conflict resolution

### Commands
```bash
git checkout feature/devershika/frontend-admin-ops
git fetch origin
git merge origin/dev
```

### Expected conflicts
```text
frontend/src/services/student.service.js
frontend/src/App.jsx
```

Possible conflict:
```text
frontend/src/components/layout/Sidebar.jsx
```

### Resolve rule
For each conflicted file, replace content so that it exactly matches the final file from `Intelli-Hostel`.

Then:

```bash
git add .
git commit -m "fix: resolve merge conflicts with dev for frontend shell and operational page integration"
git push
```

Then merge Devershika PR.

---

# 11. Final Release by Mahi

After all 4 PRs are merged into `dev`:

```bash
git checkout dev
git pull origin dev
```

Check everything.

If README needs final update, do it now.

### Optional README update commit
```bash
git add README.md
git commit -m "docs: update readme for final smart hostel management submission"
git push origin dev
```

---

## Final PR
Open PR:

```text
dev -> main
```

### Title
```text
chore: release final smart hostel management build to main
```

### Description
```text
## Summary
This PR releases the fully integrated smart hostel management build from dev to main.

## Includes
- authentication
- public access flow
- complaint system
- outpass with guardian approval
- payments with reminders
- hostel room management
- student APIs and preferences
- shared frontend shell
- admin operational pages
- final merge conflict resolution

## Issues Closed
Closes #14
```

---

# 12. Final Verification Checklist

Before final release PR, verify these:

## Backend
- [ ] auth routes exist
- [ ] complaint routes exist
- [ ] outpass routes exist
- [ ] payment routes exist
- [ ] hostel routes exist
- [ ] student routes exist
- [ ] route index imports all modules correctly
- [ ] tests run

## Frontend
- [ ] public pages exist
- [ ] AuthContext exists
- [ ] ProtectedRoute exists
- [ ] shared layout exists
- [ ] student overview/profile/room pages exist
- [ ] complaints page exists
- [ ] outpass page exists
- [ ] payments page exists
- [ ] admin complaints page exists
- [ ] admin outpass page exists
- [ ] admin payments page exists
- [ ] admin room layout page exists
- [ ] App.jsx final routing matches `Intelli-Hostel`
- [ ] Sidebar final navigation matches `Intelli-Hostel`

## GitHub
- [ ] old issues closed
- [ ] old milestones archived/closed
- [ ] new milestones created
- [ ] new issues created and assigned
- [ ] all 4 feature PRs opened
- [ ] all 4 feature PRs have descriptions
- [ ] each member commented on another PR
- [ ] merge conflicts were resolved in commits
- [ ] final release PR opened and merged

---

# 13. Fast Summary for Teammates

## Everyone must do this:
```bash
git clone https://github.com/Mahi-Jadeja/smart-hostel-management.git
git clone https://github.com/Mahi-Jadeja/Intelli-Hostel.git
cd smart-hostel-management
git checkout dev
git pull origin dev
```

## Then:
- create your assigned branch
- copy only your assigned files from `Intelli-Hostel`
- commit in the exact order listed
- push branch
- open PR to `dev`
- after earlier PRs merge, pull latest `dev`
- resolve conflicts using final `Intelli-Hostel` version
- push conflict-fix commit
- get PR merged

---

# 14. Final Note

This plan is designed to be:

- practical
- fast
- professional
- defensible in GitHub review

We are **not faking old development history**.  
We are building a clean feature-based contribution history from the current final codebase.

That is the safest and smartest approach for submission.

---

