# Workforce — React version

This is the React + Vite conversion of the Workforce campus portal (originally built in
plain HTML/CSS/JS). Same features, same look, now with client-side routing and proper
component state instead of manual DOM manipulation.

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview   # serve the built files locally to sanity-check
```

## Demo logins

- **Student:** ID `S101`, password `pass123`
- **Teachers:**
  - `T201` / `teach123` — CSE-2nd Year (whole class)
  - `T202` / `teach123` — ECE-3rd Year
  - `T203` / `teach123` — CSE-3rd Year
  - `T204` / `teach123` — IT-2nd Year
  - `T205` / `teach123` — ECE-2nd Year
  - `T206` / `teach123` — CSE-2nd Year, but **restricted to groups G1–G3 only** (demonstrates group-scoping)

All 200 students use password `pass123` (IDs roughly S101–S260 — try any of them).

Trouble logging in with any of these? Use the **"Reset demo data"** link on the login
page — it restores everything to this exact state.

Or use **Create an account** (`/signup`) to register a new student or teacher — it's all
stored in `localStorage`, so accounts persist across reloads but are local to your browser.

## How it's organized

```
src/
  store.js                 → localStorage "database" (all data tables + CRUD helpers)
  App.jsx                  → route tree
  main.jsx                 → app entry point, wraps everything in providers

  components/
    AuthContext.jsx         → session state (useAuth hook)
    Toast.jsx               → toast notifications (useToast hook)
    ProtectedRoute.jsx       → redirects to /login if not authenticated as the right role
    PublicLayout.jsx         → nav + footer wrapper for public pages
    AppLayout.jsx             → nav + sidebar + footer wrapper for logged-in dashboards
    Nav.jsx / Sidebar.jsx / Footer.jsx / Modal.jsx

  pages/
    Home.jsx, Login.jsx, Signup.jsx
    public/     → Campus Guide, Junior Hub, Clubs, Emergency, Suggestions, Campus Updates,
                  Study Zone, Opportunities (no login required)
    student/    → Dashboard, Grades, Attendance, Events, Complaints, Tests,
                  Hackathon, Timetable, Assignments, Messages, Projects, Exchange,
                  Service Requests, Profile
    teacher/    → Dashboard, Roster (add students), Announcements, Events, Attendance,
                  Grades, Timetable, Complaints, Assignments, Messages, Profile

  styles/       → base.css, app.css, home.css, public.css, auth.css
```

## Data layer

Everything is stored under one `localStorage` key (`workforce_db_v1`) via `src/store.js`.
It seeds itself with demo data on first load. To reset to a clean slate, run this in the
browser console:

```js
localStorage.removeItem('workforce_db_v3')
```
then reload — or just use the "Reset demo data" link on the login page.

## Recently added — fixing real problems hit while testing

### The "ID/password not matched" mystery — solved
Your browser had localStorage cached from an earlier version, before T202–T206 and the
expanded roster existed. That old data never refreshed automatically, so you kept hitting
a version of the app that genuinely didn't have those accounts. Fixed by bumping the
storage version (old versions are now cleared automatically). There's also a **"Reset
demo data" link on the login page** now, so this never becomes a silent mystery again —
if login ever behaves strangely, that link clears everything and restores a known-good
state in one click.

### Groups — G1 through G10
Every student now has a `group` (visible in their sidebar and on `/student/profile`,
editable there too). Teachers can optionally be restricted to specific groups within
their class — e.g. a lab instructor who only handles G1–G3 — via a `groups` field set at
signup or on their own profile. Leaving it empty (the default for the 5 main class
teachers) means they still see their whole class, unchanged from before.

**Demo:** T206 / teach123 (Prof. Sameer Ghosh) is set up as a CSE-2nd Year lab instructor
restricted to G1, G2, G3 only — log in as them to see a narrower roster than T201, who
teaches the same class but sees everyone.

Attendance and the grade-upload table both got a **Group filter** dropdown so a teacher
can narrow the roster down to one batch when marking a lab session.

### Five classes now, not four — more variety within "2nd Year"
Added `ECE-2nd Year` (40 students, teacher T205), so 2nd Year now spans three different
branches (CSE, IT, ECE) instead of two.

### Teachers can now add their own students
New page: **`/teacher/roster`** ("Add Students" in the sidebar, right under Dashboard).
Add one student by name (auto-generated ID and password), or paste a whole list of names
at once for instant bulk creation — groups get assigned automatically in rotation. Every
"your class has no students" empty-state elsewhere in the app now links straight here
instead of dead-ending on "ask an admin."

### Signup no longer lets you create a mismatched class
Free-text class entry for teachers is gone — it's now a checklist built from real class
keys, so a typo can never again silently create a class with zero real students in it.
Students pick their branch from a dropdown and their group from a list, same reasoning.

### Messaging — two drawbacks fixed
- Switching between conversations now clears whatever you'd half-typed — no more risk of
  a message meant for one person landing in front of someone else.
- Students only see teachers actually assigned to their own class, not every teacher in
  the system.

### Much deeper demo data
Grades, attendance, GPA records, and assignments are now populated across essentially the
whole 200-student roster (previously only 2–3 hand-picked students had any data at all).
Browsing any random student or teacher now shows something real instead of an empty page.

## Class / section scoping
Teachers now belong to specific classes (`classes: []` on their record, e.g.
`['CSE-2nd Year']`). Grade Card, Attendance, Assignments, Timetable editing, and
Conversations are all scoped to a teacher's own roster — they can't see or manage
students outside their assigned class(es). The dashboard's "Students in your class" stat
reflects this too. New teachers declare their class(es) at signup as a comma-separated
list (e.g. "CSE-2nd Year, CSE-3rd Year").

### New public pages (no login)
- **Study Zone** (`/study-zone`) — study-friendly spots other than the library, tagged by
  vibe (quiet, group-friendly, late-night) with amenities.
- **Opportunities** (`/opportunities`) — curated hackathons, internships, and
  international programs, filterable by category, sorted by deadline.
- **Ask a Senior** — a Q&A section added directly inside Junior Hub (`/junior-hub`),
  separate from the notes upload/browse area.

### New student portal pages
- **Project Showcase** (`/student/projects`) — submit and browse student projects,
  filter by difficulty level, flag when a project is looking for teammates.
- **Campus Exchange** (`/student/exchange`) — buy/sell/lend/give-away listings for
  textbooks, electronics, and other student essentials.
- **Service Requests** (`/student/service-requests`) — request official documents
  (bonafide certificate, ID card, transcript, etc.) and track their status.

### Complaints, now with a teacher side
Every other student action already had a teacher-facing counterpart except complaints,
which just sat there. `/teacher/complaints` now lists everything filed by students in
the teacher's own class(es), with Open / Resolved / All filters and a one-click
resolve/reopen toggle. The teacher dashboard's "Open complaints" stat is scoped the same
way and links straight there.

### Bulk grade upload
`/teacher/grades` now has an "Upload grades for your whole class" panel — one subject,
term, and credit value applied across a table with a row per student in the roster.
Grade auto-fills from marks entered (still editable per row) so a teacher isn't manually
picking a letter grade for every student. Leaving a student's marks blank skips them.
The original one-student-at-a-time form is still there below it for one-off corrections.

### Student timetable now matches the student's actual class
Previously hardcoded to always show "CSE-2nd Year" regardless of who was logged in. Now
looks up the logged-in student's own branch + year and shows their real timetable (or a
clear empty state if their class doesn't have one set yet).

### Editable profiles
Clicking your name/avatar in the sidebar now opens `/student/profile` or
`/teacher/profile`. Students can fix their name, year, and branch (which is what their
class-key and therefore their whole roster-scoped experience is built from) — no more
being stuck with a signup typo. Teachers can update their name, department, and which
class(es) they teach. Both can change their password (current password required).
Changing your name updates what's shown in the nav/sidebar immediately.

### Grades no longer duplicate on re-save
Both the single-student form and the bulk-upload table on `/teacher/grades` now *update*
an existing entry instead of creating a new one, when you re-submit the same student +
subject + term. This also means fixing a typo is just re-entering the corrected marks —
no separate edit UI needed.

### Delete confirmations
Deleting an announcement, event, grade, or GPA record now asks "are you sure?" first.
Small thing, but it means a misclick during a live demo doesn't silently wipe data.

## Recently added

### Full class rosters — 160 students across 4 classes
Instead of 3 demo students, there are now realistic 40-student rosters for each of:
`CSE-2nd Year`, `ECE-3rd Year`, `CSE-3rd Year`, and `IT-2nd Year`. Four teacher accounts
(T201–T204) are each assigned to one of these classes, so logging in as any of them shows
a fully populated, correctly-scoped roster everywhere — Grade Card, Attendance,
Timetable, Assignments, Complaints, and Conversations.

The original three demo students (S101, S102, S103) keep all their existing linked data
(grades, attendance history, complaints, assignments, messages) exactly as before — they
were folded into the new CSE-2nd Year and ECE-3rd Year rosters, not replaced.

**Demo logins for the new classes:**
- T202 / teach123 — Prof. Rajesh Iyer, ECE-3rd Year
- T203 / teach123 — Dr. Ananya Kulkarni, CSE-3rd Year
- T204 / teach123 — Prof. Manish Trivedi, IT-2nd Year

All 160 students use password `pass123` (IDs S101–S260, sequential). Any of them can log
in and see their own dashboard, grades, attendance, and their class's real timetable.

## Previously added

- **Teacher grade card (`/teacher/grades`)** — enter subject-wise marks, grade, and credit
  per student, plus set SGPA/CGPA per student per term. Students see all of this on
  `/student/grades`, including a total-credits and SGPA/CGPA summary row.
- **Teacher timetable editor (`/teacher/timetable`)** — edit any class's weekly schedule
  cell by cell; changes save to the same `timetable` data students see on
  `/student/timetable`.
- **Event registration links** — events now carry an optional `formLink`. Teachers can
  attach one when posting an event; students see a "Participate →" button on
  `/student/events` that opens it in a new tab.
- **Clubs page redesign** — dropped the QR-code placeholder in favor of showing each
  club's category, description, and meeting time directly on the card, with the join-form
  link front and center.
- **Attendance danger zone** — `/student/attendance` now flags any subject under 75% with
  a "Danger zone" tag and tells the student exactly how many classes in a row they need
  to attend to climb back above 75%. Subjects safely above 75% show how many classes they
  could skip and still stay compliant.

## Access control

- Public pages (`/`, `/campus-guide`, `/junior-hub`, `/clubs`, `/emergency`,
  `/suggestions`, `/campus-updates`, `/login`, `/signup`) are open to everyone.
- `/student/*` routes require an active **student** session — anyone hitting them
  without one is redirected to `/login`.
- `/teacher/*` routes require an active **teacher** session, same redirect behavior.
- Sessions are role-scoped: a logged-in student can't open teacher routes and vice versa.

## Moving to a real backend later

`src/store.js` is the only file that talks to `localStorage`. When you're ready to add a
real database, that's the file to swap out — keep the same function names
(`Store.get`, `Store.push`, `Store.update`, `Store.remove`, `Store.session`, etc.) and
point them at API calls instead. None of the page components need to change since they
only ever import from `store.js`.
