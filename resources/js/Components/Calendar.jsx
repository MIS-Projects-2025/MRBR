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
    // STATUS LOGIC
    // =========================
    const getStatus = (r) => {
        const now = moment();
        const start = moment(`${r.start_date}T${r.start_time}`);
        const end = moment(`${r.end_date}T${r.end_time}`);

        if (r.status === "canceled") return "canceled";
        if (now.isAfter(end)) return "done";
        if (now.isBetween(start, end)) return "ongoing";
        return "pending";
    };

    // =========================
    // EVENTS MAP
    // =========================
    const events = reservations.map(r => ({
        id: r.id,
        title: `${r.event_type}<br/>${r.guest_name}`,
        start: `${r.start_date}T${r.start_time}`,
        end: `${r.end_date}T${r.end_time}`,
        extendedProps: {
            status: getStatus(r),
            room_id: r.room_id,
            raw: r
        }
    }));

    const calendarStyles = `
.fc .fc-event {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    text-align: center !important;
}
.fc .fc-event-title {
    width: 100%;
    text-align: center !important;
    white-space: pre-line;
}
`;

    // =========================
    // 🔥 CONFLICT CHECK
    // =========================
    const hasConflict = (eventId, roomId, start, end) => {
        return reservations.some(r => {
            if (r.id == eventId) return false;
            if (r.room_id !== roomId) return false;

            const rStart = new Date(`${r.start_date}T${r.start_time}`);
            const rEnd = new Date(`${r.end_date}T${r.end_time}`);

            return rStart < end && rEnd > start;
        });
    };

    // =========================
    // 🔥 GET NEXT RESERVATION
    // =========================
    const getNextReservation = (eventId, roomId, start) => {
        return reservations
            .filter(r => r.room_id === roomId && r.id != eventId)
            .filter(r =>
                moment(`${r.start_date} ${r.start_time}`)
                    .isAfter(moment(start))
            )
            .sort((a, b) =>
                moment(`${a.start_date} ${a.start_time}`) -
                moment(`${b.start_date} ${b.start_time}`)
            )[0];
    };

    return (
        <div
            className={`bg-white rounded-xl shadow p-3 h-full ${
                modalOpen ? "pointer-events-none opacity-50" : ""
            }`}
        >
            <style>{calendarStyles}</style>

            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"

                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "timeGridDay,timeGridWeek,dayGridMonth"
                }}

                validRange={{
                    start: moment().format("YYYY-MM-DD")
                }}

                events={events}
                selectable={!modalOpen}
                editable={!modalOpen}
                height="860px"

                // =========================
                // SELECT SLOT
                // =========================
                select={(info) => {
                    if (modalOpen) return;

                    if (moment(info.start).isBefore(moment())) {
                        alert("Cannot reserve past.");
                        return;
                    }

                    onSelectSlot({
                        start: info.start,
                        end: info.end
                    });

                    calendarRef.current?.getApi()?.unselect();
                }}

                // =========================
                // DRAG MOVE
                // =========================
                eventDrop={(info) => {
                    const start = info.event.start;
                    const end = info.event.end;
                    const eventId = info.event.id;
                    const roomId = info.event.extendedProps.room_id;

                    if (moment(start).isBefore(moment())) {
                        alert("Cannot move to past.");
                        info.revert();
                        return;
                    }

                    // 🔥 CONFLICT
                    if (hasConflict(eventId, roomId, start, end)) {
                        alert("Conflict with another reservation.");
                        info.revert();
                        return;
                    }

                    onEventDrop({
                        id: eventId,
                        start,
                        end
                    });
                }}

                // =========================
                // 🔥 RESIZE (PULL DOWN) 
                // =========================
eventResize={(info) => {
    let start = info.event.start;
    let end = info.event.end;

    const eventId = info.event.id;
    const roomId = info.event.extendedProps.room_id;

    const now = moment();

    const empName = emp_data?.emp_name;
    const empRole = emp_data?.emp_role;
    const guestName = info.event.extendedProps.guest_name;

    // 🔥 ACCESS CONTROL
    const isAdmin = ["admin", "superadmin"].includes(empRole);
    const isOwner = empName === guestName;

    if (!isAdmin && !isOwner) {
        alert(
                            "You are not allowed to modify this reservation. Only the Organizer or an administrator can modify it.",
                        );
        info.revert();
        return;
    }

    // fallback kung walang end
    if (!end) {
        end = new Date(start.getTime() + 30 * 60000);
        info.event.setEnd(end);
    }

    const resStart = moment(start);
    const resEnd = moment(end);

    // 🔥 BLOCK PAST
    if (moment(start).isBefore(now)) {
        alert("Cannot resize to past.");
        info.revert();
        return;
    }

    // 🔥 BLOCK DONE
    if (now.isAfter(resEnd)) {
        alert("Cannot modify completed reservation.");
        info.revert();
        return;
    }

    // 🔥 BLOCK ONGOING
    if (now.isBetween(resStart, resEnd)) {
        alert("Cannot modify ongoing reservation.");
        info.revert();
        return;
    }

    // 🔥 AUTO STOP SA NEXT RESERVATION
    const next = getNextReservation(eventId, roomId, start);

    if (next) {
        const nextStart = new Date(`${next.start_date}T${next.start_time}`);

        if (end > nextStart) {
            end = nextStart;
            info.event.setEnd(end);
        }
    }

    // 🔥 CONFLICT CHECK
    if (hasConflict(eventId, roomId, start, end)) {
        alert("Conflict with another reservation.");
        info.revert();
        return;
    }

    // ✅ SAVE
    onEventDrop({
        id: eventId,
        start,
        end
    });
}}

                // =========================
                // CLICK (CANCEL)
                // =========================
                eventClick={(info) => {
                    const status = info.event.extendedProps.status;
                    const res = info.event.extendedProps.raw;

                    const empName = emp_data?.emp_name;
                    const isAdmin = ["superadmin", "admin"].includes(emp_data?.emp_role);

                    if (status === "done") return alert("Already done.");
                    if (status === "canceled") return alert("Already canceled.");
                    if (status === "ongoing") return alert("Cannot cancel ongoing reservation.");

                    if (!isAdmin && empName !== res.guest_name) {
                        alert("Not allowed.");
                        return;
                    }

                    if (confirm("Cancel booking?")) {
                        onDeleteEvent(res);
                    }
                }}

                // =========================
                // COLORS
                // =========================
                eventClassNames={(arg) => {
                    const status = arg.event.extendedProps.status;

                    if (status === "canceled") return ["bg-red-500"];
                    if (status === "done") return ["bg-green-500"];
                    if (status === "ongoing") return ["bg-blue-500", "animate-pulse"];
                    return ["bg-yellow-400", "text-black"];
                }}

                // =========================
                // CONTENT
                // =========================
                eventContent={(arg) => {
                    return {
                        html: `
                        <div class="text-xs font-semibold text-center">
                            ${arg.event.title}
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