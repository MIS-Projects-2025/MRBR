import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRef } from "react";
import moment from "moment";

export default function Calendar({
    reservations,
    onSelectSlot,
    onEventDrop,
    onDeleteEvent,
    modalOpen,
    emp_data
}) {
    const calendarRef = useRef(null);

    const MAX_DAYS = 7;

    // =========================
    // STATUS COLOR LOGIC
    // =========================
    const getStatus = (r) => {
        const now = moment();
        const start = moment(`${r.start_date}T${r.start_time}`);
        const end = moment(`${r.end_date}T${r.end_time}`);

        if (r.status === "cancelled") return "cancelled";
        if (now.isAfter(end)) return "done";
        if (now.isBetween(start, end)) return "ongoing";
        return "pending";
    };

    // =========================
    // EVENTS MAP
    // =========================
    const events = reservations.map(r => {
        const status = getStatus(r);

        return {
            id: r.id,
            title: `${r.event_type} - ${r.guest_name}`,
            start: `${r.start_date}T${r.start_time}`,
            end: `${r.end_date}T${r.end_time}`,
            extendedProps: {
                status,
                guest_name: r.guest_name
            }
        };
    });

    return (
        <div
            className={`bg-white rounded-xl shadow p-3 ${
                modalOpen ? "pointer-events-none opacity-50" : ""
            }`}
        >
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"

                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "timeGridDay,timeGridWeek,dayGridMonth"
                }}

                // ✅ BLOCK PAST DATES (UI LEVEL)
                validRange={{
                    start: moment().format("YYYY-MM-DD")
                }}

                events={events}
                selectable={!modalOpen}
                editable={!modalOpen}
                height="650px"

                // =========================
                // SLOT SELECT
                // =========================
                select={(info) => {
                    if (modalOpen) return;

                    const now = moment();

                    // ❌ BLOCK PAST DATE/TIME
                    if (moment(info.start).isBefore(now)) {
                        alert("Cannot reserve past date/time.");
                        return;
                    }

                    onSelectSlot({
                        start: info.start,
                        end: info.end
                    });

                    setTimeout(() => {
                        calendarRef.current?.getApi()?.unselect();
                    }, 0);
                }}

                // =========================
                // DRAG EVENT
                // =========================
                eventDrop={(info) => {
                    const start = info.event.start;
                    const end = info.event.end;

                    const now = moment();

                    // ❌ BLOCK PAST
                    if (moment(start).isBefore(now)) {
                        alert("Cannot move reservation to past.");
                        info.revert();
                        return;
                    }

                    const diffDays =
                        (end.getTime() - start.getTime()) /
                        (1000 * 60 * 60 * 24);

                    if (diffDays > MAX_DAYS) {
                        alert("Max 7 days booking only");
                        info.revert();
                        return;
                    }

                    onEventDrop({
                        id: info.event.id,
                        start,
                        end
                    });
                }}

                // =========================
                // RESIZE EVENT
                // =========================
                eventResize={(info) => {
                    const start = info.event.start;
                    const end = info.event.end;

                    const now = moment();

                    // ❌ BLOCK PAST
                    if (moment(start).isBefore(now)) {
                        alert("Cannot resize to past.");
                        info.revert();
                        return;
                    }

                    const diffDays =
                        (end.getTime() - start.getTime()) /
                        (1000 * 60 * 60 * 24);

                    if (diffDays > MAX_DAYS) {
                        alert("Max 7 days booking only");
                        info.revert();
                        return;
                    }

                    onEventDrop({
                        id: info.event.id,
                        start,
                        end
                    });
                }}

                // =========================
                // CLICK EVENT (SAFE CANCEL)
                // =========================
                eventClick={(info) => {
                    const status = info.event.extendedProps.status;
                    const guest = info.event.extendedProps.guest_name;

                    const empName = emp_data?.emp_name;
                    const isAdmin = ["superadmin", "admin"].includes(emp_data?.emp_role);

                    if (status === "done") {
                        alert("Cannot cancel completed reservation.");
                        return;
                    }

                    if (status === "cancelled") {
                        alert("Already cancelled.");
                        return;
                    }

                    if (status === "ongoing") {
                        alert("Cannot cancel ongoing reservation.");
                        return;
                    }

                    if (!isAdmin && empName !== guest) {
                        alert("You are not allowed to cancel this reservation.");
                        return;
                    }

                    if (confirm("Cancel this booking?")) {
                        const res = reservations.find(r => r.id == info.event.id);
                        onDeleteEvent(res);
                    }
                }}

                // =========================
                // COLOR CODING
                // =========================
                eventClassNames={(arg) => {
                    const status = arg.event.extendedProps.status;

                    switch (status) {
                        case "cancelled":
                            return ["bg-red-500", "text-white"];
                        case "done":
                            return ["bg-green-500", "text-white"];
                        case "ongoing":
                            return ["bg-blue-500", "text-white", "animate-pulse"];
                        default:
                            return ["bg-yellow-400", "text-black"];
                    }
                }}

                // =========================
                // EVENT CONTENT
                // =========================
                eventContent={(arg) => {
                    const status = arg.event.extendedProps.status;

                    let icon = "";
                    if (status === "cancelled") icon = "❌";
                    else if (status === "done") icon = "✅";
                    else if (status === "ongoing") icon = "🔵";
                    else icon = "🟡";

                    return {
                        html: `
                            <div class="p-1 text-xs font-semibold">
                                ${icon} ${arg.event.title}
                            </div>
                        `
                    };
                }}

                slotMinTime="07:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:30:00"
                allDaySlot={false}
            />
        </div>
    );
}