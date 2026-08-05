const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, InternalHyperlink, ExternalHyperlink, Tab, TabStopType,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ---- Color palette ----
const PRIMARY = '2563EB';
const DARK = '1E293B';
const ACCENT = '0EA5E9';
const GREEN = '10B981';
const AMBER = 'F59E0B';
const LIGHT = 'F1F5F9';

// ---- Shared helper builders ----
const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 300, after: 120 },
  children: [new TextRun({ text, bold: true, color: PRIMARY, size: 32 })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 100 },
  children: [new TextRun({ text, bold: true, color: DARK, size: 26 })],
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 180, after: 80 },
  children: [new TextRun({ text, bold: true, color: ACCENT, size: 22 })],
});

const para = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  children: [new TextRun({ text, color: DARK, size: 22, ...opts })],
});

const bullet = (text, level = 0) => new Paragraph({
  bullet: { level },
  spacing: { after: 80 },
  children: [new TextRun({ text, color: DARK, size: 22 })],
});

const numbered = (num, text) => new Paragraph({
  spacing: { after: 80 },
  children: [
    new TextRun({ text: `${num}.  `, bold: true, color: PRIMARY, size: 22 }),
    new TextRun({ text, color: DARK, size: 22 }),
  ],
});

const note = (label, text) => new Paragraph({
  spacing: { before: 120, after: 120 },
  shading: { type: ShadingType.CLEAR, fill: 'FEF3C7' },
  border: {
    left: { style: BorderStyle.SINGLE, size: 12, color: AMBER },
  },
  children: [
    new TextRun({ text: `${label}: `, bold: true, color: '92400E', size: 22 }),
    new TextRun({ text, color: '78350F', size: 22 }),
  ],
});

const tip = (text) => note('💡 Pro Tip', text);

// ---- Table creation helper ----
function makeTable(headers, rows, widths) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' };
  const headerCells = headers.map((h, i) => new TableCell({
    width: { size: widths[i], type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: PRIMARY },
    verticalAlign: 'center',
    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 20 })], alignment: AlignmentType.LEFT })],
  }));
  const bodyRows = rows.map((r) => new TableRow({
    children: r.map((cell, i) => new TableCell({
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      borders: { top: border, bottom: border, left: border, right: border },
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, color: DARK })] })],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...bodyRows],
  });
}

// ============================================================
// DOCUMENT BUILD
// ============================================================
const children = [];

// ---- COVER PAGE ----
children.push(
  new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'MEETING ROOM RESERVATION SYSTEM', bold: true, size: 52, color: PRIMARY })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [new TextRun({ text: 'User Manual & Visual Guide', bold: true, size: 32, color: DARK })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
    children: [new TextRun({ text: 'Book rooms  •  Manage schedules  •  Receive notifications', size: 24, color: ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 3000 },
    children: [new TextRun({ text: 'Version 1.0  •  Internal Use', size: 20, color: '64748B' })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ---- TABLE OF CONTENTS ----
children.push(h1('Table of Contents'));
const toc = [
  '1.  Introduction & System Overview',
  '2.  Getting Started: Logging In',
  '3.  The Dashboard',
  '4.  Making a Reservation',
  '5.  Recurring (Repeating) Bookings',
  '6.  Managing & Cancelling Reservations',
  '7.  Admin: Room List Management',
  '8.  Admin: Schedule & Reservation History',
  '9.  Admin: Administrator Management',
  '10.  Profile & Change Password',
  '11.  Frequently Asked Questions (FAQ)',
  '12.  Support & Contact',
];
toc.forEach((t) => children.push(para(t)));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 1. INTRODUCTION ----
children.push(h1('1.  Introduction & System Overview'));
children.push(para('The Meeting Room Reservation System (MRRS) is a web-based application that allows employees to browse available meeting rooms, make reservations, manage bookings, and receive automated email notifications—all within a modern single-page interface.'));
children.push(h2('1.1  Core Capabilities'));
[
  'Browse meeting rooms with images, location, and capacity details',
  'Make single or recurring (multi-week) reservations',
  'Drag-and-drop rescheduling in calendar and timeline views',
  'Real-time conflict detection to prevent double bookings',
  'Automated email notifications via a background queue',
  'Role-based access control (User, Admin, Superadmin)',
  'Full reservation history with audit trail and restore',
  'Room CRUD with image upload via the admin panel',
  'CSV export for data tables and dark/light themes',
].forEach((c) => children.push(bullet(c)));

children.push(h2('1.2  How It Works (Architecture)'));
children.push(makeTable(
  ['Layer', 'Technology', 'Purpose'],
  [
    ['Frontend', 'React 18 + Inertia.js', 'User interface and SPA routing'],
    ['Backend', 'Laravel 12 (PHP)', 'Business logic, API, security'],
    ['Database', 'MySQL (3 connections)', 'MRRS main, HR masterlist, SSO auth'],
    ['Emails', 'Laravel Queue + SMTP', 'Asynchronous participant notifications'],
    ['Styling', 'Tailwind + DaisyUI + AntD', 'Responsive, accessible UI'],
    ['Calendar', 'FullCalendar + Big Calendar', 'Schedule visualization and drag-drop'],
  ],
  [20, 30, 50],
));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 2. LOGGING IN ----
children.push(h1('2.  Getting Started: Logging In'));
children.push(h2('2.1  Login Page'));
children.push(para('When you open the MRRS URL, you will see the login page. You need your Employee ID and password to access the system.'));
children.push(h3('Steps to Log In'));
[
  'Open your browser and navigate to the MRRS application URL.',
  'Enter your Employee ID in the first input field.',
  'Enter your password in the second field.',
  'Click the "Sign In" button.',
  'You will be redirected to the Dashboard.',
].forEach((s, i) => children.push(numbered(i + 1, s)));
children.push(note('Note', 'Upon successful login, the system creates a secure session token linked to your account. This session is validated on every request.'));
children.push(tip('Avoid sharing your credentials. Always log out from shared computers.'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 3. DASHBOARD ----
children.push(h1('3.  The Dashboard'));
children.push(para('The Dashboard is your home screen after logging in. It provides a real-time view of room availability and reservations.'));
children.push(h2('3.1  Layout'));
children.push(makeTable(
  ['Area', 'Description'],
  [
    ['Sidebar', 'Main navigation menu with links to Dashboard, Reservations, Room List, History, and Administrators (admin only).'],
    ['Top NavBar', 'User greeting, profile shortcut, and logout button.'],
    ['Content Area', 'Two tabs: "Today" (timeline view) and "Rooms" (calendar view).'],
    ['New Booking', 'Button that opens the reservation form.'],
  ],
  [25, 75],
));

children.push(h2('3.2  Timeline View ("Today" Tab)'));
children.push(para('The timeline view displays reservations per room along a time axis from 07:00 to midnight. Each block is color-coded:'));
children.push(makeTable(
  ['Color', 'Meaning'],
  [
    ['Gray', 'Upcoming reservation'],
    ['Blue', 'Ongoing / active reservation'],
    ['Green', 'Completed reservation'],
  ],
  [25, 75],
));
children.push(para('Click an empty area to switch to the calendar tab for that room. Click a reservation to open the manage window (if you are the owner or an admin).'));

children.push(h2('3.3  Calendar View ("Rooms" Tab)'));
children.push(para('Select a room card to view its calendar. You can click or drag on the calendar to create a new reservation, drag events to reschedule, and pull event edges to change duration.'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 4. MAKING A RESERVATION ----
children.push(h1('4.  Making a Reservation'));
children.push(h3('Step-by-Step'));
[
  'Navigate to the Dashboard and open the "Rooms" tab.',
  'Select a room card to open its calendar view.',
  'Click or drag on the calendar to choose your desired time slot.',
  'The "New Booking" modal opens with the details pre-filled.',
  'Fill in the meeting type, room, start/end date & time.',
  'Add recipients by selecting employee email tags.',
  'Optionally enable recurring booking (see Section 5).',
  'Add remarks or topic of the meeting.',
  'Click "Save". A confirmation window appears with the meeting etiquette agreement.',
  'Accept the agreement and click "Confirm & Save".',
].forEach((s, i) => children.push(numbered(i + 1, s)));

children.push(h2('4.1  Reservation Fields'));
children.push(makeTable(
  ['Field', 'Description'],
  [
    ['Meeting Type', 'Category of the meeting (e.g., Project, Training, etc.).'],
    ['Room', 'The selected meeting room (auto-filled, changeable).'],
    ['Start Date / Time', 'When the meeting begins.'],
    ['End Date / Time', 'When the meeting ends.'],
    ['Recipients', 'Employee email addresses to notify.'],
    ['Recurring Toggle', 'Enable to repeat weekly.'],
    ['Remarks', 'Meeting topic or description.'],
  ],
  [30, 70],
));
children.push(note('Conflict Detection', 'The system automatically checks for overlapping reservations. If the slot is taken, you will receive an error message and the reservation will not be saved.'));
children.push(tip('After saving, all participants receive an email with the meeting title, room, location, and schedule.'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 5. RECURRING ----
children.push(h1('5.  Recurring (Repeating) Bookings'));
children.push(para('Recurring bookings let you schedule a meeting that repeats weekly, ideal for standing meetings.'));
children.push(h3('How to Set Up a Recurring Booking'));
[
  'In the New Booking form, enable the "Recurring" toggle.',
  'Select the day(s) of the week the meeting repeats (Sunday–Saturday).',
  'Set a "Repeat Until" end date.',
  'Save the booking as usual.',
].forEach((s, i) => children.push(numbered(i + 1, s)));
children.push(para('The system automatically creates one reservation for each selected week until the end date. A confirmation email is sent for every occurrence, and conflicts are checked independently for each date.'));
children.push(makeTable(
  ['Example Config', 'Result'],
  [
    ['Days: Mon & Wed', 'Every Monday and Wednesday until the end date'],
    ['Repeat Until: 2026-12-31', 'Creates all weekly occurrences up to Dec 31, 2026'],
  ],
  [40, 60],
));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 6. MANAGING & CANCELLING ----
children.push(h1('6.  Managing & Cancelling Reservations'));
children.push(h2('6.1  Opening the Manage Window'));
children.push(para('Click on any reservation event in the calendar or timeline view. If you are the owner or an admin, the "Manage Reservation" window opens. Otherwise, you will see a message indicating you are not allowed to manage that booking.'));
children.push(h2('6.2  Rescheduling'));
[
  'In the Manage window, choose "Reschedule".',
  'Optionally select a new room.',
  'Set the new start date and time.',
  'Set the new end date and time.',
  'Save the changes. The old schedule is logged to history as "DateTimeAdjusted".',
].forEach((s, i) => children.push(numbered(i + 1, s)));
children.push(h2('6.3  Cancelling'));
[
  'In the Manage window, choose "Cancel".',
  'Enter a cancellation reason.',
  'Confirm the cancellation.',
  'The reservation is moved to history with status "canceled", including who cancelled it and why.',
].forEach((s, i) => children.push(numbered(i + 1, s)));
children.push(tip('Drag-and-drop: In the calendar, drag a reservation block to a new time or room to reschedule quickly. Pull the bottom edge to extend its duration. The system stops at the next reservation and checks conflicts automatically.'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 7. ROOM LIST ----
children.push(h1('7.  Admin: Room List Management'));
children.push(para('The Room List module is available to Admin and Superadmin users. It allows you to manage the meeting rooms available in the system.'));
children.push(h2('7.1  Access'));
children.push(para('Navigate via the Sidebar → "Room List". You will see a searchable, sortable data table of all rooms.'));
children.push(h2('7.2  Adding a Room'));
[
  'Click the "Add Room" button.',
  'Fill in the room name (required).',
  'Enter the location, capacity, and description (optional).',
  'Upload an image (optional): JPG, PNG, or WEBP, max 2MB.',
  'Save the room. It becomes available for booking.',
].forEach((s, i) => children.push(numbered(i + 1, s)));
children.push(note('Note', 'Room names must be unique. If you try to add a duplicate name, the system will show an error.'));
children.push(h2('7.3  Editing & Deleting a Room'));
children.push(bullet('Edit: Update any room detail or replace its image. The old image file is removed and a new one uploaded.'));
children.push(bullet('Delete: Removes the room record and its associated image file from the server.'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 8. SCHEDULE & HISTORY ----
children.push(h1('8.  Admin: Schedule & Reservation History'));
children.push(h2('8.1  Reservations (Schedule List)'));
children.push(para('The Schedule List shows all reservations, sorted by start date. Admins can:'));
children.push(bullet('Edit reservation details (guest name, event type, room, dates, remarks).'));
children.push(bullet('Delete reservations from the schedule.'));
children.push(bullet('Search and sort columns, and export data to CSV.'));
children.push(h2('8.2  Reservation History'));
children.push(para('The Reservation History module provides a complete audit trail of every reservation. It shows distinct reservations with their rooms and formatted dates.'));
children.push(makeTable(
  ['Status', 'Description'],
  [
    ['reserved', 'Initial creation of the reservation'],
    ['completed', 'Auto-moved when the end time passes'],
    ['canceled', 'Cancelled with reason and cancelled-by info'],
    ['DateTimeAdjusted', 'Dates/times were changed'],
    ['restored', 'Brought back from history to active'],
  ],
  [30, 70],
));
children.push(h3('Viewing the Log & Restoring'));
children.push(bullet('View Log: See the full history of a reservation (all changes over time).'));
children.push(bullet('Restore: Move a reservation from history back to the active reservations table.'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 9. ADMIN MANAGERS ----
children.push(h1('9.  Admin: Administrator Management'));
children.push(h2('9.1  Managing Existing Admins'));
children.push(para('From the Sidebar → "Administrators", you can view the current list of administrators.'));
children.push(bullet('Change Role: Switch a user between "admin" and "superadmin".'));
children.push(bullet('Remove Admin: Remove a user from the admin table.'));
children.push(h2('9.2  Adding a New Admin'));
children.push(para('Open "New Admin" to see eligible employees who are not yet administrators. Eligibility requires:'));
children.push(bullet('Active employee status (ACCSTATUS = 1).'));
children.push(bullet('Department/station: MIS or Training & Development.'));
children.push(bullet('Not already in the admin table.'));
children.push(para('Select an eligible employee, assign a role, and save to grant admin access.'));
children.push(h2('9.3  Role Access Matrix'));
children.push(makeTable(
  ['Role', 'Access'],
  [
    ['Superadmin', 'Full access: dashboard, rooms, schedules, history, admin management'],
    ['Admin', 'Dashboard, reservation CRUD, room list, schedule list, history, admin management'],
    ['User', 'Basic authenticated access to the dashboard and booking'],
  ],
  [25, 75],
));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 10. PROFILE ----
children.push(h1('10.  Profile & Change Password'));
children.push(h2('10.1  Viewing Your Profile'));
children.push(para('Click your name in the NavBar and select "Profile". Your employee details are displayed from the HR masterlist:'));
children.push(makeTable(
  ['Field', 'Description'],
  [
    ['Employee ID / Name', 'Your HR identifier and full name'],
    ['Job Title', 'Your current position title'],
    ['Department', 'Your department'],
    ['Production Line / Station', 'Your plant assignment'],
  ],
  [35, 65],
));
children.push(h2('10.2  Changing Your Password'));
[
  'Go to the Profile page.',
  'Use the "Change Password" form.',
  'Enter your current password.',
  'Enter and confirm your new password.',
  'Submit. Your password is updated in the HR masterlist.',
].forEach((s, i) => children.push(numbered(i + 1, s)));
children.push(note('Security', 'Choose a strong password and change it regularly. Never share your credentials.'));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 11. FAQ ----
children.push(h1('11.  Frequently Asked Questions (FAQ)'));
const faqs = [
  ['Why can I not book a certain time slot?', 'The slot may already be reserved. The system prevents double bookings through conflict detection. Choose another time or room.'],
  ['How do I get notified about my reservations?', 'Email notifications are sent automatically to all recipients listed in the reservation.'],
  ['Can I cancel a reservation?', 'Yes. Open the reservation and choose "Cancel", then enter a reason. Only the owner or an admin can cancel.'],
  ['What happens to completed reservations?', 'They are automatically moved to the Reservation History with a "completed" status.'],
  ['Can I restore a cancelled reservation?', 'Admins can restore reservations from history back to the active list.'],
  ['Who can manage rooms?', 'Only Admin and Superadmin users can add, edit, or delete rooms.'],
  ['How do recurring bookings work?', 'Enable the recurring toggle, pick the days, and set an end date. The system creates weekly occurrences automatically.'],
  ['What is the difference between Admin and Superadmin?', 'Superadmin has full access including the ability to manage administrator roles. Admin has standard management access.'],
];
faqs.forEach(([q, a]) => {
  children.push(new Paragraph({
    spacing: { before: 100, after: 40 },
    children: [new TextRun({ text: `Q: ${q}`, bold: true, color: PRIMARY, size: 22 })],
  }));
  children.push(para(`A: ${a}`));
});
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- 12. SUPPORT ----
children.push(h1('12.  Support & Contact'));
children.push(para('For questions, feature requests, or troubleshooting, please contact the development team.'));
children.push(h2('System Information'));
children.push(makeTable(
  ['Item', 'Details'],
  [
    ['System', 'Meeting Room Reservation System (MRRS)'],
    ['Version', '1.0'],
    ['Framework', 'Laravel 12 + React 18 + Inertia.js'],
    ['Database', 'MySQL'],
    ['Audience', 'Internal employees'],
  ],
  [35, 65],
));
children.push(new Paragraph({
  spacing: { before: 200 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '— End of User Manual —', italic: true, color: '64748B', size: 20 })],
}));

// ---- Build & Save ----
const doc = new Document({
  creator: 'MRRS Development Team',
  title: 'MRRS User Manual',
  description: 'User manual and visual guide for the Meeting Room Reservation System',
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22, color: DARK } },
    },
  },
  sections: [{
    properties: {},
    children,
  }],
});

const outDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'MRRS_User_Manual.docx');

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log('✅ DOCX generated:', outPath);
}).catch((err) => {
  console.error('❌ Error generating DOCX:', err);
  process.exit(1);
});
