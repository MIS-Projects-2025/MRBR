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
    modalOpen // 🔥 ADD THIS PROP
}) {

    const calendarRef = useRef(null);

    const MAX_DAYS = 7;

    const events = reservations.map(r => ({
        id: r.id,
        title: `${r.event_type} - ${r.guest_name}`,
        start: `${r.start_date}T${r.start_time}`,
        end: `${r.end_date}T${r.end_time}`
    }));

    return (
        <div className={`bg-white rounded-xl shadow p-3 ${modalOpen ? "pointer-events-none opacity-50" : ""}`}>

            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}

                initialView="timeGridWeek"

                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "timeGridDay,timeGridWeek,dayGridMonth"
                }}

                events={events}

                selectable={!modalOpen}   // 🔥 IMPORTANT
                editable={!modalOpen}     // 🔥 IMPORTANT

select={(info) => {

    if (modalOpen) return;

    const start = info.start;
    const end = info.end;

    onSelectSlot({
        start,
        end
    });

    setTimeout(() => {
        calendarRef.current?.getApi()?.unselect();
    }, 0);
}}
                eventDrop={(info) => {

                    const start = info.event.start;
                    const end = info.event.end;

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

                eventResize={(info) => {

                    const start = info.event.start;
                    const end = info.event.end;

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

                eventClick={(info) => {
                    if (confirm("Cancel this booking?")) {
                        onDeleteEvent({ id: info.event.id });
                    }
                }}

                slotMinTime="07:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:30:00"
                allDaySlot={false}
                height="650px"
            />
        </div>
    );
}