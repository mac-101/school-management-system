# School Management System

A full-stack web application for running the day-to-day academic and administrative operations of a Nigerian primary and secondary school: student records and fees, staff and teaching assignments, schemes of work, timetables, and exam results, all in one dashboard.

**Frontend:** React · Tailwind CSS · Axios · React Router  
**Backend:** Django · Django REST Framework · PostgreSQL

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-build-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-styling-06B6D4?logo=tailwindcss&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST_API-092E20?logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white)

> **Live demo:** _add link here_  
> **Backend repo:** _add link here_

---

## Table of Contents

1. [Overview](#overview)
2. [Screenshots](#screenshots)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Data Model](#data-model)
7. [API Reference](#api-reference)
8. [Project Structure](#project-structure)
9. [Getting Started](#getting-started)
10. [Seed Data](#seed-data)
11. [Engineering Highlights](#engineering-highlights)
12. [Roadmap](#roadmap)
13. [What I Learned](#what-i-learned)
14. [Author](#author)

---

## Overview

Many schools still manage students, fees, timetables and results across paper registers and scattered spreadsheets. This project brings those workflows into one consistent, fast interface built around how Nigerian schools actually operate:

- A class structure of **Primary 1–5**, **JSS 1–3** and **SSS 1–3**
- **Three-term** academic years with sessions like `2025/2026`
- Fees tracked in **Naira (₦)** with live outstanding-balance calculation
- Period-based **school-wide timetables** in the traditional class-by-period layout
- **Schemes of work** organised by term → week → topic → subtopic

The frontend is a single-page React application that consumes a Django REST API. The database is the source of truth: the UI never ships with hardcoded records.

---

## Screenshots

> Add screenshots or a short GIF for each module. Recruiters skim, so a visual here goes a long way.

| Module | Preview |
| --- | --- |
| Login / Register | `docs/screenshots/auth.png` |
| Students list with filters | `docs/screenshots/students.png` |
| Student detail | `docs/screenshots/student-detail.png` |
| Staff | `docs/screenshots/staff.png` |
| Schemes of work | `docs/screenshots/schemes.png` |
| Timetable | `docs/screenshots/timetable.png` |
| Results | `docs/screenshots/results.png` |

---

## Features

### Authentication UI
- Split-screen register/login page with a navy brand panel and an illustration area
- Tab-style toggle between Register and Login
- Responsive: the illustration panel collapses on small screens

### App Shell
- Reusable `AppLayout` with a navy sidebar (Dashboard, Students, Staff, Timetable, Schemes) and logout
- Accepts `children` and `activePage`, so every page shares one consistent frame

### Students
- Sortable, scannable table with **Name, Age, Gender, Level, Grade, Student Fee, Amount Paid and Balance**
- **Underline filter tabs** with live counts: All Students, Primary, JSS, SSS, and per-grade drill-down dropdowns (for example Primary 1–5, JSS 1–3, SSS 1–3), plus an **Outstanding Fees** filter
- **Add / Edit student modal** (a single component for both modes):
  - Grade options update automatically based on the selected level
  - Fee balance recalculates live as you type
  - Inline validation with clear messages
  - Submit button locks while saving
  - Fade and scale animation, closes on backdrop click, Cancel or `Esc`
- **Student detail page** (`/students/:id`) fetched from the API by route ID, showing student information, fee summary in Naira, and placeholder tabs for upcoming Results, Attendance, Timetable and Homework modules
- Loading, error, empty and not-found states handled throughout

### Staff
- Responsive staff cards with avatar initials, role, employment type, status badge and contact details
- Teachers display their **subjects**, **classes**, and a **Class Moderator** badge where applicable
- Filter tabs: All, Teachers, Administrators, Support Staff, Full-time, Part-time, Active, Inactive
- Search by name, email or phone, combinable with any filter

### Schemes of Work
- **Curriculum navigation** instead of a wall of cards: pick a term, choose a class, then pick a subject
- **Scheme detail page** (`/schemes/:id`) showing subject, class, term, session and the full week → topic → subtopic breakdown
- **Add / Edit scheme modal** with dynamic weeks and subtopics (add/remove at both levels), subjects loaded live from the API, level-dependent grade options, and a single nested payload sent to the backend
- Safe handling when a scheme has no weeks or a week has no subtopics

### Timetable
- Timetable periods are **data-driven** (name, start time, end time and order come from the API, never hardcoded)
- Add, edit and delete entries through a single modal with Class, Day, Period, Subject, Teacher and Room
- Backend validation errors (such as teacher or class clashes) are surfaced inside the modal in plain language
- Delete with confirmation, optimistic local state update and success toast
- School-wide, day-grouped layout with classes as rows and periods as columns, filterable by level, class, teacher and subject

### Results
- Results listing as a proper table with Student, Student ID, Class, Term, Academic Session, Total Score and Average
- Combinable filters: academic session, term, level, class, and a student search (name or student ID)
- Row click and action buttons wired for the upcoming result detail and edit flows
- A reserved **Results Overview** section for future analytics

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI library | React (functional components and hooks) |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP client | Axios |
| API | Django REST Framework |
| Database | PostgreSQL |

**Hooks used throughout:** `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useParams`, `useNavigate`.

---

## Architecture

```
┌──────────────────────────┐        HTTPS / JSON        ┌───────────────────────────┐
│     React SPA (Vite)     │  ───────────────────────▶  │   Django REST Framework   │
│                          │                            │                           │
│  Pages ─ Components      │  ◀───────────────────────  │  Serializers · ViewSets   │
│  Axios · Router          │                            │  Validation · Business    │
│  Client-side filtering   │                            │  rules                    │
└──────────────────────────┘                            └─────────────┬─────────────┘
                                                                      │
                                                              ┌───────▼────────┐
                                                              │  PostgreSQL    │
                                                              └────────────────┘
```

**Key principles**

- **The database is the source of truth.** The frontend fetches everything from the API and ships no mock records.
- **Fetch once, derive everywhere.** Pages fetch a collection a single time, then compute filters, counts and groupings from that state with `useMemo`. Switching a filter never triggers another request.
- **Business rules live on the backend.** The UI surfaces server-side validation (for example timetable conflicts) instead of re-implementing it.
- **One modal per entity.** Create and edit share a single form component, switched by whether an existing record is passed in.

---

## Data Model

| Model | Purpose |
| --- | --- |
| `Student` | Identity, class (level + grade), fee, amount paid and calculated fee balance |
| `Staff` | Personal and employment details, role, employment type, salary, status |
| `Subject` | Name and code |
| `TeachingAssignment` | Links a staff member to a subject, level and grade (a teacher can teach many subjects across many classes) |
| `ClassModerator` | Marks a staff member as moderator of a given class |
| `Scheme` | Subject + level + grade + term + academic session |
| `SchemeWeek` / `SchemeSubtopic` | Weekly topics and their subtopics, nested under a scheme |
| `ClassRoom` | Level + grade |
| `Period` | Name, start time, end time and order |
| `TimetableEntry` | Class + subject + teacher + day + period + room |
| `StudentResult` | Student, term, session, per-subject scores, total and average |

---

## API Reference

The frontend consumes the following REST endpoints (base URL set through `VITE_API_URL`).

| Resource | Endpoints |
| --- | --- |
| Students | `GET/POST /students/` · `GET/PUT /students/:id/` |
| Staff | `GET /staff/` |
| Subjects | `GET /subjects/` |
| Schemes | `GET/POST /schemes/` · `GET/PUT /schemes/:id/` |
| Timetable | `GET/POST /timetable/` · `GET/PUT/DELETE /timetable/:id/` |
| Timetable lookups | `GET /timetable/classes/` · `GET /timetable/periods/` |
| Results | `GET /results/` |

**Example: creating a scheme with nested weeks and subtopics in one request**

```json
{
  "subject": 3,
  "level": "JSS",
  "grade": 1,
  "term": "First Term",
  "academic_session": "2025/2026",
  "weeks": [
    {
      "week_number": 1,
      "topic": "Number System",
      "subtopics": [
        { "title": "Natural Numbers" },
        { "title": "Whole Numbers" }
      ]
    }
  ]
}
```

---

## Project Structure

A representative layout of the frontend:

```
src/
├── App.jsx                     # Routes, wrapped in AppLayout
├── AppLayout.jsx               # Sidebar + page frame
├── pages/
│   ├── AuthPage.jsx
│   ├── StudentListPage.jsx
│   ├── StudentDetailPage.jsx
│   ├── StaffPage.jsx
│   ├── SchemePage.jsx
│   ├── SchemeDetailPage.jsx
│   ├── TimetablePage.jsx
│   └── ResultsPage.jsx
├── components/
│   ├── StudentFormModal.jsx
│   ├── StudentFilterBar.jsx
│   ├── StudentTable.jsx
│   ├── StaffCard.jsx
│   ├── SchemeFormModal.jsx
│   ├── TimetableGrid.jsx
│   ├── TimetableFormModal.jsx
│   └── TimetableEntryDetail.jsx
└── utils/
    ├── filters.js              # Central { key, label, test } filter definitions
    ├── formatCurrency.js       # Naira (₦) formatting
    └── timetableHelpers.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Make sure CORS is configured to allow your frontend origin (for example `http://localhost:5173`).

### 3. Run the frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:8000/api/
```

> The trailing slash matters: requests are built as `${import.meta.env.VITE_API_URL}students/`.

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Seed Data

A PostgreSQL seed script generates **1,000 realistic students** with Nigerian names, level-appropriate ages, grades that respect each level (Primary 1–5, JSS 1–3, SSS 1–3), and a realistic spread of fully paid, partially paid and unpaid fees.

```bash
psql -U <db-user> -d <db-name> -f student_seed_data.sql
```

Inserts are batched (100 rows per statement) for fast loading.

---

## Engineering Highlights

- **Config-driven filtering.** Every filter is a `{ key, label, test }` object in one file. The tab bar, the counts and the filtered list all read from it, so adding a filter is a one-line change.
- **Derived state over duplicated state.** Counts, grouped views and filtered lists are computed with `useMemo` from a single fetched array, so the UI cannot drift out of sync with the data.
- **Reusable create/edit modals.** One component per entity handles both modes, including pre-filled state, dynamic dependent dropdowns (level → grade), live computed fields and inline validation.
- **Nested form state done safely.** The scheme form manages weeks and subtopics with stable local IDs, renumbers weeks on removal, and submits one nested payload.
- **Backend-aware error handling.** A helper extracts readable messages from the different shapes DRF can return (`detail`, `non_field_errors`, per-field arrays), so users see why a save failed rather than a generic error.
- **Complete UI states.** Every data-driven view handles loading, error, empty and filtered-empty cases separately.
- **Accessible, polished interactions.** Modals support backdrop click and `Esc`, buttons lock during requests to prevent double submission, and transitions use fade and scale for a smooth feel.
- **Consistent design language.** One navy (`#0A2472`) primary, slate neutrals and shared spacing, border and focus-ring conventions across every page.

---

## Roadmap

- [ ] Add / Edit Result modal with per-subject score entry
- [ ] Results Overview analytics (class averages, pass rates, top performers)
- [ ] Student detail tabs: Results, Attendance, Timetable, Homework
- [ ] Connect the Staff page to the live staff API (currently shaped around the serializer output)
- [ ] Delete flow for students
- [ ] Export schemes of work to Word (`.docx`)
- [ ] Token-based authentication wired to the backend
- [ ] Role-based access (admin, teacher, accountant)
- [ ] Attendance and homework modules
- [ ] Unit and integration tests
- [ ] CI pipeline and production deployment

---

## What I Learned

- Designing a UI around **real domain rules** (term structure, class levels, fee balances) rather than generic CRUD
- Modelling **nested data** (scheme → weeks → subtopics) and keeping deeply nested form state predictable
- Separating **what the backend owns** (validation, conflicts) from **what the frontend owns** (presentation, filtering)
- Keeping a growing codebase consistent through shared patterns instead of one-off components

---

## Author

**MacAnthony**

- GitHub: [mac-101](https://github.com/mac-101/)
- LinkedIn: [MacAnthony Charles](https://www.linkedin.com/in/macanthony-charles-561810367?utm_source=share_via&utm_content=profile&utm_medium=member_android)
- Email: charlesmacanthony797@gmail.com

---

_Built as a hands-on project to practise building production-style full-stack applications._
