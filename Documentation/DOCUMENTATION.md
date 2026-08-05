# Meeting Room Reservation System (MRRS) — Technical Documentation

> **Version**: 1.0  
> **Framework**: Laravel 12 + React 18 + Inertia.js  
> **Last Updated**: 2026  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema & Connections](#4-database-schema--connections)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Route Structure & Middleware](#6-route-structure--middleware)
7. [Controller Logic & API Endpoints](#7-controller-logic--api-endpoints)
8. [Frontend Component Architecture](#8-frontend-component-architecture)
9. [Business Process & Workflows](#9-business-process--workflows)
10. [Reservation Lifecycle](#10-reservation-lifecycle)
11. [Email Notification System](#11-email-notification-system)
12. [Reusable DataTable Service](#12-reusable-datatable-service)
13. [Admin Management Module](#13-admin-management-module)
14. [Security Considerations](#14-security-considerations)

---

## 1. System Overview

The **Meeting Room Reservation System (MRRS)** is a web-based application that allows employees to browse available meeting rooms, make reservations, manage bookings, and receive email notifications — all within a modern single-page application interface.

**Core Capabilities:**
- Browse meeting rooms with images, location, and capacity details
- Make single or recurring (multi-week) reservations
- Drag-and-drop rescheduling in calendar/timeline views
- Real-time conflict detection preventing double bookings
- Automated email notifications via queue (non-blocking)
- Role-based access control (superadmin, admin, regular users)
- Full audit trail with reservation history and restore
- Admin management (add/remove/change roles of administrators)
- Room CRUD with image upload via admin panel
- CSV export for data tables
- Dark/light theme support

---

## 2. Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| PHP | ^8.2 | Runtime |
| Laravel Framework | ^12.0 | Full-stack framework |
| Laravel Sanctum | ^4.0 | API token management |
| Inertia.js (Laravel) | ^2.0 | Server-side routing for SPA |
| MySQL | — | Primary database |
| Laravel Mail | — | Email sending via queue |
| Laravel Queue | — | Async email processing |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | ^18.2 | UI library |
| Inertia.js (React) | ^2.0 | SPA client integration |
| Vite | ^6.2 | Build tool |
| Tailwind CSS | ^3.2 | Utility-first styling |
| DaisyUI | ^5.0 | UI component library |
| Ant Design | ^6.3 | UI components (Select, Dropdown) |
| FullCalendar | ^6.1 | Calendar views |
| React Big Calendar | ^1.19 | Timeline/calendar views |
| Moment.js | ^2.30 | Date/time manipulation |
| Axios | ^1.10 | HTTP client |
| Framer Motion | ^12.38 | Animations |
| Zustand | ^5.0 | State management |
| Chart.js | ^4.5 | Charts |
| React DnD | ^16.0 | Drag and drop |
| Font Awesome | ^7.2 | Icons |
| Lucide React | ^1.7 | Icons |

### System Tools

| Tool | Purpose |
|---|---|
| `artisan` queue:work | Processes email queue |
| `run-queue-emails.bat` | Windows batch to run queue |
| `run-queue.vbs` | Background queue runner (silent) |

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                               │
│  React SPA ─── Inertia.js ─── Axios                                │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ HTTP / JSON
┌───────────────────────▼─────────────────────────────────────────────┐
│                     LARAVEL BACKEND                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Routes   │→ │Middleware│→ │Controllers│→ │ Services/Models   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  Database Layer                               │  │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐   │  │
│  │  │  mysql (MRRS)  │ │ masterlist (HR)│ │  authify (SSO) │   │  │
│  │  └────────────────┘ └────────────────┘ └────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Queue Worker                                │  │
│  │  ┌──────────────────────────────────────────────┐           │  │
│  │  │  MeetingRoomNotification Mailable → SMTP     │           │  │
│  │  └──────────────────────────────────────────────┘           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

```
1. User accesses app → `web.php` loads routes
2. `auth.php` → Login page (Inertia renders Auth/Login.jsx)
3. User submits credentials → `AuthenticatedSessionController@store`
4. Validates against `employee_masterlist` (masterlist DB)
5. Creates session token in `auth_sessions` table
6. Redirects to Dashboard (with `AuthMiddleware`)
7. Dashboard loads via Inertia → `DashboardController@index`
8. React renders dashboard with reservations, rooms, emails
9. All subsequent requests go through `AuthMiddleware`
```

---

## 4. Database Schema & Connections

### Database Connections (config/database.php)

Three MySQL connections are defined:

| Connection Name | Purpose | Configuration Env |
|---|---|---|
| `mysql` | Main MRRS database (rooms, reservations, admin, auth_sessions) | `DB_*` |
| `masterlist` | Employee masterlist from HR system | `MDB_*` |
| `authify` | External authentication sessions | `ADB_*` |

### Core Tables (System_Tables.sql + inferred from code)

#### `rooms`
```sql
CREATE TABLE rooms (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    location    VARCHAR(255),
    capacity    VARCHAR(255),
    description TEXT,
    image       VARCHAR(255),       -- stored in public/rooms/
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `reservations` (Active reservations)
```sql
CREATE TABLE reservations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    room_id     INT NOT NULL,
    guest_name  VARCHAR(255) NOT NULL,
    event_type  VARCHAR(255) NOT NULL,
    start_date  DATE NOT NULL,
    start_time  TIME NOT NULL,
    end_date    DATE NOT NULL,
    end_time    TIME NOT NULL,
    receivers   TEXT,                 -- comma-separated email addresses
    remarks     TEXT,
    status      VARCHAR(50) DEFAULT 'reserved',  -- reserved | canceled
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `reservation_history` (Audit log / completed reservations)
```sql
CREATE TABLE reservation_history (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id  INT NOT NULL,
    room_id         INT NOT NULL,
    new_room_id     INT NULL,          -- for room changes
    guest_name      VARCHAR(255),
    event_type      VARCHAR(255),
    start_date      DATE,
    start_time      TIME,
    end_date        DATE,
    end_time        TIME,
    receivers       TEXT,
    remarks         TEXT,
    status          VARCHAR(50),       -- reserved | completed | canceled | DateTimeAdjusted | restored
    reserved_by     VARCHAR(255),
    canceled_by     VARCHAR(255),
    date_canceled   TIMESTAMP NULL,
    reason          TEXT,              -- cancellation reason
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `admin` (Administrators)
```sql
CREATE TABLE admin (
    admin_id        INT AUTO_INCREMENT PRIMARY KEY,
    emp_id          INT NOT NULL UNIQUE,
    emp_name        VARCHAR(255) NOT NULL,
    emp_role        VARCHAR(255) NOT NULL,  -- 'admin' | 'superadmin'
    created_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_updated_by VARCHAR(255),
    deleted_at      TIMESTAMP NULL DEFAULT NULL
);
```

#### `auth_sessions` (Login session store)
```sql
CREATE TABLE auth_sessions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    token           VARCHAR(40) NOT NULL UNIQUE,
    emp_id          INT NOT NULL,
    emp_name        VARCHAR(255),
    emp_firstname   VARCHAR(255),
    emp_jobtitle    VARCHAR(255),
    emp_dept        VARCHAR(255),
    emp_prodline    VARCHAR(255),
    emp_station     VARCHAR(255),
    emp_position    VARCHAR(255),
    login_ip        VARCHAR(45),
    login_hostname  VARCHAR(255),
    user_agent      TEXT,
    system          VARCHAR(255),
    generated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### External: `employee_masterlist` (HR database — `masterlist` connection)
- **Connection**: `masterlist`
- **Table**: `employee_masterlist`
- **Key fields**: `EMPLOYID`, `EMPNAME`, `FIRSTNAME`, `PASSWRD`, `EMAIL`, `JOB_TITLE`, `DEPARTMENT`, `PRODLINE`, `STATION`, `ACCSTATUS`, `EMPPOSITION`

---

## 5. Authentication & Authorization

### Auth Flow

```
┌──────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  Login    │────→│ AuthSessionCtrl  │────→│ employee_masterlist  │
│  Page     │     │   @store         │     │ (masterlist DB)      │
└──────────┘     └────────┬─────────┘     └──────────────────────┘
                          │ success
                          ▼
                  ┌──────────────────┐     ┌──────────────────────┐
                  │  Create token    │────→│  auth_sessions       │
                  │  Store session   │     │  (mysql DB)          │
                  └────────┬─────────┘     └──────────────────────┘
                          │
                          ▼
                  ┌──────────────────┐
                  │  Redirect to     │
                  │  Dashboard       │
                  └──────────────────┘
```

### Authentication Methods

1. **Primary Login** (`AuthenticatedSessionController@store`):
   - Accepts `employeeID` and `password`
   - Validates against `employee_masterlist` (masterlist DB)
   - Supports shortcut passwords: `"061424"` and `"0"` for testing
   - Generates a 40-character random token
   - Stores token + metadata in `auth_sessions` table
   - Saves token in Laravel session as `auth_token`
   - Saves user data in session as `emp_data`

2. **SSO Token Login** (`AuthenticationController@setSession`):
   - Accepts a `queryToken` from an external auth system
   - Validates token against `authify` DB connection
   - Looks up admin role from `admin` table
   - Sets session data directly (no password check)

### Middleware Stack

Three custom middleware protect routes:

| Middleware | Class | Behavior |
|---|---|---|
| `emp.auth` | `AuthTokenMiddleware` | Checks session has valid `auth_token` and exists in `auth_sessions`. Redirects to `/` if invalid. |
| `AuthMiddleware` | `AuthMiddleware` | Validates token, fetches admin role, enriches session with role data. Redirects to login if unauthorized. |
| `admin` | `AdminMiddleware` | Checks if `emp_data.emp_id` exists in `admin` table. Redirects to `/` if not. |

### Route Middleware Mapping

| Route Group | Middleware |
|---|---|
| Public (rooms, reservations) | None |
| Authenticated (dashboard, profile) | `AuthMiddleware` |
| Admin (room-list, schedule-list, admin panel) | `AuthMiddleware` + `AdminMiddleware` |

### Role-Based Access

Roles from `admin` table's `emp_role` column:

| Role | Access Level |
|---|---|
| `superadmin` | Full access: dashboard, room management, schedule management, reservation history, admin management, all operations |
| `admin` | Dashboard, reservations CRUD, room list, schedule list, history, admin management |
| `null` (not in admin table) | Basic authenticated user (currently unrestricted routes) |

---

## 6. Route Structure & Middleware

### Route Map

The application routes are split across 5 files, all required from `routes/web.php`:

```
routes/
├── web.php          → Entry point, requires:
│   ├── auth.php     → Auth routes (login, logout, setSession)
│   ├── general.php  → Dashboard, profile, admin routes
│   ├── room.php     → Public room/reservation routes
│   └── room_list.php → Admin routes (room CRUD, schedules, history)
```

### Detailed Routes

#### `routes/auth.php`
| Method | URI | Controller | Middleware | Name |
|---|---|---|---|---|
| GET | `/{APP_NAME}/login` | Inertia render | — | login |
| POST | `/{APP_NAME}/login` | `AuthenticatedSessionController@store` | — | login |
| POST | `/{APP_NAME}/setSession` | `AuthenticationController@setSession` | — | setSession |
| POST | `/{APP_NAME}/logout` | `AuthenticationController@logout` | — | logout |
| GET | `/{APP_NAME}/unauthorized` | Inertia render | — | unauthorized |

Prefix: `APP_NAME` from `.env` (e.g., `mrrs`). Routes are under `/{APP_NAME}`.

#### `routes/general.php`
Prefix: `/{APP_NAME}`, Middleware: `AuthMiddleware`

| Method | URI | Controller | Additional Middleware | Name |
|---|---|---|---|---|
| GET | `/` | `DashboardController@index` | — | dashboard |
| GET | `/admin` | `AdminController@index` | `AdminMiddleware` | admin |
| GET | `/new-admin` | `AdminController@index_addAdmin` | `AdminMiddleware` | index_addAdmin |
| POST | `/add-admin` | `AdminController@addAdmin` | `AdminMiddleware` | addAdmin |
| POST | `/remove-admin` | `AdminController@removeAdmin` | `AdminMiddleware` | removeAdmin |
| PATCH | `/change-admin-role` | `AdminController@changeAdminRole` | `AdminMiddleware` | changeAdminRole |
| GET | `/profile` | `ProfileController@index` | — | profile.index |
| POST | `/change-password` | `ProfileController@changePassword` | — | changePassword |

#### `routes/room.php` (Public)
No middleware.

| Method | URI | Controller | Name |
|---|---|---|---|
| GET | `/` | Redirect to login | — |
| GET | `/rooms/list` | `RoomController@index` | rooms.index |
| GET | `/room/{id}` | `RoomController@show` | rooms.show |
| POST | `/reservations` | `ReservationController@store` | reservations.store |
| GET | `/reservations/check` | `ReservationController@check` | reservations.check |
| POST | `/reservations-store` | `RoomController@store` | — |
| POST | `/reservations-store-bulk` | `RoomController@storeBulk` | — |
| DELETE | `/reservations-delete/{id}` | `RoomController@destroy` | — |
| POST | `/reservations-cancel` | `ReservationController@cancel` | — |
| POST | `/reservations-update/{id}` | `ReservationController@updateDate` | — |
| GET | `/rooms/booknow` | `BookNowController@index` | rooms.booknow.index |
| DELETE | `/reservation-delete` | `BookNowController@destroy` | — |
| POST | `/reservation-update` | `BookNowController@updateReservation` | — |
| GET | `/maintenance` | Inertia render | maintenance |

#### `routes/room_list.php`
Prefix: `/{APP_NAME}`, Middleware: `AuthMiddleware` + `AdminMiddleware`

| Method | URI | Controller | Name |
|---|---|---|---|
| GET | `/room-list` | `RoomListController@index` | room.list.index |
| POST | `/room-list-store` | `RoomListController@store` | room.list.store |
| POST | `/room-list-update/{id}` | `RoomListController@update` | room.list.update |
| DELETE | `/room-list-destroy/{id}` | `RoomListController@destroy` | room.list.destroy |
| GET | `/schedule-list` | `ScheduleListController@index` | schedule.list.index |
| POST | `/schedule-list-store` | `ScheduleListController@store` | schedule.list.store |
| PUT | `/schedule-list-update/{id}` | `ScheduleListController@update` | schedule.list.update |
| DELETE | `/schedule-list-destroy/{id}` | `ScheduleListController@destroy` | schedule.list.destroy |
| GET | `/reservation-history` | `ReservationHistoryController@index` | reservation.history.index |
| GET | `/reservation/logs/{id}` | `ReservationHistoryController@viewHistoryLog` | reservation.history.log |
| POST | `/reservation/restore` | `ReservationHistoryController@restore` | reservation.restore |

---

## 7. Controller Logic & API Endpoints

### `DashboardController`

| Method | Description |
|---|---|
| `index()` | Main dashboard: Moves completed reservations to history, fetches active reservations + rooms + employee emails. Renders `Dashboard.jsx` via Inertia. |
| `show($id)` | Shows a single room with its reservations. Renders `Rooms/Show.jsx`. |
| `store(Request)` | Creates single reservation with conflict detection via `CONCAT(start_date, ' ', start_time)` comparison. Saves to both `reservations` and `reservation_history`. Sends email via `Mail::raw()`. |
| `destroy($id)` | Deletes reservation by ID. Returns error if not found. |

**Conflict Detection Logic**:
```sql
WHERE CONCAT(start_date, ' ', start_time) < ?   -- newEnd
  AND CONCAT(end_date, ' ', end_time) > ?        -- newStart
```

### `RoomController`

| Method | Description |
|---|---|
| `index()` | Lists all rooms + reservations. Fallback to 3 default rooms if empty. Renders `Rooms/Index.jsx`. |
| `show($id)` | Shows single room with its reservations. Renders `Rooms/Show.jsx`. |
| `store(Request)` | Creates single reservation with conflict detection via helper method `hasConflict()`. Sends queued email notifications via `MeetingRoomNotification` Mailable. |
| `storeBulk(Request)` | Creates multiple reservations in one transaction. Accepts `{ events: [...] }` array. Checks conflicts both against DB and within the batch. Sends one email per occurrence. |
| `destroy($id)` | Deletes reservation by ID. |

**Key Private Methods**:
- `hasConflict($roomId, $startDate, $startTime, $endDate, $endTime, $excludeId)`: Checks time overlap, optionally excludes a specific reservation ID.
- `insertReservation($data)`: Inserts into `reservations` + `reservation_history` in one operation.
- `sendReservationEmails($request, $emails)`: Queues `MeetingRoomNotification` for each recipient.
- `buildEmailMessage($request, $participants)`: Builds formatted email body with calendar details.

### `ReservationController`

| Method | Description |
|---|---|
| `store(Request)` | Creates reservation (legacy). Checks conflict using `WhereBetween` on `start_time`/`end_time`. |
| `check(Request)` | Returns JSON of reservations for a room on a specific date. |
| `cancel(Request)` | Cancels reservation: copies data to `reservation_history` with `status='canceled'`, then deletes from `reservations`. |
| `updateDate(Request, $id)` | Updates reservation dates/times. Checks if reservation is completed (blocks if done). Saves old data snapshot to history with `status='DateTimeAdjusted'`. |

### `BookNowController`

| Method | Description |
|---|---|
| `index()` | Lists rooms + reservations + employee emails. Renders `Rooms/Booknow.jsx`. |
| `updateReservation(Request)` | Partial update: can change status, dates, or room. Logs history with `DateTimeAdjusted` status. |
| `destroy(Request)` | Cancels reservation with reason. Logs full history including `canceled_by` and `reason`. |

### `AdminController` (General namespace)

| Method | Description |
|---|---|
| `index(Request)` | Lists admin users with DataTable pagination/search. |
| `index_addAdmin(Request)` | Lists eligible employees (MIS/Training & Development) not yet admin. |
| `addAdmin(Request)` | Adds employee to `admin` table with role. |
| `removeAdmin(Request)` | Removes employee from `admin` table. |
| `changeAdminRole(Request)` | Changes admin role. Updates session if current user is affected. |

### `ProfileController`

| Method | Description |
|---|---|
| `index()` | Shows current user's profile from `employee_masterlist`. |
| `changePassword(Request)` | Validates current password, updates `PASSWRD` in `employee_masterlist`. |

### `RoomListController` (RoomList namespace)

| Method | Description |
|---|---|
| `index(Request)` | Lists rooms with DataTable pagination. |
| `store(Request)` | Creates room with image upload to `public/rooms/`. |
| `update(Request, $id)` | Updates room. Deletes old image if new one uploaded. |
| `destroy($id)` | Deletes room + its image file. |
| `cancel(Request)` | Cancels reservation (marks as 'canceled' status instead of deleting). |

### `ScheduleListController` (RoomList namespace)

| Method | Description |
|---|---|
| `index(Request)` | Lists reservations with DataTable pagination. |
| `update(Request, $id)` | Updates reservation details. |
| `destroy($id)` | Deletes reservation. |

### `ReservationHistoryController` (RoomList namespace)

| Method | Description |
|---|---|
| `index(Request)` | Lists history with distinct reservation_id, joined with rooms. Formatted dates/times. |
| `viewHistoryLog($reservation_id)` | Returns full audit trail JSON for a single reservation. |
| `restore(Request)` | Restores a reservation from history back to `reservations` table. Logs restore event with `status='restored'`. |

---

## 8. Frontend Component Architecture

### Page Structure

```
resources/js/Pages/
├── Auth/
│   └── Login.jsx              → Login page
├── Admin/
│   ├── Admin.jsx              → Admin management
│   └── NewAdmin.jsx           → Add new admin
├── RoomList/
│   ├── RoomList.jsx           → Room CRUD
│   ├── ScheduleList.jsx       → Schedule management
│   └── ReservationHistory.jsx → History viewer
├── Rooms/
│   ├── Index.jsx              → Room listing + timeline + calendar (legacy)
│   ├── Show.jsx               → Single room detail + booking form (legacy)
│   ├── Booknow.jsx            → Calendar-based booking
│   └── Calendar.jsx           → Simple calendar (legacy)
├── Dashboard.jsx              → Main dashboard (timeline + calendar)
├── Profile.jsx                → User profile / password change
├── Welcome.jsx                → Welcome page
├── 404.jsx                    → Not found
├── Unauthorized.jsx           → Access denied
└── maintenance.jsx            → Maintenance mode
```

### Component Tree (Dashboard)

```
AuthenticatedLayout
├── Sidebar
│   ├── Navigation
│   │   ├── SidebarLink (Meeting Reservation)
│   │   ├── SidebarLink (Reservations) [admin+]
│   │   ├── SidebarLink (Room List) [admin+]
│   │   ├── SidebarLink (Reservation History) [admin+]
│   │   └── SidebarLink (Administrators) [admin+]
│   └── ThemeToggler
├── NavBar
│   └── User Dropdown (Profile, Logout)
└── Dashboard Content
    ├── Tab: Today Reservations (Timeline View)
    │   └── Gantt-chart style per-room timeline
    ├── Tab: Rooms (Calendar View)
    │   ├── Room Cards → Click to select
    │   └── Calendar (react-big-calendar)
    ├── New Booking Modal (Dialog)
    │   ├── Meeting Type (Ant Design Select)
    │   ├── Room selector
    │   ├── Date/time pickers
    │   ├── Recipient selector (email tags)
    │   ├── Recurring toggle (day picker + end date)
    │   └── Remarks
    ├── Manage Reservation Modal
    │   ├── Reschedule (room + date/time)
    │   └── Cancel (with reason)
    └── Confirm Save Modal
        └── Meeting etiquette agreement
```

### Shared Components

| Component | Path | Purpose |
|---|---|---|
| `NavBar.jsx` | `Components/` | Top navigation bar with user greeting and logout |
| `SideBar.jsx` | `Components/sidebar/` | Side navigation with logo, links, theme toggle |
| `Navigation.jsx` | `Components/sidebar/` | Dynamic nav links based on user role |
| `SidebarLink.jsx` | `Components/sidebar/` | Individual navigation link |
| `DropDown.jsx` | `Components/sidebar/` | Nested dropdown navigation |
| `ThemeToggler.jsx` | `Components/sidebar/` | Dark/light theme switch |
| `Calendar.jsx` | `Components/` | FullCalendar wrapper (used by legacy RoomList/Index) |
| `DataTable.jsx` | `Components/` | Reusable table with pagination, search, sort, export |
| `Modal.jsx` | `Components/` | Reusable modal wrapper |
| `Drawer.jsx` | `Components/` | Slide-out drawer component |
| `TableModal.jsx` | `Components/` | Modal for table row actions |
| `TabulatorTable.jsx` | `Components/` | Tabulator library wrapper |
| `LoadingScreen.jsx` | `Components/` | Full-page loading overlay |
| `TextInput.jsx` | `Components/` | Styled text input |
| `InputError.jsx` | `Components/` | Validation error display |
| `InputLabel.jsx` | `Components/` | Form label component |

### Key State Management Patterns

- **Inertia.js**: Primary data flow via server-rendered props
- **useState / useEffect**: Local component state for modals, selections
- **Zustand** (available): For global state if needed
- **Axios**: Direct HTTP calls for update/delete operations (not Inertia forms)
- **router.visit()**: Inertia navigation after mutations

---

## 9. Business Process & Workflows

### 9.1 Reservation Creation Workflow

```
User opens Dashboard
        │
        ▼
Select Tab: "Today" or "Rooms"
        │
        ├── Today View: Click on a room column in timeline
        └── Rooms View: Click room card → Calendar view → Click/drag on calendar
                │
                ▼
        New Booking Modal opens
                │
                ├── Select Meeting Type (categorized dropdown)
                ├── Room (pre-selected, changeable)
                ├── Start Date/Time (pre-filled from slot)
                ├── End Date/Time (pre-filled from slot)
                ├── Recipients (Ant Design tags with email search)
                ├── Toggle: Recurring
                │       ├── Select days (Sun–Sat buttons)
                │       └── Set "Repeat Until" date
                └── Remarks / Description
                        │
                        ▼
                Click "Save" → Confirm Save Modal
                        │
                        ▼
                Agree to Meeting Etiquette → "Confirm & Save"
                        │
                        ▼
            ┌── Single: POST /reservations-store
            └── Bulk:   POST /reservations-store-bulk
                        │
                        ▼
            Conflict Check → If conflict → error message
                        │
                        ▼
            DB Transaction: Insert reservations + history
                        │
                        ▼
            Queue email notifications to recipients
                        │
                        ▼
            Router.visit('/') → Refresh dashboard
```

### 9.2 Reservation Management Workflow

```
User clicks on existing reservation event
        │
        ▼
    ┌── If not owner/admin → "Not allowed" alert
    └── If owner/admin → Manage Reservation Modal
                │
                ├── Action: "Reschedule"
                │       ├── Select new room (optional)
                │       ├── New start date/time
                │       └── New end date/time
                │
                └── Action: "Cancel"
                        ├── Enter reason
                        └── Confirm → POST reservation-delete
                                │
                                ▼
                        Log to reservation_history with status='canceled'
                                │
                                ▼
                        Delete from reservations
                                │
                                ▼
                        Router.visit('/')
```

### 9.3 Admin: Room Management

```
Admin → Sidebar "Room List"
        │
        ▼
        DataTable of rooms (with image preview)
        │
        ├── Add Room: Form with name, location, capacity, description, image upload
        ├── Edit Room: Modal pre-filled with current data, new image upload
        └── Delete Room: Confirmation → removes image file + DB record
```

### 9.4 Admin: Schedule Management

```
Admin → Sidebar "Reservations"
        │
        ▼
        DataTable of all reservations (sorted by start_date DESC)
        │
        ├── Edit: Update guest name, event type, room, dates, remarks
        └── Delete: Remove reservation
```

### 9.5 Admin: Reservation History / Restore

```
Admin → Sidebar "Reservation History"
        │
        ▼
        DataTable of distinct reservations from reservation_history
        │
        ├── View Log: Show all history entries for a reservation
        └── Restore: Move reservation back to active reservations
```

### 9.6 Admin: Administrator Management

```
Admin → Sidebar "Administrators"
        │
        ├── List current admins (DataTable)
        │   ├── Change Role (dropdown: admin/superadmin)
        │   └── Remove Admin
        │
        └── Add New Admin → Lists eligible employees
            └── Select role → Add to admin table
```

### 9.7 Dashboard: Draggable Calendar (FullCalendar)

The `Calendar.jsx` component provides:
- **Select**: Click/drag to create new reservation
- **Event Drop**: Drag to reschedule → conflict check → save
- **Event Resize**: Pull bottom edge to extend → auto-stop at next reservation
- **Event Click**: Cancel reservation (with confirmation)
- **Color coding**: Blue (reserved/ongoing), Green (completed), Red (canceled)
- **Valid range**: No past dates allowed

### 9.8 Dashboard: Timeline View

The timeline view (Gantt-chart style):
- X-axis: Rooms as columns
- Y-axis: Time from 07:00 to midnight
- Color-coded blocks: Gray (upcoming), Blue (ongoing), Green (completed)
- Click on empty area → switches to Calendar tab for that room
- Click on reservation → Manage modal (owner/admin only)

---

## 10. Reservation Lifecycle

### States and Transitions

```
              ┌─────────────┐
              │   RESERVED  │  ← Initial creation
              └──────┬──────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ ONGOING │ │DateTime │ │CANCELED │
    │ (live)  │ │Adjusted │ │         │
    └────┬────┘ └────┬────┘ └────┬────┘
         │           │           │
         ▼           ▼           │
    ┌─────────┐ ┌─────────┐      │
    │COMPLETED│ │COMPLETED│      │
    └─────────┘ └─────────┘      │
                                  │
                                  ▼
                            ┌─────────┐
                            │ RESTORED│  ← From history
                            └─────────┘
```

### History Event Statuses

| Status | Triggered By | Description |
|---|---|---|
| `reserved` | Initial creation | Logged when reservation is first made |
| `DateTimeAdjusted` | Reschedule | Logged when dates/times are changed (before update) |
| `completed` | Dashboard@index | Auto-moved when `end_date < now` or `end_date=today AND end_time <= now` |
| `canceled` | Cancel action | Logged with `canceled_by`, `reason`, `date_canceled` |
| `restored` | Restore action | Logged when reservation is restored from history |

### Auto-Completion Logic (DashboardController@index)

```php
// Completed = end_date < today OR (end_date = today AND end_time <= now)
$completed = DB::table('reservations')
    ->where(function($q) use ($now) {
        $q->whereDate('end_date', '<', $now->toDateString())
          ->orWhere(function($q2) use ($now) {
              $q2->whereDate('end_date', $now->toDateString())
                 ->whereTime('end_time', '<=', $now->format('H:i:s'));
          });
    })
    ->get();

// Each completed reservation is copied to reservation_history
// with status='completed', then optionally deleted from reservations
```

**Note**: The delete from `reservations` table is currently commented out — meaning completed reservations remain visible in active view.

---

## 11. Email Notification System

### Architecture

```
Reservation Created
        │
        ▼
List of recipient emails (comma-separated "receivers" field)
        │
        ▼
For each email → Mail::to($email)->queue(new MeetingRoomNotification($body))
        │
        ▼
Queue Worker processes jobs asynchronously
        │
        ▼
SMTP sends email with plain text template
```

### Mailable Class: `App\Mail\MeetingRoomNotification`

- Implements `ShouldQueue` → emails are queued, not sent synchronously
- Extends `Illuminate\Mail\Mailable`
- Uses `Queueable` and `SerializesModels` traits
- Subject: **"Meeting Room Notification"**
- Template: `resources/views/emails/plain.blade.php` (renders: `{{ $body }}`)

### Email Body Format

```
Meeting Title: {event_type}

Topic: {remarks}

👤 Organizer: {guest_name}

🏢 Room: {room_name}
📍 Location: {room_location}

Schedule:
{date_display}
{time_display}
```

### Queue Configuration

- Driver: configured via `MAIL_MAILER` env (default: `log`)
- Workers: `run-queue-emails.bat`, `run-queue.bat`, `run-queue.vbs`
- Queue command: `php artisan queue:work --tries=1`

### Two Email Implementations

1. **DashboardController**: Uses `Mail::raw()` with inline string body
2. **RoomController & BookNowController**: Uses `MeetingRoomNotification` Mailable (queued)

---

## 12. Reusable DataTable Service

### `App\Services\DataTableService`

A generic service class that handles database queries with built-in:
- Pagination (configurable perPage)
- Search across specified columns
- Sorting by any column
- Date range filtering
- CSV export
- Join support
- Custom conditions

### Usage Pattern

```php
$result = $this->datatable->handle(
    $request,                  // Current request
    'mysql',                   // Connection name
    'reservations',            // Table name
    [
        'conditions' => function ($query) {
            return $query->where('status', 'active');
        },
        'searchColumns' => ['name', 'email', 'event_type'],
        'joins' => [
            [
                'table' => 'rooms',
                'first' => 'reservations.room_id',
                'second' => 'rooms.id',
            ]
        ],
        'dateColumn' => 'created_at',
        'exportColumns' => ['id', 'name', 'created_at'],
        'filename' => 'reservations_export',  // for CSV
    ]
);
```

### Frontend: `DataTable.jsx` Component

Features:
- Search input with server-side filtering
- Per-page selector (10/25/50/100)
- Sortable column headers with visual indicators (▲/▼)
- Date range filter mode
- Dropdown filter support
- CSV export button
- Pagination links (with numbered pages)
- Selectable rows mode
- Clickable rows → modal callback
- Dark/light theme support

### Data Flow

```
DataTable.jsx                  DataTableService.php
    │                                │
    │── search, perPage, sort ──────→│
    │                                │── Build query
    │                                │── Apply search/sort/filter
    │                                │── Paginate
    │                                │── Return collection
    │←──── paginated data ──────────│
    │                                │
    │── Export click ───────────────→│── Return CSV stream
```

---

## 13. Admin Management Module

### Routes (all protected by AuthMiddleware + AdminMiddleware)

| Action | Method | Endpoint |
|---|---|---|
| List admins | GET | `/admin` |
| List eligible employees | GET | `/new-admin` |
| Add admin | POST | `/add-admin` |
| Remove admin | POST | `/remove-admin` |
| Change role | PATCH | `/change-admin-role` |

### Eligibility Criteria for New Admins

```php
// Employees eligible to become admin:
ACCSTATUS = 1             // Active employee
STATION IN ('MIS', 'Training & Development')
DEPARTMENT IN ('Quality Management System', 'MIS')
EMPLOYID NOT IN (admin table IDs)  // Not already admin
```

### Role Options

- `admin`: Standard administrator
- `superadmin`: Full system access

### Frontend Pages

- `Admin/Admin.jsx`: DataTable of current admins with role editing and removal
- `Admin/NewAdmin.jsx`: DataTable of eligible employees with add-to-admin functionality

---

## 14. Security Considerations

### Implemented Security Measures

1. **Session-Based Authentication**: Server-side sessions with DB-validated tokens
2. **Token Regeneration**: On login, a random 40-character token is generated
3. **Session Invalidation**: On logout, token is deleted from DB, session flushed
4. **CSRF Protection**: Laravel's built-in `VerifyCsrfToken` middleware
5. **Route Middleware**: Three layers (auth token, session validation, admin check)
6. **Input Validation**: All user inputs validated via `$request->validate()`
7. **SQL Injection Prevention**: Queries use parameter binding (`?` placeholders)
8. **File Upload Validation**: Room images validated by mime type, extension, and size (2MB max)
9. **Authorization Checks**: 
   - Only owner or admin can cancel/modify reservations
   - Only admins can access admin routes
   - In-use transition prevention: Completed reservations cannot be modified
10. **XSS Prevention**: Inertia.js automatically escapes data

### Potential Security Improvements

1. **Password Hashing**: PASSWRD in employee_masterlist appears to be plain text
2. **Rate Limiting**: No throttle on login attempts
3. **Shortcut Passwords**: "061424" and "0" bypass authentication
4. **Session Timeout**: No idle session timeout
5. **Admin Check Bypass**: `AdminMiddleware` checks existence in `admin` table, not the `emp_role` value
6. **Soft Delete**: Only `admin` table uses `deleted_at` — other tables hard delete records

---

## Appendix A: Key Configuration Files

| File | Purpose |
|---|---|
| `.env` | Environment variables (not in repo) |
| `config/app.php` | App name, timezone (Asia/Manila), debug mode |
| `config/database.php` | 3 MySQL connection configurations |
| `config/mail.php` | SMTP/email configuration |
| `config/auth.php` | Authentication guards/providers |
| `config/queue.php` | Queue driver configuration |
| `config/session.php` | Session driver and lifetime |
| `tailwind.config.js` | Tailwind CSS customization |
| `vite.config.js` | Vite build configuration |
| `composer.json` | PHP dependencies |
| `package.json` | Node.js dependencies |

## Appendix B: Key File Paths

| Purpose | Path |
|---|---|
| Main routes entry | `routes/web.php` |
| Auth routes | `routes/auth.php` |
| Authenticated routes | `routes/general.php` |
| Public room routes | `routes/room.php` |
| Admin routes | `routes/room_list.php` |
| Dashboard controller | `app/Http/Controllers/DashboardController.php` |
| Room controller | `app/Http/Controllers/RoomController.php` |
| Reservation controller | `app/Http/Controllers/ReservationController.php` |
| Book now controller | `app/Http/Controllers/BookNowController.php` |
| Admin controller | `app/Http/Controllers/General/AdminController.php` |
| Profile controller | `app/Http/Controllers/General/ProfileController.php` |
| Room list controller | `app/Http/Controllers/RoomList/RoomListController.php` |
| Schedule controller | `app/Http/Controllers/RoomList/ScheduleListController.php` |
| History controller | `app/Http/Controllers/RoomList/ReservationHistoryController.php` |
| Auth middleware | `app/Http/Middleware/AuthMiddleware.php` |
| Admin middleware | `app/Http/Middleware/AdminMiddleware.php` |
| Token middleware | `app/Http/Middleware/AuthTokenMiddleware.php` |
| DataTable service | `app/Services/DataTableService.php` |
| Mail mailable | `app/Mail/MeetingRoomNotification.php` |
| Email template | `resources/views/emails/plain.blade.php` |
| Dashboard page | `resources/js/Pages/Dashboard.jsx` |
| Booking page | `resources/js/Pages/Rooms/Booknow.jsx` |
| Calendar component | `resources/js/Components/Calendar.jsx` |
| DataTable component | `resources/js/Components/DataTable.jsx` |
| Sidebar component | `resources/js/Components/sidebar/SideBar.jsx` |
| Login page | `resources/js/Pages/Auth/Login.jsx` |
| App layout | `resources/js/Layouts/AuthenticatedLayout.jsx` |
| System tables SQL | `System_Tables.sql` |

---

*Documentation generated from codebase analysis. For questions or updates, contact the development team.*

