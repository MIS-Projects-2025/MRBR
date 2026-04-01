import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(BigCalendar);

export default function Calendar({ reservations, onSelectSlot, onEventDrop, onDeleteEvent  }) {

    const events = reservations.map(r => ({
        id: r.id,
        title: `${r.event_type} - ${r.guest_name}`,
        start: new Date(`${r.date}T${r.start_time}`),
        end: new Date(`${r.date}T${r.end_time}`),
    }));

    return (
        <div style={{ height: 600 }}>
            <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"

                selectable
                onSelectSlot={onSelectSlot}

                onEventDrop={onEventDrop}

                onSelectEvent={(event) => {
                    if (confirm("Cancel this meeting?")) {
                        onDeleteEvent(event);
                    }
                }}

                resizable

                defaultView="week"
                views={["day", "week"]}

                step={60}
                timeslots={1}
            />
        </div>
    );
}