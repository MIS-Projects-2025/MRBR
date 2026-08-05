const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new PptxGenJS();

// ---- Color palette (MRRS theme) ----
const COLORS = {
  primary: '2563EB',      // blue
  dark: '1E293B',         // slate-800
  accent: '0EA5E9',       // sky
  light: 'F1F5F9',        // slate-100
  white: 'FFFFFF',
  green: '10B981',        // emerald
  amber: 'F59E0B',
  red: 'EF4444',
  gray: '64748B',
};

// ---- Layout config ----
const W = 13.33;  // 16:9 width inches
const H = 7.5;    // height

pptx.layout = 'LAYOUT_WIDE';
pptx.defineLayout({ name: 'WIDE', width: W, height: H });
pptx.layout = 'WIDE';

const FONT = 'Calibri';

// ---- Helper: brand title bar ----
function addHeader(slide, title, subtitle) {
  slide.addShape('rect', { x: 0, y: 0, w: W, h: 0.9, fill: { color: COLORS.primary } });
  slide.addShape('rect', { x: 0, y: 0.9, w: W, h: 0.06, fill: { color: COLORS.accent } });
  slide.addText(title, {
    x: 0.5, y: 0.12, w: W - 1, h: 0.5,
    fontSize: 26, bold: true, color: COLORS.white, fontFace: FONT,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 0.55, w: W - 1, h: 0.3,
      fontSize: 13, color: 'DBEAFE', fontFace: FONT,
    });
  }
}

function addFooter(slide, pageNum) {
  slide.addText('Meeting Room Reservation System (MRRS) — User Guide', {
    x: 0.5, y: H - 0.4, w: 8, h: 0.3, fontSize: 9, color: COLORS.gray, fontFace: FONT,
  });
  if (pageNum) {
    slide.addText(String(pageNum), {
      x: W - 1, y: H - 0.4, w: 0.5, h: 0.3, fontSize: 9, color: COLORS.gray, fontFace: FONT, align: 'right',
    });
  }
}

function addBullets(slide, bullets, x, y, w, h, fontSize) {
  const items = bullets.map((b, i) => ({
    text: b,
    options: { bullet: { code: '2022' }, breakLine: true, color: COLORS.dark, fontFace: FONT, fontSize: fontSize || 14 },
  }));
  slide.addText(items, { x, y, w, h, valign: 'top' });
}

// ============================================================
// SLIDE 1 — Title
// ============================================================
let slide = pptx.addSlide();
slide.background = { color: COLORS.dark };
slide.addShape('rect', { x: 0, y: 0, w: W, h: H, fill: { color: COLORS.dark } });
slide.addShape('rect', { x: 0, y: H - 1.2, w: W, h: 1.2, fill: { color: COLORS.primary } });
slide.addText('MEETING ROOM RESERVATION SYSTEM', {
  x: 1, y: 1.6, w: W - 2, h: 1.0, fontSize: 40, bold: true, color: COLORS.white, fontFace: FONT, align: 'center',
});
slide.addText('User Guide & Visual Walkthrough', {
  x: 1, y: 2.7, w: W - 2, h: 0.6, fontSize: 22, color: COLORS.accent, fontFace: FONT, align: 'center',
});
slide.addShape('rect', { x: (W - 3) / 2, y: 3.6, w: 3, h: 0.06, fill: { color: COLORS.accent } });
slide.addText('Book rooms  •  Manage schedules  •  Receive notifications', {
  x: 1, y: 4.0, w: W - 2, h: 0.5, fontSize: 15, color: 'CBD5E1', fontFace: FONT, align: 'center',
});
slide.addText('Version 1.0  •  Internal Use', {
  x: 1, y: 5.6, w: W - 2, h: 0.4, fontSize: 12, color: '94A3B8', fontFace: FONT, align: 'center',
});

// ============================================================
// SLIDE 2 — Agenda
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Agenda', 'What you will learn');
const agenda = [
  '1.  System Overview & Key Features',
  '2.  Logging In (Employee ID & Password)',
  '3.  Dashboard: Timeline and Calendar Views',
  '4.  Making a Room Reservation',
  '5.  Recurring (Repeating) Bookings',
  '6.  Managing & Cancelling Reservations',
  '7.  Admin: Room List Management',
  '8.  Admin: Schedule & Reservation History',
  '9.  Admin: Administrator Management',
  '10.  Profile & Change Password',
];
addBullets(slide, agenda, 1.0, 1.4, W - 2, H - 2.2, 16);
addFooter(slide, 2);

// ============================================================
// SLIDE 3 — System Overview
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'System Overview', 'A web-based meeting room booking platform');
slide.addText('Core Capabilities', { x: 1, y: 1.3, w: 4, h: 0.4, fontSize: 18, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Browse meeting rooms with images, location & capacity',
  'Make single or recurring multi-week reservations',
  'Drag-and-drop rescheduling in calendar/timeline views',
  'Automatic conflict detection (no double bookings)',
  'Automated email notifications to participants',
  'Role-based access (User / Admin / Superadmin)',
  'Full reservation history with restore option',
  'Dark / light theme support',
], 1.0, 1.8, 6.2, H - 2.6, 14);

// Right panel: tech stack + architecture
slide.addShape('roundRect', { x: 7.6, y: 1.3, w: 5.0, h: 4.6, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('Technology Stack', { x: 7.9, y: 1.4, w: 4.4, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Frontend: React 18 + Inertia.js',
  'Backend: Laravel 12 (PHP)',
  'Database: MySQL',
  'Styling: Tailwind + DaisyUI + Ant Design',
  'Calendar: FullCalendar + React Big Calendar',
  'Emails: Laravel Queue + SMTP',
  'Charts & State: Chart.js + Zustand',
], 7.9, 1.9, 4.4, 3.8, 12);

slide.addShape('roundRect', { x: 7.6, y: 6.1, w: 5.0, h: 0.9, fill: { color: COLORS.primary } });
slide.addText('Three databases: MRRS (main), Masterlist (HR), Authify (SSO)', {
  x: 7.8, y: 6.25, w: 4.6, h: 0.6, fontSize: 11, color: COLORS.white, fontFace: FONT, valign: 'middle',
});
addFooter(slide, 3);

// ============================================================
// SLIDE 4 — Logging In
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Logging In', 'Access the system with your employee credentials');
// Login form mock
slide.addShape('roundRect', { x: 1.2, y: 1.5, w: 4.6, h: 4.6, fill: { color: COLORS.white }, line: { color: COLORS.gray, width: 1 }, shadow: { type: 'outer', blur: 6 } });
slide.addText('MRRS Login', { x: 1.5, y: 1.7, w: 4, h: 0.5, fontSize: 20, bold: true, color: COLORS.primary, fontFace: FONT });
slide.addText('Employee ID', { x: 1.5, y: 2.4, w: 4, h: 0.3, fontSize: 12, color: COLORS.gray, fontFace: FONT });
slide.addShape('roundRect', { x: 1.5, y: 2.7, w: 4.0, h: 0.55, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.75 } });
slide.addText('Password', { x: 1.5, y: 3.4, w: 4, h: 0.3, fontSize: 12, color: COLORS.gray, fontFace: FONT });
slide.addShape('roundRect', { x: 1.5, y: 3.7, w: 4.0, h: 0.55, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.75 } });
slide.addShape('roundRect', { x: 1.5, y: 4.5, w: 4.0, h: 0.6, fill: { color: COLORS.primary } });
slide.addText('Sign In', { x: 1.5, y: 4.6, w: 4.0, h: 0.4, fontSize: 15, bold: true, color: COLORS.white, fontFace: FONT, align: 'center' });

// Steps panel
slide.addText('Steps', { x: 6.5, y: 1.5, w: 4, h: 0.4, fontSize: 18, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  '1.  Open your browser and go to the MRRS URL.',
  '2.  Type your Employee ID in the first field.',
  '3.  Enter your password.',
  '4.  Click "Sign In".',
  '5.  You will be redirected to the Dashboard.',
  '',
  'Tip: Upon login, a secure session token is created and linked to your account.',
], 6.5, 2.0, 6.0, 4.0, 14);
addFooter(slide, 4);

// ============================================================
// SLIDE 5 — Dashboard Overview
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Dashboard Overview', 'Your home screen after logging in');
// Sidebar mock
slide.addShape('rect', { x: 0.6, y: 1.3, w: 2.2, h: 5.4, fill: { color: COLORS.dark } });
slide.addText('MRRS', { x: 0.7, y: 1.4, w: 2.0, h: 0.4, fontSize: 16, bold: true, color: COLORS.white, fontFace: FONT });
const navItems = ['📅 Meeting Reservation', '🗂 Reservations', '🛎 Room List', '📜 History', '👥 Administrators'];
navItems.forEach((item, i) => {
  slide.addText(item, { x: 0.8, y: 2.0 + i * 0.7, w: 1.9, h: 0.5, fontSize: 11, color: i === 0 ? COLORS.accent : 'CBD5E1', fontFace: FONT });
});
// Main area mock
slide.addShape('roundRect', { x: 3.0, y: 1.3, w: 6.0, h: 5.4, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('Dashboard', { x: 3.2, y: 1.4, w: 5, h: 0.4, fontSize: 16, bold: true, color: COLORS.dark, fontFace: FONT });
// Tabs
slide.addShape('roundRect', { x: 3.2, y: 1.9, w: 1.6, h: 0.4, fill: { color: COLORS.primary } });
slide.addText('Today', { x: 3.2, y: 1.95, w: 1.6, h: 0.3, fontSize: 11, color: COLORS.white, fontFace: FONT, align: 'center' });
slide.addShape('roundRect', { x: 4.9, y: 1.9, w: 1.6, h: 0.4, fill: { color: COLORS.white }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('Rooms', { x: 4.9, y: 1.95, w: 1.6, h: 0.3, fontSize: 11, color: COLORS.dark, fontFace: FONT, align: 'center' });
// timeline bars
slide.addShape('roundRect', { x: 3.2, y: 2.6, w: 5.4, h: 0.5, fill: { color: COLORS.green } });
slide.addText('Room A — 9:00–10:00 (Completed)', { x: 3.3, y: 2.65, w: 5, h: 0.4, fontSize: 10, color: COLORS.white, fontFace: FONT });
slide.addShape('roundRect', { x: 3.2, y: 3.3, w: 5.4, h: 0.5, fill: { color: COLORS.primary } });
slide.addText('Room B — 10:00–12:00 (Ongoing)', { x: 3.3, y: 3.35, w: 5, h: 0.4, fontSize: 10, color: COLORS.white, fontFace: FONT });
slide.addShape('roundRect', { x: 3.2, y: 4.0, w: 5.4, h: 0.5, fill: { color: COLORS.gray } });
slide.addText('Room C — 13:00–14:00 (Upcoming)', { x: 3.3, y: 4.05, w: 5, h: 0.4, fontSize: 10, color: COLORS.white, fontFace: FONT });
// Right legend
slide.addShape('roundRect', { x: 9.3, y: 1.3, w: 3.4, h: 5.4, fill: { color: COLORS.white }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('Key Areas', { x: 9.5, y: 1.4, w: 3, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Sidebar: navigation menu',
  'Tabs: Today (timeline) & Rooms (calendar)',
  'Color coding: green = complete, blue = active, gray = upcoming',
  'New Booking button opens reservation form',
  'Click a reservation to manage (reschedule/cancel)',
], 9.5, 1.9, 3.0, 4.5, 12);
addFooter(slide, 5);

// ============================================================
// SLIDE 6 — Making a Reservation
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Making a Reservation', 'Step-by-step booking flow');
const steps = [
  { n: '1', t: 'Navigate', d: 'Go to Dashboard → open the "Rooms" tab and select a room card.' },
  { n: '2', t: 'Choose time', d: 'Click or drag on the calendar to select your desired time slot.' },
  { n: '3', t: 'Fill details', d: 'Meeting type, room, start/end date & time, recipients, remarks.' },
  { n: '4', t: 'Confirm', d: 'Accept the meeting etiquette agreement and click "Confirm & Save".' },
  { n: '5', t: 'Done', d: 'System checks conflicts, saves, and emails the participants.' },
];
steps.forEach((s, i) => {
  const y = 1.4 + i * 1.05;
  slide.addShape('ellipse', { x: 1.0, y: y + 0.05, w: 0.6, h: 0.6, fill: { color: COLORS.primary } });
  slide.addText(s.n, { x: 1.0, y: y + 0.12, w: 0.6, h: 0.45, fontSize: 18, bold: true, color: COLORS.white, fontFace: FONT, align: 'center' });
  slide.addText(s.t, { x: 1.8, y: y, w: 2.2, h: 0.4, fontSize: 16, bold: true, color: COLORS.dark, fontFace: FONT });
  slide.addText(s.d, { x: 1.8, y: y + 0.4, w: 6.5, h: 0.6, fontSize: 12, color: COLORS.gray, fontFace: FONT });
});
slide.addShape('roundRect', { x: 8.6, y: 1.4, w: 4.0, h: 5.0, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('New Booking Form', { x: 8.8, y: 1.5, w: 3.6, h: 0.4, fontSize: 15, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Meeting Type (dropdown)',
  'Room (Auto-selected)',
  'Start Date & Time',
  'End Date & Time',
  'Recipients (email tags)',
  'Recurring toggle',
  'Remarks / Topic',
], 8.8, 2.0, 3.6, 4.0, 12);
addFooter(slide, 6);

// ============================================================
// SLIDE 7 — Recurring Bookings
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Recurring (Repeating) Bookings', 'Book a meeting that repeats weekly');
addBullets(slide, [
  'Enable the "Recurring" toggle in the booking form.',
  'Select the day(s) of the week the meeting repeats (Sun–Sat).',
  'Set a "Repeat Until" end date.',
  'The system creates one reservation per selected week automatically.',
  'A group email is sent for each occurrence.',
  'Conflicts are checked per-occurrence across all scheduled dates.',
], 1.0, 1.5, 6.5, 4.0, 14);

// visual: week strip
slide.addShape('roundRect', { x: 7.8, y: 1.6, w: 4.8, h: 3.4, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('Repeat Weekly', { x: 8.0, y: 1.7, w: 4.4, h: 0.4, fontSize: 15, bold: true, color: COLORS.primary, fontFace: FONT });
const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
days.forEach((d, i) => {
  const selected = i === 1 || i === 3; // Mon & Wed selected
  slide.addShape('ellipse', { x: 8.1 + i * 0.62, y: 2.4, w: 0.5, h: 0.5, fill: { color: selected ? COLORS.primary : COLORS.white }, line: { color: COLORS.gray, width: 0.5 } });
  slide.addText(d, { x: 8.1 + i * 0.62, y: 2.45, w: 0.5, h: 0.4, fontSize: 12, bold: selected, color: selected ? COLORS.white : COLORS.dark, fontFace: FONT, align: 'center' });
});
slide.addText('Repeat until: 2026-12-31', { x: 8.0, y: 3.2, w: 4.4, h: 0.4, fontSize: 12, color: COLORS.dark, fontFace: FONT });
slide.addText('→ Creates MON & WED reservations each week', { x: 8.0, y: 3.7, w: 4.4, h: 0.4, fontSize: 11, color: COLORS.gray, fontFace: FONT });
addFooter(slide, 7);

// ============================================================
// SLIDE 8 — Managing & Cancelling Reservations
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Managing & Cancelling Reservations', 'Reschedule or cancel your bookings');
slide.addText('View Reservation', { x: 1.0, y: 1.3, w: 5.5, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Click on any reservation event in the calendar or timeline.',
  'Owners and admins can manage; others are blocked with a message.',
  'The "Manage Reservation" window opens with actions.',
], 1.0, 1.8, 5.5, 2.0, 13);

slide.addText('Actions', { x: 7.0, y: 1.3, w: 5.5, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
slide.addShape('roundRect', { x: 7.0, y: 1.8, w: 5.4, h: 1.0, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('🔄 Reschedule — change room, date & time', { x: 7.2, y: 1.9, w: 5.0, h: 0.8, fontSize: 13, color: COLORS.dark, fontFace: FONT, valign: 'middle' });
slide.addShape('roundRect', { x: 7.0, y: 3.0, w: 5.4, h: 1.0, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('❌ Cancel — enter a reason and confirm', { x: 7.2, y: 3.1, w: 5.0, h: 0.8, fontSize: 13, color: COLORS.dark, fontFace: FONT, valign: 'middle' });

// Drag & drop tip
slide.addShape('roundRect', { x: 1.0, y: 4.2, w: 11.4, h: 1.4, fill: { color: COLORS.accent } });
slide.addText('💡 Pro Tip: Drag-and-drop rescheduling', { x: 1.2, y: 4.35, w: 11, h: 0.4, fontSize: 15, bold: true, color: COLORS.white, fontFace: FONT });
slide.addText('Drag a reservation block in the calendar to move it to a new time/room. Pull the bottom edge to extend its duration. The system auto-checks for conflicts and stops at the next reservation.', {
  x: 1.2, y: 4.8, w: 11, h: 0.7, fontSize: 12, color: COLORS.white, fontFace: FONT,
});
addFooter(slide, 8);

// ============================================================
// SLIDE 9 — Admin: Room List
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Admin: Room List Management', 'For Admin & Superadmin users');
addBullets(slide, [
  'Access via Sidebar → "Room List".',
  'View all rooms in a searchable, sortable data table.',
  'Add Room: name, location, capacity, description, image upload.',
  'Edit Room: update details or replace the image.',
  'Delete Room: removes the image file and database record.',
  'Room names must be unique. Images limited to 2MB (jpg/png/webp).',
], 1.0, 1.5, 6.5, 4.0, 14);

slide.addShape('roundRect', { x: 7.8, y: 1.5, w: 4.8, h: 4.6, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('Room Fields', { x: 8.0, y: 1.6, w: 4.4, h: 0.4, fontSize: 15, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Name (required)',
  'Location',
  'Capacity',
  'Description',
  'Image (optional)',
  'Created / Updated timestamps',
  'Actions: Edit, Delete',
], 8.0, 2.1, 4.4, 3.8, 12);
addFooter(slide, 9);

// ============================================================
// SLIDE 10 — Admin: Schedule & History
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Admin: Schedule & Reservation History', 'Manage bookings and audit trail');
slide.addText('Reservations (Schedule List)', { x: 1.0, y: 1.3, w: 5.5, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'View all reservations sorted by start date.',
  'Edit guest name, event type, room, dates, remarks.',
  'Delete reservations from the schedule.',
  'Searchable & sortable via the DataTable.',
], 1.0, 1.8, 5.6, 2.4, 13);

slide.addText('Reservation History', { x: 7.0, y: 1.3, w: 5.5, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Full audit trail of every reservation.',
  'Status: reserved, completed, canceled, DateTimeAdjusted, restored.',
  'View the complete log of a single reservation.',
  'Restore a canceled/completed reservation back to active.',
], 7.0, 1.8, 5.6, 2.4, 13);

// lifecycle strip
slide.addShape('roundRect', { x: 1.0, y: 4.4, w: 11.4, h: 1.6, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('Reservation Lifecycle', { x: 1.2, y: 4.5, w: 11, h: 0.4, fontSize: 15, bold: true, color: COLORS.primary, fontFace: FONT });
slide.addText('RESERVED  ➜  ONGOING  ➜  COMPLETED          (or)  CANCELED  ➜  RESTORED', {
  x: 1.2, y: 5.1, w: 11, h: 0.5, fontSize: 16, bold: true, color: COLORS.dark, fontFace: FONT, align: 'center',
});
slide.addText('Completed reservations auto-move to history when their end time passes.', {
  x: 1.2, y: 5.6, w: 11, h: 0.4, fontSize: 11, color: COLORS.gray, fontFace: FONT, align: 'center',
});
addFooter(slide, 10);

// ============================================================
// SLIDE 11 — Admin: Administrator Management
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Admin: Administrator Management', 'Control who has admin access');
slide.addText('Manage Admins', { x: 1.0, y: 1.3, w: 5.5, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'View the list of current administrators.',
  'Change a user role: admin ⇄ superadmin.',
  'Remove an administrator from the system.',
], 1.0, 1.8, 5.6, 2.0, 13);

slide.addText('Add New Admin', { x: 7.0, y: 1.3, w: 5.5, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Open "New Admin" to see eligible employees.',
  'Eligibility: active (ACCSTATUS=1), MIS / Training & Development.',
  'Not already an admin.',
  'Select the employee and assign a role to add them.',
], 7.0, 1.8, 5.6, 2.4, 13);

slide.addShape('roundRect', { x: 1.0, y: 4.3, w: 11.4, h: 1.5, fill: { color: COLORS.light }, line: { color: COLORS.gray, width: 0.5 } });
slide.addText('Role Access Matrix', { x: 1.2, y: 4.4, w: 11, h: 0.4, fontSize: 15, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Superadmin — full access: dashboard, rooms, schedules, history, admin management.',
  'Admin — reservations CRUD, room list, schedule list, history, admin management.',
  'User (not in admin table) — basic authenticated access.',
], 1.2, 4.9, 11, 0.9, 12);
addFooter(slide, 11);

// ============================================================
// SLIDE 12 — Profile & Change Password
// ============================================================
slide = pptx.addSlide();
addHeader(slide, 'Profile & Change Password', 'Manage your account');
slide.addText('Profile', { x: 1.0, y: 1.3, w: 5.0, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Go to Sidebar / NavBar → "Profile".',
  'View your employee details from the HR masterlist:',
  '• Employee ID & Name',
  '• Job Title & Department',
  '• Production Line, Station, Position',
], 1.0, 1.8, 5.6, 2.6, 13);

slide.addText('Change Password', { x: 7.0, y: 1.3, w: 5.0, h: 0.4, fontSize: 16, bold: true, color: COLORS.primary, fontFace: FONT });
addBullets(slide, [
  'Use the "Change Password" option on the Profile page.',
  'Enter your current password.',
  'Enter and confirm your new password.',
  'Your password is updated in the HR masterlist.',
], 7.0, 1.8, 5.6, 2.6, 13);

slide.addShape('roundRect', { x: 1.0, y: 4.5, w: 11.4, h: 1.4, fill: { color: COLORS.amber } });
slide.addText('🔒 Security Tips', { x: 1.2, y: 4.6, w: 11, h: 0.4, fontSize: 15, bold: true, color: COLORS.white, fontFace: FONT });
slide.addText('Log out when leaving shared computers. Do not share your password. Use the Change Password tool regularly.', {
  x: 1.2, y: 5.1, w: 11, h: 0.6, fontSize: 13, color: COLORS.white, fontFace: FONT,
});
addFooter(slide, 12);

// ============================================================
// SLIDE 13 — Summary & Support
// ============================================================
slide = pptx.addSlide();
slide.background = { color: COLORS.dark };
slide.addShape('rect', { x: 0, y: 0, w: W, h: 0.12, fill: { color: COLORS.primary } });
slide.addText('Thank You!', { x: 1, y: 1.4, w: W - 2, h: 0.8, fontSize: 36, bold: true, color: COLORS.white, fontFace: FONT, align: 'center' });
slide.addText('Key Takeaways', { x: 1, y: 2.4, w: W - 2, h: 0.5, fontSize: 18, color: COLORS.accent, fontFace: FONT, align: 'center' });
addBullets(slide, [
  'Book rooms quickly from the Dashboard timeline or calendar.',
  'Use recurring bookings for repeating meetings.',
  'Reschedule by dragging reservations or via the Manage window.',
  'Admins manage rooms, schedules, history, and administrators.',
  'Emails are sent automatically to all participants.',
], 3.0, 3.1, 7.3, 3.0, 15);

slide.addShape('rect', { x: 0, y: H - 1.0, w: W, h: 1.0, fill: { color: COLORS.primary } });
slide.addText('For support, contact the development team.  •  MRRS v1.0', {
  x: 1, y: H - 0.85, w: W - 2, h: 0.4, fontSize: 13, color: COLORS.white, fontFace: FONT, align: 'center',
});

// ---- Save ----
const outDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'MRRS_User_Guide.pptx');
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('✅ PPTX generated:', outPath);
}).catch((err) => {
  console.error('❌ Error generating PPTX:', err);
  process.exit(1);
});
